# Changelog

Semantic Versioning을 따릅니다. 과거는 지워지지 않고 아래에 **누적됩니다**.

---

## v0.5.2 — 2026-05-06 · Markdown 다운로드 버튼 (페이지별)

**핵심 변화**: 모든 #페이지 헤더 우상단에 'Markdown' 버튼 자동 주입. 클릭 시 해당 페이지의 디자인 가이드를 `${표시명} Design Guide.md`로 다운로드. JSON canonical을 손쉽게 외부 반출.

### Added
- **`assets/js/main.js`** — `initMarkdownDownloadButtons()` / `handleMdDownloadClick()` / `generateDemoMarkdown()` / `triggerDownload()` / `loadMdMapping()` 추가 (~170줄)
- **`assets/css/main.css`** — `.md-download-btn` 스타일 + 섹션 헤더 `position: relative` (~34줄)
- **버튼 적용 범위**: 컴포넌트 25개 + Foundations 5개(color/typography/sizing/radius/motion) + Docs 6개(about/principles/tokens/naming/policy/writing) + 데모 18개 = 약 54개 페이지

### Behavior
- **컴포넌트/Foundations/Docs**: 기존 `.md` 파일을 fetch → Blob 다운로드 (단일 진실의 출처 그대로)
- **데모**: `.md` 파일 부재 → `data-uses` 속성 + 섹션 정보로 클라이언트에서 마크다운 동적 생성
- 매핑은 `system.json`(컴포넌트 25 + 데모 18) + JS 내 `STATIC_DOC_MAP`(docs/foundations 11) 결합. `id="sizing"` ↔ `foundations/spacing.md` 같은 파일명 불일치는 매핑 테이블에서 흡수
- 파일명 규칙: `${name} Design Guide.md` (예: `#sheet` → `Bottom Sheet Design Guide.md`, `#others` → `Card Design Guide.md`)
- SVG 아이콘은 `currentColor`로 다크/라이트 테마 자동 대응

### Note
- `index.html` · JSON 스키마 · 컴포넌트 .md 문서는 변경 없음 (운영 진본 JS/CSS만 수정 — CLAUDE.md 3단계 워크플로 준수)
- 검증: `node scripts/validate.mjs` → **10 OK / 0 warn / 0 error** (유지)
- 매핑 시뮬레이션 9/9 PASS (`#sheet` → `Bottom Sheet Design Guide.md` 포함)
- v2 개선 여지: `alert()` → `Alert · Toast` 컴포넌트 토스트로 대체 / `#component-tokens`·`#elevation` 매핑 추가

---

## v0.5.1 — 2026-04-22 · Automation (CI · Token Build · MD Gen)

**핵심 변화**: v0.5.0에서 구축한 JSON canonical을 자동화로 연결. 수동 유지보수 비용 감소, 드리프트 원천 차단.

### Added
- **`.github/workflows/validate.yml`** — GitHub Actions CI. push·PR 시 자동으로 `node scripts/validate.mjs` 실행. 검증 실패 시 머지 차단 가능
- **`scripts/build-tokens.mjs`** — `tokens/*.json` 정본을 읽어 `assets/css/_tokens.generated.css` 생성. Primitives + Semantic Light/Dark + Typography/Sizing/Radius/Elevation/Motion/Z-index 전부 포함 (168 lines, 6.3KB)
- **`scripts/gen-docs.mjs`** — `components/<id>.schema.json` 에서 `components/<id>.md` 자동 생성. 개별 (`node scripts/gen-docs.mjs banner`) 또는 전체 (`node scripts/gen-docs.mjs`) 재생성
- **`assets/css/_tokens.generated.css`** — 토큰 빌드 결과물. `main.css` 참조용 또는 `@import` 대상
- **`package.json` 스크립트 체계화** — `npm run validate` / `build:tokens` / `build:docs` / `build` / `test`

### Changed
- **`components/*.md` × 25 전수 재생성** — `scripts/gen-docs.mjs` 로 JSON canonical 기반 재작성. 각 MD 최상단에 "⚙️ 자동 생성" 안내 + 재생성 명령 포함
- **`package.json` 현행화** — name(uiux-dh-design-system), version(0.5.1), type(module), scripts 확장, author, license 등

### Note
- CI 워크플로는 이번 push 직후 GitHub Actions 탭에서 첫 실행
- `_tokens.generated.css` 는 참조용으로만 두며, 실제 `main.css` 변수 블록은 여전히 수동 관리. 장기적으로 `@import` 전환 가능 (breaking change 없이 점진적)
- MD 재생성 시 기존 MD의 서술 내용 일부가 재구성됨 — 원본은 git 히스토리로 복구 가능. 추가 서술은 schema.json 에 필드 추가 후 재생성 권장
- 검증: `node scripts/validate.mjs` → **10 OK / 0 warn / 0 error** (유지)

