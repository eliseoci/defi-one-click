import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ActivityTimeline } from "@/components/activity/activity-timeline";
import { ActivityFilters } from "@/components/activity/activity-filters";
import { ActivityStats } from "@/components/activity/activity-stats";

export default async function ActivityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />
      
      <main className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Activity History</h1>
          <p className="text-muted-foreground">
            Track all your transactions and activities across chains
          </p>
        </div>

        <ActivityStats userId={user.id} />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <ActivityFilters />
          </div>
          <div className="lg:col-span-3">
            <ActivityTimeline userId={user.id} initialTransactions={transactions || []} />
          </div>
        </div>
      </main>
    </div>
  );
}
