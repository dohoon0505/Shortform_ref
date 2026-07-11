#!/usr/bin/env node
/**
 * Web Reference Lab — Validator
 * Usage: node scripts/validate.mjs
 *
 * 검증 항목:
 * 1. system.json 파싱 + 필수 필드 존재
 * 2. system.json.references[].id 와 analyses/{id}/ 폴더 일치
 * 3. analyses/{id}/analysis.json 파싱 + 필수 필드
 * 4. analysisSections 정의 존재 (10개)
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warns = [];
const info = [];

function ok(msg)   { info.push('✓ ' + msg); }
function warn(msg) { warns.push('⚠ ' + msg); }
function fail(msg) { errors.push('✗ ' + msg); }

function readJSON(relPath) {
  const full = join(ROOT, relPath);
  if (!existsSync(full)) { fail('파일 없음: ' + relPath); return null; }
  try { return JSON.parse(readFileSync(full, 'utf-8')); }
  catch (e) { fail('JSON 파싱 실패 (' + relPath + '): ' + e.message); return null; }
}

// 1. system.json
const system = readJSON('system.json');
if (!system) process.exit(1);

if (!system.name) fail('system.json: name 필드 없음');
if (!system.version) fail('system.json: version 필드 없음');
if (!system.analysisSections || !system.analysisSections.length) {
  fail('system.json: analysisSections 배열 없음');
} else {
  ok('system.json — ' + system.analysisSections.length + '개 분석 섹션 정의');
}

// 2. references 검증
const refs = system.references || [];
ok('system.json — ' + refs.length + '개 레퍼런스 등재');

const registeredIds = new Set(refs.map(function (r) { return r.id; }));

for (const ref of refs) {
  if (!ref.id) { fail('reference에 id 없음'); continue; }
  if (!ref.title) warn(ref.id + ': title 필드 없음');
  // 카테고리(인터랙션 카탈로그)는 단일 url이 아니므로 검증 생략
  if (ref.type !== 'category' && !ref.url) warn(ref.id + ': url 필드 없음');

  const dir = join(ROOT, 'analyses', ref.id);
  if (!existsSync(dir)) {
    fail(ref.id + ': analyses/' + ref.id + '/ 폴더 없음');
    continue;
  }

  const analysis = readJSON('analyses/' + ref.id + '/analysis.json');
  if (!analysis) continue;
  if (analysis.id !== ref.id) {
    fail(ref.id + ': analysis.json의 id "' + analysis.id + '" !== system.json의 "' + ref.id + '"');
  }
}

// 3. analyses/ 폴더에 있으나 system.json에 미등재 확인
const analysesDir = join(ROOT, 'analyses');
if (existsSync(analysesDir)) {
  try {
    const dirs = readdirSync(analysesDir, { withFileTypes: true })
      .filter(function (d) { return d.isDirectory(); })
      .map(function (d) { return d.name; });
    for (const d of dirs) {
      if (!registeredIds.has(d)) {
        warn('analyses/' + d + '/ 가 system.json에 미등재');
      }
    }
  } catch (e) {
    warn('analyses/ 디렉터리 읽기 실패: ' + e.message);
  }
}

// 4. 필수 파일 존재
['index.html', 'assets/css/main.css', 'assets/js/main.js'].forEach(function (f) {
  if (existsSync(join(ROOT, f))) ok(f + ' 존재');
  else fail(f + ' 없음');
});

// 결과
console.log('\n' + info.join('\n'));
if (warns.length) console.log('\n' + warns.join('\n'));
if (errors.length) console.log('\n' + errors.join('\n'));
console.log('\n결과: ' + info.length + ' OK / ' + warns.length + ' warn / ' + errors.length + ' error');
process.exit(errors.length ? 1 : 0);
