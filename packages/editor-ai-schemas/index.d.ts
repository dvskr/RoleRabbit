import { ZodString, ZodEffects, ZodUnion, ZodObject, ZodArray, ZodTypeAny, ZodRecord, ZodUnknown } from 'zod';

export const resumeIdSchema: ZodString;
export const jobDescriptionSchema: ZodString;
export const generateContentRequestSchema: ZodObject<{
  resumeId: ZodString;
  sectionPath: ZodString;
  sectionType: ZodString;
  currentContent: import('zod').ZodOptional<ZodUnion<[ZodString, ZodArray<ZodTypeAny, "many">, ZodRecord<ZodString, ZodUnknown>]>>;
  jobContext: import('zod').ZodOptional<ZodUnion<[ZodString, ZodRecord<ZodString, ZodUnknown>, ZodArray<ZodTypeAny, "many">]>>;
  tone: import('zod').ZodOptional<ZodString>;
  length: import('zod').ZodOptional<ZodString>;
  instructions: import('zod').ZodOptional<ZodString>;
}, "strip", import('zod').ZodTypeAny, {
  resumeId: string;
  sectionPath: string;
  sectionType: string;
  currentContent?: string | Record<string, unknown> | Array<unknown> | undefined;
  jobContext?: string | Record<string, unknown> | Array<unknown> | undefined;
  tone?: string | undefined;
  length?: string | undefined;
  instructions?: string | undefined;
}, {
  resumeId: string;
  sectionPath: string;
  sectionType: string;
  currentContent?: string | Record<string, unknown> | Array<unknown> | undefined;
  jobContext?: string | Record<string, unknown> | Array<unknown> | undefined;
  tone?: string | undefined;
  length?: string | undefined;
  instructions?: string | undefined;
}>;
export const applyDraftRequestSchema: ZodObject<{
  draftId: ZodString;
}, "strip", import('zod').ZodTypeAny, {
  draftId: string;
}, {
  draftId: string;
}>;
export const atsCheckRequestSchema: ZodObject<{
  resumeId: ZodString;
  jobDescription: ZodString;
}, "strip", import('zod').ZodTypeAny, {
  resumeId: string;
  jobDescription: string;
}, {
  resumeId: string;
  jobDescription: string;
}>;
export const tailorModeSchema: import('zod').ZodOptional<ZodEffects<import('zod').ZodEnum<["FULL", "PARTIAL"]>, "FULL" | "PARTIAL", unknown>>;
export const tailorRequestSchema: ZodObject<{
  resumeId: ZodString;
  jobDescription: ZodString;
  mode: import('zod').ZodOptional<ZodEffects<import('zod').ZodEnum<["FULL", "PARTIAL"]>, "FULL" | "PARTIAL", unknown>>;
  tone: import('zod').ZodOptional<ZodString>;
  length: import('zod').ZodOptional<ZodString>;
}, "strip", import('zod').ZodTypeAny, {
  resumeId: string;
  jobDescription: string;
  mode?: "FULL" | "PARTIAL" | undefined;
  tone?: string | undefined;
  length?: string | undefined;
}, {
  resumeId: string;
  jobDescription: string;
  mode?: "FULL" | "PARTIAL" | undefined;
  tone?: string | undefined;
  length?: string | undefined;
}>;
export const applyRecommendationsRequestSchema: ZodObject<{
  resumeId: ZodString;
  jobDescription: ZodString;
  focusAreas: import('zod').ZodOptional<ZodArray<ZodString, "many">>;
  tone: import('zod').ZodOptional<ZodString>;
}, "strip", import('zod').ZodTypeAny, {
  resumeId: string;
  jobDescription: string;
  focusAreas?: string[] | undefined;
  tone?: string | undefined;
}, {
  resumeId: string;
  jobDescription: string;
  focusAreas?: string[] | undefined;
  tone?: string | undefined;
}>;
export const coverLetterRequestSchema: ZodObject<{
  resumeId: ZodString;
  jobDescription: ZodString;
  jobTitle: import('zod').ZodOptional<ZodString>;
  company: import('zod').ZodOptional<ZodString>;
  tone: import('zod').ZodOptional<ZodString>;
}, "strip", import('zod').ZodTypeAny, {
  resumeId: string;
  jobDescription: string;
  jobTitle?: string | undefined;
  company?: string | undefined;
  tone?: string | undefined;
}, {
  resumeId: string;
  jobDescription: string;
  jobTitle?: string | undefined;
  company?: string | undefined;
  tone?: string | undefined;
}>;
export const portfolioRequestSchema: ZodObject<{
  resumeId: ZodString;
  tone: import('zod').ZodOptional<ZodString>;
}, "strip", import('zod').ZodTypeAny, {
  resumeId: string;
  tone?: string | undefined;
}, {
  resumeId: string;
  tone?: string | undefined;
}>;

export type GenerateContentRequest = import('zod').infer<typeof generateContentRequestSchema>;
export type ApplyDraftRequest = import('zod').infer<typeof applyDraftRequestSchema>;
export type AtsCheckRequest = import('zod').infer<typeof atsCheckRequestSchema>;
export type TailorRequest = import('zod').infer<typeof tailorRequestSchema>;
export type ApplyRecommendationsRequest = import('zod').infer<typeof applyRecommendationsRequestSchema>;
export type CoverLetterRequest = import('zod').infer<typeof coverLetterRequestSchema>;
export type PortfolioRequest = import('zod').infer<typeof portfolioRequestSchema>;

