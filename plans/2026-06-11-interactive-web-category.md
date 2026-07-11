# 인터랙티브 웹 — 신규 카테고리 그룹 구현 계획서

> **작성**: 2026-06-11 (Fable 5 계획 세션) · **구현 담당**: Opus
> **목표**: 사이드바에 새 그룹 **"인터랙티브 웹"**을 신설하고, 컴포넌트 단위가 아닌 **"실제 웹 페이지의 섹션을 구성하는 인터랙티브 요소" 10종 × 예시 3개 = 데모 30개**를 표준 카탈로그로 구축한다.
> **근거**: 한국 실사이트 6곳(daehanfeed / doodoorim-clinic / nifco / syfund / ildongcare / amnesty) 실측 조사 완료 — 본 문서 §2에 요약. 모든 요소가 최소 1곳의 실측 근거에 연결된다.

---

## 0. 한눈에 보기

| 항목 | 사양 |
|------|------|
| 그룹/카테고리 | 사이드바 신규 그룹 **"인터랙티브 웹"** (기존 "인터랙션 카탈로그" 그룹 **위**에 배치) |
| references[].type | **`web`** (신설 — 기존 `category`와 구분) |
| 카테고리 ID | `interactive-web` |
| 엔트리 title | `섹션 인터랙티브 요소` |
| 섹션 수 | 11 (00 overview + 01~10 요소) |
| 요소당 예시 | **정확히 3개** (A/B/C 변형 — 시각적으로 명확히 구별) |
| standalone 데모 | **30개** — `demos/interactive-web/{element-id}--{example-id}.html` |
| 데모 구동 모델 | 스크롤형(scroll-track + sticky + progress 1:1 매핑) **23개** + 입력형(호버/클릭) **7개** — 입력형 = 요소 06·07 전체(6) + 01-C(1) |
| 산출물 | `scripts/generate-interactive-web.mjs` / `analyses/interactive-web/analysis.json` / `demos/interactive-web/*.html` 30개 / `system.json`·`index.html`·`assets/js/main.js`·(`scripts/validate.mjs` 선택) 수정 |
| 검증 | `node scripts/validate.mjs` 5 OK / 0 warn / 0 error + preview 자가 검증 (§9 체크리스트) |
| 커밋 | 단일 의미 커밋 (§10) |

**컴포넌트 vs 섹션의 구분 기준** (이 카테고리의 존재 이유):
- 기존 21개 카테고리 = 버튼·카드·탭·커서·텍스트 효과 등 **컴포넌트 단위** 인터랙션.
- 인터랙티브 웹 = 풀스크린 히어로, 커튼 리빌 브랜드 스토리, 핀 칼럼+피드, 연혁 타임라인처럼 **페이지의 한 섹션 전체가 하나의 연출 단위**인 인터랙션. 데모도 "컴포넌트 시연"이 아니라 **실제 웹페이지의 한 섹션처럼 보이는 화면**(가상 브랜드의 헤드라인·본문·CTA 포함)으로 만든다.

---

## 1. 절대 준수 사항 (CLAUDE.md 표준 상속)

1. **언어 100% 한국어** — 데모 본문·분석 텍스트·커밋 메시지 전부.
2. **자동 재생 금지** — `setTimeout`/`setInterval` 루프, IntersectionObserver 1회 트리거 금지. 모든 모션은 **스크롤·호버·클릭·드래그 입력에 1:1 매핑**. 실측 원본이 autoplay(Swiper 등)인 연출은 전부 스크럽/클릭 모델로 **번역**한다 (§6 각 요소에 번역 방식 명시).
3. **CSS transition은 200ms 이하 보조 용도만** — 핵심 매핑은 inline style로 progress/입력에 직결.
4. **↻ 다시 보기 버튼** (스크롤형: scrollTo 0 / 입력형: 상태 리셋). ▶ 재생 메타포 금지.
5. **데모는 자급자족 standalone HTML** — 외부 의존성은 Pretendard CDN 1개뿐. GSAP·Swiper·jQuery 등 라이브러리 금지(전부 Vanilla JS로 재구현).
6. **검정 배경 #000 + Pretendard Variable + 한국어 본문**.
7. **저작권** — 실측 사이트의 실제 기업명·로고·사진·카피 사용 금지. §5.4의 **가상 브랜드 6종**으로 대체. 사진 대신 CSS 그라디언트/SVG 패턴, 비디오 사용 금지(그라디언트 레이어로 대체).
8. **`.playwright-mcp/` git 추적 금지**, 자가 검증은 정량 데이터로만 (텍스트 자기보고 금지).

---

## 2. 실측 조사 요약 (2026-06-11, 6/6 접근 성공)

raw HTML + 메인 JS 직접 분석 결과. 데모 구현 시 아래 메커니즘을 Vanilla JS로 번역한다.

