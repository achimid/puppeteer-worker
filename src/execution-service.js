const scraper = require('./execution-scraper')
const { sendToQueue, consumeFromQueue } = require('./queue')

const dlqExecution = (data) => sendToQueue('WORKER_EXECUTION_REQUEST_DLQ', data)

const finishExecution = (data) => sendToQueue('WORKER_EXECUTION_RESPONSE', data)

const initConsumer = () => consumeFromQueue('WORKER_EXECUTION_REQUEST', onMessage)

const onMessage =  (data, ack) => {
    
    parse(data)
        .then(scraper.execute)
        .then(onSuccess(data))
        .catch(onError(data))
        .finally(ack)
}

const parse = async (data) => {
    let content = data.content.toString()
    let request = JSON.parse(content)

    console.log(`Recieved: ${content}`)

    return request
}

const onSuccess = (data) => (execution) => {
    console.log("onSuccess...", )
    finishExecution(execution)
}

const onError = (data) => (error) => {
    const errData = { error, request: JSON.parse(data.content.toString())}

    dlqExecution(errData)

    console.error("onError...", errData)
}



module.exports = {
    initConsumer,
    finishExecution
}