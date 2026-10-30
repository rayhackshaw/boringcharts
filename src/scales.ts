import type { AxisConfig, DatumValue } from './types.js';

export interface Scale {
  readonly domain: readonly [number, number];
  readonly categories: readonly string[];
  readonly bandwidth: number;
  position(value: DatumValue): number | undefined;
  ticks(): readonly DatumValue[];
}

export function numericValue(value: DatumValue, scale: AxisConfig['scale']): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (scale === 'time' && typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function niceStep(span: number, count: number): number {
  const rough = span / Math.max(1, count - 1);
  if (!Number.isFinite(rough) || rough <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const normalized = rough / magnitude;
  const multiplier = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return multiplier * magnitude;
}

export function computeTicks(min: number, max: number, interval?: number, count = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [];
  if (min > max) [min, max] = [max, min];
  if (min === max) return [min];
  const step = interval && Number.isFinite(interval) && interval > 0 ? interval : niceStep(max - min, count);
  const first = Math.ceil((min - step * 1e-10) / step);
  const last = Math.floor((max + step * 1e-10) / step);
  const limit = Math.min(last, first + 999);
  const ticks: number[] = [];
  for (let i = first; i <= limit; i++) ticks.push(Number((i * step).toPrecision(12)));
  return ticks;
}

export function formatTick(value: DatumValue, axis: AxisConfig): string {
  if (value === null) return '';
  const format = axis.tickFormat ?? (axis.scale === 'time' ? 'date' : 'number');
  if (format === 'date' || format === 'datetime') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat(undefined,
      format === 'date' ? { year: 'numeric', month: 'short', day: 'numeric' } :
        { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date);
  }
  if (typeof value !== 'number') return value;
  const options: Intl.NumberFormatOptions = format === 'compact' ? { notation: 'compact', maximumFractionDigits: 1 } :
    format === 'percent' ? { style: 'percent', maximumFractionDigits: 1 } : { maximumFractionDigits: 6 };
  return new Intl.NumberFormat(undefined, options).format(value);
}

export function createScale(axis: AxisConfig, values: readonly DatumValue[], range: readonly [number, number],
  options: { includeZero?: boolean; padCategory?: boolean } = {}): Scale {
  if (axis.scale === 'category') {
    const categories = [...new Set(values.filter((v): v is string | number => v !== null).map(String))];
    const step = (range[1] - range[0]) / Math.max(1, categories.length);
    const bandwidth = Math.abs(step);
    return {
      domain: [0, Math.max(0, categories.length - 1)], categories, bandwidth,
      position: value => {
        if (value === null) return undefined;
        const index = categories.indexOf(String(value));
        return index < 0 ? undefined : range[0] + (index + 0.5) * step;
      },
      ticks: () => categories.filter((_, i) => i % Math.max(1, Math.floor(axis.tickInterval ?? 1)) === 0),
    };
  }
  const numeric = values.map(value => numericValue(value, axis.scale)).filter((v): v is number => v !== undefined);
  const valid = axis.scale === 'log' ? numeric.filter(v => v > 0) : numeric;
  let observedMin = Infinity, observedMax = -Infinity;
  for (const value of valid) { observedMin = Math.min(observedMin, value); observedMax = Math.max(observedMax, value); }
  let min = axis.min ?? (valid.length ? observedMin : 0);
  let max = axis.max ?? (valid.length ? observedMax : 1);
  if (options.includeZero && axis.scale !== 'log') {
    if (axis.min === undefined) min = Math.min(0, min);
    if (axis.max === undefined) max = Math.max(0, max);
  }
  if (axis.scale === 'log') {
    if (min <= 0 || !Number.isFinite(min)) min = valid.length ? observedMin : 1;
    if (max <= min) max = min * 10;
  } else if (max <= min) {
    const delta = min === 0 ? 1 : Math.abs(min) * 0.1;
    min -= delta;
    max += delta;
  }
  const transform = (v: number): number => axis.scale === 'log' ? Math.log10(v) : v;
  const low = transform(min), high = transform(max);
  const padding = options.padCategory ? 0.05 : 0;
  const start = range[0] + (range[1] - range[0]) * padding;
  const end = range[1] - (range[1] - range[0]) * padding;
  return {
    domain: [min, max], categories: [], bandwidth: 0,
    position: value => {
      const n = numericValue(value, axis.scale);
      if (n === undefined || (axis.scale === 'log' && n <= 0)) return undefined;
      return start + (transform(n) - low) / (high - low) * (end - start);
    },
    ticks: () => {
      if (axis.scale === 'log') {
        const ticks: number[] = [];
        for (let power = Math.ceil(Math.log10(min)); power <= Math.floor(Math.log10(max)) && ticks.length < 100; power++) ticks.push(10 ** power);
        return ticks;
      }
      return computeTicks(min, max, axis.tickInterval, axis.tickCount);
    },
  };
}
