"use client";

import { useState, useMemo, Suspense } from "react";
import dynamic from "next/dynamic";
import { DayFlow } from "@/lib/mockData";
import SummaryCards from "./SummaryCards";
import FlowsTable from "./FlowsTable";

// Lazy-load heavy chart components
const FlowsChart = dynamic(() => import("./FlowsChart"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});
const WeeklyView = dynamic(() => import("./WeeklyView"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});
const MonthlyView = dynamic(() => import("./MonthlyView"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

function ChartSkeleton() {
  return (
    <div className="card" style={{ height: 380, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.1em" }}>
        LOADING CHART DATA...
      </span>
    </div>
  );
}

interface FlowResponse {
  data: DayFlow[];
  live: boolean;
  source: string;
  lastUpdated?: string;
}

type View = "daily" | "weekly" | "monthly";

const NOW = new Date().toLocaleString("en-US", {
  month: "short", day: "numeric", year: "numeric",
  hour: "2-digit", minute: "2-digit",
  timeZoneName: "short",
});

export default function Dashboard({ initialData }: { initialData: FlowResponse }) {
  const [view, setView] = useState<View>("daily");

  const { data, live, source, lastUpdated } = initialData;

  const summary = useMemo(() => {
    const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
    const today = sorted[sorted.length - 1];
    const last7  = sorted.slice(-5);
    const last30 = sorted.slice(-22);
    return {
      todayTotal:  today?.total ?? 0,
      weekTotal:   last7.reduce((s, d) => s + d.total, 0),
      monthTotal:  last30.reduce((s, d) => s + d.total, 0),
      todayDate:   today?.date ?? "",
    };
  }, [data]);

  const tabs: { id: View; label: string }[] = [
    { id: "daily",   label: "Daily"   },
    { id: "weekly",  label: "Weekly"  },
    { id: "monthly", label: "Monthly" },
  ];

  const displayDate = lastUpdated
    ? new Date(lastUpdated).toLocaleString("en-US", {
        month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit",
        timeZoneName: "short",
      })
    : NOW;

  return (
    <div style={{ minHeight: "100vh", position: "relative", zIndex: 1 }}>

      {/* ── Header ─────────────────────────────────────── */}
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(7,8,9,0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border-subtle)",
      }}>
        <div style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "0 24px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}>
          {/* Logo + Title */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 32, height: 32,
              background: "var(--accent-dim)",
              border: "1px solid var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontFamily: "var(--font-display)",
              color: "var(--accent-text)",
              letterSpacing: "0.05em",
              flexShrink: 0,
            }}>
              ₿
            </div>
            <div>
              <div style={{
                fontFamily: "var(--font-display)",
                fontSize: 18,
                letterSpacing: "0.12em",
                color: "var(--text-primary)",
                lineHeight: 1,
              }}>
                BTC ETF FLOWS
              </div>
              <div style={{
                fontSize: 9,
                letterSpacing: "0.15em",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                marginTop: 2,
              }}>
                BITCOIN SPOT ETF NET FLOW TRACKER
              </div>
            </div>
          </div>

          {/* Right: timestamp + badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{
              display: "none",
              fontSize: 10,
              color: "var(--text-muted)",
              letterSpacing: "0.08em",
              fontFamily: "var(--font-mono)",
            }} className="sm-show">
              UPD: {displayDate}
            </span>

            {live ? (
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "rgba(0,232,122,0.06)",
                border: "1px solid rgba(0,232,122,0.2)",
                padding: "4px 10px",
                fontSize: 10, letterSpacing: "0.12em",
                color: "var(--positive)",
                fontFamily: "var(--font-mono)",
              }}>
                <span className="live-dot" />
                LIVE
              </div>
            ) : (
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "var(--accent-dim)",
                border: "1px solid rgba(240,160,48,0.2)",
                padding: "4px 10px",
                fontSize: 10, letterSpacing: "0.12em",
                color: "var(--accent-text)",
                fontFamily: "var(--font-mono)",
              }}>
                <span className="mock-dot" />
                MOCK DATA
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Content ──────────────────────────────── */}
      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 24px 64px" }}>

        {/* Ticker bar / mock warning */}
        {!live && (
          <div className="anim-enter" style={{
            marginBottom: 24,
            background: "var(--accent-dim)",
            border: "1px solid rgba(240,160,48,0.2)",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 11,
            letterSpacing: "0.06em",
          }}>
            <span style={{ color: "var(--accent)", fontSize: 12 }}>◈</span>
            <span style={{ color: "var(--accent-text)", fontWeight: 500 }}>SIMULATED DATA</span>
            <span style={{ color: "var(--text-secondary)", fontWeight: 300 }}>—</span>
            <span style={{ color: "var(--text-secondary)", fontWeight: 300 }}>
              Live Farside data unavailable (bot protection). Displaying realistic simulation based on historical ETF flow patterns.
            </span>
          </div>
        )}

        {/* ── Hero Section ────────────────────────────── */}
        <section style={{ marginBottom: 40 }}>
          {/* Section label */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            marginBottom: 16,
            fontSize: 9,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}>
            <span style={{ color: "var(--accent)", fontSize: 12 }}>▸</span>
            NET FLOWS — USD MILLIONS
          </div>
          <Suspense fallback={null}>
            <SummaryCards summary={summary} />
          </Suspense>
        </section>

        {/* ── View Toggle ─────────────────────────────── */}
        <div className="anim-enter-4" style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 0 }}>
          {tabs.map((tab, i) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`tab-btn${view === tab.id ? " active" : ""}${i === 0 ? "" : ""}`}
              style={{
                borderRight: i < tabs.length - 1 ? "none" : undefined,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Content ─────────────────────────────────── */}
        <div className="anim-enter-5">
          {view === "daily" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <FlowsChart data={data} />
              <FlowsTable data={data} />
            </div>
          ) : view === "weekly" ? (
            <WeeklyView data={data} />
          ) : (
            <MonthlyView data={data} />
          )}
        </div>

        {/* ── Footer ──────────────────────────────────── */}
        <footer style={{
          marginTop: 56,
          paddingTop: 24,
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          alignItems: "center",
          textAlign: "center",
        }}>
          <p style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Source: {source}
          </p>
          {lastUpdated && (
            <p style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.06em" }}>
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </p>
          )}
          <p style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.06em" }}>
            All values in USD millions (M). Not financial advice.
          </p>
        </footer>
      </main>

      <style>{`
        @media (min-width: 640px) { .sm-show { display: block !important; } }
      `}</style>
    </div>
  );
}
