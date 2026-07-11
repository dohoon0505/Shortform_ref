import { useEffect, useRef } from 'react';

const SEQUENCES = [
  {
    bg: 'https://www.ktng.com/images/about/business/sequence-1-desktop.webp',
    title: '해외궐련',
    sub: '글로벌 시장에서의 수익성 향상과 성장성 강화',
    desc: 'KT&G는 글로벌 중심의 수익경영을 추진하기 위해 해외궐련 사업을 공격적으로 확장해 나가고 있습니다. 기존 주력시장인 중동 및 CIS 지역의 판매를 기반으로 아시아태평양, 아프리카, 중남미 등으로 수출지역을 다변화하고 있으며, 해외법인을 통해 직접 사업을 운영하며 시장 경쟁력을 강화하고 있습니다.',
    cards: [
      { label: '해외 법인 및\n지사 수',         target: 17,   decimal: 0, unit: '개' },
      { label: '해외궐련 사업\n운영 국가 수',     target: 140,  decimal: 0, unit: '개국' },
      { label: '해외궐련\n판매수량',             target: 652,  decimal: 0, unit: '억 개비' },
    ],
  },
  {
    bg: 'https://www.ktng.com/images/about/business/sequence-2-desktop.webp',
    title: 'NGP (Next Generation Product)',
    sub: '플랫폼 확대와 운영전략 정교화로 경쟁력 강화',
    desc: 'KT&G는 NGP 사업을 미래 핵심사업으로 육성하기 위해 제품 경쟁력 강화에 집중하고 있습니다. 2017년 ‘릴 솔리드’ 1세대를 시작으로, 이듬해 ‘릴 하이브리드’를 출시하였고, 2022년에는 첨단기능이 추가된 ‘릴 에이블’을 선보이며 소비자 선택의 폭을 넓혔습니다.',
    cards: [
      { label: '스틱 판매수량',     target: 14.78, decimal: 2, unit: '억 본' },
      { label: 'NGP 특허출원\n실적', target: 11,    decimal: 0, unit: '건' },
      { label: '국내 시장 점유율',   target: 40,    decimal: 0, unit: '%' },
    ],
  },
  {
    bg: 'https://www.ktng.com/images/about/business/sequence-3-desktop.webp',
    title: '건강기능식품',
    sub: '현지화 전략으로 이루는 글로벌 확장과 성장',
    desc: '건강기능식품 사업은 KT&G 3대 핵심사업 중 유일하게 담배사업이 아닌 부문으로, 사업 포트폴리오 다변화에 중추적 역할을 담당합니다. KGC인삼공사는 ‘정관장’ 브랜드를 중심으로 국내외 시장에서 경쟁력을 제고하고 있습니다.',
    cards: [
      { label: '현재 해외법인', target: 11,  decimal: 0, unit: '개' },
      { label: '수출국가',     target: 40,  decimal: 0, unit: '여개 국' },
      { label: '상표권',       target: 320, decimal: 0, unit: '건' },
    ],
  },
];

const fmt = (v, d) => d > 0
  ? v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
  : Math.round(v).toLocaleString('en-US');

function Sequence({ seq, index }) {
  const cardNumRefs = useRef([]);
  useEffect(() => {
    const animate = (el, target, decimal) => {
      const start = performance.now();
      const dur = 1800;
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
          animate(e.target, seq.cards[i].target, seq.cards[i].decimal);
        }
      });
    }, { threshold: 0.4 });
    cardNumRefs.current.forEach(n => n && obs.observe(n));
    return () => obs.disconnect();
  }, [seq]);

  return (
    <section className="sticky-sequence" data-idx={index}>
      <div className="sticky-sequence__image-wrapper">
        <div className="sticky-sequence__image" style={{ backgroundImage: `url('${seq.bg}')` }} />
      </div>
      <div className="container container--l sticky-sequence__content">
        <div className="container__row sticky-sequence__text-row">
          <div className="sticky-sequence__text-content">
            <h2 className="headline headline--5 sticky-sequence__main-title">{seq.title}</h2>
            <div className="title title--3 sticky-sequence__subtitle">{seq.sub}</div>
            <p className="body body--1 sticky-sequence__description">{seq.desc}</p>
          </div>
          <div className="sticky-sequence__cards">
            {seq.cards.map((c, i) => (
              <div key={i} className="sticky-sequence__card">
                <div className="sticky-sequence__card-content">
                  <div className="title title--2 sticky-sequence__card-title" style={{whiteSpace:'pre-line'}}>{c.label}</div>
                  <div className="sticky-sequence__card-stats">
                    <span ref={el => cardNumRefs.current[i] = el} className="headline headline--2 sticky-sequence__card-number" data-idx={i}>0</span>
                    <span className="title title--2 sticky-sequence__card-unit">{c.unit}</span>
                  </div>
                  <div className="body body--3 sticky-sequence__card-note">*25년 기준</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        .sticky-sequence { position: relative; height: 2095px; color: #fff; font-family: 'Pretendard', system-ui, sans-serif; }
        .sticky-sequence__image-wrapper { position: sticky; top: 0; height: 911px; width: 100%; z-index: 0; overflow: hidden; }
        .sticky-sequence__image { width: 100%; height: 100%; background-size: cover; background-position: center; background-repeat: no-repeat; }
        .sticky-sequence__content { position: relative; margin-top: -911px; height: 2095px; padding: 0 89px; z-index: 1; }
        .sticky-sequence__text-row { display: grid; grid-template-columns: 1fr 400px; gap: 64px; align-items: start; min-height: 1935px; padding-top: 160px; }
        .sticky-sequence__text-content { position: sticky; top: 160px; align-self: start; max-width: 560px; }
        .sticky-sequence__main-title { font-size: 64px; font-weight: 600; margin: 0 0 24px; letter-spacing: -0.025em; line-height: 1.15; }
        .sticky-sequence__subtitle { font-size: 24px; font-weight: 600; margin-bottom: 24px; }
        .sticky-sequence__description { font-size: 16px; line-height: 1.7; opacity: 0.85; }
        .sticky-sequence__cards { display: flex; flex-direction: column; gap: 80px; padding-top: 40px; padding-bottom: 80px; }
        .sticky-sequence__card { background: rgba(255,255,255,0.1); border-radius: 8px; padding: 48px 40px; backdrop-filter: blur(50px); -webkit-backdrop-filter: blur(50px); width: 385px; }
        .sticky-sequence__card-title { font-size: 24px; font-weight: 600; color: #fff; line-height: 1.3; margin-bottom: 64px; }
        .sticky-sequence__card-stats { display: flex; align-items: baseline; gap: 8px; margin-bottom: 18px; }
        .sticky-sequence__card-number { font-size: 96px; font-weight: 600; line-height: 1; letter-spacing: -0.025em; color: #fff; font-feature-settings: 'tnum'; }
        .sticky-sequence__card-unit { font-size: 32px; font-weight: 400; color: rgba(255,255,255,0.85); }
        .sticky-sequence__card-note { font-size: 14px; color: rgba(255,255,255,0.65); }
        @media (max-width: 1024px) {
          .sticky-sequence__text-row { grid-template-columns: 1fr; }
          .sticky-sequence__main-title { font-size: 42px; }
          .sticky-sequence__card { width: 100%; padding: 28px 22px; }
          .sticky-sequence__card-number { font-size: 64px; }
        }
      `}</style>
    </section>
  );
}

export default function BusinessSticky() {
  return (
    <>
      {SEQUENCES.map((seq, i) => <Sequence key={i} seq={seq} index={i} />)}
    </>
  );
}
