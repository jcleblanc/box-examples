from boxsdk import Client
from boxsdk import JWTAuth
from flask import Flask
import config
import requests

app = Flask(__name__)

# Configure JWT auth and fetch access token
auth = JWTAuth(
  client_id=config.client_id,
  client_secret=config.client_secret,
  enterprise_id=config.enterprise_id,
  jwt_key_id=config.jwt_key_id,
  rsa_private_key_file_sys_path=config.private_key_path,
  rsa_private_key_passphrase=config.private_key_passphrase
)

# Obtain client auth
access_token = auth.authenticate_instance()
client = Client(auth)

@app.route('/')
def index():
  """Flask route for file download
  
  Search for a user by name and auth as that user. 
  Search for a watermarked PDF file by name and capture file ID.
  Make request for representational data for that file.
  Make request to download file
  
  Returns:
     A string containing the message to be displayed to the user
  """
  
  # Fetch user by name and auth app user
  users = client.users(filter_term=config.user_name)
  box_user = users[0] if users else client.create_user(config.user_name)
  user_at = auth.authenticate_app_user(box_user)

  # Search for file by name and get first result returned
  file_search = client.search(config.file_name, limit=1, offset=0)
  fid = file_search[0].get(fields=['name']).id

  # Get representation data (download URI template) for watermarked PDF
  uri = "https://api.box.com/2.0/files/%s?fields=representations" % (fid)
  response = requests.get(uri, headers={'Authorization': 'Bearer ' + user_at, 'x-rep-hints': '[pdf]'});
  file_info = response.json()
  file_uri = file_info['representations']['entries'][0]['content']['url_template']
  file_uri_dl = file_uri.replace('{+asset_path}', '')

  # Download watermarked PDF 
  download_file(file_uri_dl, "./%s.pdf" % (fid), user_at)
  return file_uri_dl

def download_file(url, localPath, at):
  """Downloads a file from Box

  Makes an authenticated request to the Box API to download a given
  watermarked PDF, and save to a local file.
  
  Returns:
     A string containing the message to be displayed to the user
  """

  # Fetch Box file and write locally
  req = requests.get(url, headers={'Authorization': 'Bearer ' + at}, stream=True)
  with open(localPath, 'wb') as local_file:
    for chunk in req.iter_content(chunk_size=1024): 
      if chunk: # filter out keep-alive new chunks
        local_file.write(chunk)