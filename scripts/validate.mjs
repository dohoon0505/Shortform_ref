/* ================================================================
   숏폼 연구소 · templates.json 무결성 검증
   의존성 없음. 실행:  node scripts/validate.mjs  (npm run validate)
   ================================================================ */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warns = [];
const err = (m) => errors.push(m);
const warn = (m) => warns.push(m);

const PROMPT_ORDER = ['hook', 'structure', 'script', 'edit', 'remix'];
const isStr = (v) => typeof v === 'string' && v.trim().length > 0;
const isArr = (v) => Array.isArray(v) && v.length > 0;

let data;
try {
  data = JSON.parse(readFileSync(join(ROOT, 'templates.json'), 'utf8'));
} catch (e) {
  console.error('✗ templates.json 파싱 실패:', e.message);
  process.exit(1);
}

if (!data.meta || !isStr(data.meta.name)) err('meta.name 누락');
if (!isArr(data.templates)) err('templates 배열이 비어 있거나 없음');

const ids = new Set();
const archetypesSeen = new Set();

for (const [i, t] of (data.templates || []).entries()) {
  const at = `templates[${i}]${t && t.id ? ` (${t.id})` : ''}`;
  for (const f of ['id', 'title', 'archetype', 'summary']) {
    if (!isStr(t[f])) err(`${at}: ${f} 누락/빈값`);
  }
  if (t.id) {
    if (ids.has(t.id)) err(`${at}: id 중복`);
    ids.add(t.id);
    if (!/^tpl-[a-z0-9-]+$/.test(t.id)) warn(`${at}: id 권장 형식(tpl-kebab-case) 아님`);
  }
  if (t.archetype) archetypesSeen.add(t.archetype);

  // reference
  const r = t.reference;
  if (!r || typeof r !== 'object') err(`${at}: reference 객체 누락`);
  else {
    for (const f of ['title', 'platform', 'length', 'why']) {
      if (!isStr(r[f])) err(`${at}.reference: ${f} 누락/빈값`);
    }
    if (typeof r.url !== 'string') err(`${at}.reference.url 은 문자열이어야 함(빈 문자열 허용)`);
  }

  // meta lists
  for (const f of ['bestFor', 'pros', 'cons']) {
    if (!isArr(t[f])) err(`${at}: ${f} 배열이 비어 있거나 없음`);
    else if (t[f].some((x) => !isStr(x))) err(`${at}.${f}: 빈 문자열 항목 포함`);
  }

  // prompts
  if (!isArr(t.prompts)) err(`${at}: prompts 배열이 비어 있거나 없음`);
  else {
    const pids = t.prompts.map((p) => p && p.id);
    for (const [j, p] of t.prompts.entries()) {
      const pa = `${at}.prompts[${j}]`;
      for (const f of ['id', 'label', 'desc', 'text']) {
        if (!isStr(p[f])) err(`${pa}: ${f} 누락/빈값`);
      }
      if (p.text && p.text.length < 40) warn(`${pa}: text 가 너무 짧음(완성형 프롬프트 권장)`);
    }
    // 권장 순서/구성 체크 (경고만)
    const missing = PROMPT_ORDER.filter((id) => !pids.includes(id));
    if (missing.length) warn(`${at}: 권장 프롬프트 항목 누락 [${missing.join(', ')}]`);
  }
}

// archetypes 선언과 실제 사용 비교
if (Array.isArray(data.archetypes)) {
  for (const a of archetypesSeen) {
    if (!data.archetypes.includes(a)) warn(`archetypes 목록에 "${a}" 미선언(필터 순서에 영향)`);
  }
}

// 리포트
if (warns.length) {
  console.log('⚠ 경고:');
  warns.forEach((w) => console.log('  - ' + w));
}
if (errors.length) {
  console.error(`\n✗ 검증 실패 — ${errors.length}개 오류`);
  errors.forEach((e) => console.error('  - ' + e));
  process.exit(1);
}
console.log(`✓ templates.json 검증 통과 — 템플릿 ${ids.size}종 · 아키타입 ${archetypesSeen.size}종${warns.length ? ` (경고 ${warns.length})` : ''}`);
