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
import { DayFlow, ETF_KEYS, ETF_COLORS } from "@/lib/mockData";

interface Props {
  data: DayFlow[];
}

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatFlow(val: number): string {
  const abs = Math.abs(val);
  const sign = val > 0 ? "+" : val < 0 ? "−" : "";
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(2)}B`;
  return `${sign}$${abs.toFixed(0)}M`;
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const entries = payload.filter((p) => p.value !== 0);
  const total = entries.reduce((s, p) => s + p.value, 0);
  const pos = entries.filter(p => p.value > 0).sort((a,b) => b.value - a.value);
  const neg = entries.filter(p => p.value < 0).sort((a,b) => a.value - b.value);

  return (
    <div style={{
      background: "var(--bg-elevated)",
      border: "1px solid var(--border-medium)",
      borderTop: "2px solid var(--accent)",
      padding: "14px 16px",
      fontFamily: "var(--font-mono)",
      minWidth: 180,
      boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
      maxHeight: 320,
      overflowY: "auto",
    }}>
      <p style={{ fontSize: 10, color: "var(--accent-text)", letterSpacing: "0.12em", marginBottom: 10 }}>{label}</p>
      {[...pos, ...neg].map(e => (
        <div key={e.name} style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 14,
          fontSize: 10,
          marginBottom: 3,
          letterSpacing: "0.04em",
        }}>
          <span style={{ color: e.color, opacity: 0.9 }}>{e.name}</span>
          <span style={{ color: e.value >= 0 ? "var(--positive)" : "var(--negative)" }}>
            {formatFlow(e.value)}
          </span>
        </div>
      ))}
      <div style={{
        borderTop: "1px solid var(--border-subtle)",
        marginTop: 8, paddingTop: 8,
        display: "flex", justifyContent: "space-between",
        fontSize: 11, letterSpacing: "0.06em",
      }}>
        <span style={{ color: "var(--text-secondary)" }}>TOTAL</span>
        <span style={{ fontWeight: 600, color: total >= 0 ? "var(--positive)" : "var(--negative)" }}>
          {formatFlow(total)}
        </span>
      </div>
    </div>
  );
}

export default function MonthlyView({ data }: Props) {
  const monthMap = new Map<string, Record<string, number>>();

  for (const day of data) {
    const month = day.date.slice(0, 7);
    if (!monthMap.has(month)) {
      const obj: Record<string, number> = { total: 0 };
      for (const etf of ETF_KEYS) obj[etf] = 0;
      monthMap.set(month, obj);
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
        month: `${MONTH_NAMES[parseInt(mo) - 1]} '${year.slice(2)}`,
        ...vals,
      } as MonthRow;
    });

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
          MONTHLY NET FLOWS BY ETF
        </h2>
        <p style={{
          fontSize: 10,
          letterSpacing: "0.1em",
          color: "var(--text-muted)",
          textTransform: "uppercase",
          marginBottom: 24,
        }}>
          Stacked by fund · USD millions
        </p>

        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: 480 }}>
            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={monthData} margin={{ top: 5, right: 8, left: 4, bottom: 5 }}>
                <CartesianGrid
                  strokeDasharray="1 4"
                  stroke="rgba(255,255,255,0.03)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
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
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(240,160,48,0.04)" }} />
                <ReferenceLine y={0} stroke="var(--border-medium)" strokeWidth={1} />
                {ETF_KEYS.map((etf, i) => (
                  <Bar
                    key={etf}
                    dataKey={etf}
                    stackId="monthly"
                    fill={ETF_COLORS[etf]}
                    opacity={0.85}
                    name={etf}
                    animationBegin={i * 40}
                    animationDuration={1000}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ETF legend */}
        <div style={{
          marginTop: 16,
          display: "flex",
          flexWrap: "wrap",
          gap: "8px 16px",
          paddingTop: 12,
          borderTop: "1px solid var(--border-subtle)",
        }}>
          {ETF_KEYS.map((etf) => (
            <div key={etf} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 9, letterSpacing: "0.08em" }}>
              <span style={{ width: 10, height: 2, background: ETF_COLORS[etf], display: "inline-block", borderRadius: 1 }} />
              <span style={{ color: ETF_COLORS[etf], opacity: 0.9 }}>{etf}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly table */}
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
            MONTHLY ETF BREAKDOWN
          </h3>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg-surface)" }}>
                <th style={{
                  padding: "10px 24px",
                  fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase",
                  color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontWeight: 500,
                  borderBottom: "1px solid var(--border-subtle)",
                  textAlign: "left",
                  position: "sticky", left: 0, background: "var(--bg-surface)",
                  minWidth: 80,
                }}>
                  Month
                </th>
                {ETF_KEYS.map((etf) => (
                  <th key={etf} style={{
                    padding: "10px 12px",
                    fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
                    fontFamily: "var(--font-mono)", fontWeight: 500,
                    borderBottom: "1px solid var(--border-subtle)",
                    textAlign: "right",
                    minWidth: 70,
                    color: ETF_COLORS[etf],
                    opacity: 0.8,
                  }}>
                    {etf}
                  </th>
                ))}
                <th style={{
                  padding: "10px 24px",
                  fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase",
                  color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontWeight: 500,
                  borderBottom: "1px solid var(--border-subtle)",
                  textAlign: "right",
                }}>
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {[...monthData].reverse().map((row) => (
                <tr
                  key={row.month}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.025)" }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(240,160,48,0.03)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = "";
                  }}
                >
                  <td style={{
                    padding: "12px 24px",
                    fontFamily: "var(--font-display)",
                    fontSize: 14,
                    letterSpacing: "0.08em",
                    color: "var(--text-primary)",
                    position: "sticky", left: 0,
                    background: "var(--bg-card)",
                  }}>
                    {row.month}
                  </td>
                  {ETF_KEYS.map((etf) => {
                    const val = row[etf] as number;
                    return (
                      <td key={etf} style={{ padding: "12px 12px", textAlign: "right" }}>
                        <span style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          letterSpacing: "0.03em",
                          color: val >= 0 ? "var(--positive)" : "var(--negative)",
                          opacity: 0.8,
                        }}>
                          {val >= 0 ? "+" : ""}{val.toFixed(0)}
                        </span>
                      </td>
                    );
                  })}
                  <td style={{ padding: "12px 24px", textAlign: "right" }}>
                    <span style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 14,
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
    </div>
  );
}
