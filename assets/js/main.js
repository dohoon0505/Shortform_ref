const STORE = {
  meta: {},
  trends: [],
  templates: [],
  archetypes: [],
  trendBySlug: {},
  templateBySlug: {}
};

const TEMPLATE_STYLES = [
  { color: '#7968ee', soft: '#7968ee' },
  { color: '#ff735f', soft: '#ff735f' },
  { color: '#4b8cff', soft: '#4b8cff' },
  { color: '#28a66d', soft: '#28a66d' },
  { color: '#e6ad1c', soft: '#e6ad1c' }
];

let activeFilter = '전체';
let searchQuery = '';
let toastTimer;

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function icon(name, className = '') {
  return `<svg${className ? ` class="${className}"` : ''} aria-hidden="true"><use href="#i-${name}"/></svg>`;
}

function templateSlug(template, index) {
  return template.slug || ['hook', 'story', 'tutorial', 'ugc', 'trend'][index] || `item-${index + 1}`;
}

function platformClass(slug) {
  if (slug.includes('youtube')) return 'platform-youtube';
  if (slug.includes('instagram')) return 'platform-instagram';
  return 'platform-tiktok';
}

async function loadData() {
  const response = await fetch('templates.json', { cache: 'no-store' });
  if (!response.ok) throw new Error(`데이터 로드 실패: ${response.status}`);
  const data = await response.json();
  STORE.meta = data.meta || {};
  STORE.trends = Array.isArray(data.trends) ? data.trends : [];
  STORE.templates = Array.isArray(data.templates) ? data.templates : [];
  STORE.archetypes = Array.isArray(data.archetypes) ? data.archetypes : [];
  STORE.trendBySlug = Object.fromEntries(STORE.trends.map(item => [item.slug, item]));
  STORE.templates.forEach((item, index) => {
    item.slug = templateSlug(item, index);
    STORE.templateBySlug[item.slug] = item;
  });
}

/* Theme */
function syncTheme() {
  const dark = document.body.dataset.theme === 'dark';
  const label = document.getElementById('theme-label');
  const description = document.getElementById('theme-description');
  if (label) label.textContent = dark ? 'Light' : 'Dark';
  if (description) description.textContent = dark ? '다크 모드' : '라이트 모드';
}

function toggleTheme() {
  const next = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
  document.body.dataset.theme = next;
  try { localStorage.setItem('shortform-theme', next); } catch (_) {}
  syncTheme();
}

function initTheme() {
  try {
    const saved = localStorage.getItem('shortform-theme');
    if (saved === 'dark' || saved === 'light') document.body.dataset.theme = saved;
  } catch (_) {}
  syncTheme();
}

/* Sidebar */
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const scrim = document.querySelector('.sidebar-scrim');
  const open = sidebar.classList.toggle('is-open');
  scrim.classList.toggle('is-visible', open);
  document.body.classList.toggle('is-locked', open);
}

function closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('is-open');
  document.querySelector('.sidebar-scrim')?.classList.remove('is-visible');
  document.body.classList.remove('is-locked');
}

function closeSidebarMobile() {
  if (window.matchMedia('(max-width: 920px)').matches) closeSidebar();
}

function buildSidebar() {
  const trendNav = document.getElementById('trend-nav');
  const templateNav = document.getElementById('template-nav');
  trendNav.innerHTML = STORE.trends.map(item =>
    `<a class="nav-child" href="#/trends/${esc(item.slug)}" data-trend-nav="${esc(item.slug)}">${esc(item.name)}</a>`
  ).join('');
  // nav-child에는 동영상의 유형을 짧게 표기한다 (예: 블러셔 문제제기 반전)
  templateNav.innerHTML = STORE.templates.map(item =>
    `<a class="nav-child" href="#/templates/${esc(item.slug)}" data-template-nav="${esc(item.slug)}">${esc(item.navLabel || item.title)}</a>`
  ).join('');
  document.getElementById('template-total').textContent = STORE.templates.length;
  document.getElementById('library-count').textContent = STORE.templates.length;
}

