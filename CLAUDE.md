# CLAUDE.md — AI 에이전트 작업 가이드

> **쿼리만 하려면 → [AGENTS.md](AGENTS.md) 에서 시작하세요.**
> 이 문서는 **수정·기여 워크플로**(주로 템플릿 추가)를 다룹니다.

---

## 저장소의 정체

- **이름**: 숏폼 연구소 · 템플릿 저장공간 (Shortform Lab)
- **형태**: 기준 숏폼 영상을 항목별로 해부하는 **분석 프롬프트 아카이브**
- **현재 버전**: v1.0.0 (2026.07.11)
- **핵심 철학**: *"잘된 숏폼 하나를, 해부 프롬프트로 저장한다."* — 데이터는 `templates.json` 단일 진본, 화면은 그것을 읽어 렌더링.

> 이 저장소는 v1.0.0에서 **UIUX-DH 디자인시스템**을 전면 대체했습니다. 컴포넌트·토큰·데모·릴리스 등 이전 디자인시스템 자산은 모두 제거되었습니다.

---

## 구조 한눈에

| 파일 | 역할 |
| --- | --- |
| [`templates.json`](templates.json) | ★ **단일 진실의 출처** — 모든 템플릿 데이터 |
| [`index.html`](index.html) | 앱 셸 — 사이드바 · 뷰 컨테이너 · 아이콘 스프라이트 |
| [`assets/css/main.css`](assets/css/main.css) | 토큰(라이트/다크) + 전체 스타일 |
| [`assets/js/main.js`](assets/js/main.js) | 라우터 · 렌더링 · 복사 · 필터/검색 · 테마 |
| [`scripts/serve.mjs`](scripts/serve.mjs) | 로컬 개발 서버 |
| [`scripts/validate.mjs`](scripts/validate.mjs) | `templates.json` 무결성 검증 |
| [`docs/video-analysis.md`](docs/video-analysis.md) | ★ **영상 분석 방법** — 힉스필드 MCP 절차 (분석 작업 전 필독) |

**대부분의 기여는 `templates.json` 한 파일만 수정하면 됩니다.** 화면·사이드바 필터·검색은 데이터에서 자동 생성됩니다.

---

## ⭐ 새 템플릿 추가 (가장 흔한 작업)

1. `templates.json` → `templates[]` 배열 끝에 객체 하나 추가.
   - 필수: `id`(고유, `tpl-kebab-case`) · `title` · `archetype` · `summary` · `reference` · `bestFor` · `pros` · `cons` · `prompts`
   - `prompts`는 `hook · structure · script · edit · remix` 순서 권장, 각 `text`는 **그대로 복사해 쓰는 완성형 프롬프트**.
2. 새 `archetype`을 도입했다면 `archetypes[]`에도 추가(필터 칩 순서 명시).
3. `node scripts/validate.mjs` 로 검증.
4. `npm run serve` 로 브라우저에서 확인.
5. [CHANGELOG.md](CHANGELOG.md)에 변경 기록 추가.

### 프롬프트 작성 원칙

- **완성형·복사 가능**: 사용자가 ChatGPT·Claude에 그대로 붙여넣는 프롬프트. 무엇을·어떤 기준으로·어떤 형식으로 답할지 구체적으로.
- **한국어**, 자리표시자(`[영상 링크]` · `[영상 스크립트/자막 붙여넣기]` · `[내 주제]`) 포함.
- **재현(`remix`)** 프롬프트는 분석 결과를 *내 주제의 새 숏폼 기획안*으로 바꾸는 역할.
- `reference.url`에 URL을 넣으면 카드에 **임베드**됩니다(`.mp4` → `<video>`, 그 외 → `<iframe>`). 영상 파일을 저장소에 커밋하지 마세요. **실존 채널/인물을 지어내지 말 것.**

---

## ⚠ 영상 분석 규칙 (항상 적용)

**기준 영상을 분석하는 모든 작업은 힉스필드(Higgsfield) MCP로 수행합니다.** 절차·주의사항·프롬프트 결합 방법은 [docs/video-analysis.md](docs/video-analysis.md)에 있으며, 영상 분석 작업을 시작하기 전에 반드시 이 문서를 읽으세요.

- 흐름 요약: `media_import_url`(CDN mp4) → `video_analysis_create` → `video_analysis_status` 폴링(30~60초 간격, 보통 3~5분).
- 분석 전 `video_analysis_jobs`로 **기존 완료 분석 재사용 여부**를 먼저 확인(중복 크레딧 소모 방지).
- 분석 결과(scenes)는 템플릿 프롬프트의 `[영상 스크립트/자막 붙여넣기]` 자리에 들어가는 입력입니다.

---

## 코드(HTML/CSS/JS)를 고칠 때

데이터가 아니라 앱 동작·모양을 바꿀 때만 해당됩니다.

- **뷰 추가/변경**: `index.html`의 `.view` 섹션 + `main.js`의 `VIEWS` 라우터 맵 + 사이드바 링크(`data-section`).
- **스타일**: 색은 **토큰 이름**으로(`--sm-content-primary`, `--sm-interactive-brand-default`). Hex 하드코딩 금지. 라이트/다크 양쪽(`[data-theme="dark"]`) 의식.
- **아이콘**: `index.html` 상단 `<svg>` 스프라이트에 `<symbol id="i-...">` 추가 후 `main.js`의 `svg('i-...')` 헬퍼로 사용. 인라인 `<use>` SVG는 CSS로 크기를 지정해야 함(미지정 시 300×150 기본값).
- **캐시 버스팅**: CSS/JS를 수정해 릴리스하면 `index.html`의 `?v=` 쿼리(`main.css?v=x.y.z` · `main.js?v=x.y.z`)를 새 버전으로 올릴 것. `templates.json`은 `no-store`로 읽어 항상 최신.

---

## 하지 말 것

- `templates.json` 없이 HTML에 템플릿을 하드코딩하기 (데이터는 JSON 진본으로).
- `reference`에 검증 안 된 실존 영상 URL·채널명 지어내기.
- 색을 Hex로 하드코딩(`#4F46E5`) → 토큰(`--sm-interactive-brand-default`) 사용.
- 인라인 `<use>` SVG를 크기 지정 없이 넣기.

---

## 자주 하는 참조

| 찾는 것 | 보는 곳 |
| --- | --- |
| AI 진입점 | [AGENTS.md](AGENTS.md) |
| 템플릿 데이터 | [templates.json](templates.json) |
| **영상 분석 방법 (힉스필드 MCP)** | [docs/video-analysis.md](docs/video-analysis.md) |
| 로컬 실행 | `npm run serve` → http://127.0.0.1:8178 |
| 검증 | `node scripts/validate.mjs` |
| 변경 이력 | [CHANGELOG.md](CHANGELOG.md) |
