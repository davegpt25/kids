# Admin Dashboard & Membership System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a localStorage-based membership system (email = 7-day free trial, WTP 3 features) and a full admin dashboard accessible via footer login on `kidsroute-mock/index.html`.

**Architecture:** Single file `kidsroute-mock/index.html`. Admin dashboard lives as a `position:fixed` full-screen overlay (`.admin-root`, hidden by default) on top of the landing page. Membership data lives in `localStorage` under `kr_*` keys. No backend, no real payments.

**Tech Stack:** Vanilla JS (ES5-compatible), CSS custom properties (`--primary` = #F97316, etc.), Pretendard font (already loaded). Admin email hardcoded: `davegpt25@gmail.com`.

---

## ✅ 추가 구현 이력 (2026-05-31~)

> Tasks 1~12 완료 후 추가된 기능들

### 네비게이션 개편
- 상단 네비 순서: `사전예약 | 로그인 | 기능 | 이용방법 | 요금제 | 데모 체험`
- 로그인 버튼 → `openGoogleLogin()` → 학부모 앱 뷰 전환
- 관리자 로그인은 Footer 전용 유지 (`openAdminLogin()`)
- 관리자 사이드바 하단: 로컬 컴패니언 링크 `http://localhost:63523/`

### 랜딩 페이지 정리
- 시간 절약 계산기 섹션 삭제
- 단계별 성과 지표 섹션 삭제

### 히어로 폰 목업 지도 (SVG 삽화)
- CSS 격자 → SVG 역삼동 도로/블록 패턴으로 교체
- 3초마다 동네 자동 로테이션 (역삼동 → 사당동 → 대치동 → 잠실동)
- 각 동네마다 학원 핀 위치·이름·학원 목록 변경 (opacity fade 전환)

### 데모 Step 2 지도 (네이버 지도 실제 연동)
- `ncpKeyId: 5dq02tmsku`
- GPS + Reverse Geocoding 주소 표시
- 지도 확대/축소 버튼 (200px ↔ 340px)

### 이메일 발송 (EmailJS)
- `@emailjs/browser@4` SDK
- `service_rkuc4g7` / `template_6brgdse` / `UJDqX9x6UVJC12UTT`
- `_buildEmailHTML()`: 추천 학원 TOP3, 주간 스케줄 표, 얼리버드 혜택 동적 생성
- `sendKidsrouteEmail()`: EmailJS REST 호출
- 트리거: `submitLeadForm()` → Reverse Geocoding → 이메일 발송

### 학부모 앱 뷰 (`#userRoot`, z-index: 9000)
**학원 검색 탭**
- 목록 뷰: 과목 필터 칩, 거리/평점/요금 정렬, 10개 목업 학원 카드
- 지도 뷰: 네이버 지도, Geocoding 주소 검색, 반경 원, 마커 InfoWindow, 하단 슬라이더

**스케줄 탭**
- 주간 캘린더 (오늘 강조), 등록 학원 목록, AI 추천 연결

**내 정보 탭**
- 학부모 정보: 실제 이름, 핸드폰 번호 (인라인 편집)
- 전자 서명: 캔버스 손글씨 (하단 시트)
- 아이 추가 폼: 📷 사진, 닉네임, 👦/👧 성별, 학년(미취학5/6/7세 포함)
- `kr_children`, `kr_parent_info`, `kr_user_schedule`, `kr_notif_prefs`

---

## File Structure

| File | Changes |
|------|---------|
| `kidsroute-mock/index.html` | All changes — CSS additions before `</style>`, HTML additions before `</body>`, JS additions before `</script>` |

---

## CSS Variable Reference (already in `:root`)

```
--primary: #F97316   --primary-dark: #EA6C0A   --primary-light: #FFF7ED
--bg-base: #FFFBF7   --bg-card: #FFFFFF         --border: #F5F0EB
--text-main: #1C1C1C  --text-sub: #78716C        --text-muted: #A8A29E
--green: #10B981     --red: #EF4444             --gray-50: #FFFBF7
--gray-100: #F5F0EB  --gray-300: #E7E5E4        --gray-500: #78716C
--gray-700: #44403C  --gray-900: #1C1C1C
```

---

## Task 1: Data Layer — localStorage helpers and schema

**Files:**
- Modify: `kidsroute-mock/index.html` — JS block (before `</script>`)

- [ ] **Step 1: Add the data layer namespace before `</script>`**

```js
// ═══════════════════════════════════════════════════════════════
// ─── KR DATA LAYER ───
// All localStorage keys are prefixed kr_
// ═══════════════════════════════════════════════════════════════
var KR = {
  ADMIN_EMAIL: 'davegpt25@gmail.com',
  TRIAL_DAYS:  7,

  // ── Raw getters / setters ──
  _get: function(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch(e) { return null; }
  },
  _set: function(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {}
  },

  // ── Members ──
  getMembers: function() { return KR._get('kr_members') || []; },
  saveMembers: function(list) { KR._set('kr_members', list); },
  addMember: function(email, name) {
    var members = KR.getMembers();
    if (members.find(function(m){ return m.email === email; })) return; // 중복 방지
    members.push({
      email: email,
      name: name || '',
      registeredAt: Date.now(),
      trialDays: KR.TRIAL_DAYS,
      isPaid: false
    });
    KR.saveMembers(members);
  },
  getMember: function(email) {
    return KR.getMembers().find(function(m){ return m.email === email; }) || null;
  },
  getMemberStatus: function(email) {
    var m = KR.getMember(email);
    if (!m) return { type: 'none' };
    if (m.isPaid) return { type: 'active' };
    var daysLeft = Math.ceil(KR.TRIAL_DAYS - (Date.now() - m.registeredAt) / 86400000);
    if (daysLeft > 0) return { type: 'trial', daysLeft: daysLeft };
    return { type: 'expired' };
  },
  setMemberPaid: function(email, paid) {
    var members = KR.getMembers();
    var m = members.find(function(m){ return m.email === email; });
    if (m) { m.isPaid = paid; KR.saveMembers(members); }
  },

  // ── Session (현재 로그인 이메일) ──
  getSession: function() { return localStorage.getItem('kr_session') || ''; },
  setSession: function(email) { localStorage.setItem('kr_session', email); },
  clearSession: function() { localStorage.removeItem('kr_session'); },
  isAdmin: function() { return KR.getSession() === KR.ADMIN_EMAIL; },
  hasAdminSession: function() { return !!localStorage.getItem('kr_admin_session'); },
  setAdminSession: function() { localStorage.setItem('kr_admin_session', KR.ADMIN_EMAIL); },
  clearAdminSession: function() { localStorage.removeItem('kr_admin_session'); },

  // ── Features ──
  getFeatures: function() {
    return KR._get('kr_features') || { scheduleHistory: true, confidenceScore: true, vacancyAlert: false };
  },
  setFeature: function(key, val) {
    var f = KR.getFeatures(); f[key] = val; KR._set('kr_features', f);
  },

  // ── Saved Schedules ──
  getSavedSchedules: function() { return KR._get('kr_schedules') || []; },
  saveSchedule: function(label, subjects, days, time) {
    var schedules = KR.getSavedSchedules();
    if (schedules.length >= 5) schedules.shift(); // 최대 5개
    schedules.push({ id: Date.now(), savedAt: Date.now(), label: label, subjects: subjects, days: days, time: time });
    KR._set('kr_schedules', schedules);
  },

  // ── Alerts ──
  getAlerts: function() { return KR._get('kr_alerts') || []; },
  addAlert: function(academy, slots, waitEmail) {
    var alerts = KR.getAlerts();
    alerts.push({ id: Date.now(), academy: academy, slots: slots, waitEmail: waitEmail, status: 'pending', createdAt: Date.now() });
    KR._set('kr_alerts', alerts);
  },
  sendAlert: function(id) {
    var alerts = KR.getAlerts();
    var a = alerts.find(function(a){ return a.id === id; });
    if (a) { a.status = 'sent'; a.sentAt = Date.now(); KR._set('kr_alerts', alerts); }
  }
};
```

- [ ] **Step 2: Verify by opening browser console and running:**

```
KR.addMember('test@test.com', '테스트');
KR.getMemberStatus('test@test.com');
// Expected: {type: "trial", daysLeft: 7}
KR.getFeatures();
// Expected: {scheduleHistory: true, confidenceScore: true, vacancyAlert: false}
```

- [ ] **Step 3: Commit**

```bash
git add kidsroute-mock/index.html
git commit -m "feat: add KR data layer (localStorage helpers)"
```

---

## Task 2: Membership Registration — update submitLeadForm + Step 5

**Files:**
- Modify: `kidsroute-mock/index.html` — `submitLeadForm()` function + Step 5 HTML

Step 5 completion message currently shows `얼리버드 3개월 무료 혜택도 함께 드립니다.`  
We update it to reflect 7-day free membership trial.

- [ ] **Step 1: Update `submitLeadForm()` to save member**

Find this block inside `submitLeadForm()`:
```js
  const msg = document.getElementById('demoSuccessMsg');
  if (msg) {
    msg.innerHTML =
      '<strong>' + email + '</strong>으로<br>출시 알림을 보내드릴게요! 🎉<br>' +
      '<span style="font-size:13px;color:var(--text-sub);display:block;margin-top:6px">얼리버드 3개월 무료 혜택도 함께 드립니다.</span>';
  }
  _showDemoStep('demoStep5');
```

Replace with:
```js
  // 멤버 등록
  var nameEl = document.getElementById('leadName');
  KR.addMember(email, nameEl ? nameEl.value.trim() : '');

  const msg = document.getElementById('demoSuccessMsg');
  if (msg) {
    msg.innerHTML =
      '<strong>' + email + '</strong>으로<br>등록이 완료됐어요! 🎉<br>' +
      '<span style="font-size:13px;color:var(--text-sub);display:block;margin-top:8px">' +
      '🎁 <strong>7일 무료 멤버십 체험</strong>이 시작됐어요.<br>스케줄 저장, 신뢰도 점수, 공석 알림을 모두 사용해보세요!</span>';
  }
  _showDemoStep('demoStep5');
```

- [ ] **Step 2: Verify by submitting the demo email form**

1. Open demo modal → Step 4 → 이메일 입력 → 제출
2. Step 5 메시지에 "7일 무료 멤버십 체험이 시작됐어요" 표시 확인
3. 브라우저 콘솔에서 `KR.getMembers()` → 입력한 이메일 포함 확인

- [ ] **Step 3: Commit**

```bash
git add kidsroute-mock/index.html
git commit -m "feat: save member on form submit, update Step 5 trial message"
```

---

## Task 3: Lock Modal + Membership Gate Function

**Files:**
- Modify: `kidsroute-mock/index.html` — CSS before `</style>`, HTML before `</body>`, JS before `</script>`

- [ ] **Step 1: Add lock modal CSS before `</style>`**

```css
/* ─── MEMBERSHIP LOCK MODAL ─── */
.lock-overlay {
  position: fixed; inset: 0; z-index: 8000;
  background: rgba(0,0,0,0.45); display: none;
  align-items: center; justify-content: center;
}
.lock-overlay.open { display: flex; }
.lock-modal {
  background: #fff; border-radius: 20px; padding: 28px 24px;
  max-width: 320px; width: 90%; text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.18);
  animation: lockSlideUp 0.25s ease;
}
@keyframes lockSlideUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.lock-icon { font-size: 36px; margin-bottom: 12px; }
.lock-title { font-size: 17px; font-weight: 800; color: var(--text-main); margin-bottom: 8px; }
.lock-desc  { font-size: 13px; color: var(--text-sub); line-height: 1.6; margin-bottom: 20px; }
.lock-cta {
  width: 100%; padding: 13px; border-radius: 12px;
  background: linear-gradient(135deg, #FF9A3C, #F97316);
  color: #fff; font-size: 14px; font-weight: 700; border: none; cursor: pointer;
  margin-bottom: 10px;
}
.lock-skip {
  background: none; border: none; font-size: 12px;
  color: var(--text-muted); cursor: pointer; text-decoration: underline;
}
```

- [ ] **Step 2: Add lock modal HTML before `</body>`**

```html
<!-- 멤버십 잠금 모달 -->
<div class="lock-overlay" id="lockOverlay" onclick="closeLockModal(event)">
  <div class="lock-modal">
    <div class="lock-icon">🔒</div>
    <div class="lock-title" id="lockTitle">멤버십 전용 기능이에요</div>
    <div class="lock-desc" id="lockDesc">7일 무료 체험이 종료됐어요.<br>멤버십 구독으로 계속 사용하세요.</div>
    <button class="lock-cta" onclick="closeLockModal(); openDemoModal()">멤버십 구독하기</button>
    <button class="lock-skip" onclick="closeLockModal()">나중에 →</button>
  </div>
</div>
```

- [ ] **Step 3: Add gate functions in JS before `</script>`**

```js
// ─── Membership Gate ───
function openLockModal(titleText, descText) {
  var title = document.getElementById('lockTitle');
  var desc  = document.getElementById('lockDesc');
  if (title && titleText) title.textContent = titleText;
  if (desc  && descText)  desc.innerHTML    = descText;
  document.getElementById('lockOverlay').classList.add('open');
}
function closeLockModal(e) {
  if (e && e.target !== document.getElementById('lockOverlay')) return;
  document.getElementById('lockOverlay').classList.remove('open');
}

// 현재 세션 이메일 (Step 4에서 입력한 이메일을 임시 보관)
var _sessionEmail = '';

function checkMembership(featureKey) {
  // 세션 이메일이 없으면 이메일 등록 유도
  if (!_sessionEmail) {
    openLockModal('이메일 등록이 필요해요',
      '이메일을 등록하면 <strong>7일 무료 멤버십</strong>으로<br>이 기능을 바로 사용할 수 있어요!');
    return false;
  }
  var feat = KR.getFeatures();
  if (!feat[featureKey]) {
    openLockModal('기능 준비 중이에요', '곧 사용하실 수 있도록 준비 중이에요. 😊');
    return false;
  }
  var status = KR.getMemberStatus(_sessionEmail);
  if (status.type === 'none') {
    openLockModal('이메일 등록이 필요해요',
      '이메일을 등록하면 <strong>7일 무료 멤버십</strong>으로<br>이 기능을 바로 사용할 수 있어요!');
    return false;
  }
  if (status.type === 'expired') {
    openLockModal('멤버십 체험이 종료됐어요',
      '7일 무료 체험이 끝났어요.<br><strong>멤버십 구독</strong>으로 계속 사용하세요.');
    return false;
  }
  return true; // trial or active
}
```

- [ ] **Step 4: Update `submitLeadForm` to set `_sessionEmail`**

In `submitLeadForm()`, right after `KR.addMember(email, ...)`, add:

```js
  _sessionEmail = email;
```

- [ ] **Step 5: Verify lock modal**

Open browser → 개발자 도구 콘솔에서:
```js
openLockModal('테스트', '설명 텍스트');
```
Expected: 잠금 모달 표시, 배경 클릭 시 닫힘

- [ ] **Step 6: Commit**

```bash
git add kidsroute-mock/index.html
git commit -m "feat: add membership lock modal + gate function"
```

---

## Task 4: WTP Feature 1 — Schedule Save Button

**Files:**
- Modify: `kidsroute-mock/index.html` — demoStepSim HTML + CSS + JS

- [ ] **Step 1: Add "저장하기" button CSS before `</style>`**

```css
/* ─── WTP: SCHEDULE SAVE ─── */
.sim-save-btn {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  width: 100%; padding: 11px; border-radius: 12px; margin-top: 10px;
  background: #fff; border: 1.5px solid var(--primary);
  color: var(--primary); font-size: 13px; font-weight: 700; cursor: pointer;
  transition: all 0.15s;
}
.sim-save-btn:hover { background: var(--primary-light); }
.sim-save-btn.saved { background: var(--primary-light); border-color: var(--primary-light); color: var(--primary); }
```

- [ ] **Step 2: Add save button inside `demoStepSim` HTML**

Find this inside `demoStepSim`:
```html
      <button class="demo-start-btn" onclick="_showDemoStep('demoStep4')" style="margin-top:12px">
        📧 맞춤 결과 이메일로 받기
      </button>
```

Add this immediately BEFORE that button:
```html
      <button class="sim-save-btn" id="simSaveBtn" onclick="saveCurrentSchedule()">
        💾 이 조합 저장하기
      </button>
```

- [ ] **Step 3: Add `saveCurrentSchedule()` JS before `</script>`**

```js
// ─── WTP 1: Schedule Save ───
function saveCurrentSchedule() {
  if (!checkMembership('scheduleHistory')) return;
  var subjects = (typeof _demoSubjects !== 'undefined' && _demoSubjects.length > 0)
    ? _demoSubjects.slice(0, 3) : ['math', 'english', 'piano'];
  var label = subjects.map(function(s) {
    var pool = _SIM_POOLS[s]; return pool ? pool.label : s;
  }).join(' + ') + ' 조합';
  KR.saveSchedule(label, subjects, _demoPreferDays, _demoPreferTime);
  var btn = document.getElementById('simSaveBtn');
  if (btn) {
    btn.textContent = '✅ 저장됐어요!';
    btn.classList.add('saved');
    btn.disabled = true;
    setTimeout(function() {
      btn.textContent = '💾 이 조합 저장하기';
      btn.classList.remove('saved');
      btn.disabled = false;
    }, 2500);
  }
  showToast('스케줄이 저장됐어요 💾');
}
```

- [ ] **Step 4: Reset save button in `openDemoModal`**

Find this inside `openDemoModal()`:
```js
  _demoSubjects   = [];
```

After it, add:
```js
  var saveBtn = document.getElementById('simSaveBtn');
  if (saveBtn) { saveBtn.textContent = '💾 이 조합 저장하기'; saveBtn.classList.remove('saved'); saveBtn.disabled = false; }
```

- [ ] **Step 5: Verify**

1. 이메일 미등록 상태에서 "이 조합 저장하기" → 잠금 모달 표시 확인
2. `KR.addMember('my@test.com','테스트'); _sessionEmail='my@test.com';` 콘솔 입력 후 저장 버튼 → "✅ 저장됐어요!" 표시
3. `KR.getSavedSchedules()` → 저장된 항목 확인

- [ ] **Step 6: Commit**

```bash
git add kidsroute-mock/index.html
git commit -m "feat: WTP1 - schedule save button with membership gate"
```

---

## Task 5: WTP Feature 2 — Confidence Score Badge

**Files:**
- Modify: `kidsroute-mock/index.html` — CSS + `_renderSimCards()` function

- [ ] **Step 1: Add confidence score CSS before `</style>`**

```css
/* ─── WTP: CONFIDENCE SCORE ─── */
.sim-confidence {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11px; font-weight: 700; padding: 3px 10px;
  border-radius: 100px; margin-bottom: 10px;
}
.sim-confidence.high   { background: #ECFDF5; color: #16A34A; }
.sim-confidence.medium { background: #FFF7ED; color: #F97316; }
.sim-confidence.low    { background: #F3F4F6; color: #6B7280; }
.sim-confidence.locked {
  background: #F3F4F6; color: #9CA3AF;
  filter: blur(4px); pointer-events: none; user-select: none;
}
```

- [ ] **Step 2: Add confidence score rendering inside `_renderSimCards()`**

Find this at the top of `_renderSimCards()`:
```js
  var simSubEl = document.getElementById('simSubText');
```

Add confidence calculation right before it:
```js
  // Confidence score
  var confScore = Math.min(95, 78 + rawSubjects.length * 3 + preferDays.length * 2);
  var confClass = confScore >= 90 ? 'high' : confScore >= 75 ? 'medium' : 'low';
  var confLabel = '🧠 AI 추천 신뢰도 ' + confScore + '%';
  var isMember  = _sessionEmail && ['trial','active'].indexOf(KR.getMemberStatus(_sessionEmail).type) >= 0;
  var confEl    = document.getElementById('simConfidence');
  if (confEl) {
    confEl.textContent  = isMember ? confLabel : '🔒 AI 추천 신뢰도 ??%';
    confEl.className    = 'sim-confidence ' + (isMember ? confClass : 'locked');
    confEl.onclick      = isMember ? null : function() {
      checkMembership('confidenceScore');
    };
    confEl.style.pointerEvents = isMember ? '' : 'auto';
  }
```

- [ ] **Step 3: Add confidence badge HTML inside `demoStepSim`**

Find this inside `demoStepSim`:
```html
      <div class="demo-sub" id="simSubText">반경 1km · 학원 3개 조합</div>
```

Add immediately AFTER it:
```html
      <div class="sim-confidence" id="simConfidence">🧠 AI 추천 신뢰도 산출 중...</div>
```

- [ ] **Step 4: Verify**

1. `_sessionEmail = ''` 상태에서 시뮬레이션 실행 → 배지가 `🔒 AI 추천 신뢰도 ??%` + blur 처리 확인
2. `_sessionEmail = 'my@test.com'; KR.addMember('my@test.com','테스트');` 후 시뮬레이션 → 숫자 점수 확인

- [ ] **Step 5: Commit**

```bash
git add kidsroute-mock/index.html
git commit -m "feat: WTP2 - confidence score badge with membership gate"
```

---

## Task 6: WTP Feature 3 — Vacancy Alert Button

**Files:**
- Modify: `kidsroute-mock/index.html` — CSS + HTML (demoStepSim) + JS

- [ ] **Step 1: Add alert modal CSS before `</style>`**

```css
/* ─── WTP: VACANCY ALERT ─── */
.alert-reg-overlay {
  position: fixed; inset: 0; z-index: 8000;
  background: rgba(0,0,0,0.45); display: none;
  align-items: center; justify-content: center;
}
.alert-reg-overlay.open { display: flex; }
.alert-reg-modal {
  background: #fff; border-radius: 20px; padding: 28px 24px;
  max-width: 320px; width: 90%; text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.18);
  animation: lockSlideUp 0.25s ease;
}
.alert-reg-title { font-size: 17px; font-weight: 800; color: var(--text-main); margin-bottom: 8px; }
.alert-reg-desc  { font-size: 13px; color: var(--text-sub); margin-bottom: 16px; line-height: 1.6; }
.alert-academy-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; text-align: left; }
.alert-academy-item {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 12px; border-radius: 10px;
  background: var(--bg-base); border: 1.5px solid var(--border);
  font-size: 13px; cursor: pointer; transition: border-color 0.15s;
}
.alert-academy-item.selected { border-color: var(--primary); background: var(--primary-light); }
.alert-academy-item input[type=checkbox] { accent-color: var(--primary); width: 16px; height: 16px; }
.alert-reg-cta {
  width: 100%; padding: 13px; border-radius: 12px;
  background: linear-gradient(135deg, #FF9A3C, #F97316);
  color: #fff; font-size: 14px; font-weight: 700; border: none; cursor: pointer;
  margin-bottom: 10px;
}
.alert-reg-skip {
  background: none; border: none; font-size: 12px;
  color: var(--text-muted); cursor: pointer; text-decoration: underline;
}
.sim-alert-btn {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  width: 100%; padding: 11px; border-radius: 12px; margin-top: 8px;
  background: #fff; border: 1.5px solid #E2E8F0;
  color: var(--text-sub); font-size: 13px; font-weight: 600; cursor: pointer;
  transition: all 0.15s;
}
.sim-alert-btn:hover { border-color: var(--primary); color: var(--primary); }
```

- [ ] **Step 2: Add alert button in `demoStepSim` HTML**

Find `<button class="sim-save-btn"` that was added in Task 4.
Add this AFTER the save button:

```html
      <button class="sim-alert-btn" onclick="openVacancyAlertModal()">
        🔔 공석 나면 알려줘
      </button>
```

- [ ] **Step 3: Add alert modal HTML before `</body>`**

```html
<!-- 공석 알림 등록 모달 -->
<div class="alert-reg-overlay" id="alertRegOverlay" onclick="closeAlertRegModal(event)">
  <div class="alert-reg-modal">
    <div style="font-size:32px;margin-bottom:10px">🔔</div>
    <div class="alert-reg-title">공석 알림 등록</div>
    <div class="alert-reg-desc">자리가 나면 바로 알려드릴게요.<br>알림 받을 학원을 선택해주세요.</div>
    <div class="alert-academy-list" id="alertAcademyList">
      <!-- JS로 렌더링 -->
    </div>
    <button class="alert-reg-cta" onclick="submitVacancyAlert()">알림 등록하기</button>
    <button class="alert-reg-skip" onclick="closeAlertRegModal()">나중에 →</button>
  </div>
</div>
```

- [ ] **Step 4: Add alert JS before `</script>`**

```js
// ─── WTP 3: Vacancy Alert ───
function openVacancyAlertModal() {
  if (!checkMembership('vacancyAlert')) return;
  // 현재 시뮬레이션 카드 학원 이름 수집
  var cards = document.querySelectorAll('#simCards .sim-card');
  var listEl = document.getElementById('alertAcademyList');
  if (!listEl) return;
  listEl.innerHTML = '';
  cards.forEach(function(card, i) {
    var nameEl = card.querySelector('.sim-card-name');
    if (!nameEl) return;
    var name = nameEl.textContent;
    var item = document.createElement('label');
    item.className = 'alert-academy-item';
    item.innerHTML =
      '<input type="checkbox" name="alertAcademy" value="' + name + '" checked>' +
      '<span>' + name + '</span>';
    item.querySelector('input').addEventListener('change', function() {
      item.classList.toggle('selected', this.checked);
    });
    item.classList.add('selected');
    listEl.appendChild(item);
  });
  if (listEl.children.length === 0) {
    listEl.innerHTML = '<div style="font-size:13px;color:var(--text-sub);text-align:center;padding:8px">저장된 학원이 없어요</div>';
  }
  document.getElementById('alertRegOverlay').classList.add('open');
}
function closeAlertRegModal(e) {
  if (e && e.target !== document.getElementById('alertRegOverlay')) return;
  document.getElementById('alertRegOverlay').classList.remove('open');
}
function submitVacancyAlert() {
  var checked = document.querySelectorAll('#alertAcademyList input[type=checkbox]:checked');
  checked.forEach(function(cb) {
    KR.addAlert(cb.value, 1, _sessionEmail);
  });
  closeAlertRegModal();
  showToast('🔔 공석 알림이 등록됐어요!');
}
```

- [ ] **Step 5: Verify**

1. `KR.setFeature('vacancyAlert', true)` 콘솔 입력 후 공석 버튼 클릭 → 알림 모달 표시
2. 학원 선택 후 "알림 등록하기" → `KR.getAlerts()` 확인
3. `KR.setFeature('vacancyAlert', false)` 후 클릭 → 잠금 모달 표시

- [ ] **Step 6: Commit**

```bash
git add kidsroute-mock/index.html
git commit -m "feat: WTP3 - vacancy alert modal with membership gate"
```

---

## Task 7: Admin Login — Footer Link + Login Modal + View Switch

**Files:**
- Modify: `kidsroute-mock/index.html` — footer HTML, CSS, JS

- [ ] **Step 1: Add admin login CSS before `</style>`**

```css
/* ─── ADMIN LOGIN MODAL ─── */
.admin-login-overlay {
  position: fixed; inset: 0; z-index: 9000;
  background: rgba(0,0,0,0.5); display: none;
  align-items: center; justify-content: center;
}
.admin-login-overlay.open { display: flex; }
.admin-login-modal {
  background: #fff; border-radius: 20px; padding: 32px 28px;
  width: 320px; box-shadow: 0 24px 64px rgba(0,0,0,0.18);
  animation: lockSlideUp 0.25s ease;
}
.admin-login-logo {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 20px;
}
.admin-login-logo-icon {
  width: 36px; height: 36px; border-radius: 10px;
  background: linear-gradient(135deg, #FF9A3C, #F97316);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
}
.admin-login-title { font-size: 17px; font-weight: 800; color: #1E293B; }
.admin-login-sub   { font-size: 12px; color: #94A3B8; margin-top: 1px; }
.admin-login-label { font-size: 12px; font-weight: 600; color: #64748B; margin-bottom: 6px; display: block; }
.admin-login-input {
  width: 100%; padding: 11px 14px; border-radius: 10px;
  border: 1.5px solid #E2E8F0; font-size: 14px; outline: none;
  margin-bottom: 8px; transition: border-color 0.15s;
}
.admin-login-input:focus { border-color: #F97316; }
.admin-login-error {
  font-size: 12px; color: #DC2626; margin-bottom: 10px; display: none;
}
.admin-login-btn {
  width: 100%; padding: 13px; border-radius: 12px;
  background: linear-gradient(135deg, #FF9A3C, #F97316);
  color: #fff; font-size: 14px; font-weight: 700;
  border: none; cursor: pointer; margin-bottom: 10px;
}
.admin-login-cancel {
  width: 100%; padding: 10px; border-radius: 12px;
  background: none; border: 1.5px solid #E2E8F0;
  color: #64748B; font-size: 13px; font-weight: 600; cursor: pointer;
}
.footer-admin-link {
  display: block; margin-top: 16px; font-size: 11px;
  color: rgba(255,255,255,0.2); text-align: center; cursor: pointer;
  text-decoration: none; transition: color 0.2s;
}
.footer-admin-link:hover { color: rgba(255,255,255,0.5); }
```

- [ ] **Step 2: Add "관리자" link in footer HTML**

Find:
```html
  <div class="footer-copy">© 2026 KidsRoute. MVP v1.0</div>
</footer>
```

Replace with:
```html
  <div class="footer-copy">© 2026 KidsRoute. MVP v1.0</div>
  <a class="footer-admin-link" onclick="openAdminLogin()">관리자</a>
</footer>
```

- [ ] **Step 3: Add admin login modal HTML before `</body>`**

```html
<!-- 관리자 로그인 모달 -->
<div class="admin-login-overlay" id="adminLoginOverlay" onclick="handleAdminLoginOverlay(event)">
  <div class="admin-login-modal">
    <div class="admin-login-logo">
      <div class="admin-login-logo-icon">🗺️</div>
      <div>
        <div class="admin-login-title">관리자 로그인</div>
        <div class="admin-login-sub">키즈루트 어드민</div>
      </div>
    </div>
    <label class="admin-login-label">이메일</label>
    <input class="admin-login-input" id="adminEmailInput" type="email"
           placeholder="관리자 이메일 입력"
           onkeydown="if(event.key==='Enter') doAdminLogin()">
    <div class="admin-login-error" id="adminLoginError">관리자 계정이 아닙니다</div>
    <button class="admin-login-btn" onclick="doAdminLogin()">로그인</button>
    <button class="admin-login-cancel" onclick="closeAdminLogin()">닫기</button>
  </div>
</div>
```

- [ ] **Step 4: Add admin view switch JS before `</script>`**

```js
// ─── Admin Login / Logout ───
function openAdminLogin() {
  // 이미 어드민 세션 있으면 바로 대시보드 진입
  if (localStorage.getItem('kr_admin_session')) { showAdminDashboard(); return; }
  var input = document.getElementById('adminEmailInput');
  if (input) input.value = '';
  var err = document.getElementById('adminLoginError');
  if (err) err.style.display = 'none';
  document.getElementById('adminLoginOverlay').classList.add('open');
  setTimeout(function(){ if (input) input.focus(); }, 100);
}
function closeAdminLogin() {
  document.getElementById('adminLoginOverlay').classList.remove('open');
}
function handleAdminLoginOverlay(e) {
  if (e.target === document.getElementById('adminLoginOverlay')) closeAdminLogin();
}
function doAdminLogin() {
  var input = document.getElementById('adminEmailInput');
  var email = input ? input.value.trim() : '';
  var err   = document.getElementById('adminLoginError');
  if (email === KR.ADMIN_EMAIL) {
    localStorage.setItem('kr_admin_session', email);
    closeAdminLogin();
    showAdminDashboard();
  } else {
    if (err) { err.style.display = 'block'; }
    if (input) { input.style.borderColor = '#EF4444'; setTimeout(function(){ input.style.borderColor = ''; }, 2000); }
  }
}
function showAdminDashboard() {
  var adminRoot = document.getElementById('adminRoot');
  if (adminRoot) {
    adminRoot.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    adminRenderAll();
  }
}
function hideAdminDashboard() {
  var adminRoot = document.getElementById('adminRoot');
  if (adminRoot) adminRoot.style.display = 'none';
  document.body.style.overflow = '';
  localStorage.removeItem('kr_admin_session');
}
// 페이지 로드 시 어드민 세션 복원
window.addEventListener('DOMContentLoaded', function() {
  if (localStorage.getItem('kr_admin_session') === KR.ADMIN_EMAIL) {
    showAdminDashboard();
  }
});
```

- [ ] **Step 5: Verify**

1. Footer 맨 하단에 "관리자" 텍스트 링크 확인 (매우 연한 색상)
2. 클릭 → 로그인 모달 표시
3. 잘못된 이메일 입력 → 에러 메시지 표시
4. `davegpt25@gmail.com` 입력 → 모달 닫힘 (adminRoot 아직 없어서 에러 발생해도 됨)

- [ ] **Step 6: Commit**

```bash
git add kidsroute-mock/index.html
git commit -m "feat: admin login modal + footer link + session management"
```

---

## Task 8: Admin Dashboard HTML Structure

**Files:**
- Modify: `kidsroute-mock/index.html` — HTML before `</body>`

- [ ] **Step 1: Add the full admin root HTML before `</body>`**

(이미 추가된 lock modal, alert modal, admin login modal 아래에 추가)

```html
<!-- ═══════════════════════════════════════════
     관리자 대시보드 루트 (로그인 후 표시)
════════════════════════════════════════════ -->
<div id="adminRoot" style="display:none;position:fixed;inset:0;z-index:9500;background:#F8FAFC;flex-direction:row;overflow:hidden;">

  <!-- 사이드바 -->
  <aside id="adminSidebar">
    <div class="adm-sidebar-logo">
      <div class="adm-logo-icon">🗺️</div>
      <div>
        <div class="adm-logo-text">키즈루트</div>
        <div class="adm-logo-badge">ADMIN</div>
      </div>
    </div>

    <div class="adm-nav-group">Overview</div>
    <div class="adm-nav-item adm-active" onclick="adminShowPage('dashboard')">
      <span class="adm-nav-icon">📊</span> 대시보드
    </div>

    <div class="adm-nav-group">Management</div>
    <div class="adm-nav-item" onclick="adminShowPage('members')">
      <span class="adm-nav-icon">👥</span> 멤버십 관리
      <span class="adm-nav-badge" id="admBadgeMembers">0</span>
    </div>
    <div class="adm-nav-item" onclick="adminShowPage('features')">
      <span class="adm-nav-icon">⚙️</span> 기능 설정
    </div>
    <div class="adm-nav-item" onclick="adminShowPage('alerts')">
      <span class="adm-nav-icon">🔔</span> 공석 알림
      <span class="adm-nav-badge adm-badge-green" id="admBadgeAlerts">0</span>
    </div>

    <div class="adm-nav-group">Analytics</div>
    <div class="adm-nav-item" onclick="adminShowPage('stats')">
      <span class="adm-nav-icon">📈</span> 가입 통계
    </div>

    <div class="adm-sidebar-footer">
      <div class="adm-profile">
        <div class="adm-avatar">D</div>
        <div>
          <div class="adm-profile-name">davegpt25</div>
          <div class="adm-profile-role">관리자</div>
        </div>
        <button class="adm-logout-btn" onclick="hideAdminDashboard()" title="로그아웃">↩</button>
      </div>
    </div>
  </aside>

  <!-- 메인 콘텐츠 -->
  <main id="adminMain">

    <!-- ── 대시보드 홈 ── -->
    <div id="admPageDashboard" class="adm-page adm-page-active">
      <div class="adm-page-header">
        <div class="adm-page-title">대시보드 👋</div>
        <div class="adm-page-sub">오늘도 학부모들이 최적 스케줄을 찾고 있어요.</div>
      </div>
      <!-- KPI 카드 -->
      <div class="adm-kpi-grid">
        <div class="adm-kpi-card">
          <div class="adm-kpi-icon">📋</div>
          <div class="adm-kpi-label">총 사전예약</div>
          <div class="adm-kpi-value" id="kpiTotal">0</div>
          <div class="adm-kpi-delta adm-delta-up" id="kpiTodayDelta">오늘 +0</div>
        </div>
        <div class="adm-kpi-card">
          <div class="adm-kpi-icon">💳</div>
          <div class="adm-kpi-label">멤버십 활성</div>
          <div class="adm-kpi-value" id="kpiActive">0</div>
          <div class="adm-kpi-delta adm-delta-up" id="kpiActiveDelta">이번 주 +0</div>
        </div>
        <div class="adm-kpi-card">
          <div class="adm-kpi-icon">⏳</div>
          <div class="adm-kpi-label">체험 중</div>
          <div class="adm-kpi-value" id="kpiTrial">0</div>
          <div class="adm-kpi-delta adm-delta-down" id="kpiExpiringSoon">만료 임박 0명</div>
        </div>
        <div class="adm-kpi-card">
          <div class="adm-kpi-icon">🔄</div>
          <div class="adm-kpi-label">전환율</div>
          <div class="adm-kpi-value" id="kpiConversion">0%</div>
          <div class="adm-kpi-delta adm-delta-up">멤버십/전체</div>
        </div>
      </div>
      <!-- 차트 + 최근 가입자 -->
      <div class="adm-row">
        <div class="adm-card adm-card-wide">
          <div class="adm-card-title">📈 일별 사전예약 추이 <span class="adm-card-badge">최근 7일</span></div>
          <div class="adm-chart-wrap">
            <div class="adm-chart-bars" id="admChartBars"><!-- JS 렌더링 --></div>
            <div class="adm-chart-labels" id="admChartLabels"><!-- JS 렌더링 --></div>
          </div>
          <div class="adm-stats-list" id="admWeekStats"><!-- JS 렌더링 --></div>
        </div>
        <div class="adm-card">
          <div class="adm-card-title">👥 최근 가입자 <a class="adm-card-action" onclick="adminShowPage('members')">전체 보기 →</a></div>
          <div class="adm-member-list" id="admRecentMembers"><!-- JS 렌더링 --></div>
        </div>
      </div>
      <!-- 기능 설정 + 공석 알림 -->
      <div class="adm-row">
        <div class="adm-card">
          <div class="adm-card-title">⚙️ 멤버십 기능 ON / OFF <span class="adm-card-badge">WTP 3가지</span></div>
          <div class="adm-feature-list" id="admFeatureList"><!-- JS 렌더링 --></div>
        </div>
        <div class="adm-card">
          <div class="adm-card-title">🔔 공석 알림 대기열 <span class="adm-card-badge adm-badge-green" id="admAlertCount">0건</span></div>
          <div class="adm-alert-list" id="admAlertList"><!-- JS 렌더링 --></div>
        </div>
      </div>
    </div>

    <!-- ── 멤버십 관리 ── -->
    <div id="admPageMembers" class="adm-page">
      <div class="adm-page-header">
        <div class="adm-page-title">👥 멤버십 관리</div>
        <div class="adm-page-sub">전체 사전예약 회원 목록</div>
        <button class="adm-export-btn" onclick="adminExportCSV()">📥 CSV 내보내기</button>
      </div>
      <div class="adm-filter-tabs" id="admMemberFilterTabs">
        <button class="adm-filter-tab adm-filter-active" data-filter="all" onclick="adminFilterMembers(this,'all')">전체</button>
        <button class="adm-filter-tab" data-filter="trial" onclick="adminFilterMembers(this,'trial')">체험 중</button>
        <button class="adm-filter-tab" data-filter="active" onclick="adminFilterMembers(this,'active')">멤버십</button>
        <button class="adm-filter-tab" data-filter="expired" onclick="adminFilterMembers(this,'expired')">만료</button>
      </div>
      <div class="adm-card" style="margin-top:0">
        <div class="adm-table-wrap">
          <table class="adm-table" id="admMemberTable">
            <thead>
              <tr>
                <th>이메일</th><th>이름</th><th>가입일</th>
                <th>상태</th><th>남은 기간</th><th>멤버십</th>
              </tr>
            </thead>
            <tbody id="admMemberTableBody"><!-- JS 렌더링 --></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ── 기능 설정 ── -->
    <div id="admPageFeatures" class="adm-page">
      <div class="adm-page-header">
        <div class="adm-page-title">⚙️ 기능 설정</div>
        <div class="adm-page-sub">멤버십 구독자에게 제공할 기능을 관리하세요</div>
      </div>
      <div class="adm-card">
        <div class="adm-feature-list adm-feature-list-large" id="admFeatureListFull"><!-- JS 렌더링 --></div>
      </div>
    </div>

    <!-- ── 공석 알림 ── -->
    <div id="admPageAlerts" class="adm-page">
      <div class="adm-page-header">
        <div class="adm-page-title">🔔 공석 알림</div>
        <div class="adm-page-sub">학부모가 등록한 공석 알림 대기열</div>
      </div>
      <div class="adm-card">
        <div class="adm-alert-list adm-alert-list-full" id="admAlertListFull"><!-- JS 렌더링 --></div>
      </div>
    </div>

    <!-- ── 가입 통계 ── -->
    <div id="admPageStats" class="adm-page">
      <div class="adm-page-header">
        <div class="adm-page-title">📈 가입 통계</div>
        <div class="adm-page-sub">일별 가입 현황 및 전환율</div>
      </div>
      <div class="adm-row">
        <div class="adm-card adm-card-wide">
          <div class="adm-card-title">📊 일별 가입 추이 <span class="adm-card-badge">최근 14일</span></div>
          <div class="adm-chart-wrap adm-chart-tall">
            <div class="adm-chart-bars" id="admChartBars14"><!-- JS 렌더링 --></div>
            <div class="adm-chart-labels" id="admChartLabels14"><!-- JS 렌더링 --></div>
          </div>
        </div>
        <div class="adm-card">
          <div class="adm-card-title">🔄 전환 현황</div>
          <div id="admConversionStats"><!-- JS 렌더링 --></div>
        </div>
      </div>
    </div>

  </main>
</div>
```

- [ ] **Step 2: Verify HTML structure**

```bash
grep -c "adm-page" kidsroute-mock/index.html
```
Expected: 20 이상 (여러 곳에 사용됨)

- [ ] **Step 3: Commit**

```bash
git add kidsroute-mock/index.html
git commit -m "feat: add admin dashboard HTML structure (sidebar + 5 pages)"
```

---

## Task 9: Admin Dashboard CSS

**Files:**
- Modify: `kidsroute-mock/index.html` — CSS before `</style>`

- [ ] **Step 1: Add admin dashboard CSS before `</style>`**

```css
/* ══════════════════════════════════════════════════════
   관리자 대시보드 CSS
══════════════════════════════════════════════════════ */

/* ── 레이아웃 ── */
#adminRoot { font-family: 'Pretendard', sans-serif; }
#adminSidebar {
  width: 220px; flex-shrink: 0; background: #fff;
  border-right: 1px solid #E2E8F0;
  display: flex; flex-direction: column;
  padding: 20px 12px; overflow-y: auto;
}
#adminMain { flex: 1; overflow-y: auto; padding: 28px 32px; }

/* ── 사이드바 ── */
.adm-sidebar-logo {
  display: flex; align-items: center; gap: 8px;
  padding: 0 8px 20px; border-bottom: 1px solid #F1F5F9; margin-bottom: 16px;
}
.adm-logo-icon {
  width: 32px; height: 32px; border-radius: 10px;
  background: linear-gradient(135deg, #FF9A3C, #F97316);
  display: flex; align-items: center; justify-content: center; font-size: 16px;
}
.adm-logo-text  { font-size: 14px; font-weight: 800; color: #1E293B; }
.adm-logo-badge {
  font-size: 9px; font-weight: 700; background: #FFF7ED;
  color: #F97316; padding: 1px 6px; border-radius: 100px; border: 1px solid #FED7AA;
}
.adm-nav-group {
  font-size: 10px; font-weight: 700; color: #94A3B8;
  letter-spacing: 0.08em; text-transform: uppercase;
  padding: 0 8px; margin: 12px 0 4px;
}
.adm-nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 10px; border-radius: 10px; cursor: pointer;
  font-size: 13px; font-weight: 500; color: #64748B;
  margin-bottom: 2px; transition: all 0.15s;
}
.adm-nav-item:hover  { background: #F8FAFC; color: #1E293B; }
.adm-nav-item.adm-active { background: #FFF7ED; color: #F97316; font-weight: 700; }
.adm-nav-icon { font-size: 15px; width: 20px; text-align: center; }
.adm-nav-badge {
  margin-left: auto; background: #F97316; color: #fff;
  font-size: 10px; font-weight: 700; padding: 1px 7px; border-radius: 100px;
}
.adm-nav-badge.adm-badge-green { background: #10B981; }
.adm-sidebar-footer { margin-top: auto; padding-top: 16px; border-top: 1px solid #F1F5F9; }
.adm-profile {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 10px; border-radius: 10px; background: #F8FAFC;
}
.adm-avatar {
  width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #FF9A3C, #F97316);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; color: #fff; font-weight: 700;
}
.adm-profile-name { font-size: 11px; font-weight: 700; color: #1E293B; }
.adm-profile-role { font-size: 10px; color: #94A3B8; }
.adm-logout-btn {
  margin-left: auto; background: none; border: none;
  font-size: 16px; cursor: pointer; color: #94A3B8; padding: 4px;
}
.adm-logout-btn:hover { color: #F97316; }

/* ── 페이지 전환 ── */
.adm-page { display: none; }
.adm-page.adm-page-active { display: block; }
.adm-page-header { margin-bottom: 24px; position: relative; }
.adm-page-title { font-size: 20px; font-weight: 800; color: #1E293B; }
.adm-page-sub   { font-size: 13px; color: #64748B; margin-top: 3px; }

/* ── KPI 카드 ── */
.adm-kpi-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 20px; }
.adm-kpi-card {
  background: #fff; border-radius: 14px;
  border: 1px solid #E2E8F0; padding: 16px 18px; position: relative;
}
.adm-kpi-icon  { position: absolute; top: 14px; right: 14px; font-size: 20px; opacity: 0.6; }
.adm-kpi-label { font-size: 11px; font-weight: 600; color: #94A3B8; margin-bottom: 6px; }
.adm-kpi-value { font-size: 26px; font-weight: 800; color: #1E293B; line-height: 1; }
.adm-kpi-delta { font-size: 11px; font-weight: 600; margin-top: 6px; padding: 2px 7px; border-radius: 100px; display: inline-block; }
.adm-delta-up   { background: #ECFDF5; color: #16A34A; }
.adm-delta-down { background: #FEF2F2; color: #DC2626; }
.adm-delta-warn { background: #FFF7ED; color: #F97316; }

/* ── 카드 + 행 ── */
.adm-row { display: grid; grid-template-columns: 1.6fr 1fr; gap: 16px; margin-bottom: 16px; }
.adm-card { background: #fff; border-radius: 14px; border: 1px solid #E2E8F0; padding: 18px 20px; }
.adm-card-wide { } /* 비율은 grid가 처리 */
.adm-card-title {
  font-size: 13px; font-weight: 700; color: #1E293B;
  margin-bottom: 14px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
}
.adm-card-badge {
  font-size: 10px; font-weight: 700; background: #FFF7ED; color: #F97316;
  padding: 1px 7px; border-radius: 100px;
}
.adm-card-badge.adm-badge-green { background: #ECFDF5; color: #16A34A; }
.adm-card-action { margin-left: auto; font-size: 11px; color: #F97316; font-weight: 600; cursor: pointer; }

/* ── 차트 ── */
.adm-chart-wrap { margin-bottom: 12px; }
.adm-chart-tall .adm-chart-bars { height: 100px; }
.adm-chart-bars {
  display: flex; align-items: flex-end; gap: 5px; height: 60px; margin-bottom: 4px;
}
.adm-chart-bar {
  flex: 1; border-radius: 4px 4px 0 0; min-height: 4px;
  background: linear-gradient(to top, #FF9A3C, #FBBF24); opacity: 0.75; cursor: pointer;
  transition: opacity 0.15s; position: relative;
}
.adm-chart-bar:hover { opacity: 1; }
.adm-chart-bar.today { background: linear-gradient(to top, #F97316, #FF9A3C); opacity: 1; }
.adm-chart-labels { display: flex; gap: 5px; }
.adm-chart-label  { flex: 1; text-align: center; font-size: 9px; color: #94A3B8; }
.adm-chart-label.today { color: #F97316; font-weight: 700; }
.adm-stats-list { display: flex; flex-direction: column; margin-top: 8px; }
.adm-stat-row {
  display: flex; justify-content: space-between; padding: 7px 0;
  border-bottom: 1px solid #F1F5F9; font-size: 12px;
}
.adm-stat-row:last-child { border-bottom: none; }
.adm-stat-label { color: #64748B; }
.adm-stat-value { font-weight: 700; color: #1E293B; }
.adm-stat-value.orange { color: #F97316; }

/* ── 멤버 리스트 ── */
.adm-member-list { display: flex; flex-direction: column; gap: 8px; }
.adm-member-row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: 10px;
  background: #F8FAFC; border: 1px solid #F1F5F9;
}
.adm-member-avatar {
  width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #6366F1, #8B5CF6);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; color: #fff; font-weight: 700;
}
.adm-member-email { font-size: 12px; font-weight: 600; color: #1E293B; }
.adm-member-date  { font-size: 10px; color: #94A3B8; }
.adm-member-status {
  margin-left: auto; font-size: 10px; font-weight: 700;
  padding: 3px 9px; border-radius: 100px; flex-shrink: 0;
}
.adm-status-active  { background: #ECFDF5; color: #16A34A; }
.adm-status-trial   { background: #FFF7ED; color: #F97316; }
.adm-status-expired { background: #F1F5F9; color: #94A3B8; }
.adm-toggle {
  width: 36px; height: 20px; border-radius: 100px; flex-shrink: 0;
  background: #E2E8F0; cursor: pointer; position: relative; transition: background 0.2s;
  border: none;
}
.adm-toggle.on { background: #F97316; }
.adm-toggle::after {
  content: ''; position: absolute;
  width: 14px; height: 14px; border-radius: 50%; background: #fff;
  top: 3px; left: 3px; transition: left 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
}
.adm-toggle.on::after { left: 19px; }

/* ── 기능 스위치 ── */
.adm-feature-list { display: flex; flex-direction: column; gap: 10px; }
.adm-feature-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px; border-radius: 12px;
  background: #F8FAFC; border: 1px solid #F1F5F9;
}
.adm-feature-icon {
  width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;
}
.adm-feature-icon.time       { background: #FFF7ED; }
.adm-feature-icon.confidence { background: #EFF6FF; }
.adm-feature-icon.alert      { background: #F0FDF4; }
.adm-feature-name { font-size: 12px; font-weight: 700; color: #1E293B; }
.adm-feature-desc { font-size: 11px; color: #94A3B8; margin-top: 1px; }
.adm-feature-list-large .adm-feature-row { padding: 16px 18px; }
.adm-feature-list-large .adm-feature-icon { width: 42px; height: 42px; font-size: 20px; }
.adm-feature-list-large .adm-feature-name { font-size: 14px; }
.adm-feature-list-large .adm-feature-desc { font-size: 12px; }

/* ── 알림 대기열 ── */
.adm-alert-list { display: flex; flex-direction: column; gap: 8px; }
.adm-alert-row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: 10px;
  background: #F8FAFC; border: 1px solid #F1F5F9;
}
.adm-alert-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.adm-dot-pending { background: #F97316; box-shadow: 0 0 0 3px #FFF7ED; }
.adm-dot-sent    { background: #10B981; }
.adm-alert-text { font-size: 12px; font-weight: 600; color: #1E293B; }
.adm-alert-sub  { font-size: 10px; color: #94A3B8; }
.adm-alert-send-btn {
  margin-left: auto; font-size: 11px; font-weight: 600; flex-shrink: 0;
  padding: 5px 11px; border-radius: 8px; cursor: pointer;
  border: 1.5px solid #F97316; color: #F97316; background: #FFF7ED;
  transition: all 0.15s;
}
.adm-alert-send-btn:hover { background: #F97316; color: #fff; }
.adm-alert-sent-badge { margin-left: auto; font-size: 10px; color: #10B981; font-weight: 600; flex-shrink: 0; }

/* ── 멤버십 관리 테이블 ── */
.adm-export-btn {
  position: absolute; right: 0; top: 0;
  padding: 8px 16px; border-radius: 10px; cursor: pointer;
  background: #fff; border: 1.5px solid #E2E8F0;
  font-size: 12px; font-weight: 600; color: #64748B;
  transition: all 0.15s;
}
.adm-export-btn:hover { border-color: #F97316; color: #F97316; }
.adm-filter-tabs { display: flex; gap: 8px; margin-bottom: 14px; }
.adm-filter-tab {
  padding: 6px 16px; border-radius: 100px; font-size: 12px; font-weight: 600;
  cursor: pointer; border: 1.5px solid #E2E8F0; background: #fff; color: #64748B;
  transition: all 0.15s;
}
.adm-filter-tab.adm-filter-active { background: #FFF7ED; border-color: #F97316; color: #F97316; }
.adm-table-wrap { overflow-x: auto; }
.adm-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.adm-table th {
  text-align: left; padding: 8px 12px; font-size: 11px; font-weight: 700;
  color: #94A3B8; border-bottom: 1px solid #E2E8F0; white-space: nowrap;
}
.adm-table td { padding: 10px 12px; border-bottom: 1px solid #F1F5F9; }
.adm-table tr:last-child td { border-bottom: none; }
.adm-table tr:hover td { background: #FAFBFC; }

/* ── 전환 통계 ── */
#admConversionStats { display: flex; flex-direction: column; gap: 12px; }
.adm-conv-item { display: flex; flex-direction: column; gap: 4px; }
.adm-conv-label { font-size: 12px; color: #64748B; font-weight: 600; }
.adm-conv-bar-wrap {
  height: 8px; background: #F1F5F9; border-radius: 100px; overflow: hidden;
}
.adm-conv-bar {
  height: 100%; border-radius: 100px;
  background: linear-gradient(to right, #FF9A3C, #F97316);
  transition: width 0.6s ease;
}
.adm-conv-value { font-size: 11px; color: #94A3B8; }
```

- [ ] **Step 2: Verify CSS loads**

`davegpt25@gmail.com`으로 로그인 → 대시보드 표시 → 기본 레이아웃(사이드바+메인) 확인

- [ ] **Step 3: Commit**

```bash
git add kidsroute-mock/index.html
git commit -m "feat: admin dashboard CSS (sidebar, KPI, chart, table styles)"
```

---

## Task 10: Admin Dashboard JavaScript — Render Functions

**Files:**
- Modify: `kidsroute-mock/index.html` — JS before `</script>`

- [ ] **Step 1: Add admin render functions before `</script>`**

```js
// ══════════════════════════════════════════════════════════
// ─── ADMIN DASHBOARD JS ───
// ══════════════════════════════════════════════════════════

// ── 페이지 전환 ──
function adminShowPage(pageId) {
  document.querySelectorAll('.adm-page').forEach(function(p) { p.classList.remove('adm-page-active'); });
  var page = document.getElementById('admPage' + pageId.charAt(0).toUpperCase() + pageId.slice(1));
  if (page) page.classList.add('adm-page-active');
  document.querySelectorAll('.adm-nav-item').forEach(function(item) { item.classList.remove('adm-active'); });
  var navMap = { dashboard:'대시보드', members:'멤버십 관리', features:'기능 설정', alerts:'공석 알림', stats:'가입 통계' };
  document.querySelectorAll('.adm-nav-item').forEach(function(item) {
    if (item.textContent.trim().indexOf(navMap[pageId]) >= 0) item.classList.add('adm-active');
  });
  if (pageId === 'members') adminRenderMemberTable('all');
  if (pageId === 'features') adminRenderFeaturesFull();
  if (pageId === 'alerts') adminRenderAlertsFull();
  if (pageId === 'stats') adminRenderStats();
}

// ── 전체 렌더링 (로그인 직후 호출) ──
function adminRenderAll() {
  adminRenderKPIs();
  adminRenderChart(7, 'admChartBars', 'admChartLabels');
  adminRenderWeekStats();
  adminRenderRecentMembers();
  adminRenderFeatures();
  adminRenderAlerts();
  adminUpdateBadges();
}

// ── KPI 카드 ──
function adminRenderKPIs() {
  var members = KR.getMembers();
  var now     = Date.now();
  var todayStart = new Date(); todayStart.setHours(0,0,0,0);
  var weekStart  = now - 7 * 86400000;

  var total      = members.length;
  var todayNew   = members.filter(function(m){ return m.registeredAt >= todayStart.getTime(); }).length;
  var active     = members.filter(function(m){ return m.isPaid; }).length;
  var weekActive = members.filter(function(m){ return m.isPaid && m.registeredAt >= weekStart; }).length;
  var trial      = members.filter(function(m){
    return !m.isPaid && (KR.TRIAL_DAYS - (now - m.registeredAt)/86400000) > 0;
  }).length;
  var expiringSoon = members.filter(function(m) {
    var left = KR.TRIAL_DAYS - (now - m.registeredAt)/86400000;
    return !m.isPaid && left > 0 && left <= 2;
  }).length;
  var conversion = total > 0 ? ((active / total) * 100).toFixed(1) : '0.0';

  _setAdmEl('kpiTotal',      total);
  _setAdmEl('kpiTodayDelta', '오늘 +' + todayNew);
  _setAdmEl('kpiActive',     active);
  _setAdmEl('kpiActiveDelta','이번 주 +' + weekActive);
  _setAdmEl('kpiTrial',      trial);
  _setAdmEl('kpiExpiringSoon','만료 임박 ' + expiringSoon + '명');
  _setAdmEl('kpiConversion', conversion + '%');
}

function _setAdmEl(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; }

// ── 차트 ──
function adminRenderChart(days, barsId, labelsId) {
  var barsEl   = document.getElementById(barsId);
  var labelsEl = document.getElementById(labelsId);
  if (!barsEl || !labelsEl) return;
  var members  = KR.getMembers();
  var now      = Date.now();
  var counts   = [];
  var labels   = [];
  var maxCount = 1;
  var DAY_NAMES = ['일','월','화','수','목','금','토'];

  for (var i = days - 1; i >= 0; i--) {
    var dayStart = now - i * 86400000;
    var dayEnd   = dayStart + 86400000;
    var d = new Date(dayStart);
    var count = members.filter(function(m){ return m.registeredAt >= dayStart && m.registeredAt < dayEnd; }).length;
    counts.push(count);
    labels.push(i === 0 ? '오늘' : DAY_NAMES[d.getDay()]);
    if (count > maxCount) maxCount = count;
  }

  barsEl.innerHTML = '';
  labelsEl.innerHTML = '';
  counts.forEach(function(c, i) {
    var pct = Math.max(4, Math.round((c / maxCount) * 100));
    var bar = document.createElement('div');
    bar.className = 'adm-chart-bar' + (i === counts.length - 1 ? ' today' : '');
    bar.style.height = pct + '%';
    bar.title = labels[i] + ': ' + c + '명';
    barsEl.appendChild(bar);

    var label = document.createElement('div');
    label.className = 'adm-chart-label' + (i === counts.length - 1 ? ' today' : '');
    label.textContent = labels[i];
    labelsEl.appendChild(label);
  });
}

// ── 주간 통계 ──
function adminRenderWeekStats() {
  var el = document.getElementById('admWeekStats');
  if (!el) return;
  var members  = KR.getMembers();
  var now      = Date.now();
  var weekAgo  = now - 7 * 86400000;
  var prevWeekAgo = now - 14 * 86400000;
  var thisWeek = members.filter(function(m){ return m.registeredAt >= weekAgo; }).length;
  var prevWeek = members.filter(function(m){ return m.registeredAt >= prevWeekAgo && m.registeredAt < weekAgo; }).length;
  var growth   = prevWeek > 0 ? Math.round((thisWeek - prevWeek) / prevWeek * 100) : 0;
  var convCount= members.filter(function(m){ return m.isPaid && m.registeredAt >= weekAgo; }).length;
  el.innerHTML =
    '<div class="adm-stat-row"><span class="adm-stat-label">이번 주 총 가입</span><span class="adm-stat-value orange">+' + thisWeek + '명</span></div>' +
    '<div class="adm-stat-row"><span class="adm-stat-label">전주 대비</span><span class="adm-stat-value orange">' + (growth >= 0 ? '+' : '') + growth + '%</span></div>' +
    '<div class="adm-stat-row"><span class="adm-stat-label">체험→멤버십 전환</span><span class="adm-stat-value">' + convCount + '명 (이번 주)</span></div>';
}

// ── 최근 가입자 ──
function adminRenderRecentMembers() {
  var el = document.getElementById('admRecentMembers');
  if (!el) return;
  var members = KR.getMembers().slice().sort(function(a,b){ return b.registeredAt - a.registeredAt; }).slice(0, 4);
  if (members.length === 0) {
    el.innerHTML = '<div style="text-align:center;color:#94A3B8;font-size:12px;padding:16px">아직 가입자가 없어요</div>';
    return;
  }
  el.innerHTML = members.map(function(m) {
    var status = KR.getMemberStatus(m.email);
    var masked = m.email.substring(0, 3) + '**@' + m.email.split('@')[1];
    var initial = m.email.charAt(0).toUpperCase();
    var statusBadge = status.type === 'active'
      ? '<span class="adm-member-status adm-status-active">멤버십</span>'
      : status.type === 'trial'
      ? '<span class="adm-member-status adm-status-trial">체험 D-' + status.daysLeft + '</span>'
      : '<span class="adm-member-status adm-status-expired">만료</span>';
    var timeAgo = _timeAgo(m.registeredAt);
    var isPaid  = m.isPaid;
    return '<div class="adm-member-row">' +
      '<div class="adm-member-avatar" style="background:linear-gradient(135deg,#6366F1,#8B5CF6)">' + initial + '</div>' +
      '<div><div class="adm-member-email">' + masked + '</div><div class="adm-member-date">' + timeAgo + '</div></div>' +
      statusBadge +
      '<button class="adm-toggle ' + (isPaid ? 'on' : '') + '" onclick="adminToggleMember(\'' + m.email + '\',this)" title="멤버십 토글"></button>' +
      '</div>';
  }).join('');
}

function adminToggleMember(email, btn) {
  var m = KR.getMember(email);
  if (!m) return;
  KR.setMemberPaid(email, !m.isPaid);
  btn.classList.toggle('on', !m.isPaid);
  adminRenderKPIs();
  adminUpdateBadges();
}

function _timeAgo(ts) {
  var diff = Date.now() - ts;
  if (diff < 60000)      return '방금';
  if (diff < 3600000)    return Math.floor(diff/60000) + '분 전';
  if (diff < 86400000)   return Math.floor(diff/3600000) + '시간 전';
  return Math.floor(diff/86400000) + '일 전';
}

// ── 기능 스위치 (대시보드 홈) ──
function adminRenderFeatures() {
  _adminRenderFeatureList('admFeatureList', false);
}
function adminRenderFeaturesFull() {
  _adminRenderFeatureList('admFeatureListFull', true);
}
function _adminRenderFeatureList(elId, large) {
  var el = document.getElementById(elId);
  if (!el) return;
  var feat = KR.getFeatures();
  var defs = [
    { key:'scheduleHistory', icon:'⏱️', cls:'time',       name:'스케줄 저장 & 히스토리', desc:'시간절약 — 최대 5개 스케줄 저장' },
    { key:'confidenceScore', icon:'✨', cls:'confidence', name:'최적 조합 신뢰도 점수',  desc:'결정불안 해소 — AI 추천 근거 표시' },
    { key:'vacancyAlert',    icon:'🔔', cls:'alert',      name:'학원 공석 실시간 알림',  desc:'기회손실 방지 — 카카오 알림톡 연동 (준비 중)' }
  ];
  el.innerHTML = defs.map(function(d) {
    var on = feat[d.key];
    return '<div class="adm-feature-row">' +
      '<div class="adm-feature-icon ' + d.cls + '">' + d.icon + '</div>' +
      '<div><div class="adm-feature-name">' + d.name + '</div><div class="adm-feature-desc">' + d.desc + '</div></div>' +
      '<button class="adm-toggle ' + (on ? 'on' : '') + '" onclick="adminToggleFeature(\'' + d.key + '\',this)"></button>' +
      '</div>';
  }).join('');
}
function adminToggleFeature(key, btn) {
  var feat = KR.getFeatures();
  KR.setFeature(key, !feat[key]);
  btn.classList.toggle('on', !feat[key]);
}

// ── 공석 알림 (대시보드 홈) ──
function adminRenderAlerts() {
  _adminRenderAlertList('admAlertList', 3);
  var pending = KR.getAlerts().filter(function(a){ return a.status === 'pending'; }).length;
  var badge = document.getElementById('admAlertCount');
  if (badge) { badge.textContent = pending + '건'; badge.className = 'adm-card-badge' + (pending > 0 ? ' adm-badge-green' : ''); }
}
function adminRenderAlertsFull() {
  _adminRenderAlertList('admAlertListFull', 999);
}
function _adminRenderAlertList(elId, limit) {
  var el = document.getElementById(elId);
  if (!el) return;
  var alerts = KR.getAlerts().slice().sort(function(a,b){ return b.createdAt - a.createdAt; }).slice(0, limit);
  if (alerts.length === 0) {
    el.innerHTML = '<div style="text-align:center;color:#94A3B8;font-size:12px;padding:16px">등록된 알림이 없어요</div>';
    return;
  }
  el.innerHTML = alerts.map(function(a) {
    var isPending = a.status === 'pending';
    return '<div class="adm-alert-row" style="' + (isPending ? '' : 'opacity:0.55') + '">' +
      '<div class="adm-alert-dot ' + (isPending ? 'adm-dot-pending' : 'adm-dot-sent') + '"></div>' +
      '<div><div class="adm-alert-text">' + a.academy + ' — ' + a.slots + '자리</div>' +
      '<div class="adm-alert-sub">' + (isPending ? '대기 중 · ' + _timeAgo(a.createdAt) : '발송 완료 · ' + _timeAgo(a.sentAt || a.createdAt)) + '</div></div>' +
      (isPending
        ? '<button class="adm-alert-send-btn" onclick="adminSendAlert(' + a.id + ',this)">알림 발송</button>'
        : '<span class="adm-alert-sent-badge">✅ 발송됨</span>') +
      '</div>';
  }).join('');
}
function adminSendAlert(id, btn) {
  KR.sendAlert(id);
  showToast('알림이 발송됐어요 ✅');
  adminRenderAlerts();
  adminUpdateBadges();
}

// ── 배지 업데이트 ──
function adminUpdateBadges() {
  var members = KR.getMembers();
  var pending = KR.getAlerts().filter(function(a){ return a.status === 'pending'; }).length;
  _setAdmEl('admBadgeMembers', members.length);
  _setAdmEl('admBadgeAlerts', pending);
}

// ── 멤버십 관리 테이블 ──
var _admMemberFilter = 'all';
function adminFilterMembers(btn, filter) {
  _admMemberFilter = filter;
  document.querySelectorAll('.adm-filter-tab').forEach(function(t){ t.classList.remove('adm-filter-active'); });
  btn.classList.add('adm-filter-active');
  adminRenderMemberTable(filter);
}
function adminRenderMemberTable(filter) {
  var tbody = document.getElementById('admMemberTableBody');
  if (!tbody) return;
  var members = KR.getMembers().slice().sort(function(a,b){ return b.registeredAt - a.registeredAt; });
  if (filter !== 'all') {
    members = members.filter(function(m){
      var s = KR.getMemberStatus(m.email);
      return s.type === filter;
    });
  }
  if (members.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#94A3B8;padding:20px">해당하는 회원이 없어요</td></tr>';
    return;
  }
  tbody.innerHTML = members.map(function(m) {
    var status   = KR.getMemberStatus(m.email);
    var masked   = m.email.substring(0, 3) + '**@' + m.email.split('@')[1];
    var regDate  = new Date(m.registeredAt).toLocaleDateString('ko-KR');
    var statusBadge = status.type === 'active'
      ? '<span class="adm-member-status adm-status-active">멤버십</span>'
      : status.type === 'trial'
      ? '<span class="adm-member-status adm-status-trial">체험 중</span>'
      : '<span class="adm-member-status adm-status-expired">만료</span>';
    var remaining = status.type === 'trial' ? 'D-' + status.daysLeft : status.type === 'active' ? '∞' : '-';
    return '<tr>' +
      '<td>' + masked + '</td>' +
      '<td>' + (m.name || '-') + '</td>' +
      '<td>' + regDate + '</td>' +
      '<td>' + statusBadge + '</td>' +
      '<td style="color:#64748B">' + remaining + '</td>' +
      '<td><button class="adm-toggle ' + (m.isPaid ? 'on' : '') + '" onclick="adminToggleMember(\'' + m.email + '\',this);adminRenderMemberTable(\'' + _admMemberFilter + '\')"></button></td>' +
      '</tr>';
  }).join('');
}

// ── CSV 내보내기 ──
function adminExportCSV() {
  var members = KR.getMembers();
  var header  = ['이메일', '이름', '가입일', '상태', '남은기간', '멤버십'];
  var rows    = members.map(function(m) {
    var status  = KR.getMemberStatus(m.email);
    var regDate = new Date(m.registeredAt).toLocaleDateString('ko-KR');
    var remaining = status.type === 'trial' ? 'D-' + status.daysLeft : status.type === 'active' ? '유지' : '만료';
    return [m.email, m.name || '', regDate, status.type, remaining, m.isPaid ? 'O' : 'X'].join(',');
  });
  var csv  = [header.join(',')].concat(rows).join('\n');
  var blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  var url  = URL.createObjectURL(blob);
  var a    = document.createElement('a');
  a.href   = url; a.download = 'kidsroute_members_' + new Date().toISOString().slice(0,10) + '.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// ── 전환 통계 ──
function adminRenderStats() {
  adminRenderChart(14, 'admChartBars14', 'admChartLabels14');
  var el = document.getElementById('admConversionStats');
  if (!el) return;
  var members = KR.getMembers();
  var total   = members.length || 1;
  var trial   = members.filter(function(m){ var s = KR.getMemberStatus(m.email); return s.type==='trial'; }).length;
  var active  = members.filter(function(m){ return m.isPaid; }).length;
  var expired = members.filter(function(m){ var s = KR.getMemberStatus(m.email); return s.type==='expired'; }).length;
  function bar(label, count, color) {
    var pct = Math.round(count / total * 100);
    return '<div class="adm-conv-item">' +
      '<div class="adm-conv-label">' + label + ' <strong style="color:#1E293B">' + count + '명</strong></div>' +
      '<div class="adm-conv-bar-wrap"><div class="adm-conv-bar" style="width:' + pct + '%;background:' + color + '"></div></div>' +
      '<div class="adm-conv-value">' + pct + '%</div></div>';
  }
  el.innerHTML =
    bar('체험 중', trial,  'linear-gradient(to right,#FF9A3C,#F97316)') +
    bar('멤버십 활성', active, 'linear-gradient(to right,#34D399,#10B981)') +
    bar('만료', expired, 'linear-gradient(to right,#94A3B8,#64748B)');
}
```

- [ ] **Step 2: Verify dashboard rendering**

1. Footer "관리자" → `davegpt25@gmail.com` 로그인
2. KPI 카드 4개 표시 확인 (숫자 0으로 시작)
3. 브라우저 콘솔: `KR.addMember('test1@naver.com','김테스트'); KR.addMember('test2@kakao.com','이테스트');`
4. 새로고침 없이 `adminRenderAll()` 콘솔 실행 → KPI 업데이트, 최근 가입자 2명 표시 확인
5. 사이드바 "멤버십 관리" 클릭 → 테이블 표시
6. 사이드바 "기능 설정" 클릭 → 토글 3개 표시
7. 사이드바 "가입 통계" 클릭 → 14일 차트 + 전환율 바 표시
8. 로그아웃 버튼 클릭 → 랜딩페이지 복귀

- [ ] **Step 3: Commit**

```bash
git add kidsroute-mock/index.html
git commit -m "feat: admin dashboard JS (KPI, chart, members, features, alerts, CSV)"
```

---

## Task 11: Seed Data + Step 5 Modal 멤버십 문구 업데이트

이전에 이미 Step 5를 업데이트했지만, 어드민에서 즉시 테스트 가능하도록 시드 데이터 함수를 추가합니다.

**Files:**
- Modify: `kidsroute-mock/index.html` — JS before `</script>`

- [ ] **Step 1: Add seed data function**

```js
// ─── 개발 시드 데이터 (콘솔에서 adminSeed() 실행) ───
function adminSeed() {
  var emails = [
    ['kim.jisoo@naver.com','김지수'], ['park.minjun@kakao.com','박민준'],
    ['lee.sohee@gmail.com','이소희'], ['choi.hyun@naver.com','최현'],
    ['jung.yuna@daum.net','정유나'],  ['oh.seungwoo@naver.com','오승우'],
    ['han.mirae@kakao.com','한미래'], ['yoon.jiwon@gmail.com','윤지원']
  ];
  // 다양한 등록 시점 (0~14일 전)
  emails.forEach(function(e, i) {
    var m = KR.getMember(e[0]);
    if (!m) {
      var member = { email: e[0], name: e[1], registeredAt: Date.now() - i * 86400000 * 1.5, trialDays: 7, isPaid: false };
      if (i < 2) member.isPaid = true; // 처음 2명은 멤버십 활성
      var members = KR.getMembers();
      members.push(member);
      KR.saveMembers(members);
    }
  });
  // 알림 데이터
  ['강남 베스트 수학','YBM 영어 서초점','예원 피아노'].forEach(function(ac, i) {
    KR.addAlert(ac, i+1, emails[i][0]);
  });
  adminRenderAll();
  console.log('Seed data added! KR.getMembers().length =', KR.getMembers().length);
}
```

- [ ] **Step 2: Test the full flow**

브라우저 콘솔에서:
```js
adminSeed();
```
Expected:
- KPI: 총 8명, 멤버십 활성 2명, 체험 중 ~5명
- 차트에 최근 7일 바 표시
- 최근 가입자 4명 목록
- 공석 알림 대기열 3건
- 기능 설정 토글 3개
- 멤버십 관리 테이블 8행
- CSV 버튼 클릭 → 파일 다운로드

- [ ] **Step 3: Commit**

```bash
git add kidsroute-mock/index.html
git commit -m "feat: add adminSeed() for dev testing"
```

---

## Task 12: 최종 커밋 & GitHub Pages 배포

- [ ] **Step 1: 전체 기능 최종 검증 체크리스트**

```
랜딩 플로우:
□ 데모 모달 → Step 4 이메일 입력 → 제출 → Step 5 "7일 무료 멤버십 체험" 메시지
□ demoStepSim: 신뢰도 배지(잠금), 저장 버튼, 공석 알림 버튼 표시
□ 이메일 미등록 상태에서 저장 버튼 → 잠금 모달
□ 이메일 등록 후 저장 버튼 → 저장 성공 토스트

어드민 플로우:
□ Footer "관리자" 링크 → 로그인 모달
□ 틀린 이메일 → 에러 메시지
□ davegpt25@gmail.com → 대시보드 진입
□ KPI 4개 카드 정상 표시
□ 일별 차트 7개 바 표시
□ 최근 가입자 목록 + 멤버십 토글
□ WTP 기능 3가지 ON/OFF
□ 공석 알림 대기열 + 발송 버튼
□ 사이드바 멤버십 관리 → 테이블 + 필터 + CSV
□ 사이드바 기능 설정 → 풀 기능 토글
□ 사이드바 가입 통계 → 14일 차트 + 전환율
□ 로그아웃 → 랜딩 복귀
□ 새로고침 후 어드민 세션 유지
```

- [ ] **Step 2: 최종 커밋**

```bash
git add kidsroute-mock/index.html
git commit -m "feat: admin dashboard + membership system complete

- KR data layer: localStorage helpers for members, features, alerts
- Membership registration: email submit saves member, 7-day trial starts
- Lock modal + membership gate for all WTP features
- WTP1: schedule save button with member gate
- WTP2: AI confidence score badge (blurred for non-members)
- WTP3: vacancy alert registration modal
- Admin login: footer link + email auth (davegpt25@gmail.com)
- Admin dashboard: sidebar + 5 pages
- KPI cards, 7-day bar chart, recent members, feature toggles, alert queue
- Membership management table with filters + CSV export
- 14-day stats page with conversion bars

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

- [ ] **Step 3: GitHub Pages 배포**

```bash
git subtree push --prefix kidsroute-mock origin gh-pages
```

Expected output: `To https://github.com/davegpt25/kids.git ... -> gh-pages`

- [ ] **Step 4: 라이브 URL 확인**

https://davegpt25.github.io/kids 접속 → Footer "관리자" → 로그인 → 대시보드

---

## Self-Review

**Spec coverage:**
- ✅ 이메일 등록 = 7일 무료 체험 (Task 2)
- ✅ 멤버십 상태 계산 (Task 1 `getMemberStatus`)
- ✅ WTP 기능 1: 스케줄 저장 (Task 4)
- ✅ WTP 기능 2: 신뢰도 점수 (Task 5)
- ✅ WTP 기능 3: 공석 알림 (Task 6)
- ✅ Footer 관리자 링크 (Task 7)
- ✅ 로그인 모달 + 이메일 인증 (Task 7)
- ✅ 랜딩 ↔ 대시보드 뷰 전환 (Task 7)
- ✅ KPI 카드 4개 (Task 10)
- ✅ 일별 차트 (Task 10)
- ✅ 최근 가입자 + 멤버십 토글 (Task 10)
- ✅ WTP 기능 ON/OFF 스위치 (Task 10)
- ✅ 공석 알림 대기열 + 발송 (Task 10)
- ✅ 멤버십 관리 테이블 + 필터 (Task 10)
- ✅ CSV 내보내기 (Task 10)
- ✅ 14일 통계 + 전환율 (Task 10)
- ✅ 세션 복원 (Task 7)

**Placeholder scan:** 없음 ✅

**Type consistency:**
- `KR.getMemberStatus()` → `{type, daysLeft}` — Task 1 정의, Task 3/10에서 동일 구조 사용 ✅
- `_sessionEmail` — Task 3에서 선언, Task 2/4/5에서 사용 ✅
- `adminRenderAll()` — Task 10에서 정의, Task 7 `showAdminDashboard()`에서 호출 ✅
- `_SIM_POOLS` — 기존 코드에 있음, Task 5에서 참조 ✅
