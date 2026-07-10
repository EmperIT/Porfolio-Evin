import { sectionContent } from './sections.js';

const MOBILE_BREAKPOINT = 760;

function isMobile() {
  return window.innerWidth <= MOBILE_BREAKPOINT;
}

function escapeHtml(raw) {
  return String(raw)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatRichText(raw) {
  if (!raw) return '';
  const escaped = escapeHtml(raw);
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<span class="mobile-emphasis">$1</span>')
    .replace(/\s*\n\s*/g, '<br><br>');
}

function renderContactIcon(iconKey) {
  const icons = {
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
    github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>',
    cv: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>'
  };
  return icons[iconKey] || '';
}

function renderMobileIntroduce(container) {
  const section = sectionContent.introduce;
  if (!section) return;
  container.innerHTML = `
    <p class="panel__eyebrow">${escapeHtml(section.kicker)}</p>
    <h1 class="panel__title panel__title--hero">${escapeHtml(section.title)}</h1>
    <p class="panel__lead panel__lead--hero">${escapeHtml(section.body)}</p>
    <div class="mobile-scroll-hint">
      <span class="mobile-scroll-hint__arrow">↓</span>
      <span>Scroll to explore</span>
    </div>
  `;
}

function renderMobileAbout(container) {
  const section = sectionContent.about;
  if (!section) return;
  const contactsHtml = (section.contactItems || []).map(c => `
    <a class="mobile-contact" href="${escapeHtml(c.href)}" target="_blank" rel="noreferrer" title="${escapeHtml(c.tooltip)}">
      <span class="mobile-contact__icon">${renderContactIcon(c.icon)}</span>
      <span class="mobile-contact__label">${escapeHtml(c.label)}</span>
    </a>
  `).join('');

  container.innerHTML = `
    <p class="panel__eyebrow">${escapeHtml(section.kicker)}</p>
    <h2 class="panel__title">${escapeHtml(section.title)}</h2>
    ${section.profileImage ? `<img class="mobile-profile" src="${section.profileImage}" alt="Profile portrait">` : ''}
    <div class="panel__lead">${formatRichText(section.body)}</div>
    <div class="mobile-contacts">${contactsHtml}</div>
  `;
}

function renderMobileExperience(container) {
  const section = sectionContent.experience;
  if (!section) return;
  const timelineHtml = (section.timeline || []).map(item => `
    <div class="mobile-timeline__item">
      <div class="mobile-timeline__date">${escapeHtml(item.date)}</div>
      <div class="mobile-timeline__content">
        <h4 class="mobile-timeline__title">${escapeHtml(item.title)}</h4>
        <p class="mobile-timeline__detail">${escapeHtml(item.detail)}</p>
        ${item.highlights && item.highlights.length ? `
          <ul class="mobile-timeline__highlights">
            ${item.highlights.map(h => `<li>${escapeHtml(h)}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
    </div>
  `).join('');

  container.innerHTML = `
    <p class="panel__eyebrow">${escapeHtml(section.kicker)}</p>
    <h2 class="panel__title">${escapeHtml(section.title)}</h2>
    <p class="panel__lead">${escapeHtml(section.body)}</p>
    <div class="mobile-timeline">${timelineHtml}</div>
  `;
}

function renderMobileProjects(container) {
  const section = sectionContent.projects;
  if (!section) return;
  const projectsHtml = (section.projects || []).map(project => {
    const stack = (project.stack || []).map(s => `<span class="mobile-stack-tag">${escapeHtml(s)}</span>`).join('');
    const highlights = (project.highlights || []).map(h => `<li>${escapeHtml(h)}</li>`).join('');
    const domainUrl = project.domainUrl || '#';
    const isExternal = /^https?:\/\//i.test(domainUrl);
    return `
      <article class="mobile-project-card">
        ${project.image ? `
          <a class="mobile-project-card__image-link" href="${escapeHtml(domainUrl)}"${isExternal ? ' target="_blank" rel="noreferrer"' : ''}>
            <img class="mobile-project-card__image" src="${project.image}" alt="${escapeHtml(project.name)} preview">
          </a>
        ` : ''}
        <div class="mobile-project-card__body">
          <div class="mobile-project-card__header">
            ${project.logo ? `<img class="mobile-project-card__logo" src="${project.logo}" alt="${escapeHtml(project.name)} logo">` : ''}
            <div>
              <h4 class="mobile-project-card__title">${escapeHtml(project.name)}</h4>
              <p class="mobile-project-card__meta">${escapeHtml([project.role, project.company].filter(Boolean).join(' • '))}</p>
            </div>
          </div>
          <p class="mobile-project-card__summary">${escapeHtml(project.summary || '')}</p>
          ${(project.detail || stack || highlights) ? `
            <button type="button" class="mobile-project-card__toggle">See Detail</button>
            <div class="mobile-project-card__expanded-content">
              ${project.detail ? `<p class="mobile-project-card__detail">${escapeHtml(project.detail)}</p>` : ''}
              ${stack ? `<div class="mobile-project-card__stack">${stack}</div>` : ''}
              ${highlights ? `<ul class="mobile-project-card__highlights">${highlights}</ul>` : ''}
            </div>
          ` : ''}
        </div>
      </article>
    `;
  }).join('');

  container.innerHTML = `
    <p class="panel__eyebrow">${escapeHtml(section.kicker)}</p>
    <h2 class="panel__title">${escapeHtml(section.title)}</h2>
    <p class="panel__lead">${escapeHtml(section.body)}</p>
    <div class="mobile-projects">${projectsHtml}</div>
  `;

  const toggles = container.querySelectorAll('.mobile-project-card__toggle');
  toggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      const card = e.target.closest('.mobile-project-card');
      if (card) {
        card.classList.toggle('is-expanded');
        e.target.textContent = card.classList.contains('is-expanded') ? 'Close Detail' : 'See Detail';
      }
    });
  });
}

