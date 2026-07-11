---
component: Button
canonical: "button.schema.json"
category: Components
version: 0.3.2
sourceHtml: "index.html#button"
generated: true
---

# Button

> 액션을 실행하는 상호작용 요소. 7변형 × 5크기 × 6상태.

> ⚙️ 이 문서는 [`button.schema.json`](button.schema.json) 에서 자동 생성됐습니다. 내용 수정은 JSON에서, MD 재생성은 `node scripts/gen-docs.mjs button`.

## 언제 사용하나 (Use when)

- 즉시 액션 실행
- 폼 제출
- 결정 확인

## 언제 쓰지 않나 (Don't use when)

- 페이지 이동만 하면 링크(a) 사용
- 토글 상태면 Toggle/Switch

## 변형 (Variants)

| ID | Label | Description |
| --- | --- | --- |
| `primary` | Primary | 주요 액션. 한 화면에 1개 권장. |
| `tonal` | Tonal | 보조 강조. 브랜드 subtle 배경. |
| `secondary` | Secondary | 중립 액션. 뉴트럴 배경. |
| `outline` | Outline | 테두리 기반, 투명 배경. |
| `ghost` | Ghost | 배경·테두리 없음. 텍스트만. |
| `dark` | Dark | 콘트라스트 강조. 어두운 배경. |
| `danger` | Danger | 되돌릴 수 없는 액션 (삭제 등). |

### HTML Snippets

**Primary**

```html
<button class="btn btn-primary btn-md">저장</button>
```

**Tonal**

```html
<button class="btn btn-tonal btn-md">더 알아보기</button>
```

**Secondary**

```html
<button class="btn btn-secondary btn-md">취소</button>
```

**Outline**

```html
<button class="btn btn-outline btn-md">옵션</button>
```

**Ghost**

```html
<button class="btn btn-ghost btn-md">나중에</button>
```

**Dark**

```html
<button class="btn btn-dark btn-md">확인</button>
```

**Danger**

```html
<button class="btn btn-danger btn-md">삭제</button>
```

## 크기 (Sizes)

| ID | 값 |
| --- | --- |
| `btn-sm` | height: `32`, fontSize: `12`, padX: `12` |
| `btn-md` | height: `40`, fontSize: `14`, padX: `16` |
| `btn-base` | height: `44`, fontSize: `14`, padX: `18` |
| `btn-lg` | height: `48`, fontSize: `15`, padX: `20` |
| `btn-xl` | height: `56`, fontSize: `16`, padX: `24` |

## 상태 (States)

`rest` · `hover` · `active` · `focus` · `disabled` · `loading`

## 토큰 (Component Tokens)

| 역할 | CSS 변수 |
| --- | --- |
| bg | `--cm-button-{variant}-bg` |
| fg | `--cm-button-{variant}-fg` |
| border | `--cm-button-{variant}-border` |
| radius | `--cm-button-radius` |
| hover | `--cm-button-{variant}-hover` |

## 접근성 (Accessibility)

- **Role**: button
- **Keyboard**: `Enter` · `Space`
- **Min touch target**: 44px
- **Focus ring**: `--sm-border-focus`
- **ARIA notes**:
  - 로딩 상태: aria-busy=true
  - 비활성: disabled 속성 (aria-disabled보다 우선)
  - 아이콘 전용 버튼: aria-label 필수

## UX Writing 규칙

- 동사로 끝나기 (저장, 삭제, 계속)
- 4-6자 이내 권장
- danger variant: 구체적 결과 명시 (삭제 → 프로젝트 삭제)

## 사용 데모

`demo-login` · `demo-signup` · `demo-pricing` · `demo-todo` · `demo-checkout` · `demo-social` · `demo-foodorder`

수정 시 `window.demoMatrix.byComponent['button']` 로 영향 데모 전수 조회 가능.

---

**See also**: [index.html#button](../index.html#button) · [button.schema.json](button.schema.json) · [AGENTS.md](../AGENTS.md)