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
  if (loader) {
    loader.classList.add("visible");
  }

  const formData = new FormData();
  formData.append("image", imageBlob, "plant.jpg");
  formData.append("organ", selectedOrgan);

  try {
    const response = await fetch("/api/identify", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Identification failed");
    }

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

    const params = new URLSearchParams({
      name: data.commonName,
      latin: data.scientificName,
      score: data.score,
    });

    window.location.href = `/plant?${params}`;
  } catch (err) {
    alert("Could not identify plant. Try again or upload a different image.");
    //document.getElementById("loading-overlay").style.display = "none";
  } finally {
    // Hide the overlay when done (success or failure)
    if (loader) {
      // Remove the .visible class to hide it
      loader.classList.remove("visible");
    }
  }
}
