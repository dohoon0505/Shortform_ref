#!/usr/bin/env node
/**
 * Interaction Lab — Category Generator: 스크롤 패스 드로잉 (v1)
 *
 * 핵심 모델:
 * - 엄격한 scroll-pin: .scroll-track 240vh + .sticky-stage 100vh + progress bar + SCROLL ↓ hint
 * - 각 패턴은 applyReveal(progress) 함수만 정의 — path.getTotalLength() 기반
 *   stroke-dasharray / stroke-dashoffset을 progress 0~1에 1:1 inline 매핑
 * - 자동 재생(setTimeout / setInterval / IntersectionObserver) 절대 금지
 * - 모든 SVG는 인라인 자작 (외부 의존성: Pretendard CDN 1개)
 *
 * Usage: node scripts/generate-scroll-path-draw.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ANALYSIS_DIR = join(ROOT, 'analyses', 'scroll-path-draw');
const ANALYSIS_FILE = join(ANALYSIS_DIR, 'analysis.json');
const DEMO_DIR = join(ROOT, 'demos', 'scroll-path-draw');

const CATEGORY = {
  id: 'scroll-path-draw',
  title: '스크롤 패스 드로잉',
  type: 'category',
  date: '2026-06-10',
  url: 'https://tympanus.net/codrops/',
  summary: 'SVG 선이 스크롤 진행률만큼 펜으로 그리듯 완성되는 10가지 패턴. stroke-dashoffset을 progress 0~1에 1:1 매핑 — 온보딩·기능 다이어그램·타임라인에 즉시 투입 가능한 고급 스토리텔링 질감.'
};

const FONT_STACK = '"Pretendard Variable","Pretendard",system-ui,sans-serif';

// ============ 10 패턴 정의 ============
//
// 각 패턴은 standalone 페이지로 작성 (demos/scroll-path-draw/{id}.html).
// 공통 보일러플레이트 (sticky track + scroll handler)는 buildDemoHTML이 wrap.
// 각 패턴은:
//   - demo.css       — 패턴별 CSS
//   - demo.bodyHTML  — .sticky-stage 안에 들어갈 마크업 (인라인 SVG 자작)
//   - demo.script    — applyReveal(p) 함수 정의 + 필요한 init 변수
//   - demo.height    — iframe 임베드 높이

const PATTERNS = [
  // ───────────────────────────── 1. line-trace (시그니처)
  {
    id: 'line-trace',
    num: '01',
    title: '라인 트레이스',
    summary: '카테고리의 시그니처 패턴. 단일 곡선 패스의 stroke-dashoffset을 스크롤 진행률에 1:1 매핑 — 펜이 종이 위를 지나가듯 선이 그려지고, 선이 끝나갈 무렵 한국어 캡션이 동반 페이드 인된다.',
    demo: {
      bodyHTML: `<div class="trace-wrap">
  <svg class="trace-svg" viewBox="0 0 800 360" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path class="trace-bg" d="M 30 300 C 140 60 300 60 400 200 C 480 310 560 320 640 220 C 700 145 740 110 775 60"/>
    <path class="trace-path" d="M 30 300 C 140 60 300 60 400 200 C 480 310 560 320 640 220 C 700 145 740 110 775 60"/>
  </svg>
  <p class="trace-caption">한 번의 스크롤이, 한 획이 됩니다.</p>
</div>`,
      css: `.trace-wrap { width: min(800px, 88vw); display: flex; flex-direction: column; align-items: center; gap: 28px; }
.trace-svg { width: 100%; height: auto; display: block; }
.trace-bg { stroke: rgba(255,255,255,0.1); stroke-width: 3; stroke-linecap: round; }
.trace-path { stroke: #fff; stroke-width: 3; stroke-linecap: round; }
.trace-caption { font: 600 24px/1.5 ${FONT_STACK}; color: #fff; margin: 0; opacity: 0; letter-spacing: -0.01em; }`,
      script: `var path = document.querySelector(".trace-path");
var caption = document.querySelector(".trace-caption");
var L = path.getTotalLength();
path.style.strokeDasharray = L + " " + L;
path.style.strokeDashoffset = L;
function clamp01(x){ return Math.max(0, Math.min(1, x)); }
function applyReveal(p){
  var drawP = clamp01((p - 0.05) / 0.7);
  path.style.strokeDashoffset = L * (1 - drawP);
  var capP = clamp01((p - 0.62) / 0.28);
  caption.style.opacity = capP;
  caption.style.transform = "translateY(" + (16 * (1 - capP)) + "px)";
}`,
      height: 560
    },
    snippetHTML: `<div class="scroll-track">
  <div class="sticky-stage">
    <svg viewBox="0 0 800 360" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path class="trace-path" d="M 30 300 C 140 60 300 60 400 200 C 480 310 560 320 640 220"
            stroke="#fff" stroke-width="3" stroke-linecap="round"/>
    </svg>
    <p class="trace-caption">한 번의 스크롤이, 한 획이 됩니다.</p>
  </div>
</div>`,
    snippetCSS: `.scroll-track { min-height: 240vh; }
.sticky-stage { position: sticky; top: 0; height: 100vh; display: flex; align-items: center; justify-content: center; }
.trace-path { fill: none; }
.trace-caption { opacity: 0; }`,
    snippetJS: `var path = document.querySelector(".trace-path");
var caption = document.querySelector(".trace-caption");
var track = document.querySelector(".scroll-track");
var L = path.getTotalLength();
path.style.strokeDasharray = L + " " + L;
path.style.strokeDashoffset = L;
function clamp01(x){ return Math.max(0, Math.min(1, x)); }
window.addEventListener("scroll", function(){
  var rect = track.getBoundingClientRect();
  var p = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));
  path.style.strokeDashoffset = L * (1 - clamp01((p - 0.05) / 0.7));
  caption.style.opacity = clamp01((p - 0.62) / 0.28);
}, { passive: true });`,
    explain: 'SVG 패스의 전체 길이 L을 path.getTotalLength()로 측정한 뒤 stroke-dasharray를 "L L"로 설정하면 선 전체가 하나의 대시가 된다. stroke-dashoffset을 L(완전히 숨김)에서 0(완전히 그려짐)으로 progress에 1:1 매핑하면 펜으로 그리는 듯한 효과. 배경에 가이드선(rgba 0.1)을 깔아 "어디로 그려질지" 미리 보여주는 것이 Codrops 계열 데모의 시그니처 디테일. 캡션은 선이 80% 이상 그려진 [0.62, 0.9] 구간에서 opacity·translateY로 동반 페이드 인.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (라이브러리 0)' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '매핑', value: 'dashoffset = L × (1 − drawP) — 패스 길이 1:1' },
      { label: '매핑 구간', value: '선 [0.05, 0.75] · 캡션 [0.62, 0.9]' },
      { label: 'Track 높이', value: '240vh (스크롤 공간)' },
      { label: '권장 패스', value: '곡선 1개 (길이 1000~2500px 단위)' }
    ],
    guide: 'getTotalLength()는 viewBox 좌표계 기준이므로 SVG가 반응형으로 축소돼도 매핑이 깨지지 않는다. dasharray를 "L L" 두 값으로 명시하면 일부 브라우저의 단일 값 해석 차이를 피할 수 있다. 곡선이 너무 짧으면(<500) 스크롤 거리 대비 변화가 둔해 보이므로 1000px 이상의 유려한 곡선 권장. 가이드선은 0.08~0.12 투명도가 적당 — 너무 진하면 완성의 쾌감이 줄어든다. prefers-reduced-motion에서는 dashoffset 0으로 고정해 완성 상태를 즉시 표시.',
    recommendations: [
      { place: '히어로 헤더', body: '브랜드 슬로건 뒤에서 장식 곡선이 첫 스크롤에 그려지며 시선을 아래로 끌어내림 — 수공예·에디토리얼 톤의 사이트 오프닝' },
      { place: '랜딩 페이지', body: '섹션과 섹션을 잇는 구분선이 스크롤을 따라 그려져 "이야기가 이어진다"는 인상 형성' },
      { place: '제품 섹션', body: '제품 사진 주변을 감싸는 강조 곡선 — 사용자가 스크롤할수록 제품이 "밑줄 쳐지는" 효과' },
      { place: '포트폴리오 소개', body: 'About 페이지 도입부의 손그림 풍 장식 획. 디자이너의 드로잉 감성을 코드로 전달' }
    ],
    tradeoff: 'stroke-dashoffset 갱신은 reflow 없이 paint만 발생해 저렴하지만, stroke-width가 굵고 패스가 화면 전체를 덮으면 paint 면적이 커진다. 데코레이션 목적이므로 SVG에 aria-hidden="true" 권장. prefers-reduced-motion에서는 완성 상태 고정.'
  },

  // ───────────────────────────── 2. signature-draw
  {
    id: 'signature-draw',
    num: '02',
    title: '시그니처 드로잉',
    summary: '손글씨 서명풍 멀티 패스가 획 순서대로 그려진다. 각 획의 길이를 합산해 전체 대비 비례 구간으로 분할 — 긴 획은 천천히, 짧은 획은 빠르게, 실제 펜 속도처럼 배분된다.',
    demo: {
      bodyHTML: `<div class="sig-wrap">
  <svg class="sig-svg" viewBox="0 0 720 380" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path class="sig-path" d="M 90 248 C 70 168 132 92 182 118 C 232 144 176 252 124 276 C 96 288 98 264 134 248 C 196 220 268 196 330 184"/>
    <path class="sig-path" d="M 352 128 C 326 184 314 244 344 250 C 372 256 402 204 398 172 C 395 150 376 158 380 184 C 386 220 422 238 466 208"/>
    <path class="sig-path" d="M 498 116 C 486 168 478 218 488 246 C 496 268 528 248 556 202"/>
    <path class="sig-path" d="M 96 318 C 240 344 460 336 636 296"/>
  </svg>
  <p class="sig-caption">스크롤이 곧 펜 끝의 속도가 됩니다</p>
</div>`,
      css: `.sig-wrap { width: min(720px, 88vw); display: flex; flex-direction: column; align-items: center; gap: 20px; }
.sig-svg { width: 100%; height: auto; display: block; }
.sig-path { stroke: #fff; stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; }
.sig-caption { font: 500 15px/1.6 ${FONT_STACK}; color: rgba(255,255,255,0.45); margin: 0; letter-spacing: 0.02em; }`,
      script: `var paths = Array.prototype.slice.call(document.querySelectorAll(".sig-path"));
var lens = paths.map(function(el){ return el.getTotalLength(); });
var total = 0;
lens.forEach(function(l){ total += l; });
var starts = [];
var acc = 0;
lens.forEach(function(l){ starts.push(acc / total); acc += l; });
paths.forEach(function(el, i){
  el.style.strokeDasharray = lens[i] + " " + lens[i];
  el.style.strokeDashoffset = lens[i];
});
function clamp01(x){ return Math.max(0, Math.min(1, x)); }
function applyReveal(p){
  var drawP = clamp01((p - 0.05) / 0.8);
  paths.forEach(function(el, i){
    var segLen = lens[i] / total;
    var localT = clamp01((drawP - starts[i]) / segLen);
    el.style.strokeDashoffset = lens[i] * (1 - localT);
  });
}`,
      height: 520
    },
    snippetHTML: `<svg viewBox="0 0 720 380" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path class="sig-path" d="M 90 248 C 70 168 132 92 182 118 ..."/>
  <path class="sig-path" d="M 352 128 C 326 184 314 244 344 250 ..."/>
  <path class="sig-path" d="M 96 318 C 240 344 460 336 636 296"/>
</svg>`,
    snippetCSS: `.sig-path {
  stroke: #fff;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
}`,
    snippetJS: `var paths = Array.prototype.slice.call(document.querySelectorAll(".sig-path"));
var lens = paths.map(function(el){ return el.getTotalLength(); });
var total = lens.reduce(function(a, b){ return a + b; }, 0);
var starts = [];
var acc = 0;
lens.forEach(function(l){ starts.push(acc / total); acc += l; });
paths.forEach(function(el, i){
  el.style.strokeDasharray = lens[i] + " " + lens[i];
  el.style.strokeDashoffset = lens[i];
});
var track = document.querySelector(".scroll-track");
function clamp01(x){ return Math.max(0, Math.min(1, x)); }
window.addEventListener("scroll", function(){
  var rect = track.getBoundingClientRect();
  var p = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));
  var drawP = clamp01((p - 0.05) / 0.8);
  paths.forEach(function(el, i){
    var localT = clamp01((drawP - starts[i]) / (lens[i] / total));
    el.style.strokeDashoffset = lens[i] * (1 - localT);
  });
}, { passive: true });`,
    explain: '멀티 패스 드로잉의 핵심은 시간 배분. 모든 획의 길이를 합산(total)한 뒤 각 획 i의 시작점 startᵢ = (앞 획 길이의 누적합) / total, 구간 폭 = lenᵢ / total로 잡는다. 이렇게 하면 전체 진행률이 펜이 이동한 "거리"에 정확히 비례 — 긴 획은 오래, 짧은 획은 잠깐 그려져 실제 필기 리듬이 재현된다. 획 순서는 DOM 순서 그대로이므로 사람이 쓰는 순서대로 path를 배치하는 것이 중요하다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (라이브러리 0)' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '매핑', value: '누적 길이 비례 구간 분할 — startᵢ = Σlen / total' },
      { label: '획 수', value: '4획 (본획 3 + 밑줄 플러리시 1)' },
      { label: '매핑 구간', value: '[0.05, 0.85]' },
      { label: '권장', value: '3~6획 서명·로고 스트로크' }
    ],
    guide: '서명·로고처럼 "획순"이 있는 그림에 사용한다. 실제 손글씨를 일러스트레이터에서 패스로 따면 가장 자연스럽고, 데모처럼 추상 곡선으로 분위기만 내도 충분하다. 획 사이를 의도적으로 살짝 겹치게(시작점을 0.02 정도 앞당김) 하면 펜을 떼지 않고 이어 쓰는 인상도 가능. stroke-linecap: round가 없으면 획 끝이 잘린 듯 보이므로 필수. 너무 많은 획(>8)은 한 획당 스크롤 거리가 짧아져 드로잉 쾌감이 사라진다.',
    recommendations: [
      { place: '히어로 헤더', body: '창업자 서명·브랜드 이니셜이 첫 화면에서 그려지는 오프닝 — 장인정신·헤리티지 톤 브랜드에 최적' },
      { place: '랜딩 페이지', body: '"우리의 약속" 섹션 끝에 서명이 그려지며 신뢰의 마침표를 찍는 연출' },
      { place: '제품 섹션', body: '한정판·수제 제품의 "메이커 서명" 영역 — 제작자의 손길을 모션으로 번역' },
      { place: '포트폴리오 소개', body: '디자이너 본인 이름의 시그니처 드로잉으로 About 페이지를 마무리하는 클로징' }
    ],
    tradeoff: '획수가 많아질수록 매 프레임 갱신하는 path 수가 늘어난다(획당 dashoffset 1회 갱신 — 6획까지는 무시 가능). 실제 서명을 쓸 경우 개인정보·위변조 관점에서 실서명 대신 스타일라이즈드 버전 권장. 자동 줄바꿈이 없는 고정 viewBox이므로 모바일에서는 width 스케일만 줄어든다.'
  },

  // ───────────────────────────── 3. underline-sketch
  {
    id: 'underline-sketch',
    num: '03',
    title: '밑줄 스케치',
    summary: '헤드라인이 먼저 페이드 인되고, 그 아래 손그림 풍의 흔들리는 곡선 밑줄이 좌→우로 그려진다. 2차 획이 살짝 어긋나게 덧그려져 마커로 두 번 강조한 듯한 스케치 질감.',
    demo: {
      bodyHTML: `<div class="sketch-wrap">
  <h2 class="sketch-head">디테일이 완성도를 만듭니다</h2>
  <svg class="sketch-svg" viewBox="0 0 560 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path class="sketch-line sketch-line1" d="M 10 22 C 90 10 170 32 270 18 C 360 6 460 28 550 16"/>
    <path class="sketch-line sketch-line2" d="M 16 32 C 110 22 210 40 320 26 C 410 16 480 30 544 26"/>
  </svg>
</div>`,
      css: `.sketch-wrap { display: flex; flex-direction: column; align-items: center; gap: 14px; }
.sketch-head { font: 700 clamp(32px, 6vw, 52px)/1.3 ${FONT_STACK}; color: #fff; margin: 0; opacity: 0; letter-spacing: -0.02em; text-align: center; }
.sketch-svg { width: min(560px, 80vw); height: auto; display: block; }
.sketch-line { stroke: #fff; stroke-width: 5; stroke-linecap: round; }
.sketch-line2 { stroke: rgba(255,255,255,0.55); stroke-width: 3; }`,
      script: `var head = document.querySelector(".sketch-head");
var line1 = document.querySelector(".sketch-line1");
var line2 = document.querySelector(".sketch-line2");
var L1 = line1.getTotalLength();
var L2 = line2.getTotalLength();
line1.style.strokeDasharray = L1 + " " + L1;
line1.style.strokeDashoffset = L1;
line2.style.strokeDasharray = L2 + " " + L2;
line2.style.strokeDashoffset = L2;
function clamp01(x){ return Math.max(0, Math.min(1, x)); }
function applyReveal(p){
  var headP = clamp01((p - 0.04) / 0.24);
  head.style.opacity = headP;
  head.style.transform = "translateY(" + (18 * (1 - headP)) + "px)";
  var d1 = clamp01((p - 0.3) / 0.34);
  line1.style.strokeDashoffset = L1 * (1 - d1);
  var d2 = clamp01((p - 0.6) / 0.32);
  line2.style.strokeDashoffset = L2 * (1 - d2);
}`,
      height: 480
    },
    snippetHTML: `<h2 class="sketch-head">디테일이 완성도를 만듭니다</h2>
<svg class="sketch-svg" viewBox="0 0 560 44" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path class="sketch-line1" d="M 10 22 C 90 10 170 32 270 18 C 360 6 460 28 550 16"/>
  <path class="sketch-line2" d="M 16 32 C 110 22 210 40 320 26 C 410 16 480 30 544 26"/>
</svg>`,
    snippetCSS: `.sketch-head { opacity: 0; }
.sketch-line1 { stroke: #fff; stroke-width: 5; stroke-linecap: round; fill: none; }
.sketch-line2 { stroke: rgba(255,255,255,0.55); stroke-width: 3; stroke-linecap: round; fill: none; }`,
    snippetJS: `var head = document.querySelector(".sketch-head");
var line1 = document.querySelector(".sketch-line1");
var line2 = document.querySelector(".sketch-line2");
var L1 = line1.getTotalLength(), L2 = line2.getTotalLength();
line1.style.strokeDasharray = L1 + " " + L1; line1.style.strokeDashoffset = L1;
line2.style.strokeDasharray = L2 + " " + L2; line2.style.strokeDashoffset = L2;
var track = document.querySelector(".scroll-track");
function clamp01(x){ return Math.max(0, Math.min(1, x)); }
window.addEventListener("scroll", function(){
  var rect = track.getBoundingClientRect();
  var p = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));
  head.style.opacity = clamp01((p - 0.04) / 0.24);
  line1.style.strokeDashoffset = L1 * (1 - clamp01((p - 0.3) / 0.34));
  line2.style.strokeDashoffset = L2 * (1 - clamp01((p - 0.6) / 0.32));
}, { passive: true });`,
    explain: '세 단계 구간 매핑. 헤드라인은 [0.04, 0.28]에서 opacity·translateY로 자리 잡고, 1차 획(굵은 흰색)이 [0.3, 0.64]에서 좌→우로 그려지며, 2차 획(가늘고 반투명)이 [0.6, 0.92]에서 살짝 어긋난 궤적으로 덧그려진다. 손그림의 "흔들림"은 베지어 제어점의 y값을 ±10px 안에서 불규칙하게 오르내리게 해 만든다. 직선 line이 아닌 C 커브 패스를 쓰는 이유가 바로 이 의도된 불완전함이다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (라이브러리 0)' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '단계', value: '헤드라인 [0.04, 0.28] → 1차 획 [0.3, 0.64] → 2차 획 [0.6, 0.92]' },
      { label: '밑줄 형태', value: 'C 커브 2중 스트로크 (제어점 ±10px 흔들림)' },
      { label: '획 두께', value: '1차 5px · 2차 3px (55% 투명)' },
      { label: '권장', value: '헤드라인 1줄 + 밑줄 폭 ≤ 글줄 폭' }
    ],
    guide: '강조하고 싶은 핵심 카피 한 줄에만 사용한다. 밑줄 SVG의 width를 헤드라인 폭과 맞추되 글줄보다 살짝 짧게(90~95%) 하면 더 자연스럽다. 2차 획은 생략 가능하지만, 있을 때 "사람이 두 번 그은" 스케치 인상이 확연히 살아난다. 흔들림 진폭이 ±15px를 넘으면 장난스러워 보이므로 톤에 맞게 조절. 다중 줄 헤드라인에서는 마지막 줄 아래에만 배치한다.',
    recommendations: [
      { place: '히어로 헤더', body: '메인 슬로건의 핵심 단어 아래 스케치 밑줄이 그려지며 첫 스크롤의 보상을 제공' },
      { place: '랜딩 페이지', body: '"무료로 시작하세요" 같은 전환 카피 아래 강조 밑줄 — CTA 직전 시선 고정' },
      { place: '제품 섹션', body: '기능 비교표 위 "가장 인기" 플랜 이름에 손그림 밑줄로 친근한 추천 표시' },
      { place: '포트폴리오 소개', body: '자기소개 문장 중 "디자이너" 같은 정체성 단어를 스케치로 강조 — 수작업 감성 전달' }
    ],
    tradeoff: '손그림 질감은 브랜드 톤을 강하게 규정한다 — 금융·의료 등 신뢰 중심 서비스에는 과할 수 있다. 헤드라인이 줄바꿈되는 반응형 구간에서 밑줄 폭과 글줄 폭이 어긋나지 않는지 브레이크포인트 검수 필수.'
  },

  // ───────────────────────────── 4. gauge-ring
  {
    id: 'gauge-ring',
    num: '04',
    title: '원형 게이지 링',
    summary: 'circle 둘레(2πr)를 dasharray로 잡고 dashoffset을 진행률에 매핑해 링이 12시 방향부터 시계 방향으로 채워진다. 중앙의 % 숫자가 같은 진행률로 동기 카운트.',
    demo: {
      bodyHTML: `<div class="gauge-wrap">
  <svg class="gauge-svg" viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle class="gauge-track" cx="160" cy="160" r="132"/>
    <circle class="gauge-fill" cx="160" cy="160" r="132"/>
  </svg>
  <div class="gauge-center">
    <strong class="gauge-num">0%</strong>
    <span class="gauge-cap">스크롤 진행률</span>
  </div>
</div>`,
      css: `.gauge-wrap { position: relative; width: min(320px, 64vw); }
.gauge-svg { width: 100%; height: auto; display: block; transform: rotate(-90deg); }
.gauge-track { stroke: rgba(255,255,255,0.1); stroke-width: 12; }
.gauge-fill { stroke: #fff; stroke-width: 12; stroke-linecap: round; }
.gauge-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; }
.gauge-num { font: 800 54px/1 ${FONT_STACK}; color: #fff; font-variant-numeric: tabular-nums; letter-spacing: -0.02em; }
.gauge-cap { font: 500 13px/1 ${FONT_STACK}; color: rgba(255,255,255,0.45); letter-spacing: 0.12em; }`,
      script: `var ring = document.querySelector(".gauge-fill");
var num = document.querySelector(".gauge-num");
var C = ring.getTotalLength();
ring.style.strokeDasharray = C + " " + C;
ring.style.strokeDashoffset = C;
function clamp01(x){ return Math.max(0, Math.min(1, x)); }
function applyReveal(p){
  var t = clamp01((p - 0.03) / 0.9);
  ring.style.strokeDashoffset = C * (1 - t);
  num.textContent = Math.round(t * 100) + "%";
}`,
      height: 520
    },
    snippetHTML: `<div class="gauge-wrap">
  <svg class="gauge-svg" viewBox="0 0 320 320" fill="none">
    <circle class="gauge-track" cx="160" cy="160" r="132"/>
    <circle class="gauge-fill" cx="160" cy="160" r="132"/>
  </svg>
  <div class="gauge-center">
    <strong class="gauge-num">0%</strong>
  </div>
</div>`,
    snippetCSS: `.gauge-wrap { position: relative; }
.gauge-svg { transform: rotate(-90deg); }   /* 12시 방향 시작 */
.gauge-track { stroke: rgba(255,255,255,0.1); stroke-width: 12; fill: none; }
.gauge-fill { stroke: #fff; stroke-width: 12; stroke-linecap: round; fill: none; }
.gauge-center { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
.gauge-num { font-variant-numeric: tabular-nums; }`,
    snippetJS: `var ring = document.querySelector(".gauge-fill");
var num = document.querySelector(".gauge-num");
var C = ring.getTotalLength();   // = 2πr
ring.style.strokeDasharray = C + " " + C;
ring.style.strokeDashoffset = C;
var track = document.querySelector(".scroll-track");
window.addEventListener("scroll", function(){
  var rect = track.getBoundingClientRect();
  var p = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));
  ring.style.strokeDashoffset = C * (1 - p);
  num.textContent = Math.round(p * 100) + "%";
}, { passive: true });`,
    explain: 'circle도 SVGGeometryElement라 getTotalLength()로 둘레(2πr)를 얻는다. dashoffset = C × (1 − p) 매핑으로 링이 채워지는데, SVG 기본 시작점은 3시 방향이므로 svg 전체에 rotate(-90deg)를 걸어 12시 방향 시작으로 보정한다. 중앙 % 숫자는 같은 t값으로 textContent = round(t × 100)을 갱신 — 링과 숫자가 단일 진행률 소스를 공유하므로 어긋날 수 없다. font-variant-numeric: tabular-nums로 숫자 폭 변화에 따른 흔들림을 방지.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (라이브러리 0)' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '매핑', value: 'dashoffset = C × (1 − t), C = 2πr ≈ 829' },
      { label: '숫자 동기', value: 'textContent = round(t × 100) + "%" (동일 t 공유)' },
      { label: '시작점 보정', value: 'svg transform: rotate(-90deg) — 12시 방향' },
      { label: '성능 비용', value: '낮음 (dashoffset + 텍스트 노드만)' }
    ],
    guide: '달성률·완독률·로딩 메타포 등 "퍼센트"가 의미를 갖는 콘텐츠에 사용한다. stroke-linecap: round는 채움 끝을 둥글게 해주지만 0%일 때도 점이 보일 수 있어, 완전 0 상태에서는 opacity를 잠깐 0으로 떨어뜨리는 보정도 고려할 만하다. 링 두께는 지름의 4~8%가 안정적. 숫자 카운트는 round 처리라 정수만 표시 — 소수점이 필요하면 toFixed(1)로. 게이지가 100%에 도달하는 지점을 progress 0.93 부근으로 당기면 스크롤 끝 도달 전에 완성의 보상을 준다.',
    recommendations: [
      { place: '히어로 헤더', body: '"고객 만족도 98%" 같은 핵심 수치를 링 게이지로 — 첫 스크롤에서 수치가 차오르는 임팩트' },
      { place: '랜딩 페이지', body: '서비스 성과 지표 3개를 나란히 배치해 스크롤 한 번에 모두 차오르는 통계 섹션' },
      { place: '제품 섹션', body: '배터리 수명·재활용 소재 비율 등 제품 스펙의 퍼센트 시각화' },
      { place: '포트폴리오 소개', body: '스킬 숙련도(디자인 90% / 모션 75%)를 게이지 링으로 — 이력서형 포트폴리오의 클래식' }
    ],
    tradeoff: '퍼센트 게이지는 의미 없는 수치에 쓰면 오히려 신뢰를 깎는다(스킬 % 표기 논쟁처럼). 수치의 출처가 분명한 곳에만. 스크린리더는 시각적 링을 읽지 못하므로 aria-label 또는 시각적으로 숨긴 텍스트로 최종 수치를 제공해야 한다.'
  },

  // ───────────────────────────── 5. timeline-stem
  {
    id: 'timeline-stem',
    num: '05',
    title: '타임라인 줄기',
    summary: '세로 줄기 라인이 스크롤을 따라 자라나고, 줄기가 각 마일스톤의 높이를 지나는 순간 도트와 연도 라벨이 순차 점등된다. 연혁·로드맵 페이지의 대표 문법.',
    demo: {
      bodyHTML: `<svg class="tl-svg" viewBox="0 0 640 430" fill="none" xmlns="http://www.w3.org/2000/svg">
  <line class="tl-stem-bg" x1="120" y1="24" x2="120" y2="410"/>
  <line class="tl-stem" x1="120" y1="24" x2="120" y2="410"/>
  <g class="tl-item" data-at="0.12">
    <circle class="tl-dot" cx="120" cy="72" r="7"/>
    <text class="tl-year" x="152" y="66">2023</text>
    <text class="tl-desc" x="152" y="90">첫 프로토타입 공개</text>
  </g>
  <g class="tl-item" data-at="0.37">
    <circle class="tl-dot" cx="120" cy="168" r="7"/>
    <text class="tl-year" x="152" y="162">2024</text>
    <text class="tl-desc" x="152" y="186">정식 서비스 런칭</text>
  </g>
  <g class="tl-item" data-at="0.62">
    <circle class="tl-dot" cx="120" cy="264" r="7"/>
    <text class="tl-year" x="152" y="258">2025</text>
    <text class="tl-desc" x="152" y="282">월 사용자 100만 달성</text>
  </g>
  <g class="tl-item" data-at="0.87">
    <circle class="tl-dot" cx="120" cy="360" r="7"/>
    <text class="tl-year" x="152" y="354">2026</text>
    <text class="tl-desc" x="152" y="378">글로벌 12개국 진출</text>
  </g>
