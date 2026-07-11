---
title: 그라데이션 정책
section: policy
version: 0.3.0
updated: 2026-04-22
sourceHtml: UIUX-DH-design-system.html#L4456-L4531
---

# 04 · 그라데이션 정책

v0.2에서 쓰인 두-색 그라데이션은 `tacky`했습니다. 확신 없는 톤 변화는 색의 의미를 흐리고, 브랜드의 일관성을 깎아먹습니다.

**v0.3부터 솔리드가 기본입니다.**

## Before · After

### 금지 (v0.2 이전의 실수)

두 색의 중간 지점이 탁해지고, 방향(135°)이 모든 요소에 기계적으로 적용되면서 개성 없는 인공적 톤이 됩니다. 색의 의미도 사라집니다 — 왜 보라에서 인디고로 변하는가?

### 권장 (v0.3 이후)

각 색이 하나의 의미를 가집니다. 인디고는 브랜드, 초록은 성공, 호박은 강조, 빨강은 경고. 사용자가 색을 **기호로 학습**할 수 있습니다.

## 그라데이션이 허용되는 경우

그라데이션이 완전히 금지된 것은 아닙니다. **목적이 분명할 때만, 의도적으로** 씁니다.

### 1. Progress · 값의 변화를 나타냄

같은 색상군 안에서 명도만 변화. 의도가 명확합니다.

```css
/* 예: Progress Bar */
background: linear-gradient(90deg, var(--p-indigo-500), var(--p-indigo-300));
```

### 2. Brand Moment · 한 번뿐인 순간

축하·성취의 특수 순간 한정. 결제 완료, 레벨업, 프리미엄 가입 등.

```css
/* 예: 프리미엄 가입 완료 카드 */
background: linear-gradient(135deg, #4F46E5, #DB2777, #EAB700);
```

## 두 가지 질문

그라데이션을 쓰려면 반드시 답해야 합니다:

1. **왜 두 색이 필요한가?** — 설명할 수 있어야 합니다.
2. **이 상황이 반복되지 않는가?** — 반복되면 토큰으로 추상화합니다.

둘 다 "예"가 아니면 솔리드로 갑니다.

## 관련

- [01-principles.md](01-principles.md) PRINCIPLE 01 (의미로 부른다)
- [../tokens/primitives.json](../tokens/primitives.json) 컬러 스케일
- 변경 이력: [../CHANGELOG.md#v030](../CHANGELOG.md#v030)
