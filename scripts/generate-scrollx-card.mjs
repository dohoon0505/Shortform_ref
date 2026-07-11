#!/usr/bin/env node
/**
 * Web Reference Lab — Category Generator: ScrollX Card (v1)
 * Framer "Horizontal ScrollX" (by Soyeb) 실측 기반 — 세로 스크롤 → 카드 가로 글라이드
 *
 * 핵심 모델 (Playwright 시계열 실측):
 *   - sticky-stage: position:sticky, top:0, height:100vh, overflow:hidden
 *   - scroll-track(긴 세로) 진행률 p(0~1)를 .sx-track translateX(-maxX*p)로 변환
 *   - maxX = track.scrollWidth - stage.clientWidth
 *   - 카드: 세로형 포트폴리오(상단 이미지 5:6 + 하단 제목·부제·연도)
 *   - 가로 글라이드 위에 패턴별 카드 효과(scale/rotateY/parallax/skew/stagger) 합성
 *
 * Usage: node scripts/generate-scrollx-card.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ANALYSIS_DIR = join(ROOT, 'analyses', 'scrollx-card');
const ANALYSIS_FILE = join(ANALYSIS_DIR, 'analysis.json');
const DEMO_DIR = join(ROOT, 'demos', 'scrollx-card');

const CATEGORY = {
  id: 'scrollx-card',
  title: 'ScrollX Card',
  type: 'category',
  date: '2026-05-29',
  url: 'https://www.framer.com/marketplace/components/horizontal-scrollx/',
  summary: 'Framer "Horizontal ScrollX"(제작 Soyeb) 실측 기반 — sticky-stage(position:sticky, top:0, height:100vh)에 세로형 포트폴리오 카드를 가로로 깔고, 세로 스크롤 진행률을 카드 트랙의 translateX(좌측 글라이드)로 변환하는 가로 스크롤 캐러셀. Playwright 시계열 실측(sticky h:100vh, scroll 0→100%에서 첫 카드 left +44→-826px 선형 좌측 이동, pin 구간 top 352 고정, 카드 이미지 비율 0.82 object-fit:cover)을 반영. 가로 글라이드 위에 center-focus·coverflow 3D·parallax·snap·scale-reveal·rotate-tilt·edge-fade·stagger-wave·stack-peek 10가지 변형을 적용.'
};

/* ================================================================
   카드 콘텐츠 — Framer ScrollX 데모(Selected Work) 기반 8종
   이미지는 picsum.photos seed 고정 (외부 의존성: Pretendard + picsum 2종)
   ================================================================ */

const CARDS = [
  { num: '01', title: 'Pulse',  cat: 'UI/UX Design & App Dev',     year: '2026', seed: 'pulse99' },
  { num: '02', title: 'Orbit',  cat: 'Digital Strategy & Marketing', year: '2025', seed: 'orbit42' },
  { num: '03', title: 'Flux',   cat: 'Web Development & SEO',       year: '2025', seed: 'flux17' },
  { num: '04', title: 'Echo',   cat: 'Content & Social Media',      year: '2025', seed: 'echo73' },
  { num: '05', title: 'Zenith', cat: 'Brand & Product Design',      year: '2025', seed: 'zenith8' },
  { num: '06', title: 'Vertex', cat: 'E-commerce Design',           year: '2025', seed: 'vertex5' },
  { num: '07', title: 'Nova',   cat: 'Motion & 3D Design',          year: '2024', seed: 'nova31' },
  { num: '08', title: 'Drift',  cat: 'Editorial & Print',           year: '2024', seed: 'drift64' }
];
const N = CARDS.length;

const imgURL = (c) => 'https://picsum.photos/seed/' + c.seed + '/600/760';

/* ================================================================
   마크업 빌더
   ================================================================ */

function cardMarkup(c) {
  return '<article class="sx-card" data-i="' + (parseInt(c.num, 10) - 1) + '">'
    + '\n          <div class="sx-img-wrap"><img class="sx-img" src="' + imgURL(c) + '" alt="" loading="lazy"></div>'
    + '\n          <div class="sx-meta">'
    + '\n            <h3 class="sx-title">' + c.title + '</h3>'
    + '\n            <div class="sx-sub"><span class="sx-cat">' + c.cat + '</span><span class="sx-year">' + c.year + '</span></div>'
    + '\n          </div>'
    + '\n        </article>';
}

function cardsMarkup() {
  // 끝에 spacer(실제 flex item) 추가 — flexbox에서 padding-right는 scrollWidth에 안 잡히므로
  // spacer로 maxX를 늘려 마지막 카드가 우측에 붙지 않고 좌측까지 빠지게 한다.
  return CARDS.map(cardMarkup).join('\n        ') + '\n        <div class="sx-end-spacer" aria-hidden="true"></div>';
}

/* ================================================================
   CSS — ScrollX 실측 토큰 (흰 카드 + 밝은 회색 무대 + 컬러 사진)
   ================================================================
   무대: sticky top:0 height:100vh, 배경 #f4f4f5
   카드: width clamp 240~300, bg #fff, radius 16, border 1px #ececec, shadow 미세
   이미지: aspect 5/6 (≈0.83 ≈ 실측 0.82), radius 10, object-fit cover
   제목: 20px weight 600 #18181b / 부제 13px #71717a / 연도 13px #a1a1aa
   트랙: flex gap 24, 좌우 padding clamp 24~120
   ================================================================ */

