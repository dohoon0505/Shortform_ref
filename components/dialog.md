---
component: Dialog
canonical: "dialog.schema.json"
category: Components
version: 0.3.0
sourceHtml: "index.html#dialog"
generated: true
---

# Dialog

> 사용자의 선택을 강제로 멈추게 함. 결정 없이는 되돌아갈 수 없어야 할 때만 사용. 남용하면 신뢰를 잃음.

> ⚙️ 이 문서는 [`dialog.schema.json`](dialog.schema.json) 에서 자동 생성됐습니다. 내용 수정은 JSON에서, MD 재생성은 `node scripts/gen-docs.mjs dialog`.

## 언제 사용하나 (Use when)

- 되돌릴 수 없는 액션 확인
- 필수 입력 강요
- 중요한 시스템 알림

## 언제 쓰지 않나 (Don't use when)

- 잠시 나타나는 알림 → Toast
- 상세 정보 표시 → Bottom Sheet 또는 별도 페이지
- 광고·프로모션 → Banner

## 변형 (Variants)

| ID | Label | Description |
| --- | --- | --- |
| `confirm` | Confirm | 일반 확인/취소 |
| `destructive` | Destructive | 되돌릴 수 없는 액션. 위험한 액션은 오른쪽. |
| `alert` | Alert (one action) | 단일 액션 (확인만) |

### HTML Snippets

**Confirm**

```html
<div class="dialog">
  <h4>변경 사항을 저장할까요?</h4>
  <p>저장하지 않고 나가면 작업이 사라져요.</p>
  <div class="dialog-actions">
    <button class="btn btn-secondary">취소</button>
    <button class="btn btn-primary">저장</button>
  </div>
</div>
```

**Destructive**

```html
<div class="dialog">
  <h4>삭제한 프로젝트는 복구할 수 없어요</h4>
  <p>'v0.3' 프로젝트와 포함된 12개 파일이 함께 삭제돼요.</p>
  <div class="dialog-actions">
    <button class="btn btn-secondary">닫기</button>
    <button class="btn btn-danger">삭제하기</button>
  </div>
</div>
```

**Alert (one action)**

```html
<div class="dialog">
  <h4>네트워크에 연결할 수 없어요</h4>
  <p>Wi-Fi 또는 모바일 데이터를 확인해주세요.</p>
  <div class="dialog-actions">
    <button class="btn btn-primary btn-full">확인</button>
  </div>
</div>
```

## 상태 (States)

`closed` · `opening` · `open` · `closing`

## 토큰 (Component Tokens)

| 역할 | CSS 변수 |
| --- | --- |
| bg | `--sm-background-default` |
| scrim | `--sm-background-overlay` |
| radius | `--radius-xl` |
| elevation | `--elevation-5` |
| padding | `var(--size-700)` |

## 접근성 (Accessibility)

- **Role**: dialog
- **Keyboard**: `Esc (닫기)` · `Tab (포커스 트랩)`
- **ARIA notes**:
  - aria-modal=true
  - aria-labelledby=titleId
  - 열릴 때 제목 또는 첫 포커스 가능 요소로 초기 포커스
  - 닫힐 때 원래 트리거로 포커스 복귀
  - scrim 클릭 시 닫힘 여부는 옵션 (destructive는 false 권장)

## UX Writing 규칙

- 제목은 질문이나 결과 (변경 사항을 저장할까요? / 삭제한 프로젝트는 복구할 수 없어요)
- 버튼은 동사 (저장, 삭제, 계속) — 'OK' 금지
- destructive의 버튼: '예'/'아니요' 대신 구체적 결과 (삭제하기, 취소)

---

**See also**: [index.html#dialog](../index.html#dialog) · [dialog.schema.json](dialog.schema.json) · [AGENTS.md](../AGENTS.md)