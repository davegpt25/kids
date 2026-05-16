# KidsRoute 목 사이트 리디자인 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `kidsroute-mock/index.html` 을 B 스타일(따뜻/친근)로 리디자인해 학부모 대상 App Store 사전예약 랜딩페이지로 완성한다.

**Architecture:** 단일 파일(`index.html`) 점진적 개선. CSS 변수 교체 → 섹션별 스타일 수정 → 신규 섹션 추가 → 반응형 + 애니메이션 순서로 진행. 각 태스크는 독립적으로 커밋 가능.

**Tech Stack:** Vanilla HTML/CSS/JS, Pretendard CDN, Intersection Observer API

**Preview:** 작업 전 `python -m http.server 5500 --directory kidsroute-mock` 실행 후 `http://localhost:5500` 에서 확인

---

## 파일 변경 범위

| 파일 | 작업 |
|------|------|
| `kidsroute-mock/index.html` | 수정 (CSS 변수, 섹션 스타일, 신규 섹션 추가) |
| `kidsroute-mock/style-compare.html` | 삭제 |

---

## Task 1: CSS 변수 교체 + Pretendard 적용

**Files:**
- Modify: `kidsroute-mock/index.html:1-30`

**Scene:** 현재 파랑 계열 CSS 변수를 주황 계열로 교체하고 Pretendard 웹폰트를 추가한다. 이 태스크 이후 기존 파랑 버튼이 주황으로 바뀌는 것을 눈으로 확인한다.

- [ ] **Step 1: `<head>`에 Pretendard CDN 추가**

`index.html` 의 `<meta name="viewport">` 다음 줄에 아래를 삽입:

```html
<link rel="preconnect" href="https://cdn.jsdelivr.net">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css">
```

- [ ] **Step 2: `<title>` 변경**

```html
<!-- 변경 전 -->
<title>키즈루트 — 우리 아이 학원, 충돌 없이 딱 맞게</title>

<!-- 변경 후 -->
<title>키즈루트 — 3초면 완성되는 우리 아이 학원 스케줄</title>
```

- [ ] **Step 3: `:root` CSS 변수 교체**

`<style>` 블록 상단의 `:root { ... }` 전체를 아래로 교체:

```css
:root {
  --primary:       #F97316;
  --primary-dark:  #EA6C0A;
  --primary-light: #FFF7ED;
  --bg-base:       #FFFBF7;
  --bg-card:       #FFFFFF;
  --border:        #F5F0EB;
  --text-main:     #1C1C1C;
  --text-sub:      #78716C;
  --text-muted:    #A8A29E;
  /* 하위 호환 — 기존 var(--blue) 참조 섹션을 위해 유지 */
  --blue:          #F97316;
  --blue-dark:     #EA6C0A;
  --blue-light:    #FFF7ED;
  --gray-50:       #FFFBF7;
  --gray-100:      #F5F0EB;
  --gray-300:      #E7E5E4;
  --gray-500:      #78716C;
  --gray-700:      #44403C;
  --gray-900:      #1C1C1C;
  --green:         #10B981;
  --red:           #EF4444;
  --yellow:        #F59E0B;
}
```

- [ ] **Step 4: `body` 폰트 + 배경 변경**

```css
/* 변경 전 */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif;
  background: #fff;
  color: var(--gray-900);
  overflow-x: hidden;
}

/* 변경 후 */
body {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', sans-serif;
  background: var(--bg-base);
  color: var(--text-main);
  overflow-x: hidden;
}
```

- [ ] **Step 5: 브라우저에서 확인**

`http://localhost:5500` 새로고침 → 버튼이 주황색으로 변경되고 폰트가 Pretendard로 적용됨을 확인.

- [ ] **Step 6: 커밋**

```bash
git add kidsroute-mock/index.html
git commit -m "style: apply Pretendard font and warm orange design tokens"
```

---

## Task 2: Nav 리디자인 + 모바일 햄버거 메뉴

**Files:**
- Modify: `kidsroute-mock/index.html` (NAV CSS + HTML, 약 line 32~51, 508~530)

**Scene:** Nav의 CTA 버튼을 `사전예약`으로 변경하고 모바일에서 햄버거 메뉴를 추가한다.

- [ ] **Step 1: Nav CSS에 버튼 스타일 + 모바일 스타일 추가**