| 사이트 | 핵심 스택 | 섹션 단위 시그니처 (실측) |
|--------|----------|--------------------------|
| **daehanfeed.co.kr** (사료) | GSAP 3.11 ScrollTrigger(scrub:2~5 + toggleClass) + SmoothScroll, sticky/IO 미사용 | ① sec1 **멀티 패널 커튼 리빌**: rgba(255,255,255,.7) 풀사이즈 패널 4장을 scrub 타임라인에서 y:-100vh로 20% 오프셋 순차 리프트 → 비주얼이 4단계로 선명해짐 + 우측 텍스트·플로팅 카드 동시 안무 ② sec2 **핀 배경 거대 타이포**: 1474×368 SVG 워드마크를 pin 고정, opacity 0→1·y 60% 보간, 제품 카드 4장이 li별 독립 ScrollTrigger(y 50%→0)로 글자 위를 통과 ③ sec7 CAREER 배경 줌 안정화 배너 |
| **doodoorim-clinic.com** (병원) | GSAP 3.12 + Lenis(데스크톱) + Swiper 5 | ① .phil_sect **대향 분할 패널**: 좌 컬럼 y -66.66%→0 하강·우 컬럼 +66.66%→0 상승(pin + scrub:5) 3단계 톱니 맞물림 ② .program_sect **핀 멀티 장면 시퀀스**(end '+=600%'): 타이포 letter-spacing 4vw→0 수축 → 심볼 라이즈+라인 드로잉 → 로고 clip-path 가로 와이프 → 카드 translateX(100%)→0 + 홀짝 y∓6rem ③ .intro_sect pinSpacing:false **핀 오버랩**(다음 섹션이 위로 덮음) ④ .value_sect 세로 라인 height 0→100% + 좌우 지그재그 카드 ⑤ .clinic_sect 썸네일↔메인 양방향 동기 듀얼 캐러셀 |
| **nifco.co.kr** (제조) | Swiper vertical 풀페이지 + slick asNavFor + GSAP(scroller: 내부 컨테이너) + globe.gl | ① #mainNotice **핀 타이틀 + 좌열 -9rem/우열 +9rem 역방향 카드 패럴랙스** ② #mainProduct **asNavFor 듀얼 슬라이더** + 핫스팟 리플 도트 5개 ③ #footer **푸터 커튼 리빌**(y -20vh→0 scrub) ④ #mainGlobal 알파 0.05 초대형 워터마크 레이어 + 3D 지구본(이번 10선에서 보류 — §12) |
| **syfund.co.kr** (자산운용) | GSAP + Lenis + Swiper + countUp | ① sec-timeless **시네마틱 4막 피날레**(100vh): 타이포 fade-up → 이미지 3장 사방(x±120·y±80) 수렴 → x 120%/-140%/40% 발산 + 시계 scale 0.2→1 back.out 팝업 → y:-1000 플라이아웃 (원본은 once 자동 재생 — **전 구간 스크럽 번역 필수**) ② sec-mainfund **호버 → 배경 그라디언트 4레이어 크로스페이드 + 이미지 동기 교체** |
| **ildongcare.com** (헬스케어) | GSAP ScrollSmoother + Swiper 11 | ① se-02 비전 **호버 풀밴드 배경 교체 + 비호버 디밍** ② se-03 브랜드 **5분할 가로 아코디언**(호버 패널 40%/나머지 15% + 숨은 설명 펼침) ③ se-04 **핀 무대 + scrub:7 카드 스택**(±90px staggered 그리드 yPercent -70 통과, 둥근 모서리 컬러 밴드 슬라이드 인) ④ se-06 겹친 원형 버튼 3개 펼침 |
| **amnesty.or.kr** (NGO) | GSAP(유일하게 .main-intro에만) + Swiper 11 + AOS | ① .main-intro **좌 칼럼 pin(pinSpacing:false, scrub:2) + 우측 글래스(blur 8px) 통계 카드 3장 순차 통과** ② #hero-section 100vh 히어로 + 50px 가로 막대 불릿 페이징 ③ .main-donate 금액 선택 → 문장 스왑 후원 위젯 |

**관찰 종합**: 6곳 모두 ① 풀스크린 히어로로 시작, ② 핀(pin)+스크럽이 섹션 연출의 중심 문법, ③ 호버가 섹션 전체(배경·레이아웃)를 재편하는 패턴, ④ 페이지 말미의 피날레/푸터 연출이 공통. 이 4축이 10요소 선정의 뼈대다.

---

## 3. 아키텍처 변경 (4개 파일 수정 — 줄번호는 2026-06-11 HEAD 기준이므로 **수정 전 반드시 현재 코드로 재확인**)

### 3.1 `assets/js/main.js` — buildSidebar 3분기 (필수)

현재 `buildSidebar(refs)`(약 177-214행)는 `type === 'category'` / 그 외 2분기뿐이라, `type:'web'` 엔트리는 그대로 두면 "레퍼런스 보고서" 그룹으로 잘못 떨어진다.

```js
// main.js:179-180 부근 — 2분기 → 3분기
var categories = refs.filter(function (r) { return r.type === 'category'; });
var webs       = refs.filter(function (r) { return r.type === 'web'; });
var sites      = refs.filter(function (r) { return r.type !== 'category' && r.type !== 'web'; });
```

이후 기존 `#sidebar-categories` 그룹 주입 블록(약 198-213행)을 복제해 `#sidebar-webs` 그룹을 만들고 라벨을 `인터랙티브 웹`으로. **삽입 위치: "인터랙션 카탈로그" 그룹보다 위** (`insertBefore`로 catGroup 앞에). `webs.length === 0`이면 그룹 미생성.

- `renderRefItem`(147-175행)·`highlightSidebar`(977-992행)·아코디언 클릭 핸들러(997-1016행)·`route()`(1019-1054행)는 **type 비의존이므로 무수정** — 새 엔트리에 `categoryMode: true` + `sections`만 주면 아코디언·sub-link 자동 동작.
- 참고: highlightSidebar의 "하나만 펼침" 정책이 두 그룹에 걸쳐 적용된다(웹 카탈로그를 펼치면 인터랙션 카탈로그가 닫힘). **이 동작은 의도된 것으로 수용**하고 별도 분기하지 않는다.

### 3.2 `assets/js/main.js` — 정체성 문구 type 분기 (필수, 4곳)

| 위치 | 현재 | 변경 |
|------|------|------|
| `renderRefOverview` 헤더 tag (약 844행) | `'인터랙션 카탈로그'` 하드코딩 | `analysis.type === 'web' ? '인터랙티브 웹' : '인터랙션 카탈로그'` |
| `renderRefOverview` h1 (약 847행) | `escapeHtml(analysis.title) + ' 카탈로그'` | type 분기 — `'web'`이면 접미사 없이 title만(또는 `' — 인터랙티브 웹'`) |
| `buildCategoryMarkdown` 제목 (약 678행) | `'— 인터랙션 카탈로그'` | type 분기로 `'— 인터랙티브 웹'` |
| `runDownload` 카테고리 파일명 (약 833행) | `'{id}-카탈로그.md'` | type 분기로 `'{id}-인터랙티브-웹.md'` |

