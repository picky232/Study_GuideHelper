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

*마지막 업데이트: 2026-06-27*
