---
component: Banner
canonical: "banner.schema.json"
category: Components
version: 0.4.6
sourceHtml: "index.html#banner"
generated: true
---

# Banner

> 이미지와 텍스트의 조화로운 조합으로 프로모션을 전달하는 카드. 두-색 그라데이션으로 채우지 않습니다 (v0.3 정책). 솔리드 pastel · 다크 · 또는 단일 이미지 배경 + 가독성 오버레이만 허용.

> ⚙️ 이 문서는 [`banner.schema.json`](banner.schema.json) 에서 자동 생성됐습니다. 내용 수정은 JSON에서, MD 재생성은 `node scripts/gen-docs.mjs banner`.

## 언제 사용하나 (Use when)

- 한 화면에 혜택·이벤트·프로모션을 강조해야 할 때
- 홈 화면 히어로 또는 섹션 배너
- 캐러셀에 N/전체 형태로 여러 프로모션을 나열할 때
- 파트너·브랜드 할인 쿠폰을 이미지와 함께 보여줄 때

## 언제 쓰지 않나 (Don't use when)

- 단순 정보 전달 → Alert 또는 Toast
- 사용자 결정을 막아야 하는 순간 → Dialog
- 메뉴·탐색 용도 → List Item 또는 Card
- 두-색 그라데이션으로 배경을 채우고 싶을 때 — 금지

## 변형 (Variants)