</svg>`,
      css: `.tl-svg { width: min(640px, 88vw); height: auto; display: block; }
.tl-stem-bg { stroke: rgba(255,255,255,0.1); stroke-width: 3; }
.tl-stem { stroke: #fff; stroke-width: 3; stroke-linecap: round; }
.tl-item { opacity: 0; }
.tl-dot { fill: #000; stroke: #fff; stroke-width: 3; }
.tl-year { font: 700 20px ${FONT_STACK}; fill: #fff; }
.tl-desc { font: 500 15px ${FONT_STACK}; fill: rgba(255,255,255,0.55); }`,
      script: `var stem = document.querySelector(".tl-stem");
var items = document.querySelectorAll(".tl-item");
var L = stem.getTotalLength();
stem.style.strokeDasharray = L + " " + L;
stem.style.strokeDashoffset = L;
function clamp01(x){ return Math.max(0, Math.min(1, x)); }
function applyReveal(p){
  var drawP = clamp01((p - 0.05) / 0.85);
  stem.style.strokeDashoffset = L * (1 - drawP);
  items.forEach(function(g){
    var at = parseFloat(g.getAttribute("data-at"));
    var t = clamp01((drawP - at) / 0.1);
    g.style.opacity = t;
    g.setAttribute("transform", "translate(" + (14 * (1 - t)).toFixed(2) + " 0)");
  });
}`,
      height: 560
    },
    snippetHTML: `<svg viewBox="0 0 640 430" fill="none" xmlns="http://www.w3.org/2000/svg">
  <line class="tl-stem" x1="120" y1="24" x2="120" y2="410"/>
  <g class="tl-item" data-at="0.12">
    <circle class="tl-dot" cx="120" cy="72" r="7"/>
    <text class="tl-year" x="152" y="66">2023</text>
    <text class="tl-desc" x="152" y="90">첫 프로토타입 공개</text>
  </g>
  <!-- 마일스톤 반복 (data-at = 도트 y의 줄기 대비 비율) -->
</svg>`,
    snippetCSS: `.tl-stem { stroke: #fff; stroke-width: 3; stroke-linecap: round; }
.tl-item { opacity: 0; }
.tl-dot { fill: #000; stroke: #fff; stroke-width: 3; }
.tl-year { font: 700 20px sans-serif; fill: #fff; }
.tl-desc { font: 500 15px sans-serif; fill: rgba(255,255,255,0.55); }`,
    snippetJS: `var stem = document.querySelector(".tl-stem");
var items = document.querySelectorAll(".tl-item");
var L = stem.getTotalLength();
stem.style.strokeDasharray = L + " " + L;
stem.style.strokeDashoffset = L;
var track = document.querySelector(".scroll-track");
function clamp01(x){ return Math.max(0, Math.min(1, x)); }
window.addEventListener("scroll", function(){
  var rect = track.getBoundingClientRect();
  var p = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));
  var drawP = clamp01((p - 0.05) / 0.85);
  stem.style.strokeDashoffset = L * (1 - drawP);
  items.forEach(function(g){
    var at = parseFloat(g.getAttribute("data-at"));
    var t = clamp01((drawP - at) / 0.1);
    g.style.opacity = t;
    g.setAttribute("transform", "translate(" + (14 * (1 - t)) + " 0)");
  });
}, { passive: true });`,
    explain: '줄기는 <line> 요소 — line도 SVGGeometryElement이므로 getTotalLength()와 dashoffset 매핑이 그대로 통한다. 각 마일스톤 <g>에 data-at 속성으로 "줄기 전체 대비 도트 위치 비율"을 기록해 두고(예: 도트 y가 줄기의 37% 지점이면 0.37), 줄기 드로잉 진행률 drawP가 그 임계값을 넘어서면 [at, at+0.1] 구간에서 opacity 0→1 + translateX 14→0으로 점등한다. 줄기 성장과 점등이 같은 drawP를 공유하므로 "줄기가 닿는 순간 켜진다"는 인과가 정확히 유지된다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (라이브러리 0)' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '매핑', value: '줄기 dashoffset + data-at 임계값 점등' },
      { label: '마일스톤', value: '4개 (at 0.12 / 0.37 / 0.62 / 0.87)' },
      { label: '점등 구간', value: '임계값 후 0.1 폭에서 opacity·translateX 보간' },
      { label: '권장', value: '마일스톤 3~6개 (연혁·로드맵)' }
    ],
    guide: 'data-at 값은 (도트 y − 줄기 시작 y) / 줄기 길이로 계산해 도트 위치와 정확히 일치시킨다 — 어긋나면 줄기가 도트를 지나쳤는데 불이 안 켜지는 어색함이 생긴다. 마일스톤이 6개를 넘으면 sticky 한 화면에 다 담기 어려우므로 track 높이를 300vh까지 늘리거나 두 단락으로 나눈다. 텍스트는 SVG <text>라 줄바꿈이 안 되므로 설명은 한 줄 15자 이내로. 좌우 교차 배치(지그재그)가 필요하면 text x좌표만 반대편으로 옮기면 된다.',
    recommendations: [
      { place: '히어로 헤더', body: '회사 창립 스토리를 헤더 직후 첫 섹션에서 줄기 타임라인으로 — 스크롤이 곧 시간 여행' },
      { place: '랜딩 페이지', body: '제품 로드맵 공개 섹션. 분기별 계획이 줄기를 따라 순차 점등되며 기대감 형성' },
      { place: '제품 섹션', body: '온보딩 단계(가입→설정→시작) 3스텝을 세로 줄기로 안내하는 사용 흐름 다이어그램' },
      { place: '포트폴리오 소개', body: '경력 연혁(입사·수상·독립)을 타임라인으로 — 이력의 흐름을 한 번의 스크롤에 압축' }
    ],
    tradeoff: 'SVG <text>는 자동 줄바꿈·말줄임이 없어 긴 설명에 부적합 — 본문이 길면 HTML 오버레이 방식으로 전환해야 한다. 마일스톤 점등에 의미가 있으므로 스크린리더용으로 동일 내용의 시각적으로 숨긴 HTML 리스트를 병행 제공 권장.'
  },

  // ───────────────────────────── 6. map-route
  {
    id: 'map-route',
    num: '06',
    title: '지도 경로',
    summary: '희미한 격자 지도 위 출발→도착 경로선이 스크롤만큼 그려지고, getPointAtLength로 얻은 좌표에 마커가 실려 선두를 따라 이동한다. 마지막 구간에서 도착 핀이 스케일 팝.',
    demo: {
      bodyHTML: `<svg class="map-svg" viewBox="0 0 760 420" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path class="map-grid" d="M 0 105 H 760 M 0 210 H 760 M 0 315 H 760 M 152 0 V 420 M 304 0 V 420 M 456 0 V 420 M 608 0 V 420"/>
  <path class="route-bg" d="M 90 340 C 150 300 160 240 230 230 C 310 220 330 290 410 280 C 490 270 480 180 540 150 C 580 130 620 130 660 96"/>
  <path class="route-path" d="M 90 340 C 150 300 160 240 230 230 C 310 220 330 290 410 280 C 490 270 480 180 540 150 C 580 130 620 130 660 96"/>
  <circle class="map-start-dot" cx="90" cy="340" r="8"/>
  <text class="map-label" x="90" y="375">출발</text>
  <g class="route-marker">
    <circle class="route-halo" r="14"/>
    <circle class="route-dot" r="7"/>
  </g>
  <g class="route-pin">
    <path d="M 0 0 C -12 -16 -19 -27 -19 -38 C -19 -51 -10 -60 0 -60 C 10 -60 19 -51 19 -38 C 19 -27 12 -16 0 0 Z"/>
    <circle cy="-38" r="7"/>
  </g>
  <text class="map-label" x="660" y="130">도착</text>
</svg>`,
      css: `.map-svg { width: min(760px, 90vw); height: auto; display: block; }
.map-grid { stroke: rgba(255,255,255,0.07); stroke-width: 1; }
.route-bg { stroke: rgba(255,255,255,0.16); stroke-width: 2; stroke-dasharray: 3 8; stroke-linecap: round; }
.route-path { stroke: #fff; stroke-width: 3.5; stroke-linecap: round; }
.map-start-dot { fill: rgba(255,255,255,0.9); }
.map-label { font: 600 15px ${FONT_STACK}; fill: rgba(255,255,255,0.6); text-anchor: middle; }
.route-halo { fill: rgba(255,255,255,0.15); }
.route-dot { fill: #fff; }
.route-pin { opacity: 0; }
.route-pin path { fill: #fff; }
.route-pin circle { fill: #000; }`,
      script: `var route = document.querySelector(".route-path");
var marker = document.querySelector(".route-marker");
var pin = document.querySelector(".route-pin");
var L = route.getTotalLength();
route.style.strokeDasharray = L + " " + L;
route.style.strokeDashoffset = L;
function clamp01(x){ return Math.max(0, Math.min(1, x)); }
function applyReveal(p){
  var t = clamp01((p - 0.05) / 0.78);
  route.style.strokeDashoffset = L * (1 - t);
  var pt = route.getPointAtLength(L * t);
  marker.setAttribute("transform", "translate(" + pt.x.toFixed(1) + " " + pt.y.toFixed(1) + ")");
  var pinP = clamp01((p - 0.86) / 0.12);
  pin.style.opacity = pinP;
  pin.setAttribute("transform", "translate(660 96) scale(" + (0.5 + 0.5 * pinP).toFixed(3) + ")");
}`,
      height: 560
    },
    snippetHTML: `<svg viewBox="0 0 760 420" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path class="route-bg" d="M 90 340 C 150 300 160 240 230 230 ... 660 96"/>
  <path class="route-path" d="M 90 340 C 150 300 160 240 230 230 ... 660 96"/>
  <g class="route-marker"><circle r="7" fill="#fff"/></g>
  <g class="route-pin"><path d="M 0 0 C -12 -16 ... Z"/></g>
</svg>`,
    snippetCSS: `.route-bg { stroke: rgba(255,255,255,0.16); stroke-width: 2; stroke-dasharray: 3 8; fill: none; }
.route-path { stroke: #fff; stroke-width: 3.5; stroke-linecap: round; fill: none; }
.route-pin { opacity: 0; }`,
    snippetJS: `var route = document.querySelector(".route-path");
var marker = document.querySelector(".route-marker");
var pin = document.querySelector(".route-pin");
var L = route.getTotalLength();
route.style.strokeDasharray = L + " " + L;
route.style.strokeDashoffset = L;
var track = document.querySelector(".scroll-track");
function clamp01(x){ return Math.max(0, Math.min(1, x)); }
window.addEventListener("scroll", function(){
  var rect = track.getBoundingClientRect();
  var p = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));
  var t = clamp01((p - 0.05) / 0.78);
  route.style.strokeDashoffset = L * (1 - t);
  var pt = route.getPointAtLength(L * t);   // 선두 좌표
  marker.setAttribute("transform", "translate(" + pt.x + " " + pt.y + ")");
  var pinP = clamp01((p - 0.86) / 0.12);
  pin.style.opacity = pinP;
  pin.setAttribute("transform", "translate(660 96) scale(" + (0.5 + 0.5 * pinP) + ")");
}, { passive: true });`,
    explain: '드로잉과 추적의 결합. 경로선은 dashoffset = L × (1 − t)로 그리고, 같은 t로 route.getPointAtLength(L × t)를 호출하면 지금 막 그려진 "선두"의 좌표를 얻는다. 이 좌표를 마커 <g>의 transform translate에 넣으면 마커가 선을 따라 이동 — 선과 마커가 단일 진행률을 공유해 절대 어긋나지 않는다. 도착 핀은 [0.86, 0.98] 구간에서 opacity와 scale 0.5→1로 팝업. 배경에는 점선 route-bg로 전체 경로를 예고하고, 격자 패스로 지도 질감을 만든다 (외부 이미지 0).',
    kv: [
      { label: '의존성', value: 'Vanilla JS (라이브러리 0)' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '매핑', value: 'dashoffset + getPointAtLength(L × t) 마커 추적' },
      { label: '마커', value: 'transform translate(pt.x, pt.y) — 매 프레임 갱신' },
      { label: '도착 핀', value: '[0.86, 0.98] opacity + scale 0.5→1 팝' },
      { label: '성능 비용', value: '중간 (getPointAtLength 매 프레임 1회)' }
    ],
    guide: '여정·배송·프로세스 등 "이동" 서사에 사용한다. getPointAtLength는 프레임당 1회 호출이면 데스크톱·모바일 모두 부담 없지만, 마커가 여러 개면 호출이 비례해 늘어나니 주의. 점선 예고선(route-bg)은 사용자가 "어디까지 가는지" 미리 알게 해 스크롤 동기를 만든다 — 생략하면 긴장감, 포함하면 안내감. 핀의 transform은 translate 후 scale 순서라 핀 꼭짓점 기준으로 커진다. 곡선의 방향 전환이 4회를 넘으면 마커 이동이 어지러우니 2~4회가 적당.',
    recommendations: [
      { place: '히어로 헤더', body: '여행·물류 서비스의 첫 화면 — 출발지에서 도착지까지 경로가 그려지며 서비스 본질을 3초에 전달' },
      { place: '랜딩 페이지', body: '"가입부터 활용까지" 사용자 여정 맵 — 단계 아이콘 사이를 경로선이 이어주는 온보딩 다이어그램' },
      { place: '제품 섹션', body: '배송 추적 UI 소개 — 실제 기능의 모형을 스크롤 드로잉으로 시연' },
      { place: '포트폴리오 소개', body: '거쳐온 도시·회사를 지도 경로로 연결하는 커리어 여정 연출' }
    ],
    tradeoff: 'getPointAtLength는 패스가 복잡할수록(세그먼트 수↑) 비용이 늘어난다 — 제어점 10개 이하 곡선 권장. 격자·점선이 많은 SVG는 다크 모드 외 배경에서 대비 재조정 필요. 실제 지리 정보가 아니므로 실측 지도가 필요한 서비스에서는 지도 라이브러리 위 오버레이로 응용한다.'
  },

  // ───────────────────────────── 7. icon-outline
  {
    id: 'icon-outline',
    num: '07',
    title: '아이콘 아웃라인',
    summary: '로켓 아이콘을 구성하는 5개 패스(몸체·창·핀×2·불꽃)가 길이 비례로 순차 드로잉되고, 윤곽이 완성된 뒤 마지막 구간에서 면(fill)이 은은하게 차오른다.',
    demo: {
      bodyHTML: `<div class="icon-wrap">
  <svg class="icon-svg" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path class="icon-path" data-fill="0.10" d="M 200 36 C 252 88 272 160 252 240 L 148 240 C 128 160 148 88 200 36 Z"/>
    <circle class="icon-path" data-fill="0.22" cx="200" cy="146" r="26"/>
    <path class="icon-path" data-fill="0.10" d="M 148 198 C 112 222 100 262 102 302 C 130 282 152 268 160 250"/>
    <path class="icon-path" data-fill="0.10" d="M 252 198 C 288 222 300 262 298 302 C 270 282 248 268 240 250"/>
    <path class="icon-path" data-fill="0.16" d="M 178 262 C 174 296 186 322 200 344 C 214 322 226 296 222 262"/>
  </svg>
  <p class="icon-caption">아웃라인 드로잉 → 채움 페이드</p>
</div>`,
      css: `.icon-wrap { display: flex; flex-direction: column; align-items: center; gap: 18px; }
.icon-svg { width: min(340px, 64vw); height: auto; display: block; }
.icon-path { stroke: #fff; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; fill: #fff; fill-opacity: 0; }
.icon-caption { font: 500 14px/1.6 ${FONT_STACK}; color: rgba(255,255,255,0.45); margin: 0; letter-spacing: 0.04em; }`,
      script: `var parts = Array.prototype.slice.call(document.querySelectorAll(".icon-path"));
var lens = parts.map(function(el){ return el.getTotalLength(); });
var total = 0;
lens.forEach(function(l){ total += l; });
var starts = [];
var acc = 0;
lens.forEach(function(l){ starts.push(acc / total); acc += l; });
parts.forEach(function(el, i){
  el.style.strokeDasharray = lens[i] + " " + lens[i];
  el.style.strokeDashoffset = lens[i];
});
function clamp01(x){ return Math.max(0, Math.min(1, x)); }
function applyReveal(p){
  var drawP = clamp01((p - 0.05) / 0.72);
  var fillP = clamp01((p - 0.78) / 0.16);
  parts.forEach(function(el, i){
    var segLen = lens[i] / total;
    var localT = clamp01((drawP - starts[i]) / segLen);
    el.style.strokeDashoffset = lens[i] * (1 - localT);
    el.style.fillOpacity = parseFloat(el.getAttribute("data-fill")) * fillP;
  });
}`,
      height: 520
    },
    snippetHTML: `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <path class="icon-path" data-fill="0.10" d="M 200 36 C 252 88 272 160 252 240 L 148 240 C 128 160 148 88 200 36 Z"/>
  <circle class="icon-path" data-fill="0.22" cx="200" cy="146" r="26"/>
  <path class="icon-path" data-fill="0.16" d="M 178 262 C 174 296 186 322 200 344 C 214 322 226 296 222 262"/>
</svg>`,
    snippetCSS: `.icon-path {
  stroke: #fff;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: #fff;
  fill-opacity: 0;   /* 윤곽 완성 후 JS가 data-fill 값까지 끌어올림 */
}`,
    snippetJS: `var parts = Array.prototype.slice.call(document.querySelectorAll(".icon-path"));
var lens = parts.map(function(el){ return el.getTotalLength(); });
var total = lens.reduce(function(a, b){ return a + b; }, 0);
var starts = [];
var acc = 0;
lens.forEach(function(l){ starts.push(acc / total); acc += l; });
parts.forEach(function(el, i){
  el.style.strokeDasharray = lens[i] + " " + lens[i];
  el.style.strokeDashoffset = lens[i];
});
var track = document.querySelector(".scroll-track");
function clamp01(x){ return Math.max(0, Math.min(1, x)); }
window.addEventListener("scroll", function(){
  var rect = track.getBoundingClientRect();
  var p = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));
  var drawP = clamp01((p - 0.05) / 0.72);
  var fillP = clamp01((p - 0.78) / 0.16);
  parts.forEach(function(el, i){
    var localT = clamp01((drawP - starts[i]) / (lens[i] / total));
    el.style.strokeDashoffset = lens[i] * (1 - localT);
    el.style.fillOpacity = parseFloat(el.getAttribute("data-fill")) * fillP;
  });
}, { passive: true });`,
    explain: '시그니처 드로잉(02)의 길이 비례 구간 분할을 아이콘에 적용하고, 2막 구조를 더했다. 1막 [0.05, 0.77]: 몸체→창(circle도 geometry 요소라 동일 처리)→왼 핀→오른 핀→불꽃 순서로 윤곽이 그려진다. 2막 [0.78, 0.94]: 모든 패스의 fill-opacity가 0에서 data-fill 속성에 기록된 목표값(몸체 0.10, 창 0.22, 불꽃 0.16)까지 동시에 차오른다. 파트별 목표 투명도를 마크업(data-fill)에 두면 JS 수정 없이 채움 농도를 조절할 수 있다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (라이브러리 0)' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '매핑', value: '길이 비례 순차 드로잉 [0.05, 0.77]' },
      { label: 'fill 페이드', value: '[0.78, 0.94] fillOpacity 0 → data-fill 목표값' },
      { label: '패스 수', value: '5 (몸체·창·핀×2·불꽃)' },
      { label: '권장', value: '단순 라인 아이콘 (패스 3~6개)' }
    ],
    guide: '기능 아이콘·일러스트의 "공들여 그려지는" 연출에 사용한다. 아이콘은 24px 그리드 아이콘을 그대로 키우지 말고 데모처럼 300~400 단위 viewBox로 다시 그려야 곡선이 매끄럽다. 드로잉 순서는 큰 형태→디테일 순이 자연스럽다(몸체 먼저, 불꽃 마지막). fill 목표값은 0.08~0.25 사이의 은은한 농도가 다크 배경에서 가장 우아하다 — 1.0 채움은 윤곽 드로잉의 여운을 지워버린다. 여러 아이콘을 나란히 쓸 때는 시작 구간을 0.1씩 어긋나게 stagger.',
    recommendations: [
      { place: '히어로 헤더', body: '제품 심볼·로고 아이콘이 첫 스크롤에 그려지며 브랜드 각인 — 스플래시를 대체하는 우아한 오프닝' },
      { place: '랜딩 페이지', body: '핵심 가치 3개(속도·보안·확장)를 아이콘 3종 순차 드로잉으로 — 기능 섹션의 시각 앵커' },
      { place: '제품 섹션', body: '기능 다이어그램 중앙 아이콘이 그려진 뒤 주변 설명이 붙는 단계적 설명 구조' },
      { place: '포트폴리오 소개', body: '사용 툴·전문 분야 아이콘이 그려지는 스킬 섹션 — 게이지보다 절제된 표현' }
    ],
    tradeoff: '복잡한 아이콘(패스 10개+)은 한 획당 스크롤 구간이 좁아져 드로잉 쾌감이 사라진다 — 단순화하거나 그룹 단위로 묶어 그린다. 열린 패스(핀·불꽃)에 fill을 주면 시작-끝점을 직선으로 이은 면이 채워지므로, 채움 농도를 낮게 유지해 어색함을 가린다.'
  },

  // ───────────────────────────── 8. graph-line
  {
    id: 'graph-line',
    num: '08',
    title: '그래프 라인',
    summary: '꺾은선 차트가 좌→우로 그려지고, 선두가 각 데이터 포인트를 지나는 순간 도트가 점등된다. 선이 완성된 뒤 영역(fill)이 페이드 인되어 차트가 마감된다.',
    demo: {
      bodyHTML: `<div class="graph-wrap">
  <svg class="graph-svg" viewBox="0 0 720 380" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g class="graph-grid">
      <line x1="60" y1="80" x2="660" y2="80"/>
      <line x1="60" y1="155" x2="660" y2="155"/>
      <line x1="60" y1="230" x2="660" y2="230"/>
      <line x1="60" y1="305" x2="660" y2="305"/>
    </g>
    <path class="graph-area" d="M 60 300 L 180 220 L 300 250 L 420 150 L 540 180 L 660 80 L 660 330 L 60 330 Z"/>
    <path class="graph-line" d="M 60 300 L 180 220 L 300 250 L 420 150 L 540 180 L 660 80"/>
    <g class="graph-dots">
      <circle cx="60" cy="300" r="6"/>
      <circle cx="180" cy="220" r="6"/>
      <circle cx="300" cy="250" r="6"/>
      <circle cx="420" cy="150" r="6"/>
      <circle cx="540" cy="180" r="6"/>
      <circle cx="660" cy="80" r="6"/>
    </g>
    <g class="graph-x">
      <text x="60" y="356">1월</text>
      <text x="180" y="356">2월</text>
      <text x="300" y="356">3월</text>
      <text x="420" y="356">4월</text>
      <text x="540" y="356">5월</text>
      <text x="660" y="356">6월</text>
    </g>
  </svg>
  <p class="graph-caption">월간 활성 사용자 추이</p>
</div>`,
      css: `.graph-wrap { display: flex; flex-direction: column; align-items: center; gap: 14px; }
.graph-svg { width: min(720px, 90vw); height: auto; display: block; }
.graph-grid line { stroke: rgba(255,255,255,0.08); stroke-width: 1; }
.graph-area { fill: rgba(255,255,255,0.12); opacity: 0; }
.graph-line { stroke: #fff; stroke-width: 3.5; stroke-linecap: round; stroke-linejoin: round; }
.graph-dots circle { fill: #000; stroke: #fff; stroke-width: 3; opacity: 0; }
.graph-x text { font: 500 13px ${FONT_STACK}; fill: rgba(255,255,255,0.45); text-anchor: middle; }
.graph-caption { font: 500 15px/1.6 ${FONT_STACK}; color: rgba(255,255,255,0.45); margin: 0; letter-spacing: 0.02em; }`,
      script: `var line = document.querySelector(".graph-line");
var area = document.querySelector(".graph-area");
var dots = document.querySelectorAll(".graph-dots circle");
var L = line.getTotalLength();
line.style.strokeDasharray = L + " " + L;
line.style.strokeDashoffset = L;
var pts = [[60,300],[180,220],[300,250],[420,150],[540,180],[660,80]];
var cum = [0];
for (var i = 1; i < pts.length; i++) {
  var dx = pts[i][0] - pts[i-1][0];
  var dy = pts[i][1] - pts[i-1][1];
  cum.push(cum[i-1] + Math.sqrt(dx*dx + dy*dy));
}
var totalLen = cum[cum.length - 1];
function clamp01(x){ return Math.max(0, Math.min(1, x)); }
function applyReveal(p){
  var drawP = clamp01((p - 0.05) / 0.55);
  line.style.strokeDashoffset = L * (1 - drawP);
  dots.forEach(function(dot, i){
    dot.style.opacity = clamp01((drawP - cum[i] / totalLen) / 0.06);
  });
  area.style.opacity = clamp01((p - 0.66) / 0.2);
}`,
      height: 520
    },
    snippetHTML: `<svg viewBox="0 0 720 380" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path class="graph-area" d="M 60 300 L 180 220 ... L 660 80 L 660 330 L 60 330 Z"/>
  <path class="graph-line" d="M 60 300 L 180 220 L 300 250 L 420 150 L 540 180 L 660 80"/>
  <g class="graph-dots">
    <circle cx="60" cy="300" r="6"/>
    <!-- 데이터 포인트 반복 -->
  </g>
</svg>`,
    snippetCSS: `.graph-area { fill: rgba(255,255,255,0.12); opacity: 0; }
.graph-line { stroke: #fff; stroke-width: 3.5; stroke-linecap: round; stroke-linejoin: round; fill: none; }
.graph-dots circle { fill: #000; stroke: #fff; stroke-width: 3; opacity: 0; }`,
    snippetJS: `var line = document.querySelector(".graph-line");
var area = document.querySelector(".graph-area");
var dots = document.querySelectorAll(".graph-dots circle");
var L = line.getTotalLength();
line.style.strokeDasharray = L + " " + L;
line.style.strokeDashoffset = L;
// 데이터 좌표로 각 도트의 누적 거리 임계값을 정확히 계산
var pts = [[60,300],[180,220],[300,250],[420,150],[540,180],[660,80]];
var cum = [0];
for (var i = 1; i < pts.length; i++) {
  var dx = pts[i][0] - pts[i-1][0], dy = pts[i][1] - pts[i-1][1];
  cum.push(cum[i-1] + Math.sqrt(dx*dx + dy*dy));
}
var totalLen = cum[cum.length - 1];
var track = document.querySelector(".scroll-track");
function clamp01(x){ return Math.max(0, Math.min(1, x)); }
window.addEventListener("scroll", function(){
  var rect = track.getBoundingClientRect();
  var p = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));
  var drawP = clamp01((p - 0.05) / 0.55);
  line.style.strokeDashoffset = L * (1 - drawP);
  dots.forEach(function(dot, i){
    dot.style.opacity = clamp01((drawP - cum[i] / totalLen) / 0.06);
  });
  area.style.opacity = clamp01((p - 0.66) / 0.2);
}, { passive: true });`,
    explain: '3막 구조. 1막 [0.05, 0.6]: 꺾은선이 dashoffset 매핑으로 좌→우 드로잉. 2막(1막과 동기): 각 도트의 점등 임계값을 인덱스가 아닌 누적 거리(cum[i] / totalLen)로 계산 — 세그먼트 길이가 제각각이어도 선두가 도트에 닿는 순간 정확히 켜진다. 3막 [0.66, 0.86]: 미리 닫아둔 영역 패스(꺾은선 + 바닥 직선)의 opacity가 0→1로 차오르며 차트가 마감된다. 데이터 좌표 배열(pts)에서 임계값을 산출하므로 데이터가 바뀌어도 코드는 그대로다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (차트 라이브러리 0)' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '매핑', value: '라인 [0.05, 0.6] → 도트 누적거리 임계 → 영역 [0.66, 0.86]' },
      { label: '도트 점등', value: '임계값 = cum[i] / totalLen (좌표 기반 정밀 동기)' },
      { label: '데이터', value: '6 포인트 꺾은선 (직선 세그먼트)' },
      { label: '권장', value: '데이터 4~8 포인트 (추세 강조용)' }
    ],
    guide: '수치 성장 스토리를 말하는 섹션에서 차트 라이브러리 없이 쓰는 경량 연출. 데이터가 우상향일 때 가장 효과적 — 드로잉의 끝이 화면 위쪽을 향해 "성장"의 신체감각을 만든다. 도트 점등 폭(0.06)은 짧을수록 또렷한 "딱딱" 점등, 길수록 부드러운 페이드. 영역 채움은 0.1~0.15 투명도가 적당하며, 진한 채움은 다크 배경의 깊이를 망친다. 실데이터를 쓸 때는 pts 배열과 path d를 같은 소스에서 생성해 어긋남을 방지한다.',
    recommendations: [
      { place: '히어로 헤더', body: '"3년간 10배 성장" 헤드라인 옆에서 그려지는 우상향 그래프 — 수치 주장의 즉각적 시각 증거' },
      { place: '랜딩 페이지', body: '도입 효과 섹션(생산성 추이·비용 절감 곡선)을 스크롤 드로잉 차트로' },
      { place: '제품 섹션', body: '대시보드 제품의 차트 UI를 실제로 그려지는 모형으로 시연 — 정적 스크린샷 대체' },
      { place: '포트폴리오 소개', body: '운영했던 서비스의 핵심 지표 성장 곡선을 케이스 스터디 도입부에' }
    ],
    tradeoff: '장식용 차트와 데이터 시각화의 경계에 주의 — 축·단위 없는 곡선은 분위기 연출일 뿐, 실제 수치 근거로 제시하려면 축 라벨과 출처를 병기해야 한다. 포인트가 많아지면(>10) 도트 점등이 산만해지므로 추세 강조 목적에선 도트를 주요 변곡점에만 남긴다.'
  },

  // ───────────────────────────── 9. text-outline
  {
    id: 'text-outline',
    num: '09',
    title: '텍스트 아웃라인',
    summary: 'SVG text의 stroke가 글자 윤곽을 따라 드로잉되고, 마지막 구간에서 fill이 차올라 글자가 완성된다. 글자별 stagger로 D→R→A→W 순서로 그려진다.',
    demo: {
      bodyHTML: `<div class="to-wrap">
  <svg class="to-svg" viewBox="0 0 760 230" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <text class="to-char" x="110" y="175">D</text>
    <text class="to-char" x="290" y="175">R</text>
    <text class="to-char" x="470" y="175">A</text>
    <text class="to-char" x="650" y="175">W</text>
  </svg>
  <p class="to-caption">획이 그려진 뒤, 면이 차오릅니다</p>
</div>`,
      css: `.to-wrap { display: flex; flex-direction: column; align-items: center; gap: 20px; }
.to-svg { width: min(760px, 90vw); height: auto; display: block; }
.to-char { font: 800 170px ${FONT_STACK}; fill: #fff; fill-opacity: 0; stroke: #fff; stroke-width: 2; text-anchor: middle; }
.to-caption { font: 500 15px/1.6 ${FONT_STACK}; color: rgba(255,255,255,0.45); margin: 0; letter-spacing: 0.02em; }`,
      script: `var chars = document.querySelectorAll(".to-char");
var EST = 1400;
chars.forEach(function(c){
  c.style.strokeDasharray = EST + " " + EST;
  c.style.strokeDashoffset = EST;
});
function clamp01(x){ return Math.max(0, Math.min(1, x)); }
function applyReveal(p){
  var fillP = clamp01((p - 0.78) / 0.18);
  chars.forEach(function(c, i){
    var start = 0.05 + i * 0.16;
    var t = clamp01((p - start) / 0.26);
    c.style.strokeDashoffset = EST * (1 - t);
    c.style.fillOpacity = fillP;
  });
}`,
      height: 480
    },
    snippetHTML: `<svg viewBox="0 0 760 230" xmlns="http://www.w3.org/2000/svg">
  <text class="to-char" x="110" y="175">D</text>
  <text class="to-char" x="290" y="175">R</text>
  <text class="to-char" x="470" y="175">A</text>
  <text class="to-char" x="650" y="175">W</text>
</svg>`,
    snippetCSS: `.to-char {
  font: 800 170px sans-serif;
  fill: #fff;
  fill-opacity: 0;       /* 마지막 구간에서 JS가 1로 */
  stroke: #fff;
  stroke-width: 2;
  text-anchor: middle;
}`,
    snippetJS: `var chars = document.querySelectorAll(".to-char");
// <text>는 getTotalLength()가 없으므로 윤곽 길이를 추정 상수로
var EST = 1400;   // 170px 두꺼운 글리프 기준
chars.forEach(function(c){
  c.style.strokeDasharray = EST + " " + EST;
  c.style.strokeDashoffset = EST;
});
var track = document.querySelector(".scroll-track");
function clamp01(x){ return Math.max(0, Math.min(1, x)); }
window.addEventListener("scroll", function(){
  var rect = track.getBoundingClientRect();
  var p = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));
  var fillP = clamp01((p - 0.78) / 0.18);
  chars.forEach(function(c, i){
    var start = 0.05 + i * 0.16;          // 글자별 stagger
    var t = clamp01((p - start) / 0.26);
    c.style.strokeDashoffset = EST * (1 - t);
    c.style.fillOpacity = fillP;
  });
}, { passive: true });`,
    explain: 'SVG <text>는 geometry 요소가 아니라 getTotalLength()를 쓸 수 없다 — 대신 글리프 윤곽 길이를 추정 상수(EST)로 잡고 dasharray/dashoffset을 건다. 추정값이 실제보다 약간 크면 드로잉이 살짝 일찍 끝날 뿐 시각적 파탄은 없으므로 넉넉히(170px 굵은 글리프 기준 1400) 잡는 게 요령. 글자를 한 글자씩 별도 <text>로 분리해 [0.05 + i × 0.16, +0.26] 구간으로 stagger하면 D→R→A→W가 순서대로 그려진다. fill은 [0.78, 0.96]에서 0→1로 차올라 외곽선 타이포가 솔리드로 마감된다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (라이브러리 0)' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '매핑', value: '글자별 stagger [0.05 + i × 0.16, +0.26]' },
      { label: '길이 추정', value: 'EST = 1400 (text는 getTotalLength 불가)' },
      { label: 'fill 마감', value: '[0.78, 0.96] fillOpacity 0→1' },
      { label: '권장', value: '영문 대문자 3~6자 (굵은 weight)' }
    ],
    guide: '거대 워드마크의 드라마틱한 등장에 사용한다. 정밀한 윤곽 드로잉이 필요하면 폰트를 일러스트레이터에서 패스로 아웃라인화해 <path>로 변환 — 그러면 getTotalLength()가 정확히 동작한다(대신 텍스트 접근성·SEO를 위해 aria-label 병기). 데모의 추정 상수 방식은 빌드 도구 없이 즉시 쓰는 실용 절충안. stroke-width 1.5~2.5가 적당하며, 두꺼우면 글리프 모서리에서 획이 겹쳐 지저분해진다. 한글은 곡획·교차가 많아 드로잉 윤곽이 복잡하게 보이므로 영문 대문자가 안전하다.',
    recommendations: [
      { place: '히어로 헤더', body: '브랜드명 워드마크가 외곽선으로 그려진 뒤 솔리드로 차오르는 오프닝 — 패션·에이전시 사이트의 단골' },
      { place: '랜딩 페이지', body: '캠페인 키워드("NEW", "2026")가 섹션 전환부에서 아웃라인 드로잉으로 등장' },
      { place: '제품 섹션', body: '신제품 이름의 티저 연출 — 외곽선만 먼저 보여주고 스크롤이 끝나야 실체(fill)가 드러남' },
      { place: '포트폴리오 소개', body: '이니셜 모노그램(JD·KIM)을 드로잉으로 — 명함의 각인 같은 첫인상' }
    ],
    tradeoff: '<text> stroke 드로잉은 윤곽 길이를 추정에 의존하므로 글자별 완성 타이밍에 미세한 오차가 있다 — 완벽 동기가 필요하면 패스 아웃라인화가 정석. 가변 폰트 로딩 전에 측정 없이 상수를 쓰므로 FOUT 영향도 없지만, 폰트 미로딩 시 폴백 글꼴로 드로잉되는 것은 막을 수 없다.'
  },

  // ───────────────────────────── 10. arrow-guide
  {
    id: 'arrow-guide',
    num: '10',
    title: '화살표 가이드',
    summary: '섹션의 두 콘텐츠 블록(STEP 1 → STEP 2)을 잇는 곡선 화살표가 스크롤을 따라 그려지고, 선이 도착하면 화살촉이 나타나며 목적지 카드가 밝아진다.',
    demo: {
      bodyHTML: `<div class="guide-wrap">
  <svg class="guide-svg" viewBox="0 0 760 400" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
    <path class="guide-arrow" d="M 215 92 C 380 50 280 230 420 282 C 470 300 510 298 538 290"/>
    <path class="guide-head" d="M 520 272 L 548 292 L 518 306"/>
  </svg>
  <div class="guide-card guide-card-a">
    <span class="guide-step">STEP 1</span>
    <strong>아이디어</strong>
    <span class="guide-desc">스케치에서 시작합니다</span>
  </div>
  <div class="guide-card guide-card-b">
    <span class="guide-step">STEP 2</span>
    <strong>런칭</strong>
    <span class="guide-desc">화살표가 닿으면 완성</span>
  </div>
</div>`,
      css: `.guide-wrap { position: relative; width: min(760px, 90vw); aspect-ratio: 760 / 400; }
.guide-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.guide-arrow { stroke: #fff; stroke-width: 3.5; stroke-linecap: round; }
.guide-head { stroke: #fff; stroke-width: 3.5; stroke-linecap: round; stroke-linejoin: round; opacity: 0; }
.guide-card { position: absolute; display: flex; flex-direction: column; gap: 6px; padding: 18px 22px; border: 1px solid rgba(255,255,255,0.18); border-radius: 14px; background: rgba(255,255,255,0.04); }
.guide-card strong { font: 700 24px/1.2 ${FONT_STACK}; color: #fff; }
.guide-step { font: 600 11px/1 ui-monospace, SFMono-Regular, Menlo, monospace; color: rgba(255,255,255,0.4); letter-spacing: 0.14em; }
.guide-desc { font: 500 14px/1.5 ${FONT_STACK}; color: rgba(255,255,255,0.55); }
.guide-card-a { left: 2%; top: 6%; }
.guide-card-b { right: 2%; bottom: 6%; opacity: 0.25; }`,
      script: `var arrow = document.querySelector(".guide-arrow");
var head = document.querySelector(".guide-head");
var cardB = document.querySelector(".guide-card-b");
var L = arrow.getTotalLength();
arrow.style.strokeDasharray = L + " " + L;
arrow.style.strokeDashoffset = L;
function clamp01(x){ return Math.max(0, Math.min(1, x)); }
function applyReveal(p){
  var t = clamp01((p - 0.08) / 0.72);
  arrow.style.strokeDashoffset = L * (1 - t);
  var headP = clamp01((p - 0.8) / 0.1);
  head.style.opacity = headP;
  var bP = clamp01((p - 0.84) / 0.14);
  cardB.style.opacity = 0.25 + 0.75 * bP;
}`,
      height: 520
    },
    snippetHTML: `<div class="guide-wrap">
  <svg class="guide-svg" viewBox="0 0 760 400" fill="none">
    <path class="guide-arrow" d="M 215 92 C 380 50 280 230 420 282 C 470 300 510 298 538 290"/>
    <path class="guide-head" d="M 520 272 L 548 292 L 518 306"/>
  </svg>
  <div class="guide-card guide-card-a">아이디어</div>
  <div class="guide-card guide-card-b">런칭</div>
</div>`,
    snippetCSS: `.guide-wrap { position: relative; aspect-ratio: 760 / 400; }
.guide-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.guide-arrow { stroke: #fff; stroke-width: 3.5; stroke-linecap: round; }
.guide-head { opacity: 0; }
.guide-card { position: absolute; }
.guide-card-a { left: 2%; top: 6%; }
.guide-card-b { right: 2%; bottom: 6%; opacity: 0.25; }`,
    snippetJS: `var arrow = document.querySelector(".guide-arrow");
var head = document.querySelector(".guide-head");
var cardB = document.querySelector(".guide-card-b");
var L = arrow.getTotalLength();
arrow.style.strokeDasharray = L + " " + L;
arrow.style.strokeDashoffset = L;
var track = document.querySelector(".scroll-track");
function clamp01(x){ return Math.max(0, Math.min(1, x)); }
window.addEventListener("scroll", function(){
  var rect = track.getBoundingClientRect();
  var p = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));
  arrow.style.strokeDashoffset = L * (1 - clamp01((p - 0.08) / 0.72));
  head.style.opacity = clamp01((p - 0.8) / 0.1);          // 화살촉 등장
  cardB.style.opacity = 0.25 + 0.75 * clamp01((p - 0.84) / 0.14);  // 목적지 점등
}, { passive: true });`,
    explain: 'HTML 카드와 SVG 오버레이의 하이브리드. 컨테이너에 aspect-ratio: 760/400을 고정하고 SVG를 absolute로 깔면, 카드(% 배치)와 viewBox 좌표가 같은 비율로 스케일돼 화살표 양 끝이 카드 모서리에 계속 닿는다. 곡선은 [0.08, 0.8]에서 dashoffset 드로잉, 화살촉은 별도의 짧은 꺾인 패스로 [0.8, 0.9]에서 opacity 등장 — 선두에 붙여 회전시키는 것보다 "도착 후 찍히는" 마침표 연출이 시각적으로 깔끔하다. 마지막으로 목적지 카드가 [0.84, 0.98]에서 0.25→1로 밝아져 인과가 완결된다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (라이브러리 0)' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '매핑', value: '곡선 [0.08, 0.8] → 화살촉 [0.8, 0.9] → 카드 [0.84, 0.98]' },
      { label: '화살촉', value: '별도 짧은 패스 — opacity 등장 (회전 추적 불필요)' },
      { label: '레이아웃', value: 'aspect-ratio 박스 + SVG absolute 오버레이' },
      { label: '권장', value: '섹션당 화살표 1~2개 (시선 유도 동선)' }
    ],
    guide: '프로세스·온보딩처럼 "A 다음 B"의 순서를 말하는 섹션에 사용한다. 화살표 시작점은 출발 카드의 우하단 모서리 근처, 끝점은 도착 카드의 좌상단 근처에 두면 시선 동선이 자연스럽다. 곡선은 S자 한 번이 적당 — 직선은 도식적이고, 과한 굽이는 유치해진다. 컨테이너 비율이 깨지는 좁은 화면에서는 카드가 겹칠 수 있으므로 모바일 브레이크포인트에서 세로 배치 + 직선 화살표로 강등(degrade)하는 분기 권장. 목적지 카드를 처음부터 1.0으로 보여주면 화살표의 서사가 죽으니 0.2~0.3으로 눌러둔다.',
    recommendations: [
      { place: '히어로 헤더', body: '헤드라인에서 CTA 버튼으로 흘러내리는 곡선 화살표 — 첫 행동 유도를 모션으로 안내' },
      { place: '랜딩 페이지', body: '"문제 → 해결" 비포·애프터 카드를 잇는 화살표로 서비스 가치의 인과를 시각화' },
      { place: '제품 섹션', body: '기능 A가 기능 B로 이어지는 워크플로 다이어그램 — 통합·자동화 제품의 연결 서사' },
      { place: '포트폴리오 소개', body: '"기획 → 디자인 → 개발" 작업 프로세스 3단계를 화살표 릴레이로 연결' }
    ],
    tradeoff: 'HTML 카드와 SVG 좌표의 정합은 aspect-ratio 고정에 의존한다 — 컨테이너 비율을 바꾸면 화살표 끝점이 카드에서 떨어지므로 양쪽을 항상 함께 수정해야 한다. 화살표가 3개 이상이면 시선이 분산돼 유도 효과가 사라진다.'
  }
];

