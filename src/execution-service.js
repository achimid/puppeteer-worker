const scraper = require('./execution-scraper')
const { sendToQueue, consumeFromQueue } = require('./queue')

const dlqExecution = (data) => sendToQueue('WORKER_EXECUTION_REQUEST_DLQ', data)

const finishExecution = (data) => sendToQueue('WORKER_EXECUTION_RESPONSE', data)

const initConsumer = () => consumeFromQueue('WORKER_EXECUTION_REQUEST', onMessage)

const onMessage =  (data, ack) => {
    let content = data.content.toString()
    let request = JSON.parse(content)

    console.log(`Recieved: ${content}`)

    scraper.execute(request)
        .then(onSuccess(data))
        .catch(onError(request))
        .finally(ack)
}

const onSuccess = (data) => (execution) => {
    console.log("onSuccess...", )
    finishExecution(execution)
}

const onError = (request) => (error) => {
    const errData = { error, request }

    dlqExecution(errData)

    console.error("onError...", errData)
}



module.exports = {
    initConsumer,
    finishExecution
}