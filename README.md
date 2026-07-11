# UIUX-DH · Unified Design System

> 토큰부터 문장까지. 모바일 중심의 통합 디자인시스템.
> **현재 버전 v0.5.0** · 최초 릴리스 2026.04.21 · 최근 업데이트 2026.04.22

---

## 🎯 이 디자인시스템의 특별한 점

v0.5.0부터 **사람과 AI 모두에게 1급 시민**인 디자인시스템입니다. Toss의 *"디자인시스템은 제품, 팀은 고객"* 철학을 **"AI도 고객"**으로 확장했습니다.

| 대상 | 진입점 | 특징 |
| --- | --- | --- |
| 🧑 사람 | `index.html` | 브라우저에서 열면 바로 25 컴포넌트 + 18 데모 전체 사이트 |
| 🤖 AI 에이전트 | [`AGENTS.md`](AGENTS.md) + [`system.json`](system.json) | **1–2 파일 read**로 모든 쿼리 해결 |
| 🛠 기여자 | [`CLAUDE.md`](CLAUDE.md) | 3단계 작업 원칙 · 수정 워크플로 |

---

## ⚡ 빠른 시작

### 사람 · 디자이너 · 사이트 보기
```bash
open index.html          # macOS
start index.html         # Windows
```
외부 서버 불필요. 이 한 파일이 전체 사이트.

### AI 에이전트 · 쿼리
```
첫 read:  AGENTS.md              # "어디서 뭘 찾나" 결정 트리
두 번째:  system.json             # 루트 매니페스트 (25 컴포넌트 · 18 데모 · 토큰)
세 번째:  components/<id>.schema.json  # 해당 컴포넌트 사양
```

### 기여자 · 수정
```bash
node scripts/validate.mjs   # 커밋 전 무결성 검증 (JSON · 토큰 · 데모 일치)
```

---

## 📂 폴더 구조

```
desgin_system/
│
├── 🔸 index.html                        ← 운영 진본 (사람이 브라우저로 여는 사이트)
├── 🔸 assets/
│   ├── css/main.css                     ← 전체 스타일
│   └── js/main.js                       ← buildDemoMatrix() 스캐너 포함
│
├── ⭐ system.json                       ← AI 루트 매니페스트
├── ⭐ AGENTS.md                         ← AI 에이전트 결정 트리
│
├── schemas/                             ← JSON 메타 스키마
│   ├── component.schema.json
│   ├── token.schema.json
│   ├── demo.schema.json
│   └── snippet.schema.json
│
├── components/                          ← 25개 컴포넌트
│   ├── <id>.schema.json                 ⭐ JSON canonical (기계 판독)
│   ├── <id>.md                          (보조 서술 · 사람 가독)
│   └── README.md
│
├── tokens/                              ← 토큰 정의 (값의 정본)
│   ├── primitives.json                  · Tier 1 · 원시 팔레트
│   ├── semantic.light.json              · Tier 2 · Light 매핑
│   ├── semantic.dark.json               · Tier 2 · Dark 매핑
│   ├── theme-map.json                   ⭐ Light/Dark pair 집약 (AI 1-read)
│   ├── typography.json / sizing.json / radius.json / elevation.json / motion.json / z-index.json
│
├── snippets/
│   └── patterns.json                    ⭐ 자주 쓰는 조합 10종
│
├── scripts/
│   └── validate.mjs                     ⭐ 무결성 검증 (Node, 외부 의존성 없음)
│
├── docs/                                ← 개념·정책 (긴 서술)
│   ├── 00-overview.md / 01-principles.md / 02-token-architecture.md
│   ├── 03-naming-conventions.md / 04-gradient-policy.md / 05-ux-writing.md
│
├── foundations/                         ← 시각 기초 가이드
│   └── color.md / typography.md / spacing.md / radius.md / elevation.md / motion.md
│
├── CLAUDE.md                            ← 🤖 기여 워크플로 (3단계 작업 원칙)
├── CHANGELOG.md                         ← 버전 이력 (Semantic Versioning)
└── README.md                            ← 이 파일
```

