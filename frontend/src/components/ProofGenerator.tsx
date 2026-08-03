import React from "react";
import { Upload } from "lucide-react";
import { ProofGeneratorProps } from "../types";

const ProofGenerator: React.FC<ProofGeneratorProps> = ({
  onGenerate,
  disabled,
}) => {
  return (
    <button
      onClick={onGenerate}
      disabled={disabled}
      className="btn-primary flex-1"
    >
      <Upload className="h-4 w-4" />
      <span>Generate Proof</span>
    </button>
  );
};

export default ProofGenerator;
