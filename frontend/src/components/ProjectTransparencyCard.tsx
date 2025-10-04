import React from "react";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { ProjectTransparencyCardProps } from "@/types";

const ProjectTransparencyCard: React.FC<ProjectTransparencyCardProps> = ({
  projectData,
  legitimacyAssessment,
}) => {
  const getTransparencyColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getRiskColor = (level: number) => {
    if (level <= 3) return "text-green-600";
    if (level <= 6) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-900">
          {projectData.domain}
        </h4>
        <div
          className={`flex items-center ${
            legitimacyAssessment.isLegitimate
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {legitimacyAssessment.isLegitimate ? (
            <CheckCircle className="h-5 w-5 mr-1" />
          ) : (
            <XCircle className="h-5 w-5 mr-1" />
          )}
          <span className="text-sm font-medium">
            {legitimacyAssessment.isLegitimate ? "LEGITIMATE" : "SUSPICIOUS"}
          </span>
        </div>
      </div>

      {/* Transparency Score */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Transparency Score
          </span>
          <span
            className={`text-lg font-bold ${getTransparencyColor(
              projectData.transparencyScore
            )}`}
          >
            {projectData.transparencyScore}/100
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              projectData.transparencyScore >= 80
                ? "bg-green-500"
                : projectData.transparencyScore >= 60
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
            style={{ width: `${projectData.transparencyScore}%` }}
          ></div>
        </div>
      </div>

      {/* Risk Level */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Risk Level</span>
          <span
            className={`text-lg font-bold ${getRiskColor(
              projectData.riskLevel
            )}`}
          >
            {projectData.riskLevel}/10
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              projectData.riskLevel <= 3
                ? "bg-green-500"
                : projectData.riskLevel <= 6
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
            style={{ width: `${projectData.riskLevel * 10}%` }}
          ></div>
        </div>
      </div>

      {/* Transparency Indicators */}
      <div className="mb-4">
        <h5 className="text-sm font-medium text-gray-700 mb-2">
          Transparency Indicators
        </h5>
        <div className="space-y-2">
          {projectData.metadata.hasPublicGithub && (
            <div className="flex items-center text-sm text-green-600">
              <CheckCircle className="h-4 w-4 mr-2" />
              Public GitHub Repository
            </div>
          )}
          {projectData.metadata.hasDocumentedRoadmap && (
            <div className="flex items-center text-sm text-green-600">
              <CheckCircle className="h-4 w-4 mr-2" />
              Documented Roadmap
            </div>
          )}
          {projectData.metadata.hasAuditReports && (
            <div className="flex items-center text-sm text-green-600">
              <CheckCircle className="h-4 w-4 mr-2" />
              Security Audit Reports
            </div>
          )}
          {projectData.metadata.hasTeamVerification && (
            <div className="flex items-center text-sm text-green-600">
              <CheckCircle className="h-4 w-4 mr-2" />
              Team Verification
            </div>
          )}
          {!projectData.metadata.hasTokenEconomics && (
            <div className="flex items-center text-sm text-yellow-600">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Missing Token Economics
            </div>
          )}
        </div>
      </div>

      {/* Risk Factors */}
      {legitimacyAssessment.riskFactors.length > 0 && (
        <div className="mb-4">
          <h5 className="text-sm font-medium text-gray-700 mb-2">
            Risk Factors
          </h5>
          <div className="space-y-1">
            {legitimacyAssessment.riskFactors.map((factor, index) => (
              <div
                key={index}
                className="flex items-center text-sm text-red-600"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                {factor}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overall Recommendation */}
      <div className="bg-gray-50 rounded-lg p-3">
        <h5 className="text-sm font-medium text-gray-700 mb-1">
          Recommendation
        </h5>
        <p className="text-sm text-gray-600">
          {legitimacyAssessment.overallRecommendation}
        </p>
      </div>
    </div>
  );
};

export default ProjectTransparencyCard;
