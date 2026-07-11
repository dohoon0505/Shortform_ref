#!/usr/bin/env node
/**
 * Web Reference Lab — Category Generator: Card Wavy Swap (v1 smooth)
 * Framer 마켓플레이스 "Masked Scroll Slider" — 카드(세로형 프레임) 내부 물결 전환
 *
 * Fullscreen Wavy Swap과 같은 물결 엔진을 쓰되, 풀블리드가 아니라 화면 중앙에 고정된
 * 카드 프레임(3:4, border-radius + shadow) 내부에서만 물결 스왑이 일어난다.
 * clip-path 좌표는 카드 프레임 치수 기준으로 측정한다.
 *
 * 공유 엔진: scripts/lib/wavy-shared.mjs
 * Usage: node scripts/generate-card-wavy-swap.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { engineIIFE, snippetJS, chromeCss, buildPatterns } from './lib/wavy-shared.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ANALYSIS_DIR = join(ROOT, 'analyses', 'card-wavy-swap');
const ANALYSIS_FILE = join(ANALYSIS_DIR, 'analysis.json');
const DEMO_DIR = join(ROOT, 'demos', 'card-wavy-swap');

const CATEGORY = {
  id: 'card-wavy-swap',
  title: 'Card Wavy Swap',
  type: 'category',
  date: '2026-06-04',
  url: 'https://www.framer.com/marketplace/components/masked-scroll-slider/',
  summary: 'Framer 마켓플레이스 "Masked Scroll Slider" 시그니처를 카드 형태로 옮긴 인터랙션. 스크롤 시 화면이 고정(sticky)되고, 화면 중앙에 놓인 세로형 카드 프레임(3:4, 둥근 모서리 + 그림자) 내부에서만 이미지가 물결(wavy) 마스크로 다음 이미지로 전환된다. 풀블리드(Fullscreen Wavy Swap)와 달리 카드 바깥은 정적인 배경으로 남아, 갤러리·제품 카드·포트폴리오 카드처럼 콘텐츠가 컨테이너에 담긴 맥락에 적합하다. clip-path 좌표를 카드 프레임 치수 기준으로 측정하는 점만 다르고, 물결 엔진(clip-path: path() 2차 베지어 + requestAnimationFrame lerp 보간)은 동일하다. 모든 reveal은 스크롤 진행률에 매핑된다.'
};

const IMAGES = [
  { src: 'https://picsum.photos/seed/cwave-portrait1/900/1200', cap: '01 · 해안의 아침' },
  { src: 'https://picsum.photos/seed/cwave-portrait2/900/1200', cap: '02 · 물결 위의 건축' },
  { src: 'https://picsum.photos/seed/cwave-portrait3/900/1200', cap: '03 · 사구와 들꽃' },
  { src: 'https://picsum.photos/seed/cwave-portrait4/900/1200', cap: '04 · 황혼의 바다' },
  { src: 'https://picsum.photos/seed/cwave-portrait5/900/1200', cap: '05 · 미니멀 풍경' }
];
const N = IMAGES.length;

const DIMS_BODY = 'var f = document.querySelector(".wis-frame"); return [f.clientWidth, f.clientHeight];';

/* 컨텍스트별 활용 추천 (카드 맥락) */
function reco(spec) {
  var map = {
    'wave-up': [
      ['히어로 헤더', '제품 카드 — 카드 안 이미지가 물결로 차오르며 교체'],
      ['랜딩 페이지', '피처 카드 그리드 — 대표 카드만 물결 슬라이더'],
      ['제품 섹션', '룩북 카드 — 한 컷씩 물결로 넘김'],
      ['포트폴리오 소개', '작품 카드 — 카드 프레임 안에서 물결 전환']
    ],
    'wave-down': [
      ['히어로 헤더', '카드 상단 라벨 아래로 이미지가 물결로 흘러내림'],
      ['랜딩 페이지', '스텝 카드 — 위→아래 흐름과 일치'],
      ['제품 섹션', '스토리 카드 — 자연스러운 하강 전환'],
      ['포트폴리오 소개', '연대기 카드 — 위에서 아래로']
    ],
    'wave-side': [
      ['히어로 헤더', '와이드 카드 — 좌측에서 물결로 진입'],
      ['랜딩 페이지', '단계 카드 — 좌→우 가로 흐름'],
      ['제품 섹션', '비교 카드 — 나란히 비교 느낌'],
      ['포트폴리오 소개', '가로 작품 카드 — 파노라마 스윕']
    ],
    'wave-diagonal': [
      ['히어로 헤더', '스포츠 카드 — 역동적 대각선 진입'],
      ['랜딩 페이지', '에너지 카드 — 대각선 전환'],
      ['제품 섹션', '신제품 카드 — 임팩트 있는 와이프'],
      ['포트폴리오 소개', '모션 카드 — 다이내믹 연출']
    ],
    'wave-blob': [
      ['히어로 헤더', '스튜디오 카드 — 유기적 블롭 등장'],
      ['랜딩 페이지', '브랜드 카드 — 중앙 포커스 확장'],
      ['제품 섹션', '뷰티 카드 — 부드러운 블롭'],
      ['포트폴리오 소개', '아티스트 카드 — 유기적 형태']
    ],
    'wave-ripple': [
      ['히어로 헤더', '웰니스 카드 — 잔잔한 파장 등장'],
      ['랜딩 페이지', '음료 카드 — 수면 파장'],
      ['제품 섹션', '친환경 카드 — 자연스러운 확산'],
      ['포트폴리오 소개', '사진 카드 — 잔잔한 reveal']
    ],
    'wave-band': [
      ['히어로 헤더', '미디어 카드 — 시네마틱 중앙 오프닝'],
      ['랜딩 페이지', '발표 카드 — 중앙 분할 공개'],
      ['제품 섹션', '주얼리 카드 — 중앙 피사체 강조'],
      ['포트폴리오 소개', '디렉터 카드 — 극적 인트로']
    ],
    'wave-curtain': [
      ['히어로 헤더', '전시 카드 — 커튼 오프닝'],
      ['랜딩 페이지', '이벤트 카드 — 무대 연출'],
      ['제품 섹션', '패션 카드 — 세로 인물 강조'],
      ['포트폴리오 소개', '공간 디자이너 카드 — 커튼 연출']
    ],
    'wave-morph': [
      ['히어로 헤더', '프리미엄 카드 — 절제된 드라마'],
      ['랜딩 페이지', '스토리 카드 — 리듬감 있는 전환'],
      ['제품 섹션', '하이엔드 카드 — 정교한 모션'],
      ['포트폴리오 소개', '모션 전문가 카드 — 디테일한 이징']
    ],
    'wave-stack': [
      ['히어로 헤더', '여행 카드 — 진짜 파도 같은 전환'],
      ['랜딩 페이지', '아웃도어 카드 — 유기적 물결'],
      ['제품 섹션', '해양 제품 카드 — 파도 메타포'],
      ['포트폴리오 소개', '풍경 카드 — 자연스러운 흐름']
    ]
  };
  return (map[spec.id] || []).map(function (r) { return { place: r[0], body: r[1] }; });
}

