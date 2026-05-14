// chatPage.js — full chat page powered by Groq AI
// Reads plant context from URL params, handles messages
const params = new URLSearchParams(window.location.search);
const plantName = params.get("name") || "Unknown Plant";
const latinName = params.get("latin") || "";
const score = params.get("score") || "0";

// Fill header
document.getElementById("chat-plant-name").textContent = plantName;
document.getElementById("chat-plant-latin").textContent = latinName;

// Back button — returns to plant result page
document.getElementById("chat-back-btn").addEventListener("click", () => {
  const backParams = new URLSearchParams({
    name: plantName,
    latin: latinName,
    score,
  });
  window.location.href = `/plant?${backParams}`;
});

// DOM elements
const messagesArea = document.getElementById("chat-messages-area");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("chat-send-btn");

// Activate send button when text is entered
chatInput.addEventListener("input", () => {
  if (chatInput.value.trim().length > 0) {
    sendBtn.classList.add("active");
  } else {
    sendBtn.classList.remove("active");
  }
});

// Send on Enter
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

sendBtn.addEventListener("click", sendMessage);

// Add message bubble
function addBubble(text, sender) {
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${sender}`;
  bubble.textContent = text;
  messagesArea.appendChild(bubble);
  messagesArea.scrollTop = messagesArea.scrollHeight;
}

// Loading bubble
function addLoadingBubble() {
  const bubble = document.createElement("div");
  bubble.className = "chat-bubble ai loading";
  bubble.id = "loading-bubble";
  bubble.textContent = "Thinking...";
  messagesArea.appendChild(bubble);
  messagesArea.scrollTop = messagesArea.scrollHeight;
}

function removeLoadingBubble() {
  const loading = document.getElementById("loading-bubble");
  if (loading) loading.remove();
}

// Send message to /api/chat
async function sendMessage() {
  const question = chatInput.value.trim();
  if (!question) return;

  addBubble(question, "user");
  chatInput.value = "";
  sendBtn.disabled = true;
  addLoadingBubble();

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plantName, latinName, question }),
    });

    const data = await response.json();
    removeLoadingBubble();

    if (!response.ok) {
      addBubble("Sorry I couldn't get an answer. Try again.", "ai");
      return;
    }

    addBubble(data.answer, "ai");
  } catch (err) {
    removeLoadingBubble();
    addBubble("Connection error. Please try again.", "ai");
    console.error("[CHAT]", err);
  } finally {
    sendBtn.disabled = false;
    chatInput.focus();
  }
}
