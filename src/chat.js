// chat.js — mushroom pop-up trigger
// Shows mushroom 5 seconds after plant is identified
// Clicking redirects to full chat page with plant context

const chatParams = new URLSearchParams(window.location.search);
const chatPlantName = chatParams.get("name") || "Unknown Plant";
const chatLatinName = chatParams.get("latin") || "";
const chatScore = chatParams.get("score") || "0";

const mushroomChat = document.getElementById("mushroom-chat");
const mushroomBtn = document.getElementById("mushroom-btn");
const speechBubble = document.getElementById("speech-bubble");

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
  window.location.href = `/chat?${params}`;
});

// Clicking speech bubble also opens chat
speechBubble.addEventListener("click", () => {
  mushroomBtn.click();
});
