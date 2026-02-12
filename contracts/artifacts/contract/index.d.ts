import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type PassportWitness = { user_age: bigint;
                                expiry_timestamp: bigint;
                                id_number: Uint8Array;
                                secret_key: Uint8Array;
                                issuer_signature: Uint8Array
                              };

export type Witnesses<PS> = {
  get_passport_data(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, PassportWitness];
  check_issuer_signature(context: __compactRuntime.WitnessContext<Ledger, PS>,
                         data_0: Uint8Array,
                         signature_0: Uint8Array,
                         public_key_0: Uint8Array): [PS, boolean];
}

export type ImpureCircuits<PS> = {
  register(context: __compactRuntime.CircuitContext<PS>,
           caller_0: Uint8Array,
           required_age_0: bigint,
           current_network_time_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  register(context: __compactRuntime.CircuitContext<PS>,
           caller_0: Uint8Array,
           required_age_0: bigint,
           current_network_time_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  verified_registry: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<[Uint8Array, boolean]>
  };
  spent_nullifiers: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<[Uint8Array, boolean]>
  };
  readonly issuer_public_key: Uint8Array;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>,
               issuer_pk_0: Uint8Array): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
