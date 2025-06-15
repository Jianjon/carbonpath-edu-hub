
/**
 * 計算平滑增長的年度減排量。
 * 如果提供了 initialAnnualReduction，則使用使用者定義的 r(t) = a*t^2 + b 模型。
 * 否則，它將回退到一個簡化的模型以保持向後相容性。
 * @param D - 減排期間的持續時間（年）。
 * @param totalReductionNeeded - 在 D 時期內需要減少的總排放量。
 * @param initialAnnualReduction - 可選。該時期前一年的年度減排量，將用作 b 值。
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

  // 如果提供了 initialAnnualReduction，則使用新的 r(t) = a*t^2 + b 模型
  if (initialAnnualReduction !== undefined) {
    console.log("長期階段：使用使用者定義的 r(t) = a*t^2 + b 模型");
    const b = initialAnnualReduction > 0 ? initialAnnualReduction : 0;
    
    // t從0到D-1的t^2之和
    const sum_t_squared = D > 1 ? ((D - 1) * D * (2 * D - 1)) / 6 : 0;

    if (sum_t_squared <= 0) {
      // 這種情況只會在 D=1 時發生，上面已處理
      return Array(D).fill(totalReductionNeeded / D);
    }

    const a = (totalReductionNeeded - D * b) / sum_t_squared;

    if (a < 0) {
      console.warn(
          `警告: 計算出的參數 'a' 為負數 (${a.toFixed(4)})。` +
          `這會導致一個向下凸的年度減量曲線，與「向上凸」的要求不符。` +
          `原因是初始減量相對於總需求過高。`
      );
    }

    const annualReductions = Array.from({ length: D }, (_, t) => a * (t ** 2) + b);
    
    // 由於浮點數計算可能存在誤差，微調最後一個值以確保總和精確
    const calculatedSum = annualReductions.reduce((sum, val) => sum + val, 0);
    const diff = totalReductionNeeded - calculatedSum;
    if (annualReductions.length > 0) {
      annualReductions[annualReductions.length - 1] += diff;
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
