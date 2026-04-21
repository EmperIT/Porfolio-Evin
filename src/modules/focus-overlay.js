import * as THREE from 'three';

export function createFocusOverlayController({
  PANEL_LAYOUT,
  sectionContent,
  planetData,
  INTRO_FOCUS_KEY,
  projectToScreen
}) {
  const els = {
    root: document.getElementById('planetFocusOverlay'),
    linesSvg: document.getElementById('focusLinesSvg'),
    leftPanel: document.getElementById('focusPanelLeft'),
    rightPanel: document.getElementById('focusPanelRight'),
    leftLabel: document.getElementById('focusLeftLabel'),
    rightLabel: document.querySelector('#focusPanelRight .planet-focus-panel__label'),
    aboutCard: document.getElementById('focusAboutCard'),
    aboutProfile: document.getElementById('focusAboutProfile'),
    aboutText: document.getElementById('focusAboutText'),
    aboutContacts: document.getElementById('focusAboutContacts'),
    rightBody: document.getElementById('focusRightBody'),
    rightImage: document.getElementById('focusRightImage'),
    rightCta: document.getElementById('focusExploreBtn'),
    timeline: document.getElementById('focusExperienceTimeline'),
    projects: document.getElementById('focusProjectsGrid'),
    leftTitle: document.getElementById('focusLeftTitle'),
    leftBody: document.getElementById('focusLeftBody'),
    rightGrid: document.getElementById('focusRightGrid'),
    leftLine: document.getElementById('focusLineLeft'),
    rightLine: document.getElementById('focusLineRight')
  };

  let overlayPlanetName = '';
  let enterTimer = null;
  let aboutContactsCacheKey = '';
  let experienceTimelineCacheKey = '';
  let projectsCacheKey = '';
  let certificationsCacheKey = '';
  let skillsCacheKey = '';
  let singlePanelMode = false;

  const introWorldPosition = new THREE.Vector3();
  const worldPos = new THREE.Vector3();
  const screen = { x: 0, y: 0, visible: false, inFront: false };

  function onSinglePanelWheel(event) {
    if (!singlePanelMode || !els.rightPanel || !els.rightPanel.contains(event.target)) {
      return;
    }

    const timelineList = els.timeline
      ? els.timeline.querySelector('.planet-focus-timeline__list')
      : null;
    const projectList = els.projects
      ? els.projects.querySelector('.planet-focus-projects__list')
      : null;

    const isSkillsSection = els.root && els.root.classList.contains('is-skills-section');
    const isProjectSection = els.root 
      ? (els.root.classList.contains('is-projects-single') || els.root.classList.contains('is-license-single'))
      : (!timelineList && !!projectList);

    if (isProjectSection) {
      if (!projectList) return;
      event.preventDefault();
      event.stopPropagation();

      const hasExpandedProject = els.root
        ? els.root.classList.contains('is-project-expanded')
        : false;
      const slider = els.projects
        ? els.projects.querySelector('[data-project-slider]')
        : null;

      if (hasExpandedProject) {
        projectList.scrollTop += event.deltaY;
      } else {
        const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
        if (!delta || !slider || typeof slider.__shiftSlide !== 'function') {
          return;
        }

        const now = performance.now();
        const lastWheelAt = Number(slider.dataset.lastWheelAt || '0');
        if (now - lastWheelAt < 380) {
          return;
        }

        slider.dataset.lastWheelAt = String(now);
        slider.__shiftSlide(delta > 0 ? 1 : -1);
      }
      return;
    }

    let scrollTarget = timelineList;
    if (isSkillsSection) {
      scrollTarget = els.rightGrid ? els.rightGrid.querySelector('.planet-focus-skills__board-wrapper') : null;
    }

    if (!scrollTarget) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    scrollTarget.scrollTop += event.deltaY;
  }

  if (els.rightPanel) {
    els.rightPanel.addEventListener('wheel', onSinglePanelWheel, { passive: false });
  }

  function syncViewport() {
    if (!els.linesSvg) return;
    els.linesSvg.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
  }

  function clearLines() {
    if (!els.leftLine || !els.rightLine) return;
    els.leftLine.setAttribute('points', '0,0 0,0 0,0');
    els.rightLine.setAttribute('points', '0,0 0,0 0,0');
  }

  function renderLines(leftAttachX, leftAttachY, leftStartX, startY, rightAttachX, rightAttachY, rightStartX) {
    if (!els.leftLine || !els.rightLine) return;
    
    const leftPoints = makeBentConnectorPoints(leftStartX, startY, leftAttachX, leftAttachY);
    const rightPoints = makeBentConnectorPoints(rightStartX, startY, rightAttachX, rightAttachY);
    
    els.leftLine.setAttribute('points', leftPoints);
    els.rightLine.setAttribute('points', rightPoints);
  }

  function setOverlayOrigin(x, y) {
    if (!els.root) return;
    const clampedX = THREE.MathUtils.clamp(Math.round(x), 0, window.innerWidth);
    const clampedY = THREE.MathUtils.clamp(Math.round(y), 0, window.innerHeight);
    els.root.style.setProperty('--focus-origin-x', `${clampedX}px`);
    els.root.style.setProperty('--focus-origin-y', `${clampedY}px`);
  }

  function getHeaderSafeTopMin(extraGap = 12) {
    const headerEl = document.querySelector('.site-header');
    if (!headerEl) return PANEL_LAYOUT.topMin;

    const rect = headerEl.getBoundingClientRect();
    return Math.max(PANEL_LAYOUT.topMin, Math.round(rect.bottom + extraGap));
  }

  function syncProjectExpandedState() {
    if (!els.root || !els.projects) return;

    const hasExpandedProject = !!els.projects.querySelector('.planet-focus-project-card__toggle[aria-expanded="true"]');
    els.root.classList.toggle('is-project-expanded', hasExpandedProject);

    if (!hasExpandedProject && els.rightPanel) {
      els.rightPanel.scrollTop = 0;
    }
  }

  function chunkItems(items, chunkSize = 2) {
    const chunks = [];
    for (let index = 0; index < items.length; index += chunkSize) {
      chunks.push(items.slice(index, index + chunkSize));
    }
    return chunks;
  }

  function renderProjectSlider(slidesMarkup, ariaLabel) {
    return `
      <div class="planet-focus-projects__slider" data-project-slider data-slider-index="0">
        <button class="planet-focus-projects__nav" type="button" data-slider-action="prev" aria-label="Previous ${escapeHtmlAttribute(ariaLabel)}">
          <span aria-hidden="true">‹</span>
        </button>
        <div class="planet-focus-projects__list">
          <div class="planet-focus-projects__track">
            ${slidesMarkup}
          </div>
        </div>
        <button class="planet-focus-projects__nav" type="button" data-slider-action="next" aria-label="Next ${escapeHtmlAttribute(ariaLabel)}">
          <span aria-hidden="true">›</span>
        </button>
        <div class="planet-focus-projects__dots" role="tablist" aria-label="${escapeHtmlAttribute(ariaLabel)} slides"></div>
      </div>
    `;
  }

  function initializeProjectSlider() {
    if (!els.projects) return;

    const slider = els.projects.querySelector('[data-project-slider]');
    if (!slider) return;

    const track = slider.querySelector('.planet-focus-projects__track');
    const slides = Array.from(slider.querySelectorAll('.planet-focus-projects__slide'));
    const prevButton = slider.querySelector('[data-slider-action="prev"]');
    const nextButton = slider.querySelector('[data-slider-action="next"]');
    const dotsRoot = slider.querySelector('.planet-focus-projects__dots');
    if (!track || !slides.length || !prevButton || !nextButton || !dotsRoot) return;

    let currentIndex = 0;
    const maxIndex = Math.max(0, slides.length - 1);

    dotsRoot.innerHTML = slides.map((_, index) => `
      <button
        class="planet-focus-projects__dot"
        type="button"
        role="tab"
        aria-label="Go to slide ${index + 1}"
        aria-selected="false"
        data-slider-dot="${index}">
      </button>
    `).join('');

    const dotButtons = Array.from(dotsRoot.querySelectorAll('[data-slider-dot]'));

    const updateSlider = () => {
      currentIndex = THREE.MathUtils.clamp(currentIndex, 0, maxIndex);
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      slider.dataset.sliderIndex = String(currentIndex);
      prevButton.disabled = currentIndex === 0;
      nextButton.disabled = currentIndex === maxIndex;
      prevButton.hidden = maxIndex < 1;
      nextButton.hidden = maxIndex < 1;
      dotsRoot.hidden = maxIndex < 1;

      dotButtons.forEach((button, index) => {
        const isActive = index === currentIndex;
        button.setAttribute('aria-selected', isActive ? 'true' : 'false');
        button.classList.toggle('is-active', isActive);
      });
    };

    slider.__goToSlide = (nextIndex) => {
      currentIndex = nextIndex;
      updateSlider();
    };

    slider.__shiftSlide = (delta) => {
      if (!delta || maxIndex < 1) return;
      currentIndex += delta;
      updateSlider();
    };

    prevButton.addEventListener('click', () => {
      slider.__shiftSlide(-1);
    });

    nextButton.addEventListener('click', () => {
      slider.__shiftSlide(1);
    });

    dotButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const nextIndex = Number(button.dataset.sliderDot || '0');
        slider.__goToSlide(nextIndex);
      });
    });

    updateSlider();
  }

  function makeBentConnectorPoints(startX, startY, endX, endY) {
    const sx = Math.round(startX);
    const sy = Math.round(startY);
    const ex = Math.round(endX);
    const ey = Math.round(endY);

    const dir = ex >= sx ? 1 : -1;
    const dx = Math.abs(ex - sx);
    const diagonalTravel = Math.min(120, Math.max(52, dx * 0.35));
    const elbowX = Math.round(ex - dir * diagonalTravel);

    return `${sx},${sy} ${elbowX},${ey} ${ex},${ey}`;
  }

  function getPanelSize(panelEl, fallbackWidth = 320, fallbackHeight = 180) {
    if (!panelEl) return { width: fallbackWidth, height: fallbackHeight };
    return {
      width: panelEl.offsetWidth || fallbackWidth,
      height: panelEl.offsetHeight || fallbackHeight
    };
  }

  function getPanelTop(anchorY, panelHeight) {
    return THREE.MathUtils.clamp(
      anchorY - panelHeight * 0.5,
      PANEL_LAYOUT.topMin,
      window.innerHeight - panelHeight - PANEL_LAYOUT.bottomPadding
    );
  }

  function getPanelX(anchorX, panelWidth, side, gap) {
    const rawX = side === 'left'
      ? anchorX - panelWidth - gap
      : anchorX + gap;

    return THREE.MathUtils.clamp(
      rawX,
      PANEL_LAYOUT.margin,
      window.innerWidth - panelWidth - PANEL_LAYOUT.margin
    );
  }

  function getAttachY(panelTop, panelHeight) {
    return panelTop + Math.min(PANEL_LAYOUT.attachYMax, panelHeight * PANEL_LAYOUT.attachYFactor);
  }

  function hide() {
    if (!els.root) return;
    els.root.classList.remove('is-active', 'is-entering', 'is-intro', 'is-section');
    els.root.setAttribute('aria-hidden', 'true');
    clearLines();

    setAboutCardVisibility(false);

    if (els.leftPanel) {
      els.leftPanel.style.left = '';
      els.leftPanel.style.top = '';
      els.leftPanel.style.display = '';
    }
    if (els.rightPanel) {
      els.rightPanel.style.left = '';
      els.rightPanel.style.top = '';
      els.rightPanel.classList.remove('planet-focus-panel--about');
    }
    if (els.root) {
      els.root.style.removeProperty('--focus-origin-x');
      els.root.style.removeProperty('--focus-origin-y');
    }

    if (els.timeline) {
      els.timeline.hidden = true;
      els.timeline.style.display = 'none';
      els.timeline.innerHTML = '';
    }

    if (els.projects) {
      els.projects.hidden = true;
      els.projects.style.display = 'none';
      els.projects.innerHTML = '';
    }

    singlePanelMode = false;
    els.root.classList.remove('is-experience-single', 'is-projects-single', 'is-license-single', 'is-project-expanded');

    aboutContactsCacheKey = '';
    experienceTimelineCacheKey = '';
    projectsCacheKey = '';
    certificationsCacheKey = '';
    skillsCacheKey = '';
  }

  function triggerEnterAnimation() {
    if (!els.root) return;

    if (enterTimer) {
      clearTimeout(enterTimer);
    }

    els.root.classList.remove('is-entering');
    void els.root.offsetWidth;
    els.root.classList.add('is-entering');

    enterTimer = setTimeout(() => {
      if (els.root) {
        els.root.classList.remove('is-entering');
      }
    }, 460);
  }

  function renderPlanetFocusGrid(data) {
    if (!els.rightGrid || !data) return;

    const rows = [
      ['Radius', data.radius],
      ['Distance', data.distance],
      ['Orbit', data.orbit],
      ['Rotation', data.rotation],
      ['Tilt', data.tilt],
      ['Moons', data.moons]
    ];

    els.rightGrid.innerHTML = rows.map(([label, value]) => {
      return `<dl class="planet-focus-row"><dt>${label}</dt><dd>${value}</dd></dl>`;
    }).join('');
  }

  function getContactIconMarkup(icon) {
    switch (icon) {
      case 'mail':
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v12H4z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m5.5 7.5 6.5 5 6.5-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      case 'github':
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5a8.5 8.5 0 0 0-2.69 16.56c.43.08.59-.19.59-.42v-1.47c-2.39.52-2.89-1.02-2.89-1.02-.4-1.03-.98-1.31-.98-1.31-.8-.55.06-.54.06-.54.88.06 1.34.91 1.34.91.79 1.34 2.06.95 2.56.73.08-.58.31-.96.57-1.18-2.03-.23-4.16-1.02-4.16-4.54 0-1 .36-1.83.95-2.47-.1-.23-.42-1.15.09-2.39 0 0 .78-.25 2.55.94A8.9 8.9 0 0 1 12 7.9c.79 0 1.58.1 2.32.31 1.77-1.19 2.55-.94 2.55-.94.51 1.24.19 2.16.09 2.39.6.64.95 1.47.95 2.47 0 3.53-2.13 4.31-4.17 4.54.32.27.61.82.61 1.66v2.46c0 .23.16.5.6.42A8.5 8.5 0 0 0 12 3.5Z" fill="currentColor"/></svg>';
      case 'cv':
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h8.5L18 7v13.5H6z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M14.5 3.5V7H18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8.6 11.3c.4-.9 1.1-1.3 2-1.3 1.1 0 1.8.5 2.2 1.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M8.7 15.2c.4.8 1.1 1.2 2 1.2 1.2 0 2-.6 2.4-1.7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
      case 'linkedin':
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 9.5V18M6.5 6.2v.3M10.2 18v-4.8c0-1.9 1.1-3 2.7-3 1.7 0 2.4 1.1 2.4 3V18M14.8 9.5h3.7V18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6.5" cy="6.2" r="1" fill="currentColor"/></svg>';
      case 'phone':
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.4 4.8c.4-.4 1-.5 1.5-.3l2.2.9c.5.2.8.7.8 1.2v.4c0 .4-.1.8-.4 1.1l-1 1c.8 1.7 2 2.9 3.7 3.7l1-1c.3-.3.7-.4 1.1-.4h.4c.5 0 1 .3 1.2.8l.9 2.2c.2.5.1 1.1-.3 1.5-.7.7-1.6 1.1-2.6 1.1-2.9 0-6.2-1.9-8.7-4.4S6.2 8.1 6.2 5.2c0-1 .4-1.9 1.2-2.6Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/></svg>';
      default:
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';
    }
  }

  function renderAboutContacts(section) {
    if (!els.aboutContacts) return;

    const items = section.contactItems || [];
    const cacheKey = JSON.stringify(items);
    if (cacheKey === aboutContactsCacheKey) {
      return;
    }

    els.aboutContacts.innerHTML = items.map(item => {
      const external = /^https?:\/\//.test(item.href || '');
      const targetAttrs = external ? ' target="_blank" rel="noreferrer"' : '';
      return `
        <a class="planet-contact" href="${item.href || '#'}" data-tooltip="${item.tooltip || item.label || ''}" aria-label="${item.label || 'Contact'}"${targetAttrs}>
          <span class="planet-contact__icon">${getContactIconMarkup(item.icon)}</span>
        </a>
      `;
    }).join('');

    aboutContactsCacheKey = cacheKey;
  }

  function renderExperienceTimeline(section) {
    if (!els.timeline) return;

    const items = section.timeline || [];
    const cacheKey = JSON.stringify({
      title: section.title,
      body: section.body,
      rightBody: section.rightBody,
      items
    });
    if (cacheKey === experienceTimelineCacheKey) {
      return;
    }

    const headerMarkup = `
      <header class="planet-focus-timeline__header">
        <h3 class="planet-focus-timeline__heading">${escapeHtml(section.title || 'My Experience Journal')}</h3>
        <p class="planet-focus-timeline__summary">${escapeHtml(section.body || '')}</p>
      </header>
    `;

    const itemsMarkup = items.map((item) => {
      const highlights = Array.isArray(item.highlights) ? item.highlights : [];
      const highlightMarkup = highlights.length
        ? `<ul class="planet-focus-timeline__highlights">${highlights.map((entry) => `<li>${escapeHtml(entry)}</li>`).join('')}</ul>`
        : '';

      return `
        <article class="planet-focus-timeline__item">
          <p class="planet-focus-timeline__date">${escapeHtml(item.date || '')}</p>
          <div class="planet-focus-timeline__content">
            <h4 class="planet-focus-timeline__title">${escapeHtml(item.title || '')}</h4>
            <p class="planet-focus-timeline__detail">${escapeHtml(item.detail || '')}</p>
            ${highlightMarkup}
          </div>
        </article>
      `;
    }).join('');

    els.timeline.innerHTML = `${headerMarkup}<div class="planet-focus-timeline__list"><div class="planet-focus-timeline__rail" aria-hidden="true"></div>${itemsMarkup}</div>`;

    syncExperienceTimelineRail();

    experienceTimelineCacheKey = cacheKey;
  }

  function escapeHtmlAttribute(raw) {
    return escapeHtml(raw).replace(/`/g, '&#96;');
  }

  function renderProjectCards(section) {
    if (!els.projects) return;

    const items = Array.isArray(section.projects) ? section.projects : [];
    const cacheKey = JSON.stringify({
      title: section.title,
      body: section.body,
      items
    });
    if (cacheKey === projectsCacheKey && els.projects.innerHTML.trim()) {
      return;
    }

    const headerMarkup = `
      <header class="planet-focus-projects__header">
        <h3 class="planet-focus-projects__heading">${escapeHtml(section.title || 'Featured Projects')}</h3>
        <p class="planet-focus-projects__summary">${escapeHtml(section.body || '')}</p>
      </header>
    `;

    const cardItems = items.map((project, index) => {
      const stack = Array.isArray(project.stack) ? project.stack : [];
      const highlights = Array.isArray(project.highlights) ? project.highlights : [];
      const domainUrl = project.domainUrl || '#';
      const isExternal = /^https?:\/\//i.test(domainUrl);
      const targetAttrs = isExternal ? ' target="_blank" rel="noreferrer"' : '';
      const projectId = escapeHtmlAttribute(project.id || `project-${index + 1}`);
      const imageAlt = escapeHtmlAttribute(`${project.name || 'Project'} preview`);
      const imageMarkup = project.image
        ? `<a class="planet-focus-project-card__image-link" href="${escapeHtmlAttribute(domainUrl)}"${targetAttrs} aria-label="Visit ${project.name}">
             <img class="planet-focus-project-card__image" src="${project.image}" alt="${imageAlt}">
             <span class="planet-focus-project-card__image-overlay">
               <svg class="planet-focus-project-card__link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                 <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                 <polyline points="15 3 21 3 21 9"></polyline>
                 <line x1="10" y1="14" x2="21" y2="3"></line>
               </svg>
             </span>
           </a>`
        : '';
      const logoMarkup = project.logo
        ? `<img class="planet-focus-project-card__logo" src="${project.logo}" alt="${escapeHtmlAttribute(project.name)} logo">`
        : '';
      const roleCompany = [project.role, project.company].filter(Boolean).join(' • ');
      const roleCompanyMarkup = roleCompany
        ? `<p class="planet-focus-project-card__meta">${escapeHtml(roleCompany)}</p>`
        : '';
      const stackMarkup = stack.length
        ? `<p class="planet-focus-project-card__stack"><span>Tools:</span> ${escapeHtml(stack.join(', '))}</p>`
        : '';
      const detailBodyMarkup = project.detail
        ? `<p class="planet-focus-project-card__detail-body">${escapeHtml(project.detail)}</p>`
        : '';
      const highlightsMarkup = highlights.length
        ? `<ul class="planet-focus-project-card__highlights">${highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
        : '';

      return `
        <article class="planet-focus-project-card" data-project-id="${projectId}">
          <div class="planet-focus-project-card__media">
            ${imageMarkup}
          </div>
          <div class="planet-focus-project-card__main">
            <div class="planet-focus-project-card__header">
              <div class="planet-focus-project-card__title-section">
                <h4 class="planet-focus-project-card__title">${escapeHtml(project.name || 'Project')}</h4>
              </div>
              <div class="planet-focus-project-card__logo-section">
                ${logoMarkup}
              </div>
            </div>
            ${roleCompanyMarkup}
            <button class="planet-focus-project-card__toggle" type="button" aria-expanded="false" data-project-toggle="${projectId}">See details</button>
          </div>
          <div class="planet-focus-project-card__detail" aria-hidden="true">
            <p class="planet-focus-project-card__summary">${escapeHtml(project.summary || '')}</p>
            ${detailBodyMarkup}
            ${stackMarkup}
            ${highlightsMarkup}
          </div>
        </article>
      `;
    });

    const slidesMarkup = chunkItems(cardItems, 2).map((slideCards) => `
      <div class="planet-focus-projects__slide${slideCards.length === 1 ? ' planet-focus-projects__slide--single' : ''}">
        ${slideCards.join('')}
      </div>
    `).join('');

    els.projects.innerHTML = `${headerMarkup}${renderProjectSlider(slidesMarkup, 'project')}`;
    initializeProjectSlider();

    els.projects.querySelectorAll('[data-project-toggle]').forEach((button) => {
      button.addEventListener('click', () => {
        const card = button.closest('.planet-focus-project-card');
        const detail = card ? card.querySelector('.planet-focus-project-card__detail') : null;
        if (!detail) return;

        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        const nextExpanded = !isExpanded;

        els.projects.querySelectorAll('[data-project-toggle]').forEach((otherButton) => {
          if (otherButton === button) return;
          otherButton.setAttribute('aria-expanded', 'false');
          otherButton.textContent = 'See details';
        });

        els.projects.querySelectorAll('.planet-focus-project-card').forEach((otherCard) => {
          if (otherCard === card) return;
          otherCard.classList.remove('is-open');
          const otherDetail = otherCard.querySelector('.planet-focus-project-card__detail');
          if (otherDetail) {
            otherDetail.setAttribute('aria-hidden', 'true');
          }
        });

        button.setAttribute('aria-expanded', nextExpanded ? 'true' : 'false');
        button.textContent = isExpanded ? 'See details' : 'Hide details';
        card.classList.toggle('is-open', nextExpanded);
        detail.setAttribute('aria-hidden', nextExpanded ? 'false' : 'true');

        const slider = els.projects.querySelector('[data-project-slider]');
        const slide = button.closest('.planet-focus-projects__slide');
        if (nextExpanded && slider && slide && typeof slider.__goToSlide === 'function') {
          const slides = Array.from(els.projects.querySelectorAll('.planet-focus-projects__slide'));
          const slideIndex = slides.indexOf(slide);
          if (slideIndex >= 0) {
            slider.__goToSlide(slideIndex);
          }
        }

        const projectList = els.projects.querySelector('.planet-focus-projects__list');
        if (projectList) {
          projectList.scrollTop = 0;
        }

        syncProjectExpandedState();
      });
    });

    syncProjectExpandedState();

    projectsCacheKey = cacheKey;
  }

  function renderCertificationCards(section) {
    if (!els.projects) return;

    const items = Array.isArray(section.certifications) ? section.certifications : [];
    const cacheKey = JSON.stringify({
      title: section.title,
      body: section.body,
      items
    });
    if (cacheKey === certificationsCacheKey && els.projects.innerHTML.trim()) {
      return;
    }

    const headerMarkup = `
      <header class="planet-focus-projects__header">
        <h3 class="planet-focus-projects__heading">${escapeHtml(section.title || 'Certifications')}</h3>
        <p class="planet-focus-projects__summary">${escapeHtml(section.body || '')}</p>
      </header>
    `;

    const cardItems = items.map((cert, index) => {
      const certId = escapeHtmlAttribute(cert.id || `cert-${index + 1}`);
      const link = cert.link || '#';
      const isExternal = /^https?:\/\//i.test(link);
      const targetAttrs = isExternal ? ' target="_blank" rel="noreferrer"' : '';
      const skills = Array.isArray(cert.skills) ? cert.skills : [];
      const skillMarkup = skills.length
        ? `<p class="planet-focus-project-card__stack"><span>Skills:</span> ${escapeHtml(skills.join(', '))}</p>`
        : '';
      const logoMarkup = cert.logo
        ? `<img class="planet-focus-project-card__logo" src="${escapeHtmlAttribute(cert.logo)}" alt="${escapeHtmlAttribute(cert.issuer || cert.name || 'Certification')} logo">`
        : '';
      const issuedMarkup = cert.issued
        ? `<span class="planet-focus-cert-card__chip"><span>Issued</span>${escapeHtml(cert.issued)}</span>`
        : '';
      const credentialMarkup = cert.credentialId
        ? `<span class="planet-focus-cert-card__chip"><span>Credential</span>${escapeHtml(cert.credentialId)}</span>`
        : '';
      const chipsMarkup = issuedMarkup || credentialMarkup
        ? `<div class="planet-focus-cert-card__chips">${issuedMarkup}${credentialMarkup}</div>`
        : '';
      const imageAlt = escapeHtmlAttribute(`${cert.name || 'Certification'} preview`);
      const mediaMarkup = cert.image
        ? `<a class="planet-focus-project-card__image-link" href="${escapeHtmlAttribute(link)}"${targetAttrs} aria-label="Open ${escapeHtmlAttribute(cert.name || 'certification')}">
             <img class="planet-focus-project-card__image" src="${escapeHtmlAttribute(cert.image)}" alt="${imageAlt}">
             <span class="planet-focus-project-card__image-overlay">
               <svg class="planet-focus-project-card__link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                 <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                 <polyline points="15 3 21 3 21 9"></polyline>
                 <line x1="10" y1="14" x2="21" y2="3"></line>
               </svg>
             </span>
           </a>`
        : `<a class="planet-focus-project-card__image-link" href="${escapeHtmlAttribute(link)}"${targetAttrs} aria-label="Open ${escapeHtmlAttribute(cert.name || 'certification')}">
             <div class="planet-focus-cert-card__media-fallback">${escapeHtml(cert.issuer || cert.name || 'Certification')}</div>
             <span class="planet-focus-project-card__image-overlay">
               <svg class="planet-focus-project-card__link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                 <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                 <polyline points="15 3 21 3 21 9"></polyline>
                 <line x1="10" y1="14" x2="21" y2="3"></line>
               </svg>
             </span>
           </a>`;

      return `
        <article class="planet-focus-project-card planet-focus-project-card--skill planet-focus-cert-card" data-cert-id="${certId}">
          <div class="planet-focus-project-card__media">
            ${mediaMarkup}
          </div>
          <div class="planet-focus-project-card__main">
            <div class="planet-focus-project-card__header">
              <div class="planet-focus-project-card__title-section">
                <h4 class="planet-focus-project-card__title">${escapeHtml(cert.name || 'Certification')}</h4>
              </div>
              <div class="planet-focus-project-card__logo-section">
                ${logoMarkup}
              </div>
            </div>
            <p class="planet-focus-project-card__meta">${escapeHtml(cert.issuer || '')}</p>
            ${chipsMarkup}
            ${skillMarkup}
          </div>
        </article>
      `;
    });

    const slidesMarkup = chunkItems(cardItems, 2).map((slideCards) => `
      <div class="planet-focus-projects__slide${slideCards.length === 1 ? ' planet-focus-projects__slide--single' : ''}">
        ${slideCards.join('')}
      </div>
    `).join('');

    els.projects.innerHTML = `${headerMarkup}${renderProjectSlider(slidesMarkup, 'certification')}`;
    initializeProjectSlider();

    certificationsCacheKey = cacheKey;
  }

  function renderSkillsBoard(section) {
    if (!els.rightGrid) return;

    const groups = Array.isArray(section.groups) ? section.groups : [];
    const cacheKey = JSON.stringify({
      title: section.title,
      body: section.body,
      rightBody: section.rightBody,
      groups
    });
    if (cacheKey === skillsCacheKey && els.rightGrid.innerHTML.trim()) {
      return;
    }

    const cardsMarkup = groups.map((group, index) => {
      const items = Array.isArray(group.items) ? group.items : [];
      const toneClass = index < 2 ? ' planet-focus-skill-card--feature' : '';

      return `
        <article class="planet-focus-skill-card${toneClass}">
          <div class="planet-focus-skill-card__head">
            <p class="planet-focus-skill-card__eyebrow">Skill Cluster</p>
            <h4 class="planet-focus-skill-card__title">${escapeHtml(group.title || 'Skill Group')}</h4>
          </div>
          <p class="planet-focus-skill-card__note">${escapeHtml(group.note || '')}</p>
          <div class="planet-focus-skill-card__chips">
            ${items.map((item) => {
              if (typeof item === 'string') return `<span class="planet-focus-skill-chip">${escapeHtml(item)}</span>`;
              const iconMarkup = item.icon ? `<img src="${escapeHtmlAttribute(item.icon)}" alt="" style="width: 16px; height: 16px; margin-right: 6px; vertical-align: middle;" aria-hidden="true">` : '';
              return `<span class="planet-focus-skill-chip" style="display: inline-flex; align-items: center;">${iconMarkup}${escapeHtml(item.name || '')}</span>`;
            }).join('')}
          </div>
        </article>
      `;
    }).join('');

    const styleId = 'skills-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .planet-focus-skills__board-wrapper::-webkit-scrollbar { width: 6px; }
        .planet-focus-skills__board-wrapper::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 4px; margin-bottom: 12px; }
        .planet-focus-skills__board-wrapper::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 4px; }
        .planet-focus-skills__board-wrapper::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }
        .planet-focus-skill-chip { transition: all 0.3s ease; cursor: pointer; }
        .planet-focus-skill-chip:hover { background-color: rgba(255, 255, 255, 0.2); color: #ffd700; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3); }
      `;
      document.head.appendChild(style);
    }

    els.rightGrid.innerHTML = `
      <section class="planet-focus-skills" aria-label="${escapeHtmlAttribute(section.title || 'Skills')}" style="display: flex; flex-direction: column; height: 100%; min-height: 0;">
        <header class="planet-focus-skills__hero" style="flex-shrink: 0; margin-bottom: 20px;">
          <p class="planet-focus-skills__eyebrow">Capability Constellation</p>
          <h3 class="planet-focus-skills__heading" style="font-size: 2rem;">${escapeHtml(section.title || 'Capability Map')}</h3>
          <p class="planet-focus-skills__summary">${escapeHtml(section.rightBody || section.body || '')}</p>
        </header>
        <div class="planet-focus-skills__board-wrapper" style="overflow-y: auto; flex: 1; min-height: 0; padding-right: 12px;">
          <div class="planet-focus-skills__board">
            ${cardsMarkup}
          </div>
        </div>
      </section>
    `;

    skillsCacheKey = cacheKey;
  }

  function syncExperienceTimelineRail() {
    if (!els.timeline) return;

    const timelineList = els.timeline.querySelector('.planet-focus-timeline__list');
    const timelineRail = els.timeline.querySelector('.planet-focus-timeline__rail');
    if (!timelineList || !timelineRail) return;

    timelineRail.style.height = `${timelineList.scrollHeight}px`;
  }

  function setAboutCardVisibility(isVisible) {
    if (!els.aboutCard) return;
    els.aboutCard.hidden = !isVisible;
    els.aboutCard.style.display = isVisible ? 'grid' : 'none';
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
    // Support **highlight** for emphasized text and preserve newline formatting.
    return escaped
      .replace(/\*\*(.+?)\*\*/g, '<span class="planet-focus-emphasis">$1</span>')
      .replace(/\s*\n\s*/g, '<br><br>');
  }

  function setIntroLayout() {
    singlePanelMode = false;
    if (els.root) {
      els.root.classList.remove('is-experience-single', 'is-projects-single', 'is-license-single', 'is-skills-section', 'is-project-expanded');
    }

    if (els.root) {
      els.root.classList.remove('is-section');
      els.root.classList.add('is-intro');
    }

    if (els.leftLabel) {
      els.leftLabel.textContent = 'Frontend Developer';
    }
    if (els.leftTitle) {
      els.leftTitle.textContent = sectionContent.introduce.title;
    }
    if (els.leftBody) {
      els.leftBody.textContent = sectionContent.introduce.body;
    }
    if (els.rightLabel) {
      els.rightLabel.textContent = sectionContent.introduce.rightLabel || 'Features';
    }
    if (els.rightBody) {
      els.rightBody.style.display = 'none';
      els.rightBody.textContent = '';
    }
    if (els.rightImage) {
      const introImage = sectionContent.introduce.rightImage;
      if (introImage) {
        els.rightImage.src = introImage;
        els.rightImage.style.display = 'block';
      } else {
        els.rightImage.style.display = 'none';
        els.rightImage.removeAttribute('src');
      }
    }
    if (els.rightCta) {
      els.rightCta.style.display = 'inline-flex';
    }
    if (els.rightGrid) {
      els.rightGrid.style.display = 'none';
      els.rightGrid.innerHTML = '';
    }
    if (els.timeline) {
      els.timeline.hidden = true;
      els.timeline.style.display = 'none';
      els.timeline.innerHTML = '';
    }
    setAboutCardVisibility(false);
    if (els.rightPanel) {
      els.rightPanel.classList.remove('planet-focus-panel--about');
    }
    if (els.leftPanel) {
      const chip = els.leftPanel.querySelector('.planet-focus-chip');
      if (chip) {
        chip.style.display = '';
      }
    }
  }

  function setSectionLayout(sectionId, details) {
    if (!els.root) return;

    const section = sectionContent[sectionId] || {};
    const summary = section.rightBody || section.body || details.info;

    els.root.classList.remove('is-intro');
    els.root.classList.add('is-section');
    els.root.classList.toggle('is-skills-section', sectionId === 'skills');

    if (els.leftLabel) {
      els.leftLabel.textContent = section.leftLabel || section.title || sectionId;
    }
    if (els.leftTitle) {
      els.leftTitle.textContent = section.title || sectionId;
    }
    if (els.leftBody) {
      els.leftBody.innerHTML = formatRichText(section.body || details.info);
    }
    if (els.rightLabel) {
      els.rightLabel.textContent = section.rightLabel || 'Section';
    }

    singlePanelMode = sectionId === 'experience' || sectionId === 'projects' || sectionId === 'license' || sectionId === 'skills';
    els.root.classList.toggle('is-experience-single', sectionId === 'experience');
    els.root.classList.toggle('is-projects-single', sectionId === 'projects' || sectionId === 'license');
    els.root.classList.toggle('is-license-single', sectionId === 'license');
    if (sectionId !== 'projects' && sectionId !== 'license') {
      els.root.classList.remove('is-project-expanded');
    }

    if (sectionId === 'about') {
      setAboutCardVisibility(true);
      if (els.aboutProfile) {
        els.aboutProfile.src = section.profileImage || '';
        els.aboutProfile.alt = `${section.title || 'About me'} profile portrait`;
      }
      if (els.aboutText) {
        els.aboutText.innerHTML = formatRichText(section.rightBody || 'Connect with me through the links below.');
      }
      renderAboutContacts(section);
      if (els.rightBody) {
        els.rightBody.textContent = '';
        els.rightBody.style.display = 'none';
      }
      if (els.rightImage) {
        els.rightImage.style.display = 'none';
        els.rightImage.removeAttribute('src');
      }
      if (els.rightCta) {
        els.rightCta.style.display = 'none';
      }
      if (els.rightGrid) {
        els.rightGrid.style.display = 'none';
        els.rightGrid.innerHTML = '';
      }
      if (els.projects) {
        els.projects.hidden = true;
        els.projects.style.display = 'none';
        els.projects.innerHTML = '';
      }
      if (els.rightPanel) {
        els.rightPanel.classList.add('planet-focus-panel--about');
      }
      if (els.leftPanel) {
        const chip = els.leftPanel.querySelector('.planet-focus-chip');
        if (chip) {
          chip.style.display = 'none';
        }
      }
      return;
    }

    setAboutCardVisibility(false);
    if (els.rightPanel) {
      els.rightPanel.classList.remove('planet-focus-panel--about');
    }

    if (els.rightBody) {
      if (singlePanelMode || sectionId === 'skills') {
        els.rightBody.innerHTML = '';
        els.rightBody.style.display = 'none';
      } else {
        els.rightBody.innerHTML = formatRichText(summary);
        els.rightBody.style.display = 'block';
      }
    }
    if (els.rightImage) {
      els.rightImage.style.display = 'none';
      els.rightImage.removeAttribute('src');
    }
    if (els.rightCta) {
      els.rightCta.style.display = 'none';
    }
    if (els.rightGrid) {
      if (sectionId === 'skills') {
        renderSkillsBoard(section);
        els.rightGrid.style.display = 'flex';
        els.rightGrid.style.flexDirection = 'column';
        els.rightGrid.style.height = '100%';
        els.rightGrid.style.minHeight = '0';
      } else {
        els.rightGrid.style.display = 'none';
        els.rightGrid.style.height = '';
        els.rightGrid.style.minHeight = '';
        els.rightGrid.innerHTML = '';
      }
    }
    if (els.projects) {
      if (sectionId === 'projects') {
        renderProjectCards(section);
        els.projects.hidden = false;
        els.projects.style.display = 'grid';
      } else if (sectionId === 'license') {
        renderCertificationCards(section);
        els.projects.hidden = false;
        els.projects.style.display = 'grid';
      } else {
        els.projects.hidden = true;
        els.projects.style.display = 'none';
        els.projects.innerHTML = '';
      }
    }
    if (els.timeline) {
      if (sectionId === 'experience') {
        renderExperienceTimeline(section);
        els.timeline.hidden = false;
        els.timeline.style.display = 'grid';
      } else {
        els.timeline.hidden = true;
        els.timeline.style.display = 'none';
        els.timeline.innerHTML = '';
      }
    }
    if (els.leftPanel) {
      const chip = els.leftPanel.querySelector('.planet-focus-chip');
      if (chip) {
        chip.style.display = 'none';
      }
    }
  }

  function showPlanetFocusOverlay(planetName, activeSectionId) {
    if (!els.root || !planetName) return;

    const details = planetData[planetName];
    if (!details) {
      hide();
      return;
    }

    const isIntro = activeSectionId === 'introduce';

    if (isIntro) {
      setIntroLayout();
    } else {
      setSectionLayout(activeSectionId, details);
    }

    els.root.classList.add('is-active');
    els.root.setAttribute('aria-hidden', 'false');

    const nextOverlayKey = isIntro ? INTRO_FOCUS_KEY : activeSectionId;
    if (overlayPlanetName !== nextOverlayKey) {
      triggerEnterAnimation();
    }
    overlayPlanetName = nextOverlayKey;
  }

  function update({ selectedPlanet, activeSectionId, isMovingTowardsPlanet, isZoomingOut, sun }) {
    if (!els.root) {
      return;
    }

    if (!selectedPlanet) {
      if (activeSectionId !== 'introduce' || isMovingTowardsPlanet || isZoomingOut) {
        overlayPlanetName = '';
        hide();
        return;
      }

      sun.getWorldPosition(introWorldPosition);
      projectToScreen(introWorldPosition, screen);
      if (!screen.inFront) {
        hide();
        return;
      }

      setIntroLayout();
      setOverlayOrigin(screen.x, screen.y);

      els.root.classList.add('is-active', 'is-intro');
      els.root.setAttribute('aria-hidden', 'false');
      if (overlayPlanetName !== INTRO_FOCUS_KEY) {
        triggerEnterAnimation();
      }
      overlayPlanetName = INTRO_FOCUS_KEY;

      if (els.leftPanel) {
        els.leftPanel.style.display = '';
      }
      if (els.rightPanel) {
        els.rightPanel.style.display = '';
      }

      const leftSize = getPanelSize(els.leftPanel, 320, 180);
      const leftY = getPanelTop(screen.y + PANEL_LAYOUT.introOffsetY, leftSize.height);
      const leftX = getPanelX(screen.x + PANEL_LAYOUT.introOffsetX, leftSize.width, 'left', PANEL_LAYOUT.introGap);

      if (els.leftPanel) {
        els.leftPanel.style.left = `${leftX}px`;
        els.leftPanel.style.top = `${leftY}px`;
      }

      const leftAttachX = leftX + leftSize.width;
      const leftAttachY = getAttachY(leftY, leftSize.height);
      const leftStartX = screen.x + PANEL_LAYOUT.leftStartOffset;
      const startY = screen.y;

      const rightSize = getPanelSize(els.rightPanel, 320, 180);
      const rightY = getPanelTop(screen.y + PANEL_LAYOUT.introOffsetY + PANEL_LAYOUT.introRightOffsetY, rightSize.height);
      const rightX = getPanelX(screen.x + PANEL_LAYOUT.introOffsetX, rightSize.width, 'right', PANEL_LAYOUT.introGap);

      if (els.rightPanel) {
        els.rightPanel.style.left = `${rightX}px`;
        els.rightPanel.style.top = `${rightY}px`;
      }

      const rightAttachX = rightX + 50;
      const rightAttachY = getAttachY(rightY, rightSize.height);
      const rightStartX = screen.x + PANEL_LAYOUT.rightStartOffset;
      
      renderLines(leftAttachX, leftAttachY, leftStartX, startY, rightAttachX, rightAttachY, rightStartX);
      return;
    }

    if (isMovingTowardsPlanet || isZoomingOut) {
      hide();
      return;
    }

    selectedPlanet.planet.getWorldPosition(worldPos);
    projectToScreen(worldPos, screen);

    if (!screen.inFront) {
      hide();
      return;
    }

    showPlanetFocusOverlay(selectedPlanet.name, activeSectionId);
    setOverlayOrigin(screen.x, screen.y);

    if (els.rightPanel) {
      els.rightPanel.style.display = '';
    }
    if (els.leftPanel) {
      els.leftPanel.style.display = singlePanelMode ? 'none' : '';
    }

    if (singlePanelMode) {
      syncExperienceTimelineRail();

      const safeTop = Math.max(getHeaderSafeTopMin(24), 92);

      if (els.rightPanel) {
        if (activeSectionId === 'skills') {
          els.rightPanel.style.width = '';
          els.rightPanel.style.maxWidth = '';
          els.rightPanel.style.overflowY = '';
        } else {
          els.rightPanel.style.width = '';
          els.rightPanel.style.maxWidth = '';
          els.rightPanel.style.overflowY = '';
        }
      }

      if (activeSectionId === 'license' && els.rightPanel) {
        const projectAvailableHeight = Math.max(340, window.innerHeight - safeTop - PANEL_LAYOUT.bottomPadding);
        els.rightPanel.style.maxHeight = `${projectAvailableHeight}px`;
      } else if (els.rightPanel) {
        els.rightPanel.style.maxHeight = '';
      }

      const rightSize = getPanelSize(els.rightPanel, 560, 320);
      const panelTop = (activeSectionId === 'projects' || activeSectionId === 'skills' || activeSectionId === 'license')
        ? safeTop
        : THREE.MathUtils.clamp(
          window.innerHeight * 0.5 - rightSize.height * 0.5,
          safeTop,
          window.innerHeight - rightSize.height - PANEL_LAYOUT.bottomPadding
        );
      const centeredX = THREE.MathUtils.clamp(
        window.innerWidth * 0.5 - rightSize.width * 0.5,
        PANEL_LAYOUT.margin,
        window.innerWidth - rightSize.width - PANEL_LAYOUT.margin
      );

      if (els.rightPanel) {
        els.rightPanel.style.left = `${centeredX}px`;
        els.rightPanel.style.top = `${panelTop}px`;
      }

      const rightAttachX = centeredX + 40;
      const rightAttachY = getAttachY(panelTop, rightSize.height);
      const startX = screen.x + PANEL_LAYOUT.rightStartOffset;
      const startY = screen.y;
      clearLines();
      return;
    }

    const leftSize = getPanelSize(els.leftPanel, 320, 180);
    const rightSize = getPanelSize(els.rightPanel, 320, 180);
    const panelHeight = Math.max(leftSize.height, rightSize.height);
    const panelTop = getPanelTop(screen.y, panelHeight);

    const leftX = getPanelX(screen.x, leftSize.width, 'left', PANEL_LAYOUT.planetGap);
    const rightX = getPanelX(screen.x, rightSize.width, 'right', PANEL_LAYOUT.planetGap);

    if (els.leftPanel) {
      els.leftPanel.style.left = `${leftX}px`;
      els.leftPanel.style.top = `${panelTop}px`;
    }
    if (els.rightPanel) {
      els.rightPanel.style.left = `${rightX}px`;
      els.rightPanel.style.top = `${panelTop}px`;
    }

    const leftAttachX = leftX + leftSize.width;
    const leftAttachY = getAttachY(panelTop, panelHeight);

    const rightAttachX = rightX + 50;
    const rightAttachY = getAttachY(panelTop, panelHeight);

    const leftStartX = screen.x + PANEL_LAYOUT.leftStartOffset;
    const rightStartX = screen.x + PANEL_LAYOUT.rightStartOffset;
    const startY = screen.y;

    renderLines(leftAttachX, leftAttachY, leftStartX, startY, rightAttachX, rightAttachY, rightStartX);
  }

  function resetSelectionState() {
    overlayPlanetName = '';
  }

  return {
    syncViewport,
    hide,
    update,
    resetSelectionState
  };
}
