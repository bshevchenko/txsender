import Immutable from 'immutable'
import Web3 from 'web3'
import walletProvider from '../../network/walletProvider'

const TX_SET_WALLET = 'tx/SET_WALLET'
const TX_QUERY = 'tx/QUERY'
const TX_ERROR = 'tx/ERROR'
const TX_SUCCESS = 'tx/SUCCESS'

const initialState = {
  wallet: null,
  list: new Immutable.List()
}

let index = 0
let filterInitialized = false

export default (state = initialState, action) => {
  let tx
  switch (action.type) {
    case TX_SET_WALLET:
      return {
        ...state,
        wallet: action.wallet
      }
    case TX_QUERY:
      return {
        ...state,
        list: state.list.set(action.id, {block: action.block, callback: action.callback})
      }
    case TX_ERROR:
      tx = state.list.get(action.id)
      tx.error = action.error
      return {
        ...state,
        list: state.list.set(action.id, tx)
      }
    case TX_SUCCESS:
      tx = state.list.get(action.id)
      tx.hash = action.hash
      return {
        ...state,
        list: state.list.set(action.id, tx)
      }
    default:
      return state
  }
}

export const setWallet = (wallet) => ({type: TX_SET_WALLET, wallet})

export const transaction = (value, data, gasPrice, block, wallet, password) => (dispatch, getState) => {
  const urls = [
    'https://mainnet.infura.io/PVe9zSjxTKIP3eAuAHFA'
  ]

  for (let url of urls) {
    const provider = walletProvider(wallet, password, url)
    const web3 = new Web3()
    web3.setProvider(provider)

    if (!filterInitialized) {
      web3.eth.filter('latest').watch(async (e, r) => {
        if (e) {
          return
        }
        const currentBlock = r // TODO block number or hash?
        console.log('block', currentBlock)

        const list = getState().get('tx').get('list').toArray()

        for (let {block, callback} of list) {
          if (block - currentBlock <= 2) {
            callback()
          }
        }
      })
    }

    index++
    const id = index

    const callback = () => {
      web3.eth.sendTransaction({value, gasPrice, data}, function(error, hash) {
        if (error) {
          dispatch({type: TX_ERROR, id, error})
          return
        }
        dispatch({type: TX_SUCCESS, id, hash})
      })
    }

    dispatch({type: TX_QUERY, id, block, callback})
  }
}
