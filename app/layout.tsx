import './globals.css'
import { Inter } from 'next/font/google';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'KayneSign - Fan Wall',
  description: 'Leave your message and signature for Kanye West',
  openGraph: {
    title: '[YE UNRELEASED LIVE] FUCK COUPXXX COME KAYNE WEST',
    description: 'Kanye West Fan Wall - Leave your message and signature',
    images: [
      {
        url: '/gggggggg.png',
        width: 1200,
        height: 630,
        alt: 'Kanye West Bully',
      }
    ],
    type: 'website',
    locale: 'en_US',
    siteName: 'Bully',
  },
  twitter: {
    card: 'summary_large_image',
    title: '[YE UNRELEASED LIVE] FUCK COUPXXX COME KAYNE WEST',
    description: 'Kanye West Fan Wall - Leave your message and signature',
    images: ['/gggggggg.png'],
    creator: '@donquiniku',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>[YE UNRELEASED LIVE] FUCK COUPXXX COME KAYNE WEST</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Kanye West Fan Wall - Leave your message and signature" />
      </head>
      <body className="bg-black">
        {/* Google Tag Manager 스크립트 */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-2P7XT53WSM"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-2P7XT53WSM');
            `,
          }}
        />
        {children}
      </body>
    </html>
  )
} 