import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Search, Shield, AlertTriangle, Brain, Sparkles, Copy, Info, CheckCircle, ExternalLink } from "lucide-react";
import { analyzeMessage, AnalysisResult } from "@/services/aiService";

const Scanner = () => {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!inputText.trim() || analyzing) return;
    setAnalyzing(true);
    setResult(null);
    try {
      const analysis = await analyzeMessage(inputText.trim());
      setResult(analysis);
    } catch {
      // ignore
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setInputText(text);
    } catch {
      // clipboard not supported
    }
  };

  const handleClear = () => {
    setInputText("");
    setResult(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-red-500";
    if (score >= 40) return "text-amber-500";
    return "text-emerald-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return "bg-red-500";
    if (score >= 40) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return { text: "위험", color: "chip-danger" };
    if (score >= 50) return { text: "의심", color: "chip-danger" };
    if (score >= 30) return { text: "주의", color: "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200" };
    return { text: "안전", color: "chip-safe" };
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#FFF8F0] via-[#FFF3E8] to-[#FFE8D6]">
      {/* Header */}
      <div className="px-4 py-4 flex items-center max-w-md mx-auto w-full">
        <button
          onClick={() => navigate("/mode")}
          className="flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">뒤로</span>
        </button>
        <div className="flex-1 text-center">
          <span className="text-sm font-bold text-gray-700">안심파수꾼 판별 검사기</span>
        </div>
        <div className="w-14" />
      </div>

      <div className="flex-1 flex flex-col px-4 max-w-md mx-auto w-full pb-8">
        {/* Input Area */}
        <div className="card-warm mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-bold text-gray-800">검사할 문자를 입력하세요</span>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="받은 문자 메시지를 여기에 붙여넣으세요..."
            className="w-full h-32 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handlePaste}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              <Copy className="w-4 h-4" />
              붙여넣기
            </button>
            <button
              onClick={handleClear}
              className="px-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              지우기
            </button>
            <button
              onClick={handleAnalyze}
              disabled={!inputText.trim() || analyzing}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-primary text-white font-bold text-sm hover:brightness-110 active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none"
            >
              {analyzing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  분석 중...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  검사하기
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading */}
        {analyzing && (
          <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-primary flex items-center justify-center animate-pulse shadow-lg shadow-orange-200">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <Sparkles className="w-6 h-6 text-amber-400 absolute -top-2 -right-2 animate-bounce" />
            </div>
            <p className="mt-4 text-gray-500 font-medium">안심파수꾼이 문자를 분석하고 있어요...</p>
            <p className="text-sm text-gray-400 mt-1">스팸 패턴, 발신자 신뢰도, 문맥을 검사 중</p>
          </div>
        )}

        {/* Result */}
        {result && !analyzing && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-400">
            {/* Score Card */}
            <div className="card-warm mb-4 text-center">
              <p className="text-sm text-gray-500 mb-2">위험도 분석 결과</p>
              <div className="flex items-center justify-center gap-4 mb-3">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                    <circle cx="48" cy="48" r="40" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      fill="none"
                      stroke={result.spamScore >= 70 ? "#ef4444" : result.spamScore >= 40 ? "#f59e0b" : "#10b981"}
                      strokeWidth="8"
                      strokeDasharray={`${(result.spamScore / 100) * 251.3} 251.3`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-2xl font-extrabold ${getScoreColor(result.spamScore)}`}>
                      {result.spamScore}
                    </span>
                  </div>
                </div>
                <div className="text-left">
                  <span className={getScoreLabel(result.spamScore).color}>
                    {result.spamScore >= 80 && <AlertTriangle className="w-4 h-4" />}
                    {result.spamScore < 80 && result.spamScore >= 50 && <Info className="w-4 h-4" />}
                    {result.spamScore < 50 && <CheckCircle className="w-4 h-4" />}
                    {getScoreLabel(result.spamScore).text}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">100점에 가까울수록 위험</p>
                </div>
              </div>
              <div className="score-bar">
                <div
                  className={`score-bar-fill ${getScoreBg(result.spamScore)}`}
                  style={{ width: `${result.spamScore}%` }}
                />
              </div>
            </div>

            {/* Guardian Explanation */}
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-orange-100 mb-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100 flex items-center justify-center overflow-hidden shadow-sm border-2 border-orange-200 flex-shrink-0">
                              <img
                                src="/hero-image.png"
                                alt="안심파수꾼"
                                className="w-full h-full object-cover rounded-full"
                              />
                            </div>
                            <span className="text-sm font-bold text-primary">안심파수꾼은 이렇게 생각했어요</span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{result.reasoning}</p>
                        </div>

            {/* Action Guide */}
            <div
              className={`rounded-2xl p-5 border mb-4 ${
                result.isSpam
                  ? "bg-red-50 border-red-200"
                  : "bg-emerald-50 border-emerald-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {result.isSpam ? (
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                )}
                <span className={`font-bold text-sm ${result.isSpam ? "text-red-600" : "text-emerald-600"}`}>
                  행동 지침
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{result.actionGuide}</p>
            </div>

            {/* Another Check */}
            <button
              onClick={handleClear}
              className="w-full py-3 rounded-2xl border-2 border-gray-200 text-gray-500 font-medium text-sm hover:border-primary/30 hover:text-primary transition-colors"
            >
              다른 문자 검사하기
            </button>
          </div>
        )}

        {/* Empty State */}
        {!result && !analyzing && !inputText.trim() && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-400 font-medium mb-1">검사할 문자가 없어요</p>
            <p className="text-sm text-gray-400">
              의심스러운 문자를 복사해서 붙여넣으면
              <br />
              AI가 위험도를 분석해드려요
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scanner;