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

let selectedOrgan = "auto";

async function sendToPlantNet(imageBlob) {
  // ⭐ Reset override for new scan
  sessionStorage.removeItem("overrideConfidence");

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
    // ⭐ CONFIDENCE WARNING (soft filter)
    // -----------------------------
    const userThreshold = JSON.parse(localStorage.getItem("confidence")) || 0.7;
    const score = Number(data.score) / 100; // convert "85" → 0.85
    if (score < userThreshold) {
      const modal = document.createElement("div");
      modal.style = `
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  `;

      modal.innerHTML = `
    <div style="
      background: white;
      padding: 20px;
      border-radius: 10px;
      max-width: 300px;
      text-align: center;
    ">
      <h3>Low Confidence Warning</h3>
      <p>The model is only <strong>${data.score}%</strong> confident.</p>
      <p>Your threshold is <strong>${userThreshold * 100}%</strong>.</p>

      <button id="continue-btn" style="
        margin-top: 10px;
        padding: 10px 15px;
        background: #4caf50;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
      ">Show Anyway</button>

      <button id="cancel-btn" style="
        margin-top: 10px;
        padding: 10px 15px;
        background: #d9534f;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
      ">Cancel</button>
    </div>
  `;

      document.body.appendChild(modal);

      document.getElementById("continue-btn").onclick = () => {
        modal.remove();
        redirectToPlant(data);
      };

      document.getElementById("cancel-btn").onclick = () => {
        modal.remove();
        return;
      };

      return;
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

function redirectToPlant(data) {
  const params = new URLSearchParams({
    name: data.commonName,
    latin: data.scientificName,
    score: data.score,
  });

  window.location.href = `/plant?${params}`;
}
