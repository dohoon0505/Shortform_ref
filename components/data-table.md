---
component: Data Table
canonical: "data-table.schema.json"
category: Components
version: 0.3.0
sourceHtml: "index.html#table"
generated: true
---

# Data Table

> 정렬 가능한 행·열 구조로 많은 데이터를 비교. 상태 칩·진행률·뱃지·액션을 셀에 임베드.

> ⚙️ 이 문서는 [`data-table.schema.json`](data-table.schema.json) 에서 자동 생성됐습니다. 내용 수정은 JSON에서, MD 재생성은 `node scripts/gen-docs.mjs table`.

## 언제 사용하나 (Use when)

- 숫자·상태 비교
- 관리 도구 (대시보드)
- 긴 항목 리스트

## 언제 쓰지 않나 (Don't use when)

- 모바일 좁은 화면 → 카드 리스트로 전환
- 2-3개 항목 → List Item
- 시각화가 주목적 → Chart

## 변형 (Variants)

| ID | Label | Description |
| --- | --- | --- |
| `basic` | Basic |  |
| `sortable` | Sortable | 컬럼 헤더 클릭 시 정렬. aria-sort로 상태 표시 |
| `selectable-rows` | Selectable Rows | 체크박스로 행 다중 선택 |
| `sticky-header` | Sticky Header | 스크롤 시 헤더 고정 |
| `density` | Density variants | compact / default / comfortable (행 높이) |

### HTML Snippets

**Basic**

```html
<table class="table">
  <thead><tr><th>이름</th><th>상태</th><th>진행</th></tr></thead>
  <tbody><tr><td>프로젝트 A</td><td><span class="badge badge-success">완료</span></td><td><div class="progress"><div class="progress-fill" style="width:80%;"></div></div></td></tr></tbody>
</table>
```

**Sortable**

```html
<th aria-sort="ascending">이름 ↑</th>
```

**Selectable Rows**

```html
<tr class="is-selected">...</tr>
```

**Sticky Header**

```html
<table class="table table-sticky">...</table>
```

## 상태 (States)

`rest` · `hover-row` · `selected-row` · `sorted`

## 토큰 (Component Tokens)

| 역할 | CSS 변수 |
| --- | --- |
| headerBg | `--sm-background-muted` |
| headerFg | `--sm-content-secondary` |
| rowBorder | `--sm-border-subtle` |
| rowHover | `--sm-background-subtle` |
| selectedBg | `--sm-interactive-brand-subtle` |
| cellPadX | `var(--size-500)` |
| cellPadY | `12px (compact) / 16px / 20px` |

## 접근성 (Accessibility)

- **Role**: table (native HTML table)
- **Keyboard**: `Tab (포커스 이동)` · `Arrow (셀 간 이동 — optional)`
- **ARIA notes**:
  - 정렬: aria-sort="ascending|descending|none"
  - 선택 행: aria-selected=true
  - 캡션: <caption> 또는 aria-labelledby

## UX Writing 규칙

- 컬럼명 짧게 (이름, 상태, 진행)
- 숫자는 tabular-nums

---

**See also**: [index.html#table](../index.html#table) · [data-table.schema.json](data-table.schema.json) · [AGENTS.md](../AGENTS.md)