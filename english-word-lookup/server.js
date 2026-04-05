import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are a helpful English dictionary assistant. When given an English word or idiom, provide a clear and concise explanation in the following format:

## [Word/Idiom]

**Type:** [noun/verb/adjective/adverb/idiom/phrase/etc.]

**Meaning:**
[Clear, simple explanation in 1-3 sentences]

**Example sentences:**
1. [Natural example sentence]
2. [Another natural example sentence]

**Memory tip:** [A short, memorable tip or association to help remember the word]

Keep responses concise and educational. Always respond in English.`;

app.use(express.json());
app.use(express.static(__dirname));

app.post("/api/lookup", async (req, res) => {
  const { word } = req.body;
  if (!word || typeof word !== "string" || word.trim().length === 0) {
    return res.status(400).json({ error: "Word is required" });
  }

  const trimmedWord = word.trim().slice(0, 200);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await model.generateContentStream(
      `Please look up: "${trimmedWord}"`
    );

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        const data = JSON.stringify({ type: "text", content: text });
        res.write(`data: ${data}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
  } catch (err) {
    const message = err?.message ?? "An unexpected error occurred";
    res.write(`data: ${JSON.stringify({ type: "error", message })}\n\n`);
  } finally {
    res.end();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`English Word Lookup app running at http://localhost:${PORT}`);
  console.log("Make sure GEMINI_API_KEY is set in your environment.");
  console.log("Get a free key at: https://aistudio.google.com/apikey");
});
