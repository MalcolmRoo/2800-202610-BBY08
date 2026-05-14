let VIDEO = null;
let CANVAS = null;
let CONTEXT = null;

document.addEventListener("DOMContentLoaded", function () {
  const SHUTTER = document.getElementById("shutterBtn");

  SHUTTER.addEventListener("click", (event) => {
    event.preventDefault();
    takePicture();
  });

  accessCamera();
});

async function accessCamera() {
    CANVAS = document.getElementById("camCanvas");
    CONTEXT = CANVAS.getContext("2d");

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Camera API is not supported. Ensure you are using HTTPS and a compatible mobile browser.");
        return; 
    }
    
    // Set canvas to a reasonable size
    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment" } 
        });
        
        VIDEO = document.createElement("video");
        
        // 1. MUST set playsinline in JS
        VIDEO.playsInline = true; 
        VIDEO.muted = true;
        VIDEO.autoplay = true;
        
        // 2. Hide the video, but give it a size so mobile can process it
        VIDEO.style.position = "absolute";
        VIDEO.style.opacity = "0";
        VIDEO.style.pointerEvents = "none";
        VIDEO.style.width = "100px";
        VIDEO.style.height = "100px";
        VIDEO.style.top = "-9999px"; // Move off-screen instead of tiny

        document.body.appendChild(VIDEO);
        VIDEO.srcObject = stream;
        
        // Use loadedmetadata for a more robust start
        VIDEO.onloadedmetadata = function () {
            VIDEO.play();
            updateCanvas();
        };
    } catch (err) {
        alert("Camera error: " + err);
    }
}


function updateCanvas() {
  CONTEXT.drawImage(VIDEO, 0, 0, CANVAS.width, CANVAS.height);
  window.requestAnimationFrame(updateCanvas);
}

function takePicture() {
  CONTEXT.drawImage(VIDEO, 0, 0, CANVAS.width, CANVAS.height);
  CANVAS.toBlob(
    function (blob) {
      sendToPlantNet(blob);
    },
    "image/jpeg",
    0.8,
  );
}

async function sendToPlantNet(imageBlob) {
  const loading = document.getElementById("loading-overlay");
  loading.classList.add("visible");

  const formData = new FormData();
  formData.append("image", imageBlob, "plant.jpg");
  formData.append("organ", "auto");

  try {
    const response = await fetch("/api/identify", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Identification failed");
    }

    const params = new URLSearchParams({
      name: data.commonName,
      latin: data.scientificName,
      score: data.score,
    });

    window.location.href = `/plant?${params}`;
  } catch (err) {
    alert("Could not identify plant. Try again.");
    loading.classList.remove("visible");
  }
}
