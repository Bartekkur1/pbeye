const config = require("../config.json");
const jimp = require("jimp");
const esClient = require('./esClient');
const logger = require('./logger');
const { readWebcameImage, sleep, getDateTime } = require('./util');
const motionDao = require('./motion.dao');

module.exports = {
    baseImage: null,
    timeout: false,
    async init() {
        logger.debug('pbEye initializing...')
        await esClient.init(config);
        if (!this.baseImage) {
            this.baseImage = await jimp.read('./base.jpg');
        }
    },
    async getMotionDifference() {
        nextImage = await readWebcameImage();
        const diff = jimp.diff(this.baseImage, nextImage);

        if (config.saveOutput && config.debug) {
            await diff.image.writeAsync('./output.png');
        }

        return diff.percent;
    },
    async checkTimeout() {
        if (this.timeout) {
            logger.debug('Timed out!');
            await sleep(config.timeoutTime);
            this.timeout = false;
        }
    },
    async start() {
        logger.info('pbEye starting main loop');
        while (true) {
            await this.checkTimeout();
            try {
                await sleep(config.iterationTime);
                const diffRaw = await this.getMotionDifference();
                const diff = diffRaw * config.diffMultiplier;

                await motionDao.save({
                    activity: diff,
                    timestamp: getDateTime()
                }, config.indexName);

                logger.debug(`diff: ${diff}`);
            } catch (err) {
                this.timeout = true;
                logger.error(err);
            }
        }
    }
};