---
component: Tab Bar
canonical: "tab-bar.schema.json"
category: Components
version: 0.3.2
sourceHtml: "index.html#tabbar"
generated: true
---

# Tab Bar

> 모바일 하단 고정. 앱 전체 최상위 이동 (3–5탭). 활성 탭은 fill 아이콘 + 브랜드 색.

> ⚙️ 이 문서는 [`tab-bar.schema.json`](tab-bar.schema.json) 에서 자동 생성됐습니다. 내용 수정은 JSON에서, MD 재생성은 `node scripts/gen-docs.mjs tabbar`.

## 언제 사용하나 (Use when)

- 앱 전체 주요 영역 간 이동 (3–5개)

## 언제 쓰지 않나 (Don't use when)

- 같은 화면 내 콘텐츠 전환 → Tabs · Segment
- 6개 이상 → Drawer 또는 Bottom Sheet 메뉴
- 웹 데스크톱 → Top Nav

## 변형 (Variants)

| ID | Label | Description |
| --- | --- | --- |
| `four-tabs` | 4 Tabs |  |
| `five-tabs` | 5 Tabs (standard) | 디자인시스템 표준 — 홈 · 탐색 · 중앙액션 · 알림 · 프로필 |
| `with-badge` | With Badge | 안읽음 카운트 표시 |

### HTML Snippets

**4 Tabs**

```html
<div class="m-tabbar">
  <div class="m-tabbar-item active"><svg class="ico"><use href="#i-home-fill"/></svg>홈</div>
  <div class="m-tabbar-item"><svg class="ico"><use href="#i-search"/></svg>탐색</div>
  <div class="m-tabbar-item"><svg class="ico"><use href="#i-heart"/></svg>찜</div>
  <div class="m-tabbar-item"><svg class="ico"><use href="#i-user"/></svg>내 정보</div>
</div>
```

**5 Tabs (standard)**

```html
<div class="m-tabbar">
  <div class="m-tabbar-item active">홈</div>
  <div class="m-tabbar-item">검색</div>
  <div class="m-tabbar-item">주문</div>
  <div class="m-tabbar-item">찜</div>
  <div class="m-tabbar-item">내 정보</div>
</div>
```

**With Badge**

```html
<div class="m-tabbar-item" style="position:relative;">
  <svg class="ico"><use href="#i-chat"/></svg>
  <span class="tabbar-badge">3</span>
  채팅
</div>
```

## 상태 (States)

`rest` · `active` · `disabled`

## 토큰 (Component Tokens)

| 역할 | CSS 변수 |
| --- | --- |
| bg | `--sm-background-default` |
| border | `--sm-border-subtle` |
| inactiveFg | `--sm-content-tertiary` |
| activeFg | `--sm-content-brand` |
| badgeBg | `--sm-status-error` |
| height | `68px` |
| paddingBottom | `16px (safe-area)` |

## 접근성 (Accessibility)

- **Role**: navigation
- **Min touch target**: 44px
- **ARIA notes**:
  - aria-label="주요 메뉴"
  - 각 탭: role=link + aria-current=page (활성)
  - 탭 간 이동은 Tab 키 (Arrow 선택)

## UX Writing 규칙

- 각 탭 2자 권장 (홈, 검색, 찜, 내 정보)
- 활성 탭은 bold + 브랜드 색

## 사용 데모

`demo-community` · `demo-store` · `demo-booking` · `demo-foodorder` · `demo-shopping` · `demo-social` · `demo-banking` · `demo-map` · `demo-mypage` · `demo-chat` · `demo-notify`

수정 시 `window.demoMatrix.byComponent['tabbar']` 로 영향 데모 전수 조회 가능.

---

**See also**: [index.html#tabbar](../index.html#tabbar) · [tab-bar.schema.json](tab-bar.schema.json) · [AGENTS.md](../AGENTS.md)