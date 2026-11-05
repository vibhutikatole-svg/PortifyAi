/**
 * Portify AI — Deterministic NLP & Regex Resume Parser Engine
 * Extracts structured portfolio data directly from resume text without hallucinations.
 */

const { validateResumeData } = require('../validators/resumeSchema');
const { extractEvidenceBasedProjects } = require('./projectExtractionService');

// Regex patterns
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_REGEX = /(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?|(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/;
const GITHUB_REGEX = /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i;
const LINKEDIN_REGEX = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i;
const TWITTER_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:twitter|x)\.com\/([a-zA-Z0-9_]+)/i;
const URL_REGEX = /(https?:\/\/[^\s]+)/gi;

// Common tech skills lookup list for categorization
const SKILL_TAXONOMY = {
  'Languages': [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'C', 'Go', 'Golang',
    'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'Dart', 'R', 'Scala', 'SQL', 'HTML', 'HTML5',
    'CSS', 'CSS3', 'Sass', 'SCSS', 'Bash', 'Shell', 'PowerShell'
  ],
  'Frameworks & Libraries': [
    'React', 'React.js', 'Next.js', 'Vue', 'Vue.js', 'Nuxt.js', 'Angular', 'Svelte',
    'Node.js', 'Express', 'Express.js', 'Nest.js', 'Django', 'Flask', 'FastAPI',
    'Spring Boot', 'Laravel', 'Ruby on Rails', 'ASP.NET', 'Tailwind CSS', 'Bootstrap',
    'Material-UI', 'MUI', 'Chakra UI', 'Redux', 'Zustand', 'GraphQL', 'Prisma'
  ],
  'Databases & Cloud': [
    'MongoDB', 'PostgreSQL', 'Postgres', 'MySQL', 'SQLite', 'Redis', 'Cassandra',
    'DynamoDB', 'Firebase', 'Supabase', 'AWS', 'Amazon Web Services', 'GCP',
    'Google Cloud', 'Azure', 'Microsoft Azure', 'Docker', 'Kubernetes', 'K8s',
    'Vercel', 'Netlify', 'Heroku', 'DigitalOcean'
  ],
  'Tools & Methods': [
    'Git', 'GitHub', 'GitLab', 'Bitbucket', 'CI/CD', 'GitHub Actions', 'Jenkins',
    'Postman', 'Figma', 'Jest', 'Vitest', 'Cypress', 'Playwright', 'Webpack',
    'Vite', 'Babel', 'Linux', 'REST APIs', 'Agile', 'Scrum', 'Jira', 'Trello'
  ]
};

const SOFT_SKILLS_TAXONOMY = [
  'Leadership', 'Team Management', 'Mentoring', 'Communication', 'Problem Solving',
  'Strategic Planning', 'Agile / Scrum', 'Collaboration', 'Critical Thinking',
  'Adaptability', 'Time Management', 'Conflict Resolution', 'Decision Making',
  'Emotional Intelligence', 'Stakeholder Management', 'Public Speaking'
];

// Section headers detector regex
const SECTION_HEADERS = {
  summary: /^(?:summary|professional summary|executive summary|about me|profile|objective|career objective)$/i,
  experience: /^(?:work experience|experience|professional experience|employment history|work history)$/i,
  education: /^(?:education|academic background|academics|educational qualifications)$/i,
  skills: /^(?:skills|technical skills|skills & expertise|technologies|tools)$/i,
  softSkills: /^(?:soft skills|interpersonal skills|core competencies|leadership & soft skills)$/i,
  projects: /^(?:projects|personal projects|key projects|featured projects|technical projects|academic projects)$/i,
  certifications: /^(?:certifications|certificates|licenses & certifications|licenses)$/i,
  achievements: /^(?:achievements|key achievements|awards|honors|awards & honors|honors & awards|accomplishments)$/i,
  publications: /^(?:publications|selected publications|papers|research papers)$/i,
  volunteering: /^(?:volunteering|volunteer experience|community service|leadership & community)$/i,
  languages: /^(?:languages|language proficiency|spoken languages)$/i,
  interests: /^(?:interests|hobbies|extracurricular activities|activities)$/i,
  patents: /^(?:patents|intellectual property)$/i,
};

/**
 * Main Deterministic Extraction Function
 * @param {string} rawText - Unstructured text from PDF or DOCX
 * @returns {object} Structured portfolio-compatible JSON
 */
const parseResumeDeterministically = (rawText) => {
  if (!rawText || typeof rawText !== 'string') {
    return createEmptyPortfolioData();
  }

  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // 1. Personal Info Extraction
  const personalInfo = extractPersonalInfo(lines, rawText);

  // 2. Section Partitioning
  const sections = partitionSections(lines);

  // 3. Extract Summary
  const summary = extractSummary(sections.summary, lines);

  // 4. Extract Skills
  const skills = extractSkills(sections.skills, rawText);

  // 4.1 Extract Soft Skills
  const softSkills = extractSoftSkills(sections.softSkills, rawText);

  // 5. Extract Experience
  const experience = extractExperience(sections.experience);

  // 6. Extract Education
  const education = extractEducation(sections.education);

  // 7. Extract Projects
  const projects = extractProjects(sections.projects, rawText);

  // 8. Extract Certifications
  const certifications = extractCertifications(sections.certifications);

  // 9. Extract Achievements
  const achievements = extractAchievements(sections.achievements);

  const rawParsed = {
    extractionSource: 'deterministic_engine',
    title: personalInfo.headline ? `${personalInfo.fullName || 'Professional'} — ${personalInfo.headline}` : 'Professional Portfolio',
    personalInfo,
    summary,
    experience,
    education,
    skills,
    softSkills,
    projects,
    certifications,
    achievements,
    customSections: [],
  };

  const validation = validateResumeData(rawParsed);
  return {
    extractionSource: 'deterministic_engine',
    ...validation.data,
  };
};

function extractPersonalInfo(lines, fullText) {
  const info = {
    fullName: '',
    headline: '',
    email: '',
    phone: '',
    location: '',
    avatarUrl: '',
    website: '',
    github: '',
    linkedin: '',
    twitter: '',
  };

  // Find Email
  const emailMatch = fullText.match(EMAIL_REGEX);
  if (emailMatch) {
    info.email = emailMatch[0].trim();
  }

  // Find Phone
  const phoneMatch = fullText.match(PHONE_REGEX);
  if (phoneMatch) {
    info.phone = phoneMatch[0].trim();
  }

  // Find Social Links
  const ghMatch = fullText.match(GITHUB_REGEX);
  if (ghMatch) {
    info.github = ghMatch[0].startsWith('http') ? ghMatch[0] : `https://${ghMatch[0]}`;
  }

  const liMatch = fullText.match(LINKEDIN_REGEX);
  if (liMatch) {
    info.linkedin = liMatch[0].startsWith('http') ? liMatch[0] : `https://${liMatch[0]}`;
  }

  const twMatch = fullText.match(TWITTER_REGEX);
  if (twMatch) {
    info.twitter = twMatch[0].startsWith('http') ? twMatch[0] : `https://${twMatch[0]}`;
  }

  // Find website (excluding social media links and standard emails)
  const urls = fullText.match(URL_REGEX) || [];
  for (const url of urls) {
    if (!url.includes('linkedin.com') && !url.includes('github.com') && !url.includes('twitter.com') && !url.includes('x.com')) {
      info.website = url.trim();
      break;
    }
  }

  // Find Full Name: usually the first non-header, non-contact line of the resume
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i];
    // Skip if line has email, phone, or matches common header keywords
    if (
      EMAIL_REGEX.test(line) ||
      PHONE_REGEX.test(line) ||
      /curriculum vitae|resume|page \d|contact/i.test(line)
    ) {
      continue;
    }

    // Name usually has 2-4 words, letters only with optional period
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 4 && /^[a-zA-Z\s.-]+$/.test(line)) {
      info.fullName = line;

      // Check next line for professional headline
      if (lines[i + 1] && !EMAIL_REGEX.test(lines[i + 1]) && !PHONE_REGEX.test(lines[i + 1])) {
        const next = lines[i + 1];
        if (
          /developer|engineer|designer|architect|manager|consultant|analyst|specialist|lead|founder|scientist|student/i.test(
            next
          ) &&
          next.length < 80
        ) {
          info.headline = next;
        }
      }
      break;
    }
  }

  // Fallback headline if not found
  if (!info.headline) {
    const headlineKeywords = [
      'Full Stack Developer', 'Software Engineer', 'Frontend Developer', 'Backend Developer',
      'DevOps Engineer', 'Data Scientist', 'Machine Learning Engineer', 'UI/UX Designer',
      'Mobile App Developer', 'Cloud Architect', 'Product Manager'
    ];
    for (const kw of headlineKeywords) {
      if (new RegExp(`\\b${kw}\\b`, 'i').test(fullText)) {
        info.headline = kw;
        break;
      }
    }
  }

  // Location detection: Check top 8 lines for location patterns
  const stateCodeRegex = /\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|USA|UK|India|Canada|Australia|Germany|France)\b/i;
  const nonLocationWords = /react|node|javascript|developer|engineer|designer|manager|experience|skills|summary|education|university|github|linkedin|twitter/i;

  for (let i = 0; i < Math.min(lines.length, 8); i++) {
    const rawLine = lines[i];
    // Split line by separators like |, •, bullet
    const parts = rawLine.split(/[|•·\t]/).map((p) => p.trim());
    for (const part of parts) {
      if (
        part.length >= 4 &&
        part.length < 50 &&
        !EMAIL_REGEX.test(part) &&
        !PHONE_REGEX.test(part) &&
        !URL_REGEX.test(part) &&
        !nonLocationWords.test(part) &&
        (part.includes(',') || stateCodeRegex.test(part))
      ) {
        const cleanLoc = part.replace(/^[📍\s]+/, '').trim();
        if (cleanLoc.length > 2 && /^[a-zA-Z\s,.-]+$/.test(cleanLoc)) {
          info.location = cleanLoc;
          break;
        }
      }
    }
    if (info.location) break;
  }

  return info;
}

