# KidsRoute 관리자 대시보드 + 멤버십 구독 시스템 Design Spec

**날짜:** 2026-05-30 → **최종 업데이트:** 2026-05-31  
**상태:** ✅ 승인됨 + 구현 완료

---

## Goal

1. **멤버십 구독 시스템 (C 방식):** 이메일 등록 = 7일 무료 체험 → 만료 후 잠금형(A)으로 전환
2. **관리자 대시보드:** `davegpt25@gmail.com` 로그인 시 랜딩페이지가 풀 대시보드로 전환
3. **WTP 3가지 기능** 관리자가 ON/OFF 제어 + 실사용자에게 멤버십 게이트 노출

---

## 용어 정의

| 용어 | 의미 |
|------|------|
| 멤버십 구독 | 유료 구독 플랜 (기존 "프리미엄" 대체) |
| 체험 중 | 이메일 등록 후 7일 무료 사용 기간 |
| 만료 | 7일 체험 종료, 멤버십 기능 잠김 |
| WTP 기능 | Willingness-to-Pay를 만드는 3가지 핵심 기능 |

---

## 아키텍처

### 파일 구조

```
kidsroute-mock/
├── index.html        # 랜딩 + 어드민 대시보드 모두 포함 (단일 파일)
└── email-template.html
```

단일 파일 유지. 어드민 뷰는 CSS `display:none` / `display:flex` 로 랜딩 ↔ 대시보드 전환.

### 데이터 저장 (localStorage)

```js
// 멤버 등록 데이터
localStorage['kr_members'] = JSON.stringify([
  { email: "user@naver.com", name: "김지수", registeredAt: 1748600000, trialDays: 7 },
  ...
])

// 어드민 세션
localStorage['kr_admin_session'] = "davegpt25@gmail.com"

// 기능 토글 상태
localStorage['kr_features'] = JSON.stringify({
  scheduleHistory: true,   // 스케줄 저장 & 히스토리
  confidenceScore: true,   // 최적 조합 신뢰도 점수
  vacancyAlert: false       // 공석 알림
})

// 공석 알림 대기열
localStorage['kr_alerts'] = JSON.stringify([
  { id: 1, academy: "강남 베스트 수학", slots: 1, waitCount: 8, status: "pending", createdAt: ... },
  ...
])

// ── 2026-05-31 추가 키 ──
// 학부모 앱 — 등록 학원 스케줄
localStorage['kr_user_schedule'] = JSON.stringify([
  { academyId: 1, name: '강남 베스트 수학', subj: 'math', label: '수학',
    color: '#F97316', times: ['월수금 오후4시'], addedAt: timestamp }
])

// 학부모 앱 — 아이 정보 (사진/성별/학년 포함)
localStorage['kr_children'] = JSON.stringify([
  { id: 'c1748600000', name: '지수', birthYear: '2018', grade: '초2',
    emoji: '👧', gender: 'female', photo: 'data:image/png;base64,...' }
])

// 학부모 앱 — 학부모 상세 정보
localStorage['kr_parent_info'] = JSON.stringify({
  realName: '김민지',
  phone: '010-1234-5678',
  signature: 'data:image/png;base64,...'
})

// 학부모 앱 — 알림 설정
localStorage['kr_notif_prefs'] = JSON.stringify({
  vacancy: true,
  reminder: true,
  news: false
})
```

---

## 멤버십 구독 시스템

### 이메일 등록 → 체험 시작 플로우

```
데모 모달 Step 4 (이메일 폼 제출)
  → localStorage에 멤버 데이터 저장 (registeredAt = 현재 timestamp)
  → Step 5 "완료 화면"에 "7일 무료 멤버십 체험이 시작되었습니다" 메시지 표시
  → 이후 방문 시 이메일 로컬 조회 → 체험 기간 계산
```

### 체험 상태 계산

