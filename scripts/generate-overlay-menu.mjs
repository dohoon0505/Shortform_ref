#!/usr/bin/env node
/**
 * Interaction Lab — Category Generator: 풀스크린 오버레이 메뉴 (v1)
 *
 * Awwwards "Fullscreen Nav Menu" 셀렉션(Reform Digital) + linear.app 실측 참고.
 * 햄버거 버튼 클릭 시 화면 전체를 덮는 내비게이션 오버레이 — 열림 연출 10종을
 * standalone HTML로 작성 후 iframe 임베드.
 *
 * - 자동 재생 없음. 사용자가 ☰ 버튼을 클릭해야 오버레이가 열림.
 * - 검정 배경 + Pretendard Variable + 한국어 본문.
 * - 표준 페이지: 미니 사이트 헤더(브랜드 + ☰ 버튼) + 히어로 더미 페이지.
 * - 오버레이 공통 콘텐츠: 대형 링크 4개(작업/스튜디오/저널/연락처) + 연락처·SNS 메타.
 * - 닫힘: 토글 버튼(☰↔✕) + ESC + 패턴별 딤 클릭. ↻ 다시 보기 = 메뉴 닫고 초기화.
 *
 * Usage: node scripts/generate-overlay-menu.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ANALYSIS_DIR = join(ROOT, 'analyses', 'overlay-menu');
const ANALYSIS_FILE = join(ANALYSIS_DIR, 'analysis.json');
const DEMO_DIR = join(ROOT, 'demos', 'overlay-menu');

const CATEGORY = {
  id: 'overlay-menu',
  title: '풀스크린 오버레이 메뉴',
  type: 'category',
  date: '2026-06-10',
  url: 'https://www.awwwards.com/inspiration/fullscreen-nav-menu-reform-digital-r',
  summary: '햄버거 버튼 클릭 한 번으로 화면 전체가 내비게이션 무대로 바뀌는 풀스크린 오버레이 메뉴 패턴 컬렉션. 에이전시·포트폴리오 사이트의 시그니처 연출로, clip-path·stagger·커튼 같은 등장 연출이 곧 브랜드 무드를 결정한다. Awwwards 셀렉션(Reform Digital)과 linear.app 실측(aria-expanded·aria-haspopup 토글, 버튼 transition 0.1s cubic-bezier(0.25,0.46,0.45,0.94))을 참고해 서클 익스팬드·슬라이드 패널·커튼 로우·링크 스태거·스플릿 컬럼·블러 글래스·버거 모핑·글자 캐스케이드·바텀 시트·페이지 푸시 — 10가지 열림 연출을 비교한다. 모든 데모는 자동 재생 없이 사용자가 ☰ 버튼을 클릭할 때 오버레이가 열리고, ESC·✕ 토글·딤 클릭으로 닫히는 인터랙티브 데모.'
};

// ============ 공통 오버레이 콘텐츠 헬퍼 ============
// 대형 링크 4개: 작업 / 스튜디오 / 저널 / 연락처 + 하단 연락처·SNS 메타.
// --i = 정방향 인덱스(열림 stagger), --r = 역방향 인덱스(닫힘 stagger).

const LINKS = [
  { num: '01', label: '작업' },
  { num: '02', label: '스튜디오' },
  { num: '03', label: '저널' },
  { num: '04', label: '연락처' }
];

function linksHTML(arrow) {
  return LINKS.map((l, i) => {
    const inner = `<span class="ov-num">${l.num}</span><span class="ov-txt">${l.label}</span>`
      + (arrow ? '<span class="ov-arrow">→</span>' : '');
    return `      <a class="ov-link" href="#" style="--i:${i};--r:${LINKS.length - 1 - i}">${inner}</a>`;
  }).join('\n');
}

const META_HTML = [
  '    <div class="ov-meta">',
  '      <div class="ov-meta-col"><h5>연락처</h5><p>hello@studio-moment.kr<br>+82 2 1234 5678</p></div>',
  '      <div class="ov-meta-col"><h5>주소</h5><p>서울 성동구 연무장길 12, 3F</p></div>',
  '      <div class="ov-sns"><a href="#">Instagram</a><a href="#">Behance</a><a href="#">X</a></div>',
  '    </div>'
].join('\n');

function standardOverlay(arrow) {
  return '<div class="overlay" aria-hidden="true">\n'
    + '    <nav class="ov-nav">\n' + linksHTML(arrow) + '\n    </nav>\n'
    + META_HTML + '\n  </div>';
}

// 코드 스니펫 공통 JS (접근성 포함 토글 보일러플레이트)
const SNIPPET_BASE_JS = 'var btn = document.querySelector(".menu-btn");\nvar overlay = document.querySelector(".overlay");\nfunction setOpen(open){\n  document.body.classList.toggle("menu-open", open);\n  document.body.style.overflow = open ? "hidden" : "";   /* 스크롤 잠금 */\n  btn.setAttribute("aria-expanded", open);\n  overlay.setAttribute("aria-hidden", !open);\n  if (open) overlay.querySelector(".ov-link").focus();   /* 포커스 이동 */\n  else btn.focus();\n}\nbtn.addEventListener("click", function(){ setOpen(!document.body.classList.contains("menu-open")); });\ndocument.addEventListener("keydown", function(e){ if (e.key === "Escape") setOpen(false); });';

// ============ 10 패턴 정의 ============
//
// 각 패턴은 demos/overlay-menu/{id}.html에 standalone 페이지로 작성.
// 공통 보일러플레이트(미니 헤더 + ☰ 버튼 + 히어로 + 토글/ESC/스크롤 잠금 JS)는 buildDemoHTML이 wrap.
// 각 패턴은:
//   - demo.overlayHTML — 오버레이 마크업 (.overlay 루트)
//   - demo.overlayCSS  — 오버레이 열림/닫힘 연출 CSS
//   - demo.overlayJS   — 추가 인터랙션 JS (옵션, 토글·ESC·잠금은 기본 제공)
//   - demo.height      — iframe 임베드 높이 (520~560)

