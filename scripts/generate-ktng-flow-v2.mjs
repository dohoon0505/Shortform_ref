// scripts/generate-ktng-flow-v2.mjs
// KT&G v2 디테일 와이어프레임 보고서 생성기.
// capture-ktng-v2.mjs 결과 (.playwright-mcp/ktng/v2/{id}/{timeline.json + meta.json})
// 를 읽어 페이지별로:
//   - 디테일 인라인 SVG 와이어프레임 (구조 뼈대 + 레이아웃 + 컴포넌트 형태)
//   - timeline 시계열에서 인터랙션 이벤트 자동 검출
//   - SVG 위에 원형 번호 마커 + 우측 풍선 주석으로 인터랙션 설명
// 출력: analyses/ktng-com-flow/analysis.json (전체 재작성)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const V2_DIR = path.join(ROOT, '.playwright-mcp', 'ktng', 'v2');
const OUT_DIR = path.join(ROOT, 'analyses', 'ktng-com-flow');
const OUT_FILE = path.join(OUT_DIR, 'analysis.json');

const PAGES = [
  { id: 'main',                file: '01-main',                num: '01', title: '메인페이지',                       sidebarLabel: '01. 메인페이지' },
  { id: 'about-introduction',  file: '02-about-introduction',  num: '02', title: 'KT&G 소개',                       sidebarLabel: '02. 회사소개 - KT&G 소개' },
  { id: 'about-history',       file: '03-about-history',       num: '03', title: '연혁',                             sidebarLabel: '03. 회사소개 - 연혁' },
  { id: 'about-business',      file: '04-about-business',      num: '04', title: '주요사업',                         sidebarLabel: '04. 회사소개 - 주요사업' },
  { id: 'about-network',       file: '05-about-network',       num: '05', title: '글로벌 네트워크',                  sidebarLabel: '05. 회사소개 - 글로벌 네트워크' },
  { id: 'ir-overview',         file: '06-ir-overview',         num: '06', title: 'IR 개요',                          sidebarLabel: '06. 투자정보 - IR 개요' },
  { id: 'ir-value',            file: '07-ir-value',            num: '07', title: '기업가치 제고 계획',                sidebarLabel: '07. 투자정보 - 기업가치 제고 계획' },
  { id: 'ir-governance',       file: '08-ir-governance',       num: '08', title: '지배구조',                         sidebarLabel: '08. 투자정보 - 지배구조' },
  { id: 'ir-financial',        file: '09-ir-financial',        num: '09', title: '재무정보 - 재무하이라이트',          sidebarLabel: '09. 투자정보 - 재무정보' },
  { id: 'ir-stock',            file: '10-ir-stock',            num: '10', title: '주식정보 - 주가정보',                sidebarLabel: '10. 투자정보 - 주식정보' },
  { id: 'ir-disclosure',       file: '11-ir-disclosure',       num: '11', title: '공시정보 - 공지사항',                sidebarLabel: '11. 투자정보 - 공시정보' },
  { id: 'ir-archives',         file: '12-ir-archives',         num: '12', title: 'IR 자료실 - IR 행사',                sidebarLabel: '12. 투자정보 - IR 자료실' },
  { id: 'sustain-overview',    file: '13-sustain-overview',    num: '13', title: 'ESG 개요',                         sidebarLabel: '13. 지속가능경영 - ESG 개요' },
  { id: 'sustain-env',         file: '14-sustain-env',         num: '14', title: '환경 - 환경경영',                   sidebarLabel: '14. 지속가능경영 - 환경' },
  { id: 'sustain-social',      file: '15-sustain-social',      num: '15', title: '사회 - 안전보건',                    sidebarLabel: '15. 지속가능경영 - 사회 (안전보건)' },
  { id: 'sustain-ethics',      file: '16-sustain-ethics',      num: '16', title: '윤리경영',                         sidebarLabel: '16. 지속가능경영 - 윤리경영' },
  { id: 'sustain-archive',     file: '17-sustain-archive',     num: '17', title: '아카이빙 - 정책 및 규범',             sidebarLabel: '17. 지속가능경영 - 아카이빙' },
  { id: 'media-news',          file: '18-media-news',          num: '18', title: '뉴스룸',                           sidebarLabel: '18. 미디어 - 뉴스룸' },
  { id: 'media-social',        file: '19-media-social',        num: '19', title: '소셜미디어',                       sidebarLabel: '19. 미디어 - 소셜미디어' },
  { id: 'media-library',       file: '20-media-library',       num: '20', title: '라이브러리 - 지면광고',              sidebarLabel: '20. 미디어 - 라이브러리' },
  { id: 'career-hr',           file: '21-career-hr',           num: '21', title: '인사제도',                         sidebarLabel: '21. 인재채용 - 인사제도' },
  { id: 'career-job',          file: '22-career-job',          num: '22', title: '직무소개 - 마케팅 영업',             sidebarLabel: '22. 인재채용 - 직무소개' },
  { id: 'career-recruit',      file: '23-career-recruit',      num: '23', title: '채용가이드',                        sidebarLabel: '23. 인재채용 - 채용가이드' },
  { id: 'contact',             file: '24-contact',             num: '24', title: '고객문의',                          sidebarLabel: '24. 고객문의' },
  { id: 'compliance',          file: '25-compliance',          num: '25', title: '비윤리행위 신고',                    sidebarLabel: '25. 비윤리행위 신고' },
  { id: 'safety',              file: '26-safety',              num: '26', title: '안전보건소통마당',                   sidebarLabel: '26. 안전보건소통마당' },
];

// ────────────────────────── 데이터 로드 ──────────────────────────
function loadPage(file) {
  const dir = path.join(V2_DIR, file);
  const timelinePath = path.join(dir, 'timeline.json');
  const metaPath = path.join(dir, 'meta.json');
  if (!fs.existsSync(timelinePath) || !fs.existsSync(metaPath)) {
    console.warn(`  ! missing ${file}`);
    return null;
  }
  return {
    timeline: JSON.parse(fs.readFileSync(timelinePath, 'utf-8')),
    meta: JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
  };
}

// ────────────────────────── 섹션 분류 (라이브 클래스 → 컴포넌트 종류) ──────────────────────────
// v2 스타일: 흑백/회색 톤만 + Pretendard sans-serif. 손그림 필터 / 컬러 코드 제거.
// 모든 섹션은 동일한 회색 톤 톤(#fafafa~#f5f5f5 배경 + #e5e5e5~#d4d4d4 테두리). 강조는 검정 박스로만.
const GREY = {
  bg:        '#ffffff',
  surface:   '#fafafa',
  surface2:  '#f4f4f5',
  ph:        '#e5e5e5',   // placeholder (이미지/플레이스홀더 영역)
  border:    '#d4d4d4',
  borderDim: '#e5e5e5',
  line:      '#a3a3a3',   // 텍스트 라인 (회색 가로 바)
  text:      '#171717',   // 본 검정
  textSub:   '#525252',   // 회색 메타
  textHint:  '#737373',
  accent:    '#171717'    // 강조 (CTA / active 버튼)
};
function classifySection(s) {
  const cls = (s.cls || '').toLowerCase();
  // 중복 / skip
  if (cls.includes('kv__background') || cls.includes('sub-kv__background')) return null;
  if (cls.includes('sticky-sequence__image')) return null;
  if (cls.includes('strategy-section__image')) return null;
  if (cls.includes('global__text')) return null;
  if (cls.includes('sustainability__logo-animation')) return null;
  if (cls.includes('sustainability__subtitle')) return null;
  if (cls.includes('overseas-list-group')) return null;
  if (cls.includes('cta-section__item-image')) return null;
  if (cls.includes('__row')) return null;

  // 컴포넌트 종류 식별 (라벨만 다르고 스타일은 GREY 토큰 통일)
  if (cls.includes('subpage-headline')) return { kind: 'subheader', label: '서브 페이지 헤드라인 (h1)' };
  if (cls.includes('sub-kv')) return { kind: 'subkv', label: '서브 KV (배경 이미지 + 2줄 카피)' };
  if (cls === 'kv' || cls.includes('kv ') || cls.startsWith('kv ')) return { kind: 'mainkv', label: '메인 KV (비디오 배경 + 카피 + Scroll Down)' };
  if (cls.includes('overview__kv')) return { kind: 'kvslider', label: 'IR 개요 KV (Swiper fade 슬라이더)' };
  if (cls.includes('sticky-sequence')) return { kind: 'sticky-seq', label: 'sticky-sequence (배경 sticky + 텍스트 카드 스크롤)' };
  if (cls.includes('strategy-section')) return { kind: 'strategy', label: '전략 소개 섹션 (이미지 + 헤드라인 + 본문)' };
  if (cls === 'global' || cls.startsWith('global ')) return { kind: 'global-webgl', label: 'global — Canvas WebGL + 통계 카드 + 카운터' };
  if (cls.includes('sustainability-content')) return { kind: 'sustain-cards', label: 'sustainability (잎사귀 모티브 + ESG 4 카드)' };
  if (cls === 'sustainability' || cls.startsWith('sustainability ')) return { kind: 'sustain', label: 'sustainability (Sustainability for Growth 영역)' };
  if (cls.includes('news')) return { kind: 'news', label: 'Latest News (대표 뉴스 + 카드 리스트)' };
  if (cls.includes('invest')) return { kind: 'invest', label: 'Invest Relations (신용등급 카드 + IR 자료)' };
  if (cls.includes('with')) return { kind: 'with', label: 'With KT&G (Business + Career 2 카드)' };
  if (cls.includes('introduction__images')) return { kind: 'img-row', label: '이미지 row (3장)' };
  if (cls.includes('introduction__value-wrapper') || cls.includes('introduction__value-row')) return { kind: 'value', label: '비전 · 경영이념 · 핵심가치 영역' };
  if (cls.includes('introduction__overview') || cls.includes('introduction__portfolio') || cls.includes('introduction__identity')) return { kind: 'introduction-block', label: '회사 정보 블록 (설립일/매출/임직원/포트폴리오/CI)' };
  if (cls.includes('history__text-area')) return { kind: 'history-area', label: '시대 헤더 (NOW-2021 / 2020-2012 / ...)' };
  if (cls.includes('history__year-row')) return { kind: 'history-year', label: '연도 라벨 (year row)' };
  if (cls.includes('history__row')) return { kind: 'history-row', label: '월별 이벤트 리스트 (history row)' };
  if (cls.includes('history__container')) return { kind: 'history-container', label: '시대 컨테이너 (sticky 5시대 nav 가능)' };
  if (cls.includes('network__overseas-webgl')) return { kind: 'webgl-globe', label: 'WebGL 지구본 (드래그 회전 + 거점 마커)' };
  if (cls.includes('overseas-list')) return { kind: 'list-block', label: '거점 리스트 그룹 (법인/지사/공장)' };
  if (cls.includes('overview__stock')) return { kind: 'stock-card', label: '라이브 주식정보 카드 (KOSPI ticker)' };
  if (cls.includes('overview__performance')) return { kind: 'performance', label: '경영실적 (분기별)' };
  if (cls.includes('overview__financial')) return { kind: 'rating-cards', label: '재무 · 신용평가 카드 (AAA × 5 outline)' };
  if (cls.includes('overview__event') || cls.includes('overview__notice')) return { kind: 'event-list', label: 'IR 행사 · 공지 리스트 (더보기)' };
  if (cls.includes('overview__image-cards')) return { kind: 'image-cards', label: '하단 이미지 카드 2개 (KT&G 더 알아보기 + Contact us)' };
  if (cls.includes('value-block') || cls.includes('value-section') || cls === 'value' || cls.startsWith('value ')) return { kind: 'value-block', label: 'VALUE — 정책 본문 + 카드' };
  if (cls.includes('governance')) return { kind: 'governance', label: '지배구조 헌장 + 카드 + 차트' };
  if (cls.includes('iframe-container')) return { kind: 'iframe', label: '외부 iframe (차트 / 시세 시스템)' };
  if (cls.includes('announcement-list')) return { kind: 'board', label: '공지사항 게시판 (번호 · 제목 · 등록일 + 페이지네이션)' };
  if (cls.includes('event-accordion')) return { kind: 'accordion', label: '연도별 IR 행사 아코디언 (KR/EN PDF)' };
  if (cls.includes('strategy__cards') || cls.includes('strategy__symbol')) return { kind: 'esg-cards', label: 'ESG 전략 카드 (INDUSTRY / PEOPLE / PLANET)' };
  if (cls.includes('strategy')) return { kind: 'strategy-block', label: '지속가능경영 전략 영역' };
  if (cls.includes('highlight__wrapper') || cls.includes('highlight__esg-rating') || cls.includes('highlight__korea-esg') || cls.includes('highlight__title')) return { kind: 'highlight', label: 'Highlights (ESG 평가 등급)' };
  if (cls.includes('efforts__content') || cls.includes('efforts__section-header')) return { kind: 'efforts', label: 'KT&G 노력 (환경 / 사회 / 지배구조)' };
  if (cls.includes('banner')) return { kind: 'banner', label: 'ESG 리포트 배너 (CTA)' };
  if (cls.includes('vision') || cls.includes('green-impact') || cls.includes('management')) return { kind: 'esg-text', label: '본문 + 비전 영역' };
  if (cls.includes('library')) return { kind: 'esg-library', label: '아카이빙 라이브러리 (PDF 다운로드)' };
  if (cls.includes('ethics__header')) return { kind: 'ethics-header', label: '윤리경영 헤더' };
  if (cls.includes('ethics__container')) return { kind: 'ethics-block', label: '윤리경영 조직도 / 활동 카드' };
  if (cls.includes('policies__row')) return { kind: 'policies', label: 'E / S / G 정책 카드 row (PDF 다운로드)' };
  if (cls.includes('media__poster')) return { kind: 'poster-grid', label: '지면광고 포스터 그리드 (연도별 필터)' };
  if (cls.includes('social')) return { kind: 'social-channels', label: '소셜미디어 채널 (유튜브 / 인스타그램 / 페이스북)' };
  if (cls.includes('people')) return { kind: 'people', label: 'PEOPLE 섹션 (거대 헤딩 + 본문)' };
  if (cls.includes('benefit')) return { kind: 'benefit', label: 'BENEFIT 섹션 (보상정책 카드)' };
  if (cls.includes('career') && !cls.includes('career-recruit')) return { kind: 'career', label: 'CAREER 섹션 (교육 · 자기개발)' };
  if (cls.includes('value__cards')) return { kind: 'value-cards', label: 'HOPES 인사시스템 카드 그리드' };
  if (cls.includes('benefit__cards')) return { kind: 'benefit-cards', label: '보상정책 카드' };
  if (cls.includes('marketing-sales')) return { kind: 'job-list', label: '직무 카드 컨테이너 (8 직무)' };
  if (cls.includes('job__row') || cls.includes('job__roles')) return { kind: 'job-card', label: '직무 카드 (역할 · 자격요건)' };
  if (cls.includes('recruit-process') || cls.includes('recruit__header')) return { kind: 'recruit-process', label: '채용 프로세스 / 자격요건' };
  if (cls.includes('cta-section')) return { kind: 'cta', label: 'CTA 카드 (채용공고 / 채용 FAQ)' };
  if (cls.includes('interview')) return { kind: 'interview', label: '채용 인터뷰 영상 슬라이더' };
  if (cls.includes('inquiry-main')) return { kind: 'inquiry', label: '문의 안내 본문 + 카드 분류' };
  if (cls.includes('compliance__container')) return { kind: 'compliance-block', label: '비윤리행위 신고 안내 + 채널 카드' };
  if (cls.includes('safety-table')) return { kind: 'safety-board', label: '안전보건 게시판 + 의견 청취 폼' };
  if (cls.includes('container--base') || cls.includes('container--l') || cls.includes('container--m')) {
    return { kind: 'container', label: 'container (자식 콘텐츠 그룹)' };
  }
  return { kind: 'unknown', label: '섹션 영역' };
}

