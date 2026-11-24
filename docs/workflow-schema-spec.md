# 📐 NexusFlow Workflow Graph Specification & Schema Guide

**Project:** NexusFlow – Visual IoT Telemetry & Rule Engine  
**Milestone:** Week 2 / Mid-Project Review — *Graph Validation & Node Serialization*  
**Status:** Implemented & Verified (10/10 Tests Passing)  
**Last Updated:** November 24, 2026  

---

## 🎯 1. Overview & Mid-Project Review Requirement

The official project brief requires:
> **"Graph Validation:** Demonstrate that complex workflows serialize into valid JSON and can be interpreted by the backend."
> **"Logic Compiler:** Parse and validate a saved React Flow JSON graph and convert supported nodes into RxJS processing steps."

This specification outlines the standardized JSON serialization schema produced by the React Flow frontend canvas and validated by the backend engine (`server/src/services/workflowValidator.ts`).

---

## 📦 2. Standard JSON Workflow Schema

A serialized workflow is represented as a structured JSON object containing metadata, an array of nodes, and directed edges:

```json
{
  "workflowId": "wf-turb-temp-01",
  "name": "Turbine Overheat Protection Rule",
  "version": "1.0.0",
  "nodes": [
    {
      "id": "src-1",
      "type": "dataSource",
      "data": {
        "machineId": "T-101",
        "metric": "temperature"
      },
      "position": { "x": 100, "y": 200 }
    },
    {
      "id": "ma-1",
      "type": "movingAverage",
      "data": {
        "windowSize": 5
      },
      "position": { "x": 350, "y": 200 }
    },
    {
      "id": "thresh-1",
      "type": "thresholdCheck",
      "data": {
        "operator": ">",
        "limit": 85.0
      },
      "position": { "x": 600, "y": 200 }
    },
    {
      "id": "act-1",
      "type": "actionAlert",
      "data": {
        "severity": "critical",
        "actionType": "webhook",
        "destination": "https://api.factory.internal/alerts"
      },
      "position": { "x": 850, "y": 200 }
    }
  ],
  "edges": [
    { "id": "e1-2", "source": "src-1", "target": "ma-1" },
    { "id": "e2-3", "source": "ma-1", target: "thresh-1" },
    { "id": "e3-4", "source": "thresh-1", target: "act-1" }
  ]
}
```

---

## 🧩 3. Supported Node Type Definitions

### 1. `dataSource` (Telemetry Input)
* **Description:** Emits real-time telemetry sensor readings for a designated plant machine.
* **Ports:** `Output: number` (No incoming inputs permitted).
* **Parameters:**
  * `machineId` *(string, required)*: Target machine identifier (e.g. `'T-101'`, `'C-204'`).
  * `metric` *(enum, required)*: One of `'temperature'`, `'vibration'`, `'pressure'`, `'rpm'`, `'power'`.

### 2. `movingAverage` (Mathematical Smoothing)
* **Description:** Computes a rolling mathematical average over a sliding window of sensor samples.
* **Ports:** `Input: number`, `Output: number`.
* **Parameters:**
  * `windowSize` *(integer, required)*: Number of samples in sliding window ($1 \le \text{windowSize} \le 100$). Default: `5`.

### 3. `thresholdCheck` (Boolean Rule Condition)
* **Description:** Compares continuous sensor values against a setpoint threshold.
* **Ports:** `Input: number`, `Output: boolean`.
* **Parameters:**
  * `operator` *(enum, required)*: One of `'>'`, `'>='`, `'<'`, `'<='`, `'=='`, `'!='`.
  * `limit` *(number, required)*: Numeric threshold boundary value (e.g. `85.0`).

### 4. `actionAlert` (Notification / Webhook Dispatcher)
* **Description:** Triggers an alarm notification or outbound webhook when the input condition evaluates to `true`.
* **Ports:** `Input: boolean` (No outgoing outputs permitted).
* **Parameters:**
  * `severity` *(enum, required)*: One of `'info'`, `'warning'`, `'critical'`.
  * `actionType` *(enum, required)*: One of `'webhook'`, `'mock_sms'`, `'browser_push'`.
  * `destination` *(string, optional)*: Webhook URL or SMS phone number.

---

## 🛡️ 4. Graph Validation Constraints & DAG Invariant

The backend validator (`workflowValidator.ts`) enforces strict structural integrity:

1. **DAG Enforcement (Kahn's Algorithm):**  
   Circular dependency loops (e.g. $A \rightarrow B \rightarrow C \rightarrow A$) are mathematically detected and rejected. The pipeline must be an acyclic graph to prevent infinite stream recursion.
2. **Self-Loop Rejection:**  
   Edges where `source === target` are strictly prohibited.
3. **Semantic Port Integrity:**  
   `dataSource` nodes cannot receive incoming edges. `actionAlert` nodes cannot have outgoing edges.
4. **Parameter Bounds Checking:**  
   Window sizes must be positive integers; threshold limits must be finite numbers; operator strings must match supported mathematical symbols.

---

## 🌐 5. Backend REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/workflows/validate` | Validates a workflow JSON without saving; returns `{ valid, errors, warnings, executionOrder }`. |
| `POST` | `/api/workflows` | Validates and registers an active workflow in the backend registry. |
| `GET` | `/api/workflows` | Lists all registered workflows and their node counts. |
| `GET` | `/api/workflows/:id` | Returns the full serialized JSON graph for a workflow. |

---

## 🧪 6. Automated Test Verification Matrix

Execute anytime with: `npm run test:workflow` (in `server/`):

| Test # | Test Scope | Verified Invariant | Status |
| :---: | :--- | :--- | :---: |
| **Test 1** | Standard Linear Pipeline | Validates 4-node flow (Source $\rightarrow$ MA $\rightarrow$ Threshold $\rightarrow$ Alert) | ✅ PASS |
| **Test 2** | Topological Pipeline Order | Generates exact execution sequence `['n1', 'n2', 'n3', 'n4']` | ✅ PASS |
| **Test 3** | Multi-Branch Fork | Validates single source splitting into 2 independent threshold alert chains | ✅ PASS |
| **Test 4** | Cycle Detection | Kahn's algorithm catches and rejects circular loop dependencies | ✅ PASS |
| **Test 5** | Self-Loop Invariant | Rejects self-referential edges ($n_1 \rightarrow n_1$) | ✅ PASS |
| **Test 6** | Parameter Constraints | Rejects missing `machineId` and negative `windowSize` | ✅ PASS |
| **Test 7** | Operator Verification | Rejects unsupported comparison operators (e.g. `~=`) | ✅ PASS |
| **Test 8** | Semantic Port Direction | Blocks inverted connections (e.g. Action outputting to Source) | ✅ PASS |
| **Test 9** | Disconnected Node Warning | Flags floating/unconnected nodes with operator warnings | ✅ PASS |
| **Test 10** | Complex 6-Node DAG | Validates multi-sensor dual-stream plant-wide safety rule | ✅ PASS |
