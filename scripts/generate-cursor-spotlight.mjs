#!/usr/bin/env node
/**
 * Interaction Lab — Category Generator: Cursor Spotlight (v1)
 * Linear 글로우 카드 / GitHub 그리드 하이라이트 / Vercel 무빙 글로우 참고
 * — 커서 좌표를 CSS 변수(--x/--y)로 흘려보내 radial-gradient·mask가 소비하는
 *   10종 스포트라이트 인터랙션 카탈로그
 *
 * - mousemove 인터랙션 (스크롤 매핑 아님)
 * - 다크 배경 + Pretendard Variable + 한국어 본문
 * - 외부 의존성 0 (아트워크는 전부 CSS gradient로 직접 그림)
 *
 * Usage: node scripts/generate-cursor-spotlight.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ANALYSIS_DIR = join(ROOT, 'analyses', 'cursor-spotlight');
const ANALYSIS_FILE = join(ANALYSIS_DIR, 'analysis.json');
const DEMO_DIR = join(ROOT, 'demos', 'cursor-spotlight');

const CATEGORY = {
  id: 'cursor-spotlight',
  title: '커서 스포트라이트',
  type: 'category',
  date: '2026-06-10',
  url: 'https://linear.app',
  summary: '커서 좌표를 CSS 변수(--x,--y)로 흘려보내 radial-gradient·mask가 그 지점만 콘텐츠를 비추거나 드러내는 10가지 스포트라이트 패턴. Linear 글로우 카드·GitHub 그리드 하이라이트·Vercel 무빙 글로우 등 다크 톤 프리미엄 룩의 결정판.'
};

/* ================================================================
   공통 CSS — .stage 좌표계
   ================================================================ */

const BASE_CSS = ''
  + '.stage {\n'
  + '  position: relative; width: 100%; height: 100vh; overflow: hidden;\n'
  + '  cursor: crosshair;\n'
  + '  --x: 50%; --y: 50%;\n'
  + '}\n';

/* ================================================================
   공통 JS — stage 기준 --x/--y(px) 트래킹 (ES5)
   ================================================================ */

const TRACK_STAGE_JS = ''
  + 'var stage = document.querySelector(".stage");\n'
  + 'function setPoint(x, y){\n'
  + '  stage.style.setProperty("--x", x + "px");\n'
  + '  stage.style.setProperty("--y", y + "px");\n'
  + '}\n'
  + 'function toCenter(){\n'
  + '  setPoint(stage.clientWidth / 2, stage.clientHeight / 2);\n'
  + '}\n'
  + 'stage.addEventListener("mousemove", function(e){\n'
  + '  var r = stage.getBoundingClientRect();\n'
  + '  setPoint(e.clientX - r.left, e.clientY - r.top);\n'
  + '});\n'
  + 'window.addEventListener("resize", toCenter);\n'
  + 'toCenter();';

const SNIPPET_JS_TRACK = 'var stage = document.querySelector(".stage");\n'
  + 'stage.addEventListener("mousemove", function(e){\n'
  + '  var r = stage.getBoundingClientRect();\n'
  + '  stage.style.setProperty("--x", (e.clientX - r.left) + "px");\n'
  + '  stage.style.setProperty("--y", (e.clientY - r.top) + "px");\n'
  + '});\n'
  + '// 초기/터치 폴백 — 스테이지 중앙 좌표를 기본값으로 주입\n'
  + 'stage.style.setProperty("--x", (stage.clientWidth / 2) + "px");\n'
  + 'stage.style.setProperty("--y", (stage.clientHeight / 2) + "px");';

/* ================================================================
   06 줌 렌즈 — 공유 아트워크 (모든 stop을 %로 — 확대 시 무늬 동반 스케일)
   ================================================================ */

const ZOOM_ART_BG = 'background:\n'
  + '  repeating-linear-gradient(45deg, rgba(255,255,255,0.07) 0 0.4%, transparent 0.4% 3.2%),\n'
  + '  radial-gradient(circle at 24% 34%, #f472b6 0%, transparent 34%),\n'
  + '  radial-gradient(circle at 76% 26%, #38bdf8 0%, transparent 38%),\n'
  + '  radial-gradient(circle at 56% 78%, #a3e635 0%, transparent 34%),\n'
  + '  linear-gradient(140deg, #131a2e, #221643);';

/* ================================================================
   10 패턴 정의
   ================================================================ */

