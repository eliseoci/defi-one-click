import Link from "next/link";
import { ConnectWalletButton } from "@/components/wallets/connect-wallet-button";
import { Zap } from 'lucide-react';

const navItems = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Analytics", href: "/analytics" },
  { label: "Resources", href: "#resources" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">DeFi Hub</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        
        <ConnectWalletButton />
      </div>
    </header>
  );
}

