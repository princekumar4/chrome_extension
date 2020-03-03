# Bulk Post Chrome Extension

[![N|Solid](icon.png)](icon.png)

[![CircleCI](https://circleci.com/gh/circleci/circleci-docs.svg?style=svg)](https://circleci.com/gh/circleci/circleci-docs)

Bulk Post chrome extension is a plugin used to send bulk data received from googlesheet to your database.

# Features

  - Using OAuth and then assigning access token.
  - Sends bulk data one by one to database.

### Imports required
* flask
* requests
* json
* cors
* urlencode
* numpy
* pandas

### Installation

Bulk post chrome extension requires [Python](https://www.python.org/downloads/) v3+ to run.
Install the dependencies and packages required and start the server.

```sh
$ cd Sniffer
$ sudo apt-get install python3.7
$ python3 server.py
```

### Usage

* Load extension to your chrome by enabling developer mode.
* Open your form in chrome and click plugin to activate it.
> A dialogbox will appear if the user is not loggedIn into chrome to get an access_token. Otherwise, the plugin will open a new tab with respective tabId.
* Go to your form and submit it.
* The prompt will appear in the chrome extension auto created newtab asking for your googlesheetId.
* After reading the googlesheet, I'll show the user to prepare the googlesheet with these exact headers.
* When the user clicks on PROCEED button the plugin will check whether the googlesheet headers matches with form keys or not. If yes, then the googlesheet data will be posted one by one on post url.
