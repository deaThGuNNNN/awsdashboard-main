"use client";
import Analytics from "@/components/analytics";

export default function AnalyticsPage() {
  // Provide default props for Analytics
  return <Analytics isTableView={false} isEC2View={true} isRDSView={true} />;
} 