그 외 다운로드 파이프라인(`hydrateEmbeds`·`blockToMd`·`buildPatternMarkdown`)·`renderComponent` embed 처리(394-451행)는 type 비의존 — 무수정. **한 섹션에 component embed 블록 여러 개(본 계획은 3개) 사용 가능함이 확인됨** (renderBlock 단순 순회 + 블록별 독립 iframe + loading="lazy").

### 3.3 `system.json` — 엔트리 추가 + counts

```json
{
  "id": "interactive-web",
  "title": "섹션 인터랙티브 요소",
  "type": "web",
  "categoryMode": true,
  "date": "2026-06-11",
  "url": "https://daehanfeed.co.kr/",
  "analysis": "analyses/interactive-web/analysis.json",
  "patternCount": 10,
  "exampleCount": 30,
  "sections": [ { "id": "overview", "num": "00", "title": "카테고리 개요", "desc": "..." }, …01~10… ]
}
```

- **`url` 필드를 반드시 채운다** (대표 실측 사이트). 이유: `validate.mjs` 약 55행 규칙이 `type !== 'category' && !ref.url`이면 warn → url이 있으면 **validate.mjs 무수정으로 0 warn 통과**. (원하면 55행 조건에 `'web'` 면제를 추가해도 되지만, url 기입이 더 단순하다.)
- counts(약 1692-1696행) 수동 갱신: `references` 21→22, `categories` 21 유지, **`webs: 1` 신설**, `patterns` 210→220 (요소 10개 기준. 예시 30개는 exampleCount로 별도 표기).

### 3.4 `index.html` — 홈 카드 (필수, 누락 주의)

홈은 전부 정적 하드코딩이므로 잊으면 사이드바에만 보이고 홈에는 안 보인다.

- "수록 카테고리" 섹션(약 113-223행) **위 또는 아래에 새 home-section** `인터랙티브 웹`을 신설하고 `.analysis-card` 1장 추가: `href="#ref/interactive-web"`, 번호 대신 `WEB` 라벨 또는 `01`, 제목 "섹션 인터랙티브 요소", 설명 "실제 웹 페이지의 섹션을 구성하는 인터랙티브 요소 10종 × 예시 3 — 한국 실사이트 6곳 실측 기반".
- 카운트 문구(약 115행) 갱신: 예) "현재 21개 카테고리 · 210개 패턴 + 인터랙티브 웹 10요소 30데모".
- `.home-section`은 showHome/hideHome이 querySelectorAll로 일괄 토글하므로 섹션 추가만으로 동작(무수정).

### 3.5 `CLAUDE.md` — 표준 갱신 (커밋에 포함)

"인터랙티브 웹(type:'web') 그룹" 표준을 카테고리 사례 섹션 형식으로 추가: type 3분기, 요소당 예시 3개, 데모 파일명 규칙, 입력형 데모 허용 범위.

---

## 4. 데이터 모델

### 4.1 analysis.json 골격

```json
{
  "id": "interactive-web",
  "title": "섹션 인터랙티브 요소",
  "type": "web",
  "url": "https://daehanfeed.co.kr/",
  "date": "2026-06-11",
  "summary": "실제 웹 페이지에서 한 섹션 전체를 구성하는 인터랙티브 요소 10종. 한국 실사이트 6곳 실측 기반, 요소당 연출 변형 3예시.",
  "patternCount": 10,
  "sections": { "overview": {...}, "fullscreen-hero": {...}, …총 11키 }
}
```

### 4.2 요소 섹션의 표준 22 블록 (기존 15블록의 3예시 확장판)

```
[1]  text       — 요소 한 줄 정의 + 실측 근거 사이트 명시
[2]  heading    — "라이브 데모 A — {예시A 제목}"
[3]  text       — 예시 A 연출 설명 1~2문장 (무엇이 어떻게 움직이나)
[4]  component  — embed: demos/interactive-web/{element}--{exampleA}.html
[5]  heading    — "라이브 데모 B — {예시B 제목}"
[6]  text       — 예시 B 설명
[7]  component  — embed B
[8]  heading    — "라이브 데모 C — {예시C 제목}"
[9]  text       — 예시 C 설명
[10] component  — embed C
[11] heading    — "작동 원리"
[12] text       — 공통 메커니즘 1문단 + A/B/C 변형 차이 1문단
[13] kv         — columns: 2, 6항목 (§4.3)
[14] heading    — "코드 스니펫"   ← 대표 예시 A 기준
[15] code HTML  [16] code CSS  [17] code JS
[18] heading    — "사용 가이드"
[19] text       — 콘텐츠 길이·이징·접근성(prefers-reduced-motion 권장)·반응형 주의 1~2문단
[20] heading    — "활용 추천"
[21] structure  — 4건 고정 (§4.4)
[22] note       — 트레이드오프 (성능/접근성/권장 사용처)
```

- component 공통 옵션: `embedLabel: "{num}-{A|B|C} · {요소 제목} — {예시 제목}"`, `embedHeight`: 스크롤형 **600** / 입력형 **560**.
- overview(00)는 기존 표준 그대로: heading + summary + **요소 인덱스 structure(10건)** + 공통 디자인 토큰 kv + 읽기 가이드 + **실측 사이트 6곳 kv**(도메인 — 시그니처 한 줄) + note.

### 4.3 kv 6항목 표준 키

`의존성`(Vanilla JS only) / `트리거`(스크롤 진행률·호버·클릭·드래그) / `스크롤 트랙`(240~280vh 또는 "없음 — 입력형") / `핵심 매핑`(공식 1줄) / `권장 콘텐츠`(헤드라인 글자 수·카드 수 등) / `실측 레퍼런스`(사이트 — 섹션).

