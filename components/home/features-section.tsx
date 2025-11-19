import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, Zap, Shield } from 'lucide-react';

const features = [
  {
    icon: Wallet,
    title: "Multichain Portfolio",
    description: "Track all your assets across 6 chains in one unified dashboard"
  },
  {
    icon: Zap,
    title: "One-Step Execution",
    description: "Bridge, swap, and stake in a single transaction with optimized routing"
  },
  {
    icon: TrendingUp,
    title: "Real-Time Analytics",
    description: "Monitor portfolio performance with live charts and detailed metrics"
  },
  {
    icon: Shield,
    title: "Transaction Simulation",
    description: "Preview outcomes and fees before executing any transaction"
  }
];

export function FeaturesSection() {
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-12 text-center text-3xl font-bold">
          Everything You Need to Manage DeFi
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title}>
                <CardHeader>
                  <Icon className="mb-2 h-8 w-8 text-primary" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

