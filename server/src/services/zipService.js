const JSZip = require('jszip');
const { generateQRBuffer } = require('./qrService');
const config = require('../config/env');

/**
 * Generate complete standalone CSS matching the chosen theme
 */
const generateStandaloneCSS = (theme = 'minimal-pro', primaryColor = '#4f46e5') => {
  return `/* Portify AI — Standalone Portfolio Stylesheet */
/* Theme: ${theme} */

/* Reset & Base */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
  -webkit-text-size-adjust: 100%;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.6;
  color: #1e293b;
  background-color: #ffffff;
  min-height: 100vh;
}

.font-serif {
  font-family: Georgia, Cambria, "Times New Roman", Times, serif;
}

.font-mono {
  font-family: "JetBrains Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

/* Layout Containers */
.container {
  width: 100%;
  max-width: 960px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.max-w-4xl {
  max-width: 56rem;
  margin-left: auto;
  margin-right: auto;
}

.max-w-5xl {
  max-width: 64rem;
  margin-left: auto;
  margin-right: auto;
}

.max-w-6xl {
  max-width: 72rem;
  margin-left: auto;
  margin-right: auto;
}

.max-w-7xl {
  max-width: 80rem;
  margin-left: auto;
  margin-right: auto;
}

/* Flexbox & Grids */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.items-baseline { align-items: baseline; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.flex-wrap { flex-wrap: wrap; }
.flex-1 { flex: 1 1 0%; }
.gap-1 { gap: 0.25rem; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.gap-4 { gap: 1rem; }
.gap-6 { gap: 1.5rem; }
.gap-8 { gap: 2rem; }

.grid { display: grid; }
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }

/* Spacing */
.py-4 { padding-top: 1rem; padding-bottom: 1rem; }
.py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
.py-8 { padding-top: 2rem; padding-bottom: 2rem; }
.py-12 { padding-top: 3rem; padding-bottom: 3rem; }
.py-16 { padding-top: 4rem; padding-bottom: 4rem; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
.p-4 { padding: 1rem; }
.p-5 { padding: 1.25rem; }
.p-6 { padding: 1.5rem; }
.p-8 { padding: 2rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 0.75rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-8 { margin-bottom: 2rem; }
.mb-10 { margin-bottom: 2.5rem; }
.mb-12 { margin-bottom: 3rem; }
.mb-14 { margin-bottom: 3.5rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-4 { margin-top: 1rem; }
.mt-6 { margin-top: 1.5rem; }

/* Typography */
.text-xs { font-size: 0.75rem; line-height: 1rem; }
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }
.text-base { font-size: 1rem; line-height: 1.5rem; }
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }
.text-2xl { font-size: 1.5rem; line-height: 2rem; }
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
.font-light { font-weight: 300; }
.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
.uppercase { text-transform: uppercase; }
.tracking-tight { letter-spacing: -0.025em; }
.tracking-wide { letter-spacing: 0.025em; }
.tracking-wider { letter-spacing: 0.05em; }
.tracking-widest { letter-spacing: 0.1em; }
.leading-relaxed { line-height: 1.625; }

/* Borders & Radii */
.border { border-width: 1px; border-style: solid; }
.border-b { border-bottom-width: 1px; border-bottom-style: solid; }
.border-t { border-top-width: 1px; border-top-style: solid; }
.border-l-2 { border-left-width: 2px; border-left-style: solid; }
.rounded { border-radius: 0.25rem; }
.rounded-md { border-radius: 0.375rem; }
.rounded-lg { border-radius: 0.5rem; }
.rounded-xl { border-radius: 0.75rem; }
.rounded-2xl { border-radius: 1rem; }
.rounded-3xl { border-radius: 1.5rem; }
.rounded-full { border-radius: 9999px; }

/* Interactive Elements */
a {
  color: inherit;
  text-decoration: none;
  transition: opacity 0.2s, color 0.2s;
}
a:hover {
  text-decoration: underline;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 0.5rem;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  text-decoration: none !important;
}

/* Badges & Tags */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 9999px;
  background-color: #f1f5f9;
  color: #334155;
  border: 1px solid #e2e8f0;
}

/* ------------------------------------------------------------- */
/* THEME 1: MINIMAL PRO STYLES */
/* ------------------------------------------------------------- */
body.theme-minimal-pro {
  background-color: #ffffff;
  color: #0f172a;
}
body.theme-minimal-pro header {
  border-bottom: 1px solid #e2e8f0;
}
body.theme-minimal-pro .section-title {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
body.theme-minimal-pro .card {
  border: 1px solid #e2e8f0;
  background-color: #ffffff;
}

/* ------------------------------------------------------------- */
/* THEME 2: DARK DEVELOPER STYLES */
/* ------------------------------------------------------------- */
body.theme-dark-developer {
  background-color: #090D16;
  color: #e2e8f0;
}
body.theme-dark-developer .terminal-card {
  background-color: rgba(15, 23, 42, 0.75);
  border: 1px solid #1e293b;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
}
body.theme-dark-developer .code-pill {
  background-color: #0f172a;
  border: 1px solid #334155;
  color: #34d399;
}
body.theme-dark-developer .timeline-node {
  border-left: 2px solid #334155;
}
body.theme-dark-developer .card {
  background-color: rgba(15, 23, 42, 0.6);
  border: 1px solid #1e293b;
}

/* ------------------------------------------------------------- */
/* THEME 3: CREATIVE GRADIENT STYLES */
/* ------------------------------------------------------------- */
body.theme-creative-gradient {
  background-color: #faf5ff;
  color: #1e1b4b;
}
body.theme-creative-gradient .gradient-hero {
  background: linear-gradient(135deg, #eef2ff 0%, #faf5ff 50%, #fff1f2 100%);
  border: 1px solid #e0e7ff;
}
body.theme-creative-gradient .card {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

/* ------------------------------------------------------------- */
/* THEME 4: CORPORATE ELITE STYLES */
/* ------------------------------------------------------------- */
body.theme-corporate-elite {
  background-color: #ffffff;
  color: #0f172a;
}
body.theme-corporate-elite header {
  border-bottom: 2px solid #0f172a;
}
body.theme-corporate-elite .sidebar {
  border-right: 1px solid #e2e8f0;
}
body.theme-corporate-elite .card {
  border: 1px solid #e2e8f0;
  background-color: #f8fafc;
}

/* ------------------------------------------------------------- */
/* THEME 5: MODERN GLASS STYLES */
/* ------------------------------------------------------------- */
body.theme-modern-glass {
  background-color: #030712;
  color: #f1f5f9;
}
body.theme-modern-glass .glass-panel {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}
body.theme-modern-glass .card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* Mobile Responsive Breakpoints */
@media (min-width: 640px) {
  .sm\\:flex-row { flex-direction: row; }
  .sm\\:items-center { align-items: center; }
  .sm\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .sm\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

@media (min-width: 768px) {
  .md\\:flex-row { flex-direction: row; }
  .md\\:items-center { align-items: center; }
  .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .md\\:col-span-1 { grid-column: span 1 / span 1; }
  .md\\:col-span-2 { grid-column: span 2 / span 2; }
}

@media (max-width: 767px) {
  .container, .max-w-4xl, .max-w-5xl {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  .grid-cols-2, .grid-cols-3, .md\\:grid-cols-2 {
    grid-template-columns: 1fr !important;
  }
  .sm\\:flex-row, .md\\:flex-row {
    flex-direction: column !important;
  }
}
`;
};

