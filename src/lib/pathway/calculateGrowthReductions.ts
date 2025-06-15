
/**
 * 計算平滑增長的年度減排量。
 * 如果提供了 initialAnnualReduction，則使用一個在期間中點達到峰值的拋物線模型。
 * 否則，它將回退到一個簡化的模型以保持向後相容性。
 * @param D - 減排期間的持續時間（年）。
 * @param totalReductionNeeded - 在 D 時期內需要減少的總排放量。
 * @param initialAnnualReduction - 可選。該時期前一年的年度減排量，將用作 t=0 時的減排量。
 * @returns 一個包含該時期每年年度減排量的陣列。
 */
export const calculateGrowthReductions = (
  D: number,
  totalReductionNeeded: number,
  initialAnnualReduction?: number
): number[] => {
  if (D <= 0) return [];
  if (D === 1) return [totalReductionNeeded];
  if (totalReductionNeeded <= 0) {
    return Array(D).fill(totalReductionNeeded / D || 0);
  }

  // 如果提供了 initialAnnualReduction，則使用拋物線模型 r(t) = at^2 + bt + c，該模型在中間達到峰值
  if (initialAnnualReduction !== undefined) {
    console.log("長期階段：使用中間達峰值的拋物線模型 r(t) = at^2 + bt + c");
    
    // r(0) = c，我們將其設置為初始年度減排量
    const c = initialAnnualReduction > 0 ? initialAnnualReduction : 0;
    
    // 拋物線的峰值在 t_peak = (D-1)/2
    const t_peak = (D - 1) / 2;

    // 峰值條件: r'(t_peak) = 0 => 2a*t_peak + b = 0 => b = -2a*t_peak
    // 因此 r(t) = a*t^2 - 2a*t_peak*t + c = a(t^2 - 2*t_peak*t) + c

    // 我們需要找到 'a'。所有 r(t) 的總和必須等於 totalReductionNeeded
    // Σ[t=0 to D-1] r(t) = totalReductionNeeded
    // a * Σ(t^2 - 2*t_peak*t) + D*c = totalReductionNeeded
    
    const sum_t = (D - 1) * D / 2;
    const sum_t_squared = (D - 1) * D * (2 * D - 1) / 6;
    
    const denominator = sum_t_squared - 2 * t_peak * sum_t;

    if (denominator === 0) {
        console.warn("無法計算拋物線參數 'a'，分母為零。回退到線性減排。");
        return Array(D).fill(totalReductionNeeded / D);
    }
    
    const a = (totalReductionNeeded - D * c) / denominator;
    
    // 為了使曲線達到峰值（先上後下），'a' 必須為負。
    if (a >= 0) {
        console.warn(
            `警告: 計算出的參數 'a' 為正數 (${a.toFixed(4)})。` +
            `這會導致一個向上凹的年度減量曲線，而不是中間達峰。` +
            `原因可能是初始減量相對於總需求過高。`
        );
    } else {
        console.log(`計算出的拋物線參數 'a': ${a.toFixed(4)}, 'c': ${c.toFixed(4)}`);
    }

    const b = -2 * a * t_peak;

    const annualReductions = Array.from({ length: D }, (_, t) => a * (t ** 2) + b * t + c);
    
    // 由於浮點數計算可能存在誤差，微調最後一個值以確保總和精確
    const calculatedSum = annualReductions.reduce((sum, val) => sum + val, 0);
    const diff = totalReductionNeeded - calculatedSum;
    if (annualReductions.length > 0) {
      annualReductions[annualReductions.length - 1] += diff;
    }

    if (annualReductions.some(r => r < 0)) {
        console.warn("警告：計算出的年度減排量包含負值。這意味著在某些年份排放量會增加。");
    }
    
    return annualReductions;
  }

  // 為保持與其他路徑（台灣、自訂）的相容性，保留原始的回退邏輯
  console.log("長期階段後備方案：使用平滑增長模型 t^2+1。");
  const baseReductions = Array.from({ length: D }, (_, t) => t ** 2 + 1);
  const totalBaseReduction = baseReductions.reduce((sum, val) => sum + val, 0);

  if (totalBaseReduction <= 0) {
    return Array(D).fill(totalReductionNeeded / D);
  }
  const scalingFactor = totalReductionNeeded / totalBaseReduction;
  const finalReductions = baseReductions.map(base => base * scalingFactor);
    
  console.log(
      `第一年減排 ${finalReductions[0]?.toFixed(0)}, ` +
      `最後一年減排 ${finalReductions[D - 1]?.toFixed(0)}`
  );

  return finalReductions;
};
