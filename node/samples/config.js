const boxSDK = require('box-node-sdk');
exports.boxSDK = boxSDK;

// OAuth / JWT application credentials
const jwtClientId = exports.jwtClientId = 'YOUR JWT CLIENT ID';
const jwtClientSecret = exports.jwtClientSecret = 'YOUR JWT CLIENT SECRET';

// OAuth application credentials
const oauthClientId = exports.oauthClientId = 'YOUR OAUTH CLIENT ID';
const oauthClientSecret = exports.oauthClientSecret = 'YOUR OAUTH CLIENT SECRET';

// Account information
const publicKeyId = exports.publicKeyId = 'YOUR PUBLIC KEY ID';
const enterpriseId = exports.enterpriseId = 'YOUR ENTERPRISE ID';
const userId = exports.userId = 'SAMPLE SEARCH USER ID';

// Keys
const keyPath = exports.privateKeyPath = 'private.pem';
const keyPass = exports.keyPass = 'YOUR PRIVATE KEY PASSWORD';
