import { useEffect, useRef } from 'react';

const GRASS_URL = 'https://www.ktng.com/images/main/sustainability-desktop.webp';

const STATS = [
  { eyebrow: 'MSCI, S&P Global DJSI ESG평가', cap: '*2025년 기준', value: '산업 최고등급 획득' },
  { eyebrow: '온실 배출량 감소', cap: '*2020년 Baseline 기준', value: '32.1%' },
];

export default function Sustainability() {
  const susRef = useRef(null);
  const contentRef = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible'); });
    }, { threshold: 0.05, rootMargin: '0px 0px -10% 0px' });
    const els = [
      ...(susRef.current?.querySelectorAll('[data-reveal]') || []),
      ...(contentRef.current?.querySelectorAll('[data-reveal]') || []),
    ];
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <section ref={susRef} className="sus">
        <div className="sus__bg" />
        <div className="sus__heading-wrapper" data-reveal>
          <div className="sus__subtitle-small">Sustainability for Growth</div>
        </div>
        <div className="sus__leaves" data-reveal>
          <div className="sus__leaf sus__leaf--1" />
          <div className="sus__leaf sus__leaf--2 sus__leaf--grass" />
          <div className="sus__leaf sus__leaf--3" />
          <div className="sus__leaf sus__leaf--4 sus__leaf--grass" />
        </div>
        <div className="sus__main-title" data-reveal>
          <h2 className="sus__title-h">Sustainability for Growth</h2>
        </div>
        <style jsx>{`
          .sus { position: relative; height: 855px; background: #fff; overflow: hidden; padding: 80px 89px; display: flex; flex-direction: column; justify-content: space-between; }
          .sus__bg { position: absolute; inset: 0; background: linear-gradient(180deg, #fff 0%, #f9f9f6 100%); }
          .sus__heading-wrapper { position: relative; z-index: 2; opacity: 1; transform: translateY(0); transition: opacity 0.9s ease-out, transform 0.9s ease-out; }
          .sus__heading-wrapper:not(.is-visible) { opacity: 0.5; transform: translateY(15px); }
          .sus__subtitle-small { font-size: 18px; font-weight: 500; color: #000; letter-spacing: 0.02em; }
          .sus__leaves { position: absolute; top: 50%; right: 10%; transform: translateY(-50%); width: 620px; height: 620px; pointer-events: none; z-index: 1; opacity: 1; transition: opacity 1.2s ease-out 0.2s; }
          .sus__leaves:not(.is-visible) { opacity: 0.5; }
          .sus__leaf { position: absolute; width: 150px; height: 360px; border-radius: 75px; transform-origin: bottom center; animation: sus-sway 6s ease-in-out infinite; background-size: 620px 620px; background-position: center; background-repeat: no-repeat; }
          .sus__leaf--1 { top: 0;    left: 150px; background-color: #c9e2bb; transform: rotate(15deg);  animation-delay: 0s; }
          .sus__leaf--2 { top: 30px; left: 240px; background-image: url(${GRASS_URL}); background-position: -200px -100px; transform: rotate(-10deg); animation-delay: 1.5s; }
          .sus__leaf--3 { top: 60px; left: 340px; background-color: #2c6e2c; transform: rotate(20deg);  animation-delay: 3s; }
          .sus__leaf--4 { top: 90px; left: 430px; background-image: url(${GRASS_URL}); background-position: -350px -50px; transform: rotate(-5deg);  animation-delay: 4.5s; }
          @keyframes sus-sway { 0%, 100% { transform: rotate(var(--rot, 0deg)); } 50% { transform: rotate(calc(var(--rot, 0deg) + 4deg)); } }
          .sus__leaf--1 { --rot: 15deg; }
          .sus__leaf--2 { --rot: -10deg; }
          .sus__leaf--3 { --rot: 20deg; }
          .sus__leaf--4 { --rot: -5deg; }
          .sus__main-title { position: relative; z-index: 2; opacity: 1; transform: translateY(0); transition: opacity 1.2s ease-out 0.4s, transform 1.2s ease-out 0.4s; }
          .sus__main-title:not(.is-visible) { opacity: 0.5; transform: translateY(20px); }
          .sus__title-h { font-size: 96px; font-weight: 600; color: #000; letter-spacing: -0.025em; line-height: 1.1; margin: 0; max-width: 60%; }
          @media (max-width: 1024px) {
            .sus__title-h { font-size: 48px; max-width: 100%; }
            .sus__leaves { width: 360px; height: 360px; right: 5%; opacity: 0.7; }
            .sus__leaf { width: 88px; height: 200px; border-radius: 44px; }
          }
        `}</style>
      </section>
      <section ref={contentRef} className="sus-content">
        <div className="sus-content__container">
          <div className="sus-content__headline-wrapper" data-reveal>
            <h2 className="sus-content__headline">
              <span>KT&G가 그리는 미래는</span>
              <span>지속가능성에 기반합니다</span>
            </h2>
          </div>
          <div className="sus-content__stats">
            {STATS.map((s, i) => (
              <div key={i} className="sus-content__stat" data-reveal>
                <div className="sus-content__stat-eyebrow">{s.eyebrow} <span className="sus-content__stat-cap">{s.cap}</span></div>
                <div className="sus-content__stat-value">{s.value}</div>
              </div>
            ))}
          </div>
          <div className="sus-content__cta-wrapper" data-reveal>
            <button className="sus-content__cta">지속가능경영 바로가기 <span className="sus-content__cta-icon">→</span></button>
          </div>
        </div>
        <style jsx>{`
          .sus-content { position: relative; padding: 120px 89px; background: #f5f9f4; min-height: 1112px; }
          .sus-content__container { max-width: 1500px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 64px 96px; align-items: start; }
          .sus-content__headline-wrapper { grid-column: 1 / -1; opacity: 1; transform: translateY(0); transition: opacity 0.8s ease-out, transform 0.8s ease-out; margin-bottom: 48px; }
          .sus-content__headline-wrapper:not(.is-visible) { opacity: 0.4; transform: translateY(20px); }
          .sus-content__headline { font-size: 64px; font-weight: 600; color: #000; letter-spacing: -0.025em; line-height: 1.15; margin: 0; }
          .sus-content__headline span { display: block; }
          .sus-content__stats { grid-column: 1 / -1; display: grid; grid-template-columns: 1fr 1fr; gap: 64px; border-top: 1px solid rgba(0,0,0,0.15); padding-top: 48px; }
          .sus-content__stat { opacity: 1; transform: translateY(0); transition: opacity 0.8s ease-out, transform 0.8s ease-out; }
          .sus-content__stat:not(.is-visible) { opacity: 0.4; transform: translateY(15px); }
          .sus-content__stat:nth-child(2).is-visible { transition-delay: 0.15s; }
          .sus-content__stat-eyebrow { font-size: 20px; font-weight: 500; color: #000; margin-bottom: 24px; line-height: 1.4; }
          .sus-content__stat-cap { font-size: 14px; color: #787878; font-weight: 400; }
          .sus-content__stat-value { font-size: 56px; font-weight: 600; color: #1a5a1a; letter-spacing: -0.02em; line-height: 1.1; }
          .sus-content__cta-wrapper { grid-column: 1 / -1; margin-top: 32px; opacity: 1; transition: opacity 0.8s ease-out 0.3s; }
          .sus-content__cta-wrapper:not(.is-visible) { opacity: 0.4; }
          .sus-content__cta { display: inline-flex; align-items: center; gap: 14px; font-size: 18px; font-weight: 500; color: #000; background: transparent; border: none; cursor: pointer; padding: 0; }
          .sus-content__cta-icon { width: 48px; height: 48px; border-radius: 50%; background: #000; color: #fff; display: flex; align-items: center; justify-content: center; transition: transform 0.4s cubic-bezier(0.4,0,0.2,1); }
          .sus-content__cta:hover .sus-content__cta-icon { transform: translateX(6px) rotate(-12deg); }
          @media (max-width: 1024px) {
            .sus-content__container, .sus-content__stats { grid-template-columns: 1fr; gap: 48px; }
            .sus-content__headline { font-size: 36px; }
            .sus-content__stat-value { font-size: 36px; }
          }
        `}</style>
      </section>
    </>
  );
}
