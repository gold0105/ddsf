import { useNavigate } from "react-router-dom";
import { Shield, Sparkles, ArrowRight } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-b from-[#FFF8F0] via-[#FFF3E8] to-[#FFE8D6]">
      {/* Hero Section */}
      <div className="flex flex-col items-center max-w-md w-full animate-in fade-in slide-in-from-bottom-6 duration-700">
        {/* Hero Image */}
        <div className="relative mb-2">
          <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100 shadow-2xl shadow-orange-200/50 flex items-center justify-center overflow-hidden border-4 border-white">
            <img
              src="/hero-image.png"
              alt="안심파수꾼"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          {/* Floating badge */}
          <div className="absolute -bottom-2 -right-2 bg-white rounded-full px-4 py-2 shadow-lg border border-orange-100 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-bold text-orange-600">AI 보안</span>
          </div>
        </div>

        {/* App Name */}
        <div className="text-center mt-6 mb-3">
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-4 py-1.5 mb-4">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-semibold text-orange-700">AI 챌린지 2026</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
            스팸 굽는
            <br />
            <span className="text-primary">안심파수꾼</span>
          </h1>
          <p className="mt-3 text-gray-500 text-lg leading-relaxed">
            AI와 함께하는 스미싱 방어 훈련
            <br />
            문제 풀고, 직접 검사하고, 안전을 지키세요
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3 w-full mt-2 mb-8">
          <div className="bg-white/80 backdrop-blur rounded-2xl p-4 border border-orange-100 shadow-sm text-center">
            <div className="text-2xl mb-1">🛡️</div>
            <div className="text-sm font-bold text-gray-800">AI 판별</div>
            <div className="text-xs text-gray-400">문자 위험도 분석</div>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-2xl p-4 border border-orange-100 shadow-sm text-center">
            <div className="text-2xl mb-1">🎯</div>
            <div className="text-sm font-bold text-gray-800">퀴즈 도전</div>
            <div className="text-xs text-gray-400">방어력 점수 확인</div>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={() => navigate("/mode")}
          className="btn-primary w-full flex items-center justify-center gap-2 text-xl py-5"
        >
          시작하기
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default Landing;