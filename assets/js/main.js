function toggleTheme() {
  const body = document.body;
  const current = body.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  body.setAttribute('data-theme', next);
  // Topbar toggle
  const topIcon = document.getElementById('theme-icon');
  const topLabel = document.getElementById('theme-label');
  if (topIcon) topIcon.textContent = next === 'light' ? '☾' : '☀';
  if (topLabel) topLabel.textContent = next === 'light' ? 'Dark' : 'Light';
  // Sidebar toggle sync
  const sbIcon = document.getElementById('sidebar-theme-icon');
  const sbLabel = document.getElementById('sidebar-theme-label');
  const sbSub = document.getElementById('theme-sub');
  if (sbIcon) sbIcon.textContent = next === 'light' ? '☾' : '☀';
  if (sbLabel) sbLabel.textContent = next === 'light' ? 'Dark' : 'Light';
  if (sbSub) sbSub.textContent = next === 'light' ? 'Light Mode' : 'Dark Mode';
}

/* ============ SIDEBAR ============ */
function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  const scrim = document.querySelector('.sidebar-scrim');
  const isOpen = sb.classList.toggle('is-open');
  if (scrim) {
    if (isOpen) {
      scrim.classList.add('is-open');
      requestAnimationFrame(() => scrim.classList.add('is-visible'));
      document.body.style.overflow = 'hidden';
    } else {
      scrim.classList.remove('is-visible');
      setTimeout(() => scrim.classList.remove('is-open'), 200);
      document.body.style.overflow = '';
    }
  }
}
function closeSidebar() {
  const sb = document.getElementById('sidebar');
  const scrim = document.querySelector('.sidebar-scrim');
  sb.classList.remove('is-open');
  if (scrim) {
    scrim.classList.remove('is-visible');
    setTimeout(() => scrim.classList.remove('is-open'), 200);
  }
  document.body.style.overflow = '';
}
function closeSidebarMobile() {
  if (window.matchMedia('(max-width: 1099px)').matches) closeSidebar();
}

/* ============ SPA ROUTER ============ */

// Activate SPA mode
document.body.classList.add('spa-mode');

