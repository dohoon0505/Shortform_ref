// scripts/capture-ktng-v2.mjs
// KT&G 26개 페이지를 일괄 정밀 캡처한다 (사용자 v2 사양).
// 페이지 1개당: navigate → wait 4s → 0%/10%/.../100% 11단계 스크롤 →
//   매 단계마다 (즉시 / +1s / +2s) 3장 = 33장 viewport screenshot
//                + 매 단계 computed state (sticky/animation/active/counter) 채집
// 결과: .playwright-mcp/ktng/v2/{page-id}/sNN-{ratio}pct-{a|b|c}.jpeg
//       .playwright-mcp/ktng/v2/{page-id}/timeline.json (모든 단계 state)
//       .playwright-mcp/ktng/v2/{page-id}/meta.json     (정적 페이지 메타)

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_BASE = path.join(ROOT, '.playwright-mcp', 'ktng', 'v2');

const PAGES = [
  { id: '01-main',                url: 'https://www.ktng.com/' },
  { id: '02-about-introduction',  url: 'https://www.ktng.com/about/introduction' },
  { id: '03-about-history',       url: 'https://www.ktng.com/about/history' },
  { id: '04-about-business',      url: 'https://www.ktng.com/about/business' },
  { id: '05-about-network',       url: 'https://www.ktng.com/about/network/overseas' },
  { id: '06-ir-overview',         url: 'https://www.ktng.com/ir/overview' },
  { id: '07-ir-value',            url: 'https://www.ktng.com/ir/value' },
  { id: '08-ir-governance',       url: 'https://www.ktng.com/ir/governance/overview' },
  { id: '09-ir-financial',        url: 'https://www.ktng.com/ir/financial-info/financial-highlight' },
  { id: '10-ir-stock',            url: 'https://www.ktng.com/ir/stock-info/chart' },
  { id: '11-ir-disclosure',       url: 'https://www.ktng.com/ir/disclosure-info/notices' },
  { id: '12-ir-archives',         url: 'https://www.ktng.com/ir/ir-archives/events' },
  { id: '13-sustain-overview',    url: 'https://www.ktng.com/sustainability/overview' },
  { id: '14-sustain-env',         url: 'https://www.ktng.com/sustainability/environment/environmanage' },
  { id: '15-sustain-social',      url: 'https://www.ktng.com/sustainability/social/safety' },
  { id: '16-sustain-ethics',      url: 'https://www.ktng.com/sustainability/ethics' },
  { id: '17-sustain-archive',     url: 'https://www.ktng.com/sustainability/archive/policies' },
  { id: '18-media-news',          url: 'https://www.ktng.com/media/news/all' },
  { id: '19-media-social',        url: 'https://www.ktng.com/media/social/all' },
  { id: '20-media-library',       url: 'https://www.ktng.com/media/library/print' },
  { id: '21-career-hr',           url: 'https://www.ktng.com/career/hrsystem' },
  { id: '22-career-job',          url: 'https://www.ktng.com/career/job/marketing-sales' },
  { id: '23-career-recruit',      url: 'https://www.ktng.com/career/recruit' },
  { id: '24-contact',             url: 'https://www.ktng.com/contact-us' },
  { id: '25-compliance',          url: 'https://www.ktng.com/compliance' },
  { id: '26-safety',              url: 'https://www.ktng.com/safety' },
];

// 인자: 페이지 id 1개만 지정해 실행 가능 — 디버그 / 재실행용
const ARG = process.argv[2];
const TARGET = ARG ? PAGES.filter(p => p.id === ARG || p.id.startsWith(ARG)) : PAGES;
if (TARGET.length === 0) {
  console.error(`No matching page for arg "${ARG}"`);
  process.exit(1);
}

