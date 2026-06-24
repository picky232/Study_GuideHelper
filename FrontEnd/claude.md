# FrontEnd — 학습 설계 도우미

> React(Vite) + PWA. 백엔드 API(Vercel Serverless Functions)만 호출, 인프라(Supabase/Claude/FCM) 직접 접근 금지.

## 기술 스택

| 항목 | 선택 |
|------|------|
| 프레임워크 | React (Vite) |
| 라우팅 | react-router-dom |
| 상태관리 | Context API or Zustand |
| 스타일 | Tailwind CSS |
| 캘린더 | react-calendar or FullCalendar |
| HTTP | axios |
| PWA | vite-plugin-pwa |
| 알림 수신 | firebase (FCM client SDK) |

## DDD 4계층 구조 (클라이언트 변형)

프론트엔드는 DB/HTTP 같은 외부 시스템을 직접 갖지 않으므로, `infrastructure/`는 "백엔드 API 호출 클라이언트"로 한정한다.

```
FrontEnd/
  src/
    domains/                      # 도메인 레이어 — UI/HTTP 의존성 없음, 타입과 순수 로직만
      goal/
        entities/                 # Goal 타입
        valueObjects/             # Deadline, StudyRange
        repositories/             # IGoalRepository.ts (인터페이스)
        useCases/                 # CreateGoal, CalculateDDay
      schedule/
        entities/                 # Task 타입
        valueObjects/             # AchievementRate
        repositories/             # IScheduleRepository.ts
        useCases/                 # ToggleTaskDone, CalculateAchievementRate
      feedback/
        entities/
        repositories/             # IFeedbackRepository.ts
        useCases/                 # GetWeeklyReport
      auth/
        entities/                 # User 타입
        repositories/             # IAuthRepository.ts
        useCases/                 # SignUp, Login, Logout

    infrastructure/                # 인프라 레이어 — 백엔드 API 호출 구현체 (axios)
      api/
        client.ts                 # axios 인스턴스, JWT 헤더 부착
        GoalApiRepository.ts      # implements IGoalRepository → /api/generate 등 호출
        ScheduleApiRepository.ts  # implements IScheduleRepository → /api/schedule 호출
        FeedbackApiRepository.ts  # implements IFeedbackRepository → /api/feedback 호출
        AuthApiRepository.ts      # implements IAuthRepository → /api/auth 호출
      fcm/
        fcmClient.ts              # FCM 토큰 발급, Service Worker 등록
      storage/
        tokenStorage.ts           # JWT localStorage 저장/조회

    presentation/                  # 프레젠테이션 레이어 — UI
      components/
        common/                   # Button, Card, Modal 등 공통 컴포넌트
        home/                     # 대시보드 카드, 달성률 차트, 태스크 체크리스트
        goal/                     # 목표 입력 STEP1~3 폼
        calendar/                 # 월간/주간 뷰, 날짜 상세 팝업
        feedback/                 # 주간 리포트, 차트
        settings/                 # 알림 시간 설정
      hooks/
        useAuth.ts                # AuthRepository 통해 로그인 상태 관리
        useGoal.ts
        useSchedule.ts
        useFeedback.ts
        useFcm.ts

    app/                          # 라우팅 진입점 (Vite + react-router 기준)
      routes.tsx                  # /, /goal/new, /calendar, /feedback, /settings
      pages/
        HomePage.tsx
        GoalNewPage.tsx
        CalendarPage.tsx
        FeedbackPage.tsx
        SettingsPage.tsx
        LoginPage.tsx
        SignupPage.tsx

    types/
      index.ts                    # 공유 타입

  public/
    manifest.json                 # PWA 매니페스트
    firebase-messaging-sw.js      # FCM Service Worker
  .env                            # VITE_API_BASE_URL, VITE_FIREBASE_CONFIG (공개 가능한 값만)
```

## 원칙 (필수)

- `domains/`는 React/axios import 금지 — 순수 타입·인터페이스·로직만
- `infrastructure/api/`가 도메인 Repository 인터페이스 구현, 백엔드 `/api/*` 엔드포인트만 호출
- UI 컴포넌트(`presentation/`)는 도메인 타입만 사용, `infrastructure/` 직접 접근 금지 — 반드시 `hooks/` 경유
- Supabase·Claude·FCM Admin SDK·API Key는 프론트엔드에 절대 포함 금지 (백엔드 전용)
- 기존 함수 시그니처 변경 금지, 수정 전 기존 테스트 통과 확인

## 화면 ↔ 기능 매핑 (plan.md 기준)

| 화면 | 기능 | 주요 작업 |
|------|------|-----------|
| 홈 | F3, F5 | 오늘 태스크 요약, 달성률 차트, AI 코칭 메시지 표시 |
| 목표 입력 | F1 | STEP1~3 폼, 입력값 검증, 저장 후 계획 생성 페이지 이동 |
| 계획 미리보기 | F2 | AI 생성 계획 표시, 수정(추가/삭제/순서변경), 확정 저장 |
| 캘린더 | F3, F6 | 월간/주간 뷰, 날짜별 태스크, 복습 태스크 배지 |
| 피드백 | F5 | 주간 리포트, 달성률 추이 차트, 재조정 제안 버튼 |
| 설정 | F4 | 알림 시간, 공부 가능 시간대, 계정 관리 |

## 프론트 작업 우선순위 (plan.md 일자별 계획 참조)

1. 라우팅·레이아웃 세팅 (6/24)
2. 회원가입/로그인 UI + 보호 라우팅 (6/25)
3. 홈 대시보드 UI (목업 데이터) (6/26)
4. 목표 입력 폼 (6/27)
5. 계획 생성 로딩/미리보기 화면 (6/28)
6. 홈 실데이터 연동 + 완료 체크 (6/29)
7. 캘린더 뷰 (6/30)
8. 복습 태스크 UI 구분 (7/1)
9. FCM 알림 권한·토큰 등록·수신 핸들러 (7/2~7/3)
10. 피드백 페이지 (7/4)
11. PWA 설정 (7/5)
12. 버그 수정·UI 다듬기 (7/6)
