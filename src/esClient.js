const pbDataMapping = require('../datamapping.json');
const elasticsearch = require('elasticsearch');
const logger = require('./logger');

module.exports = {
    /**
     * @type {elasticsearch.Client} client
     */
    client: null,
    indexName: null,
    async init(config) {
        this.indexName = config.indexName;
        try {
            this.client = new elasticsearch.Client(config.elasticSearch);
            await this.client.ping();
            logger.info('Connected to ES!');
            await this.validateEsStructure();
        } catch (err) {
            logger.fatal("Failed to establish ES connection!");
            logger.fatal(err);
            process.exit(0);
        }
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
            index: this.indexName
        });
        if (indexExists) {
            logger.debug('pbEye index exists');
        } else {
            logger.debug("pbEye Index not found!");
            logger.debug("Creating pbEye index...");
            await this.client.indices.create({
                index: this.indexName,

            });
            logger.debug("pbEye index created!");
        }
    },
    async assertMappingExists() {
        logger.debug("Validating mapping");
        const esMapping = await this.client.indices.getMapping({
            index: this.indexName
        });
        if (esMapping &&
            JSON.stringify(esMapping.pbeye.mappings) == JSON.stringify(pbDataMapping)) {
            logger.debug('pbEye mapping exists');
        } else {
            logger.debug("invalid pbEye mapping found");
            logger.debug("uploading pbEye mapping...");
            await this.client.indices.putMapping({
                index: this.indexName,
                body: pbDataMapping
            });
            logger.debug("pbEye mapping uploaded!");
        }
    }
};