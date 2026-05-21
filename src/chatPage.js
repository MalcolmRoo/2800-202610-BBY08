// chatPage.js — full chat page powered by Groq AI
// Reads plant context from URL params, handles messages
const params = new URLSearchParams(window.location.search);
const plantName = params.get("name") || "Unknown Plant";
const latinName = params.get("latin") || "";
const score = params.get("score") || "0";
const disease = params.get("disease") || "";
const diseaseWarning = params.get("diseaseWarning") || "";

// Fill header
document.getElementById("chat-plant-name").textContent = plantName;
document.getElementById("chat-plant-latin").textContent = latinName;

// Show disease warning in header if present
if (disease) {
  const diseaseTag = document.createElement("div");
  diseaseTag.style.cssText =
    "color:#e05252;font-size:12px;margin-top:4px;font-weight:600;";
  diseaseTag.textContent = `⚠️ ${disease} detected`;
  document.getElementById("chat-plant-info").appendChild(diseaseTag);

  // Add warning bubble at start of chat
  const warningBubble = document.createElement("div");
  warningBubble.className = "chat-bubble ai";
  warningBubble.style.borderLeft = "3px solid #e05252";
  warningBubble.textContent = `⚠️ ${diseaseWarning || "Disease detected: " + disease}. I can answer questions about this disease and how it affects the plant.`;
  document.getElementById("chat-messages-area").appendChild(warningBubble);
}

// Back button — returns to plant result page
document.getElementById("chat-back-btn").addEventListener("click", () => {
  const backParams = new URLSearchParams({
    name: plantName,
    latin: latinName,
    score,
  });
  if (disease) {
    backParams.append("disease", disease);
    backParams.append("diseaseWarning", diseaseWarning);
  }
  window.location.href = `/plant?${backParams}`;
});

// DOM elements
const messagesArea = document.getElementById("chat-messages-area");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("chat-send-btn");

// Set header info
if (document.getElementById("chat-plant-name")) document.getElementById("chat-plant-name").textContent = plantName;
if (document.getElementById("chat-plant-latin")) document.getElementById("chat-plant-latin").textContent = latinName;

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

// Disease warning
if (disease) {
  const tag = document.createElement("div");
  tag.style.cssText = "color:#e05252;font-size:12px;margin-top:4px;font-weight:600;";
  tag.textContent = `⚠️ ${disease} detected`;
  document.getElementById("chat-plant-info")?.appendChild(tag);
  addBubble(`⚠️ ${diseaseWarning || `Disease detected: ${disease}`}. I can answer questions about this disease and how it affects the plant.`, "ai");
}

// Back button (Simplifies URL building using native string interpolation)
document.getElementById("chat-back-btn")?.addEventListener("click", () => {
  const query = new URLSearchParams(window.location.search).toString();
  window.location.href = `/plant?${query}`;
});

// Background decoration (Combined positions and rotations into a single config array)
const bgArea = document.getElementById("plant-bg");
if (bgArea) {
  const items = [{x:50,y:60,r:-10},{x:320,y:180,r:8},{x:100,y:320,r:-5},{x:280,y:460,r:12},{x:40,y:580,r:-8},{x:340,y:680,r:6},{x:180,y:800,r:-12}];
  items.forEach((item, i) => {
    const img = document.createElement("img");
    img.src = `plant${(i % 7) + 1}.png`;
    img.className = `bg-plant plant-${i + 1}`;
    img.style.cssText = `left:${item.x}px;top:${item.y}px;transform:rotate(${item.r}deg);`;
    bgArea.appendChild(img);
  });
}

// Input events
chatInput?.addEventListener("input", () => sendBtn?.classList.toggle("active", chatInput.value.trim().length > 0));
chatInput?.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); sendMessage(); } });
sendBtn?.addEventListener("click", sendMessage);

// Bubble helpers
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
  bubble.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
  messagesArea.appendChild(bubble);
  scrollToBottom(true);
}

function scrollToBottom(force = false) {
  if (!messagesArea) return;
  const nearBottom = (messagesArea.scrollHeight - messagesArea.clientHeight - messagesArea.scrollTop) < 150;
  if (force || nearBottom) messagesArea.scrollTop = messagesArea.scrollHeight;
}

// Send message
async function sendMessage() {
  const question = chatInput?.value.trim();
  if (!question) return;

  addBubble(question, "user");
  chatInput.value = "";
  sendBtn.classList.remove("active");
  sendBtn.disabled = true;
  addLoadingBubble();

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plantName, latinName, question, disease }),
    });
    const data = await res.json();
    addBubble(res.ok ? data.answer : "Sorry I couldn't get an answer. Try again.", "ai");
  } catch {
    addBubble("Connection error. Please try again.", "ai");
  } finally {
    document.getElementById("loading-bubble")?.remove(); // Merged removeLoadingBubble here to save lines
    sendBtn.disabled = false;
    chatInput.focus();
  }
}

scrollToBottom(true);