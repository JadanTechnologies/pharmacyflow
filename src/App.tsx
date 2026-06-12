import React, { useState, useMemo } from "react";
import { 
  Building, LayoutDashboard, ShoppingCart, Pill, Boxes, 
  FileCheck, Bot, BarChart4, ChevronRight, Settings, AlertTriangle, 
  Menu, X, Bell, LogOut, ArrowRightLeft, User, Languages, FileText, ShieldAlert
} from "lucide-react";

// Submodules view imports
import DashboardView from "./components/DashboardView";
import PosView from "./components/PosView";
import MedicineView from "./components/MedicineView";
import InventoryView from "./components/InventoryView";
import AiAssistantView from "./components/AiAssistantView";
import PrescriptionView from "./components/PrescriptionView";
import FinanceView from "./components/FinanceView";
import OtherModulesView from "./components/OtherModulesView";
import NotificationCenter from "./components/NotificationCenter";
import ReportingCenterView from "./components/ReportingCenterView";
import LoginView from "./components/LoginView";
import CrmPatientsView from "./components/CrmPatientsView";
import { Users } from "lucide-react";

// Constants and seeds
import { 
  Medicine, Branch, Supplier, Customer, Prescription, Sale, 
  FinancialRecord, Staff, BackupPoint, StockMovement, ERPUser, ActivityLog,
  SecurityRole, RolePermission, BusinessSettings, DEFAULT_ROLES, DEFAULT_BUSINESS_SETTINGS,
  INITIAL_BRANCHES, INITIAL_CUSTOMERS, INITIAL_MEDICINES, 
  INITIAL_PRESCRIPTIONS, INITIAL_SALES, INITIAL_FINANCES, 
  INITIAL_STAFF, INITIAL_BACKUPS, INITIAL_SUPPLIERS, INITIAL_USERS, INITIAL_ACTIVITY_LOGS
} from "./types";

