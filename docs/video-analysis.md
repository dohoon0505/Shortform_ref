# 영상 분석 방법 — 힉스필드(Higgsfield) MCP

> **이 저장소에서 영상 분석은 항상 힉스필드 MCP를 사용합니다.**
> Claude(또는 다른 AI 에이전트)가 기준 영상을 분석하는 작업을 할 때는 반드시 이 문서의 절차를 따르세요.

---

## 원칙

1. **영상 파일은 저장소에 저장하지 않습니다.** 기준 영상은 `templates.json`의 `reference.url`로만 참조하고, 화면에는 임베드(`.mp4` → `<video>`, 그 외 → `<iframe>`)로 보여줍니다.
2. **장면 분석은 힉스필드 MCP의 `video_analysis_*` 도구로 수행합니다.** 직접 프레임을 추측하거나 다른 도구로 대체하지 않습니다.
3. **분석 결과는 템플릿의 프롬프트와 결합해 사용합니다.** 힉스필드가 뽑아준 장면별(scene-by-scene) 정보가 저장된 프롬프트의 `[영상 스크립트/자막 붙여넣기]` 자리에 들어가는 입력이 됩니다.

---

## 분석 절차

### A. CDN 등 직접 영상 URL (`.mp4` — 이 저장소의 기본 케이스)

`templates.json` → 해당 템플릿의 `reference.url`을 가져온 뒤:

```
1. media_import_url        { url: "<reference.url>", type: "video" }
   → 힉스필드 저장소로 가져오기. 반환된 media_id 를 확보한다. (URL 최대 50MB)

2. video_analysis_create   { video_input_id: "<media_id>" }
   → 즉시 status='queued' 로 반환. video_analyze_id 를 확보한다.

3. video_analysis_status   { video_analyze_id: "<id>" }
   → 30~60초 간격으로 폴링. 보통 3~5분 소요.
   → status='completed' 이면 scenes(장면별 분석)가 채워짐.
   → status='failed' 이면 fail_reason 확인.
```

### B. YouTube 링크

`media_import_url` 없이 바로:

```
video_analysis_create { youtube_url: "https://youtu.be/..." }  → 이후 폴링 동일
```

### 과거 분석 조회

같은 영상을 다시 분석하기 전에 `video_analysis_jobs`(최신순 목록)로 **이미 완료된 분석이 있는지 먼저 확인**하세요. 있으면 재사용하고, 불필요한 중복 분석(크레딧 소모)을 피합니다.

---

## 주의사항

- **짧은 영상일수록 정확합니다.** 영상이 길수록 장면 단위 분석 정확도가 떨어집니다. 숏폼(<60초)이 이상적이며, 긴 영상 분석을 요청받으면 이 한계를 사용자에게 먼저 안내하세요.
- `media_import_url`은 **50MB URL 페이로드 제한**이 있습니다. 초과 시 사용자에게 알리고 대안(YouTube 업로드 링크 등)을 논의하세요.
- 폴링은 30~60초 간격으로. 그보다 짧게 두드리지 않습니다.

---

## 분석 결과 → 템플릿 프롬프트 결합

힉스필드 분석이 완료되면, 결과(장면별 타임코드·화면 묘사·자막/대사)를 다음처럼 사용합니다.

| 저장된 프롬프트 항목 | 힉스필드 결과에서 가져올 것 |
| --- | --- |
| `hook` (후킹 분석) | 첫 1~3개 장면의 화면 묘사 + 도입부 자막/대사 |
| `structure` (구성·전개) | 전체 장면 목록(타임코드 포함) — 구간 나누기의 원자료 |
| `script` (카피·스크립트) | 장면별 대사·자막 텍스트 전체 |
| `edit` (편집·비주얼 리듬) | 장면 전환 횟수·길이, 화면 묘사(컷 밀도·연출 추정 근거) |
| `remix` (내 주제로 재현) | 위 4개 분석의 요약 + 사용자의 `[내 주제]` |

**작업 흐름 예시** — 사용자가 "후킹 폭발형 템플릿의 기준 영상 분석해줘"라고 하면:

1. `templates.json`에서 `tpl-hook-explosive`의 `reference.url` 확인
2. `video_analysis_jobs`로 기존 분석 유무 확인 → 없으면 절차 A 실행
3. 완료된 scenes를 해당 템플릿의 프롬프트 자리표시자에 채워 분석 수행
4. 결과를 사용자에게 전달 (필요 시 remix 프롬프트로 기획안까지)

---

## 기준 영상 현황 (v1.1.0)

| 템플릿 | 기준 영상 |
| --- | --- |
| `tpl-hook-explosive` | `…/videos/d0bf4ab4-a66c-415d-869c-3c7814264f93.mp4` |
| `tpl-story-narrative-twist` | `…/videos/370147f8-f6b4-4af6-81e0-9323b6f4a000.mp4` |
| `tpl-info-tutorial` | `…/videos/83134adf-85ab-4795-816f-c3e29ea6bfaf.mp4` |
| `tpl-ugc-review-native` | `…/videos/9e8d3a53-ff01-4843-b502-ba9fb4566657.mp4` |
| `tpl-meme-trend-challenge` | `…/videos/65b143e9-6a33-4a63-b327-095626618e01.mp4` |

전체 URL은 [templates.json](../templates.json)의 `reference.url`이 정본입니다. 이 표는 참고용 스냅샷이며, 불일치 시 JSON을 따릅니다.
