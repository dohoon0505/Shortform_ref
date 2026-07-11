import Head from 'next/head';
import BusinessSticky from '../../components/BusinessSticky';

export default function BusinessPage() {
  return (
    <>
      <Head>
        <title>주요사업 | 회사소개 | KT&G</title>
      </Head>
      <main>
        <section className="sub-kv business-kv">
          <div className="sub-kv__bg" />
          <div className="sub-kv__text">
            <div className="sub-kv__label">주요사업</div>
            <h1 className="sub-kv__h">
              <span>Modernize를 중심으로, 핵심 사업의</span>
              <span>경쟁력을 강화하고 미래를 만들어갑니다</span>
            </h1>
          </div>
          <style jsx>{`
            .sub-kv { position: relative; height: 855px; background: linear-gradient(180deg,#3a4555 0%,#2a3540 50%,#1a2530 100%); overflow: hidden; color: #fff; display: flex; align-items: flex-end; padding: 0 89px 120px; }
            .sub-kv__bg { position: absolute; inset: 0; background-image: radial-gradient(ellipse at 30% 40%, rgba(80,120,200,0.4) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(180,140,80,0.3) 0%, transparent 50%); }
            .sub-kv__text { position: relative; z-index: 2; }
            .sub-kv__label { font-size: 18px; font-weight: 500; color: rgba(255,255,255,0.85); margin-bottom: 32px; letter-spacing: 0.02em; }
            .sub-kv__h { font-size: 64px; font-weight: 600; line-height: 1.15; letter-spacing: -0.025em; margin: 0; color: #fff; }
            .sub-kv__h span { display: block; }
            @media (max-width: 1024px) { .sub-kv__h { font-size: 36px; } }
          `}</style>
        </section>
        <section className="strategy-intro">
          <div className="container">
            <div className="strategy-intro__label">사업 전략</div>
            <h2 className="strategy-intro__h">3대 핵심 사업으로 글로벌 성장 동력 확보</h2>
            <p className="strategy-intro__desc">KT&G는 해외궐련·NGP·건강기능식품 3대 핵심사업을 중심으로 글로벌 시장에서 지속적인 성장을 추구합니다. 각 사업의 차별화된 경쟁력을 기반으로 미래 가치 창출을 이어갑니다.</p>
          </div>
          <style jsx>{`
            .strategy-intro { padding: 120px 89px; background: #fff; }
            .container { max-width: 1500px; margin: 0 auto; display: grid; grid-template-columns: 280px 1fr; gap: 64px; align-items: start; border-top: 1px solid #000; padding-top: 32px; }
            .strategy-intro__label { font-size: 18px; font-weight: 600; color: #000; }
            .strategy-intro__h { font-size: 48px; font-weight: 600; color: #000; letter-spacing: -0.025em; margin: 0 0 32px; line-height: 1.2; }
            .strategy-intro__desc { font-size: 20px; line-height: 1.7; color: #000; margin: 0; max-width: 880px; }
            @media (max-width: 1024px) { .container { grid-template-columns: 1fr; gap: 32px; } .strategy-intro__h { font-size: 32px; } }
          `}</style>
        </section>
        <BusinessSticky />
      </main>
    </>
  );
}
