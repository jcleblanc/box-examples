from flask import Flask, redirect, g, url_for
from flask_oidc import OpenIDConnect
from okta import UsersClient
from boxsdk import Client
from boxsdk import JWTAuth
import requests
import config
import json

app = Flask(__name__)
app.config.update({
  'SECRET_KEY': config.okta_client_secret,
  'OIDC_CLIENT_SECRETS': './client_secrets.json',
  'OIDC_DEBUG': True,
  'OIDC_ID_TOKEN_COOKIE_SECURE': False,
  'OIDC_SCOPES': ["openid", "profile"],
  'OIDC_CALLBACK_ROUTE': config.okta_callback_route
})

oidc = OpenIDConnect(app)
okta_client = UsersClient(config.okta_org_url, config.okta_auth_token)

# Fetch Okta user record if logged in
@app.before_request
def before_request():
  if oidc.user_loggedin:
    g.user = okta_client.get_user(oidc.user_getfield('sub'))
  else:
    g.user = None

# Main application route
@app.route('/')
def start():
  return redirect(url_for(".box_auth"))

# Box user verification
@app.route("/box_auth")
@oidc.require_login
def box_auth():
  uid = g.user.id

  # Instantiate Box Client instance
  auth = JWTAuth.from_settings_file('../config.json')
  box_client = Client(auth)

  # Validate is user exists
  url = f'https://api.box.com/2.0/users?external_app_user_id={uid}'
  response = box_client.make_request('GET', url)
  user_info = response.json()

  # If user not found, create user, otherwise fetch user token
  if (user_info['total_count'] == 0):
    user_name = f'{g.user.profile.firstName} {g.user.profile.lastName}'
    space = 1073741824

    # Create app user
    user = box_client.create_user(user_name, None, space_amount=space, external_app_user_id=uid)
    print('user {name} created')
  else:
    # Create user client based on discovered user
    user = user_info['entries'][0]
    user_to_impersonate = box_client.user(user_id=user['id'])
    user_client = box_client.as_user(user_to_impersonate)

    # Get current user
    current_user = box_client.user().get()
    print(current_user.id)

    # Get all items in a folder
    items = user_client.folder(folder_id='0').get_items()
    for item in items:
      print('{0} {1} is named "{2}"'.format(item.type.capitalize(), item.id, item.name))

    return 'Test complete'
  
# User logout
@app.route("/logout")
def logout():
  oidc.logout()