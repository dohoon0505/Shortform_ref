#!/usr/bin/env node
/**
 * Web Reference Lab — Category Generator: Number Counter (v1)
 * Framer LoaderCounter 참고 — 10종 숫자 카운터 인터랙션 카탈로그
 *
 * - 스크롤 진행률(0~1) 매핑 기반 카운터
 * - 검정 배경 + Pretendard Variable + 한국어 라벨
 * - 패턴마다 다른 카운팅 시각화
 *
 * Usage: node scripts/generate-number-counter.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ANALYSIS_DIR = join(ROOT, 'analyses', 'number-counter');
const ANALYSIS_FILE = join(ANALYSIS_DIR, 'analysis.json');
const DEMO_DIR = join(ROOT, 'demos', 'number-counter');

const CATEGORY = {
  id: 'number-counter',
  title: '숫자 카운터',
  type: 'category',
  date: '2026-05-29',
  url: 'https://www.framer.com/marketplace/components/loader-counter/',
  summary: 'Framer LoaderCounter 컴포넌트를 참고로, 숫자가 스크롤 진행률에 따라 증가하는 10가지 카운터 인터랙션 패턴. 로더 카운터·리니어 카운트업·오도미터·천 단위 포맷·K/M/B 축약·컬러 그라데이션·원형 프로그레스·바 프로그레스·스프링 오버슈트·다중 통계 카운터 등 다양한 시각 표현을 비교 카탈로그로 정리.'
};

/* ================================================================
   10 패턴 정의
   ================================================================ */

