/**
 * Midnight Passport Contract - Real Deployment Script (SDK v3)
 * 
 * Based on Echo Platform deployment pattern.
 * Deploys the passport.compact contract to Midnight network.
 * 
 * Prerequisites:
 * 1. Contract compiled: compact compile pass.compact ./artifacts/
 * 2. Docker services running (local) OR testnet access
 * 3. Funded wallet with tNIGHT tokens
 */

import { WebSocket } from "ws";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline/promises";
import { Buffer } from "buffer";
import * as Rx from "rxjs";
import { pino } from "pino";

// SDK v3 imports
import * as ledger from "@midnight-ntwrk/ledger-v7";
import { unshieldedToken } from "@midnight-ntwrk/ledger-v7";
import { setNetworkId, getNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { deployContract } from "@midnight-ntwrk/midnight-js-contracts";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";
import { NodeZkConfigProvider } from "@midnight-ntwrk/midnight-js-node-zk-config-provider";
import { CompiledContract } from "@midnight-ntwrk/compact-js";
import { WalletFacade } from "@midnight-ntwrk/wallet-sdk-facade";
import { DustWallet } from "@midnight-ntwrk/wallet-sdk-dust-wallet";
import { HDWallet, Roles, generateRandomSeed } from "@midnight-ntwrk/wallet-sdk-hd";
import { ShieldedWallet } from "@midnight-ntwrk/wallet-sdk-shielded";
import {
  createKeystore,
  InMemoryTransactionHistoryStorage,
  PublicKey,
  UnshieldedWallet,
  type UnshieldedKeystore,
} from "@midnight-ntwrk/wallet-sdk-unshielded-wallet";
import type {
  WalletProvider,
  MidnightProvider,
} from "@midnight-ntwrk/midnight-js-types";
import { verifySignature } from "@midnight-ntwrk/ledger";

// Required for GraphQL subscriptions (wallet sync)
// @ts-expect-error: Needed for WebSocket in Node.js
globalThis.WebSocket = WebSocket;

// ============================================================================
// TYPES
// ============================================================================

interface WalletContext {
  wallet: WalletFacade;
  shieldedSecretKeys: ledger.ZswapSecretKeys;
  dustSecretKey: ledger.DustSecretKey;
  unshieldedKeystore: UnshieldedKeystore;
}

interface NetworkConfig {
  indexer: string;
  indexerWS: string;
  node: string;
  proofServer: string;
}

interface PassportPrivateState {
  passportData?: {
    user_age: bigint;
    expiry_timestamp: bigint;
    id_number: Uint8Array;
    secret_key: Uint8Array;
    issuer_signature: Uint8Array;
  };
}

// ============================================================================
// LOGGER
// ============================================================================

const logger = pino({
  level: 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
});

// ============================================================================
// NETWORK CONFIGURATION
// ============================================================================

function getNetworkConfig(network: string): NetworkConfig {
  if (network === "local") {
    return {
      indexer: "http://10.255.255.254:8088",
      indexerWS: "ws://10.255.255.254:8088",
      node: "http://10.255.255.254:9944",
      proofServer: "http://10.255.255.254:6300",
    };
  } else {
    // testnet
    return {
      indexer: "https://indexer.testnet.midnight.network",
      indexerWS: "wss://indexer.testnet.midnight.network",
      node: "wss://rpc.testnet.midnight.network",
      proofServer: "http://localhost:6300", // Must run locally
    };
  }
}

// ============================================================================
// WITNESSES
// ============================================================================

/**
 * Creates witness implementations for the passport contract.
 * These run off-chain in TypeScript and provide private data to circuits.
 */
function createPassportWitnesses(privateState: PassportPrivateState) {
  return {
    get_passport_data: (ctx: any) => {
      logger.debug('Witness: get_passport_data called');
      if (!privateState.passportData) {
        throw new Error('Passport data not initialized in private state');
      }
      return [ctx.privateState, privateState.passportData];
    },

    check_issuer_signature: (ctx: any, data: Uint8Array, signature: Uint8Array, public_key: Uint8Array) => {
      logger.debug('Witness: check_issuer_signature called');
      const isValid = verifySignature(
        Buffer.from(public_key).toString('hex'),
        data,
        Buffer.from(signature).toString('hex')
      );
      logger.debug({ isValid }, 'Signature verification result');
      return [ctx.privateState, isValid];
    },
  };
}

// ============================================================================
// WALLET SETUP (from Echo example)
// ============================================================================

function deriveKeysFromSeed(seed: string) {
  const hdWallet = HDWallet.fromSeed(Buffer.from(seed, "hex"));
  if (hdWallet.type !== "seedOk") {
    throw new Error("Failed to initialize HDWallet from seed");
  }

  const derivationResult = hdWallet.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);

  if (derivationResult.type !== "keysDerived") {
    throw new Error("Failed to derive keys");
  }

  hdWallet.hdWallet.clear();
  return derivationResult.keys;
}

