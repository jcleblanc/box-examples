'use strict';

// Initialize packages
const app = require('express')();           // Express
const appConfig = require('./config.js');   // Auth keys and Box SDK
const boxSDK = appConfig.boxSDK;            // Box SDK
const fs = require('fs');                   // File system accessor for RSA keys
const http = require('http');               // HTTP for Express server
const pug = require('pug');                 // Pug templates for pages

app.set('views', './templates')
app.set('view engine', 'pug');

// Fetch private key for signing the JWT
const secret = fs.readFileSync(appConfig.privateKeyPath);

// Instantiate new Box SDK instance
const sdk = new boxSDK({
  clientID: appConfig.jwtClientId,
  clientSecret: appConfig.jwtClientSecret,
  appAuth: {
    keyID: appConfig.publicKeyId,
    privateKey: secret,
    passphrase: appConfig.keyPass
  }
});

// App client auth
const client = sdk.getAppAuthClient('enterprise', appConfig.enterpriseId);

// Render element sample via service name. serviceName = contentExplorer, contentPicker, contentPreview, contentUploader
app.get('/elements/:serviceName', function(req, res) {
  const service = req.params.serviceName;

  // Downscope token - https://developer.box.com/docs/special-scopes-for-box-ui-elements
  // Box content explorer scopes: https://developer.box.com/v2.0/docs/box-content-explorer#section-scopes
  client.exchangeToken(appConfig.tokenScopes[service]).then(tokenInfo => {
    // Render pug template sample, passing in downscoped token and the file / folder ID to render
    res.render(service, { at: tokenInfo.accessToken, fid: appConfig.elementIds[service] });
  }).catch(function(err){
    console.error(err);
  });
});

// Create server
http.createServer(app).listen(3000, function () {
  console.log('Server started: Listening on port 3000');
});