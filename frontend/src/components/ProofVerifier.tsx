import React from "react";
import { Eye } from "lucide-react";
import { ProofVerifierProps } from "../types";

const ProofVerifier: React.FC<ProofVerifierProps> = ({
  onVerify,
  disabled,
}) => {
  return (
    <button
      onClick={onVerify}
      disabled={disabled}
      className="btn-ok flex-1"
    >
      <Eye className="h-4 w-4" />
      <span>Verify Proof</span>
    </button>
  );
};

export default ProofVerifier;
