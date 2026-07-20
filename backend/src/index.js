import express from "express";
import cors from "cors";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import multer from "multer";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

const upload = multer({ dest: join(__dirname, "../uploads/") });

// --- Groq client (optional) ---
let groq = null;
if (process.env.GROQ_API_KEY) {
  const { default: Groq } = await import("groq-sdk");
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
}

// --- Mock script fallback ---
const MOCK_REPLIES = {
  scoping: [
    "Copy that. Now check the primary status panel — read me the error code or any blinking pattern you can see.",
    "Understood. Let's isolate this. Confirm the last known maintenance date and whether power was cycled recently.",
    "Good scoping. I'm marking this as ready to move to documentation. Advance the workflow when you're set.",
  ],
  qa: [
    "Final check — confirm all fasteners are torqued to spec and the access panel is fully seated.",
    "One more: verify the unit ran a clean 60-second self-test after the repair. What was the outcome?",
    "Quality check confirmed. All parameters within tolerance. You're clear to close the job.",
  ],
};

async function getExpertReply(phase, userMessage, equipment, severity) {
  if (groq) {
    try {
      const systemPrompt = `You are a Remote Expert AI guiding a field technician through a ${severity} repair on a ${equipment}.
Phase: ${phase}. Be concise, technical, and professional. Max 2 sentences.`;
      const chat = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_tokens: 120,
      });
      return chat.choices[0]?.message?.content ?? null;
    } catch (err) {
      console.error("[groq error]", err.message);
    }
  }
  // fallback mock
  const pool = MOCK_REPLIES[phase] ?? MOCK_REPLIES.scoping;
  return pool[Math.floor(Math.random() * pool.length)];
}

// --- WebSocket expert channel ---
wss.on("connection", (ws) => {
  console.log("[ws] client connected");

  ws.on("message", async (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }

    const { type, phase, text, equipment, severity } = msg;
    if (type !== "user_message") return;

    // simulate typing delay
    const delay = 1500 + Math.random() * 1500;
    setTimeout(async () => {
      if (ws.readyState !== ws.OPEN) return;
      const reply = await getExpertReply(phase ?? "scoping", text, equipment, severity);
      ws.send(JSON.stringify({ type: "expert_message", text: reply, ts: Date.now() }));
    }, delay);
  });

  ws.on("close", () => console.log("[ws] client disconnected"));
});

// --- Video upload endpoint ---
app.post("/api/recordings", upload.single("video"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  console.log("[upload] received", req.file.originalname, req.file.size, "bytes");
  res.json({ ok: true, id: req.file.filename, size: req.file.size });
});

// --- Health ---
app.get("/api/health", (_req, res) => res.json({ ok: true, ts: Date.now(), groq: !!groq }));

const PORT = process.env.PORT ?? 3001;
server.listen(PORT, () => console.log(`[fieldlink-backend] listening on :${PORT}`));
