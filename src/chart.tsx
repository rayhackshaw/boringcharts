import { createScale, formatTick, numericValue, type Scale } from './scales.js';
import { fitLinearTrend } from './trend.js';
import type { AxisConfig, AreaConfig, BarConfig, BaseConfig, ChartData, ChartProps, LineConfig, PieConfig, ScatterConfig, SeriesConfig, RadarConfig } from './types.js';

const DEFAULT_COLORS = ['#2563eb', '#e11d48', '#16a34a', '#d97706', '#7c3aed', '#0891b2', '#be185d', '#4b5563'];
const SVG_STYLE = { fontFamily: 'system-ui, sans-serif' } as const;

function color(config: BaseConfig, index: number, series?: SeriesConfig): string {
  const palette = config.colors?.length ? config.colors : DEFAULT_COLORS;
  return series?.color ?? palette[index % palette.length] ?? '#2563eb';
}

function legend(config: BaseConfig, items: readonly { label: string; color: string }[], width: number, height: number) {
  if (config.legend?.show === false || items.length === 0) return null;
  const position = config.legend?.position ?? 'top';
  const gap = config.legend?.itemGap ?? 16;
  const fontSize = config.fontSize ?? 15;
  const itemWidths = items.map(item => Math.max(58, item.label.length * fontSize * 0.58 + 24));
  const total = itemWidths.reduce((a, b) => a + b, 0) + gap * (items.length - 1);
  let x = config.legend?.align === 'start' ? 16 : config.legend?.align === 'end' ? width - total - 16 : (width - total) / 2;
  const y = position === 'bottom' ? height - 14 : position === 'top' ? 23 : height / 2;
  if (position === 'left') x = 8;
  if (position === 'right') x = width - Math.max(...itemWidths) - 8;
  return <g aria-label="Legend">{items.map((item, i) => {
    const itemX = x;
    if (position === 'left' || position === 'right') {
      // Each item occupies its own row.
    } else x += (itemWidths[i] ?? 0) + gap;
    return <g key={`${item.label}-${i}`} transform={`translate(${itemX},${y + ((position === 'left' || position === 'right') ? i * 20 : 0)})`}>
      <rect x={0} y={-fontSize * 0.72} width={fontSize * 0.72} height={fontSize * 0.72} rx={2} fill={item.color} />
      <text x={fontSize * 0.72 + 5} y={0} fill="#374151">{item.label}</text>
    </g>;
  })}</g>;
}

function axisElements(axis: AxisConfig, scale: Scale, horizontal: boolean, plot: { left: number; top: number; right: number; bottom: number }, key: string) {
  if (axis.show === false) return null;
  const isFar = horizontal ? axis.position === 'top' : axis.position === 'right';
  const base = horizontal ? (isFar ? plot.top : plot.bottom) : (isFar ? plot.right : plot.left);
  const ticks = scale.ticks();
  const tickNodes = ticks.map((tick, i) => {
    const p = scale.position(tick);
    if (p === undefined) return null;
    const label = formatTick(tick, axis);
    return <g key={`${key}-${i}`}>
      {axis.showGrid && (horizontal
        ? <line x1={p} x2={p} y1={plot.top} y2={plot.bottom} stroke="#e5e7eb" />
        : <line x1={plot.left} x2={plot.right} y1={p} y2={p} stroke="#e5e7eb" />)}
      {horizontal ? <>
        <line x1={p} x2={p} y1={base} y2={base + (isFar ? -5 : 5)} stroke={axis.color ?? '#6b7280'} />
        <text x={p} y={base + (isFar ? -9 : 17)} textAnchor="middle" fill={axis.color ?? '#6b7280'}>{label}</text>
      </> : <>
        <line x1={base} x2={base + (isFar ? 5 : -5)} y1={p} y2={p} stroke={axis.color ?? '#6b7280'} />
        <text x={base + (isFar ? 9 : -9)} y={p + 4} textAnchor={isFar ? 'start' : 'end'} fill={axis.color ?? '#6b7280'}>{label}</text>
      </>}
    </g>;
  });
  return <g aria-label={`${key} axis`}>
    {horizontal ? <line x1={plot.left} x2={plot.right} y1={base} y2={base} stroke={axis.color ?? '#6b7280'} />
      : <line x1={base} x2={base} y1={plot.top} y2={plot.bottom} stroke={axis.color ?? '#6b7280'} />}
    {tickNodes}
    {axis.label && (horizontal
      ? <text x={(plot.left + plot.right) / 2} y={base + (isFar ? -29 : 38)} textAnchor="middle" fill="#374151">{axis.label}</text>
      : <text transform={`translate(${base + (isFar ? 42 : -45)},${(plot.top + plot.bottom) / 2}) rotate(-90)`} textAnchor="middle" fill="#374151">{axis.label}</text>)}
  </g>;
}

