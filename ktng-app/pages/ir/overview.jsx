import Head from 'next/head';
import IRFinancial from '../../components/IRFinancial';

export default function IROverviewPage() {
  return (
    <>
      <Head>
        <title>IR 개요 | 투자정보 | KT&G</title>
      </Head>
      <main>
        <section className="overview__kv">
          <div className="overview__kv-text">
            <div className="overview__kv-label">IR 개요</div>
            <h1 className="overview__kv-h">
              <span>주주가치 제고와 함께하는</span>
              <span>지속가능한 성장</span>
            </h1>
          </div>
          <style jsx>{`
            .overview__kv { position: relative; height: 507px; background: linear-gradient(180deg,#0a1530 0%,#1a2a5a 50%,#0a1a40 100%); overflow: hidden; color: #fff; display: flex; align-items: flex-end; padding: 0 89px 80px; }
            .overview__kv::before { content: ''; position: absolute; inset: 0; background-image: radial-gradient(ellipse at 75% 30%, rgba(100,140,220,0.3) 0%, transparent 60%), radial-gradient(ellipse at 25% 80%, rgba(80,100,180,0.25) 0%, transparent 60%); }
            .overview__kv-text { position: relative; z-index: 2; max-width: 1500px; margin: 0 auto; width: 100%; }
            .overview__kv-label { font-size: 18px; font-weight: 500; color: rgba(255,255,255,0.85); margin-bottom: 24px; letter-spacing: 0.02em; }
            .overview__kv-h { font-size: 56px; font-weight: 600; line-height: 1.15; letter-spacing: -0.025em; margin: 0; color: #fff; }
            .overview__kv-h span { display: block; }
            @media (max-width: 1024px) { .overview__kv-h { font-size: 36px; } }
          `}</style>
        </section>
        <section className="overview__stock">
          <div className="stock-card">
            <div className="stock-card__title">KT&G</div>
            <div className="stock-card__price">
              <span className="stock-card__num">179,800</span>
              <span className="stock-card__unit">원</span>
              <span className="stock-card__delta">▼9,200 (-4.87%)</span>
            </div>
            <div className="stock-card__date">2026년 05월 15일 15:30 기준</div>
          </div>
          <div className="stock-indices">
            <div className="stock-index"><div className="stock-index__name">KOSPI</div><div className="stock-index__val">7,182.80</div><div className="stock-index__delta">▼488 (-6.12%)</div></div>
            <div className="stock-index"><div className="stock-index__name">KOSDAQ</div><div className="stock-index__val">1,083.00</div><div className="stock-index__delta">▼61 (-5.14%)</div></div>
            <div className="stock-index"><div className="stock-index__name">NASDAQ</div><div className="stock-index__val">25,138.27</div><div className="stock-index__delta">▼410 (-1.54%)</div></div>
          </div>
          <style jsx>{`
            .overview__stock { padding: 80px 89px; background: #fff; max-width: 1500px; margin: 0 auto; display: grid; grid-template-columns: 1.5fr 1fr; gap: 32px; align-items: center; }
            .stock-card { background: linear-gradient(135deg,#0a1530 0%,#1a2a5a 60%,#3a3050 100%); border-radius: 16px; padding: 48px; color: #fff; position: relative; overflow: hidden; min-height: 220px; }
            .stock-card::before { content: ''; position: absolute; top: -50px; right: -50px; width: 300px; height: 200px; background: radial-gradient(ellipse, rgba(255,180,100,0.35), transparent 70%); }
            .stock-card__title { font-size: 16px; font-weight: 500; opacity: 0.9; margin-bottom: 16px; position: relative; z-index: 1; }
            .stock-card__price { display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px; position: relative; z-index: 1; }
            .stock-card__num { font-size: 56px; font-weight: 600; letter-spacing: -0.025em; }
            .stock-card__unit { font-size: 24px; }
            .stock-card__delta { font-size: 18px; color: #6BA5FF; margin-left: 8px; }
            .stock-card__date { font-size: 14px; opacity: 0.7; text-align: right; margin-top: 24px; position: relative; z-index: 1; }
            .stock-indices { display: grid; grid-template-rows: repeat(3,1fr); gap: 8px; }
            .stock-index { display: grid; grid-template-columns: 80px 1fr auto; gap: 14px; padding: 12px 16px; border: 1px solid rgba(0,0,0,0.08); border-radius: 8px; align-items: center; }
            .stock-index__name { font-size: 14px; color: #787878; }
            .stock-index__val { font-size: 18px; font-weight: 600; color: #000; }
            .stock-index__delta { font-size: 14px; color: #2078E0; }
            @media (max-width: 1024px) { .overview__stock { grid-template-columns: 1fr; } }
          `}</style>
        </section>
        <IRFinancial />
        <section className="overview__event">
          <h2 className="overview__event-h">IR 행사</h2>
          <div className="event-list">
            <div className="event-item"><div className="event-item__date">2026. 05. 07</div><div className="event-item__title">2026년 1분기 경영실적 발표</div></div>
            <div className="event-item"><div className="event-item__date">2026. 02. 05</div><div className="event-item__title">2025년 4분기 경영실적 발표</div></div>
            <div className="event-item"><div className="event-item__date">2025. 11. 06</div><div className="event-item__title">2025년 3분기 경영실적 발표</div></div>
            <div className="event-item"><div className="event-item__date">2025. 09. 23</div><div className="event-item__title">2025 KT&G CEO Investor Day</div></div>
          </div>
          <style jsx>{`
            .overview__event { padding: 80px 89px; max-width: 1500px; margin: 0 auto; background: #fff; }
            .overview__event-h { font-size: 32px; font-weight: 600; color: #000; letter-spacing: -0.02em; margin: 0 0 32px; }
            .event-list { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 64px; }
            .event-item { display: grid; grid-template-columns: 120px 1fr; gap: 24px; padding: 18px 0; border-bottom: 1px solid rgba(0,0,0,0.08); cursor: pointer; transition: opacity 0.3s ease; }
            .event-item:hover { opacity: 0.7; }
            .event-item__date { font-size: 14px; color: #787878; }
            .event-item__title { font-size: 18px; color: #000; }
            @media (max-width: 1024px) { .event-list { grid-template-columns: 1fr; } }
          `}</style>
        </section>
      </main>
    </>
  );
}