const BASE_CSS = ''
  + '.scroll-track { min-height: 720vh; position: relative; }\n'
  + '.sticky-stage { position: sticky; top: 0; height: 100vh; overflow: hidden; display: flex; flex-direction: column; justify-content: center; background: #f4f4f5; }\n'
  + '.sx-heading { text-align: center; font: 700 clamp(32px,5vw,72px)/1 inherit; color: #18181b; margin: 0 0 clamp(28px,5vh,60px); letter-spacing: -0.02em; }\n'
  + '.sx-viewport { width: 100%; overflow: hidden; }\n'
  + '.sx-track { display: flex; gap: 24px; padding: 0 clamp(24px,6vw,120px); will-change: transform; }\n'
  + '.sx-card { flex: 0 0 clamp(240px,22vw,300px); background: #fff; border: 1px solid #ececec; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); padding: 14px; will-change: transform, opacity; }\n'
  + '.sx-end-spacer { flex: 0 0 clamp(120px,40vw,760px); }\n'
  + '.sx-img-wrap { width: 100%; aspect-ratio: 5 / 6; border-radius: 10px; overflow: hidden; background: #e5e5e5; }\n'
  + '.sx-img { width: 100%; height: 100%; object-fit: cover; display: block; }\n'
  + '.sx-meta { padding: 14px 4px 4px; }\n'
  + '.sx-title { font: 600 clamp(16px,1.4vw,20px)/1.2 inherit; color: #18181b; margin: 0; }\n'
  + '.sx-sub { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin-top: 8px; }\n'
  + '.sx-cat { font: 400 clamp(11px,0.95vw,13px)/1.3 inherit; color: #71717a; }\n'
  + '.sx-year { font: 400 clamp(11px,0.95vw,13px)/1 inherit; color: #a1a1aa; flex: none; }\n';

/* ================================================================
   코드 스니펫 공통
   ================================================================ */

const SNIPPET_HTML = '<div class="scroll-track">\n  <div class="sticky-stage">\n    <h2 class="heading">Selected Work</h2>\n    <div class="viewport">\n      <div class="track">\n        <article class="card">\n          <div class="img"><img src="..." alt=""></div>\n          <div class="meta">\n            <h3>Pulse</h3>\n            <div class="sub"><span>UI/UX Design</span><span>2026</span></div>\n          </div>\n        </article>\n        <!-- x8 카드 -->\n        <div class="end-spacer"></div>\n      </div>\n    </div>\n  </div>\n</div>';

const SNIPPET_CSS_BASE = '.scroll-track { min-height: 720vh; position: relative; }\n.sticky-stage { position: sticky; top: 0;\n  height: 100vh; overflow: hidden;\n  display: flex; flex-direction: column;\n  justify-content: center; }\n.viewport { width: 100%; overflow: hidden; }\n.track { display: flex; gap: 24px;\n  padding: 0 clamp(24px,6vw,120px);\n  will-change: transform; }\n.card { flex: 0 0 clamp(240px,22vw,300px); }\n/* 끝 여백 — flexbox padding-right는 scrollWidth에 안 잡혀 spacer로 처리 */\n.end-spacer { flex: 0 0 40vw; }';

const SNIPPET_JS_CALC = '// 세로 스크롤 진행률 → 가로 이동량\nvar st = document.querySelector(".scroll-track");\nvar stage = document.querySelector(".sticky-stage");\nvar track = document.querySelector(".track");\nvar cards = document.querySelectorAll(".card");\nfunction progress(){\n  var r = st.getBoundingClientRect();\n  var max = Math.max(1, r.height - innerHeight);\n  return Math.min(1, Math.max(0, -r.top / max));\n}\nfunction maxX(){ return Math.max(0, track.scrollWidth - stage.clientWidth); }';

/* ================================================================
   10 패턴 정의
   demo.applyFn = `function applyMove(p){ ... }` (트랙 translateX + 카드 효과)
   demo.extraCSS = 패턴 전용 추가 CSS (선택)
   ================================================================ */

