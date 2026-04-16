import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import API from "../services/api";
import Navbar from "../components/Navbar";
import {
  applyChatMeta,
  createLocalChat,
  deleteChatLocal,
  getLocalMessages,
  mergeServerAndLocalMessages,
  renameChatLocal,
  saveLocalMessages,
} from "../utils/localChatStore";

const SUGGESTIONS = [
  "Explain recursion in simple words",
  "Difference between stack and queue",
  "What is SQL join with example",
  "Explain Newton’s second law simply",
  "What is operating system deadlock",
  "What is time complexity in DSA",
];

function buildFakeReply(question) {
  const q = question.toLowerCase();

  if (q.includes("stack") && q.includes("queue")) {
    return `## Stack vs Queue

**Stack** follows **LIFO**:
- Last In, First Out
- Example: a stack of plates

**Queue** follows **FIFO**:
- First In, First Out
- Example: people standing in a line

### Key difference
- Stack inserts and removes from the **same end**
- Queue inserts at the **rear** and removes from the **front**

### Easy memory trick
- **Stack = pile**
- **Queue = line**`;
  }

  if (q.includes("recursion")) {
    return `## Recursion

Recursion is when a function **calls itself** to solve a smaller version of the same problem.

### Simple idea
1. Solve a very small case first  
2. Keep reducing the bigger problem  
3. Stop at the **base case**

### Example
If you want to count down from 3:
- count(3) calls count(2)
- count(2) calls count(1)
- count(1) stops

### Important
Every recursive function must have:
- a **base case**
- a **recursive case**`;
  }

  if (q.includes("sql") && q.includes("join")) {
    return `## SQL Join

A **join** is used to combine data from two tables.

### Common idea
You match rows using a related column, like:
- \`student.id\`
- \`marks.student_id\`

### Example
If you want student names with marks:
- one table has student info
- another has scores
- join combines them into one result

### Most common join
**INNER JOIN** returns only matching rows.

### Easy meaning
Join = “connect related rows from different tables.”`;
  }

  if (q.includes("newton")) {
    return `## Newton’s Second Law

Newton’s second law says:

**Force = Mass × Acceleration**

### Meaning
- More mass needs more force
- More acceleration also needs more force

### Example
A heavy cart is harder to push than a light cart.

### Formula
\`F = m × a\`

### Final idea
Force increases when mass or acceleration increases.`;
  }

  if (q.includes("deadlock")) {
    return `## Deadlock

A **deadlock** happens when processes keep waiting for each other and none of them can continue.

### Simple example
- Process A holds resource 1 and waits for resource 2
- Process B holds resource 2 and waits for resource 1

Now both are stuck.

### Result
No process moves forward.

### In simple words
Deadlock = **permanent waiting situation**.`;
  }

  if (q.includes("time complexity")) {
    return `## Time Complexity

Time complexity tells us how the running time of an algorithm grows when input size increases.

### Why it matters
It helps us compare algorithms efficiently.

### Common examples
- **O(1)** → constant time
- **O(n)** → linear time
- **O(log n)** → logarithmic time
- **O(n²)** → quadratic time

### Easy idea
It is not exact seconds.
It shows the **growth pattern** of work.`;
  }

  return `## Demo Answer

Here is a clear student-style explanation for your question:

**"${question}"**

### Step-by-step idea
1. Identify the main concept in the question  
2. Break it into smaller understandable parts  
3. Explain it in simple language  
4. Use a small example if needed  

### Short note
Your real AI API is paused due to quota, so this is currently a **demo-mode response** to keep the project usable and presentable.`;
}

