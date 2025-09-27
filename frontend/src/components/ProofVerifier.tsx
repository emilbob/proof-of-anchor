import React from "react";
import { Eye } from "lucide-react";
import { ProofVerifierProps } from "@/types";

const ProofVerifier: React.FC<ProofVerifierProps> = ({
  onVerify,
  disabled,
  status,
  proofHash,
}) => {
  return (
    <button
      onClick={onVerify}
      disabled={disabled}
      className="flex items-center justify-center space-x-2 bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <Eye className="h-5 w-5" />
      <span>Verify Proof</span>
    </button>
  );
};

export default ProofVerifier;
