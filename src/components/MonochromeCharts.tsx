import React, { useState } from 'react';

export function formatKRW(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(amount) + '원';
}

export function formatCompactKRW(amount: number): string {
  if (Math.abs(amount) >= 100000000) {
    return (amount / 100000000).toFixed(1).replace(/\.0$/, '') + '억원';
  }
  if (Math.abs(amount) >= 10000) {
    return (amount / 10000).toFixed(0) + '만원';
  }
  return formatKRW(amount);
}

// -------------------------------------------------------------
// Donut Chart with SVG and Accent Colors
// -------------------------------------------------------------
export interface DonutDataPoint {
  label: string;
  value: number;
  percentage: number;
  id: string;
}

export function MonochromeDonutChart({
  data,
  totalLabel = '총 지출',
  size = 200,
}: {
  data: DonutDataPoint[];
  totalLabel?: string;
  size?: number;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const totalValue = data.reduce((sum, d) => sum + d.value, 0);

  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Harmonious shades with subtle accents
  const shades = [
    '#fb7185', // rose-400
    '#38bdf8', // sky-400
    '#34d399', // emerald-400
    '#facc15', // amber-400
    '#a78bfa', // violet-400
    '#f472b6', // pink-400
    '#e2e8f0', // slate-200
    '#94a3b8', // slate-400
    '#64748b', // slate-500
  ];

  let cumulativeAngle = 0;

  if (totalValue === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-neutral-800 rounded-2xl text-neutral-500 text-xs">
        등록된 지출 내역이 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#1c1917"
            strokeWidth={strokeWidth}
          />

          {/* Segments */}
          {data.map((item, idx) => {
            const fraction = item.value / totalValue;
            const strokeDasharray = `${fraction * circumference} ${circumference}`;
            const strokeDashoffset = -cumulativeAngle * circumference;
            cumulativeAngle += fraction;

            const isHovered = hoveredIdx === idx;
            const strokeColor = shades[idx % shades.length];

            return (
              <circle
                key={item.id}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={strokeColor}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-3">
          <span className="text-[11px] text-neutral-400 font-medium">
            {hoveredIdx !== null ? data[hoveredIdx].label : totalLabel}
          </span>
          <span className="text-base font-bold text-white mt-0.5 font-mono">
            {hoveredIdx !== null ? formatCompactKRW(data[hoveredIdx].value) : formatCompactKRW(totalValue)}
          </span>
          {hoveredIdx !== null && (
            <span className="text-xs font-mono font-bold text-rose-400">
              {data[hoveredIdx].percentage.toFixed(1)}%
            </span>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 w-full space-y-1.5 max-h-52 overflow-y-auto pr-1">
        {data.map((item, idx) => {
          const color = shades[idx % shades.length];
          const isHovered = hoveredIdx === idx;
          return (
            <div
              key={item.id}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl cursor-pointer transition-colors ${
                isHovered ? 'bg-neutral-800 text-white' : 'hover:bg-neutral-900 text-neutral-300'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: color }}
                />
                <span className="truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-2 font-mono shrink-0">
                <span className="text-neutral-200">{formatKRW(item.value)}</span>
                <span className="text-neutral-500 w-11 text-right">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Vertical Bar Chart with Color Accents
// -------------------------------------------------------------
export interface BarDataPoint {
  label: string;
  subLabel?: string;
  value: number;
  secondaryValue?: number;
  highlight?: boolean;
}

export function MonochromeBarChart({
  data,
  height = 180,
  showSecondary = false,
  secondaryLegend = '수입',
  primaryLegend = '지출',
}: {
  data: BarDataPoint[];
  height?: number;
  showSecondary?: boolean;
  secondaryLegend?: string;
  primaryLegend?: string;
}) {
  const [activeTooltip, setActiveTooltip] = useState<BarDataPoint | null>(null);

  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.value, showSecondary && d.secondaryValue ? d.secondaryValue : 0)),
    1000
  );

  return (
    <div className="w-full">
      {/* Legend header if dual series */}
      {showSecondary && (
        <div className="flex items-center justify-end gap-3 text-xs mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <span className="text-neutral-300">{primaryLegend}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-neutral-300">{secondaryLegend}</span>
          </div>
        </div>
      )}

      {/* Bars container */}
      <div
        className="w-full flex items-end justify-between gap-1 sm:gap-2 pt-6 pb-2 border-b border-neutral-800 relative"
        style={{ height }}
      >
        {/* Background grid line */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between opacity-10">
          <div className="border-b border-white w-full" />
          <div className="border-b border-white w-full" />
        </div>

        {data.map((item, idx) => {
          const primaryHeightPercent = Math.max(item.value > 0 ? 4 : 0, (item.value / maxValue) * 100);
          const secondaryHeightPercent = showSecondary && item.secondaryValue
            ? Math.max(item.secondaryValue > 0 ? 4 : 0, (item.secondaryValue / maxValue) * 100)
            : 0;

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
              onMouseEnter={() => setActiveTooltip(item)}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              {/* Tooltip on hover */}
              {activeTooltip === item && (
                <div className="absolute -top-12 z-20 px-2.5 py-1.5 bg-neutral-900 text-white text-[11px] rounded-xl shadow-xl border border-neutral-700 whitespace-nowrap pointer-events-none">
                  <div className="font-bold mb-0.5">{item.label}</div>
                  <div className="text-rose-400">
                    {primaryLegend}: {formatKRW(item.value)}
                  </div>
                  {showSecondary && item.secondaryValue !== undefined && (
                    <div className="text-emerald-400">
                      {secondaryLegend}: {formatKRW(item.secondaryValue)}
                    </div>
                  )}
                </div>
              )}

              {/* Bar elements */}
              <div className="w-full flex items-end justify-center gap-1 h-full">
                {/* Primary Bar (Expense) */}
                <div
                  className={`w-full max-w-[20px] rounded-t-lg transition-all duration-300 ${
                    item.highlight
                      ? 'bg-rose-400 shadow-sm'
                      : 'bg-rose-500/70 hover:bg-rose-400'
                  }`}
                  style={{ height: `${primaryHeightPercent}%` }}
                />

                {/* Secondary Bar if exists (Income) */}
                {showSecondary && (
                  <div
                    className="w-full max-w-[20px] rounded-t-lg bg-emerald-500/70 hover:bg-emerald-400 transition-all duration-300"
                    style={{ height: `${secondaryHeightPercent}%` }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* X Axis Labels */}
      <div className="flex items-center justify-between gap-1 sm:gap-2 mt-2 text-[11px] text-neutral-400 font-mono">
        {data.map((item, idx) => (
          <div
            key={idx}
            className={`flex-1 text-center truncate ${
              item.highlight ? 'text-white font-bold' : ''
            }`}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Horizontal Distribution Bar with Rounded Accents
// -------------------------------------------------------------
export function MonochromeHorizontalBar({
  label,
  value,
  max,
  ratio,
}: {
  label: string;
  value: number;
  max: number;
  ratio?: string;
}) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div className="w-full space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-neutral-200">{label}</span>
        <div className="flex items-center gap-2 font-mono">
          <span className="text-white font-bold">{formatKRW(value)}</span>
          {ratio && <span className="text-neutral-400">({ratio})</span>}
        </div>
      </div>
      <div className="w-full h-2.5 bg-neutral-900 rounded-full border border-neutral-800 overflow-hidden">
        <div
          className="h-full bg-rose-400 rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