function linePath(points: readonly (readonly [number, number] | null)[], step: boolean): string {
  let path = '';
  let previous: readonly [number, number] | null = null;
  for (const point of points) {
    if (!point) { previous = null; continue; }
    if (!previous) path += `M${point[0]},${point[1]}`;
    else if (step) path += `H${point[0]}V${point[1]}`;
    else path += `L${point[0]},${point[1]}`;
    previous = point;
  }
  return path;
}

function cartesian(config: LineConfig | AreaConfig | BarConfig | ScatterConfig, data: ChartData, width: number, height: number) {
  const legendPosition = config.legend?.position ?? 'top';
  const legendSpace = config.legend?.show === false ? 0 : 30;
  const plot = {
    left: 66 + (legendPosition === 'left' ? 105 : 0),
    top: 28 + (legendPosition === 'top' ? legendSpace : 0),
    right: width - 22 - (legendPosition === 'right' ? 105 : 0),
    bottom: height - 49 - (legendPosition === 'bottom' ? legendSpace : 0),
  };
  const isBar = config.type === 'bar';
  const stacked = (config.type === 'area' && config.stack) || (config.type === 'bar' && config.layout === 'stacked');
  const horizontalBars = config.type === 'bar' && config.orientation === 'horizontal';
  const xValues = data.map(row => row[config.xAxis.field] ?? null);
  const yValues = data.flatMap(row => config.series.map(series => row[series.field] ?? null));
  const sums = stacked ? data.flatMap(row => {
    let positive = 0, negative = 0;
    for (const series of config.series) {
      const n = numericValue(row[series.field] ?? null, 'linear') ?? 0;
      if (n >= 0) positive += n; else negative += n;
    }
    return [positive, negative];
  }) : [];
  const xAxis = horizontalBars ? config.yAxis : config.xAxis;
  const yAxis = horizontalBars ? config.xAxis : config.yAxis;
  const xScale = createScale(xAxis, horizontalBars ? [...yValues, ...sums] : xValues, [plot.left, plot.right], { includeZero: horizontalBars });
  const yScale = createScale(yAxis, horizontalBars ? xValues : [...yValues, ...sums], [plot.bottom, plot.top], { includeZero: isBar || config.type === 'area' });
  const categoryScale = horizontalBars ? yScale : xScale;
  const valueScale = horizontalBars ? xScale : yScale;
  const categories = data.map(row => row[config.xAxis.field] ?? null);
  const marks = config.series.map((series, seriesIndex) => {
    const seriesColor = color(config, seriesIndex, series);
    if (config.type === 'bar') {
      const band = categoryScale.bandwidth || Math.abs((horizontalBars ? plot.bottom - plot.top : plot.right - plot.left) / Math.max(1, data.length));
      const gap = Math.max(0, Math.min(0.8, config.barGap ?? 0.18));
      const groupWidth = band * (1 - gap);
      const barWidth = config.layout === 'stacked' ? groupWidth : groupWidth / config.series.length;
      return <g key={series.field} fill={seriesColor} opacity={series.opacity ?? 1}>{data.map((row, rowIndex) => {
        const n = numericValue(row[series.field] ?? null, 'linear');
        const center = categoryScale.position(categories[rowIndex] ?? null);
        if (n === undefined || center === undefined) return null;
        let base = 0;
        if (config.layout === 'stacked') for (let j = 0; j < seriesIndex; j++) {
          const earlier = config.series[j];
          if (!earlier) continue;
          const v = numericValue(row[earlier.field] ?? null, 'linear') ?? 0;
          if ((v >= 0) === (n >= 0)) base += v;
        }
        const p0 = valueScale.position(base), p1 = valueScale.position(base + n);
        if (p0 === undefined || p1 === undefined) return null;
        const offset = config.layout === 'stacked' ? -groupWidth / 2 : -groupWidth / 2 + seriesIndex * barWidth;
        return horizontalBars
          ? <rect key={rowIndex} x={Math.min(p0, p1)} y={center + offset} width={Math.abs(p1 - p0)} height={barWidth}><title>{`${series.label ?? series.field}: ${n}`}</title></rect>
          : <rect key={rowIndex} x={center + offset} y={Math.min(p0, p1)} width={barWidth} height={Math.abs(p1 - p0)}><title>{`${series.label ?? series.field}: ${n}`}</title></rect>;
      })}</g>;
    }
    const points = data.map(row => {
      const x = xScale.position(row[config.xAxis.field] ?? null);
      const raw = numericValue(row[series.field] ?? null, config.yAxis.scale);
      let value = raw;
      if (config.type === 'area' && config.stack && raw !== undefined) {
        value = raw;
        for (let j = 0; j < seriesIndex; j++) {
          const prior = config.series[j];
          if (prior) value += numericValue(row[prior.field] ?? null, 'linear') ?? 0;
        }
      }
      const y = value === undefined ? undefined : yScale.position(value);
      return x === undefined || y === undefined ? null : [x, y] as const;
    });
    if (config.type === 'scatter') {
      const trend = config.trendLine ? fitLinearTrend(points, config.trendLine.anomalies?.threshold) : null;
      return <g key={series.field}>
        {trend && <line x1={trend.start[0]} y1={trend.start[1]} x2={trend.end[0]} y2={trend.end[1]}
          stroke={config.trendLine?.color ?? seriesColor} strokeWidth={config.trendLine?.strokeWidth ?? 2.5} strokeLinecap="round">
          <title>{`${series.label ?? series.field} best-fit line`}</title>
        </line>}
        <g fill={seriesColor} opacity={series.opacity ?? 1}>{points.map((p, i) => p && <circle key={i} cx={p[0]} cy={p[1]} r={config.pointRadius ?? 4}><title>{`${series.label ?? series.field}: ${String(data[i]?.[series.field])}`}</title></circle>)}</g>
        {trend && config.trendLine?.anomalies && <g fill="none" stroke={config.trendLine.anomalies.color ?? '#e11d48'} strokeWidth={2.5}>
          {trend.anomalyIndices.map(i => {
            const point = points[i];
            return point && <circle key={i} cx={point[0]} cy={point[1]} r={config.trendLine?.anomalies?.radius ?? 9}>
              <title>{`Potential anomaly: ${series.label ?? series.field} ${String(data[i]?.[series.field])}`}</title>
            </circle>;
          })}
        </g>}
      </g>;
    }
    const path = linePath(points, config.curve === 'step');
    if (config.type === 'area') {
      const valid = points.filter((p): p is readonly [number, number] => p !== null);
      const first = valid[0], last = valid[valid.length - 1];
      const baseline = yScale.position(0) ?? plot.bottom;
      const lower = config.stack ? data.map(row => {
        let sum = 0;
        for (let j = 0; j < seriesIndex; j++) {
          const prior = config.series[j];
          if (prior) sum += numericValue(row[prior.field] ?? null, 'linear') ?? 0;
        }
        return yScale.position(sum) ?? baseline;
      }) : [];
      const fillPath = first && last ? config.stack
        ? `${path}${points.map((p, i) => p ? `L${p[0]},${lower[i] ?? baseline}` : '').reverse().join('')}Z`
        : `${path}L${last[0]},${baseline}L${first[0]},${baseline}Z` : '';
      return <g key={series.field}><path d={fillPath} fill={seriesColor} opacity={series.opacity ?? 0.25} /><path d={path} fill="none" stroke={seriesColor} strokeWidth={series.strokeWidth ?? 2} /></g>;
    }
    return <g key={series.field}><path d={path} fill="none" stroke={seriesColor} strokeWidth={series.strokeWidth ?? 2} opacity={series.opacity ?? 1} />
      {config.showPoints && points.map((p, i) => p && <circle key={i} cx={p[0]} cy={p[1]} r={3} fill={seriesColor} />)}</g>;
  });
  return <>
    {axisElements(horizontalBars ? config.yAxis : config.xAxis, xScale, true, plot, 'x')}
    {axisElements(horizontalBars ? config.xAxis : config.yAxis, yScale, false, plot, 'y')}
    <g aria-label="Chart marks">{marks}</g>
    {legend(config, config.series.map((s, i) => ({ label: s.label ?? s.field, color: color(config, i, s) })), width, height)}
  </>;
}

