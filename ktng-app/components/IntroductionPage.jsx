import { useEffect, useRef } from 'react';

const STATS = [
  { num: 1987, suffix: '년 4월 1일', decimal: 0, label: '설립일', noComma: true },
  { num: 65797, suffix: '억원', decimal: 0, label: '매출', note: '*25년 사업보고서 기준' },
  { num: 4094, suffix: '명', decimal: 0, label: '임직원수', note: '*25년 사업보고서 기준' },
];

const PORTFOLIO = [
  { name: '담배', pct: 66.4, bg: 'linear-gradient(135deg,#5a4030 0%,#2a1a10 100%)' },
  { name: '건강기능', pct: 17.3, bg: 'linear-gradient(135deg,#6a5030 0%,#3a2a15 100%)' },
  { name: '부동산', pct: 10.8, bg: 'linear-gradient(135deg,#404060 0%,#202040 100%)' },
  { name: '제약·바이오', pct: 5.5, bg: 'linear-gradient(135deg,#306060 0%,#103030 100%)' },
];

const fmt = (v, noComma) => noComma ? String(Math.round(v)) : Math.round(v).toLocaleString('en-US');

export default function IntroductionPage() {
  const numRefs = useRef([]);
  useEffect(() => {
    const animate = (el, target, noComma) => {
      const start = performance.now();
      const dur = 1800;
      const tick = (now) => {
        const t = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = fmt(target * eased, noComma);
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = fmt(target, noComma);
      };
      requestAnimationFrame(tick);
    };
    const obs = new IntersectionObserver(es => {
      es.forEach(e => {
        if (e.isIntersecting && !e.target.dataset.animated) {
          e.target.dataset.animated = '1';
          const i = parseInt(e.target.dataset.idx, 10);
          animate(e.target, STATS[i].num, STATS[i].noComma);
        }
      });
    }, { threshold: 0.4 });
    numRefs.current.forEach(n => n && obs.observe(n));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <section className="sub-kv">
        <video className="sub-kv__video" autoPlay muted loop playsInline preload="auto">
          <source src="https://www.ktng.com/video/about/introduction/kv.webm" type="video/webm" />
          <source src="https://www.ktng.com/video/about/introduction/kv.mp4" type="video/mp4" />
        </video>
        <div className="sub-kv__text">
          <div className="sub-kv__label">KT&G 소개</div>
          <h1 className="sub-kv__h">
            <span>경계를 넘어서는 상상력으로,</span>
            <span>미래의 혁신을 만들어갑니다</span>
          </h1>
        </div>
      </section>
      <section className="introduction__overview">
        <h2 className="introduction__overview-h">글로벌 무대를 향해 나아가는 KT&G</h2>
        <div className="introduction__stats">
          {STATS.map((s, i) => (
            <div key={i} className="introduction__stat">
              <div className="introduction__stat-label">
                {s.label}
                {s.note && <span className="introduction__stat-cap">{s.note}</span>}
              </div>
              <div className="introduction__stat-num">
                <span ref={el => numRefs.current[i] = el} className="number-section-integer" data-idx={i}>0</span>
                <span className="number-section-post">{s.suffix}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="introduction__portfolio">
        <h2 className="introduction__portfolio-h">사업 포트폴리오</h2>
        <div className="introduction__portfolio-grid">
          {PORTFOLIO.map((p, i) => (
            <div key={i} className="portfolio-card" style={{ background: p.bg }}>
              <div className="portfolio-card__inner">
                <div className="portfolio-card__name">{p.name}</div>
                <div className="portfolio-card__pct">{p.pct}%</div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <style jsx>{`
        .sub-kv { position: relative; height: 911px; background: linear-gradient(180deg,#F5F5F8 0%,#E8E8F0 50%,#F0E5E0 100%); overflow: hidden; }
        .sub-kv__video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 1; }
        .sub-kv__text { position: absolute; inset: 0; padding: 0 89px; display: flex; flex-direction: column; justify-content: center; z-index: 2; color: #fff; }
        .sub-kv__label { font-size: 18px; font-weight: 600; color: rgba(255,255,255,0.85); margin-bottom: 32px; letter-spacing: 0.02em; }
        .sub-kv__h { font-size: 84px; font-weight: 600; line-height: 1.15; letter-spacing: -0.025em; margin: 0; color: rgba(255,255,255,0.65); }
        .sub-kv__h span { display: block; }
        .introduction__overview { padding: 120px 89px; background: #fff; max-width: 1741px; margin: 0 auto; }
        .introduction__overview-h { font-size: 72px; font-weight: 600; color: #000; line-height: 1.15; letter-spacing: -0.025em; margin: 0 0 64px; }
        .introduction__stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 32px; border-top: 1px solid #000; padding-top: 32px; }
        .introduction__stat { display: flex; flex-direction: column; gap: 14px; }
        .introduction__stat-label { font-size: 28px; font-weight: 600; color: #000; display: flex; align-items: baseline; gap: 8px; }
        .introduction__stat-cap { font-size: 16px; font-weight: 400; color: #787878; }
        .introduction__stat-num { display: flex; align-items: baseline; gap: 6px; }
        .number-section-integer { font-size: 104px; font-weight: 600; color: #000; line-height: 1; letter-spacing: -0.025em; font-feature-settings: 'tnum'; }
        .number-section-post { font-size: 32px; font-weight: 400; color: #787878; }
        .introduction__portfolio { padding: 120px 89px; background: #fff; max-width: 1741px; margin: 0 auto; }
        .introduction__portfolio-h { font-size: 72px; font-weight: 600; color: #000; letter-spacing: -0.025em; margin: 0 0 48px; }
        .introduction__portfolio-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
        .portfolio-card { position: relative; aspect-ratio: 861/600; border-radius: 8px; padding: 40px; cursor: pointer; transition: transform 0.3s ease; color: #fff; overflow: hidden; }
        .portfolio-card:hover { transform: translateY(-4px); }
        .portfolio-card::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.4)); }
        .portfolio-card__inner { position: relative; z-index: 1; display: flex; flex-direction: column; height: 100%; justify-content: space-between; }
        .portfolio-card__name { font-size: 32px; font-weight: 600; letter-spacing: -0.02em; }
        .portfolio-card__pct { font-size: 96px; font-weight: 600; letter-spacing: -0.025em; line-height: 1; }
        @media (max-width: 1024px) { .sub-kv__h { font-size: 48px; } .introduction__overview-h, .introduction__portfolio-h { font-size: 42px; } .introduction__stats { grid-template-columns: 1fr; } .introduction__portfolio-grid { grid-template-columns: 1fr; } .number-section-integer { font-size: 64px; } }
      `}</style>
    </>
  );
}
