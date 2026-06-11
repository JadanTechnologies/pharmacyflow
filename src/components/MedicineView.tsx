import React, { useState, useMemo } from "react";
import { 
  Plus, Search, SlidersHorizontal, PackageCheck, AlertOctagon, 
  Trash2, QrCode, Barcode, CalendarCheck, Edit, ShieldAlert
} from "lucide-react";
import { Medicine, INITIAL_BRANCHES } from "../types";

interface MedicineViewProps {
  medicines: Medicine[];
  activeBranchId: string;
  onAddMedicine: (med: Medicine) => void;
  onDeleteMedicine: (id: string) => void;
}

export default function MedicineView({ medicines, activeBranchId, onAddMedicine, onDeleteMedicine }: MedicineViewProps) {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("All");
  const [filterType, setFilterType] = useState<"all" | "low" | "expiring" | "expired">("all");
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states for new medicine registration
  const [newName, setNewName] = useState("");
  const [newGeneric, setNewGeneric] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [newMfg, setNewMfg] = useState("");
  const [newCategory, setNewCategory] = useState<Medicine["category"]>("Antimalarial");
  const [newType, setNewType] = useState<Medicine["type"]>("Tablet");
  const [newUnit, setNewUnit] = useState("Box");
  const [newStrength, setNewStrength] = useState("");
  const [newBatch, setNewBatch] = useState("");
  const [newPurchase, setNewPurchase] = useState(0);
  const [newSelling, setNewSelling] = useState(0);
  const [newExpiry, setNewExpiry] = useState("");
  const [newMfgDate, setNewMfgDate] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newReorder, setNewReorder] = useState(15);
  const [newStock, setNewStock] = useState(50);

  const categories = ["All", "Antimalarial", "Antibiotic", "Analgesic", "Cardiovascular", "Antidiabetic", "Respiratory", "Vitamins"];

  // Perform filtering across complex parameters
  const filteredList = useMemo(() => {
    let result = medicines;

    // Search query
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(m => 
        m.name.toLowerCase().includes(s) || 
        m.genericName.toLowerCase().includes(s) ||
        m.brand.toLowerCase().includes(s) ||
        m.manufacturer.toLowerCase().includes(s)
      );
    }

    // Category drop selector
    if (selectedCat !== "All") {
      result = result.filter(m => m.category === selectedCat);
    }

    // Warning filter tabs
    const today = new Date("2026-06-11");
    if (filterType === "low") {
      result = result.filter(m => (m.branchStocks[activeBranchId] || 0) <= m.reorderLevel);
    } else if (filterType === "expiring") {
      result = result.filter(m => {
        const exp = new Date(m.expiryDate);
        const diffDays = (exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        return exp >= today && diffDays <= 45;
      });
    } else if (filterType === "expired") {
      result = result.filter(m => new Date(m.expiryDate) < today);
    }

    return result;
  }, [medicines, search, selectedCat, filterType, activeBranchId]);

  // Submit Handler
  const handleRegisterProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newGeneric || !newBatch || !newExpiry) {
      alert("Please provide required product name, generic formula, batch number, and expiry threshold.");
      return;
    }

    // Generate simulated scannable identifiers
    const randomBarcode = `6151100${Math.floor(100000 + Math.random() * 900000)}`;
    const randomQr = `${newName.toUpperCase().replace(/\s+/g, "-")}-${newBatch.toUpperCase()}`;

    const newMed: Medicine = {
      id: `m_${Date.now()}`,
      name: newName,
      genericName: newGeneric,
      brand: newBrand || newName,
      manufacturer: newBrand || "Generic Manufacturer",
      category: newCategory,
      type: newType,
      unit: newUnit,
      strength: newStrength || "5000mg",
      batchNumber: newBatch,
      barcode: randomBarcode,
      qrCode: randomQr,
      purchasePrice: newPurchase,
      sellingPrice: newSelling,
      expiryDate: newExpiry,
      manufacturingDate: newMfgDate || "2025-01-01",
      tax: 5,
      storeLocation: newLocation || "Aisle A - Tier 1",
      reorderLevel: newReorder,
      stock: newStock,
      branchStocks: {
        b1: Math.floor(newStock * 0.4),
        b2: Math.floor(newStock * 0.4),
        b3: Math.floor(newStock * 0.2),
        [activeBranchId]: newStock,
      }
    };

    onAddMedicine(newMed);
    setShowAddForm(false);

    // Reset Form
    setNewName("");
    setNewGeneric("");
    setNewBrand("");
    setNewMfg("");
    setNewBatch("");
    setNewPurchase(0);
    setNewSelling(0);
    setNewExpiry("");
    setNewMfgDate("");
    setNewLocation("");
  };

  return (
    <div id="medicine-root" className="space-y-6">
      
      {/* Top action and filter bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Medicine Catalog</h2>
          <p className="text-xs text-slate-400">Inventory profiles, drug warnings, barcodes, batch tracking, and expiry audits.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all self-start md:self-auto"
        >
          <Plus size={16} /> Register New Drug Profile
        </button>
      </div>

      {/* Add Medicine Expanded Drawer Form */}
      {showAddForm && (
        <form onSubmit={handleRegisterProduct} className="bg-slate-900/55 p-5 rounded-2xl border border-white/5 space-y-4 grid grid-cols-1 md:grid-cols-3 gap-x-4 animate-in slide-in-from-top duration-300">
          <div className="md:col-span-3 pb-2 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-200">New Medication / Drug Regulatory Entry</h3>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-white text-xs font-mono">
              [Close]
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-mono block">Medicine Name *</label>
            <input 
              type="text" required placeholder="e.g. Amatem Softgel"
              value={newName} onChange={e => setNewName(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 text-xs p-2 focus:ring-1 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-mono block">Generic Active Ingredients *</label>
            <input 
              type="text" required placeholder="e.g. Artemether + Lumefantrine"
              value={newGeneric} onChange={e => setNewGeneric(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 text-xs p-2 focus:ring-1 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-mono block">Brand Name & Manufacturer</label>
            <input 
              type="text" placeholder="e.g. Fidson Healthcare Plc"
              value={newBrand} onChange={e => setNewBrand(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 text-xs p-2 focus:ring-1 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-mono block">Category</label>
            <select 
              value={newCategory} onChange={e => setNewCategory(e.target.value as Medicine["category"])}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 text-xs p-2 outline-none"
            >
              <option value="Antimalarial">Antimalarial</option>
              <option value="Antibiotic">Antibiotic</option>
              <option value="Analgesic">Analgesic</option>
              <option value="Cardiovascular">Cardiovascular</option>
              <option value="Antidiabetic">Antidiabetic</option>
              <option value="Respiratory">Respiratory</option>
              <option value="Vitamins">Vitamins</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-mono block">Dispense Form</label>
            <select 
              value={newType} onChange={e => setNewType(e.target.value as Medicine["type"])}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 text-xs p-2 outline-none"
            >
              <option value="Tablet">Tablet</option>
              <option value="Capsule">Capsule</option>
              <option value="Syrup">Syrup</option>
              <option value="Injection">Injection</option>
              <option value="Cream">Cream</option>
              <option value="Inhaler">Inhaler</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-mono block">Unit / Strength Pack (Strength/Unit)</label>
            <div className="flex gap-2">
              <input type="text" placeholder="e.g. Box of 6" value={newUnit} onChange={e => setNewUnit(e.target.value)} className="w-1/2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 text-xs p-2 outline-none" />
              <input type="text" placeholder="e.g. 80mg" value={newStrength} onChange={e => setNewStrength(e.target.value)} className="w-1/2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 text-xs p-2 outline-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-mono block">Batch Number *</label>
            <input 
              type="text" required placeholder="e.g. BAT-2026-09"
              value={newBatch} onChange={e => setNewBatch(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 text-xs p-2 focus:ring-1 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-mono block">Purchase Cost (₦ NGN)</label>
            <input 
              type="number" 
              value={newPurchase} onChange={e => setNewPurchase(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 text-xs p-2 outline-none font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-mono block">Retail Selling Price (₦ NGN)</label>
            <input 
              type="number" 
              value={newSelling} onChange={e => setNewSelling(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 text-xs p-2 outline-none font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-mono block">Manufactured Date (YYYY-MM-DD)</label>
            <input 
              type="date"
              value={newMfgDate} onChange={e => setNewMfgDate(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 text-xs p-2 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-mono block">Expiry Bound Date * (YYYY-MM-DD)</label>
            <input 
              type="date" required
              value={newExpiry} onChange={e => setNewExpiry(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 text-xs p-2 outline-none border-red-500/30"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-mono block">Safety/Store Shelf Location</label>
            <input 
              type="text" placeholder="e.g. Fridge Row A"
              value={newLocation} onChange={e => setNewLocation(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 text-xs p-2 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-mono block">Reorder Alert Stock Level</label>
            <input 
              type="number" 
              value={newReorder} onChange={e => setNewReorder(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 text-xs p-2 outline-none font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-mono block">Initial Physical Count (Stock)</label>
            <input 
              type="number" 
              value={newStock} onChange={e => setNewStock(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 text-xs p-2 outline-none font-mono"
            />
          </div>

          <div className="md:col-span-3 pt-3 flex justify-end">
            <button 
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 px-6 rounded-xl text-xs transition-all flex items-center gap-1"
            >
              <PackageCheck size={14} /> Certify Medication into Registry
            </button>
          </div>
        </form>
      )}

      {/* Grid of warning alerts tabs and search row */}
      <div className="bg-slate-900/40 p-4 rounded-2xl border border-white/5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Quick Filters */}
          <div className="flex bg-slate-950/40 p-1.5 rounded-xl border border-white/5 space-x-1 self-start">
            <button 
              onClick={() => setFilterType("all")}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                filterType === "all" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All Items
            </button>
            <button 
              onClick={() => setFilterType("low")}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all flex items-center ${
                filterType === "low" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/10" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Low Stock
            </button>
            <button 
              onClick={() => setFilterType("expiring")}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all flex items-center ${
                filterType === "expiring" ? "bg-orange-500/10 text-orange-400 border border-orange-500/10" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Near Expiry (≤45 Days)
            </button>
            <button 
              onClick={() => setFilterType("expired")}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all flex items-center ${
                filterType === "expired" ? "bg-red-500/10 text-red-400 border border-red-500/10" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Expired
            </button>
          </div>

          {/* Search elements */}
          <div className="relative w-full md:w-64 gap-2 flex">
            <input 
              type="text"
              placeholder="Filter list..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-slate-950/50 border border-slate-800 rounded-lg text-slate-200 text-xs py-1.5 pl-3 pr-8 w-full"
            />
          </div>

        </div>

        {/* Categories selector horizontal rail */}
        <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-800">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`text-[10px] font-mono px-2.5 py-1 rounded-full shrink-0 border transition-all ${
                selectedCat === cat 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-slate-950/30 text-slate-400 border-slate-800/80 hover:border-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Registry Display Table */}
      <div className="bg-slate-900/40 rounded-2xl border border-white/5 overflow-x-auto">
        <table className="w-full text-xs text-left text-slate-300">
          <thead className="text-[10px] uppercase font-mono tracking-wider bg-slate-950/50 text-slate-400 border-b border-white/5">
            <tr>
              <th className="px-4 py-3">Medicine & Batch</th>
              <th className="px-4 py-3">Active Compounds</th>
              <th className="px-4 py-3 text-center">Form</th>
              <th className="px-4 py-3 text-right">Selling Price</th>
              <th className="px-4 py-3 text-center">Batch stock</th>
              <th className="px-4 py-3 text-center">Expiry State</th>
              <th className="px-4 py-3 text-center">Scannables</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredList.map(med => {
              const currentStock = med.branchStocks[activeBranchId] || 0;
              const isLow = currentStock <= med.reorderLevel;
              const today = new Date("2026-06-11");
              const expDate = new Date(med.expiryDate);
              const isExpired = expDate < today;
              const isClose = !isExpired && (expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24) <= 45;

              return (
                <tr key={med.id} className="hover:bg-slate-950/20 transition-all font-sans">
                  
                  {/* Name and batch */}
                  <td className="px-4 py-3.5 space-y-1">
                    <div className="font-semibold text-white text-xs">{med.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono uppercase bg-slate-950/50 py-0.5 px-1.5 rounded w-max">
                      LOT: {med.batchNumber}
                    </div>
                  </td>

                  {/* Ingredients & manufacturer */}
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-slate-200">{med.genericName}</p>
                    <span className="text-[10px] text-slate-400 block italic">{med.manufacturer}</span>
                  </td>

                  {/* Form & strength */}
                  <td className="px-4 py-3.5 text-center font-mono">
                    <p className="text-white font-semibold">{med.type}</p>
                    <span className="text-[10px] text-slate-400 block">{med.strength}</span>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3.5 text-right font-mono">
                    <p className="text-white font-bold">₦{med.sellingPrice.toLocaleString()}</p>
                    <span className="text-[9px] text-slate-400 font-mono block">Cost: ₦{med.purchasePrice.toLocaleString()}</span>
                  </td>

                  {/* stock status */}
                  <td className="px-4 py-3.5 text-center">
                    <span className={`px-2 py-1 rounded text-[10px] font-mono font-bold border ${
                      currentStock === 0 
                        ? "bg-red-500/10 text-red-400 border-red-500/20" 
                        : isLow 
                        ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" 
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    }`}>
                      {currentStock} Pcs
                    </span>
                    <span className="text-[8px] text-slate-400 block mt-1">Reorder at {med.reorderLevel}</span>
                  </td>

                  {/* Expiry date status */}
                  <td className="px-4 py-3.5 text-center">
                    <p className={`font-semibold font-mono text-[10px] ${
                      isExpired ? "text-red-400" : isClose ? "text-orange-400 animate-pulse" : "text-slate-300"
                    }`}>
                      {med.expiryDate}
                    </p>
                    <span className="text-[9px] block">
                      {isExpired ? "🔴 EXPIRED" : isClose ? "⚠️ expiring" : "🟢 OK"}
                    </span>
                  </td>

                  {/* Barcode/QR visualization button toggle which alerts or shows codes */}
                  <td className="px-4 py-3.5 text-center">
                    <div className="flex justify-center gap-1.5">
                      <button 
                        onClick={() => alert(`Simulated scannable GTIN EAN BARCODE for [${med.name}]: ${med.barcode}`)}
                        className="p-1 px-1.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-emerald-400 rounded-md transition-colors flex items-center gap-0.5 text-[9px]"
                        title={med.barcode}
                      >
                        <Barcode size={11} /> Barcode
                      </button>
                      <button 
                        onClick={() => alert(`Simulated ERP Micro-QR and blockchain locator for [${med.name}]: ${med.qrCode}`)}
                        className="p-1 px-1.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-emerald-400 rounded-md transition-colors flex items-center gap-0.5 text-[9px]"
                        title={med.qrCode}
                      >
                        <QrCode size={11} /> QR
                      </button>
                    </div>
                  </td>

                  {/* Delete / remove action */}
                  <td className="px-4 py-3.5 text-right">
                    <button 
                        onClick={() => {
                          if (confirm(`Are you sure you want to retire this medication drug profile [${med.name}] from database registry?`)) {
                            onDeleteMedicine(med.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-red-400 rounded transition-colors"
                      >
                        <Trash2 size={13} />
                    </button>
                  </td>

                </tr>
              );
            })}

            {filteredList.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-10 text-slate-400">
                  No registered medicines fit the selected filter configurations.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
