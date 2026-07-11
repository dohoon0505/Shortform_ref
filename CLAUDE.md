# CLAUDE.md — 기여 가이드라인 (v5 scroll-driven 인터랙션 카탈로그)

Web Reference Lab — 디자이너용 **인터랙션 애니메이션 카탈로그**. 한 카테고리(예: "스크롤 텍스트 로드") 안에 그 카테고리의 대표 패턴 N종을 Framer 마켓플레이스 스타일로 저장한다. 각 패턴은 **standalone HTML 페이지**(검정 배경 + Pretendard + 한국어 본문)로 작성되어 **iframe으로 임베드**되며, **스크롤 진행률(0~1)에 1:1 매핑되어 텍스트가 순차적으로 reveal**되는 것이 핵심. 자동 재생은 사용하지 않는다.

본 문서는 **2026-05-27 첫 카테고리(스크롤 텍스트 로드, 10 패턴 v3 — scroll-pin + 진행률 매핑)** 기준으로 작성. 이전 가이드(사이트 분석 Flow Mode v2, Mirror Mode, Tier-A, inline 데모 v1, 자동 재생 iframe v2)는 모두 폐기. 이 문서가 유일한 표준.

---

## 🚨 자동화 실행 프로토콜

AI 에이전트는 사용자의 반복 지시 없이도 다음 4대 원칙을 **무조건 자동 수행**한다.

1. **언어 100% 한국어** — 사고 과정·진행 보고·오류·최종 답변 전부
2. **채팅창 코드 금지** — 산출물은 파일 시스템에 직접 저장. 실행 가능한 형태로
3. **선 실측 후 코딩** — Playwright로 참고 사이트(예: Framer 마켓플레이스)의 실측 데이터를 수집한 후 카탈로그 디자인/구조를 결정
4. **자가 검증 루프 강제** — "확인했습니다" 텍스트 자기보고 금지. preview_start로 로컬 서버 띄우고 모든 패턴 페이지를 직접 진입해 사이드바·라이브 데모·코드 스니펫 가시성·.on 클래스 부여까지 정량 검증

---

## 프로젝트 개요

실제 운영 중인 웹사이트 / Framer·GSAP·Codrops 등에서 발견되는 인터랙션 애니메이션 패턴을 디자이너용 카탈로그로 정리.

### 단일 작업 표준 — Category Mode v1

