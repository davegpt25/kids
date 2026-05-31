# KidsRoute 전체 구현 스펙 (누적)

**날짜:** 2026-05-31  
**상태:** ✅ 진행 중  
**파일:** `kidsroute-mock/index.html` (단일 파일), `kidsroute-mock/email-template.html`  
**배포:** https://davegpt25.github.io/kids

---

## 아키텍처 개요

```
kidsroute-mock/
├── index.html          # 모든 기능 포함 (랜딩 + 학부모앱 + 관리자 대시보드)
└── email-template.html # 이메일 HTML 양식 (참고용)
```

### 뷰 계층 (z-index)

| 레이어 | z-index | 설명 |
|---|---|---|
| 랜딩 페이지 | 기본 | `.landing-root` |
| 학부모 앱 뷰 | 9000 | `#userRoot` |
| 관리자 대시보드 | 9500 | `#adminRoot` |
| 전자서명 시트 | 9800 | `.ur-sign-overlay` |
| 관리자 로그인 오버레이 | 9000 | `.admin-login-overlay` |
| 잠금 모달 | 8500 | `.lock-overlay` |
| 공석 알림 모달 | 8000 | `.alert-reg-overlay` |

### localStorage 키 목록

| 키 | 내용 |
|---|---|
| `kr_members` | 사전예약/이메일 등록 멤버 배열 |
| `kr_admin_session` | 관리자 세션 (`davegpt25@gmail.com`) |
| `kr_features` | WTP 기능 ON/OFF 상태 |
| `kr_alerts` | 공석 알림 대기열 |
| `kr_saved_schedules` | 학부모 저장 스케줄 |
| `kr_user_schedule` | 학부모 앱 등록 학원 |
| `kr_children` | 아이 정보 배열 |
| `kr_parent_info` | 학부모 실명/전화/서명 |
| `kr_notif_prefs` | 알림 설정 |

### 외부 API

| 서비스 | 용도 | 키/ID |
|---|---|---|
| Naver Maps JS API v3 | 지도 표시, Geocoding, Reverse Geocoding | `ncpKeyId: 5dq02tmsku` |
| EmailJS | 맞춤 결과 이메일 발송 | Public: `UJDqX9x6UVJC12UTT` / Service: `service_rkuc4g7` / Template: `template_6brgdse` |
| Kakao SDK | 카카오 소셜 공유 | `1550b9b3a098d276139c9f66eabb7a64` |
| Google Identity Services | Google 로그인 (목업) | CDN 로드 |

---

## 1. 랜딩 페이지

### 1-1. 네비게이션

```
[사전예약] [로그인] | 기능 이용방법 요금제 데모 체험
```

- **사전예약** → `openGoogleLogin()` (Google/Kakao 목업 로그인)
- **로그인** → `openGoogleLogin()` → 로그인 성공 시 학부모 앱 뷰(`#userRoot`) 전환
- Footer 하단 **관리자** 텍스트 → `openAdminLogin()` → 관리자 대시보드

### 1-2. 히어로 섹션 폰 목업

- SVG 삽화 지도 (강남구 역삼동 스타일)
- **3초 자동 로테이션:** 역삼동 → 사당동 → 대치동 → 잠실동
- 각 동네마다 학원 핀 위치·학원명·목록 변경 (fade 전환)
- 주황 반경 원, 파란 GPS 점, 과목별 컬러 핀 (수학/영어/미술/피아노/태권도)

### 1-3. 데모 모달 (5단계 플로우)

| 단계 | 내용 |
|---|---|
| Step 1 | 타이핑 애니메이션 (학원 고민 예시 문구 3가지) |
| Step 2 | 위치 설정 (네이버 지도 실제 연동, GPS, 반경 선택) + 추가 서비스 + 과목 선택 |
| Step 3 | 시뮬레이션 결과 (AI 추천 조합 카드) + WTP 기능 버튼 |
| Step 4 | 이메일 수집 폼 (이름, 이메일, 자녀나이) |
| Step 5 | 완료 화면 (7일 무료 멤버십 체험 시작 메시지) |

