# 내돈내산 후기 서비스 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 실제 수강생 학부모가 영수증 인증 후 학원 후기를 작성하고, 전 유저와 공유하며, 본인 후기 심사 결과를 인앱 알림으로 받는 서비스를 구현한다.

**Architecture:** Supabase(PostgreSQL + Storage + Realtime)를 백엔드로 사용한다. 프론트는 단일 파일 `kids/index.html`에 Supabase JS SDK를 CDN으로 로드해 직접 호출한다. 기존 `_urUser` 세션 객체와 `urAddNotification()` 패턴을 재활용한다.

**Tech Stack:** Supabase JS SDK v2 (CDN), kids/index.html (vanilla JS), Supabase Storage (영수증 이미지), Supabase Realtime (상태 변경 구독)

---

## 파일 구조

| 파일 | 변경 유형 | 내용 |
|---|---|---|
| `kids/index.html` | Modify | 전체 기능 구현 (SDK 로드, CSS, JS, HTML) |
| `supabase/schema.sql` | Create | reviews 테이블 DDL + RLS 정책 (참조용) |

---

## Task 1: Supabase 프로젝트 설정 (수동 단계)

**Files:**
- Create: `supabase/schema.sql` (참조용 DDL)

- [ ] **Step 1: Supabase 프로젝트 생성**

  [https://supabase.com](https://supabase.com) → "New project" 생성.
  프로젝트 생성 후 Settings > API에서 다음 두 값을 메모:
  - `Project URL` (예: `https://xxxx.supabase.co`)
  - `anon public key`

- [ ] **Step 2: reviews 테이블 생성**

  Supabase 대시보드 > SQL Editor에서 아래 SQL 실행:

```sql
create type review_status as enum ('pending', 'approved', 'rejected');

create table reviews (
  id uuid primary key default gen_random_uuid(),
  academy_id integer not null,
  user_email text not null,
  rating integer not null check (rating between 1 and 5),
  body text not null check (char_length(body) >= 20),
  receipt_url text not null,
  status review_status not null default 'pending',
  reject_reason text,
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

create index reviews_academy_id_idx on reviews(academy_id);
create index reviews_user_email_idx on reviews(user_email);
create index reviews_status_idx on reviews(status);
```

- [ ] **Step 3: Row Level Security 정책 설정**

  같은 SQL Editor에서 실행:

```sql
alter table reviews enable row level security;

-- 누구나 approved 후기 읽기 가능
create policy "approved reviews are public"
  on reviews for select
  using (status = 'approved');

-- 로그인 유저는 자신의 모든 후기 읽기 가능 (pending/rejected 포함)
create policy "users read own reviews"
  on reviews for select
  using (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- 로그인 유저는 후기 작성 가능
create policy "users insert reviews"
  on reviews for insert
  with check (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- service_role만 status 변경 가능 (관리자 승인/거부는 service_role key 사용)
```

  > **주의:** 관리자 승인/거부 기능은 `service_role` key를 사용한다. 이 키는 절대 프론트엔드에 노출하지 않는다. 관리자 기능은 별도 환경변수나 운영 콘솔에서 처리한다. MVP에서는 Supabase 대시보드 Table Editor에서 직접 status를 변경한다.

- [ ] **Step 4: Storage 버킷 생성**

  Supabase 대시보드 > Storage > "New bucket":
  - Name: `receipts`
  - Public: **OFF** (비공개)
  - File size limit: 10MB

  버킷 생성 후 Policies에서:
```sql
-- 로그인 유저는 자신의 경로에만 업로드 가능
create policy "users upload own receipts"
  on storage.objects for insert
  with check (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = current_setting('request.jwt.claims', true)::json->>'email'
  );
```

- [ ] **Step 5: schema.sql 저장**

```sql
-- supabase/schema.sql
-- 위 Step 2~4의 SQL을 그대로 붙여넣어 저장
```

- [ ] **Step 6: 커밋**

```bash
cd kids
git add ../supabase/schema.sql
git commit -m "feat: Supabase reviews 스키마 추가"
```

---

## Task 2: Supabase SDK 로드 및 클라이언트 초기화

**Files:**
- Modify: `kids/index.html` — `<head>` SDK 스크립트 태그 + 전역 초기화 JS

- [ ] **Step 1: `<head>` 안에 Supabase SDK CDN 추가**

  `kids/index.html`에서 `</head>` 바로 앞에 추가:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
```

- [ ] **Step 2: 전역 Supabase 클라이언트 초기화 JS 추가**

  index.html에서 `var _urUser = null;` 선언 근처(전역 변수 블록) 바로 아래에 추가:

```js
// Supabase 클라이언트 — Task 1에서 메모한 값으로 교체
var _SB_URL  = 'https://YOUR_PROJECT.supabase.co';
var _SB_ANON = 'YOUR_ANON_KEY';
var _sbClient = null;
function sbClient() {
  if (!_sbClient) _sbClient = supabase.createClient(_SB_URL, _SB_ANON);
  return _sbClient;
}
```

- [ ] **Step 3: 브라우저 콘솔에서 동작 확인**

  index.html을 로컬에서 열고 DevTools Console에:
  ```js
  sbClient().from('reviews').select('id').limit(1).then(console.log)
  ```
  Expected: `{ data: [], error: null }` (빈 배열, 에러 없음)

- [ ] **Step 4: 커밋**

```bash
git add index.html
git commit -m "feat: Supabase SDK 로드 및 클라이언트 초기화"
```

---

## Task 3: 하단 네비 탭 4개로 확장

**Files:**
- Modify: `kids/index.html` — 탭 HTML, CSS, `userShowTab()` JS

현재 탭 구조: 검색(0) / 스케줄(1) / MY(2)  
변경 후: 검색(0) / 스케줄(1) / 후기(2) / MY(3)

- [ ] **Step 1: 탭 버튼 HTML 수정**

  `kids/index.html`에서 기존 탭 버튼 블록을 찾아 교체:

  기존:
  ```html
  <button class="ur-tab active" id="urTab0" onclick="userShowTab(0)">...</button>
  <button class="ur-tab" id="urTab1" onclick="userShowTab(1)">...</button>
  <button class="ur-tab" id="urTab2" onclick="userShowTab(2)">...</button>
  ```

  변경 후 (후기 탭을 2번으로 삽입, MY는 3번으로):
  ```html
  <button class="ur-tab active" id="urTab0" onclick="userShowTab(0)">
    <!-- 기존 검색 탭 내용 그대로 -->
  </button>
  <button class="ur-tab" id="urTab1" onclick="userShowTab(1)">
    <!-- 기존 스케줄 탭 내용 그대로 -->
  </button>
  <button class="ur-tab" id="urTab2" onclick="userShowTab(2)">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
    <span>후기</span>
  </button>
  <button class="ur-tab" id="urTab3" onclick="userShowTab(3)">
    <!-- 기존 MY 탭 내용 그대로 -->
  </button>
  ```

- [ ] **Step 2: `userShowTab()` 함수 수정**

  기존:
  ```js
  function userShowTab(idx) {
    var pages = ['urPageSearch','urPageSchedule','urPageMyInfo'];
    pages.forEach(function(id, i) {
      var el = document.getElementById(id);
      if (el) el.classList.toggle('active', i === idx);
    });
    for (var i = 0; i < 3; i++) { ... }
    if (idx === 0) { ... }
    if (idx === 1) urRenderSchedule();
    if (idx === 2) urRenderMyInfo();
  }
  ```

  변경 후:
  ```js
  function userShowTab(idx) {
    var pages = ['urPageSearch','urPageSchedule','urPageReviews','urPageMyInfo'];
    pages.forEach(function(id, i) {
      var el = document.getElementById(id);
      if (el) el.classList.toggle('active', i === idx);
    });
    for (var i = 0; i < 4; i++) {
      var tab = document.getElementById('urTab' + i);
      if (tab) tab.classList.toggle('active', i === idx);
    }
    var content = document.getElementById('urContent');
    if (content) content.scrollTop = 0;
    if (idx === 0) {
      urRenderAcademies();
      urRenderSubjectGrid();
      urRenderHomePromo();
      urAutoLocate();
    }
    if (idx === 1) urRenderSchedule();
    if (idx === 2) rvRenderFeed();
    if (idx === 3) urRenderMyInfo();
  }
  ```

- [ ] **Step 3: 후기 탭 페이지 컨테이너 HTML 추가**

  `kids/index.html`에서 `<div id="urPageMyInfo"` 바로 앞에 추가:

  ```html
  <div id="urPageReviews" class="ur-page">
    <div id="rvFeedWrap"></div>
  </div>
  ```

- [ ] **Step 4: 동작 확인**

  브라우저에서 앱을 열고 하단 탭이 4개인지 확인. "후기" 탭 클릭 시 빈 화면으로 전환되면 정상.

- [ ] **Step 5: 커밋**

```bash
git add index.html
git commit -m "feat: 하단 네비 후기 탭 추가 (4번째 탭)"
```

---

## Task 4: 후기 피드 UI + 데이터 로딩

**Files:**
- Modify: `kids/index.html` — CSS (`.rv-*`), JS (`rvRenderFeed`, `rvLoadFeed`)

- [ ] **Step 1: 후기 피드 CSS 추가**

  기존 `.ur-tab` CSS 블록 근처에 추가:

```css
/* ── 후기 피드 ── */
.rv-toolbar { display: flex; align-items: center; gap: 8px; padding: 12px 16px 8px; border-bottom: 1px solid #F3F4F6; }
.rv-toggle { font-size: 12px; padding: 4px 10px; border-radius: 100px; border: 1px solid #E5E7EB; background: #fff; color: #6B7280; cursor: pointer; transition: background .15s; }
.rv-toggle.active { background: #FFF3EC; border-color: #F97316; color: #F97316; font-weight: 600; }
.rv-card { padding: 14px 16px; border-bottom: 1px solid #F3F4F6; }
.rv-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.rv-card-name { font-size: 14px; font-weight: 700; color: #1A1A1A; }
.rv-stars { color: #F59E0B; font-size: 13px; letter-spacing: 1px; }
.rv-body { font-size: 13px; color: #4B5563; line-height: 1.6; margin: 4px 0; }
.rv-meta { font-size: 11px; color: #9CA3AF; display: flex; justify-content: space-between; }
.rv-empty { text-align: center; padding: 60px 24px; color: #9CA3AF; font-size: 14px; }
.rv-write-btn { margin: 12px 16px 0; display: block; width: calc(100% - 32px); padding: 10px; background: #F97316; color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; box-sizing: border-box; }
```

- [ ] **Step 2: `rvRenderFeed()` JS 함수 추가**

  `userShowTab` 함수 아래에 추가:

```js
var _rvWishOnly = false;

function rvRenderFeed() {
  var wrap = document.getElementById('rvFeedWrap');
  if (!wrap) return;
  wrap.innerHTML = '<div class="rv-empty">불러오는 중...</div>';
  rvLoadFeed();
}

function rvLoadFeed() {
  var query = sbClient()
    .from('reviews')
    .select('id, academy_id, user_email, rating, body, created_at')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(50);

  query.then(function(res) {
    var wrap = document.getElementById('rvFeedWrap');
    if (!wrap) return;
    if (res.error) {
      wrap.innerHTML = '<div class="rv-empty">후기를 불러오지 못했어요.</div>';
      return;
    }
    var rows = res.data || [];
    if (_rvWishOnly) {
      var wished = urGetWishlist();
      rows = rows.filter(function(r) { return wished.indexOf(r.academy_id) >= 0; });
    }
    var toolbar = '<div class="rv-toolbar">'
      + '<button class="rv-toggle' + (_rvWishOnly ? '' : ' active') + '" onclick="rvSetWishFilter(false)">전체</button>'
      + '<button class="rv-toggle' + (_rvWishOnly ? ' active' : '') + '" onclick="rvSetWishFilter(true)">★ 찜한 학원만</button>'
      + '</div>';
    if (rows.length === 0) {
      wrap.innerHTML = toolbar + '<div class="rv-empty">아직 후기가 없어요.</div>';
    } else {
      var cards = rows.map(function(r) {
        var ac = (window.KR_SYNC ? KR_SYNC.getMergedAcademies() : (window.UR_ACADEMIES || [])).find(function(a) { return a.id === r.academy_id; });
        var acName = ac ? ac.name : '학원 #' + r.academy_id;
        var stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
        var region = r.user_email ? (r.user_email.split('@')[0].slice(0, 2) + '** 학부모') : '학부모';
        var date = new Date(r.created_at);
        var dateStr = (date.getMonth()+1) + '/' + date.getDate();
        return '<div class="rv-card">'
          + '<div class="rv-card-top"><span class="rv-card-name">' + acName + '</span><span class="rv-stars">' + stars + '</span></div>'
          + '<div class="rv-body">' + r.body.slice(0, 80) + (r.body.length > 80 ? '...' : '') + '</div>'
          + '<div class="rv-meta"><span>' + region + '</span><span>' + dateStr + '</span></div>'
          + '</div>';
      }).join('');
      wrap.innerHTML = toolbar + cards;
    }
    if (_urUser) {
      wrap.innerHTML += '<button class="rv-write-btn" onclick="rvOpenAcademyPicker()">+ 후기 쓰기</button>';
    }
  });
}

function rvSetWishFilter(wishOnly) {
  _rvWishOnly = wishOnly;
  rvLoadFeed();
}
```

- [ ] **Step 3: 동작 확인**

  브라우저에서 후기 탭을 클릭하면 "아직 후기가 없어요." 또는 Supabase에서 데이터가 로드되면 카드 목록이 표시된다. 콘솔 에러가 없어야 한다.

- [ ] **Step 4: 커밋**

```bash
git add index.html
git commit -m "feat: 후기 피드 탭 UI 및 Supabase 데이터 로딩"
```

---

## Task 5: 학원 카드 바텀시트 후기 섹션

**Files:**
- Modify: `kids/index.html` — 바텀시트 렌더 함수에 후기 섹션 추가

- [ ] **Step 1: 바텀시트 후기 섹션 CSS 추가**

```css
/* 학원 카드 바텀시트 후기 섹션 */
.rv-sheet-wrap { padding: 12px 16px 0; border-top: 1px solid #F3F4F6; margin-top: 12px; }
.rv-sheet-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.rv-sheet-title { font-size: 14px; font-weight: 700; color: #1A1A1A; }
.rv-sheet-avg { font-size: 13px; color: #F59E0B; }
.rv-sheet-card { background: #F9FAFB; border-radius: 8px; padding: 8px 10px; margin-bottom: 6px; }
.rv-sheet-card-stars { font-size: 11px; color: #F59E0B; margin-bottom: 2px; }
.rv-sheet-card-body { font-size: 12px; color: #4B5563; line-height: 1.5; }
.rv-sheet-card-meta { font-size: 10px; color: #9CA3AF; margin-top: 3px; }
.rv-sheet-more { font-size: 12px; color: #F97316; cursor: pointer; margin-top: 4px; display: inline-block; }
.rv-sheet-write { margin-top: 8px; width: 100%; padding: 8px; background: #FFF3EC; color: #F97316; border: 1px solid #F97316; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
```

- [ ] **Step 2: `rvLoadSheetReviews(academyId, containerEl)` 함수 추가**

```js
function rvLoadSheetReviews(academyId, containerEl) {
  sbClient()
    .from('reviews')
    .select('rating, body, user_email, created_at')
    .eq('academy_id', academyId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(10)
    .then(function(res) {
      if (res.error || !res.data || res.data.length === 0) {
        containerEl.innerHTML = '<div style="font-size:12px;color:#9CA3AF;padding:8px 0">아직 후기가 없어요.</div>';
        return;
      }
      var rows = res.data;
      var avgRating = rows.reduce(function(s, r) { return s + r.rating; }, 0) / rows.length;
      var header = '<div class="rv-sheet-header">'
        + '<span class="rv-sheet-title">후기 ' + rows.length + '건</span>'
        + '<span class="rv-sheet-avg">★ ' + avgRating.toFixed(1) + '</span>'
        + '</div>';
      var preview = rows.slice(0, 2).map(function(r) {
        var stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
        var region = r.user_email ? (r.user_email.split('@')[0].slice(0, 2) + '** 학부모') : '학부모';
        var date = new Date(r.created_at);
        var dateStr = (date.getMonth()+1) + '/' + date.getDate();
        return '<div class="rv-sheet-card">'
          + '<div class="rv-sheet-card-stars">' + stars + '</div>'
          + '<div class="rv-sheet-card-body">' + r.body.slice(0, 60) + (r.body.length > 60 ? '...' : '') + '</div>'
          + '<div class="rv-sheet-card-meta">' + region + ' · ' + dateStr + '</div>'
          + '</div>';
      }).join('');
      var moreBtn = rows.length > 2
        ? '<span class="rv-sheet-more" onclick="rvShowAllSheetReviews(' + academyId + ', this)">후기 더보기 ▾</span>'
        : '';
      containerEl.innerHTML = header + preview + moreBtn;
      containerEl._allRows = rows;
    });
}

function rvShowAllSheetReviews(academyId, btn) {
  var containerEl = btn.parentElement;
  var rows = containerEl._allRows || [];
  var all = rows.map(function(r) {
    var stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
    var region = r.user_email ? (r.user_email.split('@')[0].slice(0, 2) + '** 학부모') : '학부모';
    var date = new Date(r.created_at);
    var dateStr = (date.getMonth()+1) + '/' + date.getDate();
    return '<div class="rv-sheet-card">'
      + '<div class="rv-sheet-card-stars">' + stars + '</div>'
      + '<div class="rv-sheet-card-body">' + r.body + '</div>'
      + '<div class="rv-sheet-card-meta">' + region + ' · ' + dateStr + '</div>'
      + '</div>';
  }).join('');
  btn.outerHTML = all.slice(rows.slice(0,2).map(function(r){
    return '<div class="rv-sheet-card">'.length;
  }));
  containerEl.querySelector('.rv-sheet-more') && containerEl.querySelector('.rv-sheet-more').remove();
  containerEl.insertAdjacentHTML('beforeend', rows.slice(2).map(function(r) {
    var stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
    var region = r.user_email ? (r.user_email.split('@')[0].slice(0, 2) + '** 학부모') : '학부모';
    var date = new Date(r.created_at);
    var dateStr = (date.getMonth()+1) + '/' + date.getDate();
    return '<div class="rv-sheet-card"><div class="rv-sheet-card-stars">' + stars + '</div><div class="rv-sheet-card-body">' + r.body + '</div><div class="rv-sheet-card-meta">' + region + ' · ' + dateStr + '</div></div>';
  }).join(''));
}
```

- [ ] **Step 3: 바텀시트 렌더 함수에 후기 섹션 삽입**

  기존 학원 상세 바텀시트를 렌더하는 함수(학원 카드 클릭 시 열리는 `sim-card` 또는 바텀시트 렌더 함수)를 찾는다.
  바텀시트 HTML의 마지막 닫는 `</div>` 앞에 아래 코드를 추가한다:

  ```js
  // 바텀시트 HTML 생성 직후:
  var sheetEl = document.getElementById('simSheet'); // 실제 바텀시트 element ID로 교체
  var rvWrap = document.createElement('div');
  rvWrap.className = 'rv-sheet-wrap';
  rvWrap.innerHTML = '<div style="font-size:12px;color:#9CA3AF">후기 로딩 중...</div>';
  // 후기 쓰기 버튼
  var writeBtn = '<button class="rv-sheet-write" onclick="rvOpenWrite(' + academyId + ')">후기 쓰기</button>';
  rvWrap.insertAdjacentHTML('beforeend', writeBtn);
  sheetEl.appendChild(rvWrap);
  rvLoadSheetReviews(academyId, rvWrap);
  ```

  > **참고:** 실제 바텀시트 렌더 함수와 element ID는 코드에서 `simSheet` 또는 유사한 이름을 검색해 확인한다.

- [ ] **Step 4: 동작 확인**

  학원 카드를 클릭해 바텀시트를 열면 하단에 "후기 로딩 중..." 후 "아직 후기가 없어요." 가 표시된다.

- [ ] **Step 5: 커밋**

```bash
git add index.html
git commit -m "feat: 학원 바텀시트 후기 섹션 추가"
```

---

## Task 6: 후기 작성 바텀시트

**Files:**
- Modify: `kids/index.html` — 후기 작성 바텀시트 HTML + CSS + JS

- [ ] **Step 1: 후기 작성 바텀시트 CSS 추가**

```css
/* ── 후기 작성 바텀시트 ── */
.rv-write-overlay { display: none; position: fixed; inset: 0; z-index: 8500; background: rgba(0,0,0,0.45); align-items: flex-end; justify-content: center; }
.rv-write-overlay.open { display: flex; }
.rv-write-sheet { background: #fff; border-radius: 20px 20px 0 0; padding: 20px 20px 32px; width: 100%; max-width: 480px; box-sizing: border-box; }
.rv-write-handle { width: 36px; height: 4px; background: #E5E7EB; border-radius: 2px; margin: 0 auto 16px; }
.rv-write-title { font-size: 16px; font-weight: 700; color: #1A1A1A; margin-bottom: 4px; }
.rv-write-sub { font-size: 12px; color: #9CA3AF; margin-bottom: 16px; }
.rv-star-row { display: flex; gap: 8px; margin-bottom: 16px; }
.rv-star-btn { width: 36px; height: 36px; border-radius: 8px; background: #F3F4F6; border: none; font-size: 20px; cursor: pointer; transition: background .1s; }
.rv-star-btn.on { background: #FFF3EC; }
.rv-write-textarea { width: 100%; height: 100px; border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 12px; font-size: 13px; resize: none; box-sizing: border-box; outline: none; }
.rv-char-count { font-size: 11px; color: #9CA3AF; text-align: right; margin: 4px 0 12px; }
.rv-upload-label { display: flex; align-items: center; gap: 8px; border: 1.5px dashed #E5E7EB; border-radius: 10px; padding: 12px; cursor: pointer; margin-bottom: 16px; }
.rv-upload-label span { font-size: 13px; color: #6B7280; }
.rv-upload-preview { max-width: 100%; max-height: 120px; border-radius: 8px; display: none; margin-bottom: 12px; }
.rv-submit-btn { width: 100%; padding: 13px; background: #F97316; color: #fff; border: none; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; }
.rv-submit-btn:disabled { background: #D1D5DB; cursor: not-allowed; }
```

- [ ] **Step 2: 후기 작성 바텀시트 HTML 추가**

  `</body>` 태그 바로 앞에 추가:

```html
<!-- 후기 작성 바텀시트 -->
<div class="rv-write-overlay" id="rvWriteOverlay">
  <div class="rv-write-sheet">
    <div class="rv-write-handle"></div>
    <div class="rv-write-title" id="rvWriteAcName">학원 이름</div>
    <div class="rv-write-sub">실제 수강 경험을 솔직하게 작성해 주세요</div>

    <div class="rv-star-row" id="rvStarRow">
      <button class="rv-star-btn" data-v="1" onclick="rvSetRating(1)">★</button>
      <button class="rv-star-btn" data-v="2" onclick="rvSetRating(2)">★</button>
      <button class="rv-star-btn" data-v="3" onclick="rvSetRating(3)">★</button>
      <button class="rv-star-btn" data-v="4" onclick="rvSetRating(4)">★</button>
      <button class="rv-star-btn" data-v="5" onclick="rvSetRating(5)">★</button>
    </div>

    <textarea class="rv-write-textarea" id="rvBodyInput" placeholder="최소 20자 이상 작성해 주세요" oninput="rvOnBodyInput()"></textarea>
    <div class="rv-char-count"><span id="rvCharCount">0</span> / 20자 이상</div>

    <label class="rv-upload-label" for="rvReceiptFile">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
      <span id="rvUploadLabel">영수증 / 이체내역 사진 첨부 (필수, 10MB 이하)</span>
    </label>
    <input type="file" id="rvReceiptFile" accept="image/*" style="display:none" onchange="rvOnFileChange(this)">
    <img id="rvUploadPreview" class="rv-upload-preview">

    <button class="rv-submit-btn" id="rvSubmitBtn" onclick="rvSubmit()" disabled>제출하기</button>
  </div>
</div>
```

- [ ] **Step 3: 후기 작성 JS 함수 추가**

```js
var _rvWriteAcId = null;
var _rvRating = 0;

function rvOpenWrite(academyId) {
  if (!_urUser) { showToast('로그인이 필요해요.'); return; }
  _rvWriteAcId = academyId;
  _rvRating = 0;
  document.getElementById('rvBodyInput').value = '';
  document.getElementById('rvCharCount').textContent = '0';
  document.getElementById('rvReceiptFile').value = '';
  document.getElementById('rvUploadPreview').style.display = 'none';
  document.getElementById('rvUploadLabel').textContent = '영수증 / 이체내역 사진 첨부 (필수, 10MB 이하)';
  document.getElementById('rvSubmitBtn').disabled = true;
  Array.prototype.forEach.call(document.querySelectorAll('.rv-star-btn'), function(b) { b.classList.remove('on'); });

  var acs = window.KR_SYNC ? KR_SYNC.getMergedAcademies() : (window.UR_ACADEMIES || []);
  var ac = acs.find(function(a) { return a.id === academyId; });
  document.getElementById('rvWriteAcName').textContent = ac ? ac.name : '학원 후기';
  document.getElementById('rvWriteOverlay').classList.add('open');
}

function rvCloseWrite() {
  document.getElementById('rvWriteOverlay').classList.remove('open');
}

function rvSetRating(v) {
  _rvRating = v;
  Array.prototype.forEach.call(document.querySelectorAll('.rv-star-btn'), function(b) {
    b.classList.toggle('on', parseInt(b.dataset.v) <= v);
  });
  rvCheckSubmitReady();
}

function rvOnBodyInput() {
  var len = document.getElementById('rvBodyInput').value.length;
  document.getElementById('rvCharCount').textContent = len;
  rvCheckSubmitReady();
}

function rvOnFileChange(input) {
  var file = input.files[0];
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) { showToast('10MB 이하 파일만 첨부 가능해요.'); input.value = ''; return; }
  document.getElementById('rvUploadLabel').textContent = file.name;
  var preview = document.getElementById('rvUploadPreview');
  preview.src = URL.createObjectURL(file);
  preview.style.display = 'block';
  rvCheckSubmitReady();
}

function rvCheckSubmitReady() {
  var bodyOk = document.getElementById('rvBodyInput').value.length >= 20;
  var fileOk = !!document.getElementById('rvReceiptFile').files[0];
  var ratingOk = _rvRating > 0;
  document.getElementById('rvSubmitBtn').disabled = !(bodyOk && fileOk && ratingOk);
}

function rvSubmit() {
  var btn = document.getElementById('rvSubmitBtn');
  btn.disabled = true;
  btn.textContent = '제출 중...';
  var file = document.getElementById('rvReceiptFile').files[0];
  var body = document.getElementById('rvBodyInput').value.trim();
  var email = _urUser.email;
  var reviewId = 'rv_' + Date.now();
  var path = email + '/' + reviewId + '.' + file.name.split('.').pop();

  sbClient().storage.from('receipts').upload(path, file, { upsert: false })
    .then(function(uploadRes) {
      if (uploadRes.error) throw uploadRes.error;
      var receiptUrl = sbClient().storage.from('receipts').getPublicUrl(path).data.publicUrl;
      return sbClient().from('reviews').insert({
        academy_id: _rvWriteAcId,
        user_email: email,
        rating: _rvRating,
        body: body,
        receipt_url: receiptUrl,
        status: 'pending'
      });
    })
    .then(function(insertRes) {
      if (insertRes.error) throw insertRes.error;
      rvCloseWrite();
      showToast('검토 중이에요. 승인 후 게시돼요.');
    })
    .catch(function(err) {
      console.error('후기 제출 오류:', err);
      showToast('제출에 실패했어요. 다시 시도해 주세요.');
      btn.disabled = false;
      btn.textContent = '제출하기';
    });
}

function rvOpenAcademyPicker() {
  showToast('학원 카드를 탭해 후기를 작성하세요.');
  userShowTab(0);
}
```

- [ ] **Step 4: 오버레이 배경 클릭 시 닫기 처리**

  `rvWriteOverlay` 엘리먼트에 클릭 핸들러 추가 (HTML의 div에 직접):
  ```html
  <div class="rv-write-overlay" id="rvWriteOverlay" onclick="if(event.target===this)rvCloseWrite()">
  ```

- [ ] **Step 5: 동작 확인**

  1. 학원 카드 바텀시트 > "후기 쓰기" 클릭 → 작성 바텀시트 열림
  2. 별점 4개 클릭 → 4개 버튼 하이라이트
  3. 20자 미만 텍스트 입력 → "제출하기" 버튼 비활성
  4. 20자 이상 + 파일 첨부 → "제출하기" 버튼 활성
  5. 제출 → 토스트 "검토 중이에요." 표시
  6. Supabase Table Editor에서 `reviews` 테이블에 `status: pending` 행 확인

- [ ] **Step 6: 커밋**

```bash
git add index.html
git commit -m "feat: 후기 작성 바텀시트 구현 (별점 + 텍스트 + 영수증 업로드)"
```

---

## Task 7: 관리자 대시보드 후기 승인 탭

**Files:**
- Modify: `kids/index.html` — Admin 대시보드 네비 + 후기 승인 페이지 HTML + JS

> **MVP 제약:** 관리자는 Supabase `service_role` key가 필요하므로, MVP에서는 Supabase 대시보드 Table Editor에서 직접 `status`를 변경한다. 이 Task는 관리자가 `status`를 변경한 후 변경 내용을 앱 UI에서 확인하는 뷰를 제공한다. 실제 승인 버튼은 Supabase 대시보드 URL로 이동시킨다.

- [ ] **Step 1: Admin 대시보드 네비에 후기 승인 탭 추가**

  기존:
  ```html
  <div class="adm-nav-item" onclick="adminShowPage('stats')">통계</div>
  ```
  아래에 추가:
  ```html
  <div class="adm-nav-item" onclick="adminShowPage('reviews')">
    <span>후기 승인</span>
  </div>
  ```

- [ ] **Step 2: 후기 승인 페이지 CSS 추가**

```css
.rv-adm-card { background: #fff; border: 1px solid #F3F4F6; border-radius: 12px; padding: 14px 16px; margin-bottom: 10px; }
.rv-adm-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.rv-adm-name { font-size: 14px; font-weight: 700; color: #1A1A1A; }
.rv-adm-stars { color: #F59E0B; font-size: 12px; }
.rv-adm-body { font-size: 13px; color: #4B5563; margin-bottom: 8px; line-height: 1.5; }
.rv-adm-meta { font-size: 11px; color: #9CA3AF; margin-bottom: 8px; }
.rv-adm-receipt { max-width: 100%; max-height: 140px; border-radius: 8px; object-fit: cover; display: block; margin-bottom: 8px; cursor: pointer; }
.rv-adm-actions { display: flex; gap: 8px; }
.rv-adm-approve { flex: 1; padding: 8px; background: #ECFDF5; color: #059669; border: 1px solid #6EE7B7; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
.rv-adm-reject { flex: 1; padding: 8px; background: #FEF2F2; color: #DC2626; border: 1px solid #FCA5A5; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
.rv-adm-badge { display: inline-block; font-size: 11px; padding: 2px 8px; border-radius: 100px; font-weight: 600; }
.rv-adm-badge.pending { background: #FEF3C7; color: #D97706; }
.rv-adm-badge.approved { background: #ECFDF5; color: #059669; }
.rv-adm-badge.rejected { background: #FEF2F2; color: #DC2626; }
```

- [ ] **Step 3: 후기 승인 페이지 렌더 함수 추가**

```js
function rvAdmRenderPage() {
  var wrap = document.getElementById('admReviewsPage');
  if (!wrap) return;
  wrap.innerHTML = '<div style="padding:20px;color:#9CA3AF">불러오는 중...</div>';
  sbClient()
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)
    .then(function(res) {
      if (res.error) { wrap.innerHTML = '<div style="padding:20px;color:#EF4444">오류: ' + res.error.message + '</div>'; return; }
      var rows = res.data || [];
      if (rows.length === 0) { wrap.innerHTML = '<div style="padding:20px;color:#9CA3AF">후기가 없어요.</div>'; return; }
      var acs = window.KR_SYNC ? KR_SYNC.getMergedAcademies() : (window.UR_ACADEMIES || []);
      wrap.innerHTML = rows.map(function(r) {
        var ac = acs.find(function(a) { return a.id === r.academy_id; });
        var acName = ac ? ac.name : '학원 #' + r.academy_id;
        var stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
        var badgeClass = r.status === 'approved' ? 'approved' : (r.status === 'rejected' ? 'rejected' : 'pending');
        var badgeLabel = r.status === 'approved' ? '승인됨' : (r.status === 'rejected' ? '거부됨' : '대기중');
        var rejectSel = r.status === 'pending'
          ? '<select id="rvRejectReason_' + r.id + '" style="font-size:12px;border:1px solid #E5E7EB;border-radius:6px;padding:3px 6px;margin-right:6px">'
            + '<option value="영수증 불명확">영수증 불명확</option>'
            + '<option value="관련 없는 학원">관련 없는 학원</option>'
            + '<option value="부적절한 내용">부적절한 내용</option>'
            + '</select>'
          : '';
        var actions = r.status === 'pending'
          ? '<div class="rv-adm-actions">'
            + '<button class="rv-adm-approve" onclick="rvAdmApprove(\'' + r.id + '\',\'' + r.user_email + '\')">승인</button>'
            + rejectSel
            + '<button class="rv-adm-reject" onclick="rvAdmReject(\'' + r.id + '\',\'' + r.user_email + '\')">거부</button>'
            + '</div>'
          : '';
        return '<div class="rv-adm-card">'
          + '<div class="rv-adm-top"><span class="rv-adm-name">' + acName + '</span>'
          + '<span class="rv-adm-badge ' + badgeClass + '">' + badgeLabel + '</span></div>'
          + '<div class="rv-adm-stars">' + stars + '</div>'
          + '<div class="rv-adm-meta">' + r.user_email + ' · ' + new Date(r.created_at).toLocaleDateString('ko') + '</div>'
          + '<div class="rv-adm-body">' + r.body + '</div>'
          + '<img class="rv-adm-receipt" src="' + r.receipt_url + '" onclick="window.open(this.src)" alt="영수증">'
          + actions
          + '</div>';
      }).join('');
    });
}

function rvAdmApprove(reviewId, userEmail) {
  sbClient()
    .from('reviews')
    .update({ status: 'approved', approved_at: new Date().toISOString() })
    .eq('id', reviewId)
    .then(function(res) {
      if (res.error) { showToast('승인 실패: ' + res.error.message); return; }
      urAddNotificationForEmail(userEmail, { type: 'review_approved', message: '후기가 게시됐어요! ⭐' });
      showToast('승인 완료');
      rvAdmRenderPage();
    });
}

function rvAdmReject(reviewId, userEmail) {
  var sel = document.getElementById('rvRejectReason_' + reviewId);
  var reason = sel ? sel.value : '영수증 불명확';
  sbClient()
    .from('reviews')
    .update({ status: 'rejected', reject_reason: reason })
    .eq('id', reviewId)
    .then(function(res) {
      if (res.error) { showToast('거부 실패: ' + res.error.message); return; }
      urAddNotificationForEmail(userEmail, { type: 'review_rejected', message: '후기 검토 결과를 확인하세요. (' + reason + ')' });
      showToast('거부 처리 완료');
      rvAdmRenderPage();
    });
}
```

  > **주의:** `rvAdmApprove/Reject`에서 Supabase RLS 정책이 `service_role`만 `status` 수정을 허용하게 설정했다면, 이 함수는 RLS 오류를 반환한다. MVP에서는 RLS에서 관리자 이메일 조건을 추가하거나, 임시로 해당 update 정책을 열어둔다:
  ```sql
  create policy "admin update reviews"
    on reviews for update
    using (current_setting('request.jwt.claims', true)::json->>'email' = 'davegpt25@gmail.com');
  ```

- [ ] **Step 4: 후기 승인 페이지 HTML 컨테이너 추가**

  Admin 대시보드의 기존 페이지 컨테이너 목록 근처에 추가:
  ```html
  <div id="admReviewsPage" class="adm-page" style="display:none; padding: 16px;"></div>
  ```

- [ ] **Step 5: `adminShowPage()` 함수에 reviews 케이스 추가**

  기존 `adminShowPage` 함수 내부에:
  ```js
  if (page === 'reviews') { rvAdmRenderPage(); }
  ```

- [ ] **Step 6: 동작 확인**

  관리자로 로그인 후 Admin 대시보드 > "후기 승인" 탭 클릭 → 대기 중인 후기 목록 확인. 승인 버튼 클릭 → Supabase Table Editor에서 `status: approved` 변경 확인.

- [ ] **Step 7: 커밋**

```bash
git add index.html
git commit -m "feat: 관리자 대시보드 후기 승인 탭 추가"
```

---

## Task 8: Realtime 구독 → 인앱 알림

**Files:**
- Modify: `kids/index.html` — Supabase Realtime 구독 JS

- [ ] **Step 1: Supabase Realtime 구독 활성화 (Supabase 대시보드)**

  Supabase 대시보드 > Database > Replication에서 `reviews` 테이블의 `UPDATE` 이벤트를 활성화한다.

- [ ] **Step 2: Realtime 구독 함수 추가**

  `_rsEnterParent()` 또는 `showUserDashboard()` 함수 내부에 아래 호출 추가:

```js
function rvSubscribeRealtime() {
  if (!_urUser || !_urUser.email) return;
  var email = _urUser.email;
  sbClient()
    .channel('review-status-' + email)
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'reviews', filter: 'user_email=eq.' + email },
      function(payload) {
        var newRow = payload.new;
        if (newRow.status === 'approved') {
          urAddNotification({ type: 'review_approved', message: '후기가 게시됐어요! ⭐' });
        } else if (newRow.status === 'rejected') {
          urAddNotification({ type: 'review_rejected', message: '후기 검토 결과를 확인하세요. (' + (newRow.reject_reason || '') + ')' });
        }
      }
    )
    .subscribe();
}
```

- [ ] **Step 3: `_rsEnterParent()` 에 구독 호출 추가**

  기존:
  ```js
  function _rsEnterParent() {
    ...
    urUpdateBellDot();
    userShowTab(0);
    ...
  }
  ```

  변경 후:
  ```js
  function _rsEnterParent() {
    ...
    urUpdateBellDot();
    userShowTab(0);
    rvSubscribeRealtime();
    ...
  }
  ```

- [ ] **Step 4: 동작 확인**

  1. 학부모로 로그인 → DevTools Network 탭에서 Supabase Realtime WebSocket 연결 확인 (`wss://...supabase.co/realtime/...`)
  2. Supabase Table Editor에서 해당 유저 이메일의 `reviews` 행 `status`를 `approved`로 변경
  3. 앱 벨 아이콘에 주황 점 표시 확인
  4. 벨 클릭 → "후기가 게시됐어요! ⭐" 알림 확인

- [ ] **Step 5: 커밋**

```bash
git add index.html
git commit -m "feat: Supabase Realtime 구독으로 후기 승인/거부 인앱 알림 구현"
```

---

## Task 9: 배포 및 최종 확인

**Files:**
- Modify: `kids/index.html` — 환경 상수 최종 확인

- [ ] **Step 1: Supabase 상수 실제 값으로 교체 확인**

  index.html에서 아래 두 줄이 실제 Supabase 프로젝트 값으로 설정됐는지 확인:
  ```js
  var _SB_URL  = 'https://YOUR_PROJECT.supabase.co'; // 실제 URL로 교체됐는지 확인
  var _SB_ANON = 'YOUR_ANON_KEY';                    // 실제 anon key로 교체됐는지 확인
  ```

- [ ] **Step 2: 전체 흐름 수동 테스트**

  - [ ] 학부모 로그인 → 후기 탭 클릭 → 피드 로드 확인
  - [ ] 학원 카드 탭 → 바텀시트 후기 섹션 확인
  - [ ] "후기 쓰기" → 별점 + 텍스트 + 영수증 첨부 → 제출 → 토스트 확인
  - [ ] Supabase Table Editor에서 `status: approved` 변경 → 후기 탭 피드에 표시 확인
  - [ ] 관리자 로그인 → Admin > 후기 승인 탭 → 승인 버튼 클릭 확인
  - [ ] 학부모 계정 벨 알림 확인

- [ ] **Step 3: gh-pages 배포**

```bash
cd kids
git add index.html
git commit -m "feat: 내돈내산 후기 서비스 전체 구현 완료"
git push origin gh-pages
```

---

## 자기 검토 결과

1. **스펙 커버리지**
   - ✅ 후기 탭 피드 (Task 4)
   - ✅ 찜한 학원만 보기 필터 (Task 4)
   - ✅ 학원 카드 바텀시트 후기 요약 (Task 5)
   - ✅ 후기 쓰기 버튼 + 작성 바텀시트 (Task 6)
   - ✅ 영수증 첨부 + Supabase Storage 업로드 (Task 6)
   - ✅ 관리자 승인/거부 (Task 7)
   - ✅ 거부 사유 3종 (Task 7)
   - ✅ 인앱 알림 (Task 8)

2. **타입 일관성** — `rvLoadSheetReviews`, `rvAdmApprove`, `rvAdmReject`, `rvSubscribeRealtime` 모두 `sbClient()` 호출로 통일됨. `urAddNotificationForEmail` 기존 함수 재활용.

3. **MVP 제약 반영** — 후기 수정/삭제/좋아요/댓글/원장 답글/Web Push 모두 제외됨.
