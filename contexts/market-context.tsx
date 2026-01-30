'use client';

import React, { createContext, useContext, useState, useEffect } from "react";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";

export type Market = {
  id: string;
  owner: string;
  question: string; // converted from field
  totalYes: number;
  totalNo: number;
  isResolved: boolean;
};

type MarketContextType = {
  markets: Market[];
  refreshMarkets: () => Promise<void>;
};

const MarketContext = createContext<MarketContextType | null>(null);

export function MarketProvider({ children }: { children: React.ReactNode }) {

  const { requestRecords, publicKey } = useWallet();

  const [markets, setMarkets] = useState<Market[]>([]);

  const refreshMarkets = async () => {
    if (!publicKey || !requestRecords) return;

    try {
      const records = await requestRecords("jatin_prediction_market.aleo");

      if (!records || records.length === 0) {
        setMarkets([]);
        return;
      }

      const parsed: Market[] = [];

      for (const record of records) {

        // Aleo record might be JSON string or object
        const rec = typeof record === "string" ? JSON.parse(record) : record;
        const data = rec.data;
        if (!data) continue;

        parsed.push({
          id: rec.id ?? crypto.randomUUID(),
          owner: data.owner,
          question: String(data.question), // convert field → string
          totalYes: Number(data.total_yes),
          totalNo: Number(data.total_no),
          isResolved: data.resolved === true || data.resolved === "true",
        });
      }

      setMarkets(parsed);

    } catch (err) {
      console.error("Failed to load markets:", err);
      setMarkets([]);
    }
  };

  // Refresh markets automatically when wallet connects
  useEffect(() => {
    if (publicKey) {
      refreshMarkets();
    }
  }, [publicKey]);

  return (
    <MarketContext.Provider value={{ markets, refreshMarkets }}>
      {children}
    </MarketContext.Provider>
  );
}

export function useMarkets() {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error("useMarkets must be inside MarketProvider");
  return ctx;
}