const PATTERNS = [
  // ───────────────────────────── 1. circle-expand (시그니처)
  {
    id: 'circle-expand',
    num: '01',
    title: '서클 익스팬드 (시그니처)',
    summary: '햄버거 버튼 위치에서 원형 clip-path가 화면 전체로 팽창하며 오버레이가 열린다. 닫힘은 같은 원으로 역수축. 버튼이 곧 연출의 진원지가 되는, Material 모달 계보의 풀스크린 메뉴 대표 시그니처.',
    demo: {
      overlayHTML: standardOverlay(false),
      overlayCSS: `.overlay {
  display: flex; flex-direction: column; justify-content: center; gap: 36px;
  padding: 96px 9vw 48px; background: #101014;
  clip-path: circle(0px at calc(100% - 50px) 40px);
  transition: clip-path 640ms cubic-bezier(0.76,0,0.24,1);
}
body.menu-open .overlay { clip-path: circle(142% at calc(100% - 50px) 40px); }
.ov-link { opacity: 0; transform: translateY(18px); transition: opacity 240ms ease, transform 240ms ease; transition-delay: calc(var(--r) * 30ms); }
body.menu-open .ov-link { opacity: 1; transform: none; transition-delay: calc(260ms + var(--i) * 60ms); }
.ov-meta { opacity: 0; transition: opacity 240ms ease; }
body.menu-open .ov-meta { opacity: 1; transition-delay: 560ms; }`,
      overlayJS: '',
      height: 560
    },
    snippetHTML: '<button class="menu-btn" aria-expanded="false" aria-haspopup="dialog" aria-label="메뉴 열기">\n  <span class="bar"></span><span class="bar"></span><span class="bar"></span>\n</button>\n<div class="overlay" aria-hidden="true">\n  <nav class="ov-nav">\n    <a class="ov-link" href="#" style="--i:0">작업</a>\n    <a class="ov-link" href="#" style="--i:1">스튜디오</a>\n    ...\n  </nav>\n</div>',
    snippetCSS: '.overlay {\n  position: fixed; inset: 0;\n  clip-path: circle(0px at calc(100% - 50px) 40px); /* ☰ 버튼 중심 좌표 */\n  transition: clip-path 640ms cubic-bezier(0.76,0,0.24,1);\n}\nbody.menu-open .overlay {\n  clip-path: circle(142% at calc(100% - 50px) 40px); /* 뷰포트 대각선을 덮는 반경 */\n}\n.ov-link { opacity: 0; transform: translateY(18px); }\nbody.menu-open .ov-link { opacity: 1; transform: none; transition-delay: calc(260ms + var(--i) * 60ms); }',
    snippetJS: SNIPPET_BASE_JS,
    explain: 'clip-path: circle(반경 at 중심)의 반경만 0px → 142%로 트랜지션하면 버튼 위치에서 원이 자라나 화면 전체를 덮는다. 중심 좌표를 햄버거 버튼 중앙(calc(100% - 50px) 40px)에 고정해 "버튼에서 메뉴가 태어나는" 인과가 시각적으로 명확하다. 142%는 뷰포트 대각선을 넉넉히 덮는 반경. 닫을 때는 같은 트랜지션이 역재생되어 원이 버튼으로 빨려 들어가고, 링크는 --r 역방향 stagger로 먼저 사라진다. 링크 등장은 원이 충분히 커진 시점(260ms)부터 60ms 간격 stagger.',
    kv: [
      { label: '의존성', value: 'CSS only (clip-path) — JS는 클래스 토글만' },
      { label: '트리거', value: '☰ 클릭 토글 + ESC 닫힘' },
      { label: '열림 시간', value: '640ms cubic-bezier(0.76,0,0.24,1)' },
      { label: '핵심 속성', value: 'clip-path: circle(0 → 142% at 버튼 좌표)' },
      { label: '접근성', value: 'aria-expanded·aria-hidden 토글 + 포커스 이동 + 스크롤 잠금' },
      { label: '시그니처', value: 'Reform Digital 등 Awwwards 에이전시 다수' }
    ],
    guide: '원 중심 좌표는 버튼 위치와 1px도 어긋나지 않게 — 어긋나면 연출의 인과가 깨진다. 반응형이라면 JS로 getBoundingClientRect를 읽어 좌표를 CSS 변수로 주입하는 방식이 안전하다. 열림 640ms + 링크 stagger 260ms 지연이 균형점이며, 닫힘은 같은 duration의 역재생으로 충분하다. 열림 시 첫 링크로 포커스를 옮기고 body 스크롤을 잠그며, prefers-reduced-motion에서는 단순 페이드로 대체한다.',
    recommendations: [
      { place: '히어로 헤더', body: '에이전시 사이트 첫 진입 — 메뉴 여는 순간부터 모션 역량을 증명하는 시그니처' },
      { place: '랜딩 페이지', body: '단일 제품 랜딩의 보조 내비 — 페이지는 미니멀하게, 메뉴에 임팩트를 몰아줌' },
      { place: '제품 섹션', body: '브랜드 캠페인 마이크로사이트 — 원형 팽창을 브랜드 컬러로 물들여 아이덴티티 강화' },
      { place: '포트폴리오 소개', body: '디자이너 개인 사이트 — 작품 수가 적어도 메뉴 연출 하나로 인상을 남김' }
    ],
    tradeoff: 'clip-path 애니메이션은 페인트 영역이 커서 저사양 기기에서 프레임 드랍 가능 — 오버레이 배경을 단색으로 유지하면 안전. 원 중심이 버튼과 어긋나면 연출 의도가 무너지므로 반응형에서 좌표 동기화 필수. prefers-reduced-motion에서는 페이드로 대체 권장.'
  },

  // ───────────────────────────── 2. slide-panel
  {
    id: 'slide-panel',
    num: '02',
    title: '슬라이드 패널',
    summary: '우측에서 풀높이 패널이 translateX로 미끄러져 들어오고 뒤 페이지는 살짝 디밍된다. 풀스크린을 다 덮지 않아 맥락이 유지되는, 가장 보편적이고 안전한 오버레이 내비.',
    demo: {
      overlayHTML: '<div class="overlay" aria-hidden="true">\n'
        + '    <div class="ov-dim"></div>\n'
        + '    <aside class="ov-panel">\n'
        + '      <nav class="ov-nav">\n' + linksHTML(false) + '\n      </nav>\n'
        + META_HTML.replace(/^ {4}/gm, '      ') + '\n'
        + '    </aside>\n  </div>',
      overlayCSS: `.ov-dim {
  position: absolute; inset: 0; background: rgba(0,0,0,0.55);
  opacity: 0; transition: opacity 420ms ease;
}
body.menu-open .ov-dim { opacity: 1; }
.ov-panel {
  position: absolute; top: 0; right: 0; bottom: 0; width: min(420px, 88vw);
  display: flex; flex-direction: column; justify-content: center; gap: 32px;
  padding: 96px 44px 44px; background: #101014;
  border-left: 1px solid rgba(255,255,255,0.08);
  transform: translateX(100%);
  transition: transform 480ms cubic-bezier(0.76,0,0.24,1);
}
body.menu-open .ov-panel { transform: translateX(0); }
.ov-link { font-size: clamp(24px, 3.4vw, 32px); opacity: 0; transform: translateX(28px); transition: opacity 240ms ease, transform 240ms ease; transition-delay: calc(var(--r) * 24ms); }
body.menu-open .ov-link { opacity: 1; transform: none; transition-delay: calc(200ms + var(--i) * 50ms); }
.ov-meta { flex-direction: column; align-items: flex-start; gap: 18px; opacity: 0; transition: opacity 220ms ease; }
body.menu-open .ov-meta { opacity: 1; transition-delay: 440ms; }
.ov-sns { margin-left: 0; }`,
      overlayJS: 'document.querySelector(".ov-dim").addEventListener("click", function(){ window.__setOpen(false); });',
      height: 520
    },
    snippetHTML: '<div class="overlay" aria-hidden="true">\n  <div class="ov-dim"></div>\n  <aside class="ov-panel">\n    <nav class="ov-nav">…메뉴 링크…</nav>\n  </aside>\n</div>',
    snippetCSS: '.ov-dim { position: absolute; inset: 0; background: rgba(0,0,0,0.55); opacity: 0; transition: opacity 420ms ease; }\nbody.menu-open .ov-dim { opacity: 1; }\n.ov-panel {\n  position: absolute; top: 0; right: 0; bottom: 0; width: min(420px, 88vw);\n  transform: translateX(100%);\n  transition: transform 480ms cubic-bezier(0.76,0,0.24,1);\n}\nbody.menu-open .ov-panel { transform: translateX(0); }',
    snippetJS: SNIPPET_BASE_JS + '\n/* 딤 클릭으로도 닫기 */\ndocument.querySelector(".ov-dim").addEventListener("click", function(){ setOpen(false); });',
    explain: '오버레이 루트는 투명한 컨테이너이고, 그 안의 딤 레이어(opacity 0→1)와 우측 패널(translateX 100%→0)이 동시에 움직인다. transform만 사용하므로 합성 단계에서 처리되어 10년 전 기기에서도 60fps가 나오는 가장 안전한 패턴. 패널 폭을 min(420px, 88vw)으로 잡으면 데스크톱에선 사이드 패널, 모바일에선 거의 풀스크린이 되어 반응형이 공짜로 해결된다. 뒤 페이지가 디밍된 채 보이므로 사용자가 현재 위치라는 맥락을 잃지 않고, 딤 클릭으로도 닫혀 탈출 경로가 3개(✕·ESC·딤)다.',
    kv: [
      { label: '의존성', value: 'CSS only (transform) — JS는 토글 + 딤 클릭' },
      { label: '트리거', value: '☰ 클릭 토글 + ESC·딤 클릭 닫힘' },
      { label: '열림 시간', value: '480ms cubic-bezier(0.76,0,0.24,1)' },
      { label: '패널 폭', value: 'min(420px, 88vw) — 모바일 자동 대응' },
      { label: '접근성', value: '딤 클릭 닫힘 + ESC + 포커스 이동 + 스크롤 잠금' },
      { label: '시그니처', value: 'SaaS·커머스 모바일 내비 표준 (linear.app 계열)' }
    ],
    guide: '패널은 우측이 표준 — ☰ 버튼이 우측 상단에 있는 레이아웃과 동선이 일치한다. 딤은 0.5~0.6 불투명도가 적정선으로, 너무 어두우면 풀스크린과 다를 게 없고 너무 밝으면 패널 집중이 안 된다. 링크 stagger는 패널이 자리 잡기 시작하는 200ms 시점부터 시작해야 패널과 따로 노는 느낌이 없다. 패널 안에 스크롤이 필요할 만큼 항목이 많다면 이 패턴이 풀스크린 변형보다 낫다.',
    recommendations: [
      { place: '히어로 헤더', body: '콘텐츠가 본질인 사이트(블로그·미디어) — 메뉴가 화면을 다 뺏지 않아 안전' },
      { place: '랜딩 페이지', body: 'SaaS 랜딩의 모바일 내비 — 데스크톱 GNB와 모바일 패널을 같은 마크업으로' },
      { place: '제품 섹션', body: '커머스 카테고리 드로어 — 항목이 많아 스크롤이 필요한 메뉴에 최적' },
      { place: '포트폴리오 소개', body: '작품 목록을 유지한 채 메뉴를 띄우고 싶은 갤러리형 포트폴리오' }
    ],
    tradeoff: '임팩트는 10종 중 가장 약하다 — 브랜드 연출이 목적이라면 서클 익스팬드나 커튼 로우를 고려. 패널 폭이 좁아 대형 타이포는 어울리지 않고, 우측 패널은 RTL 언어권에서 좌측으로 뒤집어야 한다. 딤 클릭 닫힘은 패널 내부 클릭과의 이벤트 분리를 정확히 해야 오작동이 없다.'
  },

  // ───────────────────────────── 3. curtain-rows
  {
    id: 'curtain-rows',
    num: '03',
    title: '커튼 로우',
    summary: '가로 밴드 4개가 위에서 stagger로 떨어져 화면을 덮은 뒤 메뉴가 등장한다. 닫힘은 밴드가 위로 접혀 올라가며 사라짐. 무대 커튼의 메타포 — 극적이고 에디토리얼한 톤.',
    demo: {
      overlayHTML: '<div class="overlay" aria-hidden="true">\n'
        + '    <div class="curtain c1"></div><div class="curtain c2"></div><div class="curtain c3"></div><div class="curtain c4"></div>\n'
        + '    <div class="ov-wrap">\n'
        + '      <nav class="ov-nav">\n' + linksHTML(false) + '\n      </nav>\n'
        + META_HTML.replace(/^ {4}/gm, '      ') + '\n'
        + '    </div>\n  </div>',
      overlayCSS: `.curtain {
  position: absolute; left: 0; right: 0; height: 25.5%;
  background: #101014; transform: scaleY(0); transform-origin: top;
  transition: transform 520ms cubic-bezier(0.76,0,0.24,1);
}
.curtain.c1 { top: 0; }      .curtain.c2 { top: 25%; }
.curtain.c3 { top: 50%; }    .curtain.c4 { top: 75%; }
body.menu-open .curtain { transform: scaleY(1); }
body.menu-open .curtain.c1 { transition-delay: 0ms; }
body.menu-open .curtain.c2 { transition-delay: 70ms; }
body.menu-open .curtain.c3 { transition-delay: 140ms; }
body.menu-open .curtain.c4 { transition-delay: 210ms; }
.curtain.c4 { transition-delay: 0ms; }   .curtain.c3 { transition-delay: 70ms; }
.curtain.c2 { transition-delay: 140ms; } .curtain.c1 { transition-delay: 210ms; }
.ov-wrap {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  justify-content: center; gap: 36px; padding: 96px 9vw 48px;
  opacity: 0; transform: translateY(14px);
  transition: opacity 260ms ease, transform 260ms ease;
}
body.menu-open .ov-wrap { opacity: 1; transform: none; transition-delay: 540ms; }`,
      overlayJS: '',
      height: 540
    },
    snippetHTML: '<div class="overlay" aria-hidden="true">\n  <div class="curtain c1"></div>\n  <div class="curtain c2"></div>\n  <div class="curtain c3"></div>\n  <div class="curtain c4"></div>\n  <div class="ov-wrap">\n    <nav class="ov-nav">…메뉴 링크…</nav>\n  </div>\n</div>',
    snippetCSS: '.curtain {\n  position: absolute; left: 0; right: 0; height: 25.5%; /* 1px 이음새 방지 겹침 */\n  background: #101014; transform: scaleY(0); transform-origin: top;\n  transition: transform 520ms cubic-bezier(0.76,0,0.24,1);\n}\n.curtain.c2 { top: 25%; } /* c1~c4 = 0/25/50/75% */\nbody.menu-open .curtain { transform: scaleY(1); }\nbody.menu-open .curtain.c2 { transition-delay: 70ms; } /* 70ms × 인덱스 stagger */\nbody.menu-open .ov-wrap { opacity: 1; transition-delay: 540ms; }',
    snippetJS: SNIPPET_BASE_JS,
    explain: '오버레이 루트는 투명하고, 그 안의 가로 밴드 4개(높이 25.5%로 1px 이음새 방지)가 각각 scaleY 0→1로 펼쳐진다. transform-origin: top이라 밴드가 위에서 아래로 "내려오는" 인상. 열림은 c1→c4 순서로 70ms stagger, 닫힘은 기본 상태의 delay를 역순(c4→c1)으로 깔아 아래 밴드부터 접혀 올라간다. 밴드가 모두 덮인 540ms 시점에 메뉴 콘텐츠가 페이드 인. transform만 사용하므로 합성 단계에서 처리되어 성능이 좋다.',
    kv: [
      { label: '의존성', value: 'CSS only (transform stagger)' },
      { label: '트리거', value: '☰ 클릭 토글 + ESC 닫힘' },
      { label: '밴드 구성', value: '4행 × scaleY 0→1, 70ms stagger' },
      { label: '한 밴드 시간', value: '520ms cubic-bezier(0.76,0,0.24,1)' },
      { label: '콘텐츠 등장', value: '밴드 완료 후 540ms 지연 페이드' },
      { label: '시그니처', value: '에디토리얼 매거진 / 패션 브랜드 사이트' }
    ],
    guide: '밴드 수는 3~5개가 적정 — 많을수록 잘게 쪼개져 산만하다. 밴드 높이를 25%가 아닌 25.5%로 살짝 겹치면 트랜지션 중 배경이 비치는 1px 이음새를 막을 수 있다. 닫힘 stagger를 열림과 역순으로 두면 "커튼이 걷히는" 대칭이 완성된다. 콘텐츠 페이드는 밴드 전체가 덮인 직후(마지막 delay + duration의 70~80% 시점)에 시작해야 끊김 없이 이어진다.',
    recommendations: [
      { place: '히어로 헤더', body: '패션·매거진 사이트 — 커튼 메타포가 에디토리얼 무드와 정합' },
      { place: '랜딩 페이지', body: '시즌 캠페인 페이지 — 밴드 색을 시즌 키 컬러로 교체해 무대 전환 연출' },
      { place: '제품 섹션', body: '런칭 티저 사이트 — 메뉴 열림 자체가 공개(reveal) 모티프' },
      { place: '포트폴리오 소개', body: '모션 디자이너 포트폴리오 — stagger 감각을 메뉴에서 먼저 증명' }
    ],
    tradeoff: '열림 완료까지 730ms 이상으로 빠른 탐색에는 느린 편 — 자주 여닫는 유틸리티 내비에는 부적합. 밴드가 펼쳐지는 동안 메뉴를 조작할 수 없으므로 재방문 사용자에게는 답답할 수 있다. 임팩트가 목적인 브랜드·캠페인 사이트에 한정 권장.'
  },

  // ───────────────────────────── 4. link-stagger
  {
    id: 'link-stagger',
    num: '04',
    title: '링크 스태거',
    summary: '오버레이 배경은 즉시 깔리고, 대형 링크들이 translateY 60px + 60ms stagger로 차례차례 올라온다. hover 시 들여쓰기 + 화살표가 따라붙는 인터랙티브 디테일까지 — 풀스크린 메뉴의 표준 문법.',
    demo: {
      overlayHTML: standardOverlay(true),
      overlayCSS: `.overlay {
  display: flex; flex-direction: column; justify-content: center; gap: 36px;
  padding: 96px 9vw 48px; background: #0d0d11;
  opacity: 0; transition: opacity 200ms ease 180ms;
}
body.menu-open .overlay { opacity: 1; transition: opacity 200ms ease; }
.ov-link {
  opacity: 0; transform: translateY(60px);
  transition: opacity 200ms ease calc(var(--r) * 30ms), transform 200ms ease calc(var(--r) * 30ms), padding-left 180ms ease;
}
body.menu-open .ov-link {
  opacity: 1; transform: none;
  transition: opacity 460ms cubic-bezier(0.22,1,0.36,1) calc(120ms + var(--i) * 60ms), transform 460ms cubic-bezier(0.22,1,0.36,1) calc(120ms + var(--i) * 60ms), padding-left 180ms ease;
}
.ov-link:hover { padding-left: 18px; }
.ov-arrow { font-size: 0.55em; color: rgba(255,255,255,0.65); opacity: 0; transform: translateX(-10px); transition: opacity 180ms ease, transform 180ms ease; }
.ov-link:hover .ov-arrow { opacity: 1; transform: translateX(0); }
.ov-meta { opacity: 0; transition: opacity 240ms ease; }
body.menu-open .ov-meta { opacity: 1; transition-delay: 480ms; }`,
      overlayJS: '',
      height: 540
    },
    snippetHTML: '<nav class="ov-nav">\n  <a class="ov-link" href="#" style="--i:0;--r:3">작업<span class="ov-arrow">→</span></a>\n  <a class="ov-link" href="#" style="--i:1;--r:2">스튜디오<span class="ov-arrow">→</span></a>\n  <a class="ov-link" href="#" style="--i:2;--r:1">저널<span class="ov-arrow">→</span></a>\n  <a class="ov-link" href="#" style="--i:3;--r:0">연락처<span class="ov-arrow">→</span></a>\n</nav>',
    snippetCSS: '.ov-link { opacity: 0; transform: translateY(60px); }\nbody.menu-open .ov-link {\n  opacity: 1; transform: none;\n  transition: opacity 460ms cubic-bezier(0.22,1,0.36,1) calc(120ms + var(--i) * 60ms),\n              transform 460ms cubic-bezier(0.22,1,0.36,1) calc(120ms + var(--i) * 60ms);\n}\n/* hover 디테일: 들여쓰기 + 화살표 */\n.ov-link:hover { padding-left: 18px; }\n.ov-link:hover .ov-arrow { opacity: 1; transform: translateX(0); }',
    snippetJS: SNIPPET_BASE_JS,
    explain: '배경은 200ms 페이드로 거의 즉시 깔리고, 무게중심은 링크의 등장에 있다. 각 링크는 translateY 60px 아래에서 출발해 cubic-bezier(0.22,1,0.36,1) — 도착 직전 살짝 미끄러지는 ease-out — 로 올라오며, --i 변수 기반 60ms stagger가 리듬을 만든다. 닫힘은 --r 역방향 stagger + 짧은 200ms로 빠르게 정리. hover 시 padding-left 18px 들여쓰기와 화살표(→) 등장은 대형 타이포 메뉴에서 "지금 이 항목 위에 있다"는 피드백을 주는 표준 디테일이다.',
    kv: [
      { label: '의존성', value: 'CSS only (CSS 변수 stagger)' },
      { label: '트리거', value: '☰ 클릭 토글 + ESC 닫힘' },
      { label: '링크 등장', value: 'translateY 60px→0, 460ms + 60ms stagger' },
      { label: '이징', value: 'cubic-bezier(0.22,1,0.36,1) ease-out' },
      { label: 'hover 디테일', value: 'padding-left 18px + 화살표 180ms' },
      { label: '시그니처', value: 'Awwwards 에이전시 풀스크린 메뉴 표준 문법' }
    ],
    guide: '링크가 4~6개일 때 stagger 60ms가 적정 — 7개를 넘으면 마지막 링크 등장까지 0.5초 이상 걸려 40~50ms로 줄인다. 등장 변위 60px는 링크 font-size보다 커야 "올라오는" 인상이 살고, 작으면 흔들림으로 보인다. 닫힘은 열림보다 절반 이하로 빠르게 — 사용자가 닫기를 눌렀다는 건 이미 마음이 떠났다는 뜻이다. hover 들여쓰기는 데스크톱 전용이므로 터치 환경에서는 :hover 스타일이 고착되지 않게 @media (hover: hover)로 감싼다.',
    recommendations: [
      { place: '히어로 헤더', body: '에이전시·스튜디오 표준 — 대형 타이포 메뉴 자체가 두 번째 히어로' },
      { place: '랜딩 페이지', body: '원페이지 랜딩의 섹션 점프 내비 — 링크 수가 적어 stagger 리듬이 산다' },
      { place: '제품 섹션', body: '브랜드 룩북·캠페인 페이지 — hover 화살표로 탐색 유도' },
      { place: '포트폴리오 소개', body: '작품 카테고리가 4~5개인 포트폴리오 — 메뉴가 곧 목차' }
    ],
    tradeoff: '대형 타이포는 링크가 6개를 넘으면 화면에 안 들어간다 — 항목이 많은 사이트는 스플릿 컬럼이나 슬라이드 패널로. hover 디테일은 터치에서 무의미하므로 모바일 UX를 따로 점검할 것. stagger는 한 번 볼 때 매력이지만 매번 기다리게 하면 부채 — 닫힘만은 반드시 빠르게.'
  },

  // ───────────────────────────── 5. split-columns
  {
    id: 'split-columns',
    num: '05',
    title: '스플릿 컬럼',
    summary: '좌측 메뉴 링크 컬럼과 우측 연락처·SNS 메타 컬럼이 양쪽에서 미끄러져 들어와 가운데서 만난다. 내비게이션과 브랜드 정보를 한 화면에 — 에이전시 "연락처가 곧 CTA" 레이아웃.',
    demo: {
      overlayHTML: '<div class="overlay" aria-hidden="true">\n'
        + '    <div class="ov-col ov-col-l">\n'
        + '      <nav class="ov-nav">\n' + linksHTML(false).replace(/^ {6}/gm, '        ') + '\n      </nav>\n'
        + '    </div>\n'
        + '    <div class="ov-col ov-col-r">\n'
        + '      <div class="ov-meta-col"><h5>연락처</h5><p>hello@studio-moment.kr<br>+82 2 1234 5678</p></div>\n'
        + '      <div class="ov-meta-col"><h5>주소</h5><p>서울 성동구 연무장길 12, 3F</p></div>\n'
        + '      <div class="ov-meta-col"><h5>소셜</h5><p class="ov-sns-list"><a href="#">Instagram</a> · <a href="#">Behance</a> · <a href="#">X</a></p></div>\n'
        + '    </div>\n'
        + '    <div class="ov-divider"></div>\n  </div>',
      overlayCSS: `.overlay { display: grid; grid-template-columns: 1.25fr 0.75fr; }
.ov-col {
  display: flex; flex-direction: column; justify-content: center; gap: 24px;
  padding: 96px 5vw 48px;
  transition: transform 520ms cubic-bezier(0.76,0,0.24,1);
}
.ov-col-l { background: #101014; transform: translateX(-101%); }
.ov-col-r { background: #0b0b0f; transform: translateX(101%); transition-delay: 60ms; }
body.menu-open .ov-col { transform: translateX(0); }
body.menu-open .ov-col-l { transition-delay: 0ms; }
body.menu-open .ov-col-r { transition-delay: 60ms; }
.ov-divider {
  position: absolute; left: 62.5%; top: 0; bottom: 0; width: 1px;
  background: rgba(255,255,255,0.12);
  transform: scaleY(0); transform-origin: top;
  transition: transform 360ms cubic-bezier(0.76,0,0.24,1);
}
body.menu-open .ov-divider { transform: scaleY(1); transition-delay: 480ms; }
.ov-link { font-size: clamp(26px, 4.2vw, 40px); opacity: 0; transition: opacity 220ms ease calc(var(--r) * 24ms); }
body.menu-open .ov-link { opacity: 1; transition-delay: calc(320ms + var(--i) * 55ms); }
.ov-meta-col { opacity: 0; transform: translateX(16px); transition: opacity 240ms ease, transform 240ms ease; }
body.menu-open .ov-meta-col { opacity: 1; transform: none; }
body.menu-open .ov-col-r .ov-meta-col:nth-child(1) { transition-delay: 400ms; }
body.menu-open .ov-col-r .ov-meta-col:nth-child(2) { transition-delay: 470ms; }
body.menu-open .ov-col-r .ov-meta-col:nth-child(3) { transition-delay: 540ms; }
.ov-sns-list a { color: rgba(255,255,255,0.6); text-decoration: none; border-bottom: 1px solid rgba(255,255,255,0.18); }`,
      overlayJS: '',
      height: 540
    },
    snippetHTML: '<div class="overlay" aria-hidden="true">\n  <div class="ov-col ov-col-l">\n    <nav class="ov-nav">…메뉴 링크…</nav>\n  </div>\n  <div class="ov-col ov-col-r">\n    <div class="ov-meta-col"><h5>연락처</h5><p>hello@…</p></div>\n    <div class="ov-meta-col"><h5>주소</h5><p>서울 성동구…</p></div>\n  </div>\n</div>',
    snippetCSS: '.overlay { display: grid; grid-template-columns: 1.25fr 0.75fr; }\n.ov-col { transition: transform 520ms cubic-bezier(0.76,0,0.24,1); }\n.ov-col-l { transform: translateX(-101%); }   /* 좌측에서 진입 */\n.ov-col-r { transform: translateX(101%); transition-delay: 60ms; } /* 우측에서 진입 */\nbody.menu-open .ov-col { transform: translateX(0); }',
    snippetJS: SNIPPET_BASE_JS,
    explain: '오버레이를 grid 2컬럼(1.25fr 0.75fr)으로 나누고 좌측 컬럼은 translateX(-101%), 우측 컬럼은 translateX(101%)에서 출발시킨다. 열림과 동시에 양쪽이 가운데로 미끄러져 만나는데, 우측에 60ms 지연을 줘 완전 동시보다 미세하게 어긋나게 — 기계적인 대칭을 피하는 모션 디테일이다. 두 컬럼이 만난 뒤 경계선(scaleY 0→1)이 내려와 분할을 강조하고, 좌측 링크와 우측 메타가 각자 stagger로 차오른다. 101%는 컬럼 경계의 서브픽셀 틈을 막는 보험.',
    kv: [
      { label: '의존성', value: 'CSS only (grid + transform)' },
      { label: '트리거', value: '☰ 클릭 토글 + ESC 닫힘' },
      { label: '컬럼 구성', value: '1.25fr(메뉴) + 0.75fr(메타), 60ms 어긋남' },
      { label: '열림 시간', value: '520ms cubic-bezier(0.76,0,0.24,1)' },
      { label: '경계선', value: 'scaleY 0→1, 컬럼 도착 후 480ms 시점' },
      { label: '시그니처', value: '에이전시 "Contact가 곧 CTA" 레이아웃' }
    ],
    guide: '좌측은 탐색(링크), 우측은 전환(연락처·SNS)으로 역할을 고정하면 메뉴가 곧 미니 랜딩이 된다. 컬럼 비율은 1.25:0.75 안팎 — 우측이 절반을 넘으면 메뉴가 부차적으로 보인다. 두 컬럼의 배경 명도를 한 단계 차이 나게(#101014 vs #0b0b0f) 두면 경계선 없이도 분할이 읽힌다. 모바일에서는 grid를 1컬럼으로 풀고 우측 컬럼을 하단 메타로 내리는 fallback이 자연스럽다.',
    recommendations: [
      { place: '히어로 헤더', body: '수주형 에이전시 — 모든 페이지에서 연락처가 한 클릭 거리' },
      { place: '랜딩 페이지', body: '행사·전시 랜딩 — 좌측 프로그램 내비 + 우측 일시·장소 정보' },
      { place: '제품 섹션', body: 'B2B 제품 사이트 — 메뉴와 영업 문의 채널을 한 화면에' },
      { place: '포트폴리오 소개', body: '프리랜서 포트폴리오 — 작품 링크와 의뢰 연락처를 동시에 노출' }
    ],
    tradeoff: '두 컬럼이 각자 움직여 reflow 없는 transform이지만, 콘텐츠 양 비대칭이 심하면 한쪽이 휑해 보인다 — 우측 메타가 빈약하면 표준 풀스크린(하단 메타)으로. 모바일 1컬럼 fallback 설계를 처음부터 같이 하지 않으면 좁은 화면에서 깨진다.'
  },

  // ───────────────────────────── 6. blur-glass
  {
    id: 'blur-glass',
    num: '06',
    title: '블러 글래스',
    summary: 'backdrop-filter: blur(20px)의 반투명 유리 오버레이 — 뒤 페이지가 비치는 채로 메뉴가 떠오른다. 화면을 "덮는다"기보다 "한 겹 얹는" 가벼운 무드의 풀스크린 메뉴.',
    demo: {
      overlayHTML: standardOverlay(false),
      overlayCSS: `.overlay {
  display: flex; flex-direction: column; justify-content: center; gap: 36px;
  padding: 96px 9vw 48px;
  background: rgba(10,10,14,0.45);
  -webkit-backdrop-filter: blur(20px) saturate(150%);
  backdrop-filter: blur(20px) saturate(150%);
  border-top: 1px solid rgba(255,255,255,0.08);
  opacity: 0; transition: opacity 360ms ease;
}
body.menu-open .overlay { opacity: 1; }
.ov-link { opacity: 0; transform: translateY(16px); transition: opacity 240ms ease, transform 240ms ease; transition-delay: calc(var(--r) * 24ms); }
body.menu-open .ov-link { opacity: 1; transform: none; transition-delay: calc(140ms + var(--i) * 45ms); }
.ov-meta { opacity: 0; transition: opacity 240ms ease; }
body.menu-open .ov-meta { opacity: 1; transition-delay: 380ms; }`,
      overlayJS: '',
      height: 520
    },
    snippetHTML: '<div class="overlay" aria-hidden="true">\n  <nav class="ov-nav">…메뉴 링크…</nav>\n  <div class="ov-meta">…연락처·SNS…</div>\n</div>',
    snippetCSS: '.overlay {\n  position: fixed; inset: 0;\n  background: rgba(10,10,14,0.45);                      /* 반투명 틴트 */\n  -webkit-backdrop-filter: blur(20px) saturate(150%);   /* Safari 필수 prefix */\n  backdrop-filter: blur(20px) saturate(150%);\n  opacity: 0; transition: opacity 360ms ease;           /* blur 값 대신 opacity만 애니메이션 */\n}\nbody.menu-open .overlay { opacity: 1; }\n/* 폴백: backdrop-filter 미지원 시 불투명도 상향 */\n@supports not (backdrop-filter: blur(20px)) {\n  .overlay { background: rgba(10,10,14,0.92); }\n}',
    snippetJS: SNIPPET_BASE_JS,
    explain: '오버레이 배경을 rgba(10,10,14,0.45) 틴트 + backdrop-filter: blur(20px) saturate(150%)로 깔면 뒤 페이지가 젖빛 유리 너머처럼 비친다. 핵심 성능 수칙은 blur 값 자체를 애니메이션하지 않는 것 — blur(0→20px) 트랜지션은 매 프레임 필터를 다시 계산해 무겁다. 대신 필터는 고정하고 오버레이의 opacity만 0→1로 페이드하면 유리가 "차오르는" 인상은 같으면서 비용은 페이드 한 번이다. saturate(150%)는 블러로 탁해진 뒤 배경의 채도를 보정해 유리 질감을 살린다.',
    kv: [
      { label: '의존성', value: 'CSS only (backdrop-filter)' },
      { label: '트리거', value: '☰ 클릭 토글 + ESC 닫힘' },
      { label: '열림 시간', value: 'opacity 360ms ease (blur 값은 고정)' },
      { label: '핵심 속성', value: 'backdrop-filter: blur(20px) saturate(150%)' },
      { label: '폴백', value: '@supports not → 배경 불투명도 0.92로 상향' },
      { label: '시그니처', value: 'iOS 컨트롤 센터 / Apple·Vision 계열 글래스 UI' }
    ],
    guide: '틴트 불투명도 0.4~0.55가 균형점 — 너무 투명하면 뒤 텍스트와 메뉴 링크가 겹쳐 읽기 힘들고, 너무 불투명하면 유리 효과의 의미가 없다. -webkit- prefix는 iOS Safari에서 필수. backdrop-filter 미지원 브라우저(구형 Firefox 등)를 위해 @supports 폴백으로 불투명 배경을 깔아 가독성을 보장한다. 뒤 페이지에 디테일이 많을수록 블러의 매력이 사는 패턴이므로, 빈 단색 페이지 위에서는 효과가 죽는다.',
    recommendations: [
      { place: '히어로 헤더', body: '비주얼이 강한 히어로 위에 — 이미지가 비치며 맥락 유지 + 무드 연출' },
      { place: '랜딩 페이지', body: '제품 스크린샷이 깔린 SaaS 랜딩 — 메뉴를 열어도 제품이 어렴풋이 보임' },
      { place: '제품 섹션', body: '미디어·갤러리 사이트 — 콘텐츠를 가리지 않는 가벼운 내비' },
      { place: '포트폴리오 소개', body: '사진가·아트 디렉터 포트폴리오 — 작품 위에 유리 한 겹의 절제된 메뉴' }
    ],
    tradeoff: 'backdrop-filter는 큰 면적에서 GPU 비용이 상당하다 — 스크롤 중인 콘텐츠 위에서는 더 무겁고, 저사양 안드로이드에서 프레임 드랍 보고가 많다. blur 값 애니메이션은 금물(고정 + opacity 페이드). 뒤 배경이 밝으면 흰 텍스트 대비가 무너지므로 틴트 농도를 배경 톤에 맞춰 조정해야 한다.'
  },

  // ───────────────────────────── 7. burger-morph
  {
    id: 'burger-morph',
    num: '07',
    title: '버거 모핑',
    summary: '☰ 세 획이 ✕로 모핑하는 디테일에 집중한 패턴 — 가운데 획이 먼저 사라지고, 위·아래 획이 중앙으로 모이며 45° 회전한다. 오버레이는 절제된 페이드, 주인공은 버튼.',
    demo: {
      overlayHTML: standardOverlay(false),
      overlayCSS: `.overlay {
  display: flex; flex-direction: column; justify-content: center; gap: 36px;
  padding: 96px 9vw 48px; background: #0d0d11;
  opacity: 0; transition: opacity 360ms ease;
}
body.menu-open .overlay { opacity: 1; }
/* ☰ → ✕ 모핑 타이밍 분해 (보일러플레이트 morph 오버라이드) */
.menu-btn { transition: background 0.1s cubic-bezier(0.25,0.46,0.45,0.94), transform 0.1s cubic-bezier(0.25,0.46,0.45,0.94); }
.menu-btn:active { transform: scale(0.92); }
.menu-btn .bar2 { transition: opacity 140ms ease 200ms; }
.menu-btn .bar1, .menu-btn .bar3 { transition: transform 280ms cubic-bezier(0.76,0,0.24,1); }
body.menu-open .bar2 { opacity: 0; transition: opacity 120ms ease; }
body.menu-open .bar1 { transform: translateY(6px) rotate(45deg); transition: transform 300ms cubic-bezier(0.76,0,0.24,1) 110ms; }
body.menu-open .bar3 { transform: translateY(-6px) rotate(-45deg); transition: transform 300ms cubic-bezier(0.76,0,0.24,1) 110ms; }
.ov-link { opacity: 0; transform: translateY(14px); transition: opacity 220ms ease, transform 220ms ease; transition-delay: calc(var(--r) * 22ms); }
body.menu-open .ov-link { opacity: 1; transform: none; transition-delay: calc(180ms + var(--i) * 50ms); }
.ov-meta { opacity: 0; transition: opacity 220ms ease; }
body.menu-open .ov-meta { opacity: 1; transition-delay: 420ms; }`,
      overlayJS: '',
      height: 520
    },
    snippetHTML: '<button class="menu-btn" aria-expanded="false" aria-label="메뉴 열기">\n  <span class="bar bar1"></span>\n  <span class="bar bar2"></span>\n  <span class="bar bar3"></span>\n</button>',
    snippetCSS: '.menu-btn .bar { width: 18px; height: 2px; background: #fff; border-radius: 1px; }\n.bar + .bar { margin-top: 4px; } /* 획 중심 간격 6px */\n\n/* 열림: 가운데 획 퇴장(120ms) → 110ms 뒤 위·아래 획이 모이며 45° 회전 */\nbody.menu-open .bar2 { opacity: 0; transition: opacity 120ms ease; }\nbody.menu-open .bar1 { transform: translateY(6px) rotate(45deg);  transition: transform 300ms cubic-bezier(0.76,0,0.24,1) 110ms; }\nbody.menu-open .bar3 { transform: translateY(-6px) rotate(-45deg); transition: transform 300ms cubic-bezier(0.76,0,0.24,1) 110ms; }\n\n/* 닫힘: 회전 해제가 먼저, 가운데 획은 200ms 늦게 복귀 */\n.bar1, .bar3 { transition: transform 280ms cubic-bezier(0.76,0,0.24,1); }\n.bar2 { transition: opacity 140ms ease 200ms; }',
    snippetJS: SNIPPET_BASE_JS + '\n/* aria-label도 상태에 맞춰 갱신 */\nbtn.addEventListener("click", function(){\n  btn.setAttribute("aria-label", document.body.classList.contains("menu-open") ? "메뉴 닫기" : "메뉴 열기");\n});',
    explain: '모핑을 한 덩어리 transform이 아니라 획별 타이밍으로 분해하는 것이 핵심. 열림은 ① 가운데 획이 120ms에 사라지고 ② 110ms 지연 후 위·아래 획이 translateY(±6px)로 중앙에 모이며 rotate(±45deg)로 ✕를 만든다. 닫힘은 transition 정의를 기본 상태에 역순으로 깔아 — 회전이 먼저 풀리고(즉시), 가운데 획은 200ms 늦게 복귀 — 열림의 거울상이 된다. translateY 값(±6px)은 획 높이 2px + 간격 4px에서 나온 기하학적 상수로, 획 배치가 바뀌면 같이 바뀌어야 한다. linear.app 실측처럼 버튼 자체에는 0.1s의 짧은 배경·스케일 피드백을 둔다.',
    kv: [
      { label: '의존성', value: 'CSS only — JS는 클래스·aria 토글만' },
      { label: '트리거', value: '☰ 클릭 토글 + ESC 닫힘' },
      { label: '모핑 시퀀스', value: 'bar2 퇴장 120ms → 110ms 뒤 bar1·3 회전 300ms' },
      { label: '기하 상수', value: 'translateY ±6px = 획 2px + 간격 4px' },
      { label: '버튼 피드백', value: '0.1s cubic-bezier(0.25,0.46,0.45,0.94) — linear.app 실측' },
      { label: '시그니처', value: '모바일 햄버거 토글 사실상 전 업계 표준' }
    ],
    guide: '버튼은 44×44px 이상의 터치 타깃을 확보하고, 획은 그 안에서 18px 폭이 적정. 모핑 전체(퇴장+회전)는 400ms 안에 끝나야 토글이 경쾌하다 — 600ms를 넘기면 버튼이 굼떠 보인다. ✕ 상태의 버튼은 오버레이보다 z-index가 높아야 닫기 수단이 항상 보장된다. aria-expanded와 aria-label("메뉴 열기"↔"메뉴 닫기")을 함께 갱신해야 스크린 리더 사용자에게도 상태 변화가 전달된다.',
    recommendations: [
      { place: '히어로 헤더', body: '모든 풀스크린 메뉴의 기본 장착 디테일 — 다른 9개 패턴과 조합 가능' },
      { place: '랜딩 페이지', body: '미니멀 랜딩 — 오버레이는 수수해도 버튼 모핑 하나로 완성도 전달' },
      { place: '제품 섹션', body: '앱 웹뷰·하이브리드 UI — 네이티브스러운 토글 감각' },
      { place: '포트폴리오 소개', body: '디테일 지향 포트폴리오 — 마이크로 인터랙션 감각의 증명' }
    ],
    tradeoff: '연출 임팩트는 버튼 크기만큼 — 화면 전체의 인상을 바꾸지는 못하므로 단독보다 다른 오버레이 패턴과의 조합이 전제다. 획별 delay 체인은 획 수·간격을 바꿀 때마다 재계산해야 하는 유지보수 비용이 있다. SVG path 모핑까지 가면 더 유려하지만 의존성 없이는 이 2단 분해가 비용 대비 최선.'
  },

  // ───────────────────────────── 8. char-cascade
  {
    id: 'char-cascade',
    num: '08',
    title: '글자 캐스케이드',
    summary: '메뉴 링크의 글자들이 overflow hidden 줄 마스크 아래에서 한 자씩 회전하며 올라온다. 링크 단위 stagger 위에 글자 단위 stagger를 겹친 — 타이포그래피가 주인공인 연출.',
    demo: {
      overlayHTML: standardOverlay(false),
      overlayCSS: `.overlay {
  display: flex; flex-direction: column; justify-content: center; gap: 36px;
  padding: 96px 9vw 48px; background: #101014;
  opacity: 0; transition: opacity 240ms ease 160ms;
}
body.menu-open .overlay { opacity: 1; transition: opacity 240ms ease; }
.ov-txt { display: inline-block; overflow: hidden; vertical-align: bottom; padding-bottom: 0.08em; }
.ov-txt .ch {
  display: inline-block; will-change: transform;
  transform: translateY(112%) rotate(10deg); transform-origin: left bottom;
  transition: transform 240ms cubic-bezier(0.55,0,0.55,1);
}
body.menu-open .ov-txt .ch {
  transform: translateY(0) rotate(0deg);
  transition: transform 480ms cubic-bezier(0.22,1,0.36,1);
  transition-delay: var(--d);
}
.ov-num { opacity: 0; transition: opacity 200ms ease; }
body.menu-open .ov-num { opacity: 1; transition-delay: calc(160ms + var(--i) * 90ms); }
.ov-meta { opacity: 0; transition: opacity 240ms ease; }
body.menu-open .ov-meta { opacity: 1; transition-delay: 620ms; }`,
      overlayJS: `// 링크 텍스트를 글자 span으로 분해 + 글자별 delay 주입
document.querySelectorAll(".ov-txt").forEach(function(txt, li){
  var chars = txt.textContent.split("");
  txt.textContent = "";
  chars.forEach(function(c, ci){
    var s = document.createElement("span");
    s.className = "ch";
    s.textContent = c === " " ? "\\u00A0" : c;
    s.style.setProperty("--d", (160 + li * 90 + ci * 30) + "ms");
    txt.appendChild(s);
  });
});`,
      height: 540
    },
    snippetHTML: '<nav class="ov-nav">\n  <!-- JS가 .ov-txt 안의 글자를 <span class="ch">로 분해 -->\n  <a class="ov-link" href="#"><span class="ov-txt">작업</span></a>\n  <a class="ov-link" href="#"><span class="ov-txt">스튜디오</span></a>\n  ...\n</nav>',
    snippetCSS: '.ov-txt { display: inline-block; overflow: hidden; vertical-align: bottom; } /* 줄 마스크 */\n.ov-txt .ch {\n  display: inline-block;\n  transform: translateY(112%) rotate(10deg); transform-origin: left bottom;\n  transition: transform 240ms cubic-bezier(0.55,0,0.55,1); /* 닫힘: 짧고 균일 */\n}\nbody.menu-open .ov-txt .ch {\n  transform: translateY(0) rotate(0deg);\n  transition: transform 480ms cubic-bezier(0.22,1,0.36,1);\n  transition-delay: var(--d); /* JS가 링크×90ms + 글자×30ms로 주입 */\n}',
    snippetJS: SNIPPET_BASE_JS + '\n/* 글자 분해 + delay 주입 (초기화 1회) */\ndocument.querySelectorAll(".ov-txt").forEach(function(txt, li){\n  var chars = txt.textContent.split("");\n  txt.textContent = "";\n  chars.forEach(function(c, ci){\n    var s = document.createElement("span");\n    s.className = "ch";\n    s.textContent = c === " " ? "\\u00A0" : c;\n    s.style.setProperty("--d", (160 + li * 90 + ci * 30) + "ms");\n    txt.appendChild(s);\n  });\n});',
    explain: '초기화 시 JS가 각 링크의 텍스트를 글자 span(.ch)으로 분해하고, 글자마다 --d 변수로 지연(160ms + 링크 인덱스×90ms + 글자 인덱스×30ms)을 주입한다. 부모 .ov-txt는 overflow: hidden 줄 마스크 — 글자는 translateY(112%) rotate(10deg), 즉 마스크 아래에 기울어진 채 숨어 있다가 열림과 동시에 제자리로 회전하며 올라온다. transform-origin: left bottom이라 글자가 왼쪽 아래 모서리를 축으로 "일어서는" 인상. 닫힘은 delay 없는 240ms 균일 트랜지션으로 즉시 정리해, 화려한 등장과 깔끔한 퇴장의 비대칭을 만든다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (글자 분해 + delay 주입)' },
      { label: '트리거', value: '☰ 클릭 토글 + ESC 닫힘' },
      { label: '글자 등장', value: 'translateY 112% + rotate 10° → 0, 480ms' },
      { label: 'stagger 구조', value: '링크 90ms × 글자 30ms 2중 지연' },
      { label: '마스크', value: '.ov-txt overflow: hidden 줄 마스크' },
      { label: '시그니처', value: 'Awwwards 타이포 중심 에이전시 / GSAP SplitText 계열' }
    ],
    guide: '글자 stagger 30ms는 한글 2~5자 링크 기준 — 글자 수가 많은 영문 메뉴라면 15~20ms로 줄여 마지막 글자까지 1초를 넘기지 않는다. rotate는 8~12°가 적정선으로, 그 이상이면 글자가 "쓰러졌다 일어나는" 과장이 된다. 한글은 받침에 따라 글자 높이가 달라 translateY를 100%가 아닌 112%로 줘야 마스크 밖으로 비어져 나오지 않는다. 공백은 \\u00A0로 치환해야 span 분해 후에도 줄바꿈·간격이 유지된다.',
    recommendations: [
      { place: '히어로 헤더', body: '타이포그래피 중심 브랜드 — 메뉴 글자 하나하나가 모션 쇼케이스' },
      { place: '랜딩 페이지', body: '폰트·출판·미디어 제품 랜딩 — 글자 연출이 곧 제품 데모' },
      { place: '제품 섹션', body: '브랜드 캠페인 — 슬로건형 메뉴 링크에 글자 캐스케이드로 무게' },
      { place: '포트폴리오 소개', body: '그래픽·타입 디자이너 포트폴리오 — 정체성을 메뉴에서 선언' }
    ],
    tradeoff: 'DOM이 글자 수만큼 늘어나고(링크 4개 × 평균 3자 = span 12개 수준이면 무해하나 긴 메뉴는 주의) 스크린 리더가 분해된 글자를 따로 읽을 수 있어 aria-label로 원문을 보존해야 한다. 글자 단위 연출은 매번 보면 피로하므로 닫힘은 반드시 빠르고 균일하게. 이 연출이 본질인 프로젝트가 아니라면 링크 스태거(04)가 더 경제적이다.'
  },

  // ───────────────────────────── 9. drawer-bottom
  {
    id: 'drawer-bottom',
    num: '09',
    title: '바텀 시트',
    summary: '하단에서 시트가 올라오고 드래그 핸들 바가 달리는 모바일 문법. 뒤 페이지는 scale 0.96으로 살짝 물러나 시트에 공간감을 내준다 — iOS 시트 전환을 웹 메뉴로 번역한 패턴.',
    demo: {
      overlayHTML: '<div class="overlay" aria-hidden="true">\n'
        + '    <div class="ov-dim"></div>\n'
        + '    <div class="ov-sheet" role="dialog" aria-label="메뉴">\n'
        + '      <div class="ov-grip"></div>\n'
        + '      <nav class="ov-nav">\n' + linksHTML(false) + '\n      </nav>\n'
        + META_HTML.replace(/^ {4}/gm, '      ') + '\n'
        + '    </div>\n  </div>',
      overlayCSS: `.ov-dim {
  position: absolute; inset: 0; background: rgba(0,0,0,0.5);
  opacity: 0; transition: opacity 420ms ease;
}
body.menu-open .ov-dim { opacity: 1; }
.ov-sheet {
  position: absolute; left: 0; right: 0; bottom: 0;
  display: flex; flex-direction: column; gap: 26px;
  padding: 18px 8vw 40px; background: #121216;
  border-radius: 22px 22px 0 0; border-top: 1px solid rgba(255,255,255,0.1);
  transform: translateY(104%);
  transition: transform 520ms cubic-bezier(0.32,0.72,0,1);
}
body.menu-open .ov-sheet { transform: translateY(0); }
.ov-grip { width: 40px; height: 4px; border-radius: 999px; background: rgba(255,255,255,0.22); margin: 0 auto 4px; }
.ov-link { font-size: clamp(22px, 3vw, 30px); opacity: 0; transform: translateY(12px); transition: opacity 220ms ease, transform 220ms ease; transition-delay: calc(var(--r) * 20ms); }
body.menu-open .ov-link { opacity: 1; transform: none; transition-delay: calc(220ms + var(--i) * 45ms); }
.ov-meta { opacity: 0; transition: opacity 220ms ease; }
body.menu-open .ov-meta { opacity: 1; transition-delay: 440ms; }
/* 배경 페이지 후퇴 */
.page-wrap { transition: transform 520ms cubic-bezier(0.32,0.72,0,1); transform-origin: center top; }
body.menu-open .page-wrap { transform: scale(0.96); }`,
      overlayJS: 'document.querySelector(".ov-dim").addEventListener("click", function(){ window.__setOpen(false); });',
      height: 560
    },
    snippetHTML: '<div class="overlay" aria-hidden="true">\n  <div class="ov-dim"></div>\n  <div class="ov-sheet" role="dialog" aria-label="메뉴">\n    <div class="ov-grip"></div> <!-- 드래그 핸들 바 -->\n    <nav class="ov-nav">…메뉴 링크…</nav>\n  </div>\n</div>',
    snippetCSS: '.ov-sheet {\n  position: absolute; left: 0; right: 0; bottom: 0;\n  background: #121216; border-radius: 22px 22px 0 0;\n  transform: translateY(104%);\n  transition: transform 520ms cubic-bezier(0.32,0.72,0,1); /* iOS 시트 이징 */\n}\nbody.menu-open .ov-sheet { transform: translateY(0); }\n.ov-grip { width: 40px; height: 4px; border-radius: 999px; background: rgba(255,255,255,0.22); margin: 0 auto; }\n/* 배경 페이지 후퇴 */\n.page-wrap { transition: transform 520ms cubic-bezier(0.32,0.72,0,1); transform-origin: center top; }\nbody.menu-open .page-wrap { transform: scale(0.96); }',
    snippetJS: SNIPPET_BASE_JS + '\n/* 딤 클릭으로도 닫기 */\ndocument.querySelector(".ov-dim").addEventListener("click", function(){ setOpen(false); });',
    explain: '시트는 translateY(104%)에서 cubic-bezier(0.32,0.72,0,1) — 빠르게 출발해 부드럽게 도착하는 iOS 계열 이징 — 으로 올라온다. 동시에 페이지 래퍼가 scale(0.96)으로 물러나는 것이 이 패턴의 정체성: 시트가 페이지 "위에 떠 있다"는 공간 위계를 만든다(transform-origin: center top이라 위쪽 기준으로 줄어 하단 시트와 겹치지 않는다). 상단의 40×4px 그립 바는 모바일 사용자에게 "끌어 내려 닫을 수 있다"는 어포던스 — 실서비스에서는 터치 드래그 제스처를 붙이는 자리다. 딤 클릭·ESC·✕ 세 가지 닫기 경로를 모두 연다.',
    kv: [
      { label: '의존성', value: 'CSS only — JS는 토글 + 딤 클릭 (드래그는 확장)' },
      { label: '트리거', value: '☰ 클릭 토글 + ESC·딤 클릭 닫힘' },
      { label: '열림 시간', value: '520ms cubic-bezier(0.32,0.72,0,1) — iOS 시트 이징' },
      { label: '배경 후퇴', value: '.page-wrap scale 1 → 0.96 동기 트랜지션' },
      { label: '접근성', value: 'role="dialog" + aria-label + 포커스 이동 + 스크롤 잠금' },
      { label: '시그니처', value: 'iOS 시트 / Vaul(웹) / 모바일 커머스 표준' }
    ],
    guide: '시트 높이는 콘텐츠만큼만 — 화면의 70~85%를 넘기면 풀스크린과 다를 게 없어 시트의 의미가 사라진다. 배경 scale은 0.95~0.97 사이의 미세 값이 정답으로, 그 이하는 페이지가 "도망가는" 과장이 된다. 그립 바를 그렸다면 실제 드래그 닫기(touchmove 추적 → 임계값 통과 시 닫힘)까지 구현하는 것이 정직한 UI다. 데스크톱에서는 하단 시트가 어색할 수 있으므로 뷰포트 폭에 따라 슬라이드 패널(02)로 전환하는 분기를 권장.',
    recommendations: [
      { place: '히어로 헤더', body: '모바일 우선 브랜드 사이트 — 네이티브 앱 감각의 메뉴 전환' },
      { place: '랜딩 페이지', body: '앱 다운로드 랜딩 — 웹에서도 앱과 같은 시트 문법으로 일관성' },
      { place: '제품 섹션', body: '모바일 커머스 — 필터·옵션 시트와 같은 문법의 메뉴' },
      { place: '포트폴리오 소개', body: '모바일 중심 인터랙션 디자이너 — 제스처 감각의 증명' }
    ],
    tradeoff: '데스크톱 대화면에서는 하단 시트가 시각적으로 어색하다 — 뷰포트 분기가 사실상 필수. 배경 scale 트랜지션은 페이지 전체를 합성 레이어로 승격시켜 매우 긴 페이지에서는 메모리 비용이 있다. 그립 바만 그리고 드래그를 구현하지 않으면 어포던스 사기가 되니 주의.'
  },

  // ───────────────────────────── 10. push-shift
  {
    id: 'push-shift',
    num: '10',
    title: '페이지 푸시',
    summary: '메뉴 패널이 좌측에서 들어오며 페이지 전체를 오른쪽으로 밀어내고, 페이지는 scale 축소 + perspective 회전으로 물러난다. 메뉴와 페이지가 같은 3D 공간에 있는 듯한 연출.',
    demo: {
      overlayHTML: '<div class="overlay" aria-hidden="true">\n'
        + '    <aside class="ov-push">\n'
        + '      <nav class="ov-nav">\n' + linksHTML(false) + '\n      </nav>\n'
        + META_HTML.replace(/^ {4}/gm, '      ') + '\n'
        + '    </aside>\n  </div>',
      overlayCSS: `.ov-push {
  position: absolute; top: 0; bottom: 0; left: 0; width: min(380px, 82vw);
  display: flex; flex-direction: column; justify-content: center; gap: 30px;
  padding: 96px 40px 44px; background: #0d0d11;
  border-right: 1px solid rgba(255,255,255,0.08);
  transform: translateX(-100%);
  transition: transform 560ms cubic-bezier(0.76,0,0.24,1);
}
body.menu-open .ov-push { transform: translateX(0); }
.ov-link { font-size: clamp(22px, 3vw, 30px); opacity: 0; transform: translateX(-20px); transition: opacity 220ms ease, transform 220ms ease; transition-delay: calc(var(--r) * 22ms); }
body.menu-open .ov-link { opacity: 1; transform: none; transition-delay: calc(240ms + var(--i) * 50ms); }
.ov-meta { flex-direction: column; align-items: flex-start; gap: 16px; opacity: 0; transition: opacity 220ms ease; }
body.menu-open .ov-meta { opacity: 1; transition-delay: 480ms; }
.ov-sns { margin-left: 0; }
/* 페이지 푸시 + 원근 후퇴 */
.scene { perspective: 1400px; overflow: hidden; }
.page-wrap { transition: transform 560ms cubic-bezier(0.76,0,0.24,1); transform-origin: left center; }
body.menu-open .page-wrap { transform: translateX(min(380px, 70vw)) scale(0.94) rotateY(-6deg); }`,
      overlayJS: '',
      height: 540
    },
    snippetHTML: '<div class="scene">\n  <div class="page-wrap">\n    …페이지 전체 콘텐츠…\n  </div>\n</div>\n<div class="overlay" aria-hidden="true">\n  <aside class="ov-push">\n    <nav class="ov-nav">…메뉴 링크…</nav>\n  </aside>\n</div>',
    snippetCSS: '.ov-push {\n  position: fixed; top: 0; bottom: 0; left: 0; width: min(380px, 82vw);\n  transform: translateX(-100%);\n  transition: transform 560ms cubic-bezier(0.76,0,0.24,1);\n}\nbody.menu-open .ov-push { transform: translateX(0); }\n\n/* 페이지가 같은 시간·이징으로 밀려나야 한 공간으로 보인다 */\n.scene { perspective: 1400px; overflow: hidden; }\n.page-wrap { transition: transform 560ms cubic-bezier(0.76,0,0.24,1); transform-origin: left center; }\nbody.menu-open .page-wrap { transform: translateX(min(380px, 70vw)) scale(0.94) rotateY(-6deg); }',
    snippetJS: SNIPPET_BASE_JS,
    explain: '메뉴 패널(translateX -100%→0)과 페이지 래퍼(translateX 0→패널 폭, scale 0.94, rotateY -6deg)가 같은 560ms·같은 cubic-bezier(0.76,0,0.24,1)로 움직이는 것이 전부이자 핵심이다. 시간이나 이징이 1프레임이라도 어긋나면 "메뉴가 페이지를 밀어낸다"는 물리적 인과가 깨진다. 페이지를 perspective: 1400px 컨테이너 안에서 rotateY(-6deg)로 살짝 비틀면 단순 평행이동이 아니라 안쪽으로 물러나는 깊이가 생긴다 — transform-origin: left center라 패널과 닿는 왼쪽 모서리가 축이 된다. 오버레이를 풀스크린으로 덮지 않으므로 밀려난 페이지가 계속 보이며 맥락이 유지된다.',
    kv: [
      { label: '의존성', value: 'CSS only (transform + perspective)' },
      { label: '트리거', value: '☰ 클릭 토글 + ESC 닫힘' },
      { label: '동기화', value: '패널·페이지 동일 560ms cubic-bezier(0.76,0,0.24,1)' },
      { label: '페이지 변환', value: 'translateX(패널 폭) + scale 0.94 + rotateY -6°' },
      { label: '원근', value: '.scene perspective 1400px, origin left center' },
      { label: '시그니처', value: '오프캔버스 푸시 내비 — 모바일 앱·에이전시 사이트' }
    ],
    guide: '패널과 페이지의 duration·easing을 변수로 공유해 한 곳에서 관리하라 — 둘이 어긋나는 순간 연출이 무너진다. rotateY는 -4~-8° 사이의 미세 값이 적정으로, 그 이상은 페이지가 "쓰러지는" 과장이 된다. 페이지가 밀려난 상태에서도 보이는 영역은 클릭되면 안 되므로 열림 중에는 페이지에 pointer-events: none을 걸고, 밀린 페이지 클릭 = 닫기로 연결하면 자연스러운 탈출구가 하나 더 생긴다. 푸시된 페이지의 가로 스크롤바가 생기지 않게 scene에 overflow: hidden 필수.',
    recommendations: [
      { place: '히어로 헤더', body: '에이전시·스튜디오 — 페이지가 통째로 움직이는 공간감으로 차별화' },
      { place: '랜딩 페이지', body: '몰입형 스토리텔링 랜딩 — 메뉴 열림도 내러티브 전환처럼' },
      { place: '제품 섹션', body: '앱 스타일 웹 대시보드 — 모바일 드로어 푸시 문법의 데스크톱 확장' },
      { place: '포트폴리오 소개', body: '3D·모션 지향 포트폴리오 — perspective 연출을 메뉴에서 먼저' }
    ],
    tradeoff: '페이지 전체를 transform하므로 position: fixed 자손이 기준을 잃는 부작용이 있다(fixed 헤더·플로팅 버튼이 페이지와 함께 밀림) — 구조 설계 단계에서 fixed 요소를 page-wrap 밖으로 빼야 한다. 긴 페이지 전체의 레이어 승격은 메모리 비용이 크다. 연출 강도가 높아 매 페이지 이동마다 보면 피로 — 체류가 긴 콘텐츠 사이트보다 단발 임팩트가 필요한 브랜드 사이트용.'
  }
];

