import '../styles/globals.css'
import '../styles/fonts.css'
import type { AppProps } from 'next/app'
import {WagmiConfig} from "wagmi";
import {config} from "../utils/wagmi";

function MyApp({ Component, pageProps }: AppProps) {
  return(
      <WagmiConfig config={config}>
        <Component {...pageProps} />
      </WagmiConfig>
  )
}

export default MyApp
