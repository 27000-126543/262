
import {
  User,
  Vessel,
  VesselForecast,
  BerthPlan,
  Container,
  YardBlock,
  ShippingOrder,
  CustomsDeclaration,
  PickupAppointment,
  Bill,
  Claim,
  DashboardStats,
  PredictionData,
  ResourceSuggestion,
} from '@/types';
import dayjs from 'dayjs';

const generateId = (): string => Math.random().toString(36).substring(2, 11);

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    role: 'admin',
    name: '系统管理员',
    phone: '13800138000',
    email: 'admin@port.com',
    company: '智慧港口运营有限公司',
  },
  {
    id: '2',
    username: 'shipping01',
    role: 'shipping',
    name: '中远海运',
    phone: '13800138001',
    email: 'shipping@cosco.com',
    company: '中远海运集装箱运输有限公司',
    memberLevel: 'gold',
    annualThroughput: 125000,
  },
  {
    id: '3',
    username: 'owner01',
    role: 'owner',
    name: '阿里巴巴国际贸易',
    phone: '13800138002',
    email: 'trade@alibaba.com',
    company: '阿里巴巴国际贸易有限公司',
    memberLevel: 'silver',
    annualThroughput: 25000,
  },
  {
    id: '4',
    username: 'driver01',
    role: 'driver',
    name: '张师傅',
    phone: '13900139001',
    company: '顺丰物流运输有限公司',
  },
  {
    id: '5',
    username: 'operation01',
    role: 'operation',
    name: '李运营',
    phone: '13700137001',
    email: 'operation@port.com',
    company: '智慧港口运营有限公司',
  },
  {
    id: '6',
    username: 'legal01',
    role: 'legal',
    name: '王法务',
    phone: '13600136001',
    email: 'legal@port.com',
    company: '智慧港口运营有限公司',
  },
  {
    id: '7',
    username: 'finance01',
    role: 'finance',
    name: '赵财务',
    phone: '13500135001',
    email: 'finance@port.com',
    company: '智慧港口运营有限公司',
  },
];

export const mockVessels: Vessel[] = [
  {
    id: 'v1',
    name: '中远上海',
    imo: 'IMO9467285',
    vesselType: '集装箱船',
    length: 366,
    width: 51,
    draft: 15.5,
    tonnage: 187500,
    teu: 19100,
    flag: '中国香港',
    companyId: '2',
    companyName: '中远海运集装箱运输有限公司',
  },
  {
    id: 'v2',
    name: '马士基埃塞克斯',
    imo: 'IMO9619933',
    vesselType: '集装箱船',
    length: 399,
    width: 59,
    draft: 16.0,
    tonnage: 214000,
    teu: 20568,
    flag: '丹麦',
    companyId: '2',
    companyName: '马士基航运有限公司',
  },
  {
    id: 'v3',
    name: '达飞泰姬陵',
    imo: 'IMO9776418',
    vesselType: '集装箱船',
    length: 400,
    width: 61,
    draft: 16.5,
    tonnage: 225000,
    teu: 23112,
    flag: '法国',
    companyId: '2',
    companyName: '达飞海运集团',
  },
  {
    id: 'v4',
    name: '中海金星',
    imo: 'IMO9305467',
    vesselType: '集装箱船',
    length: 335,
    width: 48,
    draft: 14.5,
    tonnage: 153000,
    teu: 14074,
    flag: '中国',
    companyId: '2',
    companyName: '中远海运集装箱运输有限公司',
  },
];

