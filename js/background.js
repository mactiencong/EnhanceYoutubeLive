let isEnable = true

function start(){
  chrome.browserAction.onClicked.addListener(function(tab) {
    if(isEnable) {
        disable()
    } else enable()
  })
}

function enable(){
  isEnable = true
  start()
}

function disable(){
  isEnable = false
  chrome.webRequest.onBeforeRequest.removeListener(blockListener)
}


let allowUrlPatterns = []

function loadAllowUrlPatterns(){
  const url = chrome.runtime.getURL('../data/allowUrlPatterns.json')
  return fetch(url)
    .then(response => response.json())
    .then(patterns => patterns)
}

function start(){
  loadAllowUrlPatterns().then(data => {
    allowUrlPatterns = data
    startBlock()
  })
}

function startBlock(){
  chrome.webRequest.onBeforeRequest.addListener(
    blockListener,
    {urls: ["<all_urls>"]},
    ["blocking"]
  )
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

enable()