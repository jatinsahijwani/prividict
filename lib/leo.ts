import { WalletNotConnectedError } from "@demox-labs/aleo-wallet-adapter-base";
import { WalletContextState } from "@demox-labs/aleo-wallet-adapter-react";
import { Transaction, WalletAdapterNetwork } from "@demox-labs/aleo-wallet-adapter-base";

export interface Market {
  id: string;
  question: string;
  totalYes: number;
  totalNo: number;
  isResolved: boolean;
  resolvedOutcome?: "YES" | "NO";
}

function stringToField(str: string): string {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit int
  }

  // Make it positive
  const positive = Math.abs(hash);

  return positive.toString() + "field";
}


const PROGRAM_NAME = "jatin_prediction_market.aleo";
let wallet: WalletContextState | null = null;

/**
 * Initialize the module with the wallet context
 */
export function initAleoWallet(walletContext: WalletContextState) {
  wallet = walletContext;
}

/**
 * Build a transaction for a transition
 */
function buildTransaction(wallet: any,transitionName: string, inputs: any[]): Transaction {
  if (!wallet?.publicKey) throw new WalletNotConnectedError();
  console.log(inputs)
  return Transaction.createTransaction(
    wallet.publicKey,
    WalletAdapterNetwork.TestnetBeta,
    PROGRAM_NAME,
    transitionName,
    inputs,
    50000 // fee, adjust if needed
  );
}

/**
 * Wait for transaction confirmation
 */
async function waitForTx(transactionId: string) {
  if (!wallet?.transactionStatus) return;
  await wallet.transactionStatus(transactionId);
}

/**
 * Fetch all markets for the connected wallet
 */
export async function getAllMarkets(): Promise<Market[]> {
  if (!wallet?.requestRecords) throw new WalletNotConnectedError();
  const records = await wallet.requestRecords(PROGRAM_NAME);

  return records.map((r: any) => ({
    id: r.id,
    question: r.data.question,
    totalYes: Number(r.data.total_yes),
    totalNo: Number(r.data.total_no),
    isResolved: Boolean(r.data.resolved),
  }));
}

/**
 * Create a new market
 */
export async function createMarket(wallet: any, question: string): Promise<Market[]> {
  if (!wallet?.connected || !wallet?.publicKey) {
  throw new Error("Wallet not connected");
  }
  const fieldQuestion = stringToField(question);
  console.log(fieldQuestion)
  const tx = buildTransaction(wallet, "create_market", [fieldQuestion]);
  console.log("Built Transaction:", tx);
  const transactionId = await wallet.requestTransaction(tx);
  console.log("Transaction ID:", transactionId);
  if (transactionId) await waitForTx(transactionId);

  return getAllMarkets();
}

/**
 * Place a bet
 */
export async function placeBet(
  wallet: any,
  question: string,
  amount: number,
  isYes: boolean
): Promise<Market[]> {
  
  const tx = buildTransaction(wallet, "place_bet", [
    question,
    `${amount}u64`,
    isYes ? "true" : "false",
  ]);
  const transactionId = await wallet.requestTransaction(tx);
  if (transactionId) await waitForTx(transactionId);

  return getAllMarkets();
}

/**
 * Resolve a market
 */
export async function resolveMarket(question: string): Promise<Market[]> {
  if (!wallet?.requestTransaction) throw new WalletNotConnectedError();

  const tx = buildTransaction("resolve_market", [question]);
  const transactionId = await wallet.requestTransaction(tx);
  if (transactionId) await waitForTx(transactionId);

  return getAllMarkets();
}
