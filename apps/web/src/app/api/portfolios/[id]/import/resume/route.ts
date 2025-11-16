/**
 * Portfolio Resume Import API Route
 * Section 2.3: Data Import/Export Endpoints
 *
 * POST /api/portfolios/:id/import/resume - Import resume data via AI extraction
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ============================================================================
// TYPES
// ============================================================================

interface BaseResume {
  id: string;
  userId: string;
  name: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  summary?: string;
  experience: Array<{
    company: string;
    role: string;
    location?: string;
    startDate: string;
    endDate?: string | null;
    current?: boolean;
    description: string;
    achievements?: string[];
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    link?: string;
    github?: string;
  }>;
  skills: Array<{
    name: string;
    category: string;
    proficiency?: number;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string | null;
    gpa?: string;
  }>;
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
// VALIDATION SCHEMAS
// ============================================================================

const ResumeImportSchema = z.object({
  resumeId: z.string().uuid(),
  mergeStrategy: z.enum(['replace', 'merge', 'append']).default('merge'),
});

// ============================================================================
// MOCK DATABASE
// ============================================================================

const portfolios: Portfolio[] = [];
const baseResumes: BaseResume[] = [];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getCurrentUserId(request: NextRequest): string {
  const authHeader = request.headers.get('authorization');
  return authHeader?.replace('Bearer ', '') || 'test-user-id';
}

function verifyOwnership(entity: { userId: string }, userId: string): boolean {
  return entity.userId === userId;
}

// ============================================================================
// AI EXTRACTION (Simulated)
// ============================================================================

/**
 * Simulate AI extraction of resume data
 * In production, this would call an AI service like OpenAI GPT
 * Requirement #10: Reuse existing AI generation logic
 */
async function extractResumeDataWithAI(resume: BaseResume): Promise<any> {
  // TODO: In production, call actual AI service
  // Example:
  // const response = await openai.chat.completions.create({
  //   model: 'gpt-4',
  //   messages: [{
  //     role: 'system',
  //     content: 'Extract and structure resume data into portfolio format...'
  //   }, {
  //     role: 'user',
  //     content: JSON.stringify(resume)
  //   }],
  // });

  // For now, return structured data from resume
  return {
    hero: {
      title: resume.personalInfo.fullName,
      subtitle: resume.experience[0]?.role || 'Professional',
      tagline: resume.summary || '',
    },
    about: {
      bio: resume.summary || '',
    },
    experience: resume.experience.map((exp, index) => ({
      id: crypto.randomUUID(),
      company: exp.company,
      role: exp.role,
      location: exp.location,
      startDate: exp.startDate,
      endDate: exp.endDate,
      current: exp.current || false,
      description: exp.description,
      technologies: extractTechnologies(exp.description),
      achievements: exp.achievements || [],
      order: index,
    })),
    projects: resume.projects.map((proj, index) => ({
      id: crypto.randomUUID(),
      name: proj.name,
      description: proj.description,
      technologies: proj.technologies,
      link: proj.link,
      github: proj.github,
      featured: index < 3, // Mark first 3 as featured
      status: 'completed' as const,
      order: index,
    })),
    skills: resume.skills.map((skill) => ({
      id: crypto.randomUUID(),
      name: skill.name,
      proficiency: skill.proficiency || 3,
      category: skill.category,
    })),
    education: resume.education.map((edu, index) => ({
      id: crypto.randomUUID(),
      institution: edu.institution,
      degree: edu.degree,
      field: edu.field,
      startDate: edu.startDate,
      endDate: edu.endDate,
      current: !edu.endDate,
      gpa: edu.gpa,
      order: index,
    })),
    contact: {
      email: resume.personalInfo.email,
      phone: resume.personalInfo.phone,
      location: resume.personalInfo.location,
      website: resume.personalInfo.website,
      socialLinks: [
        resume.personalInfo.linkedin && {
          id: crypto.randomUUID(),
          platform: 'linkedin' as const,
          url: resume.personalInfo.linkedin,
          order: 0,
        },
        resume.personalInfo.github && {
          id: crypto.randomUUID(),
          platform: 'github' as const,
          url: resume.personalInfo.github,
          order: 1,
        },
        resume.personalInfo.website && {
          id: crypto.randomUUID(),
          platform: 'website' as const,
          url: resume.personalInfo.website,
          order: 2,
        },
      ].filter(Boolean),
    },
  };
}

