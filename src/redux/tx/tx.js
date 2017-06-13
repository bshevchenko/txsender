import Immutable from 'immutable'
import Web3 from 'web3'
import walletProvider from '../../network/walletProvider'
import Web3Provider from '../../network/Web3Provider'

const TX_SET_WALLET = 'tx/SET_WALLET'
const TX_TOGGLE_URL = 'tx/TOGGLE_URL'
const TX_REMAINING = 'tx/REMAINING'
const TX_RESULT = 'tx/RESULT'

const BLOCK_DELAY = 2

const initialState = {
  wallet: null,
  remaining: null,
  result: null,
  urls: new Immutable.Map({
    'https://mainnet.infura.io/PVe9zSjxTKIP3eAuAHFA': 1
  })
}

export default (state = initialState, action) => {
  switch (action.type) {
    case TX_SET_WALLET:
      return {
        ...state,
        wallet: action.wallet
      }
    case TX_REMAINING:
      return {
        ...state,
        remaining: action.remaining
      }
    case TX_RESULT:
      return {
        ...state,
        result: action.result,
        remaining: null
      }
    case TX_TOGGLE_URL:
      return {
        ...state,
        urls: state.urls.set(action.url, action.add)
      }
    default:
      return state
  }
}

export const setWallet = (wallet) => ({type: TX_SET_WALLET, wallet})
export const toggleURL = (url, add) => ({type: TX_TOGGLE_URL, url, add})

export const transaction = (urls, from, to, value, data, gasPrice, block, wallet, password) => async (dispatch) => {
  urls = Object.keys(urls.toJS())

  dispatch({type: TX_REMAINING, remaining: 0}) // show processing...

  let first = true
  let remaining = urls.length

  let result = new Immutable.List()

  for (let url of urls) {
    let provider
    try {
      provider = walletProvider(wallet, password, url)
    } catch (error) {
      result = result.push([url, error.toString()])
      remaining--
      if (remaining === 0) {
        dispatch({type: TX_RESULT, result})
      }
      continue
    }

    const web3 = new Web3()
    web3.setProvider(provider)

    Web3Provider.setWeb3(web3)

    if (first) {
      const currentBlock = await Web3Provider.getBlockNumber()
      dispatch({type: TX_REMAINING, remaining: block - currentBlock - BLOCK_DELAY})
    }

    const callback = () => {
      web3.eth.sendTransaction({from, to, value, gasPrice, data}, function (error, hash) {
        if (error) {
          result = result.push([url, error.toString()])
        } else {
          result = result.push([url, hash])
        }
        remaining--
        if (remaining === 0) {
          dispatch({type: TX_RESULT, result})
        }
      })
    }

    const filter = web3.eth.filter('latest')
    filter.watch(async (e, r) => {
      if (e) {
        return
      }
      const blockData = await Web3Provider.getBlock(r, true)
      const currentBlock = blockData.number

      if (first) {
        dispatch({type: TX_REMAINING, remaining: block - currentBlock - BLOCK_DELAY})
      }

      if (true || block - currentBlock <= BLOCK_DELAY) { // TODO
        filter.stopWatching(() => {})
        callback()
      }
    })

    first = false
  }
}
