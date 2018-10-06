function shortcutQuit(event) {
    if (event.keyCode === 27) { // ESC
        var editLocation = window.location.href.replace('presentation', 'PRESENTATION').replace("present", "edit").replace("PRESENTATION", "presentation");
        window.location = editLocation;
    }
}

document.addEventListener('keydown', shortcutQuit, true);