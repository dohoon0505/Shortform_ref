#!/usr/bin/env node
/**
 * Interaction Lab — Category Generator: Infinite Marquee (v1)
 * saasframe.io 무한 마퀴 패턴 참고 — 10종 무한 루프 밴드 인터랙션 카탈로그
 *
 * - CSS @keyframes 무한 루프가 본질 (number-counter·text-scramble의 자동 재생 전례)
 * - 핵심 원리: 콘텐츠 2벌 복제 + translateX(0→-50%) = 무한 심리스
 * - ↻ 다시 보기 = 애니메이션 재시작 (animation:none → reflow → 재부여)
 * - 검정 배경 + Pretendard Variable + 한국어 카피
 * - JS 틱 구동 패턴(04 호버 슬로우 / 05 스크롤 속도 / 09 드래그 관성)은
 *   setTimeout(16ms) + Date.now() 델타 — iframe 내 자동 재생 보장
 *
 * Usage: node scripts/generate-infinite-marquee.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ANALYSIS_DIR = join(ROOT, 'analyses', 'infinite-marquee');
const ANALYSIS_FILE = join(ANALYSIS_DIR, 'analysis.json');
const DEMO_DIR = join(ROOT, 'demos', 'infinite-marquee');

const CATEGORY = {
  id: 'infinite-marquee',
  title: '무한 마퀴',
  type: 'category',
  date: '2026-06-10',
  url: 'https://www.saasframe.io/patterns/infinite-marquee',
  summary: '콘텐츠를 2벌 복제해 translateX(-50%) 루프로 끊김 없이 흐르게 하는 무한 마퀴 10종. 로고월·고객사 밴드·뉴스 티커 등 2026 SaaS·에이전시 최다 사용 패턴 — CSS 키프레임 한 줄부터 드래그 관성까지 속도·방향·축의 변주를 비교한다.'
};

/* ================================================================
   공통 CSS 스니펫
   ================================================================ */

// 모든 데모가 공유하는 보조 캡션 스타일
const CAP_CSS = '.cap { font: 500 11px/1 "Pretendard Variable",sans-serif; color: rgba(255,255,255,0.3); letter-spacing: 0.18em; text-transform: uppercase; margin: 0 0 24px; text-align: center; }';

// 밴드 아래 보조 설명
const NOTE_CSS = '.note-sub { font: 400 12px/1.5 "Pretendard Variable",sans-serif; color: rgba(255,255,255,0.35); text-align: center; margin: 26px 0 0; }';

/* ================================================================
   10 패턴 정의
   ================================================================ */

