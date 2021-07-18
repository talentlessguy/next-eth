<div align="center">

# next-eth

Isomorphic Ethereum library for Next.js.

</div>

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

const App = ({ initialWalletData, initialData }) => {
  // in case you are authorized before this won't ask to login from the wallet
  const { selectWallet, address, isWalletSelected, disconnectWallet } = useWallet({
    options: {
      walletSelect: {
        wallets: WALLETS
      }
    },
    initialData
  })

  const { data: balance } = useEtherSWR(['getBalance', 'latest'], {
    revalidateOnMount: true,
    initialData
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
      <p>DAI balance: {balance} ETH</p>
    </div>
  )
}

export default App

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const provider = new JsonRpcProvider(process.env.JSONRPC_URL)

  const signer = provider.getSigner()

  const { address, balance } = await getWalletInitialData({ req, provider })

  const fetch = createEtherFetcherSSR({ provider, signer })

  if (address) {
    const data = await fetch(['0x6b175474e89094c44da98b954eedeac495271d0f' /* DAI balance */, 'balanceOf', address])

    return {
      props: {
        initialWalletData: { balance, address },
        initialData: data
      }
    }
  }

  return {
    props: {
      initialData: {}
    }
  }
}
```
