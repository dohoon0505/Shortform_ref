#!/usr/bin/env node
/**
 * Web Reference Lab — Category Generator: Scroll-Card-Update (v5)
 * 배경 그라데이션 분리 — 고정 배경 크로스페이드 + 카드만 이동
 *
 * v5 핵심:
 *   - 배경 그라데이션을 `.scu-bg` 레이어 4개로 분리 → 고정 + opacity 크로스페이드
 *   - 카드는 배경 없이 흰색 이너 카드(.scu-inner)만 표시
 *   - 모든 패턴이 unified sticky-stage 모델 사용
 *   - tick 함수에서 배경 크로스페이드 공통 처리, applyReveal은 카드 전환만
 *
 * Usage: node scripts/generate-scroll-card-update.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ANALYSIS_DIR = join(ROOT, 'analyses', 'scroll-card-update');
const ANALYSIS_FILE = join(ANALYSIS_DIR, 'analysis.json');
const DEMO_DIR = join(ROOT, 'demos', 'scroll-card-update');

const CATEGORY = {
  id: 'scroll-card-update',
  title: 'Scroll-Card-Update',
  type: 'category',
  date: '2026-05-27',
  url: 'https://base44.com/',
  summary: 'base44.com 시그니처 — 배경 그라데이션은 화면에 고정된 채 크로스페이드로 전환되고, 카드(좌 텍스트 + 우 이미지)만 이동하는 인터랙션. 4개의 .scu-bg 레이어가 활성 카드에 따라 opacity 600ms로 자연스럽게 교차하며, 흰색 이너 카드만 패턴별로 다른 전환 방식을 적용. Playwright 실측 토큰(border-radius 9px, grid 59:41, 카드별 그라디언트 4종, 본문 30px weight 400) 100% 반영.'
};

/* ================================================================
   카드 콘텐츠 + base44 실측 그라디언트
   ================================================================ */

const GRADIENTS = [
  'linear-gradient(rgb(240,240,240) 42.34%,rgb(240,195,236) 91.67%,rgb(204,231,233) 104.12%)',
  'linear-gradient(rgb(242,241,237) 42.49%,rgb(213,223,224) 93.98%,rgb(229,255,148) 104.08%)',
  'linear-gradient(rgb(237,234,228) 42.62%,rgb(249,251,201) 94.17%,rgb(254,233,105) 104.07%)',
  'linear-gradient(0deg,rgb(255,85,0) -13.02%,rgb(219,221,218) 9.58%,rgb(245,242,236) 83.05%)'
];

const SCU_CARDS = [
  {
    num: '01',
    title: 'Create at the speed of thought',
    body: 'Tell Base44 your idea, and watch it transform into a working app with all the building blocks already in place, from beautifully designed pages to user flows and one-click integrations.',
    img: 'https://static.wixstatic.com/media/dea07e_125faa410ab84732b15a14d6408fa704~mv2.jpg/v1/fill/w_681,h_881,fp_0.50_0.50,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Create%20at%20the%20speed%20of%20thought%20-%20Desktop.jpg'
  },
  {
    num: '02',
    title: 'A backend that builds with you',
    body: 'While you shape the idea, Base44 automatically sets up the logic and infrastructure so your app works out of the box. User logins, authentication, data storage, and role-based permissions are generated behind the scenes.',
    img: 'https://static.wixstatic.com/media/dea07e_3e3440eba62a4e0280547c9c58f1c31a~mv2.jpg/v1/fill/w_681,h_881,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/A%20backend%20that%20builds%20with%20you%20-%20Desktop.jpg'
  },
  {
    num: '03',
    title: 'Ready to use, instantly',
    body: 'Our platform comes with built-in hosting, analytics, and custom domains so when your app is ready to go live, all you have to do is press publish.',
    img: 'https://static.wixstatic.com/media/dea07e_01a647f9a0c244ce9d4f3cd3289bf081~mv2.jpg/v1/fill/w_681,h_881,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Ready%20to%20use%2C%20instantly%20-%20Desktop.jpg'
  },
  {
    num: '04',
    title: 'One platform. Any agent.',
    body: 'Get access to the latest AI models as they launch. Base44 automatically selects the best model for your project, or you can choose the one that fits your build, your style, and your workflow.',
    img: 'https://static.wixstatic.com/media/dea07e_2c9ac0357d0b460eb02073c3740626f1~mv2.jpg/v1/fill/w_681,h_881,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/One%20platform_%20Any%20agent%20-%20Desktop.jpg'
  }
];
const N = SCU_CARDS.length;

/* ================================================================
   마크업 빌더
   ================================================================ */

function cardInnerHTML(c) {
  return '<div class="scu-inner">'
    + '\n            <div class="scu-text">'
    + '\n              <div class="scu-num"><span class="scu-num-cur">' + c.num + '</span><span class="scu-num-sep">/</span><span class="scu-num-tot">0' + N + '</span><span class="scu-num-title">' + c.title + '</span></div>'
    + '\n              <p class="scu-body">' + c.body + '</p>'
    + '\n              <button class="scu-btn" type="button">Start building</button>'
    + '\n            </div>'
    + '\n            <div class="scu-img-wrap"><img class="scu-img" src="' + c.img + '" alt=""></div>'
    + '\n          </div>';
}

function bgLayersMarkup() {
  return GRADIENTS.map(function (g, i) {
    return '<div class="scu-bg' + (i === 0 ? ' is-on' : '') + '" style="background:' + g + '"></div>';
  }).join('\n        ');
}

function cardsMarkup() {
  return SCU_CARDS.map(function (c, i) {
    return '<div class="scu-card' + (i === 0 ? ' is-on' : '') + '" data-i="' + i + '">'
      + '\n          ' + cardInnerHTML(c)
      + '\n        </div>';
  }).join('\n        ');
}

/* ================================================================
   CSS — base44 실측 토큰 + 배경 레이어 분리
   ================================================================
   이너 카드: 1103×587, border-radius 8.81≈9px, bg #fff, NO box-shadow
   그리드: 649:454 ≈ 59:41 (좌 텍스트, 우 이미지)
   텍스트 패딩: 44px 70.5px 44px 44px, gap 44px
   번호/타이틀: 19.39px weight 400
   본문: 29.97px weight 400 line-height 35.96px ≈ 1.2
   버튼: 15.87px weight 500, bg #0f0f0f, border-radius 300px
   이미지: object-fit cover, border-radius 0 (overflow:hidden on inner)
   ================================================================ */

