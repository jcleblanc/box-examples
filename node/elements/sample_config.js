const boxSDK = require('box-node-sdk');

exports.boxSDK = boxSDK;

// OAuth / JWT application credentials
const jwtClientId = exports.jwtClientId = '1xy8yqzr9tyvldj6gnk9mrmhgpr3x8pv';
const jwtClientSecret = exports.jwtClientSecret = 'MEEGoDYDVTdokOUF6jGTuWA8xuQYs6hl';

// Account information
const publicKeyId = exports.publicKeyId = 'tR83ej1t';
const enterpriseId = exports.enterpriseId = '17638883';

// Keys
const keyPath = exports.privateKeyPath = 'private.pem';
const keyPass = exports.keyPass = '12345';

// Element UI Scopes
const tokenScopes = exports.tokenScopes = {
  contentExplorer: 'base_explorer item_download item_preview item_rename item_share item_delete', 
  contentPicker: 'base_picker item_share item_upload', 
  contentPreview: 'base_preview item_download annotation_edit annotation_view_all annotation_view_self', 
  contentUploader: 'base_upload',
  contentOpenWith: 'item_readwrite root_readwrite',
  contentOpenWithExplorer: 'root_readwrite'
}

// Element UI ID configurations (either folder or file ID to display)
const elementIds = exports.elementIds = {
  contentExplorer: { rid: '33552487093', fid: '33552487093', type: 'folder' },
  contentPicker: { rid: '34007816377', fid: '34007816377', type: 'folder' },
  contentPreview: { rid: '207907190751', fid: '207907190751', type: 'file' },  
  contentUploader: { rid: '0', fid: '0', type: 'folder' },
  contentOpenWith: { rid: '0', fid: '321786580744', type: 'folder' },
  contentOpenWithExplorer: { rid: '0', fid: '0', type: 'folder' }
}

const userAuth = exports.userAuth = {
  contentExplorer: '0',
  contentPicker: '0',
  contentPreview: '0',  
  contentUploader: '0',
  contentOpenWith: '6050854320',
  contentOpenWithExplorer: '6050854320'
}
