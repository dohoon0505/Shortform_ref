#!/usr/bin/env node
/**
 * Web Reference Lab — Category Generator: Nav bar dropdown (v1)
 *
 * Framer 마켓플레이스 "Aave Navigation Bar" (Inter 다크 톤, iframe 라이브 데모) 참고.
 * 10 종 네비게이션 드롭다운 패턴을 standalone HTML로 작성 후 iframe 임베드.
 *
 * - 자동 재생 없음. 사용자가 "Menu 2"에 호버해야 dropdown 열림.
 * - 검정 배경 + Pretendard Variable + 한국어 본문.
 * - 표준 nav: sticky 상단, 좌 brand + 5개 메뉴 + 우 CTA.
 * - 패턴은 dropdown 내부 HTML/CSS/JS만 다르고 nav 구조는 공통.
 *
 * Usage: node scripts/generate-nav-bar-dropdown.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ANALYSIS_DIR = join(ROOT, 'analyses', 'nav-bar-dropdown');
const ANALYSIS_FILE = join(ANALYSIS_DIR, 'analysis.json');
const DEMO_DIR = join(ROOT, 'demos', 'nav-bar-dropdown');

const CATEGORY = {
  id: 'nav-bar-dropdown',
  title: 'Nav bar dropdown',
  type: 'category',
  date: '2026-05-27',
  url: 'https://www.framer.com/marketplace/components/aave-navigation-bar/',
  summary: '상단 네비게이션 바에 호버·클릭으로 펼쳐지는 드롭다운 패널의 패턴 컬렉션. Framer 마켓플레이스 "Aave Navigation Bar" 컴포넌트(다크 + Inter + 2-column 메가 메뉴)를 참고로, 단순 리스트부터 메가 메뉴·아이콘 리스트·다중 컬럼·카드 그리드·hover 프리뷰·슬라이드 진입·검색 통합·캐스케이드 서브메뉴·CTA 배너까지 10가지 시그니처 dropdown 변형을 정리. 각 패턴은 standalone HTML로 작성되어 iframe으로 임베드되며, 사용자가 "Menu 2"에 호버할 때 dropdown이 열리는 인터랙티브 데모.'
};

// ============ 10 패턴 정의 ============
//
// 각 패턴은 demos/nav-bar-dropdown/{id}.html에 standalone 페이지로 작성.
// 공통 보일러플레이트 (sticky nav + Menu 1·2·3 + CTA)는 buildDemoHTML이 wrap.
// 각 패턴은:
//   - demo.dropdownHTML — Menu 2의 dropdown 내부 마크업
//   - demo.dropdownCSS  — dropdown 패턴 CSS
//   - demo.dropdownJS   — 인터랙션 JS (옵션, hover 트리거는 기본 제공)
//   - demo.height       — iframe 임베드 높이 (mega-menu/large 패턴은 560+)
//   - demo.menuLabel    — Menu 2의 라벨 (예: "제품")

const PATTERNS = [
  // ───────────────────────────── 1. mega-menu (Aave 스타일)
  {
    id: 'mega-menu',
    num: '01',
    title: '메가 메뉴 (Aave 스타일)',
    summary: '2-column 큰 패널 — 좌측 아이콘+제목+설명의 리스트, 우측 비주얼 영역. Aave·Stripe·Linear의 시그니처 dropdown. 첫 항목이 기본 활성으로 우측 프리뷰가 즉시 보임.',
    demo: {
      menuLabel: '서비스',
      dropdownHTML: '<div class="dd-mega">\n  <div class="dd-list">\n    <a class="dd-item is-on" data-vid="a"><span class="dd-icon dd-icon-blue"></span><div class="dd-meta"><h4>블로그</h4><p>최신 소식과 업데이트</p></div></a>\n    <a class="dd-item" data-vid="b"><span class="dd-icon"></span><div class="dd-meta"><h4>브랜드</h4><p>로고와 사용 가이드라인</p></div></a>\n    <a class="dd-item" data-vid="c"><span class="dd-icon"></span><div class="dd-meta"><h4>FAQ</h4><p>자주 묻는 질문에 대한 답</p></div></a>\n    <a class="dd-item" data-vid="d"><span class="dd-icon"></span><div class="dd-meta"><h4>도움말</h4><p>가이드와 문서, 그리고 더 많은</p></div></a>\n    <a class="dd-item" data-vid="e"><span class="dd-icon"></span><div class="dd-meta"><h4>거버넌스</h4><p>커뮤니티 거버넌스 포럼</p></div></a>\n  </div>\n  <div class="dd-visual"><span class="dd-visual-label">VISUAL</span></div>\n</div>',
      dropdownCSS: '.dd-mega { display: grid; grid-template-columns: 1.3fr 1fr; gap: 12px; padding: 12px; min-width: 720px; }\n.dd-list { display: flex; flex-direction: column; gap: 2px; }\n.dd-item { display: flex; align-items: center; gap: 14px; padding: 12px 14px; border-radius: 12px; text-decoration: none; color: #171717; transition: background 160ms; cursor: pointer; }\n.dd-item:hover, .dd-item.is-on { background: #f4f4f5; }\n.dd-icon { width: 40px; height: 40px; border-radius: 8px; background: #d4d4d8; flex-shrink: 0; }\n.dd-icon-blue { background: #3b82f6; }\n.dd-meta h4 { font: 600 14px/1.2 inherit; margin: 0 0 3px; }\n.dd-meta p { font: 400 13px/1.4 inherit; margin: 0; color: #71717a; }\n.dd-visual { background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%); border-radius: 14px; min-height: 320px; display: flex; align-items: center; justify-content: center; }\n.dd-visual-label { font: 700 13px/1 ui-monospace, monospace; color: rgba(255,255,255,0.55); letter-spacing: 0.18em; }',
      dropdownJS: 'document.querySelectorAll(".dd-item").forEach(function(el){ el.addEventListener("mouseenter", function(){ document.querySelectorAll(".dd-item").forEach(function(x){ x.classList.remove("is-on"); }); el.classList.add("is-on"); }); el.addEventListener("click", function(e){ e.preventDefault(); }); });',
      height: 560
    },
    snippetHTML: '<li class="has-dropdown">\n  <a class="trigger">서비스</a>\n  <div class="dropdown">\n    <div class="dd-mega">\n      <div class="dd-list">\n        <a class="dd-item"><span class="dd-icon"></span><div><h4>블로그</h4><p>최신 소식</p></div></a>\n        ...\n      </div>\n      <div class="dd-visual"></div>\n    </div>\n  </div>\n</li>',
    snippetCSS: '.dd-mega { display: grid; grid-template-columns: 1.3fr 1fr; gap: 12px; padding: 12px; min-width: 720px; }\n.dd-item { display: flex; align-items: center; gap: 14px; padding: 12px 14px; border-radius: 12px; transition: background 160ms; }\n.dd-item:hover { background: #f4f4f5; }\n.dd-visual { background: linear-gradient(135deg, #3b82f6, #60a5fa); border-radius: 14px; min-height: 320px; }',
    snippetJS: 'var trigger = document.querySelector(".has-dropdown");\ntrigger.addEventListener("mouseenter", function(){ trigger.classList.add("open"); });\ntrigger.addEventListener("mouseleave", function(){ trigger.classList.remove("open"); });',
    explain: '2-column 그리드 구조가 핵심. 좌측은 아이콘 + 제목 + 한 줄 설명의 리스트, 우측은 visual area(이미지/그라데이션/광고). 한 항목 호버 시 우측 visual이 그 항목에 맞게 바뀌도록 JS로 swap 가능. Aave·Stripe·Linear 같은 SaaS 헤더가 채택하는 가장 시그니처적인 dropdown.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (CSS hover만으로도 가능)' },
      { label: '트리거', value: 'Menu 2 mouseenter / mouseleave' },
      { label: '레이아웃', value: '1.3fr 1fr grid (min-width 720px)' },
      { label: '항목 수', value: '5개 + visual area 1개' },
      { label: '리빌 시간', value: '180ms ease-out (CSS transition)' },
      { label: '시그니처', value: 'Aave / Stripe / Linear / Notion' }
    ],
    guide: '항목이 5개 안팎(3~7개)일 때 가장 자연스럽다. 우측 visual은 이미지·일러스트·그라데이션 어느 것이든 OK이지만 항목 hover에 따라 swap되도록 만들면 깊이가 생긴다. dropdown 폭 720~960px 권장. 모바일에서는 드로어로 fallback 권장.',
    recommendations: [
      { place: '히어로 헤더', body: 'SaaS·랜딩 페이지 상단 GNB의 "제품 / 솔루션" 메뉴에서 시그니처로. Hero 스크롤 전에 핵심 가치 제안을 노출' },
      { place: '랜딩 페이지', body: '서비스 소개 페이지의 메인 nav. 사용 사례·기능·고객 사례 3-5가지를 한 번에 보여줌' },
      { place: '제품 섹션', body: '제품 라인업이 다양한 e-commerce의 카테고리 메뉴. 아이콘+이미지로 빠른 발견' },
      { place: '포트폴리오 소개', body: '디자이너 포트폴리오 사이트의 "Works" 메뉴. 프로젝트 카테고리 + 대표 이미지를 동시에' }
    ],
    tradeoff: 'dropdown 폭이 넓어 모바일에서 그대로 쓸 수 없음 → 작은 화면에서는 dropdown 자체를 풀스크린 drawer로 교체. 항목이 너무 많으면(>8개) 정보 과부하 — multi-column 패턴으로 분리 권장.'
  },

  // ───────────────────────────── 2. simple-list
  {
    id: 'simple-list',
    num: '02',
    title: '단순 수직 리스트',
    summary: '가장 클래식한 dropdown — 5~8개의 텍스트 링크가 수직으로 정렬. Apple·Microsoft 최상단 GNB의 보조 메뉴에 적합.',
    demo: {
      menuLabel: '문서',
      dropdownHTML: '<div class="dd-simple">\n  <a href="#" class="dd-link">시작 가이드</a>\n  <a href="#" class="dd-link">API 레퍼런스</a>\n  <a href="#" class="dd-link">컴포넌트 라이브러리</a>\n  <a href="#" class="dd-link">변경 사항</a>\n  <a href="#" class="dd-link">자주 묻는 질문</a>\n</div>',
      dropdownCSS: '.dd-simple { display: flex; flex-direction: column; padding: 8px; min-width: 220px; }\n.dd-link { display: block; padding: 10px 14px; font: 500 14px/1.4 inherit; color: #171717; text-decoration: none; border-radius: 8px; transition: background 140ms, color 140ms; }\n.dd-link:hover { background: #f4f4f5; color: #000; }',
      dropdownJS: '',
      height: 440
    },
    snippetHTML: '<div class="dropdown">\n  <a class="dd-link">시작 가이드</a>\n  <a class="dd-link">API 레퍼런스</a>\n  <a class="dd-link">FAQ</a>\n</div>',
    snippetCSS: '.dd-simple { display: flex; flex-direction: column; padding: 8px; min-width: 220px; }\n.dd-link { padding: 10px 14px; border-radius: 8px; transition: background 140ms; }\n.dd-link:hover { background: #f4f4f5; }',
    snippetJS: 'var trigger = document.querySelector(".has-dropdown");\ntrigger.addEventListener("mouseenter", function(){ trigger.classList.add("open"); });\ntrigger.addEventListener("mouseleave", function(){ trigger.classList.remove("open"); });',
    explain: '가장 보편적인 dropdown. 단순 수직 리스트라 어디에나 안전. 항목당 패딩 10px+14px, 라벨 14px·weight 500, 호버 시 배경 회색. dropdown 폭 220px 권장. CSS만으로도 동작하지만 접근성을 위해 키보드 포커스도 처리.',
    kv: [
      { label: '의존성', value: 'CSS only (JS는 hover wiring만)' },
      { label: '트리거', value: 'Menu 2 mouseenter / mouseleave' },
      { label: '레이아웃', value: '단일 컬럼 220px' },
      { label: '항목 수', value: '4~8개 권장' },
      { label: '항목 패딩', value: '10px 14px' },
      { label: '시그니처', value: 'Apple / Microsoft / Vercel 보조' }
    ],
    guide: '단순함이 최대 장점. 5~7개 항목이 적정. 너무 많으면(10+) 사용자가 끝까지 안 봄. dropdown 폭은 가장 긴 항목 라벨 + 좌우 패딩에 맞춰 220~280px. 호버 외에 클릭으로도 열고 닫을 수 있게 하는 게 접근성에 좋음. 모바일은 그대로 사용 가능.',
    recommendations: [
      { place: '히어로 헤더', body: 'GNB의 "회사 / 더보기" 같은 보조 메뉴에 적합 — 단순하고 안전' },
      { place: '랜딩 페이지', body: '로그인 후 사용자 메뉴, 언어 선택, 계정 메뉴 등' },
      { place: '제품 섹션', body: '제품 변형 선택(Small/Medium/Large), 카테고리 필터 등' },
      { place: '포트폴리오 소개', body: '연도별 작업 분류, 카테고리 필터, About / Contact 보조' }
    ],
    tradeoff: '단순함이 강점이자 약점 — 인상이 약하다. 시각적 깊이가 필요한 컨텍스트(메인 GNB)에는 다른 패턴을 고려.'
  },

  // ───────────────────────────── 3. icon-list (Linear 스타일)
  {
    id: 'icon-list',
    num: '03',
    title: '아이콘 리스트 (Linear 스타일)',
    summary: '각 항목에 아이콘 + 제목 + 한 줄 설명. Linear·Vercel·GitHub의 "Products" 메뉴 스타일. 정보 밀도와 시각 균형이 좋아 SaaS GNB의 표준.',
    demo: {
      menuLabel: '제품',
      dropdownHTML: '<div class="dd-icons">\n  <a class="dd-row"><span class="dd-ico" style="background:#22c55e"></span><div><h4>이슈 추적</h4><p>버그·태스크를 한 곳에서 관리</p></div></a>\n  <a class="dd-row"><span class="dd-ico" style="background:#a855f7"></span><div><h4>프로젝트</h4><p>로드맵과 마일스톤을 시각화</p></div></a>\n  <a class="dd-row"><span class="dd-ico" style="background:#f97316"></span><div><h4>스프린트 사이클</h4><p>2주 단위 반복 작업 관리</p></div></a>\n  <a class="dd-row"><span class="dd-ico" style="background:#3b82f6"></span><div><h4>인사이트</h4><p>팀 생산성 분석과 리포트</p></div></a>\n  <a class="dd-row"><span class="dd-ico" style="background:#ec4899"></span><div><h4>고객의 소리</h4><p>피드백을 제품 결정으로 연결</p></div></a>\n</div>',
      dropdownCSS: '.dd-icons { display: flex; flex-direction: column; gap: 2px; padding: 10px; min-width: 360px; }\n.dd-row { display: flex; align-items: center; gap: 14px; padding: 11px 14px; text-decoration: none; color: #171717; border-radius: 10px; transition: background 140ms; cursor: pointer; }\n.dd-row:hover { background: #f4f4f5; }\n.dd-ico { width: 36px; height: 36px; border-radius: 8px; flex-shrink: 0; box-shadow: inset 0 -2px 0 rgba(0,0,0,0.08); }\n.dd-row h4 { font: 600 14px/1.2 inherit; margin: 0 0 2px; }\n.dd-row p { font: 400 13px/1.4 inherit; margin: 0; color: #71717a; }',
      dropdownJS: '',
      height: 500
    },
    snippetHTML: '<div class="dd-icons">\n  <a class="dd-row">\n    <span class="dd-ico"></span>\n    <div><h4>이슈 추적</h4><p>버그·태스크 관리</p></div>\n  </a>\n  ...\n</div>',
    snippetCSS: '.dd-icons { display: flex; flex-direction: column; gap: 2px; padding: 10px; min-width: 360px; }\n.dd-row { display: flex; align-items: center; gap: 14px; padding: 11px 14px; border-radius: 10px; }\n.dd-row:hover { background: #f4f4f5; }\n.dd-ico { width: 36px; height: 36px; border-radius: 8px; }',
    snippetJS: '/* CSS only — JS는 hover 트리거만 */',
    explain: 'mega-menu와 simple-list의 중간. 아이콘으로 시각 식별성을 더하고, 한 줄 설명으로 항목의 가치를 명확히 전달. dropdown 폭 360~440px이 균형점. 아이콘 색을 항목별로 다르게 두면 빠른 스캔 가능.',
    kv: [
      { label: '의존성', value: 'CSS only (JS는 hover 트리거만)' },
      { label: '트리거', value: 'Menu 2 mouseenter / mouseleave' },
      { label: '레이아웃', value: '단일 컬럼 360~440px' },
      { label: '항목 수', value: '4~6개 권장' },
      { label: '아이콘 크기', value: '36×36 + 라운드 8px' },
      { label: '시그니처', value: 'Linear / Vercel / GitHub / Notion' }
    ],
    guide: '아이콘 + 제목 + 설명의 3-part 구조가 핵심. 설명은 한 줄(40자 이내)로 짧게. 아이콘은 동일 시각 시스템(둥근 모서리·동일 사이즈) 유지. SaaS 제품 카테고리 안내에 가장 잘 어울림.',
    recommendations: [
      { place: '히어로 헤더', body: 'SaaS 제품 카테고리("Products" 메뉴) — 가치 제안을 한 줄로 빠르게' },
      { place: '랜딩 페이지', body: '"솔루션 by 사용 사례" 같은 분류. 항목마다 컨텍스트가 명확' },
      { place: '제품 섹션', body: '제품군 분류 — 아이콘 색으로 카테고리 구분' },
      { place: '포트폴리오 소개', body: '"Works by Category" — 작업 유형(브랜딩/웹/모션)을 아이콘+설명으로' }
    ],
    tradeoff: '아이콘 디자인 비용 발생. 일관성 없는 아이콘은 오히려 산만함. 아이콘 라이브러리(Lucide·Heroicons) 활용 권장.'
  },

  // ───────────────────────────── 4. multi-column
  {
    id: 'multi-column',
    num: '04',
    title: '다중 컬럼 (AWS 스타일)',
    summary: '3~4개 컬럼에 카테고리별 링크를 그룹화. AWS·Microsoft·Adobe처럼 항목 수가 많을 때(15+) 정보 과부하를 막는다.',
    demo: {
      menuLabel: '솔루션',
      dropdownHTML: '<div class="dd-cols">\n  <div class="dd-col">\n    <h5>제품</h5>\n    <a href="#">컴퓨팅</a>\n    <a href="#">스토리지</a>\n    <a href="#">데이터베이스</a>\n    <a href="#">네트워킹</a>\n  </div>\n  <div class="dd-col">\n    <h5>솔루션</h5>\n    <a href="#">웹·모바일 앱</a>\n    <a href="#">데이터 분석</a>\n    <a href="#">머신러닝</a>\n    <a href="#">IoT</a>\n  </div>\n  <div class="dd-col">\n    <h5>리소스</h5>\n    <a href="#">문서</a>\n    <a href="#">튜토리얼</a>\n    <a href="#">사례 연구</a>\n    <a href="#">백서</a>\n  </div>\n  <div class="dd-col">\n    <h5>지원</h5>\n    <a href="#">기술 지원</a>\n    <a href="#">교육</a>\n    <a href="#">커뮤니티</a>\n    <a href="#">파트너</a>\n  </div>\n</div>',
      dropdownCSS: '.dd-cols { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; padding: 18px 22px; min-width: 760px; }\n.dd-col { display: flex; flex-direction: column; gap: 4px; }\n.dd-col h5 { font: 700 11px/1 inherit; color: #71717a; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 8px; padding: 0 6px; }\n.dd-col a { padding: 6px; font: 500 13.5px/1.4 inherit; color: #171717; text-decoration: none; border-radius: 6px; transition: background 140ms, color 140ms; }\n.dd-col a:hover { background: #f4f4f5; color: #000; }',
      dropdownJS: '',
      height: 480
    },
    snippetHTML: '<div class="dd-cols">\n  <div class="dd-col">\n    <h5>제품</h5>\n    <a>컴퓨팅</a><a>스토리지</a>\n  </div>\n  <div class="dd-col">\n    <h5>솔루션</h5>\n    ...\n  </div>\n</div>',
    snippetCSS: '.dd-cols { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; padding: 18px 22px; min-width: 760px; }\n.dd-col h5 { color: #71717a; letter-spacing: 0.1em; text-transform: uppercase; }\n.dd-col a { display: block; padding: 6px; border-radius: 6px; }\n.dd-col a:hover { background: #f4f4f5; }',
    snippetJS: '/* CSS only */',
    explain: '컬럼별 카테고리 헤더(h5, uppercase + tracking)와 그 아래 링크 4~6개로 구성. 항목 수가 많을 때(>12) 한 컬럼에 다 넣으면 스캔이 어려우므로 카테고리로 묶어 컬럼화. AWS·Adobe 메뉴의 클래식 패턴.',
    kv: [
      { label: '의존성', value: 'CSS only (JS는 hover 트리거만)' },
      { label: '트리거', value: 'Menu 2 mouseenter / mouseleave' },
      { label: '레이아웃', value: '4 컬럼 grid (min-width 760px)' },
      { label: '컬럼당 항목', value: '4~6개' },
      { label: '카테고리 헤더', value: '11px UPPERCASE + 0.1em tracking' },
      { label: '시그니처', value: 'AWS / Adobe / Microsoft / Salesforce' }
    ],
    guide: '컬럼 헤더(h5)는 대문자 + tracking으로 카테고리 라벨처럼 보이게. 컬럼 폭은 동일하게(repeat(4, 1fr)). 컬럼 간 gap은 16~24px. 항목이 컬럼당 5개를 넘으면 다른 카테고리로 묶거나 컬럼을 더 늘림(5컬럼). 모바일은 accordion으로 fallback.',
    recommendations: [
      { place: '히어로 헤더', body: '대기업·엔터프라이즈 SaaS의 GNB — 제품·솔루션·리소스·지원의 4-pillar 메뉴' },
      { place: '랜딩 페이지', body: '"Solutions by Industry / Role / Size" 같은 다축 분류' },
      { place: '제품 섹션', body: '큰 제품 카탈로그(15+ 제품) — 카테고리로 정렬해 발견 개선' },
      { place: '포트폴리오 소개', body: '경력이 길고 다양한 디자이너의 "Works by Year / Type" 정렬' }
    ],
    tradeoff: '폭이 760px 이상으로 넓어 모바일·태블릿에서 부적합 → drawer/accordion fallback 필수. 작은 비즈니스에서는 항목 수가 적어 컬럼 분할이 어색할 수 있음.'
  },

  // ───────────────────────────── 5. card-grid
  {
    id: 'card-grid',
    num: '05',
    title: '카드 그리드',
    summary: '각 항목을 카드(이미지·아이콘 + 제목 + 설명)로 표현해 그리드 배치. 제품 카테고리·기능 소개에 적합. 시각적 임팩트가 크지만 클릭 비용도 높음.',
    demo: {
      menuLabel: '제품',
      dropdownHTML: '<div class="dd-cards">\n  <a class="dd-card"><div class="dd-cardimg dd-card-a"></div><h4>아날리틱스</h4><p>실시간 사용자 행동 분석</p></a>\n  <a class="dd-card"><div class="dd-cardimg dd-card-b"></div><h4>마케팅 자동화</h4><p>고객 여정을 자동으로</p></a>\n  <a class="dd-card"><div class="dd-cardimg dd-card-c"></div><h4>이메일 캠페인</h4><p>세그먼트 기반 발송</p></a>\n  <a class="dd-card"><div class="dd-cardimg dd-card-d"></div><h4>고객 데이터</h4><p>CDP를 한 곳에서 통합</p></a>\n  <a class="dd-card"><div class="dd-cardimg dd-card-e"></div><h4>A/B 테스트</h4><p>실험을 통한 의사결정</p></a>\n  <a class="dd-card"><div class="dd-cardimg dd-card-f"></div><h4>리포팅</h4><p>대시보드와 인사이트</p></a>\n</div>',
      dropdownCSS: '.dd-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding: 16px; min-width: 720px; }\n.dd-card { display: block; padding: 14px; border-radius: 12px; background: #f9f9f9; text-decoration: none; color: #171717; transition: background 160ms, transform 160ms; }\n.dd-card:hover { background: #f4f4f5; transform: translateY(-2px); }\n.dd-cardimg { width: 100%; height: 88px; border-radius: 8px; margin-bottom: 12px; }\n.dd-card-a { background: linear-gradient(135deg, #3b82f6, #60a5fa); }\n.dd-card-b { background: linear-gradient(135deg, #22c55e, #4ade80); }\n.dd-card-c { background: linear-gradient(135deg, #f97316, #fb923c); }\n.dd-card-d { background: linear-gradient(135deg, #a855f7, #c084fc); }\n.dd-card-e { background: linear-gradient(135deg, #ec4899, #f472b6); }\n.dd-card-f { background: linear-gradient(135deg, #14b8a6, #2dd4bf); }\n.dd-card h4 { font: 600 14px/1.2 inherit; margin: 0 0 4px; }\n.dd-card p { font: 400 12.5px/1.4 inherit; margin: 0; color: #71717a; }',
      dropdownJS: '',
      height: 560
    },
    snippetHTML: '<div class="dd-cards">\n  <a class="dd-card">\n    <div class="dd-cardimg"></div>\n    <h4>아날리틱스</h4>\n    <p>실시간 분석</p>\n  </a>\n  ...\n</div>',
    snippetCSS: '.dd-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding: 16px; min-width: 720px; }\n.dd-card { padding: 14px; border-radius: 12px; background: #f9f9f9; transition: background 160ms, transform 160ms; }\n.dd-card:hover { background: #f4f4f5; transform: translateY(-2px); }\n.dd-cardimg { width: 100%; height: 88px; border-radius: 8px; margin-bottom: 12px; }',
    snippetJS: '/* CSS only */',
    explain: '제품·기능 카테고리를 카드로 표현. 카드는 이미지/그라데이션 영역 + 제목 + 한 줄 설명. 3 컬럼 그리드가 균형점 (4 컬럼은 카드가 작아짐). 호버 시 -2px lift로 인터랙티브함을 강조. 이미지가 없으면 그라데이션으로 대체.',
    kv: [
      { label: '의존성', value: 'CSS only (JS는 hover 트리거만)' },
      { label: '트리거', value: 'Menu 2 mouseenter / mouseleave' },
      { label: '레이아웃', value: '3 컬럼 grid (min-width 720px)' },
      { label: '카드 수', value: '6개 권장 (3×2 또는 4×2)' },
      { label: '이미지 영역', value: '88px height + radius 8px' },
      { label: '시그니처', value: 'Webflow / Figma / Spotify' }
    ],
    guide: '카드 6개가 시각적으로 가장 균형. 9개(3×3)도 가능하지만 dropdown이 매우 커진다. 이미지·그라데이션은 항목별로 색을 다르게 두면 빠른 식별 가능. 호버 시 -2px lift + 그림자로 클릭 가능성 강조.',
    recommendations: [
      { place: '히어로 헤더', body: 'e-commerce·콘텐츠 사이트의 카테고리 메뉴 — 시각으로 빠른 발견' },
      { place: '랜딩 페이지', body: '제품 카테고리 ("Shop by Category") — 카드로 매력 노출' },
      { place: '제품 섹션', body: '솔루션 카탈로그 — 각 솔루션을 이미지+제목+설명으로' },
      { place: '포트폴리오 소개', body: '작품 카테고리(브랜딩/웹/모션) — 대표 작품 썸네일이 카드 이미지' }
    ],
    tradeoff: '이미지 디자인·로드 비용. 카드가 6개 이상이면 dropdown 폭이 720px+ 필요. 모바일에서 그대로 사용 불가 → drawer 또는 풀스크린 fallback. 그라데이션만으로 카드를 채우면 패턴이 단조로워질 수 있어 일부에는 실제 이미지 권장.'
  },

  // ───────────────────────────── 6. hover-preview
  {
    id: 'hover-preview',
    num: '06',
    title: 'hover 프리뷰',
    summary: '좌측 항목 리스트 + 우측 항목 hover 시 동적으로 바뀌는 프리뷰 영역. Stripe Docs·Apple Pro Display의 시그니처. 결정적 인터랙티브함.',
    demo: {
      menuLabel: '문서',
      dropdownHTML: '<div class="dd-hp">\n  <div class="dd-hp-list">\n    <a class="dd-hp-item is-on" data-pv="api"><h4>API 레퍼런스</h4><p>전체 엔드포인트</p></a>\n    <a class="dd-hp-item" data-pv="webhook"><h4>웹훅</h4><p>실시간 이벤트 전송</p></a>\n    <a class="dd-hp-item" data-pv="sdk"><h4>SDK</h4><p>Node·Python·Go</p></a>\n    <a class="dd-hp-item" data-pv="guide"><h4>가이드</h4><p>30분 시작 가이드</p></a>\n  </div>\n  <div class="dd-hp-preview">\n    <div class="dd-pv is-on" data-pv="api"><h3>API 레퍼런스</h3><p>200+ 엔드포인트와 예제 코드</p><div class="dd-pv-tag">REST · GraphQL</div></div>\n    <div class="dd-pv" data-pv="webhook"><h3>웹훅</h3><p>이벤트가 발생하면 즉시 알림</p><div class="dd-pv-tag">Real-time</div></div>\n    <div class="dd-pv" data-pv="sdk"><h3>공식 SDK</h3><p>주요 언어를 모두 지원</p><div class="dd-pv-tag">Node · Python · Go</div></div>\n    <div class="dd-pv" data-pv="guide"><h3>30분 시작 가이드</h3><p>첫 결제 통합까지 30분</p><div class="dd-pv-tag">Tutorial</div></div>\n  </div>\n</div>',
      dropdownCSS: '.dd-hp { display: grid; grid-template-columns: 220px 1fr; gap: 8px; padding: 10px; min-width: 600px; }\n.dd-hp-list { display: flex; flex-direction: column; gap: 2px; }\n.dd-hp-item { padding: 10px 12px; border-radius: 8px; text-decoration: none; color: #171717; cursor: pointer; transition: background 140ms; }\n.dd-hp-item:hover, .dd-hp-item.is-on { background: #f4f4f5; }\n.dd-hp-item h4 { font: 600 13.5px/1.2 inherit; margin: 0 0 2px; }\n.dd-hp-item p { font: 400 12px/1.3 inherit; margin: 0; color: #71717a; }\n.dd-hp-preview { position: relative; background: linear-gradient(135deg, #fafafa, #f4f4f5); border-radius: 12px; padding: 24px; min-height: 220px; overflow: hidden; }\n.dd-pv { position: absolute; inset: 24px; opacity: 0; transition: opacity 220ms; pointer-events: none; }\n.dd-pv.is-on { opacity: 1; }\n.dd-pv h3 { font: 700 18px/1.2 inherit; margin: 0 0 8px; color: #171717; }\n.dd-pv p { font: 400 14px/1.4 inherit; margin: 0 0 16px; color: #525252; }\n.dd-pv-tag { display: inline-block; font: 600 11px/1 ui-monospace, monospace; color: #525252; background: rgba(0,0,0,0.06); padding: 6px 10px; border-radius: 999px; letter-spacing: 0.04em; }',
      dropdownJS: 'document.querySelectorAll(".dd-hp-item").forEach(function(item){\n  item.addEventListener("mouseenter", function(){\n    var pv = item.dataset.pv;\n    document.querySelectorAll(".dd-hp-item").forEach(function(x){ x.classList.toggle("is-on", x.dataset.pv === pv); });\n    document.querySelectorAll(".dd-pv").forEach(function(x){ x.classList.toggle("is-on", x.dataset.pv === pv); });\n  });\n});',
      height: 480
    },
    snippetHTML: '<div class="dd-hp">\n  <div class="dd-hp-list">\n    <a class="dd-hp-item" data-pv="api">API</a>\n    <a class="dd-hp-item" data-pv="webhook">웹훅</a>\n  </div>\n  <div class="dd-hp-preview">\n    <div class="dd-pv" data-pv="api">API 설명</div>\n    <div class="dd-pv" data-pv="webhook">웹훅 설명</div>\n  </div>\n</div>',
    snippetCSS: '.dd-hp { display: grid; grid-template-columns: 220px 1fr; gap: 8px; min-width: 600px; }\n.dd-hp-item:hover, .dd-hp-item.is-on { background: #f4f4f5; }\n.dd-hp-preview { position: relative; min-height: 220px; }\n.dd-pv { position: absolute; inset: 24px; opacity: 0; transition: opacity 220ms; }\n.dd-pv.is-on { opacity: 1; }',
    snippetJS: 'document.querySelectorAll(".dd-hp-item").forEach(function(item){\n  item.addEventListener("mouseenter", function(){\n    var pv = item.dataset.pv;\n    document.querySelectorAll(".dd-hp-item").forEach(function(x){ x.classList.toggle("is-on", x.dataset.pv === pv); });\n    document.querySelectorAll(".dd-pv").forEach(function(x){ x.classList.toggle("is-on", x.dataset.pv === pv); });\n  });\n});',
    explain: '좌측 항목 리스트 + 우측 프리뷰 영역. 항목 hover 시 data-pv 일치하는 프리뷰만 opacity 1로. 모든 프리뷰는 absolute로 같은 자리에 쌓여있고 fade-in/out으로 swap. mega-menu의 진보된 버전. 우측 영역에 더 풍부한 정보(이미지·태그·CTA) 표현 가능.',
    kv: [
      { label: '의존성', value: 'Vanilla JS' },
      { label: '트리거', value: '항목 mouseenter (data-pv attribute)' },
      { label: '레이아웃', value: '220px + 1fr grid' },
      { label: '프리뷰 swap', value: 'opacity 0↔1, 220ms transition' },
      { label: '항목 수', value: '4~6개 권장' },
      { label: '시그니처', value: 'Stripe Docs / Apple Pro Display / Vercel' }
    ],
    guide: '좌측 항목과 우측 프리뷰가 1:1 매핑. 항목 hover 즉시 프리뷰 swap (220ms fade). 우측 영역은 220px 이상 height로 충분히 보이도록. 프리뷰는 이미지·일러스트·코드·통계 어느 것이든 OK. 항목 4~6개가 균형, 너무 많으면(8+) 사용자가 프리뷰를 다 못 봄.',
    recommendations: [
      { place: '히어로 헤더', body: '개발자 도구·SaaS의 "Docs" 메뉴 — 항목별 다른 컨텍스트를 우측에서 즉시 보여줌' },
      { place: '랜딩 페이지', body: '"기능별 상세" 메뉴 — 각 기능을 이미지+설명으로 미리보기' },
      { place: '제품 섹션', body: '제품 변형 선택 — 모델별 이미지·스펙·가격을 우측에서 즉시 확인' },
      { place: '포트폴리오 소개', body: '"Selected Works" — 작품 제목 위에 호버하면 우측에 썸네일' }
    ],
    tradeoff: 'JS 의존. 항목과 프리뷰의 1:1 매핑 관리 비용. 모바일에서는 hover가 없어 우측 영역 swap이 의미 없음 → 모바일에서는 클릭/탭으로 전환 또는 다른 패턴으로 fallback.'
  },

  // ───────────────────────────── 7. animated-slide
  {
    id: 'animated-slide',
    num: '07',
    title: '슬라이드 진입',
    summary: 'dropdown이 열릴 때 항목들이 stagger delay로 위에서 슬라이드 + 페이드. Vercel·Framer 자체 GNB의 우아한 진입.',
    demo: {
      menuLabel: '리소스',
      dropdownHTML: '<div class="dd-slide">\n  <a class="dd-li">기능 소개</a>\n  <a class="dd-li">고객 사례</a>\n  <a class="dd-li">템플릿 갤러리</a>\n  <a class="dd-li">변경 사항</a>\n  <a class="dd-li">개발자 문서</a>\n  <a class="dd-li">커뮤니티 포럼</a>\n</div>',
      dropdownCSS: '.dd-slide { display: flex; flex-direction: column; padding: 10px; min-width: 240px; }\n.dd-li { padding: 10px 14px; font: 500 14px/1.4 inherit; color: #171717; text-decoration: none; border-radius: 8px; opacity: 0; transform: translateY(-6px); transition: opacity 320ms cubic-bezier(0.2,0,0,1), transform 320ms cubic-bezier(0.2,0,0,1), background 140ms; }\n.dd-li:hover { background: #f4f4f5; }\n.has-dropdown.is-open .dd-li { opacity: 1; transform: translateY(0); }\n.has-dropdown.is-open .dd-li:nth-child(1) { transition-delay: 0ms; }\n.has-dropdown.is-open .dd-li:nth-child(2) { transition-delay: 50ms; }\n.has-dropdown.is-open .dd-li:nth-child(3) { transition-delay: 100ms; }\n.has-dropdown.is-open .dd-li:nth-child(4) { transition-delay: 150ms; }\n.has-dropdown.is-open .dd-li:nth-child(5) { transition-delay: 200ms; }\n.has-dropdown.is-open .dd-li:nth-child(6) { transition-delay: 250ms; }',
      dropdownJS: '',
      height: 440
    },
    snippetHTML: '<div class="dd-slide">\n  <a class="dd-li">기능</a>\n  <a class="dd-li">사례</a>\n  ...\n</div>',
    snippetCSS: '.dd-li { opacity: 0; transform: translateY(-6px); transition: opacity 320ms, transform 320ms; }\n.has-dropdown.is-open .dd-li { opacity: 1; transform: translateY(0); }\n.has-dropdown.is-open .dd-li:nth-child(1) { transition-delay: 0ms; }\n.has-dropdown.is-open .dd-li:nth-child(2) { transition-delay: 50ms; }\n.has-dropdown.is-open .dd-li:nth-child(3) { transition-delay: 100ms; }',
    snippetJS: '/* CSS-only stagger (nth-child) — JS는 hover 트리거만 */',
    explain: 'dropdown이 .is-open이 되면 각 항목이 stagger delay (50ms 간격)로 opacity 0→1 + translateY -6px→0으로 풀려난다. CSS의 nth-child + transition-delay로 JS 없이 구현. 항목이 차례로 등장하면서 dropdown 자체가 "조립되는" 인상.',
    kv: [
      { label: '의존성', value: 'CSS only (nth-child stagger)' },
      { label: '트리거', value: 'Menu 2 mouseenter → .is-open' },
      { label: '항목 stagger', value: '50ms × nth-child' },
      { label: '한 항목 시간', value: '320ms ease-out' },
      { label: '변위', value: 'opacity 0→1 + translateY -6→0' },
      { label: '시그니처', value: 'Vercel / Framer / Linear 미세' }
    ],
    guide: '항목이 6개 안팎(4~8)일 때 가장 자연스럽다. stagger 50ms × 6 = 300ms로 dropdown 등장 전체가 300~600ms 안에 완료. 너무 길면(>1s) 답답함. 닫힐 때는 stagger 없이 즉시 사라지게(transition: 0)가 깔끔. prefers-reduced-motion에서는 stagger 제거 + 즉시 표시.',
    recommendations: [
      { place: '히어로 헤더', body: '디자인 도구·SaaS GNB — 우아한 진입으로 브랜드 톤 강화 (Vercel/Framer 스타일)' },
      { place: '랜딩 페이지', body: '에디토리얼·매거진 사이트의 카테고리 메뉴 — 시네마틱한 느낌' },
      { place: '제품 섹션', body: '컨피규레이터의 옵션 선택 — 옵션이 차례로 풀려나며 선택 유도' },
      { place: '포트폴리오 소개', body: '작품 카테고리 메뉴 — 항목 등장 자체가 시각적 매력' }
    ],
    tradeoff: '시간 비용 (300~600ms). 사용자가 빠르게 메뉴를 클릭하고 싶을 때는 답답할 수 있음 → 호버 후 200ms 이상 머무를 때만 stagger 시작하는 방식도 가능. 닫힐 때도 stagger를 두면 정말 답답하니 닫힘은 즉시.'
  },

  // ───────────────────────────── 8. search-bar
  {
    id: 'search-bar',
    num: '08',
    title: '검색 통합',
    summary: '상단 검색 입력 + 그 아래 결과 리스트. Notion·Stripe Docs·GitHub의 cmd+K 패턴. dropdown 자체가 검색 인터페이스가 된다.',
    demo: {
      menuLabel: '검색',
      dropdownHTML: '<div class="dd-search">\n  <div class="dd-search-input"><span class="dd-search-icon">⌕</span><input type="search" placeholder="컴포넌트·문서·가이드 검색…" /></div>\n  <div class="dd-search-results">\n    <div class="dd-search-group">\n      <div class="dd-search-label">최근 검색</div>\n      <a class="dd-search-row"><span class="dd-search-tag">DOC</span>API 인증</a>\n      <a class="dd-search-row"><span class="dd-search-tag">DOC</span>웹훅 설정</a>\n    </div>\n    <div class="dd-search-group">\n      <div class="dd-search-label">바로가기</div>\n      <a class="dd-search-row"><span class="dd-search-tag dd-search-tag-blue">PAGE</span>대시보드</a>\n      <a class="dd-search-row"><span class="dd-search-tag dd-search-tag-blue">PAGE</span>결제 내역</a>\n      <a class="dd-search-row"><span class="dd-search-tag dd-search-tag-blue">PAGE</span>고객 목록</a>\n    </div>\n  </div>\n</div>',
      dropdownCSS: '.dd-search { display: flex; flex-direction: column; min-width: 460px; padding: 10px; gap: 8px; }\n.dd-search-input { display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: #f4f4f5; border-radius: 10px; }\n.dd-search-icon { font: 700 16px/1 inherit; color: #71717a; }\n.dd-search-input input { flex: 1; border: 0; outline: 0; background: transparent; font: 500 14px/1.4 inherit; color: #171717; }\n.dd-search-input input::placeholder { color: #a1a1aa; }\n.dd-search-results { display: flex; flex-direction: column; gap: 12px; padding: 4px 4px 4px; }\n.dd-search-group { display: flex; flex-direction: column; gap: 2px; }\n.dd-search-label { font: 700 10px/1 inherit; color: #71717a; letter-spacing: 0.12em; text-transform: uppercase; padding: 6px 8px; }\n.dd-search-row { display: flex; align-items: center; gap: 10px; padding: 8px 10px; font: 500 13.5px/1.4 inherit; color: #171717; text-decoration: none; border-radius: 6px; transition: background 140ms; cursor: pointer; }\n.dd-search-row:hover { background: #f4f4f5; }\n.dd-search-tag { font: 700 9px/1 ui-monospace, monospace; color: #525252; background: #e4e4e7; padding: 4px 7px; border-radius: 4px; letter-spacing: 0.06em; }\n.dd-search-tag-blue { color: #1e40af; background: #dbeafe; }',
      dropdownJS: '',
      height: 480
    },
    snippetHTML: '<div class="dd-search">\n  <div class="dd-search-input">\n    <input placeholder="검색…" />\n  </div>\n  <div class="dd-search-results">\n    <a class="dd-search-row">결과 1</a>\n    <a class="dd-search-row">결과 2</a>\n  </div>\n</div>',
    snippetCSS: '.dd-search-input { display: flex; padding: 8px 12px; background: #f4f4f5; border-radius: 10px; }\n.dd-search-input input { flex: 1; border: 0; outline: 0; background: transparent; }\n.dd-search-row:hover { background: #f4f4f5; }',
    snippetJS: '/* 실 사용: 검색 input의 입력 이벤트로 결과 fetch & render */',
    explain: '상단 검색 input + 그 아래 카테고리별 결과 리스트. "최근 검색"·"바로가기" 같은 그룹 라벨(uppercase + tracking)로 분류. 각 결과 행에 작은 태그(DOC, PAGE)로 종류 표시. 실 사용 시에는 입력 이벤트로 서버/로컬 검색 결과를 동적으로 렌더.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (검색 input 이벤트)' },
      { label: '트리거', value: 'Menu 2 mouseenter / cmd+K' },
      { label: '레이아웃', value: '단일 컬럼 460px' },
      { label: '그룹 분류', value: '최근 검색·바로가기·결과 등' },
      { label: '태그', value: '9px UPPERCASE 배지' },
      { label: '시그니처', value: 'Notion / Stripe Docs / GitHub / Vercel' }
    ],
    guide: '검색 input은 dropdown 안에서 가장 윗자리. placeholder는 검색 가능한 범위를 명시("컴포넌트·문서 검색…"). 결과는 카테고리별로 그룹 + 태그로 종류 식별. 빈 상태에서는 "최근 검색"·"바로가기" 보여주기. cmd+K 단축키 안내(우측 키 배지)를 두면 파워 유저에게 친절.',
    recommendations: [
      { place: '히어로 헤더', body: '문서 사이트·SaaS 대시보드의 글로벌 검색 — 모든 페이지에서 접근' },
      { place: '랜딩 페이지', body: '대규모 콘텐츠 사이트(블로그·뉴스)의 메인 검색' },
      { place: '제품 섹션', body: 'e-commerce 검색 — 카테고리·브랜드 필터를 결과 그룹으로' },
      { place: '포트폴리오 소개', body: '작품 검색 — 태그·연도·카테고리로 결과 분류' }
    ],
    tradeoff: '검색 백엔드(서버 API 또는 클라이언트 인덱스) 필요. 키보드 네비게이션(↑↓ Enter Esc) 구현이 필수 — 단순 hover/click만으로는 부족. 모바일에서는 풀스크린 검색 화면으로 fallback이 자연스럽다.'
  },

  // ───────────────────────────── 9. cascade-submenu
  {
    id: 'cascade-submenu',
    num: '09',
    title: '캐스케이드 서브메뉴',
    summary: '1depth 항목 호버 시 우측으로 펼쳐지는 2depth 서브메뉴. 전통적 데스크톱 메뉴의 클래식. 항목이 계층적일 때 정보 구조를 명확히 전달.',
    demo: {
      menuLabel: '카테고리',
      dropdownHTML: '<div class="dd-casc">\n  <ul class="dd-casc-l1">\n    <li class="dd-casc-item has-sub is-on">\n      <a>전자제품 ›</a>\n      <ul class="dd-casc-l2">\n        <li><a>스마트폰</a></li>\n        <li><a>노트북</a></li>\n        <li><a>태블릿</a></li>\n        <li><a>액세서리</a></li>\n        <li><a>오디오</a></li>\n      </ul>\n    </li>\n    <li class="dd-casc-item has-sub">\n      <a>패션 ›</a>\n    </li>\n    <li class="dd-casc-item has-sub">\n      <a>홈·가전 ›</a>\n    </li>\n    <li class="dd-casc-item has-sub">\n      <a>뷰티·헬스 ›</a>\n    </li>\n    <li class="dd-casc-item">\n      <a>도서·문구</a>\n    </li>\n  </ul>\n</div>',
      dropdownCSS: '.dd-casc { display: flex; padding: 8px; min-width: 220px; }\n.dd-casc-l1 { list-style: none; margin: 0; padding: 0; flex: 1; }\n.dd-casc-item { position: relative; }\n.dd-casc-item > a { display: flex; justify-content: space-between; padding: 10px 14px; font: 500 14px/1.4 inherit; color: #171717; text-decoration: none; border-radius: 8px; transition: background 140ms; cursor: pointer; }\n.dd-casc-item:hover > a, .dd-casc-item.is-on > a { background: #f4f4f5; }\n.dd-casc-l2 { position: absolute; top: 0; left: 100%; margin: 0; padding: 8px; list-style: none; min-width: 200px; background: #fff; border-radius: 12px; box-shadow: 0 12px 32px -8px rgba(0,0,0,0.18); opacity: 0; visibility: hidden; transition: opacity 180ms, visibility 180ms; }\n.dd-casc-item.has-sub:hover .dd-casc-l2, .dd-casc-item.is-on .dd-casc-l2 { opacity: 1; visibility: visible; }\n.dd-casc-l2 li a { display: block; padding: 9px 12px; font: 500 13.5px/1.4 inherit; color: #171717; text-decoration: none; border-radius: 6px; transition: background 140ms; }\n.dd-casc-l2 li a:hover { background: #f4f4f5; }',
      dropdownJS: 'document.querySelectorAll(".dd-casc-item.has-sub").forEach(function(it){\n  it.addEventListener("mouseenter", function(){\n    document.querySelectorAll(".dd-casc-item").forEach(function(x){ x.classList.remove("is-on"); });\n    it.classList.add("is-on");\n  });\n});',
      height: 460
    },
    snippetHTML: '<ul class="dd-casc-l1">\n  <li class="has-sub">\n    <a>전자제품 ›</a>\n    <ul class="dd-casc-l2">\n      <li><a>스마트폰</a></li>\n      <li><a>노트북</a></li>\n    </ul>\n  </li>\n</ul>',
    snippetCSS: '.dd-casc-l2 { position: absolute; top: 0; left: 100%; opacity: 0; visibility: hidden; transition: opacity 180ms, visibility 180ms; }\n.has-sub:hover .dd-casc-l2 { opacity: 1; visibility: visible; }',
    snippetJS: '/* CSS-only로 가능. JS는 활성 상태 관리만 (data-on 토글 등) */',
    explain: '1depth 항목에 .has-sub 클래스 + 우측 화살표(›). hover 시 .dd-casc-l2가 우측(left: 100%)에 펼쳐짐. 전통적 데스크톱 메뉴 패턴(Windows·Mac OS 메뉴바). 계층적 카테고리(전자제품 > 스마트폰)에 가장 잘 맞음.',
    kv: [
      { label: '의존성', value: 'CSS only (JS는 활성 상태만)' },
      { label: '트리거', value: '1depth mouseenter → 2depth 표시' },
      { label: '레이아웃', value: 'l1 220px + l2 absolute left:100%' },
      { label: '서브메뉴 진입', value: 'opacity 0→1, 180ms' },
      { label: '시그니처', value: '전통적 데스크톱 / e-commerce 카테고리' },
      { label: '주의', value: '모바일·터치 환경에서 hover 불가 → 탭 fallback' }
    ],
    guide: '계층적 카테고리(전자제품 > 스마트폰 > iPhone)에 적합. 1depth 5개, 각 2depth 4~8개 권장. 화살표(›)로 서브메뉴 있음을 명시. 사용자가 마우스를 1depth 항목 위로 가져가면 우측에 즉시 펼쳐짐 — 빠른 탐색. 모바일에서는 클릭/탭으로 1depth 펼치고 다시 클릭으로 2depth.',
    recommendations: [
      { place: '히어로 헤더', body: 'e-commerce·카탈로그 사이트의 "Category" 메뉴 — 계층적 분류가 명확' },
      { place: '랜딩 페이지', body: '서비스 사이트의 "Services > Sub-service" 메뉴' },
      { place: '제품 섹션', body: '대기업 제품군의 "제품 > 라인업 > 모델" 3-tier 분류' },
      { place: '포트폴리오 소개', body: '"Works > Year > Project" — 연도별 작품 정렬' }
    ],
    tradeoff: '모바일·터치 환경에서 hover가 없어 그대로 사용 불가. 깊은 계층(3-depth 이상)은 사용성이 급격히 떨어지니 2-depth까지가 안전. 1depth 항목이 한 줄에 안 들어가면 dropdown 폭 늘리거나 항목 텍스트 축약.'
  },

  // ───────────────────────────── 10. cta-banner
  {
    id: 'cta-banner',
    num: '10',
    title: '메가 메뉴 + CTA 배너',
    summary: '메가 메뉴 하단에 CTA 배너(가입·체험·다운로드)를 결합. 사용자가 dropdown을 탐색하다가 자연스럽게 전환되도록 설계.',
    demo: {
      menuLabel: '시작하기',
      dropdownHTML: '<div class="dd-cta">\n  <div class="dd-cta-grid">\n    <div class="dd-cta-col">\n      <h5>제품</h5>\n      <a>분석 도구</a>\n      <a>대시보드</a>\n      <a>리포트</a>\n    </div>\n    <div class="dd-cta-col">\n      <h5>사용 사례</h5>\n      <a>SaaS</a>\n      <a>e-commerce</a>\n      <a>핀테크</a>\n    </div>\n    <div class="dd-cta-col">\n      <h5>리소스</h5>\n      <a>문서</a>\n      <a>블로그</a>\n      <a>커뮤니티</a>\n    </div>\n  </div>\n  <div class="dd-cta-banner">\n    <div class="dd-cta-text">\n      <h4>30일 무료 체험을 시작해보세요</h4>\n      <p>신용카드 없이 모든 기능을 사용해볼 수 있습니다</p>\n    </div>\n    <button class="dd-cta-btn">무료로 시작 →</button>\n  </div>\n</div>',
      dropdownCSS: '.dd-cta { min-width: 680px; padding: 0; overflow: hidden; }\n.dd-cta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; padding: 22px 24px 18px; }\n.dd-cta-col { display: flex; flex-direction: column; gap: 4px; }\n.dd-cta-col h5 { font: 700 11px/1 inherit; color: #71717a; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 8px; padding: 0 6px; }\n.dd-cta-col a { padding: 6px; font: 500 13.5px/1.4 inherit; color: #171717; text-decoration: none; border-radius: 6px; transition: background 140ms; }\n.dd-cta-col a:hover { background: #f4f4f5; }\n.dd-cta-banner { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; background: linear-gradient(135deg, #171717 0%, #404040 100%); color: #fff; }\n.dd-cta-text h4 { font: 700 14px/1.3 inherit; margin: 0 0 4px; color: #fff; }\n.dd-cta-text p { font: 400 12.5px/1.4 inherit; margin: 0; color: #d4d4d4; }\n.dd-cta-btn { font: 700 13px/1 inherit; color: #171717; background: #fff; border: 0; border-radius: 8px; padding: 10px 18px; cursor: pointer; transition: transform 140ms; }\n.dd-cta-btn:hover { transform: translateX(2px); }',
      dropdownJS: '',
      height: 540
    },
    snippetHTML: '<div class="dd-cta">\n  <div class="dd-cta-grid">\n    <div class="dd-cta-col"><h5>제품</h5><a>분석</a></div>\n    ...\n  </div>\n  <div class="dd-cta-banner">\n    <h4>무료 체험을 시작</h4>\n    <button>시작 →</button>\n  </div>\n</div>',
    snippetCSS: '.dd-cta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; padding: 22px 24px; }\n.dd-cta-banner { display: flex; justify-content: space-between; padding: 20px 24px; background: linear-gradient(135deg, #171717, #404040); color: #fff; }\n.dd-cta-btn { background: #fff; color: #171717; border-radius: 8px; padding: 10px 18px; }',
    snippetJS: '/* CSS only — CTA 클릭은 일반 button/a */',
    explain: 'multi-column 메뉴(상단)와 가로 CTA 배너(하단)의 결합. 사용자가 메뉴를 탐색하다가 자연스럽게 시선이 배너로 이동해 전환을 유도. 배너는 다크 배경으로 메뉴 영역과 구분, 흰색 버튼으로 강조.',
    kv: [
      { label: '의존성', value: 'CSS only' },
      { label: '트리거', value: 'Menu 2 mouseenter / mouseleave' },
      { label: '레이아웃', value: '3-col grid + 가로 배너' },
      { label: '배너 배경', value: 'linear-gradient #171717 → #404040' },
      { label: 'CTA 버튼', value: '흰 배경 + 검정 텍스트 (강조)' },
      { label: '시그니처', value: 'Shopify / HubSpot / Atlassian' }
    ],
    guide: '메뉴 상단(라이트)과 배너 하단(다크)의 명도 대비가 핵심. CTA 메시지는 짧고 구체적("30일 무료 체험"). 버튼 라벨은 행동형("무료로 시작 →"). 화살표(→) 또는 chevron으로 다음 단계 암시. 호버 시 버튼 translateX 2px로 미세 인터랙티브함.',
    recommendations: [
      { place: '히어로 헤더', body: 'SaaS 랜딩의 "제품 / 솔루션" 메뉴 — 메뉴 탐색 중 자연스럽게 가입 유도' },
      { place: '랜딩 페이지', body: '체험판이 핵심인 서비스 — 메뉴에서 바로 가입 가능' },
      { place: '제품 섹션', body: 'e-commerce의 "Shop" 메뉴 + 시즌 프로모션 배너' },
      { place: '포트폴리오 소개', body: '디자이너 사이트의 "Services" 메뉴 + "프로젝트 의뢰" CTA' }
    ],
    tradeoff: 'dropdown 폭이 680px+ 필요해 모바일 부적합. CTA 배너가 너무 강조되면 메뉴 본질을 가린다 — 메시지·배경의 무게감을 메뉴와 균형. 자주 변경되는 프로모션이면 배너만 동적 데이터로 분리.'
  }
];