const PATTERNS = buildPatterns({
  scope: '카드',
  containerKv: '중앙 카드 프레임(3:4) 내부 5장 z-index 스택',
  reco: reco
});

const SNIPPET_HTML = '<div class="scroll-track">\n'
  + '  <div class="sticky-stage">\n'
  + '    <div class="wis-frame">\n'
  + '      <div class="wis-card" data-i="0"><img src="img-01.jpg" alt=""><span class="wis-cap">01 · 해안의 아침</span></div>\n'
  + '      <div class="wis-card" data-i="1"><img src="img-02.jpg" alt=""><span class="wis-cap">02 · 물결 위의 건축</span></div>\n'
  + '      <!-- x5 카드 (프레임 내부에 z-index 순서로 스택) -->\n'
  + '    </div>\n'
  + '  </div>\n'
  + '</div>';

const SNIPPET_CSS = '.scroll-track { min-height: 500vh; position: relative; }\n'
  + '.sticky-stage { position: sticky; top: 0; height: 100vh; overflow: hidden;\n  display: flex; align-items: center; justify-content: center; }\n'
  + '.wis-frame { position: relative; width: min(78vw, 460px); aspect-ratio: 3 / 4;\n  border-radius: 20px; overflow: hidden; background: #000;\n  box-shadow: 0 30px 80px -24px rgba(0,0,0,0.4), 0 8px 24px -10px rgba(0,0,0,0.25); }\n'
  + '.wis-card { position: absolute; inset: 0; will-change: clip-path; }\n'
  + '.wis-card img { width: 100%; height: 100%; object-fit: cover; display: block; }';

