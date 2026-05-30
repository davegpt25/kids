# Simulation Step & Pricing CTA Activation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** (1) Insert an interactive schedule simulation preview step between the loading screen and the email form in the demo modal; (2) Wire up the pricing section's "무료로 시작하기" and "출시 알림 받기" buttons.

**Architecture:** All changes are in one file (`kidsroute-mock/index.html`). New modal step `demoStepSim` is injected between existing `demoStep3` (loading) and `demoStep4` (email form). The simulation reads query/location context set by earlier steps. Pricing buttons get `onclick` handlers pointing to `openDemoModal()` and a new `openLeadFormDirect()` helper.

**Tech Stack:** Vanilla JS, CSS (in-file `<style>`), no libraries.

---

## Context — existing modal step IDs and JS

| ID | Purpose |
|----|---------|
| `demoStep1` | Typewriter query selector |
| `demoStep2` | Map / radius / services |
| `demoStep3` | Loading animation |
| **`demoStepSim`** | **NEW — simulation results preview** |
| `demoStep4` | Lead-capture email form |
| `demoStep5` | Success screen |

Key existing JS:
- `_showDemoStep(id)` — hides all steps listed in its internal array, shows `id`
- `startDemoAnalysis()` — runs loading animation, then calls `_showDemoStep('demoStep4')` on completion (line ~3924)
- Global vars available in the simulation step: `_demoRadius` (number), `_demoShuttle` (bool), `_demoPickup` (bool), selected pill text stored in `document.getElementById('demoTypewriter').textContent`

File: `C:\Users\hwlll\Startup\kids\kidsroute-mock\index.html`

---

### Task 1: Add `demoStepSim` to `_showDemoStep` step list and wire loading→sim transition

**Files:**
- Modify: `kidsroute-mock/index.html` — JS `_showDemoStep` function and `startDemoAnalysis` timeout

- [x] **Step 1: Read the file to confirm exact text**

  Read lines 3651–3658 to confirm this exact code:
  ```js
  function _showDemoStep(stepId) {
    ['demoStep1','demoStep2','demoStep3','demoStep4','demoStep5'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('active');
    });
    const target = document.getElementById(stepId);
    if (target) target.classList.add('active');
  }
  ```

- [x] **Step 2: Add `demoStepSim` to the step list in `_showDemoStep`**

  Replace:
  ```js
  function _showDemoStep(stepId) {
    ['demoStep1','demoStep2','demoStep3','demoStep4','demoStep5'].forEach(id => {
  ```
  With:
  ```js
  function _showDemoStep(stepId) {
    ['demoStep1','demoStep2','demoStep3','demoStepSim','demoStep4','demoStep5'].forEach(id => {
  ```

- [x] **Step 3: Change loading completion target from `demoStep4` → `demoStepSim`**

  Find this line in `startDemoAnalysis` (around line 3924):
  ```js
      setTimeout(() => _showDemoStep('demoStep4'), 400);
  ```
  Replace with:
  ```js
      setTimeout(() => { _showDemoStep('demoStepSim'); _renderSimCards(); }, 400);
  ```

- [x] **Step 4: Verify with Grep — `demoStepSim` now appears in the JS step list**

  Run grep for `demoStepSim` — should return at least 2 matches (step list + renderSimCards call).

---

### Task 2: Add simulation step HTML

**Files:**
- Modify: `kidsroute-mock/index.html` — HTML modal section

Insert the following HTML block **immediately before** `<!-- Step 4: 리드 폼 -->` (which opens with `<div class="demo-step" id="demoStep4">`).

- [x] **Step 1: Read file around demoStep4 HTML to confirm insertion point**

  Confirm the text just before `demoStep4` is:
  ```html
    </div>

    <!-- Step 4: 리드 폼 -->
    <div class="demo-step" id="demoStep4">
  ```

