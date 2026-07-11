#!/usr/bin/env node
/**
 * Web Reference Lab — Category Generator: Fullscreen Wavy Swap (v2 smooth)
 * Framer 마켓플레이스 "Masked Scroll Slider" — 화면 전체(풀블리드) 물결 전환
 *
 * v2 개선: polygon → clip-path: path() 베지어 (매끄러운 단면) + rAF lerp (부드러운 스크롤)
 * 공유 엔진: scripts/lib/wavy-shared.mjs
 *
 * Usage: node scripts/generate-fullscreen-wavy-swap.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { engineIIFE, snippetJS, chromeCss, buildPatterns } from './lib/wavy-shared.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ANALYSIS_DIR = join(ROOT, 'analyses', 'fullscreen-wavy-swap');
const ANALYSIS_FILE = join(ANALYSIS_DIR, 'analysis.json');
const DEMO_DIR = join(ROOT, 'demos', 'fullscreen-wavy-swap');

const CATEGORY = {
  id: 'fullscreen-wavy-swap',
  title: 'Fullscreen Wavy Swap',
  type: 'category',
  date: '2026-06-04',
  url: 'https://www.framer.com/marketplace/components/masked-scroll-slider/',
  summary: 'Framer 마켓플레이스 "Masked Scroll Slider" 시그니처 — 스크롤 시 화면이 고정(sticky)되고, 화면 전체를 채운 풀블리드 이미지가 물결(wavy) 마스크로 다음 이미지로 전환되는 인터랙션. sticky-stage 위에 이미지 5장을 z-index로 스택하고, 스크롤 진행률을 세그먼트별 로컬 진행률로 환산해 다음 이미지를 clip-path: path()의 2차 베지어 곡선 물결 엣지로 reveal한다. v2에서 물결 단면을 polygon(꺾인 직선)에서 베지어 곡선으로 바꿔 매끄럽게 만들고, requestAnimationFrame lerp 보간을 추가해 스크롤 추종을 부드럽게 했다. 물결의 방향·진폭·형태(상승 / 하강 / 측면 / 사선 / 블롭 / 파장 / 밴드 / 커튼 / 모핑 / 합성)만 패턴별로 달라지며, 모든 reveal은 스크롤 진행률에 매핑된다.'
};

const IMAGES = [
  { src: 'https://picsum.photos/seed/fwave-coast/1600/1000', cap: '01 · 해안의 아침' },
  { src: 'https://picsum.photos/seed/fwave-arch/1600/1000',  cap: '02 · 물결 위의 건축' },
  { src: 'https://picsum.photos/seed/fwave-dune/1600/1000',  cap: '03 · 사구와 들꽃' },
  { src: 'https://picsum.photos/seed/fwave-dusk/1600/1000',  cap: '04 · 황혼의 바다' },
  { src: 'https://picsum.photos/seed/fwave-calm/1600/1000',  cap: '05 · 미니멀 풍경' }
];
const N = IMAGES.length;

const DIMS_BODY = 'return [window.innerWidth, window.innerHeight];';

/* 컨텍스트별 활용 추천 */
function reco(spec) {
  var map = {
    'wave-up': [
      ['히어로 헤더', '풀스크린 키 비주얼 — 물결로 다음 히어로 이미지가 차오름'],
      ['랜딩 페이지', '섹션 배경 슬라이더 — 스크롤로 풀블리드 비주얼 전환'],
      ['제품 섹션', '룩북·캠페인 — 화면 가득 한 컷씩 물결 교체'],
      ['포트폴리오 소개', '대표작 풀스크린 — 물결로 작품 넘김']
    ],
    'wave-down': [
      ['히어로 헤더', '상단 고정 내비 아래로 비주얼이 물결로 흘러내림'],
      ['랜딩 페이지', '위→아래 스크롤 흐름과 일치하는 배경 전환'],
      ['제품 섹션', '스토리형 제품 소개 — 자연스러운 하강 전환'],
      ['포트폴리오 소개', '연대기형 작품 — 위에서 아래로 흐름']
    ],
    'wave-side': [
      ['히어로 헤더', '와이드 파노라마 — 좌측에서 물결로 진입'],
      ['랜딩 페이지', '단계별 스토리 — 좌→우 가로 흐름'],
      ['제품 섹션', '비교 슬라이드 — 나란히 비교 느낌'],
      ['포트폴리오 소개', '와이드 작품 — 파노라마 스윕']
    ],
    'wave-diagonal': [
      ['히어로 헤더', '스포츠·다이내믹 브랜드 — 역동적 진입'],
      ['랜딩 페이지', '에너지 있는 제품 — 대각선 전환'],
      ['제품 섹션', '신제품 공개 — 임팩트 있는 와이프'],
      ['포트폴리오 소개', '모션 디자이너 — 다이내믹 연출']
    ],
    'wave-blob': [
      ['히어로 헤더', '크리에이티브 스튜디오 — 유기적 등장'],
      ['랜딩 페이지', '브랜드 스토리 — 중앙 포커스 확장'],
      ['제품 섹션', '뷰티·코스메틱 — 부드러운 블롭'],
      ['포트폴리오 소개', '아티스트 — 유기적 형태 연출']
    ],
    'wave-ripple': [
      ['히어로 헤더', '웰니스·명상 — 잔잔한 파장 등장'],
      ['랜딩 페이지', '음료·생수 브랜드 — 수면 파장'],
      ['제품 섹션', '친환경 제품 — 자연스러운 확산'],
      ['포트폴리오 소개', '사진작가 — 잔잔한 reveal']
    ],
    'wave-band': [
      ['히어로 헤더', '영화·미디어 — 시네마틱 오프닝'],
      ['랜딩 페이지', '런칭 발표 — 중앙 분할 공개'],
      ['제품 섹션', '주얼리·시계 — 중앙 피사체 강조'],
      ['포트폴리오 소개', '디렉터 — 극적 인트로']
    ],
    'wave-curtain': [
      ['히어로 헤더', '공연·전시 — 커튼 오프닝'],
      ['랜딩 페이지', '이벤트 발표 — 무대 연출'],
      ['제품 섹션', '패션 캠페인 — 세로 인물 강조'],
      ['포트폴리오 소개', '무대·공간 디자이너 — 커튼 연출']
    ],
    'wave-morph': [
      ['히어로 헤더', '프리미엄 브랜드 — 절제된 드라마'],
      ['랜딩 페이지', '스토리텔링 — 리듬감 있는 전환'],
      ['제품 섹션', '하이엔드 제품 — 정교한 모션'],
      ['포트폴리오 소개', '모션 전문가 — 디테일한 이징']
    ],
    'wave-stack': [
      ['히어로 헤더', '리조트·여행 — 진짜 파도 같은 전환'],
      ['랜딩 페이지', '자연·아웃도어 — 유기적 물결'],
      ['제품 섹션', '서핑·해양 제품 — 파도 메타포'],
      ['포트폴리오 소개', '풍경 사진작가 — 자연스러운 흐름']
    ]
  };
  return (map[spec.id] || []).map(function (r) { return { place: r[0], body: r[1] }; });
}

