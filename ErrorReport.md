# 오류 기록부 — 학습 설계 도우미

> 발생한 버그·오류를 날짜순으로 기록. 원인 분석 + 해결 방법 포함.

---

## #001 — git push 실패 (브랜치 미생성)
- **날짜:** 6/24
- **오류 메시지:** `error: src refspec feature/backend-setup does not match any`
- **원인:** `git push -u origin feature/backend-setup` 명령어 실행 전에 로컬에 해당 브랜치를 생성하지 않은 상태. git은 존재하지 않는 브랜치를 push할 수 없음.
- **해결:** `git checkout -b feature/backend-setup` 으로 브랜치 생성 후 push.
- **예방:** 새 작업 시작 시 항상 `git checkout -b <브랜치명>` 먼저 실행.

---

## #002 — git branch 명령어 결과 없음
- **날짜:** 6/24
- **오류 메시지:** (출력 없음)
- **원인:** git 저장소 초기화 직후 첫 커밋이 없으면 `unborn branch` 상태. 브랜치 자체가 아직 존재하지 않아 `git branch` 조회 시 아무것도 표시되지 않음.
- **해결:** `git add . && git commit -m "초기 커밋"` 으로 첫 커밋 생성 후 브랜치 목록 정상 표시.
- **예방:** `git init` 직후 반드시 첫 커밋 먼저 생성.

---

## #003 — README.md merge conflict
- **날짜:** 6/24
- **오류 메시지:** `CONFLICT (add/add): Merge conflict in README.md`
- **원인:** GitHub에서 저장소 생성 시 "Add README" 옵션으로 자동 생성된 1줄짜리 README(`# Study_GuideHelper`)가 원격에 존재. 로컬에서 상세 README 작성 후 push 시 두 파일이 충돌. git은 같은 파일의 서로 다른 내용을 자동 병합할 수 없어 conflict 마커(`<<<<<<< HEAD`) 삽입.
- **해결:** 충돌 마커 제거 후 로컬 버전(상세 README) 내용 유지, `git add README.md && git commit`.
- **예방:** GitHub 저장소 생성 시 "Add README" 체크 해제, 로컬에서 직접 생성.

---

## #004 — git push origin 누락
- **날짜:** 6/25
- **오류 메시지:** `fatal: 'feature/supabase-auth' does not appear to be a git repository`
- **원인:** `git push -u feature/supabase-auth` 명령어에서 원격 저장소 이름(`origin`)을 빠뜨림. git이 `feature/supabase-auth`를 원격 저장소 이름으로 해석하려다 실패.
- **올바른 명령어:** `git push -u origin feature/supabase-auth`
- **예방:** push 명령어 형식 = `git push -u [원격명] [브랜치명]`. 원격명은 항상 `origin`.

---

## #005 — vercel dev 재귀 호출 오류
- **날짜:** 6/25
- **오류 메시지:** `Error: vercel dev must not recursively invoke itself. Check the Development Command in the Project Settings or the dev script in package.json`
- **원인:** `BackEnd/package.json`의 scripts에 `"dev": "vercel dev"` 가 설정되어 있었음. `vercel dev` 실행 시 내부적으로 `npm run dev`를 호출하는데, 그 dev 스크립트가 다시 `vercel dev`를 실행 → 무한 재귀 호출 발생.
- **해결:** `package.json`에서 `"dev": "vercel dev"` 스크립트 제거. `vercel dev`는 직접 CLI에서 실행.
- **예방:** Vercel 백엔드 프로젝트의 `package.json`에 `dev` 스크립트 불필요. 직접 `vercel dev` 명령어 사용.

---

