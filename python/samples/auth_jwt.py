from boxsdk import Client
from boxsdk import JWTAuth
from flask import Flask
import config_jwt
import requests
import logging

app = Flask(__name__)

# Configure JWT auth and fetch access token
auth = JWTAuth(
  client_id=config_jwt.client_id,
  client_secret=config_jwt.client_secret,
  enterprise_id=config_jwt.enterprise_id,
  jwt_key_id=config_jwt.jwt_key_id,
  rsa_private_key_file_sys_path=config_jwt.private_key_path,
  rsa_private_key_passphrase=config_jwt.private_key_passphrase
)
access_token = auth.authenticate_instance()

BOX_USER_NAME = config_jwt.user_name
FOLDER_ID = config_jwt.folder_id

client = Client(auth)

users = client.users(filter_term=BOX_USER_NAME)
box_user = users[0] if users else client.create_user(BOX_USER_NAME)

root_folder = client.as_user(box_user).folder(folder_id=FOLDER_ID).get()
print 'folder owner: ' + root_folder.owned_by['login']
print 'folder name: ' + root_folder['name']

client.as_user(box_user).folder(folder_id=FOLDER_ID).rename('Tax Rename')