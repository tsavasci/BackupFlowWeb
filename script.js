function throttle(func, limit) {
  let inThrottle = false;
  return function throttled(...args) {
    if (inThrottle) {
      return;
    }

    func.apply(this, args);
    inThrottle = true;
    setTimeout(() => {
      inThrottle = false;
    }, limit);
  };
}

document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.querySelector(".navbar");
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");

  const setNavbarState = () => {
    if (!navbar) {
      return;
    }

    navbar.classList.toggle("scrolled", window.scrollY > 50);
  };

  setNavbarState();
  window.addEventListener("scroll", throttle(setNavbarState, 50));

  const closeMobileMenu = () => {
    if (!navMenu || !navToggle) {
      return;
    }

    navMenu.classList.remove("active");
    navToggle.classList.remove("active");
    navToggle.setAttribute("aria-expanded", "false");
  };

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("active");
      navToggle.classList.toggle("active", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  const sectionLinks = document.querySelectorAll('a[href^="#"]');
  sectionLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || href.length <= 1) {
      return;
    }

    const target = document.querySelector(href);
    if (!target) {
      return;
    }

    link.addEventListener("click", (event) => {
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      closeMobileMenu();
    });
  });

  const animatedElements = document.querySelectorAll(
    ".feature-card, .screenshot-card, .support-card",
  );

  if ("IntersectionObserver" in window && animatedElements.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      },
    );

    animatedElements.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(24px)";
      el.style.transition = "opacity 0.45s ease, transform 0.45s ease";
      observer.observe(el);
    });
  }

  const featureCards = document.querySelectorAll(".feature-card");
  featureCards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      const icon = card.querySelector(".feature-icon");
      if (icon) {
        icon.style.transform = "scale(1.08) rotate(4deg)";
      }
    });

    card.addEventListener("mouseleave", () => {
      const icon = card.querySelector(".feature-icon");
      if (icon) {
        icon.style.transform = "scale(1) rotate(0deg)";
      }
    });
  });

  const buttons = document.querySelectorAll(".btn");
  buttons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const ripple = document.createElement("span");
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.classList.add("ripple");

      button.appendChild(ripple);
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMobileMenu();
    }
  });

  window.addEventListener("load", () => {
    document.body.classList.add("loaded");
  });

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

        .feature-icon {
            transition: transform 0.3s ease;
        }
    `;
  document.head.appendChild(style);
});
