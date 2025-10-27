import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  Keypair,
} from "@solana/web3.js";
import { AnchorProvider, Program, Idl, web3 } from "@coral-xyz/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import idl from "../../../solana/target/idl/attestation.json";

export interface ProjectSubmissionData {
  domainHash: number[];
  projectName: string;
  transparencyScore: number;
  riskLevel: number;
  certificateValidityHash: number[];
}

export interface VoteData {
  domainHash: number[];
  isLegitimate: boolean;
  confidenceLevel: number;
}

export interface ProofVerificationData {
  domainHash: number[];
  proofHash: number[];
  publicInputs: number[];
  isValid: boolean;
}

class SolanaService {
  private connection: Connection;
  private program: Program<Idl> | null = null;
  private provider: AnchorProvider | null = null;

  constructor() {
    // Use Solana devnet (where the program is deployed)
    this.connection = new Connection(
      import.meta.env.VITE_SOLANA_RPC_URL || "https://api.devnet.solana.com",
      "confirmed"
    );
  }

  async initializeProgram(wallet: any): Promise<void> {
    if (!wallet) {
      throw new Error("Wallet object is null or undefined");
    }

    if (!wallet.publicKey) {
      throw new Error("Wallet publicKey is null or undefined");
    }

    // Create provider with the wallet from the wallet adapter
    this.provider = new AnchorProvider(this.connection, wallet, {
      commitment: "confirmed",
    });

    // Initialize program - use the exact deployed program ID from env or default
    const programId = new PublicKey(
      import.meta.env.VITE_PROGRAM_ID ||
        "4jGQ4kaxDsPJ57u1iN8gX1X7ngBji2Z8R8ERmcVp1BLW"
    );

    // Create a minimal program interface that matches what we need
    const programInterface = {
      ...idl,
      address: programId.toString(),
    };

    this.program = new Program(
      programInterface as Idl,
      programId,
      this.provider
    );
  }

