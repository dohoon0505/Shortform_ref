/**
 * Web Reference Lab — Wavy Swap 공유 엔진 (v2 smooth)
 *
 * Fullscreen Wavy Swap / Card Wavy Swap 두 카테고리가 공유.
 * 핵심 개선(v1 → v2):
 *   - 물결 단면: polygon(꺾인 직선 샘플) → clip-path: path()의 2차 베지어 곡선 (매끄러운 단면)
 *   - 스크롤: scroll 이벤트 직결 → requestAnimationFrame lerp 보간 (부드러운 추종)
 *   - 진폭: 고정 px → 컨테이너 치수 비율 (fullscreen·card 양쪽에서 동일 비례)
 *
 * 모든 reveal은 여전히 스크롤 진행률에 매핑된다(자동 재생 없음).
 * lerp는 "스크롤로 정해진 목표 진행률"로만 수렴하며, 스크롤을 멈추면 그 자리에서 멈춘다.
 */

/* ----------------------------------------------------------------
   코어: 점 배열 → 매끄러운 베지어 path 문자열
   ---------------------------------------------------------------- */

export const CORE_SRC = [
  'function __r(n){ return Math.round(n*10)/10; }',
  'var ZERO = \'path("M0 0Z")\';',
  'function FULL(w,h){ return \'path("M0 0H\'+__r(w)+\'V\'+__r(h)+\'H0Z")\'; }',
  '// 점들을 지나는 매끄러운 2차 베지어 곡선 (열린 경로, 선행 M 없음)',
  'function cbody(pts){',
  '  var d="", i;',
  '  for(i=1;i<pts.length-1;i++){',
  '    var xc=(pts[i][0]+pts[i+1][0])/2, yc=(pts[i][1]+pts[i+1][1])/2;',
  '    d += " Q"+__r(pts[i][0])+" "+__r(pts[i][1])+" "+__r(xc)+" "+__r(yc);',
  '  }',
  '  d += " Q"+__r(pts[i][0])+" "+__r(pts[i][1])+" "+__r(pts[i][0])+" "+__r(pts[i][1]);',
  '  return d;',
  '}',
  'function smooth(pts){ return "M"+__r(pts[0][0])+" "+__r(pts[0][1]) + cbody(pts); }',
  '// 닫힌 매끄러운 곡선 (블롭/파장)',
  'function smoothClosed(pts){',
  '  var n=pts.length, i, sx=(pts[n-1][0]+pts[0][0])/2, sy=(pts[n-1][1]+pts[0][1])/2;',
  '  var d="M"+__r(sx)+" "+__r(sy);',
  '  for(i=0;i<n;i++){ var q=pts[(i+1)%n], xc=(pts[i][0]+q[0])/2, yc=(pts[i][1]+q[1])/2;',
  '    d += " Q"+__r(pts[i][0])+" "+__r(pts[i][1])+" "+__r(xc)+" "+__r(yc); }',
  '  return d+"Z";',
  '}'
].join('\n');

/* ----------------------------------------------------------------
   물결 함수 8종 (coverage c=0~1 → clip-path: path 문자열)
   ---------------------------------------------------------------- */

