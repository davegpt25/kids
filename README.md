# KidsRoute 🗺️

> 우리 아이 학원, 충돌 없이 딱 맞게

GPS 반경 내 학원을 자동 수집하고, 시간 충돌 없는 최적 조합을 3초 만에 추천하는 학원 스케줄링 플랫폼 MVP.

## 프로젝트 구조

```
kids/
├── kidsroute-backend/   # NestJS + PostgreSQL + PostGIS API 서버
├── kidsroute-app/       # Expo (React Native) 모바일 앱
└── kidsroute-mock/      # 서비스 소개 목 웹사이트 (Vanilla HTML/CSS/JS)
```

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| 백엔드 | NestJS, TypeORM, PostgreSQL, PostGIS |
| 모바일 | Expo SDK 54, React Native, Zustand, TanStack Query |
| 인프라 (예정) | AWS EC2, RDS, S3 |

## 빠른 시작

### 백엔드

```bash
cd kidsroute-backend
npm install
# .env 파일 설정 (DB 연결 정보)
npm run start:dev
```

### 모바일 앱

```bash
cd kidsroute-app
npm install
npx expo start
```

### 목 사이트

```bash
cd kidsroute-mock
python -m http.server 5500
# http://localhost:5500 접속
```

## MVP 목표

- **Phase 1** (0~3개월): MAU 500명 · 서울 강남구 출시
- **Phase 2** (4~6개월): MAU 5,000명 · 프리미엄 전환 10%
- **Phase 3** (7~12개월): MAU 30,000명 · MRR 5,000만원

---

MVP v1.0 · © 2026 KidsRoute
