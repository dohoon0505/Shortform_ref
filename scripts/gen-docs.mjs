#!/usr/bin/env node
/**
 * UIUX-DH MD Doc Generator
 * Usage: node scripts/gen-docs.mjs [componentId]
 *        node scripts/gen-docs.mjs           # 전 컴포넌트
 *        node scripts/gen-docs.mjs banner    # 특정 컴포넌트만
 *
 * components/<id>.schema.json (JSON canonical) 을 읽어
 * components/<id>.md 를 생성/덮어씀.
 *
 * 원칙: JSON이 단일 진실의 출처. MD는 JSON에서 파생.
 * 수동 MD 편집은 다음 build에서 덮어써짐 — JSON 을 수정할 것.
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const argId = process.argv[2];

const COMP_DIR = join(ROOT, 'components');

const files = argId
  ? [`${argId}.schema.json`]
  : readdirSync(COMP_DIR).filter(f => f.endsWith('.schema.json'));

let count = 0;
for (const f of files) {
  const schemaPath = join(COMP_DIR, f);
  let schema;
  try {
    schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
  } catch (e) {
    console.error(`✗ ${f} 파싱 실패: ${e.message}`);
    continue;
  }
  const md = renderMD(schema, f);
  const mdPath = join(COMP_DIR, f.replace('.schema.json', '.md'));
  writeFileSync(mdPath, md);
  count++;
  if (argId) console.log(`✓ ${mdPath} (${md.split('\n').length} lines)`);
}

if (!argId) console.log(`✓ ${count}개 MD 생성/갱신됨 (components/)`);

function renderMD(s, schemaFileName) {
  const out = [];

  // Frontmatter
  out.push('---');
  out.push(`component: ${s.name}`);
  out.push(`canonical: "${schemaFileName}"`);
  out.push(`category: Components`);
  out.push(`version: ${s.version || '0.0.0'}`);
  if (s.relatedDocs?.sourceHtml) out.push(`sourceHtml: "${s.relatedDocs.sourceHtml}"`);
  out.push('generated: true');
  out.push('---');
  out.push('');

  // Title + tagline
  out.push(`# ${s.name}`);
  out.push('');
  out.push(`> ${s.description || ''}`);
  out.push('');
  out.push(`> ⚙️ 이 문서는 [\`${schemaFileName}\`](${schemaFileName}) 에서 자동 생성됐습니다. 내용 수정은 JSON에서, MD 재생성은 \`node scripts/gen-docs.mjs ${s.id}\`.`);
  out.push('');

  // When to use
  if (s.whenToUse?.length) {
    out.push('## 언제 사용하나 (Use when)');
    out.push('');
    s.whenToUse.forEach(x => out.push(`- ${x}`));
    out.push('');
  }

  // When not
  if (s.whenNotToUse?.length) {
    out.push('## 언제 쓰지 않나 (Don\'t use when)');
    out.push('');
    s.whenNotToUse.forEach(x => out.push(`- ${x}`));
    out.push('');
  }

  // Variants
  if (s.variants?.length) {
    out.push('## 변형 (Variants)');
    out.push('');
    out.push('| ID | Label | Description |');
    out.push('| --- | --- | --- |');
    for (const v of s.variants) {
      out.push(`| \`${v.id}\` | ${v.label || ''} | ${(v.description || '').replace(/\|/g, '\\|')} |`);
    }
    out.push('');

    // HTML snippets
    const hasHtml = s.variants.some(v => v.html);
    if (hasHtml) {
      out.push('### HTML Snippets');
      out.push('');
      for (const v of s.variants) {
        if (!v.html) continue;
        out.push(`**${v.label || v.id}**`);
        out.push('');
        out.push('```html');
        out.push(v.html);
        out.push('```');
        out.push('');
      }
    }
  }

  // Sizes
  if (s.sizes?.length) {
    out.push('## 크기 (Sizes)');
    out.push('');
    out.push('| ID | 값 |');
    out.push('| --- | --- |');
    for (const sz of s.sizes) {
      const detail = Object.entries(sz).filter(([k]) => k !== 'id').map(([k, v]) => `${k}: \`${v}\``).join(', ');
      out.push(`| \`${sz.id}\` | ${detail} |`);
    }
    out.push('');
  }

  // States
  if (s.states?.length) {
    out.push('## 상태 (States)');
    out.push('');
    out.push(s.states.map(x => `\`${x}\``).join(' · '));
    out.push('');
  }

  // Tokens
  if (s.tokens && Object.keys(s.tokens).length) {
    out.push('## 토큰 (Component Tokens)');
    out.push('');
    out.push('| 역할 | CSS 변수 |');
    out.push('| --- | --- |');
    for (const [role, css] of Object.entries(s.tokens)) {
      out.push(`| ${role} | \`${css}\` |`);
    }
    out.push('');
  }

  // Sub-parts
  if (s.subParts && Object.keys(s.subParts).length) {
    out.push('## 부속 요소 (Sub-parts)');
    out.push('');
    out.push('| 클래스 | 역할 |');
    out.push('| --- | --- |');
    for (const [cls, role] of Object.entries(s.subParts)) {
      out.push(`| \`${cls}\` | ${role} |`);
    }
    out.push('');
  }

  // Accessibility
  if (s.accessibility) {
    out.push('## 접근성 (Accessibility)');
    out.push('');
    const a = s.accessibility;
    if (a.role) out.push(`- **Role**: ${a.role}`);
    if (a.keyboardSupport?.length) out.push(`- **Keyboard**: ${a.keyboardSupport.map(k => `\`${k}\``).join(' · ')}`);
    if (a.minTouchTarget) out.push(`- **Min touch target**: ${a.minTouchTarget}px`);
    if (a.focusRing) out.push(`- **Focus ring**: \`${a.focusRing}\``);
    if (a.ariaNotes?.length) {
      out.push('- **ARIA notes**:');
      a.ariaNotes.forEach(n => out.push(`  - ${n}`));
    }
    out.push('');
  }

  // UX Writing
  if (s.uxWriting?.length) {
    out.push('## UX Writing 규칙');
    out.push('');
    s.uxWriting.forEach(x => out.push(`- ${x}`));
    out.push('');
  }

  // Gradient policy (Banner 같이 명시적인 경우)
  if (s.gradientPolicy) {
    out.push('## 그라데이션 정책');
    out.push('');
    out.push(`**규칙**: ${s.gradientPolicy.rule}`);
    out.push('');
    if (s.gradientPolicy.allowed?.length) {
      out.push('**허용**:');
      s.gradientPolicy.allowed.forEach((a, i) => out.push(`${i + 1}. ${a}`));
      out.push('');
    }
    if (s.gradientPolicy.reference) out.push(`참조: [${s.gradientPolicy.reference}](../${s.gradientPolicy.reference})`);
    out.push('');
  }

  // Used in demos
  if (s.usedInDemos?.length) {
    out.push('## 사용 데모');
    out.push('');
    out.push(s.usedInDemos.map(d => `\`${d}\``).join(' · '));
    out.push('');
    out.push(`수정 시 \`window.demoMatrix.byComponent['${s.id}']\` 로 영향 데모 전수 조회 가능.`);
    out.push('');
  }

  // Related docs
  if (s.relatedDocs?.sourceHtml) {
    out.push('---');
    out.push('');
    out.push(`**See also**: [${s.relatedDocs.sourceHtml}](../${s.relatedDocs.sourceHtml}) · [${schemaFileName}](${schemaFileName}) · [AGENTS.md](../AGENTS.md)`);
  }

  return out.join('\n');
}
