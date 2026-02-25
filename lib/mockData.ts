// Realistic mock data for BTC Spot ETF daily flows (in millions USD)
// Based on actual ETF launch dates and typical flow patterns

export const ETF_NAMES: Record<string, string> = {
  IBIT: "iShares Bitcoin Trust (BlackRock)",
  FBTC: "Fidelity Wise Origin Bitcoin Fund",
  GBTC: "Grayscale Bitcoin Trust",
  ARKB: "ARK 21Shares Bitcoin ETF",
  BITB: "Bitwise Bitcoin ETF",
  HODL: "VanEck Bitcoin Trust",
  BRRR: "Valkyrie Bitcoin Fund",
  EZBC: "Franklin Bitcoin ETF",
  BTCO: "Invesco Galaxy Bitcoin ETF",
  DEFI: "Hashdex Bitcoin ETF",
};

export const ETF_COLORS: Record<string, string> = {
  IBIT: "#F59E0B",
  FBTC: "#10B981",
  GBTC: "#EF4444",
  ARKB: "#8B5CF6",
  BITB: "#3B82F6",
  HODL: "#F97316",
  BRRR: "#EC4899",
  EZBC: "#14B8A6",
  BTCO: "#6366F1",
  DEFI: "#84CC16",
};

export interface DayFlow {
  date: string;
  IBIT: number;
  FBTC: number;
  GBTC: number;
  ARKB: number;
  BITB: number;
  HODL: number;
  BRRR: number;
  EZBC: number;
  BTCO: number;
  DEFI: number;
  total: number;
}

function r(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

function generateDay(dateStr: string, bullish: boolean): DayFlow {
  const bias = bullish ? 1.5 : 0.3;
  const ibit = r(-80, 650 * bias);
  const fbtc = r(-40, 320 * bias);
  const gbtc = r(-250, 80);
  const arkb = r(-30, 180 * bias);
  const bitb = r(-20, 130 * bias);
  const hodl = r(-10, 55 * bias);
  const brrr = r(-8, 40 * bias);
  const ezbc = r(-5, 35 * bias);
  const btco = r(-5, 30 * bias);
  const defi = r(-3, 20 * bias);

  const total = Math.round(
    (ibit + fbtc + gbtc + arkb + bitb + hodl + brrr + ezbc + btco + defi) * 10
  ) / 10;

  return {
    date: dateStr,
    IBIT: ibit,
    FBTC: fbtc,
    GBTC: gbtc,
    ARKB: arkb,
    BITB: bitb,
    HODL: hodl,
    BRRR: brrr,
    EZBC: ezbc,
    BTCO: btco,
    DEFI: defi,
    total,
  };
}

// Generate 90 days of mock data ending today
function generateMockData(): DayFlow[] {
  const data: DayFlow[] = [];
  const today = new Date("2025-02-25");
  const seededRand = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    // Skip weekends
    if (d.getDay() === 0 || d.getDay() === 6) continue;

    const dateStr = d.toISOString().split("T")[0];
    // Simulate market phases: Dec bullish, Jan mixed, Feb recovering
    const dayIndex = 90 - i;
    const bullish = dayIndex < 30 ? seededRand(dayIndex * 7) > 0.3
      : dayIndex < 60 ? seededRand(dayIndex * 7) > 0.5
      : seededRand(dayIndex * 7) > 0.4;

    // Use seeded values to ensure consistent data
    const seed = dayIndex;
    const ibit = Math.round((seededRand(seed * 1) * 730 - 80) * 10) / 10;
    const fbtc = Math.round((seededRand(seed * 2) * 360 - 40) * 10) / 10;
    const gbtc = Math.round((seededRand(seed * 3) * 330 - 250) * 10) / 10;
    const arkb = Math.round((seededRand(seed * 4) * 210 - 30) * 10) / 10;
    const bitb = Math.round((seededRand(seed * 5) * 150 - 20) * 10) / 10;
    const hodl = Math.round((seededRand(seed * 6) * 65 - 10) * 10) / 10;
    const brrr = Math.round((seededRand(seed * 7) * 48 - 8) * 10) / 10;
    const ezbc = Math.round((seededRand(seed * 8) * 40 - 5) * 10) / 10;
    const btco = Math.round((seededRand(seed * 9) * 35 - 5) * 10) / 10;
    const defi = Math.round((seededRand(seed * 10) * 23 - 3) * 10) / 10;

    const total = Math.round((ibit + fbtc + gbtc + arkb + bitb + hodl + brrr + ezbc + btco + defi) * 10) / 10;

    data.push({ date: dateStr, IBIT: ibit, FBTC: fbtc, GBTC: gbtc, ARKB: arkb, BITB: bitb, HODL: hodl, BRRR: brrr, EZBC: ezbc, BTCO: btco, DEFI: defi, total });
  }
  return data;
}

export const MOCK_DATA: DayFlow[] = generateMockData();

export const ETF_KEYS = Object.keys(ETF_NAMES) as (keyof Omit<DayFlow, "date" | "total">)[];
