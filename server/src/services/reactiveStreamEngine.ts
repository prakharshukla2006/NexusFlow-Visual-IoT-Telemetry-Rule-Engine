/**
 * NexusFlow Reactive Stream Pipeline Engine
 * 
 * Implements reactive stream primitives (Observable, Subject, pipe, bufferCount, map, filter, tap)
 * for dynamic visual workflow execution, converting validated JSON DAG graphs into
 * high-performance streaming rule pipelines.
 */

import { WorkflowGraph, validateWorkflowGraph } from './workflowValidator.js';

export interface Subscription {
  unsubscribe: () => void;
  closed: boolean;
}

export type Observer<T> = {
  next: (value: T) => void;
  error?: (err: any) => void;
  complete?: () => void;
};

export type OperatorFunction<T, R> = (source: Observable<T>) => Observable<R>;

export class Observable<T> {
  constructor(
    private _subscribe: (observer: Observer<T>) => Subscription | void
  ) {}

  subscribe(observerOrNext: Observer<T> | ((value: T) => void)): Subscription {
    const observer: Observer<T> =
      typeof observerOrNext === 'function'
        ? { next: observerOrNext }
        : observerOrNext;

    let isClosed = false;
    const sub: Subscription = {
      unsubscribe: () => {
        isClosed = true;
        if (cleanup && typeof cleanup.unsubscribe === 'function') {
          cleanup.unsubscribe();
        }
      },
      get closed() {
        return isClosed;
      },
    };

    const safeObserver: Observer<T> = {
      next: (val: T) => {
        if (!isClosed && observer.next) {
          try {
            observer.next(val);
          } catch (err) {
            if (observer.error) observer.error(err);
          }
        }
      },
      error: (err: any) => {
        if (!isClosed) {
          isClosed = true;
          if (observer.error) observer.error(err);
        }
      },
      complete: () => {
        if (!isClosed) {
          isClosed = true;
          if (observer.complete) observer.complete();
        }
      },
    };

    const cleanup = this._subscribe(safeObserver);
    return sub;
  }

  pipe(): Observable<T>;
  pipe<A>(op1: OperatorFunction<T, A>): Observable<A>;
  pipe<A, B>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>): Observable<B>;
  pipe<A, B, C>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>
  ): Observable<C>;
  pipe<A, B, C, D>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>
  ): Observable<D>;
  pipe<A, B, C, D, E>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>
  ): Observable<E>;
  pipe<A, B, C, D, E, F>(
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>
  ): Observable<F>;
  pipe(...operators: OperatorFunction<any, any>[]): Observable<any>;
  pipe(...operators: OperatorFunction<any, any>[]): Observable<any> {
    return operators.reduce((prev, op) => op(prev), this as Observable<any>);
  }
}

export class Subject<T> extends Observable<T> {
  private observers: Set<Observer<T>> = new Set();

  constructor() {
    super((observer) => {
      this.observers.add(observer);
      return {
        unsubscribe: () => {
          this.observers.delete(observer);
        },
        closed: false,
      };
    });
  }

  next(value: T): void {
    const list = Array.from(this.observers);
    for (const observer of list) {
      observer.next(value);
    }
  }

  error(err: any): void {
    const list = Array.from(this.observers);
    for (const observer of list) {
      if (observer.error) observer.error(err);
    }
  }

  complete(): void {
    const list = Array.from(this.observers);
    for (const observer of list) {
      if (observer.complete) observer.complete();
    }
    this.observers.clear();
  }
}

// Operators
export function map<T, R>(project: (value: T, index: number) => R): OperatorFunction<T, R> {
  return (source: Observable<T>) =>
    new Observable<R>((observer) => {
      let index = 0;
      return source.subscribe({
        next: (value: T) => {
          try {
            const result = project(value, index++);
            observer.next(result);
          } catch (err) {
            if (observer.error) observer.error(err);
          }
        },
        error: (err) => observer.error && observer.error(err),
        complete: () => observer.complete && observer.complete(),
      });
    });
}

export function filter<T>(predicate: (value: T, index: number) => boolean): OperatorFunction<T, T> {
  return (source: Observable<T>) =>
    new Observable<T>((observer) => {
      let index = 0;
      return source.subscribe({
        next: (value: T) => {
          try {
            if (predicate(value, index++)) {
              observer.next(value);
            }
          } catch (err) {
            if (observer.error) observer.error(err);
          }
        },
        error: (err) => observer.error && observer.error(err),
        complete: () => observer.complete && observer.complete(),
      });
    });
}

