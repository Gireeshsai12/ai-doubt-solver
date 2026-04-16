import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const features = [
  {
    title: "Instant doubt solving",
    desc: "Ask academic questions anytime and get clear explanations in seconds.",
  },
  {
    title: "Student-friendly answers",
    desc: "Simple step-by-step responses instead of long confusing paragraphs.",
  },
  {
    title: "Clean chat history",
    desc: "Keep all your questions organized so you can revisit them later.",
  },
];

const stats = [
  { label: "Response Style", value: "Clear & short" },
  { label: "Use Case", value: "Study anytime" },
  { label: "Experience", value: "Modern UI" },
];

export default function Landing() {
  return (
    <div className="min-h-screen text-white overflow-hidden relative">
      <div className="floating-orb w-80 h-80 bg-blue-500 top-8 left-8" />
      <div className="floating-orb w-96 h-96 bg-purple-500 top-52 right-10" />
      <div className="floating-orb w-72 h-72 bg-cyan-400 bottom-10 left-[28%]" />

      <Navbar />

      <section className="relative">
        <div className="absolute inset-0 hero-grid opacity-30" />

        <div className="max-w-7xl mx-auto px-6 md:px-8 pt-10 md:pt-16 pb-20 md:pb-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-100px)]">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-sm font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                Smarter studying starts here
              </div>

              <h1 className="text-5xl md:text-7xl font-black leading-[1.04] tracking-tight">
                Solve doubts
                <span className="block text-blue-400">like a future-ready app.</span>
              </h1>

              <p className="mt-6 max-w-2xl text-slate-300 text-lg md:text-xl leading-8">
                A modern AI learning workspace where students can ask questions,
                understand concepts quickly, and keep everything organized in one place.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="px-7 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 transition font-semibold text-center shadow-2xl shadow-blue-900/30"
                >
                  Start Building Your Study Flow
                </Link>

                <Link
                  to="/login"
                  className="px-7 py-4 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 transition font-semibold text-center"
                >
                  Open Existing Account
                </Link>
              </div>

              <div className="mt-10 grid sm:grid-cols-3 gap-4 max-w-2xl">
                {stats.map((item) => (
                  <div
                    key={item.label}
                    className="glass-card rounded-3xl p-4 relative overflow-hidden"
                  >
                    <div className="soft-ring" />
                    <p className="text-slate-400 text-xs mb-2">{item.label}</p>
                    <h3 className="font-bold text-lg">{item.value}</h3>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="glass-card glow-border rounded-[32px] p-5 md:p-7 relative overflow-hidden">
                <div className="absolute top-0 right-0 h-40 w-40 bg-blue-500/15 blur-3xl rounded-full" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-400" />
                      <span className="w-3 h-3 rounded-full bg-yellow-400" />
                      <span className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <span className="text-xs text-slate-400">AI Study Workspace</span>
                  </div>

                  <div className="space-y-4">
                    <div className="ml-auto max-w-[82%] rounded-3xl rounded-br-lg bg-blue-600 px-4 py-3 text-sm md:text-base shadow-lg shadow-blue-900/30">
                      Explain Ohm’s Law in simple words.
                    </div>

                    <div className="max-w-[92%] rounded-3xl rounded-bl-lg bg-slate-900/80 border border-white/10 px-4 py-4">
                      <p className="text-blue-300 font-semibold mb-2">AI Tutor Reply</p>
                      <p className="text-slate-200 leading-7 text-sm md:text-base">
                        Ohm’s Law says that voltage equals current multiplied by resistance.
                        In simple words, more voltage pushes more current, while more resistance
                        makes it harder for current to flow.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-2">
                      <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                        <p className="text-xs text-slate-400 mb-1">Mode</p>
                        <p className="font-semibold">Text</p>
                      </div>
                      <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                        <p className="text-xs text-slate-400 mb-1">Topic</p>
                        <p className="font-semibold">Physics</p>
                      </div>
                      <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                        <p className="text-xs text-slate-400 mb-1">Output</p>
                        <p className="font-semibold">Stepwise</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid sm:grid-cols-3 gap-4">
                {features.map((item) => (
                  <div
                    key={item.title}
                    className="glass-card rounded-3xl p-5 border border-white/10"
                  >
                    <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-300 leading-6">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}