function renderMobileLicense(container) {
  const section = sectionContent.license;
  if (!section) return;
  const certsHtml = (section.certifications || []).map(cert => {
    const skills = (cert.skills || []).map(s => `<span class="mobile-stack-tag">${escapeHtml(s)}</span>`).join('');
    return `
      <article class="mobile-cert-card">
        ${cert.image ? `
          <a class="mobile-cert-card__image-link" href="${escapeHtml(cert.link || '#')}" target="_blank" rel="noreferrer">
            <img class="mobile-cert-card__image" src="${cert.image}" alt="${escapeHtml(cert.name)} certificate">
          </a>
        ` : ''}
        <div class="mobile-cert-card__body">
          <div class="mobile-cert-card__header">
            ${cert.logo ? `<img class="mobile-cert-card__logo" src="${cert.logo}" alt="${escapeHtml(cert.issuer)} logo">` : ''}
            <div>
              <h4 class="mobile-cert-card__title">${escapeHtml(cert.name)}</h4>
              <p class="mobile-cert-card__issuer">${escapeHtml(cert.issuer)}${cert.issued ? ` · ${escapeHtml(cert.issued)}` : ''}</p>
            </div>
          </div>
          ${cert.credentialId ? `<p class="mobile-cert-card__credential">Credential: ${escapeHtml(cert.credentialId)}</p>` : ''}
          ${skills ? `<div class="mobile-cert-card__skills">${skills}</div>` : ''}
        </div>
      </article>
    `;
  }).join('');

  container.innerHTML = `
    <p class="panel__eyebrow">${escapeHtml(section.kicker)}</p>
    <h2 class="panel__title">${escapeHtml(section.title)}</h2>
    <p class="panel__lead">${escapeHtml(section.body)}</p>
    <div class="mobile-certs">${certsHtml}</div>
  `;
}

function renderMobileSkills(container) {
  const section = sectionContent.skills;
  if (!section) return;
  const groupsHtml = (section.groups || []).map(group => {
    const items = (group.items || []).map(item => {
      if (typeof item === 'string') {
        return `<span class="mobile-skill-chip">${escapeHtml(item)}</span>`;
      }
      return `
        <span class="mobile-skill-chip">
          ${item.icon ? `<img class="mobile-skill-chip__icon" src="${escapeHtml(item.icon)}" alt="" loading="lazy">` : ''}
          ${escapeHtml(item.name)}
        </span>
      `;
    }).join('');
    return `
      <div class="mobile-skill-group">
        <h4 class="mobile-skill-group__title">${escapeHtml(group.title)}</h4>
        ${group.note ? `<p class="mobile-skill-group__note">${escapeHtml(group.note)}</p>` : ''}
        <div class="mobile-skill-group__chips">${items}</div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <p class="panel__eyebrow">${escapeHtml(section.kicker)}</p>
    <h2 class="panel__title">${escapeHtml(section.title)}</h2>
    <p class="panel__lead">${escapeHtml(section.body)}</p>
    <div class="mobile-skills">${groupsHtml}</div>
  `;
}

const renderers = {
  introduce: renderMobileIntroduce,
  about: renderMobileAbout,
  experience: renderMobileExperience,
  projects: renderMobileProjects,
  license: renderMobileLicense,
  skills: renderMobileSkills
};

let initialized = false;

export function initMobileContent() {
  if (!isMobile() || initialized) return;
  initialized = true;

  document.querySelectorAll('.panel').forEach(panel => {
    const sectionId = panel.id;
    const content = panel.querySelector('.panel__content');
    if (!content || !renderers[sectionId]) return;
    renderers[sectionId](content);
  });
}

export function checkMobileOnResize() {
  if (isMobile() && !initialized) {
    initMobileContent();
  }
}
