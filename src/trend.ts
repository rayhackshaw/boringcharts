export interface TrendFit {
  readonly start: readonly [number, number];
  readonly end: readonly [number, number];
  readonly anomalyIndices: readonly number[];
}

/** Least-squares fit in plotted coordinates, preserving indices across missing points. */
export function fitLinearTrend(points: readonly (readonly [number, number] | null)[], threshold = 2): TrendFit | null {
  const valid: { index: number; x: number; y: number }[] = [];
  for (let index = 0; index < points.length; index++) {
    const point = points[index];
    if (point && Number.isFinite(point[0]) && Number.isFinite(point[1])) valid.push({ index, x: point[0], y: point[1] });
  }
  if (valid.length < 3) return null;

  let sumX = 0, sumY = 0, minX = Infinity, maxX = -Infinity;
  for (const point of valid) {
    sumX += point.x;
    sumY += point.y;
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
  }
  const meanX = sumX / valid.length, meanY = sumY / valid.length;
  let xx = 0, xy = 0;
  for (const point of valid) {
    const dx = point.x - meanX;
    xx += dx * dx;
    xy += dx * (point.y - meanY);
  }
  if (xx <= Number.EPSILON) return null;
  const slope = xy / xx;
  const intercept = meanY - slope * meanX;

  let squaredError = 0;
  for (const point of valid) {
    const residual = point.y - (slope * point.x + intercept);
    squaredError += residual * residual;
  }
  const residualDeviation = Math.sqrt(squaredError / Math.max(1, valid.length - 2));
  const cutoff = (Number.isFinite(threshold) && threshold > 0 ? threshold : 2) * residualDeviation;
  const anomalyIndices = residualDeviation === 0 ? [] : valid
    .filter(point => Math.abs(point.y - (slope * point.x + intercept)) > cutoff)
    .map(point => point.index);

  return {
    start: [minX, slope * minX + intercept],
    end: [maxX, slope * maxX + intercept],
    anomalyIndices,
  };
}
