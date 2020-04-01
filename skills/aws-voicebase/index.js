'use strict'

const boxSDK = require('box-node-sdk');
const config = require('./config.js');
const fs = require('fs');
const util = require('util');
const voicebase = require('./lib/vb-api.js');

let fileManager = [];
let indexerCallback;
let indexerEvent;

/**
 * Fetch an audio file from Box and upload media to VoiceBase
 * @param {string} boxFileId - The ID of the audio file stored on Box to upload
 * @param {object} tokens - The Box read / write downscoped access tokens
 * @return {callback} callback for event processing with the uploaded media id
 */
const uploadMedia = (boxFileId, tokens, callback) => {
  // Create new Box SDK instance
  const sdk = new boxSDK({
    clientID: config.boxClientId,
    clientSecret: config.boxClientSecret
  });
  let BoxClient = sdk.getBasicClient(tokens.read);

  // VoiceBase API configuration
  const vbapi = new voicebase({
    bearerToken: config.bearerToken
  });

  BoxClient.files.getReadStream(boxFileId, null, function(err, stream) {
    if (err) {
      indexerCallback(null, { statusCode: 200, body: err });
    } else {
      // UPLOAD MEDIA TO VOICEBASE
      const callbackUrl = config.uploadConfig.publish.callbacks[0].url;
      config.uploadConfig.publish.callbacks[0].url = `${callbackUrl}?fileid=${boxFileId}&at=${tokens.write}`;
      console.log('URL: ' + config.uploadConfig.publish.callbacks[0].url);
    
      vbapi.media.upload(stream, config.uploadConfig, {}, {}).then((data) => {
        callback(data.mediaId);
      });
    }
  });
};

/**
 * Delete media from VoiceBase
 * @param {string} mediaId - The ID of the audio file stored on VoiceBase
 * @return {void}
 */
const deleteMedia = (mediaId) => {
  console.log(`REMOVE MEDIA: ${mediaId}----------------------------------------`);

  // VoiceBase API configuration
  const vbapi = new voicebase({
    bearerToken: config.bearerToken
  });

  vbapi.media.remove(mediaId).then((data) => {
    console.log('Audio removed');
    console.log(data);
  }).catch(function (err) {
    indexerCallback(null, { statusCode: 200, body: err });
  });
};

/**
 * Process card objects for a given VoiceBase media upload POST callback
 * @param {string} boxFileId - ID of the Box file that data is being processed for
 * @param {object} body - POST body from VoiceBase audio processing callback
 * @param {function} callback - Callback to execute once transcript is generated
 * @return {callback} callback for event processing
 */
