var slideLocation = window.location.href.replace('edit', 'present');

function setStartSpeakersButton() {
	var title_bar = document.querySelector('.docs-titlebar-buttons');
	var btn_container = document.createElement("a");
	btn_container.href = slideLocation;
	btn_container.className = 'goog-inline-block jfk-button jfk-button-standard docs-titlebar-button';
	btn_container.style.marginRight = '0';
	btn_container.style.cursor = 'pointer';
	btn_container.style.textDecoration = 'none';
	btn_container.style.color = 'black';
	var label_container = document.createElement("span");
	label_container.innerHTML = 'Present with Better Slides';
	btn_container.appendChild(label_container);
	title_bar.insertBefore(btn_container, title_bar.childNodes[0]);
}

function shortcutStart(event) {
	if (event.keyCode === 66) { // b
		window.location = slideLocation;
	}
}

setStartSpeakersButton();
document.addEventListener('keydown', shortcutStart, true);
