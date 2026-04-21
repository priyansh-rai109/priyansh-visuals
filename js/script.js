/* portfolio/js/script.js */
document.addEventListener('DOMContentLoaded', () => {

  // Mobile Navigation Toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navLinks.classList.toggle('nav-active');
    });
  }

  // Lightbox Implementation
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.querySelector('.lightbox-img');
  const galleryItems = document.querySelectorAll('.gallery-item img');
  const closeBtn = document.querySelector('.lightbox-close');

  if (lightbox && lightboxImg && closeBtn) {
    galleryItems.forEach(img => {
      img.addEventListener('click', () => {
        lightbox.classList.add('active');
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        document.body.style.overflow = 'hidden'; // prevent background scrolling
      });
    });

    closeBtn.addEventListener('click', () => {
      lightbox.classList.remove('active');
      document.body.style.overflow = 'auto';
    });

    lightbox.addEventListener('click', (e) => {
      if (e.target !== lightboxImg) {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
      }
    });

    // Support escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
      }
    });
  }

  // Static Form Handler (Pure Frontend Mock)
  const contactForm = document.getElementById('contactForm');
  const formMsg = document.getElementById('formMsg');
  const submitBtn = document.getElementById('submitBtn');

  if (contactForm && formMsg && submitBtn) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Visual feedback
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      // Simulate a network request delay because we are frontend only
      setTimeout(() => {
        contactForm.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Show success message
        formMsg.classList.add('success');
        formMsg.textContent = 'Thank you! Your message has been received securely.';
        
        // Hide message after 5 seconds
        setTimeout(() => {
          formMsg.classList.remove('success');
        }, 5000);
      }, 1500);
    });
  }

  // Loading Screen Logic
  const loader = document.getElementById('loading-screen');
  window.addEventListener('load', () => {
    if (loader) {
      setTimeout(() => {
        loader.classList.add('hidden');
      }, 500); // Give ThreeJS half a second heartbeat to mount
    }
  });

  // GSAP ScrollTrigger Animations
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Fade up animations with stagger
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(element => {
      gsap.from(element, {
        scrollTrigger: {
          trigger: element,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        y: 60,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
        clearProps: 'all' // Allows Vanilla-Tilt to control transform after GSAP finishes!
      });
    });

    // Animate navbar simply sliding down on load
    gsap.from('.navbar', {
      y: -100,
      opacity: 0,
      duration: 1.5,
      ease: 'expo.out',
      delay: 0.5,
      clearProps: 'all'
    });
  }

});
