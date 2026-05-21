// Read URL params passed from PlantNet redirect
const params = new URLSearchParams(window.location.search);
const commonName = params.get("name") || "Unknown Plant";
const latinName = params.get("latin") || "";
const score = params.get("score") || "0";


// Fill in PlantNet data immediately on page load
document.getElementById("common-name").textContent = commonName;
document.getElementById("latin-name").textContent = latinName;
document.getElementById("confidence").textContent = score + "%";

// ⭐ APPLY CONFIDENCE THRESHOLD ON RESULT PAGE
const userThreshold = Number(localStorage.getItem("confidence")) || 0.5;

const warningBox = document.getElementById("confidence-warning");

// If below threshold AND user has NOT chosen to show anyway

const override = sessionStorage.getItem("overrideConfidence") === latinName;

if (Number(score) / 100 < userThreshold && !override) {
  warningBox.innerHTML = `
    <div class="info-card hazard">
      <h2>Low Confidence Warning</h2>
      <p>The model was only <strong>${score}%</strong> confident.</p>
      <p>Your threshold is <strong>${userThreshold * 100}%</strong>.</p>
      <p>This identification may be incorrect. Please scan again or use a clearer photo.</p>

      <button id="show-anyway-btn" style="
        margin-top: 10px;
        padding: 10px 15px;
        background: #4caf50;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
      ">Show Anyway</button>
    </div>
  `;

  document.getElementById("show-anyway-btn").onclick = () => {
    sessionStorage.setItem("overrideConfidence", latinName);
    location.reload();
  };

  throw new Error("Low confidence — waiting for user override");
}

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

    //If there is toxic look-alike a warning is applied
    if (data.trigger_warning) {

      renderWarning(data);

    };

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

  //Assigning Local Data to variables
  const isLocal = data.is_local;
  const localData = data.local_data;

  // Plant image from Permapeople CDN — as hero panel background
  if (data.images?.title) {
    const heroPanel = document.getElementById("hero-panel");
    heroPanel.style.backgroundImage = `url(${data.images.title})`;
    // Also set on #plant-image so initFavButton can read it
    const plantImg = document.getElementById('plant-image');
    if (plantImg) plantImg.src = data.images.title;
    if (typeof saveImage === 'function' && latinName) {
      saveImage(latinName, data.images.title);
    }
  }

  // Edibility
  const edibleRaw = getField(d, "Edible");
  const edibleParts = getField(d, "Edible parts");
  const edibleUses = getField(d, "Edible uses");
  console.log("Edible raw value:", edibleRaw);

  

  const isEdibleFlag =
    edibleRaw?.toLowerCase() === "true" ||
    edibleRaw === "1" ||
    edibleRaw?.toLowerCase() === "yes";

  const hasEdibleParts =
    edibleParts !== null &&
    edibleParts !== undefined &&
    String(edibleParts).trim() !== "";

  const isEdible = isEdibleFlag || hasEdibleParts;
  
  // Update stats bar — no duplicate edibility text in sections
  const statusEl = document.getElementById("stat-status");
  const edibleEl = document.getElementById("stat-edible");
  const plantIcon = document.getElementById("plant-icon");
  const plantLabel = document.getElementById("plant-label");

   // 🔥 EDIBLE‑ONLY MODE FILTER
  const edibleOnly = JSON.parse(localStorage.getItem("edibleOnly")) || false;

  if (edibleOnly && !isEdible) {
    document.getElementById("plant-details").innerHTML = `
    <div class="info-card hazard">
      <h2>Filtered Out</h2>
      <p>This plant is toxic and has been removed because Edible‑Only Mode is ON.</p>
    </div>
  `;
    return;
  }

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
  else if (isLocal && localData.EdibleParts != "") //Local Database
    edibilityContent += `<p> ${localData.EdibleParts}</p>`;
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
  if (isLocal && localData.PreparationMethods != "") {
    howToContent += `<p><strong>Preparation Methods:</strong> ${localData.PreparationMethods}</p>`;
  }
  if (utility) howToContent += `<p><strong>Known Uses:</strong> ${utility}</p>`;
  addSection("How to Use", howToContent || null);

  // Known Hazards — warning styling applied
  const warning = getField(d, "Warning");
  const toxicity = getField(d, "Toxicity");
  let hazardContent = "";
  if (warning && !isLocal) hazardContent += `<p><strong>Warning:</strong> ${warning}</p>`;
  if(isLocal && localData.Warnings != "") //Local Database
    hazardContent += `<p><strong>Warning:</strong> ${warning}. ${localData.Warnings}</p>`;
  if (toxicity)
    hazardContent += `<p><strong>Toxicity:</strong> ${toxicity}</p>`;

  addSection("Known Hazards", hazardContent || null); // isHazard = true

  let extraNotes = "";
  if (isLocal && localData.Notes != "")
    extraNotes += `<p><strong>Additional Details:</strong> ${localData.Notes}`;
  addSection("Extra Notes", extraNotes);

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

  // Special alert for Apiaceae family, which includes deadly plants like poison hemlock
  const family = getField(d, "Family");
  if (family.toLowerCase().includes("apiaceae")) {
    const risk = document.querySelector(".risk");
    risk.style.display = "flex";
  }

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

// Initialize favorite button after plant is loaded
if (typeof initFavButton === 'function') {
  initFavButton(latinName || commonName);
}

//If plant has a toxic look-alike a warning will take over the screen
async function renderWarning(data) {
  const local = data.local_data;
  const overlay = document.getElementById('warning-overlay');
  const warnId = document.getElementById('identify-text');
  const safeName = document.getElementById('safe-name');
  const deadlyName = document.getElementById('deadly-name');
  const safeTip = document.getElementById('safe-tip');
  const deadlyTip = document.getElementById('deadly-tip');
  const safeImg = document.getElementById('safe-img');
  const deadlyImg = document.getElementById('deadly-img');

  // Inject the data into the tags
  warnId.innerText = "You have Identified " + local.PlantName + " there is a toxic look-alike that could be FATAL if consumed.";

  safeName.innerText = local.PlantName;
  deadlyName.innerText = local.LookAlike;

  safeImg.src = data.images.title;
  //new fetch for comparison image
  const lookAlikeImg = await fetchlookAlikeImg(local.lookAlikeInfo.ScientificName);
  deadlyImg.src = lookAlikeImg;

  safeTip.innerText = local.Identification;
  deadlyTip.innerText = local.lookAlikeInfo.Identification;

  // Show the overlay by changing the style
  overlay.style.display = 'flex';


  //close button
  document.getElementById('proceed-btn').onclick = () => {
    overlay.style.display = 'none';
  };
  //return to home if user is unsure
  document.getElementById('cancel-btn').onclick = () => {
    window.location.href = '/';
  }
}

//toxic plant image fetch using permapeople
async function fetchlookAlikeImg(scientificName) {
  try {
    //search Permapeople by scientific name
    const searchRes = await fetch("/api/permapeople/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: scientificName }),
    });

    const searchData = await searchRes.json();
    const first = searchData.plants?.[0];

    if (!first) return;

    //fetch full plant details using ID from search
    const plantRes = await fetch(`/api/permapeople/plants/${first.id}`);
    const data = await plantRes.json();

    return data.images.title;

  } catch (err) {
    console.error("Permapeople error:", err);
  }
}