## #006 — SUPABASE_URL 잘못된 값
- **날짜:** 6/25
- **오류 메시지:** (Supabase 클라이언트 초기화 실패, API 호출 오류)
- **원인:** Supabase 대시보드 API 페이지에서 URL을 복사할 때 `https://xxx.supabase.co/rest/v1/` 형태로 복사. `/rest/v1/` 경로가 포함된 상태로 `SUPABASE_URL`에 입력. Supabase JS 클라이언트(`createClient`)는 base URL만 받아서 내부적으로 경로를 붙이기 때문에 `/rest/v1/`가 중복으로 붙어 모든 API 호출 실패.
- **해결:** `SUPABASE_URL="https://xxx.supabase.co"` — 경로 없이 base URL만 사용.
- **예방:** Supabase URL은 `https://[프로젝트ID].supabase.co` 형태만 사용. `/rest/v1/` 이하 경로 제거.

---

## #007 — 브라우저 로그인 CORS 오류
- **날짜:** 6/26
- **오류 메시지:** `Access to XMLHttpRequest at 'http://localhost:3000/api/auth/login' from origin 'http://localhost:5173' has been blocked by CORS policy`
- **원인:** 프론트엔드(포트 5173)에서 백엔드(포트 3000)로 요청 시, 브라우저의 Same-Origin Policy 작동. 백엔드 API 핸들러에 `Access-Control-Allow-Origin` 헤더가 없어서 브라우저가 응답 차단. `curl`은 CORS 미적용이라 직접 호출 시 정상 동작했던 것.
- **해결:** `BackEnd/src/infrastructure/http/cors.js` 생성 — `Access-Control-Allow-Origin: *`, `Access-Control-Allow-Headers`, OPTIONS preflight 처리. 모든 API 핸들러에 `handleCors(req, res)` 추가.
- **예방:** 새 API 핸들러 생성 시 항상 첫 줄에 `if (handleCors(req, res)) return` 추가.

---

## #008 — feature/goal-input dev 미머지
- **날짜:** 6/27
- **원인:** `feature/goal-input` PR을 생성했으나 `dev` 브랜치가 아닌 다른 경로로 머지되거나 누락. 결과적으로 `dev` 브랜치에 목표 입력 폼 코드가 반영되지 않은 상태에서 다음 작업 브랜치(`feature/claude-generate`) 생성 → 해당 브랜치에 goal 코드 없음.
- **해결:** GitHub에서 `feature/goal-input → dev` PR 재생성 후 머지. `feature/claude-generate` 브랜치에서 `git rebase origin/dev` 실행.
- **예방:** PR 생성 시 base 브랜치가 반드시 `dev`인지 확인 후 머지.

---

## #009 — dev → main merge conflict (squash 머지 부작용)
- **날짜:** 6/27
- **오류 메시지:** `CONFLICT (content): Merge conflict in FrontEnd/src/app/pages/HomePage.jsx`
- **원인:** GitHub에서 `dev → main` PR을 **Squash and merge** 방식으로 머지함. Squash 머지는 dev의 커밋들을 하나로 합쳐 main에 새 커밋으로 추가하는 방식이라, git 히스토리상 dev와 main이 공통 조상을 잃고 분기됨. 이후 dev에 새 커밋이 쌓이면 main과 히스토리가 달라져 다음 `dev → main` PR에서 충돌 발생.
- **해결:** 로컬에서 `git checkout main && git merge origin/dev` 실행. `HomePage.jsx` 충돌을 `git checkout --theirs FrontEnd/src/app/pages/HomePage.jsx` (dev 버전 채택) 후 커밋·push.
- **예방:** `dev → main` PR은 반드시 **"Create a merge commit"** 방식 사용 (Squash X). feature → dev는 Squash 허용.

---

## #010 — Vercel API 라우트 전체 404 (모노레포 rootDirectory 미설정)
- **날짜:** 7/1
- **오류 메시지:** 배포된 프론트엔드에서 모든 `/api/*` 호출이 404
- **원인:** GitHub 저장소 루트에는 `BackEnd/`, `FrontEnd/` 두 폴더가 있는데, Vercel 프로젝트가 GitHub 연동 시 기본값(저장소 루트)을 빌드 대상으로 삼음. 실제 백엔드 코드는 `BackEnd/` 하위에 있어 빌드 결과물이 비어있는 상태로 배포됨.
- **해결:** Vercel API로 `PATCH /v9/projects/{id}` 호출해 `{"rootDirectory": "BackEnd"}` / `{"rootDirectory": "FrontEnd"}` 설정. 프론트·백엔드 두 프로젝트 각각 지정.
- **예방:** 모노레포 구조로 Vercel 프로젝트 생성 시 최초 연결 단계에서 반드시 Root Directory 지정.

---

## #011 — 배포 후 브라우저에서 ERR_TIMED_OUT (Vercel SSO Protection)
- **날짜:** 7/1
- **오류 메시지:** `Failed to load resource: net::ERR_TIMED_OUT`
- **원인:** 프로젝트에 `ssoProtection: {deploymentType: 'all_except_custom_domains'}`이 활성화돼 있어, 브라우저의 cross-origin 요청이 Vercel SSO 로그인 페이지로 리다이렉트되며 타임아웃. `curl`은 이 리다이렉트 체인을 그대로 따라가지 않아 정상 응답처럼 보였던 것.
- **해결:** Vercel API로 두 프로젝트 모두 `ssoProtection: null` 설정.
- **예방:** 개인 프로젝트를 공개 API로 서빙할 경우 Vercel 대시보드에서 Deployment Protection이 꺼져 있는지 최초 배포 시 확인.

---

## #012 — 로그인 응답 1초 이상 지연 (함수 리전 불일치)
- **날짜:** 7/2
- **원인:** Vercel 함수 기본 리전이 미국 동부(`iad1`)인데 Supabase DB는 서울 리전. 요청이 서울→미국 함수 실행→서울 DB→미국→서울로 왕복하며 태평양을 두 번 건넘.
- **해결:** `BackEnd/vercel.json`에 `"regions": ["icn1"]` 추가해 함수 실행 리전을 서울로 고정.
- **결과:** 로그인 응답 1.3초 → 0.2~0.5초.
- **예방:** DB와 함수 리전은 항상 같은 지역으로 맞출 것. 배포 후 `x-vercel-id` 응답 헤더로 실제 실행 리전 확인 가능.

---

## #013 — FCM 토큰 중복 등록 (StrictMode 이중 마운트)
- **날짜:** 7/2
- **원인:** React `StrictMode`가 개발 모드에서 `useEffect`를 의도적으로 2번 실행하는데, 알림 권한 요청 로직이 매번 새로 토큰을 insert만 하고 기존 토큰 존재 여부를 확인하지 않음. 같은 기기가 서버에 동일 토큰으로 여러 행을 갖게 됨 → 발송 시 중복 알림.
- **해결:** `register.js`에서 같은 토큰이 이미 있으면 재삽입하지 않고, 있으면 마지막 로그인 사용자로 귀속 처리. `send.js`에서도 토큰 값 기준 Map으로 dedupe 후 발송.
- **예방:** 클라이언트에서 외부 리소스(토큰, 구독 등) 등록 API를 호출할 때는 서버 쪽에서 반드시 idempotent(멱등) 처리.

---

## #014 — 계획 재생성 시 태스크 중복 누적
- **날짜:** 7/2
- **원인:** "다시 생성하기" 클릭 시 `/api/generate`가 기존 `schedules` 행을 지우지 않고 새 태스크를 그대로 insert. 재생성할 때마다 이전 계획 위에 새 계획이 계속 쌓임.
- **해결:** insert 전에 해당 `goal_id`의 기존 스케줄을 delete하도록 수정.
- **검증:** 같은 목표로 2회 연속 생성 후 DB 실측 — 2회차 개수만 남고 중복 없음 확인.
- **예방:** "재생성/덮어쓰기" 성격의 API는 삽입 전 상태 초기화 로직이 함께 있는지 항상 체크.

---

