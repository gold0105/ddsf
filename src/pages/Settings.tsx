import { useNavigate } from "react-router-dom";
import { ChevronLeft, Check, Palette, Type, Settings as SettingsIcon } from "lucide-react";
import { useSettings, THEMES, FONT_SCALES } from "@/contexts/SettingsContext";

const Settings = () => {
  const navigate = useNavigate();
  const { theme, fontScale, setTheme, setFontScale } = useSettings();

  return (
    <div className="min-h-screen flex flex-col page-bg px-6 py-12">
      <div className="max-w-md w-full mx-auto animate-in fade-in slide-in-from-bottom-6 duration-500">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors mb-8"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">뒤로</span>
        </button>

        <div className="text-center mb-8">
          <SettingsIcon className="w-12 h-12 text-primary mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-gray-900">화면 설정</h2>
          <p className="text-gray-500 mt-2">보기 편하게 글자 크기와 색을 바꿔보세요</p>
        </div>

        {/* 글자 크기 */}
        <div className="card-warm mb-5">
          <div className="flex items-center gap-2 mb-4">
            <Type className="w-5 h-5 text-primary" />
            <span className="font-bold text-gray-800">글자 크기</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {FONT_SCALES.map((f) => {
              const active = fontScale === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFontScale(f.id)}
                  className={`rounded-2xl border-2 p-4 text-center transition-all active:scale-[0.98] ${
                    active
                      ? "border-primary bg-accent/50 shadow-md"
                      : "border-border/60 bg-white hover:border-primary/40"
                  }`}
                >
                  <div
                    className="font-bold text-gray-900 mb-1"
                    style={{ fontSize: f.id === "normal" ? "1rem" : f.id === "large" ? "1.25rem" : "1.5rem" }}
                  >
                    가
                  </div>
                  <div className="text-xs font-semibold text-gray-600">{f.label}</div>
                  {active && (
                    <div className="mt-1 flex justify-center">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 색 테마 */}
        <div className="card-warm mb-5">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-primary" />
            <span className="font-bold text-gray-800">색 테마</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {THEMES.map((t) => {
              const active = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`flex items-center gap-3 rounded-2xl border-2 p-3 transition-all active:scale-[0.98] ${
                    active
                      ? "border-primary bg-accent/50 shadow-md"
                      : "border-border/60 bg-white hover:border-primary/40"
                  }`}
                >
                  <span
                    className="w-9 h-9 rounded-full shadow-sm shrink-0 border border-black/5"
                    style={{ backgroundImage: `linear-gradient(to bottom right, ${t.from}, ${t.to})` }}
                  />
                  <span className="text-sm font-bold text-gray-800 flex-1 text-left">{t.label}</span>
                  {active && <Check className="w-4 h-4 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-3 leading-relaxed">
            눈이 불편하시면 <span className="font-semibold text-gray-500">고대비</span> 테마를 추천해요.
          </p>
        </div>

        <p className="text-center text-xs text-gray-400">
          설정은 이 기기에 자동으로 저장됩니다.
        </p>
      </div>
    </div>
  );
};

export default Settings;
