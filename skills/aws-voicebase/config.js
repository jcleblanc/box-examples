// Box OAuth / JWT application configuration information
const boxClientId = exports.boxClientId = process.env.BOX_CLIENT_ID;
const boxClientSecret = exports.boxClientSecret = process.env.BOX_CLIENT_SECRET;

// VoiceBase configuration information
const baseUrl = exports.baseUrl = 'https://apis.voicebase.com';
const apiVersion = exports.apiVersion = 'v3';
const bearerToken = exports.bearerToken = process.env.VOICEBASE_BEARER_TOKEN;
const queryAnalyticsKey = exports.queryAnalyticsKey = process.env.VOICEBASE_QUERY_ANALYTICS_KEY;

/*
  "ingest": {
    "speakerName": "Speaker"
  },
*/

// Media upload configuration
const uploadConfig = exports.uploadConfig = {  
  "speechModel": {
    "language": "en-US",
    "features": [ "advancedPunctuation", "voiceFeatures" ]
  },
  "ingest": {
    "stereo": {
      "left": {
        "speakerName": "Agent"
      },
      "right": {
        "speakerName": "Caller"
      }
    }
  },
  "prediction": {
    "detectors": [
      {
        "detectorName": "PCI",
        "redactor": {
          "transcript": {
            "replacement": "*"
          }
        }
      },{
        "detectorName": "SSN",
        "redactor": {
          "transcript": {
            "replacement": "*"
          }
        }
      }
    ],
    "classifiers": [
      { "classifierId" : "a3992d5e-ae4c-48b2-a57c-98ea7982a51b" },
      { "classifierName": "Appointment" }
    ]
  },
  "knowledge": {
    "enableDiscovery": true,
    "enableExternalDataSources": true
  },
  "transcript": {
    "formatting": {
      "enableNumberFormatting": false
    },
    "contentFiltering": {
      "enableProfanityFiltering": true
    }
  },
  "vocabularies":[{  
    "terms":[{  
      "term":"Bryon",
      "weight":"1",
      "soundsLike":[  
        "Brian"
      ]
		},{  
      "term":"Afflack Shipping Company",
      "weight":"1"
    },{  
      "term":"C.S.V. Shipping Company",
      "weight":"1"
    }]
  }],
  "metrics":[{  
    "metricGroupName":"overtalk"
  },{
    "metricGroupName":"sentiment"
  },{
    "metricGroupName":"talk-time-and-rate"
  },{
    "metricGroupName":"talk-style-tone-and-volume"
  }],
  "publish": {
    "callbacks": [{
      "url": "https://1xrpd1mkz1.execute-api.us-east-1.amazonaws.com/prod/box-skill-voicebase-audio-analysis",
      "method": "POST",
      "include": [ "transcript", "knowledge", "metadata", "metrics", "prediction" ]
    },{
      "url": "https://query-analytic.labs.voicebase.com/analytics/callback/b0cfd458-7e74-4843-8194-3979eba42847"
    }]
  },
  "labs":{
    "voiceActivity":{
      "enableVoiceActivity":true
    }
  }
};
