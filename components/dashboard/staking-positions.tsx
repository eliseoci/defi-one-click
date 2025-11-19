"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { type StakingPosition } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from 'lucide-react';

export function StakingPositions({ userId }: { userId: string }) {
  const [positions, setPositions] = useState<StakingPosition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStakingPositions();
  }, [userId]);

  const fetchStakingPositions = async () => {
    const supabase = createClient();
    
    const { data } = await supabase
      .from("staking_positions")
      .select("*, wallets!inner(user_id)")
      .eq("wallets.user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    setPositions(data || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Staking Positions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (positions.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Staking Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No staking positions yet. Start earning rewards!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Staking Positions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {positions.map((position) => (
          <div
            key={position.id}
            className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-foreground">
                  {position.token_symbol}
                </p>
                <Badge variant="outline" className="text-xs">
                  {position.protocol}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Staked: {parseFloat(position.staked_amount).toFixed(4)} {position.token_symbol}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-success text-sm font-semibold mb-1">
                <TrendingUp className="h-3 w-3" />
                {position.apy}% APY
              </div>
              <p className="text-xs text-muted-foreground">
                Rewards: {parseFloat(position.rewards_earned).toFixed(4)}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
