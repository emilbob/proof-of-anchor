import React from "react";
import { CheckCircle, XCircle, AlertTriangle, Circle } from "lucide-react";
import { ProjectTransparencyCardProps } from "../types";
import Meter, { MeterState, QUALITY_WORDS } from "./Meter";

const ProjectTransparencyCard: React.FC<ProjectTransparencyCardProps> = ({
  projectData,
  legitimacyAssessment,
}) => {
  const transparencyState = (score: number): MeterState =>
    score >= 80 ? "ok" : score >= 60 ? "watch" : "alert";

  // Risk is inverted — a low number is the good outcome
  const riskState = (level: number): MeterState =>
    level <= 3 ? "ok" : level <= 6 ? "watch" : "alert";

  const indicators: { present: boolean; text: string }[] = [
    { present: projectData.metadata.hasPublicGithub, text: "Public GitHub repository" },
    { present: projectData.metadata.hasDocumentedRoadmap, text: "Documented roadmap" },
    { present: projectData.metadata.hasAuditReports, text: "Security audit reports" },
    { present: projectData.metadata.hasTeamVerification, text: "Team verification" },
    { present: projectData.metadata.hasTokenEconomics, text: "Token economics" },
  ];

  const isLegit = legitimacyAssessment.isLegitimate;

  return (
    <div className="panel p-6">
      {/* Header — verdict carries icon + word + color */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <div className="label mb-1">target</div>
          <h4 className="text-base text-ink break-all">{projectData.domain}</h4>
        </div>
        <div
          className={`flex items-center gap-2 shrink-0 px-2 py-1 border ${
            isLegit
              ? "text-ok border-ok/45"
              : "text-danger border-danger/45"
          }`}
        >
          {isLegit ? (
            <CheckCircle className="h-3.5 w-3.5" />
          ) : (
            <XCircle className="h-3.5 w-3.5" />
          )}
          <span className="text-[10px] uppercase tracking-[0.18em]">
            {isLegit ? "legitimate" : "suspicious"}
          </span>
        </div>
      </div>

      <div className="space-y-5 mb-6">
        <Meter
          label="transparency score"
          value={projectData.transparencyScore}
          max={100}
          display={`${projectData.transparencyScore}/100`}
          state={transparencyState(projectData.transparencyScore)}
          words={QUALITY_WORDS}
          segments={20}
        />
        <Meter
          label="risk level"
          value={projectData.riskLevel}
          max={10}
          display={`${projectData.riskLevel}/10`}
          state={riskState(projectData.riskLevel)}
          segments={10}
        />
      </div>

      {/* Indicators — present and absent both listed, so the reader sees
          the full checklist rather than only what passed */}
      <div className="mb-6 pt-5 border-t hairline">
        <div className="label mb-3">transparency indicators</div>
        <div className="space-y-1.5">
          {indicators.map((indicator) => (
            <div
              key={indicator.text}
              className={`flex items-center gap-2 text-xs ${
                indicator.present ? "text-ink-dim" : "text-ink-muted"
              }`}
            >
              {indicator.present ? (
                <CheckCircle className="h-3.5 w-3.5 text-ok shrink-0" />
              ) : (
                <Circle className="h-3.5 w-3.5 shrink-0" />
              )}
              <span className={indicator.present ? "" : "line-through"}>
                {indicator.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {legitimacyAssessment.riskFactors.length > 0 && (
        <div className="mb-6 pt-5 border-t hairline">
          <div className="label mb-3">risk factors</div>
          <div className="space-y-1.5">
            {legitimacyAssessment.riskFactors.map((factor, index) => (
              <div
                key={index}
                className="flex items-start gap-2 text-xs text-danger"
              >
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-px" />
                <span>{factor}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-surface-2 border hairline p-4">
        <div className="label mb-2">recommendation</div>
        <p className="text-xs text-ink-dim leading-relaxed">
          {legitimacyAssessment.overallRecommendation}
        </p>
      </div>
    </div>
  );
};

export default ProjectTransparencyCard;
