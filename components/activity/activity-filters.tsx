"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUPPORTED_CHAINS } from "@/lib/types";
import { Separator } from "@/components/ui/separator";

export function ActivityFilters() {
  const actions = [
    { id: "bridge", label: "Bridge" },
    { id: "swap", label: "Swap" },
    { id: "stake", label: "Stake" },
    { id: "unstake", label: "Unstake" },
  ];

  const statuses = [
    { id: "completed", label: "Completed" },
    { id: "pending", label: "Pending" },
    { id: "failed", label: "Failed" },
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Time Range</Label>
          <Select defaultValue="7d">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-sm font-medium">Action Type</Label>
          <div className="space-y-2">
            {actions.map((action) => (
              <div key={action.id} className="flex items-center space-x-2">
                <Checkbox id={action.id} />
                <label
                  htmlFor={action.id}
                  className="text-sm text-foreground cursor-pointer"
                >
                  {action.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-sm font-medium">Status</Label>
          <div className="space-y-2">
            {statuses.map((status) => (
              <div key={status.id} className="flex items-center space-x-2">
                <Checkbox id={status.id} />
                <label
                  htmlFor={status.id}
                  className="text-sm text-foreground cursor-pointer"
                >
                  {status.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-sm font-medium">Chain</Label>
          <div className="space-y-2">
            {SUPPORTED_CHAINS.map((chain) => (
              <div key={chain.id} className="flex items-center space-x-2">
                <Checkbox id={chain.id} />
                <label
                  htmlFor={chain.id}
                  className="text-sm text-foreground cursor-pointer"
                >
                  {chain.icon} {chain.name}
                </label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
