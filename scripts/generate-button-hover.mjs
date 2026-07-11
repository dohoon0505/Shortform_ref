#!/usr/bin/env node
/**
 * Web Reference Lab — Category Generator: Button Hover (v1)
 * Framer Slide-In Button 참고 — 10종 버튼 hover 인터랙션 카탈로그
 *
 * - hover 인터랙션 (스크롤 매핑 아님)
 * - 검정 배경 + Pretendard Variable + 한국어 라벨
 * - 패턴마다 primary(filled) + outline 2개 버튼 쇼케이스
 *
 * Usage: node scripts/generate-button-hover.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ANALYSIS_DIR = join(ROOT, 'analyses', 'button-hover');
const ANALYSIS_FILE = join(ANALYSIS_DIR, 'analysis.json');
const DEMO_DIR = join(ROOT, 'demos', 'button-hover');

const CATEGORY = {
  id: 'button-hover',
  title: '버튼 hover',
  type: 'category',
  date: '2026-05-28',
  url: 'https://framer.com/m/Slide-In-Button-bb0t.js@AkIIpTKoP29X3k3M6qp2',
  summary: 'Framer Slide-In Button 컴포넌트를 참고로, 버튼에 마우스를 올렸을 때 시각적으로 반응하는 10가지 hover 인터랙션 패턴. 배경 채우기·텍스트 슬라이드·광택 스윕·스케일 스프링·배경 스와이프·아웃라인 필·아이콘 리빌·리플·글로우·마그네틱 등 CSS+JS 기반의 실용적 변형을 비교 카탈로그로 정리.'
};

/* ================================================================
   공통 CSS
   ================================================================ */

const BASE_CSS = ''
  + '.showcase {\n'
  + '  min-height: 100vh; display: flex; flex-direction: column;\n'
  + '  align-items: center; justify-content: center;\n'
  + '  gap: 24px; padding: 40px;\n'
  + '}\n'
  + '.btn {\n'
  + '  position: relative; overflow: hidden;\n'
  + '  display: inline-flex; align-items: center; gap: 10px;\n'
  + '  font: 600 16px/1 "Pretendard Variable","Pretendard",sans-serif;\n'
  + '  text-decoration: none; cursor: pointer; border: 0; outline: none;\n'
  + '  -webkit-tap-highlight-color: transparent;\n'
  + '}\n'
  + '.btn-label, .btn-icon { position: relative; z-index: 1; }\n'
  + '.btn-icon { font-size: 18px; transition: transform 0.3s ease, opacity 0.3s ease; }\n';

/* ================================================================
   공통 코드 스니펫 HTML
   ================================================================ */

const SNIPPET_HTML_BASE = '<a class="btn btn-primary" href="#">\n  <span class="btn-label">시작하기</span>\n  <span class="btn-icon">→</span>\n</a>\n<a class="btn btn-outline" href="#">\n  <span class="btn-label">자세히 보기</span>\n</a>';

/* ================================================================
   10 패턴 정의
   ================================================================ */

