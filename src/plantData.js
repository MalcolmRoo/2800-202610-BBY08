const params = new URLSearchParams(window.location.search);
const commonName = params.get("name") || "Unknown Plant";
const latinName = params.get("latin") || "";
const score = params.get("score") || "0";

document.getElementById("common-name").textContent = commonName;
document.getElementById("latin-name").textContent = latinName;
document.getElementById("confidence").textContent = score + "%";

function displayPlant(plantData) {
  const edibilityInfo = document.getElementById("edibility-info");
  edibilityInfo.textContent = plantData.description || "No edibility information available.";

  document.getElementById("how-to-info").textContent = 
    plantData.servingSuggestion || "Wash thoroughly before use.";

  document.getElementById("hazard-info").textContent = 
    plantData.hazards || "No known hazards.";

  const statusEl = document.getElementById("stat-status");
  const edibleEl = document.getElementById("stat-edible");
  const plantIcon = document.getElementById("plant-icon");
  const label = document.querySelector(".label");

  if (plantData.safe !== undefined) {
    statusEl.textContent = plantData.safe ? "Safe" : "Toxic";
    statusEl.className = "stat-value " + (plantData.safe ? "safe" : "danger");
  }

  if (plantData.isEdible !== undefined || plantData.edible !== undefined) {
    const isEdible = plantData.isEdible !== undefined ? plantData.isEdible : plantData.edible;
    edibleEl.textContent = isEdible ? "Yes" : "No";
    edibleEl.className = "stat-value " + (isEdible ? "safe" : "danger");
  }

  if (plantData.safe === false) {
    plantIcon.classList.add("danger");
    label.classList.add("danger");
  } else {
    plantIcon.classList.remove("danger");
    label.classList.remove("danger");
  }

  if (plantData.image) {
    const img = document.getElementById("plant-image");
    img.src = plantData.image;
    img.style.display = "block";
  }
}

const mockData = {
  isEdible: false,
  safe: false,
  description: "Common edible plant found in urban areas.",
  servingSuggestion: "Wash thoroughly before eating. Best raw in salads or cooked.",
  hazards: "None known. May cause mild upset if eaten in large quantities.",
  image: null,
};

displayPlant(mockData);