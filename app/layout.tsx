import type { Metadata } from "next";
import { Geist } from 'next/font/google';
import "./globals.css";
import { Providers } from "@/components/providers";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DeFi Hub - Multichain Portfolio Manager",
  description: "Manage your DeFi portfolio across multiple chains with one-step execution",
    generator: 'v0.app'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
