import { QuizItem } from "@/data/quizData";

export interface AnalysisResult {
  spamScore: number;
  isSpam: boolean;
  reasoning: string;
  actionGuide: string;
}

export type Difficulty = "easy" | "medium" | "hard";

export interface AIAnswer {
  guess: boolean;
  reasoning: string;
  isCorrect: boolean;
}

const AI_ACCURACY: Record<Difficulty, number> = {
  easy: 0.45,
  medium: 0.70,
  hard: 0.90,
};

const AI_NAMES: Record<Difficulty, string> = {
  easy: "초보 탐정 AI 두치",
  medium: "수사관 AI 또치",
  hard: "명탐정 AI 도치",
};

export function getAIName(difficulty: Difficulty): string {
  return AI_NAMES[difficulty];
}

// ─── Shared API call ───

async function chat(messages: { role: "system" | "user" | "assistant"; content: string }[], temperature = 0.5, maxTokens = 500): Promise<string> {
  const res = await fetch("/api/ai-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, temperature, max_tokens: maxTokens }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "unknown" }));
    throw new Error(err.error || `API error ${res.status}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

// ─── 안심파수꾼: Scanner 분석 ───

const GUARDIAN_SYSTEM = `너의 이름은 "안심파수꾼"이야. 스미싱/스팸 문자를 분석하는 전문가로서 진지하고 정중한 말투로 답변해.
고령층도 이해하기 쉽도록 짧고 명확하게 설명해.

반드시 아래 JSON 형식으로만 응답해야 해:
{
  "spamScore": 0부터 100 사이의 위험도 점수 (숫자),
  "isSpam": true 또는 false,
  "reasoning": "판단 근거를 간결하게 설명 (정중한 말투, 70자 이내)",
  "actionGuide": "사용자가 취해야 할 행동 지침 (정중한 말투, 70자 이내)"
}`;

export async function analyzeMessage(message: string): Promise<AnalysisResult> {
  const content = await chat([
    { role: "system", content: GUARDIAN_SYSTEM },
    { role: "user", content: `다음 문자를 분석해줘:\n\n${message}` },
  ], 0.5, 700);

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("응답 파싱 실패: JSON을 찾을 수 없습니다");

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    spamScore: Math.min(100, Math.max(0, Number(parsed.spamScore) || 50)),
    isSpam: Boolean(parsed.isSpam),
    reasoning: parsed.reasoning || "분석 결과를 불러올 수 없습니다.",
    actionGuide: parsed.actionGuide || "신중히 판단하시고 의심되면 공식 채널로 확인하세요.",
  };
}

// ─── 안심파수꾼: 퀴즈 해설 ───

const GUARDIAN_QUIZ_SYSTEM = `너의 이름은 "안심파수꾼"이야. 퀴즈의 정답 판정자로서 진지하고 정중한 말투로 말해.

사용자와 AI가 스미싱/정상 여부를 맞혔는지 평가하고, 올바른 해설을 제공해. 말투는 항상 "안녕하세요, 안심파수꾼입니다."로 시작하고 정중하게. 고령층도 이해하기 쉽도록 핵심만 짧게.

반드시 아래 JSON 형식으로만 응답해야 해:
{
  "verdict": "정답 판정 및 해설 (정중한 말투, 150자 이내)"
}`;

export async function getGuardianVerdict(quizItem: QuizItem): Promise<string> {
  const fallback = `안녕하세요, 안심파수꾼입니다.\n\n${quizItem.explanation}`;
  const label = quizItem.isSpam ? "스팸/스미싱" : "정상 문자";
  try {
    const content = await chat([
      { role: "system", content: GUARDIAN_QUIZ_SYSTEM },
      { role: "user", content: `이 문자는 "${label}"입니다. 아래 문자를 보고 참가자들이 왜 맞았는지/틀렸는지 정중하게 해설해줘:\n\n발신자: ${quizItem.sender}\n내용: ${quizItem.text}\n실제 판정: ${label}\n설명자료: ${quizItem.explanation}` },
    ], 0.4, 800);

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return fallback;

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.verdict || fallback;
  } catch {
    return fallback;
  }
}

// ─── 대결 AI: 퀴즈 상대 ───

// 대결 AI는 어르신 사용자를 배려해 항상 존댓말을 쓰되, 친근하고 다정한 말투를 유지한다.
const POLITE_FRIENDLY = `말투 규칙: 반드시 존댓말(~요, ~습니다)을 쓰되, 딱딱하지 않게 친근하고 다정하게 이야기해요. "~예요", "~네요", "~볼게요" 같은 부드러운 말끝을 써요.`;

const DIFFICULTY_PERSONA: Record<Difficulty, string> = {
  easy: `분석 실력이 서툰 초보 탐정이야. 밝고 명랑하지만 근거가 다소 엉성할 수 있어요.`,
  medium: `어느 정도 실력을 갖춘 수사관이야. 밝고 친근하게 분석해요.`,
  hard: `베테랑 명탐정이야. 밝고 친근하지만 분석은 날카롭고 정확해요.`,
};

// 판단(정답/오답)은 코드가 먼저 정하고, 모델에게는 "그 판단의 근거만" 설명하게 한다.
// 이렇게 하면 표시되는 답과 설명이 항상 일치해서, 예전처럼 얼버무리는 문장을 넣을 필요가 없다.
function buildChallengeSystem(difficulty: Difficulty): string {
  const name = AI_NAMES[difficulty];
  return `너는 "${name}"이야. ${DIFFICULTY_PERSONA[difficulty]}
${POLITE_FRIENDLY}
너는 이미 이 문자에 대한 판단을 내렸어. 그 판단을 절대 바꾸지 말고, 왜 그렇게 봤는지 그 근거만 캐릭터에 맞게 설명해. 문자에 실제로 담긴 내용(발신처, 링크 유무, 표현 등)을 구체적으로 짚어줘.

반드시 아래 JSON 형식으로만 응답해야 해:
{
  "reasoning": "판단 근거를 친근한 존댓말로 설명 (100자 내외)"
}`;
}

export async function getChallengeAIGuess(
  quizItem: QuizItem,
  difficulty: Difficulty
): Promise<AIAnswer> {
  // 1) 난이도별 정답률에 따라 이번 라운드의 정답/오답과 최종 추측을 먼저 결정
  const accuracy = AI_ACCURACY[difficulty];
  const isCorrect = Math.random() < accuracy;
  const guess = isCorrect ? quizItem.isSpam : !quizItem.isSpam;
  const verdictLabel = guess ? "스팸/스미싱 문자" : "정상 문자";

  // 추측과 항상 일치하는 기본 근거(모델 응답 실패 시에도 모순이 없도록)
  const fallbackReasoning = guess
    ? "제가 보기엔 이 문자는 스팸 같아요! 재촉하거나 링크로 유도하는 느낌이 들거든요."
    : "제가 보기엔 특별히 위험해 보이는 점은 없어서, 정상 문자 같아요!";

  // 2) 모델에게는 "이미 내린 판단의 근거"만 설명하게 한다 → 답과 설명이 항상 일치
  let reasoning = fallbackReasoning;
  try {
    const content = await chat([
      { role: "system", content: buildChallengeSystem(difficulty) },
      {
        role: "user",
        content: `당신은 아래 문자를 "${verdictLabel}"(으)로 판단했어요. 판단은 그대로 두고, 그렇게 본 근거만 설명해 주세요.\n\n발신자: ${quizItem.sender}\n내용: ${quizItem.text}`,
      },
    ], difficulty === "easy" ? 0.9 : difficulty === "medium" ? 0.7 : 0.4, 600);

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const text = parsed?.reasoning ? String(parsed.reasoning).trim() : "";
      if (text) reasoning = text;
    }
  } catch {
    reasoning = fallbackReasoning;
  }

  return { guess, reasoning, isCorrect };
}