// 채집 함수 (페이지 안에서 실행) — Playwright가 함수 객체를 자동 serialize 함
const COLLECT_FN = () => {
  const sticky = [...document.querySelectorAll('[class*=sticky],[class*=sequence],[class*=parallax],[class*=__sticky]')].slice(0, 20).map(el => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return { cls: (el.className.toString()||'').slice(0,50), pos: cs.position, top: Math.round(r.top), h: Math.round(r.height), op: cs.opacity, tr: cs.transform.slice(0,40), an: cs.animationName };
  });
  const animEls = []; let i = 0;
  for (const el of document.querySelectorAll('*')) {
    if (i++ > 1500) break;
    const cs = getComputedStyle(el);
    if (cs.animationName && cs.animationName !== 'none') {
      animEls.push({ tag: el.tagName.toLowerCase(), cls: (el.className?.toString?.()||'').slice(0,40), an: cs.animationName, dur: cs.animationDuration });
      if (animEls.length >= 15) break;
    }
  }
  const header = document.querySelector('header');
  const counter = [...document.querySelectorAll('[class*=count],[class*=number],[class*=__num],[class*=stat]')].slice(0,15).map(el => ({ cls:(el.className?.toString?.()||'').slice(0,45), t: (el.textContent||'').trim().slice(0,40) }));
  const active = [...document.querySelectorAll('[class*=swiper-slide-active],[class*=is-active],[class*=is-visible],[class*=is-on],[class*=current],.active,[class*=__active]')].slice(0,20).map(el => ({ tag: el.tagName.toLowerCase(), cls:(el.className?.toString?.()||'').slice(0,45) }));
  return {
    sY: window.scrollY,
    header: header ? { cls: (header.className?.toString?.()||'').slice(0,80), bg: getComputedStyle(header).backgroundColor } : null,
    stickyCount: sticky.length,
    sticky,
    animCount: animEls.length,
    animEls,
    counters: counter,
    activeCount: active.length,
    activeEls: active.slice(0, 12)
  };
};

// 최종 정적 메타 채집
const META_FN = () => {
  const sections = [];
  const seen = new Set();
  document.querySelectorAll('main > *, main > div > *, [class*=section], section, article, .container > div').forEach(el => {
    if (seen.has(el)) return; seen.add(el);
    const r = el.getBoundingClientRect();
    if (r.height < 80 || r.width < 400) return;
    const cs = getComputedStyle(el);
    sections.push({
      tag: el.tagName.toLowerCase(),
      cls: (el.className?.toString?.()||'').slice(0,80),
      y: Math.round(r.top + scrollY), h: Math.round(r.height),
      bg: cs.backgroundColor, position: cs.position,
      hasVid: el.querySelector('video') ? 1 : 0,
      hasCan: el.querySelector('canvas') ? 1 : 0,
      hasIframe: el.querySelector('iframe') ? 1 : 0,
      imgs: el.querySelectorAll('img').length,
      links: el.querySelectorAll('a').length,
      btns: el.querySelectorAll('button').length,
      txt: (el.textContent || '').trim().slice(0, 140).replace(/\s+/g, ' ')
    });
  });
  sections.sort((a, b) => a.y - b.y);
  const cmap = new Map();
  document.querySelectorAll('*').forEach((el, i) => { if (i > 1500) return; const s = getComputedStyle(el); [s.color, s.backgroundColor].forEach(c => { if (c && c !== 'rgba(0, 0, 0, 0)') cmap.set(c, (cmap.get(c) || 0) + 1); }); });
  let tc = 0, ac = 0;
  document.querySelectorAll('*').forEach((el, i) => { if (i > 1000) return; const s = getComputedStyle(el); if (s.transition && s.transition !== 'all 0s ease 0s' && s.transition !== 'none') tc++; if (s.animationName && s.animationName !== 'none') ac++; });
  const ix = {};
  ['sticky', 'sequence', 'parallax', 'counter', 'reveal', 'fade', 'slide', 'swiper', 'animat', 'tab', 'accordion', 'chart', 'ticker', 'org', 'year', 'history', 'map', 'globe', 'particle', 'social', 'instagram', 'youtube', 'news', 'library', 'gallery', 'pdf', 'job', 'step', 'timeline', 'board', 'compli', 'ethic', 'safety', 'archive', 'filter', 'grid', 'tag', 'faq', 'card', 'list', 'pagin', 'table', 'form', 'input', 'select'].forEach(k => {
    const m = document.querySelectorAll('[class*=' + k + ']').length;
    if (m) ix[k] = m;
  });
  return {
    url: location.pathname, title: document.title,
    sH: document.body.scrollHeight, iW: innerWidth, iH: innerHeight,
    sectionCount: sections.length,
    sections: sections.slice(0, 28),
    topColors: [...cmap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10),
    ix, tc, ac,
    headlines: [...document.querySelectorAll('h1, h2, h3')].slice(0, 8).map(el => ({ t: el.tagName.toLowerCase(), fs: getComputedStyle(el).fontSize, fw: getComputedStyle(el).fontWeight, text: (el.textContent || '').trim().slice(0, 100) })),
    bodyFont: getComputedStyle(document.body).fontFamily,
    bodyFontSize: getComputedStyle(document.body).fontSize
  };
};