### 4.4 활용 추천 4건 — 이 그룹 전용 고정 컨텍스트

섹션 단위 요소이므로 기존(히어로/랜딩/제품/포트폴리오) 대신 **실사이트 유형 4종으로 고정**: ① **기업 사이트 메인** ② **브랜드 캠페인 페이지** ③ **병원·기관 사이트** ④ **제품·서비스 쇼케이스**. 각 건에 "이 요소를 그 컨텍스트의 어느 위치(오프닝/중반/마무리)에 어떤 콘텐츠로 쓰나"를 구체 서술.

---

## 5. standalone 데모 HTML 규격

### 5.1 공통 (30개 전부)

- `<html lang="ko">` + Pretendard Variable CDN + `background:#000; color:#fff`.
- 좌상단 `.demo-controls`: ↻ 다시 보기 + `.demo-label`("{num}-{A} · {제목}").
- 우하단 `.demo-hint`, 하단 `.demo-progress`(2px fill).
- **데모 화면 자체가 "실제 웹페이지의 한 섹션"처럼 보여야 한다**: 가상 브랜드의 섹션 라벨(예: "ABOUT US"), 한국어 헤드라인, 본문 카피, 보조 UI(인덱스·버튼 모양)까지 갖춘 완성된 섹션 화면. 추상 도형 데모 금지.
- 사진·비디오 금지 → CSS 그라디언트(2~3색)·SVG 도형·노이즈 패턴으로 미디어 카드 표현.
- 파일 크기 목표 6~12KB. 인라인 주석 불필요.

### 5.2 스크롤형 보일러플레이트 (23개) — CLAUDE.md v3 표준 그대로

`.scroll-track{min-height: 240~280vh}` + `.sticky-stage{position:sticky;top:0;height:100vh}` + `progress = clamp(0, -rect.top/(rect.height-innerHeight), 1)` + `applyReveal(p)` + `window.scroll {passive:true}` + `__reset = scrollTo 0`. 힌트 텍스트 `SCROLL ↓`.

공통 헬퍼를 매 데모 JS 상단에 포함:
```js
function clamp01(v){ return Math.max(0, Math.min(1, v)); }
function seg(p, a, b){ return clamp01((p - a) / (b - a)); }   // 구간 정규화
function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }
function backOut(t){ var c = 1.70158; t = t - 1; return t*t*((c+1)*t + c) + 1; } // 오버슈트
```
이징은 **JS에서 p에 선적용**한다 (CSS transition으로 우회 금지).

### 5.3 입력형 보일러플레이트 (7개 — 요소 06 전체, 07 전체, 01-C)

- scroll-track 없음. `.stage{height:100vh}` 단일 무대(또는 iframe 높이에 맞춘 `100%`).
- 힌트 텍스트 `HOVER` 또는 `CLICK`. progress bar는 **상태 표시기로 전용**(예: 활성 인덱스/N) 하거나 숨김.
- ↻ 다시 보기 = 상태 초기화(activeIndex=0, 클래스 제거).
- 호버 전환은 CSS transition 사용 가능하되 **200ms 이하**(CLAUDE.md 표준). 폭 변화 등 레이아웃 트랜지션도 200ms로 통일. 터치 폴백: 같은 핸들러에 click 바인딩.
- 요소 01의 예시 C(클릭 페이징)도 이 보일러플레이트.

### 5.4 가상 브랜드 6종 (실측 사이트 1:1 대응 — 콘텐츠 톤 참고용)

| 브랜드 | 업종 | 대응 실측 |
|--------|------|----------|
| 한울피드 | 사료·농축산 | daehanfeed |
| 온결의원 | 통증의학 클리닉 | doodoorim |
| 유진정밀 | 부품 제조 | nifco |
| 선재자산운용 | 금융 | syfund |
| 다온케어 | 헬스케어 | ildongcare |
| 휴먼라이트 | 인권 NGO | amnesty |

각 요소의 3예시는 가급적 서로 다른 브랜드 컨텍스트를 써서 "같은 요소의 다른 사이트 적용"처럼 보이게 한다. 카피는 전부 창작(실사이트 문구 인용 금지).

---

## 6. 10요소 상세 스펙 (01~10 = 실제 홈페이지의 위→아래 순서)

> 표기: 데모 파일은 `demos/interactive-web/{element-id}--{example-id}.html`. "윈도 보간"은 `localP = seg(p, start, end)` 후 opacity/transform inline 적용을 뜻한다.

### 01 `fullscreen-hero` — 풀스크린 히어로 오프닝 (track 240vh, A·B 스크롤형 / C 입력형)

페이지 최상단 100vh를 점유하는 오프닝 섹션. 6곳 전부의 공통 문법. 원본의 autoplay 슬라이더는 스크럽·클릭으로 번역.
**실측**: daehanfeed #visual(스크럽 헤드라인 순차 인) / syfund sec-hero(타이포 솟아오름+SCROLL 유도) / amnesty #hero-section(막대 불릿 페이징).

| 예시 | id | 연출 | 핵심 메커니즘 |
|------|----|------|--------------|
| A | `scrub-intro` | 영문 헤드라인→구분선→한국어 카피→CTA가 순차 슬라이드 인 | 요소 i 윈도 [0.08+i*0.12, +0.16]: opacity=localP, translateX(40px→0). 구분선 scaleX(localP), origin:left. 배경 그라디언트 scale 1.12−0.12*seg(p,0,0.6) |
| B | `kenburns-settle` | 확대된 배경이 줌 아웃되며 딤이 걷히고 타이포가 또렷해짐 | 배경 scale(1.15−0.15*seg(p,0,0.7)), 딤 opacity 0.65*(1−seg(p,0,0.6)), 타이포 letter-spacing 0.3em→0.02em 보간. 후반 [0.7~1] 콘텐츠 y·opacity 퇴장(핸드오프 암시) |
| C | `bullet-paging` | 가로 막대 불릿 클릭으로 배경 무드+카피 세트 크로스페이드 (자동 전환 없음) | 슬라이드 3장 absolute 스택, click→activeIndex→`.on` 토글(opacity 크로스페이드 200ms) + 신규 카피 translateY(16px→0). 활성 불릿 막대 fill |