const PATTERNS = [
  // ── 01. flashlight-text (시그니처) ──
  {
    id: 'flashlight-text', num: '01', title: '플래시라이트 텍스트 (시그니처)',
    summary: '카테고리 시그니처. 화면 전체에 투명도 10%의 어두운 문단이 깔려 있고, 커서를 따라다니는 radial mask 원 안에서만 글자가 본래의 흰색으로 밝아진다. 시선과 조명이 일치하는 가장 직관적인 스포트라이트.',
    demo: {
      bodyHTML: '<div class="stage">\n'
        + '  <div class="layer layer-dim">\n'
        + '    <p class="copy">어둠 속에서 인터페이스는 전부를 말하지 않습니다. 커서가 머무는 자리에만 빛이 고이고, 문장은 손전등의 궤적을 따라 한 단어씩 깨어납니다. 시선이 곧 조명이 되는 경험 — 그것이 커서 스포트라이트의 출발점입니다.</p>\n'
        + '  </div>\n'
        + '  <div class="layer layer-lit" aria-hidden="true">\n'
        + '    <p class="copy">어둠 속에서 인터페이스는 전부를 말하지 않습니다. 커서가 머무는 자리에만 빛이 고이고, 문장은 손전등의 궤적을 따라 한 단어씩 깨어납니다. 시선이 곧 조명이 되는 경험 — 그것이 커서 스포트라이트의 출발점입니다.</p>\n'
        + '  </div>\n'
        + '</div>',
      css: '.layer { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding: 24px 8vw; }\n'
        + '.copy { margin: 0; max-width: 640px; font-size: clamp(20px, 3.6vw, 30px); font-weight: 700; line-height: 1.7; letter-spacing: -0.01em; word-break: keep-all; }\n'
        + '.layer-dim .copy { color: rgba(255,255,255,0.1); }\n'
        + '.layer-lit .copy { color: #fff; }\n'
        + '.layer-lit {\n'
        + '  -webkit-mask-image: radial-gradient(circle 180px at var(--x) var(--y), #000 30%, transparent 78%);\n'
        + '  mask-image: radial-gradient(circle 180px at var(--x) var(--y), #000 30%, transparent 78%);\n'
        + '}',
      js: TRACK_STAGE_JS,
      height: 520
    },
    snippetHTML: '<div class="stage">\n  <p class="copy copy-dim">어둠 속에서 인터페이스는 전부를 말하지 않습니다. …</p>\n  <p class="copy copy-lit" aria-hidden="true">어둠 속에서 인터페이스는 전부를 말하지 않습니다. …</p>\n</div>',
    snippetCSS: '.stage { position: relative; --x: 50%; --y: 50%; }\n.copy-dim { color: rgba(255,255,255,0.1); }\n.copy-lit { position: absolute; inset: 0; color: #fff;\n  -webkit-mask-image: radial-gradient(circle 180px at var(--x) var(--y),\n    #000 30%, transparent 78%);\n  mask-image: radial-gradient(circle 180px at var(--x) var(--y),\n    #000 30%, transparent 78%); }',
    snippetJS: SNIPPET_JS_TRACK,
    explain: '동일한 문단을 2겹으로 쌓는다. 아래층은 rgba(255,255,255,0.1)의 저대비 텍스트, 위층은 순수 흰색 텍스트에 mask-image: radial-gradient(circle 180px at var(--x) var(--y), #000 30%, transparent 78%)를 적용. JS는 mousemove마다 스테이지 기준 좌표를 --x/--y(px 단위)로 setProperty 하고, CSS 변수를 소비하는 mask gradient의 중심이 커서를 1:1로 따라가며 위층 텍스트가 원형으로만 드러난다. 마우스가 없을 때(초기 로드·터치 기기)는 JS init이 스테이지 중앙 좌표를 주입해 중앙이 기본 점등 상태가 된다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS — setProperty 2줄 (좌표 갱신만)' },
      { label: '트리거', value: 'mousemove → --x/--y(px) 갱신' },
      { label: '핵심 속성', value: 'mask-image: radial-gradient(circle 180px at var(--x) var(--y))' },
      { label: '페이드 폭', value: '#000 30% → transparent 78% — 부드러운 빛 가장자리' },
      { label: '기본값', value: 'JS init이 스테이지 중앙 좌표 주입 (터치 폴백 겸용)' },
      { label: '참고', value: 'Linear 히어로 / Codrops Flashlight Effect' }
    ],
    guide: '스포트라이트 반경은 150~220px가 적정 — 너무 작으면 읽기 답답하고, 너무 크면 디밍의 의미가 사라진다. 아래층 텍스트 투명도는 0.08~0.14 사이에서 "있는 건 알지만 읽히지는 않는" 정도로. -webkit-mask-image 프리픽스를 반드시 병기하고(Safari), 위층에는 aria-hidden="true"를 붙여 스크린리더가 같은 문장을 두 번 읽지 않게 한다. 터치 기기에서는 mousemove가 없으므로 중앙 기본 점등이 폴백 — 본문을 반드시 읽혀야 하는 페이지라면 이 패턴 대신 장식 카피에만 사용한다.',
    recommendations: [
      { place: '히어로 헤더', body: '다크 히어로의 대형 카피 — 커서가 닿는 곳만 밝아져 탐색 욕구 자극' },
      { place: '랜딩 페이지', body: '미션·선언문 섹션 — 문장을 천천히 비추며 읽게 만드는 연출' },
      { place: '제품 섹션', body: '다크 모드 기능 소개 카피 — "어둠 속 발견" 메타포와 직결' },
      { place: '포트폴리오 소개', body: '자기소개 문단 — 방문자가 직접 조명을 들고 읽는 인터랙티브 바이오' }
    ],
    tradeoff: 'mask-image가 적용된 레이어는 별도 합성층을 만들어 문단이 길어질수록 GPU 메모리가 늘어난다. 터치 환경에서는 인터랙션 자체가 없으므로 핵심 본문에는 사용하지 말고 장식 카피에 한정할 것. 텍스트를 2겹으로 복제하므로 aria-hidden 처리가 빠지면 접근성 트리가 오염된다.'
  },

  // ── 02. image-torch ──
  {
    id: 'image-torch', num: '02', title: '이미지 손전등',
    summary: '동일한 그라디언트 아트워크를 2겹으로 쌓고, 아래층은 grayscale+디밍 처리, 위층 컬러 원본은 커서 주변 radial mask 영역에서만 드러난다. 손전등으로 어둠 속 그림을 비추는 메타포.',
    demo: {
      bodyHTML: '<div class="stage">\n'
        + '  <div class="art art-base"></div>\n'
        + '  <div class="art art-color" aria-hidden="true"></div>\n'
        + '  <div class="torch-ring"></div>\n'
        + '  <div class="art-caption">컬러 원본은 커서의 손전등 아래에서만 보입니다</div>\n'
        + '</div>',
      css: '.art { position: absolute; inset: 0;\n'
        + '  background:\n'
        + '    radial-gradient(circle at 18% 30%, #ff5e7a 0%, transparent 38%),\n'
        + '    radial-gradient(circle at 80% 18%, #21d4fd 0%, transparent 42%),\n'
        + '    radial-gradient(circle at 62% 80%, #b721ff 0%, transparent 46%),\n'
        + '    radial-gradient(circle at 28% 84%, #ffd166 0%, transparent 34%),\n'
        + '    linear-gradient(160deg, #131734, #1c1040);\n'
        + '}\n'
        + '.art-base { filter: grayscale(1) brightness(0.38); }\n'
        + '.art-color {\n'
        + '  -webkit-mask-image: radial-gradient(circle 170px at var(--x) var(--y), #000 35%, transparent 75%);\n'
        + '  mask-image: radial-gradient(circle 170px at var(--x) var(--y), #000 35%, transparent 75%);\n'
        + '}\n'
        + '.torch-ring { position: absolute; left: var(--x); top: var(--y); width: 340px; height: 340px;\n'
        + '  transform: translate(-50%, -50%); border-radius: 50%; pointer-events: none;\n'
        + '  box-shadow: 0 0 0 1px rgba(255,255,255,0.16), inset 0 0 60px rgba(255,255,255,0.06);\n'
        + '}\n'
        + '.art-caption { position: absolute; left: 24px; bottom: 24px; font-size: 12px; letter-spacing: 0.06em; color: rgba(255,255,255,0.55); }',
      js: TRACK_STAGE_JS,
      height: 520
    },
    snippetHTML: '<div class="stage">\n  <div class="art art-base"></div>\n  <div class="art art-color" aria-hidden="true"></div>\n</div>',
    snippetCSS: '.art { position: absolute; inset: 0;\n  background: url(artwork.jpg) center / cover; }\n.art-base { filter: grayscale(1) brightness(0.38); }\n.art-color {\n  -webkit-mask-image: radial-gradient(circle 170px at var(--x) var(--y),\n    #000 35%, transparent 75%);\n  mask-image: radial-gradient(circle 170px at var(--x) var(--y),\n    #000 35%, transparent 75%); }',
    snippetJS: SNIPPET_JS_TRACK,
    explain: '같은 아트워크 2겹 — 아래층 .art-base는 filter: grayscale(1) brightness(0.38)로 "꺼진 상태"의 톤을 만들고, 위층 .art-color에는 radial mask 170px를 적용해 커서 주변만 컬러 원본이 노출된다. 장식용 .torch-ring(340px 원)도 left/top: var(--x/--y)로 같은 좌표 변수를 소비해 손전등 외곽 링처럼 따라다닌다. 데모는 외부 이미지 대신 multi radial-gradient로 아트워크를 직접 그려 의존성 0 — 실서비스에서는 동일 이미지 URL을 두 레이어에 지정하면 된다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS — 좌표 갱신만 (마스크·필터는 CSS)' },
      { label: '트리거', value: 'mousemove → --x/--y → mask 중심 + 토치 링 이동' },
      { label: '핵심 속성', value: 'mask radial 170px + filter: grayscale(1) brightness(0.38)' },
      { label: '레이어', value: '동일 아트워크 2겹 — base 흑백 / top 컬러' },
      { label: '토치 링', value: '340px 장식 원 — left/top: var(--x)/var(--y) 동기' },
      { label: '참고', value: 'Codrops Image Reveal / 사진 갤러리 hover 연출' }
    ],
    guide: '흑백층 밝기는 0.3~0.45가 적정 — 완전 검정(0.1 이하)이면 뭘 비추는지 단서가 사라져 인터랙션 동기가 약해진다. mask 반경(170px)과 토치 링 지름(340px)을 일치시키면 "빛의 경계"가 시각적으로 설명된다. 실사진 사용 시 두 레이어에 같은 URL을 지정하면 브라우저 캐시로 1회만 로드된다. background-size: cover와 동일한 background-position을 양쪽에 줘야 어긋나지 않는다.',
    recommendations: [
      { place: '히어로 헤더', body: '브랜드 키 비주얼 — 흑백으로 잠든 화면을 방문자가 직접 밝히는 오프닝' },
      { place: '랜딩 페이지', body: '제품 스크린샷 티저 — 출시 전 일부만 비춰주는 호기심 연출' },
      { place: '제품 섹션', body: '다크/컬러 대비로 제품 사진의 디테일 탐색 유도' },
      { place: '포트폴리오 소개', body: '작품 썸네일 — 손전등으로 비추며 갤러리를 탐험하는 경험' }
    ],
    tradeoff: 'filter와 mask를 동시에 쓰는 2겹 풀스크린 레이어라 저사양 GPU에서 프레임이 떨어질 수 있다. 실사진은 메모리에 2겹으로 디코딩되므로 대형 이미지(4K+)는 피할 것. 터치 기기는 중앙 고정 폴백이 되므로 핵심 정보 전달용으로는 부적합.'
  },

  // ── 03. xray-reveal ──
  {
    id: 'xray-reveal', num: '03', title: '엑스레이 리빌',
    summary: '위층은 완성된 UI 카드, 아래층은 같은 구조의 와이어프레임. 커서 원 안에서만 위층이 투명해지는 역방향 mask로 설계도가 비쳐 보인다. 비포/애프터를 한 화면에서 오가는 엑스레이 투시.',
    demo: {
      bodyHTML: '<div class="stage">\n'
        + '  <div class="layer layer-wf" aria-hidden="true">\n'
        + '    <div class="card wf-card">\n'
        + '      <div class="wf-thumb"></div>\n'
        + '      <div class="row">\n'
        + '        <div class="wf-avatar"></div>\n'
        + '        <div class="meta">\n'
        + '          <div class="wf-line" style="width: 96px;"></div>\n'
        + '          <div class="wf-line wf-line-thin" style="width: 140px;"></div>\n'
        + '        </div>\n'
        + '        <div class="wf-btn"></div>\n'
        + '      </div>\n'
        + '    </div>\n'
        + '  </div>\n'
        + '  <div class="layer layer-ui">\n'
        + '    <div class="card ui-card">\n'
        + '      <div class="ui-thumb"></div>\n'
        + '      <div class="row">\n'
        + '        <div class="ui-avatar"></div>\n'
        + '        <div class="meta">\n'
        + '          <div class="ui-name">인터랙션 리포트</div>\n'
        + '          <div class="ui-sub">커서 스포트라이트 · 6월호</div>\n'
        + '        </div>\n'
        + '        <button class="ui-btn" type="button">구독하기</button>\n'
        + '      </div>\n'
        + '    </div>\n'
        + '  </div>\n'
        + '  <div class="xr-caption">커서 아래에서 설계도가 비칩니다</div>\n'
        + '</div>',
      css: '.layer { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }\n'
        + '.card { width: 360px; max-width: 84vw; border-radius: 16px; padding: 18px; }\n'
        + '.row { display: flex; align-items: center; gap: 12px; margin-top: 16px; }\n'
        + '.meta { display: flex; flex-direction: column; gap: 6px; flex: 1; }\n'
        + '/* 아래층 — 와이어프레임 (블루프린트 톤) */\n'
        + '.wf-card { border: 1.5px dashed rgba(125,211,252,0.55); background: rgba(125,211,252,0.04); }\n'
        + '.wf-thumb { height: 110px; border: 1.5px dashed rgba(125,211,252,0.45); border-radius: 10px;\n'
        + '  background:\n'
        + '    linear-gradient(to top right, transparent calc(50% - 0.7px), rgba(125,211,252,0.4) calc(50% - 0.7px), rgba(125,211,252,0.4) calc(50% + 0.7px), transparent calc(50% + 0.7px)),\n'
        + '    linear-gradient(to bottom right, transparent calc(50% - 0.7px), rgba(125,211,252,0.4) calc(50% - 0.7px), rgba(125,211,252,0.4) calc(50% + 0.7px), transparent calc(50% + 0.7px));\n'
        + '}\n'
        + '.wf-avatar { width: 40px; height: 40px; border-radius: 50%; border: 1.5px dashed rgba(125,211,252,0.5); }\n'
        + '.wf-line { height: 12px; border: 1px dashed rgba(125,211,252,0.45); border-radius: 6px; }\n'
        + '.wf-line-thin { height: 9px; opacity: 0.7; }\n'
        + '.wf-btn { width: 72px; height: 30px; border: 1.5px dashed rgba(125,211,252,0.5); border-radius: 999px; }\n'
        + '/* 위층 — 완성 UI */\n'
        + '.ui-card { background: linear-gradient(180deg, #15161c, #0e0f14); border: 1px solid rgba(255,255,255,0.09); box-shadow: 0 24px 60px rgba(0,0,0,0.5); }\n'
        + '.ui-thumb { height: 110px; border-radius: 10px; background: linear-gradient(135deg, #7c6cff, #4cc9f0); }\n'
        + '.ui-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #f72585, #ffd166); }\n'
        + '.ui-name { font-size: 14px; font-weight: 700; }\n'
        + '.ui-sub { font-size: 11px; color: rgba(255,255,255,0.45); }\n'
        + '.ui-btn { font-family: inherit; font-size: 12px; font-weight: 600; background: #fff; color: #000; border: 0; border-radius: 999px; padding: 9px 16px; cursor: pointer; }\n'
        + '.layer-ui {\n'
        + '  -webkit-mask-image: radial-gradient(circle 140px at var(--x) var(--y), transparent 55%, #000 72%);\n'
        + '  mask-image: radial-gradient(circle 140px at var(--x) var(--y), transparent 55%, #000 72%);\n'
        + '}\n'
        + '.xr-caption { position: absolute; left: 24px; bottom: 24px; font-size: 12px; letter-spacing: 0.06em; color: rgba(255,255,255,0.55); }',
      js: TRACK_STAGE_JS,
      height: 520
    },
    snippetHTML: '<div class="stage">\n  <div class="layer layer-wf"><!-- 와이어프레임 카드 --></div>\n  <div class="layer layer-ui"><!-- 완성 UI 카드 --></div>\n</div>',
    snippetCSS: '/* 역방향 mask — 중심이 transparent, 외곽이 #000 */\n.layer-ui {\n  -webkit-mask-image: radial-gradient(circle 140px at var(--x) var(--y),\n    transparent 55%, #000 72%);\n  mask-image: radial-gradient(circle 140px at var(--x) var(--y),\n    transparent 55%, #000 72%);\n}\n/* 두 레이어는 동일 flex 센터링으로 픽셀 정렬 */\n.layer { position: absolute; inset: 0;\n  display: flex; align-items: center; justify-content: center; }',
    snippetJS: SNIPPET_JS_TRACK,
    explain: '마스크 방향이 01·02와 반대다 — radial-gradient(circle 140px at var(--x) var(--y), transparent 55%, #000 72%)처럼 중심을 transparent, 외곽을 #000으로 두면 커서 주변에서 위층(완성 UI)이 뚫리고 아래층 와이어프레임이 노출된다. 두 레이어는 동일한 flex 센터링과 동일한 치수(360px 카드, 110px 썸네일, 40px 아바타)로 픽셀 단위 정렬되어, 구멍 너머로 보이는 설계도가 완성본과 정확히 겹친다. 좌표 추적 JS는 시그니처 패턴과 완전히 동일 — 소비하는 CSS만 바뀐다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS — 좌표 갱신 (마스크 반전은 CSS)' },
      { label: '트리거', value: 'mousemove → 역방향 mask 중심 이동' },
      { label: '핵심 속성', value: 'mask 중심 transparent 55% / 외곽 #000 72% — 반전 원' },
      { label: '반경', value: '140px — UI 디테일 관찰용 소형 투시창' },
      { label: '레이어', value: '완성 UI(위) + 와이어프레임(아래) 동일 지오메트리' },
      { label: '참고', value: 'X-Ray hover 연출 / 디자인 케이스 스터디 비포·애프터' }
    ],
    guide: '두 레이어의 지오메트리(크기·여백·코너 반경)가 1px이라도 어긋나면 투시 효과가 깨진다 — 공통 .card 클래스로 치수를 공유하고 스킨만 분리할 것. 반경은 120~160px의 소형이 적합: 전체가 한 번에 뚫리면 비교의 재미가 사라진다. 경계 페이드(55%→72%)를 좁게 잡으면 "유리 렌즈" 느낌, 넓게 잡으면 "안개" 느낌. 와이어프레임 대신 코드·치수 가이드·접근성 트리 등 어떤 "이면"이든 아래층에 깔 수 있다.',
    recommendations: [
      { place: '히어로 헤더', body: '디자인 툴·개발 도구 제품 — 완성 화면 뒤의 구조를 투시하는 데모' },
      { place: '랜딩 페이지', body: '"어떻게 만들어졌나" 섹션 — 결과물과 설계도를 한 화면에 압축' },
      { place: '제품 섹션', body: '디자인 시스템 문서 — 컴포넌트와 스펙 가이드를 겹쳐 보기' },
      { place: '포트폴리오 소개', body: '케이스 스터디 — 최종 UI 아래 와이어프레임을 깔아 과정 증명' }
    ],
    tradeoff: '같은 구조의 DOM을 2벌 유지해야 하므로 마크업 중복과 동기화 비용이 든다 — 콘텐츠가 바뀌면 두 레이어를 함께 수정해야 한다. 카드가 많은 화면 전체에 적용하면 합성층 메모리가 2배. 아래층은 aria-hidden으로 접근성 트리에서 제외할 것.'
  },

  // ── 04. border-glow (Linear) ──
  {
    id: 'border-glow', num: '04', title: '보더 글로우 카드 (Linear)',
    summary: 'Linear 피처 카드 시그니처. 카드 ::before에 radial-gradient(260px at var(--x) var(--y)) 발광을 깔고, padding 1px + mask-composite: exclude 트릭으로 테두리 1px만 남긴다. 커서가 닿는 구간의 보더만 빛난다.',
    demo: {
      bodyHTML: '<div class="stage">\n'
        + '  <div class="glow-card">\n'
        + '    <span class="gc-tag">LINEAR STYLE</span>\n'
        + '    <h2 class="gc-title">커서가 닿는 곳, 보더가 빛난다</h2>\n'
        + '    <p class="gc-body">카드 표면이 아니라 1px 테두리에만 발광을 남기는 것이 핵심. radial-gradient를 padding 1px 링에 가두면 빛이 보더를 타고 흐릅니다.</p>\n'
        + '    <div class="gc-meta"><span>mask-composite: exclude</span><span>radial 260px</span><span>1px ring</span></div>\n'
        + '  </div>\n'
        + '</div>',
      css: '.stage { display: flex; align-items: center; justify-content: center; }\n'
        + '.glow-card { position: relative; width: 430px; max-width: 86vw; border-radius: 18px; padding: 26px 28px;\n'
        + '  background: linear-gradient(180deg, #121217, #0b0b0f); border: 1px solid rgba(255,255,255,0.07);\n'
        + '  --x: 50%; --y: 50%;\n'
        + '}\n'
        + '.glow-card::before { content: ""; position: absolute; inset: -1px; border-radius: inherit; padding: 1px;\n'
        + '  background: radial-gradient(260px circle at var(--x) var(--y), rgba(124,108,255,0.95), rgba(124,108,255,0.2) 45%, transparent 72%);\n'
        + '  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);\n'
        + '  -webkit-mask-composite: xor;\n'
        + '  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);\n'
        + '  mask-composite: exclude;\n'
        + '  opacity: 0; transition: opacity 0.25s ease; pointer-events: none;\n'
        + '}\n'
        + '.glow-card::after { content: ""; position: absolute; inset: 0; border-radius: inherit;\n'
        + '  background: radial-gradient(320px circle at var(--x) var(--y), rgba(124,108,255,0.08), transparent 70%);\n'
        + '  opacity: 0; transition: opacity 0.25s ease; pointer-events: none;\n'
        + '}\n'
        + '.stage:hover .glow-card::before, .stage:hover .glow-card::after { opacity: 1; }\n'
        + '.gc-tag { display: inline-block; font-size: 10px; font-weight: 600; letter-spacing: 0.14em; color: #a89dff; border: 1px solid rgba(124,108,255,0.35); border-radius: 999px; padding: 5px 10px; }\n'
        + '.gc-title { margin: 14px 0 8px; font-size: 21px; font-weight: 700; letter-spacing: -0.01em; }\n'
        + '.gc-body { margin: 0; font-size: 13px; line-height: 1.65; color: rgba(255,255,255,0.55); word-break: keep-all; }\n'
        + '.gc-meta { display: flex; gap: 14px; margin-top: 18px; font-size: 11px; color: rgba(255,255,255,0.4); }',
      js: 'var stage = document.querySelector(".stage");\n'
        + 'var card = document.querySelector(".glow-card");\n'
        + 'stage.addEventListener("mousemove", function(e){\n'
        + '  var r = card.getBoundingClientRect();\n'
        + '  card.style.setProperty("--x", (e.clientX - r.left) + "px");\n'
        + '  card.style.setProperty("--y", (e.clientY - r.top) + "px");\n'
        + '});',
      height: 480
    },
    snippetHTML: '<div class="glow-card">\n  <h2>커서가 닿는 곳, 보더가 빛난다</h2>\n  <p>radial-gradient를 padding 1px 링에 가두는 트릭.</p>\n</div>',
    snippetCSS: '.glow-card { position: relative; border-radius: 18px;\n  border: 1px solid rgba(255,255,255,0.07); --x: 50%; --y: 50%; }\n.glow-card::before { content: ""; position: absolute;\n  inset: -1px; border-radius: inherit; padding: 1px;  /* 1px 링 트릭 */\n  background: radial-gradient(260px circle at var(--x) var(--y),\n    rgba(124,108,255,0.95), transparent 72%);\n  -webkit-mask: linear-gradient(#000 0 0) content-box,\n    linear-gradient(#000 0 0);\n  -webkit-mask-composite: xor;\n  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);\n  mask-composite: exclude;\n  opacity: 0; transition: opacity 0.25s ease; pointer-events: none; }\n.glow-card:hover::before { opacity: 1; }',
    snippetJS: 'card.addEventListener("mousemove", function(e){\n  var r = card.getBoundingClientRect();\n  card.style.setProperty("--x", (e.clientX - r.left) + "px");\n  card.style.setProperty("--y", (e.clientY - r.top) + "px");\n});',
    explain: '::before를 inset: -1px·padding: 1px·border-radius: inherit로 깔고, mask를 두 장(content-box 범위 + 전체 범위) 겹친 뒤 -webkit-mask-composite: xor(표준은 mask-composite: exclude)로 합성하면 가운데가 뚫린 1px 링만 남는다. 그 링 위에 radial-gradient(260px circle at var(--x) var(--y)) 발광이 커서 좌표를 따라 흐르면서 "커서가 닿는 보더 구간만 빛나는" Linear 룩이 완성된다. 좌표는 카드 자기 기준(getBoundingClientRect 차감)으로 계산하고, ::after에는 저알파 radial을 깔아 카드 표면도 은은하게 점등. 발광 표시 자체는 .stage:hover CSS만으로 제어해 JS는 좌표 갱신 2줄에 머문다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS — 카드 로컬 좌표 갱신 2줄' },
      { label: '트리거', value: 'mousemove → 카드 기준 --x/--y / 표시·숨김은 :hover' },
      { label: '핵심 트릭', value: 'padding: 1px + mask-composite: exclude(xor) — 1px 발광 링' },
      { label: '발광', value: 'radial 260px — rgba(124,108,255,0.95) → transparent 72%' },
      { label: '페이드', value: 'opacity 0→1, 0.25s ease (진입·이탈 모두 부드럽게)' },
      { label: '참고', value: 'Linear.app 피처 카드 / Aceternity Glowing Border' }
    ],
    guide: '발광 반경(260px)은 카드 폭의 50~70%가 적정 — 카드보다 크면 보더 전체가 균일하게 빛나 "추적" 느낌이 사라진다. -webkit-mask-composite: xor와 표준 mask-composite: exclude는 반드시 둘 다 표기(Chromium은 -webkit- 구문, Firefox는 표준 구문을 읽음). 보더 두께를 키우려면 padding 값만 바꾸면 된다. 커서가 카드 밖에 있어도 좌표는 카드 밖 지점으로 계산되므로, 스테이지 전체에서 추적하면 카드에 다가가는 동안 빛이 미리 마중 나오는 연출이 가능하다.',
    recommendations: [
      { place: '히어로 헤더', body: 'SaaS 다크 히어로의 메인 CTA 카드 — 프리미엄 제품 인상 각인' },
      { place: '랜딩 페이지', body: '가격 플랜 카드 — 추천 플랜에만 발광 보더로 시선 고정' },
      { place: '제품 섹션', body: 'Linear식 피처 그리드 — 기능 카드마다 추적 발광' },
      { place: '포트폴리오 소개', body: '프로젝트 카드 — 다크 포트폴리오의 세련된 hover 피드백' }
    ],
    tradeoff: 'mask-composite 구문이 엔진별로 갈려(-webkit- xor vs 표준 exclude) 병기를 빠뜨리면 한쪽 브라우저에서 발광이 면 전체를 덮는다. 1px 링은 고배율 줌·고DPI에서 굵기가 달라 보일 수 있음. 표면광(::after)까지 켜면 레이어 2장이 카드마다 추가되므로 수십 장 그리드에서는 multi-card-glow 패턴의 일괄 갱신 구조를 쓸 것.'
  },

  // ── 05. grid-highlight (GitHub) ──
  {
    id: 'grid-highlight', num: '05', title: '그리드 하이라이트 (GitHub)',
    summary: 'GitHub 홈 스타일. 배경에 44px 격자(1px linear-gradient × 2방향)를 깔고, 같은 격자의 밝은 시안 버전을 radial mask로 커서 주변만 노출 — 커서가 지나간 자리의 격자 셀 라인이 점등된다.',
    demo: {
      bodyHTML: '<div class="stage">\n'
        + '  <div class="grid-base"></div>\n'
        + '  <div class="grid-glow" aria-hidden="true"></div>\n'
        + '  <div class="grid-tint"></div>\n'
        + '  <div class="grid-copy">\n'
        + '    <h2 class="grid-title">격자가 커서를 기억합니다</h2>\n'
        + '    <p class="grid-sub">베이스 격자 위에 밝은 격자를 겹치고, radial mask가 커서 주변만 켭니다</p>\n'
        + '  </div>\n'
        + '</div>',
      css: '.grid-base, .grid-glow { position: absolute; inset: 0;\n'
        + '  background-image:\n'
        + '    linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px),\n'
        + '    linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px);\n'
        + '  background-size: 44px 44px;\n'
        + '}\n'
        + '.grid-glow {\n'
        + '  background-image:\n'
        + '    linear-gradient(rgba(76,201,240,0.75) 1px, transparent 1px),\n'
        + '    linear-gradient(90deg, rgba(76,201,240,0.75) 1px, transparent 1px);\n'
        + '  -webkit-mask-image: radial-gradient(circle 210px at var(--x) var(--y), #000 12%, transparent 70%);\n'
        + '  mask-image: radial-gradient(circle 210px at var(--x) var(--y), #000 12%, transparent 70%);\n'
        + '}\n'
        + '.grid-tint { position: absolute; inset: 0; pointer-events: none;\n'
        + '  background: radial-gradient(circle 250px at var(--x) var(--y), rgba(76,201,240,0.1), transparent 72%);\n'
        + '}\n'
        + '.grid-copy { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; text-align: center; padding: 0 8vw; pointer-events: none; }\n'
        + '.grid-title { margin: 0; font-size: clamp(24px, 5vw, 40px); font-weight: 800; letter-spacing: -0.02em; }\n'
        + '.grid-sub { margin: 0; font-size: 13px; line-height: 1.6; color: rgba(255,255,255,0.5); word-break: keep-all; }',
      js: TRACK_STAGE_JS,
      height: 520
    },
    snippetHTML: '<div class="stage">\n  <div class="grid-base"></div>\n  <div class="grid-glow" aria-hidden="true"></div>\n  <div class="grid-tint"></div>\n</div>',
    snippetCSS: '.grid-base, .grid-glow { position: absolute; inset: 0;\n  background-image:\n    linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px),\n    linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px);\n  background-size: 44px 44px; }\n.grid-glow {  /* 밝은 시안 격자 — 커서 주변만 노출 */\n  background-image:\n    linear-gradient(rgba(76,201,240,0.75) 1px, transparent 1px),\n    linear-gradient(90deg, rgba(76,201,240,0.75) 1px, transparent 1px);\n  -webkit-mask-image: radial-gradient(circle 210px at var(--x) var(--y),\n    #000 12%, transparent 70%);\n  mask-image: radial-gradient(circle 210px at var(--x) var(--y),\n    #000 12%, transparent 70%); }',
    snippetJS: SNIPPET_JS_TRACK,
    explain: '격자를 2겹으로 만든다 — 베이스(흰색 7% 라인)와 글로우(시안 75% 라인). 두 겹 모두 1px linear-gradient 가로·세로 2장을 background-size: 44px로 반복해 그리드를 그리고, 글로우 층에만 radial mask 210px를 적용해 커서 주변 라인만 켜진다. 두 격자의 background-size·position이 동일하므로 점등 라인이 베이스 라인과 정확히 겹쳐 "셀이 빛나는" 착시가 생긴다. 보조로 .grid-tint가 같은 좌표에 저알파 시안 radial을 깔아 면 발광을 더한다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS — 좌표 갱신 (격자·마스크는 CSS)' },
      { label: '트리거', value: 'mousemove → 글로우 격자 mask + 면 발광 중심 이동' },
      { label: '격자', value: '1px linear-gradient × 2방향, background-size 44px' },
      { label: '핵심 속성', value: '밝은 격자층 + mask radial 210px (12% → 70%)' },
      { label: '보조광', value: 'rgba(76,201,240,0.1) radial 250px — 면 점등' },
      { label: '참고', value: 'GitHub 홈 그리드 / Tailwind CSS 랜딩 배경' }
    ],
    guide: '격자 간격은 32~56px이 적정 — 좁으면 모아레, 넓으면 점등 셀이 너무 커진다. 글로우 라인의 알파(0.6~0.85)와 마스크 페이드(12%→70%)가 분위기를 결정: 페이드를 좁히면 또렷한 서치라이트, 넓히면 은은한 오로라. 콘텐츠 텍스트는 pointer-events: none 레이어 위에 올려 커서 추적을 방해하지 않게 한다. 배경 전용 패턴이므로 텍스트 대비(WCAG 4.5:1)는 격자가 아닌 본문 색으로 확보할 것.',
    recommendations: [
      { place: '히어로 헤더', body: 'GitHub식 개발자 제품 히어로 — 기술적 무드의 인터랙티브 배경' },
      { place: '랜딩 페이지', body: '섹션 전환 배경 — 정적인 격자에 커서 반응을 더해 체류 유도' },
      { place: '제품 섹션', body: 'API·인프라 제품 다이어그램 뒤 배경 — 좌표계 메타포 강화' },
      { place: '포트폴리오 소개', body: '개발자 포트폴리오 인트로 — 블루프린트 위를 탐색하는 감각' }
    ],
    tradeoff: '풀스크린 레이어 3장(베이스·글로우·틴트)이 항상 합성되므로 모바일에서는 격자 밀도를 낮추거나 틴트를 생략할 것. 격자 자체가 장식이라 reduced-motion 사용자에게도 무해하지만, 점멸이 빠른 고대비 격자는 광과민성 주의. 베이스와 글로우의 background 정의가 어긋나면 라인이 이중으로 보인다.'
  },

  // ── 06. zoom-lens ──
  {
    id: 'zoom-lens', num: '06', title: '줌 렌즈',
    summary: '커서 위치에 지름 180px 원형 돋보기가 떠다닌다. 렌즈는 같은 아트워크를 background-size 2배로 깔고 background-position을 커서 좌표에서 역산 — 커서 아래 지점이 정확히 2배로 확대되어 렌즈 중앙에 맺힌다.',
    demo: {
      bodyHTML: '<div class="stage">\n'
        + '  <div class="zoom-art"></div>\n'
        + '  <div class="lens" aria-hidden="true"></div>\n'
        + '  <div class="lens-badge">ZOOM ×2</div>\n'
        + '  <div class="zl-caption">커서 아래 지점이 렌즈 중앙에 2배로 맺힙니다</div>\n'
        + '</div>',
      css: '.stage { --x: 50vw; --y: 50vh; --sw: 700px; --sh: 480px; }\n'
        + '.zoom-art { position: absolute; inset: 0;\n'
        + '  ' + ZOOM_ART_BG.replace(/\n/g, '\n  ') + '\n'
        + '}\n'
        + '.lens { position: absolute; left: var(--x); top: var(--y); width: 180px; height: 180px;\n'
        + '  transform: translate(-50%, -50%); border-radius: 50%;\n'
        + '  border: 2px solid rgba(255,255,255,0.6);\n'
        + '  box-shadow: 0 18px 60px rgba(0,0,0,0.6), inset 0 0 30px rgba(0,0,0,0.35);\n'
        + '  ' + ZOOM_ART_BG.replace(/\n/g, '\n  ') + '\n'
        + '  background-size: calc(var(--sw) * 2) calc(var(--sh) * 2);\n'
        + '  background-position: calc(90px - var(--x) * 2) calc(90px - var(--y) * 2);\n'
        + '  background-repeat: no-repeat;\n'
        + '  background-color: #131a2e;\n'
        + '  pointer-events: none;\n'
        + '}\n'
        + '.lens-badge { position: absolute; left: var(--x); top: calc(var(--y) + 106px);\n'
        + '  transform: translate(-50%, 0); font-size: 10px; font-weight: 600; letter-spacing: 0.12em;\n'
        + '  color: rgba(255,255,255,0.75); background: rgba(0,0,0,0.55); border: 1px solid rgba(255,255,255,0.18);\n'
        + '  border-radius: 999px; padding: 4px 10px; pointer-events: none;\n'
        + '}\n'
        + '.zl-caption { position: absolute; left: 24px; bottom: 24px; font-size: 12px; letter-spacing: 0.06em; color: rgba(255,255,255,0.55); }',
      js: 'var stage = document.querySelector(".stage");\n'
        + 'function measure(){\n'
        + '  stage.style.setProperty("--sw", stage.clientWidth + "px");\n'
        + '  stage.style.setProperty("--sh", stage.clientHeight + "px");\n'
        + '}\n'
        + 'function setPoint(x, y){\n'
        + '  stage.style.setProperty("--x", x + "px");\n'
        + '  stage.style.setProperty("--y", y + "px");\n'
        + '}\n'
        + 'function toCenter(){\n'
        + '  setPoint(stage.clientWidth / 2, stage.clientHeight / 2);\n'
        + '}\n'
        + 'stage.addEventListener("mousemove", function(e){\n'
        + '  var r = stage.getBoundingClientRect();\n'
        + '  setPoint(e.clientX - r.left, e.clientY - r.top);\n'
        + '});\n'
        + 'window.addEventListener("resize", function(){ measure(); toCenter(); });\n'
        + 'measure();\n'
        + 'toCenter();',
      height: 520
    },
    snippetHTML: '<div class="stage">\n  <div class="zoom-art"></div>\n  <div class="lens" aria-hidden="true"></div>\n</div>',
    snippetCSS: '.lens { position: absolute; left: var(--x); top: var(--y);\n  width: 180px; height: 180px;\n  transform: translate(-50%, -50%); border-radius: 50%;\n  background: url(artwork.jpg);  /* 원본과 같은 아트워크 */\n  background-size: calc(var(--sw) * 2) calc(var(--sh) * 2);  /* 2배 */\n  /* 역산: 렌즈 반경(90px) − 커서좌표 × 배율(2) */\n  background-position: calc(90px - var(--x) * 2)\n                       calc(90px - var(--y) * 2);\n  background-repeat: no-repeat; }',
    snippetJS: 'stage.addEventListener("mousemove", function(e){\n  var r = stage.getBoundingClientRect();\n  stage.style.setProperty("--x", (e.clientX - r.left) + "px");\n  stage.style.setProperty("--y", (e.clientY - r.top) + "px");\n});\n// 스테이지 크기도 변수로 — 렌즈 background-size 계산용\nstage.style.setProperty("--sw", stage.clientWidth + "px");\nstage.style.setProperty("--sh", stage.clientHeight + "px");',
    explain: '핵심은 역산 공식 하나다 — 배율 k에서 커서 (x,y) 아래 지점이 렌즈 중앙에 오려면 background-position = 렌즈반경 − 좌표 × k 여야 한다. 좌표가 px 변수이므로 CSS가 calc(90px - var(--x) * 2)로 직접 역산하고, JS는 --x/--y에 더해 스테이지 크기 --sw/--sh만 주입한다(background-size: var(--sw) × 2). 데모 아트워크는 모든 그라디언트 stop을 %로 정의해 background-size가 2배로 늘 때 무늬도 함께 2배로 확대된다 — px stop은 확대되지 않으므로 주의. 렌즈 자체는 left/top: var(--x/--y)로 커서에 부착.',
    kv: [
      { label: '의존성', value: 'Vanilla JS — --x/--y/--sw/--sh 4변수 주입' },
      { label: '트리거', value: 'mousemove → 렌즈 위치 + background-position 동시 역산' },
      { label: '역산 공식', value: 'background-position: calc(90px − var(--x) × 2)' },
      { label: '배율', value: '2× — background-size: calc(var(--sw) * 2)' },
      { label: '아트워크', value: '% stop 그라디언트 — 확대 시 무늬 동반 스케일' },
      { label: '참고', value: '이커머스 제품 줌 / 지도 매그니파이어' }
    ],
    guide: '배율을 바꾸려면 공식의 ×2와 background-size의 ×2를 함께 수정한다(3배면 calc(90px - var(--x) * 3) + size ×3). 실사진을 쓰면 % stop 걱정 없이 그대로 동작 — 데모처럼 CSS 그라디언트 아트워크일 때만 % stop이 필수다. 렌즈가 스테이지 가장자리에 닿으면 이미지 바깥 여백이 보이므로 background-color로 아트워크 베이스 색을 깔아 두면 자연스럽다. transform이 아닌 left/top 이동이지만 렌즈 1개뿐이라 리플로우 비용은 무시 가능.',
    recommendations: [
      { place: '히어로 헤더', body: '디테일이 강점인 제품(시계·주얼리) 키 비주얼 — 돋보기 탐색 유도' },
      { place: '랜딩 페이지', body: '인포그래픽·지도 섹션 — 축소판 위에서 세부를 확대 열람' },
      { place: '제품 섹션', body: '이커머스 제품 상세 — 소재·텍스처 확대 보기' },
      { place: '포트폴리오 소개', body: '일러스트·픽셀아트 작업물 — 원본 디테일 자랑하기' }
    ],
    tradeoff: 'background-position 갱신은 페인트를 유발해 transform 전용 패턴보다 비용이 높다 — 렌즈를 여러 개 띄우지 말 것. CSS 그라디언트 아트워크는 px stop이 확대되지 않으므로 % stop 규칙을 지켜야 하며, 고배율(3× 이상)에서는 그라디언트 밴딩이 드러난다. 터치 기기에서는 드래그 제스처와 충돌하므로 데스크톱 한정 연출.'
  },

  // ── 07. stroke-fill-text ──
  {
    id: 'stroke-fill-text', num: '07', title: '아웃라인 필 텍스트',
    summary: '-webkit-text-stroke 외곽선만 있는 대형 헤드라인 위에, 그라디언트로 속을 채운 동일 텍스트를 radial mask로 겹친다. 커서 주변에서만 글자 속이 차오르는 타이포 스포트라이트.',
    demo: {
      bodyHTML: '<div class="stage">\n'
        + '  <div class="layer layer-stroke">\n'
        + '    <span class="hero-kicker">CURSOR SPOTLIGHT</span>\n'
        + '    <h1 class="hero-title">커서가 채우는<br>타이포그래피</h1>\n'
        + '  </div>\n'
        + '  <div class="layer layer-fill" aria-hidden="true">\n'
        + '    <span class="hero-kicker">CURSOR SPOTLIGHT</span>\n'
        + '    <h1 class="hero-title">커서가 채우는<br>타이포그래피</h1>\n'
        + '  </div>\n'
        + '</div>',
      css: '.layer { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; text-align: center; padding: 0 6vw; }\n'
        + '.hero-kicker { font-size: 11px; font-weight: 600; letter-spacing: 0.3em; color: rgba(255,255,255,0.4); }\n'
        + '.hero-title { margin: 0; font-size: clamp(40px, 9vw, 84px); font-weight: 800; letter-spacing: -0.02em; line-height: 1.15; word-break: keep-all; }\n'
        + '.layer-stroke .hero-title { color: transparent; -webkit-text-stroke: 1.5px rgba(255,255,255,0.3); }\n'
        + '.layer-fill {\n'
        + '  -webkit-mask-image: radial-gradient(circle 170px at var(--x) var(--y), #000 35%, transparent 80%);\n'
        + '  mask-image: radial-gradient(circle 170px at var(--x) var(--y), #000 35%, transparent 80%);\n'
        + '}\n'
        + '.layer-fill .hero-kicker { color: #4cc9f0; }\n'
        + '.layer-fill .hero-title {\n'
        + '  background: linear-gradient(100deg, #7c6cff, #4cc9f0 50%, #f72585);\n'
        + '  -webkit-background-clip: text; background-clip: text; color: transparent;\n'
        + '}',
      js: TRACK_STAGE_JS,
      height: 480
    },
    snippetHTML: '<div class="stage">\n  <h1 class="title title-stroke">커서가 채우는 타이포그래피</h1>\n  <h1 class="title title-fill" aria-hidden="true">커서가 채우는 타이포그래피</h1>\n</div>',
    snippetCSS: '.title-stroke { color: transparent;\n  -webkit-text-stroke: 1.5px rgba(255,255,255,0.3); }\n.title-fill { position: absolute; inset: 0;\n  background: linear-gradient(100deg, #7c6cff, #4cc9f0 50%, #f72585);\n  -webkit-background-clip: text; background-clip: text;\n  color: transparent;\n  -webkit-mask-image: radial-gradient(circle 170px at var(--x) var(--y),\n    #000 35%, transparent 80%);\n  mask-image: radial-gradient(circle 170px at var(--x) var(--y),\n    #000 35%, transparent 80%); }',
    snippetJS: SNIPPET_JS_TRACK,
    explain: '아래층 헤드라인은 color: transparent + -webkit-text-stroke: 1.5px로 뼈대(외곽선)만 남기고, 위층 동일 헤드라인은 linear-gradient + background-clip: text로 속을 채운 뒤 radial mask 170px를 씌운다. 커서가 글자 위를 지나면 외곽선뿐이던 글자에 그라디언트가 차오르고, 벗어나면 다시 뼈대로 돌아간다. 두 층은 동일한 flex 센터링·동일 폰트 사이즈로 겹쳐 글리프가 정확히 일치 — 폰트 로딩 후 치수가 같으므로 정렬이 어긋날 일이 없다. background-clip: text는 -webkit- 프리픽스 병기 필수.',
    kv: [
      { label: '의존성', value: 'Vanilla JS — 좌표 갱신 (스트로크·필은 CSS)' },
      { label: '트리거', value: 'mousemove → 필 레이어 mask 중심 이동' },
      { label: '외곽선', value: '-webkit-text-stroke: 1.5px rgba(255,255,255,0.3)' },
      { label: '필', value: 'linear-gradient(100deg, #7c6cff → #4cc9f0 → #f72585) + background-clip: text' },
      { label: '마스크', value: 'radial 170px — #000 35% → transparent 80%' },
      { label: '참고', value: 'Awwwards 타이포 히어로 / 패션·에이전시 사이트' }
    ],
    guide: '폰트 굵기 700~900에서만 성립 — 얇은 글꼴은 stroke 1.5px가 글자 속을 침식해 뭉개진다. 스트로크 알파는 0.25~0.4: 너무 밝으면 채워지기 전부터 다 읽혀 반전의 재미가 없다. 한글은 획이 복잡해 stroke가 겹칠 수 있으니 letter-spacing을 살짝 풀어줄 것. 그라디언트 필 대신 단색이나 이미지(background-image)도 가능 — background-clip: text가 핵심이고 마스크는 동일하다.',
    recommendations: [
      { place: '히어로 헤더', body: '에이전시·패션 브랜드 대형 타이포 히어로 — 커서로 채색하는 오프닝' },
      { place: '랜딩 페이지', body: '섹션 타이틀 — 스크롤 도중 만나는 인터랙티브 타이포 포인트' },
      { place: '제품 섹션', body: '캠페인 슬로건 — 브랜드 그라디언트로 차오르는 키워드' },
      { place: '포트폴리오 소개', body: '이름·직함 헤드라인 — 타이포 감각을 증명하는 자기소개' }
    ],
    tradeoff: '-webkit-text-stroke와 background-clip: text 모두 비표준 출신(-webkit- 의존)이라 프리픽스 누락 시 글자가 통째로 사라진다 — color: transparent 폴백 순서에 주의. 텍스트 2겹 복제로 SEO·접근성 중복은 aria-hidden으로 처리. stroke는 글리프 바깥쪽이 아닌 중앙 기준이라 두꺼울수록 글자가 야위어 보인다.'
  },

  // ── 08. glow-backdrop (Vercel) ──
  {
    id: 'glow-backdrop', num: '08', title: '무빙 글로우 배경 (Vercel)',
    summary: '히어로 배경의 대형 광원 blob(blur 70px radial) 2개가 커서를 lerp(지수 보간)로 지연 추적한다. 즉각 따라오지 않고 0.06/0.12 계수로 미끄러져 따라와, 깊이감과 관성이 생기는 Vercel류 무빙 글로우.',
    demo: {
      bodyHTML: '<div class="stage">\n'
        + '  <div class="glow-blob blob-a"></div>\n'
        + '  <div class="glow-blob blob-b"></div>\n'
        + '  <div class="hero">\n'
        + '    <h1 class="hero-title">빛은 한 박자 늦게<br>당신을 따라옵니다</h1>\n'
        + '    <p class="hero-sub">mousemove는 목표 좌표만 갱신하고, rAF 루프가 매 프레임 거리의 6%씩 다가갑니다.</p>\n'
        + '    <span class="hero-cta">지연 추적 체험 중</span>\n'
        + '  </div>\n'
        + '</div>',
      css: '.glow-blob { position: absolute; left: 0; top: 0; border-radius: 50%; pointer-events: none; will-change: transform; }\n'
        + '.blob-a { width: 460px; height: 460px; filter: blur(70px);\n'
        + '  background: radial-gradient(closest-side, rgba(124,108,255,0.55), rgba(124,108,255,0.18) 55%, transparent 75%);\n'
        + '}\n'
        + '.blob-b { width: 300px; height: 300px; filter: blur(50px);\n'
        + '  background: radial-gradient(closest-side, rgba(76,201,240,0.5), rgba(76,201,240,0.15) 55%, transparent 75%);\n'
        + '}\n'
        + '.hero { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; padding: 0 8vw; pointer-events: none; }\n'
        + '.hero-title { margin: 0; font-size: clamp(30px, 6vw, 54px); font-weight: 800; letter-spacing: -0.02em; line-height: 1.25; word-break: keep-all; }\n'
        + '.hero-sub { margin: 14px 0 0; font-size: 14px; line-height: 1.65; color: rgba(255,255,255,0.5); max-width: 460px; word-break: keep-all; }\n'
        + '.hero-cta { margin-top: 24px; display: inline-flex; background: #fff; color: #000; font-weight: 600; font-size: 13px; border-radius: 999px; padding: 12px 22px; }',
      js: 'var stage = document.querySelector(".stage");\n'
        + 'var blobA = document.querySelector(".blob-a");\n'
        + 'var blobB = document.querySelector(".blob-b");\n'
        + 'var tx = stage.clientWidth / 2, ty = stage.clientHeight / 2;\n'
        + 'var ax = tx, ay = ty, bx = tx, by = ty;\n'
        + 'stage.addEventListener("mousemove", function(e){\n'
        + '  var r = stage.getBoundingClientRect();\n'
        + '  tx = e.clientX - r.left;\n'
        + '  ty = e.clientY - r.top;\n'
        + '});\n'
        + 'function frame(){\n'
        + '  ax += (tx - ax) * 0.06; ay += (ty - ay) * 0.06;\n'
        + '  bx += (tx - bx) * 0.12; by += (ty - by) * 0.12;\n'
        + '  blobA.style.transform = "translate(" + (ax - 230) + "px," + (ay - 230) + "px)";\n'
        + '  blobB.style.transform = "translate(" + (bx - 150) + "px," + (by - 150) + "px)";\n'
        + '  requestAnimationFrame(frame);\n'
        + '}\n'
        + 'requestAnimationFrame(frame);',
      height: 520
    },
    snippetHTML: '<div class="stage">\n  <div class="glow-blob blob-a"></div>\n  <div class="glow-blob blob-b"></div>\n  <div class="hero"><!-- 히어로 콘텐츠 --></div>\n</div>',
    snippetCSS: '.glow-blob { position: absolute; left: 0; top: 0;\n  border-radius: 50%; pointer-events: none; will-change: transform; }\n.blob-a { width: 460px; height: 460px; filter: blur(70px);\n  background: radial-gradient(closest-side,\n    rgba(124,108,255,0.55), rgba(124,108,255,0.18) 55%, transparent 75%); }\n.blob-b { width: 300px; height: 300px; filter: blur(50px);\n  background: radial-gradient(closest-side,\n    rgba(76,201,240,0.5), rgba(76,201,240,0.15) 55%, transparent 75%); }',
    snippetJS: 'var tx = 0, ty = 0, ax = 0, ay = 0, bx = 0, by = 0;\nstage.addEventListener("mousemove", function(e){\n  var r = stage.getBoundingClientRect();\n  tx = e.clientX - r.left; ty = e.clientY - r.top;\n});\nfunction frame(){\n  ax += (tx - ax) * 0.06; ay += (ty - ay) * 0.06;  // 느린 대형 blob\n  bx += (tx - bx) * 0.12; by += (ty - by) * 0.12;  // 빠른 소형 blob\n  blobA.style.transform = "translate(" + (ax - 230) + "px," + (ay - 230) + "px)";\n  blobB.style.transform = "translate(" + (bx - 150) + "px," + (by - 150) + "px)";\n  requestAnimationFrame(frame);\n}\nrequestAnimationFrame(frame);',
    explain: '이 패턴만 CSS 변수 대신 transform을 직접 갱신한다 — blur 70px가 걸린 대형 레이어는 리페인트가 비싸 합성 전용 속성(transform)으로만 움직여야 하기 때문. mousemove는 목표 좌표(tx,ty)만 기록하고, requestAnimationFrame 루프가 매 프레임 gx += (tx − gx) × k 지수 보간으로 현재 좌표를 목표에 점근시킨다. k가 작을수록 무겁게 따라오므로 대형 blob에 0.06, 소형에 0.12를 줘 두 광원이 서로 다른 관성으로 미끄러지는 패럴랙스 층위가 생긴다. translate 보정값(−230, −150)은 각 blob의 반지름 — 중심을 커서에 맞추는 오프셋이다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS — rAF lerp 루프 (transform 직접 갱신)' },
      { label: '트리거', value: 'mousemove → 목표 좌표 / rAF → 매 프레임 보간 추적' },
      { label: '보간 계수', value: 'k = 0.06 (대형 blob) / 0.12 (소형 blob) — 패럴랙스' },
      { label: '광원', value: 'radial blob 460px + 300px, blur(70px/50px)' },
      { label: '이동', value: 'transform: translate — 합성 전용, 리페인트 없음' },
      { label: '참고', value: 'Vercel 홈 / Stripe 그라디언트 히어로' }
    ],
    guide: '계수 k는 0.04~0.15 범위에서 조정 — 0.2를 넘으면 지연감이 사라져 일반 추적과 다를 바 없다. blob은 2~3개가 한계: 각각 blur 레이어라 GPU 비용이 선형으로 늘어난다. 콘텐츠는 z-index로 blob 위에 올리고 pointer-events: none을 blob에 줘 클릭을 막지 않게. 변화량이 0.1px 미만이면 transform 갱신을 건너뛰는 가드(idle skip)를 넣으면 정지 시 전력 소모를 줄일 수 있다. prefers-reduced-motion에서는 blob을 고정 위치에 정지시키는 분기를 권장.',
    recommendations: [
      { place: '히어로 헤더', body: 'Vercel식 SaaS 히어로 — 정적 다크 화면에 살아있는 광원 연출' },
      { place: '랜딩 페이지', body: '풋터 CTA 섹션 — 마지막 전환 구간에 시선을 모으는 무드 라이트' },
      { place: '제품 섹션', body: 'AI·인프라 제품 소개 — 기술적 신비감을 주는 배경 레이어' },
      { place: '포트폴리오 소개', body: '인트로 화면 — 커서를 따라오는 빛으로 첫인상 차별화' }
    ],
    tradeoff: 'rAF 루프가 상시 돈다 — 백그라운드 탭은 브라우저가 절전하지만 가시 상태에선 계속 실행되므로 idle skip 최적화 권장. blur 70px 풀스크린급 레이어는 모바일 GPU에 부담이 커 모바일에서는 blob 크기·blur 반경 축소 필수. 색 영역이 넓은 디스플레이에서 blob 경계 밴딩이 보일 수 있다.'
  },

  // ── 09. multi-card-glow ──
  {
    id: 'multi-card-glow', num: '09', title: '멀티 카드 글로우',
    summary: '카드 6장 그리드에서 mousemove 한 번에 모든 카드가 자기 좌표계로 --x/--y를 환산해 동시에 발광한다. 커서와 가까운 카드일수록 강하게 빛나고, 옆 카드도 커서를 향한 모서리가 함께 점등되는 GitHub식 그리드 글로우.',
    demo: {
      bodyHTML: '<div class="stage">\n'
        + '  <div class="mc-grid">\n'
        + '    <div class="mc-card"><div class="mc-icon">◆</div><h3 class="mc-title">이슈 트래킹</h3><p class="mc-desc">커서가 닿는 카드부터 보더가 깨어납니다.</p></div>\n'
        + '    <div class="mc-card"><div class="mc-icon">◐</div><h3 class="mc-title">사이클</h3><p class="mc-desc">옆 카드도 커서를 향한 모서리가 빛납니다.</p></div>\n'
        + '    <div class="mc-card"><div class="mc-icon">▲</div><h3 class="mc-title">로드맵</h3><p class="mc-desc">발광 중심은 카드 밖 좌표도 허용됩니다.</p></div>\n'
        + '    <div class="mc-card"><div class="mc-icon">●</div><h3 class="mc-title">인사이트</h3><p class="mc-desc">mousemove 1회가 6장의 변수를 갱신합니다.</p></div>\n'
        + '    <div class="mc-card"><div class="mc-icon">■</div><h3 class="mc-title">자동화</h3><p class="mc-desc">표면광과 보더광이 같은 좌표를 공유합니다.</p></div>\n'
        + '    <div class="mc-card"><div class="mc-icon">✦</div><h3 class="mc-title">연동</h3><p class="mc-desc">그리드 전체가 하나의 조명을 나눠 씁니다.</p></div>\n'
        + '  </div>\n'
        + '</div>',
      css: '.mc-grid { position: absolute; inset: 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; padding: 56px 28px 28px; align-content: center; max-width: 860px; margin: 0 auto; }\n'
        + '.mc-card { position: relative; border-radius: 14px; min-height: 130px;\n'
        + '  background: linear-gradient(180deg, #121217, #0c0c10); border: 1px solid rgba(255,255,255,0.06);\n'
        + '  padding: 18px 16px; --x: -300px; --y: -300px;\n'
        + '}\n'
        + '.mc-card::before { content: ""; position: absolute; inset: 0; border-radius: inherit;\n'
        + '  background: radial-gradient(220px circle at var(--x) var(--y), rgba(255,255,255,0.08), transparent 62%);\n'
        + '  opacity: 0; transition: opacity 0.25s ease; pointer-events: none;\n'
        + '}\n'
        + '.mc-card::after { content: ""; position: absolute; inset: -1px; border-radius: inherit; padding: 1px;\n'
        + '  background: radial-gradient(240px circle at var(--x) var(--y), rgba(124,108,255,0.8), transparent 70%);\n'
        + '  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);\n'
        + '  -webkit-mask-composite: xor;\n'
        + '  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);\n'
        + '  mask-composite: exclude;\n'
        + '  opacity: 0; transition: opacity 0.25s ease; pointer-events: none;\n'
        + '}\n'
        + '.stage:hover .mc-card::before, .stage:hover .mc-card::after { opacity: 1; }\n'
        + '.mc-icon { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; color: #a89dff; background: rgba(124,108,255,0.14); }\n'
        + '.mc-title { margin: 12px 0 5px; font-size: 14px; font-weight: 700; }\n'
        + '.mc-desc { margin: 0; font-size: 11.5px; line-height: 1.55; color: rgba(255,255,255,0.45); word-break: keep-all; }',
      js: 'var stage = document.querySelector(".stage");\n'
        + 'var cards = document.querySelectorAll(".mc-card");\n'
        + 'stage.addEventListener("mousemove", function(e){\n'
        + '  for (var i = 0; i < cards.length; i++) {\n'
        + '    var r = cards[i].getBoundingClientRect();\n'
        + '    cards[i].style.setProperty("--x", (e.clientX - r.left) + "px");\n'
        + '    cards[i].style.setProperty("--y", (e.clientY - r.top) + "px");\n'
        + '  }\n'
        + '});',
      height: 560
    },
    snippetHTML: '<div class="mc-grid">\n  <div class="mc-card"><h3>이슈 트래킹</h3><p>…</p></div>\n  <div class="mc-card"><h3>사이클</h3><p>…</p></div>\n  <!-- 카드 N장 — 모두 동일 구조 -->\n</div>',
    snippetCSS: '.mc-card { position: relative; --x: -300px; --y: -300px; }\n.mc-card::before { content: ""; position: absolute; inset: 0;\n  border-radius: inherit;  /* 표면광 */\n  background: radial-gradient(220px circle at var(--x) var(--y),\n    rgba(255,255,255,0.08), transparent 62%); }\n.mc-card::after { content: ""; position: absolute; inset: -1px;\n  border-radius: inherit; padding: 1px;  /* 1px 보더광 */\n  background: radial-gradient(240px circle at var(--x) var(--y),\n    rgba(124,108,255,0.8), transparent 70%);\n  -webkit-mask: linear-gradient(#000 0 0) content-box,\n    linear-gradient(#000 0 0);\n  -webkit-mask-composite: xor;\n  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);\n  mask-composite: exclude; }',
    snippetJS: 'grid.addEventListener("mousemove", function(e){\n  for (var i = 0; i < cards.length; i++) {\n    var r = cards[i].getBoundingClientRect();\n    cards[i].style.setProperty("--x", (e.clientX - r.left) + "px");\n    cards[i].style.setProperty("--y", (e.clientY - r.top) + "px");\n  }\n});',
    explain: '스테이지의 mousemove 핸들러 하나가 카드 배열을 순회하며 (e.clientX − card.left, e.clientY − card.top)을 각 카드의 로컬 CSS 변수로 주입한다. 핵심은 발광 gradient의 중심이 카드 밖 좌표여도 유효하다는 것 — 커서가 카드 A 위에 있어도 옆 카드 B의 좌표계에서는 (−80px, 40px) 같은 음수/초과 좌표가 들어가고, 그라디언트 자락이 B의 커서 쪽 모서리로 비쳐 들어와 "인접 카드 모서리가 함께 빛나는" 시그니처가 만들어진다. 각 카드의 ::before(표면 라이트)와 ::after(1px 보더 링, border-glow 패턴과 동일 트릭)가 같은 변수를 소비해 빛이 이중으로 어울린다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS — 카드 루프 (mousemove 1회 → setProperty × 6장)' },
      { label: '트리거', value: 'mousemove → 전 카드 로컬 좌표 동시 갱신' },
      { label: '표면광', value: '::before radial 220px — rgba(255,255,255,0.08)' },
      { label: '보더광', value: '::after radial 240px + mask exclude 1px 링' },
      { label: '핵심', value: '카드 밖 좌표 허용 — 인접 카드 모서리 동반 점등' },
      { label: '참고', value: 'GitHub Copilot 카드 그리드 / Hover.dev Spotlight Cards' }
    ],
    guide: '초기 변수를 −300px처럼 화면 밖으로 빼 두면 로드 직후 모든 카드가 소등 상태로 시작한다. 카드가 10장을 넘으면 mousemove마다 getBoundingClientRect 루프가 부담되므로 rAF로 스로틀하거나, rect를 캐싱하고 scroll/resize에서만 갱신할 것. 발광 반경(220~240px)을 카드 폭보다 크게 잡아야 인접 카드까지 빛이 넘어간다. 표면광 알파는 0.05~0.1로 절제 — 보더광이 주연, 표면광은 조연이다.',
    recommendations: [
      { place: '히어로 헤더', body: '히어로 하단 핵심 기능 3카드 — 첫 화면부터 그리드 전체가 반응' },
      { place: '랜딩 페이지', body: '기능 소개 6~9카드 그리드 — Linear·GitHub식 다크 피처 섹션' },
      { place: '제품 섹션', body: '요금제·통합 목록 — 커서 위치로 비교 대상을 자연스럽게 부각' },
      { place: '포트폴리오 소개', body: '프로젝트 카드 월 — 마우스를 옮길 때마다 빛이 흐르는 갤러리' }
    ],
    tradeoff: '카드 수 × setProperty가 mousemove마다 실행된다 — 수십 장 그리드에서는 rAF 스로틀과 rect 캐싱이 사실상 필수. 카드마다 pseudo-element 2장이 합성층을 만들어 GPU 메모리가 카드 수에 비례. 스크롤 컨테이너 안에서는 getBoundingClientRect가 스크롤 보정을 포함하므로 그대로 동작하지만, transform된 부모 아래서는 좌표가 어긋날 수 있다.'
  },

  // ── 10. curtain-slit ──
  {
    id: 'curtain-slit', num: '10', title: '커튼 슬릿',
    summary: '커서 X좌표가 화면을 가르는 분할선이 된다. 같은 히어로의 라이트/다크 두 버전을 겹쳐 두고 clip-path: inset으로 좌우를 실시간 분할 — 커서를 좌우로 움직이면 커튼이 갈라지듯 두 무드가 교차한다.',
    demo: {
      bodyHTML: '<div class="stage">\n'
        + '  <div class="pane pane-light">\n'
        + '    <span class="pane-kicker">LIGHT</span>\n'
        + '    <h1 class="pane-title">하나의 화면,<br>두 개의 무드</h1>\n'
        + '    <p class="pane-sub">커서가 왼쪽으로 갈수록 라이트 무드가 넓어집니다</p>\n'
        + '  </div>\n'
        + '  <div class="pane pane-dark" aria-hidden="true">\n'
        + '    <span class="pane-kicker">DARK</span>\n'
        + '    <h1 class="pane-title">하나의 화면,<br>두 개의 무드</h1>\n'
        + '    <p class="pane-sub">커서가 오른쪽으로 갈수록 다크 무드가 넓어집니다</p>\n'
        + '  </div>\n'
        + '  <div class="slit-line"></div>\n'
        + '  <div class="slit-handle">⇄</div>\n'
        + '</div>',
      css: '.pane { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; text-align: center; padding: 0 8vw; }\n'
        + '.pane-light {\n'
        + '  background:\n'
        + '    radial-gradient(circle at 70% 20%, rgba(255,209,102,0.5), transparent 40%),\n'
        + '    radial-gradient(circle at 20% 80%, rgba(76,201,240,0.35), transparent 45%),\n'
        + '    linear-gradient(160deg, #f7f5f0, #e9e6f7);\n'
        + '  color: #161616;\n'
        + '  clip-path: inset(0 calc(100% - var(--x)) 0 0);\n'
        + '}\n'
        + '.pane-dark {\n'
        + '  background:\n'
        + '    radial-gradient(circle at 30% 25%, rgba(124,108,255,0.35), transparent 45%),\n'
        + '    radial-gradient(circle at 80% 75%, rgba(247,37,133,0.28), transparent 45%),\n'
        + '    linear-gradient(160deg, #0b0b10, #16102b);\n'
        + '  color: #fff;\n'
        + '  clip-path: inset(0 0 0 var(--x));\n'
        + '}\n'
        + '.pane-kicker { font-size: 11px; font-weight: 600; letter-spacing: 0.28em; opacity: 0.55; }\n'
        + '.pane-title { margin: 0; font-size: clamp(30px, 6.4vw, 56px); font-weight: 800; letter-spacing: -0.02em; line-height: 1.2; word-break: keep-all; }\n'
        + '.pane-sub { margin: 0; font-size: 13px; opacity: 0.6; word-break: keep-all; }\n'
        + '.slit-line { position: absolute; top: 0; bottom: 0; left: var(--x); width: 2px; margin-left: -1px;\n'
        + '  background: rgba(255,255,255,0.75); mix-blend-mode: difference; pointer-events: none;\n'
        + '}\n'
        + '.slit-handle { position: absolute; top: 50%; left: var(--x); transform: translate(-50%, -50%);\n'
        + '  width: 40px; height: 40px; border-radius: 50%; background: #fff; color: #000;\n'
        + '  display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700;\n'
        + '  box-shadow: 0 8px 24px rgba(0,0,0,0.4); pointer-events: none;\n'
        + '}',
      js: TRACK_STAGE_JS,
      height: 520
    },
    snippetHTML: '<div class="stage">\n  <div class="pane pane-light"><!-- 라이트 버전 --></div>\n  <div class="pane pane-dark" aria-hidden="true"><!-- 다크 버전 --></div>\n  <div class="slit-line"></div>\n</div>',
    snippetCSS: '.pane { position: absolute; inset: 0; }\n/* 커서 X가 분할선 — 두 클립이 상보적으로 맞물림 */\n.pane-light { clip-path: inset(0 calc(100% - var(--x)) 0 0); }\n.pane-dark  { clip-path: inset(0 0 0 var(--x)); }\n.slit-line  { position: absolute; top: 0; bottom: 0;\n  left: var(--x); width: 2px; margin-left: -1px;\n  background: rgba(255,255,255,0.75); mix-blend-mode: difference; }',
    snippetJS: 'stage.addEventListener("mousemove", function(e){\n  var r = stage.getBoundingClientRect();\n  stage.style.setProperty("--x", (e.clientX - r.left) + "px");\n});\n// 초기값 — 화면 정중앙에서 분할 시작\nstage.style.setProperty("--x", (stage.clientWidth / 2) + "px");',
    explain: '왼층은 clip-path: inset(0 calc(100% − var(--x)) 0 0)으로 커서 왼쪽만, 오른층은 inset(0 0 0 var(--x))로 커서 오른쪽만 남긴다 — 변수 하나로 두 클립이 상보적으로 맞물려 이음새가 생기지 않는다. 분할선(.slit-line)과 핸들도 left: var(--x)로 같은 변수에 동기. clip-path는 합성 단계에서 처리되는 속성이라 풀스크린 레이어 2장을 매 프레임 잘라도 60fps가 유지된다. 두 pane은 동일한 레이아웃에 배색만 반전한 버전 — 분할선을 오가며 같은 콘텐츠의 두 무드를 비교하게 된다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS — --x 1변수 갱신 (클립은 CSS)' },
      { label: '트리거', value: 'mousemove → 분할선 X좌표 실시간 이동' },
      { label: '클립', value: 'clip-path: inset — 좌 calc(100%−x) / 우 x 상보 분할' },
      { label: '레이어', value: '동일 레이아웃 라이트/다크 2벌 풀스크린' },
      { label: '분할선', value: '2px 라인(mix-blend-mode: difference) + ⇄ 핸들 동기' },
      { label: '참고', value: '비포/애프터 이미지 슬라이더 / 테마 비교 데모' }
    ],
    guide: '두 pane의 콘텐츠 위치가 완전히 같아야 분할선을 넘을 때 글자가 이어져 보인다 — 레이아웃 클래스를 공유하고 색만 분기할 것. 분할선에 mix-blend-mode: difference를 주면 라이트/다크 어느 쪽 위에서도 선이 보인다. 세로 분할로 바꾸려면 --y와 inset 상하 값으로 치환. 드래그 슬라이더(input range)와 달리 커서만 따라가므로 모바일에서는 touchmove를 같은 핸들러에 연결해 폴백을 만들 수 있다 — 10패턴 중 터치 이식성이 가장 좋다.',
    recommendations: [
      { place: '히어로 헤더', body: '다크/라이트 모드 지원을 자랑하는 제품 히어로 — 두 테마 동시 시연' },
      { place: '랜딩 페이지', body: '리브랜딩·리뉴얼 발표 — 옛 디자인과 새 디자인의 실시간 비교' },
      { place: '제품 섹션', body: '보정 전후·압축 전후 등 비포/애프터 비주얼 증명' },
      { place: '포트폴리오 소개', body: '리디자인 케이스 스터디 — 커서로 가르는 비포/애프터' }
    ],
    tradeoff: '두 벌의 레이아웃 DOM이 통째로 중복된다 — 콘텐츠가 무거우면 메모리·유지보수 비용 2배. clip-path 영역 밖 요소는 보이지 않아도 레이아웃·페인트 트리에 남는다. 한쪽 pane은 aria-hidden 처리해 중복 낭독을 막을 것. 텍스트가 분할선에 걸리면 색이 반쪽씩 갈라져 가독성이 떨어지므로 핵심 카피는 짧게.'
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
    + '  <title>' + p.num + '. ' + p.title + ' — Cursor Spotlight Demo</title>\n'
    + '  <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable-dynamic-subset.min.css" rel="stylesheet">\n'
    + '  <style>\n'
    + '    * { box-sizing: border-box; }\n'
    + '    html, body { margin: 0; padding: 0; }\n'
    + '    body { background: #050505; color: #fff; font-family: "Pretendard Variable","Pretendard",sans-serif; -webkit-font-smoothing: antialiased; overflow: hidden; }\n'
    + '    .demo-controls { position: fixed; top: 16px; left: 16px; display: inline-flex; align-items: center; gap: 10px; z-index: 100; pointer-events: none; }\n'
    + '    .demo-label { font: 500 10px/1 "Pretendard Variable","Pretendard",sans-serif; color: rgba(255,255,255,0.35); letter-spacing: 0.14em; text-transform: uppercase; }\n'
    + '    .demo-hint { position: fixed; right: 16px; bottom: 24px; font: 500 11px/1.4 "Pretendard Variable","Pretendard",sans-serif; color: rgba(255,255,255,0.35); letter-spacing: 0.04em; z-index: 100; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 999px; padding: 8px 14px; pointer-events: none; animation: hint-pulse 2.4s ease-in-out infinite; }\n'
    + '    @keyframes hint-pulse { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }\n'
    + '    ' + BASE_CSS.replace(/\n/g, '\n    ') + '\n'
    + '    ' + p.demo.css.replace(/\n/g, '\n    ') + '\n'
    + '  </style>\n'
    + '</head>\n'
    + '<body>\n'
    + '  <div class="demo-controls">\n'
    + '    <span class="demo-label">' + p.num + ' · ' + p.title + '</span>\n'
    + '  </div>\n'
    + '  <div class="demo-hint">마우스를 움직여보세요 ✦</div>\n'
    + '\n'
    + '  ' + p.demo.bodyHTML.replace(/\n/g, '\n  ') + '\n'
    + '\n'
    + '  <script>\n'
    + '    (function(){\n'
    + '      ' + p.demo.js.replace(/\n/g, '\n      ') + '\n'
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
        embed: 'demos/cursor-spotlight/' + p.id + '.html',
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
      { type: 'heading', value: '커서 스포트라이트 — 커서 좌표 CSS 변수 기반 10종 패턴' },
      { type: 'text', value: CATEGORY.summary + ' 모든 패턴이 같은 좌표 모델을 공유한다: 스테이지가 mousemove에서 e.clientX/Y를 setProperty("--x","--y")로 갱신하고, CSS가 radial-gradient·mask·clip-path로 그 변수를 소비한다. JS는 좌표 배달부일 뿐, 시각 효과는 전부 CSS의 몫 — 그래서 패턴 간 차이는 "어떤 CSS가 변수를 소비하는가" 하나로 수렴한다. 마우스가 없을 때(초기 로드·터치)는 스테이지 중앙 좌표가 기본값.' },
      { type: 'heading', value: '10 패턴 인덱스' },
      { type: 'structure', items: indexItems },
      { type: 'heading', value: '공통 디자인 토큰' },
      {
        type: 'kv', columns: 2, items: [
          { label: '폰트', value: 'Pretendard Variable (본문 400~500 / 타이틀 700~800)' },
          { label: '배경', value: '#050505 (다크) — 스포트라이트 대비 극대화' },
          { label: '좌표 모델', value: 'mousemove → setProperty("--x","--y") px 단위' },
          { label: '기본값', value: '스테이지 중앙 — 초기 로드·터치 폴백 겸용' },
          { label: '스포트라이트 반경', value: '140~260px (radial-gradient circle)' },
          { label: '포인트 컬러', value: '#7c6cff 보라 / #4cc9f0 시안 / #f72585 마젠타' },
          { label: '마스크', value: '-webkit-mask-image + mask-image 병기 필수' },
          { label: '참고', value: 'Linear 보더 글로우 / GitHub 그리드 / Vercel 무빙 글로우' }
        ]
      },
      { type: 'heading', value: '읽기 가이드' },
      {
        type: 'structure', items: [
          { label: '라이브 데모', tag: 'IFRAME', desc: 'demos/cursor-spotlight/{pattern}.html — 마우스를 움직여 체험' },
          { label: '작동 원리', tag: 'HOW', desc: 'mousemove → CSS 변수 → radial-gradient/mask/clip-path 소비 경로' },
          { label: '정량 메타', tag: 'KV', desc: '의존성 / 트리거 / 핵심 속성 / 반경·계수 / 폴백 / 참고' },
          { label: '코드 스니펫', tag: 'CODE', desc: 'HTML / CSS / JS — boilerplate 제외 핵심만' },
          { label: '사용 가이드', tag: 'GUIDE', desc: '반경·알파 파라미터, 프리픽스, 터치 폴백, 접근성' },
          { label: '활용 추천', tag: 'PLACES', desc: '히어로 / 랜딩 / 제품 / 포트폴리오 4건' },
          { label: '트레이드오프', tag: 'NOTE', desc: '합성층·GPU 비용, 터치 한계, 프리픽스 분기' }
        ]
      },
      {
        type: 'note',
        value: '01 플래시라이트 텍스트가 좌표→mask 소비의 원형(시그니처)이고, 02~07은 mask·clip의 소비처 변형(이미지·와이어프레임·보더·격자·렌즈·타이포), 08은 lerp 지연 추적, 09는 다중 좌표계 동시 갱신, 10은 clip-path 분할로 확장된다. 모든 데모는 다크 배경 + Pretendard Variable + 한국어 본문, 외부 의존성은 Pretendard CDN 1개(아트워크는 전부 CSS gradient).'
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
    console.log('✓ demos/cursor-spotlight/' + p.id + '.html');
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
  console.log('✓ analyses/cursor-spotlight/analysis.json');
  console.log('  ' + PATTERNS.length + ' patterns + 1 overview = ' + (PATTERNS.length + 1) + ' sections');
  var totalBlocks = Object.values(sections).reduce(function (acc, s) { return acc + s.blocks.length; }, 0);
  console.log('  ' + totalBlocks + ' blocks total');
}

main();
