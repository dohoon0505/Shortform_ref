#!/usr/bin/env node
/**
 * Interaction Lab — Category Generator: Before-After Slider (v1)
 * Knight Lab JuxtaposeJS 참고 — 10종 비포-애프터 비교 인터랙션 카탈로그
 *
 * - 카탈로그 최초의 드래그 트리거 (Pointer Events + setPointerCapture, 마우스·터치 통합)
 * - 외부 이미지 0 — 동일 inline SVG 선셋 아트워크의 필터 변형
 *   (BEFORE: grayscale + sepia 낡은 톤 / AFTER: 선명 컬러)
 * - 07 스크롤 스크럽 와이프만 scroll-track 240vh + sticky-stage 모델
 *
 * Usage: node scripts/generate-before-after-slider.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ANALYSIS_DIR = join(ROOT, 'analyses', 'before-after-slider');
const ANALYSIS_FILE = join(ANALYSIS_DIR, 'analysis.json');
const DEMO_DIR = join(ROOT, 'demos', 'before-after-slider');

const CATEGORY = {
  id: 'before-after-slider',
  title: '비포-애프터 슬라이더',
  type: 'category',
  date: '2026-06-10',
  url: 'https://juxtapose.knightlab.com/',
  summary: '두 이미지를 겹쳐 놓고 드래그 핸들·커서·스크롤이 분할선을 움직여 전/후를 실시간 비교하는 10가지 패턴. 카탈로그 최초의 드래그 트리거 — 리터칭·리뉴얼·AI 보정 랜딩의 킬러 설득 컴포넌트.'
};

/* ================================================================
   공통 아트워크 — inline SVG 선셋 풍경 (외부 이미지 0)
   BEFORE 레이어는 CSS filter(grayscale+sepia)로 낡은 톤 변형
   ================================================================ */

function artworkSVG(sfx) {
  return '<svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
    + '<defs>'
    + '<linearGradient id="sky-' + sfx + '" x1="0" y1="0" x2="0" y2="1">'
    + '<stop offset="0" stop-color="#1b1040"/>'
    + '<stop offset="0.45" stop-color="#5b2a86"/>'
    + '<stop offset="0.74" stop-color="#e8537a"/>'
    + '<stop offset="1" stop-color="#ffb347"/>'
    + '</linearGradient>'
    + '<radialGradient id="sun-' + sfx + '">'
    + '<stop offset="0" stop-color="#fff3c4"/>'
    + '<stop offset="0.5" stop-color="#ffd166" stop-opacity="0.85"/>'
    + '<stop offset="1" stop-color="#ffd166" stop-opacity="0"/>'
    + '</radialGradient>'
    + '<linearGradient id="sea-' + sfx + '" x1="0" y1="0" x2="0" y2="1">'
    + '<stop offset="0" stop-color="#ff9e5e"/>'
    + '<stop offset="0.25" stop-color="#b34d7d"/>'
    + '<stop offset="1" stop-color="#160d33"/>'
    + '</linearGradient>'
    + '</defs>'
    + '<rect width="800" height="500" fill="url(#sky-' + sfx + ')"/>'
    + '<circle cx="400" cy="332" r="170" fill="url(#sun-' + sfx + ')"/>'
    + '<circle cx="400" cy="332" r="54" fill="#ffe9a8"/>'
    + '<ellipse cx="225" cy="112" rx="95" ry="14" fill="rgba(255,255,255,0.16)"/>'
    + '<ellipse cx="590" cy="76" rx="72" ry="11" fill="rgba(255,255,255,0.13)"/>'
    + '<ellipse cx="660" cy="168" rx="110" ry="13" fill="rgba(255,255,255,0.09)"/>'
    + '<path d="M186 148 q8 -9 16 0 q8 -9 16 0" stroke="rgba(255,255,255,0.5)" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
    + '<path d="M610 206 q7 -8 14 0 q7 -8 14 0" stroke="rgba(255,255,255,0.4)" stroke-width="2" fill="none" stroke-linecap="round"/>'
    + '<path d="M0 362 L150 246 L262 330 L368 268 L470 362 Z" fill="#54317e"/>'
    + '<path d="M320 362 L478 228 L618 318 L800 244 L800 362 Z" fill="#3a2161"/>'
    + '<rect y="360" width="800" height="140" fill="url(#sea-' + sfx + ')"/>'
    + '<rect x="350" y="374" width="100" height="5" rx="2.5" fill="rgba(255,217,130,0.5)"/>'
    + '<rect x="364" y="390" width="72" height="4" rx="2" fill="rgba(255,217,130,0.38)"/>'
    + '<rect x="376" y="405" width="48" height="3" rx="1.5" fill="rgba(255,217,130,0.28)"/>'
    + '<rect x="386" y="419" width="28" height="3" rx="1.5" fill="rgba(255,217,130,0.2)"/>'
    + '<path d="M0 470 Q200 452 400 468 T800 462 L800 500 L0 500 Z" fill="#120a28"/>'
    + '</svg>';
}

function layerHTML(cls, sfx) {
  return '<div class="ba-layer ' + cls + '">' + artworkSVG(sfx) + '</div>';
}

function blindsHTML() {
  var out = '<div class="blinds">';
  for (var i = 0; i < 8; i++) {
    out += '<div class="blind" style="left:' + (i * 12.5) + '%;width:12.5%;">'
      + '<div class="blind-inner" style="transform:translateX(' + (-i * 12.5) + '%);">'
      + artworkSVG('s' + i)
      + '</div></div>';
  }
  out += '</div>';
  return out;
}

/* ================================================================
   공통 CSS — 비교 프레임 + 라벨 + 핸들
   ================================================================ */

const BA_CSS = ''
  + '.stage { height: 100vh; display: flex; align-items: center; justify-content: center; padding: 56px 4vw 48px; }\n'
  + '.ba {\n'
  + '  position: relative;\n'
  + '  width: min(720px, 90vw, calc((100vh - 128px) * 1.6));\n'
  + '  aspect-ratio: 16 / 10;\n'
  + '  border-radius: 16px; overflow: hidden;\n'
  + '  border: 1px solid rgba(255,255,255,0.1);\n'
  + '  box-shadow: 0 30px 80px -24px rgba(0,0,0,0.9);\n'
  + '  background: #120a28;\n'
  + '  touch-action: none; user-select: none; -webkit-user-select: none;\n'
  + '}\n'
  + '.ba-layer { position: absolute; inset: 0; }\n'
  + '.ba-layer svg { width: 100%; height: 100%; display: block; }\n'
  + '.ba-before svg { filter: grayscale(1) sepia(0.38) brightness(0.74) contrast(0.88); }\n'
  + '.ba-tag { position: absolute; top: 14px; z-index: 6; font: 700 10px/1 ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: 0.16em; padding: 7px 12px; border-radius: 999px; background: rgba(0,0,0,0.55); color: rgba(255,255,255,0.85); border: 1px solid rgba(255,255,255,0.18); pointer-events: none; }\n'
  + '.tag-before { left: 14px; }\n'
  + '.tag-after { right: 14px; color: #ffd166; border-color: rgba(255,209,102,0.4); }\n'
  + '.ba-handle { position: absolute; top: 0; bottom: 0; left: 50%; width: 2px; margin-left: -1px; background: rgba(255,255,255,0.95); box-shadow: 0 0 14px rgba(0,0,0,0.6); z-index: 5; pointer-events: none; }\n'
  + '.ba-grip { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 40px; height: 40px; border-radius: 50%; background: #fff; color: #111; display: flex; align-items: center; justify-content: center; font: 700 15px/1 "Pretendard Variable", "Pretendard", sans-serif; box-shadow: 0 6px 18px rgba(0,0,0,0.5); }\n';

/* ================================================================
   공통 JS — Pointer Events 드래그 플러밍 (마우스·터치 통합)
   각 패턴 js는 ba / setPos / update 를 정의한 뒤 이 문자열을 이어붙임
   ================================================================ */

const DRAG_JS = ''
  + 'var dragging = false;\n'
  + 'ba.addEventListener("pointerdown", function(e){\n'
  + '  dragging = true;\n'
  + '  try { ba.setPointerCapture(e.pointerId); } catch (err) {}\n'
  + '  update(e);\n'
  + '  e.preventDefault();\n'
  + '});\n'
  + 'ba.addEventListener("pointermove", function(e){ if (dragging) update(e); });\n'
  + 'ba.addEventListener("pointerup", function(e){\n'
  + '  dragging = false;\n'
  + '  try { ba.releasePointerCapture(e.pointerId); } catch (err) {}\n'
  + '});\n'
  + 'ba.addEventListener("pointercancel", function(){ dragging = false; });';

const SNIPPET_DRAG_JS = ''
  + 'var dragging = false;\n'
  + 'ba.addEventListener("pointerdown", function(e){\n'
  + '  dragging = true;\n'
  + '  ba.setPointerCapture(e.pointerId);\n'
  + '  update(e);\n'
  + '});\n'
  + 'ba.addEventListener("pointermove", function(e){ if (dragging) update(e); });\n'
  + 'ba.addEventListener("pointerup", function(e){\n'
  + '  dragging = false;\n'
  + '  ba.releasePointerCapture(e.pointerId);\n'
  + '});';

/* ================================================================
   10 패턴 정의
   ================================================================ */