### 02 `curtain-panel-reveal` — 멀티 패널 커튼 리빌 스토리 (track 260vh, 전부 스크롤형)

미디어 카드를 덮은 패널들을 스크롤로 한 장씩 물리적으로 걷어내는 브랜드 스토리 섹션. 좌 비주얼 + 우 텍스트 2단 구성, 같은 p로 동시 안무.
**실측**: daehanfeed sec1 (패널 4장 y:-100vh 20% 오프셋 순차 + 우측 텍스트 + 플로팅 카드).

| 예시 | id | 연출 | 핵심 메커니즘 |
|------|----|------|--------------|
| A | `vertical-stack` | 반투명 흰 패널 4장이 한 장씩 위로 벗겨져 4단계로 선명해짐 | 패널 i 윈도 [0.15+i*0.15, +0.18]: translateY(−110%*localP). rgba(255,255,255,0.7) absolute 풀사이즈. 우측 텍스트 [0.2~0.45] translateX(40px→0), 플로팅 카드 [0.5~0.8] translateY(60px→0) |
| B | `blind-slats` | 가로 슬랫 8장이 위→아래 시차로 접히는 블라인드 리빌 | 슬랫 i(height 12.5%) 윈도 [0.15+i*0.06, +0.18]: scaleY(1−localP), origin:top. 노출 완료 후 p>0.65 캡션 라이즈 |
| C | `diagonal-clip` | clip-path 다각형이 대각선으로 쓸려 나가며 공개 | 오버레이 clip-path polygon 꼭짓점을 p로 직접 보간(좌상→우하 스윕) + 미디어 scale 1.06→1 동시 보간, 텍스트 [0.3~0.6] 동반 진입 |

### 03 `pinned-watermark-typo` — 핀 워터마크 타이포 무대 (track 260vh, 전부 스크롤형)

거대 워드마크를 배경층에 고정하고 전경 카드가 다른 속도로 그 위를 통과하는 z-레이어 제품 쇼케이스. 텍스트가 "읽히는 효과"(scroll-text-reveal)가 아니라 **무대 배경**으로 기능하는 것이 구분점.
**실측**: daehanfeed sec2 (pin .bgTxt + 카드 4장 독립 스크럽) / nifco #mainGlobal (알파 0.05 워터마크 레이어).

| 예시 | id | 연출 | 핵심 메커니즘 |
|------|----|------|--------------|
| A | `rise-grid` | 워터마크가 떠오르는 동안 비대칭 그리드 카드 4장이 시차 통과 | 워터마크(font-size 18vw, pointer-events:none): opacity=seg(p,0,0.35)*0.14, translateY(8vh→0). 카드 i 윈도 startP 0.15/0.3/0.45/0.6: translateY(36vh→0) — 층간 속도비 ≈1:4 패럴랙스 |
| B | `outline-fill` | 아웃라인 타이포가 좌→우로 면 채움되며 무대 완성 | 동일 텍스트 2벌 중첩: 아래층 -webkit-text-stroke:1px 고정, 위층 clip-path:inset(0 calc(100%−p*100%) 0 0) + 전체 scale(1.06−0.06p). 중앙 콘텐츠 [0.35~0.75] 진입 |
| C | `horizontal-drift` | 워터마크가 스크롤 1:1로 가로 드리프트(마퀴 아님 — 멈추면 같이 멈춤) | 워터마크 translateX(−p*30vw) 직결. 카드 행 2줄 translateX(∓12vw*(1−p)) 대향 진입. infinite-marquee와의 차별점(진행률 1:1·역재생 가능)을 데모 카피로 명시 |

### 04 `opposed-split-panel` — 대향 분할 패널 스토리 (track 280vh, 전부 스크롤형)

100vh 핀 무대를 분할하고 패널 스택을 서로 반대 방향으로 슬라이드시켜 장면이 톱니처럼 맞물리는 철학/스토리 섹션.
**실측**: doodoorim .phil_sect (좌 −66.66%→0 / 우 +66.66%→0, 3단계) / nifco #mainNotice (±9rem 역방향 보강 근거).

| 예시 | id | 연출 | 핵심 메커니즘 |
|------|----|------|--------------|
| A | `dual-columns` | 좌 컬럼 하강·우 컬럼 상승 연속 보간, 장면 역재생 가능 | 컬럼당 100vh 아이템 3개 flex 스택. leftY=−66.66%*(1−p), rightY=+66.66%*(1−p). 아이템 콘텐츠를 엇갈리게 설계해 임의 p에서 좌우 합이 한 장면이 되게 |
| B | `center-open` | 화면을 덮은 좌·우 패널이 양옆으로 열리며 중앙 메시지 공개(문 메타포) | 좌 translateX(0→−100%)·우 translateX(0→+100%) + 중앙 콘텐츠 scale 0.9→1·opacity 0→1 동시 보간 |
| C | `step-snap` | 진행률을 3스텝 양자화 — 장면 경계에서 '찰칵' 맞물림 | rawP=p*3, idx=floor(rawP), local=easeInOut(clamp01((rawP−idx−0.3)/0.4)) — 스텝 간 40%만 이동·60% 정지. y=−(idx+local)*33.33% 좌우 부호 반전 |

### 05 `pinned-column-feed` — 핀 칼럼 + 통과 피드 (track 260vh, 전부 스크롤형)

소개 칼럼을 핀 고정하고 반대쪽 카드 피드(통계·뉴스·가치)가 스쳐 올라가는 2컬럼 섹션. **고정 대상이 칼럼**이라는 점에서 scroll-card-update(카드 제자리 교체)와 반대.
**실측**: amnesty .main-intro / nifco #mainNotice / ildongcare se-04 — 3예시가 실측 사이트와 1:1 대응.

