import { useState } from 'react';
import { Chart } from '../src/index.js';
import type { ChartData, LineConfig } from '../src/types.js';
import { HighlightedCode } from './highlight.js';

const starterCode = `import { Chart, type ChartConfig } from 'boringcharts';

const config: ChartConfig = {
  type: 'line',
  xAxis: { field: 'month', scale: 'category' },
  yAxis: { field: 'sales', scale: 'linear', min: 0, showGrid: true },
  series: [{ field: 'sales', label: 'Sales' }],
};

const data = [
  { month: 'Jan', sales: 24 },
  { month: 'Feb', sales: 38 },
  { month: 'Mar', sales: 32 },
];

export function SalesChart() {
  return <Chart config={config} data={data} />;
}`;

export function GettingStartedSection() {
  return <section className="guide-section section-block">
    <div className="section-intro"><div><h2>Get started</h2><p>Install the library locally, then render a chart with typed configuration and plain data rows.</p></div></div>
    <div className="starter-grid">
      <article className="guide-card install-card">
        <h3>Build the library</h3>
        <p>From this repository:</p>
        <pre><HighlightedCode code={'npm install\nnpm run build'} language="shell" /></pre>
        <h3>Add it to a React app</h3>
        <p>From your React app, replace this placeholder with the path to the repository:</p>
        <pre><HighlightedCode code="npm install /path/to/repository" language="shell" /></pre>
        <p className="guide-note">The library is not published on npm yet. After publication, this local path becomes a normal package install command.</p>
      </article>
      <article className="guide-card starter-code-card">
        <h3>Render your first chart</h3>
        <p>Configuration and data are plain JSON-compatible values; the TypeScript union checks each chart type.</p>
        <pre><HighlightedCode code={starterCode} language="tsx" /></pre>
      </article>
    </div>
  </section>;
}

const editorData: ChartData = [
  { month: 'Jan', sales: 28 }, { month: 'Feb', sales: 42 },
  { month: 'Mar', sales: 37 }, { month: 'Apr', sales: 63 },
  { month: 'May', sales: 58 }, { month: 'Jun', sales: 82 },
];

const initialEditorConfig: LineConfig = {
  type: 'line', width: 620, height: 330,
  xAxis: { field: 'month', scale: 'category', tickInterval: 1 },
  yAxis: { field: 'sales', scale: 'linear', min: 0, max: 100, tickInterval: 20, showGrid: true },
  series: [{ field: 'sales', label: 'Sales', color: '#5369e8' }],
  legend: { show: true, position: 'top' }, showPoints: true,
};

export function EditingSection() {
  const [config, setConfig] = useState<LineConfig>(initialEditorConfig);
  const legendValue = config.legend?.show === false ? 'off' : config.legend?.position ?? 'top';

  return <section id="editing" className="guide-section editing-section section-block">
    <div className="section-intro"><div><h2>Chart editing</h2><p>Change a control to update the JSON config. React passes the new config to <code>Chart</code>, which redraws immediately. Save that same JSON to preserve the edited chart.</p></div></div>
    <div className="editor-layout">
      <div className="editor-controls">
        <h3>Edit the chart</h3>
        <label>Y-axis scale
          <select value={config.yAxis.scale} onChange={event => setConfig(previous => ({ ...previous, yAxis: { ...previous.yAxis, scale: event.target.value as 'linear' | 'log', min: event.target.value === 'log' ? 1 : 0 } }))}>
            <option value="linear">Linear</option><option value="log">Logarithmic</option>
          </select>
        </label>
        <label>Y-axis maximum <output>{config.yAxis.max}</output>
          <input type="range" min="80" max="160" step="20" value={config.yAxis.max} onChange={event => setConfig(previous => ({ ...previous, yAxis: { ...previous.yAxis, max: Number(event.target.value) } }))} />
        </label>
        <label>Y tick interval
          <select value={config.yAxis.tickInterval} disabled={config.yAxis.scale === 'log'} onChange={event => setConfig(previous => ({ ...previous, yAxis: { ...previous.yAxis, tickInterval: Number(event.target.value) } }))}>
            <option value="10">10</option><option value="20">20</option><option value="40">40</option>
          </select>
        </label>
        <label>X label interval
          <select value={config.xAxis.tickInterval} onChange={event => setConfig(previous => ({ ...previous, xAxis: { ...previous.xAxis, tickInterval: Number(event.target.value) } }))}>
            <option value="1">Every label</option><option value="2">Every second label</option><option value="3">Every third label</option>
          </select>
        </label>
        <label>Legend
          <select value={legendValue} onChange={event => setConfig(previous => ({ ...previous, legend: { show: event.target.value !== 'off', position: event.target.value === 'bottom' ? 'bottom' : 'top' } }))}>
            <option value="top">Top</option><option value="bottom">Bottom</option><option value="off">Hidden</option>
          </select>
        </label>
        <label>Series color
          <input type="color" value={config.series[0].color ?? '#5369e8'} onChange={event => setConfig(previous => ({ ...previous, series: [{ ...previous.series[0], color: event.target.value }] }))} />
        </label>
      </div>
      <div className="editor-preview"><Chart config={config} data={editorData} /></div>
      <div className="editor-json"><h3>Live JSON config</h3><pre><HighlightedCode code={JSON.stringify(config, null, 2)} language="json" /></pre></div>
    </div>
  </section>;
}
