---
component: Border · Divider
canonical: "border-divider.schema.json"
category: Components
version: 0.2.0
sourceHtml: "index.html#border"
generated: true
---

# Border · Divider

> Border는 요소의 경계(4강도), Divider는 섹션 구분선(3패턴).

> ⚙️ 이 문서는 [`border-divider.schema.json`](border-divider.schema.json) 에서 자동 생성됐습니다. 내용 수정은 JSON에서, MD 재생성은 `node scripts/gen-docs.mjs border`.

## 언제 사용하나 (Use when)

- 영역 경계
- 섹션 분리
- 대체 인풋 구분 (OR)

## 언제 쓰지 않나 (Don't use when)

- 시각적 충분한 공백으로 분리 가능하면 생략

## 변형 (Variants)

| ID | Label | Description |
| --- | --- | --- |
| `border-subtle` | Border · Subtle |  |
| `border-default` | Border · Default |  |
| `border-strong` | Border · Strong |  |
| `border-brand` | Border · Brand |  |
| `divider-solid` | Divider · Solid |  |
| `divider-dashed` | Divider · Dashed |  |
| `divider-with-label` | Divider · With label |  |

### HTML Snippets

**Divider · Solid**

```html
<hr class="divider">
```

**Divider · Dashed**

```html
<hr class="divider divider-dashed">
```

**Divider · With label**

```html
<div class="m-divider">또는</div>
```

## 상태 (States)

`rest`

## 토큰 (Component Tokens)

| 역할 | CSS 변수 |
| --- | --- |
| color | `--sm-border-{strength}` |
| width | `1px` |

## 사용 데모

`demo-login` · `demo-signup` · `demo-pricing` · `demo-store`

수정 시 `window.demoMatrix.byComponent['border']` 로 영향 데모 전수 조회 가능.

---

**See also**: [index.html#border](../index.html#border) · [border-divider.schema.json](border-divider.schema.json) · [AGENTS.md](../AGENTS.md)