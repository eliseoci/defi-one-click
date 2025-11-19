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
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Portfolio</h1>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowBalance(!showBalance)}
              >
                {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Platform</div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          <div>
            <div className="text-xs text-muted-foreground uppercase mb-1">Deposited</div>
            <div className="text-2xl font-bold">
              {showBalance ? `$${stats.deposited}` : '••••'}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase mb-1">Monthly Yield</div>
            <div className="text-2xl font-bold">
              {showBalance ? `$${stats.monthlyYield}` : '••••'}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase mb-1">Daily Yield</div>
            <div className="text-2xl font-bold">
              {showBalance ? `$${stats.dailyYield}` : '••••'}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase mb-1">Avg. APY</div>
            <div className="text-2xl font-bold">{stats.avgApy}%</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase mb-1">TVL</div>
            <div className="text-2xl font-bold">${stats.platformTvl}M</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase mb-1">Vaults</div>
            <div className="text-2xl font-bold">{stats.vaultsCount}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
