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
  templateNav.innerHTML = STORE.templates.map(item =>
    `<a class="nav-child" href="#/templates/${esc(item.slug)}" data-template-nav="${esc(item.slug)}">${esc(item.title)}</a>`
  ).join('');
  document.getElementById('template-total').textContent = STORE.templates.length;
  document.getElementById('home-template-count').textContent = STORE.templates.length;
  document.getElementById('library-count').textContent = STORE.templates.length;
}

/* Trend pages */
function renderTrendCards() {
  const target = document.getElementById('trend-grid');
  target.innerHTML = STORE.trends.map((item, index) => `
    <a class="trend-card" href="#/trends/${esc(item.slug)}">
      <span class="platform-mark ${platformClass(item.slug)}">${esc(item.shortName)}</span>
      <span class="card-index">0${index + 1} / 03</span>
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
    <div class="trend-detail-hero" style="--detail-color:${esc(item.accent)}">
      <div>
        <span class="eyebrow"><i></i> PLATFORM PROFILE</span>
        <h1>${esc(item.name)}</h1>
        <p>${esc(item.summary)}</p>
      </div>
      <span class="platform-mark ${platformClass(item.slug)}">${esc(item.shortName)}</span>
    </div>
    <div class="trend-summary">
      <div><span>PLATFORM CORE</span><b>${esc(item.focus)}</b></div>
      <div><span>VIEWER MODE</span><b>${esc(item.viewerMode)}</b></div>
      <div><span>BEST AD TYPE</span><b>${esc(item.bestAd)}</b></div>
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
          <span class="template-platform"><i></i>${esc(item.reference?.platform || '')}</span>
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

function promptHTML(prompt, index) {
  return `
    <article class="prompt-item">
      <button class="prompt-head" type="button" aria-expanded="false">
        <span class="prompt-index">0${index + 1}</span>
        <span class="prompt-title"><b>${esc(prompt.label)}</b><small>${esc(prompt.desc)}</small></span>
        ${icon('chevron', 'prompt-chevron')}
      </button>
      <div class="prompt-body"><div class="prompt-body-inner">
        <div class="prompt-content">
          <div class="prompt-text">${esc(prompt.text)}</div>
          <div class="prompt-actions"><button class="copy-button" type="button" data-copy-prompt>${icon('copy')}<span>프롬프트 복사</span></button></div>
        </div>
      </div></div>
    </article>
  `;
}

function renderTemplateDetail(item) {
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
        <span class="eyebrow"><i></i> VIDEO PROFILE</span>
        <h1>${esc(item.title)}</h1>
        <p>${esc(item.summary)}</p>
      </div>
      <button class="button button-secondary profile-copyall" type="button" data-copy-all="${esc(item.slug)}">${icon('copy')} 전체 프롬프트 복사</button>
    </header>
    <article class="video-profile">
      <div class="profile-video-column">
        <div class="profile-video">${refEmbed(reference)}</div>
        <div class="video-caption"><b>${esc(reference.platform)}</b>${sourceLink}</div>
      </div>
      <div class="profile-dossier">
        <section class="dossier-intro">
          <div class="dossier-kicker"><span>REFERENCE FILM</span><span class="profile-badge">${esc(item.archetype)}</span></div>
          <h2>${esc(reference.title)}</h2>
          <p>${esc(reference.why)}</p>
        </section>
        <div class="profile-facts">
          <div class="profile-fact"><span>Platform</span><b>${esc(reference.platform)}</b></div>
          <div class="profile-fact"><span>Runtime</span><b>${esc(reference.length)}</b></div>
          <div class="profile-fact"><span>Reference</span><b>${esc(reference.creator || '기준 영상 직접 지정')}</b></div>
          <div class="profile-fact"><span>Analysis</span><b>${(item.prompts || []).length}개 프롬프트 · 블루프린트</b></div>
        </div>
        <section class="dossier-section">
          <h3>이 영상 프로필이 필요한 순간</h3>
          ${profileList(item.bestFor)}
        </section>
        <section class="dossier-section dossier-columns">
          <div><h3>강점</h3>${profileList(item.pros)}</div>
          <div><h3>주의할 점</h3>${profileList(item.cons)}</div>
        </section>
      </div>
    </article>
    <section class="analysis-section">
      <div class="analysis-heading">
        <div><span>PROFILE ANALYSIS</span><h2>영상 해부 노트</h2></div>
        <p>프로필을 읽듯 항목을 하나씩 펼쳐 보세요. 필요한 프롬프트만 골라 복사할 수 있습니다.</p>
      </div>
      <div class="prompt-list">${(item.prompts || []).map(promptHTML).join('')}</div>
      ${item.blueprint?.text ? `
        <article class="blueprint-panel">
          <div class="blueprint-head">
            <div><span>REPRODUCTION BLUEPRINT</span><h3>재현 블루프린트</h3><p>${esc(item.blueprint.desc)}</p></div>
            <div class="blueprint-actions">
              <button class="copy-button blueprint-toggle" type="button" data-toggle-blueprint>전문 보기</button>
              <button class="copy-button" type="button" data-copy-blueprint="${esc(item.slug)}">${icon('copy')}<span>복사</span></button>
            </div>
          </div>
          <div class="blueprint-body">${esc(item.blueprint.text)}</div>
        </article>` : ''}
    </section>
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

function allPromptsText(item) {
  const prompts = (item.prompts || []).map((prompt, index) => `## ${index + 1}. ${prompt.label}\n${prompt.text}`).join('\n\n────────────\n\n');
  return `${item.title}\n${item.summary}\n\n${prompts}`;
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
  const parts = [`<a href="#/home">숏폼 연구소</a>`];
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
  let title = '숏폼 연구소';
  let validSection = section;

  if (section === 'home') {
    showView('view-home');
  } else if (section === 'trends' && !slug) {
    showView('view-trends');
    title = '트렌드 · 숏폼 연구소';
  } else if (section === 'trends' && STORE.trendBySlug[slug]) {
    const item = STORE.trendBySlug[slug];
    renderTrendDetail(item);
    showView('view-trend-detail');
    leaf = item.name;
    title = `${item.name} 트렌드 · 숏폼 연구소`;
  } else if (section === 'templates' && !slug) {
    renderTemplateLibrary();
    showView('view-templates');
    title = '템플릿 · 숏폼 연구소';
  } else if (section === 'templates' && STORE.templateBySlug[slug]) {
    const item = STORE.templateBySlug[slug];
    renderTemplateDetail(item);
    showView('view-template-detail');
    leaf = item.title;
    title = `${item.title} · 숏폼 연구소`;
  } else if (section === 'guide') {
    showView('view-guide');
    title = '사용법 · 숏폼 연구소';
  } else {
    showView('view-not-found');
    validSection = '';
    title = '페이지를 찾지 못했습니다 · 숏폼 연구소';
  }

  document.getElementById('breadcrumb').innerHTML = breadcrumbHTML(validSection, leaf);
  document.title = title;
  highlightNavigation(validSection, slug);
  closeSidebarMobile();
  window.scrollTo({ top: 0, behavior: 'instant' });
}

/* Events */
document.addEventListener('click', async event => {
  const promptHead = event.target.closest('.prompt-head');
  if (promptHead) {
    const item = promptHead.closest('.prompt-item');
    const open = item.classList.toggle('is-open');
    promptHead.setAttribute('aria-expanded', String(open));
    return;
  }

  const promptCopy = event.target.closest('[data-copy-prompt]');
  if (promptCopy) {
    const text = promptCopy.closest('.prompt-content')?.querySelector('.prompt-text')?.textContent || '';
    const success = await copyText(text);
    if (success) {
      promptCopy.classList.add('is-copied');
      promptCopy.querySelector('span').textContent = '복사됨';
      setTimeout(() => { promptCopy.classList.remove('is-copied'); promptCopy.querySelector('span').textContent = '프롬프트 복사'; }, 1300);
    }
    showToast(success ? '프롬프트를 복사했어요' : '복사하지 못했어요', success);
    return;
  }

  const allCopy = event.target.closest('[data-copy-all]');
  if (allCopy) {
    const item = STORE.templateBySlug[allCopy.dataset.copyAll];
    const success = item ? await copyText(allPromptsText(item)) : false;
    showToast(success ? '전체 프롬프트를 복사했어요' : '복사하지 못했어요', success);
    return;
  }

  const blueprintToggle = event.target.closest('[data-toggle-blueprint]');
  if (blueprintToggle) {
    const panel = blueprintToggle.closest('.blueprint-panel');
    const open = panel.classList.toggle('is-open');
    blueprintToggle.textContent = open ? '접기' : '전문 보기';
    return;
  }

  const blueprintCopy = event.target.closest('[data-copy-blueprint]');
  if (blueprintCopy) {
    const item = STORE.templateBySlug[blueprintCopy.dataset.copyBlueprint];
    const success = item?.blueprint?.text ? await copyText(item.blueprint.text) : false;
    showToast(success ? '재현 블루프린트를 복사했어요' : '복사하지 못했어요', success);
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
    renderTrendCards();
    renderTemplateLibrary();
    route();
  } catch (error) {
    console.error('[숏폼 연구소]', error);
    document.querySelector('.main').innerHTML = `
      <section class="view is-active"><div class="empty-state"><span>LOAD ERROR</span><h1>콘텐츠를 불러오지 못했어요</h1><p>로컬 서버로 열었는지 확인해 주세요.</p></div></section>`;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
