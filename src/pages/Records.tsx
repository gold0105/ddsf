import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, Archive, Search, Swords, Trophy, Trash2,
  AlertTriangle, CheckCircle, Shield,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getScannerRecords, getQuizRecords, getBestScore,
  clearScannerRecords, clearQuizRecords, formatDate,
  ScannerRecord, QuizRecord,
} from "@/lib/records";

const DIFF_LABEL: Record<QuizRecord["difficulty"], string> = {
  easy: "쉬움",
  medium: "중간",
  hard: "어려움",
};

const Records = () => {
  const navigate = useNavigate();
  const [scanner, setScanner] = useState<ScannerRecord[]>(() => getScannerRecords());
  const [quiz, setQuiz] = useState<QuizRecord[]>(() => getQuizRecords());
  const bestScore = getBestScore();

  const handleClearScanner = () => {
    if (!window.confirm("검사 기록을 모두 지울까요?")) return;
    clearScannerRecords();
    setScanner([]);
  };

  const handleClearQuiz = () => {
    if (!window.confirm("대결 기록을 모두 지울까요?")) return;
    clearQuizRecords();
    setQuiz([]);
  };

  return (
    <div className="min-h-screen flex flex-col page-bg px-4 py-8">
      <div className="max-w-md w-full mx-auto animate-in fade-in slide-in-from-bottom-6 duration-500">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">뒤로</span>
        </button>

        <div className="text-center mb-6">
          <Archive className="w-11 h-11 text-primary mx-auto mb-2" />
          <h2 className="text-2xl font-bold text-gray-900">나의 기록소</h2>
          <p className="text-gray-500 mt-1 text-sm">그동안 검사하고 대결한 기록이에요</p>
        </div>

        {/* 요약 */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="card-warm p-4 text-center">
            <Trophy className="w-5 h-5 text-primary mx-auto mb-1" />
            <div className="text-xl font-extrabold text-gray-900">{bestScore}</div>
            <div className="text-xs text-gray-400">최고 방어력</div>
          </div>
          <div className="card-warm p-4 text-center">
            <Search className="w-5 h-5 text-primary mx-auto mb-1" />
            <div className="text-xl font-extrabold text-gray-900">{scanner.length}</div>
            <div className="text-xs text-gray-400">검사 횟수</div>
          </div>
          <div className="card-warm p-4 text-center">
            <Swords className="w-5 h-5 text-primary mx-auto mb-1" />
            <div className="text-xl font-extrabold text-gray-900">{quiz.length}</div>
            <div className="text-xs text-gray-400">대결 횟수</div>
          </div>
        </div>

        <Tabs defaultValue="scanner" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="scanner">검사 기록</TabsTrigger>
            <TabsTrigger value="quiz">대결 기록</TabsTrigger>
          </TabsList>

          {/* 검사 기록 */}
          <TabsContent value="scanner" className="space-y-3">
            {scanner.length === 0 ? (
              <EmptyState icon={<Search className="w-8 h-8 text-gray-300" />} text="아직 검사한 문자가 없어요" />
            ) : (
              <>
                {scanner.map((r) => (
                  <div key={r.id} className="card-warm p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                          r.isSpam ? "bg-red-50 text-red-600 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {r.isSpam ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                        {r.isSpam ? "위험" : "안전"} · {r.spamScore}점
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(r.date)}</span>
                    </div>
                    <p className="text-sm text-gray-800 line-clamp-2 mb-1">{r.text}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">{r.reasoning}</p>
                  </div>
                ))}
                <ClearButton onClick={handleClearScanner} label="검사 기록 모두 지우기" />
              </>
            )}
          </TabsContent>

          {/* 대결 기록 */}
          <TabsContent value="quiz" className="space-y-3">
            {quiz.length === 0 ? (
              <EmptyState icon={<Swords className="w-8 h-8 text-gray-300" />} text="아직 대결 기록이 없어요" />
            ) : (
              <>
                {quiz.map((r) => {
                  const win = r.playerScore > r.aiScore;
                  const draw = r.playerScore === r.aiScore;
                  return (
                    <div key={r.id} className="card-warm p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                            win ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : draw ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-red-50 text-red-600 border border-red-200"
                          }`}
                        >
                          <Shield className="w-3 h-3" />
                          {win ? "승리" : draw ? "무승부" : "패배"}
                        </span>
                        <span className="text-xs text-gray-400">{formatDate(r.date)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          난이도 <span className="font-semibold">{DIFF_LABEL[r.difficulty]}</span> · vs {r.aiName}
                        </span>
                        <span className="font-extrabold text-gray-900 tabular-nums">
                          <span className="text-emerald-600">{r.playerScore}</span>
                          <span className="text-gray-300 mx-1">:</span>
                          <span className="text-red-500">{r.aiScore}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
                <ClearButton onClick={handleClearQuiz} label="대결 기록 모두 지우기" />
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const EmptyState = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">{icon}</div>
    <p className="text-gray-400 text-sm">{text}</p>
  </div>
);

const ClearButton = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-center gap-1.5 py-3 rounded-2xl border-2 border-gray-200 text-gray-400 font-medium text-sm hover:border-red-200 hover:text-red-400 transition-colors mt-2"
  >
    <Trash2 className="w-4 h-4" />
    {label}
  </button>
);

export default Records;
