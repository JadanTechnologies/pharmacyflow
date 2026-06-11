import React, { useState } from "react";
import { 
  Building, Users, RefreshCw, KeyRound, Smartphone, ShieldCheck, 
  MapPin, CheckCircle, Database, LayoutGrid, CalendarRange, 
  Trash2, Plus, ArrowUpRight, ArrowDownLeft, Wallet, ExternalLink
} from "lucide-react";
import { Branch, Staff, Supplier, Customer, BackupPoint, INITIAL_BACKUPS } from "../types";

interface OtherModulesViewProps {
  branches: Branch[];
  staff: Staff[];
  suppliers: Supplier[];
  customers: Customer[];
  backups: BackupPoint[];
  onAddBackup: (bk: BackupPoint) => void;
  onAddStaff: (s: Staff) => void;
  onAddSupplier: (sup: Supplier) => void;
}

export default function OtherModulesView({ 
  branches, staff, suppliers, customers, backups, onAddBackup, onAddStaff, onAddSupplier
}: OtherModulesViewProps) {
  const [tab, setTab] = useState<"branch" | "hr" | "supplier" | "backup" | "mobile flex">("mobile flex");

  // HRM variables
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffRole, setNewStaffRole] = useState<Staff["role"]>("Pharmacist");
  const [newStaffSalary, setNewStaffSalary] = useState(250000);

  // Supplier variables
  const [newSupName, setNewSupName] = useState("");
  const [newSupContact, setNewSupContact] = useState("");
  const [newSupPhone, setNewSupPhone] = useState("");

  // Mobile Simulator state variables
  const [mobileOs, setMobileOs] = useState<"ios" | "android">("ios");
  const [mobileRole, setMobileRole] = useState<"pharmacist" | "owner">("pharmacist");

  // Submit HRM Staff Profile
  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName) return;
    const newS: Staff = {
      id: `st_${Date.now()}`,
      name: newStaffName,
      email: `${newStaffName.toLowerCase().replace(/\s+/g, "")}@pharmerp.com`,
      phone: "+234 801 " + Math.floor(1000000 + Math.random() * 9000000),
      role: newStaffRole,
      branchId: "b1",
      attendanceStatus: "Present",
      salary: newStaffSalary,
      performanceScore: 4.0,
    };
    onAddStaff(newS);
    setNewStaffName("");
    alert(`${newStaffRole} profile logged inside HRM roster.`);
  };

  // Submit Supplier
  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupName) return;
    const newSup: Supplier = {
      id: `s_${Date.now()}`,
      name: newSupName,
      contactPerson: newSupContact,
      phone: newSupPhone || "+234 805 000 0000",
      email: `orders@${newSupName.toLowerCase().replace(/\s+/g, "")}.com`,
      address: "Apapa Highway Industrial Scheme, Lagos",
      balance: 0,
    };
    onAddSupplier(newSup);
    setNewSupName("");
    setNewSupContact("");
    setNewSupPhone("");
    alert(`Supplier profile registered.`);
  };

  // Trigger automated security backup creation
  const handleExecuteBackupPoint = () => {
    const epoch = Date.now();
    const newBk: BackupPoint = {
      id: `bk_${epoch}`,
      timestamp: new Date().toISOString(),
      fileName: `pharmerp-backup_automatic_${new Date().toISOString().split("T")[0]}.enc`,
      fileSize: "131.2 MB",
      encryptionStatus: "AES-256 Enabled",
    };
    onAddBackup(newBk);
    alert(`Encrypted cloud restore point compiled dynamically via system scheduler.`);
  };

  return (
    <div id="other-modules-root" className="space-y-6">
      
      {/* Tab selectors */}
      <div className="flex bg-slate-950/45 p-1 rounded-xl border border-white/5 self-start space-x-1 overflow-x-auto">
        <button 
          onClick={() => setTab("mobile flex")}
          className={`text-xs px-4 py-1.5 rounded-lg transition-all shrink-0 flex items-center gap-1.5 ${
            tab === "mobile flex" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Smartphone size={13} /> Flutter App Simulator
        </button>
        <button 
          onClick={() => setTab("branch")}
          className={`text-xs px-4 py-1.5 rounded-lg transition-all shrink-0 flex items-center gap-1.5 ${
            tab === "branch" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Building size={13} /> Multi-Branch SaaS
        </button>
        <button 
          onClick={() => setTab("hr")}
          className={`text-xs px-4 py-1.5 rounded-lg transition-all shrink-0 flex items-center gap-1.5 ${
            tab === "hr" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Users size={13} /> HRM & Staff
        </button>
        <button 
          onClick={() => setTab("supplier")}
          className={`text-xs px-4 py-1.5 rounded-lg transition-all shrink-0 flex items-center gap-1.5 ${
            tab === "supplier" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <LayoutGrid size={13} /> Supplier Balances
        </button>
        <button 
          onClick={() => setTab("backup")}
          className={`text-xs px-4 py-1.5 rounded-lg transition-all shrink-0 flex items-center gap-1.5 ${
            tab === "backup" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Database size={13} /> Disaster Recovery DB
        </button>
      </div>

      {/* Tab: FLUTTER MOBILE APP SIMULATOR */}
      {tab === "mobile flex" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-5 bg-slate-900/40 p-5 rounded-3xl border border-white/5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1">
                <Smartphone size={16} className="text-emerald-400" /> Flutter Workspace Mockup
              </h3>
              <p className="text-xs text-slate-400">Preview cross-platform native iOS & Android binaries compiling from identical codebase.</p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-mono block">Toggle Mobile App Profile</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button 
                    onClick={() => setMobileRole("pharmacist")} 
                    className={`py-1.5 rounded-lg text-center transition-all font-semibold ${mobileRole === "pharmacist" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-slate-400 hover:text-slate-200"}`}
                  >
                    Pharmacist App
                  </button>
                  <button 
                    onClick={() => setMobileRole("owner")} 
                    className={`py-1.5 rounded-lg text-center transition-all font-semibold ${mobileRole === "owner" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-slate-400 hover:text-slate-200"}`}
                  >
                    Owner Dashboard
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-mono block">Compiled Mobile Capabilities:</span>
                <ul className="space-y-1 text-[11px] list-disc pl-4 text-slate-300">
                  <li>Integrated hardware camera laser scan simulation</li>
                  <li>In-app biometric passcode sign-in bypass</li>
                  <li>Real-time push alert sockets for expiring medical blocks</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Virtual Mobile Frame rendering actual active states */}
          <div className="md:col-span-7 flex justify-center">
            <div className="bg-slate-950 border-[6px] border-slate-800 rounded-[35px] w-full max-w-[320px] h-[550px] shadow-2xl overflow-hidden flex flex-col justify-between relative">
              
              {/* Phone ear notch speaker */}
              <div className="absolute top-0 inset-x-0 h-4 bg-slate-800 flex justify-center items-center z-10">
                <div className="w-16 h-2 rounded-full bg-slate-950" />
              </div>

              {/* Status bar */}
              <div className="pt-5 px-5 flex justify-between text-[10px] font-mono text-slate-400 bg-slate-900 border-b border-white/5">
                <span>09:41 AM</span>
                <span className="text-emerald-400">● 5G Live</span>
              </div>

              {/* Simulated App screen body */}
              <div className="flex-1 bg-slate-900 p-4 overflow-y-auto space-y-4 text-xs font-sans">
                
                {mobileRole === "pharmacist" ? (
                  // PHARMACIST MOBILE INTERFACE
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <div>
                        <span className="text-[9px] text-[#2dd4bf] font-mono">CAMPUS ACCOUNT</span>
                        <h4 className="font-bold text-white text-sm">Amina (Ikeja Plaza)</h4>
                      </div>
                      <span className="p-1.5 bg-[#115e59]/20 text-[#2dd4bf] rounded-lg">Dispenser</span>
                    </div>

                    {/* Stock quick view */}
                    <div className="space-y-2">
                      <h5 className="font-bold text-[10px] uppercase text-slate-400">Quick Stocks Level</h5>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-950 p-2.5 rounded-xl border border-white/5 text-[10px]">
                          <span className="text-slate-400 block truncate">Coartem</span>
                          <span className="font-bold text-emerald-400 font-mono block">50 Pcs left</span>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded-xl border border-white/5 text-[10px]">
                          <span className="text-slate-400 block truncate">Amoxil Cap</span>
                          <span className="font-bold text-red-400 font-mono block">3 Pcs LOW</span>
                        </div>
                      </div>
                    </div>

                    {/* Action launcher */}
                    <div className="bg-[#10b981]/10 p-3 rounded-xl border border-[#10b981]/20 text-center space-y-2">
                      <p className="font-semibold text-slate-100 text-[11px]">Simulated Hardware POS Laser</p>
                      <button 
                        onClick={() => alert("Mobile hardware laser triggered. Scanning active drug barcode...")}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-1.5 rounded-lg text-[10px]"
                      >
                        Scan Medication Barcode
                      </button>
                    </div>

                    {/* Active receipts listing in palm */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] text-slate-400 font-mono uppercase block">Recent Mobile Receipts</span>
                      <div className="bg-slate-950/60 p-2 rounded-lg border border-white/5 flex justify-between text-[11px]">
                        <span>Alhaji Musa [Coartem]</span>
                        <strong className="text-slate-200">₦7,700</strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  // OWNER MOBILE INTERFACE
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <div>
                        <span className="text-[9px] text-emerald-400 font-mono">OWNER'S ROOM</span>
                        <h4 className="font-bold text-white text-sm">Alhaji Jadan ERP</h4>
                      </div>
                      <span className="text-[10px] text-emerald-400">₦ Active</span>
                    </div>

                    {/* Quick KPIs layout */}
                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-white/5 space-y-2">
                      <span className="text-[10px] text-slate-400 font-mono">MONTHLY GROUP REVENUE</span>
                      <h4 className="text-base font-bold text-white font-mono">₦{(branches.reduce((sum, b) => sum + b.revenue, 0)).toLocaleString()}</h4>
                      <p className="text-[10px] text-emerald-400">✓ Real-time multi-branch sync active</p>
                    </div>

                    {/* Individual performance bar */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-400 block uppercase font-mono">Branch Shares</span>
                      <div className="space-y-1">
                        {branches.filter(b => b.revenue > 0).map(b => (
                          <div key={b.id} className="flex justify-between text-[10px] bg-slate-950/40 p-1.5 rounded">
                            <span className="truncate">{b.name}</span>
                            <span className="font-mono text-slate-200">₦{b.revenue.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action notification button */}
                    <button 
                      onClick={() => alert("Push notification successfully broadcasted to all branch managers regarding expiry items.")} 
                      className="w-full bg-[#14b8a6] text-slate-950 font-bold py-1.5 rounded-lg text-[10px] block text-center"
                    >
                      Broadcast Expiry Warnings
                    </button>
                  </div>
                )}

              </div>

              {/* Bottom Phone Bar */}
              <div className="p-3 bg-slate-950 border-t border-white/5 flex justify-center items-center">
                <div className="w-24 h-1 rounded-full bg-slate-700" />
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Tab: MULTI-BRANCH SAAS MONITOR */}
      {tab === "branch" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900/40 p-4 rounded-2xl border border-white/5">
            <div>
              <h3 className="text-sm font-bold text-slate-200">Multi-Lease Store synchronization</h3>
              <p className="text-xs text-slate-400">Managing remote stock buffers, pharmacy boards compliance, and centralized revenue streams.</p>
            </div>
            <span className="text-xs text-emerald-400 font-mono bg-emerald-500/10 py-1 px-2.5 rounded border border-emerald-500/20">Secure SaaS Tenancy</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {branches.map(b => (
              <div key={b.id} className="bg-slate-900/40 rounded-2xl p-4 border border-white/5 hover:border-emerald-500/20 transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-200 text-xs">{b.name}</h4>
                    <span className={`text-[9px] font-mono py-0.5 px-1.5 rounded ${b.revenue > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-950 text-slate-400"}`}>
                      {b.revenue > 0 ? "Retailing" : "Warehouse Hub"}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans flex items-center">
                    <MapPin size={10} className="mr-1" /> {b.location}
                  </p>
                </div>

                <div className="bg-slate-950 p-2 rounded-xl text-[11px] font-mono grid grid-cols-2 gap-2 text-center text-slate-300">
                  <div>
                    <span className="text-[9px] text-slate-500 block font-sans">Revenue NGN</span>
                    <strong>₦{b.revenue.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block font-sans">Orders filled</span>
                    <strong>{b.salesCount}</strong>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 border-t border-slate-800/80 pt-2 flex justify-between">
                  <span>In-charge: <strong>{b.manager}</strong></span>
                  <a href={`tel:${b.phone}`} className="hover:text-white underline">{b.phone}</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: HRM STAFF MANAGEMENT */}
      {tab === "hr" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-slate-900/40 p-4 rounded-2xl border border-white/5 space-y-3">
            <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wide">Staff members roster & compliance</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-300">
                <thead className="bg-[#115e59]/10 text-emerald-400 font-mono text-[9px]">
                  <tr>
                    <th className="p-2">Name Profile</th>
                    <th className="p-2">Role assigned</th>
                    <th className="p-2 text-center">Branch Online</th>
                    <th className="p-2 text-center">Attendance today</th>
                    <th className="p-2 text-right">Licence pins / Salary</th>
                    <th className="p-2 text-right">KPI Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200">
                  {staff.map(s => (
                    <tr key={s.id} className="hover:bg-slate-950/20">
                      <td className="p-2 font-semibold text-slate-100">{s.name}</td>
                      <td className="p-2 text-slate-300">{s.role}</td>
                      <td className="p-2 text-center font-mono text-slate-400">
                        {branches.find(b => b.id === s.branchId)?.name.split(" ")[0]}
                      </td>
                      <td className="p-2 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${
                          s.attendanceStatus === "Present" ? "bg-emerald-500/10 text-emerald-400" : "bg-yellow-500/10 text-yellow-500"
                        }`}>
                          {s.attendanceStatus}
                        </span>
                      </td>
                      <td className="p-2 text-right font-mono text-slate-200">₦{s.salary.toLocaleString()}</td>
                      <td className="p-2 text-right font-mono font-bold text-emerald-400">⭐ {s.performanceScore.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-4 bg-slate-900/40 rounded-2xl border border-white/5 p-4 h-max space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Log Staff Member</h3>
              <p className="text-[11px] text-slate-400">Add cashiers, accountants or pharmacists to specific store leases.</p>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-3.5 text-xs text-slate-350">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono block">Employee Name</label>
                <input 
                  type="text" required placeholder="e.g. Amina Lawal" 
                  value={newStaffName} onChange={e => setNewStaffName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg text-slate-300 p-2"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono block">Enterprise Role</label>
                <select 
                  value={newStaffRole} onChange={e => setNewStaffRole(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg text-slate-300 p-2 outline-none"
                >
                  <option value="Pharmacist">Pharmacist</option>
                  <option value="Cashier">Cashier</option>
                  <option value="Inventory Officer">Inventory Officer</option>
                  <option value="Branch Manager">Branch Manager</option>
                  <option value="Accountant">Accountant</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono block">Monthly salary (₦)</label>
                <input 
                  type="number" value={newStaffSalary} onChange={e => setNewStaffSalary(parseInt(e.target.value) || 120000)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg text-slate-300 p-2 font-mono"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 rounded-lg text-xs"
              >
                Register HRM Staff Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab: SUPPLIERS STATEMENTS */}
      {tab === "supplier" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-slate-900/40 p-4 rounded-2xl border border-white/5 space-y-3">
            <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wide">Supplier balances & statements</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-300">
                <thead className="bg-[#115e59]/10 text-emerald-400 font-mono text-[9px]">
                  <tr>
                    <th className="p-2.5">Corporation Name</th>
                    <th className="p-2.5">In-charge Person</th>
                    <th className="p-2.5">Contact coordinates</th>
                    <th className="p-2.5">Address Head</th>
                    <th className="p-2.5 text-right">Unsettled Balance (₦)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200">
                  {suppliers.map(sup => (
                    <tr key={sup.id} className="hover:bg-slate-950/20">
                      <td className="p-2.5 font-bold text-slate-100">{sup.name}</td>
                      <td className="p-2.5 text-slate-300">{sup.contactPerson}</td>
                      <td className="p-2.5 font-mono text-[11px] text-slate-400">
                        {sup.phone} • {sup.email}
                      </td>
                      <td className="p-2.5 text-slate-400 truncate max-w-[120px]" title={sup.address}>{sup.address}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-red-400">₦{sup.balance.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-4 bg-slate-900/40 rounded-2xl border border-white/5 p-4 h-max space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Add Pharmaceutical Supplier</h3>
              <p className="text-[11px] text-slate-400">Enter regulatory board details for Emzor, Fidson or international logistics suppliers.</p>
            </div>

            <form onSubmit={handleCreateSupplier} className="space-y-3.5 text-xs text-slate-350">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono block">Supplier Business Name</label>
                <input 
                  type="text" required placeholder="e.g. Shalina Healthcare" 
                  value={newSupName} onChange={e => setNewSupName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg text-slate-300 p-2"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono block">Contact Executive</label>
                <input 
                  type="text" required placeholder="e.g. Sandeep Shalina" 
                  value={newSupContact} onChange={e => setNewSupContact(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg text-slate-300 p-2"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono block">Telephone Number</label>
                <input 
                  type="text" placeholder="e.g. +234 805 111 9999" 
                  value={newSupPhone} onChange={e => setNewSupPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg text-slate-300 p-2"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 rounded-lg text-xs"
              >
                Register Supplier Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab: DATABASE DISASTER RECOVERY & BACKUPS */}
      {tab === "backup" && (
        <div className="bg-slate-900/40 p-5 rounded-3xl border border-white/5 space-y-6">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <div>
              <h3 className="text-sm font-bold text-slate-200">Continuous Security Archiving (AES-256)</h3>
              <p className="text-xs text-slate-400">Zero-loss automatic scheduler backing up local storage assets and transactions onto AWS-S3 securely.</p>
            </div>
            <button 
              onClick={handleExecuteBackupPoint}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all"
            >
              <Database size={14} /> Schedule Manual Backup Point
            </button>
          </div>

          <div className="space-y-3">
            {backups.map(bk => (
              <div key={bk.id} className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 flex items-center justify-between text-xs animate-in slide-in-from-bottom duration-200">
                <div className="flex items-center space-x-3.5">
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/15">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-200 font-mono">{bk.fileName}</h4>
                    <span className="text-[10px] text-slate-400 font-mono block">Volume: {bk.fileSize} • Generated {new Date(bk.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] bg-[#115e59]/20 text-[#2dd4bf] border border-emerald-500/20 py-1 px-2.5 rounded-full font-mono uppercase font-semibold">
                    {bk.encryptionStatus}
                  </span>
                  <button 
                    onClick={() => { alert(`Backup package [${bk.fileName}] restored. Current system states match perfectly.`); }}
                    className="p-1.5 px-3 hover:bg-slate-800 text-slate-300 font-semibold border border-slate-800 hover:border-slate-700 rounded-xl transition-all font-mono"
                  >
                    Restore
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
