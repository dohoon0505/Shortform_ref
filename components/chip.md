---
component: Chip
canonical: "chip.schema.json"
category: Components
version: 0.2.0
sourceHtml: "index.html#chip"
generated: true
---

# Chip

> 필터·카테고리·태그를 토글·제거 가능한 작은 상호작용 요소. Badge와 달리 상호작용 가능.

> ⚙️ 이 문서는 [`chip.schema.json`](chip.schema.json) 에서 자동 생성됐습니다. 내용 수정은 JSON에서, MD 재생성은 `node scripts/gen-docs.mjs chip`.

## 언제 사용하나 (Use when)

- 필터 선택
- 태그 입력
- 카테고리 표시

## 언제 쓰지 않나 (Don't use when)

- 단순 상태 표시 → Badge
- 주요 액션 → Button

## 변형 (Variants)

| ID | Label | Description |
| --- | --- | --- |
| `filter` | Filter | 토글 가능한 필터 |
| `filter-active` | Filter · Active | 선택된 상태 |
| `removable` | Removable | X 버튼 포함, 제거 가능 |
| `with-avatar` | With Avatar | 좌측 아바타 + 이름 |
| `with-icon` | With Icon | 좌측 아이콘 |

### HTML Snippets

**Filter**

```html
<span class="chip chip-filter">디자인</span>
```

**Filter · Active**

```html
<span class="chip chip-filter is-active">디자인</span>
```

**Removable**

```html
<span class="chip chip-removable">UX <button class="chip-remove">×</button></span>
```

**With Avatar**

```html
<span class="chip chip-avatar"><span class="avatar sz-xs">DH</span>김도훈</span>
```

**With Icon**

```html
<span class="chip"><svg class="ico ico-sm"><use href="#i-filter"/></svg> 필터</span>
```

## 크기 (Sizes)

| ID | 값 |
| --- | --- |
| `chip-sm` | height: `24`, fontSize: `11` |
| `chip-md` | height: `28`, fontSize: `12` |
| `chip-lg` | height: `32`, fontSize: `13` |

## 상태 (States)

`rest` · `hover` · `active` · `focus` · `disabled`

## 토큰 (Component Tokens)

| 역할 | CSS 변수 |
| --- | --- |
| bg | `--sm-background-muted` |
| fg | `--sm-content-primary` |
| activeBg | `--sm-interactive-brand-default` |
| activeFg | `--sm-content-onBrand` |
| radius | `--radius-full` |

## 접근성 (Accessibility)

- **Role**: button (토글) 또는 listitem (필터 그룹 내)
- **Keyboard**: `Enter` · `Space` · `Delete (제거 시)`
- **ARIA notes**:
  - 토글: aria-pressed
  - 제거 버튼은 별도 aria-label (예: '제거: UX')

## UX Writing 규칙

- 1-2 단어
- 대문자 지양 (태그는 자연어)

## 사용 데모

`demo-community` · `demo-todo` · `demo-booking` · `demo-map` · `demo-notify`

수정 시 `window.demoMatrix.byComponent['chip']` 로 영향 데모 전수 조회 가능.

---

**See also**: [index.html#chip](../index.html#chip) · [chip.schema.json](chip.schema.json) · [AGENTS.md](../AGENTS.md)