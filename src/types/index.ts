// Benita Granites — TypeScript Type Definitions
import type { Timestamp } from 'firebase/firestore';
import type { UserRole, BlockStatus, BlockCategory, PaymentMode, PaymentStatus, ApprovalStatus } from '@/constants';

// ============================================
// USER
// ============================================
export interface AppUser {
  uid: string;
  username: string;
  email: string;
  photoURL: string | null;
  authProvider: 'email' | 'google';
  role: UserRole;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}

// ============================================
// BLOCK
// ============================================
export interface Block {
  id: string;
  blockId: string; // BG-XXXXX
  category: BlockCategory;
  graniteVariety: string;
  pit: string;
  bench: string;
  dateExcavated: Timestamp;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  cbm: number;
  quality: string;
  photos: string[];
  currentLocation: string;
  status: BlockStatus;
  ownerId: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// DRESSING
// ============================================
export interface DressingRecord {
  id: string;
  blockId: string;
  startDate: Timestamp;
  completionDate: Timestamp | null;
  dressingType: 'normal' | 'buyer_specific';
  buyer: string | null;
  requiredDimensions: {
    length: number;
    width: number;
    height: number;
  } | null;
  specialRequirements: string;
  dressingCost: number;
  labourCost: number;
  equipmentCost: number;
  totalCost: number;
  costPerCBM: number;
  status: 'in_progress' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// EQUIPMENT
// ============================================
export interface Equipment {
  id: string;
  equipmentId: string;
  category: string;
  internalName: string;
  registrationNumber: string;
  operator: string;
  status: 'active' | 'inactive' | 'under_maintenance';
  hourMeter: number;
  fuelType: string;
  fuelMeasurementMethod: 'gauge' | 'manual' | 'meter';
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// FUEL
// ============================================
export interface FuelEntry {
  id: string;
  date: Timestamp;
  equipmentId: string;
  
  // Readings
  openingHour: number;
  closingHour: number;
  hoursUsed: number;
  
  // Fuel details
  dieselFilled: number;
  ratePerLitre: number;
  totalCost: number;
  efficiency: number; // litres per hour
  
  // Optional proofs
  receiptPhoto?: string;
  hourMeterPhoto?: string;
  
