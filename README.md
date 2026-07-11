# Web Reference Lab · 웹 디자인 레퍼런스 연구소

> 실제 운영 중인 웹사이트의 디자인 시스템을 연구원 수준으로 분석합니다.
> **현재 버전 v0.0.0**

---

## 이 프로젝트는

URL을 전달하면 해당 웹사이트를 10가지 관점에서 심층 분석하고, 구조화된 레퍼런스 보고서로 정리하는 카탈로그입니다.

| 대상 | 진입점 | 특징 |
| --- | --- | --- |
| 사람 | `index.html` | 브라우저에서 열면 바로 레퍼런스 카탈로그 |
| AI 에이전트 | [`AGENTS.md`](AGENTS.md) + [`system.json`](system.json) | 1–2 파일 read로 모든 쿼리 해결 |
| 기여자 | [`CLAUDE.md`](CLAUDE.md) | 3계층 작업 원칙 · 수정 워크플로 |

---

## 빠른 시작

```bash
start index.html         # Windows
open index.html          # macOS
```

외부 서버 불필요. 이 한 파일이 전체 사이트.

---

## 10가지 분석 관점

| # | 항목 | 분석 내용 |
|---|------|----------|
| 01 | 개요 | URL, 기술 스택, 전반적인 디자인 방향성과 인상 평가 |
| 02 | 레이아웃 & 그리드 | max-width, 컬럼 구조, 브레이크포인트, 섹션 간격 |
| 03 | 타이포그래피 | 폰트 패밀리, 사이즈 스케일, 행간, 자간, 웨이트 시스템 |
| 04 | 컬러 시스템 | 프라이머리·세컨더리·배경·텍스트·액센트 컬러, 전체 팔레트 |
| 05 | 컴포넌트 | 버튼, 카드, 네비게이션, 폼, 모달 등 UI 요소 |
| 06 | 인터랙션 | hover 효과, 전환 애니메이션, 마이크로 인터랙션 |
| 07 | 스크롤 행동 | 패럴랙스, sticky 요소, 스크롤 기반 애니메이션 |
| 08 | 둥글기 패턴 | border-radius 사용 체계, 요소별 곡률 |
| 09 | 여백 시스템 | margin·padding 패턴, 간격 스케일, 섹션 간 리듬 |
| 10 | 접근성 | 명도 대비, 키보드 내비게이션, ARIA, 포커스 관리 |

---

## 폴더 구조

```
web_design_system/
├── index.html                  ← 운영 진본
├── assets/
│   ├── css/main.css
│   └── js/main.js
│
├── system.json                 ← 루트 매니페스트
├── analyses/                   ← 레퍼런스 분석 데이터
│   └── {id}/analysis.json
│
├── scripts/validate.mjs        ← 무결성 검증
├── AGENTS.md                   ← AI 에이전트 진입점
├── CLAUDE.md                   ← 기여 가이드라인
└── README.md                   ← 이 파일
```

---

## 기여

1. [CLAUDE.md](CLAUDE.md) 의 3계층 작업 원칙 준수
2. 수정 후 `node scripts/validate.mjs` 실행
3. `index.html`을 브라우저에서 열어 라이트/다크 모드 확인

---

## 라이선스

운영 관리: **/DH** · 2026 · MIT
