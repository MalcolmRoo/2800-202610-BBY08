// chatPage.js — full chat page powered by Groq AI
const params = new URLSearchParams(window.location.search);
const plantName = params.get("name") || "Unknown Plant";
const latinName = params.get("latin") || "";
const score = params.get("score") || "0";
const disease = params.get("disease") || "";
const diseaseWarning = params.get("diseaseWarning") || "";

// DOM elements
const messagesArea = document.getElementById("chat-messages-area");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("chat-send-btn");

// Populate header
const plantNameEl = document.getElementById("chat-plant-name");
const plantLatinEl = document.getElementById("chat-plant-latin");
if (plantNameEl) plantNameEl.textContent = plantName;
if (plantLatinEl) plantLatinEl.textContent = latinName;

// Disease warning handling
if (disease) {
  const tag = document.createElement("div");
  tag.style.cssText =
    "color:#e05252;font-size:12px;margin-top:4px;font-weight:600;";
  tag.textContent = `⚠️ ${disease} detected`;
  document.getElementById("chat-plant-info")?.appendChild(tag);
  addBubble(
    `⚠️ ${diseaseWarning || `Disease detected: ${disease}`}. I can answer questions about this disease and how it affects the plant.`,
    "ai",
  );
}

// Back button handler
document.getElementById("chat-back-btn")?.addEventListener("click", () => {
  const query = new URLSearchParams(window.location.search).toString();
  window.location.href = `/plant?${query}`;
});

// Background decoration
const bgArea = document.getElementById("plant-bg");
if (bgArea) {
  const items = [
    { x: 50, y: 60, r: -10 },
    { x: 320, y: 180, r: 8 },
    { x: 100, y: 320, r: -5 },
    { x: 280, y: 460, r: 12 },
    { x: 40, y: 580, r: -8 },
    { x: 340, y: 680, r: 6 },
    { x: 180, y: 800, r: -12 },
  ];
  items.forEach((item, i) => {
    const img = document.createElement("img");
    img.src = `plant${(i % 7) + 1}.png`;
    img.className = `bg-plant plant-${i + 1}`;
    img.style.cssText = `left:${item.x}px;top:${item.y}px;transform:rotate(${item.r}deg);`;
    bgArea.appendChild(img);
  });
}

// Input listeners
chatInput?.addEventListener("input", () => {
  sendBtn?.classList.toggle("active", chatInput.value.trim().length > 0);
});

chatInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});

sendBtn?.addEventListener("click", sendMessage);

// Bubble helper functions
function addBubble(text, sender) {
  if (!messagesArea) return;
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${sender}`;
  bubble.textContent = text;
  messagesArea.appendChild(bubble);
  scrollToBottom(sender === "user");
}

function addLoadingBubble() {
  if (!messagesArea) return;
  const bubble = document.createElement("div");
  bubble.className = "chat-bubble ai loading";
  bubble.id = "loading-bubble";
  bubble.innerHTML =
    '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
  messagesArea.appendChild(bubble);
  scrollToBottom(true);
}

function scrollToBottom(force = false) {
  if (!messagesArea) return;
  const nearBottom =
    messagesArea.scrollHeight -
      messagesArea.clientHeight -
      messagesArea.scrollTop <
    150;
  if (force || nearBottom) messagesArea.scrollTop = messagesArea.scrollHeight;
}

// Send message to backend route
async function sendMessage() {
  const question = chatInput?.value.trim();
  if (!question) return;

  addBubble(question, "user");
  chatInput.value = "";
  sendBtn?.classList.remove("active");
  if (sendBtn) sendBtn.disabled = true;
  addLoadingBubble();

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plantName, latinName, question, disease }),
    });

    const data = await res.json();

    if (res.ok) {
      addBubble(data.answer, "ai");
    } else {
      console.error("[Chat Error]:", data.error);
      addBubble(
        data.error || "Sorry, I couldn't get an answer. Try again.",
        "ai",
      );
    }
  } catch (err) {
    console.error("[Network Error]:", err);
    addBubble("Connection error. Please try again.", "ai");
  } finally {
    document.getElementById("loading-bubble")?.remove();
    if (sendBtn) sendBtn.disabled = false;
    chatInput?.focus();
  }
}

scrollToBottom(true);
