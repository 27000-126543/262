
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import dayjs from 'dayjs';
import type { BerthPlan, VesselForecast } from '@/types';
import type { BerthInfo, TideData } from '@/utils/berthRecommendation';

interface BerthState {
  tideData: TideData[];
  berthInfos: BerthInfo[];
  berthPlans: BerthPlan[];
  forecasts: VesselForecast[];
  lastUpdated: string;
  generateTideData: () => void;
  addBerthPlan: (plan: BerthPlan) => void;
  updateBerthPlan: (id: string, updates: Partial<BerthPlan>) => void;
  updateBerthInfo: (berthNo: string, updates: Partial<BerthInfo>) => void;
  resetData: () => void;
}

const generateInitialTideData = (): TideData[] => {
  const data: TideData[] = [];
  for (let i = 0; i < 24; i++) {
    const height = 8 + Math.sin((i - 6) * Math.PI / 6) * 3 + (Math.random() - 0.5) * 0.5;
    data.push({
      time: dayjs().hour(i).minute(0).second(0).format('YYYY-MM-DD HH:mm:ss'),
      height: Math.max(6, Math.min(14, height)),
      type: i >= 6 && i <= 18 ? 'high' : 'low',
    });
  }
  return data;
};

const initialBerthInfos: BerthInfo[] = [
  { id: 'berth1', berthNo: 'B1', name: '1号泊位', length: 400, maxDraft: 16.5, status: 'scheduled', currentVessel: '中远上海', availableFrom: dayjs().add(3, 'day').format('YYYY-MM-DD HH:mm'), cranes: ['QC01', 'QC02', 'QC03'] },
  { id: 'berth2', berthNo: 'B2', name: '2号泊位', length: 380, maxDraft: 15.5, status: 'occupied', currentVessel: '中海金星', availableFrom: dayjs().add(1, 'day').format('YYYY-MM-DD HH:mm'), cranes: ['QC01', 'QC02'] },
  { id: 'berth3', berthNo: 'B3', name: '3号泊位', length: 420, maxDraft: 17.0, status: 'scheduled', currentVessel: '达飞泰姬陵', availableFrom: dayjs().add(6, 'day').format('YYYY-MM-DD HH:mm'), cranes: ['QC04', 'QC05', 'QC06'] },
  { id: 'berth4', berthNo: 'B4', name: '4号泊位', length: 360, maxDraft: 15.0, status: 'available', cranes: ['QC07', 'QC08'] },
  { id: 'berth5', berthNo: 'B5', name: '5号泊位', length: 350, maxDraft: 14.5, status: 'maintenance', cranes: ['QC09'] },
  { id: 'berth6', berthNo: 'B6', name: '6号泊位', length: 400, maxDraft: 16.0, status: 'available', cranes: ['QC10', 'QC11', 'QC12'] },
];

const initialBerthPlans: BerthPlan[] = [
  {
    id: 'bp1',
    vesselId: 'v1',
    vesselName: '中远上海',
    berthNo: 'B1',
    berthTime: dayjs().add(3, 'day').hour(10).minute(0).format('YYYY-MM-DD HH:mm'),
    departureTime: dayjs().add(5, 'day').hour(10).minute(0).format('YYYY-MM-DD HH:mm'),
    status: 'scheduled',
    operationType: '装卸作业',
    craneAssigned: ['QC01', 'QC02', 'QC03'],
  },
  {
    id: 'bp2',
    vesselId: 'v2',
    vesselName: '中海金星',
    berthNo: 'B2',
    berthTime: dayjs().subtract(6, 'hour').format('YYYY-MM-DD HH:mm'),
    departureTime: dayjs().add(1, 'day').hour(18).minute(0).format('YYYY-MM-DD HH:mm'),
    status: 'berthed',
    operationType: '卸船作业',
    craneAssigned: ['QC01', 'QC02'],
  },
  {
    id: 'bp3',
    vesselId: 'v3',
    vesselName: '达飞泰姬陵',
    berthNo: 'B3',
    berthTime: dayjs().add(6, 'day').hour(14).minute(0).format('YYYY-MM-DD HH:mm'),
    departureTime: dayjs().add(8, 'day').hour(14).minute(0).format('YYYY-MM-DD HH:mm'),
    status: 'scheduled',
    operationType: '装卸作业',
    craneAssigned: ['QC04', 'QC05', 'QC06'],
  },
];

