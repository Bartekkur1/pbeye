const jimp = require("jimp");
const config = require('../config.json');

/**
 * @param {number} ms time to wait
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * @returns {string} time in ms
 */
const getDateTime = () => new Date().getTime();

/**
 * @param {string} url
 * @returns {Jimp} WebcamImage
 */
const readWebcamImage = async () => {
    const image = await jimp.read(config.imageSourceUrl);
    return image.grayscale();
}

module.exports = {
    sleep,
    getDateTime,
    readWebcamImage
}