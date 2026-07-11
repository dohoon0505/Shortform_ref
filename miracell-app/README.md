# miracell-app — Tier-A Mirror Mode Clone

미라셀(https://miracell.co.kr/kr/) 메인 페이지의 100% 동일 재현을 위한 별도 Vanilla JS 프로젝트.

## 구조

```
miracell-app/
├── README.md
├── index.html                       조합된 풀페이지 (옵션, 모든 섹션 통합)
├── styles/
│   └── globals.css                  :root CSS Variables 24개 + 기본 리셋 + 키프레임
└── (참고) /components/miracell/*.html  보고서 모달용 정적 HTML (별도 폴더)
```

## 디자이너 사용 가이드

### 1. 보고서에서 프리뷰 보기
1. `index.html` (보고서 진입점)에서 `#ref/miracell` 진입
2. 각 섹션의 `[프리뷰 열기]` 버튼 클릭
3. 풀스크린 모달에 라이브 정확 px(1080×1905 등)로 렌더된 컴포넌트 확인

### 2. 자기 프로젝트에 복사
1. `/components/miracell/{section}.html` 의 HTML 그대로 복사
2. `/miracell-app/styles/globals.css` 의 CSS Variables 복사
3. 클래스명 그대로 사용 (`#mainAbout`, `.list-item.cover01`, `.main-prd-item` 등 라이브 BEM)

### 3. 라이브 사이트와 1:1 매칭

| 섹션 | 라이브 ID/Class | 실측 px | Tier-A 파일 |
|---|---|---|---|
| Header | `#header.top-fixed-object` | fixed 80px | components/miracell/header.html |
| Hero | `#mainVisual.full-height.visual-active` | 1080px (5컬럼 × 2 roller) | components/miracell/hero.html |
| About | `#mainAbout` | 1512px | components/miracell/about.html |
| Service | `#mainService` | 1452px | components/miracell/service.html |
| Product | `#mainProduct` | 1122px | components/miracell/product.html |
| News | `#mainNews` | 1005px | components/miracell/news.html |
| Contact | `#mainContact` | 451px | components/miracell/contact.html |
| Footer | `#footer` | 547px | components/miracell/footer.html |

## 디자인 토큰

`styles/globals.css` 의 `:root` 24개 실측 변수:

```css
--main-color: #dd0031;
--area-width: 1400px;
--area-wide-width: 1700px;
--header-height: 80px;
--transition-custom: all 0.4s ease-in-out;
--font-family1: 'Pretendard' (한글);
--font-family2: 'Outfit' (영문/숫자);
```

## 키 인터랙션

- **Splitting.js 단어/글자 분할 + fade-in**: H4 본문 텍스트
- **Marquee 무한 좌측 슬라이드**: `.marquee .absol` 25s linear infinite
- **Hero 5-Roller**: 컬럼별 26-32s 다른 듀레이션
- **Contact 회전 SVG textPath**: VIEW MORE 14s linear infinite
- **마우스 추적 커스텀 커서**: Service/Product 카드 hover 시 `.mouse-pointer.view` 활성 (이 클론에서는 미구현, 라이브에서만)

## 빌드 (Vanilla 정적 파일)

별도 빌드 명령 없음. `index.html`을 브라우저로 직접 열거나 `pwsh ../scripts/serve.ps1`으로 로컬 서버에 띄움.

## 사용 폰트

- **Pretendard Variable** (한글) — CDN: `cdn.jsdelivr.net/gh/orioncactus/pretendard`
- **Outfit** (영문/숫자) — Google Fonts: `Outfit:wght@400;500;600;700;800`

## 라이브 정확한 px 사용 원칙

모든 height는 `100vh` 사용 금지. 라이브 측정값(`1080px`, `1512px` 등) 그대로 사용. 이유: viewport 단위는 브라우저 크기에 따라 변동하므로 100% 일치 보장 불가.

## 참고

본 클론은 비공개 연구 자료로, 라이브 사이트의 CDN 자산(이미지·아이콘)을 직접 임베드합니다. 상업 배포 금지.
