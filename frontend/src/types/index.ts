// Global type definitions for the Proof Anchor frontend

export type ProofStatus =
  | "idle"
  | "generating"
  | "verifying"
  | "pending_vote"
  | "success"
  | "verification_complete"
  | "error";

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
  onGenerate: () => Promise<ProofGenerationResult>;
  disabled: boolean;
}

export interface ProofVerifierProps {
  onVerify: () => Promise<ProofVerificationResult>;
  disabled: boolean;
}

// Transparency and Legitimacy Types
export interface ProjectTransparencyData {
  domain: string;
  transparencyScore: number;
  riskLevel: number;
  certificateValid: boolean;
  lastVerified: number;
  metadata: TransparencyMetadata;
}

export interface TransparencyMetadata {
  hasPublicGithub: boolean;
  hasDocumentedRoadmap: boolean;
  hasAuditReports: boolean;
  hasTeamVerification: boolean;
  hasTokenEconomics: boolean;
  codeReviewScore: number;
}

export interface LegitimacyAssessment {
  isLegitimate: boolean;
  confidenceScore: number;
  riskFactors: string[];
  transparencyIndicators: string[];
  overallRecommendation: string;
}

export interface CommunityVote {
  voter: string;
  isLegitimate: boolean;
  confidenceLevel: number;
  timestamp: number;
}

export interface ProjectRating {
  projectId: string;
  domainHash: string;
  totalVotes: number;
  positiveVotes: number;
  negativeVotes: number;
  finalScore: number;
  verified: boolean;
  lastUpdated: number;
}

// Component prop types for new components
export interface ProjectTransparencyCardProps {
  projectData: ProjectTransparencyData;
  legitimacyAssessment: LegitimacyAssessment;
}

export interface CommunityVotingPanelProps {
  currentRating: ProjectRating;
  onVote: (isLegitimate: boolean, confidenceLevel: number) => Promise<void>;
  userVote?: CommunityVote;
}
