/**
 * TypeScript definitions and initial seed data for the PharmERP SaaS platform.
 */

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  brand: string;
  manufacturer: string;
  category: "Antimalarial" | "Antibiotic" | "Analgesic" | "Cardiovascular" | "Antidiabetic" | "Respiratory" | "Vitamins" | "Other";
  type: "Tablet" | "Capsule" | "Syrup" | "Injection" | "Cream" | "Inhaler";
  unit: string;
  strength: string;
  batchNumber: string;
  barcode: string;
  qrCode: string;
  purchasePrice: number; // in NGN
  sellingPrice: number; // in NGN
  expiryDate: string; // YYYY-MM-DD
  manufacturingDate: string; // YYYY-MM-DD
  tax: number; // percentage
  storeLocation: string; // Aisle/Shelf
  reorderLevel: number;
  stock: number; // Overall Central or selected branch state
  branchStocks: { [branchId: string]: number }; // Branch-wise stock levels
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  manager: string;
  phone: string;
  revenue: number;
  salesCount: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  balance: number; // Outstanding
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  medicalHistory: string;
  prescriptionHistory: string[];
  loyaltyPoints: number;
  walletBalance: number;
  creditLimit: number;
}

export interface Prescription {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  medicines: {
    name: string;
    strength: string;
    dosage: string;
    frequency: string;
    alternatives?: string[];
  }[];
  scannedImageUrl?: string;
  verified: boolean;
  repeatAllowed: boolean;
  repeatCount: number;
  alerts?: string;
}

export interface SaleItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  price: number;
  tax: number;
  batchNumber: string;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  date: string;
  branchId: string;
  customerName: string;
  items: SaleItem[];
  subtotal: number;
  taxTotal: number;
  discount: number;
  total: number;
  paymentMethod: "Cash" | "POS" | "Bank Transfer" | "Mobile Money" | "Mixed";
  cashierName: string;
  prescriptionLinked?: string;
}

export interface StockMovement {
  id: string;
  timestamp: string;
  medicineId: string;
  medicineName: string;
  type: "Stock In" | "Sale" | "Damage" | "Transfer Out" | "Transfer In" | "Expired Return";
  quantity: number;
  referenceId: string; // Sale ID, PO ID, Transfer ID
  branchId: string;
  notes: string;
}

export interface FinancialRecord {
  id: string;
  date: string;
  type: "Income" | "Expense";
  category: "Sales Revenue" | "Service Revenue" | "Salary" | "Rent" | "Utilities" | "Logistics" | "Supplies" | "Other";
  amount: number;
  paymentMethod: string;
  description: string;
  branchId: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "Super Admin" | "Owner" | "Pharmacist" | "Cashier" | "Inventory Officer" | "Branch Manager" | "Accountant";
  branchId: string;
  attendanceStatus: "Present" | "Absent" | "On Leave" | "Late";
  salary: number;
  performanceScore: number; // 1-5 scale
}

export interface BackupPoint {
  id: string;
  timestamp: string;
  fileName: string;
  fileSize: string;
  encryptionStatus: "AES-256 Enabled";
}

// =================== SEED DATA ===================

export const INITIAL_BRANCHES: Branch[] = [
  { id: "b1", name: "Ikeja Plaza Plaza", location: "Lagos, Nigeria", manager: "Dr. Funmi Alao", phone: "+234 801 234 5678", revenue: 2450000, salesCount: 540 },
  { id: "b2", name: "Wuse II Mall", location: "Abuja, Nigeria", manager: "Bilkisu Bello", phone: "+234 802 345 6789", revenue: 3100000, salesCount: 610 },
  { id: "b3", name: "Sabon Gari Hub", location: "Kano, Nigeria", manager: "Abubakar Garba", phone: "+234 803 456 7890", revenue: 1850000, salesCount: 410 },
  { id: "b4", name: "Central Warehouse", location: "Port Harcourt, Victoria Island", manager: "Obinna Okafor", phone: "+234 804 567 8901", revenue: 0, salesCount: 0 },
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  { id: "s1", name: "Emzor Pharmaceuticals Ltd", contactPerson: "Emmanuel Emzor", phone: "+234 805 111 2222", email: "orders@emzorpharma.com", address: "Ilasamaja Industrial Scheme, Lagos", balance: 450000 },
  { id: "s2", name: "Fidson Healthcare Plc", contactPerson: "Mrs. Toyin Fidson", phone: "+234 805 333 4444", email: "sales@fidson.com", address: "Obanikoro, Lagos", balance: 120000 },
  { id: "s3", name: "GlaxoSmithKline Nigeria", contactPerson: "Chinedu Okafor", phone: "+234 805 555 6666", email: "info.gsk@gsk.com", address: "Apapa, Lagos", balance: 0 },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  { id: "c1", name: "Alhaji Musa Yusuf", phone: "+234 809 123 4567", email: "musa.yusuf@gmail.com", medicalHistory: "Hypertension managed on Diuretics and ACE Inhibitors. No drug allergies.", prescriptionHistory: ["p1"], loyaltyPoints: 340, walletBalance: 15400, creditLimit: 50000 },
  { id: "c2", name: "Chinyere Nwachukwu", phone: "+234 809 234 5678", email: "chinyere.nw@yahoo.com", medicalHistory: "Type II Diabetes. Allergic to Sulfa Drugs.", prescriptionHistory: ["p2"], loyaltyPoints: 120, walletBalance: 2000, creditLimit: 10000 },
  { id: "c3", name: "Fatima Abdullahi", phone: "+234 809 345 6789", email: "fatima.abdul@hotmail.com", medicalHistory: "Asthmatic. Sensitive to Aspirin/NSAIDs.", prescriptionHistory: [], loyaltyPoints: 80, walletBalance: 0, creditLimit: 5000 },
];

