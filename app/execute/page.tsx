import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import { ExecutionInterface } from "@/components/execute/execution-interface";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default async function ExecutePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch user's wallets
  const { data: wallets } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", user.id);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />
      
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <ExecutionInterface userId={user.id} wallets={wallets || []} />
      </main>
    </div>
  );
}
