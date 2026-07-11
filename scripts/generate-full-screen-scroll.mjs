#!/usr/bin/env node
/**
 * Web Reference Lab — Category Generator: Full-screen Scroll (v2 — 통일 스타일)
 *
 * Framer 마켓플레이스 "Scroll Slides" (Artem Kostenko, https://scrollslides.framer.website/)
 * 시각을 모든 10 패턴에 일관 적용:
 *   - 동일 4 이미지 (framerusercontent.com) + 동일 4 캡션 (Intuition/Touch/Glow/Pulse)
 *   - 좌측 하단 캡션 (Pretendard 500/300) + 하단 progress bar (4 균등, 01 Name 라벨)
 *   - 어두운 gradient overlay + Pretendard 단일 폰트
 * 패턴마다 다른 건 이미지의 인터랙션 변환(applyReveal) 뿐.
 *
 * Usage: node scripts/generate-full-screen-scroll.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ANALYSIS_DIR = join(ROOT, 'analyses', 'full-screen-scroll');
const ANALYSIS_FILE = join(ANALYSIS_DIR, 'analysis.json');
const DEMO_DIR = join(ROOT, 'demos', 'full-screen-scroll');

const CATEGORY = {
  id: 'full-screen-scroll',
  title: 'Full-screen Scroll',
  type: 'category',
  date: '2026-05-27',
  url: 'https://www.framer.com/marketplace/components/scroll-slides/',
  summary: 'parent를 N×100vh로 늘리고 sticky stage에 슬라이드를 고정한 뒤, 스크롤 진행률(0~1)을 activeIndex와 slideProgress[i]에 매핑해 풀스크린 슬라이드를 전환하는 인터랙션 카탈로그. Framer 마켓플레이스 "Scroll Slides" 컴포넌트(Artem Kostenko 작)의 sticky + fade + progress bar 패턴을 첫 번째(fade-stack)로 차용하고, 나머지 9 변형은 동일 시각·동일 이미지·동일 캡션·동일 progress bar 구조 위에 각자의 인터랙션 변환만 다르게 정의.'
};

// ============ 표준 슬라이드 데이터 (4종, 모든 패턴이 공유) ============
const FS_SLIDES = [
  { img: 'https://framerusercontent.com/images/d3xhzATSbq7UnQJGe11DInRHoA.png?width=2912&height=1632', num: '01', name: 'Intuition', title: 'Sensitivity as a guiding force', desc: 'Forms and colors respond to inner feeling rather than logic. Design becomes instinctive — not constructed, but sensed. A world shaped by quiet whispers of intuition.' },
  { img: 'https://framerusercontent.com/images/Ka2cys5DNM0ZnikfEku6vAQgs.png?width=2912&height=1632',  num: '02', name: 'Touch',     title: 'Tactile presence',              desc: 'Surfaces hold the memory of light and time. Texture speaks where words fall silent — materials become a language of their own.' },
  { img: 'https://framerusercontent.com/images/J7sgYKuCCsB521hhlHpnH26Xo.png?width=2912&height=1632',  num: '03', name: 'Glow',      title: 'Emotional illumination',        desc: 'Soft light shapes the mood of every room. Warmth without heat, brightness without glare — atmosphere built from a single ray.' },
  { img: 'https://framerusercontent.com/images/9Mpgc4sWSDqEN9RprS8TLHnypqY.png?width=2720&height=1760', num: '04', name: 'Pulse',    title: 'The living rhythm',             desc: 'Spaces breathe with the people inside. From shadow to glow, from quiet to full — a house alive with its own quiet rhythm.' }
];
const N = FS_SLIDES.length;

// ============ 공통 마크업 빌더 ============

function fsImagesMarkup(extraClass) {
  return FS_SLIDES.map(function (s, i) {
    return '<img class="fs-img' + (extraClass ? ' ' + extraClass : '') + (i === 0 ? ' is-on' : '') + '" src="' + s.img + '" alt="' + s.name + '" data-i="' + i + '">';
  }).join('\n        ');
}

function fsCapsMarkup() {
  return '<div class="fs-caps">\n          '
    + FS_SLIDES.map(function (s, i) {
        return '<div class="fs-cap' + (i === 0 ? ' is-on' : '') + '" data-i="' + i + '"><h1 class="fs-title">' + s.title + '</h1><p class="fs-desc">' + s.desc + '</p></div>';
      }).join('\n          ')
    + '\n        </div>';
}

function fsBarsMarkup() {
  return '<div class="fs-bars">\n          '
    + FS_SLIDES.map(function (s, i) {
        return '<div class="fs-bar' + (i === 0 ? ' is-active' : '') + '" data-i="' + i + '"><div class="fs-bar-label"><span class="fs-bar-num">' + s.num + '</span><span class="fs-bar-name">' + s.name + '</span></div><div class="fs-bar-track"><div class="fs-bar-fill"></div></div></div>';
      }).join('\n          ')
    + '\n        </div>';
}

// 공통 base CSS — 모든 패턴이 공유
const FS_BASE_CSS = ''
  + '.fs-stack { position: absolute; inset: 0; overflow: hidden; background: #000; font-family: "Pretendard Variable","Pretendard",sans-serif; }\n'
  + '.fs-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center; will-change: opacity, transform; }\n'
  + '.fs-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.55) 100%); pointer-events: none; z-index: 2; }\n'
  + '.fs-caps { position: absolute; inset: 0; pointer-events: none; z-index: 4; }\n'
  + '.fs-cap { position: absolute; left: 60px; right: 60px; bottom: 130px; opacity: 0; transform: translateY(16px); transition: opacity 500ms ease-out, transform 500ms cubic-bezier(0.2,0,0,1); will-change: opacity, transform; }\n'
  + '.fs-cap.is-on { opacity: 1; transform: translateY(0); }\n'
  + '.fs-title { font: 500 clamp(40px, 5vw, 64px)/1.05 inherit; color: #fff; margin: 0 0 22px; max-width: 60%; letter-spacing: -0.02em; }\n'
  + '.fs-desc { font: 300 clamp(14px, 1vw, 16px)/1.5 inherit; color: rgba(255,255,255,0.92); margin: 0; max-width: 460px; }\n'
  + '.fs-bars { position: absolute; left: 60px; right: 60px; bottom: 48px; display: flex; gap: 40px; align-items: flex-end; z-index: 4; }\n'
  + '.fs-bar { flex: 1; display: flex; flex-direction: column; gap: 14px; }\n'
  + '.fs-bar-label { display: flex; gap: 10px; align-items: baseline; font: 500 14px/1 inherit; color: rgba(255,255,255,0.5); transition: color 300ms ease; letter-spacing: 0.01em; }\n'
  + '.fs-bar-num { font: 400 14px/1 inherit; opacity: 0.78; }\n'
  + '.fs-bar.is-active .fs-bar-label, .fs-bar.is-past .fs-bar-label { color: rgba(255,255,255,1); }\n'
  + '.fs-bar-track { width: 100%; height: 2px; background: rgba(255,255,255,0.22); overflow: hidden; }\n'
  + '.fs-bar-fill { height: 100%; background: #fff; transform: scaleX(0); transform-origin: left; }\n';

// 공통 reveal helper — applyCommon(p, N): 캡션·bar 상태 업데이트
const FS_COMMON_SCRIPT = ''
  + 'var caps = document.querySelectorAll(".fs-cap");\n'
  + 'var bars = document.querySelectorAll(".fs-bar");\n'
  + 'var fills = document.querySelectorAll(".fs-bar-fill");\n'
  + 'var N = ' + N + ';\n'
  + 'function applyCommon(p){\n'
  + '  var idx = Math.min(Math.floor(p * N), N - 1);\n'
  + '  caps.forEach(function(c, i){ c.classList.toggle("is-on", i === idx); });\n'
  + '  bars.forEach(function(b, i){\n'
  + '    b.classList.toggle("is-active", i === idx);\n'
  + '    b.classList.toggle("is-past", i < idx);\n'
  + '  });\n'
  + '  fills.forEach(function(f, i){\n'
  + '    var start = i / N, end = (i + 1) / N;\n'
  + '    var local = p < start ? 0 : p > end ? 1 : (p - start) / (end - start);\n'
  + '    f.style.transform = "scaleX(" + local + ")";\n'
  + '  });\n'
  + '  return idx;\n'
  + '}';

// ============ 10 패턴 정의 ============

const PATTERNS = [
  // 01 — fade-stack
  {
    id: 'fade-stack', num: '01', title: '페이드 스택 (Framer Scroll Slides)',
    summary: '풀스크린 이미지가 sticky stage에 쌓여 있고, 진행률 구간 [i/N, (i+1)/N]에서 activeIndex가 i로 바뀌면서 이전 이미지는 opacity 0, 새 이미지는 opacity 1로 fade(0.6s ease-in-out). Framer 마켓플레이스 Scroll Slides의 시각·동작 100% 매칭.',
    demo: {
      bodyHTML: '<div class="fs-stack">\n        ' + fsImagesMarkup('fs-img-fade') + '\n        <div class="fs-overlay"></div>\n        ' + fsCapsMarkup() + '\n        ' + fsBarsMarkup() + '\n      </div>',
      css: FS_BASE_CSS + '.fs-img-fade { opacity: 0; transition: opacity 600ms ease-in-out; }\n.fs-img-fade.is-on { opacity: 1; }',
      script: 'var imgs = document.querySelectorAll(".fs-img");\n' + FS_COMMON_SCRIPT + '\nfunction applyReveal(p){\n  var idx = applyCommon(p);\n  imgs.forEach(function(s, i){ s.classList.toggle("is-on", i === idx); });\n}',
      height: 600, trackVh: 400
    },
    snippetHTML: '<div class="track" style="height:400vh">\n  <div class="stage" style="position:sticky;top:0;height:100vh">\n    <img class="img is-on" src="..."> × 4\n    <div class="overlay"></div>\n    <div class="caps"><div class="cap is-on">…</div></div>\n    <div class="bars"><div class="bar"><span>01</span><span>Intuition</span><div class="fill"></div></div></div>\n  </div>\n</div>',
    snippetCSS: '.img { position: absolute; inset: 0; object-fit: cover; opacity: 0; transition: opacity 600ms ease-in-out; }\n.img.is-on { opacity: 1; }',
    snippetJS: 'var imgs = document.querySelectorAll(".img");\nwindow.addEventListener("scroll", function(){\n  var rect = document.querySelector(".track").getBoundingClientRect();\n  var p = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));\n  var idx = Math.min(Math.floor(p * imgs.length), imgs.length - 1);\n  imgs.forEach(function(s, i){ s.classList.toggle("is-on", i === idx); });\n}, { passive: true });',
    explain: 'parent .track 높이를 N×100vh로 설정하고 .stage를 position:sticky top:0 height:100vh로 viewport에 고정. 스크롤 진행률(0~1)을 N으로 곱한 인덱스로 activeIndex를 결정해 그 인덱스의 이미지·캡션만 .is-on (opacity 1). 어두운 gradient overlay가 텍스트 가독성 보장. progress bar 4개는 슬라이드별 local progress(0~1)을 scaleX로.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (Framer Motion 대체 가능)' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '매핑', value: 'activeIndex = floor(p × N) · local = (p - i/N) × N' },
      { label: 'Track 높이', value: 'N × 100vh (예: 4 슬라이드 = 400vh)' },
      { label: 'Fade', value: '이미지·캡션 opacity 0↔1, 600ms ease-in-out' },
      { label: '폰트', value: 'Pretendard Variable 단일' }
    ],
    guide: '풀스크린 이미지/비디오 갤러리에 가장 보편적. 슬라이드 3~5개가 균형. Track 높이는 N×100vh 표준. 좌측 하단 캡션(60px padding) + 어두운 overlay(0.18→0.55 gradient)가 가독성 보장. progress bar 라벨은 활성 슬라이드에서 흰색, 비활성에서 0.5 흰색.',
    recommendations: [
      { place: '히어로 헤더', body: '제품/공간 홍보 페이지의 메인 Hero — Framer Scroll Slides 그대로' },
      { place: '랜딩 페이지', body: '브랜드 스토리텔링의 4 챕터 (Intuition·Touch·Glow·Pulse 같은 컨셉 라벨)' },
      { place: '제품 섹션', body: '제품 라인업 — 한 제품당 한 슬라이드, 비디오 가능' },
      { place: '포트폴리오 소개', body: '대표 작업 4-5건 풀스크린 갤러리 + 좌측 하단 캡션' }
    ],
    tradeoff: 'parent height가 4×100vh = 400vh로 페이지 전체 길이가 크게 늘어남. 한 페이지에 하나만 권장. 모바일 이미지 최적화 필수.'
  },

  // 02 — horizontal-pan
  {
    id: 'horizontal-pan', num: '02', title: '가로 패닝',
    summary: '세로 스크롤을 가로 이동으로 변환. sticky stage 안의 rail이 N×100vw 폭이고, 진행률에 따라 translateX로 가로 이동. 동일한 4 이미지 + 좌측 하단 캡션 + 하단 progress bar.',
    demo: {
      bodyHTML: '<div class="fs-stack">\n        <div class="fs-rail">\n          ' + FS_SLIDES.map(function (s, i) { return '<img class="fs-img-h" src="' + s.img + '" alt="' + s.name + '" data-i="' + i + '">'; }).join('\n          ') + '\n        </div>\n        <div class="fs-overlay"></div>\n        ' + fsCapsMarkup() + '\n        ' + fsBarsMarkup() + '\n      </div>',
      css: FS_BASE_CSS + '.fs-rail { position: absolute; inset: 0; display: flex; width: ' + (N * 100) + 'vw; height: 100%; will-change: transform; }\n.fs-img-h { position: relative; width: 100vw; height: 100%; flex-shrink: 0; object-fit: cover; }',
      script: 'var rail = document.querySelector(".fs-rail");\n' + FS_COMMON_SCRIPT + '\nfunction applyReveal(p){\n  applyCommon(p);\n  rail.style.transform = "translateX(" + (-p * (N - 1) * 100) + "vw)";\n}',
      height: 600, trackVh: 400
    },
    snippetHTML: '<div class="stage">\n  <div class="rail"><img>×4</div>\n  <div class="overlay"></div>\n  <div class="caps">…</div>\n  <div class="bars">…</div>\n</div>',
    snippetCSS: '.rail { display: flex; width: 400vw; height: 100%; }\n.rail > img { width: 100vw; flex-shrink: 0; object-fit: cover; }',
    snippetJS: 'var rail = document.querySelector(".rail");\nwindow.addEventListener("scroll", function(){\n  var rect = document.querySelector(".track").getBoundingClientRect();\n  var p = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));\n  rail.style.transform = "translateX(" + (-p * 300) + "vw)";\n}, { passive: true });',
    explain: 'rail이 display:flex로 가로 정렬, 전체 폭 N×100vw. 진행률에 -(N-1) × 100vw를 곱해 translateX. 캡션·progress bar는 viewport에 fixed(absolute)로 같은 자리에 머물고 활성 슬라이드 캡션·bar만 표시. 사용자는 세로 스크롤로 이미지가 가로로 흐르는 시네마틱.',
    kv: [
      { label: '의존성', value: 'Vanilla JS' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '매핑', value: 'translateX = -p × (N-1) × 100vw' },
      { label: 'Track 높이', value: 'N × 100vh' },
      { label: 'Rail 폭', value: 'N × 100vw' },
      { label: '시그니처', value: 'Apple AirPods Pro / Stripe Universal' }
    ],
    guide: '슬라이드가 옆으로 흐르는 영화 같은 진행감. 3~5개가 균형. 모바일에서는 가로 스크롤이 자연스럽지 않을 수 있어 horizontal swipe로 대체 권장.',
    recommendations: [
      { place: '히어로 헤더', body: '제품 라인업 가로 갤러리 — Apple 시그니처' },
      { place: '랜딩 페이지', body: '서비스 단계(Step 1→2→3) 가로 진행' },
      { place: '제품 섹션', body: '제품 비교 — 슬라이드별 한 제품' },
      { place: '포트폴리오 소개', body: '연도별 작업 타임라인 — 가로로 흐르는 시간' }
    ],
    tradeoff: '가로 스크롤이 익숙하지만 페이지 안에 다른 세로 콘텐츠와 섞이면 사용자 혼란. 모바일은 horizontal swipe로 fallback.'
  },

  // 03 — zoom-into
  {
    id: 'zoom-into', num: '03', title: '줌인 전환',
    summary: '이미지가 자기 인덱스에 도달할 때 scale 0.85→1로 커지며 opacity 풀려나고, 인덱스를 지나면 scale 1→1.4 + opacity 1→0으로 줌인하며 사라짐. 카메라가 이미지 안으로 빨려 들어가는 인상.',
    demo: {
      bodyHTML: '<div class="fs-stack">\n        ' + fsImagesMarkup('fs-img-zoom') + '\n        <div class="fs-overlay"></div>\n        ' + fsCapsMarkup() + '\n        ' + fsBarsMarkup() + '\n      </div>',
      css: FS_BASE_CSS + '.fs-img-zoom { opacity: 0; transform: scale(0.85); }',
      script: 'var imgs = document.querySelectorAll(".fs-img");\n' + FS_COMMON_SCRIPT + '\nfunction applyReveal(p){\n  applyCommon(p);\n  imgs.forEach(function(s, i){\n    var pos = p * N - i;\n    if (pos < -0.5 || pos > 1.2) { s.style.opacity = 0; return; }\n    var op = pos < 0 ? Math.max(0, 1 + pos * 2) : pos > 1 ? Math.max(0, 1 - (pos - 1) * 4) : 1;\n    var scale = pos < 0 ? 0.85 + 0.15 * (1 + pos) : 0.85 + 0.55 * pos;\n    s.style.opacity = op;\n    s.style.transform = "scale(" + scale + ")";\n  });\n}',
      height: 600, trackVh: 400
    },
    snippetHTML: '<img class="img"> × 4\n<!-- 모두 sticky 안에 absolute inset:0 -->',
    snippetCSS: '.img { position: absolute; inset: 0; object-fit: cover; opacity: 0; transform: scale(0.85); will-change: transform, opacity; }',
    snippetJS: 'window.addEventListener("scroll", function(){\n  var p = /* 진행률 */;\n  document.querySelectorAll(".img").forEach(function(s, i){\n    var pos = p * N - i;\n    s.style.opacity = pos < 0 || pos > 1 ? 0 : 1;\n    s.style.transform = "scale(" + (0.85 + 0.55 * pos) + ")";\n  });\n}, { passive: true });',
    explain: '각 이미지의 local pos = p×N - i. pos < 0(등장 전) opacity 0 + scale 0.85→1, pos ∈ [0,1] (활성) opacity 1 + scale 1→1.4, pos > 1 (지나감) opacity 0. 이미지가 가운데에서 줌인되며 사라지는 영화적 느낌.',
    kv: [
      { label: '의존성', value: 'Vanilla JS' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '매핑', value: 'pos = p×N - i, scale 0.85 → 1.4' },
      { label: 'Track 높이', value: 'N × 100vh' },
      { label: '이징', value: 'linear (사용자 제어)' },
      { label: '시그니처', value: 'Apple Vision Pro Hero / WebGL 카메라 줌' }
    ],
    guide: '카메라 줌인 같은 강한 시각 임팩트. 슬라이드 3~4개 적정. perspective:1000px을 추가하면 약간의 3D 깊이감. 텍스트 가독성 주의 — 큰 폰트나 짧은 카피만 권장.',
    recommendations: [
      { place: '히어로 헤더', body: '제품 발표 페이지 — 메인 제품이 카메라 줌인으로 등장' },
      { place: '랜딩 페이지', body: '컨셉 비주얼 — 영화 트레일러 같은 인상' },
      { place: '제품 섹션', body: '디테일 줌 — 제품의 디테일이 점점 더 가까이' },
      { place: '포트폴리오 소개', body: '대표 작품 갤러리 — 줌인으로 강조' }
    ],
    tradeoff: 'scale 변화가 큰 이미지는 모바일에서 GPU 비용. will-change 힌트 필수.'
  },

  // 04 — pin-stack
  {
    id: 'pin-stack', num: '04', title: '핀 스택 (위로 쌓임)',
    summary: '이미지가 화면 아래에서 위로 슬라이드 인 + 이전 이미지는 그 위에 sticky로 머무름. 카드가 위로 쌓이는 인상.',
    demo: {
      bodyHTML: '<div class="fs-stack">\n        ' + fsImagesMarkup('fs-img-pin') + '\n        <div class="fs-overlay"></div>\n        ' + fsCapsMarkup() + '\n        ' + fsBarsMarkup() + '\n      </div>',
      css: FS_BASE_CSS + '.fs-img-pin { transform: translateY(100%); box-shadow: 0 -24px 60px -12px rgba(0,0,0,0.5); }\n.fs-img-pin[data-i="0"] { transform: translateY(0); }',
      script: 'var imgs = document.querySelectorAll(".fs-img");\n' + FS_COMMON_SCRIPT + '\nfunction applyReveal(p){\n  applyCommon(p);\n  imgs.forEach(function(s, i){\n    var pos = p * N - i;\n    var local = Math.max(0, Math.min(1, pos + 1));\n    s.style.transform = "translateY(" + (100 * (1 - local)) + "%)";\n    s.style.zIndex = i;\n  });\n}',
      height: 600, trackVh: 400
    },
    snippetHTML: '<img class="img"> × 4',
    snippetCSS: '.img { position: absolute; inset: 0; object-fit: cover; transform: translateY(100%); box-shadow: 0 -24px 60px -12px rgba(0,0,0,0.5); will-change: transform; }',
    snippetJS: 'document.querySelectorAll(".img").forEach(function(s, i){\n  var pos = p * N - i;\n  var local = Math.max(0, Math.min(1, pos + 1));\n  s.style.transform = "translateY(" + (100 * (1 - local)) + "%)";\n  s.style.zIndex = i;\n});',
    explain: '각 이미지는 처음에 translateY(100%)로 화면 아래에 위치. 자기 인덱스의 1단계 전부터 후까지의 진행률을 local progress(0~1)로 만들어 translateY 100% → 0%로 보간. zIndex는 i로 늘어나 새 이미지가 이전 이미지 위에 쌓임.',
    kv: [
      { label: '의존성', value: 'Vanilla JS' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '매핑', value: 'translateY = (1 - local) × 100%' },
      { label: 'Track 높이', value: 'N × 100vh' },
      { label: '쌓임', value: 'zIndex = i + box-shadow 위쪽' },
      { label: '시그니처', value: 'Apple AirPods Pro / Tobias van Schneider' }
    ],
    guide: '카드가 위로 쌓이는 깊이감. 슬라이드 3~5개. box-shadow를 위쪽으로 두면 새 이미지가 위에서 떨어지는 듯한 인상. 첫 이미지는 처음부터 보여야 하므로 [data-i="0"] 초기 translateY:0.',
    recommendations: [
      { place: '히어로 헤더', body: '제품 단계별 소개 — 이미지가 위로 쌓이며 스토리' },
      { place: '랜딩 페이지', body: '핵심 기능 카드 — 위로 쌓이는 효과' },
      { place: '제품 섹션', body: '제품 비교 — 슬라이드별 다른 제품이 위로 쌓임' },
      { place: '포트폴리오 소개', body: '프로젝트 케이스 — 한 작업당 한 카드' }
    ],
    tradeoff: '쌓이는 이미지의 box-shadow가 진해지면 페이지 톤이 무거워짐. 첫 이미지 초기 위치 보정 필요.'
  },

  // 05 — parallax-layer
  {
    id: 'parallax-layer', num: '05', title: '패럴랙스 레이어',
    summary: '이미지가 슬라이드 전환할 때 미세한 translateY로 패럴랙스 깊이감. 활성 이미지 외에도 인접 이미지가 동시에 다른 위치에서 보이며 카메라 무빙 인상.',
    demo: {
      bodyHTML: '<div class="fs-stack">\n        ' + fsImagesMarkup('fs-img-par') + '\n        <div class="fs-overlay"></div>\n        ' + fsCapsMarkup() + '\n        ' + fsBarsMarkup() + '\n      </div>',
      css: FS_BASE_CSS + '.fs-img-par { opacity: 0; transition: opacity 800ms ease-in-out; }\n.fs-img-par.is-on { opacity: 1; }',
      script: 'var imgs = document.querySelectorAll(".fs-img");\n' + FS_COMMON_SCRIPT + '\nfunction applyReveal(p){\n  var idx = applyCommon(p);\n  imgs.forEach(function(s, i){\n    s.classList.toggle("is-on", i === idx);\n    var pos = p * N - i;\n    var clamped = Math.max(-0.5, Math.min(0.5, pos));\n    s.style.transform = "scale(1.08) translateY(" + (clamped * -8) + "vh)";\n  });\n}',
      height: 600, trackVh: 400
    },
    snippetHTML: '<img class="img"> × 4',
    snippetCSS: '.img { position: absolute; inset: 0; object-fit: cover; opacity: 0; transition: opacity 800ms ease-in-out; will-change: opacity, transform; }\n.img.is-on { opacity: 1; }',
    snippetJS: 'imgs.forEach(function(s, i){\n  s.classList.toggle("is-on", i === idx);\n  var pos = p * N - i;\n  var clamped = Math.max(-0.5, Math.min(0.5, pos));\n  s.style.transform = "scale(1.08) translateY(" + (clamped * -8) + "vh)";\n});',
    explain: '활성 이미지는 opacity 1이지만, 모든 이미지에 진행률 기반의 미세 translateY(scale 1.08 + ±4vh)를 적용해 카메라가 살짝 이동하는 패럴랙스 깊이감. 단순 fade-stack보다 더 시네마틱.',
    kv: [
      { label: '의존성', value: 'Vanilla JS' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '매핑', value: 'opacity is-on + scale(1.08) translateY(clamped × -8vh)' },
      { label: 'Track 높이', value: 'N × 100vh' },
      { label: 'Fade', value: '800ms ease-in-out (느린 전환)' },
      { label: '시그니처', value: 'Apple iPad / Awwwards 시네마틱' }
    ],
    guide: '깊이감 패럴랙스가 핵심. scale 1.08로 약간의 줌 + ±4vh translateY로 카메라 무빙. 너무 큰 값은 어색함. will-change 힌트 필수.',
    recommendations: [
      { place: '히어로 헤더', body: '브랜드 풍경 시리즈 — 시네마틱 카메라 무빙' },
      { place: '랜딩 페이지', body: '제품 소개 인트로 — 미세한 깊이감' },
      { place: '제품 섹션', body: '브랜드 비전 — 분위기 조성' },
      { place: '포트폴리오 소개', body: 'About 섹션 — 디자이너의 세계관' }
    ],
    tradeoff: 'transform on multiple layers — GPU 비용. will-change 필수. prefers-reduced-motion에서 transform 비활성 권장.'
  },

  // 06 — 3d-rotate
  {
    id: '3d-rotate', num: '06', title: '3D 회전 전환',
    summary: 'perspective + rotateY로 이미지가 카드처럼 회전하며 전환. 진행률 × 90° × N으로 정면 → 측면 → 다음 이미지로.',
    demo: {
      bodyHTML: '<div class="fs-stack">\n        ' + fsImagesMarkup('fs-img-3d') + '\n        <div class="fs-overlay"></div>\n        ' + fsCapsMarkup() + '\n        ' + fsBarsMarkup() + '\n      </div>',
      css: FS_BASE_CSS + '.fs-stack { perspective: 1400px; }\n.fs-img-3d { transform-style: preserve-3d; backface-visibility: hidden; opacity: 0; transform: rotateY(90deg); }\n.fs-img-3d[data-i="0"] { opacity: 1; transform: rotateY(0); }',
      script: 'var imgs = document.querySelectorAll(".fs-img");\n' + FS_COMMON_SCRIPT + '\nfunction applyReveal(p){\n  applyCommon(p);\n  imgs.forEach(function(s, i){\n    var pos = p * N - i;\n    if (pos < -1 || pos > 1) { s.style.opacity = 0; return; }\n    var op = 1 - Math.min(1, Math.abs(pos));\n    var rot = pos * 90;\n    var tz = -Math.abs(pos) * 200;\n    s.style.opacity = op;\n    s.style.transform = "rotateY(" + rot + "deg) translateZ(" + tz + "px)";\n  });\n}',
      height: 600, trackVh: 400
    },
    snippetHTML: '<div class="stage" style="perspective:1400px">\n  <img class="img" data-i="0">×4\n</div>',
    snippetCSS: '.stage { perspective: 1400px; }\n.img { position: absolute; inset: 0; transform-style: preserve-3d; backface-visibility: hidden; will-change: transform, opacity; }',
    snippetJS: 'imgs.forEach(function(s, i){\n  var pos = p * N - i;\n  s.style.opacity = 1 - Math.min(1, Math.abs(pos));\n  s.style.transform = "rotateY(" + (pos * 90) + "deg) translateZ(" + (-Math.abs(pos) * 200) + "px)";\n});',
    explain: 'stage에 perspective:1400px로 3D 컨텍스트. 각 이미지의 local pos에 90°를 곱해 rotateY. pos=0(정면), pos=±0.5(45° 기울어짐), pos=±1(완전 측면). 동시에 translateZ로 뒤로 물러나는 깊이감.',
    kv: [
      { label: '의존성', value: 'Vanilla JS' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '매핑', value: 'rotateY = pos × 90deg, translateZ = -|pos| × 200px' },
      { label: 'Track 높이', value: 'N × 100vh' },
      { label: 'perspective', value: '1400px (stage 단위)' },
      { label: '시그니처', value: 'Stripe Universal / WebGL 3D 카드' }
    ],
    guide: '3D 회전은 강한 시각 임팩트. 슬라이드 3-4개 균형. perspective 1000~1600px이 자연스러움. transform-style:preserve-3d + backface-visibility:hidden 필수.',
    recommendations: [
      { place: '히어로 헤더', body: 'WebGL 라이브러리 / 디자인 도구 — 시그니처 인터랙션' },
      { place: '랜딩 페이지', body: '컨퍼런스 / 이벤트 — 영화적 임팩트' },
      { place: '제품 섹션', body: '카드 형태 제품 — 회전하며 디테일' },
      { place: '포트폴리오 소개', body: '실험적 작품 갤러리' }
    ],
    tradeoff: 'GPU 비용 매우 큼. 모바일 60fps 어려움. 사용자 어지러움 가능 — prefers-reduced-motion에서 단순 fade로 fallback 필수.'
  },

  // 07 — scroll-snap
  {
    id: 'scroll-snap', num: '07', title: 'CSS 스크롤 스냅',
    summary: 'JS 매핑 없이 CSS scroll-snap-type만으로 이미지 슬라이드가 viewport에 snap. 사용자가 스크롤하면 한 슬라이드 단위로 딱 멈춤. 가장 가벼운 풀스크린 갤러리. 캡션·progress bar는 IntersectionObserver로 활성 인덱스 동기화.',
    demo: {
      bodyHTML: '<div class="fs-snap">\n        ' + FS_SLIDES.map(function (s, i) { return '<section class="fs-snap-slide" data-i="' + i + '"><img src="' + s.img + '" alt="' + s.name + '"></section>'; }).join('\n        ') + '\n      </div>\n      <div class="fs-overlay"></div>\n      ' + fsCapsMarkup() + '\n      ' + fsBarsMarkup(),
      css: FS_BASE_CSS + '.fs-snap { position: absolute; inset: 0; overflow-y: scroll; scroll-snap-type: y mandatory; scroll-behavior: smooth; scrollbar-width: none; }\n.fs-snap::-webkit-scrollbar { display: none; }\n.fs-snap-slide { width: 100%; height: 100%; scroll-snap-align: start; scroll-snap-stop: always; position: relative; }\n.fs-snap-slide img { width: 100%; height: 100%; object-fit: cover; display: block; }',
      script: 'var snap = document.querySelector(".fs-snap");\nvar slides = document.querySelectorAll(".fs-snap-slide");\nvar caps = document.querySelectorAll(".fs-cap");\nvar bars = document.querySelectorAll(".fs-bar");\nvar fills = document.querySelectorAll(".fs-bar-fill");\nvar N = ' + N + ';\nfunction update(){\n  var idx = Math.round(snap.scrollTop / snap.clientHeight);\n  idx = Math.max(0, Math.min(N - 1, idx));\n  caps.forEach(function(c, i){ c.classList.toggle("is-on", i === idx); });\n  bars.forEach(function(b, i){\n    b.classList.toggle("is-active", i === idx);\n    b.classList.toggle("is-past", i < idx);\n  });\n  fills.forEach(function(f, i){ f.style.transform = "scaleX(" + (i < idx ? 1 : i === idx ? 1 : 0) + ")"; });\n}\nsnap.addEventListener("scroll", update, { passive: true });\nupdate();\nfunction applyReveal(){}',
      height: 600, trackVh: 100,
      isSnap: true
    },
    snippetHTML: '<div class="snap">\n  <section class="slide"><img></section> × 4\n</div>',
    snippetCSS: '.snap { height: 100vh; overflow-y: scroll; scroll-snap-type: y mandatory; }\n.slide { height: 100vh; scroll-snap-align: start; scroll-snap-stop: always; }',
    snippetJS: 'snap.addEventListener("scroll", function(){\n  var idx = Math.round(snap.scrollTop / snap.clientHeight);\n  /* idx에 따라 캡션·bar 토글 */\n});',
    explain: 'CSS scroll-snap-type:y mandatory가 핵심. 사용자 스크롤 시 가장 가까운 .slide 시작점에 딱 멈춤. scroll-snap-stop:always로 한 번에 한 슬라이드씩만 진행. JS는 활성 인덱스 추적해서 캡션·progress bar 토글하는 데에만 사용. iframe 안 자체 스크롤 컨테이너라 부모 ↻ 다시 보기와는 별개.',
    kv: [
      { label: '의존성', value: 'CSS scroll-snap + 미니 JS' },
      { label: '트리거', value: 'native scroll (브라우저 snap)' },
      { label: '매핑', value: 'scroll-snap-type:y mandatory + scroll-snap-stop:always' },
      { label: 'Track 높이', value: '100vh × N (각 슬라이드)' },
      { label: 'JS 비용', value: '최소 (scrollTop 측정만)' },
      { label: '시그니처', value: 'iOS 사진앱 / Instagram Stories' }
    ],
    guide: '가장 가벼운 풀스크린 갤러리. JS 매핑 거의 없이 CSS만으로 snap. 슬라이드 사이 transition은 없음(즉시 snap) — 더 부드러운 전환이 필요하면 fade-stack 사용. 모바일 swipe도 native 동작.',
    recommendations: [
      { place: '히어로 헤더', body: '단순한 풀스크린 갤러리 — JS 비용 최소' },
      { place: '랜딩 페이지', body: '제품 시리즈 — 빠르고 가볍게' },
      { place: '제품 섹션', body: '제품 상세 이미지 갤러리' },
      { place: '포트폴리오 소개', body: '간단한 작품 카탈로그' }
    ],
    tradeoff: '슬라이드 간 transition 없어 거친 느낌. progress bar는 활성/완료 상태만(local progress 없음). iOS Safari scroll-snap 동작 거칠 수 있어 검수 필수.'
  },

  // 08 — clip-reveal
  {
    id: 'clip-reveal', num: '08', title: 'Clip-path 리빌',
    summary: '다음 이미지가 위에서 아래로 clip-path inset으로 reveal. 이미지가 커튼처럼 내려오는 인상.',
    demo: {
      bodyHTML: '<div class="fs-stack">\n        ' + fsImagesMarkup('fs-img-clip') + '\n        <div class="fs-overlay"></div>\n        ' + fsCapsMarkup() + '\n        ' + fsBarsMarkup() + '\n      </div>',
      css: FS_BASE_CSS + '.fs-img-clip { clip-path: inset(100% 0 0 0); }\n.fs-img-clip[data-i="0"] { clip-path: inset(0); }',
      script: 'var imgs = document.querySelectorAll(".fs-img");\n' + FS_COMMON_SCRIPT + '\nfunction applyReveal(p){\n  applyCommon(p);\n  imgs.forEach(function(s, i){\n    if (i === 0) { s.style.clipPath = "inset(0 0 0 0)"; s.style.zIndex = 0; return; }\n    var pos = p * N - i + 1;\n    var inset = pos <= 0 ? 100 : pos >= 1 ? 0 : (1 - pos) * 100;\n    s.style.clipPath = "inset(" + inset + "% 0 0 0)";\n    s.style.zIndex = i;\n  });\n}',
      height: 600, trackVh: 400
    },
    snippetHTML: '<img class="img" data-i="0"> × 4',
    snippetCSS: '.img { position: absolute; inset: 0; object-fit: cover; clip-path: inset(100% 0 0 0); will-change: clip-path; }\n.img[data-i="0"] { clip-path: inset(0); }',
    snippetJS: 'imgs.forEach(function(s, i){\n  if (i === 0) return;\n  var pos = p * N - i + 1;\n  var inset = pos <= 0 ? 100 : pos >= 1 ? 0 : (1 - pos) * 100;\n  s.style.clipPath = "inset(" + inset + "% 0 0 0)";\n  s.style.zIndex = i;\n});',
    explain: '첫 이미지는 처음부터 보임 (clip-path: inset(0)). 두 번째부터는 inset(100% 0 0 0)으로 위에서부터 잘려 안 보임. 진행률이 i 인덱스에 가까워질수록 inset이 100% → 0%로 줄어들어 위에서 아래로 reveal. 커튼이 내려오는 인상.',
    kv: [
      { label: '의존성', value: 'Vanilla JS' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '매핑', value: 'clip-path inset top = (1 - local) × 100%' },
      { label: 'Track 높이', value: 'N × 100vh' },
      { label: '핵심', value: 'clip-path inset (GPU 가속)' },
      { label: '시그니처', value: 'Apple iPad / 시네마틱 reveal' }
    ],
    guide: '커튼이 내려오는 시네마틱 reveal. 슬라이드 3-4개 적정. clip-path 방향은 inset(top right bottom left) — 가로 reveal은 inset(0 100% 0 0). zIndex 관리 필수.',
    recommendations: [
      { place: '히어로 헤더', body: '시네마틱 인트로 — 영화 오프닝 reveal' },
      { place: '랜딩 페이지', body: '챕터별 전환 — 한 챕터에서 다음으로' },
      { place: '제품 섹션', body: '비포/애프터 비교 — 마스크가 내려옴' },
      { place: '포트폴리오 소개', body: '작품 시리즈 — 한 작품에서 다음으로 커튼' }
    ],
    tradeoff: 'clip-path는 모든 모던 브라우저 지원, 모바일 성능 양호. 슬라이드 진입 방향은 한정적(top/bottom/left/right). 더 복잡한 마스크는 SVG mask로.'
  },

  // 09 — scale-handoff
  {
    id: 'scale-handoff', num: '09', title: '스케일 핸드오프',
    summary: '한 이미지가 scale 1→1.1로 커지면서 사라지고, 다음 이미지가 0.9→1로 커지면서 등장. 두 이미지가 부드럽게 교체.',
    demo: {
      bodyHTML: '<div class="fs-stack">\n        ' + fsImagesMarkup('fs-img-handoff') + '\n        <div class="fs-overlay"></div>\n        ' + fsCapsMarkup() + '\n        ' + fsBarsMarkup() + '\n      </div>',
      css: FS_BASE_CSS + '.fs-img-handoff { opacity: 0; transform: scale(0.9); }\n.fs-img-handoff[data-i="0"] { opacity: 1; transform: scale(1); }',
      script: 'var imgs = document.querySelectorAll(".fs-img");\n' + FS_COMMON_SCRIPT + '\nfunction applyReveal(p){\n  applyCommon(p);\n  imgs.forEach(function(s, i){\n    var pos = p * N - i;\n    var abs = Math.abs(pos);\n    if (abs > 1) { s.style.opacity = 0; s.style.transform = "scale(" + (1 + pos * 0.1) + ")"; return; }\n    s.style.opacity = 1 - abs;\n    var scale = 0.9 + (1 - abs) * 0.1 + Math.max(0, pos) * 0.1;\n    s.style.transform = "scale(" + scale + ")";\n  });\n}',
      height: 600, trackVh: 400
    },
    snippetHTML: '<img class="img" data-i="0"> × 4',
    snippetCSS: '.img { position: absolute; inset: 0; object-fit: cover; opacity: 0; transform: scale(0.9); will-change: transform, opacity; }',
    snippetJS: 'imgs.forEach(function(s, i){\n  var pos = p * N - i;\n  s.style.opacity = 1 - Math.abs(pos);\n  s.style.transform = "scale(" + (0.9 + (1 - Math.abs(pos)) * 0.1 + Math.max(0, pos) * 0.1) + ")";\n});',
    explain: '각 이미지의 local pos = p×N - i. 자기 인덱스(pos=0)에서 scale 1 + opacity 1로 가장 또렷. ±1로 멀어질수록 opacity 0 + scale 0.9 또는 1.1. 두 인접 이미지가 동시에 보이면서 부드럽게 교체.',
    kv: [
      { label: '의존성', value: 'Vanilla JS' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '매핑', value: 'opacity = 1 - |pos|, scale = 0.9 → 1 → 1.1' },
      { label: 'Track 높이', value: 'N × 100vh' },
      { label: '이징', value: 'linear (사용자 제어)' },
      { label: '시그니처', value: 'Apple Vision Pro / 부드러운 갤러리' }
    ],
    guide: '부드럽고 가독성 좋은 전환. zoom-into보다 scale 변화 작음(0.9~1.1). 슬라이드 3-5개. 두 이미지가 동시에 보이는 구간에서 자연스러운 교체.',
    recommendations: [
      { place: '히어로 헤더', body: 'SaaS 제품 소개 — 부드럽고 신뢰감' },
      { place: '랜딩 페이지', body: '회사 가치 시리즈 — 부드러운 전환' },
      { place: '제품 섹션', body: '제품 변형 비교' },
      { place: '포트폴리오 소개', body: '작품 시리즈 — 가독성 좋게' }
    ],
    tradeoff: '변화가 작아 임팩트는 약함 — 강한 인상이 필요하면 zoom-into. 두 이미지 동시 렌더로 약간의 GPU 비용.'
  },

  // 10 — caption-slide
  {
    id: 'caption-slide', num: '10', title: '캡션 슬라이드',
    summary: '배경 이미지는 천천히 fade(1.4s) + 캡션·progress bar는 즉시 전환. 영상이 핵심인 컨텍스트의 시그니처. 비디오/이미지의 분위기를 유지하면서 정보만 흐름.',
    demo: {
      bodyHTML: '<div class="fs-stack">\n        ' + fsImagesMarkup('fs-img-cap') + '\n        <div class="fs-overlay fs-overlay-cap"></div>\n        ' + fsCapsMarkup() + '\n        ' + fsBarsMarkup() + '\n      </div>',
      css: FS_BASE_CSS + '.fs-img-cap { opacity: 0; transition: opacity 1400ms ease-in-out, filter 1400ms ease-in-out; filter: saturate(1.1) brightness(0.95); }\n.fs-img-cap.is-on { opacity: 1; }\n.fs-overlay-cap { background: linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.65) 100%); }',
      script: 'var imgs = document.querySelectorAll(".fs-img");\n' + FS_COMMON_SCRIPT + '\nfunction applyReveal(p){\n  var idx = applyCommon(p);\n  imgs.forEach(function(s, i){\n    s.classList.toggle("is-on", i === idx);\n    s.style.filter = "saturate(" + (1.05 + p * 0.15) + ") brightness(" + (0.95 - p * 0.05) + ")";\n  });\n}',
      height: 600, trackVh: 400
    },
    snippetHTML: '<img class="img"> × 4 (배경)\n<div class="caps"> × 4 (캡션, 빠른 전환)\n<div class="bars"> × 4 (progress bar)',
    snippetCSS: '.img { position: absolute; inset: 0; object-fit: cover; opacity: 0; transition: opacity 1400ms ease-in-out, filter 1400ms ease-in-out; filter: saturate(1.1) brightness(0.95); }\n.img.is-on { opacity: 1; }',
    snippetJS: 'imgs.forEach(function(s, i){\n  s.classList.toggle("is-on", i === idx);\n  /* 배경은 천천히, 캡션·bar는 즉시 */\n});',
    explain: '배경 이미지는 1.4s ease-in-out fade로 매우 천천히 전환 + 미세 filter 변화(saturate, brightness)로 분위기 유지. 캡션·progress bar는 표준(500ms ease-out)으로 즉시 전환. 배경의 정적인 인상과 캡션의 흐름이 대비.',
    kv: [
      { label: '의존성', value: 'Vanilla JS' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '매핑', value: '배경 fade 1.4s + filter 미세 변화 + 캡션 500ms' },
      { label: 'Track 높이', value: 'N × 100vh' },
      { label: 'Fade 속도', value: '배경 1400ms vs 캡션 500ms' },
      { label: '시그니처', value: 'Apple 제품 디테일 / 비디오 캡션' }
    ],
    guide: '배경 이미지/비디오가 핵심일 때 — 배경은 천천히 + 캡션·bar만 빠른 슬라이드. 한 영상에 N개 챕터 캡션 같은 컨텍스트. 짧은 캡션(40자 이내) 권장.',
    recommendations: [
      { place: '히어로 헤더', body: '브랜드 영상 + 챕터 캡션 — 영상은 그대로, 텍스트만 흐름' },
      { place: '랜딩 페이지', body: '제품 비디오 + 기능 캡션 시리즈' },
      { place: '제품 섹션', body: '제품 이미지 + 스펙 챕터별 캡션' },
      { place: '포트폴리오 소개', body: '대표 작품 비디오 + 진행 단계 캡션' }
    ],
    tradeoff: '배경 fade가 천천히이라 시각 임팩트 약함 — 비디오/움직임이 있는 배경이 더 잘 어울림. 캡션 N개 모두 같은 자리에 쌓이므로 z-stacking 주의.'
  }
];

