# Box UI Elements Sample Application

This sample application will showcase a bare bones implementation of [Box UI Elements](https://developer.box.com/v2.0/page/box-ui-elements). It's a Node / Express application that uses Pug templates for the front-end content.

The sample will:

* Run a localhost server, allowing you to display each UI Element via the URI.
* Capture an access token with the Node SDK, then downscope the token to be send to the front-end Pug templates. Tokens are not stored in this sample.

## Setup Keys and Application

To set up this application, you need to first generate a public / private key set, to be used in the JWT auth process. Open up a terminal window, go to your application directory (or wherever your keystore is), then type in the following commands: 

```
openssl genrsa -des3 -out private.pem 2048
openssl rsa -in private.pem -out public.pem -outform PEM -pubout
```

Next, follow these steps to add the key to your app:
* Go to the [developer console](https://app.box.com/developers/console) and load up your application (create a new JWT / OAuth app if one has not already been created).
* Within the *Configuration* section on the left nav, go to the *Add and Manage Public Keys* section. Click on "Add public key" and copy the entire contents of the public.pem file that you just created into the textbox. Once added, that public key will be assigned an ID. Take note of that ID as it will be added to the config file.

The last item to configure in the app is to go to the *CORS Domains* section near the bottom of the same *Configuration* tab. Add in the domain/port information for where the sample app will run from (by default that's http://localhost:3000). 

## Setting up the Sample

From your sample applicaton directory, install the required dependencies by running the following command in your terminal

```
npm install
```

Next, load up config.js and replace the following placeholder values:

* jwtClientId: The client ID of your application (available in the configuration section of your application).
* jwtClientSecret: The client secret of your application (available in the configuration section of your application).
* publicKeyId: The ID provided when you added your public key to the application in the Setup Keys and Application section.
* enterpriseId: Your enterprise ID (available in the configuration section of your application).
* keyPath (optional): If the path to your private.pem file is different than the application directory, change it here.
* keyPass: The password for your private.pem file.
* elementIds.contentExplorer: The folder ID to display in the content explorer UI Element.
* elementIds.contentPicker: The folder ID to display in the content picker UI Element.
* elementIds.contentPreview: The file ID to display in the content preview UI Element.
* elementIds.contentUploader: The folder ID to display in the content uploader UI Element.

## Running te Sample

To run the sample, start the server via the following command from your terminal:

```
node sample_sdk.js
```

The server will start. In a browser, load each of the UI Elements via the following endpoints:

* Content Explorer: http://localhost:3000/elements/contentExplorer
* Content Picker: http://localhost:3000/elements/contentPicker
* Content Preview: http://localhost:3000/elements/contentPreview
* Content Uploader: http://localhost:3000/elements/contentUploader
