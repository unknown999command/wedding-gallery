// Minimalist Wedding Gallery script.js

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
  
  // Media items data list
  const mediaItems = Array.from(document.querySelectorAll('.media-item'));
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

  // === 2. UNIVERSAL LIGHTBOX ===
  mediaItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      currentMediaIndex = index;
      openLightbox();
    });
  });

  function openLightbox() {
    lightboxModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Lock scrolling
    updateLightboxMedia();
  }

  function closeLightbox() {
    lightboxModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // Unlock scrolling
    // Clear container to stop playing videos
    lightboxMediaContainer.innerHTML = '';
  }

  function updateLightboxMedia() {
    const activeItem = mediaItems[currentMediaIndex];
    if (!activeItem) return;

    // Check media type
    const isVideo = activeItem.classList.contains('video');
    const title = activeItem.querySelector('img').getAttribute('alt');
    
    // Smooth transition clean-up
    lightboxMediaContainer.innerHTML = '';
    lightboxCaption.textContent = title;

    if (isVideo) {
      const videoUrl = activeItem.getAttribute('data-video-url');
      const videoElement = document.createElement('video');
      videoElement.setAttribute('src', videoUrl);
      videoElement.setAttribute('controls', 'true');
      videoElement.setAttribute('autoplay', 'true');
      videoElement.setAttribute('playsinline', 'true');
      lightboxMediaContainer.appendChild(videoElement);
    } else {
      const imgUrl = activeItem.querySelector('img').getAttribute('src');
      const imgElement = document.createElement('img');
      imgElement.setAttribute('src', imgUrl);
      imgElement.setAttribute('alt', title);
      lightboxMediaContainer.appendChild(imgElement);
    }
  }

  function navigateLightbox(direction) {
    if (direction === 'next') {
      currentMediaIndex = (currentMediaIndex + 1) % mediaItems.length;
    } else if (direction === 'prev') {
      currentMediaIndex = (currentMediaIndex - 1 + mediaItems.length) % mediaItems.length;
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
