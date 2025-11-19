"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { TrendingUp, DollarSign, Activity, Percent } from 'lucide-react';

interface ActivityStatsData {
  totalTransactions: number;
  totalVolume: number;
  successRate: number;
  avgGasFee: number;
}

export function ActivityStats({ userId }: { userId: string }) {
  const [stats, setStats] = useState<ActivityStatsData>({
    totalTransactions: 0,
    totalVolume: 0,
    successRate: 0,
    avgGasFee: 0,
  });

  useEffect(() => {
    fetchStats();
  }, [userId]);

  const fetchStats = async () => {
    const supabase = createClient();
    
    const { data: transactions } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId);

    if (!transactions) return;

    const completed = transactions.filter(t => t.status === "completed");
    const totalGas = transactions.reduce((sum, t) => sum + parseFloat(t.gas_fee || "0"), 0);
    
    setStats({
      totalTransactions: transactions.length,
      totalVolume: transactions.reduce((sum, t) => sum + parseFloat(t.from_amount || "0") * 3000, 0),
      successRate: transactions.length > 0 ? (completed.length / transactions.length) * 100 : 0,
      avgGasFee: transactions.length > 0 ? totalGas / transactions.length : 0,
    });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Transactions
          </CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {stats.totalTransactions}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Across all chains
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Volume
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            ${stats.totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Transaction volume
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Success Rate
          </CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {stats.successRate.toFixed(1)}%
          </div>
          <p className="text-xs text-success flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3" />
            Excellent performance
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Avg Gas Fee
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            ${(stats.avgGasFee * 3000).toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Per transaction
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