export const WAVE_SRC = {
  // 아래 → 위 상승 물결
  waveUp: [
    'function waveUp(c,w,h,A,wv){',
    '  if(c<=0) return ZERO; if(c>=1) return FULL(w,h);',
    '  var base=(1-c)*(h+2*A)-A, s=Math.max(14,Math.ceil(wv*10)), p=[], i;',
    '  for(i=0;i<=s;i++){ var x=w*i/s, ph=i/s*wv*Math.PI*2; p.push([x, base+A*Math.sin(ph)]); }',
    '  return \'path("\'+smooth(p)+\' L\'+__r(w)+\' \'+__r(h)+\' L0 \'+__r(h)+\'Z")\';',
    '}'
  ].join('\n'),
  // 위 → 아래 하강 물결
  waveDown: [
    'function waveDown(c,w,h,A,wv){',
    '  if(c<=0) return ZERO; if(c>=1) return FULL(w,h);',
    '  var edge=c*(h+2*A)-A, s=Math.max(14,Math.ceil(wv*10)), p=[], i;',
    '  for(i=s;i>=0;i--){ var x=w*i/s, ph=i/s*wv*Math.PI*2; p.push([x, edge+A*Math.sin(ph)]); }',
    '  return \'path("M0 0 L\'+__r(w)+\' 0 L\'+__r(p[0][0])+\' \'+__r(p[0][1])+cbody(p)+\' Z")\';',
    '}'
  ].join('\n'),
  // 좌 → 우 세로 물결 엣지
  waveSide: [
    'function waveSide(c,w,h,A,wv){',
    '  if(c<=0) return ZERO; if(c>=1) return FULL(w,h);',
    '  var ex=c*(w+2*A)-A, s=Math.max(14,Math.ceil(wv*10)), p=[], i;',
    '  for(i=0;i<=s;i++){ var y=h*i/s, ph=i/s*wv*Math.PI*2; p.push([ex+A*Math.sin(ph), y]); }',
    '  return \'path("\'+smooth(p)+\' L0 \'+__r(h)+\' L0 0Z")\';',
    '}'
  ].join('\n'),
  // 좌하단 → 우상단 사선 물결
  waveDiag: [
    'function waveDiag(c,w,h,A,wv){',
    '  if(c<=0) return ZERO; if(c>=1) return FULL(w,h);',
    '  var s=Math.max(16,Math.ceil(wv*10)), p=[], i;',
    '  for(i=0;i<=s;i++){ var y=h*i/s, ph=i/s*wv*Math.PI*2; p.push([w*(2*c - y/h)+A*Math.sin(ph), y]); }',
    '  return \'path("\'+smooth(p)+\' L0 \'+__r(h)+\' L0 0Z")\';',
    '}'
  ].join('\n'),
  // 중앙 확장 물결 블롭 (블롭/파장 공용)
  waveBlob: [
    'function waveBlob(c,w,h,lobes,af){',
    '  if(c<=0) return ZERO; if(c>=1) return FULL(w,h);',
    '  var cx=w/2, cy=h/2, maxR=Math.hypot(w,h)/2*1.18, R=c*maxR, s=Math.max(28,lobes*6), p=[], i;',
    '  for(i=0;i<s;i++){ var a=i/s*Math.PI*2, r=R*(1+af*Math.sin(a*lobes)); p.push([cx+r*Math.cos(a), cy+r*Math.sin(a)]); }',
    '  return \'path("\'+smoothClosed(p)+\'")\';',
    '}'
  ].join('\n'),
  // 중앙에서 세로로 벌어지는 밴드 (위·아래 물결 2줄)
  waveBand: [
    'function waveBand(c,w,h,A,wv){',
    '  if(c<=0) return ZERO; if(c>=1) return FULL(w,h);',
    '  var cy=h/2, half=c*(h/2+A), s=Math.max(14,Math.ceil(wv*10)), top=[], bot=[], i;',
    '  for(i=0;i<=s;i++){ var x=w*i/s, ph=i/s*wv*Math.PI*2; top.push([x, cy-half+A*Math.sin(ph)]); }',
    '  for(i=s;i>=0;i--){ var x=w*i/s, ph=i/s*wv*Math.PI*2; bot.push([x, cy+half+A*Math.sin(ph)]); }',
    '  return \'path("\'+smooth(top)+\' L\'+__r(bot[0][0])+\' \'+__r(bot[0][1])+cbody(bot)+\' Z")\';',
    '}'
  ].join('\n'),
  // 중앙에서 가로로 벌어지는 커튼 (좌·우 물결 2줄)
  waveCurtain: [
    'function waveCurtain(c,w,h,A,wv){',
    '  if(c<=0) return ZERO; if(c>=1) return FULL(w,h);',
    '  var cx=w/2, half=c*(w/2+A), s=Math.max(14,Math.ceil(wv*10)), left=[], right=[], i;',
    '  for(i=0;i<=s;i++){ var y=h*i/s, ph=i/s*wv*Math.PI*2; left.push([cx-half+A*Math.sin(ph), y]); }',
    '  for(i=s;i>=0;i--){ var y=h*i/s, ph=i/s*wv*Math.PI*2; right.push([cx+half+A*Math.sin(ph), y]); }',
    '  return \'path("\'+smooth(left)+\' L\'+__r(right[0][0])+\' \'+__r(right[0][1])+cbody(right)+\' Z")\';',
    '}'
  ].join('\n'),
  // 2중 주파수 합성 상승 물결 (유기적)
  waveStack: [
    'function waveStack(c,w,h){',
    '  if(c<=0) return ZERO; if(c>=1) return FULL(w,h);',
    '  var A=h*0.06, base=(1-c)*(h+2*A)-A, s=24, p=[], i;',
    '  for(i=0;i<=s;i++){ var x=w*i/s, ph=i/s*Math.PI*2;',
    '    p.push([x, base + A*0.62*Math.sin(ph*1.2) + A*0.38*Math.sin(ph*2.6+1)]); }',
    '  return \'path("\'+smooth(p)+\' L\'+__r(w)+\' \'+__r(h)+\' L0 \'+__r(h)+\'Z")\';',
    '}'
  ].join('\n')
};

export const ALL_WAVE_SRC = CORE_SRC + '\n' + Object.values(WAVE_SRC).join('\n');

/* ----------------------------------------------------------------
   데모용 엔진 IIFE (부드러운 스크롤 lerp + 세그먼트 reveal)
   dimsBody: w,h 측정식 (fullscreen=viewport / card=frame)
   ---------------------------------------------------------------- */

export function engineIIFE(clipCall, dimsBody) {
  return [
    '(function(){',
    '  var prog = document.querySelector(".demo-progress > div");',
    '  var track = document.querySelector(".scroll-track");',
    '  var cards = document.querySelectorAll(".wis-card");',
    '  var N = cards.length;',
    ALL_WAVE_SRC.split('\n').map(function (l) { return '  ' + l; }).join('\n'),
    '  function clipFor(c,w,h){ ' + clipCall + ' }',
    '  function dims(){ ' + dimsBody + ' }',
    '  function progress(){',
    '    var rect = track.getBoundingClientRect();',
    '    var max = Math.max(1, rect.height - window.innerHeight);',
    '    return Math.max(0, Math.min(1, -rect.top / max));',
    '  }',
    '  var targetP = 0, curP = 0, rafId = null;',
    '  function render(p){',
    '    prog.style.width = (p*100).toFixed(2) + "%";',
    '    var d = dims(), w = d[0], h = d[1], segs = N - 1;',
    '    var fp = p*segs, idx = Math.min(Math.floor(fp), segs-1), local = fp - idx;',
    '    for (var i=0;i<cards.length;i++){',
    '      var cov = i===0 ? 1 : i<=idx ? 1 : i===idx+1 ? local : 0;',
    '      cards[i].style.zIndex = i;',
    '      cards[i].style.clipPath = clipFor(cov, w, h);',
    '    }',
    '  }',
    '  // requestAnimationFrame lerp: 목표 진행률로 매끄럽게 수렴 (부드러운 스크롤)',
    '  function loop(){',
    '    curP += (targetP - curP) * 0.14;',
    '    var done = Math.abs(targetP - curP) < 0.0004;',
    '    if (done) curP = targetP;',
    '    render(curP);',
    '    rafId = done ? null : requestAnimationFrame(loop);',
    '  }',
    '  function kick(){ targetP = progress(); if (rafId === null) rafId = requestAnimationFrame(loop); }',
    '  window.addEventListener("scroll", kick, { passive: true });',
    '  window.addEventListener("resize", kick, { passive: true });',
    '  window.__reset = function(){ window.scrollTo({ top: 0, behavior: "smooth" }); };',
    '  targetP = progress(); render(curP);',
    '})();'
  ].join('\n');
}

/* ----------------------------------------------------------------
   보고서용 코드 스니펫 (읽기용 축약)
   ---------------------------------------------------------------- */

export function snippetJS(p, dimsBody) {
  return 'var cards = document.querySelectorAll(".wis-card"), N = cards.length;\n\n'
    + CORE_SRC + '\n'
    + WAVE_SRC[p.helper] + '\n\n'
    + 'function clipFor(c, w, h){ ' + p.clipCall + ' }\n'
    + 'function dims(){ ' + dimsBody + ' }\n\n'
    + '// 부드러운 스크롤: 목표 진행률로 매 프레임 lerp 보간 (requestAnimationFrame)\n'
    + 'var targetP = 0, curP = 0, rafId = null;\n'
    + 'function render(p){\n'
    + '  var d = dims(), w = d[0], h = d[1], segs = N - 1;\n'
    + '  var fp = p*segs, idx = Math.min(Math.floor(fp), segs-1), local = fp - idx;\n'
    + '  cards.forEach(function(c, i){\n'
    + '    var cov = i===0 ? 1 : i<=idx ? 1 : i===idx+1 ? local : 0;\n'
    + '    c.style.zIndex = i; c.style.clipPath = clipFor(cov, w, h);\n'
    + '  });\n'
    + '}\n'
    + 'function loop(){\n'
    + '  curP += (targetP - curP) * 0.14;\n'
    + '  var done = Math.abs(targetP - curP) < 0.0004; if (done) curP = targetP;\n'
    + '  render(curP); rafId = done ? null : requestAnimationFrame(loop);\n'
    + '}\n'
    + 'addEventListener("scroll", function(){ targetP = calcProgress(); if(!rafId) rafId = requestAnimationFrame(loop); }, { passive:true });';
}

/* ----------------------------------------------------------------
   데모 크롬(컨트롤/힌트/프로그레스) CSS — 테마별
   theme: 'dark' (검정 무대 → 밝은 크롬) | 'light' (밝은 무대 → 어두운 크롬)
   ---------------------------------------------------------------- */

export function chromeCss(theme) {
  var isDark = theme === 'dark';
  var fg = isDark ? '255,255,255' : '20,20,22';
  var panel = isDark ? '0,0,0' : '255,255,255';
  var line = isDark ? '255,255,255' : '0,0,0';
  return [
    '    .demo-controls { position: fixed; top: 16px; left: 16px; display: inline-flex; align-items: center; gap: 10px; z-index: 100; }',
    '    .demo-reset { font: 600 11px/1 "Pretendard Variable","Pretendard",sans-serif; color: rgba(' + fg + ',0.75); background: rgba(' + panel + ',0.4); border: 1px solid rgba(' + line + ',0.16); border-radius: 999px; padding: 8px 14px; cursor: pointer; transition: color 160ms, background 160ms; backdrop-filter: blur(8px); }',
    '    .demo-reset:hover { color: rgba(' + fg + ',1); background: rgba(' + panel + ',0.7); }',
    '    .demo-label { font: 500 10px/1 "Pretendard Variable","Pretendard",sans-serif; color: rgba(' + fg + ',0.55); letter-spacing: 0.14em; text-transform: uppercase; }',
    '    .demo-hint { position: fixed; right: 16px; bottom: 24px; font: 500 10px/1 "Pretendard Variable","Pretendard",sans-serif; color: rgba(' + fg + ',0.6); letter-spacing: 0.18em; text-transform: uppercase; z-index: 100; background: rgba(' + panel + ',0.4); padding: 8px 14px; border-radius: 999px; backdrop-filter: blur(8px); animation: hint-bounce 1.6s ease-in-out infinite; }',
    '    @keyframes hint-bounce { 0%, 100% { transform: translateY(0); opacity: 0.6; } 50% { transform: translateY(4px); opacity: 1; } }',
    '    .demo-progress { position: fixed; bottom: 0; left: 0; right: 0; height: 2px; background: rgba(' + line + ',0.12); z-index: 100; }',
    '    .demo-progress > div { height: 100%; background: rgba(' + fg + ',1); width: 0; }'
  ].join('\n');
}

/* ----------------------------------------------------------------
   패턴 10종 정의 (scope/컨테이너만 컨텍스트별 치환)
   ctx: { scope: '화면 전체'|'카드', containerKv, sig }
   ---------------------------------------------------------------- */

export function buildPatterns(ctx) {
  var S = ctx.scope;
  var C = ctx.containerKv;
  var sig = ctx.sig || 'Framer Masked Scroll Slider';

  function kv(spec) {
    return [
      { label: '의존성', value: 'Vanilla JS (clip-path: path 베지어)' },
      { label: '트리거', value: '스크롤 진행률 → rAF lerp 보간 → 세그먼트 coverage' },
      { label: '물결', value: spec.waveKv },
      { label: '방향', value: spec.dirKv },
      { label: '컨테이너', value: C },
      { label: '시그니처', value: spec.sig || sig }
    ];
  }

  var specs = [
    {
      id: 'wave-up', num: '01', title: '물결 상승 (Masked Slider 시그니처)', helper: 'waveUp',
      clipCall: 'return waveUp(c,w,h, h*0.07, 1.3);',
      summary: '다음 이미지가 ' + S + ' 아래에서 완만한 물결 곡선을 그리며 위로 차오른다. 가장 기본이 되는 시그니처 전환.',
      explain: '스크롤 진행률을 세그먼트별 로컬 진행률 0~1로 환산하고, 다음 이미지를 clip-path: path()의 2차 베지어 곡선으로 reveal한다. 상단 엣지가 완만한 사인 곡선(진폭 약 7% · 1.3주기)을 그리며 ' + S + ' 아래에서 위로 올라온다. polygon(꺾인 직선) 대신 베지어 path를 써서 단면이 매끄럽고, requestAnimationFrame lerp 보간으로 스크롤이 부드럽게 따라온다.',
      waveKv: '완만한 사인 곡선 (진폭 ~7% · 1.3주기)', dirKv: '아래 → 위',
      guide: '가장 안정적인 시그니처 전환. 진폭은 높이의 6~9%, 주기 1~1.6이 매끄럽다. 진폭을 키우면 역동적이지만 이미지 가독성이 잠시 떨어진다. clip-path: path()는 모던 evergreen 전부 지원.',
      tradeoff: '전환 중 이미지가 물결로 잘리므로 핵심 피사체·텍스트는 상·하단에 두지 말 것. path() 미지원 구형 브라우저는 폴백 필요.'
    },
    {
      id: 'wave-down', num: '02', title: '물결 하강', helper: 'waveDown',
      clipCall: 'return waveDown(c,w,h, h*0.07, 1.3);',
      summary: '다음 이미지가 ' + S + ' 위에서 물결 곡선을 그리며 아래로 흘러내린다. 상승의 반대 방향.',
      explain: '상단(0)에서 시작해 물결진 하단 엣지까지의 영역을 베지어 path로 채운다. 엣지가 완만한 사인 곡선을 그리며 위에서 아래로 내려와 다음 이미지를 덮는다. 위→아래 스크롤 방향과 시각적으로 일치해 가장 직관적인 흐름.',
      waveKv: '완만한 사인 곡선 (진폭 ~7% · 1.3주기)', dirKv: '위 → 아래',
      guide: '스크롤 방향(위→아래)과 reveal 방향이 일치해 가장 자연스럽다. 헤더·내비게이션이 상단에 고정된 레이아웃에서 특히 잘 어울린다.',
      tradeoff: '상승(01)과 한 쌍 — 한 페이지에 둘을 섞으면 방향이 혼란스러울 수 있다.'
    },
    {
      id: 'wave-side', num: '03', title: '측면 물결 스윕', helper: 'waveSide',
      clipCall: 'return waveSide(c,w,h, w*0.05, 1.3);',
      summary: '세로 물결 엣지가 ' + S + ' 좌측에서 우측으로 매끄럽게 쓸려 들어온다.',
      explain: '우측 경계가 세로 사인 곡선(진폭 약 5% · 1.3주기)을 그리며, 엣지 X가 좌(-A)에서 우(w+A)로 coverage에 비례해 이동한다. 베지어로 곡선이 매끄럽고, lerp 보간으로 스윕이 부드럽다.',
      waveKv: '세로 사인 곡선 (진폭 ~5% · 1.3주기)', dirKv: '좌 → 우',
      guide: '가로 방향 전환. 세로 스크롤과 직교하는 흐름이라 시네마틱하다. RTL 사이트는 방향을 우→좌로 반전 권장.',
      tradeoff: '가로 흐름이 세로 스크롤과 직교 — 약간의 방향 인지 비용. overflow:hidden 필수.'
    },
    {
      id: 'wave-diagonal', num: '04', title: '사선 물결', helper: 'waveDiag',
      clipCall: 'return waveDiag(c,w,h, Math.min(w,h)*0.05, 1.2);',
      summary: '물결 경계가 좌하단 → 우상단 대각선으로 기울어진 채 매끄럽게 쓸려 올라온다.',
      explain: 'x/w + y/h = 2c 형태의 대각선 임계선에 완만한 사인 진폭을 더해 물결진 사선 엣지를 만든다. coverage가 커지면 대각선이 좌하단에서 우상단으로 밀려나며 다음 이미지를 reveal. 베지어로 단면이 매끄럽다.',
      waveKv: '사선 사인 곡선 (진폭 ~5% · 1.2주기)', dirKv: '좌하단 → 우상단',
      guide: '정적인 수평/수직보다 역동적이다. 사선 각도는 컨테이너 비율로 자동 결정된다. 진폭을 줄이면 깔끔한 대각선 와이프에 가까워진다.',
      tradeoff: '대각선이라 모서리별 reveal 타이밍 차이가 크다. 모서리 콘텐츠는 늦게 드러난다.'
    },
    {
      id: 'wave-blob', num: '05', title: '물결 블롭 확장', helper: 'waveBlob',
      clipCall: 'return waveBlob(c,w,h, 5, 0.12);',
      summary: '다음 이미지가 ' + S + ' 중앙에서 둥근 물결 블롭으로 매끄럽게 확장되며 채워진다.',
      explain: '중앙을 기준으로 반지름 R = coverage × maxR인 원을 그리되, 각도에 따라 r = R(1 + 0.12·sin(angle×5))로 5개의 로브를 만들어 물결진 블롭을 형성한다. 닫힌 베지어 곡선(smoothClosed)으로 가장자리가 매끄럽다.',
      waveKv: '5-로브 닫힌 베지어 블롭 (진폭 12%)', dirKv: '중앙 → 바깥 확장',
      guide: '중앙 포커스를 강조하는 오가닉 전환. 로브 4~6개, 진폭 0.10~0.14가 자연스럽다. 로브를 늘리고 진폭을 줄이면 파장(06)에 가까워진다.',
      tradeoff: '닫힌 곡선 점이 많아 가장 무거운 편. 확장 초반 작은 블롭에서는 맥락 파악이 늦다.'
    },
    {
      id: 'wave-ripple', num: '06', title: '물결 파장', helper: 'waveBlob',
      clipCall: 'return waveBlob(c,w,h, 11, 0.05);',
      summary: ' ' + S + ' 중앙에서 잔물결(고주파·저진폭) 동심 파장이 매끄럽게 퍼지듯 확산된다.',
      explain: '블롭과 동일한 중앙 확장 모델이되 로브를 11개, 진폭 비율을 0.05로 낮춰 잔물결진 원형 파장처럼 보이게 한다. 닫힌 베지어로 가장자리가 부드럽게 출렁인다. 수면에 돌을 던졌을 때의 동심 파장 느낌.',
      waveKv: '11-로브 잔물결 베지어 (진폭 5%)', dirKv: '중앙 → 바깥 확산',
      guide: '고주파·저진폭으로 거의 원형에 가깝되 가장자리가 부드럽게 잔물결진다. 물·자연·명상 테마에 적합. 진폭을 0으로 두면 완전한 원형 와이프.',
      tradeoff: '진폭이 작아 물결감이 미묘하다 — 강한 인상이 필요하면 블롭(05)이나 상승(01) 권장.'
    },
    {
      id: 'wave-band', num: '07', title: '수직 밴드 분할', helper: 'waveBand',
      clipCall: 'return waveBand(c,w,h, h*0.05, 1.4);',
      summary: ' ' + S + ' 중앙에서 위·아래 두 물결 곡선이 매끄럽게 벌어지며 세로로 펼쳐진다.',
      explain: '중앙 수평선을 기준으로 위쪽 베지어 곡선과 아래쪽 베지어 곡선을 하나의 밴드 path로 잇는다. coverage가 커지면 두 곡선이 위·아래로 벌어지며 중앙에서 바깥으로 이미지를 펼친다.',
      waveKv: '위·아래 베지어 곡선 2줄 (진폭 ~5%)', dirKv: '중앙 → 위·아래 분할',
      guide: '중앙에서 양쪽으로 열리는 극적인 오프닝. 가운데 핵심 피사체가 먼저 드러나므로 중앙 구도 이미지에 잘 맞는다.',
      tradeoff: '단일 밴드 path라 위·아래가 동시에 열린다. 상하단 모서리가 가장 늦게 드러난다.'
    },
    {
      id: 'wave-curtain', num: '08', title: '가로 커튼 분할', helper: 'waveCurtain',
      clipCall: 'return waveCurtain(c,w,h, w*0.045, 1.4);',
      summary: ' ' + S + ' 중앙에서 좌·우 두 물결 곡선이 커튼처럼 매끄럽게 벌어진다.',
      explain: '중앙 수직선을 기준으로 왼쪽 베지어 곡선과 오른쪽 베지어 곡선을 하나의 커튼 path로 잇는다. coverage가 커지면 두 물결 커튼이 좌·우로 벌어지며 중앙에서 바깥으로 이미지를 펼친다.',
      waveKv: '좌·우 베지어 곡선 2줄 (진폭 ~4.5%)', dirKv: '중앙 → 좌·우 분할',
      guide: '무대 커튼이 양쪽으로 열리듯 가로 분할. 밴드(07)와 한 쌍으로, 세로 구도·좌우 대칭 구도에 잘 맞는다.',
      tradeoff: '좌·우 모서리가 가장 늦게 드러난다. 좌우 끝 텍스트는 전환 중 잘림.'
    },
    {
      id: 'wave-morph', num: '09', title: '물결 모핑', helper: 'waveUp',
      clipCall: 'return waveUp(c,w,h, h*0.12*Math.sin(Math.PI*c)+2, 1.6);',
      summary: '전환 중간에 물결 진폭이 최대로 부풀었다가 양 끝에서 평평해지며 매끄럽게 모핑된다.',
      explain: '상승 모델에서 진폭을 h×0.12×sin(π·c)+2로 동적 변조한다. coverage 0과 1에서는 진폭이 거의 0(평평)이고 중간(c=0.5)에서 최대로 부푼다 → 전환 시작·끝은 깔끔하고 중간에만 물결이 크게 출렁이는 베지어 모핑.',
      waveKv: '진폭 동적 변조 sin(π·c) (최대 ~12%)', dirKv: '아래 → 위, 중간 부풂',
      guide: '시작·끝이 평평해 이미지가 깔끔하게 안착하고 전환 중간에만 큰 물결이 인다. 진폭 변조는 다른 패턴에도 곱해 쓸 수 있는 범용 기법.',
      tradeoff: '진폭이 매 프레임 바뀌어 출렁임이 크다 — prefers-reduced-motion 대응 권장.'
    },
    {
      id: 'wave-stack', num: '10', title: '레이어드 물결', helper: 'waveStack',
      clipCall: 'return waveStack(c,w,h);',
      summary: '두 개의 다른 주파수 물결이 겹쳐 불규칙하고 자연스러운 합성 물결이 매끄럽게 차오른다.',
      explain: '기본 주파수 사인(진폭 0.62A)에 2.6배 주파수 사인(진폭 0.38A)을 위상 차를 두고 더해 합성한 뒤 베지어로 매끄럽게 잇는다. 단일 사인보다 불규칙·유기적이라 실제 파도에 가까운 느낌으로 아래에서 위로 차오른다.',
      waveKv: '2중 주파수 합성 베지어 (~6% 합)', dirKv: '아래 → 위',
      guide: '두 사인을 겹쳐 가장 유기적인 물결을 만든다. 주파수 비·위상 차를 바꾸면 무한히 다양한 물결을 생성한다. 자연·바다 테마에 최적.',
      tradeoff: '합성 물결은 진폭 합이 커 전환 중 잘리는 영역이 넓다.'
    }
  ];

  return specs.map(function (spec) {
    return {
      id: spec.id, num: spec.num, title: spec.title, helper: spec.helper, clipCall: spec.clipCall,
      summary: spec.summary, explain: spec.explain,
      kv: kv(spec), guide: spec.guide, tradeoff: spec.tradeoff,
      recommendations: ctx.reco(spec)
    };
  });
}
