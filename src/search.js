
const searchForm = document.querySelector('#search-form'); // Form Id here
const searchInput = document.querySelector('#search-input'); // Input Id here

searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const query = searchInput.value.trim();
    if (!query) return;

    //Show loading overlay
    const loader = document.getElementById("loading-overlay");
    if (loader) loader.classList.add("visible");

    try {
        const response = await fetch("/api/permapeople/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ q: query }),
        });

        const results = await response.json();

        if (!response.ok) throw new Error(results.error);

        // Display the search results
        console.log("Search Results:", results);
        displayResults(results); 

    } catch (err) {
        console.error("Search failed:", err);
        alert("Search failed. Please try again.");
    } finally {
        //hide loading overlay
        if (loader) loader.classList.remove("visible");
    }
});

function displayResults(results) {
    const plantArray = results.plants;
    const resultsContainer = document.getElementById("search-results");// Results container Id here

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

        plantElement.addEventListener("click", () => {
             //call fetch(`/api/permapeople/plants/${plant.id}`) on the plant details page to get the full plant data
             console.log("Clicked plant ID:", plant.id);
        });


        resultsContainer.appendChild(plantElement);
    }
}