// ============ Standalone demo HTML 빌더 (scroll-pin + progress) ============

function buildDemoHTML(p) {
  return '<!DOCTYPE html>\n'
    + '<html lang="ko">\n'
    + '<head>\n'
    + '  <meta charset="UTF-8">\n'
    + '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
    + '  <title>' + p.num + '. ' + p.title + ' — Scroll Demo</title>\n'
    + '  <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable-dynamic-subset.min.css" rel="stylesheet">\n'
    + '  <style>\n'
    + '    * { box-sizing: border-box; }\n'
    + '    html, body { margin: 0; padding: 0; }\n'
    + '    html { scroll-behavior: smooth; }\n'
    + '    body {\n'
    + '      background: #000; color: #fff;\n'
    + '      font-family: "Pretendard Variable", "Pretendard", -apple-system, system-ui, sans-serif;\n'
    + '      overflow-x: hidden;\n'
    + '      -webkit-font-smoothing: antialiased;\n'
    + '    }\n'
    + '    .demo-controls {\n'
    + '      position: fixed; top: 16px; left: 16px;\n'
    + '      display: inline-flex; align-items: center; gap: 10px;\n'
    + '      z-index: 20;\n'
    + '    }\n'
    + '    .demo-reset {\n'
    + '      font: 600 11px/1 ui-monospace, SFMono-Regular, Menlo, monospace;\n'
    + '      color: rgba(255,255,255,0.72);\n'
    + '      background: rgba(255,255,255,0.08);\n'
    + '      border: 1px solid rgba(255,255,255,0.16);\n'
    + '      border-radius: 999px;\n'
    + '      padding: 8px 14px; cursor: pointer;\n'
    + '      transition: color 160ms, background 160ms, border-color 160ms;\n'
    + '    }\n'
    + '    .demo-reset:hover {\n'
    + '      color: #fff; background: rgba(255,255,255,0.14); border-color: rgba(255,255,255,0.32);\n'
    + '    }\n'
    + '    .demo-label {\n'
    + '      font: 500 10px/1 ui-monospace, SFMono-Regular, Menlo, monospace;\n'
    + '      color: rgba(255,255,255,0.3);\n'
    + '      letter-spacing: 0.14em; text-transform: uppercase;\n'
    + '    }\n'
    + '    .demo-hint {\n'
    + '      position: fixed; right: 16px; bottom: 24px;\n'
    + '      font: 500 10px/1 ui-monospace, SFMono-Regular, Menlo, monospace;\n'
    + '      color: rgba(255,255,255,0.45);\n'
    + '      letter-spacing: 0.18em; text-transform: uppercase;\n'
    + '      z-index: 20;\n'
    + '      animation: demo-hint-bounce 1.6s ease-in-out infinite;\n'
    + '    }\n'
    + '    @keyframes demo-hint-bounce {\n'
    + '      0%, 100% { transform: translateY(0); opacity: 0.45; }\n'
    + '      50%       { transform: translateY(4px); opacity: 0.8; }\n'
    + '    }\n'
    + '    .demo-progress {\n'
    + '      position: fixed; bottom: 0; left: 0; right: 0;\n'
    + '      height: 2px; background: rgba(255,255,255,0.06);\n'
    + '      z-index: 20;\n'
    + '    }\n'
    + '    .demo-progress > div {\n'
    + '      height: 100%; background: #fff; width: 0;\n'
    + '      transition: width 60ms linear;\n'
    + '    }\n'
    + '    .scroll-track { min-height: 240vh; position: relative; }\n'
    + '    .sticky-stage {\n'
    + '      position: sticky; top: 0;\n'
    + '      height: 100vh;\n'
    + '      display: flex; align-items: center; justify-content: center;\n'
    + '      padding: 80px 8vw 60px;\n'
    + '      overflow: hidden;\n'
    + '    }\n'
    + '    /* 패턴별 CSS */\n'
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
    + '\n'
    + '      // 패턴별 init + applyReveal 정의\n'
    + '      ' + p.demo.script.replace(/\n/g, '\n      ') + '\n'
    + '\n'
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

// ============ 분석 보고서 블록 빌더 ============

function buildPatternSection(p) {
  const blocks = [
    { type: 'text', value: p.summary },
    { type: 'heading', value: '라이브 데모' },
    {
      type: 'component',
      embed: 'demos/scroll-path-draw/' + p.id + '.html',
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
      items: p.recommendations.map(r => ({ label: r.place, tag: '', desc: r.body }))
    },
    { type: 'note', value: '트레이드오프 — ' + p.tradeoff }
  ];

  return {
    title: p.num + '. ' + p.title,
    blocks: blocks
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
      { type: 'heading', value: '스크롤 패스 드로잉 — 패턴 카탈로그 v1 (scroll-pin + stroke-dashoffset 매핑)' },
      { type: 'text', value: CATEGORY.summary + ' 모든 패턴은 동일한 scroll-pin 보일러플레이트(.scroll-track 240vh + .sticky-stage 100vh)를 공유하고, applyReveal(progress) 안에서 path.getTotalLength() 기반 stroke-dasharray/dashoffset을 inline으로 매핑한다. 자동 재생은 없다 — 사용자가 스크롤을 멈추면 펜도 멈춘다.' },
      { type: 'heading', value: '10 패턴 인덱스' },
      { type: 'structure', items: indexItems },
      { type: 'heading', value: '공통 디자인 토큰 + draw 모델' },
      {
        type: 'kv', columns: 2, items: [
          { label: '폰트', value: 'Pretendard Variable (캡션·라벨·SVG text)' },
          { label: '배경 / 선 색', value: '#000 / #fff · 가이드선 rgba(255,255,255,0.1)' },
          { label: 'Scroll 모델', value: '.scroll-track 240vh + .sticky-stage 100vh (position:sticky top:0)' },
          { label: '진행률 계산', value: 'p = clamp(0, -rect.top / (rect.height - innerHeight), 1)' },
          { label: 'Draw 공식', value: 'L = path.getTotalLength() → dasharray "L L" + dashoffset L × (1 − p)' },
          { label: '접근성', value: 'prefers-reduced-motion 시 dashoffset 0 고정(완성 상태) + aria-hidden 장식 SVG' }
        ]
      },
      { type: 'heading', value: '읽기 가이드' },
      {
        type: 'structure', items: [
          { label: '라이브 데모', tag: 'IFRAME', desc: 'demos/scroll-path-draw/{pattern}.html 의 standalone 페이지를 iframe으로 임베드. iframe 안에서 스크롤하면 진행률만큼 선이 그려진다. ↻ 다시 보기로 처음으로' },
          { label: '작동 원리', tag: 'HOW', desc: '진행률(0~1)을 dashoffset·getPointAtLength·fill에 어떻게 매핑하는지 핵심 메커니즘' },
          { label: '정량 메타', tag: 'KV', desc: '의존성 / 트리거 / 매핑 공식 / 매핑 구간 / 패스 수 / 권장 사용량' },
          { label: '코드 스니펫', tag: 'CODE', desc: 'HTML / CSS / JS 세 블록. sticky track + scroll handler 포함' },
          { label: '사용 가이드', tag: 'GUIDE', desc: '어떻게 사용하나 — 패스 길이·획수·농도·반응형·접근성 주의점' },
          { label: '활용 추천', tag: 'PLACES', desc: '히어로 헤더 / 랜딩 페이지 / 제품 섹션 / 포트폴리오 소개의 4가지 컨텍스트 활용' },
          { label: '트레이드오프', tag: 'NOTE', desc: '성능·접근성·권장 사용처에 대한 한 줄 메모' }
        ]
      },
      {
        type: 'note',
        value: '참고 자료: Codrops (tympanus.net/codrops) 의 SVG line drawing / scroll-driven animation 튜토리얼 계열 — stroke-dasharray·stroke-dashoffset 테크닉과 진행률 스크럽 문법을 차용. 본 카탈로그는 단일 데모가 아닌 10가지 드로잉 매핑 패턴 비교 카탈로그를 지향한다. 모든 SVG는 인라인 자작(외부 이미지 0)이고, 자동 재생 없이 사용자가 iframe 안에서 스크롤할 때만 드로잉이 진행되며, ↻ 다시 보기 버튼이 scroll position을 0으로 리셋한다.'
      }
    ]
  };
}

// ============ 메인 ============
function main() {
  // 1) standalone demo HTML 10개
  mkdirSync(DEMO_DIR, { recursive: true });
  for (const p of PATTERNS) {
    const html = buildDemoHTML(p);
    const file = join(DEMO_DIR, p.id + '.html');
    writeFileSync(file, html, 'utf-8');
    console.log('✓ demos/scroll-path-draw/' + p.id + '.html');
  }

  // 2) analysis.json
  const sections = { overview: buildOverview() };
  for (const p of PATTERNS) {
    sections[p.id] = buildPatternSection(p);
  }
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

  console.log('✓ analyses/scroll-path-draw/analysis.json');
  console.log('  ' + PATTERNS.length + ' patterns + 1 overview = ' + (PATTERNS.length + 1) + ' sections');
  const totalBlocks = Object.values(sections).reduce((acc, s) => acc + s.blocks.length, 0);
  console.log('  ' + totalBlocks + ' blocks total');
}

main();