## #015 — 장기 학습 계획 AI 응답 JSON 잘림
- **날짜:** 7/2
- **원인:** `ClaudePlanGenerator`의 `max_tokens`가 4096으로 설정돼 있어, 60일 이상 장기 계획처럼 태스크 수가 많은 경우 JSON 응답이 중간에 잘려 파싱 실패 가능성 존재.
- **해결:** `max_tokens` 16000으로 상향, 응답이 `max_tokens`로 잘렸을 때(`stop_reason`)와 JSON 파싱 실패 시 각각 한국어 안내 메시지 반환하도록 에러 핸들링 추가.
- **예방:** AI 생성 결과 길이가 입력값(기간·과목 수)에 비례해 커지는 API는 최악의 케이스(최대 기간) 기준으로 토큰 한도를 넉넉히 설정.

---

## #016 — `/api/notify/send` 인증 없는 공개 엔드포인트 (보안 취약점)
- **날짜:** 7/2
- **원인:** 크론 전용으로 만든 발송 API에 인증 로직이 없어, URL만 알면 누구나 호출해 전체 사용자에게 임의로 푸시 발송 가능한 상태였음.
- **해결:** `CRON_SECRET` 환경변수 기반 Bearer 토큰 인증 추가. Vercel Cron은 `CRON_SECRET`이 설정된 경우 요청에 자동으로 해당 값을 `Authorization` 헤더로 실어 보내므로 정상 자동 발송에는 영향 없음.
- **부수 사고:** 수정 도중 `.env` 파일 마지막 줄(FCM 서비스계정 JSON)에 개행 없이 `CRON_SECRET` 값이 그대로 이어 붙어 값이 깨짐 — 파일 직접 열어 개행 추가 후 재등록해 해결.
- **예방:** 외부에서 트리거되는(크론·웹훅) 엔드포인트는 기본적으로 인증을 걸어놓고 시작할 것. `.env`에 값 추가 시 항상 파일 끝 개행 여부 확인.

---

## #017 — 모바일 화면 확대 상태 고정 (viewport 설정 누락)
- **날짜:** 7/2
- **원인:** 입력창 폰트 크기가 14px(`text-sm`)이라, 모바일 브라우저가 입력창 포커스 시 자동으로 화면을 확대. `viewport` 메타 태그에 확대 제한이 없어 확대된 상태가 그대로 유지됨.
- **해결:** `index.html`의 viewport에 `maximum-scale=1.0, user-scalable=no` 추가.
- **예방:** PWA/모바일 웹앱은 초기 세팅 단계에서 viewport 확대 정책을 먼저 결정할 것.

---

## #018 — PWA 배포 후 구버전 화면이 계속 보임
- **날짜:** 7/2
- **원인:** 서비스워커 등록 스크립트가 `register()`만 호출하고 갱신(update) 로직이 없어, 새 버전을 배포해도 이미 캐시된 구버전 서비스워커가 계속 응답. 사용자가 앱을 여러 번 재실행해야만 새 버전이 반영됨.
- **해결:** `main.jsx`에 `registerSW({ immediate: true })` (vite-plugin-pwa 제공) 추가해 새 버전 감지 시 즉시 자동 갱신되도록 수정.
- **예방:** `vite-plugin-pwa` 사용 시 `virtual:pwa-register`의 `registerSW`를 반드시 명시적으로 호출해 업데이트 정책을 설정할 것 (기본 등록 스크립트만으로는 자동 갱신 안 됨).

---

