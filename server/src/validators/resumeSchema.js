const { z } = require('zod');

/**
 * Zod schema for validated personal information
 */
const personalInfoSchema = z.object({
  fullName: z.string().default(''),
  headline: z.string().default(''),
  email: z.string().default(''),
  phone: z.string().default(''),
  location: z.string().default(''),
  avatarUrl: z.string().default(''),
  website: z.string().default(''),
  github: z.string().default(''),
  linkedin: z.string().default(''),
  twitter: z.string().default(''),
});

/**
 * Zod schema for work experience
 */
const experienceItemSchema = z.object({
  role: z.string().max(300).default(''),
  company: z.string().max(300).default(''),
  location: z.string().max(300).default(''),
  startDate: z.string().max(100).default(''),
  endDate: z.string().max(100).default(''),
  current: z.boolean().default(false),
  description: z.string().max(5000).default(''),
  highlights: z.array(z.string().max(1000)).max(50).default([]),
});

/**
 * Zod schema for education
 */
const educationItemSchema = z.object({
  institution: z.string().max(300).default(''),
  degree: z.string().max(300).default(''),
  fieldOfStudy: z.string().max(300).default(''),
  graduationDate: z.string().max(100).default(''),
  gpa: z.string().max(50).default(''),
  highlights: z.array(z.string().max(1000)).max(50).default([]),
});

/**
 * Zod schema for categorized skills
 */
const skillCategorySchema = z.object({
  category: z.string().max(200).default('Technical Skills'),
  items: z.array(z.string().max(200)).max(100).default([]),
});

/**
 * Zod schema for projects (with evidence verification)
 */
const projectItemSchema = z.object({
  title: z.string().max(300).default(''),
  description: z.string().max(5000).default(''),
  technologies: z.array(z.string().max(200)).max(100).default([]),
  liveUrl: z.string().max(1000).default(''),
  repoUrl: z.string().max(1000).default(''),
  dates: z.string().max(100).default(''),
  sourceEvidence: z.union([
    z.array(z.string().max(1000)).max(50),
    z.string().transform((str) => (str ? [str] : [])),
  ]).default([]),
  sourcePages: z.array(z.number()).max(50).default([]),
  confidence: z.number().min(0).max(1).default(1.0),
  verificationStatus: z.enum(['verified', 'inferred', 'pending', 'manual']).default('verified'),
  highlights: z.array(z.string().max(1000)).max(50).default([]),
});

/**
 * Zod schema for certifications
 */
const certificationItemSchema = z.object({
  name: z.string().max(300).default(''),
  issuer: z.string().max(300).default(''),
  issueDate: z.string().max(100).default(''),
  credentialUrl: z.string().max(1000).default(''),
});

/**
 * Zod schema for custom sections
 */
const customSectionSchema = z.object({
  title: z.string().max(300).default(''),
  content: z.string().max(10000).default(''),
});

/**
 * Master Resume Extraction Schema
 * Validates AI and deterministic extraction outputs
 */
const resumeExtractionSchema = z.object({
  title: z.string().max(300).default('Professional Portfolio'),
  personalInfo: personalInfoSchema.default({}),
  summary: z.string().max(5000).default(''),
  experience: z.array(experienceItemSchema).max(50).default([]),
  education: z.array(educationItemSchema).max(50).default([]),
  skills: z.array(skillCategorySchema).max(50).default([]),
  softSkills: z.array(z.string().max(200)).max(100).default([]),
  projects: z.array(projectItemSchema).max(50).default([]),
  certifications: z.array(certificationItemSchema).max(50).default([]),
  achievements: z.array(z.string().max(1000)).max(100).default([]),
  customSections: z.array(customSectionSchema).max(50).default([]),
});

/**
 * Validate and sanitize extracted data against the schema
 * Returns sanitized object with guaranteed types and defaults
 * @param {object} inputData
 * @returns {{ success: boolean, data: object, errors?: z.ZodError }}
 */
const validateResumeData = (inputData) => {
  if (!inputData || typeof inputData !== 'object') {
    return {
      success: true,
      data: resumeExtractionSchema.parse({}),
    };
  }

  // Pre-sanitize nulls or non-array collections before parsing
  const sanitizedInput = {
    ...inputData,
    personalInfo: typeof inputData.personalInfo === 'object' && inputData.personalInfo !== null
      ? inputData.personalInfo
      : {},
    experience: Array.isArray(inputData.experience) ? inputData.experience : [],
    education: Array.isArray(inputData.education) ? inputData.education : [],
    skills: Array.isArray(inputData.skills) ? inputData.skills : [],
    softSkills: Array.isArray(inputData.softSkills) ? inputData.softSkills : [],
    projects: Array.isArray(inputData.projects) ? inputData.projects : [],
    certifications: Array.isArray(inputData.certifications) ? inputData.certifications : [],
    achievements: Array.isArray(inputData.achievements) ? inputData.achievements : [],
    customSections: Array.isArray(inputData.customSections) ? inputData.customSections : [],
  };

  const result = resumeExtractionSchema.safeParse(sanitizedInput);
  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  // If validation encountered an issue, provide safe fallback with defaults
  console.warn('[Zod Validation Warning]: Input schema mismatch, applying sanitized defaults:', result.error.message);
  return {
    success: false,
    errors: result.error,
    data: resumeExtractionSchema.parse({}),
  };
};

module.exports = {
  resumeExtractionSchema,
  personalInfoSchema,
  experienceItemSchema,
  educationItemSchema,
  skillCategorySchema,
  projectItemSchema,
  certificationItemSchema,
  validateResumeData,
};

