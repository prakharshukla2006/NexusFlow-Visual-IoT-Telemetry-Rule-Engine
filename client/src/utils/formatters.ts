import { AlertSeverity, MachineStatus, MetricType } from '../types/telemetry';

export function formatMetricValue(value: number, metric: MetricType): string {
  switch (metric) {
    case 'temperature':
      return `${value.toFixed(1)} °C`;
    case 'vibration':
      return `${value.toFixed(2)} mm/s`;
    case 'pressure':
      return `${value.toFixed(1)} bar`;
    case 'rpm':
      return `${Math.round(value).toLocaleString()} RPM`;
    case 'power':
      return `${value.toFixed(1)} kW`;
    default:
      return `${value}`;
  }
}

export function getStatusColorClass(status: MachineStatus): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (status) {
    case 'operational':
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/20',
        dot: 'bg-emerald-400',
      };
    case 'warning':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/20',
        dot: 'bg-amber-400',
      };
    case 'critical':
      return {
        bg: 'bg-rose-500/10',
        text: 'text-rose-400',
        border: 'border-rose-500/20',
        dot: 'bg-rose-400',
      };
    case 'offline':
    default:
      return {
        bg: 'bg-slate-500/10',
        text: 'text-slate-400',
        border: 'border-slate-500/20',
        dot: 'bg-slate-400',
      };
  }
}

export function getSeverityBadge(severity: AlertSeverity): {
  label: string;
  bg: string;
  text: string;
  border: string;
} {
  switch (severity) {
    case 'critical':
      return {
        label: 'CRITICAL',
        bg: 'bg-rose-950/60',
        text: 'text-rose-400',
        border: 'border-rose-600/40',
      };
    case 'warning':
      return {
        label: 'WARNING',
        bg: 'bg-amber-950/60',
        text: 'text-amber-400',
        border: 'border-amber-600/40',
      };
    case 'info':
    default:
      return {
        label: 'INFO',
        bg: 'bg-cyan-950/60',
        text: 'text-cyan-400',
        border: 'border-cyan-600/40',
      };
  }
}

export function formatTimestamp(isoOrEpoch: string | number): string {
  const date = typeof isoOrEpoch === 'number' ? new Date(isoOrEpoch) : new Date(isoOrEpoch);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}
