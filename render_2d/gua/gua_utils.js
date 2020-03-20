const log = console.log.bind(console)

const e = (sel) => document.querySelector(sel)

const bindEvent = (element, eventName, callback) => {
    element.addEventListener(eventName, callback)
}