export const INITIAL_MEDICINES: Medicine[] = [
  {
    id: "m1",
    name: "Coartem 80/480mg",
    genericName: "Artemether + Lumefantrine",
    brand: "Coartem",
    manufacturer: "Novartis Pharmaceuticals",
    category: "Antimalarial",
    type: "Tablet",
    unit: "Box of 6 Tabs",
    strength: "80mg/480mg",
    batchNumber: "CRT-2026-X8",
    barcode: "6151100234125",
    qrCode: "COARTEM-80-480-CRT-2026-X8",
    purchasePrice: 2200,
    sellingPrice: 3500,
    expiryDate: "2026-07-20", // Expiring soon in our timeline (June 2026)
    manufacturingDate: "2024-07-20",
    tax: 5,
    storeLocation: "Aisle A - Row 2",
    reorderLevel: 25,
    stock: 140,
    branchStocks: { b1: 50, b2: 60, b3: 30 },
  },
  {
    id: "m2",
    name: "Emzor Paracetamol 500mg",
    genericName: "Acetaminophen",
    brand: "Emzor Paracetamol",
    manufacturer: "Emzor Pharmaceuticals",
    category: "Analgesic",
    type: "Tablet",
    unit: "Pack of 96 Tabs",
    strength: "500mg",
    batchNumber: "EMZ-PARA-901",
    barcode: "6151100129031",
    qrCode: "EMZOR-PARA-500-EMZ-PARA-901",
    purchasePrice: 400,
    sellingPrice: 850,
    expiryDate: "2027-10-15",
    manufacturingDate: "2025-10-15",
    tax: 0,
    storeLocation: "Aisle B - Row 1",
    reorderLevel: 50,
    stock: 450,
    branchStocks: { b1: 200, b2: 150, b3: 100 },
  },
  {
    id: "m3",
    name: "Amoxil Capsules 500mg",
    genericName: "Amoxicillin Trihydrate",
    brand: "Amoxil",
    manufacturer: "GlaxoSmithKline",
    category: "Antibiotic",
    type: "Capsule",
    unit: "Box of 100 Caps",
    strength: "5000mg",
    batchNumber: "AMX-8822-L",
    barcode: "5012345678901",
    qrCode: "AMOXIL-500-AMX-8822-L",
    purchasePrice: 4500,
    sellingPrice: 6800,
    expiryDate: "2026-12-05", // Expiring soon
    manufacturingDate: "2024-12-05",
    tax: 5,
    storeLocation: "Aisle A - Row 4",
    reorderLevel: 15,
    stock: 8, // Low Stock Alert target!
    branchStocks: { b1: 3, b2: 4, b3: 1 },
  },
  {
    id: "m4",
    name: "Mixtard 30/70 Insulin Pen",
    genericName: "Insulin (Biphasic Isophane)",
    brand: "Mixtard",
    manufacturer: "Novo Nordisk",
    category: "Antidiabetic",
    type: "Injection",
    unit: "Pen of 3ml",
    strength: "100 IU/ml",
    batchNumber: "INS-NOVO-7a",
    barcode: "5701234561234",
    qrCode: "MIXTARD-INSULIN-NOVO-7a",
    purchasePrice: 12000,
    sellingPrice: 18500,
    expiryDate: "2026-05-10", // EXPIRED in June 2026!
    manufacturingDate: "2024-05-10",
    tax: 0,
    storeLocation: "Refrigerator Shelf 1",
    reorderLevel: 10,
    stock: 12,
    branchStocks: { b1: 5, b2: 5, b3: 2 },
  },
  {
    id: "m5",
    name: "Ventolin Evohaler",
    genericName: "Salbutamol Sulfate",
    brand: "Ventolin",
    manufacturer: "GlaxoSmithKline",
    category: "Respiratory",
    type: "Inhaler",
    unit: "Canister",
    strength: "100mcg/dose",
    batchNumber: "VTL-9022-A",
    barcode: "5012345671124",
    qrCode: "VENTOLIN-EVOHALER-VTL-9022-A",
    purchasePrice: 3500,
    sellingPrice: 5500,
    expiryDate: "2027-04-01",
    manufacturingDate: "2025-04-01",
    tax: 5,
    storeLocation: "Aisle C - Row 1",
    reorderLevel: 15,
    stock: 85,
    branchStocks: { b1: 25, b2: 40, b3: 20 },
  },
  {
    id: "m6",
    name: "Cardipril 5mg Tablets",
    genericName: "Ramipril",
    brand: "Cardipril",
    manufacturer: "Fidson Healthcare Plc",
    category: "Cardiovascular",
    type: "Tablet",
    unit: "Pack of 28 Tabs",
    strength: "5mg",
    batchNumber: "FDS-RMP-223",
    barcode: "6151100345091",
    qrCode: "FDS-RMP-223-CARDIPRIL",
    purchasePrice: 2800,
    sellingPrice: 4200,
    expiryDate: "2027-01-30",
    manufacturingDate: "2025-01-30",
    tax: 5,
    storeLocation: "Aisle A - Row 1",
    reorderLevel: 20,
    stock: 64,
    branchStocks: { b1: 24, b2: 30, b3: 10 },
  },
];

