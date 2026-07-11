import { useState } from 'react';

const CARDS = [
  { kind: 'poster', title: "KT&G 상상마당, '제18회 대단한 단편영화제' 출품작 공모", date: '2026. 05. 06' },
  { kind: 'logo',   title: "KT&G, '다우존스 지속가능경영 월드 지수(DJBIC World)' 2년 연속 편입",   date: '2026. 05. 04' },
  { kind: 'photo',  title: 'KT&G-대구지방환경청-영양군청-국립생태원, 습지 보전 위한 MOU 체결', date: '2026. 04. 29' },
  { kind: 'logo',   title: "KT&G장학재단, '문화예술 장학사업' 발레 부문 장학증서 전달",     date: '2026. 04. 28' },
  { kind: 'photo',  title: 'KT&G-중진공, 지역경제 활성화·청년창업 육성 위한 업무협약 체결', date: '2026. 04. 27' },
  { kind: 'poster', title: '2026 KT&G 대치하우스 단편 디자인 디자이너 공모',                    date: '2026. 04. 20' },
];

const TABS = [
  { label: '전체', count: 1016 },
  { label: '보도자료', count: 939 },
  { label: '카드뉴스', count: 77 },
];

export default function MediaPage() {
  const [active, setActive] = useState(0);
  return (
    <>
      <section className="media__head">
        <h1 className="media__title">뉴스룸</h1>
      </section>
      <section className="media__filter">
        <div className="media__tabs">
          {TABS.map((t, i) => (
            <button key={i} className={'media__tab' + (i === active ? ' media__tab--active' : '')} onClick={() => setActive(i)}>
              {t.label}<span className="media__tab-count">({t.count.toLocaleString()})</span>
            </button>
          ))}
        </div>
        <div className="media__search">
          <input className="media__search-input" placeholder="검색어 입력" />
          <span className="media__search-icon">🔍</span>
        </div>
      </section>
      <section className="media__body">
        <div className="media__sub-head">
          <div className="media__sub-h">보도자료</div>
          <button className="media__more">더보기 →</button>
        </div>
        <div className="media__grid">
          {CARDS.map((c, i) => (
            <div key={i} className="media__card">
              <div className={'media__card-img media__card-img--' + c.kind}>
                {c.kind === 'logo' && <span>KT&G</span>}
              </div>
              <h3 className="media__card-title">{c.title}</h3>
              <div className="media__card-date">{c.date}</div>
            </div>
          ))}
        </div>
      </section>
      <style jsx>{`
        .media__head { padding: 120px 89px 32px; max-width: 1500px; margin: 0 auto; }
        .media__title { font-size: 84px; font-weight: 600; color: #000; letter-spacing: -0.025em; margin: 0; line-height: 1.1; }
        .media__filter { padding: 24px 89px; max-width: 1500px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.1); }
        .media__tabs { display: flex; gap: 8px; }
        .media__tab { padding: 14px 24px; border: 1px solid rgba(0,0,0,0.2); border-radius: 100px; font-size: 18px; font-weight: 400; color: #000; background: #fff; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; font-family: inherit; transition: all 0.3s ease; }
        .media__tab--active { background: #000; color: #fff; border-color: #000; }
        .media__tab-count { font-size: 16px; opacity: 0.7; }
        .media__search { position: relative; width: 320px; }
        .media__search-input { width: 100%; padding: 14px 48px 14px 20px; border: 1px solid rgba(0,0,0,0.2); border-radius: 100px; font-size: 16px; background: #fff; color: #000; outline: none; font-family: inherit; }
        .media__search-icon { position: absolute; right: 18px; top: 50%; transform: translateY(-50%); color: #787878; }
        .media__body { padding: 64px 89px 120px; max-width: 1500px; margin: 0 auto; }
        .media__sub-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .media__sub-h { font-size: 24px; font-weight: 600; color: #000; }
        .media__more { padding: 10px 24px; border: 1px solid rgba(0,0,0,0.2); border-radius: 100px; font-size: 14px; color: #000; background: #fff; cursor: pointer; font-family: inherit; }
        .media__grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 32px; }
        .media__card { cursor: pointer; transition: transform 0.3s ease; }
        .media__card:hover { transform: translateY(-4px); }
        .media__card-img { width: 100%; aspect-ratio: 4/3; border-radius: 8px; background-color: #F5F5F5; margin-bottom: 18px; display: flex; align-items: center; justify-content: center; color: #000; font-size: 32px; font-weight: 600; }
        .media__card-img--poster { background: linear-gradient(160deg,#1a4ad9 0%,#1a4ad9 35%,#f5a623 100%); }
        .media__card-img--logo { background: #fff; border: 1px solid #f0f0f0; }
        .media__card-img--photo { background: linear-gradient(135deg,#3a5070 0%,#2a3050 50%,#1a2030 100%); }
        .media__card-title { font-size: 18px; font-weight: 600; color: #000; line-height: 1.4; letter-spacing: -0.01em; margin: 0 0 8px; }
        .media__card-date { font-size: 14px; color: #787878; }
        @media (max-width: 1024px) { .media__title { font-size: 42px; } .media__grid { grid-template-columns: 1fr; } .media__filter { flex-direction: column; gap: 16px; align-items: stretch; } .media__search { width: 100%; } }
      `}</style>
    </>
  );
}
