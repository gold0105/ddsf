import { useNavigate } from "react-router-dom";
import { Search, Gamepad2, ChevronLeft, Shield } from "lucide-react";

const ModeSelect = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 page-bg">
      <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-6 duration-500">
        {/* Header */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors mb-8"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">처음으로</span>
        </button>

        <div className="text-center mb-10">
          <Shield className="w-12 h-12 text-primary mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-gray-900">무엇을 하시겠어요?</h2>
          <p className="text-gray-500 mt-2">원하는 서비스를 선택해주세요</p>
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-4">
          {/* AI Scanner */}
          <button
            onClick={() => navigate("/scanner")}
            className="card-warm text-left flex items-start gap-5 p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-orange-100 transition-all duration-200 group"
          >
            <div className="w-14 h-14 rounded-2xl brand-gradient flex items-center justify-center shrink-0 shadow-lg shadow-orange-200 group-hover:scale-105 transition-transform">
              <Search className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">AI 판별 검사기</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                받은 문자를 붙여넣으면 AI가 스팸/스미싱 여부를 분석하고 행동 지침을 알려드려요
              </p>
              <span className="inline-block mt-2 text-sm font-semibold text-primary">바로 검사하기 →</span>
            </div>
          </button>

          {/* Quiz */}
          <button
            onClick={() => navigate("/quiz")}
            className="card-warm text-left flex items-start gap-5 p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-orange-100 transition-all duration-200 group"
          >
            <div className="w-14 h-14 rounded-2xl brand-gradient flex items-center justify-center shrink-0 shadow-lg shadow-amber-200 group-hover:scale-105 transition-transform">
              <Gamepad2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">AI 대결 퀴즈</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                              AI와 일대일 대결! 143개 문자로 스미싱 판별 실력을 겨뤄보세요. 안심파수꾼이 최종 해설을 제공합니다
                            </p>
              <span className="inline-block mt-2 text-sm font-semibold text-primary">도전하기 →</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModeSelect;