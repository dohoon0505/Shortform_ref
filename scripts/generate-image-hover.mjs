#!/usr/bin/env node
/**
 * Interaction Lab — Category Generator: Image Hover (v1)
 * Codrops Image Hover Effects 참고 — 10종 이미지 카드 hover 인터랙션 카탈로그
 *
 * - hover 인터랙션 (스크롤 매핑 아님)
 * - 다크 배경(#0a0a0a) + Pretendard Variable + 한국어 캡션
 * - 아트워크는 CSS gradient 레이어로 직접 제작 (외부 이미지 0)
 * - 틸트·슬라이스 2종만 mousemove 좌표 보조, 나머지 8종은 CSS only
 *
 * Usage: node scripts/generate-image-hover.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ANALYSIS_DIR = join(ROOT, 'analyses', 'image-hover');
const ANALYSIS_FILE = join(ANALYSIS_DIR, 'analysis.json');
const DEMO_DIR = join(ROOT, 'demos', 'image-hover');

const CATEGORY = {
  id: 'image-hover',
  title: '이미지 hover',
  type: 'category',
  date: '2026-06-10',
  url: 'https://tympanus.net/codrops/',
  summary: '포트폴리오·작업물 그리드 속 이미지 카드가 hover 순간 줌·필터·클립·틸트로 살아나는 10가지 마이크로 인터랙션. 버튼 hover 카탈로그의 이미지판 — CSS transition 위주라 카드 단위로 즉시 이식 가능.'
};

/* ================================================================
   공통 CSS — 카드 프레임 + CSS gradient 아트워크 3종
   ================================================================ */

const BASE_CSS = ''
  + '.showcase {\n'
  + '  min-height: 100vh; display: flex; flex-wrap: wrap;\n'
  + '  align-items: center; justify-content: center;\n'
  + '  gap: 32px; padding: 48px 40px;\n'
  + '}\n'
  + '.card { margin: 0; width: 240px; cursor: pointer; -webkit-tap-highlight-color: transparent; }\n'
  + '.card-frame {\n'
  + '  position: relative; overflow: hidden;\n'
  + '  height: 300px; border-radius: 16px; background: #111;\n'
  + '  transform: translateZ(0);\n'
  + '}\n'
  + '.card-art { position: absolute; inset: 0; }\n'
  + '.art-aurora { background:\n'
  + '  radial-gradient(90% 70% at 18% 12%, rgba(56,189,248,0.85) 0%, rgba(56,189,248,0) 55%),\n'
  + '  radial-gradient(80% 80% at 82% 22%, rgba(167,139,250,0.9) 0%, rgba(167,139,250,0) 58%),\n'
  + '  radial-gradient(120% 90% at 50% 105%, rgba(34,211,238,0.7) 0%, rgba(34,211,238,0) 60%),\n'
  + '  linear-gradient(180deg, #0b1026 0%, #101630 100%); }\n'
  + '.art-ember { background:\n'
  + '  radial-gradient(85% 70% at 22% 18%, rgba(251,146,60,0.9) 0%, rgba(251,146,60,0) 55%),\n'
  + '  radial-gradient(90% 80% at 80% 70%, rgba(244,63,94,0.8) 0%, rgba(244,63,94,0) 58%),\n'
  + '  radial-gradient(70% 60% at 60% 8%, rgba(253,224,71,0.5) 0%, rgba(253,224,71,0) 55%),\n'
  + '  linear-gradient(180deg, #1c0b10 0%, #220d18 100%); }\n'
  + '.art-moss { background:\n'
  + '  radial-gradient(90% 75% at 25% 80%, rgba(52,211,153,0.85) 0%, rgba(52,211,153,0) 58%),\n'
  + '  radial-gradient(80% 70% at 78% 18%, rgba(163,230,53,0.55) 0%, rgba(163,230,53,0) 55%),\n'
  + '  radial-gradient(70% 80% at 70% 90%, rgba(20,184,166,0.6) 0%, rgba(20,184,166,0) 60%),\n'
  + '  linear-gradient(180deg, #07150f 0%, #0a1a14 100%); }\n'
  + '.card-meta { display: flex; flex-direction: column; gap: 4px; padding: 14px 4px 0; }\n'
  + '.card-title { font: 600 15px/1.3 "Pretendard Variable","Pretendard",sans-serif; color: #fff; }\n'
  + '.card-sub { font: 400 12px/1.4 "Pretendard Variable","Pretendard",sans-serif; color: rgba(255,255,255,0.45); }\n';

/* ================================================================
   공통 코드 스니펫
   ================================================================ */

const SNIPPET_HTML_BASE = '<figure class="card">\n  <div class="card-frame">\n    <div class="card-art"></div>\n  </div>\n  <figcaption class="card-meta">\n    <span class="card-title">오로라 흐름</span>\n    <span class="card-sub">Gradient Study 01</span>\n  </figcaption>\n</figure>';

const SNIPPET_FRAME_CSS = '.card-frame { position: relative; overflow: hidden;\n  border-radius: 16px; }\n.card-art { position: absolute; inset: 0;\n  background: url(work.jpg) center/cover; }';

/* ================================================================
   10 패턴 정의
   ================================================================ */

