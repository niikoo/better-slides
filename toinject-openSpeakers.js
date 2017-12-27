// On créé un event
var keyPressEvent = document.createEvent("Event");
keyPressEvent.initEvent("keydown", true, true);
// Appui sur la touche S
keyPressEvent.keyCode = 83;
// On envoi l'event	
document.dispatchEvent(keyPressEvent);

console.log("Starting Speakers Notes...")