function cardsMarkup() {
  return IMAGES.map(function (im, i) {
    return '<div class="wis-card" data-i="' + i + '">'
      + '\n            <img class="wis-img" src="' + im.src + '" alt="">'
      + '\n            <span class="wis-cap">' + im.cap + '</span>'
      + '\n          </div>';
  }).join('\n          ');
}

function buildDemoHTML(p) {
  var bodyContent = '  <div class="scroll-track">\n'
    + '    <div class="sticky-stage">\n'
    + '      <div class="wis-frame">\n'
    + '          ' + cardsMarkup() + '\n'
    + '      </div>\n'
    + '    </div>\n'
    + '  </div>';

  return '<!DOCTYPE html>\n'
    + '<html lang="ko">\n'
    + '<head>\n'
    + '  <meta charset="UTF-8">\n'
    + '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
    + '  <title>' + p.num + '. ' + p.title + ' — Card Wavy Swap Demo</title>\n'
    + '  <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable-dynamic-subset.min.css" rel="stylesheet">\n'
    + '  <style>\n'
    + '    * { box-sizing: border-box; }\n'
    + '    html, body { margin: 0; padding: 0; }\n'
    + '    body { background: radial-gradient(120% 120% at 50% 0%, #f4f4f6 0%, #e7e7ea 60%, #dededf 100%); color: #141416; font-family: "Pretendard Variable","Pretendard",sans-serif; overflow-x: hidden; -webkit-font-smoothing: antialiased; }\n'
    + chromeCss('light') + '\n'
    + '    .scroll-track { min-height: 500vh; position: relative; }\n'
    + '    .sticky-stage { position: sticky; top: 0; height: 100vh; overflow: hidden; display: flex; align-items: center; justify-content: center; }\n'
    + '    .wis-frame { position: relative; width: min(78vw, 460px); aspect-ratio: 3 / 4; border-radius: 20px; overflow: hidden; background: #000; box-shadow: 0 30px 80px -24px rgba(0,0,0,0.4), 0 8px 24px -10px rgba(0,0,0,0.25); }\n'
    + '    .wis-card { position: absolute; inset: 0; will-change: clip-path; }\n'
    + '    .wis-img { width: 100%; height: 100%; object-fit: cover; display: block; }\n'
    + '    .wis-cap { position: absolute; left: 20px; bottom: 22px; color: #fff; font: 600 clamp(13px,1.1vw,16px)/1 "Pretendard Variable","Pretendard",sans-serif; letter-spacing: 0.02em; text-shadow: 0 2px 12px rgba(0,0,0,0.55); }\n'
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
    + engineIIFE(p.clipCall, DIMS_BODY).split('\n').map(function (l) { return '    ' + l; }).join('\n') + '\n'
    + '  </script>\n'
    + '</body>\n'
    + '</html>\n';
}