/**
 * Generate complete standalone JavaScript for smooth interactions
 */
const generateStandaloneJS = () => {
  return `/**
 * Portify AI — Standalone Portfolio Client Script
 * Works completely offline without requiring backend or external dependencies.
 */
document.addEventListener('DOMContentLoaded', function () {
  // 1. Smooth scroll for internal anchor navigation
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        var targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (history.pushState) {
            history.pushState(null, null, targetId);
          }
        }
      }
    });
  });

  // 2. Interactive Email Copy Button Helper
  window.copyContactEmail = function (email, btnElement) {
    if (!navigator.clipboard) {
      window.location.href = 'mailto:' + email;
      return;
    }
    navigator.clipboard.writeText(email).then(function () {
      var origText = btnElement.innerText;
      btnElement.innerText = 'Copied to clipboard!';
      btnElement.style.opacity = '0.9';
      setTimeout(function () {
        btnElement.innerText = origText;
        btnElement.style.opacity = '1';
      }, 2000);
    }).catch(function () {
      window.location.href = 'mailto:' + email;
    });
  };

  // 3. Print / Save as PDF handler
  window.printPortfolio = function () {
    window.print();
  };
});
`;
};

/**
 * Escape HTML utility
 */
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generate a complete standalone HTML document for the given portfolio and theme
 */
