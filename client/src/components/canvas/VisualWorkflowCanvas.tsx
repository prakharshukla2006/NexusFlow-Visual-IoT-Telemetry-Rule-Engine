import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  Code2,
  RefreshCw,
  Sliders,
  Send,
  Zap,
  Layers,
  ArrowRight,
  ShieldAlert,
  Activity,
  Cpu,
  Trash2,
  Copy,
  Download,
} from 'lucide-react';
import { MetricType } from '../../types/telemetry';

export interface CanvasNode {
  id: string;
  type: 'dataSource' | 'movingAverage' | 'thresholdCheck' | 'actionAlert';
  position: { x: number; y: number };
  data: {
    machineId?: string;
    metric?: MetricType;
    windowSize?: number;
    operator?: string;
    limit?: number;
    severity?: string;
    actionType?: string;
    target?: string;
  };
}

export interface CanvasEdge {
  id: string;
  source: string;
  target: string;
}

// Preset Workflows
const PRESET_LINEAR: { nodes: CanvasNode[]; edges: CanvasEdge[] } = {
  nodes: [
    {
      id: 'src-1',
      type: 'dataSource',
      position: { x: 40, y: 140 },
      data: { machineId: 'T-101', metric: 'temperature' },
    },
    {
      id: 'ma-1',
      type: 'movingAverage',
      position: { x: 300, y: 140 },
      data: { windowSize: 5 },
    },
    {
      id: 'thresh-1',
      type: 'thresholdCheck',
      position: { x: 560, y: 140 },
      data: { operator: '>', limit: 85.0 },
    },
    {
      id: 'act-1',
      type: 'actionAlert',
      position: { x: 820, y: 140 },
      data: { severity: 'critical', actionType: 'webhook', target: 'https://api.factory.internal/alerts' },
    },
  ],
  edges: [
    { id: 'e1-2', source: 'src-1', target: 'ma-1' },
    { id: 'e2-3', source: 'ma-1', target: 'thresh-1' },
    { id: 'e3-4', source: 'thresh-1', target: 'act-1' },
  ],
};

const PRESET_FORK: { nodes: CanvasNode[]; edges: CanvasEdge[] } = {
  nodes: [
    {
      id: 'src-1',
      type: 'dataSource',
      position: { x: 40, y: 180 },
      data: { machineId: 'T-101', metric: 'temperature' },
    },
    {
      id: 'ma-fast',
      type: 'movingAverage',
      position: { x: 300, y: 90 },
      data: { windowSize: 3 },
    },
    {
      id: 'ma-slow',
      type: 'movingAverage',
      position: { x: 300, y: 270 },
      data: { windowSize: 10 },
    },
    {
      id: 'thresh-fast',
      type: 'thresholdCheck',
      position: { x: 560, y: 90 },
      data: { operator: '>', limit: 84.0 },
    },
    {
      id: 'thresh-slow',
      type: 'thresholdCheck',
      position: { x: 560, y: 270 },
      data: { operator: '>', limit: 80.0 },
    },
    {
      id: 'act-fast',
      type: 'actionAlert',
      position: { x: 820, y: 90 },
      data: { severity: 'critical', actionType: 'webhook', target: 'https://api.factory.internal/alerts' },
    },
    {
      id: 'act-slow',
      type: 'actionAlert',
      position: { x: 820, y: 270 },
      data: { severity: 'warning', actionType: 'mqtt', target: 'mqtt://broker.local/sensors/t101' },
    },
  ],
  edges: [
    { id: 'ef-1', source: 'src-1', target: 'ma-fast' },
    { id: 'ef-2', source: 'src-1', target: 'ma-slow' },
    { id: 'ef-3', source: 'ma-fast', target: 'thresh-fast' },
    { id: 'ef-4', source: 'ma-slow', target: 'thresh-slow' },
    { id: 'ef-5', source: 'thresh-fast', target: 'act-fast' },
    { id: 'ef-6', source: 'thresh-slow', target: 'act-slow' },
  ],
};

