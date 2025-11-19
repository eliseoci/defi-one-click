import { ConnectWalletButton } from "@/components/wallets/connect-wallet-button";

export function CTASection() {
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="mx-auto max-w-3xl rounded-lg border bg-card p-8 text-center md:p-12">
        <h2 className="mb-4 text-3xl font-bold">Ready to Simplify Your DeFi?</h2>
        <p className="mb-8 text-lg text-muted-foreground">
          Connect your wallet and start managing your multichain portfolio in seconds
        </p>
        <ConnectWalletButton size="lg" className="w-full sm:w-auto justify-center" />
      </div>
    </section>
  );
}

