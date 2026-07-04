# 내돈내산 후기 서비스 설계

**날짜:** 2026-07-04  
**프로젝트:** 키즈루트 (kids/index.html)  
**목적:** 실제 수강생 학부모의 인증된 후기를 전 유저와 공유해 앱 신뢰도와 awareness 향상

---

## 1. 서비스 범위

- 학원 카드에 후기 요약 (평균 별점 + 최근 2건 미리보기)
- 하단 네비게이션에 **💬 후기 탭** 추가 — 전체 후기 피드
- 영수증 첨부 기반 실 수강생 인증 후 후기 작성
- 본인 후기 승인/거부 시 인앱 벨 알림

---

## 2. 데이터 저장소

**Supabase** (PostgreSQL + Storage + Realtime)

### reviews 테이블

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid PK | |
| academy_id | int | UR_ACADEMIES id |
| user_email | text | 작성자 이메일 |
| rating | int (1–5) | 별점 |
| body | text | 후기 본문 (최소 20자) |
| receipt_url | text | Supabase Storage 이미지 URL |
| status | enum | pending / approved / rejected |
| reject_reason | text nullable | 거부 사유 |
| created_at | timestamptz | |
| approved_at | timestamptz nullable | |

### Supabase Storage

- 버킷: `receipts` (비공개, 관리자만 접근)
- 업로드 경로: `receipts/{user_email}/{review_id}.jpg`

---

## 3. UI 구조

### 3-1. 후기 탭 (신규)

- 하단 네비에 `💬 후기` 탭 추가
- 피드: 승인된 후기 최신순 카드 목록
  - 학원명 / 별점 / 본문 요약 / 작성일 / 작성자 익명 처리 (예: 강남구 학부모)
- 상단 "찜한 학원만 보기" 토글 (찜 목록 교집합 필터)

### 3-2. 학원 카드 바텀시트 후기 영역

- 평균 별점 + 총 후기 수
- 최근 승인 후기 2건 미리보기
- "후기 더보기" → 해당 학원 후기 전체 목록 (인라인 확장)
- "후기 쓰기" 버튼
  - 인증 완료 유저: 후기 작성 바텀시트 열기
  - 미인증 유저: "영수증 제출 후 이용 가능해요" 안내

### 3-3. 후기 작성 플로우

1. 별점 선택 (★ 1–5)
2. 후기 본문 입력 (최소 20자, 글자 수 카운터 표시)
3. 영수증/이체내역 사진 첨부 (필수, 1장, 10MB 이하)
4. 제출 → `status: pending` 저장
5. 토스트: "검토 중이에요. 승인 후 게시돼요."

---

## 4. 관리자 승인 워크플로우

기존 Admin 대시보드에 **"후기 승인"** 탭 추가

- 대기 중인 후기 목록 표시 (학원명 / 작성자 / 별점 / 본문 / 영수증 이미지)
- **승인** → `status: approved`, `approved_at` 기록 → 작성자 벨 알림 생성
- **거부** → `status: rejected`, `reject_reason` 선택 저장 → 작성자 벨 알림 생성
  - 거부 사유: `영수증 불명확` / `관련 없는 학원` / `부적절한 내용`

---

## 5. 알림

### 트리거
- 본인 후기 **승인** 시 → 벨 알림: "후기가 게시됐어요! ⭐"
- 본인 후기 **거부** 시 → 벨 알림: "후기 검토 결과를 확인하세요."

### 구현
- Supabase Realtime으로 `reviews` 테이블 변경 구독
- `status` 변경 감지 → 로그인된 유저 이메일 매칭 → 기존 `kr_notifications_<email>` localStorage 패턴에 추가

---

## 6. 기술 구현 방향

- **Supabase JS SDK** (`@supabase/supabase-js`) CDN으로 index.html에 로드
- 기존 `_urUser` 인증 세션 재활용 (별도 auth 불필요)
- 영수증 이미지: Supabase Storage presigned URL로 업로드
- 후기 데이터 조회: `supabase.from('reviews').select(...)` — 승인된 것만 프론트에 노출
- 관리자만 전체 status 조회 가능 (Row Level Security로 제어)

---

## 7. MVP 범위 제한

- 후기 수정/삭제 기능 제외 (MVP 이후)
- 후기 좋아요/댓글 제외
- 원장의 후기 답글 제외
- 푸시 알림(Web Push) 제외 — 인앱 벨만
