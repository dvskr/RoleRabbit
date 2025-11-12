const assert = require('assert');
const { normalizeResumeData } = require('./index');

const expectArrayEqual = (received, expected) => {
  assert.strictEqual(Array.isArray(received), true);
  assert.strictEqual(received.length, expected.length);
  expected.forEach((value, index) => {
    assert.strictEqual(received[index], value);
  });
};

const expectString = (value, expected) => {
  assert.strictEqual(value, expected);
};

const expectRegex = (value, regex) => {
  assert.strictEqual(typeof value, 'string');
  assert.ok(regex.test(value), `Expected "${value}" to match ${regex}`);
};

const expectUndefined = (value) => {
  assert.strictEqual(value, undefined);
};

const expectLength = (value, length) => {
  assert.strictEqual(Array.isArray(value), true);
  assert.strictEqual(value.length, length);
};

const runTests = () => {
  // Normalizes contact links and removes placeholders
  (() => {
    const normalized = normalizeResumeData({
      contact: {
        name: 'Your Name',
        email: 'person@example.com   ',
        links: [
          'https://linkedin.com/in/person',
          { url: 'https://github.com/person' },
          'https://linkedin.com/in/person',
        ],
      },
      linkedin: 'https://linkedin.com/in/person',
    });

    expectUndefined(normalized.contact?.name);
    expectString(normalized.contact?.email, 'person@example.com');
    expectArrayEqual(normalized.contact?.links || [], ['https://github.com/person']);
    expectString(normalized.contact?.linkedin, 'https://linkedin.com/in/person');
  })();

  // Converts numeric keyed objects to arrays
  (() => {
    const normalized = normalizeResumeData({
      experience: {
        1: {
          id: 'exp-1',
          company: 'RoleReady',
          bullets: {
            0: 'Implemented new features',
            1: 'Led team initiatives',
          },
        },
      },
      skills: {
        technical: {
          0: 'TypeScript',
          1: 'React',
        },
      },
    });

    expectLength(normalized.experience, 1);
    expectArrayEqual(normalized.experience[0].bullets, [
      'Implemented new features',
      'Led team initiatives',
    ]);
    expectArrayEqual(normalized.skills.technical, ['TypeScript', 'React']);
  })();

  // Generates stable ids when missing
  (() => {
    const normalized = normalizeResumeData({
      projects: [
        {
          name: 'Resume Builder',
          bullets: ['Launched MVP'],
        },
      ],
    });

    expectRegex(normalized.projects[0].id, /^proj-/);
  })();
};

runTests();