// Category definitions — for landing pages when a category is clicked
const CATEGORIES = {
  'getting-started': {
    title: 'Part 01 · 시작하기',
    desc: '시스템이 어떻게 동작하는지, 어떤 원칙을 따르는지, 토큰은 어떻게 구조화되는지. 컴포넌트를 만들기 전에 알아야 할 모든 것.',
    items: [
      { id:'about',      ico:'✦', title:'디자인시스템이란',  desc:'4가지 구성요소가 하나로 돌아가는 생산 체계' },
      { id:'principles', ico:'※', title:'6가지 원칙',         desc:'의미가 값보다 먼저 · 공유 이름 · 축약어 금지 등' },
      { id:'tokens',     ico:'◎', title:'토큰 아키텍처',       desc:'Primitive → Semantic → Component 3단계 구조' },
      { id:'naming',     ico:'≈', title:'네이밍 컨벤션',       desc:'이름은 팀 간의 계약. 약어는 대부분 금지' },
      { id:'policy',     ico:'◉', title:'그라데이션 정책',     desc:'v0.3부터 솔리드가 기본. 두-색 그라데이션 금지' },
      { id:'writing',    ico:'✎', title:'UX Writing 7원칙',    desc:'해요체 · 능동 · 긍정 · 잡초 제거 · 에러는 안내' },
    ]
  },
  'foundations': {
    title: 'Part 02 · Foundations',
    desc: '보이는 것의 기초 — 색 · 타이포 · 크기 · 반경 · 모션. 시스템의 모든 시각 토큰이 여기서 정의됩니다.',
    items: [
      { id:'color',            ico:'◐', title:'Color',            desc:'Primitive 34개 + Semantic Light/Dark 29개' },
      { id:'typography',       ico:'Aa', title:'Typography',      desc:'Pretendard Variable · display → overline 14단계' },
      { id:'sizing',           ico:'▭', title:'Sizing',           desc:'4px 기반 그리드 · size-50 → size-1200' },
      { id:'radius',           ico:'◖', title:'Radius',           desc:'none → full 8단계 반경 토큰' },
      { id:'motion',           ico:'➤', title:'Motion',           desc:'5개 duration · 4개 easing · 의미를 담은 움직임' },
      { id:'component-tokens', ico:'◇', title:'Component Tokens', desc:'Component 내부에서만 쓰는 예외 흡수층' },
    ]
  },
  'components': {
    title: 'Part 03 · Components',
    desc: '토큰과 원칙 위에 올라가는 실제 UI 단위. 각 컴포넌트는 자신만의 컴포넌트 토큰을 가지며, 시맨틱 토큰을 참조해 Light/Dark를 횡단합니다.',
    items: [
      { id:'asset',     ico:'◉', title:'Asset · Icon',             desc:'아이콘 세트 · 일러스트 스타일' },
      { id:'badge',     ico:'◆', title:'Badge',                    desc:'상태 · 카운트 · 뱃지 변형' },
      { id:'chart',     ico:'▥', title:'Bar Chart',                desc:'세로 / 가로 / 누적 · 데이터 시각화' },
      { id:'border',    ico:'│', title:'Border · Divider',         desc:'테두리 · 구분선 · 장식 요소' },
      { id:'button',    ico:'▢', title:'Button',                   desc:'7변형 × 5크기 × 6상태' },
      { id:'chip',      ico:'◎', title:'Chip',                     desc:'필터 · 태그 · 칩 상호작용' },
      { id:'textfield', ico:'▭', title:'Text Field',               desc:'입력 필드 · 유효성 · 포커스' },
      { id:'avatar',    ico:'○', title:'Avatar',                   desc:'이니셜 · 이미지 · 상태 오버레이' },
      { id:'control',   ico:'☑', title:'Checkbox · Radio · Toggle',desc:'선택 컨트롤 3종' },
      { id:'list',      ico:'≡', title:'List Item',                desc:'리스트 행 · leading/trailing' },
      { id:'alert',     ico:'!', title:'Alert · Toast',            desc:'인라인 경고 · 일시적 피드백' },
      { id:'progress',  ico:'▰', title:'Progress · Slider',        desc:'진행률 · 범위 선택' },
      { id:'tabs',      ico:'⧉', title:'Tabs · Segment',           desc:'콘텐츠 전환 · 모드 선택' },
      { id:'others',    ico:'▤', title:'Card',                     desc:'카드 컨테이너 · 조합 패턴' },
      { id:'banner',    ico:'▥', title:'Banner',                   desc:'이미지+텍스트 프로모션 · 6변형' },
    ]
  },
  'overlays': {
    title: 'Part 04 · Overlays · Navigation',
    desc: '페이지 위에 띄우는 표면과 앱 전체를 연결하는 네비게이션.',
    items: [
      { id:'dialog',  ico:'◫', title:'Dialog',              desc:'중단 필수 · 사용자의 결정이 필요한 순간' },
      { id:'sheet',   ico:'⌆', title:'Bottom Sheet',        desc:'모바일에서 Dialog 대체 · 하단 슬라이드' },
      { id:'popover', ico:'◈', title:'Popover · Tooltip',   desc:'짧은 설명 · 컨텍스트 메뉴 · Date Picker' },
      { id:'appbar',  ico:'▬', title:'Top App Bar',         desc:'모바일 상단 고정 헤더' },
      { id:'tabbar',  ico:'▬', title:'Tab Bar',             desc:'모바일 하단 고정 · 주요 섹션 3~5개' },
      { id:'drawer',  ico:'◧', title:'Drawer · Breadcrumb', desc:'주 메뉴 패널 · 계층 경로' },
    ]
  },
  'states': {
    title: 'Part 05 · States',
    desc: '로딩과 비어 있음 — 사용자가 "기다린다"는 순간을 어떻게 디자인할 것인가.',
    items: [
      { id:'skeleton', ico:'▨', title:'Skeleton Loader', desc:'500ms 이상 로딩의 그림자' },
      { id:'empty',    ico:'◌', title:'Empty State',     desc:'First use · Search · Error 3가지 유형' },
    ]
  },
  'density': {
    title: 'Part 06 · Density',
    desc: '많은 정보를 한 화면에 — 정렬과 접힘으로 밀도를 올립니다.',
    items: [
      { id:'table',     ico:'⊞', title:'Data Table',        desc:'정렬 · 비교 · 상태 칩 · 진행률' },
      { id:'accordion', ico:'⌄', title:'Accordion · Tree',  desc:'FAQ · 폼 섹션 · 폴더 구조' },
    ]
  },
  'demo': {
    title: 'Part 07 · 실제 사용 데모',
    desc: '디자인시스템만으로 만들 수 있는 실제 서비스 화면들. 스플래시부터 결제 완료까지, 같은 토큰·같은 컴포넌트로 어떻게 다른 맥락을 빚어내는지.',
    items: [
      { id:'demo-splash',    ico:'🚀', title:'Splash',       desc:'앱이 켜지는 1.5초 · 브랜드 인각' },
      { id:'demo-login',     ico:'🔑', title:'로그인',        desc:'소셜 로그인 · 이메일/패스워드' },
      { id:'demo-signup',    ico:'✍', title:'회원가입',      desc:'단계 표시 · 약관 동의 · 필수 검증' },
      { id:'demo-community', ico:'💬', title:'커뮤니티',      desc:'피드 · 카드 · 아바타 · FAB' },
      { id:'demo-store',     ico:'🛍', title:'스토어',        desc:'상품 그리드 · 할인 뱃지 · 장바구니' },
      { id:'demo-pricing',   ico:'💎', title:'요금제',        desc:'Segment · 플랜 카드 · Sticky CTA' },
      { id:'demo-calendar',  ico:'📅', title:'달력',          desc:'월 그리드 · 이벤트 도트 · 일정 상세' },
      { id:'demo-todo',      ico:'✓',  title:'To-do List',    desc:'진행률 · 우선순위 · 체크박스' },
      { id:'demo-booking',   ico:'🍽', title:'맛집 예약',      desc:'위치 필터 · 섹션별 BEST · 가격대 탭' },
      { id:'demo-foodorder', ico:'🛵', title:'배달',          desc:'쿠폰 배너 · 5-way 탭 · 카테고리 그리드 · 무료배달 파트너' },
      { id:'demo-shopping',  ico:'🛒', title:'쇼핑몰 홈',      desc:'브랜드 헤더 · 캐러셀 · 쿠폰 뱃지 상품' },
      { id:'demo-social',    ico:'👥', title:'소셜 모임',      desc:'히어로 배너 · 이중 CTA · 모임 카드' },
      { id:'demo-banking',   ico:'💳', title:'뱅킹 홈',        desc:'계좌 카드 · 퀵 액션 · 거래 내역' },
      { id:'demo-map',       ico:'📍', title:'지도 탐색',      desc:'검색 오버레이 · POI 핀 · 바텀 시트' },
      { id:'demo-mypage',    ico:'👤', title:'마이페이지',     desc:'아바타 · 통계 · 메뉴 리스트' },
      { id:'demo-chat',      ico:'💭', title:'채팅 리스트',    desc:'대화방 · 안 읽음 뱃지 · 검색' },
      { id:'demo-checkout',  ico:'✅', title:'결제 완료',      desc:'성공 피드백 · 주문 요약 · 영수증' },
      { id:'demo-notify',    ico:'🔔', title:'알림 센터',      desc:'그룹 리스트 · 타입 아이콘 · 읽음 표시' },
    ]
  },
};

