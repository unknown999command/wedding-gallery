// Minimalist Wedding Gallery script.js
// Handles dynamic rendering from mediaList and the universal lightbox

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = themeToggle.querySelector('i');
  
  // Lightbox Selectors
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const lightboxMediaContainer = document.getElementById('lightboxMediaContainer');
  const lightboxCaption = document.getElementById('lightboxCaption');
  
  const mediaGrid = document.getElementById('mediaGrid');
  let currentMediaIndex = 0;

  // === 1. THEME SWITCHING (LIGHT/DARK) ===
  const savedTheme = localStorage.getItem('theme') || 'light-theme';
  body.className = savedTheme;
  updateThemeIcon();

  themeToggle.addEventListener('click', () => {
    if (body.classList.contains('dark-theme')) {
      body.className = 'light-theme';
      localStorage.setItem('theme', 'light-theme');
    } else {
      body.className = 'dark-theme';
      localStorage.setItem('theme', 'dark-theme');
    }
    updateThemeIcon();
  });

  function updateThemeIcon() {
    if (body.classList.contains('dark-theme')) {
      themeIcon.className = 'fas fa-sun';
      themeToggle.setAttribute('aria-label', 'Включить светлую тему');
    } else {
      themeIcon.className = 'fas fa-moon';
      themeToggle.setAttribute('aria-label', 'Включить темную тему');
    }
  }

  // === 2. DYNAMIC GRID RENDERING ===
  if (typeof mediaList !== 'undefined' && Array.isArray(mediaList)) {
    mediaList.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = `media-item ${item.type}`;
      
      if (item.type === 'video') {
        card.innerHTML = `
          <div class="media-wrapper">
            <video src="${item.src}" preload="metadata" muted></video>
            <div class="media-hover-overlay">
              <i class="fas fa-play"></i>
            </div>
            <span class="video-badge"><i class="fas fa-video"></i> Видео</span>
          </div>
        `;
      } else {
        card.innerHTML = `
          <div class="media-wrapper">
            <img src="${item.src}" alt="${item.alt}" loading="lazy">
            <div class="media-hover-overlay">
              <i class="fas fa-expand"></i>
            </div>
          </div>
        `;
      }
      
      // Open Lightbox on Click
      card.addEventListener('click', () => {
        currentMediaIndex = index;
        openLightbox();
      });
      
      mediaGrid.appendChild(card);
    });
  } else {
    console.error("mediaList array is not defined. Make sure media-list.js is loaded.");
    mediaGrid.innerHTML = "<p style='grid-column: 1/-1; text-align: center;'>Медиафайлы не найдены.</p>";
  }

  // === 3. UNIVERSAL LIGHTBOX ===
  function openLightbox() {
    lightboxModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Lock scrolling
    updateLightboxMedia();
  }

  function closeLightbox() {
    lightboxModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // Unlock scrolling
    lightboxMediaContainer.innerHTML = ''; // Clear media to stop audio/video
  }

  function updateLightboxMedia() {
    const currentImg = mediaList[currentMediaIndex];
    if (!currentImg) return;

    lightboxMediaContainer.innerHTML = '';
    // Format title from filename (remove extension and directory path)
    const rawName = currentImg.alt;
    const cleanTitle = rawName.replace(/img_/, '').split('.')[0];
    lightboxCaption.textContent = cleanTitle.toUpperCase();

    if (currentImg.type === 'video') {
      const videoElement = document.createElement('video');
      videoElement.setAttribute('src', currentImg.src);
      videoElement.setAttribute('controls', 'true');
      videoElement.setAttribute('autoplay', 'true');
      videoElement.setAttribute('playsinline', 'true');
      lightboxMediaContainer.appendChild(videoElement);
    } else {
      const imgElement = document.createElement('img');
      imgElement.setAttribute('src', currentImg.full);
      imgElement.setAttribute('alt', cleanTitle);
      lightboxMediaContainer.appendChild(imgElement);
    }
  }

  function navigateLightbox(direction) {
    if (!mediaList || mediaList.length === 0) return;
    if (direction === 'next') {
      currentMediaIndex = (currentMediaIndex + 1) % mediaList.length;
    } else if (direction === 'prev') {
      currentMediaIndex = (currentMediaIndex - 1 + mediaList.length) % mediaList.length;
    }
    updateLightboxMedia();
  }

  // Click listeners for lightbox controls
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', () => navigateLightbox('prev'));
  lightboxNext.addEventListener('click', () => navigateLightbox('next'));

  // Close on backdrop click
  lightboxModal.addEventListener('click', (e) => {
    if (e.target === lightboxModal || e.target === lightboxMediaContainer) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (lightboxModal.getAttribute('aria-hidden') === 'false') {
      if (e.key === 'ArrowRight') navigateLightbox('next');
      if (e.key === 'ArrowLeft') navigateLightbox('prev');
      if (e.key === 'Escape') closeLightbox();
    }
  });

  // Swipe Gestures Support
  let touchStartX = 0;
  let touchEndX = 0;
  
  lightboxModal.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightboxModal.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
      navigateLightbox('next');
    }
    if (touchEndX > touchStartX + swipeThreshold) {
      navigateLightbox('prev');
    }
  }
});
