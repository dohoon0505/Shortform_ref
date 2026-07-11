#!/usr/bin/env node
/**
 * Interaction Lab — Category Generator: Custom Cursor (v1)
 * Cuberto 시그니처 참고 — 10종 커스텀 커서 인터랙션 카탈로그
 *
 * - mousemove + rAF lerp 추적 (스크롤 매핑 아님)
 * - cursor:none 스테이지 + hover 대상 2~3개 + 터치 폴백 안내
 * - 다크 배경(#0a0a0a) + Pretendard Variable + 한국어 본문
 *
 * Usage: node scripts/generate-custom-cursor.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ANALYSIS_DIR = join(ROOT, 'analyses', 'custom-cursor');
const ANALYSIS_FILE = join(ANALYSIS_DIR, 'analysis.json');
const DEMO_DIR = join(ROOT, 'demos', 'custom-cursor');

const CATEGORY = {
  id: 'custom-cursor',
  title: '커스텀 커서',
  type: 'category',
  date: '2026-06-10',
  url: 'https://cuberto.com/',
  summary: '네이티브 커서를 숨기고 rAF lerp 보간으로 따라오는 커스텀 커서가 hover 대상에 따라 모양·크기·라벨로 변신하는 10가지 패턴. Cuberto·Awwwards 수상작의 시그니처 — 사이트 전체 무드를 한 번에 바꾸는 커서 축의 본진.'
};

/* ================================================================
   공통 CSS — cursor:none 스테이지 + hover 대상 + 커서 레이어
   ================================================================ */

const BASE_CSS = ''
  + '.stage { position: relative; width: 100%; height: 100vh; overflow: hidden; cursor: none;\n'
  + '  display: flex; flex-direction: column; align-items: center; justify-content: center;\n'
  + '  gap: 26px; padding: 56px 24px; }\n'
  + '.stage * { cursor: none; }\n'
  + '.stage-eyebrow { font: 600 10px/1 "Pretendard Variable","Pretendard",sans-serif; letter-spacing: 0.22em; text-transform: uppercase; color: rgba(255,255,255,0.38); }\n'
  + '.stage-title { margin: 0; font: 700 clamp(22px,4.2vw,36px)/1.35 "Pretendard Variable","Pretendard",sans-serif; letter-spacing: -0.01em; text-align: center; }\n'
  + '.stage-row { display: flex; gap: 14px; align-items: center; justify-content: center; flex-wrap: wrap; }\n'
  + '.tgt-link { font: 600 14px/1 "Pretendard Variable","Pretendard",sans-serif; color: rgba(255,255,255,0.85); text-decoration: none;\n'
  + '  padding: 13px 24px; border: 1px solid rgba(255,255,255,0.16); border-radius: 999px;\n'
  + '  transition: border-color 0.25s ease, background 0.25s ease; }\n'
  + '.tgt-link:hover { border-color: rgba(255,255,255,0.45); background: rgba(255,255,255,0.06); }\n'
  + '.cursor-el { position: absolute; top: 0; left: 0; z-index: 60; pointer-events: none; will-change: transform;\n'
  + '  opacity: 0; transition: opacity 0.25s ease; }\n'
  + '.stage.is-on .cursor-el { opacity: 1; }\n';

/* ================================================================
   공통 JS — 스테이지 좌표 추적 + lerp 헬퍼
   ================================================================ */

const COMMON_JS = ''
  + 'var stage = document.querySelector(".stage");\n'
  + 'var mx = stage.offsetWidth / 2;\n'
  + 'var my = stage.offsetHeight / 2;\n'
  + 'stage.addEventListener("mousemove", function(e){\n'
  + '  var r = stage.getBoundingClientRect();\n'
  + '  mx = e.clientX - r.left;\n'
  + '  my = e.clientY - r.top;\n'
  + '  stage.classList.add("is-on");\n'
  + '});\n'
  + 'stage.addEventListener("mouseleave", function(){\n'
  + '  stage.classList.remove("is-on");\n'
  + '});\n'
  + 'function lerp(a, b, t){ return a + (b - a) * t; }\n';

/* 09 image-trail 풀 마크업 (10개 정적 생성) */
let TRAIL_ITEMS = '';
for (let i = 0; i < 10; i++) TRAIL_ITEMS += '  <div class="trail-item trail-g' + (i % 4) + '"></div>\n';

/* ================================================================
   10 패턴 정의
   ================================================================ */

