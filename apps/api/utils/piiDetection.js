/**
 * SEC-007: PII detection and redaction in file content
 */

const logger = require('./logger');
const { scanFileForSensitiveData } = require('./contentScanner');

/**
 * SEC-007: Detect PII in file content
 */
async function detectPII(fileBuffer, contentType, fileName) {
  try {
    const scanResult = await scanFileForSensitiveData(fileBuffer, contentType, fileName);
    
    if (scanResult.hasSensitiveData) {
      return {
        hasPII: true,
        findings: scanResult.findings,
        riskLevel: calculateRiskLevel(scanResult.findings),
      };
    }

    return {
      hasPII: false,
      findings: [],
      riskLevel: 'low',
    };
  } catch (error) {
    logger.error('PII detection failed:', error);
    return {
      hasPII: false,
      findings: [],
      riskLevel: 'unknown',
    };
  }
}

/**
 * Calculate risk level based on findings
 */
function calculateRiskLevel(findings) {
  const riskScores = {
    ssn: 10,
    creditCard: 9,
    email: 3,
    phone: 3,
    address: 5,
    name: 2,
  };

  let totalScore = 0;
  for (const finding of findings) {
    totalScore += riskScores[finding.type] || 1;
  }

  if (totalScore >= 10) return 'high';
  if (totalScore >= 5) return 'medium';
  return 'low';
}

/**
 * SEC-007: Redact PII from file content (for previews)
 */
async function redactPII(content, findings) {
  try {
    let redactedContent = content;

    for (const finding of findings) {
      switch (finding.type) {
        case 'ssn':
          redactedContent = redactedContent.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '***-**-****');
          break;
        case 'creditCard':
          redactedContent = redactedContent.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '****-****-****-****');
          break;
        case 'email':
          redactedContent = redactedContent.replace(/\b[\w.-]+@[\w.-]+\.\w+\b/g, (match) => {
            const [local, domain] = match.split('@');
            return `${local[0]}***@${domain}`;
          });
          break;
        case 'phone':
          redactedContent = redactedContent.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '***-***-****');
          break;
      }
    }

    return redactedContent;
  } catch (error) {
    logger.error('PII redaction failed:', error);
    return content; // Return original if redaction fails
  }
}

module.exports = {
  detectPII,
  redactPII,
  calculateRiskLevel,
};

