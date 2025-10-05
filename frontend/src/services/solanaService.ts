import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
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
    // Use Solana testnet
    this.connection = new Connection(
      import.meta.env.VITE_SOLANA_RPC_URL || "https://api.testnet.solana.com",
      "confirmed"
    );
  }

  async initializeProgram(wallet: any): Promise<void> {
    if (!wallet.publicKey) {
      throw new Error("Wallet not connected");
    }

    // Create provider
    this.provider = new AnchorProvider(this.connection, wallet, {
      commitment: "confirmed",
    });

    // Initialize program
    const programId = new PublicKey(
      import.meta.env.VITE_PROGRAM_ID ||
        "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"
    );

    this.program = new Program(idl as Idl, programId, this.provider);
  }

  async submitProject(data: ProjectSubmissionData): Promise<string> {
    if (!this.program) {
      throw new Error("Program not initialized");
    }

    console.log("🚀 Submitting project to Solana testnet...", data);

    try {
      // Convert arrays to the format expected by Anchor
      const domainHashArray = new Uint8Array(data.domainHash);
      const certificateValidityHashArray = new Uint8Array(
        data.certificateValidityHash
      );

      // Get the project record PDA
      const [projectRecordPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("project"), domainHashArray],
        this.program.programId
      );

      // Submit the project
      const tx = await this.program.methods
        .submitProject(
          Array.from(domainHashArray),
          data.projectName,
          data.transparencyScore,
          data.riskLevel,
          Array.from(certificateValidityHashArray)
        )
        .accounts({
          attestationAccount: await this.getAttestationAccount(),
          projectRecord: projectRecordPDA,
          submitter: this.provider!.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("✅ Project submitted successfully:", tx);
      return tx;
    } catch (error) {
      console.error("❌ Failed to submit project:", error);
      throw error;
    }
  }

  async voteOnProject(data: VoteData): Promise<string> {
    if (!this.program) {
      throw new Error("Program not initialized");
    }

    console.log("🗳️ Submitting vote to Solana testnet...", data);

    try {
      const domainHashArray = new Uint8Array(data.domainHash);

      // Get PDAs
      const [projectRecordPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("project"), domainHashArray],
        this.program.programId
      );

      const [voterRecordPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("vote"),
          domainHashArray,
          this.provider!.wallet.publicKey.toBuffer(),
        ],
        this.program.programId
      );

      // Submit vote
      const tx = await this.program.methods
        .voteOnProject(
          Array.from(domainHashArray),
          data.isLegitimate,
          data.confidenceLevel
        )
        .accounts({
          projectRecord: projectRecordPDA,
          voterRecord: voterRecordPDA,
          voter: this.provider!.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("✅ Vote submitted successfully:", tx);
      return tx;
    } catch (error) {
      console.error("❌ Failed to submit vote:", error);
      throw error;
    }
  }

  async verifyProof(data: ProofVerificationData): Promise<string> {
    if (!this.program) {
      throw new Error("Program not initialized");
    }

    console.log("🔍 Verifying proof on Solana testnet...", data);

    try {
      const domainHashArray = new Uint8Array(data.domainHash);
      const proofHashArray = new Uint8Array(data.proofHash);

      // Get PDAs
      const attestationAccount = await this.getAttestationAccount();
      const [proofRecordPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("proof"), proofHashArray],
        this.program.programId
      );

      // Verify proof
      const tx = await this.program.methods
        .verifyZkTlsProof(
          Array.from(domainHashArray),
          Array.from(proofHashArray),
          data.publicInputs,
          data.isValid
        )
        .accounts({
          attestationAccount,
          proofRecord: proofRecordPDA,
          submitter: this.provider!.wallet.publicKey,
          verifier: this.provider!.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("✅ Proof verified successfully:", tx);
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
