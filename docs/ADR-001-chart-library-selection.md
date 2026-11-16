# Architecture Decision Record (ADR-001)

## Title: Selection of Data Visualization Library for Real-Time Telemetry Dashboard

* **Status:** Accepted
* **Decider:** Member 4 (Real-Time Dashboard & Alert Integration)
* **Date:** Week 1 Evaluation
* **Context:** NexusFlow Visual IoT Telemetry & Rule Engine

---

## 1. Context and Problem Statement

NexusFlow is an Industrial IoT monitoring platform that ingests high-frequency telemetry (temperature, vibration, pressure, rotational speed) from factory machines such as gas turbines, hydraulic pumps, and industrial compressors.

The frontend requires a robust charting library capable of:
1. Rendering multi-metric time-series data smoothly with responsive resizing.
2. Integrating seamlessly with React 18+ component lifecycles and state hooks.
3. Visualizing threshold boundaries, anomaly alert markers, and moving-average windows as defined by the visual rule engine.
4. Supporting upcoming real-time streaming updates via WebSocket / Socket.IO (planned for Weeks 2–3).
5. Providing custom tooltips and annotations styled according to an industrial dark SCADA theme.

The project specification presents two primary candidates:
* **Recharts** (SVG-based, React-native)
* **Chart.js** with `react-chartjs-2` (HTML5 Canvas-based)

---

## 2. Comparative Evaluation

| Evaluation Criteria | Recharts (v2.12+) | Chart.js / react-chartjs-2 (v4+) | Winner |
| :--- | :--- | :--- | :--- |
| **React Integration** | First-class declarative JSX components (`<ResponsiveContainer>`, `<AreaChart>`, `<XAxis>`, `<Tooltip>`). Natural state-driven re-renders. | Imperative canvas wrapper requiring instance references, manual canvas cleanup, and chart updates via external refs. | **Recharts** |
| **Rendering Technology** | SVG DOM elements. Crisp vectors on high-DPI industrial monitors; easily styled with CSS classes and Tailwind. | HTML5 Canvas. Pixel-based bitmap rendering; highly performant for >20,000 continuous data points, but harder to style custom DOM tooltips. | **Tie / Use-case specific** |
| **Telemetry Customization** | Exceptional. Custom SVG `<ReferenceLine>`, `<ReferenceArea>` for threshold bands, and fully customizable React `<Tooltip>` render props. | Custom canvas plugins require low-level 2D context drawing commands (`ctx.fillRect`, `ctx.stroke`), increasing codebase complexity. | **Recharts** |
| **Developer Experience (DX)** | High. Strong TypeScript typings, component-based composition, and rapid layout prototyping without imperative callbacks. | Moderate. Nested configuration objects (`options.plugins.tooltip.callbacks...`) with steep learning curve for non-trivial layouts. | **Recharts** |
| **WebSocket Stream Readiness** | Sliding-window buffers (e.g. 50–200 points) render smoothly with SVG animations disabled (`isAnimationActive={false}`) during live streaming. | Handles large static datasets well, but wrapper reactivity occasionally triggers full canvas redraw flickers if not carefully throttled. | **Recharts** |
| **Bundle Footprint & Tree-Shaking** | Modular ES module imports; only imported chart types and subcomponents are bundled into the final build. | Modular in Chart.js v3+, but requires manual registration of components (`ChartJS.register(...)`). | **Recharts** |

---

## 3. Decision Outcome

**Chosen Solution:** **Recharts**

### Rationale:
1. **Declarative Composition:** Recharts allows the dashboard to encapsulate chart logic cleanly into modular React components (`TelemetryTrendsChart`, `MiniSparkline`, etc.) that seamlessly bind to React state and hooks.
2. **Threshold & Alert Overlay:** Recharts provides native `<ReferenceLine>` and `<ReferenceArea>` components, allowing us to visually highlight alert trigger zones (e.g., turbine temperature warning threshold at 85°C) without complex canvas math.
3. **Responsive Industrial Layout:** The `<ResponsiveContainer>` component adapts automatically to dynamic SCADA grid layouts, multi-column dashboard cards, and collapsible sidebars without manual window resize event handlers.
4. **Tailwind CSS Synergy:** Tooltips and annotations in Recharts render as native DOM elements, enabling styling with Tailwind CSS to match the industrial telemetry dark aesthetic.

---

## 4. Implementation Guidelines for NexusFlow

1. **Live Stream Performance Optimization:**
   - For real-time updates (Weeks 2–3), set `isAnimationActive={false}` on high-frequency streaming charts to eliminate animation overhead.
   - Maintain a fixed sliding window (default: 50–100 data points per metric) using ring-buffer or slice logic to ensure constant-time rendering.
2. **Custom Tooltips:**
   - Create a reusable `CustomTelemetryTooltip` component formatting timestamps (`HH:mm:ss`), exact sensor identifiers, unit indicators, and status badges.
3. **Threshold Indicators:**
   - Always expose configurable threshold reference lines corresponding to rule engine parameters (e.g., Warning Threshold, Critical Emergency Shutoff).

---

## 5. References
- NexusFlow Project Brief (Page 3: Technologies Used; Page 5: Development Plan)
- Recharts Official Documentation: [https://recharts.org](https://recharts.org)
