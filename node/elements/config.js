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
  contentExplorer: 'base_explorer item_download item_preview item_rename item_share item_delete', 
  contentPicker: 'base_picker item_share item_upload', 
  contentPreview: 'base_preview item_download annotation_edit annotation_view_all annotation_view_self', 
  contentUploader: 'base_upload',
  contentOpenWith: 'item_readwrite root_readwrite',
  contentOpenWithExplorer: 'root_readwrite'
}

// Element UI ID configurations (either folder or file ID to display)
const elementIds = exports.elementIds = {
  contentExplorer: '##FOLDER ID##',
  contentPicker: '##FOLDER ID##',
  contentPreview: '##FILE ID##',
  contentUploader: '##FOLDER ID##'
}

// Element UI ID configurations (either folder or file ID to display)
// rid = resource file / folder ID, fid = file / folder ID, type = file or folder for the rid
const elementIds = exports.elementIds = {
  contentExplorer: { rid: '##FILE OR FOLDER ID##', fid: '##FILE OR FOLDER ID##', type: '##file or folder##' },
  contentPicker: { rid: '##FILE OR FOLDER ID##', fid: '##FILE OR FOLDER ID##', type: '##file or folder##' },
  contentPreview: { rid: '##FILE OR FOLDER ID##', fid: '##FILE OR FOLDER ID##', type: '##file or folder##' },  
  contentUploader: { rid: '##FILE OR FOLDER ID##', fid: '##FILE OR FOLDER ID##', type: '##file or folder##' },
  contentOpenWith: { rid: '##FILE OR FOLDER ID##', fid: '##FILE OR FOLDER ID##', type: '##file or folder##' },
  contentOpenWithExplorer: { rid: '##FILE OR FOLDER ID##', fid: '##FILE OR FOLDER ID##', type: '##file or folder##' }
}

// User auth state, whether to auth as the enterprise (0) or get a user token (user ID)
const userAuth = exports.userAuth = {
  contentExplorer: '##0 OR USER ID##',
  contentPicker: '##0 OR USER ID##',
  contentPreview: '##0 OR USER ID##',  
  contentUploader: '##0 OR USER ID##',
  contentOpenWith: '##0 OR USER ID##',
  contentOpenWithExplorer: '##0 OR USER ID##'
}