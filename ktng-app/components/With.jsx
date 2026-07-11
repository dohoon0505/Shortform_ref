import { useEffect, useRef } from 'react';

const FOOTER_COLS = [
  { h: '회사소개', items: ['KT&G 소개', '연혁', '주요사업', '글로벌 네트워크'] },
  { h: '투자정보', items: ['IR 개요', '기업가치 제고 계획', '지배구조', '재무정보', '주식정보', '공시정보', 'IR 자료실'] },
  { h: '지속가능경영', items: ['ESG 개요', '환경', '사회', '윤리경영', '아카이빙'] },
  { h: '미디어', items: ['뉴스룸', '소셜미디어', '라이브러리'] },
  { h: '인재채용', items: ['인사제도', '직무소개', '채용가이드'] },
];

const WITH_CARDS = [
  {
    title: 'Business',
    desc: 'KT&G의 주요 핵심사업을 소개합니다',
    cta: '주요사업 바로가기',
    img: 'https://www.ktng.com/images/main/with-1.webp',
  },
  {
    title: 'Career',
    desc: 'KT&G와 함께 성장할 글로벌 인재를 찾습니다',
    cta: '인재채용 바로가기',
    img: 'https://www.ktng.com/images/main/with-2.webp',
  },
];

export default function With() {
  const sectionRef = useRef(null);
  useEffect(() => {
    const els = sectionRef.current?.querySelectorAll('[data-reveal]');
    if (!els) return;
    const obs = new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible'); });
    }, { threshold: 0.2 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <section ref={sectionRef} className="with">
        <div className="with__container">
          <div className="with__heading" data-reveal>
            <div className="with__eyebrow">With KT&G</div>
            <h2 className="with__h">함께 그리는 KT&G의 미래</h2>
          </div>
          <div className="with__grid">
            {WITH_CARDS.map((c, i) => (
              <div key={i} className="with__card" data-reveal>
                <h3 className="with__card-title">{c.title}</h3>
                <p className="with__card-desc">{c.desc}</p>
                <button className="with__card-cta">{c.cta} <span className="with__card-cta-icon">→</span></button>
                <div className="with__card-img" style={{ backgroundImage: `url(${c.img})` }} />
              </div>
            ))}
          </div>
          <button className="with__top-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Scroll to top">↑</button>
        </div>
      </section>
      <footer className="footer">
        <div className="footer__grid">
          {FOOTER_COLS.map(col => (
            <div key={col.h} className="footer__col">
              <h4>{col.h}</h4>
              <ul>{col.items.map(it => <li key={it}>{it}</li>)}</ul>
            </div>
          ))}
          <div className="footer__family">
            <button className="footer__family-btn">Family Site +</button>
            <div className="footer__social">
              <a aria-label="Instagram">📷</a><a aria-label="YouTube">▶</a><a aria-label="Facebook">f</a>
            </div>
          </div>
        </div>
        <div className="footer__bottom">
          <div>사이트맵 · 고정형 영상정보처리기기 운영관리방침 · 개인정보처리방침</div>
          <div>Copyright © 2025 KT&G Corp. All Rights Reserved.</div>
        </div>
      </footer>
      <style jsx>{`
        .with { position: relative; padding: 120px 89px; background: #fff; min-height: 1083px; }
        .with__container { max-width: 1500px; margin: 0 auto; position: relative; }
        .with__heading { margin-bottom: 64px; opacity: 0; transform: translateY(30px); transition: opacity 1s ease-out, transform 1s ease-out; }
        .with__heading.is-visible { opacity: 1; transform: translateY(0); }
        .with__eyebrow { font-size: 18px; font-weight: 500; color: #000; margin-bottom: 24px; letter-spacing: 0.02em; }
        .with__h { font-size: 64px; font-weight: 600; color: #000; letter-spacing: -0.025em; line-height: 1.15; margin: 0; }
        .with__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
        .with__card { position: relative; opacity: 0; transform: translateY(40px); transition: opacity 1s ease-out, transform 1s ease-out; }
        .with__card.is-visible { opacity: 1; transform: translateY(0); }
        .with__card:nth-child(2).is-visible { transition-delay: 0.2s; }
        .with__card-title { font-size: 88px; font-weight: 600; color: #000; letter-spacing: -0.025em; line-height: 1.1; margin: 0 0 24px; }
        .with__card-desc { font-size: 20px; color: #000; line-height: 1.5; margin: 0 0 24px; }
        .with__card-cta { display: inline-flex; align-items: center; gap: 14px; font-size: 18px; font-weight: 500; color: #000; background: transparent; border: none; cursor: pointer; padding: 0; margin-bottom: 40px; }
        .with__card-cta-icon { width: 40px; height: 40px; border-radius: 50%; background: #000; color: #fff; display: flex; align-items: center; justify-content: center; transition: transform 0.4s cubic-bezier(0.4,0,0.2,1); font-size: 16px; }
        .with__card-cta:hover .with__card-cta-icon { transform: translateX(6px) rotate(-12deg); }
        .with__card-img { width: 100%; aspect-ratio: 16 / 9; background-size: cover; background-position: center; background-repeat: no-repeat; border-radius: 16px; transition: transform 0.6s cubic-bezier(0.4,0,0.2,1); }
        .with__card:hover .with__card-img { transform: scale(1.02); }
        .with__top-btn { position: absolute; right: 0; bottom: -16px; width: 56px; height: 56px; border-radius: 50%; background: #000; color: #fff; border: none; font-size: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.3s ease; }
        .with__top-btn:hover { transform: translateY(-4px); }
        .footer { background: #fff; border-top: 1px solid rgba(0,0,0,0.06); padding: 60px 89px 40px; }
        .footer__grid { max-width: 1500px; margin: 0 auto; display: grid; grid-template-columns: repeat(5, 1fr) auto; gap: 40px; }
        .footer__col h4 { font-size: 16px; font-weight: 600; color: #000; margin: 0 0 18px; }
        .footer__col ul { list-style: none; padding: 0; margin: 0; }
        .footer__col li { margin-bottom: 10px; font-size: 14px; color: #787878; cursor: pointer; transition: color 0.3s ease; }
        .footer__col li:hover { color: #000; }
        .footer__family { display: flex; flex-direction: column; align-items: flex-end; gap: 18px; }
        .footer__family-btn { padding: 12px 18px; border: 1px solid rgba(0,0,0,0.15); border-radius: 100px; font-size: 14px; color: #000; background: #fff; display: inline-flex; align-items: center; gap: 10px; cursor: pointer; }
        .footer__social { display: flex; gap: 14px; }
        .footer__social a { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: #000; text-decoration: none; font-size: 14px; }
        .footer__bottom { max-width: 1500px; margin: 40px auto 0; padding-top: 24px; border-top: 1px solid rgba(0,0,0,0.04); display: flex; justify-content: space-between; font-size: 12px; color: #787878; flex-wrap: wrap; gap: 14px; }
        @media (max-width: 1024px) {
          .with__h { font-size: 36px; }
          .with__grid { grid-template-columns: 1fr; gap: 48px; }
          .with__card-title { font-size: 48px; }
          .footer__grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </>
  );
}