const PATTERNS = [
  // 01 — track-glide (Framer ScrollX 시그니처)
  {
    id: 'track-glide', num: '01', title: '트랙 글라이드 (ScrollX 시그니처)',
    summary: '세로 스크롤 진행률을 카드 트랙 translateX로 선형 변환. Framer Horizontal ScrollX의 기본 동작 — 카드들이 한 덩어리로 좌측으로 미끄러진다.',
    demo: {
      extraCSS: '',
      applyFn: 'function applyMove(p){\n  track.style.transform = "translateX(" + (-maxX() * p) + "px)";\n}',
      height: 540
    },
    explain: '스크롤 진행률 p(0~1)에 maxX(=트랙 전체 폭 − 무대 폭)를 곱해 트랙을 좌측으로 이동. sticky-stage가 100vh로 화면에 고정된 동안 세로 스크롤이 가로 이동으로 1:1 매핑된다. 가장 단순하고 안정적인 가로 스크롤.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (트랙 translateX 1줄)' },
      { label: '트리거', value: '세로 스크롤 진행률 → translateX' },
      { label: '무대', value: 'sticky top:0 height:100vh overflow:hidden' },
      { label: '이동', value: 'translateX(-maxX × p) 선형' },
      { label: '카드', value: '세로형 포트폴리오 (이미지 5:6 + 메타)' },
      { label: '시그니처', value: 'Framer Horizontal ScrollX 기본' }
    ],
    guide: '가로 스크롤의 표준. scroll-track 높이가 클수록 천천히 이동(min-height 400~600vh 권장). 트랙에 will-change:transform 필수. 모바일은 터치 가로 스와이프(scroll-snap)로 fallback 권장.',
    recommendations: [
      { place: '포트폴리오', body: 'Selected Work — 작업 카드 가로 갤러리 (데모 그대로)' },
      { place: '랜딩 페이지', body: '기능/제품 라인업 — 가로 흐름으로 시선 유도' },
      { place: '제품 섹션', body: '컬렉션 쇼케이스 — 카드 가로 브라우징' },
      { place: '에이전시', body: '클라이언트 로고/케이스 — 흐르는 쇼릴' }
    ],
    tradeoff: '세로 스크롤을 가로로 가두므로 스크롤 길이 설계 중요. 카드 많으면 트랙 폭 커져 이동이 빨라짐 — scroll-track 높이로 보정.'
  },

  // 02 — center-focus
  {
    id: 'center-focus', num: '02', title: '센터 포커스',
    summary: '가로 글라이드 + 화면 중앙에 가까운 카드는 scale 1·선명, 멀어질수록 축소·반투명. 중앙 카드에 시선이 집중된다.',
    demo: {
      extraCSS: '',
      applyFn: 'function applyMove(p){\n  var mx = maxX(), vw = stage.clientWidth;\n  track.style.transform = "translateX(" + (-mx * p) + "px)";\n  cards.forEach(function(c){\n    var cx = c.offsetLeft + c.offsetWidth / 2 - mx * p;\n    var d = Math.abs(cx - vw / 2) / vw;\n    c.style.transform = "scale(" + Math.max(0.82, 1 - d * 0.5) + ")";\n    c.style.opacity = Math.max(0.4, 1 - d * 1.1);\n  });\n}',
      height: 540
    },
    explain: '트랙은 선형 translateX로 이동하고, 각 카드의 화면상 중심 x를 구해 viewport 중앙과의 정규화 거리 d를 계산. 중앙(d≈0)은 scale 1·opacity 1, 가장자리(d 큼)는 scale 0.82·opacity 0.4까지 감쇠. 중앙 카드가 자연스럽게 강조된다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (카드별 거리 계산)' },
      { label: '트리거', value: '카드 중심 ↔ 화면 중앙 거리 d' },
      { label: '무대', value: 'sticky top:0 height:100vh' },
      { label: '이동', value: 'translateX(-maxX × p)' },
      { label: '카드', value: 'scale 1→0.82 / opacity 1→0.4 (거리 비례)' },
      { label: '시그니처', value: 'Apple TV / 갤러리 포커스' }
    ],
    guide: '중앙 강조로 "지금 보는 카드"가 분명. scale 폭 0.82~1, opacity 0.4~1이 적정. 매 프레임 offsetLeft 읽으므로 카드 수 20개 이하 권장(레이아웃 thrash 주의).',
    recommendations: [
      { place: '포트폴리오', body: '대표작 강조 — 중앙 카드에 시선 집중' },
      { place: '랜딩 페이지', body: '핵심 기능 1개씩 부각하며 가로 이동' },
      { place: '제품 섹션', body: '추천 상품 — 중앙 하이라이트 캐러셀' },
      { place: '미디어', body: '에피소드/앨범 브라우저 — 포커스 갤러리' }
    ],
    tradeoff: '매 프레임 getBounding/offset 읽기 — 카드 과다 시 성능 저하. opacity가 낮은 가장자리 카드는 텍스트 가독성 떨어짐.'
  },

  // 03 — coverflow-3d
  {
    id: 'coverflow-3d', num: '03', title: '커버플로우 3D',
    summary: '가로 글라이드 + 카드가 화면 중앙에서 멀어질수록 Y축으로 회전(rotateY). iTunes Cover Flow 스타일의 입체 카드 흐름.',
    demo: {
      extraCSS: '.sx-track { perspective: 1400px; align-items: center; }',
      applyFn: 'function applyMove(p){\n  var mx = maxX(), vw = stage.clientWidth;\n  track.style.transform = "translateX(" + (-mx * p) + "px)";\n  cards.forEach(function(c){\n    var cx = c.offsetLeft + c.offsetWidth / 2 - mx * p;\n    var d = (cx - vw / 2) / vw;\n    var rot = Math.max(-60, Math.min(60, -d * 110));\n    c.style.transform = "rotateY(" + rot + "deg) scale(" + Math.max(0.78, 1 - Math.abs(d) * 0.3) + ")";\n    c.style.zIndex = String(100 - Math.round(Math.abs(d) * 100));\n  });\n}',
      height: 560
    },
    explain: '트랙에 perspective(1400px)를 주고, 카드의 화면 중앙 기준 부호 거리 d로 rotateY를 계산(중앙 0deg, 좌측 +, 우측 −). 멀수록 ±60deg까지 기울고 scale도 축소. zIndex로 중앙 카드를 앞으로. 카드가 입체 벽처럼 흐른다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS + CSS perspective' },
      { label: '트리거', value: '부호 거리 d → rotateY' },
      { label: '무대', value: 'sticky + track perspective 1400px' },
      { label: '카드', value: 'rotateY ±60deg + scale + zIndex' },
      { label: '핵심', value: 'perspective는 부모(track)에' },
      { label: '시그니처', value: 'iTunes Cover Flow' }
    ],
    guide: 'perspective는 카드가 아닌 트랙(부모)에 두어야 통일된 소실점. rotateY 50~70deg가 자연스러움. transform-style:preserve-3d 불필요(단일 회전). 모바일 GPU 부하 주의.',
    recommendations: [
      { place: '포트폴리오', body: '작품 커버 흐름 — 입체 쇼릴' },
      { place: '미디어', body: '앨범/포스터 커버플로우 — 레트로 감성' },
      { place: '제품 섹션', body: '패키지 3D 진열 — 프리미엄 인상' },
      { place: '이벤트', body: '라인업 카드 — 드라마틱 입체 전환' }
    ],
    tradeoff: 'rotateY로 측면 카드 텍스트 왜곡·가독성 저하. 3D 변환 GPU 비용. 모션 민감 사용자 고려.'
  },

  // 04 — parallax-depth
  {
    id: 'parallax-depth', num: '04', title: '패럴랙스 뎁스',
    summary: '카드마다 이동 속도를 다르게(앞 레이어 빠르게, 뒤 레이어 느리게) 적용해 깊이감 있는 가로 패럴랙스를 만든다.',
    demo: {
      extraCSS: '',
      applyFn: 'function applyMove(p){\n  var mx = maxX();\n  track.style.transform = "translateX(" + (-mx * p) + "px)";\n  cards.forEach(function(c, i){\n    var speed = [0.86, 1, 1.16][i % 3];\n    c.style.transform = "translateX(" + (-mx * p * (speed - 1)) + "px)";\n  });\n}',
      height: 540
    },
    explain: '트랙 전체는 기본 속도(p)로 이동하고, 각 카드에 인덱스별 상대 속도(0.86 / 1 / 1.16 순환)를 추가 translateX로 더한다. 느린 카드는 뒤처지고 빠른 카드는 앞서가, 평면 카드 행에 레이어드 깊이감이 생긴다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (인덱스별 상대 속도)' },
      { label: '트리거', value: '트랙 p × 카드별 speed 계수' },
      { label: '무대', value: 'sticky top:0 height:100vh' },
      { label: '카드', value: '상대 translateX = -maxX × p × (speed−1)' },
      { label: '핵심', value: '속도 0.86 / 1.0 / 1.16 순환' },
      { label: '시그니처', value: '멀티 레이어 가로 패럴랙스' }
    ],
    guide: '속도 편차 ±10~20%가 자연스러움. 편차가 크면 카드 간격이 무너지므로 gap 여유 필요. 카드 배경/이미지에만 적용해 텍스트는 고정하는 변형도 가능.',
    recommendations: [
      { place: '랜딩 페이지', body: '히어로 하단 — 깊이 있는 카드 흐름' },
      { place: '포트폴리오', body: '레이어드 갤러리 — 입체적 브라우징' },
      { place: '브랜드', body: '비주얼 스토리 — 속도차로 리듬감' },
      { place: '제품 섹션', body: '컬렉션 — 전경/배경 카드 분리감' }
    ],
    tradeoff: '속도차로 카드 간격이 변해 겹치거나 벌어질 수 있음 — gap·속도 계수 튜닝 필요. 끝단에서 빈 공간 생길 수 있어 여유 카드 권장.'
  },

  // 05 — snap-step
  {
    id: 'snap-step', num: '05', title: '스냅 스텝',
    summary: '스크롤 진행률을 카드 단위로 양자화해 한 칸씩 딱딱 끊어 이동. CSS transition으로 스프링 스냅감을 준다.',
    demo: {
      extraCSS: '.sx-track { transition: transform 600ms cubic-bezier(0.22,1,0.36,1); }',
      applyFn: 'function applyMove(p){\n  var mx = maxX();\n  var step = Math.round(p * (N - 1)) / (N - 1);\n  track.style.transform = "translateX(" + (-mx * step) + "px)";\n}',
      height: 540
    },
    explain: '연속 진행률 p를 (N−1) 구간으로 반올림해 카드 인덱스 단위로 양자화(step)한 뒤 translateX. 트랙에 건 CSS transition(600ms out-expo)이 양자화된 위치 사이를 부드럽게 스냅 애니메이션. 스크롤이 카드 페이지처럼 한 칸씩 넘어간다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS + CSS transition' },
      { label: '트리거', value: '진행률 → 카드 인덱스 양자화' },
      { label: '무대', value: 'sticky top:0 height:100vh' },
      { label: '이동', value: 'translateX(-maxX × round(p×(N-1))/(N-1))' },
      { label: '스냅', value: 'transition 600ms cubic-bezier(0.22,1,0.36,1)' },
      { label: '시그니처', value: 'CSS scroll-snap 유사 스텝' }
    ],
    guide: 'JS 양자화 + CSS transition 조합이 핵심. 순수 CSS scroll-snap-type:x로도 구현 가능(가로 컨테이너). transition 400~700ms가 적정. 카드 폭이 균일해야 깔끔.',
    recommendations: [
      { place: '온보딩', body: '단계별 스텝 카드 — 한 화면 한 카드' },
      { place: '제품 섹션', body: '기능 1개씩 — 페이지 넘김' },
      { place: '포트폴리오', body: '작업 단위 포커스 — 또렷한 전환' },
      { place: '프레젠테이션', body: '슬라이드형 가로 데크' }
    ],
    tradeoff: '연속감이 없어 자유 브라우징엔 부적합. 빠른 스크롤 시 중간 카드 건너뜀. 카드 폭 불균일하면 스냅 어긋남.'
  },

  // 06 — scale-reveal
  {
    id: 'scale-reveal', num: '06', title: '스케일 리빌',
    summary: '카드가 화면 우측에서 진입할 때 scale 0.7·반투명으로 시작해 중앙으로 올수록 scale 1·선명해진다. 등장 연출이 있는 가로 글라이드.',
    demo: {
      extraCSS: '',
      applyFn: 'function applyMove(p){\n  var mx = maxX(), vw = stage.clientWidth;\n  track.style.transform = "translateX(" + (-mx * p) + "px)";\n  cards.forEach(function(c){\n    var cx = c.offsetLeft - mx * p;\n    var enter = Math.max(0, Math.min(1, (vw - cx) / (vw * 0.55)));\n    c.style.transform = "scale(" + (0.7 + 0.3 * enter) + ")";\n    c.style.opacity = String(Math.max(0.2, enter));\n  });\n}',
      height: 540
    },
    explain: '카드의 화면상 좌측 좌표 cx로 "얼마나 화면 안으로 들어왔는지" enter(0~1)를 계산. 우측 밖(cx 큼)은 enter 0 → scale 0.7·투명, 화면 안으로 들어올수록 enter 1 → scale 1·불투명. 카드가 등장하며 커지는 리빌 효과.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (진입도 enter 계산)' },
      { label: '트리거', value: '카드 좌측 좌표 → 화면 진입도' },
      { label: '무대', value: 'sticky top:0 height:100vh' },
      { label: '카드', value: 'scale 0.7→1 + opacity 0.2→1 (진입 비례)' },
      { label: '핵심', value: 'enter = (vw − cardLeft) / (vw×0.55)' },
      { label: '시그니처', value: '등장형 가로 리빌' }
    ],
    guide: '진입 구간(vw×0.5~0.6)을 넓히면 더 점진적. scale 시작값 0.6~0.8이 적정. IntersectionObserver로 1회성 reveal로 바꾸면 성능 유리(스크럽 대신).',
    recommendations: [
      { place: '랜딩 페이지', body: '기능 카드 — 등장 애니메이션 가로 흐름' },
      { place: '포트폴리오', body: '작업 reveal — 들어오며 커지는 연출' },
      { place: '제품 섹션', body: '신상품 — 진입 강조' },
      { place: '스토리텔링', body: '챕터 카드 — 단계적 공개' }
    ],
    tradeoff: '진입 중 카드가 작고 투명해 첫인상 약할 수 있음. 매 프레임 계산 — 카드 과다 시 성능. 모션 민감 고려.'
  },

  // 07 — rotate-tilt (관성 기울기)
  {
    id: 'rotate-tilt', num: '07', title: '관성 틸트',
    summary: '스크롤 속도(진행률 변화량)에 비례해 트랙 전체가 skewX로 기운다. 빠르게 스크롤하면 카드가 관성으로 휘어지는 모션블러 느낌.',
    demo: {
      extraCSS: '',
      applyFn: 'function applyMove(p){\n  var mx = maxX();\n  var v = p - lastP;\n  var skew = Math.max(-10, Math.min(10, -v * 700));\n  track.style.transform = "translateX(" + (-mx * p) + "px) skewX(" + skew + "deg)";\n}',
      height: 540
    },
    explain: '직전 프레임 진행률 lastP와의 차이 v(=속도)를 구해 skewX(−v×700, ±10deg 클램프)를 트랙에 적용. 스크롤이 빠를수록 크게 기울고, 멈추면 0deg로 복귀(transition). 가속/감속이 카드 행의 기울기로 시각화된다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (프레임 속도 v)' },
      { label: '트리거', value: '진행률 변화량 v = p − lastP' },
      { label: '무대', value: 'sticky top:0 height:100vh' },
      { label: '이동', value: 'translateX(-maxX×p) + skewX(-v×700)' },
      { label: '복귀', value: 'transform transition 200ms로 0deg 회복' },
      { label: '시그니처', value: '관성 / 모션블러 틸트' }
    ],
    guide: 'skew 한계 ±8~12deg가 자연스러움. transform에 transition 150~250ms를 주면 멈출 때 부드럽게 복귀. 속도 계수(700)는 스크롤 민감도에 맞춰 튜닝.',
    recommendations: [
      { place: '브랜드', body: '다이나믹 히어로 — 속도감 강조' },
      { place: '포트폴리오', body: '크리에이티브 쇼릴 — 관성 모션' },
      { place: '스포츠/게임', body: '에너지 넘치는 카드 흐름' },
      { place: '음악/이벤트', body: '리듬감 있는 가로 캐러셀' }
    ],
    tradeoff: 'skew로 카드 형태 왜곡 — 텍스트 읽는 순간엔 거슬릴 수 있음. 과한 계수는 멀미 유발. 멈춤 복귀 transition 필수.'
  },

  // 08 — edge-fade (마스크)
  {
    id: 'edge-fade', num: '08', title: '엣지 페이드 (마스크)',
    summary: '가로 글라이드 + viewport 좌우 가장자리를 CSS mask로 투명 처리. 중앙은 선명하고 양 끝은 부드럽게 사라지는 시네마틱 띠.',
    demo: {
      extraCSS: '.sx-viewport { -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 14%, #000 86%, transparent 100%); mask-image: linear-gradient(90deg, transparent 0%, #000 14%, #000 86%, transparent 100%); }',
      applyFn: 'function applyMove(p){\n  track.style.transform = "translateX(" + (-maxX() * p) + "px)";\n}',
      height: 540
    },
    explain: 'JS는 트랙을 선형 translateX로 옮길 뿐이고, 효과는 순수 CSS. viewport에 좌우로 투명→불투명→투명 linear-gradient mask를 걸어 양 끝 14%가 페이드 아웃. 카드가 가장자리에서 스르륵 나타나고 사라져 영화 크레딧 같은 흐름.',
    kv: [
      { label: '의존성', value: 'CSS mask-image (JS는 이동만)' },
      { label: '트리거', value: '트랙 translateX(-maxX × p)' },
      { label: '무대', value: 'sticky top:0 height:100vh' },
      { label: '마스크', value: 'linear-gradient 90deg, 양끝 14% 투명' },
      { label: '핵심', value: 'viewport에 mask, 트랙은 그대로 이동' },
      { label: '시그니처', value: '시네마틱 페이드 띠' }
    ],
    guide: '가장 가볍고 안전(효과가 CSS). 페이드 폭 10~18%가 적정. -webkit- 프리픽스 병기 필수. 배경색과 무관하게 작동(투명도 마스크). 다른 패턴과 조합하기 좋은 베이스.',
    recommendations: [
      { place: '로고 월', body: '파트너/클라이언트 로고 무한 띠' },
      { place: '포트폴리오', body: '작업 쇼릴 — 가장자리 페이드' },
      { place: '미디어', body: '추천 콘텐츠 가로 띠' },
      { place: '랜딩 페이지', body: '리뷰/후기 카드 흐름' }
    ],
    tradeoff: 'mask-image 구형 브라우저 미지원(프리픽스 필요). 가장자리 카드가 잘려 보여 정보 손실 — 끝단 카드는 보조 정보만.'
  },

  // 09 — stagger-wave
  {
    id: 'stagger-wave', num: '09', title: '스태거 웨이브',
    summary: '가로 글라이드 + 카드의 화면 위치에 따라 Y offset을 사인파로 적용. 카드들이 물결치듯 위아래로 출렁이며 흐른다.',
    demo: {
      extraCSS: '.sx-track { align-items: center; }',
      applyFn: 'function applyMove(p){\n  var mx = maxX(), vw = stage.clientWidth;\n  track.style.transform = "translateX(" + (-mx * p) + "px)";\n  cards.forEach(function(c){\n    var cx = c.offsetLeft + c.offsetWidth / 2 - mx * p;\n    var phase = (cx / vw) * Math.PI * 1.4;\n    c.style.transform = "translateY(" + (Math.sin(phase) * 44) + "px)";\n  });\n}',
      height: 580
    },
    explain: '트랙은 선형 이동하고, 각 카드의 화면상 중심 x를 위상으로 변환해 sin(phase)×44px만큼 Y 이동. 카드가 화면을 가로지르며 위→아래→위로 출렁이는 사인파 궤적을 그린다. 정적인 카드 행에 율동감을 더한다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (사인파 Y offset)' },
      { label: '트리거', value: '카드 화면 위치 → sin 위상' },
      { label: '무대', value: 'sticky top:0 height:100vh' },
      { label: '카드', value: 'translateY = sin(x/vw × 1.4π) × 44px' },
      { label: '핵심', value: 'align-items:center + Y 진폭 44px' },
      { label: '시그니처', value: '물결 / 웨이브 캐러셀' }
    ],
    guide: '진폭 30~60px, 위상 계수 1~2π가 자연스러움. 무대 높이에 여유(카드가 위아래로 움직이므로) 필요. 진폭이 크면 카드가 잘리니 sticky 높이/패딩 확보.',
    recommendations: [
      { place: '브랜드', body: '플레이풀한 히어로 — 율동감' },
      { place: '포트폴리오', body: '크리에이티브 갤러리 — 생동감' },
      { place: '제품 섹션', body: '캐주얼 컬렉션 — 경쾌한 흐름' },
      { place: '이벤트', body: '페스티벌/뮤직 — 웨이브 분위기' }
    ],
    tradeoff: '위아래 움직임으로 수직 정렬이 깨져 정보 비교 어려움. 진폭 과하면 산만·멀미. Y 이동분만큼 무대 높이 여유 필요.'
  },

  // 10 — stack-peek
  {
    id: 'stack-peek', num: '10', title: '스택 픽',
    summary: '카드가 살짝 겹쳐 흐르고, 화면 중앙 카드만 scale 1로 펼쳐지며 앞으로(zIndex). 덱에서 한 장씩 들춰보는 느낌.',
    demo: {
      extraCSS: '.sx-track { gap: 0; } .sx-card { margin-right: -40px; }',
      applyFn: 'function applyMove(p){\n  var mx = maxX(), vw = stage.clientWidth;\n  track.style.transform = "translateX(" + (-mx * p) + "px)";\n  cards.forEach(function(c){\n    var cx = c.offsetLeft + c.offsetWidth / 2 - mx * p;\n    var d = Math.abs(cx - vw / 2) / vw;\n    c.style.transform = "scale(" + Math.max(0.84, 1 - d * 0.45) + ") translateY(" + (d * 18) + "px)";\n    c.style.zIndex = String(200 - Math.round(d * 200));\n  });\n}',
      height: 560
    },
    explain: '카드 gap을 0으로 하고 margin-right −40px로 겹친 뒤, 화면 중앙 거리 d로 중앙 카드는 scale 1·zIndex 최상위로 펼치고, 멀어질수록 scale 0.84·약간 아래로 내려 뒤로 보낸다. 겹친 덱에서 가운데 한 장이 들춰지는 듯한 가로 흐름.',
    kv: [
      { label: '의존성', value: 'Vanilla JS + 음수 margin' },
      { label: '트리거', value: '중앙 거리 d → scale·zIndex' },
      { label: '무대', value: 'sticky top:0 height:100vh' },
      { label: '카드', value: 'scale 1→0.84 + translateY + zIndex 역순' },
      { label: '핵심', value: 'gap:0 + margin-right −40px 겹침' },
      { label: '시그니처', value: 'iOS Safari 탭 / 카드 덱' }
    ],
    guide: '겹침 폭(margin −30~−60px)과 중앙 scale 차로 깊이 조절. zIndex를 중앙 최상위로 줘야 펼침이 자연스러움. 카드 그림자가 있으면 겹침 입체감 강화.',
    recommendations: [
      { place: '포트폴리오', body: '작업 덱 — 한 장씩 들춰보기' },
      { place: '제품 섹션', body: '카드형 상품 — 겹친 컬렉션' },
      { place: '미디어', body: '플레이리스트/앨범 덱' },
      { place: '지갑/금융', body: '카드 덱 UI — 가로 브라우징' }
    ],
    tradeoff: '겹침으로 가장자리 카드 정보 일부 가림. zIndex/scale 동시 제어로 계산 약간 무거움. 카드 폭 균일 권장.'
  }
];

