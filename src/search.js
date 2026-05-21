// DOM Elements
const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const searchSubmitBtn = document.querySelector('.search-submit-btn');
const resultsContainer = document.querySelector('#search-results');
const noResultsMascot = document.querySelector('#no-results-mascot');
const filterChips = document.querySelectorAll('.chip');

let currentQuery = '';
let allResults = [];

// Local storage helpers
const FAV_KEY = 'greenscan_favorites';
const IMG_KEY = 'greenscan_fav_images';
const getFavs = () => JSON.parse(localStorage.getItem(FAV_KEY) || '[]');
const saveFavs = (f) => localStorage.setItem(FAV_KEY, JSON.stringify(f));
const isFav = (id) => getFavs().some(p => p.id === id);

// Heart SVG helper
const heartSVG = (active) =>
  `<svg width="20" height="20" viewBox="0 0 24 24" fill="${active ? '#95B46A' : 'none'}" stroke="${active ? '#95B46A' : 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.77l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;

// Input & filter chip events
searchInput.addEventListener('input', () => {
  searchSubmitBtn.classList.toggle('active', searchInput.value.trim().length > 0);
});

filterChips.forEach(chip => {
  chip.addEventListener('click', () => {
    filterChips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    if (allResults.length > 0) displayResults(allResults);
  });
});

// Pre-fill search from URL on load
window.addEventListener('DOMContentLoaded', () => {
  const query = new URLSearchParams(window.location.search).get('search');
  if (query) {
    searchInput.value = query;
    searchSubmitBtn.classList.add('active');
    performSearch(query);
  }
});

// Form submit
searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (query) performSearch(query);
});

// Fetch and display search results
async function performSearch(query) {
  currentQuery = query;
  const loader = document.getElementById('loading-overlay');
  loader?.classList.add('visible');
  noResultsMascot.classList.remove('visible');
  resultsContainer.innerHTML = '';

  try {
    const res = await fetch('/api/permapeople/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    allResults = data.plants || [];
    displayResults(allResults);
  } catch (err) {
    console.error('Search failed:', err);
    showNoResults();
  } finally {
    loader?.classList.remove('visible');
  }
}

// Render plant cards
function displayResults(plants) {
  resultsContainer.innerHTML = '';
  noResultsMascot.classList.remove('visible');
  if (!plants?.length) return showNoResults();

  const activeFilter = document.querySelector('.chip.active')?.dataset.filter || 'all';
  const filtered = activeFilter === 'all' ? plants : plants.filter(p => matchesFilter(p, activeFilter));
  if (!filtered.length) return showNoResults();

  filtered.forEach((plant, idx) => {
    const plantId = String(plant.id || plant.name);
    const imageUrl = plant.images?.title || plant.images?.thumb || '';
    const active = isFav(plantId);

    // Card
    const card = document.createElement('div');
    card.className = 'plant-result';
    card.style.animationDelay = `${idx * 0.05}s`;
    if (imageUrl) card.style.backgroundImage = `url('${imageUrl}')`;

    // Plant info
    const info = document.createElement('div');
    info.className = 'plant-info';
    info.innerHTML = `<div class="plant-name">${plant.name}</div>${plant.scientific_name ? `<div class="plant-latin">${plant.scientific_name}</div>` : ''}`;
    card.appendChild(info);

    // Fav button
    const favBtn = document.createElement('button');
    favBtn.className = `fav-btn${active ? ' active' : ''}`;
    favBtn.innerHTML = heartSVG(active);
    favBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const favs = getFavs();
      const idx = favs.findIndex(p => p.id === plantId);
      if (idx >= 0) {
        favs.splice(idx, 1);
      } else {
        favs.push({ id: plantId, commonName: plant.name, latinName: plant.scientific_name || '', savedAt: new Date().toISOString() });
        if (imageUrl) {
          const imgs = JSON.parse(localStorage.getItem(IMG_KEY) || '{}');
          imgs[plantId] = imageUrl;
          localStorage.setItem(IMG_KEY, JSON.stringify(imgs));
        }
      }
      saveFavs(favs);
      const nowFav = isFav(plantId);
      favBtn.classList.toggle('active', nowFav);
      favBtn.innerHTML = heartSVG(nowFav);
    });
    card.appendChild(favBtn);

    // Navigate to plant page
    card.addEventListener('click', () => {
      window.location.href = `/plant?${new URLSearchParams({ id: plant.id, name: plant.name, latin: plant.scientific_name || '', score: '100' })}`;
    });

    resultsContainer.appendChild(card);
  });
}

// Filter logic
function matchesFilter(plant, filter) {
  const combined = [...(plant.tags || []).map(t => t.toLowerCase()), (plant.name || '').toLowerCase(), (plant.scientific_name || '').toLowerCase()].join(' ');
  const filterMap = {
    edible: ['edible', 'eat', 'food'],
    safe: ['safe', 'non-toxic', 'pet-safe'],
    trees: ['tree', 'wood', 'bark', 'trunk'],
    flowers: ['flower', 'bloom', 'blossom', 'floral'],
  };
  return filterMap[filter]?.some(k => combined.includes(k)) ?? true;
}

// Show no results state
function showNoResults() {
  resultsContainer.innerHTML = '';
  noResultsMascot.classList.add('visible');
}