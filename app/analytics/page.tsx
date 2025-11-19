import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { PortfolioChart } from "@/components/analytics/portfolio-chart";
import { ChainDistribution } from "@/components/analytics/chain-distribution";
import { PerformanceMetrics } from "@/components/analytics/performance-metrics";
import { TopTokens } from "@/components/analytics/top-tokens";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />
      
      <main className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">
            Deep insights into your portfolio performance
          </p>
        </div>

        <PerformanceMetrics userId={user.id} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PortfolioChart userId={user.id} />
          </div>
          <div>
            <ChainDistribution userId={user.id} />
          </div>
        </div>

        <TopTokens userId={user.id} />
      </main>
    </div>
  );
}
