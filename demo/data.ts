import type { ChartConfig, ChartData } from '../src/types.js';

export interface Example {
  id: string;
  name: string;
  note: string;
  config: ChartConfig;
  data: ChartData;
}

export interface GallerySection {
  id: string;
  number: string;
  title: string;
  description: string;
  examples: readonly Example[];
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
const monthly: ChartData = months.map((month, i) => ({
  month,
  revenue: [38, 46, 42, 57, 54, 68, 64, 77][i] ?? 0,
  target: [35, 39, 44, 49, 54, 59, 64, 69][i] ?? 0,
  previous: [27, 34, 32, 41, 45, 47, 53, 58][i] ?? 0,
  organic: [19, 22, 21, 28, 27, 31, 35, 39][i] ?? 0,
  paid: [12, 15, 16, 18, 20, 23, 21, 26][i] ?? 0,
  referral: [6, 8, 7, 9, 11, 10, 12, 13][i] ?? 0,
}));

const daily: ChartData = Array.from({ length: 14 }, (_, i) => ({
  day: `2026-10-${String(i + 1).padStart(2, '0')}`,
  sessions: Math.round(170 + i * 9 + Math.sin(i * 1.9) * 32),
  signups: Math.round(20 + i * 1.6 + Math.cos(i * 1.7) * 6),
}));

const teams: ChartData = [
  { team: 'North', current: 68, previous: 54, goal: 75 },
  { team: 'South', current: 82, previous: 71, goal: 78 },
  { team: 'East', current: 55, previous: 48, goal: 70 },
  { team: 'West', current: 73, previous: 62, goal: 80 },
];

const mix: ChartData = [
  { channel: 'Organic', value: 39 },
  { channel: 'Paid', value: 26 },
  { channel: 'Direct', value: 19 },
  { channel: 'Referral', value: 11 },
  { channel: 'Other', value: 5 },
];

const audience: ChartData = [
  { segment: 'New', value: 58 },
  { segment: 'Returning', value: 30 },
  { segment: 'Loyal', value: 12 },
];

const tasks: ChartData = [
  { status: 'Complete', value: 72 },
  { status: 'In progress', value: 19 },
  { status: 'Blocked', value: 9 },
];

const scatterData: ChartData = Array.from({ length: 24 }, (_, i) => ({
  spend: 6 + i * 3.6 + (i % 3) * 2,
  enterprise: Math.round(20 + i * 2.7 + Math.sin(i * 2.1) * 13),
  selfServe: Math.round(14 + i * 1.9 + Math.cos(i * 1.5) * 11),
  conversion: Math.round(9 + i * 0.9 + Math.sin(i * 2.5) * 5),
}));
const scatterWithAnomalies: ChartData = scatterData.map((row, i) => ({
  ...row,
  enterprise: i === 5 ? 107 : i === 18 ? 12 : row.enterprise ?? 0,
}));

const scorecard: ChartData = [
  { metric: 'Speed', alpha: 82, beta: 66, gamma: 72 },
  { metric: 'Quality', alpha: 74, beta: 88, gamma: 78 },
  { metric: 'Reach', alpha: 91, beta: 70, gamma: 84 },
  { metric: 'Cost', alpha: 65, beta: 82, gamma: 73 },
  { metric: 'Support', alpha: 78, beta: 76, gamma: 90 },
];

const metricAxis = { field: 'month', scale: 'category' as const };
const valueAxis = { field: 'revenue', scale: 'linear' as const, min: 0, showGrid: true };
const palette = ['#5369e8', '#19a5a1', '#f2a154', '#b979e9', '#e86c89'];

/** Three full-featured hero charts. One is selected at random on each page load. */
export const heroVariants: readonly { config: ChartConfig; data: ChartData }[] = [
  {
    config: {
      type: 'line', title: 'Revenue, target and prior year', width: 720, height: 420,
      xAxis: { field: 'month', scale: 'category', label: 'Month' },
      yAxis: { field: 'revenue', scale: 'linear', min: 0, max: 100, tickInterval: 20, showGrid: true, label: 'Thousands' },
      series: [
        { field: 'revenue', label: 'Revenue', color: '#5369e8', strokeWidth: 3 },
        { field: 'target', label: 'Target', color: '#19a5a1', strokeWidth: 2.5 },
        { field: 'previous', label: 'Prior year', color: '#e86c89', strokeWidth: 2.5 },
      ],
      showPoints: true, legend: { position: 'top', itemGap: 18 },
    },
    data: monthly,
  },
  {
    config: {
      type: 'area', title: 'Traffic by acquisition channel', width: 720, height: 420,
      xAxis: { field: 'month', scale: 'category', label: 'Month' },
      yAxis: { field: 'organic', scale: 'linear', min: 0, max: 100, tickInterval: 20, showGrid: true, label: 'Visitors' },
      series: [
        { field: 'organic', label: 'Organic', color: '#5369e8', opacity: 0.3, strokeWidth: 2.5 },
        { field: 'paid', label: 'Paid', color: '#19a5a1', opacity: 0.3, strokeWidth: 2.5 },
        { field: 'referral', label: 'Referral', color: '#b979e9', opacity: 0.3, strokeWidth: 2.5 },
      ],
      stack: true, legend: { position: 'top', itemGap: 18 },
    },
    data: monthly,
  },
  {
    config: {
      type: 'bar', title: 'Team performance comparison', width: 720, height: 420,
      xAxis: { field: 'team', scale: 'category', label: 'Team' },
      yAxis: { field: 'current', scale: 'linear', min: 0, max: 100, tickInterval: 20, showGrid: true, label: 'Score' },
      series: [
        { field: 'current', label: 'Current', color: '#5369e8' },
        { field: 'previous', label: 'Previous', color: '#19a5a1' },
        { field: 'goal', label: 'Goal', color: '#f2a154' },
      ],
      layout: 'grouped', barGap: 0.12, legend: { position: 'top', itemGap: 18 },
    },
    data: teams,
  },
];

export const sections: readonly GallerySection[] = [
  {
    id: 'line', number: '01', title: 'Line', description: 'Track changes over time, compare trajectories, and show precise data points.',
    examples: [
      { id: 'line-single', name: 'Single series', note: 'Clean trend · linear scale', data: monthly, config: { type: 'line', xAxis: metricAxis, yAxis: valueAxis, series: [{ field: 'revenue', label: 'Revenue' }], legend: { show: false }, showPoints: true } },
      { id: 'line-compare', name: 'Comparison', note: 'Multiple series · top legend', data: monthly, config: { type: 'line', xAxis: metricAxis, yAxis: valueAxis, series: [{ field: 'revenue', label: 'This year' }, { field: 'previous', label: 'Last year' }], legend: { position: 'top' } } },
      { id: 'line-step', name: 'Step line', note: 'Stepped curve · custom tick interval', data: monthly, config: { type: 'line', xAxis: { ...metricAxis, tickInterval: 2 }, yAxis: { ...valueAxis, tickInterval: 20 }, series: [{ field: 'target', label: 'Target', color: '#b979e9' }], legend: { show: false }, curve: 'step' } },
    ],
  },
  {
    id: 'area', number: '02', title: 'Area', description: 'Emphasize volume and show how individual parts contribute to a total.',
    examples: [
      { id: 'area-single', name: 'Single area', note: 'Soft fill · baseline at zero', data: monthly, config: { type: 'area', xAxis: metricAxis, yAxis: valueAxis, series: [{ field: 'revenue', label: 'Revenue' }], legend: { show: false } } },
      { id: 'area-overlap', name: 'Overlapping', note: 'Two translucent series', data: monthly, config: { type: 'area', xAxis: metricAxis, yAxis: valueAxis, series: [{ field: 'revenue', label: 'Current', opacity: 0.18 }, { field: 'previous', label: 'Previous', opacity: 0.18 }], legend: { position: 'top' } } },
      { id: 'area-stack', name: 'Stacked channels', note: 'Organic + paid + referral', data: monthly, config: { type: 'area', xAxis: metricAxis, yAxis: valueAxis, series: [{ field: 'organic', label: 'Organic' }, { field: 'paid', label: 'Paid' }, { field: 'referral', label: 'Referral' }], stack: true, legend: { position: 'top' } } },
    ],
  },
  {
    id: 'bar', number: '03', title: 'Bar', description: 'Compare categories and inspect grouped or stacked contributions.',
    examples: [
      { id: 'bar-simple', name: 'Vertical bars', note: 'Category comparison', data: teams, config: { type: 'bar', xAxis: { field: 'team', scale: 'category' }, yAxis: { field: 'current', scale: 'linear', min: 0, max: 100, showGrid: true }, series: [{ field: 'current', label: 'Current' }], legend: { show: false } } },
      { id: 'bar-grouped', name: 'Grouped bars', note: 'Current versus previous', data: teams, config: { type: 'bar', xAxis: { field: 'team', scale: 'category' }, yAxis: { field: 'current', scale: 'linear', min: 0, max: 100, showGrid: true }, series: [{ field: 'current', label: 'Current' }, { field: 'previous', label: 'Previous' }], layout: 'grouped', legend: { position: 'top' } } },
      { id: 'bar-horizontal', name: 'Horizontal stacked', note: 'Contribution by channel', data: monthly.slice(0, 5), config: { type: 'bar', xAxis: metricAxis, yAxis: { field: 'organic', scale: 'linear', min: 0, showGrid: true }, series: [{ field: 'organic', label: 'Organic' }, { field: 'paid', label: 'Paid' }, { field: 'referral', label: 'Referral' }], layout: 'stacked', orientation: 'horizontal', legend: { position: 'top' } } },
    ],
  },
  {
    id: 'scatter', number: '04', title: 'Scatter', description: 'Reveal relationships, outliers, and clusters across two numeric dimensions.',
    examples: [
      { id: 'scatter-single', name: 'Single cohort', note: 'Spend versus outcomes', data: scatterData, config: { type: 'scatter', xAxis: { field: 'spend', scale: 'linear', min: 0, label: 'Spend' }, yAxis: { field: 'enterprise', scale: 'linear', min: 0, showGrid: true }, series: [{ field: 'enterprise', label: 'Enterprise' }], pointRadius: 4, legend: { show: false } } },
      { id: 'scatter-compare', name: 'Two cohorts', note: 'Compare segment distribution', data: scatterData, config: { type: 'scatter', xAxis: { field: 'spend', scale: 'linear', min: 0 }, yAxis: { field: 'enterprise', scale: 'linear', min: 0, showGrid: true }, series: [{ field: 'enterprise', label: 'Enterprise', opacity: 0.75 }, { field: 'selfServe', label: 'Self serve', opacity: 0.75 }], pointRadius: 3.5, legend: { position: 'top' } } },
      { id: 'scatter-trend', name: 'Trend & anomalies', note: 'Best-fit line · unusual points ringed', data: scatterWithAnomalies, config: { type: 'scatter', xAxis: { field: 'spend', scale: 'linear', min: 0, tickInterval: 20, label: 'Spend' }, yAxis: { field: 'enterprise', scale: 'linear', min: 0, max: 120, tickInterval: 20, showGrid: true }, series: [{ field: 'enterprise', label: 'Enterprise', color: '#b979e9' }], pointRadius: 3.5, legend: { show: false }, trendLine: { color: '#344ac4', strokeWidth: 2.5, anomalies: { threshold: 1.7, color: '#e86c89', radius: 9 } } } },
    ],
  },
  {
    id: 'pie', number: '05', title: 'Pie', description: 'A quick read on how a whole is split among a few categories.',
    examples: [
      { id: 'pie-five', name: 'Five segments', note: 'Channel mix · default palette', data: mix, config: { type: 'pie', categoryField: 'channel', valueField: 'value', legend: { position: 'bottom' } } },
      { id: 'pie-three', name: 'Three segments', note: 'Audience composition', data: audience, config: { type: 'pie', categoryField: 'segment', valueField: 'value', legend: { position: 'bottom' }, colors: ['#5369e8', '#19a5a1', '#d7dff2'] } },
      { id: 'pie-custom', name: 'Custom colors', note: 'Named category mapping', data: tasks, config: { type: 'pie', categoryField: 'status', valueField: 'value', categoryColors: { Complete: '#19a5a1', 'In progress': '#f2a154', Blocked: '#e86c89' }, legend: { position: 'bottom' }, startAngle: -60 } },
    ],
  },
  {
    id: 'donut', number: '06', title: 'Donut', description: 'Part-to-whole composition with a lighter visual footprint.',
    examples: [
      { id: 'donut-mix', name: 'Standard donut', note: 'Balanced ring width', data: mix, config: { type: 'donut', categoryField: 'channel', valueField: 'value', legend: { position: 'bottom' } } },
      { id: 'donut-slim', name: 'Thin ring', note: 'Custom inner radius', data: audience, config: { type: 'donut', categoryField: 'segment', valueField: 'value', innerRadius: 92, legend: { position: 'bottom' } } },
      { id: 'donut-status', name: 'Status ring', note: 'Operational palette', data: tasks, config: { type: 'donut', categoryField: 'status', valueField: 'value', categoryColors: { Complete: '#19a5a1', 'In progress': '#f2a154', Blocked: '#e86c89' }, legend: { position: 'bottom' } } },
    ],
  },
  {
    id: 'radar', number: '07', title: 'Radar', description: 'Compare profiles across a common set of dimensions.',
    examples: [
      { id: 'radar-single', name: 'Single profile', note: 'Five metrics · four levels', data: scorecard, config: { type: 'radar', xAxis: { field: 'metric', scale: 'category' }, yAxis: { field: 'alpha', scale: 'linear', min: 0, max: 100 }, series: [{ field: 'alpha', label: 'Product A' }], levels: 4, showPoints: true, legend: { show: false } } },
      { id: 'radar-compare', name: 'Two profiles', note: 'Overlay comparison', data: scorecard, config: { type: 'radar', xAxis: { field: 'metric', scale: 'category' }, yAxis: { field: 'alpha', scale: 'linear', min: 0, max: 100 }, series: [{ field: 'alpha', label: 'Product A' }, { field: 'beta', label: 'Product B' }], levels: 5, legend: { position: 'top' } } },
      { id: 'radar-three', name: 'Three profiles', note: 'Extended palette', data: scorecard, config: { type: 'radar', xAxis: { field: 'metric', scale: 'category' }, yAxis: { field: 'alpha', scale: 'linear', min: 0, max: 100 }, series: [{ field: 'alpha', label: 'A' }, { field: 'beta', label: 'B' }, { field: 'gamma', label: 'C' }], levels: 4, legend: { position: 'top' } } },
    ],
  },
];

export const designTokens = {
  colors: [
    { name: 'Indigo', hex: '#5369E8', role: 'Primary series' },
    { name: 'Teal', hex: '#19A5A1', role: 'Secondary series' },
    { name: 'Amber', hex: '#F2A154', role: 'Third series' },
    { name: 'Orchid', hex: '#B979E9', role: 'Fourth series' },
    { name: 'Coral', hex: '#E86C89', role: 'Fifth series' },
  ],
  palette,
};
