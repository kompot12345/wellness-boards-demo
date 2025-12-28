import React, { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

const EMPTY = {
  name: "",
  email: "",
  goal: "recovery",
  injury: "",
  heightCm: "",
  weightKg: "",
  age: ""
};

export default function ProfileForm({ profileId, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState({ type: "idle", msg: "" });

  useEffect(() => {
    async function load() {
      if (!profileId) return;
      try {
        const data = await apiFetch(`/api/profile/${profileId}`);
        setForm({
          name: data.name ?? "",
          email: data.email ?? "",
          goal: data.goal ?? "recovery",
          injury: data.injury ?? "",
          heightCm: data.heightCm ?? "",
          weightKg: data.weightKg ?? "",
          age: data.age ?? ""
        });
      } catch {
        // if not found, ignore
      }
    }
    load();
  }, [profileId]);

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save(e) {
    e.preventDefault();
    setStatus({ type: "loading", msg: "Saving..." });

    try {
      const payload = {
        ...form,
        heightCm: form.heightCm === "" ? null : Number(form.heightCm),
        weightKg: form.weightKg === "" ? null : Number(form.weightKg),
        age: form.age === "" ? null : Number(form.age)
      };

      const data = await apiFetch("/api/profile", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      setStatus({ type: "ok", msg: "Saved. Planner + AI are now personalized." });
      onSaved(data.id);
    } catch (err) {
      setStatus({ type: "err", msg: err.message || "Save failed" });
    }
  }

  return (
    <section className="max-w-2xl">
      <h2 className="text-lg font-semibold">Profile</h2>
      <p className="text-sm text-slate-600 mt-1">
        Fill once — then Planner and AI Assistant can personalize guidance.
      </p>

      <form
        onSubmit={save}
        className="mt-5 bg-white rounded-2xl border border-slate-200 shadow-soft p-5 grid gap-4"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Name">
            <input
              className="input"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
            />
          </Field>

          <Field label="Email">
            <input
              className="input"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
            />
          </Field>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Goal">
            <select
              className="input"
              value={form.goal}
              onChange={(e) => update("goal", e.target.value)}
            >
              <option value="recovery">Recovery</option>
              <option value="weightloss">Weight loss</option>
              <option value="strength">Strength</option>
            </select>
          </Field>

          <Field label="Injury / Limitations (optional)">
            <input
              className="input"
              value={form.injury}
              onChange={(e) => update("injury", e.target.value)}
              placeholder="e.g., knee pain, shoulder rehab"
            />
          </Field>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Height (cm)">
            <input
              className="input"
              value={form.heightCm}
              onChange={(e) => update("heightCm", e.target.value)}
              inputMode="numeric"
            />
          </Field>

          <Field label="Weight (kg)">
            <input
              className="input"
              value={form.weightKg}
              onChange={(e) => update("weightKg", e.target.value)}
              inputMode="decimal"
            />
          </Field>

          <Field label="Age">
            <input
              className="input"
              value={form.age}
              onChange={(e) => update("age", e.target.value)}
              inputMode="numeric"
            />
          </Field>
        </div>

        <button
          type="submit"
          className="rounded-full px-4 py-2 bg-slate-900 text-white text-sm hover:opacity-95 w-fit disabled:opacity-60"
          disabled={status.type === "loading"}
        >
          Save Profile
        </button>

        {status.type !== "idle" && (
          <p className={`text-sm ${status.type === "err" ? "text-rose-600" : "text-slate-600"}`}>
            {status.msg}
          </p>
        )}
      </form>

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
        .input:focus { border-color: rgb(148 163 184); box-shadow: 0 0 0 3px rgba(148,163,184,0.25); }
      `}</style>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="grid gap-1">
      <span className="text-xs text-slate-500">{label}</span>
      {children}
    </label>
  );
}
