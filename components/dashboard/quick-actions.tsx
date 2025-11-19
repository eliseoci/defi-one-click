"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, Badge as Bridge, Coins, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function QuickActions() {
  const router = useRouter();

  const actions = [
    {
      icon: Bridge,
      label: "Bridge",
      description: "Cross-chain transfer",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      action: () => router.push("/execute?action=bridge"),
    },
    {
      icon: ArrowRightLeft,
      label: "Swap",
      description: "Exchange tokens",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      action: () => router.push("/execute?action=swap"),
    },
    {
      icon: Coins,
      label: "Stake",
      description: "Earn rewards",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      action: () => router.push("/execute?action=stake"),
    },
    {
      icon: Zap,
      label: "One-Step",
      description: "Bridge + Swap + Stake",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      action: () => router.push("/execute?action=one-step"),
    },
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="h-auto flex-col items-start p-4 gap-2 hover:bg-secondary"
              onClick={action.action}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.bgColor}`}>
                <action.icon className={`h-5 w-5 ${action.color}`} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