export default function Chat() {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuChatId, setMenuChatId] = useState(null);
  const [isTypingDemo, setIsTypingDemo] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  const bottomRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    initializeChats();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, isTypingDemo]);

  const activeChat = useMemo(
    () => chats.find((chat) => chat._id === activeChatId) || null,
    [chats, activeChatId]
  );

  const initializeChats = async () => {
    try {
      setHistoryLoading(true);

      let allChats = [];
      try {
        const res = await API.get("/chat");
        const serverChats = res.data?.chats || [];
        allChats = applyChatMeta(serverChats);
      } catch (error) {
        console.error("Initialize backend chats error:", error);
        allChats = applyChatMeta([]);
      }

      setChats(allChats);

      const preferredChatId = localStorage.getItem("preferredChatId");

      if (preferredChatId && allChats.some((chat) => chat._id === preferredChatId)) {
        await loadMessages(preferredChatId, allChats);
      } else if (allChats.length > 0) {
        await loadMessages(allChats[0]._id, allChats);
      } else {
        const localChat = createLocalChat();
        const nextChats = applyChatMeta([]);
        setChats(nextChats);
        setActiveChatId(localChat._id);
        setMessages(getLocalMessages(localChat._id));
        localStorage.setItem("preferredChatId", localChat._id);
        setHistoryLoading(false);
      }
    } catch (error) {
      console.error("Initialize Chats Error:", error);
      setHistoryLoading(false);
    }
  };

  const refreshChats = async (keepChatId = null) => {
    try {
      let nextChats = [];
      try {
        const res = await API.get("/chat");
        nextChats = applyChatMeta(res.data?.chats || []);
      } catch {
        nextChats = applyChatMeta([]);
      }

      setChats(nextChats);

      if (keepChatId) {
        setActiveChatId(keepChatId);
        localStorage.setItem("preferredChatId", keepChatId);
      }
    } catch (error) {
      console.error("Refresh Chats Error:", error);
    }
  };

  const createNewChat = async () => {
    try {
      setHistoryLoading(true);

      try {
        const res = await API.post("/chat");
        const newChat = res.data?.chat;

        if (!newChat?._id) throw new Error("Invalid chat response");

        localStorage.setItem("preferredChatId", newChat._id);
        await refreshChats(newChat._id);
        await loadMessages(newChat._id);
      } catch (error) {
        console.error("Backend create chat failed, using local chat:", error);
        const localChat = createLocalChat();
        await refreshChats(localChat._id);
        setActiveChatId(localChat._id);
        setMessages(getLocalMessages(localChat._id));
        localStorage.setItem("preferredChatId", localChat._id);
      }

      setSidebarOpen(false);
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadMessages = async (chatId, existingChats = null) => {
    try {
      setHistoryLoading(true);
      setActiveChatId(chatId);
      localStorage.setItem("preferredChatId", chatId);

      if (chatId.startsWith("local_")) {
        setMessages(getLocalMessages(chatId));
        if (existingChats) setChats(existingChats);
        setSidebarOpen(false);
        return;
      }

      try {
        const res = await API.get(`/chat/${chatId}`);

        const chatData = res.data?.chat || null;
        const serverMessages = res.data?.messages || chatData?.messages || [];

        const normalizedServerMessages = serverMessages.map((msg) => ({
          sender: msg.sender || (msg.role === "user" ? "user" : "ai"),
          text: msg.text || msg.content || "",
        }));

        const mergedMessages = mergeServerAndLocalMessages(
          chatId,
          normalizedServerMessages
        );

        setMessages(mergedMessages);
      } catch (error) {
        console.error("Load messages backend failed:", error);
        setMessages(getLocalMessages(chatId));
      }

      if (existingChats) {
        setChats(existingChats);
      }

      setSidebarOpen(false);
    } catch (error) {
      console.error("Load Messages Error:", error);
      setMessages([
        {
          sender: "ai",
          text: "Failed to load previous chat history.",
        },
      ]);
    } finally {
      setHistoryLoading(false);
    }
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

  const handleDelete = async (chat) => {
    const ok = window.confirm(`Delete "${chat.title || "this chat"}"?`);
    if (!ok) return;

    deleteChatLocal(chat._id);

    try {
      if (!chat._id.startsWith("local_")) {
        await API.delete(`/chat/${chat._id}`);
      }
    } catch (error) {
      console.error("Backend delete failed, local delete still applied:", error);
    }

    const nextChats = chats.filter((item) => item._id !== chat._id);
    setChats(nextChats);
    setMenuChatId(null);

    const preferred = localStorage.getItem("preferredChatId");
    if (preferred === chat._id) {
      localStorage.removeItem("preferredChatId");
    }

    if (activeChatId === chat._id) {
      if (nextChats.length > 0) {
        await loadMessages(nextChats[0]._id, nextChats);
      } else {
        const localChat = createLocalChat();
        const refreshed = applyChatMeta([]);
        setChats(refreshed);
        setActiveChatId(localChat._id);
        setMessages(getLocalMessages(localChat._id));
        localStorage.setItem("preferredChatId", localChat._id);
      }
    }
  };

  const persistCurrentChatMessages = (chatId, nextMessages) => {
    saveLocalMessages(chatId, nextMessages);

    setChats((prev) =>
      prev.map((chat) =>
        chat._id === chatId
          ? {
              ...chat,
              updatedAt: new Date().toISOString(),
              title:
                chat.title && chat.title !== "New Chat"
                  ? chat.title
                  : nextMessages.find((m) => m.sender === "user")?.text?.slice(0, 40) ||
                    chat.title ||
                    "New Chat",
            }
          : chat
      )
    );
  };

  const handleSend = async (forcedQuestion = null) => {
    const question = (forcedQuestion || input).trim();
    if (!question || loading || !activeChatId) return;

    const userMessage = {
      sender: "user",
      text: question,
    };

    const optimisticMessages = [...messages, userMessage];
    setMessages(optimisticMessages);
    persistCurrentChatMessages(activeChatId, optimisticMessages);
    setInput("");
    setLoading(true);
    setIsTypingDemo(true);

    let backendWorked = false;

    if (!activeChatId.startsWith("local_")) {
      try {
        const res = await API.post(`/chat/${activeChatId}`, {
          message: question,
        });

        const userMsg = res.data?.userMessage;
        const aiMsg = res.data?.aiMessage;

        if (userMsg && aiMsg) {
          const normalizedMessages = [
            ...messages,
            {
              sender: userMsg.sender || (userMsg.role === "user" ? "user" : "ai"),
              text: userMsg.text || userMsg.content || question,
            },
            {
              sender: aiMsg.sender || (aiMsg.role === "user" ? "user" : "ai"),
              text: aiMsg.text || aiMsg.content || "",
            },
          ];

          setMessages(normalizedMessages);
          persistCurrentChatMessages(activeChatId, normalizedMessages);
          backendWorked = true;
        }
      } catch (error) {
        console.error("Backend send failed, switching to demo response:", error);
      }
    }

    if (!backendWorked) {
      setTimeout(() => {
        const fakeReply = {
          sender: "ai",
          text: buildFakeReply(question),
        };

        const nextMessages = [...optimisticMessages, fakeReply];
        setMessages(nextMessages);
        persistCurrentChatMessages(activeChatId, nextMessages);
        setLoading(false);
        setIsTypingDemo(false);
      }, 900);

      return;
    }

    setLoading(false);
    setIsTypingDemo(false);
    await refreshChats(activeChatId);
  };

  const handleExportPDF = async () => {
    const chatContainer = document.getElementById("chat-export");
    if (!chatContainer) return;

    try {
      setExportingPdf(true);

      const canvas = await html2canvas(chatContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#020617",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const usableWidth = pageWidth - margin * 2;
      const scaledHeight = (canvas.height * usableWidth) / canvas.width;

      let heightLeft = scaledHeight;
      let position = margin;

      pdf.addImage(imgData, "PNG", margin, position, usableWidth, scaledHeight);
      heightLeft -= pageHeight - margin * 2;

      while (heightLeft > 0) {
        position = heightLeft - scaledHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", margin, position, usableWidth, scaledHeight);
        heightLeft -= pageHeight - margin * 2;
      }

      const filename = `${(activeChatTitle || "chat")
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "_") || "chat"}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error("Export PDF error:", error);
      alert("Failed to export PDF.");
    } finally {
      setExportingPdf(false);
    }
  };

  const activeChatTitle = activeChat?.title || "AI Doubt Chat";

  return (
    <div className="min-h-screen text-white overflow-hidden">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-5 h-[calc(100vh-64px)]">
        <div className="grid lg:grid-cols-[300px_minmax(0,1fr)] gap-5 h-full">
          <aside className="hidden lg:flex flex-col glass-card rounded-[30px] overflow-hidden h-full min-h-0">
            <div className="p-5 border-b border-white/10">
              <button
                onClick={createNewChat}
                className="w-full px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 transition font-semibold"
              >
                + New Chat
              </button>
            </div>

            <div className="p-5 border-b border-white/10">
              <p className="text-slate-400 text-xs uppercase tracking-[0.18em] mb-2">
                Workspace
              </p>
              <h2 className="text-2xl font-bold">Conversation History</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {chats.map((chat, index) => (
                <div
                  key={chat._id}
                  className={`rounded-3xl p-4 transition border ${
                    activeChatId === chat._id
                      ? "bg-blue-600/20 border-blue-400/30"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      onClick={() => loadMessages(chat._id)}
                      className="text-left flex-1 min-w-0"
                    >
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 mb-2">
                        Chat {String(index + 1).padStart(2, "0")}
                        {chat.isLocalOnly ? " • Demo" : ""}
                      </p>
                      <p className="font-semibold truncate">
                        {chat.title || "New Chat"}
                      </p>
                    </button>

                    <div className="relative shrink-0">
                      <button
                        onClick={() =>
                          setMenuChatId((prev) => (prev === chat._id ? null : chat._id))
                        }
                        className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 transition text-sm font-semibold"
                      >
                        ⋯
                      </button>

                      {menuChatId === chat._id && (
                        <div className="absolute right-0 top-10 w-36 rounded-2xl border border-white/10 bg-slate-950 shadow-2xl z-30 overflow-hidden">
                          <button
                            onClick={() => loadMessages(chat._id)}
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

            <div className="p-4 border-t border-white/10">
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 transition font-semibold"
              >
                Back to Dashboard
              </button>
            </div>
          </aside>

          <section className="glass-card rounded-[32px] overflow-hidden h-full min-h-0 flex flex-col">
            <div className="border-b border-white/10 px-4 md:px-6 py-4 flex items-center justify-between gap-4 shrink-0">
              <div className="min-w-0">
                <p className="text-blue-300 text-xs md:text-sm uppercase tracking-[0.2em] font-semibold mb-1">
                  Active Workspace
                </p>
                <h1 className="text-2xl md:text-3xl font-black truncate">
                  {activeChatTitle}
                </h1>
                <p className="text-xs text-slate-400 mt-2">
                  Total Messages: {messages.length}
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap justify-end">
                <span className="px-3 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-400/20">
                  Demo Mode
                </span>

                <button
                  onClick={handleExportPDF}
                  disabled={exportingPdf || messages.length === 0}
                  className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-semibold transition"
                >
                  {exportingPdf ? "Exporting..." : "Export PDF"}
                </button>

                <button
                  onClick={createNewChat}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition text-sm font-semibold"
                >
                  New Chat
                </button>

                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 transition text-sm font-semibold"
                >
                  Chats
                </button>
              </div>
            </div>

            <div className="px-4 md:px-6 py-3 border-b border-white/10 bg-white/5 shrink-0">
              <p className="text-slate-300 text-sm md:text-base">
                Ask your doubt and get a short, useful student-friendly answer.
              </p>
            </div>

            <div
              id="chat-export"
              className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4 bg-transparent min-h-0"
            >
              {historyLoading ? (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-3xl rounded-bl-lg bg-slate-900/80 border border-white/10 px-5 py-4">
                    <span className="text-slate-300">Loading chat history...</span>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-400/20 flex items-center justify-center mb-4 text-2xl">
                    💬
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black mb-3">Ask your first doubt</h2>
                  <p className="text-slate-300 max-w-2xl leading-8 mb-6">
                    Your AI quota can be added later. For now, this project supports
                    a polished demo mode with suggested questions and fake AI typing.
                  </p>

                  <div className="grid md:grid-cols-2 gap-3 w-full max-w-3xl">
                    {SUGGESTIONS.map((item) => (
                      <button
                        key={item}
                        onClick={() => handleSend(item)}
                        className="text-left rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-4 transition"
                      >
                        <p className="font-semibold">{item}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        msg.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[88%] md:max-w-[78%] px-4 md:px-5 py-3 rounded-3xl shadow-md ${
                          msg.sender === "user"
                            ? "bg-blue-600 text-white rounded-br-lg shadow-blue-900/30"
                            : "bg-slate-900/80 text-slate-100 border border-white/10 rounded-bl-lg"
                        }`}
                      >
                        {msg.sender === "ai" ? (
                          <div className="chat-markdown text-sm md:text-base leading-7">
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap leading-7 text-sm md:text-base">
                            {msg.text}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}

              {(loading || isTypingDemo) && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-3xl rounded-bl-lg bg-slate-900/80 border border-white/10 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-300 text-sm md:text-base">
                        AI is typing
                      </span>
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                        <span
                          className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.15s" }}
                        />
                        <span
                          className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.3s" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            <div className="border-t border-white/10 p-4 md:p-5 bg-slate-950/40 shrink-0">
              {messages.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {SUGGESTIONS.slice(0, 4).map((item) => (
                    <button
                      key={item}
                      onClick={() => handleSend(item)}
                      className="px-3 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-sm transition"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-3">
                <textarea
                  placeholder="Type your doubt here..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  rows={2}
                  className="flex-1 resize-none px-4 py-4 rounded-2xl bg-slate-900/80 border border-white/10 text-white outline-none focus:border-blue-500 text-sm md:text-base"
                />

                <button
                  onClick={() => handleSend()}
                  disabled={loading || historyLoading}
                  className="md:w-[150px] px-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition font-semibold"
                >
                  {loading || isTypingDemo ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm">
          <div className="w-[88%] max-w-sm h-full bg-slate-950 border-r border-white/10 p-5 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold">Chats</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 transition"
              >
                Close
              </button>
            </div>

            <button
              onClick={createNewChat}
              className="w-full px-5 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 transition font-semibold mb-5"
            >
              + New Chat
            </button>

            <div className="flex-1 overflow-y-auto space-y-3">
              {chats.map((chat, index) => (
                <div
                  key={chat._id}
                  className={`rounded-3xl p-4 transition border ${
                    activeChatId === chat._id
                      ? "bg-blue-600/20 border-blue-400/30"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      onClick={() => loadMessages(chat._id)}
                      className="text-left flex-1 min-w-0"
                    >
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 mb-2">
                        Chat {String(index + 1).padStart(2, "0")}
                        {chat.isLocalOnly ? " • Demo" : ""}
                      </p>
                      <p className="font-semibold truncate">
                        {chat.title || "New Chat"}
                      </p>
                    </button>

                    <div className="relative shrink-0">
                      <button
                        onClick={() =>
                          setMenuChatId((prev) => (prev === chat._id ? null : chat._id))
                        }
                        className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 transition text-sm font-semibold"
                      >
                        ⋯
                      </button>

                      {menuChatId === chat._id && (
                        <div className="absolute right-0 top-10 w-36 rounded-2xl border border-white/10 bg-slate-950 shadow-2xl z-30 overflow-hidden">
                          <button
                            onClick={() => loadMessages(chat._id)}
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
          </div>
        </div>
      )}
    </div>
  );
}