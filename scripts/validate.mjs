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

// 플랫폼 트렌드 문서
if (!isArr(data.trends)) err('trends 배열이 비어 있거나 없음');
const trendSlugs = new Set();
for (const [i, trend] of (data.trends || []).entries()) {
  const at = `trends[${i}]${trend && trend.slug ? ` (${trend.slug})` : ''}`;
  for (const f of ['slug', 'name', 'shortName', 'tagline', 'summary', 'focus', 'viewerMode', 'bestAd']) {
    if (!isStr(trend[f])) err(`${at}: ${f} 누락/빈값`);
  }
  if (trend.slug) {
    if (trendSlugs.has(trend.slug)) err(`${at}: slug 중복`);
    trendSlugs.add(trend.slug);
  }
  for (const f of ['character', 'audience', 'adStrategy', 'formula', 'checks', 'sources']) {
    if (!isArr(trend[f])) err(`${at}: ${f} 배열이 비어 있거나 없음`);
  }
  for (const [j, source] of (trend.sources || []).entries()) {
    if (!isStr(source?.label) || !isStr(source?.url)) err(`${at}.sources[${j}]: label/url 누락`);
  }
}

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

  // navLabel — 사이드바 nav-child에 표기하는 동영상 유형 짧은 표현 (예: 블러셔 문제제기 반전)
  if (!isStr(t.navLabel)) warn(`${at}: navLabel 없음 — 사이드바에 제목이 대신 노출됨`);

  // report — 영상 분석 리포트 5항목 (힉스필드 분석 기반 실제 내용)
  const REPORT_KEYS = ['hook', 'structure', 'script', 'edit', 'quality'];
  if (!t.report || typeof t.report !== 'object') warn(`${at}: report 없음 — 영상 분석 리포트 5항목 권장`);
  else {
    for (const k of REPORT_KEYS) {
      if (!isArr(t.report[k])) err(`${at}.report.${k}: 배열이 비어 있거나 없음`);
    }
  }

  // 용어 정책: '해부' 금지 → '분석'
  if (JSON.stringify(t).includes('해부')) err(`${at}: '해부' 단어 사용 금지 — '분석'으로 치환`);

  // product(판매상품) · difficulty(제작 난이도) · flow(영상 제작의 흐름)
  if (!isStr(t.product)) warn(`${at}: product(판매상품) 없음`);
  if (!isStr(t.difficulty)) warn(`${at}: difficulty(제작 난이도) 없음`);
  if (!isArr(t.flow)) warn(`${at}: flow(영상 제작의 흐름) 없음`);
  else for (const [j, s] of t.flow.entries()) {
    if (!isStr(s?.label) || !isStr(s?.desc)) err(`${at}.flow[${j}]: label/desc 누락`);
  }

  // builder(프롬프트 제작 가이드) — 영상 유형별 질문 필드
  if (!t.builder || !isArr(t.builder.fields)) warn(`${at}: builder.fields 없음 — 프롬프트 제작 가이드가 비어 보임`);
  else for (const [j, f] of t.builder.fields.entries()) {
    const fa = `${at}.builder.fields[${j}]`;
    if (!isStr(f?.key) || !isStr(f?.question)) err(`${fa}: key/question 누락`);
    if (f?.type === 'chips' && !isArr(f.options)) err(`${fa}: chips 타입인데 options 없음`);
    if (!isStr(f?.var)) warn(`${fa}: var(프롬프트 변수 라벨) 없음 — question이 대신 사용됨`);
  }

  // blueprint (재현 블루프린트 — Higgsfield 장면 분석 기반, 권장)
  if (!t.blueprint) warn(`${at}: blueprint 없음 — 기준 영상을 힉스필드로 분석해 재현 블루프린트를 넣는 것을 권장 (docs/video-analysis.md)`);
  else {
    if (!isStr(t.blueprint.desc)) err(`${at}.blueprint: desc 누락/빈값`);
    if (!isStr(t.blueprint.text)) err(`${at}.blueprint: text 누락/빈값`);
    else {
      if (!t.blueprint.text.includes('교체 변수')) warn(`${at}.blueprint: '교체 변수' 섹션 없음 — 복붙 1회 재현 규격 확인 필요`);
      if (!t.blueprint.text.includes('장면')) warn(`${at}.blueprint: 장면 구성표가 없어 보임`);
    }
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
