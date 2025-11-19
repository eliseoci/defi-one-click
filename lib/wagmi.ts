import type { CreateConnectorFn } from "wagmi";
import { createConfig, http } from "wagmi";
import { arbitrum, base, mainnet, optimism, polygon } from "wagmi/chains";
import { coinbaseWallet, injected } from "wagmi/connectors";

const connectors: CreateConnectorFn[] = [
  injected({
    shimDisconnect: true,
  }),
  coinbaseWallet({
    appName: "DeFi Hub",
    preference: "all",
  }),
];

export const wagmiConfig = createConfig({
  ssr: true,
  chains: [mainnet, arbitrum, optimism, polygon, base],
  connectors,
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
    [base.id]: http(),
  },
});
