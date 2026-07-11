// scripts/register-ktng-flow.mjs
// system.json 에 ktng-com-flow reference 를 등록한다.
// 이미 등록되어 있으면 sections / counts 만 갱신.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SYSTEM_FILE = path.join(ROOT, 'system.json');
const META_FILE = path.join(ROOT, 'analyses', 'ktng-com-flow', 'sections-meta.json');

const REF_ID = 'ktng-com-flow';

const sectionsMeta = JSON.parse(fs.readFileSync(META_FILE, 'utf-8'));
const sys = JSON.parse(fs.readFileSync(SYSTEM_FILE, 'utf-8'));

const subpages = [
  { title: '메인 (Home)', url: 'https://www.ktng.com/' },
  { title: '회사소개 - KT&G 소개', url: 'https://www.ktng.com/about/introduction' },
  { title: '회사소개 - 연혁', url: 'https://www.ktng.com/about/history' },
  { title: '회사소개 - 주요사업', url: 'https://www.ktng.com/about/business' },
  { title: '회사소개 - 글로벌 네트워크', url: 'https://www.ktng.com/about/network/overseas' },
  { title: '투자정보 - IR 개요', url: 'https://www.ktng.com/ir/overview' },
  { title: '투자정보 - 기업가치 제고 계획', url: 'https://www.ktng.com/ir/value' },
  { title: '투자정보 - 지배구조', url: 'https://www.ktng.com/ir/governance/overview' },
  { title: '투자정보 - 재무정보', url: 'https://www.ktng.com/ir/financial-info/financial-highlight' },
  { title: '투자정보 - 주식정보', url: 'https://www.ktng.com/ir/stock-info/chart' },
  { title: '투자정보 - 공시정보', url: 'https://www.ktng.com/ir/disclosure-info/notices' },
  { title: '투자정보 - IR 자료실', url: 'https://www.ktng.com/ir/ir-archives/events' },
  { title: '지속가능경영 - ESG 개요', url: 'https://www.ktng.com/sustainability/overview' },
  { title: '지속가능경영 - 환경', url: 'https://www.ktng.com/sustainability/environment/environmanage' },
  { title: '지속가능경영 - 사회 (안전보건)', url: 'https://www.ktng.com/sustainability/social/safety' },
  { title: '지속가능경영 - 윤리경영', url: 'https://www.ktng.com/sustainability/ethics' },
  { title: '지속가능경영 - 아카이빙', url: 'https://www.ktng.com/sustainability/archive/policies' },
  { title: '미디어 - 뉴스룸', url: 'https://www.ktng.com/media/news/all' },
  { title: '미디어 - 소셜미디어', url: 'https://www.ktng.com/media/social/all' },
  { title: '미디어 - 라이브러리', url: 'https://www.ktng.com/media/library/print' },
  { title: '인재채용 - 인사제도', url: 'https://www.ktng.com/career/hrsystem' },
  { title: '인재채용 - 직무소개', url: 'https://www.ktng.com/career/job/marketing-sales' },
  { title: '인재채용 - 채용가이드', url: 'https://www.ktng.com/career/recruit' },
  { title: '고객문의', url: 'https://www.ktng.com/contact-us' },
  { title: '비윤리행위 신고', url: 'https://www.ktng.com/compliance' },
  { title: '안전보건소통마당', url: 'https://www.ktng.com/safety' },
];

const newRef = {
  id: REF_ID,
  title: 'KT&G (흐름 스케치 1호)',
  url: 'https://www.ktng.com/',
  date: '2026-05-26',
  analysis: 'analyses/ktng-com-flow/analysis.json',
  pagesAnalyzed: 26,
  flowMode: true,
  sections: sectionsMeta,
  subpages
};

const refs = sys.references || [];
const idx = refs.findIndex(r => r.id === REF_ID);
if (idx >= 0) {
  refs[idx] = newRef;
  console.log(`✓ updated existing ${REF_ID} at index ${idx}`);
} else {
  refs.push(newRef);
  console.log(`✓ appended new ${REF_ID} as ref #${refs.length}`);
}
sys.references = refs;
sys.counts = sys.counts || {};
sys.counts.references = refs.length;

fs.writeFileSync(SYSTEM_FILE, JSON.stringify(sys, null, 2), 'utf-8');
const sizeKB = (fs.statSync(SYSTEM_FILE).size / 1024).toFixed(1);
console.log(`✓ wrote system.json (${sizeKB} KB, references=${refs.length}, sections in ${REF_ID}=${sectionsMeta.length})`);
