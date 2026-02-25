"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { DayFlow, ETF_KEYS, ETF_COLORS, ETF_NAMES } from "@/lib/mockData";

interface Props {
  data: DayFlow[];
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export default function MonthlyView({ data }: Props) {
  // Group by month
  const monthMap = new Map<string, Record<string, number>>();

  for (const day of data) {
    const month = day.date.slice(0, 7); // "YYYY-MM"
    if (!monthMap.has(month)) {
      monthMap.set(month, { total: 0 });
      for (const etf of ETF_KEYS) {
        monthMap.get(month)![etf] = 0;
      }
    }
    const m = monthMap.get(month)!;
    m.total = Math.round((m.total + day.total) * 10) / 10;
    for (const etf of ETF_KEYS) {
      m[etf] = Math.round((m[etf] + (day[etf] as number)) * 10) / 10;
    }
  }

  type MonthRow = { month: string; total: number } & Record<string, number>;

  const monthData: MonthRow[] = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, vals]) => {
      const [year, mo] = month.split("-");
      return {
        month: `${MONTH_NAMES[parseInt(mo) - 1]} ${year.slice(2)}`,
        ...vals,
      } as MonthRow;
    });

  return (
    <div className="space-y-6">
      {/* Stacked bar chart by ETF */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h2 className="text-white font-semibold text-lg mb-1">Monthly Net Flows by ETF</h2>
        <p className="text-gray-500 text-sm mb-6">Stacked by fund • USD millions</p>

        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={monthData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: "#6b7280", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "#374151" }}
            />
            <YAxis
              tick={{ fill: "#6b7280", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v >= 1000 ? `${(v/1000).toFixed(1)}B` : `${v}M`}`}
              width={65}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "12px" }}
              labelStyle={{ color: "#e5e7eb" }}
              formatter={(value: number | undefined) =>
                value != null ? [`${value >= 0 ? "+" : ""}${value.toFixed(1)}M`] : ["—"]
              }
            />
            <ReferenceLine y={0} stroke="#374151" />
            {ETF_KEYS.map((etf) => (
              <Bar
                key={etf}
                dataKey={etf}
                stackId="monthly"
                fill={ETF_COLORS[etf]}
                opacity={0.85}
                name={etf}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly summary table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-800">
          <h3 className="text-white font-semibold">Monthly ETF Breakdown (M USD)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-5 py-3 text-gray-400 text-xs uppercase tracking-wider sticky left-0 bg-gray-900">Month</th>
                {ETF_KEYS.map((etf) => (
                  <th key={etf} className="text-right px-3 py-3 text-xs font-medium uppercase tracking-wider min-w-[70px]">
                    <span style={{ color: ETF_COLORS[etf] }}>{etf}</span>
                  </th>
                ))}
                <th className="text-right px-5 py-3 text-gray-400 text-xs uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody>
              {[...monthData].reverse().map((row) => (
                <tr key={row.month} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="px-5 py-3 text-gray-300 font-mono text-xs sticky left-0 bg-inherit">{row.month}</td>
                  {ETF_KEYS.map((etf) => {
                    const val = row[etf] as number;
                    return (
                      <td key={etf} className="px-3 py-3 text-right text-xs font-mono">
                        <span className={val >= 0 ? "text-green-400" : "text-red-400"}>
                          {val >= 0 ? "+" : ""}{val.toFixed(0)}
                        </span>
                      </td>
                    );
                  })}
                  <td className="px-5 py-3 text-right">
                    <span className={`font-bold font-mono text-sm ${row.total >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {row.total >= 0 ? "+" : ""}{row.total.toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
