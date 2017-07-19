const boxSDK = require('box-node-sdk');
exports.boxSDK = boxSDK;

// OAuth / JWT application credentials
const jwtClientId = exports.jwtClientId = 'YOUR JWT / OAUTH APP CLIENT ID';
const jwtClientSecret = exports.jwtClientSecret = 'YOUR JWT / OAUTH APP CLIENT SECRET';

// OAuth application credentials
const oauthClientId = exports.oauthClientId = 'YOUR OAUTH APP CLIENT ID';
const oauthClientSecret = exports.oauthClientSecret = 'YOUR OAUTH APP CLIENT ID';

// Account information
const publicKeyId = exports.publicKeyId = 'YOUR APP PUBLIC KEY ID (OBTAINED WHEN ADDING OUR PUBLIC KEY)';
const enterpriseId = exports.enterpriseId = 'YOUR ENTERPRISE ID (JWT / OAUTH)';
const userId = exports.userId = 'YOUR USER ID (OAUTH)';