---

## v0.5.0 — 2026-04-22 · AI API Layer (JSON Canonical + Single HTML Removed)

**핵심 변화**: "디자인시스템은 제품, 팀은 고객" (Toss) → "AI도 고객". 사람용 MD는 유지하되 기계용 JSON API 레이어를 신설해 AI 평균 read 3–5파일 → 1–2파일로 축소.

### Added
- **`system.json`** (루트) — AI 단일 진입점. 25 컴포넌트 · 18 데모 · 토큰 인덱스 통합
- **`AGENTS.md`** — AI 에이전트 결정 트리, "I want to... → Read this"
- **`schemas/`** — 4개 메타 스키마 (`component`, `token`, `demo`, `snippet`.schema.json)
- **`components/<id>.schema.json` × 25** — 모든 컴포넌트의 기계 판독용 사양 (variants/tokens/html/a11y/usedInDemos/uxWriting)
- **`tokens/theme-map.json`** — Light/Dark pair 29개 집약 (양쪽 값 1-read로 조회)
- **`snippets/patterns.json`** — 자주 쓰이는 조합 10종 (login-form, pricing-card, confirm-dialog 등)
- **`scripts/validate.mjs`** — 외부 의존성 없는 Node 검증 스크립트. JSON 유효성 · 토큰 ref 해석 · system.json ↔ schema 일치 · usedInDemos ↔ data-uses 교차 확인

### Removed
- **`Single HTML/UIUX-DH-design-system.html`** (10,300줄) — 드리프트 원천 제거. 이제 `index.html`이 유일 진본
- **`Single HTML/` 폴더 자체** 삭제

### Changed
- **CLAUDE.md 전면 재작성** — 4단계 → **3단계** 작업 원칙 (Single HTML 단계 제거), JSON canonical 원칙 명시, AI 섹션은 `AGENTS.md`로 이전
- **components/README.md** — 25종 표에 `.schema.json` 컬럼 추가, "JSON canonical" 원칙 명시

### Note
- 기존 `components/*.md` 25개는 보존 — 긴 서술(UX Writing, 원칙)은 MD가 적합. `canonical: "<id>.schema.json"` 표기는 추후 일괄 추가 예정
- 검증 결과: **9 OK / 28 warn / 0 error**. 경고는 모두 비치명적(asset 아이콘이 모든 데모에서 쓰이지만 `data-uses` 속성 명시적 선언 누락 등)
- AI 쿼리 3개 테스트 통과:
  - "Banner hero variant HTML?" → `components/banner.schema.json` 1 read
  - "브랜드 색 dark 모드?" → `tokens/theme-map.json` 1 read
  - "Badge 쓰는 데모?" → `system.json` 1 read

---

## v0.4.6 — 2026-04-22 · Banner Component (image + text)

### Added
- **`Banner` 컴포넌트 신규** — 이미지와 텍스트의 조화로운 조합으로 프로모션을 전달하는 컴포넌트. v0.3 그라데이션 정책을 준수해 **두-색 그라데이션으로 배경을 채우지 않음**. 솔리드 pastel · 다크 · 또는 단일 이미지 배경 + 한 방향 투명도 오버레이(가독성 목적)만 허용.
  - **기본 구조**: `.banner > .banner-content + .banner-image`
  - **부속 요소**: `.banner-eyebrow`(+`.banner-accent` 부분 강조) · `.banner-title` · `.banner-subtitle` · `.banner-cta` · `.banner-ribbon`(좌상단 회전 리본) · `.banner-indicator`(우하단 N/전체)
  - **크기 변형 3종**: 기본(136px) · `.banner-hero`(180px, 140×140 이미지) · `.banner-compact`(76px, 56×56 이미지)
  - **색상 변형 5종 + 기본**: 기본(`--sm-interactive-brand-subtle`) · `.banner-dark` · `.banner-warm` · `.banner-cool` · `.banner-rose` · `.banner-mint`
  - **배경 변형**: `.banner-overlay` — 이미지 배경 + 좌측 투명 오버레이(정책 예외: 가독성 확보용 한 방향 그라데이션)
  - **컴포넌트 토큰**: `--cm-banner-bg` · `--cm-banner-fg` · `--cm-banner-accent` · `--cm-banner-radius` · `--cm-banner-pad-y/x`