const PATTERNS = [
  // ── 01. horizontal-wipe (시그니처) ──
  {
    id: 'horizontal-wipe', num: '01', title: '가로 와이프 (시그니처)',
    summary: '비포-애프터 비교의 표준형이자 시그니처. BEFORE 레이어의 clip-path inset() 오른쪽 인셋이 핸들 X좌표에 1:1로 묶여, 세로 분할선을 드래그하는 만큼 전/후가 실시간으로 교차한다. Knight Lab JuxtaposeJS의 기본 모드 재현.',
    demo: {
      bodyHTML: '<main class="stage">\n'
        + '  <div class="ba" id="ba">\n'
        + '    ' + layerHTML('ba-after', 'a') + '\n'
        + '    ' + layerHTML('ba-before', 'b') + '\n'
        + '    <span class="ba-tag tag-before">BEFORE</span>\n'
        + '    <span class="ba-tag tag-after">AFTER</span>\n'
        + '    <div class="ba-handle"><div class="ba-grip">⇄</div></div>\n'
        + '  </div>\n'
        + '</main>',
      css: '.ba { --pos: 50%; cursor: ew-resize; }\n'
        + '.ba-before { clip-path: inset(0 calc(100% - var(--pos)) 0 0); -webkit-clip-path: inset(0 calc(100% - var(--pos)) 0 0); }\n'
        + '.ba-handle { left: var(--pos); }',
      js: 'var ba = document.getElementById("ba");\n'
        + 'function setPos(p){\n'
        + '  p = Math.max(0, Math.min(1, p));\n'
        + '  ba.style.setProperty("--pos", (p * 100).toFixed(2) + "%");\n'
        + '}\n'
        + 'function update(e){\n'
        + '  var r = ba.getBoundingClientRect();\n'
        + '  setPos((e.clientX - r.left) / r.width);\n'
        + '}\n'
        + DRAG_JS + '\n'
        + 'setPos(0.5);',
      hint: '핸들을 드래그해보세요 ⇄',
      height: 480
    },
    snippetHTML: '<div class="ba">\n  <div class="ba-layer ba-after"><img src="after.jpg" alt="보정 후"></div>\n  <div class="ba-layer ba-before"><img src="before.jpg" alt="보정 전"></div>\n  <span class="ba-tag tag-before">BEFORE</span>\n  <span class="ba-tag tag-after">AFTER</span>\n  <div class="ba-handle"><div class="ba-grip">⇄</div></div>\n</div>',
    snippetCSS: '.ba { --pos: 50%; position: relative; aspect-ratio: 16 / 10;\n  overflow: hidden; touch-action: none; cursor: ew-resize; }\n.ba-layer { position: absolute; inset: 0; }\n.ba-before { clip-path: inset(0 calc(100% - var(--pos)) 0 0); }\n.ba-handle { position: absolute; top: 0; bottom: 0;\n  left: var(--pos); width: 2px; margin-left: -1px;\n  background: #fff; pointer-events: none; }',
    snippetJS: 'var ba = document.querySelector(".ba");\nfunction setPos(p){\n  p = Math.max(0, Math.min(1, p));\n  ba.style.setProperty("--pos", (p * 100) + "%");\n}\nfunction update(e){\n  var r = ba.getBoundingClientRect();\n  setPos((e.clientX - r.left) / r.width);\n}\n' + SNIPPET_DRAG_JS,
    explain: '두 레이어를 같은 프레임에 겹쳐 놓고 위 레이어(BEFORE)에 clip-path: inset(0 calc(100% - var(--pos)) 0 0)을 적용한다. --pos가 50%면 왼쪽 절반만 BEFORE가 보이고 나머지는 아래 레이어(AFTER)가 드러난다. Pointer Events(pointerdown/move/up)로 마우스·터치를 통합 처리하고, setPointerCapture로 드래그 중 커서가 프레임 밖으로 나가도 추적이 끊기지 않는다. JS는 clientX를 컨테이너 비율로 정규화해 CSS 변수 --pos 하나만 갱신 — 클립·핸들·분할선이 전부 이 변수에 묶여 있어 상태가 단일 소스로 유지된다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (Pointer Events)' },
      { label: '트리거', value: 'pointerdown → pointermove 드래그 (X좌표)' },
      { label: '핵심 수식', value: '--pos = clamp(0, (clientX − left) / width, 1) × 100%' },
      { label: '클립', value: 'inset(0 calc(100% − var(--pos)) 0 0)' },
      { label: '핸들', value: 'left: var(--pos) — 클립과 같은 변수로 동기화' },
      { label: '참고', value: 'Knight Lab JuxtaposeJS / img-comparison-slider' }
    ],
    guide: 'transition 없이 매 pointermove마다 --pos를 직접 갱신해야 손에 붙는 조작감이 난다. 컨테이너에 touch-action: none을 줘야 모바일에서 드래그가 페이지 스크롤로 새지 않는다. 두 레이어는 반드시 같은 크기·같은 구도의 이미지여야 비교 신뢰도가 유지된다. setPointerCapture 덕분에 핸들이 아닌 프레임 어디를 잡아도 드래그가 시작되게 하는 편이 사용성이 좋다 — 핸들은 어포던스 표시 역할.',
    recommendations: [
      { place: '히어로 헤더', body: '리터칭·복원 스튜디오 메인 — 첫 화면에서 실력을 즉시 증명' },
      { place: '랜딩 페이지', body: 'AI 보정 서비스 — 업로드 전후 결과를 인터랙티브로 설득' },
      { place: '제품 섹션', body: '리뉴얼 전후 UI 비교 — 개선 포인트를 한 프레임에' },
      { place: '포트폴리오 소개', body: '사진가·디자이너 작업 전후 슬라이더 갤러리' }
    ],
    tradeoff: '드래그 가능함이 시각적으로 드러나지 않으면 정적 이미지로 오해받기 쉬움 — 핸들·그립·힌트 라벨 필수. 두 이미지의 해상도·구도가 어긋나면 비교 신뢰도가 무너짐.'
  },

  // ── 02. vertical-wipe ──
  {
    id: 'vertical-wipe', num: '02', title: '세로 와이프',
    summary: '분할선을 가로로 눕힌 변형. clip-path inset()의 아래 인셋을 핸들 Y좌표에 묶어 위아래로 드래그하면 BEFORE가 위에서부터 덮인다. 하늘·수면처럼 상하 구도가 강한 장면에 적합.',
    demo: {
      bodyHTML: '<main class="stage">\n'
        + '  <div class="ba" id="ba">\n'
        + '    ' + layerHTML('ba-after', 'a') + '\n'
        + '    ' + layerHTML('ba-before', 'b') + '\n'
        + '    <span class="ba-tag tag-before">BEFORE</span>\n'
        + '    <span class="ba-tag tag-after">AFTER</span>\n'
        + '    <div class="ba-handle"><div class="ba-grip">⇅</div></div>\n'
        + '  </div>\n'
        + '</main>',
      css: '.ba { --pos: 50%; cursor: ns-resize; }\n'
        + '.ba-before { clip-path: inset(0 0 calc(100% - var(--pos)) 0); -webkit-clip-path: inset(0 0 calc(100% - var(--pos)) 0); }\n'
        + '.ba-handle { top: var(--pos); bottom: auto; left: 0; right: 0; width: auto; height: 2px; margin-left: 0; margin-top: -1px; }\n'
        + '.tag-after { top: auto; bottom: 14px; }',
      js: 'var ba = document.getElementById("ba");\n'
        + 'function setPos(p){\n'
        + '  p = Math.max(0, Math.min(1, p));\n'
        + '  ba.style.setProperty("--pos", (p * 100).toFixed(2) + "%");\n'
        + '}\n'
        + 'function update(e){\n'
        + '  var r = ba.getBoundingClientRect();\n'
        + '  setPos((e.clientY - r.top) / r.height);\n'
        + '}\n'
        + DRAG_JS + '\n'
        + 'setPos(0.5);',
      hint: '핸들을 위아래로 드래그해보세요 ⇅',
      height: 480
    },
    snippetHTML: '<div class="ba">\n  <div class="ba-layer ba-after"><img src="after.jpg" alt="보정 후"></div>\n  <div class="ba-layer ba-before"><img src="before.jpg" alt="보정 전"></div>\n  <div class="ba-handle"><div class="ba-grip">⇅</div></div>\n</div>',
    snippetCSS: '.ba { --pos: 50%; position: relative; aspect-ratio: 16 / 10;\n  overflow: hidden; touch-action: none; cursor: ns-resize; }\n.ba-before { clip-path: inset(0 0 calc(100% - var(--pos)) 0); }\n.ba-handle { position: absolute; left: 0; right: 0;\n  top: var(--pos); height: 2px; margin-top: -1px;\n  background: #fff; pointer-events: none; }',
    snippetJS: 'var ba = document.querySelector(".ba");\nfunction setPos(p){\n  p = Math.max(0, Math.min(1, p));\n  ba.style.setProperty("--pos", (p * 100) + "%");\n}\nfunction update(e){\n  var r = ba.getBoundingClientRect();\n  setPos((e.clientY - r.top) / r.height);\n}\n' + SNIPPET_DRAG_JS,
    explain: '가로 와이프와 동일한 구조에서 축만 Y로 바꾼 변형. clientY를 컨테이너 높이로 정규화해 --pos에 넣고, BEFORE 레이어는 clip-path: inset(0 0 calc(100% - var(--pos)) 0)으로 위에서부터 --pos만큼만 보인다. 핸들은 top: var(--pos)에 묶인 2px 가로 라인 + 중앙 ⇅ 그립. cursor: ns-resize로 조작 방향을 커서 모양으로도 안내한다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (Pointer Events)' },
      { label: '트리거', value: 'pointerdown → pointermove 드래그 (Y좌표)' },
      { label: '핵심 수식', value: '--pos = clamp(0, (clientY − top) / height, 1) × 100%' },
      { label: '클립', value: 'inset(0 0 calc(100% − var(--pos)) 0)' },
      { label: '핸들', value: 'top: var(--pos) 가로 라인 + ⇅ 그립' },
      { label: '참고', value: 'JuxtaposeJS vertical 모드' }
    ],
    guide: '세로 드래그는 모바일의 페이지 스크롤 제스처와 정면으로 겹치므로 touch-action: none이 가로형보다 훨씬 중요하다. 하늘/땅, 수면/수중처럼 상하 구도가 강한 장면에서만 가로형 대신 선택할 것. iframe처럼 높이가 제한된 곳에서는 핸들 가동 범위가 짧아지므로 프레임 비율을 16:10 이상으로 확보하면 조작감이 산다.',
    recommendations: [
      { place: '히어로 헤더', body: '풍경·부동산 전후 — 하늘 보정을 상하 와이프로 강조' },
      { place: '랜딩 페이지', body: '인테리어 시공 전후 — 천장에서 바닥으로 쓸어내리는 비교' },
      { place: '제품 섹션', body: '디스플레이 명암비 데모 — 상단 어둡게/하단 밝게 대비' },
      { place: '포트폴리오 소개', body: '색보정 릴 — 세로 와이프로 변주를 주는 케이스 카드' }
    ],
    tradeoff: '세로 드래그가 모바일 스크롤 제스처와 충돌해 UX 마찰 발생 — touch-action: none 필수. 가로형보다 발견성이 낮아 그립에 ⇅ 기호를 명시해야 함.'
  },

  // ── 03. hover-follow ──
  {
    id: 'hover-follow', num: '03', title: '호버 팔로우',
    summary: '핸들 없이 커서 X좌표가 곧 분할선이 되는 즉답형. 커서를 움직이는 대로 분할선이 lerp로 따라오고, 프레임을 떠나면 중앙 50%로 부드럽게 복귀한다. 클릭·드래그 비용 0의 비교 인터랙션.',
    demo: {
      bodyHTML: '<main class="stage">\n'
        + '  <div class="ba" id="ba">\n'
        + '    ' + layerHTML('ba-after', 'a') + '\n'
        + '    ' + layerHTML('ba-before', 'b') + '\n'
        + '    <span class="ba-tag tag-before">BEFORE</span>\n'
        + '    <span class="ba-tag tag-after">AFTER</span>\n'
        + '    <div class="ba-handle"></div>\n'
        + '  </div>\n'
        + '</main>',
      css: '.ba { --pos: 50%; cursor: crosshair; }\n'
        + '.ba-before { clip-path: inset(0 calc(100% - var(--pos)) 0 0); -webkit-clip-path: inset(0 calc(100% - var(--pos)) 0 0); }\n'
        + '.ba-handle { left: var(--pos); background: rgba(255,255,255,0.85); }',
      js: 'var ba = document.getElementById("ba");\n'
        + 'var target = 0.5;\n'
        + 'var cur = 0.5;\n'
        + 'function fromEvent(e){\n'
        + '  var r = ba.getBoundingClientRect();\n'
        + '  target = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));\n'
        + '}\n'
        + 'ba.addEventListener("pointermove", fromEvent);\n'
        + 'ba.addEventListener("pointerdown", fromEvent);\n'
        + 'ba.addEventListener("pointerleave", function(){ target = 0.5; });\n'
        + 'function frame(){\n'
        + '  cur += (target - cur) * 0.12;\n'
        + '  if (Math.abs(target - cur) < 0.0004) cur = target;\n'
        + '  ba.style.setProperty("--pos", (cur * 100).toFixed(2) + "%");\n'
        + '  requestAnimationFrame(frame);\n'
        + '}\n'
        + 'requestAnimationFrame(frame);',
      hint: '이미지 위에서 커서를 움직여보세요 ⇄',
      height: 480
    },
    snippetHTML: '<div class="ba">\n  <div class="ba-layer ba-after"><img src="after.jpg" alt="보정 후"></div>\n  <div class="ba-layer ba-before"><img src="before.jpg" alt="보정 전"></div>\n  <div class="ba-handle"></div>\n</div>',
    snippetCSS: '.ba { --pos: 50%; position: relative; aspect-ratio: 16 / 10;\n  overflow: hidden; touch-action: none; cursor: crosshair; }\n.ba-before { clip-path: inset(0 calc(100% - var(--pos)) 0 0); }\n.ba-handle { position: absolute; top: 0; bottom: 0;\n  left: var(--pos); width: 2px; background: #fff;\n  pointer-events: none; }',
    snippetJS: 'var target = 0.5, cur = 0.5;\nba.addEventListener("pointermove", function(e){\n  var r = ba.getBoundingClientRect();\n  target = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));\n});\nba.addEventListener("pointerleave", function(){ target = 0.5; });\nfunction frame(){\n  cur += (target - cur) * 0.12;   // lerp 저역 필터\n  ba.style.setProperty("--pos", (cur * 100) + "%");\n  requestAnimationFrame(frame);\n}\nrequestAnimationFrame(frame);',
    explain: 'pointermove마다 커서 X를 정규화해 target에 저장하고, rAF 루프가 cur += (target - cur) × 0.12 lerp(저역 필터)로 분할선을 따라가게 한다. 커서를 직접 1:1로 묶지 않고 lerp를 거치면 분할선이 반 박자 늦게 따라와 묵직하고 고급스러운 질감이 난다. pointerleave에서 target을 0.5로 되돌리면 같은 루프가 자연스럽게 중앙 복귀까지 처리 — 복귀 전용 코드가 따로 없다. pointerdown도 같은 핸들러에 묶어 터치 폴백을 겸한다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (pointermove + rAF lerp)' },
      { label: '트리거', value: 'hover 이동 — 클릭·드래그 불필요' },
      { label: '보간', value: 'cur += (target − cur) × 0.12' },
      { label: '복귀', value: 'pointerleave → target = 50% (동일 lerp)' },
      { label: '클립', value: 'inset(0 calc(100% − var(--pos)) 0 0)' },
      { label: '참고', value: 'Awwwards 호버 비교 갤러리' }
    ],
    guide: 'lerp 계수는 0.1~0.18이 적정 — 낮을수록 묵직하고 0.2 이상이면 즉답에 가깝다. 터치 기기에는 hover가 없으므로 pointerdown을 같은 핸들러에 묶어 탭·드래그 폴백을 제공할 것. 스치기만 해도 반응하므로 의도치 않은 트리거가 잦다 — 히어로 전면보다는 카드 단위로 쓰는 편이 좋다. 멈춰 세울 수 없어 정밀 비교가 목적이면 01 드래그형을 선택.',
    recommendations: [
      { place: '히어로 헤더', body: '마우스가 지나가기만 해도 반응하는 인트로 — 발견 비용 0' },
      { place: '랜딩 페이지', body: '스크롤 중 시선을 끄는 중간 비교 섹션' },
      { place: '제품 섹션', body: '갤러리 카드 hover 비교 — 카드마다 즉답 반응' },
      { place: '포트폴리오 소개', body: '리터칭 썸네일 그리드 — 훑어보기 좋은 가벼운 비교' }
    ],
    tradeoff: '분할선을 멈춰 세울 수 없어 정밀 비교에는 부적합. 터치 기기 폴백 필수. rAF 상시 루프가 돌므로 idle 시 target == cur이면 갱신을 스킵하는 최적화 여지.'
  },

  // ── 04. spotlight-lens ──
  {
    id: 'spotlight-lens', num: '04', title: '스포트라이트 렌즈',
    summary: 'AFTER 레이어를 clip-path: circle()로 잘라 커서를 따라다니는 원형 렌즈 안에서만 보여준다. 손전등으로 비추듯 국소 비교 — 보정 디테일을 픽셀 단위로 검증시키는 패턴.',
    demo: {
      bodyHTML: '<main class="stage">\n'
        + '  <div class="ba" id="ba">\n'
        + '    ' + layerHTML('ba-before', 'b') + '\n'
        + '    <div class="ba-layer ba-lens" id="lens">' + artworkSVG('a') + '</div>\n'
        + '    <span class="ba-tag tag-before">BEFORE</span>\n'
        + '    <span class="ba-tag tag-after">AFTER ◎</span>\n'
        + '    <div class="lens-ring" id="ring"></div>\n'
        + '  </div>\n'
        + '</main>',
      css: '.ba { cursor: crosshair; }\n'
        + '.ba-lens { clip-path: circle(0px at 50% 50%); -webkit-clip-path: circle(0px at 50% 50%); will-change: clip-path; }\n'
        + '.lens-ring { position: absolute; left: 50%; top: 50%; width: 0; height: 0; border: 2px solid rgba(255,255,255,0.9); border-radius: 50%; transform: translate(-50%, -50%); box-shadow: 0 0 24px rgba(0,0,0,0.55); opacity: 0; z-index: 6; pointer-events: none; }',
      js: 'var ba = document.getElementById("ba");\n'
        + 'var lens = document.getElementById("lens");\n'
        + 'var ring = document.getElementById("ring");\n'
        + 'var tx = 0, ty = 0, tr = 0;\n'
        + 'var cx = 0, cy = 0, cr = 0;\n'
        + 'function radius(){\n'
        + '  var r = ba.getBoundingClientRect();\n'
        + '  return Math.min(r.width, r.height) * 0.32;\n'
        + '}\n'
        + 'function toLocal(e){\n'
        + '  var r = ba.getBoundingClientRect();\n'
        + '  tx = Math.max(0, Math.min(r.width, e.clientX - r.left));\n'
        + '  ty = Math.max(0, Math.min(r.height, e.clientY - r.top));\n'
        + '}\n'
        + 'ba.addEventListener("pointermove", function(e){ toLocal(e); tr = radius(); });\n'
        + 'ba.addEventListener("pointerdown", function(e){ toLocal(e); tr = radius(); });\n'
        + 'ba.addEventListener("pointerleave", function(){ tr = 0; });\n'
        + 'function frame(){\n'
        + '  cx += (tx - cx) * 0.18;\n'
        + '  cy += (ty - cy) * 0.18;\n'
        + '  cr += (tr - cr) * 0.16;\n'
        + '  if (tr === 0 && cr < 0.3) cr = 0;\n'
        + '  var clip = "circle(" + cr.toFixed(1) + "px at " + cx.toFixed(1) + "px " + cy.toFixed(1) + "px)";\n'
        + '  lens.style.clipPath = clip;\n'
        + '  lens.style.webkitClipPath = clip;\n'
        + '  ring.style.left = cx.toFixed(1) + "px";\n'
        + '  ring.style.top = cy.toFixed(1) + "px";\n'
        + '  ring.style.width = (cr * 2).toFixed(1) + "px";\n'
        + '  ring.style.height = (cr * 2).toFixed(1) + "px";\n'
        + '  ring.style.opacity = cr > 1 ? 1 : 0;\n'
        + '  requestAnimationFrame(frame);\n'
        + '}\n'
        + 'requestAnimationFrame(frame);',
      hint: '커서를 움직여 렌즈로 비춰보세요 ◎',
      height: 480
    },
    snippetHTML: '<div class="ba">\n  <div class="ba-layer ba-before"><img src="before.jpg" alt="보정 전"></div>\n  <div class="ba-layer ba-lens"><img src="after.jpg" alt="보정 후"></div>\n  <div class="lens-ring"></div>\n</div>',
    snippetCSS: '.ba { position: relative; aspect-ratio: 16 / 10;\n  overflow: hidden; touch-action: none; cursor: crosshair; }\n.ba-lens { clip-path: circle(0px at 50% 50%); will-change: clip-path; }\n.lens-ring { position: absolute; border: 2px solid #fff;\n  border-radius: 50%; transform: translate(-50%, -50%);\n  pointer-events: none; }',
    snippetJS: 'var tx = 0, ty = 0, tr = 0, cx = 0, cy = 0, cr = 0;\nba.addEventListener("pointermove", function(e){\n  var r = ba.getBoundingClientRect();\n  tx = e.clientX - r.left; ty = e.clientY - r.top;\n  tr = Math.min(r.width, r.height) * 0.32;\n});\nba.addEventListener("pointerleave", function(){ tr = 0; });\nfunction frame(){\n  cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18; cr += (tr - cr) * 0.16;\n  lens.style.clipPath = "circle(" + cr + "px at " + cx + "px " + cy + "px)";\n  requestAnimationFrame(frame);\n}\nrequestAnimationFrame(frame);',
    explain: '베이스는 BEFORE 전체, 그 위 AFTER 레이어에 clip-path: circle(r at x y)를 인라인으로 매 프레임 갱신한다. pointermove가 목표 좌표(tx, ty)와 목표 반지름(tr)을 쓰고, rAF 루프가 x·y·r 세 값을 각각 lerp로 보간 — 렌즈가 커서를 탄성 있게 따라오고, 진입 시 반지름이 0에서 부풀어 오르며 이탈 시 다시 0으로 수축한다. 렌즈 테두리는 별도 ring 요소를 같은 좌표·지름으로 동기화해 경계를 또렷하게 만든다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (pointermove + rAF lerp)' },
      { label: '트리거', value: 'hover — 원 안에서만 AFTER 노출' },
      { label: '클립', value: 'circle(r px at x px y px) 인라인 갱신' },
      { label: '보간', value: 'x·y lerp 0.18 / r lerp 0.16' },
      { label: '반지름', value: 'min(W, H) × 0.32 — 진입 0→r, 이탈 r→0' },
      { label: '참고', value: '돋보기 렌즈 UI / 리터칭 검수 툴' }
    ],
    guide: '반지름은 프레임 짧은 변의 30~40%가 적정 — 너무 크면 분할 비교와 다를 게 없고, 너무 작으면 차이가 안 보인다. 테두리 ring을 따로 두면 "이 원 안만 다르다"는 경계가 명확해진다. 터치에서는 손가락이 누르는 동안만 렌즈를 띄우는 방식으로 폴백. 전역 차이까지 보여줘야 하면 01 가로 와이프와 한 페이지에 병용하면 상호 보완된다.',
    recommendations: [
      { place: '히어로 헤더', body: '디테일 자신감 강조 — 피부 리터칭·업스케일 국소 검증' },
      { place: '랜딩 페이지', body: 'AI 업스케일 서비스 — 픽셀 디테일을 렌즈로 확인시키기' },
      { place: '제품 섹션', body: '렌즈·카메라 화질 비교 — 제품 메타포와 일치' },
      { place: '포트폴리오 소개', body: '보정 디테일 인터랙티브 검수 — 시선 유도형 갤러리' }
    ],
    tradeoff: '한 번에 일부 영역만 비교 가능 — 전역 차이 전달에는 부적합. circle() 클립 갱신 자체는 합성 단계라 가볍지만 blur 등 필터와 중첩되면 비용 증가. 터치에서는 손가락이 렌즈를 가림.'
  },

  // ── 05. diagonal-split ──
  {
    id: 'diagonal-split', num: '05', title: '대각선 분할',
    summary: '분할선을 사선으로 눕힌 에디토리얼 변형. BEFORE 레이어의 polygon() 4점 중 위·아래 x좌표를 ±12% 어긋나게 두고, 드래그 X에 따라 사선 경계가 통째로 이동한다.',
    demo: {
      bodyHTML: '<main class="stage">\n'
        + '  <div class="ba" id="ba">\n'
        + '    ' + layerHTML('ba-after', 'a') + '\n'
        + '    ' + layerHTML('ba-before', 'b') + '\n'
        + '    <span class="ba-tag tag-before">BEFORE</span>\n'
        + '    <span class="ba-tag tag-after">AFTER</span>\n'
        + '    <div class="dg-line"><div class="ba-grip">⇄</div></div>\n'
        + '  </div>\n'
        + '</main>',
      css: '.ba { --pos: 50%; cursor: ew-resize; }\n'
        + '.ba-before { clip-path: polygon(0 0, calc(var(--pos) + 12%) 0, calc(var(--pos) - 12%) 100%, 0 100%); -webkit-clip-path: polygon(0 0, calc(var(--pos) + 12%) 0, calc(var(--pos) - 12%) 100%, 0 100%); }\n'
        + '.dg-line { position: absolute; top: -7%; bottom: -7%; left: var(--pos); width: 2px; margin-left: -1px; background: rgba(255,255,255,0.95); box-shadow: 0 0 14px rgba(0,0,0,0.6); transform: rotate(21deg); z-index: 5; pointer-events: none; }\n'
        + '.dg-line .ba-grip { transform: translate(-50%, -50%) rotate(-21deg); }',
      js: 'var ba = document.getElementById("ba");\n'
        + 'function setPos(p){\n'
        + '  p = Math.max(-0.14, Math.min(1.14, p));\n'
        + '  ba.style.setProperty("--pos", (p * 100).toFixed(2) + "%");\n'
        + '}\n'
        + 'function update(e){\n'
        + '  var r = ba.getBoundingClientRect();\n'
        + '  setPos((e.clientX - r.left) / r.width);\n'
        + '}\n'
        + DRAG_JS + '\n'
        + 'setPos(0.5);',
      hint: '핸들을 드래그해보세요 ⇄',
      height: 480
    },
    snippetHTML: '<div class="ba">\n  <div class="ba-layer ba-after"><img src="after.jpg" alt="보정 후"></div>\n  <div class="ba-layer ba-before"><img src="before.jpg" alt="보정 전"></div>\n  <div class="dg-line"><div class="ba-grip">⇄</div></div>\n</div>',
    snippetCSS: '.ba { --pos: 50%; position: relative; aspect-ratio: 16 / 10;\n  overflow: hidden; touch-action: none; cursor: ew-resize; }\n.ba-before { clip-path: polygon(0 0,\n  calc(var(--pos) + 12%) 0,\n  calc(var(--pos) - 12%) 100%,\n  0 100%); }\n.dg-line { position: absolute; top: -7%; bottom: -7%;\n  left: var(--pos); width: 2px; background: #fff;\n  transform: rotate(21deg); pointer-events: none; }',
    snippetJS: 'var ba = document.querySelector(".ba");\nfunction setPos(p){\n  p = Math.max(-0.14, Math.min(1.14, p));  // ±12% 오프셋만큼 여유\n  ba.style.setProperty("--pos", (p * 100) + "%");\n}\nfunction update(e){\n  var r = ba.getBoundingClientRect();\n  setPos((e.clientX - r.left) / r.width);\n}\n' + SNIPPET_DRAG_JS,
    explain: 'BEFORE 레이어를 polygon(0 0, calc(var(--pos) + 12%) 0, calc(var(--pos) - 12%) 100%, 0 100%)로 자른다. 위 꼭짓점이 +12%, 아래가 −12%라 경계가 항상 같은 기울기의 사선으로 유지되고, --pos만 바꾸면 사선이 통째로 평행 이동한다. 16:10 프레임 기준 기울기는 atan(0.24W / 0.625W) ≈ 21° — 핸들 라인도 rotate(21deg)로 동일 각도를 맞추고, 그립은 rotate(-21deg)로 역보정해 수평을 유지한다. clamp 범위를 −14%~114%로 넓혀 사선 끝까지 완전 개폐가 가능하다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (Pointer Events)' },
      { label: '트리거', value: 'pointerdown → pointermove 드래그 (X좌표)' },
      { label: '클립', value: 'polygon 4점 — 상단 +12% / 하단 −12% 오프셋' },
      { label: '기울기', value: '16:10 기준 약 21° — 핸들 rotate(21deg) 동기화' },
      { label: '가동 범위', value: 'clamp(−14%, pos, 114%) — 완전 개폐 허용' },
      { label: '참고', value: '패션·에디토리얼 룩북 사선 컷' }
    ],
    guide: '오프셋 ±10~15%가 적정 — 클수록 드라마틱하지만 끝 영역에서 비교 영역이 잘린다. 오프셋만큼 clamp 범위를 양쪽으로 넓혀야 완전히 열리고 닫힌다. 핸들 각도는 프레임 비율에 종속이므로 aspect-ratio를 바꾸면 atan(가로 오프셋 합 × W / H)으로 재계산할 것. 수직 디테일(인물 전신, 건물)보다 분위기 전환 연출에 강하다.',
    recommendations: [
      { place: '히어로 헤더', body: '패션·뷰티 캠페인 전후 — 사선 컷의 에디토리얼 무드' },
      { place: '랜딩 페이지', body: '브랜드 리뉴얼 비교 섹션 — 역동적인 분할 연출' },
      { place: '제품 섹션', body: '컬러웨이 A/B 사선 비교 — 같은 제품 두 가지 마감' },
      { place: '포트폴리오 소개', body: '에디토리얼 감성 표지 — 작업 전후를 사선으로 교차' }
    ],
    tradeoff: '사선이라 특정 위치의 정밀 비교 정확도는 떨어짐 — 무드 전달용. polygon + calc 조합은 evergreen 전제. 사선 각도가 프레임 비율에 종속되어 반응형에서 핸들 각도 재계산 필요.'
  },

  // ── 06. blind-stripes ──
  {
    id: 'blind-stripes', num: '06', title: '블라인드 스트라이프',
    summary: 'AFTER를 수직 띠 8개로 썰어 드래그 진행률만큼 각 띠가 위에서 아래로 시차를 두고 열린다. 베네치안 블라인드 메타포 — 진행률 하나로 8개 띠의 stagger 개폐를 구동하는 연출형.',
    demo: {
      bodyHTML: '<main class="stage">\n'
        + '  <div class="ba" id="ba">\n'
        + '    ' + layerHTML('ba-before', 'b') + '\n'
        + '    ' + blindsHTML() + '\n'
        + '    <span class="ba-tag tag-before">BEFORE</span>\n'
        + '    <span class="ba-tag tag-after">AFTER</span>\n'
        + '    <div class="ba-handle"><div class="ba-grip">⇄</div></div>\n'
        + '  </div>\n'
        + '</main>',
      css: '.ba { --pos: 40%; cursor: ew-resize; }\n'
        + '.blinds { position: absolute; inset: 0; z-index: 2; }\n'
        + '.blind { position: absolute; top: 0; bottom: 0; overflow: hidden; clip-path: inset(0 0 100% 0); -webkit-clip-path: inset(0 0 100% 0); }\n'
        + '.blind-inner { position: absolute; top: 0; left: 0; width: 800%; height: 100%; }\n'
        + '.blind-inner svg { width: 100%; height: 100%; display: block; }\n'
        + '.ba-handle { left: var(--pos); }',
      js: 'var ba = document.getElementById("ba");\n'
        + 'var blinds = ba.querySelectorAll(".blind");\n'
        + 'function setPos(p){\n'
        + '  p = Math.max(0, Math.min(1, p));\n'
        + '  ba.style.setProperty("--pos", (p * 100).toFixed(2) + "%");\n'
        + '  for (var i = 0; i < blinds.length; i++) {\n'
        + '    var local = (p - i * 0.06) / 0.58;\n'
        + '    local = Math.max(0, Math.min(1, local));\n'
        + '    var clip = "inset(0 0 " + ((1 - local) * 100).toFixed(2) + "% 0)";\n'
        + '    blinds[i].style.clipPath = clip;\n'
        + '    blinds[i].style.webkitClipPath = clip;\n'
        + '  }\n'
        + '}\n'
        + 'function update(e){\n'
        + '  var r = ba.getBoundingClientRect();\n'
        + '  setPos((e.clientX - r.left) / r.width);\n'
        + '}\n'
        + DRAG_JS + '\n'
        + 'setPos(0.4);',
      hint: '핸들을 드래그해보세요 ⇄',
      height: 480
    },
    snippetHTML: '<div class="ba">\n  <div class="ba-layer ba-before"><img src="before.jpg" alt="보정 전"></div>\n  <div class="blinds">\n    <!-- 띠 8개 × (슬롯 + 800% 내부 이미지) -->\n    <div class="blind" style="left:0%">\n      <div class="blind-inner" style="transform:translateX(0%)">\n        <img src="after.jpg" alt="보정 후">\n      </div>\n    </div>\n    <!-- ... left:12.5% / translateX(-12.5%) ... -->\n  </div>\n  <div class="ba-handle"><div class="ba-grip">⇄</div></div>\n</div>',
    snippetCSS: '.ba { position: relative; aspect-ratio: 16 / 10;\n  overflow: hidden; touch-action: none; cursor: ew-resize; }\n.blinds { position: absolute; inset: 0; }\n.blind { position: absolute; top: 0; bottom: 0; width: 12.5%;\n  overflow: hidden; clip-path: inset(0 0 100% 0); }\n.blind-inner { position: absolute; top: 0; left: 0;\n  width: 800%; height: 100%; }',
    snippetJS: 'function setPos(p){\n  for (var i = 0; i < blinds.length; i++) {\n    var local = (p - i * 0.06) / 0.58;   // 띠 i — stagger 0.06\n    local = Math.max(0, Math.min(1, local));\n    blinds[i].style.clipPath =\n      "inset(0 0 " + ((1 - local) * 100) + "% 0)";\n  }\n}\nfunction update(e){\n  var r = ba.getBoundingClientRect();\n  setPos((e.clientX - r.left) / r.width);\n}\n' + SNIPPET_DRAG_JS,
    explain: '각 띠는 overflow:hidden 슬롯(폭 12.5%)이고, 내부에 폭 800%의 AFTER 아트워크를 translateX(−i × 12.5%)로 정렬해 원본 위치를 그대로 비춘다. 드래그 진행률 p에서 띠 i의 local = clamp01((p − i × 0.06) / 0.58)을 구해 clipPath inset(0 0 (1−local)×100% 0)을 인라인 갱신 — p가 커지는 만큼 띠들이 왼쪽부터 0.06 간격의 시차로 위에서 아래로 열린다. p=1이면 마지막 띠의 local도 정확히 1이 되도록 분모 0.58 = 1 − 0.06×7로 설계.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (Pointer Events)' },
      { label: '트리거', value: '드래그 X → 진행률 p (0~1)' },
      { label: 'stagger', value: '띠 i 시작점 = i × 0.06 (8개)' },
      { label: '보간', value: 'local = clamp01((p − i×0.06) / 0.58)' },
      { label: '클립', value: 'inset(0 0 (1−local)×100% 0) × 8 인라인' },
      { label: '참고', value: '베네치안 블라인드 와이프 / 슬라이드쇼 전환' }
    ],
    guide: '띠 수는 6~10이 적정 — 너무 많으면 이음새가 거슬리고 너무 적으면 블라인드 느낌이 안 산다. stagger는 0.04~0.08 권장. 띠 내부 translateX 정렬이 핵심으로, 어긋나면 이미지가 띠마다 끊겨 보인다. 분할선 비교가 아니라 시네마틱 reveal 연출이므로 정밀 비교가 목적이면 01·04를 선택할 것.',
    recommendations: [
      { place: '히어로 헤더', body: '시네마틱 인트로 reveal — 드래그로 장면을 열어젖히기' },
      { place: '랜딩 페이지', body: 'Before→After 전환 연출 섹션 — 임팩트 있는 공개' },
      { place: '제품 섹션', body: '시즌 컬렉션 교체 연출 — 구/신 라인업 전환' },
      { place: '포트폴리오 소개', body: '작업 전후 쇼릴 전환 — 연출력 어필' }
    ],
    tradeoff: 'AFTER 아트워크를 8벌 복제 — 사진이 무거우면 메모리 비용(여기선 inline SVG라 경미). 띠 경계에서 1px 심(seam)이 보일 수 있음. 분할선이 없어 정확한 위치 비교 불가 — 연출용.'
  },

  // ── 07. scroll-scrub-wipe ──
  {
    id: 'scroll-scrub-wipe', num: '07', title: '스크롤 스크럽 와이프',
    summary: '드래그 대신 스크롤 진행률 0~1을 분할선 위치에 1:1 매핑한 스크럽형. scroll-track 240vh + sticky-stage 표준 모델 — 스크롤을 멈추면 분할선도 그 자리에 멈춘다.',
    demo: {
      scroll: true,
      reset: true,
      bodyHTML: '<div class="ba" id="ba">\n'
        + '  ' + layerHTML('ba-after', 'a') + '\n'
        + '  ' + layerHTML('ba-before', 'b') + '\n'
        + '  <span class="ba-tag tag-before">BEFORE</span>\n'
        + '  <span class="ba-tag tag-after">AFTER</span>\n'
        + '  <div class="ba-handle"><div class="ba-grip">⇄</div></div>\n'
        + '</div>',
      css: '.ba { --pos: 100%; cursor: default; touch-action: auto; }\n'
        + '.ba-before { clip-path: inset(0 calc(100% - var(--pos)) 0 0); -webkit-clip-path: inset(0 calc(100% - var(--pos)) 0 0); }\n'
        + '.ba-handle { left: var(--pos); }',
      js: 'var ba = document.getElementById("ba");\n'
        + 'function applyReveal(p){\n'
        + '  var t = Math.max(0, Math.min(1, (p - 0.06) / 0.88));\n'
        + '  var pos = 1 - t;\n'
        + '  ba.style.setProperty("--pos", (pos * 100).toFixed(2) + "%");\n'
        + '}',
      hint: 'SCROLL ↓',
      height: 560
    },
    snippetHTML: '<div class="scroll-track">\n  <div class="sticky-stage">\n    <div class="ba">\n      <div class="ba-layer ba-after"><img src="after.jpg" alt="보정 후"></div>\n      <div class="ba-layer ba-before"><img src="before.jpg" alt="보정 전"></div>\n      <div class="ba-handle"></div>\n    </div>\n  </div>\n</div>',
    snippetCSS: '.scroll-track { min-height: 240vh; position: relative; }\n.sticky-stage { position: sticky; top: 0; height: 100vh;\n  display: flex; align-items: center; justify-content: center; }\n.ba { --pos: 100%; position: relative; aspect-ratio: 16 / 10;\n  overflow: hidden; }\n.ba-before { clip-path: inset(0 calc(100% - var(--pos)) 0 0); }\n.ba-handle { position: absolute; top: 0; bottom: 0;\n  left: var(--pos); width: 2px; background: #fff; }',
    snippetJS: 'var track = document.querySelector(".scroll-track");\nvar ba = document.querySelector(".ba");\nfunction calc(){\n  var rect = track.getBoundingClientRect();\n  var max = Math.max(1, rect.height - window.innerHeight);\n  return Math.max(0, Math.min(1, -rect.top / max));\n}\nfunction tick(){\n  var p = calc();\n  var t = Math.max(0, Math.min(1, (p - 0.06) / 0.88));\n  ba.style.setProperty("--pos", ((1 - t) * 100) + "%");\n}\nwindow.addEventListener("scroll", tick, { passive: true });\ntick();',
    explain: '카탈로그 표준 scroll-pin 모델을 분할선에 연결한 변형. progress = clamp(0, −rect.top / (rect.height − innerHeight), 1)을 구한 뒤 데드존을 걷어낸 t = clamp01((p − 0.06) / 0.88)로 정제하고, --pos = (1 − t) × 100%로 매핑한다. 스크롤 시작 시 분할선이 오른쪽 끝(BEFORE 전체)에 있다가 스크롤할수록 왼쪽으로 이동해 AFTER가 오른쪽부터 차오른다. 스크롤을 멈추면 그 진행률에서 분할선도 멈춤 — 자동 재생이 전혀 없는 표준 스크럽이다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (scroll 이벤트 + sticky)' },
      { label: '트리거', value: '스크롤 진행률 0~1 (드래그 없음)' },
      { label: '매핑', value: '--pos = (1 − clamp01((p − 0.06) / 0.88)) × 100%' },
      { label: '트랙', value: 'scroll-track 240vh + sticky-stage 100vh' },
      { label: '클립', value: 'inset(0 calc(100% − var(--pos)) 0 0)' },
      { label: '참고', value: '카탈로그 scroll-pin 표준 모델' }
    ],
    guide: '손 조작이 필요 없어 발견성 문제가 없다 — 스토리텔링 흐름 한가운데에 자연스럽게 배치할 수 있는 유일한 변형. 트랙 높이는 240vh 권장, 데드존 6%를 두면 진입 직후 분할선이 덜컥이지 않는다. 사용자가 특정 위치에서 멈춰 비교하고 싶으면 스크롤을 멈추면 되므로 드래그형의 정밀성과 스크럽의 서사성을 겸한다. 임의 위치로 빠르게 점프하는 것은 드래그형이 더 편하다.',
    recommendations: [
      { place: '히어로 헤더', body: '스크롤 시작과 함께 변신하는 오프닝 장면' },
      { place: '랜딩 페이지', body: '스크롤 내러티브 중간의 증명 섹션 — 읽는 흐름 그대로' },
      { place: '제품 섹션', body: '개선 스토리를 스크롤로 전개 — 단계별 설득' },
      { place: '포트폴리오 소개', body: '케이스 스터디 전후 전환 장면 — 몰입형 연출' }
    ],
    tradeoff: '스크롤 공간 240vh를 소비. iframe 안에서는 내부 스크롤로 동작하므로 페이지 스크롤과 중첩 시 하이재킹 느낌 주의. 임의 비교 위치로의 점프는 드래그형보다 불편.'
  },

  // ── 08. click-crossfade ──
  {
    id: 'click-crossfade', num: '08', title: '클릭 크로스페이드',
    summary: '드래그 없이 BEFORE/AFTER 토글 버튼으로 두 레이어를 opacity 크로스페이드하는 가장 단순한 비교형. 분할 비교 대신 전체 화면 상태 전환 — 라벨과 버튼 상태가 함께 스왑된다.',
    demo: {
      bodyHTML: '<main class="stage">\n'
        + '  <div class="ba-wrap">\n'
        + '    <div class="ba" id="ba">\n'
        + '      ' + layerHTML('ba-before', 'b') + '\n'
        + '      <div class="ba-layer ba-fade">' + artworkSVG('a') + '</div>\n'
        + '      <span class="ba-tag tag-state" id="stateTag">BEFORE</span>\n'
        + '    </div>\n'
        + '    <div class="seg" role="group" aria-label="전후 전환">\n'
        + '      <button class="seg-btn is-active" id="btnBefore" type="button">BEFORE</button>\n'
        + '      <button class="seg-btn" id="btnAfter" type="button">AFTER</button>\n'
        + '    </div>\n'
        + '  </div>\n'
        + '</main>',
      css: '.ba { width: min(640px, 86vw, calc((100vh - 200px) * 1.6)); cursor: default; touch-action: auto; }\n'
        + '.ba-wrap { display: flex; flex-direction: column; align-items: center; gap: 16px; }\n'
        + '.ba-fade { opacity: 0; transition: opacity 420ms ease; }\n'
        + '.ba.show-after .ba-fade { opacity: 1; }\n'
        + '.tag-state { left: 14px; transition: color 200ms ease, border-color 200ms ease; }\n'
        + '.seg { display: inline-flex; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.14); border-radius: 999px; padding: 4px; }\n'
        + '.seg-btn { font: 700 11px/1 ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: 0.14em; color: rgba(255,255,255,0.55); background: transparent; border: 0; border-radius: 999px; padding: 10px 22px; cursor: pointer; transition: color 200ms ease, background 200ms ease; }\n'
        + '.seg-btn.is-active { color: #111; background: #fff; }',
      js: 'var ba = document.getElementById("ba");\n'
        + 'var tag = document.getElementById("stateTag");\n'
        + 'var btnBefore = document.getElementById("btnBefore");\n'
        + 'var btnAfter = document.getElementById("btnAfter");\n'
        + 'function setState(after){\n'
        + '  ba.classList.toggle("show-after", after);\n'
        + '  tag.textContent = after ? "AFTER" : "BEFORE";\n'
        + '  tag.style.color = after ? "#ffd166" : "rgba(255,255,255,0.85)";\n'
        + '  tag.style.borderColor = after ? "rgba(255,209,102,0.4)" : "rgba(255,255,255,0.18)";\n'
        + '  btnBefore.classList.toggle("is-active", !after);\n'
        + '  btnAfter.classList.toggle("is-active", after);\n'
        + '}\n'
        + 'btnBefore.addEventListener("click", function(){ setState(false); });\n'
        + 'btnAfter.addEventListener("click", function(){ setState(true); });\n'
        + 'setState(false);',
      hint: '버튼으로 전환해보세요 ⇄',
      height: 480
    },
    snippetHTML: '<div class="ba">\n  <div class="ba-layer ba-before"><img src="before.jpg" alt="보정 전"></div>\n  <div class="ba-layer ba-fade"><img src="after.jpg" alt="보정 후"></div>\n  <span class="ba-tag" id="stateTag">BEFORE</span>\n</div>\n<div class="seg" role="group" aria-label="전후 전환">\n  <button class="seg-btn is-active" id="btnBefore">BEFORE</button>\n  <button class="seg-btn" id="btnAfter">AFTER</button>\n</div>',
    snippetCSS: '.ba { position: relative; aspect-ratio: 16 / 10; overflow: hidden; }\n.ba-fade { opacity: 0; transition: opacity 420ms ease; }\n.ba.show-after .ba-fade { opacity: 1; }\n.seg-btn.is-active { color: #111; background: #fff; }',
    snippetJS: 'function setState(after){\n  ba.classList.toggle("show-after", after);\n  tag.textContent = after ? "AFTER" : "BEFORE";\n  btnBefore.classList.toggle("is-active", !after);\n  btnAfter.classList.toggle("is-active", after);\n}\nbtnBefore.addEventListener("click", function(){ setState(false); });\nbtnAfter.addEventListener("click", function(){ setState(true); });',
    explain: '상태는 .show-after 클래스 하나. 버튼 클릭이 setState(after)를 호출하면 AFTER 레이어의 opacity가 0↔1로 420ms 크로스페이드되고, 상태 태그 텍스트(BEFORE↔AFTER)·태그 색·버튼 active가 한 함수에서 동시에 스왑된다. 클릭 트리거이므로 CSS transition이 보간을 담당하는 것이 정당하다(스크롤 진행률 우회가 아님). button 요소 기반이라 Tab/Enter 키보드 접근이 기본 제공 — 10개 패턴 중 접근성이 가장 좋다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (클래스 토글)' },
      { label: '트리거', value: 'BEFORE / AFTER 버튼 click' },
      { label: '전환', value: 'opacity 크로스페이드 420ms ease' },
      { label: '상태', value: '.show-after 클래스 — 단일 소스' },
      { label: '라벨', value: '태그 텍스트·색·버튼 active 동시 스왑' },
      { label: '참고', value: '쇼핑몰 옵션 토글 / 테마 스위처' }
    ],
    guide: '전환 시간은 300~500ms가 적정 — 너무 짧으면 깜빡임, 너무 길면 둘 다 흐릿한 중간 상태가 길어진다. 분할 비교가 아니라 기억에 의존하는 비교이므로 구도가 동일하고 톤 차이가 큰 장면에서 효과적이다. 미세 차이 비교에는 부적합 — 그때는 01 와이프나 04 렌즈를 선택. 키보드·스크린리더 접근성이 필요한 서비스라면 이 패턴이 기본값으로 안전하다.',
    recommendations: [
      { place: '히어로 헤더', body: '다크/라이트 두 분위기 전환 — 토글 한 번의 임팩트' },
      { place: '랜딩 페이지', body: '요금제 전후 화면 비교 — 무료/프로 UI 토글' },
      { place: '제품 섹션', body: '옵션(색상·마감) 전환 미리보기 — 커머스 친화' },
      { place: '포트폴리오 소개', body: '시안 A/B 토글 — 클라이언트 리뷰 페이지' }
    ],
    tradeoff: '두 상태를 동시에 볼 수 없어 비교가 사용자 기억에 의존. 구현이 가장 단순하고 키보드 접근성 최고. 미세 디테일 비교에는 부적합.'
  },

  // ── 09. label-gauge ──
  {
    id: 'label-gauge', num: '09', title: '라벨 게이지',
    summary: '가로 와이프에 정량 피드백을 더한 변형. 핸들 위 % 배지가 분할 위치를 실시간 수치로 보여주고, 양끝 BEFORE/AFTER 라벨은 각자의 노출 면적에 비례해 페이드된다.',
    demo: {
      bodyHTML: '<main class="stage">\n'
        + '  <div class="ba" id="ba">\n'
        + '    ' + layerHTML('ba-after', 'a') + '\n'
        + '    ' + layerHTML('ba-before', 'b') + '\n'
        + '    <span class="ba-tag tag-before" id="tagBefore">BEFORE</span>\n'
        + '    <span class="ba-tag tag-after" id="tagAfter">AFTER</span>\n'
        + '    <div class="ba-handle"><span class="gauge-badge" id="badge">50%</span><div class="ba-grip">⇄</div></div>\n'
        + '  </div>\n'
        + '</main>',
      css: '.ba { --pos: 50%; cursor: ew-resize; }\n'
        + '.ba-before { clip-path: inset(0 calc(100% - var(--pos)) 0 0); -webkit-clip-path: inset(0 calc(100% - var(--pos)) 0 0); }\n'
        + '.ba-handle { left: var(--pos); }\n'
        + '.gauge-badge { position: absolute; top: 12px; left: 50%; transform: translateX(-50%); font: 700 11px/1 ui-monospace, SFMono-Regular, Menlo, monospace; background: #fff; color: #111; border-radius: 999px; padding: 6px 11px; white-space: nowrap; box-shadow: 0 4px 14px rgba(0,0,0,0.4); }',
      js: 'var ba = document.getElementById("ba");\n'
        + 'var badge = document.getElementById("badge");\n'
        + 'var tagB = document.getElementById("tagBefore");\n'
        + 'var tagA = document.getElementById("tagAfter");\n'
        + 'function setPos(p){\n'
        + '  p = Math.max(0, Math.min(1, p));\n'
        + '  ba.style.setProperty("--pos", (p * 100).toFixed(2) + "%");\n'
        + '  badge.textContent = Math.round(p * 100) + "%";\n'
        + '  tagB.style.opacity = (0.25 + 0.75 * p).toFixed(3);\n'
        + '  tagA.style.opacity = (0.25 + 0.75 * (1 - p)).toFixed(3);\n'
        + '}\n'
        + 'function update(e){\n'
        + '  var r = ba.getBoundingClientRect();\n'
        + '  setPos((e.clientX - r.left) / r.width);\n'
        + '}\n'
        + DRAG_JS + '\n'
        + 'setPos(0.5);',
      hint: '핸들을 드래그해보세요 ⇄',
      height: 480
    },
    snippetHTML: '<div class="ba">\n  <div class="ba-layer ba-after"><img src="after.jpg" alt="보정 후"></div>\n  <div class="ba-layer ba-before"><img src="before.jpg" alt="보정 전"></div>\n  <span class="ba-tag tag-before" id="tagBefore">BEFORE</span>\n  <span class="ba-tag tag-after" id="tagAfter">AFTER</span>\n  <div class="ba-handle">\n    <span class="gauge-badge" id="badge">50%</span>\n    <div class="ba-grip">⇄</div>\n  </div>\n</div>',
    snippetCSS: '.ba { --pos: 50%; position: relative; aspect-ratio: 16 / 10;\n  overflow: hidden; touch-action: none; cursor: ew-resize; }\n.ba-before { clip-path: inset(0 calc(100% - var(--pos)) 0 0); }\n.ba-handle { position: absolute; top: 0; bottom: 0;\n  left: var(--pos); width: 2px; background: #fff;\n  pointer-events: none; }\n.gauge-badge { position: absolute; top: 12px; left: 50%;\n  transform: translateX(-50%); background: #fff; color: #111;\n  border-radius: 999px; padding: 6px 11px; }',
    snippetJS: 'function setPos(p){\n  p = Math.max(0, Math.min(1, p));\n  ba.style.setProperty("--pos", (p * 100) + "%");\n  badge.textContent = Math.round(p * 100) + "%";\n  tagBefore.style.opacity = 0.25 + 0.75 * p;          // BEFORE 노출 면적\n  tagAfter.style.opacity = 0.25 + 0.75 * (1 - p);     // AFTER 노출 면적\n}\nfunction update(e){\n  var r = ba.getBoundingClientRect();\n  setPos((e.clientX - r.left) / r.width);\n}\n' + SNIPPET_DRAG_JS,
    explain: '01 가로 와이프의 setPos() 안에 피드백 갱신 3가지를 추가한 변형. 배지는 textContent = round(p × 100) + "%"로 분할 위치를 수치화하고, BEFORE 라벨 opacity = 0.25 + 0.75 × p(노출 면적 비례), AFTER 라벨은 그 역수로 페이드된다. 클립·핸들·배지·라벨이 모두 하나의 setPos()에서 갱신되므로 상태 불일치가 구조적으로 발생하지 않는다. 최소 opacity 0.25를 남겨 어느 쪽 라벨도 완전히 사라지지 않게 했다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (Pointer Events)' },
      { label: '트리거', value: 'pointerdown → pointermove 드래그 (X좌표)' },
      { label: '배지', value: 'textContent = round(p × 100) + "%"' },
      { label: '라벨', value: 'opacity = 0.25 + 0.75 × 노출 면적 비율' },
      { label: '클립', value: 'inset(0 calc(100% − var(--pos)) 0 0)' },
      { label: '참고', value: '시공·시술 비교 위젯 / 게이지 UI' }
    ],
    guide: '수치는 신뢰 장치다 — 광고성 연출보다 "직접 확인해 보라"는 맥락에서 강하다. 라벨 최소 opacity를 0.2~0.3으로 유지해야 현재 어느 쪽을 보고 있는지 양쪽 모두 인지된다. 배지는 핸들에 부착해 시선 이동을 없앨 것. 단 %는 분할 면적 비율일 뿐 개선 정도가 아니므로, 수치의 의미를 오해시키지 않는 카피(예: 드래그하여 비교)를 곁들이는 편이 안전하다.',
    recommendations: [
      { place: '히어로 헤더', body: '수치로 증명하는 서비스 인트로 — 게이지가 신뢰 장치' },
      { place: '랜딩 페이지', body: '절감률·개선율 섹션 — 분할 게이지와 수치 결합' },
      { place: '제품 섹션', body: '보정 강도 모드 비교 — %로 강도 차이 전달' },
      { place: '포트폴리오 소개', body: '인터랙티브 케이스 지표 — 데이터 감성 케이스 카드' }
    ],
    tradeoff: '%는 분할 면적 비율일 뿐 개선 정도가 아님 — 수치 의미를 오해시키지 않을 카피 필요. 배지·라벨·클립 3요소는 반드시 단일 setPos()에서 갱신해야 동기화가 깨지지 않음.'
  },

  // ── 10. auto-sweep ──
  {
    id: 'auto-sweep', num: '10', title: '오토 스윕',
    summary: '로드 직후 분할선이 스스로 한 번 왕복 스윕(50→92→8→50%)하며 드래그 가능함을 시연한 뒤 손을 떼고 기다린다. 발견성 문제를 1회 데모로 해소 — 이후는 완전한 드래그 제어.',
    demo: {
      reset: true,
      bodyHTML: '<main class="stage">\n'
        + '  <div class="ba" id="ba">\n'
        + '    ' + layerHTML('ba-after', 'a') + '\n'
        + '    ' + layerHTML('ba-before', 'b') + '\n'
        + '    <span class="ba-tag tag-before">BEFORE</span>\n'
        + '    <span class="ba-tag tag-after">AFTER</span>\n'
        + '    <div class="ba-handle"><div class="ba-grip">⇄</div></div>\n'
        + '  </div>\n'
        + '</main>',
      css: '.ba { --pos: 50%; cursor: ew-resize; }\n'
        + '.ba-before { clip-path: inset(0 calc(100% - var(--pos)) 0 0); -webkit-clip-path: inset(0 calc(100% - var(--pos)) 0 0); }\n'
        + '.ba-handle { left: var(--pos); }',
      js: 'var ba = document.getElementById("ba");\n'
        + 'function setPos(p){\n'
        + '  p = Math.max(0, Math.min(1, p));\n'
        + '  ba.style.setProperty("--pos", (p * 100).toFixed(2) + "%");\n'
        + '}\n'
        + 'function update(e){\n'
        + '  var r = ba.getBoundingClientRect();\n'
        + '  setPos((e.clientX - r.left) / r.width);\n'
        + '}\n'
        + 'var KEYS = [0.5, 0.92, 0.08, 0.5];\n'
        + 'var DUR = [700, 1200, 700];\n'
        + 'var sweeping = false;\n'
        + 'var raf = null;\n'
        + 'function easeInOutCubic(t){\n'
        + '  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;\n'
        + '}\n'
        + 'function startSweep(){\n'
        + '  if (raf) cancelAnimationFrame(raf);\n'
        + '  sweeping = true;\n'
        + '  var t0 = performance.now();\n'
        + '  function step(now){\n'
        + '    if (!sweeping) return;\n'
        + '    var t = now - t0;\n'
        + '    var acc = 0;\n'
        + '    var i = 0;\n'
        + '    while (i < DUR.length && t > acc + DUR[i]) { acc += DUR[i]; i++; }\n'
        + '    if (i >= DUR.length) {\n'
        + '      setPos(KEYS[KEYS.length - 1]);\n'
        + '      sweeping = false;\n'
        + '      return;\n'
        + '    }\n'
        + '    var local = (t - acc) / DUR[i];\n'
        + '    setPos(KEYS[i] + (KEYS[i + 1] - KEYS[i]) * easeInOutCubic(local));\n'
        + '    raf = requestAnimationFrame(step);\n'
        + '  }\n'
        + '  raf = requestAnimationFrame(step);\n'
        + '}\n'
        + 'var dragging = false;\n'
        + 'ba.addEventListener("pointerdown", function(e){\n'
        + '  sweeping = false;\n'
        + '  if (raf) cancelAnimationFrame(raf);\n'
        + '  dragging = true;\n'
        + '  try { ba.setPointerCapture(e.pointerId); } catch (err) {}\n'
        + '  update(e);\n'
        + '  e.preventDefault();\n'
        + '});\n'
        + 'ba.addEventListener("pointermove", function(e){ if (dragging) update(e); });\n'
        + 'ba.addEventListener("pointerup", function(e){\n'
        + '  dragging = false;\n'
        + '  try { ba.releasePointerCapture(e.pointerId); } catch (err) {}\n'
        + '});\n'
        + 'ba.addEventListener("pointercancel", function(){ dragging = false; });\n'
        + 'window.__reset = startSweep;\n'
        + 'setPos(0.5);\n'
        + 'startSweep();',
      hint: '스윕이 끝나면 직접 드래그해보세요 ⇄',
      height: 480
    },
    snippetHTML: '<div class="ba">\n  <div class="ba-layer ba-after"><img src="after.jpg" alt="보정 후"></div>\n  <div class="ba-layer ba-before"><img src="before.jpg" alt="보정 전"></div>\n  <div class="ba-handle"><div class="ba-grip">⇄</div></div>\n</div>',
    snippetCSS: '.ba { --pos: 50%; position: relative; aspect-ratio: 16 / 10;\n  overflow: hidden; touch-action: none; cursor: ew-resize; }\n.ba-before { clip-path: inset(0 calc(100% - var(--pos)) 0 0); }\n.ba-handle { position: absolute; top: 0; bottom: 0;\n  left: var(--pos); width: 2px; background: #fff;\n  pointer-events: none; }',
    snippetJS: 'var KEYS = [0.5, 0.92, 0.08, 0.5];   // 왕복 스윕 키프레임\nvar DUR = [700, 1200, 700];          // 구간별 ms\nfunction startSweep(){\n  sweeping = true;\n  var t0 = performance.now();\n  function step(now){\n    if (!sweeping) return;            // 드래그 시작 시 즉시 양보\n    var t = now - t0, acc = 0, i = 0;\n    while (i < DUR.length && t > acc + DUR[i]) { acc += DUR[i]; i++; }\n    if (i >= DUR.length) { setPos(0.5); sweeping = false; return; }\n    var local = (t - acc) / DUR[i];\n    setPos(KEYS[i] + (KEYS[i + 1] - KEYS[i]) * easeInOutCubic(local));\n    requestAnimationFrame(step);\n  }\n  requestAnimationFrame(step);\n}\nba.addEventListener("pointerdown", function(){ sweeping = false; });\nstartSweep();',
    explain: 'rAF + performance.now() 타임라인으로 2.6초 동안 3구간(50→92%, 92→8%, 8→50%)을 easeInOutCubic으로 보간하는 1회성 스윕. 각 구간의 경과 시간을 누적 duration과 비교해 현재 구간 i와 local 진행률을 구하고 KEYS[i]→KEYS[i+1]을 보간한다. 진행 중 pointerdown이 들어오면 sweeping 플래그를 끄고 즉시 드래그에 제어권을 양보 — 이후는 01과 동일한 드래그 와이프다. ↻ 다시 보기 버튼이 startSweep()을 재호출한다. 콘텐츠 자동 재생이 아니라 조작법을 알려주는 1회성 어포던스 데모라는 점이 설계 의도.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (rAF 타임라인 + Pointer Events)' },
      { label: '트리거', value: '로드 시 1회 왕복 스윕 → 이후 드래그' },
      { label: '타임라인', value: '50→92→8→50%, 2.6s, easeInOutCubic' },
      { label: '인터럽트', value: 'pointerdown → 스윕 즉시 중단·드래그 전환' },
      { label: '리플레이', value: '↻ 다시 보기 → startSweep() 재호출' },
      { label: '참고', value: '온보딩 어포던스 힌트 / JuxtaposeJS 데모' }
    ],
    guide: '스윕은 페이지당 1회만 — 반복 루프는 주의를 분산시키고 자동 재생 금지 원칙과도 충돌한다. 길이는 2~3초가 적정이고 사용자 입력에 즉시 양보하는 인터럽트가 필수다. viewport 진입 시점에 시작하고 싶으면 IntersectionObserver와 결합하되 단 1회만 발동시킬 것. prefers-reduced-motion 사용자에게는 스윕을 생략하고 정지 상태(50%)로 시작하는 분기를 권장.',
    recommendations: [
      { place: '히어로 헤더', body: '첫 방문자에게 조작법을 스스로 시연하는 인트로' },
      { place: '랜딩 페이지', body: '섹션 도착 시 1회 스윕으로 시선 포획 후 드래그 유도' },
      { place: '제품 섹션', body: '무인 키오스크·전시 데모 모드 — 손대기 전 미리보기' },
      { place: '포트폴리오 소개', body: '갤러리 첫 카드만 스윕으로 안내 — 나머지는 학습된 드래그' }
    ],
    tradeoff: '1회라도 자동 모션이므로 prefers-reduced-motion 사용자에겐 생략 분기 필요. 반복 루프 금지 — 1회 원칙. 스윕 중 rAF 점유는 합성 단계라 경미.'
  }
];