기존 `.nav-cta` 규칙을 교체하고 모바일 규칙을 추가:

```css
/* 기존 .nav-cta 교체 */
.nav-cta {
  background: var(--primary); color: #fff; border: none; border-radius: 100px;
  padding: 9px 22px; font-size: 14px; font-weight: 700; cursor: pointer;
  transition: background .2s;
}
.nav-cta:hover { background: var(--primary-dark); }

/* 추가 — 햄버거 버튼 */
.nav-hamburger {
  display: none; background: none; border: none; cursor: pointer;
  font-size: 22px; color: var(--text-main); padding: 4px;
}

/* 추가 — 모바일 드롭다운 */
.nav-mobile-menu {
  display: none; position: fixed; top: 64px; left: 0; right: 0;
  background: rgba(255,255,255,0.98); backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border); padding: 16px 24px;
  flex-direction: column; gap: 16px; z-index: 99;
}
.nav-mobile-menu.open { display: flex; }
.nav-mobile-menu a {
  text-decoration: none; color: var(--text-sub); font-size: 15px; font-weight: 500;
}

@media (max-width: 768px) {
  nav { padding: 0 20px; }
  .nav-links { display: none; }
  .nav-hamburger { display: block; }
}
```

- [ ] **Step 2: Nav HTML 수정 (line 508~530 부근)**

```html
<!-- 변경 전 -->
<nav>
  <div class="nav-logo">키즈루<span>트</span></div>
  <div class="nav-links">
    <a href="#features">기능</a>
    <a href="#how">이용방법</a>
    <a href="#pricing">요금제</a>
    <a href="#demo">데모 체험</a>
    <button class="nav-cta" onclick="document.getElementById('demo').scrollIntoView({behavior:'smooth'})">무료 시작</button>
  </div>
</nav>

<!-- 변경 후 -->
<nav>
  <div class="nav-logo">키즈루<span>트</span></div>
  <div class="nav-links">
    <a href="#features">기능</a>
    <a href="#howto">이용방법</a>
    <a href="#pricing">요금제</a>
    <a href="#demo">데모 체험</a>
    <button class="nav-cta" onclick="document.getElementById('cta').scrollIntoView({behavior:'smooth'})">사전예약</button>
  </div>
  <button class="nav-hamburger" onclick="document.querySelector('.nav-mobile-menu').classList.toggle('open')" aria-label="메뉴 열기">☰</button>
</nav>
<div class="nav-mobile-menu">
  <a href="#features" onclick="this.closest('.nav-mobile-menu').classList.remove('open')">기능</a>
  <a href="#howto" onclick="this.closest('.nav-mobile-menu').classList.remove('open')">이용방법</a>
  <a href="#pricing" onclick="this.closest('.nav-mobile-menu').classList.remove('open')">요금제</a>
  <a href="#demo" onclick="this.closest('.nav-mobile-menu').classList.remove('open')">데모 체험</a>
  <button class="nav-cta" style="width:fit-content" onclick="document.getElementById('cta').scrollIntoView({behavior:'smooth'})">사전예약</button>
</div>
```

- [ ] **Step 3: 브라우저에서 확인**

- 데스크톱: Nav CTA 버튼이 `사전예약`으로 표시, 주황 라운드 버튼
- 모바일(DevTools 375px): 링크 숨고 ☰ 버튼 등장, 클릭 시 드롭다운 열림

- [ ] **Step 4: 커밋**

```bash
git add kidsroute-mock/index.html
git commit -m "style: redesign nav with orange CTA and mobile hamburger menu"
```

---

## Task 3: Hero 섹션 리디자인

**Files:**
- Modify: `kidsroute-mock/index.html` (HERO CSS + HTML, line 53~106, 520~548)

**Scene:** 헤드라인을 `3초면 완성되는 우리 아이 학원 스케줄`로 바꾸고 배경·버튼을 B 스타일로 교체한다.

- [ ] **Step 1: Hero CSS 배경 변경**

```css
/* 변경 전 */
.hero {
  min-height: 100vh; display: flex; align-items: center;
  background: linear-gradient(135deg, #EEF4FF 0%, #F8F9FF 50%, #FFF 100%);
  padding: 100px 40px 60px;
  position: relative; overflow: hidden;
}

/* 변경 후 */
.hero {
  min-height: 100vh; display: flex; align-items: center;
  background: linear-gradient(160deg, #FFFBF7 0%, #FFF3E0 100%);
  padding: 100px 40px 60px;
  position: relative; overflow: hidden;
}
```

