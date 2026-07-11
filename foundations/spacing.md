---
title: Spacing · Size Scale
section: foundation
version: 0.3.0
tokens:
  - ../tokens/sizing.json
sourceHtml: UIUX-DH-design-system.html#L4222-L4249
---

# Spacing & Size

4px 베이스 그리드. 토큰 이름은 값이 아닌 **스케일(50~1200)**로 지정합니다. 값이 바뀌어도 이름은 유지됩니다.

## 스케일

| Token | px | 자주 쓰이는 용도 |
| --- | --- | --- |
| `--size-50` | 2 | 미세 조정·아이콘 간격 |
| `--size-100` | 4 | 아이콘–텍스트 gap |
| `--size-150` | 6 | 칩 내부 gap |
| `--size-200` | 8 | 버튼 수평 패딩 최소 |
| `--size-300` | 12 | 기본 gap |
| `--size-400` | 16 | 카드 내부 패딩 |
| `--size-500` | 20 | 섹션 간 여백 |
| `--size-600` | 24 | 큰 gap |
| `--size-700` | 32 | 페이지 좌우 여백 |
| `--size-800` | 40 | 섹션 수직 여백 |
| `--size-900` | 48 | 큰 섹션 여백 |
| `--size-1000` | 64 | 페이지 상하 간격 |
| `--size-1100` | 80 | 히어로 여백 |
| `--size-1200` | 96 | 최상위 여백 |

정본: [tokens/sizing.json](../tokens/sizing.json)

## 왜 이름에 px을 넣지 않는가

`spacing-16`은 값이 바뀌면 거짓말이 됩니다. `size-400`은 **상대 위치**를 말합니다 — 400보다 300이 작고 500이 크다는 관계만 약속합니다.

## 접근성 보장

- **터치 영역 최소 44×44px.** 버튼의 패딩을 조정해 이 크기를 확보합니다.
- 텍스트와 라벨 사이 간격은 `size-200`(8px) 이상을 권장합니다.
