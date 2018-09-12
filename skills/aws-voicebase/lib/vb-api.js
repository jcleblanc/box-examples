const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const rp = require('request-promise');

class VoiceBaseAPI {
    constructor (config) {
        if (!config.bearerToken) {
            throw new Error('Bearer Token must be specified');
        }

        this.requestOptions = {
            headers: {}
        };
        this.config = _.extend({}, require('../config'), config);

        /**
         * Specify default request configuration options
         */
        _.extend(this.requestOptions, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.bearerToken}`
            },
            json: true
        });

        /**
         * Bind request-promise to makeRequest method
         */
        this.makeRequest = rp;

        /**
         * Load Resources.
         */
        this._loadResources();
    }

    /**
     * Populates the API object with the resources.
     */
    _loadResources () {
        /**
         * Read all files from ./vb-resources and add them to this object
         * ex: ./resources/media.js becomes resources.media
         */
        const resourcesRoot = path.join(__dirname, 'vb-resources');

        fs.readdirSync(resourcesRoot).forEach((file) => {
            const resourceName = file.match(/(.*)\.js/)[1];
            const ResourceClass = require(resourcesRoot + '/' + file);

            this[resourceName] = new ResourceClass(this);
        });
    }
}

module.exports = VoiceBaseAPI;
