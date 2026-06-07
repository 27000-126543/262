
import { MenuItem, MemberLevelConfig, UserRole } from '@/types';

export const ROLE_NAMES: Record<UserRole, string> = {
  shipping: '船公司',
  owner: '货主',
  driver: '司机',
  yard: '堆场操作员',
  operation: '运营人员',
  legal: '法务人员',
  finance: '财务人员',
  admin: '系统管理员',
};

export const MEMBER_LEVEL_CONFIG: MemberLevelConfig[] = [
  {
    level: 'normal',
    name: '普通会员',
    minThroughput: 0,
    benefits: [
      { id: '1', name: '基础服务', description: '享受基础港口服务', type: 'service', value: 1, unit: '项' },
      { id: '2', name: '免堆期', description: '标准免堆期', type: 'extended', value: 7, unit: '天' },
    ],
  },
  {
    level: 'silver',
    name: '银卡会员',
    minThroughput: 10000,
    benefits: [
      { id: '1', name: '优先靠泊', description: '靠泊优先级+1', type: 'priority', value: 1, unit: '级' },
      { id: '2', name: '免堆期延长', description: '免堆期延长3天', type: 'extended', value: 10, unit: '天' },
      { id: '3', name: '费用折扣', description: '港口费用95折', type: 'discount', value: 0.95, unit: '折' },
    ],
  },
  {
    level: 'gold',
    name: '金卡会员',
    minThroughput: 50000,
    benefits: [
      { id: '1', name: '最高优先靠泊', description: '最高靠泊优先级', type: 'priority', value: 3, unit: '级' },
      { id: '2', name: '免堆期延长', description: '免堆期延长7天', type: 'extended', value: 14, unit: '天' },
      { id: '3', name: '费用折扣', description: '港口费用9折', type: 'discount', value: 0.9, unit: '折' },
      { id: '4', name: '专属客服', description: '7x24小时专属客服', type: 'service', value: 1, unit: '项' },
    ],
  },
];

export const MENU_ITEMS: MenuItem[] = [
  {
    key: 'dashboard',
    label: '首页驾驶舱',
    icon: 'LayoutDashboard',
    path: '/',
  },
  {
    key: 'vessel',
    label: '船舶调度',
    icon: 'Ship',
    children: [
      { key: 'vessel-list', label: '船舶列表', path: '/vessel/list', roles: ['shipping', 'operation', 'admin'] },
      { key: 'vessel-forecast', label: '到港预报', path: '/vessel/forecast', roles: ['shipping', 'operation', 'admin'] },
      { key: 'vessel-berth', label: '泊位计划', path: '/vessel/berth', roles: ['operation', 'admin'] },
    ],
  },
  {
    key: 'container',
    label: '集装箱管理',
    icon: 'Package',
    children: [
      { key: 'container-gate-in', label: '集装箱进闸', path: '/container/gate-in', roles: ['yard', 'operation', 'admin'] },
      { key: 'container-yard', label: '堆场管理', path: '/container/yard', roles: ['yard', 'operation', 'admin'] },
      { key: 'container-tracking', label: '货物跟踪', path: '/container/tracking', roles: ['owner', 'operation', 'admin'] },
    ],
  },
  {
    key: 'customs',
    label: '报关管理',
    icon: 'FileCheck',
    children: [
      { key: 'customs-declaration', label: '报关单管理', path: '/customs/declaration', roles: ['owner', 'operation', 'admin'] },
    ],
  },
  {
    key: 'driver',
    label: '司机服务',
    icon: 'Truck',
    children: [
      { key: 'driver-appointment', label: '提箱预约', path: '/driver/appointment', roles: ['driver', 'operation', 'admin'] },
    ],
  },
  {
    key: 'finance',
    label: '费用管理',
    icon: 'DollarSign',
    children: [
      { key: 'finance-bill', label: '费用账单', path: '/finance/bill' },
      { key: 'finance-invoice', label: '发票管理', path: '/finance/invoice', roles: ['owner', 'finance', 'admin'] },
    ],
  },
  {
    key: 'claim',
    label: '异常处理',
    icon: 'AlertTriangle',
    children: [
      { key: 'claim-apply', label: '理赔申请', path: '/claim/apply', roles: ['owner', 'shipping', 'driver'] },
      { key: 'claim-approve', label: '理赔审批', path: '/claim/approve', roles: ['operation', 'legal', 'admin'] },
    ],
  },
  {
    key: 'member',
    label: '会员中心',
    icon: 'Crown',
    children: [
      { key: 'member-center', label: '我的会员', path: '/member/center', roles: ['owner', 'shipping'] },
    ],
  },
  {
    key: 'analytics',
    label: '数据分析',
    icon: 'BarChart3',
    children: [
      { key: 'analytics-operation', label: '运营看板', path: '/dashboard/operation', roles: ['operation', 'admin'] },
      { key: 'analytics-prediction', label: '预测分析', path: '/dashboard/prediction', roles: ['admin'] },
      { key: 'analytics-report', label: '报表中心', path: '/report/center', roles: ['operation', 'admin'] },
    ],
  },
  {
    key: 'system',
    label: '系统管理',
    icon: 'Settings',
    roles: ['admin'],
    children: [
      { key: 'system-user', label: '用户管理', path: '/system/user', roles: ['admin'] },
      { key: 'system-config', label: '基础数据', path: '/system/config', roles: ['admin'] },
    ],
  },
];

export const FEE_TYPES = [
  { value: 'loading', label: '装船费' },
  { value: 'unloading', label: '卸船费' },
  { value: 'storage', label: '堆存费' },
  { value: 'port-fee', label: '港务费' },
  { value: 'customs-fee', label: '报关费' },
  { value: 'other', label: '其他费用' },
];

export const CONTAINER_SIZES = [
  { value: '20GP', label: '20GP (20英尺普通箱)' },
  { value: '40GP', label: '40GP (40英尺普通箱)' },
  { value: '40HQ', label: '40HQ (40英尺高箱)' },
  { value: '45HQ', label: '45HQ (45英尺高箱)' },
];
