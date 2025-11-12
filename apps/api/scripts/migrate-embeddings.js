#!/usr/bin/env node
// ============================================================
// EMBEDDING MIGRATION SCRIPT
// ============================================================
// Command-line script to generate embeddings for all existing resumes
//
// Usage:
//   node scripts/migrate-embeddings.js [options]
//
// Options:
//   --batch-size <number>     Number of resumes per batch (default: 10)
//   --delay <ms>              Delay between batches in ms (default: 1000)
//   --skip-existing           Skip resumes with embeddings (default)
//   --force                   Regenerate all embeddings (overwrite existing)
//   --resume-from <id>        Resume from specific resume ID
//   --dry-run                 Show what would be done without doing it
//   --help                    Show this help message

require('dotenv').config();
const {
  generateEmbeddingsForAllResumes,
  getEmbeddingCoverageStats,
  getJobStatus
} = require('../services/embeddings/embeddingJobService');
const logger = require('../utils/logger');

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    batchSize: 10,
    delayBetweenBatches: 1000,
    skipExisting: true,
    resumeFrom: null,
    dryRun: false,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--batch-size':
        options.batchSize = parseInt(args[++i], 10);
        break;
      case '--delay':
        options.delayBetweenBatches = parseInt(args[++i], 10);
        break;
      case '--skip-existing':
        options.skipExisting = true;
        break;
      case '--force':
        options.skipExisting = false;
        break;
      case '--resume-from':
        options.resumeFrom = args[++i];
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
      default:
        console.error(`Unknown option: ${arg}`);
        process.exit(1);
    }
  }

  return options;
}

// Display help message
function showHelp() {
  console.log(`
========================================
  EMBEDDING MIGRATION SCRIPT
========================================

Generate embeddings for all existing resumes in the database.

Usage:
  node scripts/migrate-embeddings.js [options]

Options:
  --batch-size <number>     Number of resumes per batch (default: 10)
  --delay <ms>              Delay between batches in ms (default: 1000)
  --skip-existing           Skip resumes with embeddings (default)
  --force                   Regenerate all embeddings (overwrite existing)
  --resume-from <id>        Resume from specific resume ID
  --dry-run                 Show what would be done without doing it
  --help, -h                Show this help message

Examples:
  # Generate embeddings for all resumes without them
  node scripts/migrate-embeddings.js

  # Use larger batch size and faster processing
  node scripts/migrate-embeddings.js --batch-size 20 --delay 500

  # Force regenerate all embeddings (including existing ones)
  node scripts/migrate-embeddings.js --force

  # Resume from a specific resume ID (if job was interrupted)
  node scripts/migrate-embeddings.js --resume-from cmhv0ymv60001npqppgxz449p

  # Dry run to see what would be done
  node scripts/migrate-embeddings.js --dry-run

Environment Variables:
  OPENAI_API_KEY            Required - OpenAI API key for generating embeddings
  DATABASE_URL              Required - PostgreSQL connection string
  ATS_USE_EMBEDDINGS        Optional - Set to 'true' to use embeddings in ATS

========================================
`);
}

// Display progress updates
function displayProgress(status) {
  const {
    processedResumes,
    totalResumes,
    successfulResumes,
    failedResumes,
    progressPercentage,
    estimatedTimeRemaining,
    elapsedTime
  } = status;

  const elapsedMinutes = Math.floor(elapsedTime / 60000);
  const elapsedSeconds = Math.floor((elapsedTime % 60000) / 1000);
  const remainingMinutes = Math.floor(estimatedTimeRemaining / 60000);
  const remainingSeconds = Math.floor((estimatedTimeRemaining % 60000) / 1000);

  console.log(`
Progress: ${progressPercentage}%
Processed: ${processedResumes}/${totalResumes}
Successful: ${successfulResumes}
Failed: ${failedResumes}
Elapsed: ${elapsedMinutes}m ${elapsedSeconds}s
Remaining: ~${remainingMinutes}m ${remainingSeconds}s
`);
}

