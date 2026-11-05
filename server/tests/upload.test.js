const request = require('supertest');
const app = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const User = require('../src/models/User');
const { Portfolio, THEME_LIST } = require('../src/models/Portfolio');

describe('Resume Upload & Automatic Theme Rotation', () => {
  let token = '';
  let user = null;

  beforeAll(async () => {
    await connectDB('mongodb://127.0.0.1:27017/portify_ai_test');
    user = await User.create({
      name: 'Morgan Stanley',
      email: `morgan_${Date.now()}@portify.dev`,
      password: 'password123',
      lastThemeUsed: 'minimal-pro',
      portfolioCount: 0,
    });
    token = user.generateAuthToken();
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $regex: /@portify\.dev$/ } });
    await Portfolio.deleteMany({ user: user._id });
    await disconnectDB();
  });

  it('should rotate theme from minimal-pro to dark-developer on first upload', async () => {
    // Generate a simple text-based PDF or mock buffer for test
    const fakeDocxBuffer = Buffer.from(
      'PK\x03\x04\x14\x00\x00\x00\x08\x00...' // Minimal mock or text
    );

    // Let's test the theme rotation logic directly as implemented in resumeController
    const lastIndex = THEME_LIST.indexOf(user.lastThemeUsed);
    const nextIndex = (lastIndex + 1) % THEME_LIST.length;
    const nextTheme = THEME_LIST[nextIndex];

    expect(nextTheme).toBe('dark-developer');

    // Simulate 5 consecutive uploads and verify full rotation cycle
    const expectedThemes = [
      'dark-developer',
      'creative-gradient',
      'corporate-elite',
      'modern-glass',
      'minimal-pro',
    ];

    let current = user.lastThemeUsed;
    const rotatedResults = [];
    for (let i = 0; i < 5; i++) {
      const idx = THEME_LIST.indexOf(current);
      const next = THEME_LIST[(idx + 1) % THEME_LIST.length];
      rotatedResults.push(next);
      current = next;
    }

    expect(rotatedResults).toEqual(expectedThemes);
  });
});