const PATTERNS = [
  // ── 01. dot-ring (시그니처) ──
  {
    id: 'dot-ring', num: '01', title: '도트 + 링 듀오 (시그니처)',
    summary: '본체 도트는 마우스를 즉시 추적하고, 외곽 링은 lerp 0.15로 한 박자 늦게 따라오는 커스텀 커서의 가장 표준적인 형태. 링크·버튼 hover 시 링이 1.9배로 확대되어 클릭 가능 영역을 안내한다.',
    demo: {
      stageHTML: '<main class="stage">\n'
        + '  <span class="stage-eyebrow">Signature Cursor</span>\n'
        + '  <h1 class="stage-title">도트는 즉시, 링은 한 박자 늦게</h1>\n'
        + '  <nav class="stage-row">\n'
        + '    <a class="tgt-link" data-hover href="#" onclick="return false">프로젝트</a>\n'
        + '    <a class="tgt-link" data-hover href="#" onclick="return false">스튜디오</a>\n'
        + '    <a class="tgt-link" data-hover href="#" onclick="return false">연락하기</a>\n'
        + '  </nav>\n'
        + '  <div class="cursor-el cursor-dot"></div>\n'
        + '  <div class="cursor-el cursor-ring"></div>\n'
        + '</main>',
      css: '.cursor-dot { width: 8px; height: 8px; margin: -4px 0 0 -4px; border-radius: 50%; background: #fff; }\n'
        + '.cursor-ring { width: 40px; height: 40px; margin: -20px 0 0 -20px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.6); }',
      js: 'var dot = stage.querySelector(".cursor-dot");\n'
        + 'var ring = stage.querySelector(".cursor-ring");\n'
        + 'var rx = mx, ry = my;\n'
        + 'var ringScale = 1, targetScale = 1;\n'
        + 'stage.addEventListener("mousemove", function(e){\n'
        + '  targetScale = e.target.closest("[data-hover]") ? 1.9 : 1;\n'
        + '});\n'
        + 'function frame(){\n'
        + '  rx = lerp(rx, mx, 0.15);\n'
        + '  ry = lerp(ry, my, 0.15);\n'
        + '  ringScale = lerp(ringScale, targetScale, 0.18);\n'
        + '  dot.style.transform = "translate(" + mx.toFixed(1) + "px," + my.toFixed(1) + "px)";\n'
        + '  ring.style.transform = "translate(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px) scale(" + ringScale.toFixed(3) + ")";\n'
        + '  requestAnimationFrame(frame);\n'
        + '}\n'
        + 'frame();',
      height: 480
    },
    snippetHTML: '<div class="cursor-dot"></div>\n<div class="cursor-ring"></div>\n\n<a class="tgt-link" data-hover href="#">프로젝트</a>',
    snippetCSS: 'body { cursor: none; }\n.cursor-dot, .cursor-ring { position: fixed; top: 0; left: 0;\n  border-radius: 50%; pointer-events: none; z-index: 9999; }\n.cursor-dot { width: 8px; height: 8px; margin: -4px 0 0 -4px; background: #fff; }\n.cursor-ring { width: 40px; height: 40px; margin: -20px 0 0 -20px;\n  border: 1.5px solid rgba(255,255,255,0.6); }',
    snippetJS: 'var mx = 0, my = 0, rx = 0, ry = 0, scale = 1, target = 1;\ndocument.addEventListener("mousemove", function(e){\n  mx = e.clientX; my = e.clientY;\n  target = e.target.closest("[data-hover]") ? 1.9 : 1;\n});\n(function frame(){\n  rx += (mx - rx) * 0.15;            // 링만 lerp 0.15 지연\n  ry += (my - ry) * 0.15;\n  scale += (target - scale) * 0.18;\n  dot.style.transform = "translate(" + mx + "px," + my + "px)";\n  ring.style.transform = "translate(" + rx + "px," + ry + "px) scale(" + scale + ")";\n  requestAnimationFrame(frame);\n})();',
    explain: '본체 도트는 mousemove 좌표를 그대로 받아 즉시 이동하고, 외곽 링은 rAF 루프에서 lerp(현재, 목표, 0.15)로 매 프레임 15%씩만 따라와 한 박자 늦은 탄성 추적이 생긴다. hover 대상([data-hover]) 위에서는 링의 목표 scale이 1→1.9로 커지고, scale 역시 lerp 0.18로 보간되어 부드럽게 확대·축소된다. 도트(즉시)와 링(지연)의 속도 차가 이 패턴의 시그니처 — 정밀한 포인팅감과 유려한 모션감을 동시에 얻는다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (rAF lerp)' },
      { label: '트리거', value: 'mousemove → 도트 즉시 / 링 lerp 추적' },
      { label: 'lerp 계수', value: '링 위치 0.15 + 링 scale 0.18' },
      { label: '커서 구성', value: '8px 도트 + 40px 링 (1.5px 보더)' },
      { label: '핵심', value: '이중 추적 속도 차 + hover 시 링 scale 1.9' },
      { label: '참고', value: 'Cuberto / Awwwards 수상작 시그니처' }
    ],
    guide: 'lerp 계수는 0.12~0.2가 적정 — 낮을수록 링이 더 게으르게 따라온다. 도트와 링의 transform은 반드시 같은 rAF 루프에서 갱신해 프레임 어긋남을 방지한다. 클릭 가능한 요소에 data-hover 속성을 일괄 부여하면 mousemove의 closest() 한 번으로 상태 감지가 끝난다. 터치 환경에서는 cursor:none을 해제하고 커서 요소를 숨기는 @media (hover: none) 폴백이 필수.',
    recommendations: [
      { place: '히어로 헤더', body: '사이트 전체 커서 시스템의 기본값 — 첫 화면부터 무드 전환' },
      { place: '랜딩 페이지', body: 'CTA·내비 링크에서 링 확대 — 클릭 가능 영역을 직관적으로 안내' },
      { place: '제품 섹션', body: '제품 카드 hover 시 링 확대로 탐색 피드백 강화' },
      { place: '포트폴리오 소개', body: 'Cuberto류 에이전시 무드 연출 — 가장 안전한 시그니처 선택' }
    ],
    tradeoff: 'rAF 루프가 항상 돌므로 유휴 시에도 미세한 CPU 사용. 터치 기기에서는 무의미하므로 (hover: none) 분기 필수. 네이티브 커서 대비 포인팅 정밀도가 떨어져 보일 수 있어 도트만은 즉시 추적으로 유지하는 것이 안전.'
  },

  // ── 02. blend-invert ──
  {
    id: 'blend-invert', num: '02', title: '블렌드 인버트',
    summary: 'mix-blend-mode: difference를 적용한 흰 원이 지나는 자리의 색을 반전시킨다. 다크 배경에서는 흰 원으로, 흰 텍스트·밝은 패널 위에서는 검정으로 뒤집혀 배경색 분기 로직 없이 모든 톤에 자동 대응.',
    demo: {
      stageHTML: '<main class="stage stage-blend">\n'
        + '  <span class="stage-eyebrow">Mix-Blend Difference</span>\n'
        + '  <h1 class="stage-title" data-hover>지나는 자리의 색이 반전됩니다</h1>\n'
        + '  <div class="stage-row">\n'
        + '    <div class="invert-card" data-hover>밝은 패널 위에서는<br>원이 검정으로 반전</div>\n'
        + '    <a class="tgt-link" data-hover href="#" onclick="return false">반전 체험하기</a>\n'
        + '  </div>\n'
        + '  <div class="cursor-el cursor-blend"></div>\n'
        + '</main>',
      css: '.stage-blend { isolation: isolate; }\n'
        + '.cursor-blend { width: 44px; height: 44px; margin: -22px 0 0 -22px; border-radius: 50%; background: #fff; mix-blend-mode: difference; }\n'
        + '.invert-card { background: #f2f0ea; color: #141414; padding: 20px 26px; border-radius: 14px; font: 600 14px/1.6 "Pretendard Variable","Pretendard",sans-serif; text-align: center; }',
      js: 'var cur = stage.querySelector(".cursor-blend");\n'
        + 'var cx = mx, cy = my;\n'
        + 'var s = 1, ts = 1;\n'
        + 'stage.addEventListener("mousemove", function(e){\n'
        + '  ts = e.target.closest("[data-hover]") ? 2.4 : 1;\n'
        + '});\n'
        + 'function frame(){\n'
        + '  cx = lerp(cx, mx, 0.18);\n'
        + '  cy = lerp(cy, my, 0.18);\n'
        + '  s = lerp(s, ts, 0.15);\n'
        + '  cur.style.transform = "translate(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px) scale(" + s.toFixed(3) + ")";\n'
        + '  requestAnimationFrame(frame);\n'
        + '}\n'
        + 'frame();',
      height: 480
    },
    snippetHTML: '<div class="cursor-blend"></div>\n\n<h1 data-hover>지나는 자리의 색이 반전됩니다</h1>',
    snippetCSS: 'body { cursor: none; isolation: isolate; }\n.cursor-blend { position: fixed; top: 0; left: 0;\n  width: 44px; height: 44px; margin: -22px 0 0 -22px;\n  border-radius: 50%; background: #fff;\n  mix-blend-mode: difference;\n  pointer-events: none; z-index: 9999; }',
    snippetJS: 'var mx = 0, my = 0, cx = 0, cy = 0, s = 1, ts = 1;\ndocument.addEventListener("mousemove", function(e){\n  mx = e.clientX; my = e.clientY;\n  ts = e.target.closest("[data-hover]") ? 2.4 : 1;   // hover 시 반전 영역 확대\n});\n(function frame(){\n  cx += (mx - cx) * 0.18;\n  cy += (my - cy) * 0.18;\n  s += (ts - s) * 0.15;\n  cur.style.transform = "translate(" + cx + "px," + cy + "px) scale(" + s + ")";\n  requestAnimationFrame(frame);\n})();',
    explain: '흰색 원에 mix-blend-mode: difference를 적용하면 원이 지나는 픽셀마다 RGB 채널이 255에서 감산되어 색이 반전된다 — 검정 배경 위에서는 흰 원으로 보이고, 흰 텍스트·밝은 패널 위에서는 검정으로 뒤집힌다. 위치는 lerp 0.18로 추적하고, hover 대상 위에서는 scale 2.4로 확대되어 반전 영역이 넓어진다. 부모에 isolation: isolate를 주면 블렌딩 범위가 스테이지 내부로 한정된다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS + CSS mix-blend-mode' },
      { label: '트리거', value: 'mousemove → lerp 0.18 추적 + hover scale 2.4' },
      { label: '블렌드', value: 'mix-blend-mode: difference (순수 #fff 원)' },
      { label: '커서 구성', value: '44px 단일 원' },
      { label: '핵심', value: '배경색과 무관한 자동 반전 — 다크/라이트 모두 대응' },
      { label: '참고', value: 'Cuberto / Dennis Snellenberg 포트폴리오' }
    ],
    guide: '커서 원은 반드시 순수한 흰색(#fff)이어야 완전 반전이 일어난다 — 회색이면 반전이 흐릿해진다. isolation: isolate를 블렌드 경계 컨테이너에 지정해 의도치 않은 합성 누출을 방지. 사진 위에서는 보색 반전이 일어나 산만할 수 있으므로 타이포그래피·플랫 컬러 중심 레이아웃에서 가장 효과적이다.',
    recommendations: [
      { place: '히어로 헤더', body: '대형 타이포 히어로 — 글자 위를 지날 때 반전되는 드라마틱 연출' },
      { place: '랜딩 페이지', body: '다크/라이트 섹션이 섞인 페이지 — 커서 색 분기 로직 없이 자동 대응' },
      { place: '제품 섹션', body: '흑백 대비가 강한 미니멀 제품 소개 — 시선 포인트 생성' },
      { place: '포트폴리오 소개', body: '타이포 중심 포트폴리오 — 커서 하나로 인터랙티브 무드 완성' }
    ],
    tradeoff: 'mix-blend-mode는 GPU 합성 비용이 있어 저사양 기기에서 프레임 저하 가능. Safari 일부 버전에서 fixed 요소 + blend 조합 버그 이력. 사진·일러스트 위에서는 반전 결과가 지저분해 보일 수 있음.'
  },

  // ── 03. label-cursor ──
  {
    id: 'label-cursor', num: '03', title: '라벨 커서',
    summary: '기본 14px 점이 작업물 카드 위에서 78×34px 캡슐로 확장되며 VIEW 라벨이 떠오른다. 커서 자체가 "클릭하면 볼 수 있다"는 CTA 역할을 수행하는 Awwwards 갤러리의 단골 패턴.',
    demo: {
      stageHTML: '<main class="stage">\n'
        + '  <span class="stage-eyebrow">Label Cursor</span>\n'
        + '  <h1 class="stage-title">작업물 위에서 VIEW로 변신</h1>\n'
        + '  <div class="stage-row">\n'
        + '    <figure class="work-card work-a" data-cursor="view"><figcaption class="work-name">네온 시티</figcaption></figure>\n'
        + '    <figure class="work-card work-b" data-cursor="view"><figcaption class="work-name">선셋 그라디언트</figcaption></figure>\n'
        + '  </div>\n'
        + '  <a class="tgt-link" data-cursor="view" href="#" onclick="return false">전체 작업 보기</a>\n'
        + '  <div class="cursor-el cursor-view"><span class="view-core"><span class="view-label">VIEW</span></span></div>\n'
        + '</main>',
      css: '.work-card { margin: 0; width: 190px; height: 124px; border-radius: 14px; position: relative; overflow: hidden; }\n'
        + '.work-a { background: linear-gradient(135deg, #6d28d9, #2563eb); }\n'
        + '.work-b { background: linear-gradient(135deg, #ea580c, #db2777); }\n'
        + '.work-card::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.45)); }\n'
        + '.work-name { position: absolute; left: 14px; bottom: 12px; z-index: 1; font: 600 13px/1 "Pretendard Variable","Pretendard",sans-serif; color: #fff; }\n'
        + '.view-core { display: flex; align-items: center; justify-content: center; transform: translate(-50%, -50%);\n'
        + '  width: 14px; height: 14px; border-radius: 999px; background: #fff; overflow: hidden;\n'
        + '  transition: width 0.25s cubic-bezier(0.2,0,0,1), height 0.25s cubic-bezier(0.2,0,0,1); }\n'
        + '.view-label { font: 700 11px/1 "Pretendard Variable","Pretendard",sans-serif; letter-spacing: 0.12em; color: #000;\n'
        + '  opacity: 0; transform: scale(0.6); transition: opacity 0.2s ease, transform 0.25s ease; white-space: nowrap; }\n'
        + '.cursor-view.is-view .view-core { width: 78px; height: 34px; }\n'
        + '.cursor-view.is-view .view-label { opacity: 1; transform: scale(1); }',
      js: 'var cur = stage.querySelector(".cursor-view");\n'
        + 'var cx = mx, cy = my;\n'
        + 'stage.addEventListener("mousemove", function(e){\n'
        + '  cur.classList.toggle("is-view", !!e.target.closest("[data-cursor=view]"));\n'
        + '});\n'
        + 'function frame(){\n'
        + '  cx = lerp(cx, mx, 0.16);\n'
        + '  cy = lerp(cy, my, 0.16);\n'
        + '  cur.style.transform = "translate(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px)";\n'
        + '  requestAnimationFrame(frame);\n'
        + '}\n'
        + 'frame();',
      height: 520
    },
    snippetHTML: '<figure class="work-card" data-cursor="view">…</figure>\n\n<div class="cursor-view">\n  <span class="view-core"><span class="view-label">VIEW</span></span>\n</div>',
    snippetCSS: '.view-core { display: flex; align-items: center; justify-content: center;\n  transform: translate(-50%, -50%);\n  width: 14px; height: 14px; border-radius: 999px; background: #fff;\n  overflow: hidden;\n  transition: width 0.25s cubic-bezier(0.2,0,0,1),\n    height 0.25s cubic-bezier(0.2,0,0,1); }\n.view-label { opacity: 0; transform: scale(0.6);\n  transition: opacity 0.2s ease, transform 0.25s ease; }\n.cursor-view.is-view .view-core { width: 78px; height: 34px; }\n.cursor-view.is-view .view-label { opacity: 1; transform: scale(1); }',
    snippetJS: 'document.addEventListener("mousemove", function(e){\n  mx = e.clientX; my = e.clientY;\n  cur.classList.toggle("is-view", !!e.target.closest("[data-cursor=view]"));\n});\n(function frame(){\n  cx += (mx - cx) * 0.16;\n  cy += (my - cy) * 0.16;\n  cur.style.transform = "translate(" + cx + "px," + cy + "px)";\n  requestAnimationFrame(frame);\n})();',
    explain: '기본 상태는 14px 흰 점이지만, data-cursor=view 대상 위에서 .is-view 클래스가 토글되어 캡슐(78×34px)로 확장되고 안의 VIEW 라벨이 scale 0.6→1 + opacity로 떠오른다. 모양 전환은 width/height transition(250ms)으로, 위치 추적은 rAF lerp 0.16으로 분리되어 변신과 이동이 서로 간섭하지 않는다. 라벨 문구는 대상마다 바꿔치기할 수 있어 PLAY·DRAG·OPEN 등으로 확장 가능.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (rAF lerp + 클래스 토글)' },
      { label: '트리거', value: 'data-cursor=view hover → .is-view 토글' },
      { label: 'lerp 계수', value: '위치 0.16' },
      { label: '확장', value: '14px 점 → 78×34px 캡슐 (250ms cubic-bezier)' },
      { label: '핵심', value: '모양 전환(CSS transition)과 추적(rAF)의 역할 분리' },
      { label: '참고', value: 'Awwwards 갤러리 / Obys Agency' }
    ],
    guide: '캡슐 크기는 라벨 글자 수에 맞춰 width만 조절 — height 34px 고정이 안정적이다. 라벨을 동적으로 바꾸려면 대상의 data-cursor-label 값을 읽어 textContent를 갱신하는 식으로 확장한다. 캡슐이 커져도 실제 클릭을 막지 않도록 pointer-events: none을 반드시 유지. 라벨은 2~6자(VIEW, OPEN, 보기)가 적정.',
    recommendations: [
      { place: '히어로 헤더', body: '히어로 비주얼 위 VIEW 라벨 — 첫 화면에서 탐색 가능성 암시' },
      { place: '랜딩 페이지', body: '케이스 스터디 카드 — 커서 라벨로 "자세히 보기" 버튼 대체' },
      { place: '제품 섹션', body: '제품 갤러리 — 이미지 위 ZOOM 라벨로 확대 가능함을 안내' },
      { place: '포트폴리오 소개', body: '작업물 썸네일 그리드 — VIEW 커서가 CTA 역할까지 수행' }
    ],
    tradeoff: '라벨이 커서를 따라다니므로 빠른 이동 시 라벨 가독성 저하. 보조 기술 사용자는 커서 라벨을 인지할 수 없으므로 실제 버튼·링크 텍스트는 별도로 존재해야 함(접근성).'
  },

  // ── 04. magnetic-snap ──
  {
    id: 'magnetic-snap', num: '04', title: '마그네틱 스냅',
    summary: '버튼 중심 반경 110px에 들어서면 커서가 버튼 중심으로 흡착되고, 버튼도 커서 쪽으로 살짝 끌려온다. 거리 기반 연속 강도(1 − d/R)로 가까울수록 세게 당기는 상호 자석 인터랙션.',
    demo: {
      stageHTML: '<main class="stage">\n'
        + '  <span class="stage-eyebrow">Magnetic Snap</span>\n'
        + '  <h1 class="stage-title">가까이 가면 서로 끌어당깁니다</h1>\n'
        + '  <div class="stage-row">\n'
        + '    <button class="mag-btn" type="button">지금 시작하기</button>\n'
        + '    <button class="mag-btn" type="button">데모 신청</button>\n'
        + '  </div>\n'
        + '  <div class="cursor-el cursor-snap"></div>\n'
        + '</main>',
      css: '.mag-btn { font: 600 15px/1 "Pretendard Variable","Pretendard",sans-serif; color: #fff; background: rgba(255,255,255,0.06);\n'
        + '  border: 1px solid rgba(255,255,255,0.22); border-radius: 999px; padding: 18px 34px; will-change: transform; }\n'
        + '.cursor-snap { width: 12px; height: 12px; margin: -6px 0 0 -6px; border-radius: 50%; background: #fff; }',
      js: 'var cur = stage.querySelector(".cursor-snap");\n'
        + 'var btns = [].slice.call(stage.querySelectorAll(".mag-btn"));\n'
        + 'var centers = [];\n'
        + 'var bpos = btns.map(function(){ return { x: 0, y: 0 }; });\n'
        + 'var cx = mx, cy = my;\n'
        + 'var R = 110;\n'
        + 'function measure(){\n'
        + '  var sr = stage.getBoundingClientRect();\n'
        + '  centers = btns.map(function(b){\n'
        + '    b.style.transform = "translate(0px,0px)";\n'
        + '    var r = b.getBoundingClientRect();\n'
        + '    return { x: r.left - sr.left + r.width / 2, y: r.top - sr.top + r.height / 2 };\n'
        + '  });\n'
        + '}\n'
        + 'measure();\n'
        + 'window.addEventListener("resize", measure);\n'
        + 'function frame(){\n'
        + '  var tx = mx, ty = my, strength = 0;\n'
        + '  for (var i = 0; i < btns.length; i++){\n'
        + '    var dx = mx - centers[i].x;\n'
        + '    var dy = my - centers[i].y;\n'
        + '    var d = Math.sqrt(dx * dx + dy * dy);\n'
        + '    var gx = 0, gy = 0;\n'
        + '    if (d < R){\n'
        + '      var s = 1 - d / R;\n'
        + '      gx = dx * 0.3 * s;\n'
        + '      gy = dy * 0.3 * s;\n'
        + '      if (s > strength){\n'
        + '        strength = s;\n'
        + '        tx = mx - dx * 0.72 * s;\n'
        + '        ty = my - dy * 0.72 * s;\n'
        + '      }\n'
        + '    }\n'
        + '    bpos[i].x = lerp(bpos[i].x, gx, 0.18);\n'
        + '    bpos[i].y = lerp(bpos[i].y, gy, 0.18);\n'
        + '    btns[i].style.transform = "translate(" + bpos[i].x.toFixed(1) + "px," + bpos[i].y.toFixed(1) + "px)";\n'
        + '  }\n'
        + '  cx = lerp(cx, tx, 0.2);\n'
        + '  cy = lerp(cy, ty, 0.2);\n'
        + '  cur.style.transform = "translate(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px) scale(" + (1 + strength * 0.8).toFixed(3) + ")";\n'
        + '  requestAnimationFrame(frame);\n'
        + '}\n'
        + 'frame();',
      height: 480
    },
    snippetHTML: '<button class="mag-btn" type="button">지금 시작하기</button>\n<div class="cursor-snap"></div>',
    snippetCSS: '.mag-btn { will-change: transform; }\n.cursor-snap { position: fixed; top: 0; left: 0;\n  width: 12px; height: 12px; margin: -6px 0 0 -6px;\n  border-radius: 50%; background: #fff;\n  pointer-events: none; z-index: 9999; }',
    snippetJS: 'var R = 110;                                  // 흡착 반경\nfunction frame(){\n  var dx = mx - center.x, dy = my - center.y;\n  var d = Math.sqrt(dx * dx + dy * dy);\n  var tx = mx, ty = my, gx = 0, gy = 0;\n  if (d < R){\n    var s = 1 - d / R;                        // 거리 기반 강도\n    gx = dx * 0.3 * s; gy = dy * 0.3 * s;     // 버튼이 커서 쪽으로\n    tx = mx - dx * 0.72 * s;                  // 커서가 버튼 중심으로\n    ty = my - dy * 0.72 * s;\n  }\n  bx += (gx - bx) * 0.18; by += (gy - by) * 0.18;\n  btn.style.transform = "translate(" + bx + "px," + by + "px)";\n  cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;\n  cur.style.transform = "translate(" + cx + "px," + cy + "px)";\n  requestAnimationFrame(frame);\n}',
    explain: '버튼의 base 중심 좌표를 미리 측정해두고, 매 프레임 커서와의 거리 d를 계산한다. d가 반경 R(110px) 안이면 강도 s = 1 − d/R이 0→1로 연속 증가 — 커서 목표점은 버튼 중심 방향으로 s × 0.72만큼 당겨지고, 버튼은 반대로 커서 방향으로 s × 0.3만큼 끌려온다. 양쪽 모두 lerp(0.2 / 0.18)로 보간되어 자석이 서서히 붙는 질감이 난다. 반경을 벗어나면 목표가 0으로 풀려 자연 복귀.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (거리 계산 + rAF lerp)' },
      { label: '트리거', value: '버튼 중심 반경 110px 진입 → 흡착 시작' },
      { label: '흡착 계수', value: '커서 0.72 / 버튼 0.3 (강도 비례)' },
      { label: 'lerp 계수', value: '커서 0.2 + 버튼 0.18' },
      { label: '핵심', value: 'strength = 1 − d/R — 거리 기반 연속 강도' },
      { label: '참고', value: 'Cuberto CTA / Studio Freight' }
    ],
    guide: '반경 R은 버튼 크기의 1.5~2배가 적정(여기선 110px). 흡착 계수를 1.0으로 두면 커서가 버튼 중심에 완전히 붙어 조작감이 답답해진다 — 0.6~0.8 권장. 버튼 base 중심은 transform을 제외한 레이아웃 기준으로 1회만 측정하고 resize 때 재측정한다. 버튼이 많은 페이지에서는 가장 가까운 1개만 계산해 비용을 줄인다.',
    recommendations: [
      { place: '히어로 헤더', body: '메인 CTA 1개에 집중 적용 — 시선과 커서를 모두 끌어당김' },
      { place: '랜딩 페이지', body: '가격표의 추천 플랜 버튼 — 의도적 유도 장치' },
      { place: '제품 섹션', body: '데모 신청·구매 버튼 — 마이크로 인터랙션으로 전환율 보조' },
      { place: '포트폴리오 소개', body: 'Contact 버튼 — 에이전시 무드의 마침표' }
    ],
    tradeoff: '버튼과 커서가 동시에 움직여 과하면 멀미감을 줌. 흡착 반경이 겹치면 커서가 두 버튼 사이에서 떨릴 수 있어 배치 간격 확보 필요. 터치 환경에서는 무의미.'
  },

  // ── 05. jelly-blob ──
  {
    id: 'jelly-blob', num: '05', title: '젤리 블롭',
    summary: '이동 속도와 방향을 매 프레임 측정해 진행축으로 늘어나고(scaleX) 수직축으로 눌리는(scaleY) squash & stretch를 적용. 빠르게 움직이면 길쭉해지고 멈추면 동그랗게 복원되는 젤리 질감의 커서.',
    demo: {
      stageHTML: '<main class="stage">\n'
        + '  <span class="stage-eyebrow">Jelly Blob</span>\n'
        + '  <h1 class="stage-title">속도가 모양을 만듭니다</h1>\n'
        + '  <div class="stage-row">\n'
        + '    <a class="tgt-link" data-hover href="#" onclick="return false">빠르게 흔들어보기</a>\n'
        + '    <a class="tgt-link" data-hover href="#" onclick="return false">천천히 그려보기</a>\n'
        + '  </div>\n'
        + '  <div class="cursor-el cursor-blob"></div>\n'
        + '</main>',
      css: '.cursor-blob { width: 44px; height: 44px; margin: -22px 0 0 -22px; border-radius: 50%;\n'
        + '  background: radial-gradient(circle at 32% 32%, #c4b5fd, #7c3aed 72%);\n'
        + '  box-shadow: 0 0 28px rgba(124,58,237,0.4); }',
      js: 'var blob = stage.querySelector(".cursor-blob");\n'
        + 'var bx = mx, by = my;\n'
        + 'var lastAngle = 0, hs = 1, ht = 1;\n'
        + 'stage.addEventListener("mousemove", function(e){\n'
        + '  ht = e.target.closest("[data-hover]") ? 1.5 : 1;\n'
        + '});\n'
        + 'function frame(){\n'
        + '  var nx = lerp(bx, mx, 0.16);\n'
        + '  var ny = lerp(by, my, 0.16);\n'
        + '  var vx = nx - bx, vy = ny - by;\n'
        + '  bx = nx; by = ny;\n'
        + '  hs = lerp(hs, ht, 0.15);\n'
        + '  var speed = Math.sqrt(vx * vx + vy * vy);\n'
        + '  if (speed > 0.3) lastAngle = Math.atan2(vy, vx) * 180 / Math.PI;\n'
        + '  var stretch = Math.min(speed / 26, 0.5);\n'
        + '  blob.style.transform = "translate(" + bx.toFixed(1) + "px," + by.toFixed(1) + "px)"\n'
        + '    + " rotate(" + lastAngle.toFixed(1) + "deg)"\n'
        + '    + " scale(" + ((1 + stretch) * hs).toFixed(3) + "," + ((1 - stretch * 0.55) * hs).toFixed(3) + ")";\n'
        + '  requestAnimationFrame(frame);\n'
        + '}\n'
        + 'frame();',
      height: 480
    },
    snippetHTML: '<div class="cursor-blob"></div>',
    snippetCSS: '.cursor-blob { position: fixed; top: 0; left: 0;\n  width: 44px; height: 44px; margin: -22px 0 0 -22px;\n  border-radius: 50%;\n  background: radial-gradient(circle at 32% 32%, #c4b5fd, #7c3aed 72%);\n  pointer-events: none; z-index: 9999; }',
    snippetJS: '(function frame(){\n  var nx = bx + (mx - bx) * 0.16;\n  var ny = by + (my - by) * 0.16;\n  var vx = nx - bx, vy = ny - by;          // 프레임 간 이동량 = 속도\n  bx = nx; by = ny;\n  var speed = Math.sqrt(vx * vx + vy * vy);\n  if (speed > 0.3) angle = Math.atan2(vy, vx) * 180 / Math.PI;\n  var s = Math.min(speed / 26, 0.5);       // stretch 클램프\n  blob.style.transform = "translate(" + bx + "px," + by + "px)"\n    + " rotate(" + angle + "deg)"\n    + " scale(" + (1 + s) + "," + (1 - s * 0.55) + ")";\n  requestAnimationFrame(frame);\n})();',
    explain: '매 프레임 lerp 이동량(vx, vy)을 속도로 삼아, 진행 방향각 atan2(vy, vx)로 rotate한 뒤 진행축으로 scaleX(1+stretch), 수직축으로 scaleY(1−stretch×0.55)를 적용한다. stretch는 min(speed/26, 0.5)로 클램프되어 빠르게 움직일수록 길쭉해지고, 멈추면 lerp 잔량이 0으로 수렴하면서 별도의 복원 애니메이션 없이 원형으로 돌아온다. hover 대상 위에서는 전체 scale 1.5 곱이 추가된다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (속도 벡터 계산)' },
      { label: '트리거', value: '이동 속도 → stretch = min(speed/26, 0.5)' },
      { label: '변형', value: 'rotate(방향각) + scale(1+s, 1−0.55s)' },
      { label: 'lerp 계수', value: '위치 0.16 / hover scale 0.15' },
      { label: '핵심', value: '프레임 간 이동량을 그대로 squash & stretch로 변환' },
      { label: '참고', value: 'Codrops 젤리 커서 / 14islands' }
    ],
    guide: '나누는 상수(26)가 민감도를 결정 — 작을수록 조금만 움직여도 길쭉해진다. stretch 상한 0.5를 넘기면 원이 소시지처럼 보여 권장하지 않음. 멈췄을 때 마지막 방향이 유지되도록 속도 임계(0.3px) 아래에서는 각도를 갱신하지 않는 것이 떨림 방지 포인트. 그라디언트·그림자는 transform과 분리해 GPU 합성을 유지한다.',
    recommendations: [
      { place: '히어로 헤더', body: '플레이풀한 브랜드 첫인상 — 마우스를 흔들수록 살아있는 느낌' },
      { place: '랜딩 페이지', body: '크리에이티브 툴·키즈·게임 등 유연한 톤의 제품' },
      { place: '제품 섹션', body: '드로잉·모션 관련 기능 소개 — 커서 자체가 데모' },
      { place: '포트폴리오 소개', body: '모션 디자이너 포트폴리오 — 보간 감각 과시 포인트' }
    ],
    tradeoff: '차분한 기업 사이트에는 톤이 과함. 속도 기반이라 저프레임 환경에서 stretch가 튀어 보일 수 있음(dt 보정 고려). 커서 정밀도 체감 저하.'
  },

  // ── 06. ghost-trail ──
  {
    id: 'ghost-trail', num: '06', title: '고스트 딜레이',
    summary: '잔상 원 5개가 같은 마우스 좌표를 서로 다른 lerp 계수(0.35→0.07)로 쫓아 시차 트레일을 만든다. 이동 중에는 곡선으로 늘어서고 멈추면 한 점으로 수렴 — 위치 히스토리 없이 계수 차이만으로 구현.',
    demo: {
      stageHTML: '<main class="stage">\n'
        + '  <span class="stage-eyebrow">Ghost Trail</span>\n'
        + '  <h1 class="stage-title">잔상이 곡선을 그립니다</h1>\n'
        + '  <div class="stage-row">\n'
        + '    <a class="tgt-link" data-hover href="#" onclick="return false">잔상 색 바꾸기</a>\n'
        + '    <a class="tgt-link" data-hover href="#" onclick="return false">곡선 그려보기</a>\n'
        + '  </div>\n'
        + '  <div class="cursor-el ghost g4"></div>\n'
        + '  <div class="cursor-el ghost g3"></div>\n'
        + '  <div class="cursor-el ghost g2"></div>\n'
        + '  <div class="cursor-el ghost g1"></div>\n'
        + '  <div class="cursor-el ghost g0"></div>\n'
        + '</main>',
      css: '.ghost { border-radius: 50%; background: #fff; transition: opacity 0.25s ease, background 0.25s ease; }\n'
        + '.g0 { width: 24px; height: 24px; margin: -12px 0 0 -12px; }\n'
        + '.g1 { width: 19px; height: 19px; margin: -10px 0 0 -10px; }\n'
        + '.g2 { width: 15px; height: 15px; margin: -8px 0 0 -8px; }\n'
        + '.g3 { width: 12px; height: 12px; margin: -6px 0 0 -6px; }\n'
        + '.g4 { width: 9px; height: 9px; margin: -5px 0 0 -5px; }\n'
        + '.stage.is-on .g0 { opacity: 1; }\n'
        + '.stage.is-on .g1 { opacity: 0.7; }\n'
        + '.stage.is-on .g2 { opacity: 0.5; }\n'
        + '.stage.is-on .g3 { opacity: 0.34; }\n'
        + '.stage.is-on .g4 { opacity: 0.22; }\n'
        + '.stage.is-accent .ghost { background: #60a5fa; }',
      js: 'var ghosts = [].slice.call(stage.querySelectorAll(".ghost"));\n'
        + 'var ks = { g0: 0.35, g1: 0.24, g2: 0.16, g3: 0.105, g4: 0.07 };\n'
        + 'var pos = ghosts.map(function(){ return { x: mx, y: my }; });\n'
        + 'stage.addEventListener("mousemove", function(e){\n'
        + '  stage.classList.toggle("is-accent", !!e.target.closest("[data-hover]"));\n'
        + '});\n'
        + 'function frame(){\n'
        + '  for (var i = 0; i < ghosts.length; i++){\n'
        + '    var k = ks[ghosts[i].classList[2]];\n'
        + '    pos[i].x = lerp(pos[i].x, mx, k);\n'
        + '    pos[i].y = lerp(pos[i].y, my, k);\n'
        + '    ghosts[i].style.transform = "translate(" + pos[i].x.toFixed(1) + "px," + pos[i].y.toFixed(1) + "px)";\n'
        + '  }\n'
        + '  requestAnimationFrame(frame);\n'
        + '}\n'
        + 'frame();',
      height: 480
    },
    snippetHTML: '<div class="ghost g0"></div>\n<div class="ghost g1"></div>\n<div class="ghost g2"></div>\n<div class="ghost g3"></div>\n<div class="ghost g4"></div>',
    snippetCSS: '.ghost { position: fixed; top: 0; left: 0; border-radius: 50%;\n  background: #fff; pointer-events: none; z-index: 9999; }\n.g0 { width: 24px; height: 24px; margin: -12px 0 0 -12px; opacity: 1; }\n.g1 { width: 19px; height: 19px; margin: -10px 0 0 -10px; opacity: 0.7; }\n/* …g2~g4 점점 작고 옅게 */',
    snippetJS: 'var ks = [0.35, 0.24, 0.16, 0.105, 0.07];  // 머리→꼬리 lerp 계수\nvar pos = ghosts.map(function(){ return { x: 0, y: 0 }; });\n(function frame(){\n  for (var i = 0; i < ghosts.length; i++){\n    pos[i].x += (mx - pos[i].x) * ks[i];\n    pos[i].y += (my - pos[i].y) * ks[i];\n    ghosts[i].style.transform =\n      "translate(" + pos[i].x + "px," + pos[i].y + "px)";\n  }\n  requestAnimationFrame(frame);\n})();',
    explain: '잔상 원 5개가 동일한 마우스 좌표를 서로 다른 lerp 계수(0.35 → 0.24 → 0.16 → 0.105 → 0.07)로 쫓는다. 계수가 클수록 민첩하고 작을수록 게을러서, 이동 중에는 5개가 속도순으로 늘어서 곡선 트레일이 되고 멈추면 한 점으로 수렴한다. 크기(24→9px)와 불투명도(1→0.22)를 뒤로 갈수록 줄여 머리–꼬리 위계를 만들고, hover 대상 위에서는 전체 색만 액센트로 전환한다. 위치 히스토리 배열 없이 계수 차이만으로 시차를 얻는 것이 포인트.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (rAF 다중 lerp)' },
      { label: '트리거', value: 'mousemove → 원 5개 동시 추적' },
      { label: 'lerp 계수', value: '0.35 / 0.24 / 0.16 / 0.105 / 0.07' },
      { label: '커서 구성', value: '24→9px 원 5개, opacity 1→0.22' },
      { label: '핵심', value: '계수 차이만으로 만드는 시차 트레일 (히스토리 불필요)' },
      { label: '참고', value: 'Cuberto / 게임·이벤트형 인터랙션 사이트' }
    ],
    guide: '원 개수는 4~6개가 적정 — 그 이상은 뱀처럼 보여 산만하다. 계수 간격을 등비(×0.68 내외)로 줄이면 자연스러운 감속 곡선이 나온다. 잔상이 머리 위에 그려지지 않도록 DOM 순서는 꼬리를 먼저, 머리를 마지막에 둔다. hover 시에는 전체 색상만 바꾸는 절제된 상태 전환이 어울린다.',
    recommendations: [
      { place: '히어로 헤더', body: '인트로 무드 연출 — 커서 움직임 자체가 그래픽 요소' },
      { place: '랜딩 페이지', body: '이벤트·캠페인 페이지 — 화려한 트레일로 축제감' },
      { place: '제품 섹션', body: '모션 그래픽 툴 소개 — 부드러운 보간 품질 시연' },
      { place: '포트폴리오 소개', body: '인터랙션 디자이너 포트폴리오 — lerp 감각 증명' }
    ],
    tradeoff: 'DOM 5개를 매 프레임 갱신 — 개수를 늘리면 비용이 선형 증가. 작은 화면에서 트레일이 공간을 많이 차지해 본문 가독성 방해 가능. 절전 모드에서 rAF 간격이 늘어나면 트레일이 끊겨 보임.'
  },

  // ── 07. icon-swap ──
  {
    id: 'icon-swap', num: '07', title: '아이콘 스왑',
    summary: '영역마다 data-cursor 속성(arrow/plus/drag)을 선언하면 커서가 그 위에서 화살표·플러스·드래그 아이콘으로 교체된다. 커서가 "이 영역에서 무엇을 할 수 있는지"를 설명하는 어포던스 패턴.',
    demo: {
      stageHTML: '<main class="stage">\n'
        + '  <span class="stage-eyebrow">Icon Swap</span>\n'
        + '  <h1 class="stage-title">영역마다 커서의 역할이 바뀝니다</h1>\n'
        + '  <div class="stage-row">\n'
        + '    <div class="zone" data-cursor="arrow"><strong>외부 링크</strong><span>새 탭으로 이동</span></div>\n'
        + '    <div class="zone" data-cursor="plus"><strong>갤러리 추가</strong><span>항목 더하기</span></div>\n'
        + '    <div class="zone" data-cursor="drag"><strong>캐러셀</strong><span>좌우 드래그</span></div>\n'
        + '  </div>\n'
        + '  <div class="cursor-el cursor-icon">\n'
        + '    <span class="cur-core">\n'
        + '      <svg class="cur-ic ic-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#111" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 L17 7 M9 7 h8 v8"></path></svg>\n'
        + '      <svg class="cur-ic ic-plus" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#111" stroke-width="2.2" stroke-linecap="round"><path d="M12 5 v14 M5 12 h14"></path></svg>\n'
        + '      <svg class="cur-ic ic-drag" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#111" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12 h16 M8 8 l-4 4 4 4 M16 8 l4 4 -4 4"></path></svg>\n'
        + '    </span>\n'
        + '  </div>\n'
        + '</main>',
      css: '.zone { width: 168px; padding: 24px 16px; border: 1px dashed rgba(255,255,255,0.22); border-radius: 14px;\n'
        + '  display: flex; flex-direction: column; gap: 7px; align-items: center; text-align: center;\n'
        + '  transition: border-color 0.25s ease, background 0.25s ease; }\n'
        + '.zone:hover { border-color: rgba(255,255,255,0.5); background: rgba(255,255,255,0.04); }\n'
        + '.zone strong { font: 600 14px/1 "Pretendard Variable","Pretendard",sans-serif; }\n'
        + '.zone span { font: 500 11px/1.4 "Pretendard Variable","Pretendard",sans-serif; color: rgba(255,255,255,0.45); }\n'
        + '.cur-core { position: relative; display: flex; align-items: center; justify-content: center;\n'
        + '  transform: translate(-50%, -50%); width: 14px; height: 14px; border-radius: 50%; background: #fff;\n'
        + '  transition: width 0.2s ease, height 0.2s ease; }\n'
        + '.cur-ic { position: absolute; opacity: 0; transform: scale(0.4); transition: opacity 0.16s ease, transform 0.2s ease; }\n'
        + '.cursor-icon.has-mode .cur-core { width: 42px; height: 42px; }\n'
        + '.cursor-icon.mode-arrow .ic-arrow, .cursor-icon.mode-plus .ic-plus, .cursor-icon.mode-drag .ic-drag { opacity: 1; transform: scale(1); }',
      js: 'var cur = stage.querySelector(".cursor-icon");\n'
        + 'var cx = mx, cy = my;\n'
        + 'var mode = "";\n'
        + 'stage.addEventListener("mousemove", function(e){\n'
        + '  var z = e.target.closest("[data-cursor]");\n'
        + '  var m = z ? z.getAttribute("data-cursor") : "";\n'
        + '  if (m !== mode){\n'
        + '    mode = m;\n'
        + '    cur.className = "cursor-el cursor-icon" + (m ? " has-mode mode-" + m : "");\n'
        + '  }\n'
        + '});\n'
        + 'function frame(){\n'
        + '  cx = lerp(cx, mx, 0.18);\n'
        + '  cy = lerp(cy, my, 0.18);\n'
        + '  cur.style.transform = "translate(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px)";\n'
        + '  requestAnimationFrame(frame);\n'
        + '}\n'
        + 'frame();',
      height: 520
    },
    snippetHTML: '<section data-cursor="drag">캐러셀 영역</section>\n\n<div class="cursor-icon">\n  <span class="cur-core">\n    <svg class="cur-ic ic-arrow">…</svg>\n    <svg class="cur-ic ic-plus">…</svg>\n    <svg class="cur-ic ic-drag">…</svg>\n  </span>\n</div>',
    snippetCSS: '.cur-core { display: flex; align-items: center; justify-content: center;\n  transform: translate(-50%, -50%);\n  width: 14px; height: 14px; border-radius: 50%; background: #fff;\n  transition: width 0.2s ease, height 0.2s ease; }\n.cur-ic { position: absolute; opacity: 0; transform: scale(0.4);\n  transition: opacity 0.16s ease, transform 0.2s ease; }\n.cursor-icon.has-mode .cur-core { width: 42px; height: 42px; }\n.cursor-icon.mode-drag .ic-drag { opacity: 1; transform: scale(1); }',
    snippetJS: 'var mode = "";\ndocument.addEventListener("mousemove", function(e){\n  mx = e.clientX; my = e.clientY;\n  var z = e.target.closest("[data-cursor]");\n  var m = z ? z.getAttribute("data-cursor") : "";\n  if (m !== mode){                            // 변경 시에만 클래스 스왑\n    mode = m;\n    cur.className = "cursor-icon" + (m ? " has-mode mode-" + m : "");\n  }\n});',
    explain: '커서 안에 화살표·플러스·드래그 inline SVG 3종을 미리 쌓아두고 opacity/scale로 숨겨둔다. mousemove마다 e.target.closest("[data-cursor]")로 현재 영역의 모드를 읽고, 바뀐 경우에만 커서 루트의 클래스를 mode-{name}으로 통째로 교체 — 해당 아이콘만 scale 0.4→1로 팝업되고 코어 원도 14→42px로 확장된다. 영역에 data-cursor 속성만 선언하면 JS 수정 없이 확장되는 선언적 구조.',
    kv: [
      { label: '의존성', value: 'Vanilla JS + inline SVG 3종' },
      { label: '트리거', value: 'data-cursor 속성 감지 → mode-{name} 클래스 스왑' },
      { label: '아이콘', value: '화살표(링크) / 플러스(추가) / 드래그(캐러셀)' },
      { label: 'lerp 계수', value: '위치 0.18' },
      { label: '핵심', value: '영역 선언(data-cursor)만으로 커서 의미 교체' },
      { label: '참고', value: '디자인 툴 UI / 에디토리얼 사이트' }
    ],
    guide: '아이콘은 16px 내외 inline SVG로 커서 안에 모두 미리 넣고 opacity/scale만 토글 — 이미지 로딩 지연이 없다. 모드 변경 시에만 className을 교체해 불필요한 스타일 재계산을 막는다. 아이콘 의미는 실제 동작과 일치해야 한다(드래그 아이콘인데 클릭만 가능하면 혼란). 동시에 1개 모드만 활성화되도록 클래스 전체 교체 방식이 안전.',
    recommendations: [
      { place: '히어로 헤더', body: '히어로 우측 캐러셀 영역 — 드래그 가능함을 커서로 안내' },
      { place: '랜딩 페이지', body: '외부 링크·문서 링크 영역 — 이동 전 행동 예고' },
      { place: '제품 섹션', body: '갤러리·비교 슬라이더 — 영역별 조작법을 커서가 설명' },
      { place: '포트폴리오 소개', body: '작업물 캐러셀 + 외부 링크 혼합 레이아웃' }
    ],
    tradeoff: '모드가 많아지면 SVG가 커서 DOM에 누적 — 5~6종 이내 권장. 커서가 조작 안내를 대신하므로 터치 사용자를 위한 별도 UI 힌트 병행 필요.'
  },

  // ── 08. preview-thumb ──
  {
    id: 'preview-thumb', num: '08', title: '프리뷰 썸네일',
    summary: '프로젝트 리스트 행에 hover하면 커서 옆에 미니 아트워크 카드가 살짝 기울어진 채 팝업된다. 아트워크 레이어 3장을 미리 쌓아두고 opacity로만 전환해 이미지 교체 깜빡임이 없는 구조.',
    demo: {
      stageHTML: '<main class="stage">\n'
        + '  <span class="stage-eyebrow">Selected Works</span>\n'
        + '  <ul class="work-list">\n'
        + '    <li class="work-row" data-thumb="0"><span class="work-title">네온 시티 브랜딩</span><span class="work-year">2026</span></li>\n'
        + '    <li class="work-row" data-thumb="1"><span class="work-title">오로라 캠페인</span><span class="work-year">2025</span></li>\n'
        + '    <li class="work-row" data-thumb="2"><span class="work-title">포레스트 에디토리얼</span><span class="work-year">2025</span></li>\n'
        + '  </ul>\n'
        + '  <div class="cursor-el cursor-thumb">\n'
        + '    <span class="thumb-dot"></span>\n'
        + '    <div class="thumb-card">\n'
        + '      <div class="thumb-art art-0"></div>\n'
        + '      <div class="thumb-art art-1"></div>\n'
        + '      <div class="thumb-art art-2"></div>\n'
        + '    </div>\n'
        + '  </div>\n'
        + '</main>',
      css: '.work-list { list-style: none; margin: 0; padding: 0; width: min(440px, 84vw); }\n'
        + '.work-row { display: flex; justify-content: space-between; align-items: center; padding: 18px 6px;\n'
        + '  border-bottom: 1px solid rgba(255,255,255,0.12); transition: padding 0.25s ease; }\n'
        + '.work-row:hover { padding-left: 14px; }\n'
        + '.work-title { font: 600 16px/1 "Pretendard Variable","Pretendard",sans-serif; }\n'
        + '.work-year { font: 500 12px/1 "Pretendard Variable","Pretendard",sans-serif; color: rgba(255,255,255,0.4); }\n'
        + '.thumb-dot { position: absolute; width: 8px; height: 8px; margin: -4px 0 0 -4px; border-radius: 50%; background: #fff; }\n'
        + '.thumb-card { position: absolute; left: 22px; top: -44px; width: 124px; height: 88px; border-radius: 10px; overflow: hidden;\n'
        + '  transform: scale(0) rotate(-8deg); transform-origin: 0 70%;\n'
        + '  transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1); box-shadow: 0 14px 34px rgba(0,0,0,0.5); }\n'
        + '.cursor-thumb.is-show .thumb-card { transform: scale(1) rotate(-6deg); }\n'
        + '.thumb-art { position: absolute; inset: 0; opacity: 0; transition: opacity 0.2s ease; }\n'
        + '.thumb-art.on { opacity: 1; }\n'
        + '.art-0 { background: linear-gradient(135deg, #22d3ee, #6366f1); }\n'
        + '.art-1 { background: linear-gradient(135deg, #f59e0b, #ef4444); }\n'
        + '.art-2 { background: linear-gradient(135deg, #10b981, #84cc16); }',
      js: 'var cur = stage.querySelector(".cursor-thumb");\n'
        + 'var arts = [].slice.call(stage.querySelectorAll(".thumb-art"));\n'
        + 'var cx = mx, cy = my;\n'
        + 'stage.addEventListener("mousemove", function(e){\n'
        + '  var row = e.target.closest("[data-thumb]");\n'
        + '  if (row){\n'
        + '    var idx = parseInt(row.getAttribute("data-thumb"), 10);\n'
        + '    cur.classList.add("is-show");\n'
        + '    for (var i = 0; i < arts.length; i++) arts[i].classList.toggle("on", i === idx);\n'
        + '  } else {\n'
        + '    cur.classList.remove("is-show");\n'
        + '  }\n'
        + '});\n'
        + 'function frame(){\n'
        + '  var vx = mx - cx;\n'
        + '  cx = lerp(cx, mx, 0.14);\n'
        + '  cy = lerp(cy, my, 0.14);\n'
        + '  var tilt = Math.max(-8, Math.min(8, vx * 0.06));\n'
        + '  cur.style.transform = "translate(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px) rotate(" + tilt.toFixed(2) + "deg)";\n'
        + '  requestAnimationFrame(frame);\n'
        + '}\n'
        + 'frame();',
      height: 540
    },
    snippetHTML: '<li class="work-row" data-thumb="0">네온 시티 브랜딩</li>\n\n<div class="cursor-thumb">\n  <span class="thumb-dot"></span>\n  <div class="thumb-card">\n    <div class="thumb-art art-0"></div>\n    <div class="thumb-art art-1"></div>\n  </div>\n</div>',
    snippetCSS: '.thumb-card { position: absolute; left: 22px; top: -44px;\n  width: 124px; height: 88px; border-radius: 10px; overflow: hidden;\n  transform: scale(0) rotate(-8deg); transform-origin: 0 70%;\n  transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1); }\n.cursor-thumb.is-show .thumb-card { transform: scale(1) rotate(-6deg); }\n.thumb-art { position: absolute; inset: 0; opacity: 0;\n  transition: opacity 0.2s ease; }\n.thumb-art.on { opacity: 1; }',
    snippetJS: 'document.addEventListener("mousemove", function(e){\n  mx = e.clientX; my = e.clientY;\n  var row = e.target.closest("[data-thumb]");\n  if (row){\n    var idx = parseInt(row.getAttribute("data-thumb"), 10);\n    cur.classList.add("is-show");\n    arts.forEach(function(a, i){ a.classList.toggle("on", i === idx); });\n  } else {\n    cur.classList.remove("is-show");\n  }\n});\n// rAF: lerp 0.14 + 수평 속도 기반 tilt(±8°)',
    explain: '리스트 행에 data-thumb 인덱스를 부여하고, hover 시 커서 루트에 .is-show를 토글해 도트 옆 카드(124×88px)가 spring 이징으로 scale 0→1 팝업된다. 카드 안에는 아트워크 레이어 3장이 미리 쌓여 있어 인덱스에 맞는 레이어만 opacity로 전환 — 이미지 교체 깜빡임이 없다. 위치는 lerp 0.14의 느긋한 추적에 수평 속도 기반 tilt(±8°)를 더해 종이가 끌려오는 듯한 질감을 만든다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (rAF lerp + 레이어 토글)' },
      { label: '트리거', value: 'data-thumb 행 hover → .is-show + 레이어 전환' },
      { label: 'lerp 계수', value: '위치 0.14 + 수평 속도 tilt ±8°' },
      { label: '썸네일', value: '124×88px 카드, 커서 우상단 오프셋(22px, -44px)' },
      { label: '핵심', value: '레이어 사전 적재 + opacity 스왑 (로딩 깜빡임 0)' },
      { label: '참고', value: 'Awwwards 리스트 hover / Locomotive' }
    ],
    guide: '실서비스에서는 gradient 대신 실제 썸네일 이미지를 동일한 레이어 구조로 미리 로드해두면 hover 순간 깜빡임이 없다. 오프셋(left 22px, top -44px)은 커서가 썸네일을 가리지 않는 우상단 배치가 기본. 행이 8개를 넘으면 레이어 사전 적재 대신 이미지 1장의 src 교체 + preload로 전환. transform-origin을 좌하단(0 70%)에 두면 카드가 커서에서 자라나는 느낌이 난다.',
    recommendations: [
      { place: '히어로 헤더', body: '히어로 하단 주요 메뉴 리스트 — hover 미리보기로 탐색 유도' },
      { place: '랜딩 페이지', body: '고객 사례 리스트 — 로고·스크린샷 미리보기' },
      { place: '제품 섹션', body: '템플릿·테마 목록 — 클릭 전 시각 확인으로 이탈 감소' },
      { place: '포트폴리오 소개', body: '프로젝트 리스트의 표준 패턴 — 텍스트 리스트 + 커서 썸네일' }
    ],
    tradeoff: '썸네일이 커서를 따라다녀 텍스트를 가릴 수 있음 — 오프셋 튜닝 필수. 이미지가 많으면 사전 적재 메모리 비용 증가. 키보드 포커스 사용자는 미리보기를 볼 수 없으므로 보조 수단 고려.'
  },

  // ── 09. image-trail ──
  {
    id: 'image-trail', num: '09', title: '이미지 트레일',
    summary: '마우스가 80px 이동할 때마다 커서 위치에 아트워크 카드가 스폰되어 떠오르며 사라진다. 요소 10개를 풀(pool)로 순환 재사용해 DOM 생성·삭제 없이 무한 트레일을 유지하는 패션 룩북형 패턴.',
    demo: {
      stageHTML: '<main class="stage">\n'
        + '  <span class="stage-eyebrow">Image Trail</span>\n'
        + '  <h1 class="stage-title">움직일수록 아트워크가 피어납니다</h1>\n'
        + '  <div class="stage-row">\n'
        + '    <a class="tgt-link" data-hover href="#" onclick="return false">아카이브 보기</a>\n'
        + '    <a class="tgt-link" data-hover href="#" onclick="return false">컬렉션 살펴보기</a>\n'
        + '  </div>\n'
        + '  <div class="trail-pool">\n'
        + TRAIL_ITEMS
        + '  </div>\n'
        + '  <div class="cursor-el cursor-dot9"></div>\n'
        + '</main>',
      css: '.trail-pool { position: absolute; inset: 0; pointer-events: none; }\n'
        + '.trail-item { position: absolute; top: 0; left: 0; width: 84px; height: 112px; margin: -56px 0 0 -42px;\n'
        + '  border-radius: 12px; opacity: 0; z-index: 40; }\n'
        + '.trail-item.live { animation: trail-pop 0.9s cubic-bezier(0.22,0.61,0.36,1) forwards; }\n'
        + '@keyframes trail-pop {\n'
        + '  0% { opacity: 0; transform: scale(0.5) rotate(var(--tilt, 0deg)); }\n'
        + '  18% { opacity: 1; }\n'
        + '  100% { opacity: 0; transform: scale(1.08) translateY(-26px) rotate(var(--tilt, 0deg)); }\n'
        + '}\n'
        + '.trail-g0 { background: linear-gradient(135deg, #7c3aed, #3b82f6); }\n'
        + '.trail-g1 { background: linear-gradient(135deg, #06b6d4, #10b981); }\n'
        + '.trail-g2 { background: linear-gradient(135deg, #f59e0b, #ef4444); }\n'
        + '.trail-g3 { background: linear-gradient(135deg, #ec4899, #8b5cf6); }\n'
        + '.cursor-dot9 { width: 10px; height: 10px; margin: -5px 0 0 -5px; border-radius: 50%; background: #fff; }',
      js: 'var cur = stage.querySelector(".cursor-dot9");\n'
        + 'var items = [].slice.call(stage.querySelectorAll(".trail-item"));\n'
        + 'var spawnCount = 0;\n'
        + 'var lastX = mx, lastY = my, acc = 0;\n'
        + 'var cx = mx, cy = my;\n'
        + 'function spawn(x, y){\n'
        + '  var el = items[spawnCount % items.length];\n'
        + '  el.className = "trail-item trail-g" + (spawnCount % 4);\n'
        + '  el.style.left = x.toFixed(1) + "px";\n'
        + '  el.style.top = y.toFixed(1) + "px";\n'
        + '  el.style.setProperty("--tilt", ((Math.random() * 16) - 8).toFixed(1) + "deg");\n'
        + '  void el.offsetWidth;\n'
        + '  el.classList.add("live");\n'
        + '  spawnCount++;\n'
        + '}\n'
        + 'stage.addEventListener("mousemove", function(){\n'
        + '  var dx = mx - lastX, dy = my - lastY;\n'
        + '  acc += Math.sqrt(dx * dx + dy * dy);\n'
        + '  lastX = mx; lastY = my;\n'
        + '  if (acc >= 80){\n'
        + '    acc = 0;\n'
        + '    spawn(mx, my);\n'
        + '  }\n'
        + '});\n'
        + 'function frame(){\n'
        + '  cx = lerp(cx, mx, 0.2);\n'
        + '  cy = lerp(cy, my, 0.2);\n'
        + '  cur.style.transform = "translate(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px)";\n'
        + '  requestAnimationFrame(frame);\n'
        + '}\n'
        + 'frame();',
      height: 520
    },
    snippetHTML: '<div class="trail-pool">\n  <div class="trail-item"></div>\n  <!-- × 10개 풀 -->\n</div>',
    snippetCSS: '.trail-item { position: absolute; top: 0; left: 0;\n  width: 84px; height: 112px; margin: -56px 0 0 -42px;\n  border-radius: 12px; opacity: 0; }\n.trail-item.live {\n  animation: trail-pop 0.9s cubic-bezier(0.22,0.61,0.36,1) forwards; }\n@keyframes trail-pop {\n  0% { opacity: 0; transform: scale(0.5) rotate(var(--tilt)); }\n  18% { opacity: 1; }\n  100% { opacity: 0; transform: scale(1.08) translateY(-26px) rotate(var(--tilt)); }\n}',
    snippetJS: 'var acc = 0, spawnCount = 0;\ndocument.addEventListener("mousemove", function(e){\n  acc += Math.sqrt(Math.pow(e.clientX - lastX, 2) + Math.pow(e.clientY - lastY, 2));\n  lastX = e.clientX; lastY = e.clientY;\n  if (acc >= 80){                              // 80px마다 스폰\n    acc = 0;\n    var el = items[spawnCount % items.length]; // 풀 순환 재사용\n    el.className = "trail-item trail-g" + (spawnCount % 4);\n    el.style.left = lastX + "px";\n    el.style.top = lastY + "px";\n    void el.offsetWidth;                       // 애니메이션 리셋\n    el.classList.add("live");\n    spawnCount++;\n  }\n});',
    explain: 'mousemove마다 직전 스폰 지점과의 누적 이동 거리를 재고 80px를 넘으면 풀(10개)에서 다음 요소를 꺼내 커서 위치에 스폰한다. 스폰은 left/top으로 위치를 고정하고 className 재설정 → 강제 리플로우(void offsetWidth) → .live 재부착으로 CSS 키프레임(scale 0.5→1.08 + 26px 떠오르며 opacity 소멸, 0.9s)을 다시 재생한다. 그라디언트 4종과 랜덤 tilt(±8°)를 섞어 카드마다 표정을 달리하며, DOM을 생성·삭제하지 않는 풀 재사용 구조라 GC 부담이 없다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS + CSS @keyframes' },
      { label: '트리거', value: '누적 이동 거리 80px마다 스폰' },
      { label: '풀', value: '요소 10개 순환 재사용 (생성/삭제 0회)' },
      { label: '수명', value: '0.9s — scale 0.5→1.08 + translateY(-26px) 소멸' },
      { label: '핵심', value: '거리 기반 스폰 + 풀링 + 리플로우 애니메이션 리셋' },
      { label: '참고', value: 'Codrops Image Trail / 패션 룩북 사이트' }
    ],
    guide: '스폰 간격 80px이 밀도를 결정 — 줄이면 화려하지만 산만해진다. 풀 크기는 (수명 0.9s ÷ 평균 스폰 간격) × 1.5 이상으로 잡아야 재사용 시 잘림이 없다(여기선 10개). 실사 이미지를 쓸 경우 모든 이미지를 미리 로드한 뒤 배경으로만 교체한다. 아트워크 z-index는 본문 텍스트보다 위, 커서 도트보다 아래에 둔다.',
    recommendations: [
      { place: '히어로 헤더', body: '패션·뷰티 룩북 히어로 — 움직임마다 화보가 흩날리는 연출' },
      { place: '랜딩 페이지', body: '시즌 캠페인 — 브랜드 비주얼을 커서로 뿌리기' },
      { place: '제품 섹션', body: '컬렉션 미리보기 — 제품컷 트레일' },
      { place: '포트폴리오 소개', body: '비주얼 아카이브 인트로 — 작업물 슬라이드쇼 대체' }
    ],
    tradeoff: '시각적 소음이 큰 패턴 — 본문 읽기 영역에는 부적합하고 인트로·히어로 한정 권장. 큰 이미지 다수 합성 시 GPU 메모리 사용 증가. prefers-reduced-motion 사용자에게는 비활성화 필요.'
  },

  // ── 10. hold-progress ──
  {
    id: 'hold-progress', num: '10', title: '홀드 프로그레스',
    summary: 'pointerdown을 900ms 유지하면 커서의 SVG 링 게이지가 차오르고 완료 시 버튼이 확정 상태로 바뀐다. 도중에 손을 떼면 되감기 — 실수 클릭을 막는 의도적 마찰(intentional friction) 패턴.',
    demo: {
      stageHTML: '<main class="stage">\n'
        + '  <span class="stage-eyebrow">Hold to Confirm</span>\n'
        + '  <h1 class="stage-title">길게 눌러 액션을 확정하세요</h1>\n'
        + '  <div class="stage-row">\n'
        + '    <button class="hold-btn" data-hold type="button"><span class="hold-label">길게 눌러 구독</span></button>\n'
        + '    <button class="hold-btn danger" data-hold type="button"><span class="hold-label">길게 눌러 삭제</span></button>\n'
        + '  </div>\n'
        + '  <div class="cursor-el cursor-hold">\n'
        + '    <svg class="hold-svg" width="56" height="56" viewBox="0 0 56 56">\n'
        + '      <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.16)" stroke-width="3"></circle>\n'
        + '      <circle class="hold-fill" cx="28" cy="28" r="24" fill="none" stroke="#34d399" stroke-width="3" stroke-linecap="round" stroke-dasharray="150.8" stroke-dashoffset="150.8" transform="rotate(-90 28 28)"></circle>\n'
        + '    </svg>\n'
        + '    <span class="hold-core"></span>\n'
        + '  </div>\n'
        + '</main>',
      css: '.hold-btn { font: 600 14px/1 "Pretendard Variable","Pretendard",sans-serif; color: #fff; background: rgba(255,255,255,0.06);\n'
        + '  border: 1px solid rgba(255,255,255,0.22); border-radius: 999px; padding: 16px 28px;\n'
        + '  transition: background 0.25s ease, border-color 0.25s ease, color 0.25s ease; }\n'
        + '.hold-btn.is-confirmed { background: #34d399; border-color: #34d399; color: #052e1b; }\n'
        + '.hold-btn.danger.is-confirmed { background: #f87171; border-color: #f87171; color: #450a0a; }\n'
        + '.hold-svg { position: absolute; left: -28px; top: -28px; }\n'
        + '.hold-core { position: absolute; left: -4px; top: -4px; width: 8px; height: 8px; border-radius: 50%; background: #fff;\n'
        + '  transition: transform 0.2s ease, background 0.2s ease; }\n'
        + '.cursor-hold.is-done .hold-core { transform: scale(2.4); background: #34d399; }',
      js: 'var cur = stage.querySelector(".cursor-hold");\n'
        + 'var fill = stage.querySelector(".hold-fill");\n'
        + 'var C = 150.8;\n'
        + 'var cx = mx, cy = my;\n'
        + 'var holding = false, progress = 0, done = false;\n'
        + 'var hoverBtn = null;\n'
        + 'var last = Date.now();\n'
        + 'stage.addEventListener("mousemove", function(e){\n'
        + '  hoverBtn = e.target.closest("[data-hold]");\n'
        + '});\n'
        + 'stage.addEventListener("pointerdown", function(){ holding = true; });\n'
        + 'window.addEventListener("pointerup", function(){ holding = false; });\n'
        + 'function frame(){\n'
        + '  var now = Date.now();\n'
        + '  var dt = Math.min(64, now - last);\n'
        + '  last = now;\n'
        + '  if (holding && !done) progress += dt / 900;\n'
        + '  else if (!holding) progress -= dt / 500;\n'
        + '  progress = Math.max(0, Math.min(1, progress));\n'
        + '  if (progress >= 1 && !done){\n'
        + '    done = true;\n'
        + '    cur.classList.add("is-done");\n'
        + '    if (hoverBtn){\n'
        + '      hoverBtn.classList.add("is-confirmed");\n'
        + '      hoverBtn.querySelector(".hold-label").textContent = "확정 완료 ✓";\n'
        + '    }\n'
        + '  }\n'
        + '  if (done && progress <= 0.02){\n'
        + '    done = false;\n'
        + '    cur.classList.remove("is-done");\n'
        + '  }\n'
        + '  fill.style.strokeDashoffset = (C * (1 - progress)).toFixed(1);\n'
        + '  cx = lerp(cx, mx, 0.2);\n'
        + '  cy = lerp(cy, my, 0.2);\n'
        + '  cur.style.transform = "translate(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px)";\n'
        + '  requestAnimationFrame(frame);\n'
        + '}\n'
        + 'frame();',
      height: 520
    },
    snippetHTML: '<button class="hold-btn" data-hold>길게 눌러 삭제</button>\n\n<div class="cursor-hold">\n  <svg width="56" height="56" viewBox="0 0 56 56">\n    <circle cx="28" cy="28" r="24" fill="none"\n      stroke="rgba(255,255,255,0.16)" stroke-width="3"/>\n    <circle class="hold-fill" cx="28" cy="28" r="24" fill="none"\n      stroke="#34d399" stroke-width="3" stroke-linecap="round"\n      stroke-dasharray="150.8" stroke-dashoffset="150.8"\n      transform="rotate(-90 28 28)"/>\n  </svg>\n</div>',
    snippetCSS: '.hold-svg { position: absolute; left: -28px; top: -28px; }\n.hold-core { transition: transform 0.2s ease, background 0.2s ease; }\n.cursor-hold.is-done .hold-core {\n  transform: scale(2.4); background: #34d399; }\n.hold-btn.is-confirmed {\n  background: #34d399; border-color: #34d399; color: #052e1b; }',
    snippetJS: 'var C = 150.8;                                // 2πr (r=24)\nvar holding = false, progress = 0, last = Date.now();\nstage.addEventListener("pointerdown", function(){ holding = true; });\nwindow.addEventListener("pointerup", function(){ holding = false; });\n(function frame(){\n  var now = Date.now(), dt = Math.min(64, now - last);\n  last = now;\n  progress += holding ? dt / 900 : -dt / 500;  // 홀드 900ms / 되감기 500ms\n  progress = Math.max(0, Math.min(1, progress));\n  fill.style.strokeDashoffset = C * (1 - progress);\n  if (progress >= 1) confirmAction();          // 게이지 완주 → 확정\n  requestAnimationFrame(frame);\n})();',
    explain: 'pointerdown 동안 rAF에서 dt(Date.now 차분)를 누적해 progress(0~1)를 900ms 기준으로 올리고, 손을 떼면 500ms 기준으로 되감는다. progress는 SVG 원(r 24, 둘레 150.8)의 stroke-dashoffset = 둘레 × (1 − progress)에 1:1 매핑되어 링 게이지가 12시 방향부터 차오른다. 1.0 도달 시 .is-done으로 중심 점이 2.4배 팝되고, 커서가 올라가 있던 [data-hold] 버튼에 .is-confirmed + 라벨 교체로 액션 확정을 피드백한다 — 실수 클릭을 막는 의도적 마찰 장치.',
    kv: [
      { label: '의존성', value: 'Vanilla JS + inline SVG 링' },
      { label: '트리거', value: 'pointerdown 홀드 900ms → 확정 / 도중 해제 시 되감기' },
      { label: '게이지', value: 'stroke-dasharray 150.8 + dashoffset 1:1 매핑' },
      { label: '피드백', value: '.is-done (커서 팝) + .is-confirmed (버튼 확정)' },
      { label: '핵심', value: 'dt 누적 progress — 홀드/해제 양방향 보간' },
      { label: '참고', value: '스토리 UI 홀드 / 삭제 확인 패턴' }
    ],
    guide: '홀드 시간은 700~1200ms가 적정 — 짧으면 실수 방지 효과가 없고 길면 짜증을 유발한다. 해제 시 즉시 0으로 리셋하지 말고 되감기(500ms)를 줘야 "조금만 더 누르면 됐는데"가 시각적으로 전달된다. pointerdown/up은 마우스·터치를 모두 커버하지만 터치에선 커서가 없으므로 버튼 자체에 게이지를 그리는 변형을 병행 권장. 삭제·해지 같은 파괴적 액션에 특히 적합.',
    recommendations: [
      { place: '히어로 헤더', body: '이벤트 응모·구독 확정 — 홀드 제스처로 참여감 부여' },
      { place: '랜딩 페이지', body: '웨이팅 리스트 등록 — 가벼운 의식(ritual)으로 기억점 생성' },
      { place: '제품 섹션', body: '장바구니 비우기·플랜 해지 등 파괴적 액션 확인' },
      { place: '포트폴리오 소개', body: '이스터에그 — 길게 누르면 비하인드 공개' }
    ],
    tradeoff: '홀드 패턴은 학습 비용이 있어 시각 안내 문구 필수. 보조 기술·키보드 사용자를 위한 대체 확인 수단(다이얼로그) 병행 필요. rAF 기반이라 백그라운드 탭 전환 시 홀드가 끊김.'
  }
];

