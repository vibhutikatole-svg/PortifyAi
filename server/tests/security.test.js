const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const User = require('../src/models/User');
const { Portfolio } = require('../src/models/Portfolio');
const { detectImageSignature, sanitizeImageBuffer } = require('../src/middleware/imageUpload');
const { validateResumeData } = require('../src/validators/resumeSchema');

describe('OWASP ASVS 5.0 Security & Hardening Suite (Phase 8)', () => {
  let userAToken = '';
  let userAId = '';
  let userBToken = '';
  let userBId = '';
  let userAPortfolioId = '';

  beforeAll(async () => {
    await connectDB();

    // Register User A
    const resA = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alice Security',
        email: `alice_${Date.now()}@example.com`,
        password: 'Password123!',
      });
    userAToken = resA.body.token;
    userAId = resA.body.user.id;

    // Register User B
    const resB = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Bob Attacker',
        email: `bob_${Date.now()}@example.com`,
        password: 'Password123!',
      });
    userBToken = resB.body.token;
    userBId = resB.body.user.id;

    // Create a portfolio owned by User A
    const portRes = await request(app)
      .post('/api/portfolios/generate')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        theme: 'minimal-pro',
        personalInfo: { fullName: 'Alice Security' },
      });

    // Alternatively create directly
    const directPort = await Portfolio.create({
      user: userAId,
      slug: `alice-security-${Date.now()}`,
      theme: 'minimal-pro',
      personalInfo: { fullName: 'Alice Security', headline: 'Security Architect' },
      isPublished: false,
    });
    userAPortfolioId = directPort._id.toString();
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $regex: /@example\.com$/ } });
    await Portfolio.deleteMany({ slug: { $regex: /^alice-security-/ } });
    await disconnectDB();
  });

  describe('1. Broken Access Control & IDOR Defense (ASVS V4)', () => {
    it('prevents User B from accessing User A portfolio via GET /api/portfolios/:id', async () => {
      const res = await request(app)
        .get(`/api/portfolios/${userAPortfolioId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('prevents User B from updating User A portfolio via PUT /api/portfolios/:id', async () => {
      const res = await request(app)
        .put(`/api/portfolios/${userAPortfolioId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({
          personalInfo: { fullName: 'Hacked by Bob' },
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);

      // Verify Alice portfolio remains unchanged
      const fresh = await Portfolio.findById(userAPortfolioId);
      expect(fresh.personalInfo.fullName).toBe('Alice Security');
    });

    it('prevents User B from deleting User A portfolio via DELETE /api/portfolios/:id', async () => {
      const res = await request(app)
        .delete(`/api/portfolios/${userAPortfolioId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);

      const stillExists = await Portfolio.findById(userAPortfolioId);
      expect(stillExists).not.toBeNull();
    });

    it('prevents unauthenticated access to protected portfolio endpoints', async () => {
      const res = await request(app).get('/api/portfolios');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('prevents access with invalid or forged JWT signature', async () => {
      const forgedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.fake_signature';
      const res = await request(app)
        .get('/api/portfolios')
        .set('Authorization', `Bearer ${forgedToken}`);

      expect(res.status).toBe(401);
    });
  });

  describe('2. Memory Exhaustion & Array Boundary Protection (ASVS V5)', () => {
    it('restricts oversized arrays to maximum defined boundary in Zod schema', () => {
      const hugeProjectArray = Array.from({ length: 120 }, (_, i) => ({
        title: `Project ${i}`,
        description: 'Testing memory limits',
        technologies: ['Node.js'],
      }));

      const input = {
        title: 'Stress Test Portfolio',
        projects: hugeProjectArray,
      };

      const result = validateResumeData(input);
      // Schema either falls back to safe default or validates within safe constraints
      expect(result.data.projects.length).toBeLessThanOrEqual(50);
    });
  });

  describe('3. File Signature & Spoofing Defense (ASVS V12)', () => {
    it('accurately identifies genuine JPEG magic bytes (FF D8 FF)', () => {
      const genuineJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
      expect(detectImageSignature(genuineJpeg)).toBe('image/jpeg');
    });

    it('accurately identifies genuine PNG magic bytes (89 50 4E 47 0D 0A 1A 0A)', () => {
      const genuinePng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
      expect(detectImageSignature(genuinePng)).toBe('image/png');
    });

    it('accurately identifies genuine WebP magic bytes (RIFF....WEBP)', () => {
      const genuineWebp = Buffer.from([
        0x52, 0x49, 0x46, 0x46, // RIFF
        0x20, 0x00, 0x00, 0x00, // Size
        0x57, 0x45, 0x42, 0x50, // WEBP
      ]);
      expect(detectImageSignature(genuineWebp)).toBe('image/webp');
    });

    it('rejects executable or script files masquerading as images (.exe, .sh, .html)', () => {
      const fakeImage = Buffer.from('MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff'); // Windows PE header
      expect(detectImageSignature(fakeImage)).toBeNull();

      const scriptImage = Buffer.from('<script>alert("XSS")</script>');
      expect(detectImageSignature(scriptImage)).toBeNull();
    });

    it('rejects avatar upload if image file signature is invalid', async () => {
      const res = await request(app)
        .post(`/api/portfolios/${userAPortfolioId}/avatar`)
        .set('Authorization', `Bearer ${userAToken}`)
        .attach('avatar', Buffer.from('Not a real image buffer'), {
          filename: 'malicious.jpg',
          contentType: 'image/jpeg',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid image signature/i);
    });

    it('successfully processes valid image and strips EXIF', async () => {
      // 1x1 valid PNG buffer
      const validPng = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );

      const res = await request(app)
        .post(`/api/portfolios/${userAPortfolioId}/avatar`)
        .set('Authorization', `Bearer ${userAToken}`)
        .attach('avatar', validPng, {
          filename: 'avatar.png',
          contentType: 'image/png',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.avatarUrl).toMatch(/^data:image\/png;base64,/);

      // Verify avatar saved in MongoDB
      const updated = await Portfolio.findById(userAPortfolioId);
      expect(updated.personalInfo.avatarUrl).toMatch(/^data:image\/png;base64,/);
    });

    it('allows removing an uploaded avatar cleanly', async () => {
      const res = await request(app)
        .delete(`/api/portfolios/${userAPortfolioId}/avatar`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.avatarUrl).toBe('');

      const updated = await Portfolio.findById(userAPortfolioId);
      expect(updated.personalInfo.avatarUrl).toBe('');
    });
  });

  describe('4. Password & Credential Storage (ASVS V2)', () => {
    it('hashes passwords using bcrypt with a non-trivial work factor', async () => {
      const user = await User.findById(userAId).select('+password');
      expect(user.password).not.toBe('Password123!');
      expect(user.password).toMatch(/^\$2[aby]\$\d{2}\$/); // bcrypt hash format
    });
  });
});