## #019 — 프론트엔드 Git 자동 배포가 항상 백엔드 프로젝트에만 적용됨
- **날짜:** 7/4
- **오류 증상:** `vercel git connect`가 "이미 연결됨"으로 응답하는데도 실제로는 프론트엔드 push 시 자동 배포가 전혀 트리거되지 않음
- **원인:** 저장소 루트의 `.vercel/project.json`이 백엔드 프로젝트(`study-guide-helper`)를 가리키고 있었음. `git connect` 명령을 저장소 루트나 `BackEnd/`에서 실행할 때마다 해당 파일이 링크 대상을 결정해, 실제로는 매번 백엔드 프로젝트에 대해서만 연결이 재확인되고 있었음. Vercel 프로젝트 API로 조회한 `link` 필드도 프론트엔드는 `null`로 비어있어 근본 원인을 확정.
- **해결:** `FrontEnd/` 디렉토리 안에서 `vercel git connect`를 실행해 올바른 `.vercel/project.json`(`prj_WcZxKFWdWt9UjVqDlToBH0hwcLtu`) 기준으로 연결. 이후 실제 push로 자동 배포 트리거까지 재현 검증.
- **예방:** 모노레포에서 하위 폴더별로 다른 Vercel 프로젝트를 쓸 경우, git 관련 CLI 명령은 반드시 해당 프로젝트의 `.vercel/project.json`이 있는 디렉토리 안에서 실행할 것. 의심될 땐 Vercel API로 프로젝트의 `link` 필드를 직접 조회해 확인.

---

## #020 — Vercel Cron 자동 알림이 등록 이후 한 번도 성공하지 않음 (POST/GET 메서드 불일치)
- **날짜:** 7/4
- **오류 증상:** 매일 21:00 KST 자동 발송이 크론 등록(7/2) 이후 폰에 한 번도 오지 않음
- **원인:** `/api/notify/send` 핸들러가 `req.method !== 'POST'`일 때 405를 반환하도록 작성돼 있었는데, **Vercel Cron은 실제로는 GET 요청**을 보냄. 수동 검증은 항상 `curl -X POST`로 진행했기 때문에 정상 동작하는 것처럼 보였고, 실제 크론 트리거 경로에서만 매번 405로 거부되고 있었음.
- **디버깅 방법:** `vercel crons run /api/notify/send` (Vercel CLI의 크론 수동 트리거 명령)으로 실제 Cron과 동일한 요청 방식을 재현 → `vercel logs`에서 `GET /api/notify/send 405` 확인.
- **해결:** 메서드 체크를 `GET`과 `POST` 모두 허용하도록 수정. 수정 후 동일한 방식으로 재트리거해 200 응답 및 실제 발송 성공 검증.
- **예방:** 스케줄러(Cron)가 호출하는 엔드포인트는 해당 스케줄러가 실제로 어떤 HTTP 메서드를 사용하는지 공식 문서로 먼저 확인할 것. `curl` 수동 테스트만으로는 스케줄러의 실제 호출 방식과 다를 수 있음을 항상 의심.

---

## #021 — 서비스워커 갱신으로 FCM 토큰 중복 발급 → 알림 중복 수신
- **날짜:** 7/4
- **오류 증상:** 한 번의 발송에 같은 기기 알림이 2개씩 옴 (테스트 중 발송 2회 × 중복 토큰 2개 = 알림 4개로 확인됨)
- **원인:** #018에서 PWA 자동 업데이트를 적용하며 서비스워커가 재등록됐고, 이 과정에서 브라우저가 새로운 FCM 토큰을 발급. `register.js`는 토큰 **문자열**이 다르면 무조건 새 행으로 취급해, 예전 토큰이 삭제되지 않고 같은 사용자에게 2개의 유효한 토큰이 남아있게 됨.
- **해결:** 프론트엔드에서 마지막으로 등록한 토큰을 `localStorage`에 저장해두고, 새 토큰 발급 시 값이 다르면 등록 전에 기존 토큰을 먼저 해제(`unregister`)하도록 수정. DB에 이미 남아있던 중복 토큰도 직접 정리.
- **예방:** FCM/APNs처럼 토큰이 주기적으로 회전(rotate)될 수 있는 시스템은, 서버가 토큰 값만으로 dedupe하지 말고 클라이언트가 "이전 토큰 대체" 흐름을 명시적으로 처리해야 함.

---

*마지막 업데이트: 2026-07-04*
