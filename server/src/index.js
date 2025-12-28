import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import db from "./db.js";
import { isISODateOnly, makeId } from "./utils.js";

const app = express();

app.use(express.json({ limit: "1mb" }));

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
app.use(cors({ origin: CLIENT_ORIGIN }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// ---------- Profiles ----------
app.post("/api/profile", (req, res) => {
  const body = req.body || {};
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const goal = String(body.goal || "recovery").trim();
  const injury = String(body.injury || "").trim();

  const heightCm = body.heightCm === null || body.heightCm === "" ? null : Number(body.heightCm);
  const weightKg = body.weightKg === null || body.weightKg === "" ? null : Number(body.weightKg);
  const age = body.age === null || body.age === "" ? null : Number(body.age);

  if (!name || !email) return res.status(400).json({ error: "name and email are required" });
  if (!["recovery", "weightloss", "strength"].includes(goal)) {
    return res.status(400).json({ error: "invalid goal" });
  }

  const id = makeId("profile");
  const createdAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO profiles (id, name, email, goal, injury, heightCm, weightKg, age, createdAt)
    VALUES (@id, @name, @email, @goal, @injury, @heightCm, @weightKg, @age, @createdAt)
  `).run({ id, name, email, goal, injury, heightCm, weightKg, age, createdAt });

  res.json({ id, createdAt });
});

app.get("/api/profile/:id", (req, res) => {
  const row = db.prepare(`SELECT * FROM profiles WHERE id = ?`).get(req.params.id);
  if (!row) return res.status(404).json({ error: "not found" });
  res.json(row);
});

// ---------- Planner ----------
app.get("/api/planner", (req, res) => {
  const profileId = String(req.query.profileId || "");
  if (!profileId) return res.status(400).json({ error: "profileId required" });

  const items = db
    .prepare(`SELECT * FROM planner_items WHERE profileId = ? ORDER BY dateISO ASC, createdAt ASC`)
    .all(profileId);

  res.json(items);
});

app.post("/api/planner", (req, res) => {
  const body = req.body || {};
  const profileId = String(body.profileId || "");
  const dateISO = String(body.dateISO || "");
  const title = String(body.title || "").trim();
  const details = String(body.details || "").trim();

  if (!profileId || !title || !dateISO) return res.status(400).json({ error: "missing fields" });
  if (!isISODateOnly(dateISO)) return res.status(400).json({ error: "dateISO must be YYYY-MM-DD" });

  const id = makeId("plan");
  const createdAt = new Date().toISOString();
  const status = "planned";

  db.prepare(`
    INSERT INTO planner_items (id, profileId, dateISO, title, details, status, createdAt)
    VALUES (@id, @profileId, @dateISO, @title, @details, @status, @createdAt)
  `).run({ id, profileId, dateISO, title, details, status, createdAt });

  res.json({ id, createdAt, status });
});

app.patch("/api/planner/:id", (req, res) => {
  const id = String(req.params.id || "");
  const status = String(req.body?.status || "");

  if (!id) return res.status(400).json({ error: "id required" });
  if (!["planned", "done"].includes(status)) return res.status(400).json({ error: "invalid status" });

  const info = db.prepare(`UPDATE planner_items SET status = ? WHERE id = ?`).run(status, id);
  res.json({ updated: info.changes });
});

// ---------- AI Assistant (OpenAI proxy) ----------
const hasKey = Boolean(process.env.OPENAI_API_KEY);
const openai = hasKey ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

app.post("/api/chat", async (req, res) => {
  try {
    if (!openai) return res.status(500).json({ error: "OPENAI_API_KEY is missing on server" });

    const profile = req.body?.profile || null;
    const userMessage = String(req.body?.userMessage || "").trim();
    if (!userMessage) return res.status(400).json({ error: "userMessage required" });

    const instructions = `
You are a calm, supportive wellness coach.
Tone: short, clear sentences. "clean girl wellness" vibe.
Safety: no diagnosis. If pain/red flags, advise clinician.
Output: actionable steps, gentle cues, low-risk suggestions.

User profile:
- goal: ${profile?.goal || "unknown"}
- injury: ${profile?.injury || "none"}
- heightCm: ${profile?.heightCm ?? "n/a"}
- weightKg: ${profile?.weightKg ?? "n/a"}
- age: ${profile?.age ?? "n/a"}
`;

    // Using Responses API via OpenAI Node SDK
    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      instructions,
      input: userMessage
    });

    res.json({ text: response.output_text || "" });
  } catch (e) {
    res.status(500).json({ error: "chat_failed" });
  }
});

const PORT = Number(process.env.PORT || 8080);
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log(`CORS origin: ${CLIENT_ORIGIN}`);
});
