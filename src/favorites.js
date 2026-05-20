// Name used to store favourites in localStorage
const KEY = 'greenscan_favorites';
// Name used to store cached plant images in localStorage
const IMG_KEY = 'greenscan_fav_images';

// Read and return the saved favourites list from localStorage
const getFavs = () => JSON.parse(localStorage.getItem(KEY) || '[]');
// Save the updated favourites list back to localStorage
const saveFavs = (f) => localStorage.setItem(KEY, JSON.stringify(f));

// Read cached plant images from localStorage
const getImages = () => JSON.parse(localStorage.getItem(IMG_KEY) || '{}');
// Save a plant image URL to localStorage cache
const saveImage = (id, url) => {
    const imgs = getImages();
    imgs[id] = url;
    localStorage.setItem(IMG_KEY, JSON.stringify(imgs));
};

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

// Tag sets for plant cards (cycles through based on index)
const TAG_SETS = [
    ['Full Sun', 'Annual'],
    ['Indoor', 'Low Water'],
    ['Low Light', 'Tropical'],
    ['Perennial', 'Air Purifying'],
    ['Drought Tolerant'],
    ['Fast Growth'],
];

// Retrieves saved plant data and cached images from local storage to render interactive cards.
async function renderFavoritesList() {
    const gridEl = document.getElementById('fav-grid');
    const emptyEl = document.getElementById('empty-state');
    const subEl = document.getElementById('fav-subtitle');
    if (!gridEl || !emptyEl) return;
    const favs = getFavs();
    const imgs = getImages();
    gridEl.classList.toggle('hidden', favs.length === 0);
    emptyEl.classList.toggle('hidden', favs.length > 0);
    if (subEl) {
        subEl.textContent = favs.length === 0 ? 'Your saved plants' : `${favs.length} plant${favs.length !== 1 ? 's' : ''} saved`;
    }

    const cards = favs.map((p, i) => {
        const tags = TAG_SETS[i % TAG_SETS.length];
        const imageUrl = imgs[p.id] || null;
        return `
        <div class="fav-card" style="animation-delay: ${i * 0.08}s" onclick="window.location.href='/plant?name=${encodeURIComponent(p.commonName)}&latin=${encodeURIComponent(p.latinName)}&score=0'">
            ${imageUrl ? `<div class="fav-card-img" style="background-image: url(${imageUrl})"></div>` : `<div class="fav-card-art"></div>`}
            <div class="fav-card-name">${p.commonName}</div>
            <div class="fav-card-latin">${p.latinName}</div>
            <div class="fav-card-footer">
                <div class="fav-card-tags">${tags.map(t => `<span class="fav-tag">${t}</span>`).join('')}</div>
                <button class="fav-remove" onclick="event.stopPropagation();toggleFavorite({id:'${p.id}',commonName:'${p.commonName}',latinName:'${p.latinName}'});renderFavoritesList();">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                </button>
            </div>
        </div>`;
    });

    gridEl.innerHTML = cards.join('');
}

// Automatically call renderFavoritesList when the favourites page loads
if (document.getElementById('fav-grid')) renderFavoritesList();

if (getFavs().length >= 10) {
    document.getElementById('badge').style.display = "block";
}