#!/usr/bin/env node
/**
 * Interaction Lab — Category Generator: 아코디언 FAQ (v1)
 *
 * Eleken "Accordion UI" 아티클 + stripe.com / linear.app 실측 데이터 참고.
 * 10종 아코디언 FAQ 패턴을 standalone HTML로 작성 후 iframe 임베드.
 *
 * - 자동 재생 없음. 사용자가 질문을 클릭해야 답변이 펼쳐짐.
 * - 검정 배경 + Pretendard Variable + 한국어 Q&A (디자인 서비스 컨텍스트).
 * - 핵심 기법: grid-template-rows 0fr→1fr + overflow:hidden (JS 높이 측정 불필요).
 * - 접근성: button + aria-expanded + aria-controls + role="region".
 * - ↻ 다시 보기 = 모든 항목 닫기 (이미지 동반·네스티드는 기본 상태 복원).
 *
 * Usage: node scripts/generate-accordion-faq.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ANALYSIS_DIR = join(ROOT, 'analyses', 'accordion-faq');
const ANALYSIS_FILE = join(ANALYSIS_DIR, 'analysis.json');
const DEMO_DIR = join(ROOT, 'demos', 'accordion-faq');

const CATEGORY = {
  id: 'accordion-faq',
  title: '아코디언 FAQ',
  type: 'category',
  date: '2026-06-10',
  url: 'https://www.eleken.co/blog-posts/accordion-ui',
  summary: '질문을 클릭하면 답변이 부드럽게 펼쳐지는 아코디언 인터랙션의 패턴 컬렉션. FAQ·설정 패널·스펙 목록의 표준 UI로, JS 높이 측정 없이 동작하는 grid-template-rows 0fr→1fr 높이 애니메이션 기법이 핵심이다. 시그니처인 그리드 로우 슬라이드부터 플러스 모핑·싱글 오픈·셰브론 플립·카드 엘리베이트·번호 에디토리얼·이미지 동반·답변 스태거·배경 필 스윕·네스티드 2단까지 10가지 변형을 정리. 각 패턴은 standalone HTML로 작성되어 iframe으로 임베드되며, 사용자가 질문을 클릭할 때 답변이 펼쳐지는 인터랙티브 데모. ↻ 다시 보기는 모든 항목을 닫는다.'
};

// ============ 공통 콘텐츠 — 디자인 서비스 FAQ 4문항 ============

const QA = [
  {
    q: '프로젝트 기간은 보통 얼마나 걸리나요?',
    a: '브랜딩 단독 프로젝트는 4~6주, 웹사이트 구축을 포함하면 8~12주가 일반적입니다. 킥오프 미팅에서 범위를 확정한 뒤 상세 일정표를 공유드립니다.',
    lines: [
      '브랜딩 단독 프로젝트는 4~6주,',
      '웹사이트 구축을 포함하면 8~12주가 일반적입니다.',
      '킥오프 미팅에서 범위를 확정한 뒤 상세 일정표를 공유드립니다.'
    ]
  },
  {
    q: '수정 횟수에 제한이 있나요?',
    a: '각 단계마다 2회의 무상 수정 라운드가 포함되어 있습니다. 그 이상의 수정은 시간당 요율로 진행되며, 작업 전에 예상 견적을 먼저 안내드립니다.',
    lines: [
      '각 단계마다 2회의 무상 수정 라운드가 포함되어 있습니다.',
      '그 이상의 수정은 시간당 요율로 진행되며,',
      '작업 전에 예상 견적을 먼저 안내드립니다.'
    ]
  },
  {
    q: '어떤 방식으로 소통하며 진행되나요?',
    a: '전용 슬랙 채널과 주 1회 정기 화상 미팅으로 진행 상황을 공유합니다. 모든 산출물은 피그마와 노션에서 실시간으로 확인하실 수 있습니다.',
    lines: [
      '전용 슬랙 채널과 주 1회 정기 화상 미팅으로',
      '진행 상황을 공유합니다.',
      '모든 산출물은 피그마와 노션에서 실시간으로 확인하실 수 있습니다.'
    ]
  },
  {
    q: '결과물의 소유권은 누구에게 있나요?',
    a: '잔금이 입금되는 시점에 모든 산출물의 저작권과 원본 파일이 클라이언트에게 이전됩니다. 포트폴리오 공개 여부는 사전에 협의해 결정합니다.',
    lines: [
      '잔금이 입금되는 시점에 모든 산출물의 저작권과',
      '원본 파일이 클라이언트에게 이전됩니다.',
      '포트폴리오 공개 여부는 사전에 협의해 결정합니다.'
    ]
  }
];

// 네스티드 2단용 카테고리 분류
const NESTED = [
  { id: 'c1', cat: '프로젝트 진행', items: [QA[0], QA[2]] },
  { id: 'c2', cat: '비용과 계약', items: [QA[1], QA[3]] }
];

// ============ 마크업/CSS/JS 헬퍼 ============

function faqHead() {
  return '<header class="faq-head">\n  <div class="faq-eyebrow">FAQ</div>\n  <h1 class="faq-title">자주 묻는 질문</h1>\n</header>';
}

// 표준 FAQ 항목 마크업 (button + aria-expanded + aria-controls)
function stdFaqItems(pfx, iconHTML, opts = {}) {
  return QA.map((x, i) => {
    const n = i + 1;
    const numHTML = opts.numbers ? `<span class="${pfx}-num">0${n}</span>\n    ` : '';
    const body = opts.lines
      ? `<p>${x.lines.map(l => `<span>${l}</span>`).join('')}</p>`
      : `<p>${x.a}</p>`;
    return `<div class="${pfx}-item">
  <button class="${pfx}-q" type="button" aria-expanded="false" aria-controls="${pfx}-a${n}">
    ${numHTML}<span class="${pfx}-qt">${x.q}</span>
    ${iconHTML}
  </button>
  <div class="${pfx}-a" id="${pfx}-a${n}" role="region">
    <div class="${pfx}-a-in">${body}</div>
  </div>
</div>`;
  }).join('\n');
}

function faqBody(pfx, itemsHTML) {
  return `<div class="faq-wrap">
${faqHead()}
<div class="${pfx}-list">
${itemsHTML}
</div>
</div>`;
}

// 질문 버튼 공통 CSS
function qCSS(pfx, padding) {
  return `.${pfx}-q { display: flex; align-items: center; justify-content: space-between; gap: 16px; width: 100%; padding: ${padding}; background: none; border: 0; text-align: left; cursor: pointer; color: #fff; font-size: 15px; font-weight: 600; line-height: 1.5; }`;
}

// grid-template-rows 0fr→1fr 답변 영역 공통 CSS
function aCSS(pfx, padding, ms = 320) {
  return `.${pfx}-a { display: grid; grid-template-rows: 0fr; transition: grid-template-rows ${ms}ms cubic-bezier(0.4,0,0.2,1); }
.${pfx}-a-in { overflow: hidden; min-height: 0; }
.${pfx}-a-in p { margin: 0; padding: ${padding}; font-size: 14px; line-height: 1.7; color: rgba(255,255,255,0.62); }
.${pfx}-item.is-open .${pfx}-a { grid-template-rows: 1fr; }`;
}

// 멀티 오픈 토글 JS (aria 동기화 포함)
function toggleJS(pfx) {
  return `document.querySelectorAll(".${pfx}-q").forEach(function(btn){
  btn.addEventListener("click", function(){
    var item = btn.closest(".${pfx}-item");
    var open = item.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });
});`;
}

const PLUS = (pfx) => `<span class="${pfx}-ico" aria-hidden="true">+</span>`;
const CHEVRON_SVG = '<span class="cf-ico" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6l5 5 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';

// ============ 10 패턴 정의 ============

const PATTERNS = [
  // ───────────────────────────── 1. grid-rows (시그니처)
  {
    id: 'grid-rows',
    num: '01',
    title: '그리드 로우 슬라이드 (시그니처)',
    tag: 'grid-rows 0fr→1fr',
    summary: 'grid-template-rows 0fr→1fr 전환만으로 답변 높이를 애니메이션하는 현대 표준 기법. JS로 scrollHeight를 측정할 필요가 없고, 콘텐츠 길이가 바뀌어도 CSS가 알아서 보간한다. + 아이콘은 45° 회전해 ×가 되며 열림 상태를 알린다.',
    demo: {
      hint: '질문을 클릭해보세요',
      bodyHTML: faqBody('gr', stdFaqItems('gr', PLUS('gr'))),
      css: [
        '.gr-list { border-top: 1px solid rgba(255,255,255,0.14); }',
        '.gr-item { border-bottom: 1px solid rgba(255,255,255,0.14); }',
        qCSS('gr', '17px 4px'),
        '.gr-ico { flex-shrink: 0; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 300; color: rgba(255,255,255,0.5); transition: transform 320ms cubic-bezier(0.4,0,0.2,1), color 320ms; }',
        '.gr-item.is-open .gr-ico { transform: rotate(45deg); color: #8b5cf6; }',
        aCSS('gr', '0 36px 18px 4px')
      ].join('\n'),
      js: toggleJS('gr'),
      height: 480
    },
    snippetHTML: `<div class="faq-item">
  <button class="faq-q" type="button"
          aria-expanded="false" aria-controls="faq-a1">
    프로젝트 기간은 보통 얼마나 걸리나요?
    <span class="faq-ico" aria-hidden="true">+</span>
  </button>
  <div class="faq-a" id="faq-a1" role="region">
    <div class="faq-a-in"><p>브랜딩 단독은 4~6주, 웹사이트 포함은 8~12주…</p></div>
  </div>
</div>`,
    snippetCSS: `.faq-a { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 320ms cubic-bezier(0.4,0,0.2,1); }
.faq-a-in { overflow: hidden; min-height: 0; }
.faq-a-in p { margin: 0; padding-bottom: 18px; }
.faq-item.is-open .faq-a { grid-template-rows: 1fr; }
.faq-ico { transition: transform 320ms cubic-bezier(0.4,0,0.2,1); }
.faq-item.is-open .faq-ico { transform: rotate(45deg); }`,
    snippetJS: `document.querySelectorAll(".faq-q").forEach(function(btn){
  btn.addEventListener("click", function(){
    var item = btn.closest(".faq-item");
    var open = item.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });
});`,
    explain: 'height: auto는 transition이 불가능하다는 아코디언의 고전적 난제를 CSS Grid가 해결한다. 답변 래퍼를 display:grid로 두고 grid-template-rows를 0fr→1fr로 토글하면 브라우저가 0 높이↔콘텐츠 높이 사이를 부드럽게 보간한다. 내부 요소에는 overflow:hidden과 min-height:0만 있으면 된다. max-height 핵(최대값 추정 필요·이징 왜곡)도, JS scrollHeight 측정(강제 리플로우)도 모두 불필요한 현대 표준 기법. JS는 .is-open 클래스와 aria-expanded만 토글한다. + 아이콘은 같은 320ms 이징으로 45° 회전해 ×가 되며, 높이 펼침과 한 동작처럼 묶인다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (클래스 토글 1줄)' },
      { label: '트리거', value: '질문 button 클릭 → .is-open 토글' },
      { label: '높이 기법', value: 'grid-template-rows 0fr→1fr + overflow:hidden — JS 높이 측정 불필요' },
      { label: '전환 시간', value: '320ms cubic-bezier(0.4,0,0.2,1) — 권장 280~360ms' },
      { label: '아이콘', value: '+ 45° 회전 → × (동일 이징·시간)' },
      { label: '접근성', value: 'button + aria-expanded + aria-controls — stripe.com 실측: aria-expanded 토글 16개' }
    ],
    guide: '아코디언을 새로 만든다면 무조건 이 기법부터 시작한다. 답변 p의 margin을 0으로 두고 padding으로 간격을 관리해야 펼침 끝에서 툭 끊기는 점프가 없다. duration은 280~360ms 사이 — 콘텐츠가 길수록 길게. prefers-reduced-motion 환경에서는 transition을 제거해 즉시 전환으로 떨어뜨린다. 질문은 div가 아닌 button으로 — 키보드 Tab·Enter가 공짜로 따라온다.',
    recommendations: [
      { place: '히어로 헤더', body: '히어로 바로 아래 "자주 묻는 질문 3가지"를 컴팩트하게 — 첫 화면에서 구매 불안을 선제 해소' },
      { place: '랜딩 페이지', body: '랜딩 하단 FAQ 섹션의 기본값 — 어떤 톤의 페이지에도 무난하게 녹는 표준 펼침' },
      { place: '제품 섹션', body: '제품 상세의 스펙·배송·반품 정보를 접어두고 필요한 것만 펼치게 — 정보 밀도 관리' },
      { place: '포트폴리오 소개', body: '서비스 범위·진행 방식·견적 안내를 About 페이지에 접어 페이지 길이를 절제' }
    ],
    tradeoff: '2020년 이전 구형 브라우저는 grid-template-rows 보간을 지원하지 않는다 — 애니메이션 없이 즉시 열리는 자연 폴백이므로 기능은 동일. interpolate-size: allow-keywords(2024+)가 보편화되면 height: auto 직접 보간으로 더 단순해질 수 있다.'
  },

  // ───────────────────────────── 2. plus-morph
  {
    id: 'plus-morph',
    num: '02',
    title: '플러스 모핑',
    tag: 'icon morph + highlight',
    summary: '+ 아이콘의 두 획이 회전·페이드하며 −로 모핑되는 마이크로 인터랙션. 동시에 항목 보더와 배경이 액센트 컬러로 하이라이트되어, 작은 아이콘의 변화가 항목 전체의 상태로 확장된다.',
    demo: {
      hint: '질문을 클릭해보세요',
      bodyHTML: faqBody('pm', stdFaqItems('pm', '<span class="pm-ico" aria-hidden="true"><i></i><i></i></span>')),
      css: [
        '.pm-list { display: flex; flex-direction: column; gap: 10px; }',
        '.pm-item { border: 1px solid rgba(255,255,255,0.12); border-radius: 14px; background: rgba(255,255,255,0.03); transition: border-color 320ms cubic-bezier(0.4,0,0.2,1), background 320ms; }',
        '.pm-item.is-open { border-color: rgba(139,92,246,0.65); background: rgba(139,92,246,0.08); }',
        qCSS('pm', '15px 18px'),
        '.pm-ico { position: relative; flex-shrink: 0; width: 16px; height: 16px; }',
        '.pm-ico i { position: absolute; left: 0; top: 50%; width: 16px; height: 2px; margin-top: -1px; border-radius: 2px; background: rgba(255,255,255,0.6); transition: transform 320ms cubic-bezier(0.4,0,0.2,1), opacity 320ms, background 320ms; }',
        '.pm-ico i:last-child { transform: rotate(90deg); }',
        '.pm-item.is-open .pm-ico i { background: #a78bfa; }',
        '.pm-item.is-open .pm-ico i:first-child { transform: rotate(180deg); }',
        '.pm-item.is-open .pm-ico i:last-child { transform: rotate(270deg); opacity: 0; }',
        aCSS('pm', '0 18px 16px')
      ].join('\n'),
      js: toggleJS('pm'),
      height: 500
    },
    snippetHTML: `<button class="faq-q" type="button"
        aria-expanded="false" aria-controls="faq-a1">
  수정 횟수에 제한이 있나요?
  <span class="pm-ico" aria-hidden="true"><i></i><i></i></span>
</button>`,
    snippetCSS: `.pm-ico { position: relative; width: 16px; height: 16px; }
.pm-ico i { position: absolute; left: 0; top: 50%; width: 16px; height: 2px; margin-top: -1px; background: currentColor; transition: transform 320ms cubic-bezier(0.4,0,0.2,1), opacity 320ms; }
.pm-ico i:last-child { transform: rotate(90deg); }       /* + 의 세로 획 */
.faq-item.is-open .pm-ico i:first-child { transform: rotate(180deg); }
.faq-item.is-open .pm-ico i:last-child { transform: rotate(270deg); opacity: 0; } /* − 로 모핑 */
.faq-item.is-open { border-color: rgba(139,92,246,0.65); }`,
    snippetJS: `document.querySelectorAll(".faq-q").forEach(function(btn){
  btn.addEventListener("click", function(){
    var item = btn.closest(".faq-item");
    var open = item.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });
});`,
    explain: '+ 아이콘을 글리프(텍스트)가 아닌 두 개의 <i> 획으로 조립한다. 닫힘 상태에서 가로 획과 세로 획(rotate 90°)이 +를 이루고, 열리면 세로 획이 270°까지 회전하며 opacity 0으로 사라지고 가로 획도 180° 회전한다 — 결과적으로 +가 빙글 돌며 −로 모핑되는 인상. 글리프 교체(+→−)로는 불가능한 연속적 변형이다. 동시에 항목의 보더·배경이 액센트 컬러로 하이라이트되어, 16px 아이콘의 변화가 항목 전체의 상태 변화로 증폭된다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (클래스 토글)' },
      { label: '트리거', value: '질문 button 클릭 → .is-open 토글' },
      { label: '아이콘 구조', value: '<i> 두 획 — 세로 획 rotate 90°→270° + opacity 0' },
      { label: '전환 시간', value: '320ms cubic-bezier(0.4,0,0.2,1)' },
      { label: '하이라이트', value: 'border rgba(139,92,246,0.65) + 배경 8% tint' },
      { label: '실측 참고', value: 'linear.app 버튼 0.1s cubic-bezier(0.25,0.46,0.45,0.94) — 마이크로 전환은 더 짧게도 가능' }
    ],
    guide: '획 두께 2px, 아이콘 박스 16px가 균형점. 폰트 글리프(+, −)를 텍스트로 교체하는 방식은 모핑이 불가능하므로 반드시 획을 요소로 분리할 것. 보더 하이라이트는 액센트 컬러의 60~70% 투명도가 과하지 않다. 회전·페이드·보더를 같은 이징과 시간으로 묶어야 한 동작으로 읽힌다.',
    recommendations: [
      { place: '히어로 헤더', body: '미니멀 히어로 아래 핵심 FAQ — 작은 아이콘 모핑이 디테일 감도를 첫 화면에서 증명' },
      { place: '랜딩 페이지', body: '디자인 도구·크리에이티브 서비스 랜딩 — 마이크로 인터랙션 자체가 브랜드의 증거' },
      { place: '제품 섹션', body: '기능 소개의 "더 알아보기" 접기 — 보더 하이라이트로 현재 열린 항목을 강조' },
      { place: '포트폴리오 소개', body: '디자이너 포트폴리오의 FAQ — + → − 모핑이 작업 품질의 예고편 역할' }
    ],
    tradeoff: '마크업이 글리프 방식보다 한 단계 복잡(<span><i></i><i></i></span>). 세로 획을 90°(제자리 소멸)로만 돌리면 모핑이 심심해진다 — 270°로 회전 의도를 주는 것이 포인트. 획 기반이라 아이콘 크기 변경 시 px 값을 함께 수정해야 한다.'
  },

  // ───────────────────────────── 3. single-open
  {
    id: 'single-open',
    num: '03',
    title: '싱글 오픈',
    tag: 'radio + accent bar',
    summary: '한 번에 하나의 답변만 열리는 라디오 동작. 다른 질문을 클릭하면 이전 항목이 자동으로 닫혀 한 가지에 집중시킨다. 열린 항목 좌측에는 2px 액센트 바가 위에서 아래로 차오른다.',
    demo: {
      hint: '질문을 클릭해보세요 — 한 번에 하나만 열립니다',
      bodyHTML: faqBody('so', stdFaqItems('so', '<span class="so-ico" aria-hidden="true"></span>')),
      css: [
        '.so-list { border-top: 1px solid rgba(255,255,255,0.12); }',
        '.so-item { position: relative; border-bottom: 1px solid rgba(255,255,255,0.12); }',
        '.so-item::before { content: ""; position: absolute; left: 0; top: 16px; bottom: 16px; width: 2px; border-radius: 2px; background: #8b5cf6; transform: scaleY(0); transform-origin: top center; transition: transform 320ms cubic-bezier(0.4,0,0.2,1); }',
        '.so-item.is-open::before { transform: scaleY(1); }',
        qCSS('so', '17px 6px 17px 18px'),
        '.so-qt { transition: color 320ms; }',
        '.so-item.is-open .so-qt { color: #c4b5fd; }',
        '.so-ico { flex-shrink: 0; width: 9px; height: 9px; border-right: 2px solid rgba(255,255,255,0.45); border-bottom: 2px solid rgba(255,255,255,0.45); transform: rotate(45deg); transition: transform 320ms cubic-bezier(0.4,0,0.2,1), border-color 320ms; }',
        '.so-item.is-open .so-ico { transform: rotate(225deg); border-color: #8b5cf6; }',
        aCSS('so', '0 8px 18px 18px')
      ].join('\n'),
      js: `var soItems = Array.prototype.slice.call(document.querySelectorAll(".so-item"));
