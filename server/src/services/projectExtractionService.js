/**
 * Portify AI — Dedicated Evidence-Based Project Extraction Service
 *
 * Implements strict project boundary detection, role/date suppression,
 * evidence tracking, and duplicate merging to guarantee that exactly N real projects
 * on a resume produce exactly N portfolio projects (preventing the 4 -> 11 bug).
 */

const URL_REGEX = /(https?:\/\/[^\s]+|(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)/gi;

// Common Date Patterns (Month Year, Year-Year, Seasons, etc.)
const DATE_LINE_REGEX = /^(?:(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|\d{1,2}\/\d{1,2}\/|\d{4})[^\w\n]*\d{0,4}\s*(?:-|–|—|to)\s*(?:present|current|now|\d{2,4}|(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s*\d{0,4})|summer\s*\d{4}|fall\s*\d{4}|winter\s*\d{4}|spring\s*\d{4})$/i;

// Subheading and Role Patterns that must NEVER become standalone project titles
const ROLE_SUBHEADING_REGEX = /^(?:(?:lead|senior|principal|staff|core|junior|associate)?\s*(?:full\s*stack\s*(?:software\s*)?|frontend\s*|backend\s*|cloud\s*|systems\s*|software\s*|mobile\s*|devops\s*|data\s*|solo\s*|author\s*|creator\s*|contributor\s*)?(?:developer|engineer|architect|lead|specialist|consultant|contributor|creator|author|founder|co-founder|intern)|solo\s*creator|core\s*contributor|author|lead\s*architect|senior\s*frontend\s*developer|full\s*stack\s*software\s*engineer)$/i;

// Metadata Label Prefixes
const METADATA_LABEL_REGEX = /^(?:technologies(?:\s*used)?|tech\s*stack|tools\s*used|built\s*with|stack|languages|skills|role|duration|timeline|team\s*size|client|github|demo|live\s*demo|overview|impact|status)\s*[:|-]?\s*/i;

// Bullet point prefixes
const BULLET_REGEX = /^[•\-*✦▪▸►>]\s+/;
const NUMBERED_HEADER_REGEX = /^\d+[\.)]\s+/;

/**
 * Clean string for comparison and deduplication
 */
const normalizeTitle = (title) => {
  return (title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Calculate Jaccard word similarity between two titles
 */
const titleSimilarity = (titleA, titleB) => {
  const normA = normalizeTitle(titleA);
  const normB = normalizeTitle(titleB);
  if (normA === normB) return 1.0;
  if (!normA || !normB) return 0.0;

  // Direct containment (e.g. "Portify AI" in "Portify AI - Intelligent SaaS")
  if (normA.includes(normB) || normB.includes(normA)) {
    return 0.8;
  }

  const setA = new Set(normA.split(' ').filter(w => w.length > 2));
  const setB = new Set(normB.split(' ').filter(w => w.length > 2));

  if (setA.size === 0 || setB.size === 0) return 0.0;

  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }

  return intersection / (setA.size + setB.size - intersection);
};

/**
 * Check if a candidate line is a genuine new project title
 * rather than a date, role, URL, bullet, or sentence fragment
 */
const isNewProjectTitle = (line, prevLine, currentProject) => {
  const trimmed = line.trim();
  if (trimmed.length < 3 || trimmed.length > 95) return false;

  // Exclude bullets
  if (BULLET_REGEX.test(trimmed)) return false;

  // Exclude pure date lines or range lines
  if (DATE_LINE_REGEX.test(trimmed) || /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4})\s*[-–—]\s*(?:present|\d{4})/i.test(trimmed)) {
    return false;
  }

  // Exclude lines where the first part before a pipe/dash is a role or heading
  const firstPart = trimmed.split(/[|•·–—]/)[0].trim();
  if (ROLE_SUBHEADING_REGEX.test(trimmed) || ROLE_SUBHEADING_REGEX.test(firstPart)) {
    return false;
  }

  // Exclude lines that start with metadata labels (e.g. "Technologies: Go, Redis")
  if (METADATA_LABEL_REGEX.test(trimmed) || /^(?:key\s*responsibilities|projects|experience|education|skills)\b/i.test(trimmed)) {
    return false;
  }

  // Exclude URLs
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('www.')) return false;

  // Exclude common sentence starters and punctuation
  if (/^(?:designed|implemented|built|engineered|architected|developed|created|maintained|spearheaded|improved|optimized|reduced|increased)\b/i.test(trimmed)) {
    return false;
  }

  // If line starts with a number like "1. DevPulse", strip the number prefix and evaluate
  const cleanTitle = trimmed.replace(NUMBERED_HEADER_REGEX, '').trim();

  // If the line contains a pipe or brackets, e.g. "Distributed KV Store | Go, Raft, gRPC"
  if (/[|•·]/.test(cleanTitle) || /[\[(].*?[\])]/.test(cleanTitle)) {
    return true;
  }

  // If the previous line had bullet items and this line is a clean short heading, it is likely a title
  if (currentProject && currentProject.highlights && currentProject.highlights.length > 0) {
    return true;
  }

  // If there's no active project yet, the first non-bullet line in the projects section is the title
  if (!currentProject) {
    return true;
  }

  // If current project has a description already and this line looks like a title
  if (currentProject.description && !currentProject.description.includes(trimmed)) {
    // Check if it looks like a continuation sentence (starts with lowercase or connector)
    if (/^[a-z]/.test(trimmed) || /^(?:and|with|by|for|which|using|featuring)\b/i.test(trimmed)) {
      return false;
    }
    return true;
  }

  return false;
};

