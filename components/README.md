# Components

UIUX-DH 컴포넌트 25종. 모두 [토큰](../tokens/)을 참조하며, Light/Dark 테마를 횡단합니다.

> **v0.5.0부터**: 각 컴포넌트는 `<id>.schema.json`(JSON canonical — AI 기계 판독용) + `<id>.md`(사람용 서술) 둘 다 제공합니다. 구조화 데이터(variants, tokens, html snippet)는 JSON이 정본, 긴 서술(UX Writing, 원칙 설명)은 MD가 맡습니다. AI는 항상 `.schema.json`부터 읽도록 합니다 → [AGENTS.md](../AGENTS.md).

## 카테고리별 인덱스

### Part 4 · Components (v0.2.0~)

| 컴포넌트 | 파일 | 요약 |
| --- | --- | --- |
| Asset & Icon | [asset-icon.md](asset-icon.md) | 24px · 1.5px stroke · round cap |
| Badge | [badge.md](badge.md) | 상태·카테고리·숫자 알림 |
| Bar Chart | [bar-chart.md](bar-chart.md) | vertical / horizontal / stacked |
| Border & Divider | [border-divider.md](border-divider.md) | 4강도 경계, 3패턴 구분선 |
| Button | [button.md](button.md) | 7변형 · 5크기 · pill/icon/fab |
| Chip | [chip.md](chip.md) | 필터·카테고리·태그 |
| Text Field | [text-field.md](text-field.md) | default/affix/amount/search |
| Avatar | [avatar.md](avatar.md) | 5크기 · 상태링 · 스택 |
| Checkbox · Radio · Toggle | [checkbox-radio-toggle.md](checkbox-radio-toggle.md) | 선택·토글 컨트롤 |
| List Item | [list-item.md](list-item.md) | 리딩·본문·트레일 3단 |
| Alert · Toast | [alert-toast.md](alert-toast.md) | 머무는 알림 vs 잠시 나타나는 알림 |
| Progress · Slider | [progress-slider.md](progress-slider.md) | Bar / Segment / Slider |
| Tabs · Segment | [tabs-segment.md](tabs-segment.md) | 콘텐츠 전환 vs 뷰 전환 |
| Card | [card.md](card.md) | 모든 것을 담는 그릇 |
| Banner | [banner.md](banner.md) | 이미지+텍스트 프로모션 (두-색 그라데이션 금지) |

### Part 5 · Overlays & Navigation (v0.3.0~)

| 컴포넌트 | 파일 | 요약 |
| --- | --- | --- |
| Dialog | [dialog.md](dialog.md) | 선택을 강제로 멈추게 함 |
| Bottom Sheet | [bottom-sheet.md](bottom-sheet.md) | 모바일 친화 오버레이 |
| Popover · Tooltip | [popover-tooltip.md](popover-tooltip.md) | 설명 vs 상호작용 |
| Top App Bar | [top-app-bar.md](top-app-bar.md) | 화면 제목·주요 액션 |
| Tab Bar | [tab-bar.md](tab-bar.md) | 앱 전체 최상위 이동 |
| Drawer · Breadcrumb | [drawer-breadcrumb.md](drawer-breadcrumb.md) | 측면 패널 + 경로 |

### Part 6 · States (v0.3.0~)

| 컴포넌트 | 파일 | 요약 |
| --- | --- | --- |
| Skeleton Loader | [skeleton-loader.md](skeleton-loader.md) | 곧 채워질 그림자 |
| Empty State | [empty-state.md](empty-state.md) | 비어 있음도 초대 |

### Part 7 · Density (v0.3.0~)

| 컴포넌트 | 파일 | 요약 |
| --- | --- | --- |
| Data Table | [data-table.md](data-table.md) | 비교 가능한 정렬표 |
| Accordion · Tree | [accordion-tree.md](accordion-tree.md) | 접어두기·계층 |

## 문서 템플릿

모든 컴포넌트 문서는 동일한 구조를 따릅니다:

1. 프론트매터 (title, version, sourceHtml)
2. 한 줄 요약
3. 언제 사용하는가 (Use when)
4. 언제 쓰지 않는가 (Don't use when)
5. 변형 (Variants)
6. 상태 (States)
7. 토큰 (Component Tokens)
8. 접근성 (Accessibility)
9. UX Writing 규칙 (있는 경우)
10. 원본 HTML 참조 (줄 번호)

이 순서는 [../CLAUDE.md#컴포넌트-문서-템플릿](../CLAUDE.md)에 명시되어 있습니다.