- **쇼케이스 섹션 6 variant** (index.html `#banner`): Default · Dark · Overlay · Compact(+ribbon) · Hero(+CTA) · Multi-banner Row(가로 캐러셀)
- **컴포넌트 문서** [components/banner.md](components/banner.md) — 사용처·금지 사례·변형·토큰·접근성·UX Writing 규칙까지 전면 기록
- **사이드바 Part 03**에 Banner 링크 추가, `CATEGORIES['components'].items`에 `banner` 등록

### Changed
- **5개 데모 배너 영역을 `.banner` 컴포넌트로 교체** — 기존에 데모별로 제각각 쓰인 그라데이션/커스텀 마크업을 모두 표준 Banner로 통일.

| 데모 | 이전 | 이후 |
| --- | --- | --- |
| `demo-foodorder` | 그라데이션 선물박스 + 인라인 마크업 | `.banner.banner-compact` + SVG 쿠폰팩 일러스트 |
| `demo-shopping` | `linear-gradient(135deg,#E9E4F3,#D4C5E9)` 히어로 | `.banner.banner-hero` + 솔리드 `#E9E4F3` + 우측 컬러 띠 |
| `demo-booking` | 2색 그라데이션 배너 3개 (FDE68A→78350F 등) | `.banner.banner-warm` · `.banner-cool` · `.banner-dark` 3종 캐러셀 |
| `demo-mypage` | `linear-gradient(135deg,--p-indigo-700,--p-indigo-500)` 멤버십 | `.banner.banner-compact` + 브랜드 indigo 솔리드 + 다이아몬드 SVG |

### Docs
- [components/README.md](components/README.md) — Part 4 테이블에 Banner 추가, 총 컴포넌트 수 24 → **25**로 갱신
- [CLAUDE.md](CLAUDE.md) — 범위 표기 "Components(24종)" → "Components(25종)", 버전 v0.4.6

### Note
- **그라데이션 정책 재확인**: Banner는 "장식용 두-색 그라데이션 금지" 원칙의 **모범 사례**입니다. 이전 그라데이션을 쓰던 데모 마크업을 모두 솔리드/이미지+오버레이로 전환해 정책 일관성 확보.
- 영향 데모: `demo-foodorder` · `demo-shopping` · `demo-booking` · `demo-mypage` (4종). `data-uses`에 `banner` 추가, `window.demoMatrix.byComponent['banner']`로 조회 가능.
- `demo-banking`은 v0.4.2 재설계 이후 프로모션 배너가 없어 포함되지 않음. 추후 필요 시 추가 예정.

---

## v0.4.5 — 2026-04-22 · Merge Duplicate "배달" Demo

### Removed
- **`demo-delivery` 섹션 전체 삭제** — 같은 "배달 앱" 컨셉이 `demo-delivery`(DEMO 05, 단순 카테고리+리스트형)와 `demo-foodorder`(DEMO 11, 쿠폰 배너+5-way 탭+카테고리+파트너 Row+인기 맛집의 풍부한 레이아웃)로 이중 존재하던 문제 해결. 더 풍부한 `demo-foodorder`를 유지하고 단순 버전을 제거.
- **사이드바 "배달" 링크** (`#demo-delivery`) 제거, `CATEGORIES['demo'].items`에서 `demo-delivery` 엔트리 제거.

### Changed
- **`demo-foodorder` 제목 "푸드 딜리버리" → "배달"** — 한국 사용자에게 자연스러운 명칭으로 통일. 영문 라벨 `FOOD DELIVERY`는 유지(DEMO 11 · FOOD DELIVERY). 설명 텍스트에 "위치 헤더"와 "인기 맛집 카드" 추가해 레이아웃 요소 정확히 기술.
- **`CATEGORIES['demo'].items`의 `demo-foodorder` 메타 갱신** — title "푸드 딜리버리" → "배달", desc "쿠폰 배너 · 카테고리 그리드 · 브랜드 로고" → "쿠폰 배너 · 5-way 탭 · 카테고리 그리드 · 무료배달 파트너".
- **HOME 카운트** — 실제 사용 데모 "19개" → "18개" (main.js + Single HTML).

### Note
- DEMO 라벨은 재번호 매김하지 않음. 현 번호 체계(01–04, 06–19)는 `demo-delivery`가 점유했던 05 자리만 비어 있음. 순차 재번호는 라벨 14개 + 양쪽 파일 = 28 edit이라 비용 대비 가치 낮다고 판단. 추후 필요 시 별도 PR.
- 영향: 사이드바 Part 07 항목 수가 19 → 18로 줄어듦. `window.demoMatrix.byDemo` 키에서 `demo-delivery` 제거됨.

---

## v0.4.4 — 2026-04-22 · Native-app Scrollbar Hiding (demos only)