/* ================================================================
   Standalone demo HTML 빌더
   ================================================================ */

const CHROME_CSS = ''
  + '* { box-sizing: border-box; }\n'
  + 'html, body { margin: 0; padding: 0; }\n'
  + 'body { background: #000; color: #fff; font-family: "Pretendard Variable", "Pretendard", -apple-system, system-ui, sans-serif; -webkit-font-smoothing: antialiased; }\n'
  + '.demo-controls { position: fixed; top: 16px; left: 16px; display: inline-flex; align-items: center; gap: 10px; z-index: 20; }\n'
  + '.demo-reset { font: 600 11px/1 ui-monospace, SFMono-Regular, Menlo, monospace; color: rgba(255,255,255,0.72); background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.16); border-radius: 999px; padding: 8px 14px; cursor: pointer; transition: color 160ms, background 160ms, border-color 160ms; }\n'
  + '.demo-reset:hover { color: #fff; background: rgba(255,255,255,0.14); border-color: rgba(255,255,255,0.32); }\n'
  + '.demo-label { font: 500 10px/1 ui-monospace, SFMono-Regular, Menlo, monospace; color: rgba(255,255,255,0.35); letter-spacing: 0.14em; text-transform: uppercase; }\n'
  + '.demo-hint { position: fixed; right: 16px; bottom: 24px; font: 500 11px/1.4 "Pretendard Variable", "Pretendard", sans-serif; color: rgba(255,255,255,0.5); letter-spacing: 0.04em; z-index: 20; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 999px; padding: 8px 14px; animation: hint-pulse 2.4s ease-in-out infinite; pointer-events: none; }\n'
  + '@keyframes hint-pulse { 0%, 100% { opacity: 0.55; } 50% { opacity: 1; } }\n';