// Home page content (shown when no hash)
const HOME = {
  title: 'UIUX-DH · Unified Design System',
  desc: '토큰부터 문장까지. 하나의 시스템, 누적되는 기록. 아래 카테고리를 클릭해 탐색을 시작하세요.',
  items: [
    { id:'getting-started', ico:'✦', title:'시작하기',              desc:'원칙 · 토큰 · 네이밍 · 정책 · UX Writing' },
    { id:'foundations',     ico:'◐', title:'Foundations',           desc:'Color · Typography · Sizing · Radius · Motion' },
    { id:'components',      ico:'▢', title:'Components',            desc:'기본 컴포넌트 15종' },
    { id:'overlays',        ico:'◫', title:'Overlays · Navigation', desc:'Dialog · Sheet · Popover · App Bar · Tab Bar · Drawer' },
    { id:'states',          ico:'▨', title:'States',                desc:'Skeleton · Empty State' },
    { id:'density',         ico:'⊞', title:'Density',               desc:'Data Table · Accordion · Tree' },
    { id:'demo',            ico:'◉', title:'실제 사용 데모',         desc:'18개 모바일 화면 데모' },
    { id:'changelog',       ico:'⎌', title:'Release & Governance',  desc:'버전 기록 · 거버넌스' },
  ]
};

