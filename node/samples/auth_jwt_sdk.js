'use strict';

// Initialize packages
const appConfig = require('./config.js');   // Auth keys and Box SDK
const boxSDK = appConfig.boxSDK;            // Box SDK
const fs = require('fs');                   // File system accessor for RSA keys
const util = require('util');               // Deep inspection of objects

// Fetch private key for signing the JWT
const secret = fs.readFileSync(appConfig.privateKeyPath);

const sdk = new boxSDK({
  clientID: appConfig.jwtClientId,
  clientSecret: appConfig.jwtClientSecret,
  appAuth: {
    keyID: appConfig.publicKeyId,
    privateKey: secret,
    passphrase: appConfig.keyPass
  }
});
const client = sdk.getAppAuthClient('enterprise', appConfig.enterpriseId);
//client.asUser('2164654077');

//console.log(util.inspect(client, false, null))

//CREATE NEW USER
/*client.enterprise.addUser(
  'sefsdfdsfs@box.com',
  'This guy', {
    role: client.enterprise.userRoles.COADMIN,
    address: '555 Box Lane',
    status: client.enterprise.userStatuses.CANNOT_DELETE_OR_EDIT
  },
  callback
);*/

//CREATE NEW APP USER
/*client.enterprise.addAppUser(
  'Daenerys Targaryen', {
    job_title: 'Mother of Dragons',
  },
  callback
);*/

//FILE UPLOAD
//var stream = fs.createReadStream('/Users/jleblanc/Desktop/taxdoc.txt');
//client.files.uploadFile('33552487093', 'taxdoc.txt', stream, callback);

//FILE DOWNLOAD
/*client.files.getReadStream('202297048845', null, function(error, stream) {
  if (error) {
    console.err(error);
  }

  // write the file to disk
  var output = fs.createWriteStream('/Users/jleblanc/Desktop/taxdoc2.txt');
  stream.pipe(output);
});*/

client.search.query(
  'tax', {
    fields: 'name,modified_at,size,extension,permissions,sync_state',
    limit: 200,
    offset: 0
  },
  callback
);

//client.folders.create('0', 'Tax folder', callback);

function callback(err, res) {
  console.log(util.inspect(err, false, null));
  console.log(util.inspect(res, false, null));
}