- [ ] **Step 2: Hero 배지 CSS 변경**

```css
/* 변경 전 */
.hero-badge {
  display: inline-flex; align-items: center; gap: 6px;
  background: var(--blue-light); color: var(--blue);
  border-radius: 100px; padding: 6px 14px; font-size: 13px; font-weight: 600;
  margin-bottom: 24px;
}

/* 변경 후 */
.hero-badge {
  display: inline-flex; align-items: center; gap: 6px;
  background: var(--primary-light); color: var(--primary);
  border: 1px solid #FED7AA;
  border-radius: 100px; padding: 6px 14px; font-size: 13px; font-weight: 700;
  margin-bottom: 24px;
}
```

- [ ] **Step 3: Hero 버튼 CSS 변경 (라운드형으로)**

```css
/* 변경 전 */
.btn-primary {
  background: var(--blue); color: #fff; border: none;
  padding: 16px 32px; border-radius: 12px; font-size: 16px; font-weight: 700;
  cursor: pointer; transition: all .2s; box-shadow: 0 4px 20px rgba(79,142,247,0.35);
}
.btn-primary:hover { background: var(--blue-dark); transform: translateY(-1px); box-shadow: 0 6px 24px rgba(79,142,247,0.45); }
.btn-secondary {
  background: #fff; color: var(--gray-700); border: 2px solid var(--gray-300);
  padding: 14px 28px; border-radius: 12px; font-size: 16px; font-weight: 600;
  cursor: pointer; transition: all .2s;
}
.btn-secondary:hover { border-color: var(--blue); color: var(--blue); }

/* 변경 후 */
.btn-primary {
  background: var(--primary); color: #fff; border: none;
  padding: 16px 32px; border-radius: 100px; font-size: 16px; font-weight: 700;
  cursor: pointer; transition: all .2s; box-shadow: 0 4px 20px rgba(249,115,22,0.35);
}
.btn-primary:hover { background: var(--primary-dark); transform: translateY(-1px); box-shadow: 0 6px 24px rgba(249,115,22,0.45); }
.btn-secondary {
  background: #fff; color: var(--text-sub); border: 1.5px solid var(--gray-300);
  padding: 14px 28px; border-radius: 100px; font-size: 16px; font-weight: 600;
  cursor: pointer; transition: all .2s;
}
.btn-secondary:hover { border-color: var(--primary); color: var(--primary); }
```

- [ ] **Step 4: Hero HTML 헤드라인 + 부제 변경**

Hero `<section>` 내부에서 아래를 찾아 교체:

```html
<!-- 변경 전 -->
<h1>우리 아이 학원,<br><em>충돌 없이</em><br>딱 맞게</h1>
<p>GPS 반경 내 학원을 자동 수집하고,<br>시간 충돌 없는 최적 조합을 3초 만에 추천합니다.</p>

<!-- 변경 후 -->
<h1><em>3초면 완성되는</em><br>우리 아이<br>학원 스케줄</h1>
<p>GPS 반경 내 학원을 자동으로 찾아주고,<br>시간 충돌 없는 최적 조합을 추천해요.</p>
```

- [ ] **Step 5: Hero CTA 버튼 텍스트 변경**

```html
<!-- 변경 전 -->
<button class="btn-primary" onclick="...">📚 앱 데모 체험하기</button>
<button class="btn-secondary" onclick="...">서비스 소개 보기</button>

<!-- 변경 후 -->
<button class="btn-primary" onclick="document.getElementById('cta').scrollIntoView({behavior:'smooth'})">🍎 App Store 사전예약</button>
<button class="btn-secondary" onclick="document.getElementById('howto').scrollIntoView({behavior:'smooth'})">이용방법 보기</button>
```

- [ ] **Step 6: 브라우저에서 확인**

- 헤드라인: `3초면 완성되는`(주황) + `우리 아이 학원 스케줄`(검정)
- 배경: 크림→연주황 그라데이션
- 버튼: 풀 라운드 주황 버튼

- [ ] **Step 7: 커밋**

