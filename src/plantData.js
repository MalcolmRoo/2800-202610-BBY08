// Read URL params from PlantNet redirect
const params = new URLSearchParams(window.location.search);
const commonName = params.get("name") || "Unknown Plant";
const latinName = params.get("latin") || "";
const score = params.get("score") || "0";

// Fill in plant info from PlantNet
document.getElementById("common-name").textContent = commonName;
document.getElementById("latin-name").textContent = latinName;
document.getElementById("confidence").textContent = score + "% confident";

// Display plant data
function displayPlant(plantData) {
  // Update edibility section - just text description
  const edibilityInfo = document.getElementById("edibility-info");
  edibilityInfo.textContent = plantData.description || "No edibility information available.";

  // Update how to use
  document.getElementById("how-to-info").textContent = 
    plantData.servingSuggestion || "Wash thoroughly before use.";

  // Update hazards
  document.getElementById("hazard-info").textContent = 
    plantData.hazards || "No known hazards.";

  // Update plant image if available
  if (plantData.image) {
    const img = document.getElementById("plant-image");
    img.src = plantData.image;
    img.style.display = "block";
  }
}

// Mock plant data (placeholder until real API is connected)
const mockData = {
  isEdible: true,
  description: "Common edible plant found in urban areas.",
  servingSuggestion: "Wash thoroughly before eating. Best raw in salads or cooked.",
  hazards: "None known. May cause mild upset if eaten in large quantities.",
  image: null,
};

// Display the plant data
displayPlant(mockData);