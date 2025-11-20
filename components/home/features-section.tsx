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
    <section className="relative py-20 overflow-hidden">
      {/* Extended gradient background */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-background to-muted/50" />
      
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 text-center text-3xl font-bold">
            Everything You Need to Manage DeFi
          </h2>
          <p className="mb-12 text-center text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to simplify your DeFi experience across multiple blockchains
          </p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="border-primary/10 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                <CardHeader>
                  <div className="mb-2 inline-flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 text-primary border border-primary/20">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
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
      </div>
    </section>
  );
}

