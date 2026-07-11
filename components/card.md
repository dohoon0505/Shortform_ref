---
component: Card
canonical: "card.schema.json"
category: Components
version: 0.3.0
sourceHtml: "index.html#others"
generated: true
---

# Card

> 나머지 모든 컴포넌트를 담는 그릇. 최소한의 장식으로 내용이 주인공이 되게 합니다. (index.html 상 id는 'others'로 유지 — 레거시 호환)

> ⚙️ 이 문서는 [`card.schema.json`](card.schema.json) 에서 자동 생성됐습니다. 내용 수정은 JSON에서, MD 재생성은 `node scripts/gen-docs.mjs others`.

## 언제 사용하나 (Use when)

- 정보 그룹핑
- 대시보드 위젯
- 상품·프로젝트 카드

## 언제 쓰지 않나 (Don't use when)

- 단순 섹션 구분 → divider 또는 반투명 배경
- 리스트 항목 → List Item

## 변형 (Variants)

| ID | Label | Description |
| --- | --- | --- |
| `default` | Default | 기본 카드. head + body + foot 조합. |

### HTML Snippets

**Default**

```html
<div class="card-demo">
  <div class="card-demo-head">
    <div><h4>제목</h4><div class="sub">보조 설명</div></div>
    <span class="badge badge-success">상태</span>
  </div>
  <div>본문 · 숫자 · 리스트 · 차트</div>
  <button class="btn btn-outline btn-full btn-sm">액션</button>
</div>
```

## 상태 (States)

`rest` · `hover`

## 토큰 (Component Tokens)

| 역할 | CSS 변수 |
| --- | --- |
| bg | `--sm-surface-raised` |
| border | `--sm-border-subtle` |
| radius | `--radius-lg` |
| padding | `--size-600` |

## 부속 요소 (Sub-parts)

| 클래스 | 역할 |
| --- | --- |
| `card-demo-head` | 헤더 영역 (제목 + 보조 메타) |
| `card-demo-head h4` | 제목 |
| `card-demo-head .sub` | 부가 설명 (작은 회색) |

## 접근성 (Accessibility)

- **Role**: article 또는 region (의미에 따라)
- **ARIA notes**:
  - 클릭 가능한 카드는 role=button 또는 <a>로 감싸기

## UX Writing 규칙

- 제목은 명사구 (저장 내역, 이번 주 지출)
- 보조는 날짜·수량 등 메타
- 액션 버튼 1개 권장

## 사용 데모

`demo-community` · `demo-store` · `demo-calendar` · `demo-todo` · `demo-booking` · `demo-foodorder` · `demo-map` · `demo-banking` · `demo-mypage` · `demo-chat` · `demo-checkout` · `demo-notify`

수정 시 `window.demoMatrix.byComponent['others']` 로 영향 데모 전수 조회 가능.

---

**See also**: [index.html#others](../index.html#others) · [card.schema.json](card.schema.json) · [AGENTS.md](../AGENTS.md)