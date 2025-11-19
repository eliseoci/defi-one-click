"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface StrategiesHeaderProps {
  walletAddress: string;
}

export function StrategiesHeader({ walletAddress }: StrategiesHeaderProps) {
  const [showBalance, setShowBalance] = useState(true);

  // Mock data - in production, fetch from blockchain/API
  const stats = {
    deposited: 0.96,
    monthlyYield: 0,
    dailyYield: 0,
    avgApy: 0,
    platformTvl: 216.62,
    vaultsCount: 1079,
  };

  return (
    <Card className="border-0 bg-card/50">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold">Portfolio</h1>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowBalance(!showBalance)}
            >
              {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-xs text-muted-foreground">Platform Stats</div>
          </div>
        </div>

        <div className="mt-4 md:mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6 md:gap-6">
          <div>
            <div className="text-xs text-muted-foreground uppercase mb-1">Deposited</div>
            <div className="text-lg md:text-2xl font-bold">
              {showBalance ? `$${stats.deposited}` : '••••'}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase mb-1">Monthly</div>
            <div className="text-lg md:text-2xl font-bold">
              {showBalance ? `$${stats.monthlyYield}` : '••••'}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase mb-1">Daily</div>
            <div className="text-lg md:text-2xl font-bold">
              {showBalance ? `$${stats.dailyYield}` : '••••'}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase mb-1">Avg. APY</div>
            <div className="text-lg md:text-2xl font-bold">{stats.avgApy}%</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase mb-1">TVL</div>
            <div className="text-lg md:text-2xl font-bold">${stats.platformTvl}M</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase mb-1">Vaults</div>
            <div className="text-lg md:text-2xl font-bold">{stats.vaultsCount}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