export default function App() {
  // Navigation states
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [activeBranchId, setActiveBranchId] = useState<string>("b1"); // defaults to Ikeja Lagos Branch
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Core ERP Global States
  const [medicines, setMedicines] = useState<Medicine[]>(INITIAL_MEDICINES);
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(INITIAL_PRESCRIPTIONS);
  const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);
  const [finances, setFinances] = useState<FinancialRecord[]>(INITIAL_FINANCES);
  const [staff, setStaff] = useState<Staff[]>(INITIAL_STAFF);
  const [backups, setBackups] = useState<BackupPoint[]>(INITIAL_BACKUPS);

  // Extra Enterprise parameters with local persistence
  const [roles, setRoles] = useState<SecurityRole[]>(() => {
    try {
      const val = localStorage.getItem("pharmerp_roles");
      return val ? JSON.parse(val) : DEFAULT_ROLES;
    } catch {
      return DEFAULT_ROLES;
    }
  });

  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>(() => {
    try {
      const val = localStorage.getItem("pharmerp_business_settings");
      return val ? JSON.parse(val) : DEFAULT_BUSINESS_SETTINGS;
    } catch {
      return DEFAULT_BUSINESS_SETTINGS;
    }
  });

  // Secure user directory & system activity logs with local persistence
  const [users, setUsers] = useState<ERPUser[]>(() => {
    try {
      const val = localStorage.getItem("pharmerp_users");
      return val ? JSON.parse(val) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<ERPUser>(() => {
    try {
      const val = localStorage.getItem("pharmerp_current_user");
      return val ? JSON.parse(val) : INITIAL_USERS[0];
    } catch {
      return INITIAL_USERS[0];
    }
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem("pharmerp_is_logged_in") === "true";
    } catch {
      return false;
    }
  });

  // Security inactivity session states (30 minutes of inactivity)
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [timeLeft, setTimeLeft] = useState<number>(1800); // 30 minutes in seconds
  const [showExpiryWarning, setShowExpiryWarning] = useState<boolean>(false);

  // Global Logout & Session Closing logic including Clock Out Shifts
  const handleLogout = (message = "Double-tenancy login logout successfully sign-off.") => {
    const activeShiftId = localStorage.getItem("pharmerp_active_shift_id");
    if (activeShiftId) {
      try {
        const currentShifts = JSON.parse(localStorage.getItem("pharmerp_shift_logs") || "[]");
        const updatedShifts = currentShifts.map((s: any) => {
          if (s.id === activeShiftId) {
            return { ...s, timeOut: new Date().toISOString() };
          }
          return s;
        });
        localStorage.setItem("pharmerp_shift_logs", JSON.stringify(updatedShifts));
        localStorage.removeItem("pharmerp_active_shift_id");
      } catch (e) {
        console.error("Lock-out logging failed", e);
      }
    }
    setIsLoggedIn(false);
    localStorage.removeItem("pharmerp_is_logged_in");
    handleAddActivityLog("Authentication", `User ${currentUser.username} successfully signed-off.`);
    if (message) {
      alert(message);
    }
  };

  // User input inactivity tracker
  React.useEffect(() => {
    if (!isLoggedIn) return;

    const resetUserTimer = () => {
      setLastActivity(Date.now());
      setTimeLeft(1800);
      setShowExpiryWarning(false);
    };

    const events = ["mousemove", "keydown", "click", "scroll", "mousedown", "touchstart"];
    events.forEach(evt => window.addEventListener(evt, resetUserTimer));

    return () => {
      events.forEach(evt => window.removeEventListener(evt, resetUserTimer));
    };
  }, [isLoggedIn]);

  // Tick down timer checking hook
  React.useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - lastActivity) / 1000);
      const remainingSeconds = Math.max(0, 1800 - elapsedSeconds);
      setTimeLeft(remainingSeconds);

      if (remainingSeconds <= 60 && remainingSeconds > 0) {
        setShowExpiryWarning(true);
      }

      if (remainingSeconds === 0) {
        clearInterval(interval);
        handleLogout("🛡️ Security Guard Alert: Your session has been auto-locked due to 30 minutes of inactivity to protect clinical logs.");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoggedIn, lastActivity]);

  // Sync and lock branch for employee roles who lack global clearance
  React.useEffect(() => {
    if (currentUser.branchId !== "all" && activeBranchId !== currentUser.branchId) {
      setActiveBranchId(currentUser.branchId);
    }
  }, [currentUser, activeBranchId]);

  // Permission Map definition linking tabs to role clearance matrix elements
  const permissionMap: { [key: string]: keyof RolePermission } = {
    dashboard: "dashboard",
    pos: "sales",
    medicines: "inventory",
    inventory: "inventory",
    prescription: "sales",
    ai_voice: "dashboard",
    finance: "purchases",
    reports_admin: "reports",
    other_modules: "settings",
    crm_patients: "sales"
  };

  const isAllowed = (tab: string) => {
    if (currentUser.role === "Cashier") {
      return tab === "pos";
    }
    const perm = permissionMap[tab];
    if (!perm) return true;
    if (currentUser.role === "Super Admin") return true;
    const foundRole = roles.find(r => r.name === currentUser.role);
    if (!foundRole) return true;
    return foundRole.permissions[perm];
  };



  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    try {
      const val = localStorage.getItem("pharmerp_activity_logs");
      return val ? JSON.parse(val) : INITIAL_ACTIVITY_LOGS;
    } catch {
      return INITIAL_ACTIVITY_LOGS;
    }
  });

  // Helper functions to update state and update local storage simultaneously
  const handleAddUser = (username: string, passwordHash: string, role: ERPUser["role"], bId: string) => {
    const newUser: ERPUser = {
      id: `u_${Date.now()}`,
      username,
      passwordHash,
      role,
      branchId: bId,
      createdAt: new Date().toISOString().split("T")[0],
      status: "Active"
    };
    setUsers(prev => {
      const next = [...prev, newUser];
      localStorage.setItem("pharmerp_users", JSON.stringify(next));
      return next;
    });
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(prev => {
      const next = prev.map(u => u.id === userId ? { ...u, status: u.status === "Active" ? "Suspended" as const : "Active" as const } : u);
      localStorage.setItem("pharmerp_users", JSON.stringify(next));
      return next;
    });
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => {
      const next = prev.filter(u => u.id !== userId);
      localStorage.setItem("pharmerp_users", JSON.stringify(next));
      return next;
    });
  };

  const handleEditUserPassword = (userId: string, newPass: string) => {
    setUsers(prev => {
      const next = prev.map(u => u.id === userId ? { ...u, passwordHash: newPass } : u);
      localStorage.setItem("pharmerp_users", JSON.stringify(next));
      return next;
    });
  };

  const handleSwitchUser = (user: ERPUser) => {
    setCurrentUser(user);
    localStorage.setItem("pharmerp_current_user", JSON.stringify(user));
  };

  const handleAddActivityLog = (actionType: ActivityLog["actionType"], description: string) => {
    const userBranch = branches.find(b => b.id === currentUser.branchId);
    const newLog: ActivityLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      username: currentUser.username,
      role: currentUser.role,
      branchId: currentUser.branchId,
      branchName: userBranch ? userBranch.name : "Central Support",
      actionType,
      description
    };
    setActivityLogs(prev => {
      const next = [newLog, ...prev];
      localStorage.setItem("pharmerp_activity_logs", JSON.stringify(next));
      return next;
    });
  };

  const handleClearLogs = () => {
    setActivityLogs([]);
    localStorage.setItem("pharmerp_activity_logs", JSON.stringify([]));
  };

  const handleUpdateRoles = (nextRoles: SecurityRole[]) => {
    setRoles(nextRoles);
    localStorage.setItem("pharmerp_roles", JSON.stringify(nextRoles));
  };

  const handleUpdateBusinessSettings = (nextSettings: BusinessSettings) => {
    setBusinessSettings(nextSettings);
    localStorage.setItem("pharmerp_business_settings", JSON.stringify(nextSettings));
  };
  
  // Track continuous manual stock-in ledger logs
  const [movements, setMovements] = useState<StockMovement[]>([
    {
      id: "mvt_seed_01",
      timestamp: "2026-06-11T09:15:00Z",
      medicineId: "m1",
      medicineName: "Coartem 80/480mg",
      type: "Sale",
      quantity: 2,
      referenceId: "INV-2026-9051",
      branchId: "b1",
      notes: "Dispensed via POS Cashier terminal Lot CRT-2026-X8",
    },
    {
      id: "mvt_seed_02",
      timestamp: "2026-06-11T10:30:00Z",
      medicineId: "m5",
      medicineName: "Ventolin Evohaler",
      type: "Sale",
      quantity: 1,
      referenceId: "INV-2026-9052",
      branchId: "b2",
      notes: "Dispensed to patient Chinyere. Asthma rescue inhaler.",
    }
  ]);

  // Handle sales compilation (POS)
  const handleAddSale = (newSale: Sale) => {
    setSales(prev => [newSale, ...prev]);

    // Record dynamic entry on finances statement too
    const newFinance: FinancialRecord = {
      id: `f_sale_${newSale.id}`,
      date: newSale.date.split("T")[0],
      type: "Income",
      category: "Sales Revenue",
      amount: newSale.total,
      paymentMethod: newSale.paymentMethod,
      description: `Sale ${newSale.invoiceNumber}`,
      branchId: newSale.branchId,
    };
    setFinances(prev => [newFinance, ...prev]);

    // Record ledger movements
    newSale.items.forEach(item => {
      const saleMvt: StockMovement = {
        id: `mvt_sale_${newSale.id}_${item.medicineId}`,
        timestamp: newSale.date,
        medicineId: item.medicineId,
        medicineName: item.medicineName,
        type: "Sale",
        quantity: item.quantity,
        referenceId: newSale.invoiceNumber,
        branchId: newSale.branchId,
        notes: `Dispensed to ${newSale.customerName}. Batch LOT: ${item.batchNumber}`,
      };
      setMovements(prev => [saleMvt, ...prev]);
    });

    // Award revenue to target branch
    setBranches(prev => prev.map(b => b.id === newSale.branchId ? { ...b, revenue: b.revenue + newSale.total, salesCount: b.salesCount + 1 } : b));

    // Dynamic Audit Log trigger
    handleAddActivityLog("POS Sale", `Authorized sale of ${newSale.items.length} meds. Invoice: ${newSale.invoiceNumber}. Total cash value: ₦${newSale.total}. Method: ${newSale.paymentMethod}`);
  };

  // Handle central update stocks State (deduct or append on specific branch)
  const handleUpdateStock = (medId: string, qty: number, direction: "in" | "out", branchId?: string) => {
    const targetB = branchId || activeBranchId;
    let medName = medId;
    setMedicines(prev => prev.map(m => {
      if (m.id === medId) {
        medName = m.name;
        const branchStocksCopy = { ...m.branchStocks };
        const currentQty = branchStocksCopy[targetB] || 0;
        const speed = direction === "in" ? qty : -qty;
        branchStocksCopy[targetB] = Math.max(0, currentQty + speed);

        // Compute overall sum
        const grandOverallNew = Object.values(branchStocksCopy).reduce((a: number, b: any) => a + (Number(b) || 0), 0);

        return {
          ...m,
          stock: grandOverallNew,
          branchStocks: branchStocksCopy,
        };
      }
      return m;
    }));

    // Dynamic Audit Log trailing
    handleAddActivityLog("Stock Adjustment", `Manually updated inventory of medicine [${medName}] to value (${direction === "in" ? "+" : "-"}${qty}) at Branch Code: ${targetB}.`);
  };

  // Register product profile
  const handleAddMedicine = (newMed: Medicine) => {
    setMedicines(prev => [newMed, ...prev]);
    handleAddActivityLog("Product Catalog", `Registered new medication: "${newMed.name}" (${newMed.strength}) under category [${newMed.category}].`);
  };

  // Retire / delete medication
  const handleDeleteMedicine = (id: string) => {
    setMedicines(prev => prev.filter(m => m.id !== id));
    handleAddActivityLog("Product Catalog", `Retired medication registry ID [${id}] from the central catalog formulas.`);
  };

  // Register ledger movements
  const handleAddMovement = (mov: StockMovement) => {
    setMovements(prev => [mov, ...prev]);
  };

  // Save certified prescriptions
  const handleAddPrescription = (pres: Prescription) => {
    setPrescriptions(prev => [pres, ...prev]);
    handleAddActivityLog("Product Catalog", `AI Clinician reviewed and authorized prescription for: ${pres.patientName}.`);
  };

  // Push safe prescription medications straight to POS cart list
  const handleDispenseFromPrescription = (meds: any[]) => {
    // Navigate straight to POS
    setActiveTab("pos");
  };

  // Save SG&A expenses
  const handleAddFinanceRecord = (rec: FinancialRecord) => {
    setFinances(prev => [rec, ...prev]);
    handleAddActivityLog("Finance Entry", `Recorded operating ledger bookkeeping: Category [${rec.category}] of sum ₦${rec.amount}. Desc: ${rec.description}`);
  };

  // Backup restore points creation
  const handleAddBackup = (bk: BackupPoint) => {
    setBackups(prev => [bk, ...prev]);
    handleAddActivityLog("Backup Operation", `Executed systems database snapshot point: ${bk.fileName} (AES-256 Cloud Partition Secure).`);
  };

  // HRM Employee additions
  const handleAddStaff = (s: Staff) => {
    setStaff(prev => [s, ...prev]);
  };

  // Add Suppliers
  const handleAddSupplier = (sup: Supplier) => {
    setSuppliers(prev => [sup, ...prev]);
  };

  // Patient CRM Database State Management Handlers
  const handleAddCustomer = (newCust: Customer) => {
    setCustomers(prev => [...prev, newCust]);
    handleAddActivityLog("User Management", `Created new patient care profile: ${newCust.name}`);
  };

  const handleUpdateCustomer = (updatedCust: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updatedCust.id ? updatedCust : c));
    handleAddActivityLog("User Management", `Updated patient care profile details: ${updatedCust.name}`);
  };

  const handleDeleteCustomer = (id: string) => {
    const cust = customers.find(c => c.id === id);
    setCustomers(prev => prev.filter(c => c.id !== id));
    handleAddActivityLog("User Management", `Deleted patient care profile permanently: ${cust?.name || id}`);
  };

  // Count expiring alerts indicator for top menu indicators
  const lowStockExpiringTotalCount = useMemo(() => {
    const today = new Date("2026-06-11");
    let alertQuantity = 0;

    medicines.forEach(m => {
      const activeBStock = m.branchStocks[activeBranchId] || 0;
      if (activeBStock <= m.reorderLevel) {
        alertQuantity++;
      } else {
        const exp = new Date(m.expiryDate);
        const diffDays = (exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        if (exp < today || diffDays <= 45) {
          alertQuantity++;
        }
      }
    });

    return alertQuantity + suppliers.filter(s => s.balance > 0).length;
  }, [medicines, suppliers, activeBranchId]);

  if (!isLoggedIn) {
    return (
      <LoginView
        users={users}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsLoggedIn(true);
          localStorage.setItem("pharmerp_current_user", JSON.stringify(user));
          localStorage.setItem("pharmerp_is_logged_in", "true");

          // Reset security activity timeline to full 30 minutes
          setLastActivity(Date.now());
          setTimeLeft(1800);
          setShowExpiryWarning(false);

          // Force view tab navigation depending on the specific clearance
          if (user.role === "Cashier") {
            setActiveTab("pos");
          } else {
            setActiveTab("dashboard");
          }

          // Register a Clock-In "Time In" shift logs entry in localized client partition
          const branchObj = INITIAL_BRANCHES.find(b => b.id === user.branchId);
          const branchName = branchObj ? branchObj.name : "Central Support";
          const newShift = {
            id: `shift_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            username: user.username,
            role: user.role,
            branchId: user.branchId,
            branchName: branchName,
            timeIn: new Date().toISOString(),
            timeOut: null
          };

          try {
            const currentShifts = JSON.parse(localStorage.getItem("pharmerp_shift_logs") || "[]");
            // Clock out any dirty unresolved active shifts for this username
            const updatedShifts = currentShifts.map((s: any) => {
              if (s.username === user.username && s.timeOut === null) {
                return { ...s, timeOut: new Date().toISOString() };
              }
              return s;
            });
            updatedShifts.push(newShift);
            localStorage.setItem("pharmerp_shift_logs", JSON.stringify(updatedShifts));
            localStorage.setItem("pharmerp_active_shift_id", newShift.id);
          } catch (e) {
            console.error("Shift tracking error:", e);
          }

          // Write activity log and proceed
          handleAddActivityLog("Authentication", `User ${user.username} successfully logged in & clocked-in active cashier shift at [${branchName}].`);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex font-sans overflow-x-hidden relative theme-polished">

      {/* Persistence Navigation Sidebar */}
      <aside 
        id="navigation-sidebar"
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0F172A] border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col flex-1 h-0">
          {/* Brand/SaaS Title logo */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 bg-[#0F172A]">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold relative group">
                <Pill size={16} className="rotate-45" />
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight text-white block">PHARMA-ERP</span>
                <span className="text-[10px] text-slate-400 block font-mono">Nigeria Hub Core</span>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg">
              <X size={16} />
            </button>
          </div>

          {/* Navigation Links list */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            
            {isAllowed("dashboard") && (
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`w-full flex items-center justify-between py-2 px-3 rounded-xl text-xs font-semibold transition-all group ${
                  activeTab === "dashboard"
                    ? "bg-slate-900 border border-white/5 text-emerald-400 font-bold"
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.02]"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <LayoutDashboard size={14} className={activeTab === "dashboard" ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-250"} />
                  SaaS Dashboard
                </span>
                <ChevronRight size={10} className="opacity-40 group-hover:opacity-100" />
              </button>
            )}

            {isAllowed("pos") && (
              <button
                onClick={() => setActiveTab("pos")}
                className={`w-full flex items-center justify-between py-2 px-3 rounded-xl text-xs font-semibold transition-all group ${
                  activeTab === "pos"
                    ? "bg-slate-900 border border-white/5 text-emerald-400 font-bold"
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.02]"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <ShoppingCart size={14} className={activeTab === "pos" ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-250"} />
                  POS Dispenser Register
                </span>
                <span className="bg-emerald-500/10 text-emerald-300 py-0.5 px-2 rounded-full font-mono text-[9px] border border-emerald-500/15">POS Live</span>
              </button>
            )}

            {isAllowed("medicines") && (
              <button
                onClick={() => setActiveTab("medicines")}
                className={`w-full flex items-center justify-between py-2 px-3 rounded-xl text-xs font-semibold transition-all group ${
                  activeTab === "medicines"
                    ? "bg-slate-900 border border-white/5 text-emerald-400 font-bold"
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.02]"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Pill size={14} className={activeTab === "medicines" ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-250"} />
                  Medication Catalog
                </span>
                <ChevronRight size={10} className="opacity-40" />
              </button>
            )}

            {isAllowed("inventory") && (
              <button
                onClick={() => setActiveTab("inventory")}
                className={`w-full flex items-center justify-between py-2 px-3 rounded-xl text-xs font-semibold transition-all group ${
                  activeTab === "inventory"
                    ? "bg-slate-900 border border-white/5 text-emerald-400 font-bold"
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.02]"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Boxes size={14} className={activeTab === "inventory" ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-250"} />
                  Stock & Transfers Hub
                </span>
                <ChevronRight size={10} className="opacity-40" />
              </button>
            )}

            {isAllowed("prescription") && (
              <button
                onClick={() => setActiveTab("prescription")}
                className={`w-full flex items-center justify-between py-2 px-3 rounded-xl text-xs font-semibold transition-all group ${
                  activeTab === "prescription"
                    ? "bg-slate-900 border border-white/5 text-emerald-400 font-bold"
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.02]"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <FileCheck size={14} className={activeTab === "prescription" ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-250"} />
                  Clinics Prescriptions OCR
                </span>
                <span className="bg-[#115e59]/20 text-[#2dd4bf] border border-[#115e59]/30 py-0.5 px-2 rounded-full font-mono text-[9px]">AI</span>
              </button>
            )}

            {isAllowed("ai_voice") && (
              <button
                onClick={() => setActiveTab("ai_voice")}
                className={`w-full flex items-center justify-between py-2 px-3 rounded-xl text-xs font-semibold transition-all group ${
                  activeTab === "ai_voice"
                    ? "bg-slate-900 border border-white/5 text-emerald-400 font-bold"
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.02]"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Bot size={14} className={activeTab === "ai_voice" ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-250"} />
                  AI Voice Chatbot
                </span>
                <span className="bg-emerald-500/10 text-emerald-300 py-0.5 px-2 rounded-full font-mono text-[9px] border border-emerald-500/15">Active</span>
              </button>
            )}

            {isAllowed("finance") && (
              <button
                onClick={() => setActiveTab("finance")}
                className={`w-full flex items-center justify-between py-2 px-3 rounded-xl text-xs font-semibold transition-all group ${
                  activeTab === "finance"
                    ? "bg-slate-900 border border-white/5 text-emerald-400 font-bold"
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.02]"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <BarChart4 size={14} className={activeTab === "finance" ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-250"} />
                  SG&A Cost Ledgers
                </span>
                <ChevronRight size={10} className="opacity-40" />
              </button>
            )}

            {isAllowed("reports_admin") && (
              <button
                onClick={() => setActiveTab("reports_admin")}
                className={`w-full flex items-center justify-between py-2 px-3 rounded-xl text-xs font-semibold transition-all group ${
                  activeTab === "reports_admin"
                    ? "bg-slate-900 border border-white/5 text-emerald-400 font-bold"
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.02]"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <FileText size={14} className={activeTab === "reports_admin" ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-250"} />
                  Reporting & Admin Hub
                </span>
                <span className="bg-emerald-500/15 text-emerald-400 py-0.5 px-2 rounded-full font-mono text-[9px] border border-emerald-500/20">Audit</span>
              </button>
            )}

            {isAllowed("crm_patients") && (
              <button
                onClick={() => setActiveTab("crm_patients")}
                className={`w-full flex items-center justify-between py-2 px-3 rounded-xl text-xs font-semibold transition-all group ${
                  activeTab === "crm_patients"
                    ? "bg-slate-900 border border-white/5 text-emerald-400 font-bold"
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.02]"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Users size={14} className={activeTab === "crm_patients" ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-250"} />
                  Patient Care CRM
                </span>
                <span className="bg-[#10B981]/15 text-[#34D399] py-0.5 px-2 rounded-full font-mono text-[9px] border border-[#10B981]/20">Active</span>
              </button>
            )}

            {isAllowed("other_modules") && (
              <button
                onClick={() => setActiveTab("other_modules")}
                className={`w-full flex items-center justify-between py-2 px-3 rounded-xl text-xs font-semibold transition-all group ${
                  activeTab === "other_modules"
                    ? "bg-slate-900 border border-white/5 text-emerald-400 font-bold"
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.02]"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Settings size={14} className={activeTab === "other_modules" ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-250"} />
                  Enterprise Configs
                </span>
                <ChevronRight size={10} className="opacity-40" />
              </button>
            )}

          </nav>
        </div>

        {/* AI Assistant box */}
        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/80 rounded-lg p-3">
            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">AI Assistant</p>
            <p className="text-xs text-white leading-relaxed">Demand spike predicted for Anti-Malarials next week.</p>
          </div>
        </div>

        {/* User profile section footer inside card */}
        <div className="p-4 border-t border-slate-800 bg-[#0F172A]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div id="user-avatar" className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold font-mono text-xs">
                {currentUser.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="text-xs">
                <span className="font-semibold text-white block truncate">{currentUser.username}</span>
                <span className="text-[10px] text-slate-400 block max-w-[120px] truncate">{currentUser.role}</span>
              </div>
            </div>
            <button 
              onClick={() => handleLogout()}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
          
          {/* Developer credit inside workspace sidebar */}
          <div className="mt-3 pt-2.5 border-t border-slate-805/40 text-center">
            <p className="text-[10px] font-semibold text-slate-500 font-sans leading-none tracking-tight">
              Developed by <span className="text-emerald-400 font-bold block mt-1">Jadan Tech Solutions Nig Ltd</span>
            </p>
            <p className="text-[9px] text-[#2dd4bf] font-mono mt-0.5">
              07061511390
            </p>
          </div>
        </div>
      </aside>

      {/* Main Workspace Frame container */}
      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden">
        
        {/* TOP Header Row */}
        <header className="h-16 border-b border-slate-200 bg-white px-5 flex justify-between items-center shrink-0">
          
          <div className="flex items-center space-x-2">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-1.5 text-slate-500 hover:text-slate-900 rounded-lg">
              <Menu size={18} />
            </button>
            
            {/* Branch Selector Dropdown */}
            <div className="flex items-center space-x-2 bg-slate-100 p-1.5 px-3 rounded-lg border border-slate-200 text-xs text-slate-800">
              <Building size={14} className="text-emerald-500" />
              <span className="text-slate-500 font-medium font-sans">BRANCH:</span>
              <select
                value={activeBranchId}
                onChange={(e) => {
                  setActiveBranchId(e.target.value);
                  alert(`POS checkout and medicine inventory valuations re-aligned to [${branches.find(b => b.id === e.target.value)?.name}].`);
                }}
                className="bg-transparent border-none text-slate-900 font-bold outline-none focus:ring-0 cursor-pointer text-xs"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id} className="bg-white text-slate-800">
                    {b.name} ({b.location.split(",")[0]})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Auto-Lock session Countdown HUD */}
            <div className={`hidden sm:flex items-center space-x-1.5 px-3 py-1 bg-amber-500/10 border ${timeLeft <= 60 ? 'border-rose-500 bg-rose-500/15 animate-pulse text-rose-400' : 'border-amber-500/15 text-amber-500'} font-mono text-xs rounded-xl font-bold`}>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping shrink-0" />
              <span>SEC: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}</span>
              <button 
                onClick={() => {
                  setTimeLeft(1800);
                  setLastActivity(Date.now());
                }} 
                className="ml-1 px-1.5 py-0.5 bg-slate-900 text-white rounded text-[9px] hover:bg-slate-800 tracking-tighter cursor-pointer"
                title="Prolong your log security lock active state"
              >
                Renew
              </button>
            </div>
            {/* System notifications indicator */}
            <button 
              onClick={() => setIsNotificationOpen(true)}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl relative transition-colors"
            >
              <Bell size={15} />
              {lowStockExpiringTotalCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full font-mono text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
                  {lowStockExpiringTotalCount}
                </span>
              )}
            </button>

            <span className="h-5 w-px bg-slate-200" />
            <div className="text-right text-[10px] text-slate-500 font-mono hidden md:block">
              <p>USER: {currentUser.username} ({currentUser.role})</p>
              <p className="text-emerald-600 font-bold">Nigeria Area Network Core</p>
            </div>
          </div>
        </header>

        {/* ACTIVE Tab canvas */}
        <main className="flex-1 overflow-y-auto p-5 md:p-6 lg:p-8 bg-[#F8FAFC]">
          {!isAllowed(activeTab) ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center max-w-xl mx-auto my-12 space-y-6">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <ShieldAlert size={32} />
              </div>
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800 font-sans">Security Access Denied</h2>
                <p className="text-sm text-slate-500 font-sans leading-relaxed">
                  Your assigned user clearance level (<span className="font-bold underline text-slate-700">{currentUser.role}</span>) does not possess the required <span className="font-mono bg-slate-100 p-1 rounded font-bold text-slate-800">"{permissionMap[activeTab] || activeTab}"</span> authorization to access this module.
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl text-left text-xs text-slate-650 space-y-1.5 border border-slate-100">
                <p className="font-semibold text-slate-705">👮 Security context details:</p>
                <p className="text-slate-500 font-medium">Assigned Branch Outlet: {branches.find(b => b.id === currentUser.branchId)?.name || "All Regional Outlets"}</p>
                <p className="text-slate-400 font-mono text-[10px]">Reference IP: 197.210.64.120 (Lagos Area core)</p>
              </div>
              <div className="flex justify-center gap-3">
                <button onClick={() => setActiveTab("dashboard")} className="px-4 py-2 bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-lg text-xs hover:bg-slate-200 transition-colors cursor-pointer">
                  Back to Dashboard
                </button>
                <button onClick={() => setActiveTab("reports_admin")} className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg text-xs hover:bg-slate-800 transition-colors cursor-pointer">
                  Authentication Console
                </button>
              </div>
            </div>
          ) : (
            <>
              {activeTab === "dashboard" && (
                <DashboardView 
                  medicines={medicines}
                  sales={sales}
                  branches={branches}
                  finances={finances}
                  onNavigate={(tab) => setActiveTab(tab)}
                />
              )}

              {activeTab === "pos" && (
                <PosView 
                  medicines={medicines}
                  customers={customers}
                  activeBranchId={activeBranchId}
                  onAddSale={handleAddSale}
                  onUpdateStock={handleUpdateStock}
                  currentUser={currentUser}
                  sales={sales}
                />
              )}

              {activeTab === "medicines" && (
                <MedicineView 
                  medicines={medicines}
                  activeBranchId={activeBranchId}
                  onAddMedicine={handleAddMedicine}
                  onDeleteMedicine={handleDeleteMedicine}
                />
              )}

              {activeTab === "inventory" && (
                <InventoryView 
                  medicines={medicines}
                  branches={branches}
                  activeBranchId={activeBranchId}
                  movements={movements}
                  onAddMovement={handleAddMovement}
                  onUpdateStock={handleUpdateStock}
                />
              )}

              {activeTab === "prescription" && (
                <PrescriptionView 
                  prescriptions={prescriptions}
                  onAddPrescription={handleAddPrescription}
                  onDispenseFromPrescription={handleDispenseFromPrescription}
                />
              )}

              {activeTab === "ai_voice" && (
                <AiAssistantView 
                  medicines={medicines}
                  sales={sales}
                  activeBranchId={activeBranchId}
                />
              )}

              {activeTab === "finance" && (
                <FinanceView 
                  finances={finances}
                  sales={sales}
                  medicines={medicines}
                  activeBranchId={activeBranchId}
                  onAddFinanceRecord={handleAddFinanceRecord}
                />
              )}

              {activeTab === "other_modules" && (
                <OtherModulesView 
                  branches={branches}
                  staff={staff}
                  suppliers={suppliers}
                  customers={customers}
                  backups={backups}
                  onAddBackup={handleAddBackup}
                  onAddStaff={handleAddStaff}
                  onAddSupplier={handleAddSupplier}
                />
              )}

              {activeTab === "crm_patients" && (
                <CrmPatientsView 
                  customers={customers}
                  prescriptions={prescriptions}
                  onAddCustomer={handleAddCustomer}
                  onUpdateCustomer={handleUpdateCustomer}
                  onDeleteCustomer={handleDeleteCustomer}
                  onAddPrescription={handleAddPrescription}
                  currentUser={currentUser}
                />
              )}

              {activeTab === "reports_admin" && (
                <ReportingCenterView 
                  medicines={medicines}
                  sales={sales}
                  branches={branches}
                  finances={finances}
                  staff={staff}
                  users={users}
                  customers={customers}
                  onAddUser={handleAddUser}
                  onToggleUserStatus={handleToggleUserStatus}
                  onDeleteUser={handleDeleteUser}
                  onEditUserPassword={handleEditUserPassword}
                  currentUser={currentUser}
                  onSwitchUser={handleSwitchUser}
                  activityLogs={activityLogs}
                  onAddActivityLog={handleAddActivityLog}
                  onClearLogs={handleClearLogs}
                  roles={roles}
                  onUpdateRoles={handleUpdateRoles}
                  businessSettings={businessSettings}
                  onUpdateBusinessSettings={handleUpdateBusinessSettings}
                />
              )}
            </>
          )}
          
          {/* Main Workspace Frame Footer Credit */}
          <footer className="mt-12 pt-6 border-t border-slate-200 text-center pb-4 text-xs text-slate-500 font-sans">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto px-1">
              <p className="font-medium text-slate-400">
                © 2026 PharmERP SaaS Gateways • Nigeria Hub Center
              </p>
              <p className="text-[11px] font-semibold text-slate-500">
                Developed by <span className="text-emerald-600 font-extrabold">Jadan Tech Solutions Nig Ltd</span> • <span className="text-indigo-600 font-mono">07061511390</span>
              </p>
            </div>
          </footer>
        </main>
      </div>

      {/* Slide-out notifications center */}
      <NotificationCenter 
        medicines={medicines}
        suppliers={suppliers}
        sales={sales}
        activeBranchId={activeBranchId}
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

      {/* Global AI Fabric Bottom Bar */}
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 h-1 bg-emerald-500 shadow-[0_-4px_20px_rgba(16,185,129,0.4)] z-50 pointer-events-none" />

    </div>
  );
}