/* ================================================================
   Standalone demo HTML 빌더
   ================================================================ */

function buildDemoHTML(p) {
  var extraCSS = p.demo.extraCSS || '';

  var bodyContent = '  <div class="scroll-track">\n'
    + '    <div class="sticky-stage">\n'
    + '      <h2 class="sx-heading">Selected Work</h2>\n'
    + '      <div class="sx-viewport">\n'
    + '        <div class="sx-track">\n'
    + '        ' + cardsMarkup() + '\n'
    + '        </div>\n'
    + '      </div>\n'
    + '    </div>\n'
    + '  </div>';

  return '<!DOCTYPE html>\n'
    + '<html lang="ko">\n'
    + '<head>\n'
    + '  <meta charset="UTF-8">\n'
    + '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
    + '  <title>' + p.num + '. ' + p.title + ' — ScrollX Card Demo</title>\n'
    + '  <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable-dynamic-subset.min.css" rel="stylesheet">\n'
    + '  <style>\n'
    + '    * { box-sizing: border-box; }\n'
    + '    html, body { margin: 0; padding: 0; }\n'
    + '    body { background: #f4f4f5; color: #18181b; font-family: "Pretendard Variable","Pretendard",sans-serif; overflow-x: hidden; -webkit-font-smoothing: antialiased; }\n'
    + '    .demo-controls { position: fixed; top: 16px; left: 16px; display: inline-flex; align-items: center; gap: 10px; z-index: 100; }\n'
    + '    .demo-reset { font: 600 11px/1 "Pretendard Variable","Pretendard",sans-serif; color: rgba(0,0,0,0.5); background: rgba(255,255,255,0.85); border: 1px solid rgba(0,0,0,0.1); border-radius: 999px; padding: 8px 14px; cursor: pointer; transition: color 160ms, background 160ms; backdrop-filter: blur(8px); }\n'
    + '    .demo-reset:hover { color: #000; background: #fff; }\n'
    + '    .demo-label { font: 500 10px/1 "Pretendard Variable","Pretendard",sans-serif; color: rgba(0,0,0,0.4); letter-spacing: 0.14em; text-transform: uppercase; }\n'
    + '    .demo-hint { position: fixed; right: 16px; bottom: 24px; font: 500 10px/1 "Pretendard Variable","Pretendard",sans-serif; color: rgba(0,0,0,0.4); letter-spacing: 0.18em; text-transform: uppercase; z-index: 100; background: rgba(255,255,255,0.75); padding: 8px 14px; border-radius: 999px; backdrop-filter: blur(8px); animation: hint-bounce 1.6s ease-in-out infinite; }\n'
    + '    @keyframes hint-bounce { 0%, 100% { transform: translateY(0); opacity: 0.6; } 50% { transform: translateY(4px); opacity: 1; } }\n'
    + '    .demo-progress { position: fixed; bottom: 0; left: 0; right: 0; height: 2px; background: rgba(0,0,0,0.06); z-index: 100; }\n'
    + '    .demo-progress > div { height: 100%; background: #18181b; width: 0; transition: width 60ms linear; }\n'
    + '    ' + BASE_CSS.replace(/\n/g, '\n    ') + '\n'
    + (extraCSS ? '    ' + extraCSS + '\n' : '')
    + '  </style>\n'
    + '</head>\n'
    + '<body>\n'
    + '  <div class="demo-controls">\n'
    + '    <button class="demo-reset" type="button" onclick="window.__reset && window.__reset()">↻ 다시 보기</button>\n'
    + '    <span class="demo-label">' + p.num + ' · ' + p.title + '</span>\n'
    + '  </div>\n'
    + '  <div class="demo-hint">SCROLL ↓</div>\n'
    + '  <div class="demo-progress"><div></div></div>\n'
    + '\n'
    + bodyContent + '\n'
    + '\n'
    + '  <script>\n'
    + '    (function(){\n'
    + '      var progressFill = document.querySelector(".demo-progress > div");\n'
    + '      var scrollTrack = document.querySelector(".scroll-track");\n'
    + '      var stage = document.querySelector(".sticky-stage");\n'
    + '      var track = document.querySelector(".sx-track");\n'
    + '      var cards = document.querySelectorAll(".sx-card");\n'
    + '      var N = ' + N + ';\n'
    + '      var target = 0, current = 0, lastP = 0;\n'
    + '      function calc(){\n'
    + '        var rect = scrollTrack.getBoundingClientRect();\n'
    + '        var max = Math.max(1, rect.height - window.innerHeight);\n'
    + '        return Math.max(0, Math.min(1, -rect.top / max));\n'
    + '      }\n'
    + '      function maxX(){ return Math.max(0, track.scrollWidth - stage.clientWidth); }\n'
    + '      ' + p.demo.applyFn.replace(/\n/g, '\n      ') + '\n'
    + '      // smooth scroll — 실제 스크롤(target)을 current가 lerp로 부드럽게 추격\n'
    + '      function loop(){\n'
    + '        target = calc();\n'
    + '        current += (target - current) * 0.08;\n'
    + '        if (Math.abs(target - current) < 0.0002) current = target;\n'
    + '        progressFill.style.width = (current * 100) + "%";\n'
    + '        applyMove(current);\n'
    + '        lastP = current;\n'
    + '        requestAnimationFrame(loop);\n'
    + '      }\n'
    + '      window.__reset = function(){ window.scrollTo({ top: 0, behavior: "smooth" }); };\n'
    + '      requestAnimationFrame(loop);\n'
    + '    })();\n'
    + '  </script>\n'
    + '</body>\n'
    + '</html>\n';
}

