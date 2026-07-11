# AGENTS.md — AI 에이전트 진입점

> **대상**: LLM·에이전트·자동화 도구. 이 저장소의 디자인시스템을 **읽고 · 찾고 · 적용**할 때 이 문서부터 읽으면 모든 쿼리를 **1–2 파일 read**로 해결할 수 있습니다.
>
> **사람 읽기용**: [CLAUDE.md](CLAUDE.md) · [README.md](README.md)

---

## 🎯 핵심 원칙

1. **JSON이 canonical, MD는 보조** — 구조화 데이터(variants, tokens, html)는 `components/<id>.schema.json` 참조. MD는 긴 서술만.
2. **단일 진입점** — `system.json` (루트)에서 모든 리소스로 분기.
3. **토큰은 theme-map으로** — Light/Dark 양쪽 값이 필요하면 `tokens/theme-map.json` 한 번만 읽기.
4. **런타임 의존성은 `window.demoMatrix`** — 정적 관계는 `system.json.components[].usedInDemos`.

---

## 📍 "I want to... → Read this"

| 목표 | 첫 번째 read | 두 번째 read (필요 시) |
| --- | --- | --- |
| 시스템 전체 파악 | `system.json` | — |
| 특정 컴포넌트 스펙 | `components/<id>.schema.json` | `components/<id>.md` (UX Writing 등 서술 필요 시) |
| 컴포넌트 HTML snippet | `components/<id>.schema.json` → `variants[].html` | — |
| 컴포넌트 토큰 매핑 | `components/<id>.schema.json` → `tokens{}` | — |
| **Light/Dark 토큰 대조** | `tokens/theme-map.json` | — |
| Primitive(원시) 컬러 팔레트 | `tokens/primitives.json` | — |
| 타이포그래피 스케일 | `tokens/typography.json` | — |
| 사이즈·반경·Elevation·Motion | `tokens/{sizing,radius,elevation,motion,z-index}.json` | — |
| 특정 데모가 쓰는 컴포넌트 | `system.json` → `demos[id].uses[]` | — |
| 특정 컴포넌트를 쓰는 데모들 | `system.json` → `components[id].usedInDemos[]` | (런타임) `window.demoMatrix.byComponent[id]` |
| 자주 쓰는 조합 패턴 | `snippets/patterns.json` | — |
| 그라데이션 정책 | `docs/04-gradient-policy.md` | — |
| UX Writing 규칙 | `docs/05-ux-writing.md` | 컴포넌트별은 `.schema.json.uxWriting[]` |
| 원칙·네이밍·토큰 아키텍처 | `docs/{01-principles,02-token-architecture,03-naming-conventions}.md` | — |
| 변경 이력 / 릴리스 노트 | `CHANGELOG.md` | — |

---

## 🔧 자주 하는 작업

### 새 컴포넌트 추가
1. `schemas/component.schema.json` 구조 참고
2. `components/<newid>.schema.json` 작성 (필수 필드: `id`, `name`, `version`, `category`, `description`, `variants[]`)
3. `components/<newid>.md` 작성 (선택 — 긴 서술이 필요할 때만)
4. `index.html` 에 `<section class="component-section" id="newid">` 추가
5. `assets/css/main.css`에 스타일 추가
6. `system.json.components[]` 배열에 엔트리 추가
7. 사이드바 링크 (`index.html`) · `assets/js/main.js`의 `CATEGORIES['components'].items` 에 등록
8. `CHANGELOG.md` 에 Added 엔트리

### 새 토큰 추가
1. `tokens/primitives.json` 에 원시값 추가 (`--p-*`)
2. `tokens/semantic.light.json` + `tokens/semantic.dark.json` 에 매핑 추가 (`--sm-*`)
3. `tokens/theme-map.json` 에 Light/Dark pair 추가
4. `assets/css/main.css` `:root` 및 `[data-theme="dark"]` 블록에 CSS 변수 추가
5. 관련 컴포넌트 `.schema.json.tokens{}` 업데이트
6. `CHANGELOG.md` 에 Added 엔트리

### 컴포넌트 · 토큰 수정 시 영향 확인
**정적 (컴파일 타임)**:
```bash
cat system.json | jq '.components[] | select(.id=="button") | .usedInDemos'
```

**런타임 (브라우저 콘솔)**:
```js
window.demoMatrix.byComponent['button']  // ["demo-login", "demo-signup", ...]
window.demoMatrix.byToken['--sm-interactive-brand-default']
```

---

## 🚦 토큰 해석 우선순위

항상 **역순**으로 해결:
1. **Component token** `--cm-<component>-<part>-<state>` — 특정 컴포넌트에서만 쓰는 예외
2. **Semantic token** `--sm-<role>-<variant>` — UI가 참조하는 의미 기반
3. **Primitive token** `--p-<category>-<scale>` — 팔레트 원재료. **직접 쓰지 말 것** (오직 `--cm-*` · `--sm-*`가 참조할 때만)

