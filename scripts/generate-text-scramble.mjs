#!/usr/bin/env node
/**
 * Interaction Lab — Category Generator: Text Scramble (v1)
 * Codrops 키네틱 타이포 참고 — 10종 스크램블/타자기 텍스트 인터랙션 카탈로그
 *
 * - 로드 자동 재생 + ↻ 다시 보기 (number-counter 모델 클론)
 * - 검정 배경 + Pretendard Variable + 한국어 헤드라인
 * - 랜덤 글리프는 영문 대문자·숫자·기호 풀 사용
 *
 * Usage: node scripts/generate-text-scramble.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ANALYSIS_DIR = join(ROOT, 'analyses', 'text-scramble');
const ANALYSIS_FILE = join(ANALYSIS_DIR, 'analysis.json');
const DEMO_DIR = join(ROOT, 'demos', 'text-scramble');

const CATEGORY = {
  id: 'text-scramble',
  title: '스크램블 텍스트',
  type: 'category',
  date: '2026-06-10',
  url: 'https://tympanus.net/codrops/',
  summary: '글자가 랜덤 글리프에서 해독되거나 타자기처럼 출력되는 10가지 시간 기반 키네틱 타이포. 2026 트렌드 1순위 — 로드 자동 재생 + ↻ 다시 보기 모델로 히어로 헤드라인에 5분 만에 이식.'
};

/* ================================================================
   공통 CSS / 공통 JS 스니펫
   ================================================================ */

// 모든 데모가 공유하는 보조 캡션 스타일
const CAP_CSS = '.cap { font: 500 11px/1 "Pretendard Variable",sans-serif; color: rgba(255,255,255,0.3); letter-spacing: 0.18em; text-transform: uppercase; margin: 0 0 20px; text-align: center; }';

// 시드 기반 의사난수 — 같은 진행률에서 항상 같은 글리프 (결정적 재생)
const RND_JS = 'function rnd(seed) { var x = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }';

const CLAMP_JS = 'function clamp01(t) { return Math.max(0, Math.min(1, t)); }';

/* ================================================================
   10 패턴 정의
   ================================================================ */

