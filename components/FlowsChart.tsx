"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { DayFlow, ETF_KEYS, ETF_COLORS, ETF_NAMES } from "@/lib/mockData";

interface Props {
  data: DayFlow[];
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;

  const total = payload.reduce((sum, p) => sum + (p.value || 0), 0);
  const positive = payload.filter((p) => p.value > 0);
  const negative = payload.filter((p) => p.value < 0);

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 shadow-2xl max-w-xs">
      <p className="text-gray-300 font-semibold text-sm mb-3">{label}</p>
      <div className="space-y-1.5">
        {[...positive, ...negative].map((entry) => (
          <div key={entry.name} className="flex justify-between gap-4 text-xs">
            <span style={{ color: entry.color }}>{entry.name}</span>
            <span className={entry.value >= 0 ? "text-green-400" : "text-red-400"}>
              {entry.value >= 0 ? "+" : ""}{entry.value.toFixed(1)}M
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between text-sm">
        <span className="text-gray-400">Total</span>
        <span className={`font-bold ${total >= 0 ? "text-green-400" : "text-red-400"}`}>
          {total >= 0 ? "+" : ""}{total.toFixed(1)}M
        </span>
      </div>
    </div>
  );
};

export default function FlowsChart({ data }: Props) {
  const sorted = [...data]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30); // show last 30 days

  const chartData = sorted.map((d) => ({
    ...d,
    date: d.date.slice(5), // "MM-DD"
  }));

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-semibold text-lg">Daily Net Flows</h2>
          <p className="text-gray-500 text-sm mt-0.5">Last 30 trading days • USD millions</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={360}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "#6b7280", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#374151" }}
            interval={4}
          />
          <YAxis
            tick={{ fill: "#6b7280", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}M`}
            width={55}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Legend
            wrapperStyle={{ paddingTop: "16px" }}
            formatter={(value) => (
              <span style={{ color: "#9ca3af", fontSize: "12px" }}>{value}</span>
            )}
          />
          <ReferenceLine y={0} stroke="#374151" strokeWidth={1} />

          {ETF_KEYS.map((etf) => (
            <Bar
              key={etf}
              dataKey={etf}
              stackId="flows"
              fill={ETF_COLORS[etf]}
              opacity={0.85}
              radius={[0, 0, 0, 0]}
            />
          ))}

          <Line
            dataKey="total"
            type="monotone"
            stroke="#ffffff"
            strokeWidth={2}
            dot={false}
            strokeDasharray="4 2"
            name="Total"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
