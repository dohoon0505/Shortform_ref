#!/usr/bin/env node
/**
 * Web Reference Lab — Category Generator: Form Input Micro (v1)
 * Material 3 Text Fields 참고 — 폼 인풋 마이크로 인터랙션 10종 카탈로그
 *
 * - 포커스/입력/클릭 직접 시연 (스크롤 매핑 아님)
 * - 검정 배경(#000) + Pretendard Variable + 한국어 라벨
 * - 패턴마다 중앙 폼 카드 — 사용자가 직접 타이핑하면 즉시 반응
 * - ↻ 다시 보기 = 폼 초기화 (window.__reset)
 *
 * Usage: node scripts/generate-form-input-micro.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ANALYSIS_DIR = join(ROOT, 'analyses', 'form-input-micro');
const ANALYSIS_FILE = join(ANALYSIS_DIR, 'analysis.json');
const DEMO_DIR = join(ROOT, 'demos', 'form-input-micro');

const CATEGORY = {
  id: 'form-input-micro',
  title: '폼 인풋 마이크로 인터랙션',
  type: 'category',
  date: '2026-06-10',
  url: 'https://m3.material.io/components/text-fields/overview',
  summary: '입력 필드가 포커스·입력·검증 결과에 즉각 반응하는 폼 마이크로 인터랙션 10종. 플로팅 라벨·언더라인 익스팬드·에러 셰이크·체크 드로잉·비밀번호 강도 미터·표시 토글·OTP 셀·글자수 카운터·커스텀 셀렉트·제출 버튼 모핑 — 2026 트렌드에서 장식을 넘어 usability layer로 격상된, 폼 이탈률을 실제로 줄이는 실전 피드백 패턴을 비교 카탈로그로 정리.'
};

/* ================================================================
   공통 CSS — 중앙 폼 카드 + 표준 인풋 토큰
   ================================================================ */

const BASE_CSS = ''
  + '.stage {\n'
  + '  min-height: 100vh; display: flex; align-items: center; justify-content: center;\n'
  + '  padding: 64px 20px 48px;\n'
  + '}\n'
  + '.form-card {\n'
  + '  width: 100%; max-width: 380px;\n'
  + '  background: #0d0d0d; border: 1px solid rgba(255,255,255,0.09);\n'
  + '  border-radius: 18px; padding: 32px 28px 28px;\n'
  + '  box-shadow: 0 24px 60px -30px rgba(0,0,0,0.85);\n'
  + '}\n'
  + '.form-title { margin: 0 0 6px; font-size: 18px; font-weight: 700; letter-spacing: -0.01em; }\n'
  + '.form-desc { margin: 0 0 24px; font-size: 13px; line-height: 1.55; color: rgba(255,255,255,0.45); }\n'
  + '.field { margin-bottom: 18px; }\n'
  + '.field:last-child { margin-bottom: 0; }\n'
  + '.field-label { display: block; margin-bottom: 8px; font-size: 12px; font-weight: 600; letter-spacing: 0.02em; color: rgba(255,255,255,0.55); }\n'
  + '.text-input {\n'
  + '  width: 100%; background: rgba(255,255,255,0.03);\n'
  + '  border: 1px solid rgba(255,255,255,0.16); border-radius: 10px;\n'
  + '  padding: 13px 14px; font: 500 15px/1.4 "Pretendard Variable","Pretendard",sans-serif;\n'
  + '  color: #fff; outline: none; caret-color: #3b82f6;\n'
  + '  transition: border-color 0.2s ease-out, box-shadow 0.2s ease-out;\n'
  + '}\n'
  + '.text-input::placeholder { color: rgba(255,255,255,0.28); }\n'
  + '.text-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.18); }\n';

/* ================================================================
   10 패턴 정의
   ================================================================ */