function buildShieldedConfig(config: NetworkConfig) {
  return {
    networkId: getNetworkId(),
    indexerClientConnection: {
      indexerHttpUrl: config.indexer,
      indexerWsUrl: config.indexerWS,
    },
    provingServerUrl: new URL(config.proofServer),
    relayURL: new URL(config.node.replace(/^http/, "ws")),
  };
}

function buildUnshieldedConfig(config: NetworkConfig) {
  return {
    networkId: getNetworkId(),
    indexerClientConnection: {
      indexerHttpUrl: config.indexer,
      indexerWsUrl: config.indexerWS,
    },
    txHistoryStorage: new InMemoryTransactionHistoryStorage(),
  };
}

function buildDustConfig(config: NetworkConfig) {
  return {
    networkId: getNetworkId(),
    costParameters: {
      additionalFeeOverhead: 300_000_000_000_000n,
      feeBlocksMargin: 5,
    },
    indexerClientConnection: {
      indexerHttpUrl: config.indexer,
      indexerWsUrl: config.indexerWS,
    },
    provingServerUrl: new URL(config.proofServer),
    relayURL: new URL(config.node.replace(/^http/, "ws")),
  };
}

async function buildWallet(config: NetworkConfig, seed: string): Promise<WalletContext> {
  logger.info('Building wallet from seed');
  const keys = deriveKeysFromSeed(seed);
  const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
  const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
  const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], getNetworkId());

  const shieldedWallet = ShieldedWallet(buildShieldedConfig(config))
    .startWithSecretKeys(shieldedSecretKeys);
  const unshieldedWallet = UnshieldedWallet(buildUnshieldedConfig(config))
    .startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore));
  const dustWallet = DustWallet(buildDustConfig(config))
    .startWithSecretKey(dustSecretKey, ledger.LedgerParameters.initialParameters().dust);

  const wallet = new WalletFacade(shieldedWallet, unshieldedWallet, dustWallet);
  await wallet.start(shieldedSecretKeys, dustSecretKey);

  logger.info({ address: unshieldedKeystore.getBech32Address() }, 'Wallet initialized');
  return { wallet, shieldedSecretKeys, dustSecretKey, unshieldedKeystore };
}

// ============================================================================
// WALLET SYNC & FUNDING
// ============================================================================

async function waitForSync(ctx: WalletContext) {
  logger.info('Waiting for wallet to sync...');
  const syncedState = await Rx.firstValueFrom(
    ctx.wallet.state().pipe(
      Rx.filter((s) => s.isSynced),
    ),
  );
  const balance = syncedState.unshielded.balances[unshieldedToken().raw] ?? 0n;
  logger.info({ balance: balance.toString() }, 'Wallet synced');
  return balance;
}

async function registerForDust(ctx: WalletContext) {
  const state = await Rx.firstValueFrom(
    ctx.wallet.state().pipe(Rx.filter((s) => s.isSynced)),
  );

  if (state.dust.availableCoins.length > 0) {
    logger.info('Dust tokens already available');
    return;
  }

  const nightUtxos = state.unshielded.availableCoins.filter(
    (coin: any) => coin.meta?.registeredForDustGeneration !== true,
  );

  if (nightUtxos.length > 0) {
    logger.info({ count: nightUtxos.length }, 'Registering NIGHT UTXOs for dust generation');
    const recipe = await ctx.wallet.registerNightUtxosForDustGeneration(
      nightUtxos,
      ctx.unshieldedKeystore.getPublicKey(),
      (payload) => ctx.unshieldedKeystore.signData(payload),
    );
    const finalized = await ctx.wallet.finalizeRecipe(recipe);
    await ctx.wallet.submitTransaction(finalized);
  }

  logger.info('Waiting for dust tokens to generate...');
  await Rx.firstValueFrom(
    ctx.wallet.state().pipe(
      Rx.throttleTime(5_000),
      Rx.filter((s) => s.isSynced),
      Rx.filter((s) => s.dust.walletBalance(new Date()) > 0n),
    ),
  );
  logger.info('Dust tokens available');
}

