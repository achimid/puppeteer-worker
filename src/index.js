require('dotenv').config()

const browserInit = require('./puppeteer')
const { initConsumer } = require('./execution-service')

browserInit().then(initConsumer)
