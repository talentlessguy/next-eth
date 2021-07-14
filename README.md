<div align="center">

# next-eth

</div>

Isomorphic Ethereum library for Next.js.

Combines [nookies](https://github.com/maticzav/nookies), [ether-swr](https://github.com/aboutlo/ether-swr), [use-onboard](https://github.com/talentlessguy/use-onboard) and [ethers](https://docs.ethers.io).

## Install

```sh
pnpm i next-eth ethers # ethers.js is a peer dependency
```

## Example

```tsx
import React, { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import type { SWRConfiguration } from 'swr'
import { useWallet, WALLETS, useEtherSWR, getWalletInitialData, createEtherFetcherSSR } from 'next-eth'
import { JsonRpcProvider } from '@ethersproject/providers'

const App = ({ initialData }) => {
  // in case you are authorized before this won't ask to login from the wallet
  const { selectWallet, address, isWalletSelected, disconnectWallet } = useWallet({
    options: {
      dappId: 'ba494c97-2bf3-4c4d-ba27-53fd376f0205', // [String] The API key created by step one above
      networkId: 1, // [Integer] The Ethereum network ID your Dapp uses.,
      walletSelect: {
        wallets: WALLETS
      }
    },
    initialData
  })

  const { data: balance } = useEtherSWR(['getBalance', 'latest'], {
    // revalidateOnMount: true
  } as SWRConfiguration)

  return (
    <div>
      {
        <button
          onClick={async () => {
            if (isWalletSelected) {
              disconnectWallet()
            } else {
              await selectWallet()
            }
          }}
        >
          {isWalletSelected ? 'Disconnect' : 'Connect'}
        </button>
      }
      <p> Address: {address}</p>
      <p>Latest block Balance: {balance} ETH</p>
    </div>
  )
}

export default App

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const provider = new JsonRpcProvider(process.env.JSONRPC_URL)

  const signer = provider.getSigner()

  const { address, balance } = await getWalletInitialData({ req, provider })

  const fetcher = createEtherFetcherSSR({ provider, signer })

  return {
    props: {
      initialData: { address, balance }
    }
  }
}
```
