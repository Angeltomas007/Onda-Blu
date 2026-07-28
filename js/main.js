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

// Destination chips + interactive map pins share one route selection state:
// a first click/tap (pin or chip) sets the departure, a second sets the arrival.
const toSelect = document.querySelector('select[name="to"]');
const fromSelect = document.querySelector('select[name="from"]');
const subjectInput = document.querySelector('input[name="subject"]');
const routeSummary = document.getElementById("route-summary");

let fromPin = null;
let toPin = null;
let fromLabel = null;
let toLabel = null;
let activeChip = null;

const pinLabel = (pin) => pin.querySelector("span").textContent.trim();
const panelOf = (pin) => pin.closest(".map-panel-body");
const pinPoint = (pin) => ({
  x: (parseFloat(pin.style.left) / 100) * 300,
  y: (parseFloat(pin.style.top) / 100) * 170,
});

function updateSummary() {
  if (!routeSummary) return;
  if (fromLabel && toLabel) routeSummary.textContent = `${fromLabel} → ${toLabel}`;
  else if (fromLabel) routeSummary.textContent = `${fromLabel} → …`;
  else if (toLabel) routeSummary.textContent = `… → ${toLabel}`;
  else routeSummary.textContent = "";
}

function drawRoute(panel, p1, p2) {
  const svg = panel.querySelector(".map-route");
  if (!svg) return;
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", `M${p1.x} ${p1.y} L${p2.x} ${p2.y}`);
  svg.appendChild(path);
  requestAnimationFrame(() => path.classList.add("visible"));
}

function resetRoute() {
  if (fromPin) fromPin.classList.remove("is-from");
  if (toPin) toPin.classList.remove("is-to");
  if (activeChip) activeChip.classList.remove("chip-active");
  document.querySelectorAll(".map-route path").forEach((path) => path.remove());
  fromPin = null;
  toPin = null;
  fromLabel = null;
  toLabel = null;
  activeChip = null;
  updateSummary();
}

function setFrom(label, pin) {
  if (fromPin) fromPin.classList.remove("is-from");
  fromPin = pin || null;
  fromLabel = label;
  if (fromPin) fromPin.classList.add("is-from");
  if (fromSelect) fromSelect.value = label;
  updateSummary();
}

function setTo(label, pin, chip) {
  if (toPin) toPin.classList.remove("is-to");
  if (activeChip) activeChip.classList.remove("chip-active");
  toPin = pin || null;
  activeChip = chip || null;
  toLabel = label;
  if (toPin) toPin.classList.add("is-to");
  if (activeChip) activeChip.classList.add("chip-active");
  if (toSelect) toSelect.value = label;
  updateSummary();

  if (fromPin && toPin && panelOf(fromPin) === panelOf(toPin)) {
    drawRoute(panelOf(fromPin), pinPoint(fromPin), pinPoint(toPin));
  }

  document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
}

document.querySelectorAll(".map-pin").forEach((pin) => {
  pin.addEventListener("click", () => {
    if (pin === fromPin || pin === toPin) {
      resetRoute();
      return;
    }
    if (!fromLabel) {
      setFrom(pinLabel(pin), pin);
      return;
    }
    if (!toLabel) {
      setTo(pinLabel(pin), pin, null);
      return;
    }
    resetRoute();
    setFrom(pinLabel(pin), pin);
  });
});

document.querySelectorAll(".dest-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    if (chip.dataset.selectTo) {
      setTo(chip.dataset.selectTo, null, chip);
    } else if (chip.hasAttribute("data-fill-subject") && subjectInput) {
      subjectInput.value = chip.textContent.trim();
      document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
    }
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