export const mockForecasts: VesselForecast[] = [
  {
    id: 'f1',
    vesselId: 'v1',
    vesselName: '中远上海',
    eta: dayjs().add(1, 'day').format('YYYY-MM-DD HH:mm'),
    etd: dayjs().add(3, 'day').format('YYYY-MM-DD HH:mm'),
    originPort: '新加坡',
    nextPort: '釜山',
    cargoType: '集装箱',
    teuIn: 4500,
    teuOut: 3200,
    status: 'approved',
    recommendedBerth: 'B1',
    recommendedTime: dayjs().add(1, 'day').hour(8).format('YYYY-MM-DD HH:mm'),
    createTime: dayjs().subtract(2, 'day').format('YYYY-MM-DD HH:mm'),
  },
  {
    id: 'f2',
    vesselId: 'v2',
    vesselName: '马士基埃塞克斯',
    eta: dayjs().add(2, 'day').format('YYYY-MM-DD HH:mm'),
    etd: dayjs().add(4, 'day').format('YYYY-MM-DD HH:mm'),
    originPort: '鹿特丹',
    nextPort: '神户',
    cargoType: '集装箱',
    teuIn: 6200,
    teuOut: 4800,
    status: 'pending',
    createTime: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm'),
  },
  {
    id: 'f3',
    vesselId: 'v3',
    vesselName: '达飞泰姬陵',
    eta: dayjs().add(4, 'day').format('YYYY-MM-DD HH:mm'),
    etd: dayjs().add(6, 'day').format('YYYY-MM-DD HH:mm'),
    originPort: '勒阿弗尔',
    nextPort: '香港',
    cargoType: '集装箱',
    teuIn: 7100,
    teuOut: 5500,
    status: 'approved',
    recommendedBerth: 'B3',
    recommendedTime: dayjs().add(4, 'day').hour(14).format('YYYY-MM-DD HH:mm'),
    createTime: dayjs().subtract(3, 'day').format('YYYY-MM-DD HH:mm'),
  },
];

export const mockBerthPlans: BerthPlan[] = [
  {
    id: 'bp1',
    vesselId: 'v4',
    vesselName: '中海金星',
    berthNo: 'B2',
    berthTime: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm'),
    departureTime: dayjs().add(1, 'day').format('YYYY-MM-DD HH:mm'),
    status: 'berthed',
    operationType: '装卸作业',
    craneAssigned: ['QC01', 'QC02'],
  },
  {
    id: 'bp2',
    vesselId: 'v1',
    vesselName: '中远上海',
    berthNo: 'B1',
    berthTime: dayjs().add(1, 'day').hour(8).format('YYYY-MM-DD HH:mm'),
    departureTime: dayjs().add(3, 'day').hour(18).format('YYYY-MM-DD HH:mm'),
    status: 'scheduled',
    operationType: '装卸作业',
    craneAssigned: ['QC01', 'QC02', 'QC03'],
  },
  {
    id: 'bp3',
    vesselId: 'v3',
    vesselName: '达飞泰姬陵',
    berthNo: 'B3',
    berthTime: dayjs().add(4, 'day').hour(14).format('YYYY-MM-DD HH:mm'),
    departureTime: dayjs().add(6, 'day').hour(10).format('YYYY-MM-DD HH:mm'),
    status: 'scheduled',
    operationType: '装卸作业',
    craneAssigned: ['QC04', 'QC05', 'QC06'],
  },
];

export const mockContainers: Container[] = [
  {
    id: 'c1',
    containerNo: 'MSKU1234567',
    size: '40HQ',
    type: '干货箱',
    status: 'loaded',
    yardBlock: 'A1',
    yardSlot: '01-02-03',
    blNo: 'BL202401001',
    cargoDesc: '电子产品',
    weight: 18500,
    inGateTime: dayjs().subtract(2, 'day').format('YYYY-MM-DD HH:mm'),
    vesselName: '中远上海',
    ownerName: '阿里巴巴国际贸易',
  },
  {
    id: 'c2',
    containerNo: 'COSU7654321',
    size: '20GP',
    type: '干货箱',
    status: 'loaded',
    yardBlock: 'A1',
    yardSlot: '01-03-02',
    blNo: 'BL202401002',
    cargoDesc: '服装纺织品',
    weight: 12300,
    inGateTime: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm'),
    vesselName: '马士基埃塞克斯',
    ownerName: '阿里巴巴国际贸易',
  },
  {
    id: 'c3',
    containerNo: 'CMAU9876543',
    size: '40GP',
    type: '冷藏箱',
    status: 'loaded',
    yardBlock: 'B2',
    yardSlot: '02-01-01',
    blNo: 'BL202401003',
    cargoDesc: '生鲜食品',
    weight: 22000,
    inGateTime: dayjs().subtract(3, 'day').format('YYYY-MM-DD HH:mm'),
    vesselName: '达飞泰姬陵',
    ownerName: '京东生鲜供应链',
  },
  {
    id: 'c4',
    containerNo: 'OOLU2468135',
    size: '40HQ',
    type: '干货箱',
    status: 'empty',
    yardBlock: 'C3',
    yardSlot: '03-04-02',
    inGateTime: dayjs().subtract(5, 'day').format('YYYY-MM-DD HH:mm'),
    vesselName: '中海金星',
  },
];

