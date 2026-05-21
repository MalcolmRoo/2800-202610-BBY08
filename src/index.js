const searchInput = document.querySelector('.search-input');
const searchBtn = document.querySelector('.search-submit-btn');

searchInput.addEventListener('input', () => {
  if (searchInput.value.trim().length > 0) {
    searchBtn.classList.add('active');
  } else {
    searchBtn.classList.remove('active');
  }
});

var loginButton = document.getElementById('login');
var logoutButton = document.getElementById('logout');
var subMessage = document.getElementById('sub-message');

document.addEventListener("DOMContentLoaded", async () => {

  // Guard clause: stop running if the buttons aren't on the current page
  if (!loginButton || !logoutButton) return;

  try {
    const response = await fetch("/api/auth-status");
    const data = await response.json();

    if (data.loggedIn) {
      loginButton.style.display = "none";
      logoutButton.style.display = "block";
      const name = data.username ? data.username : "Forager";
      subMessage.textContent = `Welcome back, ${name}! Ready to explore? 🌿`;
    } else {
      loginButton.style.display = "block";
      logoutButton.style.display = "none";
      subMessage.textContent = "Identify any plant instantly";
    }
  } catch (err) {
    console.error("Auth visibility check failed:", err);
    // Fallback display rules for safety
    loginButton.style.display = "block";
    logoutButton.style.display = "none";
  }
});