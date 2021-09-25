const logger = require('./src/logger');
const pbEye = require('./src/pbeye');

(async () => {
    logger.info('Starting pbEye...');
    await pbEye.init();
    await pbEye.start();
})();
