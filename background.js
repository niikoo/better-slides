// Constants
const UPDATE_LAYOUT_DELAY = 2000;
const PRESENT_REGEX = /^https:\/\/docs\.google\.com\/presentation\/d\/[\w\_\-]+\/present(\?.*)?$/g;
const EDIT_REGEX = /^https:\/\/docs\.google\.com\/presentation\/d\/[\w\_\-]+\/edit(\?.*)?$/g;

// Variables
// True if there is a dual screen (or more)
var doubleScreen = false;
// Values of the workArea of the main screen
var primary = null;
// Values of the workArea of the second screen
var secondary = null;
// Timeout throttle
var updateLayoutTimeout = null;

// Current slide title
var actualSlideTitle = null;
// The id of the window containing the presentation and the id of the tab
var slideWindowId = null;
var slideTabId = null;
// The id of the window containing the presenter mode
var speakersWindowId = null;
// True if the user has closed the speakers
var speakersClosed = false;

function moveAndState(windowId, workArea, state) {
    if (windowId != null) {
        chrome.windows.update(windowId, {
            left: workArea.left,
            top: workArea.top,
            width: workArea.width,
            height: workArea.height,
            focused: true
        }, function then(window) {
            if (window.state != state) {
                setTimeout(function() {
                    chrome.windows.update(windowId, {
                        state: state
                    });
                }, 500); // Magic timeout
            }
        });
    }

}

// Makes the windows properly
function setWindows() {
    if (doubleScreen) {

        if (speakersWindowId == null) {
            if (!speakersClosed) {
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

        if (speakersWindowId != null) {
            var id = speakersWindowId;
            speakersWindowId = null;
            chrome.windows.remove(id);
        }
    }
}

// Calls an update function. Avoids multiple calls
function updateLayout() {
    clearTimeout(updateLayoutTimeout);

    updateLayoutTimeout = setTimeout(function() {
        setWindows();
    }, UPDATE_LAYOUT_DELAY);
}

// Get the size and id of the main screen
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

// Retrieves information on the primary and secondary screen
function getLayoutWorkArea(layouts) {
    doubleScreen = layouts.length >= 2;
    primary = getPrimary(layouts);

    if (doubleScreen) {
        // @ts-ignore
        i = 0;
        // @ts-ignore
        while (layouts[i].id == primary.id) {
            // @ts-ignore
            i++
        }
        // @ts-ignore
        secondary = layouts[i].workArea
    }
    updateLayout();
}

// Retrieves the information on the screens
function getLayout() {
    // @ts-ignore
    chrome.system.display.getInfo(function(displayLayouts) {
        getLayoutWorkArea(displayLayouts);
    });
}

// Start looking at the size of the screens
function startLayoutUpdater() {
    // Retrieves the information on the screens at the start of the extension (with chrome)
    getLayout();

    // Retrieves the information on the screens during an update
    // @ts-ignore
    chrome.system.display.onDisplayChanged.removeListener(getLayout);
    // @ts-ignore
    chrome.system.display.onDisplayChanged.addListener(getLayout);
}

// When a tab is modified (ex: title changed)
function onTabUpdated(tabId, changeInfo, tab) {
    if (tab.url.match(PRESENT_REGEX) && actualSlideTitle != tab.title) {
        // New Slide
        slideWindowId = tab.windowId;
        slideTabId = tab.id;
        actualSlideTitle = tab.title;
        speakersWindowId = null;
        speakersClosed = false;

        startLayoutUpdater();
    } else if ("title" in changeInfo && ~changeInfo.title.indexOf(actualSlideTitle) && tab.url == "") {
        // New Speakers
        speakersWindowId = tab.windowId;
        setWindows();
    } else if (tab.title == actualSlideTitle && tab.url.match(EDIT_REGEX) && slideWindowId == tab.windowId) {
        // Quit Slides
        slideWindowId = null;
        slideTabId = null;
        actualSlideTitle = null;

        moveAndState(tab.windowId, primary, "normal");
    }
}

// When a tab is closed
function onTabRemoved(tabId, removeInfo) {
    console.log('Tab removed; tabId', tabId, 'removeInfo:', removeInfo);
    if (removeInfo.windowId == speakersWindowId) {
        console.log('It was the speakersWindowId');
        moveAndState(slideWindowId, primary, "normal");
        chrome.tabs.get(slideTabId, function(tab) {
            chrome.tabs.update(slideTabId, {
                url: tab.url.replace('presentation', 'PRESENTATION').replace("present", "edit").replace("PRESENTATION", "presentation")
            });
        });
        speakersWindowId = null;
        speakersClosed = true;
    } else if (removeInfo.windowId == slideWindowId) {
        // Quit Slides
        console.log('It was the slide window id');
        slideWindowId = null;
        slideTabId = null;
        actualSlideTitle = null;
    }
}

// Setup of the listeners
chrome.tabs.onUpdated.addListener(onTabUpdated);
chrome.tabs.onRemoved.addListener(onTabRemoved);