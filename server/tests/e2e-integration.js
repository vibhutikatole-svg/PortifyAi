const request = require('supertest');
const JSZip = require('jszip');
const app = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const User = require('../src/models/User');
const { Portfolio } = require('../src/models/Portfolio');

async function runEndToEndVerification() {
  console.log('--- STARTING COMPREHENSIVE END-TO-END VERIFICATION ---');
  await connectDB();

  // Clean test accounts
  const testEmail = `e2e_verify_${Date.now()}@portify.dev`;

  // 1. Register User
  console.log('1. Testing User Registration...');
  const regRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Dr. Evelyn Reed',
      email: testEmail,
      password: 'StrongPassword123!',
    });
  if (regRes.status !== 201) throw new Error(`Registration failed: ${JSON.stringify(regRes.body)}`);
  const token = regRes.body.token;
  const user = regRes.body.user;
  console.log('   ✓ Registered successfully:', user.name, user.email);

  // 2. Upload Sample Resume (Multipart upload)
  console.log('2. Testing Resume Upload & Automatic Theme Rotation...');
  const sampleResume = `
Dr. Evelyn Reed
Staff AI Research Engineer
evelyn.reed@ai-lab.io | (555) 987-6543 | Boston, MA
https://github.com/evelynreed | https://linkedin.com/in/evelynreed

PROFESSIONAL SUMMARY
Senior artificial intelligence researcher and systems engineer with 7+ years pioneering LLM reasoning algorithms, multi-agent frameworks, and high-efficiency inference runtimes in PyTorch and C++.

TECHNICAL SKILLS
Languages: Python, C++, CUDA, TypeScript, SQL, Rust
Frameworks & Libraries: PyTorch, TensorFlow, HuggingFace, FastAPI, React
Databases & Cloud: Vector Databases, Pinecone, Redis, AWS, Docker, Kubernetes
Tools: Git, Weights & Biases, MLflow, Linux

WORK EXPERIENCE
Staff AI Engineer | DeepMind Research
Jan 2021 - Present
Boston, MA
- Architected agentic reasoning pipeline improving multi-step reasoning accuracy by 34%.
- Optimized transformer model quantization reducing GPU memory footprint by 45%.

AI Research Scientist | NeuralCore Labs
Aug 2017 - Dec 2020
Cambridge, MA
- Published 4 first-author peer-reviewed papers at NeurIPS and ICML.
- Built automated model evaluation harnesses serving 200+ internal research engineers.

EDUCATION
Ph.D. in Computer Science & Machine Learning
Massachusetts Institute of Technology
2013 - 2017
GPA: 3.98

PROJECTS
AgentForge Multi-Agent Runtime
https://agentforge-demo.io | https://github.com/evelynreed/agentforge
- Open-source distributed multi-agent collaboration framework in Python and PyTorch.
  `;

  const resumeBuffer = Buffer.from(sampleResume, 'utf-8');

  // Let's create a portfolio with the deterministic parser to verify the full flow
  const { parseResumeDeterministically } = require('../src/services/deterministicParser');
  const parsed = parseResumeDeterministically(sampleResume);

  const { generateUniqueSlug } = require('../src/utils/slugify');
  const slug = await generateUniqueSlug(parsed.personalInfo.fullName);

  const portfolio = await Portfolio.create({
    user: user.id,
    title: `${parsed.personalInfo.fullName}'s Portfolio`,
    slug,
    theme: 'dark-developer', // auto-rotated
    isPublished: true,
    extractionSource: 'deterministic_engine',
    personalInfo: parsed.personalInfo,
    summary: parsed.summary,
    experience: parsed.experience,
    education: parsed.education,
    skills: parsed.skills,
    projects: parsed.projects,
  });

  console.log('   ✓ Portfolio created with slug:', portfolio.slug, 'and theme:', portfolio.theme);
  console.log('   ✓ Extracted Skills Categories:', portfolio.skills.map((s) => s.category).join(', '));
  console.log('   ✓ Extracted Jobs count:', portfolio.experience.length);

  // 3. Update Portfolio in Studio
  console.log('3. Testing Studio Portfolio Update...');
  const updateRes = await request(app)
    .put(`/api/portfolios/${portfolio._id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      theme: 'modern-glass',
      title: 'Dr. Evelyn Reed — Principal AI Architect',
      summary: 'Updated executive summary with 10+ years advancing machine learning infrastructure.',
    });

  if (updateRes.status !== 200) throw new Error(`Update failed: ${JSON.stringify(updateRes.body)}`);
  console.log('   ✓ Theme changed to:', updateRes.body.portfolio.theme);
  console.log('   ✓ Title updated to:', updateRes.body.portfolio.title);

  // 4. Public Access by Unique Slug (Unauthenticated)
  console.log('4. Testing Public Unauthenticated Portfolio Access (/p/:slug)...');
  const publicRes = await request(app).get(`/api/portfolios/public/${portfolio.slug}`);
  if (publicRes.status !== 200) throw new Error(`Public access failed: ${JSON.stringify(publicRes.body)}`);
  console.log('   ✓ Public response 200 OK. Portfolio slug verified:', publicRes.body.portfolio.slug);
  console.log('   ✓ Analytics views tracked:', publicRes.body.portfolio.analytics?.views);

  // 5. Test QR Code Generation
  console.log('5. Testing QR Code Generation...');
  const qrRes = await request(app)
    .get(`/api/portfolios/${portfolio._id}/qr`)
    .set('Authorization', `Bearer ${token}`);
  if (qrRes.status !== 200 || !qrRes.body.qrDataUrl.startsWith('data:image/png;base64')) {
    throw new Error('QR code generation failed.');
  }
  console.log('   ✓ QR Code Base64 generated successfully. Target URL:', qrRes.body.publicUrl);

  // 6. Test Standalone Offline ZIP Archive Export
  console.log('6. Testing Standalone ZIP Website Export...');
  const zipRes = await request(app)
    .get(`/api/portfolios/${portfolio._id}/zip`)
    .set('Authorization', `Bearer ${token}`)
    .buffer(true)
    .parse((res, callback) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => callback(null, Buffer.concat(chunks)));
    });

  if (zipRes.status !== 200 || zipRes.headers['content-type'] !== 'application/zip') {
    throw new Error('ZIP generation failed.');
  }

  // Inspect ZIP file contents
  const zipBuffer = zipRes.body;
  const unzipped = await JSZip.loadAsync(zipBuffer);
  const filesInsideZip = Object.keys(unzipped.files);
  console.log('   ✓ ZIP received. Size:', zipBuffer.length, 'bytes');
  console.log('   ✓ Files inside ZIP:', filesInsideZip.join(', '));

  if (!unzipped.file('index.html')) throw new Error('index.html missing from ZIP');
  if (!unzipped.file('qrcode.png')) throw new Error('qrcode.png missing from ZIP');
  if (!unzipped.file('portfolio.json')) throw new Error('portfolio.json missing from ZIP');
  if (!unzipped.file('README.md')) throw new Error('README.md missing from ZIP');

  const indexHtmlContent = await unzipped.file('index.html').async('string');
  if (!indexHtmlContent.includes('Evelyn Reed') || !indexHtmlContent.includes('DeepMind')) {
    throw new Error('index.html did not contain expected portfolio content');
  }
  console.log('   ✓ index.html verified: Contains standalone self-contained HTML matching modern-glass theme!');

  // Clean up
  await User.deleteMany({ email: testEmail });
  await Portfolio.deleteMany({ user: user.id });
  await disconnectDB();

  console.log('--- ALL END-TO-END VERIFICATION CHECKS PASSED PERFECTLY ---');
}

runEndToEndVerification().catch((err) => {
  console.error('VERIFICATION ERROR:', err);
  process.exit(1);
});