const INNER_CSS = ''
  + '.scu-inner { width: 65vw; max-width: 1100px; display: grid; grid-template-columns: 59fr 41fr; background: #fff; border-radius: 9px; overflow: hidden; aspect-ratio: 1100 / 587; }\n'
  + '.scu-text { display: flex; flex-direction: column; justify-content: center; padding: clamp(32px,2.6vw,44px) clamp(44px,4.17vw,70px) clamp(32px,2.6vw,44px) clamp(32px,2.6vw,44px); gap: clamp(32px,2.6vw,44px); }\n'
  + '.scu-num { display: flex; align-items: baseline; gap: 4px; font: 400 clamp(15px,1.15vw,19px)/normal inherit; }\n'
  + '.scu-num-cur { color: #000; }\n'
  + '.scu-num-sep { color: rgb(105,111,123); }\n'
  + '.scu-num-tot { color: rgb(105,111,123); }\n'
  + '.scu-num-title { color: #000; margin-left: 16px; }\n'
  + '.scu-body { font: 400 clamp(22px,1.77vw,30px)/1.2 inherit; color: #000; margin: 0; }\n'
  + '.scu-btn { display: inline-flex; align-items: center; font: 500 clamp(13px,0.94vw,16px)/1 inherit; color: #fff; background: #0f0f0f; border: 0; border-radius: 300px; padding: clamp(14px,1.1vw,18px) clamp(28px,2.1vw,36px); cursor: pointer; transition: background 160ms; align-self: flex-start; }\n'
  + '.scu-btn:hover { background: #2a2a2a; }\n'
  + '.scu-img-wrap { overflow: hidden; }\n'
  + '.scu-img { width: 100%; height: 100%; object-fit: cover; display: block; }\n';

const BASE_CSS = ''
  + '.scroll-track { min-height: 500vh; position: relative; }\n'
  + '.sticky-stage { position: sticky; top: 0; height: 100vh; overflow: hidden; }\n'
  + '.scu-bg { position: absolute; inset: 0; opacity: 0; transition: opacity 600ms ease; }\n'
  + '.scu-bg.is-on { opacity: 1; }\n'
  + '.scu-card { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; will-change: transform, opacity; }\n'
  + INNER_CSS;

/* ================================================================
   코드 스니펫 공통
   ================================================================ */

const SNIPPET_HTML = '<div class="scroll-track">\n  <div class="sticky-stage">\n    <!-- 배경 레이어 (고정, 크로스페이드) -->\n    <div class="bg is-on" style="background:linear-gradient(...)"></div>\n    <div class="bg" style="background:linear-gradient(...)"></div>\n    <!-- x4 배경 -->\n    <!-- 카드 (배경 없음, 흰색 이너 카드만) -->\n    <div class="card is-on" data-i="0">\n      <div class="inner">\n        <div class="text">넘버링 + 타이틀 + 본문 + CTA</div>\n        <div class="img-wrap"><img src="..." alt=""></div>\n      </div>\n    </div>\n    <!-- x4 카드 -->\n  </div>\n</div>';

const SNIPPET_CSS_BG = '.bg { position: absolute; inset: 0; opacity: 0;\n  transition: opacity 600ms ease; }\n.bg.is-on { opacity: 1; }\n';

/* ================================================================
   10 패턴 정의
   ================================================================ */

