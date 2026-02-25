"use client";

import { useEffect, useRef, useState } from "react";

interface Summary {
  todayTotal:  number;
  weekTotal:   number;
  monthTotal:  number;
  todayDate:   string;
}

/* ── CountUp hook ──────────────────────────────────────────────────── */
function useCountUp(target: number, duration = 1400, delay = 0) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let startTime: number | null = null;
    const initialTarget = target;

    const timeoutId = setTimeout(() => {
      const tick = (now: number) => {
        if (!startTime) startTime = now;
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out expo
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        setValue(initialTarget * eased);
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          setValue(initialTarget);
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, delay]);

  return value;
}

/* ── Formatters ────────────────────────────────────────────────────── */
function formatHero(val: number): string {
  const abs = Math.abs(val);
  const sign = val > 0 ? "+" : val < 0 ? "−" : "";
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(2)}B`;
  if (abs >= 100)  return `${sign}$${abs.toFixed(0)}M`;
  return `${sign}$${abs.toFixed(1)}M`;
}

function splitHeroNumber(val: number): { sign: string; number: string; suffix: string } {
  const abs = Math.abs(val);
  const sign = val > 0 ? "+" : val < 0 ? "−" : "";
  if (abs >= 1000) {
    const num = (abs / 1000).toFixed(2);
    return { sign, number: num, suffix: "B" };
  }
  if (abs >= 100) {
    return { sign, number: abs.toFixed(0), suffix: "M" };
  }
  return { sign, number: abs.toFixed(1), suffix: "M" };
}

/* ── Card ──────────────────────────────────────────────────────────── */
function MetricCard({
  label, sublabel, value, delay, accentTop,
}: {
  label: string;
  sublabel: string;
  value: number;
  delay: number;
  accentTop?: boolean;
}) {
  const animated = useCountUp(value, 1400, delay);
  const { sign, number, suffix } = splitHeroNumber(animated);

  const isPositive = value > 0;
  const isNegative = value < 0;
  const colorStyle = isPositive
    ? { color: "var(--positive)" }
    : isNegative
    ? { color: "var(--negative)" }
    : { color: "var(--text-secondary)" };

  const borderTopColor = accentTop
    ? "var(--accent)"
    : isPositive
    ? "var(--positive)"
    : isNegative
    ? "var(--negative)"
    : "var(--border-subtle)";

  const bgGlow = isPositive
    ? "rgba(0, 232, 122, 0.03)"
    : isNegative
    ? "rgba(255, 51, 84, 0.03)"
    : "transparent";

  return (
    <div
      style={{
        background: `linear-gradient(135deg, var(--bg-card) 0%, ${bgGlow} 100%)`,
        border: "1px solid var(--border-subtle)",
        borderTop: `2px solid ${borderTopColor}`,
        padding: "28px 32px 32px",
        flex: 1,
        minWidth: 0,
        position: "relative",
        overflow: "hidden",
        animation: `fadeSlideUp 0.5s ${delay}ms ease both`,
        cursor: "default",
        transition: "border-color 0.2s ease",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border-medium)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
        (e.currentTarget as HTMLElement).style.borderTopColor = borderTopColor;
      }}
    >
      {/* Corner decoration */}
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: 40, height: 40,
        background: `linear-gradient(225deg, ${borderTopColor}18 0%, transparent 60%)`,
        pointerEvents: "none",
      }} />

      {/* Label */}
      <div style={{
        fontSize: 9,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: "var(--text-muted)",
        fontFamily: "var(--font-mono)",
        marginBottom: 4,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 9,
        letterSpacing: "0.08em",
        color: "var(--text-muted)",
        marginBottom: 20,
        fontFamily: "var(--font-mono)",
      }}>
        {sublabel}
      </div>

      {/* Hero number */}
      <div style={{
        display: "flex",
        alignItems: "baseline",
        gap: 0,
        ...colorStyle,
      }}>
        <span style={{
          fontFamily: "var(--font-display)",
          fontSize: 64,
          lineHeight: 1,
          letterSpacing: "0.02em",
          minWidth: "1.2em",
        }}>
          {sign}
        </span>
        <span style={{
          fontFamily: "var(--font-display)",
          fontSize: 64,
          lineHeight: 1,
          letterSpacing: "0.02em",
        }}>
          {number}
        </span>
        <span style={{
          fontFamily: "var(--font-display)",
          fontSize: 40,
          lineHeight: 1,
          letterSpacing: "0.04em",
          opacity: 0.7,
          marginLeft: 4,
          alignSelf: "flex-end",
          marginBottom: 4,
        }}>
          {suffix}
        </span>
      </div>

      {/* Direction indicator */}
      <div style={{
        marginTop: 12,
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 10,
        letterSpacing: "0.08em",
        ...colorStyle,
      }}>
        {isPositive ? (
          <>
            <span style={{ fontSize: 10 }}>▲</span>
            <span style={{ fontFamily: "var(--font-mono)" }}>NET INFLOW</span>
          </>
        ) : isNegative ? (
          <>
            <span style={{ fontSize: 10 }}>▼</span>
            <span style={{ fontFamily: "var(--font-mono)" }}>NET OUTFLOW</span>
          </>
        ) : (
          <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>NEUTRAL</span>
        )}
      </div>
    </div>
  );
}

/* ── SummaryCards ──────────────────────────────────────────────────── */
export default function SummaryCards({ summary }: { summary: Summary }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "row",
      gap: 1,
    }}
    className="summary-cards"
    >
      <MetricCard
        label="Today's Net Flow"
        sublabel={summary.todayDate || "Latest trading day"}
        value={summary.todayTotal}
        delay={50}
        accentTop={false}
      />
      <MetricCard
        label="7-Day Net Flow"
        sublabel="Last 5 trading days"
        value={summary.weekTotal}
        delay={150}
      />
      <MetricCard
        label="30-Day Net Flow"
        sublabel="Last 22 trading days"
        value={summary.monthTotal}
        delay={250}
        accentTop={true}
      />

      <style>{`
        @media (max-width: 768px) {
          .summary-cards {
            flex-direction: column !important;
          }
        }
      `}</style>
    </div>
  );
}
