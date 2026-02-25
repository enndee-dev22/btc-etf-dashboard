"use client";

import { useState } from "react";
import { DayFlow, ETF_KEYS, ETF_NAMES, ETF_COLORS } from "@/lib/mockData";

interface Props {
  data: DayFlow[];
}

function flowCell(val: number) {
  if (val === 0) return <span className="text-gray-600">—</span>;
  const color = val > 0 ? "text-green-400" : "text-red-400";
  const bg = val > 0 ? "bg-green-500/10" : "bg-red-500/10";
  return (
    <span className={`${color} ${bg} px-2 py-0.5 rounded text-xs font-mono`}>
      {val > 0 ? "+" : ""}{val.toFixed(1)}
    </span>
  );
}

export default function FlowsTable({ data }: Props) {
  const [showAll, setShowAll] = useState(false);

  const sorted = [...data]
    .sort((a, b) => b.date.localeCompare(a.date));

  const visible = showAll ? sorted : sorted.slice(0, 15);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold text-lg">Flow Breakdown by ETF</h2>
          <p className="text-gray-500 text-sm mt-0.5">Values in USD millions • Green = inflow • Red = outflow</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-5 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider sticky left-0 bg-gray-900 min-w-[90px]">
                Date
              </th>
              {ETF_KEYS.map((etf) => (
                <th key={etf} className="text-right px-3 py-3 text-xs font-medium uppercase tracking-wider whitespace-nowrap min-w-[70px]">
                  <span style={{ color: ETF_COLORS[etf] }}>{etf}</span>
                </th>
              ))}
              <th className="text-right px-5 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider min-w-[90px]">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((day, i) => (
              <tr
                key={day.date}
                className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${
                  i % 2 === 0 ? "" : "bg-gray-900/30"
                }`}
              >
                <td className="px-5 py-3 text-gray-300 font-mono text-xs sticky left-0 bg-inherit">
                  {day.date}
                </td>
                {ETF_KEYS.map((etf) => (
                  <td key={etf} className="px-3 py-3 text-right">
                    {flowCell(day[etf] as number)}
                  </td>
                ))}
                <td className="px-5 py-3 text-right">
                  <span
                    className={`font-bold text-sm font-mono ${
                      day.total > 0 ? "text-green-400" : day.total < 0 ? "text-red-400" : "text-gray-500"
                    }`}
                  >
                    {day.total > 0 ? "+" : ""}{day.total.toFixed(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sorted.length > 15 && (
        <div className="p-4 text-center border-t border-gray-800">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-orange-400 hover:text-orange-300 font-medium transition-colors"
          >
            {showAll ? "Show less ↑" : `Show all ${sorted.length} days ↓`}
          </button>
        </div>
      )}
    </div>
  );
}
