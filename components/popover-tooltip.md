---
component: Popover · Tooltip
canonical: "popover-tooltip.schema.json"
category: Components
version: 0.3.0
sourceHtml: "index.html#popover"
generated: true
---

# Popover · Tooltip

> Tooltip은 설명(hover/focus, 상호작용 없음), Popover는 상호작용 가능한 팝업(클릭 열림, 메뉴·폼 포함).

> ⚙️ 이 문서는 [`popover-tooltip.schema.json`](popover-tooltip.schema.json) 에서 자동 생성됐습니다. 내용 수정은 JSON에서, MD 재생성은 `node scripts/gen-docs.mjs popover`.

## 언제 사용하나 (Use when)

- Tooltip: 아이콘·축약 설명
- Popover: 빠른 액션 메뉴, 옵션, 필터

## 언제 쓰지 않나 (Don't use when)

- 긴 폼 → Dialog 또는 별도 페이지
- 모바일 주 액션 → Bottom Sheet

## 변형 (Variants)

| ID | Label | Description |
| --- | --- | --- |
| `tooltip` | Tooltip | 짧은 설명. hover/focus 시 표시 |
| `popover` | Popover | 클릭으로 열고 외부 클릭으로 닫힘 |
| `date-picker` | Date Picker (Popover variant) | 달력 기반 날짜 선택 |

### HTML Snippets

**Tooltip**

```html
<button class="btn btn-icon" aria-describedby="tt1"><svg class="ico"><use href="#i-info"/></svg></button>
<div id="tt1" role="tooltip" class="tooltip">더 알아보기</div>
```

**Popover**

```html
<div class="popover">
  <div class="popover-header">공유</div>
  <ul class="action-list"><li>링크 복사</li><li>이메일</li></ul>
</div>
```

**Date Picker (Popover variant)**

```html
<div class="popover popover-datepicker">...</div>
```

## 상태 (States)

`closed` · `opening` · `open` · `closing`

## 토큰 (Component Tokens)

| 역할 | CSS 변수 |
| --- | --- |
| bg | `--sm-background-default` |
| border | `--sm-border-subtle` |
| shadow | `--elevation-4` |
| radius | `--radius-md` |

## 접근성 (Accessibility)

- **Role**: tooltip (Tooltip) · dialog (Popover)
- **Keyboard**: `Esc (닫기)` · `Tab (내부 포커스 이동 — Popover)`
- **ARIA notes**:
  - Tooltip: aria-describedby (트리거에서 연결)
  - Popover: aria-haspopup=dialog, aria-expanded, aria-controls
  - Tooltip에 상호작용 요소 금지

## UX Writing 규칙

- Tooltip: 6자 이내 명사구
- Popover: 간결한 액션 리스트

## 사용 데모

`demo-map`

수정 시 `window.demoMatrix.byComponent['popover']` 로 영향 데모 전수 조회 가능.

---

**See also**: [index.html#popover](../index.html#popover) · [popover-tooltip.schema.json](popover-tooltip.schema.json) · [AGENTS.md](../AGENTS.md)