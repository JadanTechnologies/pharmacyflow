import React, { useMemo } from "react";
import { 
  TrendingUp, ShoppingCart, Users, AlertTriangle, Building, 
  Layers, Package, Calendar, CalendarX, ArrowUpRight, DollarSign,
  TrendingDown, CheckCircle, ShieldAlert
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";
import { Medicine as MedicineType, Sale, Branch, FinancialRecord } from "../types";

interface DashboardProps {
  medicines: MedicineType[];
  sales: Sale[];
  branches: Branch[];
  finances: FinancialRecord[];
  onNavigate: (tab: string) => void;
}

export default function DashboardView({ medicines, sales, branches, finances, onNavigate }: DashboardProps) {
  // Compute detailed KPIs
  const totalRevenue = useMemo(() => {
    return sales.reduce((sum, s) => sum + s.total, 0);
  }, [sales]);

  const todaySales = useMemo(() => {
    // Mimic today based on timeline (June 11, 2026)
    return sales
      .filter(s => s.date.startsWith("2026-06-11"))
      .reduce((sum, s) => sum + s.total, 0);
  }, [sales]);

  const monthlySales = useMemo(() => {
    return sales
      .filter(s => s.date.includes("2026-06"))
      .reduce((sum, s) => sum + s.total, 0);
  }, [sales]);

  // Gross profit = sales total - cost of goods sold (COGS)
  const grossProfit = useMemo(() => {
    let revenue = 0;
    let cost = 0;
    sales.forEach(sale => {
      revenue += sale.total;
      sale.items.forEach(item => {
        const med = medicines.find(m => m.id === item.medicineId);
        if (med) {
          cost += med.purchasePrice * item.quantity;
        } else {
          cost += (item.price * 0.6) * item.quantity; // fallback
        }
      });
    });
    return revenue - cost;
  }, [sales, medicines]);

  const expensesTotal = useMemo(() => {
    return finances
      .filter(f => f.type === "Expense")
      .reduce((sum, f) => sum + f.amount, 0);
  }, [finances]);

  const netProfit = useMemo(() => {
    return grossProfit - expensesTotal;
  }, [grossProfit, expensesTotal]);

  const lowStockCount = useMemo(() => {
    return medicines.filter(m => m.stock <= m.reorderLevel).length;
  }, [medicines]);

  const expiryStats = useMemo(() => {
    const today = new Date("2026-06-11");
    let expiringSoon = 0; // within 30 days
    let expired = 0;

    medicines.forEach(m => {
      const expDate = new Date(m.expiryDate);
      if (expDate < today) {
        expired++;
      } else {
        const diffMs = expDate.getTime() - today.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        if (diffDays <= 45) {
          expiringSoon++;
        }
      }
    });

    return { expiringSoon, expired };
  }, [medicines]);

  // Formulating charting data
  const trendData = useMemo(() => {
    // Sales grouped by date
    const groups: { [date: string]: number } = {};
    sales.forEach(s => {
      const d = new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      groups[d] = (groups[d] || 0) + s.total;
    });
    return Object.entries(groups).map(([date, revenue]) => ({ date, revenue }));
  }, [sales]);

  const storePerformanceData = useMemo(() => {
    return branches.map(b => {
      const branchSales = sales.filter(s => s.branchId === b.id).reduce((sum, s) => sum + s.total, 0);
      return {
        name: b.name.split(" ")[0], // shorter label
        Revenue: branchSales,
      };
    });
  }, [branches, sales]);

  const categoryShareData = useMemo(() => {
    const cats: { [cat: string]: number } = {};
    medicines.forEach(m => {
      cats[m.category] = (cats[m.category] || 0) + m.stock;
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [medicines]);

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#64748b"];

  return (
    <div id="dashboard-root" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white font-sans">SaaS Dashboard</h1>
          <p className="text-sm text-slate-400 font-sans">Centralized PharmERP monitor for multi-branch sync, finance, and AI alerts.</p>
        </div>
        <div className="flex space-x-2 text-xs font-semibold bg-slate-900/50 p-1 rounded-lg border border-slate-800">
          <span className="px-3 py-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
            Active Branches Online: {branches.filter(b => b.id !== "b4").length}
          </span>
          <span className="px-3 py-1.5 rounded-md text-slate-400">Time: 2026-06-11 UTC</span>
        </div>
      </div>

      {/* KPI Cards Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Rev */}
        <div id="kpi-revenue" className="bg-slate-900/40 backdrop-blur-md rounded-xl p-4 border border-white/5 flex flex-col justify-between hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Gross Revenue</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg md:text-2xl font-bold font-sans text-white">₦{totalRevenue.toLocaleString()}</h3>
            <span className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center">
              <TrendingUp size={10} className="mr-1" /> +12.4% vs last week
            </span>
          </div>
        </div>

        {/* Profit */}
        <div id="kpi-profit" className="bg-slate-900/40 backdrop-blur-md rounded-xl p-4 border border-white/5 flex flex-col justify-between hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Net Profit (Operating)</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg md:text-2xl font-bold font-sans text-white">₦{netProfit.toLocaleString()}</h3>
            <span className="text-[10px] text-blue-400 font-mono mt-1 flex items-center">
              Net margin: {((netProfit / (totalRevenue || 1)) * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Medicines / Stock */}
        <div id="kpi-stock" className="bg-slate-900/40 backdrop-blur-md rounded-xl p-4 border border-white/5 flex flex-col justify-between hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium font-sans">Products & Stock</span>
            <div className="p-2 bg-yellow-500/10 text-yellow-400 rounded-lg">
              <Package size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg md:text-2xl font-bold font-sans text-white">{medicines.length} Items</h3>
            <span className="text-[10px] text-yellow-400 font-mono mt-1 flex items-center">
              Total stock: {medicines.reduce((acc, curr) => acc + curr.stock, 0)} units
            </span>
          </div>
        </div>

        {/* Alerts Grid */}
        <div id="kpi-alerts" className="bg-slate-900/40 backdrop-blur-md rounded-xl p-4 border border-white/5 flex flex-col justify-between hover:border-red-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Critical Stock Alerts</span>
            <div className="p-2 bg-red-500/10 text-red-400 rounded-lg">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="mt-4 flex space-x-3">
            <div>
              <p className="text-[10px] text-slate-400 uppercase">Expiring/Expired</p>
              <h4 className="text-sm md:text-lg font-bold text-red-400 font-sans">{expiryStats.expiringSoon + expiryStats.expired}</h4>
            </div>
            <div className="border-l border-white/5 pl-3">
              <p className="text-[10px] text-slate-400 uppercase font-sans">Reorder Level</p>
              <h4 className="text-sm md:text-lg font-bold text-yellow-500 font-sans">{lowStockCount}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Bento Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Revenue Chart */}
        <div className="md:col-span-2 bg-slate-900/40 backdrop-blur-md p-5 rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-white font-sans">Multi-Branch Daily Revenue Trend</h2>
              <p className="text-xs text-slate-400">Tracking aggregate sales across Ikeja, Wuse II, and Kano branches.</p>
            </div>
            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/10 font-mono">Real-Time Sync</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `₦${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }}
                  labelStyle={{ color: "#94a3b8", fontWeight: "bold" }}
                  itemStyle={{ color: "#10b981" }}
                />
                <Area type="monotone" dataKey="revenue" name="Revenue (₦)" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Store Performance & Stock pie */}
        <div className="bg-slate-900/40 backdrop-blur-md p-5 rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white tracking-wide font-sans">Branch Contribution</h2>
            <p className="text-xs text-slate-400">Total revenue generated by active retail hub leases.</p>
          </div>
          <div className="h-48 mt-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={storePerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={(v) => `₦${v/1000000}M`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }}
                  itemStyle={{ color: "#10b981" }}
                />
                <Bar dataKey="Revenue" fill="#14b8a6" radius={[4, 4, 0, 0]}>
                  {storePerformanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1.5 border-t border-slate-800/80 pt-3">
            {branches.filter(b => b.revenue > 0).map((b, i) => (
              <div key={b.id} className="flex justify-between items-center text-xs text-slate-300">
                <span className="flex items-center">
                  <span className="w-2.5 h-2.5 rounded mr-1.5" style={{ backgroundColor: COLORS[i] }} />
                  {b.name}
                </span>
                <span className="font-mono text-slate-100">₦{b.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Critical Stock, Expiry & Recent Activity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Alerts / Reorders */}
        <div className="bg-slate-900/40 backdrop-blur-md p-5 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center">
              <AlertTriangle size={14} className="text-yellow-500 mr-2" /> Stock & Expiry Warnings
            </h2>
            <button onClick={() => onNavigate("medicines")} className="text-[10px] text-emerald-400 hover:underline flex items-center">
              Manage Catalog <ArrowUpRight size={10} className="ml-1" />
            </button>
          </div>
          <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
            {medicines.map(m => {
              const today = new Date("2026-06-11");
              const expDate = new Date(m.expiryDate);
              const isExpired = expDate < today;
              const isClose = !isExpired && (expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24) <= 45;
              const isLow = m.stock <= m.reorderLevel;

              if (!isExpired && !isClose && !isLow) return null;

              return (
                <div key={m.id} className="flex items-start justify-between bg-white/[0.02] p-2.5 rounded-lg border border-white/5 text-xs">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-200">{m.name}</p>
                    <p className="text-[10px] text-slate-400 italic">Generic: {m.genericName}</p>
                    <div className="flex space-x-2 mt-1">
                      {isExpired && (
                        <span className="bg-red-500/20 text-red-400 font-bold px-1.5 py-0.5 rounded text-[9px] border border-red-500/20 flex items-center">
                          <CalendarX size={8} className="mr-1" /> EXPIRED ({m.expiryDate})
                        </span>
                      )}
                      {isClose && (
                        <span className="bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded text-[9px] border border-orange-500/20 flex items-center">
                          <Calendar size={8} className="mr-1" /> Near Expiry ({m.expiryDate})
                        </span>
                      )}
                      {isLow && (
                        <span className="bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded text-[9px] border border-yellow-500/20 flex items-center">
                          <Package size={8} className="mr-1" /> Reorder Level ({m.stock} left)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Pos Sales */}
        <div className="bg-slate-900/40 backdrop-blur-md p-5 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center">
              <ShoppingCart size={14} className="text-emerald-500 mr-2" /> Recent Sales Activity
            </h2>
            <button onClick={() => onNavigate("sales")} className="text-[10px] text-emerald-400 hover:underline flex items-center">
              Sales Ledger <ArrowUpRight size={10} className="ml-1" />
            </button>
          </div>
          <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
            {sales.slice(0, 4).map(s => (
              <div key={s.id} className="flex items-center justify-between bg-white/[0.02] p-2.5 rounded-lg border border-white/5 text-xs">
                <div>
                  <p className="font-semibold text-slate-200">{s.customerName}</p>
                  <p className="text-[10px] text-slate-400">{s.invoiceNumber} • {new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  <p className="text-[10px] text-emerald-500/80 font-mono mt-0.5">{s.paymentMethod} Payment</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-100 font-mono">₦{s.total.toLocaleString()}</p>
                  <p className="text-[9px] text-slate-400">{s.items.length} items</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Business ledger metrics and AI Health monitor */}
        <div className="bg-slate-900/40 backdrop-blur-md p-5 rounded-2xl border border-white/5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center">
                <CheckCircle size={14} className="text-blue-500 mr-2" /> Systems & Integrity
              </h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 text-xs">
                <div>
                  <p className="font-semibold text-emerald-400">Database & Tenancy</p>
                  <p className="text-[10px] text-slate-300">Continuous Backup Enabled</p>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 py-0.5 px-2 rounded-full font-mono border border-emerald-500/25">Sync'd</span>
              </div>

              <div className="flex items-center justify-between bg-blue-500/5 p-3 rounded-xl border border-blue-500/10 text-xs">
                <div>
                  <p className="font-semibold text-blue-400">Gemini-API Service</p>
                  <p className="text-[10px] text-slate-300">AI OCR, Drug Interaction Assistant</p>
                </div>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 py-0.5 px-2 rounded-full font-mono border border-blue-500/25">Online</span>
              </div>
            </div>
          </div>
          <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 text-slate-400 text-[11px] font-sans flex items-start space-x-2">
            <ShieldAlert size={14} className="text-amber-500 shrink-0 mt-0.5" />
            <span>
              <strong>Regulatory compliance check:</strong> Real-time drug prescription validations are locked under Pharmacist license pin #EM-90-X920.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
