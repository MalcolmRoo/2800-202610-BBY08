var tutorialButton = document.getElementById("startTutorial");
var nextButton = document.createElement("button");
var tutorial = document.getElementById("Tutorial");
var infoContainer = document.getElementById("textContainer");
var textElement = document.createElement("p");

let stage = 0;

tutorialButton.addEventListener("click", (event) => {
    tutorial.style.display = "inline";
    tutorial.style.background = "darkkhaki";
    
    textElement.textContent = "Welcome to GreenScan! Let me show you around the place!"
    
    textElement.style.margin = "12px";
    textElement.style.padding = "3px";
    textElement.style.color = "cornsilk";

    infoContainer.appendChild(textElement);

    nextButton.textContent = "Next";
    nextButton.style.padding = "10px";
    nextButton.style.marginLeft = "126px";
    nextButton.style.marginBottom = "5px";
    nextButton.style.background = "darkolivegreen";
    nextButton.style.borderRadius = "8px";
    nextButton.style.color = "darkkhaki";

    infoContainer.appendChild(nextButton);

    tutorialButton.style.display = "none";
});

nextButton.addEventListener("click", (event) => {
    stage ++;
    if(stage === 1){
        tutorial.style.transform = "translate(410px, -173px)";
        textElement.textContent = "You can click on this little gear to change the settings!"
    } else if (stage === 2){
        tutorial.style.transform = "translate(-374px, 247px)";
        textElement.textContent = "You can click on this button to use your device's camera to take a picture of the plant in question; great for if you have the plant in front of you!";
    }  else if (stage === 3){
        tutorial.style.transform = "translate(-374px, 350px)";
        textElement.textContent = "You can click on this button to upload a picture you've already taken; great for if you want to identify a plant you've seen before!";
    }  else if (stage === 4){
        tutorial.style.transform = "translate(374px, 350px)";
        textElement.textContent = "You can click on this button to search by name; great for if you wanna know more about a plant you already know of!";
    } else if (stage === 5){
        tutorial.style.transform = "translate(0px, -100px)";
        textElement.textContent = "Please selection the option you feel best suits your needs!"
        nextButton.style.display = "none";
    }
});