"use client";

import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { DayFlow } from "@/lib/mockData";

interface Props {
  data: DayFlow[];
}

function getWeekLabel(date: string): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  return monday.toISOString().split("T")[0];
}

export default function WeeklyView({ data }: Props) {
  // Group by week
  const weekMap = new Map<string, number>();
  const weekCounts = new Map<string, number>();

  for (const day of data) {
    const wk = getWeekLabel(day.date);
    weekMap.set(wk, (weekMap.get(wk) || 0) + day.total);
    weekCounts.set(wk, (weekCounts.get(wk) || 0) + 1);
  }

  const weekData = Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, total]) => ({
      week: week.slice(5), // MM-DD
      total: Math.round(total * 10) / 10,
      days: weekCounts.get(week) || 0,
    }));

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h2 className="text-white font-semibold text-lg mb-1">Weekly Net Flows</h2>
        <p className="text-gray-500 text-sm mb-6">Aggregated by week start (Monday) • USD millions</p>

        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={weekData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis
              dataKey="week"
              tick={{ fill: "#6b7280", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "#374151" }}
            />
            <YAxis
              tick={{ fill: "#6b7280", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}M`}
              width={60}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "12px" }}
              labelStyle={{ color: "#e5e7eb" }}
              formatter={(value: number | undefined) => value != null ? [`${value >= 0 ? "+" : ""}${value.toFixed(1)}M`] : ["—"]}
            />
            <ReferenceLine y={0} stroke="#374151" />
            <Bar
              dataKey="total"
              name="Weekly Total"
              fill="#F59E0B"
              radius={[4, 4, 0, 0]}
            >
              {weekData.map((d) => (
                <Cell key={d.week} fill={d.total >= 0 ? "#22c55e" : "#ef4444"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Weekly table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-800">
          <h3 className="text-white font-semibold">Weekly Summary</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-5 py-3 text-gray-400 text-xs uppercase tracking-wider">Week of</th>
              <th className="text-right px-5 py-3 text-gray-400 text-xs uppercase tracking-wider">Trading Days</th>
              <th className="text-right px-5 py-3 text-gray-400 text-xs uppercase tracking-wider">Net Flow (M)</th>
            </tr>
          </thead>
          <tbody>
            {[...weekData].reverse().map((row) => (
              <tr key={row.week} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                <td className="px-5 py-3 text-gray-300 font-mono text-xs">{row.week}</td>
                <td className="px-5 py-3 text-right text-gray-500 text-xs">{row.days}</td>
                <td className="px-5 py-3 text-right">
                  <span className={`font-bold font-mono ${row.total >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {row.total >= 0 ? "+" : ""}{row.total.toFixed(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