/* ================================================================
   Standalone demo HTML 빌더
   ================================================================ */

function buildDemoHTML(p) {
  return '<!DOCTYPE html>\n'
    + '<html lang="ko">\n'
    + '<head>\n'
    + '  <meta charset="UTF-8">\n'
    + '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
    + '  <title>' + p.num + '. ' + p.title + ' — Custom Cursor Demo</title>\n'
    + '  <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable-dynamic-subset.min.css" rel="stylesheet">\n'
    + '  <style>\n'
    + '    * { box-sizing: border-box; }\n'
    + '    html, body { margin: 0; padding: 0; }\n'
    + '    body { background: #0a0a0a; color: #fff; font-family: "Pretendard Variable","Pretendard",sans-serif; -webkit-font-smoothing: antialiased; overflow: hidden; }\n'
    + '    .demo-controls { position: fixed; top: 16px; left: 16px; display: inline-flex; align-items: center; gap: 10px; z-index: 100; pointer-events: none; }\n'
    + '    .demo-label { font: 500 10px/1 "Pretendard Variable","Pretendard",sans-serif; color: rgba(255,255,255,0.35); letter-spacing: 0.14em; text-transform: uppercase; }\n'
    + '    .demo-hint { position: fixed; right: 16px; bottom: 24px; font: 500 11px/1.4 "Pretendard Variable","Pretendard",sans-serif; color: rgba(255,255,255,0.35); letter-spacing: 0.04em; z-index: 100; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 999px; padding: 8px 14px; pointer-events: none; animation: hint-pulse 2.4s ease-in-out infinite; }\n'
    + '    @keyframes hint-pulse { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }\n'
    + '    .demo-touch-note { display: none; position: fixed; left: 16px; bottom: 24px; z-index: 100; font: 500 11px/1.5 "Pretendard Variable","Pretendard",sans-serif; color: rgba(255,255,255,0.45); background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 999px; padding: 8px 14px; pointer-events: none; }\n'
    + '    @media (hover: none), (pointer: coarse) { .demo-touch-note { display: block; } .demo-hint { display: none; } .stage, .stage * { cursor: auto; } }\n'
    + '    ' + BASE_CSS.replace(/\n/g, '\n    ') + '\n'
    + '    ' + p.demo.css.replace(/\n/g, '\n    ') + '\n'
    + '  </style>\n'
    + '</head>\n'
    + '<body>\n'
    + '  <div class="demo-controls">\n'
    + '    <span class="demo-label">' + p.num + ' · ' + p.title + '</span>\n'
    + '  </div>\n'
    + '  <div class="demo-hint">스테이지 안에서 마우스를 움직여보세요</div>\n'
    + '  <div class="demo-touch-note">터치 환경에서는 커스텀 커서가 동작하지 않습니다 — 데스크톱에서 확인해주세요</div>\n'
    + '\n'
    + '  ' + p.demo.stageHTML.replace(/\n/g, '\n  ') + '\n'
    + '\n'
    + '  <script>\n'
    + '    (function(){\n'
    + '      ' + (COMMON_JS + '\n' + p.demo.js).replace(/\n/g, '\n      ') + '\n'
    + '    })();\n'
    + '  </script>\n'
    + '</body>\n'
    + '</html>\n';
}

