// Simple interactions for the LMS UI
(function () {
  const byId = (id) => document.getElementById(id);
  const qs = (sel, el = document) => el.querySelector(sel);
  const qsa = (sel, el = document) => Array.from(el.querySelectorAll(sel));

  let customCourses = [];
  try {
    customCourses = JSON.parse(localStorage.getItem('instructorCourses') || '[]');
  } catch (e) {
    customCourses = [];
  }
  if (!Array.isArray(window.COURSES)) window.COURSES = [];
  customCourses.forEach((course) => {
    if (!window.COURSES.some((c) => c.id === course.id)) {
      window.COURSES.push(course);
    }
  });

  function persistCustomCourses() {
    try {
      localStorage.setItem('instructorCourses', JSON.stringify(customCourses));
    } catch (e) {
      /* ignore */
    }
  }

  // Footer year
  const yearEl = byId('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Render helpers
  const formatMeta = (level, lessonsCount) =>
    `${(level||'').charAt(0).toUpperCase() + (level||'').slice(1)} • ${lessonsCount} lessons`;

  const courseLink = (id) => `course.html?id=${encodeURIComponent(id)}`;

  function courseCard(course, opts = {}) {
    const { showProgress = false, cta = 'Enrol' } = opts;
    const progressHtml = showProgress && course.progress
      ? `<div class="progress"><div class="progress__bar" style="width: ${course.progress}%"></div></div>
         <span class="badge">${course.progress}% complete</span>`
      : '';
    return `
      <article class="card card--course" data-level="${course.level}" data-title="${course.title}">
        <a href="${courseLink(course.id)}" class="card__media">
          <img src="${course.cover}" alt="${course.title}" />
        </a>
        <div class="card__body">
          <h3 class="card__title"><a href="${courseLink(course.id)}">${course.title}</a></h3>
          <p class="card__meta">${formatMeta(course.level, course.lessonsCount)}</p>
          ${course.description ? `<p class="card__desc">${course.description}</p>` : ''}
          ${progressHtml ? `<div class="card__actions"><a class="btn btn--primary" href="${courseLink(course.id)}">Continue</a>${progressHtml}</div>` : `<div class="card__actions"><a class="btn btn--primary" href="${courseLink(course.id)}">${cta}</a></div>`}
        </div>
      </article>
    `;
  }

  // Courses page filtering + rendering
  const searchInput = byId('coursesSearch');
  const courseGrid = byId('courseGrid');
  const chips = qsa('.chip');
  let currentFilter = 'all';

  function applyFilters() {
    if (!courseGrid) return;
    const term = (searchInput?.value || '').toLowerCase();
    qsa('.card--course', courseGrid).forEach((card) => {
      const title = (card.getAttribute('data-title') || '').toLowerCase();
      const level = (card.getAttribute('data-level') || 'all').toLowerCase();
      const matchesText = !term || title.includes(term);
      const matchesLevel = currentFilter === 'all' || level === currentFilter;
      card.style.display = matchesText && matchesLevel ? '' : 'none';
    });
  }

  function renderCourseGrid() {
    if (!courseGrid || !Array.isArray(window.COURSES)) return;
    courseGrid.innerHTML = window.COURSES
      .map((c) => courseCard(c, { cta: 'Enroll' }))
      .join('');
    applyFilters();
  }

  if (courseGrid && window.COURSES) {
    renderCourseGrid();
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }
  if (chips.length) {
    chips.forEach((chip) =>
      chip.addEventListener('click', () => {
        chips.forEach((c) => c.classList.remove('chip--active'));
        chip.classList.add('chip--active');
        currentFilter = chip.getAttribute('data-filter') || 'all';
        applyFilters();
      })
    );
  }

  // Homepage: Continue + Enrolled
  const continueGrid = byId('continueGrid');
  const recommendedGrid = byId('recommendedGrid');
  if (continueGrid && Array.isArray(window.COURSES)) {
    const inProgress = window.COURSES.filter((c) => (c.progress || 0) > 0).slice(0, 6);
    if (inProgress.length) {
      continueGrid.innerHTML = inProgress.map((c) => courseCard(c, { showProgress: true, cta: 'Continue' })).join('');
    } else {
      const sec = continueGrid.closest('.section');
      if (sec) sec.style.display = 'none';
    }
  }
  if (recommendedGrid && Array.isArray(window.COURSES)) {
    const studying = window.COURSES.filter((c) => (c.progress || 0) > 0 || c.enrolled);
    const studyingLevels = new Set(studying.map((c) => c.level));
    const pool = window.COURSES.filter((c) => !studying.includes(c) && !c.enrolled && (c.progress || 0) === 0);
    let recs = pool.filter((c) => studyingLevels.has(c.level)).slice(0, 6);
    if (recs.length < 6) {
      const used = new Set(recs.map((c) => c.id));
      const fillers = pool.filter((c) => !used.has(c.id)).slice(0, 6 - recs.length);
      recs = recs.concat(fillers);
    }
    recommendedGrid.innerHTML = recs.map((c) => courseCard(c, { cta: 'Explore' })).join('');
  }

  // Tabs on course page
  const tabButtons = qsa('.tab');
  const tabPanes = qsa('.tabpane');
  tabButtons.forEach((btn) =>
    btn.addEventListener('click', () => {
      tabButtons.forEach((b) => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      tabPanes.forEach((p) => p.classList.remove('is-active'));
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');
      const id = btn.getAttribute('aria-controls');
      const pane = id ? byId(id) : null;
      if (pane) pane.classList.add('is-active');
    })
  );

  // Course detail: render by id
  function getParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
  }

  function renderCourseDetail() {
    const id = getParam('id');
    if (!id || !Array.isArray(window.COURSES)) return;
    const course = window.COURSES.find((c) => c.id === id);
    if (!course) return;

    const titleEl = byId('courseTitle');
    const descEl = byId('courseDesc');
    const curList = byId('curriculumList');
    const sidebar = byId('syllabus');
    const video = byId('player');
    const videoSrc = byId('playerSource');

    if (titleEl) titleEl.textContent = course.title;
    if (descEl) descEl.textContent = course.description || '';

    if (curList && course.syllabus) {
      curList.innerHTML = course.syllabus
        .map((l, i) => `<li>Module ${i + 1} — ${l.title}</li>`)
        .join('');
    }

    if (sidebar && course.syllabus) {
      sidebar.innerHTML = course.syllabus
        .map((l, i) => `
          <li class="syllabus__item ${i === 0 ? 'is-active' : ''}" data-lesson="${i + 1}">
            <button class="syllabus__btn">
              <span class="syllabus__title">${i + 1}. ${l.title}</span>
              <span class="syllabus__duration">${l.duration || ''}</span>
            </button>
          </li>
        `)
        .join('');
    }

    if (video && videoSrc) {
      const firstWithVideo = (course.syllabus || []).find((l) => l.video);
      if (firstWithVideo && firstWithVideo.video) {
        videoSrc.src = firstWithVideo.video;
        video.load();
      }
      video.poster = course.cover || video.poster;
    }

    // Sidebar interactions for detail page
    const syllabusEl = byId('syllabus');
    if (syllabusEl) {
      syllabusEl.addEventListener('click', (e) => {
        const btn = (e.target.closest && e.target.closest('.syllabus__btn')) || null;
        if (!btn) return;
        qsa('.syllabus__item', syllabusEl).forEach((li) => li.classList.remove('is-active'));
        const li = btn.closest('.syllabus__item');
        if (li) li.classList.add('is-active');
      });
    }
  }

  renderCourseDetail();

  // Tab pills (instructor create course)
  const tabPills = qsa('.tab-pill');
  const tabPaneBlocks = qsa('.tab-pane');
  const flowNavSteps = qsa('.flow-nav li[data-target]');

  function setActivePane(target) {
    if (!target) return;
    tabPills.forEach((b) => b.classList.toggle('is-active', b.getAttribute('data-target') === target));
    tabPaneBlocks.forEach((pane) => pane.classList.toggle('is-active', pane.id === target));
    flowNavSteps.forEach((step) => step.classList.toggle('is-active', step.getAttribute('data-target') === target));
  }

  if (tabPills.length && tabPaneBlocks.length) {
    tabPills.forEach((btn) =>
      btn.addEventListener('click', () => setActivePane(btn.getAttribute('data-target')))
    );
  }
  if (flowNavSteps.length) {
    flowNavSteps.forEach((step) =>
      step.addEventListener('click', () => setActivePane(step.getAttribute('data-target')))
    );
  }

  // Save & Continue buttons
  const saveButtons = qsa('.js-save-next');
  if (saveButtons.length && tabPills.length) {
    saveButtons.forEach((btn) =>
      btn.addEventListener('click', () => {
        const current = byId(btn.getAttribute('data-current'));
        const order = ['pane-basic', 'pane-content', 'pane-landing', 'pane-fee', 'pane-promotions', 'pane-messages'];
        const nextId = order[order.indexOf(btn.getAttribute('data-current')) + 1];
        setActivePane(nextId || 'pane-messages');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
    );
  }

  const publishBtn = byId('publishBtn');
  if (publishBtn) {
    publishBtn.addEventListener('click', () => {
      alert('Course published!');
    });
  }

  // Bulk uploader modal
  const bulkBtn = byId('bulkBtn');
  const bulkModal = byId('bulkModal');
  if (bulkBtn && bulkModal) {
    const closeModal = () => bulkModal.classList.remove('is-open');
    bulkBtn.addEventListener('click', () => bulkModal.classList.add('is-open'));
    bulkModal.addEventListener('click', (e) => {
      if (e.target === bulkModal || e.target.closest('[data-close]')) closeModal();
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

  // Mark complete button
  const markBtn = byId('markComplete');
  if (markBtn) {
    markBtn.addEventListener('click', () => {
      markBtn.disabled = true;
      markBtn.textContent = 'Marked as Complete ✔';
      setTimeout(() => {
        markBtn.disabled = false;
        markBtn.textContent = 'Mark Lesson Complete';
      }, 1200);
    });
  }

  // Global search focus helper
  const globalSearch = byId('globalSearch');
  if (globalSearch) {
    // Press '/' to focus search
    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== globalSearch) {
        e.preventDefault();
        globalSearch.focus();
      }
    });
  }

  // Sign-in modal logic
  (function initSigninModal() {
    const modal = byId('signinModal');
    const openBtn = byId('signinBtn');
    if (!modal || !openBtn) return;
    const backdrop = modal.querySelector('.modal__backdrop');
    const closeBtns = Array.from(modal.querySelectorAll('[data-action="close"]'));
    const form = byId('signinForm');
    const email = byId('signinEmail');
    const pass = byId('signinPass');
    const err = byId('signinError');

    function open() { modal.classList.add('is-open'); document.body.style.overflow = 'hidden'; (email||{}).focus?.(); }
    function close() { modal.classList.remove('is-open'); document.body.style.overflow = ''; }

    openBtn.addEventListener('click', (e) => { e.preventDefault(); open(); });
    (backdrop) && backdrop.addEventListener('click', close);
    closeBtns.forEach((b) => b.addEventListener('click', close));
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        err.textContent = '';
        const vEmail = (email?.value || '').trim();
        const vPass = (pass?.value || '').trim();
        if (!vEmail || !vPass) {
          err.textContent = 'Please enter your email and password.';
          return;
        }
        // Simulate auth success; store user and redirect
        try { localStorage.setItem('lernioUser', JSON.stringify({ email: vEmail })); } catch {}
        window.location.href = 'dashboard.html';
      });
    }
  })();

  // User menu dropdown (dashboard)
  (function initUserMenu() {
    let menu = byId('userMenu');
    let btn = byId('avatarBtn');
    // If user is logged in but avatar/menu missing (e.g., on non-dashboard pages), inject them
    let user = null;
    try { const raw = localStorage.getItem('lernioUser'); if (raw) user = JSON.parse(raw); } catch {}
    if (user && (!btn || !menu)) {
      // Replace Sign in with avatar if present
      const auth = document.querySelector('.topbar .auth');
      if (auth && !btn) {
        auth.innerHTML = '<button id="avatarBtn" class="avatar" aria-label="Account"><span>PB</span></button>';
        btn = byId('avatarBtn');
      }
      if (!menu) {
        const overlay = document.createElement('div');
        overlay.id = 'userMenu';
        overlay.className = 'user-menu';
        overlay.setAttribute('aria-hidden','true');
        overlay.innerHTML = `
          <div class="user-menu__backdrop" data-action="close"></div>
          <div class="user-menu__panel" role="menu">
            <div class="user-menu__header">
              <div class="user-menu__avatar">PB</div>
              <div>
                <div id="umName" class="user-menu__name">User</div>
                <div id="umEmail" class="user-menu__email">user@example.com</div>
              </div>
            </div>
            <ul class="user-menu__list">
              <li><a class="user-menu__item" href="my-learning.html">My learning</a></li>
              <li><a class="user-menu__item" href="#">My cart</a></li>
              <li><a class="user-menu__item" href="#">Wishlist</a></li>
              <li><a class="user-menu__item" href="#">Instructor dashboard</a></li>
            </ul>
            <ul class="user-menu__list user-menu__section">
              <li><a class="user-menu__item" href="#">Notifications <span class="um-badge">8</span></a></li>
              <li><a class="user-menu__item" href="#">Messages <span class="um-badge">9+</span></a></li>
            </ul>
            <ul class="user-menu__list user-menu__section">
              <li><a class="user-menu__item" href="settings.html">Account settings</a></li>
              <li><a class="user-menu__item" href="#">Payment methods</a></li>
              <li><a class="user-menu__item" href="#">Subscriptions</a></li>
              <li><a class="user-menu__item" href="#">Credits</a></li>
              <li><a class="user-menu__item" href="#">Purchase history</a></li>
            </ul>
            <ul class="user-menu__list user-menu__section">
              <li><a class="user-menu__item" href="#">Language <span style=\"color:var(--color-muted)\">English</span></a></li>
              <li><a class="user-menu__item" href="profile.html">Public profile</a></li>
              <li><a class="user-menu__item" href="profile.html">Edit profile</a></li>
            </ul>
            <ul class="user-menu__list user-menu__section">
              <li><a class="user-menu__item" href="#">Help and Support</a></li>
              <li><a id="logoutBtn" class="user-menu__item" href="#">Log out</a></li>
            </ul>
          </div>`;
        document.body.appendChild(overlay);
        menu = byId('userMenu');
      }
    }
    if (!menu || !btn) return;
    const backdrop = menu.querySelector('[data-action="close"]');
    const nameEl = byId('umName');
    const emailEl = byId('umEmail');
    const logoutBtn = byId('logoutBtn');

    // Fill from stored user when available
    try {
      if (user) {
        const u = user;
        if (u?.email && emailEl) emailEl.textContent = u.email;
        if (u?.email && nameEl) {
          const base = u.email.split('@')[0].replace(/\W+/g, ' ').trim();
          const pretty = base ? base.split(' ').map(s => s.charAt(0).toUpperCase()+s.slice(1)).join(' ') : 'Learner';
          nameEl.textContent = pretty;
        }
      }
    } catch {}

    function open() { menu.classList.add('is-open'); }
    function close() { menu.classList.remove('is-open'); }

    btn.addEventListener('click', (e) => { e.preventDefault(); menu.classList.toggle('is-open'); });
    if (backdrop) backdrop.addEventListener('click', close);
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    if (logoutBtn) logoutBtn.addEventListener('click', (e) => { e.preventDefault(); try { localStorage.removeItem('lernioUser'); } catch {} window.location.href = 'index.html'; });
  })();

  // Carousel (homepage)
  (function initCarousel() {
    const viewport = byId('carousel');
    if (!viewport) return;
    const slides = qsa('.carousel__slide', viewport);
    const dots = qsa('.carousel__dot');
    const prev = byId('carouselPrev');
    const next = byId('carouselNext');
    let index = 0;
    let timer = null;

    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, idx) => s.classList.toggle('is-active', idx === index));
      dots.forEach((d, idx) => {
        d.classList.toggle('is-active', idx === index);
        d.setAttribute('aria-selected', String(idx === index));
      });
    }

    function nextSlide() { show(index + 1); }
    function prevSlide() { show(index - 1); }

    function start() { timer = setInterval(nextSlide, 5000); }
    function stop() { if (timer) clearInterval(timer); timer = null; }

    // Controls
    if (next) next.addEventListener('click', () => { stop(); nextSlide(); start(); });
    if (prev) prev.addEventListener('click', () => { stop(); prevSlide(); start(); });
    dots.forEach((d) => d.addEventListener('click', () => { stop(); show(parseInt(d.getAttribute('data-index') || '0', 10)); start(); }));

    // Pause on hover
    viewport.addEventListener('mouseenter', stop);
    viewport.addEventListener('mouseleave', start);

    // Keyboard
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { stop(); nextSlide(); start(); }
      if (e.key === 'ArrowLeft') { stop(); prevSlide(); start(); }
    });

    // Touch swipe
    let startX = 0;
    viewport.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; stop(); });
    viewport.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 30) { dx < 0 ? nextSlide() : prevSlide(); }
      start();
    });

    show(0);
    start();
  })();

  // Top-rated programs rendering and filtering
  (function initPrograms() {
    const grid = document.getElementById('programGrid');
    const sidebar = document.querySelector('#programCategories')?.closest('.sidebar');
    const showMoreBtn = document.querySelector('#programCategories .sidebar__item[data-role="show-more"]');
    const catButtons = Array.from(document.querySelectorAll('#programCategories .sidebar__item:not([data-role="show-more"])'));
    if (!grid || !Array.isArray(window.TOP_PROGRAMS)) return;

    function card(p) {
      const link = p.courseId ? `course.html?id=${encodeURIComponent(p.courseId)}` : (p.link || 'courses.html');
      return `
        <article class="program-card">
          <a href="${link}" class="program-card__media">
            <img src="${p.image}" alt="${p.title}" />
          </a>
          <div class="program-card__body">
            <div class="program-card__provider">${p.provider}</div>
            <h3 class="program-card__title">${p.title}</h3>
            <div class="program-card__meta">${p.duration} · ${p.mode} · ${p.schedule}</div>
            <div class="program-card__actions">
              <a class="btn btn--primary" href="${link}">Enroll</a>
            </div>
          </div>
        </article>
      `;
    }

    function render(category) {
      const list = category && category !== 'Popular Courses'
        ? window.TOP_PROGRAMS.filter((p) => p.category === category)
        : window.TOP_PROGRAMS.slice(0, 6);
      grid.innerHTML = list.map(card).join('');
    }

    render('Popular Courses');

    catButtons.forEach((btn) => btn.addEventListener('click', () => {
      catButtons.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      render(btn.getAttribute('data-cat') || 'Popular Courses');
    }));

    if (showMoreBtn && sidebar) {
      showMoreBtn.addEventListener('click', () => {
        sidebar.classList.toggle('is-expanded');
        const expanded = sidebar.classList.contains('is-expanded');
        showMoreBtn.setAttribute('aria-expanded', String(expanded));
        const icon = showMoreBtn.querySelector('.icon');
        const label = showMoreBtn.querySelector('.label');
        if (icon) icon.textContent = expanded ? '−' : '＋';
        if (label) label.textContent = expanded ? 'Show less' : 'Show more';
      });
    }
  })();

  // Popular Courses section (catalog preview)
  (function initPopularCourses() {
    const grid = document.getElementById('popularGrid');
    if (!grid || !Array.isArray(window.COURSES)) return;
    const popular = window.COURSES.slice(0, 12);
    grid.innerHTML = popular.map((c) => courseCard(c, { cta: 'Enroll' })).join('');
  })();

  // Testimonial carousel
  (function initTestimonial() {
    const root = document.getElementById('tcarousel');
    if (!root) return;
    const slides = Array.from(root.querySelectorAll('.tslide'));
    const dots = Array.from(root.querySelectorAll('.tdot'));
    const prev = document.getElementById('tprev');
    const next = document.getElementById('tnext');
    let idx = 0;
    let timer = null;

    function show(i) {
      idx = (i + slides.length) % slides.length;
      slides.forEach((s, j) => s.classList.toggle('is-active', j === idx));
      dots.forEach((d, j) => d.classList.toggle('is-active', j === idx));
    }
    function start() { timer = setInterval(() => show(idx + 1), 6000); }
    function stop() { if (timer) clearInterval(timer); timer = null; }

    if (prev) prev.addEventListener('click', () => { stop(); show(idx - 1); start(); });
    if (next) next.addEventListener('click', () => { stop(); show(idx + 1); start(); });
    dots.forEach((d) => d.addEventListener('click', () => { stop(); show(parseInt(d.getAttribute('data-index') || '0', 10)); start(); }));
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);

    show(0);
    start();
  })();

  // My Learning page
  (function initMyLearning() {
    const grid = document.getElementById('learningGrid');
    if (!grid || !Array.isArray(window.COURSES)) return;
    const tabs = Array.from(document.querySelectorAll('#learningTabs .chip'));
    const counts = {
      all: document.getElementById('count-all'),
      inprogress: document.getElementById('count-inprogress'),
      enrolled: document.getElementById('count-enrolled'),
      completed: document.getElementById('count-completed')
    };

    const all = window.COURSES;
    const inprogress = all.filter((c) => (c.progress || 0) > 0 && (c.progress || 0) < 100);
    const enrolled = all.filter((c) => c.enrolled);
    const completed = all.filter((c) => (c.progress || 0) >= 100);

    function updateCounts() {
      if (counts.all) counts.all.textContent = String(all.length);
      if (counts.inprogress) counts.inprogress.textContent = String(inprogress.length);
      if (counts.enrolled) counts.enrolled.textContent = String(enrolled.length);
      if (counts.completed) counts.completed.textContent = String(completed.length);
    }

    function getList(filter) {
      switch (filter) {
        case 'inprogress': return inprogress;
        case 'enrolled': return enrolled;
        case 'completed': return completed;
        case 'all':
        default: return all;
      }
    }

    function render(filter) {
      const list = getList(filter);
      grid.innerHTML = list.map((c) => {
        const showProgress = (c.progress || 0) > 0 && (c.progress || 0) < 100;
        const cta = showProgress ? 'Continue' : (c.enrolled ? 'Open' : 'Enroll');
        return courseCard(c, { showProgress, cta });
      }).join('');
    }

    updateCounts();
    render('inprogress');
    tabs.forEach((btn) => btn.addEventListener('click', () => {
      tabs.forEach((b) => b.classList.remove('chip--active'));
      btn.classList.add('chip--active');
      render(btn.getAttribute('data-filter') || 'inprogress');
    }));
  })();
  
  initInstructor();

  function initInstructor() {
    const createdCoursesWrap = byId('createdCourses');
    const publishBtn = byId('publishBtn');
    const wizardFields = qsa('[data-field]');
    if (!createdCoursesWrap && !publishBtn && !wizardFields.length) return;

    const statusTargets = [byId('courseStatus'), byId('publishStatus')].filter(Boolean);
    const coverPreview = byId('coverPreview');
    const fileChips = {
      cover: document.querySelector('[data-file-label="cover"]'),
      promo: document.querySelector('[data-file-label="promo"]')
    };
    const DRAFT_KEY = 'lernioInstructorDraft';
    const defaultDraft = {
      language: 'english',
      level: 'beginner',
      category: 'Design',
      pricingOption: 'none',
      coverName: '',
      coverPreview: '',
      promoName: ''
    };
    let courseDraft = Object.assign({}, defaultDraft, loadDraft());

    renderCreatedCourses();
    hydrateFields();
    bindFieldEvents();
    initFileUi();
    initCharCounters();

    if (publishBtn) publishBtn.addEventListener('click', handlePublish);

    function loadDraft() {
      try {
        const raw = localStorage.getItem(DRAFT_KEY);
        return raw ? JSON.parse(raw) : {};
      } catch (err) {
        return {};
      }
    }

    function saveDraft() {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(courseDraft));
      } catch (err) {
        /* ignore */
      }
    }

    function updateDraft(key, value) {
      if (!key) return;
      courseDraft[key] = value;
      saveDraft();
    }

    function hydrateFields() {
      wizardFields.forEach((field) => {
        const key = field.getAttribute('data-field');
        if (!key) return;
        const stored = courseDraft[key];
        if (field.type === 'radio') {
          const targetValue = stored ?? defaultDraft[key];
          field.checked = field.value === targetValue || (!stored && field.checked);
          if (field.checked) courseDraft[key] = field.value;
        } else if (field.type === 'file') {
          return;
        } else if (stored !== undefined) {
          field.value = stored;
        } else if (defaultDraft[key] && field.tagName === 'SELECT') {
          field.value = defaultDraft[key];
          courseDraft[key] = defaultDraft[key];
        }
      });
    }

    function bindFieldEvents() {
      wizardFields.forEach((field) => {
        const eventName =
          field.type === 'file' || field.type === 'radio' || field.tagName === 'SELECT'
            ? 'change'
            : 'input';
        field.addEventListener(eventName, () => handleFieldInput(field));
      });
    }

    function handleFieldInput(field) {
      const key = field.getAttribute('data-field');
      if (!key) return;
      if (field.type === 'radio') {
        if (field.checked) updateDraft(key, field.value);
        return;
      }
      if (field.type === 'file') {
        handleFileInput(field);
        return;
      }
      updateDraft(key, field.value);
    }

    function initFileUi() {
      updateFileChip('cover', courseDraft.coverName || 'Upload PNG or JPG');
      updateCoverPreview(courseDraft.coverPreview, courseDraft.coverName);
      updateFileChip('promo', courseDraft.promoName || 'No file selected');
    }

    function handleFileInput(field) {
      const labelKey = field.getAttribute('data-file-label');
      const file = field.files && field.files[0];
      if (labelKey) updateFileChip(labelKey, file ? file.name : labelKey === 'cover' ? 'Upload PNG or JPG' : 'No file selected');
      if (!file) {
        if (labelKey === 'cover') {
          courseDraft.coverPreview = '';
          saveDraft();
          updateCoverPreview('', '');
        }
        updateDraft(field.getAttribute('data-field'), '');
        return;
      }
      updateDraft(field.getAttribute('data-field'), file.name);
      if (labelKey === 'cover') {
        const reader = new FileReader();
        reader.onload = () => {
          courseDraft.coverPreview = reader.result;
          saveDraft();
          updateCoverPreview(reader.result, file.name);
        };
        reader.readAsDataURL(file);
      }
    }

    function updateFileChip(type, label) {
      const chip = fileChips[type];
      if (!chip) return;
      chip.textContent = label || (type === 'cover' ? 'Upload PNG or JPG' : 'No file selected');
    }

    function updateCoverPreview(src, label) {
      if (!coverPreview) return;
      coverPreview.innerHTML = '';
      if (src) {
        const img = document.createElement('img');
        img.src = src;
        img.alt = label || 'Course cover preview';
        coverPreview.appendChild(img);
      } else {
        coverPreview.textContent = 'No image uploaded';
      }
    }

    function initCharCounters() {
      qsa('[data-count-for]').forEach((counter) => {
        const targetId = counter.getAttribute('data-count-for');
        const target = targetId ? byId(targetId) : null;
        if (!target) return;
        const max = Number(counter.getAttribute('data-max')) || target.maxLength || 0;
        const update = () => {
          const len = target.value ? target.value.length : 0;
          counter.textContent = max ? `${len}/${max}` : `${len}`;
        };
        target.addEventListener('input', update);
        update();
      });
    }

    function refreshCharCounters() {
      qsa('[data-count-for]').forEach((counter) => {
        const targetId = counter.getAttribute('data-count-for');
        const target = targetId ? byId(targetId) : null;
        if (!target) return;
        const max = Number(counter.getAttribute('data-max')) || target.maxLength || 0;
        const len = target.value ? target.value.length : 0;
        counter.textContent = max ? `${len}/${max}` : `${len}`;
      });
    }

    function handlePublish() {
      const result = buildCoursePayload();
      if (result.error) {
        if (result.pane) setActivePane(result.pane);
        showStatus(result.error, 'error');
        return;
      }
      const { course } = result;
      customCourses.unshift(course);
      persistCustomCourses();
      if (!window.COURSES.some((c) => c.id === course.id)) window.COURSES.unshift(course);
      if (typeof renderCourseGrid === 'function') renderCourseGrid();
      renderCreatedCourses();
      showStatus('Course published successfully!', 'success');
      clearDraft();
      resetWizard();
      setActivePane('pane-basic');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function buildCoursePayload() {
      const title = (courseDraft.landingTitle || '').trim();
      if (!title) return { error: 'Add a course title before publishing.', pane: 'pane-landing' };
      const description = (courseDraft.landingDescription || courseDraft.prerequisites || courseDraft.audience || '').trim();
      if (!description) return { error: 'Provide a short description so learners know what to expect.', pane: 'pane-landing' };
      const learnings = ['learn1', 'learn2', 'learn3', 'learn4']
        .map((key) => (courseDraft[key] || '').trim())
        .filter(Boolean);
      if (!learnings.length) return { error: 'Share at least one learning outcome in Intended learners.', pane: 'pane-basic' };
      const category = (courseDraft.categoryCustom || courseDraft.category || 'General').trim();
      const tags = (courseDraft.courseTags || '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
      const slugBase = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const id = `${slugBase || 'course'}-${Date.now()}`;
      const languageValue = (courseDraft.language || 'english').toString();
      const language = languageValue.charAt(0).toUpperCase() + languageValue.slice(1);
      const course = {
        id,
        title,
        subtitle: courseDraft.landingSubtitle || '',
        level: (courseDraft.level || 'beginner').toLowerCase(),
        lessonsCount: Math.max(8, learnings.length * 4),
        description,
        category,
        tags,
        cover: courseDraft.coverPreview || './assets/img/placeholder.svg',
        language,
        primaryTopic: courseDraft.primaryTopic || '',
        learnings,
        promoVideo: courseDraft.promoName || '',
        price: courseDraft.pricingOption === 'free' ? 0 : Number(courseDraft.price || 0),
        discountType: courseDraft.pricingOption || 'none',
        discountPercent: Number(courseDraft.discountPercent || 0),
        promo: {
          title: courseDraft.promotionTitle || '',
          discount: Number(courseDraft.promotionDiscount || 0)
        },
        messages: {
          welcome: courseDraft.welcomeMessage || '',
          congrats: courseDraft.congratsMessage || ''
        },
        progress: 0,
        enrolled: false
      };
      return { course };
    }

    function showStatus(message, variant) {
      statusTargets.forEach((node) => {
        if (!node) return;
        node.textContent = message;
        node.classList.remove('status--error', 'status--success');
        node.classList.add(variant === 'error' ? 'status--error' : 'status--success');
      });
      if (variant !== 'error') {
        setTimeout(() => {
          statusTargets.forEach((node) => {
            if (node && node.textContent === message) node.textContent = '';
          });
        }, 3500);
      }
    }

    function clearDraft() {
      courseDraft = Object.assign({}, defaultDraft);
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch (err) {
        /* ignore */
      }
    }

    function resetWizard() {
      wizardFields.forEach((field) => {
        const key = field.getAttribute('data-field');
        if (!key) return;
        if (field.type === 'radio') {
          field.checked = field.value === (courseDraft[key] ?? defaultDraft[key]);
        } else if (field.type === 'file') {
          field.value = '';
        } else if (field.tagName === 'SELECT') {
          field.value = courseDraft[key] ?? defaultDraft[key] ?? field.value;
        } else {
          field.value = courseDraft[key] || '';
        }
        if (field.type !== 'radio' && field.type !== 'file') {
          field.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
      initFileUi();
      refreshCharCounters();
    }

    function renderCreatedCourses() {
      if (!createdCoursesWrap) return;
      if (!customCourses.length) {
        createdCoursesWrap.innerHTML = '<p class="empty-state">You have not created any courses yet.</p>';
        return;
      }
      createdCoursesWrap.innerHTML = customCourses
        .map((course) => courseCard(course, { cta: 'Preview' }))
        .join('');
    }
  }
})();
