import React from "react";
import { CheckCircle, XCircle, Shield, Vote, Loader2 } from "lucide-react";
import { StatusIndicatorProps } from "../types";

/** icon + word + color together — the state is never carried by color alone */
const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  verificationResult,
  proofHash,
}) => {
  const getStatusIcon = (): React.ReactElement => {
    switch (status) {
      case "generating":
      case "verifying":
        return <Loader2 className="h-4 w-4 text-accent animate-spin" />;
      case "pending_vote":
        return <Vote className="h-4 w-4 text-accent" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-ok" />;
      case "verification_complete":
        return verificationResult ? (
          <CheckCircle className="h-4 w-4 text-ok" />
        ) : (
          <XCircle className="h-4 w-4 text-danger" />
        );
      case "error":
        return <XCircle className="h-4 w-4 text-danger" />;
      default:
        return <Shield className="h-4 w-4 text-ink-dim" />;
    }
  };

  const getStatusText = (): string => {
    switch (status) {
      case "generating":
        return "generating proof";
      case "verifying":
        return "verifying proof";
      case "pending_vote":
        return "analysis complete — vote required to finalize";
      case "success":
        return "vote recorded — ready for final verification";
      case "verification_complete":
        return verificationResult
          ? "verified — community consensus reached"
          : "verification failed — analysis complete";
      case "error":
        return "operation failed";
      default:
        return "awaiting target";
    }
  };

  const getStatusInk = (): string => {
    switch (status) {
      case "success":
        return "text-ok";
      case "verification_complete":
        return verificationResult ? "text-ok" : "text-danger";
      case "error":
        return "text-danger";
      case "generating":
      case "verifying":
      case "pending_vote":
        return "text-accent";
      default:
        return "text-ink-dim";
    }
  };

  const isRunning = status === "generating" || status === "verifying";

  return (
    <div className="relative bg-surface-2 border hairline p-5 mb-6 overflow-hidden">
      {/* Sweep line only while work is actually in flight */}
      {isRunning && (
        <div className="absolute inset-x-0 top-0 h-px bg-accent/60 animate-poa-scan" />
      )}

      <div className="flex items-center gap-3">
        {getStatusIcon()}
        <span className="text-accent text-sm select-none">&gt;</span>
        <span
          className={`text-sm ${getStatusInk()} ${isRunning ? "caret" : ""}`}
        >
          {getStatusText()}
        </span>
      </div>

      {proofHash && (
        <div className="mt-4 pt-4 border-t hairline">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="label">proof hash</span>
            <code className="text-sm text-accent break-all glow-accent">
              {proofHash}
            </code>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusIndicator;