// ============ 오버뷰 인덱스용 패턴 태그 ============

const PATTERN_TAGS = {
  'circle-expand': 'clip-path circle',
  'slide-panel': 'translateX panel + dim',
  'curtain-rows': 'scaleY 4-row stagger',
  'link-stagger': 'CSS var stagger',
  'split-columns': 'grid 2-col meet',
  'blur-glass': 'backdrop-filter',
  'burger-morph': '☰→✕ icon morph',
  'char-cascade': 'char mask stagger',
  'drawer-bottom': 'bottom sheet',
  'push-shift': 'push + perspective'
};

// ============ Standalone demo HTML 빌더 ============
//
// 공통 보일러플레이트:
//   - 미니 내비 바(브랜드) + 고정 ☰ 버튼(기본 ☰↔✕ 모핑, 패턴이 오버라이드 가능)
//   - 히어로 더미 페이지 (.scene > .page-wrap — drawer-bottom·push-shift가 변형)
//   - 토글 / ESC 닫힘 / body 스크롤 잠금 / 포커스 이동 / aria 동기화 JS
//   - 오버레이 공통 콘텐츠 스타일 (.ov-nav / .ov-link / .ov-meta / .ov-sns)
// 패턴은 demo.overlayHTML / overlayCSS / overlayJS만 주입한다.

