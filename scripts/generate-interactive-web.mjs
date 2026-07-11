#!/usr/bin/env node
/**
 * Interaction Lab — Web Category Generator: 인터랙티브 웹 (섹션 인터랙티브 요소)
 *
 * 컴포넌트 단위가 아닌 "실제 웹페이지의 한 섹션 전체를 구성하는 인터랙티브 요소" 10종 ×
 * 연출 변형 예시 3개 = standalone 데모 30개. 한국 실사이트 6곳(daehanfeed / doodoorim /
 * nifco / syfund / ildongcare / amnesty) 실측 기반.
 *
 * - references[].type = 'web' (인터랙션 카탈로그와 별도 그룹)
 * - 자동 재생 금지: 모든 모션은 스크롤 진행률(0~1) 또는 호버/클릭 입력에 1:1 매핑
 * - 스크롤형(23): .scroll-track + .sticky-stage + progress → applyReveal(p)
 * - 입력형(7): .stage + 이벤트 리스너 + window.__reset
 * - 외부 의존성은 Pretendard CDN 1개. 사진/비디오 대신 CSS 그라디언트·SVG
 * - 데모 콘텐츠는 가상 브랜드(한울피드/온결의원/유진정밀/선재자산운용/다온케어/휴먼라이트)
 *
 * Usage: node scripts/generate-interactive-web.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ANALYSIS_DIR = join(ROOT, 'analyses', 'interactive-web');
const ANALYSIS_FILE = join(ANALYSIS_DIR, 'analysis.json');
const DEMO_DIR = join(ROOT, 'demos', 'interactive-web');

const CATEGORY = {
  id: 'interactive-web',
  title: '섹션 인터랙티브 요소',
  type: 'web',
  date: '2026-06-12',
  url: 'https://daehanfeed.co.kr/',
  summary: '버튼·카드 같은 컴포넌트가 아니라 실제 웹페이지의 한 섹션 전체를 구성하는 인터랙티브 요소 10종. 한국 실사이트 6곳(사료·병원·제조·금융·헬스케어·NGO)의 메인 페이지를 실측해 풀스크린 히어로·커튼 리빌 브랜드 스토리·핀 칼럼 피드·연혁 타임라인·시네마틱 피날레까지 섹션 단위 연출을 정리했다. 원본의 자동 재생 슬라이더는 전부 스크롤 진행률·클릭 입력에 1:1 매핑되도록 번역했으며, 요소마다 시각적으로 명확히 구별되는 연출 변형 3예시를 비교한다.'
};

// 6곳 실측 레퍼런스 — 가상 브랜드 매핑
const SITES = [
  { domain: 'daehanfeed.co.kr', brand: '한울피드', sig: '멀티 패널 커튼 리빌 · 핀 배경 거대 타이포 · 배경 줌 CTA (GSAP ScrollTrigger scrub)' },
  { domain: 'doodoorim-clinic.com', brand: '온결의원', sig: '좌우 대향 분할 패널 · 핀 멀티 장면 시퀀스 · 세로 타임라인 · 핀 오버랩 전환' },
  { domain: 'nifco.co.kr', brand: '유진정밀', sig: '핀 타이틀+역방향 카드 패럴랙스 · asNavFor 듀얼 슬라이더 · 푸터 커튼 리빌' },
  { domain: 'syfund.co.kr', brand: '선재자산운용', sig: '시네마틱 4막 피날레(수렴→발산→심볼 팝업) · 호버 배경 그라디언트 크로스페이드' },
  { domain: 'ildongcare.com', brand: '다온케어', sig: '호버 풀밴드 배경 교체 · 가로 아코디언 · 핀 카드 스택(scrub:7)' },
  { domain: 'amnesty.or.kr', brand: '휴먼라이트', sig: '좌 칼럼 핀 + 글래스 통계 카드 통과 · 막대 불릿 히어로 · 문장 스왑 후원 위젯' }
];

/* ================================================================
   공통 토큰 — 모든 데모가 상속하는 섹션 타이포
   ================================================================ */

const BASE_SEC_CSS = [
  '.iw-eyebrow { font: 600 12px/1 "Pretendard Variable","Pretendard",sans-serif; letter-spacing: 0.22em; text-transform: uppercase; color: var(--accent,#8ab4ff); margin: 0; }',
  '.iw-head { font: 800 clamp(28px,4.4vw,56px)/1.12 "Pretendard Variable","Pretendard",sans-serif; letter-spacing: -0.02em; color: #fff; margin: 0; }',
  '.iw-sub { font: 700 clamp(20px,2.6vw,30px)/1.3 "Pretendard Variable","Pretendard",sans-serif; color: #fff; margin: 0; }',
  '.iw-body { font: 400 clamp(14px,1.4vw,17px)/1.7 "Pretendard Variable","Pretendard",sans-serif; color: rgba(255,255,255,0.62); margin: 0; }',
  '.iw-cta { display: inline-flex; align-items: center; gap: 8px; font: 600 13px/1 "Pretendard Variable","Pretendard",sans-serif; color: #fff; border: 1px solid rgba(255,255,255,0.32); border-radius: 999px; padding: 14px 24px; text-decoration: none; }',
  '.iw-tag { font: 600 11px/1 "Pretendard Variable","Pretendard",sans-serif; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(255,255,255,0.4); }'
].join('\n');

// 스크롤형 데모의 IIFE 안에서 applyReveal보다 먼저 주입되는 헬퍼
const SCROLL_HELPERS = [
  'function clamp01(v){ return v < 0 ? 0 : v > 1 ? 1 : v; }',
  'function seg(p,a,b){ return clamp01((p - a) / (b - a)); }',
  'function lerp(a,b,t){ return a + (b - a) * t; }',
  'function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }',
  'function easeInOut(t){ return t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2) / 2; }',
  'function backOut(t){ var c = 1.70158; t = t - 1; return t*t*((c+1)*t + c) + 1; }'
].join('\n      ');

const PRETENDARD = 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable-dynamic-subset.min.css';

const DEMO_CHROME_CSS = [
  '* { box-sizing: border-box; }',
  'html, body { margin: 0; padding: 0; }',
  'body { background: #000; color: #fff; font-family: "Pretendard Variable","Pretendard",sans-serif; overflow-x: hidden; -webkit-font-smoothing: antialiased; }',
  '.demo-controls { position: fixed; top: 16px; left: 16px; display: inline-flex; align-items: center; gap: 10px; z-index: 100; }',
  '.demo-reset { font: 600 11px/1 "Pretendard Variable","Pretendard",sans-serif; color: rgba(255,255,255,0.72); background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.16); border-radius: 999px; padding: 8px 14px; cursor: pointer; transition: color 160ms, background 160ms; }',
  '.demo-reset:hover { color: #fff; background: rgba(255,255,255,0.14); }',
  '.demo-label { font: 500 10px/1 "Pretendard Variable","Pretendard",sans-serif; color: rgba(255,255,255,0.4); letter-spacing: 0.14em; text-transform: uppercase; }',
  '.demo-hint { position: fixed; right: 16px; bottom: 24px; font: 500 10px/1 "Pretendard Variable","Pretendard",sans-serif; color: rgba(255,255,255,0.45); letter-spacing: 0.18em; text-transform: uppercase; z-index: 100; }',
  '.demo-progress { position: fixed; bottom: 0; left: 0; right: 0; height: 2px; background: rgba(255,255,255,0.06); z-index: 100; }',
  '.demo-progress > div { height: 100%; background: #fff; width: 0; transition: width 60ms linear; }'
].join('\n    ');

function keyUp(ex) { return ex.key.toUpperCase(); }

/* ================================================================
   Standalone demo HTML 빌더 — 스크롤형 / 입력형 2종
   ================================================================ */

