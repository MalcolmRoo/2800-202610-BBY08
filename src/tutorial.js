var tutorialButton = document.getElementById("startTutorial");

tutorialButton.addEventListener("click", (event) => {
    var tutorial = document.getElementById("Tutorial");
    var infoContainer = document.getElementById("textContainer");
    tutorial.style.display = "inline";

    var textElement = document.createElement("p");
    textElement.textContent = "Welcome to GreenScan! Let me show you around the place, how are you going to idenify your plant?"
    var listElement = document.createElement("ul");
    
    var captureBullet = document.createElement("li");
    var captureButton = document.createElement("button");
    captureButton.textContent = "Take a photo";
    captureBullet.appendChild(captureButton);

    var uploadBullet = document.createElement("li");
    uploadBullet.textContent = "Upload a photo"

    var textBullet = document.createElement("li");
    textBullet.textContent = "Search by name"

    listElement.appendChild(captureBullet);
    listElement.appendChild(uploadBullet);
    listElement.appendChild(textBullet);
    
    textElement.style.margin = "12px";
    textElement.style.padding = "3px";
    listElement.style.marginLeft = "35px";

    captureBullet.style.paddingBottom = "8px";
    uploadBullet.style.paddingBottom = "8px";
    textBullet.style.paddingBottom = "8px";

    infoContainer.appendChild(textElement);
    infoContainer.appendChild(listElement);
    tutorialButton.style.display = "none";
})