/**
 * Compression Utility
 * Provides data compression and decompression
 */

const zlib = require('zlib');
const { promisify } = require('util');

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);
const deflate = promisify(zlib.deflate);
const inflate = promisify(zlib.inflate);

/**
 * Compress data using gzip
 */
async function compressGzip(data) {
  try {
    if (typeof data === 'string') {
      data = Buffer.from(data);
    }
    return await gzip(data);
  } catch (error) {
    throw new Error(`Gzip compression failed: ${error.message}`);
  }
}

/**
 * Decompress gzip data
 */
async function decompressGzip(compressedData) {
  try {
    return await gunzip(compressedData);
  } catch (error) {
    throw new Error(`Gzip decompression failed: ${error.message}`);
  }
}

/**
 * Compress data using deflate
 */
async function compressDeflate(data) {
  try {
    if (typeof data === 'string') {
      data = Buffer.from(data);
    }
    return await deflate(data);
  } catch (error) {
    throw new Error(`Deflate compression failed: ${error.message}`);
  }
}

/**
 * Decompress deflate data
 */
async function decompressDeflate(compressedData) {
  try {
    return await inflate(compressedData);
  } catch (error) {
    throw new Error(`Deflate decompression failed: ${error.message}`);
  }
}

module.exports = {
  compressGzip,
  decompressGzip,
  compressDeflate,
  decompressDeflate
};
