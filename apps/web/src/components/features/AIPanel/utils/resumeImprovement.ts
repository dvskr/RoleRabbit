export const generateImprovedResume = (data: any, jobDesc: string, analysis: any): any => {
  const improved = JSON.parse(JSON.stringify(data));
  
  // Add missing keywords to summary
  if (analysis.missingKeywords && analysis.missingKeywords.length > 0) {
    const missingKeywordsText = analysis.missingKeywords.join(', ');
    improved.summary = `${improved.summary}\n\nKey skills: ${missingKeywordsText}`;
  }
  
  // Enhance experience with keywords
  if (improved.experience && improved.experience.length > 0) {
    improved.experience = improved.experience.map((exp: any) => {
      const enhancedDescription = `${exp.description}\n\n${analysis.improvements?.join('. ')}`;
      return { ...exp, description: enhancedDescription };
    });
  }
  
  return improved;
};

