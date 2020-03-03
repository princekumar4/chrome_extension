chrome.browserAction.onClicked.addListener(function(tab){
    chrome.debugger.attach({tabId:tab.id}, 
        version,onAttach.bind(null, tab.id));
});

var version = "1.0"

//open new tab with its tabId
function onAttach(tabId){
    if(chrome.runtime.lastError){
        alert(chrome.runtime.lastError.message);
        return;
    }

    window.open("headers.html?"+tabId);
}

// chrome.runtime.onMessage.addListener(
//     function(request, sender, sendResponse) {
//         console.log(request.cookie);
//     });