export const INITIAL_SALES: Sale[] = [
  {
    id: "s_tr_001",
    invoiceNumber: "INV-2026-9051",
    date: "2026-06-11T09:15:00Z",
    branchId: "b1",
    customerName: "Alhaji Musa Yusuf",
    items: [
      { medicineId: "m1", medicineName: "Coartem 80/480mg", quantity: 2, price: 3500, tax: 5, batchNumber: "CRT-2026-X8" },
      { medicineId: "m2", medicineName: "Emzor Paracetamol 500mg", quantity: 1, price: 850, tax: 0, batchNumber: "EMZ-PARA-901" }
    ],
    subtotal: 7850,
    taxTotal: 350,
    discount: 500,
    total: 7700,
    paymentMethod: "Mixed",
    cashierName: "Amina Lawal",
    prescriptionLinked: "p1",
  },
  {
    id: "s_tr_002",
    invoiceNumber: "INV-2026-9052",
    date: "2026-06-11T10:30:00Z",
    branchId: "b2",
    customerName: "Chinyere Nwachukwu",
    items: [
      { medicineId: "m5", medicineName: "Ventolin Evohaler", quantity: 1, price: 5500, tax: 5, batchNumber: "VTL-9022-A" }
    ],
    subtotal: 5500,
    taxTotal: 275,
    discount: 0,
    total: 5775,
    paymentMethod: "Bank Transfer",
    cashierName: "Bilkisu Bello",
    prescriptionLinked: "p2",
  },
  {
    id: "s_tr_003",
    invoiceNumber: "INV-2026-9053",
    date: "2026-06-10T15:20:00Z",
    branchId: "b3",
    customerName: "Walk-in Customer",
    items: [
      { medicineId: "m2", medicineName: "Emzor Paracetamol 500mg", quantity: 3, price: 850, tax: 0, batchNumber: "EMZ-PARA-901" }
    ],
    subtotal: 2550,
    taxTotal: 0,
    discount: 150,
    total: 2400,
    paymentMethod: "Cash",
    cashierName: "Tunde Edun",
  }
];

export const INITIAL_FINANCES: FinancialRecord[] = [
  { id: "f1", date: "2026-06-11", type: "Income", category: "Sales Revenue", amount: 7700, paymentMethod: "Mixed", description: "Sale INV-2026-9051", branchId: "b1" },
  { id: "f2", date: "2026-06-11", type: "Income", category: "Sales Revenue", amount: 5775, paymentMethod: "Bank Transfer", description: "Sale INV-2026-9052", branchId: "b2" },
  { id: "f3", date: "2026-06-10", type: "Income", category: "Sales Revenue", amount: 2400, paymentMethod: "Cash", description: "Sale INV-2026-9053", branchId: "b3" },
  { id: "f4", date: "2026-06-01", type: "Expense", category: "Salary", amount: 750000, paymentMethod: "Bank Transfer", description: "Staff salaries - Lagos & Abuja", branchId: "b1" },
  { id: "f5", date: "2026-06-02", type: "Expense", category: "Rent", amount: 350000, paymentMethod: "Bank Transfer", description: "Abuja Mall Store Lease installment", branchId: "b2" },
  { id: "f6", date: "2026-06-05", type: "Expense", category: "Utilities", amount: 80000, paymentMethod: "POS", description: "Diesel purchase for generator (Kano Branch)", branchId: "b3" },
];

