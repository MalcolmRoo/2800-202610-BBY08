const searchInput = document.querySelector('.search-input');
const searchBtn = document.querySelector('.search-submit-btn');

searchInput.addEventListener('input', () => {
  if (searchInput.value.trim().length > 0) {
    searchBtn.classList.add('active');
  } else {
    searchBtn.classList.remove('active');
  }
});