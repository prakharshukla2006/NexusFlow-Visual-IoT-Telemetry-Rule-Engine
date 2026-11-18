# NexusFlow WebSocket Telemetry Protocol Specification

> **Milestone:** Week 2 (Member 4: Real-Time Dashboard & Alert Integration)  
> **Status:** Active Standard  
> **Endpoint:** `ws://localhost:4000/ws/telemetry`  
> **Transport:** WebSocket (RFC 6455) with JSON Framing

---

## 1. Architecture Overview

NexusFlow implements a low-latency, bidirectional WebSocket architecture between the Node.js/Express backend engine and the React SCADA frontend dashboard.

```
┌─────────────────────────────────┐                 ┌──────────────────────────────────┐
│      Node.js Express Server     │                 │      React SCADA Dashboard       │
│                                 │                 │                                  │
│  ┌───────────────────────────┐  │                 │  ┌────────────────────────────┐  │
│  │   NexusWebSocketServer    │  │   telemetry:data│  │    useWebSocketTelemetry   │  │
│  │     (ws gateway hub)      │──┼────────────────┼─>│     (stream sliding buff)  │  │
│  └─────────────┬─────────────┘  │   rule:alert    │  └─────────────┬──────────────┘  │
│                │                │──┼──────────────┼─>│             │                 │
│                │                │   client:ping   │                ▼                 │
│  ┌─────────────▼─────────────┐  │<─┼──────────────┼──│  ┌─────────────────────────┐  │
│  │ Ingestion & Static Store  │  │   server:pong   │  │  Recharts Telemetry Trends │  │
│  │ (30-pt baseline per unit) │  │──┼──────────────┼─>│  (Live Feed / Static Mode) │  │
│  └───────────────────────────┘  │                 │  └─────────────────────────┘  │
└─────────────────────────────────┘                 └──────────────────────────────────┘
```

---

## 2. Standard Message Envelope

All frames exchanged over `/ws/telemetry` use a uniform JSON wrapper:

```json
{
  "event": "EVENT_NAME",
  "payload": { ... },
  "timestamp": 1731900000000
}
```

---

## 3. Client-to-Server Events

### 3.1 `telemetry:subscribe`
Subscribes the client session to a specific machine unit's telemetry channel.

```json
{
  "event": "telemetry:subscribe",
  "payload": {
    "machineId": "T-101",
    "metrics": ["temperature", "vibration", "pressure", "rpm"]
  },
  "timestamp": 1731900001000
}
```

### 3.2 `client:ping`
Heartbeat signal transmitted by the client every 5 seconds to calculate round-trip network latency (RTT).

```json
{
  "event": "client:ping",
  "payload": {
    "clientTime": 1731900005000
  },
  "timestamp": 1731900005000
}
```

---

## 4. Server-to-Client Events

### 4.1 `connection:established`
Handshake payload dispatched immediately when a client establishes a socket connection.

```json
{
  "event": "connection:established",
  "payload": {
    "clientId": "client_1_km3d9a",
    "serverVersion": "1.0.0-w2",
    "availableMachines": ["T-101", "C-204", "H-302", "G-501"],
    "streamingRateHz": 1,
    "message": "Connected to NexusFlow Industrial Telemetry WebSocket Gateway"
  },
  "timestamp": 1731900000050
}
```

### 4.2 `telemetry:data`
Instantaneous sensor frame broadcasted at regular influx intervals (1–2 Hz) or when an ingestion event occurs at `POST /api/telemetry/ingest`.

```json
{
  "event": "telemetry:data",
  "payload": {
    "machineId": "T-101",
    "timestamp": 1731900002000,
    "timeFormatted": "14:25:02",
    "temperature": 86.4,
    "vibration": 2.85,
    "pressure": 124.5,
    "rpm": 3240,
    "power": 450.2,
    "temperatureAvg": 84.8,
    "vibrationAvg": 2.75,
    "isAnomaly": true,
    "anomalyReason": "Temperature threshold exceeded (>85.0°C)"
  },
  "timestamp": 1731900002002
}
```

### 4.3 `rule:alert`
Dispatched when configured rule logic (e.g. `RULE-HIGH-TEMP`) evaluates as true over the sensor sliding window.

```json
{
  "event": "rule:alert",
  "payload": {
    "id": "ALT-4891",
    "ruleId": "RULE-HIGH-TEMP",
    "ruleName": "Turbine Bearing High Temp Alert",
    "machineId": "T-101",
    "machineName": "Industrial Gas Turbine 01",
    "metric": "temperature",
    "severity": "critical",
    "threshold": 85.0,
    "actualValue": 86.8,
    "timestamp": "Just now",
    "actionStatus": "pending",
    "actionDestination": "Webhook Queue / Mock SMS"
  },
  "timestamp": 1731900005010
}
```

### 4.4 `server:pong`
Heartbeat response returning client timestamp and server reception timestamp for latency computation.

```json
{
  "event": "server:pong",
  "payload": {
    "clientTime": 1731900005000,
    "serverTime": 1731900005008,
    "latencyMs": 8
  },
  "timestamp": 1731900005008
}
```

---

## 5. Live Feed vs Static Baseline Mode

To satisfy the **Week 2 Milestone** (*"Set up WebSocket events and static dashboard charts"*), the dashboard provides two selectable data modes:

1. **`live_websocket`**: Subscribes to live WebSocket broadcast events and continuously pushes fresh readings into a rolling 30-sample sliding buffer.
2. **`static_baseline`**: Disables streaming re-renders and presents a fixed 30-point baseline curve retrieved from `/api/telemetry/history/:machineId`, enabling deterministic calibration, audit inspection, and offline verification.

---

## 6. Fault Tolerance & Reconnection

The client implements exponential backoff reconnection:
* Initial retry: 1,000 ms
* Backoff factor: 1.5x (up to 10,000 ms ceiling)
* Max attempts: 10
* Graceful fallback: If connection fails or server is offline, the dashboard automatically falls back to local static simulation without throwing uncaught errors or breaking the UI.