// ============ Standalone demo HTML 빌더 ============

function buildDemoHTML(p) {
  return '<!DOCTYPE html>\n'
    + '<html lang="ko">\n'
    + '<head>\n'
    + '  <meta charset="UTF-8">\n'
    + '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
    + '  <title>' + p.num + '. ' + p.title + ' — Nav Dropdown Demo</title>\n'
    + '  <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable-dynamic-subset.min.css" rel="stylesheet">\n'
    + '  <style>\n'
    + '    * { box-sizing: border-box; }\n'
    + '    html, body { margin: 0; padding: 0; }\n'
    + '    body {\n'
    + '      background: #000; color: #fff;\n'
    + '      font-family: "Pretendard Variable", "Pretendard", -apple-system, system-ui, sans-serif;\n'
    + '      min-height: 100vh;\n'
    + '      -webkit-font-smoothing: antialiased;\n'
    + '    }\n'
    + '    .demo-controls {\n'
    + '      position: fixed; top: 16px; left: 16px;\n'
    + '      display: inline-flex; align-items: center; gap: 10px;\n'
    + '      z-index: 100;\n'
    + '    }\n'
    + '    .demo-label {\n'
    + '      font: 500 10px/1 ui-monospace, SFMono-Regular, Menlo, monospace;\n'
    + '      color: rgba(255,255,255,0.3);\n'
    + '      letter-spacing: 0.14em; text-transform: uppercase;\n'
    + '    }\n'
    + '    .demo-hint {\n'
    + '      position: fixed; right: 16px; bottom: 24px;\n'
    + '      font: 500 11px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace;\n'
    + '      color: rgba(255,255,255,0.45);\n'
    + '      letter-spacing: 0.04em;\n'
    + '      z-index: 100;\n'
    + '      background: rgba(255,255,255,0.05);\n'
    + '      border: 1px solid rgba(255,255,255,0.12);\n'
    + '      border-radius: 999px;\n'
    + '      padding: 8px 14px;\n'
    + '      animation: hint-pulse 2.4s ease-in-out infinite;\n'
    + '    }\n'
    + '    @keyframes hint-pulse {\n'
    + '      0%, 100% { opacity: 0.6; transform: translateY(0); }\n'
    + '      50%       { opacity: 1; transform: translateY(-3px); }\n'
    + '    }\n'
    + '    /* 표준 nav bar (sticky 상단) */\n'
    + '    .nav {\n'
    + '      position: sticky; top: 0; z-index: 50;\n'
    + '      display: flex; align-items: center; justify-content: space-between;\n'
    + '      gap: 32px;\n'
    + '      padding: 14px 40px;\n'
    + '      background: rgba(0,0,0,0.72);\n'
    + '      backdrop-filter: saturate(180%) blur(20px);\n'
    + '      -webkit-backdrop-filter: saturate(180%) blur(20px);\n'
    + '      border-bottom: 1px solid rgba(255,255,255,0.08);\n'
    + '    }\n'
    + '    .nav-brand { font: 700 16px/1 inherit; color: #fff; letter-spacing: -0.01em; }\n'
    + '    .nav-menu { list-style: none; margin: 0; padding: 0; display: flex; gap: 8px; }\n'
    + '    .nav-menu > li { position: relative; }\n'
    + '    .nav-menu > li > a, .nav-menu > li > .trigger {\n'
    + '      display: inline-block; padding: 8px 14px;\n'
    + '      font: 500 14px/1.2 inherit; color: rgba(255,255,255,0.78);\n'
    + '      text-decoration: none; border-radius: 8px;\n'
    + '      cursor: pointer; transition: background 160ms, color 160ms;\n'
    + '    }\n'
    + '    .nav-menu > li > a:hover, .nav-menu > li > .trigger:hover,\n'
    + '    .has-dropdown.is-open > .trigger { background: rgba(255,255,255,0.08); color: #fff; }\n'
    + '    .nav-cta {\n'
    + '      font: 600 13px/1 inherit; color: #000; background: #fff;\n'
    + '      border: 0; border-radius: 999px; padding: 9px 18px; cursor: pointer;\n'
    + '      transition: opacity 160ms, transform 160ms;\n'
    + '    }\n'
    + '    .nav-cta:hover { transform: translateY(-1px); }\n'
    + '    /* dropdown 컨테이너 (밝은 톤) */\n'
    + '    .has-dropdown .dropdown {\n'
    + '      position: absolute; top: calc(100% + 12px); left: 50%;\n'
    + '      transform: translate(-50%, -6px);\n'
    + '      background: #fff; color: #171717;\n'
    + '      border-radius: 16px;\n'
    + '      box-shadow: 0 18px 48px -12px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.04);\n'
    + '      opacity: 0; visibility: hidden;\n'
    + '      transition: opacity 200ms cubic-bezier(0.2,0,0,1), transform 200ms cubic-bezier(0.2,0,0,1), visibility 200ms;\n'
    + '      font-family: inherit;\n'
    + '    }\n'
    + '    .has-dropdown.is-open .dropdown {\n'
    + '      opacity: 1; visibility: visible; transform: translate(-50%, 0);\n'
    + '    }\n'
    + '    /* dropdown 안의 a 기본 색 (밝은 톤) */\n'
    + '    .dropdown a { color: #171717; }\n'
    + '    /* 본문 빈 영역 (페이지 placeholder) */\n'
    + '    .page-content {\n'
    + '      min-height: calc(100vh - 70px);\n'
    + '      display: flex; align-items: center; justify-content: center;\n'
    + '      padding: 80px 40px;\n'
    + '      color: rgba(255,255,255,0.18);\n'
    + '      font: 700 56px/1.2 inherit; letter-spacing: -0.02em; text-align: center;\n'
    + '    }\n'
    + '    /* 패턴별 dropdown CSS */\n'
    + '    ' + p.demo.dropdownCSS.replace(/\n/g, '\n    ') + '\n'
    + '  </style>\n'
    + '</head>\n'
    + '<body>\n'
    + '  <div class="demo-controls">\n'
    + '    <span class="demo-label">' + p.num + ' · ' + p.title + '</span>\n'
    + '  </div>\n'
    + '  <div class="demo-hint">↓ &quot;' + p.demo.menuLabel + '&quot; 메뉴에 호버해보세요</div>\n'
    + '\n'
    + '  <nav class="nav">\n'
    + '    <div class="nav-brand">스튜디오</div>\n'
    + '    <ul class="nav-menu">\n'
    + '      <li><a href="#">홈</a></li>\n'
    + '      <li class="has-dropdown">\n'
    + '        <a class="trigger" href="#">' + p.demo.menuLabel + '</a>\n'
    + '        <div class="dropdown">\n'
    + '          ' + p.demo.dropdownHTML.replace(/\n/g, '\n          ') + '\n'
    + '        </div>\n'
    + '      </li>\n'
    + '      <li><a href="#">고객사</a></li>\n'
    + '      <li><a href="#">가격</a></li>\n'
    + '    </ul>\n'
    + '    <button class="nav-cta" type="button">시작하기</button>\n'
    + '  </nav>\n'
    + '\n'
    + '  <main class="page-content">디자인 스튜디오</main>\n'
    + '\n'
    + '  <script>\n'
    + '    (function(){\n'
    + '      var trigger = document.querySelector(".has-dropdown");\n'
    + '      if (!trigger) return;\n'
    + '      var closeTimer = null;\n'
    + '      function open(){ clearTimeout(closeTimer); trigger.classList.add("is-open"); }\n'
    + '      function close(){ closeTimer = setTimeout(function(){ trigger.classList.remove("is-open"); }, 120); }\n'
    + '      trigger.addEventListener("mouseenter", open);\n'
    + '      trigger.addEventListener("mouseleave", close);\n'
    + '      // dropdown 내부 호버 시에도 닫히지 않게\n'
    + '      var dd = trigger.querySelector(".dropdown");\n'
    + '      if (dd) {\n'
    + '        dd.addEventListener("mouseenter", open);\n'
    + '        dd.addEventListener("mouseleave", close);\n'
    + '      }\n'
    + '      // 패턴별 JS\n'
    + '      ' + (p.demo.dropdownJS || '').replace(/\n/g, '\n      ') + '\n'
    + '    })();\n'
    + '  </script>\n'
    + '</body>\n'
    + '</html>\n';
}

