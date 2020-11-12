const log = require('winston');

const logger = log.createLogger({
    level: 'info',
    format: log.format.combine(log.format.timestamp(),log.format.json()),
    transports: [
        new log.transports.File({filename: '/var/log/webapp.log'}),
        new log.transports.Console()
    ]
});
if (process.env.NODE_ENV !== 'production') {
    logger.add(new log.transports.Console({
        format: log.format.simple(),
    }));
}
module.exports = logger;