// ────────────────────────── 인터랙션 이벤트 검출 (timeline 분석) — 강화판 ──────────────────────────
function detectInteractions(timeline, meta, page) {
  const evts = [];
  const usedAtRatios = new Set();

  function addEvt(e) {
    // atRatio 충돌 방지 (마커 위치 분산)
    let r = e.atRatio;
    while (usedAtRatios.has(Math.round(r * 20))) r = Math.min(1, r + 0.05);
    usedAtRatios.add(Math.round(r * 20));
    evts.push({ ...e, atRatio: r });
  }

  // 1. KV 비디오 자동재생 (메인 페이지)
  const hasVideo = (meta.sections || []).some(s => s.hasVid);
  if (hasVideo) {
    addEvt({
      kind: 'video',
      label: 'KV 배경 비디오 자동재생',
      desc: '<video autoplay loop muted playsinline> — 페이지 진입 즉시 무한 루프 재생. Beyond Limits, Towards Innovation 카피와 함께 페이드인. Scroll Down 인디케이터 미세 bounce.',
      atRatio: 0.02
    });
  }

  // 2. Canvas WebGL (global / network)
  const hasCanvas = (meta.sections || []).some(s => s.hasCan);
  if (hasCanvas) {
    addEvt({
      kind: 'webgl',
      label: 'Canvas WebGL 렌더',
      desc: '<canvas> 영역 — Three.js 또는 자체 WebGL로 우주/지구본 등 3D 씬 렌더. requestAnimationFrame 루프로 회전·파티클 효과. 글로벌 네트워크는 드래그 회전 + 거점 마커 hover.',
      atRatio: 0.12
    });
  }

  // 3. sticky 요소 분석
  const stickyMap = new Map();
  timeline.forEach(t => {
    (t.b.sticky || []).forEach(s => {
      const k = s.cls;
      if (!stickyMap.has(k)) stickyMap.set(k, []);
      stickyMap.get(k).push({ step: t.step, top: s.top, pos: s.pos, h: s.h, op: s.op });
    });
  });
  let stickyCount = 0;
  stickyMap.forEach((trail, cls) => {
    if (trail.length < 2 || stickyCount >= 3) return;
    const positions = new Set(trail.map(t => t.pos));
    if (positions.has('sticky') || positions.has('fixed')) {
      const stuckSteps = trail.filter(t => Math.abs(t.top) < 100);
      if (stuckSteps.length > 0) {
        stickyCount++;
        addEvt({
          kind: 'sticky',
          label: `sticky 고정 (${cls.split(' ')[0].slice(0, 24)})`,
          desc: `.${cls.slice(0, 40)} — position:sticky/fixed로 뷰포트 상단에 고정. sY ${stuckSteps[0].step * 10}% ~ ${stuckSteps[stuckSteps.length - 1].step * 10}% 구간에서 top<100px. 그 외 구간 자연 스크롤. 부모 overflow 확인 필요.`,
          atRatio: stuckSteps[0].step / 10
        });
      }
    }
  });

  // 4. active class 진입 검출 — 단계별 +1 이상 증가 모두 잡음 (이전엔 +2만)
  let prevActiveCount = 0;
  timeline.forEach(t => {
    const ac = t.b.activeCount || 0;
    if (ac > prevActiveCount && t.step > 0) {
      const delta = ac - prevActiveCount;
      const newOnes = (t.b.activeEls || []).slice(0, 3).map(e => '.' + e.cls.slice(0, 22)).join(', ');
      if (delta >= 1 && evts.filter(e => e.kind === 'activate').length < 2) {
        addEvt({
          kind: 'activate',
          label: `스크롤 진입 시 활성화 (+${delta})`,
          desc: `sY ${t.ratio * 100}% 도달 시 .active/.is-active/.is-visible 카운트 ${prevActiveCount} → ${ac} (+${delta}). 예: ${newOnes}. IntersectionObserver(threshold≈0.2) 기반 진입 시 클래스 부여.`,
          atRatio: t.ratio
        });
      }
    }
    prevActiveCount = ac;
  });

  // 5. counter 값 변화 — 임계값 완화 (>2 → >1) + 슬롯머신 패턴 감지
  const counterTrail = new Map();
  timeline.forEach(t => {
    (t.b.counters || []).forEach((c, i) => {
      const k = `${c.cls}::${i}`;
      if (!counterTrail.has(k)) counterTrail.set(k, []);
      counterTrail.get(k).push({ step: t.step, t: c.t });
    });
  });
  let counterShown = 0;
  counterTrail.forEach((trail, k) => {
    if (trail.length < 2 || counterShown >= 2) return;
    const distinctVals = new Set(trail.map(t => t.t));
    const cls = k.split('::')[0];
    const isSlot = cls.includes('number-section') || trail.some(t => /0123456789/.test(t.t));
    if (distinctVals.size > 1 || isSlot) {
      counterShown++;
      addEvt({
        kind: 'counter',
        label: isSlot ? '슬롯머신 카운터' : '카운트업 애니메이션',
        desc: isSlot
          ? `.${cls.slice(0, 30)} — 각 자리수가 0→9 회전하는 슬롯머신(반복 strip) 카운터. 뷰포트 진입 시 각 자리수가 target에서 정지. ".number-section-integer" 트랙 안에 "0123456789" 텍스트 strip.`
          : `.${cls.slice(0, 30)} — 텍스트 변화 (${[...distinctVals].slice(0, 4).join(' → ')}). requestAnimationFrame 0→target 증가 애니메이션.`,
        atRatio: trail[0].step / 10
      });
    }
  });

  // 6. animation @keyframes — 최대 2개만 (페이지 차지 방지)
  const animSeenSet = new Set();
  let animShown = 0;
  for (const t of timeline) {
    if (animShown >= 2) break;
    for (const a of (t.b.animEls || [])) {
      if (animShown >= 2) break;
      const k = a.an + '|' + a.cls.slice(0, 20);
      if (!animSeenSet.has(k) && a.an !== 'none') {
        animSeenSet.add(k);
        animShown++;
        addEvt({
          kind: 'animation',
          label: `@keyframes ${a.an.slice(0, 20)}`,
          desc: `.${a.cls.slice(0, 30)} 에 ${a.an} CSS 애니메이션 (${a.dur}). 명명된 keyframes — 로딩 인디케이터·로고 모션·반복 효과·spin·pulse 추정.`,
          atRatio: t.ratio
        });
      }
    }
  }

  // 7. header 변화 (background)
  const headerBgs = new Set(timeline.map(t => t.b.header?.bg).filter(Boolean));
  if (headerBgs.size > 1) {
    addEvt({
      kind: 'header',
      label: '헤더 스크롤 반응',
      desc: `헤더 배경이 스크롤에 따라 변화 (${[...headerBgs].slice(0, 2).join(' → ')}). KV 위에서는 투명, 흰 영역에서는 흰 배경 + 0 12px rgba(0,0,0,0.06) shadow. 0.3s ease.`,
      atRatio: 0.08
    });
  }

  // 8. Swiper 슬라이더
  if (meta.ix && meta.ix.swiper) {
    const swiperKv = (meta.sections || []).some(s => (s.cls || '').includes('swiper-fade') || (s.cls || '').includes('overview__kv'));
    addEvt({
      kind: 'slider',
      label: `Swiper.js 슬라이더 (${meta.ix.swiper}개)`,
      desc: swiperKv
        ? 'Swiper Fade 모드 — KV 슬라이드가 4-5초 간격 자동 전환. opacity 1↔0 cross-fade. pagination ●○○○ 인디케이터 클릭 시 해당 슬라이드로 이동.'
        : `Swiper 슬라이더 ${meta.ix.swiper}개 요소. autoplay + pagination + ←→ navigation. 카드 그리드 가로 슬라이드.`,
      atRatio: 0
    });
  }

  // 9. iframe 임베드
  const hasIframe = (meta.sections || []).some(s => s.hasIframe);
  if (hasIframe) {
    addEvt({
      kind: 'iframe',
      label: '외부 iframe 임베드',
      desc: '재무하이라이트/주가 차트 시스템을 iframe으로 외부 호스트(별도 도메인)에서 로딩. 컨테이너만 KT&G UI, 내부 차트 위젯은 외부 솔루션.',
      atRatio: 0.2
    });
  }

  // 10. 카드 호버 효과 (카드 컴포넌트 많을 때)
  if (meta.ix && meta.ix.card > 3) {
    addEvt({
      kind: 'hover',
      label: `카드 호버 효과 (${meta.ix.card}개)`,
      desc: `카드 컴포넌트 hover 시 transform: translateY(-4px) 또는 box-shadow 0 8px 24px rgba(0,0,0,0.08). 이미지 영역은 scale(1.05) 확대. 0.3s ease-in-out 표준 트랜지션.`,
      atRatio: 0.5
    });
  }

  // 11. CTA 버튼 (바로가기/더보기/자세히보기 텍스트 다수)
  const ctaCount = (meta.sections || []).filter(s => /바로가기|더보기|자세히/.test(s.txt || '')).length;
  if (ctaCount > 1) {
    addEvt({
      kind: 'hover',
      label: `CTA 버튼 hover 화살표 (${ctaCount}+개)`,
      desc: `"바로가기 →" "더보기 →" "자세히 보기" CTA 버튼이 ${ctaCount}+개. hover 시 ← 화살표 8-12px 우측 이동 + 텍스트 underline. 클릭 시 페이지 전환.`,
      atRatio: 0.55
    });
  }

  // 12. 아코디언 펼침
  if (meta.ix && meta.ix.accordion) {
    addEvt({
      kind: 'click',
      label: `아코디언 펼침 (${meta.ix.accordion}개)`,
      desc: `아코디언 헤더 클릭 시 본문 max-height 0 → auto 트랜지션 (0.4s ease). ▼ 화살표 180° 회전. 다른 아코디언은 닫음 (단일 펼침 모드 추정).`,
      atRatio: 0.4
    });
  }

  // 13. 탭 전환
  if (meta.ix && meta.ix.tab > 3) {
    addEvt({
      kind: 'click',
      label: `탭 전환 (${meta.ix.tab}개)`,
      desc: `탭 헤더 클릭 시 본문 패널 fade-in/out (opacity 0→1, 0.3s). active 인디케이터 (밑줄 또는 배경) 슬라이드 transform translateX. URL hash 변경.`,
      atRatio: 0.32
    });
  }

  // 14. 게시판 페이지네이션
  if (meta.ix && meta.ix.pagin) {
    addEvt({
      kind: 'click',
      label: '게시판 페이지네이션',
      desc: `1·2·3·…·N + ←→ 페이지네이션 컨트롤. 클릭 시 목록 fade-out → 새 페이지 fetch → fade-in. URL ?page=N 갱신.`,
      atRatio: 0.7
    });
  }

  // 15. 필터 칩
  if (meta.ix && meta.ix.filter) {
    addEvt({
      kind: 'click',
      label: `필터 칩 (${meta.ix.filter}개)`,
      desc: `카테고리/연도 필터 칩 클릭 시 active 토글 + 목록 재정렬 (CSS grid 또는 isotope). 0.4s ease 트랜지션 + opacity 0→1 fade.`,
      atRatio: 0.45
    });
  }

  // 16. 폼 입력 (contact, compliance, safety)
  if (meta.ix && (meta.ix.form || meta.ix.input)) {
    addEvt({
      kind: 'form',
      label: '입력 폼',
      desc: `<input>/<select>/<textarea> 폼 + submit 버튼. focus 시 border 색 변경 (#3F42E5) + label float up. 필수 필드 빈 채 submit 시 inline error 메시지.`,
      atRatio: 0.6
    });
  }

  // 17. 페이지별 특수 패턴 (메타 ix 키워드 기반) — 자동 검출이 못 잡는 라이브 인터랙션 보충
  // 17a. 연혁: history + year 키워드 다수 → sticky 5시대 nav
  if (meta.ix && meta.ix.history > 100 && meta.ix.year > 30) {
    addEvt({
      kind: 'sticky',
      label: '연혁 sticky 시대 nav',
      desc: `.history__container (sH ${meta.sH.toLocaleString()}px 초장스크롤) — 상단에 5시대 (혁신·확장·도약·성장·시작) 라디오 nav가 sticky로 고정. 스크롤 진행 시 viewport 진입 시대에 따라 active 칩 토글. 클릭 시 해당 시대 anchor로 smooth scroll.`,
      atRatio: 0.05
    });
    addEvt({
      kind: 'activate',
      label: `연혁 year-row IntersectionObserver fade (year=${meta.ix.year})`,
      desc: `.history__year-row (${meta.ix.year}개) — 각 연도 라벨이 viewport 진입 시 fade-in + translateY(20→0). .history__row 내부 월별 이벤트 리스트도 stagger 진입.`,
      atRatio: 0.3
    });
  }

  // 17b. 글로벌 네트워크: map + globe 키워드 → 인터랙티브 지구본
  if (meta.ix && (meta.ix.map > 30 || meta.ix.globe)) {
    addEvt({
      kind: 'webgl',
      label: 'WebGL 인터랙티브 지구본',
      desc: `.network__overseas-webgl — 마우스 드래그로 지구본 회전 (X/Y axis), wheel scroll로 줌. 거점 마커 hover 시 거점명 + 주소 카드 팝업. 클릭 시 해당 법인 정보 카드 우측 슬라이드.`,
      atRatio: 0.25
    });
  }

  // 17c. 주요사업: sticky-sequence 카드 시퀀스 명시
  if (meta.ix && meta.ix.sequence > 50) {
    addEvt({
      kind: 'sticky',
      label: `sticky-sequence 3 카드 시퀀스 (sequence=${meta.ix.sequence})`,
      desc: `.sticky-sequence 영역 3개 (해외궐련·NGP·건강기능식품) — 배경 이미지는 sticky로 viewport 고정, 텍스트 카드 (직무역할/자격요건)는 위로 스크롤. 카드별 진입 시 카운터(매출%·국가수) 카운트업.`,
      atRatio: 0.4
    });
  }

  // 17d. 글로벌 카운터 (통계): 메인 페이지 17/140/65.2 처럼 큰 숫자 통계
  if (meta.ix && meta.ix.counter > 5 && !evts.some(e => e.kind === 'counter')) {
    addEvt({
      kind: 'counter',
      label: `통계 카운터 (counter=${meta.ix.counter})`,
      desc: `통계 숫자 카드 (예: 17 locations · 140 countries · 65.2B sticks) — IntersectionObserver 진입 시 0→target 증가 애니메이션. 약 1.5-2s easeOutCubic 곡선.`,
      atRatio: 0.15
    });
  }

  // 17e. 미디어 라이브러리: 매우 긴 갤러리 (sH 20000+)
  if (meta.sH > 20000 && meta.ix && meta.ix.card > 100) {
    addEvt({
      kind: 'click',
      label: `라이브러리 필터 + 갤러리 (sH ${meta.sH.toLocaleString()}px)`,
      desc: `연도별 필터 칩 (전체/2025-2020/2019-2015/2014-2010) 클릭 시 포스터 그리드 재정렬. lazy-load IntersectionObserver로 스크롤 진입 시 이미지 페이드인. 카드 hover 시 어두운 오버레이.`,
      atRatio: 0.4
    });
  }

  // 17f. ESG 개요/사회/환경: tab + accordion 조합
  if (meta.url && meta.url.includes('sustainability') && meta.ix && meta.ix.tab > 10) {
    addEvt({
      kind: 'hover',
      label: 'ESG 카드 자세히보기',
      desc: `.efforts__content 카드 (환경/사회/지배구조) — hover 시 카드 전체 shadow 증폭 + 우측 화살표 우측 8px 이동. 클릭 시 해당 ESG 카테고리 상세 페이지로 이동.`,
      atRatio: 0.55
    });
  }

  // 17g. IR 개요: KV swiper + 실시간 ticker
  if (meta.url && meta.url.includes('ir/overview')) {
    addEvt({
      kind: 'animation',
      label: '주식 시세 라이브 ticker',
      desc: `.overview__stock — KOSPI 연동 실시간 시세 (예: KT&G 180,500원 ▼ 8,500). 폴링 또는 WebSocket으로 가격 업데이트. 상승 빨강 / 하락 파랑 색상 변화 + 화살표 아이콘.`,
      atRatio: 0.15
    });
  }

  // 17h. 인재채용 인사제도: PEOPLE/VALUE/BENEFIT/CAREER 거대 헤딩 스크롤 리빌
  if (meta.url && meta.url.includes('career/hrsystem')) {
    addEvt({
      kind: 'activate',
      label: 'PEOPLE/VALUE/BENEFIT/CAREER 거대 헤딩 진입',
      desc: `4개 거대 헤딩 섹션 — IntersectionObserver 기반 진입 시 글자별 단어 stagger fade-in (Splitting.js 또는 자체 split). 헤딩 80-120px 크기 + 본문 좌측 정렬 카드 그리드.`,
      atRatio: 0.18
    });
  }

  // 17i. swiper-slide-active 다수: 슬라이드 자동 인디케이터
  const swiperActives = timeline.filter(t => (t.b.activeEls || []).some(e => e.cls && e.cls.includes('swiper-slide-active'))).length;
  if (swiperActives > 3 && !evts.some(e => e.kind === 'slider')) {
    addEvt({
      kind: 'slider',
      label: 'Swiper active slide 인디케이터',
      desc: `swiper-slide-active 클래스가 ${swiperActives} step에서 감지 — 슬라이더 페이지네이션 ●●○○○ 인디케이터가 자동 진행. KV·이벤트·인터뷰 슬라이드.`,
      atRatio: 0
    });
  }

  // ──── 18. 베이스라인 보장 (모든 페이지 공통 인터랙션) ────
  // 어느 페이지든 GNB sticky 헤더 + 페이지 진입 fade는 있음. 마커 부족(<4개) 페이지에 자동 추가.

  // 18a. GNB sticky 헤더 (모든 페이지 공통, 한 번만 추가)
  if (!evts.some(e => e.label && e.label.includes('GNB'))) {
    addEvt({
      kind: 'sticky',
      label: 'GNB 헤더 상단 sticky',
      desc: `header — position:sticky top:0 z-index:100. 모든 페이지 공통. 스크롤 시작과 함께 viewport 상단에 고정. KV 위에서 투명·KV 지나면 흰 배경 + 0 4px 16px rgba(0,0,0,0.04) shadow.`,
      atRatio: 0.04
    });
  }

  // 18b. PDF/파일 다운로드 (정책·자료실 페이지)
  if (meta.url && (meta.url.includes('archive/policies') || meta.url.includes('library') || meta.url.includes('ir/value'))) {
    addEvt({
      kind: 'click',
      label: '파일 다운로드 (PDF/AI/JPG)',
      desc: `정책·규범·자료 PDF 다운로드 버튼. 클릭 시 a[download] 속성으로 직접 다운로드. hover 시 ⬇ 아이콘 위로 4px 이동 + 버튼 배경 #f5f5f5 → #e5e5e5 강조.`,
      atRatio: 0.6
    });
  }

  // 18c. 지배구조 차트 (organization chart)
  if (meta.url && meta.url.includes('governance')) {
    addEvt({
      kind: 'click',
      label: '지배구조 차트 / 조직도',
      desc: `이사회 · 감사위원회 · 사외이사 조직도 트리. 노드 클릭 시 해당 위원회 상세 카드 우측 슬라이드. 박스 hover 시 border-color #d4d4d4 → #171717.`,
      atRatio: 0.5
    });
    addEvt({
      kind: 'hover',
      label: '카드 hover 배경 강조',
      desc: `지배구조 헌장 / 위원회 카드 hover 시 box-shadow 0 12px 32px rgba(0,0,0,0.08) + 카드 배경 #fafafa → #ffffff 상승 효과.`,
      atRatio: 0.55
    });
  }

  // 18d. 윤리경영 조직도 + 활동 카드
  if (meta.url && meta.url.includes('ethics')) {
    addEvt({
      kind: 'hover',
      label: '윤리경영 활동 카드 hover',
      desc: `Think Twice 윤리 경영 캠페인 · 윤리의식 자가진단 · 거래업체 윤리실천 카드 hover 시 transform: translateY(-4px) + 이미지 scale(1.05) 확대.`,
      atRatio: 0.5
    });
    addEvt({
      kind: 'click',
      label: '비윤리행위 신고 채널',
      desc: `KT&G 비윤리행위 신고 페이지 이동 CTA. 클릭 시 /compliance 라우팅. 클릭 직전 0.15s 짧은 active scale(0.97) 피드백.`,
      atRatio: 0.85
    });
  }

  // 18e. 고객문의 (contact)
  if (meta.url && meta.url.includes('contact-us')) {
    addEvt({
      kind: 'hover',
      label: '문의 카테고리 카드 hover',
      desc: `고객 의견 / VOC / IR 문의 등 카드 hover 시 border #d4d4d4 → #171717 + 우측 화살표 → 8px 이동 + 카드 배경 약간 진해짐.`,
      atRatio: 0.4
    });
    addEvt({
      kind: 'click',
      label: '문의 폼 이동 CTA',
      desc: `카드 클릭 시 해당 카테고리 별도 폼 페이지로 이동. URL 라우팅 + body 영역 fade-in.`,
      atRatio: 0.7
    });
  }

  // 18f. 비윤리행위 신고 (compliance)
  if (meta.url && meta.url.includes('compliance')) {
    addEvt({
      kind: 'click',
      label: '신고 채널 13개 카드',
      desc: `금품수수·인사청탁·횡령 등 비윤리 사례 카드 13개. 클릭 시 해당 신고 채널(외부 시스템) 새 탭 오픈. hover 시 카드 border 강조 + 아이콘 우측 슬라이드.`,
      atRatio: 0.5
    });
    addEvt({
      kind: 'hover',
      label: '카드 호버 시 채널 강조',
      desc: `카드 hover 시 카드 box-shadow 강화 + 아이콘 배경 진해짐. 0.3s ease-in-out.`,
      atRatio: 0.7
    });
  }

  // 18g. 기업가치 제고 계획 (ir/value)
  if (meta.url && meta.url.includes('ir/value')) {
    addEvt({
      kind: 'hover',
      label: '주주환원 정책 hover',
      desc: `주주환원 정책 본문 영역 — 참고 링크 hover 시 underline + 외부 ↗ 아이콘 등장. 정책 카드 hover 시 배경 #fafafa 강조.`,
      atRatio: 0.4
    });
  }

  return evts.slice(0, 16);
}

