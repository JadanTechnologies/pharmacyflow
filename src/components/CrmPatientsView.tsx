import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, UserPlus, Phone, Mail, FileText, Heart, ShieldAlert, 
  Award, Search, Plus, Trash2, Edit2, RotateCcw, DollarSign, 
  Pill, Printer, FileSpreadsheet, RefreshCw, X, Check, Save, 
  AlertCircle, ChevronRight, MessageSquare, AlertTriangle, ShieldCheck
} from "lucide-react";
import { Customer, Prescription } from "../types";

interface CrmPatientsViewProps {
  customers: Customer[];
  prescriptions: Prescription[];
  onAddCustomer: (newCust: Customer) => void;
  onUpdateCustomer: (updatedCust: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  onAddPrescription: (newPres: Prescription) => void;
  currentUser: { username: string; role: string };
}

export default function CrmPatientsView({
  customers,
  prescriptions,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  onAddPrescription,
  currentUser
}: CrmPatientsViewProps) {
  // Navigation & view states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMedicalFlag, setFilterMedicalFlag] = useState<"all" | "allergies" | "chronic" | "healthy">("all");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  
  // Create / Edit customer states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // State for forms
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    medicalHistory: "",
    loyaltyPoints: 100,
    walletBalance: 0,
    creditLimit: 10000
  });

  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  
  // Create manual prescription directly from patient file drawer state
  const [showAddPrescription, setShowAddPrescription] = useState(false);
  const [newPresData, setNewPresData] = useState({
    doctorName: "Dr. Alhaji Musa (LUTH)",
    alerts: "",
    medicines: [{ name: "", strength: "80/480mg", dosage: "1 Tablet", frequency: "Twice daily" }]
  });

  // Financial adjust states inside drawer
  const [financialAction, setFinancialAction] = useState<"deposit" | "withdraw" | "credit">("deposit");
  const [financialAmount, setFinancialAmount] = useState<string>("");

  // Clean selections
  const currentCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  // Sync prescriptions linked with selected patient
  const patientPrescriptions = useMemo(() => {
    if (!currentCustomer) return [];
    // Filter prescriptions where patientName is similar to customer name
    return prescriptions.filter(p => 
      p.patientName.toLowerCase().trim() === currentCustomer.name.toLowerCase().trim() ||
      currentCustomer.prescriptionHistory.includes(p.id)
    );
  }, [prescriptions, currentCustomer]);

  // Derived dashboard metrics
  const stats = useMemo(() => {
    const total = customers.length;
    const withAllergies = customers.filter(c => 
      c.medicalHistory.toLowerCase().includes("allergi") || 
      c.medicalHistory.toLowerCase().includes("sensit")
    ).length;
    const withChronic = customers.filter(c => 
      c.medicalHistory.toLowerCase().includes("hypertension") || 
      c.medicalHistory.toLowerCase().includes("diabet") || 
      c.medicalHistory.toLowerCase().includes("asthma")
    ).length;
    const highLoyalty = customers.filter(c => c.loyaltyPoints >= 200).length;
    
    return { total, withAllergies, withChronic, highLoyalty };
  }, [customers]);

  // Search and filtered client lists
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      // Search term match
      const searchStr = `${c.name} ${c.phone} ${c.email} ${c.medicalHistory}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchQuery.toLowerCase());
      
      // Medical history tags rules
      if (filterMedicalFlag === "allergies") {
        const hasAllergy = c.medicalHistory.toLowerCase().includes("allergi") || c.medicalHistory.toLowerCase().includes("sensit");
        return matchesSearch && hasAllergy;
      }
      if (filterMedicalFlag === "chronic") {
        const hasChronic = c.medicalHistory.toLowerCase().includes("hypertension") || c.medicalHistory.toLowerCase().includes("diabet") || c.medicalHistory.toLowerCase().includes("asthma");
        return matchesSearch && hasChronic;
      }
      if (filterMedicalFlag === "healthy") {
        const isHealthy = !c.medicalHistory || c.medicalHistory.toLowerCase().includes("no drug allergies") || c.medicalHistory.toLowerCase().trim() === "none";
        return matchesSearch && isHealthy;
      }
      return matchesSearch;
    });
  }, [customers, searchQuery, filterMedicalFlag]);

  // Form helpers
  const handleOpenAdd = () => {
    setFormData({
      name: "",
      phone: "+234 ",
      email: "",
      medicalHistory: "No registered drug allergies. Health status nominal.",
      loyaltyPoints: 100,
      walletBalance: 0,
      creditLimit: 10000
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (cust: Customer) => {
    setEditingCustomer(cust);
    setFormData({
      name: cust.name,
      phone: cust.phone,
      email: cust.email,
      medicalHistory: cust.medicalHistory,
      loyaltyPoints: cust.loyaltyPoints,
      walletBalance: cust.walletBalance,
      creditLimit: cust.creditLimit
    });
    setShowEditModal(true);
  };

  const onSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newCust: Customer = {
      id: `c_${Date.now()}`,
      name: formData.name.trim(),
      phone: formData.phone.trim() || "+234 800 000 0000",
      email: formData.email.trim() || `${formData.name.toLowerCase().replace(/\s+/g, "")}@example.com`,
      medicalHistory: formData.medicalHistory.trim() || "None declared.",
      prescriptionHistory: [],
      loyaltyPoints: Number(formData.loyaltyPoints) || 0,
      walletBalance: Number(formData.walletBalance) || 0,
      creditLimit: Number(formData.creditLimit) || 0
    };

    onAddCustomer(newCust);
    setShowAddModal(false);
  };

  const onSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer || !formData.name.trim()) return;

    const updated: Customer = {
      ...editingCustomer,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      medicalHistory: formData.medicalHistory.trim(),
      loyaltyPoints: Number(formData.loyaltyPoints) || 0,
      walletBalance: Number(formData.walletBalance) || 0,
      creditLimit: Number(formData.creditLimit) || 0
    };

    onUpdateCustomer(updated);
    setShowEditModal(false);
    setEditingCustomer(null);
  };

  // Inline adjustment for patient credit / wallet transactions inside dynamic drawer
  const handleFinancialAdjust = () => {
    if (!currentCustomer || !financialAmount || isNaN(Number(financialAmount))) return;
    const amount = Number(financialAmount);
    
    let updated = { ...currentCustomer };
    if (financialAction === "deposit") {
      updated.walletBalance += amount;
      // Add 20% loyalty booster points for deposits to credit account!
      updated.loyaltyPoints += Math.floor(amount * 0.05); 
    } else if (financialAction === "withdraw") {
      if (amount > updated.walletBalance) {
        alert("Transaction Failed: Withdrawal exceed customer's prepaid balance pool.");
        return;
      }
      updated.walletBalance -= amount;
    } else if (financialAction === "credit") {
      updated.creditLimit = amount;
    }

    onUpdateCustomer(updated);
    setFinancialAmount("");
  };

  // Direct manual prescription item handlers
  const handleAddPrescriptionItem = () => {
    setNewPresData(prev => ({
      ...prev,
      medicines: [...prev.medicines, { name: "", strength: "Ready Tab", dosage: "1 Tablet", frequency: "Daily" }]
    }));
  };

  const handleUpdatePrescriptionItem = (index: number, field: string, value: any) => {
    const updatedMedicines = newPresData.medicines.map((m, i) => {
      if (i === index) {
        return { ...m, [field]: value };
      }
      return m;
    });
    setNewPresData(prev => ({ ...prev, medicines: updatedMedicines }));
  };

  const handleRemovePrescriptionItem = (index: number) => {
    if (newPresData.medicines.length <= 1) return;
    setNewPresData(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }));
  };

  const handleSaveDirectPrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCustomer) return;

    const activeMeds = newPresData.medicines.filter(m => m.name.trim() !== "");
    if (activeMeds.length === 0) {
      alert("Please add at least one prescription item detail.");
      return;
    }

    const newPres: Prescription = {
      id: `p_${Date.now()}`,
      patientName: currentCustomer.name,
      doctorName: newPresData.doctorName.trim() || "Clinic Pharmacist",
      date: new Date().toISOString().split("T")[0],
      verified: true,
      repeatAllowed: false,
      repeatCount: 0,
      alerts: newPresData.alerts || "No manual systemic drug alarms.",
      medicines: activeMeds
    };

    // Global add
    onAddPrescription(newPres);

    // Link ID to patient prescriptionHistory
    const updatedPatient: Customer = {
      ...currentCustomer,
      prescriptionHistory: [...currentCustomer.prescriptionHistory, newPres.id],
      loyaltyPoints: currentCustomer.loyaltyPoints + 15 // award health-tracking points
    };
    onUpdateCustomer(updatedPatient);

    // Reset states
    setShowAddPrescription(false);
    setNewPresData({
      doctorName: "Dr. Alhaji Musa (LUTH)",
      alerts: "",
      medicines: [{ name: "", strength: "80/480mg", dosage: "1 Tablet", frequency: "Twice daily" }]
    });
  };

  return (
    <div className="space-y-6" id="crm-patients-viewport">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="text-emerald-500" size={22} id="crm-header-icon" />
            Patient Clinical CRM Database
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Analyze complete patient portfolio registries, recorded health history notes, risk profiles, and historical prescriptions.
          </p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-sm uppercase tracking-wider"
          id="crm-register-btn"
        >
          <UserPlus size={15} />
          Register Patient Care Profile
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Users size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-400 font-bold block">Patient Directory</span>
            <span className="text-lg font-black font-mono text-slate-800">{stats.total} Patients</span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
            <ShieldAlert size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-400 font-bold block">Drug Sensitivity Flags</span>
            <span className="text-lg font-black font-mono text-rose-700">{stats.withAllergies} Accounts</span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <AlertCircle size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-400 font-bold block">Chronic Clinical Care</span>
            <span className="text-lg font-black font-mono text-slate-800">{stats.withChronic} Accounts</span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Award size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-400 font-bold block">Top Loyalty Tier Holders</span>
            <span className="text-lg font-black font-mono text-emerald-700">{stats.highLoyalty} Accounts</span>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Side: Patient Search & List */}
        <div className="xl:col-span-7 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            {/* Search inputs */}
            <div className="relative">
              <Search className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search patient name, phone contact, email or clinical diagnosis tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            {/* Sub Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold mr-2">Filters:</span>
              {[
                { id: "all", label: "👥 All Directory" },
                { id: "allergies", label: "🚨 Allergy Alerts" },
                { id: "chronic", label: "🧬 Chronic Pathologies" },
                { id: "healthy", label: "✅ No Declared Allergies" }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setFilterMedicalFlag(item.id as any)}
                  className={`text-[10px] py-1 px-3 rounded-full font-bold border cursor-pointer transition-all ${
                    filterMedicalFlag === item.id 
                      ? "bg-slate-900 text-white border-slate-800" 
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Directory Listings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCustomers.length === 0 ? (
              <div className="md:col-span-2 bg-white text-center py-12 rounded-xl border border-slate-200 text-slate-400">
                <AlertCircle size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold uppercase tracking-wider">No matching patient profiles found.</p>
                <p className="text-[10px] mt-1">Try resetting the keyword search or removing allergy flags.</p>
              </div>
            ) : (
              filteredCustomers.map(cust => {
                const initials = cust.name.split(" ").map(w => w[0]).join("").substring(0, 2);
                const hasAllergyAlert = cust.medicalHistory.toLowerCase().includes("allergi") || cust.medicalHistory.toLowerCase().includes("sensit");
                const hasChronicAlert = cust.medicalHistory.toLowerCase().includes("hypertension") || cust.medicalHistory.toLowerCase().includes("diabet") || cust.medicalHistory.toLowerCase().includes("asthma");
                const isSelected = cust.id === selectedCustomerId;

                return (
                  <div
                    key={cust.id}
                    onClick={() => setSelectedCustomerId(cust.id)}
                    className={`bg-white rounded-xl border transition-all p-4 cursor-pointer text-left relative overflow-hidden flex flex-col justify-between h-[180px] hover:shadow-md ${
                      isSelected 
                        ? "border-emerald-500 ring-2 ring-emerald-400/20" 
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {/* Top block */}
                    <div>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center border uppercase ${
                            hasAllergyAlert 
                              ? "bg-rose-50 text-rose-700 border-rose-200" 
                              : hasChronicAlert 
                                ? "bg-amber-50 text-amber-700 border-amber-200" 
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}>
                            {initials}
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-slate-800 tracking-tight leading-4 line-clamp-1">{cust.name}</h3>
                            <span className="text-[9px] text-slate-400 font-mono block mt-0.5">{cust.phone}</span>
                          </div>
                        </div>

                        {/* Top corner status icons */}
                        <div className="flex gap-1">
                          {hasAllergyAlert && (
                            <span className="bg-rose-100 text-rose-800 text-[8px] px-1.5 py-0.5 rounded-full font-bold tracking-wider uppercase border border-rose-200 flex items-center gap-0.5">
                              ⚠️ Allergy
                            </span>
                          )}
                          {hasChronicAlert && (
                            <span className="bg-amber-100 text-amber-800 text-[8px] px-1.5 py-0.5 rounded-full font-bold tracking-wider uppercase border border-amber-200">
                              🧬 Chronic
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Brief Notes */}
                      <p className="text-[10px] text-slate-500 mt-2.5 line-clamp-2 italic leading-relaxed border-l-2 border-slate-200 pl-2">
                        "{cust.medicalHistory || "No declared medical histories recorded."}"
                      </p>
                    </div>

                    {/* Bottom metrics summary tag */}
                    <div className="border-t border-slate-100 pt-2 flex justify-between items-center mt-3 text-[10px]">
                      <div className="flex gap-1.5 text-[10px] font-mono">
                        <span className="text-slate-400">Prepaid:</span>
                        <span className="text-slate-800 font-bold">₦{cust.walletBalance.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Award size={11} className="text-amber-500" />
                        <span className="font-bold text-slate-700 font-mono">{cust.loyaltyPoints} pts</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Detailed View Client File */}
        <div className="xl:col-span-5">
          <AnimatePresence mode="wait">
            {currentCustomer ? (
              <motion.div
                key={currentCustomer.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
              >
                {/* File Header */}
                <div className="bg-slate-900 p-5 text-white flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="bg-emerald-500 text-slate-950 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                      Certified Clinical File
                    </span>
                    <h2 className="text-base font-extrabold tracking-tight">{currentCustomer.name}</h2>
                    <p className="text-[10px] text-slate-400 font-mono">Member ID: {currentCustomer.id.toUpperCase()}</p>
                  </div>
                  
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(currentCustomer)}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all cursor-pointer"
                      title="Edit Profile"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you absolutely certain you want to delete patient: "${currentCustomer.name}"? This action erases clinical files permanently.`)) {
                          onDeleteCustomer(currentCustomer.id);
                          setSelectedCustomerId(null);
                        }
                      }}
                      className="p-2 bg-red-500/20 hover:bg-red-500/45 rounded-lg text-red-300 transition-all cursor-pointer"
                      title="Decommission File"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="p-5 space-y-5">
                  {/* Grid Contact Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center gap-2">
                      <Phone size={14} className="text-slate-400 shrink-0" />
                      <div className="overflow-hidden">
                        <span className="text-[9px] text-slate-400 font-bold block">PHONE NUMBER</span>
                        <p className="text-[11px] font-bold text-slate-800 font-mono truncate">{currentCustomer.phone}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center gap-2">
                      <Mail size={14} className="text-slate-400 shrink-0" />
                      <div className="overflow-hidden">
                        <span className="text-[9px] text-slate-400 font-bold block">EMAIL CONNECTION</span>
                        <p className="text-[11px] font-bold text-slate-800 font-mono truncate">{currentCustomer.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Financial Account Balances */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-3.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-800">Financial Ledger Card</span>
                      <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        Level Boost: {currentCustomer.loyaltyPoints} Rewards
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="text-[9px] text-slate-400 font-bold block">PREPAID BALANCE Pool</span>
                        <span className="text-base font-black font-mono text-slate-900">
                          ₦{currentCustomer.walletBalance.toLocaleString()}
                        </span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="text-[9px] text-slate-400 font-bold block">CREDIT LIMIT (NGN)</span>
                        <span className="text-base font-black font-mono text-slate-800">
                          ₦{currentCustomer.creditLimit.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Adjustable Ledger Buttons */}
                    <div className="space-y-2 pt-1 border-t border-slate-200/60">
                      <div className="flex items-center gap-2">
                        <select
                          value={financialAction}
                          onChange={(e) => setFinancialAction(e.target.value as any)}
                          className="text-[10px] bg-white border border-slate-200 py-1 px-2 rounded font-bold text-slate-700"
                        >
                          <option value="deposit">➕ Balance Deposit</option>
                          <option value="withdraw">➖ Balance Deduct</option>
                          <option value="credit">⚙️ Set Credit Limit</option>
                        </select>
                        <div className="relative flex-1">
                          <span className="absolute left-2.5 top-1 text-slate-400 text-xs font-bold">₦</span>
                          <input
                            type="text"
                            placeholder="Amount..."
                            value={financialAmount}
                            onChange={(e) => setFinancialAmount(e.target.value)}
                            className="w-full text-xs font-mono py-1 pl-6 pr-2 bg-white border border-slate-200 rounded"
                          />
                        </div>
                        <button
                          onClick={handleFinancialAdjust}
                          className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] py-1.5 px-3 rounded uppercase cursor-pointer"
                        >
                          APPLY
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Complete Medical History Panel */}
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-black text-slate-800 tracking-wider uppercase flex items-center gap-1.5">
                      <FileText size={14} className="text-rose-500" />
                      Recorded Medical History Alerts
                    </h3>
                    
                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-2">
                      <textarea
                        value={currentCustomer.medicalHistory}
                        onChange={(e) => {
                          onUpdateCustomer({
                            ...currentCustomer,
                            medicalHistory: e.target.value
                          });
                        }}
                        rows={3}
                        placeholder="Type patient clinical history, drug allergies and chronic conditions details..."
                        className="w-full text-xs leading-relaxed p-3 bg-slate-50/70 border border-slate-200 rounded-lg text-slate-800 tracking-normal resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <p className="text-[9px] text-slate-400 mt-1 italic flex items-center gap-1">
                        <AlertTriangle size={11} className="text-amber-500" />
                        Live editing. Changes auto-save key details on patient portfolio cards in real-time.
                      </p>
                    </div>
                  </div>

                  {/* Linked Prescription History Logs */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-black text-slate-800 tracking-wider uppercase flex items-center gap-1.5">
                        <Pill size={14} className="text-emerald-500" />
                        Clinical Rx History Log ({patientPrescriptions.length})
                      </h3>
                      
                      {!showAddPrescription ? (
                        <button
                          onClick={() => setShowAddPrescription(true)}
                          className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 rounded-lg py-1 px-2.5 font-black uppercase flex items-center gap-1 cursor-pointer"
                        >
                          <Plus size={11} /> Issue New Rx
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowAddPrescription(false)}
                          className="text-[10px] text-slate-400 bg-slate-100 hover:bg-slate-200 rounded-lg py-1 px-2 cursor-pointer"
                        >
                          Cancel Rx
                        </button>
                      )}
                    </div>

                    {showAddPrescription && (
                      <form onSubmit={handleSaveDirectPrescription} className="bg-slate-50 border border-emerald-550/40 p-4 rounded-xl space-y-3 text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold text-slate-500">Fast Prescription Drafter</span>
                          <span className="text-[9px] font-mono text-slate-400">AUTHORID: pharmacist_audited</span>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] text-slate-400 font-mono block">ATTENDING PHYSICIAN / CLINICIAN</label>
                          <input
                            type="text"
                            value={newPresData.doctorName}
                            onChange={(e) => setNewPresData(prev => ({ ...prev, doctorName: e.target.value }))}
                            className="w-full text-xs font-semibold p-1.5 bg-white border border-slate-200"
                          />
                        </div>

                        {/* Items Section */}
                        <div className="space-y-2">
                          <label className="text-[9px] text-slate-400 font-mono block">PRESCRIBED PHARMACEUTICAL PRODUCTS</label>
                          
                          {newPresData.medicines.map((med, idx) => (
                            <div key={idx} className="grid grid-cols-12 gap-1.5 items-center">
                              <input
                                type="text"
                                placeholder="E.g. Coartem"
                                value={med.name}
                                onChange={(e) => handleUpdatePrescriptionItem(idx, "name", e.target.value)}
                                className="col-span-4 text-xs p-1 bg-white border border-slate-200 placeholder:text-slate-300 font-semibold"
                              />
                              <input
                                type="text"
                                placeholder="Strength"
                                value={med.strength}
                                onChange={(e) => handleUpdatePrescriptionItem(idx, "strength", e.target.value)}
                                className="col-span-2 text-xs font-mono p-1 bg-white border border-slate-200 text-center"
                              />
                              <input
                                type="text"
                                placeholder="Dosage"
                                value={med.dosage}
                                onChange={(e) => handleUpdatePrescriptionItem(idx, "dosage", e.target.value)}
                                className="col-span-2 text-xs p-1 bg-white border border-slate-200 placeholder:text-slate-350"
                              />
                              <input
                                type="text"
                                placeholder="Frequency"
                                value={med.frequency}
                                onChange={(e) => handleUpdatePrescriptionItem(idx, "frequency", e.target.value)}
                                className="col-span-3 text-[10px] p-1 bg-white border border-slate-200 placeholder:text-slate-350"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemovePrescriptionItem(idx)}
                                className="col-span-1 p-1 text-slate-400 hover:text-red-500 text-xs text-center"
                              >
                                &times;
                              </button>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={handleAddPrescriptionItem}
                            className="text-[9px] text-slate-600 bg-white border border-slate-200 py-1 px-2 hover:bg-slate-50 rounded"
                          >
                            ➕ Add Medicine Row
                          </button>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-400 font-mono block">DIAGNOSIS ALERTS / CLINIC NOTES</label>
                          <textarea
                            rows={2}
                            value={newPresData.alerts}
                            onChange={(e) => setNewPresData(prev => ({ ...prev, alerts: e.target.value }))}
                            placeholder="E.g. Take completed anti-malarial cycle. Avoid cold foods."
                            className="w-full text-xs p-2 bg-white border border-slate-200 rounded"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] py-2 px-3 rounded uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Sign and Transmit Rx to Register
                        </button>
                      </form>
                    )}

                    {patientPrescriptions.length === 0 ? (
                      <div className="bg-slate-50 text-center py-6 rounded-xl border border-dashed border-slate-200 text-slate-400 text-[11px]">
                        <p>No active/historic medical prescriptions linked to this profile.</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                        {patientPrescriptions.map(pres => (
                          <div key={pres.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2 text-left text-xs">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-800 font-mono text-[10px]">{pres.id.toUpperCase()}</span>
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded ${
                                  pres.verified 
                                    ? "bg-emerald-100 text-emerald-800" 
                                    : "bg-amber-100 text-amber-800"
                                }`}>
                                  {pres.verified ? "Active Verified" : "Pending Action"}
                                </span>
                                <span className="text-[9px] text-slate-400 font-mono">{pres.date}</span>
                              </div>
                            </div>
                            
                            <p className="text-[10px] text-slate-500 italic">"Attending: {pres.doctorName} | Clinical Instruction: {pres.alerts || "None declared."}"</p>

                            {pres.medicines && pres.medicines.length > 0 && (
                              <div className="bg-white border border-slate-100 p-2 rounded text-[10px] font-mono space-y-1">
                                {pres.medicines.map((it, idx) => (
                                  <div key={idx} className="flex justify-between text-slate-700">
                                    <span>💊 {it.name} ({it.strength || "Ready"})</span>
                                    <span className="text-[9px] text-slate-400 font-sans italic">{it.dosage} - {it.frequency}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </motion.div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 shadow-sm">
                <Users size={48} className="mx-auto text-slate-200 mb-2" id="crm-empty-state-icon" />
                <h3 className="font-bold text-slate-700 uppercase tracking-wide">No Patient Selected</h3>
                <p className="text-xs mt-1">
                  Select any patient from the directory directory on the left to view complete medical profiles, adjust loyalty ledger balances, or create clinical prescriptions.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* MODAL 1: ADD CONTEXT PATIENT CARD */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-250 text-slate-800">
            <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider">Register Patient Care Profile</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={onSubmitAdd} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-slate-500">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Dr. Alhaji Ibrahim Musa"
                  className="w-full text-xs p-2.5 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-slate-500 font-sans">Phone Connection</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="e.g. +234 809 123 4567"
                    className="w-full text-xs p-2.5 bg-slate-50 font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-slate-500">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="e.g. abubakar@luth.org"
                    className="w-full text-xs p-2.5 bg-slate-50 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-slate-500">Medical History Diagnoses & Drug Alerts</label>
                <textarea
                  value={formData.medicalHistory}
                  onChange={(e) => setFormData(prev => ({ ...prev, medicalHistory: e.target.value }))}
                  rows={3}
                  placeholder="E.g. Asthmatic patient. Allergic to Sulfa Medications and Selsun Blue."
                  className="w-full text-xs p-2.5 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400">Prepaid Deposit (₦)</label>
                  <input
                    type="number"
                    value={formData.walletBalance}
                    onChange={(e) => setFormData(prev => ({ ...prev, walletBalance: Number(e.target.value) }))}
                    className="w-full text-xs p-2 bg-slate-50 font-mono text-center"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400">Credit Limit (₦)</label>
                  <input
                    type="number"
                    value={formData.creditLimit}
                    onChange={(e) => setFormData(prev => ({ ...prev, creditLimit: Number(e.target.value) }))}
                    className="w-full text-xs p-2 bg-slate-50 font-mono text-center"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400">Award Points</label>
                  <input
                    type="number"
                    value={formData.loyaltyPoints}
                    onChange={(e) => setFormData(prev => ({ ...prev, loyaltyPoints: Number(e.target.value) }))}
                    className="w-full text-xs p-2 bg-slate-50 font-mono text-center"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs uppercase cursor-pointer"
                >
                  Secure Registry Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT CONTEXT PATIENT CARD */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-250 text-slate-800">
            <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider">Edit Patient File Profile</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={onSubmitEdit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-slate-500">Legal Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full text-xs p-2.5 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-slate-500">Phone</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full text-xs p-2.5 bg-slate-50 font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-slate-500">Email Link</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full text-xs p-2.5 bg-slate-50 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-slate-500">Medical Clinical Notes</label>
                <textarea
                  value={formData.medicalHistory}
                  onChange={(e) => setFormData(prev => ({ ...prev, medicalHistory: e.target.value }))}
                  rows={3}
                  className="w-full text-xs p-2.5 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400">Prepaid Asset (₦)</label>
                  <input
                    type="number"
                    value={formData.walletBalance}
                    onChange={(e) => setFormData(prev => ({ ...prev, walletBalance: Number(e.target.value) }))}
                    className="w-full text-xs p-2 bg-slate-50 font-mono text-center"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400">Credit Limit (₦)</label>
                  <input
                    type="number"
                    value={formData.creditLimit}
                    onChange={(e) => setFormData(prev => ({ ...prev, creditLimit: Number(e.target.value) }))}
                    className="w-full text-xs p-2 bg-slate-50 font-mono text-center"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400">Award Points</label>
                  <input
                    type="number"
                    value={formData.loyaltyPoints}
                    onChange={(e) => setFormData(prev => ({ ...prev, loyaltyPoints: Number(e.target.value) }))}
                    className="w-full text-xs p-2 bg-slate-50 font-mono text-center"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancel Close
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs uppercase cursor-pointer"
                >
                  Apply System Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