### Changed
- **실제 사용 데모 내 스크롤바 완전 숨김** — 네이티브 앱 경험 재현. 기존 `.demo-screen::-webkit-scrollbar { width: 0 }`는 Webkit에서만 얇은 바를 감췄고 Firefox 및 내부 가로 스크롤(카테고리 스트립·캐러셀·브랜드 Row·탭 네비)에는 여전히 스크롤바가 표시되던 문제 해결.
- **크로스 브라우저 3중 대응**:
  - `scrollbar-width: none` — Firefox
  - `-ms-overflow-style: none` — 구 Edge / IE
  - `::-webkit-scrollbar { display:none; width:0; height:0 }` — Chrome / Safari / 신 Edge
- **범위 `.demo-screen` 및 내부 모든 스크롤 자손** — `.demo-screen,  .demo-screen *` 선택자로 가로 스크롤(overflow-x:auto)까지 전부 커버.
- **스크롤 동작은 그대로 유지** — 마우스 휠·터치·키보드 스크롤은 정상 작동. 시각적 스크롤바만 비표시.

### Note
- 범위가 `.demo-screen` 내부로 한정되어 **메인 페이지 스크롤바·다른 컴포넌트 섹션의 스크롤은 영향 없음** (사용자가 명시한 "실제 사용 데모의 경우에 국한").
- 영향 데모: 전 19종. 특히 가로 캐러셀이 있는 `demo-booking`(BEST 섹션), `demo-foodorder`(브랜드 Row), `demo-shopping`(히어로·탭), `demo-map`(필터 칩·하단 시트 POI), `demo-notify`(필터 칩), `demo-community`·`demo-todo`(카테고리 칩)에서 체감 차이 큼.

---

## v0.4.3 — 2026-04-22 · Tab Bar Fixed Positioning + Icon Semantics + Brand Scrubbing

### Fixed
- **탭바가 스크롤과 함께 움직이는 버그 수정** — `.demo-screen { position: relative; }` 제거. 이제 `.m-tabbar`·FAB·Sticky CTA가 스크롤 컨테이너 밖 `.demo-phone`을 containing block으로 쓰므로 **실제 앱처럼 하단에 고정**됩니다. 내부 절대 배치가 필요한 데모(`demo-map`)는 인라인 `style="position:relative;"`로 opt-in.
- **탭바 아이콘 의미 불일치 수정** — 채팅·라운지·주문내역이 전부 `i-diary`(스마일리 일기)로 표시되던 문제 해결.

### Added
- **SVG 스프라이트 심볼 6종** (`index.html` + `Single HTML/` 동시) — 각 데모 탭바에 의미 있는 아이콘을 주기 위해 신규 추가.
  - `i-chat` / `i-chat-fill` — 말풍선 (채팅·메신저·상담톡)
  - `i-receipt` — 영수증/지그재그 하단 (주문내역)
  - `i-coffee` — 커피잔 (라운지·카페)
  - `i-chart` — 막대 그래프 (마이데이터·자산·통계)
  - `i-users` / `i-users-fill` — 사람 둘 (소셜·커뮤니티·모임)

### Changed — 탭바 아이콘 교체
| 데모 | 탭 라벨 | 이전 아이콘 | 신규 아이콘 |
| --- | --- | --- | --- |
| `demo-chat` | 채팅 (active) | `i-diary-fill` | `i-chat-fill` |
| `demo-community` | 커뮤니티 (active) | `i-diary-fill` | `i-users-fill` |
| `demo-social` | 채팅 | `i-diary` | `i-chat` |
| `demo-social` | 모임 (active) | "오" 글자 녹색 원 | `i-users-fill` + 브랜드 indigo |
| `demo-shopping` | 라운지 | `i-diary` | `i-coffee` |
| `demo-shopping` | 마이컬리 → 마이페이지 | — | 라벨 변경 |
| `demo-foodorder` | 장보기·쇼핑 → 장보기 | — | 라벨 단순화 |
| `demo-foodorder` | 주문내역 | `i-diary` | `i-receipt` |
| `demo-foodorder` | 마이배민 → 마이 | `i-user` | 라벨 변경 |
| `demo-banking` | 마이데이터 | `i-diary` | `i-chart` |
| `demo-banking` | 상담톡 | `i-mail` | `i-chat` |
| `demo-delivery` | 주문 | `i-calendar` | `i-receipt` |