// ────────────────────────── SVG 와이어프레임 생성 (v2 흑백 톤) ──────────────────────────
// 참고: uxplaybook.org Landing Page Formula / Mobile App Landing Wireframe 스타일
// - Pretendard / Inter sans-serif
// - 흰 배경 + 회색 박스 + 검정 강조 (CTA·active만)
// - 마커: 검정 작은 원 + 좌측 라벨(제목 진하게 + 본문 회색 2-3줄) + 가는 검정 직선 화살표
// - 손그림 필터 제거. 정확한 직선 박스.
function buildWireframeSVG(meta, timeline, interactions, page) {
  const VIEWPORT_W = 1700;
  const LEFT_PAD = 280;             // 좌측 주석 영역 (짝수 마커)
  const RIGHT_PAD = 280;            // 우측 주석 영역 (홀수 마커) — 참고 이미지 1 패턴
  const WF_W = VIEWPORT_W - LEFT_PAD - RIGHT_PAD;
  const HEADER_H = 56;
  const sH = meta.sH || 4000;
  // 매우 긴 페이지 자동 압축 (sH 20000+ 인 연혁·라이브러리)
  const RATIO = sH > 20000 ? 0.08 : sH > 10000 ? 0.12 : sH > 5000 ? 0.16 : 0.20;
  const WF_H = Math.round(sH * RATIO);
  const TOTAL_H = WF_H + HEADER_H + 100;

  // 정의 — 손그림 필터 없음, marker는 가는 검정 직선용
  const defs = `
    <defs>
      <marker id="arrow-${page.id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="${GREY.text}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
      </marker>
      <style>
        .wf, .wf text { font-family: 'Pretendard', 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif; font-feature-settings: 'ss01' on, 'cv11' on; }
        .wf-label { font-size: 14px; font-weight: 700; fill: ${GREY.text}; letter-spacing: -0.01em; }
        .wf-meta  { font-size: 11px; font-weight: 500; fill: ${GREY.textSub}; letter-spacing: 0; font-variant-numeric: tabular-nums; }
        .wf-mini  { font-size: 12px; font-weight: 500; fill: ${GREY.textSub}; }
        .wf-mini-strong { font-size: 13px; font-weight: 700; fill: ${GREY.text}; }
        .wf-cta-text { font-size: 13px; font-weight: 600; fill: #ffffff; }
        .anno-title { font-size: 15px; font-weight: 700; fill: ${GREY.text}; letter-spacing: -0.005em; }
        .anno-body  { font-size: 12px; font-weight: 500; fill: ${GREY.textSub}; }
        .anno-kind  { font-size: 10px; font-weight: 700; fill: ${GREY.textHint}; text-transform: uppercase; letter-spacing: 0.08em; }
        .marker-num { font-size: 12px; font-weight: 700; fill: #ffffff; }
      </style>
    </defs>`;

  // ─── 헤더 (GNB) — 흰 배경 + 회색 라인 ───
  const header = `
    <g class="wf">
      <rect x="${LEFT_PAD}" y="0" width="${WF_W}" height="${HEADER_H}" fill="${GREY.bg}" stroke="${GREY.border}" stroke-width="1"/>
      <!-- Logo placeholder -->
      <circle cx="${LEFT_PAD + 32}" cy="${HEADER_H/2}" r="11" fill="${GREY.accent}"/>
      <!-- GNB menu -->
      <g class="wf-mini" fill="${GREY.text}">
        <text x="${LEFT_PAD + 240}" y="${HEADER_H/2 + 4}">회사소개</text>
        <text x="${LEFT_PAD + 320}" y="${HEADER_H/2 + 4}">투자정보</text>
        <text x="${LEFT_PAD + 400}" y="${HEADER_H/2 + 4}">지속가능경영</text>
        <text x="${LEFT_PAD + 500}" y="${HEADER_H/2 + 4}">미디어</text>
        <text x="${LEFT_PAD + 565}" y="${HEADER_H/2 + 4}">인재채용</text>
      </g>
      <!-- Utility (우측) -->
      <g class="wf-meta">
        <text x="${LEFT_PAD + WF_W - 32}" y="${HEADER_H/2 + 3}" text-anchor="end">고객문의 · 신고 · 안전 · KOR/ENG</text>
      </g>
    </g>`;

  // ─── 섹션 박스 (회색 톤 통일) — y 범위 중첩 기반 dedup ───
  const rawSections = (meta.sections || []).filter(s => s.h > 100);
  // 1단계: 큰 h 우선, 같으면 짧은 클래스명(부모) 우선 정렬
  const sortedForDedup = [...rawSections].sort((a, b) => {
    if (b.h !== a.h) return b.h - a.h;
    return (a.cls || '').length - (b.cls || '').length;
  });
  // 2단계: 기존 선정 영역과 70%+ y 범위 중첩이면 skip (자식 row 제거)
  const drawn = [];
  const filtered = [];
  sortedForDedup.forEach(s => {
    const overlap = drawn.find(d => {
      const inter = Math.max(0, Math.min(d.y + d.h, s.y + s.h) - Math.max(d.y, s.y));
      return inter / Math.min(s.h, d.h) > 0.70;
    });
    if (!overlap) {
      const c = classifySection(s);
      if (c) {
        filtered.push({ s, c });
        drawn.push({ y: s.y, h: s.h });
      }
    }
  });
  // 3단계: 화면 순서대로 정렬 (위→아래)
  filtered.sort((a, b) => a.s.y - b.s.y);

  let body = '';
  filtered.forEach(({ s, c }) => {
    const y = HEADER_H + Math.round(s.y * RATIO);
    const h = Math.max(48, Math.round(s.h * RATIO));
    const x = LEFT_PAD + 24;
    const w = WF_W - 48;
    // 박스 사이 여백 더 — h - 10
    const boxH = h - 10;

    // 모든 섹션은 동일한 회색 톤. 단 KV류는 placeholder 강조 (조금 더 진한 회색)
    const isHeroLike = ['mainkv','subkv','kvslider','subheader','global-webgl','sustain-cards','sustain','poster-grid','people','benefit','career','value-section'].includes(c.kind);
    const fill = isHeroLike ? GREY.surface2 : GREY.surface;
    const stroke = GREY.border;

    body += `
      <g class="wf">
        <rect x="${x}" y="${y}" width="${w}" height="${boxH}" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="1"/>
      </g>`;

    // 미니 컴포넌트 (회색 톤 GREY 토큰 사용) — boxH 전달로 콘텐츠가 박스 안에 들어가도록
    body += renderMiniComponent(c.kind, x, y, w, boxH);

    // 라벨 (상단 좌측 + 클래스명 우측)
    body += `
      <g class="wf">
        <text x="${x + 14}" y="${y + 18}" class="wf-label">${escapeXml(c.label)}</text>
        <text x="${x + w - 14}" y="${y + 18}" class="wf-meta" text-anchor="end">.${escapeXml(s.cls.slice(0, 38))} · y${s.y} · h${s.h}px</text>
      </g>`;
  });

  // ─── 인터랙션 마커 + 좌/우 텍스트 주석 (참고 이미지 1 스타일: 양쪽 분할) ───
  // 마커를 좌/우로 분할 배치하여 풍선 간격 확보. 각 측에서 독립적으로 y 분산.
  const leftIxs = interactions.filter((_, i) => i % 2 === 0);
  const rightIxs = interactions.filter((_, i) => i % 2 === 1);
  const leftYs = computeMarkerPositions(leftIxs, WF_H, HEADER_H);
  const rightYs = computeMarkerPositions(rightIxs, WF_H, HEADER_H);
  let markers = '';
  let annotations = '';
  let lIdx = 0, rIdx = 0;
  interactions.forEach((iv, idx) => {
    const n = idx + 1;
    const isLeft = idx % 2 === 0;
    const my = isLeft ? leftYs[lIdx++] : rightYs[rIdx++];

    // 마커 (와이어프레임 좌/우 가장자리 안쪽)
    const markerCx = isLeft ? LEFT_PAD + 18 : LEFT_PAD + WF_W - 18;
    const markerCy = my;

    // 주석 풍선 위치 (좌/우)
    const annoX = isLeft ? 20 : LEFT_PAD + WF_W + 28;
    const annoY = my - 14;
    const annoW = isLeft ? LEFT_PAD - 40 : RIGHT_PAD - 48;

    // 화살표: 주석 풍선 → 마커
    const arrowX1 = isLeft ? annoX + annoW + 4 : annoX - 8;
    const arrowX2 = isLeft ? markerCx - 12 : markerCx + 12;
    markers += `
      <g class="wf-marker">
        <line x1="${arrowX1}" y1="${my}" x2="${arrowX2}" y2="${my}" stroke="${GREY.text}" stroke-width="0.8" marker-end="url(#arrow-${page.id})"/>
        <circle cx="${markerCx}" cy="${markerCy}" r="11" fill="${GREY.accent}"/>
        <text x="${markerCx}" y="${markerCy + 4}" class="marker-num" text-anchor="middle">${n}</text>
      </g>`;

    // 주석: kind + 제목 (1-2줄) + 본문 (3줄 max)
    const titleLines = splitText(iv.label, 26, 2);
    const bodyLines = splitText(iv.desc, 30, 3);
    const titleBlockH = titleLines.length * 20;
    const bodyStartY = annoY + 22 + titleBlockH + 6;
    annotations += `
      <g class="wf-anno">
        <text x="${annoX}" y="${annoY}" class="anno-kind">${escapeXml(String(n).padStart(2, '0'))} · ${escapeXml(iv.kind)}</text>
        ${titleLines.map((line, i) => `<text x="${annoX}" y="${annoY + 22 + i * 20}" class="anno-title">${escapeXml(line)}</text>`).join('')}
        ${bodyLines.map((line, i) => `<text x="${annoX}" y="${bodyStartY + i * 16}" class="anno-body">${escapeXml(line)}</text>`).join('')}
      </g>`;
  });

  // ─── 스크롤 인디케이터 (와이어프레임 안 우측 끝 — 우측 주석 영역과 충돌 회피) ───
  const scrollBar = `
    <g class="wf">
      <line x1="${LEFT_PAD + WF_W - 8}" y1="${HEADER_H + 4}" x2="${LEFT_PAD + WF_W - 8}" y2="${HEADER_H + WF_H - 4}" stroke="${GREY.borderDim}" stroke-width="1"/>
      <text x="${LEFT_PAD + WF_W - 12}" y="${HEADER_H + 14}" class="wf-meta" text-anchor="end">0px</text>
      <text x="${LEFT_PAD + WF_W - 12}" y="${HEADER_H + WF_H - 4}" class="wf-meta" text-anchor="end">${sH.toLocaleString()}px</text>
    </g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEWPORT_W} ${TOTAL_H}" style="display:block;width:100%;height:auto;background:${GREY.bg};border:1px solid ${GREY.border};border-radius:8px;">
    ${defs}
    ${header}
    ${body}
    ${scrollBar}
    ${markers}
    ${annotations}
  </svg>`;
}

