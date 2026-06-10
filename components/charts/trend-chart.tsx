'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { TrendPoint } from '@/lib/types';

/**
 * Footprint-over-time area chart with a dashed goal line (spec §8). Paired with a
 * visually-hidden data table for screen readers (spec §12).
 */
export function TrendChart({
  data,
  goalKg,
}: {
  data: TrendPoint[];
  goalKg?: number | null;
}) {
  const hasData = data.some((d) => d.co2eKg > 0);

  if (!hasData) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Track activities across a few months to see your trend.
      </p>
    );
  }

  return (
    <div>
      <div className="h-56 w-full" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
          >
            <defs>
              <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="hsl(var(--forest-500))"
                  stopOpacity={0.35}
                />
                <stop
                  offset="100%"
                  stopColor="hsl(var(--forest-500))"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--slate-200))"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              fontSize={12}
              stroke="hsl(var(--slate-500))"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={12}
              width={48}
              stroke="hsl(var(--slate-500))"
            />
            <Tooltip
              formatter={(value: number) => [`${value} kg CO₂e`, 'Footprint']}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid hsl(var(--slate-200))',
                fontSize: 12,
              }}
            />
            {goalKg != null && (
              <ReferenceLine
                y={goalKg}
                stroke="hsl(var(--forest-700))"
                strokeDasharray="6 4"
                label={{
                  value: 'Goal',
                  position: 'right',
                  fontSize: 11,
                  fill: 'hsl(var(--forest-700))',
                }}
              />
            )}
            <Area
              type="monotone"
              dataKey="co2eKg"
              stroke="hsl(var(--forest-700))"
              strokeWidth={2}
              fill="url(#trendFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Screen-reader data table alternative */}
      <table className="sr-only">
        <caption>Monthly footprint trend</caption>
        <thead>
          <tr>
            <th scope="col">Month</th>
            <th scope="col">kg CO₂e</th>
          </tr>
        </thead>
        <tbody>
          {data.map((point) => (
            <tr key={point.month}>
              <th scope="row">{point.month}</th>
              <td>{point.co2eKg}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