// ============================================================================
// INTENT SIGNING WORKAROUND (SDK v3 bug fix)
// ============================================================================

function signTransactionIntents(
  tx: { intents?: Map<number, any> },
  signFn: (payload: Uint8Array) => ledger.Signature,
  proofMarker: "proof" | "pre-proof",
): void {
  if (!tx.intents || tx.intents.size === 0) return;

  for (const segment of tx.intents.keys()) {
    const intent = tx.intents.get(segment);
    if (!intent) continue;

    const cloned = ledger.Intent.deserialize<
      ledger.SignatureEnabled,
      ledger.Proofish,
      ledger.PreBinding
    >(
      "signature",
      proofMarker,
      "pre-binding",
      intent.serialize(),
    );

    const sigData = cloned.signatureData(segment);
    const signature = signFn(sigData);

    if (cloned.fallibleUnshieldedOffer) {
      const sigs = cloned.fallibleUnshieldedOffer.inputs.map(
        (_: ledger.UtxoSpend, i: number) =>
          cloned.fallibleUnshieldedOffer!.signatures.at(i) ?? signature,
      );
      cloned.fallibleUnshieldedOffer =
        cloned.fallibleUnshieldedOffer.addSignatures(sigs);
    }

    if (cloned.guaranteedUnshieldedOffer) {
      const sigs = cloned.guaranteedUnshieldedOffer.inputs.map(
        (_: ledger.UtxoSpend, i: number) =>
          cloned.guaranteedUnshieldedOffer!.signatures.at(i) ?? signature,
      );
      cloned.guaranteedUnshieldedOffer =
        cloned.guaranteedUnshieldedOffer.addSignatures(sigs);
    }

    tx.intents.set(segment, cloned);
  }
}

// ============================================================================
// WALLET & MIDNIGHT PROVIDER BRIDGE
// ============================================================================

async function createWalletAndMidnightProvider(
  ctx: WalletContext,
): Promise<WalletProvider & MidnightProvider> {
  const state = await Rx.firstValueFrom(
    ctx.wallet.state().pipe(Rx.filter((s) => s.isSynced)),
  );

  return {
    getCoinPublicKey() {
      return state.shielded.coinPublicKey.toHexString();
    },
    getEncryptionPublicKey() {
      return state.shielded.encryptionPublicKey.toHexString();
    },
    async balanceTx(tx: any, ttl?: Date) {
      const recipe = await ctx.wallet.balanceUnboundTransaction(
        tx,
        {
          shieldedSecretKeys: ctx.shieldedSecretKeys,
          dustSecretKey: ctx.dustSecretKey,
        },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );

      const signFn = (payload: Uint8Array) => ctx.unshieldedKeystore.signData(payload);
      signTransactionIntents(recipe.baseTransaction, signFn, "proof");
      if (recipe.balancingTransaction) {
        signTransactionIntents(recipe.balancingTransaction, signFn, "pre-proof");
      }

      return ctx.wallet.finalizeRecipe(recipe);
    },
    submitTx(tx: any) {
      return ctx.wallet.submitTransaction(tx) as any;
    },
  };
}

