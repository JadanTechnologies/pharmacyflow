import React, { useMemo } from "react";
import { 
  Bell, AlertTriangle, Send, Mail, MessageSquare, 
  MessageCircle, Smartphone, Info, DollarSign, X
} from "lucide-react";
import { Medicine, Supplier, Sale } from "../types";

interface NotificationCenterProps {
  medicines: Medicine[];
  suppliers: Supplier[];
  sales: Sale[];
  activeBranchId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ 
  medicines, suppliers, sales, activeBranchId, isOpen, onClose 
}: NotificationCenterProps) {
  
  // Aggregate notifications
  const alerts = useMemo(() => {
    const list: { id: string; type: "expiry" | "low_stock" | "payment"; title: string; description: string; meta: any }[] = [];
    const today = new Date("2026-06-11");

    // 1. Expiry alerts
    medicines.forEach(m => {
      const exp = new Date(m.expiryDate);
      if (exp < today) {
        list.push({
          id: `alert_exp_expired_${m.id}`,
          type: "expiry",
          title: `Expired Lot Danger: [${m.name}]`,
          description: `Batch ${m.batchNumber} has expired on ${m.expiryDate}! Retract from clinical dispensary immediately.`,
          meta: { medId: m.id, recipient: "Pharmacist", action: "Retract and return" }
        });
      } else {
        const diffDays = (exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays <= 45) {
          list.push({
            id: `alert_exp_soon_${m.id}`,
            type: "expiry",
            title: `Imminent Expiry: [${m.name}]`,
            description: `Batch ${m.batchNumber} expires in ${Math.ceil(diffDays)} days (${m.expiryDate}). Execute FEFO dispatch.`,
            meta: { medId: m.id, recipient: "Dispenser", action: "FEFO priority release" }
          });
        }
      }
    });

    // 2. Low stocks
    medicines.forEach(m => {
      const activeStock = m.branchStocks[activeBranchId] || 0;
      if (activeStock <= m.reorderLevel) {
        list.push({
          id: `alert_stock_low_${m.id}`,
          type: "low_stock",
          title: `Low Retail Stock: [${m.name}]`,
          description: `Branch stock level is ${activeStock} units. Reorder limit is ${m.reorderLevel}. Request central transfer order.`,
          meta: { medId: m.id, recipient: "Supplier", action: "Reorder alert trigger" }
        });
      }
    });

    // 3. Outstanding Supplier balances
    suppliers.forEach(sup => {
      if (sup.balance > 0) {
        list.push({
          id: `alert_pay_due_${sup.id}`,
          type: "payment",
          title: `Supplier Settlement Due: [${sup.name}]`,
          description: `Outstanding credit balance NGN ₦${sup.balance.toLocaleString()} is near invoice terms clearance.`,
          meta: { supId: sup.id, recipient: "Accountant", action: "Disburse transfer payment" }
        });
      }
    });

    return list;
  }, [medicines, suppliers, activeBranchId]);

  const handleSendNotification = (alertItem: any, channel: "Email" | "SMS" | "WhatsApp") => {
    alert(`[Dispatch Server Trigger] ${channel} notification sent to associated team of PharmERP regarding "${alertItem.title}".`);
  };

  if (!isOpen) return null;

  return (
    <div id="notification-tray-backdrop" className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-slate-950/95 border-l border-white/5 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
      
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg">
            <Bell size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">System Signal Alerts</h3>
            <span className="text-[10px] text-slate-400 font-mono">Pending action signals: {alerts.length}</span>
          </div>
        </div>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
          <X size={18} />
        </button>
      </div>

      {/* Alerts Body Scroll container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {alerts.map(a => (
          <div key={a.id} className="bg-slate-900/60 p-3 rounded-2xl border border-white/5 space-y-2 text-xs">
            <div className="flex justify-between items-start">
              <span className={`text-[8px] font-mono leading-none tracking-wider uppercase px-1.5 py-0.5 rounded font-bold ${
                a.type === "expiry" ? "bg-red-500/10 text-red-400" : a.type === "low_stock" ? "bg-yellow-500/10 text-yellow-400" : "bg-blue-500/10 text-blue-400"
              }`}>
                {a.type.replace("_", " ")}
              </span>
              <span className="text-[8px] text-slate-500 font-mono">Urgent</span>
            </div>

            <div className="space-y-1">
              <h4 className="font-semibold text-slate-200">{a.title}</h4>
              <p className="text-[10px] text-slate-400 leading-normal">{a.description}</p>
            </div>

            {/* In-app action buttons */}
            <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between">
              <span className="text-[9px] text-slate-500 font-mono">Send broadcast routing:</span>
              <div className="flex space-x-1">
                <button 
                  onClick={() => handleSendNotification(a, "Email")} 
                  className="p-1 bg-slate-950 text-slate-400 hover:text-white rounded border border-white/5"
                  title="Send Email"
                >
                  <Mail size={10} />
                </button>
                <button 
                  onClick={() => handleSendNotification(a, "SMS")} 
                  className="p-1 bg-slate-950 text-slate-400 hover:text-white rounded border border-white/5"
                  title="Send SMS"
                >
                  <MessageCircle size={10} />
                </button>
                <button 
                  onClick={() => handleSendNotification(a, "WhatsApp")} 
                  className="p-1 bg-slate-950 text-slate-400 hover:text-white rounded border border-white/5"
                  title="Send WhatsApp Alert"
                >
                  <Smartphone size={10} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {alerts.length === 0 && (
          <div className="text-center py-10 text-slate-500 text-xs font-sans">
            <Info size={24} className="mx-auto text-slate-600 mb-2" />
            No pending security, valuation, or expiry warnings detected globally.
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/5 bg-slate-900/40 text-[10px] text-slate-500">
        Clinical systems monitoring and state audits happen continuously across remote locations.
      </div>

    </div>
  );
}
