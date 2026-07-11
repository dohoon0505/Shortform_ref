# Tokens

기계 판독용 JSON 토큰 정의. 원본 HTML의 `:root { ... }` 블록과 1:1로 매칭됩니다.

## 파일

| 파일 | Tier | 목적 |
| --- | --- | --- |
| [primitives.json](primitives.json) | 1 | 원시 팔레트 · Neutral / Indigo / Amber / Green / Red / Blue |
| [semantic.light.json](semantic.light.json) | 2 | Light 테마의 시맨틱 → 원시 매핑 |
| [semantic.dark.json](semantic.dark.json) | 2 | Dark 테마의 시맨틱 → 원시 매핑 (같은 이름, 다른 값) |
| [typography.json](typography.json) | — | 폰트 패밀리 + 14단 스케일 |
| [sizing.json](sizing.json) | — | 4px 기반 스페이싱 (50~1200) |
| [radius.json](radius.json) | — | 8단 모서리 반경 |
| [elevation.json](elevation.json) | — | 5단 그림자 (Light/Dark 별도) |
| [motion.json](motion.json) | — | duration + easing |
| [z-index.json](z-index.json) | — | 레이어 순서 |

## 포맷 규약

모든 토큰 엔트리는 다음 키를 가집니다:

- `css`: CSS 커스텀 프로퍼티 이름 (예: `--p-indigo-500`)
- `value`: 실제 값 (Hex, px, ms 등)
- `ref` (semantic): 이 토큰이 참조하는 primitive의 CSS 이름
- `use` (선택): 주요 사용처 한 줄 설명

## 테마 전환

```html
<!-- Light (default) -->
<body>...</body>

<!-- Dark -->
<body data-theme="dark">...</body>
```

`[data-theme="dark"]`에서 **오직 semantic 토큰의 참조만** 바뀝니다. primitive 스케일, typography, sizing, radius, motion 은 동일합니다. elevation 만 Light/Dark 서로 다른 그림자를 갖습니다.

## Component Tokens (Tier 3)

컴포넌트 토큰은 개별 컴포넌트 문서 ([../components/](../components/))의 `## 토큰` 섹션에 정의됩니다. 예:

```
--cm-button-primary-bg       → var(--sm-interactive-brand-default)
--cm-button-primary-bg-hover → var(--sm-interactive-brand-hover)
--cm-button-primary-content  → var(--sm-content-onBrand)
```