**Step 2 지도:**
- 실제 네이버 지도 (`ncpKeyId: 5dq02tmsku`)
- 현재 위치 GPS → Reverse Geocoding으로 주소 표시
- 반경 500m~5km 선택
- 지도 확대 버튼 (200px ↔ 340px 토글)

**Step 3 시뮬레이션 카드 (WTP 3가지 기능):**

| 기능 | 버튼 | 멤버십 게이트 |
|---|---|---|
| ⏱️ 스케줄 저장 | 💾 이 조합 저장하기 | 미등록/만료 시 잠금 모달 |
| ✨ 신뢰도 점수 | 카드 상단 배지 | 2번째+ 카드 blur 처리 |
| 🔔 공석 알림 | 🔔 공석 나면 알려줘 | 미등록 시 이메일 등록 유도 |

### 1-4. 이메일 발송 (EmailJS)

`submitLeadForm()` 호출 시:
1. 멤버 localStorage 등록
2. Reverse Geocoding으로 현재 위치 주소 획득
3. `sendKidsrouteEmail()` → EmailJS로 HTML 이메일 발송
4. 이메일 내용: 학원 TOP3 추천, 주간 스케줄 표, 얼리버드 혜택

**EmailJS 템플릿 변수:**
```
to_email, to_name, subject, html_body
```

### 1-5. 제거된 섹션

- ~~시간 절약 계산기~~ (지금 몇 시간을 낭비하고 계신가요?)
- ~~단계별 성과 지표~~ (Phase 1/2/3 + North Star)

---

## 2. 학부모 앱 뷰 (`#userRoot`)

로그인 성공(`onLoginSuccess`) 시 전체 화면으로 전환. z-index: 9000.

### 2-1. 상단 네비 + 하단 탭바

```
┌─────────────────────┐
│  🗺️ 키즈루트  [아바타] │  ← 상단 (56px)
│                     │
│    콘텐츠 영역       │
│                     │
│ 🔍학원검색 📅스케줄 👤내정보 │  ← 하단 (60px)
└─────────────────────┘
```

### 2-2. 학원 검색 탭

**목록 뷰:**
- 텍스트 검색 + 과목 필터 칩 (전체/수학/영어/피아노/미술/태권도/코딩/체육)
- 정렬: 거리순 / 평점순 / 요금순
- 학원 카드 10개 (거리, 평점, 요금, 시간, 셔틀 표시)
- **+ 추가 / ✓ 등록됨** 토글 버튼

**지도 뷰 (목록/지도 토글):**
- 실제 네이버 지도 (강남구 역삼동 기본)
- 주소 검색 (Geocoding)
- 반경 원 (500m~5km)
- 내 위치 GPS 버튼 → 현재 위치 이동 + Reverse Geocoding 주소 배지
- 과목별 컬러 마커 핀 → 클릭 시 InfoWindow (학원명, 거리, 평점, 요금, 셔틀, 스케줄 추가 버튼)
- 하단 가로 스크롤 카드 → 탭 시 해당 마커로 fly 이동
- 지도 이동 시 거리 자동 재계산

**목업 학원 데이터 (10개):**

| ID | 이름 | 과목 | 거리 | 평점 |
|---|---|---|---|---|
| 1 | 강남 베스트 수학 | 수학 | 0.4km | 4.8 |
| 2 | YBM 영어 서초점 | 영어 | 0.7km | 4.6 |
| 3 | 예원 피아노 | 피아노 | 0.9km | 4.9 |
| 4 | 하늘 미술학원 | 미술 | 1.1km | 4.5 |
| 5 | 스피드 수학 | 수학 | 1.3km | 4.3 |
| 6 | ABC 영어 마을 | 영어 | 1.5km | 4.7 |
| 7 | 챔피언 태권도 | 태권도 | 0.6km | 4.4 |
| 8 | 코딩 두뇌 lab | 코딩 | 1.8km | 4.6 |
| 9 | 반포 과학 탐구 | 과학 | 1.0km | 4.5 |
| 10 | 윈윈 체육 센터 | 체육 | 0.8km | 4.3 |

