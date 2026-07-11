#!/usr/bin/env node
/**
 * Web Reference Lab — Category Generator: 애니메이티드 탭 (v1)
 * stripe.com 제품 페이지 탭 표준 참고 — 10종 애니메이티드 탭 인터랙션 카탈로그
 *
 * - 클릭 전환 인터랙션 (탭 3~4개 + 콘텐츠 패널: 한국어 카피 + 미니 그라디언트 아트워크)
 * - 인디케이터 표준 기법: offsetLeft/offsetWidth 측정 → transform(translateX)+width 보간
 * - 검정 배경(#000) + Pretendard Variable + 한국어 라벨
 * - ↻ 다시 보기 = 첫 탭으로 초기화 (window.__reset)
 *
 * Usage: node scripts/generate-animated-tabs.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ANALYSIS_DIR = join(ROOT, 'analyses', 'animated-tabs');
const ANALYSIS_FILE = join(ANALYSIS_DIR, 'analysis.json');
const DEMO_DIR = join(ROOT, 'demos', 'animated-tabs');

const CATEGORY = {
  id: 'animated-tabs',
  title: '애니메이티드 탭',
  type: 'category',
  date: '2026-06-10',
  url: 'https://stripe.com',
  summary: '활성 인디케이터가 미끄러지듯 따라오는 탭 전환 10종. 슬라이딩 필·언더라인 슬라이드·콘텐츠 크로스페이드·호버 스포트라이트·버티컬 레일·카운트 뱃지·아이콘 팝·가변 폭 필·패널 방향 슬라이드·오토 프로그레스 — SaaS 제품 페이지·설정 화면·가격표 토글의 표준 내비게이션 문법을 비교 카탈로그로 정리. 인디케이터 위치·폭은 offsetLeft/offsetWidth 측정 후 transform·width를 260~320ms cubic-bezier(0.4,0,0.2,1)로 보간하는 것이 표준 기법이며, resize·폰트 로드 후 재측정이 필수다. 모든 데모는 자동 재생이 아니라 사용자가 탭을 클릭할 때 전환되는 인터랙티브 데모(10번 오토 프로그레스만 히어로 캐러셀 문법으로 예외). ↻ 다시 보기는 첫 탭으로 초기화한다.'
};

/* ================================================================
   탭 콘텐츠 세트 (탭 3~4개 + 패널: 한국어 카피 + 그라디언트 아트)
   ================================================================ */

const SAAS = [
  { label: '개요', title: '한눈에 보는 대시보드', body: '제품의 핵심 지표를 실시간으로 모아 보여줍니다. 팀 전체가 같은 화면을 보며 의사결정을 내릴 수 있습니다.', art: 'linear-gradient(135deg,#6366f1 0%,#a855f7 100%)' },
  { label: '기능', title: '모듈형 워크플로', body: '자동화 규칙부터 권한 관리까지 필요한 기능만 골라 켤 수 있습니다. 설정은 전부 코드 없이 끝납니다.', art: 'linear-gradient(135deg,#06b6d4 0%,#3b82f6 100%)' },
  { label: '요금', title: '쓴 만큼만 청구', body: '종량제와 고정 요금제 중 선택할 수 있고, 14일 무료 체험 동안 모든 기능이 열립니다.', art: 'linear-gradient(135deg,#f59e0b 0%,#ef4444 100%)' },
  { label: '문의', title: '24시간 안에 답변', body: '도입 상담과 기술 지원 모두 채팅과 이메일로 받습니다. 평일 기준 24시간 안에 답변드립니다.', art: 'linear-gradient(135deg,#10b981 0%,#14b8a6 100%)' }
];

const SETTINGS = [
  { label: '프로필', title: '프로필 설정', body: '이름·아바타·소개를 수정합니다. 변경 사항은 저장 즉시 팀 전체 워크스페이스에 반영됩니다.', art: 'linear-gradient(135deg,#6366f1 0%,#a855f7 100%)' },
  { label: '알림', title: '알림 설정', body: '채널별로 알림 수준을 조절합니다. 방해 금지 시간을 지정하면 그동안의 알림은 요약으로 모아 받습니다.', art: 'linear-gradient(135deg,#06b6d4 0%,#3b82f6 100%)' },
  { label: '보안', title: '보안 설정', body: '2단계 인증과 로그인 기록을 관리합니다. 의심스러운 접속은 즉시 이메일로 알려드립니다.', art: 'linear-gradient(135deg,#f59e0b 0%,#ef4444 100%)' },
  { label: '결제', title: '결제 설정', body: '카드 정보와 청구서 수신 이메일을 관리합니다. 영수증은 매월 1일 자동으로 발송됩니다.', art: 'linear-gradient(135deg,#10b981 0%,#14b8a6 100%)' }
];

const WORK = [
  { label: '전체', n: 24, title: '모든 작업 24건', body: '이번 스프린트에 등록된 전체 작업입니다. 마감일 순으로 정렬되어 가장 급한 일이 먼저 보입니다.', art: 'linear-gradient(135deg,#6366f1 0%,#a855f7 100%)' },
  { label: '진행 중', n: 8, title: '진행 중 8건', body: '지금 누군가 작업하고 있는 항목입니다. 담당자 아바타와 마지막 업데이트 시각이 함께 표시됩니다.', art: 'linear-gradient(135deg,#06b6d4 0%,#3b82f6 100%)' },
  { label: '완료', n: 12, title: '완료 12건', body: '이번 주에 닫힌 작업입니다. 완료 항목은 7일 뒤 자동으로 아카이브로 이동합니다.', art: 'linear-gradient(135deg,#10b981 0%,#14b8a6 100%)' },
  { label: '보류', n: 4, title: '보류 4건', body: '외부 응답을 기다리는 작업입니다. 보류 사유와 재개 예정일을 메모로 남길 수 있습니다.', art: 'linear-gradient(135deg,#f59e0b 0%,#ef4444 100%)' }
];

const NAV = [
  { label: '홈', title: '서비스 홈', body: '브랜드 메시지와 핵심 CTA가 모인 첫 화면입니다. 라벨이 가장 짧은 탭으로 필 폭이 최소가 됩니다.', art: 'linear-gradient(135deg,#6366f1 0%,#a855f7 100%)' },
  { label: '제품 기능', title: '제품 기능 살펴보기', body: '핵심 기능 6가지를 카드 그리드로 소개합니다. 중간 길이 라벨 — 필 폭이 한 단계 늘어납니다.', art: 'linear-gradient(135deg,#06b6d4 0%,#3b82f6 100%)' },
  { label: '고객 사례 모음', title: '고객 사례 모음', body: '업종별 도입 사례와 성과 지표를 모았습니다. 가장 긴 라벨로 필 폭 모핑이 가장 크게 보입니다.', art: 'linear-gradient(135deg,#f59e0b 0%,#ef4444 100%)' },
  { label: '문의', title: '도입 문의', body: '팀 규모와 요구 사항을 남기면 영업팀이 연락드립니다. 다시 짧은 라벨로 필이 수축합니다.', art: 'linear-gradient(135deg,#10b981 0%,#14b8a6 100%)' }
];

const SHOWCASE = [
  { label: '디자인', title: '01 디자인', body: '컴포넌트 라이브러리에서 블록을 끌어다 화면을 조립합니다. 디자인 토큰은 코드와 자동 동기화됩니다.', art: 'linear-gradient(135deg,#6366f1 0%,#a855f7 100%)' },
  { label: '개발', title: '02 개발', body: '디자인이 곧 코드입니다. 변경 사항은 풀 리퀘스트로 만들어져 리뷰 후 머지됩니다.', art: 'linear-gradient(135deg,#06b6d4 0%,#3b82f6 100%)' },
  { label: '배포', title: '03 배포', body: '머지하면 프리뷰 환경에 즉시 배포됩니다. 롤백은 클릭 한 번으로 끝납니다.', art: 'linear-gradient(135deg,#f59e0b 0%,#ef4444 100%)' },
  { label: '분석', title: '04 분석', body: '배포 후 전환율과 성능 지표를 자동 수집합니다. 이상 징후는 슬랙으로 바로 알려드립니다.', art: 'linear-gradient(135deg,#10b981 0%,#14b8a6 100%)' }
];

// 아이콘 팝 탭용 인라인 SVG (lucide 계열 stroke 아이콘 — 외부 의존성 없음)
const SVG_OPEN = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">';
const ICONS = [
  SVG_OPEN + '<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>',
  SVG_OPEN + '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
  SVG_OPEN + '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  SVG_OPEN + '<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>'
];

/* ================================================================
   HTML 빌더 헬퍼
   ================================================================ */

function tabBtns(set, inner) {
  return set.map(function (c, i) {
    var content = inner ? inner(c, i) : c.label;
    return '    <button class="tab" id="tab-' + i + '" role="tab" aria-selected="' + (i === 0 ? 'true' : 'false') + '" aria-controls="panel-' + i + '">' + content + '</button>';
  }).join('\n');
}

function tablistHTML(set, opts) {
  opts = opts || {};
  var indicators = opts.indicators || '';
  var orient = opts.vertical ? ' aria-orientation="vertical"' : '';
  return '<div class="tablist" role="tablist" aria-label="' + (opts.label || '콘텐츠 탭') + '"' + orient + '>\n'
    + (indicators ? '    ' + indicators + '\n' : '')
    + tabBtns(set, opts.inner) + '\n  </div>';
}

function panelsHTML(set, opts) {
  opts = opts || {};
  var inner = set.map(function (c, i) {
    var hidden = (opts.track || opts.stack) ? '' : (i === 0 ? '' : ' hidden');
    return '    <div class="panel" id="panel-' + i + '" role="tabpanel" aria-labelledby="tab-' + i + '"' + hidden + '>\n'
      + '      <div class="panel-art" style="background:' + c.art + '"></div>\n'
      + '      <h2 class="panel-title">' + c.title + '</h2>\n'
      + '      <p class="panel-body">' + c.body + '</p>\n'
      + '    </div>';
  }).join('\n');
  if (opts.track) {
    return '<div class="panels">\n    <div class="track">\n' + inner + '\n    </div>\n  </div>';
  }
  return '<div class="panels">\n' + inner + '\n  </div>';
}

/* ================================================================
   공통 CSS / 공통 JS 코어
   ================================================================ */

const BASE_CSS = ''
  + '.stage {\n'
  + '  min-height: 100vh; display: flex; flex-direction: column;\n'
  + '  align-items: center; justify-content: center;\n'
  + '  gap: 28px; padding: 64px 24px 48px;\n'
  + '}\n'
  + '.tablist { position: relative; display: inline-flex; align-items: center; }\n'
  + '.tab {\n'
  + '  position: relative; z-index: 1; appearance: none; border: 0; background: transparent;\n'
  + '  cursor: pointer; font: 600 14px/1 "Pretendard Variable","Pretendard",sans-serif;\n'
  + '  color: rgba(255,255,255,0.55); padding: 10px 18px; border-radius: 999px;\n'
  + '  transition: color 0.18s ease; -webkit-tap-highlight-color: transparent;\n'
  + '}\n'
  + '.tab:hover { color: rgba(255,255,255,0.85); }\n'
  + '.tab[aria-selected="true"] { color: #fff; }\n'
  + '.panels { position: relative; width: min(520px, 88vw); }\n'
  + '.panel {\n'
  + '  background: rgba(255,255,255,0.045); border: 1px solid rgba(255,255,255,0.09);\n'
  + '  border-radius: 16px; padding: 22px;\n'
  + '}\n'
  + '.panel[hidden] { display: none; }\n'
  + '.panel-art { height: 110px; border-radius: 10px; margin: 0 0 16px; }\n'
  + '.panel-title { margin: 0 0 8px; font: 700 17px/1.35 "Pretendard Variable","Pretendard",sans-serif; color: #fff; letter-spacing: -0.01em; }\n'
  + '.panel-body { margin: 0; font: 400 14px/1.7 "Pretendard Variable","Pretendard",sans-serif; color: rgba(255,255,255,0.62); }\n';

