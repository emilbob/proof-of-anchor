import React, { useState } from "react";
import { ThumbsUp, ThumbsDown, Users, CheckCircle } from "lucide-react";
import { CommunityVotingPanelProps } from "../types";

const CommunityVotingPanel: React.FC<CommunityVotingPanelProps> = ({
  currentRating,
  onVote,
  userVote,
}) => {
  const [selectedVote, setSelectedVote] = useState<boolean | null>(
    userVote?.isLegitimate || null
  );
  const [confidenceLevel, setConfidenceLevel] = useState<number>(
    userVote?.confidenceLevel || 5
  );
  const [isVoting, setIsVoting] = useState(false);
  const [justVoted, setJustVoted] = useState(false);

  // Check if user has already voted
  const hasVoted = userVote !== undefined;

  const handleVote = async (isLegitimate: boolean) => {
    if (hasVoted) return; // Prevent voting if already voted

    setIsVoting(true);
    try {
      setSelectedVote(isLegitimate);
      await onVote(isLegitimate, confidenceLevel);
      setJustVoted(true);
      // Keep the message visible permanently after voting
    } catch (error) {
      console.error("Vote failed:", error);
    } finally {
      setIsVoting(false);
    }
  };

  const getConfidenceColor = (level: number) => {
    if (level >= 8) return "text-green-600";
    if (level >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceLabel = (level: number) => {
    if (level >= 8) return "High Confidence";
    if (level >= 6) return "Medium Confidence";
    return "Low Confidence";
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-900">
          Community Voting
        </h4>
        <div className="flex items-center text-sm text-gray-600">
          <Users className="h-4 w-4 mr-1" />
          {currentRating.totalVotes} votes
        </div>
      </div>

      {/* Current Rating */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Current Rating
          </span>
          <span className="text-lg font-bold text-gray-900">
            {currentRating.finalScore}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className={`h-2 rounded-full ${
              currentRating.finalScore >= 70
                ? "bg-green-500"
                : currentRating.finalScore >= 50
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
            style={{ width: `${currentRating.finalScore}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{currentRating.negativeVotes} Negative</span>
          <span>{currentRating.positiveVotes} Positive</span>
        </div>
      </div>

      {/* Vote Buttons */}
      <div className="mb-4">
        <h5 className="text-sm font-medium text-gray-700 mb-3">
          Is this project legitimate?
        </h5>

        {/* Success message immediately after voting */}
        {justVoted && (
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm text-blue-700 font-medium">
                ✅ Vote submitted! You voted:{" "}
                {userVote?.isLegitimate ? "Legitimate" : "Suspicious"}{" "}
                (Confidence: {userVote?.confidenceLevel}/10)
              </span>
            </div>
            <div className="mt-2 p-2 bg-blue-100 rounded border border-blue-300">
              <span className="text-sm text-blue-800 font-medium">
                🔍 Next step: Click "Verify Proof" to complete the analysis!
              </span>
            </div>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={() => handleVote(true)}
            disabled={isVoting || hasVoted}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg border-2 transition-colors ${
              selectedVote === true
                ? "border-green-500 bg-green-50 text-green-700"
                : "border-gray-200 hover:border-green-300 text-gray-700"
            } ${isVoting || hasVoted ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <ThumbsUp className="h-5 w-5 mr-2" />
            Legitimate
          </button>
          <button
            onClick={() => handleVote(false)}
            disabled={isVoting || hasVoted}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg border-2 transition-colors ${
              selectedVote === false
                ? "border-red-500 bg-red-50 text-red-700"
                : "border-gray-200 hover:border-red-300 text-gray-700"
            } ${isVoting || hasVoted ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <ThumbsDown className="h-5 w-5 mr-2" />
            Suspicious
          </button>
        </div>
      </div>

      {/* Confidence Level */}
      <div className="mb-4">
        <h5 className="text-sm font-medium text-gray-700 mb-2">
          Confidence Level: {confidenceLevel}/10
        </h5>
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min="1"
            max="10"
            value={confidenceLevel}
            onChange={(e) => setConfidenceLevel(Number(e.target.value))}
            disabled={hasVoted}
            className={`flex-1 h-2 bg-gray-200 rounded-lg appearance-none ${
              hasVoted ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            }`}
          />
          <span
            className={`text-sm font-medium ${getConfidenceColor(
              confidenceLevel
            )}`}
          >
            {getConfidenceLabel(confidenceLevel)}
          </span>
        </div>
      </div>

      {/* Verification Status */}
      {currentRating.verified && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <div className="flex items-center text-green-700">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span className="text-sm font-medium">
              Project Verified by Community
            </span>
          </div>
        </div>
      )}

      {/* Voting Guidelines */}
      <div className="bg-gray-50 rounded-lg p-3">
        <h6 className="text-xs font-medium text-gray-700 mb-1">
          Voting Guidelines
        </h6>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Consider transparency indicators</li>
          <li>• Evaluate risk factors</li>
          <li>• Check for scam patterns</li>
          <li>• Vote based on evidence</li>
        </ul>
      </div>
    </div>
  );
};

export default CommunityVotingPanel;
