// Benita Granites — Application Constants

// ============================================
// ROLES
// ============================================
export const ROLES = {
  OWNER: 'owner',
  SENIOR_MANAGEMENT: 'senior_management',
  GENERAL_MANAGER: 'general_manager',
  ACCOUNTS: 'accounts',
  MINE_MANAGER: 'mine_manager',
  SUPERVISOR: 'supervisor',
  OPERATOR: 'operator',
  SECURITY_GUARD: 'security_guard',
  KITCHEN_STAFF: 'kitchen_staff',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

export const ROLE_LABELS: Record<UserRole, string> = {
  [ROLES.OWNER]: 'Owner / Director',
  [ROLES.SENIOR_MANAGEMENT]: 'Senior Management',
  [ROLES.GENERAL_MANAGER]: 'General Manager',
  [ROLES.ACCOUNTS]: 'Accounts',
  [ROLES.MINE_MANAGER]: 'Mine Manager',
  [ROLES.SUPERVISOR]: 'Supervisor',
  [ROLES.OPERATOR]: 'Operator',
  [ROLES.SECURITY_GUARD]: 'Security Guard',
  [ROLES.KITCHEN_STAFF]: 'Kitchen Staff',
};

// ============================================
// ROLE HIERARCHY (higher number = more access)
// ============================================
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [ROLES.OWNER]: 100,
  [ROLES.SENIOR_MANAGEMENT]: 90,
  [ROLES.GENERAL_MANAGER]: 80,
  [ROLES.ACCOUNTS]: 60,
  [ROLES.MINE_MANAGER]: 50,
  [ROLES.SUPERVISOR]: 40,
  [ROLES.OPERATOR]: 20,
  [ROLES.SECURITY_GUARD]: 15,
  [ROLES.KITCHEN_STAFF]: 10,
};

// ============================================
// BLOCK STATUS
// ============================================
export const BLOCK_STATUS = {
  DUG: 'dug',
  READY_FOR_DRESSING: 'ready_for_dressing',
  DRESSING: 'dressing',
  READY_FOR_SALE: 'ready_for_sale',
  RESERVED: 'reserved',
  SOLD: 'sold',
  DISPATCHED: 'dispatched',
} as const;

export type BlockStatus = typeof BLOCK_STATUS[keyof typeof BLOCK_STATUS];

export const BLOCK_STATUS_LABELS: Record<BlockStatus, string> = {
  [BLOCK_STATUS.DUG]: 'Dug',
  [BLOCK_STATUS.READY_FOR_DRESSING]: 'Ready for Dressing',
  [BLOCK_STATUS.DRESSING]: 'Dressing',
  [BLOCK_STATUS.READY_FOR_SALE]: 'Ready for Sale',
  [BLOCK_STATUS.RESERVED]: 'Reserved',
  [BLOCK_STATUS.SOLD]: 'Sold',
  [BLOCK_STATUS.DISPATCHED]: 'Dispatched',
};

export const BLOCK_STATUS_FLOW: BlockStatus[] = [
  BLOCK_STATUS.DUG,
  BLOCK_STATUS.READY_FOR_DRESSING,
  BLOCK_STATUS.DRESSING,
  BLOCK_STATUS.READY_FOR_SALE,
  BLOCK_STATUS.RESERVED,
  BLOCK_STATUS.SOLD,
  BLOCK_STATUS.DISPATCHED,
];

// ============================================
// BLOCK CATEGORIES
// ============================================
export const BLOCK_CATEGORIES = {
  GANG_SAW: 'gang_saw',
  CUTTER: 'cutter',
  COMMERCIAL: 'commercial',
} as const;

export type BlockCategory = typeof BLOCK_CATEGORIES[keyof typeof BLOCK_CATEGORIES];

export const BLOCK_CATEGORY_LABELS: Record<BlockCategory, string> = {
  [BLOCK_CATEGORIES.GANG_SAW]: 'Gang Saw',
  [BLOCK_CATEGORIES.CUTTER]: 'Cutter',
  [BLOCK_CATEGORIES.COMMERCIAL]: 'Commercial',
};

// ============================================
// EQUIPMENT CATEGORIES
// ============================================
export const EQUIPMENT_CATEGORIES = {
  SANY: 'sany',
  TATA_HITACHI: 'tata_hitachi',
  TRACTORS: 'tractors',
  GENERATORS: 'generators',
  SITE_VEHICLES: 'site_vehicles',
  MANAGEMENT_VEHICLES: 'management_vehicles',
} as const;

export type EquipmentCategory = typeof EQUIPMENT_CATEGORIES[keyof typeof EQUIPMENT_CATEGORIES];

export const EQUIPMENT_CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  [EQUIPMENT_CATEGORIES.SANY]: 'SANY',
  [EQUIPMENT_CATEGORIES.TATA_HITACHI]: 'TATA HITACHI',
  [EQUIPMENT_CATEGORIES.TRACTORS]: 'Tractors',
  [EQUIPMENT_CATEGORIES.GENERATORS]: 'Generators',
  [EQUIPMENT_CATEGORIES.SITE_VEHICLES]: 'Site Vehicles',
  [EQUIPMENT_CATEGORIES.MANAGEMENT_VEHICLES]: 'Management Vehicles',
};

// ============================================
// PAYMENT MODES
// ============================================
export const PAYMENT_MODES = {
  CASH: 'cash',
  BANK_TRANSFER: 'bank_transfer',
  CHEQUE: 'cheque',
  UPI: 'upi',
  CARD: 'card',
  OTHER: 'other',
} as const;

