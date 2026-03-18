const { Logtail } = require('@logtail/node');

const logger = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN, {
  endpoint: process.env.LOGTAIL_END_POINT
});

module.exports = logger;