// 패턴 JS는 update(i, prev)만 정의하면 된다. (함수 선언 호이스팅으로 순서 무관)
const JS_CORE = ''
  + 'var tabs = [].slice.call(document.querySelectorAll(".tab"));\n'
  + 'var panels = [].slice.call(document.querySelectorAll(".panel"));\n'
  + 'var current = 0;\n'
  + 'function showPanel(i){ panels.forEach(function(pn, j){ pn.hidden = j !== i; }); }\n'
  + 'function select(i){\n'
  + '  var prev = current; current = i;\n'
  + '  tabs.forEach(function(t, j){ t.setAttribute("aria-selected", j === i ? "true" : "false"); });\n'
  + '  update(i, prev);\n'
  + '}\n'
  + 'tabs.forEach(function(t, i){ t.addEventListener("click", function(){ select(i); }); });\n'
  + 'document.querySelector(".tablist").addEventListener("keydown", function(e){\n'
  + '  var dir = (e.key === "ArrowRight" || e.key === "ArrowDown") ? 1 : ((e.key === "ArrowLeft" || e.key === "ArrowUp") ? -1 : 0);\n'
  + '  if (!dir) return;\n'
  + '  e.preventDefault();\n'
  + '  var n = (current + dir + tabs.length) % tabs.length;\n'
  + '  select(n); tabs[n].focus();\n'
  + '});\n'
  + 'window.addEventListener("resize", function(){ update(current, current); });\n'
  + 'window.__reset = function(){ select(0); };\n'
  + 'select(0);';

// 패널 페이드 교체 (re-trigger 가능한 keyframe 방식)
const FADE_CSS = ''
  + '.panel-in { animation: panel-in 220ms cubic-bezier(0.4,0,0.2,1) both; }\n'
  + '@keyframes panel-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }';

const FADE_SWAP_JS = ''
  + 'function swapPanel(i){\n'
  + '  panels.forEach(function(pn, j){ pn.hidden = j !== i; pn.classList.remove("panel-in"); });\n'
  + '  void panels[i].offsetWidth;\n'
  + '  panels[i].classList.add("panel-in");\n'
  + '}';

/* ================================================================
   10 패턴 정의
   ================================================================ */

