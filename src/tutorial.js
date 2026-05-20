var tutorialButton = document.getElementById("startTutorial");
var nextButton = document.createElement("button");
var tutorial = document.getElementById("Tutorial");
var infoContainer = document.getElementById("textContainer");
var textElement = document.createElement("p");
var mascot = document.getElementById("Mascot");
var mascotImg = document.getElementById("mascotImg");

let stage = 0;

// Step 0: Initializing the welcome bubble
tutorialButton.addEventListener("click", (event) => {
  tutorial.style.display = "flex"; // Changed to flex for proper centering
  tutorial.className = "tutorial-popup stage-0"; 
  
  textElement.textContent = "Welcome to GreenScan! Let me show you around the place!";
  nextButton.textContent = "Next";
  nextButton.style.display = "inline-block";

  infoContainer.appendChild(textElement);
  infoContainer.appendChild(nextButton);
  
  mascot.style.display = "none";
});

// Stepping through the stages
nextButton.addEventListener("click", (event) => {
  stage++;
  
  // Wipe previous stage classes and apply the current one
  tutorial.className = `tutorial-popup stage-${stage}`;
  mascotImg.className = `mascotImg stage-${stage}`;

  if (stage === 1) {
    textElement.textContent = "You can click on this little gear to change the settings!";
    settings.style.boxShadow = "0 0 20px rgba(255, 255, 255, 0.61)";
  } else if (stage === 2) {
    settings.style.boxShadow = "none";
    textElement.textContent = "You can click on this button to use your device's camera to take a picture of the plant in question; great for if you have the plant in front of you!";
    capture.style.boxShadow = "0 0 20px rgba(255, 255, 255, 0.61)";
  } else if (stage === 3) {
    capture.style.boxShadow = "none";
    textElement.textContent = "You can click on this button to upload a picture you've already taken; great for if you want to identify a plant you've seen before!";
    upload.style.boxShadow = "0 0 20px rgba(255, 255, 255, 0.61)";
  } else if (stage === 4) {
    upload.style.boxShadow = "none";
    textElement.textContent = "You can use the search bar to enter the name of a plant to get information on it!";
    search.style.boxShadow = "0 0 20px rgba(255, 255, 255, 0.61)";
  } else if (stage === 5) {
    search.style.boxShadow = "none";
    textElement.textContent = "You can click on this button to view any plant results that you have previously favourited!";
    fav.style.boxShadow = "0 0 20px rgba(255, 255, 255, 0.61)";
  } else if (stage === 6) {
    fav.style.boxShadow = "none";
    textElement.textContent = "When Foraging always make sure you are taking a plant in small enough quantities to not harm the local ecosystem. When eating anything you forage it is a good idea to double check your find with multiple sources, use our identification as one of your sources and make sure to always double check the information you recieve. We do not take responsibility for what any user of our app does with the information provided, please forage responsibly.";
    nextButton.textContent = "I Agree";
  } else if (stage === 7) {
    textElement.textContent = "Please select how you would like to identify the plant from one of the options below!";
    nextButton.style.display = "none";
  }
});

const settings = document.getElementById('settings');
const capture = document.getElementById('capture-card');
const upload = document.getElementById('upload-card');
const fav = document.getElementById('favourites-card');
const search = document.getElementById('search-bar');

let mushroomClicks = 0;

const mushroom = document.getElementById("mascotImg");
const mushroomWrap = document.getElementById("mascotShakeWrap");

// check if tutorial was completed
//if (localStorage.getItem("tutorialComplete") === "true") {

    mushroom.addEventListener("click", () => {
        mushroomClicks++;
         mushroomWrap.classList.add("mushroom-shake");

        setTimeout(() => {
          mushroomWrap.classList.remove("mushroom-shake");
        }, 350);

        if (mushroomClicks === 10) {
            textElement.textContent = "🍄 Ouch!";
        }

        if (mushroomClicks === 15) {
            textElement.textContent = "Okay seriously stop poking me.";
        }

        if (mushroomClicks === 20) {
            textElement.textContent = "This is why mushrooms grow in dark places.";
        }
        if (mushroomClicks === 25) {
          textElement.textContent = "Touch grass instead.";
        }
        if (mushroomClicks === 30) {
          textElement.textContent = "I’m filing a harassment report.";
        }
        if (mushroomClicks === 35) {
          textElement.textContent = "Achievement unlocked: Fungus Menace.";
          mushroom.classList.add("angry");
        }
    });

//}