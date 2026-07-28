document.getElementById("year").textContent = new Date().getFullYear();

// Navbar background on scroll
const navbar = document.getElementById("navbar");
const navLinks = document.getElementById("nav-links");
const navToggle = document.getElementById("nav-toggle");

const onScroll = () => {
  navbar.classList.toggle("scrolled", window.scrollY > 40);
};
document.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Mobile nav toggle
navToggle.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});
navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => navLinks.classList.remove("open"));
});

// Hero parallax
const heroBg = document.getElementById("hero-bg");
document.addEventListener("scroll", () => {
  const y = window.scrollY;
  if (y < window.innerHeight) {
    heroBg.style.transform = `translateY(${y * 0.35}px)`;
  }
}, { passive: true });

// Reveal on scroll
const revealItems = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
revealItems.forEach((item) => revealObserver.observe(item));

// Fleet gallery lightbox
const lightbox = document.getElementById("lightbox");
const lightboxClose = document.getElementById("lightbox-close");
document.querySelectorAll(".gallery-item").forEach((item) => {
  item.addEventListener("click", () => {
    lightbox.classList.add("open");
  });
});
lightboxClose.addEventListener("click", () => lightbox.classList.remove("open"));
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) lightbox.classList.remove("open");
});

// Destination chips: jump to the booking form and pre-fill it
const toSelect = document.querySelector('select[name="to"]');
const subjectInput = document.querySelector('input[name="subject"]');
document.querySelectorAll(".dest-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    if (chip.dataset.selectTo && toSelect) {
      toSelect.value = chip.dataset.selectTo;
    } else if (chip.hasAttribute("data-fill-subject") && subjectInput) {
      subjectInput.value = chip.textContent.trim();
    }
    document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
  });
});

// Contact form (static placeholder submit — wire to a backend/service later)
const form = document.getElementById("contact-form");
const formNote = document.getElementById("form-note");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const lang = document.documentElement.lang;
  formNote.textContent = (translations[lang] || translations.en)["form.successNote"];
  form.reset();
});
