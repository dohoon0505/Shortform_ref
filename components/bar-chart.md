---
component: Bar Chart
canonical: "bar-chart.schema.json"
category: Components
version: 0.2.0
sourceHtml: "index.html#chart"
generated: true
---

# Bar Chart

> 데이터 시각화. vertical / horizontal / stacked 3타입.

> ⚙️ 이 문서는 [`bar-chart.schema.json`](bar-chart.schema.json) 에서 자동 생성됐습니다. 내용 수정은 JSON에서, MD 재생성은 `node scripts/gen-docs.mjs chart`.

## 언제 사용하나 (Use when)

- 수치 비교
- 시간 추이
- 구성 비율

## 언제 쓰지 않나 (Don't use when)

- 카테고리 3개 이하 → 단순 리스트
- 연속 데이터 → Line Chart

## 변형 (Variants)

| ID | Label | Description |
| --- | --- | --- |
| `vertical` | Vertical | 시간 비교 (월/주/일) |
| `horizontal` | Horizontal | 카테고리 비교 (라벨 긴 경우) |
| `stacked` | Stacked | 구성 비율 + 전체량 |

## 상태 (States)

`rest` · `hover (단일 bar 강조)` · `loading`

## 토큰 (Component Tokens)

| 역할 | CSS 변수 |
| --- | --- |
| primary | `--sm-interactive-brand-default` |
| secondary | `--sm-background-muted` |
| gridline | `--sm-border-subtle` |
| label | `--sm-content-tertiary` |

## 접근성 (Accessibility)

- **ARIA notes**:
  - 복합 차트는 table 대체 제공 권장 (aria-describedby → 데이터 표)
  - 색상에만 의존하지 말 것 — 텍스트·패턴 병용

---

**See also**: [index.html#chart](../index.html#chart) · [bar-chart.schema.json](bar-chart.schema.json) · [AGENTS.md](../AGENTS.md)