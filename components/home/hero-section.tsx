import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Gradient Background - Similar to reference with cyan to purple orb */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black">
        {/* Large central orb - cyan to purple gradient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[900px] w-[900px] rounded-full bg-gradient-radial from-cyan-400/60 via-purple-600/70 to-purple-900/40 blur-[100px]" />
        
        {/* Additional layered orbs for depth */}
        <div className="absolute top-1/3 left-1/4 h-[700px] w-[700px] rounded-full bg-cyan-500/50 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[800px] w-[800px] rounded-full bg-purple-600/60 blur-[130px]" />
        
        {/* Accent highlights */}
        <div className="absolute top-1/4 right-1/3 h-[400px] w-[400px] rounded-full bg-pink-500/30 blur-[90px]" />
        <div className="absolute bottom-1/3 left-1/3 h-[500px] w-[500px] rounded-full bg-indigo-600/40 blur-[110px]" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight md:text-6xl">
            Manage Your Multichain DeFi Portfolio in{" "}
            <span className="text-primary">One Step</span>
          </h1>
          <p className="mb-8 text-pretty text-lg text-muted-foreground md:text-xl">
            Bridge, swap, and stake across Ethereum, Arbitrum, Optimism, Polygon, Base, and Solana
            with a single transaction. No more multiple steps, no more hassle.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/analytics">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-purple-900/40 border-purple-400/30 text-white hover:bg-purple-800/50 hover:border-purple-300/40 backdrop-blur-md transition-all">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

