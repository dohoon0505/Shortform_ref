// scripts/generate-ktng-flow.mjs
// KT&G 흐름 스케치 1호 보고서 자동 생성기.
// .playwright-mcp/ktng/data/*.json (Playwright MCP로 채집한 26개 페이지 데이터) 를 읽어
// analyses/ktng-com-flow/analysis.json 으로 흐름+스케치 보고서를 빌드한다.
// 각 페이지마다 인라인 SVG 스케치(low-fi wireframe + 손그림 displacement filter) 생성.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, '.playwright-mcp', 'ktng', 'data');
const OUT_DIR = path.join(ROOT, 'analyses', 'ktng-com-flow');
const OUT_FILE = path.join(OUT_DIR, 'analysis.json');

// 페이지 메타: (id, num, sidebarTitle, sectionTitle, group)
const PAGES = [
  { id: 'main',                file: '01-main',                num: '01', title: '메인페이지',                       group: '메인',         purpose: '글로벌 사업 하이라이트·지속가능경영 비전·최신 뉴스·IR을 KV 비디오와 4개 풀폭 섹션으로 묶어 보여주는 코퍼레이트 첫 인상 페이지.' },
  { id: 'about-introduction',  file: '02-about-introduction',  num: '02', title: '회사소개 - KT&G 소개',           group: '회사소개',     purpose: '설립일·매출·임직원 수·사업 포트폴리오·기업 아이덴티티 4개 블록으로 회사 전체 윤곽을 한 페이지에서 압축 전달.' },
  { id: 'about-history',       file: '03-about-history',       num: '03', title: '회사소개 - 연혁',                 group: '회사소개',     purpose: '1987년 창립부터 현재까지 5개 시대(NOW-2021·2020-2012·2011-2002·2001-1987·시작)를 sticky 상단 nav + 연도별 row 27,250px 초장스크롤로 펼침.' },
  { id: 'about-business',      file: '04-about-business',      num: '04', title: '회사소개 - 주요사업',             group: '회사소개',     purpose: 'Modernize 핵심 전략 + 해외궐련·NGP·건강기능식품 3개 사업을 sticky-sequence(배경 고정, 텍스트 카드 스크롤) 패턴으로 순차 노출.' },
  { id: 'about-network',       file: '05-about-network',       num: '05', title: '회사소개 - 글로벌 네트워크',      group: '회사소개',     purpose: 'WebGL 인터랙티브 지구 + 17개 해외 법인·140개국 판매 거점을 법인/지사/공장 카테고리 리스트로 정리.' },
  { id: 'ir-overview',         file: '06-ir-overview',         num: '06', title: '투자정보 - IR 개요',              group: '투자정보',     purpose: 'IR 이벤트 풀폭 스와이퍼 + 라이브 주식정보 + 경영실적 + 신용평가 + IR 행사/공지 4개 카드로 투자자 한 눈에 보기.' },
  { id: 'ir-value',            file: '07-ir-value',            num: '07', title: '투자정보 - 기업가치 제고 계획',   group: '투자정보',     purpose: '주주환원·중장기 이익성장·정책 본문 + 연도별 이행현황 PDF 테이블 2개 블록.' },
  { id: 'ir-governance',       file: '08-ir-governance',       num: '08', title: '투자정보 - 지배구조',             group: '투자정보',     purpose: '기업지배구조 헌장 + 이사회 독립성·감사위원회 카드 + 지배구조 차트(swiper)로 거버넌스 전체 도식.' },
  { id: 'ir-financial',        file: '09-ir-financial',        num: '09', title: '투자정보 - 재무정보',             group: '투자정보',     purpose: '재무하이라이트 iframe(외부 차트 시스템) 임베드 단일 섹션 — 컨테이너만 KT&G UI.' },
  { id: 'ir-stock',            file: '10-ir-stock',            num: '10', title: '투자정보 - 주식정보',             group: '투자정보',     purpose: '주가 차트 iframe(외부 시세 시스템) 임베드 단일 섹션.' },
  { id: 'ir-disclosure',       file: '11-ir-disclosure',       num: '11', title: '투자정보 - 공시정보',             group: '투자정보',     purpose: '공지사항 게시판 — 번호·제목·등록일 컬럼 테이블 + 페이지네이션.' },
  { id: 'ir-archives',         file: '12-ir-archives',         num: '12', title: '투자정보 - IR 자료실',            group: '투자정보',     purpose: 'IR 행사 아카이브 — 연도별 아코디언 + 발표자료 KR/EN PDF 다운로드 리스트.' },
  { id: 'sustain-overview',    file: '13-sustain-overview',    num: '13', title: '지속가능경영 - ESG 개요',         group: '지속가능경영', purpose: '지속가능경영 전략 카드 + ESG 평가 등급 하이라이트 + 환경·사회·지배구조 3개 노력 영역 + ESG 리포트 배너.' },
  { id: 'sustain-env',         file: '14-sustain-env',         num: '14', title: '지속가능경영 - 환경',             group: '지속가능경영', purpose: '환경경영 정책 본문 + Green Impact Pathway 비전 + 정책 다운로드 라이브러리.' },
  { id: 'sustain-social',      file: '15-sustain-social',      num: '15', title: '지속가능경영 - 사회 (안전보건)',  group: '지속가능경영', purpose: '안전보건 경영 정책 본문 + 안전보건 소통마당 바로가기 + 정책/방침 PDF 다운로드.' },
  { id: 'sustain-ethics',      file: '16-sustain-ethics',      num: '16', title: '지속가능경영 - 윤리경영',         group: '지속가능경영', purpose: 'KT&G 윤리경영 헤더 + 윤리경영 조직도 + 주요 윤리경영 활동 카드 + 비윤리행위 신고 안내.' },
  { id: 'sustain-archive',     file: '17-sustain-archive',     num: '17', title: '지속가능경영 - 아카이빙',         group: '지속가능경영', purpose: 'E/S/G 3개 카테고리 sticky 분류 + 분야별 정책 PDF 다운로드 카드 그리드.' },
  { id: 'media-news',          file: '18-media-news',          num: '18', title: '미디어 - 뉴스룸',                 group: '미디어',       purpose: '대표 보도자료 1개 + 보도자료 카드 그리드 + 카드뉴스 그리드 3블록.' },
  { id: 'media-social',        file: '19-media-social',        num: '19', title: '미디어 - 소셜미디어',             group: '미디어',       purpose: '유튜브/인스타그램/페이스북 3개 채널별 카드 그리드 — 각 채널 콘텐츠 N장 더보기.' },
  { id: 'media-library',       file: '20-media-library',       num: '20', title: '미디어 - 라이브러리',             group: '미디어',       purpose: '연도별 필터 + 지면광고 포스터 그리드 28,263px(사이트 최장 갤러리).' },
  { id: 'career-hr',           file: '21-career-hr',           num: '21', title: '인재채용 - 인사제도',             group: '인재채용',     purpose: 'KV → PEOPLE → VALUE → BENEFIT → CAREER 4개 거대 헤딩 섹션으로 가치/제도/보상/교육 스토리텔링.' },
  { id: 'career-job',          file: '22-career-job',          num: '22', title: '인재채용 - 직무소개',             group: '인재채용',     purpose: '직무소개 KV + 마케팅기획·마켓인텔리전스·브랜드매니저·디자인·영업기획·해외영업·국내영업 등 8개 직무 카드 (각 역할·자격요건).' },
  { id: 'career-recruit',      file: '23-career-recruit',      num: '23', title: '인재채용 - 채용가이드',           group: '인재채용',     purpose: '채용가이드 KV + 채용 프로세스 + 채용 자격요건 + 2개 CTA(채용공고/FAQ) + 채용 인터뷰 영상 슬라이더.' },
  { id: 'contact',             file: '24-contact',             num: '24', title: '고객문의',                        group: '기타',         purpose: '고객문의 헤드라인 + 문의 안내 본문 + 카드형 분류(고객 의견·VOC 등) 3개.' },
  { id: 'compliance',          file: '25-compliance',          num: '25', title: '비윤리행위 신고',                 group: '기타',         purpose: '비윤리행위 신고 헤더 + 신고 안내 본문 + 13개 비윤리 사례 카드 그리드 + 외부 신고 채널 링크.' },
  { id: 'safety',              file: '26-safety',              num: '26', title: '안전보건소통마당',                group: '기타',         purpose: '안전보건 소통마당 안내 + 의견 청취 폼 + 안전 관련 게시판 테이블 (32 컬럼·27 리스트 항목).' },
];

