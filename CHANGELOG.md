# Changelog

숏폼 연구소 · 템플릿 저장공간의 변경 이력. [Semantic Versioning](https://semver.org/lang/ko/)을 따르며, 과거는 지워지지 않고 아래에 **누적**됩니다.

---

## v1.1.0 — 2026.07.11

### Added
- **기준 영상 임베드.** 영상을 저장소에 저장하지 않고 `reference.url`로 임베드(`.mp4` → `<video>` 네이티브 플레이어, 그 외 URL → `<iframe>`). 카드에서 바로 재생 가능.
- **시드 템플릿 5종에 기준 영상 연결.** Glovv 레퍼런스 컬렉션 CDN 영상 5개를 템플릿 순서대로 `reference.url`에 매핑.
- **영상 분석 방법 문서 [docs/video-analysis.md](docs/video-analysis.md).** 영상 분석은 항상 힉스필드(Higgsfield) MCP 사용 — `media_import_url` → `video_analysis_create` → `video_analysis_status` 폴링 절차, 50MB 제한·폴링 간격·기존 분석 재사용 등 주의사항, 분석 결과(scenes)를 템플릿 프롬프트와 결합하는 방법.

### Changed
- CLAUDE.md · AGENTS.md에 영상 분석 규칙(힉스필드 MCP 필수, 문서 필독)과 임베드 규칙 반영.

---

## v1.0.0 — 2026.07.11

### 전환 (Breaking)
- **숏폼 연구소로 전면 전환.** 기존 **UIUX-DH · Unified Design System**을 대체. 컴포넌트(25종)·토큰·데모(18종)·릴리스 등 이전 디자인시스템 자산과 관련 디렉토리(`components/` · `tokens/` · `docs/` · `foundations/` · `schemas/` · `snippets/`)를 모두 제거했습니다.

### Added
- **템플릿 저장공간.** 기준 숏폼 영상을 항목별로 해부하는 분석 프롬프트 아카이브. 각 템플릿은 기준 영상(`reference`) · 사용성(`bestFor`) · 장단점(`pros`/`cons`) · 항목별 프롬프트(`prompts`)로 구성.
- **분석 프롬프트 5항목 규격:** 후킹(`hook`) · 구성·전개(`structure`) · 카피·스크립트(`script`) · 편집·비주얼 리듬(`edit`) · 내 주제로 재현(`remix`).
- **시드 템플릿 5종:** 후킹 폭발형 · 스토리텔링형 · 정보/튜토리얼형 · 리뷰/UGC 광고형 · 밈/트렌드·챌린지형. (총 25개 프롬프트)
- **복사 중심 UX:** 프롬프트별 복사 + 템플릿 전체 프롬프트 복사, 성공 토스트. `file://` 대비 clipboard 폴백 포함.
- **탐색:** 아키타입 필터 칩(사이드바·상단) + 키워드 검색, 사용성/장단점/기준영상 표시.
- **`templates.json` 단일 진본:** 데이터 추가 시 화면·사이드바·필터가 자동 갱신.
- **도구:** `scripts/serve.mjs`(의존성 0 로컬 서버) · `scripts/validate.mjs`(무결성 검증).

### Kept
- 라이트/다크 테마 토큰 체계(`--sm-*` / `--p-*`)와 Pretendard 타이포그래피 기반은 계승해 새 UI에 재사용.

### Removed
- `index.html`의 디자인시스템 마크업 전체, `system.json`, `handoff.md`, `assets/css/_tokens.generated.css`, 토큰 빌드·문서 생성 스크립트(`build-tokens.mjs` · `gen-docs.mjs`).
