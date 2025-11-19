"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from 'lucide-react';

export function PerformanceMetrics({ userId }: { userId: string }) {
  const metrics = [
    { label: '24h Change', value: '+$432.18', percent: '+3.2%', trend: 'up' },
    { label: '7d Change', value: '+$1,245.67', percent: '+8.5%', trend: 'up' },
    { label: '30d Change', value: '+$3,892.41', percent: '+28.7%', trend: 'up' },
    { label: 'All Time', value: '+$7,124.89', percent: '+71.2%', trend: 'up' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.label} className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.label}
            </CardTitle>
            {metric.trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {metric.value}
            </div>
            <p className={`text-xs mt-1 ${metric.trend === 'up' ? 'text-success' : 'text-destructive'}`}>
              {metric.percent}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