/**
 * Extract technology keywords from text
 */
function extractTechnologies(text: string): string[] {
  const techKeywords = [
    'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Node.js', 'Python',
    'Java', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Docker', 'Kubernetes',
    'AWS', 'Azure', 'GCP', 'Git', 'CI/CD', 'REST', 'GraphQL',
  ];

  return techKeywords.filter((tech) =>
    text.toLowerCase().includes(tech.toLowerCase())
  );
}

// ============================================================================
// MERGE STRATEGIES
// ============================================================================

function mergeData(existing: any, imported: any, strategy: 'replace' | 'merge' | 'append'): any {
  if (strategy === 'replace') {
    return imported;
  }

  if (strategy === 'append') {
    return {
      ...existing,
      experience: [...(existing.experience || []), ...(imported.experience || [])],
      projects: [...(existing.projects || []), ...(imported.projects || [])],
      skills: [...(existing.skills || []), ...(imported.skills || [])],
      education: [...(existing.education || []), ...(imported.education || [])],
    };
  }

  // Merge strategy (default)
  return {
    ...existing,
    ...imported,
    // Deep merge arrays (deduplicate by id)
    experience: deduplicateById([...(existing.experience || []), ...(imported.experience || [])]),
    projects: deduplicateById([...(existing.projects || []), ...(imported.projects || [])]),
    skills: deduplicateByName([...(existing.skills || []), ...(imported.skills || [])]),
    education: deduplicateById([...(existing.education || []), ...(imported.education || [])]),
    contact: {
      ...(existing.contact || {}),
      ...(imported.contact || {}),
      socialLinks: deduplicateById([
        ...(existing.contact?.socialLinks || []),
        ...(imported.contact?.socialLinks || []),
      ]),
    },
  };
}

function deduplicateById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function deduplicateByName<T extends { name: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ============================================================================
// POST /api/portfolios/:id/import/resume
// Requirements #8-10: Import from resume via AI extraction
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getCurrentUserId(request);
    const { id: portfolioId } = params;

    const body = await request.json();
    const validation = ResumeImportSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { resumeId, mergeStrategy } = validation.data;

    // Find portfolio
    // TODO: Replace with actual database query
    const portfolio = portfolios.find((p) => p.id === portfolioId);

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Verify portfolio ownership
    if (!verifyOwnership(portfolio, userId)) {
      return NextResponse.json(
        { error: 'Forbidden - You do not own this portfolio' },
        { status: 403 }
      );
    }

    // Requirement #9: Fetch resume data from BaseResume table
    // TODO: Replace with actual database query
    // const resume = await db.baseResume.findUnique({
    //   where: { id: resumeId },
    // });

    const resume = baseResumes.find((r) => r.id === resumeId);

    if (!resume) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      );
    }

    // Verify resume ownership
    if (!verifyOwnership(resume, userId)) {
      return NextResponse.json(
        { error: 'Forbidden - You do not own this resume' },
        { status: 403 }
      );
    }

    // Requirement #10: Use AI extraction to convert resume to portfolio data
    const extractedData = await extractResumeDataWithAI(resume);

    // Merge with existing portfolio data based on strategy
    const updatedData = mergeData(portfolio.data, extractedData, mergeStrategy);

    // Update portfolio
    // TODO: Replace with actual database update
    const portfolioIndex = portfolios.findIndex((p) => p.id === portfolioId);
    portfolios[portfolioIndex] = {
      ...portfolio,
      data: updatedData,
      updatedAt: new Date().toISOString(),
      updatedBy: userId,
      version: portfolio.version + 1,
    };

    return NextResponse.json({
      message: 'Resume data imported successfully',
      portfolio: portfolios[portfolioIndex],
      imported: {
        experience: extractedData.experience?.length || 0,
        projects: extractedData.projects?.length || 0,
        skills: extractedData.skills?.length || 0,
        education: extractedData.education?.length || 0,
      },
      mergeStrategy,
    });

  } catch (error) {
    console.error('Error importing resume data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
