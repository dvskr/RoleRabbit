/**
 * Parallel Tailoring Service
 * Optimized version of tailoring that runs operations in parallel
 * Expected performance improvement: 30-40% faster
 */

const { executeWithDependencies, ParallelPerformanceTracker } = require('../../utils/parallelExecutor');
const { scoreResumeWithEmbeddings } = require('../embeddings/embeddingATSService');
const { extractSkillsWithAI } = require('../ats/aiSkillExtractor');
const { calculateRealisticCeiling, calculateTargetScore } = require('../../utils/realisticCeiling');
const { validateTailorRequest, estimateCost } = require('../../utils/tailorValidation');
const { generateText } = require('../../utils/openAI');
const { buildTailorResumePrompt } = require('./promptBuilder');
const { wrapTailoringOperation, safeJSONParse } = require('./aiErrorWrapper');
const { prisma } = require('../../utils/db');
const { TailorMode, AIAction } = require('@prisma/client');
const { recordAIRequest } = require('./usageService');
const logger = require('../../utils/logger');
const { normalizeResumeData } = require('@roleready/resume-normalizer');

/**
 * Parallel tailoring with intelligent operation orchestration
 */
async function tailorResumeParallel({
  user,
  resume,
  jobDescription,
  mode,
  tone,
  length,
  onProgress
}) {
  const perfTracker = new ParallelPerformanceTracker('Tailoring');

  // Define all operations with dependencies
  const tasks = [
    {
      name: 'validation',
      dependencies: [],
      fn: async () => {
        if (onProgress) onProgress({ stage: 'VALIDATING', progress: 5 });
        
        return perfTracker.track('validation', 
          Promise.resolve(validateTailorRequest({
            resumeData: resume.data,
            jobDescription,
            mode,
            tone,
            length
          }))
        );
      }
    },

    {
      name: 'analysis',
      dependencies: ['validation'],
      fn: async ({ validation }) => {
        if (onProgress) onProgress({ stage: 'ANALYZING', progress: 15 });
        
        // Run ATS scoring and job skill extraction in parallel
        logger.info('Starting parallel analysis: ATS + Job Skills');
        
        const [atsScore, jobSkills] = await Promise.all([
          perfTracker.track('ats_initial', 
            scoreResumeWithEmbeddings({
              resumeData: resume.data,
              jobDescription: validation.jobDescription.trimmed,
              includeDetails: true
            })
          ),
          perfTracker.track('job_skills', 
            extractSkillsWithAI(validation.jobDescription.trimmed)
          )
        ]);

        return { atsScore, jobSkills, validation };
      }
    },

    {
      name: 'targets',
      dependencies: ['analysis'],
      fn: async ({ analysis }) => {
        if (onProgress) onProgress({ 
          stage: 'CALCULATING_TARGETS', 
          progress: 30,
          currentScore: analysis.atsScore.overall
        });

        return perfTracker.track('calculate_targets', (async () => {
          const ceiling = calculateRealisticCeiling(
            resume.data,
            analysis.jobSkills,
            analysis.atsScore
          );
          
          const targetScore = calculateTargetScore(
            mode,
            analysis.atsScore.overall,
            ceiling
          );

          logger.info('Targets calculated', {
            current: analysis.atsScore.overall,
            target: targetScore,
            ceiling,
            potentialGain: targetScore - analysis.atsScore.overall
          });

          return { ceiling, targetScore };
        })());
      }
    },

    {
      name: 'prompt',
      dependencies: ['analysis', 'targets'],
      fn: async ({ analysis, targets }) => {
        return perfTracker.track('build_prompt', 
          Promise.resolve((() => {
            // Compute prioritized gaps and limits
            const envLimit = parseInt(process.env.ATS_TAILOR_MISSING_MAX, 10);
            const defaultLimit = String(mode).toUpperCase() === 'FULL' ? 25 : 15;
            const finalMissingLimit = Number.isFinite(envLimit) && envLimit > 0 ? envLimit : defaultLimit;
            const required = new Set((analysis.jobSkills?.required_skills || []).map(s => String(s).toLowerCase()));
            const preferred = new Set((analysis.jobSkills?.preferred_skills || []).map(s => String(s).toLowerCase()));
            const coreTech = ['react','angular','vue','node','node.js','.net','java','python','typescript','javascript','c#','c++','aws','azure','gcp','kubernetes','k8s','docker','terraform','jenkins','postgres','postgresql','mysql','mongodb','redis','kafka','spark','airflow','graphql','rest','api'];
            const regulatory = ['hipaa','pci','soc','soc2','iso','iso 27001','cpa','cfa','fhir','hl7','gdpr'];
            const scoreMap = new Map();
            for (const kw of analysis.atsScore?.missingKeywords || []) {
              const k = String(kw).toLowerCase();
              let score = 0;
              if (required.has(k)) score += 60;
              if (preferred.has(k)) score += 25;
              if (regulatory.some(r => k.includes(r))) score += 40;
              if (coreTech.some(t => k.includes(t))) score += 30;
              if (k.length <= 12) score += 5;
              scoreMap.set(kw, score);
            }
            const prioritized = [...(analysis.atsScore?.missingKeywords || [])]
              .sort((a, b) => (scoreMap.get(b) || 0) - (scoreMap.get(a) || 0))
              .slice(0, finalMissingLimit);

            return buildTailorResumePrompt({
              resumeSnapshot: resume.data,
              jobDescription: analysis.validation.jobDescription.trimmed,
              mode,
              tone,
              length,
              atsAnalysis: analysis.atsScore,
              targetScore: targets.targetScore,
              missingKeywords: prioritized,
              missingKeywordsLimit: finalMissingLimit
            });
          })())
        );
      }
    },

    {
      name: 'ai_tailoring',
      dependencies: ['prompt', 'targets'],
      fn: async ({ prompt, targets }) => {
        if (onProgress) onProgress({ 
          stage: 'TAILORING', 
          progress: 50,
          targetScore: targets.targetScore
        });

        return perfTracker.track('ai_generation', 
          wrapTailoringOperation(async () => {
            const response = await generateText(prompt, {
              model: mode === TailorMode.FULL ? 'gpt-4o' : 'gpt-4o-mini',
              temperature: 0.3,
              max_tokens: mode === TailorMode.FULL ? 2500 : 2000,
              timeout: 120000,
              userId: user.id
            });

            const payload = safeJSONParse(response.text);

            if (!payload.tailoredResume) {
              throw new Error('Missing tailoredResume in response');
            }

            return {
              tailoredResume: payload.tailoredResume,
              diff: payload.diff || [],
              recommendedKeywords: payload.recommendedKeywords || [],
              warnings: payload.warnings || [],
              confidence: payload.confidence || 0,
              usage: response.usage
            };
          }, {
            userId: user.id,
            resumeId: resume.id,
            mode,
            onProgress
          })
        );
      }
    },

    {
      name: 'post_scoring_and_db',
      dependencies: ['ai_tailoring', 'analysis'],
      fn: async ({ ai_tailoring, analysis }) => {
        if (onProgress) onProgress({ 
          stage: 'FINALIZING', 
          progress: 85 
        });

        // Run ATS scoring and database update in parallel
        const [atsAfter, dbUpdate] = await Promise.all([
          perfTracker.track('ats_final',
            scoreResumeWithEmbeddings({
              resumeData: ai_tailoring.tailoredResume,
              jobDescription: analysis.validation.jobDescription.trimmed,
              includeDetails: true
            })
          ),
          perfTracker.track('db_update', (async () => {
            // Prepare normalized resume
            const normalizedTailored = normalizeResumeData(ai_tailoring.tailoredResume);

            // Update resume in database
            const updatedResume = await prisma.baseResume.update({
              where: { id: resume.id },
              data: {
                data: ai_tailoring.tailoredResume,
                metadata: {
                  ...resume.metadata,
                  lastTailored: new Date().toISOString(),
                  tailoredFor: {
                    jobDescription: analysis.validation.jobDescription.trimmed.substring(0, 500),
                    mode,
                    tone,
                    length
                  }
                }
              }
            });

            return updatedResume;
          })())
        ]);

        // Record AI usage (doesn't need to block)
        recordAIRequest({
          userId: user.id,
          baseResumeId: resume.id,
          action: mode === TailorMode.FULL ? AIAction.TAILOR_FULL : AIAction.TAILOR_PARTIAL,
          model: ai_tailoring.usage?.model,
          tokensUsed: ai_tailoring.usage?.total_tokens,
          metadata: {
            targetScore: analysis.atsScore.overall,
            scoreImprovement: atsAfter.overall - analysis.atsScore.overall
          }
        }).catch(err => {
          logger.warn('Failed to record AI usage (non-blocking)', { error: err.message });
        });

        return {
          atsAfter,
          updatedResume: dbUpdate,
          tailoringResult: ai_tailoring
        };
      }
    }
  ];

  // Execute with dependency resolution
  const results = await executeWithDependencies(tasks);

  // Log performance
  const perfReport = perfTracker.log();

  // Calculate actual improvement
  const scoreImprovement = results.post_scoring_and_db.atsAfter.overall - 
                           results.analysis.atsScore.overall;

  logger.info('Parallel tailoring completed', {
    userId: user.id,
    resumeId: resume.id,
    mode,
    scoreBefore: results.analysis.atsScore.overall,
    scoreAfter: results.post_scoring_and_db.atsAfter.overall,
    improvement: scoreImprovement,
    performanceGain: perfReport.speedup
  });

  if (onProgress) {
    onProgress({ 
      stage: 'COMPLETE', 
      progress: 100,
      scoreBefore: results.analysis.atsScore.overall,
      scoreAfter: results.post_scoring_and_db.atsAfter.overall
    });
  }

  // Return final result
  return {
    mode,
    updatedResume: results.post_scoring_and_db.updatedResume,
    tailoredResume: results.post_scoring_and_db.tailoringResult.tailoredResume,
    diff: results.post_scoring_and_db.tailoringResult.diff,
    recommendedKeywords: results.post_scoring_and_db.tailoringResult.recommendedKeywords,
    warnings: results.post_scoring_and_db.tailoringResult.warnings,
    ats: {
      before: results.analysis.atsScore,
      after: results.post_scoring_and_db.atsAfter
    },
    confidence: results.post_scoring_and_db.tailoringResult.confidence,
    estimatedScoreImprovement: scoreImprovement,
    performanceMetrics: {
      totalDurationMs: perfReport.totalDuration,
      sequentialTimeMs: perfReport.sequentialTime,
      savingsMs: perfReport.parallelSavings,
      speedup: perfReport.speedup,
      efficiency: perfReport.efficiency
    }
  };
}

