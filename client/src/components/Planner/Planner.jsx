import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../lib/api";

export default function Planner({ profileId }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ dateISO: "", title: "", details: "" });
  const [msg, setMsg] = useState("");

  const disabled = !profileId;

  async function load() {
    if (!profileId) return;
    const data = await apiFetch(`/api/planner?profileId=${encodeURIComponent(profileId)}`);
    setItems(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    load().catch(() => setItems([]));
  }, [profileId]);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const it of items) {
      if (!map.has(it.dateISO)) map.set(it.dateISO, []);
      map.get(it.dateISO).push(it);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [items]);

  async function add(e) {
    e.preventDefault();
    setMsg("");
    if (!profileId) return;

    try {
      await apiFetch("/api/planner", {
        method: "POST",
        body: JSON.stringify({ ...form, profileId })
      });
      setForm({ dateISO: "", title: "", details: "" });
      await load();
    } catch (err) {
      setMsg(err.message || "Could not add item.");
    }
  }

  async function toggleDone(id, current) {
    const next = current === "done" ? "planned" : "done";
    try {
      await apiFetch(`/api/planner/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: next })
      });
      await load();
    } catch {
      // ignore in demo
    }
  }

  return (
    <section className="grid lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-5">
        <h2 className="text-lg font-semibold">Planner</h2>
        <p className="text-sm text-slate-600 mt-1">
          A gentle plan. Stored in SQLite. Tap an item to mark done.
        </p>

        {disabled && (
          <p className="mt-4 text-sm text-rose-600">
            Create a Profile first (tab “Profile”), then Planner will be enabled.
          </p>
        )}

        <form onSubmit={add} className="mt-5 grid gap-3">
          <input
            className="input"
            type="date"
            value={form.dateISO}
            onChange={(e) => setForm((f) => ({ ...f, dateISO: e.target.value }))}
            required
            disabled={disabled}
          />
          <input
            className="input"
            placeholder="Workout title (e.g., Knee mobility 15 min)"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
            disabled={disabled}
          />
          <textarea
            className="textarea"
            placeholder="Notes: pain scale, tempo, cues…"
            value={form.details}
            onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
            disabled={disabled}
          />

          <button
            className="rounded-full px-4 py-2 bg-slate-900 text-white text-sm w-fit disabled:opacity-60"
            disabled={disabled}
          >
            Add to plan
          </button>

          {msg && <p className="text-sm text-rose-600">{msg}</p>}
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-5">
        <h3 className="text-base font-semibold">Schedule</h3>

        <div className="mt-4 grid gap-4">
          {grouped.length === 0 && (
            <p className="text-sm text-slate-600">No items yet.</p>
          )}

          {grouped.map(([dateISO, list]) => (
            <div key={dateISO} className="border border-slate-200 rounded-2xl p-4 bg-[#fbfaf7]">
              <div className="text-sm font-semibold">{dateISO}</div>
              <div className="mt-3 grid gap-2">
                {list.map((it) => (
                  <button
                    key={it.id}
                    onClick={() => toggleDone(it.id, it.status)}
                    className={[
                      "text-left rounded-xl border p-3 transition",
                      it.status === "done"
                        ? "bg-emerald-50 border-emerald-200"
                        : "bg-white border-slate-200 hover:bg-slate-50"
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold">{it.title}</div>
                      <span className="text-xs text-slate-600">{it.status}</span>
                    </div>
                    {it.details && <div className="text-xs text-slate-600 mt-1">{it.details}</div>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .input {
          width: 100%;
          border: 1px solid rgb(226 232 240);
          border-radius: 9999px;
          padding: 10px 12px;
          font-size: 14px;
          outline: none;
          background: white;
        }
        .textarea{
          width: 100%;
          border: 1px solid rgb(226 232 240);
          border-radius: 16px;
          padding: 10px 12px;
          font-size: 14px;
          min-height: 92px;
          outline: none;
          background: white;
        }
      `}</style>
    </section>
  );
}
