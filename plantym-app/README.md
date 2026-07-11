# plantym-app — Tier-A Mirror Mode Clone

플랜티엠(https://www.plantym.com/) 메인 페이지의 100% 동일 재현을 위한 별도 Vanilla JS 프로젝트.

## 구조

```
plantym-app/
├── README.md
├── styles/
│   └── globals.css                  :root CSS Variables 6개 + 기본 리셋 + 키프레임
└── (참고) /components/plantym/*.html  보고서 모달용 정적 HTML (별도 폴더)
```

## 디자이너 사용 가이드

### 1. 보고서에서 프리뷰 보기

1. `index.html` (보고서 진입점)에서 `#ref/plantym-com` 진입
2. 각 섹션의 `[프리뷰 열기]` 버튼 클릭
3. 풀스크린 모달에 라이브 정확 px (1080×1905, Orbital 10,800px 등)로 렌더된 컴포넌트 확인

### 2. 자기 프로젝트에 복사

1. `/components/plantym/{section}.html` 의 HTML 그대로 복사
2. `/plantym-app/styles/globals.css` 의 CSS Variables 복사
3. 클래스명 그대로 사용 (`#header`, `.main-visual`, `.main-intro`, `.pin-spacer`, `.list-item` 등 라이브 BEM)

### 3. 라이브 사이트와 1:1 매칭

| 섹션 | 라이브 ID/Class | 실측 px | Tier-A 파일 |
|---|---|---|---|
| Header | `#header.header` | fixed 100px | components/plantym/header.html |
| Hero | `.sec.main-visual` | 1080px (비디오 배경) | components/plantym/hero.html |
| Orbital (시그니처) | `.sec.main-intro .pin-spacer` | **10,800px** (GSAP ScrollTrigger pin) | components/plantym/orbital.html |
| View | `.sec.main-view` | 937px (3 카드) | components/plantym/view.html |
| News | `.sec.main-group.news` | 1,552px (Notice + PR Swiper) | components/plantym/news.html |
| Partners | `.sec.main-partners` | 1,035px (13+ 로고 Marquee) | components/plantym/partners.html |
| Footer | `#footer.footer` | 641px (사이트맵 + Plantynet) | components/plantym/footer.html |

총 페이지 높이: **17,125px** (Orbital 시그니처가 63% 점유)

## 디자인 토큰

`styles/globals.css` 의 `:root` 6개 실측 변수:

```css
--primary-color: #000;
--white-color: #fff;
--secondary-color: #333333;
--accent-color: #fc6d25;       /* 🔥 시그니처 액센트 (오렌지) */
--accent2-color: #fc6d25;
--bg-sub-color: #f7f7f7;
```

## 키 인터랙션

- **🟢 GSAP ScrollTrigger Orbital** (시그니처): `.pin-spacer 10,800px` + `.motion 1080px sticky` 안에서 SVG 점선 원 진행률 + ring.png + 3-panel 텍스트가 스크롤 진행률에 동기화
- **Hero ScrollReveal**: h1 + p 각각 `data-sr-id`로 1.2s cubic-bezier(0.4,0,0.2,1) reveal (0.2s stagger)
- **View 3-Card Alternating**: 1번 +100% / 2번 -100% / 3번 +100% Y translate ScrollReveal
- **Partners Marquee**: 2개 행 좌/우 다른 방향 `rolling 20s linear infinite`
- **News Swiper**: Notice + PR 양쪽 Swiper.js (progress bar + prev/next)
- **btn-top FAB**: 우하단 fixed scroll-to-top 버튼

## 빌드 (Vanilla 정적 파일)

별도 빌드 명령 없음. 각 HTML 파일을 브라우저로 직접 열거나 `pwsh ../scripts/serve.ps1`으로 로컬 서버에 띄움.

## 사용 폰트

- **Pretendard Variable** (한글/영문 통합) — CDN: `cdn.jsdelivr.net/gh/orioncactus/pretendard`

## 라이브 정확한 px 사용 원칙

모든 height는 `100vh` 사용 금지. 라이브 측정값 그대로 사용:

- Header: 100px (fixed)
- Hero: 1080px
- Orbital: 10,800px (외곽) + 1080px (스티키 motion)
- View: 937px
- News: 1,552px
- Partners: 1,035px
- Footer: 641px
- **Total: 17,125px**

## 참고

본 클론은 비공개 연구 자료로, 라이브 사이트의 CDN 자산(비디오·이미지)을 직접 임베드합니다. 상업 배포 금지.
