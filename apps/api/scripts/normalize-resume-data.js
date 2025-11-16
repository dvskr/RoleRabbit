/**
 * Normalize Resume Data to New Schema
 * 
 * Fixes inconsistencies in resume data structure.
 * Runs normalizeResumeData() on all existing resumes.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Configuration
 */
const CONFIG = {
  batchSize: 50,
  dryRun: false
};

/**
 * Normalize resume data structure
 */
function normalizeResumeData(data) {
  if (!data || typeof data !== 'object') {
    return {};
  }

  const normalized = {};

  // ============================================================================
  // CONTACT INFORMATION
  // ============================================================================
  normalized.contact = {
    name: data.contact?.name || '',
    title: data.contact?.title || '',
    email: data.contact?.email || '',
    phone: data.contact?.phone || '',
    location: data.contact?.location || '',
    linkedin: data.contact?.linkedin || '',
    github: data.contact?.github || '',
    website: data.contact?.website || '',
    links: Array.isArray(data.contact?.links) ? data.contact.links.map(link => ({
      type: link.type || 'other',
      url: link.url || '',
      label: link.label || ''
    })) : []
  };

  // ============================================================================
  // SUMMARY
  // ============================================================================
  normalized.summary = typeof data.summary === 'string' ? data.summary : '';

  // ============================================================================
  // EXPERIENCE
  // ============================================================================
  normalized.experience = Array.isArray(data.experience) 
    ? data.experience.map(exp => ({
        id: exp.id || generateId(),
        company: exp.company || '',
        role: exp.role || exp.title || '', // Handle legacy 'title' field
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        location: exp.location || '',
        environment: exp.environment || '',
        bullets: Array.isArray(exp.bullets) 
          ? exp.bullets.filter(b => typeof b === 'string')
          : []
      }))
    : [];

  // ============================================================================
  // EDUCATION
  // ============================================================================
  normalized.education = Array.isArray(data.education)
    ? data.education.map(edu => ({
        id: edu.id || generateId(),
        institution: edu.institution || edu.school || '', // Handle legacy 'school' field
        degree: edu.degree || '',
        field: edu.field || edu.major || '', // Handle legacy 'major' field
        startDate: edu.startDate || '',
        endDate: edu.endDate || '',
        gpa: edu.gpa || '',
        honors: Array.isArray(edu.honors) 
          ? edu.honors.filter(h => typeof h === 'string')
          : []
      }))
    : [];

  // ============================================================================
  // SKILLS
  // ============================================================================
  if (data.skills) {
    // Handle different skill formats
    if (typeof data.skills === 'string') {
      // String format: "JavaScript, Python, React"
      normalized.skills = {
        technical: data.skills.split(',').map(s => s.trim()).filter(Boolean)
      };
    } else if (Array.isArray(data.skills)) {
      // Array format: ["JavaScript", "Python", "React"]
      normalized.skills = {
        technical: data.skills.filter(s => typeof s === 'string')
      };
    } else if (typeof data.skills === 'object') {
      // Object format (correct)
      normalized.skills = {
        technical: Array.isArray(data.skills.technical) 
          ? data.skills.technical.filter(s => typeof s === 'string')
          : [],
        tools: Array.isArray(data.skills.tools)
          ? data.skills.tools.filter(s => typeof s === 'string')
          : [],
        soft: Array.isArray(data.skills.soft)
          ? data.skills.soft.filter(s => typeof s === 'string')
          : [],
        languages: Array.isArray(data.skills.languages)
          ? data.skills.languages.filter(s => typeof s === 'string')
          : []
      };
    }
  } else {
    normalized.skills = {
      technical: [],
      tools: [],
      soft: [],
      languages: []
    };
  }

  // ============================================================================
  // PROJECTS
  // ============================================================================
  normalized.projects = Array.isArray(data.projects)
    ? data.projects.map(proj => ({
        id: proj.id || generateId(),
        name: proj.name || '',
        summary: proj.summary || proj.description || '', // Handle legacy 'description' field
        link: proj.link || proj.url || '', // Handle legacy 'url' field
        bullets: Array.isArray(proj.bullets)
          ? proj.bullets.filter(b => typeof b === 'string')
          : [],
        technologies: Array.isArray(proj.technologies)
          ? proj.technologies.filter(t => typeof t === 'string')
          : Array.isArray(proj.tech) // Handle legacy 'tech' field
            ? proj.tech.filter(t => typeof t === 'string')
            : []
      }))
    : [];

  // ============================================================================
  // CERTIFICATIONS
  // ============================================================================
  normalized.certifications = Array.isArray(data.certifications)
    ? data.certifications.map(cert => ({
        id: cert.id || generateId(),
        name: cert.name || '',
        issuer: cert.issuer || cert.organization || '', // Handle legacy 'organization' field
        date: cert.date || cert.issueDate || '', // Handle legacy 'issueDate' field
        link: cert.link || cert.url || '',
        skills: Array.isArray(cert.skills)
          ? cert.skills.filter(s => typeof s === 'string')
          : []
      }))
    : [];

  // ============================================================================
  // CUSTOM SECTIONS
  // ============================================================================
  normalized.customSections = Array.isArray(data.customSections)
    ? data.customSections.map(section => ({
        id: section.id || generateId(),
        name: section.name || '',
        content: section.content || '',
        order: typeof section.order === 'number' ? section.order : 0
      }))
    : [];

  return normalized;
}