- [x] **Step 2: Insert the simulation step HTML**

  Insert this block immediately before `<!-- Step 4: 리드 폼 -->`:
  ```html
    <!-- Step Sim: 시뮬레이션 결과 미리보기 -->
    <div class="demo-step" id="demoStepSim">
      <div class="demo-form-badge sim-badge">✨ 분석 완료</div>
      <div class="demo-title" style="font-size:20px">이런 조합을 추천드려요!</div>
      <div class="demo-sub" id="simSubText">반경 1km · 학원 3개 조합</div>

      <!-- 추천 카드 목록 -->
      <div class="sim-cards" id="simCards">
        <!-- JS로 렌더링 -->
      </div>

      <!-- 미니 주간 스케줄 그리드 -->
      <div class="sim-schedule">
        <div class="sim-schedule-title">📅 이번 주 스케줄 미리보기</div>
        <div class="sim-grid" id="simGrid">
          <div class="sim-grid-head">
            <div></div>
            <div>월</div><div>화</div><div>수</div><div>목</div><div>금</div>
          </div>
          <div class="sim-grid-row" id="simRow0">
            <div class="sim-time-label">오후 4시</div>
            <div></div><div></div><div></div><div></div><div></div>
          </div>
          <div class="sim-grid-row" id="simRow1">
            <div class="sim-time-label">오후 5시</div>
            <div></div><div></div><div></div><div></div><div></div>
          </div>
          <div class="sim-grid-row" id="simRow2">
            <div class="sim-time-label">오후 6시</div>
            <div></div><div></div><div></div><div></div><div></div>
          </div>
          <div class="sim-grid-row" id="simRow3">
            <div class="sim-time-label">오후 7시</div>
            <div></div><div></div><div></div><div></div><div></div>
          </div>
        </div>
      </div>

      <div class="sim-blur-hint">🔒 전체 결과 및 맞춤 학원 정보를 이메일로 받아보세요</div>
      <button class="demo-start-btn" onclick="_showDemoStep('demoStep4')" style="margin-top:12px">
        📧 맞춤 결과 이메일로 받기
      </button>
      <button class="sim-skip-btn" onclick="_showDemoStep('demoStep4')">나중에 받을게요</button>
    </div>
  ```

- [x] **Step 3: Verify — grep for `demoStepSim` in HTML section returns the new div**

---

### Task 3: Add simulation step CSS

**Files:**
- Modify: `kidsroute-mock/index.html` — `<style>` block

Add before `</style>`:

- [x] **Step 1: Add simulation CSS**

  ```css
  /* ─── SIMULATION STEP ─── */
  .sim-badge { background: linear-gradient(135deg,#FF9A3C,#F97316); color:#fff; }
  .sim-cards { display: flex; flex-direction: column; gap: 10px; margin: 14px 0 16px; }
  .sim-card {
    display: flex; align-items: center; gap: 12px;
    background: var(--gray-50); border: 1px solid var(--gray-200);
    border-radius: 14px; padding: 12px 14px;
  }
  .sim-card-icon { font-size: 26px; flex-shrink: 0; }
  .sim-card-body { flex: 1; min-width: 0; }
  .sim-card-name { font-size: 13px; font-weight: 700; color: var(--gray-900); margin-bottom: 2px; }
  .sim-card-meta { font-size: 12px; color: var(--gray-500); display: flex; gap: 8px; flex-wrap: wrap; }
  .sim-card-tag {
    font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 100px;
    background: var(--blue-light); color: var(--blue);
  }
  .sim-card-tag.orange { background: #FFF7ED; color: var(--orange); }
  .sim-card-rank {
    width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
    background: var(--orange); color: #fff; font-size: 12px; font-weight: 800;
    display: flex; align-items: center; justify-content: center;
  }
  .sim-schedule { margin: 4px 0 14px; }
  .sim-schedule-title { font-size: 13px; font-weight: 700; color: var(--gray-700); margin-bottom: 8px; }
  .sim-grid { border: 1px solid var(--gray-200); border-radius: 10px; overflow: hidden; font-size: 11px; }
  .sim-grid-head {
    display: grid; grid-template-columns: 48px repeat(5, 1fr);
    background: var(--gray-50); border-bottom: 1px solid var(--gray-200);
  }
  .sim-grid-head > div { padding: 5px 0; text-align: center; font-weight: 700; color: var(--gray-500); }
  .sim-grid-row {
    display: grid; grid-template-columns: 48px repeat(5, 1fr);
    border-bottom: 1px solid var(--gray-100);
  }
  .sim-grid-row:last-child { border-bottom: none; }
  .sim-grid-row > div { min-height: 28px; }
  .sim-time-label { padding: 6px 4px; color: var(--gray-500); text-align: right; font-size: 10px; line-height: 1.4; }
  .sim-slot {
    margin: 2px; border-radius: 4px; font-size: 10px; font-weight: 700;
    color: #fff; display: flex; align-items: center; justify-content: center;
    padding: 2px 0;
  }
  .sim-slot.c0 { background: #3B82F6; }
  .sim-slot.c1 { background: #F97316; }
  .sim-slot.c2 { background: #10B981; }
  .sim-blur-hint {
    font-size: 12px; color: var(--gray-500); text-align: center;
    padding: 10px 16px; background: var(--gray-50); border-radius: 10px;
    margin-bottom: 4px;
  }
  .sim-skip-btn {
    display: block; margin: 10px auto 0; background: none; border: none;
    font-size: 12px; color: var(--gray-400); cursor: pointer; text-decoration: underline;
  }
  .sim-skip-btn:hover { color: var(--gray-600); }
  ```

