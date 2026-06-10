'use client';

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

import type { CategoryKey } from '@/lib/types';

export interface DonutSlice {
  category: CategoryKey;
  label: string;
  co2eKg: number;
  colorVar: string;
}

/**
 * Category breakdown donut (spec §8). Includes a visually-hidden data table so
 * the data is never locked in color/visuals alone (spec §12).
 */
export function CategoryDonut({ data }: { data: DonutSlice[] }) {
  const total = data.reduce((sum, d) => sum + d.co2eKg, 0);

  if (total <= 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No emissions logged this month yet.
      </p>
    );
  }

  return (
    <div>
      <div className="h-56 w-full" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="co2eKg"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={88}
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((slice) => (
                <Cell key={slice.category} fill={slice.colorVar} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend (visible) */}
      <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        {data.map((slice) => (
          <li key={slice.category} className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 shrink-0 rounded-sm"
              style={{ backgroundColor: slice.colorVar }}
              aria-hidden="true"
            />
            <span className="text-muted-foreground">{slice.label}</span>
            <span className="ml-auto font-medium tabular-nums">
              {Math.round((slice.co2eKg / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>

      {/* Screen-reader data table alternative */}
      <table className="sr-only">
        <caption>Footprint by category this month</caption>
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">kg CO₂e</th>
            <th scope="col">Share</th>
          </tr>
        </thead>
        <tbody>
          {data.map((slice) => (
            <tr key={slice.category}>
              <th scope="row">{slice.label}</th>
              <td>{slice.co2eKg}</td>
              <td>{Math.round((slice.co2eKg / total) * 100)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
