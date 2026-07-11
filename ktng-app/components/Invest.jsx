import { useEffect, useRef } from 'react';

const STOCKS = [
  { name: 'KT&G',   target: 179800, decimal: 0, unit: '원', delta: '▼9,200 (-4.87%)', big: true },
  { name: 'KOSPI',  target: 7493.18, decimal: 2, unit: '',  delta: '▼488 (-6.12%)' },
  { name: 'KOSDAQ', target: 1129.82, decimal: 2, unit: '',  delta: '▼61 (-5.14%)' },
  { name: 'NASDAQ', target: 26225.15, decimal: 2, unit: '', delta: '▼410 (-1.54%)' },
];

const EVENTS = [
  { title: '2026년 1분기 경영실적 발표', date: '2026. 5. 7' },
  { title: '2025년 4분기 경영실적 발표', date: '2026. 2. 5' },
  { title: '2025년 3분기 경영실적 발표', date: '2025. 11. 6' },
  { title: '2025 KT&G CEO Investor Day', date: '2025. 9. 23' },
  { title: '2025년 2분기 경영실적 발표', date: '2025. 8. 7' },
];

const fmt = (v, d) => d > 0
  ? v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
  : Math.round(v).toLocaleString('en-US');

export default function Invest() {
  const numRefs = useRef([]);
  useEffect(() => {
    const animate = (el, target, decimal) => {
      const start = performance.now();
      const dur = 1600;
      const tick = (now) => {
        const t = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = fmt(target * eased, decimal);
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = fmt(target, decimal);
      };
      requestAnimationFrame(tick);
    };
    const obs = new IntersectionObserver(es => {
      es.forEach(e => {
        if (e.isIntersecting && !e.target.dataset.animated) {
          e.target.dataset.animated = '1';
          const i = parseInt(e.target.dataset.idx, 10);
          animate(e.target, STOCKS[i].target, STOCKS[i].decimal);
        }
      });
    }, { threshold: 0.4 });
    numRefs.current.forEach(n => n && obs.observe(n));
    return () => obs.disconnect();
  }, []);

  return (
    <section className="iv">
      <div className="iv__title">Invest Relations</div>
      <div className="iv__grid">
        <div className="iv__card">
          <div className="iv__card-label">주가정보</div>
          {STOCKS.map((s, i) => (
            <div key={i} className="iv__stock-row">
              <div className="iv__stock-name">{s.name}</div>
              <div className="iv__stock-right">
                <div className={`iv__stock-main${s.big ? ' iv__stock-main--big' : ''}`}>
                  <span ref={el => numRefs.current[i] = el} className="iv__num" data-idx={i}>0</span>
                  {s.unit && <span className="iv__stock-unit">{s.unit}</span>}
                </div>
                <div className="iv__stock-delta">{s.delta}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="iv__col-mid">
          <div className="iv__card iv__card--dark">
            <div className="iv__card-label">신용등급</div>
            <div className="iv__class-row">
              {['NICE 신용평가', '한국기업평가', '한국신용평가'].map(t => (
                <div key={t} className="iv__class-item">
                  <div className="iv__class-badge">AAA</div>
                  <div className="iv__class-text">{t}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="iv__col-mid-bottom">
            <div className="iv__card">
              <div className="iv__card-label">사업보고서</div>
              <div className="iv__report-title">2025년 사업보고서</div>
            </div>
            <div className="iv__card">
              <div className="iv__card-label">경영실적</div>
              <div className="iv__report-title">2026년 1분기<br />경영실적 발표자료</div>
            </div>
          </div>
        </div>
        <div className="iv__card iv__card--translucent">
          <div className="iv__card-label">IR 행사</div>
          <div className="iv__event-list">
            {EVENTS.map((e, i) => (
              <div key={i} className="iv__event-item">
                <div className="iv__event-title">{e.title}</div>
                <div className="iv__event-date">{e.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        .iv { position: relative; padding: 80px 89px; color: #000; height: 1027px; background: linear-gradient(135deg, rgba(220,170,150,0.45) 0%, rgba(180,190,200,0.5) 25%, rgba(160,170,180,0.55) 50%, rgba(170,170,170,0.5) 75%, rgba(200,180,160,0.45) 100%), linear-gradient(180deg, #d8d8d8 0%, #b8b8b8 100%); overflow: hidden; }
        .iv__title { font-size: 24px; font-weight: 600; color: #fff; letter-spacing: -0.01em; margin-bottom: 32px; text-shadow: 0 2px 8px rgba(0,0,0,0.2); }
        .iv__grid { max-width: 1500px; margin: 0 auto; display: grid; grid-template-columns: 1.1fr 1fr 1fr; gap: 24px; align-items: stretch; }
        .iv__col-mid { display: grid; grid-template-rows: 1fr 1fr; gap: 18px; }
        .iv__col-mid-bottom { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
        .iv__card { background: #fff; border-radius: 8px; padding: 40px 36px; display: flex; flex-direction: column; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .iv__card--dark { background: rgba(0,0,0,0.18); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); color: #fff; box-shadow: none; }
        .iv__card--translucent { background: rgba(255,255,255,0.55); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
        .iv__card-label { font-size: 18px; font-weight: 600; color: #000; margin-bottom: 32px; }
        .iv__card--dark .iv__card-label { color: #fff; }
        .iv__stock-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 18px 0; border-bottom: 1px solid rgba(0,0,0,0.08); }
        .iv__stock-row:last-child { border-bottom: none; }
        .iv__stock-name { font-size: 18px; font-weight: 500; color: #000; }
        .iv__stock-main { font-size: 32px; font-weight: 600; color: #000; letter-spacing: -0.025em; font-feature-settings: 'tnum'; line-height: 1; }
        .iv__stock-main--big { font-size: 48px; }
        .iv__stock-unit { font-size: 14px; font-weight: 400; color: #000; margin-left: 4px; }
        .iv__stock-delta { font-size: 13px; color: var(--c-stock-down); margin-top: 6px; text-align: right; }
        .iv__stock-right { text-align: right; }
        .iv__class-row { display: flex; gap: 18px; justify-content: space-around; }
        .iv__class-item { display: flex; flex-direction: column; align-items: center; gap: 12px; flex: 1; }
        .iv__class-badge { width: 96px; height: 96px; border-radius: 50%; background: rgba(0,0,0,0.18); border: 1.5px solid var(--c-aaa-outline); display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 400; color: #fff; transition: var(--tx-all); }
        .iv__class-item:hover .iv__class-badge { box-shadow: 0 0 20px rgba(162,195,254,0.4); }
        .iv__class-text { font-size: 12px; color: #fff; text-align: center; }
        .iv__report-title { font-size: 18px; font-weight: 600; color: #000; line-height: 1.4; margin-top: auto; }
        .iv__event-list { display: flex; flex-direction: column; }
        .iv__event-item { padding: 16px 0; border-bottom: 1px solid rgba(0,0,0,0.08); }
        .iv__event-item:last-child { border-bottom: none; }
        .iv__event-title { font-size: 15px; font-weight: 600; color: #000; margin-bottom: 4px; }
        .iv__event-date { font-size: 12px; color: #666; }
        @media (max-width: 1024px) { .iv__grid { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
}