const PATTERNS = [
  // ── 01. loader-counter (Framer LoaderCounter 시그니처) ──
  {
    id: 'loader-counter', num: '01', title: '로더 카운터 (Framer 시그니처)',
    summary: 'Framer LoaderCounter 재현. 0%→100% 오가닉 페이싱 — 초반 빠르게, 후반 느리게 + 마이크로 포즈로 실제 로딩 느낌.',
    demo: {
      bodyHTML: '<div class="counter-display">\n'
        + '  <span class="counter-value">0</span><span class="counter-suffix">%</span>\n'
        + '</div>\n'
        + '<p class="counter-label">로딩 진행률</p>',
      css: '.counter-display { display: flex; align-items: baseline; justify-content: center; gap: 4px; }\n'
        + '.counter-value { font: 800 clamp(80px,12vw,160px)/1 "Pretendard Variable",sans-serif; color: #fff; font-variant-numeric: tabular-nums; }\n'
        + '.counter-suffix { font: 600 clamp(28px,4vw,56px)/1 "Pretendard Variable",sans-serif; color: rgba(255,255,255,0.5); }\n'
        + '.counter-label { font: 400 clamp(14px,1.2vw,18px)/1.4 "Pretendard Variable",sans-serif; color: rgba(255,255,255,0.3); margin-top: 16px; letter-spacing: 0.08em; text-transform: uppercase; }',
      js: 'var valEl = document.querySelector(".counter-value");\n'
        + 'function organicEase(t) {\n'
        + '  if (t < 0.3) return t * 2.33;\n'
        + '  if (t < 0.7) return 0.7 + (t - 0.3) * 0.5;\n'
        + '  return 0.9 + (t - 0.7) * 0.333;\n'
        + '}\n'
        + 'function applyReveal(p) {\n'
        + '  var v = Math.min(100, Math.round(organicEase(p) * 100));\n'
        + '  valEl.textContent = v;\n'
        + '}',
      height: 400,
      duration: 3000
    },
    snippetHTML: '<div class="counter-display">\n  <span class="counter-value">0</span>\n  <span class="counter-suffix">%</span>\n</div>',
    snippetCSS: '.counter-value {\n  font: 800 160px/1 "Pretendard Variable", sans-serif;\n  color: #fff;\n  font-variant-numeric: tabular-nums;\n}\n.counter-suffix {\n  font: 600 56px/1 "Pretendard Variable", sans-serif;\n  color: rgba(255,255,255,0.5);\n}',
    snippetJS: '// 오가닉 이징: 초반 빠르게(0~30%) → 중반 보통(30~70%) → 후반 느리게(70~100%)\nfunction organicEase(t) {\n  if (t < 0.3) return t * 2.33;   // 빠른 구간\n  if (t < 0.7) return 0.7 + (t - 0.3) * 0.5; // 보통\n  return 0.9 + (t - 0.7) * 0.333; // 느린 마무리\n}\nvar value = Math.round(organicEase(progress) * 100);',
    explain: 'Framer LoaderCounter의 핵심인 "로더 느낌"을 재현. 3구간 분기 이징 — 0~30% 구간에서 빠르게 70%까지 채운 뒤, 30~70% 구간에서 천천히 90%까지, 마지막 70~100% 구간에서 극히 느리게 100%에 도달. 실제 파일 로딩·다운로드 진행 바의 체감 속도를 모사.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (이징 함수)' },
      { label: '트리거', value: '페이지 로드 → requestAnimationFrame 자동 재생' },
      { label: '이징', value: '3구간 piecewise-linear (빠름→보통→느림)' },
      { label: '목표값', value: '0% → 100%' },
      { label: '핵심', value: 'font-variant-numeric: tabular-nums (고정폭 숫자)' },
      { label: '참고', value: 'Framer LoaderCounter (organic pacing)' }
    ],
    guide: 'tabular-nums는 필수 — 숫자 폭이 고정되어야 카운팅 중 레이아웃이 흔들리지 않음. 이징 함수의 3구간 비율을 조정하면 체감 속도 튜닝 가능. suffix(%,원,건 등)는 별도 span으로 분리하여 독립 스타일링.',
    recommendations: [
      { place: '히어로 헤더', body: '로딩 화면 — 페이지 진입 시 100%까지 채우는 인트로' },
      { place: '랜딩 페이지', body: '진행률 섹션 — 프로젝트 달성률, 목표 달성 시각화' },
      { place: '제품 섹션', body: '스펙 비교 — 배터리 잔량, 메모리 사용률 등' },
      { place: '포트폴리오 소개', body: '스킬 레벨 — 기술 숙련도 퍼센티지' }
    ],
    tradeoff: '3구간 이징은 정적 분기라 매끄러움이 cubic-bezier보다 떨어질 수 있음. 더 정밀한 곡선이 필요하면 ease-out-expo 함수로 교체.'
  },

  // ── 02. linear-count ──
  {
    id: 'linear-count', num: '02', title: '리니어 카운트업',
    summary: '가장 기본적인 선형 카운터. 스크롤 진행률에 정비례하여 0에서 목표값(10,000)까지 증가.',
    demo: {
      bodyHTML: '<div class="counter-display">\n'
        + '  <span class="counter-prefix">+</span><span class="counter-value">0</span>\n'
        + '</div>\n'
        + '<p class="counter-label">총 가입자 수</p>',
      css: '.counter-display { display: flex; align-items: baseline; justify-content: center; gap: 2px; }\n'
        + '.counter-prefix { font: 300 clamp(40px,6vw,80px)/1 "Pretendard Variable",sans-serif; color: rgba(255,255,255,0.4); }\n'
        + '.counter-value { font: 700 clamp(64px,10vw,140px)/1 "Pretendard Variable",sans-serif; color: #fff; font-variant-numeric: tabular-nums; letter-spacing: -0.02em; }\n'
        + '.counter-label { font: 400 clamp(13px,1.1vw,17px)/1.4 "Pretendard Variable",sans-serif; color: rgba(255,255,255,0.3); margin-top: 12px; letter-spacing: 0.1em; text-transform: uppercase; }',
      js: 'var valEl = document.querySelector(".counter-value");\n'
        + 'var TARGET = 10000;\n'
        + 'function applyReveal(p) {\n'
        + '  valEl.textContent = Math.floor(p * TARGET).toLocaleString("ko-KR");\n'
        + '}',
      height: 480
    },
    snippetHTML: '<div class="counter-display">\n  <span class="counter-prefix">+</span>\n  <span class="counter-value">0</span>\n</div>\n<p class="counter-label">총 가입자 수</p>',
    snippetCSS: '.counter-value {\n  font: 700 140px/1 "Pretendard Variable", sans-serif;\n  color: #fff;\n  font-variant-numeric: tabular-nums;\n  letter-spacing: -0.02em;\n}',
    snippetJS: 'var TARGET = 10000;\nfunction applyReveal(p) {\n  valEl.textContent = Math.floor(p * TARGET).toLocaleString("ko-KR");\n}',
    explain: '가장 단순한 선형 매핑. progress × TARGET을 floor하고 toLocaleString으로 천 단위 구분자 자동 삽입. tabular-nums로 숫자 폭 고정. prefix(+)와 label은 별도 요소로 분리.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (toLocaleString)' },
      { label: '트리거', value: '페이지 로드 → rAF 선형 매핑 × TARGET' },
      { label: '이징', value: 'linear (1:1 매핑)' },
      { label: '목표값', value: '0 → 10,000' },
      { label: '핵심', value: 'toLocaleString("ko-KR") 자동 천 단위 콤마' },
      { label: '참고', value: '기본형 — 모든 카운터의 베이스' }
    ],
    guide: 'TARGET 값만 바꾸면 어떤 숫자든 적용 가능. toLocaleString의 locale을 바꾸면 지역별 포맷(1.000 vs 1,000) 자동 전환. prefix는 +, $, ₩ 등으로 교체.',
    recommendations: [
      { place: '히어로 헤더', body: '핵심 지표 — 사용자 수, 다운로드 수 등 임팩트 숫자' },
      { place: '랜딩 페이지', body: '소셜 프루프 — "10,000+ 기업이 선택" 류 통계' },
      { place: '제품 섹션', body: '제품 스펙 — 처리 속도, 용량 등 수치' },
      { place: '포트폴리오 소개', body: '경력 요약 — 완료 프로젝트 수, 고객 수' }
    ],
    tradeoff: '선형이라 시각적 극적함이 부족. 큰 숫자(100만+)에서는 초반에 변화가 너무 빠르게 느껴질 수 있음 — 로그 스케일이나 이징 추가 권장.'
  },

  // ── 03. odometer (자릿수 롤링) ──
  {
    id: 'odometer', num: '03', title: '자릿수 롤링 (오도미터)',
    summary: '자동차 계기판처럼 각 자릿수가 독립적으로 롤링. overflow:hidden + translateY로 0~9 숫자가 슬롯처럼 회전.',
    demo: {
      bodyHTML: '<div class="odo-wrap">\n'
        + '  <div class="odo-digit" data-pos="3"><div class="odo-strip">0<br>1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9</div></div>\n'
        + '  <span class="odo-comma">,</span>\n'
        + '  <div class="odo-digit" data-pos="2"><div class="odo-strip">0<br>1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9</div></div>\n'
        + '  <div class="odo-digit" data-pos="1"><div class="odo-strip">0<br>1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9</div></div>\n'
        + '  <div class="odo-digit" data-pos="0"><div class="odo-strip">0<br>1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9</div></div>\n'
        + '</div>\n'
        + '<p class="counter-label">프로젝트 완료</p>',
      css: '.odo-wrap { display: flex; align-items: flex-start; justify-content: center; }\n'
        + '.odo-digit { height: 1em; overflow: hidden; font: 800 clamp(72px,11vw,150px)/1 "Pretendard Variable",sans-serif; color: #fff; }\n'
        + '.odo-strip { transition: transform 0.1s ease-out; font-variant-numeric: tabular-nums; }\n'
        + '.odo-comma { font: 800 clamp(72px,11vw,150px)/1 "Pretendard Variable",sans-serif; color: rgba(255,255,255,0.3); }\n'
        + '.counter-label { font: 400 clamp(13px,1.1vw,17px)/1.4 "Pretendard Variable",sans-serif; color: rgba(255,255,255,0.3); margin-top: 20px; letter-spacing: 0.1em; text-transform: uppercase; text-align: center; }',
      js: 'var digits = document.querySelectorAll(".odo-digit");\n'
        + 'var TARGET = 8524;\n'
        + 'function applyReveal(p) {\n'
        + '  var val = Math.floor(p * TARGET);\n'
        + '  var str = String(val).padStart(4, "0");\n'
        + '  digits.forEach(function(d) {\n'
        + '    var pos = parseInt(d.dataset.pos);\n'
        + '    var digitVal = parseInt(str[3 - pos]);\n'
        + '    var strip = d.querySelector(".odo-strip");\n'
        + '    strip.style.transform = "translateY(-" + (digitVal * 100) + "%)";\n'
        + '  });\n'
        + '}',
      height: 480
    },
    snippetHTML: '<div class="odo-wrap">\n  <div class="odo-digit" data-pos="3">\n    <div class="odo-strip">0<br>1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9</div>\n  </div>\n  <!-- ... 반복 -->\n</div>',
    snippetCSS: '.odo-digit { height: 1em; overflow: hidden;\n  font: 800 150px/1 "Pretendard Variable", sans-serif; }\n.odo-strip { transition: transform 0.1s ease-out;\n  font-variant-numeric: tabular-nums; }',
    snippetJS: 'var val = Math.floor(progress * TARGET);\nvar str = String(val).padStart(4, "0");\ndigits.forEach(function(d) {\n  var pos = parseInt(d.dataset.pos);\n  var digitVal = parseInt(str[3 - pos]);\n  strip.style.transform = "translateY(-" + (digitVal * 100) + "%)";\n});',
    explain: '각 자릿수가 독립적인 .odo-digit 컨테이너(height:1em, overflow:hidden). 내부 .odo-strip에 0~9 숫자가 세로로 나열. translateY(-N×100%)로 해당 숫자 위치로 스크롤. 높은 자릿수가 바뀔 때 낮은 자릿수는 빠르게 회전하는 기계적 느낌.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (자릿수 분해 + translateY)' },
      { label: '트리거', value: '페이지 로드 → 각 자릿수 독립 롤링' },
      { label: '이징', value: 'ease-out 0.1s (자릿수 전환)' },
      { label: '목표값', value: '0000 → 8,524' },
      { label: '핵심', value: 'overflow:hidden + translateY(-N×100%) 슬롯' },
      { label: '참고', value: '자동차 오도미터 / 공항 출발 보드' }
    ],
    guide: '자릿수를 늘리려면 .odo-digit을 추가하고 data-pos를 증가. padStart 길이도 맞춤. 콤마 위치는 수동 배치 — toLocaleString과 달리 마크업에 직접 삽입.',
    recommendations: [
      { place: '히어로 헤더', body: '카운트다운/카운트업 — 런칭 D-day, 누적 카운터' },
      { place: '랜딩 페이지', body: '실시간 통계 — 현재 접속자 수, 거래 건수' },
      { place: '제품 섹션', body: '스코어보드 — 게임/앱 점수 표시' },
      { place: '포트폴리오 소개', body: '경력 연차 — 숫자가 또렷하게 돌아가는 시각적 임팩트' }
    ],
    tradeoff: '마크업이 자릿수 × 10개 숫자로 방대해짐. 동적 자릿수 변경이 어려움 — 고정 자릿수 레이아웃에 최적.'
  },

  // ── 04. comma-format ──
  {
    id: 'comma-format', num: '04', title: '천 단위 콤마 포맷',
    summary: '0에서 1,000,000까지 카운팅하며 천 단위 콤마가 자연스럽게 삽입/업데이트. locale-aware 포맷.',
    demo: {
      bodyHTML: '<div class="counter-display">\n'
        + '  <span class="counter-prefix">₩</span><span class="counter-value">0</span>\n'
        + '</div>\n'
        + '<p class="counter-label">연간 절감 비용</p>',
      css: '.counter-display { display: flex; align-items: baseline; justify-content: center; gap: 6px; }\n'
        + '.counter-prefix { font: 300 clamp(32px,5vw,64px)/1 "Pretendard Variable",sans-serif; color: rgba(255,255,255,0.35); }\n'
        + '.counter-value { font: 800 clamp(60px,9vw,130px)/1 "Pretendard Variable",sans-serif; color: #fff; font-variant-numeric: tabular-nums; letter-spacing: -0.01em; min-width: 5ch; text-align: right; }\n'
        + '.counter-label { font: 400 clamp(13px,1.1vw,17px)/1.4 "Pretendard Variable",sans-serif; color: rgba(255,255,255,0.3); margin-top: 16px; letter-spacing: 0.1em; text-transform: uppercase; text-align: center; }',
      js: 'var valEl = document.querySelector(".counter-value");\n'
        + 'var TARGET = 1000000;\n'
        + 'function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }\n'
        + 'function applyReveal(p) {\n'
        + '  var v = Math.floor(easeOutExpo(p) * TARGET);\n'
        + '  valEl.textContent = v.toLocaleString("ko-KR");\n'
        + '}',
      height: 480
    },
    snippetHTML: '<div class="counter-display">\n  <span class="counter-prefix">₩</span>\n  <span class="counter-value">0</span>\n</div>',
    snippetCSS: '.counter-value {\n  font: 800 130px/1 "Pretendard Variable", sans-serif;\n  font-variant-numeric: tabular-nums;\n  min-width: 5ch; text-align: right;\n}',
    snippetJS: 'var TARGET = 1000000;\nfunction easeOutExpo(t) {\n  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);\n}\nvar value = Math.floor(easeOutExpo(progress) * TARGET);\nvalEl.textContent = value.toLocaleString("ko-KR");',
    explain: 'easeOutExpo 이징으로 초반에 빠르게 올라가다 후반에 천천히 수렴. toLocaleString("ko-KR")이 자동으로 천 단위 콤마를 삽입. min-width와 text-align:right로 자릿수 변화 시 레이아웃 안정.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (toLocaleString + easeOutExpo)' },
      { label: '트리거', value: '페이지 로드 → easeOutExpo → 포맷' },
      { label: '이징', value: 'ease-out-expo (1 - 2^(-10t))' },
      { label: '목표값', value: '0 → 1,000,000' },
      { label: '핵심', value: 'toLocaleString locale-aware + min-width 안정화' },
      { label: '참고', value: 'Framer LoaderCounter Format 옵션' }
    ],
    guide: 'locale을 "en-US"로 바꾸면 1,000,000, "de-DE"면 1.000.000. prefix를 $, €, ¥ 등으로 교체하여 다국가 대응. min-width를 목표값 자릿수에 맞춰 설정.',
    recommendations: [
      { place: '히어로 헤더', body: '매출·비용 절감 — 금액 임팩트 강조' },
      { place: '랜딩 페이지', body: '가격 페이지 — 연간/월간 절감 효과' },
      { place: '제품 섹션', body: 'ROI 계산기 — 투자 대비 수익률 시각화' },
      { place: '포트폴리오 소개', body: '프로젝트 규모 — 처리한 데이터 양, 예산 규모' }
    ],
    tradeoff: '큰 숫자(억 단위)에서는 자릿수가 많아져 가독성 저하. K/M/B 축약 패턴과 조합 권장.'
  },

  // ── 05. abbreviation (K/M/B 축약) ──
  {
    id: 'abbreviation', num: '05', title: 'K/M/B 축약',
    summary: '0에서 2,500,000까지 카운팅하며 K→M 단위가 자연스럽게 전환. 스마트 소수점으로 9.5K→10K 자연스러운 진행.',
    demo: {
      bodyHTML: '<div class="counter-display">\n'
        + '  <span class="counter-value">0</span>\n'
        + '</div>\n'
        + '<p class="counter-label">월간 활성 사용자</p>',
      css: '.counter-display { display: flex; align-items: baseline; justify-content: center; }\n'
        + '.counter-value { font: 800 clamp(72px,11vw,150px)/1 "Pretendard Variable",sans-serif; color: #fff; font-variant-numeric: tabular-nums; letter-spacing: -0.02em; }\n'
        + '.counter-label { font: 400 clamp(13px,1.1vw,17px)/1.4 "Pretendard Variable",sans-serif; color: rgba(255,255,255,0.3); margin-top: 16px; letter-spacing: 0.1em; text-transform: uppercase; text-align: center; }',
      js: 'var valEl = document.querySelector(".counter-value");\n'
        + 'var TARGET = 2500000;\n'
        + 'function abbreviate(n) {\n'
        + '  if (n >= 1000000) return (n / 1000000).toFixed(n % 1000000 >= 100000 ? 1 : 0) + "M";\n'
        + '  if (n >= 1000) return (n / 1000).toFixed(n % 1000 >= 100 ? 1 : 0) + "K";\n'
        + '  return String(n);\n'
        + '}\n'
        + 'function applyReveal(p) {\n'
        + '  var v = Math.floor(p * TARGET);\n'
        + '  valEl.textContent = abbreviate(v);\n'
        + '}',
      height: 480
    },
    snippetHTML: '<span class="counter-value">0</span>',
    snippetCSS: '.counter-value {\n  font: 800 150px/1 "Pretendard Variable", sans-serif;\n  font-variant-numeric: tabular-nums;\n}',
    snippetJS: 'function abbreviate(n) {\n  if (n >= 1000000) return (n/1000000).toFixed(1) + "M";\n  if (n >= 1000) return (n/1000).toFixed(1) + "K";\n  return String(n);\n}\nvar value = Math.floor(progress * TARGET);\nvalEl.textContent = abbreviate(value);',
    explain: 'abbreviate 함수가 천 단위(K), 백만 단위(M), 십억 단위(B)를 자동 감지하여 축약. 소수점은 나머지 값에 따라 동적으로 0~1자리 표시 — 9.5K→10K처럼 불필요한 .0을 제거.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (abbreviate 함수)' },
      { label: '트리거', value: '페이지 로드 → rAF × TARGET → abbreviate' },
      { label: '이징', value: 'linear' },
      { label: '목표값', value: '0 → 2.5M (단계: K→M)' },
      { label: '핵심', value: 'K/M/B 동적 전환 + 스마트 소수점' },
      { label: '참고', value: 'Framer LoaderCounter Shorten 옵션' }
    ],
    guide: 'B(billion) 추가: n >= 1e9 분기 추가. 한국식이면 만/억/조로 변경 가능. 소수점 자릿수는 toFixed 인자로 조정 — 금융은 2자리, 일반 통계는 0~1자리.',
    recommendations: [
      { place: '히어로 헤더', body: '대형 통계 — "2.5M 사용자" 류 소셜 프루프' },
      { place: '랜딩 페이지', body: 'SaaS 지표 — MRR, DAU, 전환율 등 큰 숫자' },
      { place: '제품 섹션', body: 'API 호출 횟수 — 일/월 단위 축약' },
      { place: '포트폴리오 소개', body: '포트폴리오 임팩트 — 총 노출 수, 전환 수' }
    ],
    tradeoff: '단위 전환 시(999→1K) 텍스트 길이가 변하여 레이아웃이 흔들릴 수 있음. min-width 설정이나 고정 컨테이너 권장.'
  },

  // ── 06. color-fade ──
  {
    id: 'color-fade', num: '06', title: '컬러 그라데이션 카운터',
    summary: '카운팅이 진행될수록 숫자 색상이 그라데이션으로 전환. 차가운 파랑에서 따뜻한 주황으로 온도 변화 표현.',
    demo: {
      bodyHTML: '<div class="counter-display">\n'
        + '  <span class="counter-value">0</span><span class="counter-suffix">°</span>\n'
        + '</div>\n'
        + '<p class="counter-label">시스템 온도</p>',
      css: '.counter-display { display: flex; align-items: baseline; justify-content: center; gap: 2px; }\n'
        + '.counter-value { font: 800 clamp(80px,12vw,160px)/1 "Pretendard Variable",sans-serif; font-variant-numeric: tabular-nums; transition: color 0.05s linear; }\n'
        + '.counter-suffix { font: 600 clamp(32px,5vw,64px)/1 "Pretendard Variable",sans-serif; transition: color 0.05s linear; }\n'
        + '.counter-label { font: 400 clamp(13px,1.1vw,17px)/1.4 "Pretendard Variable",sans-serif; color: rgba(255,255,255,0.3); margin-top: 16px; letter-spacing: 0.1em; text-transform: uppercase; text-align: center; }',
      js: 'var valEl = document.querySelector(".counter-value");\n'
        + 'var suffEl = document.querySelector(".counter-suffix");\n'
        + 'function lerpColor(a, b, t) {\n'
        + '  var r = Math.round(a[0] + (b[0]-a[0]) * t);\n'
        + '  var g = Math.round(a[1] + (b[1]-a[1]) * t);\n'
        + '  var bl = Math.round(a[2] + (b[2]-a[2]) * t);\n'
        + '  return "rgb(" + r + "," + g + "," + bl + ")";\n'
        + '}\n'
        + 'var C1 = [59,130,246], C2 = [249,115,22];\n'
        + 'function applyReveal(p) {\n'
        + '  var v = Math.round(p * 100);\n'
        + '  valEl.textContent = v;\n'
        + '  var c = lerpColor(C1, C2, p);\n'
        + '  valEl.style.color = c;\n'
        + '  suffEl.style.color = c;\n'
        + '}',
      height: 480
    },
    snippetHTML: '<span class="counter-value">0</span>\n<span class="counter-suffix">°</span>',
    snippetCSS: '.counter-value {\n  font: 800 160px/1 "Pretendard Variable", sans-serif;\n  font-variant-numeric: tabular-nums;\n  transition: color 0.05s linear;\n}',
    snippetJS: 'function lerpColor(a, b, t) {\n  return "rgb(" +\n    Math.round(a[0]+(b[0]-a[0])*t) + "," +\n    Math.round(a[1]+(b[1]-a[1])*t) + "," +\n    Math.round(a[2]+(b[2]-a[2])*t) + ")";\n}\nvar C1=[59,130,246], C2=[249,115,22]; // 파랑→주황\nvar color = lerpColor(C1, C2, progress);',
    explain: 'lerpColor 함수가 두 RGB 색상 사이를 progress에 따라 선형 보간. 0%에서 파랑(#3b82f6), 100%에서 주황(#f97316)으로 자연스러운 온도 변화 표현. inline style로 매 프레임 색상 갱신.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (RGB 선형 보간)' },
      { label: '트리거', value: '페이지 로드 → lerpColor(시작, 끝, p)' },
      { label: '시작색', value: '#3b82f6 (blue-500)' },
      { label: '끝색', value: '#f97316 (orange-500)' },
      { label: '핵심', value: 'RGB 선형 보간 + inline style 매 프레임' },
      { label: '참고', value: 'Framer LoaderCounter Color Fade 옵션' }
    ],
    guide: '3색 이상 그라데이션은 구간 분기 추가 (p<0.5면 C1→C2, 이후 C2→C3). HSL 보간을 쓰면 무지개 효과도 가능. transition:color 0.05s로 미세한 스무딩.',
    recommendations: [
      { place: '히어로 헤더', body: '온도/상태 시각화 — 서버 온도, 위험도 게이지' },
      { place: '랜딩 페이지', body: '진행률 감정 — 초록(안전)→빨강(위험) 전환' },
      { place: '제품 섹션', body: '배터리 잔량 — 초록→노랑→빨강 3단계' },
      { place: '포트폴리오 소개', body: '스킬 레벨 — 난이도에 따른 색상 변화' }
    ],
    tradeoff: 'RGB 선형 보간은 중간 색상이 탁해질 수 있음 (회색대 통과). HSL 보간이 더 자연스럽지만 계산이 복잡.'
  },

  // ── 07. circle-progress ──
  {
    id: 'circle-progress', num: '07', title: '원형 프로그레스',
    summary: 'SVG circle의 stroke-dashoffset으로 원형 프로그레스 링 + 중앙 퍼센티지. 대시보드·로딩 UI의 시그니처.',
    demo: {
      bodyHTML: '<div class="circle-wrap">\n'
        + '  <svg class="circle-svg" viewBox="0 0 200 200">\n'
        + '    <circle class="circle-bg" cx="100" cy="100" r="88" />\n'
        + '    <circle class="circle-fg" cx="100" cy="100" r="88" />\n'
        + '  </svg>\n'
        + '  <div class="circle-text"><span class="counter-value">0</span><span class="counter-suffix">%</span></div>\n'
        + '</div>\n'
        + '<p class="counter-label">달성률</p>',
      css: '.circle-wrap { position: relative; width: clamp(200px,28vw,320px); height: clamp(200px,28vw,320px); }\n'
        + '.circle-svg { width: 100%; height: 100%; transform: rotate(-90deg); }\n'
        + '.circle-bg { fill: none; stroke: rgba(255,255,255,0.08); stroke-width: 8; }\n'
        + '.circle-fg { fill: none; stroke: #3b82f6; stroke-width: 8; stroke-linecap: round; stroke-dasharray: 553; stroke-dashoffset: 553; transition: stroke-dashoffset 0.05s linear; }\n'
        + '.circle-text { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 2px; }\n'
        + '.counter-value { font: 700 clamp(40px,6vw,72px)/1 "Pretendard Variable",sans-serif; color: #fff; font-variant-numeric: tabular-nums; }\n'
        + '.counter-suffix { font: 500 clamp(18px,2.5vw,28px)/1 "Pretendard Variable",sans-serif; color: rgba(255,255,255,0.4); }\n'
        + '.counter-label { font: 400 clamp(13px,1.1vw,17px)/1.4 "Pretendard Variable",sans-serif; color: rgba(255,255,255,0.3); margin-top: 20px; letter-spacing: 0.1em; text-transform: uppercase; text-align: center; }',
      js: 'var valEl = document.querySelector(".counter-value");\n'
        + 'var fg = document.querySelector(".circle-fg");\n'
        + 'var CIRC = 2 * Math.PI * 88; // 553.08\n'
        + 'function applyReveal(p) {\n'
        + '  var v = Math.round(p * 100);\n'
        + '  valEl.textContent = v;\n'
        + '  fg.style.strokeDashoffset = CIRC * (1 - p);\n'
        + '}',
      height: 520
    },
    snippetHTML: '<svg class="circle-svg" viewBox="0 0 200 200">\n  <circle class="circle-bg" cx="100" cy="100" r="88" />\n  <circle class="circle-fg" cx="100" cy="100" r="88" />\n</svg>\n<div class="circle-text">\n  <span class="counter-value">0</span>%\n</div>',
    snippetCSS: '.circle-svg { transform: rotate(-90deg); }\n.circle-bg { fill: none; stroke: rgba(255,255,255,0.08); stroke-width: 8; }\n.circle-fg { fill: none; stroke: #3b82f6; stroke-width: 8;\n  stroke-linecap: round;\n  stroke-dasharray: 553; stroke-dashoffset: 553; }',
    snippetJS: 'var CIRC = 2 * Math.PI * 88; // ≈ 553\nfg.style.strokeDashoffset = CIRC * (1 - progress);\nvalEl.textContent = Math.round(progress * 100);',
    explain: 'SVG circle의 stroke-dasharray=원둘레, stroke-dashoffset=원둘레(0%)→0(100%)으로 채움. rotate(-90deg)로 12시 방향에서 시작. stroke-linecap:round로 끝점 둥글게. 중앙 텍스트는 absolute + flex center.',
    kv: [
      { label: '의존성', value: 'SVG + Vanilla JS (dashoffset 계산)' },
      { label: '트리거', value: '페이지 로드 → strokeDashoffset = 원둘레 × (1-p)' },
      { label: '원 반지름', value: '88px (원둘레 ≈ 553px)' },
      { label: '선 두께', value: '8px (stroke-width)' },
      { label: '핵심', value: 'stroke-dasharray + stroke-dashoffset SVG 트릭' },
      { label: '참고', value: '대시보드 / Apple Watch 활동 링' }
    ],
    guide: '반지름과 stroke-width를 바꾸면 stroke-dasharray 재계산 필요 (2πr). 색상을 progress에 따라 변경하면 멀티톤 링. 여러 링을 중첩(각각 반지름 차이)하면 Apple Watch 스타일.',
    recommendations: [
      { place: '히어로 헤더', body: '목표 달성률 — KPI 대시보드 메인 지표' },
      { place: '랜딩 페이지', body: '고객 만족도 — 원형 게이지로 시각화' },
      { place: '제품 섹션', body: '스토리지 사용량 — 원형 프로그레스 + 용량 표시' },
      { place: '포트폴리오 소개', body: '스킬 숙련도 — 기술별 원형 게이지' }
    ],
    tradeoff: 'SVG가 필수라 순수 CSS만으로는 구현 불가. stroke-dasharray 값이 반지름에 종속 — 반응형 시 JS로 재계산하거나 viewBox 고정.'
  },

  // ── 08. bar-progress ──
  {
    id: 'bar-progress', num: '08', title: '바 프로그레스',
    summary: '수평 바가 좌→우로 채워지며 우측 끝에 퍼센티지 라벨. 가장 직관적인 진행 표현.',
    demo: {
      bodyHTML: '<div class="bar-group">\n'
        + '  <div class="bar-row"><span class="bar-name">디자인</span><div class="bar-track"><div class="bar-fill" data-target="92"></div></div><span class="bar-pct">0%</span></div>\n'
        + '  <div class="bar-row"><span class="bar-name">개발</span><div class="bar-track"><div class="bar-fill" data-target="78"></div></div><span class="bar-pct">0%</span></div>\n'
        + '  <div class="bar-row"><span class="bar-name">마케팅</span><div class="bar-track"><div class="bar-fill" data-target="65"></div></div><span class="bar-pct">0%</span></div>\n'
        + '  <div class="bar-row"><span class="bar-name">운영</span><div class="bar-track"><div class="bar-fill" data-target="88"></div></div><span class="bar-pct">0%</span></div>\n'
        + '</div>',
      css: '.bar-group { width: clamp(320px,50vw,600px); display: flex; flex-direction: column; gap: 28px; }\n'
        + '.bar-row { display: grid; grid-template-columns: 72px 1fr 48px; align-items: center; gap: 16px; }\n'
        + '.bar-name { font: 500 clamp(13px,1vw,16px)/1 "Pretendard Variable",sans-serif; color: rgba(255,255,255,0.5); text-align: right; }\n'
        + '.bar-track { height: 8px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden; }\n'
        + '.bar-fill { height: 100%; width: 0; background: #3b82f6; border-radius: 4px; transition: width 0.05s linear; }\n'
        + '.bar-pct { font: 600 clamp(13px,1vw,16px)/1 "Pretendard Variable",sans-serif; color: #fff; font-variant-numeric: tabular-nums; }',
      js: 'var rows = document.querySelectorAll(".bar-row");\n'
        + 'function applyReveal(p) {\n'
        + '  rows.forEach(function(row, i) {\n'
        + '    var fill = row.querySelector(".bar-fill");\n'
        + '    var pct = row.querySelector(".bar-pct");\n'
        + '    var target = parseInt(fill.dataset.target);\n'
        + '    var stagger = Math.max(0, (p - i * 0.08) / (1 - i * 0.08));\n'
        + '    var v = Math.round(stagger * target);\n'
        + '    fill.style.width = stagger * target + "%";\n'
        + '    pct.textContent = v + "%";\n'
        + '  });\n'
        + '}',
      height: 480
    },
    snippetHTML: '<div class="bar-row">\n  <span class="bar-name">디자인</span>\n  <div class="bar-track">\n    <div class="bar-fill" data-target="92"></div>\n  </div>\n  <span class="bar-pct">0%</span>\n</div>',
    snippetCSS: '.bar-track { height: 8px; background: rgba(255,255,255,0.08);\n  border-radius: 4px; overflow: hidden; }\n.bar-fill { height: 100%; width: 0; background: #3b82f6;\n  border-radius: 4px; transition: width 0.05s linear; }',
    snippetJS: 'rows.forEach(function(row, i) {\n  var target = parseInt(fill.dataset.target);\n  var stagger = Math.max(0, (p - i*0.08) / (1 - i*0.08));\n  fill.style.width = stagger * target + "%";\n  pct.textContent = Math.round(stagger * target) + "%";\n});',
    explain: '각 바는 data-target 값(최대 퍼센티지)을 가지고, stagger 공식으로 순차 진입. stagger = (p - i×0.08) / (1 - i×0.08)로 각 바가 약간의 딜레이를 가지고 채워짐. width와 텍스트를 동시 갱신.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (stagger 계산)' },
      { label: '트리거', value: '페이지 로드 → 각 바 stagger 딜레이' },
      { label: '이징', value: 'linear + stagger 0.08s 간격' },
      { label: '목표값', value: '각 바 독립 (92%, 78%, 65%, 88%)' },
      { label: '핵심', value: 'grid 레이아웃 + data-target + stagger 공식' },
      { label: '참고', value: 'GitHub contributions / Notion 차트' }
    ],
    guide: '바 개수와 target 값은 자유. bar-fill 색상을 각각 다르게 하면 카테고리 구분. height를 12~16px로 키우면 더 시각적. border-radius를 0으로 하면 산업적 느낌.',
    recommendations: [
      { place: '히어로 헤더', body: '팀 역량 — 부서별 역량 비교 차트' },
      { place: '랜딩 페이지', body: '기능 비교 — 경쟁사 대비 우위 시각화' },
      { place: '제품 섹션', body: '스펙 비교표 — 성능 지표 바 차트' },
      { place: '포트폴리오 소개', body: '기술 스택 숙련도 — 언어별 레벨 바' }
    ],
    tradeoff: '바가 많아지면 화면이 단조로워짐. 5개 이상이면 accordion이나 카테고리 그룹 분할 권장.'
  },

  // ── 09. spring-overshoot ──
  {
    id: 'spring-overshoot', num: '09', title: '스프링 오버슈트',
    summary: '목표값을 초과했다가 탄성으로 되돌아오는 스프링 카운터. cubic-bezier 근사로 overshoots + 수렴.',
    demo: {
      bodyHTML: '<div class="counter-display">\n'
        + '  <span class="counter-value">0</span>\n'
        + '</div>\n'
        + '<p class="counter-label">오늘의 주문</p>',
      css: '.counter-display { display: flex; align-items: baseline; justify-content: center; }\n'
        + '.counter-value { font: 800 clamp(80px,12vw,160px)/1 "Pretendard Variable",sans-serif; color: #fff; font-variant-numeric: tabular-nums; letter-spacing: -0.02em; }\n'
        + '.counter-label { font: 400 clamp(13px,1.1vw,17px)/1.4 "Pretendard Variable",sans-serif; color: rgba(255,255,255,0.3); margin-top: 16px; letter-spacing: 0.1em; text-transform: uppercase; text-align: center; }',
      js: 'var valEl = document.querySelector(".counter-value");\n'
        + 'var TARGET = 847;\n'
        + 'function springEase(t) {\n'
        + '  var w = 4.5 * Math.PI;\n'
        + '  return 1 - Math.exp(-6 * t) * Math.cos(w * t);\n'
        + '}\n'
        + 'function applyReveal(p) {\n'
        + '  var v = Math.round(springEase(p) * TARGET);\n'
        + '  valEl.textContent = v.toLocaleString("ko-KR");\n'
        + '  var scale = 1 + Math.abs(springEase(p) - p) * 0.08;\n'
        + '  valEl.style.transform = "scale(" + scale + ")";\n'
        + '}',
      height: 400,
      duration: 2500
    },
    snippetHTML: '<span class="counter-value">0</span>',
    snippetCSS: '.counter-value {\n  font: 800 160px/1 "Pretendard Variable", sans-serif;\n  font-variant-numeric: tabular-nums;\n}',
    snippetJS: 'function springEase(t) {\n  var w = 4.5 * Math.PI; // 진동 주파수\n  return 1 - Math.exp(-6*t) * Math.cos(w * t);\n}\nvar value = Math.round(springEase(progress) * TARGET);\n// overshoot 시 scale 살짝 증가\nvar scale = 1 + Math.abs(springEase(p) - p) * 0.08;',
    explain: 'damped spring 공식: 1 - e^(-6t) × cos(4.5πt). 감쇠 진동이 목표값을 살짝 초과(~108%)했다가 되돌아오기를 1~2회 반복 후 수렴. overshoot 크기에 비례하여 scale도 미세하게 변화(1.0~1.08)하여 "탄성" 느낌.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (damped spring 함수)' },
      { label: '트리거', value: '페이지 로드 → springEase(p) × TARGET' },
      { label: '이징', value: 'damped spring (감쇠율 6, 주파수 4.5π)' },
      { label: '오버슈트', value: '~8% (847 → ~915 → 847)' },
      { label: '핵심', value: 'e^(-dt) × cos(wt) 감쇠 진동 + scale 연동' },
      { label: '참고', value: 'Framer spring() / React Spring' }
    ],
    guide: '감쇠율(6)을 높이면 빠르게 안정, 낮추면 오래 진동. 주파수(4.5π)를 높이면 진동 횟수 증가. scale 연동은 선택 — 없어도 숫자만으로 충분한 동감.',
    recommendations: [
      { place: '히어로 헤더', body: '실시간 통계 — "지금 847건 주문" 류 라이브 느낌' },
      { place: '랜딩 페이지', body: '할인율·카운트다운 — 수치가 튕기는 강조 효과' },
      { place: '제품 섹션', body: '성능 벤치마크 — 스프링으로 목표 초과 강조' },
      { place: '포트폴리오 소개', body: '프로젝트 수 — 숫자에 활력 부여' }
    ],
    tradeoff: '오버슈트가 있어 최종값이 잠깐 목표보다 높게 표시됨 — 정밀한 금액 표시에는 부적합. 통계·지표에 적합.'
  },

  // ── 10. multi-stat ──
  {
    id: 'multi-stat', num: '10', title: '다중 통계 카운터',
    summary: '3~4개 통계 카운터가 stagger 딜레이로 순차 카운팅. 대시보드·About 페이지의 시그니처 패턴.',
    demo: {
      bodyHTML: '<div class="stat-grid">\n'
        + '  <div class="stat-card" data-target="1200" data-suffix="+" data-label="프로젝트">\n'
        + '    <span class="stat-value">0</span><span class="stat-suffix">+</span>\n'
        + '    <span class="stat-label">프로젝트</span>\n'
        + '  </div>\n'
        + '  <div class="stat-card" data-target="98" data-suffix="%" data-label="만족도">\n'
        + '    <span class="stat-value">0</span><span class="stat-suffix">%</span>\n'
        + '    <span class="stat-label">만족도</span>\n'
        + '  </div>\n'
        + '  <div class="stat-card" data-target="50" data-suffix="+" data-label="팀원">\n'
        + '    <span class="stat-value">0</span><span class="stat-suffix">+</span>\n'
        + '    <span class="stat-label">팀원</span>\n'
        + '  </div>\n'
        + '  <div class="stat-card" data-target="99" data-suffix="%" data-label="업타임">\n'
        + '    <span class="stat-value">0</span><span class="stat-suffix">.9%</span>\n'
        + '    <span class="stat-label">업타임</span>\n'
        + '  </div>\n'
        + '</div>',
      css: '.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: clamp(20px,3vw,48px); width: clamp(320px,70vw,900px); }\n'
        + '.stat-card { display: flex; flex-direction: column; align-items: center; gap: 8px; }\n'
        + '.stat-value { font: 800 clamp(36px,5vw,64px)/1 "Pretendard Variable",sans-serif; color: #fff; font-variant-numeric: tabular-nums; }\n'
        + '.stat-suffix { font: 600 clamp(18px,2.5vw,32px)/1 "Pretendard Variable",sans-serif; color: rgba(255,255,255,0.35); }\n'
        + '.stat-card > .stat-value, .stat-card > .stat-suffix { display: inline; }\n'
        + '.stat-card { flex-direction: column; }\n'
        + '.stat-card > :first-child { display: flex; align-items: baseline; gap: 2px; }\n'
        + '.stat-label { font: 400 clamp(12px,1vw,15px)/1.4 "Pretendard Variable",sans-serif; color: rgba(255,255,255,0.3); letter-spacing: 0.1em; text-transform: uppercase; margin-top: 4px; }\n'
        + '.stat-card { flex-wrap: wrap; }\n'
        + '.stat-card { display: flex; flex-direction: column; align-items: center; }\n'
        + '.stat-num-row { display: flex; align-items: baseline; gap: 2px; }',
      js: 'var cards = document.querySelectorAll(".stat-card");\n'
        + 'function easeOutCubic(t) { return 1 - Math.pow(1-t,3); }\n'
        + 'function applyReveal(p) {\n'
        + '  cards.forEach(function(card, i) {\n'
        + '    var target = parseInt(card.dataset.target);\n'
        + '    var stagger = Math.max(0, Math.min(1, (p - i * 0.1) / 0.7));\n'
        + '    var v = Math.round(easeOutCubic(stagger) * target);\n'
        + '    card.querySelector(".stat-value").textContent = v.toLocaleString("ko-KR");\n'
        + '    card.style.opacity = Math.min(1, stagger * 3);\n'
        + '    card.style.transform = "translateY(" + ((1-Math.min(1,stagger*2)) * 16) + "px)";\n'
        + '  });\n'
        + '}',
      height: 400,
      duration: 2500
    },
    snippetHTML: '<div class="stat-grid">\n  <div class="stat-card" data-target="1200">\n    <span class="stat-value">0</span>\n    <span class="stat-suffix">+</span>\n    <span class="stat-label">프로젝트</span>\n  </div>\n  <!-- 반복 -->\n</div>',
    snippetCSS: '.stat-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 48px; }\n.stat-value { font: 800 64px/1 "Pretendard Variable", sans-serif;\n  font-variant-numeric: tabular-nums; }\n.stat-label { font: 400 15px/1.4 "Pretendard Variable", sans-serif;\n  color: rgba(255,255,255,0.3); letter-spacing: 0.1em; }',
    snippetJS: 'cards.forEach(function(card, i) {\n  var target = parseInt(card.dataset.target);\n  var stagger = clamp01((p - i*0.1) / 0.7);\n  var v = Math.round(easeOutCubic(stagger) * target);\n  card.querySelector(".stat-value").textContent = v.toLocaleString();\n  card.style.opacity = Math.min(1, stagger * 3);\n  card.style.transform = "translateY(" + ((1-clamp01(stagger*2))*16) + "px)";\n});',
    explain: '4개 카드가 grid 4열 배치. 각 카드는 data-target으로 목표값을 가지고, stagger 공식으로 i×0.1 딜레이. easeOutCubic으로 감속 카운팅 + opacity·translateY 진입 애니메이션이 동시 적용. 카운팅과 모션이 동시에 일어나 역동적.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (stagger + easeOutCubic)' },
      { label: '트리거', value: '페이지 로드 → 카드별 stagger 0.1 간격' },
      { label: '이징', value: 'easeOutCubic (1-(1-t)³)' },
      { label: '목표값', value: '각 카드 독립 (1,200 / 98% / 50+ / 99.9%)' },
      { label: '핵심', value: 'grid 4열 + data-target + stagger + 진입 모션' },
      { label: '참고', value: 'Stripe / Linear About 페이지 통계 섹션' }
    ],
    guide: '카드 수와 grid-template-columns를 맞춤. 모바일에서는 2열이나 1열로 반응형 전환. suffix를 +, %, K 등으로 자유롭게. stagger 간격(0.1)을 줄이면 거의 동시, 키우면 순차 느낌.',
    recommendations: [
      { place: '히어로 헤더', body: 'About 페이지 — 회사 핵심 지표 4개' },
      { place: '랜딩 페이지', body: '소셜 프루프 — 고객·프로젝트·만족도·연차' },
      { place: '제품 섹션', body: 'SaaS 지표 — 가동률·응답시간·처리량·절감률' },
      { place: '포트폴리오 소개', body: '경력 요약 — 연차·프로젝트·고객·기술 수' }
    ],
    tradeoff: '4개 동시 카운팅이라 시선 분산. 핵심 1개만 강조하려면 단일 카운터가 나음. 모바일에서 4열은 좁아질 수 있음.'
  }
];

