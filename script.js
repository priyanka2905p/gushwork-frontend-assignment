(() => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const toast = document.getElementById('toast');
  const showToast = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      toast.hidden = true;
    }, 2200);
  };


  /* Sticky header: appears after the first fold (viewport height) */
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    if (!header) return;
    const threshold = window.innerHeight * 0.85;
    header.classList.toggle('is-visible', window.scrollY > threshold);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu toggle */
  const toggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (toggle && mobileMenu) {
    const setExpanded = (expanded) => {
      toggle.setAttribute('aria-expanded', String(expanded));
      mobileMenu.hidden = !expanded;
    };

    // Prefer state from aria-expanded if set
    const initialExpanded = toggle.getAttribute('aria-expanded') === 'true';
    setExpanded(initialExpanded);

    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      setExpanded(!expanded);
    });

    mobileMenu.addEventListener('click', (e) => {
      const target = e.target;
      if (target && target.matches('a')) setExpanded(false);
    });
  }


  /* Forms (prevent actual navigation; show toast) */
  const contactForm = document.querySelector('form.form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(contactForm);
      const name = String(formData.get('name') || '').trim();
      const email = String(formData.get('email') || '').trim();
      const message = String(formData.get('message') || '').trim();

      // "Real" behavior without a backend: open the user's email client with the message.
      const subject = encodeURIComponent(`Gushwork inquiry${name ? ` - ${name}` : ''}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
      // No redirect/mailto (assignment style). Just show a success message.
      // const mailto = `mailto:your-email@example.com?subject=${subject}&body=${body}`;

      showToast('Your msg is sent');
      // Optionally reset the form.
      contactForm.reset();

    });
  }


  /* Ensure CTA buttons/links are clickable (mobile menu/overlays bug-proof) */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    // If a link points to "#" (common placeholder), show a toast instead of navigating.
    const href = a.getAttribute('href');
    if (href === '#') {
      e.preventDefault();

      const action = a.getAttribute('data-action');
      if (action === 'faqs') {
        showToast('FAQs: All set (demo)');
        return;
      }

      const txt = a.textContent.trim();
      if (/system status/i.test(txt)) {
        showToast('System status: Operational (demo)');
        return;
      }

      showToast(txt ? `${txt}` : 'Link');
    }

  });




  /* Carousel + Hover Zoom */
  const carousel = document.querySelector('[data-carousel]');
  if (!carousel) {
    return;
  }

  const slidesData = [

    {
      src: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80',
      alt: 'Mountain lake'
    },
    {
      src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8bW91bnRhaW58ZW58MHx8MHx8fDA%3D',
      alt: 'Forest landscape'
    },
    {
      src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80',
      alt: 'City skyline'
    },
    {
      src: 'https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=1600&q=80',
      alt: 'Night sky'
    }
  ];

  const imageGrid = carousel.querySelector('.carousel-image-grid');
  const dotsWrap = carousel.querySelector('[data-dots]');
  const currentEl = carousel.querySelector('[data-current]');
  const totalEl = carousel.querySelector('[data-total]');
  const zoomPreview = carousel.querySelector('.carousel-zoom-preview');
  const zoomImg = carousel.querySelector('.carousel-zoom-img');
  const prevBtn = carousel.querySelector('[data-prev]');
  const nextBtn = carousel.querySelector('[data-next]');

  let index = 0;

  // Inject slides
  imageGrid.innerHTML = '';
  slidesData.forEach((s, i) => {
    const slide = document.createElement('div');
    slide.className = 'slide';
    slide.dataset.index = String(i);

    const img = document.createElement('img');
    img.src = s.src;
    img.alt = s.alt;

    slide.appendChild(img);
    imageGrid.appendChild(slide);

    // Hover zoom
    slide.addEventListener('mouseenter', () => {
      slide.classList.add('is-hovering');
      if (zoomPreview) zoomPreview.style.opacity = '1';
      if (zoomPreview && zoomImg) {
        zoomImg.src = s.src;
        zoomImg.alt = '';
      }
    });

    slide.addEventListener('mouseleave', () => {
      slide.classList.remove('is-hovering');
      if (zoomPreview) zoomPreview.style.opacity = '0';
    });

    slide.addEventListener('mousemove', (e) => {
      // Position zoom preview near cursor
      if (!zoomPreview) return;
      const rect = slide.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const px = Math.max(0, Math.min(rect.width, x));
      const py = Math.max(0, Math.min(rect.height, y));

      // Move preview within carousel container bounds
      const wrap = carousel.querySelector('.carousel-zoom-wrap');
      const wrapRect = wrap.getBoundingClientRect();
      const previewW = zoomPreview.offsetWidth || 220;
      const previewH = zoomPreview.offsetHeight || 160;

      let left = e.clientX - wrapRect.left + 16;
      let top = e.clientY - wrapRect.top - previewH / 2;

      left = Math.max(10, Math.min(wrapRect.width - previewW - 10, left));
      top = Math.max(10, Math.min(wrapRect.height - previewH - 10, top));

      zoomPreview.style.left = `${left}px`;
      zoomPreview.style.top = `${top}px`;

      // Simulate zoom focal point by shifting the background-like transform.
      // We achieve it by changing object-position via CSS translate scaling.
      // Compute percentage within slide.
      const relX = px / rect.width; // 0..1
      const relY = py / rect.height;

      // Use object-position on the zoom image.
      if (zoomImg) {
        zoomImg.style.objectPosition = `${relX * 100}% ${relY * 100}%`;
      }
    });
  });

  // Dots
  if (dotsWrap) {
    dotsWrap.innerHTML = '';
    slidesData.forEach((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'dot';
      b.setAttribute('aria-label', `Go to slide ${i + 1}`);
      b.addEventListener('click', () => setSlide(i, true));
      dotsWrap.appendChild(b);
    });
  }

  if (totalEl) totalEl.textContent = String(slidesData.length);

  const slides = Array.from(imageGrid.children);
  const syncUI = () => {
    slides.forEach((s, i) => {
      // Only show active slide by translating container.
      // Since slides have min-width (100% - gap), we can set translate based on index.
      s.style.display = i === index ? 'block' : 'none';
    });

    if (currentEl) currentEl.textContent = String(index + 1);

    if (dotsWrap) {
      const dots = Array.from(dotsWrap.children);
      dots.forEach((d, i) => d.classList.toggle('is-active', i === index));
    }
  };

  // Basic carousel movement (prev/next + dot)
  const setSlide = (i, fromUser) => {

    const next = (i + slidesData.length) % slidesData.length;
    index = next;
    syncUI();

    // Optional: focus management
    if (fromUser && dotsWrap) {
      const dots = Array.from(dotsWrap.children);
      const activeDot = dots[index];
      if (activeDot) activeDot.focus({ preventScroll: true });
    }
  };

  if (prevBtn) prevBtn.addEventListener('click', () => setSlide(index - 1, true));
  if (nextBtn) nextBtn.addEventListener('click', () => setSlide(index + 1, true));

  // Keyboard support when carousel is focused
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') setSlide(index - 1, true);
    if (e.key === 'ArrowRight') setSlide(index + 1, true);
  });

  // Initial
  syncUI();
})();
