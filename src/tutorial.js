var tutorialButton = document.getElementById("startTutorial");
var nextButton = document.createElement("button");
var tutorial = document.getElementById("Tutorial");
var infoContainer = document.getElementById("textContainer");
var textElement = document.createElement("p");
var mascot = document.getElementById("Mascot");
var mascotImg = document.getElementById("mascotImg");

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

    mascot.style.display = "none";
});

nextButton.addEventListener("click", (event) => {
    stage ++;
    if(stage === 1){
        tutorial.style.transform = "translate(26rem, -22rem)";
        textElement.textContent = "You can click on this little gear to change the settings!"
    } else if (stage === 2){
        tutorial.style.transform = "translate(-23rem, 4rem)";
        textElement.textContent = "You can click on this button to use your device's camera to take a picture of the plant in question; great for if you have the plant in front of you!";
    }  else if (stage === 3){
        tutorial.style.transform = "translate(-23rem, 11rem)";
        textElement.textContent = "You can click on this button to upload a picture you've already taken; great for if you want to identify a plant you've seen before!";
    }  else if (stage === 4){
        tutorial.style.transform = "translate(23rem, 11rem)";
        mascotImg.style.transform = "translateX(305px)";
        textElement.textContent = "You can click on this button to search by name; great for if you wanna know more about a plant you already know of!";
    } else if (stage === 5){
        tutorial.style.transform = "translate(0px, -17rem)";
        mascotImg.style.transform = "translateX(-65px)";
        textElement.textContent = "When Foraging always make sure you are taking a plant in small enough quantities to not harm the local ecosystem. When eating anything you forage it is a good idea to double check your find with multiple sources, use our identification as one of your sources and make sure to always double check the information you recieve. We do not take responsibility for what any user of our app does with the information provided, please forage responsibly.";
        nextButton.textContent = "I Agree";
    } else if (stage === 6) {
        tutorial.style.transform = "translate(0px, -22rem)";
        textElement.textContent = "Please select how you would like to identify the plant from one of the buttons below!"
        nextButton.style.display = "none";   
    }
});