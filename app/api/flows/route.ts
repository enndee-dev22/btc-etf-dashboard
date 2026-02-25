import { NextResponse } from "next/server";
import { parse } from "node-html-parser";
import { MOCK_DATA, DayFlow } from "@/lib/mockData";

const FARSIDE_URL = "https://farside.co.uk/btc/";
const ETF_COLUMNS = ["IBIT", "FBTC", "GBTC", "ARKB", "BITB", "HODL", "BRRR", "EZBC", "BTCO", "DEFI"];

async function fetchFarsideData(): Promise<{ data: DayFlow[]; live: boolean }> {
  try {
    const res = await fetch(FARSIDE_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      next: { revalidate: 3600 }, // cache for 1 hour
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    
    // Check for Cloudflare challenge
    if (html.includes("Just a moment") || html.includes("cf-challenge")) {
      throw new Error("Cloudflare protection active");
    }

    const root = parse(html);
    const rows = root.querySelectorAll("table tr");
    const data: DayFlow[] = [];

    const parseCell = (text: string): number => {
      const cleaned = text.replace(/[,$\s]/g, "").replace("(", "-").replace(")", "");
      return cleaned === "-" || cleaned === "" ? 0 : parseFloat(cleaned) || 0;
    };

    for (const tableRow of rows) {
      const cells = tableRow.querySelectorAll("td");
      if (cells.length < 5) continue;

      const dateText = cells[0]?.text?.trim();
      if (!dateText || !/^\d{1,2}[\/\-]\w+[\/\-]\d{2,4}$/.test(dateText) && !/^\w+ \d+/.test(dateText)) continue;

      // Parse date
      const parsed = new Date(dateText);
      if (isNaN(parsed.getTime())) continue;
      const dateStr = parsed.toISOString().split("T")[0];

      const entry: Partial<DayFlow> = { date: dateStr };
      ETF_COLUMNS.forEach((etf, idx) => {
        (entry as Record<string, unknown>)[etf] = parseCell(cells[idx + 1]?.text || "0");
      });

      const vals = ETF_COLUMNS.map((k) => (entry as Record<string, number>)[k] || 0);
      entry.total = Math.round(vals.reduce((a, b) => a + b, 0) * 10) / 10;
      data.push(entry as DayFlow);
    }

    if (data.length < 5) throw new Error("Insufficient data parsed");
    return { data, live: true };
  } catch (err) {
    console.warn("Live fetch failed, using mock data:", err);
    return { data: MOCK_DATA, live: false };
  }
}

export async function GET() {
  const { data, live } = await fetchFarsideData();

  // Return last 90 days
  const sliced = data.slice(-90);

  return NextResponse.json(
    {
      data: sliced,
      live,
      source: live ? "farside.co.uk (live)" : "mock data (realistic simulation)",
      lastUpdated: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    }
  );
}