function partitionSections(lines) {
  const sections = {
    summary: [],
    experience: [],
    education: [],
    skills: [],
    softSkills: [],
    projects: [],
    certifications: [],
    achievements: [],
    publications: [],
    volunteering: [],
    languages: [],
    interests: [],
    patents: [],
  };

  let currentSection = null;

  for (const line of lines) {
    const cleanLine = line.replace(/[:\-–—_#*]+$/, '').trim();
    let foundSection = null;

    for (const [key, regex] of Object.entries(SECTION_HEADERS)) {
      if (regex.test(cleanLine)) {
        foundSection = key;
        break;
      }
    }

    if (foundSection) {
      currentSection = foundSection;
      continue;
    }

    if (currentSection) {
      sections[currentSection].push(line);
    }
  }

  return sections;
}

function extractSummary(summaryLines, allLines) {
  if (summaryLines.length > 0) {
    return summaryLines.join(' ').replace(/\s+/g, ' ').trim();
  }
  // If no explicit summary section, inspect lines 2 to 6 for a paragraph
  const candidates = [];
  for (let i = 2; i < Math.min(allLines.length, 8); i++) {
    const line = allLines[i];
    if (
      line.length > 50 &&
      !EMAIL_REGEX.test(line) &&
      !PHONE_REGEX.test(line) &&
      !/skills|education|experience|projects/i.test(line)
    ) {
      candidates.push(line);
    }
  }
  return candidates.join(' ').trim();
}

function extractSkills(skillsLines, rawText) {
  const skillsText = skillsLines.length > 0 ? skillsLines.join('\n') : rawText;
  const categoriesMap = {
    'Languages': new Set(),
    'Frameworks & Libraries': new Set(),
    'Databases & Cloud': new Set(),
    'Tools & Methods': new Set(),
  };

  // Match known taxonomy
  for (const [category, items] of Object.entries(SKILL_TAXONOMY)) {
    for (const item of items) {
      // Escape for regex
      const escaped = item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(^|[^a-zA-Z0-9#+])${escaped}([^a-zA-Z0-9#+]|$)`, 'i');
      if (regex.test(skillsText)) {
        categoriesMap[category].add(item);
      }
    }
  }

  const result = [];
  for (const [category, itemsSet] of Object.entries(categoriesMap)) {
    if (itemsSet.size > 0) {
      result.push({
        category,
        items: Array.from(itemsSet),
      });
    }
  }

  // Fallback if no taxonomy matched
  if (result.length === 0 && skillsLines.length > 0) {
    const rawSkills = skillsLines
      .join(',')
      .split(/[,•|•;]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 1 && s.length < 30);
    if (rawSkills.length > 0) {
      result.push({
        category: 'Technical Skills',
        items: Array.from(new Set(rawSkills)),
      });
    }
  }

  return result;
}

function extractExperience(expLines) {
  if (!expLines || expLines.length === 0) return [];

  const items = [];
  let currentItem = null;

  const datePattern = /(?:(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*)?(?:19|20)\d{2}\s*[-–—to]+\s*(?:(?:(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*)?(?:19|20)\d{2}|Present|Current)/i;
  const roleKeywords = /developer|engineer|designer|manager|lead|architect|intern|specialist|consultant|officer|director|analyst|administrator/i;

  for (let i = 0; i < expLines.length; i++) {
    const line = expLines[i];
    const isBullet = /^([•\-*–—]|\d+\.)/.test(line);
    const dateMatch = line.match(datePattern);

    // If currentItem exists without dates and this line is just a date line:
    if (currentItem && !currentItem.startDate && dateMatch && !roleKeywords.test(line)) {
      const dates = dateMatch[0].trim();
      currentItem.startDate = dates.split(/[-–—to]+/i)[0]?.trim() || '';
      currentItem.endDate = dates.split(/[-–—to]+/i)[1]?.trim() || (dates.toLowerCase().includes('present') ? 'Present' : '');
      currentItem.current = dates.toLowerCase().includes('present') || dates.toLowerCase().includes('current');
      continue;
    }

    // If currentItem exists without location and line looks like a short city/state:
    if (
      currentItem &&
      !currentItem.location &&
      !isBullet &&
      line.length < 40 &&
      line.includes(',') &&
      !roleKeywords.test(line) &&
      !dateMatch
    ) {
      currentItem.location = line.trim();
      continue;
    }

    // New role / company line:
    if (!isBullet && (roleKeywords.test(line) || (dateMatch && (line.includes('|') || line.includes(' - ') || line.includes(' at '))))) {
      if (currentItem && (currentItem.role || currentItem.company)) {
        items.push(currentItem);
      }

      let dates = dateMatch ? dateMatch[0].trim() : '';
      let remainingText = line.replace(datePattern, '').trim();

      currentItem = {
        role: remainingText || 'Software Professional',
        company: '',
        location: '',
        startDate: dates ? dates.split(/[-–—to]+/i)[0]?.trim() : '',
        endDate: dates ? dates.split(/[-–—to]+/i)[1]?.trim() || (dates.toLowerCase().includes('present') ? 'Present' : '') : '',
        current: dates ? dates.toLowerCase().includes('present') || dates.toLowerCase().includes('current') : false,
        description: '',
        highlights: [],
      };

      if (remainingText.includes('|') || remainingText.includes(' - ') || remainingText.includes(' at ')) {
        const parts = remainingText.split(/\s*\|\s*|\s+-\s+|\s+at\s+/i);
        currentItem.role = parts[0]?.trim();
        currentItem.company = parts[1]?.trim();
      }
    } else if (currentItem) {
      const cleanBullet = line.replace(/^([•\-*–—]|\d+\.)\s*/, '').trim();
      if (cleanBullet.length > 5) {
        currentItem.highlights.push(cleanBullet);
      }
    }
  }

  if (currentItem && (currentItem.role || currentItem.company)) {
    items.push(currentItem);
  }

  return items;
}

function extractEducation(eduLines) {
  if (!eduLines || eduLines.length === 0) return [];

  const items = [];
  let currentItem = null;

  const degreeKeywords = /bachelor|master|ph\.?d|b\.?s|m\.?s|b\.?tech|m\.?tech|associate|diploma|degree/i;
  const institutionKeywords = /university|college|institute|school|academy/i;

  for (const line of eduLines) {
    const isBullet = /^([•\-*–—]|\d+\.)/.test(line);

    // If current item needs institution and this line is an institution:
    if (currentItem && !currentItem.institution && institutionKeywords.test(line)) {
      currentItem.institution = line.replace(/[:,-].*$/, '').trim();
      continue;
    }

    // If current item needs degree and this line is a degree:
    if (currentItem && !currentItem.degree && degreeKeywords.test(line)) {
      currentItem.degree = line.trim();
      continue;
    }

    // If current item needs dates and this line is a year:
    const yearMatch = line.match(/\b(19|20)\d{2}\b/);
    if (currentItem && !currentItem.graduationDate && yearMatch && line.length < 30) {
      currentItem.graduationDate = yearMatch[0];
      continue;
    }

    // Check GPA
    const gpaMatch = line.match(/GPA:?\s*([0-4]\.\d{1,2})/i);
    if (currentItem && gpaMatch) {
      currentItem.gpa = gpaMatch[1];
      continue;
    }

    // Start a new education item if line is a degree or institution
    if (!isBullet && (degreeKeywords.test(line) || institutionKeywords.test(line))) {
      if (currentItem && (currentItem.degree || currentItem.institution)) {
        items.push(currentItem);
      }

      currentItem = {
        institution: '',
        degree: '',
        fieldOfStudy: '',
        graduationDate: '',
        gpa: '',
        highlights: [],
      };

      if (institutionKeywords.test(line)) {
        currentItem.institution = line.replace(/[:,-].*$/, '').trim();
      } else {
        currentItem.degree = line.trim();
      }

      if (yearMatch) {
        currentItem.graduationDate = yearMatch[0];
      }
    } else if (currentItem) {
      const cleanBullet = line.replace(/^([•\-*–—]|\d+\.)\s*/, '').trim();
      if (cleanBullet.length > 5) {
        currentItem.highlights.push(cleanBullet);
      }
    }
  }

  if (currentItem && (currentItem.degree || currentItem.institution)) {
    items.push(currentItem);
  }

  return items;
}

function extractProjects(projLines, rawText) {
  return extractEvidenceBasedProjects(projLines, rawText);
}

function extractCertifications(certLines) {
  if (!certLines || certLines.length === 0) return [];

  return certLines
    .filter((l) => l.trim().length > 3)
    .map((line) => {
      const clean = line.replace(/^[•\-*]\s*/, '').trim();
      return {
        name: clean,
        issuer: '',
        issueDate: '',
        credentialUrl: '',
      };
    });
}

function extractSoftSkills(softSkillsLines, rawText) {
  const found = new Set();

  if (softSkillsLines && softSkillsLines.length > 0) {
    for (const line of softSkillsLines) {
      const items = line.split(/[,•|·;]/).map((s) => s.replace(/^[•\-*]\s*/, '').trim());
      for (const item of items) {
        if (item.length >= 3 && item.length <= 40) {
          found.add(item);
        }
      }
    }
  }

  // Also check for taxonomy items in text
  for (const skill of SOFT_SKILLS_TAXONOMY) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(rawText)) {
      found.add(skill);
    }
  }

  return Array.from(found);
}

function extractAchievements(achievementsLines) {
  if (!achievementsLines || achievementsLines.length === 0) return [];

  return achievementsLines
    .map((line) => line.replace(/^[•\-*–—\d.]\s*/, '').trim())
    .filter((line) => line.length >= 5);
}

function createEmptyPortfolioData() {
  const empty = {
    extractionSource: 'deterministic_engine',
    title: 'Professional Portfolio',
    personalInfo: {
      fullName: '',
      headline: '',
      email: '',
      phone: '',
      location: '',
      avatarUrl: '',
      website: '',
      github: '',
      linkedin: '',
      twitter: '',
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    softSkills: [],
    projects: [],
    certifications: [],
    achievements: [],
    customSections: [],
  };

  return {
    extractionSource: 'deterministic_engine',
    ...validateResumeData(empty).data,
  };
}

module.exports = {
  parseResumeDeterministically,
  createEmptyPortfolioData,
};
