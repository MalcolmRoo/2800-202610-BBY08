

const searchForm = document.querySelector('#search-form'); // Form Id here
const searchInput = document.querySelector('#search-input'); // Input Id here


window.addEventListener('DOMContentLoaded', (e) => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('search');

    if (query) {
        performSearch(query);
    }
});

//search API for plants
async function performSearch(query) {
    //display loading spinner
    const loader = document.getElementById("loading-overlay");
    console.log("load search");
    if (loader) loader.classList.add("visible");

    try {
        const response = await fetch("/api/permapeople/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ q: query }),
        });

        const results = await response.json();
        if (!response.ok) throw new Error(results.error);

        displayResults(results);
    } catch (err) {
        console.error("Search failed:", err);
    } finally {
        //hide loading spinner
        if (loader) loader.classList.remove("visible");
    }
}


//display results in descending list on page
function displayResults(results) {
    const plantArray = results.plants;
    const resultsContainer = document.getElementById("search-results");
    resultsContainer.innerHTML = "";
    for (const plant of plantArray) {
        // Create a new element for each plant result
        const plantElement = document.createElement("div");
        plantElement.classList.add("plant-result");
        // Add common name
        const p = document.createElement("p")
        p.textContent = plant.name
        plantElement.appendChild(p);
        // Add scientific name in smaller text
        const s = document.createElement("small")
        s.textContent = plant.scientific_name
        plantElement.appendChild(s);

        plantElement.addEventListener("click", async () => {
            // When a plant is clicked, navigate to the plant details page with query parameters
            const queryParams = new URLSearchParams({
                id: plant.id,
                name: plant.name,
                latin: plant.scientific_name || "",
                score: "100", // Since this is a search result, we can assume 100% confidence for the sake of display
            });

            window.location.href = `/plant?${queryParams.toString()}`;
        });


        resultsContainer.appendChild(plantElement);
    }
}

