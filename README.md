# KidsRoute 🗺️

> 우리 아이 학원, 충돌 없이 딱 맞게

GPS 반경 내 학원을 자동 수집하고, 시간 충돌 없는 최적 조합을 3초 만에 추천하는 학원 스케줄링 플랫폼 MVP.

## 프로젝트 구조

```
kids/
├── kidsroute-backend/      # NestJS + PostgreSQL + PostGIS API 서버
├── kidsroute-app/          # Expo (React Native) 모바일 앱
├── kidsroute-mock/         # 서비스 소개 목 웹사이트 (Vanilla HTML/CSS/JS)
│   ├── index.html          # 랜딩페이지 (단일 파일, ~5000+ 줄)
│   └── email-template.html # 맞춤 결과 이메일 템플릿
└── docs/
    └── superpowers/
        ├── plans/          # 구현 플랜 문서
        └── specs/          # 스펙 문서
```

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| 백엔드 | NestJS, TypeORM, PostgreSQL, PostGIS |
| 모바일 | Expo SDK 54, React Native, Zustand, TanStack Query |
| 목 사이트 | Vanilla HTML/CSS/JS, Pretendard CDN |
| 인프라 (예정) | AWS EC2, RDS, S3 |
| 배포 (목 사이트) | GitHub Pages (`gh-pages` 브랜치) |

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

### 목 사이트 (로컬)

```bash
npx serve -p 4321 kidsroute-mock
# http://localhost:4321 접속
```

### GitHub Pages 배포

```bash
git subtree push --prefix kidsroute-mock origin gh-pages
```

**라이브 URL:** https://davegpt25.github.io/kids

---

## 목 사이트 (`kidsroute-mock/index.html`) 구현 현황

### 랜딩페이지 섹션

| 섹션 | 내용 | 상태 |
|------|------|------|
| Hero | 메인 헤드카피, CTA 버튼 (데모 모달 연결) | ✅ |
| 인터랙티브 데모 모달 | 5단계 플로우 (쿼리→지도→로딩→시뮬레이션→이메일→완료) | ✅ |
| 서비스 특장점 | 핵심 기능 3가지 카드 | ✅ |
| Press Bar | 언론 노출 로고 슬라이드 | ✅ |
| 비교표 | 기존 방식 vs 키즈루트 비교 테이블 | ✅ |
| 사용자 후기 | 7개 후기 슬라이더 (자동 재생) | ✅ |
| 비용 절감 계산기 | 월 이동 횟수 입력 → 절감 시간/비용 계산 | ✅ |
| 요금제 | 무료/유료 플랜 카드 + CTA 버튼 활성화 | ✅ |
| FAQ | 아코디언 섹션 (8개 항목) | ✅ |
| 사전예약 카운터 | 실시간 카운터 + D-Day 타이머 | ✅ |
| Footer | 카카오 공유 + 링크 복사 버튼 | ✅ |

### 데모 모달 단계별 흐름

```
Step 1 (demoStep1)  →  쿼리 선택 (타이핑 애니메이션)
Step 2 (demoStep2)  →  반경/셔틀/픽업 설정 + 과목 선택 + 요일/시간 선택
Step 3 (demoStep3)  →  AI 분석 로딩 애니메이션
StepSim (demoStepSim) →  시뮬레이션 결과 미리보기 (부분 공개)
Step 4 (demoStep4)  →  이메일 수집 폼
Step 5 (demoStep5)  →  완료 화면
```

### Step 2 — 과목·요일·시간 선택 UI

| 기능 | 내용 |
|------|------|
| 과목 선택 칩 | 8종: 수학/영어/피아노/미술/태권도/과학/코딩/체육 (복수 선택) |
| 요일 선택 | 월~일 7버튼 (기본: 월·수·금), 최소 1개 유지 |
| 시간대 선택 (평일) | 오후 4/5/6/7시 (기본: 오후 5시) |
| 시간대 선택 (주말) | 토 또는 일 선택 시 오전 9/10/11시 버튼 추가 표시 |

### StepSim — 시뮬레이션 결과 (부분 공개)

- **학원 추천 카드**: 선택 과목 기반, 순위 배지 + 도보 거리 + 시간대 + 태그
- **주간 스케줄 그리드**: 월~금 × 선택 시간대 행, 과목별 색상 셀
- **부분 공개 효과**: 카드 1번만 선명, 2번 blur(4px), 3번+ blur(8px) + 그라데이션 오버레이
- **잠금 배지**: "🔒 나머지 결과를 이메일로 확인하세요"

### 글로벌 상태 변수

```js
let _demoRadius     = 1000;      // 검색 반경 (m)
let _demoShuttle    = false;     // 셔틀 여부
let _demoPickup     = false;     // 픽업 여부
let _demoSubjects   = [];        // 선택 과목 키 배열 (예: ['math','english'])
let _demoPreferDays = [0,2,4];   // 선호 요일 (0=월 ~ 6=일)
let _demoPreferTime = 4;         // 선호 시간 슬롯 (0-2=오전, 3-6=오후)
```

---

## 이메일 템플릿 (`kidsroute-mock/email-template.html`)

사용자가 이메일 폼 제출 후 받는 맞춤 결과 이메일의 HTML 템플릿.

### 템플릿 변수

| 변수 | 설명 |
|------|------|
| `{{이름}}` | 학부모 이름 |
| `{{동네}}` | 동네명 (예: 서초동) |
| `{{반경}}` | 검색 반경 (예: 1km) |
| `{{과목1}}` ~ `{{과목3}}` | 선택한 과목 |
| `{{이메일}}` | 수신 이메일 주소 |

### 이메일 섹션 구성

1. **헤더** — 주황 그라데이션 + 키즈루트 로고
2. **히어로** — 분석 결과 요약 + 메타 정보 칩
3. **학원 TOP 3** — 순위 배지, 평점/거리/시간, 태그 카드
4. **주간 스케줄 표** — 월~금 × 오후 4~7시, 과목별 색상 코딩
5. **사전예약 확인** — 얼리버드 혜택 3가지
6. **CTA 버튼** — 랜딩페이지 이동
7. **푸터** — 연락처, 수신거부, 개인정보처리방침

**이메일 호환성:** 테이블 기반 레이아웃, 전체 인라인 CSS, MSO 조건부 주석, `@media 600px` 반응형

---

## MVP 목표

- **Phase 1** (0~3개월): MAU 500명 · 서울 강남구 출시
- **Phase 2** (4~6개월): MAU 5,000명 · 프리미엄 전환 10%
- **Phase 3** (7~12개월): MAU 30,000명 · MRR 5,000만원

---

## 구현 플랜 문서

| 파일 | 내용 | 상태 |
|------|------|------|
| `docs/superpowers/plans/2026-05-16-mock-redesign.md` | 목 사이트 초기 리디자인 (B 스타일) | ✅ 완료 |
| `docs/superpowers/plans/2026-05-30-simulation-step-and-pricing-cta.md` | 시뮬레이션 스텝 + 요금제 CTA + 과목/시간 선택 + 부분공개 + 이메일 템플릿 | ✅ 완료 |

---

MVP v1.0 · © 2026 KidsRoute
