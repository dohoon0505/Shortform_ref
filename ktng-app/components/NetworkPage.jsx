const CORPS = [
  { country: '러시아 법인',       flag: 'linear-gradient(180deg,#fff 33%,#0033A0 33%,#0033A0 66%,#DA291C 66%)', addr: '249020, RUSSIAN FEDERATION, KALUGA REGION, BOROVSK DISTRICT, DOBRINO VILLAGE, 2ND VOSTOCHNIY PROEZD, VALDENIE 2, 1B, 1', email: 'admin@ktng-global.com', tel: '+7 495 136 2244' },
  { country: '카자흐스탄 법인',    flag: 'linear-gradient(180deg,#00ABCC 50%,#FFC72C 50%)', addr: 'Kazakhstan, Almaty, Bostandyk district, Al-Farabi Avenue 5, BC Nurly Tau, Block 2A, commercial property 53A, postal index A15E2P8', email: 'victor@ktng.com', tel: '+7 777 112 4974' },
  { country: '우즈베키스탄 법인',  flag: 'linear-gradient(180deg,#1EB53A 25%,#fff 25%,#fff 75%,#0099B5 75%)', addr: '21 Taras Shevchenko Street, Oybek Neighborhood, Mirobod District, Tashkent, Uzbekistan', email: 'neoecosis@ktng.com', tel: '+998 90 821 33 33' },
  { country: '인도네시아 법인',    flag: 'linear-gradient(180deg,#FF0000 50%,#fff 50%)', addr: 'Jakarta, Indonesia', email: 'indonesia@ktng.com', tel: '+62 21 1234 5678' },
  { country: '대만 법인',          flag: 'linear-gradient(135deg,#FE0000 0%,#000095 50%,#FE0000 100%)', addr: 'Taipei, Taiwan', email: 'taiwan@ktng.com', tel: '+886 2 1234 5678' },
  { country: '미국 법인',          flag: 'repeating-linear-gradient(180deg,#fff 0,#fff 10%,#B22234 10%,#B22234 20%)', addr: 'USA', email: 'usa@ktng.com', tel: '+1 213 456 7890' },
];

export default function NetworkPage() {
  return (
    <>
      <section className="network__hero">
        <h1 className="network__hero-h">글로벌 네트워크</h1>
      </section>
      <section className="network__tabs">
        <button className="network__tab network__tab--active">해외</button>
        <button className="network__tab">국내</button>
      </section>
      <section className="network__body">
        <div className="network__intro">
          <div className="network__intro-label">Global Top-Tier KT&G</div>
          <p className="network__intro-desc">글로벌 최고 수준 기업 KT&G는 전략적 해외 법인 설립과 혁신적인 전 세계 가치사슬 확대를 통해 지속적인 성장 동력을 바탕으로 세계 시장에서 독보적인 리더십을 발휘하며 선도하고 있습니다.</p>
        </div>
        <div className="network__sub">법인 <span className="network__sub-tag">판매법인</span></div>
        <div className="network__grid">
          {CORPS.map((c, i) => (
            <div key={i} className="network__card">
              <div className="network__card-head">
                <div className="network__flag" style={{ background: c.flag }} />
                <div className="network__card-name">{c.country}</div>
              </div>
              <div className="network__row"><div className="network__row-label">주소</div><div>{c.addr}</div></div>
              <div className="network__row"><div className="network__row-label">이메일</div><div>{c.email}</div></div>
              <div className="network__row"><div className="network__row-label">전화</div><div>{c.tel}</div></div>
            </div>
          ))}
        </div>
      </section>
      <style jsx>{`
        .network__hero { padding: 120px 89px 32px; max-width: 1741px; margin: 0 auto; }
        .network__hero-h { font-size: 84px; font-weight: 600; color: #000; letter-spacing: -0.025em; margin: 0; line-height: 1.1; }
        .network__tabs { padding: 0 89px 40px; max-width: 1741px; margin: 0 auto; display: flex; gap: 8px; }
        .network__tab { padding: 14px 28px; border: 1px solid rgba(0,0,0,0.2); border-radius: 100px; font-size: 18px; font-weight: 400; color: #000; background: #fff; cursor: pointer; font-family: inherit; transition: all 0.3s ease; }
        .network__tab--active { background: #000; color: #fff; border-color: #000; }
        .network__body { padding: 80px 89px 120px; max-width: 1741px; margin: 0 auto; }
        .network__intro { display: grid; grid-template-columns: 420px 1fr; gap: 48px; margin-bottom: 64px; }
        .network__intro-label { font-size: 32px; font-weight: 600; color: #000; letter-spacing: -0.02em; }
        .network__intro-desc { font-size: 20px; font-weight: 400; color: #000; line-height: 1.7; max-width: 880px; margin: 0; }
        .network__sub { font-size: 24px; font-weight: 600; color: #000; margin-bottom: 24px; }
        .network__sub-tag { font-size: 16px; font-weight: 400; color: #787878; margin-left: 8px; }
        .network__grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 32px; }
        .network__card { padding: 32px; background: #fff; border-radius: 12px; border: 1px solid rgba(0,0,0,0.06); cursor: pointer; transition: all 0.3s ease; }
        .network__card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.08); }
        .network__card-head { display: flex; align-items: center; gap: 18px; margin-bottom: 24px; }
        .network__flag { width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0; }
        .network__card-name { font-size: 24px; font-weight: 600; color: #000; }
        .network__row { display: grid; grid-template-columns: 60px 1fr; gap: 14px; font-size: 14px; line-height: 1.6; color: #000; margin-bottom: 10px; }
        .network__row-label { color: #787878; }
        @media (max-width: 1024px) { .network__hero-h { font-size: 42px; } .network__grid { grid-template-columns: 1fr; } .network__intro { grid-template-columns: 1fr; } }
      `}</style>
    </>
  );
}