```bash
git add kidsroute-mock/index.html
git commit -m "style: redesign hero with new headline and warm orange B-style"
```

---

## Task 4: How-to 섹션 추가

**Files:**
- Modify: `kidsroute-mock/index.html` (신규 섹션 HTML + CSS 추가)

**Scene:** Hero 다음에 `id="howto"` 4단계 온보딩 섹션을 삽입한다.

- [ ] **Step 1: How-to CSS 추가**

`</style>` 바로 위에 아래 CSS를 추가:

```css
/* ─── HOW-TO ─── */
.howto {
  padding: 100px 40px;
  background: #fff;
}
.howto-inner { max-width: 1100px; margin: 0 auto; }
.howto h2 { font-size: 36px; font-weight: 800; color: var(--text-main); letter-spacing: -1px; margin-bottom: 8px; }
.howto-sub { font-size: 16px; color: var(--text-sub); margin-bottom: 60px; }
.howto-steps {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 0; position: relative;
}
.howto-steps::before {
  content: '';
  position: absolute; top: 28px; left: 10%; right: 10%;
  border-top: 2px dashed var(--border);
  z-index: 0;
}
.howto-step {
  display: flex; flex-direction: column; align-items: center;
  text-align: center; padding: 0 16px; position: relative; z-index: 1;
}
.howto-num {
  width: 56px; height: 56px; background: var(--primary-light);
  border: 2px solid #FED7AA; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; margin-bottom: 20px;
  background: #fff;
}
.howto-step-num {
  position: absolute; top: -8px; right: calc(50% - 40px);
  background: var(--primary); color: #fff;
  border-radius: 100px; font-size: 10px; font-weight: 800;
  padding: 2px 7px; letter-spacing: 0.5px;
}
.howto-step h3 { font-size: 16px; font-weight: 700; color: var(--text-main); margin-bottom: 8px; }
.howto-step p { font-size: 13px; color: var(--text-sub); line-height: 1.6; }

@media (max-width: 768px) {
  .howto { padding: 72px 20px; }
  .howto-steps { grid-template-columns: 1fr; gap: 32px; }
  .howto-steps::before { display: none; }
  .howto-step { flex-direction: row; text-align: left; align-items: flex-start; gap: 20px; }
  .howto-num { flex-shrink: 0; }
  .howto-step-num { top: -8px; right: auto; left: 36px; }
}
```

- [ ] **Step 2: How-to HTML 삽입**

`<!-- HERO -->` 섹션의 닫는 `</section>` 바로 다음에 삽입:

```html
<!-- HOW-TO -->
<section class="howto fade-up" id="howto">
  <div class="howto-inner">
    <h2>키즈루트 시작하기</h2>
    <p class="howto-sub">단 4단계로 우리 아이 학원 스케줄이 완성됩니다</p>
    <div class="howto-steps">
      <div class="howto-step fade-up">
        <div class="howto-num" style="position:relative">
          <span class="howto-step-num">01</span>
          📱
        </div>
        <div>
          <h3>앱 설치</h3>
          <p>App Store 또는 Play Store에서 키즈루트를 설치하세요</p>
        </div>
      </div>
      <div class="howto-step fade-up" style="transition-delay:0.1s">
        <div class="howto-num" style="position:relative">
          <span class="howto-step-num">02</span>
          📍
        </div>
        <div>
          <h3>위치 설정</h3>
          <p>GPS로 현재 위치를 감지하고 탐색 반경을 선택하세요</p>
        </div>
      </div>
      <div class="howto-step fade-up" style="transition-delay:0.2s">
        <div class="howto-num" style="position:relative">
          <span class="howto-step-num">03</span>
          🏷️
        </div>
        <div>
          <h3>과목 선택</h3>
          <p>수학, 영어 등 원하는 과목 우선순위를 설정하세요</p>
        </div>
      </div>
      <div class="howto-step fade-up" style="transition-delay:0.3s">
        <div class="howto-num" style="position:relative">
          <span class="howto-step-num">04</span>
          🗓️
        </div>
        <div>
          <h3>스케줄 완성</h3>
          <p>충돌 없는 최적 학원 조합이 3초 만에 완성됩니다</p>
        </div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 3: 브라우저에서 확인**

`http://localhost:5500` 스크롤 → Hero 아래에 4단계 타임라인 섹션 등장 확인.

