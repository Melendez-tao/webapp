const { createLogger, format, transports:wt } = require('winston');
const { combine, timestamp, printf } = format
const myformat = printf(({ level, message, timestamp}) => {
    return `${timestamp} - ${level}: ${message}`;
});
const transports = [
    new wt.File({ filename: '/var/log/error.log', level: 'error'}),
    new wt.File({ filename: '/var/log/info.log', level: 'info'}),
    new wt.File({ filename: '/var/log/http.log'})
];
if (!process.env.NODE_ENV) {
    transports.push(new wt.Console());
}
const logger = createLogger({
    level: 'http',
    format: combine(
        timestamp(),
        myformat
    ),
    transports
});

module.exports = logger;