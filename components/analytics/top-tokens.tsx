"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from 'lucide-react';

export function TopTokens({ userId }: { userId: string }) {
  const tokens = [
    { symbol: 'ETH', name: 'Ethereum', balance: '5.234', value: '$15,702.00', change: '+5.2%', trend: 'up' },
    { symbol: 'USDC', name: 'USD Coin', balance: '8,432.12', value: '$8,432.12', change: '0.0%', trend: 'neutral' },
    { symbol: 'wstETH', name: 'Wrapped Staked ETH', balance: '2.145', value: '$6,435.00', change: '+7.8%', trend: 'up' },
    { symbol: 'ARB', name: 'Arbitrum', balance: '1,234.56', value: '$2,469.12', change: '-2.1%', trend: 'down' },
    { symbol: 'OP', name: 'Optimism', balance: '456.78', value: '$1,370.34', change: '+3.4%', trend: 'up' },
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Top Holdings</CardTitle>
        <CardDescription>Your largest token positions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tokens.map((token) => (
            <div key={token.symbol} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                  {token.symbol[0]}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{token.symbol}</p>
                  <p className="text-xs text-muted-foreground">{token.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">{token.value}</p>
                <div className="flex items-center justify-end gap-1 text-xs">
                  {token.trend === 'up' && <TrendingUp className="h-3 w-3 text-success" />}
                  {token.trend === 'down' && <TrendingDown className="h-3 w-3 text-destructive" />}
                  <span className={token.trend === 'up' ? 'text-success' : token.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'}>
                    {token.change}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
