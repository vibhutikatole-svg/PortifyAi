const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const User = require('../src/models/User');
const { Portfolio } = require('../src/models/Portfolio');

describe('Authentication, Dashboard & User Ownership Test Suite', () => {
  let userAToken = '';
  let userAId = '';
  const userAEmail = `user_a_${Date.now()}@auth-suite.portify.dev`;

  let userBToken = '';
  let userBId = '';
  const userBEmail = `user_b_${Date.now()}@auth-suite.portify.dev`;

  let userAPortfolioId = '';
  let userBPortfolioId = '';

  beforeAll(async () => {
    await connectDB('mongodb://127.0.0.1:27017/portify_ai_test');
    await User.deleteMany({ email: { $regex: /@auth-suite\.portify\.dev$/ } });
    await Portfolio.deleteMany({ slug: { $regex: /^test-owner-/ } });
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $regex: /@auth-suite\.portify\.dev$/ } });
    await Portfolio.deleteMany({ slug: { $regex: /^test-owner-/ } });
    await disconnectDB();
  });

  // 1. REGISTRATION TESTS
  describe('User Registration', () => {
    it('should register a valid new user and return JWT', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Alice Architect',
          email: userAEmail,
          password: 'Password123!',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.name).toBe('Alice Architect');
      expect(res.body.user.email).toBe(userAEmail);

      userAToken = res.body.token;
      userAId = res.body.user.id;
    });

    it('should reject registration when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'incomplete@portify.dev',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/provide name, email, and password/i);
    });

    it('should reject registration with password shorter than 6 characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Short Pass',
          email: `shortpass_${Date.now()}@portify.dev`,
          password: '123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/at least 6 characters/i);
    });

    it('should reject registration with invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Invalid Email',
          email: 'not-an-email',
          password: 'Password123!',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/valid email/i);
    });

    it('should reject duplicate email registration', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Alice Clone',
          email: userAEmail,
          password: 'AnotherPassword123!',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists/i);
    });
  });

  // 2. LOGIN TESTS
  describe('User Login', () => {
    it('should login with valid credentials and return JWT', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: userAEmail,
          password: 'Password123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(userAEmail);
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: userAEmail,
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid email or password/i);
    });

    it('should reject login for non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@portify.dev',
          password: 'Password123!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid email or password/i);
    });

    it('should reject login when fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: userAEmail });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // 3. SESSION PERSISTENCE & TOKEN AUTHENTICATION
  describe('Session Persistence & Protected Routes', () => {
    it('should persist session via GET /api/auth/me with valid Bearer token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe(userAEmail);
      expect(res.body.user.name).toBe('Alice Architect');
    });

    it('should deny unauthorized access when token is omitted', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should deny unauthorized access with an invalid/malformed token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.malformed.token');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // 4. PROFILE UPDATE & SETTINGS
  describe('Profile Settings & Update', () => {
    it('should update user display name via PUT /api/auth/profile', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          name: 'Alice Principal Engineer',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.name).toBe('Alice Principal Engineer');

      // Verify persistence in MongoDB
      const updatedUser = await User.findById(userAId);
      expect(updatedUser.name).toBe('Alice Principal Engineer');
    });

    it('should prevent updating email to an already existing address', async () => {
      // First create User B
      const resB = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Bob Builder',
          email: userBEmail,
          password: 'BobPassword123!',
        });
      userBToken = resB.body.token;
      userBId = resB.body.user.id;

      // User A tries to change email to User B's email
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          email: userBEmail,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists/i);
    });
  });

  // 5. PASSWORD CHANGE WORKFLOW
  describe('Password Change Workflow', () => {
    it('should reject password change with incorrect current password', async () => {
      const res = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          currentPassword: 'WrongOldPassword',
          newPassword: 'BrandNewPassword123!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/current password is incorrect/i);
    });

    it('should reject password change when new password is < 6 characters', async () => {
      const res = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          currentPassword: 'Password123!',
          newPassword: 'short',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/at least 6 characters/i);
    });

    it('should successfully change password with valid current password', async () => {
      const res = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          currentPassword: 'Password123!',
          newPassword: 'NewSecurePassword123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/password changed successfully/i);
    });

    it('should fail login with old password after password change', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: userAEmail,
          password: 'Password123!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should succeed login with new password after password change', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: userAEmail,
          password: 'NewSecurePassword123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      userAToken = res.body.token; // Refresh token
    });
  });

  // 6. DASHBOARD & STRICT USER OWNERSHIP ISOLATION
  describe('Dashboard & User Ownership Isolation', () => {
    beforeAll(async () => {
      // Create Portfolio for User A
      const pA = await Portfolio.create({
        user: userAId,
        title: "Alice's Cloud Architecture Portfolio",
        slug: `test-owner-alice-${Date.now()}`,
        theme: 'minimal-pro',
        personalInfo: {
          fullName: 'Alice Principal Engineer',
          headline: 'Cloud Solutions Architect',
          email: userAEmail,
        },
        summary: 'Expert in microservices and distributed databases.',
      });
      userAPortfolioId = pA._id.toString();

      // Create Portfolio for User B
      const pB = await Portfolio.create({
        user: userBId,
        title: "Bob's Full Stack Portfolio",
        slug: `test-owner-bob-${Date.now()}`,
        theme: 'dark-developer',
        personalInfo: {
          fullName: 'Bob Builder',
          headline: 'Full Stack Engineer',
          email: userBEmail,
        },
        summary: 'Building end-to-end web apps with Node and React.',
      });
      userBPortfolioId = pB._id.toString();
    });

    it("User A's portfolio list should contain ONLY User A's portfolios", async () => {
      const res = await request(app)
        .get('/api/portfolios')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const ids = res.body.portfolios.map((p) => p._id.toString());
      expect(ids).toContain(userAPortfolioId);
      expect(ids).not.toContain(userBPortfolioId);
    });

    it("User B's portfolio list should contain ONLY User B's portfolios", async () => {
      const res = await request(app)
        .get('/api/portfolios')
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const ids = res.body.portfolios.map((p) => p._id.toString());
      expect(ids).toContain(userBPortfolioId);
      expect(ids).not.toContain(userAPortfolioId);
    });

    it("User B CANNOT read User A's portfolio by ID (ownership protection)", async () => {
      const res = await request(app)
        .get(`/api/portfolios/${userAPortfolioId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/not found or you are not authorized/i);
    });

    it("User B CANNOT update User A's portfolio (ownership protection)", async () => {
      const res = await request(app)
        .put(`/api/portfolios/${userAPortfolioId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({
          title: 'Hacked Title By Bob',
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);

      // Verify User A's portfolio title remains unchanged
      const unaffected = await Portfolio.findById(userAPortfolioId);
      expect(unaffected.title).toBe("Alice's Cloud Architecture Portfolio");
    });

    it("User B CANNOT delete User A's portfolio (ownership protection)", async () => {
      const res = await request(app)
        .delete(`/api/portfolios/${userAPortfolioId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);

      // Verify User A's portfolio still exists
      const unaffected = await Portfolio.findById(userAPortfolioId);
      expect(unaffected).not.toBeNull();
    });

    it("User A can successfully update their own portfolio", async () => {
      const res = await request(app)
        .put(`/api/portfolios/${userAPortfolioId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: "Alice's Updated Architecture Studio",
          theme: 'creative-gradient',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.portfolio.title).toBe("Alice's Updated Architecture Studio");
      expect(res.body.portfolio.theme).toBe('creative-gradient');
    });

    it("User A can successfully delete their own portfolio", async () => {
      const res = await request(app)
        .delete(`/api/portfolios/${userAPortfolioId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const deleted = await Portfolio.findById(userAPortfolioId);
      expect(deleted).toBeNull();
    });
  });
});
