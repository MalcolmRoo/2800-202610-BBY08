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
  mascotImg.className = `mascot-img stage-${stage}`;

  if (stage === 1) {
    textElement.textContent = "You can click on this little gear to change the settings!";
  } else if (stage === 2) {
    textElement.textContent = "You can click on this button to use your device's camera to take a picture of the plant in question; great for if you have the plant in front of you!";
  } else if (stage === 3) {
    textElement.textContent = "You can click on this button to upload a picture you've already taken; great for if you want to identify a plant you've seen before!";
  } else if (stage === 4) {
    textElement.textContent = "You can click on this button to search by name; great for if you wanna know more about a plant you already know of!";
  } else if (stage === 5) {
    textElement.textContent = "When Foraging always make sure you are taking a plant in small enough quantities to not harm the local ecosystem. When eating anything you forage it is a good idea to double check your find with multiple sources, use our identification as one of your sources and make sure to always double check the information you recieve. We do not take responsibility for what any user of our app does with the information provided, please forage responsibly.";
    nextButton.textContent = "I Agree";
  } else if (stage === 6) {
    textElement.textContent = "Please select how you would like to identify the plant from one of the buttons below!";
    nextButton.style.display = "none";
  }
});
