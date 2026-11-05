const request = require('supertest');
const app = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const User = require('../src/models/User');
const { Portfolio } = require('../src/models/Portfolio');

describe('Resume Review & Multi-Section Editing API Test Suite', () => {
  let authToken = '';
  let userId = '';
  let portfolioId = '';
  let portfolioSlug = '';
  const testEmail = `editor_reviewer_${Date.now()}@editor-suite.portify.dev`;

  beforeAll(async () => {
    await connectDB('mongodb://127.0.0.1:27017/portify_ai_test');
    await User.deleteMany({ email: { $regex: /@editor-suite\.portify\.dev$/ } });
    await Portfolio.deleteMany({ slug: { $regex: /^review-edit-test-/ } });

    // 1. Register a test user
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Sarah Connor',
        email: testEmail,
        password: 'Password123!',
      });
    authToken = res.body.token;
    userId = res.body.user.id;

    // 2. Create an initial portfolio in MongoDB
    const slug = `review-edit-test-${Date.now()}`;
    const initialPortfolio = await Portfolio.create({
      user: userId,
      title: 'Initial Extracted Portfolio',
      slug,
      theme: 'minimal-pro',
      isPublished: true,
      personalInfo: {
        fullName: 'Sarah Connor',
        headline: 'Cybernetics Defense Architect',
        email: 'sarah@resistance.dev',
        phone: '+1 555-019-9999',
        location: 'Los Angeles, CA',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
        website: 'https://sarahconnor.dev',
        github: 'https://github.com/sarahconnor',
        linkedin: 'https://linkedin.com/in/sarahconnor',
        twitter: 'https://x.com/sarahconnor',
      },
      summary: 'Experienced systems defender specializing in real-time autonomous systems.',
      skills: [
        {
          category: 'Core Technologies',
          items: ['C++', 'Python', 'Embedded Systems'],
        },
      ],
      softSkills: ['Crisis Management', 'Tactical Leadership'],
      education: [
        {
          degree: 'B.S. in Computer Science',
          fieldOfStudy: 'Robotics',
          institution: 'Caltech',
          graduationDate: '2019',
          gpa: '3.9',
          highlights: ['Dean\'s List'],
        },
      ],
      experience: [
        {
          role: 'Defense Systems Engineer',
          company: 'Cyberdyne Systems',
          location: 'Sunnyvale, CA',
          startDate: '2020',
          endDate: 'Present',
          current: true,
          description: 'Architecting neural network telemetry safeguards.',
          highlights: ['Prevented system-wide firmware breach in Q3.'],
        },
      ],
      projects: [
        {
          title: 'Skynet Shield AI',
          description: 'Autonomous threat detection microservice.',
          technologies: ['Python', 'Docker', 'Kubernetes'],
          liveUrl: 'https://shield.resistance.dev',
          repoUrl: 'https://github.com/sarahconnor/shield',
          highlights: ['Processed 1M telemetry packets/second.'],
        },
      ],
      certifications: [
        {
          name: 'Certified Information Systems Security Professional',
          issuer: '(ISC)²',
          issueDate: '2021',
          credentialUrl: 'https://isc2.org/cert/12345',
        },
      ],
      achievements: ['Valedictorian Caltech 2019', 'Winner of DARPA Autonomous Grand Challenge'],
    });

    portfolioId = initialPortfolio._id.toString();
    portfolioSlug = initialPortfolio.slug;
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $regex: /@editor-suite\.portify\.dev$/ } });
    await Portfolio.deleteMany({ slug: { $regex: /^review-edit-test-/ } });
    await disconnectDB();
  });

  // 1. READ / RETRIEVE FOR EDITING
  it('should retrieve existing portfolio record with all 9 sections populated', async () => {
    const res = await request(app)
      .get(`/api/portfolios/${portfolioId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const p = res.body.portfolio;

    // Verify all 9 sections exist
    expect(p.personalInfo.fullName).toBe('Sarah Connor');
    expect(p.summary).toContain('systems defender');
    expect(p.skills.length).toBe(1);
    expect(p.softSkills.length).toBe(2);
    expect(p.education.length).toBe(1);
    expect(p.experience.length).toBe(1);
    expect(p.projects.length).toBe(1);
    expect(p.certifications.length).toBe(1);
    expect(p.achievements.length).toBe(2);
    expect(p.personalInfo.github).toBe('https://github.com/sarahconnor');
  });

  // 2. EDIT EXISTING INFORMATION
  it('should update existing information across all sections and persist to MongoDB', async () => {
    const updates = {
      title: 'Senior Systems Architect Portfolio',
      personalInfo: {
        fullName: 'Sarah J. Connor',
        headline: 'Principal Cybernetics Defense Architect',
        email: 'sarah.connor@resistance.org',
        phone: '+1 555-888-0000',
        location: 'San Francisco, CA',
        avatarUrl: 'https://images.unsplash.com/photo-custom',
        website: 'https://sarahconnor.org',
        github: 'https://github.com/sarah-j-connor',
        linkedin: 'https://linkedin.com/in/sarah-j-connor',
        twitter: 'https://x.com/sarah_j_connor',
      },
      summary: 'Updated executive summary with 10+ years directing defensive cybersecurity operations.',
    };

    const res = await request(app)
      .put(`/api/portfolios/${portfolioId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updates);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.portfolio.personalInfo.fullName).toBe('Sarah J. Connor');
    expect(res.body.portfolio.personalInfo.headline).toBe('Principal Cybernetics Defense Architect');
    expect(res.body.portfolio.personalInfo.location).toBe('San Francisco, CA');
    expect(res.body.portfolio.summary).toContain('10+ years directing defensive cybersecurity');
  });

  // 3. ADD NEW RECORDS TO ARRAYS
  it('should add new records to experience, education, projects, certifications, skills, and achievements', async () => {
    // Fetch current state
    const fetchRes = await request(app)
      .get(`/api/portfolios/${portfolioId}`)
      .set('Authorization', `Bearer ${authToken}`);
    const current = fetchRes.body.portfolio;

    // Add new items
    const updatedPayload = {
      // Add new experience role
      experience: [
        {
          role: 'Chief Technology Architect',
          company: 'Resistance Technologies',
          location: 'San Francisco, CA',
          startDate: '2023',
          endDate: 'Present',
          current: true,
          description: 'Directing autonomous systems security across 4 global locations.',
          highlights: ['Built quantum-resistant mesh network.'],
        },
        ...current.experience,
      ],
      // Add new education
      education: [
        {
          degree: 'M.S. in Advanced Robotics',
          fieldOfStudy: 'Artificial Intelligence',
          institution: 'MIT',
          graduationDate: '2021',
          gpa: '4.0',
          highlights: ['Fellowship Awardee'],
        },
        ...current.education,
      ],
      // Add new project
      projects: [
        {
          title: 'Quantum Guard Protocol',
          description: 'Post-quantum key exchange microservice.',
          technologies: ['Rust', 'WebAssembly', 'Go'],
          liveUrl: 'https://quantumguard.dev',
          repoUrl: 'https://github.com/sarahconnor/quantumguard',
          highlights: ['Zero latency overhead.'],
        },
        ...current.projects,
      ],
      // Add new skill category
      skills: [
        ...current.skills,
        {
          category: 'Cloud & Infrastructure',
          items: ['AWS', 'Kubernetes', 'Terraform', 'Vault'],
        },
      ],
      // Add new soft skill
      softSkills: [...current.softSkills, 'Cross-functional Collaboration', 'Strategic Roadmapping'],
      // Add new certification
      certifications: [
        ...current.certifications,
        {
          name: 'AWS Certified Security Specialty',
          issuer: 'Amazon Web Services',
          issueDate: '2022',
          credentialUrl: 'https://aws.amazon.com/verification/999',
        },
      ],
      // Add new achievement
      achievements: [...current.achievements, 'Inducted into International Cybersecurity Hall of Fame 2024'],
    };

    const res = await request(app)
      .put(`/api/portfolios/${portfolioId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updatedPayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.portfolio.experience.length).toBe(2);
    expect(res.body.portfolio.education.length).toBe(2);
    expect(res.body.portfolio.projects.length).toBe(2);
    expect(res.body.portfolio.skills.length).toBe(2);
    expect(res.body.portfolio.softSkills.length).toBe(4);
    expect(res.body.portfolio.certifications.length).toBe(2);
    expect(res.body.portfolio.achievements.length).toBe(3);
  });

  // 4. REMOVE RECORDS FROM ARRAYS
  it('should remove records from experience, education, projects, certifications, and achievements', async () => {
    const fetchRes = await request(app)
      .get(`/api/portfolios/${portfolioId}`)
      .set('Authorization', `Bearer ${authToken}`);
    const current = fetchRes.body.portfolio;

    // Filter out 1 item from each array
    const trimmedPayload = {
      experience: current.experience.slice(0, 1), // Keep 1
      education: current.education.slice(0, 1), // Keep 1
      projects: current.projects.slice(0, 1), // Keep 1
      certifications: current.certifications.slice(0, 1), // Keep 1
      achievements: current.achievements.slice(0, 2), // Keep 2
      softSkills: current.softSkills.filter((s) => s !== 'Tactical Leadership'), // Remove 1 soft skill
    };

    const res = await request(app)
      .put(`/api/portfolios/${portfolioId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(trimmedPayload);

    expect(res.status).toBe(200);
    expect(res.body.portfolio.experience.length).toBe(1);
    expect(res.body.portfolio.education.length).toBe(1);
    expect(res.body.portfolio.projects.length).toBe(1);
    expect(res.body.portfolio.certifications.length).toBe(1);
    expect(res.body.portfolio.achievements.length).toBe(2);
    expect(res.body.portfolio.softSkills).not.toContain('Tactical Leadership');
  });

  // 5. VERIFY REFRESH PERSISTENCE (FETCH DIRECTLY FROM MONGODB)
  it('should verify that all saved changes remain accurate after refetching from database (simulating browser refresh)', async () => {
    // Simulating page refresh by querying GET /api/portfolios/:id afresh
    const res = await request(app)
      .get(`/api/portfolios/${portfolioId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    const p = res.body.portfolio;

    // Section 1: Personal Info
    expect(p.personalInfo.fullName).toBe('Sarah J. Connor');
    expect(p.personalInfo.headline).toBe('Principal Cybernetics Defense Architect');
    expect(p.personalInfo.email).toBe('sarah.connor@resistance.org');
    expect(p.personalInfo.location).toBe('San Francisco, CA');

    // Section 2: Summary
    expect(p.summary).toContain('10+ years directing defensive cybersecurity operations.');

    // Section 3: Skills (Technical + Soft)
    expect(p.skills.length).toBe(2);
    expect(p.skills[1].category).toBe('Cloud & Infrastructure');
    expect(p.softSkills).toContain('Cross-functional Collaboration');

    // Section 4: Education
    expect(p.education.length).toBe(1);
    expect(p.education[0].degree).toBe('M.S. in Advanced Robotics');

    // Section 5: Experience
    expect(p.experience.length).toBe(1);
    expect(p.experience[0].role).toBe('Chief Technology Architect');

    // Section 6: Projects
    expect(p.projects.length).toBe(1);
    expect(p.projects[0].title).toBe('Quantum Guard Protocol');

    // Section 7: Certifications
    expect(p.certifications.length).toBe(1);
    expect(p.certifications[0].name).toBe('Certified Information Systems Security Professional');

    // Section 8: Achievements
    expect(p.achievements.length).toBe(2);

    // Section 9: Social Links
    expect(p.personalInfo.github).toBe('https://github.com/sarah-j-connor');
    expect(p.personalInfo.linkedin).toBe('https://linkedin.com/in/sarah-j-connor');
    expect(p.personalInfo.twitter).toBe('https://x.com/sarah_j_connor');
    expect(p.personalInfo.website).toBe('https://sarahconnor.org');
  });

  // 6. PUBLIC PORTFOLIO REFLECTION
  it('should reflect all edited sections on the public /p/:slug endpoint', async () => {
    const res = await request(app).get(`/api/portfolios/public/${portfolioSlug}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.portfolio.personalInfo.fullName).toBe('Sarah J. Connor');
    expect(res.body.portfolio.projects[0].title).toBe('Quantum Guard Protocol');
  });

  // 7. UNAUTHORIZED / OWNERSHIP PROTECTION
  it('should prevent an unauthorized user from modifying another user\'s portfolio', async () => {
    // Create another user
    const otherUserRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Hacker User',
        email: `hacker_${Date.now()}@editor-suite.portify.dev`,
        password: 'Password123!',
      });
    const hackerToken = otherUserRes.body.token;

    const res = await request(app)
      .put(`/api/portfolios/${portfolioId}`)
      .set('Authorization', `Bearer ${hackerToken}`)
      .send({ title: 'Tampered Title' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

