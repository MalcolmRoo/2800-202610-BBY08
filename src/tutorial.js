

var tutorialButton = document.getElementById("startTutorial");

tutorialButton.addEventListener("click", (event) => {
    var tutorial = document.getElementById("Tutorial");
    var infoContainer = document.getElementById("textContainer");
    tutorial.style.display = "inline";

    var html = "";

    html += "<p>This is some testing text to see how the text container handles a large amount of text" +
    "which is just a bunch of random ramblings!!!!";

    infoContainer.innerHTML = html;
})