| 예시 | id | 연출 | 핵심 메커니즘 |
|------|----|------|--------------|
| A | `glass-stats` | 핀 소개 칼럼 옆으로 글래스 통계 카드 3장 순차 통과 (amnesty형) | 좌 40% position:sticky 칼럼. 우 카드 i 윈도 [i*0.18+0.1, +0.25]: translateY(80px→0)·opacity 0.25→1, 후반 −40px 떠밀림. backdrop-filter:blur(8px)+반투명 보더 |
| B | `counter-rails` | 좌열 위로·우열 아래로 어긋나는 역방향 2열 뉴스 그리드 (nifco형) | 핀 타이틀 sticky + 좌열 ul translateY(−p*9rem)·우열 +p*9rem. 배경 레이어 [0~0.3] opacity 인 후 translateY(−p*30%) 3중 시차 |
| C | `stage-drift` | 둥근 컬러 밴드가 측면 진입해 무대를 깔고 ±90px 그리드가 통째로 드리프트 (ildongcare형) | 밴드 translateX(100%→0)를 [0~0.2] 매핑(border-radius 400px 0 0 400px). 그리드 translateY(−70%*seg(p,0.15,1)), 카드 2·3열 ±90px 정적 오프셋. scrub:7 관성감은 표시값 lerp(cur+=(target−cur)*0.08)를 scroll 핸들러 내에서 1회 갱신해 근사 |

### 06 `hover-focus-band` — 호버 포커스 풀밴드 (입력형 3개)

사업영역·비전·라인업 밴드에서 호버가 **섹션 전체의 배경·레이아웃을 재편**하는 포커스 섹션. image-hover(개별 이미지 효과)·animated-tabs(클릭 탭)와 구분: 입력은 리스트지만 응답은 풀밴드.
**실측**: ildongcare se-02(배경 교체+디밍) / se-03(폭 아코디언) / syfund sec-mainfund(리스트→이미지+배경 무드 동기).

| 예시 | id | 연출 | 핵심 메커니즘 |
|------|----|------|--------------|
| A | `bg-dim-focus` | 호버 항목 전용 배경이 풀밴드에 깔리고 나머지 항목 디밍 (ildongcare 비전형) | 배경 그라디언트 레이어 3장 absolute 스택 → hover idx만 opacity 1 (200ms). 형제 li opacity 0.25 + translateY(6px) 후퇴 |
| B | `width-accordion` | 5분할 세로 패널 — 호버 패널 40%/나머지 15% 확장 + 숨은 설명 펼침 (ildongcare 브랜드형) | li flex-basis 20%→hover 40%/형제 15% (transition 200ms). .desc max-height 0→140px + opacity. JS는 클래스 토글만 |
| C | `list-media-sync` | 좌 리스트 호버 → 우 미디어 교체 + 섹션 배경 무드 크로스페이드 동기 (syfund형) | mouseenter→data-idx 매칭: 미디어 스택 opacity 스왑 + 배경 레이어 4장 크로스페이드(blur 1px↔0, 200ms). 활성 항목 밑줄 scaleX(0→1). click 폴백 동일 핸들러 |

### 07 `synced-dual-gallery` — 듀얼 동기 갤러리 (입력형 3개)

썸네일·텍스트·핫스팟과 풀블리드 메인 뷰가 **단일 상태 idx로 동기 전환**되는 제품 갤러리 섹션. autoplay 없음 — 클릭/드래그만.
**실측**: doodoorim .clinic_sect(Swiper 듀얼 controller) / nifco #mainProduct(asNavFor + 핫스팟 도트 5개).

| 예시 | id | 연출 | 핵심 메커니즘 |
|------|----|------|--------------|
| A | `thumb-main` | 썸네일 클릭 → 메인 크로스페이드 + 진행바·카운터(01/03) 동기 (doodoorim형) | click→idx→메인 absolute 스택 opacity 스왑(200ms), 썸네일 보더 링+scale 1.04, 진행바 width=(idx+1)/N*100%, 카운터 padStart |
| B | `pair-nav` | prev/next 클릭에 텍스트 패널·이미지가 한 몸으로 전환 (nifco형) | 버튼 click→양 레이어 동시 idx 스왑: 이미지 크로스페이드 + 텍스트 translateY(24px→0)·opacity 진입(200ms), 비활성 즉시 숨김 |
| C | `hotspot-stage` | 메인 위 핫스팟 도트 클릭 → 그 위치에 캡션 카드 + 하단 리스트 동기 하이라이트 | 도트 click→캡션 absolute(도트 좌표) 표시 + 리스트 같은 idx `.on`. 도트 hover 링 scale 1→1.6(200ms). 다른 도트 클릭 시 이전 캡션 닫힘 |

### 08 `history-timeline` — 연혁 타임라인 섹션 (track 280vh, 전부 스크롤형)

기준 라인이 스크롤에 비례해 자라고 연도 노드 점등 + 이벤트 카드 진입 — "스크롤 진행 = 시간의 진행". 라인은 **div height/scaleY 보간**으로 구현해 scroll-path-draw(SVG 스트로크)와 기법 구분. 연혁 콘텐츠 자체는 한국 기업 사이트 일반 관습(실측 보강: doodoorim .value_sect가 구조 동일).
**실측**: doodoorim .value_sect (라인 height 0→100% scrub + 짝홀 카드 x∓50 지그재그) + 일반 관습 명시.