const PATTERNS = [
  // ── 01. slide-in-fill (Framer Slide-In Button) ──
  {
    id: 'slide-in-fill', num: '01', title: '슬라이드 인 필 (Framer 시그니처)',
    summary: 'Framer Slide-In Button 컴포넌트 재현. hover 시 작은 원이 하단 중앙에서 scale로 팽창하여 버튼 전체를 채우고, hover 해제 시 서서히 줄어들어 사라짐.',
    demo: {
      showcaseHTML: '<main class="showcase">\n'
        + '  <a class="btn btn-primary" href="#" onclick="return false">\n'
        + '    <span class="btn-fill"></span>\n'
        + '    <span class="btn-label">시작하기</span>\n'
        + '    <span class="btn-icon">→</span>\n'
        + '  </a>\n'
        + '  <a class="btn btn-outline" href="#" onclick="return false">\n'
        + '    <span class="btn-fill"></span>\n'
        + '    <span class="btn-label">자세히 보기</span>\n'
        + '  </a>\n'
        + '</main>',
      css: '.btn-primary { color: #000; background: #fff; padding: 18px 36px; border-radius: 39px; }\n'
        + '.btn-outline { color: rgba(255,255,255,0.9); background: transparent; border: 1px solid rgba(255,255,255,0.25); padding: 14px 28px; border-radius: 39px; }\n'
        + '.btn-fill { position: absolute; bottom: 0; left: 50%; width: 24px; height: 24px; border-radius: 50%; transform: translate(-50%, 50%) scale(0); transition: transform 0.5s cubic-bezier(0.34,1.56,0.64,1); z-index: 0; }\n'
        + '.btn-primary .btn-fill { background: #0055ff; }\n'
        + '.btn-outline .btn-fill { background: #fff; }\n'
        + '.btn-label, .btn-icon { transition: color 0.3s ease; }\n'
        + '.btn-primary:hover .btn-fill { transform: translate(-50%, 50%) scale(12); }\n'
        + '.btn-primary:hover .btn-label, .btn-primary:hover .btn-icon { color: #fff; }\n'
        + '.btn-outline:hover .btn-fill { transform: translate(-50%, 50%) scale(12); }\n'
        + '.btn-outline:hover .btn-label { color: #000; }',
      js: '',
      height: 400
    },
    snippetHTML: '<a class="btn btn-primary" href="#">\n  <span class="btn-fill"></span>\n  <span class="btn-label">시작하기</span>\n  <span class="btn-icon">→</span>\n</a>',
    snippetCSS: '.btn { position: relative; overflow: hidden; border-radius: 39px; }\n.btn-fill { position: absolute; bottom: 0; left: 50%;\n  width: 24px; height: 24px; border-radius: 50%;\n  background: #0055ff;\n  transform: translate(-50%, 50%) scale(0);\n  transition: transform 0.5s cubic-bezier(0.34,1.56,0.64,1); }\n.btn:hover .btn-fill { transform: translate(-50%, 50%) scale(12); }\n.btn:hover .btn-label { color: #fff; }',
    snippetJS: '// CSS only — JS 불필요\n// spring 이징: cubic-bezier(0.34, 1.56, 0.64, 1)\n// hover 해제 시 동일 transition으로 자연스럽게 축소',
    explain: 'Framer Slide-In Button의 핵심 메커니즘. .btn-fill 요소(24×24 원형)가 하단 중앙(bottom:0, left:50%)에서 scale(0→12)로 팽창하여 버튼 전체를 덮음. translate(-50%,50%)로 원의 중심을 버튼 하단 가장자리에 정확히 배치. hover 해제 시 동일 transition이 역방향으로 적용되어 원이 서서히 줄어들며 사라짐. cubic-bezier(0.34,1.56,0.64,1)이 spring bounce를 CSS로 근사. overflow:hidden이 필수.',
    kv: [
      { label: '의존성', value: 'CSS only (실제 요소 — pseudo-element 대신)' },
      { label: '트리거', value: ':hover → scale(0→12) 원형 팽창' },
      { label: '이징', value: 'cubic-bezier(0.34,1.56,0.64,1) — spring 근사' },
      { label: 'duration', value: '0.5s (scale) + 0.3s (color)' },
      { label: '핵심', value: '24px 원형 → scale(12) 팽창 + overflow:hidden' },
      { label: '참고', value: 'Framer Slide-In Button (spring 0.5s bounce 0.1)' }
    ],
    guide: 'scale 값은 버튼 크기에 따라 조정 — 버튼 대각선 길이 ÷ 원 반지름(12px) 이상이면 완전히 덮임. pill 버튼(border-radius 39px+)에서 가장 자연스러움. hover out 시 transition이 자동 역재생되므로 별도 처리 불필요.',
    recommendations: [
      { place: '히어로 헤더', body: 'SaaS 메인 CTA — 원형 팽창의 강한 시각적 피드백으로 클릭 유도' },
      { place: '랜딩 페이지', body: '가격 페이지 CTA — pill 형태 + 색상 전환' },
      { place: '제품 섹션', body: '제품 카드 하단 CTA — 카드 hover와 연계' },
      { place: '포트폴리오 소개', body: 'Contact CTA — 포인트 컬러 원형으로 채우기' }
    ],
    tradeoff: 'overflow:hidden 필수. scale 값이 버튼 크기에 비례해야 하므로 버튼 크기가 크게 달라지면 scale 재조정 필요.'
  },

  // ── 02. text-slide ──
  {
    id: 'text-slide', num: '02', title: '텍스트 슬라이드',
    summary: 'hover 시 텍스트가 위로 슬라이드하며 아래에서 동일 텍스트(다른 색)가 올라오는 swap 효과.',
    demo: {
      showcaseHTML: '<main class="showcase">\n'
        + '  <a class="btn btn-primary" href="#" onclick="return false">\n'
        + '    <span class="btn-text-wrap"><span class="btn-t">시작하기</span><span class="btn-t btn-t-hover">시작하기</span></span>\n'
        + '    <span class="btn-icon">→</span>\n'
        + '  </a>\n'
        + '  <a class="btn btn-outline" href="#" onclick="return false">\n'
        + '    <span class="btn-text-wrap"><span class="btn-t">자세히 보기</span><span class="btn-t btn-t-hover">자세히 보기</span></span>\n'
        + '  </a>\n'
        + '</main>',
      css: '.btn-primary { color: #000; background: #fff; padding: 18px 36px; border-radius: 999px; }\n'
        + '.btn-outline { color: rgba(255,255,255,0.9); background: transparent; border: 1px solid rgba(255,255,255,0.25); padding: 14px 28px; border-radius: 999px; }\n'
        + '.btn-text-wrap { display: inline-flex; flex-direction: column; overflow: hidden; height: 1em; line-height: 1; position: relative; z-index: 1; }\n'
        + '.btn-t { display: block; transition: transform 0.35s cubic-bezier(0.2,0,0,1); }\n'
        + '.btn-primary .btn-t-hover { color: #3b82f6; }\n'
        + '.btn-outline .btn-t-hover { color: #fff; }\n'
        + '.btn:hover .btn-t { transform: translateY(-100%); }',
      js: '',
      height: 400
    },
    snippetHTML: '<a class="btn" href="#">\n  <span class="btn-text-wrap">\n    <span class="btn-t">시작하기</span>\n    <span class="btn-t btn-t-hover">시작하기</span>\n  </span>\n</a>',
    snippetCSS: '.btn-text-wrap { display: inline-flex; flex-direction: column;\n  overflow: hidden; height: 1em; line-height: 1; }\n.btn-t { display: block;\n  transition: transform 0.35s cubic-bezier(0.2,0,0,1); }\n.btn-t-hover { color: #3b82f6; }\n.btn:hover .btn-t { transform: translateY(-100%); }',
    snippetJS: '// CSS only — JS 불필요',
    explain: '두 개의 동일 텍스트를 세로로 쌓고 overflow:hidden으로 첫 번째만 표시. hover 시 둘 다 translateY(-100%)로 이동하여 두 번째 텍스트(다른 색)가 드러남. height:1em이 정확한 한 줄 높이를 보장.',
    kv: [
      { label: '의존성', value: 'CSS only' },
      { label: '트리거', value: ':hover → translateY(-100%)' },
      { label: '이징', value: 'cubic-bezier(0.2,0,0,1)' },
      { label: 'duration', value: '0.35s' },
      { label: '핵심', value: 'overflow:hidden + height:1em + 2중 텍스트' },
      { label: '참고', value: 'Awwwards / Locomotive / Studio Freight' }
    ],
    guide: '텍스트가 동일해야 자연스러움. hover 텍스트 색상을 브랜드 컬러로 두면 포인트. height:1em이 핵심 — font-size나 line-height가 달라지면 어긋남.',
    recommendations: [
      { place: '히어로 헤더', body: 'CTA 버튼 — 텍스트 전환으로 시각 피드백' },
      { place: '랜딩 페이지', body: '네비게이션 링크 — 텍스트 슬라이드 인터랙션' },
      { place: '제품 섹션', body: '인라인 텍스트 링크 — 미니멀 호버' },
      { place: '포트폴리오 소개', body: '프로젝트 링크 — 타이포그래피 강조' }
    ],
    tradeoff: '텍스트를 두 번 반복해야 하므로 마크업이 늘어남. 긴 텍스트에서는 높이 계산이 어긋날 수 있음.'
  },

  // ── 03. shine-sweep ──
  {
    id: 'shine-sweep', num: '03', title: '샤인 스윕',
    summary: 'hover 시 대각선 광택(gradient)이 버튼을 가로질러 지나가는 프리미엄 효과.',
    demo: {
      showcaseHTML: '<main class="showcase">\n'
        + '  <a class="btn btn-primary" href="#" onclick="return false">\n'
        + '    <span class="btn-label">시작하기</span>\n'
        + '    <span class="btn-icon">→</span>\n'
        + '  </a>\n'
        + '  <a class="btn btn-outline" href="#" onclick="return false">\n'
        + '    <span class="btn-label">자세히 보기</span>\n'
        + '  </a>\n'
        + '</main>',
      css: '.btn-primary { color: #000; background: #fff; padding: 18px 36px; border-radius: 999px; }\n'
        + '.btn-outline { color: rgba(255,255,255,0.9); background: transparent; border: 1px solid rgba(255,255,255,0.25); padding: 14px 28px; border-radius: 999px; }\n'
        + '.btn::after { content: ""; position: absolute; top: 0; left: -80%; width: 60%; height: 100%; background: linear-gradient(120deg, transparent, rgba(255,255,255,0.35), transparent); z-index: 2; transition: left 0.6s ease; pointer-events: none; }\n'
        + '.btn-outline::after { background: linear-gradient(120deg, transparent, rgba(255,255,255,0.12), transparent); }\n'
        + '.btn:hover::after { left: 130%; }',
      js: '',
      height: 400
    },
    snippetHTML: SNIPPET_HTML_BASE,
    snippetCSS: '.btn { position: relative; overflow: hidden; }\n.btn::after { content: ""; position: absolute;\n  top: 0; left: -80%; width: 60%; height: 100%;\n  background: linear-gradient(120deg, transparent,\n    rgba(255,255,255,0.35), transparent);\n  transition: left 0.6s ease; }\n.btn:hover::after { left: 130%; }',
    snippetJS: '// CSS only — ::after pseudo-element',
    explain: '::after pseudo-element에 대각선 gradient(투명→반투명 흰색→투명)를 두고, hover 시 left -80%→130%로 이동. overflow:hidden이 필수. 버튼 배경 위에 광택이 지나가는 프리미엄 느낌.',
    kv: [
      { label: '의존성', value: 'CSS only (::after pseudo-element)' },
      { label: '트리거', value: ':hover → left 이동' },
      { label: '이징', value: 'ease (0.6s)' },
      { label: 'gradient', value: '120deg 대각선 (transparent → white 35% → transparent)' },
      { label: '핵심', value: 'overflow:hidden + pseudo-element left 이동' },
      { label: '참고', value: 'Apple / Tesla 프리미엄 CTA' }
    ],
    guide: 'gradient 각도를 110~130deg로 두면 자연스러운 대각선. 반투명도 0.2~0.4가 적정 — 너무 높으면 텍스트 가독성 저하. 어두운 버튼에서는 흰색 gradient, 밝은 버튼에서도 동일.',
    recommendations: [
      { place: '히어로 헤더', body: '프리미엄 브랜드 CTA — 고급스러운 광택' },
      { place: '랜딩 페이지', body: '제품 구매 버튼 — 시선 유도' },
      { place: '제품 섹션', body: '하이라이트 카드 CTA — 프리미엄 강조' },
      { place: '포트폴리오 소개', body: '연락하기 CTA — 세련된 인터랙션' }
    ],
    tradeoff: 'hover out 시 반대로 돌아가지 않고 사라짐 — transition이 한 방향. 반복 호버 시 약간의 지연.'
  },

  // ── 04. scale-spring ──
  {
    id: 'scale-spring', num: '04', title: '스케일 스프링',
    summary: 'hover 시 버튼이 spring bounce로 약간 커지고(1.06x) 그림자가 깊어지는 입체 효과.',
    demo: {
      showcaseHTML: '<main class="showcase">\n'
        + '  <a class="btn btn-primary" href="#" onclick="return false">\n'
        + '    <span class="btn-label">시작하기</span>\n'
        + '    <span class="btn-icon">→</span>\n'
        + '  </a>\n'
        + '  <a class="btn btn-outline" href="#" onclick="return false">\n'
        + '    <span class="btn-label">자세히 보기</span>\n'
        + '  </a>\n'
        + '</main>',
      css: '.btn-primary { color: #000; background: #fff; padding: 18px 36px; border-radius: 999px; transition: transform 0.5s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease; }\n'
        + '.btn-outline { color: rgba(255,255,255,0.9); background: transparent; border: 1px solid rgba(255,255,255,0.25); padding: 14px 28px; border-radius: 999px; transition: transform 0.5s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease, border-color 0.3s ease; }\n'
        + '.btn-primary:hover { transform: scale(1.06); box-shadow: 0 10px 40px -10px rgba(255,255,255,0.25); }\n'
        + '.btn-outline:hover { transform: scale(1.06); box-shadow: 0 10px 40px -10px rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.5); }\n'
        + '.btn:active { transform: scale(0.98); transition-duration: 0.1s; }',
      js: '',
      height: 400
    },
    snippetHTML: SNIPPET_HTML_BASE,
    snippetCSS: '.btn { transition: transform 0.5s cubic-bezier(0.34,1.56,0.64,1),\n  box-shadow 0.3s ease; }\n.btn:hover { transform: scale(1.06);\n  box-shadow: 0 10px 40px -10px rgba(255,255,255,0.25); }\n.btn:active { transform: scale(0.98); transition-duration: 0.1s; }',
    snippetJS: '// CSS only — spring 이징으로 bounce 근사',
    explain: 'hover 시 scale(1.06)으로 확대 + box-shadow 깊이 증가. cubic-bezier(0.34,1.56,0.64,1)이 spring overshoot를 근사하여 튕기는 느낌. :active에서 scale(0.98)로 눌림 피드백.',
    kv: [
      { label: '의존성', value: 'CSS only' },
      { label: '트리거', value: ':hover → scale + shadow' },
      { label: '이징', value: 'cubic-bezier(0.34,1.56,0.64,1) — spring' },
      { label: 'duration', value: '0.5s (scale) + 0.3s (shadow)' },
      { label: '핵심', value: 'scale 1.04~1.08 + shadow depth 증가' },
      { label: '참고', value: 'iOS 버튼 / Stripe 인터랙션' }
    ],
    guide: 'scale 1.04~1.08이 적정. 1.1 이상은 과장됨. :active 축소(0.96~0.98)를 추가하면 클릭 피드백 완성. overflow:hidden 없이 사용 가능.',
    recommendations: [
      { place: '히어로 헤더', body: '메인 CTA — 자연스러운 입체감' },
      { place: '랜딩 페이지', body: '카드 CTA — 카드 자체와 별개로 버튼만 반응' },
      { place: '제품 섹션', body: '장바구니 추가 — 터치 피드백 대체' },
      { place: '포트폴리오 소개', body: '프로젝트 보기 — 간결한 반응' }
    ],
    tradeoff: '주변 요소 배치가 흐트러질 수 있음 — will-change:transform 또는 고정 크기 컨테이너 권장.'
  },

  // ── 05. bg-swipe ──
  {
    id: 'bg-swipe', num: '05', title: '배경 스와이프',
    summary: 'hover 시 배경 색상이 좌→우로 스와이프하며 채워지고 텍스트 색상이 전환.',
    demo: {
      showcaseHTML: '<main class="showcase">\n'
        + '  <a class="btn btn-primary" href="#" onclick="return false">\n'
        + '    <span class="btn-label">시작하기</span>\n'
        + '    <span class="btn-icon">→</span>\n'
        + '  </a>\n'
        + '  <a class="btn btn-outline" href="#" onclick="return false">\n'
        + '    <span class="btn-label">자세히 보기</span>\n'
        + '  </a>\n'
        + '</main>',
      css: '.btn-primary { color: #fff; background: transparent; border: 1px solid #fff; padding: 18px 36px; border-radius: 999px; }\n'
        + '.btn-outline { color: rgba(255,255,255,0.7); background: transparent; border: 1px solid rgba(255,255,255,0.25); padding: 14px 28px; border-radius: 999px; }\n'
        + '.btn::before { content: ""; position: absolute; top: 0; left: 0; width: 0; height: 100%; border-radius: inherit; z-index: 0; transition: width 0.4s cubic-bezier(0.2,0,0,1); }\n'
        + '.btn-primary::before { background: #fff; }\n'
        + '.btn-outline::before { background: rgba(255,255,255,0.1); }\n'
        + '.btn:hover::before { width: 100%; }\n'
        + '.btn-label, .btn-icon { transition: color 0.3s ease; }\n'
        + '.btn-primary:hover .btn-label, .btn-primary:hover .btn-icon { color: #000; }\n'
        + '.btn-outline:hover .btn-label { color: #fff; }',
      js: '',
      height: 400
    },
    snippetHTML: SNIPPET_HTML_BASE,
    snippetCSS: '.btn { position: relative; overflow: hidden;\n  border: 1px solid #fff; background: transparent; }\n.btn::before { content: ""; position: absolute;\n  top: 0; left: 0; width: 0; height: 100%;\n  background: #fff; border-radius: inherit;\n  transition: width 0.4s cubic-bezier(0.2,0,0,1); }\n.btn:hover::before { width: 100%; }\n.btn:hover .btn-label { color: #000; }',
    snippetJS: '// CSS only — ::before pseudo-element',
    explain: '::before pseudo-element가 width 0→100%로 좌→우 확장. border-radius:inherit으로 버튼 곡률 유지. 텍스트는 z-index:1로 위에 유지되고 색상만 transition.',
    kv: [
      { label: '의존성', value: 'CSS only (::before)' },
      { label: '트리거', value: ':hover → width 0→100%' },
      { label: '이징', value: 'cubic-bezier(0.2,0,0,1)' },
      { label: 'duration', value: '0.4s' },
      { label: '핵심', value: '::before width + border-radius:inherit' },
      { label: '참고', value: '클래식 버튼 hover 패턴' }
    ],
    guide: '가장 범용적인 hover fill. 방향을 바꾸려면 left→right 대신 right:0으로. border-radius:inherit이 핵심 — 별도 값을 주면 모서리가 어긋남.',
    recommendations: [
      { place: '히어로 헤더', body: '다크 모드 사이트의 ghost 버튼 CTA' },
      { place: '랜딩 페이지', body: '섹션 구분 CTA — 깔끔한 색상 전환' },
      { place: '제품 섹션', body: '제품 카드 버튼 — 카드 테마와 맞춤' },
      { place: '포트폴리오 소개', body: '프로젝트 링크 — 미니멀 인터랙션' }
    ],
    tradeoff: '한 방향(좌→우)만 자연스러움. 양방향이 필요하면 center-origin 패턴으로 변형.'
  },

  // ── 06. outline-fill ──
  {
    id: 'outline-fill', num: '06', title: '아웃라인 필',
    summary: 'hover 시 center에서 scale(0)→scale(1)로 배경이 확장 — 아웃라인 → 솔리드 전환.',
    demo: {
      showcaseHTML: '<main class="showcase">\n'
        + '  <a class="btn btn-primary" href="#" onclick="return false">\n'
        + '    <span class="btn-label">시작하기</span>\n'
        + '    <span class="btn-icon">→</span>\n'
        + '  </a>\n'
        + '  <a class="btn btn-outline" href="#" onclick="return false">\n'
        + '    <span class="btn-label">자세히 보기</span>\n'
        + '  </a>\n'
        + '</main>',
      css: '.btn-primary { color: #fff; background: transparent; border: 2px solid #3b82f6; padding: 18px 36px; border-radius: 999px; }\n'
        + '.btn-outline { color: rgba(255,255,255,0.7); background: transparent; border: 1px solid rgba(255,255,255,0.25); padding: 14px 28px; border-radius: 999px; }\n'
        + '.btn::before { content: ""; position: absolute; inset: 0; border-radius: inherit; transform: scale(0); transform-origin: center; z-index: 0; transition: transform 0.4s cubic-bezier(0.2,0,0,1); }\n'
        + '.btn-primary::before { background: #3b82f6; }\n'
        + '.btn-outline::before { background: rgba(255,255,255,0.08); }\n'
        + '.btn:hover::before { transform: scale(1); }\n'
        + '.btn-label, .btn-icon { transition: color 0.3s ease; }\n'
        + '.btn-primary:hover .btn-label, .btn-primary:hover .btn-icon { color: #fff; }',
      js: '',
      height: 400
    },
    snippetHTML: SNIPPET_HTML_BASE,
    snippetCSS: '.btn { position: relative; overflow: hidden;\n  border: 2px solid #3b82f6; background: transparent; }\n.btn::before { content: ""; position: absolute; inset: 0;\n  background: #3b82f6; border-radius: inherit;\n  transform: scale(0); transform-origin: center;\n  transition: transform 0.4s cubic-bezier(0.2,0,0,1); }\n.btn:hover::before { transform: scale(1); }',
    snippetJS: '// CSS only — center origin scale',
    explain: '::before가 inset:0으로 버튼 전체를 덮되 scale(0)에서 시작. hover 시 scale(1)로 중앙에서 확장. border-radius:inherit으로 곡률 유지. 아웃라인→솔리드 자연스러운 전환.',
    kv: [
      { label: '의존성', value: 'CSS only' },
      { label: '트리거', value: ':hover → scale(0→1)' },
      { label: '이징', value: 'cubic-bezier(0.2,0,0,1)' },
      { label: 'duration', value: '0.4s' },
      { label: '핵심', value: 'inset:0 + transform-origin:center + scale' },
      { label: '참고', value: 'Vercel / Linear ghost 버튼' }
    ],
    guide: 'transform-origin을 바꾸면 확장 시작점 변경 가능 (top-left, bottom-right 등). border 색상과 fill 색상을 맞추면 자연스러움.',
    recommendations: [
      { place: '히어로 헤더', body: '보조 CTA (ghost → solid 전환)' },
      { place: '랜딩 페이지', body: '문의하기 버튼 — 아웃라인 default + hover fill' },
      { place: '제품 섹션', body: '더보기 링크 — 서브 CTA' },
      { place: '포트폴리오 소개', body: '이력서 다운로드 — 보조 액션' }
    ],
    tradeoff: 'scale 전환이라 중간에 border와 fill 경계가 살짝 보일 수 있음. inset:-1px로 보정 가능.'
  },

  // ── 07. icon-reveal ──
  {
    id: 'icon-reveal', num: '07', title: '아이콘 리빌',
    summary: 'hover 시 화살표 아이콘이 우측에서 슬라이드 인, 텍스트는 좌측으로 이동.',
    demo: {
      showcaseHTML: '<main class="showcase">\n'
        + '  <a class="btn btn-primary" href="#" onclick="return false">\n'
        + '    <span class="btn-label">시작하기</span>\n'
        + '    <span class="btn-icon btn-icon-reveal">→</span>\n'
        + '  </a>\n'
        + '  <a class="btn btn-outline" href="#" onclick="return false">\n'
        + '    <span class="btn-label">자세히 보기</span>\n'
        + '    <span class="btn-icon btn-icon-reveal">→</span>\n'
        + '  </a>\n'
        + '</main>',
      css: '.btn-primary { color: #000; background: #fff; padding: 18px 36px; border-radius: 999px; transition: gap 0.35s cubic-bezier(0.2,0,0,1); gap: 0; }\n'
        + '.btn-outline { color: rgba(255,255,255,0.9); background: transparent; border: 1px solid rgba(255,255,255,0.25); padding: 14px 28px; border-radius: 999px; transition: gap 0.35s cubic-bezier(0.2,0,0,1); gap: 0; }\n'
        + '.btn-icon-reveal { max-width: 0; opacity: 0; transform: translateX(-8px); transition: max-width 0.35s cubic-bezier(0.2,0,0,1), opacity 0.25s ease, transform 0.35s cubic-bezier(0.2,0,0,1); overflow: hidden; }\n'
        + '.btn:hover { gap: 8px; }\n'
        + '.btn:hover .btn-icon-reveal { max-width: 24px; opacity: 1; transform: translateX(0); }',
      js: '',
      height: 400
    },
    snippetHTML: '<a class="btn" href="#">\n  <span class="btn-label">시작하기</span>\n  <span class="btn-icon-reveal">→</span>\n</a>',
    snippetCSS: '.btn { display: inline-flex; gap: 0;\n  transition: gap 0.35s cubic-bezier(0.2,0,0,1); }\n.btn-icon-reveal { max-width: 0; opacity: 0;\n  transform: translateX(-8px);\n  transition: max-width 0.35s, opacity 0.25s, transform 0.35s; }\n.btn:hover { gap: 8px; }\n.btn:hover .btn-icon-reveal {\n  max-width: 24px; opacity: 1; transform: translateX(0); }',
    snippetJS: '// CSS only — gap + max-width 전환',
    explain: '아이콘의 max-width:0 + opacity:0에서 시작. hover 시 max-width:24px + opacity:1로 전환. flex gap도 0→8px로 전환되어 텍스트가 자연스럽게 좌측으로. translateX(-8px→0)이 슬라이드 느낌 추가.',
    kv: [
      { label: '의존성', value: 'CSS only' },
      { label: '트리거', value: ':hover → max-width + gap + opacity' },
      { label: '이징', value: 'cubic-bezier(0.2,0,0,1)' },
      { label: 'duration', value: '0.35s' },
      { label: '핵심', value: 'max-width:0 + gap 전환 (아이콘 공간 확보)' },
      { label: '참고', value: 'Framer Slide-In Button 아이콘 진입' }
    ],
    guide: 'gap 전환이 핵심 — max-width만으로는 텍스트와의 간격이 없음. overflow:hidden을 아이콘에만 적용. 아이콘은 →, ↗, ▸ 등 방향성 있는 기호 권장.',
    recommendations: [
      { place: '히어로 헤더', body: 'CTA — hover 시 방향성 강조' },
      { place: '랜딩 페이지', body: '더 알아보기 링크 — 인라인 아이콘' },
      { place: '제품 섹션', body: '카드 CTA — 아이콘으로 클릭 유도' },
      { place: '포트폴리오 소개', body: '프로젝트 링크 — 미니멀 + 아이콘' }
    ],
    tradeoff: 'max-width 전환이 GPU 가속 안 됨. 매우 긴 전환(>0.5s)에서는 약간 jank. 짧은 전환(0.3~0.4s) 권장.'
  },

  // ── 08. ripple ──
  {
    id: 'ripple', num: '08', title: '리플',
    summary: 'hover 시 커서 위치에서 원형 파동이 퍼져나가는 Material Design 스타일 리플.',
    demo: {
      showcaseHTML: '<main class="showcase">\n'
        + '  <a class="btn btn-primary" href="#" onclick="return false">\n'
        + '    <span class="btn-label">시작하기</span>\n'
        + '    <span class="btn-icon">→</span>\n'
        + '  </a>\n'
        + '  <a class="btn btn-outline" href="#" onclick="return false">\n'
        + '    <span class="btn-label">자세히 보기</span>\n'
        + '  </a>\n'
        + '</main>',
      css: '.btn-primary { color: #000; background: #fff; padding: 18px 36px; border-radius: 999px; }\n'
        + '.btn-outline { color: rgba(255,255,255,0.9); background: transparent; border: 1px solid rgba(255,255,255,0.25); padding: 14px 28px; border-radius: 999px; }\n'
        + '.btn-ripple { position: absolute; border-radius: 50%; transform: scale(0); animation: ripple-expand 0.6s ease-out forwards; pointer-events: none; z-index: 0; }\n'
        + '.btn-primary .btn-ripple { background: rgba(59,130,246,0.25); }\n'
        + '.btn-outline .btn-ripple { background: rgba(255,255,255,0.12); }\n'
        + '@keyframes ripple-expand { to { transform: scale(4); opacity: 0; } }',
      js: 'document.querySelectorAll(".btn").forEach(function(btn){\n'
        + '  btn.addEventListener("mouseenter", function(e){\n'
        + '    var rect = btn.getBoundingClientRect();\n'
        + '    var ripple = document.createElement("span");\n'
        + '    ripple.className = "btn-ripple";\n'
        + '    var size = Math.max(rect.width, rect.height);\n'
        + '    ripple.style.width = ripple.style.height = size + "px";\n'
        + '    ripple.style.left = (e.clientX - rect.left - size / 2) + "px";\n'
        + '    ripple.style.top = (e.clientY - rect.top - size / 2) + "px";\n'
        + '    btn.appendChild(ripple);\n'
        + '    ripple.addEventListener("animationend", function(){ ripple.remove(); });\n'
        + '  });\n'
        + '});',
      height: 400
    },
    snippetHTML: SNIPPET_HTML_BASE,
    snippetCSS: '.btn { position: relative; overflow: hidden; }\n.btn-ripple { position: absolute; border-radius: 50%;\n  background: rgba(59,130,246,0.25);\n  transform: scale(0);\n  animation: ripple-expand 0.6s ease-out forwards; }\n@keyframes ripple-expand { to { transform: scale(4); opacity: 0; } }',
    snippetJS: 'btn.addEventListener("mouseenter", function(e){\n  var rect = btn.getBoundingClientRect();\n  var ripple = document.createElement("span");\n  ripple.className = "btn-ripple";\n  var size = Math.max(rect.width, rect.height);\n  ripple.style.width = ripple.style.height = size + "px";\n  ripple.style.left = (e.clientX - rect.left - size/2) + "px";\n  ripple.style.top = (e.clientY - rect.top - size/2) + "px";\n  btn.appendChild(ripple);\n});',
    explain: 'mouseenter 시 커서 좌표에서 원형 span 생성. scale(0→4) + opacity(1→0) 애니메이션 0.6s. overflow:hidden 필수. animationend에서 DOM 정리.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (커서 위치 계산)' },
      { label: '트리거', value: 'mouseenter → span 생성 + animation' },
      { label: '이징', value: 'ease-out (0.6s)' },
      { label: 'scale', value: '0 → 4 (버튼 크기의 4배)' },
      { label: '핵심', value: '커서 위치 기반 ripple origin' },
      { label: '참고', value: 'Material Design / Google 버튼' }
    ],
    guide: 'scale 최종값은 버튼 크기에 따라 3~5. DOM에 ripple span이 누적되므로 animationend에서 반드시 remove(). click이 아닌 hover에서도 동작하도록 mouseenter 사용.',
    recommendations: [
      { place: '히어로 헤더', body: 'Material 스타일 CTA — 인터랙티브 피드백' },
      { place: '랜딩 페이지', body: '폼 제출 버튼 — 클릭/터치 피드백' },
      { place: '제품 섹션', body: '장바구니 추가 — 즉각 반응' },
      { place: '포트폴리오 소개', body: '인터랙티브 데모 버튼 — 동적 시각' }
    ],
    tradeoff: 'JS 필수. DOM에 span이 생성/삭제되므로 GC 비용. 빠른 반복 hover 시 여러 ripple 동시 생성.'
  },

  // ── 09. glow ──
  {
    id: 'glow', num: '09', title: '글로우',
    summary: 'hover 시 네온 보더 글로우 + 외부 그림자 — 어두운 배경에서 빛나는 버튼.',
    demo: {
      showcaseHTML: '<main class="showcase">\n'
        + '  <a class="btn btn-primary" href="#" onclick="return false">\n'
        + '    <span class="btn-label">시작하기</span>\n'
        + '    <span class="btn-icon">→</span>\n'
        + '  </a>\n'
        + '  <a class="btn btn-outline" href="#" onclick="return false">\n'
        + '    <span class="btn-label">자세히 보기</span>\n'
        + '  </a>\n'
        + '</main>',
      css: '.btn-primary { color: #3b82f6; background: transparent; border: 1px solid rgba(59,130,246,0.4); padding: 18px 36px; border-radius: 999px; transition: border-color 0.3s ease, box-shadow 0.3s ease, text-shadow 0.3s ease, color 0.3s ease; }\n'
        + '.btn-outline { color: rgba(255,255,255,0.6); background: transparent; border: 1px solid rgba(255,255,255,0.15); padding: 14px 28px; border-radius: 999px; transition: border-color 0.3s ease, box-shadow 0.3s ease, text-shadow 0.3s ease, color 0.3s ease; }\n'
        + '.btn-primary:hover { color: #60a5fa; border-color: #3b82f6; box-shadow: 0 0 20px rgba(59,130,246,0.35), 0 0 60px rgba(59,130,246,0.12), inset 0 0 20px rgba(59,130,246,0.06); text-shadow: 0 0 12px rgba(59,130,246,0.5); }\n'
        + '.btn-outline:hover { color: #fff; border-color: rgba(255,255,255,0.5); box-shadow: 0 0 16px rgba(255,255,255,0.1), 0 0 48px rgba(255,255,255,0.05); text-shadow: 0 0 8px rgba(255,255,255,0.3); }\n'
        + '.btn-icon { transition: color 0.3s ease, text-shadow 0.3s ease; }\n'
        + '.btn-primary:hover .btn-icon { color: #60a5fa; text-shadow: 0 0 12px rgba(59,130,246,0.5); }',
      js: '',
      height: 400
    },
    snippetHTML: SNIPPET_HTML_BASE,
    snippetCSS: '.btn { border: 1px solid rgba(59,130,246,0.4); color: #3b82f6;\n  transition: box-shadow 0.3s, border-color 0.3s, text-shadow 0.3s; }\n.btn:hover { border-color: #3b82f6;\n  box-shadow: 0 0 20px rgba(59,130,246,0.35),\n    0 0 60px rgba(59,130,246,0.12),\n    inset 0 0 20px rgba(59,130,246,0.06);\n  text-shadow: 0 0 12px rgba(59,130,246,0.5); }',
    snippetJS: '// CSS only — box-shadow + text-shadow',
    explain: 'box-shadow 3중(외부 근거리 + 외부 원거리 + 내부 glow) + text-shadow로 네온 효과. border-color도 함께 밝아짐. 어두운 배경(#0a0a0a 이하)에서만 효과적.',
    kv: [
      { label: '의존성', value: 'CSS only' },
      { label: '트리거', value: ':hover → box-shadow + text-shadow + border-color' },
      { label: '이징', value: 'ease (0.3s)' },
      { label: '글로우 색상', value: '#3b82f6 (blue-500) 계열' },
      { label: '핵심', value: '3중 box-shadow + text-shadow + inset glow' },
      { label: '참고', value: 'Vercel / 사이버펑크 UI' }
    ],
    guide: 'box-shadow를 3단계로 분리(20px 근거리 + 60px 원거리 + inset)하면 깊이감. text-shadow도 같은 색상으로. 밝은 배경에서는 효과 미미.',
    recommendations: [
      { place: '히어로 헤더', body: '다크 모드 전용 CTA — 네온 강조' },
      { place: '랜딩 페이지', body: 'SaaS 다크 테마 — 기술적 느낌' },
      { place: '제품 섹션', body: '프리미엄 기능 CTA — 하이라이트' },
      { place: '포트폴리오 소개', body: '개발자 포트폴리오 — 사이버 감성' }
    ],
    tradeoff: '밝은 배경에서 무용. box-shadow 다중이라 모바일 렌더링 비용 약간. 남용하면 산만.'
  },

  // ── 10. magnetic ──
  {
    id: 'magnetic', num: '10', title: '마그네틱',
    summary: 'hover 영역 내에서 버튼이 커서를 따라 미세하게 이동 — 자석처럼 끌리는 인터랙션.',
    demo: {
      showcaseHTML: '<main class="showcase">\n'
        + '  <div class="mag-zone">\n'
        + '    <a class="btn btn-primary mag-btn" href="#" onclick="return false">\n'
        + '      <span class="btn-label">시작하기</span>\n'
        + '      <span class="btn-icon">→</span>\n'
        + '    </a>\n'
        + '  </div>\n'
        + '  <div class="mag-zone">\n'
        + '    <a class="btn btn-outline mag-btn" href="#" onclick="return false">\n'
        + '      <span class="btn-label">자세히 보기</span>\n'
        + '    </a>\n'
        + '  </div>\n'
        + '</main>',
      css: '.btn-primary { color: #000; background: #fff; padding: 18px 36px; border-radius: 999px; transition: transform 0.25s cubic-bezier(0.2,0,0,1); }\n'
        + '.btn-outline { color: rgba(255,255,255,0.9); background: transparent; border: 1px solid rgba(255,255,255,0.25); padding: 14px 28px; border-radius: 999px; transition: transform 0.25s cubic-bezier(0.2,0,0,1); }\n'
        + '.mag-zone { padding: 24px; display: flex; align-items: center; justify-content: center; }',
      js: 'document.querySelectorAll(".mag-zone").forEach(function(zone){\n'
        + '  var btn = zone.querySelector(".mag-btn");\n'
        + '  zone.addEventListener("mousemove", function(e){\n'
        + '    var rect = zone.getBoundingClientRect();\n'
        + '    var x = e.clientX - rect.left - rect.width / 2;\n'
        + '    var y = e.clientY - rect.top - rect.height / 2;\n'
        + '    btn.style.transform = "translate(" + (x * 0.2) + "px," + (y * 0.3) + "px)";\n'
        + '  });\n'
        + '  zone.addEventListener("mouseleave", function(){\n'
        + '    btn.style.transform = "translate(0,0)";\n'
        + '  });\n'
        + '});',
      height: 400
    },
    snippetHTML: '<div class="mag-zone">\n  <a class="btn mag-btn" href="#">\n    <span class="btn-label">시작하기</span>\n    <span class="btn-icon">→</span>\n  </a>\n</div>',
    snippetCSS: '.mag-zone { padding: 24px; display: flex;\n  align-items: center; justify-content: center; }\n.btn { transition: transform 0.25s cubic-bezier(0.2,0,0,1); }',
    snippetJS: 'zone.addEventListener("mousemove", function(e){\n  var rect = zone.getBoundingClientRect();\n  var x = e.clientX - rect.left - rect.width / 2;\n  var y = e.clientY - rect.top - rect.height / 2;\n  btn.style.transform = "translate(" + (x*0.2) + "px," + (y*0.3) + "px)";\n});\nzone.addEventListener("mouseleave", function(){\n  btn.style.transform = "translate(0,0)";\n});',
    explain: '버튼을 감싸는 .mag-zone에서 mousemove 이벤트 발생. 커서와 zone 중심의 차이를 계수(0.2x, 0.3y)만큼 translate. mouseleave 시 원래 위치로 복귀(transition 0.25s). zone 패딩이 hover 감지 영역.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (mousemove 계산)' },
      { label: '트리거', value: 'mousemove → translate(커서 오프셋 × 계수)' },
      { label: '이징', value: 'cubic-bezier(0.2,0,0,1) (leave 복귀)' },
      { label: '계수', value: 'x: 0.2, y: 0.3 (미세 이동)' },
      { label: '핵심', value: '.mag-zone 감지 영역 + 오프셋 translate' },
      { label: '참고', value: 'Awwwards / Locomotive / Apple 사이트' }
    ],
    guide: '계수 0.15~0.3이 자연스러움. 0.5 이상은 과장됨. zone 패딩이 클수록 감지 범위 넓어짐(24~48px 권장). leave 시 transition이 부드러운 복귀 담당.',
    recommendations: [
      { place: '히어로 헤더', body: '메인 CTA — 시선을 끌어당기는 마그네틱' },
      { place: '랜딩 페이지', body: '크리에이티브 에이전시 사이트 — 인터랙티브 디테일' },
      { place: '제품 섹션', body: '하이라이트 버튼 — 유니크한 피드백' },
      { place: '포트폴리오 소개', body: '디자이너 포트폴리오 — Awwwards 감성' }
    ],
    tradeoff: 'JS 필수. 모바일(터치)에서는 의미 없음 — hover 없으므로 fallback 필요. mousemove가 60fps 이벤트라 throttle 고려.'
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
    + '  <title>' + p.num + '. ' + p.title + ' — Button Hover Demo</title>\n'
    + '  <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable-dynamic-subset.min.css" rel="stylesheet">\n'
    + '  <style>\n'
    + '    * { box-sizing: border-box; }\n'
    + '    html, body { margin: 0; padding: 0; }\n'
    + '    body { background: #0a0a0a; color: #fff; font-family: "Pretendard Variable","Pretendard",sans-serif; -webkit-font-smoothing: antialiased; }\n'
    + '    .demo-controls { position: fixed; top: 16px; left: 16px; display: inline-flex; align-items: center; gap: 10px; z-index: 100; }\n'
    + '    .demo-label { font: 500 10px/1 "Pretendard Variable","Pretendard",sans-serif; color: rgba(255,255,255,0.35); letter-spacing: 0.14em; text-transform: uppercase; }\n'
    + '    .demo-hint { position: fixed; right: 16px; bottom: 24px; font: 500 11px/1.4 "Pretendard Variable","Pretendard",sans-serif; color: rgba(255,255,255,0.35); letter-spacing: 0.04em; z-index: 100; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 999px; padding: 8px 14px; animation: hint-pulse 2.4s ease-in-out infinite; }\n'
    + '    @keyframes hint-pulse { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }\n'
    + '    ' + BASE_CSS.replace(/\n/g, '\n    ') + '\n'
    + '    ' + p.demo.css.replace(/\n/g, '\n    ') + '\n'
    + '  </style>\n'
    + '</head>\n'
    + '<body>\n'
    + '  <div class="demo-controls">\n'
    + '    <span class="demo-label">' + p.num + ' · ' + p.title + '</span>\n'
    + '  </div>\n'
    + '  <div class="demo-hint">버튼에 호버해보세요 ↗</div>\n'
    + '\n'
    + '  ' + p.demo.showcaseHTML.replace(/\n/g, '\n  ') + '\n'
    + '\n'
    + (p.demo.js ? '  <script>\n    (function(){\n      ' + p.demo.js.replace(/\n/g, '\n      ') + '\n    })();\n  </script>\n' : '')
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
        embed: 'demos/button-hover/' + p.id + '.html',
        embedHeight: p.demo.height || 400,
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
      { type: 'heading', value: '버튼 hover — Framer Slide-In Button 기반 10종 패턴' },
      { type: 'text', value: CATEGORY.summary },
      { type: 'heading', value: '10 패턴 인덱스' },
      { type: 'structure', items: indexItems },
      { type: 'heading', value: '공통 디자인 토큰' },
      {
        type: 'kv', columns: 2, items: [
          { label: '폰트', value: 'Pretendard Variable 600' },
          { label: '버튼 크기', value: 'primary 18px 36px / outline 14px 28px' },
          { label: 'border-radius', value: '999px (pill) 또는 39px (Framer 참고)' },
          { label: '배경', value: '#0a0a0a (다크)' },
          { label: 'primary 색상', value: '#fff bg + #000 text (hover 시 변형)' },
          { label: 'outline 색상', value: 'transparent bg + rgba(255,255,255,0.25) border' },
          { label: '이징 참고', value: 'spring 근사 cubic-bezier(0.34,1.56,0.64,1)' },
          { label: 'Framer 참고', value: 'Slide-In Button (spring 0.5s bounce 0.1)' }
        ]
      },
      { type: 'heading', value: '읽기 가이드' },
      {
        type: 'structure', items: [
          { label: '라이브 데모', tag: 'IFRAME', desc: 'demos/button-hover/{pattern}.html — 버튼 hover 인터랙션' },
          { label: '작동 원리', tag: 'HOW', desc: ':hover → CSS transition / JS mousemove 매핑' },
          { label: '정량 메타', tag: 'KV', desc: '의존성 / 트리거 / 이징 / duration / 핵심 메커니즘' },
          { label: '코드 스니펫', tag: 'CODE', desc: 'HTML / CSS / JS — 패턴별 핵심 코드' },
          { label: '사용 가이드', tag: 'GUIDE', desc: '파라미터·주의점·모바일 fallback' },
          { label: '활용 추천', tag: 'PLACES', desc: '히어로 / 랜딩 / 제품 / 포트폴리오 4건' },
          { label: '트레이드오프', tag: 'NOTE', desc: '성능·접근성·권장 사용처' }
        ]
      },
      {
        type: 'note',
        value: 'Framer Slide-In Button 컴포넌트(spring 0.5s, bounce 0.1, fill from bottom, ArrowRight icon)를 첫 번째 패턴으로 재현하고, 9가지 추가 변형을 비교 카탈로그로 정리. 모든 데모는 다크 배경(#0a0a0a) + Pretendard Variable + 한국어 라벨.'
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
    console.log('✓ demos/button-hover/' + p.id + '.html');
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
  console.log('✓ analyses/button-hover/analysis.json');
  console.log('  ' + PATTERNS.length + ' patterns + 1 overview = ' + (PATTERNS.length + 1) + ' sections');
  var totalBlocks = Object.values(sections).reduce(function (acc, s) { return acc + s.blocks.length; }, 0);
  console.log('  ' + totalBlocks + ' blocks total');
}

main();
