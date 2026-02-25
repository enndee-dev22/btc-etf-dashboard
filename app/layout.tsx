import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BTC ETF Flow Tracker",
  description: "Real-time Bitcoin spot ETF daily net flow tracker — IBIT, FBTC, GBTC, ARKB and more",
  openGraph: {
    title: "BTC ETF Flow Tracker",
    description: "Track daily Bitcoin spot ETF net flows",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body style={{ fontFamily: "'IBM Plex Mono', 'Courier New', monospace" }}>
        {children}
      </body>
    </html>
  );
}
