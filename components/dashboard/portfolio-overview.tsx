"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { TrendingUp, TrendingDown, DollarSign, Coins, Percent } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

interface PortfolioStats {
  totalValue: number;
  change24h: number;
  changePercent: number;
  totalTokens: number;
  totalStaked: number;
  totalRewards: number;
}

export function PortfolioOverview({ userId }: { userId: string }) {
  const [stats, setStats] = useState<PortfolioStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolioStats();
  }, [userId]);

  const fetchPortfolioStats = async () => {
    const supabase = createClient();
    
    // Fetch portfolio positions
    const { data: positions } = await supabase
      .from("portfolio_positions")
      .select("*, wallets!inner(user_id)")
      .eq("wallets.user_id", userId);

    // Fetch staking positions
    const { data: staking } = await supabase
      .from("staking_positions")
      .select("*, wallets!inner(user_id)")
      .eq("wallets.user_id", userId);

    // Calculate stats (mock data for demo)
    const totalValue = positions?.reduce((sum, pos) => sum + parseFloat(pos.usd_value || "0"), 0) || 0;
    const totalStaked = staking?.reduce((sum, pos) => sum + parseFloat(pos.usd_value || "0"), 0) || 0;
    const totalRewards = staking?.reduce((sum, pos) => sum + parseFloat(pos.rewards_earned || "0"), 0) || 0;

    setStats({
      totalValue: totalValue + totalStaked,
      change24h: totalValue * 0.032, // Mock 3.2% gain
      changePercent: 3.2,
      totalTokens: positions?.length || 0,
      totalStaked,
      totalRewards,
    });

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-1" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Portfolio Value
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            ${stats?.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-success flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3" />
            +${stats?.change24h.toFixed(2)} ({stats?.changePercent}%) 24h
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Staked
          </CardTitle>
          <Coins className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            ${stats?.totalStaked.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Across {stats?.totalTokens} positions
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Rewards Earned
          </CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            ${stats?.totalRewards.toFixed(2)}
          </div>
          <p className="text-xs text-success flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3" />
            Active across chains
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Avg APY
          </CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            8.4%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Weighted average
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
