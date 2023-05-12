import type { NextPage } from 'next'
import { useState, useEffect } from 'react';

import { createClient, getClient, Execute } from "@reservoir0x/reservoir-sdk"
import { ethers } from "ethers";

import { 
  WagmiConfig, 
  createConfig, 
  configureChains, 
  mainnet, 
  useConnect,
  useAccount,
  useDisconnect,
  useEnsAvatar,
  useEnsName
} from 'wagmi'
 
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'
 
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'

import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

const resKey = process.env['RESERVOIR_KEY']

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet],
  [alchemyProvider({ apiKey: 'yourAlchemyApiKey' }), publicProvider()],
)
 
// Set up wagmi config
const config = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'wagmi',
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: '...',
      },
    }),
    new InjectedConnector({
      chains,
      options: {
        name: 'Injected',
        shimDisconnect: true,
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
})

createClient({
  chains: [{
    id: 1,
    baseApiUrl: 'https://api.reservoir.tools',
    default: true,
    apiKey: process.env['RESERVOIR_KEY']
  }],
  source: "https://marketplace.reservoir.tools/"
});

function NFTRow({ nft }) {
  const discount = (
    <span style={{ color: nft.discount < 0 ? 'red' : 'green' }}>
      {nft.discount}
    </span>
  );

  const handleClick = () => {
    // getClient()?.actions.buyToken({
    //   items: [{ token: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d:1", quantity: 1 }],
    //   signer,
    //   onProgress: (steps: Execute['steps']) => {
    //     console.log(steps)
    //   }
    // });
    console.log(`Bought ${nft.token_id}`);
  };

  return (
    <tr className={styles.tableRow}>
      <td className={`${styles.tableCell} ${styles.stickyColumn}`}>
        <Image
          src={nft.image_url}
          alt={nft.token_id}
          width={50} // Adjust the width and height as needed
          height={50}
        />
      </td>
      <td className={`${styles.tableCell} ${styles.secondColumn}`}>{nft.token_id}</td>
      <td className={styles.tableCell}>{nft.list_price}</td>
      <td className={styles.tableCell}>{nft.value_price}</td>
      <td className={styles.tableCell}>{discount}</td>
      <td className={styles.tableCell}>
        <button onClick={handleClick}>Buy</button>
      </td>
    </tr>
  );
}

function LoadingBar(){
  return (
    <div className={styles.dotsBar}></div>
  );
}

function CollectionTable({ collectionData }) {
  const rows = [];
  let lastCategory = null;

  collectionData.forEach((nft) => {
    rows.push(
      <NFTRow
        nft={nft}
        key={nft.token_id} />
    );
  });

  return (
    <table className={styles.collectionTable}>
      <thead>
        <tr className={styles.tableHeader}>
          <th className={`${styles.tableCell} ${styles.stickyColumn}`}> </th>
          <th className={styles.tableCell}>ID</th>
          <th className={styles.tableCell}>Listed Price</th>
          <th className={styles.valueCell}>Value</th>
          <th className={styles.discountCell}>Discount</th>
          <th className={styles.tableCell}>Buy</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}

function DropdownMenu({ selectedCollection, onSelectedCollectionChange }) {
  const handleChange = (event) => {
    console.log('Selected option:', event.target.value);
    onSelectedCollectionChange(event.target.value);
  };

  return (
    <select value={selectedCollection} onChange={handleChange} className={styles.dropDownMenu}>
      <option value="CryptoPunks">CryptoPunks</option>
      <option value="Bored Ape Yacht Club">Bored Ape Yacht Club</option>
      <option value="Azuki">Azuki</option>
    </select>
  );
}

const addresses = {
  "CryptoPunks": "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb",
  "Mutant Ape Yacht Club": "0x60e4d786628fea6478f785a6d7e704777c86a7c6",
  "Azuki": "0xed5af388653567af2f388e6224dc7c4b3241c544",
  "Bored Ape Yacht Club": "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d"
};

function FilterableCollectionTable() {

  const [selectedCollection, setSelectedCollection] = useState('CryptoPunks');

  const [collectionData, setCollectionData] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  
  // hook triggers every time the selectedCollection state changes. 
  useEffect(() => {
    const fetchNFTData = async () => {
      setIsLoading(true);
      const contractAddress = addresses[selectedCollection];
      const response = await fetch(`https://pythonbazaarapi.0xkofi.repl.co/collection?contract=${contractAddress}`);
      const data = await response.json();
      setCollectionData(data);
      setIsLoading(false);
    };

    fetchNFTData();
  }, [selectedCollection]);
  
  return (
    <div className={styles.filterableCollectionTable}>
      <div className={styles.dropdownMenuWrapper}>
        <DropdownMenu selectedCollection={selectedCollection} onSelectedCollectionChange={setSelectedCollection} />
      </div>
      <div className={styles.collectionTableWrapper}>
        {isLoading ? <LoadingBar /> : <CollectionTable collectionData={collectionData} />}
      </div>
    </div>
  );
}

export function Profile() {
  const { address, connector, isConnected } = useAccount()
  const { data: ensAvatar } = useEnsAvatar({ address })
  const { data: ensName } = useEnsName({ address })
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect()
  const { disconnect } = useDisconnect()
 
  if (isConnected) {
    return (
      <div>
        <img src={ensAvatar} alt="ENS Avatar" />
        <div>{ensName ? `${ensName} (${address})` : address}</div>
        <div>Connected to {connector.name}</div>
        <button onClick={disconnect}>Disconnect</button>
      </div>
    )
  }
 
  return (
    <div>
      {connectors.map((connector) => (
        <button
          disabled={!connector.ready}
          key={connector.id}
          onClick={() => connect({ connector })}
        >
          {connector.name}
          {!connector.ready && ' (unsupported)'}
          {isLoading &&
            connector.id === pendingConnector?.id &&
            ' (connecting)'}
        </button>
      ))}
 
      {error && <div>{error.message}</div>}
    </div>
  )
}

const Home: NextPage = () => {
  return (
    <WagmiConfig config={config}>
      <div className={styles.container}>
        <Head>
          <title>Bargain Bazaar</title>
          <meta name="description" content="Discount NFT Store" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
  
        <main className={styles.main}>
          <Profile />
          <div className={styles.heading}>
            <h1 className={styles.title}>
              Bargain Bazaar
            </h1>
  
            <p className={styles.description}>
              Buy undervalued NFTs
            </p>
          </div>
  
          <FilterableCollectionTable />
  
        </main>
  
        <footer className={styles.footer}>
          <a
            href="https://twitter.com/0xKofi"
            target="_blank"
            rel="noopener noreferrer"
          >
            Built on
            <span className={styles.logo}>
              <Image src="/replit.svg" alt="Replit Logo" width={20} height={18} />
            </span>
            Replit
          </a>
        </footer>
      </div>
    </WagmiConfig>
  )
}

export default Home
