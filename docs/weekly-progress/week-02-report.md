# Week 2 Progress Report & Write-Up

* **Project:** NexusFlow – Visual IoT Telemetry & Rule Engine
* **Team Member:** Member 4 (Prakhar Shukla)
* **Role:** Real-Time Dashboard & Alert Integration
* **Milestone Focus:** Set up WebSocket events and static dashboard charts
* **Commit Requirement:** 4 valid commits
* **Status:** Completed & Ready for Portal Submission

---

## 📝 Portal Submission Write-Up (Copy-Paste Ready for Week 2)

```markdown
### 1. What Did You Build This Week? (Features)
- Implemented full WebSocket communication infrastructure between the Node.js/Express backend engine and the React frontend SCADA dashboard using the `ws` library (RFC 6455) under the `/ws/telemetry` gateway.
- Defined a standardized, type-safe WebSocket protocol specification (documented in `docs/websocket-protocol-spec.md`) encompassing bi-directional event schemas:
  * Client-to-server: `telemetry:subscribe`, `telemetry:unsubscribe`, and `client:ping`.
  * Server-to-client: `connection:established`, `telemetry:data`, `telemetry:history`, `rule:alert`, and `server:pong`.
- Developed the backend telemetry ingestion REST API (`POST /api/telemetry/ingest`), static historical baseline endpoint (`GET /api/telemetry/history/:machineId`), and fleet metadata route (`GET /api/machines`).
- Built the backend background telemetry producer (`telemetrySimulator.ts`) broadcasting continuous 1Hz sensor frames with rolling 5-point moving average calculations and threshold violation alert dispatches.
- Created the frontend WebSocket client service (`NexusWsClient`) featuring automatic exponential backoff reconnection (1s–10s ceiling), 5-second heartbeat ping/pong latency measurement, and subscription routing.
- Integrated the custom React hook `useWebSocketTelemetry` to manage socket lifecycle states (`connecting`, `connected`, `disconnected`, `reconnecting`) and buffer incoming frames into a 30-sample sliding window.
- Implemented Static Dashboard Charts and Feed Mode Switcher:
  * Provided a dual-mode toggle between "Live WebSocket Stream" and "Static Baseline Dataset".
  * Rendered fixed 30-sample static baseline charts for offline sensor calibration, benchmark inspection, and deterministic rule validation.
- Built the interactive WebSocket Network Diagnostics Modal displaying gateway connection status, live round-trip latency (RTT), frames ingested counter, client session ID, and an on-demand REST sensor ingestion test dispatcher.

### 2. Fixes & Engineering Challenges Solved
- Implemented client heartbeat pong listeners to automatically recover from dropped TCP connections and detect dead sockets without waiting for browser timeout.
- Engineered graceful fallback handling: if the backend server is temporarily offline, the frontend seamlessly transitions to local static baseline simulation without crashing or interrupting dashboard analytics.
- Prevented React virtual DOM thrashing by decoupling high-frequency WebSocket socket message events from non-essential layout re-renders.

### 3. Blockers
- None. All scheduled Week 2 objectives for Member 4 ("Set up WebSocket events and static dashboard charts") have been achieved with 4 valid commits.

### 4. Learnings & Next Steps (Week 3 Plan)
- Learned how to manage multi-client WebSocket subscription sets and optimize streaming payload sizes by transmitting compact delta frames instead of entire history buffers.
- Next week (Week 3): Live Rule Execution & Dynamic Pipeline Integration — connect live WebSocket telemetry directly to compiled RxJS rule processing pipelines and visualize real-time threshold trigger events on the live dashboard.
```

---

## 📌 The 4 Valid Commits Log (Week 2)

| # | Commit Hash | Conventional Commit Message | Details |
| :-: | :---: | :--- | :--- |
| **1** | `7fa3ecd` | `feat(server): initialize Express backend with WebSocket server and telemetry event schema` | Node.js Express server, `ws` gateway hub, and TypeScript event interfaces |
| **2** | `8f1438d` | `feat(server): implement telemetry ingestion API, static history endpoints, and event broadcaster` | REST endpoints (`/api/telemetry/ingest`, `/api/telemetry/history`), live broadcaster |
| **3** | `cbf98b8` | `feat(client): integrate WebSocket client hook with connection state, ping monitoring, and stream buffering` | `websocketClient.ts`, `useWebSocketTelemetry.ts` React hook, latency RTT |
| **4** | `27127ab` | `feat(dashboard): connect static dashboard charts, live/static mode switcher, and Week 2 progress docs` | Static charts mode, WS diagnostics modal, protocol docs, and Week 2 report |
