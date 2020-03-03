var tabId = parseInt(window.location.search.substring(1));

var gSheetId;
var access_token;

//capturing requests of a particular activated tabid....
var requests = {};
var postData = {};
var cookies = null;

//on load event
window.addEventListener("load", function () {
  chrome.debugger.sendCommand({
    tabId: tabId
  }, "Network.enable");
});

//on unload event
window.addEventListener("unload", function () {
  chrome.debugger.detach({
    tabId: tabId
  });
});

//getting authentication token and calling onEvent
chrome.identity.getAuthToken({
  'interactive': true
}, function (token) {
  if (token) {
    alert("Token Successfully Assigned!");
    console.log("Token Successfully Assigned!");
    console.log(token);
    access_token = token;
    console.log("onEvent Triggered!");
    chrome.debugger.onEvent.addListener(onEvent);
  } else {
    alert("The user did not provide access. Therefore, access token is not provided.");
    return;
  }
});

//onEvent function
function onEvent(debuggeeId, message, params) {
  if (tabId != debuggeeId.tabId)
    return;

  if (message == "Network.requestWillBeSent") {
    var requestDiv = requests[params.requestId];
    if (!requestDiv) {

      //getting only POST requests
      if (params.request.method == "POST") {
        postURL = params.request.url;
        postData = params.request.postData;
        console.log(params.request);
        console.log("This is a POST request url and postData");
        console.log(JSON.stringify(postURL, undefined, 4));
        console.log(JSON.stringify(postData, undefined, 4));
        console.log(access_token);

        //inserting post formKeys into array
        storeKey = [];
        var myRegex = /([^&]+)=/g;
        var out = myRegex.exec(postData);
        while (out != null) {
          finalKey = out[0].replace('=', '');
          storeKey.push(finalKey);
          out = myRegex.exec(postData);
        }

        //capturing cookies of current domain
        chrome.cookies.getAll({
            url: postURL
          },
          function (cookies) {
            if (cookies) {
              console.log(JSON.stringify(cookies));

              //informative styling
              var heading = document.createElement("H1");
              var textHeading = document.createTextNode("Please ensure that your Googlesheet must have this sequence of headers as shown below.");
              heading.appendChild(textHeading);
              document.body.appendChild(heading);

              //horizontal rule
              var hr = document.createElement('hr');
              document.body.appendChild(hr);

              //informative styling
              var heading = document.createElement("H3");
              var textHeading = document.createTextNode("Note:- Any type of discrepancy will lead to errors.");
              heading.appendChild(textHeading);
              document.body.appendChild(heading);

              //horizontal rule
              var hr = document.createElement('hr');
              document.body.appendChild(hr);

              var text = storeKey;
              //showing headers from formdata
              for (var i = 0; i < text.length; i++) {
                var temp = document.createElement("div");
                temp.innerHTML = text[i];
                document.body.appendChild(temp);
              }

              //getting googlesheetId from user
              gSheetId = prompt("Please provide your googlesheet Id");
              if (!gSheetId) {
                console.log("Operation Cannot be Performed! Please refresh");
                alert("Operation Cannot be Performed! Please refresh");
              } else {
                //Converting postURL and Keys into json object
                var data = {
                  'url': postURL,
                  'mapKey': storeKey,
                  'cookie': cookies,
                  'gSheetId': gSheetId,
                  'access_token': access_token
                }
                console.log(data);
                //submit button as PROCEED
                var proceedButton = document.createElement("INPUT");
                proceedButton.setAttribute("type", "submit");
                proceedButton.setAttribute("id", "submit");
                proceedButton.setAttribute("value", "PROCEED");
                proceedButton.onclick = function () {
                  //calling function to read googlesheet using access_token
                  promptForgSheetId(data);
                }
                document.body.appendChild(proceedButton);
              }
            } else {
              console.log('Can\'t get cookie! Check the name!');
            }
          });
      }
    }
  }
}

//reading googlesheet using access_token
function promptForgSheetId(data) {
  var obj = {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Host': 'sheets.googleapis.com',
      'Authorization': 'Bearer ' + data.access_token
    }
  }
  const fetchPromise = fetch('https://sheets.googleapis.com/v4/spreadsheets/' + data.gSheetId + '/values/Sheet1', obj);
  fetchPromise.then(response => {
    return response.json();
  }).then(value => {
    //calling function to compare googlesheet headers with form keys
    compareGSheetHeaders(value.values[0], data.mapKey, data);
  })
}

//comparing goolesheet headers with form keys
function compareGSheetHeaders(sheetHeaders, formHeaders, data) {
  if (JSON.stringify(sheetHeaders) === JSON.stringify(formHeaders)) {
    alert("Have patience");
    pass(data);
  } else {
    return alert("Problem Somewhere! Headers are not matched!");
  }
}

//sending all required object details to server
function pass(data) {

  const response = fetch('http://127.0.0.1:9090/getScript', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }).then(response => {
    console.log(response);
    alert("Data Posted!");
  });
}