⭐ = v0.5.0 신규 AI API 레이어

---

## 🎨 범위

| 카테고리 | 내용 | 수 |
| --- | --- | --- |
| Foundations | Color · Typography · Sizing · Radius · Elevation · Motion | 6 |
| Policy | 그라데이션 정책 (v0.3부터 두-색 금지) | 1 |
| UX Writing | 7원칙 + 컴포넌트별 규칙 + 에러 메시지 템플릿 | 1 |
| Components | Button / Badge / Banner / Card / ... | **25** |
| 실제 사용 데모 | Login / Banking / Map / Chat / Checkout / ... | **18** |
| 스니펫 패턴 | login-form / pricing-card / toast-success / ... | **10** |

토큰:
- **34개 원시** (neutral, indigo, amber, green, red, blue)
- **29개 시맨틱** (Light/Dark 각각, 토큰 이름 동일)
- **컴포넌트 토큰** (각 컴포넌트별 예외 흡수층)

---

## 🏛 아키텍처 원칙 (요약)

1. **의미가 값보다 먼저** — `--sm-interactive-brand-default`가 `#4F46E5`보다 앞
2. **같은 이름·다른 값** — Light/Dark는 같은 시맨틱 이름, 다른 원시값 참조
3. **축약어 금지** — `btn`/`nav` 대신 `button`/`navigation` (CTA/URL/SVG/FAQ 등 업계 관례만 허용)
4. **두-색 그라데이션 금지** (v0.3+) — 솔리드가 기본, 브랜드 모멘트·진행률 등 목적이 분명할 때만 예외
5. **JSON canonical · MD 보조** (v0.5+) — 구조화 데이터는 JSON, 긴 서술은 MD
6. **누적되는 기록** — 변경은 기록, 과거는 지우지 않음 (CHANGELOG 누적)

---

## 🔍 자주 하는 질문

| 질문 | 답 |
| --- | --- |
| 브랜드 기본 색? | `--sm-interactive-brand-default` → `tokens/theme-map.json`에서 Light/Dark 값 |
| Banner 사용법? | `components/banner.schema.json.variants[].html` 직접 복사 |
| 어떤 데모가 Button 쓰나? | `components/button.schema.json.usedInDemos` 또는 `window.demoMatrix.byComponent['button']` |
| 새 컴포넌트 추가 방법? | [CLAUDE.md](CLAUDE.md) "컴포넌트 추가·수정 워크플로" |
| 토큰 값을 바꾸고 싶다 | [CLAUDE.md](CLAUDE.md) "토큰 수정" 단계 참고 (영향 데모 체크 필수) |

---

## 🤝 기여

1. `git pull origin main`
2. 변경 전 `node scripts/validate.mjs` 실행 (현재 상태 확인)
3. [CLAUDE.md](CLAUDE.md) 의 3단계 작업 원칙 준수:
   - ① 운영 진본 (`index.html` + CSS + JS)
   - ② JSON 스키마 (`system.json` + `components/*.schema.json` + `tokens/theme-map.json`)
   - ③ 서술 문서 (`CHANGELOG.md` 엔트리 · `.md` 파일)
4. 수정 후 `node scripts/validate.mjs` 재실행 — **0 error**여야 함
5. 논리별 커밋 · 상세한 한국어 메시지

---

## 📜 라이선스 · 기록

- 최초 릴리스: 2026.04.21 (v0.1.0)
- 운영 관리: **/DH** · 2026 ©
- 버전 체계: [Semantic Versioning](https://semver.org/lang/ko/)
- 변경 이력: [CHANGELOG.md](CHANGELOG.md)
- Toss 철학 참고: [Rethinking Design System](https://toss.tech/article/rethinking-design-system)
