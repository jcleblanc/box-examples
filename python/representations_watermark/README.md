# Box Representations API Sample Application

This sample application will showcase a bare bones implementation of [Box Representations API](https://developer.box.com/v2.0/reference#representations) using Python and Flask for the web framework.

The sample will:

* Run a localhost server, allowing you to run the sample against the root endpoint.
* Set up a JWT auth'd application and search for and auth as a user.
* Search for a file by name (with a watermark applied), then use the Representations API to download the PDF file with watermark intact.

## Setup Keys and Application

To set up this application, you need to first generate a public / private key set, to be used in the JWT auth process. Open up a terminal window, go to your application directory (or wherever your keystore is), then type in the following commands: 

```
openssl genrsa -des3 -out private.pem 2048
openssl rsa -in private.pem -out public.pem -outform PEM -pubout
```

Next, follow these steps to add the key to your app:
* Go to the [developer console](https://app.box.com/developers/console) and load up your application (create a new JWT / OAuth app if one has not already been created).
* Within the *Configuration* section on the left nav, go to the *Add and Manage Public Keys* section. Click on "Add public key" and copy the entire contents of the public.pem file that you just created into the textbox. Once added, that public key will be assigned an ID. Take note of that ID as it will be added to the config file.

The last item to configure in the app is to go to the *CORS Domains* section near the bottom of the same *Configuration* tab. Add in the domain/port information for where the sample app will run from (by default that's http://127.0.0.1:5000/). 

## Setting up the Sample

Load up config_jwt.py and replace the following placeholder values:

* user_name: An enterprise user name to search for and auth as.
* file_name: The file name (PDF) to find and download.
* folder_id: A folder ID to use.
* client_id: The client ID of your application (available in the configuration section of your application).
* client_secret: The client secret of your application (available in the configuration section of your application).
* enterprise_id: Your enterprise ID (available in the configuration section of your application).
* jwt_key_id: The ID provided when you added your public key to the application in the Setup Keys and Application section.
* private_key_path: The path to your private.pem file. 
* private_key_passphrase: The password for your private.pem file.

## Running te Sample

To run the sample, start the server via the following command from your terminal:

```
FLASK_APP=representations_pdf_jwt.py flask run
```

The server will start. Go to http://127.0.0.1:5000/ in a browser to initiate the sample. 