**금지**: 하드코딩 (`#4F46E5`), Hex 값 지칭, 축약어 네이밍 (`btn`, `nav`).

---

## 🔍 의존성 매트릭스 사용법

### 정적 — `system.json`에서
```json
{
  "components": [
    { "id": "button", "usedInDemos": ["demo-login", "demo-signup", "demo-pricing", ...] }
  ],
  "demos": [
    { "id": "demo-foodorder", "uses": ["textfield","tabs","badge","banner","--sm-interactive-brand-default"] }
  ]
}
```

### 런타임 — 브라우저 콘솔
```js
// 빌드: main.js의 buildDemoMatrix()가 index.html의 data-uses를 스캔
window.demoMatrix.byComponent['banner']
// → ["demo-foodorder", "demo-shopping", "demo-booking", "demo-mypage"]

window.demoMatrix.byToken['--p-indigo-500']
// → 영향 받는 모든 데모 id 목록

window.demoMatrix.missingTokens
// → 존재하지 않는 토큰을 참조한 데모 목록 (비어 있어야 정상)
```

---

## ✅ 검증 (Validator)

```bash
node scripts/validate.mjs
```
통과 조건:
- 모든 JSON 파일 유효
- `semantic.*.json` 의 모든 `"ref"`가 `primitives.json` 에 존재
- `system.json.components[].schema` 파일이 실제 존재
- `system.json.components[].usedInDemos` ↔ `index.html` 의 `data-uses` 속성 일치

---

## 🚫 AI가 실수하기 쉬운 것

1. **Single HTML 폴더 참조** — v0.5.0 에서 삭제됨. 더 이상 존재하지 않음
2. **두-색 그라데이션 사용** — `docs/04-gradient-policy.md` 참조. 브랜드 모멘트 외 금지
3. **이모지·축약어 네이밍** — `btn`/`Nav`/`CTA` 같은 축약 금지 (CTA/URL/SVG/FAQ 등 업계 관례만 허용)
4. **Hex 값 직접 쓰기** — 항상 토큰 이름 (`--sm-*`, `--p-*`) 으로
5. **컴포넌트 스펙을 MD에서만 참조** — JSON canonical. MD는 서술 보조
6. **`data-uses` 속성 누락** — 새 데모 섹션 추가 시 필수

---

## 🗺 파일 구조 (AI 관점)

```
C:\Users\dev\desgin_system\
├── system.json                        ★ AI 진입점
├── AGENTS.md                          ★ (이 문서)
├── CLAUDE.md                          (사람용 워크플로)
├── README.md                          (사람용 진입점)
├── CHANGELOG.md                       (릴리스 이력)
│
├── schemas/                           ★ JSON 메타 스키마
│   ├── component.schema.json
│   ├── token.schema.json
│   ├── demo.schema.json
│   └── snippet.schema.json
│
├── components/                        (컴포넌트 25종)
│   ├── <id>.schema.json              ★ JSON canonical
│   └── <id>.md                       (보조 서술)
│
├── tokens/                            (토큰 정의)
│   ├── primitives.json
│   ├── semantic.light.json
│   ├── semantic.dark.json
│   └── theme-map.json                ★ Light/Dark pair 집약
│
├── snippets/
│   └── patterns.json                  ★ 자주 쓰는 조합 10종
│
├── scripts/
│   └── validate.mjs                   ★ 무결성 검증
│
├── docs/                              (개념·정책 서술)
├── foundations/                       (시각 기초 서술)
│
├── index.html                         (운영 진본 — 사람이 보는 사이트)
├── assets/css/main.css
└── assets/js/main.js                  (buildDemoMatrix() 포함)
```

---

## 📡 질의 예시 (실전)

### Q1: "Banner의 hero variant는 어떻게 쓰나요?"
```
read: components/banner.schema.json
→ variants[id=hero].html
```
1 파일 read로 해결.

### Q2: "브랜드 기본 색이 다크 모드에서 뭐죠?"
```
read: tokens/theme-map.json
→ --sm-interactive-brand-default.darkValue  // "#7968EE"
```
1 파일 read로 해결.

### Q3: "Badge를 쓰는 모든 데모 리스트 주세요."
```
read: system.json
→ components[id=badge].usedInDemos
```
1 파일 read로 해결.

### Q4: "새 데모 추가할 때 체크리스트?"
```
read: AGENTS.md
→ "새 컴포넌트 추가" 섹션 (또는 CLAUDE.md의 "예시 C")
```
1 파일 read로 해결.

---

*AI가 참조하는 파일의 최상단에는 항상 `$schema` 필드가 있음 — 필요 시 `schemas/` 폴더의 해당 스키마로 구조 검증 가능.*
