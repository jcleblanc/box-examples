const _ = require('lodash');

/**
 * The /definitions resource contains reference data that can be used in processing,
 * including keyword or phrase spotting groups, custom vocabularies, or predictive models.
 */
class Definitions {
    constructor (api) {
        this._api = api;
        this._baseUrl = `${this._api.config.baseUrl}/${this._api.config.apiVersion}/definitions`;
    }

    /**
     * Get definition types for keywords.
     */
    getDefinitionTypesForKeywords () {
        const requestOptions = _.merge({}, this._api.requestOptions, {
            method: 'GET',
            uri: `${this._baseUrl}/keywords`
        });

        return this._api.makeRequest(requestOptions);
    }

    /**
     * Get all defined keyword groups.
     */
    getAllKeywordGroups () {
        const requestOptions = _.merge({}, this._api.requestOptions, {
            method: 'GET',
            uri: `${this._baseUrl}/keywords/groups`
        });

        return this._api.makeRequest(requestOptions);
    }

    /**
     * Get the keyword group.
     * @param groupId
     */
    getKeywordGroup (groupId) {
        if (!groupId) {
            throw new Error('{groupId} argument must be specified');
        }

        const requestOptions = _.merge({}, this._api.requestOptions, {
            method: 'GET',
            uri: `${this._baseUrl}/keywords/groups/${groupId}`
        });

        return this._api.makeRequest(requestOptions);
    }

    /**
     * Create or update group from a set of keywords.
     * @param groupId
     * @param group
     */
    createOrUpdateKeywordGroup (groupId, group) {
        if (!groupId) {
            throw new Error('{groupId} argument must be specified');
        }

        const requestOptions = _.merge({}, this._api.requestOptions, {
            method: 'PUT',
            uri: `${this._baseUrl}/keywords/groups/${groupId}`,
            body: group
        });

        return this._api.makeRequest(requestOptions);
    }

    /**
     * Delete this keyword group.
     * @param groupId
     */
    deleteKeywordGroup (groupId) {
        if (!groupId) {
            throw new Error('{groupId} argument must be specified');
        }

        const requestOptions = _.merge({}, this._api.requestOptions, {
            method: 'DELETE',
            uri: `${this._baseUrl}/keywords/groups/${groupId}`
        });

        return this._api.makeRequest(requestOptions);
    }

    /**
     * Get definition types for transcripts.
     */
    getDefinitionTypesForTranscripts () {
        const requestOptions = _.merge({}, this._api.requestOptions, {
            method: 'GET',
            url: `${this._baseUrl}/transcripts`
        });

        return this._api.makeRequest(requestOptions);
    }

    /**
     * Get all defined custom vocabularies.
     */
    getVocabularies () {
        const requestOptions = _.merge({}, this._api.requestOptions, {
            method: 'GET',
            uri: `${this._baseUrl}/transcripts/vocabularies`
        });

        return this._api.makeRequest(requestOptions);
    }

    /**
     * Get the custom vocabulary.
     * @param vocabularyId
     */
    getVocabulary (vocabularyId) {
        if (!vocabularyId) {
            throw new Error('{vocabularyId} argument must be specified');
        }

        const requestOptions = _.merge({}, this._api.requestOptions, {
            method: 'GET',
            uri: `${this._baseUrl}/transcripts/vocabularies/${vocabularyId}`
        });

        return this._api.makeRequest(requestOptions);
    }

    /**
     * Create a custom vocabulary from a set of media.
     * @param vocabularyId
     * @param data
     */
    createVocabulary (vocabularyId, data) {
        if (!vocabularyId) {
            throw new Error('{vocabularyId} argument must be specified');
        }

        const requestOptions = _.merge({}, this._api.requestOptions, {
            method: 'PUT',
            uri: `${this._baseUrl}/transcripts/vocabularies/${vocabularyId}`,
            body: data
        });

        return this._api.makeRequest(requestOptions);
    }

    /**
     * Delete this custom vocabulary.
     * @param vocabularyId
     */
    deleteVocabulary (vocabularyId) {
        if (!vocabularyId) {
            throw new Error('{vocabularyId} argument must be specified');
        }

        const requestOptions = _.merge({}, this._api.requestOptions, {
            method: 'DELETE',
            uri: `${this._baseUrl}/transcripts/vocabularies/${vocabularyId}`
        });

        return this._api.makeRequest(requestOptions);
    }

    /**
     * Get definition types for media.
     */
    getDefinitionTypesForMedia () {
        const requestOptions = _.merge({}, this._api.requestOptions, {
            method: 'GET',
            uri: `${this._baseUrl}/media`
        });

        return this._api.makeRequest(requestOptions);
    }

    /**
     * Get searchable fields.
     */
    getSearchableFields () {
        const requestOptions = _.merge({}, this._api.requestOptions, {
            method: 'GET',
            uri: `${this._baseUrl}/media/search`
        });

        return this._api.makeRequest(requestOptions);
    }

    /**
     * Create or update custom parameters of metadata for search.
     * @param data
     */
    createOrUpdateCustomMetadatParameters (data) {
        const requestOptions = _.merge({}, this._api.requestOptions, {
            method: 'PUT',
            uri: `${this._baseUrl}/media/search`,
            body: data
        });

        return this._api.makeRequest(requestOptions);
    }

    /**
     * Get definition types for predictions.
     */
    getDefinitionTypesForPrediction () {
        const requestOptions = _.merge({}, this._api.requestOptions, {
            method: 'GET',
            uri: `${this._baseUrl}/predictions`
        });

        return this._api.makeRequest(requestOptions);
    }

    /**
     * Get all available predictive models.
     */
    getPredictiveModels () {
        const requestOptions = _.merge({}, this._api.requestOptions, {
            method: 'GET',
            uri: `${this._baseUrl}/predictions/models`
        });

        return this._api.makeRequest(requestOptions);
    }

    /**
     * Get the predictive model.
     */
    getPredictiveModel (modelName) {
        if (!modelName) {
            throw new Error('{modelName} argument must be specified');
        }

        const requestOptions = _.merge({}, this._api.requestOptions, {
            method: 'GET',
            uri: `${this._baseUrl}/predictions/models/${modelName}`
        });

        return this._api.makeRequest(requestOptions);
    }
}

module.exports = Definitions;