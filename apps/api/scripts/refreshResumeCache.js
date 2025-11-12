const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const hasContactDetails = (data) => {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const contact = data.contact && typeof data.contact === 'object' ? data.contact : {};
  const fields = ['email', 'phone', 'linkedin', 'github', 'website', 'name', 'location'];
  const hasField = fields.some((field) => {
    const value = contact[field];
    if (value == null) return false;
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return true;
  });

  const hasLinks = Array.isArray(contact.links) && contact.links.length > 0;

  return hasField || hasLinks;
};

async function main() {
  const staleEntries = [];
  const cacheRows = await prisma.resumeCache.findMany({
    select: {
      fileHash: true,
      userId: true,
      data: true
    }
  });

  cacheRows.forEach((row) => {
    if (!hasContactDetails(row.data)) {
      staleEntries.push(row);
    }
  });

  if (!staleEntries.length) {
    console.log('✅ No stale resume cache entries were found.');
    return;
  }

  console.log(`🔄 Found ${staleEntries.length} cache entries missing contact details. Deleting…`);

  for (const entry of staleEntries) {
    await prisma.resumeCache.delete({
      where: { fileHash: entry.fileHash }
    }).catch((error) => {
      console.warn(`⚠️ Failed to delete cache entry ${entry.fileHash}: ${error.message}`);
    });
  }

  console.log('✅ Stale cache entries removed. They will be recreated on next parse.');
}

main()
  .catch((error) => {
    console.error('❌ Failed to refresh resume cache', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

