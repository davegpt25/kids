# KidsRoute 목 사이트 리디자인 스펙

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 기존 단일 `index.html`을 B 스타일(따뜻/친근)로 개선해 학부모 대상 상용화 수준 랜딩페이지로 완성한다.

---

## 컨텍스트

- **파일**: `kidsroute-mock/index.html` (단일 파일, 인라인 CSS + JS)
- **접근 방식**: 기존 파일 점진적 개선 (완전 재작성 X)
- **목적**: 잠재 사용자(학부모) 대상 App Store / Play Store 사전예약 유도

---

## 디자인 시스템

### 컬러 — 현재 적용 (주황 B 스타일)
```css
--primary:      #F97316;   /* 주황 — 버튼, 포인트 */
--primary-dark: #EA6C0A;   /* 주황 hover */
--primary-light:#FFF7ED;   /* 주황 연한 배경 */
--bg-base:      #FFFBF7;   /* 크림 — 페이지 배경 */
--bg-card:      #FFFFFF;   /* 카드 배경 */
--border:       #F5F0EB;   /* 카드 테두리 */
--text-main:    #1C1C1C;   /* 본문 */
--text-sub:     #78716C;   /* 보조 */
--text-muted:   #A8A29E;   /* 비활성 */
```

### 컬러 — 대안 톤 후보 (학부모 신뢰 색상 검토 중)

