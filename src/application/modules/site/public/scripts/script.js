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

// ===== FILTER FUNCTIONALITY =====
function initFilters() {
  const filterBar = document.querySelector('.filter-bar');
  if (!filterBar) return;

  const searchInput = filterBar.querySelector('input[type="text"]');
  const selects = filterBar.querySelectorAll('select');
  const cards = document.querySelectorAll('.filterable-card');

  function filterCards() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      const matchesSearch = text.includes(searchTerm);

      let matchesFilters = true;
      selects.forEach(select => {
        const filterKey = select.getAttribute('data-filter');
        const filterValue = select.value;
        if (filterValue && filterKey) {
          const cardValue = card.getAttribute('data-' + filterKey);
          if (cardValue && !cardValue.toLowerCase().includes(filterValue.toLowerCase())) {
            matchesFilters = false;
          }
        }
      });

      card.style.display = (matchesSearch && matchesFilters) ? '' : 'none';
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterCards);
  }
  selects.forEach(select => {
    select.addEventListener('change', filterCards);
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

// ===== BLOG TABS =====
function initBlogTabs() {
  const tabs = document.querySelectorAll('.blog-tab');
  const blogCards = document.querySelectorAll('#blogGrid .blog-card');
  if (!tabs.length || !blogCards.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const category = tab.getAttribute('data-category');

      blogCards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
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
  initBlogTabs();
});