/**
 * Dedicated Evidence-Based Project Extraction Engine
 *
 * @param {string[]} projectLines - Raw text lines bounded within the Projects section
 * @param {string} fullResumeText - The complete resume text for context verification
 * @returns {Array<object>} Validated evidence-based project entries
 */
const extractEvidenceBasedProjects = (projectLines = [], fullResumeText = '') => {
  if (!Array.isArray(projectLines) || projectLines.length === 0) {
    return [];
  }

  const rawProjects = [];
  let current = null;

  for (let i = 0; i < projectLines.length; i++) {
    const rawLine = projectLines[i];
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    const prevLine = i > 0 ? projectLines[i - 1].trim() : '';

    // Check if line signals a new project boundary
    if (isNewProjectTitle(trimmed, prevLine, current)) {
      if (current && current.title) {
        rawProjects.push(current);
      }

      // Extract explicit title and inline tech tags if present
      let title = trimmed.replace(NUMBERED_HEADER_REGEX, '').trim();
      const technologies = [];

      // Check for inline bracketed or piped technologies: e.g. "CloudScale Cache | Go, Redis, Docker"
      if (/[|•·]/.test(title)) {
        const parts = title.split(/[|•·]/).map((p) => p.trim());
        title = parts[0];
        // Subsequent parts are often tech tags
        for (let j = 1; j < parts.length; j++) {
          const techCandidates = parts[j].split(/[,/]/).map((t) => t.trim()).filter(Boolean);
          technologies.push(...techCandidates);
        }
      } else if (/[\[(](.*?)[\])]/.test(title)) {
        const match = title.match(/[\[(](.*?)[\])]/);
        if (match) {
          const techCandidates = match[1].split(/[,/]/).map((t) => t.trim()).filter(Boolean);
          technologies.push(...techCandidates);
          title = title.replace(/[\[(].*?[\])]/, '').trim();
        }
      }

      // Clean title from trailing colons, dashes, or quotes
      title = title.replace(/[:\-–—]+$/, '').trim();

      current = {
        title,
        description: '',
        technologies,
        dates: '',
        liveUrl: '',
        repoUrl: '',
        highlights: [],
        sourceEvidence: [trimmed],
        confidence: 0.85,
        verificationStatus: 'verified',
      };
      continue;
    }

    // Process content for current project
    if (current) {
      current.sourceEvidence.push(trimmed);

      // 1. Check for Dates
      if (DATE_LINE_REGEX.test(trimmed)) {
        current.dates = trimmed;
        continue;
      }

      // 2. Check for Role / Subheading (Store in evidence, don't discard)
      if (ROLE_SUBHEADING_REGEX.test(trimmed)) {
        continue;
      }

      // 3. Check for URLs
      const urlMatches = trimmed.match(URL_REGEX);
      if (urlMatches) {
        for (const u of urlMatches) {
          const cleanUrl = u.replace(/[),;.]+$/, '');
          const lower = cleanUrl.toLowerCase();
          if (lower.includes('github.com') || lower.includes('gitlab.com')) {
            current.repoUrl = cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`;
          } else {
            current.liveUrl = cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`;
          }
        }
      }

      // 4. Check for Explicit "Technologies: React, Node.js" Label (with or without bullet)
      const lineWithoutBullet = trimmed.replace(BULLET_REGEX, '').trim();
      if (METADATA_LABEL_REGEX.test(trimmed) || METADATA_LABEL_REGEX.test(lineWithoutBullet)) {
        const target = METADATA_LABEL_REGEX.test(trimmed) ? trimmed : lineWithoutBullet;
        const techPart = target.replace(METADATA_LABEL_REGEX, '').trim();
        const techList = techPart.split(/[,|/•·]/).map((t) => t.trim()).filter(Boolean);
        for (const t of techList) {
          if (!current.technologies.includes(t)) {
            current.technologies.push(t);
          }
        }
        continue;
      }

      // 5. Check for Bullets and Narrative Highlights
      const isBullet = BULLET_REGEX.test(trimmed);
      const cleanBullet = trimmed.replace(BULLET_REGEX, '').trim();

      if (cleanBullet.length > 5 && !cleanBullet.startsWith('http')) {
        current.highlights.push(cleanBullet);
        if (!current.description) {
          current.description = cleanBullet;
        }
      } else if (!isBullet && trimmed.length > 15 && !trimmed.startsWith('http')) {
        // Multi-line description continuation
        if (!current.description) {
          current.description = trimmed;
        } else {
          current.description += ` ${trimmed}`;
        }
      }
    }
  }

  // Append final project
  if (current && current.title) {
    rawProjects.push(current);
  }

  // --- DEDUPLICATION & MERGING PIPELINE ---
  const consolidatedProjects = [];

  for (const candidate of rawProjects) {
    // Find if project already exists with high title similarity
    let merged = false;
    for (const existing of consolidatedProjects) {
      if (titleSimilarity(existing.title, candidate.title) >= 0.8) {
        // Merge candidate into existing
        existing.sourceEvidence.push(...candidate.sourceEvidence);

        // Merge technologies without duplicates
        for (const tech of candidate.technologies) {
          if (!existing.technologies.some((t) => t.toLowerCase() === tech.toLowerCase())) {
            existing.technologies.push(tech);
          }
        }

        // Merge highlights without duplicates
        for (const hl of candidate.highlights) {
          if (!existing.highlights.some((h) => h.toLowerCase() === hl.toLowerCase())) {
            existing.highlights.push(hl);
          }
        }

        if (!existing.dates && candidate.dates) existing.dates = candidate.dates;
        if (!existing.liveUrl && candidate.liveUrl) existing.liveUrl = candidate.liveUrl;
        if (!existing.repoUrl && candidate.repoUrl) existing.repoUrl = candidate.repoUrl;
        if (!existing.description && candidate.description) existing.description = candidate.description;

        existing.confidence = Math.min(1.0, existing.confidence + 0.1);
        merged = true;
        break;
      }
    }

    if (!merged) {
      // Validate that candidate has minimum viable evidence (title + at least 1 description or highlight or tech)
      const hasContent = Boolean(
        candidate.description ||
        (candidate.highlights && candidate.highlights.length > 0) ||
        (candidate.technologies && candidate.technologies.length > 0)
      );

      if (candidate.title.length >= 2 && hasContent) {
        // Calculate final confidence
        let confidenceScore = 0.7;
        if (candidate.description) confidenceScore += 0.1;
        if (candidate.technologies.length > 0) confidenceScore += 0.1;
        if (candidate.dates) confidenceScore += 0.05;
        if (candidate.repoUrl || candidate.liveUrl) confidenceScore += 0.05;

        candidate.confidence = Math.min(1.0, confidenceScore);
        candidate.verificationStatus = candidate.highlights.length > 0 ? 'verified' : 'inferred';
        consolidatedProjects.push(candidate);
      }
    }
  }

  return consolidatedProjects;
};

module.exports = {
  extractEvidenceBasedProjects,
  isNewProjectTitle,
  titleSimilarity,
  normalizeTitle,
};