function polarPoint(cx: number, cy: number, radius: number, angle: number): readonly [number, number] {
  return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius];
}

function radial(config: PieConfig, data: ChartData, width: number, height: number) {
  const entries = data.map(row => ({ label: String(row[config.categoryField] ?? ''), value: numericValue(row[config.valueField] ?? null, 'linear') ?? 0 })).filter(entry => entry.value > 0);
  const total = entries.reduce((sum, entry) => sum + entry.value, 0);
  const cx = width / 2, cy = height / 2 + 8, outer = Math.max(0, Math.min(width, height) / 2 - 52);
  const inner = config.type === 'donut' ? Math.max(0, Math.min(outer * 0.9, config.innerRadius ?? outer * 0.55)) : 0;
  let angle = (config.startAngle ?? -90) * Math.PI / 180;
  const slices = entries.map((entry, i) => {
    const sweep = entry.value / total * Math.PI * 2;
    const start = angle, end = angle + sweep;
    angle = end;
    const p0 = polarPoint(cx, cy, outer, start), p1 = polarPoint(cx, cy, outer, end);
    const fullCircle = sweep >= Math.PI * 2 - 1e-9;
    const midpoint = polarPoint(cx, cy, outer, start + sweep / 2);
    const fill = config.categoryColors?.[entry.label] ?? color(config, i);
    const path = fullCircle
      ? inner > 0 ? `M${cx + outer},${cy}A${outer},${outer} 0 1 1 ${cx - outer},${cy}A${outer},${outer} 0 1 1 ${cx + outer},${cy}M${cx + inner},${cy}A${inner},${inner} 0 1 0 ${cx - inner},${cy}A${inner},${inner} 0 1 0 ${cx + inner},${cy}Z`
        : `M${cx + outer},${cy}A${outer},${outer} 0 1 1 ${cx - outer},${cy}A${outer},${outer} 0 1 1 ${cx + outer},${cy}Z`
      : inner > 0 ? `M${p0[0]},${p0[1]}A${outer},${outer} 0 ${sweep > Math.PI ? 1 : 0} 1 ${p1[0]},${p1[1]}L${polarPoint(cx, cy, inner, end).join(',')}A${inner},${inner} 0 ${sweep > Math.PI ? 1 : 0} 0 ${polarPoint(cx, cy, inner, start).join(',')}Z`
        : `M${cx},${cy}L${p0[0]},${p0[1]}A${outer},${outer} 0 ${sweep > Math.PI ? 1 : 0} 1 ${p1[0]},${p1[1]}Z`;
    return <path key={`${entry.label}-${i}`} d={path} fill={fill} fillRule="evenodd" stroke="white" strokeWidth={1}>
      <title>{`${entry.label}: ${entry.value} (${Math.round(entry.value / total * 100)}%)`}</title>
    </path>;
  });
  return <><g aria-label="Chart slices">{slices}</g>{legend(config, entries.map((entry, i) => ({ label: entry.label, color: config.categoryColors?.[entry.label] ?? color(config, i) })), width, height)}</>;
}

