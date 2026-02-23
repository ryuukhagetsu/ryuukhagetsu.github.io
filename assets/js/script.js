let navbarTicking = false;

function updateNavbar() {
  const navbar = document.querySelector(".navbar");
  if (navbar) {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }
  navbarTicking = false;
}

function handleNavbarScroll() {
  if (!navbarTicking) {
    requestAnimationFrame(updateNavbar);
    navbarTicking = true;
  }
}

let activeNavTicking = false;

function updateActiveNav() {
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".nav-link");

  if (sections.length === 0 || navLinks.length === 0) return;

  let current = "";

  sections.forEach((section) => {
    if (!section.offsetTop || !section.clientHeight) return;

    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;

    if (
      window.pageYOffset >= sectionTop - 200 &&
      window.pageYOffset < sectionTop + sectionHeight - 200
    ) {
      const id = section.getAttribute("id");
      if (id) current = id;
    }
  });

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href) {
      link.classList.remove("active");

      if (href.slice(1) === current) {
        link.classList.add("active");
      }
    }
  });

  activeNavTicking = false;
}

function handleActiveNavScroll() {
  if (!activeNavTicking) {
    requestAnimationFrame(updateActiveNav);
    activeNavTicking = true;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Mobile Navbar Toggle
  const navbarToggler = document.querySelector('.navbar-toggler');
  const mobileNavbarOverlay = document.getElementById('mobileNavbarOverlay');
  const mobileNavbarSidebar = document.getElementById('mobileNavbarSidebar');
  const mobileNavbarClose = document.getElementById('mobileNavbarClose');
  const mobileNavLinks = document.querySelectorAll('.mobile-navbar-nav .nav-link');

  function openMobileNavbar() {
    mobileNavbarOverlay.classList.add('active');
    mobileNavbarSidebar.classList.add('active');
    document.body.classList.add('navbar-mobile-open');
  }

  function closeMobileNavbar() {
    mobileNavbarOverlay.classList.remove('active');
    mobileNavbarSidebar.classList.remove('active');
    document.body.classList.remove('navbar-mobile-open');
  }

  // Open mobile navbar when hamburger is clicked
  if (navbarToggler) {
    navbarToggler.addEventListener('click', function(e) {
      e.preventDefault();
      openMobileNavbar();
    });
  }

  // Close mobile navbar when close button is clicked
  if (mobileNavbarClose) {
    mobileNavbarClose.addEventListener('click', closeMobileNavbar);
  }

  // Close mobile navbar when overlay is clicked
  if (mobileNavbarOverlay) {
    mobileNavbarOverlay.addEventListener('click', closeMobileNavbar);
  }

  // Close mobile navbar when nav link is clicked
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', function() {
      closeMobileNavbar();
    });
  });

  // Close mobile navbar on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && mobileNavbarSidebar.classList.contains('active')) {
      closeMobileNavbar();
    }
  });

  const typingElement = document.getElementById("role-element");

  if (typingElement) {
    // Check if device is mobile
    const isMobile = window.innerWidth <= 768;
    
    const roles = isMobile ? [
      "Ethical Hacker",
      "Pentester", 
      "Bug Hunter",
    ] : [
      "Ethical Hacker",
      "CyberSec Engineer",
      "Penetration Tester",
      "Bug Hunter",
    ];

    let roleIndex = 0;
    let charIndex = 0;

    function typeText() {
      if (charIndex < roles[roleIndex].length) {
        typingElement.textContent += roles[roleIndex][charIndex];
        charIndex++;
        setTimeout(typeText, 50);
      } else {
        setTimeout(eraseText, 1500);
      }
    }

    function eraseText() {
      if (charIndex > 0) {
        typingElement.textContent = roles[roleIndex].substring(
          0,
          charIndex - 1
        );
        charIndex--;
        setTimeout(eraseText, 25);
      } else {
        roleIndex = (roleIndex + 1) % roles.length;
        setTimeout(typeText, 300);
      }
    }

    typeText();
    
    // Handle window resize to update roles dynamically
    let resizeTimeout;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(function() {
        const newIsMobile = window.innerWidth <= 768;
        const newRoles = newIsMobile ? [
          "Ethical Hacker",
          "Pentester", 
          "Bug Hunter",
        ] : [
          "Ethical Hacker",
          "CyberSec Engineer",
          "Penetration Tester",
          "Bug Hunter",
        ];
        
        // Only restart if roles array has changed
        if (JSON.stringify(newRoles) !== JSON.stringify(roles)) {
          // Reset typing animation
          roleIndex = 0;
          charIndex = 0;
          typingElement.textContent = '';
          
          // Update roles array
          roles.length = 0;
          roles.push(...newRoles);
          
          // Restart typing animation
          typeText();
        }
      }, 250);
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const filterButtons = document.querySelectorAll(".project-filter");
  const projectItems = document.querySelectorAll(".project-item");

  if (filterButtons.length > 0 && projectItems.length > 0) {
    filterButtons.forEach((button) => {
      button.addEventListener("click", function () {
        filterButtons.forEach((btn) => btn.classList.remove("active"));
        this.classList.add("active");

        const filterValue = this.getAttribute("data-filter");

        projectItems.forEach((item) => {
          if (filterValue === "all" || item.classList.contains(filterValue)) {
            item.style.display = "block";
          } else {
            item.style.display = "none";
          }
        });
      });
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const animateElements = document.querySelectorAll(
    ".skill-card, .project-card, .recognition-card, .blog-card"
  );

  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // Animate if entering viewport OR if already scrolled past (top < 0)
        if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
          entry.target.classList.add("animate");
          cardObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0,
      rootMargin: "0px 0px 80px 0px", // pre-trigger 80px before entering viewport
    }
  );

  animateElements.forEach((element) => {
    // Elements already in/above viewport on load → animate immediately
    if (element.getBoundingClientRect().top < window.innerHeight) {
      element.classList.add("animate");
    } else {
      cardObserver.observe(element);
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const loadMoreBtn = document.getElementById("load-more-btn");
  const loadMoreContainer = document.getElementById("load-more-container");

  if (loadMoreBtn && loadMoreContainer) {
    const projectItems = document.querySelectorAll(".project-item");
    let currentlyShowing = 6;
    const projectsPerLoad = 6;
    const totalProjects = projectItems.length;

    projectItems.forEach((item, index) => {
      if (index < 6) {
        item.classList.add("visible-project");
      } else {
        item.classList.add("hidden-project");
      }
    });

    if (totalProjects <= 6) {
      loadMoreContainer.style.display = "none";
    }

    loadMoreBtn.addEventListener("click", function () {
      const hiddenProjects = document.querySelectorAll(".hidden-project");
      const projectsToShow = Math.min(projectsPerLoad, hiddenProjects.length);

      for (let i = 0; i < projectsToShow; i++) {
        if (hiddenProjects[i]) {
          hiddenProjects[i].classList.remove("hidden-project");
          hiddenProjects[i].classList.add("visible-project");
        }
      }

      currentlyShowing += projectsToShow;

      if (document.querySelectorAll(".hidden-project").length === 0) {
        loadMoreContainer.style.display = "none";
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const logoSlider = document.getElementById("logo-slider");
  if (!logoSlider) return;

  function setupInfiniteSlider() {
    const originalLogos = Array.from(logoSlider.children);
    const logoCount = originalLogos.length;

    const clones = logoSlider.querySelectorAll("[data-clone]");
    clones.forEach((el) => el.remove());

    originalLogos.forEach((logo) => {
      const clone = logo.cloneNode(true);
      clone.setAttribute("data-clone", "true");
      logoSlider.appendChild(clone);
    });

    const computedStyle = getComputedStyle(logoSlider);
    const gap = parseInt(computedStyle.getPropertyValue("gap")) || 60;
    const logoElements = logoSlider.querySelectorAll(".hof-logo");
    const logoWidth = logoElements[0]?.offsetWidth || 140;
    const totalDistance = (logoWidth + gap) * logoCount;

    const keyframeName = `slideRight-${Date.now()}`;
    const keyframes = `
            @keyframes ${keyframeName} {
                0% { transform: translateX(0); }
                100% { transform: translateX(-${totalDistance}px); }
            }
        `;

    const style = document.createElement("style");
    style.textContent = keyframes;
    document.head.appendChild(style);

    const duration = Math.max(10, logoCount * 2);
    logoSlider.style.animation = `${keyframeName} ${duration}s linear infinite`;
    logoSlider.style.willChange = "transform";
    logoSlider.style.transform = "translateX(0)";
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      logoSlider.style.animationPlayState = entry.isIntersecting
        ? "running"
        : "paused";
    });
  });

  setupInfiniteSlider();
  observer.observe(logoSlider);

  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      setupInfiniteSlider();
    }, 250);
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const contactForm = document.querySelector(".contact-form");

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      try {
        const name = document.getElementById("name");
        const email = document.getElementById("email");
        const subject = document.getElementById("subject");
        const message = document.getElementById("message");
        const encrypt = document.getElementById("encrypt-message");

        contactForm.reset();
        alert("Message sent successfully!");
      } catch (error) {
        console.error("Form submission error:", error);
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  function revealItem(item) {
    item.style.opacity = "1";
    item.style.transform = "translateY(0)";
  }

  const timelineObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach((entry) => {
        // Fire if entering viewport OR if already scrolled past (above viewport)
        if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
          revealItem(entry.target);
          timelineObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0,
      rootMargin: "0px 0px 60px 0px", // pre-trigger 60px before entering viewport
    }
  );

  const timelineItems = document.querySelectorAll(".timeline-item");
  timelineItems.forEach((item, index) => {
    item.style.opacity = "0";
    item.style.transform = "translateY(50px)";

    if (item.getBoundingClientRect().top < window.innerHeight) {
      // Already visible on load → reveal without stagger delay
      item.style.transition = "opacity 0.6s ease, transform 0.6s ease";
      revealItem(item);
    } else {
      item.style.transition = `opacity 0.6s ease ${index * 0.15}s, transform 0.6s ease ${index * 0.15}s`;
      timelineObserver.observe(item);
    }
  });

  const experienceTimelineItems = document.querySelectorAll(
    ".experience-timeline-item"
  );
  experienceTimelineItems.forEach((item, index) => {
    item.style.opacity = "0";
    item.style.transform = "translateY(20px)";

    if (item.getBoundingClientRect().top < window.innerHeight) {
      item.style.transition = "opacity 0.6s ease, transform 0.6s ease";
      revealItem(item);
    } else {
      item.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
      timelineObserver.observe(item);
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const backButton = document.querySelector(".back-to-articles");
  const shareButtons = document.querySelectorAll(".share-btn");
  const pageUrl = encodeURIComponent(window.location.href);
  const pageTitle = encodeURIComponent(document.title);

  if (backButton) {
    const articleObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target.classList) {
            if (entry.isIntersecting) {
              entry.target.classList.remove("is-sticky");
            } else {
              entry.target.classList.add("is-sticky");
            }
          }
        });
      },
      {
        rootMargin: "-100px 0px 0px 0px",
      }
    );

    articleObserver.observe(backButton);
  }

  shareButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      const shareType = this.getAttribute("data-share");

      if (shareType === "copy") {
        if (navigator.clipboard) {
          navigator.clipboard
            .writeText(window.location.href)
            .then(() => {
              console.log("URL copied to clipboard!");
              alert("Link copied to clipboard!");
            })
            .catch((err) => {
              console.error("Failed to copy:", err);
            });
        }
      } else if (shareType === "twitter") {
        const twitterUrl = `https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`;
        window.open(twitterUrl, "_blank", "noopener,noreferrer");
      } else if (shareType === "linkedin") {
        const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}`;
        window.open(linkedInUrl, "_blank", "noopener,noreferrer");
      }
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  let scrollTicking = false;

  function handleCombinedScroll() {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        handleNavbarScroll();

        setTimeout(() => {
          handleActiveNavScroll();
        }, 10);

        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }

  window.addEventListener("scroll", handleCombinedScroll, {
    passive: true,
  });
});

document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach((link) => {
      const originalTransition = getComputedStyle(link, "::after").transition;
      if (!originalTransition || originalTransition === "none") {
      }
    });

    const navbar = document.querySelector(".navbar");
    if (navbar) {
      navbar.style.pointerEvents = "auto";
      navbar.style.position = "fixed";
      navbar.style.zIndex = "1030";
    }

    initializeAchievementGallery();
  }, 1000);
});

function initializeAchievementGallery() {
  const achievementImages = document.querySelectorAll(
    ".achievement-main-image"
  );

  achievementImages.forEach((img, index) => {
    img.style.setProperty("display", "block", "important");
    img.style.setProperty("opacity", "1", "important");
    img.style.setProperty("visibility", "visible", "important");
    img.style.setProperty("width", "100%", "important");
    img.style.setProperty("height", "100%", "important");
    img.style.setProperty("object-fit", "cover", "important");
    img.style.setProperty("position", "relative", "important");
    img.style.setProperty("z-index", "1", "important");
  });

  const imageContainers = document.querySelectorAll(
    ".achievement-image-container"
  );
  imageContainers.forEach((container) => {
    container.style.setProperty("display", "block", "important");
    container.style.setProperty("position", "relative", "important");
    container.style.setProperty("width", "100%", "important");
    container.style.setProperty("height", "220px", "important");
    container.style.setProperty("overflow", "hidden", "important");
  });

  const galleryItems = document.querySelectorAll(".achievement-gallery-item");

  galleryItems.forEach((item, index) => {
    if (index < 6) {
      item.style.setProperty("display", "block", "important");
      item.classList.add("item-visible");
      item.classList.remove("item-hidden");
    } else {
      item.style.display = "none";
      item.classList.add("item-hidden");
      item.classList.remove("item-visible");
    }
  });

  setupSimpleFilters();

  setupSimpleSearch();

  setupSimpleLoadMore();

  setupSimpleScrollObserver();
}

function setupSimpleFilters() {
  const filterButtons = document.querySelectorAll(".achievement-filter-btn");
  const galleryItems = document.querySelectorAll(".achievement-gallery-item");

  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const category = this.getAttribute("data-category");

      filterButtons.forEach((btn) => btn.classList.remove("filter-active"));
      this.classList.add("filter-active");

      let visibleCount = 0;
      galleryItems.forEach((item, index) => {
        const itemCategory = item.getAttribute("data-category");
        const shouldShow = category === "all" || itemCategory === category;

        if (shouldShow) {
          setTimeout(() => {
            item.style.setProperty("display", "block", "important");
            item.classList.add("item-visible");
            item.classList.remove("item-hidden");

            const images = item.querySelectorAll(".achievement-main-image");
            images.forEach((img) => {
              img.style.setProperty("display", "block", "important");
              img.style.setProperty("opacity", "1", "important");
              img.style.setProperty("visibility", "visible", "important");
            });

            visibleCount++;
          }, index * 50);
        } else {
          item.style.display = "none";
          item.classList.add("item-hidden");
          item.classList.remove("item-visible");
        }
      });
    });
  });
}

function setupSimpleSearch() {
  const searchInput = document.getElementById("achievement-search-input");
  const searchBtn = document.getElementById("achievement-search-trigger");
  const galleryItems = document.querySelectorAll(".achievement-gallery-item");

  function performSearch(searchTerm) {
    let visibleCount = 0;

    galleryItems.forEach((item, index) => {
      if (!searchTerm) {
        item.style.setProperty("display", "block", "important");
        item.classList.add("item-visible");
        item.classList.remove("item-hidden");
        visibleCount++;
      } else {
        const title =
          item
            .querySelector(".achievement-title-text")
            ?.textContent.toLowerCase() || "";
        const issuer =
          item
            .querySelector(".achievement-issuer-name")
            ?.textContent.toLowerCase() || "";
        const description =
          item
            .querySelector(".achievement-description-content")
            ?.textContent.toLowerCase() || "";

        const searchText = `${title} ${issuer} ${description}`;
        const isMatch = searchText.includes(searchTerm.toLowerCase());

        if (isMatch) {
          setTimeout(() => {
            item.style.setProperty("display", "block", "important");
            item.classList.add("item-visible");
            item.classList.remove("item-hidden");

            const images = item.querySelectorAll(".achievement-main-image");
            images.forEach((img) => {
              img.style.setProperty("display", "block", "important");
              img.style.setProperty("opacity", "1", "important");
              img.style.setProperty("visibility", "visible", "important");
            });

            visibleCount++;
          }, index * 30);
        } else {
          item.style.display = "none";
          item.classList.add("item-hidden");
          item.classList.remove("item-visible");
        }
      }
    });
  }

  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener("input", function () {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        performSearch(this.value.trim());
      }, 300);
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener("click", function () {
      if (searchInput) {
        performSearch(searchInput.value.trim());
      }
    });
  }
}

function setupSimpleLoadMore() {
  const loadMoreBtn = document.getElementById("achievement-load-more-trigger");
  const galleryItems = document.querySelectorAll(".achievement-gallery-item");

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", function () {
      const hiddenItems = Array.from(galleryItems).filter((item) =>
        item.classList.contains("item-hidden")
      );

      const itemsToShow = hiddenItems.slice(0, 6);

      itemsToShow.forEach((item, index) => {
        setTimeout(() => {
          item.style.setProperty("display", "block", "important");
          item.classList.add("item-visible");
          item.classList.remove("item-hidden");

          const images = item.querySelectorAll(".achievement-main-image");
          images.forEach((img) => {
            img.style.setProperty("display", "block", "important");
            img.style.setProperty("opacity", "1", "important");
            img.style.setProperty("visibility", "visible", "important");
          });
        }, index * 100);
      });

      const remainingHidden = hiddenItems.length - itemsToShow.length;
      if (remainingHidden <= 0) {
        const loadMoreContainer = loadMoreBtn.closest(
          ".achievement-load-more-container"
        );
        if (loadMoreContainer) {
          loadMoreContainer.style.display = "none";
        }
      }
    });
  }
}

function setupSimpleScrollObserver() {
  const achievementSection = document.getElementById("achievements-showcase");

  if (achievementSection) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              forceFixAllImages();
            }, 100);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      }
    );

    observer.observe(achievementSection);
  }

  const galleryItems = document.querySelectorAll(".achievement-gallery-item");

  const itemObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const item = entry.target;

          const images = item.querySelectorAll(".achievement-main-image");
          images.forEach((img) => {
            img.style.setProperty("display", "block", "important");
            img.style.setProperty("opacity", "1", "important");
            img.style.setProperty("visibility", "visible", "important");
          });
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "20px",
    }
  );

  galleryItems.forEach((item) => {
    itemObserver.observe(item);
  });
}

function forceFixAllImages() {
  const allImages = document.querySelectorAll(".achievement-main-image");

  allImages.forEach((img, index) => {
    img.style.setProperty("display", "block", "important");
    img.style.setProperty("opacity", "1", "important");
    img.style.setProperty("visibility", "visible", "important");
    img.style.setProperty("width", "100%", "important");
    img.style.setProperty("height", "100%", "important");
    img.style.setProperty("object-fit", "cover", "important");
    img.style.setProperty("position", "relative", "important");
    img.style.setProperty("z-index", "1", "important");

    const container = img.closest(".achievement-image-container");
    if (container) {
      container.style.setProperty("display", "block", "important");
      container.style.setProperty("height", "220px", "important");
      container.style.setProperty("overflow", "hidden", "important");
    }

    const card = img.closest(".achievement-gallery-item");
    if (card && !card.classList.contains("item-hidden")) {
      card.style.setProperty("display", "block", "important");
    }
  });
}

window.achievementModalManager = {
  modal: null,
  modalTitle: null,
  modalImage: null,

  init: function () {
    this.modal = document.getElementById("achievement-detail-modal");
    this.modalTitle = document.getElementById("achievement-modal-title");
    this.modalImage = document.getElementById("achievement-modal-image");

    if (!this.modal) return;

    // Close when clicking the overlay backdrop
    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) {
        this.closeModal();
      }
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.modal.classList.contains("modal-active")) {
        this.closeModal();
      }
    });

    // Click delegation: any card in the gallery opens the modal
    const gallery = document.getElementById("achievement-items-container");
    if (gallery) {
      gallery.addEventListener("click", (e) => {
        const card = e.target.closest(".achievement-card-wrapper");
        if (!card) return;

        const img = card.querySelector(".achievement-main-image");
        const titleEl = card.querySelector(".achievement-title-text");
        const issuerEl = card.querySelector(".achievement-issuer-name");
        const dateEl = card.querySelector(".achievement-date-info");

        this.openModal(
          img ? img.src : "",
          titleEl ? titleEl.textContent.trim() : "Certificate Details",
          issuerEl ? issuerEl.textContent.trim() : "",
          dateEl ? dateEl.textContent.trim() : ""
        );
      });
    }
  },

  openModal: function (imgSrc, title, issuer, date) {
    if (!this.modal) return;

    if (this.modalTitle) {
      this.modalTitle.textContent = title || "Certificate Details";
    }
    if (this.modalImage) {
      this.modalImage.src = imgSrc;
      this.modalImage.alt = title || "Certificate";
    }

    this.modal.classList.add("modal-active");
    document.body.style.overflow = "hidden";
  },

  closeModal: function () {
    if (!this.modal) return;
    this.modal.classList.remove("modal-active");
    document.body.style.overflow = "";
  },
};

document.addEventListener("DOMContentLoaded", function () {
  achievementModalManager.init();
});

window.addEventListener("load", function () {
  setTimeout(() => {
    forceFixAllImages();
  }, 1000);
});

document.addEventListener("visibilitychange", function () {
  if (!document.hidden) {
    setTimeout(() => {
      forceFixAllImages();
    }, 500);
  }
});

let scrollFixTimer;
window.addEventListener(
  "scroll",
  function () {
    clearTimeout(scrollFixTimer);
    scrollFixTimer = setTimeout(() => {
      const achievementSection = document.getElementById(
        "achievements-showcase"
      );
      if (achievementSection) {
        const rect = achievementSection.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          forceFixAllImages();
        }
      }
    }, 500);
  },
  {
    passive: true,
  }
);
