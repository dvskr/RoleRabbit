const { z } = require('zod');

const resumeIdSchema = z
  .string({
    required_error: 'resumeId is required',
    invalid_type_error: 'resumeId must be a string'
  })
  .min(1, 'resumeId is required')
  .max(128, 'resumeId must be 128 characters or fewer')
  .trim();

const jobDescriptionSchema = z
  .string({
    required_error: 'jobDescription is required',
    invalid_type_error: 'jobDescription must be a string'
  })
  .trim()
  .min(10, 'jobDescription must be at least 10 characters long')
  .max(20000, 'jobDescription must be 20000 characters or fewer');

const optionalToneSchema = z
  .string({
    invalid_type_error: 'tone must be a string'
  })
  .trim()
  .min(1, 'tone cannot be empty')
  .max(64, 'tone must be 64 characters or fewer')
  .optional();

const optionalLengthSchema = z
  .string({
    invalid_type_error: 'length must be a string'
  })
  .trim()
  .min(1, 'length cannot be empty')
  .max(64, 'length must be 64 characters or fewer')
  .optional();

const optionalInstructionsSchema = z
  .string({
    invalid_type_error: 'instructions must be a string'
  })
  .trim()
  .max(20000, 'instructions must be 20000 characters or fewer')
  .optional();

const jobContextSchema = z
  .union([
    z.string().trim().min(1, 'jobContext cannot be empty'),
    z.record(z.string(), z.unknown()),
    z.array(z.unknown())
  ])
  .optional();

const currentContentSchema = z.union([
  z
    .string({
      invalid_type_error: 'currentContent must be a string'
    })
    .max(20000, 'currentContent must be 20000 characters or fewer'),
  z.array(z.unknown()),
  z.record(z.string(), z.unknown())
]);

const generateContentRequestSchema = z.object({
  resumeId: resumeIdSchema,
  sectionPath: z
    .string({
      required_error: 'sectionPath is required',
      invalid_type_error: 'sectionPath must be a string'
    })
    .trim()
    .min(1, 'sectionPath is required')
    .max(256, 'sectionPath must be 256 characters or fewer'),
  sectionType: z
    .string({
      required_error: 'sectionType is required',
      invalid_type_error: 'sectionType must be a string'
    })
    .trim()
    .min(1, 'sectionType is required')
    .max(128, 'sectionType must be 128 characters or fewer'),
  currentContent: currentContentSchema.optional(),
  jobContext: jobContextSchema,
  tone: optionalToneSchema,
  length: optionalLengthSchema,
  instructions: optionalInstructionsSchema
});

const applyDraftRequestSchema = z.object({
  draftId: z
    .string({
      required_error: 'draftId is required',
      invalid_type_error: 'draftId must be a string'
    })
    .trim()
    .min(1, 'draftId is required')
    .max(128, 'draftId must be 128 characters or fewer')
});

const atsCheckRequestSchema = z.object({
  resumeId: resumeIdSchema,
  jobDescription: jobDescriptionSchema
});

const tailorModeEnum = z.enum(['FULL', 'PARTIAL'], {
  errorMap: () => ({ message: 'mode must be FULL or PARTIAL' })
});

const tailorModeSchema = z
  .preprocess(
    (value) => (typeof value === 'string' ? value.toUpperCase() : value),
    tailorModeEnum
  )
  .optional();

const tailorRequestSchema = z.object({
  resumeId: resumeIdSchema,
  jobDescription: jobDescriptionSchema,
  mode: tailorModeSchema,
  tone: optionalToneSchema,
  length: optionalLengthSchema
});

const applyRecommendationsRequestSchema = z.object({
  resumeId: resumeIdSchema,
  jobDescription: jobDescriptionSchema,
  focusAreas: z
    .array(
      z
        .string({
          invalid_type_error: 'focusAreas must contain strings'
        })
        .trim()
        .min(1, 'focus area cannot be empty')
        .max(64, 'focus area must be 64 characters or fewer')
    )
    .max(10, 'focusAreas must include 10 items or fewer')
    .optional(),
  tone: optionalToneSchema
});

const coverLetterRequestSchema = z.object({
  resumeId: resumeIdSchema,
  jobDescription: jobDescriptionSchema,
  jobTitle: z
    .string({
      invalid_type_error: 'jobTitle must be a string'
    })
    .trim()
    .max(128, 'jobTitle must be 128 characters or fewer')
    .optional(),
  company: z
    .string({
      invalid_type_error: 'company must be a string'
    })
    .trim()
    .max(128, 'company must be 128 characters or fewer')
    .optional(),
  tone: optionalToneSchema
});

module.exports = {
  resumeIdSchema,
  jobDescriptionSchema,
  generateContentRequestSchema,
  applyDraftRequestSchema,
  atsCheckRequestSchema,
  tailorRequestSchema,
  applyRecommendationsRequestSchema,
  coverLetterRequestSchema,
  tailorModeSchema
};

