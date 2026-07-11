---
title: Elevation
section: foundation
version: 0.3.0
tokens:
  - ../tokens/elevation.json
sourceHtml: UIUX-DH-design-system.html#L4275-L4284
---

# Elevation

Elevation 0부터 4까지의 다섯 단계가 **상호작용의 계층**을 구분합니다. 같은 이름으로 Light와 Dark가 서로 다른 강도의 그림자를 갖습니다 — 다크에서 더 진하고 검게.

## 레벨

| Level | Token | 사용 | Light | Dark |
| --- | --- | --- | --- | --- |
| 0 | `--elevation-0` | 같은 평면 | `none` | `none` |
| 1 | `--elevation-1` | 정적 카드 | 얕은 그림자 | 약간 진함 |
| 2 | `--elevation-2` | hover 상태 | 1보다 깊음 | 1보다 진함 |
| 3 | `--elevation-3` | 드롭다운·팝오버 | 떠 있는 느낌 | 명확한 분리 |
| 4 | `--elevation-4` | 모달·시트 | 가장 뚜렷 | 가장 진함 |

정본: [tokens/elevation.json](../tokens/elevation.json) (raw box-shadow 값 포함)

## 계층 규칙

- 같은 평면(0)의 요소는 **border로만** 경계를 구분합니다. 그림자 없이.
- hover는 elevation을 **+1** 올리는 방식으로 피드백합니다 (0→1 또는 1→2).
- **모달 뒤의 스크림** 위에만 `elevation-4`. 남용하면 계층이 무의미해집니다.

## 다크 모드에서 주의

어두운 배경에서 옅은 그림자는 보이지 않습니다. 다크 전용 값을 쓰는 이유입니다. 수동으로 `box-shadow` 를 작성하지 말고 항상 토큰을 씁니다.
