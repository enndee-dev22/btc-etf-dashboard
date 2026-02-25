"use client";

import { useState, useMemo } from "react";
import { DayFlow, ETF_KEYS } from "@/lib/mockData";
import SummaryCards from "./SummaryCards";
import FlowsChart from "./FlowsChart";
import FlowsTable from "./FlowsTable";
import WeeklyView from "./WeeklyView";
import MonthlyView from "./MonthlyView";

interface FlowResponse {
  data: DayFlow[];
  live: boolean;
  source: string;
  lastUpdated?: string;
}

type View = "daily" | "weekly" | "monthly";

export default function Dashboard({ initialData }: { initialData: FlowResponse }) {
  const [view, setView] = useState<View>("daily");

  const data = initialData.data;
  const isLive = initialData.live;

  // Summary calculations
  const summary = useMemo(() => {
    const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
    const today = sorted[sorted.length - 1];
    const last7 = sorted.slice(-5); // last 5 trading days ≈ 1 week
    const last30 = sorted.slice(-22); // last 22 trading days ≈ 1 month

    return {
      todayTotal: today?.total ?? 0,
      weekTotal: last7.reduce((s, d) => s + d.total, 0),
      monthTotal: last30.reduce((s, d) => s + d.total, 0),
      todayDate: today?.date ?? "",
    };
  }, [data]);

  const tabs: { id: View; label: string }[] = [
    { id: "daily", label: "Daily" },
    { id: "weekly", label: "Weekly" },
    { id: "monthly", label: "Monthly" },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">₿</div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">BTC ETF Flows</h1>
              <p className="text-xs text-gray-400">Bitcoin Spot ETF Net Flow Tracker</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isLive && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                Demo Data
              </span>
            )}
            {isLive && (
              <span className="flex items-center gap-1.5 text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                Live
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Data source notice */}
        {!isLive && (
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
            <span className="text-yellow-400 text-lg mt-0.5">⚠️</span>
            <div>
              <p className="text-yellow-300 font-medium text-sm">Displaying Simulated Data</p>
              <p className="text-yellow-400/70 text-xs mt-0.5">
                Live data from Farside Investors is currently unavailable due to bot protection. 
                Values shown are realistic simulations based on historical ETF flow patterns. 
                The API route auto-retries hourly.
              </p>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <SummaryCards summary={summary} />

        {/* View tabs */}
        <div className="flex items-center gap-1 bg-gray-900 rounded-xl p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                view === tab.id
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {view === "daily" && (
          <div className="space-y-6">
            <FlowsChart data={data} />
            <FlowsTable data={data} />
          </div>
        )}
        {view === "weekly" && <WeeklyView data={data} />}
        {view === "monthly" && <MonthlyView data={data} />}

        {/* Footer */}
        <footer className="text-center text-xs text-gray-600 pb-6 space-y-1">
          <p>Source: {initialData.source}</p>
          {initialData.lastUpdated && (
            <p>Last updated: {new Date(initialData.lastUpdated).toLocaleString()}</p>
          )}
          <p>All values in millions USD (M). Not financial advice.</p>
        </footer>
      </main>
    </div>
  );
}