// 인터랙션 키워드 → 한국어 동작 라벨
const IX_LABELS = {
  sticky: 'sticky 상단/배경 고정',
  sequence: 'sticky-sequence 카드 시퀀스',
  parallax: 'parallax 깊이감 이동',
  counter: '숫자 카운트업 애니메이션',
  reveal: 'scroll-reveal 진입 fade',
  fade: 'fade 트랜지션',
  slide: '슬라이드 전환',
  swiper: 'Swiper 슬라이더',
  animat: 'CSS @keyframes 또는 JS 애니메이션',
  tab: '탭 전환 UI',
  accordion: '아코디언 펼침',
  table: '데이터 테이블',
  pagin: '페이지네이션',
  list: '리스트 항목',
  card: '카드 컴포넌트',
  form: '입력 폼',
  input: '입력 필드',
  select: '셀렉트',
  faq: 'FAQ 아코디언',
  chart: '차트 컴포넌트',
  ticker: '실시간 시세 ticker',
  org: '조직도',
  year: '연도 라벨',
  history: '연혁 row',
  map: 'WebGL/SVG 지도',
  globe: '지구본',
  particle: '파티클 효과',
  social: '소셜 카드',
  instagram: '인스타그램 임베드',
  youtube: '유튜브 임베드',
  news: '뉴스 카드',
  library: '라이브러리',
  gallery: '갤러리',
  pdf: 'PDF 다운로드',
  job: '직무 카드',
  step: '스텝 인디케이터',
  timeline: '타임라인',
  board: '게시판',
  compli: '컴플라이언스',
  ethic: '윤리경영',
  safety: '안전',
  archive: '아카이빙',
  filter: '필터 칩',
  grid: '그리드 레이아웃',
  index: '인덱스',
  tag: '태그',
};