> 당근마켓 주황(#F97316)과 겹쳐 보인다는 피드백에 따라 아래 5개 후보를 미리보기로 검토함.
> 미리보기 파일: `kidsroute-mock/tone-preview.html` (네이비/그린), `kidsroute-mock/tone-pink.html` (핑크/로즈 3종)

#### 후보 A — 딥 네이비 (Deep Navy Trust)
```css
--primary:       #1B4F8A;
--primary-dark:  #153D6F;
--primary-light: #EBF2FB;
--bg-base:       #F7FAFF;
--border:        #DDE8F5;
```
- **키워드**: 전문성 · 안정감 · 신뢰 · 교육기관 느낌
- **타깃**: 권위 있는 교육 서비스 인상, 40대 학부모

#### 후보 B — 에메랄드 그린 (Warm Trust Green)
```css
--primary:       #059669;
--primary-dark:  #047857;
--primary-light: #ECFDF5;
--bg-base:       #F7FBF9;
--border:        #D1FAE5;
```
- **키워드**: 성장 · 건강 · 안전 · 육아 친화
- **타깃**: 자연스러운 교육 성장 이미지, 에듀테크 앱 톤

#### 후보 C — 소프트 로즈 (Soft Rose) ⭐ 30대 학부모 친화
```css
--primary:       #E05480;
--primary-dark:  #C04060;
--primary-light: #FFF0F4;
--bg-base:       #FFF8FA;
--border:        #FADADF;
```
- **키워드**: 따뜻함 · 친근감 · 배려 · 육아앱 친숙
- **타깃**: 30대 엄마 선호, 맘카페·아이돌봄 계열 앱 톤
- **미리보기**: `tone-pink.html` Tone 1

#### 후보 D — 더스티 로즈 (Dusty Rose) ⭐ 프리미엄 신뢰
```css
--primary:       #B5446E;
--primary-dark:  #963860;
--primary-light: #FAEDF2;
--bg-base:       #FDF5F8;
--border:        #EFC8D6;
```
- **키워드**: 세련됨 · 신뢰 · 프리미엄 · 에듀테크
- **타깃**: 40대 강남구 학부모, 글로벌 에듀테크 앱 톤
- **미리보기**: `tone-pink.html` Tone 2 / `tone-2.html`

#### 후보 E — 버건디 레드 (Burgundy Red) ⭐ 최고 신뢰도
```css
--primary:       #9B2042;
--primary-dark:  #7D1A35;
--primary-light: #F9EEF1;
--bg-base:       #FBF4F6;
--border:        #E8C0CC;
```
- **키워드**: 권위 · 전문성 · 명문 교육 · 성취감
- **타깃**: 메가스터디·이투스·명문대 브랜드 색감, 신뢰 지수 최고
- **미리보기**: `tone-pink.html` Tone 3 / `tone-3.html`

---

### 톤 선택 기준

| 톤 | 색상 | 친근감 | 신뢰도 | 프리미엄 | 추천 대상 |
|----|------|--------|--------|----------|-----------|
| 현재 주황 | #F97316 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | 20~30대, 앱 첫인상 |
| 딥 네이비 | #1B4F8A | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 40대, 교육 기관 신뢰 |
| 에메랄드 | #059669 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | 교육 성장 이미지 |
| 소프트 로즈 | #E05480 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | 30대 엄마, 육아앱 |
| 더스티 로즈 | #B5446E | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 강남구 30~40대 |
| 버건디 레드 | #9B2042 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 프리미엄 교육 서비스 |

### 타이포그래피
- **폰트**: Pretendard (CDN: `https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css`)
- **헤드라인**: `font-weight: 800`, `letter-spacing: -0.5px`
- **본문**: `font-weight: 400`, `line-height: 1.7`

### 버튼
- Primary: `background: #F97316`, `border-radius: 100px`, `padding: 14px 28px`, `font-weight: 700`
- Secondary: `background: #fff`, `border: 1.5px solid #E7E5E4`, `border-radius: 100px`

### 카드
- `background: #fff`, `border: 1.5px solid #F5F0EB`, `border-radius: 16px`, `padding: 24px`

---

## 섹션 구조 (변경 후)

```
① Nav
② Hero          ← 헤드라인 변경 + B 스타일 적용
③ How-to        ← 신규: 4단계 온보딩
④ 핵심 기능     ← 기존 유지, 스타일만 변경
⑤ 베타 후기     ← 신규: 학부모 리뷰 3장
⑥ 인터랙티브 데모 ← 기존 유지
⑦ 요금제        ← 기존 유지
⑧ App Store CTA ← 신규: 사전예약 강조 섹션
⑨ Footer
```

---

## 섹션별 상세 스펙

### ① Nav
- 로고: `키즈루트` (주황 포인트)
- 링크: 기능 · 이용방법 · 요금제 · 데모 체험
- CTA 버튼: `사전예약` (주황, 라운드)
- 모바일(`< 768px`): 링크 숨김, 햄버거(☰) 클릭 시 드롭다운 메뉴

### ② Hero
- **헤드라인**: `3초면 완성되는\n우리 아이 학원 스케줄` (주황 강조: `3초면 완성되는`)
- 부제: `GPS 반경 내 학원을 자동으로 찾아주고, 시간 충돌 없는 최적 조합을 추천해요.`
- 배지: `🗺️ MVP v1.0 · 서울 강남구 출시 예정` (주황 라운드 배지)
- CTA: `🍎 App Store 사전예약` (주황) + `더 알아보기` (아웃라인)
- 오른쪽: 기존 폰 목업 유지
- 배경: `linear-gradient(160deg, #FFFBF7 0%, #FFF3E0 100%)`

### ③ How-to (신규)
- 타이틀: `키즈루트 시작하기`
- 4단계 가로 타임라인 (모바일: 세로 스텝)

| 단계 | 아이콘 | 제목 | 설명 |
|------|--------|------|------|
| 01 | 📱 | 앱 설치 | App Store 또는 Play Store에서 키즈루트를 설치하세요 |
| 02 | 📍 | 위치 설정 | GPS로 현재 위치를 감지하고 탐색 반경을 선택하세요 |
| 03 | 🏷️ | 과목 선택 | 수학, 영어 등 원하는 과목 우선순위를 설정하세요 |
| 04 | 🗓️ | 스케줄 완성 | 충돌 없는 최적 학원 조합이 3초 만에 완성됩니다 |

- 단계 사이 연결선: `border-top: 2px dashed #F5F0EB`

### ④ 핵심 기능
- 기존 6개 카드 유지
- 스타일: 카드 border를 `#F5F0EB`로, 아이콘 배경 `#FFF7ED` (주황 연함)

### ⑤ 베타 후기 (신규)
- 타이틀: `학부모들이 먼저 써봤어요`
- 3열 카드 그리드 (모바일: 1열)
- 각 카드 구성:
  - 아바타: 주황 원형 + 이니셜 (예: `이`, `김`, `박`)
  - 이름 + 지역: `이○○ · 강남구 학부모`
  - 별점: ⭐⭐⭐⭐⭐
  - 본문: 2~3줄 후기

| 카드 | 후기 |
|------|------|
| 1 | `"학원 시간표 맞추느라 매번 엑셀 쓰다가 이 앱 쓰고 해방됐어요. 이동 시간까지 계산해주는 게 신기했어요."` — 이○○ · 강남구 |
| 2 | `"수학 영어 피아노 세 개 겹치지 않게 짜주는 게 진짜 편해요. 아이도 덜 피곤해하는 것 같고요."` — 김○○ · 서초구 |
| 3 | `"베타 쓰면서 학원을 두 개 더 넣을 수 있는 여유 시간이 생겼어요. 강력 추천합니다!"` — 박○○ · 송파구 |

### ⑥ 인터랙티브 데모
- 기존 5화면 앱 흐름 유지
- 배경색만 `#FFFBF7`로, 액센트 색 파랑→주황으로 교체

### ⑦ 요금제
- 기존 유지, 카드 테두리·배경 B 스타일 적용

### ⑧ App Store CTA (신규)
- 배경: `#FFF7ED` 전체 폭
- 헤드라인: `지금 사전예약하고 먼저 써보세요 🎉`
- 부제: `출시 즉시 알림 · 얼리버드 3개월 프리미엄 무료`
- 버튼 2개 나란히: `🍎 App Store 사전예약` + `▶ Play Store 사전예약`
- 하단 캡션: `*사전예약은 무료입니다`

### ⑨ Footer
- 기존 유지, 배경 `#1C1C1C` (현재 검정 유지)

---

## 반응형 (768px 단일 breakpoint)

| 요소 | 데스크톱 | 모바일 |
|------|----------|--------|
| Hero | 2컬럼 (텍스트 + 폰) | 1컬럼, 폰 목업 숨김 |
| How-to | 4열 가로 | 세로 스텝 리스트 |
| 기능 카드 | 3열 | 1열 |
| 후기 카드 | 3열 | 1열 |
| Nav | 전체 링크 표시 | 햄버거 메뉴 |

---

## 스크롤 애니메이션

- **방식**: `Intersection Observer API` (라이브러리 없음)
- **효과**: `opacity: 0 → 1` + `translateY: 20px → 0`
- **duration**: `0.5s ease`
- **delay**: 카드가 여러 개인 섹션은 `0.1s` 순차 딜레이
- **초기 HTML 클래스**: `class="fade-up"` → 화면 진입 시 `class="fade-up visible"` 추가

```css
.fade-up { opacity: 0; transform: translateY(20px); transition: opacity 0.5s ease, transform 0.5s ease; }
.fade-up.visible { opacity: 1; transform: translateY(0); }
```

---

## 파일 변경 범위

- **수정**: `kidsroute-mock/index.html` (단일 파일)
  - `<head>`: Pretendard CDN 추가, CSS 변수 교체
  - `<style>`: 전체 컬러·폰트·버튼·카드 스타일 업데이트
  - `<body>`: ③⑤⑧ 섹션 추가, 기존 섹션 스타일 클래스 교체
  - `<script>`: 기존 JS 유지 + Intersection Observer 추가, 햄버거 메뉴 토글
- **삭제**: `kidsroute-mock/style-compare.html` (임시 비교 파일)
