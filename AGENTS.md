# AGENTS.md — AI 에이전트 진입점

> **대상**: LLM · 에이전트 · 자동화 도구. 이 저장소(**숏폼 연구소 · 템플릿 저장공간**)를 **읽고 · 찾고 · 수정**할 때 이 문서부터 보면 대부분의 작업을 **1 파일 read**로 해결할 수 있습니다.
>
> **사람 읽기용**: [README.md](README.md) · **기여 워크플로**: [CLAUDE.md](CLAUDE.md)

---

## 이 저장소는 무엇인가

기준 숏폼 영상 하나를 정하고, 그 영상을 **후킹·구성·카피·편집** 항목별로 해부하는 **분석 프롬프트**를 저장·복사해 쓰는 아카이브. 화면은 프레임워크 없이 바닐라 HTML/CSS/JS로 동작하며, **모든 데이터는 [`templates.json`](templates.json) 한 파일**에 있습니다.

## 1-read 규칙

| 찾는 것 | 보는 곳 |
| --- | --- |
| **모든 템플릿 데이터** (기준영상·프롬프트·장단점) | [`templates.json`](templates.json) ★ |
| 특정 템플릿 | `templates.json` → `templates[]` 에서 `id`로 검색 |
| 아키타입(카테고리) 목록 | `templates.json` → `archetypes[]` |
| 프롬프트 항목 규격 | `templates.json` → `meta.promptItems[]` |
| 렌더링·복사·필터 로직 | [`assets/js/main.js`](assets/js/main.js) |
| 스타일·토큰(라이트/다크) | [`assets/css/main.css`](assets/css/main.css) |
| **영상 분석 방법 (힉스필드 MCP)** | [`docs/video-analysis.md`](docs/video-analysis.md) ★ 분석 작업 전 필독 |
| 무결성 검증 | `node scripts/validate.mjs` |

## 데이터 스키마 (`templates.json`)

```jsonc
{
  "meta": { "name", "description", "version", "updated", "promptItems": [{ "id", "label" }] },
  "archetypes": ["후킹 폭발형", "스토리텔링형", ...],   // 필터 칩 순서
  "templates": [
    {
      "id": "tpl-...",           // 고유, tpl-kebab-case
      "title": "...",
      "archetype": "후킹 폭발형",  // archetypes 중 하나
      "summary": "한 줄 설명",
      "reference": {
        "title": "기준 영상 성격",
        "platform": "YouTube Shorts | Instagram Reels | TikTok",
        "creator": "(기준 영상 직접 지정)",
        "length": "0:38",
        "url": "",               // 비우면 '직접 지정' 표시, 채우면 카드에 임베드(.mp4→video, 그 외→iframe)
        "why": "왜 이 영상을 기준으로 삼는지"
      },
      "bestFor": ["이럴 때 좋아요 ..."],   // 사용성
      "pros": ["장점 ..."],
      "cons": ["주의점 ..."],
      "prompts": [                 // 권장: hook·structure·script·edit·remix 순
        { "id": "hook", "label": "후킹 분석", "desc": "...", "text": "그대로 복사해 쓰는 완성형 프롬프트 ..." }
      ]
    }
  ]
}
```

## 규칙

- **영상 분석은 항상 힉스필드(Higgsfield) MCP로.** 절차는 [`docs/video-analysis.md`](docs/video-analysis.md) 필독 — `media_import_url` → `video_analysis_create` → `video_analysis_status` 폴링. 분석 전 `video_analysis_jobs`로 기존 분석 재사용 확인.
- **영상 파일을 저장소에 커밋하지 않습니다.** 기준 영상은 `reference.url`로 참조하며 화면에 임베드(`.mp4` → `<video>`, 그 외 → `<iframe>`)됩니다.
- **데이터는 `templates.json`만 수정**하면 화면·사이드바·필터가 자동 갱신됩니다. HTML/JS를 건드릴 필요 없음.
- `prompts[].text`는 **사용자가 그대로 복사해 AI에 붙여넣는 완성형 프롬프트**입니다. 한국어, 구체적 분석 지시, `[영상 링크]`·`[내 주제]` 같은 자리표시자 포함.
- `reference.creator`에 **실존 인물/채널을 지어내지 마세요**.
- 새 `archetype`을 쓰면 `archetypes[]`에도 추가해 필터 순서를 명시하세요(안 하면 첫 등장 순서로 뒤에 붙음).
- 수정 후 **`node scripts/validate.mjs`** 통과, 변경은 [CHANGELOG.md](CHANGELOG.md)에 누적.