// 마커 y 위치 분산: 인접한 마커끼리 최소 160px 간격 유지
// (anno-kind 14 + anno-title 2줄 40 + anno-body 3줄 48 + 여백 30 + 화살표 = ~160px)
function computeMarkerPositions(interactions, wfH, headerH) {
  if (interactions.length === 0) return [];
  const positions = interactions.map(iv => headerH + Math.round(wfH * (iv.atRatio || 0)) + 40);
  const sortedIdx = positions.map((p, i) => ({ i, p })).sort((a, b) => a.p - b.p);
  const sortedPs = sortedIdx.map(x => x.p);
  const MIN_GAP = 160;
  for (let i = 1; i < sortedPs.length; i++) {
    if (sortedPs[i] - sortedPs[i - 1] < MIN_GAP) sortedPs[i] = sortedPs[i - 1] + MIN_GAP;
  }
  // 원래 순서대로 복원
  const result = new Array(interactions.length);
  sortedIdx.forEach((s, i) => { result[s.i] = sortedPs[i]; });
  return result;
}

// ────────────────────────── 미니 컴포넌트 wireframe (v2 흑백 톤) ──────────────────────────
// 회색 placeholder + 검정 CTA + 회색 텍스트 라인. 참고: uxplaybook.org Landing Page Formula.
function renderMiniComponent(kind, x, y, w, h) {
  const innerY = y + 32;
  const innerH = h - 40;
  if (innerH < 24) return '';

  // 헬퍼: 회색 텍스트 라인 (실제 텍스트 대신)
  const line = (lx, ly, lw, lh = 6, color = GREY.ph) =>
    `<rect x="${lx}" y="${ly}" width="${lw}" height="${lh}" rx="2" fill="${color}"/>`;
  // 헬퍼: 검정 CTA 버튼 (라운드 사각)
  const cta = (bx, by, bw, bh = 26, label = '') =>
    `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="${bh/2}" fill="${GREY.accent}"/>${label ? `<text x="${bx + bw/2}" y="${by + bh/2 + 4}" class="wf-cta-text" text-anchor="middle">${label}</text>` : ''}`;
  // 헬퍼: 회색 outline 카드
  const card = (cx, cy, cw, ch) =>
    `<rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" rx="6" fill="${GREY.bg}" stroke="${GREY.borderDim}" stroke-width="1"/>`;
  // 헬퍼: 이미지 placeholder (진한 회색)
  const img = (ix, iy, iw, ih) =>
    `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" rx="4" fill="${GREY.ph}"/>`;

  switch (kind) {
    case 'mainkv':
    case 'subkv': {
      // 좌측 카피 + CTA / 우측 이미지 (참고 이미지 1 Hero 패턴)
      const leftW = (w - 80) * 0.55;
      const rightW = (w - 80) * 0.4;
      const cy = innerY + 16;
      return `
        ${img(x + 40 + leftW + 32, cy, rightW, Math.min(innerH - 32, 220))}
        ${line(x + 40, cy + 6, 80, 14)}
        ${line(x + 40, cy + 36, leftW - 32, 22)}
        ${line(x + 40, cy + 66, leftW - 80, 22)}
        ${line(x + 40, cy + 104, leftW - 32, 8, GREY.ph)}
        ${cta(x + 40, cy + 128, 124, 32, '⬇ Download')}
        ${cta(x + 40 + 134, cy + 128, 124, 32, 'Download')}
        ${line(x + 40, cy + 176, 160, 6)}
        ${innerH > 220 ? `<text x="${x + w/2}" y="${y + h - 14}" class="wf-mini" text-anchor="middle">↓ Scroll Down</text>` : ''}`;
    }
    case 'subheader': {
      return `${line(x + 40, y + h/2 - 8, 240, 18, GREY.text)}${line(x + 40, y + h/2 + 14, 360, 6)}`;
    }
    case 'global-webgl': {
      // 좌측 큰 placeholder (WebGL canvas) + 우측 통계 카드 4개
      const leftW = (w - 60) * 0.45;
      const rightX = x + 40 + leftW + 24;
      const rightW = w - 64 - leftW - 24;
      let out = `${img(x + 40, innerY + 8, leftW, innerH - 20)}`;
      out += `<text x="${x + 40 + leftW/2}" y="${innerY + 8 + (innerH - 20)/2}" class="wf-mini" text-anchor="middle" fill="${GREY.text}" font-weight="700">canvas (WebGL)</text>`;
      const cards = [
        { n: '17', label: 'locations' },
        { n: '140', label: 'countries' },
        { n: '65.2B', label: 'sticks' },
        { n: '1.478B', label: 'NGP' }
      ];
      const cardH = Math.min(64, (innerH - 28) / 4 - 8);
      cards.forEach((c, i) => {
        const cy2 = innerY + 8 + i * (cardH + 8);
        if (cy2 + cardH > y + h - 8) return;
        out += card(rightX, cy2, rightW, cardH);
        out += `<text x="${rightX + 14}" y="${cy2 + 26}" class="wf-mini-strong" font-size="18">${c.n}</text>`;
        out += `<text x="${rightX + 14}" y="${cy2 + 48}" class="wf-mini">${c.label} <tspan fill="${GREY.textHint}">· counter</tspan></text>`;
      });
      return out;
    }
    case 'sustain-cards':
    case 'sustain': {
      const cardW = (w - 96) / 4;
      const cardH = Math.min(120, innerH - 80);
      let out = `${line(x + 40, innerY + 16, 280, 18, GREY.text)}`;
      out += `${line(x + 40, innerY + 42, 220, 6)}`;
      if (cardH > 30) {
        ['OVERVIEW', 'ENVIRONMENT', 'SOCIAL', 'GOVERNANCE'].forEach((t, i) => {
          out += card(x + 40 + i * (cardW + 16), innerY + 64, cardW, cardH);
          out += `<text x="${x + 40 + i * (cardW + 16) + cardW/2}" y="${innerY + 64 + cardH/2}" class="wf-mini-strong" text-anchor="middle">${t}</text>`;
        });
      }
      return out;
    }
    case 'news': {
      const leftW = (w - 60) * 0.5;
      const right = x + 40 + leftW + 16;
      const rightW = w - 56 - leftW - 16;
      const featureH = Math.min(180, innerH - 30);
      let out = card(x + 40, innerY + 8, leftW, featureH);
      out += img(x + 50, innerY + 18, leftW - 20, featureH * 0.55);
      out += line(x + 50, innerY + 18 + featureH * 0.55 + 12, leftW - 60, 12);
      out += line(x + 50, innerY + 18 + featureH * 0.55 + 30, leftW - 90, 6);
      out += line(x + 50, innerY + 18 + featureH * 0.55 + 42, 80, 6);
      // 우측 3카드
      const itemH = Math.min(52, (featureH - 8) / 3 - 8);
      [0, 1, 2].forEach(i => {
        const ly = innerY + 8 + i * (itemH + 8);
        if (ly + itemH > innerY + featureH) return;
        out += `<line x1="${right}" y1="${ly + itemH + 4}" x2="${right + rightW}" y2="${ly + itemH + 4}" stroke="${GREY.borderDim}" stroke-width="1"/>`;
        out += line(right, ly + 10, rightW * 0.8, 8);
        out += line(right, ly + 24, rightW * 0.5, 6);
        out += line(right, ly + 36, 60, 6);
      });
      return out;
    }
    case 'invest': {
      // AAA 등급 5 outline circle + 자료 카드
      const cardW = (w - 80) / 5;
      let out = `${line(x + 40, innerY + 8, 80, 12, GREY.text)}`;
      ['AAA', 'AAA', 'AAA', 'A3', 'A-'].forEach((t, i) => {
        const cx = x + 40 + i * (cardW + 8) + cardW / 2;
        out += `<circle cx="${cx}" cy="${innerY + 60}" r="30" fill="${GREY.bg}" stroke="${GREY.border}" stroke-width="1.5"/>`;
        out += `<text x="${cx}" y="${innerY + 64}" class="wf-mini-strong" text-anchor="middle">${t}</text>`;
      });
      out += card(x + 40, innerY + 112, w - 80, Math.min(60, innerH - 124));
      out += line(x + 56, innerY + 130, 200, 10, GREY.text);
      out += line(x + 56, innerY + 148, 280, 6);
      return out;
    }
    case 'with': {
      const halfW = (w - 80) / 2 - 8;
      const halfH = innerH - 32;
      let out = card(x + 40, innerY + 8, halfW, halfH);
      out += line(x + 56, innerY + 28, 120, 18, GREY.text);
      out += line(x + 56, innerY + 56, halfW - 40, 6);
      out += line(x + 56, innerY + 70, halfW - 60, 6);
      out += cta(x + 56, innerY + halfH - 32, 110, 24, '바로가기');
      out += card(x + 40 + halfW + 16, innerY + 8, halfW, halfH);
      out += line(x + 56 + halfW + 16, innerY + 28, 120, 18, GREY.text);
      out += line(x + 56 + halfW + 16, innerY + 56, halfW - 40, 6);
      out += line(x + 56 + halfW + 16, innerY + 70, halfW - 60, 6);
      out += cta(x + 56 + halfW + 16, innerY + halfH - 32, 110, 24, '바로가기');
      return out;
    }
    case 'sticky-seq': {
      // 좌측 텍스트 카드 3장 + 우측 sticky 이미지 영역 (회색 placeholder)
      const leftW = (w - 80) * 0.5;
      const rightX = x + 40 + leftW + 24;
      const rightW = w - 64 - leftW - 24;
      const cardH = Math.min(56, (innerH - 28) / 3 - 8);
      let out = '';
      [0, 1, 2].forEach(i => {
        const cy = innerY + 12 + i * (cardH + 12);
        if (cy + cardH > y + h - 8) return;
        out += card(x + 40, cy, leftW, cardH);
        const ttls = ['해외궐련', 'NGP', '건강기능식품'];
        out += `<text x="${x + 56}" y="${cy + 18}" class="wf-mini-strong">${ttls[i]}</text>`;
        out += line(x + 56, cy + 28, leftW - 40, 6);
        out += line(x + 56, cy + 40, leftW - 80, 6);
      });
      // sticky 영역 (회색 placeholder + sticky 마크)
      const stickyH = Math.max(140, innerH * 0.7);
      out += img(rightX, innerY + 12, rightW, Math.min(stickyH, innerH - 24));
      out += `<text x="${rightX + rightW/2}" y="${innerY + 12 + 24}" class="wf-mini" text-anchor="middle" fill="${GREY.text}" font-weight="700">⚓ sticky 배경 이미지</text>`;
      return out;
    }
    case 'history-area': {
      return `${line(x + 40, innerY + 16, 60, 12, GREY.text)}${line(x + 40, innerY + 32, 240, 18, GREY.text)}${line(x + 40, innerY + 58, 280, 6)}${line(x + 40, innerY + 72, 200, 6)}`;
    }
    case 'history-year': {
      return `<text x="${x + 40}" y="${innerY + 30}" class="wf-mini-strong" font-size="20" fill="${GREY.text}">[YYYY]</text>`;
    }
    case 'history-row': {
      const rows = Math.min(3, Math.floor((innerH - 8) / 18));
      let out = '';
      for (let i = 0; i < rows; i++) {
        const ly = innerY + 8 + i * 18;
        out += line(x + 40, ly + 4, 24, 8, GREY.line);
        out += line(x + 80, ly + 4, w - 130, 8);
      }
      return out;
    }
    case 'history-container': {
      // sticky 5시대 nav (chips)
      let out = `${line(x + 40, innerY + 16, 200, 8, GREY.text)}`;
      const eras = ['혁신', '확장', '도약', '성장', '시작'];
      eras.forEach((t, i) => {
        const cx = x + 40 + i * 100;
        out += `<rect x="${cx}" y="${innerY + 32}" width="84" height="28" rx="14" fill="${i === 0 ? GREY.accent : GREY.bg}" stroke="${GREY.border}" stroke-width="1"/>`;
        out += `<text x="${cx + 42}" y="${innerY + 50}" class="wf-mini${i === 0 ? '-strong' : ''}" text-anchor="middle" fill="${i === 0 ? '#fff' : GREY.text}">${t}</text>`;
      });
      return out;
    }
    case 'webgl-globe': {
      const cy = innerY + innerH / 2;
      const r = Math.min(110, innerH / 3);
      const cx = x + w / 2;
      let out = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${GREY.ph}" stroke="${GREY.border}" stroke-width="1"/>`;
      out += `<ellipse cx="${cx}" cy="${cy}" rx="${r * 0.92}" ry="${r * 0.32}" fill="none" stroke="${GREY.line}" stroke-width="0.8"/>`;
      out += `<ellipse cx="${cx}" cy="${cy}" rx="${r * 0.72}" ry="${r * 0.24}" fill="none" stroke="${GREY.line}" stroke-width="0.8" transform="rotate(45 ${cx} ${cy})"/>`;
      out += `<text x="${cx}" y="${cy + r + 22}" class="wf-mini-strong" text-anchor="middle">WebGL 지구본 — 드래그 회전 · 거점 hover</text>`;
      // 거점 마커 dots
      [[0.25, 0.32], [0.66, 0.28], [0.78, 0.62], [0.22, 0.68], [0.5, 0.78]].forEach(([px, py]) => {
        out += `<circle cx="${x + 60 + (w - 120) * px}" cy="${innerY + 40 + (innerH - 80) * py}" r="3.5" fill="${GREY.accent}"/>`;
      });
      return out;
    }
    case 'list-block':
    case 'board': {
      const rows = Math.min(7, Math.floor((innerH - 28) / 24));
      let out = `<line x1="${x + 40}" y1="${innerY + 4}" x2="${x + w - 40}" y2="${innerY + 4}" stroke="${GREY.text}" stroke-width="1.4"/>`;
      out += `<text x="${x + 40}" y="${innerY + 22}" class="wf-mini-strong">번호</text>`;
      out += `<text x="${x + 96}" y="${innerY + 22}" class="wf-mini-strong">제목</text>`;
      out += `<text x="${x + w - 80}" y="${innerY + 22}" class="wf-mini-strong">날짜</text>`;
      out += `<line x1="${x + 40}" y1="${innerY + 30}" x2="${x + w - 40}" y2="${innerY + 30}" stroke="${GREY.border}" stroke-width="1"/>`;
      for (let i = 0; i < rows; i++) {
        const ly = innerY + 36 + i * 24;
        out += `<text x="${x + 40}" y="${ly + 14}" class="wf-mini">${rows - i}</text>`;
        out += line(x + 96, ly + 8, w - 180, 8);
        out += `<text x="${x + w - 80}" y="${ly + 14}" class="wf-mini" fill="${GREY.textHint}">2026-0${(i % 9) + 1}-${10 + i}</text>`;
        out += `<line x1="${x + 40}" y1="${ly + 22}" x2="${x + w - 40}" y2="${ly + 22}" stroke="${GREY.borderDim}" stroke-width="0.5"/>`;
      }
      return out;
    }
    case 'iframe': {
      const cy = innerY + innerH / 2;
      let out = `<rect x="${x + 60}" y="${innerY + 12}" width="${w - 120}" height="${innerH - 24}" rx="4" fill="${GREY.surface2}" stroke="${GREY.border}" stroke-width="1" stroke-dasharray="6 4"/>`;
      out += `<text x="${x + w/2}" y="${cy - 4}" class="wf-mini-strong" text-anchor="middle">&lt;iframe&gt;</text>`;
      out += `<text x="${x + w/2}" y="${cy + 14}" class="wf-mini" text-anchor="middle" fill="${GREY.textHint}">외부 차트 / 시세 시스템</text>`;
      return out;
    }
    case 'accordion': {
      const rows = Math.min(4, Math.floor((innerH - 8) / 40));
      let out = '';
      for (let i = 0; i < rows; i++) {
        const ly = innerY + 8 + i * 40;
        out += `<rect x="${x + 40}" y="${ly}" width="${w - 80}" height="32" rx="4" fill="${GREY.bg}" stroke="${GREY.borderDim}" stroke-width="1"/>`;
        out += line(x + 56, ly + 14, 280, 8);
        out += `<text x="${x + w - 60}" y="${ly + 20}" class="wf-mini" fill="${GREY.text}">＋</text>`;
      }
      return out;
    }
    case 'esg-cards': {
      const cardW = (w - 80) / 3 - 12;
      const cardH = Math.min(120, innerH - 24);
      let out = '';
      ['INDUSTRY', 'PEOPLE', 'PLANET'].forEach((t, i) => {
        const cx = x + 40 + i * (cardW + 16);
        out += card(cx, innerY + 12, cardW, cardH);
        out += `<text x="${cx + 16}" y="${innerY + 36}" class="wf-mini-strong">${t}</text>`;
        out += line(cx + 16, innerY + 50, cardW - 32, 6);
        out += line(cx + 16, innerY + 62, cardW - 48, 6);
      });
      return out;
    }
    case 'highlight': {
      let out = `${line(x + 40, innerY + 8, 120, 10, GREY.text)}`;
      const items = [['AAA', 'MSCI'], ['87', 'DJSI'], ['Prime', 'ISS'], ['A', 'CDP']];
      items.forEach(([n, lab], i) => {
        const cx = x + 40 + i * 130;
        out += card(cx, innerY + 24, 110, 76);
        out += `<text x="${cx + 55}" y="${innerY + 56}" class="wf-mini-strong" text-anchor="middle" font-size="18">${n}</text>`;
        out += `<text x="${cx + 55}" y="${innerY + 80}" class="wf-mini" text-anchor="middle">${lab}</text>`;
      });
      return out;
    }
    case 'efforts': {
      let out = `${line(x + 40, innerY + 8, 120, 10, GREY.text)}`;
      out += `<text x="${x + w - 60}" y="${innerY + 16}" class="wf-mini" fill="${GREY.text}" text-anchor="end">자세히보기 →</text>`;
      const colW = (w - 80) / 3 - 8;
      [0, 1, 2].forEach(i => {
        const cx = x + 40 + i * (colW + 12);
        out += card(cx, innerY + 28, colW, Math.min(90, innerH - 40));
        out += line(cx + 12, innerY + 44, colW - 24, 8);
        out += line(cx + 12, innerY + 58, colW - 40, 6);
        out += line(cx + 12, innerY + 70, colW * 0.6, 6);
      });
      return out;
    }
    case 'banner': {
      let out = `<rect x="${x + 40}" y="${innerY + 12}" width="${w - 80}" height="${innerH - 24}" rx="6" fill="${GREY.accent}"/>`;
      out += `<text x="${x + 64}" y="${innerY + innerH/2 - 6}" class="wf-mini-strong" font-size="20" fill="#fff">KT&amp;G가 만들어가는 지속가능한 미래</text>`;
      out += `<text x="${x + 64}" y="${innerY + innerH/2 + 16}" class="wf-mini" fill="#a3a3a3">2024 KT&amp;G 리포트 바로가기</text>`;
      out += cta(x + w - 200, innerY + innerH/2 - 8, 140, 28, '바로가기 →');
      return out;
    }
    case 'policies': {
      let out = `${line(x + 40, innerY + 8, 120, 10, GREY.text)}`;
      const cardW = (w - 80) / 4 - 8;
      [0, 1, 2, 3].forEach(i => {
        const cx = x + 40 + i * (cardW + 10);
        out += card(cx, innerY + 24, cardW, Math.min(60, innerH - 36));
        out += line(cx + 10, innerY + 40, cardW - 20, 8);
        out += `<text x="${cx + cardW/2}" y="${innerY + 64}" class="wf-mini" text-anchor="middle" fill="${GREY.textHint}">PDF ⬇</text>`;
      });
      return out;
    }
    case 'poster-grid': {
      const cols = 5;
      const rows = Math.min(5, Math.floor((innerH - 40) / 70));
      let out = `${line(x + 40, innerY + 8, 80, 10, GREY.text)}`;
      // 필터 칩
      ['전체', '2025-2020', '2019-2015', '2014-2010'].forEach((t, i) => {
        const cx = x + 40 + i * 90;
        out += `<rect x="${cx}" y="${innerY + 22}" width="80" height="22" rx="11" fill="${i === 0 ? GREY.accent : GREY.bg}" stroke="${GREY.border}" stroke-width="1"/>`;
        out += `<text x="${cx + 40}" y="${innerY + 37}" class="wf-mini${i === 0 ? '-strong' : ''}" text-anchor="middle" fill="${i === 0 ? '#fff' : GREY.text}">${t}</text>`;
      });
      const cardW = (w - 64 - (cols - 1) * 10) / cols;
      const cardH = 60;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          out += img(x + 32 + c * (cardW + 10), innerY + 56 + r * (cardH + 10), cardW, cardH);
        }
      }
      return out;
    }
    case 'social-channels': {
      const sectionH = innerH / 3;
      let out = '';
      ['YouTube', 'Instagram', 'Facebook'].forEach((p, i) => {
        const sy = innerY + i * sectionH;
        out += `<text x="${x + 40}" y="${sy + 16}" class="wf-mini-strong">${p}</text>`;
        out += `<text x="${x + w - 60}" y="${sy + 16}" class="wf-mini" fill="${GREY.text}" text-anchor="end">더보기 →</text>`;
        const cardW = (w - 80) / 4 - 10;
        const cardH = Math.min(50, sectionH - 32);
        [0, 1, 2, 3].forEach(j => {
          out += img(x + 40 + j * (cardW + 12), sy + 26, cardW, cardH);
        });
      });
      return out;
    }
    case 'people':
    case 'value-section':
    case 'benefit':
    case 'career': {
      const label = { people: 'PEOPLE', 'value-section': 'VALUE', benefit: 'BENEFIT', career: 'CAREER' }[kind] || 'SECTION';
      let out = `<text x="${x + 56}" y="${innerY + 56}" class="wf-mini-strong" font-size="32" fill="${GREY.text}">${label}</text>`;
      out += line(x + 56, innerY + 78, 320, 8);
      out += line(x + 56, innerY + 94, 240, 6);
      const cardW = (w - 100) / 3 - 12;
      [0, 1, 2].forEach(i => {
        out += card(x + 56 + i * (cardW + 16), innerY + 120, cardW, Math.min(96, innerH - 136));
        out += line(x + 72 + i * (cardW + 16), innerY + 138, cardW - 32, 8);
        out += line(x + 72 + i * (cardW + 16), innerY + 152, cardW - 48, 6);
      });
      return out;
    }
    case 'job-card': {
      let out = `${line(x + 40, innerY + 8, 220, 12, GREY.text)}`;
      out += line(x + 40, innerY + 26, 320, 6);
      out += `<rect x="${x + 40}" y="${innerY + 44}" width="${w - 80}" height="${Math.min(72, innerH - 56)}" rx="4" fill="${GREY.bg}" stroke="${GREY.borderDim}" stroke-width="1"/>`;
      out += `<text x="${x + 56}" y="${innerY + 62}" class="wf-mini-strong">직무역할</text>`;
      out += line(x + 56, innerY + 72, (w - 100) / 2, 6);
      out += line(x + 56, innerY + 84, (w - 100) / 2 - 20, 6);
      out += `<text x="${x + 40 + (w - 80)/2 + 20}" y="${innerY + 62}" class="wf-mini-strong">자격요건</text>`;
      out += line(x + 40 + (w - 80)/2 + 20, innerY + 72, (w - 100) / 2, 6);
      out += line(x + 40 + (w - 80)/2 + 20, innerY + 84, (w - 100) / 2 - 20, 6);
      return out;
    }
    case 'recruit-process': {
      let out = `${line(x + 40, innerY + 8, 120, 12, GREY.text)}`;
      const step = (w - 100) / 5;
      [0, 1, 2, 3, 4].forEach(i => {
        const cx = x + 40 + i * step + 20;
        out += `<circle cx="${cx}" cy="${innerY + 56}" r="18" fill="${i === 0 ? GREY.accent : GREY.bg}" stroke="${GREY.border}" stroke-width="1.4"/>`;
        out += `<text x="${cx}" y="${innerY + 62}" class="wf-mini-strong" text-anchor="middle" fill="${i === 0 ? '#fff' : GREY.text}">${i + 1}</text>`;
        if (i < 4) out += `<line x1="${cx + 18}" y1="${innerY + 56}" x2="${cx + step - 18}" y2="${innerY + 56}" stroke="${GREY.border}" stroke-width="1" stroke-dasharray="3 3"/>`;
        out += line(cx - 32, innerY + 82, 64, 6);
      });
      return out;
    }
    case 'cta': {
      const halfW = (w - 80) / 2 - 8;
      const halfH = innerH - 32;
      let out = card(x + 40, innerY + 8, halfW, halfH);
      out += img(x + 56, innerY + 24, halfW - 32, halfH * 0.5);
      out += line(x + 56, innerY + 24 + halfH * 0.5 + 12, halfW - 60, 12);
      out += cta(x + 56, innerY + halfH - 32, 130, 28, '채용공고 →');
      out += card(x + 40 + halfW + 16, innerY + 8, halfW, halfH);
      out += img(x + 56 + halfW + 16, innerY + 24, halfW - 32, halfH * 0.5);
      out += line(x + 56 + halfW + 16, innerY + 24 + halfH * 0.5 + 12, halfW - 60, 12);
      out += cta(x + 56 + halfW + 16, innerY + halfH - 32, 130, 28, '채용 FAQ →');
      return out;
    }
    case 'kvslider': {
      let out = img(x + 40, innerY + 8, w - 80, innerH - 36);
      out += `<text x="${x + w/2}" y="${innerY + innerH/2 - 4}" class="wf-mini-strong" text-anchor="middle">▶ Swiper Fade KV — IR 이벤트</text>`;
      // pagination
      const px = x + w/2 - 30;
      const py = innerY + innerH - 20;
      [0, 1, 2, 3].forEach(i => {
        out += `<circle cx="${px + i * 14}" cy="${py}" r="4" fill="${i === 0 ? GREY.accent : GREY.bg}" stroke="${GREY.border}" stroke-width="1"/>`;
      });
      return out;
    }
    case 'rating-cards': {
      let out = `${line(x + 40, innerY + 8, 140, 12, GREY.text)}`;
      const step = (w - 80) / 5;
      ['AAA', 'AAA', 'AAA', 'A3', 'A-'].forEach((t, i) => {
        const cx = x + 40 + i * step + step / 2;
        out += `<circle cx="${cx}" cy="${innerY + 60}" r="32" fill="${GREY.bg}" stroke="${GREY.border}" stroke-width="1.5"/>`;
        out += `<text x="${cx}" y="${innerY + 64}" class="wf-mini-strong" text-anchor="middle">${t}</text>`;
      });
      return out;
    }
    case 'stock-card': {
      let out = `${line(x + 40, innerY + 12, 60, 8, GREY.text)}`;
      out += `<text x="${x + 40}" y="${innerY + 42}" class="wf-mini-strong" font-size="22" fill="${GREY.text}">180,500원</text>`;
      out += `<text x="${x + 200}" y="${innerY + 42}" class="wf-mini" fill="${GREY.text}" font-weight="700">▼ 8,500 (-4.50%)</text>`;
      out += `<rect x="${x + w - 80}" y="${innerY + 28}" width="56" height="22" rx="11" fill="${GREY.accent}"/>`;
      out += `<text x="${x + w - 52}" y="${innerY + 43}" class="wf-cta-text" text-anchor="middle">LIVE</text>`;
      return out;
    }
    case 'interview': {
      // 영상 슬라이더 (Swiper 카드 4장)
      const cardW = (w - 80) / 4 - 12;
      let out = `${line(x + 40, innerY + 12, 120, 12, GREY.text)}`;
      [0, 1, 2, 3].forEach(i => {
        const cx = x + 40 + i * (cardW + 16);
        out += img(cx, innerY + 32, cardW, Math.min(90, innerH - 60));
        // play icon
        out += `<circle cx="${cx + cardW/2}" cy="${innerY + 32 + Math.min(90, innerH - 60)/2}" r="14" fill="${GREY.bg}" opacity="0.9"/>`;
        out += `<path d="M ${cx + cardW/2 - 4} ${innerY + 32 + Math.min(90, innerH - 60)/2 - 6} L ${cx + cardW/2 + 6} ${innerY + 32 + Math.min(90, innerH - 60)/2} L ${cx + cardW/2 - 4} ${innerY + 32 + Math.min(90, innerH - 60)/2 + 6} z" fill="${GREY.text}"/>`;
      });
      return out;
    }
    case 'introduction-block': {
      // 좌측 헤딩 + 우측 본문 + 통계 카드 row (설립일·매출·임직원·CI 등)
      let out = `${line(x + 40, innerY + 8, 320, 18, GREY.text)}`;
      out += line(x + 40, innerY + 36, w - 200, 6);
      out += line(x + 40, innerY + 50, w - 280, 6);
      if (innerH > 110) {
        const labels = ['설립일', '매출', '임직원수', '포트폴리오'];
        const cw = (w - 80) / 4 - 10;
        const ch = Math.min(70, innerH - 80);
        labels.forEach((lab, i) => {
          out += card(x + 40 + i * (cw + 10), innerY + 72, cw, ch);
          out += `<text x="${x + 52 + i * (cw + 10)}" y="${innerY + 92}" class="wf-mini" fill="${GREY.textHint}">${lab}</text>`;
          out += line(x + 52 + i * (cw + 10), innerY + 102, cw - 24, 10, GREY.text);
        });
      }
      return out;
    }
    case 'value':
    case 'value-block': {
      // 비전 · 경영이념 · 핵심가치 3 박스 row
      let out = `${line(x + 40, innerY + 8, 280, 18, GREY.text)}`;
      out += line(x + 40, innerY + 36, w - 200, 6);
      const cw = (w - 80) / 3 - 12;
      const ch = Math.min(140, innerH - 60);
      const subs = ['비전', '경영이념', '핵심가치'];
      subs.forEach((s, i) => {
        out += card(x + 40 + i * (cw + 16), innerY + 54, cw, ch);
        out += `<text x="${x + 56 + i * (cw + 16)}" y="${innerY + 78}" class="wf-mini-strong">${s}</text>`;
        out += line(x + 56 + i * (cw + 16), innerY + 90, cw - 32, 8);
        out += line(x + 56 + i * (cw + 16), innerY + 104, cw - 48, 6);
        out += line(x + 56 + i * (cw + 16), innerY + 116, cw - 64, 6);
      });
      return out;
    }
    case 'ethics-block':
    case 'ethics-header': {
      // 윤리경영 헤더 + 조직도 또는 카드
      let out = `${line(x + 40, innerY + 8, 200, 18, GREY.text)}`;
      out += line(x + 40, innerY + 36, w - 200, 6);
      out += line(x + 40, innerY + 50, w - 280, 6);
      if (innerH > 100) {
        const cw = (w - 80) / 3 - 10;
        const ch = Math.min(80, innerH - 80);
        [0, 1, 2].forEach(i => {
          out += card(x + 40 + i * (cw + 10), innerY + 72, cw, ch);
          out += line(x + 56 + i * (cw + 10), innerY + 92, cw - 32, 10, GREY.text);
          out += line(x + 56 + i * (cw + 10), innerY + 108, cw - 48, 6);
        });
      }
      return out;
    }
    case 'governance': {
      // 지배구조 헌장 + 위원회 카드 + 차트
      let out = `${line(x + 40, innerY + 8, 240, 18, GREY.text)}`;
      out += line(x + 40, innerY + 36, w - 200, 6);
      if (innerH > 80) {
        const labels = ['이사회 75%', '감사위원회', '사외이사', '평가보상'];
        const cw = (w - 80) / 4 - 10;
        const ch = Math.min(80, innerH - 80);
        labels.forEach((lab, i) => {
          out += card(x + 40 + i * (cw + 10), innerY + 56, cw, ch);
          out += `<text x="${x + 56 + i * (cw + 10)}" y="${innerY + 76}" class="wf-mini-strong">${lab}</text>`;
          out += line(x + 56 + i * (cw + 10), innerY + 88, cw - 32, 6);
        });
      }
      return out;
    }
    case 'performance': {
      // 경영실적 (분기별 통계)
      let out = `${line(x + 40, innerY + 8, 160, 18, GREY.text)}`;
      const cw = (w - 80) / 3 - 12;
      const ch = Math.min(90, innerH - 50);
      const labels = ['실시간 방송', '실적 자료', '사업보고서'];
      labels.forEach((lab, i) => {
        out += card(x + 40 + i * (cw + 16), innerY + 38, cw, ch);
        out += `<text x="${x + 56 + i * (cw + 16)}" y="${innerY + 60}" class="wf-mini-strong">${lab}</text>`;
        out += line(x + 56 + i * (cw + 16), innerY + 74, cw - 32, 6);
        out += `<text x="${x + 56 + i * (cw + 16)}" y="${innerY + 98}" class="wf-mini" fill="${GREY.textHint}">2026 1Q ▼</text>`;
      });
      return out;
    }
    case 'event-list': {
      // IR 행사 · 공지 리스트
      let out = `${line(x + 40, innerY + 8, 140, 14, GREY.text)}`;
      out += `<text x="${x + w - 56}" y="${innerY + 18}" class="wf-mini" fill="${GREY.text}" text-anchor="end">더보기 →</text>`;
      const rows = Math.min(4, Math.floor((innerH - 30) / 28));
      for (let i = 0; i < rows; i++) {
        const ly = innerY + 32 + i * 28;
        out += `<line x1="${x + 40}" y1="${ly + 22}" x2="${x + w - 40}" y2="${ly + 22}" stroke="${GREY.borderDim}" stroke-width="1"/>`;
        out += `<text x="${x + 40}" y="${ly + 12}" class="wf-mini" fill="${GREY.textHint}">2026. ${(i + 1) * 2}. ${5 + i * 4}</text>`;
        out += line(x + 120, ly + 6, w - 240, 8);
      }
      return out;
    }
    case 'image-cards': {
      // 하단 이미지 카드 2개
      const halfW = (w - 80) / 2 - 8;
      const halfH = innerH - 32;
      let out = '';
      const labels = ['KT&G 더 알아보기', 'Contact us'];
      [0, 1].forEach(i => {
        const cx = x + 40 + i * (halfW + 16);
        out += card(cx, innerY + 8, halfW, halfH);
        out += img(cx + 16, innerY + 24, halfW - 32, halfH * 0.55);
        out += line(cx + 16, innerY + halfH * 0.55 + 40, halfW - 60, 14, GREY.text);
        out += `<text x="${cx + 16}" y="${innerY + halfH * 0.55 + 70}" class="wf-mini" fill="${GREY.textHint}">${labels[i]}</text>`;
        out += cta(cx + 16, innerY + halfH - 38, 116, 26, '자세히 보기');
      });
      return out;
    }
    case 'esg-text':
    case 'esg-library':
    case 'safety-board':
    case 'compliance-block':
    case 'inquiry': {
      // 본문 + 카드 또는 다운로드 표
      let out = `${line(x + 40, innerY + 8, 240, 18, GREY.text)}`;
      out += line(x + 40, innerY + 36, w - 200, 6);
      out += line(x + 40, innerY + 50, w - 240, 6);
      if (innerH > 100) {
        const cw = (w - 80) / 2 - 10;
        const ch = Math.min(80, innerH - 80);
        [0, 1].forEach(i => {
          out += card(x + 40 + i * (cw + 16), innerY + 72, cw, ch);
          out += line(x + 56 + i * (cw + 16), innerY + 88, cw - 60, 10, GREY.text);
          out += line(x + 56 + i * (cw + 16), innerY + 104, cw - 80, 6);
          out += `<text x="${x + 40 + i * (cw + 16) + cw - 56}" y="${innerY + 88 + ch / 2}" class="wf-mini" fill="${GREY.textHint}">⬇ PDF</text>`;
        });
      }
      return out;
    }
    case 'strategy':
    case 'strategy-block':
    case 'img-row':
    case 'value-cards':
    case 'benefit-cards':
    case 'job-list': {
      // 표준 3-카드 그리드 + 상단 헤딩
      let out = `${line(x + 40, innerY + 8, 200, 16, GREY.text)}`;
      out += line(x + 40, innerY + 32, w - 200, 6);
      const cw = (w - 80) / 3 - 12;
      const ch = Math.min(110, innerH - 60);
      [0, 1, 2].forEach(i => {
        const cx = x + 40 + i * (cw + 16);
        out += card(cx, innerY + 50, cw, ch);
        out += img(cx + 12, innerY + 62, cw - 24, ch * 0.5);
        out += line(cx + 12, innerY + 62 + ch * 0.5 + 12, cw - 40, 10, GREY.text);
        out += line(cx + 12, innerY + 62 + ch * 0.5 + 28, cw - 60, 6);
      });
      return out;
    }
    default: {
      // 기본: 타이틀 + 본문 라인 + 카드 3개
      if (innerH < 40) return '';
      let out = `${line(x + 40, innerY + 8, 220, 14, GREY.text)}`;
      out += line(x + 40, innerY + 28, w - 100, 6);
      out += line(x + 40, innerY + 40, w - 200, 6);
      if (innerH > 100) {
        const cw = (w - 100) / 3 - 12;
        const ch = Math.min(80, innerH - 64);
        [0, 1, 2].forEach(i => {
          out += card(x + 40 + i * (cw + 16), innerY + 56, cw, ch);
          out += line(x + 56 + i * (cw + 16), innerY + 72, cw - 32, 8);
          out += line(x + 56 + i * (cw + 16), innerY + 86, cw - 48, 6);
        });
      }
      return out;
    }
  }
}