const PATTERNS = buildPatterns({
  scope: '화면 전체',
  containerKv: '풀블리드 viewport 5장 z-index 스택',
  reco: reco
});

const SNIPPET_HTML = '<div class="scroll-track">\n'
  + '  <div class="sticky-stage">\n'
  + '    <div class="wis-card" data-i="0"><img src="img-01.jpg" alt=""><span class="wis-cap">01 · 해안의 아침</span></div>\n'
  + '    <div class="wis-card" data-i="1"><img src="img-02.jpg" alt=""><span class="wis-cap">02 · 물결 위의 건축</span></div>\n'
  + '    <!-- x5 카드 (z-index 순서로 스택, 화면 전체를 채움) -->\n'
  + '  </div>\n'
  + '</div>';

const SNIPPET_CSS = '.scroll-track { min-height: 500vh; position: relative; }\n'
  + '.sticky-stage { position: sticky; top: 0; height: 100vh;\n  overflow: hidden; background: #000; }\n'
  + '.wis-card { position: absolute; inset: 0; will-change: clip-path; }\n'
  + '.wis-card img { width: 100%; height: 100%; object-fit: cover; display: block; }';

function cardsMarkup() {
  return IMAGES.map(function (im, i) {
    return '<div class="wis-card" data-i="' + i + '">'
      + '\n          <img class="wis-img" src="' + im.src + '" alt="">'
      + '\n          <span class="wis-cap">' + im.cap + '</span>'
      + '\n        </div>';
  }).join('\n        ');
}

