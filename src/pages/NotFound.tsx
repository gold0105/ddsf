import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Home, ShieldQuestion } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 page-bg">
      <div className="max-w-md w-full flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-6 duration-500">
        <div className="w-20 h-20 rounded-3xl brand-gradient flex items-center justify-center shadow-lg shadow-orange-200 mb-6">
          <ShieldQuestion className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-5xl font-extrabold text-primary mb-2">404</h1>
        <p className="text-lg font-bold text-gray-800 mb-1">페이지를 찾을 수 없어요</p>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
          요청하신 주소가 사라졌거나
          <br />
          잘못된 경로일 수 있어요.
        </p>
        <button
          onClick={() => navigate("/")}
          className="btn-primary flex items-center gap-2"
        >
          <Home className="w-5 h-5" />
          처음으로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default NotFound;
