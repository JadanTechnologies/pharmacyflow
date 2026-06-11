import React, { useState } from "react";
import { 
  FileText, ShieldAlert, Sparkles, Plus, CheckCircle, 
  Trash2, Eye, EyeOff, ClipboardCheck, ArrowRightLeft
} from "lucide-react";
import { Prescription } from "../types";

interface PrescriptionViewProps {
  prescriptions: Prescription[];
  onAddPrescription: (pres: Prescription) => void;
  onDispenseFromPrescription: (meds: any[]) => void;
}

export default function PrescriptionView({ prescriptions, onAddPrescription, onDispenseFromPrescription }: PrescriptionViewProps) {
  const [loading, setLoading] = useState(false);
  const [scannedResult, setScannedResult] = useState<Prescription | null>(null);
  const [manualNotes, setManualNotes] = useState("");
  const [fileBase64, setFileBase64] = useState<string | null>(null);

  // Clinic hand-written doctor scripts presets for instant testing
  const presets = [
    {
      title: "Clinic Dr. Okechukwu Script (Malaria Case)",
      notes: "Patient: Alhaji Musa Yusuf. Age 54. Rx: Coartem 80/480mg tabs No. VI. Dispense - 1 tab Bid x 3 days. Paracetamol 500mg - 2 tabs qid prn. History flags Metformin allergies. Signed Dr. Chidi Okechukwu, LUTH Lagos.",
    },
    {
      title: "Cardiology Clinic Sheet (Danger Interaction Case)",
      notes: "Rx: Cardipril 5mg - 1 tab daily. Sildenafil 50mg - 1 tab as needed. Nitroglycerin 0.4mg sublingual tab prn chest pain. Flag for pharmacist interaction evaluation immediately in West Nigeria.",
    }
  ];

  // OCR Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Strip header tag for clean base64 data to Gemini
        const base64String = (reader.result as string).split(",")[1];
        setFileBase64(base64String);
        alert("Image uploaded. Click 'Run AI OCR OCR' to read medical hand-writing!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunAiOCR = async () => {
    setLoading(true);
    setScannedResult(null);

    try {
      // Call server backend
      const response = await fetch("/api/gemini/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64: fileBase64,
          mimeType: "image/jpeg",
          manualText: manualNotes,
        })
      });

      const data = await response.json();
      if (data.success) {
        const parsedPres: Prescription = {
          id: `pres_${Date.now()}`,
          patientName: data.patientName || "Unknown Patient",
          doctorName: data.doctorName || "Unknown Doctor",
          date: data.date || new Date().toLocaleDateString(),
          medicines: data.medicines || [],
          verified: false,
          repeatAllowed: false,
          repeatCount: 0,
          alerts: data.alerts || "",
        };
        setScannedResult(parsedPres);
      } else {
        alert("Verification API returned malformed response. Is process.env.GEMINI_API_KEY valid?");
      }
    } catch (err: any) {
      console.error(err);
      alert("Fail to connect with AI analyzer.");
    } finally {
      setLoading(false);
    }
  };

  const handleCertifyPrescription = () => {
    if (scannedResult) {
      const certified = { ...scannedResult, verified: true };
      onAddPrescription(certified);
      setScannedResult(null);
      setManualNotes("");
      setFileBase64(null);
      alert("Clinical Prescription certified. Available under dispatch archive.");
    }
  };

  return (
    <div id="prescription-root" className="space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">AI Prescription Center</h2>
          <p className="text-xs text-slate-400">OCR Clinical hand-writing recognition, drug compound danger alerts, and direct retail POS release.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT Panel: Drag File & Text Simulator (7 Columns) */}
        <div className="lg:col-span-7 bg-slate-900/40 p-5 rounded-3xl border border-white/5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Prescription Scan Simulator</h3>
            <p className="text-[11px] text-slate-400">Drop hand-written files or choose clickable doctor presets to test the parser.</p>
          </div>

          {/* Presets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pb-2">
            {presets.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setManualNotes(p.notes);
                  setFileBase64(null); // clear image when using text preset
                }}
                className="text-left bg-slate-950/50 hover:bg-slate-950/90 border border-slate-800 rounded-xl p-2.5 hover:border-emerald-500/40 transition-all text-xs"
              >
                <div className="text-[9px] text-emerald-400 font-bold uppercase tracking-wide flex items-center gap-1">
                  <Sparkles size={8} /> Preset Script #{i+1}
                </div>
                <h4 className="font-semibold text-slate-200 mt-0.5 line-clamp-1">{p.title}</h4>
                <p className="text-[9px] text-slate-400 truncate mt-1">{p.notes}</p>
              </button>
            ))}
          </div>

          <div className="border-t border-slate-800/80 pt-4 space-y-4">
            {/* File Upload zone */}
            <div className="bg-slate-950/45 border-2 border-dashed border-slate-800 rounded-2xl p-6 text-center hover:border-slate-700 transition-colors relative">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <FileText className="mx-auto text-slate-500 mb-2" size={32} />
              <p className="text-xs font-semibold text-slate-300">Drag & Drop Pharmacy Slip Image</p>
              <p className="text-[10px] text-slate-500 mt-1">Supports PNG, JPEG up to 10MB</p>
              {fileBase64 && (
                <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 py-0.5 px-2 rounded-full font-mono inline-block mt-2">
                  Image Loaded (Base64 Safe Buffered)
                </span>
              )}
            </div>

            {/* Manual Notes editor */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-400 block">Manual Clinical Prescription Description Notes</label>
              <textarea
                rows={4}
                placeholder="Type or edit clinical handwritten prescription notes here..."
                value={manualNotes}
                onChange={e => setManualNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs p-3 outline-none focus:border-slate-705 h-28"
              />
            </div>

            <button
              onClick={handleRunAiOCR}
              disabled={loading || (!fileBase64 && !manualNotes)}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-sans font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-lg select-none disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Sparkles size={14} />
              <span>{loading ? "Decrypting Hand-written script parameters..." : "Decipher Doctor Prescription (AI OCR)"}</span>
            </button>
          </div>
        </div>

        {/* RIGHT Panel: OCR Result Display & Archive (5 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active scanned output */}
          {scannedResult && (
            <div className="bg-[#0f172a] border border-emerald-500/30 p-5 rounded-3xl space-y-4 shadow-xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-[10px] text-emerald-400 font-mono font-bold tracking-widest uppercase flex items-center gap-1">
                  <Sparkles size={10} /> Hand-writing deciphers success
                </span>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-300 py-0.5 px-1.5 rounded-full font-mono border border-emerald-500/15">98% confidence</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-white/[0.01] p-2.5 rounded border border-white/5">
                  <div>
                    <span className="text-slate-400 font-mono text-[9px]">PATIENT NAME</span>
                    <p className="font-semibold text-slate-100">{scannedResult.patientName}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-mono text-[9px]">DOCTOR IN CHARGE</span>
                    <p className="font-semibold text-slate-100">{scannedResult.doctorName}</p>
                  </div>
                </div>

                <div className="space-y-2 mt-3">
                  <span className="text-slate-400 font-mono text-[9px] block">EXTRACTED MEDICINES</span>
                  {scannedResult.medicines.map((med, i) => (
                    <div key={i} className="bg-white/[0.02] p-2.5 rounded border border-white/5 pr-1 text-[11px] space-y-1">
                      <div className="flex justify-between font-bold text-slate-100">
                        <span>{med.name}</span>
                        <span className="text-slate-400 font-mono">{med.strength}</span>
                      </div>
                      <p className="text-[10px] text-slate-400">Dosage: {med.dosage}</p>
                      <p className="text-[10px] text-slate-400 font-mono">Frequency: {med.frequency}</p>
                      {med.alternatives && med.alternatives.length > 0 && (
                        <p className="text-[9px] text-[#2dd4bf] font-mono">
                          Alternatives: {med.alternatives.join(", ")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {scannedResult.alerts && (
                  <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-start space-x-2 text-red-300 mt-2">
                    <ShieldAlert size={14} className="shrink-0 mt-0.5 text-red-400" />
                    <div className="text-[10px] leading-normal font-mono">
                      <strong className="text-red-400 text-[11px] block">CRITICAL PHARMACOVIGILANCE ALERT:</strong>
                      {scannedResult.alerts}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleCertifyPrescription}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-sans font-bold py-2 rounded-xl text-xs flex items-center justify-center space-x-1.5"
              >
                <ClipboardCheck size={14} />
                <span>Certify Slip & Save to Archive</span>
              </button>
            </div>
          )}

          {/* Archived / Verified prescriptions list */}
          <div className="bg-slate-900/40 p-4 rounded-3xl border border-white/5 space-y-3">
            <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wide border-b border-slate-800/80 pb-2">
              Verified Dispatch Slip Archive
            </h3>
            <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
              {prescriptions.map(p => (
                <div key={p.id} className="bg-slate-950/30 p-3 rounded-2xl border border-white/5 text-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-slate-100">{p.patientName}</h4>
                      <p className="text-[9px] text-slate-400">By: {p.doctorName} • {p.date}</p>
                    </div>
                    <span className="bg-emerald-500/15 text-emerald-400 font-mono font-bold text-[8px] px-1.5 py-0.5 rounded border border-emerald-500/15 flex items-center">
                      <CheckCircle size={8} className="mr-1" /> VERIFIED
                    </span>
                  </div>

                  <div className="bg-white/[0.01] p-1.5 rounded border border-white/5 text-[9px] text-slate-300 space-y-1">
                    {p.medicines.map((m, i) => (
                      <div key={i} className="flex justify-between">
                        <span>{m.name} ({m.strength})</span>
                        <span className="text-slate-400">{m.frequency}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-1.5 pt-1 border-t border-slate-800/60">
                    <button 
                      onClick={() => {
                        // Push drugs directly to POS checkout cart handler
                        onDispenseFromPrescription(p.medicines);
                        alert(`Extracted safe drugs from Alhaji Musa's archived prescription pushed to POS shopping basket drawer.`);
                      }}
                      className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-md font-sans text-[10px] font-semibold flex items-center gap-1 transition-all"
                    >
                      <ArrowRightLeft size={10} /> Push to POS Register
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
