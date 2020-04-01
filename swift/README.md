# Box Swift SDK JWT Sample Application
This Swift application showcases a simple integration of the Box Swift SDK in a JWT/OAuth 2 application. This uses the standard JWT sample application released with the Box Swift SDK and a custom token generator to produce downscoped tokens for the Swift mobile application to run off of.

This application is a simple integration sample and does not follow best practices for secure storage of your application settings or token generation process, it is simply an integration example. Please take care to properly secure all sensitive information in your production samples.

To set up the application follow the below two sections to configure your application.

## Token Generator
The purpose of the token generator is to simply output downscoped access tokens for the Swift SDK to start making valid API requests to Box. In this sample the token generator is being run from a Heroku application, but this can run from any publicly available URL.

To set up the token generator:
1. Create a JWT application from the [Box Developer Console](https://cloud.app.box.com/developers/console) and download your config.json file after setting up your public key. 
2. Copy the config.json file to the same folder as the token generator code.
3. Upload application to Heroku or some other publicly accessible URL.

## JWT Sample Application
The Swift sample is the actual application that will run requests to Box APIs. To set it up:
1. Load the application in XCode.
2. Load constants.swift and add the client ID and secret from your JWT application on Box.
3. Load ViewController.swift and replace the Heroku URL on line 139 with the URL for your token generator in the above section.
4. Run the application to view a sample which will show all folders / files at the root of the account.
