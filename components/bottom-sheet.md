---
component: Bottom Sheet
canonical: "bottom-sheet.schema.json"
category: Components
version: 0.3.0
sourceHtml: "index.html#sheet"
generated: true
---

# Bottom Sheet

> 모바일에서 Dialog 대체. 하단에서 슬라이드업. 드래그로 크기 조절 가능 (modal/non-modal).

> ⚙️ 이 문서는 [`bottom-sheet.schema.json`](bottom-sheet.schema.json) 에서 자동 생성됐습니다. 내용 수정은 JSON에서, MD 재생성은 `node scripts/gen-docs.mjs sheet`.

## 언제 사용하나 (Use when)

- 모바일 액션 메뉴
- 필터 설정
- 지도에서 선택된 POI 상세

## 언제 쓰지 않나 (Don't use when)

- 데스크톱 우선 UI → Dialog
- 긴 폼 → 별도 페이지

## 변형 (Variants)

| ID | Label | Description |
| --- | --- | --- |
| `modal` | Modal Sheet | 배경 scrim 있음, 닫을 때까지 뒤 상호작용 불가 |
| `non-modal` | Non-modal (Peek) | 하단에 피크, 스크롤로 확장. 뒤 상호작용 유지 |
| `action-list` | Action List | 액션 메뉴 (공유, 삭제 등) |

### HTML Snippets

**Modal Sheet**

```html
<div class="sheet sheet-modal">
  <div class="sheet-handle"></div>
  <h4>옵션 선택</h4>
  <ul class="list">
    <li class="list-item">보관함 이동</li>
    <li class="list-item">공유</li>
  </ul>
</div>
```

**Non-modal (Peek)**

```html
<div class="sheet sheet-peek">
  <div class="sheet-handle"></div>
  <div class="sheet-preview"><!-- 카드 프리뷰 --></div>
</div>
```

**Action List**

```html
<div class="sheet"><ul class="action-list"><li>공유</li><li>저장</li><li class="is-danger">삭제</li><li class="is-cancel">취소</li></ul></div>
```

## 상태 (States)

`closed` · `peek` · `half` · `expanded` · `dragging`

## 토큰 (Component Tokens)

| 역할 | CSS 변수 |
| --- | --- |
| bg | `--sm-background-default` |
| handle | `--sm-border-default` |
| scrim | `--sm-background-overlay` |
| radius | `20px (상단만)` |
| elevation | `--elevation-5` |

## 부속 요소 (Sub-parts)

| 클래스 | 역할 |
| --- | --- |
| `sheet-handle` | 상단 드래그 핸들 (4px 높이, border-radius:full) |
| `sheet-preview` | 피크 모드의 미리보기 영역 |

## 접근성 (Accessibility)

- **Role**: dialog
- **Keyboard**: `Esc (닫기)` · `Arrow Up/Down (드래그 대체)`
- **ARIA notes**:
  - modal: aria-modal=true + 포커스 트랩
  - non-modal: role=region 고려
  - 드래그 핸들에 aria-label="크기 조절"

## UX Writing 규칙

- 제목은 명사구
- 취소는 맨 아래 (모바일 iOS 패턴)

## 사용 데모

`demo-map`

수정 시 `window.demoMatrix.byComponent['sheet']` 로 영향 데모 전수 조회 가능.

---

**See also**: [index.html#sheet](../index.html#sheet) · [bottom-sheet.schema.json](bottom-sheet.schema.json) · [AGENTS.md](../AGENTS.md)