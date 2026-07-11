# CLAUDE.md — AI 에이전트 작업 가이드

> **AI 에이전트가 쿼리만 하려면 → [AGENTS.md](AGENTS.md) 에서 시작하세요.**
> 이 문서는 **수정·기여 워크플로**를 다룹니다 (사람이 작성, AI가 따르는 가이드).

---

## 저장소의 정체

- **이름**: UIUX-DH · Unified Design System
- **형태**: 모바일 중심 디자인시스템의 단일 진실의 출처
- **현재 버전**: v0.5.0 (2026.04.22)
- **범위**: Foundations(토큰/원칙) + Policy(그라데이션) + UX Writing(7원칙) + Components(25종) + 실제 사용 데모(18종)
- **핵심 철학 (v0.5 신규)**: *"디자인시스템은 제품, 팀은 고객"* (Toss) → *"AI도 고객"*. JSON canonical + MD 보조.

---

## ⚠️ 가장 중요 · 3단계 작업 원칙 (v0.5.0에서 4→3단계로 축소)

**디자인시스템을 수정할 때 다음 3가지 작업을 반드시 함께 수행합니다.**

### 1. 운영 진본 — `index.html` + 바닐라 JS/CSS 구조 수정

실제 브라우저에 렌더링되는 진본.

| 파일 | 수정 대상 |
| --- | --- |
| `index.html` | HTML 구조 · 컴포넌트 마크업 · 섹션 추가/삭제 · `data-uses` 속성 |
| `assets/css/main.css` | CSS 토큰 · 컴포넌트 스타일 · 레이아웃 · 반응형 |
| `assets/js/main.js` | 라우터 · 사이드바 · 테마 전환 · `buildDemoMatrix()` |

### 2. JSON 스키마 (canonical)

**이 레이어가 단일 진실의 출처.** AI는 여기서 1-read로 쿼리합니다.

| 파일 | 수정 대상 |
| --- | --- |
| `system.json` | 루트 매니페스트 — 컴포넌트·토큰·데모 인덱스 |
| `components/<id>.schema.json` | 컴포넌트 사양 (variants/tokens/html/a11y/usedInDemos) |
| `tokens/*.json` + `tokens/theme-map.json` | 토큰 정본 (primitives/semantic/theme-map) |
| `snippets/patterns.json` | 자주 쓰이는 조합 패턴 |

### 3. 서술 문서 — 각 폴더의 `md` 파일 (보조)

| 수정 유형 | 업데이트 대상 |
| --- | --- |
| 토큰 값 변경 | 해당 `tokens/*.json` + `foundations/<type>.md` |
| 컴포넌트 변경 | `components/<id>.md` (JSON과 동기화, `canonical:` 프런트매터) |
| 원칙/정책 갱신 | `docs/0x-*.md` |
| 새 릴리스 | `CHANGELOG.md` 항목 추가 (Semantic Versioning) |

---

## ⛓ data-uses 매트릭스로 영향 범위 확인

**컴포넌트·토큰 수정 시, 그것을 쓰는 데모·스키마를 함께 업데이트합니다.**

각 데모 섹션은 `data-uses` 속성으로 의존성을 선언:

```html
<section class="demo-section" id="demo-shopping"
         data-uses="button,card,badge,tabs,--sm-interactive-brand-default,--p-indigo-500">
```

`main.js`의 `buildDemoMatrix()`가 자동 스캔 → `window.demoMatrix` 생성. 수정 전 영향 범위 확인:

```js
// button 수정 시
window.demoMatrix.byComponent['button']
// → ["demo-login", "demo-signup", "demo-pricing", ...]

// 브랜드 색 변경 시
window.demoMatrix.byToken['--sm-interactive-brand-default']
// → 영향 데모 리스트
```

**정적 정보가 필요하면**: `system.json.components[].usedInDemos` 또는 `components/<id>.schema.json.usedInDemos`.

**검증**: `node scripts/validate.mjs` — 모든 JSON·참조 무결성 확인.

---

## 파일 구조

