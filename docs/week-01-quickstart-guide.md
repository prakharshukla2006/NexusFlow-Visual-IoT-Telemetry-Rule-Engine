# NexusFlow Week 1 Quick-Start & Developer Runbook

**Project:** NexusFlow – Visual IoT Telemetry & Rule Engine  
**Team Member:** Member 4 (Prakhar Shukla) – *Real-Time Dashboard & Alert Integration*  
**Milestone Focus:** Create dashboard layout and choose chart library  

---

## 🚀 1. Quick-Start Execution Guide

The application consists of two services that run concurrently in separate terminals:

### 🟢 Terminal 1: Backend WebSocket & Telemetry Service
```powershell
# From project root:
cd server
npm start
```
* **HTTP Port:** `http://localhost:4000`
* **WebSocket Influx:** `ws://localhost:4000/ws/telemetry`
* **Ingestion API:** `POST /api/telemetry/ingest`

### 🔵 Terminal 2: Frontend SCADA Dashboard (Vite + React)
```powershell
# Open a second terminal window/tab from project root:
cd client
npm run dev
```
* **Dashboard URL:** `http://localhost:5173`
* **Technology Stack:** React 18, TypeScript, Tailwind CSS, Recharts

> [!NOTE]
> **Windows PowerShell Navigation Tip:**  
> If your terminal is already inside the `server/` folder (`...\server>`), running `cd client` will fail with `Cannot find path '...\server\client'`. Use `cd ..\client` to step up one directory first, or open a new terminal tab at the project root.

---

## 📊 2. SCADA Recharts Visualization Modes

The dashboard provides three distinct Recharts layout modes selectable from the **Recharts Layout** toolbar:

```
┌────────────────────────────────────────────────────────┐
│             Recharts Layout Toolbar Selector           │
│  [ [■ Focus] ]     [ [◫ Dual Sync] ]    [ [☷ Fleet] ]  │
└────────────────────────────────────────────────────────┘
```

| Mode | Recharts Component | Description & Operational Use |
| :--- | :--- | :--- |
| **Focus** | `<AreaChart>` + `<Brush>` | Single-metric deep dive with linear gradient fills, dynamic threshold reference lines, moving-average overlay, and an interactive timeline brush scrubber for sub-second anomaly zooming. |
| **Dual Sync** | 2x `<AreaChart>` (`syncId`) | Synchronized crosshair scrubbing across disparate sensor domains (Bearing Temperature in °C vs. Shaft Vibration in mm/s RMS). |
| **Fleet** | `<LineChart>` | Multi-unit comparative overlay plotting all 4 monitored production units (`T-101 Turbine`, `C-202 Compressor`, `P-303 Pump`, `G-404 Generator`) on a single unified canvas with real-time fleet average, peak unit tracker, and delta spread ($\Delta = \text{Max} - \text{Min}$). |

---

## 📈 3. Supplementary SCADA Instrumentation Widgets

1. **Operational Band Distribution Histogram (`MetricDistributionHistogram.tsx`):**
   * Uses Recharts `<BarChart>` to segment 30-sample telemetry buffers into 4 operating bins: Optimal Safe ($< 85\%$ nominal), High Nominal, Warning State ($\ge$ warning threshold), and Critical Excursion ($\ge$ critical threshold).
   * Displays mean ($\mu$), sample standard deviation ($\sigma$), and percentage share.
2. **Multi-Sensor Equipment Health Radar (`EquipmentHealthRadar.tsx`):**
   * Visualizes machine balance equilibrium across 5 normalized operational axes (Thermal, Vibration, Pressure, Kinematics, Electrical Load) using Recharts `<RadarChart>`.
3. **Dynamic Threshold Modal & CSV Export:**
   * Allows control room operators to adjust warning and critical setpoints on the fly without page reloads.
   * Exports instantaneous 30-sample telemetry time series directly to standardized CSV for compliance and audit logging.
4. **SCADA Audio Alarm Synthesizer (`client/src/utils/audioAlert.ts`):**
   * Zero-dependency Web Audio API oscillator producing dual-tone audible alert beeps whenever critical thresholds are breached.

---

## 🧪 4. Automated Smoke Test Verification

Execute the automated test suite anytime with:

```powershell
cd client
npm run test:telemetry
```

### Verified Assertions:
```text
=== NexusFlow Telemetry Validation Suite (Week 1 Extended) ===

  ✓ PASS: Test 1: 5-Point Moving Average calculation equals 84°C
  ✓ PASS: Test 2: Noisy signal with 95°C spike smoothed to 80°C
  ✓ PASS: Test 3: 84.9°C evaluates within nominal threshold (< 85°C)
  ✓ PASS: Test 4: 85.1°C evaluates as critical anomaly (> 85°C)
  ✓ PASS: Test 5: Buffer capacity maintained strictly at 30 samples
  ✓ PASS: Test 6: Buffer maintains FIFO eviction (idx 49 at head, idx 20 at tail)
  ✓ PASS: Test 7: Telemetry CSV row formats machine and sensor metrics correctly
  ✓ PASS: Test 8: Industrial metric values conform to physical telemetry domain bounds
  ✓ PASS: Test 9: Fleet comparative overlay synchronizes all 4 plant production units
  ✓ PASS: Test 10: Fleet spread delta correctly computed as 17.6°C (Max - Min)
  ✓ PASS: Test 11: Histogram operational band distribution sums to exactly 100%
  ✓ PASS: Test 12: Threshold detection identifies exactly 2 excursions in jitter signal without false drops

Results: 12 passed, 0 failed.
```
