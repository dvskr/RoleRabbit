const { scoreResumeAgainstJob } = require('../services/ats/atsScoringService');

describe('scoreResumeAgainstJob', () => {
  const resumeData = {
    summary: 'Full-stack engineer experienced in React, Node.js, and AWS.',
    skills: {
      technical: ['JavaScript', 'React', 'Node.js'],
      tools: ['AWS'],
      soft: ['Collaboration']
    },
    experience: [
      {
        company: 'RoleRabbit',
        role: 'Senior Engineer',
        bullets: [
          'Led development of AI-enabled resume tooling with React and Node.js',
          'Improved ATS scoring pipeline throughput by 40%'
        ]
      }
    ],
    education: [],
    projects: [
      {
        name: 'ATS Optimizer',
        summary: 'Built a system to analyze job descriptions',
        technologies: ['TypeScript', 'AWS Lambda']
      }
    ],
    certifications: []
  };

  const jobDescription = `
We are hiring a Senior Full-Stack Engineer to build scalable React and Node.js services on AWS.
Responsibilities include designing ATS-friendly resume experiences, collaborating with product teams,
and optimizing performance. Experience with TypeScript, metrics, and AI-assisted tooling is a plus.
`;

  it('returns a complete ATS analysis structure', () => {
    const result = scoreResumeAgainstJob({ resumeData, jobDescription });

    expect(result).toEqual(
      expect.objectContaining({
        overall: expect.any(Number),
        keywords: expect.any(Number),
        experience: expect.any(Number),
        content: expect.any(Number),
        format: expect.any(Number),
        matchedKeywords: expect.any(Array),
        missingKeywords: expect.any(Array),
        strengths: expect.any(Array),
        improvements: expect.any(Array),
        jobDescriptionHash: expect.any(String)
      })
    );
  });

  it('identifies matched and missing keywords', () => {
    const result = scoreResumeAgainstJob({ resumeData, jobDescription });

    expect(result.matchedKeywords).toEqual(
      expect.arrayContaining(['react', 'node', 'aws'])
    );
    expect(result.missingKeywords).toEqual(
      expect.arrayContaining(['typescript'])
    );
  });

  it('scores improve when skills align closely with job description', () => {
    const baseline = scoreResumeAgainstJob({
      resumeData: { ...resumeData, skills: { technical: [], tools: [], soft: [] } },
      jobDescription
    });

    const improved = scoreResumeAgainstJob({ resumeData, jobDescription });

    expect(improved.overall).toBeGreaterThan(baseline.overall);
  });
});
