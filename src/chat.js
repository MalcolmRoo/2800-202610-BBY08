// chat.js — mushroom pop-up trigger
// Shows mushroom 5 seconds after plant is identified
// Clicking redirects to full chat page with plant context
const chatParams = new URLSearchParams(window.location.search);
const chatPlantName = chatParams.get("name") || "Unknown Plant";
const chatLatinName = chatParams.get("latin") || "";
const chatScore = chatParams.get("score") || "0";
const chatDisease = chatParams.get("disease") || "";
const chatDiseaseWarning = chatParams.get("diseaseWarning") || "";

const mushroomChat = document.getElementById("mushroom-chat");
const mushroomBtn = document.getElementById("mushroom-btn");
const speechBubble = document.getElementById("speech-bubble");

// If disease detected — bigger warning style popup
if (chatDisease) {
  speechBubble.textContent = `⚠️ ${chatDiseaseWarning || "Disease detected: " + chatDisease + ". Want to know more?"}`;
  speechBubble.style.borderColor = "#e05252";
  speechBubble.style.color = "#e05252";
  speechBubble.style.maxWidth = "220px";
  speechBubble.style.fontSize = "13px";
  speechBubble.style.fontWeight = "600";
  mushroomBtn.style.width = "90px";
  mushroomBtn.style.height = "90px";
} else {
  speechBubble.textContent = "Do you have questions about this plant? 🌿";
}

// Show mushroom 5 seconds after page loads
setTimeout(() => {
  mushroomChat.classList.add("visible");
}, 5000);

// Click mushroom — go to chat page with plant context in URL
mushroomBtn.addEventListener("click", () => {
  const params = new URLSearchParams({
    name: chatPlantName,
    latin: chatLatinName,
    score: chatScore,
  });
  if (chatDisease) {
    params.append("disease", chatDisease);
    params.append("diseaseWarning", chatDiseaseWarning);
  }
  window.location.href = `/chat?${params}`;
});

// Clicking speech bubble also opens chat
speechBubble.addEventListener("click", () => {
  mushroomBtn.click();
});
