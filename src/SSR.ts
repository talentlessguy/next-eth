import { etherJsFetcher } from 'ether-swr'
import { JsonRpcSigner, Provider } from '@ethersproject/providers'
import { utils, Wallet } from 'ethers'
import LRU from 'quick-lru'
import hash from 'object-hash'
import { IncomingMessage } from 'http'
import { parseCookies } from 'nookies'

export const createEtherFetcherSSR = ({
  provider,
  signer,
  lru
}: {
  provider: Provider
  signer: Wallet | JsonRpcSigner
  lru?: LRU<string, any>
}) => {
  lru = lru || new LRU<string, any>({ maxSize: 1000, maxAge: 3000 })

  const fetch = etherJsFetcher(provider, signer)

  return function run(...args: any[]) {
    const argHash = hash(args)
    let result = lru.get(argHash)

    // Memoize function for 3s to reduce amount of unecessary calls
    if (!result) {
      result = fetch(args)
      lru.set(argHash, result)
    }

    return result
  }
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
