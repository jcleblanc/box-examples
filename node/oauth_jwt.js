'use strict';

// Initialize packages
const app = require('express')();           // Express
const appConfig = require('./config.js');   // Auth keys and Box SDK
const boxSDK = appConfig.boxSDK;            // Box SDK
//const bodyParser = require('body-parser');  // Allow JSON and URL encoded HTTP responses
const fs = require('fs');                   // File system accessor for RSA keys
const http = require('http');               // HTTP for Express server
const https = require('https');             // HTTPS for Box API requests
const jwt = require('jsonwebtoken');        // JWT signing and verification package
const querystring = require('querystring'); // Querystring stringifier
const uuid = require('uuid/v4');            // Unique numeric identification generator
const util = require('util');               // Deep inspection of console.log objects

// Create a new Box SDK instance
const sdk = new boxSDK({
  clientID: appConfig.jwtClientId,
  clientSecret: appConfig.jwtClientSecret
});

//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true }));

app.get('/start', function(req, res) {
  // JWT header
  const jwtHeader = {
    alg: 'RS256',
    typ: 'JWT',
    kid: appConfig.publicKeyId
  };

  // JWT claims
  var jwtClaims = JSON.stringify({
    box_sub_type: 'enterprise',
    iss: appConfig.jwtClientId,
    sub: appConfig.enterpriseId,
    aud: 'https://api.box.com/oauth2/token',
    jti: uuid(),
    exp: Math.floor(Date.now() / 1000) + 45
  });

  // Fetch private key for signing the JWT
  const secret = fs.readFileSync('private.pem');

  // Create JWT signature (XXX.XXX.XXX)
  const jwtSignature = jwt.sign(jwtClaims, secret, { header: jwtHeader});

  // Create Box access token request POST object
  var req = querystring.stringify({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: jwtSignature,
    client_id: appConfig.jwtClientId,
    client_secret: appConfig.jwtClientSecret
  });

  // Box access token 
  var options = {
    host: 'api.box.com',
    path: '/oauth2/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': req.length
    }
  };

  // Handle HTTPS request response and errors
  var postReq = https.request(options, function(res) {
    // Set response data encoding
    res.setEncoding('utf8');

    // Handle response errors
    res.on('error', function (err) {
      console.log(`${err.statusCode}: ${err.statusMessage}`);
    });

    // On valid data return, extract token and start client
    res.on('data', function(data) {
      const at = data.access_token;
      const exp = data.expires_in;

      console.log(data);

      const client = sdk.getBasicClient(at);
    });
  });

  // POST data
  postReq.write(req);
  postReq.end();
});

// Create server
http.createServer(app).listen(3000, function () {
  console.log('Server started: Listening on port 3000');
});