### Changed — 실제 브랜드명·색상 제거 (사용자 지시)
- **`demo-shopping`** — 컬리 계열 전면 제거
  - 브랜드 로고 "Kurly" → "Mart" + 카트 SVG 아이콘
  - 탭 "마켓컬리/뷰티컬리" → "식품/뷰티", 활성 탭 색 `#5B1A95`(컬리 퍼플) → `var(--sm-interactive-brand-default)` (브랜드 indigo)
  - "컬리 굿프라이스" → "이달의 굿프라이스"
  - "Kurly Only" 아이콘 → "단독 SALE" + 브랜드 subtle 배경
  - "컬리멤버스" → "프리미엄"
  - 모든 쿠폰/뱃지 `#5B1A95` → 브랜드 토큰
- **`demo-social`** — 문토 계열 전면 제거
  - 헤더 "오이" 녹색 텍스트 → "Meetup·" + `i-users-fill` 브랜드 indigo 타일
  - 녹색 CTA 버튼 → 브랜드 indigo 버튼, 라벨 "모임개설/모임찾기" → "모임 만들기/모임 찾기"
  - 활성 다이닝 탭의 "오" 글자 녹색 원 → 브랜드 indigo 원 + `i-users-fill`, 라벨 "다이닝" → "모임"
- **`demo-foodorder`** — 배민 계열 전면 제거
  - 민트 배경 `#D3F3E8` → `var(--sm-background-muted)`
  - 쿠폰 `#C084FC` 퍼플 → 브랜드 토큰
  - 브랜드 로고 Row 5종 — B마트·GS25·CU·이마트·장보고마트 → 새벽마트·24시편의점·홈쇼핑·대형마트·생활마트(모두 SVG 제네릭 일러스트)
  - 상품 카드 "CU무료배달" 뱃지 → "무료배달"
  - 탭 라벨 "마이배민" → "마이"
- **실제 매장 브랜드명 제거** — 여러 데모에 등장하던 매장명 교체.
  - 쉐이크쉑 강남점 → 버거하우스 강남점
  - 도미노피자 역삼점 → 피자하우스 역삼점
  - 샐러디 본점/선릉 → 그린볼 본점/선릉점
  - 스타벅스 강남역점 → 카페라떼 강남역점
  - 쿠팡 → 온라인 쇼핑몰

### Note
- 사용자 아바타/온라인 상태점의 `var(--p-green-500)`은 표준 UX 패턴(상태 인디케이터)이며 특정 브랜드 모방이 아니므로 유지.
- 영향 데모: `demo-chat`, `demo-community`, `demo-social`, `demo-shopping`, `demo-foodorder`, `demo-banking`, `demo-delivery`, `demo-notify`(쉐이크쉑 표기 교체). `window.demoMatrix` 매트릭스는 컴포넌트/토큰 선언이 동일해 재스캔 없이 유효.

---

## v0.4.2 — 2026-04-22 · Banking & Map Demo Refinement

### Changed
- **`demo-banking` 재설계** — NH농협 모바일 앱 레이아웃을 레퍼런스로 삼아 한국 뱅킹 앱의 실제 UX 패턴으로 재구성. 색·아이콘·타이포는 전부 디자인시스템 토큰으로 교체.
  - Added: 접근성 "큰글" 토글(좌상단) · 지점 표시 + 혜택보기 뱃지 · 큰 사용자 이름(28px display) + chevron · 자사/타사 세그먼트 탭
  - Account card: 브랜드 아이콘(`--sm-interactive-brand-default`) + 계좌번호 + 복사 아이콘(inline SVG) · **중앙 정렬 대형 잔액**(34px, `tabular-nums`) + 새로고침 · 카드 하단 2분할 액션(거래내역 · 이체, 카드 내부 디바이더)
  - Pagination dots (● ○) + 카드 추가 버튼(+ 아이콘)
  - 즐겨찾기 카드: ⚙ 설정 아이콘 + **3×2 아이콘 그리드**(전체계좌조회·모바일ATM출금·공과금납부·해외결제·이벤트·메뉴추가). 각 아이콘은 색상별 pastel 타일 위에 inline SVG 심볼
  - Tab bar: 홈 · 마이데이터 · 금융상품몰 · 상담톡
  - Removed: 이전의 그라데이션 계좌 카드 · 5-way 퀵 액션 · 거래 내역 리스트 · 적금 배너(→ 페이지네이션 카드 "다음 페이지"로 이관되는 구조로 변경)
