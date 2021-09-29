const pbDataMapping = require('../config/datamapping.json');
const elasticsearch = require('elasticsearch');
const logger = require('./logger');
const util = require('./util');

module.exports = {
    /**
     * @type {elasticsearch.Client} client
     */
    client: null,
    indexName: null,
    config: null,
    async init(config) {
        this.config = config;
        try {
            await this.establishConnection();
            await this.validateEsStructure();
        } catch (err) {
            logger.fatal("Failed to establish ES connection!");
            logger.fatal(err);
            process.exit(0);
        }
    },
    async establishConnection() {
        this.client = this.createEsClient();
        while (this.config.esConnectionRetries > 0) {
            logger.info("Establishing connection to ES...");
            try {
                await this.client.ping();
                logger.info('Connected to ES!');
                break;
            } catch (error) {
                logger.warn('Failed connecting to ES!');
                logger.warn(`Tries left: ${this.config.esConnectionRetries}`);
                this.config.esConnectionRetries--;
            }
            await util.sleep(this.config.esConnectionTimeout);
        }
        if (this.config.esConnectionRetries == 0) {
            throw Error('Failed establishing connection to ES!');
        }
    },
    createEsClient() {
        return new elasticsearch.Client(this.config.elasticSearch);
    },
    async validateEsStructure() {
        logger.debug("Validating ES structure...");
        await this.assertIndexExists();
        await this.assertMappingExists();
        logger.debug("Validation complete");
    },
    async assertIndexExists() {
        logger.debug("Validating indices");
        const indexExists = await this.client.indices.exists({
            index: this.config.indexName
        });
        if (indexExists) {
            logger.debug('pbEye index exists');
        } else {
            logger.debug("pbEye Index not found!");
            logger.debug("Creating pbEye index...");
            await this.client.indices.create({
                index: this.config.indexName,

            });
            logger.debug("pbEye index created!");
        }
    },
    async assertMappingExists() {
        logger.debug("Validating mapping");
        const esMapping = await this.client.indices.getMapping({
            index: this.config.indexName
        });
        if (esMapping &&
            JSON.stringify(esMapping.pbeye.mappings) == JSON.stringify(pbDataMapping)) {
            logger.debug('pbEye mapping exists');
        } else {
            logger.debug("invalid pbEye mapping found");
            logger.debug("uploading pbEye mapping...");
            await this.client.indices.putMapping({
                index: this.config.indexName,
                body: pbDataMapping
            });
            logger.debug("pbEye mapping uploaded!");
        }
    }
};