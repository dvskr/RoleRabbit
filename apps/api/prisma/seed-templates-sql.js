// SQL-based Template Seeder (works without Prisma client)
const { Pool } = require('pg');

// Database connection using environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Template data with proper enum conversion
const templates = [
  {
    id: 'tpl_ats_professional_1',
    name: 'ATS Professional',
    category: 'ATS',
    description: 'Clean, ATS-friendly resume optimized for applicant tracking systems. Modern professional design with clear sections.',
    preview: '/templates/ats-professional.png',
    features: ['ATS-optimized', 'Clean layout', 'Professional design', 'Easy to scan'],
    difficulty: 'BEGINNER',
    industry: ['Technology', 'Finance', 'Healthcare', 'General'],
    layout: 'SINGLE_COLUMN',
    colorScheme: 'BLUE',
    isPremium: false,
    rating: 4.8,
    downloads: 15420,
    author: 'RoleReady Team',
    tags: ['ats', 'professional', 'clean', 'modern']
  },
  {
    id: 'tpl_creative_designer_1',
    name: 'Creative Designer',
    category: 'CREATIVE',
    description: 'Bold, creative resume perfect for designers and creative professionals. Showcases visual style and personality.',
    preview: '/templates/creative-designer.png',
    features: ['Visual impact', 'Portfolio showcase', 'Creative layout', 'Color accents'],
    difficulty: 'INTERMEDIATE',
    industry: ['Design', 'Marketing', 'Media', 'Arts'],
    layout: 'TWO_COLUMN',
    colorScheme: 'PURPLE',
    isPremium: true,
    rating: 4.9,
    downloads: 8932,
    author: 'Design Studio',
    tags: ['creative', 'designer', 'portfolio', 'visual']
  },
  {
    id: 'tpl_modern_tech_1',
    name: 'Modern Tech',
    category: 'MODERN',
    description: 'Sleek, modern resume designed for tech professionals. Clean lines with subtle design elements.',
    preview: '/templates/modern-tech.png',
    features: ['Modern design', 'Tech-focused', 'Skills showcase', 'Project highlights'],
    difficulty: 'BEGINNER',
    industry: ['Technology', 'Software', 'Engineering', 'Startups'],
    layout: 'HYBRID',
    colorScheme: 'TEAL',
    isPremium: false,
    rating: 4.7,
    downloads: 12543,
    author: 'Tech Resumes',
    tags: ['modern', 'tech', 'software', 'engineering']
  },
  {
    id: 'tpl_executive_leader_1',
    name: 'Executive Leader',
    category: 'EXECUTIVE',
    description: 'Premium executive resume template for C-level and senior leadership positions. Sophisticated and authoritative.',
    preview: '/templates/executive-leader.png',
    features: ['Executive presence', 'Leadership focus', 'Premium design', 'Achievement-oriented'],
    difficulty: 'ADVANCED',
    industry: ['Executive', 'Management', 'Finance', 'Consulting'],
    layout: 'SINGLE_COLUMN',
    colorScheme: 'NAVY',
    isPremium: true,
    rating: 4.9,
    downloads: 3421,
    author: 'Executive Resumes Pro',
    tags: ['executive', 'leadership', 'c-level', 'premium']
  },
  {
    id: 'tpl_minimal_classic_1',
    name: 'Minimal Classic',
    category: 'MINIMAL',
    description: 'Timeless minimal resume with focus on content. Perfect for traditional industries and conservative fields.',
    preview: '/templates/minimal-classic.png',
    features: ['Minimal design', 'Content-focused', 'Traditional layout', 'Easy to read'],
    difficulty: 'BEGINNER',
    industry: ['Legal', 'Finance', 'Academia', 'Government'],
    layout: 'SINGLE_COLUMN',
    colorScheme: 'GRAY',
    isPremium: false,
    rating: 4.6,
    downloads: 9876,
    author: 'Classic Templates',
    tags: ['minimal', 'classic', 'traditional', 'simple']
  }
];

// Convert JS object to PostgreSQL JSON
function toJSON(obj) {
  return JSON.stringify(obj);
}

// Escape single quotes for SQL
function escapeSingleQuotes(str) {
  return str.replace(/'/g, "''");
}

// Build SQL INSERT statement
function buildInsertSQL(template) {
  return `
    INSERT INTO "ResumeTemplate" (
      id, name, category, description, preview, features, difficulty,
      industry, layout, "colorScheme", "isPremium", rating, downloads,
      author, tags, "isActive", "isApproved", "createdAt", "updatedAt"
    ) VALUES (
      '${template.id}',
      '${escapeSingleQuotes(template.name)}',
      '${template.category}',
      '${escapeSingleQuotes(template.description)}',
      '${template.preview}',
      '${toJSON(template.features)}',
      '${template.difficulty}',
      '${toJSON(template.industry)}',
      '${template.layout}',
      '${template.colorScheme}',
      ${template.isPremium},
      ${template.rating},
      ${template.downloads},
      '${escapeSingleQuotes(template.author)}',
      '${toJSON(template.tags)}',
      true,
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      category = EXCLUDED.category,
      description = EXCLUDED.description,
      preview = EXCLUDED.preview,
      features = EXCLUDED.features,
      difficulty = EXCLUDED.difficulty,
      industry = EXCLUDED.industry,
      layout = EXCLUDED.layout,
      "colorScheme" = EXCLUDED."colorScheme",
      "isPremium" = EXCLUDED."isPremium",
      rating = EXCLUDED.rating,
      downloads = EXCLUDED.downloads,
      author = EXCLUDED.author,
      tags = EXCLUDED.tags,
      "updatedAt" = NOW();
  `;
}

async function seedTemplates() {
  const client = await pool.connect();

  try {
    console.log('🌱 Starting template seeding...');

    // Start transaction
    await client.query('BEGIN');

    let inserted = 0;
    let updated = 0;

    for (const template of templates) {
      try {
        const result = await client.query(buildInsertSQL(template));
        if (result.rowCount > 0) {
          inserted++;
          console.log(`✅ Seeded template: ${template.name}`);
        }
      } catch (error) {
        if (error.message.includes('duplicate key')) {
          updated++;
          console.log(`🔄 Updated template: ${template.name}`);
        } else {
          throw error;
        }
      }
    }

    // Commit transaction
    await client.query('COMMIT');

    console.log(`\n✅ Template seeding complete!`);
    console.log(`   - Inserted: ${inserted}`);
    console.log(`   - Updated: ${updated}`);
    console.log(`   - Total: ${templates.length}`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding templates:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run seeder
seedTemplates()
  .then(() => {
    console.log('✅ Seeder finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
  });