export const mockYardBlocks: YardBlock[] = [
  { id: 'y1', blockNo: 'A1', area: 'A区', totalSlots: 200, usedSlots: 145, maxTier: 5, maxRow: 8, maxBay: 20, equipmentAssigned: ['RT01', 'RT02'] },
  { id: 'y2', blockNo: 'A2', area: 'A区', totalSlots: 200, usedSlots: 168, maxTier: 5, maxRow: 8, maxBay: 20, equipmentAssigned: ['RT03'] },
  { id: 'y3', blockNo: 'B1', area: 'B区', totalSlots: 180, usedSlots: 95, maxTier: 4, maxRow: 6, maxBay: 18, equipmentAssigned: ['RT04', 'RT05'] },
  { id: 'y4', blockNo: 'B2', area: 'B区', totalSlots: 180, usedSlots: 120, maxTier: 4, maxRow: 6, maxBay: 18, equipmentAssigned: ['RT06'] },
  { id: 'y5', blockNo: 'C1', area: 'C区', totalSlots: 150, usedSlots: 80, maxTier: 4, maxRow: 6, maxBay: 15, equipmentAssigned: ['RT07'] },
  { id: 'y6', blockNo: 'C2', area: 'C区', totalSlots: 150, usedSlots: 45, maxTier: 4, maxRow: 6, maxBay: 15, equipmentAssigned: ['RT08'] },
];

export const mockOrders: ShippingOrder[] = [
  {
    id: 'o1',
    orderNo: 'SO202401001',
    blNo: 'BL202401001',
    containerNos: ['MSKU1234567'],
    shipper: '深圳科技有限公司',
    consignee: '洛杉矶进口商',
    notifyParty: '洛杉矶进口商',
    pol: '深圳',
    pod: '洛杉矶',
    etd: dayjs().add(2, 'day').format('YYYY-MM-DD'),
    eta: dayjs().add(16, 'day').format('YYYY-MM-DD'),
    cargoDesc: '电子产品',
    weight: 18500,
    teu: 2,
    status: 'arrived',
    estimatedReleaseTime: dayjs().add(1, 'day').format('YYYY-MM-DD HH:mm'),
  },
  {
    id: 'o2',
    orderNo: 'SO202401002',
    blNo: 'BL202401002',
    containerNos: ['COSU7654321'],
    shipper: '杭州服装有限公司',
    consignee: '纽约零售商',
    notifyParty: '纽约零售商',
    pol: '宁波',
    pod: '纽约',
    etd: dayjs().add(3, 'day').format('YYYY-MM-DD'),
    eta: dayjs().add(25, 'day').format('YYYY-MM-DD'),
    cargoDesc: '服装纺织品',
    weight: 12300,
    teu: 1,
    status: 'customs',
    estimatedReleaseTime: dayjs().add(3, 'day').format('YYYY-MM-DD HH:mm'),
  },
  {
    id: 'o3',
    orderNo: 'SO202401003',
    blNo: 'BL202401003',
    containerNos: ['CMAU9876543'],
    shipper: '上海食品有限公司',
    consignee: '东京超市连锁',
    notifyParty: '东京超市连锁',
    pol: '上海',
    pod: '东京',
    etd: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    eta: dayjs().add(5, 'day').format('YYYY-MM-DD'),
    cargoDesc: '生鲜食品',
    weight: 22000,
    teu: 2,
    status: 'released',
  },
];

