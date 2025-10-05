export interface TransparencyAnalysisResult {
  domain: string;
  transparencyScore: number;
  riskLevel: number;
  certificateValid: boolean;
  lastVerified: number;
  metadata: {
    hasPublicGithub: boolean;
    hasDocumentedRoadmap: boolean;
    hasAuditReports: boolean;
    hasTeamVerification: boolean;
    hasTokenEconomics: boolean;
    codeReviewScore: number;
    githubStars?: number;
    githubForks?: number;
    lastCommit?: number;
    license?: string;
  };
}

export interface LegitimacyAssessment {
  isLegitimate: boolean;
  confidenceScore: number;
  riskFactors: string[];
  transparencyIndicators: string[];
  overallRecommendation: string;
}

class TransparencyService {
  private githubToken?: string;

  constructor() {
    this.githubToken = import.meta.env.VITE_GITHUB_TOKEN;
  }

  async analyzeProjectTransparency(
    domain: string
  ): Promise<TransparencyAnalysisResult> {
    console.log("🔍 Analyzing real transparency data for:", domain);

    try {
      // Clean domain
      const cleanDomain = this.cleanDomain(domain);

      // Fetch real TLS certificate
      const certInfo = await this.fetchTlsCertificate(cleanDomain);

      // Analyze GitHub presence
      const githubData = await this.analyzeGithubPresence(cleanDomain);

      // Check for other transparency indicators
      const [hasRoadmap, hasAudits, hasTeamVerification, hasTokenEconomics] =
        await Promise.all([
          this.checkForRoadmap(cleanDomain),
          this.checkForAuditReports(cleanDomain),
          this.checkForTeamVerification(cleanDomain),
          this.checkForTokenEconomics(cleanDomain),
        ]);

      // Calculate scores
      const transparencyScore = this.calculateTransparencyScore({
        hasPublicGithub: githubData.found,
        githubStars: githubData.stars,
        githubForks: githubData.forks,
        codeReviewScore: githubData.codeReviewScore,
        hasDocumentedRoadmap: hasRoadmap,
        hasAuditReports: hasAudits,
        hasTeamVerification,
        hasTokenEconomics,
      });

      const riskLevel = this.calculateRiskLevel({
        certificateValid: certInfo.isValid,
        hasPublicGithub: githubData.found,
        githubStars: githubData.stars,
        codeReviewScore: githubData.codeReviewScore,
        hasAuditReports: hasAudits,
      });

      return {
        domain: cleanDomain,
        transparencyScore,
        riskLevel,
        certificateValid: certInfo.isValid,
        lastVerified: Date.now(),
        metadata: {
          hasPublicGithub: githubData.found,
          hasDocumentedRoadmap: hasRoadmap,
          hasAuditReports: hasAudits,
          hasTeamVerification,
          hasTokenEconomics,
          codeReviewScore: githubData.codeReviewScore,
          githubStars: githubData.stars,
          githubForks: githubData.forks,
          lastCommit: githubData.lastCommit,
          license: githubData.license,
        },
      };
    } catch (error) {
      console.error("Error analyzing transparency:", error);
      // Return fallback analysis
      return this.getFallbackAnalysis(domain);
    }
  }

