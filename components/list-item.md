---
component: List Item
canonical: "list-item.schema.json"
category: Components
version: 0.2.0
sourceHtml: "index.html#list"
generated: true
---

# List Item

> 리스트의 한 행. Leading(아이콘·아바타) + 본문(제목·설명) + Trailing(메타·chevron·체크) 3단 구조.

> ⚙️ 이 문서는 [`list-item.schema.json`](list-item.schema.json) 에서 자동 생성됐습니다. 내용 수정은 JSON에서, MD 재생성은 `node scripts/gen-docs.mjs list`.

## 언제 사용하나 (Use when)

- 설정 메뉴
- 연락처 리스트
- 메시지 미리보기
- 옵션 선택

## 언제 쓰지 않나 (Don't use when)

- 카드 그룹 → Card
- 긴 에디터블 폼 → Text Field

## 변형 (Variants)

| ID | Label | Description |
| --- | --- | --- |
| `single` | Single line |  |
| `two-line` | Two line |  |
| `avatar-row` | Avatar row | 아바타 + 이름 + 부가정보 |
| `selectable` | Selectable | 체크박스/라디오 내장 |

### HTML Snippets

**Single line**

```html
<div class="list-item">
  <div class="list-body"><div class="title">설정</div></div>
  <svg class="ico ico-sm trailing"><use href="#i-chevron-right"/></svg>
</div>
```

**Two line**

```html
<div class="list-item">
  <div class="list-leading"><svg class="ico"><use href="#i-bell"/></svg></div>
  <div class="list-body">
    <div class="title">알림</div>
    <div class="sub">3 new</div>
  </div>
  <svg class="ico ico-sm trailing"><use href="#i-chevron-right"/></svg>
</div>
```

**Avatar row**

```html
<div class="list-item">
  <div class="avatar sz-md">DH</div>
  <div class="list-body"><div class="title">김도훈</div><div class="sub">2시간 전 · 디자인</div></div>
</div>
```

**Selectable**

```html
<label class="list-item list-selectable">
  <input type="checkbox">
  <div class="list-body"><div class="title">옵션</div></div>
</label>
```

## 상태 (States)

`rest` · `hover` · `active` · `selected` · `disabled`

## 토큰 (Component Tokens)

| 역할 | CSS 변수 |
| --- | --- |
| bg | `--sm-surface-default` |
| hover | `--sm-background-subtle` |
| border | `--sm-border-subtle` |
| padding | `var(--size-400) var(--size-500)` |

## 부속 요소 (Sub-parts)

| 클래스 | 역할 |
| --- | --- |
| `list-leading` | 좌측 아이콘/아바타 영역 |
| `list-body` | 제목·설명 영역 |
| `list-body .title` | 제목 |
| `list-body .sub` | 보조 설명 |
| `list-trailing` | 우측 메타 (chevron, badge, 스위치 등) |

## 접근성 (Accessibility)

- **Role**: listitem (부모 ul/ol 아래) 또는 button/link
- **Keyboard**: `Tab` · `Enter (액션)`
- **Min touch target**: 44px

## UX Writing 규칙

- 제목은 명사 (알림, 결제 수단)
- sub는 메타 (시간·수량·상태)

## 사용 데모

`demo-foodorder` · `demo-mypage` · `demo-chat` · `demo-notify` · `demo-banking`

수정 시 `window.demoMatrix.byComponent['list']` 로 영향 데모 전수 조회 가능.

---

**See also**: [index.html#list](../index.html#list) · [list-item.schema.json](list-item.schema.json) · [AGENTS.md](../AGENTS.md)