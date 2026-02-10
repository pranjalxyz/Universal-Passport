export enum TabView {
  CONTRACT = 'CONTRACT',
  WITNESS = 'WITNESS',
  ARCHITECTURE = 'ARCHITECTURE',
  TOKENOMICS = 'TOKENOMICS',
  SIMULATION = 'SIMULATION'
}

export interface IdentityProfile {
  id: string;
  name: string;
  age: number;
  expiryDate: string;
  expiryTimestamp: number;
  status: 'valid' | 'expired' | 'underage';
}

export interface SimulationState {
  activeProfile: IdentityProfile;
  minAge: number;
  isProving: boolean;
  proofGenerated: boolean;
  isVerifying: boolean;
  isVerified: boolean;
  proofHash: string | null;
  logs: string[];
  // Hardened states
  signatureVerified: boolean;
  nullifierComputed: boolean;
  isSybil: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}