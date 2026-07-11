---
component: Tabs · Segment
canonical: "tabs-segment.schema.json"
category: Components
version: 0.2.0
sourceHtml: "index.html#tabs"
generated: true
---

# Tabs · Segment

> Tabs는 콘텐츠 전환 (패널 교체), Segment는 뷰 전환 (같은 데이터의 다른 표시).

> ⚙️ 이 문서는 [`tabs-segment.schema.json`](tabs-segment.schema.json) 에서 자동 생성됐습니다. 내용 수정은 JSON에서, MD 재생성은 `node scripts/gen-docs.mjs tabs`.

## 언제 사용하나 (Use when)

- Tabs: 여러 콘텐츠 영역 전환
- Segment: 같은 데이터의 뷰 전환 (리스트/카드, 월간/연간)

## 언제 쓰지 않나 (Don't use when)

- 4개 초과 세그먼트 → Tabs 또는 Select
- 페이지 전환 → Top App Bar 또는 Drawer

## 변형 (Variants)

| ID | Label | Description |
| --- | --- | --- |
| `tabs-underline` | Tabs · Underline | 가장 흔한 탭. 하단 밑줄로 활성 표시 |
| `tabs-pill` | Tabs · Pill | 칩 형태 탭 |
| `segment-2` | Segment · 2 | 이원 선택 (월간/연간) |
| `segment-3` | Segment · 3 |  |
| `text-switch` | Text Switch | 밑줄·박스 없는 굵기만 차이 (헤더형) |

### HTML Snippets

**Tabs · Underline**

```html
<div class="tabs-underline">
  <div class="tab is-active">전체</div>
  <div class="tab">진행</div>
  <div class="tab">완료</div>
</div>
```

**Tabs · Pill**

```html
<div class="tabs-pill">
  <span class="tab-pill is-active">전체 5</span>
  <span class="tab-pill">진행 2</span>
</div>
```

**Segment · 2**

```html
<div class="segment">
  <div class="seg">월간</div>
  <div class="seg is-active">연간</div>
</div>
```

**Segment · 3**

```html
<div class="segment">...</div>
```

**Text Switch**

```html
<div class="text-switch">
  <div class="ts-item is-active">자사은행</div>
  <div class="ts-item">다른 금융</div>
</div>
```

## 상태 (States)

`rest` · `hover` · `active` · `focus` · `disabled`

## 토큰 (Component Tokens)

| 역할 | CSS 변수 |
| --- | --- |
| activeFg | `--sm-content-primary` |
| inactiveFg | `--sm-content-tertiary` |
| underline | `--sm-interactive-brand-default` |
| segmentBg | `--sm-background-muted` |
| segmentActive | `--sm-background-default` |
| segmentShadow | `0 1px 3px rgba(0,0,0,0.06)` |

## 접근성 (Accessibility)

- **Role**: tablist + tab + tabpanel (Tabs), radiogroup + radio (Segment)
- **Keyboard**: `Arrow Left/Right` · `Home/End` · `Tab (패널로 포커스 이동)`
- **ARIA notes**:
  - aria-selected, aria-controls=panelId, panel의 role=tabpanel

## UX Writing 규칙

- 짧은 명사 (전체, 진행, 완료)
- 숫자 병기 가능 (전체 5, 진행 2)

## 사용 데모

`demo-signup` · `demo-pricing` · `demo-store` · `demo-todo` · `demo-booking` · `demo-foodorder` · `demo-shopping` · `demo-banking`

수정 시 `window.demoMatrix.byComponent['tabs']` 로 영향 데모 전수 조회 가능.

---

**See also**: [index.html#tabs](../index.html#tabs) · [tabs-segment.schema.json](tabs-segment.schema.json) · [AGENTS.md](../AGENTS.md)