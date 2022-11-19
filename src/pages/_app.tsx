import { type AppType } from "next/dist/shared/lib/utils";

import "../styles/globals.css";

import { Sono } from "@next/font/google";

const sono = Sono({ subsets: ['latin'] });

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <main className={sono.className}>
      <Component {...pageProps} />
    </main>
  )
};

export default MyApp;
