const request = require('supertest');
const fs = require('fs');
const path = require('path');
const os = require('os');
const JSZip = require('jszip');
const { connectDB, disconnectDB } = require('../src/config/db');
const app = require('../src/app');
const User = require('../src/models/User');
const { Portfolio } = require('../src/models/Portfolio');
const { generateUniqueSlug, toSlug } = require('../src/utils/slugify');
const {
  renderStandaloneHTML,
  generateStandaloneCSS,
  generateStandaloneJS,
  generatePortfolioZip,
} = require('../src/services/zipService');
const { generateQRBuffer, generateQRDataUrl } = require('../src/services/qrService');

describe('Portify AI — Complete Portfolio Export Systems (Live Portfolio & ZIP Export)', () => {
  let tokenOwner = '';
  let ownerId = '';
  let tokenGuest = '';
  let guestId = '';
  let testPortfolio = null;
  const timestamp = Date.now();

  beforeAll(async () => {
    await connectDB('mongodb://127.0.0.1:27017/portify_ai_test');

    // Clean up any stale test records
    await User.deleteMany({ email: { $regex: /@portify-exports-test\.dev$/ } });
    await Portfolio.deleteMany({ slug: { $regex: /^export-candidate-/ } });

    // 1. Create owner user
    const ownerRes = await request(app).post('/api/auth/register').send({
      name: 'Julian Vance',
      email: `owner_${timestamp}@portify-exports-test.dev`,
      password: 'Password123!',
    });
    tokenOwner = ownerRes.body.token;
    ownerId = ownerRes.body.user.id;

    // 2. Create guest user
    const guestRes = await request(app).post('/api/auth/register').send({
      name: 'Guest Reviewer',
      email: `guest_${timestamp}@portify-exports-test.dev`,
      password: 'Password123!',
    });
    tokenGuest = guestRes.body.token;
    guestId = guestRes.body.user.id;

    // 3. Create a comprehensive portfolio with all 9 sections
    const initialSlug = await generateUniqueSlug('export-candidate-julian');
    testPortfolio = await Portfolio.create({
      user: ownerId,
      title: 'Julian Vance — Systems Architect',
      slug: initialSlug,
      theme: 'dark-developer',
      isPublished: true,
      personalInfo: {
        fullName: 'Julian Vance',
        headline: 'Principal Distributed Systems Architect',
        email: 'julian.vance@distributed.dev',
        phone: '+1 (555) 901-2345',
        location: 'Seattle, WA, USA',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        website: 'https://julianvance.dev',
        github: 'https://github.com/julianvance',
        linkedin: 'https://linkedin.com/in/julianvance',
        twitter: 'https://x.com/julianvance',
      },
      summary:
        'Architect with 10+ years designing fault-tolerant distributed event streams and cloud architectures processing billions of daily events.',
      skills: [
        { category: 'Distributed Systems', items: ['Go', 'Rust', 'Apache Kafka', 'gRPC', 'Raft'] },
        { category: 'Cloud Infrastructure', items: ['Kubernetes', 'AWS', 'Terraform', 'Prometheus'] },
      ],
      softSkills: ['Systems Architecture', 'Technical Strategy', 'Cross-Functional Mentorship'],
      experience: [
        {
          company: 'CloudScale Infrastructure',
          role: 'Staff Systems Architect',
          location: 'Seattle, WA',
          startDate: '2021',
          endDate: 'Present',
          current: true,
          description: 'Architected event-driven microservices for financial clients.',
          highlights: [
            'Reduced p99 consensus latency by 42% across 150M daily transactions.',
            'Engineered automated multi-region Kubernetes failover with zero data loss.',
          ],
        },
      ],
      education: [
        {
          institution: 'University of Washington',
          degree: 'M.S.',
          fieldOfStudy: 'Distributed Systems & Computer Science',
          graduationDate: '2019',
          gpa: '3.94',
        },
      ],
      projects: [
        {
          title: 'Distributed KV Store',
          description: 'High-performance LSM-tree replicated key-value store using Raft consensus.',
          technologies: ['Go', 'Raft', 'gRPC', 'Protobuf'],
          liveUrl: 'https://kvstore.julianvance.dev',
          repoUrl: 'https://github.com/julianvance/distributed-kv',
        },
      ],
      certifications: [
        {
          name: 'AWS Certified Solutions Architect — Professional',
          issuer: 'Amazon Web Services',
          issueDate: '2023',
          credentialUrl: 'https://aws.amazon.com/verify/123456',
        },
      ],
      achievements: [
        'Keynote Speaker at Distributed Systems Summit 2023',
        'Top 1% Contributor on open-source cloud telemetry frameworks',
      ],
    });
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $regex: /@portify-exports-test\.dev$/ } });
    await Portfolio.deleteMany({ slug: { $regex: /^export-candidate-/ } });
    await disconnectDB();
  });

  // ===================================================================
  // SECTION A: LIVE PORTFOLIO SYSTEM TESTS
  // ===================================================================
  describe('A. Live Portfolio System Tests', () => {
    it('should generate unique URL-safe slugs with numeric conflict suffixes', async () => {
      const slug1 = await generateUniqueSlug('Alexander Vance');
      expect(slug1).toBe('alexander-vance');

      // Create a temporary portfolio with slug1
      const temp1 = await Portfolio.create({
        user: ownerId,
        title: 'Temp 1',
        slug: slug1,
      });

      // Next slug with same name must receive suffix
      const slug2 = await generateUniqueSlug('Alexander Vance');
      expect(slug2).toBe('alexander-vance-1');

      const temp2 = await Portfolio.create({
        user: ownerId,
        title: 'Temp 2',
        slug: slug2,
      });

      const slug3 = await generateUniqueSlug('Alexander Vance');
      expect(slug3).toBe('alexander-vance-2');

      // Cleanup temp
      await Portfolio.deleteMany({ _id: { $in: [temp1._id, temp2._id] } });
    });

    it('should convert special characters and spaces safely via toSlug', () => {
      expect(toSlug('Dr. Jane Doe, Ph.D. & Associates!')).toBe('dr-jane-doe-phd-associates');
      expect(toSlug('   Leading   --   DevOps    ')).toBe('leading-devops');
      expect(toSlug('')).toBe('portfolio');
    });

    it('GET /api/portfolios/public/:slug should return correct portfolio data and increment view counts', async () => {
      const initialViews = testPortfolio.analytics?.views || 0;

      const res = await request(app).get(`/api/portfolios/public/${testPortfolio.slug}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.portfolio).toBeDefined();
      expect(res.body.portfolio.slug).toBe(testPortfolio.slug);
      expect(res.body.portfolio.personalInfo.fullName).toBe('Julian Vance');
      expect(res.body.portfolio.theme).toBe('dark-developer');
      expect(res.body.portfolio.user.name).toBe('Julian Vance');

      // Wait a tick for async view increment
      await new Promise((r) => setTimeout(r, 100));
      const reloaded = await Portfolio.findById(testPortfolio._id);
      expect(reloaded.analytics.views).toBeGreaterThan(initialViews);
    });

    it('GET /api/portfolios/public/:slug should protect unpublished portfolios from public visitors', async () => {
      // 1. Set portfolio to unpublished
      await Portfolio.findByIdAndUpdate(testPortfolio._id, { isPublished: false });

      // Unauthenticated public request should return 404
      const resGuest = await request(app).get(`/api/portfolios/public/${testPortfolio.slug}`);
      expect(resGuest.status).toBe(404);
      expect(resGuest.body.success).toBe(false);
      expect(resGuest.body.message).toContain('private');

      // Another user with non-owner token should also get 404
      const resOtherUser = await request(app)
        .get(`/api/portfolios/public/${testPortfolio.slug}`)
        .set('Authorization', `Bearer ${tokenGuest}`);
      expect(resOtherUser.status).toBe(404);

      // The owner with valid token SHOULD be able to preview draft with isOwnerPreview: true
      const resOwner = await request(app)
        .get(`/api/portfolios/public/${testPortfolio.slug}`)
        .set('Authorization', `Bearer ${tokenOwner}`);
      expect(resOwner.status).toBe(200);
      expect(resOwner.body.success).toBe(true);
      expect(resOwner.body.isOwnerPreview).toBe(true);
      expect(resOwner.body.portfolio.personalInfo.fullName).toBe('Julian Vance');

      // Restore published status
      await Portfolio.findByIdAndUpdate(testPortfolio._id, { isPublished: true });
    });

    it('PUT /api/portfolios/:id should update theme and immediately reflect on public route', async () => {
      // Update theme to corporate-elite
      const updateRes = await request(app)
        .put(`/api/portfolios/${testPortfolio._id}`)
        .set('Authorization', `Bearer ${tokenOwner}`)
        .send({ theme: 'corporate-elite' });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.portfolio.theme).toBe('corporate-elite');

      // Verify public endpoint immediately returns corporate-elite
      const publicRes = await request(app).get(`/api/portfolios/public/${testPortfolio.slug}`);
      expect(publicRes.status).toBe(200);
      expect(publicRes.body.portfolio.theme).toBe('corporate-elite');
    });

    it('GET /api/portfolios/:id/qr should generate valid Base64 QR code Data URL containing live public link', async () => {
      const res = await request(app)
        .get(`/api/portfolios/${testPortfolio._id}/qr`)
        .set('Authorization', `Bearer ${tokenOwner}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.publicUrl).toContain(`/p/${testPortfolio.slug}`);
      expect(res.body.qrDataUrl).toMatch(/^data:image\/png;base64,/);
    });
  });

  // ===================================================================
  // SECTION B: STANDALONE ZIP EXPORT TESTS
  // ===================================================================
  describe('B. Standalone Offline ZIP Export Tests', () => {
    it('generatePortfolioZip should bundle all required standalone files without backend dependency', async () => {
      const publicUrl = `https://portify-ai.dev/p/${testPortfolio.slug}`;
      const zipBuffer = await generatePortfolioZip(testPortfolio.toObject(), publicUrl);

      expect(Buffer.isBuffer(zipBuffer)).toBe(true);
      expect(zipBuffer.length).toBeGreaterThan(5000);

      // Unpack in-memory with JSZip to inspect contents
      const unzipped = await JSZip.loadAsync(zipBuffer);

      // Verify required files are all present
      expect(unzipped.file('index.html')).not.toBeNull();
      expect(unzipped.file('style.css')).not.toBeNull();
      expect(unzipped.file('script.js')).not.toBeNull();
      expect(unzipped.file('qrcode.png')).not.toBeNull();
      expect(unzipped.file('README.md')).not.toBeNull();
      expect(unzipped.file('portfolio.json')).not.toBeNull();

      // Verify README.md contents
      const readmeText = await unzipped.file('README.md').async('string');
      expect(readmeText).toContain('Julian Vance');
      expect(readmeText).toContain('index.html');
      expect(readmeText).toContain('GitHub Pages');
      expect(readmeText).toContain('Netlify');

      // Verify portfolio.json parses accurately
      const jsonText = await unzipped.file('portfolio.json').async('string');
      const parsedData = JSON.parse(jsonText);
      expect(parsedData.personalInfo.fullName).toBe('Julian Vance');
      expect(parsedData.experience).toHaveLength(1);

      // Verify QR Code is valid PNG binary
      const qrData = await unzipped.file('qrcode.png').async('nodebuffer');
      expect(qrData.subarray(0, 4).toString('hex')).toBe('89504e47'); // PNG magic bytes
    });

    it('index.html should render all 9 sections and link local style.css and script.js', async () => {
      const publicUrl = `https://portify-ai.dev/p/${testPortfolio.slug}`;
      const html = renderStandaloneHTML(testPortfolio.toObject(), publicUrl);

      // 1. Asset links
      expect(html).toContain('rel="stylesheet" href="style.css"');
      expect(html).toContain('src="script.js"');

      // 2. Section 1: Hero / Personal Info
      expect(html).toContain('Julian Vance');
      expect(html).toContain('Principal Distributed Systems Architect');
      expect(html).toContain('Seattle, WA');
      expect(html).toContain('julian.vance@distributed.dev');

      // 3. Section 2: Summary
      expect(html).toContain('Architect with 10+ years designing fault-tolerant');

      // 4. Section 3: Skills (Technical & Soft Skills)
      expect(html).toContain('Distributed Systems');
      expect(html).toContain('Apache Kafka');
      expect(html).toContain('Cross-Functional Mentorship');

      // 5. Section 4: Higher Education
      expect(html).toContain('University of Washington');
      expect(html).toContain('M.S.');

      // 6. Section 5: Experience
      expect(html).toContain('CloudScale Infrastructure');
      expect(html).toContain('Staff Systems Architect');
      expect(html).toContain('Reduced p99 consensus latency by 42%');

      // 7. Section 6: Projects
      expect(html).toContain('Distributed KV Store');
      expect(html).toContain('Raft');

      // 8. Section 7: Certifications
      expect(html).toContain('AWS Certified Solutions Architect');

      // 9. Section 8: Achievements
      expect(html).toContain('Keynote Speaker at Distributed Systems Summit 2023');

      // 10. Section 9: Local QR Code
      expect(html).toContain('src="qrcode.png"');
    });

    it('generateStandaloneCSS should include full reset, responsive layout and theme definitions', () => {
      const css = generateStandaloneCSS('dark-developer');
      expect(css).toContain('box-sizing: border-box');
      expect(css).toContain('@media (max-width: 767px)');
      expect(css).toContain('theme-dark-developer');
      expect(css).toContain('.font-mono');
      expect(css).toContain('.grid');
    });

    it('generateStandaloneJS should include smooth scroll and email copy helpers', () => {
      const js = generateStandaloneJS();
      expect(js).toContain('scrollIntoView');
      expect(js).toContain('copyContactEmail');
      expect(js).toContain('printPortfolio');
    });

    it('should generate accurate standalone HTML for all 5 themes preserving visual layouts', () => {
      const sample = testPortfolio.toObject();
      const themes = ['minimal-pro', 'dark-developer', 'creative-gradient', 'corporate-elite', 'modern-glass'];

      for (const t of themes) {
        sample.theme = t;
        const html = renderStandaloneHTML(sample, `https://portify.dev/p/${sample.slug}`);

        expect(html).toContain(`theme-${t}`);
        expect(html).toContain('Julian Vance');
        expect(html).toContain('CloudScale Infrastructure');
        expect(html).toContain('Distributed KV Store');
        expect(html).toContain('qrcode.png');

        // Verify theme specific landmarks
        if (t === 'minimal-pro') {
          expect(html).toContain('font-serif');
          expect(html).toContain('Curriculum Vitae');
        } else if (t === 'dark-developer') {
          expect(html).toContain('portfolio.ts');
          expect(html).toContain('git log --graph --career');
        } else if (t === 'creative-gradient') {
          expect(html).toContain('Creative Showcase');
        } else if (t === 'corporate-elite') {
          expect(html).toContain('Executive Dossier');
          expect(html).toContain('Executive Leadership History');
        } else if (t === 'modern-glass') {
          expect(html).toContain('modern-glass');
          expect(html).toContain('Digital Identity Verification');
        }
      }
    });

    it('GET /api/portfolios/:id/zip should allow owner to download ZIP archive', async () => {
      const res = await request(app)
        .get(`/api/portfolios/${testPortfolio._id}/zip`)
        .set('Authorization', `Bearer ${tokenOwner}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/zip');
      expect(res.headers['content-disposition']).toContain(`portify-${testPortfolio.slug}.zip`);
      expect(Number(res.headers['content-length'])).toBeGreaterThan(5000);
    });

    it('GET /api/portfolios/public/:slug/zip should allow public guest download for published portfolio', async () => {
      const res = await request(app).get(`/api/portfolios/public/${testPortfolio.slug}/zip`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/zip');
      expect(res.headers['content-disposition']).toContain(`portify-${testPortfolio.slug}.zip`);
      expect(Number(res.headers['content-length'])).toBeGreaterThan(5000);
    });

    it('GET /api/portfolios/public/:slug/zip should return 404 for unpublished portfolio', async () => {
      // Temporarily unpublish
      await Portfolio.findByIdAndUpdate(testPortfolio._id, { isPublished: false });

      const res = await request(app).get(`/api/portfolios/public/${testPortfolio.slug}/zip`);
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);

      // Restore
      await Portfolio.findByIdAndUpdate(testPortfolio._id, { isPublished: true });
    });

    // ===================================================================
    // REAL DISK EXTRACTION & STANDALONE OFFLINE VERIFICATION
    // ===================================================================
    it('Real Disk Extraction: should extract generated ZIP to disk and verify all offline assets', async () => {
      const publicUrl = `https://portify-ai.dev/p/${testPortfolio.slug}`;
      const zipBuffer = await generatePortfolioZip(testPortfolio.toObject(), publicUrl);

      // Create a temporary directory on disk
      const tempExtractDir = fs.mkdtempSync(path.join(os.tmpdir(), 'portify-zip-verify-'));

      try {
        const unzipped = await JSZip.loadAsync(zipBuffer);

        // Write all files to disk
        const fileNames = Object.keys(unzipped.files);
        expect(fileNames).toContain('index.html');
        expect(fileNames).toContain('style.css');
        expect(fileNames).toContain('script.js');
        expect(fileNames).toContain('qrcode.png');
        expect(fileNames).toContain('README.md');
        expect(fileNames).toContain('portfolio.json');

        for (const fileName of fileNames) {
          const fileData = await unzipped.file(fileName).async('nodebuffer');
          fs.writeFileSync(path.join(tempExtractDir, fileName), fileData);
        }

        // Verify extracted files on real disk
        const indexHtmlPath = path.join(tempExtractDir, 'index.html');
        const styleCssPath = path.join(tempExtractDir, 'style.css');
        const scriptJsPath = path.join(tempExtractDir, 'script.js');
        const qrPngPath = path.join(tempExtractDir, 'qrcode.png');
        const readmePath = path.join(tempExtractDir, 'README.md');

        expect(fs.existsSync(indexHtmlPath)).toBe(true);
        expect(fs.existsSync(styleCssPath)).toBe(true);
        expect(fs.existsSync(scriptJsPath)).toBe(true);
        expect(fs.existsSync(qrPngPath)).toBe(true);
        expect(fs.existsSync(readmePath)).toBe(true);

        const diskHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
        expect(diskHtml.length).toBeGreaterThan(2000);
        expect(diskHtml).toContain('Julian Vance');
        expect(diskHtml).toContain('CloudScale Infrastructure');
        expect(diskHtml).toContain('style.css');
        expect(diskHtml).toContain('script.js');
        expect(diskHtml).toContain('qrcode.png');

        const diskCss = fs.readFileSync(styleCssPath, 'utf-8');
        expect(diskCss.length).toBeGreaterThan(1500);

        const diskJs = fs.readFileSync(scriptJsPath, 'utf-8');
        expect(diskJs.length).toBeGreaterThan(200);

        const qrStats = fs.statSync(qrPngPath);
        expect(qrStats.size).toBeGreaterThan(500);
      } finally {
        // Clean up extracted temp directory
        fs.rmSync(tempExtractDir, { recursive: true, force: true });
      }
    });
  });
});
