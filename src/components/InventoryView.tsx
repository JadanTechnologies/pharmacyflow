import React, { useState, useMemo } from "react";
import { 
  ArrowUpRight, ArrowDownLeft, RefreshCw, FileText, CheckCircle, 
  Trash2, Plus, ShieldCheck, AlertTriangle, ListOrdered
} from "lucide-react";
import { Medicine, Branch, StockMovement } from "../types";

interface InventoryViewProps {
  medicines: Medicine[];
  branches: Branch[];
  activeBranchId: string;
  movements: StockMovement[];
  onAddMovement: (mov: StockMovement) => void;
  onUpdateStock: (medId: string, qty: number, direction: "in" | "out", branchId?: string) => void;
}

export default function InventoryView({ medicines, branches, activeBranchId, movements, onAddMovement, onUpdateStock }: InventoryViewProps) {
  const [tab, setTab] = useState<"movement" | "transfer" | "fefo">("movement");
  
  // States for transferring stock between branches
  const [transferMedId, setTransferMedId] = useState("");
  const [transferFromBranch, setTransferFromBranch] = useState("b4"); // default Central Warehouse
  const [transferToBranch, setTransferToBranch] = useState("b1"); 
  const [transferQty, setTransferQty] = useState(1);
  const [transferAuthBy, setTransferAuthBy] = useState("Super Admin");

  // States for adding damaged goods or return adjustments
  const [adjustMedId, setAdjustMedId] = useState("");
  const [adjustType, setAdjustType] = useState<"Damage" | "Stock In">("Damage");
  const [adjustQty, setAdjustQty] = useState(1);
  const [adjustNotes, setAdjustNotes] = useState("");

  // FEFO Audit (Sort medicines by expiration date to view critical dispatch sequence)
  const fefoList = useMemo(() => {
    return [...medicines].sort((a, b) => {
      return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
    });
  }, [medicines]);

  // Aggregate stock inventory valuation
  const inventoryValuationObj = useMemo(() => {
    let totalCostVal = 0;
    let totalSellingVal = 0;
    medicines.forEach(m => {
      const stockAtActive = m.branchStocks[activeBranchId] || 0;
      totalCostVal += m.purchasePrice * stockAtActive;
      totalSellingVal += m.sellingPrice * stockAtActive;
    });
    return { cost: totalCostVal, selling: totalSellingVal };
  }, [medicines, activeBranchId]);

  // Handle transfer submissions
  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferMedId || transferFromBranch === transferToBranch || transferQty <= 0) {
      alert("Please ensure valid target medicine, quantity, and distinct branches are selected.");
      return;
    }

    const med = medicines.find(m => m.id === transferMedId);
    if (!med) return;

    const availableStock = med.branchStocks[transferFromBranch] || 0;
    if (availableStock < transferQty) {
      alert(`Transfer Denied: Source branch (${branches.find(b => b.id === transferFromBranch)?.name}) only holds ${availableStock} units of this medication.`);
      return;
    }

    // Process Ledger updates
    const outMove: StockMovement = {
      id: `mvt_${Date.now()}_out`,
      timestamp: new Date().toISOString(),
      medicineId: med.id,
      medicineName: med.name,
      type: "Transfer Out",
      quantity: transferQty,
      referenceId: `TRF-${Math.floor(1000 + Math.random() * 9000)}`,
      branchId: transferFromBranch,
      notes: `Transfer to ${branches.find(b => b.id === transferToBranch)?.name}. Auth: ${transferAuthBy}`,
    };

    const inMove: StockMovement = {
      id: `mvt_${Date.now()}_in`,
      timestamp: new Date().toISOString(),
      medicineId: med.id,
      medicineName: med.name,
      type: "Transfer In",
      quantity: transferQty,
      referenceId: outMove.referenceId,
      branchId: transferToBranch,
      notes: `Received from ${branches.find(b => b.id === transferFromBranch)?.name}. Auth: ${transferAuthBy}`,
    };

    onAddMovement(outMove);
    onAddMovement(inMove);

    // Update medicines stocks State
    onUpdateStock(med.id, transferQty, "out", transferFromBranch);
    onUpdateStock(med.id, transferQty, "in", transferToBranch);

    alert(`Success: Relocation order ${outMove.referenceId} completed under license validation!`);
    setTransferQty(1);
    setTransferMedId("");
  };

  // Handle Damages/Adjustments
  const handleExecuteAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustMedId || adjustQty <= 0) {
      alert("Invalid quantity or medicine selection.");
      return;
    }

    const med = medicines.find(m => m.id === adjustMedId);
    if (!med) return;

    if (adjustType === "Damage" && (med.branchStocks[activeBranchId] || 0) < adjustQty) {
      alert("Damage count exceeds current branch stock count!");
      return;
    }

    const adjMove: StockMovement = {
      id: `mvt_${Date.now()}_adj`,
      timestamp: new Date().toISOString(),
      medicineId: med.id,
      medicineName: med.name,
      type: adjustType,
      quantity: adjustQty,
      referenceId: `ADJ-${Math.floor(1000 + Math.random() * 9000)}`,
      branchId: activeBranchId,
      notes: adjustNotes || `${adjustType} ledger entry log.`,
    };

    onAddMovement(adjMove);
    onUpdateStock(med.id, adjustQty, adjustType === "Stock In" ? "in" : "out", activeBranchId);

    alert(`Logged: Manual inventory transaction ${adjMove.referenceId} recorded in audit ledger.`);
    setAdjustQty(1);
    setAdjustMedId("");
    setAdjustNotes("");
  };

  return (
    <div id="inventory-root" className="space-y-6">
      
      {/* Top statistics banners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/40 backdrop-blur p-4 rounded-xl border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-mono block uppercase">Branch Cost Valuation</span>
            <h4 className="text-lg font-bold text-white font-mono">₦{inventoryValuationObj.cost.toLocaleString()}</h4>
          </div>
          <div className="bg-emerald-500/10 p-2 text-emerald-400 rounded-lg">
            <ShieldCheck size={18} />
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur p-4 rounded-xl border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-mono block uppercase">Selling Est. Revenue</span>
            <h4 className="text-lg font-bold text-teal-400 font-mono">₦{inventoryValuationObj.selling.toLocaleString()}</h4>
          </div>
          <div className="bg-teal-500/10 p-2 text-teal-400 rounded-lg">
            <ArrowUpRight size={18} />
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur p-4 rounded-xl border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-mono block uppercase">Operating Gross ROI margin</span>
            <h4 className="text-lg font-bold text-teal-300 font-mono">
              {(((inventoryValuationObj.selling - inventoryValuationObj.cost) / (inventoryValuationObj.selling || 1)) * 100).toFixed(1)}%
            </h4>
          </div>
          <div className="bg-blue-500/10 p-2 text-blue-400 rounded-lg">
            <RefreshCw size={18} />
          </div>
        </div>
      </div>

      {/* Internal Navigation Tabs */}
      <div className="flex bg-slate-950/45 p-1 rounded-xl border border-white/5 self-start space-x-1 w-max">
        <button 
          onClick={() => setTab("movement")}
          className={`text-xs px-4 py-1.5 rounded-lg transition-all ${
            tab === "movement" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Inventory Ledger Log
        </button>
        <button 
          onClick={() => setTab("transfer")}
          className={`text-xs px-4 py-1.5 rounded-lg transition-all ${
            tab === "transfer" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Branch Relocations (Transfers)
        </button>
        <button 
          onClick={() => setTab("fefo")}
          className={`text-xs px-4 py-1.5 rounded-lg transition-all flex items-center gap-15 ${
            tab === "fefo" ? "bg-emerald-500/10 text-[#2dd4bf] border border-emerald-500/10" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          FEFO Optimization Index
        </button>
      </div>

      {/* Tab: MOVEMENT AND ADJUSTMENTS */}
      {tab === "movement" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left panel: Log audit ledger */}
          <div className="lg:col-span-8 bg-slate-900/40 rounded-2xl border border-white/5 p-4 space-y-3">
            <h3 className="text-xs font-bold font-mono text-slate-300 uppercase leading-wide">Inward & Outward Dispatches</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-300">
                <thead className="bg-slate-950/45 font-mono text-[9px] text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-2">Timestamp UTC</th>
                    <th className="p-2">Drug formulation</th>
                    <th className="p-2 text-center">Type</th>
                    <th className="p-2 text-center">Branch</th>
                    <th className="p-2 text-center">Pcs</th>
                    <th className="p-2 text-right">Reference ID</th>
                    <th className="p-2 text-right">Memo Audit Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {movements.map((m, idx) => {
                    const isIn = m.type === "Stock In" || m.type === "Transfer In";
                    return (
                      <tr key={idx} className="hover:bg-slate-950/25">
                        <td className="p-2 text-[10px] font-mono text-slate-400">
                          {new Date(m.timestamp).toLocaleDateString()} {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-2 text-slate-100 font-semibold">{m.medicineName}</td>
                        <td className="p-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                            isIn ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                          }`}>
                            {m.type}
                          </span>
                        </td>
                        <td className="p-2 text-center font-mono text-[10px] text-slate-400">
                          {branches.find(b => b.id === m.branchId)?.name.split(" ")[0]}
                        </td>
                        <td className="p-2 text-center font-bold text-white font-mono">
                          {isIn ? `+${m.quantity}` : `-${m.quantity}`}
                        </td>
                        <td className="p-2 text-right font-mono text-slate-400">{m.referenceId}</td>
                        <td className="p-2 text-right text-[10px] italic text-slate-400 max-w-[150px] truncate" title={m.notes}>
                          {m.notes}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right panel: Log adjustment controls */}
          <div className="lg:col-span-4 bg-slate-900/40 rounded-2xl border border-white/5 p-4 h-max space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Manual Valuation & Damages Adjustment</h3>
              <p className="text-[11px] text-slate-400">Log damaged shelf disposals or direct non-PO supplier receipts.</p>
            </div>

            <form onSubmit={handleExecuteAdjustment} className="space-y-3.5 text-xs text-slate-300">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 block">Medication Item</label>
                <select 
                  value={adjustMedId} onChange={e => setAdjustMedId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg text-slate-300 p-2"
                >
                  <option value="">-- Choose registered item --</option>
                  {medicines.map(m => (
                    <option key={m.id} value={m.id}>{m.name} [Shelf Stock: {m.branchStocks[activeBranchId] || 0} Pcs]</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 block">Ledger Class</label>
                  <select 
                    value={adjustType} onChange={e => setAdjustType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg text-slate-300 p-2"
                  >
                    <option value="Damage">Damage Disposal</option>
                    <option value="Stock In">Manual Stock-In</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 block">Quantity (Pcs)</label>
                  <input 
                    type="number" min="1" value={adjustQty} onChange={e => setAdjustQty(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg text-slate-300 p-2 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 block">Detailed Audit Notes (mandatory)</label>
                <input 
                  type="text" required placeholder="e.g. Expired on refrigerator failure log"
                  value={adjustNotes} onChange={e => setAdjustNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg text-slate-300 p-2"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 rounded-lg text-xs"
              >
                Sign Off Inventory Ledger Adjustment
              </button>
            </form>
          </div>

        </div>
      )}

      {/* Tab: RE-LOCATIONS (TRANSFERS) */}
      {tab === "transfer" && (
        <div className="bg-slate-900/40 rounded-2xl border border-white/5 p-5 space-y-6">
          <div className="flex items-start gap-3 bg-blue-500/10 p-4 border border-blue-500/20 text-blue-300 rounded-xl max-w-2xl">
            <AlertTriangle className="shrink-0 mt-0.5" size={16} />
            <div className="text-xs space-y-1">
              <strong className="block text-white">Central Pharmacy Warehouse relocations policy:</strong>
              <span>Always verify shipping temperatures. Artemether antimalarials or Insulins must transit inside clinical cold boxes. Stock balance synchronization triggers instantly upon sign-off.</span>
            </div>
          </div>

          <form onSubmit={handleExecuteTransfer} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-xs text-slate-300 bg-slate-950/20 p-4 rounded-xl border border-white/5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-400 block">Select Medication Profile</label>
              <select 
                value={transferMedId} onChange={e => setTransferMedId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg text-slate-300 p-2"
              >
                <option value="">-- Choose item --</option>
                {medicines.map(m => (
                  <option key={m.id} value={m.id}>{m.name} (Global stock: {m.stock})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-400 block">Source Store Location</label>
              <select 
                value={transferFromBranch} onChange={e => setTransferFromBranch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg text-slate-300 p-2"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-400 block">Recipient Store Location</label>
              <select 
                value={transferToBranch} onChange={e => setTransferToBranch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg text-slate-300 p-2"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-400 block">Quantity Pcs to Transfer</label>
              <input 
                type="number" min="1" value={transferQty} onChange={e => setTransferQty(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg text-slate-300 p-2 font-mono"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-mono text-slate-400 block">Supervisory Validation Clearance License</label>
              <input 
                type="text" required placeholder="e.g. Pharmacy Board Pin #PB-9022" 
                value={transferAuthBy} onChange={e => setTransferAuthBy(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg text-slate-300 p-2"
              />
            </div>

            <div className="md:col-span-2 pt-1">
              <button 
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-1.5"
              >
                <Plus size={14} /> Commit Relocation Transfer Order
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: FEFO OPTIMIZATION INDEX */}
      {tab === "fefo" && (
        <div className="bg-slate-900/40 rounded-2xl border border-white/5 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ListOrdered size={16} className="text-[#2dd4bf]" /> Standard FEFO Dispatch Algorithm
              </h3>
              <p className="text-xs text-slate-400">First-Expiry, First-Out layout to prevent retail stock write-offs.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-[#115e59]/30 text-[#2dd4bf] font-mono text-[9px] uppercase tracking-wide">
                <tr>
                  <th className="p-3">Rank No.</th>
                  <th className="p-3">Medication drug</th>
                  <th className="p-3">Generic formula</th>
                  <th className="p-3">Lot (Batch)</th>
                  <th className="p-3 text-center">Expiry Limit</th>
                  <th className="p-3 text-center">Shelf Stock</th>
                  <th className="p-3 text-right">Dispatch Sequence Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {fefoList.map((med, idx) => {
                  const today = new Date("2026-06-11");
                  const expDate = new Date(med.expiryDate);
                  const isExpired = expDate < today;
                  const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                  return (
                    <tr key={med.id} className={`${isExpired ? "bg-red-500/5" : diffDays <= 45 ? "bg-amber-500/5" : "hover:bg-slate-950/20"}`}>
                      <td className="p-3 font-mono font-bold text-[#2dd4bf]">#{idx + 1}</td>
                      <td className="p-3 font-semibold text-white">{med.name}</td>
                      <td className="p-3 italic text-slate-400">{med.genericName}</td>
                      <td className="p-3 font-mono text-slate-300">{med.batchNumber}</td>
                      <td className="p-3 text-center font-mono font-bold text-slate-150">{med.expiryDate}</td>
                      <td className="p-3 text-center font-bold font-mono">{med.branchStocks[activeBranchId] || 0}</td>
                      <td className="p-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono leading-none ${
                          isExpired 
                            ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                            : diffDays <= 45 
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse" 
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}>
                          {isExpired ? "RETRACT FROM STAND" : diffDays <= 45 ? "DISPATCH NOW" : "SECURE HOLD"}
                        </span>
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