export type PaymentMode = typeof PAYMENT_MODES[keyof typeof PAYMENT_MODES];

export const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = {
  [PAYMENT_MODES.CASH]: 'Cash',
  [PAYMENT_MODES.BANK_TRANSFER]: 'Bank Transfer',
  [PAYMENT_MODES.CHEQUE]: 'Cheque',
  [PAYMENT_MODES.UPI]: 'UPI',
  [PAYMENT_MODES.CARD]: 'Card',
  [PAYMENT_MODES.OTHER]: 'Other',
};

// ============================================
// PAYMENT STATUS
// ============================================
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  PAID: 'paid',
  PARTIALLY_PAID: 'partially_paid',
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PAYMENT_STATUS.PENDING]: 'Pending',
  [PAYMENT_STATUS.APPROVED]: 'Approved',
  [PAYMENT_STATUS.PAID]: 'Paid',
  [PAYMENT_STATUS.PARTIALLY_PAID]: 'Partially Paid',
};

// ============================================
// APPROVAL STATUS
// ============================================
export const APPROVAL_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  VERIFIED: 'verified',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
} as const;

export type ApprovalStatus = typeof APPROVAL_STATUS[keyof typeof APPROVAL_STATUS];

// ============================================
// EXPENSE CATEGORIES
// ============================================
export const EXPENSE_CATEGORIES = {
  REPAIRS: 'repairs',
  WELDING: 'welding',
  TYRES: 'tyres',
  MACHINERY_SERVICE: 'machinery_service',
  ELECTRICAL: 'electrical',
  WATER: 'water',
  SECURITY: 'security',
  TRANSPORT: 'transport',
  GUEST: 'guest',
  SITE_MAINTENANCE: 'site_maintenance',
  COMMUNICATION: 'communication',
  OTHER: 'other',
} as const;

// ============================================
// MANAGEMENT EXPENSE CATEGORIES
// ============================================
export const MGMT_EXPENSE_CATEGORIES = {
  GOVERNMENT_LIAISON: 'government_liaison',
  POLICE_LAW_ORDER: 'police_law_order',
  VILLAGE_DEVELOPMENT_CSR: 'village_development_csr',
  FINANCE: 'finance',
  INCIDENTAL: 'incidental',
} as const;

// ============================================
// COST CENTRES
// ============================================
export const COST_CENTRES = {
  MINING_PRODUCTION: 'mining_production',
  DRESSING: 'dressing',
  FUEL: 'fuel',
  LABOUR: 'labour',
  KITCHEN: 'kitchen',
  PERMITS: 'permits',
  MAINTENANCE: 'maintenance',
  ADMINISTRATION: 'administration',
  TRANSPORT: 'transport',
  MANAGEMENT_SPECIAL: 'management_special',
  FINANCE: 'finance',
  OTHER: 'other',
} as const;

export const COST_CENTRE_LABELS: Record<string, string> = {
  mining_production: 'Mining / Production',
  dressing: 'Dressing',
  fuel: 'Fuel',
  labour: 'Labour',
  kitchen: 'Kitchen',
  permits: 'Permits',
  maintenance: 'Maintenance',
  administration: 'Administration',
  transport: 'Transport',
  management_special: 'Management / Special',
  finance: 'Finance',
  other: 'Other',
};

// ============================================
// PURCHASE CATEGORIES
// ============================================
export const PURCHASE_CATEGORIES = {
  FUEL: 'fuel',
  MACHINERY: 'machinery',
  MINE_OPERATIONS: 'mine_operations',
  OFFICE: 'office',
  KITCHEN: 'kitchen',
} as const;

// ============================================
// NAVIGATION
// ============================================
export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
  { id: 'production', label: 'Block Production', path: '/production', icon: 'Mountain' },
  { id: 'dressing', label: 'Dressing', path: '/dressing', icon: 'Scissors' },
  { id: 'inventory', label: 'Block Inventory', path: '/inventory', icon: 'Package' },
  { id: 'equipment', label: 'Vehicles & Equipment', path: '/equipment', icon: 'Truck' },
  { id: 'fuel', label: 'Fuel Control', path: '/fuel', icon: 'Fuel' },
  { id: 'labour', label: 'Labour & Salaries', path: '/labour', icon: 'Users' },
  { id: 'kitchen', label: 'Kitchen', path: '/kitchen', icon: 'ChefHat' },
  { id: 'expenses', label: 'Expenses', path: '/expenses', icon: 'Receipt' },
  { id: 'management-expenses', label: 'Management Expenses', path: '/management-expenses', icon: 'Shield' },
  { id: 'payments', label: 'Payments & Finance', path: '/payments', icon: 'CreditCard' },
  { id: 'reports', label: 'Reports', path: '/reports', icon: 'BarChart3' },
  { id: 'admin', label: 'Masters & Settings', path: '/admin', icon: 'Settings' },
] as const;

// ============================================
// CLOUDINARY
// ============================================
export const CLOUDINARY_CONFIG = {
  cloudName: 'v5openeu',
  uploadPreset: 'benitagranites',
  uploadUrl: 'https://api.cloudinary.com/v1_1/v5openeu/image/upload',
} as const;

// ============================================
// CURRENCY FORMATTER
// ============================================
export const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const INR_DETAILED = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
