const PANELS = [
  { cat: '⚙️ 미래 담배 사업의 신성장 동력 집중', sub: '담배', items: ['NGP 포트폴리오 다변화', '과학기반 NGP 개발역량 강화', '책임있는 마케팅 원칙 이행'] },
  { cat: '🌍 가치사슬 전반 환경책임 이행',         sub: null,   items: ['기후변화 대응 고도화', '순환경제 가속화', '생물다양성 보호'] },
  { cat: '💊 건강·소비자 친화적 제품 경쟁력 강화', sub: '건기식', items: ['소비자 효능 근거(Evidence) 및 경쟁 우위 기술 확보를 위한 R&D 강화', '친환경 브랜드 Identity 정립'] },
  { cat: '🤝 지속가능한 산업 생태계 조성',         sub: null,   items: ['글로벌 수준의 인권경영 강화 및 정책 준수', '농가 사회·환경적 가치 증대 실현', '공급망 ESG 역량 강화'] },
  { cat: '💡 지속 가능한 Biz. 성장기회 창출',       sub: '제약·화장품·기타', items: ['신성장 동력 발굴', '바이오·헬스 혁신'] },
  { cat: '🏛️ 거버넌스 고도화/이행 역량 강화',      sub: null,   items: ['조직·경영진 대상 ESG KPI 내재화', '지배구조 체계화'] },
];

const TABLE = [
  { y: '2025년', total: 'A',  e: 'A',  s: 'A+', g: 'A' },
  { y: '2024년', total: 'A',  e: 'A',  s: 'A+', g: 'A' },
  { y: '2023년', total: 'A+', e: 'A+', s: 'A+', g: 'A+' },
  { y: '2022년', total: 'A',  e: 'A',  s: 'A+', g: 'A' },
];

export default function ESGPage() {
  return (
    <>
      <section className="esg__hero">
        <div className="esg__hero-text">
          <div className="esg__hero-label">ESG 개요</div>
          <h1 className="esg__hero-h"><span>Empowering</span><span>Sustainability for Growth</span></h1>
        </div>
      </section>

      <section className="esg__strategy">
        <div className="esg__strategy-labels">
          <div className="esg__strategy-label">ESG 경영을 통한 Biz. 성장 기반 마련</div>
          <div className="esg__strategy-label">공통 Standard 이행으로 ESG 리스크 관리 고도화</div>
        </div>
        <div className="esg__strategy-grid">
          {PANELS.map((p, i) => (
            <div key={i} className="esg__panel">
              <div className="esg__panel-cat">{p.cat}</div>
              {p.sub && <div className="esg__panel-sub">{p.sub}</div>}
              <ul className="esg__panel-list">
                {p.items.map((it, j) => <li key={j}>{it}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="esg__table-section">
        <div className="esg__table-head">
          <div className="esg__table-logo">한국ESG<br />기준원</div>
          <table className="esg__table">
            <thead>
              <tr><th>구분</th><th>종합평가</th><th>E(환경)</th><th>S(사회)</th><th>G(지배구조)</th></tr>
            </thead>
            <tbody>
              {TABLE.map((r, i) => (
                <tr key={i}><td>{r.y}</td><td>{r.total}</td><td>{r.e}</td><td>{r.s}</td><td>{r.g}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="esg__cap">* 15년간 A(우수)등급 이상 유지</div>
      </section>

      <style jsx>{`
        .esg__hero { position: relative; height: 911px; background: url('https://www.ktng.com/images/sustainability/overview/kv-desktop.webp') center/cover no-repeat, linear-gradient(180deg,#6a8070,#3a5045); overflow: hidden; color: #fff; display: flex; align-items: flex-end; padding: 0 89px 80px; }
        .esg__hero::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.05) 0%, transparent 30%, rgba(0,0,0,0.15) 100%); }
        .esg__hero-text { position: relative; z-index: 2; }
        .esg__hero-label { font-size: 18px; font-weight: 500; margin-bottom: 32px; }
        .esg__hero-h { font-size: 84px; font-weight: 700; line-height: 1.1; letter-spacing: -0.025em; font-family: Arial, sans-serif; margin: 0; }
        .esg__hero-h span { display: block; }
        .esg__strategy { position: relative; padding: 120px 89px; background: radial-gradient(ellipse at center,#2a4a35 0%,#1a3025 60%,#0a1810 100%); color: #fff; overflow: hidden; }
        .esg__strategy::after { content: ''; position: absolute; inset: 0; background-image: radial-gradient(circle at 20% 30%,rgba(120,200,80,0.4) 0px,transparent 2px), radial-gradient(circle at 70% 60%,rgba(180,255,120,0.3) 0px,transparent 2px), radial-gradient(circle at 40% 80%,rgba(150,255,100,0.35) 0px,transparent 1.5px); background-size: 60px 60px,40px 40px,80px 80px; opacity: 0.6; pointer-events: none; }
        .esg__strategy-labels { position: relative; z-index: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-bottom: 64px; text-align: center; max-width: 1500px; margin-left: auto; margin-right: auto; }
        .esg__strategy-label { font-size: 18px; font-weight: 500; color: rgba(255,255,255,0.85); }
        .esg__strategy-grid { position: relative; z-index: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 48px; max-width: 1500px; margin: 0 auto; }
        .esg__panel { background: rgba(20,40,25,0.55); border: 1px solid rgba(120,200,80,0.2); border-radius: 18px; padding: 40px; backdrop-filter: blur(8px); }
        .esg__panel-cat { font-size: 14px; font-weight: 600; color: rgba(180,255,120,0.85); margin-bottom: 14px; letter-spacing: 0.04em; }
        .esg__panel-sub { font-size: 14px; color: rgba(255,255,255,0.85); margin-bottom: 14px; font-weight: 500; }
        .esg__panel-list { font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.7; padding-left: 18px; margin: 0; }
        .esg__panel-list li { margin-bottom: 6px; }
        .esg__table-section { padding: 80px 89px; background: #fff; max-width: 1500px; margin: 0 auto; }
        .esg__table-head { display: grid; grid-template-columns: 280px 1fr; gap: 64px; align-items: center; }
        .esg__table-logo { font-size: 20px; font-weight: 600; color: #3A5570; line-height: 1.3; }
        .esg__table { width: 100%; border-collapse: collapse; }
        .esg__table th { font-size: 16px; font-weight: 500; color: #787878; padding: 18px; text-align: center; border-bottom: 1px solid rgba(0,0,0,0.1); }
        .esg__table td { font-size: 18px; font-weight: 600; color: #000; padding: 24px; text-align: center; border-bottom: 1px solid rgba(0,0,0,0.06); }
        .esg__table td:first-child { color: #787878; font-weight: 500; }
        .esg__cap { font-size: 14px; color: #787878; margin-top: 18px; }
        @media (max-width: 1024px) { .esg__hero-h { font-size: 48px; } .esg__strategy-grid, .esg__strategy-labels, .esg__table-head { grid-template-columns: 1fr; } }
      `}</style>
    </>
  );
}
