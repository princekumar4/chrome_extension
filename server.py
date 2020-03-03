from __future__ import print_function
from flask import Flask, request, json
from pymongo import MongoClient
import pymongo
import gspread
from oauth2client.service_account import ServiceAccountCredentials
import requests
from flask_cors import CORS
import urllib3
from urllib.parse import urlencode
import pandas as pd
import numpy as np

app = Flask(__name__)
CORS(app)

# mongoConnect = pymongo.MongoClient("mongodb://127.0.0.1:27017/userData?authSource=admin")
# db = mongoConnect.userData
# collection = db.users

'''getting all requests from header.js
@app.route('/getFormDataRequests',methods=['POST'])
def getFormRequests():
    print("response recieved by the server")
    print(request)
    inRequest = request.get_json(force=True)
    collection.insert_one(inRequest)
    mongoConnect.close()
    return "true"'''

'''getting all data from googleSpreadSheet'''
@app.route('/getScript', methods=['POST'])
def getScriptData():

    cookieRoot:str
    cookieSession:str
    finalCookie:str

    inRequest = request.get_json(force=True)
    # getting formKeys and postURL from the request
    feedUrl = inRequest['url']
    feedKey = inRequest['mapKey']
    feedCookie = inRequest['cookie']
    feedgSheetId = inRequest['gSheetId']
    feedAccessToken = inRequest['access_token']
    feedKey = [item.lower() for item in feedKey]
    print(feedKey)
    print(feedCookie)
    print(feedAccessToken)

    for i in range(len(feedCookie)):
        cookieRoot = feedCookie[i]['name']
        cookieSession = feedCookie[i]['value']
        if(i==0):
            finalCookie = cookieRoot+"="+cookieSession+";"
            # print(cookieRoot,cookieSession+";",sep='=',end='')
    finalCookie = finalCookie+cookieRoot+"="+cookieSession            
    # print(cookieRoot,cookieSession,sep='=')
    

    headers = {'authorization': f'Bearer {feedAccessToken}',
           'Content-Type': 'application/vnd.api+json'}

    google_sheet_id = feedgSheetId
    sample_range = 'Sheet1'

    # reading the associated google sheet
    df = get_google_sheet_df(headers, google_sheet_id, sample_range)

    printSheetHeaders = df[0]
    getGSheetData = df
    printSheetHeaders = [item.lower() for item in printSheetHeaders]
    print(printSheetHeaders)

    # comparing formData key with googleSheetHeaders
    print("Comparing result...")
    if feedKey == printSheetHeaders:
        print("Matched")
        postGsheet(feedUrl, getGSheetData, finalCookie)
        # print(feedUrl)
        # print(getGSheetData)
    else:
        print("formHeaders not matched")

    '''user_docs = []

    for i in (feed[1:]):
        doc = {}
         doc['firstname'] = i[0]
         doc['lastname'] = i[1]
         doc['phone'] = i[-1]
      
        user_docs += [doc]
     result = collection.insert_many(user_docs)
    print("total inserted: ", len(result.inserted_ids))'''
    return "true"

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
    # df = pd.DataFrame(values[1:])
    return df


if __name__ == '__main__':
    app.run(port=9090, debug=False)
