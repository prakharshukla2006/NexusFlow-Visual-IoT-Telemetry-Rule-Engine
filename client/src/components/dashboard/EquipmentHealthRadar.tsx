import React from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';
import { MachineDevice } from '../../types/telemetry';
import { ShieldCheck, Compass, Activity } from 'lucide-react';

interface EquipmentHealthRadarProps {
  machine: MachineDevice;
}

export const EquipmentHealthRadar: React.FC<EquipmentHealthRadarProps> = ({ machine }) => {
  // Normalize live metrics into a 0-100% balance polygon
  // Safe / ideal values are closer to 100%, stressed values drop towards 0%
  const tempHealth = Math.max(10, Math.min(100, Math.round(100 - ((machine.metrics.temperature - 50) / 40) * 80)));
  const vibHealth = Math.max(10, Math.min(100, Math.round(100 - (machine.metrics.vibration / 4.8) * 80)));
  const pressHealth = Math.max(10, Math.min(100, Math.round(95 - Math.abs(machine.metrics.pressure - 125) * 1.2)));
  const rpmHealth = Math.max(10, Math.min(100, Math.round(100 - Math.abs(machine.metrics.rpm - 3000) * 0.05)));
  const powerHealth = Math.max(10, Math.min(100, Math.round((machine.metrics.power / 500) * 100)));

  const radarData = [
    { subject: 'Thermal State', score: tempHealth, fullMark: 100, raw: `${machine.metrics.temperature.toFixed(1)}°C` },
    { subject: 'Vib Stability', score: vibHealth, fullMark: 100, raw: `${machine.metrics.vibration.toFixed(2)} mm/s` },
    { subject: 'Fluid Pressure', score: pressHealth, fullMark: 100, raw: `${machine.metrics.pressure.toFixed(1)} bar` },
    { subject: 'Rotor Kinematics', score: rpmHealth, fullMark: 100, raw: `${machine.metrics.rpm} RPM` },
    { subject: 'Power Output', score: powerHealth, fullMark: 100, raw: `${machine.metrics.power.toFixed(1)} kW` },
  ];

  const overallBalance = Math.round(
    radarData.reduce((acc, curr) => acc + curr.score, 0) / radarData.length
  );

  return (
    <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-5 shadow-xl space-y-3 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-industrial-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <Compass className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white tracking-wide">
            Multi-Sensor Health Radar
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            Recharts Radar
          </span>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400">Equilibrium Index:</span>
          <span className="text-cyan-300 font-bold">{overallBalance}%</span>
        </div>
      </div>

      {/* Recharts Radar Container */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
            <PolarGrid stroke="#1e2f4d" strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="subject"
              stroke="#94a3b8"
              fontSize={10}
              tickLine={false}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              stroke="#475569"
              fontSize={9}
              tick={false}
              axisLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-industrial-950 border border-industrial-700 p-2.5 rounded shadow-xl text-xs space-y-1">
                      <div className="text-cyan-400 font-bold">{data.subject}</div>
                      <div className="text-white">Health Score: {data.score}%</div>
                      <div className="text-slate-400 text-[10px]">Current Reading: {data.raw}</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Radar
              name="Health Score"
              dataKey="score"
              stroke="#00f0ff"
              fill="#00f0ff"
              fillOpacity={0.25}
              isAnimationActive={false}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-industrial-800/80 pt-2">
        <span>Unit: {machine.name} ({machine.id})</span>
        <span className="text-emerald-400">Dynamic Multi-Axis Balance</span>
      </div>
    </div>
  );
};
