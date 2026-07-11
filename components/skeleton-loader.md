---
component: Skeleton Loader
canonical: "skeleton-loader.schema.json"
category: Components
version: 0.3.0
sourceHtml: "index.html#skeleton"
generated: true
---

# Skeleton Loader

> 500ms 이상의 로딩 동안 실제 콘텐츠의 그림자를 미리 보여줌. shimmer 애니메이션으로 '곧 채워진다'는 신호.

> ⚙️ 이 문서는 [`skeleton-loader.schema.json`](skeleton-loader.schema.json) 에서 자동 생성됐습니다. 내용 수정은 JSON에서, MD 재생성은 `node scripts/gen-docs.mjs skeleton`.

## 언제 사용하나 (Use when)

- 500ms 이상 예상되는 로딩
- 레이아웃 시프트 방지

## 언제 쓰지 않나 (Don't use when)

- 500ms 미만 → 아무것도 표시하지 않음
- 이미 데이터가 있을 때 refresh → 리프레시 인디케이터만
- 에러 상태 → Empty State

## 변형 (Variants)

| ID | Label | Description |
| --- | --- | --- |
| `text-line` | Text Line |  |
| `avatar` | Avatar |  |
| `thumbnail` | Thumbnail |  |
| `card` | Card | 카드 전체 (avatar + 2 lines + thumb) |
| `list-row` | List Row | leading + title + sub |

### HTML Snippets

**Text Line**

```html
<div class="skeleton skeleton-text"></div>
```

**Avatar**

```html
<div class="skeleton skeleton-avatar"></div>
```

**Thumbnail**

```html
<div class="skeleton skeleton-thumb"></div>
```

**Card**

```html
<div class="skeleton-card">...</div>
```

## 상태 (States)

`loading`

## 토큰 (Component Tokens)

| 역할 | CSS 변수 |
| --- | --- |
| bg | `--sm-background-muted` |
| shimmer | `linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)` |
| radius | `--radius-sm (text), 50% (avatar)` |
| duration | `1.4s` |
| easing | `ease-in-out infinite` |

## 접근성 (Accessibility)

- **Role**: status
- **ARIA notes**:
  - 부모 컨테이너에 aria-busy=true, aria-live=polite
  - 스크린리더에 '로딩 중' 텍스트 제공 (시각 숨김)
  - prefers-reduced-motion 시 shimmer 애니메이션 제거

## UX Writing 규칙

- 텍스트 없음 (시각적 신호만)

---

**See also**: [index.html#skeleton](../index.html#skeleton) · [skeleton-loader.schema.json](skeleton-loader.schema.json) · [AGENTS.md](../AGENTS.md)