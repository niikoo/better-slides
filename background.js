// Constantes
const UPDATE_LAYOUT_DELAY = 2000;
const PRESENT_REGEX = /^https:\/\/docs\.google\.com\/presentation\/d\/[0-9A-z_]+\/present(\?.*)?$/g;
const EDIT_REGEX = /^https:\/\/docs\.google\.com\/presentation\/d\/[0-9A-z_]+\/edit(\?.*)?$/g;

// Variables
// Vrai s'il y a un double écran (ou plus)
var doubleScreen = false;
// Valeurs de la workArea de l'écran principal
var primary = null;
// Valeurs de la workArea de l'écran secondaire
var secondary = null;
// Id du timeout throttle
var updateLayoutTimeout = null;

// Le titre du diapo actuel
var actualSlideTitle = null;
// L'id de la fenetre contenant la présentation et l'id du tab
var slideWindowId = null;
var slideTabId = null;
// L'id de la fenetre contenant le mode présentateur
var speakersWindowId = null;
// Vrai si l'utilisateur a ferme les speakers
var speakersClosed = false;

function moveAndState(windowId, workArea, state) {
	if(windowId != null) {
		chrome.windows.update(windowId, {
				left: workArea.left,
				top: workArea.top,
				width: workArea.width,
				height: workArea.height,
				focused: true
			}, function then(window) {
				if(window.state != state) {
					setTimeout(function() {
						chrome.windows.update(windowId, {
							state: state
						});
					}, 500); // Magic timeout
				}		
			});
	}

}

// Met les fenetres correctement
function setWindows() {
	if(doubleScreen) {

		if(speakersWindowId == null) {
			if(!speakersClosed) {
				chrome.tabs.executeScript(slideTabId, {
					file: 'inject-openSpeakers.js'
				});
			}
		} else {
			moveAndState(speakersWindowId, primary, "maximized");
		}
		
		moveAndState(slideWindowId, secondary, "fullscreen");
	} else {
		moveAndState(slideWindowId, primary, "fullscreen");

		if(speakersWindowId != null) {
			var id = speakersWindowId;
			speakersWindowId = null;
			chrome.windows.remove(id);
		}
	}	
}

// Appelle une fonction de mise à jour. Permet d'éviter les appels multiples
function updateLayout() {
	clearTimeout(updateLayoutTimeout);

	updateLayoutTimeout = setTimeout(function () {
		setWindows();
	}, UPDATE_LAYOUT_DELAY);
}

// Récupère la dimension et l'id de l'écran principal
function getPrimary(layouts) {
	var i = 0;
	var found = false;
	var layout

	do {
		layout = layouts[i];
		found = layout.isPrimary;
		i++
	} while (i < layouts.length && !found);

	layout.workArea.id = layout.id

	return layout.workArea
}

// Récupère les informations sur l'écran principal et secondaire
function getLayoutWorkArea(layouts) {
	doubleScreen = 	layouts.length >= 2;
	primary = getPrimary(layouts);
	
	if(doubleScreen) {
		i = 0;
		while(layouts[i].id == primary.id) {
			i++
		}
		secondary = layouts[i].workArea
	}
	updateLayout();
}

// Récupère les informations sur les écrans
function getLayout() {
	chrome.system.display.getInfo(function (displayLayouts) {
		getLayoutWorkArea(displayLayouts);
	});
}

// Commence à regarder la taille des écrans
function startLayoutUpdater() {
	// Récupère les informations sur les écrans au démarrage de l'extension (avec chrome)
	getLayout();

	// Récupère les informations sur les écrans lors d'une mise à jour
	chrome.system.display.onDisplayChanged.removeListener(getLayout);
	chrome.system.display.onDisplayChanged.addListener(getLayout);
}

// Lorsqu'un tab est modifié (ex: titre changé)
function onTabUpdated(tabId, changeInfo, tab) {
	if(tab.url.match(PRESENT_REGEX) && actualSlideTitle != tab.title) {
		// New Slide
		slideWindowId = tab.windowId;
		slideTabId = tab.id;
		actualSlideTitle = tab.title;
		speakersWindowId = null;
		speakersClosed = false;

		startLayoutUpdater();
	} else if("title" in changeInfo && ~changeInfo.title.indexOf(actualSlideTitle) && tab.url == "") {
		// New Speakers
		speakersWindowId = tab.windowId;
		setWindows();
	} else if(tab.title == actualSlideTitle && tab.url.match(EDIT_REGEX) && slideWindowId == tab.windowId) {
		// Quit Slides
		slideWindowId = null;
		slideTabId = null;
		actualSlideTitle = null;

		moveAndState(tab.windowId, primary, "normal");
	}
}

// Lorsqu'un tab est fermé
function onTabRemoved(tabId, removeInfo) {
	if(removeInfo.windowId == speakersWindowId) {
		speakersWindowId = null;
		speakersClosed = true;
	} else if(removeInfo.windowId == slideWindowId) {
		// Quit Slides
		slideWindowId = null;
		slideTabId = null;
		actualSlideTitle = null;
	}
}

// On setup les listeners
chrome.tabs.onUpdated.addListener(onTabUpdated);
chrome.tabs.onRemoved.addListener(onTabRemoved);
