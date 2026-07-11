---
component: Checkbox · Radio · Toggle
canonical: "checkbox-radio-toggle.schema.json"
category: Components
version: 0.2.0
sourceHtml: "index.html#control"
generated: true
---

# Checkbox · Radio · Toggle

> Checkbox는 독립 다중 선택, Radio는 배타적 단일 선택, Toggle은 즉시 적용되는 on/off.

> ⚙️ 이 문서는 [`checkbox-radio-toggle.schema.json`](checkbox-radio-toggle.schema.json) 에서 자동 생성됐습니다. 내용 수정은 JSON에서, MD 재생성은 `node scripts/gen-docs.mjs control`.

## 언제 사용하나 (Use when)

- Checkbox: 독립 항목의 다중 선택 (약관 동의, 필터)
- Radio: 배타적 단일 선택 (결제 방법, 배송 옵션)
- Toggle: 즉시 반영되는 설정 (알림 on/off, 다크 모드)

## 언제 쓰지 않나 (Don't use when)

- Toggle에 저장 버튼 붙이지 말 것 — Toggle은 즉시 적용
- 2-3개 선택지는 Segment로 대체 고려

## 변형 (Variants)

| ID | Label | Description |
| --- | --- | --- |
| `checkbox` | Checkbox |  |
| `checkbox-indeterminate` | Checkbox · Indeterminate | 일부 자식만 선택된 상태 (전체선택 부모) |
| `radio` | Radio |  |
| `toggle` | Toggle (Switch) | 상태 즉시 반영. on=iOS-style 우측 이동 |

### HTML Snippets

**Checkbox**

```html
<label class="checkbox"><input type="checkbox"><span class="check-box"><svg><use href="#i-check"/></svg></span>동의합니다</label>
```

**Checkbox · Indeterminate**

```html
<label class="checkbox"><input type="checkbox" indeterminate><span class="check-box is-indeterminate"></span>모두 동의</label>
```

**Radio**

```html
<label class="radio"><input type="radio" name="plan"><span class="radio-dot"></span>월간 결제</label>
```

**Toggle (Switch)**

```html
<label class="toggle"><input type="checkbox"><span class="toggle-track"><span class="toggle-thumb"></span></span>알림</label>
```

## 상태 (States)

`unchecked` · `checked` · `indeterminate` · `disabled` · `focus` · `hover`

## 토큰 (Component Tokens)

| 역할 | CSS 변수 |
| --- | --- |
| border | `--sm-border-default` |
| checkedBg | `--sm-interactive-brand-default` |
| checkedIconFg | `#fff` |
| toggleTrackOff | `--sm-background-muted` |
| toggleTrackOn | `--sm-interactive-brand-default` |
| radius | `--radius-xs (checkbox), 50% (radio/toggle)` |

## 접근성 (Accessibility)

- **Role**: checkbox / radio / switch (네이티브 input + CSS)
- **Keyboard**: `Space (toggle)` · `Arrow Up/Down (radio group)` · `Tab`
- **Min touch target**: 44px
- **ARIA notes**:
  - label 연결: <label> 감싸기 또는 for/id
  - radio group: <fieldset> + <legend> 권장
  - toggle: role=switch + aria-checked (네이티브 checkbox 사용 시 자동)

## UX Writing 규칙

- Checkbox: 평서문 (이메일 수신 동의)
- Radio: 명사구 (신용카드, 간편결제)
- Toggle: 상태 레이블 (알림, 다크 모드) — On/Off 표시 중복 금지

## 사용 데모

`demo-signup` · `demo-todo` · `demo-banking`

수정 시 `window.demoMatrix.byComponent['control']` 로 영향 데모 전수 조회 가능.

---

**See also**: [index.html#control](../index.html#control) · [checkbox-radio-toggle.schema.json](checkbox-radio-toggle.schema.json) · [AGENTS.md](../AGENTS.md)