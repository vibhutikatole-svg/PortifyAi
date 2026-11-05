const request = require('supertest');
const { connectDB, disconnectDB } = require('../src/config/db');
const app = require('../src/app');
const User = require('../src/models/User');
const { Portfolio } = require('../src/models/Portfolio');
const config = require('../src/config/env');
const {
  generatePortfolioContent,
  polishDeterministically,
  verifyGroundedness,
  generateContentDiff,
  sanitizeText,
} = require('../src/services/portfolioGenerationService');

describe('Portify AI Portfolio Generation Engine & Anti-Hallucination Suite', () => {
  let tokenUserA = '';
  let tokenUserB = '';
  let userIdA = '';
  let userIdB = '';

  beforeAll(async () => {
    await connectDB('mongodb://127.0.0.1:27017/portify_ai_test');
    await User.deleteMany({ email: { $regex: /@portify-gen-suite\.dev$/ } });
    await Portfolio.deleteMany({ slug: { $regex: /^(alex-vance-gen-|manual-edit-prot-)/ } });
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $regex: /@portify-gen-suite\.dev$/ } });
    await Portfolio.deleteMany({ slug: { $regex: /^(alex-vance-gen-|manual-edit-prot-)/ } });
    await disconnectDB();
  });

  it('should setup test candidate accounts for authorization tests', async () => {
    // User A
    const resA = await request(app).post('/api/auth/register').send({
      name: 'Primary Candidate',
      email: `candidate_primary_${Date.now()}@portify-gen-suite.dev`,
      password: 'Password123!',
    });
    tokenUserA = resA.body.token;
    userIdA = resA.body.user.id;

    // User B
    const resB = await request(app).post('/api/auth/register').send({
      name: 'Secondary Candidate',
      email: `candidate_secondary_${Date.now()}@portify-gen-suite.dev`,
      password: 'Password123!',
    });
    tokenUserB = resB.body.token;
    userIdB = resB.body.user.id;

    expect(tokenUserA).toBeDefined();
    expect(tokenUserB).toBeDefined();
  });
  // Sample Data Profiles
  const fresherProfile = {
    personalInfo: {
      fullName: 'Rohan Sharma',
      headline: 'recent computer science graduate',
      email: 'rohan.sharma@example.edu',
      location: 'Austin, TX',
      github: 'https://github.com/rohansharma',
    },
    summary: 'computer science graduate looking for software engineering roles',
    experience: [], // ZERO work experience
    education: [
      {
        institution: 'University of Texas at Austin',
        degree: 'B.S.',
        fieldOfStudy: 'Computer Science',
        graduationDate: 'May 2024',
        gpa: '3.92',
      },
    ],
    skills: [
      { category: 'Programming Languages', items: ['Python', 'Java', 'TypeScript'] },
      { category: 'Web Technologies', items: ['React', 'Node.js', 'Tailwind CSS'] },
    ],
    softSkills: ['Quick Learner', 'Problem Solving', 'Team Collaboration'],
    projects: [
      {
        title: 'Decentralized Campus Voting Platform',
        description: 'built voting platform using smart contracts and react for university student elections',
        technologies: ['Solidity', 'Ethereum', 'React', 'Ethers.js'],
        liveUrl: 'https://campusvote.dev',
        repoUrl: 'https://github.com/rohansharma/campusvote',
      },
      {
        title: 'Smart Transit Route Finder',
        description: 'graph search algorithm for optimal transit routes with real-time bus tracking',
        technologies: ['Python', 'FastAPI', 'Leaflet.js'],
        liveUrl: 'https://transitroute.dev',
      },
    ],
    certifications: [
      {
        name: 'Meta Front-End Developer Professional Certificate',
        issuer: 'Coursera / Meta',
        issueDate: '2023',
      },
    ],
    achievements: [
      '1st Place Winner at HackTX 2023 Collegiate Hackathon',
      'Top 5% Global Rank on LeetCode with 350+ solved algorithmic challenges',
    ],
  };

  const experiencedDevProfile = {
    personalInfo: {
      fullName: 'Sarah Jenkins',
      headline: 'senior distributed systems architect',
      email: 'sarah.jenkins@lead.io',
      location: 'Seattle, WA',
      website: 'https://sarahjenkins.io',
      github: 'https://github.com/sjenkins',
    },
    summary: 'senior architect with 9 years designing distributed cloud backends',
    experience: [
      {
        company: 'CloudScale Infrastructure',
        role: 'Staff Systems Architect',
        startDate: '2021',
        endDate: 'Present',
        current: true,
        description: 'architected event-driven microservices for financial clients',
        highlights: [
          'reduced p99 latency by 45% across 120M daily transactions',
          'managed multi-region kubernetes clusters across AWS and GCP',
        ],
      },
      {
        company: 'Veloce Data Labs',
        role: 'Senior Backend Engineer',
        startDate: '2017',
        endDate: '2021',
        current: false,
        description: 'developed telemetry ingestion pipelines',
        highlights: [
          'migrated monolithic data store to partitioned distributed postgresql',
        ],
      },
    ],
    education: [
      {
        institution: 'University of Washington',
        degree: 'M.S.',
        fieldOfStudy: 'Computer Science & Distributed Systems',
        graduationDate: '2017',
      },
    ],
    skills: [
      { category: 'Distributed Systems', items: ['Go', 'Rust', 'Kafka', 'gRPC'] },
      { category: 'Cloud & Infrastructure', items: ['AWS', 'Kubernetes', 'Terraform'] },
    ],
    projects: [
      {
        title: 'Kafka Flow Monitor',
        description: 'high throughput consumer lag monitoring daemon for kafka clusters',
        technologies: ['Go', 'Kafka', 'Prometheus'],
      },
    ],
    certifications: [
      {
        name: 'AWS Certified Solutions Architect — Professional',
        issuer: 'Amazon Web Services',
        issueDate: '2022',
      },
    ],
    achievements: [
      'Featured Speaker at KubeCon North America 2023',
    ],
  };

  const designerProfile = {
    personalInfo: {
      fullName: 'Mateo Rossi',
      headline: 'lead product & design systems designer',
      email: 'mateo@designstudio.co',
      location: 'New York, NY',
      website: 'https://mateorossi.design',
    },
    summary: 'product designer passionate about accessible enterprise design systems and user research',
    experience: [
      {
        company: 'Lumina Design Lab',
        role: 'Lead UI/UX Designer',
        startDate: '2020',
        endDate: 'Present',
        current: true,
        description: 'led design system initiative for fintech web and mobile applications',
        highlights: [
          'built 120-component figma design system adopted by 40+ product engineers',
          'conducted 80+ user interviews increasing onboarding task completion by 34%',
        ],
      },
    ],
    education: [
      {
        institution: 'Rhode Island School of Design',
        degree: 'B.F.A.',
        fieldOfStudy: 'Graphic & Interaction Design',
        graduationDate: '2019',
      },
    ],
    skills: [
      { category: 'Design & Prototyping', items: ['Figma', 'Framer', 'Design Systems', 'Design Tokens'] },
      { category: 'Research & Strategy', items: ['Usability Testing', 'User Journey Mapping', 'WCAG Accessibility'] },
    ],
    softSkills: ['Design Thinking', 'Cross-functional Collaboration', 'Design Mentorship'],
    projects: [
      {
        title: 'Accessible Banking Design System',
        description: 'unified cross-platform multi-brand design system compliant with WCAG 2.1 AA standards',
        technologies: ['Figma', 'Storybook', 'Tokens Studio'],
        liveUrl: 'https://mateorossi.design/banking',
      },
    ],
    achievements: [
      'Winner of Red Dot Design Award 2022 for Mobile Fintech Experience',
    ],
  };

  const nonTechnicalProfile = {
    personalInfo: {
      fullName: 'Claire Dupont',
      headline: 'director of global marketing and brand strategy',
      email: 'claire.dupont@zenithgrowth.com',
      location: 'Chicago, IL',
      linkedin: 'https://linkedin.com/in/clairedupont',
    },
    summary: 'marketing leader with 10 years scaling omnichannel campaigns and brand partnerships',
    experience: [
      {
        company: 'Zenith Growth Partners',
        role: 'Director of Growth Marketing',
        startDate: '2019',
        endDate: 'Present',
        current: true,
        description: 'spearheaded multi-channel demand generation and brand communications',
        highlights: [
          'scaled annual marketing pipeline by 68% generating $14M in attributed pipeline',
          'managed $3.5M annual marketing budget and a team of 8 brand specialists',
        ],
      },
    ],
    education: [
      {
        institution: 'Northwestern University — Kellogg School of Management',
        degree: 'M.B.A.',
        fieldOfStudy: 'Marketing & Brand Strategy',
        graduationDate: '2018',
      },
    ],
    skills: [
      { category: 'Marketing Strategy', items: ['Omnichannel Demand Gen', 'Brand Strategy', 'Product Marketing'] },
      { category: 'Leadership & Ops', items: ['P&L Management', 'Team Leadership', 'Executive Reporting'] },
    ],
    projects: [
      {
        title: 'Global Rebranding Initiative 2022',
        description: 'repositioned core enterprise SaaS offering resulting in 28% increase in inbound enterprise deals',
        technologies: ['HubSpot', 'Salesforce', 'Marketo'],
      },
    ],
    achievements: [
      'Named Top 40 Under 40 Marketing Leader by BrandWeek 2023',
    ],
  };

  describe('Anti-Code-Execution & Script Injection Sanitization', () => {
    it('should strip malicious script tags, javascript: links, and arbitrary HTML', () => {
      const maliciousInput = '<script>alert("hacked")</script>Senior Engineer <img src=x onerror=alert(1)>';
      const cleaned = sanitizeText(maliciousInput);
      expect(cleaned).not.toContain('<script>');
      expect(cleaned).not.toContain('<img');
      expect(cleaned).not.toContain('alert');
      expect(cleaned).toContain('Senior Engineer');
    });

    it('deterministic polish engine should sanitize all nested fields against injection', () => {
      const dirtyData = {
        personalInfo: {
          fullName: 'Target User',
          headline: 'Developer <script>stealCookies()</script>',
        },
        summary: 'Passionate coder <a href="javascript:attack()">click here</a>.',
        projects: [
          {
            title: 'Injected Title <script>alert(1)</script>',
            description: '<img src=x onerror=alert(2)> Clean description',
          },
        ],
      };

      const polished = polishDeterministically(dirtyData);
      expect(polished.personalInfo.headline).not.toContain('<script>');
      expect(polished.summary).not.toContain('javascript:');
      expect(polished.projects[0].title).not.toContain('<script>');
      expect(polished.projects[0].description).not.toContain('<img');
    });
  });

  describe('Grounding & Anti-Hallucination Verification', () => {
    it('verifyGroundedness should flag hallucinated experience for a fresher with 0 experience', () => {
      const original = { experience: [] };
      const hallucinated = {
        experience: [{ company: 'Phantom Tech Corp', role: 'Senior Architect' }],
      };
      const check = verifyGroundedness(original, hallucinated);
      expect(check.isGrounded).toBe(false);
      expect(check.violations.length).toBeGreaterThan(0);
      expect(check.violations[0]).toContain('hallucinated work experience');
    });

    it('verifyGroundedness should flag unsupported company names not in original resume', () => {
      const original = {
        experience: [{ company: 'Alpha Systems', role: 'Dev' }],
      };
      const hallucinated = {
        experience: [
          { company: 'Alpha Systems', role: 'Dev' },
          { company: 'Google Cloud Platform Fake', role: 'Principal' },
        ],
      };
      const check = verifyGroundedness(original, hallucinated);
      expect(check.isGrounded).toBe(false);
      expect(check.violations[0]).toContain('unsupported company');
    });

    it('verifyGroundedness should pass for legitimate enhanced content that preserves factual truth', () => {
      const original = {
        experience: [{ company: 'Alpha Systems', role: 'Dev' }],
        education: [{ institution: 'MIT', degree: 'B.S.' }],
      };
      const enhanced = {
        experience: [{ company: 'Alpha Systems', role: 'Software Developer' }],
        education: [{ institution: 'MIT', degree: 'Bachelor of Science' }],
      };
      const check = verifyGroundedness(original, enhanced);
      expect(check.isGrounded).toBe(true);
      expect(check.violations).toHaveLength(0);
    });
  });

  describe('Testing Generation Engine Across 4 Diverse Resume Profiles', () => {
    it('Profile 1: Fresher — should naturally handle 0 work experience without hallucinating corporate roles', async () => {
      const result = await generatePortfolioContent(fresherProfile);
      expect(result.success).toBe(true);
      expect(result.data.experience).toHaveLength(0); // MUST remain 0
      expect(result.data.personalInfo.fullName).toBe('Rohan Sharma');
      // Headline polished to title case
      expect(result.data.personalInfo.headline).toContain('Recent Computer Science Graduate');
      // Summary generated from academic background and skills
      expect(result.data.summary.length).toBeGreaterThan(20);
      // Projects polished
      expect(result.data.projects).toHaveLength(2);
      expect(result.data.projects[0].title).toBe('Decentralized Campus Voting Platform');
      // Grounding verified
      expect(result.grounded).toBe(true);
    });

    it('Profile 2: Experienced Developer — should polish action verbs and preserve quantitative metrics', async () => {
      const result = await generatePortfolioContent(experiencedDevProfile);
      expect(result.success).toBe(true);
      expect(result.data.experience).toHaveLength(2);
      expect(result.data.experience[0].company).toBe('CloudScale Infrastructure');
      // Metrics preserved in highlights
      const hStr = JSON.stringify(result.data.experience[0].highlights);
      expect(hStr).toContain('45%');
      expect(hStr).toContain('120M');
      // Certifications preserved
      expect(result.data.certifications).toHaveLength(1);
      expect(result.data.certifications[0].name).toContain('AWS Certified Solutions Architect');
    });

    it('Profile 3: Designer — should preserve design competencies and NOT inject developer coding stacks', async () => {
      const result = await generatePortfolioContent(designerProfile);
      expect(result.success).toBe(true);
      expect(result.data.personalInfo.fullName).toBe('Mateo Rossi');
      // Skills should contain Figma and Design Systems
      const allSkills = result.data.skills.flatMap((g) => g.items);
      expect(allSkills).toContain('Figma');
      expect(allSkills).toContain('Design Systems');
      // MUST NOT have hallucinated coding languages
      expect(allSkills).not.toContain('Python');
      expect(allSkills).not.toContain('Go');
      expect(allSkills).not.toContain('C++');
      // Experience preserved
      expect(result.data.experience).toHaveLength(1);
      expect(result.data.experience[0].company).toBe('Lumina Design Lab');
    });

    it('Profile 4: Non-Technical Professional — should polish executive narrative without dev repositories', async () => {
      const result = await generatePortfolioContent(nonTechnicalProfile);
      expect(result.success).toBe(true);
      expect(result.data.personalInfo.fullName).toBe('Claire Dupont');
      // Marketing skills preserved
      const allSkills = result.data.skills.flatMap((g) => g.items);
      expect(allSkills).toContain('Brand Strategy');
      // No git repositories or dev tools
      expect(result.data.personalInfo.github).toBe('');
      expect(allSkills).not.toContain('Docker');
      expect(allSkills).not.toContain('Kubernetes');
      // Revenue and budget metrics preserved
      const expStr = JSON.stringify(result.data.experience);
      expect(expStr).toContain('$14M');
      expect(expStr).toContain('$3.5M');
    });
  });

  describe('API Endpoint Integration: POST /api/portfolios/:id/generate', () => {
    let createdPortfolio;

    beforeEach(async () => {
      createdPortfolio = await Portfolio.create({
        user: userIdA,
        title: 'Full Stack Engineering Portfolio',
        slug: `alex-vance-gen-${Date.now()}`,
        theme: 'minimal-pro',
        personalInfo: {
          fullName: 'Alexander Vance',
          headline: 'full stack engineer and cloud developer',
          email: 'alex@vance.io',
        },
        summary: 'experienced developer with 6 years building web apps',
        experience: [
          {
            role: 'Senior Developer',
            company: 'TechFlow Systems',
            description: 'built scalable web apps',
            highlights: ['improved build performance by 30%'],
          },
        ],
        projects: [
          {
            title: 'HyperSpeed API',
            description: 'lightweight api gateway',
            technologies: ['Node.js', 'Redis'],
          },
        ],
        skills: [{ category: 'Engineering', items: ['Node.js', 'React', 'MongoDB'] }],
      });
    });

    it('should reject unauthenticated requests with HTTP 401', async () => {
      const res = await request(app)
        .post(`/api/portfolios/${createdPortfolio._id}/generate`)
        .send({});
      expect(res.status).toBe(401);
    });

    it('should reject requests from other users with HTTP 404 (ownership protection)', async () => {
      const res = await request(app)
        .post(`/api/portfolios/${createdPortfolio._id}/generate`)
        .set('Authorization', `Bearer ${tokenUserB}`)
        .send({});
      expect(res.status).toBe(404);
    });

    it('should return enhanced data and diff for review when applyImmediately is false', async () => {
      const res = await request(app)
        .post(`/api/portfolios/${createdPortfolio._id}/generate`)
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ applyImmediately: false });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.diff).toBeDefined();
      expect(res.body.diff.headline).toBeDefined();
      expect(res.body.diff.summary).toBeDefined();
      expect(res.body.enhancedData).toBeDefined();

      // Database should NOT be overwritten yet
      const unedited = await Portfolio.findById(createdPortfolio._id);
      expect(unedited.personalInfo.headline).toBe('full stack engineer and cloud developer');
    });

    it('should apply and save directly to MongoDB when applyImmediately is true', async () => {
      const res = await request(app)
        .post(`/api/portfolios/${createdPortfolio._id}/generate`)
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ applyImmediately: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.portfolio).toBeDefined();

      // Database SHOULD now reflect polished title case headline
      const saved = await Portfolio.findById(createdPortfolio._id);
      expect(saved.personalInfo.headline).toContain('Full Stack Engineer');
    });
  });

  describe('Regeneration & Manual Edit Protection: POST /api/portfolios/:id/regenerate-section', () => {
    let testPortfolio;

    beforeEach(async () => {
      testPortfolio = await Portfolio.create({
        user: userIdA,
        title: 'Manual Protection Test Portfolio',
        slug: `manual-edit-prot-${Date.now()}`,
        theme: 'dark-developer',
        personalInfo: {
          fullName: 'Samantha Reed',
          headline: 'My Custom Manual Headline', // User manually edited this!
        },
        summary: 'original draft summary needing polish',
        projects: [
          {
            title: 'My Custom Manually Edited Project Title', // User manually edited this!
            description: 'simple description',
          },
        ],
        experience: [
          {
            company: 'Nexus Innovations',
            role: 'Lead Architect',
            highlights: ['initial bullet'],
          },
        ],
      });
    });

    it('should regenerate ONLY summary without overwriting manual edits in headline or projects', async () => {
      const res = await request(app)
        .post(`/api/portfolios/${testPortfolio._id}/regenerate-section`)
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ section: 'summary' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.section).toBe('summary');

      // Verify MongoDB
      const updated = await Portfolio.findById(testPortfolio._id);
      // Summary was regenerated:
      expect(updated.summary).toBeDefined();
      // Manual edits in headline MUST remain untouched:
      expect(updated.personalInfo.headline).toBe('My Custom Manual Headline');
      // Manual edits in projects MUST remain untouched:
      expect(updated.projects[0].title).toBe('My Custom Manually Edited Project Title');
    });

    it('should regenerate ONLY headline without overwriting manual edits in summary or projects', async () => {
      const res = await request(app)
        .post(`/api/portfolios/${testPortfolio._id}/regenerate-section`)
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          section: 'headline',
          sectionData: 'platform engineer and site reliability lead',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const updated = await Portfolio.findById(testPortfolio._id);
      // Headline polished to title case:
      expect(updated.personalInfo.headline).toContain('Platform Engineer');
      // Projects MUST remain untouched:
      expect(updated.projects[0].title).toBe('My Custom Manually Edited Project Title');
      // Summary MUST remain untouched:
      expect(updated.summary).toBe('original draft summary needing polish');
    });
  });
});
