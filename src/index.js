/* //////////////////////////////////////////////////////////////////////// */
/* */
/* //////////////////////////////////////////////////////////////////////// */

import ProviderFactory from './provider-factory/provider-factory'
import DcentConnector from './dcent-connector/dcent-connector'
import Web3ProviderEngine from 'web3-provider-engine'
import LOG from './utils/log'

/* //////////////////////////////////////////////////////////////////////// */
/* */
/* //////////////////////////////////////////////////////////////////////// */

const _getRpcPromiseCallback = (resolve, reject) => (error, response) => {
    error || response.error
      ? reject(error || response.error)
      : Array.isArray(response)
        ? resolve(response)
        : resolve(response.result)
}

const _walletFunc = {
    getAccounts: (callback) => {
        DcentConnector.ethereumAddress()
        .then((address) => {
            callback(null, [address])
        })
    },
    signTransaction: (tx, callback) => {
        LOG.debug('tx = ', tx)
        DcentConnector.ethereumSignTransaction(tx)
        .then((signedTx) => {
            callback(null, signedTx)
        })
    },
}

class DcentProvider extends Web3ProviderEngine {
    constructor(opts) {
        super(opts)
        opts.wallet = _walletFunc
        ProviderFactory.initialize(this, opts)
    }

    enable() {
        return new Promise((resolve) => resolve([]))
    }

    send(method, params) {
        if (method === 'eth_requestAccounts') {
            // REF : https://eips.ethereum.org/EIPS/eip-1102
            return this.enable()
        }

        if (typeof params === 'undefined') {
            params = []
        } else if (!Array.isArray(params)) {
            params = [params]
        }

        let payload = {
            method,
            params
        }
        return new Promise((resolve, reject) => {
            try {
                this.sendAsync(payload, _getRpcPromiseCallback(resolve, reject))
            } catch (error) {
                reject(error)
            }
        })
    }
}

/* //////////////////////////////////////////////////////////////////////// */
/* */
/* //////////////////////////////////////////////////////////////////////// */

export default DcentProvider

/* //////////////////////////////////////////////////////////////////////// */
/* */
/* //////////////////////////////////////////////////////////////////////// */