```js
function getMemberStatus(member) {
  const daysPassed = (Date.now() - member.registeredAt) / (1000 * 60 * 60 * 24);
  const daysLeft = Math.ceil(member.trialDays - daysPassed);
  if (daysLeft > 0) return { type: 'trial', daysLeft };
  if (member.isPaid) return { type: 'active' };
  return { type: 'expired' };
}
```

### WTP 기능 접근 제어

각 WTP 기능 진입 시:
1. 이메일 로컬 체크 → 멤버 상태 조회
2. `trial` 또는 `active` → 기능 사용 허용
3. `expired` → 잠금 모달 표시 ("멤버십 구독으로 계속 사용하기")
4. 비등록 → 이메일 등록 유도 모달 표시

---

## WTP 3가지 기능 명세

### 1. ⏱️ 스케줄 저장 & 히스토리 (시간 절약)

- 시뮬레이션 결과를 최대 5개 저장
- 저장 버튼: `demoStepSim` 하단에 "💾 이 조합 저장하기" 버튼 추가
- 저장 목록: 메인 페이지 상단 "저장된 스케줄" 섹션 (멤버십 전용 배너 내)
- 비멤버 접근 시: 버튼 클릭 → 잠금 모달

**저장 데이터 구조:**
```js
{
  id: uuid,
  savedAt: timestamp,
  label: "수학+영어+피아노 조합",
  subjects: ['math','english','piano'],
  preferDays: [0,2,4],
  preferTime: 4,
  cards: [...] // _renderSimCards 결과 스냅샷
}
```

### 2. ✨ 최적 조합 신뢰도 점수 (결정 불안 해소)

- `demoStepSim` 카드 상단에 신뢰도 배지 표시: `"AI 추천 신뢰도 94%"`
- 계산식 (목업): `base 80 + (과목 수 × 3) + (선호 요일 수 × 2) - 랜덤 노이즈`
- 배지 색상: 90%+ 초록, 75-89% 주황, 75% 미만 회색
- 첫 번째 카드에만 신뢰도 표시, 2번째+ 카드는 멤버십 잠금
- 비멤버: 배지 흐림 처리 + "멤버십에서 확인" 텍스트

### 3. 🔔 학원 공석 실시간 알림 (기회 손실 공포)

- `demoStepSim` 하단 "🔔 공석 나면 알려줘" 버튼
- 클릭 시: 알림 등록 모달 (이메일 확인 + 관심 학원 선택)
- 등록 데이터: localStorage `kr_alerts` 대기열에 추가
- 관리자 대시보드에서 수동 "알림 발송" 버튼으로 처리 (실제 발송은 미구현, UI만)
- 비멤버: 등록 시 "7일 무료 체험 시작 후 알림 받기" 안내

---

## 관리자 대시보드

### 진입 방법

```
Footer 하단 "관리자" 텍스트 링크 (작은 크기, 회색)
  → 클릭 시 로그인 모달 표시
  → 이메일 입력: davegpt25@gmail.com
  → 일치 시: localStorage['kr_admin_session'] 저장
             랜딩 페이지 숨김 (.landing-root display:none)
             어드민 뷰 표시 (.admin-root display:flex)
  → 불일치 시: "관리자 이메일이 아닙니다" 에러
  → 로그아웃: 사이드바 하단 "로그아웃" 클릭 → 세션 삭제 → 랜딩 복귀
```

### 레이아웃

```
┌─────────────────────────────────────────────────────┐
│  사이드바 (220px)  │  메인 콘텐츠 (flex:1)           │
│                   │                                  │
│  🗺️ 키즈루트      │  [KPI 4개 카드]                  │
│  ADMIN            │                                  │
│                   │  [일별 차트] [최근 가입자 목록]   │
│  Overview         │                                  │
│  > 대시보드       │  [WTP 기능 스위치] [공석 알림]   │
│                   │                                  │
│  Management       │                                  │
│  > 멤버십 관리    │                                  │
│  > 기능 설정      │                                  │
│  > 공석 알림 🟢3  │                                  │
│                   │                                  │
│  Analytics        │                                  │
│  > 가입 통계      │                                  │
│  > 전환율         │                                  │
│                   │                                  │
│  [관리자 프로필]  │                                  │
└─────────────────────────────────────────────────────┘
```

