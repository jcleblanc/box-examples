from flask import Flask, redirect, request
from boxsdk import Client
from boxsdk import OAuth2

import config_oauth
import requests
import logging

app = Flask(__name__)

# Create new OAuth client & csrf token
oauth = OAuth2(
  client_id=config_oauth.client_id,
  client_secret=config_oauth.client_secret
)
csrf_token = ''

# Create Box redirect URI with csrf token and redirect user
@app.route('/start')
def start():
  global csrf_token
  auth_url, csrf_token = oauth.get_authorization_url(config_oauth.redirect_uri)

  return redirect(auth_url)

# Fetch access token and make authenticated request
@app.route('/return')
def capture():
  # Capture auth code and csrf token via state
  code = request.args.get('code')
  state = request.args.get('state')

  # If csrf token matches, fetch tokens
  assert state == csrf_token
  access_token, refresh_token = oauth.authenticate(code)

  # Upload file
  prefFilename = '206281345716.pdf'
  src_file = '/Users/jleblanc/localhost/box/python/206281345716.pdf'
  headers = {'Authorization': 'Bearer ' + access_token}
  url = 'https://upload.box.com/api/2.0/files/content'
  files = {'filename': (prefFilename, open(src_file, 'rb'))}
  data = {"parent_id": "0" }
  response = requests.post(url, data=data, files=files, headers=headers)
  file_info = response.json()
  print file_info

  return 'Done'