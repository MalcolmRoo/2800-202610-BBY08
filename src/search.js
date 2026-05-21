const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const searchSubmitBtn = document.querySelector('.search-submit-btn');
const resultsContainer = document.querySelector('#search-results');
const noResultsMascot = document.querySelector('#no-results-mascot');
const filterChips = document.querySelectorAll('.chip');

let currentQuery = '';
let allResults = [];

const FAV_KEY = 'greenscan_favorites';
const IMG_KEY = 'greenscan_fav_images';
const getFavs = () => JSON.parse(localStorage.getItem(FAV_KEY) || '[]');
const saveFavs = (f) => localStorage.setItem(FAV_KEY, JSON.stringify(f));
const isFav = (id) => getFavs().some(p => p.id === id);

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

window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('search');
  if (query) {
    searchInput.value = query;
    searchSubmitBtn.classList.add('active');
    performSearch(query);
  }
});

searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (!query) return;
  performSearch(query);
});

async function performSearch(query) {
  currentQuery = query;
  const loader = document.getElementById('loading-overlay');
  if (loader) loader.classList.add('visible');
  noResultsMascot.classList.remove('visible');
  resultsContainer.innerHTML = '';

  try {
    const response = await fetch('/api/permapeople/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query }),
    });
    const results = await response.json();
    if (!response.ok) throw new Error(results.error);
    allResults = results.plants || [];
    displayResults(allResults);
  } catch (err) {
    console.error('Search failed:', err);
    showNoResults();
  } finally {
    if (loader) loader.classList.remove('visible');
  }
}

function displayResults(plants) {
  resultsContainer.innerHTML = '';
  noResultsMascot.classList.remove('visible');

  if (!plants || plants.length === 0) {
    showNoResults();
    return;
  }

  const activeFilter = document.querySelector('.chip.active')?.dataset.filter || 'all';
  const filtered = activeFilter === 'all' ? plants : plants.filter(p => matchesFilter(p, activeFilter));

  if (filtered.length === 0) {
    showNoResults();
    return;
  }

  filtered.forEach((plant, idx) => {
    const card = document.createElement('div');
    card.classList.add('plant-result');
    card.style.animationDelay = `${idx * 0.05}s`;

    const imageUrl = plant.images?.title || plant.images?.thumb || '';
    if (imageUrl) card.style.backgroundImage = `url('${imageUrl}')`;

    const info = document.createElement('div');
    info.classList.add('plant-info');

    const name = document.createElement('div');
    name.classList.add('plant-name');
    name.textContent = plant.name;
    info.appendChild(name);

    if (plant.scientific_name) {
      const sci = document.createElement('div');
      sci.classList.add('plant-latin');
      sci.textContent = plant.scientific_name;
      info.appendChild(sci);
    }

    card.appendChild(info);

    const favBtn = document.createElement('button');
    favBtn.classList.add('fav-btn');
    const plantId = plant.id || plant.name;
    const active = isFav(plantId);
    if (active) favBtn.classList.add('active');
    favBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="${active ? '#95B46A' : 'none'}" stroke="${active ? '#95B46A' : 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.77l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;

    favBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const favs = getFavs();
      const exists = favs.findIndex(p => p.id === plantId);
      if (exists >= 0) {
        favs.splice(exists, 1);
      } else {
        favs.push({ id: plantId, commonName: plant.name, latinName: plant.scientific_name || '', savedAt: new Date().toISOString() });
        const imgUrl = plant.images?.title || plant.images?.thumb || '';
        if (imgUrl) {
          const imgs = JSON.parse(localStorage.getItem(IMG_KEY) || '{}');
          imgs[plantId] = imgUrl;
          localStorage.setItem(IMG_KEY, JSON.stringify(imgs));
        }
      }
      saveFavs(favs);
      const nowFav = isFav(plantId);
      favBtn.classList.toggle('active', nowFav);
      favBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="${nowFav ? '#95B46A' : 'none'}" stroke="${nowFav ? '#95B46A' : 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.77l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
    });

    card.appendChild(favBtn);

    card.addEventListener('click', () => {
      const queryParams = new URLSearchParams({
        id: plant.id,
        name: plant.name,
        latin: plant.scientific_name || '',
        score: '100',
      });
      window.location.href = `/plant?${queryParams.toString()}`;
    });

    resultsContainer.appendChild(card);
  });
}

function matchesFilter(plant, filter) {
  const data = (plant.tags || []).map(t => t.toLowerCase());
  const name = (plant.name || '').toLowerCase();
  const sci = (plant.scientific_name || '').toLowerCase();
  const combined = [...data, name, sci].join(' ');

  const filterMap = {
    edible: ['edible', 'eat', 'food'],
    safe: ['safe', 'non-toxic', 'pet-safe'],
    trees: ['tree', 'wood', 'bark', 'trunk'],
    flowers: ['flower', 'bloom', 'blossom', 'floral'],
  };

  const keywords = filterMap[filter];
  if (!keywords) return true;
  return keywords.some(k => combined.includes(k));
}

function showNoResults() {
  resultsContainer.innerHTML = '';
  noResultsMascot.classList.add('visible');
}