// Main function
async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  console.log('\n========================================');
  console.log('  EMBEDDING MIGRATION SCRIPT');
  console.log('========================================\n');

  try {
    // Check environment
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ Error: OPENAI_API_KEY environment variable is not set');
      console.error('   Please set your OpenAI API key in the .env file\n');
      process.exit(1);
    }

    if (!process.env.DATABASE_URL) {
      console.error('❌ Error: DATABASE_URL environment variable is not set');
      console.error('   Please set your database connection string in the .env file\n');
      process.exit(1);
    }

    // Get current stats
    console.log('Fetching current embedding coverage...\n');
    const statsBefore = await getEmbeddingCoverageStats();

    console.log('Current Status:');
    console.log(`  Total resumes: ${statsBefore.totalResumes}`);
    console.log(`  With embeddings: ${statsBefore.resumesWithEmbeddings}`);
    console.log(`  Without embeddings: ${statsBefore.resumesWithoutEmbeddings}`);
    console.log(`  Coverage: ${statsBefore.coveragePercentage.toFixed(1)}%\n`);

    if (statsBefore.resumesWithoutEmbeddings === 0 && options.skipExisting) {
      console.log('✅ All resumes already have embeddings!');
      console.log('   Use --force to regenerate existing embeddings\n');
      process.exit(0);
    }

    // Dry run
    if (options.dryRun) {
      console.log('🔍 DRY RUN MODE - No changes will be made\n');
      console.log('Would process:');
      console.log(`  Resumes to process: ${options.skipExisting ? statsBefore.resumesWithoutEmbeddings : statsBefore.totalResumes}`);
      console.log(`  Batch size: ${options.batchSize}`);
      console.log(`  Delay between batches: ${options.delayBetweenBatches}ms`);
      console.log(`  Skip existing: ${options.skipExisting}`);
      if (options.resumeFrom) {
        console.log(`  Resume from: ${options.resumeFrom}`);
      }
      console.log('\nRun without --dry-run to execute\n');
      process.exit(0);
    }

    // Confirm execution
    console.log('Configuration:');
    console.log(`  Batch size: ${options.batchSize}`);
    console.log(`  Delay between batches: ${options.delayBetweenBatches}ms`);
    console.log(`  Skip existing: ${options.skipExisting}`);
    if (options.resumeFrom) {
      console.log(`  Resume from: ${options.resumeFrom}`);
    }
    console.log('');

    // Start migration
    console.log('🚀 Starting embedding generation...\n');

    const startTime = Date.now();

    // Set up progress monitoring
    const progressInterval = setInterval(() => {
      const status = getJobStatus();
      if (status.isRunning) {
        displayProgress(status);
      }
    }, 5000); // Update every 5 seconds

    // Run the migration
    const results = await generateEmbeddingsForAllResumes({
      batchSize: options.batchSize,
      delayBetweenBatches: options.delayBetweenBatches,
      skipExisting: options.skipExisting,
      resumeFrom: options.resumeFrom
    });

    // Clear progress interval
    clearInterval(progressInterval);

    const duration = Date.now() - startTime;

    // Display results
    console.log('\n========================================');
    console.log('  MIGRATION COMPLETE');
    console.log('========================================\n');

    console.log('Results:');
    console.log(`  ✅ Total processed: ${results.processedResumes}`);
    console.log(`  ✅ Successful: ${results.successfulResumes}`);
    console.log(`  ❌ Failed: ${results.failedResumes}`);
    console.log(`  ⏱️  Duration: ${Math.floor(duration / 60000)}m ${Math.floor((duration % 60000) / 1000)}s`);
    console.log(`  ⚡ Average per resume: ${results.averageTimePerResume}ms\n`);

    if (results.errors && results.errors.length > 0) {
      console.log(`Errors (showing first 10 of ${results.errors.length}):`);
      results.errors.slice(0, 10).forEach(err => {
        console.log(`  ❌ Resume ${err.resumeId}: ${err.error}`);
      });
      console.log('');
    }

    // Get updated stats
    const statsAfter = await getEmbeddingCoverageStats();

    console.log('Updated Status:');
    console.log(`  Total resumes: ${statsAfter.totalResumes}`);
    console.log(`  With embeddings: ${statsAfter.resumesWithEmbeddings} (+${statsAfter.resumesWithEmbeddings - statsBefore.resumesWithEmbeddings})`);
    console.log(`  Without embeddings: ${statsAfter.resumesWithoutEmbeddings}`);
    console.log(`  Coverage: ${statsAfter.coveragePercentage.toFixed(1)}%\n`);

    // Final message
    if (statsAfter.coveragePercentage === 100) {
      console.log('🎉 SUCCESS! All resumes now have embeddings!\n');
    } else if (results.failedResumes > 0) {
      console.log('⚠️  Some resumes failed. You can retry by running:');
      console.log(`   node scripts/migrate-embeddings.js --resume-from ${results.lastProcessedResumeId}\n`);
    } else {
      console.log('✅ Migration completed successfully!\n');
    }

    // Show next steps
    if (process.env.ATS_USE_EMBEDDINGS !== 'true') {
      console.log('💡 Next Steps:');
      console.log('   1. Enable embedding-based ATS by setting:');
      console.log('      ATS_USE_EMBEDDINGS=true');
      console.log('   2. Restart your backend server');
      console.log('   3. Test ATS checks with a resume\n');
    }

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nError details:', error);

    if (error.message.includes('OPENAI_API_KEY')) {
      console.error('\n💡 Tip: Make sure your OpenAI API key is valid and has sufficient credits\n');
    } else if (error.message.includes('database')) {
      console.error('\n💡 Tip: Check your DATABASE_URL and ensure the database is accessible\n');
    }

    process.exit(1);
  }
}

// Run the script
main();

