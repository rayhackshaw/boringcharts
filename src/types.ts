import type { CSSProperties } from 'react';

export type DatumValue = string | number | null;
export type ChartDatum = Readonly<Record<string, DatumValue>>;
export type ChartData = readonly ChartDatum[];

export type ScaleType = 'linear' | 'log' | 'time' | 'category';
export type AxisPosition = 'top' | 'bottom' | 'left' | 'right';

export interface AxisConfig {
  readonly field: string;
  readonly position?: AxisPosition;
  readonly scale?: ScaleType;
  readonly min?: number;
  readonly max?: number;
  /** Numeric/time units between ticks; category axes use every Nth label. */
  readonly tickInterval?: number;
  readonly tickCount?: number;
  readonly tickFormat?: 'number' | 'compact' | 'percent' | 'date' | 'datetime';
  readonly label?: string;
  readonly show?: boolean;
  readonly showGrid?: boolean;
  readonly color?: string;
}

export interface LegendConfig {
  readonly show?: boolean;
  readonly position?: 'top' | 'bottom' | 'left' | 'right';
  readonly align?: 'start' | 'center' | 'end';
  readonly itemGap?: number;
}

export interface SeriesConfig {
  readonly field: string;
  readonly label?: string;
  readonly color?: string;
  readonly strokeWidth?: number;
  readonly opacity?: number;
}

export interface BaseConfig {
  readonly width?: number;
  readonly height?: number;
  /** Base size for SVG axis, tick, and legend text, in pixels. */
  readonly fontSize?: number;
  readonly title?: string;
  readonly description?: string;
  readonly background?: string;
  readonly colors?: readonly string[];
  readonly legend?: LegendConfig;
}

export interface CartesianConfig extends BaseConfig {
  readonly xAxis: AxisConfig;
  readonly yAxis: AxisConfig;
  readonly series: readonly [SeriesConfig, ...SeriesConfig[]];
}

export interface LineConfig extends CartesianConfig {
  readonly type: 'line';
  readonly showPoints?: boolean;
  readonly curve?: 'linear' | 'step';
}

export interface AreaConfig extends CartesianConfig {
  readonly type: 'area';
  readonly stack?: boolean;
  readonly curve?: 'linear' | 'step';
}

export interface BarConfig extends CartesianConfig {
  readonly type: 'bar';
  readonly layout?: 'grouped' | 'stacked';
  readonly orientation?: 'vertical' | 'horizontal';
  readonly barGap?: number;
}

export interface ScatterConfig extends CartesianConfig {
  readonly type: 'scatter';
  readonly pointRadius?: number;
  readonly trendLine?: ScatterTrendLineConfig;
}

export interface ScatterTrendLineConfig {
  readonly color?: string;
  readonly strokeWidth?: number;
  /** Points farther than this many residual standard deviations are highlighted. */
  readonly anomalies?: {
    readonly threshold?: number;
    readonly color?: string;
    readonly radius?: number;
  };
}

export interface RadialConfig extends BaseConfig {
  readonly categoryField: string;
  readonly valueField: string;
  readonly categoryColors?: Readonly<Record<string, string>>;
}

export interface PieConfig extends RadialConfig {
  readonly type: 'pie' | 'donut';
  readonly innerRadius?: number;
  readonly startAngle?: number;
}

export interface RadarConfig extends CartesianConfig {
  readonly type: 'radar';
  readonly levels?: number;
  readonly showPoints?: boolean;
  /** Distance from each outer vertex to its category label, in SVG pixels. Defaults to 26. */
  readonly labelOffset?: number;
}

export type ChartConfig = LineConfig | AreaConfig | BarConfig | ScatterConfig | PieConfig | RadarConfig;

export interface ChartProps {
  readonly config: ChartConfig;
  readonly data: ChartData;
  readonly className?: string;
  readonly style?: CSSProperties;
}
