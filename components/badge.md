---
component: Badge
canonical: "badge.schema.json"
category: Components
version: 0.2.0
sourceHtml: "index.html#badge"
generated: true
---

# Badge

> 상태·카테고리·숫자 알림을 짧게 표시하는 작은 라벨.

> ⚙️ 이 문서는 [`badge.schema.json`](badge.schema.json) 에서 자동 생성됐습니다. 내용 수정은 JSON에서, MD 재생성은 `node scripts/gen-docs.mjs badge`.

## 언제 사용하나 (Use when)

- 상태 표시
- 알림 카운트
- 카테고리 태그
- NEW·HOT 강조

## 언제 쓰지 않나 (Don't use when)

- 상호작용 필요 시 Chip 사용
- 긴 텍스트 (2단어 이상)

## 변형 (Variants)

| ID | Label | Description |
| --- | --- | --- |
| `brand` | Brand |  |
| `success` | Success |  |
| `warning` | Warning |  |
| `error` | Error |  |
| `info` | Info |  |
| `neutral` | Neutral |  |
| `solid` | Solid | 솔리드 배경 강조 |
| `count` | Count | 숫자 카운트, 원형 |
| `dot` | Dot | 상태 인디케이터 (텍스트 없음) |

### HTML Snippets

**Brand**

```html
<span class="badge badge-brand">NEW</span>
```

**Success**

```html
<span class="badge badge-success">완료</span>
```

**Warning**

```html
<span class="badge badge-warning">대기</span>
```

**Error**

```html
<span class="badge badge-error">오류</span>
```

**Info**

```html
<span class="badge badge-info">안내</span>
```

**Neutral**

```html
<span class="badge badge-neutral">기본</span>
```

**Solid**

```html
<span class="badge badge-solid">SALE</span>
```

**Count**

```html
<span class="badge badge-count">3</span>
```

**Dot**

```html
<span class="badge badge-dot"></span>
```

## 크기 (Sizes)

| ID | 값 |
| --- | --- |
| `badge-sm` | height: `18`, fontSize: `9` |
| `badge-md` | height: `20`, fontSize: `10` |
| `badge-lg` | height: `24`, fontSize: `11` |

## 상태 (States)

`rest`

## 토큰 (Component Tokens)

| 역할 | CSS 변수 |
| --- | --- |
| bg | `--cm-badge-{variant}-bg` |
| fg | `--cm-badge-{variant}-fg` |
| radius | `--cm-badge-radius` |

## 접근성 (Accessibility)

- **Role**: status (상태 알림) 또는 일반 span
- **ARIA notes**:
  - 동적 카운트 업데이트 시 aria-live=polite 부모 요소 권장
  - dot은 시각 정보만 — 의미 정보는 텍스트로 중복 제공 (예: '새 알림 3개')

## UX Writing 규칙

- 1-3 글자 권장
- 대문자 모노 또는 숫자
- 동적 수치는 tabular-nums

## 사용 데모

`demo-community` · `demo-store` · `demo-todo` · `demo-booking` · `demo-foodorder` · `demo-shopping` · `demo-social` · `demo-banking` · `demo-mypage` · `demo-chat` · `demo-notify`

수정 시 `window.demoMatrix.byComponent['badge']` 로 영향 데모 전수 조회 가능.

---

**See also**: [index.html#badge](../index.html#badge) · [badge.schema.json](badge.schema.json) · [AGENTS.md](../AGENTS.md)