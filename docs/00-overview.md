---
title: 디자인시스템이란 무엇인가
section: overview
version: 0.3.0
sourceHtml: UIUX-DH-design-system.html#L3807-L3846
---

# 00 · 디자인시스템이란 무엇인가

UIUX-DH는 컴포넌트 묶음 이상입니다. 디자이너가 그린 도면, 개발자가 짠 코드, PM이 합의한 정책, 팀이 함께 지키는 운영 프로세스 — 이 네 가지가 하나로 돌아가는 생산 체계입니다.

## 네 가지 구성요소

| # | 레이어 | 한글 | 무엇 |
| --- | --- | --- | --- |
| 01 | Rules & Policies | 규칙 | 토큰 정의, 상태 규칙, 예외 처리 기준. "색은 Hex가 아니라 용도로 부른다" 같은 선언이 여기에 속합니다. |
| 02 | Component Library | 컴포넌트 | 재사용 가능한 UI 단위. 디자인 토큰을 소비하고, 정책을 구현합니다. 이름은 모든 팀이 하나로 부릅니다. |
| 03 | Design ↔ Code | 연동 | Figma의 토큰과 코드의 토큰이 같은 이름으로 살아있어야 합니다. 수동 PR이 아닌 자동 동기화가 지향점입니다. |
| 04 | Release & Governance | 운영 | 버전, 검증, 피드백 루프. 시스템은 만드는 것이 아니라 굴리는 것입니다. Semantic Versioning, Changelog, Deprecation 절차를 따릅니다. |

## Single Source of Truth

이 저장소가 곧 단일 진실의 출처입니다. 모든 Figma 라이브러리, 코드 패키지, 운영 문서는 여기 정의를 기준으로 동기화됩니다.

- 원본 쇼케이스: [UIUX-DH-design-system.html](../UIUX-DH-design-system.html)
- 원칙: [01-principles.md](01-principles.md)
- 토큰 구조: [02-token-architecture.md](02-token-architecture.md)
- 변경 이력: [../CHANGELOG.md](../CHANGELOG.md)
