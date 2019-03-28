let isEnable = false

function start(){
  chrome.browserAction.onClicked.addListener(() => {
    if(isEnable) {
        disable()
    } else enable()
  })
}

function enable(){
  setEnableIcon()
  isEnable = true
  run()
}

function setEnableIcon(){
  chrome.browserAction.setIcon({
      path : "icon/enable.png"
  })
}

function disable(){
  setDisableIcon()
  isEnable = false
  stopBlocking()
  chrome.webNavigation.onCompleted.removeListener(startBlocking)
  chrome.webNavigation.onBeforeNavigate.removeListener(stopBlocking)
  clearBlockTimeout()
}

function setDisableIcon(){
  chrome.browserAction.setIcon({
      path : "icon/disable.png"
  })
}

let allowUrlPatterns = []

function loadAllowUrlPatterns(){
  const url = chrome.runtime.getURL('../data/allowUrlPatterns.json')
  return fetch(url)
    .then(response => response.json())
    .then(patterns => patterns)
}

function run(){
  loadAllowUrlPatterns().then(data => {
    allowUrlPatterns = data
    registerBlocking()
  })
}

function registerBlocking(){
  startBlocking()
  chrome.webNavigation.onCompleted.addListener(startBlocking, { url: [{hostContains: '.youtube.com'}] })
  chrome.webNavigation.onBeforeNavigate.addListener(stopBlocking, { url: [{hostContains: '.youtube.com'}] })
}

let blockTimeout = null
function startBlocking(){
  clearBlockTimeout()
  blockTimeout = setTimeout(()=>{
    chrome.webRequest.onBeforeRequest.addListener(
      blockListener,
      {urls: ["<all_urls>"]},
      ["blocking"]
    )
    clearBlockTimeout()
  }, 3000) // start block after 120s (120000) for loading image, css ...
}

function stopBlocking(){
  clearBlockTimeout()
  chrome.webRequest.onBeforeRequest.removeListener(blockListener)
}

function clearBlockTimeout(){
  if(blockTimeout!==null) {
    clearTimeout(blockTimeout)
    blockTimeout = null
  }
}

function isAllow(details){
    for (let index = 0; index < allowUrlPatterns.length; index++) {
        const pattern = allowUrlPatterns[index]
        if(details.url.indexOf(pattern) !== -1) return true
    }
    return false
}

function blockListener(details) {
  if(!isAllow(details)){
      return {cancel: true}
  }
}

start()
disable()