"use client";

import { useState, useMemo } from "react";
import { DayFlow, ETF_KEYS, ETF_NAMES, ETF_COLORS } from "@/lib/mockData";

interface Props {
  data: DayFlow[];
}

type SortKey = "name" | "today" | "week" | "month";
type SortDir = "asc" | "desc";

function formatFlow(val: number): string {
  if (val === 0) return "—";
  const abs = Math.abs(val);
  const sign = val > 0 ? "+" : "−";
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(2)}B`;
  if (abs >= 100)  return `${sign}$${abs.toFixed(0)}M`;
  return `${sign}$${abs.toFixed(1)}M`;
}

function FlowBadge({ val }: { val: number }) {
  if (val === 0) return (
    <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 11 }}>—</span>
  );
  const positive = val > 0;
  return (
    <span style={{
      display: "inline-block",
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      fontWeight: 500,
      letterSpacing: "0.04em",
      color: positive ? "var(--positive)" : "var(--negative)",
      background: positive ? "var(--positive-dim)" : "var(--negative-dim)",
      border: `1px solid ${positive ? "var(--positive-border)" : "var(--negative-border)"}`,
      padding: "2px 8px",
      borderRadius: 1,
    }}>
      {formatFlow(val)}
    </span>
  );
}

function SortArrow({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span style={{
      fontSize: 8,
      opacity: active ? 1 : 0.2,
      color: active ? "var(--accent)" : "var(--text-muted)",
      marginLeft: 3,
    }}>
      {active ? (dir === "asc" ? "▲" : "▼") : "⇅"}
    </span>
  );
}

export default function FlowsTable({ data }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("today");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const rows = useMemo(() => {
    const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
    const today = sorted[sorted.length - 1];
    const last7  = sorted.slice(-5);
    const last30 = sorted.slice(-22);

    return ETF_KEYS.map((etf) => ({
      etf,
      name: ETF_NAMES[etf],
      color: ETF_COLORS[etf],
      today: today?.[etf] as number ?? 0,
      week:  last7.reduce((s, d) => s + (d[etf] as number), 0),
      month: last30.reduce((s, d) => s + (d[etf] as number), 0),
    }));
  }, [data]);

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      let va: number | string, vb: number | string;
      if (sortKey === "name")  { va = a.name;  vb = b.name; }
      else if (sortKey === "today") { va = a.today; vb = b.today; }
      else if (sortKey === "week")  { va = a.week;  vb = b.week;  }
      else                          { va = a.month; vb = b.month; }

      if (typeof va === "string" && typeof vb === "string") {
        return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      return sortDir === "asc"
        ? (va as number) - (vb as number)
        : (vb as number) - (va as number);
    });
  }, [rows, sortKey, sortDir]);

  const maxInflow  = sorted.reduce((m, r) => r.today > m.today ? r : m, sorted[0]);
  const maxOutflow = sorted.reduce((m, r) => r.today < m.today ? r : m, sorted[0]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const thStyle: React.CSSProperties = {
    padding: "10px 16px",
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
    fontWeight: 500,
    borderBottom: "1px solid var(--border-subtle)",
    background: "var(--bg-surface)",
    whiteSpace: "nowrap",
  };

  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border-subtle)",
      borderTop: "2px solid var(--accent)",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "20px 24px 16px",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
      }}>
        <div>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: 22,
            letterSpacing: "0.1em",
            color: "var(--text-primary)",
            lineHeight: 1,
            marginBottom: 4,
          }}>
            ETF FLOW BREAKDOWN
          </h2>
          <p style={{
            fontSize: 10,
            letterSpacing: "0.08em",
            color: "var(--text-muted)",
            textTransform: "uppercase",
          }}>
            Per-fund flows · USD millions · Click headers to sort
          </p>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          <span style={{ color: "var(--positive)", display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ display: "inline-block", width: 8, height: 2, background: "var(--positive)" }} />
            Max inflow
          </span>
          <span style={{ color: "var(--negative)", display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ display: "inline-block", width: 8, height: 2, background: "var(--negative)" }} />
            Max outflow
          </span>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, textAlign: "left", paddingLeft: 24 }}>#</th>
              <th style={{ ...thStyle, textAlign: "left" }}>
                <button className="sort-btn" onClick={() => toggleSort("name")}>
                  Fund <SortArrow active={sortKey === "name"} dir={sortDir} />
                </button>
              </th>
              <th style={{ ...thStyle, textAlign: "center" }}>Ticker</th>
              <th style={{ ...thStyle, textAlign: "right" }}>
                <button className="sort-btn" style={{ marginLeft: "auto" }} onClick={() => toggleSort("today")}>
                  Today <SortArrow active={sortKey === "today"} dir={sortDir} />
                </button>
              </th>
              <th style={{ ...thStyle, textAlign: "right" }}>
                <button className="sort-btn" style={{ marginLeft: "auto" }} onClick={() => toggleSort("week")}>
                  7-Day <SortArrow active={sortKey === "week"} dir={sortDir} />
                </button>
              </th>
              <th style={{ ...thStyle, textAlign: "right", paddingRight: 24 }}>
                <button className="sort-btn" style={{ marginLeft: "auto" }} onClick={() => toggleSort("month")}>
                  30-Day <SortArrow active={sortKey === "month"} dir={sortDir} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => {
              const isMaxIn  = row.etf === maxInflow?.etf  && maxInflow?.today  > 0;
              const isMaxOut = row.etf === maxOutflow?.etf && maxOutflow?.today < 0;

              return (
                <tr
                  key={row.etf}
                  className={isMaxIn ? "row-max-positive" : isMaxOut ? "row-max-negative" : ""}
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.03)",
                    transition: "background 0.12s ease",
                    cursor: "default",
                  }}
                  onMouseEnter={e => {
                    if (!isMaxIn && !isMaxOut) {
                      (e.currentTarget as HTMLElement).style.background = "rgba(240,160,48,0.03)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isMaxIn && !isMaxOut) {
                      (e.currentTarget as HTMLElement).style.background = "";
                    }
                  }}
                >
                  {/* Rank */}
                  <td style={{
                    padding: "14px 16px 14px 24px",
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--text-muted)",
                    width: 40,
                  }}>
                    {String(i + 1).padStart(2, "0")}
                  </td>

                  {/* Fund name */}
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}>
                      <span style={{
                        width: 3, height: 32,
                        background: row.color,
                        opacity: 0.7,
                        flexShrink: 0,
                        borderRadius: 1,
                      }} />
                      <div>
                        <div style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          color: "var(--text-primary)",
                          letterSpacing: "0.03em",
                          lineHeight: 1.4,
                        }}>
                          {row.name.split("(")[0].trim()}
                        </div>
                        <div style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 9,
                          color: "var(--text-muted)",
                          letterSpacing: "0.04em",
                        }}>
                          {row.name.match(/\(([^)]+)\)/)?.[1] ?? ""}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Ticker */}
                  <td style={{ padding: "14px 16px", textAlign: "center" }}>
                    <span style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 15,
                      letterSpacing: "0.1em",
                      color: row.color,
                    }}>
                      {row.etf}
                    </span>
                  </td>

                  {/* Today */}
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    <FlowBadge val={row.today} />
                  </td>

                  {/* 7-Day */}
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    <span style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: row.week >= 0 ? "var(--positive)" : "var(--negative)",
                      opacity: 0.8,
                    }}>
                      {formatFlow(row.week)}
                    </span>
                  </td>

                  {/* 30-Day */}
                  <td style={{ padding: "14px 16px 14px 16px", textAlign: "right", paddingRight: 24 }}>
                    <span style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: row.month >= 0 ? "var(--positive)" : "var(--negative)",
                      opacity: 0.8,
                    }}>
                      {formatFlow(row.month)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer row */}
      <div style={{
        padding: "10px 24px",
        borderTop: "1px solid var(--border-subtle)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 8,
      }}>
        <span style={{
          fontSize: 9,
          letterSpacing: "0.1em",
          color: "var(--text-muted)",
          textTransform: "uppercase",
        }}>
          {ETF_KEYS.length} FUNDS · Values in USD millions
        </span>
        <span style={{
          fontSize: 9,
          letterSpacing: "0.1em",
          color: "var(--text-muted)",
          textTransform: "uppercase",
        }}>
          7-DAY = last 5 trading days · 30-DAY = last 22 trading days
        </span>
      </div>
    </div>
  );
}
