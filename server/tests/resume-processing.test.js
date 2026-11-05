const request = require('supertest');
const JSZip = require('jszip');
const app = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const User = require('../src/models/User');
const { Portfolio } = require('../src/models/Portfolio');
const { extractTextFromPDF, ScannedPdfError } = require('../src/services/pdfService');
const { extractTextFromDOCX } = require('../src/services/docxService');
const { extractResumeData } = require('../src/services/aiService');
const { validateResumeData } = require('../src/validators/resumeSchema');
const { createValidPdfBuffer, createScannedPdfBuffer } = require('./pdfHelper');

/**
 * Helper to generate a genuine Microsoft Word DOCX buffer with real text
 */
async function createValidDocxBuffer(text) {
  const zip = new JSZip();
  zip.file(
    '[Content_Types].xml',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'
  );
  zip.file(
    '_rels/.rels',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'
  );
  zip.file(
    'word/document.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</w:t></w:r></w:p></w:body></w:document>`
  );
  return await zip.generateAsync({ type: 'nodebuffer' });
}

describe('Resume Processing & AI Engine Complete Test Suite', () => {
  let authToken = '';
  let userId = '';
  const testEmail = `resumetest_${Date.now()}@resume-suite.portify.dev`;

  beforeAll(async () => {
    await connectDB('mongodb://127.0.0.1:27017/portify_ai_test');
    await User.deleteMany({ email: { $regex: /@resume-suite\.portify\.dev$/ } });
    await Portfolio.deleteMany({ slug: { $regex: /^test-resume-/ } });

    // Register a test user
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Resume Reviewer',
        email: testEmail,
        password: 'Password123!',
      });
    authToken = res.body.token;
    userId = res.body.user.id;
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $regex: /@resume-suite\.portify\.dev$/ } });
    await Portfolio.deleteMany({ slug: { $regex: /^test-resume-/ } });
    await disconnectDB();
  });

  // 1. NORMAL PDF RESUME PROCESSING
  describe('Step 2: Normal PDF Resume Processing', () => {
    const resumeText = `Diana Prince
Principal Cloud Architect
diana@example.com | 555-019-2834 | Seattle, WA
github.com/dianaprince | linkedin.com/in/dianaprince

SUMMARY
Accomplished systems architect with 8+ years leading distributed systems.

TECHNICAL SKILLS
Languages: Go, Python, SQL, Bash
Cloud: Kubernetes, AWS, Docker, PostgreSQL, Terraform

WORK EXPERIENCE
Principal Engineer | CloudSphere Inc.
2020 - Present
- Spearheaded multi-region cloud migration reducing infrastructure cost by 35%.
- Designed event-driven microservices architecture processing 100M+ events daily.

EDUCATION
M.S. in Software Engineering
MIT
2016 - 2018

CERTIFICATIONS
AWS Certified Solutions Architect Professional | AWS | 2021
`;

    it('should extract real text from a valid PDF binary buffer', async () => {
      const pdfBuffer = createValidPdfBuffer(resumeText);
      const extractedText = await extractTextFromPDF(pdfBuffer);

      expect(extractedText).toBeDefined();
      expect(extractedText.length).toBeGreaterThan(100);
      expect(extractedText).toContain('Diana Prince');
      expect(extractedText).toContain('CloudSphere Inc.');
    });

    it('should successfully upload and parse normal PDF resume via API', async () => {
      const pdfBuffer = createValidPdfBuffer(resumeText);

      const res = await request(app)
        .post('/api/resume/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('resume', pdfBuffer, 'diana_prince_resume.pdf');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.portfolio).toBeDefined();
      expect(res.body.portfolio.slug).toBeDefined();
      expect(res.body.portfolio.personalInfo.fullName).toBe('Diana Prince');
      expect(res.body.portfolio.personalInfo.email).toBe('diana@example.com');
      expect(res.body.portfolio.skills.length).toBeGreaterThan(0);
      expect(res.body.portfolio.experience.length).toBeGreaterThan(0);
      expect(res.body.portfolio.education.length).toBeGreaterThan(0);
    });
  });

  // 2. DOCX RESUME PROCESSING
  describe('Step 2: Real DOCX Resume Processing', () => {
    const docxResumeText = `Nathan Drake
Staff Frontend Architect
nathan.drake@uncharted.dev | (555) 432-8765 | Boston, MA
github.com/nathandrake | linkedin.com/in/nathandrake

PROFESSIONAL SUMMARY
Passionate UI architect building enterprise design systems and high-performance WebGL applications.

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, CSS3, HTML5, Rust
Frameworks: React, Next.js, Tailwind CSS, Vue, Redux, Three.js
Tools: Webpack, Vite, Jest, Playwright, Figma, Git

WORK EXPERIENCE
Staff Frontend Engineer | AdventX Labs
Jan 2021 - Present
- Architected unified design system adopted across 14 enterprise frontend applications.
- Improved Core Web Vitals (LCP) by 60% through aggressive code-splitting and asset optimization.

Senior UI Developer | PixelCraft Studio
Jun 2017 - Dec 2020
- Built responsive client dashboards handling 2M+ monthly active users.

EDUCATION
B.S. in Computer Science
Northeastern University
2013 - 2017

PROJECTS
HyperRender 3D
https://hyperrender.app | github.com/nathandrake/hyperrender
- WebGL 3D rendering pipeline built with React and Three.js.

CERTIFICATIONS
Meta Certified Front-End Developer | Meta | 2021
`;

    it('should extract text from a real DOCX file buffer using mammoth', async () => {
      const docxBuffer = await createValidDocxBuffer(docxResumeText);
      const text = await extractTextFromDOCX(docxBuffer);

      expect(text).toBeDefined();
      expect(text.length).toBeGreaterThan(200);
      expect(text).toContain('Nathan Drake');
      expect(text).toContain('Staff Frontend Architect');
      expect(text).toContain('AdventX Labs');
    });

    it('should successfully upload and parse a genuine DOCX resume via API', async () => {
      const docxBuffer = await createValidDocxBuffer(docxResumeText);

      const res = await request(app)
        .post('/api/resume/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('resume', docxBuffer, 'nathan_resume.docx');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.portfolio.personalInfo.fullName).toBe('Nathan Drake');
      expect(res.body.portfolio.personalInfo.headline).toContain('Frontend');
      expect(res.body.portfolio.experience.length).toBe(2);
      expect(res.body.portfolio.education.length).toBe(1);
      expect(res.body.portfolio.projects.length).toBe(1);
    });
  });

  // 3. SCANNED / IMAGE-ONLY PDF DETECTION
  describe('Step 2: Scanned/Image-Only PDF Detection', () => {
    it('extractTextFromPDF should throw ScannedPdfError when PDF contains no text', async () => {
      const scannedBuffer = createScannedPdfBuffer();

      await expect(extractTextFromPDF(scannedBuffer)).rejects.toThrow(ScannedPdfError);
    });

    it('API endpoint should reject scanned PDF with HTTP 400 and isScanned: true', async () => {
      const scannedBuffer = createScannedPdfBuffer();

      const res = await request(app)
        .post('/api/resume/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('resume', scannedBuffer, 'scanned_photo_resume.pdf');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.isScanned).toBe(true);
      expect(res.body.message).toMatch(/scanned or image-only pdf detected/i);
    });
  });

  // 4. INCOMPLETE RESUME (ACCURACY RULES - NO FABRICATION)
  describe('Accuracy Rules: Incomplete Resume Handling', () => {
    const incompleteText = `
Arthur Dent
arthur.dent@earth.org | London, UK
TECHNICAL SKILLS
JavaScript, Python
`;

    it('should extract available fields without hallucinating missing experience or education', async () => {
      const docxBuffer = await createValidDocxBuffer(incompleteText);

      const res = await request(app)
        .post('/api/resume/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('resume', docxBuffer, 'incomplete_resume.docx');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.portfolio.personalInfo.fullName).toBe('Arthur Dent');
      expect(res.body.portfolio.personalInfo.email).toBe('arthur.dent@earth.org');

      // Crucial: Must NOT invent experience or degrees
      expect(res.body.portfolio.experience).toEqual([]);
      expect(res.body.portfolio.education).toEqual([]);
      expect(res.body.portfolio.projects).toEqual([]);
      expect(res.body.portfolio.certifications).toEqual([]);
    });
  });

  // 5. MALFORMED DOCUMENT HANDLING
  describe('Malformed & Corrupted Documents', () => {
    it('should reject corrupted PDF buffer with HTTP 400 without crashing', async () => {
      // Starts with %PDF- to pass signature check, but content is corrupted binary garbage
      const corruptedPdf = Buffer.from('%PDF-1.4\ncorrupted_binary_garbage_stream_invalid_xref_table_broken_data_123456');

      const res = await request(app)
        .post('/api/resume/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('resume', corruptedPdf, 'corrupted.pdf');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.isMalformed).toBe(true);
      expect(res.body.message).toMatch(/malformed or corrupted pdf file/i);
    });

    it('should reject corrupted DOCX buffer with HTTP 400', async () => {
      // Starts with PK to pass signature check, but zip is corrupt
      const corruptedDocx = Buffer.from('PK\x03\x04corrupted_broken_zip_archive_header_garbage_data');

      const res = await request(app)
        .post('/api/resume/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('resume', corruptedDocx, 'corrupted.docx');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.isMalformed).toBe(true);
      expect(res.body.message).toMatch(/malformed or corrupted docx/i);
    });
  });

  // 6. FILE CONTENT SECURITY (MAGIC BYTE SIGNATURE CHECKS)
  describe('Step 1: File Content Security & Spoofing Protection', () => {
    it('should reject spoofed file disguised as PDF with wrong signature', async () => {
      const spoofedPdf = Buffer.from('This is a plain text script without PDF magic bytes.');

      const res = await request(app)
        .post('/api/resume/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('resume', spoofedPdf, 'fake_resume.pdf');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/signature/i);
    });

    it('should reject empty 0-byte file upload', async () => {
      const emptyBuffer = Buffer.alloc(0);

      const res = await request(app)
        .post('/api/resume/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('resume', emptyBuffer, 'empty.pdf');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/empty/i);
    });
  });

  // 7. ZOD SCHEMA VALIDATION
  describe('Step 5: Zod Schema Validation for Resume Extraction', () => {
    it('validateResumeData should sanitize partial data and supply defaults', () => {
      const rawInput = {
        personalInfo: {
          fullName: 'Test Candidate',
        },
        skills: [{ category: 'Languages', items: ['Python'] }],
      };

      const result = validateResumeData(rawInput);
      expect(result.success).toBe(true);
      expect(result.data.personalInfo.fullName).toBe('Test Candidate');
      expect(result.data.personalInfo.email).toBe('');
      expect(result.data.personalInfo.phone).toBe('');
      expect(result.data.experience).toEqual([]);
      expect(result.data.education).toEqual([]);
      expect(result.data.projects).toEqual([]);
      expect(result.data.certifications).toEqual([]);
      expect(result.data.softSkills).toEqual([]);
      expect(result.data.achievements).toEqual([]);
    });

    it('validateResumeData should handle null or undefined input safely', () => {
      const result = validateResumeData(null);
      expect(result.success).toBe(true);
      expect(result.data.personalInfo.fullName).toBe('');
      expect(result.data.experience).toEqual([]);
      expect(result.data.skills).toEqual([]);
    });
  });

  // 8. AI ENGINE FALLBACK & INTEGRITY
  describe('Step 3 & 4: AI Extraction Abstraction & Grounded Fallback', () => {
    it('should extract resume data and mark source as deterministic_engine when API key is unconfigured', async () => {
      const sampleText = `
Rachel Green
Fashion Merchandiser & Designer
rachel.green@ralphlauren.com | (555) 777-8888 | New York, NY
github.com/rachelgreen | linkedin.com/in/rachelgreen

PROFESSIONAL SUMMARY
Senior fashion merchandising manager with 7+ years directing international collections.

TECHNICAL SKILLS
Tools & Software: Adobe Illustrator, Photoshop, PLM, Marvel, Excel, Clo3D

SOFT SKILLS
Leadership, Creative Direction, Cross-functional Collaboration, Negotiation

WORK EXPERIENCE
Lead Merchandiser | Ralph Lauren
2020 - Present
New York, NY
- Directed seasonal women's collection generating $12M in gross revenue.

EDUCATION
B.A. in Fashion Merchandising
Fashion Institute of Technology (FIT)
2014 - 2018

ACHIEVEMENTS
- Awarded FIT Outstanding Graduate Honors 2018
- Winner of New York Young Designers Competition 2019
`;

      const result = await extractResumeData(sampleText);
      expect(result).toBeDefined();
      expect(result.source).toBe('deterministic_engine');
      expect(result.message).toMatch(/Portify Deterministic Rule Engine/i);
      expect(result.data.personalInfo.fullName).toBe('Rachel Green');
      expect(result.data.personalInfo.headline).toContain('Fashion Merchandiser');
      expect(result.data.softSkills.length).toBeGreaterThan(0);
      expect(result.data.achievements.length).toBeGreaterThan(0);
      expect(result.data.experience[0].company).toBe('Ralph Lauren');
    });
  });
});
