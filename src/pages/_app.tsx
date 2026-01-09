import RootLayout from "@/components/layout/RootLayout";
import { ThemeProvider } from "@/contexts/ThemeContext";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import { registerServiceWorker } from "@/lib/pwa/serviceWorker";
import { Analytics } from "@vercel/analytics/next";
import { AppProps } from "next/app";
import Head from "next/head";
import { useEffect } from "react";
import "../styles/globals.css";

function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Register service worker on mount
    registerServiceWorker();
  }, []);

  return (
    <>
      <Head>
        <title>ChatterHub - Advanced AI Chat Interface</title>
      </Head>
      <ThemeProvider>
        <RootLayout>
          <div className="min-h-screen">
            <Component {...pageProps} />
          </div>
        </RootLayout>
        <InstallPrompt />
      </ThemeProvider>
      <Analytics />
    </>
  );
}

export default App;