// ============================================================================
// MAIN DEPLOYMENT
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const network = args.includes('--testnet') ? 'testnet' : 'local';
  const config = getNetworkConfig(network);

  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   Midnight Privacy Passport - Deployment System       ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log();
  console.log(`Network: ${network}`);
  console.log(`Node: ${config.node}`);
  console.log(`Indexer: ${config.indexer}`);
  console.log(`Proof Server: ${config.proofServer}`);
  console.log();

  // Set network ID
  setNetworkId(network === 'local' ? 'undeployed' : 'testnet');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    // ---- Wallet Setup ----
    console.log('[1/4] Wallet Setup');
    console.log('─'.repeat(60));

    let walletSeed: string;
    if (network === 'local') {
      walletSeed = "0000000000000000000000000000000000000000000000000000000000000001";
      console.log('Using genesis wallet (pre-funded on local devnet)');
    } else {
      const choice = await rl.question('Do you have an existing wallet seed? (y/n): ');
      if (choice.toLowerCase() === 'y') {
        walletSeed = await rl.question('Enter your 64-character hex seed: ');
        walletSeed = walletSeed.trim();
        if (!/^[0-9a-fA-F]{64}$/.test(walletSeed)) {
          throw new Error('Seed must be exactly 64 hex characters');
        }
      } else {
        const seed = generateRandomSeed();
        walletSeed = Buffer.from(seed).toString('hex');
        console.log();
        console.log('⚠️  IMPORTANT: Save this seed securely!');
        console.log(`Seed: ${walletSeed}`);
        console.log();
      }
    }

    const walletCtx = await buildWallet(config, walletSeed);
    await waitForSync(walletCtx);
    await registerForDust(walletCtx);
    console.log();

    // ---- Issuer Setup ----
    console.log('[2/4] Issuer Authority Setup');
    console.log('─'.repeat(60));

    const issuerPublicKey = new Uint8Array(32);
    crypto.getRandomValues(issuerPublicKey);
    console.log(`Issuer Public Key: ${Buffer.from(issuerPublicKey).toString('hex')}`);
    console.log('⚠️  Save this key - needed to verify passport signatures!');
    console.log();

    // ---- Deploy Contract ----
    console.log('[3/4] Deploying Passport Contract');
    console.log('─'.repeat(60));

    const contractsPath = path.resolve(process.cwd(), 'contracts');
    const zkPath = path.join(contractsPath, 'artifacts');

    // Verify artifacts exist
    if (!fs.existsSync(path.join(zkPath, 'contract', 'index.cjs'))) {
      throw new Error('Contract not compiled. Run: compact compile pass.compact ./artifacts/');
    }

    // Import compiled contract
    const PassportModule = await import(path.join(zkPath, 'contract', 'index.js'));

    // Create compiled contract with witnesses (CRITICAL!)
    const passportCompiledContract = (CompiledContract.make(
      "passport",
      PassportModule.Contract,
    ) as any).pipe(
      (self: any) => (CompiledContract as any).withWitnesses(
        self, 
        createPassportWitnesses({ passportData: undefined })
      ),
      (self: any) => (CompiledContract as any).withCompiledFileAssets(self, zkPath),
    );

    // Create providers
    const walletAndMidnightProvider = await createWalletAndMidnightProvider(walletCtx);
    const zkConfigProvider = new NodeZkConfigProvider(zkPath);
    const publicDataProvider = indexerPublicDataProvider(config.indexer, config.indexerWS);

    const providers = {
      privateStateProvider: levelPrivateStateProvider({
        privateStateStoreName: "passport-private-state",
        walletProvider: walletAndMidnightProvider,
      }),
      publicDataProvider,
      zkConfigProvider,
      proofProvider: httpClientProofProvider(config.proofServer, zkConfigProvider),
      walletProvider: walletAndMidnightProvider,
      midnightProvider: walletAndMidnightProvider,
    };

    // Deploy with constructor args
    logger.info('Deploying contract...');
    const deployed = await deployContract(providers, {
      compiledContract: passportCompiledContract,
      privateStateId: "passportPrivateState",
      initialPrivateState: { passportData: undefined },
      args: [issuerPublicKey], // Constructor argument!
    } as any);

    const contractAddress = deployed.deployTxData.public.contractAddress;
    logger.info({ contractAddress }, '✅ Contract deployed successfully');
    console.log();

    // ---- Save Deployment Info ----
    console.log('[4/4] Saving Deployment Info');
    console.log('─'.repeat(60));

    const deployment = {
      network,
      contractAddress,
      issuerPublicKeyHex: Buffer.from(issuerPublicKey).toString('hex'),
      walletSeed,
      deployedAt: new Date().toISOString(),
      note: "KEEP THIS FILE SECURE - contains issuer key and wallet seed",
    };

    fs.writeFileSync('deployment.json', JSON.stringify(deployment, null, 2));
    console.log('Saved to deployment.json');
    console.log();

    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║              Deployment Complete! ✅                   ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log();
    console.log(`Contract Address: ${contractAddress}`);
    console.log(`Issuer Public Key: ${Buffer.from(issuerPublicKey).toString('hex')}`);
    console.log();

  } catch (error) {
    console.error('\n❌ Deployment failed:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main().catch(console.error);