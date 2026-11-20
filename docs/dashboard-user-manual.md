# NexusFlow SCADA Dashboard Operator Manual

> **Module:** Real-Time Dashboard & Alert Integration (Member 4)  
> **Platform Version:** 1.0.0-w1  
> **Status:** Production Standard Operator Guide

---

## 1. Dashboard Overview

The NexusFlow dashboard is an industrial-grade Supervisory Control and Data Acquisition (SCADA) telemetry monitoring interface built for factory control rooms and equipment supervisors.

```
┌────────────────────────────────────────────────────────────────────────┐
│                              TOP NAVBAR                                │
│ [NEXUSFLOW / MONITOR]    [CLOCK]  [5,000 w/s INFLUX]  [WS STATUS] [PS] │
├──────────────┬─────────────────────────────────────────────────────────┤
│   SIDEBAR    │  [FLEET SELECTOR: T-101 | C-204 | H-302 | G-501]        │
│              ├─────────────────────────────────────────────────────────┤
│  ● Dashboard │  SYSTEM HEALTH BANNER (Health Index %, Latency, Alert)  │
│  ○ Canvas    ├─────────────────────────────────────────────────────────┤
│  ○ Influx    │  4x TELEMETRY METRIC CARDS (Temp, Vib, Press, RPM)      │
│  ○ Rules     ├─────────────────────────────────────────────────────────┤
│  ○ Logs      │  RECHARTS TRENDS CHART (Area + MA5 + Brush Zoom Scrub) │
│              ├─────────────────────────────────────────────────────────┤
│              │  STATIC CALIBRATION DELTA (8) │ HEALTH RADAR (4 cols)   │
│              ├───────────────────────────────┴─────────────────────────┤
│              │  FLEET STATUS GRID (7 cols)   │ RECENT ALERTS FEED (5)  │
└──────────────┴─────────────────────────────────────────────────────────┘
```

---

## 2. Telemetry Metric Cards & Alarm States

Each card presents instantaneous telemetry, 5-point moving average smoothing, threshold limits, and mini sparkline vectors:

| Sensor Metric | Nominal Operating Range | Warning Alarm Threshold | Critical Shutdown Limit | Unit |
| :--- | :--- | :--- | :--- | :--- |
| **Bearing Temperature** | 50.0 – 80.0 °C | 80.0 °C (Amber Badge) | 85.0 °C (Rose Badge + Audio) | °C |
| **Shaft Vibration (RMS)** | 0.50 – 3.50 mm/s | 3.50 mm/s (Amber Badge) | 4.80 mm/s (Rose Badge + Audio) | mm/s |
| **Hydraulic Pressure** | 90.0 – 140.0 bar | 140.0 bar (Amber Badge) | 165.0 bar (Rose Emergency) | bar |
| **Rotor Velocity** | 2,800 – 3,400 RPM | 3,400 RPM (Supervisory) | 3,650 RPM (Over-speed trip) | RPM |

---

## 3. Recharts Trends Chart: Zoom Brush & Scrubbing

The primary time-series chart supports deep diagnostic scrubbing:
1. **Interactive Brush Scrubber (`Zoom Brush: ON`):**
   - Drag the bottom cyan handles to zoom into high-frequency anomaly windows (e.g. examining a 10-second thermal excursion on Turbine T-101).
   - Pan horizontally across the sliding buffer to inspect pre-trip trends.
2. **5-Point Moving Average Window (`MA(5): ON`):**
   - Renders a cyan dashed line calculating rolling arithmetic mean $MA = \frac{1}{5} \sum_{i=0}^{4} x_{t-i}$, filtering out transient electronic sensor noise.
3. **Threshold Boundary Lines (`Rules: ON`):**
   - Dashed reference lines automatically render configured Warning (amber) and Critical (rose) limits.
4. **Timeframe Presets:**
   - Quick filters for `1 Min`, `5 Min`, `15 Min`, `1 Hour`, and continuous `Live Stream`.

---

## 4. Multi-Sensor Health Radar

Located on the calibration panel, the **Equipment Health Radar** uses a Recharts `<RadarChart>` polygon to display dynamic equilibrium across 5 normalized mechanical axes:
* **Thermal State** ($T \le 80^\circ\text{C} \rightarrow 100\%$)
* **Vibration Stability** ($V \le 2.2\text{ mm/s} \rightarrow 100\%$)
* **Fluid Pressure** ($P \approx 125\text{ bar} \rightarrow 100\%$)
* **Rotor Kinematics** ($RPM \approx 3000 \rightarrow 100\%$)
* **Power Output** ($P \approx 450\text{ kW} \rightarrow 100\%$)

A circular, symmetrical polygon signifies balanced equipment operation. A distorted, collapsed vertex immediately pinpoints the mechanical subsystem under distress.

---

## 5. Thermal-Mechanical Dual Synchronized View

Switching the layout to **Dual Sync** activates synchronized crosshair scrubbing (`syncId="nexus-telemetry-sync"`):
* Hovering over any timestamp on the Temperature chart instantly aligns the crosshair and displays the corresponding value on the Vibration chart.
* Enables operators to spot thermo-mechanical coupling anomalies (e.g. bearing thermal expansion causing shaft friction and harmonic vibration spikes).

---

## 6. Audit Logging & CSV Export

Click **"Export CSV"** in the chart header at any time to download an audit-compliant, timestamped snapshot:
* Format: `nexusflow-telemetry-[UNIT]-[YYYY-MM-DD].csv`
* Fields: `Timestamp, TimeFormatted, MachineID, Temperature, Vibration, Pressure, RPM, Power, TempAvg, VibAvg, IsAnomaly`
