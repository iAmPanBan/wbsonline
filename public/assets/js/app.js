// Simple interactions for the LMS UI
(function () {
  const byId = (id) => document.getElementById(id);
  const qs = (sel, el = document) => el.querySelector(sel);
  const qsa = (sel, el = document) => Array.from(el.querySelectorAll(sel));

  // Footer year
  const yearEl = byId('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Render helpers
  const formatMeta = (level, lessonsCount) =>
    `${(level||'').charAt(0).toUpperCase() + (level||'').slice(1)} • ${lessonsCount} lessons`;

  const courseLink = (id) => `course.html?id=${encodeURIComponent(id)}`;

  function courseCard(course, opts = {}) {
    const { showProgress = false, cta = 'Enroll' } = opts;
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
      .map((c) => courseCard(c, { cta: c.enrolled ? 'Open' : 'Enroll' }))
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
})();
