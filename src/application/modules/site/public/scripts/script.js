// ===== NAVBAR SCROLL EFFECT =====
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

// ===== MOBILE TOGGLE =====
const mobileToggle = document.getElementById('mobileToggle');
const navLinks = document.getElementById('navLinks');
if (mobileToggle && navLinks) {
  mobileToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });
  // Close on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
    });
  });
}

// ===== COUNTER ANIMATION =====
function animateCounters() {
  const counters = document.querySelectorAll('[data-count]');
  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute('data-count'));
    const duration = 2000;
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);

      if (target >= 1000) {
        counter.textContent = current.toLocaleString() + '+';
      } else {
        counter.textContent = current + '+';
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    requestAnimationFrame(update);
  });
}

// ===== FADE IN ON SCROLL =====
function initFadeIn() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
  });
}

// ===== FAQ ACCORDION =====
function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
      const item = question.parentElement;
      const isActive = item.classList.contains('active');

      // Close all
      document.querySelectorAll('.faq-item').forEach(faq => {
        faq.classList.remove('active');
      });

      // Toggle current
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

// ===== FILTER FORM: PRE-POPULATE FROM URL =====
function initFilters() {
  const filterForm = document.querySelector('form.filter-bar');
  if (!filterForm) return;

  const urlParams = new URLSearchParams(window.location.search);

  // Pre-populate search input
  const searchInput = filterForm.querySelector('input[name="search"]');
  if (searchInput && urlParams.has('search')) {
    searchInput.value = urlParams.get('search');
  }

  // Pre-populate select dropdowns
  filterForm.querySelectorAll('select[name]').forEach(select => {
    const paramValue = urlParams.get(select.name);
    if (paramValue) {
      select.value = paramValue;
    }
  });
}

// ===== CONTACT FORM =====
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Show success message
    const successMsg = document.createElement('div');
    successMsg.style.cssText = 'background: #2ECC71; color: #fff; padding: 16px 24px; border-radius: 8px; margin-top: 16px; font-weight: 600; text-align: center;';
    successMsg.textContent = '✓ Thank you! Your message has been sent successfully. We will get back to you within 24 hours.';
    form.appendChild(successMsg);
    form.reset();

    setTimeout(() => {
      successMsg.remove();
    }, 5000);
  });
}

