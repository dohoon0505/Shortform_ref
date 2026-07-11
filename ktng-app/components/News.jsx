import { useEffect, useRef } from 'react';

const ITEMS = [
  { title: "KT&G, '다우존스 지속가능경영 월드 지수(DJBIC World)' 2년 연속 편입", date: '2026. 05. 04' },
  { title: 'KT&G-대구지방환경청-영양군청-국립생태원, 습지 보전 위한 MOU 체결', date: '2026. 04. 29' },
  { title: "KT&G장학재단, '문화예술 장학사업' 발레 부문 장학증서 전달", date: '2026. 04. 28' },
  { title: 'KT&G-중진공, 지역경제 활성화·청년창업 육성 위한 업무협약 체결', date: '2026. 04. 27' },
];

export default function News() {
  const containerRef = useRef(null);
  useEffect(() => {
    const targets = containerRef.current?.querySelectorAll('.news__label, .news__featured, .news__item');
    if (!targets) return;
    const obs = new IntersectionObserver(es => {
      es.forEach(e => {
        if (e.isIntersecting && !e.target.classList.contains('is-visible')) {
          const idx = Array.from(targets).indexOf(e.target);
          setTimeout(() => e.target.classList.add('is-visible'), idx * 80);
        }
      });
    }, { threshold: 0.15 });
    targets.forEach(t => obs.observe(t));
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={containerRef} className="news">
      <div className="news__label">Latest News</div>
      <div className="news__grid">
        <div className="news__featured">
          <div className="news__img" />
          <div className="news__cat">보도자료</div>
          <h3 className="news__title">KT&G 상상마당, '제18회 대단한 단편영화제' 출품작 공모</h3>
          <div className="news__date">2026. 05. 06</div>
          <button className="news__cta">자세히 보기 <span className="news__cta-icon">→</span></button>
        </div>
        <div className="news__list">
          {ITEMS.map((it, i) => (
            <div key={i} className="news__item">
              <div className="news__item-cat">보도자료</div>
              <div className="news__item-title">{it.title}</div>
              <div className="news__item-date">{it.date}</div>
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        .news { position: relative; padding: 120px 89px; background: #fff; height: 1013px; overflow: hidden; }
        .news__label { font-size: 18px; font-weight: 500; color: #787878; margin-bottom: 48px; letter-spacing: 0.04em; opacity: 0; transform: translateY(20px); transition: opacity 0.8s ease-out, transform 0.8s ease-out; }
        .news__label.is-visible { opacity: 1; transform: translateY(0); }
        .news__grid { max-width: 1500px; margin: 0 auto; display: grid; grid-template-columns: 1.4fr 1fr; gap: 64px; align-items: start; }
        .news__featured { cursor: pointer; opacity: 0; transform: translateY(40px); transition: opacity 0.9s ease-out 0.15s, transform 0.9s ease-out 0.15s; }
        .news__featured.is-visible { opacity: 1; transform: translateY(0); }
        .news__img { width: 100%; aspect-ratio: 4/3; border-radius: 8px; background: linear-gradient(160deg, #1a4ad9 0%, #1a4ad9 30%, #f5a623 100%); margin-bottom: 32px; transition: transform 0.4s ease-out; }
        .news__featured:hover .news__img { transform: translateY(-4px); }
        .news__cat { font-size: 14px; font-weight: 500; color: #787878; margin-bottom: 8px; }
        .news__title { font-size: 36px; font-weight: 600; color: #000; line-height: 1.3; letter-spacing: -0.025em; margin: 0 0 16px; }
        .news__date { font-size: 14px; color: #787878; margin-bottom: 32px; }
        .news__cta { display: inline-flex; align-items: center; gap: 12px; font-size: 16px; font-weight: 500; color: #000; background: transparent; border: none; cursor: pointer; }
        .news__cta-icon { width: 44px; height: 44px; border-radius: 50%; background: #000; color: #fff; display: flex; align-items: center; justify-content: center; transition: var(--tx-all); }
        .news__featured:hover .news__cta-icon { transform: translateX(6px) rotate(-12deg); }
        .news__list { display: flex; flex-direction: column; }
        .news__item { padding: 28px 0; border-bottom: 1px solid rgba(0,0,0,0.08); cursor: pointer; transition: padding-left 0.3s ease-in-out, opacity 0.8s ease-out; opacity: 0; transform: translateY(20px); }
        .news__item.is-visible { opacity: 1; transform: translateY(0); }
        .news__item:hover { padding-left: 8px; }
        .news__item-cat { font-size: 12px; color: #787878; margin-bottom: 6px; }
        .news__item-title { font-size: 18px; font-weight: 500; color: #000; line-height: 1.5; margin-bottom: 6px; }
        .news__item-date { font-size: 12px; color: #787878; }
        @media (max-width: 1024px) { .news__grid { grid-template-columns: 1fr; gap: 48px; } .news__title { font-size: 28px; } .news { padding: 64px 24px; } }
      `}</style>
    </section>
  );
}