/* ================================================================
   Standalone demo HTML 빌더 (auto-play on load)
   ================================================================ */

function buildDemoHTML(p) {
  var dur = p.demo.duration || 2000;
  return '<!DOCTYPE html>\n'
    + '<html lang="ko">\n'
    + '<head>\n'
    + '  <meta charset="UTF-8">\n'
    + '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
    + '  <title>' + p.num + '. ' + p.title + ' — Number Counter Demo</title>\n'
    + '  <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable-dynamic-subset.min.css" rel="stylesheet">\n'
    + '  <style>\n'
    + '    * { box-sizing: border-box; }\n'
    + '    html, body { margin: 0; padding: 0; }\n'
    + '    body { background: #000; color: #fff; font-family: "Pretendard Variable","Pretendard",sans-serif; -webkit-font-smoothing: antialiased; }\n'
    + '    .demo-controls { position: fixed; top: 16px; left: 16px; display: inline-flex; align-items: center; gap: 10px; z-index: 100; }\n'
    + '    .demo-reset { font: 600 11px/1 "Pretendard Variable","Pretendard",sans-serif; color: rgba(255,255,255,0.45); background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1); border-radius: 999px; padding: 8px 14px; cursor: pointer; transition: color 160ms, background 160ms; }\n'
    + '    .demo-reset:hover { color: #fff; background: rgba(255,255,255,0.15); }\n'
    + '    .demo-label { font: 500 10px/1 "Pretendard Variable","Pretendard",sans-serif; color: rgba(255,255,255,0.35); letter-spacing: 0.14em; text-transform: uppercase; }\n'
    + '    .demo-progress { position: fixed; bottom: 0; left: 0; right: 0; height: 2px; background: rgba(255,255,255,0.06); z-index: 100; }\n'
    + '    .demo-progress > div { height: 100%; background: #fff; width: 0; }\n'
    + '    .showcase { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden; }\n'
    + '    ' + p.demo.css.replace(/\n/g, '\n    ') + '\n'
    + '  </style>\n'
    + '</head>\n'
    + '<body>\n'
    + '  <div class="demo-controls">\n'
    + '    <button class="demo-reset" type="button" onclick="window.__reset && window.__reset()">↻ 다시 보기</button>\n'
    + '    <span class="demo-label">' + p.num + ' · ' + p.title + '</span>\n'
    + '  </div>\n'
    + '  <div class="demo-progress"><div></div></div>\n'
    + '\n'
    + '  <main class="showcase">\n'
    + '    ' + p.demo.bodyHTML.replace(/\n/g, '\n    ') + '\n'
    + '  </main>\n'
    + '\n'
    + '  <script>\n'
    + '    (function(){\n'
    + '      var progressFill = document.querySelector(".demo-progress > div");\n'
    + '      var DURATION = ' + dur + ';\n'
    + '      var startTime = Date.now();\n'
    + '      var running = true;\n'
    + '      ' + p.demo.js.replace(/\n/g, '\n      ') + '\n'
    + '      function tick() {\n'
    + '        var elapsed = Date.now() - startTime;\n'
    + '        var p = Math.min(1, elapsed / DURATION);\n'
    + '        progressFill.style.width = (p * 100) + "%";\n'
    + '        applyReveal(p);\n'
    + '        if (p < 1) setTimeout(tick, 16);\n'
    + '        else running = false;\n'
    + '      }\n'
    + '      setTimeout(tick, 16);\n'
    + '      window.__reset = function(){\n'
    + '        startTime = Date.now();\n'
    + '        applyReveal(0);\n'
    + '        if (!running) { running = true; setTimeout(tick, 16); }\n'
    + '      };\n'
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
        embed: 'demos/number-counter/' + p.id + '.html',
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
      { type: 'heading', value: '숫자 카운터 — Framer LoaderCounter 기반 10종 패턴' },
      { type: 'text', value: CATEGORY.summary },
      { type: 'heading', value: '10 패턴 인덱스' },
      { type: 'structure', items: indexItems },
      { type: 'heading', value: '공통 디자인 토큰' },
      {
        type: 'kv', columns: 2, items: [
          { label: '폰트', value: 'Pretendard Variable 700~800' },
          { label: '숫자 크기', value: 'clamp(60px, 10vw, 160px) — 반응형' },
          { label: 'font-variant-numeric', value: 'tabular-nums (고정폭 숫자 필수)' },
          { label: '배경', value: '#000 (검정)' },
          { label: '숫자 색상', value: '#fff (기본) / 패턴별 변형' },
          { label: '라벨 색상', value: 'rgba(255,255,255,0.3) — 보조 텍스트' },
          { label: '애니메이션 모델', value: 'requestAnimationFrame + duration 기반 자동 재생' },
          { label: 'Framer 참고', value: 'LoaderCounter (organic pacing, locale-aware)' }
        ]
      },
      { type: 'heading', value: '읽기 가이드' },
      {
        type: 'structure', items: [
          { label: '라이브 데모', tag: 'IFRAME', desc: 'demos/number-counter/{pattern}.html — 자동 재생 카운터' },
          { label: '작동 원리', tag: 'HOW', desc: 'rAF progress 0→1 → 이징 함수 → 숫자 갱신' },
          { label: '정량 메타', tag: 'KV', desc: '의존성 / 트리거 / 이징 / 목표값 / 핵심 메커니즘' },
          { label: '코드 스니펫', tag: 'CODE', desc: 'HTML / CSS / JS — 패턴별 핵심 코드' },
          { label: '사용 가이드', tag: 'GUIDE', desc: '파라미터·주의점·반응형 대응' },
          { label: '활용 추천', tag: 'PLACES', desc: '히어로 / 랜딩 / 제품 / 포트폴리오 4건' },
          { label: '트레이드오프', tag: 'NOTE', desc: '성능·접근성·권장 사용처' }
        ]
      },
      {
        type: 'note',
        value: 'Framer LoaderCounter 컴포넌트(organic pacing, locale-aware formatting, K/M/B abbreviation, color fade)를 첫 번째 패턴으로 재현하고, 9가지 추가 변형을 비교 카탈로그로 정리. 모든 데모는 검정 배경(#000) + Pretendard Variable + 한국어 라벨 + 페이지 로드 시 자동 재생(rAF).'
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
    console.log('✓ demos/number-counter/' + p.id + '.html');
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
  console.log('✓ analyses/number-counter/analysis.json');
  console.log('  ' + PATTERNS.length + ' patterns + 1 overview = ' + (PATTERNS.length + 1) + ' sections');
  var totalBlocks = Object.values(sections).reduce(function (acc, s) { return acc + s.blocks.length; }, 0);
  console.log('  ' + totalBlocks + ' blocks total');
}

main();