function homePlatformMeta(platform = '') {
  const value = platform.toLowerCase();
  if (value.includes('youtube')) return { label: 'YOUTUBE', className: 'is-youtube' };
  if (value.includes('instagram')) return { label: 'INSTAGRAM', className: 'is-instagram' };
  return { label: 'TIKTOK', className: 'is-tiktok' };
}

function renderHomeTemplateStrip() {
  const target = document.getElementById('home-template-strip');
  if (!target) return;

  target.innerHTML = STORE.templates.map(item => {
    const reference = item.reference || {};
    const platform = homePlatformMeta(reference.platform);
    const url = String(reference.url || '').trim();
    const preview = url
      ? `<video src="${esc(url)}#t=0.1" muted playsinline preload="metadata" aria-hidden="true"></video>`
      : `<span class="home-template-fallback">${icon('play')}</span>`;
    return `
      <a class="home-template-embed" href="#/templates/${esc(item.slug)}" aria-label="${esc(item.title)} 템플릿 보기">
        <span class="home-template-media">${preview}</span>
        <span class="home-template-meta">
          <b>${esc(item.navLabel || item.title)}</b>
          <small class="home-platform ${platform.className}">${platform.label}</small>
        </span>
      </a>
    `;
  }).join('');
}

/* Trend pages */
function renderTrendCards() {
  const target = document.getElementById('trend-grid');
  target.innerHTML = STORE.trends.map(item => `
    <a class="trend-card" href="#/trends/${esc(item.slug)}">
      <span class="platform-mark ${platformClass(item.slug)}">${esc(item.shortName)}</span>
      <h2>${esc(item.name)}</h2>
      <span class="platform-tagline">${esc(item.tagline)}</span>
      <p>${esc(item.summary)}</p>
      <span>플랫폼 노트 읽기 ${icon('arrow')}</span>
    </a>
  `).join('');
}

function insightList(items) {
  return `<ul class="insight-list">${(items || []).map(item => {
    const [lead, ...rest] = String(item).split(' — ');
    return `<li>${rest.length ? `<strong>${esc(lead)}</strong> — ${esc(rest.join(' — '))}` : esc(item)}</li>`;
  }).join('')}</ul>`;
}

function renderTrendDetail(item) {
  const target = document.getElementById('view-trend-detail');
  const sources = (item.sources || []).map(source =>
    `<a href="${esc(source.url)}" target="_blank" rel="noopener">${esc(source.label)} ${icon('external')}</a>`
  ).join('');
  target.innerHTML = `
    <a class="back-link" href="#/trends">${icon('back')} 트렌드 전체</a>
    <div class="trend-detail-hero">
      <div>
        <h1>${esc(item.name)}</h1>
        <p>${esc(item.summary)}</p>
      </div>
      <span class="platform-mark ${platformClass(item.slug)}">${esc(item.shortName)}</span>
    </div>
    <div class="trend-summary">
      <div><span>플랫폼 핵심</span><b>${esc(item.focus)}</b></div>
      <div><span>주요 시청 방식</span><b>${esc(item.viewerMode)}</b></div>
      <div><span>효과적인 광고</span><b>${esc(item.bestAd)}</b></div>
    </div>
    <div class="trend-doc-grid">
      <article class="trend-doc-card">
        <div class="doc-card-head"><span>01</span><h2>어떤 성격의 플랫폼인가</h2></div>
        ${insightList(item.character)}
      </article>
      <article class="trend-doc-card">
        <div class="doc-card-head"><span>02</span><h2>어떤 시청자가 많은가</h2></div>
        ${insightList(item.audience)}
      </article>
      <article class="trend-doc-card is-wide">
        <div class="doc-card-head"><span>03</span><h2>효과적인 광고 영상은 무엇인가</h2></div>
        <div class="ad-formula">
          ${(item.formula || []).map((step, index) => `<div><span>0${index + 1}</span><b>${esc(step)}</b></div>`).join('')}
        </div>
        ${insightList(item.adStrategy)}
      </article>
      <article class="trend-doc-card is-wide">
        <div class="doc-card-head"><span>04</span><h2>제작 전 체크리스트</h2></div>
        <div class="check-list">${(item.checks || []).map(check => `<span>${icon('check')} ${esc(check)}</span>`).join('')}</div>
      </article>
    </div>
    <div class="source-box">
      <b>공식 자료를 바탕으로 정리했습니다</b>
      <div class="source-links">${sources}</div>
    </div>
  `;
}

/* Template listing */
function buildFilters() {
  const target = document.getElementById('template-filters');
  const filters = ['전체', ...STORE.archetypes];
  target.innerHTML = filters.map(filter =>
    `<button class="filter-chip${filter === activeFilter ? ' is-active' : ''}" type="button" data-filter="${esc(filter)}">${esc(filter)}</button>`
  ).join('');
}

function templateMatches(item) {
  if (activeFilter !== '전체' && item.archetype !== activeFilter) return false;
  if (!searchQuery) return true;
  const text = [item.title, item.archetype, item.summary, item.reference?.platform, item.reference?.title].join(' ').toLowerCase();
  return text.includes(searchQuery.toLowerCase());
}

function renderTemplateGrid() {
  const target = document.getElementById('template-grid');
  const shown = STORE.templates.filter(templateMatches);
  if (!shown.length) {
    target.innerHTML = `<div class="empty-results"><b>맞는 템플릿이 없어요</b><span>검색어나 유형 필터를 바꿔 보세요.</span></div>`;
    return;
  }
  target.innerHTML = shown.map(item => {
    const originalIndex = STORE.templates.indexOf(item);
    const style = TEMPLATE_STYLES[originalIndex % TEMPLATE_STYLES.length];
    return `
      <a class="template-card" href="#/templates/${esc(item.slug)}" style="--card-color:${style.soft};--card-accent:${style.color}">
        <div class="template-topline">
          <span class="template-number">0${originalIndex + 1}</span>
          <span class="template-type">${esc(item.archetype)}</span>
        </div>
        <h2>${esc(item.title)}</h2>
        <p>${esc(item.summary)}</p>
        <footer>
          <span class="template-platform"><span class="platform-dot" aria-hidden="true"></span>${esc(item.reference?.platform || '')}</span>
          <span>상세 페이지 ${icon('arrow')}</span>
        </footer>
      </a>
    `;
  }).join('');
}

function renderTemplateLibrary() {
  buildFilters();
  renderTemplateGrid();
}

/* Template profile */
function refEmbed(reference) {
  const url = String(reference?.url || '').trim();
  if (!url) return `<div class="video-placeholder"><span>${icon('play')}</span></div>`;
  if (/\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url)) {
    return `<video src="${esc(url)}" controls preload="metadata" playsinline></video>`;
  }
  return `<iframe src="${esc(url)}" loading="lazy" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>`;
}

function profileList(items) {
  return `<ul class="profile-list">${(items || []).map(item => `<li>${esc(item)}</li>`).join('')}</ul>`;
}

/* 프롬프트 제작 가이드 — 영상 유형마다 필요한 요소가 다르므로,
   질문(필드) 목록은 templates.json의 builder.fields 가 정본이다. */
function builderFields(item) {
  return item.builder?.fields || [];
}

function blueprintPrompt(item, values = {}) {
  const reference = item.reference || {};
  const sourceBlueprint = item.blueprint?.text || '';
  const v = key => String(values[key] || '').trim();
  const varLines = builderFields(item)
    .map(field => `- [${field.var || field.question}]: ${v(field.key)}`)
    .join('\n');
  return `# 역할
당신은 숏폼 광고 전략가, 카피라이터, 촬영 감독, 편집 감독을 겸하는 제작 책임자입니다. 아래 기준 영상의 성공 구조를 분석 설명하는 데 그치지 말고, 교체 변수를 반영한 촬영 가능한 완성본을 만들어 주세요.

# 사용자가 교체할 변수
${varLines}
- [목표 길이]: ${reference.length || '30~45초'}

입력하지 않은 변수는 제품군과 타깃에 맞게 합리적으로 제안하되, 추정한 내용은 '제안'이라고 표시하세요. 기존 기준 영상의 브랜드명, 인물명, 고유 문장을 그대로 재사용하지 마세요.

# 반드시 설계할 내용
1. 후킹
- 0~1초 첫 프레임에서 타깃의 문제 또는 원하는 결과가 즉시 보이게 하세요.
- 1~3초 대사는 문제, 의외성, 구체적 효익 중 최소 두 가지를 포함하세요.
- 과장된 낚시 문구 대신 본문에서 실제로 증명 가능한 약속만 사용하세요.
- 서로 다른 접근의 후킹 문장 3개를 먼저 제안하고, 가장 적합한 하나를 선택해 이유를 설명하세요.

2. 구성·전개
- 후킹 → 문제 공감 → 해결책 등장 → 사용·증명 → 결과 → CTA의 인과관계가 끊기지 않게 설계하세요.
- 각 구간의 시작·종료 초, 역할, 화면, 행동, 대사, 자막, 사운드를 하나의 장면표에 적으세요.
- 3~5초마다 새로운 정보·시각 변화·질문 회수 중 하나를 배치해 이탈을 방지하세요.
- 제품 등장은 기준 구조의 타이밍을 따르되, 정보가 늦어진다면 열린 고리 문장을 추가하세요.

3. 카피·스크립트
- 실제 사람이 말할 수 있는 짧은 구어체로 작성하고 한 문장에는 한 메시지만 담으세요.
- 기능을 나열하지 말고 '문제 → 사용 장면 → 눈에 보이는 변화'로 번역하세요.
- 화면 자막은 대사를 그대로 반복하지 말고 핵심 명사·수치·결과만 12자 안팎으로 압축하세요.
- 최종 결과에 전체 내레이션 대본과 장면별 자막을 각각 분리해 제공하세요.

4. 편집·비주얼 리듬
- 각 컷의 길이, 샷 크기, 카메라 움직임, 전환 방식, B롤, 그래픽, 효과음을 구체적으로 지정하세요.
- 세로 9:16 안전 영역을 지키고, 제품·표정·증거 장면이 자막에 가리지 않게 하세요.
- 같은 샷 크기가 세 번 이상 연속되지 않도록 변주하고, 중요한 증거는 클로즈업 또는 분할 화면으로 확인시키세요.
- 배경음악의 분위기와 BPM 범위, 음악이 낮아지는 지점, 효과음이 필요한 지점을 편집표에 표시하세요.

5. 품질 검수
- 첫 3초 약속이 본문에서 회수되는지, 주장에 시각적 근거가 있는지, CTA가 앞 내용과 자연스럽게 연결되는지 확인하세요.
- 허위·과장 표현, 근거 없는 최상급, 실제로 촬영할 수 없는 장면은 사용하지 마세요.
- 저예산 스마트폰 촬영 기준의 대체 장면도 함께 제안하세요.

# 기준 영상 프로필
- 유형: ${item.archetype}
- 제목: ${reference.title || item.title}
- 플랫폼: ${reference.platform || '세로형 숏폼'}
- 이 구조를 선택한 이유: ${reference.why || item.summary}

# 기준 구조와 장면 규칙
${sourceBlueprint}

# 최종 출력 형식
1. 한 줄 콘셉트와 핵심 타깃
2. 선택한 후킹과 선택 이유
3. 전체 구성 요약: 구간별 목적과 감정 흐름
4. 촬영용 장면표: 타임코드 | 컷 길이 | 역할 | 샷·구도 | 행동 | 대사 | 자막 | 사운드·전환
5. 전체 내레이션 대본
6. 자막·카피 목록
7. 편집·비주얼 리듬 시트: 컷 속도, 색감, 조명, 음악, 효과음, 그래픽 규칙
8. 촬영 준비물과 스마트폰 촬영 대안
9. 게시 전 품질 검수 체크리스트

설명만 하지 말고 바로 촬영과 편집에 사용할 수 있는 완성본으로 작성하세요.`;
}

/* 영상 분석 리포트 — 항목 정의 (실제 분석 내용은 templates.json의 report에서) */
const REPORT_SECTIONS = [
  { key: 'hook', label: '후킹 분석' },
  { key: 'structure', label: '구성·전개 분석' },
  { key: 'script', label: '카피·스크립트 분석' },
  { key: 'edit', label: '편집·비주얼 리듬 분석' },
  { key: 'quality', label: '전체 품질 분석' },
];

function reportHTML(item) {
  const report = item.report || {};
  const cards = REPORT_SECTIONS.map((section, index) => {
    const rows = report[section.key];
    if (!Array.isArray(rows) || !rows.length) return '';
    return `
      <article class="report-card">
        <div class="doc-card-head"><span>0${index + 1}</span><h3>${esc(section.label)}</h3></div>
        <ul class="insight-list">${rows.map(row => `<li>${esc(row)}</li>`).join('')}</ul>
      </article>`;
  }).join('');
  if (!cards) return '';
  return `
    <section class="analysis-section">
      <div class="analysis-heading">
        <div><span>영상 분석 리포트</span><h2>기준 영상, 다섯 항목으로 분석</h2></div>
        <p>힉스필드 장면 분석을 바탕으로 이 영상이 왜 통했는지 항목별로 구분해 정리했습니다.</p>
      </div>
      <div class="report-grid">${cards}</div>
    </section>`;
}

function builderFieldHTML(field) {
  if (field.type === 'chips') {
    const chips = (field.options || []).map(option =>
      `<button class="builder-chip" type="button" data-chip-value="${esc(option)}">${esc(option)}</button>`
    ).join('');
    return `
      <div class="builder-field" data-builder-key="${esc(field.key)}" data-chip-group data-chip-multi="${field.multi ? '1' : ''}">
        <span class="builder-question">${esc(field.question)}${field.required ? ' <em>*</em>' : ''}</span>
        <div class="builder-chips">${chips}</div>
      </div>`;
  }
  return `
    <label class="builder-field">
      <span class="builder-question">${esc(field.question)}${field.required ? ' <em>*</em>' : ''}</span>
      <input type="text" data-builder-key="${esc(field.key)}" placeholder="${esc(field.placeholder || '')}" autocomplete="off">
    </label>`;
}

function builderHTML(item) {
  const fields = builderFields(item);
  if (!item.blueprint?.text || !fields.length) return '';
  return `
    <section class="analysis-section" id="builder-section">
      <div class="analysis-heading">
        <div><span>프롬프트 제작 가이드</span><h2>몇 가지만 답하면 프롬프트가 완성됩니다</h2></div>
        <p>영상 유형마다 필요한 요소가 다릅니다. 이 영상 구조에 맞는 질문에 답한 뒤 프롬프트 제작하기를 누르면, 복사해서 AI에 바로 전달할 수 있는 상세 프롬프트가 만들어집니다.</p>
      </div>
      <div class="builder" data-builder="${esc(item.slug)}">
        <form class="builder-form" autocomplete="off" onsubmit="return false">
          ${fields.map(builderFieldHTML).join('')}
          <button class="button button-primary builder-generate" type="button" data-generate="${esc(item.slug)}">프롬프트 제작하기</button>
          <p class="builder-note">비워 둔 항목은 AI가 상품과 타겟에 맞게 '제안'으로 채웁니다.</p>
        </form>
        <article class="builder-output-panel is-empty" id="builder-result">
          <div class="builder-output-head">
            <div><span>최종 프롬프트</span><b id="builder-status">질문에 답하고 프롬프트 제작하기를 눌러 주세요</b></div>
            <button class="copy-button" type="button" data-copy-blueprint="${esc(item.slug)}" disabled>${icon('copy')}<span>복사</span></button>
          </div>
          <pre class="builder-output" id="builder-output">아직 제작된 프롬프트가 없습니다.
왼쪽 질문에 답한 뒤 [프롬프트 제작하기]를 누르면
대본·장면표·편집 지시가 포함된 상세 프롬프트가 여기에 나타납니다.</pre>
        </article>
      </div>
    </section>`;
}

/* 영상 제작의 흐름 — 기준 영상의 단계별 제작 순서 (templates.json flow) */
function flowHTML(item) {
  const flow = item.flow || [];
  if (!flow.length) return '';
  return `
    <section class="dossier-section">
      <h3>영상 제작의 흐름</h3>
      <ol class="flow-list">
        ${flow.map((step, index) => `
          <li>
            <span class="flow-num">${index + 1}</span>
            <div class="flow-body">
              <b>${esc(step.label)}</b>
              <p>${esc(step.desc)}${step.note ? ` <small>· ${esc(step.note)}</small>` : ''}</p>
            </div>
          </li>`).join('')}
      </ol>
    </section>`;
}

function renderTemplateDetail(item) {
  builderGenerated = false;
  const target = document.getElementById('view-template-detail');
  const index = STORE.templates.indexOf(item);
  const previous = STORE.templates[index - 1];
  const next = STORE.templates[index + 1];
  const reference = item.reference || {};
  const hasUrl = String(reference.url || '').trim();
  const sourceLink = hasUrl ? `<a href="${esc(reference.url)}" target="_blank" rel="noopener">원본 열기 ${icon('external')}</a>` : '<span>기준 영상 직접 지정</span>';
  const nav = `
    <div class="template-next">
      ${previous ? `<a href="#/templates/${esc(previous.slug)}">이전 템플릿<b>← ${esc(previous.title)}</b></a>` : '<span></span>'}
      ${next ? `<a href="#/templates/${esc(next.slug)}">다음 템플릿<b>${esc(next.title)} →</b></a>` : ''}
    </div>`;

  target.innerHTML = `
    <a class="back-link" href="#/templates">${icon('back')} 템플릿 전체</a>
    <header class="template-profile-header">
      <div>
        <h1>${esc(item.title)}</h1>
        <p>${esc(item.summary)}</p>
      </div>
      <button class="button button-primary profile-copyall" type="button" data-scroll-builder>프롬프트 제작하기</button>
    </header>
    <article class="video-profile">
      <div class="profile-video-column">
        <div class="profile-video">${refEmbed(reference)}</div>
        <div class="video-caption"><b>${esc(reference.platform)}</b>${sourceLink}</div>
      </div>
      <div class="profile-dossier">
        <section class="dossier-intro">
          <div class="dossier-kicker"><span>기준 영상</span><span class="profile-badge">${esc(item.archetype)}</span></div>
          <h2>${esc(reference.title)}</h2>
          <p>${esc(reference.why)}</p>
        </section>
        <div class="profile-facts">
          <div class="profile-fact"><span>플랫폼</span><b>${esc(reference.platform)}</b></div>
          <div class="profile-fact"><span>영상 길이</span><b>${esc(reference.length)}</b></div>
          <div class="profile-fact"><span>판매상품</span><b>${esc(item.product || '-')}</b></div>
          <div class="profile-fact"><span>제작 난이도</span><b>${esc(item.difficulty || '-')}</b></div>
        </div>
        ${flowHTML(item)}
        <section class="dossier-section dossier-columns">
          <div><h3>강점</h3>${profileList(item.pros)}</div>
          <div><h3>주의할 점</h3>${profileList(item.cons)}</div>
        </section>
      </div>
    </article>
    ${reportHTML(item)}
    ${builderHTML(item)}
    ${nav}
  `;
}

/* Copy */
async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (_) {}
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.readOnly = true;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    textarea.remove();
    return success;
  } catch (_) { return false; }
}

function showToast(message, success = true) {
  const toast = document.getElementById('toast');
  toast.innerHTML = `${success ? icon('check') : ''}<span>${esc(message)}</span>`;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 1800);
}

/* Router */
function parsedRoute() {
  const clean = location.hash.replace(/^#\/?/, '').replace(/\/$/, '') || 'home';
  const [section, slug] = clean.split('/');
  return { section, slug };
}

function breadcrumbHTML(section, leaf) {
  const parts = [`<a href="#/home">숏폼광고 영상제작 연구소</a>`];
  if (section === 'trends') parts.push(`<a href="#/trends">트렌드</a>`);
  if (section === 'templates') parts.push(`<a href="#/templates">템플릿</a>`);
  if (section === 'guide') parts.push('<b>사용법</b>');
  if (leaf) {
    if (parts.length > 1) parts[parts.length - 1] = parts[parts.length - 1].replace('<a ', '<a ');
    parts.push(`<b>${esc(leaf)}</b>`);
  } else if (section === 'trends') parts[parts.length - 1] = '<b>트렌드</b>';
  else if (section === 'templates') parts[parts.length - 1] = '<b>템플릿</b>';
  return parts.join('<span>·</span>');
}

function highlightNavigation(section, slug) {
  document.querySelectorAll('[data-nav]').forEach(link => link.classList.toggle('is-active', link.dataset.nav === section));
  document.querySelectorAll('[data-trend-nav]').forEach(link => link.classList.toggle('is-active', section === 'trends' && link.dataset.trendNav === slug));
  document.querySelectorAll('[data-template-nav]').forEach(link => link.classList.toggle('is-active', section === 'templates' && link.dataset.templateNav === slug));
}

function showView(id) {
  document.querySelectorAll('.view').forEach(view => view.classList.remove('is-active'));
  document.getElementById(id)?.classList.add('is-active');
}

function route() {
  const { section, slug } = parsedRoute();
  let leaf = '';
  let title = '숏폼광고 영상제작 연구소';
  let validSection = section;

  if (section === 'home') {
    showView('view-home');
  } else if (section === 'trends' && !slug) {
    showView('view-trends');
    title = '트렌드 · 숏폼광고 영상제작 연구소';
  } else if (section === 'trends' && STORE.trendBySlug[slug]) {
    const item = STORE.trendBySlug[slug];
    renderTrendDetail(item);
    showView('view-trend-detail');
    leaf = item.name;
    title = `${item.name} 트렌드 · 숏폼광고 영상제작 연구소`;
  } else if (section === 'templates' && !slug) {
    renderTemplateLibrary();
    showView('view-templates');
    title = '템플릿 · 숏폼광고 영상제작 연구소';
  } else if (section === 'templates' && STORE.templateBySlug[slug]) {
    const item = STORE.templateBySlug[slug];
    renderTemplateDetail(item);
    showView('view-template-detail');
    leaf = item.title;
    title = `${item.title} · 숏폼광고 영상제작 연구소`;
  } else if (section === 'guide') {
    showView('view-guide');
    title = '사용법 · 숏폼광고 영상제작 연구소';
  } else {
    showView('view-not-found');
    validSection = '';
    title = '페이지를 찾지 못했습니다 · 숏폼광고 영상제작 연구소';
  }

  document.getElementById('breadcrumb').innerHTML = breadcrumbHTML(validSection, leaf);
  document.title = title;
  highlightNavigation(validSection, slug);
  closeSidebarMobile();
  window.scrollTo({ top: 0, behavior: 'instant' });
}

/* Builder — 답변 수집(텍스트 + 칩) → [프롬프트 제작하기]로 최종 프롬프트 생성 */
let builderGenerated = false;

function collectBuilderValues() {
  const values = {};
  document.querySelectorAll('[data-builder-key]').forEach(node => {
    const key = node.dataset.builderKey;
    if (node.hasAttribute('data-chip-group')) {
      const picked = [...node.querySelectorAll('.builder-chip.is-on')].map(chip => chip.dataset.chipValue);
      values[key] = picked.join(', ');
    } else {
      values[key] = node.value.trim();
    }
  });
  return values;
}

function generateBuilderOutput({ silent = false } = {}) {
  const wrap = document.querySelector('[data-builder]');
  if (!wrap) return;
  const item = STORE.templateBySlug[wrap.dataset.builder];
  if (!item) return;
  const values = collectBuilderValues();
  const output = document.getElementById('builder-output');
  const result = document.getElementById('builder-result');
  const copyButton = result?.querySelector('[data-copy-blueprint]');
  if (output) output.textContent = blueprintPrompt(item, values);
  if (result) result.classList.remove('is-empty');
  if (copyButton) copyButton.disabled = false;
  builderGenerated = true;
  const filled = Object.values(values).filter(Boolean).length;
  const status = document.getElementById('builder-status');
  if (status) status.textContent = `답변 ${filled}개 반영 완료 · 복사해서 AI에 바로 전달하세요`;
  if (!silent) {
    showToast('프롬프트가 완성됐어요 — 복사해서 AI에 붙여넣으세요');
    result?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

/* Events */
document.addEventListener('click', async event => {
  // 칩(중복/단일 선택) 토글
  const chip = event.target.closest('.builder-chip');
  if (chip) {
    const group = chip.closest('[data-chip-group]');
    const multi = group?.dataset.chipMulti === '1';
    if (!multi) {
      group.querySelectorAll('.builder-chip.is-on').forEach(other => { if (other !== chip) other.classList.remove('is-on'); });
    }
    chip.classList.toggle('is-on');
    if (builderGenerated) generateBuilderOutput({ silent: true });
    return;
  }

  // [프롬프트 제작하기]
  const generate = event.target.closest('[data-generate]');
  if (generate) {
    generateBuilderOutput();
    return;
  }

  // 상단 버튼 — 제작 가이드로 이동
  const scrollToBuilder = event.target.closest('[data-scroll-builder]');
  if (scrollToBuilder) {
    document.getElementById('builder-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  const blueprintCopy = event.target.closest('[data-copy-blueprint]');
  if (blueprintCopy) {
    if (!builderGenerated) generateBuilderOutput({ silent: true });
    const item = STORE.templateBySlug[blueprintCopy.dataset.copyBlueprint];
    const success = item?.blueprint?.text ? await copyText(blueprintPrompt(item, collectBuilderValues())) : false;
    showToast(success ? '최종 프롬프트를 복사했어요' : '복사하지 못했어요', success);
    return;
  }

  const filter = event.target.closest('[data-filter]');
  if (filter) {
    activeFilter = filter.dataset.filter;
    buildFilters();
    renderTemplateGrid();
    return;
  }

  if (event.target.closest('a[href^="#/"]')) closeSidebarMobile();
});

document.addEventListener('input', event => {
  if (event.target.matches('[data-builder-key]')) {
    // 이미 제작된 프롬프트가 있으면 입력에 따라 조용히 갱신
    if (builderGenerated) generateBuilderOutput({ silent: true });
    return;
  }
  if (event.target.id === 'template-search') {
    searchQuery = event.target.value.trim();
    renderTemplateGrid();
  }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeSidebar();
});

window.addEventListener('hashchange', route);

async function init() {
  initTheme();
  try {
    await loadData();
    buildSidebar();
    renderHomeTemplateStrip();
    renderTrendCards();
    renderTemplateLibrary();
    route();
  } catch (error) {
    console.error('[숏폼광고 영상제작 연구소]', error);
    document.querySelector('.main').innerHTML = `
      <section class="view is-active"><div class="empty-state"><span>LOAD ERROR</span><h1>콘텐츠를 불러오지 못했어요</h1><p>로컬 서버로 열었는지 확인해 주세요.</p></div></section>`;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
