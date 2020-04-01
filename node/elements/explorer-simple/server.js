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

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", '*');
  res.header("Access-Control-Allow-Credentials", true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
  next();
});

// Fetch config file for instantiating SDK instance
// REPLACE CONFIG.JSON WITH YOUR OWN VERSION WHEN CREATING A BOX APP
const configJSON = JSON.parse(fs.readFileSync('config.json'));

// Instantiate instance of SDK using generated JSON config
const sdk = BoxSDK.getPreconfiguredInstance(configJSON);

// Render element
app.get('/', (req, res) => {
  // Set resources
  const resourceType = 'folders';
  const folderId = 'FOLDER_ID';
  const resource = `https://api.box.com/2.0/${resourceType}/${folderId}`;

  // Create app client
  const client = sdk.getAppAuthClient('enterprise', appConfig.enterpriseId); 

  // Downscope token - https://developer.box.com/docs/special-scopes-for-box-ui-elements
  const scopes = 'base_explorer item_download item_preview item_rename item_share';
  client.exchangeToken(scopes, resource).then((tokenInfo) => {
    // Render pug template sample, passing in downscoped token and the file / folder ID to render
    res.render('contentExplorer', { at: tokenInfo.accessToken, fid: folderId });
  }).catch((err) => {
    console.error(err);
  });
});

// Create server
const port = process.env.PORT || 3000;
http.createServer(app).listen(port, () => {
  console.log(`Server started: Listening on port ${port}`);
});
