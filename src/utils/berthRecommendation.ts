
import dayjs from 'dayjs';
import type { Vessel, VesselForecast, BerthPlan } from '@/types';

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

export interface TideData {
  time: string;
  height: number;
  type: 'high' | 'low';
}

export interface RecommendOption {
  berthNo: string;
  berthName: string;
  recommendTime: string;
  score: number;
  reason: string;
  tideHeight: number;
  scoreDetail: {
    tideScore: number;
    lengthScore: number;
    draftScore: number;
    timeScore: number;
    availabilityScore: number;
  };
}

export interface AlgorithmParams {
  minTideHeight: number;
  tideWeight: number;
  lengthWeight: number;
  draftWeight: number;
  timeWeight: number;
  availabilityWeight: number;
  searchHours: number;
  timeInterval: number;
}

export const DEFAULT_PARAMS: AlgorithmParams = {
  minTideHeight: 12,
  tideWeight: 0.3,
  lengthWeight: 0.2,
  draftWeight: 0.25,
  timeWeight: 0.15,
  availabilityWeight: 0.1,
  searchHours: 72,
  timeInterval: 2,
};

export const calculateBerthRecommendation = (
  vessel: Vessel,
  forecast: VesselForecast,
  berths: BerthInfo[],
  existingPlans: BerthPlan[],
  tideData: TideData[],
  params: AlgorithmParams = DEFAULT_PARAMS
): RecommendOption[] => {
  const options: RecommendOption[] = [];
  const etaTime = dayjs(forecast.eta);

  berths.forEach((berth) => {
    if (berth.status === 'maintenance') return;

    const lengthScore = calculateLengthScore(vessel.length, berth.length);
    if (lengthScore < 30) return;

    const draftScore = calculateDraftScore(vessel.draft, berth.maxDraft);
    if (draftScore < 30) return;

    let berthAvailableTime = dayjs();
    if (berth.status === 'occupied' && berth.availableFrom) {
      berthAvailableTime = dayjs(berth.availableFrom);
    } else if (berth.status === 'scheduled' && berth.availableFrom) {
      berthAvailableTime = dayjs(berth.availableFrom);
    }

    const conflictingPlans = existingPlans.filter(
      (p) => p.berthNo === berth.berthNo && p.status !== 'completed' && p.status !== 'cancelled'
    );

    for (let offset = 0; offset <= params.searchHours; offset += params.timeInterval) {
      const baseTime = etaTime.isAfter(berthAvailableTime) ? etaTime : berthAvailableTime;
      const candidateTime = baseTime.add(offset, 'hour');
      
      let hasConflict = false;
      const operationDuration = estimateOperationDuration(forecast.teuIn + forecast.teuOut);
      const candidateEndTime = candidateTime.add(operationDuration, 'hour');
      
      for (const plan of conflictingPlans) {
        const planStart = dayjs(plan.berthTime);
        const planEnd = dayjs(plan.departureTime);
        if (candidateTime.isBefore(planEnd) && candidateEndTime.isAfter(planStart)) {
          hasConflict = true;
          break;
        }
      }
      
      if (hasConflict) continue;

      const tideHour = candidateTime.hour();
      const tide = tideData[tideHour % tideData.length];

      if (!tide || tide.height < params.minTideHeight) continue;

      const tideScore = calculateTideScore(tide.height, vessel.draft, params.minTideHeight);
      const timeScore = calculateTimeScore(offset, params.searchHours);
      const availabilityScore = calculateAvailabilityScore(berth.status);

      const totalScore = Math.round(
        tideScore * params.tideWeight +
        lengthScore * params.lengthWeight +
        draftScore * params.draftWeight +
        timeScore * params.timeWeight +
        availabilityScore * params.availabilityWeight
      );

      const reasons = [];
      if (tideScore >= 80) reasons.push(`潮高${tide.height.toFixed(1)}m，条件优`);
      else if (tideScore >= 60) reasons.push(`潮高${tide.height.toFixed(1)}m，条件良`);
      else reasons.push(`潮高${tide.height.toFixed(1)}m，满足最低要求`);
      
      if (lengthScore >= 90) reasons.push(`泊位长度充足`);
      else if (lengthScore >= 70) reasons.push(`泊位长度适配`);
      
      if (draftScore >= 90) reasons.push(`水深富余充足`);
      else if (draftScore >= 70) reasons.push(`水深满足要求`);

      options.push({
        berthNo: berth.berthNo,
        berthName: berth.name,
        recommendTime: candidateTime.format('YYYY-MM-DD HH:mm'),
        score: Math.min(100, totalScore),
        reason: reasons.join('；'),
        tideHeight: tide.height,
        scoreDetail: {
          tideScore: Math.round(tideScore),
          lengthScore: Math.round(lengthScore),
          draftScore: Math.round(draftScore),
          timeScore: Math.round(timeScore),
          availabilityScore: Math.round(availabilityScore),
        },
      });
    }
  });

  options.sort((a, b) => b.score - a.score);

  const uniqueOptions: RecommendOption[] = [];
  const seen = new Set<string>();
  for (const opt of options) {
    const key = `${opt.berthNo}-${dayjs(opt.recommendTime).format('YYYY-MM-DD-HH')}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueOptions.push(opt);
    }
    if (uniqueOptions.length >= 5) break;
  }

  return uniqueOptions;
};

const calculateTideScore = (tideHeight: number, vesselDraft: number, minTide: number): number => {
  const surplus = tideHeight - vesselDraft;
  if (surplus >= 5) return 100;
  if (surplus >= 4) return 90;
  if (surplus >= 3) return 80;
  if (surplus >= 2) return 70;
  if (surplus >= 1) return 60;
  return 50 + surplus * 10;
};

const calculateLengthScore = (vesselLength: number, berthLength: number): number => {
  const ratio = vesselLength / berthLength;
  if (ratio <= 0.7) return 100;
  if (ratio <= 0.8) return 90;
  if (ratio <= 0.85) return 80;
  if (ratio <= 0.9) return 70;
  if (ratio <= 0.95) return 60;
  if (ratio <= 1) return 50;
  return 0;
};

const calculateDraftScore = (vesselDraft: number, berthMaxDraft: number): number => {
  const ratio = vesselDraft / berthMaxDraft;
  if (ratio <= 0.75) return 100;
  if (ratio <= 0.8) return 90;
  if (ratio <= 0.85) return 80;
  if (ratio <= 0.9) return 70;
  if (ratio <= 0.95) return 60;
  if (ratio <= 1) return 50;
  return 0;
};

const calculateTimeScore = (offsetHours: number, maxHours: number): number => {
  return Math.max(0, 100 - (offsetHours / maxHours) * 100);
};

const calculateAvailabilityScore = (status: string): number => {
  switch (status) {
    case 'available': return 100;
    case 'occupied': return 60;
    case 'scheduled': return 40;
    default: return 0;
  }
};

const estimateOperationDuration = (totalTEU: number): number => {
  const craneEfficiency = 25;
  const craneCount = 3;
  const hours = totalTEU / (craneEfficiency * craneCount);
  return Math.max(12, Math.ceil(hours / 6) * 6);
};

export const formatScoreDetail = (detail: RecommendOption['scoreDetail']): string => {
  return `潮汐${detail.tideScore} / 船长${detail.lengthScore} / 吃水${detail.draftScore} / 时效${detail.timeScore} / 可用${detail.availabilityScore}`;
};
