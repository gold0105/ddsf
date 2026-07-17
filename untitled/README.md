# 스팸 굽는 안심파수꾼

AI와 함께하는 스미싱 방어 훈련 앱입니다. 의심스러운 문자를 직접 검사하거나, AI와 대결하는 퀴즈로 스미싱 판별 실력을 키울 수 있습니다.

## 주요 기능

- **AI 판별 검사기** (`/scanner`) — 받은 문자를 붙여넣으면 안심파수꾼 AI가 위험도(0~100점)와 행동 지침을 알려줍니다.
- **AI 대결 퀴즈** (`/quiz`) — 난이도별 AI와 일대일로 스미싱/정상 문자를 겨루고, 안심파수꾼이 최종 해설을 제공합니다.

## 기술 스택

- React 19 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- React Router
- Nitro 서버 레이어 (`/api/ai-chat` — AI 게이트웨이 프록시)

## 개발

```bash
pnpm install
pnpm dev      # 개발 서버 (http://localhost:8080)
pnpm build    # 프로덕션 빌드
pnpm lint     # 린트
```

## 환경 변수

AI 게이트웨이 설정은 서버에서만 읽히는 런타임 설정으로 관리합니다. 배포 환경에서는 아래 환경변수로 덮어쓸 수 있습니다.

| 환경변수 | 설명 |
| --- | --- |
| `NITRO_AI_BASE_URL` | AI 챗 게이트웨이의 base URL |
| `NITRO_AI_API_KEY` | 게이트웨이 인증 키 |
| `NITRO_AI_MODEL` | 사용할 모델 이름 |

> 이 값들은 `server/` 코드에서만 사용되며 브라우저 번들에는 포함되지 않습니다.
