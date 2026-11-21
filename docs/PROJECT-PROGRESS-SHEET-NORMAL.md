# 📊 NexusFlow Project Progress Sheet

* **Project Title:** NexusFlow – Visual IoT Telemetry & Rule Engine
* **Project Type:** Full-Stack Industrial IoT (IIoT) Platform
* **Total Duration:** 4 Weeks
* **Current Overall Progress:** **50% Completed** (Weeks 1 & 2 Complete; Weeks 3 & 4 Upcoming)
* **Date:** November 21, 2026
* **Repository:** [GitHub / NexusFlow](https://github.com/prakharshukla2006/NexusFlow-Visual-IoT-Telemetry-Rule-Engine.git)

---

## 👥 Team Roles

| Member | Role | Core Responsibility |
| :--- | :--- | :--- |
| **Member 1** | Visual Workflow Canvas | React Flow visual node editor & JSON serialization |
| **Member 2** | Time-Series Database & Ingestion | MongoDB Time Series storage & REST ingestion API |
| **Member 3** | Stream Compiler & Rule Engine | RxJS reactive stream pipeline & rule evaluation |
| **Member 4** *(Prakhar)* | Real-Time Dashboard & Alerts | Recharts SCADA dashboard, WebSockets, & alert integrations |

---

## 📋 Task Tracking Sheet

| Task ID | Phase / Week | Module / Task Name | Assigned To | Status | Deliverable / Output Evidence |
| :---: | :---: | :--- | :---: | :---: | :--- |
| **W1.01** | Week 1 | Chart Library ADR-001 (Recharts selection) | Member 4 | ✅ **Completed** | `docs/ADR-001-chart-library-selection.md` |
| **W1.02** | Week 1 | Frontend Client Setup (React 18 + Vite + Tailwind) | Member 4 | ✅ **Completed** | `client/` scaffolding & SCADA dark theme |
| **W1.03** | Week 1 | Telemetry Types & Mock Simulation Engine | Member 4 | ✅ **Completed** | `client/src/types/telemetry.ts` |
| **W1.04** | Week 1 | Dashboard Shell, Sidebar & Navbar Navigation | Member 4 | ✅ **Completed** | `AppLayout.tsx`, `Sidebar.tsx`, `Navbar.tsx` |
| **W1.05** | Week 1 | 4x Telemetry Metric Cards with Sparklines | Member 4 | ✅ **Completed** | `TelemetryMetricCard.tsx` (Temp, Vib, Press, RPM) |
| **W1.06** | Week 1 | Multi-Metric Trends Chart with Brush Scrubber | Member 4 | ✅ **Completed** | `TelemetryTrendsChart.tsx` (Recharts `<Brush>`) |
| **W1.07** | Week 1 | Dual Synchronized View & Fleet Comparative Overlay | Member 4 | ✅ **Completed** | `DualMetricsComparisonChart.tsx` & `FleetComparativeOverlayChart.tsx` |
| **W1.08** | Week 1 | Dynamic Thresholds Modal & CSV Telemetry Export | Member 4 | ✅ **Completed** | `ThresholdConfigModal.tsx` & CSV download |
| **W1.09** | Week 1 | Web Audio Alarm Synthesizer & 12 Smoke Tests | Member 4 | ✅ **Completed** | `npm run test:telemetry` (12/12 passing) |
| **W1.10** | Week 1 | React Flow Canvas Scaffolding | Member 1 | 🟡 In Progress | React Flow drag-and-drop canvas scaffold |
| **W1.11** | Week 1 | MongoDB Database Setup & Time-Series Collections | Member 2 | 🟡 In Progress | Database schema & ingestion API setup |
| **W2.01** | Week 2 | Express Backend & WebSocket Gateway Hub | Member 4 | ✅ **Completed** | `server/src/server.ts` (`ws://localhost:4000/ws/telemetry`) |
| **W2.02** | Week 2 | WebSocket Protocol Specification (8 Event Types) | Member 4 | ✅ **Completed** | `docs/websocket-protocol-spec.md` |
| **W2.03** | Week 2 | REST Ingestion API & Historical Query Endpoints | Member 4 | ✅ **Completed** | `POST /api/telemetry/ingest`, `GET /api/telemetry/history` |
| **W2.04** | Week 2 | Continuous 1Hz Background Telemetry Broadcaster | Member 4 | ✅ **Completed** | `server/src/services/telemetrySimulator.ts` |
| **W2.05** | Week 2 | Frontend WebSocket Client & useWebSocket Hook | Member 4 | ✅ **Completed** | `websocketClient.ts` & `useWebSocketTelemetry.ts` |
| **W2.06** | Week 2 | Static Baseline Calibration Inspector | Member 4 | ✅ **Completed** | `StaticBaselineInspector.tsx` (tolerance delta Δ) |
| **W2.07** | Week 2 | 5,000 writes/sec Mid-Project Ingestion Benchmark | Member 4 | ✅ **Completed** | `server/scripts/ingestion-benchmark.js` (**146k writes/s**) |
| **W2.08** | Week 2 | React Flow Node Library (Source, Math, Action) | Member 1 | 🟡 In Progress | Node serialization into JSON format |
| **W2.09** | Week 2 | RxJS Logic Compiler & Stream Validator | Member 3 | 🟡 In Progress | Mapping JSON nodes to RxJS operators |
| **W3.01** | Week 3 | Visual Workflow Graph JSON Export | Member 1 | ⏳ Pending | Serialized JSON graph output |
| **W3.02** | Week 3 | JSON-to-RxJS Stream Pipeline Compiler | Member 3 | ⏳ Pending | Backend Observable stream pipeline |
| **W3.03** | Week 3 | Route Live Telemetry Through Rule Pipeline | Members 2 & 3 | ⏳ Pending | Real-time rule evaluation |
| **W3.04** | Week 3 | Live Rule Event Display on Dashboard | Member 4 | ⏳ Pending | Dynamic `rule:alert` notifications on dashboard |
| **W3.05** | Week 3 | Visual Data Flow Pulsing Animation on Canvas | Members 1 & 4 | ⏳ Pending | Animated data movement across active nodes |
| **W4.01** | Week 4 | Outbound Webhook Alert Integration | Member 4 | ⏳ Pending | HTTP POST alert dispatcher to external URLs |
| **W4.02** | Week 4 | Mock SMS Notification Dispatcher | Member 4 | ⏳ Pending | Operator SMS alert simulation |
| **W4.03** | Week 4 | MongoDB Physical Time-Series Storage | Member 2 | ⏳ Pending | Production database collection storage |
| **W4.04** | Week 4 | End-to-End System Testing & Verification | All Members | ⏳ Pending | Complete flow from sensor to alert |
| **W4.05** | Week 4 | UI/UX Usability Polish & Empty States | All Members | ⏳ Pending | User feedback and styling refinements |
| **W4.06** | Week 4 | Final Report, Demo Video & Presentation | All Members | ⏳ Pending | Submission deliverables |

---

## 🟢 Summary of What is Completed (Weeks 1 & 2)

1. **SCADA Dashboard (Frontend):**
   * Real-time monitoring of 4 machines (`T-101 Turbine`, `C-202 Compressor`, `P-303 Pump`, `G-404 Generator`).
   * 4 Sensor Cards with SVG sparklines (Bearing Temp, Vibration, Hydraulic Pressure, RPM).
   * 3 View Modes: **Focus** (area chart with timeline zoom scrubber), **Dual Sync** (synchronized crosshairs), and **Fleet** (all 4 units compared side-by-side).
   * Operational Band Histogram showing reading distribution and Equipment Health Radar.
   * Dynamic threshold configuration modal and one-click CSV export.
   * Audible SCADA alarm synthesizer (Web Audio API) for critical threshold alerts.

2. **Backend & WebSocket Streaming:**
   * Node.js/Express server on port `4000` with WebSocket hub on `ws://localhost:4000/ws/telemetry`.
   * REST endpoints: Ingestion (`POST /api/telemetry/ingest`), historical telemetry (`GET /api/telemetry/history/:machineId`), and machine fleet metadata.
   * Continuous 1Hz telemetry broadcaster with rolling moving average calculations.
   * Frontend WebSocket client with automatic reconnection and 5-second ping/pong latency measurement.
   * Static baseline calibration tool comparing live values against ISO reference curves.
   * Ingestion benchmark demonstrating **146,000+ writes/sec** (exceeding the 5,000 writes/sec mid-project requirement).

3. **Verification:**
   * 12 automated smoke test assertions passing (`npm run test:telemetry`).
   * 16 commits pushed to GitHub `main` branch.

---

## 🟡 Summary of What is Left & Has to Be Done (Weeks 3 & 4)

1. **Week 3 (Live Rule Execution & Pipeline Integration):**
   * Member 1 finalizes the React Flow visual canvas so users can drag, connect, and save rules as JSON.
   * Member 3 compiles the saved JSON graph into an active RxJS stream pipeline.
   * Connect live WebSocket telemetry to the RxJS pipeline to evaluate rules in real time.
   * Display live rule trigger events on Member 4's dashboard with animated node pulses on Member 1's canvas.

2. **Week 4 (Outbound Integrations, Final Polish & Review):**
   * Member 4 implements outbound webhook delivery (HTTP POST alert) and simulated SMS notifications.
   * Member 2 connects physical MongoDB Time Series storage for high-frequency logs.
   * Perform end-to-end testing across all components (Sensor $\rightarrow$ Ingestion $\rightarrow$ RxJS Rule $\rightarrow$ Database $\rightarrow$ WebSocket $\rightarrow$ Dashboard $\rightarrow$ Webhook/SMS).
   * Prepare final demo video, sample workflow files, and presentation slides.

---

## 🚀 Quick Run Commands for the Team

```powershell
# 1. Start Backend Server (runs on http://localhost:4000)
cd server
npm start

# 2. Start Frontend Dashboard (runs on http://localhost:5173)
cd client
npm run dev

# 3. Run Automated Tests
cd client
npm run test:telemetry
```