  operator: string;
  location: string;
  
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface GeneratorFuelEntry {
  id: string;
  generatorId: string; // e.g. DG-02
  date: Timestamp;
  
  // Readings
  openingHour: number;
  closingHour: number;
  runningHours: number; // calculated
  
  // Fuel
  dieselLitres: number;
  dieselRate: number;
  dieselCost: number; // calculated
  
  load?: string; // Optional load info
  operator: string;
  remarks?: string;
  
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FuelHandover {
  id: string;
  date: Timestamp;
  equipmentId: string;
  operatorId: string;
  securityGuardId: string;
  operatorReading: number;
  securityVerified: boolean;
  photos: string[];
  hourMeter: number;
  operatorConfirmedAt: Timestamp;
  securityConfirmedAt: Timestamp | null;
  createdAt: Timestamp;
}

export interface FuelException {
  id: string;
  equipmentId: string;
  date: Timestamp;
  type: 'high_consumption' | 'missing_photo' | 'missing_reading' | 'variance' | 'backdated_entry';
  expectedRange: { min: number; max: number };
  actualValue: number;
  severity: 'warning' | 'critical';
  status: 'open' | 'acknowledged' | 'resolved';
  resolvedBy: string | null;
  resolvedAt: Timestamp | null;
  notes: string;
  createdAt: Timestamp;
}

export interface FuelReconciliation {
  id: string;
  date: Timestamp;
  tankId: string;
  openingStock: number;
  receipts: number;
  issues: number;
  systemStock: number;
  physicalStock: number;
  variance: number;
  varianceReason: string;
  createdBy: string;
  createdAt: Timestamp;
}

// ============================================
// EMPLOYEE
// ============================================
export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  designation: string;
  monthlySalary: number;
  joiningDate: Timestamp;
  bankDetails?: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface DailyLabour {
  id: string;
  date: Timestamp;
  category: string;
  persons: number;
  rate: number;
  amount: number;
  department: string;
  work: string;
  approvalStatus: ApprovalStatus;
  createdBy: string;
  createdAt: Timestamp;
}

// ============================================
// KITCHEN
// ============================================
export interface KitchenEntry {
  id: string;
  date: Timestamp;
  breakfast: { served: number; teaCost: number; foodCost: number };
  lunch: { served: number; foodCost: number };
  eveningTea: { served: number; snacksCost: number };
  dinner: { served: number; foodCost: number };
  totalCost: number;
  costPerEmployee: number;
  createdBy: string;
  createdAt: Timestamp;
}

export interface KitchenStaff {
  id: string;
  name: string;
  role: 'head_cook' | 'assistant_cook' | 'helper';
  monthlySalary: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// PURCHASE
// ============================================
export interface Purchase {
  id: string;
  date: Timestamp;
  supplier: string;
  invoiceNumber: string;
  category: string;
  item: string;
  quantity: number;
  unit: string;
  rate: number;
  gst: number;
  total: number;
  paymentMode: PaymentMode;
  paymentStatus: PaymentStatus;
  billPhoto: string;
  approvalStatus: ApprovalStatus;
  createdBy: string;
  createdAt: Timestamp;
}

// ============================================
// EXPENSE
// ============================================
export interface Expense {
  id: string;
  date: Timestamp;
  category: string;
  costCentre: string;
  description: string;
  amount: number;
  supportingDocument: string;
  paymentMode: PaymentMode;
  paymentStatus: PaymentStatus;
  approvalStatus: ApprovalStatus;
  createdBy: string;
  verifiedBy: string | null;
  verifiedAt: Timestamp | null;
  approvedBy: string | null;
  approvedAt: Timestamp | null;
  paidBy: string | null;
  paidAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// MANAGEMENT EXPENSE
// ============================================
export interface ManagementExpense {
  id: string;
  date: Timestamp;
  category: string;
  subCategory: string;
  description: string;
  amount: number;
  paymentMode: PaymentMode;
  paymentStatus: PaymentStatus;
  approvalStatus: ApprovalStatus;
  supportingDocument: string;
  isConfidential: boolean;
  createdBy: string;
  approvedBy: string | null;
  approvedAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// PERMIT
// ============================================
export interface Permit {
  id: string;
  permitType: string;
  authority: string;
  period: string;
  amount: number;
  dueDate: Timestamp;
  paidDate: Timestamp | null;
  paymentReference: string;
  attachment: string;
  status: 'active' | 'expired' | 'pending_renewal';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// TRACTOR RENTAL
// ============================================
export interface TractorRental {
  id: string;
  tractorId: string;
  owner: string;
  date: Timestamp;
  workPerformed: string;
  hours: number;
  holesdrilled: number;
  rate: number;
  amount: number;
  costPerHole: number;
  approvedBy: string | null;
  paymentStatus: PaymentStatus;
  createdBy: string;
  createdAt: Timestamp;
}

// ============================================
// AUDIT LOG
// ============================================
export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'void' | 'cancel' | 'approve' | 'verify' | 'correct';
  previousValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  performedBy: string;
  performedAt: Timestamp;
  reason: string;
}

// ============================================
// NOTIFICATION
// ============================================
export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  read: boolean;
  actionUrl: string | null;
  createdAt: Timestamp;
}

// ============================================
// CALIBRATION TABLE
// ============================================
export interface CalibrationTable {
  id: string;
  generatorId: string;
  name: string;
  entries: Array<{
    depthCm: number;
    litres: number;
  }>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// DASHBOARD
// ============================================
export interface DashboardKPI {
  label: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
}