function buildPatternSection(p) {
  return {
    title: p.num + '. ' + p.title,
    blocks: [
      { type: 'text', value: p.summary },
      { type: 'heading', value: '라이브 데모' },
      {
        type: 'component',
        embed: 'demos/card-wavy-swap/' + p.id + '.html',
        embedHeight: 560,
        embedLabel: p.num + ' · ' + p.title,
        title: p.title + ' 라이브 데모'
      },
      { type: 'heading', value: '작동 원리' },
      { type: 'text', value: p.explain },
      { type: 'kv', columns: 2, items: p.kv },
      { type: 'heading', value: '코드 스니펫' },
      { type: 'code', lang: 'HTML', title: 'HTML', value: SNIPPET_HTML },
      { type: 'code', lang: 'CSS', title: 'CSS', value: SNIPPET_CSS },
      { type: 'code', lang: 'JS', title: 'JavaScript', value: snippetJS(p, DIMS_BODY) },
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
      tag: p.kv.find(function (k) { return k.label === '방향'; })?.value || '',
      desc: p.summary
    };
  });

  return {
    title: '00. 카테고리 개요',
    blocks: [
      { type: 'heading', value: 'Card Wavy Swap — 카드 프레임 내부 물결 전환 v1 (smooth)' },
      { type: 'text', value: CATEGORY.summary },
      { type: 'heading', value: '10 패턴 인덱스' },
      { type: 'structure', items: indexItems },
      { type: 'heading', value: '공통 인터랙션 모델' },
      {
        type: 'kv', columns: 2, items: [
          { label: '폰트', value: 'Pretendard Variable 단일' },
          { label: '무대', value: 'sticky-stage 100vh + flex center + 밝은 배경' },
          { label: '카드 프레임', value: 'width min(78vw,460px), aspect-ratio 3:4, radius 20px, shadow' },
          { label: '스크롤 공간', value: 'scroll-track 500vh (이미지 5장 = 4 전환)' },
          { label: '치수 기준', value: 'clip-path 좌표 = 카드 프레임 clientWidth/Height' },
          { label: '물결 단면', value: 'clip-path: path() 2차 베지어 곡선 (매끄러움)' },
          { label: '스크롤 보간', value: 'requestAnimationFrame lerp (curP += (target-curP)*0.14)' },
          { label: '진폭', value: '카드 치수 비율 (높이·폭의 4.5~12%)' },
          { label: '핵심 원칙', value: '모든 reveal은 스크롤 진행률에 매핑 (자동 재생 없음)' },
          { label: '참고', value: 'Framer 마켓플레이스 Masked Scroll Slider' }
        ]
      },
      { type: 'heading', value: '읽기 가이드' },
      {
        type: 'structure', items: [
          { label: '라이브 데모', tag: 'IFRAME', desc: 'demos/card-wavy-swap/{pattern}.html — 카드 내부 물결 전환' },
          { label: '작동 원리', tag: 'HOW', desc: '스크롤 진행률 → lerp 보간 → 세그먼트 coverage → 베지어 물결 path (카드 기준)' },
          { label: '정량 메타', tag: 'KV', desc: '의존성 / 물결 / 방향 / 컨테이너 / 시그니처' },
          { label: '코드 스니펫', tag: 'CODE', desc: 'HTML / CSS / JS — 카드 프레임 + 베지어 헬퍼 + lerp 엔진' },
          { label: '사용 가이드', tag: 'GUIDE', desc: '파라미터·주의점·테마 적합성' },
          { label: '활용 추천', tag: 'PLACES', desc: '히어로 / 랜딩 / 제품 / 포트폴리오 4건' },
          { label: '트레이드오프', tag: 'NOTE', desc: '성능·접근성·권장 사용처' }
        ]
      },
      {
        type: 'note',
        value: '카드 형태 변형 — 풀블리드(Fullscreen Wavy Swap)와 같은 물결 엔진(clip-path: path() 베지어 + rAF lerp)을 쓰되, 화면 중앙에 고정된 카드 프레임(3:4, 둥근 모서리 + 그림자) 내부에서만 물결 스왑이 일어난다. clip-path 좌표만 카드 프레임 치수 기준으로 측정한다. 갤러리·제품 카드·포트폴리오 카드에 적합.'
      }
    ]
  };
}

function main() {
  mkdirSync(DEMO_DIR, { recursive: true });
  for (var p of PATTERNS) {
    writeFileSync(join(DEMO_DIR, p.id + '.html'), buildDemoHTML(p), 'utf-8');
    console.log('✓ demos/card-wavy-swap/' + p.id + '.html');
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
  console.log('✓ analyses/card-wavy-swap/analysis.json');
  console.log('  ' + PATTERNS.length + ' patterns + 1 overview = ' + (PATTERNS.length + 1) + ' sections');
  var totalBlocks = Object.values(sections).reduce(function (acc, s) { return acc + s.blocks.length; }, 0);
  console.log('  ' + totalBlocks + ' blocks total');
}

main();
