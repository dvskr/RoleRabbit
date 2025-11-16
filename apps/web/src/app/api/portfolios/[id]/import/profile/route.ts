/**
 * Portfolio Profile Import API Route
 * Section 2.3: Data Import/Export Endpoints
 *
 * POST /api/portfolios/:id/import/profile - Import user profile data into portfolio
 */

import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// TYPES
// ============================================================================

interface UserProfile {
  id: string;
  userId: string;
  bio: string | null;
  linkedin: string | null;
  github: string | null;
  twitter: string | null;
  website: string | null;
  phone: string | null;
  location: string | null;
}

interface WorkExperience {
  id: string;
  userId: string;
  company: string;
  role: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string;
  technologies: string[];
  achievements: string[];
}

interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  technologies: string[];
  link: string | null;
  github: string | null;
  image: string | null;
  featured: boolean;
  startDate: string | null;
  endDate: string | null;
  status: string;
}

interface Education {
  id: string;
  userId: string;
  institution: string;
  degree: string;
  field: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string | null;
  gpa: string | null;
}

interface UserSkill {
  id: string;
  userId: string;
  skillId: string;
  proficiency: number;
  yearsOfExperience: number | null;
}

interface Skill {
  id: string;
  name: string;
  category: string;
}

interface Portfolio {
  id: string;
  userId: string;
  name: string;
  data: any;
  updatedAt: string;
  updatedBy: string | null;
  version: number;
}

// ============================================================================
// MOCK DATABASE
// ============================================================================

const portfolios: Portfolio[] = [];
const userProfiles: UserProfile[] = [];
const workExperiences: WorkExperience[] = [];
const projects: Project[] = [];
const educations: Education[] = [];
const userSkills: UserSkill[] = [];
const skills: Skill[] = [];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getCurrentUserId(request: NextRequest): string {
  const authHeader = request.headers.get('authorization');
  return authHeader?.replace('Bearer ', '') || 'test-user-id';
}

function verifyOwnership(portfolio: Portfolio, userId: string): boolean {
  return portfolio.userId === userId;
}

// ============================================================================
// DATA MAPPING FUNCTIONS
// ============================================================================

/**
 * Map UserProfile to portfolio contact section
 * Requirement #2: Map UserProfile.bio → portfolio.data.about.bio
 * UserProfile.linkedin/github → portfolio.data.contact.socialLinks
 */
function mapProfileToContact(profile: UserProfile) {
  const socialLinks = [];

  if (profile.linkedin) {
    socialLinks.push({
      id: crypto.randomUUID(),
      platform: 'linkedin' as const,
      url: profile.linkedin,
      order: 0,
    });
  }

  if (profile.github) {
    socialLinks.push({
      id: crypto.randomUUID(),
      platform: 'github' as const,
      url: profile.github,
      order: 1,
    });
  }

  if (profile.twitter) {
    socialLinks.push({
      id: crypto.randomUUID(),
      platform: 'twitter' as const,
      url: profile.twitter,
      order: 2,
    });
  }

  if (profile.website) {
    socialLinks.push({
      id: crypto.randomUUID(),
      platform: 'website' as const,
      url: profile.website,
      order: 3,
    });
  }

  return {
    about: {
      bio: profile.bio || '',
    },
    contact: {
      email: '', // Must be provided separately
      phone: profile.phone || undefined,
      location: profile.location || undefined,
      website: profile.website || undefined,
      socialLinks,
    },
  };
}

/**
 * Map WorkExperience records to portfolio experience array
 * Requirement #3: Map WorkExperience → portfolio.data.experience
 */
function mapWorkExperiences(experiences: WorkExperience[]) {
  return experiences
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .map((exp, index) => ({
      id: exp.id,
      company: exp.company,
      role: exp.role,
      location: exp.location || undefined,
      startDate: exp.startDate,
      endDate: exp.endDate,
      current: exp.current,
      description: exp.description,
      technologies: exp.technologies,
      achievements: exp.achievements,
      order: index,
    }));
}

/**
 * Map Project records to portfolio projects array
 * Requirement #4: Map Project → portfolio.data.projects
 */
function mapProjects(projectsList: Project[]) {
  return projectsList
    .sort((a, b) => {
      // Featured first, then by date
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      const dateA = new Date(a.startDate || 0).getTime();
      const dateB = new Date(b.startDate || 0).getTime();
      return dateB - dateA;
    })
    .map((proj, index) => ({
      id: proj.id,
      name: proj.name,
      description: proj.description,
      technologies: proj.technologies,
      link: proj.link || undefined,
      github: proj.github || undefined,
      image: proj.image || undefined,
      featured: proj.featured,
      startDate: proj.startDate || undefined,
      endDate: proj.endDate || undefined,
      status: (proj.status as any) || 'completed',
      order: index,
    }));
}