function buildDemoHTML(p) {
  var bodyContent = '  <div class="scroll-track">\n'
    + '    <div class="sticky-stage">\n'
    + '        ' + cardsMarkup() + '\n'
    + '    </div>\n'
    + '  </div>';

  return '<!DOCTYPE html>\n'
    + '<html lang="ko">\n'
    + '<head>\n'
    + '  <meta charset="UTF-8">\n'
    + '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
    + '  <title>' + p.num + '. ' + p.title + ' — Fullscreen Wavy Swap Demo</title>\n'
    + '  <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable-dynamic-subset.min.css" rel="stylesheet">\n'
    + '  <style>\n'
    + '    * { box-sizing: border-box; }\n'
    + '    html, body { margin: 0; padding: 0; }\n'
    + '    body { background: #000; color: #fff; font-family: "Pretendard Variable","Pretendard",sans-serif; overflow-x: hidden; -webkit-font-smoothing: antialiased; }\n'
    + chromeCss('dark') + '\n'
    + '    .scroll-track { min-height: 500vh; position: relative; }\n'
    + '    .sticky-stage { position: sticky; top: 0; height: 100vh; overflow: hidden; background: #000; }\n'
    + '    .wis-card { position: absolute; inset: 0; will-change: clip-path; }\n'
    + '    .wis-img { width: 100%; height: 100%; object-fit: cover; display: block; }\n'
    + '    .wis-cap { position: absolute; left: 32px; bottom: 40px; color: #fff; font: 600 clamp(14px,1.3vw,18px)/1 "Pretendard Variable","Pretendard",sans-serif; letter-spacing: 0.02em; text-shadow: 0 2px 12px rgba(0,0,0,0.5); }\n'
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
        embed: 'demos/fullscreen-wavy-swap/' + p.id + '.html',
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
      { type: 'heading', value: 'Fullscreen Wavy Swap — 풀블리드 물결 이미지 전환 v2 (smooth)' },
      { type: 'text', value: CATEGORY.summary },
      { type: 'heading', value: '10 패턴 인덱스' },
      { type: 'structure', items: indexItems },
      { type: 'heading', value: '공통 인터랙션 모델' },
      {
        type: 'kv', columns: 2, items: [
          { label: '폰트', value: 'Pretendard Variable 단일' },
          { label: '무대', value: 'sticky-stage 100vh + overflow:hidden + 배경 #000' },
          { label: '스크롤 공간', value: 'scroll-track 500vh (이미지 5장 = 4 전환)' },
          { label: '이미지', value: '풀블리드 object-fit:cover, 화면 전체를 채움' },
          { label: '진행률 환산', value: 'fp = p×(N-1) → idx = floor(fp), local = fp-idx' },
          { label: '물결 단면', value: 'clip-path: path() 2차 베지어 곡선 (매끄러움)' },
          { label: '스크롤 보간', value: 'requestAnimationFrame lerp (curP += (target-curP)*0.14)' },
          { label: '진폭', value: '컨테이너 치수 비율 (높이·폭의 4.5~12%)' },
          { label: '핵심 원칙', value: '모든 reveal은 스크롤 진행률에 매핑 (자동 재생 없음)' },
          { label: '참고', value: 'Framer 마켓플레이스 Masked Scroll Slider' }
        ]
      },
      { type: 'heading', value: '읽기 가이드' },
      {
        type: 'structure', items: [
          { label: '라이브 데모', tag: 'IFRAME', desc: 'demos/fullscreen-wavy-swap/{pattern}.html — 풀블리드 물결 전환' },
          { label: '작동 원리', tag: 'HOW', desc: '스크롤 진행률 → lerp 보간 → 세그먼트 coverage → 베지어 물결 path' },
          { label: '정량 메타', tag: 'KV', desc: '의존성 / 물결 / 방향 / 컨테이너 / 시그니처' },
          { label: '코드 스니펫', tag: 'CODE', desc: 'HTML / CSS / JS — 베지어 헬퍼 + lerp 엔진' },
          { label: '사용 가이드', tag: 'GUIDE', desc: '파라미터·주의점·테마 적합성' },
          { label: '활용 추천', tag: 'PLACES', desc: '히어로 / 랜딩 / 제품 / 포트폴리오 4건' },
          { label: '트레이드오프', tag: 'NOTE', desc: '성능·접근성·권장 사용처' }
        ]
      },
      {
        type: 'note',
        value: 'v2 매끄러움 개선 — 물결 단면을 polygon(꺾인 직선)에서 clip-path: path()의 2차 베지어 곡선으로 교체해 단면이 부드럽고, requestAnimationFrame lerp 보간으로 스크롤 추종을 매끄럽게 했다. 같은 물결 엔진을 카드 형태로 적용한 Card Wavy Swap 카테고리와 한 쌍.'
      }
    ]
  };
}

function main() {
  mkdirSync(DEMO_DIR, { recursive: true });
  for (var p of PATTERNS) {
    writeFileSync(join(DEMO_DIR, p.id + '.html'), buildDemoHTML(p), 'utf-8');
    console.log('✓ demos/fullscreen-wavy-swap/' + p.id + '.html');
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
  console.log('✓ analyses/fullscreen-wavy-swap/analysis.json');
  console.log('  ' + PATTERNS.length + ' patterns + 1 overview = ' + (PATTERNS.length + 1) + ' sections');
  var totalBlocks = Object.values(sections).reduce(function (acc, s) { return acc + s.blocks.length; }, 0);
  console.log('  ' + totalBlocks + ' blocks total');
}

main();
