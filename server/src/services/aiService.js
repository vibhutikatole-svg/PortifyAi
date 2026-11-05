const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/env');
const { parseResumeDeterministically } = require('./deterministicParser');
const { validateResumeData } = require('../validators/resumeSchema');
const { deduplicateProjects } = require('./projectExtractionService');

// Verified Google AI Studio Free-Tier production models
// gemini-1.5-flash: 15 RPM, 1,000,000 TPM, 1,500 RPD (fast, structured JSON support)
// gemini-2.0-flash: Next-gen multimodal flash
const PRIMARY_MODEL = 'gemini-1.5-flash';
const SECONDARY_MODEL = 'gemini-2.0-flash';

let genAI = null;
if (config.geminiApiKey && config.geminiApiKey.trim().length > 0) {
  try {
    genAI = new GoogleGenerativeAI(config.geminiApiKey);
  } catch (err) {
    console.warn('[AI Service] Failed to initialize GoogleGenerativeAI client:', err.message);
  }
}

/**
 * Check if AI service is active and properly configured with a non-placeholder key
 */
const isAIAvailable = () => {
  return Boolean(
    config.geminiApiKey &&
    config.geminiApiKey.trim().length > 10 &&
    !config.geminiApiKey.includes('your_gemini_api_key') &&
    genAI
  );
};

/**
 * Extract structured resume data with Google Gemini, or seamlessly fall back to Deterministic Parser
 * Validated strictly against the Zod resumeExtractionSchema.
 *
 * @param {string} rawResumeText
 * @returns {Promise<{ data: object, source: 'ai_gemini' | 'deterministic_engine', message?: string }>}
 */
