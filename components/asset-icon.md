---
component: Asset · Icon
canonical: "asset-icon.schema.json"
category: Components
version: 0.3.2
sourceHtml: "index.html#asset"
generated: true
---

# Asset · Icon

> UIUX-DH Icon Package v1. SVG 심볼 스프라이트(40+ 심볼). 24×24 viewBox · 1.7 stroke · round linecap/linejoin · currentColor.

> ⚙️ 이 문서는 [`asset-icon.schema.json`](asset-icon.schema.json) 에서 자동 생성됐습니다. 내용 수정은 JSON에서, MD 재생성은 `node scripts/gen-docs.mjs asset`.

## 언제 사용하나 (Use when)

- 탭바 / 액션 버튼 / 상태 표시 / 메타 아이콘

## 언제 쓰지 않나 (Don't use when)

- 복잡한 일러스트 → 별도 SVG/IMG

## 변형 (Variants)

| ID | Label | Description |
| --- | --- | --- |
| `nav-pair` | Navigation pair (outline + fill) | 탭바 액티브/인액티브 쌍 |
| `action` | Action | back/close/plus/minus/chevron 등 |
| `common` | Common | search/bell/heart/settings/map-pin 등 |
| `status` | Status |  |

### HTML Snippets

**Navigation pair (outline + fill)**

```html
<svg class="ico"><use href="#i-home"/></svg>
<svg class="ico"><use href="#i-home-fill"/></svg>
```

**Action**

```html
<svg class="ico"><use href="#i-arrow-left"/></svg>
```

**Common**

```html
<svg class="ico"><use href="#i-bell"/></svg>
```

**Status**

```html
<svg class="ico" style="color:var(--sm-status-success);"><use href="#i-check-circle"/></svg>
```

## 크기 (Sizes)

| ID | 값 |
| --- | --- |
| `ico-sm` | px: `16` |
| `ico` | px: `20` |
| `ico-md` | px: `24` |
| `ico-lg` | px: `32` |
| `ico-xl` | px: `40` |

## 상태 (States)

`rest`

## 토큰 (Component Tokens)

| 역할 | CSS 변수 |
| --- | --- |
| color | `currentColor (부모 color 상속)` |

## 접근성 (Accessibility)

- **ARIA notes**:
  - 장식용 아이콘: aria-hidden=true
  - 의미 있는 아이콘: aria-label 또는 <title> 제공
  - 이모지 사용 금지 (원칙)

## 사용 데모

`demo-login` · `demo-signup` · `demo-community` · `demo-store` · `demo-calendar` · `demo-todo` · `demo-booking` · `demo-foodorder` · `demo-shopping` · `demo-social` · `demo-banking` · `demo-map` · `demo-mypage` · `demo-chat` · `demo-checkout` · `demo-notify`

수정 시 `window.demoMatrix.byComponent['asset']` 로 영향 데모 전수 조회 가능.

---

**See also**: [index.html#asset](../index.html#asset) · [asset-icon.schema.json](asset-icon.schema.json) · [AGENTS.md](../AGENTS.md)