function buildScrollDemoHTML(el, ex) {
  var trackVh = ex.demo.trackVh || 240;
  return '<!DOCTYPE html>\n'
    + '<html lang="ko">\n'
    + '<head>\n'
    + '  <meta charset="UTF-8">\n'
    + '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
    + '  <title>' + el.num + '-' + keyUp(ex) + '. ' + el.title + ' — ' + ex.title + '</title>\n'
    + '  <link href="' + PRETENDARD + '" rel="stylesheet">\n'
    + '  <style>\n'
    + '    ' + DEMO_CHROME_CSS + '\n'
    + '    .scroll-track { min-height: ' + trackVh + 'vh; position: relative; }\n'
    + '    .sticky-stage { position: sticky; top: 0; height: 100vh; overflow: hidden; display: flex; align-items: center; justify-content: center; }\n'
    + '    ' + BASE_SEC_CSS.replace(/\n/g, '\n    ') + '\n'
    + '    ' + ex.demo.css.replace(/\n/g, '\n    ') + '\n'
    + '  </style>\n'
    + '</head>\n'
    + '<body>\n'
    + '  <div class="demo-controls">\n'
    + '    <button class="demo-reset" type="button" onclick="window.__reset && window.__reset()">↻ 다시 보기</button>\n'
    + '    <span class="demo-label">' + el.num + '-' + keyUp(ex) + ' · ' + el.title + '</span>\n'
    + '  </div>\n'
    + '  <div class="demo-hint">SCROLL ↓</div>\n'
    + '  <div class="demo-progress"><div></div></div>\n'
    + '\n'
    + '  <div class="scroll-track">\n'
    + '    <div class="sticky-stage">\n'
    + '      ' + ex.demo.bodyHTML.replace(/\n/g, '\n      ') + '\n'
    + '    </div>\n'
    + '  </div>\n'
    + '\n'
    + '  <script>\n'
    + '    (function(){\n'
    + '      ' + SCROLL_HELPERS + '\n'
    + '      var track = document.querySelector(".scroll-track");\n'
    + '      var stage = document.querySelector(".sticky-stage");\n'
    + '      var progressFill = document.querySelector(".demo-progress > div");\n'
    + '      function calc(){\n'
    + '        var rect = track.getBoundingClientRect();\n'
    + '        var max = Math.max(1, rect.height - window.innerHeight);\n'
    + '        return Math.max(0, Math.min(1, -rect.top / max));\n'
    + '      }\n'
    + '      ' + ex.demo.js.replace(/\n/g, '\n      ') + '\n'
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

function buildInputDemoHTML(el, ex) {
  var hint = ex.demo.hint || 'HOVER';
  return '<!DOCTYPE html>\n'
    + '<html lang="ko">\n'
    + '<head>\n'
    + '  <meta charset="UTF-8">\n'
    + '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
    + '  <title>' + el.num + '-' + keyUp(ex) + '. ' + el.title + ' — ' + ex.title + '</title>\n'
    + '  <link href="' + PRETENDARD + '" rel="stylesheet">\n'
    + '  <style>\n'
    + '    ' + DEMO_CHROME_CSS + '\n'
    + '    .stage { min-height: 100vh; overflow: hidden; display: flex; align-items: center; justify-content: center; }\n'
    + '    ' + BASE_SEC_CSS.replace(/\n/g, '\n    ') + '\n'
    + '    ' + ex.demo.css.replace(/\n/g, '\n    ') + '\n'
    + '  </style>\n'
    + '</head>\n'
    + '<body>\n'
    + '  <div class="demo-controls">\n'
    + '    <button class="demo-reset" type="button" onclick="window.__reset && window.__reset()">↻ 다시 보기</button>\n'
    + '    <span class="demo-label">' + el.num + '-' + keyUp(ex) + ' · ' + el.title + '</span>\n'
    + '  </div>\n'
    + '  <div class="demo-hint">' + hint + '</div>\n'
    + '  <div class="demo-progress"><div></div></div>\n'
    + '\n'
    + '  <main class="stage">\n'
    + '    ' + ex.demo.bodyHTML.replace(/\n/g, '\n    ') + '\n'
    + '  </main>\n'
    + '\n'
    + '  <script>\n'
    + '    (function(){\n'
    + '      var stage = document.querySelector(".stage");\n'
    + '      var progressFill = document.querySelector(".demo-progress > div");\n'
    + '      ' + ex.demo.js.replace(/\n/g, '\n      ') + '\n'
    + '    })();\n'
    + '  </script>\n'
    + '</body>\n'
    + '</html>\n';
}

function buildDemoHTML(el, ex) {
  return ex.demo.mode === 'input' ? buildInputDemoHTML(el, ex) : buildScrollDemoHTML(el, ex);
}

/* ================================================================
   분석 보고서 블록 빌더 (표준 22 블록: 데모 A/B/C 3개)
   ================================================================ */

function buildElementSection(el) {
  var blocks = [];
  blocks.push({ type: 'text', value: el.summary + '\n\n실측 근거 — ' + el.evidence });

  el.examples.forEach(function (ex) {
    blocks.push({ type: 'heading', value: '라이브 데모 ' + keyUp(ex) + ' — ' + ex.title });
    blocks.push({ type: 'text', value: ex.desc });
    blocks.push({
      type: 'component',
      embed: 'demos/interactive-web/' + el.id + '--' + ex.id + '.html',
      embedHeight: ex.demo.mode === 'input' ? 560 : 600,
      embedLabel: el.num + '-' + keyUp(ex) + ' · ' + el.title + ' — ' + ex.title,
      title: el.title + ' — ' + ex.title + ' 라이브 데모'
    });
  });

  blocks.push({ type: 'heading', value: '작동 원리' });
  blocks.push({ type: 'text', value: el.explain });
  blocks.push({ type: 'kv', columns: 2, items: el.kv });
  blocks.push({ type: 'heading', value: '코드 스니펫' });
  blocks.push({ type: 'code', lang: 'HTML', title: 'HTML — ' + el.examples[0].title, value: el.snippetHTML });
  blocks.push({ type: 'code', lang: 'CSS', title: 'CSS', value: el.snippetCSS });
  blocks.push({ type: 'code', lang: 'JS', title: 'JavaScript', value: el.snippetJS });
  blocks.push({ type: 'heading', value: '사용 가이드' });
  blocks.push({ type: 'text', value: el.guide });
  blocks.push({ type: 'heading', value: '활용 추천' });
  blocks.push({
    type: 'structure',
    items: el.recommendations.map(function (r) { return { label: r.place, tag: '', desc: r.body }; })
  });
  blocks.push({ type: 'note', value: '트레이드오프 — ' + el.tradeoff });

  return { title: el.num + '. ' + el.title, blocks: blocks };
}

function buildOverview() {
  var indexItems = ELEMENTS.map(function (el) {
    var trig = el.kv.find(function (k) { return k.label === '트리거'; });
    return { label: el.num + '. ' + el.title, tag: trig ? trig.value : '', desc: el.summary };
  });

  var siteItems = SITES.map(function (s) {
    return { label: s.brand + ' (' + s.domain + ')', value: s.sig };
  });

  return {
    title: '00. 카테고리 개요',
    blocks: [
      { type: 'heading', value: '인터랙티브 웹 — 페이지의 섹션을 구성하는 인터랙티브 요소 10종' },
      { type: 'text', value: CATEGORY.summary },
      { type: 'heading', value: '10 요소 인덱스 (실제 홈페이지 위→아래 순서)' },
      { type: 'structure', items: indexItems },
      { type: 'heading', value: '공통 디자인 토큰' },
      {
        type: 'kv', columns: 2, items: [
          { label: '폰트', value: 'Pretendard Variable 400~800' },
          { label: '배경', value: '#000 — 사진/비디오 대신 CSS 그라디언트·SVG' },
          { label: '스크롤 모델', value: '.scroll-track(240~280vh) + .sticky-stage(100vh) + progress 0~1 → applyReveal(p)' },
          { label: '입력 모델', value: 'hover/click/drag → 상태 클래스 스왑 + CSS transition ≤200ms' },
          { label: '매핑 원칙', value: '자동 재생 금지 — 모든 모션은 스크롤·입력에 1:1 (역스크롤 시 되감김)' },
          { label: '데모 구동', value: '스크롤형 23 / 입력형 7 (06·07 전체 + 01-C)' },
          { label: '리셋', value: '↻ 다시 보기 — 스크롤형 scrollTo 0 / 입력형 상태 초기화' },
          { label: '의존성', value: 'Pretendard CDN 1개 — GSAP·Swiper·jQuery 미사용 (전부 Vanilla)' }
        ]
      },
      { type: 'heading', value: '실측 레퍼런스 6곳' },
      { type: 'kv', columns: 1, items: siteItems },
      { type: 'heading', value: '읽기 가이드' },
      {
        type: 'structure', items: [
          { label: '라이브 데모 A·B·C', tag: 'IFRAME', desc: '요소당 시각적으로 구별되는 연출 변형 3개 — 같은 섹션 유형의 다른 안무' },
          { label: '작동 원리', tag: 'HOW', desc: '공통 매핑 메커니즘 + A/B/C 변형 차이' },
          { label: '정량 메타', tag: 'KV', desc: '의존성 / 트리거 / 스크롤 트랙 / 핵심 매핑 / 권장 콘텐츠 / 실측 레퍼런스' },
          { label: '코드 스니펫', tag: 'CODE', desc: 'HTML / CSS / JS — 대표 예시 A 기준 핵심 코드' },
          { label: '사용 가이드', tag: 'GUIDE', desc: '콘텐츠 길이·이징·접근성(prefers-reduced-motion)·반응형 주의' },
          { label: '활용 추천', tag: 'PLACES', desc: '기업 메인 / 브랜드 캠페인 / 병원·기관 / 제품 쇼케이스 4건' },
          { label: '트레이드오프', tag: 'NOTE', desc: '성능·접근성·권장 사용처' }
        ]
      },
      {
        type: 'note',
        value: '이 카테고리는 버튼·카드·텍스트 효과 같은 컴포넌트가 아니라, 풀스크린 히어로·커튼 리빌 브랜드 스토리·핀 칼럼 피드·연혁 타임라인·시네마틱 피날레처럼 페이지의 한 섹션 전체가 하나의 연출 단위인 인터랙션을 다룬다. 실측 원본이 autoplay(Swiper·GSAP 타임라인 once)인 연출은 전부 스크롤 진행률 또는 클릭 입력에 1:1 매핑되도록 번역했다. 데모는 가상 브랜드(한울피드·온결의원·유진정밀·선재자산운용·다온케어·휴먼라이트)의 섹션 화면으로 구성된다.'
      }
    ]
  };
}

/* ================================================================
   메인
   ================================================================ */

function main() {
  mkdirSync(DEMO_DIR, { recursive: true });
  var demoCount = 0;
  for (var el of ELEMENTS) {
    for (var ex of el.examples) {
      writeFileSync(join(DEMO_DIR, el.id + '--' + ex.id + '.html'), buildDemoHTML(el, ex), 'utf-8');
      demoCount++;
    }
  }
  console.log('✓ demos/interactive-web/*.html — ' + demoCount + '개');

  var sections = { overview: buildOverview() };
  for (var el2 of ELEMENTS) sections[el2.id] = buildElementSection(el2);

  var analysis = {
    id: CATEGORY.id,
    title: CATEGORY.title,
    type: CATEGORY.type,
    url: CATEGORY.url,
    date: CATEGORY.date,
    summary: CATEGORY.summary,
    patternCount: ELEMENTS.length,
    exampleCount: demoCount,
    sections: sections
  };
  mkdirSync(ANALYSIS_DIR, { recursive: true });
  writeFileSync(ANALYSIS_FILE, JSON.stringify(analysis, null, 2), 'utf-8');
  console.log('✓ analyses/interactive-web/analysis.json');
  console.log('  ' + ELEMENTS.length + ' elements + 1 overview = ' + (ELEMENTS.length + 1) + ' sections');
  var totalBlocks = Object.values(sections).reduce(function (acc, s) { return acc + s.blocks.length; }, 0);
  console.log('  ' + totalBlocks + ' blocks total');

  // 사이드바 sub-link 정의 (system.json 등록용)
  var sidebarSections = [{ id: 'overview', num: '00', title: '카테고리 개요', desc: CATEGORY.summary.slice(0, 60) }];
  for (var el3 of ELEMENTS) sidebarSections.push({ id: el3.id, num: el3.num, title: el3.title, desc: el3.summary.slice(0, 70) });
  console.log('\n--- system.json sections (참고용) ---');
  console.log(JSON.stringify(sidebarSections));
}

/* ================================================================
   10 요소 정의 — E01 ~ E10
   ================================================================ */

const E01 = {
  id: 'fullscreen-hero', num: '01', title: '풀스크린 히어로 오프닝',
  summary: '페이지 최상단 100vh를 점유하는 오프닝 섹션. 실측 6곳 전부가 풀스크린 히어로로 시작하는 한국 기업 사이트의 표준 문법으로, 헤드라인 순차 라이즈·배경 줌 안정화·페이징 UI가 공통이다. 원본의 autoplay 슬라이더는 스크럽·클릭 입력으로 번역했다 — 기존 full-screen-scroll(여러 풀스크린 슬라이드의 스크롤 전환 카탈로그)과 달리 단일 히어로 한 장의 진입·페이징 연출이 단위다.',
  evidence: 'daehanfeed #visual(스크럽 헤드라인 순차 슬라이드 인) · syfund sec-hero(타이포 솟아오름 + 하단 SCROLL 유도선) · amnesty #hero-section(100vh 히어로 + 50px 가로 막대 불릿 페이징)',
  explain: 'A·B는 240vh 스크롤 트랙 + 100vh sticky 무대에서 progress(0~1)를 받아 요소를 inline 보간하고, C는 스크롤 없이 클릭으로 슬라이드를 교체한다. A(스크럽 인트로)는 영문 라벨→헤드라인→구분선→본문→CTA에 각자 다른 진행률 윈도 [0.08+i·0.11, +0.16]을 배정해 차례로 슬라이드 인하고 배경은 scale 1.12→1로 가라앉는다. B(켄번스 안정화)는 배경 scale 1.15→1·딤 opacity 0.62→0·헤드라인 letter-spacing 0.28em→0.01em을 동시에 보간한 뒤 후반 [0.7~1]에서 콘텐츠를 위로 밀어 다음 섹션으로 핸드오프한다. C(클릭 페이징)는 autoplay를 버리고 가로 막대 불릿 클릭으로만 슬라이드를 크로스페이드 교체하며 활성 불릿만 scaleX(1)로 채워 현재 위치를 표시한다 — 세 변형 모두 자동 재생 없이 입력(스크롤·클릭)에만 반응한다.',
  kv: [
    { label: '의존성', value: 'Vanilla JS — applyReveal(p) inline 보간 / 클릭 핸들러' },
    { label: '트리거', value: '스크롤 진행률 (A·B) / 클릭 (C)' },
    { label: '스크롤 트랙', value: '240vh + sticky 100vh (C는 입력형 — 트랙 없음)' },
    { label: '핵심 매핑', value: '요소 i 윈도 [0.08+i·0.11, +0.16] · 배경 scale 1.12→1' },
    { label: '권장 콘텐츠', value: '헤드라인 1~2줄 · 서브카피 40자 내외 · CTA 1개' },
    { label: '실측 레퍼런스', value: 'daehanfeed #visual · syfund sec-hero · amnesty #hero' }
  ],
  guide: '히어로는 페이지의 첫인상이므로 헤드라인은 1~2줄, 한 호흡에 읽히는 길이로 제한한다. 진입 윈도(0.16)가 너무 짧으면 요소가 튀어 들어오고 너무 길면 스크롤을 많이 내려야 하므로 0.14~0.18이 적정. 배경 줌은 scale 0.12~0.15 폭이 자연스럽고, will-change:transform으로 합성 레이어를 미리 확보해 첫 프레임 끊김을 막는다. A·B는 스크롤 의존이라 페이지 최상단에서 자연스럽지만, 클릭 페이징(C)은 autoplay 없이 사용자 입력으로만 넘어가므로 불릿이 현재 위치를 분명히 알려야 한다. prefers-reduced-motion에서는 배경 줌·translate를 끄고 첫 프레임의 정지 상태를 보여줄 것.',
  recommendations: [
    { place: '기업 사이트 메인', body: '오프닝 — 브랜드 슬로건과 배경 무드로 첫 화면을 장악하고, 스크럽 라이즈(A)로 헤드라인을 차례로 드러내며 본문 진입을 암시' },
    { place: '브랜드 캠페인 페이지', body: '랜딩 최상단 — 캠페인 메시지를 풀스크린으로 선언. 클릭 페이징(C)으로 복수 메시지를 autoplay 없이 사용자 주도로 순환' },
    { place: '병원·기관 사이트', body: '신뢰 오프닝 — 차분한 켄번스 줌(B)으로 전문성·안정감을 강조하고 진료/설립 철학을 한 줄로 제시' },
    { place: '제품·서비스 쇼케이스', body: '제품 히어로 — 헤드라인과 CTA를 순차 라이즈(A)시켜 핵심 가치와 행동 유도를 한 화면에 압축' }
  ],
  tradeoff: '풀스크린 히어로는 첫 화면을 100vh 점유하므로 그만큼 본문 진입이 늦어진다 — 스크롤 유도선·다음 섹션 프리뷰로 "더 있다"는 신호를 반드시 줄 것. 배경 줌·translate가 동시에 도는 구간은 합성 부하가 있으니 레이어를 transform/opacity로만 제한하고, 텍스트는 진입 중 읽기 어려우므로 핵심 메시지는 진입 완료 후에도 충분히 머무르게 한다.',
  snippetHTML: '<section class="hero">\n  <div class="hero-bg"></div>\n  <div class="hero-inner">\n    <p class="iw-eyebrow r" data-i="0">한울피드 · SINCE 1982</p>\n    <h1 class="iw-head">\n      <span class="r" data-i="1">자연을 먹이고,</span>\n      <span class="r" data-i="2">생명을 키웁니다</span>\n    </h1>\n    <div class="divider r" data-i="3"></div>\n    <p class="iw-body r" data-i="4">40년 배합 기술로 사육의 기준을 설계합니다.</p>\n    <a class="iw-cta r" data-i="5">브랜드 스토리</a>\n  </div>\n</section>',
  snippetCSS: '.hero-bg { position: absolute; inset: 0; will-change: transform; } /* 배경 줌 */\n.r { opacity: 0; will-change: opacity, transform; }              /* 진입 대상 */\n/* 모션은 CSS transition이 아니라 JS가 progress에 직접 매핑한다 */',
  snippetJS: 'var items = document.querySelectorAll(".r");\nvar bg = document.querySelector(".hero-bg");\nfunction applyReveal(p){            // p = 스크롤 진행률 0~1\n  items.forEach(function(el){\n    var i = +el.dataset.i;\n    var s = 0.08 + i * 0.11;\n    var lp = seg(p, s, s + 0.16);    // 요소별 진입 윈도\n    el.style.opacity = lp;\n    el.style.transform = "translateX(" + (40 * (1 - lp)) + "px)";\n  });\n  bg.style.transform = "scale(" + (1.12 - 0.12 * seg(p, 0, 0.6)) + ")";\n}\n// seg(p,a,b) = clamp01((p-a)/(b-a)) — 구간 정규화 헬퍼',
  examples: [
    {
      key: 'a', id: 'scrub-intro', title: '스크럽 헤드라인 라이즈',
      desc: '한울피드 사례 — 영문 라벨, 헤드라인 두 줄, 구분선, 본문, CTA가 각자의 진행률 윈도에서 차례로 미끄러져 들어온다. 배경은 살짝 확대돼 있다가 제자리로 가라앉고, 스크롤을 멈추면 등장도 그 자리에서 멈춘다.',
      demo: {
        mode: 'scroll', trackVh: 240, height: 600,
        bodyHTML: '<section class="hero-a">\n'
          + '  <div class="ha-bg"></div>\n'
          + '  <div class="ha-inner">\n'
          + '    <p class="iw-eyebrow r" data-i="0">한울피드 · SINCE 1982</p>\n'
          + '    <h1 class="iw-head ha-title">\n'
          + '      <span class="r" data-i="1">자연을 먹이고,</span><br>\n'
          + '      <span class="r" data-i="2">생명을 키웁니다</span>\n'
          + '    </h1>\n'
          + '    <div class="ha-divider r" data-i="3"></div>\n'
          + '    <p class="iw-body r" data-i="4">40년간 축적한 배합 기술로 더 건강한 사육의 기준을 설계합니다.</p>\n'
          + '    <a class="iw-cta r" data-i="5" href="javascript:void(0)">브랜드 스토리 보기 →</a>\n'
          + '  </div>\n'
          + '</section>',
        css: '.hero-a { position: absolute; inset: 0; }\n'
          + '.ha-bg { position: absolute; inset: 0; background: radial-gradient(130% 120% at 50% 0%, #1f4533 0%, #0c1812 55%, #000 100%); will-change: transform; }\n'
          + '.ha-inner { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 0 32px; z-index: 2; }\n'
          + '.hero-a .iw-eyebrow { --accent: #6fe0a8; margin-bottom: 26px; }\n'
          + '.ha-title { margin-bottom: 28px; }\n'
          + '.ha-title span { display: inline-block; }\n'
          + '.ha-divider { width: 60px; height: 2px; background: #6fe0a8; margin-bottom: 26px; transform-origin: left; }\n'
          + '.hero-a .iw-body { max-width: 430px; margin-bottom: 34px; }\n'
          + '.r { opacity: 0; will-change: opacity, transform; }',
        js: 'var items = stage.querySelectorAll(".r");\n'
          + 'var bg = stage.querySelector(".ha-bg");\n'
          + 'function applyReveal(p){\n'
          + '  for (var i = 0; i < items.length; i++){\n'
          + '    var el = items[i];\n'
          + '    var k = +el.getAttribute("data-i");\n'
          + '    var s = 0.08 + k * 0.11;\n'
          + '    var lp = seg(p, s, s + 0.16);\n'
          + '    if (el.classList.contains("ha-divider")) {\n'
          + '      el.style.opacity = 1;\n'
          + '      el.style.transform = "scaleX(" + lp + ")";\n'
          + '    } else {\n'
          + '      el.style.opacity = lp;\n'
          + '      el.style.transform = "translateX(" + (40 * (1 - lp)) + "px)";\n'
          + '    }\n'
          + '  }\n'
          + '  bg.style.transform = "scale(" + (1.12 - 0.12 * seg(p, 0, 0.6)) + ")";\n'
          + '}'
      }
    },
    {
      key: 'b', id: 'kenburns-settle', title: '켄번스 줌 안정화',
      desc: '선재자산운용 사례 — 확대돼 있던 배경이 스크롤에 비례해 제 크기로 가라앉고, 어두운 딤이 걷히며 헤드라인의 자간이 좁아져 또렷해진다. 후반에는 콘텐츠가 위로 살짝 밀려 다음 섹션으로 넘어가는 핸드오프를 암시한다.',
      demo: {
        mode: 'scroll', trackVh: 240, height: 600,
        bodyHTML: '<section class="hero-b">\n'
          + '  <div class="hb-bg"></div>\n'
          + '  <div class="hb-dim"></div>\n'
          + '  <div class="hb-inner">\n'
          + '    <p class="iw-eyebrow">SUNJAE ASSET MANAGEMENT</p>\n'
          + '    <h1 class="iw-head hb-title">시간이 증명하는<br>가치에 투자합니다</h1>\n'
          + '    <p class="iw-body">1996년부터 이어온 가치투자 철학으로 자산의 내일을 설계합니다.</p>\n'
          + '  </div>\n'
          + '</section>',
        css: '.hero-b { position: absolute; inset: 0; }\n'
          + '.hb-bg { position: absolute; inset: 0; background: linear-gradient(135deg, #16243f 0%, #0a1322 48%, #1b1530 100%); will-change: transform; }\n'
          + '.hb-dim { position: absolute; inset: 0; background: #000; }\n'
          + '.hb-inner { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 24px; padding: 0 32px; z-index: 3; will-change: transform, opacity; }\n'
          + '.hero-b .iw-eyebrow { --accent: #c9a86a; }\n'
          + '.hb-title { max-width: 700px; will-change: letter-spacing; }\n'
          + '.hero-b .iw-body { max-width: 460px; }',
        js: 'var bg = stage.querySelector(".hb-bg");\n'
          + 'var dim = stage.querySelector(".hb-dim");\n'
          + 'var inner = stage.querySelector(".hb-inner");\n'
          + 'var title = stage.querySelector(".hb-title");\n'
          + 'function applyReveal(p){\n'
          + '  bg.style.transform = "scale(" + (1.15 - 0.15 * seg(p, 0, 0.7)) + ")";\n'
          + '  dim.style.opacity = 0.62 * (1 - seg(p, 0, 0.6));\n'
          + '  title.style.letterSpacing = lerp(0.28, 0.01, seg(p, 0.05, 0.55)) + "em";\n'
          + '  var ex = seg(p, 0.7, 1);\n'
          + '  inner.style.transform = "translateY(" + (-ex * 6) + "vh) scale(" + (1 - 0.06 * ex) + ")";\n'
          + '  inner.style.opacity = (1 - 0.7 * ex);\n'
          + '}'
      }
    },
    {
      key: 'c', id: 'bullet-paging', title: '클릭 페이징 크로스페이드',
      desc: '휴먼라이트 사례 — autoplay 없이 하단 가로 막대 불릿을 클릭해야만 배경 무드와 카피 세트가 통째로 크로스페이드 교체된다. 활성 불릿만 채워져 현재 위치를 알리고, 새 슬라이드의 텍스트는 아래에서 살짝 떠오른다.',
      demo: {
        mode: 'input', hint: 'CLICK', height: 560,
        bodyHTML: '<section class="hero-c">\n'
          + '  <div class="hc-slides">\n'
          + '    <article class="hc-slide is-on" data-i="0"><div class="hc-bg hc-bg0"></div><div class="hc-tx"><p class="iw-eyebrow">HUMAN LIGHT</p><h1 class="iw-head">모두의 인권을 지키는 일에<br>함께해 주세요</h1><p class="iw-body">당신의 작은 행동이 누군가의 내일을 바꿉니다.</p></div></article>\n'
          + '    <article class="hc-slide" data-i="1"><div class="hc-bg hc-bg1"></div><div class="hc-tx"><p class="iw-eyebrow">URGENT ACTION</p><h1 class="iw-head">위기의 현장에<br>가장 먼저 닿습니다</h1><p class="iw-body">전 세계 인권 침해 현장의 목소리를 가장 가까이에서 전합니다.</p></div></article>\n'
          + '    <article class="hc-slide" data-i="2"><div class="hc-bg hc-bg2"></div><div class="hc-tx"><p class="iw-eyebrow">JOIN US</p><h1 class="iw-head">변화는<br>함께일 때 시작됩니다</h1><p class="iw-body">월 정기후원으로 지속가능한 변화를 함께 만듭니다.</p></div></article>\n'
          + '  </div>\n'
          + '  <div class="hc-bullets">\n'
          + '    <button class="hc-bullet is-on" data-i="0" aria-label="1번 배너로 이동"><span></span></button>\n'
          + '    <button class="hc-bullet" data-i="1" aria-label="2번 배너로 이동"><span></span></button>\n'
          + '    <button class="hc-bullet" data-i="2" aria-label="3번 배너로 이동"><span></span></button>\n'
          + '  </div>\n'
          + '</section>',
        css: '.hero-c { position: absolute; inset: 0; }\n'
          + '.demo-progress { display: none; }\n'
          + '.hc-slides { position: absolute; inset: 0; }\n'
          + '.hc-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 200ms ease; display: flex; align-items: center; justify-content: center; }\n'
          + '.hc-slide.is-on { opacity: 1; }\n'
          + '.hc-bg { position: absolute; inset: 0; }\n'
          + '.hc-bg0 { background: radial-gradient(120% 120% at 28% 22%, #3c1d1d 0%, #140a0a 60%, #000 100%); }\n'
          + '.hc-bg1 { background: radial-gradient(120% 120% at 72% 28%, #2c1d3e 0%, #0d0a16 60%, #000 100%); }\n'
          + '.hc-bg2 { background: radial-gradient(120% 120% at 50% 82%, #1d2c3e 0%, #0a0f16 60%, #000 100%); }\n'
          + '.hc-tx { position: relative; z-index: 2; text-align: center; max-width: 700px; padding: 0 32px; opacity: 0; transform: translateY(16px); transition: opacity 240ms ease 60ms, transform 240ms ease 60ms; }\n'
          + '.hc-slide.is-on .hc-tx { opacity: 1; transform: none; }\n'
          + '.hc-tx .iw-head { margin: 18px 0 0; }\n'
          + '.hc-tx .iw-body { margin-top: 18px; }\n'
          + '.hero-c .iw-eyebrow { --accent: #ffd23f; }\n'
          + '.hc-bullets { position: absolute; left: 0; right: 0; bottom: 42px; display: flex; gap: 12px; justify-content: center; z-index: 5; }\n'
          + '.hc-bullet { width: 56px; height: 5px; padding: 0; border: none; background: rgba(255,255,255,0.22); border-radius: 999px; cursor: pointer; overflow: hidden; }\n'
          + '.hc-bullet span { display: block; height: 100%; width: 100%; background: #ffd23f; transform: scaleX(0); transform-origin: left; transition: transform 220ms ease; }\n'
          + '.hc-bullet.is-on span { transform: scaleX(1); }',
        js: 'var slides = stage.querySelectorAll(".hc-slide");\n'
          + 'var bullets = stage.querySelectorAll(".hc-bullet");\n'
          + 'function go(n){\n'
          + '  for (var i = 0; i < slides.length; i++){\n'
          + '    slides[i].classList.toggle("is-on", i === n);\n'
          + '    bullets[i].classList.toggle("is-on", i === n);\n'
          + '  }\n'
          + '}\n'
          + 'for (var b = 0; b < bullets.length; b++){\n'
          + '  (function(i){ bullets[i].addEventListener("click", function(){ go(i); }); })(b);\n'
          + '}\n'
          + 'window.__reset = function(){ go(0); };'
      }
    }
  ]
};

const E02 = {
  id: 'curtain-panel-reveal', num: '02', title: '멀티 패널 커튼 리빌 스토리',
  summary: '미디어 카드를 덮은 패널들을 스크롤로 한 장씩 물리적으로 걷어내며 비주얼이 단계적으로 선명해지는 브랜드 스토리 섹션. 단순 opacity 페이드가 아니라 "레이어를 걷어낸다"는 메타포가 핵심으로, 좌 비주얼·우 텍스트 2단 구성을 같은 진행률로 동시에 안무한다.',
  evidence: 'daehanfeed sec1 — rgba(255,255,255,0.7) 풀사이즈 패널 4장(.e1~.e4)을 GSAP scrub 타임라인에서 y:-100vh로 20% 오프셋 순차 리프트 + 우측 타이틀 translateX 페이드 + 하단 플로팅 카드 동시 안무',
  explain: '세 변형 모두 미디어를 덮은 가림막을 스크롤 진행률로 제거하지만 제거 방식이 다르다. A(수직 스택)는 반투명 흰 패널 4장을 z축으로 겹쳐두고 각자 다른 윈도 [0.12+i·0.15, +0.2]에서 translateY(-110%)로 한 장씩 위로 벗겨 비주얼을 4단계로 선명하게 하고, 동시에 우측 텍스트(translateX)와 플로팅 카드(translateY)를 같은 progress로 진입시킨다. B(블라인드 슬랫)는 가로 슬랫 8장을 transform-origin:top + scaleY(1→0)로 위에서부터 0.06 간격 스태거로 접어 빗살 무늬 와이프를 만든다. C(대각 클립)는 단일 오버레이의 clip-path polygon 좌측 꼭짓점을 progress로 좌→우 이동시켜 대각선으로 닦아내며, 미디어는 scale 1.06→1로 함께 안정화된다. 모두 inline transform/clip-path 1:1 매핑이라 역스크롤 시 가림막이 다시 덮인다.',
  kv: [
    { label: '의존성', value: 'Vanilla JS — applyReveal(p) transform/clip-path 보간' },
    { label: '트리거', value: '스크롤 진행률 (전부 스크롤형)' },
    { label: '스크롤 트랙', value: '260vh + sticky 100vh' },
    { label: '핵심 매핑', value: '패널 i 윈도 [0.12+i·0.15, +0.2] · translateY -110%×localP' },
    { label: '권장 콘텐츠', value: '비주얼 1 + 헤드라인 2줄 + 본문 + 보조 카드' },
    { label: '실측 레퍼런스', value: 'daehanfeed sec1 브랜드 스토리' }
  ],
  guide: '커튼 리빌의 핵심은 "단계감"이다 — 패널이 3~5장일 때 가장 효과적이고, 그 이상이면 각 단계가 미세해져 그냥 페이드처럼 보인다. 패널 윈도를 0.12~0.18 간격으로 어긋나게 배치해야 한 장씩 벗겨지는 리듬이 살고, 간격이 0에 가까우면 동시에 사라진다. 반투명 패널은 backdrop-filter 없이 rgba 배경만 써야 합성 비용이 낮다. 우측 텍스트는 비주얼이 어느 정도 드러난 뒤(0.2~) 진입시켜 시선이 비주얼→텍스트로 흐르게 한다. prefers-reduced-motion에서는 패널을 모두 제거한 최종 상태를 정적으로 보여줄 것.',
  recommendations: [
    { place: '기업 사이트 메인', body: '회사 소개 — 공장·현장 비주얼을 커튼으로 단계 공개하며 우측에 브랜드 약속을 얹어 신뢰를 쌓음' },
    { place: '브랜드 캠페인 페이지', body: '비포·애프터 — 가림막이 걷히며 캠페인의 변화·결과를 극적으로 드러냄' },
    { place: '병원·기관 사이트', body: '진료 철학 — 차분한 슬랫 와이프(B)로 시술·공간 이미지를 건축적으로 공개' },
    { place: '제품·서비스 쇼케이스', body: '제품 공개 — 대각 클립(C)으로 신제품을 티저처럼 닦아내며 핵심 스펙을 병기' }
  ],
  tradeoff: '가림막을 걷는 동안 비주얼이 부분적으로만 보이므로, 정보 전달이 급한 비주얼(중요 도표 등)에는 부적합하다 — 무드·브랜드 연출용으로 쓸 것. 패널이 많고 미디어가 고해상 이미지면 합성 레이어가 커지므로 패널은 단색 rgba, 미디어는 1장으로 제한한다.',
  snippetHTML: '<div class="cr-visual">\n  <div class="cr-media"></div>\n  <div class="cr-panel" data-i="0"></div>\n  <div class="cr-panel" data-i="1"></div>\n  <div class="cr-panel" data-i="2"></div>\n  <div class="cr-panel" data-i="3"></div>\n</div>',
  snippetCSS: '.cr-panel { position: absolute; inset: 0;\n  background: rgba(255,255,255,0.72);   /* 반투명 가림막 */\n  will-change: transform; }',
  snippetJS: 'var panels = document.querySelectorAll(".cr-panel");\nfunction applyReveal(p){\n  panels.forEach(function(el, i){\n    var s = 0.12 + i * 0.15;            // 패널마다 윈도를 어긋나게\n    var lp = seg(p, s, s + 0.2);\n    el.style.transform = "translateY(" + (-110 * lp) + "%)"; // 위로 벗기기\n  });\n}',
  examples: [
    {
      key: 'a', id: 'vertical-stack', title: '수직 패널 순차 벗기기',
      desc: '한울피드 사례 — 정사각 미디어 위에 겹친 반투명 흰 패널 4장이 한 장씩 위로 벗겨져 비주얼이 4단계로 선명해진다. 동시에 우측 텍스트가 옆에서 미끄러져 들어오고, 하단 플로팅 카드가 떠오른다.',
      demo: {
        mode: 'scroll', trackVh: 260, height: 600,
        bodyHTML: '<section class="cr-wrap cr-a">\n'
          + '  <div class="cr-visual">\n'
          + '    <div class="cr-media"></div>\n'
          + '    <div class="cr-panel" data-i="0"></div>\n'
          + '    <div class="cr-panel" data-i="1"></div>\n'
          + '    <div class="cr-panel" data-i="2"></div>\n'
          + '    <div class="cr-panel" data-i="3"></div>\n'
          + '  </div>\n'
          + '  <div class="cr-text">\n'
          + '    <p class="iw-eyebrow">BRAND STORY</p>\n'
          + '    <h2 class="iw-head cr-title">100년을 바라보는<br>한울의 약속</h2>\n'
          + '    <p class="iw-body">한 톨의 곡물에서 시작된 신뢰가 식탁의 안전으로 이어집니다.</p>\n'
          + '  </div>\n'
          + '  <div class="cr-float"><span class="iw-tag">SINCE 1982</span><strong>40년 외길</strong></div>\n'
          + '</section>',
        css: '.cr-wrap { position: relative; width: min(1040px, 90vw); display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 56px; align-items: center; }\n'
          + '.cr-visual { position: relative; aspect-ratio: 4/3; border-radius: 18px; overflow: hidden; }\n'
          + '.cr-media { position: absolute; inset: 0; background: linear-gradient(135deg, #2a5641 0%, #15281d 60%, #0c1812 100%); }\n'
          + '.cr-panel { position: absolute; inset: 0; background: rgba(255,255,255,0.72); will-change: transform; }\n'
          + '.cr-text { opacity: 0; transform: translateX(40px); will-change: opacity, transform; }\n'
          + '.cr-a .iw-eyebrow { --accent: #6fe0a8; margin-bottom: 20px; }\n'
          + '.cr-title { margin-bottom: 22px; }\n'
          + '.cr-float { position: absolute; left: 50%; bottom: 7%; transform: translateY(60px); display: flex; flex-direction: column; gap: 6px; padding: 16px 22px; background: #0d0d0d; border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; opacity: 0; will-change: opacity, transform; }\n'
          + '.cr-float strong { font: 700 16px/1 "Pretendard Variable",sans-serif; color: #fff; }\n'
          + '.cr-float .iw-tag { --accent: #6fe0a8; color: #6fe0a8; }',
        js: 'var panels = stage.querySelectorAll(".cr-panel");\n'
          + 'var text = stage.querySelector(".cr-text");\n'
          + 'var floatEl = stage.querySelector(".cr-float");\n'
          + 'function applyReveal(p){\n'
          + '  for (var i = 0; i < panels.length; i++){\n'
          + '    var s = 0.12 + i * 0.15;\n'
          + '    var lp = seg(p, s, s + 0.2);\n'
          + '    panels[i].style.transform = "translateY(" + (-110 * lp) + "%)";\n'
          + '  }\n'
          + '  var tp = seg(p, 0.2, 0.5);\n'
          + '  text.style.opacity = tp;\n'
          + '  text.style.transform = "translateX(" + (40 * (1 - tp)) + "px)";\n'
          + '  var fp = seg(p, 0.55, 0.85);\n'
          + '  floatEl.style.opacity = fp;\n'
          + '  floatEl.style.transform = "translateY(" + (60 * (1 - fp)) + "px)";\n'
          + '}'
      }
    },
    {
      key: 'b', id: 'blind-slats', title: '가로 블라인드 슬랫',
      desc: '온결의원 사례 — 비주얼을 덮은 가로 슬랫 8장이 위에서 아래로 시차를 두고 한 줄씩 접히며 블라인드를 걷어 올리듯 이미지가 드러난다. 노출이 끝나면 하단 캡션이 떠오른다.',
      demo: {
        mode: 'scroll', trackVh: 260, height: 600,
        bodyHTML: '<section class="bs-wrap">\n'
          + '  <div class="bs-visual">\n'
          + '    <div class="bs-media"><div class="bs-cap"><p class="iw-eyebrow">CLINIC</p><h2 class="iw-head">통증 없는 일상을<br>되돌려 드립니다</h2></div></div>\n'
          + '    <div class="bs-slats">\n'
          + '      <div class="bs-slat" style="top:0%"></div>\n'
          + '      <div class="bs-slat" style="top:12.5%"></div>\n'
          + '      <div class="bs-slat" style="top:25%"></div>\n'
          + '      <div class="bs-slat" style="top:37.5%"></div>\n'
          + '      <div class="bs-slat" style="top:50%"></div>\n'
          + '      <div class="bs-slat" style="top:62.5%"></div>\n'
          + '      <div class="bs-slat" style="top:75%"></div>\n'
          + '      <div class="bs-slat" style="top:87.5%"></div>\n'
          + '    </div>\n'
          + '  </div>\n'
          + '  <p class="iw-body bs-sub">온결의원 · 정형외과 · 통증의학과</p>\n'
          + '</section>',
        css: '.bs-wrap { width: min(720px, 88vw); display: flex; flex-direction: column; align-items: center; gap: 22px; }\n'
          + '.bs-visual { position: relative; width: 100%; aspect-ratio: 16/9; border-radius: 18px; overflow: hidden; }\n'
          + '.bs-media { position: absolute; inset: 0; background: linear-gradient(140deg, #18324a 0%, #0e2233 55%, #0a161f 100%); display: flex; align-items: center; justify-content: center; }\n'
          + '.bs-cap { text-align: center; }\n'
          + '.bs-wrap .iw-eyebrow { --accent: #5cc8ff; margin-bottom: 16px; }\n'
          + '.bs-slats { position: absolute; inset: 0; }\n'
          + '.bs-slat { position: absolute; left: 0; right: 0; height: 12.5%; background: #0a0a0a; transform-origin: top; will-change: transform; }\n'
          + '.bs-sub { opacity: 0; transform: translateY(16px); will-change: opacity, transform; }',
        js: 'var slats = stage.querySelectorAll(".bs-slat");\n'
          + 'var sub = stage.querySelector(".bs-sub");\n'
          + 'function applyReveal(p){\n'
          + '  for (var i = 0; i < slats.length; i++){\n'
          + '    var s = 0.1 + i * 0.06;\n'
          + '    var lp = seg(p, s, s + 0.18);\n'
          + '    slats[i].style.transform = "scaleY(" + (1 - lp) + ")";\n'
          + '  }\n'
          + '  var sp = seg(p, 0.7, 0.95);\n'
          + '  sub.style.opacity = sp;\n'
          + '  sub.style.transform = "translateY(" + (16 * (1 - sp)) + "px)";\n'
          + '}'
      }
    },
    {
      key: 'c', id: 'diagonal-clip', title: '대각 클립 와이프',
      desc: '유진정밀 사례 — 비주얼을 덮은 오버레이가 좌상단에서 우하단 방향으로 대각선으로 쓸려 나가며 이미지가 드러나고, 미디어는 살짝 확대됐다가 안정화된다. 우측 텍스트가 동반 진입한다.',
      demo: {
        mode: 'scroll', trackVh: 260, height: 600,
        bodyHTML: '<section class="dc-wrap">\n'
          + '  <div class="dc-visual">\n'
          + '    <div class="dc-media"><span class="iw-tag">YUJIN PRECISION</span></div>\n'
          + '    <div class="dc-overlay"></div>\n'
          + '  </div>\n'
          + '  <div class="dc-text">\n'
          + '    <p class="iw-eyebrow">PRECISION PARTS</p>\n'
          + '    <h2 class="iw-head">0.01mm가<br>완성품을 가릅니다</h2>\n'
          + '    <p class="iw-body">정밀 사출·금형 기술로 글로벌 제조의 기준을 만듭니다.</p>\n'
          + '  </div>\n'
          + '</section>',
        css: '.dc-wrap { width: min(1040px, 90vw); display: grid; grid-template-columns: 1fr 0.85fr; gap: 52px; align-items: center; }\n'
          + '.dc-visual { position: relative; aspect-ratio: 4/3; border-radius: 18px; overflow: hidden; }\n'
          + '.dc-media { position: absolute; inset: 0; background: linear-gradient(135deg, #2b2f3a 0%, #15171d 60%, #0a0b0e 100%); display: flex; align-items: flex-end; padding: 22px; will-change: transform; }\n'
          + '.dc-overlay { position: absolute; inset: 0; background: #0a0a0a; clip-path: polygon(0% 0, 100% 0, 100% 100%, -16% 100%); will-change: clip-path; }\n'
          + '.dc-text { opacity: 0; transform: translateY(30px); will-change: opacity, transform; }\n'
          + '.dc-wrap .iw-eyebrow { --accent: #8ab4ff; margin-bottom: 18px; }\n'
          + '.dc-text .iw-head { margin-bottom: 20px; }',
        js: 'var overlay = stage.querySelector(".dc-overlay");\n'
          + 'var media = stage.querySelector(".dc-media");\n'
          + 'var text = stage.querySelector(".dc-text");\n'
          + 'function applyReveal(p){\n'
          + '  var w = seg(p, 0.05, 0.7);\n'
          + '  var x0 = w * 100;\n'
          + '  var x1 = w * 100 - 16;\n'
          + '  overlay.style.clipPath = "polygon(" + x0 + "% 0, 100% 0, 100% 100%, " + x1 + "% 100%)";\n'
          + '  media.style.transform = "scale(" + (1.06 - 0.06 * w) + ")";\n'
          + '  var tp = seg(p, 0.3, 0.65);\n'
          + '  text.style.opacity = tp;\n'
          + '  text.style.transform = "translateY(" + (30 * (1 - tp)) + "px)";\n'
          + '}'
      }
    }
  ]
};

const E03 = {
  id: 'pinned-watermark-typo', num: '03', title: '핀 워터마크 타이포 무대',
  summary: '제품·사업 카드 그리드 뒤에 거대한 브랜드 워드마크를 배경 레이어로 깔고, 전경 카드들이 각자 다른 타이밍의 패럴랙스로 글자 위를 지나가게 해 깊이감을 만드는 2겹 z-레이어 쇼케이스 섹션. 텍스트가 "읽히는 효과"(scroll-text-reveal)가 아니라 콘텐츠 뒤의 무대 배경으로 기능하는 것, 그리고 자동으로 흐르는 마퀴(infinite-marquee)와 달리 스크롤 진행률에만 반응하는 것이 구분점이다.',
  evidence: 'daehanfeed sec2 — ScrollTrigger pin ".bgTxt" 1474×368 거대 SVG 워드마크 + 제품 카드 4장 li별 독립 scrub(y 50%→0) 패럴랙스 / nifco #mainGlobal — 알파 0.05 초대형 워터마크를 지구본 뒤 레이어로 까는 관습',
  explain: 'A(라이즈 그리드)는 거대 워드마크를 opacity 0→0.14·translateY 8vh→0으로 떠오르게 하는 동안, 비대칭 매거진 그리드의 카드 4장을 startP 0.15/0.3/0.45/0.6의 서로 다른 윈도에서 translateY 36vh→0으로 통과시켜 층간 속도비 약 1:4의 패럴랙스를 만든다. B(아웃라인→필)는 동일 텍스트를 2벌 겹쳐 아래층은 -webkit-text-stroke 윤곽선으로 고정하고, 위층(채움본)의 clip-path inset 우측 값을 progress로 100%→0% 줄여 좌→우로 면을 채우며 전체 scale 1.06→1로 안정화한다. C(가로 드리프트)는 배경 워드마크를 translateX(-p·30vw)로 스크롤에 1:1 매핑해 가로로 미끄러뜨리되 — autoplay 마퀴와 달리 스크롤을 멈추면 함께 멈추고 되감으면 되돌아온다 — 전경 카드 2행은 translateX(±12vw·(1-p))로 좌·우 반대편에서 진입한다.',
  kv: [
    { label: '의존성', value: 'Vanilla JS — transform/clip-path inline 보간' },
    { label: '트리거', value: '스크롤 진행률' },
    { label: '스크롤 트랙', value: '260vh + sticky 100vh' },
    { label: '핵심 매핑', value: '워드마크 opacity 0→0.14·y 8vh→0 / 카드 startP 0.15·0.3·0.45·0.6' },
    { label: '권장 콘텐츠', value: '브랜드 워드마크 1 + 제품·사업 카드 4~6' },
    { label: '실측 레퍼런스', value: 'daehanfeed sec2 PRODUCTS · nifco #mainGlobal' }
  ],
  guide: '배경 워드마크는 opacity 0.06~0.16 사이로 충분히 가라앉혀야 전경 카드의 가독성을 해치지 않는다 — 너무 진하면 무대 배경이 아니라 또 하나의 콘텐츠로 읽힌다. pointer-events:none으로 배경층의 클릭을 차단할 것. 전·후경의 이동량 차이(속도비)가 깊이감의 핵심이므로 카드 이동량을 워드마크의 3~5배로 잡는다. C(가로 드리프트)는 진행률 1:1이라 마퀴처럼 보이지만 사용자가 스크롤을 멈추면 멈추는 것이 의도 — 데모 카피에 이 차이를 명시했다. prefers-reduced-motion에서는 워드마크를 정적 배치하고 카드 패럴랙스를 끌 것.',
  recommendations: [
    { place: '기업 사이트 메인', body: '사업영역 — 브랜드 워드마크를 무대 삼아 제품·사업부 카드를 패럴랙스로 통과시켜 규모감을 연출' },
    { place: '브랜드 캠페인 페이지', body: '키 메시지 — 캠페인 슬로건을 거대 타이포로 깔고 핵심 포인트 카드를 그 위로 흘림' },
    { place: '병원·기관 사이트', body: '진료과·부서 — 기관명 워드마크 배경 + 진료과 카드 그리드로 전문성과 규모를 동시 제시' },
    { place: '제품·서비스 쇼케이스', body: '라인업 — 아웃라인→필(B)로 브랜드명을 채우며 제품 카테고리를 무대 위로 부상' }
  ],
  tradeoff: '배경 워드마크와 전경 카드가 겹치는 구간에서 대비가 부족하면 둘 다 읽기 어려워진다 — 워드마크 투명도와 카드 배경 불투명도를 함께 조절해 항상 카드가 우위에 있게 할 것. 거대 타이포는 좁은 화면에서 잘리기 쉬우므로 white-space:nowrap + viewport 단위 폰트로 반응형을 보장한다.',
  snippetHTML: '<section class="wm-wrap">\n  <div class="wm-word">HANWOOL</div>   <!-- 배경 워드마크 -->\n  <div class="wm-grid">\n    <article class="wm-card" data-i="0">…</article>\n    <!-- 카드 4~6장 -->\n  </div>\n</section>',
  snippetCSS: '.wm-word { position: absolute; font-size: 18vw; opacity: 0;\n  pointer-events: none; z-index: 0; will-change: opacity, transform; }\n.wm-grid { position: relative; z-index: 2; } /* 전경 카드가 글자 위로 */',
  snippetJS: 'var word = document.querySelector(".wm-word");\nvar cards = document.querySelectorAll(".wm-card");\nvar starts = [0.15, 0.3, 0.45, 0.6];\nfunction applyReveal(p){\n  word.style.opacity = seg(p, 0, 0.35) * 0.14;          // 배경: 0→0.14\n  word.style.transform = "translateY(" + (8*(1-seg(p,0,0.5))) + "vh)";\n  cards.forEach(function(c, i){\n    var lp = seg(p, starts[i], starts[i] + 0.3);         // 전경: 카드별 시차\n    c.style.opacity = lp;\n    c.style.transform = "translateY(" + (36*(1-lp)) + "vh)"; // 이동량 ×4 = 깊이\n  });\n}',
  examples: [
    {
      key: 'a', id: 'rise-grid', title: '워드마크 부상 + 카드 패럴랙스',
      desc: '한울피드 사례 — 거대 워드마크가 뒤에서 서서히 떠오르는 동안 비대칭 매거진 그리드의 제품 카드 4장이 각자 다른 타이밍에 글자 위로 흘러 올라온다. 층간 이동량 차이가 공기층 같은 깊이를 만든다.',
      demo: {
        mode: 'scroll', trackVh: 260, height: 600,
        bodyHTML: '<section class="wm-wrap wm-a">\n'
          + '  <div class="wm-word">HANWOOL</div>\n'
          + '  <div class="wm-grid">\n'
          + '    <article class="wm-card" data-i="0"><span class="iw-tag">양계 사료</span><h3 class="iw-sub">건강한 산란</h3></article>\n'
          + '    <article class="wm-card" data-i="1"><span class="iw-tag">양돈 사료</span><h3 class="iw-sub">균형 성장</h3></article>\n'
          + '    <article class="wm-card" data-i="2"><span class="iw-tag">축우 사료</span><h3 class="iw-sub">고품질 원유</h3></article>\n'
          + '    <article class="wm-card" data-i="3"><span class="iw-tag">양어 사료</span><h3 class="iw-sub">맑은 양식</h3></article>\n'
          + '  </div>\n'
          + '</section>',
        css: '.wm-wrap { position: relative; width: min(1100px, 92vw); height: 78vh; display: flex; align-items: center; justify-content: center; }\n'
          + '.wm-word { position: absolute; font: 900 18vw/1 "Pretendard Variable",sans-serif; letter-spacing: -0.04em; color: #fff; opacity: 0; white-space: nowrap; pointer-events: none; z-index: 0; will-change: opacity, transform; }\n'
          + '.wm-grid { position: relative; z-index: 2; display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 18px; width: min(560px, 82vw); }\n'
          + '.wm-card { background: linear-gradient(150deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02)); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 26px 24px; min-height: 150px; display: flex; flex-direction: column; justify-content: space-between; will-change: opacity, transform; }\n'
          + '.wm-card:nth-child(2) { margin-top: 44px; }\n'
          + '.wm-card:nth-child(3) { margin-top: -44px; }\n'
          + '.wm-a .iw-tag { --accent: #6fe0a8; color: #6fe0a8; }\n'
          + '.wm-card .iw-sub { font-size: clamp(18px,2vw,24px); }',
        js: 'var word = stage.querySelector(".wm-word");\n'
          + 'var cards = stage.querySelectorAll(".wm-card");\n'
          + 'var starts = [0.15, 0.3, 0.45, 0.6];\n'
          + 'function applyReveal(p){\n'
          + '  word.style.opacity = seg(p, 0, 0.35) * 0.14;\n'
          + '  word.style.transform = "translateY(" + (8 * (1 - seg(p, 0, 0.5))) + "vh)";\n'
          + '  for (var i = 0; i < cards.length; i++){\n'
          + '    var lp = seg(p, starts[i], starts[i] + 0.3);\n'
          + '    cards[i].style.opacity = lp;\n'
          + '    cards[i].style.transform = "translateY(" + (36 * (1 - lp)) + "vh)";\n'
          + '  }\n'
          + '}'
      }
    },
    {
      key: 'b', id: 'outline-fill', title: '아웃라인 → 필 전환',
      desc: '유진정밀 사례 — 처음엔 윤곽선뿐이던 거대 타이포가 스크롤에 따라 좌→우로 면이 채워지고 살짝 스케일이 안정화되며 무대가 완성된다. 채움이 끝나면 아래 캡션이 떠오른다.',
      demo: {
        mode: 'scroll', trackVh: 260, height: 600,
        bodyHTML: '<section class="of-wrap">\n'
          + '  <div class="of-typo">\n'
          + '    <span class="of-stroke">PRECISION</span>\n'
          + '    <span class="of-fill">PRECISION</span>\n'
          + '  </div>\n'
          + '  <div class="of-center">\n'
          + '    <p class="iw-eyebrow">YUJIN PRECISION</p>\n'
          + '    <h2 class="iw-sub">정밀이 곧 신뢰입니다</h2>\n'
          + '  </div>\n'
          + '</section>',
        css: '.of-wrap { position: relative; width: min(1100px, 94vw); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 30px; }\n'
          + '.of-typo { position: relative; will-change: transform; }\n'
          + '.of-typo span { display: block; font: 900 clamp(48px,15vw,200px)/1 "Pretendard Variable",sans-serif; letter-spacing: -0.03em; white-space: nowrap; }\n'
          + '.of-stroke { -webkit-text-stroke: 1px rgba(255,255,255,0.32); color: transparent; }\n'
          + '.of-fill { position: absolute; inset: 0; color: #fff; -webkit-text-stroke: 1px #fff; clip-path: inset(0 100% 0 0); will-change: clip-path; }\n'
          + '.of-center { opacity: 0; transform: translateY(20px); text-align: center; display: flex; flex-direction: column; gap: 12px; align-items: center; will-change: opacity, transform; }\n'
          + '.of-wrap .iw-eyebrow { --accent: #8ab4ff; }',
        js: 'var fill = stage.querySelector(".of-fill");\n'
          + 'var typo = stage.querySelector(".of-typo");\n'
          + 'var center = stage.querySelector(".of-center");\n'
          + 'function applyReveal(p){\n'
          + '  var f = seg(p, 0.05, 0.7);\n'
          + '  fill.style.clipPath = "inset(0 " + ((1 - f) * 100) + "% 0 0)";\n'
          + '  typo.style.transform = "scale(" + (1.06 - 0.06 * p) + ")";\n'
          + '  var cp = seg(p, 0.35, 0.75);\n'
          + '  center.style.opacity = cp;\n'
          + '  center.style.transform = "translateY(" + (20 * (1 - cp)) + "px)";\n'
          + '}'
      }
    },
    {
      key: 'c', id: 'horizontal-drift', title: '워드마크 가로 드리프트',
      desc: '선재자산운용 사례 — 배경 워드마크가 스크롤 진행률에 비례해 가로로 미끄러진다(자동 마퀴가 아니라 멈추면 같이 멈춘다). 그 위로 전경 카드 2행이 좌·우 반대편에서 슬라이드 인한다.',
      demo: {
        mode: 'scroll', trackVh: 260, height: 600,
        bodyHTML: '<section class="hd-wrap">\n'
          + '  <div class="hd-word">SUNJAE · VALUE · SUNJAE · VALUE</div>\n'
          + '  <div class="hd-rows">\n'
          + '    <div class="hd-row hd-row1"><article class="hd-card">국내주식</article><article class="hd-card">채권형</article><article class="hd-card">멀티에셋</article></div>\n'
          + '    <div class="hd-row hd-row2"><article class="hd-card">글로벌</article><article class="hd-card">대체투자</article><article class="hd-card">연금</article></div>\n'
          + '  </div>\n'
          + '</section>',
        css: '.hd-wrap { position: relative; width: 100%; height: 78vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px; overflow: hidden; }\n'
          + '.hd-word { position: absolute; top: 18%; left: 0; font: 900 16vw/1 "Pretendard Variable",sans-serif; letter-spacing: -0.02em; color: rgba(255,255,255,0.06); white-space: nowrap; pointer-events: none; will-change: transform; }\n'
          + '.hd-rows { position: relative; z-index: 2; display: flex; flex-direction: column; gap: 16px; }\n'
          + '.hd-row { display: flex; gap: 16px; justify-content: center; will-change: transform, opacity; }\n'
          + '.hd-card { padding: 26px 30px; min-width: 150px; background: linear-gradient(150deg, #1a2740, #0d1322); border: 1px solid rgba(201,168,106,0.25); border-radius: 14px; font: 700 17px/1.4 "Pretendard Variable",sans-serif; color: #fff; text-align: center; }',
        js: 'var word = stage.querySelector(".hd-word");\n'
          + 'var row1 = stage.querySelector(".hd-row1");\n'
          + 'var row2 = stage.querySelector(".hd-row2");\n'
          + 'function applyReveal(p){\n'
          + '  word.style.transform = "translateX(" + (-p * 30) + "vw)";\n'
          + '  var op = seg(p, 0, 0.6);\n'
          + '  row1.style.transform = "translateX(" + (12 * (1 - p)) + "vw)";\n'
          + '  row1.style.opacity = op;\n'
          + '  row2.style.transform = "translateX(" + (-12 * (1 - p)) + "vw)";\n'
          + '  row2.style.opacity = op;\n'
          + '}'
      }
    }
  ]
};

const E04 = {
  id: 'opposed-split-panel', num: '04', title: '대향 분할 패널 스토리',
  summary: '100vh 핀 무대를 좌우로 분할하고 두 패널 스택을 서로 반대 방향으로 슬라이드시켜, 컬러 패널·텍스트·장면이 어긋나며 톱니처럼 맞물리는 철학·스토리텔링 섹션. 진행률 하나가 두 레일을 역방향으로 끌어 "맞물리는" 시그니처 리듬을 만든다.',
  evidence: 'doodoorim .phil_sect — pin + scrub:5로 좌 컬럼 y -66.66%→0 하강·우 컬럼 +66.66%→0 상승의 3단계 대향 슬라이드(두드림/다드림 2장면) / nifco #mainNotice — 좌열 -9rem·우열 +9rem 반대 방향 스크럽(역방향 듀얼 레일 보강)',
  explain: 'A(듀얼 컬럼)는 좌우 두 컬럼에 각각 100vh 아이템 3개를 세로로 쌓고, 좌 트랙은 translateY -66.66%→0(아래로 흐름)·우 트랙은 0→-66.66%(위로 흐름)로 같은 progress에 반대로 매핑해 임의 지점에서 좌우가 한 장면을 이루도록 콘텐츠를 엇갈리게 배치한다. B(중앙 개폐)는 중앙 메시지를 덮은 좌·우 패널을 translateX(-100%/+100%)로 양옆으로 열며 가운데 콘텐츠를 scale 0.9→1·opacity로 드러내는 문(門) 메타포다. C(스텝 스냅)는 같은 대향 구조에 진행률을 2단계로 양자화해 — pos=floor(p·2)+easeInOut(구간의 25~75%만 이동) — 장면 경계에서 "찰칵" 멈췄다 넘어가는 절도 있는 전환을 만든다. 세 변형 모두 inline transform 1:1이라 역스크롤로 정확히 역재생된다.',
  kv: [
    { label: '의존성', value: 'Vanilla JS — 대향 translateY/translateX 보간' },
    { label: '트리거', value: '스크롤 진행률' },
    { label: '스크롤 트랙', value: '280vh + sticky 100vh' },
    { label: '핵심 매핑', value: '좌 -66.66%→0 / 우 0→-66.66% (역부호 대향)' },
    { label: '권장 콘텐츠', value: '3장면(컬러+타이틀+본문) · 좌우 짝 콘텐츠 설계' },
    { label: '실측 레퍼런스', value: 'doodoorim .phil_sect · nifco #mainNotice' }
  ],
  guide: '대향 슬라이드의 생명은 "좌우가 항상 한 장면을 이룬다"는 콘텐츠 설계다 — 임의 진행률에서 왼쪽 절반과 오른쪽 절반이 의미 있게 짝지어지도록 아이템 순서를 맞춰야 한다. 컬럼당 아이템은 3개가 적정(2개는 단조, 4개 이상은 스크롤이 길어짐). 트랙 높이는 아이템 수 × 100vh로 정확히 맞춰 줄 걸침을 막는다. B의 중앙 개폐는 패널이 완전히 열리기 전(0.85 전후)에 중앙 콘텐츠가 충분히 드러나야 답답하지 않다. prefers-reduced-motion에서는 최종 정렬 상태를 정적으로 보여줄 것.',
  recommendations: [
    { place: '기업 사이트 메인', body: '비전·미션 — 좌우 대향으로 두 가치(예: 전통/혁신)를 교차시켜 균형을 시각화' },
    { place: '브랜드 캠페인 페이지', body: '대비 메시지 — 문제/해결, 과거/미래를 양옆에서 맞물리게 해 캠페인 논리를 연출' },
    { place: '병원·기관 사이트', body: '진료 철학 — 단계별 철학(진단→치료→관리)을 대향 슬라이드로 서사화(온결의원 원형)' },
    { place: '제품·서비스 쇼케이스', body: '공정·라인업 — 스텝 스냅(C)으로 제조 단계를 또렷한 정지 화면으로 한 단계씩 제시' }
  ],
  tradeoff: '두 레일이 동시에 움직여 시각 정보량이 많으므로, 주변에 다른 모션이 있으면 과부하가 된다 — 페이지에서 독립적으로 쓸 것. 좌우 짝 콘텐츠 설계가 어긋나면 "그냥 두 개가 따로 움직이는" 인상이 되어 맞물림의 묘미가 사라진다.',
  snippetHTML: '<section class="sp-wrap">\n  <div class="sp-col sp-left"><div class="sp-track"><!-- 100vh 아이템 3 --></div></div>\n  <div class="sp-col sp-right"><div class="sp-track"><!-- 100vh 아이템 3 --></div></div>\n</section>',
  snippetCSS: '.sp-col { position: relative; flex: 1; height: 100%; overflow: hidden; }\n.sp-track { position: absolute; inset: 0 0 auto; will-change: transform; }\n.sp-item { height: 100vh; }\n.sp-left .sp-track { transform: translateY(-66.66%); } /* 초기: 아래 장면 */',
  snippetJS: 'var L = document.querySelector(".sp-left .sp-track");\nvar R = document.querySelector(".sp-right .sp-track");\nfunction applyReveal(p){              // 같은 p, 반대 부호\n  L.style.transform = "translateY(" + (-66.66 * (1 - p)) + "%)"; // 아래로\n  R.style.transform = "translateY(" + (-66.66 * p) + "%)";       // 위로\n}',
  examples: [
    {
      key: 'a', id: 'dual-columns', title: '듀얼 역방향 컬럼',
      desc: '온결의원 사례 — 왼쪽 컬럼은 아래로, 오른쪽 컬럼은 위로 연속 보간되며 진료 철학 3단계(진단→치료→관리)의 타이틀과 설명이 교차로 맞물린다. 스크롤을 되감으면 장면이 정확히 역재생된다.',
      demo: {
        mode: 'scroll', trackVh: 280, height: 600,
        bodyHTML: '<section class="sp-wrap sp-a">\n'
          + '  <div class="sp-col sp-left"><div class="sp-track">\n'
          + '    <div class="sp-item sp-i0"><div><span class="iw-tag">01 PHILOSOPHY</span><h2 class="iw-head">정확한 진단</h2></div></div>\n'
          + '    <div class="sp-item sp-i1"><div><span class="iw-tag">02 PHILOSOPHY</span><h2 class="iw-head">근본 치료</h2></div></div>\n'
          + '    <div class="sp-item sp-i2"><div><span class="iw-tag">03 PHILOSOPHY</span><h2 class="iw-head">꾸준한 관리</h2></div></div>\n'
          + '  </div></div>\n'
          + '  <div class="sp-col sp-right"><div class="sp-track">\n'
          + '    <div class="sp-item sp-r0"><p class="iw-body">통증의 원인을 찾는 데서 회복이 시작됩니다.</p></div>\n'
          + '    <div class="sp-item sp-r1"><p class="iw-body">증상이 아니라 원인을 치료합니다.</p></div>\n'
          + '    <div class="sp-item sp-r2"><p class="iw-body">재발 없는 일상까지 함께합니다.</p></div>\n'
          + '  </div></div>\n'
          + '</section>',
        css: '.sp-wrap { position: absolute; inset: 0; display: flex; }\n'
          + '.sp-col { position: relative; flex: 1; height: 100%; overflow: hidden; }\n'
          + '.sp-left { border-right: 1px solid rgba(255,255,255,0.08); }\n'
          + '.sp-track { position: absolute; top: 0; left: 0; right: 0; will-change: transform; }\n'
          + '.sp-item { height: 100vh; display: flex; align-items: center; justify-content: center; padding: 0 9%; text-align: center; }\n'
          + '.sp-i0 { background: #14342a; } .sp-i1 { background: #0f2620; } .sp-i2 { background: #0a1813; }\n'
          + '.sp-r0 { background: #122a3e; } .sp-r1 { background: #0e2030; } .sp-r2 { background: #0a1722; }\n'
          + '.sp-a .iw-tag { --accent: #6fe0a8; color: #6fe0a8; margin-bottom: 14px; display: block; }\n'
          + '.sp-left .sp-track { transform: translateY(-66.66%); }',
        js: 'var L = stage.querySelector(".sp-left .sp-track");\n'
          + 'var R = stage.querySelector(".sp-right .sp-track");\n'
          + 'function applyReveal(p){\n'
          + '  L.style.transform = "translateY(" + (-66.66 * (1 - p)) + "%)";\n'
          + '  R.style.transform = "translateY(" + (-66.66 * p) + "%)";\n'
          + '}'
      }
    },
    {
      key: 'b', id: 'center-open', title: '중앙 개폐형',
      desc: '선재자산운용 사례 — 화면을 덮고 있던 좌·우 패널이 진행률에 따라 양옆으로 열리며 가운데 숨어 있던 핵심 메시지가 확대되며 드러난다. 문이 열리는 메타포로 메시지를 강조한다.',
      demo: {
        mode: 'scroll', trackVh: 280, height: 600,
        bodyHTML: '<section class="co-wrap">\n'
          + '  <div class="co-center">\n'
          + '    <p class="iw-eyebrow">SUNJAE</p>\n'
          + '    <h2 class="iw-head">신뢰는<br>시간이 만듭니다</h2>\n'
          + '    <p class="iw-body">30년간 지켜온 약속이 자산의 미래가 됩니다.</p>\n'
          + '  </div>\n'
          + '  <div class="co-panel co-left"><span class="co-pn">VALUE</span></div>\n'
          + '  <div class="co-panel co-right"><span class="co-pn">TRUST</span></div>\n'
          + '</section>',
        css: '.co-wrap { position: absolute; inset: 0; }\n'
          + '.co-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; text-align: center; padding: 0 32px; opacity: 0; transform: scale(0.9); will-change: opacity, transform; }\n'
          + '.co-wrap .iw-eyebrow { --accent: #c9a86a; }\n'
          + '.co-panel { position: absolute; top: 0; bottom: 0; width: 50%; display: flex; align-items: center; justify-content: center; will-change: transform; z-index: 2; }\n'
          + '.co-left { left: 0; background: linear-gradient(135deg, #1a2740, #0c1322); }\n'
          + '.co-right { right: 0; background: linear-gradient(225deg, #241a36, #100c1a); }\n'
          + '.co-pn { font: 900 clamp(40px,7vw,90px)/1 "Pretendard Variable",sans-serif; letter-spacing: 0.1em; color: rgba(255,255,255,0.14); }',
        js: 'var left = stage.querySelector(".co-left");\n'
          + 'var right = stage.querySelector(".co-right");\n'
          + 'var center = stage.querySelector(".co-center");\n'
          + 'function applyReveal(p){\n'
          + '  var o = seg(p, 0.05, 0.85);\n'
          + '  left.style.transform = "translateX(" + (-100 * o) + "%)";\n'
          + '  right.style.transform = "translateX(" + (100 * o) + "%)";\n'
          + '  var c = seg(p, 0.4, 0.95);\n'
          + '  center.style.opacity = c;\n'
          + '  center.style.transform = "scale(" + (0.9 + 0.1 * c) + ")";\n'
          + '}'
      }
    },
    {
      key: 'c', id: 'step-snap', title: '스텝 장면 락',
      desc: '유진정밀 사례 — 연속 슬라이드 대신 진행률을 2단계로 양자화해, 제조 공정 3장면이 경계에서 "찰칵" 하고 맞물려 멈췄다 넘어간다. 각 장면이 또렷한 정지 화면을 갖는다.',
      demo: {
        mode: 'scroll', trackVh: 280, height: 600,
        bodyHTML: '<section class="sp-wrap sp-c">\n'
          + '  <div class="sp-col sp-left"><div class="sp-track">\n'
          + '    <div class="sp-item sp-i0"><div><span class="iw-tag">STEP 01</span><h2 class="iw-head">정밀 설계</h2></div></div>\n'
          + '    <div class="sp-item sp-i1"><div><span class="iw-tag">STEP 02</span><h2 class="iw-head">초정밀 사출</h2></div></div>\n'
          + '    <div class="sp-item sp-i2"><div><span class="iw-tag">STEP 03</span><h2 class="iw-head">전수 검사</h2></div></div>\n'
          + '  </div></div>\n'
          + '  <div class="sp-col sp-right"><div class="sp-track">\n'
          + '    <div class="sp-item sp-r0"><p class="iw-body">3D 모델링으로 0.01mm 공차를 설계합니다.</p></div>\n'
          + '    <div class="sp-item sp-r1"><p class="iw-body">금형 온도를 실시간 제어해 균일하게 성형합니다.</p></div>\n'
          + '    <div class="sp-item sp-r2"><p class="iw-body">전수 비전 검사로 불량률 0을 지향합니다.</p></div>\n'
          + '  </div></div>\n'
          + '</section>',
        css: '.sp-wrap { position: absolute; inset: 0; display: flex; }\n'
          + '.sp-col { position: relative; flex: 1; height: 100%; overflow: hidden; }\n'
          + '.sp-left { border-right: 1px solid rgba(255,255,255,0.08); }\n'
          + '.sp-track { position: absolute; top: 0; left: 0; right: 0; will-change: transform; }\n'
          + '.sp-item { height: 100vh; display: flex; align-items: center; justify-content: center; padding: 0 9%; text-align: center; }\n'
          + '.sp-i0 { background: #1e2230; } .sp-i1 { background: #161a25; } .sp-i2 { background: #0e1019; }\n'
          + '.sp-r0 { background: #202533; } .sp-r1 { background: #181c28; } .sp-r2 { background: #101219; }\n'
          + '.sp-c .iw-tag { --accent: #8ab4ff; color: #8ab4ff; margin-bottom: 14px; display: block; }\n'
          + '.sp-left .sp-track { transform: translateY(0%); }\n'
          + '.sp-right .sp-track { transform: translateY(-66.66%); }',
        js: 'var L = stage.querySelector(".sp-left .sp-track");\n'
          + 'var R = stage.querySelector(".sp-right .sp-track");\n'
          + 'function snapPos(p){\n'
          + '  var g = p * 2;\n'
          + '  var gi = Math.min(1, Math.floor(g));\n'
          + '  var gf = g - gi;\n'
          + '  return gi + easeInOut(clamp01((gf - 0.25) / 0.5));\n'
          + '}\n'
          + 'function applyReveal(p){\n'
          + '  var pos = snapPos(p);\n'
          + '  L.style.transform = "translateY(" + (-pos * 33.33) + "%)";\n'
          + '  R.style.transform = "translateY(" + (-(2 - pos) * 33.33) + "%)";\n'
          + '}'
      }
    }
  ]
};

const E05 = {
  id: 'pinned-column-feed', num: '05', title: '핀 칼럼 + 통과 피드',
  summary: '소개·타이틀이 담긴 한쪽 칼럼을 핀으로 고정한 채, 반대쪽 카드 피드(통계·뉴스·가치)만 스크롤에 따라 스쳐 올라가게 하는 2컬럼 스토리 섹션. 고정된 맥락(누구인가) 옆으로 증거(숫자·소식)가 흘러가는 구조로, 고정 대상이 칼럼이라는 점에서 카드가 제자리에서 교체되는 scroll-card-update와 반대다.',
  evidence: 'amnesty .main-intro — 좌 칼럼 pin(pinSpacing:false, scrub:2) + 우측 글래스 통계 카드 3장(160개국·1,000만 명·65년) 순차 통과 / nifco #mainNotice — 핀 타이틀 + 좌열 -9rem·우열 +9rem 역방향 카드 / ildongcare se-04 — pin + scrub:7 ±90px staggered 그리드 yPercent -70',
  explain: '무대 전체가 sticky로 핀 고정되므로 한쪽 칼럼은 자연히 화면에 머물고, 반대쪽 피드만 progress로 이동시킨다. A(글래스 통계)는 좌측 소개 칼럼을 고정한 채 우측 반투명 글래스 카드 3장을 윈도 [0.1+i·0.18, +0.25]에서 translateY(80px→0)·opacity로 띄운 뒤 후반에 -40px까지 떠밀어 "스쳐 올라가는" 흐름을 만든다. B(역방향 레일)는 핀 타이틀 옆 2열 그리드에서 좌열 translateY(-p·9rem)·우열(+p·9rem)을 대향 매핑해 지면이 갈라지듯 흐른다. C(스테이지 드리프트)는 한쪽 모서리가 둥근(border-radius 400px) 컬러 밴드를 translateX(100%→0)로 측면에서 진입시켜 무대를 깔고, ±90px 엇갈린 카드 그리드를 translateY(-70%)로 통째로 드리프트시킨다(원본 ildongcare의 scrub:7 무거운 관성은 데모에서 직접 매핑으로 단순화).',
  kv: [
    { label: '의존성', value: 'Vanilla JS — sticky 무대 + 피드 translateY 보간' },
    { label: '트리거', value: '스크롤 진행률' },
    { label: '스크롤 트랙', value: '260vh + sticky 100vh' },
    { label: '핵심 매핑', value: '카드 i 윈도 [0.1+i·0.18, +0.25] · translateY 80px→0→-40px' },
    { label: '권장 콘텐츠', value: '고정 소개 칼럼 + 피드 카드 3~6' },
    { label: '실측 레퍼런스', value: 'amnesty .main-intro · nifco #mainNotice · ildongcare se-04' }
  ],
  guide: '핀 칼럼에는 "변하지 않는 맥락"(누구인가·무엇을 하는가)을, 흐르는 피드에는 "그 증거"(숫자·소식·가치)를 배치해야 정보 구조가 산다. 통계 카드라면 숫자는 정적 텍스트로 두고(카운트업은 number-counter의 영역), 카드의 등장만 스크롤에 매핑한다. 글래스(backdrop-filter)는 뒤에 충분한 대비가 있을 때만 효과적이며 저사양 기기에서 비용이 크므로 카드 수를 3~5개로 제한한다. 좌우 비율은 고정 칼럼 0.8~0.9 : 피드 1.1~1.2가 균형 잡힌다. prefers-reduced-motion에서는 피드를 정적 나열로 폴백.',
  recommendations: [
    { place: '기업 사이트 메인', body: '회사 개요 — 좌측에 한 줄 소개를 고정하고 우측에 핵심 지표·연혁 카드를 흘려 규모를 증명' },
    { place: '브랜드 캠페인 페이지', body: '임팩트 리포트 — 캠페인 주장을 고정하고 성과 통계 카드를 통과시켜 설득력 강화(휴먼라이트 원형)' },
    { place: '병원·기관 사이트', body: '기관 소개 — 설립 이념을 핀 고정하고 진료 실적·인증 카드를 피드로 제시' },
    { place: '제품·서비스 쇼케이스', body: '업데이트 피드 — 제품 가치를 고정하고 릴리즈·뉴스 카드를 역방향 레일(B)로 흘려보냄' }
  ],
  tradeoff: '핀 구간이 길면 사용자가 같은 화면에 오래 머물러 지루할 수 있으므로 트랙을 260vh 내외로 제한한다. backdrop-filter 글래스 카드를 많이 쓰면 합성 비용이 급증하니 3~5장으로 제한하고, 고정 칼럼의 내용이 빈약하면 "왜 멈춰 있나" 의문이 들므로 충분한 맥락을 담을 것.',
  snippetHTML: '<section class="pf-wrap">\n  <div class="pf-intro"><!-- 고정 소개 칼럼 --></div>\n  <div class="pf-feed">\n    <article class="pf-card" data-i="0">…</article>\n    <!-- 통계 카드 3장 -->\n  </div>\n</section>',
  snippetCSS: '.pf-wrap { display: grid; grid-template-columns: 0.9fr 1.1fr; } /* 무대가 sticky → 좌측 자연 고정 */\n.pf-card { background: rgba(255,255,255,0.06);\n  backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.12); }',
  snippetJS: 'var cards = document.querySelectorAll(".pf-card");\nfunction applyReveal(p){\n  cards.forEach(function(c, i){\n    var s = 0.1 + i * 0.18;             // 카드별 진입 시점\n    var lp = seg(p, s, s + 0.25);\n    c.style.opacity = 0.25 + 0.75 * lp;\n    c.style.transform =\n      "translateY(" + ((80*(1-lp)) - 40*seg(p, s+0.25, 1)) + "px)"; // 진입 후 떠밀림\n  });\n}',
  examples: [
    {
      key: 'a', id: 'glass-stats', title: '글래스 통계 통과',
      desc: '휴먼라이트 사례 — 좌측 소개 칼럼이 고정된 채 우측의 반투명 글래스 통계 카드 3장이 한 장씩 떠올라 스쳐 올라간다. 카드가 칼럼의 주장에 대한 증거처럼 차례로 제시된다(숫자는 정적 텍스트).',
      demo: {
        mode: 'scroll', trackVh: 260, height: 600,
        bodyHTML: '<section class="pf-wrap pf-a">\n'
          + '  <div class="pf-intro">\n'
          + '    <p class="iw-eyebrow">ABOUT US</p>\n'
          + '    <h2 class="iw-head">휴먼라이트는<br>세계 최대의 인권단체입니다</h2>\n'
          + '    <p class="iw-body">전 세계 회원과 함께 인권 침해에 맞섭니다.</p>\n'
          + '    <span class="iw-tag">HUMAN LIGHT INTERNATIONAL</span>\n'
          + '  </div>\n'
          + '  <div class="pf-feed">\n'
          + '    <article class="pf-card" data-i="0"><strong>160<em>개국</em></strong><span>전 세계 활동 거점</span></article>\n'
          + '    <article class="pf-card" data-i="1"><strong>1,000<em>만 명</em></strong><span>함께하는 회원</span></article>\n'
          + '    <article class="pf-card" data-i="2"><strong>65<em>년</em></strong><span>변함없는 약속</span></article>\n'
          + '  </div>\n'
          + '</section>',
        css: '.pf-wrap { width: min(1040px, 90vw); display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 56px; align-items: center; }\n'
          + '.pf-a .iw-eyebrow { --accent: #ffd23f; margin-bottom: 18px; }\n'
          + '.pf-intro .iw-head { margin-bottom: 20px; }\n'
          + '.pf-intro .iw-body { margin-bottom: 24px; max-width: 320px; }\n'
          + '.pf-feed { display: flex; flex-direction: column; gap: 16px; }\n'
          + '.pf-card { background: rgba(255,255,255,0.06); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.12); border-radius: 16px; padding: 26px 28px; will-change: opacity, transform; }\n'
          + '.pf-card strong { display: block; font: 800 clamp(34px,4vw,52px)/1 "Pretendard Variable",sans-serif; color: #fff; margin-bottom: 8px; }\n'
          + '.pf-card strong em { font-style: normal; font-size: 0.42em; color: #ffd23f; margin-left: 6px; }\n'
          + '.pf-card span { font: 400 14px/1 "Pretendard Variable",sans-serif; color: rgba(255,255,255,0.55); }',
        js: 'var cards = stage.querySelectorAll(".pf-card");\n'
          + 'function applyReveal(p){\n'
          + '  for (var i = 0; i < cards.length; i++){\n'
          + '    var s = 0.1 + i * 0.18;\n'
          + '    var lp = seg(p, s, s + 0.25);\n'
          + '    cards[i].style.opacity = 0.25 + 0.75 * lp;\n'
          + '    cards[i].style.transform = "translateY(" + ((80 * (1 - lp)) - 40 * seg(p, s + 0.25, 1)) + "px)";\n'
          + '  }\n'
          + '}'
      }
    },
    {
      key: 'b', id: 'counter-rails', title: '역방향 2열 뉴스 그리드',
      desc: '유진정밀 사례 — 고정 타이틀 옆에서 좌열 카드는 위로, 우열 카드는 아래로 서로 반대 방향으로 흐른다. 두 열의 속도 벡터가 달라 지면이 갈라지듯 보인다.',
      demo: {
        mode: 'scroll', trackVh: 260, height: 600,
        bodyHTML: '<section class="cr2-wrap">\n'
          + '  <div class="cr2-head"><p class="iw-eyebrow">NEWS</p><h2 class="iw-head">유진정밀<br>소식</h2></div>\n'
          + '  <div class="cr2-grid">\n'
          + '    <div class="cr2-col cr2-left"><article class="cr2-card">신규 베트남 법인 설립</article><article class="cr2-card">전기차 부품 양산 개시</article><article class="cr2-card">품질 대상 3년 연속 수상</article></div>\n'
          + '    <div class="cr2-col cr2-right"><article class="cr2-card">스마트 팩토리 전환 완료</article><article class="cr2-card">탄소중립 로드맵 발표</article><article class="cr2-card">독일 모터쇼 참가</article></div>\n'
          + '  </div>\n'
          + '</section>',
        css: '.cr2-wrap { width: min(1040px, 90vw); display: grid; grid-template-columns: 0.7fr 1.3fr; gap: 48px; align-items: center; }\n'
          + '.cr2-head .iw-eyebrow { --accent: #8ab4ff; margin-bottom: 16px; }\n'
          + '.cr2-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }\n'
          + '.cr2-col { display: flex; flex-direction: column; gap: 16px; will-change: transform; }\n'
          + '.cr2-card { background: linear-gradient(150deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02)); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 28px 22px; min-height: 120px; font: 600 16px/1.5 "Pretendard Variable",sans-serif; color: #fff; display: flex; align-items: flex-end; }',
        js: 'var left = stage.querySelector(".cr2-left");\n'
          + 'var right = stage.querySelector(".cr2-right");\n'
          + 'function applyReveal(p){\n'
          + '  left.style.transform = "translateY(" + (-p * 9) + "rem)";\n'
          + '  right.style.transform = "translateY(" + (p * 9) + "rem)";\n'
          + '}'
      }
    },
    {
      key: 'c', id: 'stage-drift', title: '카드 스택 드리프트 무대',
      desc: '다온케어 사례 — 한쪽 모서리가 둥근 브랜드 컬러 밴드가 화면 밖에서 미끄러져 들어와 무대를 만들고, ±90px 엇갈린 2열 카드 그리드 전체가 묵직하게 위로 흘러 올라간다.',
      demo: {
        mode: 'scroll', trackVh: 260, height: 600,
        bodyHTML: '<section class="sd-wrap">\n'
          + '  <div class="sd-band"></div>\n'
          + '  <div class="sd-content">\n'
          + '    <div class="sd-head"><p class="iw-eyebrow">CORE VALUE</p><h2 class="iw-head">다온케어가<br>지키는 가치</h2></div>\n'
          + '    <div class="sd-grid">\n'
          + '      <article class="sd-card sd-c0"><span class="iw-tag">01</span><h3 class="iw-sub">안전</h3></article>\n'
          + '      <article class="sd-card sd-c1"><span class="iw-tag">02</span><h3 class="iw-sub">정직</h3></article>\n'
          + '      <article class="sd-card sd-c2"><span class="iw-tag">03</span><h3 class="iw-sub">혁신</h3></article>\n'
          + '      <article class="sd-card sd-c3"><span class="iw-tag">04</span><h3 class="iw-sub">동행</h3></article>\n'
          + '    </div>\n'
          + '  </div>\n'
          + '</section>',
        css: '.sd-wrap { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; overflow: hidden; }\n'
          + '.sd-band { position: absolute; right: 0; top: 12%; bottom: 12%; width: 78%; background: linear-gradient(120deg, #1f6b5e, #0c3a32); border-radius: 400px 0 0 400px; will-change: transform; }\n'
          + '.sd-content { position: relative; z-index: 2; width: min(960px, 88vw); display: grid; grid-template-columns: 0.8fr 1.2fr; gap: 44px; align-items: center; }\n'
          + '.sd-head .iw-eyebrow { --accent: #7fe7d4; margin-bottom: 16px; }\n'
          + '.sd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; will-change: transform; }\n'
          + '.sd-card { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.16); border-radius: 16px; padding: 26px 22px; min-height: 130px; display: flex; flex-direction: column; justify-content: space-between; }\n'
          + '.sd-card .iw-tag { --accent: #7fe7d4; color: #7fe7d4; }\n'
          + '.sd-c1 { margin-top: 90px; } .sd-c2 { margin-top: -90px; }',
        js: 'var band = stage.querySelector(".sd-band");\n'
          + 'var grid = stage.querySelector(".sd-grid");\n'
          + 'function applyReveal(p){\n'
          + '  band.style.transform = "translateX(" + (100 * (1 - seg(p, 0, 0.2))) + "%)";\n'
          + '  grid.style.transform = "translateY(" + (-70 * seg(p, 0.15, 1)) + "%)";\n'
          + '}'
      }
    }
  ]
};

const E06 = {
  id: 'hover-focus-band', num: '06', title: '호버 포커스 풀밴드',
  summary: '비전·사업영역·브랜드 라인업 리스트에서 항목에 호버하면 섹션 전체의 배경·이미지·레이아웃이 그 항목 중심으로 재편되는 풀밴드 포커스 섹션. 개별 이미지의 hover 효과(image-hover)나 클릭 탭(animated-tabs)과 달리, 리스트 입력이 섹션 단위의 무드 전환을 구동하는 것이 단위다.',
  evidence: 'ildongcare se-02 비전 — 호버 항목 전용 이미지로 풀밴드 배경 교체 + 비호버 항목 디밍 / se-03 브랜드 — 5분할 패널 호버 폭 확장(40%/15%) + 숨은 설명 펼침 / syfund sec-mainfund — 리스트 호버 → 우측 이미지 교체 + 배경 그라디언트 4레이어 크로스페이드',
  explain: '세 변형 모두 mouseenter(터치는 click 폴백)로 data-idx를 읽어 부모 컨테이너의 활성 상태를 스위칭하고, 시각 전환은 200ms 이하 CSS transition에 위임한다 — 스크롤 비의존 단일 100vh 무대다. A(배경 디밍 포커스)는 항목 호버 시 그 항목 전용 배경 그라디언트 레이어만 opacity 1로 띄우고 형제 항목을 opacity 0.28로 디밍하며 본문을 max-height로 펼친다. B(가로 아코디언)는 5분할 패널의 flex-grow를 토글해 호버 패널만 넓어지고 나머지가 좁아지며 세로 라벨이 가로로 펴지고 숨은 설명이 펼쳐진다. C(리스트-미디어 동기)는 좌측 리스트 호버에 맞춰 우측 미디어 카드 교체·섹션 배경 무드 크로스페이드·활성 항목 밑줄(scaleX)이 동시에 일어난다. 입력 장치만 다르고(마우스/터치) 연출 코드는 공유된다.',
  kv: [
    { label: '의존성', value: 'Vanilla JS — mouseenter/click → 클래스 토글' },
    { label: '트리거', value: '호버 (터치는 클릭 폴백)' },
    { label: '스크롤 트랙', value: '없음 — 입력형 100vh 단일 무대' },
    { label: '핵심 매핑', value: 'data-idx → is-on 스왑 + CSS transition ≤200ms' },
    { label: '권장 콘텐츠', value: '리스트 3~5항목 · 항목별 배경/미디어 1세트' },
    { label: '실측 레퍼런스', value: 'ildongcare se-02·se-03 · syfund sec-mainfund' }
  ],
  guide: '호버 포커스는 "한 번에 하나만 강조"가 원칙 — 비활성 항목을 opacity 0.25~0.4로 충분히 죽여야 활성 항목이 떠오른다. 터치 기기에는 호버가 없으므로 같은 핸들러에 click을 바인딩해 탭으로도 동작하게 하고, 첫 항목을 기본 활성으로 두어 빈 상태를 만들지 않는다. 가로 아코디언(B)은 패널이 4~6개일 때 가장 균형 잡히고, 그 이상이면 좁아진 패널의 라벨이 읽히지 않는다. 전환은 200ms 이하로 짧게 유지해 호버 이동이 빠를 때 잔상이 남지 않게 한다. prefers-reduced-motion에서는 배경 교체만 남기고 폭·이동 애니메이션을 끌 것.',
  recommendations: [
    { place: '기업 사이트 메인', body: '사업영역 — 사업부 리스트 호버로 풀밴드 배경을 교체해 각 영역의 무드를 즉시 전환' },
    { place: '브랜드 캠페인 페이지', body: '캠페인 축 — 핵심 메시지 3~4개를 호버로 전환하며 각기 다른 비주얼 무드로 몰입' },
    { place: '병원·기관 사이트', body: '진료과·비전 — 비전 항목 호버 시 전용 배경과 설명을 펼쳐 전문 영역을 직관적으로 안내' },
    { place: '제품·서비스 쇼케이스', body: '라인업 — 가로 아코디언(B)으로 제품군을 펼쳐 보이며 호버한 제품만 상세 노출' }
  ],
  tradeoff: '호버 의존이라 터치 환경에서는 click 폴백이 없으면 인터랙션이 통째로 사라진다 — 핵심 정보는 활성/비활성 모두에서 최소한 라벨로 읽히게 할 것. 배경 레이어를 모두 깔아두는 방식이라 항목이 많으면 초기 DOM·이미지 비용이 커지므로 3~6개로 제한한다.',
  snippetHTML: '<section class="hf">\n  <div class="hf-bg is-on" data-i="0"></div>\n  <div class="hf-bg" data-i="1"></div>\n  <ul class="hf-list">\n    <li class="hf-item is-on" data-i="0">…</li>\n    <li class="hf-item" data-i="1">…</li>\n  </ul>\n</section>',
  snippetCSS: '.hf-bg { position: absolute; inset: 0; opacity: 0; transition: opacity 200ms ease; }\n.hf-bg.is-on { opacity: 1; }\n.hf-item { opacity: 0.28; transition: opacity 200ms ease; } /* 비활성 디밍 */\n.hf-item.is-on { opacity: 1; }',
  snippetJS: 'var items = document.querySelectorAll(".hf-item");\nvar bgs = document.querySelectorAll(".hf-bg");\nfunction focus(n){\n  items.forEach(function(el, i){ el.classList.toggle("is-on", i === n); });\n  bgs.forEach(function(el, i){ el.classList.toggle("is-on", i === n); });\n}\nitems.forEach(function(el, i){\n  el.addEventListener("mouseenter", function(){ focus(i); });\n  el.addEventListener("click", function(){ focus(i); }); // 터치 폴백\n});',
  examples: [
    {
      key: 'a', id: 'bg-dim-focus', title: '배경 교체 포커스',
      desc: '다온케어 사례 — 비전 항목에 호버하면 밴드 전체 배경이 그 항목 전용 그라디언트로 교체되고 나머지 항목은 디밍되며, 호버 항목의 설명이 아래로 펼쳐진다.',
      demo: {
        mode: 'input', hint: 'HOVER', height: 560,
        bodyHTML: '<section class="hf-a">\n'
          + '  <div class="hf-bg hf-bg0 is-on"></div>\n'
          + '  <div class="hf-bg hf-bg1"></div>\n'
          + '  <div class="hf-bg hf-bg2"></div>\n'
          + '  <div class="hf-inner">\n'
          + '    <p class="iw-eyebrow">VISION</p>\n'
          + '    <ul class="hf-list">\n'
          + '      <li class="hf-item is-on" data-i="0"><h3 class="iw-head">건강한 일상</h3><p class="iw-body">예방부터 회복까지, 삶의 모든 순간을 돌봅니다.</p></li>\n'
          + '      <li class="hf-item" data-i="1"><h3 class="iw-head">정직한 케어</h3><p class="iw-body">데이터에 기반한 투명한 건강관리를 제공합니다.</p></li>\n'
          + '      <li class="hf-item" data-i="2"><h3 class="iw-head">함께하는 미래</h3><p class="iw-body">지역사회와 손잡고 건강 격차를 줄여갑니다.</p></li>\n'
          + '    </ul>\n'
          + '  </div>\n'
          + '</section>',
        css: '.hf-a { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }\n'
          + '.hf-bg { position: absolute; inset: 0; opacity: 0; transition: opacity 200ms ease; }\n'
          + '.hf-bg.is-on { opacity: 1; }\n'
          + '.hf-bg0 { background: radial-gradient(120% 120% at 30% 30%, #1f5a4e, #0a2019); }\n'
          + '.hf-bg1 { background: radial-gradient(120% 120% at 70% 30%, #1a3a5a, #0a1620); }\n'
          + '.hf-bg2 { background: radial-gradient(120% 120% at 50% 70%, #4a2a5a, #160a1e); }\n'
          + '.hf-inner { position: relative; z-index: 2; width: min(820px, 88vw); }\n'
          + '.hf-a .iw-eyebrow { --accent: #7fe7d4; margin-bottom: 26px; }\n'
          + '.hf-list { list-style: none; margin: 0; padding: 0; }\n'
          + '.hf-item { padding: 18px 0; cursor: pointer; opacity: 0.28; transition: opacity 200ms ease; border-top: 1px solid rgba(255,255,255,0.1); }\n'
          + '.hf-item:last-child { border-bottom: 1px solid rgba(255,255,255,0.1); }\n'
          + '.hf-item.is-on { opacity: 1; }\n'
          + '.hf-item .iw-head { font-size: clamp(24px,3.2vw,40px); }\n'
          + '.hf-item .iw-body { margin-top: 0; max-height: 0; overflow: hidden; opacity: 0; transition: max-height 200ms ease, opacity 200ms ease, margin 200ms ease; }\n'
          + '.hf-item.is-on .iw-body { margin-top: 10px; max-height: 80px; opacity: 1; }',
        js: 'var items = stage.querySelectorAll(".hf-item");\n'
          + 'var bgs = stage.querySelectorAll(".hf-bg");\n'
          + 'function focus(n){\n'
          + '  for (var i = 0; i < items.length; i++){\n'
          + '    items[i].classList.toggle("is-on", i === n);\n'
          + '    bgs[i].classList.toggle("is-on", i === n);\n'
          + '  }\n'
          + '  if (progressFill) progressFill.style.width = ((n + 1) / items.length * 100) + "%";\n'
          + '}\n'
          + 'for (var i = 0; i < items.length; i++){\n'
          + '  (function(k){\n'
          + '    items[k].addEventListener("mouseenter", function(){ focus(k); });\n'
          + '    items[k].addEventListener("click", function(){ focus(k); });\n'
          + '  })(i);\n'
          + '}\n'
          + 'focus(0);\n'
          + 'window.__reset = function(){ focus(0); };'
      }
    },
    {
      key: 'b', id: 'width-accordion', title: '가로 아코디언 확장',
      desc: '다온케어 사례 — 화면을 5등분한 세로 패널 중 호버한 패널만 넓어지고 나머지가 좁아지며, 넓어진 패널 안에서 세로 라벨이 가로로 펴지고 숨은 설명이 펼쳐진다. 레이아웃 자체가 출렁인다.',
      demo: {
        mode: 'input', hint: 'HOVER', height: 560,
        bodyHTML: '<section class="wa-wrap">\n'
          + '  <div class="wa-head"><p class="iw-eyebrow">BRAND LINEUP</p><h2 class="iw-head">다온케어 브랜드</h2></div>\n'
          + '  <div class="wa-panels">\n'
          + '    <div class="wa-panel" data-i="0" style="--g:linear-gradient(160deg,#1f5a4e,#0a2019)"><div class="wa-label">다온비타</div><div class="wa-desc">일상 면역 케어 라인</div></div>\n'
          + '    <div class="wa-panel" data-i="1" style="--g:linear-gradient(160deg,#1a3a5a,#0a1620)"><div class="wa-label">다온슬립</div><div class="wa-desc">수면 건강 솔루션</div></div>\n'
          + '    <div class="wa-panel" data-i="2" style="--g:linear-gradient(160deg,#4a2a5a,#160a1e)"><div class="wa-label">다온본</div><div class="wa-desc">관절·뼈 영양 케어</div></div>\n'
          + '    <div class="wa-panel" data-i="3" style="--g:linear-gradient(160deg,#5a3a1f,#1e120a)"><div class="wa-label">다온키즈</div><div class="wa-desc">어린이 성장 영양</div></div>\n'
          + '    <div class="wa-panel" data-i="4" style="--g:linear-gradient(160deg,#1f3a5a,#0a1420)"><div class="wa-label">다온웰</div><div class="wa-desc">시니어 종합 케어</div></div>\n'
          + '  </div>\n'
          + '</section>',
        css: '.wa-wrap { width: min(1040px, 92vw); }\n'
          + '.wa-head { margin-bottom: 22px; }\n'
          + '.wa-wrap .iw-eyebrow { --accent: #7fe7d4; margin-bottom: 12px; }\n'
          + '.wa-panels { display: flex; gap: 10px; height: 52vh; }\n'
          + '.wa-panel { position: relative; flex: 1 1 0; min-width: 0; border-radius: 16px; overflow: hidden; cursor: pointer; background: var(--g); display: flex; flex-direction: column; justify-content: flex-end; padding: 22px; transition: flex-grow 200ms ease; }\n'
          + '.wa-panels.has-active .wa-panel { flex-grow: 0.7; }\n'
          + '.wa-panels.has-active .wa-panel.is-on { flex-grow: 3; }\n'
          + '.wa-panel::before { content: ""; position: absolute; inset: 0; background: rgba(0,0,0,0.45); transition: background 200ms ease; }\n'
          + '.wa-panel.is-on::before { background: rgba(0,0,0,0.16); }\n'
          + '.wa-label { position: relative; z-index: 2; font: 700 clamp(15px,1.7vw,20px)/1.2 "Pretendard Variable",sans-serif; color: #fff; writing-mode: vertical-rl; }\n'
          + '.wa-panel.is-on .wa-label { writing-mode: horizontal-tb; }\n'
          + '.wa-desc { position: relative; z-index: 2; margin-top: 10px; max-height: 0; opacity: 0; overflow: hidden; white-space: nowrap; font: 400 14px/1.5 "Pretendard Variable",sans-serif; color: rgba(255,255,255,0.82); transition: max-height 200ms ease, opacity 200ms ease; }\n'
          + '.wa-panel.is-on .wa-desc { max-height: 40px; opacity: 1; }',
        js: 'var panels = stage.querySelectorAll(".wa-panel");\n'
          + 'var wrap = stage.querySelector(".wa-panels");\n'
          + 'function focus(n){\n'
          + '  wrap.classList.add("has-active");\n'
          + '  for (var i = 0; i < panels.length; i++) panels[i].classList.toggle("is-on", i === n);\n'
          + '  if (progressFill) progressFill.style.width = ((n + 1) / panels.length * 100) + "%";\n'
          + '}\n'
          + 'for (var i = 0; i < panels.length; i++){\n'
          + '  (function(k){\n'
          + '    panels[k].addEventListener("mouseenter", function(){ focus(k); });\n'
          + '    panels[k].addEventListener("click", function(){ focus(k); });\n'
          + '  })(i);\n'
          + '}\n'
          + 'focus(0);\n'
          + 'window.__reset = function(){ wrap.classList.remove("has-active"); for (var i = 0; i < panels.length; i++) panels[i].classList.remove("is-on"); focus(0); };'
      }
    },
    {
      key: 'c', id: 'list-media-sync', title: '리스트-미디어 동기',
      desc: '선재자산운용 사례 — 좌측 펀드 리스트에 호버하면 우측 미디어 카드가 교체되고 섹션 배경 그라디언트가 항목별 무드 컬러로 부드럽게 물든다. 활성 항목에는 밑줄이 그어진다.',
      demo: {
        mode: 'input', hint: 'HOVER', height: 560,
        bodyHTML: '<section class="lm-wrap">\n'
          + '  <div class="lm-bg lm-bg0 is-on"></div>\n'
          + '  <div class="lm-bg lm-bg1"></div>\n'
          + '  <div class="lm-bg lm-bg2"></div>\n'
          + '  <div class="lm-bg lm-bg3"></div>\n'
          + '  <div class="lm-inner">\n'
          + '    <ul class="lm-list">\n'
          + '      <li class="lm-item is-on" data-i="0"><span class="lm-num">01</span><span class="lm-name">선재 성장</span></li>\n'
          + '      <li class="lm-item" data-i="1"><span class="lm-num">02</span><span class="lm-name">선재 배당</span></li>\n'
          + '      <li class="lm-item" data-i="2"><span class="lm-num">03</span><span class="lm-name">선재 글로벌</span></li>\n'
          + '      <li class="lm-item" data-i="3"><span class="lm-num">04</span><span class="lm-name">선재 연금</span></li>\n'
          + '    </ul>\n'
          + '    <div class="lm-media">\n'
          + '      <div class="lm-card lm-card0 is-on"><span class="iw-tag">EQUITY</span><h3 class="iw-sub">국내 성장주 중심</h3></div>\n'
          + '      <div class="lm-card lm-card1"><span class="iw-tag">DIVIDEND</span><h3 class="iw-sub">안정 배당 포트폴리오</h3></div>\n'
          + '      <div class="lm-card lm-card2"><span class="iw-tag">GLOBAL</span><h3 class="iw-sub">선진국 분산 투자</h3></div>\n'
          + '      <div class="lm-card lm-card3"><span class="iw-tag">PENSION</span><h3 class="iw-sub">장기 연금 설계</h3></div>\n'
          + '    </div>\n'
          + '  </div>\n'
          + '</section>',
        css: '.lm-wrap { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }\n'
          + '.lm-bg { position: absolute; inset: 0; opacity: 0; transition: opacity 200ms ease; }\n'
          + '.lm-bg.is-on { opacity: 1; }\n'
          + '.lm-bg0 { background: linear-gradient(135deg,#16243f,#0a1322); }\n'
          + '.lm-bg1 { background: linear-gradient(135deg,#1f2a3f,#0c1018); }\n'
          + '.lm-bg2 { background: linear-gradient(135deg,#241a36,#100c1a); }\n'
          + '.lm-bg3 { background: linear-gradient(135deg,#1a3030,#0a1614); }\n'
          + '.lm-inner { position: relative; z-index: 2; width: min(960px, 90vw); display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }\n'
          + '.lm-list { list-style: none; margin: 0; padding: 0; }\n'
          + '.lm-item { display: flex; align-items: baseline; gap: 16px; padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,0.1); cursor: pointer; opacity: 0.4; transition: opacity 200ms ease; }\n'
          + '.lm-item.is-on { opacity: 1; }\n'
          + '.lm-num { font: 700 13px/1 "Pretendard Variable",sans-serif; color: #c9a86a; }\n'
          + '.lm-name { font: 700 clamp(20px,2.4vw,30px)/1 "Pretendard Variable",sans-serif; color: #fff; position: relative; }\n'
          + '.lm-name::after { content: ""; position: absolute; left: 0; right: 0; bottom: -6px; height: 2px; background: #c9a86a; transform: scaleX(0); transform-origin: left; transition: transform 200ms ease; }\n'
          + '.lm-item.is-on .lm-name::after { transform: scaleX(1); }\n'
          + '.lm-media { position: relative; aspect-ratio: 4/3; }\n'
          + '.lm-card { position: absolute; inset: 0; border: 1px solid rgba(255,255,255,0.14); border-radius: 18px; background: rgba(255,255,255,0.05); display: flex; flex-direction: column; justify-content: flex-end; padding: 28px; opacity: 0; transition: opacity 200ms ease; }\n'
          + '.lm-card.is-on { opacity: 1; }\n'
          + '.lm-card .iw-tag { --accent: #c9a86a; color: #c9a86a; margin-bottom: 10px; }',
        js: 'var items = stage.querySelectorAll(".lm-item");\n'
          + 'var bgs = stage.querySelectorAll(".lm-bg");\n'
          + 'var cards = stage.querySelectorAll(".lm-card");\n'
          + 'function focus(n){\n'
          + '  for (var i = 0; i < items.length; i++){\n'
          + '    items[i].classList.toggle("is-on", i === n);\n'
          + '    bgs[i].classList.toggle("is-on", i === n);\n'
          + '    cards[i].classList.toggle("is-on", i === n);\n'
          + '  }\n'
          + '  if (progressFill) progressFill.style.width = ((n + 1) / items.length * 100) + "%";\n'
          + '}\n'
          + 'for (var i = 0; i < items.length; i++){\n'
          + '  (function(k){\n'
          + '    items[k].addEventListener("mouseenter", function(){ focus(k); });\n'
          + '    items[k].addEventListener("click", function(){ focus(k); });\n'
          + '  })(i);\n'
          + '}\n'
          + 'focus(0);\n'
          + 'window.__reset = function(){ focus(0); };'
      }
    }
  ]
};

const E07 = {
  id: 'synced-dual-gallery', num: '07', title: '듀얼 동기 갤러리',
  summary: '썸네일·텍스트·핫스팟과 풀블리드 메인 뷰가 단일 상태 idx로 동기 전환되는 제품·서비스 갤러리 섹션. autoplay 없이 클릭 입력만으로 구동하며, 한쪽을 조작하면 연결된 다른 쪽이 함께 바뀐다. 가로 스크롤 카드 흐름(scrollx-card)이나 스크롤 카드 교체(scroll-card-update)와 입력 모델 자체가 다르다.',
  evidence: 'doodoorim .clinic_sect — 썸네일↔메인 Swiper 2대 controller.control 양방향 동기 + progressbar 페이지네이션 / nifco #mainProduct — 텍스트·이미지 slick asNavFor 듀얼 전환 + 제품 위치 핫스팟 도트 5개',
  explain: '세 변형 모두 단일 상태 idx를 클릭으로 갱신하면 연결된 모든 레이어(메인 뷰·썸네일·텍스트·진행률·인덱스)가 같은 idx로 동시 렌더된다 — 전환은 200ms 이하 크로스페이드, 활성 표시만 클래스 토글이다. A(썸네일-메인)는 하단 썸네일 클릭 시 상단 메인을 크로스페이드하고 진행률 바 width와 fraction 카운터(01/03)를 함께 갱신한다. B(페어 내비)는 prev/next 버튼으로 좌측 텍스트 패널(translateY 진입)과 우측 이미지(크로스페이드)를 한 몸으로 전환한다. C(핫스팟 스테이지)는 메인 이미지 위에 흩어진 핫스팟 도트를 클릭하면 그 위치에 캡션 카드가 열리고 하단 리스트의 해당 항목이 동기 하이라이트되며, 탐색 주도권이 이미지 쪽에 있다.',
  kv: [
    { label: '의존성', value: 'Vanilla JS — 단일 idx 상태 + 동기 렌더' },
    { label: '트리거', value: '클릭 (썸네일·버튼·핫스팟)' },
    { label: '스크롤 트랙', value: '없음 — 입력형 단일 무대' },
    { label: '핵심 매핑', value: 'click → idx → 메인·썸네일·진행바·카운터 동시 스왑' },
    { label: '권장 콘텐츠', value: '항목 3~5 · 메인 뷰 1 + 동기 보조 UI' },
    { label: '실측 레퍼런스', value: 'doodoorim .clinic_sect · nifco #mainProduct' }
  ],
  guide: '동기 갤러리의 핵심은 "단일 진실 공급원(idx)"이다 — 모든 레이어가 한 변수에서 파생되어야 어긋남이 없다. autoplay를 넣지 않는 것이 이 카탈로그의 원칙이며, 대신 진행률 바·카운터로 "전체 중 몇 번째"를 항상 보여준다. 썸네일은 활성 항목을 border·scale로 분명히 구분하고, prev/next는 끝에서 순환(modulo)시켜 막다른 느낌을 없앤다. 핫스팟(C)은 도트가 작아 모바일에서 누르기 어려우므로 터치 타깃을 44px 이상 확보한다. 전환은 200ms 크로스페이드로 통일하고, prefers-reduced-motion에서는 페이드를 즉시 교체로 대체한다.',
  recommendations: [
    { place: '기업 사이트 메인', body: '제품·시설 갤러리 — 썸네일 클릭으로 대표 이미지를 전환하며 시설/제품을 둘러보게' },
    { place: '브랜드 캠페인 페이지', body: '스토리 챕터 — prev/next로 캠페인 서사를 한 장면씩 넘기며 텍스트·비주얼 동기 전환' },
    { place: '병원·기관 사이트', body: '진료 공간 안내 — 썸네일-메인(A)으로 진료실·장비를 카운터와 함께 신뢰감 있게 제시' },
    { place: '제품·서비스 쇼케이스', body: '제품 디테일 — 핫스팟(C)으로 제품 부위별 기능을 짚어 보이며 리스트와 동기화' }
  ],
  tradeoff: '클릭 의존이라 사용자가 능동적으로 탐색해야 콘텐츠가 드러난다 — 첫 화면(idx 0)만으로도 핵심이 전달되도록 대표 항목을 0번에 둘 것. 핫스팟은 작은 타깃이라 접근성·모바일 사용성에 주의가 필요하고, 레이어를 모두 깔아두므로 항목이 많으면 초기 비용이 커진다.',
  snippetHTML: '<div class="tm-main">\n  <div class="tm-slide is-on" data-i="0">…</div>\n  <div class="tm-meta"><span class="tm-count">01</span><span>/ 03</span>\n    <div class="tm-bar"><div class="tm-fill"></div></div></div>\n</div>\n<div class="tm-thumbs">\n  <button class="tm-thumb is-on" data-i="0"></button>\n  <!-- 썸네일 3 -->\n</div>',
  snippetCSS: '.tm-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 200ms ease; }\n.tm-slide.is-on { opacity: 1; }\n.tm-thumb.is-on { border-color: #5cc8ff; transform: scale(1.04); }\n.tm-fill { transition: width 200ms ease; }',
  snippetJS: 'var slides = document.querySelectorAll(".tm-slide");\nvar thumbs = document.querySelectorAll(".tm-thumb");\nvar count = document.querySelector(".tm-count");\nvar fill = document.querySelector(".tm-fill");\nvar N = slides.length;\nfunction go(n){                          // 단일 idx → 전 레이어 동기\n  slides.forEach(function(s, i){ s.classList.toggle("is-on", i === n); });\n  thumbs.forEach(function(t, i){ t.classList.toggle("is-on", i === n); });\n  count.textContent = ("0" + (n + 1)).slice(-2);\n  fill.style.width = ((n + 1) / N * 100) + "%";\n}\nthumbs.forEach(function(t, i){ t.addEventListener("click", function(){ go(i); }); });',
  examples: [
    {
      key: 'a', id: 'thumb-main', title: '썸네일-메인 동기 크로스페이드',
      desc: '온결의원 사례 — 하단 썸네일을 클릭하면 상단 풀블리드 메인이 크로스페이드되고, 진행률 바와 fraction 카운터(01/03)가 함께 갱신된다. 활성 썸네일에는 링과 살짝 확대가 걸린다.',
      demo: {
        mode: 'input', hint: 'CLICK', height: 560,
        bodyHTML: '<section class="tm-wrap">\n'
          + '  <div class="tm-main">\n'
          + '    <div class="tm-slide tm-s0 is-on"><span class="iw-tag">CLINIC 01</span><h3 class="iw-head">도수 치료실</h3></div>\n'
          + '    <div class="tm-slide tm-s1"><span class="iw-tag">CLINIC 02</span><h3 class="iw-head">물리 치료실</h3></div>\n'
          + '    <div class="tm-slide tm-s2"><span class="iw-tag">CLINIC 03</span><h3 class="iw-head">재활 운동실</h3></div>\n'
          + '    <div class="tm-meta"><span class="tm-count">01</span><span class="tm-total">/ 03</span><div class="tm-bar"><div class="tm-fill"></div></div></div>\n'
          + '  </div>\n'
          + '  <div class="tm-thumbs">\n'
          + '    <button class="tm-thumb tm-t0 is-on" data-i="0" aria-label="도수 치료실"></button>\n'
          + '    <button class="tm-thumb tm-t1" data-i="1" aria-label="물리 치료실"></button>\n'
          + '    <button class="tm-thumb tm-t2" data-i="2" aria-label="재활 운동실"></button>\n'
          + '  </div>\n'
          + '</section>',
        css: '.demo-progress { display: none; }\n'
          + '.tm-wrap { width: min(820px, 90vw); display: flex; flex-direction: column; gap: 16px; }\n'
          + '.tm-main { position: relative; aspect-ratio: 16/9; border-radius: 18px; overflow: hidden; }\n'
          + '.tm-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 200ms ease; display: flex; flex-direction: column; justify-content: flex-end; padding: 28px; }\n'
          + '.tm-slide.is-on { opacity: 1; }\n'
          + '.tm-s0 { background: linear-gradient(140deg,#18324a,#0a161f); }\n'
          + '.tm-s1 { background: linear-gradient(140deg,#1a4038,#0a1a16); }\n'
          + '.tm-s2 { background: linear-gradient(140deg,#2a2440,#120e1e); }\n'
          + '.tm-wrap .iw-tag { --accent: #5cc8ff; color: #5cc8ff; margin-bottom: 10px; }\n'
          + '.tm-meta { position: absolute; top: 22px; right: 24px; display: flex; align-items: center; gap: 8px; }\n'
          + '.tm-count { font: 800 22px/1 "Pretendard Variable",sans-serif; color: #fff; }\n'
          + '.tm-total { font: 500 13px/1 "Pretendard Variable",sans-serif; color: rgba(255,255,255,0.5); }\n'
          + '.tm-bar { width: 80px; height: 3px; background: rgba(255,255,255,0.2); border-radius: 999px; overflow: hidden; margin-left: 8px; }\n'
          + '.tm-fill { height: 100%; width: 33%; background: #5cc8ff; transition: width 200ms ease; }\n'
          + '.tm-thumbs { display: flex; gap: 12px; }\n'
          + '.tm-thumb { flex: 1; height: 70px; border: 1px solid rgba(255,255,255,0.14); border-radius: 12px; cursor: pointer; padding: 0; transition: transform 200ms ease, border-color 200ms ease; }\n'
          + '.tm-thumb.is-on { border-color: #5cc8ff; transform: scale(1.04); }\n'
          + '.tm-t0 { background: linear-gradient(140deg,#18324a,#0a161f); }\n'
          + '.tm-t1 { background: linear-gradient(140deg,#1a4038,#0a1a16); }\n'
          + '.tm-t2 { background: linear-gradient(140deg,#2a2440,#120e1e); }',
        js: 'var slides = stage.querySelectorAll(".tm-slide");\n'
          + 'var thumbs = stage.querySelectorAll(".tm-thumb");\n'
          + 'var count = stage.querySelector(".tm-count");\n'
          + 'var fill = stage.querySelector(".tm-fill");\n'
          + 'var N = slides.length;\n'
          + 'function go(n){\n'
          + '  for (var i = 0; i < N; i++){\n'
          + '    slides[i].classList.toggle("is-on", i === n);\n'
          + '    thumbs[i].classList.toggle("is-on", i === n);\n'
          + '  }\n'
          + '  count.textContent = ("0" + (n + 1)).slice(-2);\n'
          + '  fill.style.width = ((n + 1) / N * 100) + "%";\n'
          + '}\n'
          + 'for (var i = 0; i < N; i++){\n'
          + '  (function(k){ thumbs[k].addEventListener("click", function(){ go(k); }); })(i);\n'
          + '}\n'
          + 'window.__reset = function(){ go(0); };'
      }
    },
    {
      key: 'b', id: 'pair-nav', title: '텍스트-이미지 페어 내비',
      desc: '유진정밀 사례 — 좌측 텍스트 패널과 우측 풀블리드 이미지가 prev/next 버튼 클릭에 한 몸으로 전환된다. 텍스트는 아래에서 올라오고 이미지는 페이드로 교체되며, 끝에서 순환한다.',
      demo: {
        mode: 'input', hint: 'CLICK', height: 560,
        bodyHTML: '<section class="pn-wrap">\n'
          + '  <div class="pn-text">\n'
          + '    <div class="pn-tslide is-on" data-i="0"><span class="iw-tag">PRODUCT 01</span><h3 class="iw-head">커넥터 어셈블리</h3><p class="iw-body">차량용 고정밀 커넥터 모듈로 안정적 전기 접속을 보장합니다.</p></div>\n'
          + '    <div class="pn-tslide" data-i="1"><span class="iw-tag">PRODUCT 02</span><h3 class="iw-head">클립 패스너</h3><p class="iw-body">진동 환경에서도 풀림 없는 체결력을 유지하는 고정 부품.</p></div>\n'
          + '    <div class="pn-tslide" data-i="2"><span class="iw-tag">PRODUCT 03</span><h3 class="iw-head">하우징 모듈</h3><p class="iw-body">정밀 사출로 성형한 경량·고강성 구조 하우징.</p></div>\n'
          + '  </div>\n'
          + '  <div class="pn-media">\n'
          + '    <div class="pn-mslide pn-m0 is-on"></div>\n'
          + '    <div class="pn-mslide pn-m1"></div>\n'
          + '    <div class="pn-mslide pn-m2"></div>\n'
          + '    <div class="pn-nav"><button class="pn-prev" aria-label="이전">←</button><span class="pn-idx">01 / 03</span><button class="pn-next" aria-label="다음">→</button></div>\n'
          + '  </div>\n'
          + '</section>',
        css: '.pn-wrap { width: min(960px, 90vw); display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 44px; align-items: center; }\n'
          + '.pn-text { position: relative; min-height: 210px; }\n'
          + '.pn-tslide { position: absolute; inset: 0; opacity: 0; transform: translateY(24px); transition: opacity 200ms ease, transform 200ms ease; pointer-events: none; }\n'
          + '.pn-tslide.is-on { opacity: 1; transform: none; pointer-events: auto; }\n'
          + '.pn-wrap .iw-tag { --accent: #8ab4ff; color: #8ab4ff; margin-bottom: 14px; display: block; }\n'
          + '.pn-tslide .iw-head { margin-bottom: 14px; }\n'
          + '.pn-media { position: relative; aspect-ratio: 4/3; border-radius: 18px; overflow: hidden; }\n'
          + '.pn-mslide { position: absolute; inset: 0; opacity: 0; transition: opacity 200ms ease; }\n'
          + '.pn-mslide.is-on { opacity: 1; }\n'
          + '.pn-m0 { background: linear-gradient(140deg,#2b2f3a,#0a0b0e); }\n'
          + '.pn-m1 { background: linear-gradient(140deg,#1f3340,#0a141a); }\n'
          + '.pn-m2 { background: linear-gradient(140deg,#33291f,#1a120a); }\n'
          + '.pn-nav { position: absolute; bottom: 18px; left: 18px; right: 18px; display: flex; align-items: center; justify-content: space-between; z-index: 2; }\n'
          + '.pn-prev,.pn-next { width: 44px; height: 44px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.24); background: rgba(0,0,0,0.3); color: #fff; font-size: 18px; cursor: pointer; transition: background 200ms ease; }\n'
          + '.pn-prev:hover,.pn-next:hover { background: rgba(255,255,255,0.16); }\n'
          + '.pn-idx { font: 600 14px/1 "Pretendard Variable",sans-serif; color: #fff; }',
        js: 'var texts = stage.querySelectorAll(".pn-tslide");\n'
          + 'var medias = stage.querySelectorAll(".pn-mslide");\n'
          + 'var idxEl = stage.querySelector(".pn-idx");\n'
          + 'var N = texts.length, cur = 0;\n'
          + 'function go(n){\n'
          + '  cur = (n + N) % N;\n'
          + '  for (var i = 0; i < N; i++){\n'
          + '    texts[i].classList.toggle("is-on", i === cur);\n'
          + '    medias[i].classList.toggle("is-on", i === cur);\n'
          + '  }\n'
          + '  idxEl.textContent = ("0" + (cur + 1)).slice(-2) + " / 0" + N;\n'
          + '  if (progressFill) progressFill.style.width = ((cur + 1) / N * 100) + "%";\n'
          + '}\n'
          + 'stage.querySelector(".pn-prev").addEventListener("click", function(){ go(cur - 1); });\n'
          + 'stage.querySelector(".pn-next").addEventListener("click", function(){ go(cur + 1); });\n'
          + 'window.__reset = function(){ go(0); };'
      }
    },
    {
      key: 'c', id: 'hotspot-stage', title: '핫스팟 스테이지 갤러리',
      desc: '유진정밀 사례 — 메인 이미지 위에 흩어진 핫스팟 도트를 클릭하면 그 위치에 캡션 카드가 열리고, 하단 리스트의 해당 항목이 동기 하이라이트된다. 탐색 주도권이 이미지 쪽에 있다.',
      demo: {
        mode: 'input', hint: 'CLICK', height: 560,
        bodyHTML: '<section class="hs-wrap">\n'
          + '  <div class="hs-stage">\n'
          + '    <div class="hs-img"></div>\n'
          + '    <button class="hs-dot is-on" data-i="0" style="left:26%;top:34%" aria-label="커넥터부"></button>\n'
          + '    <button class="hs-dot" data-i="1" style="left:62%;top:46%" aria-label="체결부"></button>\n'
          + '    <button class="hs-dot" data-i="2" style="left:44%;top:70%" aria-label="하우징부"></button>\n'
          + '    <div class="hs-cap is-on" data-i="0" style="left:26%;top:44%"><strong>커넥터부</strong><span>고정밀 결합 구조</span></div>\n'
          + '    <div class="hs-cap" data-i="1" style="left:50%;top:56%"><strong>체결부</strong><span>무진동 풀림 방지</span></div>\n'
          + '    <div class="hs-cap" data-i="2" style="left:30%;top:48%"><strong>하우징부</strong><span>경량 고강성 사출</span></div>\n'
          + '  </div>\n'
          + '  <div class="hs-list">\n'
          + '    <button class="hs-li is-on" data-i="0">① 커넥터부</button>\n'
          + '    <button class="hs-li" data-i="1">② 체결부</button>\n'
          + '    <button class="hs-li" data-i="2">③ 하우징부</button>\n'
          + '  </div>\n'
          + '</section>',
        css: '.demo-progress { display: none; }\n'
          + '.hs-wrap { width: min(860px, 92vw); display: flex; flex-direction: column; gap: 16px; }\n'
          + '.hs-stage { position: relative; aspect-ratio: 16/9; border-radius: 18px; overflow: hidden; }\n'
          + '.hs-img { position: absolute; inset: 0; background: linear-gradient(140deg,#22303f,#0c141c); }\n'
          + '.hs-dot { position: absolute; width: 22px; height: 22px; border-radius: 999px; border: none; background: #8ab4ff; cursor: pointer; transform: translate(-50%,-50%); transition: transform 200ms ease; padding: 0; z-index: 2; }\n'
          + '.hs-dot::after { content: ""; position: absolute; inset: -9px; border: 1px solid rgba(138,180,255,0.5); border-radius: 999px; opacity: 0; transform: scale(0.6); transition: opacity 200ms ease, transform 200ms ease; }\n'
          + '.hs-dot:hover { transform: translate(-50%,-50%) scale(1.15); }\n'
          + '.hs-dot.is-on::after { opacity: 1; transform: scale(1); }\n'
          + '.hs-cap { position: absolute; min-width: 150px; padding: 14px 16px; background: #0d0d0d; border: 1px solid rgba(255,255,255,0.16); border-radius: 12px; opacity: 0; transform: translateY(8px); transition: opacity 200ms ease, transform 200ms ease; pointer-events: none; z-index: 3; }\n'
          + '.hs-cap.is-on { opacity: 1; transform: none; }\n'
          + '.hs-cap strong { display: block; font: 700 16px/1.2 "Pretendard Variable",sans-serif; color: #fff; margin-bottom: 6px; }\n'
          + '.hs-cap span { font: 400 13px/1.4 "Pretendard Variable",sans-serif; color: rgba(255,255,255,0.6); }\n'
          + '.hs-list { display: flex; gap: 10px; }\n'
          + '.hs-li { flex: 1; padding: 14px; border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; background: transparent; color: rgba(255,255,255,0.5); font: 600 14px/1 "Pretendard Variable",sans-serif; cursor: pointer; transition: border-color 200ms ease, color 200ms ease, background 200ms ease; }\n'
          + '.hs-li.is-on { border-color: #8ab4ff; color: #fff; background: rgba(138,180,255,0.1); }',
        js: 'var dots = stage.querySelectorAll(".hs-dot");\n'
          + 'var caps = stage.querySelectorAll(".hs-cap");\n'
          + 'var lis = stage.querySelectorAll(".hs-li");\n'
          + 'function focus(n){\n'
          + '  for (var i = 0; i < dots.length; i++){\n'
          + '    dots[i].classList.toggle("is-on", i === n);\n'
          + '    caps[i].classList.toggle("is-on", i === n);\n'
          + '    lis[i].classList.toggle("is-on", i === n);\n'
          + '  }\n'
          + '}\n'
          + 'for (var i = 0; i < dots.length; i++){\n'
          + '  (function(k){\n'
          + '    dots[k].addEventListener("click", function(){ focus(k); });\n'
          + '    lis[k].addEventListener("click", function(){ focus(k); });\n'
          + '  })(i);\n'
          + '}\n'
          + 'focus(0);\n'
          + 'window.__reset = function(){ focus(0); };'
      }
    }
  ]
};

const E08 = {
  id: 'history-timeline', num: '08', title: '연혁 타임라인 섹션',
  summary: '중앙(또는 측면) 기준 라인이 스크롤 진행률에 비례해 자라나고, 라인이 지나는 연도 노드가 점등되며 이벤트 카드가 진입하는 연대기 섹션. "스크롤 진행 = 시간의 진행"이라는 가장 직관적인 스크롤 내러티브로, 라인을 div height/scaleY로 그려 SVG 스트로크 드로잉(scroll-path-draw)과 기법을 구분하고, 연도 이산 교체로 보간 카운터(number-counter)와도 구분된다.',
  evidence: 'doodoorim .value_sect — 중앙 세로 라인 height 0→100% scrub 드로잉 + 짝/홀 카드 x∓50 지그재그 스크럽 진입 + 라인 끝 도트. 연혁(History) 형태 자체는 한국 기업 사이트 회사소개의 표준 관습',
  explain: 'A(지그재그 라인)는 중앙 세로 라인을 scaleY(p)로 자라게 하고, 연도 카드를 자신의 임계점 (i+0.5)/N 부근 윈도에서 좌·우 교대로 translateX(∓48px→0)·opacity로 진입시키며 노드를 scale·글로우로 점등한다 — 라인 선단이 항상 최신 카드와 동행한다. B(핀 연도 플레이트)는 좌측 대형 연도를 idx=floor(p·N)로 이산 교체(translateY 스왑 — 숫자 보간 카운터가 아니다)하고 우측 사건 리스트를 가볍게 흘리며 활성 항목을 하이라이트한다. C(가로 연대표)는 핀 무대 안에서 가로 트랙을 translateX(-p·(트랙폭-뷰포트))로 좌로 이동시키고, 매 tick 각 노드의 getBoundingClientRect 중심이 화면 중앙 기준선을 지났는지 판정해 점등·카드를 펼친다. 모두 역스크롤 시 라인이 줄고 노드가 소등된다.',
  kv: [
    { label: '의존성', value: 'Vanilla JS — scaleY/translateX 보간 + 기준선 판정' },
    { label: '트리거', value: '스크롤 진행률' },
    { label: '스크롤 트랙', value: '280vh + sticky 100vh' },
    { label: '핵심 매핑', value: '라인 scaleY(p) · 카드 임계점 (i+0.5)/N · 노드 점등' },
    { label: '권장 콘텐츠', value: '연도 노드 4~7 · 연도 + 한 줄 사건' },
    { label: '실측 레퍼런스', value: 'doodoorim .value_sect · 한국 기업 연혁 관습' }
  ],
  guide: '연혁 타임라인은 "스크롤한 만큼만 역사가 공개된다"는 일관성이 생명 — 라인 성장과 카드 등장의 타이밍을 노드 임계점에 맞춰 라인 선단이 곧 최신 사건이 되게 한다. 노드는 4~7개가 적정(2~3개는 빈약, 8개 이상은 스크롤이 지나치게 길어짐). 연도는 이산 교체가 정직하다 — number-counter처럼 1982→1983→…을 보간하면 "흐르는 숫자"가 되어 연혁의 의미가 흐려진다. 가로형(C)은 핀 무대 + 기준선 판정이라 좁은 화면에서 노드 간격을 줄여야 두 노드가 동시에 보이지 않는다. prefers-reduced-motion에서는 라인을 완성 상태로 두고 카드를 정적 나열한다.',
  recommendations: [
    { place: '기업 사이트 메인', body: '회사 연혁 — 창업부터 현재까지를 지그재그 라인(A)으로 풀어 성장 서사를 시각화' },
    { place: '브랜드 캠페인 페이지', body: '캠페인 여정 — 준비→실행→성과의 시간 축을 스크롤에 매핑해 진행감을 전달' },
    { place: '병원·기관 사이트', body: '연혁·인증 이력 — 핀 연도(B)로 한 시점씩 조명하며 신뢰의 누적을 강조' },
    { place: '제품·서비스 쇼케이스', body: '제품 로드맵 — 가로 연대표(C)로 출시·업데이트 이정표를 좌→우로 훑게' }
  ],
  tradeoff: '한 번에 한 시점만 강조되므로 전체 연혁을 빠르게 훑기 어렵다 — 긴 역사라면 핵심 이정표만 추려 노드를 7개 이내로 제한할 것. 라인 성장과 카드 진입 타이밍이 어긋나면 "라인이 먼저 가고 카드가 뒤늦게" 따라오는 부자연스러움이 생기므로 임계점을 정밀히 맞춰야 한다.',
  snippetHTML: '<section class="tl-wrap">\n  <div class="tl-line"><div class="tl-fill"></div></div>  <!-- 자라는 축 -->\n  <div class="tl-items">\n    <div class="tl-item tl-left" data-i="0">…1982…</div>\n    <div class="tl-item tl-right" data-i="1">…1998…</div>\n  </div>\n</section>',
  snippetCSS: '.tl-fill { transform: scaleY(0); transform-origin: top; background: #6fe0a8; }\n.tl-item { opacity: 0; will-change: opacity, transform; }',
  snippetJS: 'var fill = document.querySelector(".tl-fill");\nvar items = document.querySelectorAll(".tl-item");\nvar N = items.length;\nfunction applyReveal(p){\n  fill.style.transform = "scaleY(" + p + ")";        // 축이 자란다\n  items.forEach(function(el, i){\n    var th = (i + 0.5) / N;                            // 노드 임계점\n    var lp = seg(p, th - 0.12, th + 0.06);\n    var dir = el.classList.contains("tl-left") ? -1 : 1;\n    el.style.opacity = lp;\n    el.style.transform = "translateX(" + (dir * 48 * (1 - lp)) + "px)";\n  });\n}',
  examples: [
    {
      key: 'a', id: 'zigzag-line', title: '중앙 라인 지그재그',
      desc: '한울피드 사례 — 화면 중앙 세로 라인이 스크롤에 비례해 자라고, 라인이 닿을 때마다 좌·우 번갈아 배치된 연혁 카드가 바깥에서 미끄러져 들어오며 노드가 점등된다. 라인이 차오른 만큼만 역사가 공개된다.',
      demo: {
        mode: 'scroll', trackVh: 280, height: 600,
        bodyHTML: '<section class="tl-wrap">\n'
          + '  <div class="tl-line"><div class="tl-fill"></div></div>\n'
          + '  <div class="tl-items">\n'
          + '    <div class="tl-item tl-left"><div class="tl-node"></div><div class="tl-card"><span class="tl-year">1982</span><p class="iw-body">한울피드 창업</p></div></div>\n'
          + '    <div class="tl-item tl-right"><div class="tl-node"></div><div class="tl-card"><span class="tl-year">1998</span><p class="iw-body">제2공장 준공</p></div></div>\n'
          + '    <div class="tl-item tl-left"><div class="tl-node"></div><div class="tl-card"><span class="tl-year">2010</span><p class="iw-body">수출 시작</p></div></div>\n'
          + '    <div class="tl-item tl-right"><div class="tl-node"></div><div class="tl-card"><span class="tl-year">2024</span><p class="iw-body">스마트팜 전환</p></div></div>\n'
          + '  </div>\n'
          + '</section>',
        css: '.tl-wrap { position: relative; width: min(760px, 90vw); padding: 30px 0; }\n'
          + '.tl-line { position: absolute; left: 50%; top: 0; bottom: 0; width: 2px; transform: translateX(-50%); background: rgba(255,255,255,0.12); }\n'
          + '.tl-fill { position: absolute; left: 0; top: 0; width: 100%; height: 100%; background: #6fe0a8; transform: scaleY(0); transform-origin: top; }\n'
          + '.tl-items { position: relative; display: flex; flex-direction: column; gap: 36px; }\n'
          + '.tl-item { position: relative; width: 50%; box-sizing: border-box; opacity: 0; will-change: opacity, transform; }\n'
          + '.tl-left { padding-right: 44px; text-align: right; }\n'
          + '.tl-right { align-self: flex-end; padding-left: 44px; text-align: left; }\n'
          + '.tl-node { position: absolute; top: 6px; width: 14px; height: 14px; border-radius: 999px; background: #0a0a0a; border: 2px solid #6fe0a8; }\n'
          + '.tl-left .tl-node { right: -7px; }\n'
          + '.tl-right .tl-node { left: -7px; }\n'
          + '.tl-year { display: block; font: 800 clamp(22px,3vw,34px)/1 "Pretendard Variable",sans-serif; color: #fff; margin-bottom: 8px; }',
        js: 'var fill = stage.querySelector(".tl-fill");\n'
          + 'var items = stage.querySelectorAll(".tl-item");\n'
          + 'var nodes = stage.querySelectorAll(".tl-node");\n'
          + 'var N = items.length;\n'
          + 'function applyReveal(p){\n'
          + '  fill.style.transform = "scaleY(" + p + ")";\n'
          + '  for (var i = 0; i < N; i++){\n'
          + '    var th = (i + 0.5) / N;\n'
          + '    var lp = seg(p, th - 0.12, th + 0.06);\n'
          + '    var dir = items[i].classList.contains("tl-left") ? -1 : 1;\n'
          + '    items[i].style.opacity = lp;\n'
          + '    items[i].style.transform = "translateX(" + (dir * 48 * (1 - lp)) + "px)";\n'
          + '    nodes[i].style.transform = "scale(" + (0.4 + 0.6 * lp) + ")";\n'
          + '    nodes[i].style.boxShadow = "0 0 " + (12 * lp) + "px rgba(111,224,168," + (0.7 * lp) + ")";\n'
          + '  }\n'
          + '}'
      }
    },
    {
      key: 'b', id: 'pinned-year', title: '핀 연도 플레이트 플로우',
      desc: '다온케어 사례 — 좌측에 대형 연도 타이포가 고정된 채 진행률 구간에 따라 2009→2015→2021→2026으로 이산 교체되고(보간 카운터가 아닌 딱 떨어지는 교체), 우측 사건 항목이 그 연도에 맞춰 활성화된다.',
      demo: {
        mode: 'scroll', trackVh: 280, height: 600,
        bodyHTML: '<section class="py-wrap">\n'
          + '  <div class="py-left">\n'
          + '    <span class="py-year is-on">2009</span>\n'
          + '    <span class="py-year">2015</span>\n'
          + '    <span class="py-year">2021</span>\n'
          + '    <span class="py-year">2026</span>\n'
          + '    <span class="py-label">다온케어 연혁</span>\n'
          + '  </div>\n'
          + '  <div class="py-right">\n'
          + '    <article class="py-ev is-active"><span class="iw-tag">2009</span><h3 class="iw-sub">다온케어 설립</h3></article>\n'
          + '    <article class="py-ev"><span class="iw-tag">2015</span><h3 class="iw-sub">건강기능식품 출시</h3></article>\n'
          + '    <article class="py-ev"><span class="iw-tag">2021</span><h3 class="iw-sub">디지털 헬스 플랫폼</h3></article>\n'
          + '    <article class="py-ev"><span class="iw-tag">2026</span><h3 class="iw-sub">글로벌 진출</h3></article>\n'
          + '  </div>\n'
          + '</section>',
        css: '.py-wrap { width: min(960px, 90vw); display: grid; grid-template-columns: 0.8fr 1.2fr; gap: 48px; align-items: center; }\n'
          + '.py-left { position: relative; height: 200px; }\n'
          + '.py-year { position: absolute; top: 0; left: 0; font: 800 clamp(48px,8vw,96px)/1 "Pretendard Variable",sans-serif; color: #fff; opacity: 0; transform: translateY(20px); transition: opacity 180ms ease, transform 180ms ease; }\n'
          + '.py-year.is-on { opacity: 1; transform: none; }\n'
          + '.py-label { position: absolute; bottom: 0; left: 0; font: 600 12px/1 "Pretendard Variable",sans-serif; letter-spacing: 0.18em; text-transform: uppercase; color: #7fe7d4; }\n'
          + '.py-right { display: flex; flex-direction: column; gap: 14px; will-change: transform; }\n'
          + '.py-ev { padding: 16px 22px; border-left: 2px solid rgba(255,255,255,0.16); transition: border-color 180ms ease, opacity 180ms ease; opacity: 0.45; }\n'
          + '.py-ev.is-active { border-color: #7fe7d4; opacity: 1; }\n'
          + '.py-ev .iw-tag { --accent: #7fe7d4; color: #7fe7d4; margin-bottom: 6px; display: block; }',
        js: 'var years = stage.querySelectorAll(".py-year");\n'
          + 'var evs = stage.querySelectorAll(".py-ev");\n'
          + 'var right = stage.querySelector(".py-right");\n'
          + 'var N = years.length;\n'
          + 'function applyReveal(p){\n'
          + '  var idx = Math.min(N - 1, Math.floor(p * N));\n'
          + '  for (var i = 0; i < N; i++){\n'
          + '    years[i].classList.toggle("is-on", i === idx);\n'
          + '    evs[i].classList.toggle("is-active", i === idx);\n'
          + '  }\n'
          + '  right.style.transform = "translateY(" + (-p * 90) + "px)";\n'
          + '}'
      }
    },
    {
      key: 'c', id: 'horizontal-era', title: '가로 연대표 스크럽',
      desc: '유진정밀 사례 — 핀 무대 안에서 가로로 긴 연대표 트랙이 스크롤 진행률에 따라 좌로 이동하고, 노드 도트가 화면 중앙 기준선을 지날 때마다 점등되며 카드가 또렷해진다.',
      demo: {
        mode: 'scroll', trackVh: 280, height: 600,
        bodyHTML: '<section class="he-wrap">\n'
          + '  <div class="he-guide"></div>\n'
          + '  <div class="he-track">\n'
          + '    <div class="he-node"><span class="he-dot"></span><div class="he-card"><span class="he-year">1995</span><p class="iw-body">유진정밀 창업</p></div></div>\n'
          + '    <div class="he-node"><span class="he-dot"></span><div class="he-card"><span class="he-year">2003</span><p class="iw-body">자동차 부품 진출</p></div></div>\n'
          + '    <div class="he-node"><span class="he-dot"></span><div class="he-card"><span class="he-year">2012</span><p class="iw-body">베트남 법인 설립</p></div></div>\n'
          + '    <div class="he-node"><span class="he-dot"></span><div class="he-card"><span class="he-year">2020</span><p class="iw-body">전기차 부품 양산</p></div></div>\n'
          + '    <div class="he-node"><span class="he-dot"></span><div class="he-card"><span class="he-year">2026</span><p class="iw-body">스마트 팩토리 완성</p></div></div>\n'
          + '  </div>\n'
          + '</section>',
        css: '.he-wrap { position: absolute; inset: 0; display: flex; align-items: center; overflow: hidden; }\n'
          + '.he-guide { position: absolute; left: 50%; top: 18%; bottom: 18%; width: 2px; background: rgba(255,255,255,0.18); z-index: 3; }\n'
          + '.he-track { display: flex; gap: 8vw; align-items: center; padding: 0 50vw; will-change: transform; }\n'
          + '.he-node { position: relative; flex: 0 0 auto; display: flex; flex-direction: column; align-items: center; gap: 18px; }\n'
          + '.he-dot { width: 16px; height: 16px; border-radius: 999px; background: #0a0a0a; border: 2px solid rgba(255,255,255,0.3); transition: border-color 150ms ease, transform 150ms ease, box-shadow 150ms ease; }\n'
          + '.he-node.is-on .he-dot { border-color: #8ab4ff; transform: scale(1.3); box-shadow: 0 0 16px rgba(138,180,255,0.7); }\n'
          + '.he-card { text-align: center; opacity: 0.4; transform: translateY(8px); transition: opacity 150ms ease, transform 150ms ease; max-width: 180px; }\n'
          + '.he-node.is-on .he-card { opacity: 1; transform: none; }\n'
          + '.he-year { display: block; font: 800 clamp(20px,2.6vw,30px)/1 "Pretendard Variable",sans-serif; color: #fff; margin-bottom: 6px; }',
        js: 'var track = stage.querySelector(".he-track");\n'
          + 'var nodes = stage.querySelectorAll(".he-node");\n'
          + 'function applyReveal(p){\n'
          + '  var tw = track.scrollWidth;\n'
          + '  var vw = stage.clientWidth;\n'
          + '  var max = Math.max(1, tw - vw);\n'
          + '  track.style.transform = "translateX(" + (-p * max) + "px)";\n'
          + '  var sr = stage.getBoundingClientRect();\n'
          + '  var centerX = sr.width / 2;\n'
          + '  for (var i = 0; i < nodes.length; i++){\n'
          + '    var r = nodes[i].getBoundingClientRect();\n'
          + '    var nodeCenter = r.left + r.width / 2 - sr.left;\n'
          + '    nodes[i].classList.toggle("is-on", Math.abs(nodeCenter - centerX) < 90);\n'
          + '  }\n'
          + '}'
      }
    }
  ]
};

const E09 = {
  id: 'cinematic-finale', num: '09', title: '시네마틱 멀티 페이즈 피날레',
  summary: '페이지 말미의 100vh 무대에서 이미지·심볼·타이포가 수렴→발산→정착의 다단계 안무로 브랜드 메시지를 마무리하는 시네마틱 피날레 섹션. 어워드 출품작 스타일의 정점 연출로, 원본(syfund)은 1회성 자동 타임라인이지만 전 구간을 스크롤 진행률에 페이즈 분할 매핑해 사용자가 되감기까지 가능하게 재해석했다. 화면 슬라이드 교체(full-screen-scroll)와 달리 한 무대 안 요소들이 다단계로 안무되는 것이 단위다.',
  evidence: 'syfund sec-timeless — 타이포 fade-up → 이미지 3장 사방 수렴 → x 120%/-140%/40% 발산 + 시계 scale 0.2→1 back.out 팝업 → y:-1000 플라이아웃 4막(원본 once 자동) / doodoorim .program_sect — pin end +600% 타이포 트래킹→심볼 라이즈→로고 clip-path 와이프→카드 진입 4장면',
  explain: '전역 progress를 페이즈 경계로 분할해 페이즈마다 다른 속성 세트를 inline 보간한다 — 역스크롤 시 전 과정이 그대로 되감긴다. A(수렴-발산)는 [0~0.3] 오브제 3장을 사방에서 중앙으로 모으고(translate·scale), [0.3~0.55] 빈 중앙에 심볼을 backOut 오버슈트로 팝업시키며 내부 바늘을 rotate=p·720deg로 스크럽 회전(무한 keyframes 금지), [0.55~0.85] 사방으로 발산, [0.78~] 오브제 페이드 퇴장 후 카피를 남긴다. B(장면 체인)는 대형 타이포(letter-spacing 0.4em→0.02em 수축)→심볼+라인 드로잉→로고 clip-path 가로 와이프 3장면을 삼각 윈도 opacity로 크로스페이드한다. C(프레임 정착)는 수렴한 오브제를 화면 네 모서리(±38vw, ±34vh)에 액자처럼 정착시켜 중앙 카피를 둘러싸는 포스터 엔딩을 만든다.',
  kv: [
    { label: '의존성', value: 'Vanilla JS — 페이즈 분할 + backOut 오버슈트 보간' },
    { label: '트리거', value: '스크롤 진행률 (원본 once 자동 → 스크럽 번역)' },
    { label: '스크롤 트랙', value: '280vh + sticky 100vh' },
    { label: '핵심 매핑', value: '페이즈 [0,0.3,0.55,0.8,1] · 심볼 backOut · 바늘 rotate p·720°' },
    { label: '권장 콘텐츠', value: '오브제 3~4 + 브랜드 심볼 1 + 마무리 카피' },
    { label: '실측 레퍼런스', value: 'syfund sec-timeless · doodoorim .program_sect' }
  ],
  guide: '피날레의 묘미는 "페이즈 경계가 또렷하되 이음새는 부드럽다"는 데 있다 — 수렴·팝업·발산·퇴장 구간을 명확히 나누되 인접 페이즈가 0.05 정도 겹치게 해 끊김을 없앤다. 원본이 자동 재생이라도 이 카탈로그에서는 전 구간을 스크럽으로 번역해 사용자가 속도를 쥐게 하는 것이 핵심 — backOut 같은 오버슈트 이징은 CSS가 아니라 JS 함수로 progress에 직접 적용한다(시계 바늘도 무한 회전 keyframes가 아니라 rotate=p·720deg). 280vh로 충분한 스크롤 공간을 줘야 4막이 여유 있게 펼쳐진다. prefers-reduced-motion에서는 최종 정착 상태(심볼+카피)를 정적으로 보여줄 것.',
  recommendations: [
    { place: '기업 사이트 메인', body: '브랜드 클로징 — 페이지 끝에서 핵심 가치를 심볼 팝업(A)으로 각인시키며 마무리' },
    { place: '브랜드 캠페인 페이지', body: '엔딩 시퀀스 — 장면 체인(B)으로 캠페인 메시지를 영화 엔딩처럼 한 컷씩 닫음' },
    { place: '병원·기관 사이트', body: '비전 마무리 — 차분한 장면 전환으로 설립 정신·로고를 마지막에 공개' },
    { place: '제품·서비스 쇼케이스', body: '제품 피날레 — 프레임 정착(C)으로 제품 컷들을 포스터처럼 배치해 슬로건을 강조' }
  ],
  tradeoff: '연출이 화려한 만큼 구현·합성 부하가 카테고리 내 최고 수준이라 페이지에 1개만 허용된다. 스크롤 공간(280vh)이 길어 모바일에서 끝까지 도달하기 전에 이탈할 수 있으므로, 핵심 메시지(카피·심볼)는 마지막 페이즈가 아니라 중반(0.5~0.7)부터 드러나기 시작하게 설계할 것.',
  snippetHTML: '<section class="cf-wrap">\n  <div class="cf-obj cf-o0"></div>\n  <div class="cf-obj cf-o1"></div>\n  <div class="cf-obj cf-o2"></div>\n  <div class="cf-symbol"><!-- 시계 심볼 --></div>\n  <div class="cf-copy"><!-- 마무리 카피 --></div>\n</section>',
  snippetCSS: '.cf-obj    { position: absolute; will-change: transform, opacity; }\n.cf-symbol { position: absolute; opacity: 0; will-change: transform, opacity; }',
  snippetJS: 'var seeds  = [{x:-120,y:-80},{x:130,y:-60},{x:-40,y:120}]; // 시작 위치\nvar bursts = [{x:-130,y:-30},{x:150,y:20},{x:40,y:140}];   // 발산 위치\nfunction applyReveal(p){\n  var conv = seg(p, 0, 0.3), burst = seg(p, 0.55, 0.85);\n  objs.forEach(function(o, i){                              // 수렴 → 발산\n    var x = seeds[i].x*(1-conv) + bursts[i].x*burst;\n    var y = seeds[i].y*(1-conv) + bursts[i].y*burst;\n    o.style.transform = "translate(" + x + "px," + y + "px)";\n    o.style.opacity = 1 - seg(p, 0.78, 0.92);              // 퇴장\n  });\n  var pop = backOut(seg(p, 0.3, 0.55));                     // 오버슈트 팝업\n  symbol.style.transform = "scale(" + (0.2 + 0.8*pop) + ")";\n  handM.style.transform = "translateX(-50%) rotate(" + (p*720) + "deg)"; // 스크럽 회전\n}',
  examples: [
    {
      key: 'a', id: 'converge-burst', title: '수렴-발산 오브제 + 심볼 팝',
      desc: '선재자산운용 사례 — 이미지 카드 3장이 사방에서 중앙으로 모였다 폭발하듯 흩어지고, 빈 중앙에 시계 심볼이 backOut 바운스로 팝업해 바늘이 스크롤에 맞춰 돌기 시작하며, 카드가 퇴장하고 카피만 남는다.',
      demo: {
        mode: 'scroll', trackVh: 280, height: 600,
        bodyHTML: '<section class="cf-wrap">\n'
          + '  <div class="cf-obj cf-o0"></div>\n'
          + '  <div class="cf-obj cf-o1"></div>\n'
          + '  <div class="cf-obj cf-o2"></div>\n'
          + '  <div class="cf-symbol"><div class="cf-clock"><span class="cf-hand cf-hand-m"></span><span class="cf-hand cf-hand-h"></span><span class="cf-pin"></span></div></div>\n'
          + '  <div class="cf-copy"><p class="iw-eyebrow">TIMELESS VALUE</p><h2 class="iw-head">시간이 지나도<br>변하지 않는 가치</h2></div>\n'
          + '</section>',
        css: '.cf-wrap { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }\n'
          + '.cf-obj { position: absolute; width: clamp(90px,12vw,150px); aspect-ratio: 3/4; border-radius: 12px; will-change: transform, opacity; }\n'
          + '.cf-o0 { background: linear-gradient(140deg,#c9a86a,#7a5e2e); }\n'
          + '.cf-o1 { background: linear-gradient(140deg,#3a5a8a,#16263f); }\n'
          + '.cf-o2 { background: linear-gradient(140deg,#6a3a5a,#2a1428); }\n'
          + '.cf-symbol { position: absolute; width: clamp(120px,16vw,200px); aspect-ratio: 1; opacity: 0; will-change: transform, opacity; z-index: 3; }\n'
          + '.cf-clock { position: absolute; inset: 0; border-radius: 999px; border: 3px solid #c9a86a; background: radial-gradient(circle, #14233f, #0a1322); }\n'
          + '.cf-hand { position: absolute; left: 50%; bottom: 50%; background: #fff; transform-origin: bottom center; border-radius: 2px; }\n'
          + '.cf-hand-m { width: 3px; height: 38%; }\n'
          + '.cf-hand-h { width: 4px; height: 26%; background: #c9a86a; }\n'
          + '.cf-pin { position: absolute; left: 50%; top: 50%; width: 10px; height: 10px; border-radius: 999px; background: #c9a86a; transform: translate(-50%,-50%); }\n'
          + '.cf-copy { position: relative; z-index: 4; text-align: center; opacity: 0; transform: translateY(20px); will-change: opacity, transform; }\n'
          + '.cf-wrap .iw-eyebrow { --accent: #c9a86a; margin-bottom: 16px; }',
        js: 'var objs = stage.querySelectorAll(".cf-obj");\n'
          + 'var symbol = stage.querySelector(".cf-symbol");\n'
          + 'var handM = stage.querySelector(".cf-hand-m");\n'
          + 'var handH = stage.querySelector(".cf-hand-h");\n'
          + 'var copy = stage.querySelector(".cf-copy");\n'
          + 'var seeds = [{x:-120,y:-80},{x:130,y:-60},{x:-40,y:120}];\n'
          + 'var bursts = [{x:-130,y:-30},{x:150,y:20},{x:40,y:140}];\n'
          + 'function applyReveal(p){\n'
          + '  var conv = seg(p, 0, 0.3);\n'
          + '  var burst = seg(p, 0.55, 0.85);\n'
          + '  for (var i = 0; i < objs.length; i++){\n'
          + '    var sx = seeds[i].x * (1 - conv) + bursts[i].x * burst;\n'
          + '    var sy = seeds[i].y * (1 - conv) + bursts[i].y * burst;\n'
          + '    var sc = (0.9 + 0.1 * conv) - 0.3 * burst;\n'
          + '    objs[i].style.transform = "translate(" + sx + "px," + sy + "px) scale(" + sc + ")";\n'
          + '    objs[i].style.opacity = 1 - seg(p, 0.78, 0.92);\n'
          + '  }\n'
          + '  var pop = backOut(seg(p, 0.3, 0.55));\n'
          + '  symbol.style.opacity = clamp01(seg(p, 0.3, 0.4));\n'
          + '  symbol.style.transform = "scale(" + (0.2 + 0.8 * pop) + ")";\n'
          + '  handM.style.transform = "translateX(-50%) rotate(" + (p * 720) + "deg)";\n'
          + '  handH.style.transform = "translateX(-50%) rotate(" + (p * 60) + "deg)";\n'
          + '  var cp = seg(p, 0.75, 1);\n'
          + '  copy.style.opacity = cp;\n'
          + '  copy.style.transform = "translateY(" + (20 * (1 - cp)) + "px)";\n'
          + '}'
      }
    },
    {
      key: 'b', id: 'scene-chain', title: '장면 크로스페이드 체인',
      desc: '온결의원 사례 — 대형 타이포(자간 수축)→심볼+라인 드로잉→로고 가로 와이프 3장면이 같은 무대 위에서 앞 장면이 가라앉으며 뒤 장면이 떠오르는 체인으로 교체된다. 단편 영화의 컷 전환 같다.',
      demo: {
        mode: 'scroll', trackVh: 280, height: 600,
        bodyHTML: '<section class="sc-wrap">\n'
          + '  <div class="sc-scene sc-s0"><h2 class="sc-bigtypo">ONGYEOL</h2></div>\n'
          + '  <div class="sc-scene sc-s1"><div class="sc-symbol"><span class="sc-line"></span></div><p class="iw-body">통증의 근본을 봅니다</p></div>\n'
          + '  <div class="sc-scene sc-s2"><div class="sc-logo"><span class="sc-logo-back">온결의원</span><span class="sc-logo-front">온결의원</span></div></div>\n'
          + '</section>',
        css: '.sc-wrap { position: absolute; inset: 0; }\n'
          + '.sc-scene { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px; opacity: 0; will-change: opacity; }\n'
          + '.sc-bigtypo { font: 900 clamp(40px,11vw,150px)/1 "Pretendard Variable",sans-serif; color: #fff; letter-spacing: 0.4em; margin: 0; }\n'
          + '.sc-symbol { width: 90px; height: 90px; border-radius: 999px; border: 2px solid #5cc8ff; position: relative; }\n'
          + '.sc-line { position: absolute; left: 50%; top: 50%; width: 2px; height: 0; background: #5cc8ff; transform: translateX(-50%); }\n'
          + '.sc-s1 .iw-body { color: #fff; font-size: clamp(18px,2.4vw,28px); }\n'
          + '.sc-logo { position: relative; }\n'
          + '.sc-logo span { font: 800 clamp(36px,6vw,72px)/1 "Pretendard Variable",sans-serif; }\n'
          + '.sc-logo-back { color: rgba(255,255,255,0.18); filter: blur(6px); }\n'
          + '.sc-logo-front { position: absolute; inset: 0; color: #fff; clip-path: inset(0 100% 0 0); }',
        js: 'var scenes = stage.querySelectorAll(".sc-scene");\n'
          + 'var bigtypo = stage.querySelector(".sc-bigtypo");\n'
          + 'var line = stage.querySelector(".sc-line");\n'
          + 'var logoFront = stage.querySelector(".sc-logo-front");\n'
          + 'var N = scenes.length;\n'
          + 'function applyReveal(p){\n'
          + '  for (var i = 0; i < N; i++){\n'
          + '    var op;\n'
          + '    if (i < N - 1) op = seg(p, i/3 + 0.02, i/3 + 0.12) * (1 - seg(p, (i+1)/3 - 0.04, (i+1)/3 + 0.04));\n'
          + '    else op = seg(p, i/3 + 0.02, i/3 + 0.12);\n'
          + '    scenes[i].style.opacity = op;\n'
          + '  }\n'
          + '  bigtypo.style.letterSpacing = lerp(0.4, 0.02, seg(p, 0, 0.28)) + "em";\n'
          + '  line.style.height = (seg(p, 0.36, 0.6) * 40) + "px";\n'
          + '  logoFront.style.clipPath = "inset(0 " + ((1 - seg(p, 0.72, 0.96)) * 100) + "% 0 0)";\n'
          + '}'
      }
    },
    {
      key: 'c', id: 'frame-settle', title: '프레임 정착 발산',
      desc: '휴먼라이트 사례 — 중앙으로 모였던 오브제들이 화면 밖으로 사라지지 않고 네 모서리에 액자처럼 정착해 중앙 카피를 둘러싸는 프레임을 완성한다. 끝 화면이 포스터처럼 남는다.',
      demo: {
        mode: 'scroll', trackVh: 280, height: 600,
        bodyHTML: '<section class="fs2-wrap">\n'
          + '  <div class="fs2-obj fs2-o0"></div>\n'
          + '  <div class="fs2-obj fs2-o1"></div>\n'
          + '  <div class="fs2-obj fs2-o2"></div>\n'
          + '  <div class="fs2-obj fs2-o3"></div>\n'
          + '  <div class="fs2-copy"><p class="iw-eyebrow">TOGETHER</p><h2 class="iw-head">우리가 함께라면</h2></div>\n'
          + '</section>',
        css: '.fs2-wrap { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }\n'
          + '.fs2-obj { position: absolute; width: clamp(80px,10vw,130px); aspect-ratio: 1; border-radius: 16px; will-change: transform; }\n'
          + '.fs2-o0 { background: linear-gradient(140deg,#ffd23f,#b8860b); }\n'
          + '.fs2-o1 { background: linear-gradient(140deg,#ff6b4a,#a8321a); }\n'
          + '.fs2-o2 { background: linear-gradient(140deg,#5cc8ff,#1a6a9a); }\n'
          + '.fs2-o3 { background: linear-gradient(140deg,#a78bfa,#5a3aa8); }\n'
          + '.fs2-copy { position: relative; z-index: 3; text-align: center; opacity: 0; will-change: opacity; }\n'
          + '.fs2-wrap .iw-eyebrow { --accent: #ffd23f; margin-bottom: 16px; }',
        js: 'var objs = stage.querySelectorAll(".fs2-obj");\n'
          + 'var copy = stage.querySelector(".fs2-copy");\n'
          + 'var seeds = [{x:-100,y:-70},{x:110,y:-80},{x:-120,y:90},{x:100,y:100}];\n'
          + 'var corners = [{x:-38,y:-34},{x:38,y:-34},{x:-38,y:34},{x:38,y:34}];\n'
          + 'function applyReveal(p){\n'
          + '  var conv = seg(p, 0, 0.4);\n'
          + '  var settle = seg(p, 0.55, 0.85);\n'
          + '  for (var i = 0; i < objs.length; i++){\n'
          + '    var cx = seeds[i].x * (1 - conv);\n'
          + '    var cy = seeds[i].y * (1 - conv);\n'
          + '    var fx = corners[i].x * settle;\n'
          + '    var fy = corners[i].y * settle;\n'
          + '    var rot = (i % 2 ? 6 : -6) * settle;\n'
          + '    objs[i].style.transform = "translate(calc(" + cx + "px + " + fx + "vw), calc(" + cy + "px + " + fy + "vh)) scale(" + (0.9 + 0.1 * conv - 0.35 * settle) + ") rotate(" + rot + "deg)";\n'
          + '  }\n'
          + '  var cp = seg(p, 0.7, 1);\n'
          + '  copy.style.opacity = cp;\n'
          + '  copy.style.letterSpacing = lerp(0.3, 0.02, cp) + "em";\n'
          + '}'
      }
    }
  ]
};

const E10 = {
  id: 'section-handoff', num: '10', title: '핀 오버랩 섹션 전환·푸터 리빌',
  summary: '섹션과 섹션 사이의 이음새 자체를 연출 단위로 삼는 전환 섹션. 앞 섹션을 핀으로 고정해 두고 다음 섹션이 위로 덮으며 올라오거나, 마지막 섹션이 떠난 자리로 푸터가 따라 내려와 정착하는 등 "레이어가 레이어를 덮고 벗기는" z-축 핸드오프를 스크롤 진행률로 구동한다. 배경색 전환(scroll-color-morph)이 아니라 레이어 기하 전환이 본체다.',
  evidence: 'doodoorim .intro_sect — ScrollTrigger pin(end +300%, pinSpacing:false)로 문장 섹션을 고정해 .phil_sect가 위에서 덮으며 등장하는 핀 오버랩 / nifco #footer — gsap.fromTo(#footerInner, y:-20vh→0, scrub) 푸터가 따라 내려와 정착하는 커튼 리빌',
  explain: 'A(커버업)는 앞 섹션 A를 sticky 무대에 고정한 채 다음 섹션 B를 absolute 풀사이즈로 translateY((1-p)·100vh) + 상단 border-radius 32px→0으로 카드처럼 올려 화면을 덮는다(transform만 변해 리플로우 없음). B(딥 푸시)는 같은 덮기에 더해 아래 섹션 A에 scale(1-0.08p)·brightness(1-0.45p)를 중첩해 뒤로 밀려나는 깊이감을 준다. C(푸터 커튼)는 마지막 콘텐츠 섹션을 translateY(-p·30vh)·opacity로 위로 떠나보내고, 아래 깔린 푸터를 translateY(-(1-p)·20vh)·opacity 0.6→1로 따라 내려와 정착시키며 상단 보더(scaleX)와 컬럼을 시차 등장시킨다. 모두 inline transform 1:1이라 역스크롤로 되감긴다.',
  kv: [
    { label: '의존성', value: 'Vanilla JS — 레이어 translateY/scale/radius 보간' },
    { label: '트리거', value: '스크롤 진행률' },
    { label: '스크롤 트랙', value: '240vh + sticky 100vh' },
    { label: '핵심 매핑', value: 'B translateY (1-p)·100vh · 상단 radius 32→0 / A scale·brightness' },
    { label: '권장 콘텐츠', value: '인접 두 섹션 또는 콘텐츠+푸터' },
    { label: '실측 레퍼런스', value: 'doodoorim .intro_sect · nifco #footer' }
  ],
  guide: '섹션 전환은 "덮인다/벗겨진다"는 물성이 분명해야 한다 — A를 확실히 고정(sticky)하고 B를 transform으로만 움직여 리플로우 없이 60fps를 유지한다. 상단 라운드(32→0)는 "카드가 올라와 화면이 된다"는 인상을 강화하는 작은 디테일이다. 딥 푸시(B)의 scale·brightness는 과하면 멀미를 유발하므로 scale 0.92, brightness 0.55 이하로 절제한다. 푸터 커튼(C)은 페이지의 마침표이므로 한 번만, 진짜 끝에서 쓴다. prefers-reduced-motion에서는 레이어 이동을 끄고 즉시 전환(또는 정적 정렬)으로 폴백할 것.',
  recommendations: [
    { place: '기업 사이트 메인', body: '섹션 이음새 — 소개→사업 섹션 전환을 커버업(A)으로 매끄럽게 이어 한 흐름으로 읽히게' },
    { place: '브랜드 캠페인 페이지', body: '챕터 전환 — 딥 푸시(B)로 이전 챕터를 뒤로 밀어내며 다음 챕터에 공간감을 부여' },
    { place: '병원·기관 사이트', body: '인트로→본문 — 한 문장 인트로를 고정하고 본문이 덮으며 등장(온결의원 원형)' },
    { place: '제품·서비스 쇼케이스', body: '마무리 푸터 — 마지막 제품 섹션이 떠나고 푸터가 커튼처럼 내려와(C) 페이지를 닫음' }
  ],
  tradeoff: '핀 오버랩은 스크롤 위치와 레이어 상태가 어긋나면 "두 섹션이 겹쳐 깜빡이는" 느낌을 주므로 transform 매핑을 정밀히 해야 한다. 레이어를 풀사이즈로 겹쳐두므로 두 섹션의 콘텐츠가 모두 무거우면 합성 비용이 크다 — 전환 구간에서는 한쪽을 단순하게 유지할 것.',
  snippetHTML: '<section class="ho-wrap">\n  <div class="ho-a"><!-- 앞 섹션 (고정) --></div>\n  <div class="ho-b"><!-- 다음 섹션 (덮으며 올라옴) --></div>\n</section>',
  snippetCSS: '.ho-a, .ho-b { position: absolute; inset: 0; }\n.ho-b { z-index: 2; will-change: transform; } /* 위 레이어 */',
  snippetJS: 'var b = document.querySelector(".ho-b");\nfunction applyReveal(p){\n  b.style.transform = "translateY(" + (100 * (1 - p)) + "vh)"; // 아래→덮기\n  var r = 32 * (1 - p);                                        // 카드→화면\n  b.style.borderTopLeftRadius = r + "px";\n  b.style.borderTopRightRadius = r + "px";\n}',
  examples: [
    {
      key: 'a', id: 'cover-up', title: '커버업 오버랩',
      desc: '온결의원 사례 — 고정된 앞 섹션 위로 다음 섹션이 한 장의 카드처럼 아래에서 올라와 화면을 덮는다. 앞 섹션은 끝까지 제자리에 있어 "덮인다"는 물성이 명확하고, 상단 라운드가 펴지며 카드가 화면이 된다.',
      demo: {
        mode: 'scroll', trackVh: 240, height: 600,
        bodyHTML: '<section class="ho-wrap">\n'
          + '  <div class="ho-a"><div class="ho-inner"><p class="iw-eyebrow">SECTION A</p><h2 class="iw-head">진료 철학</h2><p class="iw-body">통증의 원인부터 바로잡습니다.</p></div></div>\n'
          + '  <div class="ho-b"><div class="ho-inner"><p class="iw-eyebrow">SECTION B</p><h2 class="iw-head">진료 안내</h2><p class="iw-body">예약과 진료 절차를 안내합니다.</p></div></div>\n'
          + '</section>',
        css: '.ho-wrap { position: absolute; inset: 0; }\n'
          + '.ho-a, .ho-b { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }\n'
          + '.ho-a { background: radial-gradient(120% 120% at 50% 30%, #18324a, #0a161f); }\n'
          + '.ho-b { background: radial-gradient(120% 120% at 50% 70%, #1f5a4e, #0a2019); will-change: transform; z-index: 2; }\n'
          + '.ho-inner { text-align: center; padding: 0 32px; }\n'
          + '.ho-a .iw-eyebrow { --accent: #5cc8ff; margin-bottom: 16px; }\n'
          + '.ho-b .iw-eyebrow { --accent: #7fe7d4; margin-bottom: 16px; }\n'
          + '.ho-inner .iw-head { margin-bottom: 14px; }',
        js: 'var b = stage.querySelector(".ho-b");\n'
          + 'function applyReveal(p){\n'
          + '  b.style.transform = "translateY(" + (100 * (1 - p)) + "vh)";\n'
          + '  var r = 32 * (1 - p);\n'
          + '  b.style.borderTopLeftRadius = r + "px";\n'
          + '  b.style.borderTopRightRadius = r + "px";\n'
          + '}'
      }
    },
    {
      key: 'b', id: 'push-recede', title: '딥 푸시 후퇴',
      desc: '다온케어 사례 — 다음 섹션이 올라와 덮이는 순간 아래 섹션이 스케일 다운·딤 처리되며 무대 뒤로 밀려난다. 위 레이어의 등장에 공간감이 실린다.',
      demo: {
        mode: 'scroll', trackVh: 240, height: 600,
        bodyHTML: '<section class="pr-wrap">\n'
          + '  <div class="pr-a-holder"><div class="pr-a"><div class="ho-inner"><p class="iw-eyebrow">SECTION A</p><h2 class="iw-head">서비스 소개</h2><p class="iw-body">건강한 일상을 설계합니다.</p></div></div></div>\n'
          + '  <div class="pr-b"><div class="ho-inner"><p class="iw-eyebrow">SECTION B</p><h2 class="iw-head">이용 안내</h2><p class="iw-body">멤버십과 케어 절차를 안내합니다.</p></div></div>\n'
          + '</section>',
        css: '.pr-wrap { position: absolute; inset: 0; }\n'
          + '.pr-a-holder { position: absolute; inset: 0; overflow: hidden; }\n'
          + '.pr-a { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: radial-gradient(120% 120% at 50% 30%, #1f5a4e, #0a2019); will-change: transform, filter; }\n'
          + '.pr-b { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: radial-gradient(120% 120% at 50% 70%, #3a2a5a, #160a1e); will-change: transform; z-index: 2; }\n'
          + '.ho-inner { text-align: center; padding: 0 32px; }\n'
          + '.ho-inner .iw-head { margin-bottom: 14px; }\n'
          + '.pr-a .iw-eyebrow { --accent: #7fe7d4; margin-bottom: 16px; }\n'
          + '.pr-b .iw-eyebrow { --accent: #a78bfa; margin-bottom: 16px; }',
        js: 'var a = stage.querySelector(".pr-a");\n'
          + 'var b = stage.querySelector(".pr-b");\n'
          + 'function applyReveal(p){\n'
          + '  b.style.transform = "translateY(" + (100 * (1 - p)) + "vh)";\n'
          + '  var r = 32 * (1 - p);\n'
          + '  b.style.borderTopLeftRadius = r + "px";\n'
          + '  b.style.borderTopRightRadius = r + "px";\n'
          + '  a.style.transform = "scale(" + (1 - 0.08 * p) + ")";\n'
          + '  a.style.filter = "brightness(" + (1 - 0.45 * p) + ")";\n'
          + '}'
      }
    },
    {
      key: 'c', id: 'footer-curtain', title: '커튼 푸터 리빌',
      desc: '유진정밀 사례 — 마지막 콘텐츠 섹션이 위로 떠나면 그 아래 미리 깔려 있던 푸터가 -20vh에서 따라 내려와 정착한다. 상단 보더가 그어지고 컬럼이 시차로 등장하며 페이지의 마침표를 모션으로 찍는다.',
      demo: {
        mode: 'scroll', trackVh: 240, height: 600,
        bodyHTML: '<section class="fc-wrap">\n'
          + '  <div class="fc-content"><h2 class="iw-head">마지막 섹션</h2><p class="iw-body">스크롤이 끝에 닿으면 푸터가 따라 내려옵니다.</p></div>\n'
          + '  <footer class="fc-footer">\n'
          + '    <span class="fc-bar"></span>\n'
          + '    <div class="fc-col"><strong>유진정밀</strong><span>YUJIN PRECISION</span></div>\n'
          + '    <div class="fc-col"><span>제품</span><span>회사소개</span><span>채용</span></div>\n'
          + '    <div class="fc-col"><span>경기도 안산시</span><span>+82 31-000-0000</span></div>\n'
          + '  </footer>\n'
          + '</section>',
        css: '.fc-wrap { position: absolute; inset: 0; overflow: hidden; display: flex; flex-direction: column; }\n'
          + '.fc-content { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; text-align: center; will-change: transform, opacity; }\n'
          + '.fc-footer { position: relative; padding: 40px 8vw; display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; background: #0c0e12; border-top: 1px solid rgba(255,255,255,0.12); will-change: transform, opacity; }\n'
          + '.fc-col { display: flex; flex-direction: column; gap: 8px; font: 400 14px/1.6 "Pretendard Variable",sans-serif; color: rgba(255,255,255,0.5); will-change: opacity, transform; }\n'
          + '.fc-col strong { font: 800 20px/1 "Pretendard Variable",sans-serif; color: #fff; }\n'
          + '.fc-bar { position: absolute; top: 0; left: 0; right: 0; height: 2px; background: #8ab4ff; transform: scaleX(0); transform-origin: left; }',
        js: 'var content = stage.querySelector(".fc-content");\n'
          + 'var footer = stage.querySelector(".fc-footer");\n'
          + 'var bar = stage.querySelector(".fc-bar");\n'
          + 'var cols = stage.querySelectorAll(".fc-col");\n'
          + 'function applyReveal(p){\n'
          + '  content.style.transform = "translateY(" + (-p * 30) + "vh)";\n'
          + '  content.style.opacity = 1 - seg(p, 0.3, 0.8);\n'
          + '  footer.style.transform = "translateY(" + (-(1 - p) * 20) + "vh)";\n'
          + '  footer.style.opacity = 0.6 + 0.4 * p;\n'
          + '  bar.style.transform = "scaleX(" + seg(p, 0.2, 0.8) + ")";\n'
          + '  for (var i = 0; i < cols.length; i++){\n'
          + '    var s = 0.4 + i * 0.08;\n'
          + '    var lp = seg(p, s, s + 0.3);\n'
          + '    cols[i].style.opacity = lp;\n'
          + '    cols[i].style.transform = "translateY(" + (16 * (1 - lp)) + "px)";\n'
          + '  }\n'
          + '}'
      }
    }
  ]
};

// ELEMENTS_INSERT_MARKER

const ELEMENTS = [E01, E02, E03, E04, E05, E06, E07, E08, E09, E10];

main();