- [ ] **Step 4: 커밋**

```bash
git add kidsroute-mock/index.html
git commit -m "feat: add how-to 4-step onboarding section"
```

---

## Task 5: 핵심 기능 섹션 스타일 업데이트

**Files:**
- Modify: `kidsroute-mock/index.html` (FEATURES CSS, line 794 부근)

**Scene:** 기존 기능 카드 6개의 색상을 B 스타일(주황 포인트)로 교체한다.

- [ ] **Step 1: Features 섹션 배경 + 카드 CSS 업데이트**

기존 `.features`, `.feature-card`, `.feature-icon` CSS를 아래로 교체:

```css
/* ─── FEATURES ─── */
.features {
  padding: 100px 40px;
  background: var(--bg-base);
}
.features-inner { max-width: 1100px; margin: 0 auto; }
.features-label {
  display: inline-block;
  background: var(--primary-light); color: var(--primary);
  border-radius: 100px; padding: 5px 14px;
  font-size: 12px; font-weight: 700; margin-bottom: 16px;
}
.features h2 { font-size: 36px; font-weight: 800; color: var(--text-main); letter-spacing: -1px; margin-bottom: 8px; }
.features-sub { font-size: 16px; color: var(--text-sub); margin-bottom: 56px; }
.features-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
}
.feature-card {
  background: var(--bg-card);
  border: 1.5px solid var(--border);
  border-radius: 16px; padding: 28px;
  transition: border-color .2s, box-shadow .2s;
}
.feature-card:hover { border-color: #FED7AA; box-shadow: 0 4px 20px rgba(249,115,22,0.08); }
.feature-icon {
  font-size: 28px; margin-bottom: 16px;
  background: var(--primary-light);
  width: 52px; height: 52px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
}
.feature-card h3 { font-size: 16px; font-weight: 700; color: var(--text-main); margin-bottom: 8px; }
.feature-card p { font-size: 13px; color: var(--text-sub); line-height: 1.65; }

@media (max-width: 768px) {
  .features { padding: 72px 20px; }
  .features-grid { grid-template-columns: 1fr; gap: 14px; }
}
```

- [ ] **Step 2: 브라우저에서 확인**

기능 카드 배경이 흰색, 테두리가 크림색, 아이콘 배경이 연주황으로 변경됨 확인.

- [ ] **Step 3: 커밋**

```bash
git add kidsroute-mock/index.html
git commit -m "style: update features section to B-style warm orange theme"
```

---

## Task 6: 베타 후기 섹션 추가

**Files:**
- Modify: `kidsroute-mock/index.html` (신규 섹션 HTML + CSS)

**Scene:** Features 섹션 다음에 학부모 후기 3장 카드 그리드를 삽입한다.

- [ ] **Step 1: 후기 섹션 CSS 추가**

`</style>` 바로 위에 추가:

```css
/* ─── REVIEWS ─── */
.reviews {
  padding: 100px 40px;
  background: #fff;
}
.reviews-inner { max-width: 1100px; margin: 0 auto; }
.reviews-label {
  display: inline-block;
  background: var(--primary-light); color: var(--primary);
  border-radius: 100px; padding: 5px 14px;
  font-size: 12px; font-weight: 700; margin-bottom: 16px;
}
.reviews h2 { font-size: 36px; font-weight: 800; color: var(--text-main); letter-spacing: -1px; margin-bottom: 8px; }
.reviews-sub { font-size: 16px; color: var(--text-sub); margin-bottom: 56px; }
.reviews-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
}
.review-card {
  background: var(--bg-base);
  border: 1.5px solid var(--border);
  border-radius: 16px; padding: 28px;
}
.review-header { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
.review-avatar {
  width: 44px; height: 44px; border-radius: 50%;
  background: var(--primary); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 800; flex-shrink: 0;
}
.review-info { display: flex; flex-direction: column; gap: 2px; }
.review-name { font-size: 14px; font-weight: 700; color: var(--text-main); }
.review-region { font-size: 12px; color: var(--text-muted); }
.review-stars { color: #F59E0B; font-size: 14px; margin-bottom: 12px; }
.review-text { font-size: 14px; color: var(--text-sub); line-height: 1.7; }

@media (max-width: 768px) {
  .reviews { padding: 72px 20px; }
  .reviews-grid { grid-template-columns: 1fr; gap: 14px; }
}
```

