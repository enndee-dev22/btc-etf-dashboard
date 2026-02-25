"use client";

interface Summary {
  todayTotal: number;
  weekTotal: number;
  monthTotal: number;
  todayDate: string;
}

function formatFlow(val: number): string {
  const abs = Math.abs(val);
  if (abs >= 1000) return `${(val / 1000).toFixed(2)}B`;
  return `${val > 0 ? "+" : ""}${val.toFixed(1)}M`;
}

function flowColor(val: number): string {
  if (val > 0) return "text-green-400";
  if (val < 0) return "text-red-400";
  return "text-gray-400";
}

function bgColor(val: number): string {
  if (val > 0) return "bg-green-500/10 border-green-500/20";
  if (val < 0) return "bg-red-500/10 border-red-500/20";
  return "bg-gray-800/50 border-gray-700";
}

function Arrow({ val }: { val: number }) {
  if (val > 0) return <span className="text-green-400 text-xl">▲</span>;
  if (val < 0) return <span className="text-red-400 text-xl">▼</span>;
  return <span className="text-gray-400 text-xl">—</span>;
}

export default function SummaryCards({ summary }: { summary: Summary }) {
  const cards = [
    {
      label: "Today",
      sublabel: summary.todayDate || "Latest",
      value: summary.todayTotal,
    },
    {
      label: "This Week",
      sublabel: "Last 5 trading days",
      value: summary.weekTotal,
    },
    {
      label: "30-Day Net Flow",
      sublabel: "Last 22 trading days",
      value: summary.monthTotal,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-2xl border p-5 ${bgColor(card.value)} transition-all`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 font-medium">{card.label}</p>
              <p className="text-xs text-gray-600 mt-0.5">{card.sublabel}</p>
            </div>
            <Arrow val={card.value} />
          </div>
          <div className={`text-3xl font-bold mt-3 ${flowColor(card.value)}`}>
            {formatFlow(card.value)}
          </div>
        </div>
      ))}
    </div>
  );
}