### 2-3. 스케줄 탭

- 월~일 주간 캘린더 (오늘 강조, 등록 학원 시간별 표시)
- 등록 학원 목록 (과목 색상 · 시간 · 삭제 버튼)
- **✨ AI 추천 받기** → 기존 시뮬레이션 데모 연결

### 2-4. 내 정보 탭

#### 계정 프로필
- 로그인 계정 아바타 (이름 첫 글자, 소셜 색상)
- 닉네임, 이메일 표시

#### 학부모 정보 (localStorage: `kr_parent_info`)
| 항목 | 기능 |
|---|---|
| 실제 이름 | 인라인 편집 (변경 버튼 → 입력 → 저장/취소) |
| 핸드폰 번호 | 인라인 편집 |
| 전자 서명 | 하단 시트 캔버스에 마우스/터치 서명 → PNG 저장 |

#### 아이 정보 (localStorage: `kr_children`)

아이 추가/수정 폼:
- **📷 사진** (원형 업로드, base64 저장)
- **아이 닉네임** (= 학부모 앱 표시명)
- **성별** (👦 남아 / 👧 여아 버튼)
- **출생연도** (숫자 입력)
- **학년/나이** (optgroup 선택):
  - 미취학 5세 / 6세 / 7세
  - 초등 1~6학년
  - 중학교 1~3학년

아이 카드 표시: 사진(또는 성별 이모지), 닉네임, 성별 배지, 학년·출생연도

#### 알림 설정
- 공석 알림 ON/OFF
- 스케줄 리마인더 ON/OFF
- 키즈루트 소식 ON/OFF

---

## 3. 관리자 대시보드 (`#adminRoot`)

**진입:** Footer "관리자" → 로그인 모달 → `davegpt25@gmail.com` 입력  
**로그아웃:** 사이드바 하단 ↩ 버튼 or 로컬 컴패니언 링크 표시

z-index: 9500 (학부모 앱 위)

### 3-1. 레이아웃

```
┌─────────────────────────────────────────────────────┐
│  사이드바 (220px)  │  메인 콘텐츠 (flex:1)           │
│  🗺️ 키즈루트 ADMIN │  KPI 4개 카드                    │
│                   │  일별 차트 + 최근 가입자          │
│  Overview         │  WTP 기능 스위치 + 공석 대기열   │
│  > 대시보드       │                                  │
│  Management       │                                  │
│  > 멤버십 관리    │                                  │
│  > 기능 설정      │                                  │
│  > 공석 알림      │                                  │
│  Analytics        │                                  │
│  > 가입 통계      │                                  │
│  > 전환율         │                                  │
│                   │                                  │
│  🖥️ 로컬 컴패니언  │                                  │
│  [관리자 프로필]  │                                  │
└─────────────────────────────────────────────────────┘
```

### 3-2. KPI 카드 (4개)

| 카드 | 소스 |
|---|---|
| 총 사전예약 | `kr_members.length` |
| 멤버십 활성 | `isPaid === true` count |
| 체험 중 | `status === 'trial'` count |
| 전환율 | `active / total × 100` |

### 3-3. 사이드바 특수 링크

- **🖥️ 로컬 컴패니언 열기** → `http://localhost:63523/` (관리자 로그인 후만 표시)

### 3-4. 멤버십 관리 탭

- 전체 멤버 테이블 (이메일 마스킹, 가입일, 상태, 남은 기간, 토글)
- 필터 탭: 전체 / 체험 중 / 멤버십 / 만료
- CSV 내보내기

### 3-5. WTP 기능 ON/OFF

