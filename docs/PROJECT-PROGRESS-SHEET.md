# 📋 NexusFlow — Complete Project Progress & Team Tracking Sheet

**Project:** NexusFlow – Visual IoT Telemetry & Rule Engine  
**Repository:** [GitHub / NexusFlow-Visual-IoT-Telemetry-Rule-Engine](https://github.com/prakharshukla2006/NexusFlow-Visual-IoT-Telemetry-Rule-Engine.git)  
**Branch:** `main`  
**Current Milestone Status:** Weeks 1 & 2 Fully Complete & Pushed (16 Commits) | Weeks 3 & 4 Roadmap Defined  
**Last Updated:** November 21, 2026  

---

## 👥 1. Team Structure & Responsibility Matrix

| Member | Assigned Scope / Role | Core Responsibilities | Current Status |
| :---: | :--- | :--- | :---: |
| **Member 1** | **Visual Workflow Canvas** | React Flow drag-and-drop editor, custom node library (source, math, trigger), edge routing, JSON graph serialization | In Progress |
| **Member 2** | **Time-Series Ingestion & DB** | MongoDB Time Series collections, REST ingestion endpoints, 5,000 writes/sec stress audit, database indexing | In Progress |
| **Member 3** | **Stream Compiler & Rule Engine** | JSON-to-RxJS graph compiler, reactive stream operators, sliding window buffers, mathematical threshold evaluations | In Progress |
| **Member 4** | **Real-Time Dashboard & Alerts** *(Prakhar Shukla)* | Recharts SCADA dashboard, WebSocket bidirectional event bridge, metric cards, audio alarm synthesizer, fleet comparative overlay, test suites | **Completed (Weeks 1 & 2)** |

---

## 🏛️ 2. System Architecture & End-to-End Data Pipeline

```
  ┌────────────────────────────────────────────────────────────────────────┐
  │                           EXTERNAL / DEVICES                           │
  │   Industrial Sensors (Turbines, Compressors, Pumps, Generators)        │
  └───────────────────┬────────────────────────────────┬───────────────────┘
                      │ HTTP POST (Ingest API)         │ WebSocket (1Hz Broadcaster)
                      ▼                                ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │                    BACKEND ENGINE (Node.js + Express)                  │
  │                                                                        │
  │  ┌──────────────────────┐   ┌───────────────────┐   ┌───────────────┐  │
  │  │ REST Ingestion API   │   │ Stream Broadcaster│   │ WebSocket Hub │  │
  │  │ /api/telemetry/ingest│──▶│ /ws/telemetry     │◀──│ (RFC 6455)    │  │
  │  └──────────┬───────────┘   └─────────┬─────────┘   └───────┬───────┘  │
  │             │                         │                     │          │
  │             ▼                         ▼                     │          │
  │  ┌──────────────────────┐   ┌───────────────────┐           │          │
  │  │ RxJS Rule Compiler   │   │ MongoDB TS Engine │           │          │
  │  │ (Graph-to-Observable)│   │ Time Series Store │           │          │
  │  └──────────┬───────────┘   └───────────────────┘           │          │
  └─────────────┼───────────────────────────────────────────────┼──────────┘
                │ Alert Triggers                                │ Telemetry Frames
                ▼                                               ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │                    FRONTEND CLIENT (React 18 + Vite)                   │
  │                                                                        │
  │  ┌──────────────────────┐                   ┌───────────────────────┐  │
  │  │ Visual Rule Canvas   │                   │ SCADA Dashboard       │  │
  │  │ (React Flow Nodes)   │                   │ (Recharts Visualizer) │  │
  │  └──────────────────────┘                   └───────────────────────┘  │
  │             ▲                                           ▲              │
  │             └─────────────────────┬─────────────────────┘              │
  │                                   │                                    │
  │                     ┌─────────────┴─────────────┐                      │
  │                     │ WebSocket Client Hook     │                      │
  │                     │ (useWebSocketTelemetry)   │                      │
  │                     └───────────────────────────┘                      │
  └────────────────────────────────────────────────────────────────────────┘
```

---

## ✅ 3. Completed Work: Every Step Explained (Weeks 1 & 2)

Here is a step-by-step breakdown of every component, algorithm, and module implemented so far.

### 🔹 Phase A: Foundation & Architecture (Week 1)

1. **Visualization Library Selection & ADR-001 ([docs/ADR-001-chart-library-selection.md](file:///C:/Users/PRAKHAR/OneDrive/Desktop/NexusFlow%20Visual%20IoT%20Telemetry%20&%20Rule%20Engine/docs/ADR-001-chart-library-selection.md)):**
   * Benchmarked Recharts vs. Chart.js for high-frequency telemetry.
   * Chose Recharts for its declarative React component hierarchy, SVG vector crispness on high-res displays, zero-canvas pixelation, and native `<ReferenceLine>` and `syncId` support.
2. **Frontend Scaffolding & Dark SCADA Theme:**
   * Bootstrapped React 18, Vite, TypeScript, and Tailwind CSS configured with a dark SCADA palette (`slate-950` canvas, high-contrast monospace readings, cyan/emerald/amber/rose status accents).
3. **Domain Telemetry Typing ([client/src/types/telemetry.ts](file:///C:/Users/PRAKHAR/OneDrive/Desktop/NexusFlow%20Visual%20IoT%20Telemetry%20&%20Rule%20Engine/client/src/types/telemetry.ts)):**
   * Defined strict TypeScript interfaces for machines (`MachineDevice`), metrics (`MetricType`), thresholds (`SensorThresholds`), sliding-window frames (`TelemetryDataPoint`), and alerts (`RuleAlertEvent`).
4. **Mock Telemetry Simulation Engine ([client/src/data/mockTelemetry.ts](file:///C:/Users/PRAKHAR/OneDrive/Desktop/NexusFlow%20Visual%20IoT%20Telemetry%20&%20Rule%20Engine/client/src/data/mockTelemetry.ts)):**
   * Realistic sensor drift generator simulating 4 industrial units (`T-101 Turbine`, `C-202 Compressor`, `P-303 Pump`, `G-404 Generator`).
   * Built-in 5-point moving average smoothing and controlled anomaly injection.
5. **Industrial Layout Shell ([client/src/components/layout/AppLayout.tsx](file:///C:/Users/PRAKHAR/OneDrive/Desktop/NexusFlow%20Visual%20IoT%20Telemetry%20&%20Rule%20Engine/client/src/components/layout/AppLayout.tsx)):**
   * Collapsible Sidebar with module routing (Dashboard, Canvas, Ingestion, Alerts, Logs).
   * SCADA Navbar with real-time clock, WebSocket state indicator, 5,000 writes/sec target badge, and notification counter.
   * System Health Banner displaying machine health percentage, anomaly counter, and RTT latency.

---

### 🔹 Phase B: Advanced SCADA Visualizations & Controls (Week 1)

6. **4x Telemetry Metric Cards ([TelemetryMetricCard.tsx](file:///C:/Users/PRAKHAR/OneDrive/Desktop/NexusFlow%20Visual%20IoT%20Telemetry%20&%20Rule%20Engine/client/src/components/dashboard/TelemetryMetricCard.tsx)):**
   * Instantaneous sensor display for Bearing Temperature (°C), Vibration (mm/s), Pressure (bar), and Rotor Speed (RPM).
   * Custom SVG sparklines with dynamic warning and critical threshold highlight badges.
7. **Multi-Metric Time-Series Trends Chart ([TelemetryTrendsChart.tsx](file:///C:/Users/PRAKHAR/OneDrive/Desktop/NexusFlow%20Visual%20IoT%20Telemetry%20&%20Rule%20Engine/client/src/components/dashboard/TelemetryTrendsChart.tsx)):**
   * Recharts `<AreaChart>` with custom linear gradients and dark backdrop tooltips.
   * Timeframe filters (`1m`, `5m`, `15m`, `1h`, `Live`), 5-point moving average overlay line, and Warning/Critical reference markers.
   * Interactive `<Brush>` scrubber for zooming into sub-second anomaly intervals.
8. **Dual Synchronized Comparison View ([DualMetricsComparisonChart.tsx](file:///C:/Users/PRAKHAR/OneDrive/Desktop/NexusFlow%20Visual%20IoT%20Telemetry%20&%20Rule%20Engine/client/src/components/dashboard/DualMetricsComparisonChart.tsx)):**
   * Uses Recharts' `syncId="nexus-telemetry-sync"` to simultaneously scrub crosshairs across Temperature and Vibration graphs.
9. **Fleet Comparative Influx Overlay ([FleetComparativeOverlayChart.tsx](file:///C:/Users/PRAKHAR/OneDrive/Desktop/NexusFlow%20Visual%20IoT%20Telemetry%20&%20Rule%20Engine/client/src/components/dashboard/FleetComparativeOverlayChart.tsx)):**
   * Recharts `<LineChart>` rendering all 4 production units on a single synchronized canvas.
   * Interactive trace legend toggles, real-time fleet average line, peak unit identifier, and spread delta ($\Delta = \text{Max} - \text{Min}$).
10. **Operational Band Distribution Histogram ([MetricDistributionHistogram.tsx](file:///C:/Users/PRAKHAR/OneDrive/Desktop/NexusFlow%20Visual%20IoT%20Telemetry%20&%20Rule%20Engine/client/src/components/dashboard/MetricDistributionHistogram.tsx)):**
    * Recharts `<BarChart>` segmenting telemetry samples into 4 operational bins: Optimal Safe, High Nominal, Warning State, and Critical Excursion.
    * Real-time calculation of sample mean ($\mu$) and standard deviation ($\sigma$).
11. **Equipment Health Radar ([EquipmentHealthRadar.tsx](file:///C:/Users/PRAKHAR/OneDrive/Desktop/NexusFlow%20Visual%20IoT%20Telemetry%20&%20Rule%20Engine/client/src/components/dashboard/EquipmentHealthRadar.tsx)):**
    * Recharts `<RadarChart>` visualizing equilibrium across 5 normalized operational axes (Thermal, Vibration, Pressure, Kinematics, Electrical Load).
12. **SCADA Rate & Playback Controls ([StreamPlaybackControls.tsx](file:///C:/Users/PRAKHAR/OneDrive/Desktop/NexusFlow%20Visual%20IoT%20Telemetry%20&%20Rule%20Engine/client/src/components/dashboard/StreamPlaybackControls.tsx)):**
    * Influx Pause/Resume, speed toggles (0.5x, 1x, 2x), anomaly highlight toggle, and 3-way layout switch (Focus, Dual Sync, Fleet).
13. **Dynamic Threshold Modal ([ThresholdConfigModal.tsx](file:///C:/Users/PRAKHAR/OneDrive/Desktop/NexusFlow%20Visual%20IoT%20Telemetry%20&%20Rule%20Engine/client/src/components/dashboard/ThresholdConfigModal.tsx)):**
    * Allows operators to update warning/critical thresholds on the fly without refreshing the page.
14. **Telemetry CSV Exporter:**
    * Direct export of current sliding telemetry buffer to standardized CSV for industrial audit trails.
15. **SCADA Web Audio API Synthesizer ([audioAlert.ts](file:///C:/Users/PRAKHAR/OneDrive/Desktop/NexusFlow%20Visual%20IoT%20Telemetry%20&%20Rule%20Engine/client/src/utils/audioAlert.ts)):**
    * Zero-dependency audio alarm generating dual-tone audible beeps on critical threshold violations.

---

### 🔹 Phase C: Backend Ingestion & WebSocket Engine (Week 2)

16. **Express Server & WebSocket Gateway ([server/src/server.ts](file:///C:/Users/PRAKHAR/OneDrive/Desktop/NexusFlow%20Visual%20IoT%20Telemetry%20&%20Rule%20Engine/server/src/server.ts)):**
    * Node.js + Express backend running on port `4000`.
    * Integrated WebSocket server on `ws://localhost:4000/ws/telemetry` using the high-performance `ws` library (RFC 6455).
17. **Standardized WebSocket Protocol Specification ([docs/websocket-protocol-spec.md](file:///C:/Users/PRAKHAR/OneDrive/Desktop/NexusFlow%20Visual%20IoT%20Telemetry%20&%20Rule%20Engine/docs/websocket-protocol-spec.md)):**
    * Documented 8 bi-directional message schemas: `telemetry:subscribe`, `telemetry:unsubscribe`, `telemetry:data`, `telemetry:history`, `rule:alert`, `client:ping`, `server:pong`, `connection:established`.
18. **REST Ingestion & Query Endpoints ([server/src/routes/telemetryRoutes.ts](file:///C:/Users/PRAKHAR/OneDrive/Desktop/NexusFlow%20Visual%20IoT%20Telemetry%20&%20Rule%20Engine/server/src/routes/telemetryRoutes.ts)):**
    * `POST /api/telemetry/ingest` — Ingest single or batch telemetry frames with validation.
    * `GET /api/telemetry/history/:machineId` — Retrieve static or recent historical time-series buffers.
    * `GET /api/machines` — Return fleet device metadata and health status.
19. **Continuous 1Hz Telemetry Broadcaster ([server/src/services/telemetrySimulator.ts](file:///C:/Users/PRAKHAR/OneDrive/Desktop/NexusFlow%20Visual%20IoT%20Telemetry%20&%20Rule%20Engine/server/src/services/telemetrySimulator.ts)):**
    * Background service generating and broadcasting live sensor telemetry frames every 1,000ms.
    * Rolling moving average calculator and automatic rule alert generator.
20. **Frontend WebSocket Service Singleton ([client/src/services/websocketClient.ts](file:///C:/Users/PRAKHAR/OneDrive/Desktop/NexusFlow%20Visual%20IoT%20Telemetry%20&%20Rule%20Engine/client/src/services/websocketClient.ts)):**
    * Singleton connection manager with exponential backoff (1s to 10s ceiling).
    * Heartbeat ping/pong measuring live round-trip latency (RTT) every 5 seconds.
21. **Custom React Hook ([client/src/hooks/useWebSocketTelemetry.ts](file:///C:/Users/PRAKHAR/OneDrive/Desktop/NexusFlow%20Visual%20IoT%20Telemetry%20&%20Rule%20Engine/client/src/hooks/useWebSocketTelemetry.ts)):**
    * Exposes connection status (`connected`, `connecting`, `reconnecting`, `disconnected`), network statistics, and alert listeners to React components.
22. **Static Dashboard Charts & Feed Mode Switcher:**
    * Dual-mode feed toggle: `live_websocket` (continuous stream) vs. `static_baseline` (frozen benchmark reference).
23. **Static Baseline Calibration Inspector ([StaticBaselineInspector.tsx](file:///C:/Users/PRAKHAR/OneDrive/Desktop/NexusFlow%20Visual%20IoT%20Telemetry%20&%20Rule%20Engine/client/src/components/dashboard/StaticBaselineInspector.tsx)):**
    * Computes deviation delta ($\Delta$) against ISO golden run calibration baselines.
24. **WebSocket Network Diagnostics Modal ([WsNetworkDiagnosticsModal.tsx](file:///C:/Users/PRAKHAR/OneDrive/Desktop/NexusFlow%20Visual%20IoT%20Telemetry%20&%20Rule%20Engine/client/src/components/dashboard/WsNetworkDiagnosticsModal.tsx)):**
    * Live inspector showing server URL, client ID, latency RTT, frame counters, reconnect attempts, and an on-demand REST sensor injection dispatcher.
25. **5,000 writes/sec Ingestion Throughput Benchmark ([server/scripts/ingestion-benchmark.js](file:///C:/Users/PRAKHAR/OneDrive/Desktop/NexusFlow%20Visual%20IoT%20Telemetry%20&%20Rule%20Engine/server/scripts/ingestion-benchmark.js)):**
    * Tested 10,000 telemetry frames in 500-sample batches.
    * Measured throughput: **146,842 writes/sec**, exceeding the 5,000 writes/sec mid-project requirement.

---

## 🧪 4. Automated Test Verification Matrix

Run anytime with: `npm run test:telemetry` inside `client/`:

| Test # | Test Name & Scope | Assertion Criteria | Status |
| :---: | :--- | :--- | :---: |
| **1** | 5-Point Moving Average | Mathematical average matches $[80, 82, 84, 86, 88] \rightarrow 84.0^\circ\text{C}$ | ✅ PASS |
| **2** | Signal Noise Smoothing | Spurious isolated spike ($95^\circ\text{C}$) smoothed to nominal baseline ($80^\circ\text{C}$) | ✅ PASS |
| **3** | Safe Threshold Boundary | $84.9^\circ\text{C}$ evaluates within safe nominal band ($< 85.0^\circ\text{C}$) | ✅ PASS |
| **4** | Critical Anomaly Trigger | $85.1^\circ\text{C}$ evaluates as critical threshold excursion ($> 85.0^\circ\text{C}$) | ✅ PASS |
| **5** | Sliding Buffer Capacity | Buffer size strictly capped at 30 samples during continuous high-frequency influx | ✅ PASS |
| **6** | Buffer FIFO Eviction | Newest sample at head (idx 49), oldest sample discarded (idx 20) | ✅ PASS |
| **7** | CSV Serialization Format | Export row contains machine ID, timestamp, and all 5 sensor readings | ✅ PASS |
| **8** | Physical Sensor Bounds | Metric values stay within physical sensor limits (Temp: 0–150°C, Vib: 0–25 mm/s) | ✅ PASS |
| **9** | Fleet Multi-Unit Sync | Overlay synchronizes all 4 plant production units (`T-101`, `C-202`, `P-303`, `G-404`) | ✅ PASS |
| **10** | Fleet Spread Delta | Spread delta correctly calculated as $\Delta = \text{Max} - \text{Min} = 17.6^\circ\text{C}$ | ✅ PASS |
| **11** | Histogram Sum Invariant | Frequency distribution percentage shares sum to exactly $100.0\%$ | ✅ PASS |
| **12** | Anomaly Jitter Hysteresis | Evaluates exactly 2 excursions in noisy jitter signal without false drops | ✅ PASS |

---

## ⏳ 5. What is Left and Has to Be Done (Roadmap for Weeks 3 & 4)

This section maps out what remains to be completed across all team members for the final deliverables:

### 🔴 Week 3: Live Rule Execution & Dynamic Pipeline Integration

| Task Item | Owner | Description & Deliverables |
| :--- | :---: | :--- |
| **1. React Flow Graph Serialization** | Member 1 | Finalize JSON export schema of user-created node graphs (Source $\rightarrow$ Moving Average $\rightarrow$ Threshold $\rightarrow$ Alert). |
| **2. RxJS Pipeline Compiler** | Member 3 | Read serialized JSON graph and compile nodes into dynamic RxJS `Observable` stream pipelines (`bufferCount`, `map`, `filter`). |
| **3. Stream Routing & Execution** | Members 2 & 3 | Pipe incoming WebSocket/HTTP telemetry directly through compiled RxJS pipelines in real time. |
| **4. Live Rule Event Display** | Member 4 | Connect dashboard live alerts panel to incoming `rule:alert` WebSocket events; render rule trigger badges with sub-second latency. |
| **5. Visual Canvas Data Flow Animation** | Members 1 & 4 | Provide visual node pulsing/edge glowing on the React Flow canvas when live telemetry passes through active nodes. |

---

### 🔴 Week 4: Outbound Integrations, Final Polish & Review

| Task Item | Owner | Description & Deliverables |
| :--- | :---: | :--- |
| **1. Outbound Webhook Integration** | Member 4 | Implement HTTP POST dispatcher sending JSON alert payloads to external user-configured webhook endpoints when a rule fires. |
| **2. Mock SMS Notification Provider** | Member 4 | Implement simulated SMS dispatch service logging outbound SMS alerts (e.g. formatted for Twilio API payload). |
| **3. MongoDB Time Series Production Store** | Member 2 | Connect live ingestion stream to physical MongoDB 5.0+ Time Series collection (`timeseries: { timeField: "timestamp", metaField: "machineId" }`). |
| **4. End-to-End System Integration** | All Members | Verify full flow: Hardware/Mock Ingestion $\rightarrow$ Ingest API $\rightarrow$ RxJS Rule Engine $\rightarrow$ MongoDB Storage $\rightarrow$ WebSocket Broadcast $\rightarrow$ SCADA Dashboard & Outbound Webhook. |
| **5. UI Polish & Usability** | Member 1 & 4 | Node connection validation messages, error toast feedback, empty states, and responsive layout polish. |
| **6. Final Demo & Documentation** | All Members | Complete end-to-end setup guide, sample workflow export files, presentation slides, and demo video. |

---

## 🤝 6. Team Integration Points (How to Connect Your Code)

To make integration effortless for all group members, here are the defined interfaces and contracts:

### 1. Connecting Member 1 (React Flow) to Member 3 (RxJS Rule Engine)
* **Contract:** Member 1 exports a standard JSON workflow object:
```json
{
  "workflowId": "wf-turb-temp-01",
  "name": "Turbine Overheat Protection",
  "nodes": [
    { "id": "1", "type": "dataSource", "data": { "machineId": "T-101", "metric": "temperature" } },
    { "id": "2", "type": "movingAverage", "data": { "windowSize": 5 } },
    { "id": "3", "type": "thresholdCheck", "data": { "operator": ">", "limit": 85.0 } },
    { "id": "4", "type": "actionAlert", "data": { "severity": "critical", "actionType": "webhook", "target": "https://api.factory.internal/alerts" } }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2" },
    { "id": "e2-3", "source": "2", "target": "3" },
    { "id": "e3-4", "source": "3", "target": "4" }
  ]
}
```
* **Endpoint:** Send via `POST /api/workflows` (Member 3 validates node types and compiles into an RxJS Observable pipeline).

### 2. Connecting Member 2 (MongoDB Ingestion) to Member 4 (Dashboard)
* **Contract:** Member 2's ingestion endpoint accepts:
```json
POST /api/telemetry/ingest
{
  "timestamp": 1731900000000,
  "machineId": "T-101",
  "temperature": 86.4,
  "vibration": 2.85,
  "pressure": 124.5,
  "rpm": 3240,
  "power": 450.2
}
```
* Once ingested, Member 2 forwards the frame to the WebSocket broadcaster, which transmits `telemetry:data` to Member 4's dashboard charts.

### 3. Connecting Member 3 (Rule Alerts) to Member 4 (Alert Notification Feed)
* When a rule condition evaluates to `true`, the backend dispatches a `rule:alert` event over WebSocket:
```json
{
  "event": "rule:alert",
  "payload": {
    "id": "alert-1731900005",
    "ruleName": "Turbine T-101 Overheat Protection",
    "machineId": "T-101",
    "machineName": "Gas Turbine Generator T-101",
    "metric": "temperature",
    "severity": "critical",
    "threshold": 85.0,
    "actualValue": 86.4,
    "timestamp": "2026-11-21T22:15:00.000Z",
    "actionType": "webhook",
    "actionStatus": "dispatched",
    "actionDestination": "https://api.factory.internal/webhook"
  }
}
```
* Member 4's dashboard immediately pops an alert toast, sounds the SCADA audio alarm, and prepends the event to the Recent Alerts feed.

---

## 💻 7. How Any Team Member Can Run the Project Locally

Clone the repository and run:

### Terminal 1: Backend WebSocket & Ingestion Service
```powershell
cd server
npm install
npm start
```
* Runs Express on **`http://localhost:4000`**
* WebSocket gateway on **`ws://localhost:4000/ws/telemetry`**

### Terminal 2: Frontend SCADA Dashboard (React + Vite)
```powershell
# Open a separate terminal from project root:
cd client
npm install
npm run dev
```
* Runs Vite on **`http://localhost:5173`**

### Run Automated Smoke Tests:
```powershell
cd client
npm run test:telemetry
```

### Run Ingestion Benchmark (5k writes/sec validation):
```powershell
cd server
node scripts/ingestion-benchmark.js
```

---

## 📜 8. Git Commit History Summary (All 16 Commits)

| Hash | Date | Conventional Commit Message |
| :---: | :---: | :--- |
| `1b99baa` | 2026-11-21 | `feat(dashboard): add fleet comparative Recharts overlay, metric distribution histogram, and quickstart runbook` |
| `dd18e48` | 2026-11-20 | `feat(dashboard): add Recharts timeline brush scrubber, equipment health radar, and operator manual` |
| `22d4c18` | 2026-11-19 | `docs(week-1): consolidate full Week 1 comprehensive report, architecture diagrams, and test suite results` |
| `e9e58a7` | 2026-11-19 | `feat(dashboard): add static baseline calibration inspector and 5k writes/sec ingestion benchmark` |
| `eccb1cf` | 2026-11-18 | `feat(dashboard): connect static dashboard charts, live/static mode switcher, and Week 2 progress docs` |
| `cbf98b8` | 2026-11-18 | `feat(client): integrate WebSocket client hook with connection state, ping monitoring, and stream buffering` |
| `8f1438d` | 2026-11-18 | `feat(server): implement telemetry ingestion API, static history endpoints, and event broadcaster` |
| `7fa3ecd` | 2026-11-18 | `feat(server): initialize Express backend with WebSocket server and telemetry event schema` |
| `ae5ad28` | 2026-11-18 | `feat(dashboard): add dual synchronized Recharts view, playback controls, and smoke tests` |
| `935c823` | 2026-11-17 | `feat(dashboard): add dynamic rule threshold modal and telemetry CSV export for Week 1` |
| `675e489` | 2026-11-16 | `docs: complete Week 1 write-up and progress documentation` |
| `4c2dcf3` | 2026-11-16 | `feat(dashboard): add machine fleet status grid and recent alert event panel` |
| `1f0414d` | 2026-11-16 | `feat(dashboard): implement multi-metric telemetry trends chart using Recharts` |
| `914eed4` | 2026-11-16 | `feat(dashboard): build telemetry metric cards with trend indicators and status badges` |
| `6ffe16d` | 2026-11-16 | `feat(layout): construct industrial dashboard shell, sidebar navigation, and header` |
| `e9c1f71` | 2026-11-16 | `feat(dashboard): implement industrial telemetry mock data generator and utilities` |
