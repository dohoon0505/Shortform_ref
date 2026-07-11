---
component: Accordion · Tree
canonical: "accordion-tree.schema.json"
category: Components
version: 0.3.0
sourceHtml: "index.html#accordion"
generated: true
---

# Accordion · Tree

> Accordion은 FAQ·폼 섹션의 접힘(단일 레벨), Tree는 계층 구조(중첩 레벨).

> ⚙️ 이 문서는 [`accordion-tree.schema.json`](accordion-tree.schema.json) 에서 자동 생성됐습니다. 내용 수정은 JSON에서, MD 재생성은 `node scripts/gen-docs.mjs accordion`.

## 언제 사용하나 (Use when)

- Accordion: FAQ, 긴 폼의 섹션 접기, 설정 그룹
- Tree: 파일 브라우저, 조직도, 카테고리 네비

## 언제 쓰지 않나 (Don't use when)

- 탭 전환 성격 → Tabs
- 2-3 항목 → 단순 섹션 헤더
- 계층 없는 리스트 → List Item

## 변형 (Variants)

| ID | Label | Description |
| --- | --- | --- |
| `accordion-single` | Accordion · Single open | 한 번에 하나만 펼침 |
| `accordion-multi` | Accordion · Multi open | 여러 항목 동시에 펼침 가능 |
| `tree` | Tree | 파일·폴더 구조. 들여쓰기로 계층 표현 |

### HTML Snippets

**Accordion · Single open**

```html
<div class="accordion" data-mode="single">
  <div class="acc-item">
    <button class="acc-trigger" aria-expanded="true">배송 정책<svg class="ico ico-sm"><use href="#i-chevron-down"/></svg></button>
    <div class="acc-panel">본문…</div>
  </div>
</div>
```

**Accordion · Multi open**

```html
<div class="accordion" data-mode="multi">...</div>
```

**Tree**

```html
<ul class="tree">
  <li><button class="tree-node" aria-expanded="true">components/</button>
    <ul>
      <li><button class="tree-leaf">button.md</button></li>
      <li><button class="tree-leaf">banner.md</button></li>
    </ul>
  </li>
</ul>
```

## 상태 (States)

`collapsed` · `expanded` · `focus`

## 토큰 (Component Tokens)

| 역할 | CSS 변수 |
| --- | --- |
| triggerBg | `--sm-background-default` |
| triggerFg | `--sm-content-primary` |
| panelBg | `--sm-background-subtle` |
| border | `--sm-border-subtle` |
| chevronTransform | `rotate(180deg) when expanded` |

## 접근성 (Accessibility)

- **Keyboard**: `Enter/Space (토글)` · `Arrow Down/Up (항목 이동)` · `Home/End`
- **ARIA notes**:
  - 트리거: aria-expanded + aria-controls=panelId
  - 패널: role=region + aria-labelledby=triggerId
  - Tree: role=tree + treeitem, aria-level, aria-expanded

## UX Writing 규칙

- Accordion 트리거: 질문 또는 섹션 제목 (배송 정책, 환불 정책)
- Tree 노드: 파일·폴더명 그대로

---

**See also**: [index.html#accordion](../index.html#accordion) · [accordion-tree.schema.json](accordion-tree.schema.json) · [AGENTS.md](../AGENTS.md)