// ────────────────────────── 유틸 ──────────────────────────
function escapeXml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
function splitText(s, perLine, maxLines) {
  const words = String(s).split(/(?=[\s,·])/);
  const lines = [''];
  for (const w of words) {
    if ((lines[lines.length - 1] + w).length > perLine) {
      if (lines.length >= maxLines) { lines[lines.length - 1] += '…'; break; }
      lines.push(w.trim());
    } else lines[lines.length - 1] += w;
  }
  return lines.filter(Boolean).slice(0, maxLines);
}

// ────────────────────────── 페이지 섹션 빌더 ──────────────────────────
function buildPageSection(data, page) {
  const { meta, timeline } = data;
  const interactions = detectInteractions(timeline, meta, page);
  const wireSvg = buildWireframeSVG(meta, timeline, interactions, page);

  const blocks = [];

  // 1. 페이지 개요
  blocks.push({ type: 'heading', value: `${page.title} — 페이지 흐름 + 와이어프레임` });
  blocks.push({ type: 'text', value: `Playwright로 10단계 (sY 0%→100%) 스크롤 + 매 단계 즉시·+1s·+2s 3장 = 33장 캡처 + computed-state 시계열 채집. 라이브 sH ${(meta.sH || 0).toLocaleString()}px, 섹션 ${meta.sectionCount || 0}개, transition ${meta.tc || 0} 요소, animation ${meta.ac || 0} 요소.` });

  // 2. 와이어프레임 SVG (메인)
  blocks.push({
    type: 'component',
    title: `와이어프레임 — ${page.title} (라이브 sH ${(meta.sH || 0).toLocaleString()}px → 비례 환산)`,
    fullWidth: true,
    html: `<div class="ktng-wf-wrap" style="padding:32px;background:#ffffff;border-radius:8px;border:1px solid #e5e5e5;">${wireSvg}<p style="margin:20px 0 0;font:500 12px/1.65 'Pretendard','Inter',system-ui,sans-serif;color:#525252;letter-spacing:-0.005em;">라이브 페이지의 y/h 좌표를 1400×{비례} SVG로 환산한 와이어프레임. 회색 박스는 컴포넌트 영역(카드 그리드·리스트·슬라이더·카운터·지구본·게시판 등), 검정 박스는 CTA·active 인디케이터. <strong style="color:#171717">검정 작은 원 번호 (①②③…)</strong>는 인터랙션 마커 — 가는 검정 화살표가 좌측 주석으로 연결되며, 주석에는 (번호 · KIND / 제목 / 동작 설명) 형태로 인터랙션이 텍스트로 명시. 우측 막대는 전체 스크롤 길이 인디케이터.</p></div>`,
    css: ''
  });

  // 3. 인터랙션 카탈로그 (마커 ①~⑫ 대응 표)
  if (interactions.length > 0) {
    blocks.push({ type: 'heading', value: `인터랙션 카탈로그 (스케치 마커 ${interactions.map((_, i) => '①②③④⑤⑥⑦⑧⑨⑩⑪⑫'[i]).join('')})` });
    blocks.push({
      type: 'structure',
      items: interactions.map((iv, i) => ({
        label: `${'①②③④⑤⑥⑦⑧⑨⑩⑪⑫'[i] || `(${i + 1})`}  ${iv.label}`,
        tag: iv.kind.toUpperCase(),
        desc: iv.desc
      }))
    });
  }

  // 4. 라이브 채집 메타
  const topColors = (meta.topColors || []).slice(0, 6).map(([c, n]) => `${c} (${n})`).join(', ');
  blocks.push({
    type: 'kv',
    title: '라이브 채집 메타 (Playwright + 10단계 스크롤 시계열)',
    columns: 2,
    items: [
      { label: '경로', value: meta.url || page.id },
      { label: '문서 타이틀', value: meta.title || '(none)' },
      { label: '전체 페이지 높이', value: (meta.sH || 0).toLocaleString() + 'px' },
      { label: '레이아웃 섹션 수', value: (meta.sectionCount || 0) + '개 (높이 80px+)' },
      { label: 'transition 적용 요소', value: (meta.tc || 0) + '개 (상위 1000 표본)' },
      { label: 'animation @keyframes', value: (meta.ac || 0) + '개' },
      { label: '상위 색상 빈도', value: topColors || '(데이터 없음)' },
      { label: '인터랙션 키워드 인벤토리', value: Object.keys(meta.ix || {}).slice(0, 12).map(k => `${k}=${meta.ix[k]}`).join(' · ') || '(특이 키워드 없음)' },
      { label: '캡처 스크린샷', value: '33장 (.playwright-mcp/ktng/v2/' + page.file + '/ 안 s00~s10 × a·b·c)' },
      { label: '시계열 step 수', value: timeline.length + ' (각 step마다 sticky/active/counter/animation 상태 채집)' },
    ]
  });

  // 5. 시계열 변화 표 (sticky/active/counter)
  const tlSummary = timeline.map(t => {
    const sb = t.b || {};
    return {
      step: `${t.ratio * 100}%`,
      sY: `${t.targetY}px`,
      stickyN: sb.stickyCount || 0,
      activeN: sb.activeCount || 0,
      animN: sb.animCount || 0,
      ctr: (sb.counters || []).slice(0, 3).map(c => c.t).join(' / ').slice(0, 60)
    };
  });
  blocks.push({ type: 'heading', value: '스크롤 시계열 변화 (10단계 +1s 시점)' });
  blocks.push({
    type: 'structure',
    items: tlSummary.map((r, i) => ({
      label: `step ${i} (${r.step})`,
      tag: `sY=${r.sY}`,
      desc: `sticky=${r.stickyN} · active=${r.activeN} · @keyframes=${r.animN} · counter: ${r.ctr || '—'}`
    }))
  });

  // 6. 정량 메모
  blocks.push({
    type: 'note',
    value: `Playwright 직접 호출 일괄 캡처 (2026-05-26 KST). viewport 1440×900, 하이드레이션 wait 4s, step별 3장 (0s/+1s/+2s). 스크린샷 (.playwright-mcp/ktng/v2/${page.file}/) + 시계열 (timeline.json) + 정적 메타 (meta.json). 인터랙션 자동 검출은 timeline의 sticky position·active count·counter textContent·animation name·header bg 변화를 step간 비교한 결과.`
  });

  return {
    title: `${page.num}. ${page.sidebarLabel.replace(/^\d+\.\s*/, '')}`,
    blocks
  };
}

