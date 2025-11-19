"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { SUPPORTED_CHAINS, type ChainType } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

interface ChainBalance {
  chain: ChainType;
  balance: number;
  tokens: number;
}

export function ChainBalances({ userId }: { userId: string }) {
  const [balances, setBalances] = useState<ChainBalance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChainBalances();
  }, [userId]);

  const fetchChainBalances = async () => {
    const supabase = createClient();
    
    const { data: positions } = await supabase
      .from("portfolio_positions")
      .select("*, wallets!inner(user_id)")
      .eq("wallets.user_id", userId);

    // Group by chain
    const chainMap = new Map<ChainType, { balance: number; tokens: number }>();
    
    positions?.forEach((pos) => {
      const current = chainMap.get(pos.chain) || { balance: 0, tokens: 0 };
      chainMap.set(pos.chain, {
        balance: current.balance + parseFloat(pos.usd_value || "0"),
        tokens: current.tokens + 1,
      });
    });

    const chainBalances = Array.from(chainMap.entries()).map(([chain, data]) => ({
      chain,
      ...data,
    }));

    setBalances(chainBalances);
    setLoading(false);
  };

  const getChainInfo = (chainId: ChainType) => {
    return SUPPORTED_CHAINS.find((c) => c.id === chainId);
  };

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Chain Balances</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (balances.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Chain Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No balances found. Connect a wallet to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Chain Balances</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {balances.map((balance) => {
          const chainInfo = getChainInfo(balance.chain);
          return (
            <div
              key={balance.chain}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold"
                  style={{ backgroundColor: chainInfo?.color + "20", color: chainInfo?.color }}
                >
                  {chainInfo?.icon}
                </div>
                <div>
                  <p className="font-medium text-foreground">{chainInfo?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {balance.tokens} token{balance.tokens !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">
                  ${balance.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
