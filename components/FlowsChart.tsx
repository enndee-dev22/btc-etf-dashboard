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

/* ─── Custom Tooltip ─────────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const entries = payload.filter((p) => p.name !== "Total" && p.value !== 0);
  const total = entries.reduce((sum, p) => sum + (p.value || 0), 0);
  const positive = entries.filter((p) => p.value > 0).sort((a, b) => b.value - a.value);
  const negative = entries.filter((p) => p.value < 0).sort((a, b) => a.value - b.value);

  return (
    <div style={{
      background: "var(--bg-elevated)",
      border: "1px solid var(--border-medium)",
      borderTop: `2px solid var(--accent)`,
      padding: "14px 16px",
      fontFamily: "var(--font-mono)",
      minWidth: 200,
      boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
    }}>
      <p style={{
        color: "var(--accent-text)",
        fontSize: 10,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        marginBottom: 12,
      }}>
        {label}
      </p>

      {positive.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          {positive.map((entry) => (
            <div key={entry.name} style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              fontSize: 10,
              marginBottom: 3,
              letterSpacing: "0.04em",
            }}>
              <span style={{ color: entry.color, opacity: 0.9 }}>{entry.name}</span>
              <span style={{ color: "var(--positive)" }}>+{entry.value.toFixed(1)}</span>
            </div>
          ))}
        </div>
      )}

      {negative.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          {negative.map((entry) => (
            <div key={entry.name} style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              fontSize: 10,
              marginBottom: 3,
              letterSpacing: "0.04em",
            }}>
              <span style={{ color: entry.color, opacity: 0.9 }}>{entry.name}</span>
              <span style={{ color: "var(--negative)" }}>{entry.value.toFixed(1)}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{
        borderTop: "1px solid var(--border-subtle)",
        marginTop: 8,
        paddingTop: 8,
        display: "flex",
        justifyContent: "space-between",
        fontSize: 11,
        letterSpacing: "0.06em",
      }}>
        <span style={{ color: "var(--text-secondary)" }}>TOTAL</span>
        <span style={{
          fontWeight: 600,
          color: total >= 0 ? "var(--positive)" : "var(--negative)",
        }}>
          {total >= 0 ? "+" : ""}{total.toFixed(1)}M
        </span>
      </div>
    </div>
  );
}

/* ─── Tick formatters ────────────────────────────────────────────── */
function formatYTick(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1000) return `${(v / 1000).toFixed(1)}B`;
  if (abs >= 100)  return `${v}M`;
  return `${v}M`;
}

/* ─── FlowsChart ─────────────────────────────────────────────────── */
export default function FlowsChart({ data }: Props) {
  const sorted = [...data]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30);

  const chartData = sorted.map((d) => ({
    ...d,
    date: d.date.slice(5),
  }));

  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border-subtle)",
      borderTop: "2px solid var(--accent)",
      padding: "24px 24px 16px",
    }}>
      <div style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 24,
        gap: 16,
      }}>
        <div>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: 24,
            letterSpacing: "0.1em",
            color: "var(--text-primary)",
            lineHeight: 1,
            marginBottom: 6,
          }}>
            DAILY NET FLOWS
          </h2>
          <p style={{
            fontSize: 10,
            letterSpacing: "0.1em",
            color: "var(--text-muted)",
            textTransform: "uppercase",
          }}>
            Last 30 trading days · USD millions
          </p>
        </div>
        <div style={{
          fontSize: 9,
          letterSpacing: "0.12em",
          color: "var(--text-muted)",
          textTransform: "uppercase",
          textAlign: "right",
          lineHeight: 1.6,
          marginTop: 2,
        }}>
          <span style={{ color: "var(--positive)" }}>▬</span> INFLOW
          {"  "}
          <span style={{ color: "var(--negative)" }}>▬</span> OUTFLOW
          <br/>
          <span style={{ color: "var(--accent)" }}>- -</span> TOTAL LINE
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <div style={{ minWidth: 580 }}>
          <ResponsiveContainer width="100%" height={380}>
            <ComposedChart data={chartData} margin={{ top: 5, right: 8, left: 4, bottom: 5 }}>
              <CartesianGrid
                strokeDasharray="1 4"
                stroke="rgba(255,255,255,0.03)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: "var(--font-mono)" }}
                tickLine={false}
                axisLine={{ stroke: "var(--border-subtle)" }}
                interval={4}
              />
              <YAxis
                tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: "var(--font-mono)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatYTick}
                width={52}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(240,160,48,0.03)", stroke: "rgba(240,160,48,0.1)", strokeWidth: 1 }}
              />
              <ReferenceLine y={0} stroke="var(--border-medium)" strokeWidth={1} />

              {ETF_KEYS.map((etf, i) => (
                <Bar
                  key={etf}
                  dataKey={etf}
                  stackId="flows"
                  fill={ETF_COLORS[etf]}
                  opacity={0.9}
                  animationBegin={i * 60}
                  animationDuration={1000}
                  name={etf}
                />
              ))}

              <Line
                dataKey="total"
                type="monotone"
                stroke="var(--accent)"
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="4 3"
                name="Total"
                animationBegin={300}
                animationDuration={1200}
              />
            </ComposedChart>
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
          <div key={etf} style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 9,
            letterSpacing: "0.08em",
          }}>
            <span style={{
              width: 10, height: 2,
              background: ETF_COLORS[etf],
              display: "inline-block",
              borderRadius: 1,
            }} />
            <span style={{ color: ETF_COLORS[etf], opacity: 0.9 }}>{etf}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
