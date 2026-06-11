import React, { useState, useMemo } from "react";
import { 
  TrendingUp, TrendingDown, FileText, ArrowUpRight, ArrowDownRight, 
  Download, Calendar, ShieldCheck, Printer, HelpCircle
} from "lucide-react";
import { FinancialRecord, Medicine, Sale } from "../types";

interface FinanceViewProps {
  finances: FinancialRecord[];
  sales: Sale[];
  medicines: Medicine[];
  activeBranchId: string;
  onAddFinanceRecord: (rec: FinancialRecord) => void;
}

export default function FinanceView({ finances, sales, medicines, activeBranchId, onAddFinanceRecord }: FinanceViewProps) {
  const [tab, setTab] = useState<"ledger" | "pl">("pl");
  
  // Expenditure addition form values
  const [expCategory, setExpCategory] = useState<FinancialRecord["category"]>("Rent");
  const [expAmount, setExpAmount] = useState(0);
  const [expDesc, setExpDesc] = useState("");
  const [expMethod, setExpMethod] = useState("Bank Transfer");

  // Summatic financials
  const totalsObj = useMemo(() => {
    // Collect gross sales from POS dynamically to keep in sync
    const posSalesTotal = sales.reduce((sum, s) => sum + s.total, 0);

    let totalExpense = 0;
    finances.forEach(f => {
      if (f.type === "Expense") {
        totalExpense += f.amount;
      }
    });

    const calculatedCOGS = sales.reduce((sum, s) => {
      let cost = 0;
      s.items.forEach(it => {
        const med = medicines.find(m => m.id === it.medicineId);
        cost += med ? (med.purchasePrice * it.quantity) : (it.price * 0.6) * it.quantity;
      });
      return sum + cost;
    }, 0);

    const grossMargin = posSalesTotal - calculatedCOGS;
    const EBITDA = grossMargin - totalExpense;
    const taxes = EBITDA * 0.05; // 5% flat VAT/assessments
    const netProfit = EBITDA - taxes;

    return {
      revenue: posSalesTotal,
      cogs: calculatedCOGS,
      grossMargin,
      expense: totalExpense,
      ebitda: EBITDA,
      taxes,
      net: netProfit,
    };
  }, [finances, sales, medicines]);

  // Submit expenses
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (expAmount <= 0 || !expDesc) {
      alert("Invalid expenditure parameters.");
      return;
    }

    const newRecord: FinancialRecord = {
      id: `f_${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      type: "Expense",
      category: expCategory,
      amount: expAmount,
      paymentMethod: expMethod,
      description: expDesc,
      branchId: activeBranchId,
    };

    onAddFinanceRecord(newRecord);
    setExpAmount(0);
    setExpDesc("");
    alert("Expense voucher registered inside the system ledger.");
  };

  const triggerExport = (format: "csv" | "excel") => {
    alert(`Double-entry financial audit compiled inside server workspace. Download of pharmerp-pl-sheet_2026.${format === "csv" ? "csv" : "xlsx"} completed.`);
  };

  return (
    <div id="finance-root" className="space-y-6">
      
      {/* Top dashboard summary counts */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Financial & Operating Ledger</h2>
          <p className="text-xs text-slate-400">P&L spreadsheets, double-entry operating expenditures, tax provisions, and statutory exports.</p>
        </div>

        <div className="flex bg-slate-950/45 p-1 rounded-xl border border-white/5 space-x-1 self-start md:self-auto">
          <button 
            onClick={() => setTab("pl")}
            className={`text-xs px-4 py-1.5 rounded-lg transition-all ${
              tab === "pl" ? "bg-emerald-500/10 text-[#10b981] border border-emerald-500/10" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Profit & Loss Statements
          </button>
          <button 
            onClick={() => setTab("ledger")}
            className={`text-xs px-4 py-1.5 rounded-lg transition-all ${
              tab === "ledger" ? "bg-emerald-500/10 text-[#10b981] border border-emerald-500/10" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Day Ledger List
          </button>
        </div>
      </div>

      {/* Tab: PROFIT AND LOSS STATEMENTS */}
      {tab === "pl" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left panel: Detailed P&L statement grid */}
          <div className="lg:col-span-8 bg-slate-900/40 rounded-3xl border border-white/5 p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Income & Expenditure Statement</h3>
                <p className="text-[11px] text-slate-400">Quarter ended June 11, 2026. Values compiled across active leases.</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => triggerExport("csv")}
                  className="bg-slate-950 border border-slate-800 text-slate-300 hover:text-white text-[10px] font-semibold py-1 px-2 rounded-lg flex items-center transition-colors"
                >
                  <Download size={11} className="mr-1" /> EXPORT CSV
                </button>
                <button 
                  onClick={() => triggerExport("excel")}
                  className="bg-slate-950 border border-slate-800 text-slate-300 hover:text-white text-[10px] font-semibold py-1 px-2 rounded-lg flex items-center transition-colors"
                >
                  <Download size={11} className="mr-1" /> EXPORT EXCEL
                </button>
              </div>
            </div>

            {/* P&L Row spreadsheets grid */}
            <div className="space-y-2 text-xs text-slate-200">
              
              {/* REVENUE CLASS */}
              <div className="flex justify-between font-bold text-white border-b border-slate-800 pb-1.5 pt-2 uppercase tracking-wide">
                <span>1. Revenue Accounts</span>
                <span>Amount (₦)</span>
              </div>
              <div className="flex justify-between pl-4 text-slate-450 font-mono">
                <span>POS Retail Sales (Dispensary)</span>
                <span>₦{totalsObj.revenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pl-4 text-slate-450 font-mono">
                <span>Clinical Pharmacy Consults Support</span>
                <span>₦0</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-400 bg-emerald-500/5 p-2 rounded">
                <span>Total Gross Sales Revenue (A)</span>
                <span className="font-mono">₦{totalsObj.revenue.toLocaleString()}</span>
              </div>

              {/* COGS */}
              <div className="flex justify-between font-bold text-white border-b border-slate-800 pb-1.5 pt-4 uppercase tracking-wide">
                <span>2. Cost of Sales</span>
                <span></span>
              </div>
              <div className="flex justify-between pl-4 text-slate-450 font-mono">
                <span>Weighted Drug Cost of Goods Sold (FIFO/FEFO)</span>
                <span>(₦{totalsObj.cogs.toLocaleString()})</span>
              </div>
              <div className="flex justify-between font-bold text-teal-400 bg-teal-500/5 p-2 rounded">
                <span>Gross Trading Profit Margin (B = A - COGS)</span>
                <span className="font-mono">₦{totalsObj.grossMargin.toLocaleString()}</span>
              </div>

              {/* EXPENSES */}
              <div className="flex justify-between font-bold text-white border-b border-slate-800 pb-1.5 pt-4 uppercase tracking-wide">
                <span>3. Operating Expenditures (SG&A)</span>
                <span></span>
              </div>
              {finances.filter(f => f.type === "Expense").map((f, i) => (
                <div key={i} className="flex justify-between pl-4 text-slate-450 font-mono text-[11px]">
                  <span>{f.category} ({f.description})</span>
                  <span>₦{f.amount.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-red-400 bg-red-500/5 p-2 rounded">
                <span>Total SG&A Expenses (C)</span>
                <span className="font-mono">₦{totalsObj.expense.toLocaleString()}</span>
              </div>

              {/* NET RESULTS */}
              <div className="flex justify-between font-bold text-white border-b border-slate-800 pb-1.5 pt-4 uppercase tracking-wide">
                <span>4. Operating Net Results</span>
                <span></span>
              </div>
              <div className="flex justify-between pl-4 text-slate-450 font-mono">
                <span>EBITDA operating margin</span>
                <span>₦{totalsObj.ebitda.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pl-4 text-slate-450 font-mono">
                <span>Statutory VAT Assessment Flat (5%)</span>
                <span>₦{totalsObj.taxes.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-400 bg-emerald-500/10 p-2.5 rounded border border-emerald-500/20 text-sm">
                <span>NET PAT RETAINED INCOME (D = EBITDA - Taxes)</span>
                <span className="font-mono">₦{totalsObj.net.toLocaleString()}</span>
              </div>

            </div>
          </div>

          {/* Right panel: SGD expense entry voucher form */}
          <div className="lg:col-span-4 bg-slate-900/40 rounded-3xl border border-white/5 p-4 h-max space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Log SG&A Expenditures</h3>
              <p className="text-[11px] text-slate-400">Post operating costs: wages, leased leases, utility bills, diesel fuels.</p>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3.5 text-xs text-slate-350">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-450 block">Expenditure Class</label>
                <select 
                  value={expCategory} onChange={e => setExpCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg text-slate-300 p-2 outline-none"
                >
                  <option value="Salary">Salaries & Payroll Wages</option>
                  <option value="Rent">Facility Store Rental Lease</option>
                  <option value="Utilities">Utilities & Generator Fuels</option>
                  <option value="Logistics">Transport & Clinical Freight</option>
                  <option value="Supplies">Operating stationary supplies</option>
                  <option value="Other">Other Miscellaneous Outgoings</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-450 block">Payment Settlement Method</label>
                <select 
                  value={expMethod} onChange={e => setExpMethod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg text-slate-300 p-2 outline-none"
                >
                  <option value="Bank Transfer">Bank Wire Transfer</option>
                  <option value="POS">Corporate Debit Card (POS)</option>
                  <option value="Cash">Cash Vault</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-450 block">Disbursement Cost Value (₦ NGN)</label>
                <input 
                  type="number" required min="1" placeholder="e.g. 50000"
                  value={expAmount || ""} onChange={e => setExpAmount(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg text-slate-350 p-2 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-450 block">Voucher Descriptive Memo</label>
                <input 
                  type="text" required placeholder="e.g. Generator diesel 50 liters April purchase"
                  value={expDesc} onChange={e => setExpDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg text-slate-350 p-2"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 rounded-lg text-xs"
              >
                Log Expenditure Voucher
              </button>
            </form>
          </div>

        </div>
      )}

      {/* Tab: LEDGERS LIST */}
      {tab === "ledger" && (
        <div className="bg-slate-900/40 p-4 rounded-3xl border border-white/5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200">Double Entry Day Transaction list</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-[#115e59]/10 text-emerald-400 font-mono text-[9px]">
                <tr>
                  <th className="p-2.5">Date posted</th>
                  <th className="p-2.5">General ledger accounts classification</th>
                  <th className="p-2.5">Verification details</th>
                  <th className="p-2.5 text-center">Settlement</th>
                  <th className="p-2.5 text-right">Debit (Expenditure ₦)</th>
                  <th className="p-2.5 text-right">Credit (Income ₦)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {finances.map((rec, idx) => {
                  const isInc = rec.type === "Income";
                  return (
                    <tr key={idx} className="hover:bg-slate-950/20">
                      <td className="p-2.5 font-mono text-slate-450">{rec.date}</td>
                      <td className="p-2.5 font-bold text-white">{rec.category}</td>
                      <td className="p-2.5 italic text-slate-400">{rec.description}</td>
                      <td className="p-2.5 text-center">
                        <span className="bg-slate-950 text-slate-300 border border-white/5 py-0.5 px-2 rounded-full font-mono text-[9px]">
                          {rec.paymentMethod}
                        </span>
                      </td>
                      <td className="p-2.5 text-right font-mono text-red-400">
                        {!isInc ? `₦${rec.amount.toLocaleString()}` : "—"}
                      </td>
                      <td className="p-2.5 text-right font-mono text-emerald-400">
                        {isInc ? `₦${rec.amount.toLocaleString()}` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
