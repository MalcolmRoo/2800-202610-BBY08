// Name used to store favourites in localStorage
const KEY = 'greenscan_favorites';
// Name used to store cached plant images in localStorage
const IMG_KEY = 'greenscan_fav_images';

// Read and return the saved favourites list from localStorage
const getLocalFavs = () => JSON.parse(localStorage.getItem(KEY) || '[]');
// Save the updated favourites list back to localStorage
const saveLocalFavs = (f) => localStorage.setItem(KEY, JSON.stringify(f));

// Read cached plant images from localStorage
const getLocalImages = () => JSON.parse(localStorage.getItem(IMG_KEY) || '{}');
// Save a plant image URL to localStorage cache
const saveLocalImage = (id, url) => {
    const imgs = getLocalImages();
    if (url === null) {
        delete imgs[id];
    } else {
        imgs[id] = url;
    }
    localStorage.setItem(IMG_KEY, JSON.stringify(imgs));
};
//Gets favorites from database
const getDbFavs = async () => {
    try{
        const response = await fetch('/user/favorites');
        if(!response.ok) return [];
        return await response.json();
    } catch (err) {
        console.errror("Failed to fetch DB favourites:", err);
        return [];
    }
}
// combine local and database into one array
const getUnifiedFavs = async () => {
    const localFavs = getLocalFavs();
    const dbFavs = await getDbFavs();
    const localImgs = getLocalImages();

    const normalizedDB = dbFavs.map(p => ({
        id: p.id,
        commonName: p.commonName,
        savedAt: p.savedAt,
        imageUrl: p.imageUrl || null
    }));

    const normalizedLocal = localFavs.map(p => ({
        ...p,
        imageUrl: localImgs[p.id] || null
    }));

    const combined = [...normalizedLocal, ...normalizedDB];

    const uniqueMap = new Map();
    combined.forEach(plant => {
        if(!uniqueMap.has(plant.id)) {
            uniqueMap.set(plant.id, plant);
        }
    });

    return Array.from(uniqueMap.values());
}

// Check if a specific plant is already in the favourites list by its id
const isFav = async (id) => {
    const favs = await getUnifiedFavs();
    return favs.some(p => p.id === id);
};


// Functionality from hitting the <3 favorite button, adding or removing the favorite as necessary
async function toggleFavorite({ id, commonName, latinName, imageUrl = null }) {
    try {
        if (!id) {
            console.error("Cannot toggle favorite: Missing plant ID.");
            return;
        }

        const localFavs = getLocalFavs();
        const localExistsIndex = localFavs.findIndex(p => p.id === id);
        const dbFavs = await getDbFavs();
        const dbExists = dbFavs.some(p => p.id === id);
        
        // If imageUrl wasn't passed directly, fall back to checking local storage
        if (!imageUrl) {
            const allImages = getLocalImages();
            imageUrl = allImages[id] || null;
        }

        if (localExistsIndex >= 0 || dbExists) {
            // REMOVE PROCESS 
            if (localExistsIndex >= 0) {
                localFavs.splice(localExistsIndex, 1);
                saveLocalFavs(localFavs);
            }
            saveLocalImage(id, null);

            // Database Removal
            await fetch(`/user/favorites/${encodeURIComponent(id)}`, { method: 'DELETE' })
                .catch(err => console.error(err));
        } else {
            // Process
            const newPlant = { id, commonName, latinName: latinName || '', savedAt: new Date().toISOString() };
            
            // Local Storage Save
            localFavs.push(newPlant);
            saveLocalFavs(localFavs);
            
            
            if (imageUrl) {
                saveLocalImage(id, imageUrl);
            }

            //Save to database
            await fetch('/user/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newPlant, imageUrl: imageUrl })
            }).catch(err => console.error(err));
        }

        await updateFavButton(id);
    } catch (err) {
        console.error("Error executing toggleFavorite:", err);
    }
}



// Update the heart button appearance based on whether the plant is favorited
async function updateFavButton(id) {
    const btn = document.getElementById('fav-btn');
    if (!btn) return;
    const active = await isFav(id);
    btn.classList.toggle('active', active);
    btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="${active ? '#95B46A' : 'none'}" stroke="${active ? '#95B46A' : 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.77l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
}

// Listen for heart button click and pass the image URL directly from the page layout
async function initFavButton(plantId, plantLatin) {
    const btn = document.getElementById('fav-btn');
    if (!btn) return;
    
    await updateFavButton(plantId);
    
    btn.addEventListener('click', () => {
        // FIXED: Extract the active URL string straight from the <img> element src attribute
        const imgElement = document.getElementById('plant-image');
        let currentImgUrl = null;
        
        if (imgElement && imgElement.src && !imgElement.src.endsWith('/')) {
            currentImgUrl = imgElement.src;
        }

        toggleFavorite({
            id: plantId,
            commonName: document.getElementById('common-name')?.textContent || 'Unknown',
            latinName: plantLatin || document.getElementById('latin-name')?.textContent || '',
            imageUrl: currentImgUrl // Directly passed down into database payload
        });
    });
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
    const favs = await getUnifiedFavs();
    

    
    gridEl.classList.toggle('hidden', favs.length === 0);
    emptyEl.classList.toggle('hidden', favs.length > 0);
    if (subEl) {
        subEl.textContent = favs.length === 0 ? 'Your saved plants' : `${favs.length} plant${favs.length !== 1 ? 's' : ''} saved`;
        
    }

    const cards = favs.map((p, i) => {
        const tags = TAG_SETS[i % TAG_SETS.length];
        const imageUrl = p.imageUrl || null;

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