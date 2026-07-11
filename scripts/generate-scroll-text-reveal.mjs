#!/usr/bin/env node
/**
 * Web Reference Lab — Category Generator: 스크롤 텍스트 로드 (v3)
 *
 * v3 변경점:
 * - 자동 재생 → scroll-pin + 진행률(0~1) 매핑 (Framer 마켓플레이스 시그니처)
 * - 모든 데모 페이지: 240vh scroll track + position:sticky stage + scroll 이벤트
 * - 각 패턴은 applyReveal(progress) 함수만 정의 — 진행률에 따른 상태 보간
 * - ▶ 다시 재생 → ↻ 다시 보기 (scrollTo top)
 * - 하단 progress bar + 우측 하단 SCROLL ↓ hint
 *
 * Usage: node scripts/generate-scroll-text-reveal.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ANALYSIS_DIR = join(ROOT, 'analyses', 'scroll-text-reveal');
const ANALYSIS_FILE = join(ANALYSIS_DIR, 'analysis.json');
const DEMO_DIR = join(ROOT, 'demos', 'scroll-text-reveal');

const CATEGORY = {
  id: 'scroll-text-reveal',
  title: '스크롤 텍스트 로드',
  type: 'category',
  date: '2026-05-27',
  url: 'https://www.framer.com/marketplace/components/text-reveal/',
  summary: '스크롤 진행률에 1:1 매핑되어 텍스트가 순차적으로 드러나는 인터랙션 컬렉션. Framer 마켓플레이스의 "Text Reveal" 컴포넌트(Scroll-driven text reveal animation) 시그니처 패턴 — sticky로 텍스트를 viewport에 고정한 뒤 스크롤 진행률(0~1)을 단어/줄/글자 상태에 매핑. 사용자가 스크롤을 멈추면 reveal도 멈춘다. 본 카탈로그는 단일 색상 변화 외에도 페이드·슬라이드·블러·마스크·variable font morph 등 10가지 매핑 패턴을 정리.'
};

const LONG_BODY = '강력하고 확장된 가능성을 제공합니다. 디자인과 로직을 한 곳에서 결합하여, 동적인 동작과 애니메이션, 상태 기반 인터랙션을 매번 처음부터 만들지 않아도 됩니다. 일관되고 확장 가능한 인터페이스를 더 쉽게 구축하게 해 주고, 표준 요소만으로는 닿을 수 없는 훨씬 더 창의적이고 기능적인 가능성을 열어줍니다.';

const LONG_LINES = [
  '강력하고 확장된 가능성을 제공합니다.',
  '디자인과 로직을 한 곳에서 결합하여,',
  '동적인 동작과 애니메이션,',
  '상태 기반 인터랙션을 매번 처음부터 만들지 않아도 됩니다.'
];

// ============ 10 패턴 정의 ============
//
// 각 패턴은 standalone 페이지로 작성 (demos/scroll-text-reveal/{id}.html).
// 공통 보일러플레이트 (sticky track + scroll handler)는 buildDemoHTML이 wrap.
// 각 패턴은:
//   - demo.css       — 패턴별 CSS
//   - demo.bodyHTML  — .sticky-stage 안에 들어갈 마크업
//   - demo.script    — applyReveal(p) 함수 정의 + 필요한 init 변수
//   - demo.height    — iframe 임베드 높이

const PATTERNS = [
  // ───────────────────────────── 1. word-fade
  {
    id: 'word-fade',
    num: '01',
    title: '단어별 페이드 인',
    summary: '스크롤 진행률에 매핑되어 단어가 한 개씩 순차적으로 fade-up. 각 단어는 자기 구간 동안 opacity 0→1 + translateY 12px→0으로 보간된다.',
    demo: {
      bodyHTML: '<p class="reveal" data-orig="' + LONG_BODY + '">' + LONG_BODY + '</p>',
      css: '.reveal { font: 700 38px/1.5 "Pretendard Variable","Pretendard",system-ui; color: #fff; max-width: 900px; margin: 0; text-align: left; letter-spacing: -0.01em; }\n.reveal .w { display: inline-block; }',
      script: 'var el = document.querySelector(".reveal");\nvar orig = el.dataset.orig || el.textContent;\nvar words = orig.split(" ");\nel.innerHTML = words.map(function(w){ return "<span class=\\"w\\">" + w + "</span>"; }).join(" ");\nvar spans = el.querySelectorAll(".w");\nvar N = spans.length;\nfunction applyReveal(p){\n  spans.forEach(function(s, i){\n    var startP = i / (N + 2);\n    var localP = Math.max(0, Math.min(1, (p - startP) / 0.16));\n    s.style.opacity = localP;\n    s.style.transform = "translateY(" + (12 * (1 - localP)) + "px)";\n  });\n}',
      height: 520
    },
    snippetHTML: '<div class="scroll-track">\n  <div class="sticky-stage">\n    <p class="reveal">Design is not just what it looks like.</p>\n  </div>\n</div>',
    snippetCSS: '.scroll-track { min-height: 240vh; }\n.sticky-stage { position: sticky; top: 0; height: 100vh; display: flex; align-items: center; justify-content: center; }\n.reveal .w { display: inline-block; }',
    snippetJS: 'var el = document.querySelector(".reveal");\nvar words = el.textContent.split(" ");\nel.innerHTML = words.map(function(w){ return "<span class=\\"w\\">" + w + "</span>"; }).join(" ");\nvar spans = el.querySelectorAll(".w");\nvar track = document.querySelector(".scroll-track");\nwindow.addEventListener("scroll", function(){\n  var rect = track.getBoundingClientRect();\n  var p = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));\n  spans.forEach(function(s, i){\n    var startP = i / (spans.length + 2);\n    var localP = Math.max(0, Math.min(1, (p - startP) / 0.16));\n    s.style.opacity = localP;\n    s.style.transform = "translateY(" + (12 * (1 - localP)) + "px)";\n  });\n}, { passive: true });',
    explain: '텍스트를 공백 기준으로 split해 각 단어를 <span class="w">로 감싼다. 스크롤 진행률(0~1)에서 각 단어 i의 시작점 startP = i / (N+2), 끝점 = startP + 0.16. 각 단어는 자기 구간에서 opacity 0→1 + translateY 12px→0으로 보간된다. 사용자가 스크롤을 멈추면 reveal도 멈춘다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (라이브러리 0)' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '매핑', value: '단어 i: [i/(N+2), +0.16] 구간에서 opacity·translateY' },
      { label: 'Track 높이', value: '240vh (스크롤 공간)' },
      { label: '권장 글자 수', value: '15~50 단어 (한 단락)' },
      { label: 'iframe 높이', value: '520px' }
    ],
    guide: 'sticky pin 진행률 매핑이 핵심. track height 200~250vh가 자연스럽다. 단어 매핑 폭(현재 0.16)이 좁을수록 단어가 또렷하게 한 개씩 등장, 넓을수록(0.3+) 여러 단어가 동시에 변화. 마지막 단어가 progress 1 도달 전에 끝나도록 startP 분모에 +2 여유. prefers-reduced-motion 시 모든 단어 opacity 1로 고정.',
    recommendations: [
      { place: '히어로 헤더', body: '메인 슬로건 아래 서브 본문 단락. Hero 진입 후 첫 스크롤에 단어별로 풀려나며 시선을 끌어내림' },
      { place: '랜딩 페이지', body: '회사 미션 선언 단락. 한 단락이 한 화면을 채우면서 스크롤로 시선 유도' },
      { place: '제품 섹션', body: '제품 가치 본문(3-5줄). 사용자가 스크롤 속도로 직접 reveal 속도 제어' },
      { place: '포트폴리오 소개', body: 'About 페이지의 자기소개 본문. 클라이언트와 함께 스크롤로 읽어 내려가는 컨텍스트' }
    ],
    tradeoff: '스크롤 공간(track 240vh)이 페이지 전체 높이를 늘림. 모바일에서 너무 길게 느껴질 수 있어 160~200vh로 조정 권장. prefers-reduced-motion에서는 sticky 비활성 + 모두 즉시 표시.'
  },

  // ───────────────────────────── 2. line-slide
  {
    id: 'line-slide',
    num: '02',
    title: '줄별 슬라이드 업',
    summary: '한 줄 단위로 아래에서 위로 슬라이드 + 페이드. 줄마다 overflow:hidden 마스크 + 내부 span을 progress에 따라 translateY 115% → 0으로 보간.',
    demo: {
      bodyHTML: '<div class="reveal">' + LONG_LINES.map(function (l) { return '<div class="ln"><span>' + l + '</span></div>'; }).join('') + '</div>',
      css: '.reveal { font: 600 34px/1.5 "Pretendard Variable","Pretendard",system-ui; color: #fff; max-width: 900px; letter-spacing: -0.01em; }\n.reveal .ln { overflow: hidden; padding: 4px 0; }\n.reveal .ln > span { display: inline-block; transform: translateY(115%); }',
      script: 'var lns = document.querySelectorAll(".reveal .ln");\nvar N = lns.length;\nfunction applyReveal(p){\n  lns.forEach(function(ln, i){\n    var startP = i / (N + 1.2);\n    var localP = Math.max(0, Math.min(1, (p - startP) / 0.28));\n    var ease = 1 - Math.pow(1 - localP, 3);\n    ln.querySelector("span").style.transform = "translateY(" + (115 * (1 - ease)) + "%)";\n  });\n}',
      height: 520
    },
    snippetHTML: '<div class="reveal">\n  <div class="ln"><span>우리는 단순함을 추구합니다.</span></div>\n  <div class="ln"><span>단순함은 곧 진정성입니다.</span></div>\n</div>',
    snippetCSS: '.reveal .ln { overflow: hidden; padding: 4px 0; }\n.reveal .ln > span { display: inline-block; transform: translateY(115%); }',
    snippetJS: 'var lns = document.querySelectorAll(".reveal .ln");\nvar track = document.querySelector(".scroll-track");\nwindow.addEventListener("scroll", function(){\n  var rect = track.getBoundingClientRect();\n  var p = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));\n  lns.forEach(function(ln, i){\n    var startP = i / (lns.length + 1);\n    var localP = Math.max(0, Math.min(1, (p - startP) / 0.28));\n    var ease = 1 - Math.pow(1 - localP, 3);\n    ln.querySelector("span").style.transform = "translateY(" + (115 * (1 - ease)) + "%)";\n  });\n}, { passive: true });',
    explain: '줄 자체에 overflow:hidden 마스크를 걸고, 줄 내부 <span>을 translateY(115%)에서 시작. 스크롤 진행률에서 각 줄 i의 구간은 startP = i / (N+1.2), width 0.28. 각 줄의 localP에 ease-out-cubic(1 - (1-x)³)을 적용해 부드럽게 솟아오른다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '이징', value: 'ease-out-cubic (자체 보간)' },
      { label: '줄 매핑', value: '각 줄 구간 width 0.28 (겹침 허용)' },
      { label: '한 줄 변위', value: 'translateY 115% → 0' },
      { label: '권장 줄 수', value: '3~5줄 (헤드라인 카피)' }
    ],
    guide: '한 줄이 한 호흡이 되는 시네마틱 카피에 적합. overflow:hidden 마스크 때문에 자동 줄바꿈된 줄에서는 효과가 깨지므로 줄을 명시적으로 끊거나 white-space:nowrap. 매핑 구간(0.28)이 줄 간 stagger보다 넓어 줄들이 겹쳐서 풀려나는 시네마틱 효과 — 단순 chain보다 자연스럽다.',
    recommendations: [
      { place: '히어로 헤더', body: '브랜드 슬로건 3-4줄을 한 줄씩 시네마틱하게 등장 — Stripe·Vercel 메인 히어로의 클래식 패턴' },
      { place: '랜딩 페이지', body: '회사 미션 선언 섹션 "우리는 ~ / ~ / ~합니다" 형태의 3줄 카피' },
      { place: '제품 섹션', body: '제품의 핵심 가치 3-5줄 선언. 줄마다 한 가치씩 풀려나오며 흐름 형성' },
      { place: '포트폴리오 소개', body: 'About / Vision / Approach 같은 도입부 큰 카피. 첫 페이지의 도장 같은 인상' }
    ],
    tradeoff: '줄 안의 텍스트가 한 줄을 넘어가면 마스크가 깨진다. 줄당 글자 수를 통제하거나 white-space:nowrap. 모바일에서 줄바꿈 검수 필수.'
  },

  // ───────────────────────────── 3. char-stagger
  {
    id: 'char-stagger',
    num: '03',
    title: '글자별 stagger',
    summary: '한 글자씩 progress에 매핑. 각 글자는 자기 구간에서 opacity 0→1 + translateY 24→0. 5~12자 워드마크에 적합.',
    demo: {
      bodyHTML: '<h1 class="reveal" data-orig="TYPOGRAPHY">TYPOGRAPHY</h1>',
      css: '.reveal { font: 800 12vw/1 "Pretendard Variable","Pretendard",system-ui; color: #fff; letter-spacing: 0.02em; margin: 0; }\n.reveal .c { display: inline-block; }',
      script: 'var el = document.querySelector(".reveal");\nvar orig = el.dataset.orig || el.textContent;\nel.innerHTML = orig.split("").map(function(c){ return "<span class=\\"c\\">" + (c === " " ? "&nbsp;" : c) + "</span>"; }).join("");\nvar chars = el.querySelectorAll(".c");\nvar N = chars.length;\nfunction applyReveal(p){\n  chars.forEach(function(c, i){\n    var startP = i / (N + 1);\n    var localP = Math.max(0, Math.min(1, (p - startP) / 0.18));\n    c.style.opacity = localP;\n    c.style.transform = "translateY(" + (24 * (1 - localP)) + "px)";\n  });\n}',
      height: 480
    },
    snippetHTML: '<h1 class="reveal">TYPOGRAPHY</h1>',
    snippetCSS: '.reveal .c { display: inline-block; }',
    snippetJS: 'var el = document.querySelector(".reveal");\nel.innerHTML = el.textContent.split("").map(function(c){ return "<span class=\\"c\\">" + (c === " " ? "&nbsp;" : c) + "</span>"; }).join("");\nvar chars = el.querySelectorAll(".c");\nvar track = document.querySelector(".scroll-track");\nwindow.addEventListener("scroll", function(){\n  var rect = track.getBoundingClientRect();\n  var p = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));\n  chars.forEach(function(c, i){\n    var startP = i / (chars.length + 1);\n    var localP = Math.max(0, Math.min(1, (p - startP) / 0.18));\n    c.style.opacity = localP;\n    c.style.transform = "translateY(" + (24 * (1 - localP)) + "px)";\n  });\n}, { passive: true });',
    explain: '텍스트를 글자 단위로 split해 <span class="c">로 감싼다. 각 글자 i의 구간 = [i/(N+1), +0.18]에서 opacity·translateY 보간. 영문 워드마크·숫자에 안전. 띄어쓰기는 &nbsp;로 치환.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (Splitting.js 대체 가능)' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '글자 구간', value: 'width 0.18 (겹침 적음)' },
      { label: '한 글자 변위', value: 'opacity·translateY 24→0' },
      { label: '권장 글자 수', value: '5~12자 (단어 1~2개)' },
      { label: '주의', value: '한글은 자소 분리되면 어색 — 완성형만' }
    ],
    guide: '영문 워드마크·숫자에 가장 안전. 한국어는 5~7자 이내 짧은 슬로건에만. 글자 수가 많으면 후반부가 늘어져 보이므로 12자를 넘기지 않기. font-weight 700 이상 굵은 폰트와 잘 어울림.',
    recommendations: [
      { place: '히어로 헤더', body: 'BRAND·DESIGN·STUDIO 같은 큰 영문 워드마크 진입 — Awwwards SOTD의 클래식 오프닝 모션' },
      { place: '랜딩 페이지', body: '제품 카테고리 라벨("FEATURES", "PRICING")이 섹션 시작에 등장하는 효과' },
      { place: '제품 섹션', body: '가격표의 거대 숫자 "$0"이 한 자릿수씩 등장' },
      { place: '포트폴리오 소개', body: '클라이언트 이름·프로젝트 코드네임 같은 짧은 워드 강조' }
    ],
    tradeoff: '글자 단위 split은 한국어에서 단위 인지가 어색해질 수 있다. 영문 워드마크·숫자에 안전. 한국어는 글자 수 5~7자 이내 짧은 슬로건에만.'
  },

  // ───────────────────────────── 4. blur-reveal
  {
    id: 'blur-reveal',
    num: '04',
    title: '블러 해제',
    summary: '스크롤 진행률에 따라 filter: blur(18px) → 0 + opacity 0 → 1을 직접 보간. 단일 헤드라인의 "초점이 맞춰지는" 인상.',
    demo: {
      bodyHTML: '<h2 class="reveal">초점이 맞춰지는 순간,<br>중요한 것이 드러납니다.</h2>',
      css: '.reveal { font: 500 56px/1.35 "Pretendard Variable","Pretendard",system-ui; color: #fff; margin: 0; text-align: center; letter-spacing: -0.01em; max-width: 900px; will-change: filter, opacity; }',
      script: 'var el = document.querySelector(".reveal");\nfunction applyReveal(p){\n  var fade = Math.max(0, Math.min(1, (p - 0.05) / 0.7));\n  el.style.opacity = fade;\n  el.style.filter = "blur(" + (18 * (1 - fade)) + "px)";\n}',
      height: 480
    },
    snippetHTML: '<h2 class="reveal">초점이 맞춰지는 순간, 중요한 것이 드러납니다.</h2>',
    snippetCSS: '.reveal { will-change: filter, opacity; }',
    snippetJS: 'var el = document.querySelector(".reveal");\nvar track = document.querySelector(".scroll-track");\nwindow.addEventListener("scroll", function(){\n  var rect = track.getBoundingClientRect();\n  var p = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));\n  var fade = Math.max(0, Math.min(1, (p - 0.05) / 0.7));\n  el.style.opacity = fade;\n  el.style.filter = "blur(" + (18 * (1 - fade)) + "px)";\n}, { passive: true });',
    explain: 'transition 없이 스크롤 진행률을 filter blur과 opacity에 직접 매핑. 시작 progress 0.05까지는 완전 블러, 0.05~0.75 구간에서 0→1 fade, 그 후 완료. 사용자가 스크롤 멈추면 정확히 그 progress 상태로 멈춤.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (CSS transition 없음)' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '매핑 구간', value: '[0.05, 0.75] (앞 5% 여유 + 뒤 25% 완료)' },
      { label: '블러 거리', value: 'blur(18px) → blur(0)' },
      { label: '성능 비용', value: '중간 (filter blur GPU)' },
      { label: 'will-change', value: 'filter, opacity (GPU 힌트)' }
    ],
    guide: '단일 헤드라인이나 결정적인 한 줄에 효과적. 블러 거리 12~20px이 자연스럽다. transition 없이 progress 직접 매핑이므로 사용자의 스크롤 속도가 곧 reveal 속도. 큰 면적 텍스트(>200px height)에서는 모바일 비용 — will-change 힌트 권장.',
    recommendations: [
      { place: '히어로 헤더', body: '메인 슬로건이 스크롤 시작에 블러에서 또렷이 맞춰지며 등장 — Linear·Vercel 랜딩의 시그니처' },
      { place: '랜딩 페이지', body: '"왜 우리인가" 같은 강조 문장. 본문 단락 시작 직전 결정적 한 줄' },
      { place: '제품 섹션', body: '제품 사진 위 캡션 — 사진 reveal 이후 스크롤에 따라 caption blur 풀림' },
      { place: '포트폴리오 소개', body: '대표 작업 한 줄 코멘트("이 프로젝트의 핵심은 ~다") 도입부' }
    ],
    tradeoff: 'filter는 GPU 가속이지만 큰 면적 텍스트는 모바일에서 비용. 짧은 헤드라인에만 권장. 접근성: prefers-reduced-motion에서 blur 제거 + opacity만 0→1 권장.'
  },

  // ───────────────────────────── 5. color-fade
  {
    id: 'color-fade',
    num: '05',
    title: '회색 → 본 색',
    summary: '스크롤 진행률에 따라 텍스트 RGB를 dim(#525252)에서 흰색(#fff)으로 직접 보간. 본문 가독성을 해치지 않는 점잖은 패턴.',
    demo: {
      bodyHTML: '<p class="reveal">한 줄의 카피가 브랜드 전체를 좌우합니다.</p>',
      css: '.reveal { font: 700 44px/1.4 "Pretendard Variable","Pretendard",system-ui; margin: 0; text-align: center; max-width: 900px; letter-spacing: -0.01em; color: #525252; }',
      script: 'var el = document.querySelector(".reveal");\nfunction applyReveal(p){\n  var fade = Math.max(0, Math.min(1, (p - 0.05) / 0.7));\n  var c = Math.round(82 + (255 - 82) * fade);\n  el.style.color = "rgb(" + c + "," + c + "," + c + ")";\n}',
      height: 480
    },
    snippetHTML: '<p class="reveal">한 줄의 카피가 브랜드 전체를 좌우합니다.</p>',
    snippetCSS: '.reveal { color: #525252; }',
    snippetJS: 'var el = document.querySelector(".reveal");\nvar track = document.querySelector(".scroll-track");\nwindow.addEventListener("scroll", function(){\n  var rect = track.getBoundingClientRect();\n  var p = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));\n  var fade = Math.max(0, Math.min(1, (p - 0.05) / 0.7));\n  var c = Math.round(82 + (255 - 82) * fade);\n  el.style.color = "rgb(" + c + "," + c + "," + c + ")";\n}, { passive: true });',
    explain: 'transition 없이 RGB 채널을 progress에 따라 보간. 82(dim) → 255(흰색)을 (1-fade) × 82 + fade × 255로 계산. 가장 부드럽고 점잖은 인상.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (CSS transition 없음)' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '매핑 구간', value: '[0.05, 0.75]' },
      { label: '시작 색', value: 'rgb(82, 82, 82) — dim 회색' },
      { label: '끝 색', value: 'rgb(255, 255, 255) — 흰색' },
      { label: '성능 비용', value: '낮음 (RGB 보간만)' }
    ],
    guide: '가장 부드럽고 점잖아서 어디에나 안전. 본문·서브카피에 적합. 강조하고 싶으면 색차를 크게(dim 50 → 255), 점잖게 하려면 작게(회색 150 → 255). 단어별 매핑(scrub-color)과 결합도 가능.',
    recommendations: [
      { place: '히어로 헤더', body: '메인 슬로건 아래 보조 카피의 색이 회색→흰색으로 차오름 — 가장 점잖은 진입' },
      { place: '랜딩 페이지', body: '회사 미션·비전 단락이 스크롤에 따라 색이 차오름' },
      { place: '제품 섹션', body: '"왜 이 제품인가" 단락 본문이 회색→본색으로 채워짐' },
      { place: '포트폴리오 소개', body: '프로젝트 설명 단락 본문. 가독성을 해치지 않아 글을 끝까지 읽게 함' }
    ],
    tradeoff: '가장 부드럽고 안전하지만 인상은 가장 약하다. 결정적인 헤드라인보다는 본문·서브카피에 적합. 접근성 최우수.'
  },

  // ───────────────────────────── 6. scrub-color
  {
    id: 'scrub-color',
    num: '06',
    title: '스크롤 스크럽 컬러',
    summary: '스크롤 진행률에 정확히 매핑되어 단어가 차례로 dim → 흰색으로 채워진다. Framer 마켓플레이스 Text Reveal의 시그니처 동작 — 사용자가 스크롤을 멈추면 정확히 그 자리에서 reveal도 멈춘다.',
    demo: {
      bodyHTML: '<p class="reveal" data-orig="' + LONG_BODY + '">' + LONG_BODY + '</p>',
      css: '.reveal { font: 700 40px/1.5 "Pretendard Variable","Pretendard",system-ui; color: #525252; max-width: 900px; margin: 0; text-align: left; letter-spacing: -0.01em; }\n.reveal .w { display: inline-block; transition: color 200ms ease; }\n.reveal .w.on { color: #fff; }',
      script: 'var el = document.querySelector(".reveal");\nvar orig = el.dataset.orig || el.textContent;\nvar words = orig.split(" ");\nel.innerHTML = words.map(function(w){ return "<span class=\\"w\\">" + w + "</span>"; }).join(" ");\nvar spans = el.querySelectorAll(".w");\nvar N = spans.length;\nfunction applyReveal(p){\n  var lit = Math.max(0, Math.min(1, (p - 0.05) / 0.85));\n  var idx = Math.floor(lit * (N + 1));\n  spans.forEach(function(s, i){ s.classList.toggle("on", i < idx); });\n}',
      height: 560
    },
    snippetHTML: '<div class="scroll-track">\n  <div class="sticky-stage">\n    <p class="reveal">Read every word as if it matters.</p>\n  </div>\n</div>',
    snippetCSS: '.scroll-track { min-height: 240vh; }\n.sticky-stage { position: sticky; top: 0; height: 100vh; display: flex; align-items: center; justify-content: center; }\n.reveal { color: #525252; }\n.reveal .w { display: inline-block; transition: color 200ms ease; }\n.reveal .w.on { color: #fff; }',
    snippetJS: 'var el = document.querySelector(".reveal");\nvar words = el.textContent.split(" ");\nel.innerHTML = words.map(function(w){ return "<span class=\\"w\\">" + w + "</span>"; }).join(" ");\nvar spans = el.querySelectorAll(".w");\nvar track = document.querySelector(".scroll-track");\nwindow.addEventListener("scroll", function(){\n  var rect = track.getBoundingClientRect();\n  var p = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));\n  var idx = Math.floor(p * (spans.length + 1));\n  spans.forEach(function(s, i){ s.classList.toggle("on", i < idx); });\n}, { passive: true });',
    explain: '카테고리의 시그니처 패턴. sticky로 텍스트를 viewport에 고정한 뒤 스크롤 진행률(0~1)을 단어 인덱스에 1:1 매핑 (idx = progress × N단어). idx보다 작은 인덱스의 단어는 .on 클래스 → 흰색. 사용자가 스크롤을 멈추면 reveal도 멈춘다. 단어 한 개당 transition 200ms로 짧게 잡아 스크롤에 즉각 반응.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (GSAP ScrollTrigger 대체 가능)' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '매핑', value: 'idx = floor(progress × N) — 단어 인덱스' },
      { label: '단어 색 전환', value: '200ms ease (CSS transition)' },
      { label: 'Track 높이', value: '240vh' },
      { label: '권장 길이', value: '15~50 단어 (한 단락 본문)' }
    ],
    guide: 'Framer 마켓플레이스 Text Reveal의 동일 동작. sticky height = 100vh, parent track = 240vh로 잡으면 사용자가 140vh만큼 스크롤하는 동안 reveal이 진행. 단어 전환에 짧은 CSS transition(200ms)을 두면 스크롤이 빨라도 부드럽게 따라옴. GSAP ScrollTrigger scrub:true + pin:true로도 동일하게 구현 가능.',
    recommendations: [
      { place: '히어로 헤더', body: '메인 슬로건이 첫 스크롤에 단어별로 흰색으로 차오름 — Apple Pro Display·Framer 마켓플레이스의 핵심 진입' },
      { place: '랜딩 페이지', body: '"우리가 하는 일"을 한 문단으로 풀어내는 About 섹션. 스크롤로 한 단어씩 채워지며 시선 유도' },
      { place: '제품 섹션', body: '제품 철학·미션 선언 한 단락. 사용자가 스크롤 속도로 reveal 속도를 직접 제어' },
      { place: '포트폴리오 소개', body: '"이 프로젝트는 ~다" 핵심 코멘트를 스크럽 컬러로 부각. 클라이언트와 함께 스크롤로 읽기' }
    ],
    tradeoff: 'sticky pin 동안 페이지 스크롤이 잠긴 듯 느껴질 수 있어 거리감 조절 필수(track 200~250vh 권장). prefers-reduced-motion에서는 sticky 비활성 + 모두 즉시 흰색 표시. 모바일 빠른 스크롤에서는 단어 transition이 따라오지 못해 즉시 토글 — 200ms transition이 적당.'
  },

  // ───────────────────────────── 7. mask-sweep
  {
    id: 'mask-sweep',
    num: '07',
    title: '가로 마스크 스윕',
    summary: 'background-clip:text + linear-gradient의 background-position을 progress에 매핑. 텍스트 색이 좌→우로 쓸리며 흰색으로 채워진다.',
    demo: {
      bodyHTML: '<h1 class="reveal">REVEAL</h1>',
      css: '.reveal {\n  font: 900 18vw/1 "Pretendard Variable","Pretendard",system-ui;\n  letter-spacing: 0.02em;\n  margin: 0;\n  background: linear-gradient(90deg, #ffffff 50%, #525252 50%);\n  background-size: 200% 100%;\n  background-position: 100% 0;\n  -webkit-background-clip: text;\n  background-clip: text;\n  -webkit-text-fill-color: transparent;\n  color: transparent;\n}',
      script: 'var el = document.querySelector(".reveal");\nfunction applyReveal(p){\n  var sweep = Math.max(0, Math.min(1, (p - 0.05) / 0.8));\n  el.style.backgroundPosition = (100 - sweep * 100) + "% 0";\n}',
      height: 480
    },
    snippetHTML: '<h1 class="reveal">REVEAL</h1>',
    snippetCSS: '.reveal {\n  background: linear-gradient(90deg, #ffffff 50%, #525252 50%);\n  background-size: 200% 100%;\n  background-position: 100% 0;\n  -webkit-background-clip: text;\n  background-clip: text;\n  -webkit-text-fill-color: transparent;\n}',
    snippetJS: 'var el = document.querySelector(".reveal");\nvar track = document.querySelector(".scroll-track");\nwindow.addEventListener("scroll", function(){\n  var rect = track.getBoundingClientRect();\n  var p = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));\n  el.style.backgroundPosition = (100 - p * 100) + "% 0";\n}, { passive: true });',
    explain: 'linear-gradient를 두 색 50:50으로 만들고 background-size 200%로 확대. background-position을 progress에 따라 100%(오른쪽 회색만 보임)에서 0%(왼쪽 흰색만 보임)로 직접 매핑. background-clip:text로 텍스트 모양에만 색이 클립된다.',
    kv: [
      { label: '의존성', value: 'CSS + Vanilla JS (transition 없음)' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '핵심 기술', value: 'background-clip:text + background-position 매핑' },
      { label: '매핑 구간', value: '[0.05, 0.85]' },
      { label: 'background-position', value: '100% → 0% (좌→우 sweep)' },
      { label: '호환성', value: 'iOS Safari는 -webkit-text-fill-color 필수' }
    ],
    guide: '거대한 워드마크에 가장 잘 어울림. 한 단어 또는 짧은 슬로건(5~10자). background-clip:text는 큰 폰트(>80px)일수록 효과가 명확. iOS Safari 호환을 위해 -webkit- prefix 필수. 시작/끝 색 명도 차이가 클수록 임팩트.',
    recommendations: [
      { place: '히어로 헤더', body: 'BRAND·HELLO·WELCOME 같은 거대 워드마크가 스크롤에 따라 좌→우로 색이 차오름' },
      { place: '랜딩 페이지', body: '섹션 전환 헤딩(FEATURES, ABOUT) — 섹션마다 마스크 스윕으로 진입' },
      { place: '제품 섹션', body: '제품 라인업 이름이 한 단어씩 좌→우 색 sweep으로 등장' },
      { place: '포트폴리오 소개', body: '클라이언트 로고 자리에 텍스트 로고를 마스크 스윕으로 강조' }
    ],
    tradeoff: 'background-clip:text는 모든 모던 브라우저 지원하지만 iOS에서 -webkit- prefix 필수. 매우 큰 폰트(>120px)에서 약간의 anti-aliasing 차이. SEO/접근성에는 영향 없음(실제 텍스트는 그대로 존재).'
  },

  // ───────────────────────────── 8. letter-cascade
  {
    id: 'letter-cascade',
    num: '08',
    title: '글자 폭포',
    summary: '글자가 위에서 떨어지듯 progress에 따라 translateY(-115%) → 0으로 보간. 부모 overflow:hidden 마스크로 글자 모양만 노출.',
    demo: {
      bodyHTML: '<h1 class="reveal" data-orig="CASCADE">CASCADE</h1>',
      css: '.reveal { font: 800 14vw/1 "Pretendard Variable","Pretendard",system-ui; color: #fff; letter-spacing: 0.04em; margin: 0; overflow: hidden; padding: 14px 0; }\n.reveal .c { display: inline-block; transform: translateY(-115%); }',
      script: 'var el = document.querySelector(".reveal");\nvar orig = el.dataset.orig || el.textContent;\nel.innerHTML = orig.split("").map(function(c){ return "<span class=\\"c\\">" + (c === " " ? "&nbsp;" : c) + "</span>"; }).join("");\nvar chars = el.querySelectorAll(".c");\nvar N = chars.length;\nfunction applyReveal(p){\n  chars.forEach(function(c, i){\n    var startP = i / (N + 1);\n    var localP = Math.max(0, Math.min(1, (p - startP) / 0.22));\n    var ease = 1 - Math.pow(1 - localP, 3);\n    c.style.transform = "translateY(" + (-115 * (1 - ease)) + "%)";\n  });\n}',
      height: 480
    },
    snippetHTML: '<h1 class="reveal">CASCADE</h1>',
    snippetCSS: '.reveal { overflow: hidden; padding: 14px 0; }\n.reveal .c { display: inline-block; transform: translateY(-115%); }',
    snippetJS: 'var el = document.querySelector(".reveal");\nel.innerHTML = el.textContent.split("").map(function(c){ return "<span class=\\"c\\">" + (c === " " ? "&nbsp;" : c) + "</span>"; }).join("");\nvar chars = el.querySelectorAll(".c");\nvar track = document.querySelector(".scroll-track");\nwindow.addEventListener("scroll", function(){\n  var rect = track.getBoundingClientRect();\n  var p = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));\n  chars.forEach(function(c, i){\n    var startP = i / (chars.length + 1);\n    var localP = Math.max(0, Math.min(1, (p - startP) / 0.22));\n    var ease = 1 - Math.pow(1 - localP, 3);\n    c.style.transform = "translateY(" + (-115 * (1 - ease)) + "%)";\n  });\n}, { passive: true });',
    explain: 'char-stagger와 마찬가지로 글자별 split + progress 매핑. 다른 점: 부모 overflow:hidden을 걸고 translateY(-115%)에서 시작 → 0까지 보간. ease-out-cubic 적용으로 떨어지는 듯한 인상. 글자가 폭포처럼 흘러내림.',
    kv: [
      { label: '의존성', value: 'Vanilla JS' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '이징', value: 'ease-out-cubic (자체 보간)' },
      { label: '글자 구간', value: 'width 0.22 (line-slide보다 길게)' },
      { label: '핵심', value: '부모 overflow:hidden 필수' },
      { label: '권장', value: '5~10자 워드마크' }
    ],
    guide: '강한 인상이 필요한 영문 워드마크에. 부모 overflow:hidden 필수 — 잊으면 효과가 무너짐. 디센더(g, y, p)가 잘리지 않도록 padding 12~16px 권장. 글자 구간(0.22) 안에서 ease-out-cubic으로 부드럽게.',
    recommendations: [
      { place: '히어로 헤더', body: '브랜드 워드마크가 위에서 폭포처럼 떨어져 자리 잡음 — 강렬한 첫인상' },
      { place: '랜딩 페이지', body: '신제품 발표 페이지의 제품명 reveal — Apple WWDC 키노트 스타일' },
      { place: '제품 섹션', body: '가격 페이지의 큰 숫자(연간/월간)가 위에서 떨어져 정렬' },
      { place: '포트폴리오 소개', body: '프로젝트 코드네임/넘버링(SS24, AW25 등)을 강조' }
    ],
    tradeoff: 'overflow:hidden을 부모에 걸어야 하므로 line-height·padding 조정 필요. 디센더 잘림 주의. 한글 자소 분리 위험은 char-stagger와 동일.'
  },

  // ───────────────────────────── 9. variable-morph
  {
    id: 'variable-morph',
    num: '09',
    title: 'Variable Font 변형',
    summary: 'Pretendard Variable의 wght 축을 progress에 매핑. 100(Thin)에서 900(Black)으로 직접 보간되며 글자가 두꺼워진다.',
    demo: {
      bodyHTML: '<h1 class="reveal">Variable</h1>',
      css: '.reveal { font-family: "Pretendard Variable","Pretendard",system-ui; font-size: 18vw; line-height: 1; color: #fff; margin: 0; font-variation-settings: "wght" 100; font-weight: 100; }',
      script: 'var el = document.querySelector(".reveal");\nfunction applyReveal(p){\n  var fade = Math.max(0, Math.min(1, (p - 0.05) / 0.8));\n  var w = Math.round(100 + 800 * fade);\n  el.style.fontVariationSettings = "\\"wght\\" " + w;\n  el.style.fontWeight = w;\n}',
      height: 480
    },
    snippetHTML: '<h1 class="reveal">Variable</h1>',
    snippetCSS: '.reveal {\n  font-family: "Pretendard Variable","Pretendard",system-ui;\n  font-variation-settings: "wght" 100;\n  font-weight: 100;\n}',
    snippetJS: 'var el = document.querySelector(".reveal");\nvar track = document.querySelector(".scroll-track");\nwindow.addEventListener("scroll", function(){\n  var rect = track.getBoundingClientRect();\n  var p = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));\n  var w = Math.round(100 + 800 * p);\n  el.style.fontVariationSettings = "\\"wght\\" " + w;\n  el.style.fontWeight = w;\n}, { passive: true });',
    explain: 'Variable font의 wght 축을 progress에 직접 매핑. 100 + 800 × progress로 100~900 범위 보간. font-weight도 함께 적어주면 가변 미지원 환경 폴백. transition 없이 스크롤 속도가 곧 morph 속도.',
    kv: [
      { label: '의존성', value: 'Variable font (Pretendard Variable, Inter Variable)' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '매핑', value: 'wght = 100 + 800 × progress' },
      { label: 'wght 범위', value: '100 (Thin) → 900 (Black)' },
      { label: '매핑 구간', value: '[0.05, 0.85]' },
      { label: '호환성', value: 'CSS Fonts Level 4 (97% 이상 지원)' }
    ],
    guide: 'Variable font가 로드된 환경에서만 동작. 폰트가 가변인지 확인 필수. 100→900 같은 큰 범위가 시각적으로 가장 흥미롭다. 폰트 사이트·typography 중심 페이지에 가장 자연스럽다.',
    recommendations: [
      { place: '히어로 헤더', body: '디자인 스튜디오·폰트 파운드리 사이트의 메인 워드마크가 thin→black으로 morph' },
      { place: '랜딩 페이지', body: '타이포그래피 강조 섹션의 헤딩에 적용 — "Typography matters" 같은 메타 카피' },
      { place: '제품 섹션', body: 'Variable Font 자체를 시연하는 폰트 데모 페이지' },
      { place: '포트폴리오 소개', body: '디자이너 본인 이름·스튜디오 로고를 weight morph로 강조' }
    ],
    tradeoff: 'Variable font 로드 비용(파일 1개에 모든 weight). 가변이 아닌 폰트에서는 weight transition이 끊겨 보임. prefers-reduced-motion에서 즉시 900 표시 권장.'
  },

  // ───────────────────────────── 10. underline-reveal
  {
    id: 'underline-reveal',
    num: '10',
    title: '밑줄 동반 진입',
    summary: '두 progress 구간으로 분리: 텍스트 fade-up은 [0.05, 0.5], 밑줄 scaleX는 [0.3, 0.95]. 텍스트가 자리잡은 후 밑줄이 좌→우로 펼쳐진다.',
    demo: {
      bodyHTML: '<div class="reveal"><span class="t">주목해서 읽어 주세요.</span><span class="u"></span></div>',
      css: '.reveal { font: 700 56px/1.35 "Pretendard Variable","Pretendard",system-ui; color: #fff; margin: 0; display: inline-flex; flex-direction: column; gap: 12px; align-items: flex-start; letter-spacing: -0.01em; }\n.reveal .t { display: inline-block; opacity: 0; transform: translateY(20px); }\n.reveal .u { display: block; height: 4px; width: 100%; background: #fff; transform: scaleX(0); transform-origin: left; }',
      script: 'var textEl = document.querySelector(".reveal .t");\nvar lineEl = document.querySelector(".reveal .u");\nfunction applyReveal(p){\n  var textP = Math.max(0, Math.min(1, (p - 0.05) / 0.45));\n  var textEase = 1 - Math.pow(1 - textP, 3);\n  textEl.style.opacity = textEase;\n  textEl.style.transform = "translateY(" + (20 * (1 - textEase)) + "px)";\n  var lineP = Math.max(0, Math.min(1, (p - 0.3) / 0.65));\n  var lineEase = 1 - Math.pow(1 - lineP, 3);\n  lineEl.style.transform = "scaleX(" + lineEase + ")";\n}',
      height: 480
    },
    snippetHTML: '<div class="reveal"><span class="t">주목해서 읽어 주세요.</span><span class="u"></span></div>',
    snippetCSS: '.reveal { display: inline-flex; flex-direction: column; gap: 12px; align-items: flex-start; }\n.reveal .t { opacity: 0; transform: translateY(20px); }\n.reveal .u { display: block; height: 4px; width: 100%; background: currentColor; transform: scaleX(0); transform-origin: left; }',
    snippetJS: 'var textEl = document.querySelector(".reveal .t");\nvar lineEl = document.querySelector(".reveal .u");\nvar track = document.querySelector(".scroll-track");\nwindow.addEventListener("scroll", function(){\n  var rect = track.getBoundingClientRect();\n  var p = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));\n  var textP = Math.max(0, Math.min(1, p / 0.5));\n  textEl.style.opacity = textP;\n  textEl.style.transform = "translateY(" + (20 * (1 - textP)) + "px)";\n  var lineP = Math.max(0, Math.min(1, (p - 0.3) / 0.65));\n  lineEl.style.transform = "scaleX(" + lineP + ")";\n}, { passive: true });',
    explain: '두 단계 progress 매핑이 핵심. 텍스트는 [0.05, 0.5] 구간에서 fade-up, 밑줄은 [0.3, 0.95] 구간에서 scaleX 0→1. 두 구간이 0.3~0.5에서 겹쳐 "강조의 결정적 순간"을 만든다. transform-origin: left가 핵심.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (CSS transition 없음)' },
      { label: '트리거', value: '스크롤 진행률 0→1 (sticky pin)' },
      { label: '텍스트 구간', value: '[0.05, 0.5] (앞에서 풀려남)' },
      { label: '밑줄 구간', value: '[0.3, 0.95] (뒤에서 따라붙음)' },
      { label: '이징', value: 'ease-out-cubic 자체 보간' },
      { label: '핵심', value: 'transform-origin: left' }
    ],
    guide: '핵심 메시지·CTA에 사용. 한 줄짜리 짧은 카피에만 적합 — 다중 줄에서는 밑줄이 마지막 줄에만 그어지므로. 두 구간의 겹침(0.3~0.5)이 시각적 임팩트의 핵심. transform-origin이 left일 때 자연스러우나, 우측 정렬 카피에서는 right.',
    recommendations: [
      { place: '히어로 헤더', body: '서브카피 + 강조 밑줄로 핵심 메시지 강조 — "지금 시작하세요" 같은 CTA 카피' },
      { place: '랜딩 페이지', body: '기능 강조 카피("핵심 기능" 같은 키워드)에 밑줄 동반 진입' },
      { place: '제품 섹션', body: '버전·플랜 이름(Pro / Enterprise 등)에 밑줄로 강조' },
      { place: '포트폴리오 소개', body: '"Selected Works", "About Me" 같은 섹션 헤딩에 밑줄 진입으로 무게감' }
    ],
    tradeoff: '밑줄의 transform-origin이 left일 때 자연스러우나, 우측 정렬 카피에서는 right. 다중 줄 텍스트에서는 밑줄이 마지막 줄에만 그어지므로 한 줄짜리 카피에만 권장.'
  }
];

// ============ Standalone demo HTML 빌더 (v3 — scroll-pin + progress) ============

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
      embed: 'demos/scroll-text-reveal/' + p.id + '.html',
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
      { type: 'heading', value: '스크롤 텍스트 로드 — 패턴 카탈로그 v3 (scroll-pin + 진행률 매핑)' },
      { type: 'text', value: CATEGORY.summary },
      { type: 'heading', value: '10 패턴 인덱스' },
      { type: 'structure', items: indexItems },
      { type: 'heading', value: '공통 디자인 토큰 + scroll 모델' },
      {
        type: 'kv', columns: 2, items: [
          { label: '폰트', value: 'Pretendard Variable (한글) · Inter (영문 보조)' },
          { label: '배경 / 본문 색', value: '#000 / #ffffff · dim 시작 색 #525252' },
          { label: 'Scroll 모델', value: '.scroll-track 240vh + .sticky-stage 100vh (position:sticky top:0)' },
          { label: '진행률 계산', value: 'p = clamp(0, -rect.top / (rect.height - innerHeight), 1)' },
          { label: '이벤트', value: 'window.scroll {passive:true} + resize' },
          { label: '접근성', value: 'prefers-reduced-motion: sticky 비활성 + 모두 즉시 표시 권장' }
        ]
      },
      { type: 'heading', value: '읽기 가이드' },
      {
        type: 'structure', items: [
          { label: '라이브 데모', tag: 'IFRAME', desc: 'demos/scroll-text-reveal/{pattern}.html 의 standalone 페이지를 iframe으로 임베드. iframe 안에서 스크롤하면 진행률에 따라 reveal. ↻ 다시 보기로 처음으로' },
          { label: '작동 원리', tag: 'HOW', desc: '진행률(0~1)을 어떻게 상태에 매핑하는지 핵심 메커니즘' },
          { label: '정량 메타', tag: 'KV', desc: '의존성 / 트리거 / 매핑 함수 / 매핑 구간 / 권장 길이 등' },
          { label: '코드 스니펫', tag: 'CODE', desc: 'HTML / CSS / JS 세 블록. sticky track + scroll handler 포함' },
          { label: '사용 가이드', tag: 'GUIDE', desc: '어떻게 사용하나 — track 높이·매핑 구간·접근성·주의점' },
          { label: '활용 추천', tag: 'PLACES', desc: '히어로 헤더 / 랜딩 페이지 / 제품 섹션 / 포트폴리오 소개의 4가지 컨텍스트 활용' },
          { label: '트레이드오프', tag: 'NOTE', desc: '성능·접근성·권장 사용처에 대한 한 줄 메모' }
        ]
      },
      {
        type: 'note',
        value: '참고 자료: Framer 마켓플레이스 Text Reveal 컴포넌트 (' + CATEGORY.url + ') — Inter 다크 톤 + iframe 라이브 데모 + scroll-pin reveal 구조를 차용. 본 카탈로그는 단일 컴포넌트가 아닌 10가지 진행률 매핑 패턴 비교 카탈로그를 지향한다. 모든 데모는 자동 재생이 아니라 사용자가 iframe 안에서 스크롤할 때만 reveal이 진행되며, ↻ 다시 보기 버튼이 scroll position을 0으로 리셋한다.'
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
    console.log('✓ demos/scroll-text-reveal/' + p.id + '.html');
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

  console.log('✓ analyses/scroll-text-reveal/analysis.json');
  console.log('  ' + PATTERNS.length + ' patterns + 1 overview = ' + (PATTERNS.length + 1) + ' sections');
  const totalBlocks = Object.values(sections).reduce((acc, s) => acc + s.blocks.length, 0);
  console.log('  ' + totalBlocks + ' blocks total');
}

main();
