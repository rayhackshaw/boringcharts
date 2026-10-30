import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Chart, computeTicks, createScale } from '../dist/index.js';
import { fitLinearTrend } from '../dist/trend.js';

test('tick intervals and category skipping are deterministic', () => {
  assert.deepEqual(computeTicks(0, 10, 2), [0, 2, 4, 6, 8, 10]);
  const scale = createScale({ field: 'x', scale: 'category', tickInterval: 2 }, ['a', 'b', 'c', 'd'], [0, 400]);
  assert.deepEqual(scale.ticks(), ['a', 'c']);
  assert.equal(scale.position('b'), 150);
});

test('log scales reject nonpositive values', () => {
  const scale = createScale({ field: 'x', scale: 'log' }, [-1, 1, 10, 100], [0, 100]);
  assert.equal(scale.position(-1), undefined);
  assert.equal(scale.position(10), 50);
});

const rows = [
  { month: 'Jan', a: 2, b: 4 },
  { month: 'Feb', a: 3, b: 5 },
  { month: 'Mar', a: 4, b: 6 },
];
const axes = { xAxis: { field: 'month', scale: 'category' }, yAxis: { field: 'a', scale: 'linear', tickInterval: 2, showGrid: true } };
const series = [{ field: 'a', label: 'Alpha' }, { field: 'b', label: 'Beta' }];

for (const type of ['line', 'area', 'bar', 'scatter', 'radar']) {
  test(`${type} renders SVG from JSON`, () => {
    const markup = renderToStaticMarkup(React.createElement(Chart, { config: { type, ...axes, series, title: 'Example' }, data: rows }));
    assert.match(markup, /<svg/);
    assert.match(markup, /Example/);
    assert.match(markup, /Alpha/);
    assert.match(markup, /Chart marks|polygon/);
  });
}

for (const type of ['pie', 'donut']) {
  test(`${type} renders slices`, () => {
    const markup = renderToStaticMarkup(React.createElement(Chart, { config: { type, categoryField: 'month', valueField: 'a' }, data: rows }));
    assert.match(markup, /Chart slices/);
    assert.match(markup, /Jan: 2/);
  });
}

test('horizontal stacked bars render with negative values', () => {
  const markup = renderToStaticMarkup(React.createElement(Chart, {
    config: { type: 'bar', ...axes, series, orientation: 'horizontal', layout: 'stacked' },
    data: [{ month: 'Jan', a: -2, b: 4 }],
  }));
  assert.equal((markup.match(/<rect [^>]*><title>/g) ?? []).length, 2);
});

test('scatter trend fits a line and flags a distant point', () => {
  const points = Array.from({ length: 10 }, (_, x) => [x, x === 5 ? 30 : x * 2]);
  const fit = fitLinearTrend(points, 1.7);
  assert.ok(fit);
  assert.equal(fit.start[0], 0);
  assert.equal(fit.end[0], 9);
  assert.deepEqual(fit.anomalyIndices, [5]);

  const markup = renderToStaticMarkup(React.createElement(Chart, {
    config: {
      type: 'scatter', xAxis: { field: 'x', scale: 'linear' }, yAxis: { field: 'y', scale: 'linear' },
      series: [{ field: 'y' }], trendLine: { anomalies: { threshold: 1.7 } },
    },
    data: points.map(([x, y]) => ({ x, y })),
  }));
  assert.match(markup, /best-fit line/);
  assert.match(markup, /Potential anomaly/);
});

test('radar places side labels outward from vertices', () => {
  const markup = renderToStaticMarkup(React.createElement(Chart, {
    config: {
      type: 'radar', width: 500, height: 300, labelOffset: 32,
      xAxis: { field: 'metric', scale: 'category' },
      yAxis: { field: 'score', scale: 'linear', min: 0, max: 100 },
      series: [{ field: 'score' }], legend: { show: false },
    },
    data: [
      { metric: 'Speed', score: 70 }, { metric: 'Quality', score: 85 },
      { metric: 'Reach', score: 65 }, { metric: 'Cost', score: 75 },
      { metric: 'Support', score: 80 },
    ],
  }));
  assert.match(markup, /text-anchor="start"/);
  assert.match(markup, /text-anchor="end"/);
  assert.match(markup, /dominant-baseline="middle"/);
});
