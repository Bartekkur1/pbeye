const esClient = require('./esClient');
const logger = require('./logger');

/**
 * @typedef {Object} Motion
 * @property {number} activity
 * @property {number} timestamp
 */

module.exports = {
    /**
     * @param {Motion} motion
     */
    save(motion, indexName) {
        logger.debug(`Saving motion: ${JSON.stringify(motion)}`);
        return esClient.client.index({
            index: indexName,
            body: motion
        });
    }
};