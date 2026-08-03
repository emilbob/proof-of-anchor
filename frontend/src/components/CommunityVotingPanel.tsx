import React, { useState } from "react";
import { ThumbsUp, ThumbsDown, Users, CheckCircle, ArrowRight } from "lucide-react";
import { CommunityVotingPanelProps } from "../types";
import Meter, {
  MeterState,
  QUALITY_WORDS,
  CONFIDENCE_WORDS,
} from "./Meter";

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

  const consensusState = (score: number): MeterState =>
    score >= 70 ? "ok" : score >= 50 ? "watch" : "alert";

  const confidenceState = (level: number): MeterState =>
    level >= 8 ? "ok" : level >= 6 ? "watch" : "alert";

  return (
    <div className="panel p-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <div className="label mb-1">consensus</div>
          <h4 className="text-base text-ink">Community Voting</h4>
        </div>
        <div className="flex items-center gap-2 text-xs text-ink-dim shrink-0">
          <Users className="h-3.5 w-3.5" />
          <span className="tabular-nums">{currentRating.totalVotes}</span>
          <span className="label">
            {currentRating.totalVotes === 1 ? "vote" : "votes"}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <Meter
          label="current rating"
          value={currentRating.finalScore}
          max={100}
          display={`${currentRating.finalScore}%`}
          state={consensusState(currentRating.finalScore)}
          words={QUALITY_WORDS}
          segments={20}
        />
        <div className="flex justify-between mt-2">
          <span className="label">
            {currentRating.negativeVotes} negative
          </span>
          <span className="label">
            {currentRating.positiveVotes} positive
          </span>
        </div>
      </div>

      {/* Vote */}
      <div className="mb-6 pt-5 border-t hairline">
        <div className="label mb-3">is this project legitimate?</div>

        {justVoted && (
          <div className="notice text-ok mb-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 shrink-0 mt-px" />
              <div className="text-xs text-ink-dim">
                <div>
                  Vote submitted —{" "}
                  <span className="text-ok">
                    {userVote?.isLegitimate ? "legitimate" : "suspicious"}
                  </span>
                  , confidence {userVote?.confidenceLevel}/10
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-accent">
                  <ArrowRight className="h-3 w-3 shrink-0" />
                  <span>Next: click Verify Proof to complete the analysis</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => handleVote(true)}
            disabled={isVoting || hasVoted}
            className={`btn flex-1 ${
              selectedVote === true
                ? "text-ok border-ok bg-ok/10"
                : "text-ink-dim hairline hover:text-ok hover:border-ok/45"
            }`}
          >
            <ThumbsUp className="h-4 w-4" />
            Legitimate
          </button>
          <button
            onClick={() => handleVote(false)}
            disabled={isVoting || hasVoted}
            className={`btn flex-1 ${
              selectedVote === false
                ? "text-danger border-danger bg-danger/10"
                : "text-ink-dim hairline hover:text-danger hover:border-danger/45"
            }`}
          >
            <ThumbsDown className="h-4 w-4" />
            Suspicious
          </button>
        </div>
      </div>

      {/* Confidence */}
      <div className="mb-6">
        <Meter
          label="confidence level"
          value={confidenceLevel}
          max={10}
          display={`${confidenceLevel}/10`}
          state={confidenceState(confidenceLevel)}
          words={CONFIDENCE_WORDS}
          segments={10}
        />
        <input
          type="range"
          min="1"
          max="10"
          value={confidenceLevel}
          onChange={(e) => setConfidenceLevel(Number(e.target.value))}
          disabled={hasVoted}
          aria-label="Confidence level"
          className={`w-full mt-3 accent-accent ${
            hasVoted ? "cursor-not-allowed opacity-40" : "cursor-pointer"
          }`}
        />
      </div>

      {currentRating.verified && (
        <div className="notice text-ok mb-6">
          <div className="flex items-center gap-2 text-xs text-ink-dim">
            <CheckCircle className="h-4 w-4 text-ok shrink-0" />
            <span>Project verified by community</span>
          </div>
        </div>
      )}

      <div className="bg-surface-2 border hairline p-4">
        <div className="label mb-2">voting guidelines</div>
        <ul className="text-xs text-ink-dim space-y-1">
          <li>— Consider transparency indicators</li>
          <li>— Evaluate risk factors</li>
          <li>— Check for scam patterns</li>
          <li>— Vote based on evidence</li>
        </ul>
      </div>
    </div>
  );
};

export default CommunityVotingPanel;