// Section ids that represent categories (part-headers)
const CATEGORY_IDS = ['getting-started', 'foundations', 'components', 'overlays', 'states', 'density', 'demo'];

// Container for dynamic category view
let categoryView;
function ensureCategoryView() {
  if (categoryView) return categoryView;
  categoryView = document.createElement('div');
  categoryView.className = 'category-view';
  categoryView.id = 'category-view';
  const container = document.querySelector('.container');
  const hero = container.querySelector('.hero');
  hero.parentNode.insertBefore(categoryView, hero.nextSibling);
  return categoryView;
}

function renderCategoryView(catKey) {
  const cat = catKey === 'home' ? HOME : CATEGORIES[catKey];
  if (!cat) return false;
  ensureCategoryView();
  const breadcrumbHTML = catKey === 'home' ? '' :
    `<div class="category-breadcrumb"><a href="#">홈</a> › <span>${cat.title.split(' · ').pop() || cat.title}</span></div>`;
  const itemsHTML = cat.items.map(item => `
    <a class="cat-card" href="#${item.id === 'home' ? '' : item.id}">
      <div class="cat-card-ico">${item.ico}</div>
      <h3>${item.title}</h3>
      <p>${item.desc}</p>
      <div class="cat-card-meta">자세히 보기 →</div>
    </a>
  `).join('');
  categoryView.innerHTML = `
    ${breadcrumbHTML}
    <h1 class="category-title">${cat.title}</h1>
    <p class="category-desc">${cat.desc}</p>
    <div class="category-grid">${itemsHTML}</div>
  `;
  categoryView.classList.add('is-active');
  return true;
}

function hideCategoryView() {
  if (categoryView) categoryView.classList.remove('is-active');
}

function hideAllSections() {
  document.querySelectorAll('.is-route-active').forEach(el => el.classList.remove('is-route-active'));
  hideCategoryView();
}

function showHome() {
  hideAllSections();
  renderCategoryView('home');
}

function showSection(id) {
  hideAllSections();
  const el = document.getElementById(id);
  if (!el) return showHome();
  el.classList.add('is-route-active');
  try { window.scrollTo(0, 0); } catch(e) {}
}

function highlightSidebar(id) {
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('is-active'));
  const link = document.querySelector(`.sidebar-link[data-section="${id}"]`);
  if (!link) return;
  link.classList.add('is-active');
  // Auto-expand parent expandable ONLY when the active link is a sub-item.
  // For category links themselves, defer to manual user toggle (handler below)
  // so the user can collapse the category they are currently viewing.
  const sub = link.closest('.sidebar-sub');
  if (sub) {
    const exp = sub.closest('.sidebar-expandable');
    if (exp) exp.classList.add('is-open');
  }
}

