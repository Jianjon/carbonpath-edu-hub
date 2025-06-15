import { useMemo } from 'react';
import { CarbonTaxFormValues } from '@/lib/schemas/carbonTaxSchema';
import { ReductionModel } from '@/lib/carbon-tax/types';
import { steelAnnualReduction, cementAnnualReduction } from '@/lib/carbon-tax/constants';

interface UseCarbonTaxCalculationsProps {
  formValues: CarbonTaxFormValues;
  selectedRate: number;
  reductionModel: ReductionModel;
  leakageCoefficient: number;
}

export const useCarbonTaxCalculations = ({
  formValues,
  selectedRate,
  reductionModel,
  leakageCoefficient,
}: UseCarbonTaxCalculationsProps) => {

  const feeProjection = useMemo(() => {
    const { annualEmissions } = formValues;
    const baseEmissions = annualEmissions || 0;
    const rate = selectedRate;
    const threshold = 25000;
    const projectionYears = Math.max(1, 2035 - new Date().getFullYear() + 1);

    let emissionsPath: number[] = [];
    let currentEmissions = baseEmissions;

    for (let i = 0; i < projectionYears; i++) {
        if (i === 0) {
            emissionsPath.push(currentEmissions);
            continue;
        }

        switch (reductionModel) {
            case 'sbti':
                currentEmissions *= (1 - 0.042); // SBTi: 4.2% annual reduction
                break;
            case 'taiwan':
                currentEmissions *= (1 - 0.028); // Simplified Taiwan Target: ~2.8% annual reduction
                break;
            case 'steel':
                currentEmissions *= (1 - steelAnnualReduction);
                break;
            case 'cement':
                currentEmissions *= (1 - cementAnnualReduction);
                break;
            case 'none':
            default:
                // No change in emissions
                break;
        }
        emissionsPath.push(currentEmissions);
    }
    
    return emissionsPath.map((emissions, index) => {
        let fee = 0;
        if (leakageCoefficient > 0) {
            fee = (emissions * leakageCoefficient) * rate;
        } else {
            if (emissions > threshold) {
                fee = (emissions - threshold) * rate;
            }
        }
        return {
            year: new Date().getFullYear() + index,
            emissions: Math.round(emissions),
            fee: Math.round(fee),
        };
    });
  }, [formValues, selectedRate, reductionModel, leakageCoefficient]);

  const baselineFeeProjection = useMemo(() => {
    const { annualEmissions } = formValues;
    const baseEmissions = annualEmissions || 0;
    const rate = selectedRate;
    const threshold = 25000;
    const projectionYears = Math.max(1, 2035 - new Date().getFullYear() + 1);

    const emissionsPath: number[] = Array(projectionYears).fill(baseEmissions);
    
    return emissionsPath.map((emissions, index) => {
        let fee = 0;
        if (leakageCoefficient > 0) {
            fee = (emissions * leakageCoefficient) * rate;
        } else {
            if (emissions > threshold) {
                fee = (emissions - threshold) * rate;
            }
        }
        return {
            year: new Date().getFullYear() + index,
            emissions: Math.round(emissions),
            fee: Math.round(fee),
        };
    });
  }, [formValues, selectedRate, leakageCoefficient]);

  return { feeProjection, baselineFeeProjection };
};