export const INITIAL_STAFF: Staff[] = [
  { id: "st1", name: "Dr. Funmi Alao", email: "funmi@pharmerp.com", phone: "+234 801 111 0001", role: "Pharmacist", branchId: "b1", attendanceStatus: "Present", salary: 350000, performanceScore: 4.8 },
  { id: "st2", name: "Bilkisu Bello", email: "bilkisu@pharmerp.com", phone: "+234 802 222 0002", role: "Branch Manager", branchId: "b2", attendanceStatus: "Present", salary: 400000, performanceScore: 4.5 },
  { id: "st3", name: "Tunde Edun", email: "tunde@pharmerp.com", phone: "+234 803 333 0003", role: "Cashier", branchId: "b3", attendanceStatus: "Present", salary: 150000, performanceScore: 4.2 },
  { id: "st4", name: "Amina Lawal", email: "amina@pharmerp.com", phone: "+234 801 444 0004", role: "Cashier", branchId: "b1", attendanceStatus: "Late", salary: 150000, performanceScore: 4.0 },
  { id: "st5", name: "Umar Farouk", email: "umar@pharmerp.com", phone: "+234 802 555 0005", role: "Inventory Officer", branchId: "b2", attendanceStatus: "Present", salary: 180000, performanceScore: 4.4 },
];

export const INITIAL_PRESCRIPTIONS: Prescription[] = [
  {
    id: "p1",
    patientName: "Alhaji Musa Yusuf",
    doctorName: "Dr. Chidi Okechukwu (LUTH)",
    date: "2026-06-11",
    medicines: [
      { name: "Coartem 80/480mg", strength: "80mg/480mg", dosage: "1 tablet twice daily for 3 days", frequency: "Twice daily", alternatives: ["Amatem Softgel", "Artemether/Lumefantrine"] },
      { name: "Emzor Paracetamol", strength: "500mg", dosage: "2 tablets as needed", frequency: "As needed" }
    ],
    verified: true,
    repeatAllowed: false,
    repeatCount: 0,
    alerts: "Patient reported past allergic reactions to Metformin. Take caution.",
  },
  {
    id: "p2",
    patientName: "Chinyere Nwachukwu",
    doctorName: "Dr. Fatima Ibrahim (National Hospital)",
    date: "2026-06-08",
    medicines: [
      { name: "Ventolin Evohaler", strength: "100mcg/dose", dosage: "2 puffs when short of breath", frequency: "Prn (As needed)", alternatives: ["Aerolin Inhaler"] }
    ],
    verified: true,
    repeatAllowed: true,
    repeatCount: 3,
    alerts: "",
  }
];

export const INITIAL_BACKUPS: BackupPoint[] = [
  { id: "bk1", timestamp: "2026-06-10T23:00:00Z", fileName: "pharmerp-backup_2026-06-10.enc", fileSize: "128.4 MB", encryptionStatus: "AES-256 Enabled" },
  { id: "bk2", timestamp: "2026-06-09T23:00:00Z", fileName: "pharmerp-backup_2026-06-09.enc", fileSize: "125.1 MB", encryptionStatus: "AES-256 Enabled" },
];

export interface ERPUser {
  id: string;
  username: string;
  passwordHash: string; // stored credentials for user authentication simulation
  role: "Super Admin" | "Owner" | "Pharmacist" | "Cashier" | "Inventory Officer" | "Branch Manager" | "Accountant";
  branchId: string; // b1, b2, b3, etc. or 'all'
  createdAt: string;
  status: "Active" | "Suspended";
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  role: string;
  branchId: string;
  branchName: string;
  actionType: "Authentication" | "POS Sale" | "Stock Adjustment" | "Product Catalog" | "Finance Entry" | "User Management" | "Report Export" | "Backup Operation";
  description: string;
}

