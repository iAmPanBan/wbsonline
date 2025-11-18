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
const formatMeta = (level, lessonsCount) => {
    const label = level || 'beginner';
    const formattedLevel = label.charAt(0).toUpperCase() + label.slice(1);
    const totalLessons = typeof lessonsCount === 'number' ? lessonsCount : Number(lessonsCount) || 0;
    return `${formattedLevel} - ${totalLessons} lessons`;
  };


  const courseLink = (id) => `course.html?id=${encodeURIComponent(id)}`;

  const STORAGE_KEYS = {
    cart: 'lernioCartItems',
    wishlist: 'lernioWishlistItems'
  };
  let cartItems = loadCollection('cart');
  let wishlistItems = loadCollection('wishlist');
  const priceFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

  function loadCollection(type) {
    const key = STORAGE_KEYS[type];
    if (!key) return [];
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveCollection(type, list) {
    const key = STORAGE_KEYS[type];
    if (!key) return;
    try {
      localStorage.setItem(key, JSON.stringify(list));
    } catch {
      /* ignore */
    }
  }

  function setCollection(type, list) {
    if (type === 'cart') {
      cartItems = list;
    } else if (type === 'wishlist') {
      wishlistItems = list;
    }
    saveCollection(type, list);
  }

  function getCollection(type) {
    return type === 'cart' ? cartItems : wishlistItems;
  }

  function getCourseById(id) {
    if (!Array.isArray(window.COURSES)) return null;
    return window.COURSES.find((c) => c.id === id) || null;
  }

  function resolveCoursePrice(course) {
    const explicit = Number(course?.price);
    if (!Number.isNaN(explicit) && explicit > 0) return explicit;
    const level = (course?.level || '').toLowerCase();
    if (level === 'advanced') return 149;
    if (level === 'intermediate') return 119;
    return 89;
  }

  function formatPrice(value) {
    return priceFormatter.format(Math.max(0, Number(value) || 0));
  }

  function courseCard(course, opts = {}) {
    const { showProgress = false, cta = 'Enrol' } = opts;
    const progressHtml = showProgress && course.progress
      ? `<div class="progress"><div class="progress__bar" style="width: ${course.progress}%"></div></div>
         <span class="badge">${course.progress}% complete</span>`
      : '';
    const primaryAction = progressHtml
      ? `<div class="card__actions">
            <a class="btn btn--primary" href="${courseLink(course.id)}">Continue</a>
            <a class="btn btn--ghost" href="${courseLink(course.id)}">View details</a>
          </div>${progressHtml}`
      : `<div class="card__actions">
            <a class="btn btn--primary" href="${courseLink(course.id)}">${cta}</a>
            <a class="btn btn--ghost" href="${courseLink(course.id)}">View details</a>
          </div>`;
    const commerceActions = `
      <div class="card__commerce">
        <button class="btn btn--secondary js-add-cart" data-course="${course.id}">Add to cart</button>
        <button class="btn btn--ghost btn--wishlist js-add-wishlist" data-course="${course.id}" aria-label="Add ${course.title} to wishlist">
          <span class="heart-icon" aria-hidden="true">&hearts;</span>
          <span class="btn-label">Add to wishlist</span>
        </button>
      </div>
    `;
    return `
      <article class="card card--course" data-level="${course.level}" data-title="${course.title}">
        <a href="${courseLink(course.id)}" class="card__media">
          <img src="${course.cover}" alt="${course.title}" />
        </a>
        <div class="card__body">
          <h3 class="card__title"><a href="${courseLink(course.id)}">${course.title}</a></h3>
          <p class="card__meta">${formatMeta(course.level, course.lessonsCount)}</p>
          ${course.description ? `<p class="card__desc">${course.description}</p>` : ''}
          ${primaryAction}
          ${commerceActions}
        </div>
      </article>
    `;
  }

  document.addEventListener('click', (event) => {
    const cartBtn = event.target.closest('.js-add-cart');
    if (cartBtn) {
      event.preventDefault();
      addCourseToCollection('cart', cartBtn.getAttribute('data-course'));
      return;
    }
    const wishlistBtn = event.target.closest('.js-add-wishlist');
    if (wishlistBtn) {
      event.preventDefault();
      addCourseToCollection('wishlist', wishlistBtn.getAttribute('data-course'));
      return;
    }
    const removeCartBtn = event.target.closest('[data-remove-cart]');
    if (removeCartBtn) {
      event.preventDefault();
      removeFromCollection('cart', removeCartBtn.getAttribute('data-remove-cart'));
      return;
    }
    const removeWishlistBtn = event.target.closest('[data-remove-wishlist]');
    if (removeWishlistBtn) {
      event.preventDefault();
      removeFromCollection('wishlist', removeWishlistBtn.getAttribute('data-remove-wishlist'));
    }
  });

  function addCourseToCollection(type, courseId) {
    if (!courseId) return;
    let list = getCollection(type);
    if (!list.includes(courseId)) {
      list = [...list, courseId];
      setCollection(type, list);
    }
    if (type === 'cart') {
      renderCartPage();
    } else if (type === 'wishlist') {
      renderWishlistPage();
    }
    syncCommerceButtons();
  }

  function removeFromCollection(type, courseId) {
    if (!courseId) return;
    const list = getCollection(type).filter((id) => id !== courseId);
    setCollection(type, list);
    if (type === 'cart') {
      renderCartPage();
    } else if (type === 'wishlist') {
      renderWishlistPage();
    }
    syncCommerceButtons();
  }

  function syncCommerceButtons() {
    qsa('.js-add-cart').forEach((btn) => {
      const id = btn.getAttribute('data-course');
      const inCart = getCollection('cart').includes(id);
      btn.textContent = inCart ? 'In cart' : 'Add to cart';
      btn.disabled = inCart;
    });
    qsa('.js-add-wishlist').forEach((btn) => {
      const id = btn.getAttribute('data-course');
      const wishLabel = btn.querySelector('.btn-label');
      const inWishlist = getCollection('wishlist').includes(id);
      if (wishLabel) wishLabel.textContent = inWishlist ? 'Wishlisted' : 'Add to wishlist';
      btn.disabled = inWishlist;
    });
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
    syncCommerceButtons();
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
    syncCommerceButtons();
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
    syncCommerceButtons();
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
        markBtn.textContent = 'Enroll';
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
    const menuTemplate = `
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
          <li><a class="user-menu__item" href="cart.html">My cart</a></li>
          <li><a class="user-menu__item" href="wishlist.html">Wishlist</a></li>
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
          <li><a class="user-menu__item" href="#">Language <span style="color:var(--color-muted)">English</span></a></li>
          <li><a class="user-menu__item" href="profile.html">Public profile</a></li>
          <li><a class="user-menu__item" href="profile.html">Edit profile</a></li>
        </ul>
        <ul class="user-menu__list user-menu__section">
          <li><a class="user-menu__item" href="#">Help and Support</a></li>
          <li><a id="logoutBtn" class="user-menu__item" href="#">Log out</a></li>
        </ul>
      </div>`;
    if (!menu) {
      menu = document.createElement('div');
      menu.id = 'userMenu';
      menu.className = 'user-menu';
      menu.setAttribute('aria-hidden', 'true');
      document.body.appendChild(menu);
    }
    if (!menu.innerHTML.trim()) {
      menu.innerHTML = menuTemplate;
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
    const catButtons = Array.from(document.querySelectorAll('#programCategories .sidebar__item'));
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
            <p class="program-card__meta">${p.description}</p>
            <div class="program-card__actions">
              <a class="btn btn--primary" href="${link}">View details</a>
            </div>
          </div>
        </article>
      `;
    }

    function render(category) {
      const normalized = (category || '').trim().toLowerCase();
      const list = normalized
        ? window.TOP_PROGRAMS.filter((p) => (p.category || '').toLowerCase() === normalized)
        : window.TOP_PROGRAMS.slice(0, 6);
      grid.innerHTML = list.length
        ? list.map(card).join('')
        : '<p class="empty-state">No programs available for this category yet.</p>';
    }

    const defaultCategory = catButtons[0]?.getAttribute('data-cat') || '';
    if (catButtons[0]) catButtons[0].classList.add('is-active');
    render(defaultCategory);

    catButtons.forEach((btn) => btn.addEventListener('click', () => {
      catButtons.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      render(btn.getAttribute('data-cat') || '');
    }));
  })();

  // Popular Courses section (catalog preview)
  (function initPopularCourses() {
    const grid = document.getElementById('popularGrid');
    if (!grid || !Array.isArray(window.COURSES)) return;
    const popular = window.COURSES.slice(0, 12);
    grid.innerHTML = popular.map((c) => courseCard(c, { cta: 'Enroll' })).join('');
    syncCommerceButtons();
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
      syncCommerceButtons();
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
  initProfileTabs();
  initCartPage();
  initWishlistPage();

  function initInstructor() {
    const createdCoursesWrap = byId('createdCourses');
    const publishBtn = byId('publishBtn');
    const wizardFields = qsa('[data-field]');
    if (!createdCoursesWrap && !publishBtn && !wizardFields.length) return;

    let fieldsBound = false;
    const dynamicFieldConfigs = {
      learn: {
        prefix: 'learn',
        min: 4,
        itemSelector: '.response-field',
        fieldSelector: '.response-input',
        counterSelector: '.counter'
      },
      prerequisites: {
        prefix: 'prerequisites',
        min: 1,
        itemSelector: 'textarea.response-area[data-field^="prerequisites"]'
      },
      audience: {
        prefix: 'audience',
        min: 1,
        itemSelector: 'textarea.response-area[data-field^="audience"]'
      }
    };

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
    migrateLegacyDraftFields();
    setupDynamicResponseFields();
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

    function migrateLegacyDraftFields() {
      if (courseDraft.prerequisites && !courseDraft.prerequisites1) {
        courseDraft.prerequisites1 = courseDraft.prerequisites;
        delete courseDraft.prerequisites;
      }
      if (courseDraft.audience && !courseDraft.audience1) {
        courseDraft.audience1 = courseDraft.audience;
        delete courseDraft.audience;
      }
    }

    function setupDynamicResponseFields() {
      ['learn', 'prerequisites', 'audience'].forEach((group) => ensureFieldsForGroup(group));
      qsa('[data-add-field]').forEach((button) => {
        button.addEventListener('click', () => handleAddMoreClick(button));
      });
    }

    function ensureFieldsForGroup(group) {
      const config = dynamicFieldConfigs[group];
      if (!config) return;
      const { block, button } = getDynamicBlock(group);
      if (!block || !button) return;
      const nodes = getGroupNodes(block, config);
      const desiredCount = Math.max(config.min, getStoredCount(config.prefix));
      for (let index = nodes.length + 1; index <= desiredCount; index += 1) {
        const entry = createDynamicFieldNode(config, block, index);
        if (!entry) break;
        block.insertBefore(entry.node, button);
        registerField(entry.field);
      }
    }

    function getDynamicBlock(group) {
      const button = document.querySelector(`[data-add-field="${group}"]`);
      return { button, block: button ? button.closest('.question-block') : null };
    }

    function createDynamicFieldNode(config, block, index) {
      if (!block) return null;
      const template = block.querySelector(config.itemSelector);
      if (!template) return null;
      const node = template.cloneNode(true);
      const field = getFieldFromNode(node, config);
      if (!field) return null;
      const fieldName = `${config.prefix}${index}`;
      field.value = '';
      field.name = fieldName;
      field.setAttribute('data-field', fieldName);
      if (config.counterSelector) {
        const counter = node.querySelector(config.counterSelector);
        if (counter) {
          counter.textContent = field.maxLength || counter.textContent || '';
        }
      }
      return { node, field };
    }

    function getGroupNodes(block, config) {
      if (!block) return [];
      return qsa(config.itemSelector, block).filter((node) => {
        const field = getFieldFromNode(node, config);
        const key = field?.getAttribute('data-field') || '';
        return key.startsWith(config.prefix);
      });
    }

    function getFieldFromNode(node, config) {
      if (!node) return null;
      return config.fieldSelector ? node.querySelector(config.fieldSelector) : node;
    }

    function registerField(field) {
      if (!field || wizardFields.includes(field)) return;
      wizardFields.push(field);
      if (fieldsBound) bindField(field);
    }

    function deregisterField(field) {
      if (!field) return;
      const index = wizardFields.indexOf(field);
      if (index !== -1) wizardFields.splice(index, 1);
    }

    function getStoredCount(prefix) {
      const regex = new RegExp(`^${prefix}(\\d+)$`);
      return Object.keys(courseDraft).filter((key) => regex.test(key)).length;
    }

    function handleAddMoreClick(button) {
      const group = button.getAttribute('data-add-field');
      const config = dynamicFieldConfigs[group];
      if (!config) return;
      const block = button.closest('.question-block');
      if (!block) return;
      const nodes = getGroupNodes(block, config);
      const entry = createDynamicFieldNode(config, block, nodes.length + 1);
      if (!entry) return;
      block.insertBefore(entry.node, button);
      registerField(entry.field);
      const key = entry.field.getAttribute('data-field');
      if (key) updateDraft(key, '');
    }

    function hydrateField(field) {
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
    }

    function hydrateFields() {
      wizardFields.forEach((field) => {
        hydrateField(field);
      });
    }

    function getFieldEventName(field) {
      return field.type === 'file' || field.type === 'radio' || field.tagName === 'SELECT'
        ? 'change'
        : 'input';
    }

    function bindField(field) {
      if (!field) return;
      const eventName = getFieldEventName(field);
      field.addEventListener(eventName, () => handleFieldInput(field));
    }

    function bindFieldEvents() {
      wizardFields.forEach((field) => {
        bindField(field);
      });
      fieldsBound = true;
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
      const prerequisitesList = collectSequentialFields('prerequisites');
      const audienceList = collectSequentialFields('audience');
      const description = (courseDraft.landingDescription || prerequisitesList[0] || audienceList[0] || '').trim();
      if (!description) return { error: 'Provide a short description so learners know what to expect.', pane: 'pane-landing' };
      const learnings = collectSequentialFields('learn');
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
        prerequisites: prerequisitesList,
        audience: audienceList,
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
      resetDynamicGroups();
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

    function resetDynamicGroups() {
      Object.keys(dynamicFieldConfigs).forEach((group) => {
        const config = dynamicFieldConfigs[group];
        if (!config) return;
        const { block } = getDynamicBlock(group);
        if (!block) return;
        const nodes = getGroupNodes(block, config);
        while (nodes.length > config.min) {
          const node = nodes.pop();
          if (!node) continue;
          const field = getFieldFromNode(node, config);
          if (!field) continue;
          const key = field.getAttribute('data-field');
          if (key) delete courseDraft[key];
          deregisterField(field);
          node.remove();
        }
      });
    }

    function collectSequentialFields(prefix) {
      const regex = new RegExp(`^${prefix}(\\d+)$`);
      return Object.keys(courseDraft)
        .map((key) => {
          const match = key.match(regex);
          if (!match) return null;
          return { value: courseDraft[key], index: Number(match[1]) };
        })
        .filter(Boolean)
        .sort((a, b) => a.index - b.index)
        .map((entry) => (entry.value || '').trim())
        .filter(Boolean);
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
      syncCommerceButtons();
    }
  }

  function initProfileTabs() {
    const tabContainer = document.querySelector('.tabs-line');
    if (!tabContainer) return;
    const tabs = qsa('[data-tab]', tabContainer);
    const panels = qsa('[data-panel]');
    if (!tabs.length || !panels.length) return;
    const validTargets = new Set(panels.map((panel) => panel.getAttribute('data-panel')));
    const defaultTarget = tabs[0]?.getAttribute('data-tab') || panels[0]?.getAttribute('data-panel');

    const normalizeTarget = (value) => {
      if (!value) return null;
      const stripped = value.replace(/^#/, '');
      const candidate = stripped.replace(/^panel-/, '');
      return validTargets.has(candidate) ? candidate : null;
    };

    const showTab = (target) => {
      const resolvedTarget = validTargets.has(target) ? target : defaultTarget;
      if (!resolvedTarget) return;
      tabs.forEach((tab) => {
        const isActive = tab.getAttribute('data-tab') === resolvedTarget;
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
      panels.forEach((panel) => {
        panel.classList.toggle('is-active', panel.getAttribute('data-panel') === resolvedTarget);
      });
    };

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        showTab(tab.getAttribute('data-tab'));
      });
    });

    window.addEventListener('hashchange', () => {
      const target = normalizeTarget(window.location.hash);
      if (target) showTab(target);
    });

    const initialTarget = normalizeTarget(window.location.hash) || defaultTarget;
    showTab(initialTarget);
  }

  function initCartPage() {
    if (!byId('cartList')) return;
    renderCartPage();
  }

  function initWishlistPage() {
    if (!byId('wishlistList')) return;
    renderWishlistPage();
  }

  function renderCartPage() {
    const listNode = byId('cartList');
    const countNode = byId('cartCount');
    const totalNode = byId('cartTotal');
    if (!listNode) return;
    const items = getCollection('cart');
    if (!items.length) {
      listNode.innerHTML = '<p class="empty-state">Your cart is empty. Browse courses and add them to continue.</p>';
      if (countNode) countNode.textContent = '0';
      if (totalNode) totalNode.textContent = formatPrice(0);
      return;
    }
    let total = 0;
    const markup = items
      .map((id) => {
        const course = getCourseById(id);
        if (!course) return '';
        const price = resolveCoursePrice(course);
        total += price;
        return buildCommerceCard(course, 'cart', price);
      })
      .filter(Boolean)
      .join('');
    listNode.innerHTML = markup || '<p class="empty-state">Your cart is empty.</p>';
    if (countNode) countNode.textContent = String(items.length);
    if (totalNode) totalNode.textContent = formatPrice(total);
  }

  function renderWishlistPage() {
    const listNode = byId('wishlistList');
    if (!listNode) return;
    const items = getCollection('wishlist');
    if (!items.length) {
      listNode.innerHTML = '<p class="empty-state">Your wishlist is empty. Tap the heart icon on any course to save it.</p>';
      return;
    }
    const markup = items
      .map((id) => {
        const course = getCourseById(id);
        if (!course) return '';
        return buildCommerceCard(course, 'wishlist', resolveCoursePrice(course));
      })
      .filter(Boolean)
      .join('');
    listNode.innerHTML = markup || '<p class="empty-state">Your wishlist is empty.</p>';
    syncCommerceButtons();
  }

  function buildCommerceCard(course, type, priceValue) {
    if (!course) return '';
    const price = formatPrice(priceValue ?? resolveCoursePrice(course));
    const levelLabel = (course.level || 'beginner').charAt(0).toUpperCase() + (course.level || 'beginner').slice(1);
    const meta = `${levelLabel} &middot; ${course.lessonsCount || 0} lessons`;
    const cover = course.cover || './assets/img/placeholder.svg';
    const removeAttr = type === 'cart' ? `data-remove-cart="${course.id}"` : `data-remove-wishlist="${course.id}"`;
    const actions =
      type === 'cart'
        ? `<div class="commerce-actions"><button class="btn btn--ghost" ${removeAttr}>Remove</button></div>`
        : `<div class="commerce-actions"><button class="btn btn--secondary js-add-cart" data-course="${course.id}">Add to cart</button><button class="btn btn--ghost" ${removeAttr}>Remove</button></div>`;
    return `
      <article class="commerce-card">
        <img class="commerce-card__media" src="${cover}" alt="${course.title}" />
        <div class="commerce-card__body">
          <h3>${course.title}</h3>
          <p>${meta}</p>
        </div>
        <div class="commerce-card__meta">
          <strong>${price}</strong>
          ${actions}
        </div>
      </article>
    `;
  }

  syncCommerceButtons();
})();
