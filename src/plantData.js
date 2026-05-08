// Read URL params passed from PlantNet redirect
const params = new URLSearchParams(window.location.search);
const commonName = params.get("name") || "Unknown Plant";
const latinName = params.get("latin") || "";
const score = params.get("score") || "0";

// Fill in PlantNet data immediately on page load
document.getElementById("common-name").textContent = commonName;
document.getElementById("latin-name").textContent = latinName;
document.getElementById("confidence").textContent = score + "%";

// Helper — finds a value from Permapeople's key-value data array
function getField(dataArray, key) {
  const found = dataArray.find((item) => item.key === key);
  return found ? found.value : null;
}

// Helper — creates and appends a styled card section to plant-details div
// Skips section entirely if no content provided
function addSection(title, content, isHazard = false) {
  if (!content) return;

  let icon = "";
  if (title === "Edibility") {
    icon =
      '<div class="card-icon-badge"><img src="/fork-and-knife.png" width="18" height="18" alt="edibility icon" /></div>';
  } else if (title === "How to Use") {
    icon =
      '<div class="card-icon-badge"><img src="/mortar.png" width="18" height="18" alt="preparation icon" /></div>';
  } else if (title === "Known Hazards") {
    icon =
      '<div class="card-icon-badge"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>';
  } else if (title === "Plant Info") {
    icon =
      '<div class="card-icon-badge"><img src="/information-button.png" width="18" height="18" alt="plant info icon" /></div>';
  }

  const section = document.createElement("div");
  section.className = isHazard ? "info-card hazard" : "info-card";
  section.innerHTML = `${icon}<h2>${title}</h2>${content}`;
  document.getElementById("plant-details").appendChild(section);
}

// Fetches plant data from Permapeople using scientific name from PlantNet
async function fetchPermapeople(scientificName) {
  try {
    // Step 1 — search Permapeople by scientific name
    const searchRes = await fetch("/api/permapeople/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: scientificName }),
    });

    const searchData = await searchRes.json();
    const first = searchData.plants?.[0];

    if (!first) return;

    // Step 2 — fetch full plant details using ID from search
    const plantRes = await fetch(`/api/permapeople/plants/${first.id}`);
    const data = await plantRes.json();

    // Step 3 — display the data
    displayPlant(data);
  } catch (err) {
    console.error("Permapeople error:", err);
  }
}

// Renders all plant data sections dynamically onto the result screen
function displayPlant(data) {
  const d = data.data || [];
  const details = document.getElementById("plant-details");
  details.innerHTML = "";

  // Plant image from Permapeople CDN — larger image below
  if (data.images?.title) {
    const img = document.getElementById("plant-image");
    img.src = data.images.title;
    img.style.display = "block";
  }

  // Edibility
  const edibleRaw = getField(d, "Edible");
  const isEdible =
    edibleRaw?.toLowerCase() === "true" ||
    edibleRaw === "1" ||
    edibleRaw?.toLowerCase() === "yes";
  const edibleParts = getField(d, "Edible parts");
  const edibleUses = getField(d, "Edible uses");
  console.log("Edible raw value:", edibleRaw);
  // Update stats bar — no duplicate edibility text in sections
  const statusEl = document.getElementById("stat-status");
  const edibleEl = document.getElementById("stat-edible");
  const plantIcon = document.getElementById("plant-icon");
  const plantLabel = document.getElementById("plant-label");

  if (isEdible) {
    statusEl.textContent = "Safe";
    statusEl.className = "stat-value safe"; // green color
    edibleEl.textContent = "Yes";
    edibleEl.className = "stat-value safe"; // green color
  } else {
    statusEl.textContent = "Toxic";
    statusEl.className = "stat-value danger"; // red color
    edibleEl.textContent = "No";
    edibleEl.className = "stat-value danger"; // red color
    plantIcon.classList.add("danger"); // red circle border
    plantLabel.classList.add("danger"); // red "IDENTIFIED PLANT" text
  }

  // Edible parts and uses only — badge already shown in stats bar
  let edibilityContent = "";
  if (edibleParts)
    edibilityContent += `<p><strong>Parts:</strong> ${edibleParts}</p>`;
  if (edibleUses)
    edibilityContent += `<p><strong>Uses:</strong> ${edibleUses}</p>`;
  if (!edibleParts && !edibleUses)
    edibilityContent = `<p>${isEdible ? "This plant is edible." : "This plant is not edible."}</p>`;
  addSection("Edibility", edibilityContent);

  // How to Use — first 2 paragraphs for edible plants only + utility
  const utility = getField(d, "Utility");
  const description = data.description;
  let howToContent = "";
  if (isEdible && description) {
    const paragraphs = description.split("\r\n\r\n").slice(0, 2).join(" ");
    howToContent += `<p>${paragraphs}</p>`;
  }
  if (utility) howToContent += `<p><strong>Known Uses:</strong> ${utility}</p>`;
  addSection("How to Use", howToContent || null);

  // Known Hazards — warning styling applied
  const warning = getField(d, "Warning");
  const toxicity = getField(d, "Toxicity");
  let hazardContent = "";
  if (warning) hazardContent += `<p><strong>Warning:</strong> ${warning}</p>`;
  if (toxicity)
    hazardContent += `<p><strong>Toxicity:</strong> ${toxicity}</p>`;
  addSection("Known Hazards", hazardContent || null, true); // isHazard = true

  // Plant Info
  const infoKeys = [
    "Life cycle",
    "Height",
    "Light requirement",
    "Water requirement",
    "Soil type",
    "Family",
    "Growth",
    "Leaves",
    "Medicinal",
  ];
  let infoContent = "";
  infoKeys.forEach((key) => {
    const val = getField(d, key);
    if (val) {
      const displayVal =
        key === "Height" ? `${val}m` : key === "Medicinal" ? "Yes" : val;
      infoContent += `<p><strong>${key}:</strong> ${displayVal}</p>`;
    }
  });
  addSection("Plant Info", infoContent || null);

  // Permapeople link — data.link is the plant's path returned by Permapeople
  if (data.link) {
    const linkSection = document.createElement("div");
    linkSection.className = "info-card";
    linkSection.innerHTML = `
    <h2>Learn More</h2>
    <a href="https://permapeople.org${data.link}" 
       target="_blank" 
       rel="noopener noreferrer"
       style="color: var(--accent); font-size: 15px;">
      View full plant profile on Permapeople →
    </a>
  `;
    document.getElementById("plant-details").appendChild(linkSection);
  }
}

// Kick off Permapeople fetch using latin name from PlantNet
if (latinName) {
  fetchPermapeople(latinName);
}
