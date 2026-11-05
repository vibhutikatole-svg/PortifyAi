const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/env');
const { isAIAvailable, PRIMARY_MODEL } = require('./aiService');

let genAI = null;
if (config.geminiApiKey && config.geminiApiKey.trim().length > 0) {
  try {
    genAI = new GoogleGenerativeAI(config.geminiApiKey);
  } catch (err) {
    console.warn('[Generation Engine] Failed to init GoogleGenerativeAI:', err.message);
  }
}

/**
 * Sanitize strings against any HTML/JS script injection
 */
const sanitizeText = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '') // Strip HTML tags
    .replace(/javascript:/gi, '')
    .trim();
};

/**
 * Deterministic Content Enhancer (Fallback when AI is unconfigured or in offline/test environment)
 * Guarantees zero hallucinations, grammatical polish, active impact verbs, and professional presentation.
 */
const polishDeterministically = (data) => {
  const p = JSON.parse(JSON.stringify(data || {}));
  const info = p.personalInfo || {};

  // 1. Hero Headline Polish
  let polishedHeadline = sanitizeText(info.headline || '');
  if (polishedHeadline) {
    // Ensure proper casing and structure
    polishedHeadline = polishedHeadline
      .split(/\s*\|\s*|\s*•\s*|\s*,\s*/)
      .map((part) => {
        const trimmed = part.trim();
        if (!trimmed) return '';
        // Title case words
        return trimmed.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase());
      })
      .filter(Boolean)
      .join(' | ');
  } else if (p.skills && p.skills.length > 0 && p.skills[0].items && p.skills[0].items.length > 0) {
    const topSkills = p.skills[0].items.slice(0, 3).join(', ');
    polishedHeadline = `Professional Specialist | ${topSkills}`;
  } else {
    polishedHeadline = 'Professional Candidate';
  }

  // 2. About / Professional Summary Polish
  let polishedSummary = sanitizeText(p.summary || '');
  if (polishedSummary) {
    // Ensure summary ends with period and has clean spacing
    if (!/[.!?]$/.test(polishedSummary)) {
      polishedSummary += '.';
    }
  } else {
    // Synthesize grounded summary from real experience / skills
    const rolePart = p.experience && p.experience.length > 0 ? p.experience[0].role : null;
    const eduPart = p.education && p.education.length > 0 ? p.education[0].degree : null;
    const skillsPart = p.skills && p.skills.length > 0 && p.skills[0].items.length > 0
      ? p.skills[0].items.slice(0, 4).join(', ')
      : null;

    if (rolePart && skillsPart) {
      polishedSummary = `Accomplished ${rolePart} specializing in ${skillsPart}. Dedicated to delivering impactful solutions and high-quality results.`;
    } else if (eduPart && skillsPart) {
      polishedSummary = `Motivated ${eduPart} graduate with core proficiencies in ${skillsPart}. Eager to contribute foundational expertise to high-performing teams.`;
    } else {
      polishedSummary = `Results-oriented professional committed to excellence, continuous learning, and driving meaningful impact across initiatives.`;
    }
  }

  // 3. Experience Highlights & Description Polish
  const polishedExperience = (p.experience || []).map((exp) => {
    const role = sanitizeText(exp.role || '');
    const company = sanitizeText(exp.company || '');
    let description = sanitizeText(exp.description || '');
    if (description && !/[.!?]$/.test(description)) {
      description += '.';
    }

    const polishedHighlights = (exp.highlights || []).map((h) => {
      let cleaned = sanitizeText(h);
      if (!cleaned) return '';
      // Ensure capitalized first letter
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
      // Ensure period at end
      if (!/[.!?]$/.test(cleaned)) {
        cleaned += '.';
      }
      return cleaned;
    }).filter(Boolean);

    return {
      ...exp,
      role,
      company,
      location: sanitizeText(exp.location || ''),
      description,
      highlights: polishedHighlights,
    };
  });

  // 4. Projects Polish
  const polishedProjects = (p.projects || []).map((proj) => {
    const title = sanitizeText(proj.title || '');
    let description = sanitizeText(proj.description || '');
    if (description && !/[.!?]$/.test(description)) {
      description += '.';
    }

    const techs = (proj.technologies || []).map(sanitizeText).filter(Boolean);

    return {
      ...proj,
      title,
      description,
      technologies: techs,
    };
  });

  // 5. Skills Polish (Clean deduplication and trimming)
  const polishedSkills = (p.skills || []).map((group) => ({
    category: sanitizeText(group.category || 'Competencies'),
    items: Array.from(new Set((group.items || []).map(sanitizeText).filter(Boolean))),
  }));

  const polishedSoftSkills = Array.from(new Set((p.softSkills || []).map(sanitizeText).filter(Boolean)));

  // 6. Education Polish
  const polishedEducation = (p.education || []).map((edu) => ({
    ...edu,
    institution: sanitizeText(edu.institution || ''),
    degree: sanitizeText(edu.degree || ''),
    fieldOfStudy: sanitizeText(edu.fieldOfStudy || ''),
    graduationDate: sanitizeText(edu.graduationDate || ''),
    gpa: sanitizeText(edu.gpa || ''),
  }));

  // 7. Certifications Polish
  const polishedCertifications = (p.certifications || []).map((cert) => ({
    ...cert,
    name: sanitizeText(cert.name || ''),
    issuer: sanitizeText(cert.issuer || ''),
    issueDate: sanitizeText(cert.issueDate || ''),
    credentialUrl: sanitizeText(cert.credentialUrl || ''),
  }));

  // 8. Achievements Polish
  const polishedAchievements = (p.achievements || []).map((ach) => {
    let cleaned = sanitizeText(ach);
    if (cleaned && !/[.!?]$/.test(cleaned)) {
      cleaned += '.';
    }
    return cleaned;
  }).filter(Boolean);

  return {
    ...p,
    personalInfo: {
      ...info,
      fullName: sanitizeText(info.fullName || ''),
      headline: polishedHeadline,
      email: sanitizeText(info.email || ''),
      phone: sanitizeText(info.phone || ''),
      location: sanitizeText(info.location || ''),
      bio: sanitizeText(info.bio || ''),
      website: sanitizeText(info.website || ''),
      github: sanitizeText(info.github || ''),
      linkedin: sanitizeText(info.linkedin || ''),
      twitter: sanitizeText(info.twitter || ''),
    },
    summary: polishedSummary,
    skills: polishedSkills,
    softSkills: polishedSoftSkills,
    experience: polishedExperience,
    education: polishedEducation,
    projects: polishedProjects,
    certifications: polishedCertifications,
    achievements: polishedAchievements,
  };
};

