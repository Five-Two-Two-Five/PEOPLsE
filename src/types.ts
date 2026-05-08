export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  neighborhoodId: string;
  meterId: string;
  credits: number;
  isSocialTariff: boolean;
  createdAt: string;
}

export interface Neighborhood {
  id: string;
  name: string;
  transformerCapacityKw: number;
  currentLoadKw: number;
}

export type PledgeStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
export type RewardTier = 'standard' | 'peak' | 'emergency';

export interface Pledge {
  id: string;
  userId: string;
  userEmail?: string;
  neighborhoodId: string;
  startTime: any; // Firestore Timestamp
  durationHours: number;
  status: PledgeStatus;
  rewardTier: RewardTier;
  expectedCredit: number;
  verified: boolean;
  createdAt: any;
}

export interface GridForecast {
  id: string;
  forecastTime: any;
  stressLevel: number; // 0-100
  demandKw: number;
  capacityKw: number;
  message: string;
}