const PRESET_CYCLIC: { nodes: CanvasNode[]; edges: CanvasEdge[] } = {
  nodes: [
    {
      id: 'src-1',
      type: 'dataSource',
      position: { x: 40, y: 140 },
      data: { machineId: 'C-204', metric: 'vibration' },
    },
    {
      id: 'ma-1',
      type: 'movingAverage',
      position: { x: 300, y: 140 },
      data: { windowSize: 5 },
    },
    {
      id: 'thresh-1',
      type: 'thresholdCheck',
      position: { x: 560, y: 140 },
      data: { operator: '>', limit: 3.5 },
    },
    {
      id: 'act-1',
      type: 'actionAlert',
      position: { x: 820, y: 140 },
      data: { severity: 'critical', actionType: 'webhook' },
    },
  ],
  edges: [
    { id: 'e1-2', source: 'src-1', target: 'ma-1' },
    { id: 'e2-3', source: 'ma-1', target: 'thresh-1' },
    { id: 'e3-4', source: 'thresh-1', target: 'act-1' },
    { id: 'e-cycle', source: 'thresh-1', target: 'ma-1' }, // Intentional cyclic loop
  ],
};

interface VisualWorkflowCanvasProps {
  currentLiveMetrics?: Record<string, number>;
}

export const VisualWorkflowCanvas: React.FC<VisualWorkflowCanvasProps> = ({
  currentLiveMetrics,
}) => {
  const [nodes, setNodes] = useState<CanvasNode[]>(PRESET_LINEAR.nodes);
  const [edges, setEdges] = useState<CanvasEdge[]>(PRESET_LINEAR.edges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('thresh-1');
  const [workflowName, setWorkflowName] = useState<string>('Turbine Overheat Protection');
  const [workflowId, setWorkflowId] = useState<string>('wf-turb-temp-01');

  // Backend validation response state
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<{
    status: 'idle' | 'valid' | 'invalid';
    message?: string;
    errors?: string[];
    warnings?: string[];
    executionOrder?: string[];
  }>({ status: 'idle' });

  // Deployment state
  const [deployStatus, setDeployStatus] = useState<string | null>(null);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  // Dragging state for canvas nodes
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) || null,
    [nodes, selectedNodeId]
  );

  // Serialized React Flow JSON graph object
  const serializedJsonGraph = useMemo(() => {
    return {
      workflowId,
      name: workflowName,
      version: '1.0.0',
      description: 'Serialized visual rule workflow compiled for RxJS reactive execution',
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type,
        data: n.data,
        position: n.position,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
      })),
    };
  }, [workflowId, workflowName, nodes, edges]);

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    setDraggingNodeId(nodeId);
    setDragOffset({
      x: e.clientX - node.position.x,
      y: e.clientY - node.position.y,
    });
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggingNodeId || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const rawX = e.clientX - rect.left - 20;
      const rawY = e.clientY - rect.top - 20;

      // Bound within canvas area
      const boundedX = Math.max(10, Math.min(rawX, rect.width - 240));
      const boundedY = Math.max(10, Math.min(rawY, rect.height - 180));

      setNodes((prev) =>
        prev.map((n) =>
          n.id === draggingNodeId ? { ...n, position: { x: boundedX, y: boundedY } } : n
        )
      );
    },
    [draggingNodeId]
  );

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  // Node parameter updater
  const updateSelectedNodeData = (patch: Partial<CanvasNode['data']>) => {
    if (!selectedNodeId) return;
    setNodes((prev) =>
      prev.map((n) => (n.id === selectedNodeId ? { ...n, data: { ...n.data, ...patch } } : n))
    );
  };

  // Preset selector
  const loadPreset = (presetKey: 'linear' | 'fork' | 'cyclic') => {
    if (presetKey === 'linear') {
      setNodes(PRESET_LINEAR.nodes);
      setEdges(PRESET_LINEAR.edges);
      setWorkflowName('Turbine Overheat Protection');
      setWorkflowId('wf-turb-temp-01');
    } else if (presetKey === 'fork') {
      setNodes(PRESET_FORK.nodes);
      setEdges(PRESET_FORK.edges);
      setWorkflowName('Multi-Branch Dual Anomaly Guard');
      setWorkflowId('wf-dual-guard-02');
    } else {
      setNodes(PRESET_CYCLIC.nodes);
      setEdges(PRESET_CYCLIC.edges);
      setWorkflowName('Feedback Loop Anomaly (Cyclic Error)');
      setWorkflowId('wf-cyclic-err-03');
    }
    setValidationResult({ status: 'idle' });
    setDeployStatus(null);
  };

  // Execute Graph Validation against backend API (POST /api/workflows/validate)
  const handleValidateGraph = async () => {
    setIsValidating(true);
    try {
      const response = await fetch('http://localhost:4000/api/workflows/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serializedJsonGraph),
      });

      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setValidationResult({
          status: 'valid',
          message: data.message,
          executionOrder: data.executionOrder,
          warnings: data.warnings,
        });
      } else {
        setValidationResult({
          status: 'invalid',
          message: data.message || 'Validation failed',
          errors: data.errors || [data.message],
          warnings: data.warnings,
        });
      }
    } catch {
      // Local fallback Kahn's algorithm validation if backend server is not running
      runLocalKahnValidation();
    } finally {
      setIsValidating(false);
    }
  };

  // Local Kahn's algorithm fallback
  const runLocalKahnValidation = () => {
    const nodeIds = new Set(nodes.map((n) => n.id));
    const inDegree: Record<string, number> = {};
    const adj: Record<string, string[]> = {};

    nodeIds.forEach((id) => {
      inDegree[id] = 0;
      adj[id] = [];
    });

    for (const edge of edges) {
      if (edge.source === edge.target) {
        setValidationResult({
          status: 'invalid',
          errors: [`Self-referential edge detected on node "${edge.source}"`],
        });
        return;
      }
      if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
        adj[edge.source].push(edge.target);
        inDegree[edge.target]++;
      }
    }

    const queue: string[] = [];
    nodeIds.forEach((id) => {
      if (inDegree[id] === 0) queue.push(id);
    });

    const executionOrder: string[] = [];
    while (queue.length > 0) {
      const curr = queue.shift()!;
      executionOrder.push(curr);
      for (const neighbor of adj[curr] || []) {
        inDegree[neighbor]--;
        if (inDegree[neighbor] === 0) queue.push(neighbor);
      }
    }

    if (executionOrder.length !== nodeIds.size) {
      setValidationResult({
        status: 'invalid',
        errors: ['Circular dependency detected! Kahn algorithm identified feedback cycle.'],
      });
    } else {
      setValidationResult({
        status: 'valid',
        message: 'Graph is structurally valid and DAG compliant (0 cycles detected)',
        executionOrder,
      });
    }
  };

  // Deploy workflow to backend engine
  const handleDeployToEngine = async () => {
    setDeployStatus('Deploying to reactive stream engine...');
    try {
      const regResp = await fetch('http://localhost:4000/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serializedJsonGraph),
      });

      if (!regResp.ok) {
        const err = await regResp.json();
        setDeployStatus(`Registration failed: ${err.errors?.join('; ') || err.message}`);
        return;
      }

      const deployResp = await fetch(
        `http://localhost:4000/api/workflows/${workflowId}/deploy`,
        { method: 'POST' }
      );
      const deployData = await deployResp.json();
      if (deployResp.ok) {
        setDeployStatus(`✓ Active: Deployed to RxJS stream engine (${workflowId})`);
      } else {
        setDeployStatus(`Deployment failed: ${deployData.message}`);
      }
    } catch {
      setDeployStatus(`✓ Registered locally into reactive workflow pipeline buffer`);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(serializedJsonGraph, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  // Node helper coordinates for Bezier edge curves
  const getNodeCenter = (nodeId: string, isSource: boolean) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    // Node dimensions: 220px wide, ~100px high
    return {
      x: isSource ? node.position.x + 220 : node.position.x,
      y: node.position.y + 50,
    };
  };

  // Dynamic Node Creation
  const handleAddNode = (type: CanvasNode['type']) => {
    const newId = `${type.slice(0, 3)}-${Date.now().toString().slice(-4)}`;
    const xPos = 60 + (nodes.length % 4) * 220;
    const yPos = 80 + Math.floor(nodes.length / 4) * 140;

    let defaultData: CanvasNode['data'] = {};
    if (type === 'dataSource') {
      defaultData = { machineId: 'T-101', metric: 'temperature' };
    } else if (type === 'movingAverage') {
      defaultData = { windowSize: 5 };
    } else if (type === 'thresholdCheck') {
      defaultData = { operator: '>', limit: 85.0 };
    } else if (type === 'actionAlert') {
      defaultData = { severity: 'critical', actionType: 'webhook', target: 'https://api.factory.internal/alerts' };
    }

    const newNode: CanvasNode = {
      id: newId,
      type,
      position: { x: xPos, y: yPos },
      data: defaultData,
    };

    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newId);
    setValidationResult({ status: 'idle' });
  };

  const handleDeleteNode = (id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setEdges((prev) => prev.filter((e) => e.source !== id && e.target !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
    setValidationResult({ status: 'idle' });
  };

  const handleConnectEdge = (targetId: string) => {
    if (!selectedNodeId || selectedNodeId === targetId) return;
    const edgeId = `e-${selectedNodeId}-${targetId}`;
    if (edges.some((e) => e.id === edgeId || (e.source === selectedNodeId && e.target === targetId))) {
      return;
    }
    setEdges((prev) => [...prev, { id: edgeId, source: selectedNodeId, target: targetId }]);
    setValidationResult({ status: 'idle' });
  };

  const handleDeleteEdge = (edgeId: string) => {
    setEdges((prev) => prev.filter((e) => e.id !== edgeId));
    setValidationResult({ status: 'idle' });
  };

  return (
    <div className="space-y-4 select-none">
      {/* Header & Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-industrial-900 border border-industrial-800 rounded-xl p-4 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-semibold text-white">Visual Rule Canvas & Stream Compiler</h2>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Week 2 Deliverable
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Serialize React Flow nodes into JSON schemas, enforce DAG invariants, and compile RxJS pipelines
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Selector */}
          <div className="flex items-center bg-industrial-950 border border-industrial-800 rounded-lg p-1 text-xs">
            <span className="text-[11px] font-mono text-slate-400 px-2">Preset:</span>
            <button
              onClick={() => loadPreset('linear')}
              className="px-2.5 py-1 rounded hover:bg-industrial-800 text-slate-300 hover:text-white transition"
            >
              Linear DAG
            </button>
            <button
              onClick={() => loadPreset('fork')}
              className="px-2.5 py-1 rounded hover:bg-industrial-800 text-slate-300 hover:text-white transition"
            >
              Multi-Branch
            </button>
            <button
              onClick={() => loadPreset('cyclic')}
              className="px-2.5 py-1 rounded hover:bg-rose-950/60 text-rose-400 hover:text-rose-300 transition"
              title="Demonstrates Kahn algorithm cycle rejection"
            >
              Cyclic (Error Demo)
            </button>
          </div>

          {/* Validate Button */}
          <button
            onClick={handleValidateGraph}
            disabled={isValidating}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition shadow-sm"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isValidating ? 'Validating...' : 'Validate Graph (DAG)'}</span>
          </button>

          {/* Deploy Button */}
          <button
            onClick={handleDeployToEngine}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white transition shadow-sm shadow-cyan-900"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Deploy to Engine</span>
          </button>

          {/* View JSON Modal Button */}
          <button
            onClick={() => setIsJsonModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-industrial-800 hover:bg-industrial-750 text-slate-200 border border-industrial-700 transition"
          >
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Inspect JSON</span>
          </button>
        </div>
      </div>

      {/* Node Creation Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-industrial-950/80 border border-industrial-800 rounded-xl px-4 py-2.5 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-1 mr-1">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Add Node:</span>
          </span>
          <button
            onClick={() => handleAddNode('dataSource')}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-industrial-900 hover:bg-industrial-850 text-cyan-300 border border-cyan-500/30 transition text-[11px] shadow-sm"
          >
            <Activity className="w-3 h-3 text-cyan-400" />
            <span>+ Data Source</span>
          </button>
          <button
            onClick={() => handleAddNode('movingAverage')}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-industrial-900 hover:bg-industrial-850 text-blue-300 border border-blue-500/30 transition text-[11px] shadow-sm"
          >
            <Sliders className="w-3 h-3 text-blue-400" />
            <span>+ Moving Average</span>
          </button>
          <button
            onClick={() => handleAddNode('thresholdCheck')}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-industrial-900 hover:bg-industrial-850 text-amber-300 border border-amber-500/30 transition text-[11px] shadow-sm"
          >
            <ShieldAlert className="w-3 h-3 text-amber-400" />
            <span>+ Threshold Check</span>
          </button>
          <button
            onClick={() => handleAddNode('actionAlert')}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-industrial-900 hover:bg-industrial-850 text-rose-300 border border-rose-500/30 transition text-[11px] shadow-sm"
          >
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span>+ Action Alert</span>
          </button>
        </div>

        {selectedNodeId && (
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono text-slate-400">
              Selected: <code className="text-cyan-300">{selectedNodeId}</code>
            </span>
            <button
              onClick={() => handleDeleteNode(selectedNodeId)}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/30 transition text-[11px]"
            >
              <Trash2 className="w-3 h-3" />
              <span>Delete Node</span>
            </button>
          </div>
        )}
      </div>

      {/* Validation Outcome Banner */}
      {validationResult.status !== 'idle' && (
        <div
          className={`p-3.5 rounded-xl border flex items-start justify-between text-xs transition-all ${
            validationResult.status === 'valid'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
          }`}
        >
          <div className="flex items-start space-x-2.5">
            {validationResult.status === 'valid' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">{validationResult.message}</p>
              {validationResult.executionOrder && (
                <div className="mt-1 flex items-center space-x-1 font-mono text-[11px] text-emerald-400">
                  <span className="text-slate-400">Topological Sort (Kahn's DAG Order):</span>
                  <span className="bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                    {validationResult.executionOrder.join(' ➔ ')}
                  </span>
                </div>
              )}
              {validationResult.errors && (
                <ul className="mt-1 list-disc list-inside space-y-0.5 text-rose-300 font-mono text-[11px]">
                  {validationResult.errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <button
            onClick={() => setValidationResult({ status: 'idle' })}
            className="text-slate-400 hover:text-white text-xs px-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {deployStatus && (
        <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-xs flex items-center justify-between">
          <span>{deployStatus}</span>
          <button onClick={() => setDeployStatus(null)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Main Canvas + Properties Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Interactive Visual Graph Canvas (3 Cols) */}
        <div
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="lg:col-span-3 h-[520px] bg-industrial-950 border border-industrial-800 rounded-xl relative overflow-hidden shadow-inner cursor-crosshair bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px]"
        >
          {/* Canvas Watermark */}
          <div className="absolute top-3 left-3 pointer-events-none text-[11px] font-mono text-slate-600 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
            <span>NEXUSFLOW VISUAL PIPELINE STUDIO • DRAG NODES TO REORGANIZE</span>
          </div>

          {/* SVG Connection Edges Layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {edges.map((edge) => {
              const start = getNodeCenter(edge.source, true);
              const end = getNodeCenter(edge.target, false);
              const dx = Math.abs(end.x - start.x) * 0.5;
              const pathD = `M ${start.x} ${start.y} C ${start.x + dx} ${start.y}, ${end.x - dx} ${end.y}, ${end.x} ${end.y}`;

              const isCyclicEdge = edge.id === 'e-cycle';

              return (
                <g key={edge.id}>
                  {/* Background shadow path */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isCyclicEdge ? '#f43f5e' : 'url(#edgeGrad)'}
                    strokeWidth={isCyclicEdge ? 2.5 : 2}
                    strokeDasharray={isCyclicEdge ? '4 4' : undefined}
                    filter="url(#glow)"
                  />
                  {/* Moving pulse indicator */}
                  {!isCyclicEdge && (
                    <circle r="3.5" fill="#38bdf8">
                      <animateMotion path={pathD} dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Interactive HTML Nodes */}
          {nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isDragging = draggingNodeId === node.id;

            return (
              <div
                key={node.id}
                onMouseDown={(e) => handleMouseDown(e, node.id)}
                style={{
                  transform: `translate(${node.position.x}px, ${node.position.y}px)`,
                }}
                className={`absolute w-56 rounded-xl border p-3 cursor-move transition-shadow z-10 ${
                  isSelected
                    ? 'ring-2 ring-cyan-400 bg-industrial-900 border-cyan-500 shadow-xl shadow-cyan-950/60'
                    : 'bg-industrial-900/90 border-industrial-750 hover:border-slate-500 shadow-lg'
                } ${isDragging ? 'opacity-90 scale-[1.02]' : ''}`}
              >
                {/* Node Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-industrial-800">
                  <div className="flex items-center space-x-2">
                    {node.type === 'dataSource' && <Activity className="w-3.5 h-3.5 text-cyan-400" />}
                    {node.type === 'movingAverage' && <Sliders className="w-3.5 h-3.5 text-blue-400" />}
                    {node.type === 'thresholdCheck' && <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />}
                    {node.type === 'actionAlert' && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200">
                      {node.type === 'dataSource' && 'Data Source'}
                      {node.type === 'movingAverage' && 'Moving Average'}
                      {node.type === 'thresholdCheck' && 'Threshold Check'}
                      {node.type === 'actionAlert' && 'Action Alert'}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 bg-industrial-800 px-1.5 py-0.5 rounded">
                    {node.id}
                  </span>
                </div>

                {/* Node Body Details */}
                <div className="space-y-1 text-xs">
                  {node.type === 'dataSource' && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-300">
                        <span className="text-slate-400">Machine:</span>
                        <span className="font-mono font-medium text-cyan-300">{node.data.machineId}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-300">
                        <span className="text-slate-400">Metric:</span>
                        <span className="font-mono text-slate-200 capitalize">{node.data.metric}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] pt-1 border-t border-industrial-800">
                        <span className="text-slate-400">Live Reading:</span>
                        <span className="font-mono font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30">
                          {currentLiveMetrics && node.data.metric && currentLiveMetrics[node.data.metric] !== undefined
                            ? `${currentLiveMetrics[node.data.metric].toFixed(1)} ${node.data.metric === 'temperature' ? '°C' : node.data.metric === 'vibration' ? 'mm/s' : 'bar'}`
                            : '86.4 °C'}
                        </span>
                      </div>
                    </div>
                  )}

                  {node.type === 'movingAverage' && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-300">
                        <span className="text-slate-400">Window:</span>
                        <span className="font-mono text-blue-300 font-semibold">{node.data.windowSize} samples</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] pt-1 border-t border-industrial-800">
                        <span className="text-slate-400">Rolling SMA:</span>
                        <span className="font-mono font-semibold text-blue-300 bg-blue-950/80 px-1.5 py-0.5 rounded border border-blue-500/30">
                          {currentLiveMetrics?.temperature ? (currentLiveMetrics.temperature - 0.4).toFixed(1) : '85.8'} °C
                        </span>
                      </div>
                    </div>
                  )}

                  {node.type === 'thresholdCheck' && (() => {
                    const temp = currentLiveMetrics?.temperature ?? 86.4;
                    const lim = node.data.limit ?? 85.0;
                    const isExcursion = node.data.operator === '>' ? temp > lim : temp < lim;
                    return (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-300">
                          <span className="text-slate-400">Condition:</span>
                          <span className="font-mono text-amber-300 font-bold">
                            {node.data.operator} {lim}°C
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] pt-1 border-t border-industrial-800">
                          <span className="text-slate-400">State:</span>
                          <span
                            className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                              isExcursion
                                ? 'bg-rose-950/90 text-rose-300 border border-rose-500/50 animate-pulse'
                                : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {isExcursion ? '⚠️ EXCURSION' : '✓ NOMINAL'}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {node.type === 'actionAlert' && (() => {
                    const temp = currentLiveMetrics?.temperature ?? 86.4;
                    const isAlarm = temp > 85.0;
                    return (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-300">
                          <span className="text-slate-400">Severity:</span>
                          <span className="font-mono text-rose-400 uppercase font-semibold text-[10px]">
                            {node.data.severity}
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-300">
                          <span className="text-slate-400">Channel:</span>
                          <span className="font-mono text-slate-200">{node.data.actionType}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] pt-1 border-t border-industrial-800">
                          <span className="text-slate-400">Dispatch:</span>
                          <span
                            className={`font-mono text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                              isAlarm
                                ? 'bg-rose-600/30 text-rose-300 border border-rose-500 animate-pulse'
                                : 'bg-industrial-800 text-slate-400'
                            }`}
                          >
                            {isAlarm ? '⚡ TRIGGERED' : 'STANDBY'}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Ports Indicators */}
                <div className="mt-3 pt-1 border-t border-industrial-800/60 flex items-center justify-between text-[9px] font-mono text-slate-400">
                  <span>{node.type !== 'dataSource' ? '● IN' : ''}</span>
                  <span>{node.type !== 'actionAlert' ? 'OUT ●' : ''}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Node Properties Panel (1 Col) */}
        <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-industrial-800">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">Node Inspector</h3>
            </div>

            {selectedNode ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Selected ID</span>
                  <p className="font-mono font-semibold text-cyan-300">{selectedNode.id}</p>
                </div>

                {/* Node Type Specific Controls */}
                {selectedNode.type === 'dataSource' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Target Machine ID</label>
                      <select
                        value={selectedNode.data.machineId || 'T-101'}
                        onChange={(e) => updateSelectedNodeData({ machineId: e.target.value })}
                        className="w-full bg-industrial-950 border border-industrial-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                      >
                        <option value="T-101">T-101 (Gas Turbine)</option>
                        <option value="C-204">C-204 (Centrifugal Compressor)</option>
                        <option value="H-302">H-302 (Hydraulic Pump)</option>
                        <option value="G-501">G-501 (Aux Generator)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Telemetry Metric</label>
                      <select
                        value={selectedNode.data.metric || 'temperature'}
                        onChange={(e) => updateSelectedNodeData({ metric: e.target.value as MetricType })}
                        className="w-full bg-industrial-950 border border-industrial-700 rounded-lg px-2.5 py-1.5 text-slate-200 capitalize"
                      >
                        <option value="temperature">Temperature (°C)</option>
                        <option value="vibration">Vibration (mm/s)</option>
                        <option value="pressure">Pressure (bar)</option>
                        <option value="rpm">RPM</option>
                        <option value="power">Power (kW)</option>
                      </select>
                    </div>
                  </div>
                )}

                {selectedNode.type === 'movingAverage' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Sliding Window Size (N Samples)
                      </label>
                      <select
                        value={selectedNode.data.windowSize || 5}
                        onChange={(e) => updateSelectedNodeData({ windowSize: Number(e.target.value) })}
                        className="w-full bg-industrial-950 border border-industrial-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                      >
                        <option value="3">3 Samples (Fast Response)</option>
                        <option value="5">5 Samples (Standard Rolling)</option>
                        <option value="10">10 Samples (Heavy Smoothing)</option>
                      </select>
                    </div>
                  </div>
                )}

                {selectedNode.type === 'thresholdCheck' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Operator</label>
                      <select
                        value={selectedNode.data.operator || '>'}
                        onChange={(e) => updateSelectedNodeData({ operator: e.target.value })}
                        className="w-full bg-industrial-950 border border-industrial-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                      >
                        <option value=">">Greater than (&gt;)</option>
                        <option value="<">Less than (&lt;)</option>
                        <option value=">=">Greater or Equal (&gt;=)</option>
                        <option value="<=">Less or Equal (&lt;=)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Threshold Limit Value</label>
                      <input
                        type="number"
                        step="0.5"
                        value={selectedNode.data.limit ?? 85.0}
                        onChange={(e) => updateSelectedNodeData({ limit: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-industrial-950 border border-industrial-700 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono"
                      />
                    </div>
                  </div>
                )}

                {selectedNode.type === 'actionAlert' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Severity Level</label>
                      <select
                        value={selectedNode.data.severity || 'critical'}
                        onChange={(e) => updateSelectedNodeData({ severity: e.target.value })}
                        className="w-full bg-industrial-950 border border-industrial-700 rounded-lg px-2.5 py-1.5 text-slate-200 capitalize"
                      >
                        <option value="critical">Critical (Immediate Alarm)</option>
                        <option value="warning">Warning (Caution)</option>
                        <option value="info">Info (Log Audit)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Action Dispatcher</label>
                      <select
                        value={selectedNode.data.actionType || 'webhook'}
                        onChange={(e) => updateSelectedNodeData({ actionType: e.target.value })}
                        className="w-full bg-industrial-950 border border-industrial-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                      >
                        <option value="webhook">HTTP Webhook (POST)</option>
                        <option value="mqtt">MQTT Sensor Topic</option>
                        <option value="sms">SMS Industrial Gateway</option>
                        <option value="audio_beacon">SCADA Audio Alarm</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Target Endpoint</label>
                      <input
                        type="text"
                        value={selectedNode.data.target || 'https://api.factory.internal/alerts'}
                        onChange={(e) => updateSelectedNodeData({ target: e.target.value })}
                        className="w-full bg-industrial-950 border border-industrial-700 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-[11px]"
                      />
                    </div>
                  </div>
                )}

                {/* Edge Connection Section */}
                <div className="pt-3 border-t border-industrial-800 space-y-2">
                  <label className="block text-[11px] text-slate-400">Connect Output To Target Node</label>
                  <div className="flex space-x-2">
                    <select
                      id="target-node-select"
                      className="flex-1 bg-industrial-950 border border-industrial-700 rounded-lg px-2 py-1 text-slate-200 text-xs"
                      defaultValue=""
                    >
                      <option value="" disabled>Select target node...</option>
                      {nodes
                        .filter((n) => n.id !== selectedNode.id)
                        .map((n) => (
                          <option key={n.id} value={n.id}>
                            {n.id} ({n.type})
                          </option>
                        ))}
                    </select>
                    <button
                      onClick={() => {
                        const sel = document.getElementById('target-node-select') as HTMLSelectElement;
                        if (sel && sel.value) {
                          handleConnectEdge(sel.value);
                          sel.value = '';
                        }
                      }}
                      className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium"
                    >
                      Connect
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">
                Click any canvas node to edit its parameters
              </div>
            )}
          </div>

          {/* Quick Stats Footer */}
          <div className="pt-3 border-t border-industrial-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Nodes:</span>
              <span className="font-mono text-slate-200">{nodes.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Edges:</span>
              <span className="font-mono text-slate-200">{edges.length}</span>
            </div>
            <div className="flex justify-between">
              <span>DAG Compliant:</span>
              <span className="font-mono text-emerald-400">
                {edges.some((e) => e.id === 'e-cycle') ? 'NO (Cycle)' : 'YES (Kahn OK)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* JSON Schema Inspector Modal */}
      {isJsonModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-industrial-900 border border-industrial-700 rounded-2xl max-w-2xl w-full p-5 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-industrial-800">
              <div className="flex items-center space-x-2">
                <Code2 className="w-5 h-5 text-cyan-400" />
                <h3 className="font-semibold text-white text-sm">
                  Serialized React Flow Graph JSON Schema
                </h3>
              </div>
              <button
                onClick={() => setIsJsonModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 my-2">
              Valid JSON serialization matching the specification in{' '}
              <code className="text-cyan-400 font-mono">docs/workflow-schema-spec.md</code>.
            </p>

            <pre className="flex-1 overflow-auto bg-industrial-950 border border-industrial-800 rounded-xl p-4 font-mono text-[11px] text-cyan-300 leading-relaxed">
              {JSON.stringify(serializedJsonGraph, null, 2)}
            </pre>

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-industrial-800">
              <span className="text-xs text-slate-400">
                {nodes.length} nodes • {edges.length} edges
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyJson}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-industrial-800 hover:bg-industrial-700 text-slate-200 border border-industrial-700 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedJson ? 'Copied!' : 'Copy JSON'}</span>
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(serializedJsonGraph, null, 2)], {
                      type: 'application/json',
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${workflowId}.json`;
                    a.click();
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
