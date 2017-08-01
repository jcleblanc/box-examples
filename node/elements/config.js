const boxSDK = require('box-node-sdk');
exports.boxSDK = boxSDK;

// OAuth / JWT application credentials
const jwtClientId = exports.jwtClientId = '##CLIENT ID##';
const jwtClientSecret = exports.jwtClientSecret = '##CLIENT SECRET##';

// Account information
const publicKeyId = exports.publicKeyId = '##PUBLIC KEY ID##';
const enterpriseId = exports.enterpriseId = '##ENTERPRISE ID##';

// Keys
const keyPath = exports.privateKeyPath = 'private.pem';
const keyPass = exports.keyPass = '##PRIVATE KEY PASSWORD##';

// Element UI Scopes
const tokenScopes = exports.tokenScopes = {
  contentExplorer: 'base_explorer item_preview item_download item_share', 
  contentPicker: 'base_picker item_share item_upload', 
  contentPreview: 'base_preview item_download annotation_edit annotation_view_all annotation_view_self', 
  contentUploader: 'base_upload'
}

// Element UI ID configurations (either folder or file ID to display)
const elementIds = exports.elementIds = {
  contentExplorer: '##FOLDER ID##',
  contentPicker: '##FOLDER ID##',
  contentPreview: '##FILE ID##',
  contentUploader: '##FOLDER ID##'
}
