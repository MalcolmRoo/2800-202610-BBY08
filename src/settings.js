// -----------------------------
// SETTINGS PAGE LOGIC (NO LANGUAGE SYSTEM)
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
  console.log("🔥 settings.js is running");

  // -----------------------------
  // SAVE / LOAD HELPERS
  // -----------------------------
  function saveSetting(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function loadSetting(key, defaultValue) {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  }

  // -----------------------------
  // APPLY ALL SETTINGS ON PAGE LOAD
  // -----------------------------
  function applySettings() {
    // Dark Mode
    if (loadSetting("darkMode", false)) {
      document.body.classList.add("dark");
    }

    // Large Text
    if (loadSetting("largeText", false)) {
      document.body.classList.add("large-text");
    }

    // High Contrast
    if (loadSetting("highContrast", false)) {
      document.body.classList.add("high-contrast");
    }

    // Color Blind Mode
    if (loadSetting("colorBlind", false)) {
      document.body.classList.add("color-blind");
    }

    // Confidence Slider
    const confidence = loadSetting("confidence", 0.7);
    const slider = document.getElementById("confidenceSlider");
    const valueDisplay = document.getElementById("confidenceValue");

    if (slider) slider.value = confidence;
    if (valueDisplay) valueDisplay.textContent = confidence;

    // Edible‑Only Mode
    const edibleToggle = document.getElementById("edibleOnlyToggle");
    if (edibleToggle) {
      edibleToggle.checked = loadSetting("edibleOnly", false);
    }
  }

  applySettings();

  // -----------------------------
  // EVENT LISTENERS
  // -----------------------------

  // DARK MODE
  const darkToggle = document.getElementById("darkModeToggle");
  if (darkToggle) {
    darkToggle.addEventListener("change", (e) => {
      saveSetting("darkMode", e.target.checked);
      document.body.classList.toggle("dark", e.target.checked);
    });
  }

  // LARGE TEXT
  const largeToggle = document.getElementById("largeTextToggle");
  if (largeToggle) {
    largeToggle.addEventListener("change", (e) => {
      saveSetting("largeText", e.target.checked);
      document.body.classList.toggle("large-text", e.target.checked);
    });
  }

  // HIGH CONTRAST
  const contrastToggle = document.getElementById("highContrastToggle");
  if (contrastToggle) {
    contrastToggle.addEventListener("change", (e) => {
      saveSetting("highContrast", e.target.checked);
      document.body.classList.toggle("high-contrast", e.target.checked);
    });
  }

  // COLOR BLIND MODE
  const colorBlindToggle = document.getElementById("colorBlindToggle");
  if (colorBlindToggle) {
    colorBlindToggle.addEventListener("change", (e) => {
      saveSetting("colorBlind", e.target.checked);
      document.body.classList.toggle("color-blind", e.target.checked);
    });
  }

  // CONFIDENCE SLIDER
  const slider = document.getElementById("confidenceSlider");
  const valueDisplay = document.getElementById("confidenceValue");

  if (slider && valueDisplay) {
    slider.addEventListener("input", (e) => {
      const value = Number(e.target.value);
      saveSetting("confidence", value);
      valueDisplay.textContent = value;
    });
  }

  // EDIBLE‑ONLY MODE
  const edibleToggle = document.getElementById("edibleOnlyToggle");
  if (edibleToggle) {
    edibleToggle.addEventListener("change", (e) => {
      saveSetting("edibleOnly", e.target.checked);
    });
  }
});