function route() {
  const hash = location.hash.replace(/^#\/?/, '').trim();
  if (!hash) {
    showHome();
    highlightSidebar('home');
    return;
  }
  // Category?
  if (CATEGORY_IDS.includes(hash)) {
    hideAllSections();
    renderCategoryView(hash);
    highlightSidebar(hash);
    window.scrollTo({ top: 0, behavior: 'instant' });
    return;
  }
  // Leaf section
  showSection(hash);
  highlightSidebar(hash);
}

window.addEventListener('hashchange', route);
window.addEventListener('DOMContentLoaded', route);
// Initial route if DOMContentLoaded already passed
if (document.readyState !== 'loading') route();

/* ============ SIDEBAR INTERACTIONS ============ */

/* Expandable group toggle:
   - Same hash (already on this category) → toggle open/close
   - Different hash → ensure open, then let navigation proceed */
document.querySelectorAll('.sidebar-expandable > .sidebar-link').forEach(trig => {
  trig.addEventListener('click', (e) => {
    const parent = trig.parentElement;
    const targetHash = trig.getAttribute('href') || '';
    const currentHash = location.hash || '';
    if (targetHash === currentHash) {
      // Same destination — manual toggle (open ↔ close)
      parent.classList.toggle('is-open');
    } else {
      // Different destination — open and let href navigate
      parent.classList.add('is-open');
    }
    // Mobile: don't auto-close sidebar when toggling category header
    // (user might want to click a sub-item next)
  });
});

/* Close sidebar on mobile when clicking a leaf link */
document.querySelectorAll('.sidebar-sub .sidebar-link').forEach(link => {
  link.addEventListener('click', () => closeSidebarMobile());
});
document.querySelectorAll('.sidebar-group > .sidebar-nav > li > a.sidebar-link:not(.is-external)').forEach(link => {
  // Non-expandable top-level leaf links
  if (!link.parentElement.classList.contains('sidebar-expandable')) {
    link.addEventListener('click', () => closeSidebarMobile());
  }
});

/* ESC key closes sidebar on mobile */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeSidebar();
});

/* ============ DEMO DEPENDENCY MATRIX ============
   Each demo section declares its design-system dependencies via `data-uses`.
   On load, we:
   1. Build a matrix: which component/token → which demos use it.
   2. Validate referenced CSS variables (--sm-*, --p-*, --cm-*) exist at runtime.
   3. Expose `window.demoMatrix` for introspection / future governance.

   ⚠ When a component or token is modified, `demoMatrix.byComponent[<name>]`
   tells you exactly which demos must be re-verified.
*/
function buildDemoMatrix() {
  const sections = document.querySelectorAll('.demo-section[data-uses]');
  const byDemo = {};
  const byComponent = {};
  const byToken = {};
  const missingTokens = [];
  const rootStyles = getComputedStyle(document.documentElement);

  sections.forEach(sec => {
    const id = sec.id;
    const raw = (sec.getAttribute('data-uses') || '').trim();
    if (!raw) return;
    const parts = raw.split(',').map(s => s.trim()).filter(Boolean);
    const comps = [];
    const toks = [];
    parts.forEach(part => {
      if (part.startsWith('--')) {
        toks.push(part);
        if (!rootStyles.getPropertyValue(part).trim()) {
          missingTokens.push({ demo: id, token: part });
        }
        (byToken[part] = byToken[part] || []).push(id);
      } else {
        comps.push(part);
        (byComponent[part] = byComponent[part] || []).push(id);
      }
    });
    byDemo[id] = { components: comps, tokens: toks };
  });

  const matrix = { byDemo, byComponent, byToken, missingTokens };
  window.demoMatrix = matrix;
  if (missingTokens.length) {
    console.warn('[demoMatrix] Referenced CSS tokens not found at runtime:', missingTokens);
  }
  return matrix;
}
window.addEventListener('DOMContentLoaded', buildDemoMatrix);

