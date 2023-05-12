import '../styles/globals.css'
import '../styles/fonts.css'
import { 
  ReservoirKitProvider, 
  getDefaultWallets, //module has no exported member called getDefaultWallets
  lightTheme as rainbowLightTheme 
} from '@reservoir0x/reservoir-kit-ui'
import { WagmiConfig, createClient, configureChains } from 'wagmi'
import type { AppProps } from 'next/app'
import { publicProvider } from 'wagmi/providers/public'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import supportedChains from './utils/chains'

const { chains, provider } = configureChains(supportedChains, [
  alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_ID || '' }),
  publicProvider(),
])

const { connectors } = getDefaultWallets({
  appName: 'Reservoir Marketplace',
  chains,
})

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
})


function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp
