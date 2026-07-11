/* ================================================================
   숏폼 연구소 · 템플릿 저장공간
   - templates.json 을 읽어 저장공간을 렌더링
   - 프롬프트 복사(항목별 / 전체), 아키타입 필터, 검색, 라이트/다크
   ================================================================ */

/* ============ THEME ============ */
function syncThemeUI() {
  const theme = document.body.getAttribute('data-theme') || 'light';
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  // labels/icons describe the action (switch to the OTHER theme)
  set('theme-icon', theme === 'light' ? '☾' : '☀');
  set('theme-label', theme === 'light' ? 'Dark' : 'Light');
  set('sidebar-theme-icon', theme === 'light' ? '☾' : '☀');
  set('sidebar-theme-label', theme === 'light' ? 'Dark' : 'Light');
  set('theme-sub', theme === 'light' ? 'Light Mode' : 'Dark Mode');
}
function toggleTheme() {
  const next = document.body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  document.body.setAttribute('data-theme', next);
  syncThemeUI();
  try { localStorage.setItem('sl-theme', next); } catch (e) {}
}
(function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem('sl-theme'); } catch (e) {}
  if (saved === 'light' || saved === 'dark') document.body.setAttribute('data-theme', saved);
  syncThemeUI();
})();

/* ============ SIDEBAR ============ */
function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  const scrim = document.querySelector('.sidebar-scrim');
  const open = sb.classList.toggle('is-open');
  if (scrim) {
    if (open) { scrim.classList.add('is-open'); requestAnimationFrame(() => scrim.classList.add('is-visible')); document.body.style.overflow = 'hidden'; }
    else { scrim.classList.remove('is-visible'); setTimeout(() => scrim.classList.remove('is-open'), 200); document.body.style.overflow = ''; }
  }
}
function closeSidebar() {
  const sb = document.getElementById('sidebar');
  const scrim = document.querySelector('.sidebar-scrim');
  sb.classList.remove('is-open');
  if (scrim) { scrim.classList.remove('is-visible'); setTimeout(() => scrim.classList.remove('is-open'), 200); }
  document.body.style.overflow = '';
}
function closeSidebarMobile() {
  if (window.matchMedia('(max-width: 1099px)').matches) closeSidebar();
}
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSidebar(); });

/* ============ STATE ============ */
const STORE = { meta: {}, archetypes: [], templates: [], byId: {} };
let activeFilter = 'all';
let searchQuery = '';
let dataLoaded = false;

/* ============ HELPERS ============ */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
const svg = (id, cls) => `<svg${cls ? ` class="${cls}"` : ''} aria-hidden="true"><use href="#${id}"/></svg>`;

/* ============ DATA LOAD ============ */
async function loadData() {
  // no-store: templates.json 편집 후 새로고침 시 항상 최신 데이터를 읽는다
  const res = await fetch('templates.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('templates.json ' + res.status);
  const data = await res.json();
  STORE.meta = data.meta || {};
  STORE.templates = Array.isArray(data.templates) ? data.templates : [];
  STORE.byId = {};
  STORE.templates.forEach(t => { STORE.byId[t.id] = t; });
  // archetypes (respect declared order, else first-seen)
  const declared = Array.isArray(data.archetypes) ? data.archetypes.slice() : [];
  STORE.templates.forEach(t => { if (t.archetype && !declared.includes(t.archetype)) declared.push(t.archetype); });
  STORE.archetypes = declared;
  dataLoaded = true;
}

function countByArchetype(a) {
  return STORE.templates.filter(t => t.archetype === a).length;
}

/* ============ BUILD NAV / CHIPS ============ */
function buildSidebarArchetypes() {
  const ul = document.getElementById('sidebar-archetypes');
  const total = document.getElementById('sb-total-count');
  if (total) total.textContent = STORE.templates.length;
  if (!ul) return;
  ul.innerHTML = STORE.archetypes.map(a => `
    <li><a class="sidebar-link" href="#templates" data-filter="${esc(a)}">
      <span class="ico">•</span>${esc(a)}<span class="count">${countByArchetype(a)}</span>
    </a></li>`).join('');
  const homeCount = document.getElementById('home-tpl-count');
  if (homeCount) homeCount.textContent = `템플릿 ${STORE.templates.length}종 살펴보기 →`;
}

function buildChips() {
  const wrap = document.getElementById('tpl-chips');
  if (!wrap) return;
  const chip = (key, label, n) =>
    `<button class="chip${activeFilter === key ? ' is-active' : ''}" data-filter="${esc(key)}" role="tab" aria-selected="${activeFilter === key}">${esc(label)}<span class="chip-count">${n}</span></button>`;
  wrap.innerHTML =
    chip('all', '전체', STORE.templates.length) +
    STORE.archetypes.map(a => chip(a, a, countByArchetype(a))).join('');
}

/* ============ RENDER TEMPLATES ============ */
function templateMatches(t) {
  if (activeFilter !== 'all' && t.archetype !== activeFilter) return false;
  if (!searchQuery) return true;
  const blob = [
    t.title, t.summary, t.archetype, t.id,
    t.reference && t.reference.title, t.reference && t.reference.why,
    (t.bestFor || []).join(' '), (t.pros || []).join(' '), (t.cons || []).join(' '),
    (t.prompts || []).map(p => p.label + ' ' + p.desc).join(' ')
  ].join(' ').toLowerCase();
  return blob.includes(searchQuery.toLowerCase());
}

function promptItemHTML(p, i) {
  return `
    <div class="prompt-item" data-prompt-idx="${i}">
      <button class="prompt-head" type="button" aria-expanded="false">
        <span class="prompt-idx">${i + 1}</span>
        <span class="prompt-headtext">
          <span class="prompt-label">${esc(p.label)}</span>
          <span class="prompt-desc">${esc(p.desc)}</span>
        </span>
        ${svg('i-chevron-down', 'prompt-chev')}
      </button>
      <div class="prompt-body">
        <div class="prompt-text">${esc(p.text)}</div>
        <div class="prompt-actions">
          <button class="copy-btn" type="button" data-copy>${svg('i-copy')}<span>복사</span></button>
        </div>
      </div>
    </div>`;
}

/* 기준 영상 임베드 — 저장소에 영상을 두지 않고 URL로 임베드한다.
   .mp4 등 직접 파일 → <video> 네이티브 플레이어 / 그 외(YouTube 등) → <iframe> */
function refEmbedHTML(url) {
  const u = String(url).trim();
  if (/\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(u)) {
    return `<video class="ref-video" src="${esc(u)}" controls preload="metadata" playsinline></video>`;
  }
  return `<iframe class="ref-iframe" src="${esc(u)}" loading="lazy" allowfullscreen
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>`;
}

function refHTML(r) {
  if (!r) return '';
  const hasUrl = r.url && String(r.url).trim();
  const link = hasUrl
    ? `<a class="ref-url" href="${esc(r.url)}" target="_blank" rel="noopener">${svg('i-link')}새 탭에서 열기</a>`
    : `<span class="ref-url is-empty">${svg('i-link')}${esc(r.creator || '기준 영상 직접 지정')}</span>`;
  return `
    <div class="tpl-ref${hasUrl ? ' has-embed' : ''}">
      ${hasUrl ? `<div class="ref-embed">${refEmbedHTML(r.url)}</div>` : `<div class="ref-thumb">${svg('i-play')}</div>`}
      <div class="ref-body">
        <div class="ref-line">
          <span class="ref-platform">${esc(r.platform)}</span>
          <span class="ref-len">${esc(r.length)}</span>
        </div>
        <div class="ref-title">${esc(r.title)}</div>
        <div class="ref-why">${esc(r.why)}</div>
        ${link}
      </div>
    </div>`;
}

function listHTML(arr, cls) {
  return `<ul class="meta-list${cls ? ' ' + cls : ''}">${(arr || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
}

function templateCardHTML(t) {
  return `
    <article class="tpl-card" data-tpl-id="${esc(t.id)}">
      <div class="tpl-card-head">
        <div class="tpl-badges">
          <span class="tpl-archetype">${esc(t.archetype)}</span>
          <span class="tpl-id">${esc(t.id)}</span>
        </div>
        <h2 class="tpl-title">${esc(t.title)}</h2>
        <p class="tpl-summary">${esc(t.summary)}</p>
      </div>
      ${refHTML(t.reference)}
      <div class="tpl-meta">
        <div class="meta-block">
          <h4>이럴 때 좋아요</h4>
          ${listHTML(t.bestFor)}
        </div>
        <div class="proscons">
          <div class="meta-block"><h4>장점</h4>${listHTML(t.pros, 'pros')}</div>
          <div class="meta-block"><h4>주의점</h4>${listHTML(t.cons, 'cons')}</div>
        </div>
      </div>
      <div class="tpl-prompts">
        <div class="prompts-head">
          <h4>분석 프롬프트 ${(t.prompts || []).length}개</h4>
          <button class="copyall-btn" type="button" data-copyall="${esc(t.id)}">${svg('i-copy')}전체 프롬프트 복사</button>
        </div>
        ${(t.prompts || []).map(promptItemHTML).join('')}
      </div>
    </article>`;
}

function renderTemplates() {
  const list = document.getElementById('tpl-list');
  const count = document.getElementById('tpl-count');
  if (!list) return;
  const shown = STORE.templates.filter(templateMatches);
  if (!shown.length) {
    list.innerHTML = `
      <div class="empty">
        <div class="empty-ico">🔍</div>
        <h3>조건에 맞는 템플릿이 없어요</h3>
        <p>검색어나 필터를 바꿔 보세요.</p>
      </div>`;
  } else {
    list.innerHTML = shown.map(templateCardHTML).join('');
  }
  if (count) count.textContent = `${shown.length}개 표시${activeFilter !== 'all' ? ` · ${activeFilter}` : ''}${searchQuery ? ` · “${searchQuery}”` : ''}`;
  // sync chips + sidebar active state
  document.querySelectorAll('#tpl-chips .chip').forEach(c => {
    const on = c.dataset.filter === activeFilter;
    c.classList.toggle('is-active', on);
    c.setAttribute('aria-selected', on);
  });
  document.querySelectorAll('#sidebar-archetypes .sidebar-link').forEach(l => {
    l.classList.toggle('is-active', location.hash.replace(/^#\/?/, '') === 'templates' && l.dataset.filter === activeFilter);
  });
}

function setFilter(key) {
  activeFilter = key;
  renderTemplates();
}

/* ============ COPY ============ */
async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) { /* fall through */ }
  // fallback for file:// or insecure context
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch (e) { return false; }
}

let toastTimer;
function showToast(msg, ok = true) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.innerHTML = (ok ? svg('i-check') : '') + `<span>${esc(msg)}</span>`;
  el.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-visible'), 1800);
}

function buildCopyAllText(t) {
  const head = `${t.title} · ${t.archetype}\n숏폼 연구소 · 템플릿 저장공간\n${'—'.repeat(24)}\n`;
  const body = (t.prompts || []).map((p, i) => `## ${i + 1}. ${p.label}\n${p.text}`).join('\n\n' + '—'.repeat(24) + '\n\n');
  return head + '\n' + body + '\n';
}

/* ============ EVENT DELEGATION ============ */
document.addEventListener('click', async (e) => {
  // prompt accordion
  const head = e.target.closest('.prompt-head');
  if (head) {
    const item = head.parentElement;
    const open = item.classList.toggle('is-open');
    head.setAttribute('aria-expanded', String(open));
    return;
  }
  // per-prompt copy
  const copyBtn = e.target.closest('.copy-btn');
  if (copyBtn) {
    const body = copyBtn.closest('.prompt-body');
    const textEl = body && body.querySelector('.prompt-text');
    if (!textEl) return;
    const ok = await copyText(textEl.textContent);
    if (ok) {
      copyBtn.classList.add('is-copied');
      copyBtn.querySelector('span').textContent = '복사됨';
      setTimeout(() => { copyBtn.classList.remove('is-copied'); const s = copyBtn.querySelector('span'); if (s) s.textContent = '복사'; }, 1400);
      showToast('프롬프트를 복사했어요');
    } else { showToast('복사에 실패했어요', false); }
    return;
  }
  // copy all prompts of a template
  const allBtn = e.target.closest('.copyall-btn');
  if (allBtn) {
    const t = STORE.byId[allBtn.dataset.copyall];
    if (!t) return;
    const ok = await copyText(buildCopyAllText(t));
    showToast(ok ? `‘${t.title}’ 프롬프트 ${(t.prompts || []).length}개를 복사했어요` : '복사에 실패했어요', ok);
    return;
  }
  // filter (chips + sidebar)
  const filterEl = e.target.closest('[data-filter]');
  if (filterEl) {
    const key = filterEl.dataset.filter;
    if (filterEl.classList.contains('sidebar-link')) {
      activeFilter = key;
      closeSidebarMobile();
      if (location.hash.replace(/^#\/?/, '') === 'templates') { renderTemplates(); }
      // else: href="#templates" navigation triggers route() → renderTemplates()
      return;
    }
    e.preventDefault();
    setFilter(key);
    return;
  }
  // leaf sidebar links close mobile drawer
  const sbLink = e.target.closest('.sidebar-link');
  if (sbLink && !sbLink.classList.contains('is-external')) closeSidebarMobile();
});

/* search */
document.addEventListener('input', (e) => {
  if (e.target && e.target.id === 'tpl-search') {
    searchQuery = e.target.value.trim();
    renderTemplates();
  }
});

/* ============ ROUTER ============ */
const VIEWS = {
  home:      { el: 'view-home',      crumb: '숏폼 연구소', section: 'home' },
  templates: { el: 'view-templates', crumb: '템플릿 저장공간', section: 'templates' },
  guide:     { el: 'view-guide',     crumb: '사용법', section: 'guide' },
  add:       { el: 'view-add',       crumb: '템플릿 추가하기', section: 'add' },
  changelog: { el: 'view-changelog', crumb: '업데이트 기록', section: 'changelog' },
};

function highlightSidebar(section) {
  document.querySelectorAll('.sidebar-link').forEach(l => {
    if (l.dataset.section) l.classList.toggle('is-active', l.dataset.section === section);
  });
}

function route() {
  let key = location.hash.replace(/^#\/?/, '').trim();
  if (!key || !VIEWS[key]) key = 'home';
  const v = VIEWS[key];
  document.querySelectorAll('.view').forEach(el => el.classList.remove('is-route-active'));
  const el = document.getElementById(v.el);
  if (el) el.classList.add('is-route-active');
  const crumb = document.getElementById('crumb');
  if (crumb) crumb.innerHTML = key === 'home' ? '<b>숏폼 연구소</b>' : `숏폼 연구소 · <b>${esc(v.crumb)}</b>`;
  highlightSidebar(v.section);
  if (key === 'templates') renderTemplates();
  try { window.scrollTo(0, 0); } catch (e) {}
}
window.addEventListener('hashchange', route);

/* ============ INIT ============ */
async function init() {
  try {
    await loadData();
    buildSidebarArchetypes();
    buildChips();
  } catch (err) {
    console.error('[숏폼 연구소] templates.json 로드 실패:', err);
    const list = document.getElementById('tpl-list');
    if (list) list.innerHTML = `
      <div class="empty">
        <div class="empty-ico">⚠️</div>
        <h3>템플릿을 불러오지 못했어요</h3>
        <p>로컬 파일을 직접 열면 브라우저 보안 정책으로 templates.json 로드가 막힐 수 있어요.<br>간이 서버(예: <code>npx serve</code> 또는 <code>python -m http.server</code>)로 열어 주세요.</p>
      </div>`;
  }
  route();
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
