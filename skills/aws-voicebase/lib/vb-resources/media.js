const _ = require('lodash');

/**
 * The /media resource contains the media files you have uploaded to VoiceBase for analysis,
 * as well as transcripts and analytics generated from processing these files.
 */
class Media {
    constructor (api) {
        this._api = api;
        this._baseUrl = `${this._api.config.baseUrl}/${this._api.config.apiVersion}/media`;
    }

    /**
     * Retrieve from the media collection.
     * @param [externalId] A unique identifier in an external system, set in metadata on POST.
     */
    get (externalId) {
        const requestOptions = _.merge({}, this._api.requestOptions, {
            method: 'GET',
            uri: this._baseUrl,
            qs: {externalId}
        });

        return this._api.makeRequest(requestOptions);
    }

    /**
     * Upload new new media to the service as an attachment or from a url.
     * @param media Media file attached to the request.
     * @param [configuration] A JSON object with configuration options.
     * @param [metadata] Metadata about the file being posted.
     * @param [transcript] Attached transcript.
     */
    upload (media, configuration, metadata, transcript) {
        if (!media) {
            throw new Error('{media} argument must be specified');
        }

        const formData =  {
            media
        };

        if (!_.isEmpty(configuration)) {
            formData.configuration = JSON.stringify(configuration);
        }
        if (!_.isEmpty(metadata)) {
            formData.metadata = JSON.stringify(metadata);
        }
        if (!_.isEmpty(transcript)) {
            formData.transcript = JSON.stringify(transcript);
        }

        const requestOptions = _.merge({}, this._api.requestOptions, {
            method: 'POST',
            uri: this._baseUrl,
					  formData
        });

        return this._api.makeRequest(requestOptions);
    }

    /**
     * Get this media item and associated analytics.
     * @param mediaId
     */
    getById (mediaId) {
        if (!mediaId) {
            throw new Error('{mediaId} argument must be specified');
        }

        const requestOptions = _.merge({}, this._api.requestOptions, {
            method: 'GET',
            uri: `${this._baseUrl}/${mediaId}`
        });

        return this._api.makeRequest(requestOptions);
    }

    /**
     * Delete this media.
     * @param mediaId
     */
    remove (mediaId) {
        if (!mediaId) {
            throw new Error('{mediaId} argument must be specified');
        }

        const requestOptions = _.merge({}, this._api.requestOptions, {
            method: 'DELETE',
            uri: `${this._baseUrl}/${mediaId}`,
            resolveWithFullResponse: true
        });

        return this._api.makeRequest(requestOptions);
    }

    /**
     * Upload new configuration, metadata and/or transcript for re-processing of a media document.
     * @param mediaId
     * @param [configuration] A JSON object with configuration options.
     * @param [metadata] Metadata about the file being posted.
     * @param [transcript] Attached transcript.
     */
    update (mediaId, configuration, metadata, transcript) {
        if (!mediaId) {
            throw new Error('{mediaId} argument must be specified');
        }

        const formData =  {};

        if (!_.isEmpty(configuration)) {
            formData.configuration = JSON.stringify(configuration);
        }
        if (!_.isEmpty(metadata)) {
            formData.metadata = JSON.stringify(metadata);
        }
        if (!_.isEmpty(transcript)) {
            formData.transcript = JSON.stringify(transcript);
        }

        const requestOptions = _.merge({}, this._api.requestOptions, {
            method: 'POST',
            uri: `${this._baseUrl}/${mediaId}`,
            formData
        });

        return this._api.makeRequest(requestOptions);
    }

    /**
     * Get available transcripts.
     * @param mediaId
     */
    getTranscripts (mediaId) {
        if (!mediaId) {
            throw new Error('{mediaId} argument must be specified');
        }

        const requestOptions = _.merge({}, this._api.requestOptions, {
            method: 'GET',
            uri: `${this._baseUrl}/${mediaId}/transcript`
        });

        return this._api.makeRequest(requestOptions);
    }

    /**
     * Get a specific transcript.
     * @param mediaId
     * @param transcriptId
     */
    getTranscript (mediaId, transcriptId = 'latest') {
        if (!mediaId) {
            throw new Error('{mediaId} argument must be specified');
        }

        const requestOptions = _.merge({}, this._api.requestOptions, {
            method: 'GET',
            uri: `${this._baseUrl}/${mediaId}/transcripts/${transcriptId}`
        });

        return this._api.makeRequest(requestOptions);
    }

    /**
     * Get progress phases.
     * @param mediaId
     */
    getProgress (mediaId) {
        if (!mediaId) {
            throw new Error('{mediaId} argument must be specified');
        }

        const requestOptions = _.merge({}, this._api.requestOptions, {
            method: 'GET',
            uri: `${this._baseUrl}/${mediaId}/progress`
        });

        return this._api.makeRequest(requestOptions);
    }

    /**
     * Get available media URLs.
     * @param mediaId
     */
    getStreams (mediaId) {
        if (!mediaId) {
            throw new Error('{mediaId} argument must be specified');
        }

        const requestOptions = _.merge({}, this._api.requestOptions, {
            method: 'GET',
            uri: `${this._baseUrl}/${mediaId}/streams`
        });

        return this._api.makeRequest(requestOptions);
    }

    /**
     * Redirects to the original version of the file.
     * @param mediaId
     */
    getOriginalFile (mediaId) {
        if (!mediaId) {
            throw new Error('{mediaId} argument must be specified');
        }

        const requestOptions = _.merge({}, this._api.requestOptions, {
            method: 'GET',
            uri: `${this._baseUrl}/${mediaId}/streams/original`
        });

        return this._api.makeRequest(requestOptions);
    }

    /**
     * Get the media metadata.
     * @param mediaId
     */
    getMetadata (mediaId) {
        if (!mediaId) {
            throw new Error('{mediaId} argument must be specified');
        }

        const requestOptions = _.merge({}, this._api.requestOptions, {
            method: 'GET',
            uri: `${this._baseUrl}/${mediaId}/metadata`
        });

        return this._api.makeRequest(requestOptions);
    }

    /**
     * Update the media metadata.
     * @param mediaId
     * @param metadata Meta data object
     */
    updateMetadata (mediaId, metadata) {
        if (!mediaId) {
            throw new Error('{mediaId} argument must be specified');
        }
        if (!metadata) {
            throw new Error('{metadata} argument must be specified');
        }

        const requestOptions = _.merge({}, this._api.requestOptions, {
            method: 'PUT',
            uri: `${this._baseUrl}/${mediaId}/metadata`,
            body: metadata
        });

        return this._api.makeRequest(requestOptions);
    }
}

module.exports = Media;
