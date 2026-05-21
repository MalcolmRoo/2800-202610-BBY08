// Storage keys
const KEY = 'greenscan_favorites';
const IMG_KEY = 'greenscan_fav_images';

// Local storage helpers
const getLocalFavs = () => JSON.parse(localStorage.getItem(KEY) || '[]');
const saveLocalFavs = (f) => localStorage.setItem(KEY, JSON.stringify(f));
const getLocalImages = () => JSON.parse(localStorage.getItem(IMG_KEY) || '{}');
const saveLocalImage = (id, url) => {
    const imgs = getLocalImages();
    if (url === null) delete imgs[id]; else imgs[id] = url;
    localStorage.setItem(IMG_KEY, JSON.stringify(imgs));
};

// Fetch favourites from database
const getDbFavs = async () => {
    try {
        const res = await fetch('/user/favorites');
        return res.ok ? await res.json() : [];
    } catch (err) {
        console.error("Failed to fetch DB favourites:", err);
        return [];
    }
};

// Merge local and DB favourites, deduped by id
const getUnifiedFavs = async () => {
    const [localFavs, dbFavs] = await Promise.all([getLocalFavs(), getDbFavs()]);
    const localImgs = getLocalImages();

    const all = [
        ...localFavs.map(p => ({ ...p, id: String(p.id), imageUrl: localImgs[String(p.id)] || null })),
        ...dbFavs.map(p => ({ id: String(p.id), commonName: p.commonName, savedAt: p.savedAt, imageUrl: p.imageUrl || null }))
    ];

    const seen = new Map();
    all.forEach(p => { if (!seen.has(p.id)) seen.set(p.id, p); });
    return Array.from(seen.values());
};

// Check if a plant is already favourited
const isFav = async (id) => (await getUnifiedFavs()).some(p => p.id === String(id));

// Toggle favourite on or off
async function toggleFavorite({ id, commonName, latinName, imageUrl = null }) {
    try {
        id = String(id);
        if (!id) return console.error("Cannot toggle favorite: Missing plant ID.");

        const [localFavs, dbFavs] = await Promise.all([getLocalFavs(), getDbFavs()]);
        const exists = localFavs.some(p => String(p.id) === id) || dbFavs.some(p => String(p.id) === id);

        if (!imageUrl) imageUrl = getLocalImages()[id] || null;

        if (exists) {
            // Remove
            saveLocalFavs(localFavs.filter(p => String(p.id) !== id));
            saveLocalImage(id, null);
            await fetch(`/user/favorites/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(console.error);
        } else {
            // Add
            const newPlant = { id, commonName, latinName: latinName || '', savedAt: new Date().toISOString() };
            saveLocalFavs([...localFavs, newPlant]);
            if (imageUrl) saveLocalImage(id, imageUrl);
            await fetch('/user/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newPlant, imageUrl })
            }).catch(console.error);
        }

        await updateFavButton(id);
    } catch (err) {
        console.error("Error executing toggleFavorite:", err);
    }
}

// Update heart button appearance
async function updateFavButton(id) {
    const btn = document.getElementById('fav-btn');
    if (!btn) return;
    const active = await isFav(id);
    btn.classList.toggle('active', active);
    btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="${active ? '#95B46A' : 'none'}" stroke="${active ? '#95B46A' : 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.77l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
}

// Initialize heart button with click handler
async function initFavButton(plantId, plantLatin) {
    const btn = document.getElementById('fav-btn');
    if (!btn) return;
    await updateFavButton(plantId);
    btn.addEventListener('click', () => {
        const imgEl = document.getElementById('plant-image');
        const imageUrl = (imgEl?.src && !imgEl.src.endsWith('/')) ? imgEl.src : null;
        toggleFavorite({
            id: plantId,
            commonName: document.getElementById('common-name')?.textContent || 'Unknown',
            latinName: plantLatin || document.getElementById('latin-name')?.textContent || '',
            imageUrl
        });
    });
}

// Tag sets for plant cards
const TAG_SETS = [
    ['Full Sun', 'Annual'], ['Indoor', 'Low Water'], ['Low Light', 'Tropical'],
    ['Perennial', 'Air Purifying'], ['Drought Tolerant'], ['Fast Growth'],
];

// Render favourites grid
async function renderFavoritesList() {
    const gridEl = document.getElementById('fav-grid');
    const emptyEl = document.getElementById('empty-state');
    const subEl = document.getElementById('fav-subtitle');
    if (!gridEl || !emptyEl) return;

    const favs = await getUnifiedFavs();
    gridEl.classList.toggle('hidden', favs.length === 0);
    emptyEl.classList.toggle('hidden', favs.length > 0);
    if (subEl) subEl.textContent = favs.length === 0 ? 'Your saved plants' : `${favs.length} plant${favs.length !== 1 ? 's' : ''} saved`;

    gridEl.innerHTML = favs.map((p, i) => {
        const tags = TAG_SETS[i % TAG_SETS.length];
        return `
        <div class="fav-card" style="animation-delay:${i * 0.08}s" data-favname="${encodeURIComponent(p.commonName)}" data-favlatin="${encodeURIComponent(p.latinName || '')}">
            ${p.imageUrl ? `<div class="fav-card-img" style="background-image:url('${p.imageUrl}')"></div>` : `<div class="fav-card-art"></div>`}
            <div class="fav-card-name">${p.commonName}</div>
            <div class="fav-card-latin">${p.latinName || ''}</div>
            <div class="fav-card-footer">
                <div class="fav-card-tags">${tags.map(t => `<span class="fav-tag">${t}</span>`).join('')}</div>
                <button class="fav-remove" data-favid="${p.id}">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                </button>
            </div>
        </div>`;
    }).join('');
}

// Favourites page init
const gridEl = document.getElementById('fav-grid');
if (gridEl) {
    renderFavoritesList();

    gridEl.addEventListener('click', async (e) => {
        const removeBtn = e.target.closest('.fav-remove');
        if (removeBtn) {
            e.stopPropagation();
            const card = removeBtn.closest('.fav-card');
            await toggleFavorite({
                id: removeBtn.dataset.favid,
                commonName: decodeURIComponent(card.dataset.favname),
                latinName: decodeURIComponent(card.dataset.favlatin)
            });
            await renderFavoritesList();
            return;
        }
        const card = e.target.closest('.fav-card');
        if (card) {
            window.location.href = `/plant?name=${card.dataset.favname}&latin=${card.dataset.favlatin}&score=0`;
        }
    });
}

// Badge display
(async () => {
    const [local, db] = await Promise.all([getLocalFavs(), getDbFavs()]);
    if (local.length >= 10 || db.length >= 10) {
        document.getElementById('badge').style.display = "block";
    }
})();