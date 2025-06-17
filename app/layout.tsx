import "./globals.css";
import { Inter } from "next/font/google";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "이세계 아이돌: 우왁굳 선언의 벽 ",
  description: `이세계는 사라지고, ‘니 세계’만 남았다.
우왁굳에게 남기는 진심의 메시지 — 지금 당신의 세계를 증명하라. 카녜부터 쿠팍까지, 미발매 라이브와 함께 이세계 아이돌에게 서명하라.`,
  openGraph: {
    title: "이세계 아이돌: 우왁굳 선언의 벽 ",
    description: `이세계는 사라지고, ‘니 세계’만 남았다.
우왁굳에게 남기는 진심의 메시지 — 지금 당신의 세계를 증명하라. 카녜부터 쿠팍까지, 미발매 라이브와 함께 이세계 아이돌에게 서명하라.`,
    images: [
      {
        url: "/gggggggg.png",
        width: 1200,
        height: 630,
        alt: "Kanye West Bully",
      },
    ],
    type: "website",
    locale: "en_US",
    siteName: "Bully",
  },
  twitter: {
    card: "summary_large_image",
    title: "이세계 아이돌: 우왁굳 선언의 벽 ",
    description: `이세계는 사라지고, ‘니 세계’만 남았다.
우왁굳에게 남기는 진심의 메시지 — 지금 당신의 세계를 증명하라. 카녜부터 쿠팍까지, 미발매 라이브와 함께 이세계 아이돌에게 서명하라.`,
    images: ["/gggggggg.png"],
    creator: "@donquiniku",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>이세계 아이돌: 우왁굳 선언의 벽 </title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="이세계는 사라지고, ‘니 세계’만 남았다.
우왁굳에게 남기는 진심의 메시지 — 지금 당신의 세계를 증명하라. 카녜부터 쿠팍까지, 미발매 라이브와 함께 이세계 아이돌에게 서명하라."
        />
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
  );
}