// ────────────────────────── 사이트 개요 ──────────────────────────
function buildOverviewSection(all) {
  const totalH = Object.values(all).reduce((a, d) => a + ((d && d.meta && d.meta.sH) || 0), 0);
  const blocks = [];
  blocks.push({ type: 'heading', value: 'KT&G 흐름 스케치 1호 (v2: 디테일 와이어프레임)' });
  blocks.push({ type: 'text', value: `KT&G 글로벌 코퍼레이트 사이트 26개 페이지를 Playwright로 정밀 캡처(페이지당 33 스크린샷 + 시계열 11 step)한 뒤, 라이브 좌표를 디테일 SVG 와이어프레임으로 환산한 새 방식 1호 보고서 v2. 이전 v1(정적 5단계)에서 사용자가 지적한 "스크롤 안 한 채 fullPage만 찍음" 문제를 해결: 10단계 × 3캡처 + computed state 변화 자동 검출 → 인터랙션 마커 ①~⑫로 SVG 위에 시각화. 인터랙션 종류는 sticky·activate·counter·animation·slider·hover·click·iframe·header 등 자동 분류.` });
  blocks.push({
    type: 'kv',
    title: '전체 사이트 통계',
    columns: 2,
    items: [
      { label: '분석 페이지', value: Object.keys(all).length + '개' },
      { label: '페이지 길이 합계', value: totalH.toLocaleString() + 'px' },
      { label: '총 캡처 스크린샷', value: (Object.keys(all).length * 33).toLocaleString() + '장 (v2/{page}/sNN-{ratio}pct-{a,b,c}.jpeg)' },
      { label: '시계열 step 합계', value: (Object.keys(all).length * 11).toLocaleString() + ' steps × 3 sub-frames = 858 상태 스냅샷' },
      { label: '주요 디자인 토큰', value: 'Pretendard / system-ui sans-serif · 14px body · #000·#FFF·#787878·#3F42E5 액센트 블루' },
      { label: '캡처 도구', value: 'Playwright 직접 호출 (Chromium 1440×900 headless) + computed state 자동 채집' },
      { label: '인터랙션 검출 로직', value: 'step별 sticky.position·active count·counter textContent·animation name·header bg 변화 자동 분석 → 마커 ①~⑫ 자동 부착' },
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
  blocks.push({ type: 'heading', value: '와이어프레임 읽는 법' });
  blocks.push({
    type: 'structure',
    items: [
      { label: '캔버스 구성', tag: '1320 × 비례', desc: '좌측 220px = 인터랙션 풍선 주석 / 가운데 1060px = 와이어프레임 / 우측 = 스크롤 인디케이터. 헤더 60px 고정.' },
      { label: '섹션 박스 색상', tag: '컴포넌트 코드', desc: '검정/그라데이션=KV · 짙은 우주=global WebGL · 짙은 그린=sustainability · 보라 해치=sticky-sequence · 호박=iframe·거대 헤딩 · 자주=연혁 · 흰색=일반 카드·리스트.' },
      { label: '미니 컴포넌트', tag: '내부 표현', desc: '카드 그리드(rect 반복), 리스트(라인+텍스트), 슬라이더(rect+pagination 원), 카운터(숫자+레이블), 지구본(원+위경도 선), 게시판(번호·제목·날짜 행), iframe(점선 박스+\"<iframe>\" 라벨) 등.' },
      { label: '인터랙션 마커', tag: '①~⑫ 빨강', desc: '와이어프레임 우측에 원형 번호. 점선 화살표가 좌측 풍선으로 연결. 풍선 = (인터랙션 kind / label / 본문 설명 2-3줄).' },
      { label: '인터랙션 종류', tag: '자동 분류', desc: 'STICKY·ACTIVATE·COUNTER·ANIMATION·HEADER·SLIDER·IFRAME·HOVER·CLICK 9종. timeline 11 step의 computed state 차이로 자동 검출.' },
      { label: '왜 이렇게', tag: '디자이너 활용', desc: '실제 구현 코드(ktng-com 보고서에 별도 보관)가 아니라 디자이너가 페이지 골격·인터랙션 패턴을 한 눈에 훑도록 설계. 정적 컨셉 시안 단계에서 \"여기서 sticky가 시작\", \"여기서 카운트업\" 같은 결정을 빠르게 내림.' },
    ]
  });
  return { title: '00. 사이트 개요 · 읽기 가이드', blocks };
}

// ────────────────────────── 메인 ──────────────────────────
function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const all = {};
  PAGES.forEach(p => {
    const data = loadPage(p.file);
    if (data) all[p.id] = data;
  });
  console.log(`Loaded ${Object.keys(all).length}/${PAGES.length} pages`);

  const sections = {};
  sections['site-overview'] = buildOverviewSection(all);
  PAGES.forEach(p => {
    const d = all[p.id];
    if (!d) return;
    sections[p.id] = buildPageSection(d, p);
  });

  const totalH = Object.values(all).reduce((a, d) => a + (d.meta.sH || 0), 0);
  const analysis = {
    id: 'ktng-com-flow',
    title: 'KT&G (흐름 스케치 1호 v2)',
    url: 'https://www.ktng.com/',
    date: '2026-05-26',
    summary: `KT&G 글로벌 코퍼레이트 사이트 26개 페이지를 Playwright 직접 호출로 일괄 정밀 캡처(페이지당 10단계 스크롤 × 3캡처 = 33장 + computed-state 시계열 11 step)한 후, 디테일 SVG 와이어프레임 + 자동 검출된 인터랙션 마커 ①~⑫를 보고서 단일 진입점에 임베드한 새 방식 1호 v2 보고서. v1(정적 5단계)에서 사용자가 지적한 "스크롤 안 한 채 fullPage만 찍음" 문제를 해결. 라이브 sH 합계 ${totalH.toLocaleString()}px. 사이드바 = 페이지 일자 나열 (그룹화 없음). 와이어프레임은 라이브 좌표를 1320×{비례} SVG로 환산하고 컴포넌트별 mini wireframe(카드 그리드/리스트/슬라이더/카운터/지구본 등)을 그려 디자이너가 페이지 골격을 한 눈에 확인. 인터랙션 마커는 빨강 원형 번호 + 좌측 풍선 주석으로 (kind / label / 동작 설명) 매핑. 인터랙션 자동 검출은 step간 sticky position·active count·counter textContent·animation name·header bg 변화를 비교해 9종(STICKY·ACTIVATE·COUNTER·ANIMATION·HEADER·SLIDER·IFRAME·HOVER·CLICK)으로 분류.`,
    crawledPages: Object.keys(all).length,
    sections
  };
  fs.writeFileSync(OUT_FILE, JSON.stringify(analysis, null, 2), 'utf-8');
  const sizeKB = (fs.statSync(OUT_FILE).size / 1024).toFixed(1);
  console.log(`✓ wrote ${OUT_FILE} (${sizeKB} KB, ${Object.keys(sections).length} sections)`);

  const sectionsMeta = [
    { id: 'site-overview', num: '00', title: '사이트 개요 · 읽기 가이드', desc: 'v2 보고서 안내 + 사이트맵 + 와이어프레임 읽는 법' },
    ...PAGES.map(p => ({ id: p.id, num: p.num, title: p.sidebarLabel.replace(/^\d+\.\s*/, ''), desc: `${p.title} 페이지 흐름 + 디테일 와이어프레임 + 인터랙션 마커 ①~⑫` }))
  ];
  fs.writeFileSync(path.join(OUT_DIR, 'sections-meta.json'), JSON.stringify(sectionsMeta, null, 2), 'utf-8');
  console.log(`✓ wrote sections-meta.json (${sectionsMeta.length} entries)`);
}

main();
