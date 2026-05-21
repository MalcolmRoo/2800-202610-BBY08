//return result based on URL for the purpose of testing, will be later connect with plantnet to get the plant name

// window.addEventListener("DOMContentLoaded", async () => {
//   const params = new URLSearchParams(window.location.search);
//   const name = params.get("plant");

//   if (!name) {
//     document.getElementById("name").textContent = "No plant provided";
//     return;
//   }

//   const res = await fetch(`/api/permapeople?name=${encodeURIComponent(name)}`);
//   const data = await res.json();

//   const plant = parsePerma(data);

//   displayPlant(plant);
// });