| 예시 | id | 연출 | 핵심 메커니즘 |
|------|----|------|--------------|
| A | `zigzag-line` | 중앙 세로 라인이 자라며 좌우 교차 연도 카드 진입 | 라인 scaleY(p), origin:top (GPU). 카드 i 윈도 [(i+0.5)/N−0.08, +0.12]: translateX(∓48px→0)·opacity. 노드 scale 0.4→1 + 글로우 보간. 역스크롤 시 소등 |
| B | `pinned-year` | 좌측 고정 대형 연도가 구간마다 이산 교체, 우측 항목이 옆을 흐름 | 좌 sticky 칼럼 + idx=floor(p*N) → 연도 플레이트 `.on` 스왑(translateY 교체 180ms — number-counter류 보간 카운터 아님). 우 리스트 translateY(−p*(listH−vh)) |
| C | `horizontal-era` | 핀 무대에서 가로 연대표 트랙이 좌로 이동, 중앙 기준선 통과 노드 점등 | 트랙 translateX(−p*(trackW−vw)). 매 tick 노드 getBoundingClientRect 중심이 50vw 통과 판정→`.on`, 카드 maxHeight·opacity localP 보간. scrollx-card(카드 흐름)와 달리 기준선 판정 + 연대기 정보 구조가 본체 |

### 09 `cinematic-finale` — 시네마틱 멀티 페이즈 피날레 (track 280vh, 전부 스크롤형)

페이지 말미 100vh 무대에서 오브제·심볼·타이포가 수렴→발산→정착하는 다막 피날레. **원본(syfund)은 once 자동 타임라인 — 전 구간을 p 페이즈 분할로 번역해 되감기 가능하게 만드는 것이 핵심 차별화.**
**실측**: syfund sec-timeless(4막) / doodoorim .program_sect(4장면 핀 시퀀스).

| 예시 | id | 연출 | 핵심 메커니즘 |
|------|----|------|--------------|
| A | `converge-burst` | 이미지 카드 3장 수렴→발산, 빈 중앙에 심볼 backOut 팝업, 카드 퇴장 | 페이즈 경계 [0, 0.3, 0.55, 0.8, 1]. ①카드 i translate(±120px,±80px→0)·scale 0.9→1 ②심볼 scale=backOut(seg(p,0.3,0.55)) + 내부 바늘 rotate=p*720deg(무한 keyframes 금지 — 스크럽 직결) ③발산 좌표(x 120%/−140%/40%) ④카드 y −120vh 가속 퇴장(seg²) |
| B | `scene-chain` | 대형 타이포→심볼+라인→로고 와이프 3장면 크로스페이드 체인 (doodoorim DODA형) | sceneP_i=clamp01(p*3−i). 장면 opacity=삼각 윈도(enter−exit), exit 시 translateY(−4vh)·enter +4vh. 1장면 letter-spacing 0.4em→0 수축, 3장면 로고는 blur(6px) 사본 위 선명본 clip-path:inset(0 100%→0 0 0) 가로 와이프 |
| C | `frame-settle` | 발산한 오브제들이 화면 모서리에 액자처럼 정착해 중앙 카피를 둘러싼 포스터 엔딩 | 발산 목적지를 (±38vw, ±34vh)로 설정, d=seg(p,0.55,0.85) 보간 + scale 1→0.55·rotate ±6deg. 중앙 카피 [0.7~1] letter-spacing 0.3em→0.05em 수축 등장 |

### 10 `section-handoff` — 핀 오버랩 섹션 전환·푸터 리빌 (track 240vh, 전부 스크롤형)

섹션과 섹션 **사이의 이음새 자체**를 연출 단위로 삼는 전환 요소 — 레이어가 레이어를 덮고 벗기는 z-축 핸드오프. scroll-color-morph(배경색 전환)와 달리 **레이어 기하 전환**이 본체.
**실측**: doodoorim .intro_sect(pinSpacing:false 핀 오버랩) / nifco #footer(y −20vh→0 커튼 리빌).

| 예시 | id | 연출 | 핵심 메커니즘 |
|------|----|------|--------------|
| A | `cover-up` | 고정된 앞 섹션 위로 다음 섹션이 카드처럼 올라와 덮음 | A는 sticky 무대 고정, B는 absolute 풀사이즈 translateY((1−p)*100vh) + 상단 border-radius 32px→0 보간. transform만 변화(리플로우 없음) |
| B | `push-recede` | 덮이는 순간 아래 섹션이 스케일 다운·딤 — 뒤로 밀려나는 깊이 강조 | A에 scale(1−0.08p)·brightness(1−0.45p) 중첩 + 라운드 컨테이너로 가장자리 노출. B 진입은 A와 동일 |
| C | `footer-curtain` | 마지막 섹션이 떠나면 아래 깔린 푸터가 −20vh에서 따라 내려와 정착 (nifco형) | 콘텐츠 섹션 일반 흐름 스크롤 아웃, 푸터 콘텐츠 translateY(−(1−p)*20vh)·opacity 0.6→1. 푸터 내부 3컬럼 startP 차등 미세 스태거 + 상단 보더 scaleX(0→1). 콘텐츠 하단 box-shadow로 들림 경계 |

---

## 7. Generator 사양 — `scripts/generate-interactive-web.mjs`

`scripts/generate-infinite-marquee.mjs`(최신 표준) 골격을 복제·확장:

1. `CATEGORY` 메타: `{ id:'interactive-web', title:'섹션 인터랙티브 요소', type:'web', date:'2026-06-11', url:'https://daehanfeed.co.kr/', summary }`.
2. `ELEMENTS` 배열(10건) — 요소당:
   ```
   { id, num, title, summary, evidence,
     examples: [  // 정확히 3건
       { key:'a', id, title, desc,                 // desc = 블록 [3]/[6]/[9]용
         demo: { mode:'scroll'|'input', trackVh, bodyHTML, css, js, height } },
       …b, c
     ],
     explain, kv[6], guide, recommendations[4], tradeoff,
     snippetHTML, snippetCSS, snippetJS }          // 대표 예시 A 기준
   ```
