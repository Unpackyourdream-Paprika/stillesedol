/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src * data: blob: 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline'; worker-src * blob:",
          },
        ],
      },
    ];
  },
  // 외부 HTTP 스트리밍 서버에 대한 프록시 설정
  // 이를 통해 보안 제한 없이 HTTP 소스에 접근할 수 있습니다
  async rewrites() {
    return [
      {
        source: "/stream/:path*",
        destination: "http://125.129.229.251:8081/:path*", // 프록시: 안전하지 않은 HTTP 연결을 우회
      },
    ];
  },
  // 환경변수 설정
  env: {
    NEXT_PUBLIC_YOUTUBE_VIDEO_ID: process.env.NEXT_PUBLIC_YOUTUBE_VIDEO_ID,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
};

module.exports = nextConfig;
