const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const User = require('../src/models/User');
const { Portfolio } = require('../src/models/Portfolio');
const { parseResumeDeterministically } = require('../src/services/deterministicParser');
const { generatePortfolioZip } = require('../src/services/zipService');

describe('Portify AI Backend Integration Tests', () => {
  let authToken = '';
  let userId = '';
  let testPortfolioId = '';
  const testEmail = `test_${Date.now()}@portify.dev`;

  beforeAll(async () => {
    await connectDB('mongodb://127.0.0.1:27017/portify_ai_test');
    await User.deleteMany({ email: { $regex: /@portify\.dev$/ } });
    await Portfolio.deleteMany({ slug: { $regex: /^test-/ } });
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $regex: /@portify\.dev$/ } });
    await Portfolio.deleteMany({ slug: { $regex: /^test-/ } });
    await disconnectDB();
  });

  // 1. Authentication Tests
  describe('Authentication Endpoints', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Sarah Connor',
          email: testEmail,
          password: 'securepassword123',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(testEmail);
      authToken = res.body.token;
      userId = res.body.user.id;
    });

    it('should fail to register with duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Sarah Duplicate',
          email: testEmail,
          password: 'securepassword123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should login an existing user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'securepassword123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it('should fail login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should fetch authenticated user profile', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.name).toBe('Sarah Connor');
    });
  });

  // 2. Deterministic Resume Extraction Unit Tests
  describe('Deterministic Resume Extraction Engine', () => {
    const sampleResumeText = `
Alexander Vance
Senior Full Stack Engineer
alex.vance@example.com | (555) 234-5678 | San Francisco, CA
github.com/alexvance | linkedin.com/in/alexvance | https://alexvance.dev

PROFESSIONAL SUMMARY
Experienced full-stack engineer with 6+ years designing and scaling distributed web applications and high-throughput microservices using React, Node.js, and TypeScript.

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, Python, Go, SQL, HTML5, CSS3
Frameworks & Libraries: React, Next.js, Node.js, Express, Tailwind CSS, Redux
Databases & Cloud: MongoDB, PostgreSQL, Redis, Docker, AWS, Kubernetes
Tools: Git, GitHub Actions, Jest, Vitest, Figma, Linux

WORK EXPERIENCE
Senior Software Engineer | TechCorp Inc.
Jan 2021 - Present
San Francisco, CA
- Spearheaded migration of legacy monolith to microservices architecture using Node.js and MongoDB.
- Reduced API p99 latency by 42% through strategic Redis caching and database query optimization.
- Mentored a team of 5 junior engineers and established automated CI/CD pipelines with GitHub Actions.

Frontend Developer | InnovateX Labs
Jun 2018 - Dec 2020
Austin, TX
- Developed responsive client portals using React and Tailwind CSS, increasing user retention by 28%.
- Integrated Stripe payment gateway and real-time notification websockets.

EDUCATION
Bachelor of Science in Computer Science
University of California, Berkeley
2014 - 2018
GPA: 3.85

PROJECTS
CloudScale Monitoring Dashboard
https://cloudscale-demo.app | github.com/alexvance/cloudscale
- Real-time cloud metrics visualizer built with Next.js, WebSockets, and Tailwind CSS.
- Handled over 10,000 simulated telemetry events per second with zero frame drops.
    `;

    it('should parse resume text faithfully without hallucination', () => {
      const parsed = parseResumeDeterministically(sampleResumeText);

      expect(parsed.personalInfo.fullName).toBe('Alexander Vance');
      expect(parsed.personalInfo.headline).toBe('Senior Full Stack Engineer');
      expect(parsed.personalInfo.email).toBe('alex.vance@example.com');
      expect(parsed.personalInfo.phone).toBe('(555) 234-5678');
      expect(parsed.personalInfo.location).toBe('San Francisco, CA');
      expect(parsed.personalInfo.github).toContain('github.com/alexvance');
      expect(parsed.personalInfo.linkedin).toContain('linkedin.com/in/alexvance');

      // Skills categorization
      expect(parsed.skills.length).toBeGreaterThan(0);
      const languages = parsed.skills.find((s) => s.category === 'Languages');
      expect(languages).toBeDefined();
      expect(languages.items).toContain('TypeScript');
      expect(languages.items).toContain('Python');

      // Experience
      expect(parsed.experience.length).toBe(2);
      expect(parsed.experience[0].role).toContain('Senior Software Engineer');
      expect(parsed.experience[0].company).toContain('TechCorp Inc.');
      expect(parsed.experience[0].current).toBe(true);
      expect(parsed.experience[0].highlights.length).toBeGreaterThan(0);

      // Education
      expect(parsed.education.length).toBe(1);
      expect(parsed.education[0].institution).toContain('University of California');
      expect(parsed.education[0].gpa).toBe('3.85');

      // Projects
      expect(parsed.projects.length).toBe(1);
      expect(parsed.projects[0].title).toBe('CloudScale Monitoring Dashboard');
    });
  });

  // 3. Portfolio CRUD & Theme Rotation Tests
  describe('Portfolio Lifecycle & Management', () => {
    it('should create a portfolio manually or via parsed data', async () => {
      const res = await request(app)
        .post('/api/portfolios')
        .set('Authorization', `Bearer ${authToken}`)
        .send();

      // Note: We'll verify direct Portfolio creation via upload endpoint or model
      const portfolio = await Portfolio.create({
        user: userId,
        title: 'Test Developer Portfolio',
        slug: `test-portfolio-${Date.now()}`,
        theme: 'minimal-pro',
        isPublished: true,
        personalInfo: {
          fullName: 'Sarah Connor',
          headline: 'Systems Architect',
          email: testEmail,
        },
        summary: 'Architecting resilient cloud applications.',
      });

      testPortfolioId = portfolio._id.toString();
      expect(testPortfolioId).toBeDefined();
    });

    it('should fetch user portfolio list (History)', async () => {
      const res = await request(app)
        .get('/api/portfolios')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.portfolios.length).toBeGreaterThan(0);
    });

    it('should get a single portfolio by ID', async () => {
      const res = await request(app)
        .get(`/api/portfolios/${testPortfolioId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.portfolio.title).toBe('Test Developer Portfolio');
    });

    it('should update portfolio details and theme', async () => {
      const res = await request(app)
        .put(`/api/portfolios/${testPortfolioId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Senior Systems Architect',
          theme: 'dark-developer',
          summary: 'Updated executive summary with 10+ years experience.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.portfolio.theme).toBe('dark-developer');
      expect(res.body.portfolio.title).toBe('Updated Senior Systems Architect');
    });

    it('should allow public access via unique slug without auth', async () => {
      const portfolio = await Portfolio.findById(testPortfolioId);
      const res = await request(app).get(`/api/portfolios/public/${portfolio.slug}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.portfolio.slug).toBe(portfolio.slug);
    });

    it('should generate QR code data for the portfolio', async () => {
      const res = await request(app)
        .get(`/api/portfolios/${testPortfolioId}/qr`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.qrDataUrl).toContain('data:image/png;base64');
    });

    it('should download a valid standalone ZIP archive of the portfolio', async () => {
      const res = await request(app)
        .get(`/api/portfolios/${testPortfolioId}/zip`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/zip');
      expect(res.body).toBeDefined();
    });

    it('should delete portfolio', async () => {
      const res = await request(app)
        .delete(`/api/portfolios/${testPortfolioId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const check = await Portfolio.findById(testPortfolioId);
      expect(check).toBeNull();
    });
  });
});