export function bufferCount<T>(bufferSize: number, startBufferEvery: number = 1): OperatorFunction<T, T[]> {
  return (source: Observable<T>) =>
    new Observable<T[]>((observer) => {
      const ringBuffer: T[] = [];
      let count = 0;

      return source.subscribe({
        next: (value: T) => {
          ringBuffer.push(value);
          count++;

          if (ringBuffer.length > bufferSize) {
            ringBuffer.shift();
          }

          if (ringBuffer.length >= bufferSize && (count % startBufferEvery === 0)) {
            observer.next([...ringBuffer]);
          }
        },
        error: (err) => observer.error && observer.error(err),
        complete: () => observer.complete && observer.complete(),
      });
    });
}

export function tap<T>(observerOrNext: ((value: T) => void) | Partial<Observer<T>>): OperatorFunction<T, T> {
  const nextFn = typeof observerOrNext === 'function' ? observerOrNext : observerOrNext.next;
  return (source: Observable<T>) =>
    new Observable<T>((observer) => {
      return source.subscribe({
        next: (value: T) => {
          if (nextFn) {
            try {
              nextFn(value);
            } catch (err) {
              if (observer.error) observer.error(err);
              return;
            }
          }
          observer.next(value);
        },
        error: (err) => observer.error && observer.error(err),
        complete: () => observer.complete && observer.complete(),
      });
    });
}

// Pipeline Types & Runtime Engine
export interface TelemetryStreamEvent {
  machineId: string;
  timestamp: number;
  metrics: Record<string, number>;
}

export interface RuleAlertDispatched {
  workflowId: string;
  workflowName: string;
  machineId: string;
  metric: string;
  triggerValue: number;
  thresholdLimit: number;
  operator: string;
  severity: string;
  actionType: string;
  target?: string;
  timestamp: number;
}

export interface CompiledPipeline {
  workflowId: string;
  workflowName: string;
  machineId: string;
  metric: string;
  sourceNodeId: string;
  windowSize: number;
  operator: string;
  limit: number;
  severity: string;
  actionType: string;
  target?: string;
  feed: (event: TelemetryStreamEvent) => void;
  unsubscribe: () => void;
}

/**
 * Compiles a validated WorkflowGraph into an executable reactive stream pipeline
 */
export function compileGraphToPipeline(
  graph: WorkflowGraph,
  onAlert: (alert: RuleAlertDispatched) => void
): { success: boolean; pipeline?: CompiledPipeline; error?: string } {
  const validation = validateWorkflowGraph(graph);
  if (!validation.valid) {
    return {
      success: false,
      error: `Cannot compile invalid workflow: ${validation.errors.join('; ')}`,
    };
  }

  // Extract nodes by type
  const sourceNode = graph.nodes.find((n) => n.type === 'dataSource');
  const avgNode = graph.nodes.find((n) => n.type === 'movingAverage');
  const threshNode = graph.nodes.find((n) => n.type === 'thresholdCheck');
  const alertNode = graph.nodes.find((n) => n.type === 'actionAlert');

  if (!sourceNode || !threshNode || !alertNode) {
    return {
      success: false,
      error: 'Workflow requires at least dataSource, thresholdCheck, and actionAlert nodes',
    };
  }

  const machineId = sourceNode.data.machineId || 'T-101';
  const metric = sourceNode.data.metric || 'temperature';
  const windowSize = avgNode ? (avgNode.data.windowSize || 5) : 1;
  const operator = threshNode.data.operator || '>';
  const limit = threshNode.data.limit ?? 85.0;
  const severity = alertNode.data.severity || 'critical';
  const actionType = alertNode.data.actionType || 'webhook';
  const target = alertNode.data.target;

  // Create stream subject
  const input$ = new Subject<TelemetryStreamEvent>();

  // Helper comparator
  const evaluateCondition = (val: number, op: string, lim: number): boolean => {
    switch (op) {
      case '>': return val > lim;
      case '<': return val < lim;
      case '>=': return val >= lim;
      case '<=': return val <= lim;
      case '==': return Math.abs(val - lim) < 0.0001;
      case '!=': return Math.abs(val - lim) >= 0.0001;
      default: return false;
    }
  };

  let subscription: Subscription;

  if (avgNode && windowSize > 1) {
    // Pipeline with sliding window moving average
    subscription = input$
      .pipe(
        // Filter by target machine and metric existence
        filter((ev: TelemetryStreamEvent) => ev.machineId === machineId && typeof ev.metrics[metric] === 'number'),
        // Extract raw numeric metric
        map((ev: TelemetryStreamEvent) => ev.metrics[metric]),
        // Sliding window of windowSize
        bufferCount<number>(windowSize, 1),
        // Calculate mathematical mean
        map((window: number[]) => {
          const sum = window.reduce((acc: number, curr: number) => acc + curr, 0);
          return Math.round((sum / window.length) * 100) / 100;
        }),
        // Filter by threshold condition
        filter((computedAvg: number) => evaluateCondition(computedAvg, operator, limit)),
        // Emit alert
        tap((triggerVal: number) => {
          const alertPayload: RuleAlertDispatched = {
            workflowId: graph.workflowId,
            workflowName: graph.name,
            machineId,
            metric,
            triggerValue: triggerVal,
            thresholdLimit: limit,
            operator,
            severity,
            actionType,
            target,
            timestamp: Date.now(),
          };
          onAlert(alertPayload);
        })
      )
      .subscribe(() => {});
  } else {
    // Direct point evaluation pipeline
    subscription = input$
      .pipe(
        filter((ev: TelemetryStreamEvent) => ev.machineId === machineId && typeof ev.metrics[metric] === 'number'),
        map((ev: TelemetryStreamEvent) => ev.metrics[metric]),
        filter((val: number) => evaluateCondition(val, operator, limit)),
        tap((triggerVal: number) => {
          const alertPayload: RuleAlertDispatched = {
            workflowId: graph.workflowId,
            workflowName: graph.name,
            machineId,
            metric,
            triggerValue: triggerVal,
            thresholdLimit: limit,
            operator,
            severity,
            actionType,
            target,
            timestamp: Date.now(),
          };
          onAlert(alertPayload);
        })
      )
      .subscribe(() => {});
  }

  const pipeline: CompiledPipeline = {
    workflowId: graph.workflowId,
    workflowName: graph.name,
    machineId,
    metric,
    sourceNodeId: sourceNode.id,
    windowSize,
    operator,
    limit,
    severity,
    actionType,
    target,
    feed: (event: TelemetryStreamEvent) => input$.next(event),
    unsubscribe: () => subscription.unsubscribe(),
  };

  return { success: true, pipeline };
}

