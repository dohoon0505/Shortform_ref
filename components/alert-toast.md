---
component: Alert · Toast
canonical: "alert-toast.schema.json"
category: Components
version: 0.2.0
sourceHtml: "index.html#alert"
generated: true
---

# Alert · Toast

> Alert은 머무는 알림 (컨텍스트 내 지속), Toast는 잠시 나타났다 사라지는 알림 (3-5초).

> ⚙️ 이 문서는 [`alert-toast.schema.json`](alert-toast.schema.json) 에서 자동 생성됐습니다. 내용 수정은 JSON에서, MD 재생성은 `node scripts/gen-docs.mjs alert`.

## 언제 사용하나 (Use when)

- Alert: 지속적 상태 안내 (세션 만료, 입력 오류 요약)
- Toast: 즉시 피드백 (저장·복사·전송 완료)

## 언제 쓰지 않나 (Don't use when)

- 사용자 결정 필요 → Dialog
- 긴 설명 → 카드·섹션
- Toast에 중요 액션 버튼 배치 금지 (자동 소멸 위험)

## 변형 (Variants)

| ID | Label | Description |
| --- | --- | --- |
| `alert-info` | Alert · Info |  |
| `alert-success` | Alert · Success |  |
| `alert-warning` | Alert · Warning |  |
| `alert-error` | Alert · Error |  |
| `toast-top` | Toast · Top | 화면 상단에서 3-5초 표시 후 자동 소멸 |
| `toast-bottom` | Toast · Bottom | 화면 하단 (모바일 표준) |

### HTML Snippets

**Alert · Info**

```html
<div class="alert alert-info"><svg class="ico"><use href="#i-info"/></svg><div><strong>안내</strong> 이전 주문의 배송이 완료됐어요.</div></div>
```

**Alert · Success**

```html
<div class="alert alert-success"><svg class="ico"><use href="#i-check-circle"/></svg>저장되었어요</div>
```

**Alert · Warning**

```html
<div class="alert alert-warning"><svg class="ico"><use href="#i-alert"/></svg>세션이 곧 만료돼요</div>
```

**Alert · Error**

```html
<div class="alert alert-error"><svg class="ico"><use href="#i-x-circle"/></svg>결제에 실패했어요. 다른 카드를 시도해보세요.</div>
```

**Toast · Top**

```html
<div class="toast toast-top toast-success">링크가 복사됐어요</div>
```

**Toast · Bottom**

```html
<div class="toast toast-bottom toast-error">네트워크를 확인해주세요</div>
```

## 상태 (States)

`rest` · `entering` · `leaving`

## 토큰 (Component Tokens)

| 역할 | CSS 변수 |
| --- | --- |
| bg | `--sm-status-{variant}-subtle` |
| fg | `--sm-status-{variant}` |
| border | `--sm-status-{variant}` |
| radius | `--radius-md` |

## 접근성 (Accessibility)

- **Role**: alert (긴급) 또는 status (일반)
- **ARIA notes**:
  - role=alert: 스크린리더 즉시 읽음
  - role=status: aria-live=polite와 유사, 끼어들지 않음
  - Toast: 자동 소멸 전 포커스 가능한 닫기 버튼 권장

## UX Writing 규칙

- Alert 제목은 명사구, 본문은 해결 방법
- Toast는 한 문장, 동사 (저장됐어요, 전송됐어요)
- Error: 실패 이유 + 해결 방법 ("만료된 카드예요. 다른 카드로 결제해보세요")

## 사용 데모

`demo-notify` · `demo-checkout`

수정 시 `window.demoMatrix.byComponent['alert']` 로 영향 데모 전수 조회 가능.

---

**See also**: [index.html#alert](../index.html#alert) · [alert-toast.schema.json](alert-toast.schema.json) · [AGENTS.md](../AGENTS.md)