const PATTERNS = [
  // ───────────────────────────── 1. sliding-pill (시그니처)
  {
    id: 'sliding-pill',
    num: '01',
    title: '슬라이딩 필 (시그니처)',
    tag: 'rect 측정 → transform·width 보간',
    summary: '활성 탭 뒤의 필(알약) 배경이 offsetLeft·offsetWidth 측정값으로 미끄러지는 세그먼티드 컨트롤. iOS 세그먼트·Linear·Stripe가 공유하는 애니메이티드 탭의 현대 표준으로, 인디케이터를 별도 엘리먼트로 두고 transform과 width만 보간하므로 탭 수·라벨 길이가 바뀌어도 측정 한 번으로 정확히 따라온다.',
    demo: {
      hint: '탭을 클릭해보세요',
      bodyHTML: tablistHTML(SAAS, { label: '제품 안내 탭', indicators: '<span class="pill" aria-hidden="true"></span>' })
        + '\n  ' + panelsHTML(SAAS),
      css: ''
        + '.tablist { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); border-radius: 999px; padding: 4px; }\n'
        + '.pill { position: absolute; top: 4px; left: 0; width: 0; height: calc(100% - 8px); border-radius: 999px; background: #fff; transition: transform 280ms cubic-bezier(0.4,0,0.2,1), width 280ms cubic-bezier(0.4,0,0.2,1); will-change: transform, width; }\n'
        + '.tab[aria-selected="true"] { color: #0a0a0a; }\n'
        + '.tab[aria-selected="true"]:hover { color: #0a0a0a; }\n'
        + FADE_CSS,
      js: ''
        + 'var pill = document.querySelector(".pill");\n'
        + 'function movePill(i){\n'
        + '  var t = tabs[i];\n'
        + '  pill.style.transform = "translateX(" + t.offsetLeft + "px)";\n'
        + '  pill.style.width = t.offsetWidth + "px";\n'
        + '}\n'
        + 'function update(i, prev){ movePill(i); swapPanel(i); }\n'
        + 'if (document.fonts) document.fonts.ready.then(function(){ movePill(current); });\n'
        + FADE_SWAP_JS,
      height: 480
    },
    snippetHTML: '<div class="tablist" role="tablist" aria-label="제품 안내">\n'
      + '  <span class="pill" aria-hidden="true"></span>\n'
      + '  <button class="tab" role="tab" aria-selected="true" aria-controls="panel-0">개요</button>\n'
      + '  <button class="tab" role="tab" aria-selected="false" aria-controls="panel-1">기능</button>\n'
      + '  <button class="tab" role="tab" aria-selected="false" aria-controls="panel-2">요금</button>\n'
      + '</div>\n'
      + '<div class="panel" id="panel-0" role="tabpanel">…</div>',
    snippetCSS: '.tablist { position: relative; display: inline-flex; padding: 4px; background: rgba(0,0,0,0.06); border-radius: 999px; }\n'
      + '.tab { position: relative; z-index: 1; border: 0; background: none; padding: 10px 18px; border-radius: 999px; cursor: pointer; transition: color 180ms ease; }\n'
      + '.tab[aria-selected="true"] { color: #0a0a0a; }\n'
      + '/* 인디케이터는 별도 엘리먼트 — transform·width만 보간 */\n'
      + '.pill { position: absolute; top: 4px; left: 0; height: calc(100% - 8px); border-radius: 999px; background: #fff;\n'
      + '        transition: transform 280ms cubic-bezier(0.4,0,0.2,1), width 280ms cubic-bezier(0.4,0,0.2,1); }',
    snippetJS: 'var tabs = [].slice.call(document.querySelectorAll(".tab"));\n'
      + 'var pill = document.querySelector(".pill");\n'
      + 'var current = 0;\n'
      + 'function movePill(i){\n'
      + '  var t = tabs[i];                              // 측정: offsetLeft / offsetWidth\n'
      + '  pill.style.transform = "translateX(" + t.offsetLeft + "px)";\n'
      + '  pill.style.width = t.offsetWidth + "px";\n'
      + '}\n'
      + 'function select(i){\n'
      + '  current = i;\n'
      + '  tabs.forEach(function(t, j){ t.setAttribute("aria-selected", j === i ? "true" : "false"); });\n'
      + '  movePill(i);\n'
      + '}\n'
      + 'tabs.forEach(function(t, i){ t.addEventListener("click", function(){ select(i); }); });\n'
      + '// 키보드 ←→ 접근성 (role="tablist" 컨테이너에서)\n'
      + 'document.querySelector(".tablist").addEventListener("keydown", function(e){\n'
      + '  var dir = e.key === "ArrowRight" ? 1 : (e.key === "ArrowLeft" ? -1 : 0);\n'
      + '  if (!dir) return;\n'
      + '  e.preventDefault();\n'
      + '  var n = (current + dir + tabs.length) % tabs.length;\n'
      + '  select(n); tabs[n].focus();\n'
      + '});\n'
      + '// 리사이즈·폰트 로드 후 재측정 필수\n'
      + 'window.addEventListener("resize", function(){ movePill(current); });\n'
      + 'if (document.fonts) document.fonts.ready.then(function(){ movePill(current); });\n'
      + 'select(0);',
    explain: '인디케이터(필)를 탭 버튼과 분리된 absolute 엘리먼트로 두고, 클릭된 탭의 offsetLeft·offsetWidth를 측정해 transform: translateX()와 width에 그대로 적용한다. 위치·폭이 모두 transition을 타므로 필이 "미끄러지며 늘었다 줄어드는" 시그니처 모션이 된다. left 대신 transform을 쓰는 이유는 레이아웃 리플로 없이 컴포지터에서 처리되기 때문. 라벨 길이·탭 수·폰트가 바뀌어도 측정 기반이라 코드 수정이 필요 없고, 대신 window resize와 웹폰트 로드 완료(document.fonts.ready) 시점에 재측정해야 어긋나지 않는다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (측정 + 인라인 스타일)' },
      { label: '트리거', value: '탭 클릭 + 키보드 ← →' },
      { label: '측정', value: 'offsetLeft · offsetWidth → translateX + width' },
      { label: '전환 시간', value: '280ms cubic-bezier(0.4,0,0.2,1)' },
      { label: '재측정', value: 'window resize + document.fonts.ready' },
      { label: '시그니처', value: 'iOS 세그먼티드 / Linear / Stripe 가격표' }
    ],
    guide: '탭 3~5개의 세그먼티드 컨트롤에 가장 잘 맞는다. 전환 시간은 260~320ms가 체감 균형점 — 실측 참고로 linear.app은 버튼류에 0.1s cubic-bezier(0.25,0.46,0.45,0.94)의 더 빠른 톤을 쓴다. 필 색이 밝으면 활성 탭 글자색을 어둡게 반전시켜야 대비가 산다(aria-selected 셀렉터로 처리). 접근성은 role="tablist"/"tab"/"tabpanel" + aria-selected + 화살표 키 이동이 표준 세트.',
    recommendations: [
      { place: '히어로 헤더', body: '히어로 바로 아래 "월간/연간" 가격 토글 — 필이 미끄러지는 순간 가격 숫자도 함께 교체' },
      { place: '랜딩 페이지', body: '"개인/팀/기업" 대상별 메시지 전환 — 세그먼트 폭이 좁아 헤드라인 옆에도 배치 가능' },
      { place: '제품 섹션', body: '기능 카테고리 전환(개요/기능/요금/문의) — Stripe 제품 페이지의 표준 문법' },
      { place: '포트폴리오 소개', body: '"전체/브랜딩/웹" 작업 필터 — 필터 전환과 그리드 재정렬을 동시에' }
    ],
    tradeoff: '측정 기반이라 resize·폰트 로드·탭 동적 추가 시 재측정을 빠뜨리면 인디케이터가 어긋난다. 첫 페인트 직전에 측정하면 웹폰트 적용 전 폭이 잡히므로 document.fonts.ready 후 한 번 더 호출할 것. prefers-reduced-motion에서는 transition을 끄고 즉시 점프가 안전.'
  },

  // ───────────────────────────── 2. underline-slide
  {
    id: 'underline-slide',
    num: '02',
    title: '언더라인 슬라이드',
    tag: '2px 바 translateX+width',
    summary: '활성 탭 아래 2px 언더라인이 좌표와 폭을 측정해 미끄러지는 패턴. 필보다 시각 무게가 가벼워 콘텐츠가 주인공인 문서·제품 상세 페이지에 어울린다. 콘텐츠 패널은 언더라인 이동과 동시에 220ms 페이드로 교체된다.',
    demo: {
      hint: '탭을 클릭해보세요',
      bodyHTML: tablistHTML(SHOWCASE, { label: '워크플로 탭', indicators: '<span class="bar" aria-hidden="true"></span>' })
        + '\n  ' + panelsHTML(SHOWCASE),
      css: ''
        + '.tablist { gap: 4px; padding: 0 2px; border-radius: 0; border-bottom: 1px solid rgba(255,255,255,0.12); }\n'
        + '.tab { border-radius: 8px 8px 0 0; padding: 13px 14px; }\n'
        + '.bar { position: absolute; bottom: -1px; left: 0; width: 0; height: 2px; border-radius: 1px; background: #fff; transition: transform 260ms cubic-bezier(0.4,0,0.2,1), width 260ms cubic-bezier(0.4,0,0.2,1); }\n'
        + FADE_CSS,
      js: ''
        + 'var bar = document.querySelector(".bar");\n'
        + 'function moveBar(i){\n'
        + '  var t = tabs[i];\n'
        + '  bar.style.transform = "translateX(" + t.offsetLeft + "px)";\n'
        + '  bar.style.width = t.offsetWidth + "px";\n'
        + '}\n'
        + 'function update(i, prev){ moveBar(i); swapPanel(i); }\n'
        + 'if (document.fonts) document.fonts.ready.then(function(){ moveBar(current); });\n'
        + FADE_SWAP_JS,
      height: 480
    },
    snippetHTML: '<div class="tablist" role="tablist" aria-label="워크플로">\n'
      + '  <span class="bar" aria-hidden="true"></span>\n'
      + '  <button class="tab" role="tab" aria-selected="true" aria-controls="panel-0">디자인</button>\n'
      + '  <button class="tab" role="tab" aria-selected="false" aria-controls="panel-1">개발</button>\n'
      + '  <button class="tab" role="tab" aria-selected="false" aria-controls="panel-2">배포</button>\n'
      + '</div>\n'
      + '<div class="panel" id="panel-0" role="tabpanel">…</div>',
    snippetCSS: '.tablist { position: relative; display: inline-flex; gap: 4px; border-bottom: 1px solid rgba(0,0,0,0.12); }\n'
      + '.tab { border: 0; background: none; padding: 13px 14px; cursor: pointer; transition: color 180ms ease; }\n'
      + '.bar { position: absolute; bottom: -1px; left: 0; height: 2px; background: currentColor;\n'
      + '       transition: transform 260ms cubic-bezier(0.4,0,0.2,1), width 260ms cubic-bezier(0.4,0,0.2,1); }\n'
      + '/* 패널 페이드 교체 (re-trigger용 keyframe) */\n'
      + '.panel-in { animation: panel-in 220ms cubic-bezier(0.4,0,0.2,1) both; }\n'
      + '@keyframes panel-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }',
    snippetJS: 'var bar = document.querySelector(".bar");\n'
      + 'function moveBar(i){\n'
      + '  var t = tabs[i];\n'
      + '  bar.style.transform = "translateX(" + t.offsetLeft + "px)";\n'
      + '  bar.style.width = t.offsetWidth + "px";\n'
      + '}\n'
      + 'function swapPanel(i){\n'
      + '  panels.forEach(function(pn, j){ pn.hidden = j !== i; pn.classList.remove("panel-in"); });\n'
      + '  void panels[i].offsetWidth;          // reflow로 keyframe 재시작\n'
      + '  panels[i].classList.add("panel-in");\n'
      + '}\n'
      + 'function select(i){\n'
      + '  tabs.forEach(function(t, j){ t.setAttribute("aria-selected", j === i ? "true" : "false"); });\n'
      + '  moveBar(i); swapPanel(i);\n'
      + '}\n'
      + 'window.addEventListener("resize", function(){ moveBar(current); });',
    explain: '메커니즘은 슬라이딩 필과 동일한 측정→보간이지만 인디케이터가 하단 2px 바로 축소된 형태. 탭 행 전체에 border-bottom 1px을 깔고 그 위(-1px)에 바를 겹쳐 트랙 위를 달리는 인상을 만든다. 콘텐츠 패널은 hidden 토글 + panel-in 키프레임 클래스를 reflow로 재시작시켜 매 전환마다 6px 떠오르는 페이드를 다시 재생한다. 언더라인은 활성 위치를 가리키는 역할만 하므로 본문 대비를 해치지 않는 것이 장점.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (측정 + 인라인 스타일)' },
      { label: '트리거', value: '탭 클릭 + 키보드 ← →' },
      { label: '측정', value: 'offsetLeft · offsetWidth → translateX + width' },
      { label: '전환 시간', value: '바 260ms / 패널 페이드 220ms' },
      { label: '인디케이터', value: '2px 바, border-bottom 트랙 위 -1px 겹침' },
      { label: '시그니처', value: 'stripe.com 제품 페이지 / Material Tabs / 브라우저 탭' }
    ],
    guide: '탭이 4개 이상이거나 라벨이 길어 세그먼티드 필이 무거워 보일 때 선택한다. 바 두께는 2~3px, 색은 본문 강조색 1개로 통일. 탭 hover 시 글자색만 미리 밝아지게 하면(인디케이터는 이동하지 않음) 클릭 전 피드백이 생긴다. 패널 페이드는 150~250ms로 짧게 — 바 이동(260ms)보다 길어지면 전환의 주인공이 바뀌어 산만해진다.',
    recommendations: [
      { place: '히어로 헤더', body: '히어로 하단 앵커 내비게이션 — 섹션 스크롤과 언더라인 이동을 연동' },
      { place: '랜딩 페이지', body: '"디자인→개발→배포" 워크플로 스텝 소개 — 가벼운 바가 본문 일러스트를 방해하지 않음' },
      { place: '제품 섹션', body: '제품 상세의 "스펙/리뷰/배송" 정보 탭 — 가장 보편적이고 학습 비용 0' },
      { place: '포트폴리오 소개', body: '프로젝트 상세의 "개요/과정/결과" 탭 — 에디토리얼 톤과 잘 어울림' }
    ],
    tradeoff: '인디케이터 존재감이 약해 탭 수가 2개뿐이면 토글임을 인지하기 어렵다(이 경우 필 권장). 스크롤 컨테이너 안에서 탭이 넘칠 때는 offsetLeft가 스크롤 좌표를 포함하지 않으므로 scrollLeft 보정이 필요하다.'
  },

  // ───────────────────────────── 3. content-crossfade
  {
    id: 'content-crossfade',
    num: '03',
    title: '콘텐츠 크로스페이드',
    tag: '패널 out 120ms → in 200ms',
    summary: '인디케이터는 즉시 점프하고, 대신 콘텐츠 패널이 opacity+translateY 8px 크로스페이드로 교체되는 패턴. 이전 패널이 120ms로 빠르게 사라진 뒤 새 패널이 200ms로 떠오르는 비대칭 시퀀스가 핵심 — 전환의 무게중심을 인디케이터가 아니라 콘텐츠에 둔다.',
    demo: {
      hint: '탭을 클릭해보세요',
      bodyHTML: tablistHTML(SETTINGS, { label: '설정 탭', indicators: '<span class="pill" aria-hidden="true"></span>' })
        + '\n  ' + panelsHTML(SETTINGS, { stack: true }),
      css: ''
        + '.tablist { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); border-radius: 999px; padding: 4px; }\n'
        + '.pill { position: absolute; top: 4px; left: 0; width: 0; height: calc(100% - 8px); border-radius: 999px; background: rgba(255,255,255,0.14); }\n'
        + '.panels { display: grid; }\n'
        + '.panel { grid-area: 1 / 1; opacity: 0; transform: translateY(8px); pointer-events: none; transition: opacity 120ms ease, transform 120ms ease; }\n'
        + '.panel.is-active { opacity: 1; transform: none; pointer-events: auto; transition: opacity 200ms cubic-bezier(0.4,0,0.2,1), transform 200ms cubic-bezier(0.4,0,0.2,1); }',
      js: ''
        + 'var pill = document.querySelector(".pill");\n'
        + 'var swapTimer = null;\n'
        + 'function movePill(i){\n'
        + '  var t = tabs[i];\n'
        + '  pill.style.transform = "translateX(" + t.offsetLeft + "px)";\n'
        + '  pill.style.width = t.offsetWidth + "px";\n'
        + '}\n'
        + 'function setActive(i){ panels.forEach(function(pn, j){ pn.classList.toggle("is-active", j === i); }); }\n'
        + 'function update(i, prev){\n'
        + '  movePill(i);\n'
        + '  if (i === prev) { setActive(i); return; }\n'
        + '  panels.forEach(function(pn){ pn.classList.remove("is-active"); });\n'
        + '  clearTimeout(swapTimer);\n'
        + '  swapTimer = setTimeout(function(){ setActive(i); }, 120);\n'
        + '}\n'
        + 'if (document.fonts) document.fonts.ready.then(function(){ movePill(current); });',
      height: 480
    },
    snippetHTML: '<div class="tablist" role="tablist" aria-label="설정">\n'
      + '  <span class="pill" aria-hidden="true"></span>\n'
      + '  <button class="tab" role="tab" aria-selected="true" aria-controls="panel-0">프로필</button>\n'
      + '  <button class="tab" role="tab" aria-selected="false" aria-controls="panel-1">알림</button>\n'
      + '</div>\n'
      + '<!-- 패널은 grid 한 칸에 겹쳐 쌓는다 -->\n'
      + '<div class="panels">\n'
      + '  <div class="panel is-active" id="panel-0" role="tabpanel">…</div>\n'
      + '  <div class="panel" id="panel-1" role="tabpanel">…</div>\n'
      + '</div>',
    snippetCSS: '.panels { display: grid; }\n'
      + '.panel { grid-area: 1 / 1;                /* 같은 칸에 겹침 — 높이 점프 없음 */\n'
      + '  opacity: 0; transform: translateY(8px); pointer-events: none;\n'
      + '  transition: opacity 120ms ease, transform 120ms ease; }   /* out: 120ms */\n'
      + '.panel.is-active { opacity: 1; transform: none; pointer-events: auto;\n'
      + '  transition: opacity 200ms cubic-bezier(0.4,0,0.2,1), transform 200ms cubic-bezier(0.4,0,0.2,1); } /* in: 200ms */',
    snippetJS: 'var swapTimer = null;\n'
      + 'function update(i, prev){\n'
      + '  movePill(i);                              // 인디케이터는 즉시(transition 없음)\n'
      + '  if (i === prev) return;\n'
      + '  panels.forEach(function(pn){ pn.classList.remove("is-active"); });   // 1) 전부 out (120ms)\n'
      + '  clearTimeout(swapTimer);\n'
      + '  swapTimer = setTimeout(function(){       // 2) 120ms 뒤 새 패널 in (200ms)\n'
      + '    panels.forEach(function(pn, j){ pn.classList.toggle("is-active", j === i); });\n'
      + '  }, 120);\n'
      + '}',
    explain: '패널을 display:grid 한 칸(grid-area 1/1)에 전부 겹쳐 쌓아 두고 is-active 클래스로만 보이기를 제어한다. out과 in의 transition을 비대칭으로 선언하는 것이 요령 — 기본 상태(out)는 120ms, is-active(in)는 200ms로 두면 클래스 토글만으로 "빠르게 비우고 천천히 채우는" 시퀀스가 된다. 사라짐과 나타남 사이 120ms 공백은 setTimeout으로 만들며, 연타 시 clearTimeout으로 이전 예약을 취소해 패널이 꼬이지 않는다. 인디케이터는 transition 없이 즉시 점프시켜 시선이 콘텐츠 페이드에만 머물게 한다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (클래스 토글 + 120ms 시퀀스)' },
      { label: '트리거', value: '탭 클릭 + 키보드 ← →' },
      { label: '패널 스택', value: 'grid-area 1/1 겹침 — 높이 점프 없음' },
      { label: '전환 시간', value: 'out 120ms ease → in 200ms cubic-bezier(0.4,0,0.2,1)' },
      { label: '변위', value: 'opacity 0↔1 + translateY 8px↔0' },
      { label: '시그니처', value: 'Apple 제품 페이지 / Vercel / 설정 화면 전반' }
    ],
    guide: '패널 콘텐츠의 높이가 서로 비슷할 때 그리드 겹침이 가장 깨끗하다(컨테이너 높이는 가장 큰 패널 기준). 높이 차가 크면 컨테이너에 max-height transition을 더하거나 패널 슬라이드 패턴을 고려. out이 in보다 길어지면 화면이 비어 보이는 시간이 늘어 답답하므로 out ≤ in을 유지한다. translateY는 6~10px가 적정 — 그 이상은 페이드가 아니라 슬라이드로 읽힌다.',
    recommendations: [
      { place: '히어로 헤더', body: '히어로 우측 스크린샷을 탭으로 교체 — 제품 화면이 부드럽게 디졸브' },
      { place: '랜딩 페이지', body: '고객 후기 탭(업종별) — 인용문이 떠오르며 교체되는 에디토리얼 톤' },
      { place: '제품 섹션', body: '설정 화면류 UI — 프로필/알림/보안 패널 전환의 표준' },
      { place: '포트폴리오 소개', body: '"About/Process/Contact" 소개 탭 — 텍스트 중심 콘텐츠의 우아한 교체' }
    ],
    tradeoff: '겹침 스택이라 모든 패널이 DOM에 상시 렌더된다 — 패널이 무겁(고해상도 이미지·비디오)거나 수십 개면 메모리 비용. 숨김 패널도 탭 포커스가 닿지 않도록 pointer-events:none 외에 visibility까지 제어하면 더 안전하다.'
  },

  // ───────────────────────────── 4. spotlight-hover
  {
    id: 'spotlight-hover',
    num: '04',
    title: '호버 스포트라이트',
    tag: '유령 120ms + 확정 필 280ms',
    summary: '클릭 전 hover만으로 반투명 유령 하이라이트가 커서를 따라다니고(120ms), 클릭하면 흰색 확정 필이 정착하는 2단 피드백. "지금 누를 수 있는 곳"과 "지금 선택된 곳"을 다른 속도·다른 농도의 인디케이터 둘로 분리해 보여주는 Linear 내비게이션 문법이다.',
    demo: {
      hint: '탭 위에 호버한 뒤 클릭해보세요',
      bodyHTML: tablistHTML(SAAS, { label: '제품 안내 탭', indicators: '<span class="ghost" aria-hidden="true"></span><span class="pill" aria-hidden="true"></span>' })
        + '\n  ' + panelsHTML(SAAS),
      css: ''
        + '.tablist { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); border-radius: 999px; padding: 4px; }\n'
        + '.ghost { position: absolute; top: 4px; left: 0; width: 0; height: calc(100% - 8px); border-radius: 999px; background: rgba(255,255,255,0.1); opacity: 0; transition: transform 120ms ease-out, width 120ms ease-out, opacity 140ms ease; }\n'
        + '.tablist.is-hovering .ghost { opacity: 1; }\n'
        + '.pill { position: absolute; top: 4px; left: 0; width: 0; height: calc(100% - 8px); border-radius: 999px; background: #fff; transition: transform 280ms cubic-bezier(0.4,0,0.2,1), width 280ms cubic-bezier(0.4,0,0.2,1); }\n'
        + '.tab { z-index: 2; }\n'
        + '.tab[aria-selected="true"] { color: #0a0a0a; }\n'
        + '.tab[aria-selected="true"]:hover { color: #0a0a0a; }\n'
        + FADE_CSS,
      js: ''
        + 'var pill = document.querySelector(".pill");\n'
        + 'var ghost = document.querySelector(".ghost");\n'
        + 'var list = document.querySelector(".tablist");\n'
        + 'var btns = [].slice.call(document.querySelectorAll(".tab"));\n'
        + 'function place(el, t){\n'
        + '  el.style.transform = "translateX(" + t.offsetLeft + "px)";\n'
        + '  el.style.width = t.offsetWidth + "px";\n'
        + '}\n'
        + 'function update(i, prev){ place(pill, btns[i]); swapPanel(i); }\n'
        + 'btns.forEach(function(t){\n'
        + '  t.addEventListener("mouseenter", function(){\n'
        + '    place(ghost, t);\n'
        + '    list.classList.add("is-hovering");\n'
        + '  });\n'
        + '});\n'
        + 'list.addEventListener("mouseleave", function(){ list.classList.remove("is-hovering"); });\n'
        + 'if (document.fonts) document.fonts.ready.then(function(){ place(pill, btns[current]); });\n'
        + FADE_SWAP_JS,
      height: 480
    },
    snippetHTML: '<div class="tablist" role="tablist" aria-label="제품 안내">\n'
      + '  <span class="ghost" aria-hidden="true"></span>   <!-- hover 유령 -->\n'
      + '  <span class="pill" aria-hidden="true"></span>    <!-- 확정 인디케이터 -->\n'
      + '  <button class="tab" role="tab" aria-selected="true">개요</button>\n'
      + '  <button class="tab" role="tab" aria-selected="false">기능</button>\n'
      + '</div>',
    snippetCSS: '/* 유령: 빠르고(120ms) 옅게 — hover 추적 전용 */\n'
      + '.ghost { position: absolute; border-radius: 999px; background: rgba(255,255,255,0.1); opacity: 0;\n'
      + '         transition: transform 120ms ease-out, width 120ms ease-out, opacity 140ms ease; }\n'
      + '.tablist.is-hovering .ghost { opacity: 1; }\n'
      + '/* 확정 필: 느리고(280ms) 진하게 — 선택 상태 전용 */\n'
      + '.pill { position: absolute; border-radius: 999px; background: #fff;\n'
      + '        transition: transform 280ms cubic-bezier(0.4,0,0.2,1), width 280ms cubic-bezier(0.4,0,0.2,1); }',
    snippetJS: 'function place(el, t){\n'
      + '  el.style.transform = "translateX(" + t.offsetLeft + "px)";\n'
      + '  el.style.width = t.offsetWidth + "px";\n'
      + '}\n'
      + 'tabs.forEach(function(t, i){\n'
      + '  t.addEventListener("mouseenter", function(){       // hover → 유령이 따라옴\n'
      + '    place(ghost, t);\n'
      + '    list.classList.add("is-hovering");\n'
      + '  });\n'
      + '  t.addEventListener("click", function(){ select(i); });   // click → 확정 필 정착\n'
      + '});\n'
      + 'list.addEventListener("mouseleave", function(){ list.classList.remove("is-hovering"); });',
    explain: '같은 측정 함수(place)를 유령과 확정 필 두 엘리먼트에 다른 타이밍으로 적용한다. 유령은 mouseenter마다 120ms ease-out으로 즉각 따라붙고 tablist를 벗어나면 opacity로만 사라진다 — 위치는 남겨 두어 재진입 시 마지막 위치에서 다시 나타난다. 확정 필은 클릭(select)에서만 280ms로 이동한다. 두 레이어의 속도 차(120 vs 280)와 농도 차(10% vs 100%)가 "탐색 중"과 "선택됨"이라는 상태 구분을 모션 언어로 전달한다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (mouseenter + click 이중 와이어링)' },
      { label: '트리거', value: 'hover(유령) / 클릭·키보드(확정 필)' },
      { label: '유령', value: 'rgba(255,255,255,0.1) · 120ms ease-out' },
      { label: '확정 필', value: '#fff · 280ms cubic-bezier(0.4,0,0.2,1)' },
      { label: '퇴장', value: 'tablist mouseleave 시 opacity만 0 (위치 유지)' },
      { label: '시그니처', value: 'Linear 내비게이션 / Vercel / Raycast' }
    ],
    guide: '유령은 확정 필보다 반드시 빠르고 옅어야 한다 — 속도가 같으면 두 레이어가 분리돼 보이지 않고, 진하면 어느 쪽이 선택인지 헷갈린다. 유령 퇴장은 opacity만 줄이고 transform은 남겨 두면 재진입 시 자연스럽다. 터치 디바이스에는 hover가 없으므로 유령 로직은 자동으로 무시되고 확정 필만 동작 — 별도 분기 없이 안전하게 퇴화한다.',
    recommendations: [
      { place: '히어로 헤더', body: '상단 GNB 메뉴 — 커서를 올릴 때마다 유령이 흐르며 탐색을 유도' },
      { place: '랜딩 페이지', body: '플랜 비교 토글 — 누르기 전 hover 단계에서 이미 반응해 클릭률 상승' },
      { place: '제품 섹션', body: '도구 팔레트·뷰 전환(리스트/보드/캘린더) — 파워 유저용 밀도 높은 UI' },
      { place: '포트폴리오 소개', body: '작업 필터 — 마우스 따라다니는 유령 자체가 인터랙션 시그니처가 됨' }
    ],
    tradeoff: 'hover 이벤트 와이어링이 늘어 코드가 단일 인디케이터의 2배. 유령까지 transform을 쓰므로 GPU 레이어가 2장 — 저사양에서는 유령의 box-shadow·blur 장식을 피할 것. 터치 전용 사이트라면 이 패턴의 핵심 가치가 사라지므로 슬라이딩 필로 충분하다.'
  },

  // ───────────────────────────── 5. vertical-rail
  {
    id: 'vertical-rail',
    num: '05',
    title: '버티컬 레일',
    tag: 'offsetTop·offsetHeight → translateY+height',
    summary: '좌측 세로 탭 리스트 옆 3px 레일 인디케이터가 offsetTop·offsetHeight 측정으로 위아래로 미끄러지는 설정 페이지 문법. 가로 탭의 translateX+width를 translateY+height로 축만 바꾼 동일 메커니즘으로, 항목이 많고 라벨이 긴 내비게이션에 적합하다.',
    demo: {
      hint: '좌측 탭을 클릭해보세요 (↑↓ 키도 지원)',
      bodyHTML: '<div class="vwrap">\n  ' + tablistHTML(SETTINGS, { label: '설정 메뉴', vertical: true, indicators: '<span class="rail" aria-hidden="true"></span>' })
        + '\n  ' + panelsHTML(SETTINGS) + '\n  </div>',
      css: ''
        + '.vwrap { display: flex; gap: 32px; align-items: flex-start; width: min(680px, 92vw); }\n'
        + '.tablist { flex-direction: column; align-items: stretch; gap: 2px; padding: 0 0 0 15px; flex-shrink: 0; }\n'
        + '.rail { position: absolute; left: 0; top: 0; width: 3px; height: 0; border-radius: 2px; background: #818cf8; transition: transform 280ms cubic-bezier(0.4,0,0.2,1), height 280ms cubic-bezier(0.4,0,0.2,1); }\n'
        + '.tab { text-align: left; border-radius: 10px; padding: 11px 16px; }\n'
        + '.tab[aria-selected="true"] { background: rgba(255,255,255,0.06); }\n'
        + '.panels { flex: 1; width: auto; min-width: 0; }\n'
        + FADE_CSS,
      js: ''
        + 'var rail = document.querySelector(".rail");\n'
        + 'function moveRail(i){\n'
        + '  var t = tabs[i];\n'
        + '  rail.style.transform = "translateY(" + t.offsetTop + "px)";\n'
        + '  rail.style.height = t.offsetHeight + "px";\n'
        + '}\n'
        + 'function update(i, prev){ moveRail(i); swapPanel(i); }\n'
        + 'if (document.fonts) document.fonts.ready.then(function(){ moveRail(current); });\n'
        + FADE_SWAP_JS,
      height: 480
    },
    snippetHTML: '<div class="layout">\n'
      + '  <div class="tablist" role="tablist" aria-label="설정 메뉴" aria-orientation="vertical">\n'
      + '    <span class="rail" aria-hidden="true"></span>\n'
      + '    <button class="tab" role="tab" aria-selected="true" aria-controls="panel-0">프로필</button>\n'
      + '    <button class="tab" role="tab" aria-selected="false" aria-controls="panel-1">알림</button>\n'
      + '    <button class="tab" role="tab" aria-selected="false" aria-controls="panel-2">보안</button>\n'
      + '  </div>\n'
      + '  <div class="panel" id="panel-0" role="tabpanel">…</div>\n'
      + '</div>',
    snippetCSS: '.layout { display: flex; gap: 32px; align-items: flex-start; }\n'
      + '.tablist { position: relative; display: flex; flex-direction: column; gap: 2px; padding-left: 15px; }\n'
      + '.tab { text-align: left; border: 0; background: none; padding: 11px 16px; border-radius: 10px; cursor: pointer; }\n'
      + '.tab[aria-selected="true"] { background: rgba(0,0,0,0.05); }\n'
      + '.rail { position: absolute; left: 0; top: 0; width: 3px; border-radius: 2px; background: #6366f1;\n'
      + '        transition: transform 280ms cubic-bezier(0.4,0,0.2,1), height 280ms cubic-bezier(0.4,0,0.2,1); }',
    snippetJS: 'var rail = document.querySelector(".rail");\n'
      + 'function moveRail(i){\n'
      + '  var t = tabs[i];                          // 세로축 측정: offsetTop / offsetHeight\n'
      + '  rail.style.transform = "translateY(" + t.offsetTop + "px)";\n'
      + '  rail.style.height = t.offsetHeight + "px";\n'
      + '}\n'
      + '// 세로 tablist는 ↑↓ 키로 이동 (aria-orientation="vertical")\n'
      + 'list.addEventListener("keydown", function(e){\n'
      + '  var dir = e.key === "ArrowDown" ? 1 : (e.key === "ArrowUp" ? -1 : 0);\n'
      + '  if (!dir) return;\n'
      + '  e.preventDefault();\n'
      + '  var n = (current + dir + tabs.length) % tabs.length;\n'
      + '  select(n); tabs[n].focus();\n'
      + '});',
    explain: '가로 탭의 측정 기법을 90° 회전한 형태 — offsetLeft·offsetWidth 대신 offsetTop·offsetHeight를 읽어 translateY와 height에 적용한다. 레일은 tablist의 좌측 가장자리(left:0)에 absolute로 붙이고, 탭 버튼들은 padding-left로 레일 자리를 비워 둔다. 활성 탭에는 옅은 배경을 함께 깔아 레일+배경의 이중 표시로 현재 위치를 강화한다. aria-orientation="vertical"을 선언하고 ↑↓ 화살표 키로 이동시키는 것이 세로 탭의 접근성 표준이다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (측정 + 인라인 스타일)' },
      { label: '트리거', value: '탭 클릭 + 키보드 ↑ ↓' },
      { label: '측정', value: 'offsetTop · offsetHeight → translateY + height' },
      { label: '전환 시간', value: '280ms cubic-bezier(0.4,0,0.2,1)' },
      { label: '레일', value: '3px · #818cf8 · 활성 배경과 이중 표시' },
      { label: '시그니처', value: 'GitHub Settings / Notion 설정 / Stripe 대시보드' }
    ],
    guide: '항목 5~10개의 설정·문서 내비게이션에 적합하다. 레일 두께는 2~4px, 좌측 여백(padding-left)은 레일 두께 + 12px 정도로 잡아 텍스트와 간섭하지 않게. 항목 높이가 제각각이어도 offsetHeight 측정이라 레일 길이가 자동으로 맞는다. 모바일에서는 세로 리스트가 화면을 다 차지하므로 가로 스크롤 탭이나 드롭다운으로 전환하는 반응형 분기를 함께 설계할 것.',
    recommendations: [
      { place: '히어로 헤더', body: '히어로 좌측 단계형 메시지 내비게이션 — 스토리 단계를 레일로 표시' },
      { place: '랜딩 페이지', body: '긴 기능 목록의 좌측 인덱스 — 우측 콘텐츠와 1:1 매핑' },
      { place: '제품 섹션', body: '설정 화면(프로필/알림/보안/결제) — 이 문법의 본고장' },
      { place: '포트폴리오 소개', body: '프로젝트 연도별 인덱스 — 레일이 타임라인 메타포로 작동' }
    ],
    tradeoff: '가로 공간을 항상 점유한다 — 좁은 화면에서는 반응형 분기가 필수. 탭 리스트가 스크롤되는 경우 offsetTop은 스크롤과 무관한 레이아웃 좌표라 레일은 맞지만 화면 밖으로 나갈 수 있어, 활성 탭 scrollIntoView 처리를 함께 둘 것.'
  },

  // ───────────────────────────── 6. count-badge
  {
    id: 'count-badge',
    num: '06',
    title: '카운트 뱃지 탭',
    tag: '뱃지 반전 + scale 1.3→1 pop',
    summary: '탭마다 숫자 뱃지가 붙은 받은편지함·필터 문법. 필 인디케이터가 미끄러져 도착하는 순간 활성 뱃지의 배경이 흰색으로 반전되며 숫자가 scale 1.3→1로 톡 튀는 pop이 재생된다 — 전환 완료를 알리는 마이크로 피드백.',
    demo: {
      hint: '탭을 클릭해보세요',
      bodyHTML: tablistHTML(WORK, {
        label: '작업 필터 탭',
        indicators: '<span class="pill" aria-hidden="true"></span>',
        inner: function (c) { return c.label + '<span class="badge">' + c.n + '</span>'; }
      }) + '\n  ' + panelsHTML(WORK),
      css: ''
        + '.tablist { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); border-radius: 999px; padding: 4px; }\n'
        + '.pill { position: absolute; top: 4px; left: 0; width: 0; height: calc(100% - 8px); border-radius: 999px; background: rgba(255,255,255,0.12); transition: transform 280ms cubic-bezier(0.4,0,0.2,1), width 280ms cubic-bezier(0.4,0,0.2,1); }\n'
        + '.tab { display: inline-flex; align-items: center; gap: 8px; }\n'
        + '.badge { display: inline-flex; align-items: center; justify-content: center; min-width: 20px; height: 20px; padding: 0 6px; border-radius: 999px; background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.7); font-size: 11px; font-weight: 700; transition: background 180ms ease, color 180ms ease; }\n'
        + '.tab[aria-selected="true"] .badge { background: #fff; color: #0a0a0a; animation: badge-pop 260ms cubic-bezier(0.34,1.56,0.64,1); }\n'
        + '@keyframes badge-pop { 0% { transform: scale(1.3); } 100% { transform: scale(1); } }\n'
        + FADE_CSS,
      js: ''
        + 'var pill = document.querySelector(".pill");\n'
        + 'function movePill(i){\n'
        + '  var t = tabs[i];\n'
        + '  pill.style.transform = "translateX(" + t.offsetLeft + "px)";\n'
        + '  pill.style.width = t.offsetWidth + "px";\n'
        + '}\n'
        + 'function update(i, prev){ movePill(i); swapPanel(i); }\n'
        + 'if (document.fonts) document.fonts.ready.then(function(){ movePill(current); });\n'
        + FADE_SWAP_JS,
      height: 480
    },
    snippetHTML: '<div class="tablist" role="tablist" aria-label="작업 필터">\n'
      + '  <span class="pill" aria-hidden="true"></span>\n'
      + '  <button class="tab" role="tab" aria-selected="true">전체<span class="badge">24</span></button>\n'
      + '  <button class="tab" role="tab" aria-selected="false">진행 중<span class="badge">8</span></button>\n'
      + '  <button class="tab" role="tab" aria-selected="false">완료<span class="badge">12</span></button>\n'
      + '</div>',
    snippetCSS: '.tab { display: inline-flex; align-items: center; gap: 8px; }\n'
      + '.badge { display: inline-flex; align-items: center; justify-content: center;\n'
      + '  min-width: 20px; height: 20px; padding: 0 6px; border-radius: 999px;\n'
      + '  background: rgba(0,0,0,0.08); font-size: 11px; font-weight: 700;\n'
      + '  transition: background 180ms ease, color 180ms ease; }\n'
      + '/* 활성 순간 반전 + pop — 셀렉터가 새로 매칭되며 keyframe이 자동 재생 */\n'
      + '.tab[aria-selected="true"] .badge { background: #111; color: #fff;\n'
      + '  animation: badge-pop 260ms cubic-bezier(0.34,1.56,0.64,1); }\n'
      + '@keyframes badge-pop { 0% { transform: scale(1.3); } 100% { transform: scale(1); } }',
    snippetJS: '// 뱃지 pop은 CSS만으로 동작 — aria-selected가 바뀌면\n'
      + '// [aria-selected="true"] .badge 셀렉터가 새로 매칭되며 keyframe이 재시작된다.\n'
      + 'function select(i){\n'
      + '  tabs.forEach(function(t, j){ t.setAttribute("aria-selected", j === i ? "true" : "false"); });\n'
      + '  movePill(i); swapPanel(i);\n'
      + '}\n'
      + '// 카운트가 실시간으로 바뀌는 경우: 숫자 교체 후 강제 pop 재생\n'
      + 'function setCount(i, n){\n'
      + '  var b = tabs[i].querySelector(".badge");\n'
      + '  b.textContent = n;\n'
      + '  b.style.animation = "none"; void b.offsetWidth; b.style.animation = "";\n'
      + '}',
    explain: '필 이동은 표준 측정 기법 그대로이고, 이 패턴의 본체는 뱃지의 상태 피드백이다. CSS 애니메이션은 셀렉터가 "새로 매칭되는 순간" 재생되므로, aria-selected가 true로 바뀔 때 [aria-selected="true"] .badge 규칙의 badge-pop 키프레임이 JS 없이 자동으로 다시 시작된다. 이징은 overshoot가 있는 cubic-bezier(0.34,1.56,0.64,1)(back-out)로 잡아 1.3배에서 살짝 튀며 안착하는 탄성을 만든다. 뱃지 배경·글자색 반전은 180ms transition으로 pop과 겹쳐 재생된다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (pop 자체는 CSS only)' },
      { label: '트리거', value: '탭 클릭 + 키보드 ← → / aria-selected 변경' },
      { label: 'pop', value: 'scale 1.3→1 · 260ms cubic-bezier(0.34,1.56,0.64,1)' },
      { label: '뱃지 반전', value: 'rgba 12% → #fff·#0a0a0a, 180ms' },
      { label: '뱃지 규격', value: 'min-width 20px · height 20px · radius 999px' },
      { label: '시그니처', value: 'Gmail 받은편지함 / Linear 필터 / Jira 보드' }
    ],
    guide: '뱃지 숫자는 2자리까지가 보기 좋다 — 99 초과는 "99+"로 줄일 것. pop의 시작 scale은 1.2~1.4 사이가 적정이며 그 이상은 장난스러워진다. 실시간으로 카운트가 갱신되는 UI라면 숫자가 바뀔 때도 animation을 none으로 끊었다 reflow 후 복원하는 재생 트릭으로 같은 pop을 재활용한다. 숫자는 고정폭 숫자(font-variant-numeric: tabular-nums)로 두면 자릿수 변화 때 흔들림이 없다.',
    recommendations: [
      { place: '히어로 헤더', body: '공지·알림 카운트가 달린 상단 탭 — 미확인 수가 시선을 끌어 클릭 유도' },
      { place: '랜딩 페이지', body: '"후기 128 · 질문 32" 같은 사회적 증거 탭 — 숫자가 신뢰 신호' },
      { place: '제품 섹션', body: '작업 보드 필터(전체/진행 중/완료/보류) — 이 문법의 본고장' },
      { place: '포트폴리오 소개', body: '카테고리별 작업 수 표시 필터 — 보유 작업량을 자연스럽게 노출' }
    ],
    tradeoff: '뱃지 숫자가 자주 갱신되면 pop이 반복 재생되어 산만하다 — 사용자 클릭에 의한 활성 전환에서만 pop을 재생하고 데이터 갱신은 숫자만 바꾸는 분리를 권장. 카운트 0인 탭의 뱃지를 숨길지 회색으로 둘지 정책을 정해 둘 것.'
  },

  // ───────────────────────────── 7. icon-pop
  {
    id: 'icon-pop',
    num: '07',
    title: '아이콘 팝 탭',
    tag: '아이콘 scale 0.6→1 오버슈트',
    summary: '아이콘+라벨이 세로로 쌓인 모바일 바텀 탭 문법. 활성 전환 순간 아이콘이 scale 0.6→1.12→1 오버슈트 스프링으로 튀며 색이 인디고 액센트로 물든다. 인디케이터 이동 없이 아이콘 자체가 상태 변화의 주인공이 되는 패턴.',
    demo: {
      hint: '탭을 클릭해보세요',
      bodyHTML: tablistHTML(SHOWCASE, {
        label: '워크플로 탭',
        inner: function (c, i) { return '<span class="ico" aria-hidden="true">' + ICONS[i] + '</span><span class="lbl">' + c.label + '</span>'; }
      }) + '\n  ' + panelsHTML(SHOWCASE),
      css: ''
        + '.tablist { gap: 6px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); border-radius: 18px; padding: 8px; }\n'
        + '.tab { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 10px 20px; border-radius: 12px; font-size: 12px; }\n'
        + '.ico { display: inline-flex; color: rgba(255,255,255,0.45); transition: color 200ms ease; }\n'
        + '.ico svg { display: block; }\n'
        + '.tab:hover .ico { color: rgba(255,255,255,0.75); }\n'
        + '.tab[aria-selected="true"] { background: rgba(255,255,255,0.07); }\n'
        + '.tab[aria-selected="true"] .ico { color: #a5b4fc; animation: ico-pop 320ms cubic-bezier(0.34,1.56,0.64,1); }\n'
        + '@keyframes ico-pop { 0% { transform: scale(0.6); } 60% { transform: scale(1.12); } 100% { transform: scale(1); } }\n'
        + FADE_CSS,
      js: ''
        + 'function update(i, prev){ swapPanel(i); }\n'
        + FADE_SWAP_JS,
      height: 480
    },
    snippetHTML: '<div class="tablist" role="tablist" aria-label="워크플로">\n'
      + '  <button class="tab" role="tab" aria-selected="true">\n'
      + '    <span class="ico" aria-hidden="true"><svg><!-- pen --></svg></span>\n'
      + '    <span class="lbl">디자인</span>\n'
      + '  </button>\n'
      + '  <button class="tab" role="tab" aria-selected="false">\n'
      + '    <span class="ico" aria-hidden="true"><svg><!-- code --></svg></span>\n'
      + '    <span class="lbl">개발</span>\n'
      + '  </button>\n'
      + '</div>',
    snippetCSS: '.tab { display: flex; flex-direction: column; align-items: center; gap: 6px;\n'
      + '  border: 0; background: none; padding: 10px 20px; border-radius: 12px; font-size: 12px; cursor: pointer; }\n'
      + '.ico { color: rgba(0,0,0,0.4); transition: color 200ms ease; }\n'
      + '.tab[aria-selected="true"] { background: rgba(0,0,0,0.05); }\n'
      + '/* 오버슈트 스프링: 0.6 → 1.12 → 1 */\n'
      + '.tab[aria-selected="true"] .ico { color: #6366f1;\n'
      + '  animation: ico-pop 320ms cubic-bezier(0.34,1.56,0.64,1); }\n'
      + '@keyframes ico-pop { 0% { transform: scale(0.6); } 60% { transform: scale(1.12); } 100% { transform: scale(1); } }',
    snippetJS: '// 아이콘 pop은 CSS only — aria-selected 토글만 하면 keyframe이 재시작된다.\n'
      + 'tabs.forEach(function(t, i){\n'
      + '  t.addEventListener("click", function(){\n'
      + '    tabs.forEach(function(x, j){ x.setAttribute("aria-selected", j === i ? "true" : "false"); });\n'
      + '    panels.forEach(function(pn, j){ pn.hidden = j !== i; });\n'
      + '  });\n'
      + '});\n'
      + '// prefers-reduced-motion이면 스프링 제거\n'
      + '// @media (prefers-reduced-motion: reduce) { .ico { animation: none !important; } }',
    explain: '측정 기반 인디케이터가 없는 유일한 패턴 — 상태 표시를 아이콘의 스케일 스프링과 색 전환이 대신한다. 키프레임을 0%(scale 0.6) → 60%(1.12) → 100%(1)의 3단으로 짜고 back-out 계열 이징을 더해, 아이콘이 움츠러들었다 튀어오르며 안착하는 스프링을 CSS만으로 흉내 낸다. 카운트 뱃지 탭과 같은 원리로 aria-selected 셀렉터가 새로 매칭될 때 키프레임이 자동 재생되므로 JS는 속성 토글만 담당한다. SVG는 stroke: currentColor로 두어 색 전환이 transition 하나로 끝난다.',
    kv: [
      { label: '의존성', value: 'CSS only (JS는 aria-selected 토글만)' },
      { label: '트리거', value: '탭 클릭 + 키보드 ← →' },
      { label: 'pop', value: 'scale 0.6→1.12→1 · 320ms cubic-bezier(0.34,1.56,0.64,1)' },
      { label: '색 전환', value: 'rgba 45% → #a5b4fc, 200ms ease' },
      { label: '아이콘', value: '20px stroke SVG · currentColor 상속' },
      { label: '시그니처', value: 'iOS 탭 바 / Instagram / Twitter 바텀 탭' }
    ],
    guide: '아이콘 20~24px + 라벨 11~12px의 세로 스택이 표준 비례. 오버슈트 피크(60% 지점)는 1.08~1.15 사이가 적정 — 1.2를 넘으면 옆 탭을 침범해 보인다. 아이콘은 모두 같은 스트로크 굵기·같은 그리드의 세트(Lucide·Heroicons)로 통일할 것. 활성 색은 브랜드 액센트 1색만 사용하고, prefers-reduced-motion에서는 animation을 끄고 색 전환만 남기는 분기를 반드시 넣는다.',
    recommendations: [
      { place: '히어로 헤더', body: '모바일 웹 히어로 하단 고정 탭 바 — 네이티브 앱 감각의 첫인상' },
      { place: '랜딩 페이지', body: '기능 4종을 아이콘 탭으로 전환 — 아이콘이 기능의 시각 앵커가 됨' },
      { place: '제품 섹션', body: '모바일 대시보드 바텀 내비게이션 — 이 문법의 본고장' },
      { place: '포트폴리오 소개', body: '"디자인/개발/사진" 등 직군별 작업 전환 — 아이콘으로 성격을 즉시 전달' }
    ],
    tradeoff: '인디케이터가 없어 탭이 2개뿐이거나 아이콘 의미가 모호하면 현재 위치 인지가 약해진다 — 활성 배경칩이나 라벨 굵기 변화를 함께 둘 것. 스케일 애니메이션이 아이콘마다 재생되므로 연타 시 부산스러울 수 있다.'
  },

  // ───────────────────────────── 8. width-morph
  {
    id: 'width-morph',
    num: '08',
    title: '가변 폭 필',
    tag: '좌표+폭 동시 보간 시각 강조',
    summary: '"홈"부터 "고객 사례 모음"까지 라벨 길이가 제각각인 탭에서 필이 이동하며 width까지 부드럽게 모핑되는 패턴. 슬라이딩 필과 같은 코드지만 라벨 폭 차이를 의도적으로 키워 좌표+폭 동시 보간이라는 측정 기법의 본질을 가장 극적으로 보여준다. 하단 읽기줄에 현재 필 폭(px)이 실시간 표시된다.',
    demo: {
      hint: '라벨 길이가 다른 탭을 오가 보세요',
      bodyHTML: tablistHTML(NAV, { label: '사이트 내비게이션 탭', indicators: '<span class="pill" aria-hidden="true"></span>' })
        + '\n  <div class="readout">필 폭 <span class="w">0</span>px — 좌표·폭 동시 보간</div>\n  ' + panelsHTML(NAV),
      css: ''
        + '.tablist { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); border-radius: 999px; padding: 4px; }\n'
        + '.pill { position: absolute; top: 4px; left: 0; width: 0; height: calc(100% - 8px); border-radius: 999px; background: #fff; transition: transform 300ms cubic-bezier(0.4,0,0.2,1), width 300ms cubic-bezier(0.4,0,0.2,1); will-change: transform, width; }\n'
        + '.tab[aria-selected="true"] { color: #0a0a0a; }\n'
        + '.tab[aria-selected="true"]:hover { color: #0a0a0a; }\n'
        + '.readout { font: 500 11px/1 ui-monospace, SFMono-Regular, Menlo, monospace; color: rgba(255,255,255,0.4); letter-spacing: 0.06em; margin-top: -14px; }\n'
        + '.readout .w { color: rgba(255,255,255,0.85); font-weight: 700; }\n'
        + FADE_CSS,
      js: ''
        + 'var pill = document.querySelector(".pill");\n'
        + 'var wOut = document.querySelector(".readout .w");\n'
        + 'function movePill(i){\n'
        + '  var t = tabs[i];\n'
        + '  pill.style.transform = "translateX(" + t.offsetLeft + "px)";\n'
        + '  pill.style.width = t.offsetWidth + "px";\n'
        + '  wOut.textContent = Math.round(t.offsetWidth);\n'
        + '}\n'
        + 'function update(i, prev){ movePill(i); swapPanel(i); }\n'
        + 'if (document.fonts) document.fonts.ready.then(function(){ movePill(current); });\n'
        + FADE_SWAP_JS,
      height: 480
    },
    snippetHTML: '<div class="tablist" role="tablist" aria-label="사이트 내비게이션">\n'
      + '  <span class="pill" aria-hidden="true"></span>\n'
      + '  <button class="tab" role="tab" aria-selected="true">홈</button>\n'
      + '  <button class="tab" role="tab" aria-selected="false">제품 기능</button>\n'
      + '  <button class="tab" role="tab" aria-selected="false">고객 사례 모음</button>\n'
      + '  <button class="tab" role="tab" aria-selected="false">문의</button>\n'
      + '</div>',
    snippetCSS: '/* 핵심: transform과 width를 같은 duration·같은 이징으로 묶는다 */\n'
      + '.pill { position: absolute; top: 4px; left: 0; height: calc(100% - 8px);\n'
      + '  border-radius: 999px; background: #fff; will-change: transform, width;\n'
      + '  transition: transform 300ms cubic-bezier(0.4,0,0.2,1),\n'
      + '              width     300ms cubic-bezier(0.4,0,0.2,1); }',
    snippetJS: 'function movePill(i){\n'
      + '  var t = tabs[i];\n'
      + '  // 좌표와 폭을 한 프레임에 함께 적용 — 따로 적용하면 모핑이 어긋난다\n'
      + '  pill.style.transform = "translateX(" + t.offsetLeft + "px)";\n'
      + '  pill.style.width = t.offsetWidth + "px";\n'
      + '}\n'
      + '// 라벨이 동적으로 바뀌는 경우(i18n·데이터 라벨)에도 재측정만 하면 끝\n'
      + 'window.addEventListener("resize", function(){ movePill(current); });\n'
      + 'if (document.fonts) document.fonts.ready.then(function(){ movePill(current); });',
    explain: '슬라이딩 필과 동일한 측정→보간이지만, 강조점이 "위치 이동"에서 "폭 모핑"으로 옮겨 간다. transform과 width를 같은 duration·같은 이징으로 선언하면 두 속성의 보간 곡선이 일치해 필이 한 덩어리의 젤리처럼 늘었다 줄며 이동한다 — duration이 어긋나면 필 한쪽 끝이 먼저 도착하는 부자연스러운 모양이 된다. width는 레이아웃 속성이라 transform보다 비용이 있지만 인디케이터 1개에는 무시할 수준이며, will-change로 레이어를 미리 승격해 둔다. 데모의 px 읽기줄은 매 전환마다 offsetWidth 측정값을 그대로 보여 준다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (측정 + 인라인 스타일)' },
      { label: '트리거', value: '탭 클릭 + 키보드 ← →' },
      { label: '측정', value: 'offsetLeft · offsetWidth — 라벨 폭 차가 클수록 극적' },
      { label: '전환 시간', value: 'transform·width 모두 300ms cubic-bezier(0.4,0,0.2,1)' },
      { label: '주의', value: 'width는 레이아웃 속성 — will-change + 인디케이터 1개 한정' },
      { label: '시그니처', value: 'Stripe 내비게이션 / Arc 브라우저 / Framer 사이트' }
    ],
    guide: '라벨 길이 차이가 2배 이상일 때 이 패턴의 가치가 산다 — 길이가 비슷하면 일반 슬라이딩 필과 구분되지 않는다. i18n으로 라벨이 통째로 바뀌는 서비스에서 특히 유효한데, 측정 기반이라 언어가 바뀌어도 코드 수정이 전혀 없다. scaleX로 폭을 흉내 내면 border-radius가 찌그러지므로 진짜 width를 보간하는 것이 정석. 폭 변화가 큰 만큼 duration은 280~320ms로 살짝 여유 있게.',
    recommendations: [
      { place: '히어로 헤더', body: '메인 GNB — 메뉴 라벨 길이가 제각각인 실전 내비게이션에 그대로 적용' },
      { place: '랜딩 페이지', body: '다국어 전환 사이트의 섹션 탭 — 언어별 라벨 폭 차이를 측정이 흡수' },
      { place: '제품 섹션', body: '"전체/신규 출시/베스트셀러" 같은 길이 불균형 필터' },
      { place: '포트폴리오 소개', body: '"홈/작업/소개" 미니 내비게이션 — 폭 모핑 자체가 시그니처 모션' }
    ],
    tradeoff: 'width 보간은 매 프레임 레이아웃을 유발하므로 인디케이터를 여러 개 동시에 움직이는 화면에는 부적합 — 그 경우 scaleX 근사+radius 포기 또는 FLIP 기법을 검토. 라벨 길이 차가 극단적이면(1자 vs 10자) 필 모양 변화가 과해 보일 수 있어 min-width로 하한을 둘 것.'
  },

  // ───────────────────────────── 9. panel-slide
  {
    id: 'panel-slide',
    num: '09',
    title: '패널 방향 슬라이드',
    tag: '트랙 translateX -i×100% 방향 슬라이드',
    summary: '새 탭 인덱스가 현재보다 크면 우→좌, 작으면 좌→우로 콘텐츠 패널이 방향성 있게 슬라이드되는 패턴. 패널을 가로 트랙에 일렬로 눕히고 overflow 마스크 안에서 트랙 전체를 translateX(-index×100%)로 밀면, 새 패널이 들어오는 방향이 인덱스 차이에 따라 자동으로 결정된다 — "다음은 오른쪽에 있다"는 공간 모델을 모션으로 학습시키는 온보딩·스텝 문법이다.',
    demo: {
      hint: '탭을 순서대로, 또 거꾸로 클릭해보세요',
      bodyHTML: tablistHTML(SHOWCASE, { label: '워크플로 탭', indicators: '<span class="pill" aria-hidden="true"></span>' })
        + '\n  ' + panelsHTML(SHOWCASE, { track: true }),
      css: ''
        + '.tablist { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); border-radius: 999px; padding: 4px; }\n'
        + '.pill { position: absolute; top: 4px; left: 0; width: 0; height: calc(100% - 8px); border-radius: 999px; background: #fff; transition: transform 280ms cubic-bezier(0.4,0,0.2,1), width 280ms cubic-bezier(0.4,0,0.2,1); }\n'
        + '.tab[aria-selected="true"] { color: #0a0a0a; }\n'
        + '.tab[aria-selected="true"]:hover { color: #0a0a0a; }\n'
        + '.panels { overflow: hidden; }\n'
        + '.track { display: flex; transition: transform 360ms cubic-bezier(0.4,0,0.2,1); will-change: transform; }\n'
        + '.panel { flex: 0 0 100%; min-width: 0; transition: opacity 360ms ease; }\n'
        + '.panel[aria-hidden="true"] { opacity: 0.25; }',
      js: ''
        + 'var pill = document.querySelector(".pill");\n'
        + 'var trackEl = document.querySelector(".track");\n'
        + 'function movePill(i){\n'
        + '  var t = tabs[i];\n'
        + '  pill.style.transform = "translateX(" + t.offsetLeft + "px)";\n'
        + '  pill.style.width = t.offsetWidth + "px";\n'
        + '}\n'
        + 'function update(i, prev){\n'
        + '  movePill(i);\n'
        + '  trackEl.style.transform = "translateX(" + (-i * 100) + "%)";\n'
        + '  panels.forEach(function(pn, j){ pn.setAttribute("aria-hidden", j === i ? "false" : "true"); });\n'
        + '}\n'
        + 'if (document.fonts) document.fonts.ready.then(function(){ movePill(current); });',
      height: 480
    },
    snippetHTML: '<div class="tablist" role="tablist" aria-label="워크플로">\n'
      + '  <span class="pill" aria-hidden="true"></span>\n'
      + '  <button class="tab" role="tab" aria-selected="true" aria-controls="panel-0">디자인</button>\n'
      + '  <button class="tab" role="tab" aria-selected="false" aria-controls="panel-1">개발</button>\n'
      + '  <button class="tab" role="tab" aria-selected="false" aria-controls="panel-2">배포</button>\n'
      + '</div>\n'
      + '<!-- 패널은 hidden 토글 없이 가로 트랙에 일렬로 -->\n'
      + '<div class="panels">\n'
      + '  <div class="track">\n'
      + '    <div class="panel" id="panel-0" role="tabpanel">…</div>\n'
      + '    <div class="panel" id="panel-1" role="tabpanel">…</div>\n'
      + '    <div class="panel" id="panel-2" role="tabpanel">…</div>\n'
      + '  </div>\n'
      + '</div>',
    snippetCSS: '.panels { overflow: hidden; }                /* 뷰포트 — 마스크 역할 */\n'
      + '.track { display: flex; will-change: transform;\n'
      + '  transition: transform 360ms cubic-bezier(0.4,0,0.2,1); }\n'
      + '/* flex-basis 100% + shrink 0 — 트랙 폭은 컨테이너와 같고 패널이 옆으로 넘친다.\n'
      + '   그래서 translateX(-i*100%)가 정확히 패널 i 위치가 된다 */\n'
      + '.panel { flex: 0 0 100%; min-width: 0; }\n'
      + '.panel[aria-hidden="true"] { opacity: 0.25; transition: opacity 360ms ease; }',
    snippetJS: 'var track = document.querySelector(".track");\n'
      + 'function update(i, prev){\n'
      + '  movePill(i);                              // 인디케이터는 표준 측정 이동\n'
      + '  // 새 인덱스가 크면 우→좌, 작으면 좌→우 — 방향은 translateX 보간이 자동 결정\n'
      + '  track.style.transform = "translateX(" + (-i * 100) + "%)";\n'
      + '  // 화면 밖 패널은 보조기기·포커스 대상에서 제외\n'
      + '  panels.forEach(function(pn, j){\n'
      + '    pn.setAttribute("aria-hidden", j === i ? "false" : "true");\n'
      + '  });\n'
      + '}',
    explain: '패널 N개를 display:flex 트랙에 일렬로 눕히고 overflow:hidden 컨테이너로 마스크한다. 패널에 flex: 0 0 100%를 주면 flex-basis가 컨테이너 폭으로 해석되고 shrink 0이라 옆으로 넘치므로 트랙 자체의 폭은 컨테이너와 같게 유지된다 — 따라서 트랙의 translateX(-i×100%)가 정확히 패널 i의 좌표가 된다. 전환 방향을 따로 계산할 필요가 없다는 것이 이 구조의 묘미: 새 인덱스가 크면 트랙이 왼쪽으로(콘텐츠는 우→좌), 작으면 오른쪽으로 보간되어 탭 순서와 슬라이드 방향이 항상 일치한다. 화면 밖 패널은 aria-hidden으로 보조기기에서 제외하고 opacity 0.25로 낮춰, 슬라이드 도중 이웃 패널이 살짝 비치며 지나가는 깊이감을 만든다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (트랙 translateX 1줄)' },
      { label: '트리거', value: '탭 클릭 + 키보드 ← →' },
      { label: '트랙', value: 'display:flex + 패널 flex 0 0 100% + overflow 마스크' },
      { label: '전환 시간', value: '트랙 360ms / 필 280ms cubic-bezier(0.4,0,0.2,1)' },
      { label: '방향', value: '인덱스 증가 우→좌 · 감소 좌→우 (translateX 자동 결정)' },
      { label: '시그니처', value: '모바일 온보딩 / Material Tabs / iOS 설정 푸시 전환' }
    ],
    guide: '탭 순서가 의미를 갖는 콘텐츠(단계·날짜·정렬된 카테고리)에 잘 맞는다 — 순서가 임의라면 방향 메타포가 오히려 혼란을 준다. 트랙 duration은 320~400ms가 적정이며, 멀리 점프(1→4)해도 같은 시간에 도착하는 고정 duration이 일반적이다 — 거리감을 살리고 싶으면 Math.abs(i-prev)에 비례한 가변 duration을 검토. 패널 높이가 제각각이면 트랙 높이가 가장 큰 패널 기준으로 잡히므로 콘텐츠 높이를 비슷하게 맞출 것. 모바일에서는 touch swipe 제스처와 결합하면 탭과 스와이프가 같은 공간 모델을 공유해 완성도가 올라간다.',
    recommendations: [
      { place: '히어로 헤더', body: '단계형 제품 투어(1→2→3) 히어로 — "다음" 감각을 슬라이드 방향으로 전달' },
      { place: '랜딩 페이지', body: '온보딩 스텝 소개 — 진행 방향이 좌우 모션으로 체화되어 이탈 없이 끝까지 유도' },
      { place: '제품 섹션', body: '워크플로 단계(디자인→개발→배포→분석) 전환 — 순서 메타포의 본고장' },
      { place: '포트폴리오 소개', body: '연도별·시리즈별 작업 넘기기 — 갤러리 페이지 넘김 감각의 브라우징' }
    ],
    tradeoff: '모든 패널이 DOM에 상시 렌더되고 가로로 누워 있어 무거운 콘텐츠(영상·대형 이미지)가 많으면 메모리·페인트 비용이 커진다. 화면 밖 패널의 포커스 가능한 요소는 aria-hidden만으로는 부족할 수 있어 inert 속성(또는 tabindex=-1)을 병행할 것. prefers-reduced-motion에서는 트랙 transition을 끄고 즉시 점프가 안전하다.'
  },

  // ───────────────────────────── 10. progress-tabs
  {
    id: 'progress-tabs',
    num: '10',
    title: '오토 프로그레스 탭',
    tag: 'rAF 5초 진행 바 + 자동 순환',
    summary: '각 탭 하단의 진행 바가 5초 동안 채워지고, 다 차면 자동으로 다음 탭으로 넘어가는 히어로 캐러셀 문법. hover하면 진행이 그 자리에서 멈추고, 클릭하면 그 탭으로 즉시 점프해 진행이 0부터 다시 시작된다. 본 카탈로그에서 유일하게 자동 전환을 쓰는 패턴으로, "사용자 개입이 항상 자동 재생을 이긴다"가 설계 원칙이다.',
    demo: {
      hint: '가만히 두면 5초마다 전환 — hover 일시정지 · 클릭 점프',
      bodyHTML: tablistHTML(SAAS, {
        label: '제품 안내 탭',
        inner: function (c) { return '<span class="lbl">' + c.label + '</span><span class="prog" aria-hidden="true"><span></span></span>'; }
      }) + '\n  ' + panelsHTML(SAAS),
      css: ''
        + '.tablist { gap: 18px; align-items: stretch; }\n'
        + '.tab { display: flex; flex-direction: column; align-items: stretch; gap: 9px; padding: 8px 2px 10px; border-radius: 6px; min-width: 84px; text-align: left; }\n'
        + '.lbl { display: block; }\n'
        + '.prog { display: block; height: 3px; border-radius: 2px; background: rgba(255,255,255,0.14); overflow: hidden; }\n'
        + '.prog > span { display: block; width: 0%; height: 100%; border-radius: 2px; background: #fff; }\n'
        + FADE_CSS,
      js: ''
        + 'var DUR = 5000;\n'
        + 'var fills = [].slice.call(document.querySelectorAll(".prog > span"));\n'
        + 'var list = document.querySelector(".tablist");\n'
        + 'var raf = null, startTs = null, elapsed = 0, paused = false;\n'
        + 'function frame(ts){\n'
        + '  if (startTs === null || paused) startTs = ts - elapsed;\n'
        + '  else elapsed = ts - startTs;\n'
        + '  var ratio = Math.min(1, elapsed / DUR);\n'
        + '  fills[current].style.width = (ratio * 100) + "%";\n'
        + '  if (ratio >= 1) { select((current + 1) % tabs.length); return; }\n'
        + '  raf = requestAnimationFrame(frame);\n'
        + '}\n'
        + 'function update(i, prev){\n'
        + '  fills.forEach(function(f, j){ f.style.width = j < i ? "100%" : "0%"; });\n'
        + '  swapPanel(i);\n'
        + '  if (raf) cancelAnimationFrame(raf);\n'
        + '  startTs = null; elapsed = 0;\n'
        + '  raf = requestAnimationFrame(frame);\n'
        + '}\n'
        + 'list.addEventListener("mouseenter", function(){ paused = true; });\n'
        + 'list.addEventListener("mouseleave", function(){ paused = false; });\n'
        + FADE_SWAP_JS,
      height: 480
    },
    snippetHTML: '<div class="tablist" role="tablist" aria-label="제품 안내">\n'
      + '  <button class="tab" role="tab" aria-selected="true" aria-controls="panel-0">\n'
      + '    개요\n'
      + '    <span class="prog" aria-hidden="true"><span></span></span>\n'
      + '  </button>\n'
      + '  <button class="tab" role="tab" aria-selected="false" aria-controls="panel-1">\n'
      + '    기능\n'
      + '    <span class="prog" aria-hidden="true"><span></span></span>\n'
      + '  </button>\n'
      + '</div>\n'
      + '<div class="panel" id="panel-0" role="tabpanel">…</div>',
    snippetCSS: '.tab { display: flex; flex-direction: column; gap: 9px; min-width: 84px;\n'
      + '  border: 0; background: none; padding: 8px 2px 10px; cursor: pointer; text-align: left; }\n'
      + '/* 진행 바: 트랙 + fill — fill 폭은 JS가 rAF로 매 프레임 갱신 */\n'
      + '.prog { display: block; height: 3px; border-radius: 2px;\n'
      + '  background: rgba(0,0,0,0.12); overflow: hidden; }\n'
      + '.prog > span { display: block; width: 0%; height: 100%; background: #111; }',
    snippetJS: 'var DUR = 5000;                                  // 탭당 5초\n'
      + 'var fills = [].slice.call(document.querySelectorAll(".prog > span"));\n'
      + 'var raf = null, startTs = null, elapsed = 0, paused = false;\n'
      + 'function frame(ts){\n'
      + '  if (startTs === null || paused) startTs = ts - elapsed;   // 일시정지: 기준점을 미뤄 진행 동결\n'
      + '  else elapsed = ts - startTs;\n'
      + '  var ratio = Math.min(1, elapsed / DUR);\n'
      + '  fills[current].style.width = (ratio * 100) + "%";\n'
      + '  if (ratio >= 1) { select((current + 1) % tabs.length); return; }   // 자동 다음 탭 (순환)\n'
      + '  raf = requestAnimationFrame(frame);\n'
      + '}\n'
      + 'function update(i){\n'
      + '  fills.forEach(function(f, j){ f.style.width = j < i ? "100%" : "0%"; });  // 지난 탭은 가득\n'
      + '  cancelAnimationFrame(raf);\n'
      + '  startTs = null; elapsed = 0;                   // 클릭 점프 포함 — 항상 0부터 재시작\n'
      + '  raf = requestAnimationFrame(frame);\n'
      + '}\n'
      + '// 사용자 개입이 항상 이긴다: hover 일시정지 / 이탈 시 재개\n'
      + 'list.addEventListener("mouseenter", function(){ paused = true; });\n'
      + 'list.addEventListener("mouseleave", function(){ paused = false; });',
    explain: '진행 바 fill 폭을 CSS transition이 아니라 requestAnimationFrame 루프에서 elapsed/5000 비율로 매 프레임 그린다 — transition width 5s로도 채울 수는 있지만 일시정지·재개·점프 때 남은 시간 계산이 꼬이므로, 시간을 직접 소유하는 rAF 모델이 정석이다. 일시정지는 별도 분기 로직 없이 기준 시각(startTs)을 매 프레임 뒤로 미루는 한 줄로 구현되어, 재개 시 멈춘 지점부터 자연스럽게 이어진다. 비율이 1에 도달하면 select((current+1)%N)으로 순환하고, 클릭 점프든 자동 전환이든 모든 경로가 같은 update()를 지나므로 타이머 초기화가 한 곳에 모인다. 지나간 탭의 바는 100%로 채워 두어 인스타그램 스토리식 진행감을 만든다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (rAF 시간 루프)' },
      { label: '트리거', value: '5초 자동 순환 + 클릭 즉시 점프 + 키보드 ← →' },
      { label: '진행 바', value: '탭 하단 3px 트랙 · fill 폭 0→100% 매 프레임 갱신' },
      { label: '주기', value: '5000ms/탭 · 마지막 탭 후 첫 탭으로 순환' },
      { label: '일시정지', value: 'tablist mouseenter → startTs 보정 동결 / mouseleave 재개' },
      { label: '시그니처', value: 'Instagram 스토리 / 히어로 캐러셀 / 제품 투어 배너' }
    ],
    guide: '주기는 4~7초가 적정 — 패널 본문을 읽는 데 필요한 시간보다 약간 길게 잡고, 텍스트 양이 탭마다 다르면 탭별 duration 배열로 차등을 둘 것. 자동 전환 UI의 철칙은 "사용자 개입이 항상 이긴다": hover 일시정지·클릭 점프는 필수이고, 한 번이라도 수동 조작했다면 자동 재생을 영구 중단하는 정책도 검토하라. 자동 움직임은 WCAG 2.2.2(일시정지·정지·숨기기)의 적용 대상이므로 보이는 재생/정지 버튼을 함께 노출하는 것이 가장 안전하고, prefers-reduced-motion 사용자에게는 자동 전환 자체를 끄는 분기를 넣는다.',
    recommendations: [
      { place: '히어로 헤더', body: '메인 히어로 캐러셀 — 제품 메시지 3~4개를 손대지 않아도 모두 노출' },
      { place: '랜딩 페이지', body: '고객 사례 자동 로테이션 — 진행 바가 "곧 넘어감"을 예고해 불안 없는 전환' },
      { place: '제품 섹션', body: '기능 하이라이트 자동 투어 — 스크린샷·데모 영상과 결합한 셀프 프레젠테이션' },
      { place: '포트폴리오 소개', body: '대표작 쇼케이스 자동 넘김 — 첫 화면에서 작업 스펙트럼을 어필' }
    ],
    tradeoff: '자동 전환은 읽는 속도를 사이트가 정하는 행위 — 읽는 중에 콘텐츠가 사라지는 경험은 대표적 이탈 요인이다(NN/g의 카루셀 회의론). WCAG 2.2.2상 5초 이상 자동 움직임에는 정지 수단이 필수. 백그라운드 탭에서는 rAF가 멈췄다 복귀 시 elapsed가 한 번에 점프해 즉시 전환될 수 있으므로 visibilitychange에서 startTs를 재보정하면 더 단단하다.'
  }
];

