import { Users, DollarSign, Layers, TrendingUp } from 'lucide-react';

const stats = [
  {
    icon: Layers,
    value: "6+",
    label: "Supported Chains",
    description: "Multi-chain compatibility"
  },
  {
    icon: Users,
    value: "10K+",
    label: "Active Users",
    description: "Growing community"
  },
  {
    icon: DollarSign,
    value: "$100M+",
    label: "Total Volume",
    description: "Transactions processed"
  },
  {
    icon: TrendingUp,
    value: "99.9%",
    label: "Uptime",
    description: "Reliable service"
  }
];

export function StatsSection() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Gradient background continuation */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-black via-purple-950/20 to-background" />
      
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 max-w-6xl mx-auto">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="relative group text-center"
              >
                <div className="mb-4 inline-flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 text-primary border border-primary/20">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-foreground mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stat.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

