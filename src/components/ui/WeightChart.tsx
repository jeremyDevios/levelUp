import React from 'react';
import { tokens } from '../../styles/tokens';

interface WeightPoint {
  x: string | number;
  y: number;
}

interface WeightChartProps {
  data: WeightPoint[];
  height?: number;
  colors?: string[];
  ariaLabel?: string;
}

export default function WeightChart({ data, height = 48, colors, ariaLabel = 'Weight chart' }: WeightChartProps) {
  const stroke = colors?.[0] ?? tokens.chart?.series?.[0] ?? '#F4941A';
  const fill = tokens.chart?.area ?? 'rgba(244,148,26,0.12)';

  const ys = data.map((d) => d.y);
  const max = Math.max(...ys, 1);
  const min = Math.min(...ys, 0);
  const range = max - min || 1;
  const width = Math.max(1, data.length);

  const points = data
    .map((d, i) => {
      const x = (i / (width - 1 || 1)) * 100;
      const y = 100 - ((d.y - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  const areaPath = `M0,100 ${data
    .map((d, i) => {
      const x = (i / (width - 1 || 1)) * 100;
      const y = 100 - ((d.y - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(' ')} 100,100 Z`;

  return (
    <figure aria-label={ariaLabel} role="img" style={{ width: '100%', height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
        <path d={areaPath} fill={fill} />
        <polyline points={points} fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => {
          const x = (i / (width - 1 || 1)) * 100;
          const y = 100 - ((d.y - min) / range) * 100;
          return <circle key={i} cx={`${x}%`} cy={`${y}%`} r={1.2} fill={stroke} />;
        })}
      </svg>
    </figure>
  );
}