| 기능키 | 기능명 |
|---|---|
| `scheduleHistory` | ⏱️ 스케줄 저장 & 히스토리 |
| `confidenceScore` | ✨ 최적 조합 신뢰도 점수 |
| `vacancyAlert` | 🔔 학원 공석 실시간 알림 |

### 3-6. 씨드 데이터

콘솔에서 `adminSeed()` 실행 → 8명 목업 멤버 + 3개 공석 알림 생성

---

## 4. 멤버십 구독 시스템

### 체험 상태 계산

```js
function getMemberStatus(member) {
  const daysPassed = (Date.now() - member.registeredAt) / (1000*60*60*24);
  const daysLeft = Math.ceil(member.trialDays - daysPassed);
  if (daysLeft > 0) return { type: 'trial', daysLeft };
  if (member.isPaid) return { type: 'active' };
  return { type: 'expired' };
}
```

### WTP 기능 접근 제어

```
이메일 미등록 → 이메일 등록 유도 모달
trial / active → 기능 사용 허용
expired → 잠금 모달 (멤버십 구독하기)
기능 OFF (관리자) → "기능 준비 중" 모달
```

---

## 5. 이메일 발송 시스템

**서비스:** EmailJS (무료 200건/월)

| 설정 | 값 |
|---|---|
| Public Key | `UJDqX9x6UVJC12UTT` |
| Service ID | `service_rkuc4g7` |
| Template ID | `template_6brgdse` |

**EmailJS 템플릿 설정:**
- To Email: `{{to_email}}`
- To Name: `{{to_name}}`
- Subject: `{{subject}}`
- Body (HTML): `{{html_body}}`

**발송 내용 (동적 생성):**
1. 헤더 (키즈루트 로고 + 오렌지 그라디언트)
2. 히어로 (이름, 동네, 반경, 과목)
3. 추천 학원 TOP 3 (등수 배지, 평점, 거리, 시간)
4. 주간 스케줄 표 (과목별 컬러)
5. 사전예약 확인 + 얼리버드 혜택
6. CTA 버튼
7. 푸터

**트리거:** 데모 Step 4 이메일 폼 제출 → `submitLeadForm()` → `sendKidsrouteEmail()`

---

## 6. 네이버 지도 연동

**Client ID:** `5dq02tmsku`  
**등록 도메인:** `https://davegpt25.github.io`, `http://localhost:63523`  
**서브모듈:** `geocoder` (Geocoding + Reverse Geocoding 포함)

### 사용 위치

| 위치 | 기능 |
|---|---|
| 랜딩 데모 Step 2 | 현재 위치 지도, GPS, 반경 원 |
| 학부모 앱 지도 뷰 | 학원 마커, 주소 검색, 내 위치 |

### API 활용

```js
// Reverse Geocoding
naver.maps.Service.reverseGeocode({ coords, orders: [ROAD_ADDR, ADDR] }, cb)

// Geocoding (주소 검색)
naver.maps.Service.geocode({ query: '강남구 역삼동' }, cb)

// 지도 초기화
new naver.maps.Map('elementId', { center, zoom, zoomControl, ... })

// 마커 (커스텀 HTML 아이콘)
new naver.maps.Marker({ position, map, icon: { content: '<div>...</div>', anchor } })

// 반경 원
new naver.maps.Circle({ map, center, radius, strokeColor, fillColor, fillOpacity })
```

---

## 7. 보안 처리

- `_escHtml()` — innerHTML 삽입 전 XSS 방어
- `data-email` 속성 + `this.dataset.email` — onclick 이메일 인젝션 방어
- ES5 호환 — `Array.prototype.forEach.call()` (NodeList)

---

## 8. 구현 제외 (Out of Scope)

- 실제 결제 연동
- 백엔드 API / 서버
- 다중 관리자 계정
- 실제 학원 데이터 (공공 API)
- 카카오 알림톡 발송
