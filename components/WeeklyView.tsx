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

function formatFlow(val: number): string {
  const abs = Math.abs(val);
  const sign = val > 0 ? "+" : val < 0 ? "−" : "";
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(2)}B`;
  return `${sign}$${abs.toFixed(0)}M`;
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value ?? 0;
  return (
    <div style={{
      background: "var(--bg-elevated)",
      border: "1px solid var(--border-medium)",
      borderTop: "2px solid var(--accent)",
      padding: "12px 14px",
      fontFamily: "var(--font-mono)",
      boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
    }}>
      <p style={{ fontSize: 10, color: "var(--accent-text)", letterSpacing: "0.12em", marginBottom: 6 }}>
        WK OF {label}
      </p>
      <p style={{
        fontSize: 16,
        fontFamily: "var(--font-display)",
        color: val >= 0 ? "var(--positive)" : "var(--negative)",
        letterSpacing: "0.06em",
      }}>
        {formatFlow(val)}
      </p>
    </div>
  );
}

export default function WeeklyView({ data }: Props) {
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
      week: week.slice(5),
      total: Math.round(total * 10) / 10,
      days: weekCounts.get(week) || 0,
    }));

  const maxVal = Math.max(...weekData.map(d => Math.abs(d.total)));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Chart */}
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        borderTop: "2px solid var(--accent)",
        padding: "24px 24px 16px",
      }}>
        <h2 style={{
          fontFamily: "var(--font-display)",
          fontSize: 24,
          letterSpacing: "0.1em",
          color: "var(--text-primary)",
          lineHeight: 1,
          marginBottom: 6,
        }}>
          WEEKLY NET FLOWS
        </h2>
        <p style={{
          fontSize: 10,
          letterSpacing: "0.1em",
          color: "var(--text-muted)",
          textTransform: "uppercase",
          marginBottom: 24,
        }}>
          Aggregated by week (Mon–Fri) · USD millions
        </p>

        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: 480 }}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={weekData} margin={{ top: 5, right: 8, left: 4, bottom: 5 }}>
                <CartesianGrid
                  strokeDasharray="1 4"
                  stroke="rgba(255,255,255,0.03)"
                  vertical={false}
                />
                <XAxis
                  dataKey="week"
                  tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: "var(--font-mono)" }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border-subtle)" }}
                />
                <YAxis
                  tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: "var(--font-mono)" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => {
                    const abs = Math.abs(v);
                    if (abs >= 1000) return `${(v/1000).toFixed(1)}B`;
                    return `${v}M`;
                  }}
                  width={56}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(240,160,48,0.04)" }} />
                <ReferenceLine y={0} stroke="var(--border-medium)" strokeWidth={1} />
                <Bar
                  dataKey="total"
                  name="Weekly Total"
                  radius={[2, 2, 0, 0]}
                  animationBegin={0}
                  animationDuration={1000}
                >
                  {weekData.map((d) => (
                    <Cell
                      key={d.week}
                      fill={d.total >= 0 ? "var(--positive)" : "var(--negative)"}
                      opacity={0.75 + 0.25 * (Math.abs(d.total) / (maxVal || 1))}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Weekly table */}
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        borderTop: "2px solid var(--accent)",
        overflow: "hidden",
      }}>
        <div style={{ padding: "20px 24px 14px" }}>
          <h3 style={{
            fontFamily: "var(--font-display)",
            fontSize: 20,
            letterSpacing: "0.1em",
            color: "var(--text-primary)",
            lineHeight: 1,
          }}>
            WEEKLY SUMMARY
          </h3>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg-surface)" }}>
              {["Week of", "Trading Days", "Net Flow"].map((h, i) => (
                <th key={h} style={{
                  padding: "10px 24px",
                  fontSize: 9,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-mono)",
                  fontWeight: 500,
                  borderBottom: "1px solid var(--border-subtle)",
                  textAlign: i === 0 ? "left" : "right",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...weekData].reverse().map((row) => (
              <tr
                key={row.week}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.025)" }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(240,160,48,0.03)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = "";
                }}
              >
                <td style={{ padding: "12px 24px", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-primary)", letterSpacing: "0.04em" }}>
                  {row.week}
                </td>
                <td style={{ padding: "12px 24px", textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>
                  {row.days}D
                </td>
                <td style={{ padding: "12px 24px", textAlign: "right" }}>
                  <span style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 16,
                    letterSpacing: "0.06em",
                    color: row.total >= 0 ? "var(--positive)" : "var(--negative)",
                  }}>
                    {formatFlow(row.total)}
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
