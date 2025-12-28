import React, { Suspense, lazy, useMemo, useState } from "react";
import { BOARDS } from "./data/boards";
import BoardsGrid from "./components/Boards/BoardsGrid";
import ProfileForm from "./components/Profile/ProfileForm";
import Planner from "./components/Planner/Planner";
import ChatAssistant from "./components/Assistant/ChatAssistant";

// ✅ Lazy-load heavy/fragile modules (TFJS/WebGL) only when needed
const CameraCoach = lazy(() => import("./components/Coach/CameraCoach.jsx"));

const TABS = [
  { key: "boards", label: "Boards" },
  { key: "planner", label: "Planner" },
  { key: "assistant", label: "AI Assistant" },
  { key: "camera", label: "Camera Coach" },
  { key: "profile", label: "Profile" }
];

export default function App() {
  const [boards] = useState(BOARDS);
  const [tab, setTab] = useState("boards");
  const [profileId, setProfileId] = useState(localStorage.getItem("profileId") || "");

  const activeCount = useMemo(
    () => boards.filter((b) => b.status === "active").length,
    [boards]
  );

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 backdrop-blur bg-[#fbfaf7]/80 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight truncate">
              Wellness Boards
            </h1>
            <p className="text-sm text-slate-500">
              clean routine • calm progress • {activeCount} active boards
            </p>
          </div>

          <nav className="flex gap-2 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={[
                  "px-3 py-2 rounded-full text-sm whitespace-nowrap border transition",
                  tab === t.key
                    ? "bg-white border-slate-300 shadow-soft"
                    : "bg-transparent border-transparent hover:border-slate-200 hover:bg-white"
                ].join(" ")}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {tab === "boards" && <BoardsGrid boards={boards} />}

        {tab === "planner" && <Planner profileId={profileId} />}

        {tab === "assistant" && <ChatAssistant profileId={profileId} />}

        {tab === "camera" && (
          <Suspense
            fallback={
              <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-5">
                <p className="text-sm text-slate-600">Loading Camera Coach…</p>
              </div>
            }
          >
            <CameraCoach />
          </Suspense>
        )}

        {tab === "profile" && (
          <ProfileForm
            profileId={profileId}
            onSaved={(newId) => {
              setProfileId(newId);
              localStorage.setItem("profileId", newId);
              setTab("planner");
            }}
          />
        )}
      </main>

      <footer className="max-w-6xl mx-auto px-4 pb-10 text-xs text-slate-500">
        Educational demo • React + Vite • Tailwind • SQLite • OpenAI proxy
      </footer>
    </div>
  );
}