  async submitProject(data: ProjectSubmissionData): Promise<string> {
    if (!this.program || !this.provider) {
      throw new Error("Program or provider not initialized");
    }

    console.log(
      "🚀 Submitting project to Solana using REAL Anchor program...",
      data
    );

    try {
      // Convert arrays to Uint8Arrays
      const domainHashArray = new Uint8Array(data.domainHash);
      const certValidityHashArray = new Uint8Array(
        data.certificateValidityHash
      );

      // Derive the project record PDA
      const [projectRecordPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("project"), Buffer.from(domainHashArray)],
        this.program.programId
      );

      // Get the attestation account PDA
      const attestationAccount = await this.getAttestationAccount();

      console.log("📋 Project submission details:");
      console.log("  - Domain hash:", data.domainHash.slice(0, 8), "...");
      console.log("  - Project name:", data.projectName);
      console.log("  - Transparency score:", data.transparencyScore);
      console.log("  - Risk level:", data.riskLevel);
      console.log("  - Project PDA:", projectRecordPDA.toString());

      // Call the actual Anchor program method
      const tx = await this.program.methods
        .submitProject(
          Array.from(domainHashArray),
          data.projectName,
          data.transparencyScore,
          data.riskLevel,
          Array.from(certValidityHashArray)
        )
        .accounts({
          attestationAccount,
          projectRecord: projectRecordPDA,
          submitter: this.provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log(
        "✅ Project submitted successfully via REAL Anchor program:",
        tx
      );
      console.log(
        "   Transaction: https://explorer.solana.com/tx/" +
          tx +
          "?cluster=devnet"
      );
      return tx;
    } catch (error) {
      console.error("❌ Failed to submit project:", error);
      throw error;
    }
  }

  async voteOnProject(data: VoteData): Promise<string> {
    if (!this.program || !this.provider) {
      throw new Error("Program or provider not initialized");
    }

    console.log(
      "🗳️ Submitting vote to Solana using REAL Anchor program...",
      data
    );

    try {
      // Convert arrays to Uint8Arrays
      const domainHashArray = new Uint8Array(data.domainHash);

      // Derive the project record PDA
      const [projectRecordPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("project"), Buffer.from(domainHashArray)],
        this.program.programId
      );

      // Derive the voter record PDA
      const [voterRecordPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("vote"),
          Buffer.from(domainHashArray),
          this.provider.wallet.publicKey.toBuffer(),
        ],
        this.program.programId
      );

      console.log("🗳️ Vote details:");
      console.log("  - Is legitimate:", data.isLegitimate);
      console.log("  - Confidence level:", data.confidenceLevel);
      console.log("  - Voter:", this.provider.wallet.publicKey.toString());
      console.log("  - Voter record PDA:", voterRecordPDA.toString());

      // Call the actual Anchor program method
      const tx = await this.program.methods
        .voteOnProject(
          Array.from(domainHashArray),
          data.isLegitimate,
          data.confidenceLevel
        )
        .accounts({
          projectRecord: projectRecordPDA,
          voterRecord: voterRecordPDA,
          voter: this.provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log(
        "✅ Vote submitted successfully via REAL Anchor program:",
        tx
      );
      console.log(
        "   Transaction: https://explorer.solana.com/tx/" +
          tx +
          "?cluster=devnet"
      );
      return tx;
    } catch (error) {
      console.error("❌ Failed to submit vote:", error);
      throw error;
    }
  }

  async verifyProof(data: ProofVerificationData): Promise<string> {
    if (!this.program || !this.provider) {
      throw new Error("Program or provider not initialized");
    }

    console.log(
      "🔍 Verifying proof on Solana using REAL Anchor program...",
      data
    );

    try {
      // Convert arrays to Uint8Arrays
      const proofHashArray = new Uint8Array(data.proofHash);

      // Derive the proof record PDA
      const [proofRecordPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("proof"), Buffer.from(proofHashArray)],
        this.program.programId
      );

      // Get the attestation account PDA
      const attestationAccount = await this.getAttestationAccount();

      console.log("🔍 Proof verification details:");
      console.log("  - Proof hash:", data.proofHash.slice(0, 8), "...");
      console.log("  - Is valid:", data.isValid);
      console.log("  - Public inputs length:", data.publicInputs.length);
      console.log("  - Proof record PDA:", proofRecordPDA.toString());

      // Call the actual Anchor program method
      const tx = await this.program.methods
        .verifyZkTlsProof(
          Array.from(new Uint8Array(data.domainHash)),
          Array.from(proofHashArray),
          Array.from(new Uint8Array(data.publicInputs)),
          data.isValid
        )
        .accounts({
          attestationAccount,
          proofRecord: proofRecordPDA,
          submitter: this.provider.wallet.publicKey,
          verifier: this.provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log(
        "✅ Proof verified successfully via REAL Anchor program:",
        tx
      );
      console.log(
        "   Transaction: https://explorer.solana.com/tx/" +
          tx +
          "?cluster=devnet"
      );
      return tx;
    } catch (error) {
      console.error("❌ Failed to verify proof:", error);
      throw error;
    }
  }

  async getProjectData(domainHash: number[]): Promise<any> {
    if (!this.program) {
      throw new Error("Program not initialized");
    }

    try {
      const domainHashArray = new Uint8Array(domainHash);
      const [projectRecordPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("project"), domainHashArray],
        this.program.programId
      );

      const projectData = await this.program.account.projectRecord.fetch(
        projectRecordPDA
      );
      return projectData;
    } catch (error) {
      console.error("Failed to fetch project data:", error);
      return null;
    }
  }

  async getAttestationAccount(): Promise<PublicKey> {
    const [attestationAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("attestation")],
      this.program!.programId
    );
    return attestationAccount;
  }

  async initializeAttestationAccount(): Promise<string> {
    if (!this.program) {
      throw new Error("Program not initialized");
    }

    try {
      const attestationAccount = await this.getAttestationAccount();

      const tx = await this.program.methods
        .initialize()
        .accounts({
          attestationAccount,
          authority: this.provider!.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("✅ Attestation account initialized:", tx);
      return tx;
    } catch (error) {
      // If account already exists, that's okay
      if (error.message?.includes("already in use")) {
        console.log("ℹ️ Attestation account already initialized");
        return "already-initialized";
      }
      throw error;
    }
  }

  async getConnectionStatus(): Promise<boolean> {
    try {
      const version = await this.connection.getVersion();
      return !!version;
    } catch (error) {
      console.error("Failed to connect to Solana:", error);
      return false;
    }
  }

  async getBalance(): Promise<number> {
    if (!this.provider?.wallet.publicKey) {
      return 0;
    }

    try {
      const balance = await this.connection.getBalance(
        this.provider.wallet.publicKey
      );
      return balance / web3.LAMPORTS_PER_SOL;
    } catch (error) {
      console.error("Failed to get balance:", error);
      return 0;
    }
  }
}

export const solanaService = new SolanaService();
