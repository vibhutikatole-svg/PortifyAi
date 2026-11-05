# Portify AI — Comprehensive Codebase & Architecture Audit Report

**Date**: November 4, 2026  
**Auditor**: Principal Software Architect & Senior Engineering Team  
**System**: Portify AI (MERN + AI Resume-to-Portfolio Engine)

---

## 1. Executive Summary

This audit assesses the current state of Portify AI across architecture, frontend UI/UX, responsive viewport utilization, resume extraction accuracy, AI model integration, security posture, and production readiness. 

While core CRUD operations and theme rendering exist and pass unit tests, the audit uncovered significant architectural gaps, layout limitations, styling antipatterns, and a critical bug in project extraction that inflates candidate project counts by up to 275% (4 projects extracted as 11).

### Key Findings Summary

| Severity | Count | Primary Impacted Areas |
| :--- | :---: | :--- |
| **Critical** | 2 | Resume Project Extraction Duplication (4 $\to$ 11 projects); In-memory rate limiting & unvalidated array validation bounds. |
| **High** | 4 | Viewport constriction (hardcoded `max-w-7xl`/`max-w-4xl` across app and themes); Brand identity violation (purple/indigo gradient overload); Lack of dedicated legal routes (Privacy/Terms); Missing manual profile image upload. |
| **Medium** | 5 | Generic header balance; Absence of evidence-based project schema; Lack of structured security audit logging; Fragile section partitioning in deterministic parser; Inconsistent Tailwind color tokens. |
| **Low** | 3 | Legacy devDependencies audit alerts; Splat route warnings; Redundant container wrappers. |

---

## 2. Architecture & Subsystem Inspection

### 2.1 Frontend Architecture (`client/src`)
- **Framework & Bundler**: Vite 6.0.7 with React 18.3.1 and Tailwind CSS 3.4.17.
- **Routing**: `react-router-dom` v6 with client-side protected route guards (`ProtectedRoute.jsx`).
- **State Management**: React Context (`AuthContext.jsx`, `ToastContext.jsx`) paired with component-level state in `EditorPage.jsx` and `DashboardPage.jsx`.
- **Layout Findings**:
  - `Container.jsx` enforces `max-w-7xl` (1280px), `max-w-6xl` (1152px), and `max-w-4xl` (896px) wrappers on wide screens.
  - On 1440px and 1920px viewports, over 40% of the display width is dead white space.
  - Dashboard tables and cards fail to stretch to available viewport width.
  - Themes (`MinimalProTheme.jsx`, `DarkDeveloperTheme.jsx`, etc.) explicitly constrain main body containers to `max-w-4xl mx-auto`.

### 2.2 Backend Architecture (`server/src`)
- **Runtime & Framework**: Node.js v24 with Express 4.21.2 and Mongoose 8.12.1.
- **Storage**: MongoDB with connection pooling in `config/db.js`.
- **File Upload Processing**: In-memory Multer buffers (`multer.memoryStorage()`) with 10MB limit and magic-byte binary header validation (`%PDF-`, `PK\x03\x04`).
- **Text Extraction Engines**:
  - `pdf-parse` for PDF text stream parsing.
  - `mammoth` for DOCX XML body extraction.
- **AI Integration**: `@google/generative-ai` with `gemini-1.5-flash` primary model and deterministic rule engine fallback.

### 2.3 Database Schemas & Data Models
- **`User` Model (`server/src/models/User.js`)**:
  - Encapsulates `name`, `email` (lowercase, unique), `password` (bcrypt salted, `select: false`), `portfolioCount`, `lastThemeUsed`.
  - Secure schema design: clean indexing and absence of sensitive field exposure.
- **`Portfolio` Model (`server/src/models/Portfolio.js`)**:
  - Stores `personalInfo`, `summary`, `experience`, `education`, `skills`, `softSkills`, `projects`, `certifications`, `achievements`, `theme`, `slug`, and `isPublished`.
  - Needs extension to support manual profile photo metadata and evidence-based project fields (`sourceEvidence`, `confidence`, `verificationStatus`).

