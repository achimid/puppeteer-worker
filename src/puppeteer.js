// const cron = require('node-cron')
const puppeteer = require('puppeteer-extra')  
const stealthPlugin = require('puppeteer-extra-plugin-stealth')
const adblockerPlugin = require('puppeteer-extra-plugin-adblocker')

puppeteer.use(stealthPlugin())
puppeteer.use(adblockerPlugin({ blockTrackers: true }))

const proxy = process.env.PROXY_SERVER

const browserInit = async () => {
    console.info('Inicializando browser...')    
    
    global.browser = await puppeteer.launch(
        {
            headless: 'new',
            executablePath: '/usr/bin/google-chrome',
            args: [                
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-infobars',
                '--disable-web-security',
                '--ignore-certifcate-errors',
                '--ignore-certifcate-errors-spki-list',
                '--disable-dev-shm-usage',
                '--window-size=1024,768',
                proxy ? `--proxy-server=${proxy}` : ''
            ]
        })
        
    console.info('Browser inicializado...')
}

module.exports = browserInit