// ============ Standalone demo HTML 빌더 ============

function buildDemoHTML(p) {
  var trackVh = p.demo.trackVh || (N * 100);
  if (p.demo.isSnap) return buildSnapDemoHTML(p);

  return '<!DOCTYPE html>\n'
    + '<html lang="ko">\n'
    + '<head>\n'
    + '  <meta charset="UTF-8">\n'
    + '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
    + '  <title>' + p.num + '. ' + p.title + ' — Full-screen Scroll Demo</title>\n'
    + '  <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable-dynamic-subset.min.css" rel="stylesheet">\n'
    + '  <style>\n'
    + '    * { box-sizing: border-box; }\n'
    + '    html, body { margin: 0; padding: 0; }\n'
    + '    body { background: #000; color: #fff; font-family: "Pretendard Variable","Pretendard",sans-serif; overflow-x: hidden; -webkit-font-smoothing: antialiased; }\n'
    + '    .demo-controls { position: fixed; top: 16px; left: 16px; display: inline-flex; align-items: center; gap: 10px; z-index: 100; }\n'
    + '    .demo-reset { font: 600 11px/1 "Pretendard Variable","Pretendard",sans-serif; color: rgba(255,255,255,0.72); background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.16); border-radius: 999px; padding: 8px 14px; cursor: pointer; transition: color 160ms, background 160ms; }\n'
    + '    .demo-reset:hover { color: #fff; background: rgba(255,255,255,0.14); }\n'
    + '    .demo-label { font: 500 10px/1 "Pretendard Variable","Pretendard",sans-serif; color: rgba(255,255,255,0.4); letter-spacing: 0.14em; text-transform: uppercase; }\n'
    + '    .demo-hint { position: fixed; right: 16px; bottom: 24px; font: 500 10px/1 "Pretendard Variable","Pretendard",sans-serif; color: rgba(255,255,255,0.45); letter-spacing: 0.18em; text-transform: uppercase; z-index: 100; animation: hint-bounce 1.6s ease-in-out infinite; }\n'
    + '    @keyframes hint-bounce { 0%, 100% { transform: translateY(0); opacity: 0.45; } 50% { transform: translateY(4px); opacity: 0.85; } }\n'
    + '    .demo-progress { position: fixed; bottom: 0; left: 0; right: 0; height: 2px; background: rgba(255,255,255,0.06); z-index: 100; }\n'
    + '    .demo-progress > div { height: 100%; background: #fff; width: 0; transition: width 60ms linear; }\n'
    + '    .scroll-track { min-height: ' + trackVh + 'vh; position: relative; }\n'
    + '    .sticky-stage { position: sticky; top: 0; height: 100vh; overflow: hidden; }\n'
    + '    ' + p.demo.css.replace(/\n/g, '\n    ') + '\n'
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
    + '  <div class="scroll-track">\n'
    + '    <div class="sticky-stage">\n'
    + '      ' + p.demo.bodyHTML.replace(/\n/g, '\n      ') + '\n'
    + '    </div>\n'
    + '  </div>\n'
    + '\n'
    + '  <script>\n'
    + '    (function(){\n'
    + '      var track = document.querySelector(".scroll-track");\n'
    + '      var progressFill = document.querySelector(".demo-progress > div");\n'
    + '      function calc(){\n'
    + '        var rect = track.getBoundingClientRect();\n'
    + '        var max = Math.max(1, rect.height - window.innerHeight);\n'
    + '        return Math.max(0, Math.min(1, -rect.top / max));\n'
    + '      }\n'
    + '      ' + p.demo.script.replace(/\n/g, '\n      ') + '\n'
    + '      function tick(){\n'
    + '        var p = calc();\n'
    + '        progressFill.style.width = (p * 100) + "%";\n'
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

// scroll-snap 전용 보일러플레이트 — 자체 컨테이너 scroll
function buildSnapDemoHTML(p) {
  return '<!DOCTYPE html>\n'
    + '<html lang="ko">\n'
    + '<head>\n'
    + '  <meta charset="UTF-8">\n'
    + '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
    + '  <title>' + p.num + '. ' + p.title + '</title>\n'
    + '  <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable-dynamic-subset.min.css" rel="stylesheet">\n'
    + '  <style>\n'
    + '    * { box-sizing: border-box; }\n'
    + '    html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; }\n'
    + '    body { background: #000; color: #fff; font-family: "Pretendard Variable","Pretendard",sans-serif; -webkit-font-smoothing: antialiased; }\n'
    + '    .demo-controls { position: fixed; top: 16px; left: 16px; display: inline-flex; gap: 10px; z-index: 200; }\n'
    + '    .demo-label { font: 500 10px/1 "Pretendard Variable","Pretendard",sans-serif; color: rgba(255,255,255,0.4); letter-spacing: 0.14em; text-transform: uppercase; padding: 8px 0; }\n'
    + '    .demo-hint { position: fixed; right: 16px; bottom: 24px; font: 500 10px/1 "Pretendard Variable","Pretendard",sans-serif; color: rgba(255,255,255,0.45); letter-spacing: 0.18em; text-transform: uppercase; z-index: 200; }\n'
    + '    .sticky-stage { position: relative; width: 100%; height: 100vh; overflow: hidden; }\n'
    + '    ' + p.demo.css.replace(/\n/g, '\n    ') + '\n'
    + '  </style>\n'
    + '</head>\n'
    + '<body>\n'
    + '  <div class="demo-controls"><span class="demo-label">' + p.num + ' · ' + p.title + '</span></div>\n'
    + '  <div class="demo-hint">SCROLL ↓ (스냅)</div>\n'
    + '  <div class="sticky-stage">\n'
    + '    ' + p.demo.bodyHTML.replace(/\n/g, '\n    ') + '\n'
    + '  </div>\n'
    + '  <script>\n'
    + '    (function(){\n'
    + '      ' + p.demo.script.replace(/\n/g, '\n      ') + '\n'
    + '    })();\n'
    + '  </script>\n'
    + '</body>\n'
    + '</html>\n';
}

// ============ 분석 보고서 블록 빌더 ============

function buildPatternSection(p) {
  return {
    title: p.num + '. ' + p.title,
    blocks: [
      { type: 'text', value: p.summary },
      { type: 'heading', value: '라이브 데모' },
      {
        type: 'component',
        embed: 'demos/full-screen-scroll/' + p.id + '.html',
        embedHeight: p.demo.height || 540,
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
        items: p.recommendations.map(r => ({ label: r.place, tag: '', desc: r.body }))
      },
      { type: 'note', value: '트레이드오프 — ' + p.tradeoff }
    ]
  };
}

function buildOverview() {
  const indexItems = PATTERNS.map(p => ({
    label: p.num + '. ' + p.title,
    tag: p.kv.find(k => k.label === '의존성')?.value || '',
    desc: p.summary
  }));

  return {
    title: '00. 카테고리 개요',
    blocks: [
      { type: 'heading', value: 'Full-screen Scroll — 패턴 카탈로그 v2 (통일 스타일)' },
      { type: 'text', value: CATEGORY.summary },
      { type: 'heading', value: '10 패턴 인덱스' },
      { type: 'structure', items: indexItems },
      { type: 'heading', value: '공통 디자인 토큰 + scroll 모델' },
      {
        type: 'kv', columns: 2, items: [
          { label: '폰트', value: 'Pretendard Variable 단일 (헤딩 500, 본문 300, 라벨 500)' },
          { label: '배경 / 본문 색', value: '#000 / #ffffff (다크 풀스크린)' },
          { label: 'Scroll 모델', value: '.scroll-track N×100vh + .sticky-stage 100vh' },
          { label: '진행률 계산', value: 'p = clamp(0, -rect.top / (rect.height - innerHeight), 1)' },
          { label: '슬라이드 인덱스', value: 'activeIndex = floor(p × N), local = (p - i/N) × N' },
          { label: '캡션 위치', value: '좌측 하단 60px padding · 활성 슬라이드만 fade-in (500ms)' },
          { label: 'Progress bar', value: '하단 60px padding · 4 균등 flex · 활성 인덱스 흰색' },
          { label: '슬라이드 데이터', value: '4종 고정 (01 Intuition / 02 Touch / 03 Glow / 04 Pulse)' }
        ]
      },
      { type: 'heading', value: '읽기 가이드' },
      {
        type: 'structure', items: [
          { label: '라이브 데모', tag: 'IFRAME', desc: 'demos/full-screen-scroll/{pattern}.html — 동일 4 이미지·캡션·progress bar 위에 패턴별 인터랙션만 다름' },
          { label: '작동 원리', tag: 'HOW', desc: '진행률 → 이미지 변환(transform/opacity/clip-path) 매핑' },
          { label: '정량 메타', tag: 'KV', desc: '의존성 / 매핑 함수 / Track 높이 / 시그니처' },
          { label: '코드 스니펫', tag: 'CODE', desc: 'HTML / CSS / JS — 패턴별 핵심 (보일러플레이트 제외)' },
          { label: '사용 가이드', tag: 'GUIDE', desc: '슬라이드 수·track 높이·접근성' },
          { label: '활용 추천', tag: 'PLACES', desc: '히어로 / 랜딩 / 제품 / 포트폴리오' },
          { label: '트레이드오프', tag: 'NOTE', desc: '성능·접근성·권장 사용처' }
        ]
      },
      {
        type: 'note',
        value: '참고 자료: Framer 마켓플레이스 Scroll Slides (Artem Kostenko, ' + CATEGORY.url + '). 모든 패턴이 동일한 4 이미지(framerusercontent.com) + 동일 캡션(Sensitivity / Tactile / Illumination / Living rhythm) + 동일 progress bar(01 Intuition / 02 Touch / 03 Glow / 04 Pulse) 구조 위에 각자의 인터랙션 변환만 다르게 정의. Pretendard Variable 단일 폰트.'
      }
    ]
  };
}

// ============ 메인 ============
function main() {
  mkdirSync(DEMO_DIR, { recursive: true });
  for (const p of PATTERNS) {
    writeFileSync(join(DEMO_DIR, p.id + '.html'), buildDemoHTML(p), 'utf-8');
    console.log('✓ demos/full-screen-scroll/' + p.id + '.html');
  }
  const sections = { overview: buildOverview() };
  for (const p of PATTERNS) sections[p.id] = buildPatternSection(p);
  const analysis = {
    id: CATEGORY.id,
    title: CATEGORY.title,
    type: CATEGORY.type,
    url: CATEGORY.url,
    date: CATEGORY.date,
    summary: CATEGORY.summary,
    patternCount: PATTERNS.length,
    sections
  };
  mkdirSync(ANALYSIS_DIR, { recursive: true });
  writeFileSync(ANALYSIS_FILE, JSON.stringify(analysis, null, 2), 'utf-8');
  console.log('✓ analyses/full-screen-scroll/analysis.json');
  console.log('  ' + PATTERNS.length + ' patterns + 1 overview = ' + (PATTERNS.length + 1) + ' sections');
  const totalBlocks = Object.values(sections).reduce((acc, s) => acc + s.blocks.length, 0);
  console.log('  ' + totalBlocks + ' blocks total');
}

main();