function radar(config: RadarConfig, data: ChartData, width: number, height: number) {
  const categories = data.map(row => String(row[config.xAxis.field] ?? ''));
  const count = categories.length;
  const cx = width / 2, cy = height / 2 + 8, radius = Math.max(0, Math.min(width, height) / 2 - 62);
  const values = data.flatMap(row => config.series.map(series => row[series.field] ?? null));
  const scale = createScale(config.yAxis, values, [0, radius], { includeZero: true });
  const max = scale.domain[1];
  const point = (i: number, r: number) => polarPoint(cx, cy, r, -Math.PI / 2 + i * Math.PI * 2 / Math.max(1, count));
  const levels = Math.max(1, Math.min(12, config.levels ?? 4));
  return <>
    {Array.from({ length: levels }, (_, j) => <polygon key={j} points={categories.map((_, i) => point(i, radius * (j + 1) / levels).join(',')).join(' ')} fill="none" stroke="#e5e7eb" />)}
    {categories.map((category, i) => {
      const angle = -Math.PI / 2 + i * Math.PI * 2 / Math.max(1, count);
      const end = point(i, radius);
      const label = point(i, radius + Math.max(0, config.labelOffset ?? 26));
      const horizontal = Math.cos(angle);
      const anchor = horizontal > 0.2 ? 'start' : horizontal < -0.2 ? 'end' : 'middle';
      return <g key={`${category}-${i}`}>
        <line x1={cx} y1={cy} x2={end[0]} y2={end[1]} stroke="#e5e7eb" />
        <text x={label[0]} y={label[1]} textAnchor={anchor} dominantBaseline="middle" fill="#374151">{category}</text>
      </g>;
    })}
    {config.series.map((series, seriesIndex) => {
      const points = data.map((row, i) => point(i, Math.max(0, Math.min(radius, scale.position(row[series.field] ?? null) ?? 0))));
      const fill = color(config, seriesIndex, series);
      return <g key={series.field}><polygon points={points.map(p => p.join(',')).join(' ')} fill={fill} fillOpacity={series.opacity ?? 0.18} stroke={fill} strokeWidth={series.strokeWidth ?? 2} />
        {config.showPoints && points.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={3} fill={fill} />)}</g>;
    })}
    {config.yAxis.show !== false && <text x={cx + 5} y={cy - radius - 4} fill="#6b7280">{formatTick(max, config.yAxis)}</text>}
    {legend(config, config.series.map((s, i) => ({ label: s.label ?? s.field, color: color(config, i, s) })), width, height)}
  </>;
}

/** Render a chart from plain JSON-compatible configuration and rows. */
export function Chart({ config, data, className, style }: ChartProps) {
  const width = Math.max(160, config.width ?? 640);
  const height = Math.max(140, config.height ?? 360);
  let content;
  switch (config.type) {
    case 'pie': case 'donut': content = radial(config, data, width, height); break;
    case 'radar': content = radar(config, data, width, height); break;
    default: content = cartesian(config, data, width, height);
  }
  return <svg className={className} style={{ ...SVG_STYLE, fontSize: config.fontSize ?? 15, ...style }} viewBox={`0 0 ${width} ${height}`} width={width} height={height}
    role="img" aria-label={config.title ?? `${config.type} chart`} aria-description={config.description}
    xmlns="http://www.w3.org/2000/svg">
    {config.title && <title>{config.title}</title>}
    {config.description && <desc>{config.description}</desc>}
    {config.background && <rect width={width} height={height} fill={config.background} />}
    {content}
  </svg>;
}
