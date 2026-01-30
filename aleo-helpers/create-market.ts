import { Account, ProgramManager, keyProvider, networkClient } from "./aleoClient";

// program name of your deployed Leo program
const PROGRAM_NAME = "jatin_prediction_market.aleo";
const TESTNET_URL = "https://api.explorer.provable.com/v1";

export async function createMarket(account: Account, question: string) {
  const programManager = new ProgramManager(TESTNET_URL, keyProvider);
  programManager.setAccount(account);

  // Convert question string to Leo field format
  const questionField = BigInt(
    question
      .split("")
      .map((c) => c.charCodeAt(0))
      .join("")
  ).toString() + "field";

  // Execute create_market transition
  const txId = await programManager.execute({
    programName: PROGRAM_NAME,
    functionName: "create_market",
    priorityFee: 0.0,
    privateFee: false,
    inputs: [questionField],
    keySearchParams: { cacheKey: `${PROGRAM_NAME}:create_market` },
  });

  return txId;
}
