/**
 * Migration Script: Single Table → Normalized Schema
 * 
 * This script migrates data from the single-table design to the normalized schema.
 * Run this AFTER applying the Prisma migration.
 * 
 * Usage: node prisma/migrations/migrate-to-normalized.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateToNormalized() {
  console.log('🚀 Starting migration to normalized schema...\n');

  try {
    // Get all users from old schema
    const users = await prisma.$queryRaw`
      SELECT * FROM users
    `;

    console.log(`📊 Found ${users.length} users to migrate\n`);

    let migrated = 0;
    let errors = 0;

    for (const user of users) {
      try {
        await prisma.$transaction(async (tx) => {
          // 1. Update User table (keep auth data, remove profile fields)
          await tx.user.update({
            where: { id: user.id },
            data: {
              // Keep: id, email, password, provider, providerId, twoFactorEnabled, etc.
              // Remove profile fields (they'll be in user_profiles)
            }
          });

          // 2. Create UserProfile
          const profileData = {
            userId: user.id,
            firstName: user.firstName || null,
            lastName: user.lastName || null,
            phone: user.phone || null,
            location: user.location || null,
            bio: user.bio || null,
            profilePicture: user.profilePicture || null,
            currentRole: user.currentRole || null,
            currentCompany: user.currentCompany || null,
            experience: user.experience || null,
            industry: user.industry || null,
            jobLevel: user.jobLevel || null,
            employmentType: user.employmentType || null,
            availability: user.availability || null,
            salaryExpectation: user.salaryExpectation || null,
            workPreference: user.workPreference || null,
            linkedin: user.linkedin || null,
            github: user.github || null,
            website: user.website || null,
            profileViews: user.profileViews || 0,
            successRate: user.successRate || 0,
            profileCompleteness: user.profileCompleteness || 0,
            skillMatchRate: user.skillMatchRate || 0,
            avgResponseTime: user.avgResponseTime || 0,
          };

          await tx.userProfile.create({
            data: profileData
          });

          // 3. Migrate Work Experiences
          if (user.workExperiences) {
            try {
              const workExps = JSON.parse(user.workExperiences);
              if (Array.isArray(workExps)) {
                for (const exp of workExps) {
                  await tx.workExperience.create({
                    data: {
                      profileId: user.id, // Will be updated after profile creation
                      company: exp.company || '',
                      role: exp.role || '',
                      client: exp.client || null,
                      location: exp.location || null,
                      startDate: exp.startDate || '',
                      endDate: exp.endDate || null,
                      isCurrent: exp.isCurrent || false,
                      description: exp.description || null,
                      projectType: exp.projectType || 'Full-time',
                    }
                  });
                }
              }
            } catch (e) {
              console.warn(`  ⚠️  Failed to parse workExperiences for user ${user.id}:`, e.message);
            }
          }

          // 4. Migrate Education
          if (user.education) {
            try {
              const education = JSON.parse(user.education);
              if (Array.isArray(education)) {
                for (const edu of education) {
                  await tx.education.create({
                    data: {
                      profileId: user.id,
                      institution: edu.institution || '',
                      degree: edu.degree || null,
                      field: edu.field || null,
                      graduationDate: edu.graduationDate || null,
                      description: edu.description || null,
                    }
                  });
                }
              }
            } catch (e) {
              console.warn(`  ⚠️  Failed to parse education for user ${user.id}:`, e.message);
            }
          }

          // 5. Migrate Skills (normalized)
          if (user.skills) {
            try {
              const skills = JSON.parse(user.skills);
              if (Array.isArray(skills)) {
                for (const skillData of skills) {
                  const skillName = typeof skillData === 'string' ? skillData : (skillData.name || skillData);
                  if (!skillName) continue;

                  // Find or create skill in master table
                  let skill = await tx.skill.findUnique({
                    where: { name: skillName }
                  });

                  if (!skill) {
                    skill = await tx.skill.create({
                      data: {
                        name: skillName,
                        category: typeof skillData === 'object' ? skillData.category : null
                      }
                    });
                  }

                  // Create user-skill relationship
                  await tx.userSkill.create({
                    data: {
                      profileId: user.id,
                      skillId: skill.id,
                      proficiency: typeof skillData === 'object' ? (skillData.proficiency || 'Beginner') : 'Beginner',
                      yearsOfExperience: typeof skillData === 'object' ? skillData.yearsOfExperience : null,
                      verified: typeof skillData === 'object' ? (skillData.verified || false) : false,
                    }
                  });
                }
              }
            } catch (e) {
              console.warn(`  ⚠️  Failed to parse skills for user ${user.id}:`, e.message);
            }
          }

          // 6. Migrate Certifications
          if (user.certifications) {
            try {
              const certifications = JSON.parse(user.certifications);
              if (Array.isArray(certifications)) {
                for (const cert of certifications) {
                  await tx.certification.create({
                    data: {
                      profileId: user.id,
                      name: typeof cert === 'string' ? cert : (cert.name || ''),
                      issuer: typeof cert === 'object' ? cert.issuer : null,
                      date: typeof cert === 'object' ? cert.date : null,
                      expiryDate: typeof cert === 'object' ? cert.expiryDate : null,
                      credentialId: typeof cert === 'object' ? cert.credentialId : null,
                      credentialUrl: typeof cert === 'object' ? cert.credentialUrl : null,
                    }
                  });
                }
              }
            } catch (e) {
              console.warn(`  ⚠️  Failed to parse certifications for user ${user.id}:`, e.message);
            }
          }

          // 7. Migrate Projects
          if (user.projects) {
            try {
              const projects = JSON.parse(user.projects);
              if (Array.isArray(projects)) {
                for (const project of projects) {
                  await tx.project.create({
                    data: {
                      profileId: user.id,
                      title: project.title || '',
                      description: project.description || null,
                      technologies: Array.isArray(project.technologies) 
                        ? JSON.stringify(project.technologies) 
                        : project.technologies || null,
                      date: project.date || null,
                      link: project.link || null,
                      github: project.github || null,
                    }
                  });
                }
              }
            } catch (e) {
              console.warn(`  ⚠️  Failed to parse projects for user ${user.id}:`, e.message);
            }
          }

          // 8. Migrate Achievements
          if (user.achievements) {
            try {
              const achievements = JSON.parse(user.achievements);
              if (Array.isArray(achievements)) {
                for (const achievement of achievements) {
                  await tx.achievement.create({
                    data: {
                      profileId: user.id,
                      type: achievement.type || 'Other',
                      title: typeof achievement === 'string' ? achievement : (achievement.title || ''),
                      description: typeof achievement === 'object' ? achievement.description : null,
                      date: typeof achievement === 'object' ? achievement.date : null,
                      link: typeof achievement === 'object' ? achievement.link : null,
                    }
                  });
                }
              }
            } catch (e) {
              console.warn(`  ⚠️  Failed to parse achievements for user ${user.id}:`, e.message);
            }
          }

          // 9. Migrate Social Links
          if (user.socialLinks) {
            try {
              const socialLinks = JSON.parse(user.socialLinks);
              if (Array.isArray(socialLinks)) {
                for (const link of socialLinks) {
                  await tx.socialLink.create({
                    data: {
                      profileId: user.id,
                      platform: link.platform || 'Other',
                      url: link.url || '',
                    }
                  });
                }
              }
            } catch (e) {
              console.warn(`  ⚠️  Failed to parse socialLinks for user ${user.id}:`, e.message);
            }
          }

          // 10. Migrate Career Goals
          if (user.careerGoals) {
            try {
              const careerGoals = JSON.parse(user.careerGoals);
              if (Array.isArray(careerGoals)) {
                for (const goal of careerGoals) {
                  await tx.careerGoal.create({
                    data: {
                      profileId: user.id,
                      title: typeof goal === 'string' ? goal : (goal.title || goal.goal || ''),
                      description: typeof goal === 'object' ? goal.description : null,
                      targetDate: typeof goal === 'object' ? (goal.targetDate || goal.deadline) : null,
                      progress: typeof goal === 'object' ? (goal.progress || 0) : 0,
                      category: typeof goal === 'object' ? (goal.category || 'Other') : 'Other',
                    }
                  });
                }
              }
            } catch (e) {
              console.warn(`  ⚠️  Failed to parse careerGoals for user ${user.id}:`, e.message);
            }
          }

          // 11. Migrate other arrays (volunteer, recommendations, etc.)
          // Similar pattern for volunteerExperiences, recommendations, publications, patents, organizations, testScores, careerTimeline

          migrated++;
          if (migrated % 100 === 0) {
            console.log(`  ✅ Migrated ${migrated} users...`);
          }
        });
      } catch (error) {
        errors++;
        console.error(`  ❌ Error migrating user ${user.id}:`, error.message);
      }
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`   Migrated: ${migrated} users`);
    console.log(`   Errors: ${errors} users`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateToNormalized()
  .catch((error) => {
    console.error('Migration script error:', error);
    process.exit(1);
  });

