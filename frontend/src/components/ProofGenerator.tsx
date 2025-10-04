import React from "react";
import { Upload } from "lucide-react";
import { ProofGeneratorProps } from "@/types";

const ProofGenerator: React.FC<ProofGeneratorProps> = ({
  onGenerate,
  disabled,
}) => {
  return (
    <button
      onClick={onGenerate}
      disabled={disabled}
      className="flex items-center justify-center space-x-2 bg-orange-700 text-white px-6 py-3 rounded-lg hover:bg-orange-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <Upload className="h-5 w-5" />
      <span>Generate Proof</span>
    </button>
  );
};

export default ProofGenerator;