const PATTERNS = [
  // ── 01. scramble-decode (Codrops 시그니처) ──
  {
    id: 'scramble-decode', num: '01', title: '스크램블 디코드 (시그니처)',
    summary: 'Codrops 시그니처 스크램블. 모든 글자가 랜덤 글리프(영문 대문자·숫자·기호)로 회전하다가 좌→우 순서로 한 글자씩 원본 한국어로 확정되는 해독 연출.',
    demo: {
      bodyHTML: '<div class="scr-wrap">\n'
        + '  <p class="cap">TEXT SCRAMBLE — DECODE</p>\n'
        + '  <h1 class="scr-line" aria-label="모션이 브랜드를 만든다"></h1>\n'
        + '</div>',
      css: '.scr-wrap { text-align: center; }\n'
        + '.scr-line { margin: 0; font: 800 clamp(34px,5.6vw,72px)/1.3 "Pretendard Variable",sans-serif; letter-spacing: 0.01em; white-space: nowrap; }\n'
        + '.scr-char { display: inline-block; width: 1em; text-align: center; color: rgba(255,255,255,0.28); }\n'
        + '.scr-char.on { color: #fff; }\n'
        + '.scr-space { display: inline-block; width: 0.45em; }\n'
        + CAP_CSS,
      js: 'var TEXT = "모션이 브랜드를 만든다";\n'
        + 'var POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&@!?<>+=*";\n'
        + 'var line = document.querySelector(".scr-line");\n'
        + 'var spans = [];\n'
        + 'TEXT.split("").forEach(function(ch) {\n'
        + '  var s = document.createElement("span");\n'
        + '  if (ch === " ") { s.className = "scr-space"; s.innerHTML = "&nbsp;"; }\n'
        + '  else { s.className = "scr-char"; s.textContent = ch; }\n'
        + '  s.dataset.ch = ch;\n'
        + '  line.appendChild(s);\n'
        + '  spans.push(s);\n'
        + '});\n'
        + RND_JS + '\n'
        + 'function applyReveal(p) {\n'
        + '  var frame = Math.floor(p * 60);\n'
        + '  var N = spans.length;\n'
        + '  spans.forEach(function(s, i) {\n'
        + '    if (s.dataset.ch === " ") return;\n'
        + '    var lockP = 0.1 + (i / N) * 0.8;\n'
        + '    if (p >= lockP) {\n'
        + '      s.textContent = s.dataset.ch;\n'
        + '      s.classList.add("on");\n'
        + '    } else {\n'
        + '      s.classList.remove("on");\n'
        + '      s.textContent = POOL.charAt(Math.floor(rnd(i * 91 + Math.floor(frame / 2) * 7) * POOL.length));\n'
        + '    }\n'
        + '  });\n'
        + '}',
      height: 520,
      duration: 2800
    },
    snippetHTML: '<h1 class="scr-line" aria-label="모션이 브랜드를 만든다"></h1>\n<!-- 글자 span은 JS가 빌드 -->',
    snippetCSS: '.scr-char {\n  display: inline-block;\n  width: 1em; text-align: center; /* 글리프 교체 시 폭 고정 */\n  color: rgba(255,255,255,0.28);  /* 회전 중 글리프 */\n}\n.scr-char.on { color: #fff; }     /* 해독 확정 글자 */',
    snippetJS: 'var POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&@!?<>+=*";\n// 시드 난수 — 같은 진행률이면 항상 같은 글리프\nfunction rnd(seed) { var x = Math.sin(seed*127.1+311.7)*43758.5453; return x - Math.floor(x); }\nfunction applyReveal(p) {\n  var frame = Math.floor(p * 60);\n  spans.forEach(function(s, i) {\n    var lockP = 0.1 + (i / N) * 0.8;   // 좌→우 순차 잠금\n    if (p >= lockP) { s.textContent = s.dataset.ch; s.classList.add("on"); }\n    else s.textContent = POOL.charAt(Math.floor(rnd(i*91 + Math.floor(frame/2)*7) * POOL.length));\n  });\n}',
    explain: '각 글자를 span으로 분해한 뒤 프레임 카운터(p×60)를 돌린다. 글자마다 잠금 시점 lockP = 0.1 + (i/N)×0.8 — 진행률이 lockP를 넘기 전에는 시드 기반 의사난수로 글리프 풀에서 2프레임마다 새 글리프를 뽑아 보여주고, 넘는 순간 원본 글자로 확정하며 .on 클래스로 색을 전환한다. Math.sin 시드 난수라 같은 진행률에서 항상 같은 글리프가 나와 재생이 결정적(deterministic)이고, ↻ 다시 보기에서도 동일한 해독 장면이 재현된다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (시드 난수 + 프레임 카운터)' },
      { label: '트리거', value: '페이지 로드 → 타이머 진행률 0→1 (2.8s)' },
      { label: '글리프 풀', value: '영문 대문자 + 숫자 + 기호 48종' },
      { label: '잠금 순서', value: '좌→우 stagger (lockP = 0.1 + i/N×0.8)' },
      { label: '핵심', value: '글자당 lockP 비교 + 2프레임마다 글리프 교체' },
      { label: '참고', value: 'Codrops Text Scramble / Matrix 디코드' }
    ],
    guide: '글리프 풀에 한글 자모(ㄱㄴㄷ…)를 섞으면 한국어 무드가 강해지지만 글자 폭이 출렁인다 — 영문·숫자 풀 + 고정폭(1em) 셀이 안정적. 잠금 구간(0.8)을 줄이면 거의 동시 해독, 늘리면 타자기처럼 순차 해독. 스크린리더가 중간 글리프를 읽지 않도록 컨테이너에 aria-label로 원본 문장을 고정 제공하고, prefers-reduced-motion 사용자에게는 즉시 원본을 보여줄 것.',
    recommendations: [
      { place: '히어로 헤더', body: '첫 화면 헤드라인 — 브랜드 슬로건이 해독되며 등장하는 시그니처 인트로' },
      { place: '랜딩 페이지', body: '섹션 타이틀 — 뷰포트 진입 시 1회 재생으로 기술적 무드 부여' },
      { place: '제품 섹션', body: '키 스펙 공개 — 신제품 티저에서 사양 문구가 해독되는 연출' },
      { place: '포트폴리오 소개', body: '이름·직함 인트로 — 개발자/디자이너 정체성을 코드 무드로 표현' }
    ],
    tradeoff: '글리프가 빠르게 바뀌는 동안 텍스트를 읽을 수 없어 핵심 정보 전달이 1~2초 지연됨. 스크린리더 대응(aria-label 고정)이 없으면 노이즈가 그대로 낭독될 수 있다.'
  },

  // ── 02. typewriter ──
  {
    id: 'typewriter', num: '02', title: '타자기',
    summary: '커서가 깜빡이며 글자가 한 자씩 출력되는 고전 타자기. 타이핑 완료 후 커서가 잠시 머물다 사라지며 문장이 확정된다.',
    demo: {
      bodyHTML: '<div class="tw-wrap">\n'
        + '  <p class="cap">TYPEWRITER — INTRO</p>\n'
        + '  <h1 class="tw-line"><span class="tw-text"></span><span class="tw-cursor"></span></h1>\n'
        + '</div>',
      css: '.tw-wrap { text-align: center; width: min(86vw, 820px); }\n'
        + '.tw-line { margin: 0; font: 700 clamp(26px,4.2vw,48px)/1.45 "Pretendard Variable",sans-serif; color: #fff; min-height: 1.45em; }\n'
        + '.tw-cursor { display: inline-block; width: 3px; height: 1em; background: #fff; margin-left: 5px; vertical-align: -0.12em; animation: blink 1s infinite; transition: opacity 400ms; }\n'
        + '.tw-cursor.off { opacity: 0; animation: none; }\n'
        + '@keyframes blink { 0%, 45% { opacity: 1; } 50%, 95% { opacity: 0; } 100% { opacity: 1; } }\n'
        + CAP_CSS,
      js: 'var TEXT = "안녕하세요, 우리는 모션을 설계하는 팀입니다.";\n'
        + 'var textEl = document.querySelector(".tw-text");\n'
        + 'var cursor = document.querySelector(".tw-cursor");\n'
        + 'function applyReveal(p) {\n'
        + '  var typeP = Math.min(1, p / 0.82);\n'
        + '  var count = Math.round(typeP * TEXT.length);\n'
        + '  textEl.textContent = TEXT.slice(0, count);\n'
        + '  if (p > 0.92) cursor.classList.add("off");\n'
        + '  else cursor.classList.remove("off");\n'
        + '}',
      height: 480,
      duration: 3200
    },
    snippetHTML: '<h1 class="tw-line">\n  <span class="tw-text"></span>\n  <span class="tw-cursor"></span>\n</h1>',
    snippetCSS: '.tw-cursor {\n  display: inline-block; width: 3px; height: 1em;\n  background: #fff; animation: blink 1s infinite;\n  transition: opacity 400ms;\n}\n.tw-cursor.off { opacity: 0; animation: none; }\n@keyframes blink { 0%,45% { opacity:1; } 50%,95% { opacity:0; } 100% { opacity:1; } }',
    snippetJS: 'function applyReveal(p) {\n  var typeP = Math.min(1, p / 0.82);          // 0~82% 구간에 타이핑\n  var count = Math.round(typeP * TEXT.length);\n  textEl.textContent = TEXT.slice(0, count);   // slice 한 줄이 핵심\n  cursor.classList.toggle("off", p > 0.92);    // 마지막에 커서 소멸\n}',
    explain: 'slice(0, count) 한 줄이 핵심. 진행률 p를 0~0.82 구간에 매핑하여 count = round(p/0.82 × N)로 출력 글자 수를 계산하고 textContent를 갱신한다. 커서는 CSS @keyframes 1초 blink — JS와 무관하게 깜빡이다가 p가 0.92를 넘으면 .off 클래스로 페이드 아웃되어 "입력이 끝났다"는 신호를 준다. min-height로 타이핑 중 레이아웃 점프를 방지.',
    kv: [
      { label: '의존성', value: 'Vanilla JS + CSS @keyframes (커서 블링크)' },
      { label: '트리거', value: '페이지 로드 → slice(0, count) 갱신' },
      { label: '타이핑 속도', value: '약 10자/초 (25자 ÷ 2.6s)' },
      { label: '커서', value: 'width 3px + blink 1s → p>0.92에서 fade out' },
      { label: '핵심', value: 'TEXT.slice(0, count) + 커서 .off 전환' },
      { label: '참고', value: '터미널 / ChatGPT 스트리밍 출력' }
    ],
    guide: '글자 수가 많으면 DURATION을 비례해 늘려 타속을 일정하게 유지(8~12자/초가 자연스러움). 줄바꿈 포함 문자열도 그대로 동작. 글자마다 ±30ms 랜덤 지연을 더하면 사람이 치는 느낌이 강해진다. 카피가 길면 핵심 1문장만 타이핑하고 나머지는 페이드 인 권장. 컨테이너 min-height 고정은 필수.',
    recommendations: [
      { place: '히어로 헤더', body: '인사형 헤드라인 — "안녕하세요"로 시작하는 대화형 카피' },
      { place: '랜딩 페이지', body: 'AI·챗봇 제품 — 스트리밍 답변 무드를 그대로 재현' },
      { place: '제품 섹션', body: '코드 에디터·터미널 데모 — 명령어가 입력되는 장면' },
      { place: '포트폴리오 소개', body: '자기소개 첫 문장 — 친근한 1인칭 인트로' }
    ],
    tradeoff: '읽기 속도가 타이핑 속도에 강제로 묶임 — 성격 급한 사용자에게는 답답할 수 있다. 문장이 길수록 이탈 위험이 커지므로 1~2문장 이내 권장.'
  },

  // ── 03. slot-roll ──
  {
    id: 'slot-roll', num: '03', title: '슬롯 롤링',
    summary: '글자마다 세로 글리프 스택이 슬롯머신처럼 위로 흐르다가 좌→우 stagger로 원본 글자에 정착. 릴이 감속하며 멈추는 손맛이 포인트.',
    demo: {
      bodyHTML: '<div class="slot-box">\n'
        + '  <p class="cap">SLOT ROLL — SETTLE</p>\n'
        + '  <h1 class="slot-wrap" aria-label="결과는 또렷하게"></h1>\n'
        + '</div>',
      css: '.slot-box { text-align: center; }\n'
        + '.slot-wrap { margin: 0; font: 800 clamp(38px,6.4vw,80px)/1 "Pretendard Variable",sans-serif; color: #fff; white-space: nowrap; }\n'
        + '.slot { display: inline-block; width: 1em; height: 1em; overflow: hidden; text-align: center; vertical-align: top; }\n'
        + '.slot-strip { display: block; will-change: transform; }\n'
        + '.slot-strip i { display: block; height: 1em; font-style: normal; color: rgba(255,255,255,0.38); }\n'
        + '.slot-strip i:last-child { color: #fff; }\n'
        + '.slot-space { display: inline-block; width: 0.45em; }\n'
        + CAP_CSS,
      js: 'var TEXT = "결과는 또렷하게";\n'
        + 'var GLYPHS = "ABCDEFGHJKMNPQRSTUVWXYZ245789#*";\n'
        + 'var wrap = document.querySelector(".slot-wrap");\n'
        + 'var strips = [];\n'
        + RND_JS + '\n'
        + 'var K = 7; // 스트립 칸 수 (랜덤 6 + 원본 1)\n'
        + 'TEXT.split("").forEach(function(ch, i) {\n'
        + '  if (ch === " ") {\n'
        + '    var sp = document.createElement("span");\n'
        + '    sp.className = "slot-space";\n'
        + '    wrap.appendChild(sp);\n'
        + '    return;\n'
        + '  }\n'
        + '  var slot = document.createElement("span");\n'
        + '  slot.className = "slot";\n'
        + '  var strip = document.createElement("span");\n'
        + '  strip.className = "slot-strip";\n'
        + '  var html = "";\n'
        + '  for (var k = 0; k < K - 1; k++) html += "<i>" + GLYPHS.charAt(Math.floor(rnd(i * 53 + k * 17) * GLYPHS.length)) + "</i>";\n'
        + '  html += "<i>" + ch + "</i>";\n'
        + '  strip.innerHTML = html;\n'
        + '  slot.appendChild(strip);\n'
        + '  wrap.appendChild(slot);\n'
        + '  strips.push(strip);\n'
        + '});\n'
        + 'function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }\n'
        + 'function applyReveal(p) {\n'
        + '  strips.forEach(function(strip, i) {\n'
        + '    var local = Math.max(0, Math.min(1, (p - i * 0.055) / 0.5));\n'
        + '    strip.style.transform = "translateY(" + (-easeOutCubic(local) * (K - 1)) + "em)";\n'
        + '  });\n'
        + '}',
      height: 480,
      duration: 2600
    },
    snippetHTML: '<h1 class="slot-wrap" aria-label="결과는 또렷하게"></h1>\n<!-- 슬롯/스트립은 JS가 빌드: .slot > .slot-strip > i × 7 -->',
    snippetCSS: '.slot {\n  display: inline-block;\n  width: 1em; height: 1em; overflow: hidden; /* 1글자 창 */\n}\n.slot-strip i { display: block; height: 1em; font-style: normal; }\n.slot-strip i:last-child { color: #fff; } /* 마지막 칸 = 원본 글자 */',
    snippetJS: 'var K = 7; // 랜덤 글리프 6 + 원본 1\nfunction easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }\nfunction applyReveal(p) {\n  strips.forEach(function(strip, i) {\n    var local = clamp01((p - i * 0.055) / 0.5);  // 글자별 stagger\n    strip.style.transform = "translateY(" + (-easeOutCubic(local) * (K - 1)) + "em)";\n  });\n}',
    explain: '각 글자는 height 1em + overflow:hidden 슬롯 안에 7칸짜리 세로 스트립(랜덤 글리프 6 + 원본 1)을 가진다. 글자별 local 진행률 = clamp((p − i×0.055)/0.5)에 easeOutCubic을 적용해 translateY를 0 → −6em으로 보간 — 처음엔 빠르게 돌다가 마지막 칸에 감속 착지한다. 스트립 마지막 칸이 항상 원본 글자라 어떤 진행률에서도 결과가 보장되고, em 단위 이동이라 폰트 크기를 바꿔도 그대로 동작한다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (스트립 빌드 + translateY 보간)' },
      { label: '트리거', value: '페이지 로드 → 글자별 stagger 0.055' },
      { label: '이징', value: 'easeOutCubic (1−(1−t)³) 감속 착지' },
      { label: '스트립', value: '7칸 (랜덤 6 + 원본 1) × 1em' },
      { label: '핵심', value: 'overflow:hidden 슬롯 + translateY(−6em)' },
      { label: '참고', value: '슬롯머신 릴 / 오도미터의 문자 버전' }
    ],
    guide: '스트립 칸 수(K)를 늘리면 더 오래 도는 느낌, 줄이면 가볍게. stagger 간격을 0으로 하면 전 글자 동시 착지 — 단어 단위 강조에 적합. 랜덤 글리프는 폭이 비슷한 영문 대문자·숫자로 제한해야 슬롯 폭이 흔들리지 않는다. line-height는 정확히 1로 고정하고, 슬롯 폭은 1em 고정 셀로 잡을 것.',
    recommendations: [
      { place: '히어로 헤더', body: '키워드 임팩트 — 핵심 단어 하나가 잭팟처럼 정착' },
      { place: '랜딩 페이지', body: '이벤트·프로모션 — 당첨 결과나 할인율 공개 연출' },
      { place: '제품 섹션', body: '숫자+단위 스펙 — 슬롯으로 돌아가다 멈추는 성능 수치' },
      { place: '포트폴리오 소개', body: '직함 공개 — Designer→Developer가 돌다가 멈추는 인트로' }
    ],
    tradeoff: '글자 수 × 7칸만큼 DOM이 늘어나 긴 문장에는 부적합(20자 이내 권장). 회전 중 모든 줄이 움직여 시선 부하가 큼 — 페이지당 1회만 사용할 것.'
  },

  // ── 04. flip-board ──
  {
    id: 'flip-board', num: '04', title: '플립보드',
    summary: '공항 출발 안내판의 스플릿 플랩. 타일이 rotateX로 덜컥덜컥 뒤집히며 글리프가 좌→우 연쇄로 확정된다.',
    demo: {
      bodyHTML: '<div class="flap-box">\n'
        + '  <p class="cap">SPLIT-FLAP — IL 2026 / GATE 04</p>\n'
        + '  <div class="flap-row" aria-label="지금 출발합니다"></div>\n'
        + '</div>',
      css: '.flap-box { text-align: center; }\n'
        + '.flap-row { display: flex; justify-content: center; gap: 8px; perspective: 800px; font: 800 clamp(30px,5vw,58px)/1 "Pretendard Variable",sans-serif; }\n'
        + '.flap-cell { width: 1.35em; height: 1.5em; display: flex; align-items: center; justify-content: center; background: #161616; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: rgba(255,255,255,0.6); position: relative; will-change: transform; }\n'
        + '.flap-cell::after { content: ""; position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: rgba(0,0,0,0.6); }\n'
        + '.flap-cell.on { color: #ffd23f; }\n'
        + '.flap-gap { width: 0.5em; }\n'
        + CAP_CSS,
      js: 'var TEXT = "지금 출발합니다";\n'
        + 'var POOL = "가나다라마바사아자차카타파하ABKXYZ0247";\n'
        + 'var row = document.querySelector(".flap-row");\n'
        + 'var cells = [];\n'
        + RND_JS + '\n'
        + 'var F = 4; // 글자당 플립 횟수\n'
        + 'TEXT.split("").forEach(function(ch, i) {\n'
        + '  if (ch === " ") {\n'
        + '    var g = document.createElement("span");\n'
        + '    g.className = "flap-gap";\n'
        + '    row.appendChild(g);\n'
        + '    return;\n'
        + '  }\n'
        + '  var c = document.createElement("span");\n'
        + '  c.className = "flap-cell";\n'
        + '  row.appendChild(c);\n'
        + '  var seq = [];\n'
        + '  for (var k = 0; k < F; k++) seq.push(POOL.charAt(Math.floor(rnd(i * 71 + k * 13) * POOL.length)));\n'
        + '  seq.push(ch);\n'
        + '  cells.push({ el: c, seq: seq });\n'
        + '});\n'
        + 'function applyReveal(p) {\n'
        + '  cells.forEach(function(cell, i) {\n'
        + '    var local = Math.max(0, Math.min(1, (p - i * 0.06) / 0.5));\n'
        + '    var t = local * F;\n'
        + '    var k = Math.min(F - 1, Math.floor(t));\n'
        + '    var frac = local >= 1 ? 1 : t - k;\n'
        + '    var angle, glyph;\n'
        + '    if (frac < 0.5) { angle = frac * 180; glyph = cell.seq[k]; }\n'
        + '    else { angle = (1 - frac) * 180; glyph = cell.seq[k + 1]; }\n'
        + '    cell.el.textContent = glyph;\n'
        + '    cell.el.style.transform = "rotateX(" + angle + "deg)";\n'
        + '    cell.el.classList.toggle("on", local >= 1);\n'
        + '  });\n'
        + '}',
      height: 480,
      duration: 3000
    },
    snippetHTML: '<div class="flap-row" aria-label="지금 출발합니다"></div>\n<!-- 타일 셀은 JS가 빌드: .flap-cell × 글자 수 -->',
    snippetCSS: '.flap-row { display: flex; gap: 8px; perspective: 800px; }\n.flap-cell {\n  width: 1.35em; height: 1.5em; /* 고정폭 타일 */\n  background: #161616; border-radius: 8px;\n  position: relative;\n}\n.flap-cell::after { /* 스플릿 플랩 분할선 */\n  content: ""; position: absolute; left: 0; right: 0;\n  top: 50%; height: 1px; background: rgba(0,0,0,0.6);\n}\n.flap-cell.on { color: #ffd23f; } /* 확정 = 앰버 */',
    snippetJS: 'var F = 4; // 플립 횟수 (랜덤 3 → 원본 확정)\nvar t = local * F;\nvar k = Math.min(F - 1, Math.floor(t));\nvar frac = t - k;\n// 전반: 이전 글리프가 0→90°로 접힘 / 후반: 다음 글리프가 90→0°로 펴짐\nif (frac < 0.5) { angle = frac * 180; glyph = seq[k]; }\nelse { angle = (1 - frac) * 180; glyph = seq[k + 1]; }\ncell.style.transform = "rotateX(" + angle + "deg)";',
    explain: '글자마다 글리프 시퀀스(랜덤 4 + 원본 1)를 만들고, local 진행률 × 4로 현재 플립 인덱스 k와 플립 내 진행 frac을 구한다. frac<0.5면 이전 글리프가 0→90°로 접히고, 이후엔 다음 글리프가 90→0°로 펴진다 — 한 번의 rotateX 왕복이 한 칸의 플랩 전환. perspective 800px과 타일 중앙의 가는 분할선(::after)이 물리적 보드 질감을 만들고, 확정된 타일은 앰버색(.on)으로 점등된다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (글리프 시퀀스 + rotateX 보간)' },
      { label: '트리거', value: '페이지 로드 → 글자별 stagger 0.06 연쇄' },
      { label: '플립 수', value: '글자당 4회 (랜덤 → 원본 확정)' },
      { label: '입체감', value: 'perspective 800px + 타일 분할선(::after)' },
      { label: '핵심', value: 'frac 0.5 경계에서 글리프 교체 + 각도 반전' },
      { label: '참고', value: '공항 Split-flap 안내판 / Vestaboard' }
    ],
    guide: '타일 폭은 고정(1.35em)이 필수 — 글자 폭에 따라 타일이 늘면 보드 느낌이 깨진다. 확정 글자에 앰버색을 주면 실제 안내판 무드가 산다. 플립 수는 4~6회가 한계 — 그 이상은 산만하다. 행 단위 정보(시간·게이트·상태)와 결합하면 설득력이 배가되며, 랜덤 풀에 한글 음절을 섞으면 한국 공항 보드 느낌이 난다.',
    recommendations: [
      { place: '히어로 헤더', body: '여행·모빌리티 서비스 — 목적지가 보드에 게시되는 인트로' },
      { place: '랜딩 페이지', body: '이벤트 일정 공개 — 날짜·장소가 플립으로 확정' },
      { place: '제품 섹션', body: '실시간 현황판 — 재고·운행 상태가 갱신되는 연출' },
      { place: '포트폴리오 소개', body: '경력 보드 — 연도·회사명이 차례로 게시' }
    ],
    tradeoff: '글자당 고정폭 타일이라 장문·비례폭 타이포에는 부적합. 다수 타일의 동시 rotateX는 저사양 기기에서 프레임 저하 가능 — 15자 이내 권장.'
  },

  // ── 05. rollup-hover ──
  {
    id: 'rollup-hover', num: '05', title: '글자 롤업 호버',
    summary: '메뉴 텍스트에 호버하면 글자들이 stagger로 위로 굴러 올라가며 아래 숨어 있던 액센트 색 글자로 교대. 내비게이션 시그니처 마이크로 인터랙션.',
    demo: {
      bodyHTML: '<div class="roll-box">\n'
        + '  <p class="cap">ROLL-UP — HOVER ME</p>\n'
        + '  <nav class="roll-stack">\n'
        + '    <a class="roll-item" data-text="프로젝트"></a>\n'
        + '    <a class="roll-item" data-text="스튜디오"></a>\n'
        + '    <a class="roll-item" data-text="컨택트"></a>\n'
        + '  </nav>\n'
        + '</div>',
      css: '.roll-box { text-align: center; }\n'
        + '.roll-stack { display: flex; flex-direction: column; align-items: center; gap: 10px; }\n'
        + '.roll-item { font: 800 clamp(36px,6vw,68px)/1.05 "Pretendard Variable",sans-serif; color: #fff; cursor: pointer; opacity: 0; }\n'
        + '.roll-char { display: inline-block; height: 1.05em; overflow: hidden; vertical-align: top; }\n'
        + '.roll-top, .roll-bot { display: block; height: 1.05em; transition: transform 360ms cubic-bezier(0.76, 0, 0.24, 1); }\n'
        + '.roll-bot { color: #8ab4ff; }\n'
        + '.roll-item.is-hover .roll-top, .roll-item.is-hover .roll-bot { transform: translateY(-100%); }\n'
        + CAP_CSS,
      js: 'var items = document.querySelectorAll(".roll-item");\n'
        + 'Array.prototype.forEach.call(items, function(item) {\n'
        + '  var text = item.dataset.text;\n'
        + '  text.split("").forEach(function(ch, i) {\n'
        + '    var c = document.createElement("span");\n'
        + '    c.className = "roll-char";\n'
        + '    var top = document.createElement("span");\n'
        + '    top.className = "roll-top";\n'
        + '    top.innerHTML = ch === " " ? "&nbsp;" : ch;\n'
        + '    var bot = document.createElement("span");\n'
        + '    bot.className = "roll-bot";\n'
        + '    bot.innerHTML = ch === " " ? "&nbsp;" : ch;\n'
        + '    top.style.transitionDelay = (i * 24) + "ms";\n'
        + '    bot.style.transitionDelay = (i * 24) + "ms";\n'
        + '    c.appendChild(top);\n'
        + '    c.appendChild(bot);\n'
        + '    item.appendChild(c);\n'
        + '  });\n'
        + '  item.addEventListener("mouseenter", function() { item.classList.add("is-hover"); });\n'
        + '  item.addEventListener("mouseleave", function() { item.classList.remove("is-hover"); });\n'
        + '});\n'
        + 'function applyReveal(p) {\n'
        + '  Array.prototype.forEach.call(items, function(item, i) {\n'
        + '    var local = Math.max(0, Math.min(1, (p - i * 0.15) / 0.5));\n'
        + '    item.style.opacity = local;\n'
        + '    item.style.transform = "translateY(" + (14 * (1 - local)) + "px)";\n'
        + '  });\n'
        + '}',
      height: 480,
      duration: 1200,
      hint: '메뉴에 마우스를 올려보세요'
    },
    snippetHTML: '<a class="roll-item" data-text="프로젝트"></a>\n<!-- JS 빌드 결과: .roll-char > .roll-top(흰색) + .roll-bot(액센트) -->',
    snippetCSS: '.roll-char { display: inline-block; height: 1.05em; overflow: hidden; }\n.roll-top, .roll-bot {\n  display: block; height: 1.05em;\n  transition: transform 360ms cubic-bezier(0.76, 0, 0.24, 1);\n}\n.roll-bot { color: #8ab4ff; } /* 아래층 = 액센트 색 */\n.roll-item.is-hover .roll-top,\n.roll-item.is-hover .roll-bot { transform: translateY(-100%); }',
    snippetJS: '// 글자별 transition-delay를 빌드 시점에 인라인으로\ntop.style.transitionDelay = (i * 24) + "ms";\nbot.style.transitionDelay = (i * 24) + "ms";\n// 호버는 클래스 토글 하나로\nitem.addEventListener("mouseenter", function() { item.classList.add("is-hover"); });\nitem.addEventListener("mouseleave", function() { item.classList.remove("is-hover"); });',
    explain: '각 글자를 overflow:hidden 셀(1.05em)로 감싸고 안에 흰색·액센트색 두 글리프를 세로로 쌓는다. 호버 시 .is-hover 클래스 하나만 토글 — 두 글리프가 함께 translateY(−100%)로 이동하는데, 글자별 transition-delay(i×24ms)가 빌드 시점에 인라인으로 박혀 있어 왼쪽부터 차례로 굴러 올라간다. 페이지 로드 타임라인은 메뉴 3개를 stagger 페이드로 등장시키는 인트로만 담당한다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (스팬 빌드) + CSS transition' },
      { label: '트리거', value: 'mouseenter/leave → .is-hover 클래스 토글' },
      { label: '이징', value: 'cubic-bezier(0.76,0,0.24,1) 360ms' },
      { label: 'stagger', value: '글자당 24ms transition-delay' },
      { label: '핵심', value: '2층 글리프 스택 + translateY(−100%)' },
      { label: '참고', value: 'Awwwards 수상작 내비게이션 단골 패턴' }
    ],
    guide: '클래스 토글 하나로 동작하므로 메뉴·버튼·푸터 링크 어디든 이식이 쉽다. delay 간격은 20~35ms가 적정 — 길면 굼뜨고 짧으면 한 덩어리로 보인다. 아래층 글리프 색을 브랜드 액센트로 지정해 "호버 = 브랜드 컬러" 규칙을 만들 것. 터치 기기에는 호버가 없으므로 :focus-visible에도 동일 효과를 연결해 키보드 사용자를 챙긴다.',
    recommendations: [
      { place: '히어로 헤더', body: 'CTA 링크 — "프로젝트 보기" 호버에 액센트 롤업' },
      { place: '랜딩 페이지', body: 'GNB 메뉴 — 전체 항목에 일괄 적용해 톤 통일' },
      { place: '제품 섹션', body: '카드 타이틀 — 카드 hover와 연동된 텍스트 교대' },
      { place: '포트폴리오 소개', body: '작업 목록 — 리스트 행 호버에 프로젝트명 롤업' }
    ],
    tradeoff: '호버 전용이라 모바일에서는 동작하지 않음 — 터치 환경은 진입 모션만 남는다. 글자 수가 많은 항목은 delay 누적으로 끝 글자 반응이 늦어짐(12자 이내 권장).'
  },

  // ── 06. glitch-flicker ──
  {
    id: 'glitch-flicker', num: '06', title: '글리치 플리커',
    summary: '빨강·시안 잔상 레이어가 clip-path 슬라이스로 찢어지며 타임라인의 3개 버스트 구간에서 번쩍이는 글리치. 마지막엔 깨끗하게 복원된다.',
    demo: {
      bodyHTML: '<div class="gl-box">\n'
        + '  <p class="cap">GLITCH — SIGNAL RESTORED</p>\n'
        + '  <div class="gl-stage">\n'
        + '    <h1 class="gl-base">신호를 복원했다</h1>\n'
        + '    <h1 class="gl-layer gl-r" aria-hidden="true">신호를 복원했다</h1>\n'
        + '    <h1 class="gl-layer gl-c" aria-hidden="true">신호를 복원했다</h1>\n'
        + '  </div>\n'
        + '</div>',
      css: '.gl-box { text-align: center; }\n'
        + '.gl-stage { position: relative; display: inline-block; }\n'
        + '.gl-stage h1 { margin: 0; font: 800 clamp(38px,6.4vw,80px)/1.2 "Pretendard Variable",sans-serif; color: #fff; white-space: nowrap; }\n'
        + '.gl-layer { position: absolute; inset: 0; opacity: 0; pointer-events: none; mix-blend-mode: screen; will-change: clip-path, transform; }\n'
        + '.gl-r { color: #ff3b5c; }\n'
        + '.gl-c { color: #22d3ee; }\n'
        + '.gl-stage.is-glitch .gl-base { transform: translateX(2px); }\n'
        + CAP_CSS,
      js: 'var stage = document.querySelector(".gl-stage");\n'
        + 'var layers = document.querySelectorAll(".gl-layer");\n'
        + 'var BURSTS = [[0.08, 0.2], [0.36, 0.48], [0.66, 0.8]];\n'
        + RND_JS + '\n'
        + 'function applyReveal(p) {\n'
        + '  var frame = Math.floor(p * 90);\n'
        + '  var active = false;\n'
        + '  for (var b = 0; b < BURSTS.length; b++) {\n'
        + '    if (p >= BURSTS[b][0] && p <= BURSTS[b][1]) active = true;\n'
        + '  }\n'
        + '  Array.prototype.forEach.call(layers, function(layer, li) {\n'
        + '    if (!active) {\n'
        + '      layer.style.opacity = 0;\n'
        + '      layer.style.clipPath = "inset(0 0 100% 0)";\n'
        + '      layer.style.transform = "none";\n'
        + '      return;\n'
        + '    }\n'
        + '    var top = Math.floor(rnd(frame * 3.7 + li * 57) * 80);\n'
        + '    var h = 6 + Math.floor(rnd(frame * 7.3 + li * 91) * 22);\n'
        + '    var dx = (rnd(frame * 5.1 + li * 13) - 0.5) * 18;\n'
        + '    layer.style.opacity = 1;\n'
        + '    layer.style.clipPath = "inset(" + top + "% 0 " + Math.max(0, 100 - top - h) + "% 0)";\n'
        + '    layer.style.transform = "translateX(" + dx + "px)";\n'
        + '  });\n'
        + '  stage.classList.toggle("is-glitch", active);\n'
        + '}',
      height: 480,
      duration: 3000
    },
    snippetHTML: '<div class="gl-stage">\n  <h1 class="gl-base">신호를 복원했다</h1>\n  <h1 class="gl-layer gl-r" aria-hidden="true">신호를 복원했다</h1>\n  <h1 class="gl-layer gl-c" aria-hidden="true">신호를 복원했다</h1>\n</div>',
    snippetCSS: '.gl-layer {\n  position: absolute; inset: 0;\n  opacity: 0; mix-blend-mode: screen;\n}\n.gl-r { color: #ff3b5c; } /* 빨강 잔상 */\n.gl-c { color: #22d3ee; } /* 시안 잔상 */',
    snippetJS: 'var BURSTS = [[0.08, 0.2], [0.36, 0.48], [0.66, 0.8]]; // 점멸 구간\nvar top = Math.floor(rnd(frame * 3.7 + li * 57) * 80);\nvar h = 6 + Math.floor(rnd(frame * 7.3 + li * 91) * 22);\nvar dx = (rnd(frame * 5.1 + li * 13) - 0.5) * 18;\nlayer.style.clipPath = "inset(" + top + "% 0 " + (100 - top - h) + "% 0)";\nlayer.style.transform = "translateX(" + dx + "px)";',
    explain: '본문 위에 절대배치된 2장의 컬러 레이어(빨강/시안)가 평소엔 opacity 0. 진행률이 버스트 구간(0.08~0.2, 0.36~0.48, 0.66~0.8)에 들어오면 프레임마다 시드 난수로 clip-path inset의 top·height와 translateX 오프셋을 다시 뽑아 가로 슬라이스가 어긋난 잔상을 만든다. 구간을 벗어나면 즉시 소등 — 점멸과 정적의 대비가 글리치 특유의 리듬을 만들고, 타임라인 끝에서는 완전히 깨끗한 원본으로 복원된다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (시드 난수 + clip-path 갱신)' },
      { label: '트리거', value: '타임라인 버스트 3구간에서만 활성' },
      { label: '슬라이스', value: 'inset 가로 띠 — 높이 6~28% 랜덤' },
      { label: '오프셋', value: 'translateX ±9px + 레이어별 독립 시드' },
      { label: '핵심', value: '버스트 게이트 + 프레임 단위 clip 재추첨' },
      { label: '참고', value: 'Codrops Glitch 이펙트 / 사이버펑크 타이틀' }
    ],
    guide: '버스트 구간을 좁히고 횟수를 줄일수록 고급스럽다 — 상시 글리치는 빠르게 피로해진다. 컬러 오프셋은 RGB 분리(빨강+시안)가 표준 문법. 광과민성 가이드(WCAG 2.3.1)상 초당 3회 이상 점멸은 위험하므로 버스트 길이·빈도를 반드시 제한하고, prefers-reduced-motion에서는 글리치를 통째로 비활성화할 것.',
    recommendations: [
      { place: '히어로 헤더', body: '테크·게임 브랜드 — 타이틀이 글리치 후 복원되는 인트로' },
      { place: '랜딩 페이지', body: '한정 드랍·티저 — 공개 직전의 불안정한 신호 연출' },
      { place: '제품 섹션', body: '보안·복구 제품 — "위협 → 복원" 서사를 시각화' },
      { place: '포트폴리오 소개', body: '크리에이티브 데브 — 실험적 무드의 이름 카드' }
    ],
    tradeoff: '점멸 효과라 광과민성 사용자에게 위험할 수 있음 — 점멸 빈도 제한과 reduced-motion 대응이 필수. 기업·금융 등 신뢰가 중요한 톤에는 부적합.'
  },

  // ── 07. wave-baseline ──
  {
    id: 'wave-baseline', num: '07', title: '웨이브 베이스라인',
    summary: '글자들이 sin 위상차로 베이스라인 위아래를 출렁이다가, 진행될수록 진폭이 감쇠하며 잔잔하게 정렬되는 파도 타이포.',
    demo: {
      bodyHTML: '<div class="wave-box">\n'
        + '  <p class="cap">WAVE BASELINE — CALM DOWN</p>\n'
        + '  <h1 class="wave-line" aria-label="물결처럼 일렁이다 가라앉는다"></h1>\n'
        + '</div>',
      css: '.wave-box { text-align: center; }\n'
        + '.wave-line { margin: 0; font: 800 clamp(28px,4.6vw,58px)/1.3 "Pretendard Variable",sans-serif; color: #fff; white-space: nowrap; }\n'
        + '.wave-char { display: inline-block; will-change: transform, opacity; }\n'
        + CAP_CSS,
      js: 'var TEXT = "물결처럼 일렁이다 가라앉는다";\n'
        + 'var line = document.querySelector(".wave-line");\n'
        + 'var spans = [];\n'
        + 'TEXT.split("").forEach(function(ch) {\n'
        + '  var s = document.createElement("span");\n'
        + '  s.className = "wave-char";\n'
        + '  s.innerHTML = ch === " " ? "&nbsp;" : ch;\n'
        + '  line.appendChild(s);\n'
        + '  spans.push(s);\n'
        + '});\n'
        + 'function easeOutQuad(t) { return 1 - (1 - t) * (1 - t); }\n'
        + 'function applyReveal(p) {\n'
        + '  var phase = p * Math.PI * 7;\n'
        + '  var damp = 1 - easeOutQuad(p);\n'
        + '  spans.forEach(function(s, i) {\n'
        + '    var o = Math.max(0, Math.min(1, p * 6 - i * 0.18));\n'
        + '    var y = Math.sin(phase - i * 0.55) * 26 * damp;\n'
        + '    s.style.opacity = o;\n'
        + '    s.style.transform = "translateY(" + y + "px)";\n'
        + '  });\n'
        + '}',
      height: 480,
      duration: 3600
    },
    snippetHTML: '<h1 class="wave-line" aria-label="물결처럼 일렁이다 가라앉는다"></h1>\n<!-- 글자 span은 JS가 빌드 -->',
    snippetCSS: '.wave-char {\n  display: inline-block;\n  will-change: transform, opacity;\n}',
    snippetJS: 'function applyReveal(p) {\n  var phase = p * Math.PI * 7;          // 흐르는 위상\n  var damp = 1 - easeOutQuad(p);        // 진폭 감쇠 1→0\n  spans.forEach(function(s, i) {\n    var y = Math.sin(phase - i * 0.55) * 26 * damp;\n    s.style.opacity = clamp01(p * 6 - i * 0.18); // 순차 페이드 인\n    s.style.transform = "translateY(" + y + "px)";\n  });\n}',
    explain: '글자 i의 Y 오프셋 = sin(위상 − i×0.55) × 진폭. 위상은 p×7π로 흐르고 진폭은 26px × (1 − easeOutQuad(p))로 감쇠 — 시작은 큰 파도, 끝은 수면처럼 0으로 수렴한다. 글자별 위상차(0.55rad)가 옆 글자로 전달되는 파동을 만들고, 진입 초반에는 opacity도 글자 순서대로 페이드 인되어 파도가 왼쪽에서 밀려오는 인상을 준다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (sin 위상 + 감쇠 보간)' },
      { label: '트리거', value: '페이지 로드 → 위상 p×7π 진행 (3.6s)' },
      { label: '진폭', value: '26px → 0 (easeOutQuad 감쇠)' },
      { label: '위상차', value: '글자당 0.55rad — 파장 약 11자' },
      { label: '핵심', value: 'sin(phase − i×δ) × amp × (1−p)' },
      { label: '참고', value: '수면 파동 / 음악 비주얼라이저' }
    ],
    guide: '위상차를 키우면 파장이 짧아져 촘촘한 물결, 줄이면 천천히 너울거린다. 진폭은 폰트 크기의 30~40%가 적정 — 그 이상은 윗줄과 충돌한다. 감쇠 없이 무한 루프를 돌리면 장식적이지만 가독성을 계속 해치므로, 헤드라인 진입 1회 + 정착 모델을 권장. will-change: transform으로 합성 레이어를 미리 확보할 것.',
    recommendations: [
      { place: '히어로 헤더', body: '리퀴드·웰니스 브랜드 — 부드러운 물결 인트로' },
      { place: '랜딩 페이지', body: '음악·오디오 섹션 — 파형 메타포와 자연스럽게 연결' },
      { place: '제품 섹션', body: '유동성 강조 — 음료·뷰티 제품의 흐르는 무드' },
      { place: '포트폴리오 소개', body: '감성 타이틀 — 이름이 출렁이다 안착하는 오프닝' }
    ],
    tradeoff: '출렁이는 동안 가독성이 떨어지므로 짧은 헤드라인 전용. 매 프레임 전 글자 transform 갱신이라 글자 수가 많으면 부하 — 30자 이내 권장.'
  },

  // ── 08. word-rotator ──
  {
    id: 'word-rotator', num: '08', title: '단어 로테이터',
    summary: '문장 속 키워드 자리만 마스크로 뚫어 4개 단어가 위로 순환 교체. 문장은 고정한 채 의미만 갈아 끼우는 히어로 단골 패턴.',
    demo: {
      bodyHTML: '<div class="rot-box">\n'
        + '  <p class="cap">WORD ROTATOR — LOOP</p>\n'
        + '  <h1 class="rot-line">우리는 <span class="rot-mask"><span class="rot-inner"></span></span>을 설계합니다</h1>\n'
        + '</div>',
      css: '.rot-box { text-align: center; }\n'
        + '.rot-line { margin: 0; font: 800 clamp(30px,5vw,60px)/1.3 "Pretendard Variable",sans-serif; color: #fff; white-space: nowrap; }\n'
        + '.rot-mask { display: inline-block; height: 1.15em; overflow: hidden; vertical-align: bottom; text-align: left; }\n'
        + '.rot-inner { display: block; will-change: transform; }\n'
        + '.rot-word { display: block; height: 1.15em; line-height: 1.15; color: #8ab4ff; }\n'
        + CAP_CSS,
      js: 'var WORDS = ["경험", "모션", "감동", "흐름"];\n'
        + 'var mask = document.querySelector(".rot-mask");\n'
        + 'var inner = document.querySelector(".rot-inner");\n'
        + 'WORDS.concat([WORDS[0]]).forEach(function(w) {\n'
        + '  var s = document.createElement("span");\n'
        + '  s.className = "rot-word";\n'
        + '  s.textContent = w;\n'
        + '  inner.appendChild(s);\n'
        + '});\n'
        + '// 마스크 폭 = 가장 긴 단어 폭으로 고정 (문장 들썩임 방지)\n'
        + 'var maxW = 0;\n'
        + 'Array.prototype.forEach.call(inner.children, function(c) { maxW = Math.max(maxW, c.offsetWidth); });\n'
        + 'mask.style.width = maxW + "px";\n'
        + 'var N = WORDS.length;\n'
        + 'function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }\n'
        + 'function applyReveal(p) {\n'
        + '  var seg = Math.min(N - 0.0001, p * N);\n'
        + '  var idx = Math.floor(seg);\n'
        + '  var segP = seg - idx;\n'
        + '  var slide = segP < 0.7 ? 0 : easeInOutCubic((segP - 0.7) / 0.3);\n'
        + '  inner.style.transform = "translateY(" + (-(idx + slide) * 1.15) + "em)";\n'
        + '}',
      height: 480,
      duration: 6400,
      loop: true,
      hint: '자동 루프 재생'
    },
    snippetHTML: '<h1>우리는\n  <span class="rot-mask"><span class="rot-inner">\n    <!-- JS가 단어 4개 + 첫 단어 클론을 쌓음 -->\n  </span></span>을 설계합니다\n</h1>',
    snippetCSS: '.rot-mask {\n  display: inline-block;\n  height: 1.15em; overflow: hidden;\n  vertical-align: bottom;\n}\n.rot-word { display: block; height: 1.15em; line-height: 1.15; color: #8ab4ff; }',
    snippetJS: 'var seg = Math.min(N - 0.0001, p * N); // 세그먼트 4개\nvar idx = Math.floor(seg);\nvar segP = seg - idx;\n// 세그먼트의 70%는 정지, 마지막 30%에 한 칸 슬라이드\nvar slide = segP < 0.7 ? 0 : easeInOutCubic((segP - 0.7) / 0.3);\ninner.style.transform = "translateY(" + (-(idx + slide) * 1.15) + "em)";\n// 마지막 칸 = 첫 단어 클론 → p가 1에서 0으로 리셋돼도 이음새 없음',
    explain: '마스크(height 1.15em, overflow:hidden) 안에 단어 4개 + 첫 단어 복제 1개를 세로로 쌓는다. 타임라인을 4세그먼트로 나눠 각 세그먼트의 70%는 정지, 마지막 30%에 easeInOutCubic으로 translateY를 한 칸(−1.15em) 내린다. 마지막 세그먼트가 복제된 첫 단어에 도착한 순간 루프가 0으로 리셋되므로 이음새 없이 무한 순환한다. 마스크 폭은 가장 긴 단어 기준으로 JS가 고정해 문장 레이아웃이 흔들리지 않는다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (세그먼트 타임라인 + 클론 루프)' },
      { label: '트리거', value: '페이지 로드 → 6.4s 사이클 무한 루프' },
      { label: '리듬', value: '단어당 정지 70% + 전환 30% (1.6s 주기)' },
      { label: '이징', value: 'easeInOutCubic — 양끝 감속 슬라이드' },
      { label: '핵심', value: '첫 단어 클론 + 루프 리셋으로 이음새 제거' },
      { label: '참고', value: 'Stripe·Linear 히어로 "for ___" 로테이터' }
    ],
    guide: '단어는 3~5개, 의미 위계가 같은 명사로 통일할 것. 한국어는 조사가 단어에 따라 달라지므로(을/를) 받침 여부가 같은 단어로 맞추거나 조사를 단어 안에 포함시킨다. 정지 시간이 곧 읽기 시간 — 단어당 최소 1초는 머물게 한다. 마스크 폭 고정은 필수, 아니면 매 전환마다 문장이 들썩인다.',
    recommendations: [
      { place: '히어로 헤더', body: '가치 제안 — "우리는 ___을 설계합니다" 키워드 순환' },
      { place: '랜딩 페이지', body: '타깃 고객 열거 — 스타트업/에이전시/브랜드 교체' },
      { place: '제품 섹션', body: '활용 시나리오 — 하나의 제품, 여러 용도 제시' },
      { place: '포트폴리오 소개', body: '역할 소개 — 디자이너/개발자/디렉터 순환' }
    ],
    tradeoff: '무한 루프 모션은 전정 장애·주의력 분산에 민감한 사용자에게 부담 — prefers-reduced-motion에서 첫 단어 고정 권장. 단어 폭 편차가 크면 고정 마스크에 여백이 떠 어색해진다.'
  },

  // ── 09. erase-rewrite ──
  {
    id: 'erase-rewrite', num: '09', title: '지우고 다시 쓰기',
    summary: '문장을 타이핑하고 잠시 보여준 뒤 백스페이스로 지우고 다른 문장을 다시 쓰는 루프. 두 문장의 대조가 메시지를 만든다.',
    demo: {
      bodyHTML: '<div class="er-box">\n'
        + '  <p class="cap">ERASE &amp; REWRITE — LOOP</p>\n'
        + '  <h1 class="er-line"><span class="er-text"></span><span class="er-cursor"></span></h1>\n'
        + '</div>',
      css: '.er-box { text-align: center; width: min(86vw, 820px); }\n'
        + '.er-line { margin: 0; font: 700 clamp(26px,4.2vw,48px)/1.45 "Pretendard Variable",sans-serif; color: #fff; min-height: 1.45em; }\n'
        + '.er-cursor { display: inline-block; width: 3px; height: 1em; background: #8ab4ff; margin-left: 5px; vertical-align: -0.12em; animation: blink 1s infinite; }\n'
        + '@keyframes blink { 0%, 45% { opacity: 1; } 50%, 95% { opacity: 0; } 100% { opacity: 1; } }\n'
        + CAP_CSS,
      js: 'var PHRASES = ["디자인은 언어다.", "모션은 그 언어의 억양이다."];\n'
        + 'var textEl = document.querySelector(".er-text");\n'
        + '// [동작, 문구 인덱스, 시작 p, 끝 p]\n'
        + 'var SEGS = [\n'
        + '  ["type", 0, 0.00, 0.20],\n'
        + '  ["hold", 0, 0.20, 0.34],\n'
        + '  ["erase", 0, 0.34, 0.44],\n'
        + '  ["type", 1, 0.44, 0.66],\n'
        + '  ["hold", 1, 0.66, 0.84],\n'
        + '  ["erase", 1, 0.84, 0.94],\n'
        + '  ["blank", 0, 0.94, 1.00]\n'
        + '];\n'
        + 'function applyReveal(p) {\n'
        + '  for (var i = 0; i < SEGS.length; i++) {\n'
        + '    var s = SEGS[i];\n'
        + '    if (p <= s[3] || i === SEGS.length - 1) {\n'
        + '      var phrase = PHRASES[s[1]];\n'
        + '      var segP = Math.max(0, Math.min(1, (p - s[2]) / (s[3] - s[2])));\n'
        + '      var count;\n'
        + '      if (s[0] === "type") count = Math.round(segP * phrase.length);\n'
        + '      else if (s[0] === "hold") count = phrase.length;\n'
        + '      else if (s[0] === "erase") count = Math.round((1 - segP) * phrase.length);\n'
        + '      else count = 0;\n'
        + '      textEl.textContent = phrase.slice(0, count);\n'
        + '      return;\n'
        + '    }\n'
        + '  }\n'
        + '}',
      height: 480,
      duration: 8000,
      loop: true,
      hint: '자동 루프 재생'
    },
    snippetHTML: '<h1 class="er-line">\n  <span class="er-text"></span>\n  <span class="er-cursor"></span>\n</h1>',
    snippetCSS: '.er-line { min-height: 1.45em; } /* 지우는 동안 레이아웃 고정 */\n.er-cursor {\n  display: inline-block; width: 3px; height: 1em;\n  background: #8ab4ff; animation: blink 1s infinite;\n}',
    snippetJS: '// 한 사이클 = type → hold → erase → type → hold → erase → blank\nvar SEGS = [\n  ["type", 0, 0.00, 0.20], ["hold", 0, 0.20, 0.34], ["erase", 0, 0.34, 0.44],\n  ["type", 1, 0.44, 0.66], ["hold", 1, 0.66, 0.84], ["erase", 1, 0.84, 0.94],\n  ["blank", 0, 0.94, 1.00]\n];\n// type: segP×N자 출력 / erase: (1−segP)×N자 — 같은 slice 메커니즘\ntextEl.textContent = phrase.slice(0, count);',
    explain: '한 사이클을 7개 세그먼트(type→hold→erase→type→hold→erase→blank)로 나누고 각 세그먼트에 진행률 구간을 할당한다. type은 segP×N, erase는 (1−segP)×N으로 slice 길이를 계산 — 같은 slice 메커니즘으로 쓰기와 지우기를 모두 처리한다. 지우는 속도를 쓰는 속도의 약 2배로 잡아 "교정하는 손"의 리듬을 재현하고, 사이클이 끝나면 루프가 0으로 리셋되어 무한 반복된다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (세그먼트 테이블 + slice)' },
      { label: '트리거', value: '페이지 로드 → 8s 사이클 무한 루프' },
      { label: '리듬', value: 'type 1.6s · hold 1.4s · erase 0.8s (2배속 삭제)' },
      { label: '세그먼트', value: '7개 (type/hold/erase ×2 + blank)' },
      { label: '핵심', value: '세그먼트 테이블 순회 + slice(0, count)' },
      { label: '참고', value: 'Typed.js 류 타이핑 히어로 라이브러리' }
    ],
    guide: '문장은 2~3개, 길이를 비슷하게 맞춰야 리듬이 고르다. hold 구간이 실제 읽는 시간이므로 글자 수 × 80ms 이상 확보할 것. 줄바꿈을 막으려면 컨테이너에 min-height를 고정한다. 두 문장이 "전제 → 반전" 구조일 때 가장 효과적이며, 핵심 카피는 반드시 첫 문장에 배치한다.',
    recommendations: [
      { place: '히어로 헤더', body: '메시지 반전 — "디자인은 언어다 → 모션은 억양이다"' },
      { place: '랜딩 페이지', body: '가치 제안 순환 — 여러 카피를 한 자리에서 테스트' },
      { place: '제품 섹션', body: '사용 예시 순환 — 검색창에 다양한 쿼리가 입력되는 장면' },
      { place: '포트폴리오 소개', body: '다면적 소개 — 여러 문장으로 자신을 정의' }
    ],
    tradeoff: '한 사이클이 길어(8초) 사용자가 두 번째 문장을 못 보고 스크롤로 지나칠 수 있음. 핵심 카피는 첫 문장에 배치하고 사이클을 2문장 이내로 유지할 것.'
  },

  // ── 10. number-decode ──
  {
    id: 'number-decode', num: '10', title: '숫자 디코드',
    summary: '통계 수치가 숫자·기호 글리프 노이즈에서 좌→우로 해독되어 12,840,000으로 확정. 스크램블과 카운터의 교집합.',
    demo: {
      bodyHTML: '<div class="nd-wrap">\n'
        + '  <p class="cap">NUMBER DECODE — STAT</p>\n'
        + '  <div class="nd-row"><span class="nd-value" aria-label="12,840,000"></span><span class="nd-suffix">+</span></div>\n'
        + '  <p class="nd-label">월간 인터랙션 이벤트</p>\n'
        + '</div>',
      css: '.nd-wrap { text-align: center; }\n'
        + '.nd-row { display: flex; align-items: baseline; justify-content: center; gap: 6px; font: 800 clamp(44px,7.4vw,104px)/1 "Pretendard Variable",sans-serif; }\n'
        + '.nd-char { display: inline-block; width: 1ch; text-align: center; color: rgba(255,255,255,0.35); font-variant-numeric: tabular-nums; }\n'
        + '.nd-char.on { color: #fff; }\n'
        + '.nd-comma { width: 0.55ch; }\n'
        + '.nd-suffix { font-size: 0.45em; color: #8ab4ff; opacity: 0; }\n'
        + '.nd-label { font: 400 clamp(13px,1.1vw,17px)/1.4 "Pretendard Variable",sans-serif; color: rgba(255,255,255,0.3); margin-top: 18px; letter-spacing: 0.1em; text-transform: uppercase; }\n'
        + CAP_CSS,
      js: 'var FINAL = "12,840,000";\n'
        + 'var POOL = "0123456789#%$&";\n'
        + 'var line = document.querySelector(".nd-value");\n'
        + 'var suffix = document.querySelector(".nd-suffix");\n'
        + 'var spans = [];\n'
        + 'FINAL.split("").forEach(function(ch) {\n'
        + '  var s = document.createElement("span");\n'
        + '  s.className = ch === "," ? "nd-char nd-comma" : "nd-char";\n'
        + '  s.dataset.ch = ch;\n'
        + '  s.textContent = ch === "," ? "," : "0";\n'
        + '  line.appendChild(s);\n'
        + '  spans.push(s);\n'
        + '});\n'
        + RND_JS + '\n'
        + 'function applyReveal(p) {\n'
        + '  var frame = Math.floor(p * 50);\n'
        + '  var N = spans.length;\n'
        + '  spans.forEach(function(s, i) {\n'
        + '    var lockP = 0.08 + (i / N) * 0.74;\n'
        + '    if (p >= lockP) {\n'
        + '      s.textContent = s.dataset.ch;\n'
        + '      s.classList.add("on");\n'
        + '    } else {\n'
        + '      s.classList.remove("on");\n'
        + '      s.textContent = s.dataset.ch === "," ? "," : POOL.charAt(Math.floor(rnd(i * 37 + Math.floor(frame / 2) * 11) * POOL.length));\n'
        + '    }\n'
        + '  });\n'
        + '  suffix.style.opacity = Math.max(0, Math.min(1, (p - 0.88) / 0.12));\n'
        + '}',
      height: 480,
      duration: 2600
    },
    snippetHTML: '<div class="nd-row">\n  <span class="nd-value" aria-label="12,840,000"></span>\n  <span class="nd-suffix">+</span>\n</div>\n<p class="nd-label">월간 인터랙션 이벤트</p>',
    snippetCSS: '.nd-char {\n  display: inline-block;\n  width: 1ch; text-align: center; /* 회전 중 폭 고정 */\n  font-variant-numeric: tabular-nums;\n  color: rgba(255,255,255,0.35);\n}\n.nd-char.on { color: #fff; }\n.nd-comma { width: 0.55ch; } /* 콤마는 처음부터 고정 */',
    snippetJS: 'var POOL = "0123456789#%$&"; // 숫자 + 기호 혼합 풀\nspans.forEach(function(s, i) {\n  var lockP = 0.08 + (i / N) * 0.74; // 큰 자리(왼쪽)부터 확정\n  if (p >= lockP) { s.textContent = s.dataset.ch; s.classList.add("on"); }\n  else if (s.dataset.ch !== ",")\n    s.textContent = POOL.charAt(Math.floor(rnd(i*37 + Math.floor(frame/2)*11) * POOL.length));\n});\nsuffix.style.opacity = clamp01((p - 0.88) / 0.12); // 마지막에 + 페이드 인',
    explain: '최종 문자열 "12,840,000"을 자리별 span으로 분해 — 콤마는 처음부터 고정하고 숫자 자리만 글리프 풀(0~9·#·%·$·&)에서 의사난수로 회전시킨다. 자리마다 lockP = 0.08 + (i/N)×0.74로 좌측 큰 자리부터 확정되어 "큰 단위부터 윤곽이 잡히는" 카운터 체감을 만들고, 전부 확정된 뒤 끝에서 + 접미사가 페이드 인된다. 모든 자리는 1ch 고정폭이라 회전 중에도 레이아웃이 흔들리지 않는다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (자리별 lockP + 시드 난수)' },
      { label: '트리거', value: '페이지 로드 → 좌→우 자리 확정 (2.6s)' },
      { label: '글리프 풀', value: '숫자 0~9 + 기호 #%$& 14종' },
      { label: '잠금', value: 'lockP = 0.08 + i/N×0.74 / 접미사 0.88~1' },
      { label: '핵심', value: '1ch 고정폭 + 콤마 고정 + 자리별 해독' },
      { label: '참고', value: '스크램블 디코드의 숫자 특화 변형' }
    ],
    guide: '연출 의도가 "정확한 최종값 공개"이므로 표시 수치는 실제 데이터와 일치시킬 것. tabular-nums와 1ch 고정폭은 필수 — 없으면 회전 중 콤마 위치가 출렁인다. 일반 카운트업(점진 증가)과 달리 중간값이 무의미한 노이즈이므로, "누적량이 늘어나는" 서사보다 "결과가 판독되는" 서사에 맞다. aria-label로 최종값을 고정 제공할 것.',
    recommendations: [
      { place: '히어로 헤더', body: '핵심 지표 공개 — 월간 처리량·누적 사용자 빅넘버' },
      { place: '랜딩 페이지', body: '소셜 프루프 — 통계 여러 개 중 대표 1종에만 적용' },
      { place: '제품 섹션', body: '벤치마크 결과 — 측정이 끝나고 수치가 판독되는 연출' },
      { place: '포트폴리오 소개', body: '임팩트 수치 — 조회수·다운로드 등 성과 강조' }
    ],
    tradeoff: '해독 중에는 수치를 읽을 수 없어 비교·스캔 용도에는 부적합. 여러 통계에 동시 적용하면 노이즈가 과해짐 — 대표 수치 1개에만 사용할 것.'
  }
];