- [ ] **Step 2: 후기 HTML 삽입**

`<!-- HOW IT WORKS -->` 섹션 바로 앞에 삽입:

```html
<!-- REVIEWS -->
<section class="reviews" id="reviews">
  <div class="reviews-inner">
    <div class="reviews-label">베타 후기</div>
    <h2>학부모들이 먼저 써봤어요</h2>
    <p class="reviews-sub">강남구 베타 테스트에 참여한 학부모 100명의 실제 후기입니다</p>
    <div class="reviews-grid">
      <div class="review-card fade-up">
        <div class="review-header">
          <div class="review-avatar">이</div>
          <div class="review-info">
            <span class="review-name">이○○ 학부모</span>
            <span class="review-region">강남구</span>
          </div>
        </div>
        <div class="review-stars">★★★★★</div>
        <p class="review-text">"학원 시간표 맞추느라 매번 엑셀 쓰다가 이 앱 쓰고 해방됐어요. 이동 시간까지 계산해주는 게 진짜 신기했어요."</p>
      </div>
      <div class="review-card fade-up" style="transition-delay:0.1s">
        <div class="review-header">
          <div class="review-avatar">김</div>
          <div class="review-info">
            <span class="review-name">김○○ 학부모</span>
            <span class="review-region">서초구</span>
          </div>
        </div>
        <div class="review-stars">★★★★★</div>
        <p class="review-text">"수학 영어 피아노 세 개 겹치지 않게 짜주는 게 진짜 편해요. 아이도 덜 피곤해하는 것 같고요."</p>
      </div>
      <div class="review-card fade-up" style="transition-delay:0.2s">
        <div class="review-header">
          <div class="review-avatar">박</div>
          <div class="review-info">
            <span class="review-name">박○○ 학부모</span>
            <span class="review-region">송파구</span>
          </div>
        </div>
        <div class="review-stars">★★★★★</div>
        <p class="review-text">"베타 쓰면서 학원을 두 개 더 넣을 수 있는 여유 시간이 생겼어요. 강력 추천합니다!"</p>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 3: 브라우저에서 확인**

Features 섹션 아래에 후기 카드 3장이 나란히 표시됨 확인.

- [ ] **Step 4: 커밋**

```bash
git add kidsroute-mock/index.html
git commit -m "feat: add parent reviews section with 3 testimonial cards"
```

---

## Task 7: App Store CTA 섹션 추가

**Files:**
- Modify: `kidsroute-mock/index.html` (신규 섹션 HTML + CSS)

**Scene:** Footer 바로 위에 `id="cta"` 사전예약 강조 섹션을 추가한다.

- [ ] **Step 1: CTA 섹션 CSS 추가**

`</style>` 바로 위에 추가:

```css
/* ─── APP STORE CTA ─── */
.app-cta {
  padding: 100px 40px;
  background: var(--primary-light);
  text-align: center;
}
.app-cta-inner { max-width: 640px; margin: 0 auto; }
.app-cta h2 { font-size: 36px; font-weight: 800; color: var(--text-main); letter-spacing: -1px; margin-bottom: 12px; }
.app-cta p { font-size: 16px; color: var(--text-sub); line-height: 1.7; margin-bottom: 40px; }
.app-cta-buttons { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 16px; }
.store-btn {
  display: inline-flex; align-items: center; gap: 10px;
  background: var(--text-main); color: #fff;
  border: none; border-radius: 100px;
  padding: 14px 28px; font-size: 15px; font-weight: 700;
  cursor: pointer; transition: background .2s;
  text-decoration: none;
}
.store-btn:hover { background: var(--text-sub); }
.store-btn.outline {
  background: #fff; color: var(--text-main);
  border: 2px solid var(--border);
}
.store-btn.outline:hover { border-color: var(--primary); color: var(--primary); }
.app-cta-caption { font-size: 12px; color: var(--text-muted); }