/**
 * Batch tailoring for multiple resumes
 */
async function tailorMultipleResumes({
  user,
  resumes,
  jobDescription,
  mode,
  tone,
  length,
  onProgress
}) {
  const { executeBatched } = require('../../utils/parallelExecutor');

  logger.info('Starting batch tailoring', {
    userId: user.id,
    resumeCount: resumes.length,
    mode
  });

  const results = await executeBatched(
    resumes,
    async (resume) => {
      return await tailorResumeParallel({
        user,
        resume,
        jobDescription,
        mode,
        tone,
        length,
        onProgress: onProgress ? (update) => {
          onProgress({
            resumeId: resume.id,
            ...update
          });
        } : null
      });
    },
    {
      batchSize: 3, // Process 3 at a time to avoid rate limits
      continueOnError: true,
      delayBetweenBatches: 1000, // 1 second delay between batches
      onBatchComplete: ({ batchIndex, totalBatches, progress }) => {
        logger.info(`Batch tailoring progress: ${progress.toFixed(0)}%`, {
          batchIndex: batchIndex + 1,
          totalBatches
        });
      }
    }
  );

  const successful = results.filter(r => r.status === 'fulfilled');
  const failed = results.filter(r => r.status === 'rejected');

  logger.info('Batch tailoring complete', {
    total: resumes.length,
    successful: successful.length,
    failed: failed.length
  });

  return {
    successful: successful.map(r => r.value),
    failed: failed.map(r => ({
      error: r.reason?.message,
      resumeId: r.reason?.metadata?.resumeId
    })),
    summary: {
      total: resumes.length,
      successCount: successful.length,
      failureCount: failed.length,
      successRate: `${((successful.length / resumes.length) * 100).toFixed(1)}%`
    }
  };
}

module.exports = {
  tailorResumeParallel,
  tailorMultipleResumes
};

