
/**
 * 後備方案：計算平滑增長的年度減排量
 * 當U形曲線無法達成時（例如前期減排量過低），使用此模型確保減排路徑平滑向上，避免初期出現不合理的峰值。
 */
export const calculateGrowthReductions = (D: number, totalReductionNeeded: number): number[] => {
    if (D <= 0) return [];
    // If reduction is not needed or even negative, distribute linearly.
    if (totalReductionNeeded <= 0) {
        return Array(D).fill(totalReductionNeeded / D || 0);
    }
    
    // 使用二次方增長 f(t) = t^2 + 1，確保初始有減排量且平滑增長
    const baseReductions = Array.from({ length: D }, (_, t) => t ** 2 + 1);

    const totalBaseReduction = baseReductions.reduce((sum, val) => sum + val, 0);

    // This should not happen with t^2+1 but as a safeguard.
    if (totalBaseReduction <= 0) {
        return Array(D).fill(totalReductionNeeded / D);
    }

    const scalingFactor = totalReductionNeeded / totalBaseReduction;
    
    const finalReductions = baseReductions.map(base => base * scalingFactor);
    
    console.log(
        `長期階段後備方案：使用平滑增長模型（因無法達成U形）。` +
        `第一年減排 ${finalReductions[0]?.toFixed(0)}, ` +
        `最後一年減排 ${finalReductions[D - 1]?.toFixed(0)}`
    );

    return finalReductions;
};