- [x] **Step 2: Verify — grep for `sim-card` appears in CSS and HTML**

---

### Task 4: Add `_renderSimCards()` JavaScript function

This function reads context from previous steps and populates the simulation step with relevant mock data.

**Files:**
- Modify: `kidsroute-mock/index.html` — `<script>` block

Add before `</script>`:

- [x] **Step 1: Add the render function**

  ```js
  // ─── Simulation Step ───
  var _SIM_POOLS = {
    math:    { icon:'📐', label:'수학', academies:['강남 베스트 수학','TOP 수학학원','수학의 왕도'] },
    english: { icon:'🔤', label:'영어', academies:['YBM 영어','민사고 영어','케임브릿지 어학원'] },
    piano:   { icon:'🎹', label:'피아노', academies:['예원 피아노','한빛 음악학원','클래식 피아노'] },
    art:     { icon:'🎨', label:'미술', academies:['서울 아트스쿨','창의 미술학원','그림나라'] },
    taekwondo:{ icon:'🥋', label:'태권도', academies:['강남 태권도','금강 태권도','청룡 체육관'] },
    default: { icon:'📚', label:'학원', academies:['우리 학원','베스트 학원','탑 교육'] }
  };

  // Schedule slots: [rowIdx (0-3 = 4pm-7pm), [dayIdxs (0=Mon..4=Fri)]]
  var _SIM_SCHEDULES = [
    { days:[0,2,4], row:1 },   // Mon/Wed/Fri 5pm
    { days:[1,3],   row:2 },   // Tue/Thu 6pm
    { days:[0,2],   row:0 },   // Mon/Wed 4pm
  ];

  function _renderSimCards() {
    var query = (document.getElementById('demoTypewriter') || {}).textContent || '';
    var radius = typeof _demoRadius !== 'undefined' ? _demoRadius : 1000;
    var shuttle = typeof _demoShuttle !== 'undefined' ? _demoShuttle : false;
    var radiusLabel = radius >= 1000 ? (radius/1000)+'km' : radius+'m';

    // Detect subjects from query
    var subjects = [];
    if (/수학/.test(query))    subjects.push('math');
    if (/영어/.test(query))    subjects.push('english');
    if (/피아노/.test(query))  subjects.push('piano');
    if (/미술/.test(query))    subjects.push('art');
    if (/태권도/.test(query))  subjects.push('taekwondo');
    if (subjects.length === 0) subjects = ['math','english','piano'];
    subjects = subjects.slice(0,3);

    // Update sub text
    var subEl = document.getElementById('simSubText');
    if (subEl) subEl.textContent = '반경 ' + radiusLabel + ' · 학원 ' + subjects.length + '개 조합';

    // Render cards
    var cardsEl = document.getElementById('simCards');
    if (!cardsEl) return;
    cardsEl.innerHTML = '';
    var distances = [320, 550, 810];
    var ratings   = ['4.9', '4.7', '4.6'];
    var times     = ['월·수·금 오후 5:00-6:30', '화·목 오후 6:00-7:30', '월·수 오후 4:00-5:30'];

    subjects.forEach(function(subj, i) {
      var pool = _SIM_POOLS[subj] || _SIM_POOLS.default;
      var acName = pool.academies[Math.floor(Math.random() * pool.academies.length)];
      var dist   = distances[i] || 400 + i*150;
      var walkMin = Math.round(dist / 67);
      var rating  = ratings[i] || '4.5';
      var time    = times[i] || '월·수·금 오후 5:00-6:30';
      var tag1    = i === 0 ? '<span class="sim-card-tag">1위 추천</span>' : '';
      var tag2    = shuttle && i === 0 ? '<span class="sim-card-tag orange">셔틀 있음</span>' : '';
      var noOverlap = '<span class="sim-card-tag">시간 겹침 없음</span>';

      var card = document.createElement('div');
      card.className = 'sim-card';
      card.innerHTML =
        '<div class="sim-card-rank">' + (i+1) + '</div>' +
        '<div class="sim-card-icon">' + pool.icon + '</div>' +
        '<div class="sim-card-body">' +
          '<div class="sim-card-name">' + acName + '</div>' +
          '<div class="sim-card-meta">⭐ ' + rating + ' &nbsp;· &nbsp;🚶 ' + walkMin + '분 (' + dist + 'm)&nbsp;·&nbsp; 🕐 ' + time + '</div>' +
          '<div style="margin-top:4px;display:flex;gap:4px;flex-wrap:wrap">' + tag1 + tag2 + noOverlap + '</div>' +
        '</div>';
      cardsEl.appendChild(card);
    });

    // Render schedule grid
    var rows = [
      document.getElementById('simRow0'),
      document.getElementById('simRow1'),
      document.getElementById('simRow2'),
      document.getElementById('simRow3')
    ];
    // Clear grid cells (keep time label at index 0)
    rows.forEach(function(row) {
      if (!row) return;
      var cells = row.querySelectorAll('div:not(.sim-time-label)');
      cells.forEach(function(c) { c.innerHTML = ''; c.className = ''; });
    });
    // Fill slots
    subjects.forEach(function(subj, i) {
      var pool   = _SIM_POOLS[subj] || _SIM_POOLS.default;
      var sched  = _SIM_SCHEDULES[i] || { days:[0,2,4], row:1 };
      var row    = rows[sched.row];
      if (!row) return;
      var cells  = row.querySelectorAll('div');
      sched.days.forEach(function(dayIdx) {
        var cell = cells[dayIdx + 1]; // +1 to skip time label
        if (cell) {
          cell.innerHTML = '<div class="sim-slot c' + i + '">' + pool.icon + '</div>';
        }
      });
    });
  }
  ```