/**
 * Map UserSkill + Skill records to portfolio skills array
 * Requirement #5: Map UserSkill + Skill → portfolio.data.skills
 */
function mapSkills(userSkillsList: UserSkill[], skillsList: Skill[]) {
  return userSkillsList
    .map((userSkill) => {
      const skill = skillsList.find((s) => s.id === userSkill.skillId);
      if (!skill) return null;

      return {
        id: userSkill.id,
        name: skill.name,
        proficiency: userSkill.proficiency,
        category: skill.category,
        yearsOfExperience: userSkill.yearsOfExperience || undefined,
      };
    })
    .filter((skill): skill is NonNullable<typeof skill> => skill !== null)
    .sort((a, b) => b.proficiency - a.proficiency);
}

/**
 * Map Education records to portfolio education array
 * Requirement #6: Map Education → portfolio.data.education
 */
function mapEducation(educationList: Education[]) {
  return educationList
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .map((edu, index) => ({
      id: edu.id,
      institution: edu.institution,
      degree: edu.degree,
      field: edu.field,
      location: edu.location || undefined,
      startDate: edu.startDate,
      endDate: edu.endDate,
      current: edu.current,
      description: edu.description || undefined,
      gpa: edu.gpa || undefined,
      order: index,
    }));
}

// ============================================================================
// POST /api/portfolios/:id/import/profile
// Requirements #1-7: Import profile data into portfolio
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getCurrentUserId(request);
    const { id: portfolioId } = params;

    // Find portfolio
    // TODO: Replace with actual database query
    // const portfolio = await db.portfolio.findUnique({ where: { id: portfolioId } });
    const portfolio = portfolios.find((p) => p.id === portfolioId);

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Requirement #7: Verify portfolio ownership
    if (!verifyOwnership(portfolio, userId)) {
      return NextResponse.json(
        { error: 'Forbidden - You do not own this portfolio' },
        { status: 403 }
      );
    }

    // Fetch user profile data
    // TODO: Replace with actual database queries
    // const profile = await db.userProfile.findUnique({ where: { userId } });
    // const experiences = await db.workExperience.findMany({ where: { userId } });
    // const userProjects = await db.project.findMany({ where: { userId } });
    // const userEducation = await db.education.findMany({ where: { userId } });
    // const userSkillsList = await db.userSkill.findMany({ where: { userId }, include: { skill: true } });

    const profile = userProfiles.find((p) => p.userId === userId);
    const experiences = workExperiences.filter((e) => e.userId === userId);
    const userProjects = projects.filter((p) => p.userId === userId);
    const userEducation = educations.filter((e) => e.userId === userId);
    const userSkillsList = userSkills.filter((us) => us.userId === userId);

    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found. Please complete your profile first.' },
        { status: 404 }
      );
    }

    // Map data to portfolio structure
    const profileData = mapProfileToContact(profile);
    const experienceData = mapWorkExperiences(experiences);
    const projectsData = mapProjects(userProjects);
    const skillsData = mapSkills(userSkillsList, skills);
    const educationData = mapEducation(userEducation);

    // Merge imported data with existing portfolio data
    const updatedData = {
      ...portfolio.data,
      // Requirement #2: Map bio and social links
      about: {
        ...portfolio.data.about,
        ...profileData.about,
      },
      contact: {
        ...portfolio.data.contact,
        ...profileData.contact,
        // Preserve existing email if present
        email: portfolio.data.contact?.email || '',
      },
      // Requirement #3: Map experience
      experience: experienceData,
      // Requirement #4: Map projects
      projects: projectsData,
      // Requirement #5: Map skills
      skills: skillsData,
      // Requirement #6: Map education
      education: educationData,
    };

    // Update portfolio
    // TODO: Replace with actual database update
    // const updated = await db.portfolio.update({
    //   where: { id: portfolioId },
    //   data: {
    //     data: updatedData,
    //     updatedAt: new Date(),
    //     updatedBy: userId,
    //     version: { increment: 1 },
    //   },
    // });

    const portfolioIndex = portfolios.findIndex((p) => p.id === portfolioId);
    portfolios[portfolioIndex] = {
      ...portfolio,
      data: updatedData,
      updatedAt: new Date().toISOString(),
      updatedBy: userId,
      version: portfolio.version + 1,
    };

    return NextResponse.json({
      message: 'Profile data imported successfully',
      portfolio: portfolios[portfolioIndex],
      imported: {
        experience: experienceData.length,
        projects: projectsData.length,
        skills: skillsData.length,
        education: educationData.length,
      },
    });

  } catch (error) {
    console.error('Error importing profile data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
