import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, AlertTriangle, CheckCircle, RotateCcw, Trophy,
  Swords, Bot, User, Zap
} from "lucide-react";
import quizData, { QuizItem } from "@/data/quizData";
import { getGuardianVerdict, getChallengeAIGuess, getAIName, AIAnswer, Difficulty } from "@/services/aiService";

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

type QuizPhase = "difficulty" | "playing" | "result" | "explanation" | "finished";

const FIXED_FIRST_ID = "n054";
const DIFFICULTY_LABELS: Record<Difficulty, { label: string; emoji: string; desc: string; color: string }> = {
  easy: { label: "쉬움", emoji: "🐣", desc: "AI가 자주 틀려요!", color: "border-emerald-300 bg-emerald-50 text-emerald-700" },
  medium: { label: "중간", emoji: "⚔️", desc: "AI가 어느 정도 맞춰요", color: "border-amber-300 bg-amber-50 text-amber-700" },
  hard: { label: "어려움", emoji: "🔥", desc: "AI가 꽤 똑똑해져요!", color: "border-red-300 bg-red-50 text-red-700" },
};

const Quiz = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<QuizPhase>("difficulty");
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [questions, setQuestions] = useState<QuizItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<boolean | null>(null);
  const [aiAnswer, setAiAnswer] = useState<AIAnswer | null>(null);
  const [guardianVerdict, setGuardianVerdict] = useState<string>("");
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [loading, setLoading] = useState(false);

  const buildQuestions = useCallback(() => {
    const fixedQuestion = quizData.find((q) => q.id === FIXED_FIRST_ID);
    const rest = quizData.filter((q) => q.id !== FIXED_FIRST_ID);
    const shuffledRest = shuffleArray(rest);
    if (fixedQuestion) return [fixedQuestion, ...shuffledRest];
    return shuffledRest;
  }, []);

  const startQuiz = (diff: Difficulty) => {
    setDifficulty(diff);
    setQuestions(buildQuestions());
    setCurrentIndex(0);
    setPlayerScore(0);
    setAiScore(0);
    setPhase("playing");
  };

  const handleRestart = () => {
    if (difficulty) {
      setQuestions(buildQuestions());
      setCurrentIndex(0);
      setPlayerScore(0);
      setAiScore(0);
      setUserAnswer(null);
      setAiAnswer(null);
      setGuardianVerdict("");
      setPhase("playing");
    } else {
      setPhase("difficulty");
    }
  };

  const handleAnswer = useCallback(
    async (answer: boolean) => {
      if (phase !== "playing" || !questions[currentIndex]) return;
      const current = questions[currentIndex];

      setUserAnswer(answer);
      setPhase("result");

      if (answer === current.isSpam) setPlayerScore((s) => s + 10);

      setLoading(true);
      const [ai, verdict] = await Promise.all([
        getChallengeAIGuess(current, difficulty!),
        getGuardianVerdict(current),
      ]);
      setAiAnswer(ai);
      if (ai.isCorrect) setAiScore((s) => s + 10);
      setGuardianVerdict(verdict);
      setLoading(false);
      setPhase("explanation");
    },
    [phase, questions, currentIndex, difficulty]
  );

  const handleNext = () => {
    if (currentIndex === questions.length - 1) {
      setPhase("finished");
    } else {
      setCurrentIndex((i) => i + 1);
      setUserAnswer(null);
      setAiAnswer(null);
      setGuardianVerdict("");
      setPhase("playing");
    }
  };

  const aiName = difficulty ? getAIName(difficulty) : "";
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];

  const getPlayerVsAi = () => {
    if (playerScore > aiScore) return { emoji: "🎉", text: "당신의 승리입니다!", color: "text-emerald-600" };
    if (playerScore < aiScore) return { emoji: "😢", text: `${aiName}의 승리...`, color: "text-red-500" };
    return { emoji: "🤝", text: "무승부!", color: "text-amber-600" };
  };

  // ─── Difficulty Selection Screen ───
  if (phase === "difficulty") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-b from-[#FFF8F0] via-[#FFF3E8] to-[#FFE8D6]">
        <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-6 duration-500">
          <button
            onClick={() => navigate("/mode")}
            className="flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors mb-8"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">뒤로</span>
          </button>

          <div className="text-center mb-8">
            <Swords className="w-12 h-12 text-primary mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-gray-900">AI와의 대결!</h2>
            <p className="text-gray-500 mt-2 leading-relaxed">
              당신 vs AI, 누가 스미싱을 더 잘 찾을까요?
              <br />
              <span className="text-sm text-gray-400">안심파수꾼이 최종 판정을 내립니다</span>
            </p>
          </div>

          <p className="text-sm font-bold text-gray-600 mb-3">난이도를 선택하세요</p>
          <div className="flex flex-col gap-3">
            {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map((d) => {
              const info = DIFFICULTY_LABELS[d];
              return (
                <button
                  key={d}
                  onClick={() => startQuiz(d)}
                  className={`card-warm text-left flex items-center gap-4 p-5 border-2 ${info.color} hover:shadow-lg transition-all duration-200 active:scale-[0.98]`}
                >
                  <span className="text-3xl">{info.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">{info.label}</span>
                      {d === "medium" && <Zap className="w-4 h-4 text-amber-500" />}
                      {d === "hard" && <Zap className="w-4 h-4 text-red-500" />}
                    </div>
                    <p className="text-sm text-gray-500">
                      {info.desc} — {getAIName(d)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#FFF8F0] to-[#FFE8D6]">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#FFF8F0] via-[#FFF3E8] to-[#FFE8D6]">
      {/* Header */}
      <div className="px-4 py-4 flex items-center justify-between max-w-md mx-auto w-full">
        <button
          onClick={() => navigate("/mode")}
          className="flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">나가기</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm font-bold">
            <User className="w-4 h-4 text-emerald-500" />
            <span className="text-emerald-600">{playerScore}</span>
            <span className="text-gray-400 mx-1">vs</span>
            <Bot className="w-4 h-4 text-red-400" />
            <span className="text-red-500">{aiScore}</span>
          </div>
        </div>
        <button
          onClick={handleRestart}
          className="flex items-center gap-1 text-gray-400 hover:text-amber-500 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="text-sm">재시작</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="px-4 max-w-md mx-auto w-full mb-2">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
          <span>{currentIndex + 1} / {totalQuestions}</span>
          <span className="text-xs">{DIFFICULTY_LABELS[difficulty!].emoji} {difficulty === "easy" ? "쉬움" : difficulty === "medium" ? "중간" : "어려움"} | vs {aiName}</span>
        </div>
        <div className="score-bar">
          <div
            className="score-bar-fill bg-gradient-to-r from-orange-400 to-primary"
            style={{ width: `${((currentIndex) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-4 max-w-md mx-auto w-full pb-8">
        {/* Finished State */}
        {phase === "finished" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="text-6xl mb-2">{getPlayerVsAi().emoji}</div>
            <Trophy className="w-16 h-16 text-primary mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">대결 종료!</h2>
            <p className={`text-xl font-extrabold ${getPlayerVsAi().color} mb-2`}>
              {getPlayerVsAi().text}
            </p>

            <div className="flex items-center gap-4 mb-3">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex flex-col items-center justify-center">
                  <User className="w-5 h-5 text-emerald-500 mb-0.5" />
                  <span className="text-lg font-extrabold text-emerald-600">{playerScore}</span>
                </div>
                <span className="text-xs text-gray-400 mt-1 block">당신</span>
              </div>
              <span className="text-gray-300 font-bold text-lg">VS</span>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-red-50 border-2 border-red-200 flex flex-col items-center justify-center">
                  <Bot className="w-5 h-5 text-red-400 mb-0.5" />
                  <span className="text-lg font-extrabold text-red-500">{aiScore}</span>
                </div>
                <span className="text-xs text-gray-400 mt-1 block">{aiName}</span>
              </div>
            </div>

            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              {totalQuestions}문제 중 {playerScore / 10}개 정답
              <br />
              {playerScore >= aiScore
                ? "AI보다 뛰어난 방어력을 보여주셨어요! 실제 상황에서도 잘 대처하실 거예요."
                : "아직 AI에게 졌지만 계속 연습하면 스미싱 패턴을 완벽히 파악할 수 있어요!"}
            </p>
            <button onClick={handleRestart} className="btn-primary flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              다시 도전하기
            </button>
            <button
              onClick={() => setPhase("difficulty")}
              className="mt-3 text-gray-400 hover:text-gray-600 text-sm transition-colors"
            >
              난이도 다시 선택
            </button>
          </div>
        )}

        {/* Playing / Result / Explanation */}
        {phase !== "finished" && currentQuestion && (
          <>
            {/* Message Card */}
            <div className="card-warm mb-4 mt-2 animate-in slide-in-from-bottom-4 fade-in duration-300">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                  {currentQuestion.sender.slice(0, 2)}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500">{currentQuestion.sender}</p>
                </div>
              </div>
              <p className="text-base leading-relaxed text-gray-800 whitespace-pre-wrap">
                {currentQuestion.text}
              </p>
            </div>

            {/* Buttons (Playing) */}
            {phase === "playing" && (
              <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <button
                  onClick={() => handleAnswer(false)}
                  className="flex-1 py-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50 text-emerald-700 font-bold text-lg hover:bg-emerald-100 hover:border-emerald-300 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  정상 문자
                </button>
                <button
                  onClick={() => handleAnswer(true)}
                  className="flex-1 py-4 rounded-2xl border-2 border-red-200 bg-red-50 text-red-600 font-bold text-lg hover:bg-red-100 hover:border-red-300 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-5 h-5" />
                  스팸/스미싱
                </button>
              </div>
            )}

            {/* Result: Player + AI thinking */}
            {phase === "result" && userAnswer !== null && (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <div className="text-center mb-3">
                  {userAnswer === currentQuestion.isSpam ? (
                    <div className="flex items-center justify-center gap-2 text-emerald-600 mb-1">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-base font-bold">정답입니다!</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-red-500 mb-1">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="text-base font-bold">틀렸어요!</span>
                    </div>
                  )}

                  <div className="flex justify-center mt-3">
                    <div className="bg-gray-100 rounded-full px-4 py-1.5 flex items-center gap-2">
                      <Bot className="w-4 h-4 text-red-400 animate-bounce" />
                      <span className="text-sm text-gray-500">{aiName} 생각 중...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Explanation: AI guess + Guardian verdict */}
            {phase === "explanation" && aiAnswer && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-400 space-y-3">
                {/* AI Guess Card */}
                <div className={`rounded-2xl p-4 border-2 ${aiAnswer.isCorrect ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className={`w-5 h-5 ${aiAnswer.isCorrect ? "text-emerald-500" : "text-red-400"}`} />
                    <span className={`text-sm font-bold ${aiAnswer.isCorrect ? "text-emerald-600" : "text-red-500"}`}>
                      {aiName}의 추리 {aiAnswer.isCorrect ? "✅ 정답" : "❌ 오답"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {aiAnswer.reasoning}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {aiName}: "{aiAnswer.guess ? "스팸이야!" : "정상이야!"}"
                  </p>
                </div>

                {/* Guardian Verdict */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-orange-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100 flex items-center justify-center overflow-hidden shadow-sm border-2 border-orange-200 flex-shrink-0">
                      <img
                        src="/hero-image.png"
                        alt="안심파수꾼"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <span className="text-sm font-bold text-primary">
                      안심파수꾼은 이렇게 생각했어요
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {loading ? "판정 결과를 불러오는 중입니다..." : guardianVerdict}
                  </p>
                </div>

                <button onClick={handleNext} className="btn-primary w-full">
                  {currentIndex === totalQuestions - 1 ? "결과 보기" : "다음 문제"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Quiz;