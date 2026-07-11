---
title: Motion
section: foundation
version: 0.3.0
tokens:
  - ../tokens/motion.json
sourceHtml: UIUX-DH-design-system.html#L4288-L4333
---

# Motion

duration과 easing은 장식이 아니라 **언어**입니다. 각 토큰은 '어떤 상황에 써야 하는가'라는 역할로 정의됩니다.

## Duration

| Token | ms | 사용 |
| --- | --- | --- |
| `--motion-instant` | 0 | 즉시, 피드백 없이 |
| `--motion-fast` | 120 | 버튼 hover · 포커스 링 (의식하지 못하는 즉각 반응) |
| **`--motion-base`** | **200** | **기본값** · 모달 오픈 · 토스트 등장 · 상태 전환 |
| `--motion-slow` | 320 | 페이지 전환 · 바텀시트 · 큰 요소 이동 |
| `--motion-slower` | 480 | 특수 목적. 이보다 느리면 답답해집니다. |

## Easing

| Token | Bezier | 사용 |
| --- | --- | --- |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | **대부분의 UI 전환. 이것이 기본값.** |
| `--ease-emphasized` | `cubic-bezier(0.3, 0, 0, 1)` | 중요한 등장 — 바텀시트, 성공 메시지 |
| `--ease-decelerate` | `cubic-bezier(0, 0, 0, 1)` | 요소 등장 전용. 빠르게 시작해 부드럽게 도착. |
| `--ease-accelerate` | `cubic-bezier(0.3, 0, 1, 1)` | 요소 퇴장 전용. 천천히 시작해 빠르게 사라짐. |

정본: [tokens/motion.json](../tokens/motion.json)

## 원칙

모션은 장식이 아니라 **피드백**입니다. 상태 변화·진입/이탈·성공 같은 순간에만 사용합니다. 짧고, 부드럽고, 예측 가능하게.

자세한 근거: [docs/01-principles.md#principle-05--모션은-의미다](../docs/01-principles.md#principle-05--모션은-의미다).

## 금지

- 자동 재생 장식 애니메이션
- 방향 없는 회전·진동
- 의미 없는 bounce·elastic curve (표준 4종 외)
- 500ms를 넘는 UI 피드백
