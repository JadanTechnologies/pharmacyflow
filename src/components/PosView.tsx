import React, { useState, useMemo } from "react";
import { 
  Search, Barcode, Trash2, ShoppingCart, UserPlus, CreditCard, 
  Percent, FileText, CheckCircle, Printer, MessageSquare, Mail, AlertTriangle,
  Clock, History, TrendingUp, ShieldCheck, Package, Layers, FileSpreadsheet, 
  AlertCircle, Ban, BellRing, Info, ChevronDown, ChevronRight
} from "lucide-react";
import { Medicine, Customer, Sale, SaleItem, ERPUser } from "../types";

interface PosViewProps {
  medicines: Medicine[];
  customers: Customer[];
  activeBranchId: string;
  onAddSale: (sale: Sale) => void;
  onUpdateStock: (medId: string, qty: number, direction: "in" | "out") => void;
  currentUser: ERPUser;
  sales: Sale[];
}

export default function PosView({ medicines, customers, activeBranchId, onAddSale, onUpdateStock, currentUser, sales }: PosViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<"checkout" | "history" | "eod">("checkout");
  const [expandedInvoices, setExpandedInvoices] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [cart, setCart] = useState<{ medicine: Medicine; quantity: number; discountPercent: number }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<Sale["paymentMethod"]>("Cash");
  const [splitPaymentParts, setSplitPaymentParts] = useState({ cash: 0, pos: 0, bank: 0 });
  const [discountAmount, setDiscountAmount] = useState(0);
  const [lastCompletedSale, setLastCompletedSale] = useState<Sale | null>(null);
  const [thermalReceiptOpen, setThermalReceiptOpen] = useState(false);

  // EOD Stats State variables
  const [countedCash, setCountedCash] = useState<number>(0);
  const [countedPos, setCountedPos] = useState<number>(0);
  const [countedTransfer, setCountedTransfer] = useState<number>(0);
  const [countedMixed, setCountedMixed] = useState<number>(0);
  const [eodNotes, setEodNotes] = useState<string>("");
  const [eodList, setEodList] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("pharmerp_eod_reconciliations") || "[]");
    } catch {
      return [];
    }
  });

  // Natural retro synth bell sound (high frequency dual-oscillator decay envelope)
  const playBellSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, ctx.currentTime); // High pitch ring (A5)

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1320, ctx.currentTime); // Ring high fifth (E6 harmonics)

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2); // decaying chime style

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();

      osc1.stop(ctx.currentTime + 1.2);
      osc2.stop(ctx.currentTime + 1.2);
    } catch (err) {
      console.warn("Bell audio tone missed:", err);
    }
  };

  // EOD Computations
  const expectedCash = useMemo(() => {
    return sales
      .filter(s => s.cashierName === currentUser.username && s.branchId === activeBranchId && s.paymentMethod === "Cash")
      .reduce((a, b) => a + b.total, 0);
  }, [sales, currentUser.username, activeBranchId]);

  const expectedPos = useMemo(() => {
    return sales
      .filter(s => s.cashierName === currentUser.username && s.branchId === activeBranchId && s.paymentMethod === "POS")
      .reduce((a, b) => a + b.total, 0);
  }, [sales, currentUser.username, activeBranchId]);

  const expectedTransfer = useMemo(() => {
    return sales
      .filter(s => s.cashierName === currentUser.username && s.branchId === activeBranchId && s.paymentMethod === "Bank Transfer")
      .reduce((a, b) => a + b.total, 0);
  }, [sales, currentUser.username, activeBranchId]);

  const expectedMixed = useMemo(() => {
    return sales
      .filter(s => s.cashierName === currentUser.username && s.branchId === activeBranchId && s.paymentMethod === "Mixed")
      .reduce((a, b) => a + b.total, 0);
  }, [sales, currentUser.username, activeBranchId]);

  const expectedTotal = expectedCash + expectedPos + expectedTransfer + expectedMixed;

  const totalCounted = countedCash + countedPos + countedTransfer + countedMixed;
  const variance = totalCounted - expectedTotal;

  const handleEodSubmit = () => {
    const confirmSubmit = window.confirm("Are you sure you want to lock the till and finalize the End of Day Shift Audit Report? This action will freeze your terminal session registry.");
    if (!confirmSubmit) return;

    const reportId = `eod_rep_${Math.floor(Math.random() * 89999 + 10000)}`;
    const newReport = {
      id: reportId,
      timestamp: new Date().toISOString(),
      cashierName: currentUser.username,
      branchId: activeBranchId,
      expectedTotal,
      expectedCash,
      expectedPos,
      expectedTransfer,
      expectedMixed,
      totalCounted,
      countedCash,
      countedPos,
      countedTransfer,
      countedMixed,
      variance,
      notes: eodNotes,
    };

    const nextReports = [...eodList, newReport];
    setEodList(nextReports);
    localStorage.setItem("pharmerp_eod_reconciliations", JSON.stringify(nextReports));
    
    playBellSound(); // Alert cashier of submission with printer bell!
    alert(`Shift Reconciliation successful! File ID: ${reportId} logged securely. Till state is reset.`);
    
    // Clear form
    setCountedCash(0);
    setCountedPos(0);
    setCountedTransfer(0);
    setCountedMixed(0);
    setEodNotes("");
  };

  // Filter medicines in stock for selected branch
  const filteredMedicines = useMemo(() => {
    if (!searchQuery) return medicines;
    const s = searchQuery.toLowerCase();
    return medicines.filter(m => 
      m.name.toLowerCase().includes(s) || 
      m.genericName.toLowerCase().includes(s) || 
      m.barcode.includes(s)
    );
  }, [medicines, searchQuery]);

  const selectedCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId);
  }, [customers, selectedCustomerId]);

  // Handle adding medicine to cart
  const addToCart = (med: Medicine) => {
    const stockQty = med.branchStocks[activeBranchId] || 0;
    if (stockQty <= 0) {
      alert(`Warning: '${med.name}' is out of stock in this branch! Add stock first.`);
      return;
    }

    const existingIndex = cart.findIndex(item => item.medicine.id === med.id);
    if (existingIndex > -1) {
      const currentQty = cart[existingIndex].quantity;
      if (currentQty >= stockQty) {
        alert(`Cannot add more. Branch only has ${stockQty} units remaining.`);
        return;
      }
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([...cart, { medicine: med, quantity: 1, discountPercent: 0 }]);
    }
  };

  // Barcode simulation trigger
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput) return;
    const med = medicines.find(m => m.barcode === barcodeInput);
    if (med) {
      addToCart(med);
      setBarcodeInput("");
    } else {
      alert(`No medicine tracked under barcode barcode: ${barcodeInput}`);
    }
  };

  // Remove elements
  const updateCartQty = (id: string, qty: number) => {
    if (qty <= 0) {
      setCart(cart.filter(item => item.medicine.id !== id));
      return;
    }
    const item = cart.find(i => i.medicine.id === id);
    if (!item) return;

    const maxStock = item.medicine.branchStocks[activeBranchId] || 0;
    if (qty > maxStock) {
      alert(`Cannot exceed branch stock level of ${maxStock} units.`);
      return;
    }

    setCart(cart.map(i => i.medicine.id === id ? { ...i, quantity: qty } : i));
  };

  const updateCartDiscount = (id: string, disc: number) => {
    setCart(cart.map(i => i.medicine.id === id ? { ...i, discountPercent: disc } : i));
  };

  // Subtotals
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.medicine.sellingPrice * item.quantity), 0);
  }, [cart]);

  const taxTotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const priceAfterDisc = item.medicine.sellingPrice * item.quantity * (1 - item.discountPercent / 100);
      return sum + (priceAfterDisc * (item.medicine.tax / 100));
    }, 0);
  }, [cart]);

  const total = useMemo(() => {
    const cartTotal = cart.reduce((sum, item) => {
      const priceAfterDisc = item.medicine.sellingPrice * item.quantity * (1 - item.discountPercent / 100);
      const tax = priceAfterDisc * (item.medicine.tax / 100);
      return sum + priceAfterDisc + tax;
    }, 0);
    return Math.max(0, cartTotal - discountAmount);
  }, [cart, discountAmount]);

  // POS Checkout Flow
  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Cart is empty.");
      return;
    }

    // Safety checks against patient allergies recorded in profile
    if (selectedCustomer) {
      const medicalHistory = selectedCustomer.medicalHistory.toLowerCase();
      const allergies = ["sulfa", "aspirin", "nsaid", "penicillin"];
      const matchesAllergy = allergies.filter(a => medicalHistory.includes(a));

      let hasWarning = false;
      cart.forEach(item => {
        const cat = item.medicine.category.toLowerCase();
        const brand = item.medicine.brand.toLowerCase();
        const gen = item.medicine.genericName.toLowerCase();

        if (medicalHistory.includes("sulfa") && (gen.includes("sulfa") || brand.includes("bactrim"))) {
          hasWarning = true;
        }
        if (medicalHistory.includes("aspirin") && (gen.includes("aspirin") || gen.includes("ibuprofen"))) {
          hasWarning = true;
        }
      });

      if (hasWarning) {
        if (!confirm(`⚠️ CO-THERAPY DANGER DETECTED: This customer (${selectedCustomer.name}) profile flags clinical sensitivities or drug allergies linked with medications in the current cart. Do you still wish to bypass and dispense?`)) {
          return;
        }
      }
    }

    // Check customer credit limits if mixed/POS is on credit
    if (selectedCustomer && paymentMethod === "Mixed" && splitPaymentParts.bank > selectedCustomer.creditLimit) {
      alert(`Dispense Blocked: Proposed credit allocation exceeds customer available credit limit.`);
      return;
    }

    const saleItems: SaleItem[] = cart.map(item => ({
      medicineId: item.medicine.id,
      medicineName: item.medicine.name,
      quantity: item.quantity,
      price: item.medicine.sellingPrice,
      tax: item.medicine.tax,
      batchNumber: item.medicine.batchNumber,
    }));

    const nextInvoiceNo = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newSale: Sale = {
      id: `s_tr_${Math.floor(Math.random() * 100000)}`,
      invoiceNumber: nextInvoiceNo,
      date: new Date().toISOString(),
      branchId: activeBranchId,
      customerName: selectedCustomer ? selectedCustomer.name : "Walk-in Customer",
      items: saleItems,
      subtotal,
      taxTotal,
      discount: discountAmount,
      total,
      paymentMethod,
      cashierName: currentUser.username, // Saved from active logged-in worker session
    };

    // Commit state updates
    onAddSale(newSale);
    cart.forEach(item => {
      onUpdateStock(item.medicine.id, item.quantity, "out");
    });

    // Award loyalty points
    if (selectedCustomer) {
      selectedCustomer.loyaltyPoints += Math.floor(total * 0.01);
    }

    setLastCompletedSale(newSale);
    setCart([]);
    setDiscountAmount(0);
    setThermalReceiptOpen(true);
    playBellSound(); // Ring chime bell upon complete sale and receipt rendering
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Sub-Tab Bar for Cashier Mode */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ShoppingCart className="text-emerald-500" size={20} />
            POS Terminal Register
          </h2>
          <p className="text-xs text-slate-500 font-sans">
            Branch: <span className="font-extrabold text-[#4f46e5]">{activeBranchId}</span> | Cashier Session: <span className="font-bold text-slate-700">{currentUser.username} ({currentUser.role})</span>
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveSubTab("checkout")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "checkout"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-950"
            }`}
          >
            <CreditCard size={13} />
            Checkout Desk
          </button>
          <button
            onClick={() => setActiveSubTab("history")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "history"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-950"
            }`}
          >
            <Clock size={13} />
            My Dashboard & Logs
          </button>
          <button
            onClick={() => setActiveSubTab("eod")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "eod"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-950"
            }`}
          >
            <ShieldCheck size={13} className="text-emerald-600" />
            End of Day Check-Out
          </button>
        </div>
      </div>

      {activeSubTab === "checkout" ? (
        <div id="pos-root" className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-12rem)]">
          
          {/* LEFT: Medicine Catalog & Touch Select (8 Columns) */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col space-y-4">
        
        {/* Rapid Search Header & Barcode Simulator */}
        <div className="bg-slate-900/40 p-4 rounded-2xl border border-white/5 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Search drugs by name, formulation generic, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-sans"
            />
          </div>

          <form onSubmit={handleBarcodeSubmit} className="flex gap-2 w-full md:w-auto shrink-0">
            <div className="relative flex-1">
              <Barcode className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input 
                type="text"
                placeholder="Simulate Laser Barcode..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="w-full md:w-44 pl-9 pr-3 py-2 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-sans font-mono"
              />
            </div>
            <button type="submit" className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs px-3 rounded-lg border border-emerald-500/20 font-mono transition-all">
              Scan
            </button>
          </form>
        </div>

        {/* Dynamic Grid Layout for quick selection */}
        <div className="flex-1 bg-slate-900/20 rounded-2xl border border-white/5 p-4 max-h-[500px] overflow-y-auto overflow-x-hidden">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredMedicines.map(med => {
              const branchStock = med.branchStocks[activeBranchId] || 0;
              const isLow = branchStock <= med.reorderLevel;

              return (
                <button
                  key={med.id}
                  onClick={() => addToCart(med)}
                  className={`relative flex flex-col justify-between p-3 rounded-xl border transition-all text-left group ${
                    branchStock > 0 
                      ? "bg-slate-900/40 border-white/5 hover:border-emerald-500/40 hover:bg-slate-900/60" 
                      : "bg-slate-950/80 border-slate-900 cursor-not-allowed opacity-50"
                  }`}
                  disabled={branchStock <= 0}
                >
                  <div className="space-y-1">
                    <div className="flex justify-between items-start gap-1">
                      <span className="text-[10px] text-emerald-400 font-semibold px-1 rounded bg-emerald-500/10 tracking-wider">
                        {med.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {med.strength}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-100 group-hover:text-emerald-300 transition-colors line-clamp-1">
                      {med.name}
                    </h4>
                    <p className="text-[9px] text-slate-400 italic font-mono truncate">
                      {med.genericName}
                    </p>
                  </div>

                  <div className="mt-4 pt-2 border-t border-white/5 flex items-end justify-between">
                    <div>
                      <span className="text-[9px] text-slate-400 block font-sans">Retail Price</span>
                      <span className="text-xs font-bold text-white font-mono">₦{med.sellingPrice.toLocaleString()}</span>
                    </div>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                      branchStock === 0 
                        ? "bg-red-500/10 text-red-400" 
                        : isLow 
                        ? "bg-yellow-500/10 text-yellow-400" 
                        : "bg-teal-500/10 text-teal-300"
                    }`}>
                      {branchStock === 0 ? "Out" : `${branchStock} Pcs`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT: Transaction Cart, POS Drawer & Receipt (4 Columns) */}
      <div className="lg:col-span-5 xl:col-span-4 bg-slate-900/40 p-4 rounded-3xl border border-white/5 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center">
              <ShoppingCart size={16} className="text-emerald-400 mr-2" /> Current Order Drawer
            </h3>
            <span className="text-xs bg-slate-950/60 text-slate-400 py-1 px-2.5 rounded-lg border border-slate-800">
              Items: {cart.length}
            </span>
          </div>

          {/* Customer Selection Linkup */}
          <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 space-y-2">
            <label className="text-[10px] text-slate-400 font-mono block">Assign Customer Profile for Loyalty & Allergy Matrix</label>
            <div className="flex gap-2">
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="flex-1 bg-slate-950/80 border border-slate-800 text-slate-200 text-xs py-1.5 px-2.5 rounded-lg focus:outline-none focus:border-emerald-500"
              >
                <option value="">Walk-In Guest (No History)</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                ))}
              </select>
            </div>
            {selectedCustomer && (
              <div className="bg-emerald-500/5 p-2 rounded border border-emerald-500/10 text-[9px] text-slate-300 space-y-1">
                <div className="flex justify-between font-mono">
                  <span>Loyalty Points: <strong className="text-emerald-400">{selectedCustomer.loyaltyPoints}</strong></span>
                  <span>Wallet: <strong className="text-slate-100">₦{selectedCustomer.walletBalance.toLocaleString()}</strong></span>
                </div>
                <p className="text-[8px] text-amber-400 font-mono truncate">
                  ⚠️ Clinical Record Allergy Warning: {selectedCustomer.medicalHistory}
                </p>
              </div>
            )}
          </div>

          {/* Cart Items list */}
          <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
            {cart.map(item => (
              <div key={item.medicine.id} className="bg-slate-950/30 p-2 rounded-xl border border-white/5 text-xs flex justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-200 truncate">{item.medicine.name}</p>
                  <span className="text-[9px] text-slate-400 font-mono">₦{item.medicine.sellingPrice.toLocaleString()} / pcs</span>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateCartQty(item.medicine.id, parseInt(e.target.value) || 0)}
                    className="w-12 bg-slate-950 border border-slate-800 text-slate-200 text-center text-xs py-1 rounded"
                  />
                  <div className="text-right shrink-0 min-w-[50px]">
                    <span className="font-mono text-slate-100 text-xs">₦{(item.medicine.sellingPrice * item.quantity).toLocaleString()}</span>
                  </div>
                  <button 
                    onClick={() => updateCartQty(item.medicine.id, 0)}
                    className="text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            {cart.length === 0 && (
              <div className="text-center py-6 text-slate-400 text-xs">
                Scan drug barcodes or tap direct items to load shopping checkout basket.
              </div>
            )}
          </div>
        </div>

        {/* Totals & Payments Section */}
        <div className="border-t border-slate-800/80 pt-4 mt-4 space-y-3">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400 font-mono">
              <span>Retail Subtotal</span>
              <span className="text-slate-200">₦{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-400 font-mono">
              <span>National Drug Tariffs (Tax)</span>
              <span className="text-slate-200">+ ₦{taxTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400 font-mono">
              <span>Manual Order Discount (₦)</span>
              <input
                type="number"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-20 bg-slate-950/60 border border-slate-800 text-slate-200 text-right text-xs py-0.5 px-1 rounded font-mono"
              />
            </div>
            <div className="flex justify-between text-base font-bold text-white border-t border-slate-800 pt-2 font-mono">
              <span>Invoice Total</span>
              <span className="text-emerald-400">₦{total.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Options */}
          <div className="space-y-2">
            <label className="text-[10px] text-slate-400 font-mono block">Accepting Settlement Class</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(["Cash", "POS", "Bank Transfer", "Mixed"] as Sale["paymentMethod"][]).map(method => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`py-1.5 rounded-lg text-[10px] font-semibold border transition-all ${
                    paymentMethod === method
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/40"
                      : "bg-slate-950/50 text-slate-400 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-sans font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Complete Checkout & Print Dispatch</span>
          </button>
        </div>

      </div>

      {/* MODAL: Thermal Print Slip simulator */}
      {thermalReceiptOpen && lastCompletedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white text-slate-950 p-5 rounded-2xl w-full max-w-sm font-mono text-xs flex flex-col justify-between shadow-2xl relative animate-in fade-in zoom-in duration-200">
            
            <div className="border-b border-dashed border-slate-300 pb-4 text-center">
              <h3 className="text-sm font-bold tracking-tight uppercase">PharmERP Retail Pharmacy</h3>
              <p className="text-[10px] text-slate-500 uppercase">{activeBranchId === "b1" ? "Ikeja Plaza" : activeBranchId === "b2" ? "Wuse II" : "Sabon Gari Hub"}</p>
              <p className="text-[9px] text-slate-500">TEL: +234 801 222 9000</p>
              <p className="text-[9px] text-slate-500">INVOICE: {lastCompletedSale.invoiceNumber}</p>
              <p className="text-[9px] text-slate-500">DATE: {new Date(lastCompletedSale.date).toLocaleString()}</p>
            </div>

            <div className="py-4 space-y-2 border-b border-dashed border-slate-300">
              <div className="flex justify-between font-bold text-[10px] uppercase text-slate-500">
                <span>Description [Qty]</span>
                <span>Total</span>
              </div>
              {lastCompletedSale.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-[11px]">
                  <span>{item.medicineName} [{item.quantity}]</span>
                  <span>₦{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="py-4 space-y-1.5 border-b border-dashed border-slate-300">
              <div className="flex justify-between text-[10px]">
                <span>Retail Subtotal</span>
                <span>₦{lastCompletedSale.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span>Taxes & Duties</span>
                <span>₦{lastCompletedSale.taxTotal.toLocaleString()}</span>
              </div>
              {lastCompletedSale.discount > 0 && (
                <div className="flex justify-between text-[10px] text-emerald-600">
                  <span>Loyalty Discount</span>
                  <span>-₦{lastCompletedSale.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-200">
                <span>GRAND TOTAL</span>
                <span>₦{lastCompletedSale.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-600 pt-1">
                <span>Payment Route</span>
                <span className="uppercase">{lastCompletedSale.paymentMethod}</span>
              </div>
            </div>

            <div className="pt-4 text-center space-y-2">
              <p className="text-[9px] text-slate-500">Thank you for choosing PharmERP. Keep drugs refrigerated where specified.</p>
              
              {/* Receipt sharing / routing simulator */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] text-slate-700">
                <button onClick={() => { playBellSound(); alert("Thermal print dispatch sent successfully via Bluetooth thermal printer."); }} className="flex flex-col items-center p-1.5 bg-slate-100 hover:bg-slate-200 rounded text-[9px] tracking-tight">
                  <Printer size={12} className="mb-1" />
                  Print ESC
                </button>
                <button onClick={() => { alert("Invoice PDF successfully generated, archived to cloud tenancy."); }} className="flex flex-col items-center p-1.5 bg-slate-100 hover:bg-slate-200 rounded text-[9px] tracking-tight">
                  <FileText size={12} className="mb-1" />
                  Save PDF
                </button>
                <button onClick={() => { alert(`WhatsApp receipt formulated and queued for ${lastCompletedSale.customerName}.`); }} className="flex flex-col items-center p-1.5 bg-slate-100 hover:bg-slate-200 rounded text-[9px] tracking-tight">
                  <MessageSquare size={12} className="mb-1" />
                  WhatsApp
                </button>
              </div>

              <button 
                onClick={() => setThermalReceiptOpen(false)}
                className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white font-bold py-1.5 rounded-lg text-[10px] transition-colors"
              >
                Close Register Entry
              </button>
            </div>

          </div>
        </div>
      )}
      </div>

      ) : activeSubTab === "history" ? (
        <div className="space-y-6">
          {/* Active Store Inventory KPIs */}
          <div className="bg-slate-950 p-4 border border-indigo-500/10 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-slate-300 flex items-center gap-2 font-mono uppercase tracking-wider">
              <Package size={14} className="text-indigo-400" />
              Active Branch Catalog & Product KPIs ({activeBranchId.toUpperCase()})
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {/* Total Medicine */}
              <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5 space-y-1">
                <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-medium">Total Medicine</span>
                <span className="text-lg font-mono font-bold text-slate-200 block">{medicines.length}</span>
                <span className="text-[8px] text-indigo-400 font-mono">Catalog Items</span>
              </div>

              {/* Total Category */}
              <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5 space-y-1">
                <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-medium">Total Category</span>
                <span className="text-lg font-mono font-bold text-slate-200 block">
                  {new Set(medicines.map(m => m.category)).size}
                </span>
                <span className="text-[8px] text-emerald-400 font-mono">Drug Classes</span>
              </div>

              {/* Total Types */}
              <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5 space-y-1 font-mono">
                <span className="text-[9px] text-slate-405 uppercase tracking-wider block font-medium font-sans">Total Types</span>
                <span className="text-lg font-bold text-slate-200 block">
                  {new Set(medicines.map(m => m.type)).size}
                </span>
                <span className="text-[8px] text-pink-400 font-sans">Formulations</span>
              </div>

              {/* Expired Medicine */}
              <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5 space-y-1">
                <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-medium">Expired Drugs</span>
                <span className={`text-lg font-mono font-bold block ${
                  medicines.filter(m => m.expiryDate < new Date().toISOString().split("T")[0]).length > 0 ? "text-amber-400" : "text-slate-300"
                }`}>
                  {medicines.filter(m => m.expiryDate < new Date().toISOString().split("T")[0]).length}
                </span>
                <span className="text-[8px] text-amber-500 font-mono">Requires Disposal</span>
              </div>

              {/* Out of Stock */}
              <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5 space-y-1">
                <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-medium">Out of Stock</span>
                <span className={`text-lg font-mono font-bold block ${
                  medicines.filter(m => (m.branchStocks[activeBranchId] || 0) === 0).length > 0 ? "text-red-400 font-extrabold" : "text-slate-300"
                }`}>
                  {medicines.filter(m => (m.branchStocks[activeBranchId] || 0) === 0).length}
                </span>
                <span className="text-[8px] text-red-500 font-mono">Critical Refills</span>
              </div>

              {/* Low Stock */}
              <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5 space-y-1">
                <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-medium">Low Stock</span>
                <span className={`text-lg font-mono font-bold block ${
                  medicines.filter(m => {
                    const st = m.branchStocks[activeBranchId] || 0;
                    return st > 0 && st <= m.reorderLevel;
                  }).length > 0 ? "text-yellow-400 font-extrabold" : "text-slate-300"
                }`}>
                  {medicines.filter(m => {
                    const st = m.branchStocks[activeBranchId] || 0;
                    return st > 0 && st <= m.reorderLevel;
                  }).length}
                </span>
                <span className="text-[8px] text-yellow-400 font-mono">Below Reorder</span>
              </div>
            </div>
          </div>

          {/* Shift & Sales Overview stats row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-white/5 p-5 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ACTIVE SHIFT USER</span>
                <span className="text-sm font-extrabold text-white font-sans block">{currentUser.username}</span>
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/15 uppercase">ONLINE SHIFT READY</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-center text-emerald-400">
                <ShieldCheck size={20} />
              </div>
            </div>

            <div className="bg-slate-900 border border-white/5 p-5 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">YOUR SALES SUM</span>
                <span className="text-lg font-mono font-black text-rose-400 block">
                  ₦{sales.filter(s => s.cashierName === currentUser.username).reduce((a, b) => a + b.total, 0).toLocaleString()}
                </span>
                <span className="text-[9px] text-slate-400 font-sans">Gross receipt revenue generated</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-center text-indigo-400">
                <TrendingUp size={20} />
              </div>
            </div>

            <div className="bg-slate-900 border border-white/5 p-5 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TRANSACTION VOLUME</span>
                <span className="text-lg font-mono font-black text-emerald-400 block">
                  {sales.filter(s => s.cashierName === currentUser.username).length} Orders
                </span>
                <span className="text-[9px] text-slate-400 font-sans">Dispatched from active register</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-center text-pink-500">
                <ShoppingCart size={20} />
              </div>
            </div>

            <div className="bg-slate-900 border border-white/5 p-5 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ACTIVE TERMINAL BRANCH</span>
                <span className="text-sm font-extrabold text-[#2dd4bf] font-sans block">
                  {activeBranchId === "b1" ? "Ikeja Plaza Plaza" : activeBranchId === "b2" ? "Wuse II Mall" : activeBranchId === "b3" ? "Sabon Gari Hub" : "Central Support"}
                </span>
                <span className="text-[9px] text-slate-400 font-mono">CODE: {activeBranchId.toUpperCase()}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-center text-teal-500">
                <Clock size={20} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Col: Your Shift Session Logs */}
            <div className="lg:col-span-1 bg-slate-900/60 p-5 rounded-2xl border border-white/5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Clock size={16} className="text-emerald-400" />
                  Your Clock In-Out Register
                </h3>
                <span className="text-[9px] bg-[#115e59]/20 text-[#2dd4bf] px-2 py-0.5 rounded font-bold uppercase border border-[#115e59]/30">Audited Shifts</span>
              </div>

              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {(() => {
                  try {
                    const shifts = JSON.parse(localStorage.getItem("pharmerp_shift_logs") || "[]")
                      .filter((s: any) => s.username === currentUser.username)
                      .reverse();
                    if (shifts.length === 0) {
                      return <p className="text-xs text-slate-400 py-3 text-center">No clock-in shift activities registered.</p>;
                    }
                    return shifts.map((s: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-950/40 rounded-xl border border-white/5 text-xs space-y-1.5 shadow-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-300">Shift #{s.id.split("_")[1]?.substring(0, 5) || idx}</span>
                          <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            s.timeOut === null ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" : "bg-slate-850 text-slate-400 border border-slate-800"
                          }`}>
                            {s.timeOut === null ? "Ongoing / Active" : "Logged Out / Signed Off"}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-mono">
                          <div>
                            <span className="text-slate-500 block uppercase font-sans text-[8px]">In (Sign On)</span>
                            <span>{new Date(s.timeIn).toLocaleTimeString()} ({new Date(s.timeIn).toLocaleDateString()})</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block uppercase font-sans text-[8px]">Out (Sign Off)</span>
                            <span>{s.timeOut ? new Date(s.timeOut).toLocaleTimeString() : "Ongoing"}</span>
                          </div>
                        </div>
                        <p className="text-[9px] text-[#2dd4bf] font-semibold bg-[#115e59]/10 p-1 rounded-md text-center border border-[#115e59]/20">
                          📍 {s.branchName} Gateway
                        </p>
                      </div>
                    ));
                  } catch {
                    return <p className="text-xs text-slate-400 py-3 text-center">Shift registry offline.</p>;
                  }
                })()}
              </div>
            </div>

            {/* Right Col: Transaction History for This Cashier (2 Columns Width) */}
            <div className="lg:col-span-2 bg-slate-900/60 p-5 rounded-2xl border border-white/5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <History size={16} className="text-[#4f46e5]" />
                  Your Sales Dispatch Ledger
                </h3>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase font-mono border border-emerald-500/15">
                  Total Sold: ₦{sales.filter(s => s.cashierName === currentUser.username).reduce((a, b) => a + b.total, 0).toLocaleString()}
                </span>
              </div>

              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-slate-950/40 border-b border-white/5 text-slate-400 uppercase text-[9px] tracking-wider">
                      <th className="py-2.5 px-3 font-semibold w-10"></th>
                      <th className="py-2.5 px-3 font-semibold">Invoice #</th>
                      <th className="py-2.5 px-3 font-semibold">Medicines</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Qty</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Unit Price</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Discount</th>
                      <th className="py-2.5 px-3 font-semibold">Payment</th>
                      <th className="py-2.5 px-3 font-semibold">Cashier</th>
                      <th className="py-2.5 px-3 font-semibold">Date & Time</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.filter(s => s.cashierName === currentUser.username).map((s: Sale, index: number) => {
                      const isExpanded = !!expandedInvoices[s.id || s.invoiceNumber];
                      const totalQty = s.items.reduce((sum, i) => sum + i.quantity, 0);
                      return (
                        <React.Fragment key={s.id || index}>
                          <tr 
                            onClick={() => setExpandedInvoices(prev => ({ ...prev, [s.id || s.invoiceNumber]: !isExpanded }))}
                            className="border-b border-white/5 hover:bg-slate-950/20 transition-colors cursor-pointer"
                          >
                            <td className="py-2.5 px-3 text-slate-400">
                              {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-emerald-400 font-mono">{s.invoiceNumber}</td>
                            <td className="py-2.5 px-3">
                              <div className="space-y-0.5">
                                {s.items.map((item, i) => (
                                  <p key={i} className="text-slate-300 text-[11px] truncate max-w-[200px]">
                                    {item.medicineName}
                                  </p>
                                ))}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono text-slate-200 font-bold">{totalQty}</td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-200 text-[11px]">
                              {s.items.length > 0 ? `₦${s.items[0].price.toLocaleString()}` : "-"}
                              {s.items.length > 1 && <span className="text-slate-500 text-[9px] block">+ more</span>}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-rose-400 text-[11px]">
                              {s.discount > 0 ? `-₦${s.discount.toLocaleString()}` : "-"}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold ${
                                s.paymentMethod === "Cash" ? "bg-emerald-500/10 text-emerald-400" :
                                s.paymentMethod === "POS" ? "bg-blue-500/10 text-blue-400" :
                                s.paymentMethod === "Bank Transfer" ? "bg-amber-500/10 text-amber-400" :
                                "bg-purple-500/10 text-purple-400"
                              }`}>
                                {s.paymentMethod}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-300 text-[11px]">{s.cashierName}</td>
                            <td className="py-2.5 px-3 text-slate-400 font-mono text-[10px]">
                              {new Date(s.date).toLocaleDateString()}<br/>
                              <span className="text-slate-500">{new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400 text-sm">₦{s.total.toLocaleString()}</td>
                          </tr>
                          {isExpanded && (
                            <tr className="bg-slate-950/65">
                              <td colSpan={10} className="py-4 px-5 border-b border-white/5">
                                <div className="space-y-3 text-xs max-w-3xl">
                                  <div className="flex items-center justify-between text-[10px] uppercase font-extrabold text-emerald-400 font-mono border-b border-white/5 pb-2">
                                    <span>📋 Invoice: {s.invoiceNumber} | Full Medicine Breakdown</span>
                                    <span className="text-slate-400">Qty x Unit Price = Subtotal</span>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {s.items.map((item, idy) => (
                                      <div key={idy} className="flex justify-between items-center bg-slate-900/40 p-3 rounded-lg border border-white/5">
                                        <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400 font-bold text-[10px]">
                                            {item.medicineName.substring(0, 2).toUpperCase()}
                                          </div>
                                          <div>
                                            <p className="font-semibold text-slate-200 text-[11px]">{item.medicineName}</p>
                                            <p className="text-[9px] text-slate-500">Batch: {item.batchNumber || "UNSPECIFIED"}</p>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <p className="font-mono text-slate-100 text-[11px]">
                                            {item.quantity} units x ₦{item.price.toLocaleString()}
                                          </p>
                                          <p className="font-bold text-emerald-400 text-[12px]">= ₦{(item.quantity * item.price).toLocaleString()}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="border-t border-dashed border-white/5 pt-3 grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-[10px] text-slate-400">
                                    <div className="space-y-1">
                                      <p>Subtotal: <strong className="text-slate-200">₦{s.subtotal.toLocaleString()}</strong></p>
                                      <p>Discount: <strong className="text-rose-400 font-bold">-₦{s.discount.toLocaleString()}</strong></p>
                                      <p>Tax: <strong className="text-slate-200">₦{s.taxTotal.toLocaleString()}</strong></p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-xs border-t border-white/5 pt-1">
                                        Nett Paid: <strong className="text-emerald-400 text-xs">₦{s.total.toLocaleString()}</strong>
                                      </p>
                                    </div>
                                    <div className="space-y-1">
                                      <p>👤 Cashier: <strong className="text-slate-200">{s.cashierName}</strong></p>
                                      <p>💳 Payment: <strong className="text-emerald-400">{s.paymentMethod}</strong></p>
                                    </div>
                                    <div className="space-y-1">
                                      <p>📅 Date: <strong className="text-slate-200">{new Date(s.date).toLocaleString()}</strong></p>
                                      <p>📍 Branch: <strong className="text-slate-200 uppercase">{s.branchId === "b1" ? "Ikeja Plaza" : s.branchId === "b2" ? "Wuse II Mall" : "Sabon Gari Hub"}</strong></p>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                    {sales.filter(s => s.cashierName === currentUser.username).length === 0 && (
                      <tr>
                        <td colSpan={10} className="py-8 text-center text-slate-400">
                          Empty ledger state. You haven't processed any sales coordinates during this work cycle yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* EOD Dashboard Header */}
          <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl space-y-2">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="text-emerald-400" size={18} />
              End of Day Register Reconciliation
            </h3>
            <p className="text-xs text-slate-400">
              Cashiers are requested to perform physical cash counts, collect all POS terminal merchant sheets, and tally bank transfer notifications before locking their terminal drawer for shift audit submission.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* FILE NEW EOD RECONCILIATION */}
            <div className="lg:col-span-7 bg-slate-900/60 p-6 rounded-2xl border border-white/5 space-y-6">
              <div className="border-b border-white/5 pb-3">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-widest block font-mono">Shift Reconciliation Form</span>
                <span className="text-[10px] text-slate-400 font-sans">Compare system expectations with cold physical cash/slip inventory</span>
              </div>

              {/* Expectations Breakdown */}
              <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 font-mono">
                  <TrendingUp size={12} className="text-emerald-400" />
                  Today's Expected Till Balances (From System Logs)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1 text-xs">
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-white/5 font-mono">
                    <span className="text-[9px] text-slate-400 block font-sans">Expected Cash</span>
                    <strong className="text-slate-100">₦{expectedCash.toLocaleString()}</strong>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-white/5 font-mono">
                    <span className="text-[9px] text-slate-400 block font-sans">Expected POS</span>
                    <strong className="text-slate-100">₦{expectedPos.toLocaleString()}</strong>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-white/5 font-mono">
                    <span className="text-[9px] text-slate-400 block font-sans">Expected Transfer</span>
                    <strong className="text-slate-100">₦{expectedTransfer.toLocaleString()}</strong>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-white/5 font-mono">
                    <span className="text-[9px] text-slate-400 block font-sans">Expected Mixed</span>
                    <strong className="text-slate-100">₦{expectedMixed.toLocaleString()}</strong>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs text-slate-300 font-mono">
                  <span>Cumulative Expected Revenue Sum:</span>
                  <strong className="text-emerald-400 text-sm">₦{expectedTotal.toLocaleString()}</strong>
                </div>
              </div>

              {/* Flow inputs */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 font-mono">
                  <Package size={12} className="text-amber-500" />
                  Counted Assets (Physical Cash, Card Receipts State)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-405 font-mono block">Counted Cash Till (₦)</label>
                    <input
                      type="number"
                      value={countedCash || ""}
                      placeholder="0"
                      onChange={(e) => setCountedCash(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg py-2 px-3 text-xs font-mono font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-405 font-mono block">Counted POS Receipts Total (₦)</label>
                    <input
                      type="number"
                      value={countedPos || ""}
                      placeholder="0"
                      onChange={(e) => setCountedPos(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg py-2 px-3 text-xs font-mono font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-405 font-mono block">Counted Bank Transfer Receipts (₦)</label>
                    <input
                      type="number"
                      value={countedTransfer || ""}
                      placeholder="0"
                      onChange={(e) => setCountedTransfer(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg py-2 px-3 text-xs font-mono font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-405 font-mono block">Counted Mixed/Credit (₦)</label>
                    <input
                      type="number"
                      value={countedMixed || ""}
                      placeholder="0"
                      onChange={(e) => setCountedMixed(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg py-2 px-3 text-xs font-mono font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-405 font-mono block">Reconciliation Notes & Discrepancy Action-Plan</label>
                  <textarea
                    rows={2}
                    value={eodNotes}
                    onChange={(e) => setEodNotes(e.target.value)}
                    placeholder="Enter variance explanations (e.g., short change, bad notes, unresolved transfers)..."
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Variance Metrics */}
                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-mono text-slate-200">
                    <span>Total Cashier Counted Balance:</span>
                    <strong>₦{totalCounted.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs font-mono border-t border-slate-800/80 pt-1.5">
                    <span>Variance (Counted vs Expected):</span>
                    <strong className={`text-xs ${variance === 0 ? "text-emerald-400" : variance > 0 ? "text-blue-400" : "text-amber-400"}`}>
                      {variance === 0 ? "Balanced (₦0)" : variance > 0 ? `Surplus (+₦${variance.toLocaleString()})` : `Shortage (-₦${Math.abs(variance).toLocaleString()})`}
                    </strong>
                  </div>
                </div>

                <button
                  onClick={handleEodSubmit}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <ShieldCheck size={16} />
                  Submit Shift EOD & Lock Register
                </button>
              </div>
            </div>

            {/* HISTORICAL EOD FILES AND LOGS */}
            <div className="lg:col-span-5 bg-slate-900/60 p-6 rounded-2xl border border-white/5 space-y-4">
              <div className="border-b border-white/5 pb-3 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-widest block font-mono">EOD Reports Audit Trail</span>
                  <span className="text-[10px] text-slate-400 font-sans">Shift audit reports history record</span>
                </div>
                <span className="bg-indigo-500/10 text-indigo-400 py-0.5 px-2 rounded-full font-mono text-[9px] border border-indigo-500/20">Audit Trail</span>
              </div>

              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {eodList.filter((e: any) => e.cashierName === currentUser.username).length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs text-slate-400">
                    No historic EOD reconciliations registered for this cashier.
                  </div>
                ) : (
                  eodList.filter((e: any) => e.cashierName === currentUser.username).map((e: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <strong className="text-slate-300 font-mono text-[10px]">Report #{e.id.split("_")[2] || idx}</strong>
                        <span className={`text-[8px] font-bold uppercase py-0.5 px-1.5 rounded ${
                          e.variance === 0 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : e.variance > 0 ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                        }`}>
                          {e.variance === 0 ? "Balanced" : e.variance > 0 ? "Surplus" : "Shortage / Deficit"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-slate-400 border-t border-b border-slate-800/80 py-1.5 font-bold">
                        <div>Expected: <span className="text-slate-200 font-normal">₦ {e.expectedTotal.toLocaleString()}</span></div>
                        <div>Counted: <span className="text-slate-200 font-normal">₦ {e.totalCounted.toLocaleString()}</span></div>
                        <div>Variance: <span className={`font-mono ${e.variance < 0 ? "text-amber-400" : e.variance > 0 ? "text-blue-400" : "text-emerald-400"}`}>₦ {e.variance.toLocaleString()}</span></div>
                        <div>Branch: <span className="text-[#a5b4fc] text-[9px]">{e.branchId.toUpperCase()}</span></div>
                      </div>

                      {e.notes && (
                        <p className="text-[9px] text-slate-404 bg-slate-900 p-1.5 rounded text-left italic">
                          " {e.notes} "
                        </p>
                      )}

                      <div className="text-[8px] text-slate-500 text-right">
                        Submitted: {new Date(e.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
