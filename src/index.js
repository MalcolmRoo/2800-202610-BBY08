const searchForm = document.querySelector('#search-form'); // Form Id here
const searchInput = document.querySelector('#search-input'); // Input Id here

const startSearch = document.getElementById("showSearch"); //Main menu button unhides search form
const searchBar = document.getElementById("textSearchContainer");

startSearch.addEventListener('click', (event) =>{
    searchBar.style.display = "inline";
    searchBar.focus();
});