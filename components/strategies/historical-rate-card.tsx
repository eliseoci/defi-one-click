"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HistoricalRate, mockHistoricalRates } from "@/lib/mock-data";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from "recharts";

type ChartView = "APY" | "TVL" | "Price";

interface HistoricalRateCardProps {
  data?: HistoricalRate[];
}

export default function HistoricalRateCard({ data = mockHistoricalRates }: HistoricalRateCardProps) {
  const [chartView, setChartView] = useState<ChartView>("APY");
  const metricKey = chartView === "APY" ? "apy" : "tvl";

  return (
    <Card className="min-w-0">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <CardTitle>Historical rate</CardTitle>
          <div className="flex flex-wrap gap-2">
            {(["APY", "TVL", "Price"] as ChartView[]).map((view) => (
              <Button
                key={view}
                size="sm"
                variant={chartView === view ? "default" : "outline"}
                onClick={() => setChartView(view)}
              >
                {view}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pl-0 pr-6">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3b3b3b" />
            <XAxis
              dataKey="date"
              stroke="#FFFFFF"
              fontSize={12}
              tick={{ fill: "#E2E8F0" }}
            />
            <YAxis
              stroke="#FFFFFF"
              fontSize={12}
              tick={{ fill: "#E2E8F0" }}
              domain={chartView === "APY" ? [0, 20] : undefined}
            />
            <Tooltip
              cursor={false}
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
                color: "#0f172a",
              }}
              labelStyle={{ color: "#475569" }}
            />
            <Line
              type="monotone"
              dataKey={metricKey}
              stroke="#ffffff"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap items-center gap-4 px-3 sm:px-4 mt-4 text-xs text-muted-foreground">
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked className="rounded" />
            <span>AVERAGE</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked className="rounded" />
            <span>MOVING AVERAGE</span>
          </label>
          <div className="ml-auto flex gap-2 flex-wrap">
            <Button size="sm" variant="ghost" className="h-6 text-xs">1D</Button>
            <Button size="sm" variant="ghost" className="h-6 text-xs">1W</Button>
            <Button size="sm" variant="ghost" className="h-6 text-xs">1M</Button>
            <Button size="sm" variant="default" className="h-6 text-xs">1Y</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
