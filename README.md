# NexusFlow: Visual IoT Telemetry & Rule Engine

> A high-throughput, web-based Industrial Internet of Things (IIoT) monitoring platform featuring visual rule engineering, reactive stream processing, and real-time telemetry dashboards.

[![Status: Active Development](https://img.shields.io/badge/Status-Week%201%20Complete-00C49F.svg)]()
[![Frontend: React + Vite](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite%20%2B%20TypeScript-61DAFB.svg)]()
[![Charts: Recharts](https://img.shields.io/badge/Visualizations-Recharts-22c55e.svg)]()
[![Styling: Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38BDF8.svg)]()

---

## 🏭 Project Overview

In traditional SCADA and industrial IoT environments, changing alert criteria or processing pipelines requires modifying backend code, redeploying services, and managing complex streaming infrastructure.

**NexusFlow** eliminates this bottleneck by offering:
1. **Visual Workflow Canvas:** Drag-and-drop rule authoring (data sources, moving averages, threshold filters, actions).
2. **Reactive Stream Processing:** Server-side RxJS compilation of graph configurations to process high-frequency sensor readings.
3. **Time-Series Ingestion:** Scalable ingestion architecture built for high-throughput writes into MongoDB Time Series collections.
4. **Real-Time Dashboards & Alert Integration (Member 4 Focus):** Low-latency telemetry monitoring, customizable time-series charts, threshold alert triggers, and webhook/mock SMS dispatch.

```
                    ┌──────────────────────────────┐
                    │    Industrial IoT Sensors    │
                    │ (Turbines, Pumps, Compress)  │
                    └──────────────┬───────────────┘
                                   │ HTTP / WebSocket Telemetry
                                   ▼
                    ┌──────────────────────────────┐
                    │  Ingestion & Stream Engine   │
                    │      (Express + RxJS)        │
                    └──────┬───────────────┬───────┘
                           │               │
             Stores Influx │               │ Broadcasts via
             & Time Series │               │ WebSocket
                           ▼               ▼
        ┌─────────────────────────┐   ┌──────────────────────────────┐
        │  MongoDB Time Series    │   │  Real-Time Browser Dashboard │
        │  Telemetry Storage      │   │  (React + Recharts + WS)     │
        └─────────────────────────┘   └──────────────┬───────────────┘
                                                     │ Triggers
                                                     ▼
                                      ┌──────────────────────────────┐
                                      │ Webhook / Mock SMS Alerts    │
                                      └──────────────────────────────┘
```

---

## 👤 Member 4: Real-Time Dashboard & Alert Integration

This repository branch represents the work of **Member 4**, responsible for **Real-Time Dashboard & Alert Integration**:

* **Core Mission:** Provide high-clarity visibility into machine telemetry, render reactive time-series visualizations, monitor rule states, and surface alert dispatch history.
* **Assigned Technologies:** WebSockets (`ws` / `Socket.IO`), Recharts, React + TypeScript, Tailwind CSS, Webhook & Mock SMS Alert Dispatchers.

### Weekly Milestone Plan (Member 4)

| Week | Milestone Goal | Status | Report Link |
| :--- | :--- | :--- | :--- |
| **Week 1** | **Create dashboard layout and choose chart library** | **Completed (12 Commits)** | [Week 1 Report](docs/weekly-progress/week-01-report.md) |
| **Week 2** | **Set up WebSocket events and static dashboard charts** | **Completed (4 Commits)** | [Week 2 Report](docs/weekly-progress/week-02-report.md) |
| **Week 3** | Connect live charts and display rule events | Upcoming | - |
| **Week 4** | Complete webhook/mock SMS and end-to-end demo | Upcoming | - |

---

## 📊 Week 1 Deliverables Summary

1. **Dashboard Layout & Component Architecture:**
   - Industrial SCADA-themed dark interface with high-contrast metric displays.
   - Live telemetry status cards with trend indicators, threshold warning badges, and gauge statistics.
   - Multi-metric historical and stream trend viewer with custom tooltips.
   - Fleet equipment overview grid (Turbine T-101, Compressor C-204, Hydraulic Pump H-302, Generator G-501).
   - Real-time rule alerts and notification feed preview.

2. **Chart Library Decision (ADR-001):**
   - Formal technical evaluation comparing **Recharts** vs **Chart.js**.
   - Selected **Recharts** for native React declarative ergonomics, SVG responsiveness, seamless virtual DOM synchronization, and customizable IoT telemetry tooltips.
   - Complete Architecture Decision Record published at [`docs/ADR-001-chart-library-selection.md`](docs/ADR-001-chart-library-selection.md).

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18.0.0 or higher, tested on v22)
- npm or pnpm

### Running the Frontend Dashboard

```bash
# Navigate to the client directory
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

The dashboard will be available at `http://localhost:5173`.

---

## 📁 Repository Structure

```
NexusFlow-Visual-IoT-Telemetry-Rule-Engine/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/       # Dashboard widgets, charts, and metrics
│   │   │   ├── layout/          # Industrial shell, sidebar, and navbar
│   │   │   └── ui/              # Badges, buttons, cards, modal components
│   │   ├── data/                # Telemetry mock generators and datasets
│   │   ├── types/               # TypeScript models (telemetry, alerts, machines)
│   │   ├── utils/               # Time formatters, unit helpers, color mapping
│   │   ├── App.tsx              # Main dashboard view
│   │   └── main.tsx             # React entry point
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── docs/
│   ├── ADR-001-chart-library-selection.md
│   └── weekly-progress/
│       └── week-01-report.md
├── .gitignore
└── README.md
```

---

## 📜 License
Academic & Open Development License for NexusFlow IoT Project.
