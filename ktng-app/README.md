# KT&G 홈페이지 클론 (Next.js + React)

KT&G 공식 사이트와 **동일한 기술 스택**(Next.js + React)으로 빌드한 디자인 레퍼런스 프로젝트.

## 기술 스택

- **Next.js 14** (KT&G 라이브 사이트도 `_next/static/chunks` 경로로 Next.js 사용 확인됨)
- **React 18**
- **Pretendard** 폰트
- 실제 KT&G CDN 자산 (이미지/비디오) 직접 사용

## 구조

```
ktng-app/
├── pages/
│   └── index.jsx                ← 메인 페이지 (6 섹션)
├── components/
│   ├── Hero.jsx                 ← .kv (풀폭 비디오 + Beyond Limits)
│   ├── Global.jsx               ← .global (5 viewport sticky-sequence + 지구 zoom-in)
│   ├── Sustainability.jsx       ← .sustainability (4 잎사귀 sway)
│   ├── Invest.jsx               ← .invest (Invest Relations 5장 카드)
│   ├── News.jsx                 ← .news (Latest News + fade-in)
│   └── With.jsx                 ← .with (주요 핵심사업 + 세계지도 + Footer)
└── styles/
    └── globals.css              ← 디자인 토큰 + Pretendard
```

## 빌드

```bash
cd ktng-app
npm install
npm run build       # 정적 빌드
npm run export      # ../public/ktng-preview/ 로 출력
```

빌드 결과는 `web_design_system/public/ktng-preview/` 에 위치하며, 보고서의 [프리뷰] 버튼이 모달로 띄움.

## 디자이너 사용 가이드

1. `components/{Name}.jsx` 가 KT&G 사이트의 한 섹션 1:1 복제
2. 클래스명은 KT&G 라이브 클래스명 그대로 사용 (`.kv`, `.global`, `.invest` 등)
3. 디자이너는 컴포넌트 JSX + globals.css를 그대로 복사해 자기 Next.js 프로젝트에 붙여넣기 가능

## 라이브 데이터 채집 출처

- 메인 페이지 sH 11,708
- `_next/static/chunks/...` (Next.js 확인)
- BEM 클래스 (`introduction__overview`, `portfolio-card`, `class-item__class` 등)
- Pretendard 단일 폰트 + 11단계 BEM 타입스케일
- 디자인 토큰: `globals.css` 참조
