'use strict';

// Initialize packages
const app = require('express')();
const appConfig = require('./config.js');
const BoxSDK = appConfig.boxSDK;
const fs = require('fs');
const http = require('http');
require('pug');

app.set('views', './templates');
app.set('view engine', 'pug');

// Fetch private key for signing the JWT
let secret = '';
try {
  secret = fs.readFileSync(appConfig.privateKeyPath);
} catch (err) {
  console.error(err);
}

// Instantiate new Box SDK instance
const sdk = new BoxSDK({
  clientID: appConfig.jwtClientId,
  clientSecret: appConfig.jwtClientSecret,
  appAuth: {
    keyID: appConfig.publicKeyId,
    privateKey: secret,
    passphrase: appConfig.keyPass
  }
});

// Render element via serviceName = contentExplorer, contentPicker, contentPreview, contentUploader, contentOpenWith
app.get('/elements/:serviceName', (req, res) => {
  const service = req.params.serviceName;
  let client;
  let resource = `https://api.box.com/2.0/${appConfig.elementIds[service].type}s/${appConfig.elementIds[service].rid}`;

  console.log(resource);

  // App client or user auth
  if (appConfig.userAuth[service] === '0') { 
    client = sdk.getAppAuthClient('enterprise', appConfig.enterpriseId); 
  } else { 
    client = sdk.getAppAuthClient('user', appConfig.userAuth[service]); 
  } 

  // Downscope token - https://developer.box.com/docs/special-scopes-for-box-ui-elements
  // Box content explorer scopes: https://developer.box.com/v2.0/docs/box-content-explorer#section-scopes
  client.exchangeToken(appConfig.tokenScopes[service], resource).then((tokenInfo) => {
    // Render pug template sample, passing in downscoped token and the file / folder ID to render
    res.render(service, { at: tokenInfo.accessToken, fid: appConfig.elementIds[service].fid });
  }).catch((err) => {
    console.error(err);
  });
});

// Create server
http.createServer(app).listen(3000, () => {
  console.log('Server started: Listening on port 3000');
});