/* ================================================================
   Standalone demo HTML 빌더 (auto-play on load + ↻ 다시 보기)
   ================================================================ */

function buildDemoHTML(p) {
  var dur = p.demo.duration || 2600;
  var loop = p.demo.loop ? 'true' : 'false';
  var hint = p.demo.hint || '자동 재생 · ↻ 다시 보기';
  return '<!DOCTYPE html>\n'
    + '<html lang="ko">\n'
    + '<head>\n'
    + '  <meta charset="UTF-8">\n'
    + '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
    + '  <title>' + p.num + '. ' + p.title + ' — Text Scramble Demo</title>\n'
    + '  <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable-dynamic-subset.min.css" rel="stylesheet">\n'
    + '  <style>\n'
    + '    * { box-sizing: border-box; }\n'
    + '    html, body { margin: 0; padding: 0; }\n'
    + '    body { background: #000; color: #fff; font-family: "Pretendard Variable","Pretendard",sans-serif; -webkit-font-smoothing: antialiased; }\n'
    + '    .demo-controls { position: fixed; top: 16px; left: 16px; display: inline-flex; align-items: center; gap: 10px; z-index: 100; }\n'
    + '    .demo-reset { font: 600 11px/1 "Pretendard Variable","Pretendard",sans-serif; color: rgba(255,255,255,0.45); background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1); border-radius: 999px; padding: 8px 14px; cursor: pointer; transition: color 160ms, background 160ms; }\n'
    + '    .demo-reset:hover { color: #fff; background: rgba(255,255,255,0.15); }\n'
    + '    .demo-label { font: 500 10px/1 "Pretendard Variable","Pretendard",sans-serif; color: rgba(255,255,255,0.35); letter-spacing: 0.14em; text-transform: uppercase; }\n'
    + '    .demo-hint { position: fixed; right: 16px; bottom: 24px; font: 500 10px/1 "Pretendard Variable","Pretendard",sans-serif; color: rgba(255,255,255,0.3); letter-spacing: 0.12em; z-index: 100; }\n'
    + '    .demo-progress { position: fixed; bottom: 0; left: 0; right: 0; height: 2px; background: rgba(255,255,255,0.06); z-index: 100; }\n'
    + '    .demo-progress > div { height: 100%; background: #fff; width: 0; }\n'
    + '    .showcase { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden; }\n'
    + '    ' + p.demo.css.replace(/\n/g, '\n    ') + '\n'
    + '  </style>\n'
    + '</head>\n'
    + '<body>\n'
    + '  <div class="demo-controls">\n'
    + '    <button class="demo-reset" type="button" onclick="window.__reset && window.__reset()">↻ 다시 보기</button>\n'
    + '    <span class="demo-label">' + p.num + ' · ' + p.title + '</span>\n'
    + '  </div>\n'
    + '  <div class="demo-hint">' + hint + '</div>\n'
    + '  <div class="demo-progress"><div></div></div>\n'
    + '\n'
    + '  <main class="showcase">\n'
    + '    ' + p.demo.bodyHTML.replace(/\n/g, '\n    ') + '\n'
    + '  </main>\n'
    + '\n'
    + '  <script>\n'
    + '    (function(){\n'
    + '      var progressFill = document.querySelector(".demo-progress > div");\n'
    + '      var DURATION = ' + dur + ';\n'
    + '      var LOOP = ' + loop + ';\n'
    + '      var startTime = Date.now();\n'
    + '      var running = true;\n'
    + '      ' + CLAMP_JS + '\n'
    + '      ' + p.demo.js.replace(/\n/g, '\n      ') + '\n'
    + '      function tick() {\n'
    + '        var elapsed = Date.now() - startTime;\n'
    + '        var p = Math.min(1, elapsed / DURATION);\n'
    + '        progressFill.style.width = (p * 100) + "%";\n'
    + '        applyReveal(p);\n'
    + '        if (p < 1) setTimeout(tick, 16);\n'
    + '        else if (LOOP) { startTime = Date.now(); setTimeout(tick, 16); }\n'
    + '        else running = false;\n'
    + '      }\n'
    + '      setTimeout(tick, 16);\n'
    + '      window.__reset = function(){\n'
    + '        startTime = Date.now();\n'
    + '        applyReveal(0);\n'
    + '        if (!running) { running = true; setTimeout(tick, 16); }\n'
    + '      };\n'
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
        embed: 'demos/text-scramble/' + p.id + '.html',
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
      { type: 'heading', value: '스크램블 텍스트 — 글리프가 해독되는 10종 키네틱 타이포' },
      { type: 'text', value: CATEGORY.summary },
      { type: 'heading', value: '10 패턴 인덱스' },
      { type: 'structure', items: indexItems },
      { type: 'heading', value: '공통 디자인 토큰' },
      {
        type: 'kv', columns: 2, items: [
          { label: '폰트', value: 'Pretendard Variable 700~800' },
          { label: '헤드라인 크기', value: 'clamp(26px, 5vw, 80px) — 반응형' },
          { label: '글리프 풀', value: '영문 대문자·숫자·기호 (한국어 본문 해독)' },
          { label: '배경', value: '#000 (검정)' },
          { label: '텍스트 색', value: '#fff 확정 / rgba(255,255,255,0.3) 회전·보조' },
          { label: '액센트', value: '#8ab4ff (롤업·로테이터) / #ffd23f (플립보드)' },
          { label: '애니메이션 모델', value: 'Date.now() 타이머 진행률 0→1 자동 재생 + 루프/호버 변형' },
          { label: '난수', value: 'Math.sin 시드 의사난수 — 결정적 재생 보장' }
        ]
      },
      { type: 'heading', value: '읽기 가이드' },
      {
        type: 'structure', items: [
          { label: '라이브 데모', tag: 'IFRAME', desc: 'demos/text-scramble/{pattern}.html — 로드 자동 재생 + ↻ 다시 보기' },
          { label: '작동 원리', tag: 'HOW', desc: '타이머 progress 0→1 → 글자별 lockP/세그먼트 매핑 → 글리프 갱신' },
          { label: '정량 메타', tag: 'KV', desc: '의존성 / 트리거 / 이징·리듬 / 글리프 풀 / 핵심 메커니즘' },
          { label: '코드 스니펫', tag: 'CODE', desc: 'HTML / CSS / JS — 패턴별 핵심 코드' },
          { label: '사용 가이드', tag: 'GUIDE', desc: '파라미터·접근성·한국어 조사 처리 등 주의점' },
          { label: '활용 추천', tag: 'PLACES', desc: '히어로 / 랜딩 / 제품 / 포트폴리오 4건' },
          { label: '트레이드오프', tag: 'NOTE', desc: '가독성 지연·점멸 위험·권장 사용처' }
        ]
      },
      {
        type: 'note',
        value: 'Codrops 시그니처 스크램블 디코드(랜덤 글리프 → 좌→우 해독)를 첫 패턴으로 재현하고, 타자기·슬롯 롤링·플립보드·롤업 호버·글리치·웨이브·단어 로테이터·지우고 다시 쓰기·숫자 디코드 9종 변형을 비교 카탈로그로 정리. 모든 데모는 검정 배경(#000) + Pretendard Variable + 한국어 헤드라인 + 페이지 로드 자동 재생(↻ 다시 보기), 05 롤업 호버만 hover 트리거 + 08/09는 무한 루프.'
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
    console.log('✓ demos/text-scramble/' + p.id + '.html');
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
  console.log('✓ analyses/text-scramble/analysis.json');
  console.log('  ' + PATTERNS.length + ' patterns + 1 overview = ' + (PATTERNS.length + 1) + ' sections');
  var totalBlocks = Object.values(sections).reduce(function (acc, s) { return acc + s.blocks.length; }, 0);
  console.log('  ' + totalBlocks + ' blocks total');
}

main();
