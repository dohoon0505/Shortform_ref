import { useEffect, useRef } from 'react';

const CARDS = [
  { target: 17,    decimal: 0, unit: 'locations',           label: '해외 법인 및\n지사 수' },
  { target: 140,   decimal: 0, unit: 'countries',           label: '해외궐련 사업\n운영 국가 수' },
  { target: 65.2,  decimal: 1, unit: 'billion\nsticks',     label: '해외궐련\n판매수량' },
  { target: 1.478, decimal: 3, unit: 'billion\nsticks',     label: '스틱 판매수량' },
  { target: 34,    decimal: 0, unit: 'countries',           label: 'NGP 사업진출\n국가 수' },
];

const fmt = (v, d) => d > 0
  ? v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
  : Math.round(v).toLocaleString('en-US');

export default function Global() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const skyOverlayRef = useRef(null);
  const earthRef = useRef(null);
  const overlayRef = useRef(null);
  const wrapRef = useRef(null);
  const cardsRef = useRef(null);
  const numRefs = useRef([]);

  useEffect(() => {
    const update = () => {
      const sec = sectionRef.current;
      if (!sec) return;
      const rect = sec.getBoundingClientRect();
      const sectionH = sec.offsetHeight;
      const vH = window.innerHeight;
      const scrolled = Math.max(0, -rect.top);
      const maxScroll = sectionH - vH;
      if (maxScroll <= 0) return;
      const p1 = Math.max(0, Math.min(1, (scrolled - 100) / 400));
      const p2 = Math.max(0, Math.min(1, (scrolled - 100) / 700));
      const p3 = Math.max(0, Math.min(1, (scrolled - 900) / (maxScroll - 900)));
      if (skyOverlayRef.current) skyOverlayRef.current.style.opacity = 1 - p1;
      if (headingRef.current) {
        headingRef.current.style.opacity = 1 - p1;
        headingRef.current.style.color = p1 > 0.3 ? '#fff' : '#000';
      }
      if (earthRef.current) earthRef.current.style.transform = `translate(-50%,-50%) scale(${0.05 + 0.95 * p2})`;
      if (overlayRef.current) overlayRef.current.style.opacity = p2 > 0.5 ? Math.min(1, (p2 - 0.5) * 3) : 0;
      if (wrapRef.current) wrapRef.current.style.opacity = p3 > 0 ? 1 : 0;
      if (cardsRef.current) {
        const maxX = Math.max(0, cardsRef.current.scrollWidth - window.innerWidth + 178);
        cardsRef.current.style.transform = `translateX(${window.innerWidth * 0.55 - p3 * maxX}px)`;
      }
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();

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
          animate(e.target, CARDS[i].target, CARDS[i].decimal);
        }
      });
    }, { threshold: 0.4 });
    numRefs.current.forEach(n => n && obs.observe(n));

    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); obs.disconnect(); };
  }, []);

  return (
    <section ref={sectionRef} className="global">
      <div className="global__stars" />
      <div ref={skyOverlayRef} className="global__sky-overlay" />
      <div className="global__content">
        <div className="global__heading-wrapper">
          <div ref={headingRef} className="global__heading">
            <div className="global__label">Global Business Highlights</div>
            <h2 className="global__title">우리는 글로벌 리더 KT&G입니다</h2>
          </div>
        </div>
        <div ref={earthRef} className="global__earth" />
        <div ref={overlayRef} className="global__overlay">
          <div className="global__overlay-label">Global Business Highlights</div>
          <button className="global__cta">네트워크 바로가기 <span className="global__cta-icon">→</span></button>
        </div>
        <div ref={wrapRef} className="global__cards-wrap">
          <div ref={cardsRef} className="global__cards">
            {CARDS.map((c, i) => (
              <div key={i} className="global__card">
                <div className="global__num-row">
                  <span ref={el => numRefs.current[i] = el} className="global__num" data-idx={i}>0</span>
                  <span className="global__unit" style={{whiteSpace:'pre-line'}}>{c.unit}</span>
                </div>
                <div className="global__card-label" style={{whiteSpace:'pre-line'}}>{c.label}</div>
                <div className="global__card-note">*25년 기준</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        .global { position: relative; height: 4275px; background: #000; }
        .global__stars { position: absolute; inset: 0; background: #000 url('https://www.ktng.com/webgl/2k_stars_milky_way.webp') center/cover no-repeat; z-index: 0; }
        .global__sky-overlay { position: absolute; inset: 0; background: #fff; z-index: 1; will-change: opacity; pointer-events: none; }
        .global__content { position: sticky; top: 0; height: 855px; overflow: hidden; z-index: 2; }
        .global__heading-wrapper { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 5; padding: 0 89px; pointer-events: none; }
        .global__heading { text-align: center; will-change: opacity, color; transition: color 0.5s ease; pointer-events: auto; }
        .global__label { font-size: 18px; font-weight: 500; margin-bottom: 24px; letter-spacing: 0.02em; }
        .global__title { font-size: 72px; font-weight: 600; letter-spacing: -0.025em; line-height: 1.15; margin: 0; }
        .global__earth { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.05); width: 720px; height: 720px; border-radius: 50%; background: url('https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/720px-The_Earth_seen_from_Apollo_17.jpg') center/cover no-repeat, radial-gradient(circle at 35% 35%, #2868c8 0%, #0a2a60 75%, #000020 100%); box-shadow: inset -40px -40px 120px rgba(0,0,0,0.6), 0 0 100px rgba(80,140,220,0.3); overflow: hidden; z-index: 3; will-change: transform; }
        .global__earth::before { content: ''; position: absolute; inset: 0; border-radius: 50%; background: radial-gradient(ellipse 30% 20% at 25% 30%, rgba(255,255,255,0.18), transparent 60%); animation: earth-spin 120s linear infinite; }
        @keyframes earth-spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
        .global__overlay { position: absolute; top: 18%; left: 50%; transform: translateX(-50%); text-align: center; color: #fff; z-index: 4; text-shadow: 0 2px 14px rgba(0,0,0,0.6); opacity: 0; }
        .global__overlay-label { font-size: 24px; font-weight: 600; margin-bottom: 18px; }
        .global__cta { display: inline-flex; align-items: center; gap: 14px; font-size: 16px; color: #fff; background: transparent; border: none; cursor: pointer; }
        .global__cta-icon { width: 40px; height: 40px; border-radius: 50%; background: #fff; color: #000; display: flex; align-items: center; justify-content: center; transition: var(--tx-all); }
        .global__cta:hover .global__cta-icon { transform: translateX(4px) rotate(-12deg); }
        .global__cards-wrap { position: absolute; top: 50%; left: 0; right: 0; transform: translateY(-50%); z-index: 4; opacity: 0; pointer-events: none; }
        .global__cards { display: flex; gap: 24px; padding: 0 89px; will-change: transform; pointer-events: auto; }
        .global__card { flex: 0 0 360px; height: 420px; background: linear-gradient(135deg, rgba(155,170,245,0.92) 0%, rgba(110,130,220,0.92) 50%, rgba(80,100,200,0.92) 100%); border: 1px solid rgba(255,255,255,0.2); border-radius: 18px; padding: 48px 36px; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); display: flex; flex-direction: column; justify-content: space-between; color: #fff; box-shadow: 0 16px 48px rgba(20,40,100,0.4); }
        .global__num-row { display: flex; align-items: baseline; gap: 10px; }
        .global__num { font-size: 96px; font-weight: 600; line-height: 1; letter-spacing: -0.025em; font-feature-settings: 'tnum'; color: #fff; }
        .global__unit { font-size: 18px; font-weight: 400; color: rgba(255,255,255,0.85); line-height: 1.3; }
        .global__card-label { font-size: 22px; font-weight: 600; color: #fff; line-height: 1.4; }
        .global__card-note { font-size: 14px; color: rgba(255,255,255,0.7); }
        @media (max-width: 1024px) { .global__title { font-size: 48px; } .global__earth { width: 480px; height: 480px; } .global__card { flex: 0 0 280px; height: 340px; padding: 32px 24px; } .global__num { font-size: 64px; } }
      `}</style>
    </section>
  );
}
