import React, { useState, useEffect } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Shield, CheckCircle, XCircle, Upload, Eye } from "lucide-react";

// Import wallet adapter CSS
import "@solana/wallet-adapter-react-ui/styles.css";

const App = () => {
  const [proofStatus, setProofStatus] = useState("idle"); // idle, generating, verifying, success, error
  const [proofHash, setProofHash] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);

  const wallets = [new PhantomWalletAdapter()];
  const endpoint = clusterApiUrl("devnet");

  const handleGenerateProof = async () => {
    setProofStatus("generating");
    try {
      // Simulate proof generation
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const hash = Math.random().toString(36).substring(2, 15);
      setProofHash(hash);
      setProofStatus("success");
    } catch (error) {
      setProofStatus("error");
      console.error("Proof generation failed:", error);
    }
  };

  const handleVerifyProof = async () => {
    if (!proofHash) return;

    setProofStatus("verifying");
    try {
      // Simulate proof verification
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setVerificationResult(true);
      setProofStatus("success");
    } catch (error) {
      setProofStatus("error");
      setVerificationResult(false);
      console.error("Proof verification failed:", error);
    }
  };

  const getStatusIcon = () => {
    switch (proofStatus) {
      case "generating":
      case "verifying":
        return (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        );
      case "success":
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case "error":
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Shield className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (proofStatus) {
      case "generating":
        return "Generating proof...";
      case "verifying":
        return "Verifying proof...";
      case "success":
        return verificationResult
          ? "Proof verified successfully!"
          : "Proof generated successfully!";
      case "error":
        return "Operation failed";
      default:
        return "Ready to generate proof";
    }
  };

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 py-8">
              {/* Header */}
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Proof Anchor
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  Zero-Knowledge Proof Verification on Solana
                </p>
                <div className="flex justify-center">
                  <WalletMultiButton className="!bg-indigo-600 hover:!bg-indigo-700" />
                </div>
              </div>

              {/* Main Content */}
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                    Proof Generation & Verification
                  </h2>

                  {/* Status Display */}
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-center space-x-3">
                      {getStatusIcon()}
                      <span className="text-lg font-medium text-gray-700">
                        {getStatusText()}
                      </span>
                    </div>
                    {proofHash && (
                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-500 mb-2">
                          Proof Hash:
                        </p>
                        <code className="bg-gray-200 px-3 py-1 rounded text-sm font-mono">
                          {proofHash}
                        </code>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={handleGenerateProof}
                      disabled={
                        proofStatus === "generating" ||
                        proofStatus === "verifying"
                      }
                      className="flex items-center justify-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Upload className="h-5 w-5" />
                      <span>Generate Proof</span>
                    </button>

                    <button
                      onClick={handleVerifyProof}
                      disabled={
                        !proofHash ||
                        proofStatus === "generating" ||
                        proofStatus === "verifying"
                      }
                      className="flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Eye className="h-5 w-5" />
                      <span>Verify Proof</span>
                    </button>
                  </div>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                    <Shield className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Zero-Knowledge Proofs
                    </h3>
                    <p className="text-gray-600">
                      Generate and verify proofs without revealing sensitive
                      data
                    </p>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      On-Chain Verification
                    </h3>
                    <p className="text-gray-600">
                      Store proof commitments on Solana blockchain
                    </p>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                    <Eye className="h-12 w-12 text-purple-600 mx-auto mb-4" />
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
