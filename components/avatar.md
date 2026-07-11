---
component: Avatar
canonical: "avatar.schema.json"
category: Components
version: 0.3.0
sourceHtml: "index.html#avatar"
generated: true
---

# Avatar

> 사용자·조직·브랜드를 시각적으로 식별. 이미지·이니셜·아이콘 지원, 상태 링·스택 변형.

> ⚙️ 이 문서는 [`avatar.schema.json`](avatar.schema.json) 에서 자동 생성됐습니다. 내용 수정은 JSON에서, MD 재생성은 `node scripts/gen-docs.mjs avatar`.

## 언제 사용하나 (Use when)

- 프로필 식별
- 팀 멤버 표시
- 아바타 스택
- 리스트 아이템 leading

## 언제 쓰지 않나 (Don't use when)

- 단순 아이콘 → SVG 심볼
- 로고 → 별도 이미지

## 변형 (Variants)

| ID | Label | Description |
| --- | --- | --- |
| `image` | Image |  |
| `initials` | Initials | 이미지가 없을 때. 2글자, 배경색은 a1~a6 palette 중 결정성 매핑 |
| `icon` | Icon |  |
| `with-status` | With Status Ring | 온라인 상태 인디케이터 (초록 점 on border) |
| `stack` | Stack | 겹친 아바타 그룹 + '+N' 더보기 |

### HTML Snippets

**Image**

```html
<div class="avatar av-image sz-md"><img src="..." alt="김도훈"></div>
```

**Initials**

```html
<div class="avatar av-solid sz-md a1">DH</div>
```

**Icon**

```html
<div class="avatar av-icon sz-md"><svg class="ico"><use href="#i-user"/></svg></div>
```

**With Status Ring**

```html
<div class="avatar av-solid sz-md">DH<span class="status-ring"></span></div>
```

**Stack**

```html
<div class="avatar-stack">
  <div class="avatar sz-md">DH</div>
  <div class="avatar sz-md">JK</div>
  <div class="avatar sz-md more">+19</div>
</div>
```

## 크기 (Sizes)

| ID | 값 |
| --- | --- |
| `sz-xs` | px: `24` |
| `sz-sm` | px: `32` |
| `sz-md` | px: `40` |
| `sz-lg` | px: `56` |
| `sz-xl` | px: `80` |

## 상태 (States)

`rest` · `hover (clickable)`

## 토큰 (Component Tokens)

| 역할 | CSS 변수 |
| --- | --- |
| bg | `--cm-avatar-bg` |
| fg | `--cm-avatar-fg` |
| radius | `50%` |
| statusRing | `--sm-status-success` |

## 접근성 (Accessibility)

- **ARIA notes**:
  - img variant: alt 필수 (사용자 이름)
  - initials/icon variant: aria-label로 전체 이름 제공
  - status-ring은 장식용 — 의미(온라인/오프라인)는 텍스트나 aria-label로 중복 제공

## UX Writing 규칙

- 이니셜: 2글자 고정 (한글도 가능)
- alt는 전체 이름 ('김도훈 아바타' 금지, 그냥 '김도훈')

## 사용 데모

`demo-community` · `demo-mypage` · `demo-chat`

수정 시 `window.demoMatrix.byComponent['avatar']` 로 영향 데모 전수 조회 가능.

---

**See also**: [index.html#avatar](../index.html#avatar) · [avatar.schema.json](avatar.schema.json) · [AGENTS.md](../AGENTS.md)