/**
 * Generate a simple ID
 */
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Normalize a single resume
 */
async function normalizeResume(resume) {
  try {
    const normalizedData = normalizeResumeData(resume.data);

    if (CONFIG.dryRun) {
      console.log(`DRY RUN - Would normalize resume ${resume.id}`);
      return { success: true, dryRun: true };
    }

    await prisma.baseResume.update({
      where: { id: resume.id },
      data: { data: normalizedData }
    });

    console.log(`✅ Normalized resume ${resume.id}`);
    return { success: true, resumeId: resume.id };

  } catch (error) {
    console.error(`❌ Failed to normalize resume ${resume.id}:`, error.message);
    return {
      success: false,
      resumeId: resume.id,
      error: error.message
    };
  }
}

/**
 * Normalize all resumes
 */
async function normalizeAllResumes() {
  console.log('🚀 Starting resume data normalization...');
  console.log('Configuration:', CONFIG);

  try {
    const totalCount = await prisma.baseResume.count({
      where: { deletedAt: null }
    });

    console.log(`📊 Found ${totalCount} resumes to normalize`);

    if (totalCount === 0) {
      console.log('✅ No resumes to normalize');
      return;
    }

    const results = {
      success: [],
      failed: []
    };

    // Process in batches
    let offset = 0;
    let batchNumber = 1;

    while (offset < totalCount) {
      console.log(`\n📦 Processing batch ${batchNumber}...`);

      const batch = await prisma.baseResume.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          data: true
        },
        take: CONFIG.batchSize,
        skip: offset
      });

      if (batch.length === 0) {
        break;
      }

      // Process batch
      for (const resume of batch) {
        const result = await normalizeResume(resume);

        if (result.success) {
          results.success.push(result.resumeId);
        } else {
          results.failed.push({
            resumeId: result.resumeId,
            error: result.error
          });
        }
      }

      offset += CONFIG.batchSize;
      batchNumber++;

      // Progress update
      const processed = Math.min(offset, totalCount);
      const percentage = ((processed / totalCount) * 100).toFixed(1);
      console.log(`Progress: ${processed}/${totalCount} (${percentage}%)`);
    }

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 NORMALIZATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully normalized: ${results.success.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    console.log('='.repeat(60));

    if (results.failed.length > 0) {
      console.log('\n❌ Failed normalizations:');
      results.failed.forEach(f => {
        console.log(`  - ${f.resumeId}: ${f.error}`);
      });
    }

    if (CONFIG.dryRun) {
      console.log('\n⚠️  DRY RUN MODE - No changes were made');
    }

  } catch (error) {
    console.error('💥 Normalization failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run normalization if called directly
if (require.main === module) {
  normalizeAllResumes()
    .then(() => {
      console.log('\n✅ Normalization completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Normalization failed:', error);
      process.exit(1);
    });
}

module.exports = {
  normalizeAllResumes,
  normalizeResumeData
};

