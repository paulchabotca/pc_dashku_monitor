# Instructions
#
# easy_install requests
# python dashku_WIDGETID.py
#
import requests
import json

payload = JSONDATA
headers = {'content-type': 'application/json'}

requests.post('URL', data=json.dumps(payload),headers=headers)