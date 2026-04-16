import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import {
  applyChatMeta,
  createLocalChat,
  deleteChatLocal,
  renameChatLocal,
} from "../utils/localChatStore";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuChatId, setMenuChatId] = useState(null);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setLoading(true);
      const res = await API.get("/chat");
      const serverChats = res.data?.chats || [];
      setChats(applyChatMeta(serverChats));
    } catch (error) {
      console.error("Dashboard chats load error:", error);
      setChats(applyChatMeta([]));
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    try {
      const res = await API.post("/chat");
      const newChat = res.data?.chat;

      if (!newChat?._id) throw new Error("Invalid backend chat create response");

      localStorage.setItem("preferredChatId", newChat._id);
      navigate("/chat");
    } catch (error) {
      console.error("Create new chat error:", error);
      const localChat = createLocalChat();
      localStorage.setItem("preferredChatId", localChat._id);
      navigate("/chat");
    }
  };

  const handleOpenChat = (chatId) => {
    localStorage.setItem("preferredChatId", chatId);
    navigate("/chat");
  };

  const handleRename = (chat) => {
    const nextTitle = window.prompt("Enter new chat title", chat.title || "New Chat");
    if (!nextTitle || !nextTitle.trim()) return;

    renameChatLocal(chat._id, nextTitle.trim());
    setChats((prev) =>
      prev.map((item) =>
        item._id === chat._id ? { ...item, title: nextTitle.trim() } : item
      )
    );
    setMenuChatId(null);
  };

  const handleDelete = (chat) => {
    const ok = window.confirm(`Delete "${chat.title || "this chat"}"?`);
    if (!ok) return;

    deleteChatLocal(chat._id);
    setChats((prev) => prev.filter((item) => item._id !== chat._id));

    const preferred = localStorage.getItem("preferredChatId");
    if (preferred === chat._id) {
      localStorage.removeItem("preferredChatId");
    }

    setMenuChatId(null);
  };

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const lastChat = chats[0] || null;
  const totalDemoChats = chats.filter((chat) => chat.isLocalOnly).length;

  return (
    <div className="min-h-screen text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10">
        <section className="relative overflow-hidden glass-card rounded-[32px] p-6 md:p-8 mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-blue-500/15 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-purple-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
            <div>
              <p className="text-blue-300 text-sm uppercase tracking-[0.22em] font-semibold mb-3">
                Student Dashboard
              </p>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                {greeting},
                <span className="block text-blue-400">
                  {user?.name || "Student"}.
                </span>
              </h1>
              <p className="text-slate-300 mt-4 max-w-2xl text-base md:text-lg leading-8">
                Your AI doubt-solving workspace is ready. Continue previous chats,
                create a new session, and keep your study flow organized in one place.
              </p>

              <div className="mt-7 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleNewChat}
                  className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 transition font-semibold shadow-xl shadow-blue-900/30"
                >
                  + Start New Chat
                </button>

                <button
                  onClick={() => navigate("/chat")}
                  className="px-6 py-3.5 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 transition font-semibold"
                >
                  Open Chat Workspace
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 min-w-full xl:min-w-[300px]">
              <div className="rounded-3xl bg-white/5 border border-white/10 p-5">
                <p className="text-slate-400 text-sm mb-2">Total Chats</p>
                <h3 className="text-3xl font-black">{chats.length}</h3>
              </div>

              <div className="rounded-3xl bg-white/5 border border-white/10 p-5">
                <p className="text-slate-400 text-sm mb-2">Demo Mode</p>
                <h3 className="text-2xl font-black text-yellow-300">Active</h3>
              </div>
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
          <div className="glass-card rounded-[30px] p-6 md:p-7">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-slate-400 text-sm mb-1">Recent activity</p>
                <h2 className="text-2xl md:text-3xl font-bold">Your Conversations</h2>
              </div>

              <button
                onClick={handleNewChat}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 transition text-sm font-semibold"
              >
                New
              </button>
            </div>

            {loading ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-slate-300">
                Loading your conversations...
              </div>
            ) : chats.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-10 text-center">
                <h3 className="text-xl font-bold mb-2">No chats yet</h3>
                <p className="text-slate-300 mb-6">
                  Create your first conversation and start asking doubts.
                </p>
                <button
                  onClick={handleNewChat}
                  className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 transition font-semibold"
                >
                  Create First Chat
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {chats.map((chat, index) => (
                  <div
                    key={chat._id}
                    className="w-full rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <button
                        onClick={() => handleOpenChat(chat._id)}
                        className="text-left flex-1 min-w-0"
                      >
                        <p className="text-xs uppercase tracking-[0.18em] text-blue-300 mb-2 font-semibold">
                          Chat {String(index + 1).padStart(2, "0")}
                          {chat.isLocalOnly ? " • Demo" : ""}
                        </p>
                        <h3 className="text-lg font-bold truncate">
                          {chat.title || "New Chat"}
                        </h3>
                        <p className="text-sm text-slate-400 mt-2">
                          Continue this study conversation
                        </p>
                      </button>

                      <div className="relative shrink-0">
                        <button
                          onClick={() =>
                            setMenuChatId((prev) => (prev === chat._id ? null : chat._id))
                          }
                          className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 transition text-sm font-semibold"
                        >
                          ⋯
                        </button>

                        {menuChatId === chat._id && (
                          <div className="absolute right-0 top-12 w-40 rounded-2xl border border-white/10 bg-slate-950 shadow-2xl z-30 overflow-hidden">
                            <button
                              onClick={() => handleOpenChat(chat._id)}
                              className="w-full text-left px-4 py-3 text-sm hover:bg-white/10"
                            >
                              Open
                            </button>
                            <button
                              onClick={() => handleRename(chat)}
                              className="w-full text-left px-4 py-3 text-sm hover:bg-white/10"
                            >
                              Rename
                            </button>
                            <button
                              onClick={() => handleDelete(chat)}
                              className="w-full text-left px-4 py-3 text-sm text-red-300 hover:bg-red-500/10"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div className="glass-card rounded-[30px] p-6 md:p-7">
              <p className="text-slate-400 text-sm mb-2">Quick access</p>
              <h2 className="text-2xl font-bold mb-5">Smart Actions</h2>

              <div className="space-y-3">
                <button
                  onClick={handleNewChat}
                  className="w-full text-left rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 p-4 transition"
                >
                  <p className="font-semibold mb-1">Start a fresh doubt session</p>
                  <p className="text-sm text-slate-400">
                    Create a clean conversation for a new topic.
                  </p>
                </button>

                <button
                  onClick={() => navigate("/chat")}
                  className="w-full text-left rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 p-4 transition"
                >
                  <p className="font-semibold mb-1">Go to main chat workspace</p>
                  <p className="text-sm text-slate-400">
                    Continue learning with the full chat interface.
                  </p>
                </button>
              </div>
            </div>

            <div className="glass-card rounded-[30px] p-6 md:p-7">
              <p className="text-slate-400 text-sm mb-2">Project Metrics</p>
              <h2 className="text-2xl font-bold mb-5">Overview</h2>

              <div className="space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400 mb-1">Chats Available</p>
                  <p className="text-2xl font-black">{chats.length}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400 mb-1">Demo Chats</p>
                  <p className="text-2xl font-black text-yellow-300">
                    {totalDemoChats}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400 mb-1">Ready For</p>
                  <p className="text-lg font-bold text-green-400">
                    Resume • GitHub • Demo
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-[30px] p-6 md:p-7">
              <p className="text-slate-400 text-sm mb-2">Resume session</p>
              <h2 className="text-2xl font-bold mb-5">Latest Chat</h2>

              {lastChat ? (
                <div className="rounded-3xl border border-blue-400/15 bg-blue-500/10 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-blue-300 mb-2 font-semibold">
                    Most recent
                  </p>
                  <h3 className="text-xl font-bold mb-3 truncate">
                    {lastChat.title || "New Chat"}
                  </h3>
                  <button
                    onClick={() => handleOpenChat(lastChat._id)}
                    className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 transition font-semibold"
                  >
                    Continue Chat
                  </button>
                </div>
              ) : (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-slate-300">
                  No recent chat available yet.
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}