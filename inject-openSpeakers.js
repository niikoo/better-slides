var scriptElement = document.createElement("script");
scriptElement.setAttribute('src', chrome.runtime.getURL('toinject-openSpeakers.js'));
document.head.appendChild(scriptElement);
