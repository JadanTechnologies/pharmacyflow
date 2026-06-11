import React, { useState, useRef, useEffect } from "react";
import { 
  Send, Bot, CornerDownLeft, Volume2, Mic, MicOff, 
  Sparkles, Globe2, RefreshCw, Layers, CheckCircle
} from "lucide-react";

interface Message {
  role: "user" | "model";
  parts: { text: string }[];
}

interface AiAssistantViewProps {
  medicines: any[];
  sales: any[];
  activeBranchId: string;
}

export default function AiAssistantView({ medicines, sales, activeBranchId }: AiAssistantViewProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      parts: [
        {
          text: `**Barka da yau! Marahaban! Welcome!**
I am the **PharmERP AI Voice Assistant**. You can voice-command or text me to query database metrics, analyze drug interactions, formulate pricing reports, or inspect expiries.

Here are a few quick voice commands you can try or say:
* *"Show today's sales and revenue"*
* *"Which medicines will expire this month?"*
* *"Is there any hazard combining Sildenafil and Nitro?"*
* *"Search Paracetamol stock in Ikeja"*`
        }
      ]
    }
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<"en" | "ha" | "ar">("en");
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Web Speech synthesis and recognition integration
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Check for browser SpeechRecognition API support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      
      rec.onstart = () => {
        setIsRecording(true);
      };
      
      rec.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setInput(transcript);
        setIsRecording(false);
        // Automatically submit transcribed text
        handleSubmitText(transcript);
      };

      rec.onerror = (err: any) => {
        console.error("Speech Recognition Error:", err);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      setRecognition(rec);
    }
  }, []);

  // Sync Recognition Language
  useEffect(() => {
    if (recognition) {
      if (language === "ha") {
        recognition.lang = "ha-NG"; // Hausa Nigeria
      } else if (language === "ar") {
        recognition.lang = "ar-AE"; // Arabic
      } else {
        recognition.lang = "en-US"; // English
      }
    }
  }, [language, recognition]);

  // Read Response Aloud via Speech Synthesis
  const speakAloud = (text: string) => {
    if ("speechSynthesis" in window) {
      // Remove markdowns from speech text for pleasant voice-over
      const cleanText = text
        .replace(/\*\*|__/g, "")
        .replace(/\* /g, ". ")
        .replace(/#+/g, "");

      const utterance = new SpeechSynthesisUtterance(cleanText);
      if (language === "ha") {
        utterance.lang = "ha-NG";
      } else if (language === "ar") {
        utterance.lang = "ar-AE";
      } else {
        utterance.lang = "en-US";
      }
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } else {
      alert("TTS Speech synthesis not supported in this frame browser.");
    }
  };

  // Submit Text/Command handler
  const handleSubmitText = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim()) return;

    if (!customText) setInput("");

    // Setup history structure for Gemini
    const userMessage: Message = {
      role: "user",
      parts: [{ text: textToSend }]
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const historyPayload = messages.map(m => ({
        role: m.role,
        parts: m.parts
      }));

      // Enriching query with current application state so Gemini gives highly accurate, fact-grounded responses!
      const currentStockStateList = medicines.map(m => `- ${m.name}: Selling ₦${m.sellingPrice}, Stock available ${m.stock} pcs. Batch ${m.batchNumber}, Expiry ${m.expiryDate}`).join("\n");
      const currentSalesToday = sales.reduce((sum, s) => sum + s.total, 0);
      
      const promptContext = `[REAL-TIME BUSINESS CONTEXT FOR PARSING]
- Today's date is: 2026-06-11 UTC.
- Accumulate Sales recorded in POS so far: ₦${currentSalesToday.toLocaleString()} across active leases.
- Active Stocks details:\n${currentStockStateList}

USER ACTION / VOICE VOICE COMMAND:
"${textToSend}"`;

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: promptContext,
          history: historyPayload,
          language,
          taskType: "general"
        })
      });

      const responseData = await res.json();
      const modelMessage: Message = {
        role: "model",
        parts: [{ text: responseData.text }]
      };

      setMessages(prev => [...prev, modelMessage]);

      // Speak result aloud automatically for audio feedback
      speakAloud(responseData.text);

    } catch (e: any) {
      console.error(e);
      setMessages(prev => [...prev, {
        role: "model",
        parts: [{ text: "System Error. Failed to connect with PharmERP central brain. Connect your Gemini API key in Secrets." }]
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleMicTrigger = () => {
    if (!recognition) {
      alert("Web speech recognition is not supported in this browser. Try typing instead!");
      return;
    }

    if (isRecording) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  // Preset commands handler
  const triggerPreset = (preset: string) => {
    handleSubmitText(preset);
  };

  const clearChatHistory = () => {
    setMessages([
      {
        role: "model",
        parts: [{ text: "Chat history cleared. PharmERP AI is ready for your clinical inquiries." }]
      }
    ]);
  };

  return (
    <div id="ai-assistant-root" className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-12rem)]">
      
      {/* LEFT Chat Frame (8 Columns) */}
      <div className="lg:col-span-8 bg-slate-900/40 p-5 rounded-3xl border border-white/5 flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl relative">
              <Sparkles size={16} />
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                PharmERP AI Assistant <span className="text-[10px] text-teal-300 font-mono tracking-wider bg-[#115e59]/30 px-1.5 py-0.5 rounded uppercase font-semibold">Live v3.5</span>
              </h3>
              <p className="text-[10px] text-slate-400">Natural Language interfaces utilizing server-side Gemini 3.5 LLMs.</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Language Selector */}
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px] font-semibold text-slate-400">
              <button onClick={() => setLanguage("en")} className={`px-2 py-1 rounded transition-colors ${language === "en" ? "bg-emerald-500/10 text-emerald-400 font-bold" : "hover:text-white"}`}>EN</button>
              <button onClick={() => setLanguage("ha")} className={`px-2 py-1 rounded transition-colors ${language === "ha" ? "bg-emerald-500/10 text-emerald-400 font-bold" : "hover:text-white"}`}>HA (Hausa)</button>
              <button onClick={() => setLanguage("ar")} className={`px-2 py-1 rounded transition-colors ${language === "ar" ? "bg-emerald-500/10 text-emerald-400 font-bold" : "hover:text-white"}`}>AR (Arabic)</button>
            </div>

            <button onClick={clearChatHistory} className="text-[10px] text-slate-400 hover:text-white font-mono bg-slate-950 px-2 py-1.5 rounded-lg border border-slate-800 transition-colors">
              Reset
            </button>
          </div>
        </div>

        {/* Conversation Box */}
        <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-2 max-h-[380px]">
          {messages.map((m, idx) => (
            <div 
              key={idx} 
              className={`flex gap-3 max-w-[85%] ${
                m.role === "user" ? "ml-auto flex-row-reverse" : ""
              }`}
            >
              <div className={`p-1.5 rounded-xl text-slate-300 shrink-0 ${m.role === "user" ? "bg-indigo-500/10 text-indigo-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                <Bot size={15} />
              </div>
              <div className={`p-4 rounded-2xl relative group ${
                m.role === "user" 
                  ? "bg-slate-950/40 text-slate-200 rounded-tr-none border border-slate-800/80" 
                  : "bg-slate-900/60 text-slate-100 rounded-tl-none border border-white/5"
              }`}>
                {/* Clean markdown presentation */}
                <div className="text-xs whitespace-pre-wrap leading-relaxed font-sans prose prose-invert">
                  {m.parts[0].text.startsWith("[REAL-TIME") ? textToSendFormatted(m.parts[0].text) : m.parts[0].text}
                </div>
                {m.role === "model" && (
                  <button 
                    onClick={() => speakAloud(m.parts[0].text)}
                    className="absolute -bottom-3 right-3 opacity-0 group-hover:opacity-100 bg-slate-950 border border-slate-800 p-1 rounded-md text-emerald-400 hover:text-emerald-300 transition-all shadow"
                    title="Speak Aloud (TTS)"
                  >
                    <Volume2 size={11} />
                  </button>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-2 text-xs text-slate-400 items-center">
              <Bot size={14} className="animate-spin text-emerald-400" />
              <span>PharmERP core brain resolving parameters...</span>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input Bar */}
        <div className="border-t border-slate-800/80 pt-3">
          <div className="flex gap-2">
            
            {/* Microphone Trigger */}
            <button 
              onClick={handleMicTrigger}
              className={`p-3 rounded-xl border transition-all shrink-0 ${
                isRecording 
                  ? "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse" 
                  : "bg-slate-950/70 text-slate-400 border-slate-800 hover:border-slate-700"
              }`}
              title={isRecording ? "Listening... click to end" : "Click to speak clinical command"}
            >
              {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            <input 
              type="text"
              placeholder={isRecording ? "Speak now..." : "Ask me anything about stock, pricing trends, or dosage interaction warnings..."}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSubmitText(); }}
              className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 text-xs px-4 focus:outline-none focus:border-emerald-500 font-sans"
              disabled={isRecording}
            />

            <button 
              onClick={() => handleSubmitText()}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 rounded-xl flex items-center transition-all"
            >
              <Send size={14} />
            </button>
          </div>
          {isRecording && (
            <div className="flex justify-center mt-2.5">
              <span className="text-[10px] text-red-400 font-mono animate-pulse flex items-center gap-1">
                🎙️ Speech-to-text capturing live mic, speak clearly inside your room...
              </span>
            </div>
          )}
        </div>

      </div>

      {/* RIGHT Presets & Quick Actions (4 Columns) */}
      <div className="lg:col-span-4 bg-slate-900/40 p-4 rounded-3xl border border-white/5 flex flex-col justify-between">
        <div className="space-y-4">
          <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest border-b border-slate-800/80 pb-2">
            Voice Presets (Macros)
          </h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">Select quick presets which feeds database contexts directly to the AI engine.</p>
          
          <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
            
            <button 
              onClick={() => triggerPreset("Show today's sales and revenue")}
              className="w-full text-left bg-slate-950/40 hover:bg-slate-950/80 p-2.5 rounded-xl border border-white/5 hover:border-emerald-500/30 text-xs transition-all text-slate-100 flex items-start gap-2.5"
            >
              <span className="p-1 px-1.5 bg-emerald-500/10 text-emerald-400 rounded text-[9px] font-mono">EN</span>
              <div className="space-y-0.5">
                <p className="font-semibold text-slate-200">Revenue stats</p>
                <p className="text-[9px] text-slate-400 italic">"Show today's sales and revenue"</p>
              </div>
            </button>

            <button 
              onClick={() => triggerPreset("Which medicines will expire this month?")}
              className="w-full text-left bg-slate-950/40 hover:bg-slate-950/80 p-2.5 rounded-xl border border-white/5 hover:border-emerald-500/30 text-xs transition-all text-slate-100 flex items-start gap-2.5"
            >
              <span className="p-1 px-1.5 bg-emerald-500/10 text-emerald-400 rounded text-[9px] font-mono">EN</span>
              <div className="space-y-0.5">
                <p className="font-semibold text-slate-200">Expiry Forecast</p>
                <p className="text-[9px] text-slate-400 italic">"Which medicines will expire this month?"</p>
              </div>
            </button>

            <button 
              onClick={() => triggerPreset("Is there any hazard combining Sildenafil and Nitro?")}
              className="w-full text-left bg-slate-950/40 hover:bg-slate-950/80 p-2.5 rounded-xl border border-white/5 hover:border-emerald-500/30 text-xs transition-all text-slate-100 flex items-start gap-2.5"
            >
              <span className="p-1 px-1.5 bg-orange-500/10 text-orange-400 rounded text-[9px] font-mono">EN</span>
              <div className="space-y-0.5">
                <p className="font-semibold text-slate-200">Drug Interaction Hazard</p>
                <p className="text-[9px] text-slate-400 italic">"Is there any hazard combining Sildenafil and Nitro?"</p>
              </div>
            </button>

            <button 
              onClick={() => {
                setLanguage("ha");
                triggerPreset("Paracetamol stock level da generic alternatives");
              }}
              className="w-full text-left bg-slate-950/40 hover:bg-slate-950/80 p-2.5 rounded-xl border border-white/5 hover:border-emerald-500/30 text-xs transition-all text-slate-100 flex items-start gap-2.5"
            >
              <span className="p-1 px-1.5 bg-indigo-505/10 text-indigo-400 rounded text-[9px] font-mono">HA</span>
              <div className="space-y-0.5">
                <p className="font-semibold text-slate-200">Hausa stock query</p>
                <p className="text-[9px] text-slate-400 italic">"Paracetamol stock level da generic alternatives"</p>
              </div>
            </button>

            <button 
              onClick={() => {
                setLanguage("ar");
                triggerPreset("هل هناك دواء بديل لـ Ventolin Inhaler ؟");
              }}
              className="w-full text-left bg-slate-950/40 hover:bg-slate-950/80 p-2.5 rounded-xl border border-white/5 hover:border-emerald-500/30 text-xs transition-all text-slate-100 flex items-start gap-2.5"
            >
              <span className="p-1 px-1.5 bg-teal-500/10 text-teal-300 rounded text-[9px] font-mono">AR</span>
              <div className="space-y-0.5 text-right w-full pr-4">
                <p className="font-semibold text-slate-200">Arabic drug query</p>
                <p className="text-[9px] text-slate-400 italic">"هل هناك دواء بديل لـ Ventolin Inhaler ؟"</p>
              </div>
            </button>

          </div>
        </div>

        <div className="bg-slate-950/40 p-3.5 rounded-2xl border border-white/5 text-[10px] text-slate-400 mt-4 flex items-center gap-2">
          <Globe2 size={16} className="text-emerald-400 shrink-0" />
          <span>Multilingual LLM voice responses can utilize the browser TTS engine dynamically. Click speaker buttons to play.</span>
        </div>
      </div>

    </div>
  );
}

// Helpers to isolate large formatted input contexts in logs
function textToSendFormatted(raw: string): string {
  if (raw.includes("USER ACTION / VOICE VOICE COMMAND:")) {
    const parts = raw.split("USER ACTION / VOICE VOICE COMMAND:");
    return parts[1] ? parts[1].replace(/"/g, "").trim() : raw;
  }
  return raw;
}
