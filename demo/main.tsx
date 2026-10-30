import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Chart } from '../src/index.js';
import { designTokens, heroVariants, sections, type Example } from './data.js';
import { EditingSection, GettingStartedSection } from './guides.js';
import { HighlightedCode } from './highlight.js';
import './style.css';

const heroVariant = heroVariants[Math.floor(Math.random() * heroVariants.length)]!;

type Page = 'start' | 'editing' | 'tokens' | 'charts';
interface Route { page: Page; chartId?: string }

function routeFromHash(hash: string): Route {
  const [first, second] = hash.replace(/^#\/?/, '').split('/');
  if (first === 'editing') return { page: 'editing' };
  if (first === 'tokens') return { page: 'tokens' };
  if (first === 'charts') return second && sections.some(section => section.id === second)
    ? { page: 'charts', chartId: second } : { page: 'charts' };
  // Previous anchor URLs still open the right view.
  if (first && sections.some(section => section.id === first)) return { page: 'charts', chartId: first };
  return { page: 'start' };
}

function routeFromPath(pathname: string): Route {
  const [first, second] = pathname.replace(/^\/+/, '').split('/');
  if (first === 'editing') return { page: 'editing' };
  if (first === 'tokens') return { page: 'tokens' };
  if (first === 'charts') return second && sections.some(section => section.id === second)
    ? { page: 'charts', chartId: second } : { page: 'charts' };
  return { page: 'start' };
}

function currentRoute(): Route {
  return window.location.pathname === '/' && window.location.hash
    ? routeFromHash(window.location.hash)
    : routeFromPath(window.location.pathname);
}

function routePath(route: Route): string {
  return route.page === 'charts' && route.chartId ? `/charts/${route.chartId}` : `/${route.page}`;
}

function Icon({ name }: { name: 'grid' | 'code' | 'arrow' | 'down' | 'chart' | 'edit' }) {
  if (name === 'grid') return <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="2.5" y="2.5" width="6" height="6" rx="1.5" /><rect x="11.5" y="2.5" width="6" height="6" rx="1.5" /><rect x="2.5" y="11.5" width="6" height="6" rx="1.5" /><rect x="11.5" y="11.5" width="6" height="6" rx="1.5" /></svg>;
  if (name === 'code') return <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m7 5-5 5 5 5m6-10 5 5-5 5M12 3l-4 14" /></svg>;
  if (name === 'chart') return <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 3v14h14M5 13l4-4 3 2 5-6" /></svg>;
  if (name === 'down') return <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 3v13m-5-5 5 5 5-5" /></svg>;
  if (name === 'edit') return <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M11.5 4.5 15.5 8.5M3 17l3.7-.8L17 5.9a2.1 2.1 0 0 0-3-3L3.8 13.2 3 17Z" /></svg>;
  return <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 10h13m-5-5 5 5-5 5" /></svg>;
}

function ExampleCard({ example }: { example: Example }) {
  const [showConfig, setShowConfig] = useState(false);
  const [hasSwapped, setHasSwapped] = useState(false);
  return <article className="example-card">
    <div className="card-heading"><div><h3>{example.name}</h3><p>{example.note}</p></div><button type="button" className={`icon-button ${showConfig ? 'active' : ''}`} aria-label={`${showConfig ? 'Show chart for' : 'Show JSON configuration for'} ${example.name}`} aria-pressed={showConfig} onClick={() => { setHasSwapped(true); setShowConfig(!showConfig); }} title={showConfig ? 'Show chart' : 'View JSON config'}><Icon name={showConfig ? 'chart' : 'code'} /></button></div>
    <div className="chart-frame">
      {showConfig
        ? <div key="code" className="code-view swap-enter" role="region" aria-label={`${example.name} JSON configuration`}><pre><HighlightedCode code={JSON.stringify(example.config, null, 2)} language="json" /></pre></div>
        : <div key="chart" className={`chart-view ${hasSwapped ? 'swap-enter' : ''}`}><Chart config={{ ...example.config, width: 500, height: 300, colors: example.config.colors ?? designTokens.palette }} data={example.data} /></div>}
    </div>
  </article>;
}

function TokenSection() {
  return <section id="tokens" className="token-section section-block">
    <div className="section-intro"><div><h2>Design tokens</h2><p>A compact visual system for every example below. Use these values as a starting point, then replace them with your product palette.</p></div></div>
    <div className="token-grid">
      <div className="token-panel color-panel"><div className="panel-heading"><h3>Chart palette</h3></div><div className="swatches">{designTokens.colors.map(token => <div className="swatch" key={token.name}><div className="swatch-color" style={{ backgroundColor: token.hex }} /><div className="swatch-copy"><strong>{token.name}</strong><span>{token.role}</span><code>{token.hex}</code></div></div>)}</div></div>
      <div className="token-panel"><div className="panel-heading"><h3>Surfaces &amp; strokes</h3></div><div className="surface-list"><div><i className="surface-chip page-chip" /><span>Page</span><code>#F5F7FB</code></div><div><i className="surface-chip card-chip" /><span>Card</span><code>#FFFFFF</code></div><div><i className="surface-chip grid-chip" /><span>Grid</span><code>#E5E7EB</code></div><div><i className="surface-chip ink-chip" /><span>Ink</span><code>#17243A</code></div></div></div>
      <div className="token-panel type-panel"><div className="panel-heading"><h3>Type &amp; rhythm</h3></div><div className="type-preview"><strong>Clear at a glance.</strong><p>Every label, axis and annotation has room to breathe.</p></div><div className="rhythm"><h4>Spacing</h4><div><b>4</b><b>8</b><b>16</b><b>24</b><b>32</b></div></div></div>
    </div>
  </section>;
}

function App() {
  const [route, setRoute] = useState<Route>(currentRoute);
  const [leaving, setLeaving] = useState(false);
  const exitTimer = useRef<number | undefined>(undefined);

  const transitionTo = (next: Route) => {
    if (exitTimer.current !== undefined) {
      window.clearTimeout(exitTimer.current);
      exitTimer.current = undefined;
    }
    if (next.page === route.page) {
      setLeaving(false);
      setRoute(next);
      if (next.page === 'charts' && next.chartId) {
        document.getElementById(next.chartId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRoute(next);
      setLeaving(false);
      return;
    }
    setLeaving(true);
    exitTimer.current = window.setTimeout(() => {
      setRoute(next);
      setLeaving(false);
      exitTimer.current = undefined;
    }, 240);
  };

  useEffect(() => {
    // Existing shared hash links migrate to clean paths on first load.
    if (window.location.hash) window.history.replaceState(null, '', routePath(route));
  }, []);

  useEffect(() => {
    const onPopState = () => transitionTo(routeFromPath(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
      if (exitTimer.current !== undefined) window.clearTimeout(exitTimer.current);
    };
  }, [route.page]);

  const onLinkClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest('a[href^="/"]');
    if (!link || link.hasAttribute('download') || link.getAttribute('target')) return;
    const destination = new URL(link.getAttribute('href') ?? '', window.location.href);
    if (destination.origin !== window.location.origin) return;
    event.preventDefault();
    if (window.location.pathname !== destination.pathname) window.history.pushState(null, '', destination.pathname);
    transitionTo(routeFromPath(destination.pathname));
  };

  useLayoutEffect(() => {
    if (route.page === 'charts' && route.chartId) {
      document.getElementById(route.chartId)?.scrollIntoView({ behavior: 'instant', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [route.page]);

  useLayoutEffect(() => {
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const targets = document.querySelectorAll<HTMLElement>('.guide-section .section-intro, .guide-card, .editor-layout, .token-panel, .gallery-heading, .chart-section .section-intro, .example-card');
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
    targets.forEach(target => {
      target.classList.add('reveal-item');
      observer.observe(target);
    });
    return () => observer.disconnect();
  }, [route.page]);

  return <div className="app-shell" onClick={onLinkClick}>
    <aside className="sidebar"><a href="/start" className="brand"><img className="brand-icon" src="/favicon.svg" alt="" /><span>boring<span className="brand-light">charts</span></span></a>
      <nav aria-label="Pages">
        <a href="/start" className={route.page === 'start' ? 'active' : ''} aria-current={route.page === 'start' ? 'page' : undefined}><Icon name="grid" /> Get started</a>
        <a href="/editing" className={route.page === 'editing' ? 'active' : ''} aria-current={route.page === 'editing' ? 'page' : undefined}><Icon name="edit" /> Chart editing</a>
        <a href="/tokens" className={route.page === 'tokens' ? 'active' : ''} aria-current={route.page === 'tokens' ? 'page' : undefined}><span className="nav-symbol">◈</span> Design tokens</a>
        <a href="/charts" className={route.page === 'charts' ? 'active' : ''} aria-current={route.page === 'charts' ? 'page' : undefined}><Icon name="chart" /> Explore charts</a>
      </nav>
      <nav className="chart-nav" aria-label="Chart types">{sections.map(section => <a href={`/charts/${section.id}`} className={route.page === 'charts' && route.chartId === section.id ? 'active' : ''} key={section.id}>{section.title}</a>)}</nav>
    </aside>

    <main>
      <div className={`page-content ${leaving ? 'is-leaving' : ''}`}>
        <div className="content-wrap">
          {route.page === 'start' && <>
            <section className="hero section-block">
              <div className="hero-copy">
                <h1>boring<span>charts</span></h1>
                <p>React chart library with native TypeScript support, lightweight SVG rendering, and flexible JSON configuration.</p>
                <div className="hero-actions"><a href="/charts" className="primary-action">Explore charts <Icon name="arrow" /></a></div>
              </div>
              <div className="hero-chart"><Chart config={heroVariant.config} data={heroVariant.data} /></div>
            </section>
            <GettingStartedSection />
          </>}
          {route.page === 'editing' && <EditingSection />}
          {route.page === 'tokens' && <TokenSection />}
          {route.page === 'charts' && <>
            <div className="gallery-heading"><div><h2>Chart gallery</h2><p>Scan every chart type, then inspect the variants that fit your data.</p></div></div>
            {sections.map(section => <section className="chart-section section-block" id={section.id} key={section.id}><div className="section-intro"><div><h2>{section.title} charts</h2><p>{section.description}</p></div></div><div className="example-grid">{section.examples.map(example => <ExampleCard key={example.id} example={example} />)}</div></section>)}
          </>}
          <footer className="site-footer">
            <div className="footer-top">
              <div className="footer-identity"><span className="footer-brand">boring<span>charts</span></span><p>Made by <a href="https://github.com/rayhackshaw" target="_blank" rel="noopener noreferrer">rayhackshaw ↗</a></p></div>
              <div className="footer-disclosure"><h2>AI disclosure</h2><p>Made with OpenAI's GPT-6 Sol. Review and test before production use.</p></div>
            </div>
            <div className="footer-bottom"><span>boringcharts · React chart library</span><a href="/start">Back to start ↑</a></div>
          </footer>
        </div>
      </div>
    </main>
  </div>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
