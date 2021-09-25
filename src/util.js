const jimp = require("jimp");
const config = require('../config.json');

/**
 * @param {number} ms time to wait
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * @returns {string} datetime time zone formatted
 */
const getDateTime = () => new Date().getTime();
// const getDateTime = () => new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' });

/**
 * @param {string} url
 * @returns {Jimp} WebcamImage
 */
const readWebcameImage = async () => {
    const image = await jimp.read(config.imageSourceUrl);
    return image.grayscale();
}

module.exports = {
    sleep,
    getDateTime,
    readWebcameImage
}