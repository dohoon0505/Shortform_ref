import { useEffect, useRef } from 'react';

export default function Hero() {
  const videoRef = useRef(null);
  useEffect(() => {
    if (videoRef.current) videoRef.current.play().catch(() => {});
  }, []);
  return (
    <section className="kv">
      <video
        ref={videoRef}
        className="kv__video"
        autoPlay loop muted playsInline
        poster="https://www.ktng.com/attach/download/2d1bc226-b90e-4527-a425-5b0b4ddecbbd"
      >
        <source src="https://www.ktng.com/attach/download/2177f558-e00b-4ec2-a73c-737b303a2c88" type="video/mp4" />
      </video>
      <div className="kv__overlay" />
      <div className="kv__text">
        <div className="kv__h">
          <span>Beyond Limits,</span>
          <span className="kv__h-line2">Towards Innovation</span>
        </div>
      </div>
      <div className="kv__scroll">Scroll Down</div>
      <style jsx>{`
        .kv { position: relative; height: 855px; width: 100%; overflow: hidden; background: #000; }
        .kv :global(.kv__video) { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .kv__overlay { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.2)); z-index: 1; }
        .kv__text { position: absolute; inset: 0; padding: 0 89px; display: flex; flex-direction: column; justify-content: center; z-index: 2; color: #fff; }
        .kv__h { font-size: 104px; font-weight: 600; line-height: 1.15; letter-spacing: -0.025em; text-shadow: 0 4px 24px rgba(0,0,0,0.2); }
        .kv__h span { display: block; }
        .kv__h-line2 { margin-left: 200px; }
        .kv__scroll { position: absolute; left: 89px; bottom: 60px; color: #fff; font-size: 16px; font-weight: 400; display: flex; align-items: center; gap: 14px; z-index: 3; }
        .kv__scroll::after { content: ''; width: 1px; height: 40px; background: #fff; animation: kv-line 2s ease-in-out infinite; transform-origin: top; }
        @keyframes kv-line { 0%, 100% { transform: scaleY(0); } 50% { transform: scaleY(1); } }
        @media (max-width: 1024px) { .kv__h { font-size: 64px; } .kv__h-line2 { margin-left: 80px; } .kv__text { padding: 0 32px; } .kv__scroll { left: 32px; } }
      `}</style>
    </section>
  );
}
