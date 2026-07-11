# AGENTS.md — AI 에이전트 진입점

> **대상**: LLM·에이전트·자동화 도구. 이 저장소의 웹 레퍼런스 분석 카탈로그를 **읽고 · 찾고 · 생성**할 때 이 문서부터 읽으면 모든 쿼리를 **1–2 파일 read**로 해결할 수 있습니다.
>
> **사람 읽기용**: [CLAUDE.md](CLAUDE.md) · [README.md](README.md)

---

## 핵심 원칙

1. **단일 진입점** — `system.json` (루트)에서 모든 리소스로 분기.
2. **분석 데이터는 JSON canonical** — `analyses/{id}/analysis.json`이 정본.
3. **10가지 분석 관점** — 개요, 레이아웃, 타이포그래피, 컬러, 컴포넌트, 인터랙션, 스크롤, 둥글기, 여백, 접근성.

---

## "I want to... → Read this"

| 목표 | 첫 번째 read | 두 번째 read (필요 시) |
| --- | --- | --- |
| 시스템 전체 파악 | `system.json` | — |
| 등록된 모든 레퍼런스 | `system.json` → `references[]` | — |
| 특정 레퍼런스 분석 결과 | `analyses/{id}/analysis.json` | — |
| 분석 섹션 정의 (10개) | `system.json` → `analysisSections[]` | — |
| 프로젝트 기여 가이드 | `CLAUDE.md` | — |

---

## 새 레퍼런스 분석 추가

1. 분석 대상 URL 확인
2. `analyses/{id}/analysis.json` 작성 (필수 필드: `id`, `title`, `url`, `date`, `sections`)
3. `system.json.references[]` 배열에 엔트리 추가 (`id`, `title`, `url`)
4. `system.json.counts.references` 갱신
5. `node scripts/validate.mjs` 실행

---

## 분석 섹션 구조

각 레퍼런스의 `analysis.json`은 다음 10개 섹션을 포함합니다:

| # | ID | 분석 내용 |
|---|-----|----------|
| 01 | overview | URL, 기술 스택, 전반적 디자인 방향성 |
| 02 | layout | max-width, 컬럼, 브레이크포인트, 간격 |
| 03 | typography | 폰트, 사이즈 스케일, 행간, 자간, 웨이트 |
| 04 | color | 프라이머리·세컨더리·배경·텍스트 컬러, 팔레트 |
| 05 | components | 버튼, 카드, 폼 등 UI 요소 구조와 변형 |
| 06 | interaction | hover, 전환 애니메이션, 마이크로 인터랙션 |
| 07 | scroll | 패럴랙스, sticky, 스크롤 기반 애니메이션 |
| 08 | radius | border-radius 체계, 요소별 곡률 |
| 09 | spacing | margin·padding 패턴, 간격 스케일 |
| 10 | accessibility | 명도 대비, 키보드, ARIA, 포커스 관리 |

---

## 파일 구조

```
web_design_system/
├── system.json                 ← AI 진입점
├── AGENTS.md                   ← (이 문서)
├── CLAUDE.md                   ← 기여 가이드
├── README.md                   ← 프로젝트 소개
│
├── analyses/                   ← 레퍼런스 분석 데이터
│   └── {id}/
│       └── analysis.json       ← JSON canonical
│
├── scripts/
│   └── validate.mjs            ← 무결성 검증
│
├── index.html                  ← 운영 진본 (브라우저용 사이트)
├── assets/css/main.css
└── assets/js/main.js
```

---

## AI가 실수하기 쉬운 것

1. **analysis.json의 id와 폴더명 불일치** — 검증 스크립트가 잡아냄.
2. **system.json에만 등록하고 폴더 미생성** — 검증 스크립트가 잡아냄.
3. **사용자 입력 미이스케이프** — URL, title 등은 반드시 `escapeHtml()` 적용.
4. **외부 링크에 noopener 누락** — `target="_blank" rel="noopener noreferrer"` 필수.