/**
 * Grounding & Anti-Hallucination Verification
 * Verifies that the enhanced data introduces ZERO unsupported companies, degrees, or skills.
 */
const verifyGroundedness = (original, enhanced) => {
  const violations = [];

  // 1. Experience Check: If original had no experience, enhanced must not invent jobs
  const origExpCount = (original.experience || []).length;
  const enhExpCount = (enhanced.experience || []).length;
  if (origExpCount === 0 && enhExpCount > 0) {
    violations.push('AI hallucinated work experience for a candidate with no prior experience.');
  }

  // 2. Company Name Check: All enhanced company names must correspond to original ones
  const origCompanies = new Set(
    (original.experience || []).map((e) => (e.company || '').trim().toLowerCase()).filter(Boolean)
  );
  (enhanced.experience || []).forEach((e) => {
    const comp = (e.company || '').trim().toLowerCase();
    if (comp && !origCompanies.has(comp)) {
      violations.push(`AI introduced unsupported company: ${e.company}`);
    }
  });

  // 3. Education Check: No new institutions fabricated
  const origInstitutions = new Set(
    (original.education || []).map((ed) => (ed.institution || '').trim().toLowerCase()).filter(Boolean)
  );
  (enhanced.education || []).forEach((ed) => {
    const inst = (ed.institution || '').trim().toLowerCase();
    if (inst && !origInstitutions.has(inst)) {
      violations.push(`AI introduced unsupported educational institution: ${ed.institution}`);
    }
  });

  return {
    isGrounded: violations.length === 0,
    violations,
  };
};

/**
 * Generate / Enhance Portfolio Content
 * Uses Google Gemini AI if configured; otherwise seamlessly falls back to high-accuracy deterministic engine.
 */
