from __future__ import print_function
from flask import Flask, request, json
import requests
from flask_cors import CORS
import urllib3
from urllib.parse import urlencode
import pandas as pd
import numpy as np

app = Flask(__name__)
# allowing CORS policy
CORS(app)

'''getting all data from googleSpreadSheet'''
@app.route('/getScript', methods=['POST'])
def getScriptData():

    cookieRoot:str
    cookieSession:str
    finalCookie:str

    inRequest = request.get_json(force=True)
    # extracting all keys from the passed object
    feedUrl = inRequest['url']
    feedKey = inRequest['mapKey']
    feedCookie = inRequest['cookie']
    feedgSheetId = inRequest['gSheetId']
    feedAccessToken = inRequest['access_token']
    feedKey = [item.lower() for item in feedKey]

    #loop for extracting name and value from cookies object
    for i in range(len(feedCookie)):
        cookieRoot = feedCookie[i]['name']
        cookieSession = feedCookie[i]['value']
        if(i==0):
            finalCookie = cookieRoot+"="+cookieSession+";"
    finalCookie = finalCookie+cookieRoot+"="+cookieSession            
    
    #headers for reading googlesheet data using access_token
    headers = {'authorization': f'Bearer {feedAccessToken}',
           'Content-Type': 'application/vnd.api+json'}

    google_sheet_id = feedgSheetId
    sample_range = 'Sheet1'

    # reading the associated google sheet
    df = get_google_sheet_df(headers, google_sheet_id, sample_range)

    printSheetHeaders = df[0]
    getGSheetData = df
    printSheetHeaders = [item.lower() for item in printSheetHeaders]

    postGsheet(feedUrl, getGSheetData, finalCookie)

def postGsheet(url, getGSheetData, finalCookie):
    # encoding gSheetData into x-www-form-urlencoded
    li_of_dict = [dict(zip(getGSheetData[0], getGSheetData[i])) for i in range(1, len(getGSheetData))]

    for i in li_of_dict:
        print("fomatted data")
        print(i)
        encodedGSheetData = urlencode(i)
        print("this is encodedGSheetData")
        print(encodedGSheetData)
        print(url)
        print(finalCookie)

        header = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': finalCookie
        }

        # disabling SSL verification InsecureRequestWarning
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

        # posting encoded GSheetData
        postGData = requests.post(url, headers=header, data=encodedGSheetData)
        # collection.insert(getGSheetData[i],check_keys=False)
        print("this is post status code")
        print(postGData.content)
        print(postGData.text)
        print(postGData.status_code)
    return "true"

def get_google_sheet_df(headers: dict, google_sheet_id: str, _range: str):
    """_range is in A1 notation (i.e. A:I gives all rows for columns A to I)"""

    url = f'https://sheets.googleapis.com/v4/spreadsheets/{google_sheet_id}/values/{_range}'
    r = requests.get(url, headers=headers)
    df = r.json()['values']
    return df

#main
if __name__ == '__main__':
    app.run(port=9090, debug=False)
