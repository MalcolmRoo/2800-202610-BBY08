async function identifyAndFetchDetails(imageData) {
  // 1. Identify with PlantNet
  const formData = new FormData();
  formData.append("image", imageData);

  const identifyRes = await fetch("/api/identify", {
    method: "POST",
    body: formData,
  });

  const identifyData = await identifyRes.json();
  const scientificName = identifyData.scientificName;
  const commonName = identifyData.commonName;

  // 2. Search PermaPeople (POST, JSON body)
  const searchRes = await fetch("/api/permapeople/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: scientificName || commonName }),
  });

  const searchData = await searchRes.json();
  const first = searchData.plants?.[0]; //if things on the left of ? exist, access the thing on the right, otherwise return undefined

  let permaData = {};

  // 3. If a plant was found, fetch full details
  if (first) {
    const plantRes = await fetch(`/api/permapeople/plants/${first.id}`); //{ method: "GET" } can be omitted since its the default of fetch
    permaData = await plantRes.json();
  }

  // 4. Parse PermaPeople data
  const plant = parsePerma(permaData);

  return plant;
}


function parsePerma(perma) {
  const plant = {
    commonName: perma.name || "Unknown",
    scientificName: perma.scientific_name || "Unknown",
    family: "Unknown",
    edible: false,
    edibleParts: [],
    toxicity: "unknown",
    uses: [],
    image: perma.images?.thumb || "",
  };

  if (Array.isArray(perma.data)) {
    for (const item of perma.data) {
      const key = item.key.toLowerCase();

      if (key === "family") {
        plant.family = item.value;
      }

      if (key === "edible") {
        plant.edible = item.value === "true";
      }

      if (key === "edible parts") {
        plant.edibleParts = item.value.split(",").map((s) => s.trim());
      }

      if (key === "edible uses") {
        plant.uses.push(item.value);
      }

      if (key === "toxicity") {
        plant.toxicity = item.value;
      }
    }
  }

  return plant;
}

function isEdible(plant) {
  if (plant.isVegetable) return true;
  if (plant.edibleParts.length > 0) return true;
  return false;
}

function displayPlant(plant) {
  document.getElementById("name").textContent = plant.name || "Unknown";
  document.getElementById("latinName").textContent =
    plant.latinName || "Unknown";
  document.getElementById("family").textContent = plant.family || "Unknown";

  if (plant.image) {
    document.getElementById("image").src = plant.image;
  }

  document.getElementById("edible").textContent = plant.edible
    ? "Edible"
    : "Not edible";

  document.getElementById("edibleParts").textContent =
    plant.edibleParts.length > 0 ? plant.edibleParts.join(", ") : "None listed";
}
