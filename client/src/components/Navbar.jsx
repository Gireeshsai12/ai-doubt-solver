import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("preferredChatId");
    navigate("/login");
  };

  const isDashboard = location.pathname === "/dashboard";
  const isChat = location.pathname === "/chat";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/65 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-blue-600 shadow-lg shadow-blue-900/40 flex items-center justify-center font-bold text-lg">
            AI
          </div>
          <div className="leading-tight">
            <p className="font-bold text-white text-sm md:text-base">AI Doubt Solver</p>
            <p className="text-[11px] md:text-xs text-slate-400">
              Smart student learning workspace
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2 md:gap-3">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  isDashboard
                    ? "bg-white text-slate-900"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                Dashboard
              </Link>

              <Link
                to="/chat"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  isChat
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                Chat
              </Link>

              <div className="hidden md:flex items-center gap-3 ml-2 px-3 py-2 rounded-2xl bg-white/5 border border-white/10">
                <div className="h-9 w-9 rounded-full bg-blue-600/20 border border-blue-400/20 flex items-center justify-center font-semibold text-blue-300">
                  {(user?.name || "U").charAt(0).toUpperCase()}
                </div>
                <div className="leading-tight max-w-[160px]">
                  <p className="text-sm font-semibold truncate">{user?.name || "User"}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email || ""}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}