- **`demo-map` 재설계** — 여기어때/네이버 지도 레이아웃을 레퍼런스로 숙박·레저 탐색 UX로 강화. 지도 아트도 토큰 친화적으로 정리.
  - 검색바: **일체형 3-셀**(장소 검색 + 날짜·게스트 + 장바구니), 디바이더로 분할
  - Filter pills: 숙소(액티브, `i-home`) · 레저(`i-star`) · 선택초기화(우측 정렬)
  - **하우스 모양 핀(SVG) + 숫자 뱃지** — 붉은 핀(`--p-red-500`)은 숙박, 남색 핀(`--p-indigo-500`)은 레저. 카운트 뱃지는 흰 배경·컬러 보더·핀 우상단 오버랩
  - Price tooltip: 라운드 풀(pill) 카드 + 아래 방향 화살표(45° 회전 사각형)
  - 현위치: 3중 halo(`rgba(79,70,229,0.12→0.18→solid)`) 펄스 효과
  - 플로팅 "≡ 목록" 버튼(중앙) + 위치 FAB(우측)
  - 하단 시트: 단일 카드 프리뷰(썸네일 + 이름 + ★ 뱃지 + 위치 + 가격)
  - Tab bar: 카테고리 · 내 주변(액티브) · 홈 · 찜 · 마이
  - Removed: 이전의 다색 이모지 원형 핀(🍜☕🍕🥗) · 가로 스크롤 POI 카드 리스트
- **`data-uses` 매트릭스 갱신** — 두 데모의 의존 컴포넌트·토큰 목록을 새 설계에 맞춰 갱신.
  - `demo-banking`: +`tabs`,`control` (세그먼트·큰글 토글) / -`appbar`,`list` (m-topbar 미사용, 거래 리스트 제거)
  - `demo-map`: +`badge`,`tabbar` (카운트 뱃지·탭바 추가) / 토큰에 `--p-red-500`,`--sm-border-default`,`--sm-content-brand` 추가

### Note
- 스크린샷의 브랜드 컬러(NH 초록, 여기어때 핑크, 네이버 초록)는 사용하지 않음 — **레이아웃·컴포지션·정보 계층만 참고**했으며 모든 시각 요소는 `--sm-*` / `--p-*` 토큰 기반.
- 영향 데모: `demo-banking`, `demo-map` 2종. `window.demoMatrix.byDemo['demo-banking']` / `['demo-map']` 로 확인 가능.

---

## v0.4.1 — 2026-04-22 · Single-family Typography (Pretendard only)

### Changed
- **타이포그래피 한 벌로 통합** — `--font-mono`의 물리적 폰트를 `JetBrains Mono`에서 `Pretendard Variable`로 교체. 이제 `--font-sans`와 `--font-mono`는 동일한 폰트를 가리키되, 변수 이름은 **의미적 역할**(라벨/메타/숫자 강조)을 표시하기 위해 유지.
- **Google Fonts 의존성 제거** — `<link>` (JetBrains Mono CDN) 제거. 초기 로드 네트워크 요청 1건 감소.
- **퍼글리프 한글 폴백 블록 제거** (`main.css`) — `--font-mono`가 Pretendard로 통일되어 한글/라틴이 같은 메트릭을 공유하므로 더 이상 불필요.

### Docs
- `tokens/typography.json` v0.4.1 — mono 패밀리 value · use · note 갱신.
- `foundations/typography.md` v0.4.1 — 폰트 패밀리 설명을 "한 벌 Pretendard"로 단일화. 등폭 숫자가 필요한 경우 `font-variant-numeric: tabular-nums` 사용 규칙 추가.

### Note
- `var(--font-mono)`를 참조하는 모든 기존 코드는 수정 없이 동작합니다. 시각적으로는 JetBrains Mono 고정폭 메트릭 → Pretendard 가변폭으로 바뀌므로, 표 정렬이 필요한 자리는 `tabular-nums` 선언을 추가 권장.
- 영향 데모: **전 데모** (모든 데모가 `--font-mono`를 통계·타임스탬프·뱃지에 사용 중). `window.demoMatrix.byToken['--font-sans']`로 조회 가능.

---

## v0.4.0 — 2026-04-22 · Demo Expansion + Dependency Matrix

### Added
- **실제 사용 데모 10종 추가** — 총 19종으로 확장.
  - 스크린샷 기반 4종 — `demo-booking`(맛집 예약·캐치테이블 스타일) · `demo-foodorder`(푸드 딜리버리·배민) · `demo-shopping`(쇼핑몰 홈·컬리) · `demo-social`(소셜 모임·문토)
  - 공통 패턴 6종 — `demo-banking`(뱅킹 홈) · `demo-map`(지도 탐색·바텀시트) · `demo-mypage`(마이페이지) · `demo-chat`(채팅 리스트) · `demo-checkout`(결제 완료) · `demo-notify`(알림 센터)
- **`data-uses` 의존성 매트릭스** — 모든 데모 섹션이 사용 중인 컴포넌트·토큰을 `<section data-uses="...">` 속성으로 선언.
  - `main.js`의 `buildDemoMatrix()`가 페이지 로드 시 자동 스캔 → `window.demoMatrix.{byDemo,byComponent,byToken,missingTokens}` 생성
  - 존재하지 않는 토큰 참조 시 콘솔 경고로 무결성 검증
- **기존 9개 데모 역추적 주석** — `demo-splash`부터 `demo-todo`까지 모두 `data-uses` 선언 추가.

### Changed
- **CLAUDE.md 4단계 작업 원칙 도입** — 기존 3단계에 "**4. 데모 동시 업데이트**" 추가. 컴포넌트·토큰 수정 시 `window.demoMatrix`로 영향 범위를 사전 확인하고, 영향 받는 데모를 반드시 함께 검수·업데이트.
- **작업 예시 확장** — 예시 A(색상 변경)와 예시 B(새 컴포넌트)에 매트릭스 조회·데모 반영 단계 추가, 예시 C(새 데모 추가) 신설.
- **사이드바 `Mobile Demos` 그룹** — 19개 데모 링크로 확장.
- **HOME 요약** — "9개 모바일 화면 데모" → "19개 모바일 화면 데모"

### Docs
- `CLAUDE.md` 전체 갱신 — 4단계 원칙 · `data-uses` 규약 · 매트릭스 사용법 · 예시 A/B/C.

---

## v0.3.2 — 2026-04-22 · UIUX-DH Icon Package v1 + Nav/Header refinement

### Added
- **UIUX-DH Icon Package v1** — SVG 심볼 스프라이트 기반 통합 아이콘 패키지 (40+ 심볼).
  - Navigation 쌍(outline + fill): `i-home` · `i-calendar` · `i-diary` · `i-cart` · `i-user`
  - Action: `i-arrow-left/right` · `i-chevron-{left,right,up,down}` · `i-close` · `i-check` · `i-plus` · `i-minus` · `i-more-h/v` · `i-menu`
  - Common: `i-search` · `i-bell` · `i-heart(-fill)` · `i-star(-fill)` · `i-settings` · `i-edit` · `i-trash` · `i-share` · `i-filter` · `i-link` · `i-eye(-off)` · `i-mail` · `i-clock` · `i-map-pin` · `i-camera` · `i-image`
  - Status: `i-info` · `i-alert` · `i-check-circle` · `i-x-circle`
  - 공통 규약: 24×24 viewBox · 1.7 stroke · round linecap/linejoin · currentColor
- **Icon CSS utilities** — `svg.ico` 베이스 + `ico-sm/md/lg/xl` 크기 변형 · 기존 `<span class="ico">` (사이드바/탭바 이모지 슬롯)과 충돌 없이 공존.

### Changed
- **Tab Bar 섹션 재설계** — 5탭(디데이·다이어리·홈·스토어·마이페이지) 기준 5가지 활성 상태 매트릭스. 비활성은 outline, 활성은 `-fill` 변형으로 브랜드 컬러 적용.
- **Top App Bar 섹션 재설계** — 5가지 변형 제공: (1) Center+back+more, (2) Left+back+more, (3) Left+back+다음, (4) Left+close, (5) Left+다음. Large title은 별도 최상위 변형.
- **Asset · Icon 섹션 전면 교체** — 아이콘 패키지 전체 쇼케이스(총 40+ 심볼)로 개편. 이모지 사용 금지 원칙 명시.
- **모바일 데모 아이콘 교체** — 커뮤니티·배달·스토어·To-do 등의 탭바/헤더 아이콘을 이모지에서 SVG로 치환.
- **CSS: `text-btn` / `text-btn-brand` 추가** — Top App Bar의 "다음" 같은 텍스트 액션 전용 버튼 스타일.

### Docs
- `components/tab-bar.md` v0.3.2 갱신 — 5탭 표준 + outline/fill 쌍 네이밍 규칙.
- `components/top-app-bar.md` v0.3.2 갱신 — 5가지 변형 + 선택 기준 + UX Writing 가이드.
- `components/asset-icon.md` v0.3.2 전면 재작성 — 아이콘 패키지 카테고리 표 + 확장 가이드.

---

## v0.3.1 — 2026-04-22 · Vanilla JS Architecture + SPA + Demos

### Changed
- **저장소 구조 재편** — 단일 HTML 파일(8,375줄)을 바닐라 JS 구조로 분리.
  - `index.html` (3,680줄) · `assets/css/main.css` (4,311줄) · `assets/js/main.js` (382줄)
  - 기존 단일 파일은 `Single HTML/UIUX-DH-design-system.html`에 자기완결 배포본으로 보존.
