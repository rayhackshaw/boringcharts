# boringcharts

A small React/TypeScript chart library. It renders SVG directly with no charting runtime dependency. React 18 or newer is the only peer dependency. The configuration and rows are plain JSON values, so charts can be stored or generated outside React.

## About

I built boringcharts because I was tired of finding chart libraries that were out of date, no longer maintained, or more than I needed. I wanted something lightweight and simple that I could customize and extend without much fuss.

This is still an early version. It is missing plenty of chart types and features, but what is here works and is fairly straightforward to use and build on.

## Install

The package is currently local. Build it from this repository, then install it into a React project (replace the placeholder with this repository's path):

```sh
npm install
npm run build
# In the React project:
npm install /path/to/repository
```

After publication under an npm scope you own, consumers can install it by package name.

## Example

```tsx
import { Chart, type ChartConfig, type ChartData } from 'boringcharts';

const config: ChartConfig = {
  type: 'line',
  width: 640,
  height: 360,
  title: 'Monthly revenue',
  xAxis: { field: 'month', scale: 'category', label: 'Month', tickInterval: 1 },
  yAxis: { field: 'revenue', scale: 'linear', min: 0, tickInterval: 1000, tickFormat: 'compact', showGrid: true },
  series: [{ field: 'revenue', label: 'Revenue', color: '#2563eb' }],
  legend: { show: true, position: 'bottom', align: 'center' },
  showPoints: true,
};

const data: ChartData = [
  { month: 'Jan', revenue: 1200 },
  { month: 'Feb', revenue: 1850 },
  { month: 'Mar', revenue: 1420 },
];

export function RevenueChart() {
  return <Chart config={config} data={data} />;
}
```

## Chart types

| Type | Key options |
| --- | --- |
| `line` | `showPoints`, `curve: 'linear' \| 'step'` |
| `area` | `stack`, `curve` |
| `bar` | `layout: 'grouped' \| 'stacked'`, `orientation: 'vertical' \| 'horizontal'`, `barGap` |
| `scatter` | `pointRadius`, `trendLine` with optional `anomalies` |
| `pie`, `donut` | `categoryField`, `valueField`, `categoryColors`, `innerRadius`, `startAngle` |
| `radar` | `levels`, `showPoints`, `labelOffset` |

Cartesian and radar charts use `xAxis`, `yAxis`, and at least one `series`. For a horizontal bar chart, keep `xAxis` as the category field and `yAxis` as the numeric value axis; the renderer rotates their display positions. The `yAxis.field` is useful as the primary series name, while each series supplies its own numeric field.

Axes support `scale` (`linear`, `log`, `time`, `category`), `min`, `max`, `tickInterval`, `tickCount`, `tickFormat`, `label`, `show`, `showGrid`, `position`, and `color`. Time values may be epoch milliseconds or parseable date strings. `tickInterval` for time axes is milliseconds; category axes show every Nth label. A positive `tickInterval` overrides `tickCount`. Log scales require positive values.

Scatter charts can add a straight least-squares line with `trendLine: { color, strokeWidth }`. Add `anomalies: { threshold, color, radius }` inside `trendLine` to ring points whose vertical distance from that line exceeds the threshold in residual standard deviations (default `2`). The fit runs separately for each series and requires at least three valid points. This is a visual heuristic, not a statistical significance test.

All chart configs support `width`, `height`, `fontSize`, `title`, `description`, `background`, `colors`, and `legend`. `fontSize` sets the base size for axis, tick, and legend text (15 px by default). Data rows may contain strings, numbers, and nulls. Missing or invalid values are skipped. `ChartConfig` is a discriminated union, so TypeScript checks options against the selected chart type. The exported `createScale`, `computeTicks`, and `formatTick` helpers can be used by an editor to preview axis changes.

## Editing charts

The library accepts a JSON-compatible `ChartConfig`. An editor can keep that config in React state, update fields from controls, and pass the new value to `Chart`:

```tsx
const [config, setConfig] = useState<LineConfig>(initialConfig);
<Chart config={config} data={data} />;
// Example control: setConfig(previous => ({
//   ...previous,
//   yAxis: { ...previous.yAxis, tickInterval: 20 },
// }));
```

Serialize `config` with `JSON.stringify` to save an edited chart. The demo's **Chart editing** section shows axis scale and maximum, tick intervals, legend placement, and series color updating the chart and JSON together. The package supplies the typed configuration and renderer; applications can build their own editing UI around them.

## Build and test

```sh
npm install
npm test
```

## Visual gallery

The demo is a small single-page app with separate Get started, Chart editing, Design tokens, and Explore charts views. The sidebar stays in place while views fade between pages. The gallery contains 21 examples: three variants of each chart type. Select the code button on any example to inspect its JSON configuration.

```sh
npm run demo
```

Open the local URL printed by Vite (normally `http://127.0.0.1:5173/`). For a static build, run `npm run build:demo`; the output is written to `demo-dist/`. The demo is excluded from the published library package.

The demo uses clean routes such as `/start`, `/editing`, `/tokens`, and `/charts/line`. Vite handles these routes during local development. When hosting `demo-dist/` on a static server, configure unknown page requests to serve `index.html` so direct links and refreshes work.

The output is ESM with TypeScript declarations in `dist/`. SVG scales with its `viewBox`; set CSS `max-width: 100%; height: auto` for a responsive chart.

## npm publishing

The package already has an ESM entry point, TypeScript declarations, a React peer dependency, and a `prepack` build. Use `npm pack --dry-run` to inspect the tarball before publishing. The package name is `boringcharts`; confirm registry availability and test the packed install before publishing. An unscoped npm package is public when published.

## Current scope

Rendering is intentionally static. Native SVG `<title>` elements provide data labels on hover. This version has no animation, canvas renderer, zooming, or packaged editor component. Applications can update the JSON config and rerender the chart. Avoid untrusted CSS color strings if configs come from external users.
