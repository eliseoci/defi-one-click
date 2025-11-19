import { ConnectWalletButton } from "@/components/wallets/connect-wallet-button";
import { Sparkles, ArrowRight } from 'lucide-react';

export function CTASection() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Gradient background */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-background" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[120px]" />
      </div>
      
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl rounded-2xl border border-primary/20 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl p-8 md:p-12 text-center shadow-2xl shadow-primary/5">
          <div className="mb-6 inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="h-8 w-8" />
          </div>
          
          <h2 className="mb-4 text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Ready to Simplify Your DeFi?
          </h2>
          <p className="mb-8 text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect your wallet and start managing your multichain portfolio in seconds. 
            No credit card required, no hidden fees.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <ConnectWalletButton size="lg" className="w-full sm:w-auto justify-center" />
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              Get started in less than 2 minutes
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

