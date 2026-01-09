import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta name="description" content="ChatterHub - Advanced AI chat interface with parallel conversations, folder organization, and support for OpenAI, Anthropic, and Google Gemini models" />
        <meta name="keywords" content="AI chat, ChatGPT, Claude, Gemini, parallel chat, AI assistant, conversation management" />
        <meta name="author" content="ChatterHub" />

        <meta property="og:title" content="ChatterHub - Advanced AI Chat Interface" />
        <meta property="og:description" content="Powerful AI chat interface with parallel conversations, folder organization, and multi-model support" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://chatterhub.site" />
        <meta property="og:image" content="https://chatterhub.site/logo/1024.png" />
        <meta property="og:image:width" content="1024" />
        <meta property="og:image:height" content="1024" />
        <meta property="og:image" content="https://chatterhub.site/logo/512.png" />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />
        <meta property="og:image" content="https://chatterhub.site/logo/256.png" />
        <meta property="og:image:width" content="256" />
        <meta property="og:image:height" content="256" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ChatterHub - Advanced AI Chat Interface" />
        <meta name="twitter:description" content="Powerful AI chat interface with parallel conversations, folder organization, and multi-model support" />
        <meta name="twitter:image" content="https://chatterhub.site/logo/512.png" />

        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />

        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}