/* ================================================================
   분석 보고서 블록 빌더
   ================================================================ */

function buildPatternSection(p) {
  return {
    title: p.num + '. ' + p.title,
    blocks: [
      { type: 'text', value: p.summary },
      { type: 'heading', value: '라이브 데모' },
      {
        type: 'component',
        embed: 'demos/scrollx-card/' + p.id + '.html',
        embedHeight: (p.demo.height || 540) + 80,
        embedLabel: p.num + ' · ' + p.title,
        title: p.title + ' 라이브 데모'
      },
      { type: 'heading', value: '작동 원리' },
      { type: 'text', value: p.explain },
      { type: 'kv', columns: 2, items: p.kv },
      { type: 'heading', value: '코드 스니펫' },
      { type: 'code', lang: 'HTML', title: 'HTML', value: SNIPPET_HTML },
      { type: 'code', lang: 'CSS', title: 'CSS', value: SNIPPET_CSS_BASE + (p.demo.extraCSS ? '\n/* ' + p.title + ' 전용 */\n' + p.demo.extraCSS.replace(/\.sx-/g, '.') : '') },
      { type: 'code', lang: 'JS', title: 'JavaScript', value: SNIPPET_JS_CALC + '\n\n' + p.demo.applyFn + '\n\n// smooth scroll — 실제 스크롤(target)을 current가 lerp로 부드럽게 추격\nvar target = 0, current = 0;\nfunction loop(){\n  target = progress();\n  current += (target - current) * 0.08;\n  applyMove(current);\n  requestAnimationFrame(loop);\n}\nloop();' },
      { type: 'heading', value: '사용 가이드' },
      { type: 'text', value: p.guide },
      { type: 'heading', value: '활용 추천' },
      {
        type: 'structure',
        items: p.recommendations.map(function (r) { return { label: r.place, tag: '', desc: r.body }; })
      },
      { type: 'note', value: '트레이드오프 — ' + p.tradeoff }
    ]
  };
}

