require('dotenv').config()

const browserInit = require('./puppeteer')
const { initConsumer } = require('./execution-service')


const { sendToQueue, consumeFromQueue } = require('./queue')


setInterval(() => {
    sendToQueue('WORKER_EXECUTION_REQUEST', require('../request.json'))
}, 6000)

// consumeFromQueue('WORKER_EXECUTION_RESPONSE', (data, ack) => {
//     console.log(JSON.parse(data.content.toString()))
//     ack()
// })

browserInit().then(initConsumer)