| 항목 | 사양 |
|------|------|
| 분석 단위 | 한 카테고리(예: 스크롤 텍스트 로드 / 호버 카드 / 가로 스크롤 / 패럴랙스 등) |
| 카테고리당 패턴 수 | 8~12종이 적정 (10종 권장) |
| 사이드바 | `system.json.references[].type === 'category'` 자동 분리 → "인터랙션 카탈로그" 그룹 위쪽 배치 |
| 펼침 | `categoryMode: true` 플래그 → 모든 패턴이 sub-link로 일자 나열 (사이트 분석의 flowMode와 동일 메커니즘 재활용) |
| 라이브 데모 | **standalone HTML 페이지를 iframe으로 임베드** (Framer 마켓플레이스 시그니처). 검정 배경(#000) + Pretendard Variable + 한국어 본문 + **scroll-pin 진행률 매핑** + ↻ 다시 보기 버튼 + 하단 progress bar |
| 패턴마다 (15 블록) | 요약 + iframe 데모 + 작동 원리 + 정량 메타(KV) + 코드 스니펫 3개(HTML/CSS/JS) + **사용 가이드** + **활용 추천** 4건 + 트레이드오프 |
| 활용 추천 | 히어로 헤더 / 랜딩 페이지 / 제품 섹션 / 포트폴리오 소개 — 4가지 컨텍스트에 어떻게 적용할지 구체 사용처 |
| 디자인 톤 | 카탈로그 본문은 라이트 모드 + Pretendard. 라이브 데모 카드(다크 #0a0a0a) + 코드 블록(다크 #0a0a0a) + iframe 콘텐츠(검정 #000) |
| 참고 자료 | Framer 마켓플레이스 컴포넌트 페이지 (Inter 다크 톤 + iframe 라이브 데모 + H2 섹션 분할 구조) |

### 산출 위치

```
analyses/{category-id}/analysis.json          ← 보고서 데이터 (overview + N 패턴 섹션)
demos/{category-id}/{pattern-id}.html         ← standalone 라이브 데모 (검정 + 한국어 + Pretendard)
scripts/generate-{category-id}.mjs            ← 패턴 정의 → demos + analysis.json 동시 생성기
system.json                                   ← references[]에 type: 'category' 엔트리 추가
```

캡처 디렉토리(`.playwright-mcp/`)는 카탈로그 작업에선 임시 디버그 용도로만. git 추적 금지.

---

## 절대 규칙

### 0. 측정·검증 도구는 Playwright MCP 1종 (Chrome MCP 사용 금지)

**참고 사이트 실측 (카탈로그 디자인 결정 전):**
```
mcp__playwright__browser_navigate({ url })
mcp__playwright__browser_wait_for({ time: 4 })
mcp__playwright__browser_evaluate({ function: '() => ({ ... })', filename: 'temp.json' })
mcp__playwright__browser_close()
```

**자가 검증 (카탈로그 완성 후):**
```
mcp__Claude_Preview__preview_start({ name: 'web-reference-lab' })
mcp__Claude_Preview__preview_eval({ serverId, expression: '(async()=>{ location.hash="..."; await new Promise(r=>setTimeout(r,2500)); return {...}; })()' })
mcp__Claude_Preview__preview_screenshot({ serverId })
mcp__Claude_Preview__preview_stop({ serverId })
```

**Preview 환경의 한계** — Claude Preview는 headless로 `document.visibilityState === 'hidden'` 상태가 될 수 있어, CSS transition·requestAnimationFrame이 정상 동작 안 할 수 있다. 자가 검증은 정량 가능한 영역까지(JS 실행 확인, .on 클래스 부여, CSS rule 적용, DOM 구조)만. transition 시각 효과는 실제 사용자 브라우저(visible)에서 검증된다고 신뢰.

### 1. references[].type = 'category' 패러다임

`system.json`의 references 배열에 카테고리 엔트리:

```json
{
  "id": "scroll-text-reveal",
  "title": "스크롤 텍스트 로드",
  "type": "category",
  "categoryMode": true,
  "date": "2026-05-27",
  "analysis": "analyses/scroll-text-reveal/analysis.json",
  "patternCount": 10,
  "sections": [
    { "id": "overview",         "num": "00", "title": "카테고리 개요",        "desc": "..." },
    { "id": "word-fade",        "num": "01", "title": "단어별 페이드 인",     "desc": "..." },
    { "id": "line-slide",       "num": "02", "title": "줄별 슬라이드 업",     "desc": "..." }
  ]
}
```

- `type: 'category'` → `assets/js/main.js`의 `buildSidebar`가 자동으로 별도 "인터랙션 카탈로그" 그룹으로 분리. 일반 사이트 분석 references(type !== 'category')는 기존 "레퍼런스 보고서" 그룹.
- `categoryMode: true` → 모든 sections를 사이드바 sub-link로 등록하되 **기본 닫힘 (accordion)**. 카탈로그 메인 링크 클릭 시 그 카탈로그만 펼쳐지고 다른 카탈로그는 자동으로 닫힘. 같은 카탈로그를 다시 클릭하면 토글 닫힘. sub-link(패턴 페이지) 진입 시 부모 카탈로그는 펼쳐진 상태 유지. chevron(›) 아이콘이 펼침 상태에 따라 90° 회전.
- URL: `#ref/{category-id}` → overview / `#ref/{category-id}/{pattern-id}` → 단일 패턴 페이지
- **Accordion 구현**: `.sidebar-cat-item` 클래스 + `data-ref` 속성. `highlightSidebar(id)`가 현재 URL의 ref ID에 해당하는 li만 `.is-expanded`로. CSS는 `.sidebar-sublist { max-height: 0; opacity: 0 }` → `.is-expanded > .sidebar-sublist { max-height: 1200px; opacity: 1 }` (320ms cubic-bezier). 같은 카탈로그 메인 링크를 다시 클릭하면 클릭 핸들러가 e.preventDefault + 직접 토글.

### 2. 패턴 섹션의 표준 15 블록

```
[1]  text       — 한 줄 인터랙션 의도 요약
[2]  heading    — "라이브 데모"
[3]  component  — embed: 'demos/{category-id}/{pattern-id}.html' (iframe 임베드)
                  embedHeight 옵션 (기본 480, 시그니처 sticky 패턴은 560)
                  embedLabel 옵션 (예: "01 · 단어별 페이드 인")
[4]  heading    — "작동 원리"
[5]  text       — 1~2 문단으로 메커니즘 설명
[6]  kv         — columns: 2. 의존성·트리거·이징·간격·시간·권장 글자 수 등 6항목
[7]  heading    — "코드 스니펫"
[8]  code       — lang: 'HTML'. snippetHTML (boilerplate 제외한 핵심만)
[9]  code       — lang: 'CSS'.  snippetCSS
[10] code       — lang: 'JS'.   snippetJS
[11] heading    — "사용 가이드"
[12] text       — 어떻게 사용하나 (길이·이징·접근성·주의점 1~2문단)
[13] heading    — "활용 추천"
[14] structure  — 4건 고정: 히어로 헤더 / 랜딩 페이지 / 제품 섹션 / 포트폴리오 소개
[15] note       — 트레이드오프 (성능 / 접근성 / 권장 사용처)
```

### 3. standalone 라이브 데모 HTML 규칙 (scroll-driven)

각 패턴은 `demos/{category-id}/{pattern-id}.html`에 **자급자족 HTML 페이지**로 작성. **자동 재생 사용 금지** — 모든 reveal은 스크롤 진행률에 매핑된다.

**표준 페이지 구조** (generator의 `buildDemoHTML(p)`가 자동 생성):

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <link href=".../pretendardvariable-dynamic-subset.min.css" rel="stylesheet">
  <style>
    body { background: #000; color: #fff; font-family: "Pretendard Variable", ...; }
    .demo-controls { position: fixed; top: 16px; left: 16px; z-index: 20; }
    .demo-reset { /* ↻ 다시 보기 pill 버튼 */ }
    .demo-label { /* "{num} · {title}" 라벨 */ }
    .demo-hint  { position: fixed; right: 16px; bottom: 24px; /* SCROLL ↓ */ }
    .demo-progress { position: fixed; bottom: 0; left: 0; right: 0; height: 2px; ... }
    .demo-progress > div { /* 진행률 fill */ }

    .scroll-track  { min-height: 240vh; position: relative; }
    .sticky-stage  { position: sticky; top: 0; height: 100vh;
                     display: flex; align-items: center; justify-content: center;
                     padding: 80px 8vw 60px; overflow: hidden; }

    {patternCSS}   /* .reveal { ... } 패턴별 */
  </style>
</head>
<body>
  <div class="demo-controls">
    <button class="demo-reset" onclick="window.__reset && window.__reset()">↻ 다시 보기</button>
    <span class="demo-label">{num} · {title}</span>
  </div>
  <div class="demo-hint">SCROLL ↓</div>
  <div class="demo-progress"><div></div></div>

  <div class="scroll-track">
    <div class="sticky-stage">
      {patternBodyHTML}   <!-- .reveal 마크업 -->
    </div>
  </div>

  <script>
    (function(){
      var track = document.querySelector(".scroll-track");
      var progressFill = document.querySelector(".demo-progress > div");
      function calc(){
        var rect = track.getBoundingClientRect();
        var max = Math.max(1, rect.height - window.innerHeight);
        return Math.max(0, Math.min(1, -rect.top / max));
      }

      {patternScript}  // applyReveal(p) 함수 + init 변수

      function tick(){
        var p = calc();
        progressFill.style.width = (p * 100) + "%";
        applyReveal(p);
      }
      window.addEventListener("scroll", tick, { passive: true });
      window.addEventListener("resize", tick, { passive: true });
      window.__reset = function(){ window.scrollTo({ top: 0, behavior: "smooth" }); };
      tick();
    })();
  </script>
</body>
</html>
```

**핵심 매핑 원칙**:
- `.scroll-track { min-height: 240vh; }` — 스크롤 공간 (200~250vh 권장)
- `.sticky-stage { position: sticky; top: 0; height: 100vh; }` — viewport에 텍스트 고정
- `progress = clamp(0, -rect.top / (rect.height - innerHeight), 1)` — 0~1 정규화
- `applyReveal(progress)` — 패턴별 상태 보간 (단어 인덱스 / opacity / blur / weight / 등)
- `window.scroll {passive: true}` 이벤트로 매 프레임 호출
- 사용자가 스크롤을 멈추면 reveal도 그 진행률에서 멈춤

**패턴별 매핑 함수 예시**:
```js
// scrub-color: 단어 인덱스 매핑
function applyReveal(p) {
  var idx = Math.floor(p * (N + 1));
  spans.forEach(function(s, i){ s.classList.toggle("on", i < idx); });
}

// word-fade: 단어별 [startP, +0.16] 구간에서 opacity·translateY 보간
function applyReveal(p) {
  spans.forEach(function(s, i){
    var startP = i / (N + 2);
    var localP = clamp01((p - startP) / 0.16);
    s.style.opacity = localP;
    s.style.transform = "translateY(" + (12 * (1 - localP)) + "px)";
  });
}

// blur-reveal: 단일 progress → blur·opacity 직접 매핑
function applyReveal(p) {
  var fade = clamp01((p - 0.05) / 0.7);
  el.style.opacity = fade;
  el.style.filter = "blur(" + (18 * (1 - fade)) + "px)";
}
```

**금지 사항**:
- ❌ `setTimeout` / `setInterval` 기반 자동 재생 (사용자가 스크롤 안 하면 안 움직여야)
- ❌ `IntersectionObserver` 1회 트리거 (스크롤 멈춰도 reveal이 진행되면 안 됨)
- ❌ CSS transition으로 진행률 우회 (transition은 짧게만 — 200ms 이하, 매핑은 inline style)
- ❌ ▶ 다시 재생 (자동 재생 메타포). ↻ 다시 보기(scrollTo 0)로 통일.

### 4. 코드 블록 타입 (`code`)

`main.js`의 `renderBlock`에 `code` 타입. `lang` (HTML/CSS/JS), `title`, `value` 필드. 다크 톤(#0a0a0a 배경)으로 코드를 보여줌. `escapeHtml`로 안전.

### 5. 인터랙티브 다운로드 — `.md` 내보내기

카테고리 헤더와 각 패턴 헤더에 **"인터랙티브 다운로드"** 버튼이 자동 렌더된다. 기존 참고 URL 링크는 제거. 버튼 클릭 시 그 인터랙션의 모든 가이드라인·코드 스니펫·iframe 참조가 담긴 `.md` 파일을 사용자가 다운로드.

**파일명**:
- 카테고리 페이지(`#ref/{id}`): `{id}-카탈로그.md` — 카테고리 메타 + 모든 패턴
- 패턴 페이지(`#ref/{id}/{section}`): `{id}-{sectionId}-{title}.md` — 그 패턴 단일

**구현 함수** (`assets/js/main.js`):
- `blockToMd(block)` — 블록 타입별 → markdown 변환 (heading/text/note/kv/structure/code/component/palette/stats)
- `buildCategoryMarkdown(analysis)` — 카테고리 전체 합성 (메타 테이블 + 모든 sections)
- `buildPatternMarkdown(analysis, sectionId)` — 단일 패턴 합성
- `downloadMarkdown(filename, content)` — Blob + URL.createObjectURL + a.download 트리거
- `downloadButtonHTML(opts)` — 버튼 HTML (data-download-kind/ref/section)
- `activateDownloadButtons()` — showReport 후 클릭 핸들러 wiring

**블록 → markdown 변환 규칙**:
- `heading` → `## value`
- `text` → 단락 그대로
- `note` → `> ℹ️ value`
- `kv` → `- **label** — value` (리스트)
- `structure` → `1. **label** \`tag\`\n   desc` (번호 리스트)
- `code` → ` ```lang\nvalue\n``` `
- `component` + `embed` → **fetch한 standalone HTML 전체를 ```html``` 블록으로 임베드** + 사용 안내 ("이 코드를 `{pattern-id}.html` 파일로 저장한 뒤 브라우저로 열면 동일한 데모를 로컬에서 재현할 수 있습니다")

**자급자족 .md 원칙**: 사용자가 .md 파일만 받아도 모든 데모를 로컬에서 재현 가능해야 한다. 따라서 iframe 경로만 적지 않고, 다운로드 시점에 demo HTML을 fetch해 ```html``` 코드 블록으로 임베드한다. 외부 의존성은 Pretendard CDN 1개뿐이므로 인터넷만 있으면 그대로 동작.

**구현 세부**:
- `hydrateEmbeds(sections, onlySectionId)` — 모든 `component.embed` URL을 병렬 fetch → `block._embedHTML`에 주입
- `runDownload`는 hydrate 후 `buildXxxMarkdown` → `downloadMarkdown`
- 버튼 클릭 중 `.is-busy` 클래스 + "준비 중…" 라벨 (fetch 1~3초 동안)
- 카테고리 .md 평균 70KB (10 패턴 demo HTML 모두 임베드), 패턴 .md 평균 7KB

### 6. iframe 임베드 블록 (`component` + `embed`)

`main.js`의 `renderComponent`에 `embed` 옵션. inline iframe 임베드 (modal 형태인 `preview`와 구분).

```json
{
  "type": "component",
  "embed": "demos/scroll-text-reveal/word-fade.html",
  "embedHeight": 480,
  "embedLabel": "01 · 단어별 페이드 인",
  "title": "단어별 페이드 인 라이브 데모"
}
```

렌더링 결과 (Framer 마켓플레이스 스타일):
- 검정 카드 (#0a0a0a) + 둥근 모서리 + 어두운 테두리
- 상단 바: 🟢 LIVE DEMO 펄스 라벨 + embedLabel + [새 탭] 아이콘 버튼
- viewport: 검정 배경 iframe (height = embedHeight)

CSS 클래스: `.blk-iframe-card`, `.blk-iframe-bar`, `.blk-iframe-pill`, `.blk-iframe-viewport`, `.blk-iframe-frame`.

---

## 카테고리 작업 절차 (5단계)

### Step 1 — 참고 사이트 실측

대표 패턴이 있는 사이트(Framer 마켓플레이스, GSAP, Codrops, Awwwards) 1~2건을 Playwright MCP로 navigate + 정량 데이터 수집. 페이지 톤(다크/라이트), 폰트, 섹션 구조 파악.

실측 후 임시 파일은 삭제.

### Step 2 — 패턴 8~12종 정의

카테고리에 들어갈 대표 패턴 목록을 결정. 각 패턴은:
- 인터랙션 의도가 명확히 구별
- 의존성(CSS only / Vanilla JS / GSAP)이 분명
- 라이브 사용 사례가 3건 이상 존재

스크롤 텍스트 로드 카테고리 사례 (10종):
1. 단어별 페이드 인 (word-fade)
2. 줄별 슬라이드 업 (line-slide)
3. 글자별 stagger (char-stagger)
4. 블러 해제 (blur-reveal)
5. 회색 → 본 색 (color-fade)
6. 스크롤 스크럽 컬러 (scrub-color)
7. 가로 마스크 스윕 (mask-sweep)
8. 글자 폭포 (letter-cascade)
9. Variable Font 변형 (variable-morph)
10. 밑줄 동반 진입 (underline-reveal)

### Step 3 — Generator 스크립트 작성

`scripts/generate-{category-id}.mjs`를 작성. 표준 구성 (`scripts/generate-scroll-text-reveal.mjs` 참고):

1. `CATEGORY` 메타 (id, title, type, date, url, summary)
2. `PATTERNS` 배열 — 각 패턴마다:
   - 메타: `id, num, title, summary`
   - **데모**: `demo: { bodyHTML, css, js, height }` (standalone 페이지 핵심부)
   - **코드 스니펫**: `snippetHTML, snippetCSS, snippetJS` (boilerplate 제외)
   - 분석: `explain, kv` (6항목)
   - **가이드**: `guide` (사용 방법 1~2문단)
   - **활용 추천**: `recommendations[4]` (히어로/랜딩/제품/포트폴리오 4건 고정)
   - **트레이드오프**: `tradeoff`
3. `buildDemoHTML(p)` — standalone HTML 페이지 생성 (검정 + Pretendard + ▶ 다시 재생 + 패턴 콘텐츠)
4. `buildPatternSection(p)` — 표준 15 블록 자동 생성
5. `buildOverview()` — 00 카테고리 개요 (인덱스 + 공통 토큰 + 읽기 가이드)
6. `main()` — demos/{id}/*.html 10개 저장 + analysis.json 저장

```bash
node scripts/generate-{category-id}.mjs
```

### Step 4 — system.json 등록 + validate

references[]에 type:'category' 엔트리 추가. `validate.mjs`는 `type: 'category'` 엔트리에 대해 `url` 필드를 옵셔널로 처리.

```bash
node scripts/validate.mjs                       # 5 OK / 0 warn / 0 error 통과 필수
```

### Step 5 — preview_start + 자가 검증

검증 항목:
1. 사이드바 "인터랙션 카탈로그" 그룹 자동 생성 + 메인 링크 + N+1 sub-link
2. 모든 패턴 페이지 `#ref/{category-id}/{pattern-id}` 직접 진입 시 정상 렌더
3. demos/{id}/{pattern}.html 직접 fetch 200 + 한국어 본문 + Pretendard + ▶ 다시 재생 포함
4. iframe 카드 렌더링 (LIVE DEMO pill + 새 탭 버튼 + iframe height 480~560)
5. 5개 헤딩 표시: 라이브 데모 / 작동 원리 / 코드 스니펫 / 사용 가이드 / 활용 추천
6. 활용 추천 structure 4건 (히어로 / 랜딩 / 제품 / 포트폴리오)
7. 코드 블록 3개 (HTML/CSS/JS) 다크 톤 정상 표시

Transition 시각 효과는 preview 환경의 `visibility: hidden` 한계로 검증 불가. 실제 사용자 브라우저(visible)에서 정상 작동한다고 신뢰.

---

## 데이터 모델 (analysis.json)

```json
{
  "id": "scroll-text-reveal",
  "title": "스크롤 텍스트 로드",
  "type": "category",
  "url": "https://www.framer.com/marketplace/components/text-reveal/",
  "date": "2026-05-27",
  "summary": "텍스트가 viewport에 진입할 때 어떻게 시각적으로 드러나는가...",
  "patternCount": 10,
  "sections": {
    "overview":       { "title": "00. 카테고리 개요", "blocks": [] },
    "word-fade":      { "title": "01. 단어별 페이드 인", "blocks": [] }
  }
}
```

### 블록 타입 (`assets/js/main.js`의 `renderBlock()`)

| 타입 | 용도 |
|------|------|
| `heading` | h2 헤딩 |
| `text` | 단락 텍스트 |
| `note` | i 아이콘 노트 — 트레이드오프 메모 |
| `kv` | 키-값 리스트 (`columns: 2` 권장) |
| `structure` | 순번 + 라벨 + 태그 + 설명 — 사용 사례·인덱스 |
| `component` | 라이브 데모 — `fullWidth: true`, `html`/`css`/`js` 필드 |
| `code` | 코드 스니펫 — `lang`, `title`, `value` 필드. 다크 톤 |
| `palette` / `typo` / `spacingScale` / `radiusScale` | 디자인 토큰 (잘 안 쓰지만 호환) |

---

## 핵심 인프라 파일

| 파일 | 역할 |
|------|------|
| `index.html` | 사이드바 + 메인 컨테이너 + 홈 섹션 |
| `assets/js/main.js` | 라우터(`#ref/{id}/{section}`) + `buildSidebar`(categories vs sites 자동 분리) + `renderBlock`(code 포함) + `activateComponents`(IO 진입 시 라이브 데모 JS 실행) |
| `assets/css/main.css` | 사이드바 + 블록 스타일 + `.blk-component-preview > [class*="demo-"]` 자동 박스 + `.blk-code` 다크 톤 |
| `system.json` | 단일 진입점. analysisSections + references[](type별 분리) + counts |
| `scripts/validate.mjs` | 5 OK / 0 warn / 0 error 검증. type='category'는 url 옵셔널 |

---

## 신규 그룹: 인터랙티브 웹 (`references[].type = 'web'`, 2026-06-12, v6)

기존 "인터랙션 카탈로그"(type:'category')는 **컴포넌트 단위**(버튼·카드·탭·텍스트 효과) 인터랙션이다. 신규 **"인터랙티브 웹"**(type:'web')은 컴포넌트가 아니라 **실제 웹페이지의 한 섹션 전체를 구성하는 인터랙티브 요소**(풀스크린 히어로·커튼 리빌 브랜드 스토리·핀 칼럼 피드·연혁 타임라인·시네마틱 피날레)를 다룬다. 사이드바에 별도 그룹으로 분리되며, 한 요소당 컴포넌트처럼 10개가 아니라 **연출 변형 예시 3개**(A/B/C)만 만든다.

| 항목 | 사양 |
|------|------|
| 카테고리 ID | `interactive-web` |
| references[].type | **`web`** (category와 별도 그룹) |
| 요소 수 | 10 (실제 홈페이지 위→아래 순서: 히어로→소개→사업→통계→호버→갤러리→연혁→피날레→전환) |
| 요소당 예시 | **정확히 3개** (A/B/C — 시각적으로 명확히 구별되는 연출 변형. 같은 파라미터 차이 금지) |
| 데모 수 | 30 (`demos/interactive-web/{element-id}--{example-id}.html`) |
| 데모 구동 | 스크롤형 23(scroll-track 240~280vh + sticky 100vh + applyReveal(p)) / **입력형 7**(hover·click → 클래스 토글 + CSS transition ≤200ms) |
| 요소당 블록 | **22 블록** (15블록 표준의 3예시 확장: 데모 A/B/C 각 heading+text+component) |
| 활용 추천 4건 | **기업 메인 / 브랜드 캠페인 / 병원·기관 / 제품 쇼케이스** (히어로/랜딩/제품/포트폴리오 대신 실사이트 유형) |
| 데모 콘텐츠 | 가상 브랜드 6종(한울피드·온결의원·유진정밀·선재자산운용·다온케어·휴먼라이트) — 실측 사이트 기업명·로고·사진·카피 사용 금지. 사진·비디오 대신 CSS 그라디언트 |
| 입력형 허용 | scroll-track 없이 `.stage` 단일 무대 + 이벤트 리스너 + `window.__reset`. progress bar는 상태 표시기로 전용하거나 숨김. autoplay는 여전히 금지(클릭/호버 입력 1:1) |
| 실측 근거 | 6곳 모두 — daehanfeed/doodoorim/nifco/syfund/ildongcare/amnesty 메인 페이지 raw HTML+JS 직접 분석 |
| 구현 계획서 | `plans/2026-06-11-interactive-web-category.md` (단일 사양서) |
| 생성기 | `scripts/generate-interactive-web.mjs` — buildScrollDemoHTML/buildInputDemoHTML 2종 보일러플레이트 분기 + buildElementSection(22블록) |

**type:'web' 추가 시 인프라 변경 (4파일):**
- `assets/js/main.js` — `buildSidebar` **3분기**(`webs`/`categories`/`sites`) + `injectCatalogGroup` 헬퍼로 "인터랙티브 웹" 그룹을 "인터랙션 카탈로그" **위**에 주입. 정체성 문구 4곳(overview tag·h1·md 제목·md 파일명)이 `analysis.type === 'web'`으로 분기.
- `scripts/validate.mjs` — type:'web'은 category와 달리 **url 필수**(없으면 warn). 엔트리에 url 기입으로 무수정 통과.
- `system.json` — references[] 엔트리 + counts(`references` +1, `webs` 신설, `patterns` +10, `exampleCount`).
- `index.html` — 홈에 "인터랙티브 웹" home-section + 카드(수동 하드코딩).

`renderRefItem`·`route()`·아코디언·`renderComponent` embed·.md 다운로드는 type 비의존이라 무수정 재사용(categoryMode:true + sections만 부여).

---

## 카테고리 사례 #4: Scroll-Card-Update (2026-05-27, v1)

| 항목 | 결과 |
|------|------|
| 카테고리 ID | `scroll-card-update` |
| 패턴 수 | 10 (stack-up, fade-stack, scale-pop, slide-from-right, clip-bottom, rotate-tilt, blur-swap, stack-spread, dissolve, carousel) |
| 섹션 수 | 11 (00 overview + 01~10 패턴) |
| 블록 수 | 159 |
| standalone 데모 | 10개 (`demos/scroll-card-update/*.html`, 평균 9.5KB) |
| 인터랙션 모델 | 2-column grid (좌 텍스트, 우 카드) + sticky stage + 카드별 인터랙션 변환 |
| 참고 자료 | base44.com 시그니처 (좌측 페이지네이션·타이틀·본문 + 우측 sticky 미디어 카드 시퀀스) |
| validate | 5 OK / 0 warn / 0 error |

좌측에 페이지네이션(01/04) + 타이틀 + 본문 + Start building 버튼, 우측에 sticky 미디어 카드 4개. 모든 패턴이 동일한 base44 콘텐츠(01 Speed · 02 Backend · 03 Ready · 04 Agent) + 동일 wixstatic 이미지 + Pretendard 단일 폰트. 차이는 우측 카드 전환 방식만 (stack-up·fade·scale·slide·clip·rotate·blur·spread·dissolve·carousel).

---

## 카테고리 사례 #3: Full-screen Scroll (2026-05-27, v1)

| 항목 | 결과 |
|------|------|
| 카테고리 ID | `full-screen-scroll` |
| 패턴 수 | 10 (fade-stack, horizontal-pan, zoom-into, pin-stack, parallax-layer, 3d-rotate, scroll-snap, clip-reveal, scale-handoff, caption-slide) |
| 섹션 수 | 11 (00 overview + 01~10 패턴) |
| 블록 수 | 159 |
| standalone 데모 | 10개 (`demos/full-screen-scroll/*.html`, 평균 6KB) |
| Scroll 모델 | `.scroll-track N×100vh` + `.sticky-stage 100vh` + activeIndex = floor(p × N) + slideProgress[i] = clamp(p×N - i, 0, 1) |
| 참고 자료 | Framer 마켓플레이스 "Scroll Slides" by Artem Kostenko (https://www.framer.com/marketplace/components/scroll-slides/) |
| validate | 5 OK / 0 warn / 0 error |

첨부된 .tsx 컴포넌트(Scroll Slides — sticky + activeIndex + opacity fade + progress bar)를 첫 번째 패턴(fade-stack)으로 차용하고, 가로 팬·줌인·핀 스택·패럴랙스·3D 회전·CSS 스냅·clip-path·스케일 핸드오프·캡션 슬라이드 등 9가지 변형을 비교 카탈로그로 추가. scroll-snap만 별도 보일러플레이트(CSS 단독, JS 매핑 없음)이고 나머지는 표준 sticky 매핑.

---

## 카테고리 사례 #2: Nav bar dropdown (2026-05-27, v1)

| 항목 | 결과 |
|------|------|
| 카테고리 ID | `nav-bar-dropdown` |
| 패턴 수 | 10 (mega-menu, simple-list, icon-list, multi-column, card-grid, hover-preview, animated-slide, search-bar, cascade-submenu, cta-banner) |
| 섹션 수 | 11 (00 overview + 01~10 패턴) |
| 블록 수 | 159 |
| standalone 데모 | 10개 (`demos/nav-bar-dropdown/*.html`, 평균 7KB) |
| 인터랙션 모델 | sticky nav + Menu 2 hover → dropdown opacity 0→1 + translateY -6→0 (200ms ease-out) |
| 참고 자료 | Framer 마켓플레이스 "Aave Navigation Bar" (https://www.framer.com/marketplace/components/aave-navigation-bar/) |
| validate | 5 OK / 0 warn / 0 error |

scroll-pin 패턴(스크롤 텍스트 로드)과 달리 **hover 인터랙션** 카탈로그. 표준 sticky nav 보일러플레이트(brand + 5 menu + CTA) 위에 패턴별 dropdown 내부 HTML/CSS/JS만 교체. 닫힘 120ms delay로 마우스가 메뉴와 dropdown 사이를 지나갈 때 실수로 닫히는 것을 방지.

---

## 첫 카테고리 사례: 스크롤 텍스트 로드 (2026-05-27, v3 scroll-pin + 진행률 매핑)

| 항목 | 결과 |
|------|------|
| 카테고리 ID | `scroll-text-reveal` |
| 패턴 수 | 10 (word-fade, line-slide, char-stagger, blur-reveal, color-fade, scrub-color, mask-sweep, letter-cascade, variable-morph, underline-reveal) |
| 섹션 수 | 11 (00 overview + 01~10 패턴) |
| 블록 수 | 159 (각 패턴 15 블록 × 10 + overview 9) |
| standalone 데모 | 10개 (`demos/scroll-text-reveal/*.html`, 평균 4.5KB) |
| 데모 콘텐츠 | 한국어 (Framer 영문 본문의 한국어 의역) + Pretendard Variable + scroll-pin 진행률 매핑 |
| Scroll 모델 | `.scroll-track 240vh` + `.sticky-stage 100vh` + `window.scroll` 이벤트 + `progress 0~1 → applyReveal` |
| 사이드바 | 카테고리 그룹 + 11 sub-link 자동 펼침 |
| 참고 자료 | Framer 마켓플레이스 "Text Reveal" 컴포넌트 (https://www.framer.com/marketplace/components/text-reveal/) |
| validate | 5 OK / 0 warn / 0 error |

**구현 파일**:
- `scripts/generate-scroll-text-reveal.mjs` — 표준 generator (demos + analysis.json 동시 생성, applyReveal 매핑 함수 정의)
- `analyses/scroll-text-reveal/analysis.json` — 카탈로그 데이터 본문
- `demos/scroll-text-reveal/*.html` — 10개 standalone scroll-driven 데모 페이지
- `system.json` references[]에 type: 'category' 엔트리 1개

---

## 신규 카테고리 추가 절차

```
[ ] 카테고리 슬러그 ID 결정 (예: hover-card-tilt, horizontal-scroll, parallax-layer)
[ ] Step 1: 대표 사이트 1~2건 Playwright 실측 (디자인 톤 / 폰트 / 섹션 구조)
[ ] Step 2: 패턴 8~12종 정의 (id, num, title, summary)
[ ] Step 3: scripts/generate-{category-id}.mjs 작성
    [ ] CATEGORY 메타 (id, title, type, date, url, summary)
    [ ] PATTERNS 배열 — 각 패턴: id, num, title, summary, demo{bodyHTML,css,js,height}, snippetHTML/CSS/JS, explain, kv[6], guide, recommendations[4], tradeoff
    [ ] buildDemoHTML(p) — standalone 페이지 boilerplate
    [ ] buildPatternSection(p) — 표준 15 블록
    [ ] buildOverview() — 00 카테고리 개요
    [ ] main() — demos/*.html 저장 + analysis.json 저장
    [ ] node scripts/generate-{category-id}.mjs 실행
[ ] Step 4: system.json references[]에 type:'category' 엔트리 추가
    [ ] node scripts/validate.mjs 통과 (5 OK / 0 warn / 0 error)
[ ] Step 5: preview_start + Playwright 자가 검증
    [ ] 사이드바 카테고리 그룹 + N+1 sub-link 확인
    [ ] 각 패턴 페이지 진입 + iframe 카드 + LIVE DEMO pill + 새 탭 버튼
    [ ] demos/{id}/*.html 직접 fetch 200 + 한국어 본문
    [ ] 5개 헤딩 (라이브 데모 / 작동 원리 / 코드 스니펫 / 사용 가이드 / 활용 추천)
    [ ] 활용 추천 structure 4건 (히어로/랜딩/제품/포트폴리오)
[ ] 의미 있는 단일 커밋 + push
```

---

## QA 안티패턴 (절대 금지)

- ❌ **"QA 확인 완료" 텍스트 자기보고** — 정량 데이터 또는 스크린샷 비교만
- ❌ **`validate.mjs` 통과 = 자가 검증으로 간주** — JSON 스키마 검증일 뿐
- ❌ **standalone 데모 HTML에서 외부 의존성(jQuery, GSAP 등) 사용** — 가능한 한 Vanilla. GSAP가 본질인 패턴은 코드 스니펫에서만 (CDN 임포트는 demo 페이지에서 직접)
- ❌ **자동 재생 (setTimeout/setInterval/IntersectionObserver 1회 트리거)** — 모든 reveal은 사용자 스크롤 진행률에 매핑되어야 함. 자동 재생은 Framer 시그니처와 어긋남
- ❌ **CSS transition으로 진행률 우회** — transition은 짧게(<200ms)만 사용. 핵심 매핑은 inline style로 progress에 1:1
- ❌ **▶ 다시 재생 버튼 사용** — 자동 재생 메타포. ↻ 다시 보기(scrollTo 0)로 통일
- ❌ **standalone 데모 페이지에 한국어 본문 누락** — Framer는 영문이지만 우리 카탈로그는 한국어 본문이 표준
- ❌ **scroll-track 높이를 너무 짧게(<150vh) 또는 너무 길게(>300vh) 잡음** — 240vh 권장
- ❌ **사이드바에 카테고리·사이트 그룹 수동 추가** — `buildSidebar`가 `type` 필드로 자동 분리
- ❌ **`.playwright-mcp/` 폴더를 git에 추가** — `.gitignore`에 무조건 포함
- ❌ **자동 hook 자동 커밋으로 거대 임시 파일 push** — 단일 의미 커밋으로 push

---

## 안전 / 보안

- `analysis.json`의 모든 사용자 텍스트는 `escapeHtml()`을 거쳐 렌더링됨
- `escapeHtml`은 `<`·`>`·`&`·`"`·`'` 모두 escape — attribute 안전
- `component` 블록의 `html`/`css`/`js` 필드 + `code` 블록의 `value` 필드는 attribute에 들어갔다가 풀려나옴
- `<script>` 직접 삽입 금지 — JS는 반드시 `js` 필드를 통해

---

## 컨벤션

### 파일 경로

```
analyses/{category-id}/analysis.json          ← 보고서 본문
scripts/generate-{category-id}.mjs            ← 패턴 정의 + 생성기
```

### 네이밍

- 카테고리 ID: `^[a-z0-9][a-z0-9-]*$` (예: `scroll-text-reveal`, `hover-card-tilt`)
- 패턴 ID: kebab-case (예: `word-fade`, `line-slide`)
- 날짜: ISO 8601 (`YYYY-MM-DD`)
- 섹션 번호: 두 자리 0-패드 (`00`, `01`, …)

### 브라우저 호환

- 최신 evergreen (Chrome, Firefox, Safari, Edge)
- ES2018+ 문법 허용
- `background-clip: text` 사용 시 `-webkit-` prefix 필수 (iOS Safari)
- Variable font 사용 시 `font-variation-settings` + `font-weight` 둘 다 적어주기 (폴백)

### git 운영

- `.playwright-mcp/` 폴더는 **무조건 .gitignore**
- 단일 의미 커밋으로 push. 자동 hook 자동 커밋이 누적되면 백업 + `git reset --hard origin/main` + 의미 파일 복원 + 단일 commit + push로 정리
- 커밋 메시지: `feat(scroll-text-reveal): 스크롤 텍스트 로드 카테고리 v1 — 10 패턴 라이브 데모 + 코드 스니펫` 형태

---

## 작업 순서 요약 (한 줄 정리)

```
참고 사이트 실측 → 패턴 8-12종 정의 → generate-{id}.mjs 작성 →
system.json references[]에 type:'category' 등록 → validate 통과 →
preview_start + 자가 검증 → 단일 의미 commit + push
```
