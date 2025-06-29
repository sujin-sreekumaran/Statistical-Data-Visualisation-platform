import { AppProps } from "next/app";
import "../styles/globals.css"; // Make sure this line is present

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