// ============ Standalone demo HTML 빌더 ============

function buildDemoHTML(p) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${p.num}. ${p.title} — Animated Tabs Demo</title>
  <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable-dynamic-subset.min.css" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body {
      background: #000; color: #fff;
      font-family: "Pretendard Variable", "Pretendard", -apple-system, system-ui, sans-serif;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }
    button { font: inherit; color: inherit; }
    .demo-controls {
      position: fixed; top: 16px; left: 16px;
      display: inline-flex; align-items: center; gap: 10px;
      z-index: 100;
    }
    .demo-reset {
      font: 600 11px/1 ui-monospace, SFMono-Regular, Menlo, monospace;
      color: rgba(255,255,255,0.72);
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.16);
      border-radius: 999px;
      padding: 8px 14px; cursor: pointer;
      transition: color 160ms, background 160ms, border-color 160ms;
    }
    .demo-reset:hover {
      color: #fff; background: rgba(255,255,255,0.14); border-color: rgba(255,255,255,0.32);
    }
    .demo-label {
      font: 500 10px/1 ui-monospace, SFMono-Regular, Menlo, monospace;
      color: rgba(255,255,255,0.3);
      letter-spacing: 0.14em; text-transform: uppercase;
    }
    .demo-hint {
      position: fixed; right: 16px; bottom: 24px;
      font: 500 11px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace;
      color: rgba(255,255,255,0.45);
      letter-spacing: 0.04em;
      z-index: 100;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 999px;
      padding: 8px 14px;
      animation: hint-pulse 2.4s ease-in-out infinite;
    }
    @keyframes hint-pulse {
      0%, 100% { opacity: 0.6; transform: translateY(0); }
      50%       { opacity: 1; transform: translateY(-3px); }
    }
    /* 공통 탭 스테이지 */
    ${BASE_CSS.replace(/\n/g, '\n    ')}
    /* 패턴별 CSS */
    ${p.demo.css.replace(/\n/g, '\n    ')}
  </style>