### 대시보드 홈 섹션

#### KPI 카드 (4개)
| 카드 | 값 소스 | 델타 |
|------|---------|------|
| 총 사전예약 | `kr_members.length` | 오늘 신규 수 |
| 멤버십 활성 | `isPaid === true` count | 이번 주 신규 |
| 체험 중 | `status === 'trial'` count | 만료 임박(D-2 이하) |
| 전환율 | `active / total × 100` | 전주 대비 |

#### 일별 가입 추이 차트
- 최근 7일 bar chart (CSS + JS로 구현, canvas 불필요)
- 각 바 높이: 해당 날짜 `registeredAt` 기준 집계
- 오늘 바는 주황색 강조

#### 최근 가입자 목록
- 최신 4명 표시, "전체 보기 →" 링크로 멤버십 관리 탭 이동
- 각 행: 이메일 마스킹(앞 3자리 + **) · 가입일 · 상태 배지 · 멤버십 토글
- 토글 ON/OFF → `kr_members` localStorage 업데이트

#### WTP 기능 ON/OFF 스위치
- 3개 토글 (스케줄 저장 / 신뢰도 점수 / 공석 알림)
- 토글 변경 → `kr_features` localStorage 업데이트
- 사용자 화면에 즉시 반영 (기능 활성화/비활성화)

#### 공석 알림 대기열
- `kr_alerts` 에서 `status === 'pending'` 항목 표시
- "알림 발송" 버튼 클릭 → status를 'sent'로 변경, 발송 완료 표시
- 발송된 항목은 흐림 처리 + "✅ 발송됨" 표시

### 멤버십 관리 페이지

전체 멤버 테이블:
- 이메일(마스킹) / 이름 / 가입일 / 상태 / 남은 기간 / 멤버십 토글
- 상태별 필터 탭: 전체 / 체험 중 / 멤버십 / 만료
- CSV 내보내기 버튼 (브라우저 다운로드)

---

## 로그인 모달 UX

```
┌─────────────────────────────┐
│  🗺️  관리자 로그인           │
│                             │
│  이메일                     │
│  [________________]         │
│                             │
│  [  로그인  ]               │
│                             │
│  ✕ 닫기                     │
└─────────────────────────────┘
```

- 배경: 반투명 오버레이 (랜딩 위에 표시)
- Enter 키 로그인 지원
- 틀린 이메일: "관리자 계정이 아닙니다" 인라인 에러

---

## 잠금 모달 (멤버십 게이트)

만료된 사용자가 WTP 기능 접근 시:

```
┌─────────────────────────────┐
│  🔒  멤버십 전용 기능        │
│                             │
│  7일 무료 체험이 종료됐어요. │
│  멤버십 구독으로 계속        │
│  사용하세요.                 │
│                             │
│  [  멤버십 구독하기  ]      │
│  나중에 →                   │
└─────────────────────────────┘
```

---

## 구현 범위 (In Scope)

### 원래 계획 (2026-05-30)
- [x] Footer 관리자 링크 + 로그인 모달
- [x] 랜딩 ↔ 대시보드 뷰 전환
- [x] localStorage 기반 멤버 데이터 관리
- [x] KPI 카드 (localStorage 집계)
- [x] 일별 차트 (CSS 바 차트)
- [x] 최근 가입자 목록 + 멤버십 토글
- [x] WTP 기능 3가지 ON/OFF 스위치
- [x] 공석 알림 대기열 + 수동 발송 버튼
- [x] 멤버십 관리 탭 (전체 목록 + 필터)
- [x] 체험 상태 계산 로직
- [x] Step 5 "7일 무료 체험 시작" 메시지 업데이트
- [x] WTP 기능 3가지 UI (저장 버튼, 신뢰도 배지, 공석 등록 버튼)
- [x] 만료 사용자 잠금 모달

### 추가 구현 (2026-05-31~)

