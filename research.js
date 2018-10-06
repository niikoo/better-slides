

// var jq = document.createElement('script');
// jq.src = "https://code.jquery.com/jquery-3.1.1.min.js";
// document.getElementsByTagName('head')[0].appendChild(jq);
var rightBtn = document.getElementById("punch-start-presentation-right");
// var rbtjq = $(rightBtn)

if (rightBtn.getAttribute('aria-expanded') === 'true') {
    var menuRoot = document.getElementsByClassName('goog-menu goog-menu-vertical docs-material punch-present-menu')[0];
    rightBtn.setAttribute('aria-activedescendant', rightBtn.children[0].id);
    var e = new MouseEvent('mousedown', {

    });
    e.srcElement = rightBtn;
    window.getEventListeners(menuRoot).mousedown[0].listener(e);
} else {
    var e = new MouseEvent('mousedown');
    e.srcElement = rightBtn;
    e.target = rightBtn;
    window.getEventListeners(rightBtn).mousedown[0].listener(e);
}


var menuRoot = document.getElementsByClassName('goog-menu goog-menu-vertical docs-material punch-present-menu')[0];
var menuElement = menuRoot.children[0].children[0].children[0];
console.log('Simulating click on element', menuElement);
console.log('Setting aria-activedescendant to', menuRoot.children[0].id);
menuRoot.setAttribute('aria-activedescendant', menuRoot.children[0].id);
var e = new MouseEvent('mousedown');
e.srcElement = menuElement;
e.target = menuElement;
console.log('Using event: ', e)
getEventListeners(menuRoot).mousedown[0].listener(e);
getEventListeners(menuRoot).mousedown[1].listener(e)