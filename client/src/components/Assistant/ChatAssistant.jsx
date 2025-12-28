import React, { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

export default function ChatAssistant({ profileId }) {
  const [profile, setProfile] = useState(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi. Tell me your goal for today: recovery or fat loss. Keep it simple." }
  ]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function load() {
      setErr("");
      if (!profileId) return setProfile(null);
      try {
        const p = await apiFetch(`/api/profile/${profileId}`);
        setProfile(p);
      } catch {
        setProfile(null);
      }
    }
    load();
  }, [profileId]);

  async function send() {
    const userMessage = input.trim();
    if (!userMessage || busy) return;

    setErr("");
    setMessages((m) => [...m, { role: "user", text: userMessage }]);
    setInput("");
    setBusy(true);

    try {
      const data = await apiFetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ profile, userMessage })
      });
      setMessages((m) => [...m, { role: "assistant", text: data?.text || "No response." }]);
    } catch (e) {
      setErr(e.message || "Chat failed");
      setMessages((m) => [...m, { role: "assistant", text: "Server error. Check backend + API key." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-5 flex flex-col">
        <h2 className="text-lg font-semibold">AI Coach</h2>
        <p className="text-sm text-slate-600 mt-1">
          Personalized tips from your profile. OpenAI runs on the server (safe key handling).
        </p>

        <div className="mt-5 flex-1 overflow-auto border border-slate-200 rounded-2xl p-4 bg-[#fbfaf7]">
          <div className="grid gap-3">
            {messages.map((m, idx) => (
              <div key={idx} className={m.role === "user" ? "justify-self-end" : "justify-self-start"}>
                <div
                  className={[
                    "max-w-[520px] rounded-2xl px-4 py-3 text-sm leading-relaxed border",
                    m.role === "user"
                      ? "bg-white border-slate-200"
                      : "bg-slate-900 text-white border-slate-900"
                  ].join(" ")}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <input
            className="input flex-1"
            placeholder="Ask: “Make me a 20-min knee rehab session”"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            disabled={busy}
          />
          <button
            className="rounded-full px-4 py-2 bg-slate-900 text-white text-sm disabled:opacity-60"
            onClick={send}
            disabled={busy}
          >
            Send
          </button>
        </div>

        {err && <p className="mt-3 text-sm text-rose-600">{err}</p>}
      </div>

      <aside className="bg-white rounded-2xl border border-slate-200 shadow-soft p-5">
        <h3 className="text-base font-semibold">Profile context</h3>

        {!profileId && (
          <p className="text-sm text-rose-600 mt-2">Create Profile first to personalize responses.</p>
        )}

        {profile && (
          <div className="mt-3 text-sm text-slate-700 grid gap-2">
            <Row k="Goal" v={profile.goal} />
            <Row k="Injury" v={profile.injury || "—"} />
            <Row k="Height" v={profile.heightCm ? `${profile.heightCm} cm` : "—"} />
            <Row k="Weight" v={profile.weightKg ? `${profile.weightKg} kg` : "—"} />
            <Row k="Age" v={profile.age ?? "—"} />
          </div>
        )}
      </aside>

      <style>{`
        .input {
          border: 1px solid rgb(226 232 240);
          border-radius: 9999px;
          padding: 10px 12px;
          font-size: 14px;
          outline: none;
          background: white;
        }
      `}</style>
    </section>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2">
      <span className="text-slate-500">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}