function buildDemoHTML(p) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${p.num}. ${p.title} — Overlay Menu Demo</title>
  <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable-dynamic-subset.min.css" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body {
      background: #000; color: #fff;
      font-family: "Pretendard Variable", "Pretendard", -apple-system, system-ui, sans-serif;
      min-height: 100vh; overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }
    button { font: inherit; color: inherit; }
    a { -webkit-tap-highlight-color: transparent; }

    /* 데모 컨트롤 — 상단은 내비 바가 쓰므로 하단 좌측 */
    .demo-controls {
      position: fixed; bottom: 20px; left: 16px;
      display: inline-flex; align-items: center; gap: 10px;
      z-index: 100;
    }
    .demo-reset {
      font: 600 11px/1 ui-monospace, SFMono-Regular, Menlo, monospace;
      color: rgba(255,255,255,0.72);
      background: rgba(20,20,26,0.88);
      border: 1px solid rgba(255,255,255,0.16);
      border-radius: 999px;
      padding: 8px 14px; cursor: pointer;
      transition: color 160ms, background 160ms, border-color 160ms;
    }
    .demo-reset:hover { color: #fff; background: rgba(44,44,56,0.95); border-color: rgba(255,255,255,0.32); }
    .demo-label {
      font: 500 10px/1 ui-monospace, SFMono-Regular, Menlo, monospace;
      color: rgba(255,255,255,0.3);
      letter-spacing: 0.14em; text-transform: uppercase;
    }
    .demo-hint {
      position: fixed; right: 16px; bottom: 20px;
      font: 500 11px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace;
      color: rgba(255,255,255,0.5);
      letter-spacing: 0.04em;
      z-index: 100;
      background: rgba(20,20,26,0.88);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 999px;
      padding: 8px 14px;
      animation: hint-pulse 2.4s ease-in-out infinite;
    }
    body.menu-open .demo-hint { visibility: hidden; }
    @keyframes hint-pulse {
      0%, 100% { opacity: 0.6; transform: translateY(0); }
      50%       { opacity: 1; transform: translateY(-3px); }
    }

    /* 미니 사이트 더미 페이지 */
    .scene { min-height: 100vh; }
    .page-wrap { position: relative; min-height: 100vh; background: #000; }
    .site-nav {
      position: absolute; top: 0; left: 0; right: 0; z-index: 10;
      display: flex; align-items: center; height: 80px; padding: 0 88px 0 32px;
    }
    .nav-brand { font-size: 15px; font-weight: 800; letter-spacing: -0.01em; }
    .nav-brand i { font-style: normal; color: #8b5cf6; }
    .hero {
      position: relative; min-height: 100vh; overflow: hidden;
      display: flex; flex-direction: column; justify-content: center; gap: 18px;
      padding: 96px 8vw 72px;
    }
    .hero::before {
      content: ""; position: absolute; right: -120px; top: -80px;
      width: 440px; height: 440px; border-radius: 50%; pointer-events: none;
      background: radial-gradient(circle at 35% 35%, rgba(139,92,246,0.45), rgba(236,72,153,0.16) 58%, transparent 74%);
      filter: blur(6px);
    }
    .hero-eyebrow {
      font: 700 10px/1 ui-monospace, SFMono-Regular, Menlo, monospace;
      letter-spacing: 0.22em; color: #8b5cf6; text-transform: uppercase;
    }
    .hero-title { margin: 0; font-size: clamp(30px, 5vw, 48px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.18; }
    .hero-sub { margin: 0; max-width: 46ch; font-size: 14px; line-height: 1.75; color: rgba(255,255,255,0.55); }
    .hero-cards { display: flex; gap: 12px; margin-top: 16px; }
    .hero-cards div {
      width: 120px; height: 64px; border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.1);
      background: linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02));
    }

    /* ☰ 버튼 — 고정 44×44, 중심 (100% - 50px, 40px) = circle-expand 진원지 */
    .menu-btn {
      position: fixed; top: 18px; right: 28px; z-index: 60;
      width: 44px; height: 44px;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.14);
      border-radius: 999px; cursor: pointer;
      transition: background 160ms, border-color 160ms;
    }
    .menu-btn:hover { background: rgba(255,255,255,0.14); border-color: rgba(255,255,255,0.3); }
    .menu-btn:focus-visible { outline: 2px solid #8b5cf6; outline-offset: 3px; }
    .menu-btn .bar {
      display: block; width: 18px; height: 2px; border-radius: 1px; background: #fff;
      transition: transform 280ms cubic-bezier(0.76,0,0.24,1), opacity 200ms ease;
    }
    .menu-btn .bar + .bar { margin-top: 4px; }
    /* 기본 ☰ → ✕ 모핑 (burger-morph 패턴이 타이밍 분해로 오버라이드) */
    body.menu-open .bar1 { transform: translateY(6px) rotate(45deg); }
    body.menu-open .bar2 { opacity: 0; }
    body.menu-open .bar3 { transform: translateY(-6px) rotate(-45deg); }

    /* 오버레이 공통 베이스 — 연출은 패턴 CSS가 덧입힘 */
    .overlay {
      position: fixed; inset: 0; z-index: 40;
      overflow: hidden; visibility: hidden; pointer-events: none;
    }
    body.menu-open .overlay { pointer-events: auto; }
    .ov-nav { display: flex; flex-direction: column; align-items: flex-start; gap: 12px; }
    .ov-link {
      display: inline-flex; align-items: baseline; gap: 16px;
      text-decoration: none; color: #fff;
      font-size: clamp(30px, 5.2vw, 50px); font-weight: 800;
      letter-spacing: -0.025em; line-height: 1.15;
    }
    .ov-link:focus-visible { outline: 2px solid #8b5cf6; outline-offset: 6px; border-radius: 4px; }
    .ov-num {
      font: 600 11px/1 ui-monospace, SFMono-Regular, Menlo, monospace;
      color: rgba(139,92,246,0.9); letter-spacing: 0.12em;
    }
    .ov-txt { transition: color 180ms ease; }
    @media (hover: hover) { .ov-link:hover .ov-txt { color: #c4b5fd; } }
    .ov-meta { display: flex; align-items: flex-end; gap: 40px; }
    .ov-meta-col h5 {
      margin: 0 0 8px;
      font: 700 10px/1 ui-monospace, SFMono-Regular, Menlo, monospace;
      letter-spacing: 0.18em; color: rgba(255,255,255,0.35); text-transform: uppercase;
    }
    .ov-meta-col p { margin: 0; font-size: 13px; line-height: 1.65; color: rgba(255,255,255,0.6); }
    .ov-sns { margin-left: auto; display: flex; gap: 16px; }
    .ov-sns a {
      font-size: 12px; color: rgba(255,255,255,0.55); text-decoration: none;
      border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 2px;
    }

    /* 패턴별 연출 CSS */
    ${p.demo.overlayCSS.replace(/\n/g, '\n    ')}
  </style>
</head>
<body>
  <div class="scene">
    <div class="page-wrap">
      <header class="site-nav"><span class="nav-brand">스튜디오 모먼트<i>.</i></span></header>
      <main class="hero">
        <span class="hero-eyebrow">Fullscreen Overlay Menu</span>
        <h1 class="hero-title">메뉴 버튼 하나로<br>화면 전체가 무대가 된다</h1>
        <p class="hero-sub">우측 상단의 ☰ 버튼을 누르면 풀스크린 오버레이 메뉴가 열립니다. ESC 키 또는 ✕ 버튼으로 언제든 닫을 수 있고, 열려 있는 동안 페이지 스크롤은 잠깁니다.</p>
        <div class="hero-cards" aria-hidden="true"><div></div><div></div><div></div></div>
      </main>
    </div>
  </div>

  ${p.demo.overlayHTML}

  <button class="menu-btn" type="button" aria-expanded="false" aria-haspopup="dialog" aria-label="메뉴 열기">
    <span class="bar bar1"></span><span class="bar bar2"></span><span class="bar bar3"></span>
  </button>

  <div class="demo-controls">
    <button class="demo-reset" type="button" onclick="window.__reset && window.__reset()">↻ 다시 보기</button>
    <span class="demo-label">${p.num} · ${p.title}</span>
  </div>
  <div class="demo-hint">☰ 버튼을 눌러보세요</div>

  <script>
    (function(){
      var btn = document.querySelector(".menu-btn");
      var overlay = document.querySelector(".overlay");
      var hideTimer = null;

      function setOpen(open){
        var isOpen = document.body.classList.contains("menu-open");
        if (open === isOpen) return;
        document.body.classList.toggle("menu-open", open);
        document.body.style.overflow = open ? "hidden" : "";        /* 스크롤 잠금 */
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        btn.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
        overlay.setAttribute("aria-hidden", open ? "false" : "true");
        if (open) {
          clearTimeout(hideTimer);
          overlay.style.visibility = "visible";
          var first = overlay.querySelector(".ov-link");
          if (first) first.focus({ preventScroll: true });          /* 포커스 이동 */
        } else {
          /* 닫힘 연출(최대 ~730ms)이 끝난 뒤 비가시화 — 자동 재생 아님, 상태 정리 */
          hideTimer = setTimeout(function(){ overlay.style.visibility = "hidden"; }, 780);
          btn.focus({ preventScroll: true });
        }
      }
      window.__setOpen = setOpen;

      btn.addEventListener("click", function(){
        setOpen(!document.body.classList.contains("menu-open"));
      });
      document.addEventListener("keydown", function(e){
        if (e.key === "Escape") setOpen(false);
      });
      /* 데모 링크: 이동 대신 닫힘 시연 */
      overlay.querySelectorAll("a").forEach(function(a){
        a.addEventListener("click", function(e){
          e.preventDefault();
          if (a.classList.contains("ov-link")) setOpen(false);
        });
      });

      /* ↻ 다시 보기 = 메뉴 닫고 초기 상태 */
      window.__reset = function(){ setOpen(false); };

      /* 패턴별 JS */
      ${(p.demo.overlayJS || '').replace(/\n/g, '\n      ')}
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
      embed: 'demos/overlay-menu/' + p.id + '.html',
      embedHeight: p.demo.height || 520,
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
    tag: PATTERN_TAGS[p.id] || '',
    desc: p.summary
  }));

  return {
    title: '00. 카테고리 개요',
    blocks: [
      { type: 'heading', value: '풀스크린 오버레이 메뉴 — 패턴 카탈로그 v1' },
      { type: 'text', value: CATEGORY.summary },
      { type: 'heading', value: '10 패턴 인덱스' },
      { type: 'structure', items: indexItems },
      { type: 'heading', value: '공통 디자인 토큰 + 인터랙션 모델' },
      {
        type: 'kv', columns: 2, items: [
          { label: '폰트', value: 'Pretendard Variable (한글 본문 표준)' },
          { label: '배경', value: '페이지 #000 / 오버레이 #0b0b0f~#121216 — 명도 한 단계 분리' },
          { label: '오버레이 콘텐츠', value: '대형 링크 4개(작업·스튜디오·저널·연락처, clamp 30~50px) + 연락처·SNS 메타' },
          { label: '토글 모델', value: 'body.menu-open 클래스 하나로 전 연출 구동 — JS는 클래스·aria 토글만' },
          { label: '표준 이징', value: 'cubic-bezier(0.76,0,0.24,1) 480~640ms — 버튼 피드백은 linear.app 실측 0.1s cubic-bezier(0.25,0.46,0.45,0.94)' },
          { label: '접근성', value: 'aria-expanded·aria-haspopup·aria-hidden + ESC 닫힘 + 포커스 이동 + body 스크롤 잠금' }
        ]
      },
      { type: 'heading', value: '읽기 가이드' },
      {
        type: 'structure', items: [
          { label: '라이브 데모', tag: 'IFRAME', desc: 'demos/overlay-menu/{pattern}.html 의 standalone 페이지를 iframe으로 임베드. ☰ 버튼을 클릭하면 오버레이가 열리고 ESC·✕·딤 클릭으로 닫힘. ↻ 다시 보기는 메뉴를 닫고 초기화' },
          { label: '작동 원리', tag: 'HOW', desc: '한 줄 요약 + 1-2 문단으로 핵심 메커니즘 설명' },
          { label: '정량 메타', tag: 'KV', desc: '의존성 / 트리거 / 열림 시간 / 핵심 속성 / 접근성 / 시그니처 등 6항목' },
          { label: '코드 스니펫', tag: 'CODE', desc: 'HTML / CSS / JS 세 블록. 패턴별 핵심만(boilerplate 제외). 토글·ESC·스크롤 잠금·포커스 이동 접근성 패턴 포함' },
          { label: '사용 가이드', tag: 'GUIDE', desc: '어떻게 사용하나 — 타이밍·반응형·접근성·모션 감도' },
          { label: '활용 추천', tag: 'PLACES', desc: '히어로 헤더 / 랜딩 페이지 / 제품 섹션 / 포트폴리오 소개' },
          { label: '트레이드오프', tag: 'NOTE', desc: '성능·접근성·권장 사용처에 대한 한 줄 메모' }
        ]
      },
      {
        type: 'note',
        value: '참고 자료: Awwwards "Fullscreen Nav Menu" 인스피레이션 셀렉션 — Reform Digital (' + CATEGORY.url + ') + linear.app 실측(aria-expanded·aria-haspopup 토글, 버튼 transition 0.1s cubic-bezier(0.25,0.46,0.45,0.94)). 본 카탈로그는 단일 컴포넌트가 아닌 10가지 오버레이 열림 연출 비교 카탈로그를 지향한다. 모든 데모는 자동 재생 없이 사용자가 ☰ 버튼을 클릭할 때 오버레이가 열리고, ESC·✕ 토글·딤 클릭으로 닫히며, 열려 있는 동안 body 스크롤이 잠긴다.'
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
    console.log('✓ demos/overlay-menu/' + p.id + '.html');
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

  console.log('✓ analyses/overlay-menu/analysis.json');
  console.log('  ' + PATTERNS.length + ' patterns + 1 overview = ' + (PATTERNS.length + 1) + ' sections');
  const totalBlocks = Object.values(sections).reduce((acc, s) => acc + s.blocks.length, 0);
  console.log('  ' + totalBlocks + ' blocks total');
}

main();
