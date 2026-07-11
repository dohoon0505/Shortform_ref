---
component: Top App Bar
canonical: "top-app-bar.schema.json"
category: Components
version: 0.3.2
sourceHtml: "index.html#appbar"
generated: true
---

# Top App Bar

> 모바일 상단 고정 헤더. 제목·뒤로가기·주요 액션을 담음. 5가지 표준 변형.

> ⚙️ 이 문서는 [`top-app-bar.schema.json`](top-app-bar.schema.json) 에서 자동 생성됐습니다. 내용 수정은 JSON에서, MD 재생성은 `node scripts/gen-docs.mjs appbar`.

## 언제 사용하나 (Use when)

- 모바일 화면 상단 고정
- 제목 · 주 액션 표시

## 언제 쓰지 않나 (Don't use when)

- 탭 기반 홈 → Tab Bar만 사용
- 오버레이 내부에서 자체 close 있으면 생략 가능

## 변형 (Variants)

| ID | Label | Description |
| --- | --- | --- |
| `center-back-more` | Center title · back + more | 제목 중앙. 좌측 뒤로가기, 우측 more |
| `left-back-more` | Left title · back + more |  |
| `left-back-next` | Left title · back + 다음(text) | 폼 상단. 텍스트 액션 (다음/저장/완료) |
| `left-close` | Left title · close | 모달형 화면. close 아이콘 |
| `left-next` | Left title · 다음(text) | 뒤로가기 없음. 최초 진입 폼 |
| `large-title` | Large Title | iOS 스타일 스크롤 확장 헤더 |

### HTML Snippets

**Center title · back + more**

```html
<div class="m-topbar"><div class="m-back"><svg class="ico"><use href="#i-arrow-left"/></svg></div><h2 class="title-center">제목</h2><div class="action"><svg class="ico"><use href="#i-more-v"/></svg></div></div>
```

**Left title · back + more**

```html
<div class="m-topbar"><div class="m-back"><svg class="ico"><use href="#i-arrow-left"/></svg></div><h2>제목</h2><div class="action"><svg class="ico"><use href="#i-more-v"/></svg></div></div>
```

**Left title · back + 다음(text)**

```html
<div class="m-topbar"><div class="m-back">...</div><h2>회원가입</h2><div class="m-action">다음</div></div>
```

**Left title · close**

```html
<div class="m-topbar"><div class="m-back"><svg class="ico"><use href="#i-close"/></svg></div><h2>제목</h2></div>
```

**Left title · 다음(text)**

```html
<div class="m-topbar"><h2>시작하기</h2><div class="m-action">건너뛰기</div></div>
```

**Large Title**

```html
<div class="m-topbar-large"><h1>홈</h1></div>
```

## 상태 (States)

`rest` · `scrolled (shadow appear)`

## 토큰 (Component Tokens)

| 역할 | CSS 변수 |
| --- | --- |
| bg | `--sm-background-default` |
| border | `--sm-border-subtle` |
| title | `--sm-content-primary` |
| action | `--sm-content-brand` |
| height | `52px` |
| iconSize | `22px` |

## 접근성 (Accessibility)

- **Role**: banner (페이지 헤더)
- **ARIA notes**:
  - 제목은 <h1> 또는 <h2>
  - back 버튼: aria-label="뒤로가기"
  - close 버튼: aria-label="닫기"

## UX Writing 규칙

- 제목은 명사 (설정, 알림)
- 텍스트 액션은 2-3자 (다음, 저장, 완료)
- 현재 화면 이름만 표시 (앱 이름 중복 금지)

## 사용 데모

`demo-login` · `demo-signup` · `demo-store` · `demo-pricing` · `demo-calendar` · `demo-todo` · `demo-chat` · `demo-checkout` · `demo-notify` · `demo-mypage`

수정 시 `window.demoMatrix.byComponent['appbar']` 로 영향 데모 전수 조회 가능.

---

**See also**: [index.html#appbar](../index.html#appbar) · [top-app-bar.schema.json](top-app-bar.schema.json) · [AGENTS.md](../AGENTS.md)