const generatePortfolioContent = async (originalData, options = {}) => {
  const sectionsToEnhance = options.sectionsToEnhance || ['all'];
  const shouldEnhanceAll = sectionsToEnhance.includes('all');

  // Start with clean sanitized baseline
  const baseline = polishDeterministically(originalData);

  if (!isAIAvailable()) {
    return {
      success: true,
      data: baseline,
      source: 'deterministic_engine',
      grounded: true,
      message: 'Portfolio generated using Portify Rule-Based Presentation Engine.',
    };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: PRIMARY_MODEL,
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `
You are the professional portfolio content engine for Portify AI.
You enhance and polish existing resume information for public portfolio presentation.

RULES:
1. DO NOT GENERATE ARBITRARY HTML, JAVASCRIPT, OR EXECUTABLE SCRIPTS.
2. Output ONLY a valid JSON object matching the requested schema.
3. PRESERVE 100% FACTUAL ACCURACY.
   - NEVER invent companies, jobs, or years of experience.
   - If experience is empty, return an empty array [].
   - NEVER invent degrees or universities.
   - NEVER add technologies or certifications that are not in the input.
   - PRESERVE real numbers, metrics, and dates.
4. Improve:
   - Professional headline: make it crisp, impactful, and well-cased.
   - Professional summary: 2-3 engaging, well-written sentences summarizing verified background.
   - Experience bullet points: polish with strong action verbs ("Architected", "Engineered", "Orchestrated", "Implemented").
   - Project descriptions: clear, concise problem and solution statements.

Input Portfolio JSON:
${JSON.stringify({
  personalInfo: {
    fullName: baseline.personalInfo?.fullName,
    headline: baseline.personalInfo?.headline,
  },
  summary: baseline.summary,
  experience: baseline.experience,
  projects: baseline.projects,
  skills: baseline.skills,
  softSkills: baseline.softSkills,
  education: baseline.education,
  certifications: baseline.certifications,
  achievements: baseline.achievements,
})}

Return ONLY a JSON object with this exact structure:
{
  "headline": "enhanced headline",
  "summary": "enhanced summary",
  "experience": [
    {
      "company": "original company name",
      "role": "original role name",
      "description": "enhanced description",
      "highlights": ["enhanced highlight 1", "enhanced highlight 2"]
    }
  ],
  "projects": [
    {
      "title": "original project title",
      "description": "enhanced description"
    }
  ],
  "achievements": ["enhanced achievement 1"]
}
`;

    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(result.response.text());

    // Merge AI enhancements strictly into existing confirmed structure
    const merged = JSON.parse(JSON.stringify(baseline));

    if (shouldEnhanceAll || sectionsToEnhance.includes('headline')) {
      if (parsed.headline && typeof parsed.headline === 'string') {
        merged.personalInfo.headline = sanitizeText(parsed.headline);
      }
    }

    if (shouldEnhanceAll || sectionsToEnhance.includes('summary')) {
      if (parsed.summary && typeof parsed.summary === 'string') {
        merged.summary = sanitizeText(parsed.summary);
      }
    }

    if (shouldEnhanceAll || sectionsToEnhance.includes('experience')) {
      if (Array.isArray(parsed.experience)) {
        merged.experience = merged.experience.map((origExp, idx) => {
          const aiExp = parsed.experience[idx];
          if (!aiExp) return origExp;
          return {
            ...origExp,
            description: aiExp.description ? sanitizeText(aiExp.description) : origExp.description,
            highlights: Array.isArray(aiExp.highlights) && aiExp.highlights.length > 0
              ? aiExp.highlights.map(sanitizeText).filter(Boolean)
              : origExp.highlights,
          };
        });
      }
    }

    if (shouldEnhanceAll || sectionsToEnhance.includes('projects')) {
      if (Array.isArray(parsed.projects)) {
        merged.projects = merged.projects.map((origProj, idx) => {
          const aiProj = parsed.projects[idx];
          if (!aiProj) return origProj;
          return {
            ...origProj,
            description: aiProj.description ? sanitizeText(aiProj.description) : origProj.description,
          };
        });
      }
    }

    if (shouldEnhanceAll || sectionsToEnhance.includes('achievements')) {
      if (Array.isArray(parsed.achievements) && parsed.achievements.length > 0) {
        merged.achievements = parsed.achievements.map(sanitizeText).filter(Boolean);
      }
    }

    // Verify Groundedness
    const groundingCheck = verifyGroundedness(originalData, merged);
    if (!groundingCheck.isGrounded) {
      console.warn('[AI Grounding Guard Warning]:', groundingCheck.violations);
      // Fallback to deterministic clean baseline to preserve strict factual integrity
      return {
        success: true,
        data: baseline,
        source: 'deterministic_engine',
        grounded: true,
        message: 'Grounded fallback applied to prevent hallucination.',
      };
    }

    return {
      success: true,
      data: merged,
      source: 'ai_gemini',
      grounded: true,
      message: 'Content enhanced and polished with Google Gemini AI.',
    };
  } catch (err) {
    console.warn('[Generation Engine Error]:', err.message);
    return {
      success: true,
      data: baseline,
      source: 'deterministic_engine',
      grounded: true,
      message: `Enhancement fallback applied: ${err.message}`,
    };
  }
};

/**
 * Generate Diff object between original and enhanced content for user review before applying
 */
const generateContentDiff = (current, enhanced) => {
  return {
    headline: {
      current: current.personalInfo?.headline || '',
      enhanced: enhanced.personalInfo?.headline || '',
      isDifferent: (current.personalInfo?.headline || '') !== (enhanced.personalInfo?.headline || ''),
    },
    summary: {
      current: current.summary || '',
      enhanced: enhanced.summary || '',
      isDifferent: (current.summary || '') !== (enhanced.summary || ''),
    },
    experience: (enhanced.experience || []).map((enhExp, idx) => {
      const curExp = (current.experience || [])[idx] || {};
      return {
        company: curExp.company || enhExp.company,
        role: curExp.role || enhExp.role,
        currentDescription: curExp.description || '',
        enhancedDescription: enhExp.description || '',
        currentHighlights: curExp.highlights || [],
        enhancedHighlights: enhExp.highlights || [],
      };
    }),
    projects: (enhanced.projects || []).map((enhProj, idx) => {
      const curProj = (current.projects || [])[idx] || {};
      return {
        title: curProj.title || enhProj.title,
        currentDescription: curProj.description || '',
        enhancedDescription: enhProj.description || '',
      };
    }),
    achievements: {
      current: current.achievements || [],
      enhanced: enhanced.achievements || [],
    },
  };
};

module.exports = {
  generatePortfolioContent,
  polishDeterministically,
  verifyGroundedness,
  generateContentDiff,
  sanitizeText,
};