async function capturePage(page, p) {
  console.log(`>>> ${p.id} : ${p.url}`);
  const outDir = path.join(OUT_BASE, p.id);
  fs.mkdirSync(outDir, { recursive: true });
  try {
    await page.goto(p.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  } catch (e) {
    console.error(`  ! goto failed: ${e.message}`);
    return { id: p.id, ok: false, error: e.message };
  }
  await page.waitForTimeout(4000); // 하이드레이션 + 인트로 애니메이션 대기
  const sH = await page.evaluate(() => document.body.scrollHeight);
  console.log(`  sH=${sH}px`);

  const timeline = [];
  for (let step = 0; step <= 10; step++) {
    const ratio = step / 10;
    const targetY = Math.floor(sH * ratio);
    await page.evaluate((y) => window.scrollTo({ top: y, left: 0, behavior: 'instant' }), targetY);

    // 즉시 (200ms 후)
    await page.waitForTimeout(200);
    const aPath = path.join(outDir, `s${String(step).padStart(2, '0')}-${String(step * 10).padStart(3, '0')}pct-a.jpeg`);
    await page.screenshot({ path: aPath, type: 'jpeg', quality: 80 });
    const stateA = await page.evaluate(COLLECT_FN);

    // +1s
    await page.waitForTimeout(1000);
    const bPath = path.join(outDir, `s${String(step).padStart(2, '0')}-${String(step * 10).padStart(3, '0')}pct-b.jpeg`);
    await page.screenshot({ path: bPath, type: 'jpeg', quality: 80 });
    const stateB = await page.evaluate(COLLECT_FN);

    // +2s
    await page.waitForTimeout(1000);
    const cPath = path.join(outDir, `s${String(step).padStart(2, '0')}-${String(step * 10).padStart(3, '0')}pct-c.jpeg`);
    await page.screenshot({ path: cPath, type: 'jpeg', quality: 80 });
    const stateC = await page.evaluate(COLLECT_FN);

    timeline.push({ step, ratio, targetY, a: stateA, b: stateB, c: stateC });
    process.stdout.write('.');
  }
  process.stdout.write('\n');

  // 최종 정적 메타
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(500);
  const meta = await page.evaluate(META_FN);

  fs.writeFileSync(path.join(outDir, 'timeline.json'), JSON.stringify(timeline, null, 2));
  fs.writeFileSync(path.join(outDir, 'meta.json'), JSON.stringify(meta, null, 2));

  console.log(`<<< ${p.id} done — 33 screenshots, ${timeline.length} timeline steps`);
  return { id: p.id, ok: true, sH };
}

async function main() {
  console.log(`Starting v2 capture for ${TARGET.length} page(s)`);
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();

  const results = [];
  const t0 = Date.now();
  for (const p of TARGET) {
    const r = await capturePage(page, p);
    results.push(r);
  }
  await browser.close();
  const totalSec = ((Date.now() - t0) / 1000).toFixed(1);

  const summary = {
    total: results.length,
    ok: results.filter(r => r.ok).length,
    failed: results.filter(r => !r.ok),
    totalSeconds: totalSec,
    results
  };
  fs.writeFileSync(path.join(OUT_BASE, 'capture-summary.json'), JSON.stringify(summary, null, 2));
  console.log(`\n=== DONE in ${totalSec}s ===`);
  console.log(`  OK: ${summary.ok}/${summary.total}`);
  if (summary.failed.length) console.log(`  Failed: ${summary.failed.map(f => f.id).join(', ')}`);
}

main().catch(e => { console.error(e); process.exit(1); });
