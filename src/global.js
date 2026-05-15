// -----------------------------
// GLOBAL SETTINGS APPLIED TO ALL PAGES
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
  console.log("🌍 global.js running");

  // Load helper
  function loadSetting(key, defaultValue) {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  }

  // -----------------------------
  // APPLY ACCESSIBILITY SETTINGS
  // -----------------------------
  if (loadSetting("darkMode", false)) {
    document.body.classList.add("dark");
  }

  if (loadSetting("largeText", false)) {
    document.body.classList.add("large-text");
  }

  if (loadSetting("highContrast", false)) {
    document.body.classList.add("high-contrast");
  }

  if (loadSetting("colorBlind", false)) {
    document.body.classList.add("color-blind");
  }

  // -----------------------------
  // APPLY CONFIDENCE VALUE (OPTIONAL)
  // -----------------------------
  const confidenceValue = loadSetting("confidence", null);
  const confidenceDisplay = document.getElementById("confidenceValue");
  if (confidenceDisplay && confidenceValue !== null) {
    confidenceDisplay.textContent = confidenceValue;
  }

  // -----------------------------
  // APPLY "Back to Home" TEXT (STATIC)
  // -----------------------------
  const homeLink = document.querySelector(".home-link");
  if (homeLink) homeLink.textContent = "Back to Home";
});
