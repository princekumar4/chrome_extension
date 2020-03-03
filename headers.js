var tabId = parseInt(window.location.search.substring(1));

var gSheetId;
var access_token;

//capturing requests of a particular activated tabid....
var requests = {};
var postData = {};
var cookies = null;

window.addEventListener("load", function () {
  chrome.debugger.sendCommand({
    tabId: tabId
  }, "Network.enable");
});

window.addEventListener("unload", function () {
  chrome.debugger.detach({
    tabId: tabId
  });
});

//getting authentication token
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

//onEvent
function onEvent(debuggeeId, message, params) {
  if (tabId != debuggeeId.tabId)
    return;

  if (message == "Network.requestWillBeSent") {
    var requestDiv = requests[params.requestId];
    if (!requestDiv) {
      //allNetworkRequests = params.request;
      if (params.request.method == "POST") {
        postURL = params.request.url;
        postData = params.request.postData;
        console.log(params.request);
        console.log("This is a POST request url and postData");
        console.log(JSON.stringify(postURL, undefined, 4));
        console.log(JSON.stringify(postData, undefined, 4));
        console.log(access_token);
        //inserting Keys into array
        storeKey = [];
        var myRegex = /([^&]+)=/g;
        var out = myRegex.exec(postData);
        while (out != null) {
          finalKey = out[0].replace('=', '');
          storeKey.push(finalKey);
          out = myRegex.exec(postData);
        }

        //capturing cookies
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

              // //horizontal rule
              // var hr = document.createElement('hr');
              // document.body.appendChild(hr);

              //getting googlesheetId from user
              gSheetId = prompt("Please provide your googlesheet Id");
              if (!gSheetId) {
                console.log("Operation Cannot be Performed! Please refresh");
                alert("Operation Cannot be Performed! Please refresh");
              } else {
                //Converting postURL and Keys into json format
                var data = {
                  'url': postURL,
                  'mapKey': storeKey,
                  'cookie': cookies,
                  'gSheetId': gSheetId,
                  'access_token': access_token
                }
                console.log(data);
                // proceedButton.setAttribute("onclick", "promptForgSheetId(data);");
                var proceedButton = document.createElement("INPUT");
                proceedButton.setAttribute("type", "submit");
                proceedButton.setAttribute("id", "submit");
                proceedButton.setAttribute("value", "PROCEED");
                proceedButton.onclick = function () {
                  promptForgSheetId(data);
                }
                document.body.appendChild(proceedButton);
                // //horizontal rule
                // var hr = document.createElement('hr');
                // document.body.appendChild(hr);
              }
            } else {
              console.log('Can\'t get cookie! Check the name!');
            }
          });
      }
    }
  }
}

function promptForgSheetId(data) {
  // console.log(data);
  // read googlesheetdata
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
    // console.log(value.values[0]);
    // console.log(data.mapKey);
    compareGSheetHeaders(value.values[0], data.mapKey, data);
  })
}

function compareGSheetHeaders(sheetHeaders, formHeaders, data) {
  if (JSON.stringify(sheetHeaders) === JSON.stringify(formHeaders)) {
    alert("Have patience");
    pass(data);
  } else {
    return alert("Problem Somewhere! Headers are not matched!");
  }
}


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

//console.log(JSON.stringify(netcalls, undefined, 4));

/*if(params.request.method == "POST"){
  console.log("This is a POST request body");
  console.log(params.request.postData);
  console.log(params.request);
}*/

/*var requestDiv = document.createElement("div");
      requestDiv.className = "request";
      requests[params.requestId] = requestDiv;
      var urlLine = document.createElement("div");
      urlLine.textContent = params.request.url;
      requestDiv.appendChild(urlLine);
    }

    /*if (params.redirectResponse)
      appendResponse(params.requestId, params.redirectResponse);

    var requestLine = document.createElement("div");
    requestLine.textContent = "\n" + params.request.method + " " +
      parseURL(params.request.url).path + " HTTP/1.1";    //line 2
    requestDiv.appendChild(requestLine);
    document.getElementById("container").appendChild(requestDiv);
  
  } /*else if (message == "Network.responseReceived") {
    appendResponse(params.requestId, params.response);
  }
}

/*function appendResponse(requestId, response) {
  var requestDiv = requests[requestId];
  if (requestDiv != null)
    requestDiv.appendChild(formatHeaders(response.requestHeaders));

  var statusLine = document.createElement("div");
  statusLine.textContent = "\nHTTP/1.1 " + response.status + " " + response.statusText;  //line 3
  if (requestDiv != null) {
    requestDiv.appendChild(statusLine);
    requestDiv.appendChild(formatHeaders(response.responseheaders));
  }
}

function formatHeaders(headers) {
  var text = "";
  for (name in headers)
    text += name + ": " + headers[name] + "\n";
  var div = document.createElement("div");
  div.textContent = text;
  return div;
}

function parseURL(url) {
  var result = {};
  var match = url.match(
    /^([^:]+):\/\/([^\/:]*)(?::([\d]+))?(?:(\/[^#]*)(?:#(.*))?)?$/i);
  if (!match)
    return result;
  result.scheme = match[1].toLowerCase();
  result.host = match[2];
  result.port = match[3];
  result.path = match[4] || "/";
  result.fragment = match[5];
  return result;

}*/