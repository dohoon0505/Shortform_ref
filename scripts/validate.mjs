#!/usr/bin/env node
/**
 * UIUX-DH Design System Validator
 * Usage: node scripts/validate.mjs
 *
 * 검증 항목:
 * 1. 모든 JSON 파일 파싱 성공
 * 2. tokens/semantic.*.json의 ref → primitives.json 존재
 * 3. system.json.components[].schema 파일 존재
 * 4. system.json.components[].id === <schema>.id 일치
 * 5. components/*.schema.json의 usedInDemos → index.html 내 data-uses 일치
 * 6. snippets/patterns.json의 uses → 실제 컴포넌트 id 존재
 *
 * 외부 의존성 없음 (pure Node.js).
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warns = [];
const info = [];

function ok(msg)   { info.push(`✓ ${msg}`); }
function warn(msg) { warns.push(`⚠ ${msg}`); }
function fail(msg) { errors.push(`✗ ${msg}`); }

function readJSON(relPath) {
  const full = join(ROOT, relPath);
  if (!existsSync(full)) { fail(`파일 없음: ${relPath}`); return null; }
  try { return JSON.parse(readFileSync(full, 'utf-8')); }
  catch (e) { fail(`JSON 파싱 실패 (${relPath}): ${e.message}`); return null; }
}

// 1. tokens/primitives.json → 모든 --p-* 수집
const primitives = readJSON('tokens/primitives.json');
if (!primitives) process.exit(1);

const primitiveSet = new Set();
for (const [category, cat] of Object.entries(primitives)) {
  if (category === '$meta' || !cat.scale) continue;
  for (const entry of Object.values(cat.scale)) {
    if (entry.css) primitiveSet.add(entry.css);
  }
}
ok(`primitives.json — ${primitiveSet.size}개 원시 토큰 수집`);

// 2. tokens/semantic.light.json · semantic.dark.json 의 ref 검증
for (const theme of ['light', 'dark']) {
  const sem = readJSON(`tokens/semantic.${theme}.json`);
  if (!sem) continue;
  let refCount = 0, missing = 0;
  const walk = (obj) => {
    for (const [k, v] of Object.entries(obj)) {
      if (k === '$meta') continue;
      if (v && typeof v === 'object') {
        if (v.ref) {
          refCount++;
          // rgba() 등 함수형 ref는 스킵
          if (v.ref.startsWith('--p-') && !primitiveSet.has(v.ref)) {
            fail(`semantic.${theme}.json: ${v.css || k}의 ref "${v.ref}"가 primitives에 없음`);
            missing++;
          }
        } else {
          walk(v);
        }
      }
    }
  };
  walk(sem);
  ok(`semantic.${theme}.json — ${refCount}개 참조, ${refCount - missing}개 유효`);
}

// 3. tokens/theme-map.json 검증
const themeMap = readJSON('tokens/theme-map.json');
if (themeMap) {
  let pairCount = 0;
  const walk = (obj) => {
    for (const [k, v] of Object.entries(obj)) {
      if (k === '$meta') continue;
      if (v && typeof v === 'object') {
        if (v.light && v.dark) {
          pairCount++;
          if (v.light.startsWith('--p-') && !primitiveSet.has(v.light)) warn(`theme-map: ${k}의 light "${v.light}" 원시토큰 없음`);
          if (v.dark.startsWith('--p-')  && !primitiveSet.has(v.dark))  warn(`theme-map: ${k}의 dark  "${v.dark}" 원시토큰 없음`);
        } else {
          walk(v);
        }
      }
    }
  };
  walk(themeMap);
  ok(`theme-map.json — ${pairCount}개 Light/Dark pair`);
}

// 4. system.json → components[] 검증
const system = readJSON('system.json');
if (!system) process.exit(1);

const componentIds = new Set();
const schemaIds = new Set();
for (const comp of system.components) {
  componentIds.add(comp.id);
  if (!existsSync(join(ROOT, comp.schema))) {
    fail(`system.json: ${comp.id}의 schema 파일 없음 — ${comp.schema}`);
    continue;
  }
  const schema = readJSON(comp.schema);
  if (!schema) continue;
  schemaIds.add(schema.id);
  if (schema.id !== comp.id) {
    fail(`${comp.schema}: id "${schema.id}" !== system.json의 "${comp.id}"`);
  }
  if (comp.md && !existsSync(join(ROOT, comp.md))) {
    warn(`${comp.id}.md 파일 없음 — ${comp.md}`);
  }
}
ok(`system.json — ${system.components.length}개 컴포넌트 등재, 스키마 ${schemaIds.size}개 일치`);
ok(`demos — ${system.demos.length}개`);

// 5. components/*.schema.json 파일 시스템 vs system.json 등재 교차 확인
try {
  const fsFiles = readdirSync(join(ROOT, 'components'))
    .filter(f => f.endsWith('.schema.json'));
  const registered = new Set(system.components.map(c => c.schema.replace('components/', '')));
  for (const f of fsFiles) {
    if (!registered.has(f)) warn(`components/${f} 가 system.json에 미등재`);
  }
  ok(`components/ 디렉터리 — ${fsFiles.length}개 .schema.json 파일`);
} catch (e) {
  fail(`components/ 디렉터리 읽기 실패: ${e.message}`);
}

// 6. snippets/patterns.json 검증
const snippets = readJSON('snippets/patterns.json');
if (snippets && snippets.patterns) {
  let validPatterns = 0;
  for (const p of snippets.patterns) {
    let allValid = true;
    for (const useId of p.uses || []) {
      if (!componentIds.has(useId)) {
        warn(`snippets/patterns.json: pattern "${p.id}"가 미등록 컴포넌트 "${useId}" 사용`);
        allValid = false;
      }
    }
    if (allValid) validPatterns++;
  }
  ok(`snippets/patterns.json — ${snippets.patterns.length}개 패턴 (유효 ${validPatterns})`);
}

// 7. index.html의 data-uses 속성 vs component.usedInDemos 교차 확인
if (existsSync(join(ROOT, 'index.html'))) {
  const html = readFileSync(join(ROOT, 'index.html'), 'utf-8');
  const demoSections = [...html.matchAll(/<section class="demo-section" id="(demo-[a-z0-9-]+)"[\s\S]*?data-uses="([^"]+)"/g)];
  const demoUses = {};
  for (const [_, id, uses] of demoSections) {
    demoUses[id] = uses.split(',').map(s => s.trim());
  }
  ok(`index.html — ${demoSections.length}개 demo-section (data-uses 선언)`);

  // 각 component의 usedInDemos 가 실제 data-uses 와 일치하는지
  let mismatchCount = 0;
  for (const comp of system.components) {
    const schema = readJSON(comp.schema);
    if (!schema || !schema.usedInDemos) continue;
    for (const demoId of schema.usedInDemos) {
      const uses = demoUses[demoId];
      if (!uses) {
        warn(`${comp.id}.schema.json: "${demoId}" 가 index.html에 없음`);
        mismatchCount++;
      } else if (!uses.includes(comp.id)) {
        warn(`${demoId} 의 data-uses에 "${comp.id}" 누락 (schema에는 있음)`);
        mismatchCount++;
      }
    }
  }
  if (mismatchCount === 0) ok('usedInDemos ↔ data-uses 전수 일치');
  else warn(`usedInDemos ↔ data-uses 불일치 ${mismatchCount}건 (비치명적, 권장 수정)`);
}

// 결과 출력
console.log('\n' + info.join('\n'));
if (warns.length)  console.log('\n' + warns.join('\n'));
if (errors.length) console.log('\n' + errors.join('\n'));

console.log(`\n결과: ${info.length} OK / ${warns.length} warn / ${errors.length} error`);
process.exit(errors.length ? 1 : 0);
