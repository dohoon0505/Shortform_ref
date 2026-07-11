const BADGES = [
  { grade: 'AAA', text: '나이스신용평가' },
  { grade: 'AAA', text: '한국기업평가' },
  { grade: 'AAA', text: '한국신용평가' },
  { grade: 'A3',  text: "Moody's" },
  { grade: 'A-',  text: 'S&P' },
];

export default function IRFinancial() {
  return (
    <section className="overview__financial-wrapper">
      <div className="container container--l overview__financial">
        <h2 className="headline headline--5 overview__financial-headline">재무정보</h2>
        <div className="overview__financial-grid">
          <div className="overview__financial-left">
            <div className="overview__financial-class-block">
              <div className="overview__financial-title">신용평가등급</div>
              <div className="overview__financial-year">2025년 기준</div>
              <div className="class-row">
                {BADGES.map((b, i) => (
                  <div key={i} className="class-item">
                    <div className="class-item__class">{b.grade}</div>
                    <div className="class-item__text">{b.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="overview__financial-right">
            <div className="overview__financial-highlight">
              <div className="overview__financial-highlight-h">재무하이라이트</div>
              <button className="overview__financial-highlight-cta">→</button>
            </div>
            <div className="overview__financial-report">
              <div className="overview__financial-report-text">
                <div className="overview__financial-report-label">별도보고서</div>
                <div className="overview__financial-report-title">2025년 4분기 감사보고서</div>
              </div>
              <div className="overview__financial-report-icon">↓</div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .overview__financial-wrapper {
          position: relative;
          height: 855px;
          background: url('https://www.ktng.com/images/ir/overview/financial.webp') center/cover no-repeat;
          color: #fff;
          font-family: 'Pretendard', system-ui, sans-serif;
          padding: 80px 89px;
          box-sizing: border-box;
        }
        .overview__financial { max-width: 1500px; margin: 0 auto; }
        .overview__financial-headline { font-size: 64px; font-weight: 600; color: #fff; margin: 0 0 64px; letter-spacing: -0.025em; }
        .overview__financial-grid { display: grid; grid-template-columns: 1fr 360px; gap: 48px; align-items: start; }
        .overview__financial-title { font-size: 32px; font-weight: 600; color: #fff; letter-spacing: -0.02em; margin-bottom: 8px; }
        .overview__financial-year { font-size: 16px; color: rgba(255,255,255,0.7); margin-bottom: 32px; }
        .class-row { display: flex; gap: 32px; flex-wrap: wrap; }
        .class-item { display: flex; flex-direction: column; align-items: center; gap: 14px; }
        .class-item__class { width: 120px; height: 120px; border-radius: 50%; background: rgba(0,0,0,0.15); border: 1.5px solid #A2C3FE; display: flex; align-items: center; justify-content: center; font-size: 40px; font-weight: 400; color: #fff; transition: all 0.3s ease; }
        .class-item:hover .class-item__class { box-shadow: 0 0 32px rgba(162,195,254,0.4); transform: translateY(-4px); }
        .class-item__text { font-size: 14px; font-weight: 500; color: #fff; text-align: center; }
        .overview__financial-right { display: flex; flex-direction: column; gap: 18px; }
        .overview__financial-highlight {
          position: relative; height: 406px;
          background: url('https://www.ktng.com/images/ir/overview/highlight.webp') center/cover no-repeat, linear-gradient(135deg, #1a3a7a, #3a7add);
          border-radius: 16px; padding: 32px; cursor: pointer;
          transition: transform 0.3s ease; overflow: hidden;
        }
        .overview__financial-highlight:hover { transform: translateY(-4px); }
        .overview__financial-highlight-h { font-size: 24px; font-weight: 600; color: #fff; }
        .overview__financial-highlight-cta { position: absolute; bottom: 32px; right: 32px; width: 56px; height: 56px; border-radius: 50%; background: #000; color: #fff; border: none; font-size: 18px; cursor: pointer; transition: transform 0.3s ease; }
        .overview__financial-highlight:hover .overview__financial-highlight-cta { transform: translateX(4px) rotate(-12deg); }
        .overview__financial-report { background: #fff; border-radius: 12px; padding: 32px; display: flex; justify-content: space-between; align-items: flex-end; cursor: pointer; transition: transform 0.3s ease; }
        .overview__financial-report:hover { transform: translateY(-4px); }
        .overview__financial-report-text { display: flex; flex-direction: column; gap: 6px; }
        .overview__financial-report-label { font-size: 14px; font-weight: 500; color: #787878; }
        .overview__financial-report-title { font-size: 16px; font-weight: 600; color: #000; line-height: 1.4; }
        .overview__financial-report-icon { width: 40px; height: 40px; border-radius: 50%; background: #000; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 14px; }
        @media (max-width: 1024px) {
          .overview__financial-wrapper { height: auto; padding: 48px 24px; }
          .overview__financial-grid { grid-template-columns: 1fr; }
          .overview__financial-headline { font-size: 42px; }
        }
      `}</style>
    </section>
  );
}
