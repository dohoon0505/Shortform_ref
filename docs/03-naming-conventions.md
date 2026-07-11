---
title: 네이밍 컨벤션
section: naming
version: 0.3.0
sourceHtml: UIUX-DH-design-system.html#L4379-L4441
---

# 03 · 이름은 계약이다

디자이너, 프론트엔드, 앱 개발자가 같은 컴포넌트를 다르게 부르면 시스템은 무너집니다. 이름은 팀 간의 계약입니다. 약어는 **대부분 금지**입니다.

## 권장 vs 금지

| 권장 | 금지 | 이유 |
| --- | --- | --- |
| `Button` | `Btn` | 풀네임 원칙. 코드에서도 풀네임. |
| `Navigation` | `Nav` | 의미가 즉시 파악되어야 합니다. |
| `BottomSheet` | `BSheet` / `BtmSheet` | 두 단어 합성어는 PascalCase. |
| `background-default` | `bg-white` | 색 이름(white)이 아닌 용도(default)로. |
| `content-primary` | `text-dark` | 'dark'는 라이트 모드 기준의 말입니다. |
| `interactive-brand-hover` | `primary-hover` | 'primary'는 브랜드를 뜻하는지 모호. |
| `size-400` | `spacing-16` | 값이 바뀌면 이름이 거짓말이 됩니다. |

## 토큰 prefix 패턴

| Tier | Prefix | 패턴 | 예시 |
| --- | --- | --- | --- |
| 1 · Primitive | `--p-` | `--p-<category>-<scale>` | `--p-indigo-500` |
| 2 · Semantic | `--sm-` | `--sm-<role>-<variant>` | `--sm-background-default` |
| 3 · Component | `--cm-` | `--cm-<component>-<part>-<state>` | `--cm-button-primary-hover` |

## 파일/컴포넌트 네이밍

| 유형 | 케이스 | 예시 |
| --- | --- | --- |
| 문서 파일 | `kebab-case` | `bottom-sheet.md`, `checkbox-radio-toggle.md` |
| 컴포넌트 클래스 | `PascalCase` | `BottomSheet`, `TextField` |
| CSS 클래스/ID | `kebab-case` | `.btn-primary`, `#drawer` |
| JSON 키 | `kebab-case` | `"display-lg"`, `"interactive-brand-hover"` |

## 허용되는 약어

업계 관례로 굳어진 약어만 허용합니다. 새로운 축약어는 만들지 않습니다.

- `CTA`, `URL`, `SVG`, `FAQ`, `API`, `ID`

## 점검 체크리스트

새 토큰·컴포넌트 추가 전에 묻습니다:

1. 이 이름이 값이 아닌 **의미**를 말하는가?
2. Light/Dark 양쪽에서 동일하게 말이 되는가?
3. 팀 간 대화에서 **풀네임**으로 부를 수 있는가?
4. 새 약어를 발명하고 있지는 않은가?
