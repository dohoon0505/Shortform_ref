---
component: Drawer · Breadcrumb
canonical: "drawer-breadcrumb.schema.json"
category: Components
version: 0.3.0
sourceHtml: "index.html#drawer"
generated: true
---

# Drawer · Breadcrumb

> Drawer는 측면 슬라이드 메뉴 패널(주 메뉴), Breadcrumb은 계층 경로 표시.

> ⚙️ 이 문서는 [`drawer-breadcrumb.schema.json`](drawer-breadcrumb.schema.json) 에서 자동 생성됐습니다. 내용 수정은 JSON에서, MD 재생성은 `node scripts/gen-docs.mjs drawer`.

## 언제 사용하나 (Use when)

- Drawer: 10개 이상 메뉴 (Tab Bar로 불가능한 경우), 임시 필터 패널
- Breadcrumb: 깊은 계층 탐색 (상품 카테고리, 파일 경로)

## 언제 쓰지 않나 (Don't use when)

- 주 이동 3–5개 → Tab Bar
- 얕은 구조 (2depth) → Breadcrumb 불필요

## 변형 (Variants)

| ID | Label | Description |
| --- | --- | --- |
| `drawer-left` | Drawer · Left | 좌측 슬라이드 (주 메뉴) |
| `drawer-right` | Drawer · Right | 우측 슬라이드 (필터·상세) |
| `breadcrumb` | Breadcrumb |  |

### HTML Snippets

**Drawer · Left**

```html
<aside class="drawer drawer-left">
  <nav class="drawer-nav">
    <a class="drawer-link is-active">홈</a>
    <a class="drawer-link">설정</a>
  </nav>
</aside>
```

**Drawer · Right**

```html
<aside class="drawer drawer-right">...</aside>
```

**Breadcrumb**

```html
<nav class="breadcrumb" aria-label="경로">
  <a>홈</a><span class="separator">/</span>
  <a>상품</a><span class="separator">/</span>
  <span aria-current="page">의류</span>
</nav>
```

## 상태 (States)

`closed` · `opening` · `open` · `closing`

## 토큰 (Component Tokens)

| 역할 | CSS 변수 |
| --- | --- |
| drawerBg | `--sm-background-default` |
| drawerShadow | `--elevation-5` |
| drawerWidth | `288px` |
| scrim | `--sm-background-overlay` |
| breadcrumbFg | `--sm-content-tertiary` |
| breadcrumbActive | `--sm-content-primary` |

## 접근성 (Accessibility)

- **Role**: navigation (Drawer, Breadcrumb)
- **Keyboard**: `Esc (Drawer 닫기)` · `Tab (포커스 트랩 — Drawer)`
- **ARIA notes**:
  - Drawer: aria-label="주 메뉴" + 열릴 때 aria-expanded
  - Breadcrumb: aria-label="경로", 마지막 항목에 aria-current=page

## UX Writing 규칙

- Drawer 항목: 간결한 명사
- Breadcrumb: 각 항목 2-4자

---

**See also**: [index.html#drawer](../index.html#drawer) · [drawer-breadcrumb.schema.json](drawer-breadcrumb.schema.json) · [AGENTS.md](../AGENTS.md)