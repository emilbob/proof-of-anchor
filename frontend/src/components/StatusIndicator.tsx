import React from "react";
import { CheckCircle, XCircle, Shield, Vote } from "lucide-react";
import { StatusIndicatorProps } from "../types";

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  verificationResult,
  proofHash,
}) => {
  const getStatusIcon = (): React.ReactElement => {
    switch (status) {
      case "generating":
      case "verifying":
        return (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-700"></div>
        );
      case "pending_vote":
        return <Vote className="h-6 w-6 text-blue-700" />;
      case "success":
        return <CheckCircle className="h-6 w-6 text-green-700" />;
      case "verification_complete":
        return <CheckCircle className="h-8 w-8 text-green-600" />;
      case "error":
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Shield className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusText = (): string => {
    switch (status) {
      case "generating":
        return "Generating proof...";
      case "verifying":
        return "Verifying proof...";
      case "pending_vote":
        return "Analysis complete! Vote required to finalize.";
      case "success":
        return "Ready for final verification!";
      case "verification_complete":
        return verificationResult
          ? "🎉 Analysis Complete! Project verified and community consensus reached."
          : "❌ Verification failed, but analysis complete.";
      case "error":
        return "Operation failed";
      default:
        return "Ready to generate proof";
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-center space-x-3">
        {getStatusIcon()}
        <span className="text-lg font-medium text-gray-700">
          {getStatusText()}
        </span>
      </div>
      {proofHash && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500 mb-2">Proof Hash:</p>
          <code className="bg-gray-200 px-3 py-1 rounded text-sm font-mono">
            {proofHash}
          </code>
        </div>
      )}
    </div>
  );
};

export default StatusIndicator;