- **CLAUDE.md 3단계 작업 원칙 추가** — 수정 시 ① 운영 진본, ② Single HTML, ③ AI 문서(md)를 반드시 함께 갱신.
- **README.md 업데이트** — 새 실행 방법(`index.html` 열기) + 폴더 구조 반영.

### Added
- **SPA 라우팅** — 해시 기반 라우터. 카테고리 클릭 시 하위 항목 카드 그리드 동적 생성, 항목 클릭 시 단일 컴포넌트만 렌더.
- **실제 사용 데모 9종** — Splash · 로그인 · 회원가입 · 커뮤니티 · 배달 · 스토어 · 요금제 · 달력 · To-do List (375×812 모바일 뷰포트).
- **왼쪽 고정 사이드바** — 모든 카테고리가 펼쳐지는 네비게이션 + 모바일 햄버거 토글 + 활성 섹션 자동 하이라이트.

---

## v0.3.0 — 2026-04-22 · Overlays, Navigation, States & UX Writing

### Added
- Overlay 컴포넌트 — Dialog, Bottom Sheet, Popover · Tooltip
- Navigation 컴포넌트 — Top App Bar, Tab Bar, Drawer, Breadcrumb
- State 컴포넌트 — Skeleton Loader, Empty State
- Density 컴포넌트 — Data Table, Accordion · Tree
- UX Writing 7원칙 + 컴포넌트별 라이팅 규칙 + 3종 에러 메시지 템플릿
- Semantic 토큰 확장 — `--sm-background-overlay`, `--sm-surface-*`
- Elevation — `--elevation-5` (모달·시트 전용 최상위 레이어)

### Changed
- **그라데이션 정책 재정의** — 두-색 그라데이션 원칙적 금지, 솔리드 컬러를 기본으로. 진행률·브랜드 모멘트 등 목적이 분명한 경우만 허용.
- Avatar — 솔리드 컬러 변형(`.av-solid`) 추가. 그라데이션 기반 `.avatar`는 레거시로 유지.

---

## v0.2.0 — 2026-04-21 · Component Library

### Added
- 13종 컴포넌트 — Asset & Icon, Badge, Bar Chart, Border & Divider, Button, Chip, Text Field, Avatar, Checkbox · Radio · Toggle, List Item, Alert · Toast, Progress · Slider, Tabs · Segment, Card
- 아이콘 세트 — 24px 그리드, 1.5px stroke, round linecap/linejoin 기본값
- 일러스트 스타일 — 컬러 필 기반, 다크 모드에서 톤 유지
- Button 변형 7종 — primary / tonal / secondary / outline / ghost / dark / danger
- Button 크기 5단계 (sm/md/base/lg/xl), pill/icon/fab 변형
- Status subtle 토큰 — `--sm-status-success-subtle`, `--sm-status-error-subtle`, `--sm-status-info-subtle`
- Chart 타입 — vertical / horizontal / stacked bar
- Field 타입 — default / affix / amount / search

---

## v0.1.0 — 2026-04-21 · Foundations · Initial release

### Added
- **3계층 토큰 아키텍처** — Primitive / Semantic / Component
- Light / Dark 테마 시맨틱 매핑
- 브랜드 컬러 — Indigo 스케일(11단계) 및 Amber Signal
- Pretendard Variable 기반 9단계 타이포 토큰 — display / heading / body / label / caption / overline
- 4px 베이스 사이즈 토큰 (size-50 ~ size-1200)
- Radius 8단계 (none/xs/sm/md/lg/xl/2xl/full)
- Elevation 5단계 (0~4), 다크 모드 대응 그림자
- Motion 토큰 — 5단계 duration, 4종 easing curves
- Button·Input 컴포넌트 토큰 예시
- 네이밍 컨벤션 — `p-` / `sm-` / `cm-` prefix, 축약어 금지, 의미 기반 명명
- 여섯 가지 디자인 원칙 정의

---

## v0.4.0 — Planned · 2026 Q2

### Planned
- Figma Variables ↔ CSS 변수 자동 동기화 플러그인
- WCAG 2.2 AA 대비 자동 검증
- 반응형 레이아웃 가이드 — Breakpoint · Grid · Density
- AGENTS.md 기반 AI 코드 생성 가이드라인

---

## v1.0.0 — Target · 2026 Q4

### Goals
- 모든 프로덕션 화면이 시스템 토큰만으로 구성
- Storybook 기반 컴포넌트 문서화
- React + Vue 듀얼 패키지 제공
- Deprecation 프로세스 문서화 (2 버전 notice, migration codemod 제공)