const PATTERNS = [
  // 01 — stack-up (base44 시그니처)
  {
    id: 'stack-up', num: '01', title: '스택 업 (base44 시그니처)',
    summary: '배경 그라데이션은 고정된 채 크로스페이드되고, 흰색 이너 카드가 아래에서 위로 슬라이드하며 zIndex 순서로 쌓인다. base44.com 시그니처 인터랙션.',
    demo: {
      cardCSS: '',
      applyFn: 'function applyReveal(p){\n  var segs = N - 1;\n  cards.forEach(function(c, i){\n    if (i === 0) { c.style.transform = "translateY(0)"; c.style.zIndex = 0; return; }\n    var start = (i - 1) / segs;\n    var local = Math.max(0, Math.min(1, (p - start) * segs));\n    c.style.transform = "translateY(" + ((1 - local) * 100) + "%)";\n    c.style.zIndex = i;\n  });\n}',
      height: 480
    },
    snippetHTML: SNIPPET_HTML,
    snippetCSS: SNIPPET_CSS_BG + '.card { position: absolute; inset: 0;\n  display: flex; align-items: center; justify-content: center; }\n.inner { width: 65vw; max-width: 1100px; display: grid;\n  grid-template-columns: 59fr 41fr; background: #fff;\n  border-radius: 9px; overflow: hidden; aspect-ratio: 1100/587; }',
    snippetJS: '// 배경 크로스페이드 (공통 tick에서 처리)\nvar idx = Math.floor(p * N);\nbgs.forEach(function(bg, i){ bg.classList.toggle("is-on", i === idx); });\n\n// 카드 스택 업\nvar segs = N - 1;\ncards.forEach(function(c, i){\n  if (i === 0) return;\n  var local = Math.max(0, Math.min(1, (p - (i-1)/segs) * segs));\n  c.style.transform = "translateY(" + ((1-local)*100) + "%)";\n  c.style.zIndex = i;\n});',
    explain: '배경 그라데이션 4종이 화면에 고정된 채 활성 카드에 따라 opacity 600ms로 크로스페이드. 흰색 이너 카드는 아래에서 위로 슬라이드(translateY 100%→0)하며 zIndex 순서로 쌓인다. 카드 0은 처음부터 보이고, 카드 1~3이 스크롤에 따라 순차 등장.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (배경 크로스페이드 + 카드 translateY)' },
      { label: '트리거', value: '스크롤 진행률 → 카드별 등장 구간' },
      { label: '배경', value: '고정 4레이어 크로스페이드 (opacity 600ms)' },
      { label: '카드', value: 'translateY 100%→0 (아래→위 슬라이드)' },
      { label: '이너 카드', value: '1100px, border-radius 9px, #fff' },
      { label: '시그니처', value: 'base44.com Playwright 100% 매칭' }
    ],
    guide: '카드가 아래에서 올라오며 쌓이는 가장 자연스러운 전환. 배경은 고정되어 색상만 크로스페이드되므로 시각적 안정감. 카드 4~6개 적정. 모바일에서는 grid를 1-column으로 fallback 권장.',
    recommendations: [
      { place: '히어로 헤더', body: '제품 핵심 가치 4가지 — base44 시그니처 그대로 적용' },
      { place: '랜딩 페이지', body: '기능 소개 섹션 — 안정적인 배경 + 카드 순차 전달' },
      { place: '제품 섹션', body: '제품 라인업 비교 — 카드별 이미지+스펙 교체' },
      { place: '포트폴리오 소개', body: '대표 작품 케이스 — 좌측 설명 + 우측 작품 이미지' }
    ],
    tradeoff: '배경 크로스페이드 + 카드 translateY 동시 처리. 카드 4~6개 적정. 모바일 Safari 테스트 필요.'
  },

  // 02 — fade-stack
  {
    id: 'fade-stack', num: '02', title: '페이드 스택',
    summary: '배경은 고정 크로스페이드, 활성 카드만 opacity 1로 표시. 가장 단순하고 안전한 전환.',
    demo: {
      cardCSS: '.scu-card { opacity: 0; transition: opacity 600ms ease-in-out; }\n.scu-card.is-on { opacity: 1; }',
      applyFn: 'function applyReveal(p){\n  var idx = Math.min(Math.floor(p * N), N - 1);\n  cards.forEach(function(c, i){ c.classList.toggle("is-on", i === idx); });\n}',
      height: 480
    },
    snippetHTML: SNIPPET_HTML,
    snippetCSS: SNIPPET_CSS_BG + '.card { position: absolute; inset: 0;\n  opacity: 0; transition: opacity 600ms ease-in-out; }\n.card.is-on { opacity: 1; }',
    snippetJS: 'var idx = Math.min(Math.floor(p * N), N - 1);\n// 배경 크로스페이드\nbgs.forEach(function(bg, i){ bg.classList.toggle("is-on", i === idx); });\n// 카드 페이드\ncards.forEach(function(c, i){ c.classList.toggle("is-on", i === idx); });',
    explain: '배경 그라데이션 레이어가 활성 카드에 따라 크로스페이드. 카드는 .is-on 클래스로 opacity 0↔1 전환(600ms ease-in-out). 배경과 카드 전환이 동시에 일어나 자연스러운 색상+콘텐츠 교체.',
    kv: [
      { label: '의존성', value: 'CSS only (JS는 클래스 토글)' },
      { label: '트리거', value: '스크롤 진행률 → activeIndex' },
      { label: '배경', value: '고정 크로스페이드 (opacity 600ms)' },
      { label: '카드', value: 'opacity 0↔1 (600ms ease-in-out)' },
      { label: '이너 카드', value: '좌 텍스트(59%) + 우 이미지(41%)' },
      { label: '시그니처', value: 'Stripe / Vercel 부드러운 swap' }
    ],
    guide: '가장 안전하고 보편적인 카드 전환. 배경이 고정되어 크로스페이드되므로 색상 전환이 매우 부드러움. transition 500~800ms 권장.',
    recommendations: [
      { place: '히어로 헤더', body: 'SaaS 메인 hero — 안전하고 부드러운 전환' },
      { place: '랜딩 페이지', body: '기능 소개 — 산만하지 않은 교체' },
      { place: '제품 섹션', body: '제품 변형 비교 — 배경 그라데이션 크로스페이드' },
      { place: '포트폴리오 소개', body: '작품 시리즈 — 방해 없는 전환' }
    ],
    tradeoff: '시각 임팩트 약함 — 강한 인상이 필요하면 stack-up이나 clip-bottom 권장.'
  },

  // 03 — scale-pop
  {
    id: 'scale-pop', num: '03', title: '스케일 팝',
    summary: '배경은 고정 크로스페이드, 활성 카드 scale 1, 대기 카드 0.92, 지난 카드 1.04.',
    demo: {
      cardCSS: '.scu-card { opacity: 0; transform: scale(0.92); transition: opacity 500ms ease-out, transform 500ms cubic-bezier(0.2,0,0,1); }\n.scu-card.is-on { opacity: 1; transform: scale(1); }',
      applyFn: 'function applyReveal(p){\n  var idx = Math.min(Math.floor(p * N), N - 1);\n  cards.forEach(function(c, i){\n    c.classList.toggle("is-on", i === idx);\n    if (i < idx) c.style.transform = "scale(1.04)";\n    else if (i > idx) c.style.transform = "scale(0.92)";\n    else c.style.transform = "scale(1)";\n  });\n}',
      height: 480
    },
    snippetHTML: SNIPPET_HTML,
    snippetCSS: SNIPPET_CSS_BG + '.card { position: absolute; inset: 0;\n  opacity: 0; transform: scale(0.92);\n  transition: opacity 500ms, transform 500ms cubic-bezier(0.2,0,0,1); }\n.card.is-on { opacity: 1; transform: scale(1); }',
    snippetJS: 'var idx = Math.min(Math.floor(p * N), N - 1);\ncards.forEach(function(c, i){\n  c.classList.toggle("is-on", i === idx);\n  c.style.transform = "scale(" + (i < idx ? 1.04 : i > idx ? 0.92 : 1) + ")";\n});',
    explain: '배경 그라데이션은 고정 크로스페이드. 활성 카드 scale 1 + opacity 1. 대기 카드 scale 0.92(작게), 지난 카드 scale 1.04(살짝 커지며 사라짐). 이너 카드만 줌 되고 배경은 안정적.',
    kv: [
      { label: '의존성', value: 'CSS + Vanilla JS' },
      { label: '트리거', value: '스크롤 진행률 → activeIndex' },
      { label: '배경', value: '고정 크로스페이드 (opacity 600ms)' },
      { label: '카드', value: 'scale 0.92 → 1 → 1.04 + opacity' },
      { label: '이징', value: 'cubic-bezier(0.2,0,0,1)' },
      { label: '시그니처', value: '부드러운 zoom 갤러리' }
    ],
    guide: '변화 폭이 작아(8~12%) 부드럽고 자연스러움. 배경이 고정되어 카드만 줌 되므로 레이어드 깊이감. scale 0.88~0.96 범위가 적정.',
    recommendations: [
      { place: '히어로 헤더', body: 'SaaS hero — 부드러운 zoom 전환' },
      { place: '랜딩 페이지', body: '회사 가치 시리즈 — 미세한 동적 변화' },
      { place: '제품 섹션', body: '제품 변형 비교 — 깔끔한 교체' },
      { place: '포트폴리오 소개', body: '작품 시리즈 — 줌 인/아웃 갤러리' }
    ],
    tradeoff: 'GPU 비용 약간. 변화가 작아 임팩트 중간 — 강한 인상보다 세련된 느낌.'
  },

  // 04 — slide-from-right
  {
    id: 'slide-from-right', num: '04', title: '우측 슬라이드',
    summary: '배경은 고정 크로스페이드, 활성 카드 translateX(0), 이전 -100%, 다음 100%.',
    demo: {
      cardCSS: '.scu-card { transform: translateX(100%); opacity: 0; transition: transform 600ms cubic-bezier(0.22,1,0.36,1), opacity 400ms ease; }\n.scu-card.is-on { transform: translateX(0); opacity: 1; }',
      applyFn: 'function applyReveal(p){\n  var idx = Math.min(Math.floor(p * N), N - 1);\n  cards.forEach(function(c, i){\n    c.classList.toggle("is-on", i === idx);\n    if (i < idx) c.style.transform = "translateX(-100%)";\n    else if (i > idx) c.style.transform = "translateX(100%)";\n    else c.style.transform = "translateX(0)";\n  });\n}',
      height: 480
    },
    snippetHTML: SNIPPET_HTML,
    snippetCSS: SNIPPET_CSS_BG + '.card { position: absolute; inset: 0;\n  transform: translateX(100%); opacity: 0;\n  transition: transform 600ms cubic-bezier(0.22,1,0.36,1); }\n.card.is-on { transform: translateX(0); opacity: 1; }',
    snippetJS: 'var idx = Math.min(Math.floor(p * N), N - 1);\ncards.forEach(function(c, i){\n  c.classList.toggle("is-on", i === idx);\n  c.style.transform = "translateX(" + (i < idx ? -100 : i > idx ? 100 : 0) + "%)";\n});',
    explain: '배경 그라데이션은 고정 크로스페이드. 활성 카드 translateX(0). 지난 카드 -100%(좌측 퇴장), 다음 카드 100%(우측 대기). 배경 색상이 먼저 전환되고 카드가 슬라이드되어 레이어드 효과.',
    kv: [
      { label: '의존성', value: 'CSS + Vanilla JS' },
      { label: '트리거', value: '스크롤 진행률 → activeIndex' },
      { label: '배경', value: '고정 크로스페이드 (opacity 600ms)' },
      { label: '카드', value: 'translateX -100% / 0 / 100%' },
      { label: '이징', value: 'cubic-bezier(0.22,1,0.36,1) out-expo' },
      { label: '시그니처', value: '캐러셀 슬라이드' }
    ],
    guide: '가로 슬라이드. sticky-stage의 overflow:hidden 필수. 배경이 고정되어 카드만 슬라이드되므로 배경 색상 전환이 더 선명.',
    recommendations: [
      { place: '히어로 헤더', body: '제품 라인업 가로 슬라이드' },
      { place: '랜딩 페이지', body: '서비스 단계별 진행 — 좌→우 흐름' },
      { place: '제품 섹션', body: '비교 슬라이드 — 나란히 비교 느낌' },
      { place: '포트폴리오 소개', body: '연도별 작품 — 타임라인 흐름' }
    ],
    tradeoff: '가로 흐름이 세로 스크롤과 직교 — 약간의 인지 비용. overflow:hidden 필수.'
  },

  // 05 — clip-bottom
  {
    id: 'clip-bottom', num: '05', title: 'Clip 바텀 리빌',
    summary: '배경은 고정 크로스페이드, 이너 카드가 clip-path inset(100%→0)로 아래→위 커튼 reveal.',
    demo: {
      cardCSS: '.scu-card { clip-path: inset(100% 0 0 0); }\n.scu-card[data-i="0"] { clip-path: inset(0); }',
      applyFn: 'function applyReveal(p){\n  cards.forEach(function(c, i){\n    if (i === 0) { c.style.clipPath = "inset(0)"; c.style.zIndex = 0; return; }\n    var pos = p * N - i + 1;\n    var local = pos <= 0 ? 0 : pos >= 1 ? 1 : pos;\n    c.style.clipPath = "inset(" + ((1 - local) * 100) + "% 0 0 0)";\n    c.style.zIndex = i;\n  });\n}',
      height: 480
    },
    snippetHTML: SNIPPET_HTML,
    snippetCSS: SNIPPET_CSS_BG + '.card { position: absolute; inset: 0;\n  clip-path: inset(100% 0 0 0); }\n.card[data-i="0"] { clip-path: inset(0); }',
    snippetJS: 'cards.forEach(function(c, i){\n  if (i === 0) return;\n  var pos = p * N - i + 1;\n  var local = Math.max(0, Math.min(1, pos));\n  c.style.clipPath = "inset(" + ((1-local)*100) + "% 0 0 0)";\n  c.style.zIndex = i;\n});',
    explain: '배경 그라데이션은 고정 크로스페이드. 첫 카드는 즉시 보이고, 이후 카드는 clip-path inset top 100%→0으로 아래→위 커튼처럼 reveal. 배경 색상이 먼저 전환되고 카드가 드러나는 시네마틱 효과.',
    kv: [
      { label: '의존성', value: 'Vanilla JS' },
      { label: '트리거', value: '스크롤 진행률 → clip-path inset' },
      { label: '배경', value: '고정 크로스페이드 (opacity 600ms)' },
      { label: '카드', value: 'clip-path inset top (1-local)×100%' },
      { label: '핵심', value: 'clip-path inset (GPU 가속)' },
      { label: '시그니처', value: '시네마틱 커튼 reveal' }
    ],
    guide: '시네마틱 reveal. zIndex 누적 필수. 배경이 고정되어 색상 전환과 카드 reveal이 분리되므로 더 깊은 레이어드 느낌.',
    recommendations: [
      { place: '히어로 헤더', body: '시네마틱 인트로 — 커튼 오픈 효과' },
      { place: '랜딩 페이지', body: '챕터별 전환 — 단계적 공개' },
      { place: '제품 섹션', body: '비포/애프터 전환 — 드라마틱' },
      { place: '포트폴리오 소개', body: '커튼 전환 연출 — 영화적 표현' }
    ],
    tradeoff: 'clip-path 모던 브라우저 필수. reveal 방향 아래→위 한정.'
  },

  // 06 — rotate-tilt
  {
    id: 'rotate-tilt', num: '06', title: '회전 틸트',
    summary: '배경은 고정 크로스페이드, 카드가 translateY ±60px + rotate ±3deg로 등장·퇴장.',
    demo: {
      cardCSS: '.scu-card { opacity: 0; transform: translateY(60px) rotate(-3deg); transition: opacity 600ms ease-out, transform 600ms cubic-bezier(0.2,0,0,1); transform-origin: bottom center; }\n.scu-card.is-on { opacity: 1; transform: translateY(0) rotate(0deg); }',
      applyFn: 'function applyReveal(p){\n  var idx = Math.min(Math.floor(p * N), N - 1);\n  cards.forEach(function(c, i){\n    c.classList.toggle("is-on", i === idx);\n    if (i < idx) c.style.transform = "translateY(-60px) rotate(3deg)";\n    else if (i > idx) c.style.transform = "translateY(60px) rotate(-3deg)";\n    else c.style.transform = "translateY(0) rotate(0)";\n  });\n}',
      height: 480
    },
    snippetHTML: SNIPPET_HTML,
    snippetCSS: SNIPPET_CSS_BG + '.card { position: absolute; inset: 0;\n  opacity: 0; transform: translateY(60px) rotate(-3deg);\n  transform-origin: bottom center;\n  transition: opacity 600ms, transform 600ms cubic-bezier(0.2,0,0,1); }\n.card.is-on { opacity: 1; transform: translateY(0) rotate(0); }',
    snippetJS: 'var idx = Math.min(Math.floor(p * N), N - 1);\ncards.forEach(function(c, i){\n  c.classList.toggle("is-on", i === idx);\n  if (i < idx) c.style.transform = "translateY(-60px) rotate(3deg)";\n  else if (i > idx) c.style.transform = "translateY(60px) rotate(-3deg)";\n  else c.style.transform = "translateY(0) rotate(0)";\n});',
    explain: '배경 그라데이션은 고정 크로스페이드. 활성 카드 translateY(0) + rotate(0). 다음 카드 60px 아래 + -3deg, 지난 카드 60px 위 + +3deg. 배경이 안정적이고 카드만 종이처럼 기울어지며 등장·퇴장.',
    kv: [
      { label: '의존성', value: 'CSS + Vanilla JS' },
      { label: '트리거', value: '스크롤 진행률 → activeIndex' },
      { label: '배경', value: '고정 크로스페이드 (opacity 600ms)' },
      { label: '카드', value: 'translateY ±60px + rotate ±3deg' },
      { label: '이징', value: 'cubic-bezier(0.2,0,0,1)' },
      { label: '시그니처', value: '에디토리얼 / 종이 넘김' }
    ],
    guide: '회전 2~5deg가 자연스러움. transform-origin: bottom center가 핵심. 배경이 고정되어 종이 넘김 느낌이 더 강조됨.',
    recommendations: [
      { place: '히어로 헤더', body: '에디토리얼·매거진 스타일 인트로' },
      { place: '랜딩 페이지', body: '크리에이티브 도구 소개 — 다이나믹' },
      { place: '제품 섹션', body: '아트·문구 제품 — 종이 질감' },
      { place: '포트폴리오 소개', body: '디자이너 포트폴리오 — 개성적 전환' }
    ],
    tradeoff: '큰 회전은 가독성 저하. 2~5deg 범위 권장. 모션 민감 사용자 고려.'
  },

  // 07 — blur-swap
  {
    id: 'blur-swap', num: '07', title: '블러 스왑',
    summary: '배경은 고정 크로스페이드, 카드가 blur(18px)↔0 + opacity 교차. 카메라 초점 전환.',
    demo: {
      cardCSS: '.scu-card { opacity: 0; filter: blur(18px); transition: opacity 700ms ease-in-out, filter 700ms ease-in-out; }\n.scu-card.is-on { opacity: 1; filter: blur(0); }',
      applyFn: 'function applyReveal(p){\n  var idx = Math.min(Math.floor(p * N), N - 1);\n  cards.forEach(function(c, i){ c.classList.toggle("is-on", i === idx); });\n}',
      height: 480
    },
    snippetHTML: SNIPPET_HTML,
    snippetCSS: SNIPPET_CSS_BG + '.card { position: absolute; inset: 0;\n  opacity: 0; filter: blur(18px);\n  transition: opacity 700ms, filter 700ms ease-in-out; }\n.card.is-on { opacity: 1; filter: blur(0); }',
    snippetJS: 'var idx = Math.min(Math.floor(p * N), N - 1);\ncards.forEach(function(c, i){\n  c.classList.toggle("is-on", i === idx);\n});',
    explain: '배경 그라데이션은 고정 크로스페이드. 비활성 카드 filter:blur(18px) + opacity 0. 활성 카드 blur(0) + opacity 1. 배경이 선명한 상태에서 카드만 blur/unblur — 카메라 초점 전환.',
    kv: [
      { label: '의존성', value: 'CSS only (JS는 클래스 토글)' },
      { label: '트리거', value: '스크롤 진행률 → activeIndex' },
      { label: '배경', value: '고정 크로스페이드 (opacity 600ms)' },
      { label: '카드', value: 'blur(18px)↔0 + opacity (700ms)' },
      { label: '핵심', value: '배경 선명 + 카드만 초점 전환' },
      { label: '시그니처', value: 'Apple Vision Pro 시네마틱' }
    ],
    guide: '영화적 초점 전환. 배경이 선명한 상태에서 카드만 blur 되어 배경 그라데이션이 잠시 드러나는 효과. transition 700~1000ms.',
    recommendations: [
      { place: '히어로 헤더', body: '시네마틱 SaaS hero — 초점 전환' },
      { place: '랜딩 페이지', body: '브랜드 스토리텔링 — 몽환적 전환' },
      { place: '제품 섹션', body: '프리미엄 제품 — 고급 전환' },
      { place: '포트폴리오 소개', body: '영화적 작품 갤러리' }
    ],
    tradeoff: 'filter blur GPU 비용. 전환 중 텍스트 읽기 불가. 모바일 성능 주의.'
  },

  // 08 — stack-spread (카드 덱)
  {
    id: 'stack-spread', num: '08', title: '스택 스프레드 (카드 덱)',
    summary: '배경은 고정 크로스페이드, 이전 카드가 -12px씩 위로 밀리고 scale 축소되어 쌓이는 카드 덱.',
    demo: {
      cardCSS: '.scu-card { transform: translateY(100%) scale(1); }\n.scu-card[data-i="0"] { transform: translateY(0) scale(1); }',
      applyFn: 'function applyReveal(p){\n  cards.forEach(function(c, i){\n    var pos = p * N - i;\n    var local = Math.max(0, Math.min(1, pos + 1));\n    if (pos < 0) { c.style.transform = "translateY(" + (100 * (1 - local)) + "%)"; c.style.zIndex = i; return; }\n    var behind = pos;\n    c.style.transform = "translateY(" + (-behind * 12) + "px) scale(" + Math.max(0.92, 1 - behind * 0.04) + ")";\n    c.style.zIndex = N - i;\n  });\n}',
      height: 480
    },
    snippetHTML: SNIPPET_HTML,
    snippetCSS: SNIPPET_CSS_BG + '.card { position: absolute; inset: 0;\n  transform: translateY(100%); }\n.card[data-i="0"] { transform: translateY(0); }',
    snippetJS: 'cards.forEach(function(c, i){\n  var pos = p * N - i;\n  if (pos < 0) return;\n  c.style.transform = "translateY(" + (-pos*12) + "px) scale("\n    + Math.max(0.92, 1 - pos*0.04) + ")";\n  c.style.zIndex = N - i;\n});',
    explain: '배경 그라데이션은 고정 크로스페이드. 활성 카드 + 이전 카드 동시 보임. 이전 카드는 -12px씩 위로 + scale 0.96·0.92로 축소되며 뒤에 쌓임. 배경이 고정되어 카드 덱 깊이감이 더 강조.',
    kv: [
      { label: '의존성', value: 'Vanilla JS' },
      { label: '트리거', value: '스크롤 진행률 → 연속 매핑' },
      { label: '배경', value: '고정 크로스페이드 (opacity 600ms)' },
      { label: '카드', value: 'translateY -behind×12px + scale 1-behind×0.04' },
      { label: '핵심', value: 'zIndex 역순 + 이전 카드 미니어처' },
      { label: '시그니처', value: 'iOS 사진앱 deck' }
    ],
    guide: '이전 카드가 뒤에 쌓여 진행 위치 시각화. 배경이 고정되어 카드 덱 깊이감 증폭. 카드 3~5개 적정.',
    recommendations: [
      { place: '히어로 헤더', body: '카드 시리즈 — 모든 카드 한 번에 인상' },
      { place: '랜딩 페이지', body: '기능 단계 — 이전 단계 잔상 유지' },
      { place: '제품 섹션', body: '제품 라인업 시리즈 — 덱 표현' },
      { place: '포트폴리오 소개', body: '작품 덱 형태 — 깊이감' }
    ],
    tradeoff: '카드 6개 이상은 시각 혼잡. 3~5개 권장. 뒤 카드의 텍스트는 축소되어 읽기 어려움.'
  },

  // 09 — dissolve (그레인)
  {
    id: 'dissolve', num: '09', title: '디졸브 (그레인)',
    summary: '배경은 고정 크로스페이드, 카드가 opacity + contrast/saturate 변화 + SVG noise overlay로 필름 디졸브.',
    demo: {
      cardCSS: '.scu-card { opacity: 0; transition: opacity 800ms ease-in-out, filter 800ms ease-in-out; filter: contrast(0.92) saturate(0.8); }\n.scu-card.is-on { opacity: 1; filter: contrast(1) saturate(1); }\n.scu-noise { position: absolute; inset: 0; pointer-events: none; opacity: 0.08; mix-blend-mode: overlay; z-index: 100; background-image: url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.6\'/%3E%3C/svg%3E"); }',
      applyFn: 'function applyReveal(p){\n  var idx = Math.min(Math.floor(p * N), N - 1);\n  cards.forEach(function(c, i){ c.classList.toggle("is-on", i === idx); });\n}',
      height: 480,
      extraInnerHTML: '<div class="scu-noise"></div>'
    },
    snippetHTML: SNIPPET_HTML.replace('<!-- x4 카드', '<div class="noise"></div>\n    <!-- x4 카드'),
    snippetCSS: SNIPPET_CSS_BG + '.card { position: absolute; inset: 0;\n  opacity: 0; filter: contrast(0.92) saturate(0.8);\n  transition: opacity 800ms, filter 800ms; }\n.card.is-on { opacity: 1; filter: contrast(1) saturate(1); }\n.noise { position: absolute; inset: 0; pointer-events: none;\n  opacity: 0.08; mix-blend-mode: overlay; }',
    snippetJS: 'var idx = Math.min(Math.floor(p * N), N - 1);\ncards.forEach(function(c, i){\n  c.classList.toggle("is-on", i === idx);\n});',
    explain: '배경 그라데이션은 고정 크로스페이드. opacity + filter contrast/saturate 동시 변화. SVG fractalNoise overlay로 그레인 텍스처. 배경이 선명한 상태에서 카드만 디졸브되어 필름 전환 느낌.',
    kv: [
      { label: '의존성', value: 'CSS + SVG noise' },
      { label: '트리거', value: '스크롤 진행률 → activeIndex' },
      { label: '배경', value: '고정 크로스페이드 (opacity 600ms)' },
      { label: '카드', value: 'opacity + filter contrast·saturate (800ms)' },
      { label: '핵심', value: 'SVG noise overlay mix-blend-mode' },
      { label: '시그니처', value: '필름 카메라 cross-dissolve' }
    ],
    guide: '시네마틱 디졸브. SVG noise opacity 0.05~0.1. 배경이 고정되어 카드만 디졸브되므로 배경 그라데이션이 잠시 드러나는 효과.',
    recommendations: [
      { place: '히어로 헤더', body: '브랜드 영상 시네마틱 — 필름 느낌' },
      { place: '랜딩 페이지', body: '에디토리얼 매거진 — 아날로그 전환' },
      { place: '제품 섹션', body: '예술·문화 제품 — 그레인 텍스처' },
      { place: '포트폴리오 소개', body: '사진작가·필름 메이커 — 장르 맞춤' }
    ],
    tradeoff: 'SVG noise GPU 비용. mix-blend-mode 모바일 호환 검수 필요.'
  },

  // 10 — carousel
  {
    id: 'carousel', num: '10', title: '캐러셀',
    summary: '배경은 고정 크로스페이드, 활성 카드 가운데 + 인접 카드 ±80% scale 0.85 미니어처.',
    demo: {
      cardCSS: '.scu-card { transform: translateX(100%) scale(0.85); opacity: 0.4; }',
      applyFn: 'function applyReveal(p){\n  var idx = Math.min(Math.floor(p * N), N - 1);\n  cards.forEach(function(c, i){\n    var diff = i - idx;\n    if (diff === 0) { c.style.transform = "translateX(0) scale(1)"; c.style.opacity = 1; c.style.zIndex = 10; }\n    else if (Math.abs(diff) === 1) { c.style.transform = "translateX(" + (diff * 80) + "%) scale(0.85)"; c.style.opacity = 0.35; c.style.zIndex = 5; }\n    else { c.style.transform = "translateX(" + (diff * 120) + "%) scale(0.7)"; c.style.opacity = 0; c.style.zIndex = 1; }\n  });\n}',
      height: 480
    },
    snippetHTML: SNIPPET_HTML,
    snippetCSS: SNIPPET_CSS_BG + '.card { position: absolute; inset: 0;\n  transform: translateX(100%) scale(0.85); opacity: 0.4; }',
    snippetJS: 'var idx = Math.min(Math.floor(p * N), N - 1);\ncards.forEach(function(c, i){\n  var diff = i - idx;\n  c.style.transform = "translateX(" + (diff*80) + "%) scale("\n    + (diff === 0 ? 1 : 0.85) + ")";\n  c.style.opacity = diff === 0 ? 1 : Math.abs(diff) === 1 ? 0.35 : 0;\n});',
    explain: '배경 그라데이션은 고정 크로스페이드. 활성 카드 가운데 scale 1. 좌우 인접 카드 ±80% + scale 0.85 + opacity 0.35. 배경이 고정되어 카드 흐름만 시각적으로 이동.',
    kv: [
      { label: '의존성', value: 'Vanilla JS' },
      { label: '트리거', value: '스크롤 진행률 → activeIndex' },
      { label: '배경', value: '고정 크로스페이드 (opacity 600ms)' },
      { label: '카드', value: 'diff → translateX·scale·opacity' },
      { label: '시각', value: '활성 가운데 + 인접 미니어처 양쪽' },
      { label: '시그니처', value: 'iOS 카드 캐러셀' }
    ],
    guide: '카드 시리즈를 한 번에 파악 가능. 배경이 고정되어 카드만 이동하므로 시각적 혼란 최소화. 카드 3~5개 적정.',
    recommendations: [
      { place: '히어로 헤더', body: '제품 라인업 캐러셀 — 전체 조망' },
      { place: '랜딩 페이지', body: '서비스 시리즈 — 흐름 파악' },
      { place: '제품 섹션', body: '제품 비교 — 인접 미니어처' },
      { place: '포트폴리오 소개', body: '작품 캐러셀 — 시리즈 표현' }
    ],
    tradeoff: '인접 카드의 텍스트는 축소되어 읽기 어려움. 시각 흐름 파악 용도.'
  }
];

