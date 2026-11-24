# Week 2 Progress Report & Write-Up

* **Project:** NexusFlow – Visual IoT Telemetry & Rule Engine
* **Team Member:** Member 4 (Prakhar Shukla)
* **Role:** Real-Time Dashboard & Alert Integration
* **Milestone Focus:** Set up WebSocket events and static dashboard charts
* **Active Progression:** Week 2 Completed & Enhanced (Days 1–2)

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
- Built the Static Baseline Calibration & Reference Delta Inspector (`StaticBaselineInspector.tsx`), allowing operators to compare real-time turbine readings against ISO-standard golden run curves and compute tolerance deviations (Δ).
- Conducted the Mid-Project Ingestion Audit Benchmark (`server/scripts/ingestion-benchmark.js`): simulated 10,000 telemetry sensor frames in 500-sample chunks, demonstrating a measured throughput of 146,000+ writes/sec, successfully exceeding the 5,000 writes/sec mid-project review target.
- Built the interactive WebSocket Network Diagnostics Modal displaying gateway connection status, live round-trip latency (RTT), frames ingested counter, client session ID, and an on-demand REST sensor ingestion test dispatcher.
- Developed the Mid-Project Review Workflow Graph Validator (`server/src/services/workflowValidator.ts`) and specification (`docs/workflow-schema-spec.md`): validates React Flow serialized JSON graphs, enforces node type constraints, detects cyclic feedback loops via Kahn's topological sort algorithm, and compiles execution ordering.
- Implemented Workflow REST API endpoints (`POST /api/workflows/validate`, `POST /api/workflows`, `GET /api/workflows`, `GET /api/workflows/:id`) enabling dynamic pipeline registration.
- Created the Automated Graph Validation Test Suite (`server/scripts/validate-workflow-graph.js` / `npm run test:workflow`) with 10 passing assertions verifying linear pipelines, multi-branch forks, DAG cycle detection, and parameter bounds.

### 2. Fixes & Engineering Challenges Solved
- Integrated bi-directional WebSocket telemetry frame propagation (`onTelemetryReceived`) from the `useWebSocketTelemetry` client hook into parent state, directly streaming live sensor readings to dashboard cards and charts.
- Resolved race condition between live WebSocket feed and local fallback simulation: local interval pauses when live WebSocket is connected, preventing competing duplicate ticks while preserving instant offline fallback.
- Harmonized fleet machine ID identifiers (`T-101`, `C-204`, `H-302`, `G-501`) across `FleetComparativeOverlayChart`, fixing grey trace color fallbacks and enabling dynamic machine visibility initialization.
- Synchronized static baseline profile selector state upon metric change in `StaticBaselineInspector` to prevent stale profile ID selection across metric switches.
- Guarded `EquipmentHealthRadar` and `MetricDistributionHistogram` against nullish metric data or uninitialized buffer edge cases to eliminate potential UI rendering exceptions.
- Hardened Web Audio API context resume logic by handling asynchronous `resume()` promises safely against browser autoplay policy restrictions.
- Verified batch memory allocation during ingestion stress tests (+0.30 MB heap delta over 10,000 frames) ensuring zero memory leaks during extended monitoring runs.

### 3. Blockers
- None. All scheduled Week 2 objectives for Member 4 ("Set up WebSocket events and static dashboard charts") have been achieved with verified performance benchmarks.

### 4. Learnings & Next Steps (Week 3 Plan)
- Learned how to manage multi-client WebSocket subscription sets and optimize streaming payload sizes by transmitting compact delta frames instead of entire history buffers.
- Next week (Week 3): Live Rule Execution & Dynamic Pipeline Integration — connect live WebSocket telemetry directly to compiled RxJS rule processing pipelines and visualize real-time threshold trigger events on the live dashboard.
```

---

## 📌 Commits Log (Week 2)

| # | Commit Hash | Conventional Commit Message | Details |
| :-: | :---: | :--- | :--- |
| **1** | `7fa3ecd` | `feat(server): initialize Express backend with WebSocket server and telemetry event schema` | Node.js Express server, `ws` gateway hub, and TypeScript event interfaces |
| **2** | `8f1438d` | `feat(server): implement telemetry ingestion API, static history endpoints, and event broadcaster` | REST endpoints (`/api/telemetry/ingest`, `/api/telemetry/history`), live broadcaster |
| **3** | `cbf98b8` | `feat(client): integrate WebSocket client hook with connection state, ping monitoring, and stream buffering` | `websocketClient.ts`, `useWebSocketTelemetry.ts` React hook, latency RTT |
| **4** | `eccb1cf` | `feat(dashboard): connect static dashboard charts, live/static mode switcher, and Week 2 progress docs` | Static charts mode, WS diagnostics modal, protocol docs, and Week 2 report |
| **5** | `e9e58a7` | `feat(dashboard): add static baseline calibration inspector and 5k writes/sec ingestion benchmark` | Calibration delta inspector, 5k writes/sec benchmark runner (`ingestion-benchmark.js`), and test suite |
| **6** | `4fc5dc1` | `fix(week-2): resolve live WebSocket stream propagation, fleet trace colors, baseline profile sync, and audio context handling` | Fixed live WS state bridge, dual-feed arbitration, fleet machine IDs, and audio resume |
| **7** | *(Today)* | `feat(workflow): implement React Flow JSON graph validator, DAG cycle detection, and REST workflow endpoints` | Graph validator (`workflowValidator.ts`), 10-test suite (`npm run test:workflow`), and REST endpoints |
