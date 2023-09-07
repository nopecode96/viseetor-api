const morganMiddleware = require('../middlewares/morgan.middleware');
const servicesMiddleware = require('./services.middleware');

module.exports = [
    morganMiddleware,
    servicesMiddleware
];
