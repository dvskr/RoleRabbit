const { normalizeStructuredResume, extractContactDetailsFromText } = require('../services/resumeParser');

describe('resumeParser contact normalization', () => {
  it('fills missing contact fields from raw resume text', () => {
    const rawText = `John Doe\nSenior Software Engineer\njohn.doe@example.com\n+1 (415) 555-0199\nhttps://linkedin.com/in/johndoe\nhttps://github.com/johndoe\nhttps://johndoe.dev`;

    const normalized = normalizeStructuredResume({}, rawText);

    expect(normalized.contact).toBeDefined();
    expect(normalized.contact.email).toBe('john.doe@example.com');
    expect(normalized.contact.phone).toBe('+1 (415) 555-0199');
    expect(normalized.contact.linkedin).toBe('https://linkedin.com/in/johndoe');
    expect(normalized.contact.github).toBe('https://github.com/johndoe');
    expect(normalized.contact.website).toBe('https://johndoe.dev');
  });

  it('preserves structured contact data over fallback values', () => {
    const structured = {
      contact: {
        email: 'existing@example.com',
        phone: '+44 20 3456 7890',
        links: ['https://linkedin.com/in/existing']
      },
      linkedin: 'https://linkedin.com/in/existing'
    };

    const rawText = `New Contact\nnew.person@example.com\n(555) 010-0000\nhttps://linkedin.com/in/newperson`;

    const normalized = normalizeStructuredResume(structured, rawText);

    expect(normalized.contact.email).toBe('existing@example.com');
    expect(normalized.contact.phone).toBe('+44 20 3456 7890');
    expect(normalized.contact.linkedin).toBe('https://linkedin.com/in/existing');
    expect(normalized.contact.links || []).toHaveLength(0);
  });

  it('extractContactDetailsFromText captures unique links and phone numbers', () => {
    const rawText = `Reach me at jane@example.com or jane.doe@example.com\nCall: (555) 321-6543 ext. 101\nLinkedIn: https://linkedin.com/in/janedoe\nPortfolio: www.janedoe.dev\nGitHub: https://github.com/janedoe\nDuplicate: https://github.com/janedoe`; // duplicate github link

    const details = extractContactDetailsFromText(rawText);

    expect(details.email).toBe('jane@example.com');
    expect(details.phone).toBe('(555) 321-6543 ext. 101');
    expect(details.linkedin).toBe('https://linkedin.com/in/janedoe');
    expect(details.github).toBe('https://github.com/janedoe');
    expect(details.website).toBe('https://www.janedoe.dev');
    expect(details.links.length).toBe(3);

    const lowercasedLinks = details.links.map((link) => link.toLowerCase());
    expect(new Set(lowercasedLinks).size).toBe(details.links.length);
  });
});