/* ================================================================
   분석 보고서 블록 빌더 (표준 15 블록)
   ================================================================ */

function buildPatternSection(p) {
  return {
    title: p.num + '. ' + p.title,
    blocks: [
      { type: 'text', value: p.summary },
      { type: 'heading', value: '라이브 데모' },
      {
        type: 'component',
        embed: 'demos/custom-cursor/' + p.id + '.html',
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
      { type: 'heading', value: '커스텀 커서 — Cuberto 시그니처 기반 10종 패턴' },
      { type: 'text', value: CATEGORY.summary },
      { type: 'heading', value: '10 패턴 인덱스' },
      { type: 'structure', items: indexItems },
      { type: 'heading', value: '공통 디자인 토큰' },
      {
        type: 'kv', columns: 2, items: [
          { label: '폰트', value: 'Pretendard Variable' },
          { label: '배경', value: '#0a0a0a (다크) + cursor: none 스테이지' },
          { label: '추적 모델', value: 'mousemove 좌표 → rAF lerp(0.07~0.35) 보간' },
          { label: '커서 레이어', value: 'absolute + translate + pointer-events: none + z-index 60' },
          { label: '상태 전환', value: 'data-* 속성 + closest() 감지 → 클래스 토글' },
          { label: '등장/퇴장', value: '스테이지 진입 시 .is-on — opacity 0→1 (250ms)' },
          { label: '터치 폴백', value: '@media (hover: none) 안내 문구 + 네이티브 커서 복원' },
          { label: '참고', value: 'Cuberto (https://cuberto.com/) 시그니처 커서 무드' }
        ]
      },
      { type: 'heading', value: '읽기 가이드' },
      {
        type: 'structure', items: [
          { label: '라이브 데모', tag: 'IFRAME', desc: 'demos/custom-cursor/{pattern}.html — cursor:none 스테이지 + hover 대상 2~3개' },
          { label: '작동 원리', tag: 'HOW', desc: 'mousemove → rAF lerp 보간 + 상태 클래스 토글' },
          { label: '정량 메타', tag: 'KV', desc: '의존성 / 트리거 / lerp 계수 / 커서 구성 / 핵심' },
          { label: '코드 스니펫', tag: 'CODE', desc: 'HTML / CSS / JS — boilerplate 제외 핵심만' },
          { label: '사용 가이드', tag: 'GUIDE', desc: '계수 튜닝·접근성·터치 폴백' },
          { label: '활용 추천', tag: 'PLACES', desc: '히어로 / 랜딩 / 제품 / 포트폴리오 4건' },
          { label: '트레이드오프', tag: 'NOTE', desc: '성능·접근성·권장 사용처' }
        ]
      },
      {
        type: 'note',
        value: 'Cuberto를 비롯한 Awwwards 수상작들의 시그니처인 rAF lerp 커스텀 커서를 10가지 패턴으로 분해. 모든 데모는 다크 배경(#0a0a0a) + Pretendard Variable + 한국어 본문이며, cursor:none 스테이지 안에서 마우스를 움직이면 동작하고 터치 환경에서는 안내 문구로 폴백한다.'
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
    console.log('✓ demos/custom-cursor/' + p.id + '.html');
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
  console.log('✓ analyses/custom-cursor/analysis.json');
  console.log('  ' + PATTERNS.length + ' patterns + 1 overview = ' + (PATTERNS.length + 1) + ' sections');
  var totalBlocks = Object.values(sections).reduce(function (acc, s) { return acc + s.blocks.length; }, 0);
  console.log('  ' + totalBlocks + ' blocks total');
}

main();
