/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { ipcMain } from 'electron'
import bonjourImport from 'bonjour'

const bonjour = bonjourImport()

function printUrl(address, httpOnly, port) {
    return `http${httpOnly ? '' : 's'}://${address}${(port === 443 && !httpOnly) || (port === 80 && httpOnly) ? '' : `:${port}`
        }`
}

class Bonjour {
    browser: bonjourImport.Browser | null
    constructor() {
        this.browser = null
    }
    start() {
        this.browser = bonjour.find({ type: 'http' }, newService)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const servers: any[] = []
        function newService(service) {
            if (service.name.indexOf('Thorium') > -1 || service.type === 'local') {
                const isHttps = service.txt.https === 'true'
                const ipregex =
                    /[0-2]?[0-9]{1,2}\.[0-2]?[0-9]{1,2}\.[0-2]?[0-9]{1,2}\.[0-2]?[0-9]{1,2}/gi
                const address = service.addresses.find((a) => ipregex.test(a))

                const uri = `${printUrl(address, !isHttps, service.port)}/client`
                servers.push({
                    name: service.host,
                    url: uri
                })
            }
        }
        ipcMain.on('getServers', function (event) {
            event.sender.send('updateServers', servers)
        })
    }
    stop() {
        this.browser && this.browser.stop()
    }
}

export const bonjourAPI = new Bonjour()
