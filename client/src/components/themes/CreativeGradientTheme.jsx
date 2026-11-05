import React from 'react';
import {
  ExternalLink,
  Mail,
  MapPin,
  Globe,
  Github,
  Linkedin,
  Twitter,
  Palette,
  ArrowUpRight,
  Briefcase,
  GraduationCap,
  Award,
  Trophy,
} from 'lucide-react';

export default function CreativeGradientTheme({ portfolio, qrCodeUrl }) {
  const p = portfolio || {};
  const info = p.personalInfo || {};

  // Check which sections have content for navigation
  const navItems = [
    { label: 'Overview', href: '#overview', show: Boolean(p.summary || info.fullName) },
    { label: 'Projects', href: '#projects', show: Boolean(p.projects && p.projects.length > 0) },
    { label: 'Journey', href: '#journey', show: Boolean(p.experience && p.experience.length > 0) },
    { label: 'Skills', href: '#skills', show: Boolean((p.skills && p.skills.length > 0) || (p.softSkills && p.softSkills.length > 0)) },
    { label: 'Education', href: '#education', show: Boolean(p.education && p.education.length > 0) },
    { label: 'Credentials', href: '#credentials', show: Boolean(p.certifications && p.certifications.length > 0) },
    { label: 'Honors', href: '#honors', show: Boolean(p.achievements && p.achievements.length > 0) },
    { label: 'Contact', href: '#contact', show: Boolean(info.email || qrCodeUrl) },
  ].filter((item) => item.show);

  return (
    <div className="bg-[#FAF8FD] text-slate-900 min-h-screen font-sans selection:bg-purple-100 selection:text-purple-900 scroll-smooth">
      {/* Floating Frosted Pill Nav Bar */}
      <nav className="sticky top-4 z-30 px-4 sm:px-6 mb-6">
        <div className="max-w-5xl xl:max-w-6xl mx-auto bg-white/80 backdrop-blur-md border border-purple-100 shadow-card rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          <a href="#overview" className="flex items-center gap-2 group">
            <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
              ✦
            </span>
            <span className="font-bold text-xs tracking-tight text-slate-800 hidden sm:inline">
              {info.fullName || 'Creative Portfolio'}
            </span>
          </a>

          {navItems.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar text-xs">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="px-2.5 py-1 text-slate-600 hover:text-indigo-600 hover:bg-purple-50/80 rounded-full font-medium transition-colors whitespace-nowrap text-[11px] sm:text-xs"
                >
                  {item.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-12">
        {/* Hero Section with soft restrained pastel gradient */}
        <header
          id="overview"
          className="p-6 sm:p-12 rounded-3xl bg-gradient-to-br from-indigo-50/90 via-purple-50/70 to-pink-50/60 border border-purple-100 shadow-subtle mb-14 relative overflow-hidden scroll-mt-24"
        >
          <div className="flex flex-col-reverse md:flex-row justify-between items-start gap-6">
            <div className="flex-1 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-white/90 text-indigo-700 rounded-full border border-purple-100 shadow-subtle">
                <Palette className="w-3.5 h-3.5 text-indigo-500" />
                <span>Creative Showcase</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                {info.fullName || 'Creative Technologist'}
              </h1>
              <p className="text-lg sm:text-2xl text-indigo-950/80 font-medium">
                {info.headline || 'Product Designer & Engineer'}
              </p>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs sm:text-sm text-slate-600 pt-2">
                {info.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{info.location}</span>
                  </span>
                )}
                {info.email && (
                  <a
                    href={`mailto:${info.email}`}
                    className="inline-flex items-center gap-1.5 hover:text-indigo-700 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{info.email}</span>
                  </a>
                )}
              </div>

              {p.summary && (
                <p className="pt-2 text-slate-700 text-sm sm:text-base leading-relaxed max-w-2xl">
                  {p.summary}
                </p>
              )}
            </div>

            {info.avatarUrl && (
              <div className="relative shrink-0">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 opacity-30 blur-sm" />
                <img
                  src={info.avatarUrl}
                  alt={info.fullName}
                  className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-white shadow-card"
                />
              </div>
            )}
          </div>

          {/* Social Links */}
          {(info.website || info.github || info.linkedin || info.twitter) && (
            <div className="flex flex-wrap gap-2.5 mt-8 pt-6 border-t border-purple-100/80 text-xs">
              {info.website && (
                <a
                  href={info.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors shadow-subtle"
                >
                  <Globe className="w-3.5 h-3.5" /> Visit Site <ArrowUpRight className="w-3 h-3" />
                </a>
              )}
              {info.github && (
                <a
                  href={info.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/80 rounded-xl font-medium transition-colors shadow-subtle"
                >
                  <Github className="w-3.5 h-3.5 text-slate-600" /> GitHub
                </a>
              )}
              {info.linkedin && (
                <a
                  href={info.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/80 rounded-xl font-medium transition-colors shadow-subtle"
                >
                  <Linkedin className="w-3.5 h-3.5 text-blue-600" /> LinkedIn
                </a>
              )}
              {info.twitter && (
                <a
                  href={info.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/80 rounded-xl font-medium transition-colors shadow-subtle"
                >
                  <Twitter className="w-3.5 h-3.5 text-sky-500" /> Twitter
                </a>
              )}
            </div>
          )}
        </header>

        {/* Featured Projects */}
        {p.projects && p.projects.length > 0 && (
          <section id="projects" className="mb-14 scroll-mt-24">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Featured Work &amp; Creations
              </h2>
            </div>
            <div
              className={
                p.projects.length === 1
                  ? 'grid grid-cols-1'
                  : p.projects.length === 2
                  ? 'grid grid-cols-1 md:grid-cols-2 gap-6'
                  : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6'
              }
            >
              {p.projects.map((proj, idx) => {
                const uniqueHighlights = (proj.highlights || []).filter(
                  (hl) => hl && hl.trim().toLowerCase() !== (proj.description || '').trim().toLowerCase()
                );
                const isSingle = p.projects.length === 1;

                return (
                  <div
                    key={idx}
                    className={`group rounded-2xl bg-white border border-purple-100 hover:shadow-card hover:border-purple-200 hover:-translate-y-0.5 transition-all flex flex-col justify-between ${
                      isSingle ? 'p-6 sm:p-8' : 'p-6'
                    }`}
                  >
                    <div>
                      <div className="mb-2">
                        <h3 className={`font-bold text-slate-900 group-hover:text-indigo-600 transition-colors ${isSingle ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'}`}>
                          {proj.title}
                        </h3>
                        {proj.dates && (
                          <span className="text-[11px] text-purple-600 font-medium block mt-0.5">
                            {proj.dates}
                          </span>
                        )}
                      </div>
                      {proj.description && (
                        <p className={`text-slate-600 mb-3 leading-relaxed ${isSingle ? 'text-sm sm:text-base max-w-3xl' : 'text-xs sm:text-sm'}`}>
                          {proj.description}
                        </p>
                      )}
                      {uniqueHighlights.length > 0 && (
                        <ul className="list-disc list-inside text-xs text-slate-500 space-y-1 mb-4">
                          {uniqueHighlights.slice(0, 4).map((hl, hlIdx) => (
                            <li key={hlIdx} className="leading-relaxed">
                              {hl}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div>
                      {proj.technologies && proj.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {proj.technologies.map((t, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-medium"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-xs font-semibold pt-3 border-t border-slate-100">
                        {proj.liveUrl && (
                          <a
                            href={proj.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800"
                          >
                            Live Demo <ArrowUpRight className="w-3 h-3" />
                          </a>
                        )}
                        {proj.repoUrl && (
                          <a
                            href={proj.repoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800"
                          >
                            Source Code <ArrowUpRight className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Experience Journey */}
        {p.experience && p.experience.length > 0 && (
          <section id="journey" className="mb-14 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mb-6 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              <span>Career Journey</span>
            </h2>
            <div className="space-y-5">
              {p.experience.map((exp, idx) => (
                <div
                  key={idx}
                  className="p-5 sm:p-6 rounded-2xl bg-white border border-purple-100 shadow-subtle"
                >
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                      {exp.role}{' '}
                      <span className="text-indigo-600 font-normal">at {exp.company}</span>
                    </h3>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full w-fit">
                      {exp.startDate} — {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  {exp.location && (
                    <div className="text-xs text-slate-500 mb-2">{exp.location}</div>
                  )}
                  {exp.description && (
                    <p className="text-xs sm:text-sm text-slate-600 mb-3 leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="list-disc list-inside text-xs sm:text-sm text-slate-600 space-y-1.5">
                      {exp.highlights.map((h, hIdx) => (
                        <li key={hIdx} className="leading-relaxed">
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills & Tools */}
        {((p.skills && p.skills.length > 0) || (p.softSkills && p.softSkills.length > 0)) && (
          <section id="skills" className="mb-14 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mb-6">
              Skills &amp; Capabilities
            </h2>
            <div className="flex flex-wrap gap-2 sm:gap-2.5">
              {p.skills &&
                p.skills
                  .flatMap((g) => g.items)
                  .map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-3.5 py-1.5 rounded-xl bg-white border border-purple-100 text-slate-800 text-xs sm:text-sm font-medium shadow-subtle"
                    >
                      {skill}
                    </span>
                  ))}
              {p.softSkills &&
                p.softSkills.map((skill, sIdx) => (
                  <span
                    key={`soft-${sIdx}`}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-xs sm:text-sm font-medium shadow-subtle"
                  >
                    {skill}
                  </span>
                ))}
            </div>
          </section>
        )}

        {/* Education */}
        {p.education && p.education.length > 0 && (
          <section id="education" className="mb-14 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mb-6 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              <span>Education</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {p.education.map((edu, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-white border border-purple-100 shadow-subtle">
                  <h4 className="font-semibold text-slate-900 text-sm">{edu.degree}</h4>
                  <p className="text-xs text-indigo-600 font-medium mt-0.5">{edu.fieldOfStudy}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {edu.institution} {edu.graduationDate && `• ${edu.graduationDate}`}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {p.certifications && p.certifications.length > 0 && (
          <section id="credentials" className="mb-14 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              <span>Certifications &amp; Licenses</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {p.certifications.map((cert, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white border border-purple-100 shadow-subtle flex justify-between items-start"
                >
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">{cert.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">{cert.issuer}</p>
                    {cert.issueDate && (
                      <span className="text-[11px] text-slate-400 mt-2 block">{cert.issueDate}</span>
                    )}
                  </div>
                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 p-1"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Achievements */}
        {p.achievements && p.achievements.length > 0 && (
          <section id="honors" className="mb-14 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mb-6 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>Key Recognitions</span>
            </h2>
            <div className="space-y-3">
              {p.achievements.map((ach, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-white border border-purple-100 text-xs sm:text-sm text-slate-700 flex items-start gap-3 shadow-subtle"
                >
                  <span className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{ach}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Contact / QR Section */}
        <footer
          id="contact"
          className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-50/80 via-purple-50 to-pink-50 border border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-6 scroll-mt-24"
        >
          <div className="text-center sm:text-left">
            <span className="text-xs uppercase tracking-wider text-indigo-600 font-semibold">
              Get In Touch
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
              Let&apos;s Build Something Together
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Connect directly or scan the code with your phone.
            </p>
            {info.email && (
              <a
                href={`mailto:${info.email}`}
                className="text-xs font-medium text-indigo-600 hover:underline block pt-2"
              >
                {info.email}
              </a>
            )}
          </div>
          {qrCodeUrl && (
            <img
              src={qrCodeUrl}
              alt="QR"
              className="w-20 h-20 bg-white p-1.5 rounded-2xl shadow-subtle border border-purple-100 shrink-0"
            />
          )}
        </footer>
      </main>
    </div>
  );
}
