const log4js = require('log4js');

log4js.configure({
    appenders: {
        out: {
            type: 'stdout',
            layout: {
                type: 'basic'
            }
        },
        file: {
            type: 'file',
            filename: 'pbeye.log'
        }
    },
    categories: {
        default: { appenders: ['out', 'file'], level: 'debug' }
    }
});

module.exports = log4js.getLogger();