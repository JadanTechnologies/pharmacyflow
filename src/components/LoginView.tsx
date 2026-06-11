import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Pill, Lock, User, Eye, EyeOff, ShieldCheck, 
  AlertCircle, Fingerprint, Activity, Terminal, KeyRound, Building
} from "lucide-react";
import { ERPUser } from "../types";

interface LoginViewProps {
  users: ERPUser[];
  onLoginSuccess: (user: ERPUser) => void;
}

export default function LoginView({ users, onLoginSuccess }: LoginViewProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [systemState, setSystemState] = useState("SECURE GATEWAY IDLE");

  // Filter out active accounts for quick-select help
  const activeDirectoryUsers = users.filter((u) => u.status === "Active");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    setSystemState("AUTHENTICATING KEYRING MATCH...");

    setTimeout(() => {
      const foundUser = users.find(
        (u) => u.username.toLowerCase() === username.trim().toLowerCase()
      );

      if (!foundUser) {
        setError("Operational Identity not registered in central database.");
        setIsLoading(false);
        setSystemState("ACCESS DENIED");
        return;
      }

      if (foundUser.passwordHash !== password) {
        setError("Keyring signature mismatch. Please review credentials.");
        setIsLoading(false);
        setSystemState("ACCESS DENIED");
        return;
      }

      if (foundUser.status === "Suspended") {
        setError(`This operative node (${foundUser.username}) is suspended.`);
        setIsLoading(false);
        setSystemState("ACCESS RESTRICTED");
        return;
      }

      // Success animation sequence
      setSystemState("DECRYPTING INTERFACE MATRIX...");
      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess(foundUser);
      }, 700);
    }, 1200);
  };

  const handleQuickLogin = (user: ERPUser) => {
    setUsername(user.username);
    setPassword(user.passwordHash);
    setError(null);
  };

  // 4 Animated glow bubbles drifting slowly in vectors across different polarities
  const driftBubbles = [
    { id: 1, baseColor: "bg-emerald-500/10", size: "w-[450px] h-[450px]" },
    { id: 2, baseColor: "bg-teal-500/10", size: "w-[380px] h-[380px]" },
    { id: 3, baseColor: "bg-cyan-500/5", size: "w-[500px] h-[500px]" },
    { id: 4, baseColor: "bg-indigo-500/5", size: "w-[400px] h-[400px]" },
  ];

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-[#0a0f1d] text-slate-100 selection:bg-emerald-500 selection:text-white font-sans">
      
      {/* Dynamic Background Atmosphere */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Glowing Orbs with different vector floating movements */}
        <motion.div 
          className="absolute rounded-full filter blur-[100px] bg-emerald-500/10 w-[450px] h-[450px] -top-20 -left-20"
          animate={{
            x: [0, 80, -40, 0],
            y: [0, -60, 40, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div 
          className="absolute rounded-full filter blur-[90px] bg-teal-500/10 w-[380px] h-[380px] bottom-10 right-10"
          animate={{
            x: [0, -90, 50, 0],
            y: [0, 50, -80, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div 
          className="absolute rounded-full filter blur-[110px] bg-cyan-500/5 w-[500px] h-[500px] top-1/3 left-1/4"
          animate={{
            scale: [1, 1.15, 0.9, 1],
            x: [-40, 40, -20, -40],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Diagonal Tech-Grid Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, #34d399 1px, transparent 1px)`,
            backgroundSize: "24px 24px"
          }}
        />
      </div>

      {/* Mini top ribbon for security clearance feedback */}
      <header className="relative z-10 w-full p-6 flex justify-between items-center bg-gradient-to-b from-black/20 to-transparent">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/15">
            <Pill size={20} className="rotate-45 text-slate-950 animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-wider text-white font-sans uppercase">PharmERP Enterprise</h1>
            <p className="text-[10px] text-emerald-400/80 font-mono tracking-tight">NATIONAL LOGISTICS CENTRAL HUB</p>
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-2 bg-slate-900/60 border border-slate-850 px-3 py-1 text-[10px] tracking-widest text-slate-400 rounded-full font-mono">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
          <span>VAULT ENCRYPTION: SECURE</span>
        </div>
      </header>

      {/* Central Login Layout */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
        
        {/* Core Auth Glassmorphic Portal Container */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-xl bg-slate-950/45 backdrop-blur-xl border border-slate-800/85 rounded-2xl p-6 sm:p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden"
        >
          {/* Subtle neon glowing header border inside card */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-80" />

          {/* Heading intro */}
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-900/80 border border-slate-800 text-emerald-400 shadow-inner mb-2">
              <Fingerprint size={24} className="animate-pulse" />
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight font-sans">Authorized Portal Gateway</h2>
            <p className="text-xs text-slate-400 font-sans max-w-sm mx-auto">
              Please declare your clearance coordinates to open the PharmERP executive cockpit.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Error alerts with animations */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-rose-500/10 border border-rose-500/30 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-rose-300"
                >
                  <AlertCircle size={16} className="shrink-0 text-rose-400 mt-0.5" />
                  <div>
                    <span className="font-bold">Credential Error:</span> {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input username styled as a Dropdown Select or custom searchable field */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase flex items-center justify-between">
                <span>SELECT OPERATIVE ALIAS</span>
                <span className="font-mono text-[9px] text-[#2dd4bf]">ACTIVE DIRECTORY DROP-DOWN</span>
              </label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-emerald-400 transition-colors z-10">
                  <User size={16} />
                </div>
                <select
                  required
                  disabled={isLoading}
                  value={username && users.some(u => u.username === username) ? username : username ? "CUSTOM_MANUAL" : ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "CUSTOM_MANUAL") {
                      setUsername("");
                    } else {
                      setUsername(val);
                    }
                    setError(null);
                  }}
                  className="w-full bg-[#0d1527]/95 border border-slate-800 focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/10 pl-10 pr-10 py-3 rounded-xl text-sm font-medium text-white outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#0a0f1d] text-slate-450 font-sans">-- Choose registered username --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.username} className="bg-[#0a0f1d] text-slate-200">
                      {u.username} ({u.role} — Branch: {u.branchId === "all" ? "All" : u.branchId}) {u.status === "Suspended" ? "[SUSPENDED]" : ""}
                    </option>
                  ))}
                  <option value="CUSTOM_MANUAL" className="bg-[#0a0f1d] text-emerald-400">+ Enter manual custom username...</option>
                </select>
                <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-450">
                  <Building size={14} className="opacity-60" />
                </div>
              </div>
            </div>

            {/* Render auxiliary manual input if they want to override the listing selection */}
            {(!username || !users.some(u => u.username === username)) && (
              <div className="space-y-1.5 animate-in fade-in duration-250">
                <label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                  MANUAL USERNAME ALIAS ENTRY
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter custom username..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#0d1527]/90 border border-slate-800 focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/10 px-4 py-2.5 rounded-xl text-xs font-mono text-white placeholder-slate-600 outline-none transition-all"
                />
              </div>
            )}

            {/* Input password */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase flex items-center justify-between">
                <span>AUTHENTICATION PASSCODE</span>
                <span className="font-mono text-[9px] text-[#2dd4bf]">AES-255 SHIELDED</span>
              </label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-emerald-400 transition-colors">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="🔑 Enter verification code..."
                  className="w-full bg-[#0d1527]/90 border border-slate-800 focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/10 pl-10 pr-11 py-3 rounded-xl text-sm font-medium text-white placeholder-slate-500 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Authenticated Button action */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative group overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 font-extrabold text-white text-xs tracking-widest uppercase cursor-pointer transition-all duration-300 py-3.5 px-6 rounded-xl hover:shadow-[0_0_25px_rgba(16,185,129,0.25)] focus:ring-2 focus:ring-emerald-400 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Activity size={14} className="animate-spin text-white" />
                  <span>NEGOTIATING CENTRAL CORE LOCKS...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  <ShieldCheck size={15} />
                  <span>VERIFY IDENTITY & ACTIVATE CONSOLE</span>
                </span>
              )}
            </button>
          </form>

          {/* Quick-Select Simulation Directories Helper */}
          <div className="mt-8 border-t border-slate-900 pt-5 space-y-3">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
              <span className="tracking-widest uppercase flex items-center gap-1.5">
                <Terminal size={12} className="text-emerald-500/70" />
                DEMO OPERATIVE IDENTITIES
              </span>
              <span className="font-mono text-emerald-400/60 bg-emerald-500/[0.04] px-1.5 py-0.5 rounded border border-emerald-500/10 cursor-pointer">
                AUTOFill AVAILABLE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
              {activeDirectoryUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleQuickLogin(user)}
                  className="p-2 text-left bg-slate-900/40 hover:bg-slate-900/90 border border-slate-850 hover:border-emerald-500/30 rounded-lg text-[11px] transition-all group flex flex-col justify-between cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-bold text-white group-hover:text-emerald-400 transition-colors truncate max-w-[110px]">
                      {user.username}
                    </span>
                    <span className="text-[8px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-1 rounded truncate">
                      {user.role.split(" ")[0]}
                    </span>
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono flex items-center justify-between w-full">
                    <span>Key: {user.passwordHash}</span>
                    <Building size={9} className="opacity-40" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Central System Ledger Logs simulated footer inside card */}
          <div className="mt-6 p-2.5 bg-black/40 rounded-lg border border-slate-900/60 flex items-center justify-between text-[9px] font-mono text-slate-500">
            <span className="flex items-center gap-1 text-emerald-400/80">
              <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
              STATUS:
            </span>
            <span className="font-bold text-right text-slate-400 truncate max-w-[340px]">
              {systemState}
            </span>
          </div>

        </motion.div>
      </main>

      {/* Powered by / Designed footer credential at bottom background */}
      <footer className="relative z-10 w-full py-8 text-center bg-gradient-to-t from-black/50 to-transparent shrink-0">
        <div className="max-w-md mx-auto px-4 space-y-2">
          {/* Main required credit line with generous style */}
          <p className="text-xs font-semibold tracking-wider text-slate-350">
            Developed by <span className="text-emerald-400 font-extrabold">Jadan Tech Solutions Nig Ltd</span> 
            <span className="mx-2 text-slate-600">|</span> 
            <span className="text-teal-300 font-mono">07061511390</span>
          </p>
          <p className="text-[10px] text-slate-600 font-mono tracking-widest uppercase">
            © 2026 PharmERP SaaS System • All Rights Reserved
          </p>
        </div>
      </footer>

    </div>
  );
}
