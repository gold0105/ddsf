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

function buildChallengeSystem(difficulty: Difficulty): string {
  const name = AI_NAMES[difficulty];

  if (difficulty === "easy") {
    return `너는 "${name}"이야. 분석 실력이 서툰 초보 탐정이야. 밝고 명랑하게 추리하는 게 특기지만, 자주 틀려요! 자신감은 넘치는데 근거가 빈약한 게 특징이에요.
${POLITE_FRIENDLY}

반드시 아래 JSON 형식으로만 응답해야 해:
{
  "guess": true 또는 false (true=스팸, false=정상),
  "reasoning": "추리 과정을 밝고 친근한 존댓말로 설명 (80자 내외)"
}`;
  }

  if (difficulty === "medium") {
    return `너는 "${name}"이야. 어느 정도 실력을 갖춘 수사관이야. 밝고 친근하게 분석을 하고, 대략 70% 정도는 맞히는 능력이 있어요. 때로는 감에 의존하기도 해요.
${POLITE_FRIENDLY}

반드시 아래 JSON 형식으로만 응답해야 해:
{
  "guess": true 또는 false (true=스팸, false=정상),
  "reasoning": "추리 과정을 밝고 친근한 존댓말로 설명 (100자 내외)"
}`;
  }

  return `너는 "${name}"이야. 베테랑 명탐정이야. 밝고 친근하지만 분석은 날카롭고 정확해요. 90% 이상 적중률을 자랑하는 실력자예요.
${POLITE_FRIENDLY}

반드시 아래 JSON 형식으로만 응답해야 해:
{
  "guess": true 또는 false (true=스팸, false=정상),
  "reasoning": "추리 과정을 친근한 존댓말로 설명 (120자 내외)"
}`;
}

export async function getChallengeAIGuess(
  quizItem: QuizItem,
  difficulty: Difficulty
): Promise<AIAnswer> {
  const name = AI_NAMES[difficulty];
  let reasoning: string;
  let guess: boolean;

  try {
    const content = await chat([
      { role: "system", content: buildChallengeSystem(difficulty) },
      { role: "user", content: `이 문자를 분석해줘!\n\n발신자: ${quizItem.sender}\n내용: ${quizItem.text}` },
    ], difficulty === "easy" ? 0.9 : difficulty === "medium" ? 0.7 : 0.4, 600);

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON 파싱 실패");
    const parsed = JSON.parse(jsonMatch[0]);
    reasoning = parsed.reasoning || "음... 잘 모르겠지만, 제 직감으로 한번 찍어볼게요! 😅";
    guess = Boolean(parsed.guess);
  } catch {
    reasoning = `${name}: 어라, 이건 분석이 잘 안 되네요! 제 직감을 믿고 찍어볼게요! 🎲`;
    guess = Math.random() > 0.5;
  }

  // Apply difficulty-based accuracy
  const accuracy = AI_ACCURACY[difficulty];
  const shouldBeCorrect = Math.random() < accuracy;

  if (shouldBeCorrect) {
    // Force correct guess
    return { guess: quizItem.isSpam, reasoning, isCorrect: true };
  }

  // Force wrong guess
  const wrongReasoning = guess === quizItem.isSpam
    ? `${name}: ${quizItem.isSpam
        ? `흠... ${quizItem.sender} 이름이 제법 공식적으로 보이네요? 정상인 것 같아요! 근데 아닐까요...? 🤔`
        : `어? 이거 어디서 많이 본 스팸 같은데요... 아, 아닌가요? 살짝 헷갈리네요~ 😵`}`
    : reasoning;

  return { guess: !quizItem.isSpam, reasoning: wrongReasoning, isCorrect: false };
}