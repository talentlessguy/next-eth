import { etherJsFetcher } from 'ether-swr'
import { JsonRpcSigner, Provider } from '@ethersproject/providers'
import { utils, Wallet } from 'ethers'
import { IncomingMessage } from 'http'
import { parseCookies } from 'nookies'

export const createEtherFetcherSSR = ({ provider, signer }: { provider: Provider; signer: Wallet | JsonRpcSigner }) => {
  return etherJsFetcher(provider, signer)
}

export const getWalletInitialData = async ({ req, provider }: { req?: IncomingMessage; provider: Provider }) => {
  const cookies = parseCookies({ req })

  const address = cookies['next-eth-address']

  if (address) {
    return { balance: utils.formatEther(await provider.getBalance(address)), address }
  } else {
    return { balance: null, address: null }
  }
}
