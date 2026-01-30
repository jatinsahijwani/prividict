import { AleoNetworkClient, ProgramManager, AleoKeyProvider, Account } from "@provablehq/sdk";

const TESTNET_URL = "https://api.explorer.provable.com/v1";
const networkClient = new AleoNetworkClient(TESTNET_URL);

// Key provider (handles program inputs / proofs caching)
const keyProvider = new AleoKeyProvider();
keyProvider.useCache(true);

export { networkClient, keyProvider, Account, ProgramManager };