```
UIUX-DH · Unified Design System/
├── system.json                        ★ 루트 매니페스트 (AI 진입점)
├── AGENTS.md                          ★ AI 에이전트 결정 트리
├── CLAUDE.md                          (이 문서 — 기여 워크플로)
├── README.md
├── CHANGELOG.md
│
├── index.html                         ← 운영 진본 (바닐라 HTML)
├── assets/
│   ├── css/main.css                   ← 운영 진본 (전체 스타일)
│   └── js/main.js                     ← 운영 진본 (buildDemoMatrix 포함)
│
├── schemas/                           ★ JSON 메타 스키마
│   ├── component.schema.json
│   ├── token.schema.json
│   ├── demo.schema.json
│   └── snippet.schema.json
│
├── components/
│   ├── <id>.schema.json              ★ JSON canonical (25개)
│   ├── <id>.md                       (보조 서술 — 긴 라이팅·원칙)
│   └── README.md
│
├── tokens/                            ← 토큰 정의
│   ├── primitives.json                (원시 팔레트)
│   ├── semantic.light.json            (Light 매핑)
│   ├── semantic.dark.json             (Dark 매핑)
│   ├── theme-map.json                 ★ Light/Dark pair 집약
│   ├── typography.json
│   ├── sizing.json / radius.json / elevation.json / motion.json / z-index.json
│
├── snippets/
│   └── patterns.json                  ★ 자주 쓰는 조합 10종
│
├── scripts/
│   └── validate.mjs                   ★ 무결성 검증 (Node, no deps)
│
├── docs/                              ← 개념/정책/원칙 (사람 가독용 md)
│   ├── 00-overview.md
│   ├── 01-principles.md
│   ├── 02-token-architecture.md
│   ├── 03-naming-conventions.md
│   ├── 04-gradient-policy.md
│   └── 05-ux-writing.md
│
└── foundations/                       ← 시각 기초 가이드
    ├── color.md / typography.md / spacing.md / radius.md / elevation.md / motion.md
```

> **v0.5.0에서 제거**: `Single HTML/` 폴더 — 드리프트 원천 제거. `index.html`이 유일 진본.

---

## 컴포넌트 추가·수정 워크플로

### 새 컴포넌트 추가
1. `components/<id>.schema.json` 작성 (필수: `id`, `name`, `version`, `category`, `description`, `variants[]`)
2. `components/<id>.md` 작성 (선택 — 긴 서술 필요 시만)
3. `index.html` 에 `<section class="component-section" id="<id>">` 추가
4. `assets/css/main.css` 에 스타일 추가
5. `system.json.components[]` 배열에 엔트리 추가
6. 사이드바 (`index.html`) · `assets/js/main.js` CATEGORIES 에 등록
7. `CHANGELOG.md` 엔트리
8. `node scripts/validate.mjs` 통과

### 토큰 수정
1. `window.demoMatrix.byToken['--토큰']` 으로 영향 확인
2. `tokens/primitives.json` 또는 `semantic.*.json` 값 변경
3. `tokens/theme-map.json` 의 Light/Dark pair 동기화
4. `assets/css/main.css` `:root` / `[data-theme="dark"]` 블록 반영
5. 영향 컴포넌트 `.schema.json.tokens{}` 검토
6. `CHANGELOG.md` 에 "영향 데모: ..." 명시
7. `node scripts/validate.mjs` 통과

### 새 데모 추가
1. `index.html` 에 `<section class="demo-section" id="demo-xxx" data-uses="...">` 추가
2. `system.json.demos[]` 에 엔트리 추가
3. 해당 컴포넌트들의 `.schema.json.usedInDemos` 에 demo-xxx 추가
4. 사이드바 + `CATEGORIES['demo'].items` 등록
5. `CHANGELOG.md` Added 엔트리
6. `node scripts/validate.mjs` 통과

---

## AI가 지켜야 할 규칙

### 해야 할 것
- **토큰 이름으로 말하기** — `#4F46E5` 대신 `--sm-interactive-brand-default` 또는 `--p-indigo-500`
- **Light/Dark 양쪽 의식** — 시맨틱 토큰은 양쪽 값을 가질 수 있음, `tokens/theme-map.json` 참조
- **변경은 `CHANGELOG.md` 에 기록** — 삭제가 아니라 누적
- **새 컴포넌트는 자체 `.schema.json`** — 기존 파일에 섞지 말 것
- **3단계 워크플로 준수** — 운영 진본 + JSON 스키마 + 서술 문서 동시 업데이트

### 하지 말 것
- 색을 Hex 값으로 부르기 (`#0B0D12`) → `--sm-content-primary`
- 'Btn', 'Nav' 같은 축약어 (`CTA/URL/SVG/FAQ` 등 업계 관례만 허용)
- `style="color: #333"` 같은 하드코딩
- 다크 모드 전용 별도 토큰 이름 만들기 (같은 이름·다른 값)
- v0.3 이후의 **두-색 그라데이션** (정책 위반, `docs/04-gradient-policy.md`)
- `Single HTML/` 참조 — **v0.5.0에서 삭제됨**

---

## 자주 하는 참조

| 찾는 것 | 보는 곳 |
| --- | --- |
| AI 진입점 | [AGENTS.md](AGENTS.md) |
| 루트 매니페스트 | [system.json](system.json) |
| 컴포넌트 스펙 | `components/<id>.schema.json` |
| 토큰 Light/Dark pair | [tokens/theme-map.json](tokens/theme-map.json) |
| 자주 쓰는 조합 | [snippets/patterns.json](snippets/patterns.json) |
| 검증 실행 | `node scripts/validate.mjs` |
| 원칙 6개 | [docs/01-principles.md](docs/01-principles.md) |
| UX 라이팅 | [docs/05-ux-writing.md](docs/05-ux-writing.md) |
| 그라데이션 정책 | [docs/04-gradient-policy.md](docs/04-gradient-policy.md) |