// ===== PAGINATION =====
function initPagination() {
  const paginationContainers = document.querySelectorAll('[data-pagination]');
  if (!paginationContainers.length) return;

  paginationContainers.forEach(paginationEl => {
    const gridId = paginationEl.getAttribute('data-pagination');
    const perPageAttr = paginationEl.getAttribute('data-per-page');
    const perPage = perPageAttr ? parseInt(perPageAttr) : 0;
    const grid = document.getElementById(gridId);
    if (!grid) return;

    // Read current page from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const pageFromUrl = parseInt(urlParams.get('page'));
    let currentPage = (pageFromUrl && pageFromUrl > 0) ? pageFromUrl : 1;

    function getVisibleItems() {
      const allItems = Array.from(grid.children);
      return allItems.filter(item => {
        return !item.hasAttribute('data-pagination-hidden');
      });
    }

    function getAllItems() {
      return Array.from(grid.children);
    }

    function render() {
      const allItems = getAllItems();
      const totalItems = allItems.length;

      // If no data-per-page, show all items and render link-based pagination controls
      if (!perPage) {
        allItems.forEach(item => {
          item.style.display = '';
          item.removeAttribute('data-pagination-hidden');
        });
        // Render pagination links without client-side page management
        // Total pages is unknown to client; render prev/current/next links
        renderLinkOnlyControls(totalItems);
        return;
      }

      const totalPages = Math.ceil(totalItems / perPage);

      if (currentPage > totalPages) currentPage = totalPages;
      if (currentPage < 1) currentPage = 1;

      const start = (currentPage - 1) * perPage;
      const end = start + perPage;

      allItems.forEach((item, index) => {
        if (index >= start && index < end) {
          item.style.display = '';
          item.removeAttribute('data-pagination-hidden');
        } else {
          item.style.display = 'none';
          item.setAttribute('data-pagination-hidden', 'true');
        }
      });

      renderControls(totalPages, totalItems);
    }

    function renderLinkOnlyControls(totalItems) {
      paginationEl.innerHTML = '';

      // Read total pages from data attribute (set by backend)
      const totalPagesAttr = paginationEl.getAttribute('data-total-pages');
      const totalPages = totalPagesAttr ? parseInt(totalPagesAttr) : 1;

      // Don't render pagination if only 1 page
      if (totalPages <= 1) return;

      // Prev link
      const prevLink = document.createElement('a');
      prevLink.className = 'pagination-btn prev-btn';
      prevLink.innerHTML = '← Prev';
      if (currentPage <= 1) {
        prevLink.classList.add('disabled');
        prevLink.setAttribute('aria-disabled', 'true');
        prevLink.href = 'javascript:void(0)';
      } else {
        prevLink.href = buildPageUrl(currentPage - 1);
      }
      paginationEl.appendChild(prevLink);

      // Show page numbers up to totalPages
      for (let i = 1; i <= totalPages; i++) {
        if (totalPages > 7) {
          if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            const link = document.createElement('a');
            link.className = 'pagination-btn' + (i === currentPage ? ' active' : '');
            link.textContent = i;
            link.href = buildPageUrl(i);
            paginationEl.appendChild(link);
          } else if (i === currentPage - 2 || i === currentPage + 2) {
            const dots = document.createElement('span');
            dots.className = 'pagination-btn';
            dots.style.cursor = 'default';
            dots.style.border = 'none';
            dots.textContent = '...';
            paginationEl.appendChild(dots);
          }
        } else {
          const link = document.createElement('a');
          link.className = 'pagination-btn' + (i === currentPage ? ' active' : '');
          link.textContent = i;
          link.href = buildPageUrl(i);
          paginationEl.appendChild(link);
        }
      }

      // Next link
      const nextLink = document.createElement('a');
      nextLink.className = 'pagination-btn next-btn';
      nextLink.innerHTML = 'Next →';
      if (currentPage >= totalPages) {
        nextLink.classList.add('disabled');
        nextLink.setAttribute('aria-disabled', 'true');
        nextLink.href = 'javascript:void(0)';
      } else {
        nextLink.href = buildPageUrl(currentPage + 1);
      }
      paginationEl.appendChild(nextLink);

      // Info text
      const info = document.createElement('span');
      info.className = 'pagination-info';
      info.textContent = `Page ${currentPage} of ${totalPages}`;
      paginationEl.appendChild(info);
    }

    function buildPageUrl(pageNum) {
      const url = new URL(window.location.href);
      url.searchParams.set('page', pageNum);
      return url.toString();
    }

    function renderControls(totalPages, totalItems) {
      paginationEl.innerHTML = '';

      if (totalPages <= 1) return;

      // Prev link
      const prevLink = document.createElement('a');
      prevLink.className = 'pagination-btn prev-btn';
      prevLink.innerHTML = '← Prev';
      if (currentPage === 1) {
        prevLink.classList.add('disabled');
        prevLink.setAttribute('aria-disabled', 'true');
        prevLink.href = 'javascript:void(0)';
      } else {
        prevLink.href = buildPageUrl(currentPage - 1);
      }
      paginationEl.appendChild(prevLink);

      // Page number links
      for (let i = 1; i <= totalPages; i++) {
        if (totalPages > 7) {
          if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            const pageLink = createPageLink(i);
            paginationEl.appendChild(pageLink);
          } else if (i === currentPage - 2 || i === currentPage + 2) {
            const dots = document.createElement('span');
            dots.className = 'pagination-btn';
            dots.style.cursor = 'default';
            dots.style.border = 'none';
            dots.textContent = '...';
            paginationEl.appendChild(dots);
          }
        } else {
          const pageLink = createPageLink(i);
          paginationEl.appendChild(pageLink);
        }
      }

      // Next link
      const nextLink = document.createElement('a');
      nextLink.className = 'pagination-btn next-btn';
      nextLink.innerHTML = 'Next →';
      if (currentPage === totalPages) {
        nextLink.classList.add('disabled');
        nextLink.setAttribute('aria-disabled', 'true');
        nextLink.href = 'javascript:void(0)';
      } else {
        nextLink.href = buildPageUrl(currentPage + 1);
      }
      paginationEl.appendChild(nextLink);

      // Info text
      const info = document.createElement('span');
      info.className = 'pagination-info';
      const startItem = (currentPage - 1) * perPage + 1;
      const endItem = Math.min(currentPage * perPage, totalItems);
      info.textContent = `Showing ${startItem}-${endItem} of ${totalItems}`;
      paginationEl.appendChild(info);
    }

    function createPageLink(pageNum) {
      const link = document.createElement('a');
      link.className = 'pagination-btn' + (pageNum === currentPage ? ' active' : '');
      link.textContent = pageNum;
      link.href = buildPageUrl(pageNum);
      return link;
    }

    function scrollToGrid() {
      const gridRect = grid.getBoundingClientRect();
      const offset = window.scrollY + gridRect.top - 120;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }

    // Initial render
    render();

    // Store reference for blog tabs integration
    grid._paginationRender = render;
    grid._paginationReset = () => { currentPage = 1; };
  });
}

// ===== BLOG TABS =====
function initBlogTabs() {
  const tabs = document.querySelectorAll('.blog-tab');
  const blogGrid = document.getElementById('blogGrid');
  if (!tabs.length || !blogGrid) return;

  const allCards = Array.from(blogGrid.querySelectorAll('.blog-card'));

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const category = tab.getAttribute('data-category');

      // First, show/hide based on category
      allCards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
          card.style.display = '';
          card.removeAttribute('data-category-hidden');
        } else {
          card.style.display = 'none';
          card.setAttribute('data-category-hidden', 'true');
        }
      });

      // Re-apply pagination after filtering
      if (blogGrid._paginationReset) {
        // Temporarily remove hidden cards from grid, re-paginate visible ones
        const visibleCards = allCards.filter(c => !c.hasAttribute('data-category-hidden'));
        const hiddenCards = allCards.filter(c => c.hasAttribute('data-category-hidden'));

        // Clear grid
        blogGrid.innerHTML = '';

        // Add visible cards back
        visibleCards.forEach(c => {
          c.style.display = '';
          c.removeAttribute('data-pagination-hidden');
          blogGrid.appendChild(c);
        });

        // Add hidden cards back (hidden)
        hiddenCards.forEach(c => {
          c.style.display = 'none';
          blogGrid.appendChild(c);
        });

        // Reset to page 1 and re-render pagination
        blogGrid._paginationReset();
        blogGrid._paginationRender();
      }
    });
  });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  animateCounters();
  initFadeIn();
  initFAQ();
  initFilters();
  initContactForm();
  initPagination();
  initBlogTabs();
});