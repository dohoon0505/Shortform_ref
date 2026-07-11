---
component: Progress · Slider
canonical: "progress-slider.schema.json"
category: Components
version: 0.2.0
sourceHtml: "index.html#progress"
generated: true
---

# Progress · Slider

> Progress는 시간 경과·완료율 표시 (수동적), Slider는 값 선택 (상호작용).

> ⚙️ 이 문서는 [`progress-slider.schema.json`](progress-slider.schema.json) 에서 자동 생성됐습니다. 내용 수정은 JSON에서, MD 재생성은 `node scripts/gen-docs.mjs progress`.

## 언제 사용하나 (Use when)

- Progress: 업로드·다운로드·단계 완료율
- Slider: 음량·밝기·가격 범위·이미지 크롭

## 언제 쓰지 않나 (Don't use when)

- 유한 선택지 → Segment / Radio
- 500ms 미만 로딩 → Skeleton 또는 아무것도 표시하지 않음

## 변형 (Variants)

| ID | Label | Description |
| --- | --- | --- |
| `progress-bar` | Progress Bar |  |
| `progress-segment` | Progress · Segment | 단계별 분리된 진행 |
| `progress-circular` | Progress · Circular | 원형 진행 (SVG) |
| `slider-single` | Slider · Single | 단일 값 |
| `slider-range` | Slider · Range | 이중 썸 (범위) |

### HTML Snippets

**Progress Bar**

```html
<div class="progress"><div class="progress-fill" style="width:60%;"></div></div>
```

**Progress · Segment**

```html
<div class="progress-segments">
  <span class="seg is-done"></span>
  <span class="seg is-done"></span>
  <span class="seg is-current"></span>
  <span class="seg"></span>
</div>
```

**Progress · Circular**

```html
<svg class="progress-circular" viewBox="0 0 36 36">...</svg>
```

**Slider · Single**

```html
<div class="slider"><div class="slider-fill" style="width:40%;"></div><div class="slider-thumb"></div></div>
```

**Slider · Range**

```html
<div class="slider slider-range"><div class="slider-fill"></div><div class="slider-thumb slider-thumb-min"></div><div class="slider-thumb slider-thumb-max"></div></div>
```

## 상태 (States)

`idle` · `loading` · `complete` · `error` · `hover (slider)` · `dragging (slider)`

## 토큰 (Component Tokens)

| 역할 | CSS 변수 |
| --- | --- |
| track | `--sm-background-muted` |
| fill | `--sm-interactive-brand-default` |
| thumb | `--sm-surface-default` |
| thumbRing | `--sm-interactive-brand-default` |
| height | `6px (bar), 4px (segment)` |
| radius | `--radius-full` |

## 접근성 (Accessibility)

- **Role**: progressbar (Progress) 또는 slider (Slider)
- **Keyboard**: `Slider: Arrow Left/Right (1 step)` · `Home/End` · `PageUp/Down (10 step)`
- **ARIA notes**:
  - Progress: aria-valuenow, aria-valuemin=0, aria-valuemax=100
  - Slider: 동일 + aria-valuetext (포맷된 값), 키보드 Arrow 지원
  - 불확정 진행: aria-valuenow 생략 + 애니메이션

## UX Writing 규칙

- Progress: % 또는 x/y 표기 (3/5 완료)
- Slider: 값 표시에 단위 포함 (12px, ₩15,000)

## 사용 데모

`demo-signup` · `demo-todo`

수정 시 `window.demoMatrix.byComponent['progress']` 로 영향 데모 전수 조회 가능.

---

**See also**: [index.html#progress](../index.html#progress) · [progress-slider.schema.json](progress-slider.schema.json) · [AGENTS.md](../AGENTS.md)