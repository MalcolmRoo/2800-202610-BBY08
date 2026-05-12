// Name used to store favourites in localStorage
const KEY = 'greenscan_favorites';
// Read and return the saved favourites list from localStorage
const getFavs = () => JSON.parse(localStorage.getItem(KEY) || '[]');
// Save the updated favourites list back to localStorage
const saveFavs = (f) => localStorage.setItem(KEY, JSON.stringify(f));
// Check if a specific plant is already in the favourites list by its id
const isFav = (id) => getFavs().some(p => p.id === id);

// checks list if there remove if not there add it
function toggleFavorite({ id, commonName, latinName }) {
    const favs = getFavs();
    const exists = favs.findIndex(p => p.id === id);
    exists >= 0 ? favs.splice(exists, 1) : favs.push({ id, commonName, latinName, savedAt: new Date().toISOString() });
    saveFavs(favs);
    updateFavButton(id);
}

// Update the heart button appearance based on whether the plant is favorited
function updateFavButton(id) {
    const btn = document.getElementById('fav-btn');
    if (!btn) return;
    const active = isFav(id);
    btn.classList.toggle('active', active);
    btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="${active ? '#95B46A' : 'none'}" stroke="${active ? '#95B46A' : 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.77l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
}

// Listen for heart button click and tell toggleFavorite when to run
function initFavButton(plantId) {
    const btn = document.getElementById('fav-btn');
    if (!btn) return;
    updateFavButton(plantId);
    btn.addEventListener('click', () => toggleFavorite({
        id: plantId,
        commonName: document.getElementById('common-name')?.textContent || 'Unknown',
        latinName: document.getElementById('latin-name')?.textContent || ''
    }));
}

// Get saved list from localStorage and display each plant as a card on the favourites page
function renderFavoritesList() {
    const listEl = document.getElementById('favorites-list');
    const emptyEl = document.getElementById('empty-state');
    if (!listEl || !emptyEl) return;
    const favs = getFavs();
    listEl.classList.toggle('hidden', favs.length === 0);
    emptyEl.classList.toggle('hidden', favs.length > 0);
    listEl.innerHTML = favs.map(p => `
        <div class="fav-item" onclick="window.location.href='/plant?name=${encodeURIComponent(p.commonName)}&latin=${encodeURIComponent(p.latinName)}&score=0'">
            <div class="fav-info"><h3>${p.commonName}</h3><p>${p.latinName}</p></div>
            <button class="fav-remove" onclick="event.stopPropagation();toggleFavorite({id:'${p.id}',commonName:'${p.commonName}',latinName:'${p.latinName}'});renderFavoritesList();">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            </button>
        </div>`).join('');
}

// Automatically call renderFavoritesList when the favourites page loads
if (document.getElementById('favorites-list')) renderFavoritesList();