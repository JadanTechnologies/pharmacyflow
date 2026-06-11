import React, { useState, useMemo, useEffect } from "react";
import { 
  TrendingUp, ShoppingCart, Users, AlertTriangle, Building, 
  Layers, Package, Calendar, DollarSign, ShieldAlert, FileText,
  Download, Printer, UserCheck, Key, ToggleLeft, ToggleRight, 
  Trash2, Play, Search, Eye, Filter, RefreshCw, Star, ArrowUpRight, ArrowDownRight,
  QrCode, Copy, Check, Send, Smartphone, MessageSquare, Settings
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";
import { Medicine, Sale, Branch, FinancialRecord, Staff, ERPUser, ActivityLog, SecurityRole, RolePermission, BusinessSettings, Customer } from "../types";

interface ReportingCenterProps {
  medicines: Medicine[];
  sales: Sale[];
  branches: Branch[];
  finances: FinancialRecord[];
  staff: Staff[];
  users: ERPUser[];
  customers: Customer[];
  onAddUser: (username: string, passwordHash: string, role: ERPUser["role"], branchId: string) => void;
  onToggleUserStatus: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  onEditUserPassword: (userId: string, newPass: string) => void;
  currentUser: ERPUser;
  onSwitchUser: (user: ERPUser) => void;
  activityLogs: ActivityLog[];
  onAddActivityLog: (actionType: ActivityLog["actionType"], description: string) => void;
  onClearLogs: () => void;
  
  roles: SecurityRole[];
  onUpdateRoles: (roles: SecurityRole[]) => void;
  businessSettings: BusinessSettings;
  onUpdateBusinessSettings: (settings: BusinessSettings) => void;
}

export default function ReportingCenterView({
  medicines,
  sales,
  branches,
  finances,
  staff,
  users,
  customers,
  onAddUser,
  onToggleUserStatus,
  onDeleteUser,
  onEditUserPassword,
  currentUser,
  onSwitchUser,
  activityLogs,
  onAddActivityLog,
  onClearLogs,
  roles,
  onUpdateRoles,
  businessSettings,
  onUpdateBusinessSettings
}: ReportingCenterProps) {
  // Navigation tabs inside Reporting center
  const [activeTab, setActiveTab] = useState<"reports" | "admin" | "ai_forecast" | "barcode_qr" | "whatsapp" | "logs">("reports");
  const [adminSubTab, setAdminSubTab] = useState<"users" | "roles" | "business" | "saas">("users");

  // REPORT GENERATOR STATES
  const [reportType, setReportType] = useState<"sales" | "inventory" | "finance" | "staff">("sales");
  const [filterBranchId, setFilterBranchId] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("2026-06-01");
  const [dateTo, setDateTo] = useState<string>("2026-06-15");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // ADVANCED SUB-REPORTS & DETAILED FILTERS
  const [subReportProfile, setSubReportProfile] = useState<string>("transaction-details");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCashier, setFilterCashier] = useState("all");
  const [filterMedicineName, setFilterMedicineName] = useState("all");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState("all");
  const [filterSupplier, setFilterSupplier] = useState("all");
  const [filterStore, setFilterStore] = useState("all");
  const [filterMinProfit, setFilterMinProfit] = useState("all");
  const [sortField, setSortField] = useState<string>("sn");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  useEffect(() => {
    if (reportType === "sales") setSubReportProfile("transaction-details");
    else if (reportType === "inventory") setSubReportProfile("valuation");
    else if (reportType === "finance") setSubReportProfile("finance-ledger");
    else if (reportType === "staff") setSubReportProfile("staff-ledger");
    setCurrentPage(1);
  }, [reportType]);

  // USER CREATION STATES
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<ERPUser["role"]>("Pharmacist");
  const [newBranchId, setNewBranchId] = useState("b1");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // PASSWORD RESET TEMP STATES
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState("");

  // ====== ENTERPRISE SYSTEMS EXTRA STATES ======
  // A. Role & RBAC Security matrix states
  const [selectedRoleName, setSelectedRoleName] = useState<string>("Pharmacist");
  const [customRoleName, setCustomRoleName] = useState("");
  const [cloneRoleName, setCloneRoleName] = useState("");
  const [roleSuccessMsg, setRoleSuccessMsg] = useState("");
  const [roleErrorMsg, setRoleErrorMsg] = useState("");

  // B. Business config states
  const [bizName, setBizName] = useState(businessSettings.businessName);
  const [bizLogoText, setBizLogoText] = useState(businessSettings.logoText);
  const [bizAddress, setBizAddress] = useState(businessSettings.address);
  const [bizPhone, setBizPhone] = useState(businessSettings.phone);
  const [bizEmail, setBizEmail] = useState(businessSettings.email);
  const [bizWebsite, setBizWebsite] = useState(businessSettings.website);
  const [bizTaxNumber, setBizTaxNumber] = useState(businessSettings.taxNumber);
  const [bizCurrency, setBizCurrency] = useState(businessSettings.currency);
  const [bizFooter, setBizFooter] = useState(businessSettings.receiptFooter);
  const [bizPrefix, setBizPrefix] = useState(businessSettings.invoicePrefix);

  useEffect(() => {
    setBizName(businessSettings.businessName);
    setBizLogoText(businessSettings.logoText);
    setBizAddress(businessSettings.address);
    setBizPhone(businessSettings.phone);
    setBizEmail(businessSettings.email);
    setBizWebsite(businessSettings.website);
    setBizTaxNumber(businessSettings.taxNumber);
    setBizCurrency(businessSettings.currency);
    setBizFooter(businessSettings.receiptFooter);
    setBizPrefix(businessSettings.invoicePrefix);
  }, [businessSettings]);

  // C. Barcode & QR code states
  const [qrSearchKeyword, setQrSearchKeyword] = useState("");
  const [qrSelectedMedicineId, setQrSelectedMedicineId] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [gBarcode, setGBarcode] = useState("");
  const [scannedMed, setScannedMed] = useState<Medicine | null>(null);
  const [bulkBarcodeCategory, setBulkBarcodeCategory] = useState("all");

  // D. AI Forecast states
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");

  // E. WhatsApp simulator states
  const [waPhone, setWaPhone] = useState("+234 809 314 2410");
  const [waMsg, setWaMsg] = useState("Your prescription details are available: 2x Coartem. Thank you!");
  const [waLogs, setWaLogs] = useState<Array<{ sender: "user" | "system"; text: string; time: string }>>([
    { sender: "system", text: "Welcome to PharmERP WhatsApp Hub. Ready to dispatch receipts.", time: "12:00" }
  ]);

  // F. SaaS multi-tenancy switcher state
  const [currentTenantCompany, setCurrentTenantCompany] = useState<string>("Jadan Express Pharmacy Group Ltd (Lagos Headquarters)");


  // AUDIT LOG FILTER STATES
  const [logSearch, setLogSearch] = useState("");
  const [logActionType, setLogActionType] = useState<string>("all");

  // PRINTING MODAL STATE
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Active categories in medicine db
  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(medicines.map(m => m.category)));
  }, [medicines]);

  // Distinct unique values for advanced filter selects
  const uniqueCashiers = useMemo(() => {
    return Array.from(new Set(sales.map(s => s.cashierName).filter(Boolean)));
  }, [sales]);

  const uniqueMedicines = useMemo(() => {
    return Array.from(new Set(medicines.map(m => m.name)));
  }, [medicines]);

  const uniquePaymentMethods = useMemo(() => {
    return ["Cash", "POS", "Bank Transfer", "Mobile Money", "Mixed"];
  }, []);

  const uniqueSuppliers = useMemo(() => {
    return Array.from(new Set(medicines.map(m => m.manufacturer).filter(Boolean)));
  }, [medicines]);

  const uniqueStores = useMemo(() => {
    return Array.from(new Set(medicines.map(m => m.storeLocation).filter(Boolean)));
  }, [medicines]);

  // ==================== FILTERING LOGIC ====================
  // Helper: check if a date is between From and To
  const isWithinDateRange = (dateStr: string) => {
    const d = dateStr.split("T")[0];
    return d >= dateFrom && d <= dateTo;
  };

  // Core Flattened Medicine Sales Transactions Ledger
  const flattenedSalesTransactions = useMemo(() => {
    let sNo = 1;
    const items: any[] = [];
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const med = medicines.find(m => m.id === item.medicineId) || medicines.find(m => m.name === item.medicineName);
        const category = med ? med.category : "Other";
        const unitCost = med ? med.purchasePrice : 0;
        const totalCost = item.quantity * unitCost;
        const unitSell = item.price;
        const totalSell = item.quantity * unitSell;
        
        // Proportional discount allocation
        const itemProportion = sale.subtotal > 0 ? (totalSell / sale.subtotal) : 0;
        const allocatedDiscount = Math.round(sale.discount * itemProportion);
        const balanceAfterDiscount = totalSell - allocatedDiscount;
        const profit = balanceAfterDiscount - totalCost;
        const supplier = med ? med.manufacturer : "Other Supplier";

        items.push({
          sn: sNo++,
          invoiceNumber: sale.invoiceNumber,
          medicineName: item.medicineName,
          category,
          quantity: item.quantity,
          unitCostPrice: unitCost,
          totalCostPrice: totalCost,
          unitSellingPrice: unitSell,
          totalSellingPrice: totalSell,
          discount: allocatedDiscount,
          balanceAfterDiscount,
          profit,
          paymentMethod: sale.paymentMethod,
          cashierName: sale.cashierName,
          date: sale.date,
          branchId: sale.branchId,
          supplier,
          customerName: sale.customerName || "Walk-In Patient",
          rawSale: sale
        });
      });
    });
    return items;
  }, [sales, medicines]);

  // Filtered flattened sales
  const filteredSalesTransactionsFiltered = useMemo(() => {
    return flattenedSalesTransactions.filter(item => {
      const matchBranch = filterBranchId === "all" || item.branchId === filterBranchId;
      const matchDate = isWithinDateRange(item.date);
      const matchCategory = selectedCategory === "all" || item.category === selectedCategory;

      const matchCashier = filterCashier === "all" || item.cashierName === filterCashier;
      const matchMedicine = filterMedicineName === "all" || item.medicineName === filterMedicineName;
      const matchPayMethod = filterPaymentMethod === "all" || item.paymentMethod === filterPaymentMethod;
      const matchSupplier = filterSupplier === "all" || item.supplier === filterSupplier;
      const matchStore = filterStore === "all" || true;

      const matchSearch = !searchQuery ? true : (
        item.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.medicineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.cashierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchQuery.toLowerCase())
      );

      let matchMinProfit = true;
      if (filterMinProfit !== "all") {
        const threshold = parseFloat(filterMinProfit);
        matchMinProfit = item.profit < threshold;
      }

      return matchBranch && matchDate && matchCategory && matchCashier && matchMedicine && matchPayMethod && matchSupplier && matchStore && matchSearch && matchMinProfit;
    });
  }, [flattenedSalesTransactions, filterBranchId, dateFrom, dateTo, selectedCategory, filterCashier, filterMedicineName, filterPaymentMethod, filterSupplier, filterStore, searchQuery, filterMinProfit]);

  // Filtered Sales Report Data (Original single-order array maintained for backwards compat)
  const filteredSalesData = useMemo(() => {
    return sales.filter(s => {
      const matchBranch = filterBranchId === "all" || s.branchId === filterBranchId;
      const matchDate = isWithinDateRange(s.date);
      return matchBranch && matchDate;
    });
  }, [sales, filterBranchId, dateFrom, dateTo]);

  // 1. Top Selling Medicines Report
  const topSellingReportData = useMemo(() => {
    const map: Record<string, { medicineName: string; category: string; quantity: number; revenue: number; discount: number; profit: number; supplier: string }> = {};
    filteredSalesTransactionsFiltered.forEach(tx => {
      const key = tx.medicineName;
      if (!map[key]) {
        map[key] = {
          medicineName: tx.medicineName,
          category: tx.category,
          quantity: 0,
          revenue: 0,
          discount: 0,
          profit: 0,
          supplier: tx.supplier
        };
      }
      map[key].quantity += tx.quantity;
      map[key].revenue += tx.balanceAfterDiscount;
      map[key].discount += tx.discount;
      map[key].profit += tx.profit;
    });
    return Object.values(map).sort((a, b) => b.quantity - a.quantity);
  }, [filteredSalesTransactionsFiltered]);

  // 2. Slow Moving Medicines Report
  const slowMovingReportData = useMemo(() => {
    return medicines.map(med => {
      const activeStock = filterBranchId === "all" ? med.stock : (med.branchStocks[filterBranchId] || 0);
      const salesTx = flattenedSalesTransactions.filter(tx => 
        (tx.medicineName === med.name) && 
        (filterBranchId === "all" || tx.branchId === filterBranchId) &&
        isWithinDateRange(tx.date)
      );
      const totalSold = salesTx.reduce((sum, tx) => sum + tx.quantity, 0);
      const totalRevenue = salesTx.reduce((sum, tx) => sum + tx.balanceAfterDiscount, 0);
      const denominator = activeStock + totalSold;
      const turnoverRate = denominator > 0 ? (totalSold / denominator) * 100 : 0;
      
      return {
        medicineName: med.name,
        genericName: med.genericName,
        category: med.category,
        stock: activeStock,
        totalSold,
        turnoverRate,
        revenue: totalRevenue,
        supplier: med.manufacturer
      };
    }).sort((a, b) => a.turnoverRate - b.turnoverRate);
  }, [medicines, flattenedSalesTransactions, filterBranchId, dateFrom, dateTo]);

  // 3. Dead Stock Report
  const deadStockReportData = useMemo(() => {
    return medicines.map(med => {
      const activeStock = filterBranchId === "all" ? med.stock : (med.branchStocks[filterBranchId] || 0);
      if (activeStock === 0) return null;

      const soldInPeriod = flattenedSalesTransactions.some(tx => 
        tx.medicineName === med.name && 
        (filterBranchId === "all" || tx.branchId === filterBranchId) &&
        isWithinDateRange(tx.date)
      );

      if (soldInPeriod) return null;

      return {
        medicineName: med.name,
        genericName: med.genericName,
        category: med.category,
        stock: activeStock,
        costValue: activeStock * med.purchasePrice,
        retailValue: activeStock * med.sellingPrice,
        expiryDate: med.expiryDate,
        shelfLocation: med.storeLocation || "Aisle A",
        supplier: med.manufacturer
      };
    }).filter(Boolean) as any[];
  }, [medicines, flattenedSalesTransactions, filterBranchId, dateFrom, dateTo]);

  // 4. Low Stock Report
  const lowStockReportData = useMemo(() => {
    return medicines.map(med => {
      const activeStock = filterBranchId === "all" ? med.stock : (med.branchStocks[filterBranchId] || 0);
      if (activeStock > med.reorderLevel) return null;

      const deficit = med.reorderLevel - activeStock;
      const suggestedCost = deficit * med.purchasePrice;

      return {
        medicineName: med.name,
        category: med.category,
        currentStock: activeStock,
        reorderLevel: med.reorderLevel,
        deficit,
        suggestedCost,
        supplier: med.manufacturer
      };
    }).filter(Boolean) as any[];
  }, [medicines, filterBranchId]);

  // 5. Expiry Report
  const expiryReportData = useMemo(() => {
    const today = new Date("2026-06-11");
    return medicines.map(med => {
      const expiry = new Date(med.expiryDate);
      const isExpired = expiry < today;
      const daysToExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      const activeStock = filterBranchId === "all" ? med.stock : (med.branchStocks[filterBranchId] || 0);
      if (activeStock === 0) return null;

      if (!isExpired && daysToExpiry > 180) return null;

      const wasteValue = activeStock * med.purchasePrice;

      return {
        medicineName: med.name,
        batchNumber: med.batchNumber || "B-" + Math.floor(10000 + Math.random() * 90000),
        category: med.category,
        expiryDate: med.expiryDate,
        stock: activeStock,
        unitCost: med.purchasePrice,
        wasteValue,
        status: isExpired ? "Expired" : `Expiring in ${daysToExpiry} days`,
        daysToExpiry,
        supplier: med.manufacturer
      };
    }).filter(Boolean).sort((a, b) => a.daysToExpiry - b.daysToExpiry) as any[];
  }, [medicines, filterBranchId]);

  // 6. Profit Margin Report
  const profitMarginReportData = useMemo(() => {
    return medicines.map(med => {
      const profitPerUnit = med.sellingPrice - med.purchasePrice;
      const pct = med.sellingPrice > 0 ? (profitPerUnit / med.sellingPrice) * 100 : 0;
      const activeStock = filterBranchId === "all" ? med.stock : (med.branchStocks[filterBranchId] || 0);

      return {
        medicineName: med.name,
        category: med.category,
        costPrice: med.purchasePrice,
        sellingPrice: med.sellingPrice,
        profitPerUnit,
        marginPercent: pct,
        stock: activeStock,
        potentialProfit: activeStock * profitPerUnit,
        supplier: med.manufacturer
      };
    }).sort((a, b) => b.marginPercent - a.marginPercent);
  }, [medicines, filterBranchId]);

  // 7. Cashier Performance Report
  const cashierPerformanceReportData = useMemo(() => {
    const map: Record<string, { cashierName: string; revenue: number; count: number; cashSales: number; cardSales: number; transferSales: number }> = {};
    
    staff.forEach(stf => {
      map[stf.name] = {
        cashierName: stf.name,
        revenue: 0,
        count: 0,
        cashSales: 0,
        cardSales: 0,
        transferSales: 0
      };
    });

    sales.forEach(s => {
      if (!isWithinDateRange(s.date)) return;
      if (filterBranchId !== "all" && s.branchId !== filterBranchId) return;

      const key = s.cashierName;
      if (!map[key]) {
        map[key] = {
          cashierName: key,
          revenue: 0,
          count: 0,
          cashSales: 0,
          cardSales: 0,
          transferSales: 0
        };
      }
      map[key].revenue += s.total;
      map[key].count += 1;
      if (s.paymentMethod === "Cash") map[key].cashSales += s.total;
      else if (s.paymentMethod === "POS") map[key].cardSales += s.total;
      else map[key].transferSales += s.total;
    });

    return Object.values(map)
      .map(entry => {
        const staffRating = staff.find(st => st.name === entry.cashierName)?.performanceScore || 5.0;
        return {
          ...entry,
          avgTicketValue: entry.count > 0 ? entry.revenue / entry.count : 0,
          attendance: staff.find(st => st.name === entry.cashierName)?.attendanceStatus || "Present",
          performanceScore: staffRating
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
  }, [sales, staff, filterBranchId, dateFrom, dateTo]);

  // 8. Branch Performance Report
  const branchPerformanceReportData = useMemo(() => {
    return branches.map(br => {
      const branchSales = sales.filter(s => s.branchId === br.id && isWithinDateRange(s.date));
      const totalRevenue = branchSales.reduce((sum, s) => sum + s.total, 0);
      const totalSalesCount = branchSales.length;

      let totalCost = 0;
      branchSales.forEach(sale => {
        sale.items.forEach(item => {
          const med = medicines.find(m => m.id === item.medicineId) || medicines.find(m => m.name === item.medicineName);
          const cost = med ? med.purchasePrice : 0;
          totalCost += item.quantity * cost;
        });
      });

      const netProfit = totalRevenue - totalCost;
      const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      return {
        branchName: br.name,
        manager: staff.find(s => s.branchId === br.id && s.role === "Branch Manager")?.name || "System Admin",
        totalSalesCount,
        totalRevenue,
        costValue: totalCost,
        netProfit,
        marginPercent: margin
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [branches, sales, medicines, staff, dateFrom, dateTo]);

  // 9. Supplier Purchase Report
  const supplierPurchaseReportData = useMemo(() => {
    const map: Record<string, { supplierName: string; medicinesCount: number; stockCarried: number; costEstimate: number }> = {};
    medicines.forEach(m => {
      const supplier = m.manufacturer || "Other Manufacturer";
      const qty = filterBranchId === "all" ? m.stock : (m.branchStocks[filterBranchId] || 0);
      if (!map[supplier]) {
        map[supplier] = {
          supplierName: supplier,
          medicinesCount: 0,
          stockCarried: 0,
          costEstimate: 0
        };
      }
      map[supplier].medicinesCount += 1;
      map[supplier].stockCarried += qty;
      map[supplier].costEstimate += (qty * m.purchasePrice);
    });
    return Object.values(map)
      .map(entry => ({
        ...entry,
        contactPerson: "Dr. Al-Fayeed " + entry.supplierName.split(" ")[0],
        phone: "+234 803 111 " + Math.floor(1000 + Math.random() * 9000),
        outstandingBalance: Math.round(entry.costEstimate * 0.12)
      }))
      .sort((a, b) => b.costEstimate - a.costEstimate);
  }, [medicines, filterBranchId]);

  // 10. Customer Purchase Report
  const customerPurchaseReportData = useMemo(() => {
    const map: Record<string, { customerName: string; phone: string; email: string; points: number; salesVolume: number; count: number }> = {};
    customers.forEach(cust => {
      map[cust.name] = {
        customerName: cust.name,
        phone: cust.phone,
        email: cust.email,
        points: cust.loyaltyPoints,
        salesVolume: 0,
        count: 0
      };
    });

    sales.forEach(s => {
      if (!isWithinDateRange(s.date)) return;
      if (filterBranchId !== "all" && s.branchId !== filterBranchId) return;

      const key = s.customerName;
      if (!map[key]) {
        map[key] = {
          customerName: key,
          phone: "+234 812 345 " + Math.floor(1000 + Math.random() * 9000),
          email: key.toLowerCase().split(" ")[0] + "@gmail.com",
          points: 10,
          salesVolume: 0,
          count: 0
        };
      }
      map[key].salesVolume += s.total;
      map[key].count += 1;
    });

    return Object.values(map)
      .map(entry => ({
        ...entry,
        walletBalance: Math.round(entry.salesVolume * 0.05),
        creditLimit: 50000
      }))
      .sort((a, b) => b.salesVolume - a.salesVolume);
  }, [sales, customers, filterBranchId, dateFrom, dateTo]);

  // Filtered Inventory Valuation Data
  const filteredInventoryData = useMemo(() => {
    return medicines.filter(m => {
      const matchCategory = selectedCategory === "all" || m.category === selectedCategory;
      return matchCategory;
    });
  }, [medicines, selectedCategory]);

  // Filtered Finances Data
  const filteredFinancesData = useMemo(() => {
    return finances.filter(f => {
      const matchBranch = filterBranchId === "all" || f.branchId === filterBranchId;
      const matchDate = isWithinDateRange(f.date);
      const matchCategory = selectedCategory === "all" || f.category === selectedCategory;
      return matchBranch && matchDate && matchCategory;
    });
  }, [finances, filterBranchId, dateFrom, dateTo, selectedCategory]);

  // Staff Performance Metrics
  const calculatedStaffData = useMemo(() => {
    return staff.map(s => {
      const matchBranch = filterBranchId === "all" || s.branchId === filterBranchId;
      if (!matchBranch) return null;

      // Calculate total cash registered sales for this employees name if they acted as cashier
      const employeeSales = sales.filter(sale => {
        const isCashier = sale.cashierName.toLowerCase() === s.name.toLowerCase() ||
                         (s.role === "Branch Manager" && s.branchId === sale.branchId);
        return isCashier && isWithinDateRange(sale.date);
      });

      const totalSalesValue = employeeSales.reduce((sum, sale) => sum + sale.total, 0);
      const salesCount = employeeSales.length;

      return {
        ...s,
        totalSalesValue,
        salesCount
      };
    }).filter(Boolean) as Array<Staff & { totalSalesValue: number; salesCount: number }>;
  }, [staff, sales, filterBranchId, dateFrom, dateTo]);

  // ==================== RECHARTS TRANSFORMERS ====================
  const salesChartData = useMemo(() => {
    const dates: { [date: string]: number } = {};
    filteredSalesData.forEach(s => {
      const day = s.date.split("T")[0];
      dates[day] = (dates[day] || 0) + s.total;
    });
    return Object.entries(dates)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredSalesData]);

  const topMedicinesChartData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredSalesTransactionsFiltered.forEach(tx => {
      const key = tx.medicineName;
      map[key] = (map[key] || 0) + tx.quantity;
    });
    return Object.entries(map)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 8);
  }, [filteredSalesTransactionsFiltered]);

  const categoryChartData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredSalesTransactionsFiltered.forEach(tx => {
      const key = tx.category;
      map[key] = (map[key] || 0) + tx.balanceAfterDiscount;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredSalesTransactionsFiltered]);

  const branchChartData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredSalesTransactionsFiltered.forEach(tx => {
      const bName = branches.find(b => b.id === tx.branchId)?.name || tx.branchId;
      map[bName] = (map[bName] || 0) + tx.balanceAfterDiscount;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredSalesTransactionsFiltered, branches]);

  const paymentMethodChartData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredSalesTransactionsFiltered.forEach(tx => {
      map[tx.paymentMethod] = (map[tx.paymentMethod] || 0) + tx.balanceAfterDiscount;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredSalesTransactionsFiltered]);

  const inventoryCategoryChartData = useMemo(() => {
    const categoriesSum: { [cat: string]: number } = {};
    filteredInventoryData.forEach(m => {
      // Calculate branch wise stock if active branch filtered
      const qty = filterBranchId === "all" ? m.stock : (m.branchStocks[filterBranchId] || 0);
      const val = m.purchasePrice * qty;
      categoriesSum[m.category] = (categoriesSum[m.category] || 0) + val;
    });
    return Object.entries(categoriesSum).map(([name, value]) => ({ name, value }));
  }, [filteredInventoryData, filterBranchId]);

  const financeSummaryChartData = useMemo(() => {
    const summary = { Income: 0, Expense: 0 };
    filteredFinancesData.forEach(f => {
      if (f.type === "Income") {
        summary.Income += f.amount;
      } else {
        summary.Expense += f.amount;
      }
    });
    return [
      { name: "Income", amount: summary.Income, fill: "#10b981" },
      { name: "Expense", amount: summary.Expense, fill: "#f43f5e" }
    ];
  }, [filteredFinancesData]);

  // ==================== METRIC SUMMARIES ====================
  const salesSummaryKPIs = useMemo(() => {
    const total = filteredSalesData.reduce((sum, s) => sum + s.total, 0);
    const count = filteredSalesData.length;
    const avgOrder = count > 0 ? total / count : 0;
    const cashTotal = filteredSalesData.filter(s => s.paymentMethod === "Cash").reduce((sum, s) => sum + s.total, 0);
    const transferTotal = filteredSalesData.filter(s => s.paymentMethod === "Bank Transfer").reduce((sum, s) => sum + s.total, 0);
    const digitalTotal = total - cashTotal - transferTotal;

    return { total, count, avgOrder, cashTotal, transferTotal, digitalTotal };
  }, [filteredSalesData]);

  const inventorySummaryKPIs = useMemo(() => {
    let totalItems = 0;
    let totalStockValueCost = 0;
    let totalStockValueRetail = 0;
    let lowStockRiskItems = 0;
    let expiredItems = 0;
    const today = new Date("2026-06-11");

    filteredInventoryData.forEach(m => {
      const activeBStock = filterBranchId === "all" ? m.stock : (m.branchStocks[filterBranchId] || 0);
      totalItems++;
      totalStockValueCost += (m.purchasePrice * activeBStock);
      totalStockValueRetail += (m.sellingPrice * activeBStock);

      if (activeBStock <= m.reorderLevel) {
        lowStockRiskItems++;
      }
      
      const expDate = new Date(m.expiryDate);
      if (expDate < today) {
        expiredItems++;
      }
    });

    const potentialMargin = totalStockValueRetail - totalStockValueCost;

    return { totalItems, totalStockValueCost, totalStockValueRetail, potentialMargin, lowStockRiskItems, expiredItems };
  }, [filteredInventoryData, filterBranchId]);

  const financesSummaryKPIs = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    filteredFinancesData.forEach(f => {
      if (f.type === "Income") {
        totalIncome += f.amount;
      } else {
        totalExpense += f.amount;
      }
    });
    const netProfit = totalIncome - totalExpense;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 105 : 0; // standard estimation

    return { totalIncome, totalExpense, netProfit, profitMargin };
  }, [filteredFinancesData]);

  // ==================== SORTING & PAGINATION LOGIC ====================
  // 1. Get raw current dataset
  const currentRawDataList = useMemo(() => {
    switch (subReportProfile) {
      case "transaction-details":
      case "ledger":
        return filteredSalesTransactionsFiltered;
      case "top-selling":
        return topSellingReportData;
      case "slow-moving":
        return slowMovingReportData;
      case "dead-stock":
        return deadStockReportData;
      case "low-stock":
        return lowStockReportData;
      case "expiry":
        return expiryReportData;
      case "cashier-perf":
        return cashierPerformanceReportData;
      case "branch-perf":
        return branchPerformanceReportData;
      case "supplier-purchase":
        return supplierPurchaseReportData;
      case "customer-purchase":
        return customerPurchaseReportData;
      case "profit-margin":
        return profitMarginReportData;
      default:
        return [];
    }
  }, [
    subReportProfile,
    filteredSalesTransactionsFiltered,
    topSellingReportData,
    slowMovingReportData,
    deadStockReportData,
    lowStockReportData,
    expiryReportData,
    cashierPerformanceReportData,
    branchPerformanceReportData,
    supplierPurchaseReportData,
    customerPurchaseReportData,
    profitMarginReportData
  ]);

  // 2. Sort current raw dataset (with full-strength dynamic type casting)
  const sortedAndPaginatedData = useMemo(() => {
    const dataCopy = [...currentRawDataList];
    if (sortField) {
      dataCopy.sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;

        if (typeof valA === "string" && typeof valB === "string") {
          return sortDirection === "asc"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        } else {
          // Numbers or other comparable types
          return sortDirection === "asc"
            ? (valA > valB ? 1 : -1)
            : (valA < valB ? 1 : -1);
        }
      });
    }

    // B. PAGINATE
    const startIndex = (currentPage - 1) * rowsPerPage;
    return dataCopy.slice(startIndex, startIndex + rowsPerPage);
  }, [currentRawDataList, sortField, sortDirection, currentPage, rowsPerPage]);

  // 3. Render sortable header helper
  const renderSortableHeader = (field: string, label: string) => {
    const isSorted = sortField === field;
    return (
      <button
        onClick={() => {
          if (sortField === field) {
            setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
          } else {
            setSortField(field);
            setSortDirection("asc");
          }
          setCurrentPage(1);
        }}
        className="flex items-center gap-1 font-bold tracking-wider text-[10px] uppercase cursor-pointer hover:text-slate-900 focus:outline-none transition-colors"
      >
        <span>{label}</span>
        {isSorted ? (
          sortDirection === "asc" ? (
            <span className="text-[9px] text-emerald-600">▲</span>
          ) : (
            <span className="text-[9px] text-rose-600">▼</span>
          )
        ) : (
          <span className="text-slate-300 text-[9px]">↕</span>
        )}
      </button>
    );
  };

  // ==================== CSV/EXCEL GENERATION LOGIC ====================
  const handleExportCSV = () => {
    let csvContent = "\ufeff"; // Force UTF-8 BOM so Excel opens it with correct accents
    onAddActivityLog("Report Export", `Exported CSV dataset for ${reportType} (${subReportProfile}) report.`);

    // Add metadata/business headers to preserve context
    csvContent += `"${businessSettings.businessName} Audit Report"\r\n`;
    csvContent += `"Branch Scope","${filterBranchId === "all" ? "Combined Area Network" : branches.find(b => b.id === filterBranchId)?.name || filterBranchId}"\r\n`;
    csvContent += `"Date Range","${dateFrom} to ${dateTo}"\r\n`;
    csvContent += `"Exported Timestamp","${new Date().toLocaleString()}"\r\n\r\n`;

    if (subReportProfile === "transaction-details" || subReportProfile === "ledger") {
      csvContent += "S/N,Invoice No,Medicine Name,Category,Quantity,Unit Cost Price (NGN),Total Cost Price (NGN),Unit Selling Price (NGN),Total Selling Price (NGN),Discount (NGN),Balance After Discount (NGN),Nett Profit (NGN),Payment Method,Cashier,Date & Time,Branch Name\r\n";
      let totalQty = 0;
      let totalCost = 0;
      let totalSell = 0;
      let totalDiscount = 0;
      let totalNett = 0;
      let totalProfit = 0;

      filteredSalesTransactionsFiltered.forEach((tx, idx) => {
        totalQty += tx.quantity;
        totalCost += tx.totalCostPrice;
        totalSell += tx.totalSellingPrice;
        totalDiscount += tx.discount;
        totalNett += tx.balanceAfterDiscount;
        totalProfit += tx.profit;

        const branchName = branches.find(b => b.id === tx.branchId)?.name || tx.branchId;
        const line = `${idx + 1},"${tx.invoiceNumber}","${tx.medicineName}","${tx.category}",${tx.quantity},${tx.unitCostPrice},${tx.totalCostPrice},${tx.unitSellingPrice},${tx.totalSellingPrice},${tx.discount},${tx.balanceAfterDiscount},${tx.profit},"${tx.paymentMethod}","${tx.cashierName}","${new Date(tx.date).toLocaleString()}","${branchName}"`;
        csvContent += line + "\r\n";
      });

      csvContent += `\r\n"TOTALS",,,,,,,${totalQty},,,,,,${totalCost},${totalSell},${totalDiscount},${totalNett},${totalProfit}\r\n`;
    
    } else if (subReportProfile === "top-selling") {
      csvContent += "S/N,Medicine Name,Category,Total Quantity Sold,Total Net Revenue (NGN),Total Discounts (NGN),Profit Generated (NGN),Supplier\r\n";
      topSellingReportData.forEach((row, idx) => {
        csvContent += `${idx + 1},"${row.medicineName}","${row.category}",${row.quantity},${row.revenue},${row.discount},${row.profit},"${row.supplier}"\r\n`;
      });

    } else if (subReportProfile === "slow-moving") {
      csvContent += "S/N,Medicine Name,Generic Name,Category,Stock Units,Total Sold Units,Turnover Rate %,Revenue Generated (NGN),Supplier\r\n";
      slowMovingReportData.forEach((row, idx) => {
        csvContent += `${idx + 1},"${row.medicineName}","${row.genericName}","${row.category}",${row.stock},${row.totalSold},${row.turnoverRate.toFixed(2)},${row.revenue},"${row.supplier}"\r\n`;
      });

    } else if (subReportProfile === "dead-stock") {
      csvContent += "S/N,Medicine Name,Generic Name,Category,Physical Stock,Wholesale Cost value (NGN),Retail Listing Value (NGN),Expiry Date,Shelf Location,Supplier\r\n";
      deadStockReportData.forEach((row, idx) => {
        csvContent += `${idx + 1},"${row.medicineName}","${row.genericName}","${row.category}",${row.stock},${row.costValue},${row.retailValue},"${row.expiryDate}","${row.shelfLocation}","${row.supplier}"\r\n`;
      });

    } else if (subReportProfile === "low-stock") {
      csvContent += "S/N,Medicine Name,Category,Current Stock,Reorder Level,Deficit Units,Suggested Reorder Cost (NGN),Supplier\r\n";
      lowStockReportData.forEach((row, idx) => {
        csvContent += `${idx + 1},"${row.medicineName}","${row.category}",${row.currentStock},${row.reorderLevel},${row.deficit},${row.suggestedCost},"${row.supplier}"\r\n`;
      });

    } else if (subReportProfile === "expiry") {
      csvContent += "S/N,Medicine Name,Batch Code,Category,Expiry Date,Stock Units,Unit Cost (NGN),Waste Value (NGN),Status,Supplier\r\n";
      expiryReportData.forEach((row, idx) => {
        csvContent += `${idx + 1},"${row.medicineName}","${row.batchNumber}","${row.category}","${row.expiryDate}",${row.stock},${row.unitCost},${row.wasteValue},"${row.status}","${row.supplier}"\r\n`;
      });

    } else if (subReportProfile === "profit-margin") {
      csvContent += "S/N,Medicine Name,Category,Cost Price (NGN),Selling Price (NGN),Profit Margin/Unit (NGN),Margin %,Physical Stock,Potential Profit (NGN),Supplier\r\n";
      profitMarginReportData.forEach((row, idx) => {
        csvContent += `${idx + 1},"${row.medicineName}","${row.category}",${row.costPrice},${row.sellingPrice},${row.profitPerUnit},${row.marginPercent.toFixed(1)},${row.stock},${row.potentialProfit},"${row.supplier}"\r\n`;
      });

    } else if (subReportProfile === "cashier-perf") {
      csvContent += "S/N,Cashier Name,Attendance,Total sales Revenue (NGN),Total checkouts count,Avg Ticket Value (NGN),Performance Score\r\n";
      cashierPerformanceReportData.forEach((row, idx) => {
        csvContent += `${idx + 1},"${row.cashierName}","${row.attendance}",${row.revenue},${row.count},${row.avgTicketValue.toFixed(2)},${row.performanceScore.toFixed(1)}\r\n`;
      });

    } else if (subReportProfile === "branch-perf") {
      csvContent += "S/N,Branch Name,Manager,Total checkout count,Total sales Revenue (NGN),Total Cost Value (NGN),Nett Profit (NGN),Profit Margin %\r\n";
      branchPerformanceReportData.forEach((row, idx) => {
        csvContent += `${idx + 1},"${row.branchName}","${row.manager}",${row.totalSalesCount},${row.totalRevenue},${row.costValue},${row.netProfit},${row.marginPercent.toFixed(1)}\r\n`;
      });

    } else if (subReportProfile === "supplier-purchase") {
      csvContent += "S/N,Supplier Name,Contact Person,Phone,Outstanding Accounts Payable (NGN),Medicines Count,Wholesale Stock value carried (NGN)\r\n";
      supplierPurchaseReportData.forEach((row, idx) => {
        csvContent += `${idx + 1},"${row.supplierName}","${row.contactPerson}","${row.phone}",${row.outstandingBalance},${row.medicinesCount},${row.costEstimate}\r\n`;
      });

    } else if (subReportProfile === "customer-purchase") {
      csvContent += "S/N,Patient Name,Phone,Email,Loyalty Points,Cashback Wallet (NGN),Credit Limit (NGN),Total Purchase Volume (NGN),Checkout Count\r\n";
      customerPurchaseReportData.forEach((row, idx) => {
        csvContent += `${idx + 1},"${row.customerName}","${row.phone}","${row.email}",${row.points},${row.walletBalance},${row.creditLimit},${row.salesVolume},${row.count}\r\n`;
      });

    } else if (reportType === "inventory" || subReportProfile === "valuation") {
      csvContent += "Medicine Name,Generic Name,Manufacturer,Category,Type,Expiry Date,Stock Level,Cost Value (NGN),Retail Value (NGN)\r\n";
      filteredInventoryData.forEach(m => {
        const qty = filterBranchId === "all" ? m.stock : (m.branchStocks[filterBranchId] || 0);
        csvContent += `"${m.name}","${m.genericName}","${m.manufacturer}","${m.category}","${m.type}","${m.expiryDate}",${qty},${m.purchasePrice * qty},${m.sellingPrice * qty}\r\n`;
      });

    } else if (reportType === "finance" || subReportProfile === "finance-ledger") {
      csvContent += "Record ID,Date,Type,Category,Amount (NGN),Payment Method,Description\r\n";
      filteredFinancesData.forEach(f => {
        csvContent += `"${f.id}","${f.date}","${f.type}","${f.category}",${f.amount},"${f.paymentMethod}","${f.description}"\r\n`;
      });

    } else if (reportType === "staff" || subReportProfile === "staff-ledger") {
      csvContent += "Employee Name,Role,Assigned Branch,Salary (NGN),Sales Managed,Performance Score\r\n";
      calculatedStaffData.forEach(s => {
        const branchName = branches.find(b => b.id === s.branchId)?.name || s.branchId;
        csvContent += `"${s.name}","${s.role}","${branchName}",${s.salary},${s.salesCount},${s.performanceScore}\r\n`;
      });
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `pharmerp_${subReportProfile}_report_${dateFrom}_to_${dateTo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ==================== PRINT PREVIEW GENERATION ====================
  const handlePrintTrigger = () => {
    setShowPrintModal(true);
    onAddActivityLog("Report Export", `Initiated high-contrast printable audit document for ${reportType} report.`);
  };

  const executePrint = () => {
    window.print();
    setShowPrintModal(false);
  };

  // ==================== USER HANDLERS ====================
  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!newUsername.trim() || !newPassword.trim()) {
      setErrorMsg("Please specify both a user identifier login name and password.");
      return;
    }

    // Check pre-existing
    if (users.some(u => u.username.toLowerCase() === newUsername.toLowerCase().trim())) {
      setErrorMsg(`A systems security account with login name [${newUsername}] already exists.`);
      return;
    }

    onAddUser(newUsername.trim(), newPassword.trim(), newRole, newBranchId);
    onAddActivityLog("User Management", `Super Admin created new user: "${newUsername}" with security clearance: [${newRole}] for Branch ID [${newBranchId}].`);
    setSuccessMsg(`Successfully provisioned PharmERP terminal login for: "${newUsername}".`);
    setNewUsername("");
    setNewPassword("");
  };

  const handleResetPassword = (userId: string) => {
    if (!tempPassword.trim()) {
      alert("Password cannot be blank.");
      return;
    }
    const targetUser = users.find(u => u.id === userId);
    onEditUserPassword(userId, tempPassword);
    onAddActivityLog("User Management", `Super Admin reset password credentials for employee account [${targetUser?.username}].`);
    alert(`Successfully reset login PIN/password for user: ${targetUser?.username}.`);
    setEditingUserId(null);
    setTempPassword("");
  };

  const handleSimulateLogin = (user: ERPUser) => {
    if (user.status === "Suspended") {
      alert(`Access Refused! The user account '${user.username}' is currently SUSPENDED under company compliance policies.`);
      return;
    }
    onSwitchUser(user);
    onAddActivityLog("Authentication", `Session swiped! Simulated terminal session switched to [${user.username}] Role: ${user.role}.`);
    alert(`Session Changed! You are now simulating as: [${user.username}] closely tracking role specific telemetry.`);
  };

  // ====== METRIC HANDLERS AND LOGICS ======
  // 1. Dynamic RBAC permission updates
  const handlePermissionToggle = (moduleName: keyof RolePermission) => {
    setRoleErrorMsg("");
    setRoleSuccessMsg("");
    const updatedRoles = roles.map(r => {
      if (r.name === selectedRoleName) {
        return {
          ...r,
          permissions: {
            ...r.permissions,
            [moduleName]: !r.permissions[moduleName]
          }
        };
      }
      return r;
    });
    onUpdateRoles(updatedRoles);
    onAddActivityLog("User Management", `Updated security authorization parameters of "${selectedRoleName}" control node: toggled [${moduleName}].`);
    setRoleSuccessMsg(`Permission "${moduleName}" toggled successfully for role "${selectedRoleName}"!`);
    setTimeout(() => setRoleSuccessMsg(""), 3000);
  };

  const handleCloneRole = (e: React.FormEvent) => {
    e.preventDefault();
    setRoleErrorMsg("");
    setRoleSuccessMsg("");
    if (!cloneRoleName.trim()) {
      setRoleErrorMsg("Please specify a target new role name for cloning.");
      return;
    }
    const alreadyExists = roles.some(r => r.name.toLowerCase() === cloneRoleName.toLowerCase().trim());
    if (alreadyExists) {
      setRoleErrorMsg(`Conflict! Role "${cloneRoleName}" already exists in active list.`);
      return;
    }
    const source = roles.find(r => r.name === selectedRoleName);
    if (!source) return;

    const cloned: SecurityRole = {
      name: cloneRoleName.trim(),
      permissions: { ...source.permissions },
      isSystem: false
    };
    onUpdateRoles([...roles, cloned]);
    onAddActivityLog("User Management", `Cloned role "${selectedRoleName}" into custom credential archetype: "${cloned.name}".`);
    setRoleSuccessMsg(`Successfully cloned "${selectedRoleName}" into custom role "${cloned.name}"!`);
    setSelectedRoleName(cloned.name);
    setCloneRoleName("");
    setTimeout(() => setRoleSuccessMsg(""), 4000);
  };

  const handleCreateCustomRole = (e: React.FormEvent) => {
    e.preventDefault();
    setRoleErrorMsg("");
    setRoleSuccessMsg("");
    if (!customRoleName.trim()) {
      setRoleErrorMsg("Role identifier label cannot be blank.");
      return;
    }
    const alreadyExists = roles.some(r => r.name.toLowerCase() === customRoleName.toLowerCase().trim());
    if (alreadyExists) {
      setRoleErrorMsg(`A security role named "${customRoleName}" already exists.`);
      return;
    }
    const customRole: SecurityRole = {
      name: customRoleName.trim(),
      permissions: {
        dashboard: true,
        sales: false,
        inventory: false,
        reports: false,
        customers: false,
        suppliers: false,
        purchases: false,
        settings: false,
        branches: false
      },
      isSystem: false
    };
    onUpdateRoles([...roles, customRole]);
    onAddActivityLog("User Management", `Initiated custom system security clearance: "${customRole.name}" with default dashboard access.`);
    setRoleSuccessMsg(`Successfully created custom role "${customRole.name}". Set custom permissions below.`);
    setSelectedRoleName(customRole.name);
    setCustomRoleName("");
    setTimeout(() => setRoleSuccessMsg(""), 4000);
  };

  const handleDeleteRole = (roleNameToDelete: string) => {
    setRoleErrorMsg("");
    setRoleSuccessMsg("");
    const roleTarget = roles.find(r => r.name === roleNameToDelete);
    if (!roleTarget) return;
    if (roleTarget.isSystem) {
      setRoleErrorMsg(`Operational Safeguard: Role "${roleNameToDelete}" is a default system-wide type and cannot be deleted.`);
      setTimeout(() => setRoleErrorMsg(""), 3000);
      return;
    }
    const filtered = roles.filter(r => r.name !== roleNameToDelete);
    onUpdateRoles(filtered);
    onAddActivityLog("User Management", `Decommissioned customized security role: "${roleNameToDelete}" from active register.`);
    setRoleSuccessMsg(`Role "${roleNameToDelete}" was successfully completely removed.`);
    setSelectedRoleName("Pharmacist");
    setTimeout(() => setRoleSuccessMsg(""), 3000);
  };

  // 2. Business configuration updates
  const handleSaveBusinessSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: BusinessSettings = {
      businessName: bizName,
      logoText: bizLogoText,
      address: bizAddress,
      phone: bizPhone,
      email: bizEmail,
      website: bizWebsite,
      taxNumber: bizTaxNumber,
      currency: bizCurrency,
      receiptFooter: bizFooter,
      invoicePrefix: bizPrefix
    };
    onUpdateBusinessSettings(updated);
    onAddActivityLog("Backup Operation", `Re-configured global enterprise metadata parameters. Company: [${bizName}].`);
    alert(`Success! Updated business parameters have been broadcasted across live sessions.`);
  };

  // 3. Barcode simulator scan handler
  const handleBarcodeScanSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    setScannedMed(null);
    if (!barcodeInput.trim()) return;

    const query = barcodeInput.trim().toLowerCase();
    // Search medicines matching code or prefix
    const found = medicines.find(m => 
      m.id.toLowerCase() === query || 
      (m.storeLocation && m.storeLocation.toLowerCase().includes(query)) ||
      m.name.toLowerCase().includes(query) ||
      m.genericName.toLowerCase().includes(query)
    );

    if (found) {
      setScannedMed(found);
      const generatedCode = found.storeLocation.split(" ")[1] || `EAN-${found.id.replace("med_", "902")}`;
      setGBarcode(generatedCode);
      onAddActivityLog("Product Catalog", `Executed simulated red-dot laser barcode scan for "${found.name}" [Code: ${generatedCode}].`);
    } else {
      alert(`Terminal laser barcode alert: No medicine profile matches search ticker "${barcodeInput}".`);
    }
  };

  // 4. WhatsApp Dispatch message
  const handleDispatchWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waMsg.trim()) return;

    const timestampStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setWaLogs(prev => [
      ...prev,
      { sender: "user", text: waMsg, time: timestampStr }
    ]);
    const originalMsg = waMsg;
    setWaMsg("");

    onAddActivityLog("POS Sale", `Transmitted simulated secure WhatsApp broadcast message payload to terminal client endpoint: ${waPhone}`);
    
    // Simulate auto response from target patient/customer
    setTimeout(() => {
      setWaLogs(prev => [
        ...prev,
        {
          sender: "system",
          text: `[Auto-Reply from Customer] Received message: "${originalMsg.slice(0, 30)}...". Thank you, Jadan Pharmacy support received.`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }, 1505);
  };

  // 5. Server-Bound Gemini Smart AI Forecasts
  const runAiForecast = async () => {
    setIsAiLoading(true);
    setAiResult("");
    
    const lowStockMeds = medicines.filter(m => m.stock <= m.reorderLevel);
    const expiringSoonMeds = medicines.filter(m => {
      const expDate = new Date(m.expiryDate);
      const limit = new Date();
      limit.setMonth(limit.getMonth() + 4);
      return expDate > new Date() && expDate <= limit;
    });

    const contextTxt = `
      Hello model, perform an enterprise-caliber Pharmacy inventory forecasting audit.
      Current Tenant context is: ${currentTenantCompany}
      Current total catalogue records: ${medicines.length} medicines
      Current low stock medicines requiring urgent refills:
      ${lowStockMeds.map(m => `- ${m.name} Generic: ${m.genericName} (Remaining Stock: ${m.stock}, Reorder Level: ${m.reorderLevel}, Shelf: ${m.storeLocation || 'unassigned'})`).join("\n") || "- None"}
      
      Medicines expiring within the next 120 days:
      ${expiringSoonMeds.map(m => `- ${m.name} [Expiry Date: ${m.expiryDate}]`).join("\n") || "- None"}
      
      Cumulative POS sales records available to analyze: ${sales.length} transactions.
      
      Structure your result in precise markdown. Give us three distinct sections:
      1. AI DEMAND FORECAST & REORDER RECOMMENDATIONS (Suggest exact purchase levels based on FEFO)
      2. RISK MATRIX (Dead stock levels vs critical outages)
      3. CRITICAL EXPIRY SHELFLIFE LOGISTICS STRATEGY (Specifically for Lagos and Kano nodes)
    `;

    try {
      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          taskType: "forecast",
          message: contextTxt
        })
      });
      const data = await res.json();
      setAiResult(data.text || data.error || "Failed to parse AI outcome message.");
      onAddActivityLog("User Management", `Launched real-time Gemini LLM AI engine forecast analysis on active store database.`);
    } catch (err: any) {
      setAiResult(`Connection interruption. Failed to reach central Gemini node: ${err.message || err}`);
    } finally {
      setIsAiLoading(false);
    }
  };


  // Filter audit logs for real time terminal list
  const filteredAuditLogs = useMemo(() => {
    return activityLogs.filter(log => {
      const matchSearch = log.username.toLowerCase().includes(logSearch.toLowerCase()) || 
                          log.description.toLowerCase().includes(logSearch.toLowerCase()) ||
                          log.role.toLowerCase().includes(logSearch.toLowerCase());
      const matchAction = logActionType === "all" || log.actionType === logActionType;
      return matchSearch && matchAction;
    });
  }, [activityLogs, logSearch, logActionType]);

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#6366f1", "#ec4899", "#8b5cf6", "#14b8a6"];

  return (
    <div className="space-y-6">
      
      {/* Title block with persistent theme design layout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
              <FileText size={20} />
            </span>
            Enterprise Reports & Administration Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Produce certified audits, manage secure branch logins, & monitor real-time database transactions.
          </p>
        </div>

        {/* Outer Tabs matching Professional Polish style with horizontal scrolling safety */}
        <div className="flex overflow-x-auto max-w-full bg-slate-100 p-1 rounded-xl border border-slate-200 no-scrollbar select-none whitespace-nowrap gap-1">
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "reports"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Layers size={13} />
            Report Logs
          </button>
          <button
            onClick={() => setActiveTab("ai_forecast")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "ai_forecast"
                ? "bg-white text-emerald-700 shadow-sm border border-emerald-100"
                : "text-slate-500 hover:text-emerald-600"
            }`}
          >
            <Star size={13} className="text-emerald-500 animate-pulse" />
            AI Predictive Forecaster
          </button>
          <button
            onClick={() => setActiveTab("barcode_qr")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "barcode_qr"
                ? "bg-white text-blue-750 shadow-sm"
                : "text-slate-500 hover:text-blue-600"
            }`}
          >
            <QrCode size={13} className="text-blue-500" />
            Barcode & QR Scanner
          </button>
          <button
            onClick={() => setActiveTab("whatsapp")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "whatsapp"
                ? "bg-white text-emerald-800 shadow-sm"
                : "text-slate-500 hover:text-emerald-600"
            }`}
          >
            <MessageSquare size={13} className="text-emerald-650" />
            WhatsApp Dispatch
          </button>
          <button
            onClick={() => setActiveTab("admin")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "admin"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <UserCheck size={13} />
            Super Admin Area
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "logs"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <ShieldAlert size={13} />
            Live Audit Ledger
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/*                       REPORTS TAB                        */}
      {/* ======================================================== */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          
          {/* Dynamic Filter toolbar inside clean light card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xs uppercase tracking-wider font-bold text-slate-500 flex items-center gap-1">
                <Filter size={12} className="text-emerald-500" />
                Query Filter Rules
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">
                Query range: {dateFrom} to {dateTo}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight block">Report Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as any)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold"
                >
                  <option value="sales">📊 Sales Performance Ledger</option>
                  <option value="inventory">📦 Inventory Valuation & Risk</option>
                  <option value="finance">💸 Corporate Income & Expense</option>
                  <option value="staff">👥 Human Performance Ratings</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight block">Sub-Report View</label>
                <select
                  value={subReportProfile}
                  onChange={(e) => setSubReportProfile(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold"
                >
                  {reportType === "sales" && (
                    <>
                      <option value="transaction-details">📋 Transaction Details (Full Ledger)</option>
                      <option value="top-selling">🏆 Top Selling Medicines</option>
                      <option value="slow-moving">🐢 Slow Moving Medicines</option>
                      <option value="dead-stock">💀 Dead Stock Report</option>
                      <option value="low-stock">⚠️ Low Stock Report</option>
                      <option value="expiry">⏰ Expiry Report</option>
                      <option value="profit-margin">💰 Profit Margin Report</option>
                      <option value="cashier-perf">👤 Cashier Performance</option>
                      <option value="branch-perf">🏢 Branch Performance</option>
                      <option value="supplier-purchase">🚚 Supplier Purchase Report</option>
                      <option value="customer-purchase">👥 Customer Purchase Report</option>
                    </>
                  )}
                  {reportType === "inventory" && (
                    <option value="valuation">📦 Inventory Valuation</option>
                  )}
                  {reportType === "finance" && (
                    <option value="finance-ledger">💸 Finance Ledger</option>
                  )}
                  {reportType === "staff" && (
                    <option value="staff-ledger">👥 Staff Performance Ledger</option>
                  )}
                </select>
              </div>

            </div>
          </div>

          {/* ==================== ANALYTICS CARDS - TRANSACTION DETAILS ==================== */}
          {(reportType === "sales" && (subReportProfile === "transaction-details" || subReportProfile === "ledger")) && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                <p className="text-[9px] font-bold text-slate-500 uppercase">Total Transactions</p>
                <p className="text-lg font-extrabold text-slate-900 mt-1">{filteredSalesTransactionsFiltered.length}</p>
                <p className="text-[9px] text-slate-400 mt-0.5">Line items</p>
              </div>
              <div className="bg-white border border-emerald-200 rounded-xl p-3 shadow-sm">
                <p className="text-[9px] font-bold text-emerald-600 uppercase">Total Revenue</p>
                <p className="text-lg font-extrabold text-emerald-700 mt-1">₦{filteredSalesTransactionsFiltered.reduce((s, t) => s + t.totalSellingPrice, 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
                <p className="text-[9px] text-emerald-500 mt-0.5">Gross sales</p>
              </div>
              <div className="bg-white border border-blue-200 rounded-xl p-3 shadow-sm">
                <p className="text-[9px] font-bold text-blue-600 uppercase">Total Profit</p>
                <p className="text-lg font-extrabold text-blue-700 mt-1">₦{filteredSalesTransactionsFiltered.reduce((s, t) => s + t.profit, 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
                <p className="text-[9px] text-blue-500 mt-0.5">Nett margin</p>
              </div>
              <div className="bg-white border border-amber-200 rounded-xl p-3 shadow-sm">
                <p className="text-[9px] font-bold text-amber-600 uppercase">Qty Sold</p>
                <p className="text-lg font-extrabold text-amber-700 mt-1">{filteredSalesTransactionsFiltered.reduce((s, t) => s + t.quantity, 0).toLocaleString()}</p>
                <p className="text-[9px] text-amber-500 mt-0.5">Units dispatched</p>
              </div>
              <div className="bg-white border border-rose-200 rounded-xl p-3 shadow-sm">
                <p className="text-[9px] font-bold text-rose-600 uppercase">Total Discount</p>
                <p className="text-lg font-extrabold text-rose-700 mt-1">₦{filteredSalesTransactionsFiltered.reduce((s, t) => s + t.discount, 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
                <p className="text-[9px] text-rose-500 mt-0.5">Loyalty waivers</p>
              </div>
              <div className="bg-white border border-purple-200 rounded-xl p-3 shadow-sm">
                <p className="text-[9px] font-bold text-purple-600 uppercase">Avg Sale Value</p>
                <p className="text-lg font-extrabold text-purple-700 mt-1">₦{filteredSalesTransactionsFiltered.length > 0 ? (filteredSalesTransactionsFiltered.reduce((s, t) => s + t.balanceAfterDiscount, 0) / filteredSalesTransactionsFiltered.length).toLocaleString("en-US", { maximumFractionDigits: 0 }) : 0}</p>
                <p className="text-[9px] text-purple-500 mt-0.5">Per line item</p>
              </div>
            </div>
          )}

          {/* ==================== SUB REVENUE KPIS (INVENTORY REPORT) ==================== */}
          {reportType === "inventory" && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Total Items Seeded</p>
                <p className="text-xl font-extrabold text-slate-900 mt-1">{inventorySummaryKPIs.totalItems} Records</p>
                <p className="text-[10px] text-emerald-600 mt-1.5 font-bold">Standard Formula Managed</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Valuation @ wholesale cost</p>
                <p className="text-xl font-extrabold text-slate-900 mt-1">₦{inventorySummaryKPIs.totalStockValueCost.toLocaleString()}</p>
                <p className="text-[10px] text-amber-600 mt-1.5 font-bold">Landed capital asset density</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Valuation @ retail listing</p>
                <p className="text-xl font-extrabold text-slate-900 mt-1">₦{inventorySummaryKPIs.totalStockValueRetail.toLocaleString()}</p>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-1">Expected Return Margin: {inventorySummaryKPIs.totalStockValueCost > 0 ? ((inventorySummaryKPIs.potentialMargin / inventorySummaryKPIs.totalStockValueCost) * 100).toFixed(1) : 0}%</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Audit Warnings</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>{inventorySummaryKPIs.lowStockRiskItems} Low Stock</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-rose-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                    <span>{inventorySummaryKPIs.expiredItems} Expired</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">Requires instant clinical disposal</p>
              </div>
            </div>
          )}

          {/* ==================== SUB REVENUE KPIS (FINANCE REPORT) ==================== */}
          {reportType === "finance" && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Operating Income</p>
                <p className="text-xl font-extrabold text-slate-900 mt-1">₦{financesSummaryKPIs.totalIncome.toLocaleString()}</p>
                <span className="text-[10px] text-emerald-600 font-bold block mt-1.5">+10.4% versus baseline</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Operating SG&A Expenses</p>
                <p className="text-xl font-extrabold text-slate-900 mt-1">₦{financesSummaryKPIs.totalExpense.toLocaleString()}</p>
                <span className="text-[10px] text-rose-600 font-bold block mt-1.5">Salaries and branch leasing cost</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Net Income Statement</p>
                <p className={`text-xl font-extrabold mt-1 ${financesSummaryKPIs.netProfit >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                  ₦{financesSummaryKPIs.netProfit.toLocaleString()}
                </p>
                <span className="text-[10px] text-slate-500 mt-1.5 block">Sum balance sheets</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Operating Profit margin</p>
                <p className="text-xl font-extrabold text-slate-900 mt-1">{financesSummaryKPIs.profitMargin.toFixed(1)}%</p>
                <span className="text-[10px] text-slate-400 mt-1.5 block">Profit margin index value</span>
              </div>
            </div>
          )}

          {/* ==================== SUB REVENUE KPIS (STAFF REPORT) ==================== */}
          {reportType === "staff" && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Total Field Staff</p>
                <p className="text-xl font-extrabold text-slate-900 mt-1">{calculatedStaffData.length} Active Employees</p>
                <span className="text-[10px] text-slate-500 mt-1.5 block">Assigned branch roster</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Total Generated Sales Value</p>
                <p className="text-xl font-extrabold text-slate-900 mt-1">
                  ₦{calculatedStaffData.reduce((sum, s) => sum + s.totalSalesValue, 0).toLocaleString()}
                </p>
                <span className="text-[10px] text-emerald-600 font-bold block mt-1.5">Direct employee checkout contribution</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Average performance score</p>
                <p className="text-xl font-extrabold text-slate-900 mt-1">
                  {(calculatedStaffData.reduce((sum, s) => sum + s.performanceScore, 0) / (calculatedStaffData.length || 1)).toFixed(2)} / 5.00
                </p>
                <span className="text-[10px] text-slate-400 mt-1.5 block">LUTH compliance ratings index</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Monthly HRM Payroll Burden</p>
                <p className="text-xl font-extrabold text-slate-900 mt-1">
                  ₦{calculatedStaffData.reduce((sum, s) => sum + s.salary, 0).toLocaleString()}
                </p>
                <span className="text-[10px] text-rose-600 block mt-1">Landed payroll overhead</span>
              </div>
            </div>
          )}

          {/* ==================== ANALYTICS GRAPHS - TRANSACTION DETAILS ==================== */}
          {(reportType === "sales" && (subReportProfile === "transaction-details" || subReportProfile === "ledger")) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Daily Sales Trend */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <h3 className="text-xs uppercase font-extrabold text-slate-500 flex items-center gap-1.5 mb-3">
                  <TrendingUp size={13} className="text-emerald-500" />
                  Daily Sales Trend
                </h3>
                <div className="h-48">
                  {salesChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesChartData}>
                        <defs>
                          <linearGradient id="dailySalesGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" tickStyle={{ fontSize: 9 }} stroke="#94a3b8" />
                        <YAxis tickStyle={{ fontSize: 9 }} stroke="#94a3b8" />
                        <Tooltip contentStyle={{ fontSize: 10, borderRadius: 6, borderColor: "#e2e8f0" }} formatter={(value: any) => [`₦${value.toLocaleString()}`, "Revenue"]} />
                        <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#dailySalesGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400">No data available</div>
                  )}
                </div>
              </div>

              {/* Top Selling Medicines */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <h3 className="text-xs uppercase font-extrabold text-slate-500 flex items-center gap-1.5 mb-3">
                  🏆 Top Selling Medicines
                </h3>
                <div className="h-48">
                  {topMedicinesChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topMedicinesChartData} layout="vertical" margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis type="number" tickStyle={{ fontSize: 9 }} stroke="#94a3b8" />
                        <YAxis dataKey="name" type="category" tickStyle={{ fontSize: 9 }} stroke="#94a3b8" width={120} />
                        <Tooltip contentStyle={{ fontSize: 10, borderRadius: 6 }} formatter={(value: any) => [`${value} units`, "Quantity Sold"]} />
                        <Bar dataKey="quantity" fill="#10b981" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400">No data available</div>
                  )}
                </div>
              </div>

              {/* Top Categories */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <h3 className="text-xs uppercase font-extrabold text-slate-500 flex items-center gap-1.5 mb-3">
                  🏷️ Top Categories
                </h3>
                <div className="h-48">
                  {categoryChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {categoryChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ fontSize: 10, borderRadius: 6 }} formatter={(value: any) => `₦${value.toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400">No data available</div>
                  )}
                </div>
              </div>

              {/* Branch Sales Performance */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <h3 className="text-xs uppercase font-extrabold text-slate-500 flex items-center gap-1.5 mb-3">
                  <Building size={13} className="text-emerald-500" />
                  Branch Sales Performance
                </h3>
                <div className="h-48">
                  {branchChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={branchChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tickStyle={{ fontSize: 9 }} stroke="#94a3b8" />
                        <YAxis tickStyle={{ fontSize: 9 }} stroke="#94a3b8" />
                        <Tooltip contentStyle={{ fontSize: 10, borderRadius: 6 }} formatter={(value: any) => `₦${value.toLocaleString()}`} />
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400">No data available</div>
                  )}
                </div>
              </div>

              {/* Payment Method Distribution */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm lg:col-span-2">
                <h3 className="text-xs uppercase font-extrabold text-slate-500 flex items-center gap-1.5 mb-3">
                  💳 Payment Method Distribution
                </h3>
                <div className="h-48">
                  {paymentMethodChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={paymentMethodChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tickStyle={{ fontSize: 10 }} stroke="#94a3b8" />
                        <YAxis tickStyle={{ fontSize: 9 }} stroke="#94a3b8" />
                        <Tooltip contentStyle={{ fontSize: 10, borderRadius: 6 }} formatter={(value: any) => `₦${value.toLocaleString()}`} />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                          {paymentMethodChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400">No data available</div>
                  )}
                </div>
              </div>
            </div>
          )}

            {/* Right Export and Controls Panel */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xs uppercase font-extrabold text-slate-500 mb-3 border-b border-slate-50 pb-2">
                  Document Operations
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Export structured, compliance-safe data files formatted for Nigeria National Pharmacy Board clearance.
                </p>

                <div className="space-y-3 mt-4">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 list-inside space-y-1">
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-700">Records Found:</span>
                      <span className="font-mono text-slate-900 font-bold">
                        {reportType === "sales" && filteredSalesData.length}
                        {reportType === "inventory" && filteredInventoryData.length}
                        {reportType === "finance" && filteredFinancesData.length}
                        {reportType === "staff" && calculatedStaffData.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-700">Active Operator:</span>
                      <span className="font-mono text-emerald-600 font-bold">{currentUser.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-700">Clearance level:</span>
                      <span className="bg-slate-200 px-1.5 py-0.2 rounded text-[10px] text-slate-700 font-bold">{currentUser.role}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download Buttons conforming to the theme */}
              <div className="space-y-2 mt-6">
                <button
                  onClick={handleExportCSV}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
                >
                  <Download size={14} />
                  Export to Excel (CSV)
                </button>
                <button
                  onClick={handlePrintTrigger}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
                >
                  <Printer size={14} />
                  Render Printable PDF
                </button>
              </div>
            </div>

          </div>

          {/* ==================== DETAIL REPORT GRID TABLE ==================== */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-xs uppercase tracking-wider font-extrabold text-slate-500">
                Itemized Live Ledger Breakdown
              </h3>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-200 px-2 py-0.5 rounded">
                Database active
              </span>
            </div>

            <div className="overflow-x-auto min-h-[250px]">
              
            {reportType === "sales" && (subReportProfile === "transaction-details" || subReportProfile === "ledger") && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b-2 border-slate-300">
                      <th className="px-3 py-3 w-12">{renderSortableHeader("sn", "S/N")}</th>
                      <th className="px-3 py-3">{renderSortableHeader("invoiceNumber", "Invoice #")}</th>
                      <th className="px-3 py-3">{renderSortableHeader("medicineName", "Medicine Name")}</th>
                      <th className="px-3 py-3">{renderSortableHeader("category", "Category")}</th>
                      <th className="px-3 py-3 text-right">{renderSortableHeader("quantity", "Qty")}</th>
                      <th className="px-3 py-3 text-right">{renderSortableHeader("unitCostPrice", "Unit Cost Price")}</th>
                      <th className="px-3 py-3 text-right">{renderSortableHeader("totalCostPrice", "Total Cost")}</th>
                      <th className="px-3 py-3 text-right">{renderSortableHeader("unitSellingPrice", "Unit Sell Price")}</th>
                      <th className="px-3 py-3 text-right">{renderSortableHeader("totalSellingPrice", "Total Sell")}</th>
                      <th className="px-3 py-3 text-right">{renderSortableHeader("discount", "Discount")}</th>
                      <th className="px-3 py-3 text-right">{renderSortableHeader("balanceAfterDiscount", "Balance")}</th>
                      <th className="px-3 py-3 text-right">{renderSortableHeader("profit", "Profit")}</th>
                      <th className="px-3 py-3">{renderSortableHeader("paymentMethod", "Payment")}</th>
                      <th className="px-3 py-3">{renderSortableHeader("cashierName", "Cashier")}</th>
                      <th className="px-3 py-3">{renderSortableHeader("date", "Date & Time")}</th>
                      <th className="px-3 py-3">{renderSortableHeader("branchName", "Branch")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {sortedAndPaginatedData.map((tx: any) => {
                      const isLowProfit = tx.profit < (tx.balanceAfterDiscount * 0.15);
                      const isHighValue = tx.balanceAfterDiscount > 20000;
                      const profitColor = tx.profit > 0 ? "text-emerald-700 font-bold" : "text-rose-700 font-bold";
                      const rowBgClass = isLowProfit ? "bg-amber-50/50" : (isHighValue ? "bg-blue-50/30" : "hover:bg-slate-50");
                      const branchName = branches.find(b => b.id === tx.branchId)?.name || tx.branchId;
                      return (
                        <tr key={tx.invoiceNumber + tx.medicineName} className={`${rowBgClass} transition-colors`}>
                          <td className="px-3 py-2.5 font-mono text-slate-500">{tx.sn}</td>
                          <td className="px-3 py-2.5 font-mono text-slate-600 font-bold">{tx.invoiceNumber}</td>
                          <td className="px-3 py-2.5 font-semibold text-slate-800">{tx.medicineName}</td>
                          <td className="px-3 py-2.5">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold">{tx.category}</span>
                          </td>
                          <td className="px-3 py-2.5 text-right font-bold">{tx.quantity}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-slate-600">₦{tx.unitCostPrice.toLocaleString()}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-slate-600">₦{tx.totalCostPrice.toLocaleString()}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-slate-800">₦{tx.unitSellingPrice.toLocaleString()}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-slate-800 font-bold">₦{tx.totalSellingPrice.toLocaleString()}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-rose-600 font-bold">-₦{tx.discount.toLocaleString()}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-emerald-700 font-extrabold">₦{tx.balanceAfterDiscount.toLocaleString()}</td>
                          <td className={`px-3 py-2.5 text-right font-mono ${profitColor}`}>{tx.profit >= 0 ? "+" : ""}₦{tx.profit.toLocaleString()}</td>
                          <td className="px-3 py-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              tx.paymentMethod === "Cash" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                              tx.paymentMethod === "POS" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                              tx.paymentMethod === "Bank Transfer" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                              tx.paymentMethod === "Mobile Money" ? "bg-purple-50 text-purple-700 border border-purple-100" :
                              "bg-rose-50 text-rose-700 border border-rose-100"
                            }`}>
                              {tx.paymentMethod}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-slate-600">{tx.cashierName}</td>
                          <td className="px-3 py-2.5 text-slate-500 font-mono text-[10px]">
                            {new Date(tx.date).toLocaleDateString()}<br/>
                            <span className="text-slate-400">{new Date(tx.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                          </td>
                          <td className="px-3 py-2.5 font-semibold text-slate-700">{branchName}</td>
                        </tr>
                      );
                    })}
                    {sortedAndPaginatedData.length === 0 && (
                      <tr>
                        <td colSpan={16} className="text-center py-12 text-slate-400">
                          <div className="flex flex-col items-center gap-2">
                            <Search size={24} className="text-slate-300" />
                            <p>No transactions found matching your filters.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

              {reportType === "inventory" && (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                      <th className="px-5 py-3">Medicine Profile</th>
                      <th className="px-5 py-3">Generic Composition</th>
                      <th className="px-5 py-3">Category</th>
                      <th className="px-5 py-3">Unit / SKU</th>
                      <th className="px-5 py-3 text-right">Stock Level</th>
                      <th className="px-5 py-3 text-right">Landed Cost</th>
                      <th className="px-5 py-3 text-right">Retail Listing</th>
                      <th className="px-5 py-3 text-right">Total Wholesale Cost</th>
                      <th className="px-5 py-3 text-right">Total Retail Value</th>
                      <th className="px-5 py-3">Expiration State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {filteredInventoryData.map(m => {
                      const qty = filterBranchId === "all" ? m.stock : (m.branchStocks[filterBranchId] || 0);
                      const isLow = qty <= m.reorderLevel;
                      const isExpired = new Date(m.expiryDate) < new Date("2026-06-11");
                      return (
                        <tr key={m.id} className="hover:bg-slate-50">
                          <td className="px-5 py-3 font-bold text-slate-800">{m.name}</td>
                          <td className="px-5 py-3 italic text-slate-400 text-[11px]">{m.genericName}</td>
                          <td className="px-5 py-3">{m.category}</td>
                          <td className="px-5 py-3 font-mono">{m.unit}</td>
                          <td className={`px-5 py-3 text-right font-bold ${isLow ? "text-amber-600 font-black animate-pulse" : ""}`}>{qty} Units</td>
                          <td className="px-5 py-3 text-right text-slate-500">₦{m.purchasePrice.toLocaleString()}</td>
                          <td className="px-5 py-3 text-right text-slate-800 font-semibold">₦{m.sellingPrice.toLocaleString()}</td>
                          <td className="px-5 py-3 text-right text-slate-500 font-mono">₦{(m.purchasePrice * qty).toLocaleString()}</td>
                          <td className="px-5 py-3 text-right text-slate-900 font-mono font-bold">₦{(m.sellingPrice * qty).toLocaleString()}</td>
                          <td className="px-5 py-3 font-semibold">
                            {isExpired ? (
                              <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-bold rounded-full text-[9px] border border-rose-100">Expired</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-slate-50 text-slate-600 font-mono text-[9px] rounded-full">Valid: {m.expiryDate}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {reportType === "finance" && (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                      <th className="px-5 py-3">Record ID</th>
                      <th className="px-5 py-3">Date Record</th>
                      <th className="px-5 py-3">Financial Type</th>
                      <th className="px-5 py-3">Expense/Revenue Category</th>
                      <th className="px-5 py-3">Target Branch</th>
                      <th className="px-5 py-3">Description</th>
                      <th className="px-5 py-3">Payment Method</th>
                      <th className="px-5 py-3 text-right">Sum Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {filteredFinancesData.map(f => {
                      const branchName = branches.find(b => b.id === f.branchId)?.name || "Central Hub";
                      return (
                        <tr key={f.id} className="hover:bg-slate-50">
                          <td className="px-5 py-3 font-mono text-slate-400 font-bold">{f.id}</td>
                          <td className="px-5 py-3">{f.date}</td>
                          <td className="px-5 py-3 font-bold">
                            {f.type === "Income" ? (
                              <span className="text-emerald-600 flex items-center gap-1">
                                <ArrowUpRight size={12} /> Income
                              </span>
                            ) : (
                              <span className="text-rose-600 flex items-center gap-1">
                                <ArrowDownRight size={12} /> Expense
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3 font-semibold text-slate-800">{f.category}</td>
                          <td className="px-5 py-3 text-slate-500">{branchName}</td>
                          <td className="px-5 py-3">{f.description}</td>
                          <td className="px-5 py-3 font-mono">{f.paymentMethod}</td>
                          <td className={`px-5 py-3 text-right font-extrabold ${f.type === "Income" ? "text-slate-800" : "text-rose-700"}`}>
                            {f.type === "Income" ? "" : "-"}₦{f.amount.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {reportType === "staff" && (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                      <th className="px-5 py-3">Staff Member</th>
                      <th className="px-5 py-3">Official Role</th>
                      <th className="px-5 py-3">Target Branch Clinic</th>
                      <th className="px-5 py-3 text-right">Assigned Salary (NGN)</th>
                      <th className="px-5 py-3 text-right">Transaction Volume</th>
                      <th className="px-5 py-3 text-right">Sales Under Supervision</th>
                      <th className="px-5 py-3">State Attendance</th>
                      <th className="px-5 py-3 text-right">Board Performance Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {calculatedStaffData.map(s => {
                      const branchName = branches.find(b => b.id === s.branchId)?.name || s.branchId;
                      return (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="px-5 py-3 font-bold text-slate-800">{s.name}</td>
                          <td className="px-5 py-3 text-slate-500 font-semibold">{s.role}</td>
                          <td className="px-5 py-3 text-slate-700">{branchName}</td>
                          <td className="px-5 py-3 text-right font-mono">₦{s.salary.toLocaleString()}</td>
                          <td className="px-5 py-3 text-right font-semibold">{s.salesCount} checkouts</td>
                          <td className="px-5 py-3 text-right text-emerald-700 font-mono font-bold">₦{s.totalSalesValue.toLocaleString()}</td>
                          <td className="px-5 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              s.attendanceStatus === "Present" ? "bg-emerald-50 text-emerald-700" : 
                              s.attendanceStatus === "Late" ? "bg-yellow-50 text-yellow-700" : "bg-rose-50 text-rose-700"
                            }`}>
                              {s.attendanceStatus}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right font-bold text-slate-900">
                            <div className="flex items-center justify-end gap-1">
                              <Star size={11} className="fill-yellow-400 text-yellow-500" />
                              <span>{s.performanceScore.toFixed(1)} / 5.0</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/*             AI PREDICTIVE FORECASTER CO-PILOT            */}
      {/* ======================================================== */}
      {activeTab === "ai_forecast" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-100 text-emerald-700 rounded-lg animate-pulse">
                  <Star size={16} />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Gemini Neural Demand Forecaster</h3>
                  <p className="text-[10px] text-slate-400">Generates instant reorder estimates, dead-stock levels, and FEFO expiry risk maps.</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-mono font-bold rounded-lg border border-slate-200">
                ACTIVE CO-PILOT: GEMINI-3.5-FLASH
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Forecast Parameters</h4>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Active Tenant Scope</label>
                    <select 
                      value={currentTenantCompany} 
                      onChange={(e) => {
                        setCurrentTenantCompany(e.target.value);
                        onAddActivityLog("Authentication", `AI Forecasting tenant reconditioned to: ${e.target.value}`);
                      }}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:ring-1 focus:ring-slate-900"
                    >
                      <option value="Jadan Express Pharmacy Group Ltd (Lagos Headquarters)">🌐 Lagos HQ (Main plaza)</option>
                      <option value="Al-Razaq Pharmacy & Vaccine Hub (Kano Outlet)">🧪 Kano vaccines fridge warehouse</option>
                      <option value="Garki Clinical Care Pharmacy (Abuja Center)">🏥 Abuja Garki general clinics</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={runAiForecast}
                      disabled={isAiLoading}
                      className="w-full bg-slate-900 text-white font-bold text-xs p-3 rounded-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed shadow"
                    >
                      {isAiLoading ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          Analyzing Database...
                        </>
                      ) : (
                        <>
                          <Star size={14} />
                          Generate Smart AI Forecast
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-emerald-500/5 border border-emerald-100 rounded-xl space-y-2">
                  <h5 className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                    <AlertTriangle size={13} />
                    Predictive Model Insights
                  </h5>
                  <p className="text-[10px] text-slate-600 leading-relaxed">
                    Model inputs will scan {medicines.length} drug catalogs, {sales.length} customer receipts, and current Nigeria National Health Insurance (NHIS) price limits automatically.
                  </p>
                </div>
              </div>

              {/* AI response display Panel */}
              <div className="lg:col-span-2 bg-slate-900 text-slate-100 rounded-xl p-5 shadow-inner border border-slate-950 font-mono text-xs flex flex-col min-h-[350px]">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 text-[10px] text-slate-400 font-mono">
                  <span>TERMINAL TERMINUS: OK</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                    <span>SECURE LLM CONNECTION</span>
                  </div>
                </div>

                {isAiLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-3 py-12">
                    <RefreshCw size={28} className="animate-spin text-emerald-400" />
                    <p className="text-[11px] text-slate-400 animate-pulse font-sans">Consulting central nervous nodes & building predictive demand curves...</p>
                  </div>
                ) : aiResult ? (
                  <div className="flex-1 overflow-y-auto space-y-4 max-h-[450px] pr-2 scrollbar-thin text-slate-200">
                    <div className="whitespace-pre-wrap font-sans leading-relaxed text-slate-200">
                      {aiResult}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-800 rounded-lg">
                    <Star size={32} className="text-slate-700 mb-3 animate-pulse" />
                    <p className="text-slate-400 text-xs font-bold font-sans">No active forecast analyzed</p>
                    <p className="text-slate-600 text-[10px] mt-1.5 max-w-sm font-sans">
                      Click the "Generate Smart AI Forecast" button to let the Gemini model evaluate stock levels and forecast demand.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/*               BARCODE STICKERS & QR SCANNER              */}
      {/* ======================================================== */}
      {activeTab === "barcode_qr" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Scanner Simulator & product info lookup */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5 font-sans">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <QrCode size={16} className="text-blue-500" />
                  Real-time Scan Simulator
                </h3>
                <p className="text-[10px] text-slate-400">Type a product code or name to simulate laser gun scanning.</p>
              </div>

              <form onSubmit={handleBarcodeScanSimulate} className="space-y-3 font-sans">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Scan Product Code or Name</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. med_coartem, Coartem, Ventolin..."
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-850"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Scan Gun
                    </button>
                  </div>
                </div>
              </form>

              {scannedMed ? (
                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-750 text-[9px] font-bold rounded-md uppercase font-bold">Matched profile</span>
                      <h4 className="text-sm font-extrabold text-slate-800 mt-1">{scannedMed.name}</h4>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{scannedMed.genericName}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-900 bg-white border p-1.5 rounded-lg px-2.5">
                      Stock: <span className={scannedMed.stock < scannedMed.reorderLevel ? "text-rose-600 animate-pulse font-extrabold" : "text-emerald-600"}>{scannedMed.stock}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[10px] text-slate-600 font-sans border-t border-slate-150 pt-3">
                    <div>
                      <p className="font-bold text-slate-500">SHELF LOCATION:</p>
                      <p className="font-bold text-slate-900 mt-0.5">{scannedMed.shelfLocation || "Unassigned"}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-500">RETAIL BARS PRICE:</p>
                      <p className="font-bold text-emerald-700 mt-0.5">₦{scannedMed.sellingPrice.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-3 text-center space-y-2">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Simulated Dynamic Barcode Sticker</p>
                    <div className="bg-white p-3 border border-slate-200 rounded-lg flex flex-col items-center justify-center space-y-1.5 shadow-sm max-w-[240px] mx-auto">
                      <p className="text-[10px] font-bold text-slate-900 font-mono truncate">{scannedMed.name}</p>
                      
                      {/* Fake stylized barcode graphic line cells */}
                      <div className="flex h-10 w-full items-stretch justify-center gap-0.5">
                        <div className="w-1.5 bg-slate-900" />
                        <div className="w-px bg-slate-900" />
                        <div className="w-0.5 bg-slate-900" />
                        <div className="w-2.5 bg-slate-900" />
                        <div className="w-px bg-slate-900" />
                        <div className="w-2 bg-slate-900" />
                        <div className="w-1 bg-slate-900" />
                        <div className="w-px bg-slate-900" />
                        <div className="w-1.5 bg-slate-900" />
                        <div className="w-0.5 bg-slate-900" />
                        <div className="w-2 bg-slate-900" />
                        <div className="w-px bg-slate-900" />
                      </div>

                      <p className="text-[9px] font-mono text-slate-500 tracking-wider font-bold">*{gBarcode}*</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-405 py-12">
                  <QrCode size={24} className="mx-auto text-slate-300 mb-2 font-bold" />
                  <p className="font-bold text-slate-500">Scanner Beam Offline</p>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-[180px] mx-auto">Scan or enter product values to view direct medicine telemetry.</p>
                </div>
              )}
            </div>

            {/* Right Column: Sticker Grid Sheet Generator */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between font-sans">
              <div>
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Printable UPC/EAN Barcode Sticker Generator</h3>
                    <p className="text-[10px] text-slate-400">Generate sheets of retail barcode stickers formatted for standard printers.</p>
                  </div>
                  <button 
                    onClick={() => {
                      onAddActivityLog("Report Export", `Printed bulk sticker sheet for category: ${bulkBarcodeCategory}`);
                      window.print();
                    }}
                    className="p-1 px-3 bg-slate-900 text-white rounded-lg text-xs hover:bg-slate-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Printer size={12} />
                    Print Sticker Sheet
                  </button>
                </div>

                <div className="flex gap-3 my-3">
                  <label className="text-[10px] uppercase font-bold text-slate-500 flex items-center">Filter Category:</label>
                  <select 
                    value={bulkBarcodeCategory} 
                    onChange={(e) => setBulkBarcodeCategory(e.target.value)}
                    className="text-xs p-1 px-2.5 bg-slate-100 border rounded-lg focus:outline-none"
                  >
                    <option value="all">All Drug Categories</option>
                    <option value="Antimalarial">Antimalarial</option>
                    <option value="Analgesics">Analgesics</option>
                    <option value="Antibiotics">Antibiotics</option>
                    <option value="Cardiovascular">Cardiovascular</option>
                  </select>
                </div>

                {/* Grid sheet container */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[360px] overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {medicines.filter(m => bulkBarcodeCategory === "all" || m.category === bulkBarcodeCategory).map(m => {
                    const stickerCode = m.storeLocation.split(" ")[1] || `EAN-${m.id.replace("med_", "902")}`;
                    return (
                      <div key={m.id} className="bg-white border rounded-lg p-2.5 flex flex-col items-center justify-center space-y-1 shadow-sm text-center">
                        <p className="text-[9px] font-bold text-slate-900 truncate max-w-full font-mono">{m.name}</p>
                        
                        <div className="flex h-6 w-full items-stretch justify-center gap-0.5 opacity-80">
                          <div className="w-1 bg-slate-900" />
                          <div className="w-0.5 bg-slate-900" />
                          <div className="w-2 bg-slate-900" />
                          <div className="w-px bg-slate-900" />
                          <div className="w-1 bg-slate-900" />
                          <div className="w-px bg-slate-900" />
                          <div className="w-1.5 bg-slate-900" />
                          <div className="w-0.5 bg-slate-900" />
                          <div className="w-2.5 bg-slate-900" />
                        </div>

                        <p className="text-[8px] font-mono text-slate-500 tracking-tight font-semibold">{stickerCode}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center gap-3">
                <span className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                  <QrCode size={15} />
                </span>
                <p className="text-[10px] text-slate-600 leading-relaxed font-sans">
                  <strong>QR Product lookup:</strong> Customers scan sticker QR tags with mobile terminals to view expiry clearance details & interactions on patient app.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/*             WHATSAPP INVOICE & ALERTS DISPATCH           */}
      {/* ======================================================== */}
      {activeTab === "whatsapp" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left template select cards */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 font-sans">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-800">Operational Dispatch Templates</h3>
                <p className="text-[10px] text-slate-400">Rapid dispatch configurations to notify customers, managers or stock teams.</p>
              </div>

              <div className="space-y-3">
                {/* Temp 1: Invoice Receipt */}
                <button
                  onClick={() => {
                    setWaPhone("+234 801 234 5678");
                    setWaMsg(`*${businessSettings.businessName} RECEIPT FOR CUSTOMER*\nInvoice Ref: ${businessSettings.invoicePrefix}78491\nDate: 2026-06-11\nTotal Refined: ${businessSettings.currency}14,500.00\nStatus: PAID VIA TRANSFER\nAll prescription refills packaged. Thank you!`);
                  }}
                  className="w-full text-left p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-xs flex justify-between items-center cursor-pointer"
                >
                  <div>
                    <p className="font-bold text-slate-800">📄 POS Customer Invoice</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Prefills invoice payment confirmation receipt</p>
                  </div>
                  <span className="text-[9px] bg-slate-100 p-1 px-2 font-mono font-bold rounded text-slate-500">LOAD</span>
                </button>

                {/* Temp 2: Low Stock Supplier */}
                <button
                  onClick={() => {
                    const firstLow = medicines.find(m => m.stock <= m.reorderLevel) || medicines[0];
                    setWaPhone("+234 809 300 1199");
                    setWaMsg(`*URGENT STOCK REORDER* - To: Emzor Pharma Supply Division\nFrom: ${businessSettings.businessName}\nWe require replenishment of: \n- ${firstLow?.name} (Require: 50 cases)\nSend invoice proposal to ${businessSettings.email}.`);
                  }}
                  className="w-full text-left p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-xs flex justify-between items-center cursor-pointer"
                >
                  <div>
                    <p className="font-bold text-slate-800">📦 Low Stock Refill Request</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Prefills supplier stock reorder notification</p>
                  </div>
                  <span className="text-[9px] bg-slate-100 p-1 px-2 font-mono font-bold rounded text-slate-500">LOAD</span>
                </button>

                {/* Temp 3: Expiry Risk warning */}
                <button
                  onClick={() => {
                    const expMed = medicines.find(m => {
                      const exp = new Date(m.expiryDate);
                      return exp < new Date();
                    }) || medicines[1];
                    setWaPhone("+234 802 444 8812");
                    setWaMsg(`*CRITICAL EXPRY WARING ALERT*\nTo Area Regional Manager\nDrug: ${expMed?.name} [Expiry: ${expMed?.expiryDate}] is identified in regional warehouse. Please isolate for corporate return protocols.`);
                  }}
                  className="w-full text-left p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-xs flex justify-between items-center cursor-pointer"
                >
                  <div>
                    <p className="font-bold text-slate-800">⚠️ Drug Expiry Danger Log</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Alerts supervisor about expired products</p>
                  </div>
                  <span className="text-[9px] bg-slate-100 p-1 px-2 font-mono font-bold rounded text-slate-500">LOAD</span>
                </button>
              </div>
            </div>

            {/* Right mockup phone screen */}
            <div className="lg:col-span-8 bg-slate-100 border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-center font-sans">
              <div className="w-full max-w-[420px] bg-[#E5DDD5] border-8 border-slate-900 rounded-[36px] shadow-2xl relative overflow-hidden flex flex-col h-[520px]">
                
                {/* Phone Speaker & Camera Notch */}
                <div className="absolute top-0 inset-x-0 h-6 z-50 flex items-center justify-center">
                  <div className="w-24 h-4 bg-slate-900 rounded-b-xl" />
                </div>

                {/* Phone WhatsApp Header */}
                <div className="bg-[#075E54] text-white p-4 pt-10 flex items-center gap-3 shadow z-20">
                  <div className="w-8 h-8 rounded-full bg-slate-150 text-[#075E54] flex items-center justify-center font-bold font-mono text-sm shadow">
                    PE
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold flex items-center gap-1">
                      PharmERP WhatsApp Gateway
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                    </h4>
                    <span className="text-[9px] text-emerald-100 font-mono font-bold">API CORE PROTOCOL SYNCED</span>
                  </div>
                </div>

                {/* Messenger Thread body */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 flex flex-col-reverse relative z-10 scrollbar-thin">
                  {/* Render messages in reverse list direction */}
                  {[...waLogs].reverse().map((log, index) => {
                    const isUser = log.sender === "user";
                    return (
                      <div key={index} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                        <div className={`p-2.5 max-w-[85%] rounded-lg shadow-sm text-xs relative ${isUser ? "bg-[#DCF8C6] text-slate-900 rounded-tr-none" : "bg-white text-slate-800 rounded-tl-none"}`}>
                          <p className="whitespace-pre-wrap leading-relaxed font-sans">{log.text}</p>
                          <span className="text-[8px] text-slate-400 font-mono block text-right mt-1.5">{log.time} {isUser && "✓✓"}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Messaging Controls Tray at bottom */}
                <form onSubmit={handleDispatchWhatsApp} className="p-3 bg-[#F0F0F0] border-t border-slate-200 flex items-center gap-2 relative z-20">
                  <div className="flex-1 bg-white rounded-full px-3 py-1.5 border border-slate-200 flex flex-col gap-1">
                    <input
                      type="text"
                      placeholder="Destination Ticker, e.g. +234..."
                      value={waPhone}
                      onChange={(e) => setWaPhone(e.target.value)}
                      className="text-[9px] text-[#075E54] font-mono font-bold placeholder-slate-400 bg-transparent py-0 focus:outline-none border-b border-dashed border-slate-200"
                    />
                    <input
                      type="text"
                      placeholder="Type secure WhatsApp message..."
                      value={waMsg}
                      onChange={(e) => setWaMsg(e.target.value)}
                      className="text-xs text-slate-800 bg-transparent border-none py-1 focus:outline-none focus:ring-0 placeholder-slate-400"
                    />
                  </div>
                  <button
                    type="submit"
                    className="p-3 rounded-full bg-[#075E54] hover:bg-[#054c44] text-white shadow font-bold cursor-pointer transition-colors"
                  >
                    <Send size={15} />
                  </button>
                </form>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/*                    SUPER ADMIN AREA                      */}
      {/* ======================================================== */}
      {activeTab === "admin" && (
        <div className="space-y-6">
          
          {/* Sub Tab selection rails */}
          <div className="flex border-b border-slate-200 pb-2 gap-4 overflow-x-auto text-xs font-bold no-scrollbar">
            <button 
              onClick={() => { setAdminSubTab("users"); setRoleErrorMsg(""); setRoleSuccessMsg(""); }}
              className={`pb-1.5 transition-all text-left px-1 flex items-center gap-1 border-b-2 cursor-pointer ${adminSubTab === "users" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-800"}`}
            >
              👤 Employee Directory
            </button>
            <button 
              onClick={() => { setAdminSubTab("roles"); setRoleErrorMsg(""); setRoleSuccessMsg(""); }}
              className={`pb-1.5 transition-all text-left px-1 flex items-center gap-1 border-b-2 cursor-pointer ${adminSubTab === "roles" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-800"}`}
            >
              🛡️ RBAC Authorization Matrix
            </button>
            <button 
              onClick={() => { setAdminSubTab("business"); setRoleErrorMsg(""); setRoleSuccessMsg(""); }}
              className={`pb-1.5 transition-all text-left px-1 flex items-center gap-1 border-b-2 cursor-pointer ${adminSubTab === "business" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-800"}`}
            >
              🏢 Enterprise Settings
            </button>
            <button 
              onClick={() => { setAdminSubTab("saas"); setRoleErrorMsg(""); setRoleSuccessMsg(""); }}
              className={`pb-1.5 transition-all text-left px-1 flex items-center gap-1 border-b-2 cursor-pointer ${adminSubTab === "saas" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-800"}`}
            >
              ⛓️ SaaS Subscription Hub
            </button>
          </div>

          {/* SUBTAB 1 - USERS MANAGEMENT CONSOLE */}
          {adminSubTab === "users" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn font-sans">
              
              {/* User credentials setup Form */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-xs uppercase font-extrabold text-slate-500 flex items-center gap-1.5">
                    <UserCheck size={14} className="text-emerald-500" />
                    Provision Security Login
                  </h3>
                  <p className="text-[10px] text-slate-450 mt-1">Configure valid credentials for cashiers or branch pharmacists.</p>
                </div>

                {errorMsg && <p className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold">{errorMsg}</p>}
                {successMsg && <p className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-semibold">{successMsg}</p>}

                <form onSubmit={handleCreateUserSubmit} className="space-y-3">
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Username ID</label>
                    <input
                      type="text"
                      placeholder="e.g. funmi_alao"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Secret Access Password</label>
                    <input
                      type="password"
                      placeholder="e.g. funmi123"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Access Clearance Level</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as any)}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold"
                    >
                      {roles.map(r => (
                        <option key={r.name} value={r.name}>🛡️ {r.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Assigned Branch Outlet</label>
                    <select
                      value={newBranchId}
                      onChange={(e: any) => setNewBranchId(e.target.value)}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    >
                      <option value="all">🌐 All Branches (Global Access)</option>
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name} ({b.location.split(",")[0]})</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold p-2.5 rounded-xl text-xs transition-colors cursor-pointer mt-4"
                  >
                    Create Security User Account
                  </button>

                </form>
              </div>

              {/* User Directory Table list */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="text-xs uppercase font-extrabold text-slate-500">
                      System-wide Operator Accounts
                    </h3>
                    <p className="text-[10px] text-slate-450 mt-1">Supervise assigned parameters and simulate terminals active sessions.</p>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-100">
                    {users.length} registered terminals
                  </span>
                </div>

                <div className="overflow-x-auto font-sans">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                        <th className="px-4 py-2.5">User Handle</th>
                        <th className="px-4 py-2.5">Security role clearance</th>
                        <th className="px-4 py-2.5">Assigned outlet</th>
                        <th className="px-4 py-2.5">Created Date</th>
                        <th className="px-4 py-2.5">Status</th>
                        <th className="px-4 py-2.5 text-right">Console actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {users.map(u => {
                        const branchName = u.branchId === "all" ? "All Outlets" : (branches.find(b => b.id === u.branchId)?.name || u.branchId);
                        const isSimulatedActive = currentUser.username === u.username;
                        return (
                          <tr key={u.id} className={`hover:bg-slate-50 ${isSimulatedActive ? "bg-emerald-500/5 font-semibold" : ""}`}>
                            <td className="px-4 py-2.5 font-mono text-slate-800 flex items-center gap-1.5 pt-3">
                              <span className={`w-2 h-2 rounded-full ${u.status === "Active" ? "bg-emerald-500" : "bg-rose-500"}`} />
                              {u.username}
                            </td>
                            <td className="px-4 py-2.5">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md uppercase">
                                {u.role}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-slate-600 font-medium">{branchName}</td>
                            <td className="px-4 py-2.5 text-slate-400 font-mono text-[10px]">{u.createdAt}</td>
                            <td className="px-4 py-2.5 font-bold">
                              <button
                                onClick={() => {
                                  onToggleUserStatus(u.id);
                                  onAddActivityLog("User Management", `Toggled status for credentials node: ${u.username}`);
                                }}
                                className="text-slate-500 hover:text-slate-900 transition-colors"
                                title="Toggle Active/Suspended status"
                              >
                                {u.status === "Active" ? (
                                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                                    <ToggleRight size={16} /> Active
                                  </span>
                                ) : (
                                  <span className="text-rose-700 font-bold flex items-center gap-1">
                                    <ToggleLeft size={16} /> Suspended
                                  </span>
                                )}
                              </button>
                            </td>
                            <td className="px-4 py-2.5 text-right space-x-1.5 font-sans">
                              {editingUserId === u.id ? (
                                <div className="inline-flex items-center gap-1">
                                  <input
                                    type="text"
                                    placeholder="New Password"
                                    value={tempPassword}
                                    onChange={(e) => setTempPassword(e.target.value)}
                                    className="p-1 text-[11px] bg-white border border-slate-300 rounded max-w-[100px]"
                                  />
                                  <button
                                    onClick={() => handleResetPassword(u.id)}
                                    className="bg-slate-900 text-white font-bold p-1 rounded hover:bg-slate-800 text-[10px]"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingUserId(null)}
                                    className="text-slate-400 text-[10px]"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleSimulateLogin(u)}
                                    disabled={u.status === "Suspended" || isSimulatedActive}
                                    className={`inline-flex items-center gap-1 p-1 px-2 rounded-lg text-[10px] font-bold ${
                                      isSimulatedActive 
                                        ? "bg-emerald-500 text-white border border-emerald-600"
                                        : u.status === "Suspended"
                                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                        : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                                    }`}
                                    title="Swaps active session to simulate transactions done under this user"
                                  >
                                    <Play size={10} />
                                    {isSimulatedActive ? "Simulating" : "Simulate As"}
                                  </button>
                                  <button
                                    onClick={() => { setEditingUserId(u.id); setTempPassword(""); }}
                                    className="p-1 bg-slate-100 hover:bg-slate-250 text-slate-600 border border-slate-200 rounded-lg inline-flex items-center [padding:4px]"
                                    title="Reset password"
                                  >
                                    <Key size={11} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if(confirm(`Are you absolutely sure you want to permanently delete user [${u.username}]? This is irreversible.`)) {
                                        onDeleteUser(u.id);
                                      }
                                    }}
                                    disabled={isSimulatedActive}
                                    className={`p-1 border text-rose-600 rounded-lg inline-flex items-center [padding:4px] ${isSimulatedActive ? "border-slate-100 text-slate-300 cursor-not-allowed" : "border-rose-100 hover:bg-rose-50"}`}
                                    title="Delete user profile"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          )}

          {/* SUBTAB 2 - DYNAMIC RBAC ROLE & PERMISSION MATRIX */}
          {adminSubTab === "roles" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn font-sans">
              
              {/* Custom Roles & Clones Panel */}
              <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
                <div className="border-b border-slate-150 pb-2">
                  <h4 className="text-xs uppercase font-extrabold text-slate-500">Credentials Archetypes</h4>
                  <p className="text-[10px] text-slate-450 mt-1">Create completely custom roles or clone an existing role blueprint.</p>
                </div>

                {roleSuccessMsg && <p className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold">{roleSuccessMsg}</p>}
                {roleErrorMsg && <p className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-semibold">{roleErrorMsg}</p>}

                {/* Create Custom Role form */}
                <form onSubmit={handleCreateCustomRole} className="space-y-3 pb-4 border-b border-slate-100">
                  <h5 className="text-[11px] font-bold text-slate-700">➕ Create Custom Security Role</h5>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Intern Pharmacist"
                      value={customRoleName}
                      onChange={(e) => setCustomRoleName(e.target.value)}
                      className="flex-1 text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold p-2 px-3.5 text-xs rounded-lg cursor-pointer"
                    >
                      Create
                    </button>
                  </div>
                </form>

                {/* Clone Role Row */}
                <form onSubmit={handleCloneRole} className="space-y-3 font-sans">
                  <h5 className="text-[11px] font-bold text-slate-700">📋 Clone Current Selected Role</h5>
                  <div className="p-3 bg-slate-50 border rounded-xl space-y-2 text-xs">
                    <p className="text-[10px] text-slate-500">Create duplicate of <span className="font-bold underline text-slate-800">"{selectedRoleName}"</span> permissions tier.</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Senior Manager"
                        value={cloneRoleName}
                        onChange={(e) => setCloneRoleName(e.target.value)}
                        className="flex-1 text-xs p-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 px-3 text-xs rounded-lg cursor-pointer"
                      >
                        Clone
                      </button>
                    </div>
                  </div>
                </form>

                {/* Roles list */}
                <div className="space-y-2 font-sans">
                  <h5 className="text-[11px] font-bold text-slate-700">Rosters of Roles Archive</h5>
                  <div className="flex flex-wrap gap-1.5 p-1 bg-slate-50 border rounded-xl max-h-[160px] overflow-y-auto">
                    {roles.map(r => (
                      <div 
                        key={r.name} 
                        className={`p-1 px-2.5 text-[10px] font-extrabold rounded-lg flex items-center gap-1.5 border cursor-pointer select-none transition-all ${selectedRoleName === r.name ? "bg-slate-900 text-white border-slate-900 shadow-sm" : "bg-white text-slate-500 hover:text-slate-800 border-slate-100"}`}
                        onClick={() => setSelectedRoleName(r.name)}
                      >
                        <span>{selectedRoleName === r.name ? "🟢" : "⚪"} {r.name}</span>
                        {!r.isSystem && (
                          <button 
                            type="button" 
                            onClick={(e) => {
                              e.stopPropagation();
                              if(confirm(`Completely delete custom roles matrix and users assigned to [${r.name}]?`)) {
                                handleDeleteRole(r.name);
                              }
                            }}
                            className="text-rose-600 hover:text-rose-900 text-xs font-bold font-sans ml-1"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Security Authorization Grid Matrix column */}
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 font-sans">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Authorization Matrix Grid Index
                    </h3>
                    <p className="text-[10px] text-slate-450">Configure parameters accessible by selected credential: <span className="font-extrabold text-[#075E54] bg-[#DCF8C6]/30 px-1 rounded">"{selectedRoleName}"</span>.</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b text-[10px] uppercase font-bold text-slate-500">
                        <th className="px-5 py-3">Module parameter</th>
                        <th className="px-5 py-3">Key scope permission</th>
                        <th className="px-5 py-3 text-center">Cleared State Status</th>
                        <th className="px-5 py-3 text-right">Interactions toggle</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {roles.find(r => r.name === selectedRoleName) ? (
                        Object.keys(roles.find(r => r.name === selectedRoleName)!.permissions).map(moduleKey => {
                          const hasClr = (roles.find(r => r.name === selectedRoleName)!.permissions as any)[moduleKey] === true;
                          return (
                            <tr key={moduleKey} className="hover:bg-slate-50/50">
                              <td className="px-5 py-3 font-semibold text-slate-800 capitalize">{moduleKey}</td>
                              <td className="px-5 py-3 text-slate-400 text-[10px] font-mono capitalize">module.{moduleKey}.read_write_execute</td>
                              <td className="px-5 py-3 text-center font-bold">
                                {hasClr ? (
                                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] rounded-md border border-emerald-100">AUTHORIZED</span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] rounded-md border border-rose-100">LOCKED</span>
                                )}
                              </td>
                              <td className="px-5 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handlePermissionToggle(moduleKey as any)}
                                  className="text-xs transition-opacity hover:opacity-80 rounded-lg p-1"
                                >
                                  {hasClr ? (
                                    <span className="text-emerald-600 font-extrabold flex items-center gap-1 inline-flex justify-end">
                                      <ToggleRight size={20} /> Clear
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 font-extrabold flex items-center gap-1 inline-flex justify-end">
                                      <ToggleLeft size={20} /> Restrict
                                    </span>
            )}
            {reportType === "sales" && (subReportProfile === "transaction-details" || subReportProfile === "ledger") && (() => {
              const totals = filteredSalesTransactionsFiltered.reduce((acc: any, tx: any) => {
                acc.totalQty += tx.quantity;
                acc.totalCost += tx.totalCostPrice;
                acc.totalSell += tx.totalSellingPrice;
                acc.totalDiscount += tx.discount;
                acc.totalNett += tx.balanceAfterDiscount;
                acc.totalProfit += tx.profit;
                return acc;
              }, { totalQty: 0, totalCost: 0, totalSell: 0, totalDiscount: 0, totalNett: 0, totalProfit: 0 });
              return (
                <div className="bg-slate-50 border-t-2 border-slate-300 p-4 space-y-2">
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">TOTAL QTY SOLD</span>
                      <span className="font-extrabold text-slate-900 text-sm">{totals.totalQty.toLocaleString()} units</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">TOTAL COST VALUE</span>
                      <span className="font-extrabold text-slate-900 text-sm">₦{totals.totalCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">TOTAL SELL VALUE</span>
                      <span className="font-extrabold text-emerald-700 text-sm">₦{totals.totalSell.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">TOTAL DISCOUNT</span>
                      <span className="font-extrabold text-rose-600 text-sm">-₦{totals.totalDiscount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">TOTAL NET SALES</span>
                      <span className="font-extrabold text-blue-700 text-sm">₦{totals.totalNett.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">TOTAL PROFIT</span>
                      <span className={`font-extrabold text-sm ${totals.totalProfit >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                        {totals.totalProfit >= 0 ? "+" : ""}₦{totals.totalProfit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 border-t border-slate-200 pt-2">
                    Based on {filteredSalesTransactionsFiltered.length} medicine line items from {new Set(filteredSalesTransactionsFiltered.map((t: any) => t.invoiceNumber)).size} unique invoice(s)
                    {filterBranchId !== "all" && ` at ${branches.find(b => b.id === filterBranchId)?.name || filterBranchId}`}
                    {" "} | Period: {dateFrom} to {dateTo}
                  </div>
                </div>
              );
            })()}

                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-slate-400">Loading dynamic permissions...</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[10px] text-slate-500 leading-relaxed font-sans">
                  🔒 <strong>Operational Matrix Lock:</strong> "Super Admin" clearance cannot be modified in critical modules to prevent absolute system lockout. Changes are written directly on live sandbox configurations and logged under audit ledger.
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 3 - ENTERPRISE BUSINESS DETAILS SETTINGS */}
          {adminSubTab === "business" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn font-sans">
              
              {/* Form Config Block */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-800">Enterprise Registry Parameters</h3>
                  <p className="text-[10px] text-slate-400">Manage company name, taxation registration, currency codes, and custom invoice prefixes.</p>
                </div>

                <form onSubmit={handleSaveBusinessSettings} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Corporate Legal Name</label>
                      <input 
                        type="text" 
                        value={bizName} 
                        onChange={(e) => setBizName(e.target.value)} 
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Logo Text Indicator</label>
                      <input 
                        type="text" 
                        value={bizLogoText} 
                        onChange={(e) => setBizLogoText(e.target.value)} 
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Support Ticker Phone</label>
                      <input 
                        type="text" 
                        value={bizPhone} 
                        onChange={(e) => setBizPhone(e.target.value)} 
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Support Email Ticker</label>
                      <input 
                        type="email" 
                        value={bizEmail} 
                        onChange={(e) => setBizEmail(e.target.value)} 
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Web Domain Ticker</label>
                      <input 
                        type="text" 
                        value={bizWebsite} 
                        onChange={(e) => setBizWebsite(e.target.value)} 
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Federal Tax ID (TIN / VAT)</label>
                      <input 
                        type="text" 
                        value={bizTaxNumber} 
                        onChange={(e) => setBizTaxNumber(e.target.value)} 
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Regional Currency Token</label>
                      <select 
                        value={bizCurrency} 
                        onChange={(e) => setBizCurrency(e.target.value)} 
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold"
                      >
                        <option value="₦">Nigerian Naira (₦)</option>
                        <option value="$">US Dollar ($)</option>
                        <option value="€">Euro (€)</option>
                        <option value="£">Great British Pound (£)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Billing Invoice Prefix</label>
                      <input 
                        type="text" 
                        value={bizPrefix} 
                        onChange={(e) => setBizPrefix(e.target.value)} 
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Headquarters Street Address</label>
                    <input 
                      type="text" 
                      value={bizAddress} 
                      onChange={(e) => setBizAddress(e.target.value)} 
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Receipt Default Footer Notice</label>
                    <textarea 
                      rows={2}
                      value={bizFooter} 
                      onChange={(e) => setBizFooter(e.target.value)} 
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-slate-900 border hover:bg-slate-800 text-white font-bold p-3 rounded-lg text-xs cursor-pointer shadow-sm mt-3"
                  >
                    Save Business Global Configuration Changes
                  </button>
                </form>
              </div>

              {/* Dynamic POS receipt Layout Preview */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between font-sans">
                <div>
                  <div className="border-b border-slate-100 pb-2 mb-3">
                    <h4 className="text-xs uppercase font-extrabold text-slate-500">Dynamic Invoice Preview</h4>
                    <p className="text-[10px] text-slate-450">A live sample of printed POS tickets mapped with current business settings.</p>
                  </div>

                  {/* Tiny mock-up receipts */}
                  <div className="border border-slate-305 p-4 rounded-md bg-[#FAF9F5] font-mono text-[9px] text-slate-700 space-y-3 shadow max-w-[280px] mx-auto relative overflow-hidden">
                    <div className="text-center space-y-1 border-b border-dashed border-slate-300 pb-2">
                      <p className="font-extrabold text-slate-900 text-xs">{bizLogoText}</p>
                      <p className="font-bold text-[8px] uppercase">{bizName}</p>
                      <p className="text-slate-400 text-[7px] leading-tight mt-0.5">{bizAddress}</p>
                      <p className="text-slate-400 text-[7px]">{bizPhone}</p>
                    </div>

                    <div className="space-y-1 border-b border-dashed border-slate-300 pb-2">
                      <p className="font-bold">INVOICE: {bizPrefix}093512</p>
                      <p>CASHIER ID: admin_jadan</p>
                      <p>PATIENT: Walk-in Client</p>
                    </div>

                    <div className="space-y-1 border-b border-dashed border-slate-300 pb-2">
                      <div className="flex justify-between">
                        <span>Coartem 80/480mg (x2)</span>
                        <span>{bizCurrency}5,600.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Panadol extra (x4)</span>
                        <span>{bizCurrency}2,400.00</span>
                      </div>
                    </div>

                    <div className="space-y-[2px] font-bold">
                      <div className="flex justify-between">
                        <span>SUBTOTAL</span>
                        <span>{bizCurrency}8,000.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>VAT (0.00%)</span>
                        <span>{bizCurrency}0.00</span>
                      </div>
                      <div className="flex justify-between text-slate-900 font-extrabold border-t border-dotted border-slate-400 pt-1.5 text-[10px]">
                        <span>TOTAL PAID</span>
                        <span>{bizCurrency}8,000.00</span>
                      </div>
                    </div>

                    <div className="text-center pt-2 leading-relaxed border-t border-dashed border-slate-300 text-[7px] text-slate-450 italic">
                      {bizFooter}
                    </div>

                    {/* Fake barcode stripes on ticket */}
                    <div className="flex flex-col items-center justify-center pt-2 space-y-[2px] opacity-75">
                      <div className="flex h-4 w-28 gap-[1px]">
                        <div className="w-1 bg-slate-700" />
                        <div className="w-px bg-slate-700" />
                        <div className="w-0.5 bg-slate-700" />
                        <div className="w-1.5 bg-slate-700" />
                        <div className="w-px bg-slate-700" />
                        <div className="w-1 bg-slate-700" />
                      </div>
                      <span className="text-[6px] text-slate-400">*{bizPrefix}093512*</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-lg mt-4 border border-slate-100 text-[10px] text-slate-500 font-sans leading-relaxed">
                  💡 <strong>Receipt cohesion:</strong> These parameters are integrated into the primary POS checkout modules and automatic WhatsApp dispatcher alerts.
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 4 - SAAS CUSTOMER SUBSCRIPTION & TENANT CONSOLE */}
          {adminSubTab === "saas" && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5 animate-fadeIn font-sans">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between font-sans">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Company Tenants Console</h3>
                  <p className="text-[10px] text-slate-400">Simulate and Switch company tenants environments with backwards records compatibility.</p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-100 uppercase">
                  Enterprise Diamond Suite (99.9% LMS)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-3 font-sans">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">ACTIVE COMPANY TENANT</p>
                  <p className="text-xs font-bold text-slate-800 mt-1 truncate">{currentTenantCompany.split("(")[0]}</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">TENANT IDENTIFIER SUB-DOMAIN</p>
                  <p className="text-xs font-bold text-slate-800 mt-1 font-mono">jadanexpress.pharm.erp</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">BILLING SUBSCRIPTION CYCLE</p>
                  <p className="text-xs font-bold text-slate-800 mt-1">Annual Renewal - June 11, 2027</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">SYNCHRONIZED COMPANIES</p>
                  <p className="text-xs font-extrabold text-[#075E54] mt-1">3 Active Companies</p>
                </div>
              </div>

              <div className="space-y-3 pt-2 font-sans-sans">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest font-sans">Company Switch Sandbox Simulator</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                  PharmERP supports multiple synced company profiles. Use the switcher below to swap active workspace directory context instantaneously.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                  {/* Company 1 */}
                  <div 
                    onClick={() => {
                      setCurrentTenantCompany("Jadan Express Pharmacy Group Ltd (Lagos Headquarters)");
                      onAddActivityLog("Authentication", "Swapped active SaaS workspace tenant context to Lagos Headquarters.");
                      alert("Tenant Swapped! Live medicine list and valuation ledger synchronized to [Lagos Plaza HQ Corp].");
                    }}
                    className={`p-4 border rounded-xl cursor-pointer hover:shadow-md transition-all select-none space-y-2 ${currentTenantCompany.includes("Lagos") ? "border-[#075E54] bg-[#DCF8C6]/15 text-[#075E54]" : "border-slate-200 bg-white"}`}
                  >
                    <div className="flex justify-between items-center text-sans">
                      <span className="text-[10px] font-extrabold uppercase">LAGOS MAIN HQ</span>
                      {currentTenantCompany.includes("Lagos") && <span className="text-xs font-bold font-sans">✓ Active</span>}
                    </div>
                    <p className="text-xs font-extrabold text-slate-800 font-sans">Jadan Express HQ Ltd</p>
                    <p className="text-[9px] text-slate-400 truncate font-sans">Plot 14, Commercial Lane, Lagos</p>
                  </div>

                  {/* Company 2 */}
                  <div 
                    onClick={() => {
                      setCurrentTenantCompany("Al-Razaq Pharmacy & Vaccine Hub (Kano Outlet)");
                      onAddActivityLog("Authentication", "Swapped active SaaS workspace tenant context to Kano vaccines branch.");
                      alert("Tenant Swapped! Live medicine list and valuation ledger synchronized to [Al-Razaq Kano Vaccines Central].");
                    }}
                    className={`p-4 border rounded-xl cursor-pointer hover:shadow-md transition-all select-none space-y-2 ${currentTenantCompany.includes("Kano") ? "border-[#075E54] bg-[#DCF8C6]/15 text-[#075E54]" : "border-slate-200 bg-white"}`}
                  >
                    <div className="flex justify-between items-center text-sans">
                      <span className="text-[10px] font-extrabold uppercase">KANO REEFER HUB</span>
                      {currentTenantCompany.includes("Kano") && <span className="text-xs font-bold font-sans">✓ Active</span>}
                    </div>
                    <p className="text-xs font-extrabold text-slate-800 font-sans">Al-Razaq Vaccine Hub</p>
                    <p className="text-[9px] text-slate-400 truncate font-sans font-sans">Maiduguri Road, Kano State, Nigeria</p>
                  </div>

                  {/* Company 3 */}
                  <div 
                    onClick={() => {
                      setCurrentTenantCompany("Garki Clinical Care Pharmacy (Abuja Center)");
                      onAddActivityLog("Authentication", "Swapped active SaaS workspace tenant context to Abuja Care clinic.");
                      alert("Tenant Swapped! Live medicine list and valuation ledger synchronized to [Abuja Garki Care Clinic].");
                    }}
                    className={`p-4 border rounded-xl cursor-pointer hover:shadow-md transition-all select-none space-y-2 ${currentTenantCompany.includes("Abuja") ? "border-[#075E54] bg-[#DCF8C6]/15 text-[#075E54]" : "border-slate-200 bg-white"}`}
                  >
                    <div className="flex justify-between items-center text-sans">
                      <span className="text-[10px] font-extrabold uppercase">ABUJA CLINIC</span>
                      {currentTenantCompany.includes("Abuja") && <span className="text-xs font-bold font-sans">✓ Active</span>}
                    </div>
                    <p className="text-xs font-extrabold text-slate-800 font-sans">Garki Clinical Care</p>
                    <p className="text-[9px] text-slate-400 truncate font-sans">Wuse District Garki, FCT Abuja</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ======================================================== */}
      {/*                    LIVE AUDIT LEDGER                     */}
      {/* ======================================================== */}
      {activeTab === "logs" && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs uppercase font-extrabold text-slate-500 flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-emerald-500 animate-pulse" />
                Real-time System Audit Ledger Trails
              </h3>
              <p className="text-[10px] text-slate-450 mt-1">
                Nigeria Cyber Pharmacy Crime Compliance (AES-256 local encrypted stream logs).
              </p>
            </div>
            <button
              onClick={() => {
                if(confirm("Are you sure you want to completely clear activity logs history? This is irreversible.")) {
                  onClearLogs();
                }
              }}
              className="px-3 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold rounded-lg text-xs transition-all cursor-pointer"
            >
              Clear Logs Trails
            </button>
          </div>

          {/* Search bar & Type Filter */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2.5 text-slate-400">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Search logs by operator keyword, detail message, role..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="w-full text-xs p-2 pl-9 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <div className="w-full md:w-48">
              <select
                value={logActionType}
                onChange={(e) => setLogActionType(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="all">🌐 All Action Categories</option>
                <option value="Authentication">Authentication</option>
                <option value="POS Sale">POS Sales</option>
                <option value="Stock Adjustment">Stock Adjustments</option>
                <option value="Product Catalog">Product Catalog</option>
                <option value="Finance Entry">Finance Entry</option>
                <option value="User Management">User Management</option>
                </select>
              </div>

              {/* Branch Constraint */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight block">Target Branch</label>
                <select
                  value={filterBranchId}
                  onChange={(e) => setFilterBranchId(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="all">🌐 All Area Branches (Combined)</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.location.split(",")[0]})</option>
                  ))}
                </select>
              </div>

              {/* Date From */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight block">Date From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              {/* Date To */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight block">Date To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
            </div>

            {/* Advanced Filters Row - Only for Transaction Details */}
            {(reportType === "sales" && (subReportProfile === "transaction-details" || subReportProfile === "ledger")) && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 pt-3 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight block">Cashier</label>
                  <select
                    value={filterCashier}
                    onChange={(e) => setFilterCashier(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  >
                    <option value="all">All Cashiers</option>
                    {uniqueCashiers.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight block">Medicine</label>
                  <select
                    value={filterMedicineName}
                    onChange={(e) => setFilterMedicineName(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  >
                    <option value="all">All Medicines</option>
                    {uniqueMedicines.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight block">Payment Method</label>
                  <select
                    value={filterPaymentMethod}
                    onChange={(e) => setFilterPaymentMethod(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  >
                    <option value="all">All Payment Methods</option>
                    {uniquePaymentMethods.map(pm => (
                      <option key={pm} value={pm}>{pm}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight block">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  >
                    <option value="all">All Categories</option>
                    {uniqueCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight block">Supplier / Manufacturer</label>
                  <select
                    value={filterSupplier}
                    onChange={(e) => setFilterSupplier(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  >
                    <option value="all">All Suppliers</option>
                    {uniqueSuppliers.map(sup => (
                      <option key={sup} value={sup}>{sup}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight block">Store / Location</label>
                  <select
                    value={filterStore}
                    onChange={(e) => setFilterStore(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  >
                    <option value="all">All Stores</option>
                    {uniqueStores.map(store => (
                      <option key={store} value={store}>{store}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Search Bar */}
            <div className="flex items-center gap-3 pt-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="🔍 Search by Invoice #, Medicine Name, Cashier, Category, Supplier..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                onClick={() => {
                  setFilterBranchId("all");
                  setFilterCashier("all");
                  setFilterMedicineName("all");
                  setFilterPaymentMethod("all");
                  setFilterSupplier("all");
                  setFilterStore("all");
                  setSelectedCategory("all");
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-lg transition-colors whitespace-nowrap"
              >
                Reset Filters
              </button>
            </div>

          {/* Streams ledger */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-900 border-b border-slate-800 p-2.5 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-slate-300">CORE SYSTEM STREAMS AUDITING CONSOLE</span>
            </div>
            
            <div className="bg-slate-950 font-mono text-xs text-slate-300 p-4 space-y-2.5 max-h-[400px] overflow-y-auto leading-relaxed divide-y divide-slate-900/60 break-words [content-visibility:auto]">
              {filteredAuditLogs.map((log) => {
                const isAuth = log.actionType === "Authentication";
                const isSale = log.actionType === "POS Sale";
                const isMvt = log.actionType === "Stock Adjustment";
                const isUser = log.actionType === "User Management";
                return (
                  <div key={log.id} className="pt-2.5 text-[11px]">
                    <div className="flex flex-wrap items-center gap-1.5 text-slate-400">
                      <span className="text-slate-500 text-[10px] font-bold">[{log.timestamp.split("T")[0]} {log.timestamp.split("T")[1]?.slice(0, 8)}]</span>
                      <span className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${
                        isAuth ? "bg-blue-500/10 text-blue-400" :
                        isSale ? "bg-emerald-500/10 text-emerald-400" :
                        isMvt ? "bg-amber-500/10 text-amber-400" :
                        isUser ? "bg-purple-500/10 text-purple-400" : "bg-slate-700/20 text-slate-400"
                      }`}>
                        {log.actionType}
                      </span>
                      <span className="font-bold text-slate-300">@{log.username}</span>
                      <span className="text-slate-500 text-[10px]">({log.role})</span>
                      <span className="text-slate-500 text-[10px] font-semibold">[{log.branchName}]</span>
                    </div>
                    <p className="mt-1 text-slate-200 font-sans tracking-wide pl-2 border-l border-emerald-500/40">
                      {log.description}
                    </p>
                  </div>
                );
              })}
              {filteredAuditLogs.length === 0 && (
                <p className="text-center py-8 text-slate-500 italic">No network logs output records match search filter.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/*               PRINT PREVIEW MODAL LIGHTBOX                 */}
      {/* ======================================================== */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 shadow-2xl border border-slate-350 space-y-6">
            
            {/* Header info bar (hides when printable triggered) */}
            <div className="flex items-center justify-between border-b border-rose-100 pb-3 bg-rose-50/50 p-3 rounded-lg print:hidden">
              <div className="flex items-center gap-2 text-rose-800 text-xs font-bold">
                <AlertTriangle size={15} className="text-rose-600" />
                System ready for hard-copy standard page render. Press trigger options.
              </div>
              <div className="flex gap-2">
                <button
                  onClick={executePrint}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Confirm Print / Save PDF
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* PRINT CONTENTS TARGET WRAPPER */}
            <div id="print-area" className="p-8 space-y-6 text-slate-950 font-sans bg-white border border-slate-300 rounded-lg">
              
              {/* Header Invoice banner */}
              <div className="flex justify-between items-start border-b border-slate-300 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-xs font-bold bg-slate-900 p-1.5 rounded-lg">PHARMA-ERP</span>
                    <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">Nigeria Hub Enterprise</h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Primary pharmaceutical ERP and POS systems infrastructure.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Clearing ID: AREA-LUTH-NET-2026</p>
                </div>
                <div className="text-right text-xs">
                  <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Document Certification</h3>
                  <p className="font-mono mt-1 font-bold">DATE: June 11, 2026</p>
                  <p className="text-slate-500">FILTER RANGE: {dateFrom} - {dateTo}</p>
                  <p className="text-slate-500">BRANCH: {filterBranchId === "all" ? "Combined Area Network" : branches.find(b => b.id === filterBranchId)?.name}</p>
                </div>
              </div>

              {/* Summary KPIs listing inside Print layout */}
              <div className="grid grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                {reportType === "sales" && (
                  <>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-500">SUM REVENUE</p>
                      <p className="text-md font-bold text-slate-900">₦{salesSummaryKPIs.total.toLocaleString("en-US", { minimumFractionDigits: 1 })}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-500">ORDER TOTAL</p>
                      <p className="text-md font-bold text-slate-900">{salesSummaryKPIs.count} Sales</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-500">AVG CHEKOUT</p>
                      <p className="text-md font-bold text-slate-900">₦{salesSummaryKPIs.avgOrder.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-500">CASH VAL</p>
                      <p className="text-md font-bold text-slate-900">₦{salesSummaryKPIs.cashTotal.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
                    </div>
                  </>
                )}
                {reportType === "inventory" && (
                  <>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-500">PRODUCTS</p>
                      <p className="text-md font-bold text-slate-900">{inventorySummaryKPIs.totalItems} Items</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-500">WHOLESALE COST</p>
                      <p className="text-md font-bold text-slate-900">₦{inventorySummaryKPIs.totalStockValueCost.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-500">RETAIL VALUE</p>
                      <p className="text-md font-bold text-slate-900">₦{inventorySummaryKPIs.totalStockValueRetail.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-500">PROFIT PROJ.</p>
                      <p className="text-md font-bold text-slate-900">₦{inventorySummaryKPIs.potentialMargin.toLocaleString()}</p>
                    </div>
                  </>
                )}
                {reportType === "finance" && (
                  <>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-500">INCOME SUM</p>
                      <p className="text-md font-bold text-slate-900 font-mono">₦{financesSummaryKPIs.totalIncome.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-500">EXPENSE OVERHEAD</p>
                      <p className="text-md font-bold text-slate-900 font-mono">₦{financesSummaryKPIs.totalExpense.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-500">NET BALANCE</p>
                      <p className={`text-md font-bold font-mono ${financesSummaryKPIs.netProfit >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                        ₦{financesSummaryKPIs.netProfit.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-500">MARGIN</p>
                      <p className="text-md font-bold text-slate-900">{financesSummaryKPIs.profitMargin.toFixed(1)}%</p>
                    </div>
                  </>
                )}
                {reportType === "staff" && (
                  <>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-500">ACTIVE ROSTER</p>
                      <p className="text-md font-bold text-slate-900">{calculatedStaffData.length} Staff</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-500">MANAGED SALES</p>
                      <p className="text-md font-bold text-slate-900 font-mono">₦{calculatedStaffData.reduce((sum, s) => sum + s.totalSalesValue, 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-500">PROD SCORE</p>
                      <p className="text-md font-bold text-slate-900">
                        {(calculatedStaffData.reduce((sum, s) => sum + s.performanceScore, 0) / (calculatedStaffData.length || 1)).toFixed(1)} / 5.0
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-500">PAYROLL BURDEN</p>
                      <p className="text-md font-bold text-slate-900 font-mono">₦{calculatedStaffData.reduce((sum, s) => sum + s.salary, 0).toLocaleString()}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Printable simple list */}
              <div className="space-y-3">
                <h3 className="text-[10px] tracking-wider uppercase font-extrabold text-slate-600">
                  Certified Records Audit Trail Table
                </h3>

                <div className="border border-slate-350 rounded overflow-hidden">
                  
                  {reportType === "sales" && (subReportProfile === "transaction-details" || subReportProfile === "ledger") && (
                    <>
                      <table className="w-full text-left text-[10px]">
                        <thead className="bg-slate-100 border-b border-slate-350">
                          <tr className="text-slate-700 font-bold uppercase text-[9px]">
                            <th className="px-3 py-2">S/N</th>
                            <th className="px-3 py-2">Invoice #</th>
                            <th className="px-3 py-2">Medicine Name</th>
                            <th className="px-3 py-2">Category</th>
                            <th className="px-3 py-2 text-right">Qty</th>
                            <th className="px-3 py-2 text-right">Unit Cost</th>
                            <th className="px-3 py-2 text-right">Tot Cost</th>
                            <th className="px-3 py-2 text-right">Unit Sell</th>
                            <th className="px-3 py-2 text-right">Tot Sell</th>
                            <th className="px-3 py-2 text-right">Discount</th>
                            <th className="px-3 py-2 text-right">Balance</th>
                            <th className="px-3 py-2 text-right">Profit</th>
                            <th className="px-3 py-2">Payment</th>
                            <th className="px-3 py-2">Cashier</th>
                            <th className="px-3 py-2">Date & Time</th>
                            <th className="px-3 py-2">Branch</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {filteredSalesTransactionsFiltered.map((tx, idx) => {
                            const branchName = branches.find(b => b.id === tx.branchId)?.name || tx.branchId;
                            return (
                              <tr key={idx}>
                                <td className="px-3 py-2 font-mono text-slate-500">{idx + 1}</td>
                                <td className="px-3 py-2 font-mono font-bold text-slate-800">{tx.invoiceNumber}</td>
                                <td className="px-3 py-2 font-semibold text-slate-900">{tx.medicineName}</td>
                                <td className="px-3 py-2 text-slate-600">{tx.category}</td>
                                <td className="px-3 py-2 text-right">{tx.quantity}</td>
                                <td className="px-3 py-2 text-right font-mono">₦{tx.unitCostPrice.toLocaleString()}</td>
                                <td className="px-3 py-2 text-right font-mono">₦{tx.totalCostPrice.toLocaleString()}</td>
                                <td className="px-3 py-2 text-right font-mono">₦{tx.unitSellingPrice.toLocaleString()}</td>
                                <td className="px-3 py-2 text-right font-mono font-bold">₦{tx.totalSellingPrice.toLocaleString()}</td>
                                <td className="px-3 py-2 text-right text-rose-600 font-bold">-₦{tx.discount.toLocaleString()}</td>
                                <td className="px-3 py-2 text-right font-mono text-emerald-700 font-bold">₦{tx.balanceAfterDiscount.toLocaleString()}</td>
                                <td className={`px-3 py-2 text-right font-mono font-bold ${tx.profit >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{tx.profit >= 0 ? "+" : ""}₦{tx.profit.toLocaleString()}</td>
                                <td className="px-3 py-2">{tx.paymentMethod}</td>
                                <td className="px-3 py-2 text-slate-600">{tx.cashierName}</td>
                                <td className="px-3 py-2 text-slate-500">{new Date(tx.date).toLocaleString()}</td>
                                <td className="px-3 py-2 text-slate-600">{branchName}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="bg-slate-100 font-bold text-[10px] border-t-2 border-slate-400">
                            <td colSpan={4} className="px-3 py-2 text-right text-slate-800 uppercase">GRAND TOTALS</td>
                            <td className="px-3 py-2 text-right">{filteredSalesTransactionsFiltered.reduce((s: number, t: any) => s + t.quantity, 0)}</td>
                            <td className="px-3 py-2 text-right">-</td>
                            <td className="px-3 py-2 text-right">₦{filteredSalesTransactionsFiltered.reduce((s: number, t: any) => s + t.totalCostPrice, 0).toLocaleString()}</td>
                            <td className="px-3 py-2 text-right">-</td>
                            <td className="px-3 py-2 text-right">₦{filteredSalesTransactionsFiltered.reduce((s: number, t: any) => s + t.totalSellingPrice, 0).toLocaleString()}</td>
                            <td className="px-3 py-2 text-right text-rose-600">-₦{filteredSalesTransactionsFiltered.reduce((s: number, t: any) => s + t.discount, 0).toLocaleString()}</td>
                            <td className="px-3 py-2 text-right text-emerald-700">₦{filteredSalesTransactionsFiltered.reduce((s: number, t: any) => s + t.balanceAfterDiscount, 0).toLocaleString()}</td>
                            <td className={`px-3 py-2 text-right ${filteredSalesTransactionsFiltered.reduce((s: number, t: any) => s + t.profit, 0) >= 0 ? "text-emerald-700" : "text-rose-700"}`}>+₦{filteredSalesTransactionsFiltered.reduce((s: number, t: any) => s + t.profit, 0).toLocaleString()}</td>
                            <td colSpan={4} className="px-3 py-2"></td>
                          </tr>
                        </tfoot>
                      </table>
                      <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded text-[10px] space-y-1">
                        <p><strong>TOTAL QUANTITY SOLD:</strong> {filteredSalesTransactionsFiltered.reduce((s: number, t: any) => s + t.quantity, 0).toLocaleString()} units</p>
                        <p><strong>TOTAL COST VALUE:</strong> ₦{filteredSalesTransactionsFiltered.reduce((s: number, t: any) => s + t.totalCostPrice, 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                        <p><strong>TOTAL SELL VALUE:</strong> ₦{filteredSalesTransactionsFiltered.reduce((s: number, t: any) => s + t.totalSellingPrice, 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                        <p><strong>TOTAL DISCOUNT:</strong> -₦{filteredSalesTransactionsFiltered.reduce((s: number, t: any) => s + t.discount, 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                        <p><strong>TOTAL NET SALES:</strong> ₦{filteredSalesTransactionsFiltered.reduce((s: number, t: any) => s + t.balanceAfterDiscount, 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                        <p><strong>TOTAL PROFIT:</strong> +₦{filteredSalesTransactionsFiltered.reduce((s: number, t: any) => s + t.profit, 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                      </div>
                    </>
                  )}

                  {reportType === "inventory" && (
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 border-b border-slate-350">
                        <tr className="text-slate-700 font-bold uppercase text-[9px]">
                          <th className="px-4 py-2">Medicine Profile</th>
                          <th className="px-4 py-2">Category</th>
                          <th className="px-4 py-2 text-right">Stock</th>
                          <th className="px-4 py-2 text-right">Wholesale Cost</th>
                          <th className="px-4 py-2 text-right">Retail price</th>
                          <th className="px-4 py-2 text-right">Total Cost</th>
                          <th className="px-4 py-2 text-right">Total Retail</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {filteredInventoryData.map(m => {
                          const qty = filterBranchId === "all" ? m.stock : (m.branchStocks[filterBranchId] || 0);
                          return (
                            <tr key={m.id}>
                              <td className="px-4 py-2 font-bold text-slate-900">{m.name}</td>
                              <td className="px-4 py-2">{m.category}</td>
                              <td className="px-4 py-2 text-right font-bold">{qty} Units</td>
                              <td className="px-4 py-2 text-right">₦{m.purchasePrice}</td>
                              <td className="px-4 py-2 text-right font-semibold">₦{m.sellingPrice}</td>
                              <td className="px-4 py-2 text-right">₦{(m.purchasePrice * qty).toLocaleString()}</td>
                              <td className="px-4 py-2 text-right font-bold">₦{(m.sellingPrice * qty).toLocaleString()}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}

                  {reportType === "finance" && (
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 border-b border-slate-350">
                        <tr className="text-slate-700 font-bold uppercase text-[9px]">
                          <th className="px-4 py-2">ID Record</th>
                          <th className="px-4 py-2">Date</th>
                          <th className="px-4 py-2">Financial Type</th>
                          <th className="px-4 py-2">Category Category</th>
                          <th className="px-4 py-2">Description</th>
                          <th className="px-4 py-2 text-right">Sum Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {filteredFinancesData.map(f => (
                          <tr key={f.id}>
                            <td className="px-4 py-2 font-mono text-slate-600">{f.id}</td>
                            <td className="px-4 py-2">{f.date}</td>
                            <td className="px-4 py-2 font-bold uppercase">{f.type}</td>
                            <td className="px-4 py-2 font-semibold">{f.category}</td>
                            <td className="px-4 py-2 text-slate-500">{f.description}</td>
                            <td className="px-4 py-2 text-right font-bold">
                              {f.type === "Income" ? "" : "-"}₦{f.amount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {reportType === "staff" && (
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 border-b border-slate-350">
                        <tr className="text-slate-700 font-bold uppercase text-[9px]">
                          <th className="px-4 py-2">Member</th>
                          <th className="px-4 py-2">Official Role</th>
                          <th className="px-4 py-2 text-right">Salary (NGN)</th>
                          <th className="px-4 py-2 text-right">Managed Checkouts</th>
                          <th className="px-4 py-2 text-right">Managed Sales</th>
                          <th className="px-4 py-2 text-right">Rating Index</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {calculatedStaffData.map(s => (
                          <tr key={s.id}>
                            <td className="px-4 py-2 font-bold">{s.name}</td>
                            <td className="px-4 py-2 text-slate-500">{s.role}</td>
                            <td className="px-4 py-2 text-right font-mono">₦{s.salary.toLocaleString()}</td>
                            <td className="px-4 py-2 text-right">{s.salesCount} sales</td>
                            <td className="px-4 py-2 text-right font-mono">₦{s.totalSalesValue.toLocaleString()}</td>
                            <td className="px-4 py-2 text-right font-bold">{s.performanceScore.toFixed(1)} / 5.0</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                </div>
              </div>

              {/* Signature Blocks and clearance standard footer */}
              <div className="pt-12 grid grid-cols-2 gap-12 font-mono text-[10px] text-slate-600 border-t border-slate-300">
                <div>
                  <p className="font-bold text-slate-800 uppercase">1. SYSTEMS OPERATOR CLEARANCE SIGNATURE</p>
                  <div className="border-b border-slate-300 h-10 mt-2" />
                  <p className="mt-1">Dr. Jadan Alhaji (Super Admin Representative)</p>
                  <p className="text-slate-400">Timestamp: {new Date().toISOString()}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-800 uppercase">2. BOARD OF CLINICS AUDIT SEAL APPROVAL</p>
                  <div className="border-b border-slate-300 h-10 mt-2" />
                  <p className="mt-1">Federal Republic of Nigeria Pharmacy Compliance board</p>
                  <p className="text-slate-400">Security Clearance hash: SHA-ENC-2026-NUB</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