// ─────────────────── 데이터 로드 ───────────────────
function readPage(file) {
  const p = path.join(DATA_DIR, file + '.json');
  if (!fs.existsSync(p)) throw new Error('missing ' + p);
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

// ─────────────────── SVG 스케치 생성 ───────────────────
// Low-fi wireframe + 손그림(filter) 혼합. 페이지 sH에 비례해 SVG 높이 결정.
function buildSketchSVG(data, page) {
  const VIEWPORT_W = 1200;
  const MAX_H = 1800;          // 너무 긴 페이지는 캡
  const SCALE = 1440 / VIEWPORT_W; // 라이브 1440 → SVG 1200
  let svgH = Math.min(Math.round(data.sH / SCALE), MAX_H);
  if (svgH < 300) svgH = 300;
  const ratio = svgH / data.sH; // 섹션 y/h를 svg 좌표로 변환

  // 손그림 displacement filter (가벼운 wobble)
  const defs = `
    <defs>
      <filter id="rough-${page.id}" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.025" numOctaves="2" seed="${page.num.charCodeAt(0)}"/>
        <feDisplacementMap in="SourceGraphic" scale="1.6"/>
      </filter>
      <pattern id="hatch-${page.id}" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="6" stroke="#cbd5e1" stroke-width="0.8"/>
      </pattern>
      <linearGradient id="hero-${page.id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#1e293b"/>
        <stop offset="1" stop-color="#3f42e5"/>
      </linearGradient>
    </defs>`;

  // 헤더 (상단 고정 GNB) — 60px 일정 표시
  const headerH = Math.round(60 / SCALE);
  let blocks = '';
  blocks += `
    <g class="sk-header">
      <rect x="0" y="0" width="${VIEWPORT_W}" height="${headerH}" fill="#ffffff" stroke="#94a3b8" stroke-width="1"/>
      <text x="32" y="${Math.round(headerH * 0.6) + 4}" font-family="Caveat, Comic Sans MS, cursive" font-size="${Math.max(14, Math.round(headerH * 0.55))}" font-weight="700" fill="#0f172a">KT&amp;G</text>
      <g font-family="Caveat, Comic Sans MS, cursive" font-size="13" fill="#475569">
        <text x="240" y="${Math.round(headerH * 0.6) + 2}">회사소개</text>
        <text x="340" y="${Math.round(headerH * 0.6) + 2}">투자정보</text>
        <text x="440" y="${Math.round(headerH * 0.6) + 2}">지속가능경영</text>
        <text x="560" y="${Math.round(headerH * 0.6) + 2}">미디어</text>
        <text x="640" y="${Math.round(headerH * 0.6) + 2}">인재채용</text>
      </g>
      <g font-family="Caveat, Comic Sans MS, cursive" font-size="11" fill="#94a3b8">
        <text x="${VIEWPORT_W - 200}" y="${Math.round(headerH * 0.6) + 2}">고객문의 · 신고 · 안전 · 🌐</text>
      </g>
    </g>`;

  // 섹션들 — 라이브 y/h 기반
  const sections = (data.sections || []).filter(s => s.h > 100 && s.cls && !s.cls.includes('SVGAnimatedString'));
  // 중복 y 제거 (제일 큰 h만 남김)
  const byY = new Map();
  sections.forEach(s => {
    const k = Math.floor(s.y / 50) * 50;
    if (!byY.has(k) || byY.get(k).h < s.h) byY.set(k, s);
  });
  const ordered = [...byY.values()].sort((a, b) => a.y - b.y);

  // 첫 KV가 헤더와 겹치면 헤더 아래로 미룸
  ordered.forEach(s => {
    const y = Math.max(headerH + 2, Math.round(s.y * ratio));
    const h = Math.max(28, Math.round(s.h * ratio));
    const cls = (s.cls || '').toLowerCase();
    const isKv = cls.includes('kv') || cls.includes('hero');
    const isContainer = cls.includes('container');
    const isFooter = cls.includes('footer');
    // 색상 선택
    let fill = '#f1f5f9'; // 기본 카드 회색
    let stroke = '#94a3b8';
    let textFill = '#475569';
    let kind = '카드/리스트 영역';
    if (isKv) { fill = `url(#hero-${page.id})`; stroke = '#1e293b'; textFill = '#ffffff'; kind = 'KV (히어로 영역)'; }
    else if (cls.includes('sticky')) { fill = `url(#hatch-${page.id})`; stroke = '#0f172a'; textFill = '#0f172a'; kind = 'sticky-sequence 영역'; }
    else if (cls.includes('global')) { fill = '#0f172a'; stroke = '#0f172a'; textFill = '#fbbf24'; kind = 'global WebGL 영역'; }
    else if (cls.includes('sustainability')) { fill = '#064e3b'; stroke = '#10b981'; textFill = '#a7f3d0'; kind = 'sustainability 영역'; }
    else if (cls.includes('strategy')) { fill = '#e0e7ff'; stroke = '#6366f1'; textFill = '#312e81'; kind = '전략 카드'; }
    else if (cls.includes('table') || cls.includes('list') || cls.includes('announce')) { fill = '#ffffff'; stroke = '#cbd5e1'; kind = '테이블/리스트'; }
    else if (cls.includes('iframe')) { fill = '#fef3c7'; stroke = '#f59e0b'; textFill = '#78350f'; kind = 'iframe 외부 임베드'; }
    else if (cls.includes('career') || cls.includes('hrsystem') || cls.includes('value') || cls.includes('benefit') || cls.includes('people')) { fill = '#fef3c7'; stroke = '#d97706'; textFill = '#78350f'; kind = '거대 헤딩 섹션'; }
    else if (cls.includes('history') || cls.includes('year')) { fill = '#ede9fe'; stroke = '#7c3aed'; textFill = '#4c1d95'; kind = '연혁 row'; }
    else if (isFooter) { fill = '#1f2937'; stroke = '#111827'; textFill = '#9ca3af'; kind = 'footer'; }
    const txtSnippet = (s.txt || '').slice(0, 50).replace(/[<&>"']/g, '');
    blocks += `
      <g class="sk-sec" filter="url(#rough-${page.id})">
        <rect x="${isContainer ? 80 : 40}" y="${y}" width="${VIEWPORT_W - (isContainer ? 160 : 80)}" height="${h - 4}" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.4" stroke-dasharray="${isKv || cls.includes('iframe') ? '0' : '4 3'}" opacity="${cls.includes('container--base') || cls.includes('__row') ? 0.5 : 1}"/>
      </g>
      <g class="sk-label">
        <text x="${(isContainer ? 100 : 60)}" y="${y + 22}" font-family="Caveat, Comic Sans MS, cursive" font-size="14" font-weight="700" fill="${textFill}">${kind}</text>
        <text x="${(isContainer ? 100 : 60)}" y="${y + 40}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="10" fill="${textFill}" opacity="0.85">.${(s.cls || '').slice(0, 38)}</text>
        ${txtSnippet ? `<text x="${(isContainer ? 100 : 60)}" y="${y + 56}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="10" fill="${textFill}" opacity="0.7">"${txtSnippet}…"</text>` : ''}
        <text x="${VIEWPORT_W - (isContainer ? 110 : 70)}" y="${y + 22}" text-anchor="end" font-family="ui-monospace, monospace" font-size="9" fill="${textFill}" opacity="0.6">y=${s.y} · h=${s.h}px</text>
      </g>`;
  });

  // 우측 스크롤 인디케이터 (sH 라벨)
  blocks += `
    <g class="sk-scrollbar">
      <line x1="${VIEWPORT_W - 14}" y1="${headerH}" x2="${VIEWPORT_W - 14}" y2="${svgH - 14}" stroke="#cbd5e1" stroke-width="2"/>
      <text x="${VIEWPORT_W - 18}" y="${svgH - 4}" text-anchor="end" font-family="ui-monospace, monospace" font-size="9" fill="#64748b">전체 ${data.sH.toLocaleString()}px</text>
    </g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEWPORT_W} ${svgH}" style="display:block;width:100%;height:auto;background:#fafbfc;border:1px solid #e2e8f0;border-radius:12px;">
    ${defs}
    ${blocks}
  </svg>`;
}

// ─────────────────── 흐름 텍스트 생성 ───────────────────
function buildFlowText(data, page) {
  const secs = (data.sections || []).filter(s => s.h > 200);
  const lines = secs.slice(0, 12).map((s, i) => {
    const cls = (s.cls || '').slice(0, 36);
    const txt = (s.txt || '').slice(0, 80).replace(/\s+/g, ' ');
    return `${i + 1}. y=${s.y} h=${s.h}px · .${cls} → ${txt || '(시각 영역)'}`;
  });
  return lines;
}

// ─────────────────── 인터랙션 시퀀스 ───────────────────
function buildInteractions(data, page) {
  const ix = data.ix || {};
  const items = [];
  Object.keys(ix).forEach(k => {
    const label = IX_LABELS[k] || k;
    items.push({
      label: label,
      tag: ix[k] + '개 요소',
      desc: kwHint(k, ix[k], page)
    });
  });
  if (data.tc) items.unshift({ label: 'CSS transition', tag: data.tc + ' 요소', desc: 'all 0.3s ease-in-out 표준 트랜지션 — 호버·포커스·active 상태 전환을 매끄럽게 처리.' });
  if (data.ac) items.unshift({ label: 'CSS @keyframes animation', tag: data.ac + ' 요소', desc: '명명된 keyframes 애니메이션이 활성. 로딩 인디케이터·로고 모션·반복 효과에 사용.' });
  return items;
}

function kwHint(kw, count, page) {
  switch (kw) {
    case 'sticky': return '뷰포트 상단/배경에 고정된 컨테이너. 스크롤 진행에 따라 자식 콘텐츠가 위로 흐르는 sticky-sequence 패턴.';
    case 'sequence': return '배경/타이틀이 sticky로 멈춘 채 카드 텍스트만 위로 흐르는 시퀀스 영역. KT&G 주요사업 페이지의 핵심 인터랙션.';
    case 'swiper': return 'Swiper.js 기반 슬라이더 — pagination/navigation/fade/auto-play 옵션 사용 추정.';
    case 'slide': return '슬라이드/카드 전환 영역. swiper 또는 자체 캐러셀.';
    case 'tab': return '탭 헤더 클릭 시 본문 패널 전환 — 카테고리/연도/분류 그룹화.';
    case 'accordion': return '아코디언 헤더 클릭 시 본문 펼침/접힘. 연도별 IR 행사 · 정책 카드 등에 사용.';
    case 'fade': return 'opacity 트랜지션 기반 진입/퇴장 효과.';
    case 'reveal': return 'IntersectionObserver 기반 진입 시 fade/translate-Y 트랜지션.';
    case 'counter': return '뷰포트 진입 시 숫자가 0 → target으로 증가하는 카운트업 모션 (requestAnimationFrame 기반).';
    case 'animat': return 'CSS @keyframes 또는 클래스 토글로 명명 애니메이션 트리거.';
    case 'parallax': return '스크롤 progress에 비례해 transform translateY로 배경 이동.';
    case 'globe':
    case 'map': return 'WebGL/Canvas 기반 3D 지구본 또는 인터랙티브 맵 — 마우스 드래그로 회전, 마커 클릭 시 거점 정보 카드 노출.';
    case 'pagin': return '페이지네이션 컨트롤 — 1/2/3/… 숫자 + ←/→ 버튼.';
    case 'list': return '게시판/카드 리스트 — 정렬·필터·다운로드.';
    case 'table': return '데이터 테이블 — 번호·제목·등록일·다운로드 컬럼 표준 패턴.';
    case 'card': return '카드 컴포넌트 — 호버 시 그림자/transform translateY(-4px) 상승.';
    case 'iframe': return '외부 차트/시세 시스템 iframe 임베드 — 컨테이너만 KT&G UI.';
    case 'form': return '입력 폼 — input/select/textarea + submit 버튼.';
    case 'ticker': return '실시간 시세 ticker (KOSPI 연동) — 폴링 또는 WebSocket으로 가격 업데이트.';
    case 'history': return '연혁 row — 연도 라벨 + 월별 이벤트 리스트.';
    case 'year': return '연도 분류 라벨 — sticky 5시대 nav와 연동.';
    case 'org': return '조직도 — 위계 트리.';
    case 'chart': return '데이터 차트 (bar/line).';
    case 'particle': return '캔버스/SVG 파티클 효과 — 배경 장식.';
    case 'social':
    case 'instagram':
    case 'youtube': return '소셜 미디어 카드 — 외부 채널 콘텐츠 임베드.';
    case 'gallery':
    case 'pdf':
    case 'library':
    case 'archive': return '다운로드 자료실 — 카드/리스트 + PDF 링크.';
    case 'news': return '뉴스 카드 — 썸네일 + 제목 + 날짜.';
    case 'job': return '직무 카드 — 역할 설명 + 자격요건 + apply CTA.';
    case 'step':
    case 'timeline': return '스텝 인디케이터 — 채용 프로세스 단계 시각화.';
    case 'compli':
    case 'ethic':
    case 'safety': return '윤리·안전 영역 — 카드/리스트/신고 폼.';
    case 'board': return '게시판 — 번호·제목·작성일.';
    case 'filter': return '필터 칩 — 카테고리 전환 시 list 재정렬.';
    case 'grid': return '그리드 레이아웃.';
    case 'tag': return '태그 라벨.';
    case 'faq': return 'FAQ 아코디언.';
    case 'input': return '입력 필드.';
    case 'select': return '셀렉트 박스.';
    default: return `${kw} 관련 인터랙션 (${count}개 요소).`;
  }
}

// ─────────────────── 페이지 → 섹션 빌더 ───────────────────
function buildPageSection(data, page) {
  const sketchSvg = buildSketchSVG(data, page);
  const flowLines = buildFlowText(data, page);
  const interactions = buildInteractions(data, page);
  const blocks = [];

  // 1. 페이지 개요
  blocks.push({ type: 'heading', value: `${page.title} — 페이지 개요` });
  blocks.push({ type: 'text', value: page.purpose });

  // 2. 라이브 채집 메타
  const topColors = (data.topColors || []).slice(0, 5).map(([c, n]) => `${c} (${n})`).join(', ');
  blocks.push({
    type: 'kv',
    title: '라이브 채집 메타 (Playwright MCP, 1440×900)',
    columns: 2,
    items: [
      { label: '경로', value: data.url || page.id },
      { label: '문서 타이틀', value: data.title || '(none)' },
      { label: '전체 페이지 높이', value: (data.sH || 0).toLocaleString() + 'px' },
      { label: '레이아웃 섹션 수', value: (data.sectionCount || 0) + '개 (높이 80px+)' },
      { label: 'transition 적용 요소', value: (data.tc || 0) + '개 (상위 800)' },
      { label: 'animation @keyframes', value: (data.ac || 0) + '개' },
      { label: '상위 색상 빈도', value: topColors || '(데이터 없음)' },
      { label: '인터랙션 키워드', value: Object.keys(data.ix || {}).map(k => `${k}=${data.ix[k]}`).join(' · ') || '(특이 키워드 없음)' },
    ]
  });

  // 3. SVG 스케치
  blocks.push({
    type: 'component',
    title: `흐름 스케치 — ${page.title} (low-fi wireframe)`,
    fullWidth: true,
    html: `<div class="ktng-sketch-wrap" style="padding:24px;background:#f8fafc;border-radius:12px;">${sketchSvg}<p style="margin:16px 0 0;font:500 12px/1.5 ui-sans-serif,system-ui,sans-serif;color:#64748b;">손그림 필터 + 라이브 섹션 y/h 좌표를 1200×{비례} SVG로 환산한 wireframe. 색상 박스는 섹션 종류를 코드: <span style="color:#0f172a;font-weight:600">검정=KV</span> · <span style="color:#6366f1;font-weight:600">보라=전략카드</span> · <span style="color:#d97706;font-weight:600">호박=거대 헤딩</span> · <span style="color:#10b981;font-weight:600">초록=ESG</span> · <span style="color:#7c3aed;font-weight:600">자주=연혁</span> · <span style="color:#f59e0b;font-weight:600">호박빛=iframe</span>. 점선 박스는 container/row 보조 영역. 우측 막대는 전체 스크롤 길이.</p></div>`,
    css: ''
  });

  // 4. 섹션 시퀀스 (위→아래)
  if (flowLines.length > 0) {
    blocks.push({ type: 'heading', value: '섹션 시퀀스 (위 → 아래)' });
    blocks.push({
      type: 'structure',
      items: flowLines.map((line, i) => {
        const m = line.match(/^(\d+)\. y=(\d+) h=(\d+)px · \.([^→]+)→ (.+)$/);
        if (m) {
          return { label: `y=${m[2]} · h=${m[3]}px`, tag: '.' + m[4].trim(), desc: m[5].trim() };
        }
        return { label: 'sec', desc: line };
      })
    });
  }

  // 5. 인터랙션 시퀀스
  if (interactions.length > 0) {
    blocks.push({ type: 'heading', value: '인터랙션 카탈로그' });
    blocks.push({
      type: 'structure',
      items: interactions
    });
  }

  // 6. 정량 메모
  blocks.push({
    type: 'note',
    value: `Playwright MCP 채집 (2026-05-26 KST). viewport 1440×900, hydration wait 2s. 색상은 getComputedStyle 누적 빈도 상위, 섹션은 main 직속 자식 + [class*=section]·.container > div 매칭. 인터랙션 키워드는 [class*=kw] 매칭 카운트 기반.`
  });

  return {
    title: `${page.num}. ${page.title}`,
    blocks
  };
}

// ─────────────────── 사이트 개요 섹션 ───────────────────
function buildOverviewSection(allData) {
  const totalH = Object.values(allData).reduce((a, d) => a + (d.sH || 0), 0);
  const blocks = [];
  blocks.push({ type: 'heading', value: '레퍼런스 요약' });
  blocks.push({ type: 'text', value: 'KT&G 글로벌 코퍼레이트 사이트(ktng.com) 새 방식 1호 보고서. 종전 \"100% 구현\" 방식(ktng-com)을 폐기하지 않고 별도 ID(ktng-com-flow)로 등록한 \"페이지 흐름 + 스케치\" 보고서. Playwright MCP(Chrome MCP 사용 금지)로 26개 페이지 전수 점검 → 각 페이지마다 라이브 섹션 y/h를 SVG wireframe으로 환산하고, 인터랙션 키워드 인벤토리를 자동 분류했다.' });
  blocks.push({
    type: 'kv',
    title: '전체 사이트 통계 (Playwright MCP 채집 합계)',
    columns: 2,
    items: [
      { label: '분석 페이지', value: Object.keys(allData).length + '개' },
      { label: '페이지 길이 합계', value: totalH.toLocaleString() + 'px' },
      { label: '최장 페이지', value: '회사소개 - 연혁 (27,250px) + 미디어 - 라이브러리 (28,263px)' },
      { label: '최단 페이지', value: '고객문의 (1,317px) · 비윤리행위 신고 (1,578px)' },
      { label: '주요 디자인 토큰', value: 'Pretendard / system-ui sans-serif · 14px body · #000·#FFF·#787878·#3F42E5 액센트 블루' },
      { label: '보고서 방식', value: '페이지별 흐름 텍스트 + 인라인 SVG 스케치 (low-fi wireframe + 손그림 displacement filter)' },
      { label: '실측 도구', value: 'Playwright MCP (Chrome MCP 사용 금지)' },
      { label: '채집 일시', value: '2026-05-26 KST' },
    ]
  });
  blocks.push({
    type: 'sitemap',
    items: [
      { label: '메인', children: ['/'] },
      { label: '회사소개', children: ['/about/introduction', '/about/history', '/about/business', '/about/network/overseas'] },
      { label: '투자정보', children: ['/ir/overview', '/ir/value', '/ir/governance/overview', '/ir/financial-info/financial-highlight', '/ir/stock-info/chart', '/ir/disclosure-info/notices', '/ir/ir-archives/events'] },
      { label: '지속가능경영', children: ['/sustainability/overview', '/sustainability/environment/environmanage', '/sustainability/social/safety', '/sustainability/ethics', '/sustainability/archive/policies'] },
      { label: '미디어', children: ['/media/news/all', '/media/social/all', '/media/library/print'] },
      { label: '인재채용', children: ['/career/hrsystem', '/career/job/marketing-sales', '/career/recruit'] },
      { label: '기타', children: ['/contact-us', '/compliance', '/safety'] },
    ]
  });
  blocks.push({ type: 'heading', value: '읽기 가이드' });
  blocks.push({
    type: 'structure',
    items: [
      { label: '사이드바', tag: 'flowMode', desc: 'KT&G ref 아래 26개 페이지 일자 나열 (그룹화 없음). 각 페이지 = 1개 sidebar 링크 = 1개 보고서 섹션.' },
      { label: '각 페이지 섹션', tag: '6 블록', desc: '(1) 페이지 개요 텍스트 (2) 라이브 채집 메타 kv (3) 인라인 SVG 스케치 (4) 섹션 시퀀스 위→아래 structure (5) 인터랙션 카탈로그 structure (6) 정량 메모 note.' },
      { label: '스케치 색상 코드', tag: '시각 단서', desc: '검정 KV / 보라 전략카드 / 호박 거대헤딩 / 초록 ESG / 자주 연혁 / 호박빛 iframe / 회색 카드/리스트 — 라이브 클래스명 키워드 기반 자동 분류.' },
      { label: '인터랙션 키워드', tag: '자동 매칭', desc: '[class*=sticky/sequence/swiper/animat/tab/counter/...] 매칭 카운트를 한국어 동작 라벨로 변환.' },
      { label: '용도', tag: '디자인 레퍼런스', desc: '실 컴포넌트 코드(분석 ktng-com에 별도 보관)가 아니라 페이지 흐름과 인터랙션 패턴을 디자이너가 한 눈에 훑도록 설계한 스케치 보고서.' },
    ]
  });
  return { title: '00. 사이트 개요 · 읽기 가이드', blocks };
}

// ─────────────────── 메인 ───────────────────
function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const allData = {};
  PAGES.forEach(p => { allData[p.id] = readPage(p.file); });

  const sections = {};
  // 00 overview
  sections['site-overview'] = buildOverviewSection(allData);
  // 01~26 pages
  PAGES.forEach(p => {
    sections[p.id] = buildPageSection(allData[p.id], p);
  });

  const analysis = {
    id: 'ktng-com-flow',
    title: 'KT&G (흐름 스케치 1호)',
    url: 'https://www.ktng.com/',
    date: '2026-05-26',
    summary: 'KT&G 글로벌 코퍼레이트 사이트 26개 페이지 Playwright MCP 정밀 점검 (2026-05-26). 새 방식 1호 — 100% 구현 대신 페이지 흐름 텍스트 + 인라인 SVG 스케치(low-fi wireframe + 손그림 displacement filter). 사이드바 = 페이지 일자 나열 (그룹화 없음). 각 페이지마다 (1) 개요 (2) 라이브 채집 메타 (3) SVG 스케치 (4) 섹션 시퀀스 위→아래 (5) 인터랙션 카탈로그 (6) 정량 메모 6개 블록 표준. 라이브 sH 합계 ' + Object.values(allData).reduce((a, d) => a + (d.sH || 0), 0).toLocaleString() + 'px. 디자인 토큰: Pretendard system-ui sans-serif 14px body + #000/#FFF/#787878/#3F42E5 표준 팔레트. 인터랙션 패턴: 회사소개-연혁 sticky 5시대 nav + 연도별 row 27,250px / 회사소개-주요사업 sticky-sequence 3카드 / 회사소개-글로벌네트워크 WebGL 지구본 / 메인 KV 비디오 + 4 풀폭 섹션 + global canvas. Playwright MCP (Chrome MCP 사용 금지).',
    crawledPages: 26,
    sections
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(analysis, null, 2), 'utf-8');
  const sizeKB = (fs.statSync(OUT_FILE).size / 1024).toFixed(1);
  console.log(`✓ wrote ${OUT_FILE} (${sizeKB} KB, ${Object.keys(sections).length} sections)`);

  // 외부에서 system.json 등록에 쓸 sections meta export
  const sectionsMeta = [
    { id: 'site-overview', num: '00', title: '사이트 개요 · 읽기 가이드', desc: '레퍼런스 요약 + 사이트맵 + 읽기 가이드' },
    ...PAGES.map(p => ({ id: p.id, num: p.num, title: p.title, desc: p.purpose.slice(0, 80) }))
  ];
  fs.writeFileSync(path.join(OUT_DIR, 'sections-meta.json'), JSON.stringify(sectionsMeta, null, 2), 'utf-8');
  console.log(`✓ wrote sections-meta.json (${sectionsMeta.length} entries)`);
}

main();