const PATTERNS = [
  // ── 01. text-loop (시그니처) ──
  {
    id: 'text-loop', num: '01', title: '텍스트 루프 (시그니처)',
    summary: '무한 마퀴의 시그니처. 대형 텍스트 밴드가 좌측으로 끝없이 흐른다 — 동일 콘텐츠 2벌을 이어 붙이고 트랙을 translateX 0→-50%로 굴리면 -50% 지점이 시작과 완전히 같은 그림이 되어 이음새가 사라진다. 항목 사이 ✦ 구분자가 리듬을 만든다.',
    demo: {
      bodyHTML: '<div class="tl-wrap">\n'
        + '  <p class="cap">INFINITE MARQUEE — TEXT LOOP</p>\n'
        + '  <div class="tl-band">\n'
        + '    <div class="tl-track js-anim">\n'
        + '      <div class="tl-group">\n'
        + '        <span>디자인을 움직임으로</span><i>✦</i>\n'
        + '        <span>인터랙션 랩</span><i>✦</i>\n'
        + '        <span>모션이 곧 브랜드</span><i>✦</i>\n'
        + '        <span>멈추지 않는 흐름</span><i>✦</i>\n'
        + '      </div>\n'
        + '    </div>\n'
        + '  </div>\n'
        + '  <p class="note-sub">콘텐츠 2벌 복제 + translateX(-50%) 루프 — 24s linear</p>\n'
        + '</div>',
      css: '.tl-wrap { width: 100%; text-align: center; }\n'
        + '.tl-band { overflow: hidden; width: 100%; }\n'
        + '.tl-track { display: flex; width: max-content; animation: tl-scroll 24s linear infinite; will-change: transform; }\n'
        + '.tl-group { display: flex; align-items: center; flex: 0 0 auto; }\n'
        + '.tl-group span { font: 800 clamp(40px,7vw,88px)/1.15 "Pretendard Variable",sans-serif; color: #fff; white-space: nowrap; padding: 0 28px; }\n'
        + '.tl-group i { font-style: normal; font-size: clamp(18px,2.4vw,30px); color: #8ab4ff; }\n'
        + '@keyframes tl-scroll { to { transform: translateX(-50%); } }\n'
        + CAP_CSS + '\n' + NOTE_CSS,
      js: '// 콘텐츠 2벌 복제 — 그룹 1벌이 -50% 이동하는 순간 다음 벌이 정확히 같은 자리\n'
        + 'var track = document.querySelector(".tl-track");\n'
        + 'var clone = track.querySelector(".tl-group").cloneNode(true);\n'
        + 'clone.setAttribute("aria-hidden", "true");\n'
        + 'track.appendChild(clone);',
      height: 480,
      loopSec: 24
    },
    snippetHTML: '<div class="mq-band">\n  <div class="mq-track">\n    <div class="mq-group">\n      <span>디자인을 움직임으로</span><i>✦</i>\n      <span>인터랙션 랩</span><i>✦</i>\n    </div>\n    <!-- JS가 .mq-group을 1벌 더 복제 (aria-hidden) -->\n  </div>\n</div>',
    snippetCSS: '.mq-band  { overflow: hidden; }\n.mq-track {\n  display: flex; width: max-content;\n  animation: mq-scroll 24s linear infinite;\n}\n.mq-group { display: flex; align-items: center; flex: 0 0 auto; }\n/* 핵심: 동일 콘텐츠 2벌 → -50% 지점 = 시작과 완전히 같은 그림 */\n@keyframes mq-scroll { to { transform: translateX(-50%); } }',
    snippetJS: '// 복제는 JS 한 줄 — HTML은 원본 1벌만 유지 (수정 누락 방지)\nvar track = document.querySelector(".mq-track");\nvar clone = track.querySelector(".mq-group").cloneNode(true);\nclone.setAttribute("aria-hidden", "true"); // 스크린리더 중복 낭독 방지\ntrack.appendChild(clone);',
    explain: '트랙(width: max-content) 안에 동일한 그룹을 2벌 이어 붙이고 @keyframes로 translateX를 0에서 -50%까지 linear 무한 반복시킨다. 트랙 전체 폭의 절반 = 그룹 1벌 폭이므로, -50%에 도달한 프레임은 0% 프레임과 픽셀 단위로 동일 — 루프가 리셋되는 순간을 사용자가 인지할 수 없다. 이징은 반드시 linear여야 한다(가감속이 있으면 리셋 지점에서 속도가 튄다). 복제 그룹에는 aria-hidden을 줘 스크린리더가 같은 문장을 두 번 읽지 않게 한다.',
    kv: [
      { label: '의존성', value: 'CSS @keyframes (JS는 복제 1줄)' },
      { label: '트리거', value: '페이지 로드 → 24s linear 무한 루프' },
      { label: '듀레이션', value: '18~40s linear 권장 — 본 데모 24s' },
      { label: '심리스 조건', value: '동일 콘텐츠 2벌 + translateX(-50%) + linear' },
      { label: '핵심', value: 'width: max-content 트랙 + flex 그룹 2벌' },
      { label: '참고', value: 'linear.app 실측 — 무한루프 애니메이션 요소 206개' }
    ],
    guide: '속도는 duration으로만 조절한다 — 18s 미만은 어지럽고 40s 초과는 멈춘 듯 보인다. 콘텐츠 1벌의 폭이 뷰포트보다 넓어야 빈 공간이 보이지 않으므로 항목 수를 충분히 채울 것. transform 기반이라 reflow가 없고 GPU 합성으로 돌지만, will-change: transform을 명시해 레이어를 미리 확보하면 시작 프레임 끊김이 사라진다. prefers-reduced-motion: reduce에서는 animation-play-state: paused 또는 animation: none으로 정지 상태의 텍스트를 보여줄 것.',
    recommendations: [
      { place: '히어로 헤더', body: '브랜드 슬로건 밴드 — 히어로 하단을 가로지르는 시그니처 무드' },
      { place: '랜딩 페이지', body: '섹션 구분 밴드 — 키 메시지를 반복 노출하며 섹션 전환' },
      { place: '제품 섹션', body: '기능 키워드 스트림 — 제품의 핵심 가치를 끝없이 나열' },
      { place: '포트폴리오 소개', body: '이름·직함 루프 — 푸터 위 대형 타이포 밴드로 마무리' }
    ],
    tradeoff: '상시 움직이는 요소라 본문 읽기에 간섭한다 — 페이지당 1~2개 밴드로 제한할 것. prefers-reduced-motion 대응이 없으면 전정 장애 사용자에게 부담이며, 루프 속 텍스트는 정보 전달용이 아니라 무드 연출용으로만 써야 한다.'
  },

  // ── 02. logo-wall ──
  {
    id: 'logo-wall', num: '02', title: '로고 월',
    summary: 'SaaS 랜딩의 단골 — 고객사 워드마크 8종이 grayscale·저투명도로 흐르다 hover 시 전체가 일시정지되며 본 컬러로 복원된다. 양끝은 mask-image 80px 페이드로 자연스럽게 사라진다.',
    demo: {
      bodyHTML: '<div class="lw-wrap">\n'
        + '  <p class="cap">LOGO WALL — HOVER TO PAUSE</p>\n'
        + '  <div class="lw-band">\n'
        + '    <div class="lw-track js-anim">\n'
        + '      <div class="lw-group">\n'
        + '        <span class="lw-logo lw-a">◆ NOVA</span>\n'
        + '        <span class="lw-logo lw-b">Polaris</span>\n'
        + '        <span class="lw-logo lw-c">HEXA</span>\n'
        + '        <span class="lw-logo lw-d">orbit●</span>\n'
        + '        <span class="lw-logo lw-e">VERTEX</span>\n'
        + '        <span class="lw-logo lw-f">lumen</span>\n'
        + '        <span class="lw-logo lw-g">ATLAS</span>\n'
        + '        <span class="lw-logo lw-h">▮ Pulse</span>\n'
        + '      </div>\n'
        + '    </div>\n'
        + '  </div>\n'
        + '  <p class="note-sub">hover 시 전체 일시정지 + 컬러 복원 · 양끝 mask 80px 페이드</p>\n'
        + '</div>',
      css: '.lw-wrap { width: 100%; text-align: center; }\n'
        + '.lw-band { overflow: hidden; width: 100%; padding: 18px 0; -webkit-mask-image: linear-gradient(90deg, transparent, #000 80px, #000 calc(100% - 80px), transparent); mask-image: linear-gradient(90deg, transparent, #000 80px, #000 calc(100% - 80px), transparent); }\n'
        + '.lw-track { display: flex; width: max-content; animation: lw-scroll 28s linear infinite; will-change: transform; }\n'
        + '.lw-group { display: flex; align-items: center; flex: 0 0 auto; }\n'
        + '.lw-logo { display: inline-block; padding: 0 34px; white-space: nowrap; filter: grayscale(1); opacity: 0.45; transition: filter 180ms ease, opacity 180ms ease; cursor: default; }\n'
        + '.lw-band:hover .lw-track { animation-play-state: paused; }\n'
        + '.lw-band:hover .lw-logo { filter: none; opacity: 1; }\n'
        + '.lw-a { font: 800 26px/1 "Pretendard Variable",sans-serif; letter-spacing: 0.12em; color: #ff6b4a; }\n'
        + '.lw-b { font: italic 600 28px/1 "Pretendard Variable",sans-serif; color: #8ab4ff; }\n'
        + '.lw-c { font: 900 26px/1 "Pretendard Variable",sans-serif; letter-spacing: 0.3em; color: #ffd23f; }\n'
        + '.lw-d { font: 500 28px/1 "Pretendard Variable",sans-serif; color: #4ade80; }\n'
        + '.lw-e { font: 800 26px/1 "Pretendard Variable",sans-serif; letter-spacing: 0.18em; color: #f472b6; }\n'
        + '.lw-f { font: 300 30px/1 "Pretendard Variable",sans-serif; letter-spacing: 0.2em; color: #22d3ee; }\n'
        + '.lw-g { font: 800 26px/1 "Pretendard Variable",sans-serif; letter-spacing: -0.02em; color: #a78bfa; }\n'
        + '.lw-h { font: 700 26px/1 "Pretendard Variable",sans-serif; color: #fb923c; }\n'
        + '@keyframes lw-scroll { to { transform: translateX(-50%); } }\n'
        + CAP_CSS + '\n' + NOTE_CSS,
      js: 'var track = document.querySelector(".lw-track");\n'
        + 'var clone = track.querySelector(".lw-group").cloneNode(true);\n'
        + 'clone.setAttribute("aria-hidden", "true");\n'
        + 'track.appendChild(clone);',
      height: 480,
      loopSec: 28,
      hint: '로고에 마우스를 올려보세요'
    },
    snippetHTML: '<div class="lw-band">\n  <div class="lw-track">\n    <div class="lw-group">\n      <span class="lw-logo">◆ NOVA</span>\n      <span class="lw-logo">Polaris</span>\n      <!-- 로고 6~8개 -->\n    </div>\n  </div>\n</div>',
    snippetCSS: '.lw-band {\n  overflow: hidden;\n  /* 양끝 80px 페이드 — 로고가 잘려 보이지 않게 */\n  -webkit-mask-image: linear-gradient(90deg,\n    transparent, #000 80px, #000 calc(100% - 80px), transparent);\n  mask-image: linear-gradient(90deg,\n    transparent, #000 80px, #000 calc(100% - 80px), transparent);\n}\n.lw-logo { filter: grayscale(1); opacity: 0.45;\n           transition: filter 180ms, opacity 180ms; }\n.lw-band:hover .lw-track { animation-play-state: paused; }\n.lw-band:hover .lw-logo  { filter: none; opacity: 1; }',
    snippetJS: '// 로고 이미지라면 <img>를 그대로 복제해도 동일하게 동작\nvar track = document.querySelector(".lw-track");\nvar clone = track.querySelector(".lw-group").cloneNode(true);\nclone.setAttribute("aria-hidden", "true");\ntrack.appendChild(clone);',
    explain: '구조는 텍스트 루프와 동일하지만 두 가지 레이어가 추가된다. 첫째, 밴드 컨테이너에 mask-image linear-gradient를 걸어 양끝 80px을 투명으로 페이드 — 로고가 화면 가장자리에서 뚝 잘리는 대신 스르르 사라진다. 둘째, 로고는 기본 grayscale(1)+opacity 0.45로 가라앉혀 두고, 밴드 hover 시 트랙 전체를 animation-play-state: paused로 멈추면서 filter를 해제해 본 컬러를 복원한다. 정지+컬러 복원이 동시에 일어나 "지금 살펴보는 중"이라는 상태가 명확해진다.',
    kv: [
      { label: '의존성', value: 'CSS @keyframes + mask-image (JS 복제 1줄)' },
      { label: '트리거', value: '로드 → 28s 루프 / hover → play-state paused' },
      { label: '톤', value: 'grayscale(1) + opacity 0.45 → hover 시 본 컬러' },
      { label: '페이드', value: 'mask-image linear-gradient 80px 양끝 (실측 권장값)' },
      { label: '핵심', value: 'band:hover에서 트랙 정지 + 로고 필터 해제' },
      { label: '참고', value: 'saasframe.io 수집 SaaS 랜딩 최다 사용 변형' }
    ],
    guide: '실제 로고 이미지를 쓸 때는 높이를 24~32px로 통일하고 grayscale 필터로 톤을 맞출 것 — 컬러 로고가 섞여 흐르면 시선이 산만해진다. hover 일시정지는 "어느 회사인지 확인하고 싶다"는 사용자 의도에 대한 응답이므로 로고월에서는 사실상 필수. mask-image는 Safari에서 -webkit- prefix가 필요하다. prefers-reduced-motion에서는 루프를 멈추고 로고를 grid로 정렬해 보여주는 정적 폴백이 가장 좋다.',
    recommendations: [
      { place: '히어로 헤더', body: '히어로 바로 아래 신뢰 밴드 — "이미 함께하는 팀들" 소셜 프루프' },
      { place: '랜딩 페이지', body: '고객사·파트너 섹션 — grid 나열 대신 공간 절약형 루프' },
      { place: '제품 섹션', body: '연동 서비스 월 — 인테그레이션 로고를 끝없이 순환' },
      { place: '포트폴리오 소개', body: '클라이언트 리스트 — 협업 브랜드를 가볍게 과시' }
    ],
    tradeoff: '로고가 흐르는 동안에는 개별 식별이 어려워 정보 전달력은 정적 grid보다 낮다 — 신뢰의 분위기를 전하는 장치로 이해할 것. 로고 수가 5개 미만이면 같은 로고가 너무 자주 반복되어 오히려 빈약해 보인다.'
  },

  // ── 03. dual-direction ──
  {
    id: 'dual-direction', num: '03', title: '듀얼 디렉션',
    summary: '키워드 태그 캡슐 2행이 서로 반대 방향으로 교차해 흐른다. 같은 키프레임을 재사용하고 2행에만 animation-direction: reverse — 속도도 26s/30s로 미세하게 달리해 기계적인 평행 이동감을 지운다.',
    demo: {
      bodyHTML: '<div class="dd-wrap">\n'
        + '  <p class="cap">DUAL DIRECTION — CROSS FLOW</p>\n'
        + '  <div class="dd-band dd-row1">\n'
        + '    <div class="dd-track js-anim">\n'
        + '      <div class="dd-group">\n'
        + '        <span class="dd-chip">마이크로 인터랙션</span>\n'
        + '        <span class="dd-chip">스크롤 내러티브</span>\n'
        + '        <span class="dd-chip">키네틱 타이포</span>\n'
        + '        <span class="dd-chip">이징 곡선</span>\n'
        + '        <span class="dd-chip">모션 토큰</span>\n'
        + '        <span class="dd-chip">햅틱 리듬</span>\n'
        + '        <span class="dd-chip">상태 전이</span>\n'
        + '      </div>\n'
        + '    </div>\n'
        + '  </div>\n'
        + '  <div class="dd-band dd-row2">\n'
        + '    <div class="dd-track js-anim">\n'
        + '      <div class="dd-group">\n'
        + '        <span class="dd-chip">패럴랙스</span>\n'
        + '        <span class="dd-chip">호버 상태</span>\n'
        + '        <span class="dd-chip">트랜지션</span>\n'
        + '        <span class="dd-chip">스프링 물리</span>\n'
        + '        <span class="dd-chip">시퀀스 연출</span>\n'
        + '        <span class="dd-chip">듀레이션</span>\n'
        + '        <span class="dd-chip">베지어 곡선</span>\n'
        + '      </div>\n'
        + '    </div>\n'
        + '  </div>\n'
        + '  <p class="note-sub">1행 정방향 26s · 2행 reverse 30s — 이속 교차</p>\n'
        + '</div>',
      css: '.dd-wrap { width: 100%; text-align: center; }\n'
        + '.dd-band { overflow: hidden; width: 100%; padding: 9px 0; }\n'
        + '.dd-track { display: flex; width: max-content; animation: dd-scroll 26s linear infinite; will-change: transform; }\n'
        + '.dd-row2 .dd-track { animation-direction: reverse; animation-duration: 30s; }\n'
        + '.dd-group { display: flex; align-items: center; flex: 0 0 auto; }\n'
        + '.dd-chip { font: 600 clamp(14px,1.7vw,18px)/1 "Pretendard Variable",sans-serif; color: rgba(255,255,255,0.85); border: 1px solid rgba(255,255,255,0.16); border-radius: 999px; padding: 13px 24px; margin: 0 9px; white-space: nowrap; }\n'
        + '.dd-row2 .dd-chip { background: rgba(138,180,255,0.1); border-color: transparent; color: #8ab4ff; }\n'
        + '@keyframes dd-scroll { to { transform: translateX(-50%); } }\n'
        + CAP_CSS + '\n' + NOTE_CSS,
      js: '// 두 트랙 모두 그룹 복제 — 같은 함수 재사용\n'
        + 'Array.prototype.forEach.call(document.querySelectorAll(".dd-track"), function(track) {\n'
        + '  var clone = track.querySelector(".dd-group").cloneNode(true);\n'
        + '  clone.setAttribute("aria-hidden", "true");\n'
        + '  track.appendChild(clone);\n'
        + '});',
      height: 480,
      loopSec: 26
    },
    snippetHTML: '<div class="dd-band dd-row1">\n  <div class="dd-track">\n    <div class="dd-group">\n      <span class="dd-chip">마이크로 인터랙션</span>\n      <!-- 캡슐 7~8개 -->\n    </div>\n  </div>\n</div>\n<div class="dd-band dd-row2">\n  <div class="dd-track"> … </div>\n</div>',
    snippetCSS: '.dd-track {\n  display: flex; width: max-content;\n  animation: dd-scroll 26s linear infinite;\n}\n/* 2행은 키프레임 재사용 + direction·duration만 변경 */\n.dd-row2 .dd-track {\n  animation-direction: reverse;\n  animation-duration: 30s;\n}\n@keyframes dd-scroll { to { transform: translateX(-50%); } }',
    snippetJS: '// 트랙이 몇 개든 같은 복제 루틴으로 처리\nArray.prototype.forEach.call(\n  document.querySelectorAll(".dd-track"),\n  function(track) {\n    var clone = track.querySelector(".dd-group").cloneNode(true);\n    clone.setAttribute("aria-hidden", "true");\n    track.appendChild(clone);\n  }\n);',
    explain: '키프레임은 하나(translateX 0→-50%)만 정의하고 2행에는 animation-direction: reverse를 준다 — reverse는 -50%에서 0으로 거꾸로 재생하므로 콘텐츠가 우측으로 흐르고, 2벌 복제 구조 덕분에 역방향도 똑같이 심리스다. 속도를 26s/30s로 다르게 잡는 것이 의외의 포인트 — 두 행이 같은 속도로 흐르면 한 덩어리의 기계적 평행 이동으로 보이지만, 미세한 이속이 생기면 두 흐름이 독립적으로 살아 있는 인상을 준다.',
    kv: [
      { label: '의존성', value: 'CSS @keyframes ×1 재사용 (JS 복제 2줄)' },
      { label: '트리거', value: '로드 → 26s / 30s 이속 무한 루프' },
      { label: '방향', value: '1행 정방향 / 2행 animation-direction: reverse' },
      { label: '속도 차', value: '26s vs 30s — 미세 이속으로 기계감 제거' },
      { label: '핵심', value: '같은 키프레임 + direction·duration 오버라이드' },
      { label: '참고', value: '에이전시 스킬 태그 월 / 테크 키워드 밴드' }
    ],
    guide: '행은 2~3개가 한계 — 4행 이상 교차하면 시선이 갈 곳을 잃는다. 두 행의 콘텐츠를 다르게 구성해야 교차의 의미가 산다(예: 1행 디자인 키워드, 2행 기술 키워드). 캡슐 톤도 행마다 달리하면(아웃라인 vs 필) 방향 차이가 더 잘 읽힌다. 속도 차는 10~20% 정도가 적정 — 그 이상 벌어지면 느린 행이 멈춘 것처럼 보인다. prefers-reduced-motion에서는 두 행 모두 정지할 것.',
    recommendations: [
      { place: '히어로 헤더', body: '키워드 클라우드 — 서비스 범위를 두 흐름으로 압축 제시' },
      { place: '랜딩 페이지', body: '기능 태그 섹션 — 많은 기능을 나열하지 않고 흘려보내기' },
      { place: '제품 섹션', body: '지원 포맷·통합 목록 — 카테고리별 행 분리 순환' },
      { place: '포트폴리오 소개', body: '스킬 셋 밴드 — 디자인/개발 역량을 교차로 노출' }
    ],
    tradeoff: '반대 방향 두 흐름은 시각적 정보량이 단일 밴드의 2배 — 주변에 다른 모션이 있으면 과부하가 된다. 캡슐 속 텍스트는 흐르는 중에 읽기 어려우므로 짧은 단어(2~6자) 위주로 구성할 것.'
  },

  // ── 04. hover-pause ──
  {
    id: 'hover-pause', num: '04', title: '호버 슬로우',
    summary: '기본은 빠른 160px/s, hover하면 24px/s로 부드럽게 감속. animation-duration 교체는 위상이 점프하므로, CSS 애니메이션 대신 JS 틱이 px/s 속도를 지수 보간해 끊김 없이 느려지고 빨라진다.',
    demo: {
      bodyHTML: '<div class="hp-wrap">\n'
        + '  <p class="cap">HOVER SLOW — SPEED LERP</p>\n'
        + '  <div class="hp-band">\n'
        + '    <div class="hp-track">\n'
        + '      <div class="hp-group">\n'
        + '        <span>빠르게 흐르다가</span><i>—</i>\n'
        + '        <span>머무르면 느려진다</span><i>—</i>\n'
        + '        <span>속도는 끊기지 않고 보간된다</span><i>—</i>\n'
        + '      </div>\n'
        + '    </div>\n'
        + '  </div>\n'
        + '  <p class="note-sub">기본 160px/s ↔ hover 24px/s · 지수 보간 감속</p>\n'
        + '</div>',
      css: '.hp-wrap { width: 100%; text-align: center; }\n'
        + '.hp-band { overflow: hidden; width: 100%; padding: 10px 0; cursor: default; }\n'
        + '.hp-track { display: flex; width: max-content; will-change: transform; }\n'
        + '.hp-group { display: flex; align-items: center; flex: 0 0 auto; }\n'
        + '.hp-group span { font: 700 clamp(30px,5vw,60px)/1.2 "Pretendard Variable",sans-serif; color: #fff; white-space: nowrap; padding: 0 24px; }\n'
        + '.hp-group i { font-style: normal; color: rgba(255,255,255,0.25); font-size: clamp(20px,3vw,36px); }\n'
        + CAP_CSS + '\n' + NOTE_CSS,
      js: 'var band = document.querySelector(".hp-band");\n'
        + 'var track = document.querySelector(".hp-track");\n'
        + 'var group = track.querySelector(".hp-group");\n'
        + 'var clone = group.cloneNode(true);\n'
        + 'clone.setAttribute("aria-hidden", "true");\n'
        + 'track.appendChild(clone);\n'
        + 'var FAST = 160, SLOW = 24;\n'
        + 'var speed = FAST, target = FAST, offset = 0;\n'
        + 'band.addEventListener("mouseenter", function() { target = SLOW; });\n'
        + 'band.addEventListener("mouseleave", function() { target = FAST; });\n'
        + 'var last = Date.now();\n'
        + 'function tick() {\n'
        + '  var now = Date.now();\n'
        + '  var dt = Math.min(64, now - last);\n'
        + '  last = now;\n'
        + '  speed += (target - speed) * Math.min(1, dt * 0.005); // 지수 보간\n'
        + '  offset += speed * dt / 1000;\n'
        + '  var half = group.offsetWidth;\n'
        + '  if (half > 0) offset = offset % half; // 모듈러 래핑 = 무한\n'
        + '  track.style.transform = "translateX(" + (-offset) + "px)";\n'
        + '  setTimeout(tick, 16);\n'
        + '}\n'
        + 'setTimeout(tick, 16);\n'
        + 'var baseReset = window.__reset;\n'
        + 'window.__reset = function() { baseReset(); offset = 0; speed = FAST; target = FAST; last = Date.now(); };',
      height: 480,
      loopSec: 18,
      hint: '밴드에 마우스를 올려보세요'
    },
    snippetHTML: '<div class="hp-band">\n  <div class="hp-track">\n    <div class="hp-group">\n      <span>빠르게 흐르다가</span><i>—</i>\n      <span>머무르면 느려진다</span><i>—</i>\n    </div>\n  </div>\n</div>',
    snippetCSS: '/* CSS 애니메이션 없음 — transform은 JS 틱이 직접 구동 */\n.hp-band  { overflow: hidden; }\n.hp-track { display: flex; width: max-content;\n            will-change: transform; }',
    snippetJS: 'var FAST = 160, SLOW = 24;            // px/s\nvar speed = FAST, target = FAST, offset = 0;\nband.addEventListener("mouseenter", function() { target = SLOW; });\nband.addEventListener("mouseleave", function() { target = FAST; });\nfunction tick() {\n  var dt = Math.min(64, Date.now() - last); last += dt;\n  speed += (target - speed) * Math.min(1, dt * 0.005); // 지수 보간\n  offset = (offset + speed * dt / 1000) % group.offsetWidth;\n  track.style.transform = "translateX(" + (-offset) + "px)";\n  setTimeout(tick, 16);\n}',
    explain: 'animation-duration을 hover에 18s→60s로 바꾸면 같은 진행률 위치가 다른 픽셀 위치로 재해석되어 트랙이 순간이동한다 — 그래서 이 패턴은 CSS 애니메이션을 버리고 JS 틱이 offset(px)을 직접 누적한다. 속도는 speed += (target − speed) × dt×0.005 지수 보간으로 목표값에 점근 — mouseenter 순간 목표만 24px/s로 바꾸면 실제 속도는 0.5초에 걸쳐 미끄러지듯 감속한다. offset은 그룹 1벌 폭으로 모듈러 래핑해 무한 루프를 유지하고, 틱은 setTimeout 16ms + Date.now() 델타라 iframe 안에서도 안정적으로 돈다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (setTimeout 16ms 틱 + 지수 보간)' },
      { label: '트리거', value: 'mouseenter/leave → 목표 속도 교체' },
      { label: '속도', value: '기본 160px/s ↔ hover 24px/s' },
      { label: '보간', value: 'speed += (target − speed) × dt×0.005' },
      { label: '핵심', value: 'duration 교체 대신 px/s 보간 — 위상 점프 제거' },
      { label: '참고', value: 'linear.app 버튼 transition 0.1s cubic-bezier(0.25,0.46,0.45,0.94) — 감속 무드 차용' }
    ],
    guide: '완전 정지(play-state: paused) 대신 슬로우를 쓰는 이유는 "살아 있는 채로 읽게" 하기 위해서다 — 정지가 필요한 로고월과 달리, 텍스트 밴드는 느리게라도 흐르는 쪽이 무드를 유지한다. SLOW를 0으로 두면 같은 코드로 부드러운 정지도 구현된다. 보간 계수(0.005)를 키우면 반응이 빨라지고 줄이면 더 미끄럽다. 터치 기기에는 hover가 없으므로 기본 속도를 데스크톱보다 낮게 잡고, prefers-reduced-motion에서는 정지 상태로 시작할 것.',
    recommendations: [
      { place: '히어로 헤더', body: '인터랙티브 슬로건 밴드 — 커서를 올리면 메시지가 읽힌다' },
      { place: '랜딩 페이지', body: '후기·인용 스트림 — 관심 있는 문장에서 자연 감속' },
      { place: '제품 섹션', body: '변경 로그·업데이트 피드 — 훑다가 멈춰 읽는 리듬' },
      { place: '포트폴리오 소개', body: '프로젝트명 루프 — hover로 천천히 살펴보게 유도' }
    ],
    tradeoff: 'CSS 단독 구현보다 코드가 길고 메인 스레드 틱이 상시 돈다(16ms 간격, 부하는 미미). hover가 없는 터치 환경에서는 감속 인터랙션 자체가 사라지므로 핵심 정보를 이 패턴에 의존시키지 말 것.'
  },

  // ── 05. scroll-velocity ──
  {
    id: 'scroll-velocity', num: '05', title: '스크롤 속도 반응',
    summary: '페이지 스크롤 속도를 측정해 마퀴 기본 속도에 가산하고 skewX로 기울인다 — 빠르게 스크롤할수록 밴드가 더 빨리 흐르며 비스듬히 휘는 velocity skew. 멈추면 감쇠 곡선을 타고 기본 흐름으로 복귀한다.',
    demo: {
      bodyHTML: '<div class="sv-space">\n'
        + '  <div class="sv-stage">\n'
        + '    <div class="sv-wrap">\n'
        + '      <p class="cap">SCROLL VELOCITY — SKEW</p>\n'
        + '      <div class="sv-band">\n'
        + '        <div class="sv-track">\n'
        + '          <div class="sv-group">\n'
        + '            <span>스크롤의 속도가</span><i>✦</i>\n'
        + '            <span>마퀴의 속도가 된다</span><i>✦</i>\n'
        + '            <span>빠를수록 기울어진다</span><i>✦</i>\n'
        + '          </div>\n'
        + '        </div>\n'
        + '      </div>\n'
        + '      <p class="note-sub">기본 90px/s + |스크롤 속도| 가산 · skewX ±10° 클램프</p>\n'
        + '    </div>\n'
        + '  </div>\n'
        + '</div>',
      css: '/* sticky가 동작하도록 showcase의 overflow를 해제 */\n'
        + '.showcase { overflow: visible; }\n'
        + '.sv-space { height: 280vh; width: 100%; }\n'
        + '.sv-stage { position: sticky; top: 0; height: 100vh; display: flex; align-items: center; justify-content: center; }\n'
        + '.sv-wrap { width: 100%; text-align: center; }\n'
        + '.sv-band { overflow: hidden; width: 100%; padding: 14px 0; }\n'
        + '.sv-track { display: flex; width: max-content; will-change: transform; }\n'
        + '.sv-group { display: flex; align-items: center; flex: 0 0 auto; }\n'
        + '.sv-group span { font: 800 clamp(32px,5.4vw,66px)/1.2 "Pretendard Variable",sans-serif; color: #fff; white-space: nowrap; padding: 0 26px; }\n'
        + '.sv-group i { font-style: normal; color: #8ab4ff; font-size: clamp(16px,2.2vw,28px); }\n'
        + CAP_CSS + '\n' + NOTE_CSS,
      js: 'var track = document.querySelector(".sv-track");\n'
        + 'var group = track.querySelector(".sv-group");\n'
        + 'var clone = group.cloneNode(true);\n'
        + 'clone.setAttribute("aria-hidden", "true");\n'
        + 'track.appendChild(clone);\n'
        + 'var BASE = 90;\n'
        + 'var offset = 0, vel = 0;\n'
        + 'var lastY = window.pageYOffset;\n'
        + 'var last = Date.now();\n'
        + 'function tick() {\n'
        + '  var now = Date.now();\n'
        + '  var dt = Math.min(64, now - last);\n'
        + '  last = now;\n'
        + '  var y = window.pageYOffset;\n'
        + '  vel += (y - lastY) * 5;      // 스크롤 델타 → 속도 가산\n'
        + '  lastY = y;\n'
        + '  vel *= Math.max(0, 1 - dt * 0.004); // 매 틱 감쇠\n'
        + '  offset += (BASE + Math.abs(vel)) * dt / 1000;\n'
        + '  var half = group.offsetWidth;\n'
        + '  if (half > 0) offset = offset % half;\n'
        + '  var skew = Math.max(-10, Math.min(10, vel * 0.015));\n'
        + '  track.style.transform = "translateX(" + (-offset) + "px) skewX(" + skew + "deg)";\n'
        + '  setTimeout(tick, 16);\n'
        + '}\n'
        + 'setTimeout(tick, 16);\n'
        + 'var baseReset = window.__reset;\n'
        + 'window.__reset = function() {\n'
        + '  baseReset();\n'
        + '  window.scrollTo({ top: 0, behavior: "smooth" });\n'
        + '  offset = 0; vel = 0; lastY = window.pageYOffset; last = Date.now();\n'
        + '};',
      height: 480,
      loopSec: 20,
      hint: '아래로 빠르게 스크롤해 보세요'
    },
    snippetHTML: '<div class="sv-band">\n  <div class="sv-track">\n    <div class="sv-group">\n      <span>스크롤의 속도가</span><i>✦</i>\n      <span>마퀴의 속도가 된다</span><i>✦</i>\n    </div>\n  </div>\n</div>',
    snippetCSS: '.sv-band  { overflow: hidden; }\n.sv-track { display: flex; width: max-content;\n            will-change: transform; }\n/* transform은 JS가 translateX + skewX를 함께 갱신 */',
    snippetJS: 'var BASE = 90, vel = 0, offset = 0, lastY = window.pageYOffset;\nfunction tick() {\n  var y = window.pageYOffset;\n  vel += (y - lastY) * 5;              // 스크롤 델타 가산\n  lastY = y;\n  vel *= Math.max(0, 1 - dt * 0.004);  // 감쇠 — 멈추면 기본 속도로\n  offset = (offset + (BASE + Math.abs(vel)) * dt / 1000) % half;\n  var skew = Math.max(-10, Math.min(10, vel * 0.015));\n  track.style.transform =\n    "translateX(" + (-offset) + "px) skewX(" + skew + "deg)";\n  setTimeout(tick, 16);\n}',
    explain: '매 틱마다 scrollY 델타를 측정해 vel에 가산하고, vel은 매 틱 약 6%씩 감쇠시킨다(1 − dt×0.004). 마퀴 진행 속도는 BASE + |vel| — 스크롤 방향과 무관하게 흐름이 빨라지고, skewX는 부호를 살린 vel×0.015를 ±10°로 클램프해 아래로 스크롤하면 한쪽으로, 위로 스크롤하면 반대쪽으로 기운다. 속도와 기울기가 같은 물리량(vel)에서 파생되므로 두 효과가 항상 동기화되어 "관성이 있는 잉크 밴드" 같은 질감이 난다. 데모는 280vh 스크롤 공간 + sticky 스테이지 구성.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (스크롤 델타 측정 + 감쇠)' },
      { label: '트리거', value: '스크롤 → 속도 가산 / 멈추면 기본 복귀' },
      { label: '속도', value: '기본 90px/s + |velocity| 가산' },
      { label: 'skew', value: 'vel × 0.015 → ±10° 클램프' },
      { label: '핵심', value: '속도·기울기를 같은 vel에서 파생 — 동기화 보장' },
      { label: '참고', value: 'GSAP ScrollVelocity 데모 / Awwwards 에이전시 단골' }
    ],
    guide: 'skew 클램프(±10°)는 반드시 유지할 것 — 클램프가 없으면 빠른 휠 입력에서 글자가 평행사변형으로 뭉개진다. 감쇠 계수는 0.003~0.006 사이가 자연스럽다(작을수록 여운이 길다). 모바일 관성 스크롤에서는 델타가 한 번에 크게 들어오므로 가산 계수를 절반으로 낮추는 분기를 권장. 본문 한가운데보다 섹션 경계 밴드에 써야 스크롤과 모션의 인과가 직관적으로 읽힌다. prefers-reduced-motion에서는 skew를 끄고 기본 속도만 유지하거나 정지할 것.',
    recommendations: [
      { place: '히어로 헤더', body: '인트로 직후 밴드 — 첫 스크롤에 반응해 살아나는 장치' },
      { place: '랜딩 페이지', body: '섹션 전환 밴드 — 스크롤 에너지를 시각 피드백으로 환원' },
      { place: '제품 섹션', body: '속도·성능 소구 제품 — "빠름"을 체감형으로 은유' },
      { place: '포트폴리오 소개', body: '쇼릴 구간 — 스크롤 드라이브의 손맛을 과시' }
    ],
    tradeoff: '스크롤 이벤트와 상시 틱이 함께 돌아 구현 난도와 부하가 카테고리 내 최고 수준. 효과가 화려한 만큼 페이지에 1개만 허용되며, 스크롤 공간이 짧은 페이지에서는 반응을 체감하기 어렵다.'
  },

  // ── 06. vertical-ticker ──
  {
    id: 'vertical-ticker', num: '06', title: '세로 티커',
    summary: '알림·뉴스 항목이 아래에서 위로 한 줄씩 무한 롤링. 가로 흐름이 아니라 translateY 스텝 루프 — 키프레임의 hold 구간이 각 항목을 2초씩 정지시켜 실제로 읽을 수 있는 마퀴다.',
    demo: {
      bodyHTML: '<div class="vt-wrap">\n'
        + '  <p class="cap">VERTICAL TICKER — NEWS ROLL</p>\n'
        + '  <div class="vt-card">\n'
        + '    <span class="vt-live">LIVE</span>\n'
        + '    <div class="vt-window">\n'
        + '      <ul class="vt-list js-anim">\n'
        + '        <li><em>14:02</em>무한 마퀴 카테고리 패턴 10종 공개</li>\n'
        + '        <li><em>14:17</em>신규 가입 1,204명 돌파</li>\n'
        + '        <li><em>15:05</em>디자인 시스템 v5.2 업데이트 배포</li>\n'
        + '        <li><em>15:48</em>모션 가이드 뉴스레터 발행</li>\n'
        + '      </ul>\n'
        + '    </div>\n'
        + '  </div>\n'
        + '  <p class="note-sub">translateY 스텝 루프 — 마지막에 첫 항목 클론으로 이음새 제거</p>\n'
        + '</div>',
      css: '.vt-wrap { text-align: center; width: 100%; }\n'
        + '.vt-card { display: flex; align-items: center; gap: 16px; width: min(560px, 86vw); margin: 0 auto; padding: 16px 20px; border: 1px solid rgba(255,255,255,0.12); border-radius: 14px; background: #0d0d0d; text-align: left; }\n'
        + '.vt-live { flex: 0 0 auto; font: 700 10px/1 "Pretendard Variable",sans-serif; color: #4ade80; border: 1px solid rgba(74,222,128,0.4); border-radius: 999px; padding: 6px 10px; letter-spacing: 0.14em; }\n'
        + '.vt-window { height: 24px; overflow: hidden; flex: 1; }\n'
        + '.vt-list { list-style: none; margin: 0; padding: 0; animation: vt-roll 10s infinite; }\n'
        + '.vt-list li { height: 24px; line-height: 24px; font: 500 15px/24px "Pretendard Variable",sans-serif; color: rgba(255,255,255,0.85); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n'
        + '.vt-list li em { font-style: normal; color: #8ab4ff; margin-right: 10px; font-size: 12px; }\n'
        + '@keyframes vt-roll {\n'
        + '  0%, 21%   { transform: translateY(0); }\n'
        + '  25%, 46%  { transform: translateY(-24px); }\n'
        + '  50%, 71%  { transform: translateY(-48px); }\n'
        + '  75%, 96%  { transform: translateY(-72px); }\n'
        + '  100%      { transform: translateY(-96px); }\n'
        + '}\n'
        + CAP_CSS + '\n' + NOTE_CSS,
      js: '// 첫 항목을 끝에 클론 — 100% 지점(-96px)이 첫 줄과 같은 그림이 되어 심리스\n'
        + 'var list = document.querySelector(".vt-list");\n'
        + 'var first = list.children[0].cloneNode(true);\n'
        + 'first.setAttribute("aria-hidden", "true");\n'
        + 'list.appendChild(first);',
      height: 480,
      loopSec: 10
    },
    snippetHTML: '<div class="vt-window">\n  <ul class="vt-list">\n    <li>무한 마퀴 카테고리 패턴 10종 공개</li>\n    <li>신규 가입 1,204명 돌파</li>\n    <li>디자인 시스템 v5.2 업데이트 배포</li>\n    <li>모션 가이드 뉴스레터 발행</li>\n    <!-- JS가 첫 항목을 끝에 클론 -->\n  </ul>\n</div>',
    snippetCSS: '.vt-window { height: 24px; overflow: hidden; } /* 1줄 창 */\n.vt-list li { height: 24px; line-height: 24px; }  /* 줄 높이 = 이동 단위 */\n.vt-list { animation: vt-roll 10s infinite; }      /* 기본 ease — 스텝마다 감속 */\n@keyframes vt-roll {\n  0%, 21%  { transform: translateY(0); }      /* hold 2.1s */\n  25%, 46% { transform: translateY(-24px); }  /* 전환 0.4s + hold */\n  50%, 71% { transform: translateY(-48px); }\n  75%, 96% { transform: translateY(-72px); }\n  100%     { transform: translateY(-96px); }  /* = 첫 항목 클론 위치 */\n}',
    snippetJS: 'var list = document.querySelector(".vt-list");\nvar first = list.children[0].cloneNode(true);\nfirst.setAttribute("aria-hidden", "true");\nlist.appendChild(first); // 마지막 칸 = 첫 항목 → 루프 리셋이 안 보임',
    explain: '높이 24px 창(overflow: hidden) 안에 항목 4개 + 첫 항목 클론을 세로로 쌓고, 키프레임을 hold 구간이 있는 스텝으로 짠다 — 0~21%는 정지, 21~25%(0.4s)에 한 줄(-24px) 이동, 다시 hold… 타이밍 함수를 기본 ease로 두면 각 스텝 전환에 자동으로 가감속이 붙어 "찰칵" 하는 기계식 손맛이 난다. 100% 지점(-96px)은 클론된 첫 항목이라 0%와 같은 그림 — 가로 마퀴의 -50% 트릭을 세로 스텝 버전으로 옮긴 것이다. 줄 높이와 translateY 배수가 정확히 일치해야 줄 걸침이 없다.',
    kv: [
      { label: '의존성', value: 'CSS @keyframes 스텝 루프 (JS 클론 1줄)' },
      { label: '트리거', value: '로드 → 10s 사이클 무한 루프' },
      { label: '리듬', value: '항목당 hold 2.1s + 전환 0.4s (ease)' },
      { label: '줄 높이', value: '24px 고정 — translateY 배수와 일치 필수' },
      { label: '핵심', value: '키프레임 hold 구간 + 첫 항목 클론' },
      { label: '참고', value: '거래소 시세 티커 / 포털 실시간 뉴스 롤링' }
    ],
    guide: 'hold 시간이 곧 읽기 시간 — 항목 글자 수 × 80ms 이상을 확보할 것(이 데모는 2.1s). 항목 수를 바꾸면 키프레임 퍼센트를 다시 계산해야 하므로, 항목이 자주 바뀌는 운영 환경이라면 키프레임을 JS로 생성하는 편이 안전하다. 줄 높이는 px 고정이 원칙 — em이나 line-height 상속에 맡기면 폰트 로딩 시점에 따라 줄이 어긋난다. 긴 항목은 ellipsis로 잘라 한 줄을 보장하고, prefers-reduced-motion에서는 첫 항목 고정을 권장.',
    recommendations: [
      { place: '히어로 헤더', body: '실시간 지표 한 줄 — "지금 1,204명이 보는 중" 라이브 신호' },
      { place: '랜딩 페이지', body: '공지·이벤트 롤링 — 헤더 아래 한 줄 공지 영역' },
      { place: '제품 섹션', body: '활동 피드 — 최근 가입·결제·배포 이벤트 순환' },
      { place: '포트폴리오 소개', body: '수상·게재 이력 — 짧은 업적을 한 줄씩 회전' }
    ],
    tradeoff: '한 번에 한 항목만 보여 전체 목록 파악이 불가능하다 — 중요 공지를 여기에만 의존하면 놓치는 사용자가 생긴다. 항목 수 변경 시 키프레임 재계산이 필요한 유지보수 비용도 있다.'
  },

  // ── 07. image-strip ──
  {
    id: 'image-strip', num: '07', title: '이미지 스트립',
    summary: 'CSS 그라디언트 아트워크 카드 6종이 흐르는 포토 밴드. 트랙은 32s로 계속 흐르고, hover한 카드만 scale 1.07로 떠오른다 — 흐름을 멈추지 않은 채 개별 항목에 반응하는 변형.',
    demo: {
      bodyHTML: '<div class="ist-wrap">\n'
        + '  <p class="cap">IMAGE STRIP — HOVER SCALE</p>\n'
        + '  <div class="ist-band">\n'
        + '    <div class="ist-track js-anim">\n'
        + '      <div class="ist-group">\n'
        + '        <figure class="ist-card ist-1"><figcaption>ARTWORK 01</figcaption></figure>\n'
        + '        <figure class="ist-card ist-2"><figcaption>ARTWORK 02</figcaption></figure>\n'
        + '        <figure class="ist-card ist-3"><figcaption>ARTWORK 03</figcaption></figure>\n'
        + '        <figure class="ist-card ist-4"><figcaption>ARTWORK 04</figcaption></figure>\n'
        + '        <figure class="ist-card ist-5"><figcaption>ARTWORK 05</figcaption></figure>\n'
        + '        <figure class="ist-card ist-6"><figcaption>ARTWORK 06</figcaption></figure>\n'
        + '      </div>\n'
        + '    </div>\n'
        + '  </div>\n'
        + '  <p class="note-sub">트랙은 계속 흐르고 hover한 카드만 scale 1.07</p>\n'
        + '</div>',
      css: '.ist-wrap { width: 100%; text-align: center; }\n'
        + '.ist-band { overflow: hidden; width: 100%; padding: 24px 0; }\n'
        + '.ist-track { display: flex; width: max-content; animation: ist-scroll 32s linear infinite; will-change: transform; }\n'
        + '.ist-group { display: flex; flex: 0 0 auto; }\n'
        + '.ist-card { width: clamp(180px,22vw,240px); height: clamp(120px,15vw,160px); border-radius: 16px; margin: 0 12px; flex: 0 0 auto; display: flex; align-items: flex-end; padding: 14px; transition: transform 180ms ease; cursor: pointer; }\n'
        + '.ist-card:hover { transform: scale(1.07); }\n'
        + '.ist-card figcaption { font: 600 11px/1 "Pretendard Variable",sans-serif; letter-spacing: 0.14em; color: rgba(255,255,255,0.85); }\n'
        + '.ist-1 { background: linear-gradient(135deg, #1e3a8a, #22d3ee); }\n'
        + '.ist-2 { background: radial-gradient(circle at 30% 30%, #f472b6, #7c3aed); }\n'
        + '.ist-3 { background: conic-gradient(from 210deg, #fb923c, #e11d48, #fb923c); }\n'
        + '.ist-4 { background: linear-gradient(160deg, #064e3b, #4ade80); }\n'
        + '.ist-5 { background: radial-gradient(circle at 70% 20%, #ffd23f, #b45309); }\n'
        + '.ist-6 { background: linear-gradient(120deg, #0f172a, #8ab4ff); }\n'
        + '@keyframes ist-scroll { to { transform: translateX(-50%); } }\n'
        + CAP_CSS + '\n' + NOTE_CSS,
      js: 'var track = document.querySelector(".ist-track");\n'
        + 'var clone = track.querySelector(".ist-group").cloneNode(true);\n'
        + 'clone.setAttribute("aria-hidden", "true");\n'
        + 'track.appendChild(clone);',
      height: 480,
      loopSec: 32,
      hint: '카드에 마우스를 올려보세요'
    },
    snippetHTML: '<div class="ist-band">\n  <div class="ist-track">\n    <div class="ist-group">\n      <figure class="ist-card ist-1"><figcaption>ARTWORK 01</figcaption></figure>\n      <!-- 카드 6~8장 — 실서비스에선 <img> 또는 background-image -->\n    </div>\n  </div>\n</div>',
    snippetCSS: '.ist-track { display: flex; width: max-content;\n             animation: ist-scroll 32s linear infinite; }\n.ist-card  {\n  width: clamp(180px, 22vw, 240px);\n  border-radius: 16px; flex: 0 0 auto;\n  transition: transform 180ms ease;\n}\n.ist-card:hover { transform: scale(1.07); } /* 카드만 개별 확대 */\n@keyframes ist-scroll { to { transform: translateX(-50%); } }',
    snippetJS: 'var track = document.querySelector(".ist-track");\nvar clone = track.querySelector(".ist-group").cloneNode(true);\nclone.setAttribute("aria-hidden", "true");\ntrack.appendChild(clone);',
    explain: '텍스트 루프의 이미지 버전 — 카드가 flex: 0 0 auto로 고정폭을 유지한 채 트랙이 32s linear로 흐른다. 차별점은 hover 반응의 위치: 로고월처럼 트랙 전체를 멈추지 않고, hover한 카드 하나만 transform: scale(1.07)로 떠오른다. 트랙의 translateX와 카드의 scale은 서로 다른 요소의 transform이라 충돌 없이 합성되고, 카드는 계속 흐르면서 커지므로 "흐르는 갤러리를 손끝으로 스치는" 감각이 난다. 이미지가 크니 duration도 32s로 느긋하게 — 빠른 이미지 흐름은 어지럽다.',
    kv: [
      { label: '의존성', value: 'CSS @keyframes + hover transform (JS 복제 1줄)' },
      { label: '트리거', value: '로드 → 32s 루프 / 카드 hover → scale 1.07' },
      { label: '카드', value: 'clamp(180~240px) × 6종 그라디언트 아트워크' },
      { label: 'hover', value: 'transform 180ms ease — 흐름은 멈추지 않음' },
      { label: '핵심', value: '트랙 translateX와 카드 scale의 독립 합성' },
      { label: '참고', value: '에이전시 쇼릴 밴드 / 갤러리 티저 스트립' }
    ],
    guide: '실서비스에서는 그라디언트 대신 <img loading="lazy">를 카드에 넣되, 복제 그룹의 이미지는 브라우저 캐시를 공유하므로 전송량이 2배가 되지는 않는다. 카드 확대 시 이웃 카드를 밀지 않도록 scale(레이아웃 불변)만 쓸 것 — width를 키우면 트랙 폭이 변해 루프 길이가 어긋난다. 클릭 가능한 카드라면 흐르는 중 오클릭이 잦으므로 hover 시 트랙 감속(04 패턴 결합)을 고려하라. 이미지 밴드는 시각 비중이 크니 페이지당 1개만, prefers-reduced-motion에서는 정지 grid로 폴백.',
    recommendations: [
      { place: '히어로 헤더', body: '작업물 프리뷰 띠 — 히어로 배경 하단을 흐르는 쇼케이스' },
      { place: '랜딩 페이지', body: '갤러리 티저 — 상세 갤러리로 진입을 유도하는 맛보기' },
      { place: '제품 섹션', body: '템플릿·테마 미리보기 — 다양한 결과물을 순환 전시' },
      { place: '포트폴리오 소개', body: '프로젝트 썸네일 스트립 — 대표작을 끝없이 회전' }
    ],
    tradeoff: '이미지가 흐르는 동안에는 개별 작업물을 자세히 볼 수 없어 어디까지나 티저 용도다. 고해상 이미지 다수를 트랙에 넣으면 합성 레이어 메모리가 커지므로 카드 12장 이내·적정 해상도로 제한할 것.'
  },

  // ── 08. outline-fill-band ──
  {
    id: 'outline-fill-band', num: '08', title: '아웃라인·필 교차 밴드',
    summary: '-webkit-text-stroke 아웃라인 텍스트와 흰색 필 텍스트가 한 행 안에서 교대로 흐르고, 2행은 rotate(-2deg)로 기울어진 채 역방향으로 교차 — 룩북·이벤트 키비주얼의 그 밴드.',
    demo: {
      bodyHTML: '<div class="of-wrap">\n'
        + '  <p class="cap">OUTLINE × FILL — CROSS BAND</p>\n'
        + '  <div class="of-band of-row1">\n'
        + '    <div class="of-track js-anim">\n'
        + '      <div class="of-group">\n'
        + '        <span class="of-fill">모션이 곧 브랜드</span>\n'
        + '        <span class="of-line">INTERACTION LAB</span>\n'
        + '        <span class="of-fill">디자인을 움직임으로</span>\n'
        + '        <span class="of-line">MOTION FIRST</span>\n'
        + '      </div>\n'
        + '    </div>\n'
        + '  </div>\n'
        + '  <div class="of-band of-row2">\n'
        + '    <div class="of-track js-anim">\n'
        + '      <div class="of-group">\n'
        + '        <span class="of-line">인터랙션 랩</span>\n'
        + '        <span class="of-fill">MOTION FIRST</span>\n'
        + '        <span class="of-line">멈추지 않는 흐름</span>\n'
        + '        <span class="of-fill">INTERACTION LAB</span>\n'
        + '      </div>\n'
        + '    </div>\n'
        + '  </div>\n'
        + '</div>',
      css: '.of-wrap { width: 100%; overflow: hidden; padding: 28px 0; text-align: center; }\n'
        + '.of-band { overflow: hidden; width: 110vw; margin-left: -5vw; }\n'
        + '.of-row2 { transform: rotate(-2deg); margin-top: 12px; }\n'
        + '.of-track { display: flex; width: max-content; animation: of-scroll 28s linear infinite; will-change: transform; }\n'
        + '.of-row2 .of-track { animation-direction: reverse; animation-duration: 34s; }\n'
        + '.of-group { display: flex; align-items: center; flex: 0 0 auto; }\n'
        + '.of-group span { font: 900 clamp(34px,6vw,76px)/1.2 "Pretendard Variable",sans-serif; white-space: nowrap; padding: 0 26px; letter-spacing: 0.01em; }\n'
        + '.of-fill { color: #fff; }\n'
        + '.of-line { color: transparent; -webkit-text-stroke: 2px rgba(255,255,255,0.65); }\n'
        + '@keyframes of-scroll { to { transform: translateX(-50%); } }\n'
        + CAP_CSS,
      js: 'Array.prototype.forEach.call(document.querySelectorAll(".of-track"), function(track) {\n'
        + '  var clone = track.querySelector(".of-group").cloneNode(true);\n'
        + '  clone.setAttribute("aria-hidden", "true");\n'
        + '  track.appendChild(clone);\n'
        + '});',
      height: 480,
      loopSec: 28
    },
    snippetHTML: '<div class="of-band of-row1">\n  <div class="of-track">\n    <div class="of-group">\n      <span class="of-fill">모션이 곧 브랜드</span>\n      <span class="of-line">INTERACTION LAB</span>\n    </div>\n  </div>\n</div>\n<div class="of-band of-row2"> … </div>',
    snippetCSS: '.of-fill { color: #fff; }\n.of-line { color: transparent;\n           -webkit-text-stroke: 2px rgba(255,255,255,0.65); }\n/* 기울인 행 — 110vw 오버사이즈로 회전 모서리 공백 제거 */\n.of-band { overflow: hidden; width: 110vw; margin-left: -5vw; }\n.of-row2 { transform: rotate(-2deg); }\n.of-row2 .of-track { animation-direction: reverse;\n                     animation-duration: 34s; }',
    snippetJS: 'Array.prototype.forEach.call(\n  document.querySelectorAll(".of-track"),\n  function(track) {\n    var clone = track.querySelector(".of-group").cloneNode(true);\n    clone.setAttribute("aria-hidden", "true");\n    track.appendChild(clone);\n  }\n);',
    explain: '듀얼 디렉션의 타이포그래피 강화판. 같은 행 안에서 필(.of-fill)과 아웃라인(.of-line)이 교대로 배치되어 흐름 자체에 강·약 리듬이 생긴다 — 아웃라인은 color: transparent + -webkit-text-stroke 2px로 만든다. 2행은 rotate(-2deg)로 기울이는데, 회전하면 좌우 모서리에 배경이 드러나므로 밴드 폭을 110vw로 키우고 margin-left -5vw로 화면 밖까지 밀어 공백을 가린다. 역방향(reverse)·이속(28s/34s)까지 겹쳐 두 행이 가위처럼 교차하는 키비주얼이 완성된다.',
    kv: [
      { label: '의존성', value: 'CSS @keyframes ×2 + -webkit-text-stroke' },
      { label: '트리거', value: '로드 → 28s / 34s 역방향 교차 루프' },
      { label: '타이포', value: '필 #fff vs 아웃라인 stroke 2px 65% 교대' },
      { label: '기울임', value: '2행 rotate(-2deg) + 110vw 오버사이즈' },
      { label: '핵심', value: '한 행 안에서 질감 교대 + 행 간 방향·각도 대비' },
      { label: '참고', value: '패션 룩북 / 이벤트·드랍 키비주얼 밴드' }
    ],
    guide: '-webkit-text-stroke는 Firefox·Safari 포함 모든 evergreen에서 prefix 그대로 동작하지만 표준 속성이 아니므로, 지원이 불안한 환경에서는 아웃라인 span에 폴백 색상(color: rgba(255,255,255,0.4))을 함께 선언해 둘 것. stroke 두께는 폰트 크기의 2~3%가 적정 — 가는 폰트에 두꺼운 stroke를 주면 획이 뭉개진다. 기울기는 -1~-3°가 한계, 그 이상은 가독을 포기한 장식이 된다. 행당 글자 수가 많아 모바일에서는 폰트 크기를 과감히 줄여야 한다.',
    recommendations: [
      { place: '히어로 헤더', body: '드랍·캠페인 키비주얼 — 발매명이 교차하는 임팩트 인트로' },
      { place: '랜딩 페이지', body: '이벤트 섹션 — 기간·테마 문구를 기울여 반복' },
      { place: '제품 섹션', body: '컬렉션 네이밍 — 신제품 라인업 이름을 질감 교대로' },
      { place: '포트폴리오 소개', body: '셀프 브랜딩 밴드 — 이름과 태그라인의 교차 연출' }
    ],
    tradeoff: '장식성이 매우 강해 정보 전달은 사실상 0 — 브랜드 무드 연출 전용이다. 기울어진 행은 위아래 요소와의 시각 간섭이 커서 충분한 상하 여백(밴드 높이의 50% 이상)이 필요하다.'
  },

  // ── 09. drag-inertia ──
  {
    id: 'drag-inertia', num: '09', title: '드래그 관성',
    summary: '마퀴를 손으로 잡아 끌 수 있다 — pointerdown 드래그로 직접 스크럽하고, 놓으면 던진 속도 그대로 관성으로 미끄러진 뒤 감쇠 곡선을 타고 기본 자동 흐름(80px/s)으로 복귀한다. 오프셋 모듈러 래핑으로 어느 방향이든 무한.',
    demo: {
      bodyHTML: '<div class="dg-wrap">\n'
        + '  <p class="cap">DRAG INERTIA — GRAB THE BAND</p>\n'
        + '  <div class="dg-band">\n'
        + '    <div class="dg-track">\n'
        + '      <div class="dg-group">\n'
        + '        <span>잡아서 끌어보세요</span><i>✦</i>\n'
        + '        <span>관성으로 미끄러진다</span><i>✦</i>\n'
        + '        <span>그리고 다시 흐른다</span><i>✦</i>\n'
        + '      </div>\n'
        + '    </div>\n'
        + '  </div>\n'
        + '  <p class="note-sub">릴리즈 속도 ±2400px/s 클램프 → 기본 80px/s로 수렴</p>\n'
        + '</div>',
      css: '.dg-wrap { width: 100%; text-align: center; }\n'
        + '.dg-band { overflow: hidden; width: 100%; padding: 12px 0; cursor: grab; user-select: none; -webkit-user-select: none; touch-action: pan-y; }\n'
        + '.dg-band.is-drag { cursor: grabbing; }\n'
        + '.dg-track { display: flex; width: max-content; will-change: transform; }\n'
        + '.dg-group { display: flex; align-items: center; flex: 0 0 auto; }\n'
        + '.dg-group span { font: 800 clamp(34px,5.6vw,68px)/1.2 "Pretendard Variable",sans-serif; color: #fff; white-space: nowrap; padding: 0 26px; }\n'
        + '.dg-group i { font-style: normal; color: #8ab4ff; font-size: clamp(16px,2.2vw,28px); }\n'
        + CAP_CSS + '\n' + NOTE_CSS,
      js: 'var band = document.querySelector(".dg-band");\n'
        + 'var track = document.querySelector(".dg-track");\n'
        + 'var group = track.querySelector(".dg-group");\n'
        + 'var clone = group.cloneNode(true);\n'
        + 'clone.setAttribute("aria-hidden", "true");\n'
        + 'track.appendChild(clone);\n'
        + 'var BASE = 80;\n'
        + 'var offset = 0, vel = BASE, dragging = false;\n'
        + 'var lastX = 0, lastT = 0;\n'
        + 'band.addEventListener("pointerdown", function(e) {\n'
        + '  dragging = true;\n'
        + '  band.classList.add("is-drag");\n'
        + '  lastX = e.clientX; lastT = Date.now(); vel = 0;\n'
        + '  band.setPointerCapture(e.pointerId);\n'
        + '});\n'
        + 'band.addEventListener("pointermove", function(e) {\n'
        + '  if (!dragging) return;\n'
        + '  var now = Date.now();\n'
        + '  var dx = e.clientX - lastX;\n'
        + '  var mdt = Math.max(1, now - lastT);\n'
        + '  offset -= dx; // 드래그는 1:1 직결\n'
        + '  vel = Math.max(-2400, Math.min(2400, -dx / mdt * 1000)); // 릴리즈 속도\n'
        + '  lastX = e.clientX; lastT = now;\n'
        + '});\n'
        + 'function endDrag() { dragging = false; band.classList.remove("is-drag"); }\n'
        + 'band.addEventListener("pointerup", endDrag);\n'
        + 'band.addEventListener("pointercancel", endDrag);\n'
        + 'var last = Date.now();\n'
        + 'function tick() {\n'
        + '  var now = Date.now();\n'
        + '  var dt = Math.min(64, now - last);\n'
        + '  last = now;\n'
        + '  if (!dragging) {\n'
        + '    offset += vel * dt / 1000;\n'
        + '    vel += (BASE - vel) * Math.min(1, dt * 0.002); // 관성 감쇠 + 기본 복귀\n'
        + '  }\n'
        + '  var half = group.offsetWidth;\n'
        + '  if (half > 0) { offset = offset % half; if (offset < 0) offset += half; }\n'
        + '  track.style.transform = "translateX(" + (-offset) + "px)";\n'
        + '  setTimeout(tick, 16);\n'
        + '}\n'
        + 'setTimeout(tick, 16);\n'
        + 'var baseReset = window.__reset;\n'
        + 'window.__reset = function() { baseReset(); offset = 0; vel = BASE; last = Date.now(); };',
      height: 480,
      loopSec: 22,
      hint: '밴드를 잡고 끌어보세요'
    },
    snippetHTML: '<div class="dg-band">\n  <div class="dg-track">\n    <div class="dg-group">\n      <span>잡아서 끌어보세요</span><i>✦</i>\n      <span>관성으로 미끄러진다</span><i>✦</i>\n    </div>\n  </div>\n</div>',
    snippetCSS: '.dg-band {\n  overflow: hidden;\n  cursor: grab; user-select: none;\n  touch-action: pan-y; /* 세로 스크롤은 살리고 가로만 점유 */\n}\n.dg-band.is-drag { cursor: grabbing; }',
    snippetJS: '// 드래그 중: 포인터 1:1 직결 + 릴리즈 속도 기록\noffset -= dx;\nvel = Math.max(-2400, Math.min(2400, -dx / mdt * 1000));\n// 릴리즈 후: 관성 감쇠와 기본 흐름 복귀를 한 식으로\nif (!dragging) {\n  offset += vel * dt / 1000;\n  vel += (BASE - vel) * Math.min(1, dt * 0.002);\n}\n// 모듈러 래핑 — 어느 방향으로 던져도 무한\noffset = ((offset % half) + half) % half;\ntrack.style.transform = "translateX(" + (-offset) + "px)";',
    explain: '상태는 offset(px)과 vel(px/s) 둘뿐이다. 드래그 중에는 포인터 이동량을 offset에 1:1로 빼서 손에 붙는 감각을 만들고, 마지막 이동에서 순간 속도(-dx/dt×1000)를 ±2400px/s로 클램프해 기록한다. 놓는 순간부터 틱이 offset += vel×dt로 관성 활강을 잇고, vel += (BASE − vel)×dt×0.002 한 식이 감쇠와 기본 흐름 복귀를 동시에 처리한다 — 역방향으로 던졌어도 vel이 음수에서 BASE(+80)로 연속적으로 수렴하므로 어색한 방향 전환점이 없다. 오프셋은 ((offset % half) + half) % half 모듈러로 양방향 무한 래핑.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (Pointer Events + 관성 감쇠)' },
      { label: '트리거', value: 'pointerdown 드래그 → 릴리즈 관성 → 자동 복귀' },
      { label: '관성', value: '릴리즈 속도 ±2400px/s 클램프' },
      { label: '래핑', value: '((offset % half) + half) % half — 양방향 무한' },
      { label: '핵심', value: 'vel += (BASE − vel) × dt×0.002 한 식으로 감쇠+복귀' },
      { label: '참고', value: 'Framer 드래그 캐러셀 / Awwwards 갤러리 스트립' }
    ],
    guide: 'setPointerCapture로 포인터가 밴드를 벗어나도 드래그가 유지되게 하는 것이 손맛의 절반이다. touch-action: pan-y는 필수 — 없으면 모바일에서 가로 드래그가 세로 스크롤과 싸운다. 복귀 계수(0.002)를 줄이면 관성 여운이 길어지고, 키우면 금방 기본 흐름으로 돌아온다. 카드·이미지 트랙에 적용할 때는 드래그 거리 5px 이하를 클릭으로 판정하는 임계값을 둬 오클릭을 막을 것. 드래그가 곧 대체 입력이므로 reduced-motion에서도 자동 흐름만 끄고 드래그는 남겨두면 된다.',
    recommendations: [
      { place: '히어로 헤더', body: '인터랙티브 슬로건 — 첫 화면에서 만지작거리게 만드는 훅' },
      { place: '랜딩 페이지', body: '수상·후기 스트립 — 사용자가 직접 넘겨보는 증거 밴드' },
      { place: '제품 섹션', body: '기능 카드 스트립 — 관심 기능까지 던져서 이동' },
      { place: '포트폴리오 소개', body: '작업물 갤러리 — 드래그 손맛 자체가 포트폴리오' }
    ],
    tradeoff: '구현 복잡도가 카테고리 내 최상위이고, 드래그 가능함을 알리는 어포던스(cursor: grab, 힌트 문구)가 없으면 기능이 발견되지 않는다. 가로 드래그 영역이 넓으면 모바일 세로 스크롤 동선을 방해할 수 있다.'
  },

  // ── 10. ticker-bar ──
  {
    id: 'ticker-bar', num: '10', title: '뉴스 티커 바',
    summary: '사이트 공지 바 메타포 — 좌측 고정 BREAKING 라벨 + 우→좌로 흐르는 공지 항목. 항목에 hover하면 밑줄이 생기고 트랙이 일시정지되어 클릭을 보장한다. 라벨은 flex 고정, 뷰포트만 overflow hidden.',
    demo: {
      bodyHTML: '<div class="tk-wrap">\n'
        + '  <p class="cap">NEWS TICKER BAR — SITE NOTICE</p>\n'
        + '  <div class="tk-bar">\n'
        + '    <span class="tk-breaking">BREAKING</span>\n'
        + '    <div class="tk-view">\n'
        + '      <div class="tk-track js-anim">\n'
        + '        <div class="tk-group">\n'
        + '          <a class="tk-item" href="#">무한 마퀴 카테고리 10종 공개</a><i>·</i>\n'
        + '          <a class="tk-item" href="#">2026 모션 트렌드 리포트 발행</a><i>·</i>\n'
        + '          <a class="tk-item" href="#">디자인 시스템 v5.2 업데이트</a><i>·</i>\n'
        + '          <a class="tk-item" href="#">인터랙션 랩 뉴스레터 구독 오픈</a><i>·</i>\n'
        + '        </div>\n'
        + '      </div>\n'
        + '    </div>\n'
        + '  </div>\n'
        + '  <p class="note-sub">항목 hover 시 밑줄 + 트랙 일시정지 — 클릭 보장</p>\n'
        + '</div>',
      css: '.tk-wrap { width: min(860px, 94vw); margin: 0 auto; text-align: center; }\n'
        + '.tk-bar { display: flex; align-items: stretch; border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; overflow: hidden; background: #0d0d0d; }\n'
        + '.tk-breaking { flex: 0 0 auto; display: flex; align-items: center; padding: 0 16px; background: #e11d48; color: #fff; font: 800 11px/1 "Pretendard Variable",sans-serif; letter-spacing: 0.12em; }\n'
        + '.tk-view { flex: 1; overflow: hidden; display: flex; align-items: center; -webkit-mask-image: linear-gradient(90deg, transparent, #000 32px, #000 calc(100% - 32px), transparent); mask-image: linear-gradient(90deg, transparent, #000 32px, #000 calc(100% - 32px), transparent); }\n'
        + '.tk-track { display: flex; width: max-content; animation: tk-scroll 20s linear infinite; will-change: transform; }\n'
        + '.tk-view:hover .tk-track { animation-play-state: paused; }\n'
        + '.tk-group { display: flex; align-items: center; flex: 0 0 auto; }\n'
        + '.tk-item { font: 500 14px/1 "Pretendard Variable",sans-serif; color: rgba(255,255,255,0.8); text-decoration: none; padding: 15px 10px; white-space: nowrap; }\n'
        + '.tk-item:hover { color: #fff; text-decoration: underline; text-underline-offset: 4px; }\n'
        + '.tk-group i { color: rgba(255,255,255,0.3); font-style: normal; padding: 0 6px; }\n'
        + '@keyframes tk-scroll { to { transform: translateX(-50%); } }\n'
        + CAP_CSS + '\n' + NOTE_CSS,
      js: 'var track = document.querySelector(".tk-track");\n'
        + 'var clone = track.querySelector(".tk-group").cloneNode(true);\n'
        + 'clone.setAttribute("aria-hidden", "true");\n'
        + 'track.appendChild(clone);\n'
        + '// 데모용 — 항목 클릭 시 페이지 점프 방지\n'
        + 'Array.prototype.forEach.call(document.querySelectorAll(".tk-item"), function(a) {\n'
        + '  a.addEventListener("click", function(e) { e.preventDefault(); });\n'
        + '});',
      height: 480,
      loopSec: 20,
      hint: '항목에 마우스를 올려보세요'
    },
    snippetHTML: '<div class="tk-bar">\n  <span class="tk-breaking">BREAKING</span>\n  <div class="tk-view">\n    <div class="tk-track">\n      <div class="tk-group">\n        <a class="tk-item" href="/news/1">무한 마퀴 카테고리 10종 공개</a><i>·</i>\n        <a class="tk-item" href="/news/2">2026 모션 트렌드 리포트 발행</a><i>·</i>\n      </div>\n    </div>\n  </div>\n</div>',
    snippetCSS: '.tk-bar      { display: flex; }            /* 라벨 + 뷰포트 */\n.tk-breaking { flex: 0 0 auto; background: #e11d48; }\n.tk-view     { flex: 1; overflow: hidden; } /* 흐름은 여기만 */\n.tk-track    { display: flex; width: max-content;\n               animation: tk-scroll 20s linear infinite; }\n.tk-view:hover .tk-track { animation-play-state: paused; }\n.tk-item:hover { text-decoration: underline;\n                 text-underline-offset: 4px; }\n@keyframes tk-scroll { to { transform: translateX(-50%); } }',
    snippetJS: 'var track = document.querySelector(".tk-track");\nvar clone = track.querySelector(".tk-group").cloneNode(true);\nclone.setAttribute("aria-hidden", "true");\ntrack.appendChild(clone);',
    explain: '바를 flex로 2분할한다 — BREAKING 라벨은 flex: 0 0 auto로 좌측에 고정되고, 우측 뷰포트(.tk-view)만 overflow: hidden으로 흐름을 담는다. 마퀴 자체는 표준 2벌 복제 + translateX(-50%) 루프지만, 항목이 클릭 가능한 링크이므로 두 가지 보강이 들어간다: 뷰포트 hover 시 animation-play-state: paused로 트랙을 멈춰 조준을 보장하고, 항목 hover에 underline + 색상 상승으로 "링크"라는 어포던스를 명시한다. 뷰포트 양끝 32px mask 페이드가 라벨 경계와 우측 끝에서 텍스트가 잘리는 거친 단면을 정리한다.',
    kv: [
      { label: '의존성', value: 'CSS @keyframes + hover play-state (JS 복제 1줄)' },
      { label: '트리거', value: '로드 → 20s 루프 / 항목 hover → 밑줄 + 정지' },
      { label: '구조', value: 'BREAKING 라벨 flex 고정 + 우측 뷰포트만 흐름' },
      { label: '가독', value: '양끝 mask 32px + hover 일시정지로 클릭 보장' },
      { label: '핵심', value: '정지 라벨과 흐르는 항목의 역할 분리' },
      { label: '참고', value: '뉴스 사이트 속보 바 / 프로모션 공지 바' }
    ],
    guide: '클릭 가능한 마퀴의 철칙은 "hover 시 반드시 멈춘다" — 움직이는 표적을 조준시키는 것은 Fitts 법칙 위반이다. 항목 수는 3~6개가 적정이며 각 항목은 한 줄 요약(20자 이내)으로 유지할 것. 실서비스에서는 페이지 최상단 sticky로 붙이고 닫기 버튼을 제공하는 것이 관례다. 같은 공지를 반복 노출하므로 진짜 긴급 공지에만 BREAKING 톤(빨강)을 쓰고 평시에는 중립색으로 낮출 것. 스크린리더에는 role="marquee" 대신 일반 링크 목록 + 복제분 aria-hidden이 안전하다.',
    recommendations: [
      { place: '히어로 헤더', body: '헤더 상단 공지 바 — 신기능·이벤트를 첫 화면에서 고지' },
      { place: '랜딩 페이지', body: '프로모션 티커 — 할인 마감·잔여 좌석 등 긴급성 전달' },
      { place: '제품 섹션', body: '릴리즈 노트 바 — 최신 배포 소식을 흘려보내기' },
      { place: '포트폴리오 소개', body: '근황 티커 — 최근 수상·전시·발행 소식 한 줄 순환' }
    ],
    tradeoff: '흐르는 링크는 정적 링크보다 클릭율이 낮고 접근성 부담이 크다 — 핵심 공지는 반드시 다른 정적 경로로도 제공할 것. BREAKING 같은 긴급 톤을 남용하면 사용자가 빠르게 학습하고 무시한다.'
  }
];

