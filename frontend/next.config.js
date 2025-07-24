/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Re-enabled to catch hook violations
  transpilePackages: ['@vapor-ui/core', '@vapor-ui/icons'],
  // Docker 빌드를 위한 standalone 출력 모드
  output: 'standalone',
  // 개발 환경에서의 에러 오버레이 설정
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right'
  },
  // 개발 환경에서만 더 자세한 에러 로깅
  ...(process.env.NODE_ENV === 'development' && {
    experimental: {
      forceSwcTransforms: true
    }
  })
};

module.exports = nextConfig;