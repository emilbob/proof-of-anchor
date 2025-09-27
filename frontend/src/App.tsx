import React, { useState, useCallback } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Shield, CheckCircle, Eye } from "lucide-react";

// Import types
import {
  ProofStatus,
  ProofGenerationResult,
  ProofVerificationResult,
} from "./types";

// Import components
import StatusIndicator from "@/components/StatusIndicator";
import ProofGenerator from "@/components/ProofGenerator";
import ProofVerifier from "@/components/ProofVerifier";

// Import wallet adapter CSS
import "@solana/wallet-adapter-react-ui/styles.css";

const App: React.FC = () => {
  const [proofStatus, setProofStatus] = useState<ProofStatus>("idle");
  const [proofHash, setProofHash] = useState<string>("");
  const [verificationResult, setVerificationResult] = useState<boolean | null>(
    null
  );

  const wallets = [new PhantomWalletAdapter()];
  const endpoint = clusterApiUrl("devnet");

  const handleGenerateProof =
    useCallback(async (): Promise<ProofGenerationResult> => {
      setProofStatus("generating");
      try {
        // Simulate proof generation
        await new Promise<void>((resolve) => setTimeout(resolve, 2000));
        const hash = Math.random().toString(36).substring(2, 15);
        setProofHash(hash);
        setProofStatus("success");
        return { success: true, proofHash: hash };
      } catch (error) {
        setProofStatus("error");
        console.error("Proof generation failed:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }, []);

  const handleVerifyProof =
    useCallback(async (): Promise<ProofVerificationResult> => {
      if (!proofHash) {
        return { success: false, error: "No proof hash available" };
      }

      setProofStatus("verifying");
      try {
        // Simulate proof verification
        await new Promise<void>((resolve) => setTimeout(resolve, 1500));
        setVerificationResult(true);
        setProofStatus("success");
        return { success: true, isValid: true };
      } catch (error) {
        setProofStatus("error");
        setVerificationResult(false);
        console.error("Proof verification failed:", error);
        return {
          success: false,
          isValid: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }, [proofHash]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="container mx-auto px-4 py-8">
              {/* Header */}
              <div className="text-center mb-12">
                <div
                  className="flex items-center justify-center gap-4 mb-4 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => window.location.reload()}
                >
                  {/* Logo Image */}
                  <img
                    src="/poa.png"
                    alt="Proof Anchor Logo"
                    className="w-12 h-12"
                  />

                  <h1 className="text-4xl font-bold text-gray-900">
                    Proof of Anchor
                  </h1>
                </div>

                <p className="text-xl text-gray-600 mb-8">
                  Zero-Knowledge Proof Verification on Solana
                </p>
                <div className="flex justify-center">
                  <WalletMultiButton className="!bg-orange-700 hover:!bg-orange-800 !text-white" />
                </div>
              </div>

              {/* Main Content */}
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                    Proof Generation & Verification
                  </h2>

                  {/* Status Display */}
                  <StatusIndicator
                    status={proofStatus}
                    verificationResult={verificationResult}
                    proofHash={proofHash}
                  />

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <ProofGenerator
                      onGenerate={handleGenerateProof}
                      disabled={
                        proofStatus === "generating" ||
                        proofStatus === "verifying"
                      }
                      status={proofStatus}
                    />

                    <ProofVerifier
                      onVerify={handleVerifyProof}
                      disabled={
                        !proofHash ||
                        proofStatus === "generating" ||
                        proofStatus === "verifying"
                      }
                      status={proofStatus}
                      proofHash={proofHash}
                    />
                  </div>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                    <Shield className="h-12 w-12 text-orange-700 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Zero-Knowledge Proofs
                    </h3>
                    <p className="text-gray-600">
                      Generate and verify proofs without revealing sensitive
                      data
                    </p>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                    <CheckCircle className="h-12 w-12 text-green-700 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      On-Chain Verification
                    </h3>
                    <p className="text-gray-600">
                      Store proof commitments on Solana blockchain
                    </p>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                    <Eye className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Real-time Verification
                    </h3>
                    <p className="text-gray-600">
                      Verify proofs instantly with our verification system
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