| ID | Label | Description |
| --- | --- | --- |
| `default` | Default | 기본 크기. 단색 pastel 배경 + 우측 일러스트. |
| `hero` | Hero | 홈 최상단 주목 독점. 140×140 이미지, clamp(22px,3vw,30px) 타이틀. |
| `compact` | Compact | 리스트 끼움형. 76px 최소 높이, 56×56 이미지. |
| `dark` | Dark | 다크 배경 + 페이지 인디케이터. 프리미엄 강조. |
| `overlay` | Overlay | 이미지 배경 + 좌측 투명 오버레이. 제품·분위기 사진이 주인공. |
| `color-warm` | Color · Warm | 따뜻한 pastel (#FEF3C7). 세일·가격 혜택. |
| `color-cool` | Color · Cool | 시원한 pastel (#DBEAFE). 멤버스·정보성. |
| `color-rose` | Color · Rose | 로즈 pastel (#FCE7F3). 라이프스타일·F&B. |
| `color-mint` | Color · Mint | 민트 pastel (#D1FAE5). 친환경·헬스. |

### HTML Snippets

**Default**

```html
<div class="banner" style="background:var(--sm-interactive-brand-subtle);">
  <div class="banner-content">
    <div class="banner-eyebrow">디자인 캐시 <span class="banner-accent">5% 할인</span></div>
    <h3 class="banner-title">할인받고 더 많이 이용하세요</h3>
  </div>
  <div class="banner-image"><!-- 일러스트 SVG --></div>
</div>
```

**Hero**

```html
<div class="banner banner-hero banner-warm">
  <div class="banner-content">
    <div class="banner-eyebrow">단 7일 최대 33%</div>
    <h3 class="banner-title" style="color:var(--sm-content-brand);">이달의 굿프라이스</h3>
    <div class="banner-subtitle">장보기 필수템 · 화제의 신상 외</div>
    <div class="banner-cta">지금 담으러 가기 →</div>
  </div>
  <div class="banner-image"><!-- 상품 이미지 --></div>
</div>
```

**Compact**

```html
<div class="banner banner-compact banner-rose">
  <div class="banner-ribbon">배짱할인</div>
  <div class="banner-image"><!-- 썸네일 --></div>
  <div class="banner-content">
    <div class="banner-eyebrow">파트너</div>
    <h3 class="banner-title">최소 3,000원 할인부터</h3>
  </div>
</div>
```

**Dark**

```html
<div class="banner banner-dark">
  <div class="banner-content">
    <div class="banner-eyebrow" style="color:rgba(255,255,255,0.7);">프라이즈 이벤트</div>
    <h3 class="banner-title">출석하고<br>크레딧 받기</h3>
  </div>
  <div class="banner-image"><!-- 캘린더 일러스트 --></div>
  <div class="banner-indicator">2 / 10 | 모두 보기</div>
</div>
```

**Overlay**

```html
<div class="banner banner-overlay" style="background-image:url(...);">
  <div class="banner-content">
    <div class="banner-eyebrow" style="color:rgba(255,255,255,0.75);">오직 20대에게만</div>
    <h3 class="banner-title">20대 한정 특가!</h3>
  </div>
  <div class="banner-indicator">1 / 10 | 모두 보기</div>
</div>
```

## 크기 (Sizes)

| ID | 값 |
| --- | --- |
| `default` | minHeight: `136`, padding: `var(--size-700) var(--size-600)`, imageSize: `112` |
| `hero` | minHeight: `180`, padding: `var(--size-800) var(--size-700)`, imageSize: `140` |
| `compact` | minHeight: `76`, padding: `var(--size-400) var(--size-500)`, imageSize: `56` |

## 상태 (States)

`rest` · `hover`

## 토큰 (Component Tokens)

| 역할 | CSS 변수 |
| --- | --- |
| bg | `--cm-banner-bg` |
| fg | `--cm-banner-fg` |
| accent | `--cm-banner-accent` |
| radius | `--cm-banner-radius` |
| padY | `--cm-banner-pad-y` |
| padX | `--cm-banner-pad-x` |

## 부속 요소 (Sub-parts)

| 클래스 | 역할 |
| --- | --- |
| `banner-content` | 텍스트 영역 래퍼 |
| `banner-eyebrow` | 제목 위 작은 라벨 |
| `banner-accent` | eyebrow 부분 강조 (브랜드 색) |
| `banner-title` | 메인 헤드라인 |
| `banner-subtitle` | 보조 문구 |
| `banner-image` | 우측 이미지 슬롯 |
| `banner-cta` | 인라인 CTA 칩 |
| `banner-ribbon` | 좌상단 대각선 리본 뱃지 |
| `banner-indicator` | 우하단 N/전체 페이지 인디케이터 |

## 접근성 (Accessibility)

- **Role**: 배너 전체가 클릭 가능할 때 <a> 또는 <button>으로 감싸거나 role=button tabindex=0
- **Min touch target**: 44px
- **Focus ring**: `--sm-border-focus`
- **ARIA notes**:
  - .banner-image의 장식용 SVG는 aria-hidden=true
  - 중요 정보가 이미지에만 있으면 텍스트에도 제공 (예: 할인율 5%는 텍스트에도)
  - .banner-overlay의 텍스트는 WCAG AA 명도대비 4.5:1 확보 필수
  - 리본 뱃지(-35deg 회전) 내용은 aria-label로도 제공 권장

## UX Writing 규칙

- Eyebrow: 한 줄·짧게. 할인율·기간 등 숫자는 .banner-accent로 브랜드 색 강조
- Title: 최대 2줄. 해요체 금지(명령·선언조 OK). 숫자는 큰 포인트 (3,000원 할인부터)
- Subtitle: 조건·기간·한정을 명시 (#앱 한정, 4/22~4/24, *조건 확인)
- CTA: 동사로 끝나는 6자 이내 (지금 담기 →, 쿠폰 받기 →)
- Indicator: N / 전체 형식 고정. 모두 보기 병기 가능

## 그라데이션 정책

**규칙**: 두-색 그라데이션 금지

**허용**:
1. 솔리드 단색 (토큰 기반, pastel 권장)
2. 단일 이미지 배경
3. 가독성 오버레이 (.banner-overlay의 한 방향 투명도 그라데이션 — rgba(0,0,0,0.5) → 0)

참조: [docs/04-gradient-policy.md](../docs/04-gradient-policy.md)

## 사용 데모

`demo-foodorder` · `demo-shopping` · `demo-booking` · `demo-mypage`

수정 시 `window.demoMatrix.byComponent['banner']` 로 영향 데모 전수 조회 가능.

---

**See also**: [index.html#banner](../index.html#banner) · [banner.schema.json](banner.schema.json) · [AGENTS.md](../AGENTS.md)