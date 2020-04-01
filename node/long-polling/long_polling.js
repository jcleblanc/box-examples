'use strict';

const https = require('https');
const url = require('url');

const uriBox = 'https://api.box.com/2.0/events';    // Box event polling API endpoint
const args = process.argv.slice(2);                 // Command line arguments

let getStreamPos = {};  // Initialization function
let devToken = '';      // Box developer token provided with script invocation
let streamPos = '';     // Current stream position
let reqArgs = {};       // HTTPS request object

// Retrieve developer token from command line arguments
if (args[0]) {
  devToken = args[0];
} else {
  console.error('Error: No developer token provided.\nInit script with command: node long_polling.js {DEVTOKEN}');
}

/**
 * Make an HTTPS request
 * @param  {Object}    reqObj     HTTPS request configuration information
 * @param  {Function}  callback   Function to be invoked when data is obtained
 * @return {undefined}
 */
const makeRequest = (reqObj, callback) => {
  const parsedURL = url.parse(reqObj.uri);
  const queryParams = (parsedURL.search === null) ? '' : parsedURL.search;

  // Set HTTPS request options
  const options = {
    host: parsedURL.host,
    path: parsedURL.pathname + queryParams,
    method: reqObj.method,
    headers: { Authorization: `Bearer ${reqObj.token}` }
  };

  // Make request to fetch data
  const req = https.request(options, (res) => {
    let data = '';

    // Concatinate data when retrieved
    res.on('data', (chunk) => {
      data += chunk.toString('utf8');
    }).on('end', () => {
      callback(data);
    }).on('error', (err) => {
      console.error(err);
    });
  });

  // On error, display error to console
  req.on('error', (err) => {
    console.error(err);
  });

  req.end();
};

/**
 * Parse and display event information, then restart long polling
 * @param  {Object}    res    JSON object containing event information
 * @return {undefined}
 */
const processEventDetails = (res) => {
  if (res) {
    // Parse response object and extract event details
    const parsedData = JSON.parse(res);
    const eventId = parsedData.entries[0].event_id;
    const eventType = parsedData.entries[0].event_type;

    // Display event inforamtion to console
    console.log(`${eventId} | ${eventType}`);

    // Display reconnect message to console
    console.log('long polling...\nreconnect');

    // Restart long polling
    getStreamPos();
  } else {
    console.error('No data returned from get event details call. Exiting.');
  }
};

/**
 * Invoke on polling event activity, then lookup event details
 * @param  {Object}    res    JSON object containing change notification
 * @return {undefined}
 */
const getEventDetails = (res) => {
  if (res) {
    const parsedData = JSON.parse(res);

    // Display warning if listener sees an unknown message
    if (parsedData.message === 'reconnect') {
      // Display reconnect message
      console.log('reconnect');

      // Restart long polling
      getStreamPos();
    } else if (parsedData.message !== 'new_change') {
      console.warn(`Unknown event message detected: ${parsedData.message}. Attempting to retrieve event details anyways.`);
    }

    // Display notification of change to console
    console.log(`${parsedData.message}\nfetching events`);

    // Set HTTPS request object data
    reqArgs.uri = `${uriBox}?stream_position=${streamPos}`;
    reqArgs.method = 'GET';

    makeRequest(reqArgs, processEventDetails);
  } else {
    console.error('No data returned from event monitoring call. Exiting.');
  }
};

/**
 * Listen for event changes in the long polling stream
 * @param  {Object}    res    JSON object containing polling URI information
 * @return {undefined}
 */
const monitorChanges = (res) => {
  if (res) {
    // Parse response object and extract stream URL
    const parsedData = JSON.parse(res);
    const pollUrl = parsedData.entries[0].url;

    // Set HTTPS request object data
    reqArgs.uri = `${pollUrl}&stream_position=${streamPos}`;
    reqArgs.method = 'GET';

    // Display realtime URL to console
    console.log(`realtime url: ${pollUrl}\nlong polling...`);

    makeRequest(reqArgs, getEventDetails);
  } else {
    console.error('No data returned from get stream URL call. Exiting.');
  }
};

/**
 * Get next event stream position and make request to listen for changes
 * @param  {Object}    res    JSON object containing next stream position
 * @return {undefined}
 */
const getPollURL = (res) => {
  if (res) {
    // Parse response object and extract next stream position
    const parsedData = JSON.parse(res);
    streamPos = parsedData.next_stream_position;

    // Set HTTPS request object data
    reqArgs.uri = uriBox;
    reqArgs.method = 'OPTIONS';

    // Make HTTPS request to listen for event changes
    makeRequest(reqArgs, monitorChanges);
  } else {
    console.error('No data returned from get stream position call (potential expired token). Exiting.');
  }
};

/**
 * Initialize long polling with request for current stream position
 * @return {undefined}
 */
getStreamPos = () => {
  // HTTPS request object
  reqArgs = {
    uri: `${uriBox}?stream_position=now`,
    method: 'GET',
    token: devToken
  };

  // Make HTTPS request for current stream position
  makeRequest(reqArgs, getPollURL);
};

// Initialize long polling
getStreamPos();