@media (max-width: 768px) {
  .app-cta { padding: 72px 20px; }
  .app-cta h2 { font-size: 28px; }
  .store-btn { width: 100%; justify-content: center; }
}
```

- [ ] **Step 2: CTA HTML 삽입**

`<!-- FOOTER -->` 주석 바로 앞에 삽입:

```html
<!-- APP STORE CTA -->
<section class="app-cta fade-up" id="cta">
  <div class="app-cta-inner">
    <h2>지금 사전예약하고<br>먼저 써보세요 🎉</h2>
    <p>출시 즉시 알림을 받고,<br>얼리버드 혜택으로 3개월 프리미엄을 무료로 이용하세요.</p>
    <div class="app-cta-buttons">
      <a href="#" class="store-btn">🍎 App Store 사전예약</a>
      <a href="#" class="store-btn outline">▶ Play Store 사전예약</a>
    </div>
    <p class="app-cta-caption">*사전예약은 무료입니다. 출시 전 언제든 취소 가능합니다.</p>
  </div>
</section>
```

- [ ] **Step 3: 브라우저에서 확인**

Footer 위에 크림 배경의 CTA 섹션 표시, 두 스토어 버튼 나란히 확인.

- [ ] **Step 4: 커밋**

```bash
git add kidsroute-mock/index.html
git commit -m "feat: add App Store pre-order CTA section before footer"
```

---

## Task 8: 스크롤 애니메이션 (Intersection Observer)

**Files:**
- Modify: `kidsroute-mock/index.html` (CSS + JS)

**Scene:** 모든 `.fade-up` 요소가 뷰포트에 진입할 때 나타나는 애니메이션을 Intersection Observer로 구현한다.

- [ ] **Step 1: fade-up CSS 추가**

`</style>` 바로 위에 추가:

```css
/* ─── SCROLL ANIMATION ─── */
.fade-up {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.55s ease, transform 0.55s ease;
}
.fade-up.visible {
  opacity: 1;
  transform: translateY(0);
}
```

- [ ] **Step 2: 기존 섹션 HTML에 `fade-up` 클래스 추가**

아래 각 섹션의 `<section>` 태그에 `fade-up` 클래스를 추가:

```html
<!-- HERO → 이미 있음, 확인만 -->
<!-- HOWTO → Task 4에서 이미 추가함 -->
<section class="features fade-up" id="features">
<section class="reviews fade-up" id="reviews">
<!-- HOW IT WORKS -->
<section class="how-works fade-up" id="how">
<!-- DEMO -->
<section class="demo-section fade-up" id="demo">
<!-- PRICING -->
<section class="pricing fade-up" id="pricing">
<!-- KPI -->
<section class="kpi-section fade-up">
<!-- APP CTA → Task 7에서 이미 추가함 -->
```

- [ ] **Step 3: Intersection Observer JS 추가**

`</script>` 닫는 태그 바로 위에 추가:

```javascript
// Scroll animation
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
```

- [ ] **Step 4: 브라우저에서 확인**

페이지를 맨 위에서 스크롤하면서 각 섹션이 부드럽게 나타나는지 확인. 첫 화면(Hero)은 이미 보이므로 즉시 visible 되어야 함.

- [ ] **Step 5: 커밋**

```bash
git add kidsroute-mock/index.html
git commit -m "feat: add scroll fade-up animation with Intersection Observer"
```

---

## Task 9: 반응형 최종 정리 + Hero 모바일 처리

**Files:**
- Modify: `kidsroute-mock/index.html` (CSS media queries)

**Scene:** 768px 이하에서 Hero 폰 목업을 숨기고 전체 레이아웃이 1열로 깔끔하게 표시되도록 한다.

- [ ] **Step 1: Hero 반응형 CSS 추가**

`</style>` 바로 위에 추가:

```css
@media (max-width: 768px) {
  .hero {
    flex-direction: column;
    padding: 100px 20px 60px;
    text-align: center;
    align-items: center;
  }
  .hero-content { max-width: 100%; }
  .hero h1 { font-size: 36px; }
  .hero p { font-size: 16px; }
  .hero-btns { justify-content: center; }
  .hero-stats { justify-content: center; }
  .hero-phone { display: none; }

  /* 섹션 패딩 통일 */
  section { padding-left: 20px !important; padding-right: 20px !important; }

  /* Demo section */
  .demo-layout { flex-direction: column; align-items: center; }
  .demo-steps { width: 100%; }
  .demo-phone-wrap { width: 100%; display: flex; justify-content: center; }

  /* Pricing */
  .pricing-grid { grid-template-columns: 1fr !important; }

  /* KPI */
  .kpi-grid { grid-template-columns: 1fr 1fr !important; }

  /* Footer */
  footer .footer-inner { flex-direction: column; gap: 16px; }
}
```

- [ ] **Step 2: DevTools로 모바일 확인**

Chrome DevTools → Toggle device toolbar → iPhone 12 Pro (390px) 선택 후:
- Hero: 폰 목업 사라지고 텍스트 중앙 정렬 확인
- How-to: 세로 스텝 리스트 확인
- Features, Reviews: 1열 카드 확인
- Nav: 햄버거 메뉴 확인

- [ ] **Step 3: 커밋**

```bash
git add kidsroute-mock/index.html
git commit -m "style: finalize responsive layout for mobile 768px breakpoint"
```

---

## Task 10: 인터랙티브 데모 컬러 주황으로 교체

**Files:**
- Modify: `kidsroute-mock/index.html` (DEMO 섹션 CSS + JS 내 색상값)

**Scene:** 데모 섹션의 파랑(#4F8EF7) 강조색을 주황(#F97316)으로 교체한다.

- [ ] **Step 1: CSS 변수로 대부분 자동 적용 확인**

Task 1에서 `--blue: #F97316` 으로 이미 교체됐으므로 `var(--blue)` 참조는 자동 반영됨.
직접 색상값(`#4F8EF7`)이 남아있는지 확인:

```bash
grep -n "#4F8EF7\|#2563EB\|4F8EF7" kidsroute-mock/index.html
```

- [ ] **Step 2: 남은 하드코딩 색상 교체**

검색 결과에서 발견된 하드코딩 색상을 모두 주황으로 교체:
- `#4F8EF7` → `#F97316`
- `rgba(79,142,247` → `rgba(249,115,22`
- `#2563EB` → `#EA6C0A`

- [ ] **Step 3: 데모 섹션 배경 확인**

```css
/* 기존 dark 배경 유지 (데모 섹션은 어두운 배경이 어울림) */
/* .demo-section background는 그대로 유지 */
```

- [ ] **Step 4: 브라우저에서 확인**

인터랙티브 데모의 선택된 스텝 강조, 앱 내 버튼 등이 주황으로 표시됨 확인.

- [ ] **Step 5: 커밋**

```bash
git add kidsroute-mock/index.html
git commit -m "style: replace remaining blue hardcoded colors with orange in demo section"
```

---

## Task 11: 임시 파일 삭제 + 최종 검토

**Files:**
- Delete: `kidsroute-mock/style-compare.html`

- [ ] **Step 1: style-compare.html 삭제**

```bash
rm kidsroute-mock/style-compare.html
```

- [ ] **Step 2: 전체 페이지 최종 확인 체크리스트**

브라우저에서 `http://localhost:5500` 열고 아래를 순서대로 확인:

| 항목 | 확인 방법 | 기대 결과 |
|------|-----------|-----------|
| Pretendard 폰트 | DevTools → Network → Font 탭 | pretendard.css 로드됨 |
| 헤드라인 | Hero 섹션 | `3초면 완성되는` 주황색 |
| Nav CTA | 우측 상단 | `사전예약` 주황 라운드 버튼 |
| How-to | 스크롤 | 4단계 타임라인 표시 |
| 후기 카드 | 스크롤 | 3장 카드, 주황 아바타 |
| App Store CTA | 최하단 | 두 스토어 버튼 나란히 |
| 스크롤 애니메이션 | 새로고침 후 천천히 스크롤 | 섹션별 fade-up |
| 모바일 | DevTools 390px | 1열, 햄버거 메뉴 |

- [ ] **Step 3: 최종 커밋**

```bash
git rm kidsroute-mock/style-compare.html
git add kidsroute-mock/index.html
git commit -m "chore: remove temp style-compare.html, finalize mock site redesign"
```

- [ ] **Step 4: GitHub push**

```bash
git push origin main
```

---

## 완료 조건

- [ ] 모든 Task 1~11 완료
- [ ] 브라우저 데스크톱 + 모바일(390px) 양쪽 정상 표시
- [ ] 파란색 계열 요소가 남아있지 않음 (grep으로 확인)
- [ ] `style-compare.html` 삭제됨
- [ ] GitHub `davegpt25/kids` 에 push 완료
