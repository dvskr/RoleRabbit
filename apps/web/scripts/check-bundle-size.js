#!/usr/bin/env node

/**
 * Bundle Size Monitoring Script
 * 
 * This script checks the size of Next.js build output bundles
 * and warns/fails if sizes exceed configured thresholds.
 */

const fs = require('fs');
const path = require('path');

// Size thresholds (in bytes)
const THRESHOLDS = {
  // Main JS bundle should not exceed 500KB (gzipped)
  mainJs: 500 * 1024,
  // Shared chunks should not exceed 300KB (gzipped)
  sharedChunk: 300 * 1024,
  // Individual page bundles should not exceed 200KB (gzipped)
  pageChunk: 200 * 1024,
  // Total bundle size warning at 2MB (gzipped)
  totalWarning: 2 * 1024 * 1024,
  // Total bundle size error at 3MB (gzipped)
  totalError: 3 * 1024 * 1024,
};

const BUILD_DIR = path.join(__dirname, '../.next');
const STATIC_DIR = path.join(BUILD_DIR, 'static');

/**
 * Get the size of a file in bytes
 */
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

/**
 * Get gzipped size estimate (rough approximation: ~70% of original)
 */
function estimateGzipSize(originalSize) {
  return Math.round(originalSize * 0.7);
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Find all JS chunks in the build output
 */
function findJsChunks() {
  const chunks = [];
  
  if (!fs.existsSync(STATIC_DIR)) {
    console.error('❌ Build directory not found. Run "npm run build" first.');
    process.exit(1);
  }

  // Find chunks in static/chunks directory
  const chunksDir = path.join(STATIC_DIR, 'chunks');
  if (fs.existsSync(chunksDir)) {
    const files = fs.readdirSync(chunksDir);
    files.forEach(file => {
      if (file.endsWith('.js')) {
        const filePath = path.join(chunksDir, file);
        const size = getFileSize(filePath);
        const gzipSize = estimateGzipSize(size);
        chunks.push({
          name: file,
          path: filePath,
          size,
          gzipSize,
        });
      }
    });
  }

  return chunks;
}

/**
 * Analyze bundle sizes and check against thresholds
 */
function analyzeBundles() {
  console.log('📦 Analyzing bundle sizes...\n');
  
  const chunks = findJsChunks();
  
  if (chunks.length === 0) {
    console.warn('⚠️  No JS chunks found. Make sure the build completed successfully.');
    return;
  }

  // Sort by size (largest first)
  chunks.sort((a, b) => b.gzipSize - a.gzipSize);

  let totalSize = 0;
  let totalGzipSize = 0;
  let errors = [];
  let warnings = [];

  console.log('📊 Bundle Analysis:\n');
  console.log('File'.padEnd(40), 'Original'.padEnd(15), 'Gzipped (est.)'.padEnd(15), 'Status');
  console.log('-'.repeat(85));

  chunks.forEach(chunk => {
    totalSize += chunk.size;
    totalGzipSize += chunk.gzipSize;

    let status = '✅';
    let issue = '';

    // Check main bundle
    if (chunk.name.includes('main') || chunk.name.includes('webpack')) {
      if (chunk.gzipSize > THRESHOLDS.mainJs) {
        status = '❌';
        issue = `Exceeds main bundle threshold (${formatBytes(THRESHOLDS.mainJs)})`;
        errors.push({ chunk: chunk.name, issue });
      }
    }
    // Check shared chunks
    else if (chunk.name.includes('shared') || chunk.name.includes('commons')) {
      if (chunk.gzipSize > THRESHOLDS.sharedChunk) {
        status = '⚠️';
        issue = `Exceeds shared chunk threshold (${formatBytes(THRESHOLDS.sharedChunk)})`;
        warnings.push({ chunk: chunk.name, issue });
      }
    }
    // Check page chunks
    else if (chunk.gzipSize > THRESHOLDS.pageChunk) {
      status = '⚠️';
      issue = `Exceeds page chunk threshold (${formatBytes(THRESHOLDS.pageChunk)})`;
      warnings.push({ chunk: chunk.name, issue });
    }

    console.log(
      chunk.name.padEnd(40),
      formatBytes(chunk.size).padEnd(15),
      formatBytes(chunk.gzipSize).padEnd(15),
      status
    );
    
    if (issue) {
      console.log('   └─ ' + issue);
    }
  });

  console.log('-'.repeat(85));
  console.log('Total'.padEnd(40), formatBytes(totalSize).padEnd(15), formatBytes(totalGzipSize).padEnd(15));

  // Check total size
  if (totalGzipSize > THRESHOLDS.totalError) {
    errors.push({
      chunk: 'Total Bundle Size',
      issue: `Total bundle size (${formatBytes(totalGzipSize)}) exceeds error threshold (${formatBytes(THRESHOLDS.totalError)})`,
    });
  } else if (totalGzipSize > THRESHOLDS.totalWarning) {
    warnings.push({
      chunk: 'Total Bundle Size',
      issue: `Total bundle size (${formatBytes(totalGzipSize)}) exceeds warning threshold (${formatBytes(THRESHOLDS.totalWarning)})`,
    });
  }

  // Print summary
  console.log('\n📋 Summary:\n');
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All bundles are within acceptable size limits!\n');
    process.exit(0);
  }

  if (warnings.length > 0) {
    console.log('⚠️  Warnings:');
    warnings.forEach(w => {
      console.log(`   - ${w.chunk}: ${w.issue}`);
    });
    console.log('');
  }

  if (errors.length > 0) {
    console.log('❌ Errors:');
    errors.forEach(e => {
      console.log(`   - ${e.chunk}: ${e.issue}`);
    });
    console.log('\n💡 Consider:');
    console.log('   - Code splitting and lazy loading');
    console.log('   - Removing unused dependencies');
    console.log('   - Tree shaking optimization');
    console.log('   - Using dynamic imports for large modules\n');
    process.exit(1);
  }

  // If only warnings, exit with code 0 (non-blocking)
  process.exit(0);
}

// Run the analysis
analyzeBundles();

