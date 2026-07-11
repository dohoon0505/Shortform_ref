---
title: Border Radius
section: foundation
version: 0.3.0
tokens:
  - ../tokens/radius.json
sourceHtml: UIUX-DH-design-system.html#L4263-L4273
---

# Border Radius

라운드는 **컨테이너의 역할**을 결정합니다. 8단계.

| Token | px | 대표 사용처 |
| --- | --- | --- |
| `--radius-none` | 0 | 전체 화면·엣지투엣지 |
| `--radius-xs` | 4 | 태그, 작은 뱃지 |
| `--radius-sm` | 6 | 인라인 요소 |
| `--radius-md` | 10 | 버튼, 입력 |
| `--radius-lg` | 14 | 카드 기본 |
| `--radius-xl` | 20 | 피처 카드 |
| `--radius-2xl` | 28 | 바텀시트, 모달 |
| `--radius-full` | 9999 | 칩, 필, 아바타 |

정본: [tokens/radius.json](../tokens/radius.json)

## 결정 가이드

- **인터랙션 가능한 요소**(버튼·입력)는 `md` 또는 `lg`.
- **정보 컨테이너**(카드)는 `lg` 또는 `xl`.
- **화면을 덮는 표면**(바텀시트·모달 상단)은 `2xl`.
- **원형**이 명확해야 하면 `full` — 아바타·칩·토글.

## 동일 컨텍스트 내 일관성

한 카드 안에서 서로 다른 radius를 섞으면 계층이 흐려집니다. 바깥이 `lg`이면 내부 요소는 `md` 이하.
