
import dayjs from 'dayjs';

export const formatDate = (date: string | Date, format: string = 'YYYY-MM-DD'): string => {
  if (!date) return '-';
  return dayjs(date).format(format);
};

export const formatDateTime = (date: string | Date, format: string = 'YYYY-MM-DD HH:mm:ss'): string => {
  if (!date) return '-';
  return dayjs(date).format(format);
};

export const formatCurrency = (amount: number, currency: string = 'CNY'): string => {
  if (amount === null || amount === undefined) return '-';
  const currencySymbols: Record<string, string> = {
    CNY: '¥',
    USD: '$',
    EUR: '€',
  };
  const symbol = currencySymbols[currency] || currency;
  return `${symbol}${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatNumber = (num: number, decimals: number = 0): string => {
  if (num === null || num === undefined) return '-';
  return num.toLocaleString('zh-CN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

export const formatPercent = (value: number, decimals: number = 1): string => {
  if (value === null || value === undefined) return '-';
  return `${(value * 100).toFixed(decimals)}%`;
};

export const formatTEU = (teu: number): string => {
  if (teu === null || teu === undefined) return '-';
  return `${teu.toLocaleString('zh-CN')} TEU`;
};

export const formatWeight = (weight: number): string => {
  if (weight === null || weight === undefined) return '-';
  if (weight >= 1000) {
    return `${(weight / 1000).toFixed(2)} 吨`;
  }
  return `${weight.toFixed(2)} 公斤`;
};

export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'error',
    arrived: 'processing',
    scheduled: 'default',
    berthed: 'processing',
    completed: 'success',
    cancelled: 'error',
    unpaid: 'error',
    partial: 'warning',
    paid: 'success',
    overdue: 'error',
    'in-transit': 'processing',
    'customs-pending': 'warning',
    cleared: 'success',
    released: 'success',
    delivered: 'success',
    normal: 'default',
    silver: 'processing',
    gold: 'warning',
    reviewing: 'processing',
  };
  return colorMap[status] || 'default';
};

export const getStatusText = (status: string): string => {
  const textMap: Record<string, string> = {
    pending: '待审核',
    approved: '已批准',
    rejected: '已拒绝',
    arrived: '已到港',
    scheduled: '计划中',
    berthed: '已靠泊',
    completed: '已完成',
    cancelled: '已取消',
    unpaid: '未支付',
    partial: '部分支付',
    paid: '已支付',
    overdue: '已逾期',
    'in-transit': '运输中',
    customs: '报关中',
    'customs-pending': '待报关',
    cleared: '已清关',
    released: '已放行',
    delivered: '已交付',
    empty: '空箱',
    loaded: '重箱',
    damaged: '残损',
    normal: '普通会员',
    silver: '银卡会员',
    gold: '金卡会员',
    reviewing: '审核中',
  };
  return textMap[status] || status;
};
