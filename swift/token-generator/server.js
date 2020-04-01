'use strict';

// Initialize packages
const app = require('express')();        // Express
const util = require('util');            // Deep inspection of objects
const boxSDK = require('box-node-sdk');  // Box SDK
const fs = require('fs');                // File system for config
const http = require('http');

// SAVE YOUR OWN APP CONFIG FILE TO config.json 
const configJSON = JSON.parse(fs.readFileSync('config.json'));

// Instantiate instance of SDK using generated JSON config
const sdk = boxSDK.getPreconfiguredInstance(configJSON);

// Create service account client
const client = sdk.getAppAuthClient('enterprise');

// Render element via serviceName = contentExplorer, contentPicker, contentPreview, contentUploader
app.get('/', (req, res) => {
  const scopes = 'root_readonly';  
  const folderId = '0';
  const resource = `https://api.box.com/2.0/folders/${folderId}`;
  
  // Perform token exchange to get downscoped token
  client.exchangeToken(scopes, resource).then((dsToken) => {  
    res.setHeader('Content-Type', 'text/plain');   
    res.end(dsToken.accessToken);    
  }).catch((err) => {    
    console.error(err); 
  });  
});  

// Create server
const port = process.env.PORT || 3000;
http.createServer(app).listen(port, () => {
  console.log(`Server started: Listening on port ${port}`);
});   