/* ============ DEMO: Calendar grid generation ============ */
function renderCalendarGrid() {
  const grid = document.getElementById('calendar-grid');
  if (!grid) return;
  grid.innerHTML = '';
  // April 2026: starts on Wednesday (day 3), has 30 days
  const firstDay = 3; // 0 = Sun
  const daysInMonth = 30;
  const today = 22;
  const eventDays = new Set([3, 8, 15, 22, 25, 28]);

  // Leading blanks
  for (let i = 0; i < firstDay; i++) {
    const blank = document.createElement('div');
    blank.style.aspectRatio = '1';
    grid.appendChild(blank);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement('div');
    const dayOfWeek = (firstDay + d - 1) % 7;
    const isToday = d === today;
    const isSunday = dayOfWeek === 0;
    const hasEvent = eventDays.has(d);
    cell.style.cssText = `
      aspect-ratio:1; display:flex; flex-direction:column;
      align-items:center; justify-content:center; gap:3px;
      border-radius:10px; cursor:pointer;
      font:${isToday ? '700' : '500'} 14px/1 var(--font-sans);
      color:${isToday ? '#fff' : (isSunday ? 'var(--sm-status-error)' : 'var(--sm-content-primary)')};
      background:${isToday ? 'var(--sm-interactive-brand-default)' : 'transparent'};
    `;
    cell.innerHTML = `
      <span>${d}</span>
      ${hasEvent ? `<span style="width:4px;height:4px;border-radius:50%;background:${isToday ? '#fff' : 'var(--sm-interactive-brand-default)'};"></span>` : '<span style="width:4px;height:4px;"></span>'}
    `;
    grid.appendChild(cell);
  }
}
// Render calendar grid whenever user navigates to demo-calendar
function maybeRenderCalendar() {
  if (location.hash.replace(/^#\/?/, '') === 'demo-calendar') {
    setTimeout(renderCalendarGrid, 10);
  }
}
window.addEventListener('hashchange', maybeRenderCalendar);
maybeRenderCalendar();

function toggleAccordion(trigger) {
  const item = trigger.parentElement;
  item.classList.toggle('open');
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.05 });

document.querySelectorAll('section.section, section.component-section, .part-header').forEach(sec => {
  sec.style.opacity = '0';
  sec.style.transform = 'translateY(16px)';
  sec.style.transition = 'opacity 500ms cubic-bezier(0.2, 0, 0, 1), transform 500ms cubic-bezier(0.2, 0, 0, 1)';
  observer.observe(sec);
});

const chartObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const bars = entry.target.querySelectorAll('.hbar-fill, .progress-fill, .slider-fill, .stack-seg');
      bars.forEach((bar, i) => {
        const original = bar.style.width;
        bar.style.width = '0%';
        setTimeout(() => { bar.style.width = original; }, 100 + i * 60);
      });
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('#chart, #progress').forEach(s => chartObserver.observe(s));

// ─────────────────────────────────────────
// Markdown Download Buttons (per-section)
// 각 #페이지 헤더 우상단에 'Markdown' 버튼 주입.
// 클릭 시 ${name} Design Guide.md 파일로 다운로드.
// ─────────────────────────────────────────
const MD_DOWNLOAD_ICON_SVG = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/></svg>';

// docs/ + foundations/ 매핑 (id ↔ 표시명 ↔ md 경로)
// CATEGORIES의 섹션 id를 실제 .md 파일 경로로 흡수.
const STATIC_DOC_MAP = {
  // docs/
  'about':       { name: '디자인시스템이란', md: 'docs/00-overview.md' },
  'principles':  { name: '6가지 원칙',       md: 'docs/01-principles.md' },
  'tokens':      { name: '토큰 아키텍처',     md: 'docs/02-token-architecture.md' },
  'naming':      { name: '네이밍 컨벤션',     md: 'docs/03-naming-conventions.md' },
  'policy':      { name: '그라데이션 정책',   md: 'docs/04-gradient-policy.md' },
  'writing':     { name: 'UX Writing 7원칙',  md: 'docs/05-ux-writing.md' },
  // foundations/
  'color':       { name: 'Color',            md: 'foundations/color.md' },
  'typography':  { name: 'Typography',       md: 'foundations/typography.md' },
  'sizing':      { name: 'Sizing',           md: 'foundations/spacing.md' },
  'radius':      { name: 'Radius',           md: 'foundations/radius.md' },
  'motion':      { name: 'Motion',           md: 'foundations/motion.md' },
};

let mdMappingCache = null;

async function loadMdMapping() {
  if (mdMappingCache) return mdMappingCache;
  const map = new Map();
  // 1) Docs/Foundations 정적 매핑
  for (const [id, info] of Object.entries(STATIC_DOC_MAP)) {
    map.set(id, { name: info.name, md: info.md, kind: 'static' });
  }
  // 2) Components + Demos: system.json
  try {
    const res = await fetch('system.json', { cache: 'force-cache' });
    if (res.ok) {
      const data = await res.json();
      for (const c of (data.components || [])) {
        if (c && c.id && c.md) {
          map.set(c.id, { name: c.name || c.id, md: c.md, kind: 'static' });
        }
      }
      for (const d of (data.demos || [])) {
        if (d && d.id) {
          map.set(d.id, { name: d.title || d.id, md: null, kind: 'demo' });
        }
      }
    }
  } catch (e) {
    console.warn('[md-download] system.json load failed:', e);
  }
  mdMappingCache = map;
  return map;
}

