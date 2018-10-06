// Create event
var keyPressEvent = document.createEvent("Event");
keyPressEvent.initEvent("keydown", true, true);
// Keypress s
keyPressEvent.keyCode = 83;
keyPressEvent.which = 's';
// Dispatch event
document.dispatchEvent(keyPressEvent);

console.log('Starting Speakers Notes...');