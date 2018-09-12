const _ = require('lodash');

/**
 * The /profile resource contains user profile information, and get can be used to manage your Bearer tokens.
 */
class Profile {
    constructor (api) {
        this._api = api;
        this._baseUrl = `${this._api.config.baseUrl}/${this._api.config.apiVersion}/profile`;
    }

    /**
     * Returns all current Api keys for current user.
     */
    getKeys () {
        const requestOptions = _.merge({}, this._api.requestOptions, {
            method: 'GET',
            uri: `${this._baseUrl}/keys`
        });

        return this._api.makeRequest(requestOptions);
    }

    /**
     * Get information about specific Api key.
     * @param keyId
     */
    getKey (keyId) {
        if (!keyId) {
            throw new Error('{keyId} argument must be specified');
        }

        const requestOptions = _.merge({}, this._api.requestOptions, {
            method: 'GET',
            uri: `${this._baseUrl}/keys/${keyId}`
        });

        return this._api.makeRequest(requestOptions);
    }

    /**
     * Create a new Api key for the current user.
     * @param key Key data to create
     */
    createKey (key) {
        const requestOptions = _.merge({}, this._api.requestOptions, {
            method: 'POST',
            uri: `${this._baseUrl}/keys`,
            body: key
        });

        return this._api.makeRequest(requestOptions);
    }

    /**
     * Delete and revoke this Api key.
     * @param keyId
     */
    deleteKey (keyId) {
        if (!keyId) {
            throw new Error('{keyId} argument must be specified');
        }

        const requestOptions = _.merge({}, this._api.requestOptions, {
            method: 'DELETE',
            uri: `${this._baseUrl}/keys/${keyId}`
        });

        return this._api.makeRequest(requestOptions);
    }
}

module.exports = Profile;