const initialForecasts: VesselForecast[] = [
  {
    id: 'f1',
    forecastNo: 'F202406001',
    vesselId: 'v1',
    vesselName: '中远上海',
    eta: dayjs().add(3, 'day').hour(8).minute(0).format('YYYY-MM-DD HH:mm'),
    etd: dayjs().add(5, 'day').hour(12).minute(0).format('YYYY-MM-DD HH:mm'),
    teuIn: 1800,
    teuOut: 1600,
    status: 'approved',
    createTime: dayjs().subtract(2, 'day').format('YYYY-MM-DD HH:mm'),
  },
  {
    id: 'f2',
    forecastNo: 'F202406002',
    vesselId: 'v4',
    vesselName: '马士基埃德蒙顿',
    eta: dayjs().add(2, 'day').hour(6).minute(0).format('YYYY-MM-DD HH:mm'),
    etd: dayjs().add(4, 'day').hour(18).minute(0).format('YYYY-MM-DD HH:mm'),
    teuIn: 2200,
    teuOut: 2000,
    status: 'approved',
    createTime: dayjs().subtract(3, 'day').format('YYYY-MM-DD HH:mm'),
  },
  {
    id: 'f3',
    forecastNo: 'F202406003',
    vesselId: 'v2',
    vesselName: '中海金星',
    eta: dayjs().subtract(6, 'hour').format('YYYY-MM-DD HH:mm'),
    etd: dayjs().add(1, 'day').hour(12).minute(0).format('YYYY-MM-DD HH:mm'),
    teuIn: 1200,
    teuOut: 800,
    status: 'approved',
    recommendedBerth: 'B2',
    createTime: dayjs().subtract(5, 'day').format('YYYY-MM-DD HH:mm'),
  },
];

export const useBerthStore = create<BerthState>()(
  persist(
    (set, get) => ({
      tideData: generateInitialTideData(),
      berthInfos: initialBerthInfos,
      berthPlans: initialBerthPlans,
      forecasts: initialForecasts,
      lastUpdated: dayjs().format('YYYY-MM-DD HH:mm:ss'),

      generateTideData: () => {
        set({
          tideData: generateInitialTideData(),
          lastUpdated: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        });
      },

      addBerthPlan: (plan: BerthPlan) => {
        const { berthPlans, berthInfos, forecasts } = get();
        
        const updatedBerths = berthInfos.map((b) => {
          if (b.berthNo === plan.berthNo) {
            return {
              ...b,
              status: 'scheduled' as const,
              availableFrom: plan.departureTime,
              currentVessel: plan.vesselName,
            };
          }
          return b;
        });

        const updatedForecasts = forecasts.map((f) => {
          if (f.vesselId === plan.vesselId) {
            return { ...f, recommendedBerth: plan.berthNo };
          }
          return f;
        });

        set({
          berthPlans: [plan, ...berthPlans],
          berthInfos: updatedBerths,
          forecasts: updatedForecasts,
          lastUpdated: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        });
      },

      updateBerthPlan: (id: string, updates: Partial<BerthPlan>) => {
        const { berthPlans } = get();
        set({
          berthPlans: berthPlans.map((p) => (p.id === id ? { ...p, ...updates } : p)),
          lastUpdated: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        });
      },

      updateBerthInfo: (berthNo: string, updates: Partial<BerthInfo>) => {
        const { berthInfos } = get();
        set({
          berthInfos: berthInfos.map((b) => (b.berthNo === berthNo ? { ...b, ...updates } : b)),
          lastUpdated: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        });
      },

      resetData: () => {
        set({
          tideData: generateInitialTideData(),
          berthInfos: initialBerthInfos,
          berthPlans: initialBerthPlans,
          forecasts: initialForecasts,
          lastUpdated: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        });
      },
    }),
    {
      name: 'port-berth-storage',
      partialize: (state) => ({
        berthPlans: state.berthPlans,
        berthInfos: state.berthInfos,
        forecasts: state.forecasts,
      }),
    }
  )
);