### 2.4 Resume Extraction & Project Duplication Root Cause
- **Observed Defect**: An uploaded resume containing 4 distinct projects resulted in 11 projects displayed in the generated portfolio.
- **Root Cause Identified**:
  In `server/src/services/deterministicParser.js` lines 525–565:
  ```javascript
  const isBullet = /^([•\-*–—]|\d+\.)/.test(line);
  if (!isBullet && line.length < 80 && !line.includes('http')) {
    if (current && current.title) {
      projects.push(current);
    }
    current = {
      title: line.replace(/[:|–—].*$/, '').trim(),
      ...
    };
  ```
  Every single line under 80 characters that is not a bullet point and lacks "http" is categorized as a new project title. Real resumes feature project role titles (e.g., "Full Stack Lead"), date ranges ("May 2023 - Present"), company tags, and sub-headings. A single 4-line project was split into 3 to 4 artificial projects.
  Furthermore, `partitionSections()` lacked boundaries for non-standard resume sections (e.g., "Open Source", "Publications", "Volunteering"), dumping unrelated content directly into `sections.projects`.

---

## 3. Detailed Issue Classification

### Critical Issues

1. **[CRIT-01] Project Over-Extraction & Hallucination (4 $\to$ 11 Projects)**
   - *Subsystem*: `deterministicParser.js` & `aiService.js`
   - *Impact*: Compromises candidate trust and factual integrity. Portfolios display fractured sentence fragments and date lines as separate project cards.
   - *Action*: Implement dedicated Evidence-Based Project Extraction Service with explicit title boundary detection, date/role recognition, and duplicate merging.

2. **[CRIT-02] In-Memory Rate Limiting & Unbounded Collection Allocation**
   - *Subsystem*: `server/src/app.js` & `resumeSchema.js`
   - *Impact*: Rate limiter IP choke blocked automated test runs and developer workflows; lack of maximum item bounds in Zod schema permits potential payload amplification.
   - *Action*: Configure environment-aware thresholds and enforce strict `.max(50)` bounds on schema arrays.

### High Priority Issues

1. **[HIGH-01] Desktop Viewport Constriction**
   - *Subsystem*: `client/src/components/layout/Container.jsx`, `DashboardPage.jsx`, Themes
   - *Impact*: Application occupies only the center 50% of 1440px+ displays with expansive empty borders.
   - *Action*: Remove restrictive `max-w-7xl`/`max-w-4xl` limits; establish full-width CSS Grid / Flexbox architecture.

2. **[HIGH-02] Brand Identity & Color Palette Non-Compliance**
   - *Subsystem*: `client/tailwind.config.js`, `HomePage.jsx`, `Navbar.jsx`, Buttons
   - *Impact*: Saturated with prohibited purple/indigo gradients and generic SaaS styling.
   - *Action*: Replace with official brand palette: Deep Teal (`#176B67`), Soft Ivory (`#F7F5EF`), and Deep Charcoal (`#252B2A`).

3. **[HIGH-03] Missing Profile Photo Upload Functionality**
   - *Subsystem*: Frontend Editor & Backend Portfolio Schema
   - *Impact*: Users cannot personalize their portfolios with a validated professional headshot.
   - *Action*: Build secure image upload, preview, replace, and removal pipeline with MIME and signature checks.

4. **[HIGH-04] Missing Legal & Compliance Infrastructure**
   - *Subsystem*: React Router & Footer
   - *Impact*: Absence of dedicated Privacy Policy and Terms of Service prevents commercial launch readiness.
   - *Action*: Implement `/privacy` and `/terms` routes with authentic, product-specific policies.

### Medium Priority Issues

1. **[MED-01] Asymmetrical Header & Navigation Bar**
   - Constrained inside `max-w-7xl` with uneven padding on ultrawide viewports.
2. **[MED-02] Lack of Evidence-Based Project Provenance**
   - Extracted projects lacked source text tracking (`sourceEvidence`, `confidence`).
3. **[MED-03] Unstructured Error & Security Event Logging**
   - Express server used console statements without structured timestamps, request IDs, or security event tagging.
4. **[MED-04] Theme Visual Blandness**
   - Generated themes lacked polished section hierarchy, card depth, and project showcase highlights.
5. **[MED-05] Deprecated ESLint / React Router Warnings**
   - Console noise from React Router v7 transition flags.

### Low Priority Issues

1. **[LOW-01] DevDependency CVEs** (Tinypool / Vitest dev-only alerts).
2. **[LOW-02] Favicon Customization**: Default Vite favicon requires replacement with Portify AI brand icon.
3. **[LOW-03] Unused CSS Utility Classes**.

---

## 4. Verification Baseline

- **Current Backend Test Suite**: 93 / 93 passed
- **Current Client Test Suite**: 25 / 25 passed
- **Current Playwright Test Suite**: 7 / 7 passed
- **Production Build**: 0 errors (Vite)

This audit establishes the empirical baseline for the comprehensive refactoring phases that follow.

