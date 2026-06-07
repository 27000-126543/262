
export type UserRole = 'shipping' | 'owner' | 'driver' | 'yard' | 'operation' | 'legal' | 'finance' | 'admin';

export type MemberLevel = 'normal' | 'silver' | 'gold';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  company?: string;
  phone: string;
  email?: string;
  avatar?: string;
  memberLevel?: MemberLevel;
  annualThroughput?: number;
}

export interface Vessel {
  id: string;
  name: string;
  imo: string;
  vesselType: string;
  length: number;
  width: number;
  draft: number;
  tonnage: number;
  teu: number;
  flag: string;
  companyId: string;
  companyName: string;
}

export type ForecastStatus = 'pending' | 'approved' | 'rejected' | 'arrived';

export interface VesselForecast {
  id: string;
  vesselId: string;
  vesselName: string;
  eta: string;
  etd: string;
  originPort: string;
  nextPort: string;
  cargoType: string;
  teuIn: number;
  teuOut: number;
  status: ForecastStatus;
  recommendedBerth?: string;
  recommendedTime?: string;
  createTime: string;
}

export type BerthStatus = 'scheduled' | 'berthed' | 'completed' | 'cancelled';

export interface BerthPlan {
  id: string;
  vesselId: string;
  vesselName: string;
  berthNo: string;
  berthTime: string;
  departureTime: string;
  status: BerthStatus;
  operationType: string;
  craneAssigned: string[];
}

export type ContainerSize = '20GP' | '40GP' | '40HQ' | '45HQ';
export type ContainerStatus = 'empty' | 'loaded' | 'damaged';

export interface Container {
  id: string;
  containerNo: string;
  size: ContainerSize;
  type: string;
  status: ContainerStatus;
  location?: string;
  yardBlock?: string;
  yardSlot?: string;
  blNo?: string;
  cargoDesc?: string;
  weight?: number;
  inGateTime?: string;
  outGateTime?: string;
  vesselId?: string;
  vesselName?: string;
  ownerId?: string;
  ownerName?: string;
}

export interface YardBlock {
  id: string;
  blockNo: string;
  area: string;
  totalSlots: number;
  usedSlots: number;
  maxTier: number;
  maxRow: number;
  maxBay: number;
  equipmentAssigned: string[];
}

export type OrderStatus = 'created' | 'in-transit' | 'arrived' | 'customs' | 'released' | 'delivered';

export interface ShippingOrder {
  id: string;
  orderNo: string;
  blNo: string;
  containerNos: string[];
  shipper: string;
  consignee: string;
  notifyParty: string;
  pol: string;
  pod: string;
  etd: string;
  eta: string;
  cargoDesc: string;
  weight: number;
  teu: number;
  status: OrderStatus;
  estimatedReleaseTime?: string;
}

export type CustomsStatus = 'draft' | 'submitted' | 'verified' | 'customs-pending' | 'cleared' | 'rejected';

export interface CustomsDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadTime: string;
}

export interface CustomsDeclaration {
  id: string;
  orderId: string;
  orderNo: string;
  declarationNo?: string;
  shipper: string;
  consignee: string;
  cargoDesc: string;
  hsCode: string;
  value: number;
  currency: string;
  documents: CustomsDocument[];
  status: CustomsStatus;
  customsBroker?: string;
  submitTime?: string;
  clearTime?: string;
  remarks?: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';

export interface PickupAppointment {
  id: string;
  appointmentNo: string;
  driverId: string;
  driverName: string;
  plateNo: string;
  containerNo: string;
  orderNo: string;
  appointmentDate: string;
  timeSlot: string;
  recommendedSlot?: string;
  status: AppointmentStatus;
  checkInTime?: string;
  checkOutTime?: string;
  penaltyAmount?: number;
}

export type BillStatus = 'unpaid' | 'partial' | 'paid' | 'overdue';
export type BillItemType = 'loading' | 'unloading' | 'storage' | 'port-fee' | 'customs-fee' | 'other';

export interface BillItem {
  id: string;
  itemType: BillItemType;
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  relatedContainer?: string;
  relatedVessel?: string;
  operationDate?: string;
}

export interface Bill {
  id: string;
  billNo: string;
  customerId: string;
  customerName: string;
  period: string;
  items: BillItem[];
  totalAmount: number;
  paidAmount: number;
  status: BillStatus;
  dueDate: string;
  createTime: string;
  paidTime?: string;
}

export type ClaimType = 'damage' | 'loss' | 'delay' | 'other';
export type ClaimStatus = 'pending' | 'reviewing' | 'approved' | 'rejected' | 'paid';
export type ApplicantType = 'owner' | 'shipping' | 'driver';
export type ApprovalAction = 'approve' | 'reject' | 'transfer';

export interface ApprovalRecord {
  id: string;
  approverId: string;
  approverName: string;
  approverRole: string;
  action: ApprovalAction;
  comments: string;
  approveTime: string;
}

export interface Claim {
  id: string;
  claimNo: string;
  applicantId: string;
  applicantName: string;
  applicantType: ApplicantType;
  containerNo?: string;
  orderNo?: string;
  claimType: ClaimType;
  description: string;
  evidenceUrls: string[];
  claimAmount: number;
  status: ClaimStatus;
  currentApprover?: string;
  approvalHistory: ApprovalRecord[];
  paidAmount?: number;
  paidTime?: string;
  createTime: string;
}

export type BenefitType = 'priority' | 'discount' | 'extended' | 'service';

export interface MemberBenefit {
  id: string;
  name: string;
  description: string;
  type: BenefitType;
  value: number;
  unit: string;
}

export interface MemberLevelConfig {
  level: MemberLevel;
  name: string;
  minThroughput: number;
  benefits: MemberBenefit[];
}

export interface DailyThroughput {
  date: string;
  teuIn: number;
  teuOut: number;
  total: number;
}

export interface DashboardStats {
  berthUtilization: number[];
  gatePassRate: number[];
  yardSaturation: number;
  operationEfficiency: number;
  complaintRate: number;
  dailyThroughput: DailyThroughput[];
  vesselCalls: number;
  containerHandled: number;
  revenue: number;
}

export interface PredictionData {
  date: string;
  predictedThroughput: number;
  actualThroughput?: number;
  confidence: number;
}

export interface ResourceSuggestion {
  id: string;
  type: string;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
}

export interface MenuItem {
  key: string;
  label: string;
  icon?: string;
  path?: string;
  children?: MenuItem[];
  roles?: UserRole[];
}

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