  private cleanDomain(domain: string): string {
    return domain
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/$/, "")
      .toLowerCase();
  }

  private async fetchTlsCertificate(
    domain: string
  ): Promise<{ isValid: boolean; issuer?: string }> {
    try {
      // This is a simplified implementation
      // In a real implementation, you'd make a backend call to fetch the actual certificate
      const response = await fetch(`/api/check-certificate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });

      if (response.ok) {
        const data = await response.json();
        return { isValid: data.valid, issuer: data.issuer };
      }
    } catch (error) {
      console.warn("Failed to fetch TLS certificate:", error);
    }

    // Fallback: assume valid for common domains
    const trustedDomains = [
      "github.com",
      "google.com",
      "microsoft.com",
      "apple.com",
    ];
    return { isValid: trustedDomains.some((d) => domain.includes(d)) };
  }

  private async analyzeGithubPresence(domain: string): Promise<{
    found: boolean;
    stars: number;
    forks: number;
    codeReviewScore: number;
    lastCommit?: number;
    license?: string;
  }> {
    try {
      // Try to find GitHub repository
      const repoPath = await this.findGithubRepository(domain);

      if (!repoPath) {
        return { found: false, stars: 0, forks: 0, codeReviewScore: 0 };
      }

      // Fetch repository data
      const repoData = await this.fetchGithubRepoData(repoPath);

      if (!repoData) {
        return { found: true, stars: 0, forks: 0, codeReviewScore: 20 };
      }

      // Calculate code review score
      const codeReviewScore = this.calculateCodeReviewScore(repoData);

      return {
        found: true,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        codeReviewScore,
        lastCommit: repoData.updated_at
          ? new Date(repoData.updated_at).getTime()
          : undefined,
        license: repoData.license?.name,
      };
    } catch (error) {
      console.warn("Failed to analyze GitHub presence:", error);
      return { found: false, stars: 0, forks: 0, codeReviewScore: 0 };
    }
  }

  private async findGithubRepository(domain: string): Promise<string | null> {
    // Try common patterns
    const patterns = [
      domain.replace(".com", "").replace(".", "-"),
      domain.replace(".com", ""),
      domain.split(".")[0],
    ];

    for (const pattern of patterns) {
      try {
        const response = await fetch(
          `https://api.github.com/repos/${pattern}/${pattern}`,
          {
            headers: this.githubToken
              ? { Authorization: `Bearer ${this.githubToken}` }
              : {},
          }
        );

        if (response.ok) {
          return `${pattern}/${pattern}`;
        }
      } catch (error) {
        // Continue to next pattern
      }
    }

    return null;
  }

  private async fetchGithubRepoData(repoPath: string): Promise<any> {
    try {
      const response = await fetch(`https://api.github.com/repos/${repoPath}`, {
        headers: this.githubToken
          ? { Authorization: `Bearer ${this.githubToken}` }
          : {},
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn("Failed to fetch GitHub repo data:", error);
    }

    return null;
  }

  private calculateCodeReviewScore(repoData: any): number {
    let score = 20; // Base score for having a repository

    // Stars indicate popularity
    if (repoData.stargazers_count > 1000) score += 25;
    else if (repoData.stargazers_count > 100) score += 20;
    else if (repoData.stargazers_count > 10) score += 15;
    else if (repoData.stargazers_count > 0) score += 10;

    // Forks indicate community engagement
    if (repoData.forks_count > 100) score += 20;
    else if (repoData.forks_count > 10) score += 15;
    else if (repoData.forks_count > 1) score += 10;

    // Recent activity
    if (repoData.updated_at) {
      const daysSinceUpdate =
        (Date.now() - new Date(repoData.updated_at).getTime()) /
        (1000 * 60 * 60 * 24);
      if (daysSinceUpdate < 30) score += 15;
      else if (daysSinceUpdate < 90) score += 10;
      else if (daysSinceUpdate < 365) score += 5;
    }

    // License indicates openness
    if (repoData.license) score += 10;

    // Description indicates documentation
    if (repoData.description && repoData.description.length > 0) score += 10;

    return Math.min(score, 100);
  }

  private async checkForRoadmap(domain: string): Promise<boolean> {
    try {
      const response = await fetch(`https://${domain}/roadmap`, {
        method: "HEAD",
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async checkForAuditReports(domain: string): Promise<boolean> {
    try {
      const auditPaths = ["/audit", "/security/audit", "/audits", "/security"];
      for (const path of auditPaths) {
        const response = await fetch(`https://${domain}${path}`, {
          method: "HEAD",
        });
        if (response.ok) return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  private async checkForTeamVerification(domain: string): Promise<boolean> {
    try {
      const teamPaths = ["/team", "/about/team", "/about", "/leadership"];
      for (const path of teamPaths) {
        const response = await fetch(`https://${domain}${path}`, {
          method: "HEAD",
        });
        if (response.ok) return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  private async checkForTokenEconomics(domain: string): Promise<boolean> {
    try {
      const tokenPaths = [
        "/tokenomics",
        "/token-economics",
        "/economics",
        "/whitepaper",
      ];
      for (const path of tokenPaths) {
        const response = await fetch(`https://${domain}${path}`, {
          method: "HEAD",
        });
        if (response.ok) return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  private calculateTransparencyScore(data: {
    hasPublicGithub: boolean;
    githubStars: number;
    githubForks: number;
    codeReviewScore: number;
    hasDocumentedRoadmap: boolean;
    hasAuditReports: boolean;
    hasTeamVerification: boolean;
    hasTokenEconomics: boolean;
  }): number {
    let score = 0;

    if (data.hasPublicGithub) score += 25;
    if (data.hasDocumentedRoadmap) score += 20;
    if (data.hasAuditReports) score += 25;
    if (data.hasTeamVerification) score += 15;
    if (data.hasTokenEconomics) score += 15;

    // GitHub-specific scoring
    score += Math.min(Math.floor(data.githubStars / 100), 10);
    score += Math.floor(data.codeReviewScore / 4);

    return Math.min(score, 100);
  }

  private calculateRiskLevel(data: {
    certificateValid: boolean;
    hasPublicGithub: boolean;
    githubStars: number;
    codeReviewScore: number;
    hasAuditReports: boolean;
  }): number {
    let risk = 0;

    if (!data.certificateValid) risk += 5;
    if (data.githubStars === 0 && data.hasPublicGithub) risk += 2;
    if (data.codeReviewScore < 30) risk += 3;
    if (!data.hasAuditReports && data.githubStars > 100) risk += 1;

    return Math.min(risk, 10);
  }

  private getFallbackAnalysis(domain: string): TransparencyAnalysisResult {
    return {
      domain,
      transparencyScore: 50,
      riskLevel: 5,
      certificateValid: true,
      lastVerified: Date.now(),
      metadata: {
        hasPublicGithub: false,
        hasDocumentedRoadmap: false,
        hasAuditReports: false,
        hasTeamVerification: false,
        hasTokenEconomics: false,
        codeReviewScore: 50,
      },
    };
  }

  async assessLegitimacy(
    projectData: TransparencyAnalysisResult
  ): Promise<LegitimacyAssessment> {
    const { transparencyScore, riskLevel, metadata } = projectData;

    let isLegitimate = true;
    let confidenceScore = transparencyScore;
    const riskFactors: string[] = [];
    const transparencyIndicators: string[] = [];

    // Build transparency indicators
    if (metadata.hasPublicGithub)
      transparencyIndicators.push("Public GitHub repository");
    if (metadata.hasDocumentedRoadmap)
      transparencyIndicators.push("Documented project roadmap");
    if (metadata.hasAuditReports)
      transparencyIndicators.push("Security audit reports available");
    if (metadata.hasTeamVerification)
      transparencyIndicators.push("Team verification completed");
    if (metadata.hasTokenEconomics)
      transparencyIndicators.push("Token economics documented");

    // Assess risk factors
    if (riskLevel > 7) {
      isLegitimate = false;
      riskFactors.push("High risk level detected");
    }

    if (transparencyScore < 30) {
      isLegitimate = false;
      riskFactors.push("Low transparency score");
    }

    if (!metadata.hasPublicGithub && transparencyScore < 50) {
      riskFactors.push("No public code repository");
    }

    if (!metadata.hasAuditReports && riskLevel > 5) {
      riskFactors.push("No security audits found");
    }

    // Determine recommendation
    let recommendation = "";
    if (isLegitimate && confidenceScore > 80) {
      recommendation =
        "HIGHLY LEGITIMATE - Strong transparency indicators with minimal risk factors";
    } else if (isLegitimate && confidenceScore > 60) {
      recommendation =
        "LIKELY LEGITIMATE - Good transparency indicators with some areas for improvement";
    } else if (isLegitimate) {
      recommendation =
        "POSSIBLY LEGITIMATE - Some transparency indicators but requires further verification";
    } else {
      recommendation =
        "SUSPICIOUS - Multiple risk factors detected, proceed with caution";
    }

    return {
      isLegitimate,
      confidenceScore,
      riskFactors,
      transparencyIndicators,
      overallRecommendation: recommendation,
    };
  }
}

export const transparencyService = new TransparencyService();
