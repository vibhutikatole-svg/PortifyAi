const { parseResumeDeterministically } = require('../src/services/deterministicParser');
const { extractEvidenceBasedProjects, isNewProjectTitle, titleSimilarity } = require('../src/services/projectExtractionService');

describe('Project Extraction Accuracy Suite (Phase 4)', () => {
  it('correctly calculates title similarity for deduplication', () => {
    expect(titleSimilarity('AI Portfolio Generator', 'ai portfolio generator')).toBe(1);
    expect(titleSimilarity('Portify AI', 'Portify AI - Intelligent SaaS')).toBeGreaterThan(0.6);
    expect(titleSimilarity('E-Commerce Website', 'Weather Dashboard')).toBeLessThan(0.3);
  });

  it('rejects roles, dates, and non-project headers as project titles', () => {
    expect(isNewProjectTitle('Full Stack Software Engineer')).toBe(false);
    expect(isNewProjectTitle('Senior Frontend Developer')).toBe(false);
    expect(isNewProjectTitle('May 2022 - Present')).toBe(false);
    expect(isNewProjectTitle('Jan 2021 - Dec 2022')).toBe(false);
    expect(isNewProjectTitle('Key Responsibilities:')).toBe(false);
    expect(isNewProjectTitle('Technologies Used:')).toBe(false);
    expect(isNewProjectTitle('Projects')).toBe(false);
    expect(isNewProjectTitle('Experience')).toBe(false);
  });

  it('identifies genuine project titles correctly', () => {
    expect(isNewProjectTitle('DevPulse — Realtime Developer Dashboard')).toBe(true);
    expect(isNewProjectTitle('CloudMesh | Distributed KV Store')).toBe(true);
    expect(isNewProjectTitle('Portify AI (https://github.com/user/portify)')).toBe(true);
    expect(isNewProjectTitle('NeuroVision')).toBe(true);
  });

  it('extracts EXACTLY 4 projects from a 4-project resume without splitting roles or dates', () => {
    const resumeText = `
ALEX MORGAN
alex.morgan@example.com | (555) 019-2834 | San Francisco, CA
https://linkedin.com/in/alexmorgan | https://github.com/alexm

PROFESSIONAL SUMMARY
Senior Full Stack Engineer with 6+ years of experience architecting distributed systems and cloud applications.

EXPERIENCE
Lead Full Stack Engineer | Stripe | San Francisco, CA | 2021 - Present
- Architected core payments telemetry system handling 45k ops/sec.
- Reduced p99 latency by 34% through Redis caching layer.

PROJECTS

1. DevPulse — Realtime Developer Observability Platform
Lead Architect | Jan 2023 - Present
https://devpulse.io | https://github.com/alexm/devpulse
Built high-throughput distributed tracing dashboard for microservices.
- Implemented real-time WebSocket ingestion processing 100k events/min.
- Tech Stack: TypeScript, React, Go, Kafka, ClickHouse, Docker

2. CloudMesh: Distributed Key-Value Store
Solo Creator | May 2022 - Dec 2022
https://github.com/alexm/cloudmesh
Engineered a fault-tolerant Raft-consensus distributed store from scratch.
- Benchmarked at 15,000 write ops/sec with sub-millisecond p50 latency.
- Supported distributed snapshotting and cluster self-healing.
- Technologies: Go, Raft, gRPC, Protobuf

3. CryptoLens — Automated Blockchain Forensics
Core Contributor | Sep 2021 - Feb 2022
https://cryptolens.dev
Developed automated transaction graph analyzer for EVM-compatible chains.
- Indexed over 10M transactions using custom Ethereum RPC workers.
- Technologies: Python, FastAPI, Neo4j, React, Web3.js

4. TaskFlow Pro — Collaborative Workspace Engine
Author | Jun 2020 - Dec 2020
https://taskflowpro.app | https://github.com/alexm/taskflow
Created an offline-first collaborative task management application.
- Engineered operational transformation engine for multi-user document synchronization.
- Stack: React, Node.js, Express, MongoDB, Redis

SKILLS
Languages: TypeScript, JavaScript, Go, Python
Frameworks: React, Next.js, Node.js, Express, FastAPI
Databases: PostgreSQL, MongoDB, Redis, ClickHouse, Neo4j
Tools: Docker, Kubernetes, AWS, Git, CI/CD

EDUCATION
B.S. in Computer Science | UC Berkeley | 2016 - 2020
GPA: 3.85
`;

    const parsed = parseResumeDeterministically(resumeText);

    // Verify exactly 4 projects are extracted - NOT 8, NOT 11!
    expect(parsed.projects).toBeDefined();
    expect(parsed.projects.length).toBe(4);

    const titles = parsed.projects.map((p) => p.title);
    expect(titles[0]).toMatch(/DevPulse/i);
    expect(titles[1]).toMatch(/CloudMesh/i);
    expect(titles[2]).toMatch(/CryptoLens/i);
    expect(titles[3]).toMatch(/TaskFlow Pro/i);

    // Ensure dates and roles are NOT treated as project titles
    for (const title of titles) {
      expect(title).not.toMatch(/Lead Architect/i);
      expect(title).not.toMatch(/Solo Creator/i);
      expect(title).not.toMatch(/Core Contributor/i);
      expect(title).not.toMatch(/Author/i);
      expect(title).not.toMatch(/Jan 2023/i);
      expect(title).not.toMatch(/May 2022/i);
      expect(title).not.toMatch(/Sep 2021/i);
      expect(title).not.toMatch(/Jun 2020/i);
    }

    // Verify links and technologies captured
    expect(parsed.projects[0].liveUrl).toBe('https://devpulse.io');
    expect(parsed.projects[0].repoUrl).toBe('https://github.com/alexm/devpulse');
    expect(parsed.projects[0].technologies).toEqual(
      expect.arrayContaining(['TypeScript', 'React', 'Go', 'Kafka', 'Docker'])
    );

    expect(parsed.projects[1].repoUrl).toBe('https://github.com/alexm/cloudmesh');
    expect(parsed.projects[1].technologies).toEqual(
      expect.arrayContaining(['Go', 'Raft', 'gRPC'])
    );
  });

  it('handles resumes with no projects gracefully', () => {
    const resumeText = `
JANE DOE
jane@example.com | 123-456-7890 | New York, NY

EXPERIENCE
Accountant | ABC Corp | 2020 - 2023
- Managed ledgers and payroll.

EDUCATION
B.A. Accounting | NYU | 2016 - 2020
`;
    const parsed = parseResumeDeterministically(resumeText);
    expect(parsed.projects).toEqual([]);
  });

  it('does not leak experience, education, or skills into projects', () => {
    const resumeText = `
JOHN SMITH
john@example.com

SKILLS
JavaScript, Python, Docker

EXPERIENCE
Software Engineer | Meta | 2021 - 2023
- Built internal tooling.

EDUCATION
B.S. Software Engineering | MIT | 2017 - 2021

PROJECTS
SmartChat: Realtime AI Chatbot
https://github.com/john/smartchat
Built a realtime chatbot with WebSockets.
Technologies: React, Node.js, Socket.io
`;
    const parsed = parseResumeDeterministically(resumeText);
    expect(parsed.projects.length).toBe(1);
    expect(parsed.projects[0].title).toMatch(/SmartChat/i);
    expect(parsed.experience.length).toBe(1);
    expect(parsed.education.length).toBe(1);
  });
});
