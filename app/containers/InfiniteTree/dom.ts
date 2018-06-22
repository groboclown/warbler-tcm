const getElementStyle = (el: any, prop: string) => {
    return window.getComputedStyle ? (window.getComputedStyle(el) as any)[prop] : el.currentStyle[prop];
};

const preventDefault = (e: Event) => {
    if (typeof e.preventDefault !== 'undefined') {
        e.preventDefault();
    } else {
        e.returnValue = false;
    }
};

const stopPropagation = (e: Event) => {
    if (typeof e.stopPropagation !== 'undefined') {
        e.stopPropagation();
    } else {
        e.cancelBubble = true;
    }
};

// https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Compatibility
const addEventListener = (target: Element, type: string, listener: EventListenerOrEventListenerObject) => {
    if (target.addEventListener) { // Standard
        target.addEventListener(type, listener, false);
    }
};

// https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener
const removeEventListener = (target: Element, type: string, listener: EventListenerOrEventListenerObject) => {
    if (target.removeEventListener) { // Standard
        target.removeEventListener(type, listener, false);
    }
};

export {
    getElementStyle,
    preventDefault,
    stopPropagation,
    addEventListener,
    removeEventListener
};
