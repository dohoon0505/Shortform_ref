import { useEffect, useState, useRef } from 'react';

const ERAS = [
  { label: '혁신', range: 'NOW - 2021' },
  { label: '확장', range: '2020 - 2012' },
  { label: '도약', range: '2011 - 2002' },
  { label: '성장', range: '2001 - 1987' },
  { label: '시작', range: '1986 - 1883' },
];

const YEAR_2025 = {
  year: 2025,
  months: [
    { m: '12월', events: [
      "모건스탠리 캐피털 인터내셔널(MSCI) ESG 지수 평가에서 동종 산업군 최초로 'AAA' 등급 획득",
      "S&P, Moody's 국제신용등급평가에서 각각 'A-(안정적)', 'A3(안정적)' 등급 유지",
      '지속가능경영유공 정부포상 대통령 표창 수상',
    ]},
    { m: '11월', events: ['대한민국 나눔국민대상 보건복지부 장관상 수상'] },
    { m: '9월',  events: ['KT&G-Altria Another Snus Factory(ASF) 공동 인수 및 전략적 협력 기반 구축 위한 MOU 체결', 'KT&G-Altria Global Collaboration 체결'] },
  ],
};

const YEAR_2024 = {
  year: 2024,
  months: [
    { m: '12월', events: ['다우존스 지속가능경영지수(DJSI) 평가에서 최상위 등급인 \'월드 지수\' 편입'] },
    { m: '11월', events: ['한국에너지공단 우수상 수상'] },
  ],
};

export default function HistoryPage() {
  const [activeEra, setActiveEra] = useState(0);

  return (
    <>
      <section className="sub-kv">
        <div className="sub-kv__text">
          <div className="sub-kv__label">연혁</div>
          <h1 className="sub-kv__h">
            <span>시간이 지나도 변하지 않는 도전의 가치,</span>
            <span>140년의 역사 위에 미래를 쌓아갑니다</span>
          </h1>
        </div>
      </section>

      <nav className="year-navigation">
        <div className="year-navigation__inner">
          {ERAS.map((era, i) => (
            <button
              key={i}
              className={'year-navigation__item' + (i === activeEra ? ' year-navigation__item--active' : '')}
              onClick={() => setActiveEra(i)}
            >
              {era.label} · {era.range}
            </button>
          ))}
        </div>
      </nav>

      <div className="history__body">
        <div className="history__era-head">
          <div className="history__era-label">{ERAS[activeEra].range}</div>
          <div>
            <h2 className="history__era-h">{ERAS[activeEra].label}</h2>
            <p className="history__era-desc">
              {activeEra === 0 && '글로벌 선도 기업으로서 지속 가능 가치를 창출하고 첨단기술을 적용한 혁신 제품을 선보이며 미래 혁신을 이어가고 있습니다.'}
              {activeEra === 1 && 'NGP 신규 사업 진출 및 글로벌 시장 확장을 통해 글로벌 코퍼레이트로 도약하였습니다.'}
              {activeEra === 2 && 'KGC인삼공사 인수와 정관장 브랜드 성장으로 신성장 동력을 확보하였습니다.'}
              {activeEra === 3 && '1987년 4월 1일 (주)한국전매공사로 설립되어 대한민국 대표 기업으로 성장하였습니다.'}
              {activeEra === 4 && '1883년 대한제국 시기 전매청으로 출발한 140년 역사의 시작점입니다.'}
            </p>
          </div>
        </div>

        {activeEra === 0 && [YEAR_2025, YEAR_2024].map((y, yi) => (
          <div key={yi} className="history__year">
            <div className="history__year-num">{y.year}</div>
            <div className="history__year-events">
              {y.months.map((mb, mi) => (
                <div key={mi} className="history__month-block">
                  <div className="history__month">{mb.m}</div>
                  <ul className="history__event-list">
                    {mb.events.map((ev, ei) => (
                      <li key={ei} className="history__event">{ev}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .sub-kv { position: relative; height: 911px; background: url('https://www.ktng.com/images/about/history/kv-desktop.webp') center/cover no-repeat, radial-gradient(ellipse at 30% 50%,#a0a8b8 0%,#7080a0 30%,#406090 60%,#1a3050 100%); overflow: hidden; display: flex; align-items: flex-end; padding: 0 89px 120px; color: #fff; font-family: 'Pretendard',system-ui,sans-serif; }
        .sub-kv::before { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, transparent 40%, rgba(0,0,0,0.2) 100%); }
        .sub-kv__text { position: relative; z-index: 1; }
        .sub-kv__label { font-size: 18px; font-weight: 500; margin-bottom: 32px; }
        .sub-kv__h { font-size: 64px; font-weight: 600; line-height: 1.2; letter-spacing: -0.025em; margin: 0; }
        .sub-kv__h span { display: block; }
        .year-navigation { position: sticky; top: 0; background: #fff; border-bottom: 1px solid rgba(0,0,0,0.08); z-index: 10; padding: 24px 89px; }
        .year-navigation__inner { display: flex; gap: 60px; max-width: 1500px; margin: 0 auto; justify-content: center; }
        .year-navigation__item { background: transparent; border: none; cursor: pointer; position: relative; font-size: 18px; font-weight: 400; color: #787878; padding: 8px 4px; font-family: inherit; transition: color 0.3s ease; }
        .year-navigation__item--active { color: #000; font-weight: 600; }
        .year-navigation__item--active::after { content: ''; position: absolute; left: 0; right: 0; bottom: -25px; height: 2px; background: #000; }
        .year-navigation__item:hover { color: #000; }
        .history__body { padding: 120px 89px; max-width: 1500px; margin: 0 auto; }
        .history__era-head { display: grid; grid-template-columns: 420px 1fr; gap: 0; margin-bottom: 80px; padding-bottom: 48px; border-bottom: 1px solid #000; }
        .history__era-label { font-size: 32px; font-weight: 500; color: #787878; }
        .history__era-h { font-size: 72px; font-weight: 600; color: #000; letter-spacing: -0.025em; margin: 0 0 24px; }
        .history__era-desc { font-size: 24px; font-weight: 400; color: #000; line-height: 1.6; max-width: 680px; }
        .history__year { display: grid; grid-template-columns: 420px 1fr; gap: 32px; padding: 48px 0; border-bottom: 1px solid rgba(0,0,0,0.15); }
        .history__year-num { font-size: 104px; font-weight: 600; color: #000; line-height: 1; letter-spacing: -0.025em; }
        .history__year-events { display: flex; flex-direction: column; gap: 32px; }
        .history__month-block { display: grid; grid-template-columns: 120px 1fr; gap: 24px; }
        .history__month { font-size: 24px; font-weight: 600; color: #000; }
        .history__event-list { display: flex; flex-direction: column; gap: 10px; list-style: none; padding: 0; margin: 0; }
        .history__event { font-size: 20px; font-weight: 400; color: #000; line-height: 1.6; padding-left: 14px; position: relative; }
        .history__event::before { content: '-'; position: absolute; left: 0; }
        @media (max-width: 1024px) { .sub-kv__h { font-size: 36px; } .history__era-head, .history__year { grid-template-columns: 1fr; } .history__era-h { font-size: 42px; } .history__year-num { font-size: 64px; } }
      `}</style>
    </>
  );
}
