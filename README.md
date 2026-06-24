# 학습 설계 도우미 (Study GuideHelper)

목표를 입력하면 AI(Claude API)가 마감일까지 맞춤형 학습 계획을 자동으로 설계해주는 PWA 설치형 웹앱.

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 목적 | 목표 입력 시 AI가 마감일까지 맞춤형 학습 계획 자동 설계 |
| 형태 | PWA (설치형 웹앱) |
| 핵심 엔진 | Claude API |
| 개발 기간 | 2026-06-24 ~ 2026-07-07 (14일) |
| 배포 | Vercel |

## 기술 스택

| 영역 | 선택 | 비고 |
|------|------|------|
| 프론트엔드 | React (Vite) + PWA | 설치형 웹앱 |
| 백엔드 | Vercel Serverless Functions (`/api`) | Sleep 없음, 무료 |
| DB | Supabase (PostgreSQL) | 인증 내장, RLS 적용 |
| AI | Claude API | 계획 생성·재조정, 피드백 메시지 |
| 알림 | Vercel Cron + Firebase FCM | 정시 푸시 알림 |
| 배포 | Vercel | 프론트+백엔드+Cron 통합 |

## 시스템 아키텍처

```
[사용자 PWA (React)]
        ↕ REST API
[Vercel Serverless Functions]
    ├── /api/auth          → 회원가입 / 로그인 (JWT)
    ├── /api/generate      → Claude API 호출 → 계획 생성·재조정
    ├── /api/schedule      → 일정 CRUD
    ├── /api/feedback      → Claude API → 피드백 메시지
    └── /api/notify        → FCM 푸시 발송

[Vercel Cron Job] → 매일 지정 시간 /api/notify 실행
        ↓
[Firebase FCM] → 사용자 기기 푸시 알림

[Supabase PostgreSQL]
    ├── users       (사용자 정보)
    ├── goals       (목표 정보)
    ├── schedules   (일자별 학습 태스크)
    └── reviews     (복습 사이클 일정)
```

## 핵심 기능

| 기능 | 설명 |
|------|------|
| F1 목표 설정 | 과목·시험일·하루 공부시간·학습 범위·현재 수준 입력 |
| F2 AI 계획 생성·재조정 | Claude API → 일자별 태스크 자동 분배, 미완료 시 잔여 일정 재조정 |
| F3 캘린더·완료 체크 | 월간/주간 캘린더, 완료 체크, 달성률·진행률 시각화 |
| F4 푸시 알림 | FCM 토큰 등록, Cron 정시 리마인더, 미수행 시 재알림 |
| F5 학습 피드백 | 달성률 기반 AI 코칭 메시지, 주간 리포트, 계획 재조정 제안 |
| F6 복습 사이클 | 망각 곡선(1·3·7·14일) 기반 복습 태스크 자동 삽입 |

## 폴더 구조

```
Study_GuideHelper/
  plan.md          # 14일 일자별 상세 개발 계획
  README.md        # 이 파일 — 프로젝트 전체 개요
  BackEnd/
    claude.md       # 백엔드 DDD 구조·작업 가이드
    src/
      domains/        # 비즈니스 로직 (user, goal, schedule, feedback, notification)
      infrastructure/ # Supabase, Claude API, FCM 구현체
      api/             # Vercel Serverless Functions 진입점
  FrontEnd/
    claude.md       # 프론트엔드 DDD 구조·작업 가이드
    src/
      domains/        # 도메인 타입·순수 로직
      infrastructure/ # 백엔드 API 호출 클라이언트
      presentation/   # React 컴포넌트, 훅
      app/             # 라우팅, 페이지
```

자세한 구조와 레이어별 원칙은 `BackEnd/claude.md`, `FrontEnd/claude.md` 참고.

## 실행 방법

> 각 폴더 세팅 진행 중. 세팅 완료 시 아래 갱신.

```bash
# 프론트엔드
cd FrontEnd
npm install
npm run dev

# 백엔드 (Vercel CLI 기준)
cd BackEnd
vercel dev
```

환경변수: Supabase URL/Key, Claude API Key, FCM Key는 `BackEnd/.env`에만 설정 (서버 전용, 클라이언트 노출 금지). 프론트엔드는 `FrontEnd/.env`에 `VITE_API_BASE_URL` 등 공개 가능한 값만 설정.

## 개발 진행 상황

> plan.md 일자별 계획 기준. 작업 완료 시 체크.

- [ ] 6/24 — 프로젝트 초기 세팅 (Vite, 폴더 구조, 라이브러리, Vercel 연결)
- [ ] 6/25 — Supabase 인증 + DB 스키마
- [ ] 6/26 — 홈 대시보드 UI (목업 데이터)
- [ ] 6/27 — 목표 입력 UI (F1)
- [ ] 6/28 — Claude API 연동 + 계획 생성 (F2)
- [ ] 6/29 — 계획 재조정 + 홈 데이터 연동 (F2)
- [ ] 6/30 — 캘린더 뷰 구현 (F3)
- [ ] 7/1 — 복습 사이클 구현 (F6)
- [ ] 7/2 — FCM 푸시 알림 세팅 (F4)
- [ ] 7/3 — Vercel Cron + 알림 자동화 (F4)
- [ ] 7/4 — AI 학습 피드백 (F5)
- [ ] 7/5 — PWA 설정 + 통합 테스트 1
- [ ] 7/6 — 버그 수정 + UI 다듬기
- [ ] 7/7 — 최종 테스트 + 배포 마무리

상세 체크리스트는 `plan.md` 참고.

## 비용 구조

| 서비스 | 플랜 | 비용 |
|--------|------|------|
| Vercel | 무료 | $0 |
| Supabase | 무료 | $0 |
| Firebase FCM | 무료 | $0 |
| Claude API | 사용량 기반 | 소량 과금 |
| **합계** | | **거의 $0** |

## 핵심 지표 (완료 기준)

| 지표 | 목표 |
|------|------|
| 계획 생성 완료율 | 목표 입력 후 AI 계획 생성 성공률 95% 이상 |
| 일일 체크율 | 사용자 테스트 기준 태스크 완료 체크 동작 100% |
| 알림 수신율 | Cron 실행 후 FCM 발송 성공률 95% 이상 |
| PWA 설치 | iOS·Android 홈 화면 설치 정상 동작 |