function buildOverview() {
  var indexItems = PATTERNS.map(function (p) {
    return {
      label: p.num + '. ' + p.title,
      tag: (p.kv.find(function (k) { return k.label === '의존성'; }) || {}).value || '',
      desc: p.summary
    };
  });

  return {
    title: '00. 카테고리 개요',
    blocks: [
      { type: 'heading', value: 'ScrollX Card — 세로 스크롤을 가로 글라이드로' },
      { type: 'text', value: CATEGORY.summary },
      { type: 'heading', value: '10 패턴 인덱스' },
      { type: 'structure', items: indexItems },
      { type: 'heading', value: '공통 모델 (Framer ScrollX Playwright 실측)' },
      {
        type: 'kv', columns: 2, items: [
          { label: '폰트', value: 'Pretendard Variable 단일' },
          { label: '무대(sticky-stage)', value: 'position:sticky, top:0, height:100vh, overflow:hidden' },
          { label: '스크롤 트랙', value: 'min-height 720vh — 세로 스크롤 거리를 가로 이동으로 매핑 (충분한 끝 여유)' },
          { label: '스크롤 보간', value: 'requestAnimationFrame + lerp(0.08) — current가 target 부드럽게 추격 (smooth scroll)' },
          { label: '가로 이동', value: 'track translateX(−maxX × current), maxX = scrollWidth − stageWidth' },
          { label: '끝 여백', value: 'track padding-right 42vw — 마지막 카드가 우측에 붙지 않고 좌측까지 빠짐' },
          { label: '진행률 p', value: '(-trackTop) / (trackHeight − innerHeight), 0~1 클램프' },
          { label: '카드', value: 'width clamp 240~300px, bg #fff, radius 16, border 1px #ececec' },
          { label: '이미지', value: 'aspect-ratio 5/6 (≈0.83 ≈ 실측 0.82), radius 10, object-fit cover' },
          { label: '제목·메타', value: '제목 20px w600 / 부제 13px #71717a / 연도 13px #a1a1aa' },
          { label: '무대 배경', value: '#f4f4f5 밝은 회색' },
          { label: '효과 합성', value: '트랙 translateX(공통) + 카드별 scale/rotateY/translateY/skew/zIndex' }
        ]
      },
      { type: 'heading', value: '읽기 가이드' },
      {
        type: 'structure', items: [
          { label: '라이브 데모', tag: 'IFRAME', desc: 'demos/scrollx-card/{pattern}.html — 스크롤하면 카드가 가로로 글라이드' },
          { label: '작동 원리', tag: 'HOW', desc: '세로 스크롤 진행률 → 트랙 translateX + 카드별 변환' },
          { label: '정량 메타', tag: 'KV', desc: '의존성 / 무대 / 이동 / 카드 / 시그니처' },
          { label: '코드 스니펫', tag: 'CODE', desc: 'HTML / CSS / JS — 패턴별 applyMove 핵심' },
          { label: '사용 가이드', tag: 'GUIDE', desc: '파라미터·주의점·모바일 fallback' },
          { label: '활용 추천', tag: 'PLACES', desc: '포트폴리오 / 랜딩 / 제품 / 미디어 4건' },
          { label: '트레이드오프', tag: 'NOTE', desc: '성능·접근성·권장 사용처' }
        ]
      },
      {
        type: 'note',
        value: 'Framer Horizontal ScrollX(by Soyeb) 실측 기반. sticky-stage 100vh 안에서 세로 스크롤이 카드 트랙의 가로 translateX로 변환되며, 그 위에 10가지 카드 효과를 합성. 모바일은 터치 가로 스와이프(scroll-snap-type:x) fallback 권장.'
      }
    ]
  };
}