/* ================================================================
   Standalone demo HTML 빌더
   ================================================================ */

function buildDemoHTML(p) {
  var extraInner = p.demo.extraInnerHTML || '';
  var patternCSS = p.demo.cardCSS || '';

  var bodyContent = '  <div class="scroll-track">\n'
    + '    <div class="sticky-stage">\n'
    + '        ' + bgLayersMarkup() + '\n'
    + '        ' + cardsMarkup() + '\n'
    + (extraInner ? '        ' + extraInner + '\n' : '')
    + '    </div>\n'
    + '  </div>';

  return '<!DOCTYPE html>\n'
    + '<html lang="ko">\n'
    + '<head>\n'
    + '  <meta charset="UTF-8">\n'
    + '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
    + '  <title>' + p.num + '. ' + p.title + ' — Scroll Card Demo</title>\n'
    + '  <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable-dynamic-subset.min.css" rel="stylesheet">\n'
    + '  <style>\n'
    + '    * { box-sizing: border-box; }\n'
    + '    html, body { margin: 0; padding: 0; }\n'
    + '    body { background: #f0f0f0; color: #000; font-family: "Pretendard Variable","Pretendard",sans-serif; overflow-x: hidden; -webkit-font-smoothing: antialiased; }\n'
    + '    .demo-controls { position: fixed; top: 16px; left: 16px; display: inline-flex; align-items: center; gap: 10px; z-index: 100; }\n'
    + '    .demo-reset { font: 600 11px/1 "Pretendard Variable","Pretendard",sans-serif; color: rgba(0,0,0,0.5); background: rgba(255,255,255,0.85); border: 1px solid rgba(0,0,0,0.1); border-radius: 999px; padding: 8px 14px; cursor: pointer; transition: color 160ms, background 160ms; backdrop-filter: blur(8px); }\n'
    + '    .demo-reset:hover { color: #000; background: #fff; }\n'
    + '    .demo-label { font: 500 10px/1 "Pretendard Variable","Pretendard",sans-serif; color: rgba(0,0,0,0.4); letter-spacing: 0.14em; text-transform: uppercase; }\n'
    + '    .demo-hint { position: fixed; right: 16px; bottom: 24px; font: 500 10px/1 "Pretendard Variable","Pretendard",sans-serif; color: rgba(0,0,0,0.4); letter-spacing: 0.18em; text-transform: uppercase; z-index: 100; background: rgba(255,255,255,0.75); padding: 8px 14px; border-radius: 999px; backdrop-filter: blur(8px); animation: hint-bounce 1.6s ease-in-out infinite; }\n'
    + '    @keyframes hint-bounce { 0%, 100% { transform: translateY(0); opacity: 0.6; } 50% { transform: translateY(4px); opacity: 1; } }\n'
    + '    .demo-progress { position: fixed; bottom: 0; left: 0; right: 0; height: 2px; background: rgba(0,0,0,0.06); z-index: 100; }\n'
    + '    .demo-progress > div { height: 100%; background: #000; width: 0; transition: width 60ms linear; }\n'
    + '    ' + BASE_CSS.replace(/\n/g, '\n    ') + '\n'
    + (patternCSS ? '    ' + patternCSS.replace(/\n/g, '\n    ') + '\n' : '')
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
    + '      var track = document.querySelector(".scroll-track");\n'
    + '      var bgs = document.querySelectorAll(".scu-bg");\n'
    + '      var cards = document.querySelectorAll(".scu-card");\n'
    + '      var N = ' + N + ';\n'
    + '      function calc(){\n'
    + '        var rect = track.getBoundingClientRect();\n'
    + '        var max = Math.max(1, rect.height - window.innerHeight);\n'
    + '        return Math.max(0, Math.min(1, -rect.top / max));\n'
    + '      }\n'
    + '      ' + p.demo.applyFn.replace(/\n/g, '\n      ') + '\n'
    + '      function tick(){\n'
    + '        var p = calc();\n'
    + '        progressFill.style.width = (p * 100) + "%";\n'
    + '        var idx = Math.min(Math.floor(p * N), N - 1);\n'
    + '        bgs.forEach(function(bg, i){ bg.classList.toggle("is-on", i === idx); });\n'
    + '        applyReveal(p);\n'
    + '      }\n'
    + '      window.addEventListener("scroll", tick, { passive: true });\n'
    + '      window.addEventListener("resize", tick, { passive: true });\n'
    + '      window.__reset = function(){ window.scrollTo({ top: 0, behavior: "smooth" }); };\n'
    + '      tick();\n'
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
        embed: 'demos/scroll-card-update/' + p.id + '.html',
        embedHeight: p.demo.height || 480,
        embedLabel: p.num + ' · ' + p.title,
        title: p.title + ' 라이브 데모'
      },
      { type: 'heading', value: '작동 원리' },
      { type: 'text', value: p.explain },
      { type: 'kv', columns: 2, items: p.kv },
      { type: 'heading', value: '코드 스니펫' },
      { type: 'code', lang: 'HTML', title: 'HTML', value: p.snippetHTML },
      { type: 'code', lang: 'CSS', title: 'CSS', value: p.snippetCSS },
      { type: 'code', lang: 'JS', title: 'JavaScript', value: p.snippetJS },
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
      tag: p.kv.find(function (k) { return k.label === '의존성'; })?.value || '',
      desc: p.summary
    };
  });

  return {
    title: '00. 카테고리 개요',
    blocks: [
      { type: 'heading', value: 'Scroll-Card-Update — 고정 배경 크로스페이드 v5' },
      { type: 'text', value: CATEGORY.summary },
      { type: 'heading', value: '10 패턴 인덱스' },
      { type: 'structure', items: indexItems },
      { type: 'heading', value: '공통 디자인 토큰 (base44 Playwright 실측)' },
      {
        type: 'kv', columns: 2, items: [
          { label: '폰트', value: 'Pretendard Variable 단일' },
          { label: '이너 카드', value: '65vw max-width 1100px, border-radius 9px, #fff, 그림자 없음' },
          { label: '그리드', value: '59fr:41fr (좌 텍스트, 우 이미지), gap 0' },
          { label: '본문', value: '30px weight 400 / line-height 1.2' },
          { label: '번호·타이틀', value: '19px weight 400 / 01=#000 /=rgb(105,111,123)' },
          { label: '버튼', value: '16px weight 500 / #0f0f0f / border-radius 300px' },
          { label: '배경 모델', value: '.scu-bg 4레이어 고정 + opacity 600ms 크로스페이드' },
          { label: '그라디언트', value: '카드별 고유 4종 (pink-teal, gray-lime, beige-yellow, orange)' },
          { label: '전체 모델', value: 'sticky-stage + absolute 카드 + JS applyReveal' },
          { label: '이미지', value: 'object-fit:cover, border-radius 0 (inner overflow:hidden)' }
        ]
      },
      { type: 'heading', value: '읽기 가이드' },
      {
        type: 'structure', items: [
          { label: '라이브 데모', tag: 'IFRAME', desc: 'demos/scroll-card-update/{pattern}.html — 카드 전환 인터랙션' },
          { label: '작동 원리', tag: 'HOW', desc: '스크롤 진행률 → 배경 크로스페이드 + 카드 transform/opacity/clip 매핑' },
          { label: '정량 메타', tag: 'KV', desc: '의존성 / 배경 / 카드 / 이너 카드 / 시그니처' },
          { label: '코드 스니펫', tag: 'CODE', desc: 'HTML / CSS / JS — 패턴별 핵심 코드' },
          { label: '사용 가이드', tag: 'GUIDE', desc: '파라미터·주의점·모바일 fallback' },
          { label: '활용 추천', tag: 'PLACES', desc: '히어로 / 랜딩 / 제품 / 포트폴리오 4건' },
          { label: '트레이드오프', tag: 'NOTE', desc: '성능·접근성·권장 사용처' }
        ]
      },
      {
        type: 'note',
        value: '배경 그라데이션 분리 아키텍처 — .scu-bg 4레이어가 화면에 고정된 채 활성 카드에 따라 opacity 600ms 크로스페이드. 카드는 배경 없이 흰색 이너 카드만 표시. base44.com Playwright 실측 기반.'
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
    console.log('✓ demos/scroll-card-update/' + p.id + '.html');
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
  console.log('✓ analyses/scroll-card-update/analysis.json');
  console.log('  ' + PATTERNS.length + ' patterns + 1 overview = ' + (PATTERNS.length + 1) + ' sections');
  var totalBlocks = Object.values(sections).reduce(function (acc, s) { return acc + s.blocks.length; }, 0);
  console.log('  ' + totalBlocks + ' blocks total');
}

main();
