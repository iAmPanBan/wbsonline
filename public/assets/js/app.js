// Simple interactions for the LMS UI
(function () {
  const byId = (id) => document.getElementById(id);
  const qs = (sel, el = document) => el.querySelector(sel);
  const qsa = (sel, el = document) => Array.from(el.querySelectorAll(sel));

  // Footer year
  const yearEl = byId('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Courses page filtering
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

  // Syllabus interactions
  const syllabus = byId('syllabus');
  if (syllabus) {
    syllabus.addEventListener('click', (e) => {
      const btn = (e.target.closest && e.target.closest('.syllabus__btn')) || null;
      if (!btn) return;
      qsa('.syllabus__item', syllabus).forEach((li) => li.classList.remove('is-active'));
      const li = btn.closest('.syllabus__item');
      if (li) li.classList.add('is-active');
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
})();