/* ================================================================
   메인
   ================================================================ */

function main() {
  mkdirSync(DEMO_DIR, { recursive: true });
  for (var p of PATTERNS) {
    writeFileSync(join(DEMO_DIR, p.id + '.html'), buildDemoHTML(p), 'utf-8');
    console.log('✓ demos/scrollx-card/' + p.id + '.html');
  }

  var sections = { overview: buildOverview() };
  for (var p of PATTERNS) sections[p.id] = buildPatternSection(p);

  var analysis = {
    id: CATEGORY.id,
    title: CATEGORY.title,
    type: CATEGORY.type,
    url: CATEGORY.url,
    date: CATEGORY.date,
    summary: CATEGORY.summary,
    patternCount: PATTERNS.length,
    sections: sections
  };
  mkdirSync(ANALYSIS_DIR, { recursive: true });
  writeFileSync(ANALYSIS_FILE, JSON.stringify(analysis, null, 2), 'utf-8');
  console.log('✓ analyses/scrollx-card/analysis.json');
  console.log('  ' + PATTERNS.length + ' patterns + 1 overview = ' + (PATTERNS.length + 1) + ' sections');
  var totalBlocks = Object.values(sections).reduce(function (acc, s) { return acc + s.blocks.length; }, 0);
  console.log('  ' + totalBlocks + ' blocks total');
}

main();