const processCallData = (boxFileId, body, callback) => {
  const metricsSearch = {
    'overtalk': { 'agent-overtalk-ratio':'Agent Overtalk', 'caller-overtalk-ratio':'Caller Overtalk' },
    'talk-time-and-rate': { 'caller-talk-ratio': 'Caller Talk', 'agent-talk-ratio': 'Agent Talk'},
    'talk-style-tone-and-volume': {},
    'sentiment': {}, 
  };
  const topicWhitelist = ["shipping", "address", "reference", "operator", "dollars", "credit card", "reference number", "pinball", "forklift", "estimate", "pounds", "arcade", "canada", "india", "heavy objects", "dimensions", "vintage", "c.s.v. shipping company", "order", "california", "shipment", "problem", "manager", "supervisor", "phone", "C.S.V.", "inconvenience", "crates"];
  const appointmentLabels = {'Not-Appointment': 'No', 'Appointment': 'Yes'};
  let transcriptEntries = [];
  let keywordsEntries = [];
  let appointmentEntries = [];
  let qualityEntries = [];
  let timelineEntries = [];
  let agentEntries = [];
  let sentence = '';
  let start = 0;
  let end = 0;
  
  // Extract content sections from callback body
  const { mediaId, knowledge, metrics, metadata, prediction, transcript } = JSON.parse(body);

  // Process transcript object
  let transcriptCard;
  if (transcript && typeof transcript.words !== 'undefined') {
    for (let item of transcript.words) {
      // Track end time of each word, in case it's the last sentence word
      end = item.e / 1000;

      // If punctionation found, concat to transcript without string manipulation
      if (item.m && item.m === 'punc') {
        sentence += item.w;
      // If new channel turn found (Agent / Caller), add newline and label turn
      } else if (item.m && item.m === 'turn') {
        // On each turn, process previous sentence (don't process first turn instance)
        if (start !== 0) {
          transcriptEntries.push({
            text: sentence,
            appears: [{
              start: start,
              end: end
            }]
          });

          sentence = '';
        }

        // Track start time at beginning of each new sentence
        start = item.s / 1000;

        sentence += `${item.w}:`;
      // If word found, concat with space before word
      } else {
        sentence += ` ${item.w}`;
      }
    }

    // Create transcript card
    transcriptCard = createMetadataCard(boxFileId, 'transcript', 'Transcript', end, transcriptEntries);
  }

  // Process knowledge object
  let keywordCard;
  if (knowledge && typeof knowledge.keywords !== 'undefined') {
    for (let word of knowledge.keywords) {
      // Only display topics from whitelist
      if (topicWhitelist.indexOf(word.keyword) !== -1) {
        keywordsEntries.push({
          type: 'text',
          text: word.keyword
        });
      }
    }

    // Create keyword card
    keywordCard = createMetadataCard(boxFileId, 'keyword', 'Topics', end, keywordsEntries);
  }

  // Process metrics object
  let metricVal;
  let metricCatName;
  let mStartTime;
  let mEndTime;
  if (metrics) {
    // Fetch call metrics
    for (let cat of metrics) {
      metricCatName = cat.metricGroupName;

      for (let metric of cat.metricValues) {
        if (metricsSearch[metricCatName][metric.metricName] != undefined) {
          metricVal = (metric.metricValue * 100);

          mStartTime = 0;
          mEndTime = (end / 100) * metricVal;

          qualityEntries.push({
            type: 'text',
            text: `${metricsSearch[metricCatName][metric.metricName]}: ${metricVal.toFixed(2)}%`,
          });
        }
      }
    }
  }

  // Fetch prediction metrics
  let timelineCard;
  if (prediction) {
    const appointmentMade = appointmentLabels[prediction.classifiers[0].predictedClassLabel] ? appointmentLabels[prediction.classifiers[0].predictedClassLabel] : 'Unknown';

    appointmentEntries.push({
      type: 'text',
      text: `Appointment Made: ${appointmentMade} (${(prediction.classifiers[0].predictionScore * 100).toFixed(2)}%)`
    });

    // Fetch sensitive timeline information
    let appearances;
    if (prediction.detectors) {
      for (let detector of prediction.detectors) {
        appearances = [];

        for (let occurrence of detector.detections[0].detectedSegments[0].occurrences) {
          appearances.push({ start: occurrence.s / 1000, end: occurrence.e / 1000 });
        }

        timelineEntries.push({
          type: 'text',
          text: detector.detectorName,
          appears: appearances
        });
      }
      timelineCard = createMetadataCard(boxFileId, 'keyword', 'Sensitive Information', end, timelineEntries);
    } else {
      timelineEntries.push({
        type: 'text',
        text: 'No sensitive information detected'
      });
      timelineCard = createMetadataCard(boxFileId, 'keyword', 'Sensitive Information', end, timelineEntries);
    }
  }

  // Create appointment, call quality and timeline cards
  let appointmentCard = createMetadataCard(boxFileId, 'keyword', 'Appointment Predictor', end, appointmentEntries);
  let qualityCard = createMetadataCard(boxFileId, 'keyword', 'Call Metrics', end, qualityEntries);

  // Create agent 
  agentEntries.push({type: 'text', text: 'Agent Greeting: No'});
  agentEntries.push({type: 'text', text: 'Address Confirmed: No'});
  agentEntries.push({type: 'text', text: 'Asked for Payment: No'});
  agentEntries.push({type: 'text', text: 'Proper Closing: No'});
  let agentCard = createMetadataCard(boxFileId, 'keyword', 'Agent Actions', end, agentEntries);

  // Create and return card callback object
  const callbackObj = { 
    vbid: mediaId, 
    cards: [ transcriptCard, keywordCard, appointmentCard, qualityCard, timelineCard, agentCard ]
  };

  console.log(util.inspect(callbackObj, {showHidden: false, depth: null}));

  if (transcriptCard == 'undefined') {
    indexerCallback(null, { statusCode: 200, body: 'Transcript is null while processing' });
  } else {
    callback(callbackObj);
  }
};

/**
 * Add metadata to a Box file
 * @param {string} boxFileId - The ID of the audio file stored on Box to upload
 * @return {callback} callback for event processing
 * @return {void}
 */
