function formatZodIssues(error) {
  if (!error) {
    return {
      message: 'Invalid request payload',
      issues: []
    };
  }

  const issues = error.errors?.map((issue) => ({
    path: issue.path?.join('.') || '',
    message: issue.message,
    code: issue.code
  })) || [];

  const primaryMessage = issues[0]?.message || 'Invalid request payload';

  return {
    message: primaryMessage,
    issues
  };
}

function parseBodyOrSendError({ schema, payload, reply, setCorsHeaders }) {
  const result = schema.safeParse(payload);
  if (result.success) {
    return result.data;
  }

  const { message, issues } = formatZodIssues(result.error);
  if (typeof setCorsHeaders === 'function') {
    setCorsHeaders();
  }
  reply.status(400).send({
    success: false,
    error: message,
    details: issues
  });
  return null;
}

module.exports = {
  formatZodIssues,
  parseBodyOrSendError
};

