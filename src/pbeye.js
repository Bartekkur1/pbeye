const config = require("../config.json");
const jimp = require("jimp");
const esClient = require('./esClient');
const logger = require('./logger');
const { readWebcamImage, sleep, getDateTime } = require('./util');
const motionDao = require('./motion.dao');

module.exports = {
    baseImage: null,
    timeout: false,
    async init() {
        logger.debug('pbEye initializing...')
        await esClient.init(config);
        if (!this.baseImage) {
            const rawBaseImage = await jimp.read(config.baseImagePath);
            this.baseImage = rawBaseImage.grayscale();
        }
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
                const nextImage = await readWebcamImage();
                const diffRaw = jimp.diff(this.baseImage, nextImage);
                const diff = diffRaw.percent * config.diffMultiplier;

                if (config.saveOutput && config.debug) {
                    await diff.image.writeAsync(config.outputImagePath);
                }

                await motionDao.save({
                    activity: diff,
                    timestamp: getDateTime()
                }, config.indexName);
            } catch (err) {
                this.timeout = true;
                logger.error(err);
            }
        }
    }
};