</head>
<body>
  <div class="demo-controls">
    <button class="demo-reset" type="button" onclick="window.__reset && window.__reset()">↻ 다시 보기</button>
    <span class="demo-label">${p.num} · ${p.title}</span>
  </div>
  <div class="demo-hint">${p.demo.hint}</div>

  <main class="stage">
    ${p.demo.bodyHTML.replace(/\n/g, '\n    ')}
  </main>

  <script>
    (function(){
      // 패턴별 JS — update(i, prev) 정의 + 인디케이터 헬퍼 (코어보다 먼저: var 초기화 순서)
      ${p.demo.js.replace(/\n/g, '\n      ')}
      // 공통 코어 — select / 키보드 / resize 재측정 / __reset(첫 탭) / select(0)
      ${JS_CORE.replace(/\n/g, '\n      ')}
    })();
  </script>
</body>
</html>
`;
}

// ============ 분석 보고서 블록 빌더 (15 블록 표준) ============

function buildPatternSection(p) {
  const blocks = [
    { type: 'text', value: p.summary },
    { type: 'heading', value: '라이브 데모' },
    {
      type: 'component',
      embed: 'demos/animated-tabs/' + p.id + '.html',
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
    tag: p.tag,
    desc: p.summary
  }));

  return {
    title: '00. 카테고리 개요',
    blocks: [
      { type: 'heading', value: '애니메이티드 탭 — 패턴 카탈로그 v1' },
      { type: 'text', value: CATEGORY.summary },
      { type: 'heading', value: '10 패턴 인덱스' },
      { type: 'structure', items: indexItems },
      { type: 'heading', value: '공통 디자인 토큰 + 인터랙션 모델' },
      {
        type: 'kv', columns: 2, items: [
          { label: '폰트', value: 'Pretendard Variable (한글 본문 표준)' },
          { label: '페이지 배경 / 본문', value: '#000 / #fff — 비활성 탭 rgba(255,255,255,0.55)' },
          { label: '인디케이터 표준 기법', value: 'offsetLeft·offsetWidth 측정 → transform: translateX() + width 보간 (세로는 offsetTop·offsetHeight → translateY + height)' },
          { label: '전환 시간', value: '인디케이터 260~320ms cubic-bezier(0.4,0,0.2,1) / 패널 페이드 120~220ms' },
          { label: '재측정', value: 'window resize + document.fonts.ready — 측정 기반 인디케이터의 필수 2종' },
          { label: '접근성', value: 'role="tablist/tab/tabpanel" + aria-selected + aria-controls + 화살표 키 이동' }
        ]
      },
      { type: 'heading', value: '읽기 가이드' },
      {
        type: 'structure', items: [
          { label: '라이브 데모', tag: 'IFRAME', desc: 'demos/animated-tabs/{pattern}.html 의 standalone 페이지를 iframe으로 임베드. 탭을 클릭하면 인디케이터가 미끄러지고 패널이 교체됨. ↻ 다시 보기는 첫 탭으로 초기화' },
          { label: '작동 원리', tag: 'HOW', desc: '한 줄 요약 + 1-2 문단으로 핵심 메커니즘 설명' },
          { label: '정량 메타', tag: 'KV', desc: '의존성 / 트리거 / 측정 / 전환 시간 / 재측정·시그니처 등 6항목' },
          { label: '코드 스니펫', tag: 'CODE', desc: 'HTML / CSS / JS 세 블록. 패턴별 핵심만(boilerplate 제외). aria 패턴 포함' },
          { label: '사용 가이드', tag: 'GUIDE', desc: '어떻게 사용하나 — duration·탭 수·라벨 길이·접근성·모션 감도' },
          { label: '활용 추천', tag: 'PLACES', desc: '히어로 헤더 / 랜딩 페이지 / 제품 섹션 / 포트폴리오 소개' },
          { label: '트레이드오프', tag: 'NOTE', desc: '성능·재측정 누락·사용성에 대한 한 줄 메모' }
        ]
      },
      {
        type: 'note',
        value: '참고 자료: Stripe 제품 페이지 탭·세그먼티드 컨트롤 (' + CATEGORY.url + ') + Linear 내비게이션(hover 유령)·iOS 세그먼티드 컨트롤. 본 카탈로그는 단일 컴포넌트가 아닌 10가지 애니메이티드 탭 변형 비교 카탈로그를 지향한다. 모든 데모는 사용자가 탭을 클릭할 때 전환되는 인터랙티브 데모이며(10번 오토 프로그레스만 히어로 캐러셀 문법으로 5초 자동 순환 + hover 일시정지 + 클릭 점프 예외), 인디케이터는 전 패턴이 측정 → transform·width(height) 보간 기법을 공유한다. ↻ 다시 보기는 첫 탭으로 초기화.'
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
    console.log('✓ demos/animated-tabs/' + p.id + '.html');
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

  console.log('✓ analyses/animated-tabs/analysis.json');
  console.log('  ' + PATTERNS.length + ' patterns + 1 overview = ' + (PATTERNS.length + 1) + ' sections');
  const totalBlocks = Object.values(sections).reduce((acc, s) => acc + s.blocks.length, 0);
  console.log('  ' + totalBlocks + ' blocks total');
}

main();