soItems.forEach(function(item){
  var btn = item.querySelector(".so-q");
  btn.addEventListener("click", function(){
    var willOpen = !item.classList.contains("is-open");
    soItems.forEach(function(x){
      x.classList.remove("is-open");
      x.querySelector(".so-q").setAttribute("aria-expanded", "false");
    });
    if (willOpen) {
      item.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
    }
  });
});`,
      height: 480
    },
    snippetHTML: `<div class="faq-list">
  <div class="faq-item">
    <button class="faq-q" type="button" aria-expanded="false" aria-controls="faq-a1">…</button>
    <div class="faq-a" id="faq-a1" role="region">…</div>
  </div>
  <!-- 항목 N개 — 동시에 하나만 .is-open -->
</div>`,
    snippetCSS: `.faq-item { position: relative; }
.faq-item::before { content: ""; position: absolute; left: 0; top: 16px; bottom: 16px; width: 2px; background: #8b5cf6; transform: scaleY(0); transform-origin: top center; transition: transform 320ms cubic-bezier(0.4,0,0.2,1); }
.faq-item.is-open::before { transform: scaleY(1); }`,
    snippetJS: `var items = [].slice.call(document.querySelectorAll(".faq-item"));
items.forEach(function(item){
  var btn = item.querySelector(".faq-q");
  btn.addEventListener("click", function(){
    var willOpen = !item.classList.contains("is-open");
    items.forEach(function(x){            // 라디오 동작: 전부 닫고
      x.classList.remove("is-open");
      x.querySelector(".faq-q").setAttribute("aria-expanded", "false");
    });
    if (willOpen) {                       // 클릭한 항목만 열기
      item.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
    }
  });
});`,
    explain: '클릭한 항목을 열기 전에 전체 항목을 순회하며 .is-open을 제거한다 — 한 번에 하나만 열리는 라디오 동작. 이미 열린 항목을 다시 클릭하면 모두 닫힌 상태가 된다. 열린 항목 좌측에는 2px 액센트 바가 scaleY 0→1로 차올라 "지금 읽고 있는 질문"을 시각적으로 고정하고, 질문 텍스트도 액센트 톤으로 밝아진다. 전체 높이 변동이 항상 답변 1개 분량이라 긴 목록에서도 레이아웃이 안정적이다.',
    kv: [
      { label: '동작', value: '라디오(exclusive) — 새 항목 열면 기존 항목 자동 닫힘' },
      { label: '의존성', value: 'Vanilla JS (전체 순회 + 단일 .is-open)' },
      { label: '액센트 바', value: '2px scaleY 0→1, transform-origin: top' },
      { label: '전환 시간', value: '320ms cubic-bezier(0.4,0,0.2,1)' },
      { label: '레이아웃 안정', value: '열린 답변이 항상 1개 — 높이 변동 최소' },
      { label: '접근성', value: 'aria-expanded 동기화 — 항상 1개 이하만 true' }
    ],
    guide: '답변이 길거나 비교할 필요가 없는 콘텐츠(정책·약관·고객센터)에 적합하다. 여러 답변을 펼쳐놓고 대조해야 하는 컨텍스트(요금제 비교 등)에서는 멀티 오픈이 낫다. 아래쪽 항목을 열 때 위 항목이 닫히며 스크롤 위치가 출렁일 수 있으니, 클릭한 질문이 viewport에 머물도록 scrollIntoView 보정을 고려할 것.',
    recommendations: [
      { place: '히어로 헤더', body: '히어로 아래 핵심 질문 3개 — 하나씩만 열려 메시지 집중도를 유지' },
      { place: '랜딩 페이지', body: '전환 직전(가격표 아래) FAQ — 한 번에 한 가지 불안만 해소시켜 이탈 방지' },
      { place: '제품 섹션', body: '설정 패널·옵션 설명 — 동시에 하나만 열려 레이아웃 변동을 최소화' },
      { place: '포트폴리오 소개', body: '의뢰 절차 단계별 안내 — 좌측 액센트 바가 현재 단계 표시 역할' }
    ],
    tradeoff: '사용자가 두 답변을 동시에 보고 싶어도 불가능 — 의도적 제약임을 인지하고 선택할 것. 닫히는 항목과 열리는 항목이 동시에 애니메이션되므로 duration을 360ms 이상으로 늘리면 출렁임이 두드러진다.'
  },

  // ───────────────────────────── 4. chevron-flip
  {
    id: 'chevron-flip',
    num: '04',
    title: '셰브론 플립',
    tag: 'chevron 180°',
    summary: '▾ 셰브론이 180° 회전하고 답변이 fade+slide로 진입하는, 가장 보편적인 아코디언 조합. 높이가 먼저 열리고 콘텐츠가 70ms 늦게 따라 들어오는 2단 시차가 정돈된 인상을 만든다.',
    demo: {
      hint: '질문을 클릭해보세요',
      bodyHTML: faqBody('cf', stdFaqItems('cf', CHEVRON_SVG)),
      css: [
        '.cf-list { border-top: 1px solid rgba(255,255,255,0.14); }',
        '.cf-item { border-bottom: 1px solid rgba(255,255,255,0.14); }',
        qCSS('cf', '17px 4px'),
        '.cf-ico { flex-shrink: 0; display: inline-flex; color: rgba(255,255,255,0.5); transition: transform 320ms cubic-bezier(0.4,0,0.2,1), color 320ms; }',
        '.cf-item.is-open .cf-ico { transform: rotate(180deg); color: #8b5cf6; }',
        aCSS('cf', '0 36px 18px 4px'),
        '.cf-a-in p { opacity: 0; transform: translateY(-8px); transition: opacity 260ms ease, transform 260ms cubic-bezier(0.4,0,0.2,1); }',
        '.cf-item.is-open .cf-a-in p { opacity: 1; transform: translateY(0); transition-delay: 70ms; }'
      ].join('\n'),
      js: toggleJS('cf'),
      height: 480
    },
    snippetHTML: `<button class="faq-q" type="button"
        aria-expanded="false" aria-controls="faq-a1">
  어떤 방식으로 소통하며 진행되나요?
  <span class="faq-ico" aria-hidden="true">
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M3 6l5 5 5-5" stroke="currentColor" stroke-width="1.8"
            stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </span>
</button>`,
    snippetCSS: `.faq-ico { transition: transform 320ms cubic-bezier(0.4,0,0.2,1); }
.faq-item.is-open .faq-ico { transform: rotate(180deg); }
/* 답변 콘텐츠는 높이보다 70ms 늦게 fade+slide */
.faq-a-in p { opacity: 0; transform: translateY(-8px); transition: opacity 260ms ease, transform 260ms cubic-bezier(0.4,0,0.2,1); }
.faq-item.is-open .faq-a-in p { opacity: 1; transform: translateY(0); transition-delay: 70ms; }`,
    snippetJS: `document.querySelectorAll(".faq-q").forEach(function(btn){
  btn.addEventListener("click", function(){
    var item = btn.closest(".faq-item");
    var open = item.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });
});`,
    explain: '▾ 셰브론이 180° 뒤집히는 것은 "열림"의 가장 보편적인 기호다. 여기에 답변 텍스트가 fade + translateY(-8→0)로 70ms 늦게 진입해, 높이 펼침(grid-rows)과 콘텐츠 등장이 2단으로 분리된다. 높이가 먼저 열리고 글이 따라 들어오는 이 시차가 단순 펼침보다 한층 정돈된 인상을 만든다. 닫힐 때는 transition-delay가 빠져 즉시 사라지므로 답답함이 없다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (클래스 토글)' },
      { label: '아이콘', value: '인라인 SVG 셰브론 rotate 0→180° (currentColor)' },
      { label: '답변 진입', value: 'fade + translateY(-8→0), 높이보다 70ms 지연' },
      { label: '전환 시간', value: '높이 320ms / 콘텐츠 260ms cubic-bezier(0.4,0,0.2,1)' },
      { label: '닫힘', value: 'delay 0 — 즉시 페이드 아웃' },
      { label: '시그니처', value: '가장 보편적 조합 — B2B·문서·커머스 어디에나 안전' }
    ],
    guide: '아이콘은 인라인 SVG(stroke 1.8px, currentColor)로 — 폰트 글리프 ▾는 OS마다 모양과 베이스라인이 다르다. 콘텐츠 지연은 60~100ms가 적정이며 그 이상이면 높이와 콘텐츠가 끊겨 보인다. 브랜드 톤이 강하지 않은 서비스·B2B·문서 사이트에서 실패하지 않는 기본값.',
    recommendations: [
      { place: '히어로 헤더', body: 'SaaS·B2B 히어로 하단 핵심 FAQ — 가장 안전한 기본 조합' },
      { place: '랜딩 페이지', body: '랜딩 FAQ의 표준 — 학습 비용 0의 보편 기호(셰브론)로 모든 사용자가 즉시 이해' },
      { place: '제품 섹션', body: '도움말 센터·문서 페이지 — 콘텐츠가 많아도 패턴이 질리지 않음' },
      { place: '포트폴리오 소개', body: '스튜디오 소개 페이지 FAQ — 답변 fade+slide가 차분한 완성도를 더함' }
    ],
    tradeoff: '너무 보편적이라 차별화 요소는 없다 — 개성이 필요한 포트폴리오·캠페인 페이지라면 fill-sweep이나 numbered-editorial을 고려. 셰브론 회전과 높이 전환의 duration이 다르면 어색하므로 반드시 동기화할 것.'
  },

  // ───────────────────────────── 5. card-elevate
  {
    id: 'card-elevate',
    num: '05',
    title: '카드 엘리베이트',
    tag: 'scale + shadow',
    summary: '항목을 분리형 카드로 배치하고, 열린 카드만 scale(1.02)·액센트 보더·보랏빛 그림자로 떠오르게 한다. 열림 상태가 공간감으로 표현되어 목록 전체에서 한눈에 보인다.',
    demo: {
      hint: '질문을 클릭해보세요',
      bodyHTML: faqBody('ce', stdFaqItems('ce', PLUS('ce'))),
      css: [
        '.ce-list { display: flex; flex-direction: column; gap: 12px; }',
        '.ce-item { background: #101014; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; transition: transform 320ms cubic-bezier(0.4,0,0.2,1), box-shadow 320ms, border-color 320ms, background 320ms; }',
        '.ce-item.is-open { transform: scale(1.02); background: #16161d; border-color: rgba(139,92,246,0.55); box-shadow: 0 18px 48px -16px rgba(139,92,246,0.35), 0 10px 28px -14px rgba(0,0,0,0.85); }',
        qCSS('ce', '16px 18px'),
        '.ce-ico { flex-shrink: 0; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 300; color: rgba(255,255,255,0.5); transition: transform 320ms cubic-bezier(0.4,0,0.2,1), color 320ms; }',
        '.ce-item.is-open .ce-ico { transform: rotate(45deg); color: #a78bfa; }',
        aCSS('ce', '0 18px 16px')
      ].join('\n'),
      js: toggleJS('ce'),
      height: 520
    },
    snippetHTML: `<div class="faq-list"><!-- gap: 12px 분리형 카드 -->
  <div class="faq-item">
    <button class="faq-q" type="button" aria-expanded="false" aria-controls="faq-a1">…</button>
    <div class="faq-a" id="faq-a1" role="region">…</div>
  </div>
</div>`,
    snippetCSS: `.faq-list { display: flex; flex-direction: column; gap: 12px; }
.faq-item { background: #101014; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; transition: transform 320ms cubic-bezier(0.4,0,0.2,1), box-shadow 320ms, border-color 320ms; }
.faq-item.is-open {
  transform: scale(1.02);
  border-color: rgba(139,92,246,0.55);
  box-shadow: 0 18px 48px -16px rgba(139,92,246,0.35),
              0 10px 28px -14px rgba(0,0,0,0.85);
}`,
    snippetJS: `document.querySelectorAll(".faq-q").forEach(function(btn){
  btn.addEventListener("click", function(){
    var item = btn.closest(".faq-item");
    var open = item.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });
});`,
    explain: '항목을 보더·배경을 가진 분리형 카드로 띄우고 gap 12px로 나열한다. 열린 카드만 scale(1.02) + 액센트 보더 + 보랏빛 그림자를 받아 물리적으로 떠오른다. 닫힌 카드들과의 대비가 커서 "지금 어떤 질문이 열려 있는가"가 목록 전체에서 즉시 보인다. 높이 전환은 동일하게 grid-rows, 떠오름은 transform과 box-shadow만 사용하므로 리플로우 없이 합성 단계에서 처리된다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (클래스 토글)' },
      { label: '카드', value: '분리형 리스트 gap 12px + radius 16px' },
      { label: '엘리베이트', value: 'scale 1.02 + 액센트 보더 + 2겹 그림자' },
      { label: '전환 시간', value: '320ms cubic-bezier(0.4,0,0.2,1)' },
      { label: '성능', value: 'transform·box-shadow만 — 리플로우 없음' },
      { label: '주의', value: 'scale은 1.02 이하 — 텍스트 서브픽셀 블러 방지' }
    ],
    guide: 'scale은 1.02 이하로 — 그 이상은 텍스트가 흐려 보이고 옆 카드를 침범한다. 그림자는 액센트 컬러 30~40% 투명도의 큰 블러 + 검정의 근거리 그림자 2겹이 자연스럽다. 카드 사이 gap이 8px 미만이면 scale 시 겹침이 생기니 12px 이상 확보할 것.',
    recommendations: [
      { place: '히어로 헤더', body: '히어로 아래 "왜 우리인가" 3카드 문답 — 열린 카드가 떠올라 시선 고정' },
      { place: '랜딩 페이지', body: '요금제 아래 FAQ — 카드 단위 구분이 질문 간 경계를 명확히' },
      { place: '제품 섹션', body: '기능 카드 리스트 — 펼친 기능이 물리적으로 부상해 탐색을 유도' },
      { place: '포트폴리오 소개', body: '프로젝트 프로세스 카드 — 단계별 상세가 떠오르며 전개' }
    ],
    tradeoff: 'transform: scale은 합성 단계라 저렴하지만, 카드 안에 고정 폭 이미지·iframe이 있으면 미세 블러가 생길 수 있다. 카드 리스트가 길면(10+) 떠오른 카드가 묻히므로 8개 이하 권장.'
  },

  // ───────────────────────────── 6. numbered-editorial
  {
    id: 'numbered-editorial',
    num: '06',
    title: '번호 에디토리얼',
    tag: 'editorial 01~04',
    summary: '01·02·03 대형 번호 + 얇은 룰 + 가벼운 서체의 에디토리얼 톤. 에이전시 포트폴리오·매거진에 어울리며, 열리면 번호가 액센트 컬러로 물들어 그래픽 요소로 승격된다.',
    demo: {
      hint: '질문을 클릭해보세요',
      bodyHTML: faqBody('ne', stdFaqItems('ne', PLUS('ne'), { numbers: true })),
      css: [
        '.ne-list { border-top: 1px solid rgba(255,255,255,0.22); }',
        '.ne-item { border-bottom: 1px solid rgba(255,255,255,0.22); }',
        '.ne-q { display: grid; grid-template-columns: 52px 1fr 24px; align-items: center; gap: 14px; width: 100%; padding: 18px 0; background: none; border: 0; text-align: left; cursor: pointer; color: #fff; }',
        '.ne-num { font-size: 24px; font-weight: 200; letter-spacing: 0.04em; color: rgba(255,255,255,0.32); font-variant-numeric: tabular-nums; transition: color 320ms; }',
        '.ne-item.is-open .ne-num { color: #8b5cf6; }',
        '.ne-qt { font-size: 17px; font-weight: 500; letter-spacing: -0.01em; line-height: 1.45; }',
        '.ne-ico { justify-self: end; font-size: 20px; font-weight: 200; color: rgba(255,255,255,0.45); transition: transform 320ms cubic-bezier(0.4,0,0.2,1), color 320ms; }',
        '.ne-item.is-open .ne-ico { transform: rotate(45deg); color: #8b5cf6; }',
        aCSS('ne', '0 24px 20px 66px')
      ].join('\n'),
      js: toggleJS('ne'),
      height: 520
    },
    snippetHTML: `<button class="faq-q" type="button"
        aria-expanded="false" aria-controls="faq-a1">
  <span class="faq-num">01</span>
  <span class="faq-qt">프로젝트 기간은 보통 얼마나 걸리나요?</span>
  <span class="faq-ico" aria-hidden="true">+</span>
</button>`,
    snippetCSS: `.faq-q { display: grid; grid-template-columns: 52px 1fr 24px; align-items: center; gap: 14px; padding: 18px 0; }
.faq-num { font-size: 24px; font-weight: 200; color: rgba(255,255,255,0.32); font-variant-numeric: tabular-nums; transition: color 320ms; }
.faq-item.is-open .faq-num { color: #8b5cf6; }   /* 번호가 액센트로 */
.faq-item { border-bottom: 1px solid rgba(255,255,255,0.22); } /* thin rule */
.faq-a-in p { padding-left: 66px; }              /* 번호 컬럼과 줄맞춤 */`,
    snippetJS: `document.querySelectorAll(".faq-q").forEach(function(btn){
  btn.addEventListener("click", function(){
    var item = btn.closest(".faq-item");
    var open = item.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });
});`,
    explain: '각 질문 앞에 24px의 가는(weight 200) 번호 01~04를 두고, 항목 사이를 1px의 또렷한 룰로 구분한다. 버튼은 52px(번호) + 1fr(질문) + 24px(아이콘)의 3-column grid. 질문은 17px weight 500으로 본문보다 크게 — 잡지 목차 같은 에디토리얼 톤이 만들어진다. 열리면 번호가 액센트 컬러로 물들어 "몇 번째 질문을 읽고 있는지"가 페이지의 그래픽 요소로 승격된다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (클래스 토글)' },
      { label: '레이아웃', value: 'grid 52px(번호) + 1fr(질문) + 24px(아이콘)' },
      { label: '번호', value: '24px weight 200 tabular-nums — 열림 시 액센트 컬러' },
      { label: '룰', value: '1px rgba(255,255,255,0.22) — 일반 보더보다 또렷하게' },
      { label: '전환 시간', value: '320ms cubic-bezier(0.4,0,0.2,1)' },
      { label: '톤', value: '에이전시 포트폴리오 / 매거진 에디토리얼' }
    ],
    guide: '번호는 tabular-nums로 폭을 고정해 줄맞춤을 유지한다. 답변 들여쓰기(padding-left)를 번호 컬럼 폭과 맞추면 그리드가 흐트러지지 않는다. 질문 수가 두 자리(10+)가 되면 번호 컬럼 폭도 함께 늘릴 것. 여백이 톤의 절반이므로 항목 상하 패딩(18px+)을 아끼지 말 것.',
    recommendations: [
      { place: '히어로 헤더', body: '에이전시 히어로 직후 "우리가 자주 받는 질문" — 번호 타이포가 그래픽 요소' },
      { place: '랜딩 페이지', body: '브랜드 캠페인 랜딩 — 잡지 목차 톤으로 FAQ도 브랜딩의 일부로' },
      { place: '제품 섹션', body: '하이엔드 제품(가구·오디오) 스펙 문답 — 에디토리얼 톤이 프리미엄 인상 강화' },
      { place: '포트폴리오 소개', body: '디자인 스튜디오의 표준 — 01~04 번호가 프로젝트 넘버링과 톤 일치' }
    ],
    tradeoff: '항목당 높이가 커서 같은 화면에 보이는 질문 수가 적다. 캐주얼·유틸리티 컨텍스트(설정 패널 등)에는 과한 옷 — 브랜드가 전면에 나서는 페이지에만 사용할 것.'
  },

  // ───────────────────────────── 7. image-reveal
  {
    id: 'image-reveal',
    num: '07',
    title: '이미지 동반',
    tag: '2-col media swap',
    summary: '좌측 아코디언 + 우측 미디어 패널의 2-column 구성. 질문을 열면 대응하는 아트워크가 360ms 크로스페이드로 교체된다. FAQ를 비주얼 스토리텔링으로 끌어올리는 패턴.',
    demo: {
      hint: '질문을 클릭하면 우측 아트워크가 바뀝니다',
      bodyHTML: (() => {
        const items = QA.map((x, i) => {
          const n = i + 1;
          const open = n === 1;
          return `<div class="ir-item${open ? ' is-open' : ''}" data-art="a${n}">
  <button class="ir-q" type="button" aria-expanded="${open ? 'true' : 'false'}" aria-controls="ir-a${n}">
    <span class="ir-qt">${x.q}</span>
    <span class="ir-ico" aria-hidden="true">+</span>
  </button>
  <div class="ir-a" id="ir-a${n}" role="region">
    <div class="ir-a-in"><p>${x.a}</p></div>
  </div>
</div>`;
        }).join('\n');
        return `<div class="ir-wrap">
<div class="ir-left">
${faqHead()}
<div class="ir-list">
${items}
</div>
</div>
<div class="ir-panel" aria-hidden="true">
  <div class="ir-art ir-art-1 is-on" data-art="a1"><span>01 · TIMELINE</span></div>
  <div class="ir-art ir-art-2" data-art="a2"><span>02 · REVISION</span></div>
  <div class="ir-art ir-art-3" data-art="a3"><span>03 · WORKFLOW</span></div>
  <div class="ir-art ir-art-4" data-art="a4"><span>04 · LICENSE</span></div>
</div>
</div>`;
      })(),
      css: [
        '.ir-wrap { width: min(860px, 94vw); display: grid; grid-template-columns: 1.1fr 300px; gap: 28px; align-items: stretch; }',
        '@media (max-width: 720px) { .ir-wrap { grid-template-columns: 1fr; } .ir-panel { min-height: 200px; order: -1; } }',
        '.ir-left { align-self: center; }',
        '.ir-list { border-top: 1px solid rgba(255,255,255,0.12); }',
        '.ir-item { border-bottom: 1px solid rgba(255,255,255,0.12); }',
        '.ir-q { display: flex; align-items: center; justify-content: space-between; gap: 16px; width: 100%; padding: 15px 4px; background: none; border: 0; text-align: left; cursor: pointer; color: rgba(255,255,255,0.78); font-size: 15px; font-weight: 600; line-height: 1.5; }',
        '.ir-qt { transition: color 280ms; }',
        '.ir-item.is-open .ir-qt { color: #fff; }',
        '.ir-ico { flex-shrink: 0; font-size: 18px; font-weight: 300; color: rgba(255,255,255,0.45); transition: transform 320ms cubic-bezier(0.4,0,0.2,1), color 320ms; }',
        '.ir-item.is-open .ir-ico { transform: rotate(45deg); color: #8b5cf6; }',
        '.ir-a { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 320ms cubic-bezier(0.4,0,0.2,1); }',
        '.ir-a-in { overflow: hidden; min-height: 0; }',
        '.ir-a-in p { margin: 0; padding: 0 8px 16px 4px; font-size: 13.5px; line-height: 1.65; color: rgba(255,255,255,0.6); }',
        '.ir-item.is-open .ir-a { grid-template-rows: 1fr; }',
        '.ir-panel { position: relative; border-radius: 18px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); min-height: 340px; }',
        '.ir-art { position: absolute; inset: 0; opacity: 0; transition: opacity 360ms ease; display: flex; align-items: flex-end; padding: 18px; }',
        '.ir-art.is-on { opacity: 1; }',
        '.ir-art::after { content: ""; position: absolute; inset: 0; background: radial-gradient(420px 280px at 70% 25%, rgba(255,255,255,0.35), transparent 70%); }',
        '.ir-art span { position: relative; z-index: 1; font: 700 11px/1 ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: 0.18em; color: rgba(255,255,255,0.85); }',
        '.ir-art-1 { background: linear-gradient(135deg, #7c3aed, #ec4899); }',
        '.ir-art-2 { background: linear-gradient(135deg, #f59e0b, #ef4444); }',
        '.ir-art-3 { background: linear-gradient(135deg, #2563eb, #06b6d4); }',
        '.ir-art-4 { background: linear-gradient(135deg, #059669, #84cc16); }'
      ].join('\n'),
      js: `var irItems = Array.prototype.slice.call(document.querySelectorAll(".ir-item"));
var irArts = Array.prototype.slice.call(document.querySelectorAll(".ir-art"));
function irOpen(target){
  irItems.forEach(function(x){
    var on = x === target;
    x.classList.toggle("is-open", on);
    x.querySelector(".ir-q").setAttribute("aria-expanded", on ? "true" : "false");
  });
  var key = target.getAttribute("data-art");
  irArts.forEach(function(a){ a.classList.toggle("is-on", a.getAttribute("data-art") === key); });
}
irItems.forEach(function(item){
  item.querySelector(".ir-q").addEventListener("click", function(){ irOpen(item); });
});
// 패널 공백 방지: 리셋은 첫 항목 복원
window.__reset = function(){ irOpen(irItems[0]); };`,
      height: 520
    },
    snippetHTML: `<div class="ir-wrap">
  <div class="ir-list">
    <div class="ir-item is-open" data-art="a1">
      <button class="ir-q" type="button" aria-expanded="true" aria-controls="ir-a1">…</button>
      <div class="ir-a" id="ir-a1" role="region">…</div>
    </div>
    <!-- data-art="a2" … -->
  </div>
  <div class="ir-panel" aria-hidden="true">
    <div class="ir-art is-on" data-art="a1"><!-- 이미지/아트워크 --></div>
    <div class="ir-art" data-art="a2"></div>
  </div>
</div>`,
    snippetCSS: `.ir-wrap { display: grid; grid-template-columns: 1.1fr 300px; gap: 28px; }
.ir-panel { position: relative; border-radius: 18px; overflow: hidden; }
.ir-art { position: absolute; inset: 0; opacity: 0; transition: opacity 360ms ease; }
.ir-art.is-on { opacity: 1; }   /* 열린 질문의 data-art와 일치하는 것만 */`,
    snippetJS: `var items = [].slice.call(document.querySelectorAll(".ir-item"));
var arts = [].slice.call(document.querySelectorAll(".ir-art"));
function openItem(target){
  items.forEach(function(x){
    var on = x === target;
    x.classList.toggle("is-open", on);
    x.querySelector(".ir-q").setAttribute("aria-expanded", on ? "true" : "false");
  });
  var key = target.getAttribute("data-art");
  arts.forEach(function(a){ a.classList.toggle("is-on", a.getAttribute("data-art") === key); });
}
items.forEach(function(item){
  item.querySelector(".ir-q").addEventListener("click", function(){ openItem(item); });
});`,
    explain: '좌측 아코디언과 우측 미디어 패널을 2-column grid로 묶는다. 패널 안에는 질문 수만큼의 아트워크가 absolute로 같은 자리에 쌓여 있고, 열린 질문의 data-art와 일치하는 것만 opacity 1이 된다 — 360ms 크로스페이드 교체. 패널이 비는 순간이 없도록 싱글 오픈 + 항상 1개 열림(열린 항목 재클릭 시 유지)으로 동작한다. 데모는 CSS 그라디언트 아트워크지만 실전에서는 제품 스크린샷·일러스트·작업물이 들어간다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (data-art 매칭 swap)' },
      { label: '레이아웃', value: '2-column — 아코디언 1.1fr + 패널 300px' },
      { label: '아트 교체', value: 'absolute 스택 + opacity 크로스페이드 360ms' },
      { label: '동작', value: '싱글 오픈 — 항상 1개 열림 (패널 공백 방지)' },
      { label: '전환 시간', value: '높이 320ms / 크로스페이드 360ms' },
      { label: '모바일', value: '720px 이하 1-column — 패널이 상단 200px로' }
    ],
    guide: '질문과 이미지가 실제로 1:1 대응될 때만 쓸 것 — 장식용 이미지의 교체는 소음이다. absolute 스택 구조라 이미지가 전부 미리 로드되므로 고해상 이미지라면 첫 페인트 비용을 점검한다. 720px 이하에서는 1-column으로 접고 패널을 위로 — 또는 패널을 숨기고 일반 아코디언으로 강등.',
    recommendations: [
      { place: '히어로 헤더', body: '히어로 우측 비주얼 + 좌측 질문 결합 — 첫 화면이 인터랙티브 쇼케이스가 됨' },
      { place: '랜딩 페이지', body: '기능 FAQ + 해당 기능 스크린샷 — 읽는 질문이 곧 보는 화면' },
      { place: '제품 섹션', body: '제품 옵션 문답 + 옵션별 제품 이미지 크로스페이드' },
      { place: '포트폴리오 소개', body: '"어떻게 작업하나요" 문답 + 단계별 작업물 아트워크 — FAQ가 갤러리가 됨' }
    ],
    tradeoff: '레이아웃 폭(860px+)이 필요해 좁은 컨테이너에는 부적합. 아트워크 N장이 전부 DOM에 상주하므로 고해상 이미지 4장 이상이면 lazy 전략 필요. 싱글 오픈 강제라 답변 비교 열람은 불가.'
  },

  // ───────────────────────────── 8. stagger-lines
  {
    id: 'stagger-lines',
    num: '08',
    title: '답변 스태거',
    tag: 'line stagger',
    summary: '답변 문단의 줄들이 60ms 간격의 stagger로 fade+slide 진입한다. 높이는 한 번에 열리지만 콘텐츠가 줄 단위로 차올라, 같은 320ms가 훨씬 풍부해 보이는 디테일 업그레이드.',
    demo: {
      hint: '질문을 클릭해보세요',
      bodyHTML: faqBody('sl', stdFaqItems('sl', PLUS('sl'), { lines: true })),
      css: [
        '.sl-list { border-top: 1px solid rgba(255,255,255,0.14); }',
        '.sl-item { border-bottom: 1px solid rgba(255,255,255,0.14); }',
        qCSS('sl', '17px 4px'),
        '.sl-ico { flex-shrink: 0; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 300; color: rgba(255,255,255,0.5); transition: transform 320ms cubic-bezier(0.4,0,0.2,1), color 320ms; }',
        '.sl-item.is-open .sl-ico { transform: rotate(45deg); color: #8b5cf6; }',
        aCSS('sl', '0 36px 18px 4px'),
        '.sl-a-in p span { display: block; opacity: 0; transform: translateY(10px); transition: opacity 300ms ease, transform 300ms cubic-bezier(0.4,0,0.2,1); }',
        '.sl-item.is-open .sl-a-in p span { opacity: 1; transform: translateY(0); }',
        '.sl-item.is-open .sl-a-in p span:nth-child(1) { transition-delay: 60ms; }',
        '.sl-item.is-open .sl-a-in p span:nth-child(2) { transition-delay: 120ms; }',
        '.sl-item.is-open .sl-a-in p span:nth-child(3) { transition-delay: 180ms; }',
        '.sl-item.is-open .sl-a-in p span:nth-child(4) { transition-delay: 240ms; }'
      ].join('\n'),
      js: toggleJS('sl'),
      height: 480
    },
    snippetHTML: `<div class="faq-a" id="faq-a1" role="region">
  <div class="faq-a-in">
    <p>
      <span>전용 슬랙 채널과 주 1회 정기 화상 미팅으로</span>
      <span>진행 상황을 공유합니다.</span>
      <span>모든 산출물은 피그마와 노션에서 확인하실 수 있습니다.</span>
    </p>
  </div>
</div>`,
    snippetCSS: `.faq-a-in p span { display: block; opacity: 0; transform: translateY(10px); transition: opacity 300ms ease, transform 300ms cubic-bezier(0.4,0,0.2,1); }
.faq-item.is-open .faq-a-in p span { opacity: 1; transform: translateY(0); }
/* 줄별 stagger — 닫힘은 delay 0으로 즉시 */
.faq-item.is-open p span:nth-child(1) { transition-delay: 60ms; }
.faq-item.is-open p span:nth-child(2) { transition-delay: 120ms; }
.faq-item.is-open p span:nth-child(3) { transition-delay: 180ms; }`,
    snippetJS: `document.querySelectorAll(".faq-q").forEach(function(btn){
  btn.addEventListener("click", function(){
    var item = btn.closest(".faq-item");
    var open = item.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });
});`,
    explain: '답변 문단을 3~4개의 줄(span, display:block)로 분할하고, 열릴 때 각 줄이 60ms 간격의 transition-delay로 fade + translateY(10→0) 진입한다. 높이는 grid-rows로 한 번에 열리지만 콘텐츠가 줄 단위로 차오르기 때문에 같은 320ms가 훨씬 풍부해 보인다. 닫힘은 delay 0으로 즉시 — 스태거는 입장에만 쓰는 것이 원칙이다(.is-open에만 delay 규칙을 걸면 자동으로 해결).',
    kv: [
      { label: '의존성', value: 'Vanilla JS (클래스 토글) + nth-child delay' },
      { label: '줄 분리', value: '답변을 3~4개 span으로 분할 (display:block)' },
      { label: 'stagger', value: '60ms × nth-child — 12ms 이하는 동시로 보여 무의미' },
      { label: '줄 진입', value: 'fade + translateY(10→0), 300ms' },
      { label: '높이 전환', value: 'grid-rows 320ms cubic-bezier(0.4,0,0.2,1)' },
      { label: '닫힘', value: 'delay 0 — 즉시 사라져야 답답하지 않음' }
    ],
    guide: '줄 분할은 의미 단위(절·문장)로 — 자동 줄바꿈 단위로 쪼개려면 JS 측정이 필요해 배보다 배꼽이 커진다. 줄 수는 3~5개, 간격은 50~80ms가 적정. 마지막 줄 도착 시점이 duration + 누적 delay의 합이므로 전체 500ms를 넘지 않게 설계한다.',
    recommendations: [
      { place: '히어로 헤더', body: '히어로 핵심 Q&A 1~2개 — 줄 스태거가 첫인상의 모션 감도를 결정' },
      { place: '랜딩 페이지', body: '스토리텔링 랜딩의 FAQ — 답변이 문장 단위로 말을 거는 리듬' },
      { place: '제품 섹션', body: '온보딩 도움말 — 긴 설명이 줄 단위로 들어와 읽기 시작점을 안내' },
      { place: '포트폴리오 소개', body: '철학·프로세스 문답 — 타이포 중심 포트폴리오와 모션 톤 일치' }
    ],
    tradeoff: '줄을 span으로 감싸는 마크업 비용 + 콘텐츠가 CMS에서 오면 분할 로직이 필요. 답변이 1~2줄이면 스태거가 보이지 않으니 일반 fade로 강등하는 분기를 둘 것.'
  },

  // ───────────────────────────── 9. fill-sweep
  {
    id: 'fill-sweep',
    num: '09',
    title: '배경 필 스윕',
    tag: 'scaleX sweep',
    summary: '열리는 순간 헤더 배경이 좌→우 그라디언트 스윕으로 차오르고 질문 텍스트 색이 반전된다. 열림 상태가 가장 강하게 표시되는, 시각적 주장이 분명한 패턴.',
    demo: {
      hint: '질문을 클릭해보세요',
      bodyHTML: faqBody('fs', stdFaqItems('fs', PLUS('fs'))),
      css: [
        '.fs-list { display: flex; flex-direction: column; gap: 10px; }',
        '.fs-item { border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; overflow: hidden; background: rgba(255,255,255,0.02); transition: border-color 360ms; }',
        '.fs-item.is-open { border-color: rgba(196,181,253,0.7); }',
        '.fs-q { position: relative; z-index: 0; display: flex; align-items: center; justify-content: space-between; gap: 16px; width: 100%; padding: 15px 18px; background: none; border: 0; text-align: left; cursor: pointer; color: #fff; font-size: 15px; font-weight: 600; line-height: 1.5; }',
        '.fs-q::before { content: ""; position: absolute; inset: 0; z-index: -1; background: linear-gradient(90deg, #8b5cf6, #c4b5fd); transform: scaleX(0); transform-origin: left center; transition: transform 360ms cubic-bezier(0.4,0,0.2,1); }',
        '.fs-item.is-open .fs-q::before { transform: scaleX(1); }',
        '.fs-qt { transition: color 360ms; }',
        '.fs-item.is-open .fs-qt { color: #0a0a0a; }',
        '.fs-ico { flex-shrink: 0; font-size: 20px; font-weight: 300; color: rgba(255,255,255,0.5); transition: transform 360ms cubic-bezier(0.4,0,0.2,1), color 360ms; }',
        '.fs-item.is-open .fs-ico { transform: rotate(45deg); color: rgba(10,10,10,0.75); }',
        aCSS('fs', '14px 18px 16px', 360)
      ].join('\n'),
      js: toggleJS('fs'),
      height: 500
    },
    snippetHTML: `<div class="faq-item">
  <button class="faq-q" type="button" aria-expanded="false" aria-controls="faq-a1">
    <span class="faq-qt">결과물의 소유권은 누구에게 있나요?</span>
    <span class="faq-ico" aria-hidden="true">+</span>
  </button>
  <div class="faq-a" id="faq-a1" role="region">…</div>
</div>`,
    snippetCSS: `.faq-q { position: relative; z-index: 0; }
.faq-q::before { content: ""; position: absolute; inset: 0; z-index: -1;
  background: linear-gradient(90deg, #8b5cf6, #c4b5fd);
  transform: scaleX(0); transform-origin: left center;
  transition: transform 360ms cubic-bezier(0.4,0,0.2,1); }
.faq-item.is-open .faq-q::before { transform: scaleX(1); }  /* 좌→우 스윕 */
.faq-qt { transition: color 360ms; }
.faq-item.is-open .faq-qt { color: #0a0a0a; }               /* 텍스트 반전 */`,
    snippetJS: `document.querySelectorAll(".faq-q").forEach(function(btn){
  btn.addEventListener("click", function(){
    var item = btn.closest(".faq-item");
    var open = item.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });
});`,
    explain: '헤더의 ::before에 좌→우 그라디언트를 깔고 scaleX 0→1(transform-origin: left)로 차오르게 한다. 360ms 동안 배경이 밝아지는 만큼 질문 텍스트와 아이콘은 #0a0a0a로 반전 — 스윕과 색 반전이 같은 이징으로 묶여 "켜진다"는 인상을 준다. width 애니메이션이 아닌 transform이라 리플로우 없이 합성 단계에서 처리되고, 답변 영역은 어두운 톤을 유지해 읽기 대비를 지킨다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (클래스 토글)' },
      { label: '스윕', value: '::before scaleX 0→1, transform-origin: left' },
      { label: '전환 시간', value: '360ms cubic-bezier(0.4,0,0.2,1)' },
      { label: '색 반전', value: '질문 #fff → #0a0a0a (배경 밝아짐 보상)' },
      { label: '그라디언트', value: '90deg #8b5cf6 → #c4b5fd' },
      { label: '주의', value: '스윕 배경 위 텍스트 대비 4.5:1 확보 필수' }
    ],
    guide: '그라디언트의 가장 어두운 지점에서도 텍스트 대비 4.5:1을 확보할 것 — 밝은 액센트라면 어두운 텍스트로 반전이 정답이다. 스윕 방향(좌→우)은 읽기 방향과 일치시켜야 자연스럽다. 한 화면에 열린 항목이 여러 개면 색 면적이 과해지므로 싱글 오픈과의 결합도 고려.',
    recommendations: [
      { place: '히어로 헤더', body: '임팩트 중심 히어로 아래 FAQ — 열림 자체가 시각 이벤트가 됨' },
      { place: '랜딩 페이지', body: '캠페인·이벤트 랜딩 — 브랜드 컬러 스윕으로 아이덴티티 반복 노출' },
      { place: '제품 섹션', body: '신제품 발표 페이지 — 주목도가 필요한 핵심 질문에만 선별 적용' },
      { place: '포트폴리오 소개', body: '실험적 포트폴리오 — 색 반전이 강한 그래픽 개성을 부여' }
    ],
    tradeoff: '시각적 주장이 강해 보수적인 브랜드 톤에는 과할 수 있다. scaleX 스윕은 그라디언트가 가로로 눌렸다 펴지는 왜곡이 생기는데, 2-stop 단순 그라디언트에서는 거의 보이지 않지만 복잡한 패턴 배경이라면 background-size 애니메이션 대안을 검토.'
  },

  // ───────────────────────────── 10. nested-sub
  {
    id: 'nested-sub',
    num: '10',
    title: '네스티드 2단',
    tag: '2-depth nest',
    summary: '1단 카테고리를 열면 2단 세부 질문이 나타나는 중첩 아코디언. 들여쓰기와 연결선으로 계층을 표현한다. 질문이 많은 헬프 센터·문서 페이지에 적합.',
    demo: {
      hint: '카테고리 → 세부 질문 순서로 클릭해보세요',
      bodyHTML: (() => {
        let q = 0;
        const cats = NESTED.map((c, ci) => {
          const open = ci === 0;
          const subs = c.items.map((x) => {
            q += 1;
            return `<div class="ns-item">
  <button class="ns-q" type="button" aria-expanded="false" aria-controls="ns-a${q}">
    ${x.q}
    <span class="ns-ico" aria-hidden="true">+</span>
  </button>
  <div class="ns-a" id="ns-a${q}" role="region">
    <div class="ns-a-in"><p>${x.a}</p></div>
  </div>
</div>`;
          }).join('\n');
          return `<div class="ns-cat${open ? ' is-open' : ''}">
  <button class="ns-cat-q" type="button" aria-expanded="${open ? 'true' : 'false'}" aria-controls="ns-${c.id}">
    <span class="ns-cat-t">${c.cat} <span class="ns-count">${c.items.length}</span></span>
    <span class="ns-cat-ico" aria-hidden="true">+</span>
  </button>
  <div class="ns-cat-a" id="ns-${c.id}" role="region">
    <div class="ns-cat-in">
      <div class="ns-sub">
${subs}
      </div>
    </div>
  </div>
</div>`;
        }).join('\n');
        return `<div class="faq-wrap">
${faqHead()}
<div class="ns-list">
${cats}
</div>
</div>`;
      })(),
      css: [
        '.ns-list { display: flex; flex-direction: column; gap: 12px; }',
        '.ns-cat { border: 1px solid rgba(255,255,255,0.12); border-radius: 16px; background: rgba(255,255,255,0.03); }',
        '.ns-cat-q { display: flex; align-items: center; justify-content: space-between; gap: 16px; width: 100%; padding: 16px 18px; background: none; border: 0; text-align: left; cursor: pointer; color: #fff; }',
        '.ns-cat-t { display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 700; letter-spacing: -0.01em; }',
        '.ns-count { font: 700 10px/1 ui-monospace, SFMono-Regular, Menlo, monospace; color: #c4b5fd; background: rgba(139,92,246,0.18); border: 1px solid rgba(139,92,246,0.35); border-radius: 999px; padding: 4px 8px; }',
        '.ns-cat-ico { font-size: 20px; font-weight: 300; color: rgba(255,255,255,0.5); transition: transform 320ms cubic-bezier(0.4,0,0.2,1), color 320ms; }',
        '.ns-cat.is-open > .ns-cat-q .ns-cat-ico { transform: rotate(45deg); color: #8b5cf6; }',
        '.ns-cat-a { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 320ms cubic-bezier(0.4,0,0.2,1); }',
        '.ns-cat-in { overflow: hidden; min-height: 0; }',
        '.ns-cat.is-open > .ns-cat-a { grid-template-rows: 1fr; }',
        '.ns-sub { margin: 0 18px 14px 24px; padding-left: 16px; border-left: 1px solid rgba(139,92,246,0.35); }',
        '.ns-item { border-bottom: 1px solid rgba(255,255,255,0.08); }',
        '.ns-item:last-child { border-bottom: 0; }',
        '.ns-q { display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; padding: 12px 2px; background: none; border: 0; text-align: left; cursor: pointer; color: rgba(255,255,255,0.85); font-size: 14px; font-weight: 500; line-height: 1.5; transition: color 280ms; }',
        '.ns-item.is-open .ns-q { color: #fff; }',
        '.ns-ico { flex-shrink: 0; font-size: 16px; font-weight: 300; color: rgba(255,255,255,0.4); transition: transform 280ms cubic-bezier(0.4,0,0.2,1), color 280ms; }',
        '.ns-item.is-open .ns-ico { transform: rotate(45deg); color: #8b5cf6; }',
        '.ns-a { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 280ms cubic-bezier(0.4,0,0.2,1); }',
        '.ns-a-in { overflow: hidden; min-height: 0; }',
        '.ns-a-in p { margin: 0; padding: 0 8px 12px 2px; font-size: 13.5px; line-height: 1.65; color: rgba(255,255,255,0.6); }',
        '.ns-item.is-open .ns-a { grid-template-rows: 1fr; }'
      ].join('\n'),
      js: `document.querySelectorAll(".ns-cat-q").forEach(function(btn){
  btn.addEventListener("click", function(){
    var cat = btn.closest(".ns-cat");
    var open = cat.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });
});
document.querySelectorAll(".ns-q").forEach(function(btn){
  btn.addEventListener("click", function(){
    var item = btn.closest(".ns-item");
    var open = item.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });
});
// 리셋: 모두 닫고 첫 카테고리만 다시 펼침 (기본 상태)
window.__reset = function(){
  document.querySelectorAll(".ns-cat, .ns-item").forEach(function(el){ el.classList.remove("is-open"); });
  document.querySelectorAll("[aria-expanded]").forEach(function(b){ b.setAttribute("aria-expanded", "false"); });
  var first = document.querySelector(".ns-cat");
  if (first) {
    first.classList.add("is-open");
    first.querySelector(".ns-cat-q").setAttribute("aria-expanded", "true");
  }
};`,
      height: 520
    },
    snippetHTML: `<div class="ns-cat">
  <button class="ns-cat-q" type="button" aria-expanded="false" aria-controls="ns-c1">
    프로젝트 진행 <span class="ns-count">2</span>
  </button>
  <div class="ns-cat-a" id="ns-c1" role="region">
    <div class="ns-cat-in">
      <div class="ns-sub"><!-- 들여쓰기 + 연결선 -->
        <div class="ns-item">
          <button class="ns-q" type="button" aria-expanded="false" aria-controls="ns-a1">…</button>
          <div class="ns-a" id="ns-a1" role="region">…</div>
        </div>
      </div>
    </div>
  </div>
</div>`,
    snippetCSS: `/* 두 레벨 모두 grid-rows — 중첩에서도 JS 높이 계산 불필요 */
.ns-cat-a, .ns-a { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 320ms cubic-bezier(0.4,0,0.2,1); }
.ns-cat-in, .ns-a-in { overflow: hidden; min-height: 0; }
.ns-cat.is-open > .ns-cat-a, .ns-item.is-open .ns-a { grid-template-rows: 1fr; }
.ns-sub { margin-left: 24px; padding-left: 16px; border-left: 1px solid rgba(139,92,246,0.35); }`,
    snippetJS: `document.querySelectorAll(".ns-cat-q").forEach(function(btn){
  btn.addEventListener("click", function(){
    var cat = btn.closest(".ns-cat");
    btn.setAttribute("aria-expanded", cat.classList.toggle("is-open") ? "true" : "false");
  });
});
document.querySelectorAll(".ns-q").forEach(function(btn){
  btn.addEventListener("click", function(){
    var item = btn.closest(".ns-item");
    btn.setAttribute("aria-expanded", item.classList.toggle("is-open") ? "true" : "false");
  });
});`,
    explain: '1단 카테고리(프로젝트 진행 / 비용과 계약)를 열면 2단 세부 질문 목록이 나타나고, 각 질문을 다시 클릭하면 답변이 펼쳐지는 2-depth 중첩 아코디언. 두 레벨 모두 grid-rows 0fr→1fr를 쓰는데, 내부가 펼쳐질 때 외부 row는 fr 단위라 콘텐츠 높이를 따라 자동으로 늘어난다 — 중첩에서도 JS 높이 계산이 전혀 필요 없는 것이 이 기법의 진가다. 들여쓰기 24px + 보라 1px 연결선이 부모-자식 관계를 시각화하고, 카테고리 옆 카운트 배지가 안의 질문 수를 예고한다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (레벨별 독립 토글 2세트)' },
      { label: '구조', value: '1단 카테고리 2개 → 2단 질문 각 2개' },
      { label: '계층 표현', value: '들여쓰기 24px + 1px 좌측 연결선 (보라 35%)' },
      { label: '높이 기법', value: '두 레벨 모두 grid-rows 0fr→1fr — 중첩 안전' },
      { label: '전환 시간', value: '1단 320ms / 2단 280ms cubic-bezier(0.4,0,0.2,1)' },
      { label: '주의', value: '3-depth 이상 금지 — 사용성 급락' }
    ],
    guide: '카테고리당 질문 2~6개, 카테고리 3~5개가 적정 — 그보다 크면 검색·탭 분류가 낫다. 1단을 열 때는 2단 질문 제목까지만 보여주고 답변은 닫아둘 것 — 한 번에 모두 펼치면 중첩의 의미가 없다. aria-controls 연결을 레벨별로 정확히 — 스크린 리더 사용자가 계층을 인지하는 핵심 수단이다.',
    recommendations: [
      { place: '히어로 헤더', body: '헬프 센터 진입 화면 — 카테고리 → 질문 2단으로 자기 탐색 유도' },
      { place: '랜딩 페이지', body: '질문이 12개 이상인 서비스 랜딩 — 주제별로 접어 스크롤 길이를 절반으로' },
      { place: '제품 섹션', body: '복잡한 SaaS 문서·설정 — 기능군 → 세부 옵션의 자연스러운 계층' },
      { place: '포트폴리오 소개', body: '서비스 영역별(브랜딩/웹/모션) 문답 분류 — 연결선이 정보 구조를 시각화' }
    ],
    tradeoff: '클릭 2번을 거쳐야 답변에 도달 — 질문이 적으면(6개 이하) 오히려 마찰이다. 3-depth부터는 사용성이 급락하므로 절대 금지. 모바일에서 들여쓰기가 누적되면 본문 폭이 좁아지니 2단 들여쓰기는 16~24px로 절제.'
  }
];

// ============ Standalone demo HTML 빌더 ============

function buildDemoHTML(p) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${p.num}. ${p.title} — Accordion FAQ Demo</title>
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
    /* 공통 스테이지 + FAQ 헤더 */
    .stage { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 64px 24px 48px; }
    .faq-wrap { width: min(620px, 92vw); }
    .faq-head { margin: 0 0 18px; }
    .faq-eyebrow { font: 700 10px/1 ui-monospace, SFMono-Regular, Menlo, monospace; color: #8b5cf6; letter-spacing: 0.2em; text-transform: uppercase; }
    .faq-title { margin: 10px 0 0; font-size: 22px; font-weight: 700; letter-spacing: -0.01em; }
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
      // 기본 리셋: 모든 항목 닫기 (패턴 JS가 기본 상태 복원으로 재정의 가능)
      window.__reset = function(){
        document.querySelectorAll(".is-open").forEach(function(el){ el.classList.remove("is-open"); });
        document.querySelectorAll("[aria-expanded]").forEach(function(b){ b.setAttribute("aria-expanded", "false"); });
      };
      // 패턴별 JS
      ${p.demo.js.replace(/\n/g, '\n      ')}
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
      embed: 'demos/accordion-faq/' + p.id + '.html',
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
      { type: 'heading', value: '아코디언 FAQ — 패턴 카탈로그 v1' },
      { type: 'text', value: CATEGORY.summary },
      { type: 'heading', value: '10 패턴 인덱스' },
      { type: 'structure', items: indexItems },
      { type: 'heading', value: '공통 디자인 토큰 + 인터랙션 모델' },
      {
        type: 'kv', columns: 2, items: [
          { label: '폰트', value: 'Pretendard Variable (한글 본문 표준)' },
          { label: '페이지 배경 / 본문', value: '#000 / #fff — 답변 텍스트 rgba(255,255,255,0.62)' },
          { label: '액센트', value: '#8b5cf6 (violet) — 아이콘·보더·액센트 바 공통' },
          { label: '높이 애니메이션', value: 'grid-template-rows 0fr→1fr + overflow:hidden — JS 높이 측정 불필요' },
          { label: '전환 시간', value: '280~360ms cubic-bezier(0.4,0,0.2,1) — 실측 참고: linear.app 버튼 0.1s cubic-bezier(0.25,0.46,0.45,0.94)' },
          { label: '접근성', value: 'button + aria-expanded + aria-controls + role="region" — stripe.com 실측: aria-expanded 토글 16개' }
        ]
      },
      { type: 'heading', value: '읽기 가이드' },
      {
        type: 'structure', items: [
          { label: '라이브 데모', tag: 'IFRAME', desc: 'demos/accordion-faq/{pattern}.html 의 standalone 페이지를 iframe으로 임베드. 질문을 클릭하면 답변이 펼쳐짐. ↻ 다시 보기는 모든 항목 닫기' },
          { label: '작동 원리', tag: 'HOW', desc: '한 줄 요약 + 1-2 문단으로 핵심 메커니즘 설명' },
          { label: '정량 메타', tag: 'KV', desc: '의존성 / 트리거 / 높이 기법 / 전환 시간 / 접근성 등 6항목' },
          { label: '코드 스니펫', tag: 'CODE', desc: 'HTML / CSS / JS 세 블록. 패턴별 핵심만(boilerplate 제외). aria 패턴 포함' },
          { label: '사용 가이드', tag: 'GUIDE', desc: '어떻게 사용하나 — duration·콘텐츠 길이·접근성·모션 감도' },
          { label: '활용 추천', tag: 'PLACES', desc: '히어로 헤더 / 랜딩 페이지 / 제품 섹션 / 포트폴리오 소개' },
          { label: '트레이드오프', tag: 'NOTE', desc: '브라우저 지원·성능·사용성에 대한 한 줄 메모' }
        ]
      },
      {
        type: 'note',
        value: '참고 자료: Eleken "Accordion UI" 디자인 가이드 (' + CATEGORY.url + ') + stripe.com(aria-expanded 토글 16개 실측)·linear.app(버튼 transition 0.1s cubic-bezier(0.25,0.46,0.45,0.94) 실측). 본 카탈로그는 단일 컴포넌트가 아닌 10가지 아코디언 변형 비교 카탈로그를 지향한다. 모든 데모는 자동 재생이 아니라 사용자가 질문을 클릭할 때 답변이 펼쳐지는 인터랙티브 데모이며, 높이 애니메이션은 전 패턴이 grid-template-rows 0fr→1fr 기법을 공유한다.'
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
    console.log('✓ demos/accordion-faq/' + p.id + '.html');
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

  console.log('✓ analyses/accordion-faq/analysis.json');
  console.log('  ' + PATTERNS.length + ' patterns + 1 overview = ' + (PATTERNS.length + 1) + ' sections');
  const totalBlocks = Object.values(sections).reduce((acc, s) => acc + s.blocks.length, 0);
  console.log('  ' + totalBlocks + ' blocks total');
}

main();
