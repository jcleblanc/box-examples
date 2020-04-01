const session = require('express-session');               // Express sessions
const { ExpressOIDC } = require('@okta/oidc-middleware'); // Express OIDC middleware
const bodyParser = require('body-parser')                 // Body Parser for JSON encoded bodies
const boxSDK = require('box-node-sdk');                   // Box SDK
const config = require('./config.js')                     // Keys and config
const express = require('express')();                     // Express
const http = require('http');                             // HTTP server
const fs = require('fs');                                 // File system for config

/*********************************************************************
* Configuration
*********************************************************************/
// session support is required to use ExpressOIDC
express.use(session({
  secret: 'this should be secure',
  resave: true,
  saveUninitialized: false
}));

const oidc = new ExpressOIDC({
  issuer: `https://${config.oktaOrgUrl}/oauth2/default`,
  client_id: config.oktaClientId,
  client_secret: config.oktaClientSecret,
  appBaseUrl: config.oktaBaseUrl,
  loginRedirectUri: `${config.oktaBaseUrl}${config.oktaRedirect}`,
  scope: 'openid profile'
});

express.use(oidc.router);
express.use(bodyParser.json());
express.use(bodyParser.urlencoded({
  extended: true
})); 

/*********************************************************************
* Routes
*********************************************************************/
// Redirect to Okta login
express.get('/', (req, res) => {
  if (req.userContext && req.userContext.userinfo) {
    const tokenSet = req.userContext.tokens;
    const userInfo = req.userContext.userinfo;

    // If Okta ID is present, pass to Box user validation
    if (userInfo.sub) {
        console.log(userInfo);
        box.validateUser(userInfo);
      } else {
        console.log('No Okta ID identified');
      }
  } else {
    res.redirect('/login');
  }
});

/*********************************************************************
* Box Functions
*********************************************************************/
const box = (() => {
  // Instantiate new Box client
  const configJSON = JSON.parse(fs.readFileSync('config.json'));
  const sdk = boxSDK.getPreconfiguredInstance(configJSON);
  const client = sdk.getAppAuthClient('enterprise');

  let oktaRecord = {};
  let userId = '';
  let userClient;

  // Validate whether an app user already exists for the Okta ID
  function validateUser(userInfo) {
    this.oktaRecord = userInfo

    client.enterprise.getUsers({ "external_app_user_id": this.oktaRecord.sub })
    .then((result) => {
      if (result.total_count > 0) {
        // User found, get user ID and fetch user token
        this.userId = result.entries[0].id;
        this.userClient = sdk.getAppAuthClient('user', this.userId);

        this.userClient.users.get(this.userClient.CURRENT_USER_ID)
        .then(currentUser => {
          console.log(currentUser);
      	});
        
      } else {
        // User not found - create user
        this.createUser();
      }
    });
  }

  // Create a new app user if an Okta record doesn't already exist
  function createUser() {
    const spaceAmount = 1073741824;   // ~ 1gb

    // Create app user
    client.enterprise.addAppUser(
      this.oktaRecord.name, 
      {
        space_amount: spaceAmount,
        external_app_user_id: this.oktaRecord.sub
      }
    ).then(appUser => {
      console.log(`New app user created with Box ID ${appUser.id}, Okta ID ${this.oktaRecord.sub}, and name ${appUser.name}`);
    });
  }

  return {
    validateUser,
    createUser
  };
})();

/*********************************************************************
* Server
*********************************************************************/
// Create server
const port = process.env.PORT || 3000;
http.createServer(express).listen(port, () => {
  console.log(`Server started: Listening on port ${port}`);
});