// ============ 분석 보고서 블록 빌더 (15 블록 표준) ============

function buildPatternSection(p) {
  const blocks = [
    { type: 'text', value: p.summary },
    { type: 'heading', value: '라이브 데모' },
    {
      type: 'component',
      embed: 'demos/nav-bar-dropdown/' + p.id + '.html',
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
    tag: p.kv.find(k => k.label === '의존성')?.value || '',
    desc: p.summary
  }));

  return {
    title: '00. 카테고리 개요',
    blocks: [
      { type: 'heading', value: 'Nav bar dropdown — 패턴 카탈로그 v1' },
      { type: 'text', value: CATEGORY.summary },
      { type: 'heading', value: '10 패턴 인덱스' },
      { type: 'structure', items: indexItems },
      { type: 'heading', value: '공통 디자인 토큰 + nav 모델' },
      {
        type: 'kv', columns: 2, items: [
          { label: '폰트', value: 'Pretendard Variable (한글) · Inter (영문 보조)' },
          { label: '페이지 배경 / 본문 색', value: '#000 / #ffffff (다크 톤 카탈로그)' },
          { label: 'Dropdown 배경 / 텍스트', value: '#ffffff / #171717 (라이트 톤)' },
          { label: 'Nav 모델', value: 'position:sticky + backdrop-blur 20px + 반투명 #000' },
          { label: 'Dropdown 진입', value: 'opacity 0→1 + translateY -6→0, 200ms cubic-bezier(0.2,0,0,1)' },
          { label: 'Hover 트리거', value: 'mouseenter/leave + 120ms close-delay (실수 방지)' }
        ]
      },
      { type: 'heading', value: '읽기 가이드' },
      {
        type: 'structure', items: [
          { label: '라이브 데모', tag: 'IFRAME', desc: 'demos/nav-bar-dropdown/{pattern}.html 의 standalone 페이지를 iframe으로 임베드. 메뉴에 호버하면 dropdown이 펼쳐짐' },
          { label: '작동 원리', tag: 'HOW', desc: '한 줄 요약 + 1-2 문단으로 핵심 메커니즘 설명' },
          { label: '정량 메타', tag: 'KV', desc: '의존성 / 트리거 / 레이아웃 / 항목 수 / 시그니처 등' },
          { label: '코드 스니펫', tag: 'CODE', desc: 'HTML / CSS / JS 세 블록. 패턴별 핵심만(boilerplate 제외)' },
          { label: '사용 가이드', tag: 'GUIDE', desc: '어떻게 사용하나 — 폭·항목 수·접근성·모바일 fallback' },
          { label: '활용 추천', tag: 'PLACES', desc: '히어로 헤더 / 랜딩 페이지 / 제품 섹션 / 포트폴리오 소개' },
          { label: '트레이드오프', tag: 'NOTE', desc: '폭·반응형·접근성에 대한 한 줄 메모' }
        ]
      },
      {
        type: 'note',
        value: '참고 자료: Framer 마켓플레이스 Aave Navigation Bar (' + CATEGORY.url + ') — 다크 nav + 라이트 dropdown + 2-column 메가 메뉴 구조를 차용. 본 카탈로그는 단일 컴포넌트가 아닌 10가지 dropdown 변형 비교 카탈로그를 지향한다. 모든 데모는 자동 재생이 아니라 사용자가 "Menu 2"에 호버할 때 dropdown이 펼쳐지는 인터랙티브 데모.'
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
    console.log('✓ demos/nav-bar-dropdown/' + p.id + '.html');
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

  console.log('✓ analyses/nav-bar-dropdown/analysis.json');
  console.log('  ' + PATTERNS.length + ' patterns + 1 overview = ' + (PATTERNS.length + 1) + ' sections');
  const totalBlocks = Object.values(sections).reduce((acc, s) => acc + s.blocks.length, 0);
  console.log('  ' + totalBlocks + ' blocks total');
}

main();