3. `buildDemoHTML(el, ex)` — `mode`에 따라 §5.2/§5.3 보일러플레이트 분기. 파일명 `{el.id}--{ex.id}.html`.
4. `buildElementSection(el)` — §4.2 표준 22블록 생성.
5. `buildOverview()` — 00 개요(요소 인덱스 10건 + 공통 토큰 + 실측 사이트 6곳 kv + 읽기 가이드).
6. `main()` — `demos/interactive-web/` 30개 + `analyses/interactive-web/analysis.json` 저장. 콘솔에 파일 수·블록 수 출력.

실행: `node scripts/generate-interactive-web.mjs` → 30 demos + analysis.json(11 섹션, 22*10+overview ≈ 229 블록).

---

## 8. 구현 절차 (순서 고정)

```
[1] 본 계획서 §3의 줄번호를 현재 코드와 대조 (drift 가능성 — grep으로 재확인)
[2] scripts/generate-interactive-web.mjs 작성 → 실행 → demos 30 + analysis.json 생성
[3] assets/js/main.js 수정 (buildSidebar 3분기 + 정체성 문구 3곳 분기)
[4] system.json 등록 (url 필수!) + counts 갱신 — main.js 수정과 같은 커밋이어야 함
[5] index.html 홈 섹션 + 카운트 문구
[6] CLAUDE.md 표준 추가
[7] node scripts/validate.mjs → 5 OK / 0 warn / 0 error
[8] preview_start 자가 검증 (§9)
[9] 단일 커밋 + push (§10)
```

## 9. 자가 검증 체크리스트 (preview_eval 정량 판정)

1. 사이드바에 **"인터랙티브 웹" 그룹이 "인터랙션 카탈로그" 위에** 생성 + 메인 링크 1 + sub-link 11(00~10).
2. 아코디언: 메인 링크 클릭 시 펼침/재클릭 시 닫힘, 다른 카탈로그 펼치면 닫힘 (기존 메커니즘 상속 확인).
3. `#ref/interactive-web` overview 렌더 + 헤더 tag가 **"인터랙티브 웹"**(카탈로그 아님).
4. 10개 요소 페이지 `#ref/interactive-web/{element-id}` 직접 진입 — **component iframe 카드 3개씩** 렌더(LIVE DEMO pill + 새 탭 버튼 + height 600/560).
5. demos 30개 직접 fetch 200 + 한국어 본문 + Pretendard + "↻ 다시 보기" 포함 + (스크롤형) `.scroll-track`/`.sticky-stage` 존재.
6. 스크롤형 데모: preview_eval로 `scrollTo(0, track높이*0.5)` 후 progress fill width > 0 및 보간 대상 inline style 변화 확인 (CSS transition 시각 효과는 preview 한계로 미검증 — 표준 단서).
7. 헤딩 구조: "라이브 데모 A/B/C·작동 원리·코드 스니펫·사용 가이드·활용 추천" 표시.
8. 활용 추천 structure 4건 = 기업 메인/브랜드 캠페인/병원·기관/제품 쇼케이스.
9. 코드 블록 3개(HTML/CSS/JS) 다크 톤.
10. 인터랙티브 다운로드: overview에서 `.md` 다운로드 트리거 → 파일명 `interactive-web-인터랙티브-웹.md` + ```html 임베드 30개 포함(hydrateEmbeds 다중 embed 동작 확인).
11. 홈에 새 home-section + 카드 + 갱신된 카운트 문구.

## 10. 커밋

```
feat(interactive-web): 인터랙티브 웹 그룹 신설 — 섹션 인터랙티브 요소 10종 × 예시 3 (실사이트 6곳 실측 기반)
```
단일 커밋에 포함: generator + analysis.json + demos 30 + main.js + system.json + index.html + CLAUDE.md + 본 계획서.

## 11. 리스크 / 주의 (코드베이스 분석에서 도출)

- **main.js 미수정 + system.json 선등록 금지** — type:'web'이 "레퍼런스 보고서" 그룹으로 잘못 표시됨. 반드시 같은 커밋.
- **validate warn**: url 누락 시 0 warn 기준 미달 → §3.3대로 url 기입.
- **overview 페이지 iframe 30개 동시 렌더** — renderRefOverview가 전 섹션 인라인 렌더. loading="lazy"가 있으므로 수용하되, 데모를 그라디언트 전용 경량(6~12KB)으로 유지해 완화. 문제 시 후속 과제로 overview에서 데모 블록 생략 검토(이번 범위 아님).
- **사이드바 sublist max-height 1200px** — sub-link 11개는 기존 카테고리와 동일 수준이라 안전.
- **데모 30개 품질 편차** — 요소당 예시 3개가 "같은 연출의 파라미터 차이"로 수렴하면 안 됨. §6 표의 A/B/C는 메커니즘 자체(스택 리프트 vs 슬랫 vs 클립, 연속 vs 스텝 vs 개폐)가 다르도록 설계했으므로 그대로 구현.
- **기존 카테고리와의 경계**: 03↔scroll-text-reveal·infinite-marquee, 05↔scroll-card-update, 06↔image-hover·animated-tabs, 08↔scroll-path-draw·number-counter·scrollx-card, 10↔scroll-color-morph — 각 요소 [1] text와 사용 가이드에 구분 근거 1줄을 반드시 포함(§6에 명시된 구분점 활용).

## 12. 이번 범위에서 보류한 후보 (차기 확장)

- `global-network-map` (nifco globe.gl — 거점 지도/드래그 글로브): 단일 사이트 근거 + canvas 구면 투영 비용으로 보류. 차기 Vol.2 1순위.
- `interactive-cta-band` (daehanfeed sec7 줌 배너 / amnesty 후원 위젯 / ildongcare 원형 펼침): 줌 안정화가 01-B와 메커니즘 중복이라 보류. 후원 문장 스왑 위젯은 차기 후보.
- 키네틱 타이포 합류 밴드(daehanfeed sec5): scroll-text-reveal과 경계 모호로 보류.
