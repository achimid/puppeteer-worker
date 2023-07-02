require('dotenv').config()

const browserInit = require('./puppeteer')
const { initConsumer } = require('./execution-service')


const { sendToQueue } = require('./queue')


sendToQueue('WORKER_EXECUTION_REQUEST', require('../request.json'))

browserInit().then(initConsumer)