function buildMdButton(id, entry) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn-sm btn-ghost md-download-btn';
  btn.dataset.mdId = id;
  btn.dataset.mdName = entry.name;
  btn.dataset.mdKind = entry.kind;
  if (entry.md) btn.dataset.mdPath = entry.md;
  btn.setAttribute('aria-label', entry.name + ' Design Guide 마크다운 다운로드');
  btn.setAttribute('title', entry.name + ' Design Guide.md 다운로드');
  btn.innerHTML = MD_DOWNLOAD_ICON_SVG + '<span>Markdown</span>';
  return btn;
}

async function initMarkdownDownloadButtons() {
  const map = await loadMdMapping();
  const sections = document.querySelectorAll(
    'section.component-section, section.demo-section, section.section'
  );
  sections.forEach(section => {
    const id = section.id;
    if (!id) return;
    const entry = map.get(id);
    if (!entry) return;
    if (section.querySelector(':scope > .section-head > .md-download-btn, :scope > .demo-header > .md-download-btn, :scope > .section-header > .md-download-btn')) return;
    const head = section.querySelector(':scope > .section-head, :scope > .demo-header, :scope > .section-header');
    if (!head) return;
    head.appendChild(buildMdButton(id, entry));
  });
}

function triggerDownload(filename, text) {
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function generateDemoMarkdown(demoId, title) {
  const sec = document.getElementById(demoId);
  const desc = sec && sec.querySelector('.demo-header p') ? sec.querySelector('.demo-header p').textContent.trim() : '';
  const label = sec && sec.querySelector('.demo-header .demo-label') ? sec.querySelector('.demo-header .demo-label').textContent.trim() : '';
  const usesAttr = sec ? (sec.dataset.uses || '') : '';
  const uses = usesAttr.split(',').map(s => s.trim()).filter(Boolean);
  const components = uses.filter(u => !u.startsWith('--'));
  const tokens = uses.filter(u => u.startsWith('--'));
  const lines = [
    '---',
    'demo: ' + title,
    'id: ' + demoId,
    'sourceHtml: "index.html#' + demoId + '"',
    'generated: true',
    '---',
    '',
    '# ' + title + ' Design Guide',
    '',
  ];
  if (label) { lines.push('> ' + label, ''); }
  if (desc)  { lines.push(desc, ''); }
  lines.push('## 사용 컴포넌트');
  lines.push(components.length ? components.map(c => '- `' + c + '`').join('\n') : '_없음_');
  lines.push('', '## 사용 토큰');
  lines.push(tokens.length ? tokens.map(t => '- `' + t + '`').join('\n') : '_없음_');
  lines.push('', '---', '_이 문서는 `data-uses` 속성에서 자동 생성되었습니다._');
  return lines.join('\n');
}

async function handleMdDownloadClick(e) {
  const btn = e.target.closest('.md-download-btn');
  if (!btn) return;
  e.preventDefault();
  if (btn.disabled) return;
  btn.disabled = true;
  const { mdId, mdName, mdKind, mdPath } = btn.dataset;
  try {
    let text;
    if (mdKind === 'demo') {
      text = generateDemoMarkdown(mdId, mdName);
    } else if (mdPath) {
      const res = await fetch(mdPath);
      if (!res.ok) throw new Error(mdPath + ' → ' + res.status);
      text = await res.text();
    } else {
      throw new Error('no md path');
    }
    triggerDownload(mdName + ' Design Guide.md', text);
  } catch (err) {
    console.error('[md-download]', err);
    alert('마크다운을 불러오지 못했습니다: ' + mdName);
  } finally {
    btn.disabled = false;
  }
}

document.addEventListener('click', handleMdDownloadClick);
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initMarkdownDownloadButtons);
} else {
  initMarkdownDownloadButtons();
}
