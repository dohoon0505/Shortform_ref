---
title: Color System
section: foundation
version: 0.3.0
tokens:
  - ../tokens/primitives.json
  - ../tokens/semantic.light.json
  - ../tokens/semantic.dark.json
sourceHtml: UIUX-DH-design-system.html#L3973-L4148
---

# Color System

UIUX-DH의 다크 모드는 순수 검정이 아닌 **'쿨톤 블랙'**입니다. 브랜드 인디고의 잔향을 미세하게 담아 중립적이되 체온이 있는 표면을 만듭니다.

## 팔레트 개요

| 스케일 | 목적 | 파일 |
| --- | --- | --- |
| Neutral (11 stops) | 모든 배경·텍스트·경계의 기반 | [tokens/primitives.json#neutral](../tokens/primitives.json) |
| Indigo (10 stops) | 브랜드 프라이머리. 500이 시그니처. | [tokens/primitives.json#indigo](../tokens/primitives.json) |
| Amber (4 stops) | Signal / Accent. 제한적 사용. | [tokens/primitives.json#amber](../tokens/primitives.json) |
| Green / Red / Blue | Success / Error / Info | [tokens/primitives.json](../tokens/primitives.json) |

## Semantic Mapping — Light vs Dark

같은 토큰 이름이 Light와 Dark에서 **어떤 원시값으로 연결되는지**가 테마 시스템의 핵심입니다.

| Semantic Token | Light | Dark |
| --- | --- | --- |
| `--sm-background-default` | `neutral-0` · #FFFFFF | `neutral-100` · #0B0D12 |
| `--sm-background-subtle` | `neutral-10` | `neutral-95` |
| `--sm-background-muted` | `neutral-20` | `neutral-90` |
| `--sm-content-primary` | `neutral-100` | `neutral-0` |
| `--sm-content-secondary` | `neutral-70` | `neutral-40` |
| `--sm-content-tertiary` | `neutral-60` | `neutral-50` |
| `--sm-border-subtle` | `neutral-30` | `neutral-85` |
| `--sm-border-default` | `neutral-40` | `neutral-80` |
| `--sm-border-strong` | `neutral-80` | `neutral-40` |
| `--sm-interactive-brand-default` | `indigo-500` | `indigo-400` |
| `--sm-interactive-brand-hover` | `indigo-600` | `indigo-300` |
| `--sm-content-brand` | `indigo-500` | `indigo-300` |

## Status 컬러

사용자에게 **상태를 전달**하는 컬러. 브랜드 컬러와 혼용하지 않습니다.

| Token | 용도 | Light | Dark |
| --- | --- | --- | --- |
| `--sm-status-success` | 완료, 저장 성공, 긍정 상태 | `green-500` | `green-400` |
| `--sm-status-warning` | 주의, 확인 필요, 비파괴적 경고 | `amber-500` | `amber-400` |
| `--sm-status-error` | 에러, 실패, 파괴적 액션 | `red-500` | `red-400` |
| `--sm-status-info` | 정보, 팁, 중립적 알림 | `blue-500` | `blue-400` |
| `--sm-signal-highlight` | 한정적 강조 (뱃지, 신규 표시) | `amber-400` | `amber-400` |

## 접근성

- 모든 semantic 페어(content on background)는 WCAG 2.2 AA (텍스트 4.5:1, UI 요소 3:1)를 만족해야 합니다.
- 새 토큰 추가 시 대비를 검증하지 않으면 **[PRINCIPLE 06](../docs/01-principles.md#principle-06--접근성은-기본값이다)** 위반입니다.

## 함께 보기

- [../docs/04-gradient-policy.md](../docs/04-gradient-policy.md) — 언제 그라데이션을 쓰는가
- [../docs/02-token-architecture.md](../docs/02-token-architecture.md) — 3-tier 구조