**네비게이션 개편**
- [x] 상단 네비: `사전예약 | 로그인 | 기능 이용방법 요금제 데모 체험` 순서
- [x] 로그인 버튼 → 학부모 앱 뷰 전환 (사전예약과 분리)
- [x] 관리자 로그인은 Footer 전용 유지
- [x] 사이드바 하단 로컬 컴패니언 링크 (`http://localhost:63523/`)

**랜딩 페이지 정리**
- [x] 시간 절약 계산기 섹션 제거
- [x] 단계별 성과 지표 섹션 제거
- [x] 데모 섹션 → 심플 CTA 카드로 교체

**히어로 폰 목업 지도**
- [x] CSS 가짜 지도 → SVG 삽화 (역삼동 도로/블록 패턴)
- [x] 3초마다 동네 자동 로테이션: 역삼동 → 사당동 → 대치동 → 잠실동
- [x] 각 동네별 학원 핀 위치·이름·목록 다르게 표시 (fade 전환)

**데모 Step 2 지도**
- [x] 네이버 지도 실제 연동 (`ncpKeyId: 5dq02tmsku`)
- [x] GPS 현재 위치 + Reverse Geocoding 주소 표시
- [x] 지도 크기 확대/축소 버튼 (200px ↔ 340px)

**이메일 발송 (EmailJS)**
- [x] 이메일 등록 시 실제 이메일 발송
- [x] 발송 내용: 추천 학원 TOP3 + 주간 스케줄 표 + 얼리버드 혜택
- [x] EmailJS 연동: `service_rkuc4g7` / `template_6brgdse` / `UJDqX9x6UVJC12UTT`
- [x] Reverse Geocoding으로 현재 위치 주소를 이메일에 포함

**학부모 앱 뷰 (`#userRoot`, z-index:9000)**
- [x] 로그인 시 전체화면 학부모 앱으로 전환
- [x] 하단 3탭: 학원 검색 / 스케줄 / 내 정보

**학원 검색 탭**
- [x] 목록 뷰: 과목 필터, 정렬(거리/평점/요금), 10개 목업 학원 카드
- [x] 지도 뷰: 네이버 지도, 주소 검색(Geocoding), 내 위치, 반경 원
- [x] 마커 클릭 → InfoWindow (학원 정보 + 스케줄 추가)
- [x] 하단 가로 슬라이더 카드 (탭 → 지도 fly 이동)
- [x] 지도 이동 시 거리 자동 재계산

**스케줄 탭**
- [x] 월~일 주간 캘린더 (등록 학원 시간별 표시, 오늘 강조)
- [x] 등록 학원 목록 (삭제, 과목 색상)
- [x] AI 추천 받기 → 데모 시뮬레이션 연결

**내 정보 탭**
- [x] 학부모 정보: 실제 이름, 핸드폰 번호 (인라인 편집)
- [x] 전자 서명: 캔버스 손글씨 서명 등록 (하단 시트)
- [x] 아이 추가 폼 개편:
  - 📷 사진 업로드 (원형, base64)
  - 아이 닉네임 = 학부모 표시명
  - 👦 남아 / 👧 여아 성별 선택
  - 학년 optgroup: 미취학 5세/6세/7세, 초1~6, 중1~3
- [x] 알림 설정 토글 3개

## 구현 제외 (Out of Scope)

- 실제 결제 연동
- 백엔드 API / 서버
- 다중 관리자 계정
- 실제 학원 데이터 (공공 API)
- ~~실제 이메일 발송~~ → ✅ EmailJS로 구현 완료

---

## Self-Review

**Placeholder 없음** ✅  
**내부 일관성:**
- localStorage key 명칭 전 섹션 통일 (`kr_members`, `kr_features`, `kr_alerts`, `kr_admin_session`) ✅
- 멤버십/프리미엄 혼용 없음, 전체 "멤버십 구독" 사용 ✅
- WTP 3가지 기능명 전 섹션 동일 ✅

**범위:** 단일 HTML 파일 + localStorage. 백엔드 없이 동작하는 목업으로 충분히 시연 가능한 범위 ✅