const addMetadata = (boxFileId, vbMediaId, token, metadata, callback) => {
  // Create new Box SDK instance
  const sdk = new boxSDK({
    clientID: config.boxClientId,
    clientSecret: config.boxClientSecret
  });
  let BoxClient = sdk.getBasicClient(token);
  let indexLocation = 0;

  console.log(`MEDIA ADD START: ${boxFileId} ::: ${token}`);

  BoxClient.files.addMetadata(boxFileId, BoxClient.metadata.scopes.GLOBAL, 'boxSkillsCards', metadata).then((err, metadata) => {	
    console.log("ADDING----------------------------------------------------------------");
    callback(`Updated ${vbMediaId}`);

    // Purge uploaded media
    deleteMedia(vbMediaId);
  }).catch(function (err) {    
    if (err.response && err.response.body && err.response.body.code === 'tuple_already_exists') {
      console.log("UPDATING----------------------------------------------------------------");

      const jsonPatch = [
        { op: 'replace', path: '/cards/0', value: metadata.cards[0] },
        { op: 'replace', path: '/cards/1', value: metadata.cards[1] },
        { op: 'replace', path: '/cards/2', value: metadata.cards[2] },
        { op: 'replace', path: '/cards/3', value: metadata.cards[3] },
        { op: 'replace', path: '/cards/4', value: metadata.cards[4] },
        { op: 'replace', path: '/cards/5', value: metadata.cards[5] }];

      /*const jsonPatch = metadata.cards.map(card => ({ 
        op: 'add', 
        path: '/cards/0', 
        value: card 
      }));*/

      BoxClient.files.updateMetadata(boxFileId, BoxClient.metadata.scopes.GLOBAL, 'boxSkillsCards', jsonPatch).then((err, metadata) => {
        console.log('updated');
        callback(`Updated ${vbMediaId}`);

        // Purge uploaded media
        //deleteMedia(vbMediaId);
      }).catch(function (err) {
        console.log(err);
        indexerCallback(null, { statusCode: 200, body: err });
      });
    } else {
      console.log(err);
      indexerCallback(null, { statusCode: 200, body: err });
    }
  });
};

/**
 * Create a metadata card object
 *
 * @param {string} fileid - The Box file ID associated with the card
 * @param {string} type - Metadata card type
 * @param {string} title - Title of the metadata card
 * @param {int} duration - Duration of the card, in seconds
 * @param {array} entries - Array of card entry objects
 * @return {object} the metadata card
 */
const createMetadataCard = (fileId, type, title, duration, entries) => {
  let card = {
    //created_at: new Date().toISOString(),
    type: 'skill_card',
    skill_card_type: type,
    skill: {
      type: 'service',
      id: 'box-skill-vb-audio-analysis-node'
    },
    invocation: {
      type: 'skill_invocation',
      id: fileId
    },
    skill_card_title: {
      message: title
    },
    duration: duration,
    entries: entries
  };

  console.log(util.inspect(card, {showHidden: false, depth: null}));

  return card;
};

/**
 * Process an incoming event
 *
 * @return {callback} lambda callback
 */
const processEvent = () => {
  const { queryStringParameters, body } = indexerEvent;

  // Callback from VoiceBae
  if (queryStringParameters && queryStringParameters.fileid && queryStringParameters.at) {
    const boxFileId = queryStringParameters.fileid;
    const at = queryStringParameters.at;

    //console.log(body);

    if (boxFileId && at) {
      console.log(body);
      console.log(`MEDIA PROCESSING: ${boxFileId} ::: ${at}`);
      //fileManager[boxFileId].vbid = mediaId;
    
      //console.log(util.inspect(metrics, {showHidden: false, depth: null}));

      processCallData(boxFileId, body, function(processedAudio) {
        const metadataObj = { cards: [] };
        for (let card of processedAudio.cards) {
          metadataObj.cards.push(card);
        }

        console.log(util.inspect(metadataObj, {showHidden: false, depth: null}));

        addMetadata(boxFileId, processedAudio.vbid, at, metadataObj, function(mediaId) {
          indexerCallback(null, { statusCode: 200, body: mediaId });
        });
      });
    }

  // Initial invocation from Box
  } else {
    console.log('UPLOADING MEDIA');
    //console.log(util.inspect(indexerEvent, {showHidden: false, depth: null}));
    const { source, token, id } = JSON.parse(body);
    
    console.log(source);

    // If file has not been uploaded previously, upload
    if (fileManager.indexOf(source.id) == -1) {
      const tokens = {read: token.read.access_token, write: token.write.access_token};

      fileManager.push(source.id);

      uploadMedia(source.id, tokens, function(mediaId) {
        console.log(`MEDIA UPLOADED: ${mediaId}`);
        indexerCallback(null, { statusCode: 200, body: mediaId });
      });
    }
  }
};

/**
 * This is the main function that the Lambda will call when invoked.
 * @return {boolean} - true if valid event
 */
const isValidEvent = () => {
  return (indexerEvent.body || indexerEvent.queryStringParameters);
};

/**
 * This is the main function that the Lamba will call when invoked.
 *
 * @param {webhooksEvent} event - data from the event, including the payload of the webhook, that triggered this function call
 * @param {context}   context - additional context information from the request (unused in this example)
 * @param {callback}  callback - the function to call back to once finished
 * @return {callback} lambda callback
 */
exports.handler = (event, context, callback) => {
  // Set indexer information
  indexerCallback = callback;
  indexerEvent = event;

  if (isValidEvent()) {
    processEvent();
  } else {
    callback(null, { statusCode: 200, body: 'Event received but invalid' });
  }
};