const SCROLL_CSS = ''
  + 'html { scroll-behavior: smooth; }\n'
  + 'body { overflow-x: hidden; }\n'
  + '.demo-progress { position: fixed; bottom: 0; left: 0; right: 0; height: 2px; background: rgba(255,255,255,0.06); z-index: 20; }\n'
  + '.demo-progress > div { height: 100%; background: #fff; width: 0; transition: width 60ms linear; }\n'
  + '.scroll-track { min-height: 240vh; position: relative; }\n'
  + '.sticky-stage { position: sticky; top: 0; height: 100vh; display: flex; align-items: center; justify-content: center; padding: 64px 4vw 48px; overflow: hidden; }\n';

function buildDemoHTML(p) {
  var isScroll = !!p.demo.scroll;
  var css = CHROME_CSS
    + (isScroll ? SCROLL_CSS : 'body { overflow: hidden; }\n')
    + BA_CSS
    + p.demo.css + '\n';

  var controls = '  <div class="demo-controls">\n'
    + (p.demo.reset ? '    <button class="demo-reset" type="button" onclick="window.__reset && window.__reset()">↻ 다시 보기</button>\n' : '')
    + '    <span class="demo-label">' + p.num + ' · ' + p.title + '</span>\n'
    + '  </div>\n';

  var body;
  var script;
  if (isScroll) {
    body = controls
      + '  <div class="demo-hint">' + p.demo.hint + '</div>\n'
      + '  <div class="demo-progress"><div></div></div>\n'
      + '\n'
      + '  <div class="scroll-track">\n'
      + '    <div class="sticky-stage">\n'
      + '      ' + p.demo.bodyHTML.replace(/\n/g, '\n      ') + '\n'
      + '    </div>\n'
      + '  </div>\n';
    script = '  <script>\n'
      + '    (function(){\n'
      + '      var track = document.querySelector(".scroll-track");\n'
      + '      var progressFill = document.querySelector(".demo-progress > div");\n'
      + '      function calc(){\n'
      + '        var rect = track.getBoundingClientRect();\n'
      + '        var max = Math.max(1, rect.height - window.innerHeight);\n'
      + '        return Math.max(0, Math.min(1, -rect.top / max));\n'
      + '      }\n'
      + '\n'
      + '      ' + p.demo.js.replace(/\n/g, '\n      ') + '\n'
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
      + '  </script>\n';
  } else {
    body = controls
      + '  <div class="demo-hint">' + p.demo.hint + '</div>\n'
      + '\n'
      + '  ' + p.demo.bodyHTML.replace(/\n/g, '\n  ') + '\n';
    script = '  <script>\n'
      + '    (function(){\n'
      + '      ' + p.demo.js.replace(/\n/g, '\n      ') + '\n'
      + '    })();\n'
      + '  </script>\n';
  }

  return '<!DOCTYPE html>\n'
    + '<html lang="ko">\n'
    + '<head>\n'
    + '  <meta charset="UTF-8">\n'
    + '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
    + '  <title>' + p.num + '. ' + p.title + ' — Before/After Slider Demo</title>\n'
    + '  <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable-dynamic-subset.min.css" rel="stylesheet">\n'
    + '  <style>\n'
    + '    ' + css.trimEnd().replace(/\n/g, '\n    ') + '\n'
    + '  </style>\n'
    + '</head>\n'
    + '<body>\n'
    + body
    + '\n'
    + script
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
        embed: 'demos/before-after-slider/' + p.id + '.html',
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
      { type: 'heading', value: '비포-애프터 슬라이더 — 드래그 분할 비교 10종 패턴' },
      { type: 'text', value: CATEGORY.summary },
      { type: 'heading', value: '10 패턴 인덱스' },
      { type: 'structure', items: indexItems },
      { type: 'heading', value: '공통 디자인 토큰' },
      {
        type: 'kv', columns: 2, items: [
          { label: '폰트', value: 'Pretendard Variable (라벨·배지는 ui-monospace 보조)' },
          { label: '프레임', value: 'min(720px, 90vw) · aspect-ratio 16:10 · radius 16px' },
          { label: '아트워크', value: '동일 inline SVG 선셋 풍경 — 외부 이미지 0' },
          { label: 'BEFORE 톤', value: 'grayscale(1) sepia(0.38) brightness(0.74) contrast(0.88)' },
          { label: '라벨', value: 'BEFORE·AFTER pill 태그 + 40px ⇄ 원형 그립' },
          { label: '입력', value: 'Pointer Events + setPointerCapture (마우스·터치 통합)' },
          { label: '상태', value: 'CSS 변수 --pos 단일 소스 — 클립·핸들·라벨 동기화' },
          { label: '배경', value: '#000 다크 + 카드 그림자 (Framer 마켓플레이스 톤)' }
        ]
      },
      { type: 'heading', value: '읽기 가이드' },
      {
        type: 'structure', items: [
          { label: '라이브 데모', tag: 'IFRAME', desc: 'demos/before-after-slider/{pattern}.html — 드래그 분할 비교' },
          { label: '작동 원리', tag: 'HOW', desc: 'Pointer Events → --pos / clip-path 인라인 매핑' },
          { label: '정량 메타', tag: 'KV', desc: '의존성 / 트리거 / 핵심 수식 / 클립 / 참고' },
          { label: '코드 스니펫', tag: 'CODE', desc: 'HTML / CSS / JS — 패턴별 핵심 코드' },
          { label: '사용 가이드', tag: 'GUIDE', desc: '파라미터·터치 처리·접근성 주의점' },
          { label: '활용 추천', tag: 'PLACES', desc: '히어로 / 랜딩 / 제품 / 포트폴리오 4건' },
          { label: '트레이드오프', tag: 'NOTE', desc: '성능·접근성·권장 사용처' }
        ]
      },
      {
        type: 'note',
        value: 'Knight Lab JuxtaposeJS의 드래그 분할 모델을 시그니처(01)로 재현하고, 세로·호버·렌즈·사선·블라인드·스크롤·크로스페이드·게이지·오토 스윕 9가지 변형을 비교 카탈로그로 정리. 카탈로그 최초의 드래그 트리거 카테고리 — 모든 데모는 외부 이미지 없이 동일 inline SVG 아트워크의 필터 변형(BEFORE 흑백 낡은 톤 ↔ AFTER 선명 컬러)으로 구성. 07 스크롤 스크럽만 scroll-track 240vh + sticky 표준 모델.'
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
    console.log('✓ demos/before-after-slider/' + p.id + '.html');
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
  console.log('✓ analyses/before-after-slider/analysis.json');
  console.log('  ' + PATTERNS.length + ' patterns + 1 overview = ' + (PATTERNS.length + 1) + ' sections');
  var totalBlocks = Object.values(sections).reduce(function (acc, s) { return acc + s.blocks.length; }, 0);
  console.log('  ' + totalBlocks + ' blocks total');
}

main();
