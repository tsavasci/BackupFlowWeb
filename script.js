// BackupFlow Website JavaScript
document.addEventListener("DOMContentLoaded", function () {
  // Navigation functionality
  const navbar = document.querySelector(".navbar");
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");

  // Navbar scroll effect
  window.addEventListener("scroll", function () {
    if (window.scrollY > 50) {
      navbar.style.background = "rgba(255, 255, 255, 0.98)";
      navbar.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.1)";
    } else {
      navbar.style.background = "rgba(255, 255, 255, 0.95)";
      navbar.style.boxShadow = "none";
    }
  });

  // Mobile menu toggle
  if (navToggle) {
    navToggle.addEventListener("click", function () {
      navMenu.classList.toggle("active");
      navToggle.classList.toggle("active");
    });
  }

  // Smooth scrolling for navigation links
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        const offsetTop = targetSection.offsetTop - 80;
        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        });

        // Close mobile menu if open
        if (navMenu.classList.contains("active")) {
          navMenu.classList.remove("active");
          navToggle.classList.remove("active");
        }
      }
    });
  });

  // Intersection Observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  // Observe elements for animation
  const animatedElements = document.querySelectorAll(
    ".feature-card, .screenshot-card, .support-card",
  );
  animatedElements.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(el);
  });

  // Hero section typewriter effect
  const heroTitle = document.querySelector(".hero-title");
  if (heroTitle) {
    // Disable typewriter effect to prevent HTML tag corruption
    // The text will display immediately without animation
    heroTitle.style.opacity = "1";
  }

  // Counter animation for stats
  function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);

    function updateCounter() {
      start += increment;
      if (start < target) {
        element.textContent = Math.floor(start);
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target;
      }
    }

    updateCounter();
  }

  // Animate counters when they come into view
  const statNumbers = document.querySelectorAll(".stat-number");
  const statsObserver = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.textContent);
        if (!isNaN(target)) {
          animateCounter(entry.target, target);
        }
        statsObserver.unobserve(entry.target);
      }
    });
  });

  statNumbers.forEach((stat) => {
    statsObserver.observe(stat);
  });

  // Parallax effect for background elements
  window.addEventListener("scroll", function () {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll(
      ".hero::before, .download::before",
    );

    parallaxElements.forEach((element) => {
      const speed = 0.5;
      const yPos = -(scrolled * speed);
      element.style.transform = `translateY(${yPos}px)`;
    });
  });

  // Dynamic app interface simulation
  const appInterface = document.querySelector(".app-interface");
  if (appInterface) {
    setInterval(function () {
      const statNumbers = appInterface.querySelectorAll(".stat-number");
      statNumbers.forEach((stat) => {
        if (stat.textContent === "12") {
          stat.textContent = Math.floor(Math.random() * 5) + 10;
        } else if (stat.textContent.includes("GB")) {
          const randomSize = (Math.random() * 2 + 1).toFixed(1);
          stat.textContent = `${randomSize}GB`;
        }
      });
    }, 5000);
  }

  // Phone mockup interactive elements
  const phoneMockup = document.querySelector(".phone-mockup");
  if (phoneMockup) {
    phoneMockup.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-10px) rotateY(5deg)";
    });

    phoneMockup.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0) rotateY(0)";
    });
  }

  // Feature cards hover effect
  const featureCards = document.querySelectorAll(".feature-card");
  featureCards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      const icon = this.querySelector(".feature-icon");
      if (icon) {
        icon.style.transform = "scale(1.1) rotate(5deg)";
      }
    });

    card.addEventListener("mouseleave", function () {
      const icon = this.querySelector(".feature-icon");
      if (icon) {
        icon.style.transform = "scale(1) rotate(0deg)";
      }
    });
  });

  // Button click animations
  const buttons = document.querySelectorAll(".btn");
  buttons.forEach((button) => {
    button.addEventListener("click", function (e) {
      // Create ripple effect
      const ripple = document.createElement("span");
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = x + "px";
      ripple.style.top = y + "px";
      ripple.classList.add("ripple");

      this.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });

  // Download button tracking
  const downloadButtons = document.querySelectorAll(
    '[href*="download"], .download-btn',
  );
  downloadButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Analytics tracking would go here
      console.log("Download button clicked");

      // Show download feedback
      const originalText = this.textContent;
      this.textContent = "Opening App Store...";
      this.style.opacity = "0.8";

      setTimeout(() => {
        this.textContent = originalText;
        this.style.opacity = "1";
      }, 2000);
    });
  });

  // Contact form handling (if added later)
  const contactForm = document.querySelector("#contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Form validation and submission logic
      const formData = new FormData(this);
      console.log("Form submitted:", Object.fromEntries(formData));

      // Show success message
      const submitButton = this.querySelector('button[type="submit"]');
      const originalText = submitButton.textContent;
      submitButton.textContent = "Message Sent!";
      submitButton.style.background = "#22c55e";

      setTimeout(() => {
        submitButton.textContent = originalText;
        submitButton.style.background = "";
        this.reset();
      }, 3000);
    });
  }

  // Keyboard navigation
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      // Close mobile menu
      if (navMenu.classList.contains("active")) {
        navMenu.classList.remove("active");
        navToggle.classList.remove("active");
      }
    }
  });

  // Loading animation
  window.addEventListener("load", function () {
    document.body.classList.add("loaded");

    // Trigger initial animations
    const heroElements = document.querySelectorAll(".hero-content > *");
    heroElements.forEach((element, index) => {
      setTimeout(() => {
        element.style.opacity = "1";
        element.style.transform = "translateY(0)";
      }, index * 200);
    });
  });

  // Performance optimization: Lazy load images
  const images = document.querySelectorAll("img[data-src]");
  const imageObserver = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove("lazy");
        imageObserver.unobserve(img);
      }
    });
  });

  images.forEach((img) => {
    imageObserver.observe(img);
  });

  // Theme detection and handling
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    document.body.classList.add("dark-theme");
  }

  // Listen for theme changes
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      if (e.matches) {
        document.body.classList.add("dark-theme");
      } else {
        document.body.classList.remove("dark-theme");
      }
    });

  // Add CSS for ripple effect
  const style = document.createElement("style");
  style.textContent = `
        .btn {
            position: relative;
            overflow: hidden;
        }

        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
        }

        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }

        .hero-content > * {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.8s ease, transform 0.8s ease;
        }

        .loaded .hero-content > * {
            opacity: 1;
            transform: translateY(0);
        }

        .feature-icon {
            transition: transform 0.3s ease;
        }

        .phone-mockup {
            transition: transform 0.3s ease;
        }
    `;
  document.head.appendChild(style);
});

// Utility functions
function debounce(func, wait, immediate) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Optimized scroll handler
const optimizedScrollHandler = throttle(function () {
  const scrolled = window.pageYOffset;

  // Update navbar
  if (scrolled > 50) {
    document.querySelector(".navbar").classList.add("scrolled");
  } else {
    document.querySelector(".navbar").classList.remove("scrolled");
  }
}, 16);

window.addEventListener("scroll", optimizedScrollHandler);
