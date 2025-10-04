import React, { useState, useCallback } from "react";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Shield, AlertTriangle, Star, Users } from "lucide-react";

// Import types
import {
  ProofStatus,
  ProofGenerationResult,
  ProofVerificationResult,
  ProjectTransparencyData,
  LegitimacyAssessment,
} from "./types";

// Import components
import StatusIndicator from "@/components/StatusIndicator";
import ProofGenerator from "@/components/ProofGenerator";
import ProofVerifier from "@/components/ProofVerifier";
import ProjectTransparencyCard from "@/components/ProjectTransparencyCard";
import CommunityVotingPanel from "@/components/CommunityVotingPanel";

// Import wallet adapter CSS
import "@solana/wallet-adapter-react-ui/styles.css";

// Main app component that uses wallet
const AppContent: React.FC = () => {
  const { connected } = useWallet();
  const [proofStatus, setProofStatus] = useState<ProofStatus>("idle");
  const [proofHash, setProofHash] = useState<string>("");
  const [verificationResult, setVerificationResult] = useState<boolean | null>(
    null
  );
  const [projectData, setProjectData] =
    useState<ProjectTransparencyData | null>(null);
  const [legitimacyAssessment, setLegitimacyAssessment] =
    useState<LegitimacyAssessment | null>(null);
  const [projectDomain, setProjectDomain] = useState<string>("");
  const [userVote, setUserVote] = useState<{
    isLegitimate: boolean;
    confidence: number;
  } | null>(null);
  const [analyzedDomains, setAnalyzedDomains] = useState<Set<string>>(
    new Set()
  );

  // Function to analyze project transparency based on domain
  const analyzeProjectTransparency = (
    domain: string
  ): ProjectTransparencyData => {
    // Simulate different transparency scores based on domain patterns
    let transparencyScore = 50; // Base score
    let riskLevel = 5; // Base risk
    let hasPublicGithub = false;
    let hasDocumentedRoadmap = false;
    let hasAuditReports = false;
    let hasTeamVerification = false;
    let hasTokenEconomics = false;
    let codeReviewScore = 5;

    // Analyze domain for transparency indicators
    const domainLower = domain.toLowerCase();

    // High transparency indicators
    if (domainLower.includes("github") || domainLower.includes("git")) {
      transparencyScore += 20;
      hasPublicGithub = true;
      codeReviewScore = 9;
    }

    if (domainLower.includes("official") || domainLower.includes("org")) {
      transparencyScore += 15;
      hasTeamVerification = true;
    }

    if (domainLower.includes("audit") || domainLower.includes("security")) {
      transparencyScore += 15;
      hasAuditReports = true;
    }

    if (domainLower.includes("roadmap") || domainLower.includes("docs")) {
      transparencyScore += 10;
      hasDocumentedRoadmap = true;
    }

    if (domainLower.includes("token") || domainLower.includes("economics")) {
      transparencyScore += 10;
      hasTokenEconomics = true;
    }

    // Risk indicators
    if (domainLower.includes("test") || domainLower.includes("demo")) {
      riskLevel = 3; // Lower risk for test domains
    }

    if (
      domainLower.includes("scam") ||
      domainLower.includes("fake") ||
      domainLower.includes("phishing")
    ) {
      riskLevel = 10;
      transparencyScore = 10;
      hasPublicGithub = false;
      hasDocumentedRoadmap = false;
      hasAuditReports = false;
      hasTeamVerification = false;
      hasTokenEconomics = false;
      codeReviewScore = 1;
    }

    if (domainLower.includes("new") || domainLower.includes("beta")) {
      riskLevel += 2;
    }

    // Ensure scores are within bounds
    transparencyScore = Math.min(100, Math.max(0, transparencyScore));
    riskLevel = Math.min(10, Math.max(0, riskLevel));

    return {
      domain,
      transparencyScore,
      riskLevel,
      certificateValid: !domainLower.includes("invalid"),
      lastVerified: Date.now(),
      metadata: {
        hasPublicGithub,
        hasDocumentedRoadmap,
        hasAuditReports,
        hasTeamVerification,
        hasTokenEconomics,
        codeReviewScore,
      },
    };
  };

  // Function to assess legitimacy based on project data
  const assessLegitimacy = (
    projectData: ProjectTransparencyData
  ): LegitimacyAssessment => {
    const { transparencyScore, riskLevel, metadata } = projectData;

    let isLegitimate = true;
    let confidenceScore = transparencyScore;
    const riskFactors: string[] = [];
    const transparencyIndicators: string[] = [];

    // Build transparency indicators
    if (metadata.hasPublicGithub)
      transparencyIndicators.push("Public GitHub repository");
    if (metadata.hasDocumentedRoadmap)
      transparencyIndicators.push("Documented project roadmap");
    if (metadata.hasAuditReports)
      transparencyIndicators.push("Security audit reports available");
    if (metadata.hasTeamVerification)
      transparencyIndicators.push("Team verification completed");
    if (metadata.hasTokenEconomics)
      transparencyIndicators.push("Token economics documented");

    // Assess risk factors
    if (riskLevel > 7) {
      isLegitimate = false;
      riskFactors.push("High risk level detected");
    }

    if (transparencyScore < 30) {
      isLegitimate = false;
      riskFactors.push("Low transparency score");
    }

    if (!metadata.hasPublicGithub && transparencyScore < 50) {
      riskFactors.push("No public code repository");
    }

    if (!metadata.hasAuditReports && riskLevel > 5) {
      riskFactors.push("No security audits found");
    }

    // Determine recommendation
    let recommendation = "";
    if (isLegitimate && confidenceScore > 80) {
      recommendation =
        "HIGHLY LEGITIMATE - Strong transparency indicators with minimal risk factors";
    } else if (isLegitimate && confidenceScore > 60) {
      recommendation =
        "LIKELY LEGITIMATE - Good transparency indicators with some areas for improvement";
    } else if (isLegitimate) {
      recommendation =
        "POSSIBLY LEGITIMATE - Some transparency indicators but requires further verification";
    } else {
      recommendation =
        "SUSPICIOUS - Multiple risk factors detected, proceed with caution";
    }

    return {
      isLegitimate,
      confidenceScore,
      riskFactors,
      transparencyIndicators,
      overallRecommendation: recommendation,
    };
  };

  const handleGenerateProof =
    useCallback(async (): Promise<ProofGenerationResult> => {
      // Validate domain input
      if (!projectDomain.trim()) {
        setProofStatus("error");
        return {
          success: false,
          error: "Please enter a project domain to analyze",
        };
      }

      setProofStatus("generating");
      try {
        // Add domain to analyzed set
        const domainKey = projectDomain.trim().toLowerCase();
        setAnalyzedDomains((prev) => new Set([...prev, domainKey]));

        // Step 1: Simulate zkTLS proof generation
        await new Promise<void>((resolve) => setTimeout(resolve, 1000));
        const hash = Math.random().toString(36).substring(2, 15);
        setProofHash(hash);

        // Step 2: Analyze project transparency dynamically
        const analyzedProjectData = analyzeProjectTransparency(
          projectDomain.trim()
        );
        const assessedLegitimacy = assessLegitimacy(analyzedProjectData);

        setProjectData(analyzedProjectData);
        setLegitimacyAssessment(assessedLegitimacy);

        // Step 3: Analysis complete, ready for voting
        setProofStatus("pending_vote");

        return { success: true, proofHash: hash };
      } catch (error) {
        setProofStatus("error");
        console.error("zkTLS proof generation failed:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }, [projectDomain]);

  const handleVerifyProof =
    useCallback(async (): Promise<ProofVerificationResult> => {
      if (!proofHash) {
        return { success: false, error: "No proof hash available" };
      }

      if (!projectData || !legitimacyAssessment || !userVote) {
        return { success: false, error: "Missing analysis data or vote" };
      }

      setProofStatus("verifying");
      try {
        // Simulate proof verification
        await new Promise<void>((resolve) => setTimeout(resolve, 1500));

        // Calculate verification result based on analysis and user vote
        const isProofValid =
          legitimacyAssessment.isLegitimate &&
          projectData.transparencyScore > 30 &&
          userVote.isLegitimate; // User vote must align with legitimacy assessment

        setVerificationResult(isProofValid);
        setProofStatus("verification_complete");

        return { success: true, isValid: isProofValid };
      } catch (error) {
        setProofStatus("error");
        console.error("Proof verification failed:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }, [proofHash, projectData, legitimacyAssessment, userVote]);

  const handleVote = useCallback(
    async (isLegitimate: boolean, confidenceLevel: number) => {
      try {
        // Store user's vote
        setUserVote({ isLegitimate, confidence: confidenceLevel });

        // Simulate on-chain voting (in production, this would call Solana program)
        await new Promise<void>((resolve) => setTimeout(resolve, 1000));

        // After voting, ready for final verification
        setProofStatus("success");

        console.log(
          `Vote submitted: ${
            isLegitimate ? "Legitimate" : "Suspicious"
          }, Confidence: ${confidenceLevel}/10`
        );
      } catch (error) {
        console.error("Failed to submit vote:", error);
      }
    },
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div
            className="flex items-center justify-center gap-4 mb-4 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => window.location.reload()}
          >
            {/* Logo Image */}
            <img src="/poa.png" alt="Proof Anchor Logo" className="w-12 h-12" />

            <h1 className="text-4xl font-bold text-gray-900">
              Proof of Anchor
            </h1>
          </div>

          <p className="text-xl text-gray-600 mb-8">
            zkTLS Transparency Ratings & Project Legitimacy Verification
          </p>
          <div className="flex justify-center">
            <WalletMultiButton className="!bg-orange-700 hover:!bg-orange-800 !text-white" />
          </div>

          {/* Wallet Connection Status */}
          {!connected && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-center">
                🔗 Please connect your wallet and enter a project domain to
                analyze
              </p>
            </div>
          )}

          {/* Already Analyzed Domain Warning */}
          {connected &&
            projectDomain.trim() &&
            analyzedDomains.has(projectDomain.trim().toLowerCase()) && (
              <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-orange-800 text-center">
                  ⚠️ You have already analyzed "{projectDomain.trim()}". Please
                  enter a different domain to analyze.
                </p>
              </div>
            )}
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              zkTLS Proof Generation & Transparency Analysis
            </h2>

            {/* Project Domain Input */}
            <div className="mb-6">
              <label
                htmlFor="project-domain"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Project Domain to Analyze
              </label>
              <input
                type="text"
                id="project-domain"
                value={projectDomain}
                onChange={(e) => setProjectDomain(e.target.value)}
                placeholder="e.g., github.com, uniswap.org, ethereum.org"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-center text-lg"
                disabled={
                  proofStatus === "generating" || proofStatus === "verifying"
                }
              />
              <p className="text-sm text-gray-500 mt-2 text-center">
                Enter any domain to test the transparency analysis system
              </p>
            </div>

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
                  !connected ||
                  !projectDomain.trim() ||
                  proofStatus === "generating" ||
                  proofStatus === "verifying" ||
                  proofStatus === "pending_vote" ||
                  proofStatus === "success" ||
                  proofStatus === "verification_complete" ||
                  userVote !== null ||
                  analyzedDomains.has(projectDomain.trim().toLowerCase())
                }
              />

              <ProofVerifier
                onVerify={handleVerifyProof}
                disabled={
                  !connected ||
                  !proofHash ||
                  !userVote ||
                  proofStatus === "generating" ||
                  proofStatus === "verifying" ||
                  proofStatus === "pending_vote" ||
                  proofStatus === "idle" ||
                  proofStatus === "error" ||
                  proofStatus === "verification_complete"
                }
              />
            </div>

            {/* Project Transparency Analysis */}
            {projectData && legitimacyAssessment && (
              <div className="mt-8 space-y-6">
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Project Transparency Analysis
                  </h3>

                  {/* Voting Requirement Message */}
                  {proofStatus === "pending_vote" && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-800 text-center font-medium">
                        🗳️ Analysis Complete! Please vote on this project's
                        legitimacy to finalize the assessment.
                      </p>
                    </div>
                  )}

                  {/* Verification Complete Success Message */}
                  {proofStatus === "verification_complete" && (
                    <div className="mb-6 p-6 bg-green-50 border-2 border-green-200 rounded-lg">
                      <div className="text-center">
                        <div className="text-4xl mb-2">🎉</div>
                        <h3 className="text-xl font-bold text-green-800 mb-2">
                          Analysis Complete!
                        </h3>
                        <p className="text-green-700 font-medium">
                          {verificationResult
                            ? "Project verified successfully with community consensus!"
                            : "Verification completed with community input."}
                        </p>
                        <button
                          onClick={() => {
                            setProofStatus("idle");
                            setProjectData(null);
                            setLegitimacyAssessment(null);
                            setUserVote(null);
                            setProofHash("");
                            setVerificationResult(null);
                            setProjectDomain("");
                            // Note: We keep analyzedDomains to prevent re-analysis of same domains
                          }}
                          className="mt-4 px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors font-medium"
                        >
                          Analyze Another Project
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="grid md:grid-cols-2 gap-6">
                    <ProjectTransparencyCard
                      projectData={projectData}
                      legitimacyAssessment={legitimacyAssessment}
                    />
                    <CommunityVotingPanel
                      currentRating={{
                        projectId: proofHash,
                        domainHash: proofHash,
                        totalVotes: userVote ? 1 : 0,
                        positiveVotes: userVote?.isLegitimate ? 1 : 0,
                        negativeVotes:
                          userVote && !userVote.isLegitimate ? 1 : 0,
                        finalScore: userVote
                          ? userVote.isLegitimate
                            ? 100
                            : 0
                          : 0,
                        verified: userVote ? userVote.isLegitimate : false,
                        lastUpdated: Date.now(),
                      }}
                      onVote={handleVote}
                      userVote={
                        userVote
                          ? {
                              voter: "current-user",
                              isLegitimate: userVote.isLegitimate,
                              confidenceLevel: userVote.confidence,
                              timestamp: Date.now(),
                            }
                          : undefined
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <Shield className="h-12 w-12 text-orange-700 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                zkTLS Verification
              </h3>
              <p className="text-gray-600">
                Prove TLS certificate validity without revealing sensitive data
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <Star className="h-12 w-12 text-green-700 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Transparency Ratings
              </h3>
              <p className="text-gray-600">
                Score projects based on transparency and legitimacy indicators
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <Users className="h-12 w-12 text-blue-700 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Community Voting
              </h3>
              <p className="text-gray-600">
                Crowdsourced analysis to identify legitimate projects vs scams
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-red-700 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Risk Assessment
              </h3>
              <p className="text-gray-600">
                Advanced algorithms to detect potential scam indicators
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App component with wallet providers
const App: React.FC = () => {
  const wallets = [new PhantomWalletAdapter()];
  const endpoint = clusterApiUrl("devnet");

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <AppContent />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
