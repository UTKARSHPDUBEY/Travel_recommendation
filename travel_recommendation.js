// ─── Travel Recommendation JS ────────────────────────────────────────────────

const API_URL = "travel_recommendation_api.json";

async function fetchData() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Failed to load travel data.");
  return res.json();
}

// ── TIME HELPER ──────────────────────────────────────────────────────────────

const TIMEZONE_MAP = {
  "sydney":           "Australia/Sydney",
  "melbourne":        "Australia/Melbourne",
  "australia":        "Australia/Sydney",
  "tokyo":            "Asia/Tokyo",
  "kyoto":            "Asia/Tokyo",
  "japan":            "Asia/Tokyo",
  "rio":              "America/Sao_Paulo",
  "rio de janeiro":   "America/Sao_Paulo",
  "sao paulo":        "America/Sao_Paulo",
  "são paulo":        "America/Sao_Paulo",
  "brazil":           "America/Sao_Paulo",
  "angkor wat":       "Asia/Phnom_Penh",
  "cambodia":         "Asia/Phnom_Penh",
  "taj mahal":        "Asia/Kolkata",
  "india":            "Asia/Kolkata",
  "bora bora":        "Pacific/Tahiti",
  "french polynesia": "Pacific/Tahiti",
  "copacabana":       "America/Sao_Paulo",
};

function getLocalTime(locationName) {
  const key = locationName.toLowerCase().trim();
  const tz = TIMEZONE_MAP[key] || null;
  if (!tz) return null;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour:   "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(new Date());
}

// ── CARD BUILDER ─────────────────────────────────────────────────────────────
// Accepts an item object {name, description, imageUrl}

function buildCard(item) {
  return `
    <div class="rec-card">
      <img src="${item.imageUrl}" alt="${item.name}"
           onerror="this.src='https://placehold.co/800x400?text=No+Image'">
      <div class="rec-card-body">
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <button class="btn visit-btn">Visit</button>
      </div>
    </div>`;
}

// ── RENDER RESULTS ───────────────────────────────────────────────────────────
// Accepts an array of item objects

function showResults(items) {
  let panel = document.getElementById("results-panel");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "results-panel";
    panel.className = "results-panel";
    document.querySelector(".hero").appendChild(panel);
  }

  if (!items.length) {
    panel.innerHTML = `<p class="no-results">No results found. Try: beaches, temples, Japan, Sydney…</p>`;
    return;
  }

  // Time banner uses the first result's location
  const firstKey = items[0].name.split(",")[0];
  const firstTime = getLocalTime(firstKey);
  const timeBanner = firstTime
    ? `<div class="time-banner">🕐 Current Local Time (${firstKey}): ${firstTime}</div>`
    : "";

  panel.innerHTML = timeBanner + items.map(buildCard).join("");
}

function clearResults() {
  const panel = document.getElementById("results-panel");
  if (panel) panel.remove();
}

// ── SEARCH LOGIC ─────────────────────────────────────────────────────────────

async function handleSearch() {
  const input = document.querySelector(".search input[type='search']");
  const query = (input?.value || "").trim().toLowerCase();

  if (!query) {
    alert("Please enter a destination or keyword to search.");
    return;
  }

  let data;
  try {
    data = await fetchData();
  } catch (e) {
    alert("Could not load travel data. Make sure travel_recommendation_api.json is in the same folder and you're running a local server.");
    return;
  }

  // Beach keyword
  if (query.includes("beach") || query.includes("beaches")) {
    return showResults(data.beaches);
  }

  // Temple keyword
  if (query.includes("temple") || query.includes("temples")) {
    return showResults(data.temples);
  }

  // Country / city / name search
  const allItems = [
    ...data.countries.flatMap(c => c.cities),
    ...data.temples,
    ...data.beaches,
  ];

  // Match by country name first
  let results = [];
  data.countries.forEach(country => {
    if (country.name.toLowerCase().includes(query) || query.includes(country.name.toLowerCase())) {
      results.push(...country.cities);
    }
  });

  // If no country match, search all items by name
  if (!results.length) {
    results = allItems.filter(item =>
      item.name.toLowerCase().includes(query)
    );
  }

  if (results.length) {
    showResults(results);
  } else {
    showResults([]);
  }
}

// ── CLEAR BUTTON ─────────────────────────────────────────────────────────────

function handleClear() {
  const input = document.querySelector(".search input");
  if (input) input.value = "";
  clearResults();
}

// ── CONTACT FORM ─────────────────────────────────────────────────────────────

function setupContactForm() {
  const form = document.querySelector(".contact-form");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const name    = form.querySelector("input[name='name']")?.value.trim();
    const email   = form.querySelector("input[name='email']")?.value.trim();
    const message = form.querySelector("textarea[name='message']")?.value.trim();

    if (!name || !email || !message) {
      alert("Please fill in all fields before submitting.");
      return;
    }

    form.innerHTML = `
      <div class="form-success">
        <h3>✅ Thank you, ${name}!</h3>
        <p>We've received your message and will get back to you at <strong>${email}</strong> shortly.</p>
      </div>`;
  });
}

// ── EVENT LISTENERS ───────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".search .btn:not(.clear)")
    ?.addEventListener("click", handleSearch);

  document.querySelector(".search input[type='search']")
    ?.addEventListener("keydown", e => { if (e.key === "Enter") handleSearch(); });

  document.querySelector(".search .btn.clear")
    ?.addEventListener("click", handleClear);

  setupContactForm();
});