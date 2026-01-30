"use client";

import React, { useMemo } from "react";

import { WalletProvider } from "@demox-labs/aleo-wallet-adapter-react";
import { WalletModalProvider } from "@demox-labs/aleo-wallet-adapter-reactui";

import { LeoWalletAdapter } from "@demox-labs/aleo-wallet-adapter-leo";

import {
  DecryptPermission,
  WalletAdapterNetwork,
} from "@demox-labs/aleo-wallet-adapter-base";

import "@demox-labs/aleo-wallet-adapter-reactui/styles.css";

export default function Providers({ children }: { children: React.ReactNode }) {

  const wallets = useMemo(
    () => [
      new LeoWalletAdapter({
        appName: "PredictionMarket",
      }),
    ],
    []
  );

  return (
    <WalletProvider
      wallets={wallets}
      autoConnect
      decryptPermission={DecryptPermission.UponRequest}
      network={WalletAdapterNetwork.TestnetBeta}
    >
      <WalletModalProvider>
        {children}
      </WalletModalProvider>
    </WalletProvider>
  );
}
