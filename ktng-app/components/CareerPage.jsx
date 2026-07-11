const PEOPLE = [
  { name: '성과', label: '성과를 내기 위해 노력하는 인재', desc: 'KT&G의 인재는 올바른 문제의식을 통해 가장 효과적인 방법을 찾아내고 이를 신속하게 실행하여 목적한 바를 달성하고자 노력하는 사람입니다.' },
  { name: 'Optimize', label: '최적화하는 인재', desc: '주어진 자원과 환경 속에서 최선의 결과를 만들어내기 위해 끊임없이 개선하는 인재입니다.', highlight: true },
  { name: '협력', label: '상호 협력하는 인재', desc: 'KT&G의 인재는 지금 나의 모습이 항상 주변의 도움이 있었기에 가능하다는 감사의 마음으로 모든 구성원들과 소통하고 협력하는 사람입니다.' },
];

export default function CareerPage() {
  return (
    <>
      <section className="career-kv">
        <div className="career-kv__text">
          <div className="career-kv__label">인사제도</div>
          <h1 className="career-kv__h">
            <span>함께 성장하며, 미래를 향해</span>
            <span>인재를 만드는 KT&G입니다</span>
          </h1>
        </div>
      </section>

      <section className="career__people">
        <h2 className="career__people-h">PEOPLE</h2>
        <div className="career__people-list">
          {PEOPLE.map((p, i) => (
            <div key={i} className="career__people-item">
              {p.highlight ? (
                <div className="career__people-name career__people-name--optimize">{p.name}</div>
              ) : (
                <>
                  <div className="career__people-label">{p.label}</div>
                  <p className="career__people-desc">{p.desc}</p>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="career__people-icon" aria-label="4-blade icon" />
      </section>

      <style jsx>{`
        .career-kv { position: relative; height: 911px; background: url('https://www.ktng.com/images/career/hrsystem/kv-desktop.webp') center/cover no-repeat, linear-gradient(180deg,#E5E5E5 0%,#C5C5C5 50%,#A5A5A5 100%); overflow: hidden; color: #fff; display: flex; align-items: flex-end; padding: 0 89px 120px; }
        .career-kv::before { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 30%, rgba(0,0,0,0.15) 100%); }
        .career-kv__text { position: relative; z-index: 2; }
        .career-kv__label { font-size: 16px; font-weight: 500; color: rgba(0,0,0,0.6); margin-bottom: 32px; }
        .career-kv__h { font-size: 64px; font-weight: 600; line-height: 1.15; letter-spacing: -0.025em; color: rgba(0,0,0,0.7); margin: 0; }
        .career-kv__h span { display: block; }
        .career__people { position: relative; padding: 120px 89px; background: #fff; max-width: 1500px; margin: 0 auto; display: grid; grid-template-columns: 300px 1fr 100px; gap: 48px; align-items: flex-start; }
        .career__people-h { font-size: 72px; font-weight: 600; color: #000; letter-spacing: -0.025em; margin: 0; }
        .career__people-list { display: flex; flex-direction: column; gap: 64px; }
        .career__people-item { }
        .career__people-name { font-size: 40px; font-weight: 600; letter-spacing: -0.025em; line-height: 1.2; }
        .career__people-name--optimize { background: linear-gradient(90deg,#4a4dff 0%,#a040ff 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; color: #4a4dff; }
        .career__people-label { font-size: 20px; font-weight: 600; color: #000; margin-bottom: 14px; letter-spacing: -0.01em; }
        .career__people-desc { font-size: 16px; color: #787878; line-height: 1.7; max-width: 560px; margin: 0; }
        .career__people-icon { width: 80px; height: 80px; background: linear-gradient(135deg,#6080FF,#A050FF); border-radius: 14px; clip-path: polygon(50% 0%,100% 38%,82% 100%,18% 100%,0% 38%); justify-self: end; align-self: center; }
        @media (max-width: 1024px) { .career-kv__h { font-size: 36px; } .career__people { grid-template-columns: 1fr; } .career__people-h { font-size: 42px; } }
      `}</style>
    </>
  );
}
