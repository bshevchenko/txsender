import Wallet from 'ethereumjs-wallet/thirdparty'
import Web3Utils from './Web3Utils'

const walletProvider = (walletJson, password, providerUrl) => {
  return Web3Utils.createEngine(Wallet.fromEtherWallet(walletJson, password), providerUrl)
}

export default walletProvider
