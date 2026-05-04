import React from 'react';
import { tokens } from '../../styles/tokens';

type DataPoint = { x: number | string; y: number };

interface HistoryChartProps {
  data: DataPoint[];
  height?: number;
  variant?: 'compact' | 'full';
  ariaLabel?: string;
}

export default function HistoryChart({ data, height = 80, variant = 'full', ariaLabel = 'History chart' }: HistoryChartProps) {
  const width = Math.max(1, data.length);
  const ys = data.map((d) => d.y);
  const max = Math.max(...ys, 1);
  const min = Math.min(...ys, 0);
  const range = max - min || 1;

  const points = data
    .map((d, i) => {
      const x = (i / (width - 1 || 1)) * 100;
      const y = 100 - ((d.y - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  // area path (simple polygon)
  const areaPath = `M0,100 ${data
    .map((d, i) => {
      const x = (i / (width - 1 || 1)) * 100;
      const y = 100 - ((d.y - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(' ')} 100,100 Z`;

  const stroke = tokens.chart?.series?.[0] ?? '#F4941A';
  const fill = tokens.chart?.area ?? 'rgba(244,148,26,0.12)';

  return (
    <figure aria-label={ariaLabel} role="img" style={{ width: '100%', height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
        <path d={areaPath} fill={fill} />
        <polyline points={points} fill="none" stroke={stroke} strokeWidth={variant === 'compact' ? 1.5 : 2.5} strokeLinecap="round" strokeLinejoin="round" />
        {/* markers for full variant */}
        {variant === 'full' &&
          data.map((d, i) => {
            const x = (i / (width - 1 || 1)) * 100;
            const y = 100 - ((d.y - min) / range) * 100;
            return <circle key={i} cx={`${x}%`} cy={`${y}%`} r={0.9} fill={stroke} />;
          })}
      </svg>
    </figure>
  );
}
