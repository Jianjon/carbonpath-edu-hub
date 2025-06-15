
export interface EmissionData {
  scope1: number;
  scope2: number;
  baseYear: number;
  targetYear: number;
  residualEmissionPercentage: number;
  decarbonModel: string;
  reTargetYear?: number;
  renewableTargetType?: string;
  historicalData?: { year: number; emissions: number }[];
  nearTermTarget?: {
    year: number;
    reductionPercentage: number;
    annualReductionRate: number;
  };
  midTermTarget?: {
    year: number;
    reductionPercentage: number;
    annualReductionRate: number;
  };
  longTermTarget?: {
    year: number;
    reductionPercentage: number;
    annualReductionRate: number;
  };
  adjustedLongTermAnnualRate?: number;
}

export interface ReductionModel {
  id: string;
  name: string;
  description: string;
  targetReduction: number; // percentage
  annualReductionRate: number; // percentage per year
}

export interface PathwayData {
  year: number;
  emissions: number;
  reduction?: number;
  target?: number;
  annualReduction?: number;
  remainingPercentage?: number;
}

export interface CustomTargetPhase {
  year: number;
  reductionPercentage: number;
  annualReductionRate: number;
}

export interface CustomTargets {
  nearTermTarget?: CustomTargetPhase;
  midTermTarget?: CustomTargetPhase;
  longTermTarget?: CustomTargetPhase;
}