/**
 * Global Active Workflow Registry
 */
export class WorkflowExecutionRegistry {
  private static instance: WorkflowExecutionRegistry;
  private activePipelines: Map<string, CompiledPipeline> = new Map();
  private alertHistory: RuleAlertDispatched[] = [];

  private constructor() {}

  static getInstance(): WorkflowExecutionRegistry {
    if (!WorkflowExecutionRegistry.instance) {
      WorkflowExecutionRegistry.instance = new WorkflowExecutionRegistry();
    }
    return WorkflowExecutionRegistry.instance;
  }

  registerWorkflow(graph: WorkflowGraph): { success: boolean; error?: string } {
    if (this.activePipelines.has(graph.workflowId)) {
      this.unregisterWorkflow(graph.workflowId);
    }

    const res = compileGraphToPipeline(graph, (alert) => {
      this.alertHistory.unshift(alert);
      if (this.alertHistory.length > 50) this.alertHistory.pop();
    });

    if (!res.success || !res.pipeline) {
      return { success: false, error: res.error };
    }

    this.activePipelines.set(graph.workflowId, res.pipeline);
    return { success: true };
  }

  unregisterWorkflow(workflowId: string): boolean {
    const existing = this.activePipelines.get(workflowId);
    if (existing) {
      existing.unsubscribe();
      return this.activePipelines.delete(workflowId);
    }
    return false;
  }

  feedTelemetry(event: TelemetryStreamEvent): void {
    for (const pipeline of this.activePipelines.values()) {
      pipeline.feed(event);
    }
  }

  getActiveWorkflows(): Array<{
    workflowId: string;
    workflowName: string;
    machineId: string;
    metric: string;
    windowSize: number;
    threshold: string;
    severity: string;
  }> {
    return Array.from(this.activePipelines.values()).map((p) => ({
      workflowId: p.workflowId,
      workflowName: p.workflowName,
      machineId: p.machineId,
      metric: p.metric,
      windowSize: p.windowSize,
      threshold: `${p.operator} ${p.limit}`,
      severity: p.severity,
    }));
  }

  getAlerts(): RuleAlertDispatched[] {
    return [...this.alertHistory];
  }

  clear(): void {
    for (const p of this.activePipelines.values()) {
      p.unsubscribe();
    }
    this.activePipelines.clear();
    this.alertHistory = [];
  }
}