export const INITIAL_USERS: ERPUser[] = [
  { id: "u_admin", username: "admin_jadan", passwordHash: "admin123", role: "Super Admin", branchId: "b1", createdAt: "2026-05-01", status: "Active" },
  { id: "u_funmi", username: "funmi_alao", passwordHash: "funmi123", role: "Pharmacist", branchId: "b1", createdAt: "2026-05-10", status: "Active" },
  { id: "u_tunde", username: "tunde_cash", passwordHash: "tunde123", role: "Cashier", branchId: "b3", createdAt: "2026-05-15", status: "Active" },
  { id: "u_bilkisu", username: "bilkisu_mgr", passwordHash: "bilkisu123", role: "Branch Manager", branchId: "b2", createdAt: "2026-05-12", status: "Active" },
  { id: "u_suspend", username: "test_suspended", passwordHash: "test123", role: "Cashier", branchId: "b1", createdAt: "2026-06-01", status: "Suspended" },
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  { id: "log_01", timestamp: "2026-06-11T08:15:00Z", userId: "u_admin", username: "admin_jadan", role: "Super Admin", branchId: "b1", branchName: "Ikeja Plaza Plaza", actionType: "Authentication", description: "Super Admin logged in from primary area network." },
  { id: "log_02", timestamp: "2026-06-11T09:16:00Z", userId: "u_funmi", username: "funmi_alao", role: "Pharmacist", branchId: "b1", branchName: "Ikeja Plaza Plaza", actionType: "POS Sale", description: "Dispensed Coartem (2 count) and Paracetamol via POS interface. Connected to prescription #p1." },
  { id: "log_03", timestamp: "2026-06-11T10:31:00Z", userId: "u_bilkisu", username: "bilkisu_mgr", role: "Branch Manager", branchId: "b2", branchName: "Wuse II Mall", actionType: "POS Sale", description: "Dispensed Ventolin Evohaler (1 count) via Abuja Mall interface." },
  { id: "log_04", timestamp: "2026-06-11T11:00:00Z", userId: "u_admin", username: "admin_jadan", role: "Super Admin", branchId: "b1", branchName: "Ikeja Plaza Plaza", actionType: "User Management", description: "Created new secondary cashier session for Abuja." },
];

export interface RolePermission {
  dashboard: boolean;
  sales: boolean;
  inventory: boolean;
  reports: boolean;
  customers: boolean;
  suppliers: boolean;
  purchases: boolean;
  settings: boolean;
  branches: boolean;
}

export interface SecurityRole {
  name: string;
  permissions: RolePermission;
  isSystem?: boolean;
}

export interface BusinessSettings {
  businessName: string;
  logoText: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  taxNumber: string;
  currency: string;
  receiptFooter: string;
  invoicePrefix: string;
}

export const DEFAULT_ROLES: SecurityRole[] = [
  {
    name: "Super Admin",
    isSystem: true,
    permissions: {
      dashboard: true,
      sales: true,
      inventory: true,
      reports: true,
      customers: true,
      suppliers: true,
      purchases: true,
      settings: true,
      branches: true
    }
  },
  {
    name: "Branch Manager",
    isSystem: true,
    permissions: {
      dashboard: true,
      sales: true,
      inventory: true,
      reports: true,
      customers: true,
      suppliers: true,
      purchases: false,
      settings: false,
      branches: true
    }
  },
  {
    name: "Pharmacist",
    isSystem: true,
    permissions: {
      dashboard: true,
      sales: true,
      inventory: true,
      reports: false,
      customers: true,
      suppliers: false,
      purchases: false,
      settings: false,
      branches: false
    }
  },
  {
    name: "Cashier",
    isSystem: true,
    permissions: {
      dashboard: true,
      sales: true,
      inventory: false,
      reports: false,
      customers: true,
      suppliers: false,
      purchases: false,
      settings: false,
      branches: false
    }
  },
  {
    name: "Accountant",
    isSystem: true,
    permissions: {
      dashboard: true,
      sales: false,
      inventory: false,
      reports: true,
      customers: false,
      suppliers: true,
      purchases: true,
      settings: true,
      branches: false
    }
  },
  {
    name: "Inventory Officer",
    isSystem: true,
    permissions: {
      dashboard: true,
      sales: false,
      inventory: true,
      reports: false,
      customers: false,
      suppliers: true,
      purchases: true,
      settings: false,
      branches: false
    }
  }
];

export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  businessName: "Jadan Express Pharmacy Group Ltd",
  logoText: "PHARMA-ERP",
  address: "Plot 14, Commercial Avenue, Ikeja, Lagos, Nigeria",
  phone: "+234 801 234 5678",
  email: "jadanexpress.info@gmail.com",
  website: "https://jadanexpress.pharm.erp",
  taxNumber: "TIN-LAG-9041285",
  currency: "₦",
  receiptFooter: "Thank you for partnering with us for your health & wellness. Powered by PharmERP SaaS.",
  invoicePrefix: "INV-"
};


