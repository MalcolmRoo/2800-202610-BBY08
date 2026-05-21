document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("fileInput");
  if (fileInput) {
    fileInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        console.log("File selected successfully:", file.name);
        // Call function
        sendToPlantNet(file);
        // Reset so you can upload the same file again if needed
        event.target.value = "";
      }
    });
  }
});

let selectedOrgan = "leaf";

async function sendToPlantNet(imageBlob) {
  // Show loading overlay
  const loader = document.getElementById("loading-overlay");
  // Show the dark overlay
  if (loader) loader.classList.add("visible");

  const formData = new FormData();
  formData.append("image", imageBlob, "plant.jpg");
  formData.append("organ", selectedOrgan);

  try {
    const response = await fetch("/api/identify", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Identification failed");

    // -----------------------------
    // ⭐ CONFIDENCE THRESHOLD LOGIC
    // -----------------------------
    const userThreshold = JSON.parse(localStorage.getItem("confidence")) || 0.7;
    const score = Number(data.score) / 100; // convert "85" → 0.85
    if (score < userThreshold) {
      alert(
        `Confidence too low.\n\nModel confidence: ${data.score}%\nYour threshold: ${
          userThreshold * 100
        }%`,
      );
      return; // stop here, do NOT redirect
    }

    // -----------------------------
    // 🌿 DISEASE CHECK
    // -----------------------------
    // Send image + plant name to disease endpoint
    // PlantNet checks image, Groq names the disease
    let diseaseData = { diseaseFound: false };
    try {
      const diseaseFormData = new FormData();
      diseaseFormData.append("image", imageBlob, "plant.jpg");
      diseaseFormData.append("plantName", data.commonName);
      diseaseFormData.append("latinName", data.scientificName);

      const diseaseResponse = await fetch("/api/identify-disease", {
        method: "POST",
        body: diseaseFormData,
      });
      diseaseData = await diseaseResponse.json();
    } catch (diseaseErr) {
      console.log("[UPLOAD] Disease check failed:", diseaseErr);
    }

    const params = new URLSearchParams({
      name: data.commonName,
      latin: data.scientificName,
      score: data.score,
    });

    // Add disease to URL only if found
    if (diseaseData.diseaseFound) {
      params.append("disease", diseaseData.diseaseName);
      params.append("diseaseWarning", diseaseData.shortWarning || "");
    }

    window.location.href = `/plant?${params}`;
  } catch (err) {
    alert("Could not identify plant. Try again or upload a different image.");
    //document.getElementById("loading-overlay").style.display = "none";
  } finally {
    // Hide the overlay when done (success or failure)
    if (loader) loader.classList.remove("visible");
  }
}
