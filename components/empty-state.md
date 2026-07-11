---
component: Empty State
canonical: "empty-state.schema.json"
category: Components
version: 0.3.0
sourceHtml: "index.html#empty"
generated: true
---

# Empty State

> 비어 있음을 초대로. 일러스트·제목·설명·액션의 조합. 3가지 시나리오: first use / search / error.

> ⚙️ 이 문서는 [`empty-state.schema.json`](empty-state.schema.json) 에서 자동 생성됐습니다. 내용 수정은 JSON에서, MD 재생성은 `node scripts/gen-docs.mjs empty`.

## 언제 사용하나 (Use when)

- first use: 아무 데이터도 없는 신규 상태
- search: 결과 0건
- error: 실패 후 복구 가능 상태

## 언제 쓰지 않나 (Don't use when)

- 영구 오류 → 별도 페이지
- 잠시 로딩 중 → Skeleton

## 변형 (Variants)

| ID | Label | Description |
| --- | --- | --- |
| `first-use` | First use | 아직 데이터가 없음. 첫 액션 유도 |
| `search` | No search results |  |
| `error` | Error | 네트워크 오류, 권한 없음 등 |

### HTML Snippets

**First use**

```html
<div class="empty">
  <div class="empty-illust"><!-- 일러스트 --></div>
  <h3>첫 프로젝트를 만들어보세요</h3>
  <p>몇 분이면 됩니다. 템플릿으로 빠르게 시작하거나 처음부터 만들 수 있어요.</p>
  <button class="btn btn-primary">프로젝트 만들기</button>
</div>
```

**No search results**

```html
<div class="empty">
  <div class="empty-illust empty-illust-search"></div>
  <h3>'UIUX-DH'와 일치하는 결과가 없어요</h3>
  <p>다른 키워드로 다시 검색해보세요.</p>
  <button class="btn btn-outline">검색 초기화</button>
</div>
```

**Error**

```html
<div class="empty">
  <div class="empty-illust empty-illust-error"></div>
  <h3>연결에 실패했어요</h3>
  <p>네트워크를 확인하고 다시 시도해주세요.</p>
  <button class="btn btn-primary">다시 시도</button>
</div>
```

## 상태 (States)

`rest`

## 토큰 (Component Tokens)

| 역할 | CSS 변수 |
| --- | --- |
| illustTint | `--sm-content-tertiary (또는 브랜드 subtle)` |
| titleFg | `--sm-content-primary` |
| descFg | `--sm-content-secondary` |
| maxWidth | `360px` |
| padding | `var(--size-800) var(--size-600)` |

## 접근성 (Accessibility)

- **Role**: region
- **ARIA notes**:
  - aria-labelledby=titleId
  - 에러 variant: aria-live=polite (동적 표시 시)

## UX Writing 규칙

- 제목: 상황 설명 + 방향 제시
- 설명: 1-2문장, 구체적 해결 방법
- CTA: 동사로 끝 + 구체적 결과 (프로젝트 만들기, 다시 시도, 검색 초기화)
- '비어 있음' / '데이터 없음' 같은 기계적 문구 금지

## 사용 데모

`demo-notify`

수정 시 `window.demoMatrix.byComponent['empty']` 로 영향 데모 전수 조회 가능.

---

**See also**: [index.html#empty](../index.html#empty) · [empty-state.schema.json](empty-state.schema.json) · [AGENTS.md](../AGENTS.md)