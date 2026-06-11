import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON body support with elevated payload limit for image OCR uploads
app.use(express.json({ limit: "15mb" }));

// Initialize Gemini API client securely on the server side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "dummy-key-for-transient-preview",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Mock Initial data endpoints and standard server checks
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    api_configured: !!process.env.GEMINI_API_KEY,
  });
});

/**
 * Endpoint for General Chat and Voice Assistant processing.
 * Supports context for English, Hausa, and Arabic.
 */
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { message, history = [], taskType = "general", language = "en" } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      // Graceful fallback for demo when key isn't provided
      return res.json({
        text: `[Demo Mode] You said: "${message}". Connect your Gemini API key in AI Studio Secrets to access full intelligence. Here's a helpful offline response regarding inventory and branch performance!`,
      });
    }

    let systemInstruction = `You are "PharmERP AI", a central nervous system for an enterprise-level Pharmacy Management ERP.
You support operations for pharmacies in Nigeria and other African regions.
Be concise, professional, and practical. Speak as an expert pharmacist and consultant.
You can check drug interactions, suggest reorder values, write formula summaries, or translate scripts.
Current language context for answer: ${language} (support Hausa, Arabic, or English directly).
Provide answers styled neatly using Markdown. If explaining medical advice, always add standard disclaimers.`;

    if (taskType === "interaction") {
      systemInstruction += "\nFocus specifically on detecting severe or moderate drug-drug interactions. Outline mechanism and alternative therapies.";
    } else if (taskType === "forecast") {
      systemInstruction += "\nFocus on projecting revenue, sales, and listing optimal FEFO/FIFO stock dispatch orders.";
    } else if (taskType === "voice") {
      systemInstruction += "\nYou are listening to a spoken voice query. Respond briefly and conversationally, ready for text-to-speech rendering.";
    }

    const contents = [...history, { role: "user", parts: [{ text: message }] }];

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({ error: error.message || "Failed to contact AI engine" });
  }
});

/**
 * Endpoint for Prescription parsing (AI OCR simulation).
 * Users can either send an image as a base64 inline string or provide manual text notes.
 */
app.post("/api/gemini/ocr", async (req, res) => {
  try {
    const { base64, mimeType = "image/jpeg", manualText = "" } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      // Graceful fallback simulation
      return res.json({
        success: true,
        patientName: "Audu Ibrahim",
        doctorName: "Dr. Chidi Okechukwu",
        date: new Date().toLocaleDateString(),
        medicines: [
          { name: "Artemether/Lumefantrine", genericName: "Coartem", strength: "80/480mg", dosage: "1 tab twice daily for 3 days", frequency: "Twice daily", purpose: "Uncomplicated Malaria", alternatives: ["Amatem Softgel", "P-Alaxin"] },
          { name: "Paracetamol", genericName: "Acetaminophen", strength: "5000mg", dosage: "2 tabs three times daily", frequency: "Three times daily", purpose: "Fever & pain", alternatives: ["Panadol", "Emzor Paracetamol"] }
        ],
        alerts: "Dosage query flag: Paracetamol 5000mg is listed. This exceeds the maximum daily adult safe threshold of 4000mg! Flagged for pharmacist verification."
      });
    }

    let prompt = "Extract and parse information from this prescription image or clinical notes. Identify patient details, doctor, medicines, strength, exact frequency, medical purpose, and list 2-3 local generic alternatives. If there is a potential dosage or drug danger (e.g. daily toxic Paracetamol limits, combined NSAIDs, etc.), add a safety alert.";

    const contents: any[] = [];
    if (base64) {
      contents.push({
        inlineData: {
          mimeType,
          data: base64,
        },
      });
    }
    if (manualText) {
      prompt += `\nAdditional text reference:\n${manualText}`;
    }
    contents.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: contents },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            patientName: { type: Type.STRING },
            doctorName: { type: Type.STRING },
            date: { type: Type.STRING },
            medicines: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  genericName: { type: Type.STRING },
                  strength: { type: Type.STRING },
                  dosage: { type: Type.STRING },
                  frequency: { type: Type.STRING },
                  purpose: { type: Type.STRING },
                  alternatives: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
              },
            },
            alerts: { type: Type.STRING, description: "Add dosage warnings or interaction alerts here if found." },
          },
          required: ["patientName", "doctorName", "medicines"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, ...parsed });
  } catch (error: any) {
    console.error("Gemini OCR Error:", error);
    res.status(500).json({ error: error.message || "Failed to process prescription scanning." });
  }
});

// Setup Vite Dev Server integration or Production serving
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[PharmERP Server] Ready and listening on http://0.0.0.0:${PORT}`);
  });
}

bootstrap();