- [x] **Step 2: Verify — grep for `_renderSimCards` appears 3 times (definition + 2 calls)**

  Actually verify it appears at least 2 times (definition in JS + call in startDemoAnalysis).

---

### Task 5: Activate pricing buttons

**Files:**
- Modify: `kidsroute-mock/index.html` — HTML pricing section + JS script block

The two pricing buttons (currently no `onclick`) are at these exact lines:
```html
      <button class="pricing-cta free-cta">무료로 시작하기</button>
```
```html
      <button class="pricing-cta paid-cta">출시 알림 받기</button>
```

- [x] **Step 1: Add onclick to "무료로 시작하기"**

  Replace:
  ```html
        <button class="pricing-cta free-cta">무료로 시작하기</button>
  ```
  With:
  ```html
        <button class="pricing-cta free-cta" onclick="openDemoModal()">무료로 시작하기</button>
  ```
  
  Behavior: opens the full demo modal at Step 1 (query selection).

- [x] **Step 2: Add helper function `openLeadFormDirect()` to JS (before `</script>`)**

  ```js
  function openLeadFormDirect() {
    document.getElementById('demoOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
    _showDemoStep('demoStep4');
    // Reset form fields
    ['leadEmail','leadName'].forEach(function(id){
      var f = document.getElementById(id); if(f) f.value='';
    });
    var sel = document.getElementById('leadAge');
    if (sel) sel.selectedIndex = 0;
  }
  ```

- [x] **Step 3: Add onclick to "출시 알림 받기"**

  Replace:
  ```html
        <button class="pricing-cta paid-cta">출시 알림 받기</button>
  ```
  With:
  ```html
        <button class="pricing-cta paid-cta" onclick="openLeadFormDirect()">출시 알림 받기</button>
  ```

- [x] **Step 4: Verify — grep for `openDemoModal` on pricing button and `openLeadFormDirect` on paid-cta button both return matches**

---

### Task 6: Commit

- [x] **Step 1: Stage and commit**

  ```bash
  git add kidsroute-mock/index.html
  git commit -m "feat: add schedule simulation preview step + activate pricing CTAs

  - Insert demoStepSim between loading and email form
  - Simulation renders context-aware academy cards + mini weekly grid
  - '무료로 시작하기' opens full demo modal
  - '출시 알림 받기' skips directly to lead-capture form

  Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
  ```

- [x] **Step 2: Deploy to GitHub Pages**

  ```bash
  git subtree push --prefix kidsroute-mock origin gh-pages
  ```

---

## Self-Review

**Spec coverage:**
- ✅ Simulation step before email form (Tasks 1–4)
- ✅ Context-aware content using query/radius/shuttle state (Task 4)
- ✅ "무료로 시작하기" activates (Task 5 Step 1)
- ✅ "출시 알림 받기" activates → email form (Task 5 Steps 2–3)
- ✅ Commit + deploy (Task 6)

**Placeholder scan:** No TBDs. All code blocks are complete.

**Type consistency:** 
- `_renderSimCards()` defined in Task 4, called in Task 1 (same name ✅)
- `_showDemoStep('demoStepSim')` registered in Task 1, HTML id used in Task 2 (same ✅)
- `openLeadFormDirect()` defined in Task 5 Step 2, used in Step 3 (same ✅)
- `_demoRadius`, `_demoShuttle`, `_demoPickup` — read defensively with `typeof` check ✅

---

## 추가 작업 기록 (플랜 외 사후 반영)

### Task 7: 과목 선택 + 요일/시간 선택 UI (Step 2에 추가) ✅ 완료

**배경:** 시뮬레이션이 typewriter 텍스트 파싱 대신 사용자가 직접 과목·요일·시간을 선택하도록 개선.

**변경 내용:**
- `_demoSubjects`, `_demoPreferDays`, `_demoPreferTime` 전역 상태 변수 추가
- Step 2에 **과목 다중선택 칩** 8개 (수학/영어/피아노/미술/태권도/과학/코딩/체육) 추가
- Step 2에 **요일 선택 버튼** 7개 (월~일, 기본값 월·수·금) 추가
- Step 2에 **시간대 선택 버튼** 4개 (오후 4~7시, 기본값 오후 5시) 추가
- `toggleSubject(el)`, `toggleDay(el)`, `selectTimeSlot(el)` JS 함수 추가
- `_renderSimCards()` 를 `_demoSubjects`, `_demoPreferDays`, `_demoPreferTime` 기반으로 전면 재작성
  - `_SIM_POOLS` 8종 확장 (science, coding, sports 추가)
  - `slotToRow(slot)` helper: slot 0-2 → 오전 행, slot 3-6 → 오후 행
  - 그리드 행 레이블 동적 업데이트 (선택 시간대 기준)