const renderStandaloneHTML = (portfolio, publicUrl) => {
  const p = portfolio;
  const info = p.personalInfo || {};
  const theme = p.theme || 'minimal-pro';
  const primaryColor = p.themeSettings?.primaryColor || '#4f46e5';

  const htmlHead = `
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(info.fullName || 'Portfolio')} — ${escapeHtml(info.headline || 'Professional Profile')}</title>
  <meta name="description" content="${escapeHtml(p.summary || info.headline || 'Professional portfolio built with Portify AI.')}" />
  <link rel="stylesheet" href="style.css" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    // Progressive enhancement Tailwind config fallback
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: '${primaryColor}',
          }
        }
      }
    }
  </script>
  <script src="script.js" defer></script>
  `;

  let themeBody = '';
  let bodyClass = `antialiased min-h-screen theme-${theme}`;

  if (theme === 'dark-developer') {
    themeBody = renderDarkDeveloperBody(p, publicUrl, primaryColor);
  } else if (theme === 'creative-gradient') {
    themeBody = renderCreativeGradientBody(p, publicUrl, primaryColor);
  } else if (theme === 'corporate-elite') {
    themeBody = renderCorporateEliteBody(p, publicUrl, primaryColor);
  } else if (theme === 'modern-glass') {
    themeBody = renderModernGlassBody(p, publicUrl, primaryColor);
  } else {
    themeBody = renderMinimalProBody(p, publicUrl, primaryColor);
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${htmlHead}
</head>
<body class="${bodyClass}">
  ${themeBody}
  <footer class="py-12 border-t border-slate-200/40 text-center text-xs text-slate-500">
    <p>Generated with <a href="${config.clientUrl}" target="_blank" class="font-medium text-indigo-600 hover:underline">Portify AI</a> — Your Resume, Your Identity, Your Portfolio.</p>
  </footer>
</body>
</html>`;
};

// =====================================================================
// THEME 1: MINIMAL PRO (Editorial, Serif, Whitespace, Monogram, 9 Sections)
// =====================================================================
function renderMinimalProBody(p, publicUrl, primaryColor) {
  const info = p.personalInfo || {};
  const initials = (info.fullName || 'P')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return `
  <main class="max-w-4xl mx-auto px-6 py-16 text-slate-900 bg-white min-h-screen font-sans">
    <!-- Header with Monogram -->
    <header class="border-b border-slate-200 pb-12 mb-12">
      <div class="flex flex-col sm:flex-row justify-between items-start gap-6">
        <div>
          <div class="w-12 h-12 rounded-full bg-slate-900 text-white font-serif font-bold text-lg flex items-center justify-center mb-4">
            ${initials}
          </div>
          <h1 class="text-4xl sm:text-5xl font-serif font-bold tracking-tight text-slate-900">${escapeHtml(info.fullName || 'Professional Profile')}</h1>
          <p class="text-xl text-slate-600 font-light mt-2">${escapeHtml(info.headline || 'Full Stack Specialist')}</p>

          <div class="flex flex-wrap gap-x-4 gap-y-1 mt-4 text-xs text-slate-500 font-mono">
            ${info.location ? `<span>📍 ${escapeHtml(info.location)}</span>` : ''}
            ${info.email ? `<a href="mailto:${escapeHtml(info.email)}" class="hover:text-slate-900 underline">✉️ ${escapeHtml(info.email)}</a>` : ''}
            ${info.phone ? `<span>📞 ${escapeHtml(info.phone)}</span>` : ''}
          </div>
        </div>

        ${info.avatarUrl ? `
          <img src="${escapeHtml(info.avatarUrl)}" alt="Avatar" class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0" />
        ` : ''}
      </div>

      <!-- Social & Web Links -->
      <div class="flex flex-wrap gap-4 mt-6 pt-6 border-t border-slate-100 text-xs font-medium">
        ${info.website ? `<a href="${escapeHtml(info.website)}" target="_blank" class="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50">Website ↗</a>` : ''}
        ${info.github ? `<a href="${escapeHtml(info.github)}" target="_blank" class="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50">GitHub ↗</a>` : ''}
        ${info.linkedin ? `<a href="${escapeHtml(info.linkedin)}" target="_blank" class="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50">LinkedIn ↗</a>` : ''}
        ${info.twitter ? `<a href="${escapeHtml(info.twitter)}" target="_blank" class="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50">Twitter ↗</a>` : ''}
      </div>
    </header>

    <!-- 2. Professional Summary -->
    ${p.summary ? `
    <section class="mb-14">
      <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 font-mono">Curriculum Vitae / About</h2>
      <p class="text-lg text-slate-700 leading-relaxed font-serif">${escapeHtml(p.summary)}</p>
    </section>
    ` : ''}

    <!-- 3. Experience -->
    ${p.experience && p.experience.length ? `
    <section class="mb-14">
      <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 font-mono">Experience History</h2>
      <div class="space-y-8">
        ${p.experience.map(exp => `
          <div class="border-l-2 border-slate-200 pl-4 py-1">
            <div class="flex flex-col sm:flex-row sm:items-baseline justify-between mb-1">
              <h3 class="text-base font-bold text-slate-900">${escapeHtml(exp.role)}</h3>
              <span class="text-xs text-slate-500 font-mono">${escapeHtml(exp.startDate || '')} — ${exp.current ? 'Present' : escapeHtml(exp.endDate || '')}</span>
            </div>
            <p class="text-sm font-medium text-slate-600 mb-2">${escapeHtml(exp.company)} ${exp.location ? `• ${escapeHtml(exp.location)}` : ''}</p>
            ${exp.description ? `<p class="text-sm text-slate-600 mb-2">${escapeHtml(exp.description)}</p>` : ''}
            ${exp.highlights && exp.highlights.length ? `
              <ul class="list-disc list-inside text-xs text-slate-600 space-y-1">
                ${exp.highlights.map(h => `<li>${escapeHtml(h)}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    <!-- 4. Featured Projects -->
    ${p.projects && p.projects.length ? `
    <section class="mb-14">
      <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 font-mono">Selected Works & Projects</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        ${p.projects.map(proj => `
          <div class="border border-slate-200 rounded-xl p-5 hover:border-slate-400 transition-colors bg-white">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold text-slate-900 text-sm">${escapeHtml(proj.title)}</h3>
              <div class="flex gap-2 text-xs">
                ${proj.liveUrl ? `<a href="${escapeHtml(proj.liveUrl)}" target="_blank" class="text-indigo-600 hover:underline">Demo ↗</a>` : ''}
                ${proj.repoUrl ? `<a href="${escapeHtml(proj.repoUrl)}" target="_blank" class="text-slate-500 hover:underline">Code ↗</a>` : ''}
              </div>
            </div>
            <p class="text-xs text-slate-600 mb-3">${escapeHtml(proj.description)}</p>
            ${proj.technologies && proj.technologies.length ? `
              <div class="flex flex-wrap gap-1.5">
                ${proj.technologies.map(t => `<span class="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-mono">${escapeHtml(t)}</span>`).join('')}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    <!-- 5. Skills & Competencies -->
    ${(p.skills && p.skills.length) || (p.softSkills && p.softSkills.length) ? `
    <section class="mb-14">
      <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 font-mono">Skills & Competencies</h2>
      <div class="space-y-4">
        ${(p.skills || []).map(group => `
          <div>
            <h4 class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">${escapeHtml(group.category)}</h4>
            <div class="flex flex-wrap gap-2">
              ${(group.items || []).map(s => `<span class="text-xs font-mono bg-slate-100 text-slate-800 px-2.5 py-1 rounded border border-slate-200">${escapeHtml(s)}</span>`).join('')}
            </div>
          </div>
        `).join('')}

        ${p.softSkills && p.softSkills.length ? `
          <div class="pt-2">
            <h4 class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Professional & Soft Skills</h4>
            <div class="flex flex-wrap gap-2">
              ${p.softSkills.map(s => `<span class="text-xs bg-slate-50 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200">${escapeHtml(s)}</span>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    </section>
    ` : ''}

    <!-- 6. Education -->
    ${p.education && p.education.length ? `
    <section class="mb-14">
      <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 font-mono">Higher Education</h2>
      <div class="space-y-4">
        ${p.education.map(edu => `
          <div class="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 class="font-bold text-slate-900 text-sm">${escapeHtml(edu.degree)} ${edu.fieldOfStudy ? `in ${escapeHtml(edu.fieldOfStudy)}` : ''}</h3>
              <p class="text-xs text-slate-600">${escapeHtml(edu.institution)} ${edu.gpa ? `• GPA: ${escapeHtml(edu.gpa)}` : ''}</p>
            </div>
            <span class="text-xs text-slate-500 font-mono mt-1 sm:mt-0">${escapeHtml(edu.graduationDate || '')}</span>
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    <!-- 7. Certifications -->
    ${p.certifications && p.certifications.length ? `
    <section class="mb-14">
      <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 font-mono">Certifications & Licenses</h2>
      <div class="space-y-3">
        ${p.certifications.map(cert => `
          <div class="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 class="font-semibold text-slate-900 text-sm">${escapeHtml(cert.name)}</h3>
              <p class="text-xs text-slate-600">${escapeHtml(cert.issuer || '')}</p>
            </div>
            <div class="flex items-center gap-2 mt-1 sm:mt-0 text-xs font-mono text-slate-500">
              <span>${escapeHtml(cert.issueDate || '')}</span>
              ${cert.credentialUrl ? `<a href="${escapeHtml(cert.credentialUrl)}" target="_blank" class="text-indigo-600 hover:underline">Verify ↗</a>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    <!-- 8. Key Achievements -->
    ${p.achievements && p.achievements.length ? `
    <section class="mb-14">
      <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 font-mono">Key Achievements & Honors</h2>
      <ul class="space-y-2 text-xs text-slate-700">
        ${p.achievements.map(ach => `<li class="flex items-start gap-2"><span class="text-indigo-600 font-bold">•</span><span>${escapeHtml(ach)}</span></li>`).join('')}
      </ul>
    </section>
    ` : ''}

    <!-- 9. Contact & QR Code -->
    <section class="border-t border-slate-200 pt-8 mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-50 p-6 rounded-2xl">
      <div>
        <h3 class="text-sm font-bold text-slate-900">Digital Identity QR Code</h3>
        <p class="text-xs text-slate-500 mt-1">Scan with any mobile camera to view the live responsive version of this portfolio.</p>
        ${publicUrl ? `<a href="${publicUrl}" target="_blank" class="text-xs text-indigo-600 hover:underline mt-2 inline-block font-mono break-all">${publicUrl}</a>` : ''}
      </div>
      <img src="qrcode.png" alt="Scan QR" class="w-24 h-24 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm shrink-0" />
    </section>
  </main>
  `;
}

// =====================================================================
// THEME 2: DARK DEVELOPER (Terminal Header, Git Log Tree, Monospace, 9 Sections)
// =====================================================================
function renderDarkDeveloperBody(p, publicUrl, primaryColor) {
  const info = p.personalInfo || {};

  return `
  <main class="max-w-4xl mx-auto px-6 py-16 bg-[#090D16] text-slate-100 min-h-screen font-sans">
    <!-- Terminal Header Bar -->
    <header class="border border-slate-800 rounded-2xl bg-slate-950/80 p-6 mb-12 shadow-2xl backdrop-blur">
      <div class="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800 text-xs text-slate-500 font-mono">
        <span class="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
        <span class="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
        <span class="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
        <span class="ml-2">portfolio.ts — git:(main) [clean]</span>
      </div>
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span class="font-mono text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">const engineer =</span>
          <h1 class="text-3xl md:text-4xl font-bold tracking-tight text-white mt-1 font-mono">${escapeHtml(info.fullName || 'Developer Profile')}</h1>
          <p class="text-base text-slate-400 mt-1">${escapeHtml(info.headline || 'Systems & Full Stack Specialist')}</p>
          <div class="flex flex-wrap gap-4 mt-3 text-xs text-slate-400 font-mono">
            ${info.location ? `<span>📍 ${escapeHtml(info.location)}</span>` : ''}
            ${info.email ? `<a href="mailto:${escapeHtml(info.email)}" class="hover:text-emerald-400 underline">✉️ ${escapeHtml(info.email)}</a>` : ''}
          </div>
        </div>
        <div class="flex flex-wrap gap-2 font-mono text-xs">
          ${info.github ? `<a href="${escapeHtml(info.github)}" target="_blank" class="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700">github() ↗</a>` : ''}
          ${info.linkedin ? `<a href="${escapeHtml(info.linkedin)}" target="_blank" class="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700">linkedin() ↗</a>` : ''}
          ${info.website ? `<a href="${escapeHtml(info.website)}" target="_blank" class="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700">site() ↗</a>` : ''}
        </div>
      </div>
    </header>

    <!-- 2. About / Readme -->
    ${p.summary ? `
    <section class="mb-12">
      <div class="font-mono text-xs text-emerald-400 mb-2">// README.md</div>
      <div class="p-5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 leading-relaxed text-sm">
        ${escapeHtml(p.summary)}
      </div>
    </section>
    ` : ''}

    <!-- 3. Experience / Git Log -->
    ${p.experience && p.experience.length ? `
    <section class="mb-12">
      <div class="font-mono text-xs text-emerald-400 mb-4">// git log --graph --career</div>
      <div class="space-y-6 relative border-l border-slate-800 ml-3 pl-6">
        ${p.experience.map(exp => `
          <div class="relative">
            <span class="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#090D16]"></span>
            <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
              <h3 class="text-base font-bold text-white">${escapeHtml(exp.role)} <span class="text-emerald-400">@ ${escapeHtml(exp.company)}</span></h3>
              <span class="text-xs font-mono text-slate-500">${escapeHtml(exp.startDate || '')} -> ${exp.current ? 'HEAD (Present)' : escapeHtml(exp.endDate || '')}</span>
            </div>
            ${exp.description ? `<p class="text-xs text-slate-400 mt-1">${escapeHtml(exp.description)}</p>` : ''}
            ${exp.highlights && exp.highlights.length ? `
              <ul class="mt-2 space-y-1 text-xs text-slate-300">
                ${exp.highlights.map(h => `<li class="flex items-start gap-2"><span class="text-emerald-400 font-mono">></span> <span>${escapeHtml(h)}</span></li>`).join('')}
              </ul>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    <!-- 4. Projects / Repositories -->
    ${p.projects && p.projects.length ? `
    <section class="mb-12">
      <div class="font-mono text-xs text-emerald-400 mb-4">// featured_repositories</div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${p.projects.map(proj => `
          <div class="p-5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-emerald-500/50 transition-colors">
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-mono font-bold text-white text-sm">${escapeHtml(proj.title)}</h4>
              <div class="flex gap-2 text-xs font-mono">
                ${proj.liveUrl ? `<a href="${escapeHtml(proj.liveUrl)}" target="_blank" class="text-emerald-400 hover:underline">live()</a>` : ''}
                ${proj.repoUrl ? `<a href="${escapeHtml(proj.repoUrl)}" target="_blank" class="text-slate-400 hover:underline">src()</a>` : ''}
              </div>
            </div>
            <p class="text-xs text-slate-400 mb-3">${escapeHtml(proj.description)}</p>
            ${proj.technologies && proj.technologies.length ? `
              <div class="flex flex-wrap gap-1.5 font-mono text-[11px]">
                ${proj.technologies.map(t => `<span class="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">${escapeHtml(t)}</span>`).join('')}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    <!-- 5. Skills & Dependencies -->
    ${(p.skills && p.skills.length) || (p.softSkills && p.softSkills.length) ? `
    <section class="mb-12">
      <div class="font-mono text-xs text-emerald-400 mb-4">// dependencies & stack</div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        ${(p.skills || []).map(group => `
          <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <h5 class="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">${escapeHtml(group.category)}</h5>
            <div class="flex flex-wrap gap-1.5 font-mono text-xs">
              ${(group.items || []).map(s => `<span class="px-2 py-1 bg-slate-900 text-emerald-300 rounded border border-slate-800">${escapeHtml(s)}</span>`).join('')}
            </div>
          </div>
        `).join('')}

        ${p.softSkills && p.softSkills.length ? `
          <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <h5 class="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">methods_and_soft_skills</h5>
            <div class="flex flex-wrap gap-1.5 font-mono text-xs">
              ${p.softSkills.map(s => `<span class="px-2 py-1 bg-slate-900 text-slate-300 rounded border border-slate-800">${escapeHtml(s)}</span>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    </section>
    ` : ''}

    <!-- 6. Education -->
    ${p.education && p.education.length ? `
    <section class="mb-12">
      <div class="font-mono text-xs text-emerald-400 mb-4">// academic_background</div>
      <div class="space-y-3">
        ${p.education.map(edu => `
          <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs">
            <div>
              <span class="font-bold text-white font-mono">${escapeHtml(edu.degree)}</span> ${edu.fieldOfStudy ? `<span class="text-slate-400">in ${escapeHtml(edu.fieldOfStudy)}</span>` : ''}
              <div class="text-slate-500 mt-0.5">${escapeHtml(edu.institution)} ${edu.gpa ? `• GPA: ${escapeHtml(edu.gpa)}` : ''}</div>
            </div>
            <span class="text-slate-500 font-mono mt-1 sm:mt-0">${escapeHtml(edu.graduationDate || '')}</span>
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    <!-- 7. Certifications -->
    ${p.certifications && p.certifications.length ? `
    <section class="mb-12">
      <div class="font-mono text-xs text-emerald-400 mb-4">// verified_credentials</div>
      <div class="space-y-2">
        ${p.certifications.map(cert => `
          <div class="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center text-xs font-mono">
            <div>
              <span class="text-white font-semibold">${escapeHtml(cert.name)}</span>
              <span class="text-slate-500 ml-2">(${escapeHtml(cert.issuer || '')})</span>
            </div>
            ${cert.credentialUrl ? `<a href="${escapeHtml(cert.credentialUrl)}" target="_blank" class="text-emerald-400 hover:underline">verify()</a>` : ''}
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    <!-- 8. Achievements -->
    ${p.achievements && p.achievements.length ? `
    <section class="mb-12">
      <div class="font-mono text-xs text-emerald-400 mb-4">// achievements_and_honors</div>
      <ul class="space-y-1.5 text-xs text-slate-300 font-mono">
        ${p.achievements.map(ach => `<li class="flex items-start gap-2"><span class="text-emerald-400">#</span> <span>${escapeHtml(ach)}</span></li>`).join('')}
      </ul>
    </section>
    ` : ''}

    <!-- 9. QR Code -->
    <section class="border border-slate-800 rounded-2xl bg-slate-950/80 p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
      <div>
        <div class="font-mono text-xs text-emerald-400">// digital_identity</div>
        <h4 class="text-sm font-bold text-white mt-1">Direct Terminal Link</h4>
        <p class="text-xs text-slate-400 mt-1">Scan QR code to access live responsive deployment.</p>
        ${publicUrl ? `<a href="${publicUrl}" target="_blank" class="text-xs text-emerald-400 hover:underline mt-2 inline-block font-mono break-all">${publicUrl}</a>` : ''}
      </div>
      <img src="qrcode.png" alt="Scan QR" class="w-24 h-24 bg-white p-1 rounded-xl shrink-0" />
    </section>
  </main>
  `;
}

// =====================================================================
// THEME 3: CREATIVE GRADIENT (Pastel Mesh Hero, Rounded Cards, 9 Sections)
// =====================================================================
function renderCreativeGradientBody(p, publicUrl, primaryColor) {
  const info = p.personalInfo || {};

  return `
  <main class="max-w-4xl mx-auto px-6 py-16 text-slate-900 min-h-screen font-sans bg-slate-50">
    <!-- Gradient Hero Header -->
    <header class="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-indigo-50/90 via-purple-50/70 to-rose-50/60 border border-indigo-100 shadow-sm mb-12">
      <span class="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-indigo-100 text-indigo-700 rounded-full mb-3">Creative Showcase</span>
      <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">${escapeHtml(info.fullName || 'Creative Portfolio')}</h1>
      <p class="text-xl text-indigo-950 font-medium mt-2">${escapeHtml(info.headline || 'Product & Technology Specialist')}</p>
      ${p.summary ? `<p class="mt-4 text-slate-600 max-w-2xl text-sm leading-relaxed">${escapeHtml(p.summary)}</p>` : ''}
      <div class="flex flex-wrap gap-3 mt-6">
        ${info.website ? `<a href="${escapeHtml(info.website)}" target="_blank" class="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800">Visit Website ↗</a>` : ''}
        ${info.github ? `<a href="${escapeHtml(info.github)}" target="_blank" class="px-4 py-2 bg-white text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50">GitHub</a>` : ''}
        ${info.linkedin ? `<a href="${escapeHtml(info.linkedin)}" target="_blank" class="px-4 py-2 bg-white text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50">LinkedIn</a>` : ''}
      </div>
    </header>

    <!-- 3. Projects Showcase -->
    ${p.projects && p.projects.length ? `
    <section class="mb-14">
      <h2 class="text-2xl font-bold text-slate-900 mb-6">Featured Work & Creations</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        ${p.projects.map(proj => `
          <div class="p-6 rounded-2xl bg-white border border-slate-200 hover:shadow-md transition-all">
            <h3 class="text-base font-bold text-slate-900 mb-1">${escapeHtml(proj.title)}</h3>
            <p class="text-xs text-slate-600 mb-3">${escapeHtml(proj.description)}</p>
            ${proj.technologies && proj.technologies.length ? `
              <div class="flex flex-wrap gap-1.5 mb-3">
                ${proj.technologies.map(t => `<span class="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium">${escapeHtml(t)}</span>`).join('')}
              </div>
            ` : ''}
            <div class="flex gap-3 text-xs font-semibold">
              ${proj.liveUrl ? `<a href="${escapeHtml(proj.liveUrl)}" target="_blank" class="text-indigo-600 hover:underline">Live Preview ↗</a>` : ''}
              ${proj.repoUrl ? `<a href="${escapeHtml(proj.repoUrl)}" target="_blank" class="text-slate-500 hover:underline">Source</a>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    <!-- 4. Experience Timeline -->
    ${p.experience && p.experience.length ? `
    <section class="mb-14">
      <h2 class="text-2xl font-bold text-slate-900 mb-6">Career Journey</h2>
      <div class="space-y-5">
        ${p.experience.map(exp => `
          <div class="p-6 rounded-2xl bg-white border border-slate-200">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
              <h3 class="text-base font-bold text-slate-900">${escapeHtml(exp.role)} <span class="text-indigo-600 font-normal">at ${escapeHtml(exp.company)}</span></h3>
              <span class="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">${escapeHtml(exp.startDate || '')} - ${exp.current ? 'Present' : escapeHtml(exp.endDate || '')}</span>
            </div>
            ${exp.highlights && exp.highlights.length ? `
              <ul class="list-disc list-inside text-xs text-slate-600 space-y-1 mt-2">
                ${exp.highlights.map(h => `<li>${escapeHtml(h)}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    <!-- 5. Skills -->
    ${(p.skills && p.skills.length) || (p.softSkills && p.softSkills.length) ? `
    <section class="mb-14">
      <h2 class="text-2xl font-bold text-slate-900 mb-6">Skills & Tools</h2>
      <div class="flex flex-wrap gap-2">
        ${(p.skills || []).flatMap(g => g.items).map(s => `<span class="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-medium shadow-sm">${escapeHtml(s)}</span>`).join('')}
        ${(p.softSkills || []).map(s => `<span class="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-medium">${escapeHtml(s)}</span>`).join('')}
      </div>
    </section>
    ` : ''}

    <!-- 6. Education -->
    ${p.education && p.education.length ? `
    <section class="mb-14">
      <h2 class="text-2xl font-bold text-slate-900 mb-6">Education & Credentials</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        ${p.education.map(edu => `
          <div class="p-5 rounded-2xl bg-white border border-slate-200">
            <h3 class="font-bold text-slate-900 text-sm">${escapeHtml(edu.degree)}</h3>
            <p class="text-xs text-indigo-700 font-medium">${escapeHtml(edu.fieldOfStudy || '')}</p>
            <p class="text-xs text-slate-500 mt-1">${escapeHtml(edu.institution)} • ${escapeHtml(edu.graduationDate || '')}</p>
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    <!-- 7. Certifications & Achievements -->
    ${(p.certifications && p.certifications.length) || (p.achievements && p.achievements.length) ? `
    <section class="mb-14">
      <h2 class="text-2xl font-bold text-slate-900 mb-6">Honors & Certifications</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        ${(p.certifications || []).map(c => `
          <div class="p-4 rounded-xl bg-white border border-slate-200">
            <div class="text-xs font-bold text-slate-900">${escapeHtml(c.name)}</div>
            <div class="text-[11px] text-slate-500">${escapeHtml(c.issuer || '')} • ${escapeHtml(c.issueDate || '')}</div>
          </div>
        `).join('')}
        ${(p.achievements || []).map(a => `
          <div class="p-4 rounded-xl bg-white border border-slate-200 flex items-start gap-2">
            <span class="text-indigo-600 font-bold">★</span>
            <span class="text-xs text-slate-700">${escapeHtml(a)}</span>
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    <!-- 9. QR Code Scan -->
    <section class="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
      <div>
        <h3 class="text-base font-bold text-slate-900">Digital Identity QR Code</h3>
        <p class="text-xs text-slate-500 mt-1">Scan with any mobile camera to view the live responsive version of this portfolio.</p>
        ${publicUrl ? `<a href="${publicUrl}" target="_blank" class="text-xs text-indigo-600 hover:underline mt-2 inline-block font-mono break-all">${publicUrl}</a>` : ''}
      </div>
      <img src="qrcode.png" alt="Scan QR" class="w-24 h-24 bg-white p-1 rounded-xl border border-slate-100 shrink-0" />
    </section>
  </main>
  `;
}

// =====================================================================
// THEME 4: CORPORATE ELITE (Executive 2-Col Layout, Boardroom Authority, 9 Sections)
// =====================================================================
function renderCorporateEliteBody(p, publicUrl, primaryColor) {
  const info = p.personalInfo || {};

  return `
  <main class="max-w-5xl mx-auto px-6 py-16 text-slate-900 bg-white min-h-screen font-sans">
    <!-- Executive Header with Navy Accent -->
    <header class="border-b-2 border-slate-900 pb-8 mb-10">
      <div class="flex justify-between items-start">
        <div>
          <span class="text-[11px] font-bold uppercase tracking-widest text-indigo-900 mb-1 block">Executive Dossier</span>
          <h1 class="text-3xl sm:text-4xl font-bold uppercase tracking-wide text-slate-900">${escapeHtml(info.fullName || 'Executive Profile')}</h1>
          <p class="text-sm text-slate-700 font-semibold tracking-wide uppercase mt-1">${escapeHtml(info.headline || 'Leadership & Operations')}</p>
        </div>
      </div>
      <div class="flex flex-wrap gap-x-6 gap-y-1 mt-4 text-xs text-slate-600 font-medium">
        ${info.location ? `<span>📍 ${escapeHtml(info.location)}</span>` : ''}
        ${info.email ? `<span>✉️ ${escapeHtml(info.email)}</span>` : ''}
        ${info.phone ? `<span>📞 ${escapeHtml(info.phone)}</span>` : ''}
        ${info.linkedin ? `<a href="${escapeHtml(info.linkedin)}" target="_blank" class="hover:underline">LinkedIn Profile ↗</a>` : ''}
      </div>
    </header>

    <!-- Executive Split Layout: 35% Left Sidebar, 65% Right Main Pane -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Left Sidebar (Competencies, Certifications, Contact, QR) -->
      <aside class="space-y-8 md:border-r md:border-slate-200 md:pr-6">
        <!-- Executive Summary -->
        ${p.summary ? `
        <div>
          <h2 class="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3">Executive Summary</h2>
          <p class="text-xs text-slate-700 leading-relaxed text-justify">${escapeHtml(p.summary)}</p>
        </div>
        ` : ''}

        <!-- Core Competencies -->
        ${(p.skills && p.skills.length) || (p.softSkills && p.softSkills.length) ? `
        <div>
          <h2 class="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3">Core Competencies</h2>
          <div class="space-y-3">
            ${(p.skills || []).map(group => `
              <div>
                <h4 class="text-[11px] font-bold text-slate-700 uppercase mb-1">${escapeHtml(group.category)}</h4>
                <div class="flex flex-wrap gap-1">
                  ${(group.items || []).map(s => `<span class="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-medium">${escapeHtml(s)}</span>`).join('')}
                </div>
              </div>
            `).join('')}
            ${p.softSkills && p.softSkills.length ? `
              <div>
                <h4 class="text-[11px] font-bold text-slate-700 uppercase mb-1">Executive Leadership</h4>
                <div class="flex flex-wrap gap-1">
                  ${p.softSkills.map(s => `<span class="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-900 text-[11px] font-medium">${escapeHtml(s)}</span>`).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
        ` : ''}

        <!-- Certifications -->
        ${p.certifications && p.certifications.length ? `
        <div>
          <h2 class="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3">Credentials & Licenses</h2>
          <div class="space-y-2 text-xs">
            ${p.certifications.map(c => `
              <div>
                <div class="font-bold text-slate-900">${escapeHtml(c.name)}</div>
                <div class="text-slate-500 text-[11px]">${escapeHtml(c.issuer || '')} • ${escapeHtml(c.issueDate || '')}</div>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <!-- QR Code -->
        <div class="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2">Digital Verification</div>
          <img src="qrcode.png" alt="Scan QR" class="w-24 h-24 mx-auto bg-white p-1 border border-slate-200" />
          ${publicUrl ? `<a href="${publicUrl}" target="_blank" class="text-[10px] text-indigo-600 hover:underline mt-2 inline-block break-all">${publicUrl}</a>` : ''}
        </div>
      </aside>

      <!-- Right Main Content (65% width) -->
      <section class="md:col-span-2 space-y-8">
        <!-- Leadership History -->
        ${p.experience && p.experience.length ? `
        <div>
          <h2 class="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-4">Executive Leadership History</h2>
          <div class="space-y-6">
            ${p.experience.map(exp => `
              <div>
                <div class="flex justify-between items-baseline">
                  <h3 class="text-sm font-bold text-slate-900">${escapeHtml(exp.role)}</h3>
                  <span class="text-xs font-semibold text-slate-600">${escapeHtml(exp.startDate || '')} – ${exp.current ? 'Present' : escapeHtml(exp.endDate || '')}</span>
                </div>
                <div class="text-xs font-semibold text-slate-700 mb-2">${escapeHtml(exp.company)} ${exp.location ? `| ${escapeHtml(exp.location)}` : ''}</div>
                ${exp.description ? `<p class="text-xs text-slate-600 mb-2">${escapeHtml(exp.description)}</p>` : ''}
                ${exp.highlights && exp.highlights.length ? `
                  <ul class="list-disc list-outside ml-4 text-xs text-slate-700 space-y-1">
                    ${exp.highlights.map(h => `<li>${escapeHtml(h)}</li>`).join('')}
                  </ul>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <!-- Strategic Initiatives / Projects -->
        ${p.projects && p.projects.length ? `
        <div>
          <h2 class="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-4">Strategic Initiatives & Projects</h2>
          <div class="space-y-4">
            ${p.projects.map(proj => `
              <div class="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                <div class="flex justify-between items-baseline mb-1">
                  <h4 class="text-sm font-bold text-slate-900">${escapeHtml(proj.title)}</h4>
                  <div class="flex gap-2 text-xs">
                    ${proj.liveUrl ? `<a href="${escapeHtml(proj.liveUrl)}" target="_blank" class="text-indigo-600 hover:underline">Deliverable ↗</a>` : ''}
                  </div>
                </div>
                <p class="text-xs text-slate-600 mb-2">${escapeHtml(proj.description)}</p>
                ${proj.technologies && proj.technologies.length ? `
                  <div class="flex flex-wrap gap-1">
                    ${proj.technologies.map(t => `<span class="text-[10px] px-2 py-0.5 bg-white border border-slate-200 text-slate-700 font-medium">${escapeHtml(t)}</span>`).join('')}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <!-- Higher Education -->
        ${p.education && p.education.length ? `
        <div>
          <h2 class="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3">Higher Education & Degrees</h2>
          <div class="space-y-3">
            ${p.education.map(edu => `
              <div class="flex justify-between items-baseline text-xs border-b border-slate-100 pb-2">
                <div>
                  <span class="font-bold text-slate-900">${escapeHtml(edu.degree)}</span> ${edu.fieldOfStudy ? `in ${escapeHtml(edu.fieldOfStudy)}` : ''}
                  <div class="text-slate-600">${escapeHtml(edu.institution)} ${edu.gpa ? `| GPA: ${escapeHtml(edu.gpa)}` : ''}</div>
                </div>
                <span class="font-semibold text-slate-500">${escapeHtml(edu.graduationDate || '')}</span>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <!-- Key Achievements -->
        ${p.achievements && p.achievements.length ? `
        <div>
          <h2 class="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3">Board Recognitions & Key Achievements</h2>
          <ul class="space-y-1.5 text-xs text-slate-700">
            ${p.achievements.map(a => `<li class="flex items-start gap-2"><span class="text-indigo-900 font-bold">▪</span> <span>${escapeHtml(a)}</span></li>`).join('')}
          </ul>
        </div>
        ` : ''}
      </section>
    </div>
  </main>
  `;
}

// =====================================================================
// THEME 5: MODERN GLASS (Translucent Glassmorphism, Ambient Lighting, 9 Sections)
// =====================================================================
function renderModernGlassBody(p, publicUrl, primaryColor) {
  const info = p.personalInfo || {};

  return `
  <div class="min-h-screen bg-[#030712] text-slate-100 py-16 px-6 relative overflow-hidden font-sans">
    <!-- Ambient Neon Lighting Spheres -->
    <div class="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute top-1/2 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>

    <main class="max-w-4xl mx-auto relative z-10 space-y-10">
      <!-- Glass Hero Header -->
      <header class="p-8 sm:p-12 rounded-3xl bg-white/[0.04] border border-white/[0.1] backdrop-blur-xl shadow-2xl">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-xs font-mono text-indigo-300 mb-3">
          <span>✦ modern-glass</span>
        </div>
        <h1 class="text-4xl sm:text-5xl font-bold tracking-tight text-white">${escapeHtml(info.fullName || 'Digital Profile')}</h1>
        <p class="text-xl text-indigo-300 font-medium mt-2">${escapeHtml(info.headline || 'Digital Creator & Architect')}</p>
        <div class="flex flex-wrap gap-4 mt-4 text-xs text-slate-400">
          ${info.location ? `<span>📍 ${escapeHtml(info.location)}</span>` : ''}
          ${info.email ? `<a href="mailto:${escapeHtml(info.email)}" class="hover:text-white transition-colors">✉️ ${escapeHtml(info.email)}</a>` : ''}
          ${info.phone ? `<span>📞 ${escapeHtml(info.phone)}</span>` : ''}
        </div>
        ${p.summary ? `<p class="mt-4 text-slate-300 text-sm leading-relaxed max-w-2xl font-light">${escapeHtml(p.summary)}</p>` : ''}
      </header>

      <!-- 3. Glass Experience -->
      ${p.experience && p.experience.length ? `
      <section>
        <h2 class="text-xs uppercase tracking-widest text-indigo-400 font-semibold mb-4">Experience History</h2>
        <div class="space-y-4">
          ${p.experience.map(exp => `
            <div class="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-lg hover:border-white/[0.18] transition-colors">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
                <h3 class="text-base font-semibold text-white">${escapeHtml(exp.role)} <span class="text-indigo-400">@ ${escapeHtml(exp.company)}</span></h3>
                <span class="text-xs text-slate-400 font-mono">${escapeHtml(exp.startDate || '')} — ${exp.current ? 'Present' : escapeHtml(exp.endDate || '')}</span>
              </div>
              ${exp.description ? `<p class="text-xs text-slate-300 mt-1">${escapeHtml(exp.description)}</p>` : ''}
              ${exp.highlights && exp.highlights.length ? `
                <ul class="list-disc list-inside text-xs text-slate-300 space-y-1 mt-2">
                  ${exp.highlights.map(h => `<li>${escapeHtml(h)}</li>`).join('')}
                </ul>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </section>
      ` : ''}

      <!-- 4. Glass Projects -->
      ${p.projects && p.projects.length ? `
      <section>
        <h2 class="text-xs uppercase tracking-widest text-indigo-400 font-semibold mb-4">Projects & Artifacts</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${p.projects.map(proj => `
            <div class="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-lg">
              <div class="flex justify-between items-start mb-1">
                <h4 class="font-bold text-white text-sm">${escapeHtml(proj.title)}</h4>
                <div class="flex gap-2 text-xs">
                  ${proj.liveUrl ? `<a href="${escapeHtml(proj.liveUrl)}" target="_blank" class="text-indigo-400 hover:underline">live ↗</a>` : ''}
                  ${proj.repoUrl ? `<a href="${escapeHtml(proj.repoUrl)}" target="_blank" class="text-slate-400 hover:underline">code ↗</a>` : ''}
                </div>
              </div>
              <p class="text-xs text-slate-300 mb-3">${escapeHtml(proj.description)}</p>
              ${proj.technologies && proj.technologies.length ? `
                <div class="flex flex-wrap gap-1.5">
                  ${proj.technologies.map(t => `<span class="text-[11px] px-2 py-0.5 rounded-full bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">${escapeHtml(t)}</span>`).join('')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </section>
      ` : ''}

      <!-- 5. Capabilities & Stack -->
      ${(p.skills && p.skills.length) || (p.softSkills && p.softSkills.length) ? `
      <section>
        <h2 class="text-xs uppercase tracking-widest text-indigo-400 font-semibold mb-4">Capabilities & Stack</h2>
        <div class="space-y-3">
          ${(p.skills || []).map(group => `
            <div class="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
              <div class="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">${escapeHtml(group.category)}</div>
              <div class="flex flex-wrap gap-2">
                ${(group.items || []).map(s => `<span class="px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.1] text-xs text-slate-200">${escapeHtml(s)}</span>`).join('')}
              </div>
            </div>
          `).join('')}
          ${p.softSkills && p.softSkills.length ? `
            <div class="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
              <div class="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Methodologies</div>
              <div class="flex flex-wrap gap-2">
                ${p.softSkills.map(s => `<span class="px-3 py-1 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-200">${escapeHtml(s)}</span>`).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </section>
      ` : ''}

      <!-- 6. Education -->
      ${p.education && p.education.length ? `
      <section>
        <h2 class="text-xs uppercase tracking-widest text-indigo-400 font-semibold mb-4">Academic Background</h2>
        <div class="space-y-3">
          ${p.education.map(edu => `
            <div class="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] flex justify-between items-center text-xs">
              <div>
                <span class="font-bold text-white">${escapeHtml(edu.degree)}</span> ${edu.fieldOfStudy ? `<span class="text-slate-300">in ${escapeHtml(edu.fieldOfStudy)}</span>` : ''}
                <div class="text-slate-400 mt-0.5">${escapeHtml(edu.institution)}</div>
              </div>
              <span class="text-slate-500 font-mono">${escapeHtml(edu.graduationDate || '')}</span>
            </div>
          `).join('')}
        </div>
      </section>
      ` : ''}

      <!-- 7. Certifications & Achievements -->
      ${(p.certifications && p.certifications.length) || (p.achievements && p.achievements.length) ? `
      <section>
        <h2 class="text-xs uppercase tracking-widest text-indigo-400 font-semibold mb-4">Certifications & Honors</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          ${(p.certifications || []).map(c => `
            <div class="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
              <div class="text-white font-semibold">${escapeHtml(c.name)}</div>
              <div class="text-slate-400 text-[11px] mt-0.5">${escapeHtml(c.issuer || '')} • ${escapeHtml(c.issueDate || '')}</div>
            </div>
          `).join('')}
          ${(p.achievements || []).map(a => `
            <div class="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-start gap-2">
              <span class="text-indigo-400">✦</span>
              <span class="text-slate-300">${escapeHtml(a)}</span>
            </div>
          `).join('')}
        </div>
      </section>
      ` : ''}

      <!-- 9. Contact QR -->
      <section class="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h4 class="text-sm font-bold text-white">Digital Identity Verification</h4>
          <p class="text-xs text-slate-400 mt-1">Scan QR code to access live responsive deployment.</p>
          ${publicUrl ? `<a href="${publicUrl}" target="_blank" class="text-xs text-indigo-400 hover:underline mt-2 inline-block font-mono break-all">${publicUrl}</a>` : ''}
        </div>
        <img src="qrcode.png" alt="Scan QR" class="w-24 h-24 bg-white p-1 rounded-2xl shrink-0" />
      </section>
    </main>
  </div>
  `;
}

/**
 * Generate a standalone ZIP archive for downloading the complete portfolio website
 * @param {object} portfolio
 * @param {string} publicUrl
 * @returns {Promise<Buffer>}
 */
const generatePortfolioZip = async (portfolio, publicUrl) => {
  const zip = new JSZip();

  // 1. Standalone HTML
  const htmlContent = renderStandaloneHTML(portfolio, publicUrl);
  zip.file('index.html', htmlContent);

  // 2. Standalone CSS
  const cssContent = generateStandaloneCSS(portfolio.theme, portfolio.themeSettings?.primaryColor);
  zip.file('style.css', cssContent);

  // 3. Standalone JavaScript
  const jsContent = generateStandaloneJS();
  zip.file('script.js', jsContent);

  // 4. Standalone QR Code PNG
  try {
    const qrBuffer = await generateQRBuffer(publicUrl);
    zip.file('qrcode.png', qrBuffer);
  } catch (err) {
    console.warn('[ZIP Service] QR buffer omitted:', err.message);
  }

  // 5. Raw Structured Portfolio Data
  zip.file('portfolio.json', JSON.stringify(portfolio, null, 2));

  // 6. Documentation README
  const info = portfolio.personalInfo || {};
  const readmeContent = `# ${info.fullName || 'Professional'} Portfolio Website
Theme: ${portfolio.theme || 'minimal-pro'}
Built with Portify AI (https://portify-ai.dev)

## Package Contents:
- \`index.html\`: The primary website entry point. Fully functional and self-contained.
- \`style.css\`: Complete standalone responsive stylesheet for offline and online browsing.
- \`script.js\`: Lightweight JavaScript providing smooth scrolling and interactive actions.
- \`qrcode.png\`: High-resolution digital verification QR code linking to your live hosted site.
- \`portfolio.json\`: Structured resume and portfolio data backup.

## How to View Offline:
Simply double-click \`index.html\` to open your portfolio directly in Chrome, Edge, Safari, or Firefox without any internet connection.

## 1-Click Free Web Hosting Options:
1. **GitHub Pages**:
   - Create a GitHub repository and push this unzipped folder.
   - Go to Repository Settings -> Pages, select the main branch / root, and save.
2. **Netlify Drop**:
   - Visit https://app.netlify.com/drop
   - Drag and drop this unzipped folder for an instant production URL.
3. **Vercel**:
   - Run \`npx vercel\` inside this directory or import the repository.

Live Hosted Portify URL: ${publicUrl}
`;
  zip.file('README.md', readmeContent);

  return await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });
};

module.exports = {
  renderStandaloneHTML,
  generateStandaloneCSS,
  generateStandaloneJS,
  generatePortfolioZip,
};
