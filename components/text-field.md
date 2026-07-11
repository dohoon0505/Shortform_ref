---
component: Text Field
canonical: "text-field.schema.json"
category: Components
version: 0.2.0
sourceHtml: "index.html#textfield"
generated: true
---

# Text Field

> 텍스트 입력 필드. 레이블은 필드 위, 도움말은 아래, 에러는 즉시.

> ⚙️ 이 문서는 [`text-field.schema.json`](text-field.schema.json) 에서 자동 생성됐습니다. 내용 수정은 JSON에서, MD 재생성은 `node scripts/gen-docs.mjs textfield`.

## 언제 사용하나 (Use when)

- 사용자 입력 수집
- 검색
- 폼

## 언제 쓰지 않나 (Don't use when)

- 선택지가 유한하면 Select/Radio
- 파일 업로드는 별도

## 변형 (Variants)

| ID | Label | Description |
| --- | --- | --- |
| `default` | Default |  |
| `affix` | Affix (prefix/suffix) | 좌·우에 심볼/아이콘 부착 |
| `amount` | Amount | 숫자 입력, 통화 심볼, tabular-nums |
| `search` | Search | 검색 아이콘 내장, 라운드 풀 |
| `textarea` | Textarea | 다행 입력 |

### HTML Snippets

**Default**

```html
<div class="m-field">
  <label>이메일</label>
  <input class="m-input" type="email" placeholder="you@example.com">
</div>
```

**Affix (prefix/suffix)**

```html
<div class="field field-affix"><span class="affix">@</span><input class="input" type="text"></div>
```

**Amount**

```html
<div class="field field-amount"><input class="input" inputmode="numeric" style="font-variant-numeric:tabular-nums;"><span class="affix">원</span></div>
```

**Search**

```html
<div class="field field-search"><svg class="ico ico-sm"><use href="#i-search"/></svg><input class="input" placeholder="검색"></div>
```

**Textarea**

```html
<textarea class="m-input" rows="4"></textarea>
```

## 상태 (States)

`rest` · `hover` · `focus` · `filled` · `disabled` · `error`

## 토큰 (Component Tokens)

| 역할 | CSS 변수 |
| --- | --- |
| bg | `--sm-background-default` |
| border | `--sm-border-default` |
| borderFocus | `--sm-border-focus` |
| borderError | `--sm-status-error` |
| fg | `--sm-content-primary` |
| placeholder | `--sm-content-tertiary` |
| radius | `--radius-md` |

## 접근성 (Accessibility)

- **Role**: textbox (기본)
- **Keyboard**: `Tab` · `Shift+Tab`
- **Min touch target**: 44px
- **Focus ring**: `--sm-border-focus`
- **ARIA notes**:
  - label 연결: <label for="id"> 또는 aria-label
  - 에러 메시지: aria-describedby 연결, aria-invalid=true
  - 필수 필드: required + aria-required=true

## UX Writing 규칙

- Label: 한 단어 또는 짧은 명사구 (이메일, 전화번호)
- Placeholder: 예시 형식 (you@example.com, 010-0000-0000)
- Helper: 제약 조건 (8자 이상, 숫자·특수문자 포함)
- Error: 해결 방법 제시 ("이메일 형식이 아니에요" + 올바른 예시)

## 사용 데모

`demo-login` · `demo-signup` · `demo-store` · `demo-booking` · `demo-foodorder` · `demo-map` · `demo-chat`

수정 시 `window.demoMatrix.byComponent['textfield']` 로 영향 데모 전수 조회 가능.

---

**See also**: [index.html#textfield](../index.html#textfield) · [text-field.schema.json](text-field.schema.json) · [AGENTS.md](../AGENTS.md)