const PATTERNS = [
  // ── 01. slow-zoom (시그니처) ──
  {
    id: 'slow-zoom', num: '01', title: '슬로우 줌 (시그니처)',
    summary: '이미지 hover의 시그니처. overflow:hidden 프레임 안에서 아트워크가 scale 1→1.08로 천천히 확대되고 캡션이 살짝 떠오르는, 포트폴리오 그리드에서 가장 범용적인 패턴.',
    demo: {
      showcaseHTML: '<main class="showcase">\n'
        + '  <figure class="card">\n'
        + '    <div class="card-frame">\n'
        + '      <div class="card-art art-aurora"></div>\n'
        + '    </div>\n'
        + '    <figcaption class="card-meta">\n'
        + '      <span class="card-title">오로라 흐름</span>\n'
        + '      <span class="card-sub">Gradient Study 01 · 2026</span>\n'
        + '    </figcaption>\n'
        + '  </figure>\n'
        + '  <figure class="card">\n'
        + '    <div class="card-frame">\n'
        + '      <div class="card-art art-ember"></div>\n'
        + '    </div>\n'
        + '    <figcaption class="card-meta">\n'
        + '      <span class="card-title">노을 입자</span>\n'
        + '      <span class="card-sub">Gradient Study 02 · 2026</span>\n'
        + '    </figcaption>\n'
        + '  </figure>\n'
        + '</main>',
      css: '.card-art { transition: transform 0.7s cubic-bezier(0.33,1,0.68,1); will-change: transform; }\n'
        + '.card:hover .card-art { transform: scale(1.08); }\n'
        + '.card-meta { transition: transform 0.45s cubic-bezier(0.33,1,0.68,1); }\n'
        + '.card:hover .card-meta { transform: translateY(-4px); }',
      js: '',
      height: 480
    },
    snippetHTML: SNIPPET_HTML_BASE,
    snippetCSS: SNIPPET_FRAME_CSS + '\n.card-art { transition: transform 0.7s cubic-bezier(0.33,1,0.68,1);\n  will-change: transform; }\n.card:hover .card-art { transform: scale(1.08); }\n.card:hover .card-meta { transform: translateY(-4px); }',
    snippetJS: '// CSS only — JS 불필요\n// 줌 배율 1.05~1.1 / 0.6~0.8s ease-out 계열이 표준\n// hover 해제 시 동일 transition이 역재생되어 자연 복귀',
    explain: 'overflow:hidden 프레임이 핵심. 아트워크(.card-art)가 scale(1→1.08)로 확대되어도 프레임 밖으로 번지지 않고 안에서 천천히 차오르는 느낌을 만든다. 0.7s의 ease-out 계열 이징(cubic-bezier(0.33,1,0.68,1))이 초반에 빠르고 끝에서 미세하게 감속하여 고급스러운 잔향을 남김. 캡션(.card-meta)은 0.45s로 4px 리프트되어 카드 전체가 반응하는 인상을 줌. hover 대상을 .card 전체로 잡아 프레임·캡션이 동시에 반응.',
    kv: [
      { label: '의존성', value: 'CSS only' },
      { label: '트리거', value: ':hover → scale(1→1.08) + 캡션 translateY(-4px)' },
      { label: '이징', value: 'cubic-bezier(0.33,1,0.68,1) — ease-out 계열' },
      { label: 'duration', value: '0.7s (줌) + 0.45s (캡션)' },
      { label: '핵심', value: 'overflow:hidden 프레임 + will-change:transform' },
      { label: '참고', value: 'Codrops Hover Effects / Unsplash·Behance 그리드' }
    ],
    guide: '줌 배율은 1.05~1.1이 적정 — 1.15 이상은 이미지가 뭉개져 보임. duration은 버튼 hover(0.3s대)보다 길게 0.6~0.8s로 잡아야 이미지다운 무게감이 산다. will-change:transform으로 GPU 레이어를 미리 확보하면 첫 hover의 jank 방지. 프레임에 transform:translateZ(0)을 두면 Safari에서 overflow:hidden + scale 조합의 모서리 깨짐을 막을 수 있다.',
    recommendations: [
      { place: '히어로 헤더', body: '히어로 하단 추천 작업물 카드 — 절제된 줌으로 본문 시선 유지' },
      { place: '랜딩 페이지', body: '케이스 스터디 섹션 — 카드 그리드 전체에 일괄 적용해도 과하지 않음' },
      { place: '제품 섹션', body: '제품 썸네일 — 상세 페이지 진입 가능함을 암시하는 기본 피드백' },
      { place: '포트폴리오 소개', body: '작업물 그리드의 디폴트 hover — 모든 포트폴리오의 출발점' }
    ],
    tradeoff: '효과가 절제된 만큼 단독으로는 평범해 보일 수 있음 — 캡션 리프트·디밍 등 보조 모션과 조합 권장. 큰 이미지에서 scale은 GPU 메모리를 쓰므로 한 화면에 수십 장이면 will-change 남용 주의.'
  },

  // ── 02. pan-shift ──
  {
    id: 'pan-shift', num: '02', title: '팬 시프트',
    summary: '프레임보다 30% 넓은 아트워크가 hover 시 translateX로 좌→우 패닝. 가로로 긴 풍경·시네마틱 장면이 카메라 팬처럼 흐르는 효과.',
    demo: {
      showcaseHTML: '<main class="showcase">\n'
        + '  <figure class="card">\n'
        + '    <div class="card-frame">\n'
        + '      <div class="card-art-wide art-aurora"></div>\n'
        + '    </div>\n'
        + '    <figcaption class="card-meta">\n'
        + '      <span class="card-title">오로라 흐름</span>\n'
        + '      <span class="card-sub">좌 → 우 카메라 팬</span>\n'
        + '    </figcaption>\n'
        + '  </figure>\n'
        + '  <figure class="card">\n'
        + '    <div class="card-frame">\n'
        + '      <div class="card-art-wide art-moss"></div>\n'
        + '    </div>\n'
        + '    <figcaption class="card-meta">\n'
        + '      <span class="card-title">이끼 정원</span>\n'
        + '      <span class="card-sub">좌 → 우 카메라 팬</span>\n'
        + '    </figcaption>\n'
        + '  </figure>\n'
        + '</main>',
      css: '.card-art-wide { position: absolute; top: 0; left: 0; width: 130%; height: 100%; transition: transform 0.9s cubic-bezier(0.25,1,0.5,1); will-change: transform; }\n'
        + '.card:hover .card-art-wide { transform: translateX(-23%); }\n'
        + '.card-sub { transition: color 0.4s ease; }\n'
        + '.card:hover .card-sub { color: rgba(255,255,255,0.7); }',
      js: '',
      height: 480
    },
    snippetHTML: '<figure class="card">\n  <div class="card-frame">\n    <div class="card-art-wide"></div>\n  </div>\n  <figcaption class="card-meta">\n    <span class="card-title">오로라 흐름</span>\n  </figcaption>\n</figure>',
    snippetCSS: '.card-frame { position: relative; overflow: hidden;\n  border-radius: 16px; }\n.card-art-wide { position: absolute; top: 0; left: 0;\n  width: 130%; height: 100%;\n  background: url(wide.jpg) center/cover;\n  transition: transform 0.9s cubic-bezier(0.25,1,0.5,1); }\n.card:hover .card-art-wide { transform: translateX(-23%); }',
    snippetJS: '// CSS only — JS 불필요\n// 패닝 거리 = (130 - 100) / 130 ≈ 23% (자기 폭 기준)\n// width를 키울수록 팬이 길어짐 (120~150% 권장)',
    explain: '아트워크를 프레임보다 30% 넓게(width:130%) 깔아두고, hover 시 translateX(-23%)로 좌→우 패닝한다. -23%는 자기 폭 기준 — 여백 30%를 130%로 나눈 값이라 정확히 오른쪽 끝까지 이동한다. 0.9s의 긴 duration이 카메라가 천천히 도는 시네마틱한 인상을 만든다. scale 줌과 달리 픽셀이 뭉개지지 않아 가로로 긴 풍경·도시 야경 이미지에 특히 잘 맞는다.',
    kv: [
      { label: '의존성', value: 'CSS only' },
      { label: '트리거', value: ':hover → translateX(0→-23%)' },
      { label: '이징', value: 'cubic-bezier(0.25,1,0.5,1) — 완만한 ease-out' },
      { label: 'duration', value: '0.9s — 시네마틱 팬 속도' },
      { label: '핵심', value: '아트워크 width:130% + 패닝 여백 30%' },
      { label: '참고', value: '시네마틱 포트폴리오 / 매거진 커버 그리드' }
    ],
    guide: 'translateX 거리는 (확장폭 − 100) ÷ 확장폭으로 계산 — width:140%면 -28.6%. 인물 사진은 얼굴이 잘려 나갈 수 있으니 풍경·건축·추상 이미지에 사용. background-position 애니메이션 대신 translateX를 쓰는 이유는 GPU 합성 — position 전환은 매 프레임 페인트가 발생한다. 우→좌로 바꾸려면 left 대신 right:0 기준으로 +23% 이동.',
    recommendations: [
      { place: '히어로 헤더', body: '히어로 배경 옆 서브 비주얼 카드 — 가로 파노라마 분위기 연출' },
      { place: '랜딩 페이지', body: '갤러리 밴드 섹션 — 와이드 스틸컷이 흐르는 영화적 무드' },
      { place: '제품 섹션', body: '라이프스타일 컷 카드 — 제품 사용 장면을 파노라마로 노출' },
      { place: '포트폴리오 소개', body: '영상·사진 작업 썸네일 — 정지 이미지에 카메라 워크 부여' }
    ],
    tradeoff: '세로 구도 이미지에는 부적합 — 핵심 피사체가 프레임 밖으로 밀려날 수 있음. 아트워크가 30% 더 크게 로드되므로 실사 이미지 사용 시 파일 용량 증가를 감안해야 함.'
  },

  // ── 03. grayscale-release ──
  {
    id: 'grayscale-release', num: '03', title: '그레이스케일 해제',
    summary: '평소엔 filter:grayscale(1)의 흑백 카드가 hover 시 컬러로 돌아오며 살짝 줌. 모노톤 그리드에서 hover한 카드만 살아나는 집중 효과.',
    demo: {
      showcaseHTML: '<main class="showcase">\n'
        + '  <figure class="card">\n'
        + '    <div class="card-frame">\n'
        + '      <div class="card-art art-ember"></div>\n'
        + '    </div>\n'
        + '    <figcaption class="card-meta">\n'
        + '      <span class="card-title">노을 입자</span>\n'
        + '      <span class="card-sub">grayscale(1) → 0</span>\n'
        + '    </figcaption>\n'
        + '  </figure>\n'
        + '  <figure class="card">\n'
        + '    <div class="card-frame">\n'
        + '      <div class="card-art art-aurora"></div>\n'
        + '    </div>\n'
        + '    <figcaption class="card-meta">\n'
        + '      <span class="card-title">오로라 흐름</span>\n'
        + '      <span class="card-sub">grayscale(1) → 0</span>\n'
        + '    </figcaption>\n'
        + '  </figure>\n'
        + '</main>',
      css: '.card-art { filter: grayscale(1); transform: scale(1.01); transition: filter 0.5s ease, transform 0.6s cubic-bezier(0.33,1,0.68,1); will-change: filter, transform; }\n'
        + '.card:hover .card-art { filter: grayscale(0); transform: scale(1.06); }\n'
        + '.card-title { color: rgba(255,255,255,0.75); transition: color 0.4s ease; }\n'
        + '.card:hover .card-title { color: #fff; }',
      js: '',
      height: 480
    },
    snippetHTML: SNIPPET_HTML_BASE,
    snippetCSS: SNIPPET_FRAME_CSS + '\n.card-art { filter: grayscale(1);\n  transition: filter 0.5s ease,\n    transform 0.6s cubic-bezier(0.33,1,0.68,1); }\n.card:hover .card-art { filter: grayscale(0);\n  transform: scale(1.06); }',
    snippetJS: '// CSS only — JS 불필요\n// grayscale 대신 sepia(0.6)·saturate(0.2)로 변형 가능\n// 부분 해제: grayscale(1) → grayscale(0.2)로 톤 유지',
    explain: '기본 상태에서 filter:grayscale(1)로 채도를 완전히 제거해 두고, hover 시 grayscale(0)으로 본래 색을 되돌린다. 색이 돌아오는 0.5s 동안 scale(1.01→1.06) 줌이 동반되어 단순 색 전환보다 카드가 깨어나는 인상이 강해진다. 그리드 전체가 모노톤일 때 hover한 카드 한 장만 컬러가 되므로 시선 집중 효과가 극대화. 캡션 타이틀도 75%→100% 밝기로 동조.',
    kv: [
      { label: '의존성', value: 'CSS only' },
      { label: '트리거', value: ':hover → grayscale(1→0) + scale(1.01→1.06)' },
      { label: '이징', value: 'ease (filter) + ease-out 계열 (transform)' },
      { label: 'duration', value: '0.5s (filter) + 0.6s (줌)' },
      { label: '핵심', value: 'filter:grayscale 전환 + 줌 동반으로 깨어나는 인상' },
      { label: '참고', value: '에이전시 팀원 그리드 / 클라이언트 로고 월' }
    ],
    guide: '브랜드 컬러가 강한 이미지일수록 효과가 극적 — 원본이 이미 저채도면 변화가 안 보인다. 완전 흑백이 부담스러우면 grayscale(0.7) 정도의 부분 적용도 가능. filter 전환은 GPU 가속이 되지만 큰 이미지 수십 장에 동시 적용하면 합성 비용이 커지므로 viewport 안의 카드만 will-change를 주는 것이 안전. 로고 월에서는 줌 없이 filter만 전환하는 편이 정돈되어 보인다.',
    recommendations: [
      { place: '히어로 헤더', body: '히어로 옆 보조 이미지 — 평소 모노톤으로 본문 텍스트와 위계 분리' },
      { place: '랜딩 페이지', body: '고객사 로고·파트너 월 — hover한 로고만 브랜드 컬러로 점등' },
      { place: '제품 섹션', body: '컬러 옵션이 핵심인 제품 그리드 — hover로 실제 색상 확인' },
      { place: '포트폴리오 소개', body: '팀원·작업물 그리드 — 모노톤 무드 유지 + 선택적 컬러 강조' }
    ],
    tradeoff: '평상시 이미지가 흑백이라 컬러가 중요한 콘텐츠(음식·패션)에선 정보 손실. 구형 기기에서 filter 전환이 프레임 드랍을 일으킬 수 있어 카드 수가 많으면 grayscale 단독(줌 제거) 운용 권장.'
  },

  // ── 04. duotone-wash ──
  {
    id: 'duotone-wash', num: '04', title: '듀오톤 워시',
    summary: '단색 오버레이가 mix-blend-mode(color/multiply)로 이미지를 브랜드 톤으로 물들이고 있다가, hover 시 opacity 0으로 걷히며 원본 색이 드러나는 패턴.',
    demo: {
      showcaseHTML: '<main class="showcase">\n'
        + '  <figure class="card">\n'
        + '    <div class="card-frame">\n'
        + '      <div class="card-art art-ember"></div>\n'
        + '      <div class="card-tone tone-color"></div>\n'
        + '    </div>\n'
        + '    <figcaption class="card-meta">\n'
        + '      <span class="card-title">노을 입자</span>\n'
        + '      <span class="card-sub">mix-blend-mode: color</span>\n'
        + '    </figcaption>\n'
        + '  </figure>\n'
        + '  <figure class="card">\n'
        + '    <div class="card-frame">\n'
        + '      <div class="card-art art-moss"></div>\n'
        + '      <div class="card-tone tone-multiply"></div>\n'
        + '    </div>\n'
        + '    <figcaption class="card-meta">\n'
        + '      <span class="card-title">이끼 정원</span>\n'
        + '      <span class="card-sub">mix-blend-mode: multiply</span>\n'
        + '    </figcaption>\n'
        + '  </figure>\n'
        + '</main>',
      css: '.card-tone { position: absolute; inset: 0; pointer-events: none; transition: opacity 0.45s ease; }\n'
        + '.tone-color { background: #3b82f6; mix-blend-mode: color; opacity: 1; }\n'
        + '.tone-multiply { background: #475569; mix-blend-mode: multiply; opacity: 0.9; }\n'
        + '.card:hover .card-tone { opacity: 0; }\n'
        + '.card-art { transition: transform 0.6s cubic-bezier(0.33,1,0.68,1); }\n'
        + '.card:hover .card-art { transform: scale(1.04); }',
      js: '',
      height: 480
    },
    snippetHTML: '<figure class="card">\n  <div class="card-frame">\n    <div class="card-art"></div>\n    <div class="card-tone"></div>\n  </div>\n  <figcaption class="card-meta">\n    <span class="card-title">노을 입자</span>\n  </figcaption>\n</figure>',
    snippetCSS: '.card-frame { position: relative; overflow: hidden;\n  border-radius: 16px; }\n.card-tone { position: absolute; inset: 0;\n  background: #3b82f6;        /* 브랜드 컬러 */\n  mix-blend-mode: color;      /* 또는 multiply */\n  opacity: 1; pointer-events: none;\n  transition: opacity 0.45s ease; }\n.card:hover .card-tone { opacity: 0; }',
    snippetJS: '// CSS only — JS 불필요\n// mix-blend-mode: color → 명도 유지 + 색상만 교체 (듀오톤)\n// mix-blend-mode: multiply → 어둡게 가라앉는 톤 (디밍 겸용)',
    explain: '이미지 위에 단색 div(.card-tone)를 얹고 mix-blend-mode로 섞는다. color 블렌드는 이미지의 명도는 유지한 채 색상만 오버레이 색으로 교체해 정확한 듀오톤을 만들고, multiply는 어둡게 가라앉히는 워시가 된다. hover 시 오버레이의 opacity만 1→0으로 걷어내면 원본 색이 부드럽게 살아난다. filter:grayscale 방식과 달리 브랜드 컬러로 물들일 수 있는 것이 차별점. pointer-events:none으로 hover 판정을 방해하지 않게 처리.',
    kv: [
      { label: '의존성', value: 'CSS only (mix-blend-mode)' },
      { label: '트리거', value: ':hover → 오버레이 opacity 1→0' },
      { label: '이징', value: 'ease' },
      { label: 'duration', value: '0.45s (워시) + 0.6s (보조 줌)' },
      { label: '핵심', value: '단색 div + mix-blend-mode color·multiply 블렌딩' },
      { label: '참고', value: 'Spotify 캠페인 듀오톤 / 브랜딩 사이트 워크 그리드' }
    ],
    guide: '듀오톤 톤은 브랜드 primary 컬러를 그대로 쓰면 그리드 전체가 브랜드 무드로 통일된다. color 블렌드는 배경이 어두울수록 결과도 어두워지므로 명도가 중간 이상인 컬러(#3b82f6 등) 권장. multiply는 #334155~#64748b 같은 슬레이트 계열이 자연스럽다. 오버레이가 텍스트까지 덮지 않도록 캡션은 프레임 밖(.card-meta)에 두거나 z-index로 분리.',
    recommendations: [
      { place: '히어로 헤더', body: '히어로 배경 콜라주 — 브랜드 톤으로 통일했다가 hover로 원색 공개' },
      { place: '랜딩 페이지', body: '캠페인 섹션 — 시즌 컬러 듀오톤 그리드로 무드 연출' },
      { place: '제품 섹션', body: '카테고리 타일 — 카테고리별 컬러 코드 워시 + hover 해제' },
      { place: '포트폴리오 소개', body: '작업물 그리드 — 잡다한 썸네일 색을 한 톤으로 정리' }
    ],
    tradeoff: 'mix-blend-mode는 부모 배경까지 섞일 수 있어 프레임에 overflow:hidden + 불투명 배경이 필요. 구형 브라우저(IE)는 미지원이지만 evergreen은 전부 OK. 원본 색이 가려지므로 색이 곧 정보인 콘텐츠에는 multiply 약하게만.'
  },

  // ── 05. blur-focus ──
  {
    id: 'blur-focus', num: '05', title: '블러 포커스',
    summary: '평소엔 blur(8px)로 흐릿하던 이미지가 hover 시 초점이 맞듯 선명해지는 패턴. scale 보정으로 블러 가장자리 번짐을 숨기는 것이 기술 포인트.',
    demo: {
      showcaseHTML: '<main class="showcase">\n'
        + '  <figure class="card">\n'
        + '    <div class="card-frame">\n'
        + '      <div class="card-art art-aurora"></div>\n'
        + '    </div>\n'
        + '    <figcaption class="card-meta">\n'
        + '      <span class="card-title">오로라 흐름</span>\n'
        + '      <span class="card-sub">blur(8px) → 0</span>\n'
        + '    </figcaption>\n'
        + '  </figure>\n'
        + '  <figure class="card">\n'
        + '    <div class="card-frame">\n'
        + '      <div class="card-art art-ember"></div>\n'
        + '    </div>\n'
        + '    <figcaption class="card-meta">\n'
        + '      <span class="card-title">노을 입자</span>\n'
        + '      <span class="card-sub">blur(8px) → 0</span>\n'
        + '    </figcaption>\n'
        + '  </figure>\n'
        + '</main>',
      css: '.card-art { filter: blur(8px); transform: scale(1.08); transition: filter 0.55s ease, transform 0.55s cubic-bezier(0.33,1,0.68,1); will-change: filter, transform; }\n'
        + '.card:hover .card-art { filter: blur(0); transform: scale(1); }\n'
        + '.card-meta { opacity: 0.55; transition: opacity 0.45s ease; }\n'
        + '.card:hover .card-meta { opacity: 1; }',
      js: '',
      height: 480
    },
    snippetHTML: SNIPPET_HTML_BASE,
    snippetCSS: SNIPPET_FRAME_CSS + '\n.card-art { filter: blur(8px); transform: scale(1.08);\n  transition: filter 0.55s ease,\n    transform 0.55s cubic-bezier(0.33,1,0.68,1); }\n.card:hover .card-art { filter: blur(0); transform: scale(1); }',
    snippetJS: '// CSS only — JS 불필요\n// scale(1.08) 보정: blur는 가장자리가 투명하게 번지므로\n// 블러 상태에서 미리 키워 프레임 밖으로 밀어내 숨긴다',
    explain: '기본 상태가 filter:blur(8px) + scale(1.08), hover 상태가 blur(0) + scale(1)이다. blur는 픽셀이 가장자리 밖으로 번지면서 프레임 테두리에 반투명 띠를 만드는데, 미리 scale(1.08)로 키워 번진 영역을 overflow:hidden 밖으로 밀어내면 깔끔하게 가려진다. hover 시 블러가 풀리며 동시에 scale도 1로 돌아와 카메라 초점이 맞는 순간을 재현. 흐림→선명의 방향이 줌과 반대(축소)라 신선한 리듬을 만든다.',
    kv: [
      { label: '의존성', value: 'CSS only' },
      { label: '트리거', value: ':hover → blur(8px→0) + scale(1.08→1)' },
      { label: '이징', value: 'ease (filter) + ease-out 계열 (transform)' },
      { label: 'duration', value: '0.55s 동기화 — 초점·축소 동시 진행' },
      { label: '핵심', value: 'scale 보정으로 블러 가장자리 번짐 은폐' },
      { label: '참고', value: '갤러리 프리뷰 / 잠금 콘텐츠 티저 UI' }
    ],
    guide: 'blur 강도는 6~10px가 적정 — 12px를 넘으면 무엇인지 식별이 안 되어 클릭 동기가 떨어진다. scale 보정값은 blur 강도에 비례해 1.05~1.1로. filter:blur는 비용이 큰 효과이므로 카드 수가 많은 그리드라면 viewport 진입 카드에만 적용하거나 blur(4px) 수준으로 낮출 것. 텍스트가 이미지 위에 있다면 텍스트는 블러 대상에서 분리해야 가독성이 유지된다.',
    recommendations: [
      { place: '히어로 헤더', body: '히어로 배경 보조 카드 — 평소 흐릿하게 가라앉혀 본문 집중 유도' },
      { place: '랜딩 페이지', body: '미공개 기능 티저 — hover로만 살짝 보여주는 호기심 장치' },
      { place: '제품 섹션', body: '디테일 컷 카드 — 초점이 맞는 순간 디테일 강조' },
      { place: '포트폴리오 소개', body: '심사 중·비공개 작업물 — 블러 상태로 진열하고 hover 시 공개' }
    ],
    tradeoff: 'filter:blur는 GPU 합성 비용이 가장 큰 필터 — 큰 이미지 다수에 동시 적용 시 저사양 기기에서 프레임 드랍. 평상시 콘텐츠가 흐릿해 정보 전달력이 낮으므로 식별이 중요한 그리드의 디폴트로는 부적합.'
  },

  // ── 06. caption-clip ──
  {
    id: 'caption-clip', num: '06', title: '캡션 클립',
    summary: '하단 캡션 바가 clip-path inset(100% 0 0 0)→inset(0)으로 아래에서 슬라이드 인되고 이미지는 살짝 디밍. 정보가 hover 순간에만 나타나는 클래식 오버레이.',
    demo: {
      showcaseHTML: '<main class="showcase">\n'
        + '  <figure class="card">\n'
        + '    <div class="card-frame">\n'
        + '      <div class="card-art art-moss"></div>\n'
        + '      <div class="card-cap">\n'
        + '        <span class="cap-title">이끼 정원</span>\n'
        + '        <span class="cap-sub">Gradient Study 03 · 2026</span>\n'
        + '      </div>\n'
        + '    </div>\n'
        + '  </figure>\n'
        + '  <figure class="card">\n'
        + '    <div class="card-frame">\n'
        + '      <div class="card-art art-aurora"></div>\n'
        + '      <div class="card-cap">\n'
        + '        <span class="cap-title">오로라 흐름</span>\n'
        + '        <span class="cap-sub">Gradient Study 01 · 2026</span>\n'
        + '      </div>\n'
        + '    </div>\n'
        + '  </figure>\n'
        + '</main>',
      css: '.card-cap { position: absolute; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; gap: 4px; padding: 18px 16px 16px; background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.78) 55%, rgba(0,0,0,0.9) 100%); clip-path: inset(100% 0 0 0); transition: clip-path 0.5s cubic-bezier(0.22,1,0.36,1); }\n'
        + '.cap-title { font: 600 15px/1.3 "Pretendard Variable","Pretendard",sans-serif; color: #fff; }\n'
        + '.cap-sub { font: 400 12px/1.4 "Pretendard Variable","Pretendard",sans-serif; color: rgba(255,255,255,0.6); }\n'
        + '.card-art { transition: filter 0.5s ease, transform 0.6s cubic-bezier(0.33,1,0.68,1); }\n'
        + '.card:hover .card-cap { clip-path: inset(0 0 0 0); }\n'
        + '.card:hover .card-art { filter: brightness(0.72); transform: scale(1.04); }',
      js: '',
      height: 480
    },
    snippetHTML: '<figure class="card">\n  <div class="card-frame">\n    <div class="card-art"></div>\n    <div class="card-cap">\n      <span class="cap-title">이끼 정원</span>\n      <span class="cap-sub">Gradient Study 03</span>\n    </div>\n  </div>\n</figure>',
    snippetCSS: '.card-cap { position: absolute; left: 0; right: 0; bottom: 0;\n  padding: 18px 16px 16px;\n  background: linear-gradient(180deg,\n    rgba(0,0,0,0) 0%, rgba(0,0,0,0.9) 100%);\n  clip-path: inset(100% 0 0 0);\n  transition: clip-path 0.5s cubic-bezier(0.22,1,0.36,1); }\n.card:hover .card-cap { clip-path: inset(0 0 0 0); }\n.card:hover .card-art { filter: brightness(0.72); }',
    snippetJS: '// CSS only — JS 불필요\n// translateY 대신 clip-path를 쓰면 캡션이 프레임 안에서\n// "잘려서 나타나는" 마스크 느낌 — overflow 충돌도 없음',
    explain: '캡션 바를 프레임 하단에 absolute로 깔아두고 clip-path:inset(100% 0 0 0)으로 완전히 잘라 숨긴다. hover 시 inset(0)으로 풀리면 위에서부터 잘린 영역이 열리며 슬라이드 인처럼 보인다. translateY 슬라이드와의 차이는 요소가 움직이지 않고 마스크만 열린다는 것 — 그라디언트 배경이 이미지와 자연스럽게 섞인 채 드러난다. 동시에 이미지가 brightness(0.72)로 디밍되어 흰 캡션 텍스트의 대비를 확보.',
    kv: [
      { label: '의존성', value: 'CSS only (clip-path)' },
      { label: '트리거', value: ':hover → clip-path inset(100% 0 0 0 → 0)' },
      { label: '이징', value: 'cubic-bezier(0.22,1,0.36,1) — 끝이 부드러운 ease-out' },
      { label: 'duration', value: '0.5s (클립) + 0.5s (디밍)' },
      { label: '핵심', value: 'clip-path 마스크 오픈 + brightness(0.72) 디밍' },
      { label: '참고', value: 'Codrops Caption Hover Effects / Awwwards 그리드' }
    ],
    guide: '캡션 배경은 단색보다 투명→검정 그라디언트가 이미지와 자연스럽게 섞인다. 디밍은 brightness 0.65~0.8 — 그 이하면 이미지가 죽고, 그 이상이면 텍스트 대비(WCAG 4.5:1)가 부족할 수 있다. 캡션이 프레임 안에 있으므로 키보드 접근성을 위해 :focus-visible에도 같은 상태를 걸어줄 것. 모바일(터치)에서는 hover가 없으니 캡션을 상시 노출하는 미디어쿼리 fallback 권장.',
    recommendations: [
      { place: '히어로 헤더', body: '히어로 그리드 콜라주 — 평소 비주얼만, hover 시 작품 정보 공개' },
      { place: '랜딩 페이지', body: '블로그·아티클 카드 — 제목과 날짜를 hover에서만 노출해 그리드 정돈' },
      { place: '제품 섹션', body: '제품 타일 — 가격·옵션 정보를 캡션 바로 슬라이드 인' },
      { place: '포트폴리오 소개', body: '작업물 그리드 표준 — 프로젝트명·연도·역할을 hover 공개' }
    ],
    tradeoff: '정보가 hover에서만 보이므로 터치 기기에서는 캡션 상시 노출 fallback 필수. clip-path transition은 evergreen 전 브라우저 지원이지만 inset round 보간은 Safari 구버전에서 어긋날 수 있어 직사각 inset만 사용 권장.'
  },

  // ── 07. slice-stagger ──
  {
    id: 'slice-stagger', num: '07', title: '슬라이스 스태거',
    summary: '같은 아트워크를 background-position으로 분담한 4분할 세로 띠가 transition-delay를 엇갈려 상하로 시프트. mousemove 좌표가 기울기를 보조하는 리듬감 있는 패턴.',
    demo: {
      showcaseHTML: '<main class="showcase">\n'
        + '  <figure class="card card-wide">\n'
        + '    <div class="card-frame frame-slices">\n'
        + '      <div class="slice art-aurora"></div>\n'
        + '      <div class="slice art-aurora"></div>\n'
        + '      <div class="slice art-aurora"></div>\n'
        + '      <div class="slice art-aurora"></div>\n'
        + '    </div>\n'
        + '    <figcaption class="card-meta">\n'
        + '      <span class="card-title">오로라 흐름</span>\n'
        + '      <span class="card-sub">4분할 슬라이스 · 커서 좌우로 움직여보세요</span>\n'
        + '    </figcaption>\n'
        + '  </figure>\n'
        + '</main>',
      css: '.card-wide { width: 340px; }\n'
        + '.frame-slices { display: flex; }\n'
        + '.slice { width: 25%; height: 100%; background-size: 400% 100%; transition: transform 0.45s cubic-bezier(0.22,1,0.36,1); will-change: transform; }\n'
        + '.slice:nth-child(1) { background-position: 0% 0; }\n'
        + '.slice:nth-child(2) { background-position: 33.333% 0; transition-delay: 0.05s; }\n'
        + '.slice:nth-child(3) { background-position: 66.667% 0; transition-delay: 0.1s; }\n'
        + '.slice:nth-child(4) { background-position: 100% 0; transition-delay: 0.15s; }',
      js: 'var frame = document.querySelector(".frame-slices");\n'
        + 'var slices = frame.querySelectorAll(".slice");\n'
        + 'var base = [-16, 10, -10, 16];\n'
        + 'frame.addEventListener("mousemove", function(e){\n'
        + '  var rect = frame.getBoundingClientRect();\n'
        + '  var nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;\n'
        + '  var i, ty;\n'
        + '  for (i = 0; i < slices.length; i++) {\n'
        + '    ty = base[i] + nx * 6 * (i - 1.5);\n'
        + '    slices[i].style.transform = "translateY(" + ty.toFixed(1) + "px)";\n'
        + '  }\n'
        + '});\n'
        + 'frame.addEventListener("mouseleave", function(){\n'
        + '  var i;\n'
        + '  for (i = 0; i < slices.length; i++) {\n'
        + '    slices[i].style.transform = "translateY(0)";\n'
        + '  }\n'
        + '});',
      height: 480
    },
    snippetHTML: '<div class="card-frame frame-slices">\n  <div class="slice"></div>\n  <div class="slice"></div>\n  <div class="slice"></div>\n  <div class="slice"></div>\n</div>',
    snippetCSS: '.frame-slices { display: flex; overflow: hidden; }\n.slice { width: 25%; height: 100%;\n  background: url(work.jpg);          /* 같은 아트 공유 */\n  background-size: 400% 100%;         /* 4배 폭으로 분담 */\n  transition: transform 0.45s cubic-bezier(0.22,1,0.36,1); }\n.slice:nth-child(1) { background-position: 0% 0; }\n.slice:nth-child(2) { background-position: 33.333% 0; transition-delay: 0.05s; }\n.slice:nth-child(3) { background-position: 66.667% 0; transition-delay: 0.1s; }\n.slice:nth-child(4) { background-position: 100% 0; transition-delay: 0.15s; }',
    snippetJS: 'frame.addEventListener("mousemove", function(e){\n  var rect = frame.getBoundingClientRect();\n  var nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;\n  for (var i = 0; i < slices.length; i++) {\n    var ty = base[i] + nx * 6 * (i - 1.5);  // base = [-16,10,-10,16]\n    slices[i].style.transform = "translateY(" + ty + "px)";\n  }\n});\nframe.addEventListener("mouseleave", function(){\n  for (var i = 0; i < slices.length; i++) {\n    slices[i].style.transform = "translateY(0)";\n  }\n});',
    explain: '프레임을 4개의 세로 띠(.slice, 각 25% 폭)로 나누고 모든 띠에 같은 배경을 background-size:400% 100%로 깐다. background-position-x를 0%·33.333%·66.667%·100%로 분담하면 띠들이 이어진 한 장의 그림이 된다(퍼센트 포지션 공식: offset = p × (컨테이너 − 이미지)). mousemove에서 커서 X를 -1~1로 정규화해 띠마다 base 오프셋(-16·10·-10·16px) + 기울기 보정(nx × 6 × (i−1.5))을 translateY로 적용 — 커서를 따라 띠들이 파도처럼 출렁인다. transition-delay 0.05s 간격이 enter·leave 모두에서 스태거 리듬을 만든다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (mousemove 좌표 보조)' },
      { label: '트리거', value: 'mousemove → 슬라이스별 translateY (base + 기울기)' },
      { label: '이징', value: 'cubic-bezier(0.22,1,0.36,1) + delay 0.05s 간격 스태거' },
      { label: 'duration', value: '0.45s + 슬라이스당 delay 0~0.15s' },
      { label: '핵심', value: 'background-size 400% 분담 — 같은 아트 4분할 합성' },
      { label: '참고', value: 'Codrops Slice Reveal / 크리에이티브 캠페인 히어로' }
    ],
    guide: '분할 수를 늘리려면 background-size를 N×100%로, position-x를 i/(N−1)×100%로 일반화한다. base 오프셋은 ±10~20px — 그 이상이면 띠 사이 검은 틈이 과해진다. transition-delay가 mousemove 추적에도 적용되어 띠들이 시차를 두고 따라오는 잔물결 느낌이 생기는데, 이게 거슬리면 delay는 클래스 토글 방식으로 분리할 것. 실사 이미지에서는 띠 경계가 1px 어긋나 보일 수 있으니 이미지에 미세한 어두운 보더 톤을 깔면 자연스럽다.',
    recommendations: [
      { place: '히어로 헤더', body: '히어로 메인 비주얼 — 커서를 따라 출렁이는 인터랙티브 키 이미지' },
      { place: '랜딩 페이지', body: '캠페인 인트로 배너 — 슬라이스 리듬으로 강한 첫인상' },
      { place: '제품 섹션', body: '시그니처 제품 1장 강조 — 그리드가 아닌 단독 카드에 사용' },
      { place: '포트폴리오 소개', body: '대표작 히어로 카드 — Awwwards식 실험적 무드 연출' }
    ],
    tradeoff: 'JS 필수 + 마크업이 4배(슬라이스 수만큼)로 늘어남. 터치 기기에서는 mousemove가 없어 정적 이미지로만 보임 — 핵심 정보 전달용이 아닌 장식적 강조에만 사용. 띠가 움직일 때 프레임 배경(#111)이 틈으로 드러나는 것이 의도된 디자인.'
  },

  // ── 08. mouse-tilt ──
  {
    id: 'mouse-tilt', num: '08', title: '마우스 틸트',
    summary: 'perspective 공간에서 커서 좌표를 rotateX/rotateY로 매핑해 카드가 커서를 향해 기우는 3D 틸트. 떠나면 spring 이징으로 복귀하고 하이라이트 글레어가 커서를 따라다님.',
    demo: {
      showcaseHTML: '<main class="showcase">\n'
        + '  <figure class="card">\n'
        + '    <div class="card-frame tilt-frame">\n'
        + '      <div class="card-art art-ember"></div>\n'
        + '      <div class="card-glare"></div>\n'
        + '    </div>\n'
        + '    <figcaption class="card-meta">\n'
        + '      <span class="card-title">노을 입자</span>\n'
        + '      <span class="card-sub">rotateX ±6° / rotateY ±8°</span>\n'
        + '    </figcaption>\n'
        + '  </figure>\n'
        + '  <figure class="card">\n'
        + '    <div class="card-frame tilt-frame">\n'
        + '      <div class="card-art art-moss"></div>\n'
        + '      <div class="card-glare"></div>\n'
        + '    </div>\n'
        + '    <figcaption class="card-meta">\n'
        + '      <span class="card-title">이끼 정원</span>\n'
        + '      <span class="card-sub">spring 복귀 + 글레어</span>\n'
        + '    </figcaption>\n'
        + '  </figure>\n'
        + '</main>',
      css: '.tilt-frame { will-change: transform; }\n'
        + '.card-glare { position: absolute; inset: -40%; background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0) 55%); opacity: 0; transition: opacity 0.3s ease; pointer-events: none; }',
      js: 'var frames = document.querySelectorAll(".tilt-frame");\n'
        + 'var i;\n'
        + 'for (i = 0; i < frames.length; i++) {\n'
        + '  (function(frame){\n'
        + '    var glare = frame.querySelector(".card-glare");\n'
        + '    frame.addEventListener("mousemove", function(e){\n'
        + '      var rect = frame.getBoundingClientRect();\n'
        + '      var px = (e.clientX - rect.left) / rect.width;\n'
        + '      var py = (e.clientY - rect.top) / rect.height;\n'
        + '      var ry = (px - 0.5) * 16;\n'
        + '      var rx = (0.5 - py) * 12;\n'
        + '      frame.style.transition = "transform 0.12s ease-out";\n'
        + '      frame.style.transform = "perspective(700px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg)";\n'
        + '      glare.style.opacity = "1";\n'
        + '      glare.style.transform = "translate(" + ((px - 0.5) * 60).toFixed(1) + "%, " + ((py - 0.5) * 60).toFixed(1) + "%)";\n'
        + '    });\n'
        + '    frame.addEventListener("mouseleave", function(){\n'
        + '      frame.style.transition = "transform 0.6s cubic-bezier(0.34,1.56,0.64,1)";\n'
        + '      frame.style.transform = "perspective(700px) rotateX(0deg) rotateY(0deg)";\n'
        + '      glare.style.opacity = "0";\n'
        + '    });\n'
        + '  })(frames[i]);\n'
        + '}',
      height: 480
    },
    snippetHTML: '<figure class="card">\n  <div class="card-frame tilt-frame">\n    <div class="card-art"></div>\n    <div class="card-glare"></div>\n  </div>\n</figure>',
    snippetCSS: '.tilt-frame { will-change: transform; }\n.card-glare { position: absolute; inset: -40%;\n  background: radial-gradient(circle at 50% 50%,\n    rgba(255,255,255,0.32) 0%, rgba(255,255,255,0) 55%);\n  opacity: 0; transition: opacity 0.3s ease;\n  pointer-events: none; }',
    snippetJS: 'frame.addEventListener("mousemove", function(e){\n  var rect = frame.getBoundingClientRect();\n  var px = (e.clientX - rect.left) / rect.width;   // 0~1\n  var py = (e.clientY - rect.top) / rect.height;   // 0~1\n  var ry = (px - 0.5) * 16;   // rotateY ±8°\n  var rx = (0.5 - py) * 12;   // rotateX ±6°\n  frame.style.transition = "transform 0.12s ease-out";\n  frame.style.transform = "perspective(700px) rotateX(" + rx\n    + "deg) rotateY(" + ry + "deg)";\n  glare.style.transform = "translate(" + ((px-0.5)*60) + "%, "\n    + ((py-0.5)*60) + "%)";\n});\nframe.addEventListener("mouseleave", function(){\n  frame.style.transition =\n    "transform 0.6s cubic-bezier(0.34,1.56,0.64,1)";  // spring\n  frame.style.transform = "perspective(700px) rotateX(0) rotateY(0)";\n});',
    explain: 'mousemove에서 커서 좌표를 0~1로 정규화(px·py)한 뒤 rotateY = (px−0.5)×16, rotateX = (0.5−py)×12로 매핑 — 커서가 있는 쪽 모서리가 화면 앞으로 기운다. 추적 중에는 transition을 0.12s ease-out으로 짧게 두어 커서를 민첩하게 따르고, mouseleave에서 0.6s spring 이징(cubic-bezier(0.34,1.56,0.64,1))으로 바꿔치기해 탄성 있게 0°로 복귀한다. 글레어는 프레임보다 80% 큰 radial-gradient를 커서 방향으로 translate해 빛 반사가 따라다니는 입체감을 더한다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (mousemove 좌표 매핑)' },
      { label: '트리거', value: 'mousemove → rotateX ±6° / rotateY ±8°' },
      { label: '이징', value: '추적 0.12s ease-out / 복귀 spring cubic-bezier(0.34,1.56,0.64,1)' },
      { label: 'duration', value: '0.12s (추적) + 0.6s (spring 복귀)' },
      { label: '핵심', value: 'perspective(700px) + 정규화 좌표 매핑 + 글레어 동행' },
      { label: '참고', value: 'Apple TV 포스터 / Stripe 카드 틸트' }
    ],
    guide: '회전각은 ±5~10°가 적정 — ±15° 이상은 멀미 유발. perspective는 600~900px, 작을수록 왜곡이 극적이다. 추적 transition을 0으로 두면 기계적이고, 0.2s 이상이면 끌리는 느낌이 나므로 0.1~0.15s가 황금 구간. 글레어는 mix-blend-mode:overlay를 더하면 실사 이미지에서 더 자연스럽다. prefers-reduced-motion 사용자에게는 틸트를 끄는 미디어쿼리 처리 권장.',
    recommendations: [
      { place: '히어로 헤더', body: '히어로 옆 제품·앱 목업 카드 — 커서 반응으로 시선 고정' },
      { place: '랜딩 페이지', body: '요금제·기능 카드 — 미세 틸트로 프리미엄 질감 부여' },
      { place: '제품 섹션', body: '제품 패키지 샷 — 포스터를 들여다보는 듯한 3D 질감' },
      { place: '포트폴리오 소개', body: '대표작 카드 — Apple TV 포스터식 인터랙션으로 차별화' }
    ],
    tradeoff: 'JS 필수 + mousemove가 고빈도 이벤트라 카드가 많으면 rAF throttle 고려. 터치 기기에서는 동작하지 않으므로 장식적 강조로만. 과한 각도·빠른 추적은 어지러움을 유발할 수 있어 prefers-reduced-motion 대응이 사실상 필수.'
  },

  // ── 09. frame-inset ──
  {
    id: 'frame-inset', num: '09', title: '프레임 인셋',
    summary: 'hover 시 이미지가 clip-path inset 0→24px로 수축하며 주변에 여백 액자가 생기고 바깥 보더가 떠오르는 패턴. 갤러리 매트(passe-partout)를 두른 듯한 절제된 효과.',
    demo: {
      showcaseHTML: '<main class="showcase">\n'
        + '  <figure class="card">\n'
        + '    <div class="card-frame">\n'
        + '      <div class="card-art art-aurora"></div>\n'
        + '    </div>\n'
        + '    <figcaption class="card-meta">\n'
        + '      <span class="card-title">오로라 흐름</span>\n'
        + '      <span class="card-sub">inset(0 → 24px) 액자화</span>\n'
        + '    </figcaption>\n'
        + '  </figure>\n'
        + '  <figure class="card">\n'
        + '    <div class="card-frame">\n'
        + '      <div class="card-art art-ember"></div>\n'
        + '    </div>\n'
        + '    <figcaption class="card-meta">\n'
        + '      <span class="card-title">노을 입자</span>\n'
        + '      <span class="card-sub">inset(0 → 24px) 액자화</span>\n'
        + '    </figcaption>\n'
        + '  </figure>\n'
        + '</main>',
      css: '.card-frame { background: #0d0d0d; border: 1px solid rgba(255,255,255,0); transition: border-color 0.4s ease; }\n'
        + '.card-art { clip-path: inset(0px round 16px); transition: clip-path 0.5s cubic-bezier(0.22,1,0.36,1); }\n'
        + '.card:hover .card-art { clip-path: inset(24px round 6px); }\n'
        + '.card:hover .card-frame { border-color: rgba(255,255,255,0.28); }\n'
        + '.card-sub { transition: color 0.4s ease; }\n'
        + '.card:hover .card-sub { color: rgba(255,255,255,0.7); }',
      js: '',
      height: 480
    },
    snippetHTML: SNIPPET_HTML_BASE,
    snippetCSS: '.card-frame { position: relative; overflow: hidden;\n  border-radius: 16px; background: #0d0d0d;\n  border: 1px solid rgba(255,255,255,0);\n  transition: border-color 0.4s ease; }\n.card-art { position: absolute; inset: 0;\n  clip-path: inset(0px round 16px);\n  transition: clip-path 0.5s cubic-bezier(0.22,1,0.36,1); }\n.card:hover .card-art { clip-path: inset(24px round 6px); }\n.card:hover .card-frame { border-color: rgba(255,255,255,0.28); }',
    snippetJS: '// CSS only — JS 불필요\n// padding 전환과 달리 clip-path는 레이아웃 리플로우 없이\n// 합성 단계에서만 처리 — 60fps 보장',
    explain: '이미지에 clip-path:inset(0px round 16px)을 기본으로 두고, hover 시 inset(24px round 6px)으로 사방을 24px씩 잘라낸다. 잘린 영역으로 프레임 배경(#0d0d0d)이 드러나며 갤러리 액자의 매트(여백)처럼 보이고, 동시에 투명하던 1px 보더가 떠올라 액자 테두리를 완성한다. padding이나 width 전환과 달리 clip-path는 레이아웃을 건드리지 않아 주변 그리드가 전혀 흔들리지 않고, round 값도 16px→6px로 함께 보간되어 모서리 곡률이 자연스럽게 조여진다.',
    kv: [
      { label: '의존성', value: 'CSS only (clip-path)' },
      { label: '트리거', value: ':hover → clip-path inset(0 → 24px)' },
      { label: '이징', value: 'cubic-bezier(0.22,1,0.36,1)' },
      { label: 'duration', value: '0.5s (클립) + 0.4s (보더)' },
      { label: '핵심', value: 'inset 수축 → 프레임 배경이 여백 액자(매트)로 노출' },
      { label: '참고', value: '갤러리·전시 사이트 / 에디토리얼 매거진 그리드' }
    ],
    guide: '인셋 값은 카드 폭의 8~12%(240px 카드면 20~28px)가 균형 잡힌 매트 비율. 프레임 배경색이 매트 색이 되므로 라이트 테마에서는 #f5f5f0 같은 종이색으로. round 값을 시작·끝 모두 명시해야 곡률 보간이 정확하다(생략 시 0으로 점프). 보더는 1px + 40% 이하 투명도가 품위 있음 — 두꺼우면 액자가 아니라 버튼처럼 보인다. 줌 계열과 반대로 "물러나는" 모션이라 클릭 유도보다는 감상 유도에 적합.',
    recommendations: [
      { place: '히어로 헤더', body: '아트·전시 사이트 히어로 — 작품이 액자에 걸리는 우아한 인사' },
      { place: '랜딩 페이지', body: '브랜드 스토리 섹션 — 절제된 모션으로 고급 무드 유지' },
      { place: '제품 섹션', body: '럭셔리 제품 카드 — 물러나며 여백을 만드는 절제미' },
      { place: '포트폴리오 소개', body: '사진·그래픽 포트폴리오 — 갤러리 전시 메타포 그 자체' }
    ],
    tradeoff: '이미지가 작아지는 방향이라 "확대해서 보여주는" 일반 hover 문법과 반대 — 사용자에 따라 후퇴로 느낄 수 있음. clip-path round 보간은 모든 evergreen에서 동작하지만 매우 구형 Safari에서는 곡률이 튀므로 round 없이 직각 inset으로 폴백 가능.'
  },

  // ── 10. color-wash ──
  {
    id: 'color-wash', num: '10', title: '컬러 워시 페이드',
    summary: 'hover 시 브랜드 그라디언트 오버레이가 opacity 0→1로 차오르고 제목이 translateY 리프트로 떠오르며 ↗ 화살표가 등장. 클릭 가능함을 가장 명확히 알리는 마무리 패턴.',
    demo: {
      showcaseHTML: '<main class="showcase">\n'
        + '  <figure class="card">\n'
        + '    <div class="card-frame">\n'
        + '      <div class="card-art art-moss"></div>\n'
        + '      <div class="card-wash wash-blue">\n'
        + '        <span class="wash-arrow">↗</span>\n'
        + '        <span class="wash-title">이끼 정원</span>\n'
        + '        <span class="wash-sub">Gradient Study 03 · 케이스 보기</span>\n'
        + '      </div>\n'
        + '    </div>\n'
        + '  </figure>\n'
        + '  <figure class="card">\n'
        + '    <div class="card-frame">\n'
        + '      <div class="card-art art-aurora"></div>\n'
        + '      <div class="card-wash wash-ember">\n'
        + '        <span class="wash-arrow">↗</span>\n'
        + '        <span class="wash-title">오로라 흐름</span>\n'
        + '        <span class="wash-sub">Gradient Study 01 · 케이스 보기</span>\n'
        + '      </div>\n'
        + '    </div>\n'
        + '  </figure>\n'
        + '</main>',
      css: '.card-wash { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: flex-end; gap: 4px; padding: 20px; opacity: 0; transition: opacity 0.45s ease; }\n'
        + '.wash-blue { background: linear-gradient(165deg, rgba(59,130,246,0.85) 0%, rgba(147,51,234,0.88) 100%); }\n'
        + '.wash-ember { background: linear-gradient(165deg, rgba(251,113,133,0.85) 0%, rgba(217,70,239,0.88) 100%); }\n'
        + '.wash-title { font: 700 18px/1.3 "Pretendard Variable","Pretendard",sans-serif; color: #fff; transform: translateY(10px); opacity: 0; transition: transform 0.45s cubic-bezier(0.22,1,0.36,1) 0.05s, opacity 0.4s ease 0.05s; }\n'
        + '.wash-sub { font: 400 12px/1.4 "Pretendard Variable","Pretendard",sans-serif; color: rgba(255,255,255,0.85); transform: translateY(10px); opacity: 0; transition: transform 0.45s cubic-bezier(0.22,1,0.36,1) 0.1s, opacity 0.4s ease 0.1s; }\n'
        + '.wash-arrow { position: absolute; top: 16px; right: 16px; font-size: 22px; color: #fff; transform: translate(-8px, 8px); opacity: 0; transition: transform 0.45s cubic-bezier(0.22,1,0.36,1) 0.12s, opacity 0.4s ease 0.12s; }\n'
        + '.card:hover .card-wash { opacity: 1; }\n'
        + '.card:hover .wash-title, .card:hover .wash-sub { transform: translateY(0); opacity: 1; }\n'
        + '.card:hover .wash-arrow { transform: translate(0, 0); opacity: 1; }',
      js: '',
      height: 480
    },
    snippetHTML: '<figure class="card">\n  <div class="card-frame">\n    <div class="card-art"></div>\n    <div class="card-wash">\n      <span class="wash-arrow">↗</span>\n      <span class="wash-title">이끼 정원</span>\n      <span class="wash-sub">케이스 보기</span>\n    </div>\n  </div>\n</figure>',
    snippetCSS: '.card-wash { position: absolute; inset: 0;\n  display: flex; flex-direction: column;\n  justify-content: flex-end; padding: 20px;\n  background: linear-gradient(165deg,\n    rgba(59,130,246,0.85), rgba(147,51,234,0.88));\n  opacity: 0; transition: opacity 0.45s ease; }\n.wash-title { transform: translateY(10px); opacity: 0;\n  transition: transform 0.45s cubic-bezier(0.22,1,0.36,1) 0.05s,\n    opacity 0.4s ease 0.05s; }\n.wash-arrow { position: absolute; top: 16px; right: 16px;\n  transform: translate(-8px, 8px); opacity: 0;\n  transition: transform 0.45s ease 0.12s, opacity 0.4s ease 0.12s; }\n.card:hover .card-wash { opacity: 1; }\n.card:hover .wash-title { transform: translateY(0); opacity: 1; }\n.card:hover .wash-arrow { transform: translate(0, 0); opacity: 1; }',
    snippetJS: '// CSS only — JS 불필요\n// 요소별 transition-delay(0.05/0.1/0.12s)가 워시 → 제목\n// → 서브 → 화살표 순의 미니 시퀀스를 만든다',
    explain: '그라디언트 오버레이(.card-wash)가 opacity 0→1로 차오르는 것이 1막, 그 위 텍스트들이 transition-delay를 0.05s씩 엇갈려 translateY(10px→0)로 떠오르는 것이 2막이다. 워시(0s) → 제목(0.05s) → 서브(0.1s) → ↗ 화살표(0.12s) 순서의 미니 시퀀스가 350ms 안에 끝나 hover 치고는 풍부하지만 굼뜨지 않다. 우상단 ↗ 화살표는 translate(-8px,8px)→(0,0)으로 대각선 진입해 "외부로 이동"의 어포던스를 완성. 클릭 가능한 카드임을 가장 명확하게 전달하는 패턴.',
    kv: [
      { label: '의존성', value: 'CSS only' },
      { label: '트리거', value: ':hover → 워시 opacity 0→1 + 텍스트 리프트' },
      { label: '이징', value: 'ease (워시) + ease-out 계열 (리프트), delay 0.05~0.12s' },
      { label: 'duration', value: '0.45s × 4요소 스태거 — 총 체감 0.6s' },
      { label: '핵심', value: '그라디언트 워시 + translateY 리프트 + ↗ 어포던스' },
      { label: '참고', value: 'Awwwards 케이스 스터디 그리드 / 에이전시 워크 리스트' }
    ],
    guide: '워시 투명도는 0.8~0.9 — 1.0이면 이미지가 완전히 죽고, 0.7 이하면 텍스트 대비가 부족하다. 그라디언트는 브랜드 primary→secondary 대각선(150~170deg)이 표준. 요소별 delay는 0.04~0.06s 간격이 자연스럽고 0.1s를 넘으면 굼떠 보인다. 화살표는 실제 링크 이동과 방향을 일치시킬 것(외부 링크 ↗, 내부 상세 →). 카드 전체를 a 태그로 감싸고 :focus-visible에도 동일 상태를 걸면 키보드 접근성까지 해결.',
    recommendations: [
      { place: '히어로 헤더', body: '히어로 추천 콘텐츠 카드 — 클릭 유도가 필요한 첫 화면 CTA 카드' },
      { place: '랜딩 페이지', body: '블로그·리소스 그리드 — 제목+화살표로 이동 어포던스 명시' },
      { place: '제품 섹션', body: '제품 카드 — "자세히 보기" 어포던스를 워시로 통합' },
      { place: '포트폴리오 소개', body: '케이스 스터디 그리드 — Awwwards식 워크 리스트의 표준 마무리' }
    ],
    tradeoff: '오버레이가 이미지를 거의 덮으므로 비주얼 감상이 목적인 갤러리에는 과함. 요소 4개의 transition이 동시에 돌지만 모두 transform·opacity라 성능 부담은 낮음. 터치 기기에서는 제목·화살표가 안 보이므로 캡션 상시 노출 fallback 필요.'
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
    + '  <title>' + p.num + '. ' + p.title + ' — Image Hover Demo</title>\n'
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
    + '  <div class="demo-hint">카드에 호버해보세요 ↗</div>\n'
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
        embed: 'demos/image-hover/' + p.id + '.html',
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
      { type: 'heading', value: '이미지 hover — Codrops 스타일 10종 이미지 카드 인터랙션' },
      { type: 'text', value: CATEGORY.summary },
      { type: 'heading', value: '10 패턴 인덱스' },
      { type: 'structure', items: indexItems },
      { type: 'heading', value: '공통 디자인 토큰' },
      {
        type: 'kv', columns: 2, items: [
          { label: '폰트', value: 'Pretendard Variable (카드 제목 600 15px / 캡션 400 12px)' },
          { label: '카드 프레임', value: '240×300px + border-radius 16px + overflow:hidden' },
          { label: '아트워크', value: 'CSS radial-gradient 4중 레이어 3종 (aurora·ember·moss) — 외부 이미지 0' },
          { label: '배경', value: '#0a0a0a (다크) + 프레임 #111' },
          { label: '이징', value: 'ease-out 계열 cubic-bezier(0.33,1,0.68,1) / spring cubic-bezier(0.34,1.56,0.64,1)' },
          { label: 'duration', value: '0.45~0.9s — 버튼 hover보다 한 박자 느리게' },
          { label: 'hover 대상', value: '.card 전체 — 프레임과 캡션이 동시 반응' },
          { label: '참고', value: 'Codrops Image Hover Effects / Awwwards 포트폴리오 그리드' }
        ]
      },
      { type: 'heading', value: '읽기 가이드' },
      {
        type: 'structure', items: [
          { label: '라이브 데모', tag: 'IFRAME', desc: 'demos/image-hover/{pattern}.html — 이미지 카드 hover 인터랙션' },
          { label: '작동 원리', tag: 'HOW', desc: ':hover → CSS transition / JS mousemove 좌표 매핑' },
          { label: '정량 메타', tag: 'KV', desc: '의존성 / 트리거 / 이징 / duration / 핵심 메커니즘' },
          { label: '코드 스니펫', tag: 'CODE', desc: 'HTML / CSS / JS — 패턴별 핵심 코드' },
          { label: '사용 가이드', tag: 'GUIDE', desc: '파라미터 범위·접근성·터치 기기 fallback' },
          { label: '활용 추천', tag: 'PLACES', desc: '히어로 / 랜딩 / 제품 / 포트폴리오 4건' },
          { label: '트레이드오프', tag: 'NOTE', desc: '성능·접근성·권장 사용처' }
        ]
      },
      {
        type: 'note',
        value: '모든 아트워크는 CSS gradient 레이어로 직접 제작해 외부 이미지 의존성이 0. 틸트(08)·슬라이스(07) 2종만 mousemove 좌표를 보조로 사용하고 나머지 8종은 CSS transition만으로 구현되어 카드 단위로 즉시 이식 가능. 모든 데모는 다크 배경(#0a0a0a) + Pretendard Variable + 한국어 캡션.'
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
    console.log('✓ demos/image-hover/' + p.id + '.html');
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
  console.log('✓ analyses/image-hover/analysis.json');
  console.log('  ' + PATTERNS.length + ' patterns + 1 overview = ' + (PATTERNS.length + 1) + ' sections');
  var totalBlocks = Object.values(sections).reduce(function (acc, s) { return acc + s.blocks.length; }, 0);
  console.log('  ' + totalBlocks + ' blocks total');
}

main();
