/**
 * TEST-031: Test fixtures for various file types
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

/**
 * Create test file fixtures
 */
async function createFileFixtures(userId) {
  const fixtures = [];

  // PDF file
  const pdfContent = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\nxref\n0 1\ntrailer\n<<\n/Root 1 0 R\n>>\n%%EOF');
  fixtures.push({
    name: 'Resume.pdf',
    fileName: 'resume.pdf',
    type: 'resume',
    contentType: 'application/pdf',
    size: BigInt(pdfContent.length),
    content: pdfContent,
  });

  // DOCX file (ZIP-based)
  const docxContent = Buffer.from('PK\x03\x04'); // ZIP signature
  fixtures.push({
    name: 'Cover Letter.docx',
    fileName: 'cover-letter.docx',
    type: 'cover_letter',
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: BigInt(docxContent.length),
    content: docxContent,
  });

  // Image file (PNG)
  const pngContent = Buffer.from('\x89PNG\r\n\x1a\n');
  fixtures.push({
    name: 'Portfolio.png',
    fileName: 'portfolio.png',
    type: 'portfolio',
    contentType: 'image/png',
    size: BigInt(pngContent.length),
    content: pngContent,
  });

  // Text file
  const txtContent = Buffer.from('Plain text content');
  fixtures.push({
    name: 'Notes.txt',
    fileName: 'notes.txt',
    type: 'document',
    contentType: 'text/plain',
    size: BigInt(txtContent.length),
    content: txtContent,
  });

  return fixtures;
}

/**
 * TEST-032: Create test fixtures for users with different subscription tiers
 */
async function createUserFixtures() {
  const users = [];

  // FREE tier user
  users.push({
    email: 'free-user@test.com',
    name: 'Free User',
    password: 'hashed-password',
    subscriptionTier: 'FREE',
  });

  // PRO tier user
  users.push({
    email: 'pro-user@test.com',
    name: 'Pro User',
    password: 'hashed-password',
    subscriptionTier: 'PRO',
  });

  // PREMIUM tier user
  users.push({
    email: 'premium-user@test.com',
    name: 'Premium User',
    password: 'hashed-password',
    subscriptionTier: 'PREMIUM',
  });

  return users;
}

/**
 * TEST-033: Create test fixtures for files with various states
 */
async function createFileStateFixtures(userId) {
  const files = [];

  // Starred file
  files.push({
    userId,
    name: 'Starred File',
    fileName: 'starred.pdf',
    type: 'document',
    size: BigInt(1024),
    contentType: 'application/pdf',
    storagePath: `${userId}/starred.pdf`,
    isStarred: true,
    isArchived: false,
    deletedAt: null,
  });

  // Archived file
  files.push({
    userId,
    name: 'Archived File',
    fileName: 'archived.pdf',
    type: 'document',
    size: BigInt(1024),
    contentType: 'application/pdf',
    storagePath: `${userId}/archived.pdf`,
    isStarred: false,
    isArchived: true,
    deletedAt: null,
  });

  // Shared file
  files.push({
    userId,
    name: 'Shared File',
    fileName: 'shared.pdf',
    type: 'document',
    size: BigInt(1024),
    contentType: 'application/pdf',
    storagePath: `${userId}/shared.pdf`,
    isStarred: false,
    isArchived: false,
    deletedAt: null,
  });

  // Deleted file
  files.push({
    userId,
    name: 'Deleted File',
    fileName: 'deleted.pdf',
    type: 'document',
    size: BigInt(1024),
    contentType: 'application/pdf',
    storagePath: `${userId}/deleted.pdf`,
    isStarred: false,
    isArchived: false,
    deletedAt: new Date(),
  });

  return files;
}

/**
 * TEST-034: Create test fixtures for folders with files
 */
async function createFolderFixtures(userId) {
  const folders = [];

  // Folder with files
  const folder = await prisma.storageFolder.create({
    data: {
      userId,
      name: 'Test Folder',
      color: '#4F46E5',
    },
  });

  // Create files in folder
  await prisma.storageFile.createMany({
    data: [
      {
        userId,
        name: 'File 1',
        fileName: 'file1.pdf',
        type: 'document',
        size: BigInt(1024),
        contentType: 'application/pdf',
        storagePath: `${userId}/file1.pdf`,
        folderId: folder.id,
      },
      {
        userId,
        name: 'File 2',
        fileName: 'file2.pdf',
        type: 'document',
        size: BigInt(1024),
        contentType: 'application/pdf',
        storagePath: `${userId}/file2.pdf`,
        folderId: folder.id,
      },
    ],
  });

  folders.push(folder);
  return folders;
}

/**
 * TEST-035: Create test fixtures for shares and share links
 */
async function createShareFixtures(fileId, userId, sharedWithId) {
  // Active share
  const activeShare = await prisma.fileShare.create({
    data: {
      fileId,
      userId,
      sharedWith: sharedWithId,
      permission: 'view',
      expiresAt: null,
    },
  });

  // Expired share
  const expiredShare = await prisma.fileShare.create({
    data: {
      fileId,
      userId,
      sharedWith: sharedWithId,
      permission: 'view',
      expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    },
  });

  // Share link with password
  const shareLink = await prisma.shareLink.create({
    data: {
      fileId,
      userId,
      token: 'test-token',
      passwordHash: 'hashed-password',
      permission: 'view',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      maxDownloads: 10,
    },
  });

  return { activeShare, expiredShare, shareLink };
}

/**
 * TEST-036: Create test fixtures for comments
 */
async function createCommentFixtures(fileId, userId) {
  // Top-level comment
  const topLevelComment = await prisma.fileComment.create({
    data: {
      fileId,
      userId,
      content: 'This is a top-level comment',
      parentId: null,
    },
  });

  // Reply comment
  const replyComment = await prisma.fileComment.create({
    data: {
      fileId,
      userId,
      content: 'This is a reply',
      parentId: topLevelComment.id,
    },
  });

  return { topLevelComment, replyComment };
}

/**
 * TEST-037: Create load test data (1000+ files per user, 100+ users)
 */
async function createLoadTestData() {
  const users = [];
  const files = [];

  // Create 100 users
  for (let i = 0; i < 100; i++) {
    const user = await prisma.user.create({
      data: {
        email: `load-user-${i}@test.com`,
        name: `Load User ${i}`,
        password: 'hashed-password',
      },
    });
    users.push(user);

    // Create 1000 files per user
    const userFiles = [];
    for (let j = 0; j < 1000; j++) {
      userFiles.push({
        userId: user.id,
        name: `File ${j}`,
        fileName: `file-${j}.pdf`,
        type: 'document',
        size: BigInt(1024 * (j % 100)), // Varying sizes
        contentType: 'application/pdf',
        storagePath: `${user.id}/file-${j}.pdf`,
        createdAt: new Date(Date.now() - j * 1000), // Staggered creation times
      });
    }
    await prisma.storageFile.createMany({ data: userFiles });
    files.push(...userFiles);
  }

  return { users, files };
}

module.exports = {
  createFileFixtures,
  createUserFixtures,
  createFileStateFixtures,
  createFolderFixtures,
  createShareFixtures,
  createCommentFixtures,
  createLoadTestData,
};