export const mockCustomsDeclarations: CustomsDeclaration[] = [
  {
    id: 'cd1',
    orderId: 'o1',
    orderNo: 'SO202401001',
    declarationNo: 'CUS202401001',
    shipper: '深圳科技有限公司',
    consignee: '洛杉矶进口商',
    cargoDesc: '电子产品',
    hsCode: '84713000',
    value: 150000,
    currency: 'USD',
    documents: [
      { id: 'd1', name: '商业发票.pdf', type: 'invoice', url: '#', uploadTime: dayjs().subtract(2, 'day').format('YYYY-MM-DD HH:mm') },
      { id: 'd2', name: '装箱单.pdf', type: 'packing', url: '#', uploadTime: dayjs().subtract(2, 'day').format('YYYY-MM-DD HH:mm') },
      { id: 'd3', name: '提单.pdf', type: 'bl', url: '#', uploadTime: dayjs().subtract(2, 'day').format('YYYY-MM-DD HH:mm') },
    ],
    status: 'cleared',
    customsBroker: '深圳报关行',
    submitTime: dayjs().subtract(2, 'day').format('YYYY-MM-DD HH:mm'),
    clearTime: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm'),
  },
  {
    id: 'cd2',
    orderId: 'o2',
    orderNo: 'SO202401002',
    declarationNo: 'CUS202401002',
    shipper: '杭州服装有限公司',
    consignee: '纽约零售商',
    cargoDesc: '服装纺织品',
    hsCode: '61091000',
    value: 45000,
    currency: 'USD',
    documents: [
      { id: 'd1', name: '商业发票.pdf', type: 'invoice', url: '#', uploadTime: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm') },
      { id: 'd2', name: '装箱单.pdf', type: 'packing', url: '#', uploadTime: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm') },
    ],
    status: 'customs-pending',
    customsBroker: '宁波报关行',
    submitTime: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm'),
  },
];

export const mockAppointments: PickupAppointment[] = [
  {
    id: 'a1',
    appointmentNo: 'APT202401001',
    driverId: '4',
    driverName: '张师傅',
    plateNo: '粤B12345',
    containerNo: 'MSKU1234567',
    orderNo: 'SO202401001',
    appointmentDate: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    timeSlot: '09:00-11:00',
    recommendedSlot: '14:00-16:00',
    status: 'confirmed',
  },
  {
    id: 'a2',
    appointmentNo: 'APT202401002',
    driverId: '4',
    driverName: '张师傅',
    plateNo: '粤B12345',
    containerNo: 'CMAU9876543',
    orderNo: 'SO202401003',
    appointmentDate: dayjs().format('YYYY-MM-DD'),
    timeSlot: '10:00-12:00',
    status: 'completed',
    checkInTime: dayjs().hour(10).minute(15).format('YYYY-MM-DD HH:mm'),
    checkOutTime: dayjs().hour(11).minute(30).format('YYYY-MM-DD HH:mm'),
  },
];

export const mockBills: Bill[] = [
  {
    id: 'b1',
    billNo: 'BILL202401001',
    customerId: '3',
    customerName: '阿里巴巴国际贸易',
    period: '2024年1月',
    items: [
      { id: 'bi1', itemType: 'unloading', itemName: '卸船费', quantity: 3, unit: 'TEU', unitPrice: 350, amount: 1050, relatedContainer: 'MSKU1234567', operationDate: dayjs().subtract(2, 'day').format('YYYY-MM-DD') },
      { id: 'bi2', itemType: 'storage', itemName: '堆存费', quantity: 5, unit: '天', unitPrice: 20, amount: 100, relatedContainer: 'MSKU1234567', operationDate: dayjs().subtract(2, 'day').format('YYYY-MM-DD') },
      { id: 'bi3', itemType: 'port-fee', itemName: '港务费', quantity: 3, unit: 'TEU', unitPrice: 80, amount: 240, operationDate: dayjs().subtract(2, 'day').format('YYYY-MM-DD') },
    ],
    totalAmount: 1390,
    paidAmount: 0,
    status: 'unpaid',
    dueDate: dayjs().add(15, 'day').format('YYYY-MM-DD'),
    createTime: dayjs().format('YYYY-MM-DD HH:mm'),
  },
  {
    id: 'b2',
    billNo: 'BILL202312001',
    customerId: '3',
    customerName: '阿里巴巴国际贸易',
    period: '2023年12月',
    items: [
      { id: 'bi1', itemType: 'loading', itemName: '装船费', quantity: 10, unit: 'TEU', unitPrice: 320, amount: 3200, operationDate: dayjs().subtract(20, 'day').format('YYYY-MM-DD') },
      { id: 'bi2', itemType: 'storage', itemName: '堆存费', quantity: 3, unit: '天', unitPrice: 20, amount: 60, operationDate: dayjs().subtract(25, 'day').format('YYYY-MM-DD') },
      { id: 'bi3', itemType: 'customs-fee', itemName: '报关费', quantity: 2, unit: '票', unitPrice: 500, amount: 1000, operationDate: dayjs().subtract(22, 'day').format('YYYY-MM-DD') },
    ],
    totalAmount: 4260,
    paidAmount: 4260,
    status: 'paid',
    dueDate: dayjs().subtract(10, 'day').format('YYYY-MM-DD'),
    createTime: dayjs().subtract(25, 'day').format('YYYY-MM-DD HH:mm'),
    paidTime: dayjs().subtract(12, 'day').format('YYYY-MM-DD HH:mm'),
  },
];

export const mockClaims: Claim[] = [
  {
    id: 'cl1',
    claimNo: 'CLM202401001',
    applicantId: '3',
    applicantName: '阿里巴巴国际贸易',
    applicantType: 'owner',
    containerNo: 'MSKU1234567',
    orderNo: 'SO202401001',
    claimType: 'damage',
    description: '集装箱外部有明显划痕，内部部分货物包装破损，疑似装卸过程中造成',
    evidenceUrls: ['#', '#', '#'],
    claimAmount: 15000,
    status: 'reviewing',
    currentApprover: 'operation',
    approvalHistory: [
      { id: 'ah1', approverId: '5', approverName: '李运营', approverRole: 'operation', action: 'approve', comments: '情况属实，建议赔付', approveTime: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm') },
    ],
    createTime: dayjs().subtract(2, 'day').format('YYYY-MM-DD HH:mm'),
  },
  {
    id: 'cl2',
    claimNo: 'CLM202401002',
    applicantId: '2',
    applicantName: '中远海运',
    applicantType: 'shipping',
    claimType: 'delay',
    description: '因泊位调度延误，导致船舶滞港12小时，产生额外燃油费用',
    evidenceUrls: ['#', '#'],
    claimAmount: 85000,
    status: 'pending',
    approvalHistory: [],
    createTime: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm'),
  },
  {
    id: 'cl3',
    claimNo: 'CLM202312005',
    applicantId: '3',
    applicantName: '阿里巴巴国际贸易',
    applicantType: 'owner',
    containerNo: 'COSU2468013',
    orderNo: 'SO202312045',
    claimType: 'loss',
    description: '部分货物缺失，共缺失电子产品10箱',
    evidenceUrls: ['#', '#', '#', '#'],
    claimAmount: 35000,
    status: 'approved',
    currentApprover: 'finance',
    approvalHistory: [
      { id: 'ah1', approverId: '5', approverName: '李运营', approverRole: 'operation', action: 'approve', comments: '核实损失情况，建议按80%赔付', approveTime: dayjs().subtract(8, 'day').format('YYYY-MM-DD HH:mm') },
      { id: 'ah2', approverId: '6', approverName: '王法务', approverRole: 'legal', action: 'approve', comments: '合同条款支持赔付', approveTime: dayjs().subtract(5, 'day').format('YYYY-MM-DD HH:mm') },
    ],
    paidAmount: 28000,
    createTime: dayjs().subtract(10, 'day').format('YYYY-MM-DD HH:mm'),
  },
];

export const mockDashboardStats: DashboardStats = {
  berthUtilization: [75, 82, 68, 90, 78, 85, 72],
  gatePassRate: [95, 92, 98, 94, 96, 93, 97],
  yardSaturation: 0.72,
  operationEfficiency: 28.5,
  complaintRate: 0.023,
  dailyThroughput: Array.from({ length: 7 }, (_, i) => ({
    date: dayjs().subtract(6 - i, 'day').format('MM-DD'),
    teuIn: Math.floor(Math.random() * 3000) + 2000,
    teuOut: Math.floor(Math.random() * 2500) + 1500,
    total: Math.floor(Math.random() * 5000) + 4000,
  })),
  vesselCalls: 48,
  containerHandled: 38520,
  revenue: 8560000,
};

export const mockPredictions: PredictionData[] = Array.from({ length: 7 }, (_, i) => ({
  date: dayjs().add(i, 'day').format('MM-DD'),
  predictedThroughput: Math.floor(Math.random() * 3000) + 5000,
  confidence: Math.random() * 0.2 + 0.75,
}));

export const mockSuggestions: ResourceSuggestion[] = [
  {
    id: 's1',
    type: 'personnel',
    suggestion: '建议周三、周四增加夜班操作人员2名',
    priority: 'high',
    reason: '预测显示周三、周四吞吐量将达到峰值，现有人员配置可能无法满足需求',
  },
  {
    id: 's2',
    type: 'equipment',
    suggestion: '建议增加A区堆场龙门吊作业时间',
    priority: 'medium',
    reason: 'A区堆场饱和度达到84%，需要加快周转效率',
  },
  {
    id: 's3',
    type: 'berth',
    suggestion: '建议预留B2泊位作为应急备用',
    priority: 'low',
    reason: '下周到港船舶较多，建议保留应急泊位',
  },
];

export const authenticate = (username: string, password: string): User | null => {
  if (password === '123456') {
    const user = mockUsers.find((u) => u.username === username);
    return user || null;
  }
  return null;
};

export const generateMockId = generateId;

export interface TideData {
  time: string;
  height: number;
  type: 'high' | 'low';
}

export interface BerthInfo {
  id: string;
  berthNo: string;
  name: string;
  length: number;
  maxDraft: number;
  status: 'available' | 'occupied' | 'scheduled' | 'maintenance';
  currentVessel?: string;
  availableFrom?: string;
  cranes: string[];
}

export const mockTideData: TideData[] = Array.from({ length: 24 }, (_, i) => ({
  time: dayjs().hour(i).minute(0).format('YYYY-MM-DD HH:mm'),
  height: 8 + Math.sin((i - 6) * Math.PI / 6) * 3 + Math.random() * 0.5,
  type: i >= 6 && i <= 18 ? 'high' : 'low',
}));

export const mockBerthInfos: BerthInfo[] = [
  { id: 'berth1', berthNo: 'B1', name: '1号泊位', length: 400, maxDraft: 16.5, status: 'scheduled', currentVessel: '中远上海', availableFrom: dayjs().add(3, 'day').format('YYYY-MM-DD HH:mm'), cranes: ['QC01', 'QC02', 'QC03'] },
  { id: 'berth2', berthNo: 'B2', name: '2号泊位', length: 380, maxDraft: 15.5, status: 'occupied', currentVessel: '中海金星', availableFrom: dayjs().add(1, 'day').format('YYYY-MM-DD HH:mm'), cranes: ['QC01', 'QC02'] },
  { id: 'berth3', berthNo: 'B3', name: '3号泊位', length: 420, maxDraft: 17.0, status: 'scheduled', currentVessel: '达飞泰姬陵', availableFrom: dayjs().add(6, 'day').format('YYYY-MM-DD HH:mm'), cranes: ['QC04', 'QC05', 'QC06'] },
  { id: 'berth4', berthNo: 'B4', name: '4号泊位', length: 360, maxDraft: 15.0, status: 'available', cranes: ['QC07', 'QC08'] },
  { id: 'berth5', berthNo: 'B5', name: '5号泊位', length: 350, maxDraft: 14.5, status: 'maintenance', cranes: ['QC09'] },
  { id: 'berth6', berthNo: 'B6', name: '6号泊位', length: 400, maxDraft: 16.0, status: 'available', cranes: ['QC10', 'QC11', 'QC12'] },
];

export interface YardInstruction {
  id: string;
  containerNo: string;
  yardBlock: string;
  yardSlot: string;
  equipment: string;
  operator: string;
  status: 'pending' | 'in-progress' | 'completed';
  createTime: string;
}

export const mockYardInstructions: YardInstruction[] = [
  { id: 'yi1', containerNo: 'MSKU1234567', yardBlock: 'A1', yardSlot: '01-02-03', equipment: 'RT01', operator: '王司机', status: 'completed', createTime: dayjs().subtract(2, 'day').format('YYYY-MM-DD HH:mm') },
  { id: 'yi2', containerNo: 'COSU7654321', yardBlock: 'A1', yardSlot: '01-03-02', equipment: 'RT02', operator: '李司机', status: 'completed', createTime: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm') },
];

export interface TimeSlot {
  slot: string;
  available: number;
  total: number;
  busyLevel: 'low' | 'medium' | 'high';
  recommended: boolean;
}

export const generateTimeSlots = (): TimeSlot[] => {
  const slots = ['08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00', '16:00-18:00', '18:00-20:00'];
  return slots.map((slot, index) => {
    const available = Math.floor(Math.random() * 10) + 2;
    const total = 15;
    const ratio = 1 - available / total;
    let busyLevel: 'low' | 'medium' | 'high' = 'low';
    if (ratio > 0.7) busyLevel = 'high';
    else if (ratio > 0.4) busyLevel = 'medium';
    return {
      slot,
      available,
      total,
      busyLevel,
      recommended: index === 3,
    };
  });
};