- `openDemoModal()` 리셋 로직에 과목칩·요일·시간 초기화 추가
- "이번 주" → "이번주" 띄어쓰기 수정

**커밋:** `feat: add subject/day/time selectors to Step 2, rewrite _renderSimCards`

---

### Task 8: 토/일 선택 시 오전 시간대 동적 표시 ✅ 완료

**배경:** 평일은 오후만 수업 가능하지만 주말(토·일)은 오전도 가능.

**변경 내용:**
- `.demo-time-morning` 숨김 컨테이너 추가 (오전 9/10/11시 버튼)
- `_demoPreferTime` 슬롯 체계 확장: 0-2 = 오전 9/10/11시, 3-6 = 오후 4/5/6/7시
- `toggleDay(el)` 에 주말 감지 로직 추가:
  - 토(5) 또는 일(6) 선택 시 오전 시간대 `.show` 클래스 추가
  - 모든 주말 해제 시 오전 시간대 숨김 + 오전 슬롯 선택 중이면 기본값(오후 5시) 복원
- `selectTimeSlot(el)` 함수 추가 (단일 선택)
- 일요일 버튼(일, data-day="6") 추가

**커밋:** `feat: show morning time slots when Saturday/Sunday selected`

---

### Task 9: 시뮬레이션 결과 부분 공개 (Partial Reveal) ✅ 완료

**배경:** 이메일 수집 동기 부여를 위해 카드 2번째부터 블러 처리, 잠금 배지 오버레이.

**변경 내용:**
- `.sim-lock-wrap` 래퍼로 카드 목록 + 스케줄 감싸기
- CSS `nth-child` 선택자로 점진적 블러:
  - `.sim-card:nth-child(2)` — blur(4px), opacity 0.5
  - `.sim-card:nth-child(n+3)` — blur(8px), opacity 0.22
  - `pointer-events: none; user-select: none`
- `.sim-lock-fade` 흰색 그라데이션 오버레이 (bottom 220px)
- `.sim-lock-badge` "🔒 나머지 결과를 이메일로 확인하세요" 배지
- CTA 버튼 "📧 맞춤 결과 이메일로 받기" + 서브 링크 "나중에 받을게요"

**커밋:** `feat: partial reveal blur effect on simulation cards`

---

### Task 10: 이메일 템플릿 HTML 파일 생성 ✅ 완료

**파일:** `kidsroute-mock/email-template.html` (신규, 464줄)

**내용:**
- **헤더:** 주황 그라데이션 (#FF9A3C→#F97316) + 인라인 SVG 로고 + 키즈루트
- **히어로:** 맞춤 분석 결과 소개, `{{이름}}`, `{{동네}}`, `{{반경}}`, `{{과목1~3}}` 템플릿 변수
- **학원 TOP 3 카드:** 순위 배지 + 학원명 + 평점/거리/시간 메타 + 태그 칩
- **주간 스케줄 표:** 월~금 × 오후 4~7시 HTML 테이블, 과목별 색상 코딩
  - 📐 수학 (파랑 #3B82F6): 월/수/금 오후 5시
  - 🔤 영어 (주황 #F97316): 화/목 오후 5시
  - 🎹 피아노 (초록 #10B981): 월/수 오후 6시
- **사전예약 확인:** 얼리버드 혜택 3가지 번호 목록
- **CTA 버튼:** 랜딩페이지 링크 (`https://davegpt25.github.io/kids`)
- **푸터:** 미니 로고, 연락처, 저작권, 수신거부/개인정보 링크
- 이메일 호환 테이블 레이아웃, 인라인 CSS, `@media 600px` 반응형

**커밋:** `feat: add email template for personalized academy results`
**배포:** `gh-pages` 반영 완료