const PATTERNS = [
  // ── 01. float-label (Material 시그니처) ──
  {
    id: 'float-label', num: '01', title: '플로팅 라벨 (시그니처)',
    summary: 'Material 표준 플로팅 라벨 재현. 포커스하거나 입력값이 생기면 라벨이 필드 보더 위로 떠오르며 15px에서 11px로 축소 — placeholder=" " 공백과 :placeholder-shown 가상 클래스만으로 JS 없이 구현.',
    demo: {
      hint: '필드를 클릭해 입력해 보세요',
      bodyHTML: '<main class="stage">\n'
        + '  <div class="form-card">\n'
        + '    <h2 class="form-title">계정 만들기</h2>\n'
        + '    <p class="form-desc">필드를 클릭하면 라벨이 보더 위로 떠오릅니다. 입력값이 남아 있으면 라벨도 위에 머뭅니다.</p>\n'
        + '    <div class="field fl-field">\n'
        + '      <input class="fl-input" id="fl-email" type="email" placeholder=" " autocomplete="off">\n'
        + '      <label class="fl-label" for="fl-email">이메일 주소</label>\n'
        + '    </div>\n'
        + '    <div class="field fl-field">\n'
        + '      <input class="fl-input" id="fl-name" type="text" placeholder=" " autocomplete="off">\n'
        + '      <label class="fl-label" for="fl-name">이름</label>\n'
        + '    </div>\n'
        + '  </div>\n'
        + '</main>',
      css: '.fl-field { position: relative; }\n'
        + '.fl-input { width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.16); border-radius: 10px; padding: 16px 14px 14px; font: 500 15px/1.4 "Pretendard Variable","Pretendard",sans-serif; color: #fff; outline: none; caret-color: #3b82f6; transition: border-color 0.2s ease-out, box-shadow 0.2s ease-out; }\n'
        + '.fl-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.18); }\n'
        + '.fl-label { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); padding: 0 4px; font-size: 15px; font-weight: 500; color: rgba(255,255,255,0.38); background: #0d0d0d; border-radius: 4px; pointer-events: none; transition: top 0.2s cubic-bezier(0.25,0.46,0.45,0.94), font-size 0.2s cubic-bezier(0.25,0.46,0.45,0.94), color 0.2s ease-out, font-weight 0.2s ease-out; }\n'
        + '.fl-input:focus + .fl-label,\n'
        + '.fl-input:not(:placeholder-shown) + .fl-label { top: 0; font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.6); }\n'
        + '.fl-input:focus + .fl-label { color: #3b82f6; }',
      js: '',
      height: 480
    },
    snippetHTML: '<div class="fl-field">\n  <input class="fl-input" id="email" type="email"\n         placeholder=" " autocomplete="off">\n  <label class="fl-label" for="email">이메일 주소</label>\n</div>',
    snippetCSS: '.fl-field { position: relative; }\n.fl-input { padding: 16px 14px 14px;\n  border: 1px solid rgba(255,255,255,0.16); border-radius: 10px;\n  transition: border-color 0.2s ease-out; }\n.fl-input:focus { border-color: #3b82f6; }\n.fl-label { position: absolute; left: 11px; top: 50%;\n  transform: translateY(-50%); padding: 0 4px;\n  font-size: 15px; color: rgba(255,255,255,0.38);\n  background: #0d0d0d; /* 카드 배경색과 동일 — 보더 위에 얹힘 */\n  pointer-events: none;\n  transition: top 0.2s cubic-bezier(0.25,0.46,0.45,0.94),\n    font-size 0.2s cubic-bezier(0.25,0.46,0.45,0.94), color 0.2s; }\n.fl-input:focus + .fl-label,\n.fl-input:not(:placeholder-shown) + .fl-label {\n  top: 0; font-size: 11px; }\n.fl-input:focus + .fl-label { color: #3b82f6; }',
    snippetJS: '// CSS only — JS 불필요\n// placeholder=" " (공백 1칸)이 핵심:\n// :not(:placeholder-shown)으로 "입력값 있음" 상태를 CSS만으로 감지',
    explain: 'placeholder=" "(공백 1칸)를 넣으면 :placeholder-shown 가상 클래스로 입력값 유무를 CSS만으로 감지할 수 있다. :focus 또는 :not(:placeholder-shown)일 때 라벨을 top:0으로 올리고 font-size를 15px에서 11px로 축소. 라벨의 background를 카드 배경색과 동일하게 주면 보더 라인 위에 얹힐 때 라인이 끊긴 듯한 Material Outlined 스타일이 완성된다. label[for]와 input[id]를 연결해 라벨 클릭 시 포커스가 이동하는 접근성 기본기를 지킨다.',
    kv: [
      { label: '의존성', value: 'CSS only (:placeholder-shown 기법)' },
      { label: '트리거', value: ':focus + :not(:placeholder-shown) → 라벨 상승' },
      { label: '이징', value: 'cubic-bezier(0.25,0.46,0.45,0.94) — linear.app 실측 계열' },
      { label: 'duration', value: '200ms (인풋 권장 180~240ms ease-out)' },
      { label: '핵심', value: 'placeholder=" " 공백 + label background 카드색' },
      { label: '접근성', value: 'label[for]–input[id] 연결 — 라벨 클릭 시 포커스' }
    ],
    guide: 'placeholder를 안내 문구 용도로는 쓸 수 없으므로(공백 1칸 예약) 보조 설명은 필드 아래 helper text로 분리한다. 라벨 배경색은 반드시 필드가 놓인 표면색과 일치시켜야 보더 위에서 자연스럽다. 축소 후 11px 미만은 가독성이 떨어지므로 10~12px 사이를 유지.',
    recommendations: [
      { place: '히어로 헤더', body: '뉴스레터 구독 인풋 — 라벨과 placeholder를 하나로 합쳐 공간 절약' },
      { place: '랜딩 페이지', body: '회원가입 폼 — 필드 수가 많아도 라벨이 항상 보여 이탈 감소' },
      { place: '제품 섹션', body: '체크아웃 주소 폼 — 입력 후에도 어떤 필드인지 식별 가능' },
      { place: '포트폴리오 소개', body: '문의 폼 — 미니멀한 레이아웃에 라벨·placeholder 일원화' }
    ],
    tradeoff: 'placeholder 슬롯을 라벨이 점유하므로 형식 예시(you@example.com)를 placeholder로 못 보여줌. 브라우저 autofill 직후 :placeholder-shown 갱신이 늦는 엣지 케이스가 있어 autofill 대상 폼은 :autofill 셀렉터 보강 권장.'
  },

  // ── 02. underline-expand ──
  {
    id: 'underline-expand', num: '02', title: '언더라인 익스팬드',
    summary: '포커스하면 하단 보더가 중앙에서 양끝으로 scaleX(0→1) 확장되며 액센트 색 라인이 그려짐. Material Filled Text Field의 시그니처 언더라인.',
    demo: {
      hint: '필드를 클릭해 보세요',
      bodyHTML: '<main class="stage">\n'
        + '  <div class="form-card">\n'
        + '    <h2 class="form-title">로그인</h2>\n'
        + '    <p class="form-desc">필드를 클릭하면 하단 라인이 중앙에서 양끝으로 펼쳐집니다.</p>\n'
        + '    <div class="field">\n'
        + '      <label class="field-label" for="ue-email">이메일 주소</label>\n'
        + '      <div class="ue-wrap">\n'
        + '        <input class="ue-input" id="ue-email" type="email" placeholder="you@example.com" autocomplete="off">\n'
        + '        <span class="ue-line" aria-hidden="true"></span>\n'
        + '      </div>\n'
        + '    </div>\n'
        + '    <div class="field">\n'
        + '      <label class="field-label" for="ue-pass">비밀번호</label>\n'
        + '      <div class="ue-wrap">\n'
        + '        <input class="ue-input" id="ue-pass" type="password" placeholder="8자 이상" autocomplete="new-password">\n'
        + '        <span class="ue-line" aria-hidden="true"></span>\n'
        + '      </div>\n'
        + '    </div>\n'
        + '  </div>\n'
        + '</main>',
      css: '.ue-wrap { position: relative; }\n'
        + '.ue-input { width: 100%; background: transparent; border: 0; border-bottom: 1px solid rgba(255,255,255,0.16); border-radius: 0; padding: 10px 2px 12px; font: 500 15px/1.4 "Pretendard Variable","Pretendard",sans-serif; color: #fff; outline: none; caret-color: #3b82f6; }\n'
        + '.ue-input::placeholder { color: rgba(255,255,255,0.28); }\n'
        + '.ue-line { position: absolute; left: 0; right: 0; bottom: 0; height: 2px; background: #3b82f6; border-radius: 1px; transform: scaleX(0); transform-origin: center; transition: transform 0.22s cubic-bezier(0.25,0.46,0.45,0.94); }\n'
        + '.ue-input:focus ~ .ue-line { transform: scaleX(1); }',
      js: '',
      height: 480
    },
    snippetHTML: '<div class="ue-wrap">\n  <input class="ue-input" id="email" type="email"\n         placeholder="you@example.com">\n  <span class="ue-line" aria-hidden="true"></span>\n</div>',
    snippetCSS: '.ue-wrap { position: relative; }\n.ue-input { border: 0;\n  border-bottom: 1px solid rgba(255,255,255,0.16);\n  padding: 10px 2px 12px; outline: none; }\n.ue-line { position: absolute; left: 0; right: 0; bottom: 0;\n  height: 2px; background: #3b82f6;\n  transform: scaleX(0); transform-origin: center;\n  transition: transform 0.22s cubic-bezier(0.25,0.46,0.45,0.94); }\n.ue-input:focus ~ .ue-line { transform: scaleX(1); }',
    snippetJS: '// CSS only — JS 불필요\n// 형제 선택자(~)로 input:focus 상태를 .ue-line에 전달\n// scaleX는 reflow를 일으키지 않아 width 전환보다 빠름',
    explain: '기본 1px 회색 언더라인 위에 2px 액센트 라인(.ue-line)을 겹쳐 두고 scaleX(0)으로 숨긴다. input:focus ~ .ue-line 형제 선택자로 포커스를 감지해 scaleX(1)로 확장. transform-origin:center 덕분에 중앙에서 양끝으로 동시에 펼쳐지는 시그니처 모션이 나온다. width 전환 대신 transform을 쓰므로 reflow가 없고 GPU 가속을 받는다.',
    kv: [
      { label: '의존성', value: 'CSS only (형제 선택자 ~)' },
      { label: '트리거', value: ':focus → scaleX(0→1) 중앙 기준 확장' },
      { label: '이징', value: 'cubic-bezier(0.25,0.46,0.45,0.94)' },
      { label: 'duration', value: '220ms (인풋 권장 180~240ms 구간)' },
      { label: '핵심', value: 'transform-origin: center + scaleX — reflow 없음' },
      { label: '참고', value: 'Material Filled Text Field / stripe.com 포커스 전환' }
    ],
    guide: '언더라인 전용 필드는 배경·좌우 보더가 없어 폼이 가벼워 보이는 대신 클릭 가능한 영역이 모호해질 수 있다 — 필드 간 간격을 충분히(16px 이상) 확보. 에러 시 .ue-line 색만 #ef4444로 바꾸면 동일 모션으로 에러 전환까지 재활용된다.',
    recommendations: [
      { place: '히어로 헤더', body: '한 줄 검색·구독 인풋 — 보더 없는 경량 비주얼' },
      { place: '랜딩 페이지', body: '로그인·간편 가입 폼 — 미니멀 톤 유지' },
      { place: '제품 섹션', body: '설정 페이지 인라인 편집 필드 — 포커스 시에만 강조' },
      { place: '포트폴리오 소개', body: '타이포 중심 문의 폼 — 라인 하나로 포인트' }
    ],
    tradeoff: '필드 영역 인지가 박스형보다 약함 — 터치 환경에서는 패딩을 넉넉히. 언더라인 2개(기본+액센트)가 겹치므로 배경색이 중간에 바뀌는 레이아웃에서는 색 보정 필요.'
  },

  // ── 03. shake-error ──
  {
    id: 'shake-error', num: '03', title: '에러 셰이크',
    summary: '검증 실패 시 필드가 좌우로 셰이크되고 에러 메시지가 슬라이드 다운, 보더가 적색으로 전환. void offsetWidth reflow로 연속 실패에도 셰이크가 매번 재시작.',
    demo: {
      hint: '아무 값이나 넣고 검증해 보세요',
      bodyHTML: '<main class="stage">\n'
        + '  <div class="form-card">\n'
        + '    <h2 class="form-title">이메일 검증</h2>\n'
        + '    <p class="form-desc">잘못된 형식을 입력하고 검증 버튼을 눌러 보세요. 필드가 좌우로 흔들리며 에러 메시지가 내려옵니다.</p>\n'
        + '    <div class="field se-field" id="se-field">\n'
        + '      <label class="field-label" for="se-email">이메일 주소</label>\n'
        + '      <input class="text-input se-input" id="se-email" type="text" placeholder="you@example.com" autocomplete="off">\n'
        + '      <p class="se-error" id="se-error" role="alert">올바른 이메일 형식이 아닙니다. @와 도메인을 확인해 주세요.</p>\n'
        + '    </div>\n'
        + '    <button class="se-submit" id="se-submit" type="button">검증하기</button>\n'
        + '  </div>\n'
        + '</main>',
      css: '.se-field.is-error .se-input { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,0.14); animation: se-shake 0.4s cubic-bezier(0.36,0.07,0.19,0.97) both; }\n'
        + '.se-field.is-valid .se-input { border-color: #22c55e; box-shadow: 0 0 0 3px rgba(34,197,94,0.14); }\n'
        + '@keyframes se-shake { 10%,90% { transform: translateX(-1px); } 20%,80% { transform: translateX(2px); } 30%,50%,70% { transform: translateX(-5px); } 40%,60% { transform: translateX(5px); } }\n'
        + '.se-error { max-height: 0; opacity: 0; overflow: hidden; margin: 0; font-size: 12px; line-height: 1.5; color: #f87171; transform: translateY(-4px); transition: max-height 0.22s ease-out, opacity 0.22s ease-out, transform 0.22s ease-out, margin-top 0.22s ease-out; }\n'
        + '.se-field.is-error .se-error { max-height: 40px; opacity: 1; transform: translateY(0); margin-top: 8px; }\n'
        + '.se-submit { width: 100%; margin-top: 4px; padding: 13px 0; border: 0; border-radius: 10px; background: #3b82f6; color: #fff; font: 600 15px/1 "Pretendard Variable","Pretendard",sans-serif; cursor: pointer; transition: background 0.2s ease-out, transform 0.15s ease-out; }\n'
        + '.se-submit:hover { background: #2563eb; }\n'
        + '.se-submit:active { transform: scale(0.985); }',
      js: 'var field = document.getElementById("se-field");\n'
        + 'var input = document.getElementById("se-email");\n'
        + 'var btn = document.getElementById("se-submit");\n'
        + 'var EMAIL = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;\n'
        + 'btn.addEventListener("click", function(){\n'
        + '  var ok = EMAIL.test(input.value.trim());\n'
        + '  field.classList.remove("is-error");\n'
        + '  field.classList.remove("is-valid");\n'
        + '  if (ok) {\n'
        + '    field.classList.add("is-valid");\n'
        + '    input.setAttribute("aria-invalid", "false");\n'
        + '  } else {\n'
        + '    void field.offsetWidth;\n'
        + '    field.classList.add("is-error");\n'
        + '    input.setAttribute("aria-invalid", "true");\n'
        + '    input.focus();\n'
        + '  }\n'
        + '});\n'
        + 'input.addEventListener("input", function(){\n'
        + '  field.classList.remove("is-error");\n'
        + '  field.classList.remove("is-valid");\n'
        + '  input.removeAttribute("aria-invalid");\n'
        + '});',
      height: 480
    },
    snippetHTML: '<div class="se-field" id="field">\n  <label class="field-label" for="email">이메일 주소</label>\n  <input class="se-input" id="email" type="text" placeholder="you@example.com">\n  <p class="se-error" role="alert" aria-live="assertive">\n    올바른 이메일 형식이 아닙니다.\n  </p>\n</div>\n<button id="submit" type="button">검증하기</button>',
    snippetCSS: '.se-field.is-error .se-input { border-color: #ef4444;\n  animation: se-shake 0.4s cubic-bezier(0.36,0.07,0.19,0.97) both; }\n@keyframes se-shake {\n  10%,90% { transform: translateX(-1px); }\n  20%,80% { transform: translateX(2px); }\n  30%,50%,70% { transform: translateX(-5px); }\n  40%,60% { transform: translateX(5px); } }\n.se-error { max-height: 0; opacity: 0; overflow: hidden;\n  color: #f87171; transform: translateY(-4px);\n  transition: max-height 0.22s ease-out, opacity 0.22s ease-out,\n    transform 0.22s ease-out, margin-top 0.22s ease-out; }\n.se-field.is-error .se-error {\n  max-height: 40px; opacity: 1; transform: translateY(0); margin-top: 8px; }',
    snippetJS: 'var EMAIL = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;\nbtn.addEventListener("click", function(){\n  field.classList.remove("is-error");\n  if (EMAIL.test(input.value.trim())) {\n    input.setAttribute("aria-invalid", "false");\n  } else {\n    void field.offsetWidth; // reflow — 셰이크 애니메이션 재시작\n    field.classList.add("is-error");\n    input.setAttribute("aria-invalid", "true");\n    input.focus();\n  }\n});',
    explain: '검증 실패 시 .is-error 클래스가 셰이크 keyframes(±5px 감쇠 진동)와 적색 보더를 동시에 적용한다. 같은 클래스를 다시 붙이면 애니메이션이 재생되지 않으므로, 제거 → void el.offsetWidth(강제 reflow) → 재부여 순서로 매번 재시작시킨다. 에러 메시지는 max-height 0→40px + opacity + translateY를 220ms ease-out으로 묶어 슬라이드 다운. input 이벤트에서 에러 상태를 즉시 해제해 사용자가 수정을 시작하면 부정 피드백이 사라지게 한다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (정규식 검증) + CSS keyframes' },
      { label: '트리거', value: '제출 클릭 → 검증 실패 시 .is-error 부여' },
      { label: '이징', value: 'cubic-bezier(0.36,0.07,0.19,0.97) — 셰이크 전용 감쇠' },
      { label: 'duration', value: '400ms (셰이크) + 220ms (메시지 슬라이드)' },
      { label: '핵심', value: 'void el.offsetWidth reflow로 애니메이션 재시작' },
      { label: '접근성', value: 'aria-invalid="true" + role="alert" 에러 메시지' }
    ],
    guide: '셰이크 진폭은 ±4~6px, 1회 400ms 이내가 적정 — 더 크거나 길면 공격적으로 느껴진다. 에러 메시지는 반드시 텍스트로 원인을 설명하고(색만으로 전달 금지), 사용자가 입력을 수정하기 시작하면 즉시 에러 상태를 해제한다. prefers-reduced-motion 환경에서는 셰이크를 끄고 색 전환만 남기는 분기 권장.',
    recommendations: [
      { place: '히어로 헤더', body: '구독 인풋 잘못된 이메일 — 인라인 즉시 피드백' },
      { place: '랜딩 페이지', body: '가입 폼 필수 필드 누락 — 제출 시점 일괄 검증' },
      { place: '제품 섹션', body: '결제 카드번호 오류 — 재입력 유도' },
      { place: '포트폴리오 소개', body: '문의 폼 형식 오류 — 부드러운 거절 피드백' }
    ],
    tradeoff: '진동 모션은 강한 부정 신호라 남용 시 피로감. prefers-reduced-motion 사용자 배려 필요. max-height 전환은 메시지가 2줄을 넘으면 잘릴 수 있어 한도를 여유 있게.'
  },

  // ── 04. check-draw ──
  {
    id: 'check-draw', num: '04', title: '체크 드로잉',
    summary: '입력값이 이메일 형식을 통과하는 순간 SVG 체크가 stroke-dashoffset으로 그려지고 보더가 초록으로 전환 — 제출 전에 성공을 미리 보여주는 포지티브 피드백.',
    demo: {
      hint: '이메일을 끝까지 입력해 보세요',
      bodyHTML: '<main class="stage">\n'
        + '  <div class="form-card">\n'
        + '    <h2 class="form-title">실시간 형식 검사</h2>\n'
        + '    <p class="form-desc">올바른 이메일 형식이 되는 순간 체크가 그려지고 보더가 초록으로 바뀝니다.</p>\n'
        + '    <div class="field cd-field" id="cd-field">\n'
        + '      <label class="field-label" for="cd-email">이메일 주소</label>\n'
        + '      <div class="cd-wrap">\n'
        + '        <input class="text-input cd-input" id="cd-email" type="email" placeholder="you@example.com" autocomplete="off">\n'
        + '        <svg class="cd-check" viewBox="0 0 24 24" fill="none" aria-hidden="true">\n'
        + '          <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>\n'
        + '        </svg>\n'
        + '      </div>\n'
        + '    </div>\n'
        + '  </div>\n'
        + '</main>',
      css: '.cd-wrap { position: relative; }\n'
        + '.cd-input { padding-right: 44px; }\n'
        + '.cd-field.is-valid .cd-input { border-color: #22c55e; box-shadow: 0 0 0 3px rgba(34,197,94,0.14); }\n'
        + '.cd-check { position: absolute; right: 13px; top: 50%; width: 20px; height: 20px; transform: translateY(-50%) scale(0.8); opacity: 0; transition: opacity 0.18s ease-out, transform 0.18s ease-out; }\n'
        + '.cd-check path { stroke-dasharray: 21; stroke-dashoffset: 21; transition: stroke-dashoffset 0.3s cubic-bezier(0.25,0.46,0.45,0.94) 0.05s; }\n'
        + '.cd-field.is-valid .cd-check { opacity: 1; transform: translateY(-50%) scale(1); }\n'
        + '.cd-field.is-valid .cd-check path { stroke-dashoffset: 0; }',
      js: 'var field = document.getElementById("cd-field");\n'
        + 'var input = document.getElementById("cd-email");\n'
        + 'var EMAIL = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;\n'
        + 'input.addEventListener("input", function(){\n'
        + '  field.classList.toggle("is-valid", EMAIL.test(input.value.trim()));\n'
        + '});',
      height: 480
    },
    snippetHTML: '<div class="cd-field" id="field">\n  <div class="cd-wrap">\n    <input class="cd-input" id="email" type="email" placeholder="you@example.com">\n    <svg class="cd-check" viewBox="0 0 24 24" fill="none" aria-hidden="true">\n      <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#22c55e"\n            stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>\n    </svg>\n  </div>\n</div>',
    snippetCSS: '.cd-check { position: absolute; right: 13px; top: 50%;\n  width: 20px; height: 20px;\n  transform: translateY(-50%) scale(0.8); opacity: 0;\n  transition: opacity 0.18s ease-out, transform 0.18s ease-out; }\n.cd-check path { stroke-dasharray: 21; stroke-dashoffset: 21;\n  transition: stroke-dashoffset 0.3s cubic-bezier(0.25,0.46,0.45,0.94) 0.05s; }\n.cd-field.is-valid .cd-input { border-color: #22c55e; }\n.cd-field.is-valid .cd-check { opacity: 1; transform: translateY(-50%) scale(1); }\n.cd-field.is-valid .cd-check path { stroke-dashoffset: 0; }',
    snippetJS: 'var EMAIL = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;\ninput.addEventListener("input", function(){\n  field.classList.toggle("is-valid", EMAIL.test(input.value.trim()));\n});\n// 상태 변화를 스크린리더에 알리려면 aria-live 텍스트 병행 권장',
    explain: '체크 path의 전체 길이(약 21px)를 stroke-dasharray로 잡고 같은 값의 dashoffset으로 완전히 숨긴다. .is-valid가 붙으면 dashoffset이 0으로 전환되며 펜으로 긋듯 체크가 그려진다. 50ms delay를 줘서 보더 색 전환이 먼저 시작된 뒤 체크가 따라오는 순서를 만들면 인과가 더 또렷하다. 입력 도중 형식이 깨지면 classList.toggle이 즉시 상태를 되돌린다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (input 이벤트) + SVG stroke' },
      { label: '트리거', value: 'input → 이메일 정규식 통과 시 .is-valid' },
      { label: '이징', value: 'cubic-bezier(0.25,0.46,0.45,0.94) + 50ms delay' },
      { label: 'duration', value: '300ms (드로잉) + 180ms (보더 전환)' },
      { label: '핵심', value: 'stroke-dasharray = path 길이(21) + dashoffset 21→0' },
      { label: '접근성', value: '아이콘은 aria-hidden — 상태는 aria-live 텍스트 병행' }
    ],
    guide: 'path 길이는 el.getTotalLength()로 정확히 구해 dasharray에 넣는 것이 안전하다(눈대중 값은 끊김 발생). 성공 피드백은 blur 시점이 아니라 입력 도중 실시간으로 줘야 체감 효과가 크다. 단 너무 이른 단계(첫 글자부터 X 표시)는 역효과 — 성공만 표시하고 실패는 제출 시점에 미루는 비대칭 전략이 폼 이탈률을 줄인다.',
    recommendations: [
      { place: '히어로 헤더', body: '구독 이메일 인풋 — 버튼 누르기 전 확신 부여' },
      { place: '랜딩 페이지', body: '가입 폼 아이디·이메일 중복 검사 결과 표시' },
      { place: '제품 섹션', body: '쿠폰 코드 입력 — 유효 코드 즉시 확인' },
      { place: '포트폴리오 소개', body: '문의 폼 이메일 필드 — 회신 가능 주소 보장' }
    ],
    tradeoff: 'JS 검증 로직 필수. 실시간 검증은 input마다 정규식을 돌리므로 무거운 검증(서버 중복 체크)은 debounce 처리. 초록 체크만으로는 색각 이상 사용자에게 부족 — 아이콘 형태가 함께 전달되므로 양호하지만 텍스트 보조가 더 안전.'
  },

  // ── 05. password-meter ──
  {
    id: 'password-meter', num: '05', title: '비밀번호 강도 미터',
    summary: '입력할 때마다 길이·대문자·숫자·특수문자 4항목을 채점해 세그먼트 바가 채워지고 적→황→초로 색 단계 전환 + 강도 라벨 동기 갱신.',
    demo: {
      hint: '비밀번호를 입력해 보세요',
      bodyHTML: '<main class="stage">\n'
        + '  <div class="form-card">\n'
        + '    <h2 class="form-title">비밀번호 강도</h2>\n'
        + '    <p class="form-desc">대문자·숫자·특수문자를 섞어 보세요. 4칸 미터가 채워지며 색이 바뀝니다.</p>\n'
        + '    <div class="field">\n'
        + '      <label class="field-label" for="pm-pass">비밀번호</label>\n'
        + '      <input class="text-input" id="pm-pass" type="password" placeholder="8자 이상 입력" autocomplete="new-password">\n'
        + '      <div class="pm-meter" id="pm-meter" data-level="0" aria-hidden="true">\n'
        + '        <span class="pm-seg"></span><span class="pm-seg"></span><span class="pm-seg"></span><span class="pm-seg"></span>\n'
        + '      </div>\n'
        + '      <p class="pm-text" id="pm-text" data-level="0" aria-live="polite">8자 이상, 대문자·숫자·특수문자 조합을 권장합니다</p>\n'
        + '    </div>\n'
        + '  </div>\n'
        + '</main>',
      css: '.pm-meter { display: flex; gap: 6px; margin-top: 12px; }\n'
        + '.pm-seg { flex: 1; height: 4px; border-radius: 2px; background: rgba(255,255,255,0.12); transition: background-color 0.24s ease-out, transform 0.24s cubic-bezier(0.34,1.56,0.64,1); }\n'
        + '.pm-meter[data-level="1"] .pm-seg:nth-child(1) { background: #ef4444; transform: scaleY(1.5); }\n'
        + '.pm-meter[data-level="2"] .pm-seg:nth-child(-n+2) { background: #f59e0b; transform: scaleY(1.5); }\n'
        + '.pm-meter[data-level="3"] .pm-seg:nth-child(-n+3) { background: #facc15; transform: scaleY(1.5); }\n'
        + '.pm-meter[data-level="4"] .pm-seg { background: #22c55e; transform: scaleY(1.5); }\n'
        + '.pm-text { margin: 8px 0 0; font-size: 12px; color: rgba(255,255,255,0.4); transition: color 0.24s ease-out; }\n'
        + '.pm-text[data-level="1"] { color: #f87171; }\n'
        + '.pm-text[data-level="2"] { color: #fbbf24; }\n'
        + '.pm-text[data-level="3"] { color: #fde047; }\n'
        + '.pm-text[data-level="4"] { color: #4ade80; }',
      js: 'var input = document.getElementById("pm-pass");\n'
        + 'var meter = document.getElementById("pm-meter");\n'
        + 'var text = document.getElementById("pm-text");\n'
        + 'var LABELS = ["8자 이상, 대문자·숫자·특수문자 조합을 권장합니다", "강도: 약함", "강도: 보통", "강도: 좋음", "강도: 강함"];\n'
        + 'function score(v){\n'
        + '  if (!v) return 0;\n'
        + '  var s = 0;\n'
        + '  if (v.length >= 8) s++;\n'
        + '  if (/[A-Z]/.test(v)) s++;\n'
        + '  if (/[0-9]/.test(v)) s++;\n'
        + '  if (/[^A-Za-z0-9]/.test(v)) s++;\n'
        + '  return Math.max(1, s);\n'
        + '}\n'
        + 'input.addEventListener("input", function(){\n'
        + '  var lv = score(input.value);\n'
        + '  meter.setAttribute("data-level", String(lv));\n'
        + '  text.setAttribute("data-level", String(lv));\n'
        + '  text.textContent = LABELS[lv];\n'
        + '});',
      height: 480
    },
    snippetHTML: '<input id="password" type="password" autocomplete="new-password">\n<div class="pm-meter" id="meter" data-level="0" aria-hidden="true">\n  <span class="pm-seg"></span><span class="pm-seg"></span>\n  <span class="pm-seg"></span><span class="pm-seg"></span>\n</div>\n<p class="pm-text" id="strength" aria-live="polite"></p>',
    snippetCSS: '.pm-meter { display: flex; gap: 6px; margin-top: 12px; }\n.pm-seg { flex: 1; height: 4px; border-radius: 2px;\n  background: rgba(255,255,255,0.12);\n  transition: background-color 0.24s ease-out,\n    transform 0.24s cubic-bezier(0.34,1.56,0.64,1); }\n.pm-meter[data-level="1"] .pm-seg:nth-child(1) { background: #ef4444; }\n.pm-meter[data-level="2"] .pm-seg:nth-child(-n+2) { background: #f59e0b; }\n.pm-meter[data-level="3"] .pm-seg:nth-child(-n+3) { background: #facc15; }\n.pm-meter[data-level="4"] .pm-seg { background: #22c55e; }',
    snippetJS: 'function score(v){\n  if (!v) return 0;\n  var s = 0;\n  if (v.length >= 8) s++;\n  if (/[A-Z]/.test(v)) s++;\n  if (/[0-9]/.test(v)) s++;\n  if (/[^A-Za-z0-9]/.test(v)) s++;\n  return Math.max(1, s);\n}\ninput.addEventListener("input", function(){\n  meter.setAttribute("data-level", String(score(input.value)));\n});',
    explain: '길이 8자 이상·대문자·숫자·특수문자 4항목을 1점씩 채점해 0~4 레벨을 만들고, data-level 속성 하나로 CSS에 전달한다. :nth-child(-n+k) 셀렉터가 레벨만큼의 세그먼트를 채우고, 레벨별 색상(#ef4444→#f59e0b→#facc15→#22c55e)을 일괄 적용. scaleY(1.5) 두께 pop이 채워지는 순간을 강조한다. 강도 라벨은 aria-live="polite"로 스크린리더에도 단계 변화가 전달된다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (4항목 채점)' },
      { label: '트리거', value: 'input → score 0~4 → data-level 속성' },
      { label: '이징', value: 'ease-out (색) + cubic-bezier(0.34,1.56,0.64,1) (두께 pop)' },
      { label: 'duration', value: '240ms' },
      { label: '핵심', value: '길이 8+ / 대문자 / 숫자 / 특수문자 — 항목당 1점' },
      { label: '색 단계', value: '#ef4444 → #f59e0b → #facc15 → #22c55e' }
    ],
    guide: '채점 기준은 서비스 정책과 반드시 일치시킬 것 — 미터는 "강함"인데 서버가 거절하면 신뢰가 무너진다. 실서비스에서는 zxcvbn 같은 사전 기반 추정기가 단순 문자종 채점보다 정확하다. 색과 함께 텍스트 라벨(약함/보통/좋음/강함)을 항상 병기해 색각 이상 사용자를 배려한다.',
    recommendations: [
      { place: '히어로 헤더', body: '간편 가입 모달 비밀번호 필드 — 즉시 강도 안내' },
      { place: '랜딩 페이지', body: '회원가입 폼 — 규칙 나열 대신 시각 채점' },
      { place: '제품 섹션', body: '계정 설정 비밀번호 변경 — 기존보다 강한지 비교' },
      { place: '포트폴리오 소개', body: '관리자 페이지 가입 — 보안 톤 연출' }
    ],
    tradeoff: '문자종 채점은 실제 엔트로피와 다를 수 있음(Password1!이 4점). 레벨 4단계 색상이 브랜드 팔레트와 충돌할 수 있어 시맨틱 컬러 토큰으로 분리 권장.'
  },

  // ── 06. password-reveal ──
  {
    id: 'password-reveal', num: '06', title: '비밀번호 표시 토글',
    summary: '눈 아이콘을 클릭하면 마스킹이 풀리며 아이콘의 사선 획이 stroke-dashoffset으로 그려지거나 지워짐 — 상태가 아이콘 모양으로 즉시 표현되는 토글.',
    demo: {
      hint: '눈 아이콘을 눌러 보세요',
      bodyHTML: '<main class="stage">\n'
        + '  <div class="form-card">\n'
        + '    <h2 class="form-title">비밀번호 표시 토글</h2>\n'
        + '    <p class="form-desc">눈 아이콘을 누르면 마스킹이 풀리고, 사선 획이 지워지거나 다시 그려집니다.</p>\n'
        + '    <div class="field">\n'
        + '      <label class="field-label" for="pr-pass">비밀번호</label>\n'
        + '      <div class="pr-wrap">\n'
        + '        <input class="text-input pr-input" id="pr-pass" type="password" value="Interaction2026!" autocomplete="new-password">\n'
        + '        <button class="pr-toggle" id="pr-toggle" type="button" aria-label="비밀번호 표시" aria-pressed="false">\n'
        + '          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">\n'
        + '            <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>\n'
        + '            <circle cx="12" cy="12" r="2.7" stroke="currentColor" stroke-width="1.6"/>\n'
        + '            <line class="pr-slash" x1="4.8" y1="4.2" x2="19.2" y2="19.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>\n'
        + '          </svg>\n'
        + '        </button>\n'
        + '      </div>\n'
        + '    </div>\n'
        + '  </div>\n'
        + '</main>',
      css: '.pr-wrap { position: relative; }\n'
        + '.pr-input { padding-right: 48px; }\n'
        + '.pr-toggle { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: transparent; border: 0; border-radius: 8px; color: rgba(255,255,255,0.45); cursor: pointer; transition: color 0.18s ease-out, background 0.18s ease-out; }\n'
        + '.pr-toggle:hover { color: rgba(255,255,255,0.8); background: rgba(255,255,255,0.06); }\n'
        + '.pr-toggle svg { width: 20px; height: 20px; }\n'
        + '.pr-slash { stroke-dasharray: 22; stroke-dashoffset: 0; transition: stroke-dashoffset 0.24s cubic-bezier(0.25,0.46,0.45,0.94); }\n'
        + '.pr-toggle.is-visible { color: #3b82f6; }\n'
        + '.pr-toggle.is-visible .pr-slash { stroke-dashoffset: 22; }',
      js: 'var input = document.getElementById("pr-pass");\n'
        + 'var toggle = document.getElementById("pr-toggle");\n'
        + 'toggle.addEventListener("click", function(){\n'
        + '  var visible = toggle.classList.toggle("is-visible");\n'
        + '  input.type = visible ? "text" : "password";\n'
        + '  toggle.setAttribute("aria-pressed", visible ? "true" : "false");\n'
        + '  toggle.setAttribute("aria-label", visible ? "비밀번호 숨기기" : "비밀번호 표시");\n'
        + '});\n'
        + 'window.__resetDemo = function(){\n'
        + '  input.value = "Interaction2026!";\n'
        + '  input.type = "password";\n'
        + '  toggle.classList.remove("is-visible");\n'
        + '  toggle.setAttribute("aria-pressed", "false");\n'
        + '  toggle.setAttribute("aria-label", "비밀번호 표시");\n'
        + '};',
      height: 480
    },
    snippetHTML: '<div class="pr-wrap">\n  <input class="pr-input" id="password" type="password">\n  <button class="pr-toggle" id="toggle" type="button"\n          aria-label="비밀번호 표시" aria-pressed="false">\n    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">\n      <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12z"\n            stroke="currentColor" stroke-width="1.6"/>\n      <circle cx="12" cy="12" r="2.7" stroke="currentColor" stroke-width="1.6"/>\n      <line class="pr-slash" x1="4.8" y1="4.2" x2="19.2" y2="19.8"\n            stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>\n    </svg>\n  </button>\n</div>',
    snippetCSS: '.pr-toggle { position: absolute; right: 6px; top: 50%;\n  transform: translateY(-50%);\n  color: rgba(255,255,255,0.45);\n  transition: color 0.18s ease-out; }\n.pr-slash { stroke-dasharray: 22; stroke-dashoffset: 0;\n  transition: stroke-dashoffset 0.24s cubic-bezier(0.25,0.46,0.45,0.94); }\n.pr-toggle.is-visible { color: #3b82f6; }\n.pr-toggle.is-visible .pr-slash { stroke-dashoffset: 22; }',
    snippetJS: 'toggle.addEventListener("click", function(){\n  var visible = toggle.classList.toggle("is-visible");\n  input.type = visible ? "text" : "password";\n  toggle.setAttribute("aria-pressed", visible ? "true" : "false");\n  toggle.setAttribute("aria-label",\n    visible ? "비밀번호 숨기기" : "비밀번호 표시");\n});',
    explain: '눈 아이콘 위의 사선 line(길이 약 21px)을 stroke-dasharray 22로 잡아 두고, 마스킹 상태에서는 dashoffset 0(사선 보임 = 가려짐), 표시 상태에서는 dashoffset 22(사선이 획 순서대로 지워짐)로 전환한다. input.type을 password와 text 사이에서 토글하는 것이 기능의 전부이지만, 사선이 그어지고 지워지는 240ms 드로잉이 상태 변화를 또렷하게 만든다. aria-pressed와 aria-label을 상태와 함께 갱신한다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (type 토글) + SVG line' },
      { label: '트리거', value: '아이콘 클릭 → type="password" ↔ "text"' },
      { label: '이징', value: 'cubic-bezier(0.25,0.46,0.45,0.94)' },
      { label: 'duration', value: '240ms (사선 드로잉)' },
      { label: '핵심', value: '사선 stroke-dashoffset 0↔22 — 가릴 때만 사선 표시' },
      { label: '접근성', value: 'aria-pressed + aria-label 동기 갱신' }
    ],
    guide: '토글 버튼은 최소 36×36px 터치 영역을 확보하고 input의 padding-right로 텍스트와 겹치지 않게 한다. type 전환 시 커서 위치가 끝으로 튀는 브라우저가 있어 setSelectionRange로 복원하면 더 매끄럽다. 표시 상태를 오래 방치하지 않도록 blur 시 자동으로 다시 마스킹하는 정책도 고려.',
    recommendations: [
      { place: '히어로 헤더', body: '간편 로그인 모달 — 오타 확인으로 로그인 실패 감소' },
      { place: '랜딩 페이지', body: '회원가입 폼 — 비밀번호 확인 필드 대체' },
      { place: '제품 섹션', body: '계정 설정 변경 폼 — 입력 검증 보조' },
      { place: '포트폴리오 소개', body: '관리자 로그인 — 디테일 완성도 연출' }
    ],
    tradeoff: '공공장소에서 표시 상태가 노출 위험 — 기본은 항상 마스킹. 일부 비밀번호 관리자 확장과 아이콘 위치가 겹칠 수 있어 우측 패딩 여유 필요.'
  },

  // ── 07. otp-cells ──
  {
    id: 'otp-cells', num: '07', title: 'OTP 셀',
    summary: '6칸 인증 코드 입력 — 숫자를 입력하면 칸이 pop(scale)되며 자동으로 다음 칸으로 이동, Backspace는 역방향 이동, 붙여넣기는 6칸에 자동 분배.',
    demo: {
      hint: '숫자를 연속으로 입력해 보세요',
      bodyHTML: '<main class="stage">\n'
        + '  <div class="form-card">\n'
        + '    <h2 class="form-title">인증 코드 입력</h2>\n'
        + '    <p class="form-desc">문자로 받은 6자리 코드를 입력해 주세요. 입력하면 자동으로 다음 칸으로 넘어갑니다.</p>\n'
        + '    <div class="otp-row" id="otp-row">\n'
        + '      <input class="otp-cell" type="text" inputmode="numeric" autocomplete="one-time-code" aria-label="인증번호 1번째 자리">\n'
        + '      <input class="otp-cell" type="text" inputmode="numeric" aria-label="인증번호 2번째 자리">\n'
        + '      <input class="otp-cell" type="text" inputmode="numeric" aria-label="인증번호 3번째 자리">\n'
        + '      <input class="otp-cell" type="text" inputmode="numeric" aria-label="인증번호 4번째 자리">\n'
        + '      <input class="otp-cell" type="text" inputmode="numeric" aria-label="인증번호 5번째 자리">\n'
        + '      <input class="otp-cell" type="text" inputmode="numeric" aria-label="인증번호 6번째 자리">\n'
        + '    </div>\n'
        + '    <p class="otp-status" id="otp-status" aria-live="polite">6자리 중 0자리 입력됨</p>\n'
        + '  </div>\n'
        + '</main>',
      css: '.otp-row { display: flex; gap: 8px; justify-content: center; }\n'
        + '.otp-cell { width: 44px; height: 54px; text-align: center; font: 700 22px/1 "Pretendard Variable","Pretendard",sans-serif; color: #fff; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.16); border-radius: 10px; outline: none; caret-color: #3b82f6; transition: border-color 0.18s ease-out, box-shadow 0.18s ease-out; }\n'
        + '.otp-cell:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.18); }\n'
        + '.otp-cell.is-filled { border-color: rgba(59,130,246,0.55); animation: otp-pop 0.22s cubic-bezier(0.34,1.56,0.64,1); }\n'
        + '@keyframes otp-pop { 0% { transform: scale(0.9); } 55% { transform: scale(1.07); } 100% { transform: scale(1); } }\n'
        + '.otp-row.is-complete .otp-cell { border-color: #22c55e; }\n'
        + '.otp-status { margin: 14px 0 0; font-size: 12px; text-align: center; color: rgba(255,255,255,0.4); transition: color 0.2s ease-out; }\n'
        + '.otp-status.is-complete { color: #4ade80; }',
      js: 'var row = document.getElementById("otp-row");\n'
        + 'var status = document.getElementById("otp-status");\n'
        + 'var cells = Array.prototype.slice.call(row.querySelectorAll(".otp-cell"));\n'
        + 'function refresh(){\n'
        + '  var filled = cells.filter(function(c){ return c.value; }).length;\n'
        + '  var done = filled === cells.length;\n'
        + '  row.classList.toggle("is-complete", done);\n'
        + '  status.classList.toggle("is-complete", done);\n'
        + '  status.textContent = done ? "인증 코드 확인 완료" : "6자리 중 " + filled + "자리 입력됨";\n'
        + '}\n'
        + 'cells.forEach(function(cell, i){\n'
        + '  cell.addEventListener("input", function(){\n'
        + '    cell.value = cell.value.replace(/\\D/g, "").slice(-1);\n'
        + '    cell.classList.remove("is-filled");\n'
        + '    if (cell.value) {\n'
        + '      void cell.offsetWidth;\n'
        + '      cell.classList.add("is-filled");\n'
        + '      if (i < cells.length - 1) cells[i + 1].focus();\n'
        + '    }\n'
        + '    refresh();\n'
        + '  });\n'
        + '  cell.addEventListener("keydown", function(e){\n'
        + '    if (e.key === "Backspace" && !cell.value && i > 0) {\n'
        + '      e.preventDefault();\n'
        + '      cells[i - 1].value = "";\n'
        + '      cells[i - 1].classList.remove("is-filled");\n'
        + '      cells[i - 1].focus();\n'
        + '      refresh();\n'
        + '    } else if (e.key === "ArrowLeft" && i > 0) {\n'
        + '      cells[i - 1].focus();\n'
        + '    } else if (e.key === "ArrowRight" && i < cells.length - 1) {\n'
        + '      cells[i + 1].focus();\n'
        + '    }\n'
        + '  });\n'
        + '});\n'
        + 'row.addEventListener("paste", function(e){\n'
        + '  e.preventDefault();\n'
        + '  var digits = (e.clipboardData.getData("text") || "").replace(/\\D/g, "").slice(0, cells.length).split("");\n'
        + '  cells.forEach(function(c, j){\n'
        + '    c.value = digits[j] || "";\n'
        + '    c.classList.toggle("is-filled", !!c.value);\n'
        + '  });\n'
        + '  if (digits.length) cells[Math.min(digits.length, cells.length) - 1].focus();\n'
        + '  refresh();\n'
        + '});',
      height: 480
    },
    snippetHTML: '<div class="otp-row" id="otp">\n  <input class="otp-cell" type="text" inputmode="numeric"\n         autocomplete="one-time-code" aria-label="인증번호 1번째 자리">\n  <!-- 같은 셀 x 6 (aria-label 자리만 변경) -->\n</div>\n<p aria-live="polite" id="status">6자리 중 0자리 입력됨</p>',
    snippetCSS: '.otp-row { display: flex; gap: 8px; }\n.otp-cell { width: 44px; height: 54px; text-align: center;\n  font: 700 22px/1 sans-serif;\n  border: 1px solid rgba(255,255,255,0.16); border-radius: 10px;\n  transition: border-color 0.18s ease-out; }\n.otp-cell:focus { border-color: #3b82f6; }\n.otp-cell.is-filled { border-color: rgba(59,130,246,0.55);\n  animation: otp-pop 0.22s cubic-bezier(0.34,1.56,0.64,1); }\n@keyframes otp-pop {\n  0% { transform: scale(0.9); }\n  55% { transform: scale(1.07); }\n  100% { transform: scale(1); } }',
    snippetJS: 'cells.forEach(function(cell, i){\n  cell.addEventListener("input", function(){\n    cell.value = cell.value.replace(/\\D/g, "").slice(-1);\n    cell.classList.toggle("is-filled", !!cell.value);\n    if (cell.value && i < cells.length - 1) cells[i + 1].focus();\n  });\n  cell.addEventListener("keydown", function(e){\n    if (e.key === "Backspace" && !cell.value && i > 0) {\n      e.preventDefault();\n      cells[i - 1].value = "";\n      cells[i - 1].focus();\n    }\n  });\n});',
    explain: '각 셀은 input 이벤트에서 숫자 1자리만 남기고(slice(-1)) 값이 생기면 다음 셀로 focus를 넘긴다. 채워진 셀은 is-filled 클래스가 spring 계열 pop(scale 0.9→1.07→1)을 재생 — void offsetWidth reflow로 같은 셀에 재입력해도 pop이 다시 뛴다. 빈 셀에서 Backspace를 누르면 이전 셀 값을 지우며 역방향 이동, 좌우 화살표 키 이동과 붙여넣기 6칸 분배까지 처리해야 실전 품질이 된다. 첫 셀의 autocomplete="one-time-code"가 iOS SMS 자동 채움을 활성화한다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (포커스 라우팅)' },
      { label: '트리거', value: 'input → 다음 칸 focus / Backspace → 이전 칸' },
      { label: '이징', value: 'cubic-bezier(0.34,1.56,0.64,1) — pop 스케일' },
      { label: 'duration', value: '220ms (pop) + 180ms (보더 전환)' },
      { label: '핵심', value: 'autocomplete="one-time-code" + 붙여넣기 분배' },
      { label: '접근성', value: '칸마다 aria-label "n번째 자리" + aria-live 진행 안내' }
    ],
    guide: '붙여넣기 처리(클립보드 숫자를 6칸에 분배)는 필수 — 사용자 다수가 SMS 코드를 복사해 붙여넣는다. inputmode="numeric"으로 모바일 숫자 키패드를 띄우고, type="number"는 스피너·지수 표기 문제가 있어 type="text"를 권장. 완료 시 자동 제출은 오입력 정정 기회를 뺏으므로 짧은 확인 단계를 두는 편이 안전하다.',
    recommendations: [
      { place: '히어로 헤더', body: '전화번호 간편 로그인 — 인증 단계 마찰 최소화' },
      { place: '랜딩 페이지', body: '가입 SMS 인증 — 자동 이동으로 입력 시간 단축' },
      { place: '제품 섹션', body: '결제 2차 인증 — 보안 단계의 명확한 진행 표시' },
      { place: '포트폴리오 소개', body: '데모 계정 발급 인증 — 완성도 있는 디테일' }
    ],
    tradeoff: 'JS 분량이 가장 많은 패턴(포커스 라우팅+붙여넣기+키보드). 스크린리더는 셀 6개를 각각 탐색해야 해 단일 input + 시각 분할 방식보다 접근성이 떨어질 수 있음 — aria-label과 aria-live 보강 필수.'
  },

  // ── 08. char-counter ──
  {
    id: 'char-counter', num: '08', title: '글자수 카운터',
    summary: 'textarea 우하단의 카운터와 원형 게이지가 입력량을 실시간 표시 — 한도 70%에서 노랑, 100%에서 빨강으로 경고 단계 전환.',
    demo: {
      hint: '글을 길게 입력해 보세요',
      bodyHTML: '<main class="stage">\n'
        + '  <div class="form-card">\n'
        + '    <h2 class="form-title">자기소개 입력</h2>\n'
        + '    <p class="form-desc">한도(80자)에 가까워지면 카운터와 게이지 색이 회색 → 노랑 → 빨강으로 바뀝니다.</p>\n'
        + '    <div class="field">\n'
        + '      <label class="field-label" for="cc-text">자기소개</label>\n'
        + '      <div class="cc-wrap">\n'
        + '        <textarea class="cc-area" id="cc-text" rows="4" maxlength="80" placeholder="80자 이내로 자유롭게 적어 주세요"></textarea>\n'
        + '        <div class="cc-meta" id="cc-meta" data-state="idle">\n'
        + '          <svg class="cc-gauge" viewBox="0 0 20 20" aria-hidden="true">\n'
        + '            <circle class="cc-track" cx="10" cy="10" r="8"/>\n'
        + '            <circle class="cc-fill" id="cc-fill" cx="10" cy="10" r="8"/>\n'
        + '          </svg>\n'
        + '          <span class="cc-count" id="cc-count" aria-live="polite">0 / 80</span>\n'
        + '        </div>\n'
        + '      </div>\n'
        + '    </div>\n'
        + '  </div>\n'
        + '</main>',
      css: '.cc-wrap { position: relative; }\n'
        + '.cc-area { width: 100%; resize: none; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.16); border-radius: 10px; padding: 13px 14px 36px; font: 500 14px/1.6 "Pretendard Variable","Pretendard",sans-serif; color: #fff; outline: none; caret-color: #3b82f6; transition: border-color 0.2s ease-out, box-shadow 0.2s ease-out; }\n'
        + '.cc-area::placeholder { color: rgba(255,255,255,0.28); }\n'
        + '.cc-area:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.18); }\n'
        + '.cc-meta { position: absolute; right: 12px; bottom: 12px; display: flex; align-items: center; gap: 6px; }\n'
        + '.cc-meta[data-state="max"] { animation: cc-bump 0.25s cubic-bezier(0.34,1.56,0.64,1); }\n'
        + '@keyframes cc-bump { 0% { transform: scale(0.88); } 100% { transform: scale(1); } }\n'
        + '.cc-gauge { width: 16px; height: 16px; transform: rotate(-90deg); }\n'
        + '.cc-track { fill: none; stroke: rgba(255,255,255,0.12); stroke-width: 3; }\n'
        + '.cc-fill { fill: none; stroke: rgba(255,255,255,0.45); stroke-width: 3; stroke-linecap: round; stroke-dasharray: 50.27; stroke-dashoffset: 50.27; transition: stroke-dashoffset 0.18s ease-out, stroke 0.24s ease-out; }\n'
        + '.cc-count { font-size: 11px; font-weight: 600; font-variant-numeric: tabular-nums; color: rgba(255,255,255,0.4); transition: color 0.24s ease-out; }\n'
        + '.cc-meta[data-state="warn"] .cc-fill { stroke: #f59e0b; }\n'
        + '.cc-meta[data-state="warn"] .cc-count { color: #fbbf24; }\n'
        + '.cc-meta[data-state="max"] .cc-fill { stroke: #ef4444; }\n'
        + '.cc-meta[data-state="max"] .cc-count { color: #f87171; }',
      js: 'var area = document.getElementById("cc-text");\n'
        + 'var meta = document.getElementById("cc-meta");\n'
        + 'var fill = document.getElementById("cc-fill");\n'
        + 'var count = document.getElementById("cc-count");\n'
        + 'var MAX = 80;\n'
        + 'var CIRC = 50.27;\n'
        + 'area.addEventListener("input", function(){\n'
        + '  var len = area.value.length;\n'
        + '  var ratio = Math.min(1, len / MAX);\n'
        + '  fill.style.strokeDashoffset = String(CIRC * (1 - ratio));\n'
        + '  count.textContent = len + " / " + MAX;\n'
        + '  meta.setAttribute("data-state", len >= MAX ? "max" : (ratio >= 0.7 ? "warn" : "idle"));\n'
        + '});',
      height: 480
    },
    snippetHTML: '<div class="cc-wrap">\n  <textarea id="bio" rows="4" maxlength="80"\n            placeholder="80자 이내로 적어 주세요"></textarea>\n  <div class="cc-meta" id="meta" data-state="idle">\n    <svg class="cc-gauge" viewBox="0 0 20 20" aria-hidden="true">\n      <circle class="cc-track" cx="10" cy="10" r="8"/>\n      <circle class="cc-fill" id="fill" cx="10" cy="10" r="8"/>\n    </svg>\n    <span class="cc-count" id="count" aria-live="polite">0 / 80</span>\n  </div>\n</div>',
    snippetCSS: '.cc-gauge { width: 16px; height: 16px; transform: rotate(-90deg); }\n.cc-track { fill: none; stroke: rgba(255,255,255,0.12); stroke-width: 3; }\n.cc-fill { fill: none; stroke: rgba(255,255,255,0.45);\n  stroke-width: 3; stroke-linecap: round;\n  stroke-dasharray: 50.27; /* 2 x PI x r(8) */\n  stroke-dashoffset: 50.27;\n  transition: stroke-dashoffset 0.18s ease-out, stroke 0.24s ease-out; }\n.cc-meta[data-state="warn"] .cc-fill { stroke: #f59e0b; }\n.cc-meta[data-state="max"] .cc-fill { stroke: #ef4444; }',
    snippetJS: 'var MAX = 80, CIRC = 50.27; // 2 x PI x r(8)\narea.addEventListener("input", function(){\n  var len = area.value.length;\n  var ratio = Math.min(1, len / MAX);\n  fill.style.strokeDashoffset = String(CIRC * (1 - ratio));\n  count.textContent = len + " / " + MAX;\n  meta.setAttribute("data-state",\n    len >= MAX ? "max" : (ratio >= 0.7 ? "warn" : "idle"));\n});',
    explain: '반지름 8의 circle 둘레(2πr ≈ 50.27)를 stroke-dasharray로 잡고, 입력 비율만큼 dashoffset을 줄여 원형 게이지를 채운다. rotate(-90deg)로 12시 방향에서 시작. 숫자 카운터는 font-variant-numeric: tabular-nums로 자릿수가 바뀌어도 폭이 흔들리지 않는다. 70% 도달 시 warn(노랑), 100% 도달 시 max(빨강) data-state로 전환하고, max 진입 순간 bump pop이 한 번 뛰어 한도 도달을 알린다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (길이 계산) + SVG circle' },
      { label: '트리거', value: 'input → dashoffset = 둘레 × (1 − len/max)' },
      { label: '이징', value: 'ease-out' },
      { label: 'duration', value: '180ms (게이지) + 240ms (색 전환)' },
      { label: '핵심', value: 'r=8 → 둘레 50.27 + data-state 3단계 (idle/warn/max)' },
      { label: '색 단계', value: '회색 → #f59e0b (70%+) → #ef4444 (100%)' }
    ],
    guide: '카운터는 한도가 가까워질 때만 강조하는 것이 정석 — 처음부터 빨간 숫자는 불안감만 준다(트위터의 원형 게이지가 표준 레퍼런스). maxlength로 하드 리밋을 걸되, 한국어 IME 조합 중에는 글자수가 출렁이므로 compositionend 이후 값으로 보정하면 더 정확하다. 카운터 위치는 textarea padding-bottom을 확보해 텍스트와 겹치지 않게.',
    recommendations: [
      { place: '히어로 헤더', body: '한 줄 소개 입력 모달 — 한도 인지로 재작성 방지' },
      { place: '랜딩 페이지', body: '사전 신청 사유 입력 — 적정 길이 유도' },
      { place: '제품 섹션', body: '리뷰 작성 폼 — 최소·최대 길이 동시 안내' },
      { place: '포트폴리오 소개', body: '문의 메시지 — 길이 제한 명시로 이탈 방지' }
    ],
    tradeoff: '글자수 기준이 코드포인트·자모 조합에 따라 서버와 다를 수 있음(이모지 2자 문제) — 서버와 동일한 카운팅 함수 공유 권장. 원형 게이지는 16px 이하에서는 식별 어려움.'
  },

  // ── 09. select-morph ──
  {
    id: 'select-morph', num: '09', title: '커스텀 셀렉트',
    summary: '네이티브 select를 대체하는 커스텀 드롭다운 — 열면 옵션이 위에서 아래로 stagger 진입하고, 선택하면 체크가 spring pop으로 찍힌 뒤 자동으로 접힘.',
    demo: {
      hint: '셀렉트를 열어 보세요',
      bodyHTML: '<main class="stage">\n'
        + '  <div class="form-card">\n'
        + '    <h2 class="form-title">관심 분야 선택</h2>\n'
        + '    <p class="form-desc">셀렉트를 열면 옵션이 차례로 내려오고, 선택하면 체크가 찍히며 접힙니다.</p>\n'
        + '    <div class="field">\n'
        + '      <span class="field-label" id="sm-caption">관심 분야</span>\n'
        + '      <div class="sm-select" id="sm-select">\n'
        + '        <button class="sm-trigger" id="sm-trigger" type="button" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="sm-caption sm-value">\n'
        + '          <span class="sm-value is-placeholder" id="sm-value">선택해 주세요</span>\n'
        + '          <svg class="sm-chevron" viewBox="0 0 12 8" fill="none" aria-hidden="true"><path d="M1 1.5l5 5 5-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>\n'
        + '        </button>\n'
        + '        <ul class="sm-list" id="sm-list" role="listbox" aria-labelledby="sm-caption">\n'
        + '          <li class="sm-option" role="option" aria-selected="false" tabindex="-1">인터랙션 디자인<svg class="sm-check" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></li>\n'
        + '          <li class="sm-option" role="option" aria-selected="false" tabindex="-1">프론트엔드 개발<svg class="sm-check" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></li>\n'
        + '          <li class="sm-option" role="option" aria-selected="false" tabindex="-1">브랜드 디자인<svg class="sm-check" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></li>\n'
        + '          <li class="sm-option" role="option" aria-selected="false" tabindex="-1">콘텐츠 마케팅<svg class="sm-check" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></li>\n'
        + '        </ul>\n'
        + '      </div>\n'
        + '    </div>\n'
        + '  </div>\n'
        + '</main>',
      css: '.sm-select { position: relative; }\n'
        + '.sm-trigger { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.16); border-radius: 10px; padding: 13px 14px; font: 500 15px/1.4 "Pretendard Variable","Pretendard",sans-serif; color: #fff; cursor: pointer; outline: none; text-align: left; transition: border-color 0.2s ease-out, box-shadow 0.2s ease-out; }\n'
        + '.sm-select.is-open .sm-trigger, .sm-trigger:focus-visible { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.18); }\n'
        + '.sm-value.is-placeholder { color: rgba(255,255,255,0.35); }\n'
        + '.sm-chevron { width: 12px; height: 8px; flex: none; color: rgba(255,255,255,0.45); transition: transform 0.2s cubic-bezier(0.25,0.46,0.45,0.94); }\n'
        + '.sm-select.is-open .sm-chevron { transform: rotate(180deg); }\n'
        + '.sm-list { position: absolute; top: calc(100% + 6px); left: 0; right: 0; z-index: 10; margin: 0; padding: 6px; list-style: none; background: #141414; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; box-shadow: 0 16px 40px -12px rgba(0,0,0,0.8); opacity: 0; transform: translateY(-6px) scale(0.98); transform-origin: top center; pointer-events: none; transition: opacity 0.18s ease-out, transform 0.18s cubic-bezier(0.25,0.46,0.45,0.94); }\n'
        + '.sm-select.is-open .sm-list { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }\n'
        + '.sm-option { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 10px; border-radius: 8px; font: 500 14px/1.4 "Pretendard Variable","Pretendard",sans-serif; color: rgba(255,255,255,0.75); cursor: pointer; transition: background 0.15s ease-out, color 0.15s ease-out; }\n'
        + '.sm-option:hover { background: rgba(255,255,255,0.07); color: #fff; }\n'
        + '.sm-select.is-open .sm-option { animation: sm-in 0.22s cubic-bezier(0.25,0.46,0.45,0.94) both; }\n'
        + '.sm-select.is-open .sm-option:nth-child(2) { animation-delay: 0.045s; }\n'
        + '.sm-select.is-open .sm-option:nth-child(3) { animation-delay: 0.09s; }\n'
        + '.sm-select.is-open .sm-option:nth-child(4) { animation-delay: 0.135s; }\n'
        + '@keyframes sm-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }\n'
        + '.sm-option.is-selected { color: #fff; }\n'
        + '.sm-check { width: 16px; height: 16px; flex: none; color: #3b82f6; opacity: 0; transform: scale(0.5); transition: opacity 0.18s ease-out, transform 0.18s cubic-bezier(0.34,1.56,0.64,1); }\n'
        + '.sm-option.is-selected .sm-check { opacity: 1; transform: scale(1); }',
      js: 'var select = document.getElementById("sm-select");\n'
        + 'var trigger = document.getElementById("sm-trigger");\n'
        + 'var valueEl = document.getElementById("sm-value");\n'
        + 'var options = Array.prototype.slice.call(select.querySelectorAll(".sm-option"));\n'
        + 'var closeTimer = null;\n'
        + 'function setOpen(open){\n'
        + '  select.classList.toggle("is-open", open);\n'
        + '  trigger.setAttribute("aria-expanded", open ? "true" : "false");\n'
        + '}\n'
        + 'trigger.addEventListener("click", function(){\n'
        + '  setOpen(!select.classList.contains("is-open"));\n'
        + '});\n'
        + 'options.forEach(function(opt){\n'
        + '  opt.addEventListener("click", function(){\n'
        + '    options.forEach(function(o){\n'
        + '      o.classList.remove("is-selected");\n'
        + '      o.setAttribute("aria-selected", "false");\n'
        + '    });\n'
        + '    opt.classList.add("is-selected");\n'
        + '    opt.setAttribute("aria-selected", "true");\n'
        + '    valueEl.textContent = opt.textContent.trim();\n'
        + '    valueEl.classList.remove("is-placeholder");\n'
        + '    clearTimeout(closeTimer);\n'
        + '    closeTimer = setTimeout(function(){ setOpen(false); }, 220);\n'
        + '  });\n'
        + '});\n'
        + 'document.addEventListener("click", function(e){\n'
        + '  if (!select.contains(e.target)) setOpen(false);\n'
        + '});\n'
        + 'window.__resetDemo = function(){\n'
        + '  clearTimeout(closeTimer);\n'
        + '  options.forEach(function(o){\n'
        + '    o.classList.remove("is-selected");\n'
        + '    o.setAttribute("aria-selected", "false");\n'
        + '  });\n'
        + '  valueEl.textContent = "선택해 주세요";\n'
        + '  valueEl.classList.add("is-placeholder");\n'
        + '  setOpen(false);\n'
        + '};',
      height: 520
    },
    snippetHTML: '<div class="sm-select" id="select">\n  <button class="sm-trigger" type="button"\n          aria-haspopup="listbox" aria-expanded="false">\n    <span class="sm-value is-placeholder" id="value">선택해 주세요</span>\n    <svg class="sm-chevron" viewBox="0 0 12 8"><path d="M1 1.5l5 5 5-5"/></svg>\n  </button>\n  <ul class="sm-list" role="listbox">\n    <li class="sm-option" role="option" aria-selected="false">\n      인터랙션 디자인 <svg class="sm-check" viewBox="0 0 24 24">…</svg>\n    </li>\n    <!-- 옵션 반복 -->\n  </ul>\n</div>',
    snippetCSS: '.sm-list { position: absolute; top: calc(100% + 6px);\n  opacity: 0; transform: translateY(-6px) scale(0.98);\n  pointer-events: none;\n  transition: opacity 0.18s ease-out,\n    transform 0.18s cubic-bezier(0.25,0.46,0.45,0.94); }\n.sm-select.is-open .sm-list {\n  opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }\n.sm-select.is-open .sm-option {\n  animation: sm-in 0.22s cubic-bezier(0.25,0.46,0.45,0.94) both; }\n.sm-select.is-open .sm-option:nth-child(2) { animation-delay: 0.045s; }\n.sm-select.is-open .sm-option:nth-child(3) { animation-delay: 0.09s; }\n@keyframes sm-in {\n  from { opacity: 0; transform: translateY(-6px); }\n  to { opacity: 1; transform: translateY(0); } }\n.sm-option.is-selected .sm-check { opacity: 1; transform: scale(1); }',
    snippetJS: 'trigger.addEventListener("click", function(){\n  setOpen(!select.classList.contains("is-open"));\n});\noptions.forEach(function(opt){\n  opt.addEventListener("click", function(){\n    options.forEach(function(o){ o.setAttribute("aria-selected", "false"); });\n    opt.classList.add("is-selected");\n    opt.setAttribute("aria-selected", "true");\n    valueEl.textContent = opt.textContent.trim();\n    setTimeout(function(){ setOpen(false); }, 220); // 체크 pop 노출 후 접힘\n  });\n});',
    explain: '리스트 컨테이너는 opacity + translateY + scale 3종 전환으로 떠오르고, 내부 옵션은 is-open 시 sm-in 애니메이션을 nth-child별 45ms 간격 delay로 재생해 stagger 진입을 만든다(transition-delay 대신 animation-delay를 쓰면 hover 같은 다른 전환에 delay가 전염되지 않음). 옵션을 클릭하면 체크가 spring pop(scale 0.5→1)으로 찍히고, 220ms 뒤에 닫아 체크가 보이는 시간을 확보한다. 바깥 클릭 감지로 닫힘 처리.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (open/select 상태) + CSS stagger' },
      { label: '트리거', value: '클릭 → .is-open / 옵션 클릭 → 선택 후 220ms 뒤 접힘' },
      { label: '이징', value: 'cubic-bezier(0.25,0.46,0.45,0.94) + spring 체크 pop' },
      { label: 'duration', value: '220ms (옵션 진입) + 항목당 45ms stagger' },
      { label: '핵심', value: 'animation-delay nth-child stagger — transition 전염 방지' },
      { label: '접근성', value: 'role="listbox/option" + aria-expanded + aria-selected' }
    ],
    guide: 'stagger 간격은 30~60ms, 옵션 6개 초과 시 뒷부분은 delay를 묶어 전체 열림이 350ms를 넘지 않게 한다. 네이티브 select의 키보드 동작(화살표 탐색, 문자 점프, Esc 닫기)을 재현해야 진짜 대체재가 된다 — 데모는 클릭 중심이므로 실서비스에서는 키보드 핸들러 보강 필수. 모바일에서는 네이티브 select를 그대로 쓰는 분기가 UX상 유리한 경우가 많다.',
    recommendations: [
      { place: '히어로 헤더', body: '언어·지역 선택 드롭다운 — 브랜드 톤 유지' },
      { place: '랜딩 페이지', body: '가입 폼 직군·규모 선택 — 옵션 변화가 즐거운 선택' },
      { place: '제품 섹션', body: '필터·정렬 셀렉트 — 선택 상태 체크 명시' },
      { place: '포트폴리오 소개', body: '문의 유형 선택 — 폼 전체 톤과 통일' }
    ],
    tradeoff: '네이티브 select 대비 접근성·키보드·모바일 대응 비용이 큼. 옵션이 많으면 stagger가 오히려 느리게 느껴짐 — 8개 이상이면 stagger 생략 권장.'
  },

  // ── 10. submit-morph ──
  {
    id: 'submit-morph', num: '10', title: '제출 버튼 모핑',
    summary: '제출 버튼이 클릭 후 원형(52px)으로 수축해 스피너가 돌고, 완료되면 다시 펼쳐지며 체크 드로잉 + "전송 완료" 라벨 — idle→loading→done 3상태 머신.',
    demo: {
      hint: '제출 버튼을 눌러 보세요',
      bodyHTML: '<main class="stage">\n'
        + '  <div class="form-card">\n'
        + '    <h2 class="form-title">문의 보내기</h2>\n'
        + '    <p class="form-desc">제출 버튼이 원형으로 수축해 스피너가 돌고, 완료되면 체크와 함께 다시 펼쳐집니다.</p>\n'
        + '    <div class="field">\n'
        + '      <label class="field-label" for="sb-email">회신 받을 이메일</label>\n'
        + '      <input class="text-input" id="sb-email" type="email" placeholder="you@example.com" autocomplete="off">\n'
        + '    </div>\n'
        + '    <button class="sb-btn" id="sb-btn" type="button" data-state="idle">\n'
        + '      <span class="sb-spinner" aria-hidden="true"></span>\n'
        + '      <svg class="sb-check" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>\n'
        + '      <span class="sb-label" id="sb-label">제출하기</span>\n'
        + '    </button>\n'
        + '    <p class="sr-only" id="sb-status" aria-live="polite"></p>\n'
        + '  </div>\n'
        + '</main>',
      css: '.sb-btn { position: relative; display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; height: 52px; margin-top: 6px; border: 0; border-radius: 26px; background: #3b82f6; color: #fff; font: 600 15px/1 "Pretendard Variable","Pretendard",sans-serif; cursor: pointer; overflow: hidden; transition: width 0.3s cubic-bezier(0.25,0.46,0.45,0.94), background 0.25s ease-out, transform 0.15s ease-out; }\n'
        + '.sb-btn:hover { background: #2563eb; }\n'
        + '.sb-btn:active { transform: scale(0.985); }\n'
        + '.sb-btn[data-state="loading"], .sb-btn[data-state="done"] { pointer-events: none; }\n'
        + '.sb-btn[data-state="done"] { background: #22c55e; }\n'
        + '.sb-label { white-space: nowrap; transition: opacity 0.15s ease-out; }\n'
        + '.sb-btn[data-state="loading"] .sb-label { opacity: 0; position: absolute; }\n'
        + '.sb-spinner { position: absolute; inset: 0; margin: auto; width: 22px; height: 22px; border: 2.5px solid rgba(255,255,255,0.35); border-top-color: #fff; border-radius: 50%; opacity: 0; transition: opacity 0.15s ease-out; }\n'
        + '.sb-btn[data-state="loading"] .sb-spinner { opacity: 1; animation: sb-spin 0.7s linear infinite; }\n'
        + '@keyframes sb-spin { to { transform: rotate(360deg); } }\n'
        + '.sb-check { display: none; width: 20px; height: 20px; }\n'
        + '.sb-btn[data-state="done"] .sb-check { display: block; }\n'
        + '.sb-check path { stroke-dasharray: 21; stroke-dashoffset: 21; }\n'
        + '.sb-btn[data-state="done"] .sb-check path { animation: sb-draw 0.35s cubic-bezier(0.25,0.46,0.45,0.94) 0.15s forwards; }\n'
        + '@keyframes sb-draw { to { stroke-dashoffset: 0; } }\n'
        + '.sr-only { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }',
      js: 'var btn = document.getElementById("sb-btn");\n'
        + 'var label = document.getElementById("sb-label");\n'
        + 'var status = document.getElementById("sb-status");\n'
        + 'var doneTimer = null;\n'
        + 'btn.addEventListener("click", function(){\n'
        + '  if (btn.getAttribute("data-state") !== "idle") return;\n'
        + '  var w = btn.offsetWidth;\n'
        + '  btn.style.width = w + "px";\n'
        + '  void btn.offsetWidth;\n'
        + '  btn.setAttribute("data-state", "loading");\n'
        + '  btn.setAttribute("aria-busy", "true");\n'
        + '  status.textContent = "전송 중";\n'
        + '  btn.style.width = "52px";\n'
        + '  doneTimer = setTimeout(function(){\n'
        + '    btn.setAttribute("data-state", "done");\n'
        + '    btn.removeAttribute("aria-busy");\n'
        + '    btn.style.width = w + "px";\n'
        + '    label.textContent = "전송 완료";\n'
        + '    status.textContent = "전송 완료";\n'
        + '  }, 1500);\n'
        + '});\n'
        + 'window.__resetDemo = function(){\n'
        + '  clearTimeout(doneTimer);\n'
        + '  btn.setAttribute("data-state", "idle");\n'
        + '  btn.removeAttribute("aria-busy");\n'
        + '  btn.style.width = "";\n'
        + '  label.textContent = "제출하기";\n'
        + '  status.textContent = "";\n'
        + '};',
      height: 480
    },
    snippetHTML: '<button class="sb-btn" id="submit" type="button" data-state="idle">\n  <span class="sb-spinner" aria-hidden="true"></span>\n  <svg class="sb-check" viewBox="0 0 24 24" fill="none" aria-hidden="true">\n    <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor"\n          stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>\n  </svg>\n  <span class="sb-label" id="label">제출하기</span>\n</button>\n<p class="sr-only" aria-live="polite" id="status"></p>',
    snippetCSS: '.sb-btn { width: 100%; height: 52px; border-radius: 26px;\n  overflow: hidden;\n  transition: width 0.3s cubic-bezier(0.25,0.46,0.45,0.94),\n    background 0.25s ease-out; }\n.sb-btn[data-state="done"] { background: #22c55e; }\n.sb-btn[data-state="loading"] .sb-label { opacity: 0; position: absolute; }\n.sb-btn[data-state="loading"] .sb-spinner {\n  opacity: 1; animation: sb-spin 0.7s linear infinite; }\n@keyframes sb-spin { to { transform: rotate(360deg); } }\n.sb-check path { stroke-dasharray: 21; stroke-dashoffset: 21; }\n.sb-btn[data-state="done"] .sb-check path {\n  animation: sb-draw 0.35s ease-out 0.15s forwards; }\n@keyframes sb-draw { to { stroke-dashoffset: 0; } }',
    snippetJS: 'btn.addEventListener("click", function(){\n  if (btn.getAttribute("data-state") !== "idle") return;\n  var w = btn.offsetWidth;\n  btn.style.width = w + "px";   // %는 px과 보간 불가 — 먼저 px 고정\n  void btn.offsetWidth;         // reflow\n  btn.setAttribute("data-state", "loading");\n  btn.setAttribute("aria-busy", "true");\n  btn.style.width = "52px";     // 높이와 같은 값 → 원형\n  // fetch(...).then(function(){\n  btn.setAttribute("data-state", "done");\n  btn.style.width = w + "px";\n  label.textContent = "전송 완료";\n  // });\n});',
    explain: 'width 100%는 52px과 직접 보간되지 않으므로(%↔px), 클릭 시점에 offsetWidth를 읽어 px로 고정한 뒤 52px(=height)로 줄여 완전한 원을 만든다. loading 상태에서는 라벨을 숨기고 절대 배치 스피너가 회전. 완료되면 width를 원래 px로 되돌리며 배경을 초록으로, 체크를 stroke 드로잉으로, 라벨을 "전송 완료"로 교체한다. 상태는 data-state 속성 하나로 관리하는 3상태 머신(idle→loading→done)이고, 시각 효과와 별개로 aria-busy와 aria-live 텍스트가 상태를 보조 기기에 전달한다.',
    kv: [
      { label: '의존성', value: 'Vanilla JS (3상태 머신: idle→loading→done)' },
      { label: '트리거', value: '클릭 → width를 px로 고정 후 52px로 수축' },
      { label: '이징', value: 'cubic-bezier(0.25,0.46,0.45,0.94) (width) + linear (스피너)' },
      { label: 'duration', value: '300ms (모핑) + 0.7s/회전 (스피너) + 350ms (체크)' },
      { label: '핵심', value: '% → px 변환 후 width transition (%↔px는 보간 불가)' },
      { label: '접근성', value: 'aria-busy="true" (로딩) + aria-live 상태 텍스트' }
    ],
    guide: '실서비스에서는 setTimeout 자리에 fetch Promise를 넣고, 실패 시 idle로 되돌리며 에러 메시지를 표시하는 4번째 분기(error)를 추가한다. 로딩이 300ms 이내로 끝나면 스피너가 깜빡하고 사라져 오히려 어색하므로 최소 표시 시간(500ms)을 보장하는 처리가 좋다. 중복 제출 방지(pointer-events 차단 + 상태 가드)는 이 패턴의 기능적 본질.',
    recommendations: [
      { place: '히어로 헤더', body: '뉴스레터 구독 버튼 — 구독 완료를 버튼 안에서 종결' },
      { place: '랜딩 페이지', body: '사전 신청 제출 — 페이지 이동 없는 완료 피드백' },
      { place: '제품 섹션', body: '결제·주문 확정 버튼 — 중복 클릭 원천 차단' },
      { place: '포트폴리오 소개', body: '문의 전송 버튼 — 마이크로 인터랙션 완성도 과시' }
    ],
    tradeoff: '버튼 폭이 줄어드는 동안 주변 레이아웃이 흔들리지 않도록 부모 정렬 주의(중앙 정렬 컨테이너 권장). 상태 머신 관리가 필요해 CSS 단독 패턴보다 유지보수 비용 높음. 데모의 1.5초 타이머는 시연용 — 실전은 네트워크 응답 기준.'
  }
];

/* ================================================================
   Standalone demo HTML 빌더
   ================================================================ */

function buildDemoHTML(p) {
  return '<!DOCTYPE html>\n'
    + '<html lang="ko">\n'
    + '<head>\n'
    + '  <meta charset="UTF-8">\n'
    + '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
    + '  <title>' + p.num + '. ' + p.title + ' — Form Input Micro Demo</title>\n'
    + '  <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable-dynamic-subset.min.css" rel="stylesheet">\n'
    + '  <style>\n'
    + '    * { box-sizing: border-box; }\n'
    + '    html, body { margin: 0; padding: 0; }\n'
    + '    body { background: #000; color: #fff; font-family: "Pretendard Variable","Pretendard",sans-serif; -webkit-font-smoothing: antialiased; }\n'
    + '    .demo-controls { position: fixed; top: 16px; left: 16px; display: inline-flex; align-items: center; gap: 10px; z-index: 100; }\n'
    + '    .demo-reset { font: 600 11px/1 "Pretendard Variable","Pretendard",sans-serif; color: rgba(255,255,255,0.75); background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.14); border-radius: 999px; padding: 8px 14px; cursor: pointer; transition: background 0.2s ease, color 0.2s ease; }\n'
    + '    .demo-reset:hover { background: rgba(255,255,255,0.16); color: #fff; }\n'
    + '    .demo-label { font: 500 10px/1 "Pretendard Variable","Pretendard",sans-serif; color: rgba(255,255,255,0.35); letter-spacing: 0.14em; text-transform: uppercase; }\n'
    + '    .demo-hint { position: fixed; right: 16px; bottom: 24px; font: 500 11px/1.4 "Pretendard Variable","Pretendard",sans-serif; color: rgba(255,255,255,0.35); letter-spacing: 0.04em; z-index: 100; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 999px; padding: 8px 14px; animation: hint-pulse 2.4s ease-in-out infinite; }\n'
    + '    @keyframes hint-pulse { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }\n'
    + '    ' + BASE_CSS.replace(/\n/g, '\n    ') + '\n'
    + '    ' + p.demo.css.replace(/\n/g, '\n    ') + '\n'
    + '  </style>\n'
    + '</head>\n'
    + '<body>\n'
    + '  <div class="demo-controls">\n'
    + '    <button class="demo-reset" type="button" onclick="window.__reset && window.__reset()">↻ 다시 보기</button>\n'
    + '    <span class="demo-label">' + p.num + ' · ' + p.title + '</span>\n'
    + '  </div>\n'
    + '  <div class="demo-hint">' + p.demo.hint + '</div>\n'
    + '\n'
    + '  ' + p.demo.bodyHTML.replace(/\n/g, '\n  ') + '\n'
    + '\n'
    + '  <script>\n'
    + '    (function(){\n'
    + (p.demo.js ? '      ' + p.demo.js.replace(/\n/g, '\n      ') + '\n' : '')
    + '      window.__reset = function(){\n'
    + '        document.querySelectorAll("input, textarea").forEach(function(el){\n'
    + '          el.value = "";\n'
    + '          el.dispatchEvent(new Event("input", { bubbles: true }));\n'
    + '          el.blur();\n'
    + '        });\n'
    + '        if (window.__resetDemo) window.__resetDemo();\n'
    + '      };\n'
    + '    })();\n'
    + '  </script>\n'
    + '</body>\n'
    + '</html>\n';
}

/* ================================================================
   분석 보고서 블록 빌더 (표준 15 블록)
   ================================================================ */

function buildPatternSection(p) {
  return {
    title: p.num + '. ' + p.title,
    blocks: [
      { type: 'text', value: p.summary },
      { type: 'heading', value: '라이브 데모' },
      {
        type: 'component',
        embed: 'demos/form-input-micro/' + p.id + '.html',
        embedHeight: p.demo.height || 480,
        embedLabel: p.num + ' · ' + p.title,
        title: p.title + ' 라이브 데모'
      },
      { type: 'heading', value: '작동 원리' },
      { type: 'text', value: p.explain },
      { type: 'kv', columns: 2, items: p.kv },
      { type: 'heading', value: '코드 스니펫' },
      { type: 'code', lang: 'HTML', title: 'HTML', value: p.snippetHTML },
      { type: 'code', lang: 'CSS', title: 'CSS', value: p.snippetCSS },
      { type: 'code', lang: 'JS', title: 'JavaScript', value: p.snippetJS },
      { type: 'heading', value: '사용 가이드' },
      { type: 'text', value: p.guide },
      { type: 'heading', value: '활용 추천' },
      {
        type: 'structure',
        items: p.recommendations.map(function (r) { return { label: r.place, tag: '', desc: r.body }; })
      },
      { type: 'note', value: '트레이드오프 — ' + p.tradeoff }
    ]
  };
}

function buildOverview() {
  var indexItems = PATTERNS.map(function (p) {
    return {
      label: p.num + '. ' + p.title,
      tag: p.kv.find(function (k) { return k.label === '의존성'; })?.value || '',
      desc: p.summary
    };
  });

  return {
    title: '00. 카테고리 개요',
    blocks: [
      { type: 'heading', value: '폼 인풋 마이크로 인터랙션 — Material 3 Text Fields 기반 10종 패턴' },
      { type: 'text', value: CATEGORY.summary },
      { type: 'heading', value: '10 패턴 인덱스' },
      { type: 'structure', items: indexItems },
      { type: 'heading', value: '공통 디자인 토큰' },
      {
        type: 'kv', columns: 2, items: [
          { label: '폰트', value: 'Pretendard Variable 500~700' },
          { label: '배경', value: '#000 (body) + #0d0d0d (폼 카드)' },
          { label: '시맨틱 컬러', value: '#3b82f6 (포커스) / #ef4444 (에러) / #22c55e (성공)' },
          { label: '인풋 transition', value: '180~240ms ease-out (권장 구간)' },
          { label: '이징 참고', value: 'linear.app 0.1s cubic-bezier(0.25,0.46,0.45,0.94)' },
          { label: '포커스 링', value: 'border-color + box-shadow 0 0 0 3px rgba(59,130,246,0.18)' },
          { label: '접근성', value: 'label[for] · aria-invalid · aria-live (에러/상태 메시지)' },
          { label: '참고', value: 'Material 3 Text Fields / stripe.com 폼 표준' }
        ]
      },
      { type: 'heading', value: '읽기 가이드' },
      {
        type: 'structure', items: [
          { label: '라이브 데모', tag: 'IFRAME', desc: 'demos/form-input-micro/{pattern}.html — 직접 타이핑·클릭하면 즉시 반응' },
          { label: '작동 원리', tag: 'HOW', desc: '포커스/입력/검증 이벤트 → CSS 상태 클래스 / JS 상태 머신' },
          { label: '정량 메타', tag: 'KV', desc: '의존성 / 트리거 / 이징 / duration / 핵심 메커니즘 / 접근성' },
          { label: '코드 스니펫', tag: 'CODE', desc: 'HTML / CSS / JS — 패턴별 핵심 코드' },
          { label: '사용 가이드', tag: 'GUIDE', desc: '파라미터·IME·reduced-motion·검증 정책 주의점' },
          { label: '활용 추천', tag: 'PLACES', desc: '히어로 / 랜딩 / 제품 / 포트폴리오 4건' },
          { label: '트레이드오프', tag: 'NOTE', desc: '성능·접근성·권장 사용처' }
        ]
      },
      {
        type: 'note',
        value: 'Material 3 Text Fields 가이드를 기준 레퍼런스로 삼고, stripe.com 폼 표준과 linear.app 실측 이징(0.1s cubic-bezier(0.25,0.46,0.45,0.94))을 토큰에 반영. 모든 데모는 검정 배경(#000) + Pretendard Variable + 한국어 라벨이며, 사용자가 직접 입력해 보는 실입력 구조 — ↻ 다시 보기 버튼이 폼을 초기 상태로 되돌린다.'
      }
    ]
  };
}

/* ================================================================
   메인
   ================================================================ */

function main() {
  mkdirSync(DEMO_DIR, { recursive: true });
  for (var p of PATTERNS) {
    writeFileSync(join(DEMO_DIR, p.id + '.html'), buildDemoHTML(p), 'utf-8');
    console.log('✓ demos/form-input-micro/' + p.id + '.html');
  }

  var sections = { overview: buildOverview() };
  for (var p of PATTERNS) sections[p.id] = buildPatternSection(p);

  var analysis = {
    id: CATEGORY.id,
    title: CATEGORY.title,
    type: CATEGORY.type,
    url: CATEGORY.url,
    date: CATEGORY.date,
    summary: CATEGORY.summary,
    patternCount: PATTERNS.length,
    sections: sections
  };
  mkdirSync(ANALYSIS_DIR, { recursive: true });
  writeFileSync(ANALYSIS_FILE, JSON.stringify(analysis, null, 2), 'utf-8');
  console.log('✓ analyses/form-input-micro/analysis.json');
  console.log('  ' + PATTERNS.length + ' patterns + 1 overview = ' + (PATTERNS.length + 1) + ' sections');
  var totalBlocks = Object.values(sections).reduce(function (acc, s) { return acc + s.blocks.length; }, 0);
  console.log('  ' + totalBlocks + ' blocks total');
}

main();
