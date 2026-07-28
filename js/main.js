document.getElementById("year").textContent = new Date().getFullYear();

// Guess the visitor's phone country code from their browser locale — no
// location permission prompt needed, works instantly, respects privacy.
const localeToDialCode = {
  FR: "+33", MC: "+377", IT: "+39", GB: "+44", CH: "+41", DE: "+49",
  BE: "+32", NL: "+31", ES: "+34", US: "+1", AE: "+971", RU: "+7",
};
const phoneCountrySelect = document.querySelector('select[name="phoneCountry"]');
if (phoneCountrySelect) {
  const locale = navigator.language || (navigator.languages && navigator.languages[0]) || "";
  const region = locale.split("-")[1];
  const guessedCode = region && localeToDialCode[region.toUpperCase()];
  if (guessedCode && [...phoneCountrySelect.options].some((o) => o.value === guessedCode)) {
    phoneCountrySelect.value = guessedCode;
  }

  // Refine with an IP-based lookup (more accurate than locale for where the
  // visitor actually is) — best-effort, silently keeps the locale guess if
  // the request fails, is slow, or the visitor blocks it.
  const ipLookupController = new AbortController();
  const ipLookupTimeout = setTimeout(() => ipLookupController.abort(), 4000);
  fetch("https://ipapi.co/json/", { signal: ipLookupController.signal })
    .then((res) => res.json())
    .then((data) => {
      const ipCode = data && data.country_code && localeToDialCode[data.country_code.toUpperCase()];
      if (ipCode && [...phoneCountrySelect.options].some((o) => o.value === ipCode)) {
        phoneCountrySelect.value = ipCode;
      }
    })
    .catch(() => {})
    .finally(() => clearTimeout(ipLookupTimeout));
}

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
const routeWhatsapp = document.getElementById("route-whatsapp");

const WHATSAPP_NUMBER = "33619450257";
const currentDict = () => translations[document.documentElement.lang] || translations.en;
const waLink = (text) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

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
  if (routeSummary) {
    if (fromLabel && toLabel) routeSummary.textContent = `${fromLabel} → ${toLabel}`;
    else if (fromLabel) routeSummary.textContent = `${fromLabel} → …`;
    else if (toLabel) routeSummary.textContent = `… → ${toLabel}`;
    else routeSummary.textContent = "";
  }

  if (routeWhatsapp) {
    if (fromLabel && toLabel) {
      const dict = currentDict();
      const message = [
        dict["whatsapp.intro"],
        `${dict["form.fromPlaceholder"]}: ${fromLabel}`,
        `${dict["form.toPlaceholder"]}: ${toLabel}`,
      ].join("\n");
      routeWhatsapp.href = waLink(message);
      routeWhatsapp.style.display = "";
    } else {
      routeWhatsapp.style.display = "none";
    }
  }
}

function drawRoute(panel, p1, p2) {
  const svg = panel.querySelector(".map-route");
  if (!svg) return;
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", `M${p1.x} ${p1.y} L${p2.x} ${p2.y}`);
  svg.appendChild(path);
  requestAnimationFrame(() => path.classList.add("visible"));
}

function zoomToPin(pin) {
  const panel = panelOf(pin);
  document.querySelectorAll(".map-panel-body").forEach((p) => {
    if (p !== panel) p.classList.remove("is-zoomed");
  });
  panel.style.transformOrigin = `${pin.style.left} ${pin.style.top}`;
  panel.classList.add("is-zoomed");
}

function unzoomAll() {
  document.querySelectorAll(".map-panel-body").forEach((p) => p.classList.remove("is-zoomed"));
}

let lastAutoSentPair = null;

function maybeAutoOpenWhatsApp() {
  if (!(fromLabel && toLabel)) return;
  const pairKey = `${fromLabel}→${toLabel}`;
  if (pairKey === lastAutoSentPair) return;
  lastAutoSentPair = pairKey;
  if (routeWhatsapp && routeWhatsapp.href) {
    window.open(routeWhatsapp.href, "_blank", "noopener");
  }
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
  lastAutoSentPair = null;
  unzoomAll();
  updateSummary();
}

function setFrom(label, pin) {
  if (fromPin) fromPin.classList.remove("is-from");
  fromPin = pin || null;
  fromLabel = label;
  if (fromPin) {
    fromPin.classList.add("is-from");
    zoomToPin(fromPin);
  }
  if (fromSelect) fromSelect.value = label;
  updateSummary();
  maybeAutoOpenWhatsApp();
}

function setTo(label, pin, chip) {
  if (toPin) toPin.classList.remove("is-to");
  if (activeChip) activeChip.classList.remove("chip-active");
  toPin = pin || null;
  activeChip = chip || null;
  toLabel = label;
  if (toPin) {
    toPin.classList.add("is-to");
    zoomToPin(toPin);
  }
  if (activeChip) activeChip.classList.add("chip-active");
  if (toSelect) toSelect.value = label;
  updateSummary();

  if (fromPin && toPin && panelOf(fromPin) === panelOf(toPin)) {
    drawRoute(panelOf(fromPin), pinPoint(fromPin), pinPoint(toPin));
  }

  document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
  maybeAutoOpenWhatsApp();
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

// Contact form: build a WhatsApp message from the fields and open a chat with it pre-filled
const form = document.getElementById("contact-form");
const formNote = document.getElementById("form-note");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const dict = currentDict();
  const data = new FormData(form);

  const lines = [dict["whatsapp.intro"]];
  const name = data.get("name");
  const phoneCountry = data.get("phoneCountry");
  const phone = data.get("phone");
  const fullPhone = phone ? `${phoneCountry} ${phone}`.trim() : "";
  const from = data.get("from");
  const to = data.get("to");
  const passengers = data.get("passengers");
  const subject = data.get("subject");
  const message = data.get("message");

  if (name) lines.push(`${dict["form.name"]}: ${name}`);
  if (fullPhone) lines.push(`${dict["form.phone"]}: ${fullPhone}`);
  if (from) lines.push(`${dict["form.fromPlaceholder"]}: ${from}`);
  if (to) lines.push(`${dict["form.toPlaceholder"]}: ${to}`);
  if (passengers) lines.push(`${dict["form.passengers"]}: ${passengers}`);
  if (subject) lines.push(`${dict["form.subject"]}: ${subject}`);
  if (message) lines.push(`${dict["form.message"]}: ${message}`);

  window.open(waLink(lines.join("\n")), "_blank", "noopener");

  formNote.textContent = dict["form.successNote"];
  form.reset();
});
