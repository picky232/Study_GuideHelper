# BackEnd — 학습 설계 도우미

> Vercel Serverless Functions 기반 백엔드. plan.md F1~F6 기능 구현.

## 기술 스택

| 항목 | 선택 |
|------|------|
| 런타임 | Vercel Serverless Functions (Node.js) |
| DB | Supabase (PostgreSQL) |
| AI | Claude API |
| 알림 | Firebase FCM (Admin SDK) |
| 스케줄러 | Vercel Cron |

## DDD 4계층 구조

```
BackEnd/
  src/
    domains/                      # 도메인 레이어 — 외부 의존성 없음, 비즈니스 규칙만
      user/
        entities/                 # User 엔티티
        valueObjects/             # Email, NotifyTime 등 불변 값 객체
        repositories/             # IUserRepository.ts (인터페이스만)
        useCases/                 # SignUp, Login 등
      goal/
        entities/                 # Goal 엔티티
        valueObjects/             # Deadline, StudyRange, CurrentLevel
        repositories/             # IGoalRepository.ts
        useCases/                 # CreateGoal, GetGoal
      schedule/
        entities/                 # Schedule(Task) 엔티티
        valueObjects/             # DurationMin, ReviewRound
        repositories/             # IScheduleRepository.ts
        useCases/                 # GeneratePlan, RegeneratePlan, ToggleTaskDone,
                                   # InsertReviewCycle (망각곡선 1·3·7·14일)
      feedback/
        entities/                 # FeedbackReport 엔티티
        valueObjects/             # AchievementRate
        repositories/             # IFeedbackRepository.ts (선택, 영속 필요시)
        useCases/                 # GenerateCoachingMessage, GenerateWeeklyReport
      notification/
        entities/                 # FcmToken 엔티티
        valueObjects/             # PushPayload
        repositories/             # IFcmTokenRepository.ts
        useCases/                 # RegisterFcmToken, SendDailyReminder, SendIncompleteAlert

    infrastructure/                # 인프라 레이어 — 도메인 인터페이스 구현체
      supabase/
        SupabaseUserRepository.ts
        SupabaseGoalRepository.ts
        SupabaseScheduleRepository.ts
        SupabaseFcmTokenRepository.ts
        client.ts                 # Supabase 클라이언트 초기화
      claude/
        ClaudePlanGenerator.ts    # Claude API 호출 — 계획 생성·재조정
        ClaudeFeedbackGenerator.ts # Claude API 호출 — 코칭 메시지
        client.ts
      fcm/
        FcmPushSender.ts          # Firebase Admin SDK 푸시 발송
        client.ts
      auth/
        SupabaseAuthService.ts    # JWT 발급/검증

    api/                          # API Routes 진입점 — UseCase만 호출, 인프라 직접 접근 금지
      auth/
        signup.ts
        login.ts
      generate.ts                 # F2: AI 계획 생성
      regenerate.ts                # F2: 미완료 재조정
      schedule.ts                  # F3: 일정 CRUD
      feedback.ts                  # F5: 코칭 메시지/주간 리포트
      notify.ts                    # F4: FCM 푸시 발송 (Cron 트리거)

    types/                        # 공유 타입 정의
      index.ts

  vercel.json                     # Cron Job 설정
  .env                            # SUPABASE_URL, SUPABASE_KEY, CLAUDE_API_KEY, FCM_KEY (서버 전용)
```

## 원칙 (필수)

- `domains/`는 DB·HTTP·Claude SDK 등 외부 라이브러리 import 금지 — 인터페이스(`I{Name}Repository`)만 정의
- `infrastructure/`가 도메인 인터페이스를 구현 (예: `SupabaseGoalRepository implements IGoalRepository`)
- `api/`는 UseCase 호출만 — Supabase/Claude 클라이언트 직접 호출 금지
- 시크릿(Claude API Key, Supabase Service Key, FCM Key)은 `api/`·`infrastructure/`에서만 사용, 클라이언트 응답에 노출 금지
- 기존 함수 시그니처 변경 금지, 수정 전 기존 테스트 통과 확인

## 기능 ↔ 도메인 매핑

| 기능 | 도메인 | API Route |
|------|--------|-----------|
| F1 목표 설정 | `goal` | `api/generate.ts` 전단계 (목표 저장은 프론트→Supabase 직접 or `api/goal.ts`) |
| F2 AI 계획 생성·재조정 | `schedule` (+ `goal`) | `api/generate.ts`, `api/regenerate.ts` |
| F3 캘린더·완료 체크 | `schedule` | `api/schedule.ts` |
| F4 푸시 알림 | `notification` | `api/notify.ts` |
| F5 학습 피드백 | `feedback` | `api/feedback.ts` |
| F6 복습 사이클 | `schedule` (`InsertReviewCycle` useCase) | `api/generate.ts` 내부 호출 |

## DB 스키마 (Supabase)

plan.md 참조: `users`, `goals`, `schedules`, `fcm_tokens` 테이블. RLS로 본인 데이터만 접근 가능하도록 설정.
