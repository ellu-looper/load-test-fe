# 로드 테스트 최적화 Next.js 멀티스테이지 빌드
FROM node:18-alpine AS base

# 의존성 설치를 위한 필수 패키지
RUN apk add --no-cache libc6-compat

WORKDIR /app

# 의존성 설치 단계 (캐싱 최적화)
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production --no-audit --no-fund && npm cache clean --force

# 빌드 단계 (환경변수 베이킹)
FROM base AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --no-audit --no-fund

COPY . .

# GitHub Secrets에서 주입받을 빌드 인수
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_ENCRYPTION_KEY  
ARG NEXT_PUBLIC_PASSWORD_SALT

# 로드 테스트용 환경변수 (빌드 타임에 베이킹)
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_ENCRYPTION_KEY=$NEXT_PUBLIC_ENCRYPTION_KEY
ENV NEXT_PUBLIC_PASSWORD_SALT=$NEXT_PUBLIC_PASSWORD_SALT
ENV NODE_ENV=production

# Next.js 빌드 (성능 최적화)
RUN npm run build

# 프로덕션 실행 단계
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=512"

# 보안을 위한 non-root 사용자
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 빌드 결과물 복사
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 헬스체크
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/', (res) => { \
        process.exit(res.statusCode === 200 ? 0 : 1) \
    }).on('error', () => process.exit(1))"

CMD ["node", "server.js"]