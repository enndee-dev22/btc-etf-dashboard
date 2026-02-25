import Dashboard from "@/components/Dashboard";
import { MOCK_DATA } from "@/lib/mockData";

async function getFlowData() {
  try {
    // Try to fetch from our API route in production; use mock in build/dev
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/flows`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error("API failed");
    return await res.json();
  } catch {
    return { data: MOCK_DATA, live: false, source: "mock data (realistic simulation)" };
  }
}

export default async function Home() {
  const flowData = await getFlowData();
  return <Dashboard initialData={flowData} />;
}
