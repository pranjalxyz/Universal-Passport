import { IdentityProfile } from './types';

export const IDENTITY_PROFILES: IdentityProfile[] = [
  {
    id: '1',
    name: 'Valid Adult',
    age: 28,
    expiryDate: '2030-05-20',
    expiryTimestamp: 1905465600000,
    status: 'valid'
  },
  {
    id: '2',
    name: 'Underage User',
    age: 16,
    expiryDate: '2028-11-10',
    expiryTimestamp: 1857427200000,
    status: 'underage'
  },
  {
    id: '3',
    name: 'Expired Passport',
    age: 45,
    expiryDate: '2023-01-01',
    expiryTimestamp: 1672531200000,
    status: 'expired'
  }
];

export const COMPACT_CODE = `pragma language_version >=0.20.0;
import CompactStandardLibrary;

export struct PassportWitness {
    user_age: Uint<64>,
    expiry_timestamp: Uint<64>,
    id_number: Bytes<32>,
    secret_key: Bytes<32>,
    issuer_signature: Bytes<64>
}

witness get_passport_data(): PassportWitness;

witness check_issuer_signature(
    data: Bytes<32>,
    signature: Bytes<64>,
    public_key: Bytes<32>
): Boolean;

export ledger verified_registry: Map<Bytes<32>, Boolean>;
export ledger spent_nullifiers: Map<Bytes<32>, Boolean>;
export ledger issuer_public_key: Bytes<32>;

export circuit register(
    caller: Bytes<32>,
    required_age: Uint<64>,
    current_network_time: Uint<64>
): [] {
    if (verified_registry.lookup(disclose(caller)) == true) {
        return;
    }
    const witness_data = get_passport_data();
    const data_packet = persistentHash<[Uint<64>, Uint<64>, Bytes<32>]>(
        [witness_data.user_age, witness_data.expiry_timestamp, witness_data.id_number]
    );
    assert(
        check_issuer_signature(data_packet, witness_data.issuer_signature, issuer_public_key),
        "Invalid Issuer Signature"
    );
    const nullifier = persistentHash<Vector<2, Bytes<32>>>(
        [witness_data.id_number, witness_data.secret_key]
    );
    assert(spent_nullifiers.lookup(disclose(nullifier)) == false, "Identity already registered");
    assert(witness_data.user_age >= required_age, "Underage");
    assert(witness_data.expiry_timestamp > current_network_time, "Expired");
    spent_nullifiers.insert(disclose(nullifier), disclose(true));
    verified_registry.insert(disclose(caller), disclose(true));
}`;

export const WITNESS_CODE = `import { WitnessContext, Ledger } from '@midnight-ntwrk/compact-sdk';
import * as ed25519 from '@noble/ed25519'; // Example crypto lib

/**
 * 1. Define Private State (The Local Vault)
 * This interface matches the data stored in the browser's secure storage.
 * Note: We use 'bigint' for Compact 'Uint<64>' and 'Uint8Array' for 'Bytes<32>'.
 */
interface PrivateState {
    passportData: {
        user_age: bigint;
        expiry_timestamp: bigint;
        id_number: Uint8Array;
        secret_key: Uint8Array;
        issuer_signature: Uint8Array;
    };
}

/**
 * 2. Implement the Witness Provider
 * This object maps the .compact witness functions to TypeScript logic.
 * Every function receives 'ctx' (context) and must return [ctx, result].
 */
export const witnesses = {
    /**
     * Corresponds to: witness get_passport_data(): PassportWitness;
     * Fetches the private data from the user's local "vault".
     */
    get_passport_data: (
        ctx: WitnessContext<Ledger, PrivateState>
    ): [WitnessContext<Ledger, PrivateState>, any] => {
        // Access the private state directly from the context
        const { passportData } = ctx.privateState;
        
        console.log("Witness: Extracting private passport credentials...");
        
        // Return context and the struct matching PassportWitness
        // Note: JS numbers must be converted to BigInt for Uint<64>
        return [
            ctx, 
            {
                user_age: passportData.user_age,
                expiry_timestamp: passportData.expiry_timestamp,
                id_number: passportData.id_number,
                secret_key: passportData.secret_key,
                issuer_signature: passportData.issuer_signature
            }
        ];
    },

    /**
     * Corresponds to: witness check_issuer_signature(...): Boolean;
     * Performs cryptographic verification off-chain but proved in-circuit.
     */
    check_issuer_signature: async (
        ctx: WitnessContext<Ledger, PrivateState>,
        data_packet: Uint8Array,
        signature: Uint8Array,
        public_key: Uint8Array
    ): Promise<[WitnessContext<Ledger, PrivateState>, boolean]> => {
        // A. Serialization Match
        // The 'data_packet' is the raw byte output of the persistentHash 
        // calculated inside the circuit. It is passed here automatically.
        
        // B. Cryptographic Verification
        // We use a standard EdDSA library to verify the signature.
        // This runs locally on the user's device.
        const isValid = await ed25519.verify(signature, data_packet, public_key);

        // C. Error Handling
        // If false, we throw to abort proof generation immediately.
        // This prevents invalid proofs from ever being submitted to the network.
        if (!isValid) {
             throw new Error("Witness Error: Invalid Issuer Signature. Proof aborted.");
        }

        return [ctx, isValid];
    }
};`;

export const DEPLOYMENT_STEPS = [
    {
        title: "1. Compile",
        cmd: "compactc build --target midnight passport.compact",
        desc: "Generates zk-VM bytecode and client-side proof generation logic."
    },
    {
        title: "2. Proof Server",
        cmd: "midnight-proof-server --port 6300",
        desc: "Starts the local service that executes the 'prove' function safely."
    },
    {
        title: "3. Deploy",
        cmd: "midnight-cli deploy build/passport.compact",
        desc: "Publishes the Verifier circuit to the Midnight Network."
    }
];

export const TOKENOMICS_INFO = {
    night: "NIGHT is the utility and governance token. Staking NIGHT secures the consensus layer and provides voting power in the Midnight DAO.",
    dust: "DUST is the fixed-cost resource token. It acts as 'Gas' for ZK-proof verification. DUST is non-tradeable, ensuring predictable costs for dApp developers."
};