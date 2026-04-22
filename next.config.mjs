/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.akamai.steamstatic.com'
      }
    ]
  },
  experimental: {
    allowedDevOrigins: [
      "192.168.56.120:3000",      // 가상머신 IP
      "192.168.0.9:3000",         // 가상머신 IP
      "localhost:3000",           // 로컬호스트
      "127.0.0.1:3000",           // 로컬호스트 IP
      "crazygames20.heon.me",     // 실제 도메인 (포트가 80/443인 경우 도메인만)
      "api-crazygames20.geki.moe" // 서브 도메인
    ]
  },
  async headers() {
    return [
      {
        source: '/_next/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ];
  }
};

export default nextConfig;
