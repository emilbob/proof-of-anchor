// Global type definitions for the Proof Anchor frontend

export type ProofStatus = "idle" | "generating" | "verifying" | "success" | "error";

export interface ProofData {
  proof: string;
  publicInputs: string[];
  verificationKey: string;
  hash: string;
  timestamp: number;
}

export interface AppState {
  proofStatus: ProofStatus;
  proofHash: string;
  verificationResult: boolean | null;
  proofData: ProofData | null;
}

export interface WalletContextType {
  connected: boolean;
  publicKey: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export interface ProofGenerationResult {
  success: boolean;
  proofHash?: string;
  error?: string;
}

export interface ProofVerificationResult {
  success: boolean;
  isValid?: boolean;
  error?: string;
}

// Solana specific types
export interface SolanaConfig {
  network: "localhost" | "devnet" | "mainnet";
  rpcUrl: string;
  programId: string;
}

// Component prop types
export interface StatusIndicatorProps {
  status: ProofStatus;
  verificationResult?: boolean | null;
  proofHash?: string;
}

export interface ProofGeneratorProps {
  onGenerate: () => Promise<void>;
  disabled: boolean;
  status: ProofStatus;
}

export interface ProofVerifierProps {
  onVerify: () => Promise<void>;
  disabled: boolean;
  status: ProofStatus;
  proofHash: string;
}
