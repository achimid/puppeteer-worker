const { v4 } = require('uuid')
const useProxyI = require('puppeteer-page-proxy')
const randomUseragent = require('random-useragent')

const log = {
    info: console.log,
    error: console.error
}


const execute = async (requestExec) => {            
    const { url, script, config } = requestExec
    
    log.info('Iniciando execução')

    const exec = {        
        uuid: v4(),
        startTime: new Date()
    }

    console.log('Criando pagina web')
    const page = await global.browser.newPage()
    const logsConsole = []

    try {        

        if (!!config?.bypassCSP) {
            console.log('Habilitando BypassCSP')
            page.setBypassCSP(true)
        }
        

        if (!!config?.useRandomAgent) {
            log.info('Criando UserAgent random')    
            const userAgentRandom = randomUseragent.getRandom()
            log.info('UserAgent criado', userAgentRandom)
        
            
            log.info('Adicionando UserAgent random')    
            await page.setUserAgent(userAgentRandom)
        }
        

        if (!!config?.urlProxy || !!config?.skipImage) {
            
            log.info('Habilitando interceptor proxy/image')    
            await page.setRequestInterception(true)
            
            page.on('request', async request => {
                if (config.skipImage && request.resourceType() === 'image') {
                    request.abort()
                } else if (!!config.urlProxy) {
                    request._client = request.client
                    await useProxyI(request, config.urlProxy)            
                } else {
                    request.continue()            
                }
            })   
        }
        

        
        if (!!config?.logConsole) {        
            log.info('Habilitando interceptor console')        
            page.on('console', message => {
                console.log(`${message.type().substr(0, 3).toUpperCase()} ${message.text()}`)
                logsConsole.push(`${message.text()}`)
            })            
        }    
        
        
        if (!!config?.defaultNavigationTimeout) {
            log.info('Adicionando Navigation Timeout')        
            await page.setDefaultNavigationTimeout(parseInt(config.timeout))
        }

    
        if (!!config?.addScriptTagUrl) {
            log.info('Adding script tag')
            await page.addScriptTag({ url: config.addScriptTagUrl })
        }
        
        if (config?.disableJavaScript == true) {
            console.log('Desabilitando o JavaScript')
            await page.setJavaScriptEnabled(false);
        }
        

        console.log('Navegando para url', url)
        await page.goto(url)


        if (!!config?.waitTime) {
            log.info(`Aguardando ${config.waitTime}ms`)
            await page.waitForNetworkIdle(config.waitTime)
        }         


        console.log('Executando script', script)
        exec.result = await page.evaluate(script || process.env.DEFAULT_JS_SCRIPT_TARGET)                                       


    
        if (!!config?.urlProxy) {
            log.info(`Removendo proxy`)
            try { await useProxy(page, null) } catch (e) {}
        }


        console.log('Execução finalizada...')       
        exec.isSuccess = true

    } catch (error) {

        exec.isSuccess = false
        exec.error = error
        console.error("Ocorreu um erro na execução")
        console.error(error)        

    } finally {

        console.log('Finalizando pagina')        
        await page.close() 

        exec.endTime = new Date()
        exec.executionTime = (exec.endTime.getTime() - exec.startTime.getTime()) + 'ms'
        
        if(logsConsole.length > 0) exec.logsConsole = logsConsole
        
        log.info(`Execution time: ${exec.executionTime}`)

    }

    return {
        request: requestExec,
        execution: exec
    }
        
}




module.exports = {
    execute
}