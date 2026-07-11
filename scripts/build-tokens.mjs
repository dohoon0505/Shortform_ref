#!/usr/bin/env node
/**
 * UIUX-DH Token Build
 * Usage: node scripts/build-tokens.mjs
 *
 * tokens/*.json 을 읽어 CSS 변수 블록을 생성 → assets/css/_tokens.generated.css
 * - Primitives: :root { --p-*: value; }
 * - Semantic Light: :root { --sm-*: value; }
 * - Semantic Dark: [data-theme="dark"] { --sm-*: value; }
 *
 * 생성된 파일은 단일 진실 출처 (tokens/*.json) 의 CSS 형태 미러.
 * assets/css/main.css 에 @import "./_tokens.generated.css"; 로 포함하거나
 * 참조용으로만 사용 가능. 수동 편집 금지 (파일명 _ 접두어 = generated 의미).
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf-8'));

const primitives = read('tokens/primitives.json');
const semLight   = read('tokens/semantic.light.json');
const semDark    = read('tokens/semantic.dark.json');
const typography = read('tokens/typography.json');
const sizing     = read('tokens/sizing.json');
const radius     = read('tokens/radius.json');
const elevation  = read('tokens/elevation.json');
const motion     = read('tokens/motion.json');
const zIndex     = read('tokens/z-index.json');

const lines = [];
lines.push('/* ============================================================');
lines.push(' *  _tokens.generated.css — AUTO-GENERATED, DO NOT EDIT BY HAND');
lines.push(' *  Source: tokens/*.json (JSON canonical)');
lines.push(' *  Regenerate: node scripts/build-tokens.mjs');
lines.push(` *  Generated: ${new Date().toISOString()}`);
lines.push(' * ============================================================ */');
lines.push('');

// Primitives
lines.push(':root {');
lines.push('  /* ── Primitives (Tier 1) — 팔레트 원재료 ── */');
for (const [category, cat] of Object.entries(primitives)) {
  if (category === '$meta' || !cat.scale) continue;
  lines.push(`  /* ${category} — ${cat.description || ''}`.trimEnd() + ' */');
  for (const entry of Object.values(cat.scale)) {
    if (entry.css && entry.value) {
      lines.push(`  ${entry.css}: ${entry.value};`);
    }
  }
}
lines.push('');

// Typography tokens (font families)
lines.push('  /* ── Typography families ── */');
if (typography.families) {
  for (const fam of Object.values(typography.families)) {
    if (fam.css && fam.value) lines.push(`  ${fam.css}: ${fam.value};`);
  }
}
// Typography scale (text-*)
lines.push('');
lines.push('  /* ── Typography scale ── */');
if (typography.scale) {
  for (const entry of Object.values(typography.scale)) {
    if (!entry.css) continue;
    const weight = entry.weight || 400;
    const size = entry.size || '14px';
    const lh = entry.lineHeight || 1.5;
    const tracking = entry.tracking ? ` ${entry.tracking}` : '';
    lines.push(`  ${entry.css}: ${weight} ${size}/${lh} var(--font-sans)${tracking};`);
  }
}

// Sizing
lines.push('');
lines.push('  /* ── Sizing (4px grid) ── */');
if (sizing.scale) {
  for (const entry of Object.values(sizing.scale)) {
    if (entry.css && entry.value) lines.push(`  ${entry.css}: ${entry.value};`);
  }
}

// Radius
lines.push('');
lines.push('  /* ── Radius ── */');
if (radius.scale) {
  for (const entry of Object.values(radius.scale)) {
    if (entry.css && entry.value) lines.push(`  ${entry.css}: ${entry.value};`);
  }
}

// Elevation
lines.push('');
lines.push('  /* ── Elevation ── */');
if (elevation.scale) {
  for (const entry of Object.values(elevation.scale)) {
    if (entry.css && entry.value) lines.push(`  ${entry.css}: ${entry.value};`);
  }
}

// Motion
lines.push('');
lines.push('  /* ── Motion ── */');
if (motion.duration) {
  for (const entry of Object.values(motion.duration)) {
    if (entry.css && entry.value) lines.push(`  ${entry.css}: ${entry.value};`);
  }
}
if (motion.easing) {
  for (const entry of Object.values(motion.easing)) {
    if (entry.css && entry.value) lines.push(`  ${entry.css}: ${entry.value};`);
  }
}

// Z-index
lines.push('');
lines.push('  /* ── Z-index ── */');
if (zIndex.scale) {
  for (const entry of Object.values(zIndex.scale)) {
    if (entry.css && entry.value !== undefined) lines.push(`  ${entry.css}: ${entry.value};`);
  }
}

lines.push('');
lines.push('  /* ── Semantic · Light (Tier 2) — UI 참조 이름 ── */');
const walkSemantic = (obj, emit) => {
  for (const [k, v] of Object.entries(obj)) {
    if (k === '$meta') continue;
    if (v && typeof v === 'object') {
      if (v.css && v.value !== undefined) {
        emit(v);
      } else {
        walkSemantic(v, emit);
      }
    }
  }
};
walkSemantic(semLight, (v) => {
  lines.push(`  ${v.css}: var(${v.ref}${v.ref && v.ref.startsWith('--p-') ? '' : ''});`);
});
lines.push('}');
lines.push('');

// Dark theme overrides
lines.push('[data-theme="dark"] {');
lines.push('  /* ── Semantic · Dark overrides ── */');
walkSemantic(semDark, (v) => {
  if (v.ref && v.ref.startsWith('--p-')) {
    lines.push(`  ${v.css}: var(${v.ref});`);
  } else {
    // rgba() 같은 직접 값
    lines.push(`  ${v.css}: ${v.ref};`);
  }
});
lines.push('}');
lines.push('');

// Write
const outPath = join(ROOT, 'assets/css/_tokens.generated.css');
writeFileSync(outPath, lines.join('\n'));

const fileSize = Buffer.byteLength(lines.join('\n'), 'utf-8');
console.log(`✓ assets/css/_tokens.generated.css 생성됨 (${lines.length} lines, ${fileSize} bytes)`);
console.log('  사용: main.css 최상단에 @import "./_tokens.generated.css"; 추가하거나 참조용으로만 사용');