const extractResumeData = async (rawResumeText) => {
  // If AI key is not available or invalid, execute deterministic fallback immediately
  if (!isAIAvailable()) {
    console.log('[AI Service] Gemini API key not configured. Using Portify Deterministic Rule Engine.');
    const deterministicData = parseResumeDeterministically(rawResumeText);
    return {
      data: deterministicData,
      source: 'deterministic_engine',
      message: 'Processed via Portify Deterministic Rule Engine (Gemini API key not configured). All resume facts preserved 100% faithfully.',
    };
  }

  // Diagnostic log without PII
  console.log(`[AI Service] Processing document (text length: ${rawResumeText.length} chars) using model ${PRIMARY_MODEL}`);

  try {
    const model = genAI.getGenerativeModel({
      model: PRIMARY_MODEL,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1, // Near-zero temperature strictly enforces factual adherence
      },
    });

    const prompt = `
You are an expert ATS and resume parsing AI engine.
Your mission is to extract structured portfolio data from the following resume text.

STRICT ACCURACY & GROUNDING RULES:
1. The resume is the absolute source of truth.
2. Extract ONLY facts, roles, titles, companies, dates, skills, and accomplishments explicitly present in the text.
3. NEVER invent, extrapolate, or exaggerate experience, qualifications, skills, or statistics.
4. If a field or detail is not present in the resume, leave it as an empty string "" or an empty array [].
5. Preserve all original project names, job titles, and dates exactly as written.
6. Categorize technical skills logically (e.g. "Languages", "Frameworks & Libraries", "Databases & Cloud", "Tools & Platforms").
7. Extract soft skills into "softSkills" (e.g. "Leadership", "Problem Solving", "Mentoring", "Agile").
8. Extract awards, honors, and notable milestones into "achievements".
9. CRITICAL PROJECT EXTRACTION RULES:
   - Extract distinct projects ONLY when there is genuine project evidence.
   - NEVER split job roles, dates, or sentence bullet points into separate artificial projects.
   - If a resume has 4 projects, output EXACTLY 4 projects.
   - Do NOT treat dates (e.g. "2022 - 2023"), roles (e.g. "Full Stack Developer"), or headers as project titles.

Return a valid JSON object strictly matching this schema:
{
  "personalInfo": {
    "fullName": "string",
    "headline": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "avatarUrl": "",
    "website": "string",
    "github": "string",
    "linkedin": "string",
    "twitter": "string"
  },
  "summary": "string",
  "experience": [
    {
      "role": "string",
      "company": "string",
      "location": "string",
      "startDate": "string",
      "endDate": "string",
      "current": boolean,
      "description": "string",
      "highlights": ["string"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "fieldOfStudy": "string",
      "graduationDate": "string",
      "gpa": "string",
      "highlights": ["string"]
    }
  ],
  "skills": [
    {
      "category": "string",
      "items": ["string"]
    }
  ],
  "softSkills": ["string"],
  "projects": [
    {
      "title": "string",
      "description": "string",
      "technologies": ["string"],
      "liveUrl": "string",
      "repoUrl": "string",
      "dates": "string",
      "highlights": ["string"]
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "issueDate": "string",
      "credentialUrl": "string"
    }
  ],
  "achievements": ["string"]
}

RESUME TEXT:
"""
${rawResumeText}
"""
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    const parsedJson = JSON.parse(responseText);

    // Apply deduplication and boundary verification to projects before validation
    if (Array.isArray(parsedJson.projects)) {
      parsedJson.projects = deduplicateProjects(parsedJson.projects);
    }

    // Validate and sanitize AI response through Zod schema
    const validation = validateResumeData(parsedJson);

    const structuredData = {
      extractionSource: 'ai_gemini',
      title: validation.data.personalInfo?.headline
        ? `${validation.data.personalInfo.fullName || 'Professional'} — ${validation.data.personalInfo.headline}`
        : 'Professional Portfolio',
      ...validation.data,
    };

    return {
      data: structuredData,
      source: 'ai_gemini',
      message: 'Successfully extracted and structured with Google Gemini AI.',
    };
  } catch (err) {
    console.warn(`[AI Service Warning]: Primary model (${PRIMARY_MODEL}) call failed: ${err.message}. Triggering deterministic fallback.`);
    const deterministicData = parseResumeDeterministically(rawResumeText);
    return {
      data: deterministicData,
      source: 'deterministic_engine',
      message: `AI service temporarily unavailable (${err.message}). Safely extracted via Portify Rule Engine.`,
    };
  }
};

/**
 * AI-assisted professional summary enhancement
 */
const enhanceSummary = async (currentSummary, experienceList, skillsList) => {
  if (!isAIAvailable()) {
    return {
      enhancedText: currentSummary,
      source: 'deterministic_engine',
      message: 'AI enhancement unavailable (Gemini API key not configured). Current summary kept.',
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: PRIMARY_MODEL });
    const prompt = `
You are an executive resume and portfolio writer.
Craft a compelling, polished 2-3 sentence professional summary for a portfolio hero section.
Do NOT fabricate skills, metrics, or credentials not mentioned in the context below.
Use active, punchy professional phrasing.

Context:
Current Summary: ${currentSummary || 'None provided'}
Experience Overview: ${JSON.stringify(experienceList || [])}
Key Skills: ${JSON.stringify(skillsList || [])}

Return ONLY the enhanced summary text, with no quotes or introductory remarks.
`;

    const result = await model.generateContent(prompt);
    const enhancedText = result.response.text().trim();

    return {
      enhancedText,
      source: 'ai_gemini',
      message: 'Summary enhanced with Gemini AI.',
    };
  } catch (err) {
    console.warn('[AI Enhance Summary Warning]:', err.message);
    return {
      enhancedText: currentSummary,
      source: 'deterministic_engine',
      message: `Enhancement failed: ${err.message}`,
    };
  }
};

/**
 * AI-assisted bullet point / highlight optimization
 */
const enhanceHighlights = async (role, company, highlights) => {
  if (!isAIAvailable() || !highlights || highlights.length === 0) {
    return {
      enhancedHighlights: highlights,
      source: 'deterministic_engine',
    };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: PRIMARY_MODEL,
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `
You are a technical career coach.
Refine the following bullet points for the role "${role}" at "${company}".
Make them impact-focused using strong action verbs (e.g. "Architected", "Engineered", "Optimized", "Streamlined").
DO NOT fabricate metrics, users, or revenue numbers that are not in the original text.
Preserve the factual integrity of each item.

Original highlights:
${JSON.stringify(highlights)}

Return a JSON array of strings:
["enhanced bullet 1", "enhanced bullet 2"]
`;

    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(result.response.text());

    return {
      enhancedHighlights: Array.isArray(parsed) ? parsed : highlights,
      source: 'ai_gemini',
      message: 'Bullet points enhanced with Gemini AI.',
    };
  } catch (err) {
    console.warn('[AI Enhance Highlights Warning]:', err.message);
    return {
      enhancedHighlights: highlights,
      source: 'deterministic_engine',
      message: `Enhancement failed: ${err.message}`,
    };
  }
};

module.exports = {
  isAIAvailable,
  extractResumeData,
  enhanceSummary,
  enhanceHighlights,
  PRIMARY_MODEL,
  SECONDARY_MODEL,
};