/* ================================================================
   Standalone demo HTML 빌더 (CSS 무한 루프 + ↻ 다시 보기 = 재시작)
   ================================================================ */

function buildDemoHTML(p) {
  var loopSec = p.demo.loopSec || 24;
  var hint = p.demo.hint || '무한 루프 재생 · ↻ 다시 보기';
  return '<!DOCTYPE html>\n'
    + '<html lang="ko">\n'
    + '<head>\n'
    + '  <meta charset="UTF-8">\n'
    + '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
    + '  <title>' + p.num + '. ' + p.title + ' — Infinite Marquee Demo</title>\n'
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
    + '    .demo-progress > div { height: 100%; background: #fff; width: 0; animation: demo-loop ' + loopSec + 's linear infinite; }\n'
    + '    @keyframes demo-loop { from { width: 0; } to { width: 100%; } }\n'
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
    + '      // ↻ 다시 보기 = CSS 애니메이션 재시작 (animation:none → reflow → 재부여)\n'
    + '      function restartCssAnims() {\n'
    + '        var els = document.querySelectorAll(".js-anim, .demo-progress > div");\n'
    + '        Array.prototype.forEach.call(els, function(el) {\n'
    + '          el.style.animation = "none";\n'
    + '          void el.offsetWidth; // reflow 강제\n'
    + '          el.style.animation = "";\n'
    + '        });\n'
    + '      }\n'
    + '      window.__reset = restartCssAnims;\n'
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
        embed: 'demos/infinite-marquee/' + p.id + '.html',
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
      { type: 'heading', value: '무한 마퀴 — 멈추지 않고 흐르는 10종 루프 밴드' },
      { type: 'text', value: CATEGORY.summary },
      { type: 'heading', value: '10 패턴 인덱스' },
      { type: 'structure', items: indexItems },
      { type: 'heading', value: '공통 디자인 토큰' },
      {
        type: 'kv', columns: 2, items: [
          { label: '폰트', value: 'Pretendard Variable 500~900' },
          { label: '배경', value: '#000 (linear.app 실측 rgb(8,9,10) 다크 톤 차용)' },
          { label: '루프 원리', value: '콘텐츠 2벌 복제 + translateX(0→-50%) = 무한 심리스' },
          { label: '듀레이션', value: '18~40s linear (텍스트 24s / 로고 28s / 이미지 32s)' },
          { label: '가장자리 페이드', value: 'mask-image linear-gradient 80px (로고월·티커 바)' },
          { label: '액센트', value: '#8ab4ff (구분자·시간) / #e11d48 (BREAKING) / #4ade80 (LIVE)' },
          { label: '애니메이션 모델', value: 'CSS @keyframes 무한 루프 + JS 틱 3종 (호버 슬로우·스크롤 속도·드래그)' },
          { label: '참고 실측', value: 'linear.app — 무한루프 애니메이션 요소 206개 · 버튼 transition 0.1s cubic-bezier(0.25,0.46,0.45,0.94)' }
        ]
      },
      { type: 'heading', value: '읽기 가이드' },
      {
        type: 'structure', items: [
          { label: '라이브 데모', tag: 'IFRAME', desc: 'demos/infinite-marquee/{pattern}.html — 로드 즉시 무한 루프 + ↻ 다시 보기(애니메이션 재시작)' },
          { label: '작동 원리', tag: 'HOW', desc: '2벌 복제 심리스 조건 / 방향·속도 변주 / JS 틱 보간 메커니즘' },
          { label: '정량 메타', tag: 'KV', desc: '의존성 / 트리거 / 듀레이션·속도 / 핵심 메커니즘' },
          { label: '코드 스니펫', tag: 'CODE', desc: 'HTML / CSS / JS — 패턴별 핵심 코드' },
          { label: '사용 가이드', tag: 'GUIDE', desc: '속도·페이드·접근성(prefers-reduced-motion) 주의점' },
          { label: '활용 추천', tag: 'PLACES', desc: '히어로 / 랜딩 / 제품 / 포트폴리오 4건' },
          { label: '트레이드오프', tag: 'NOTE', desc: '시선 간섭·접근성 부담·권장 사용처' }
        ]
      },
      {
        type: 'note',
        value: '텍스트 루프(콘텐츠 2벌 복제 + translateX -50% linear 무한)를 시그니처로 재현하고, 로고 월·듀얼 디렉션·호버 슬로우·스크롤 속도 반응·세로 티커·이미지 스트립·아웃라인 교차 밴드·드래그 관성·뉴스 티커 바 9종 변형을 비교 카탈로그로 정리. 모든 데모는 검정 배경(#000) + Pretendard Variable + 한국어 카피 + 로드 즉시 무한 루프(↻ 다시 보기 = 애니메이션 재시작). 04·05·09만 setTimeout 16ms + Date.now() 델타의 JS 틱 구동, 나머지 7종은 CSS @keyframes 단독.'
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
    console.log('✓ demos/infinite-marquee/' + p.id + '.html');
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
  console.log('✓ analyses/infinite-marquee/analysis.json');
  console.log('  ' + PATTERNS.length + ' patterns + 1 overview = ' + (PATTERNS.length + 1) + ' sections');
  var totalBlocks = Object.values(sections).reduce(function (acc, s) { return acc + s.blocks.length; }, 0);
  console.log('  ' + totalBlocks + ' blocks total');
}

main();
