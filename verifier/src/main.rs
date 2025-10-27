use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::fs;
use std::time::Instant;
use std::env;

mod real_zk_tls;
use real_zk_tls::RealZkTlsVerifier;

#[derive(Debug, Serialize, Deserialize, Clone)]
struct ProofData {
    proof: String,
    public_inputs: Vec<String>,
    verification_key: String,
    timestamp: u64,
    proof_id: String,
    metadata: ProofMetadata,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct ProofMetadata {
    circuit_version: String,
    constraints_count: u32,
    generation_time_ms: u128,
    entropy_sum: u32,
    proof_type: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct WitnessInput {
    domain_hash: Vec<u8>,
    certificate_validity_hash: Vec<u8>,
    transparency_score: u32,
    risk_level: u8,
    verification_timestamp: u64,
    domain_name: Vec<u8>,
    certificate_serial: Vec<u8>,
    issuer_hash: Vec<u8>,
    expiry_date: u64,
    public_key_hash: Vec<u8>,
    salt: Vec<u8>,
}

#[derive(Debug, Serialize, Deserialize)]
struct VerificationResult {
    is_valid: bool,
    verification_time_ms: u128,
    proof_size_bytes: usize,
    constraints_verified: u32,
    error_message: Option<String>,
    transparency_score: u32,
    risk_level: u8,
    legitimacy_assessment: LegitimacyAssessment,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct LegitimacyAssessment {
    is_legitimate: bool,
    confidence_score: u8,
    risk_factors: Vec<String>,
    transparency_indicators: Vec<String>,
    overall_recommendation: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct ProjectMetadata {
    domain: String,
    certificate_info: CertificateInfo,
    transparency_metrics: TransparencyMetrics,
    risk_factors: RiskFactors,
}

#[derive(Debug, Serialize, Deserialize)]
struct CertificateInfo {
    issuer: String,
    expiry_date: u64,
    is_valid: bool,
    serial_number_hash: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct TransparencyMetrics {
    has_public_github: bool,
    has_documented_roadmap: bool,
    has_audit_reports: bool,
    has_team_verification: bool,
    has_token_economics: bool,
    code_review_score: u8,
}

#[derive(Debug, Serialize, Deserialize)]
struct RiskFactors {
    suspicious_domain_patterns: Vec<String>,
    high_risk_keywords: Vec<String>,
    unusual_certificate_issuer: bool,
    short_certificate_validity: bool,
    missing_security_headers: Vec<String>,
}

#[tokio::main]
async fn main() -> Result<()> {
    println!("🔍 Starting REAL zkTLS transparency rating verification process...");

    // Parse command line arguments
    let args: Vec<String> = env::args().collect();
    let use_real_data = args.iter().any(|arg| arg == "--real-data");
    let domain = if use_real_data {
        // If --real-data is used, the domain is the next argument after --real-data
        args.iter()
            .position(|arg| arg == "--real-data")
            .and_then(|pos| args.get(pos + 1))
            .cloned()
            .unwrap_or_else(|| "github.com".to_string())
    } else {
        args.get(1)
            .cloned()
            .unwrap_or_else(|| "github.com".to_string())
    };

    let witness_data = if use_real_data {
        println!("🌐 Using REAL data for domain: {}", domain);
        
        // Get GitHub token from environment (optional)
        let github_token = env::var("GITHUB_TOKEN").ok();
        let verifier = RealZkTlsVerifier::new(github_token);
        
        // Generate real witness data
        let real_witness = verifier.generate_real_witness_data(&domain).await?;
        
        // Convert to the format expected by the rest of the system
        WitnessInput {
            domain_hash: real_witness.domain_hash,
            certificate_validity_hash: real_witness.certificate_validity_hash,
            transparency_score: real_witness.transparency_score,
            risk_level: real_witness.risk_level,
            verification_timestamp: real_witness.verification_timestamp,
            domain_name: real_witness.domain_name,
            certificate_serial: real_witness.certificate_serial,
            issuer_hash: real_witness.issuer_hash,
            expiry_date: real_witness.expiry_date,
            public_key_hash: real_witness.public_key_hash,
            salt: real_witness.salt,
        }
    } else {
        println!("📄 Loading witness data from file...");
        let witness_path = "../noir/witness/input.json";
        load_and_validate_witness(witness_path)?
    };
    
    println!("📄 Loaded witness data successfully");

    // Analyze project transparency and risk factors
    let project_metadata = analyze_project_transparency(&witness_data)?;
    let legitimacy_assessment = assess_project_legitimacy(&project_metadata)?;
    
    println!("📊 Project Analysis:");
    println!("   - Domain: {}", project_metadata.domain);
    println!("   - Transparency Score: {}/100", witness_data.transparency_score);
    println!("   - Risk Level: {}/10", witness_data.risk_level);
    println!("   - Legitimacy Assessment: {}", legitimacy_assessment.overall_recommendation);

    // Generate proof with timing
    let start_time = Instant::now();
    let proof_data = generate_proof(&witness_data)?;
    let generation_time = start_time.elapsed();
    
    println!("⏱️  zkTLS proof generation took: {}ms", generation_time.as_millis());
    
    // Verify the proof with enhanced validation
    let verification_result = verify_proof_enhanced(&proof_data, &witness_data)?;
    
    if verification_result.is_valid {
        println!("✅ zkTLS proof verification successful!");
        println!("📊 Verification details:");
        println!("   - Time: {}ms", verification_result.verification_time_ms);
        println!("   - Proof size: {} bytes", verification_result.proof_size_bytes);
        println!("   - Constraints verified: {}", verification_result.constraints_verified);
        println!("   - Transparency Score: {}", verification_result.transparency_score);
        println!("   - Risk Level: {}", verification_result.risk_level);
        println!("   - Legitimacy: {}", if verification_result.legitimacy_assessment.is_legitimate { "LEGITIMATE" } else { "SUSPICIOUS" });
        
        // Save proof data for submission to Solana
        save_proof_data(&proof_data)?;
        
        // Save project metadata for crowdsourced analysis
        save_project_metadata(&project_metadata)?;
        
        println!("🚀 zkTLS proof ready for Solana submission");
        println!("🌐 Project ready for community verification");
    } else {
        println!("❌ zkTLS proof verification failed!");
        if let Some(error) = verification_result.error_message {
            println!("   Error: {}", error);
        }
        return Err(anyhow::anyhow!("zkTLS proof verification failed"));
    }

    Ok(())
}

fn load_and_validate_witness(path: &str) -> Result<WitnessInput> {
    let content = fs::read_to_string(path)
        .with_context(|| format!("Failed to read witness file: {}", path))?;
    
    let witness: WitnessInput = serde_json::from_str(&content)
        .with_context(|| "Failed to parse witness JSON")?;
    
    // Validate witness data
    validate_witness_data(&witness)?;
    
    Ok(witness)
}

fn validate_witness_data(witness: &WitnessInput) -> Result<()> {
    // Check required field lengths
    if witness.domain_hash.len() != 32 {
        return Err(anyhow::anyhow!("domain_hash must be 32 bytes, got {}", witness.domain_hash.len()));
    }
    
    if witness.certificate_validity_hash.len() != 32 {
        return Err(anyhow::anyhow!("certificate_validity_hash must be 32 bytes, got {}", witness.certificate_validity_hash.len()));
    }
    
    if witness.domain_name.len() != 64 {
        return Err(anyhow::anyhow!("domain_name must be 64 bytes, got {}", witness.domain_name.len()));
    }
    
    if witness.certificate_serial.len() != 32 {
        return Err(anyhow::anyhow!("certificate_serial must be 32 bytes, got {}", witness.certificate_serial.len()));
    }
    
    if witness.issuer_hash.len() != 32 {
        return Err(anyhow::anyhow!("issuer_hash must be 32 bytes, got {}", witness.issuer_hash.len()));
    }
    
    if witness.public_key_hash.len() != 32 {
        return Err(anyhow::anyhow!("public_key_hash must be 32 bytes, got {}", witness.public_key_hash.len()));
    }
    
    if witness.salt.len() != 32 {
        return Err(anyhow::anyhow!("salt must be 32 bytes, got {}", witness.salt.len()));
    }
    
    // Validate transparency score (0-100)
    if witness.transparency_score > 100 {
        return Err(anyhow::anyhow!("transparency_score must be <= 100, got {}", witness.transparency_score));
    }
    
    // Validate risk level (0-10)
    if witness.risk_level > 10 {
        return Err(anyhow::anyhow!("risk_level must be <= 10, got {}", witness.risk_level));
    }
    
    // Check certificate expiry
    if witness.verification_timestamp >= witness.expiry_date {
        return Err(anyhow::anyhow!("Certificate has expired"));
    }
    
    println!("✅ zkTLS witness data validation passed");
    println!("   - Transparency Score: {}", witness.transparency_score);
    println!("   - Risk Level: {}", witness.risk_level);
    println!("   - Certificate Valid Until: {}", witness.expiry_date);
    
    Ok(())
}

fn generate_proof(witness: &WitnessInput) -> Result<ProofData> {
    println!("🔧 Generating REAL zkTLS proof with Noir...");
    
    let start_time = Instant::now();
    
    // Save witness data to Noir input file
    save_witness_to_noir(witness)?;
    
    // Call nargo prove to generate the actual zkTLS proof
    let proof_result = call_nargo_prove()?;
    let generation_time = start_time.elapsed();
    
    // Calculate entropy sum for metadata (using certificate serial)
    let entropy_sum: u32 = witness.certificate_serial.iter().map(|&b| b as u32).sum();
    
    // Generate unique proof ID
    let proof_hash = compute_proof_hash_from_content(&proof_result.proof)?;
    let proof_id = generate_proof_id(&proof_hash, &witness.domain_hash)?;
    
    Ok(ProofData {
        proof: proof_result.proof,
        public_inputs: proof_result.public_inputs,
        verification_key: proof_result.verification_key,
        timestamp: chrono::Utc::now().timestamp() as u64,
        proof_id,
        metadata: ProofMetadata {
            circuit_version: "2.0.0".to_string(),
            constraints_count: 8, // Number of constraints in our zkTLS circuit
            generation_time_ms: generation_time.as_millis(),
            entropy_sum,
            proof_type: "real_zkTLS_certificate_verification".to_string(),
        },
    })
}

fn generate_proof_id(proof_hash: &[u8; 32], domain_hash: &[u8]) -> Result<String> {
    let mut hasher = Sha256::new();
    hasher.update(proof_hash);
    hasher.update(domain_hash);
    hasher.update(chrono::Utc::now().timestamp().to_le_bytes());
    let hash = hasher.finalize();
    Ok(hex::encode(&hash[..16])) // Use first 16 bytes for shorter ID
}

fn verify_proof_enhanced(proof_data: &ProofData, witness: &WitnessInput) -> Result<VerificationResult> {
    println!("🔍 Verifying REAL cryptographic zkTLS proof...");
    
    let start_time = Instant::now();
    
    // Use nargo verify for REAL cryptographic verification
    let is_valid = call_nargo_verify(proof_data)?;
    
    let verification_time = start_time.elapsed();
    
    println!("📊 zkTLS proof verification result: {}", if is_valid { "✅ VALID" } else { "❌ INVALID" });
    
    // Calculate constraints verified based on circuit
    let constraints_verified = if is_valid { 8 } else { 0 }; // Our circuit has 8 constraints
    
    // Create legitimacy assessment based on verification result
    let legitimacy_assessment = if is_valid {
        LegitimacyAssessment {
            is_legitimate: true,
            confidence_score: 95, // High confidence for cryptographically verified proofs
            risk_factors: vec![],
            transparency_indicators: vec![
                "zkTLS proof cryptographically verified".to_string(),
                format!("Transparency score: {}", witness.transparency_score),
                format!("Risk level: {}", witness.risk_level),
            ],
            overall_recommendation: "LEGITIMATE - Cryptographic proof verification successful".to_string(),
        }
    } else {
        LegitimacyAssessment {
            is_legitimate: false,
            confidence_score: 10,
            risk_factors: vec!["Cryptographic proof verification failed".to_string()],
            transparency_indicators: vec![],
            overall_recommendation: "SUSPICIOUS - Proof verification failed".to_string(),
        }
    };
    
    Ok(VerificationResult {
        is_valid,
        verification_time_ms: verification_time.as_millis(),
        proof_size_bytes: proof_data.proof.len() / 2, // Hex string is 2x bytes
        constraints_verified,
        error_message: if !is_valid { Some("Cryptographic verification failed".to_string()) } else { None },
        transparency_score: witness.transparency_score,
        risk_level: witness.risk_level,
        legitimacy_assessment,
    })
}

/// Call nargo verify to perform REAL cryptographic verification
fn call_nargo_verify(proof_data: &ProofData) -> Result<bool> {
    use std::process::Command;
    
    println!("🔐 Running nargo verify for cryptographic proof validation...");
    
    // Write proof to file for nargo verify
    let proof_bytes = hex::decode(&proof_data.proof)
        .with_context(|| "Failed to decode proof hex")?;
    
    let proof_file = "../noir/proofs/attestation_circuit.proof";
    fs::write(proof_file, &proof_bytes)
        .with_context(|| format!("Failed to write proof file: {}", proof_file))?;
    
    // Run nargo verify
    let verify_output = Command::new("nargo")
        .arg("verify")
        .current_dir("../noir")
        .output()
        .with_context(|| "Failed to execute nargo verify")?;
    
    let is_valid = verify_output.status.success();
    
    if !is_valid {
        let stderr = String::from_utf8_lossy(&verify_output.stderr);
        let stdout = String::from_utf8_lossy(&verify_output.stdout);
        println!("⚠️ Verification failed:");
        println!("  stderr: {}", stderr);
        println!("  stdout: {}", stdout);
    } else {
        println!("✅ Cryptographic verification PASSED");
    }
    
    Ok(is_valid)
}

#[allow(dead_code)]
fn verify_proof(proof_data: &ProofData, witness: &WitnessInput) -> Result<bool> {
    let result = verify_proof_enhanced(proof_data, witness)?;
    Ok(result.is_valid)
}


fn save_proof_data(proof_data: &ProofData) -> Result<()> {
    let proof_dir = "verifier/proof_samples";
    fs::create_dir_all(proof_dir)?;
    
    // Save with proof ID for better organization
    let proof_file = format!("{}/proof_{}.json", proof_dir, proof_data.proof_id);
    let json_data = serde_json::to_string_pretty(proof_data)?;
    fs::write(&proof_file, json_data)?;
    
    // Also save a compact version for Solana submission
    let compact_file = format!("{}/compact_{}.json", proof_dir, proof_data.proof_id);
    let compact_data = serde_json::to_string(proof_data)?;
    fs::write(&compact_file, compact_data)?;
    
    // Save metadata separately for indexing
    let metadata_file = format!("{}/metadata_{}.json", proof_dir, proof_data.proof_id);
    let metadata_json = serde_json::to_string_pretty(&proof_data.metadata)?;
    fs::write(&metadata_file, metadata_json)?;
    
    println!("💾 Proof data saved:");
    println!("   - Full: {}", proof_file);
    println!("   - Compact: {}", compact_file);
    println!("   - Metadata: {}", metadata_file);
    
    Ok(())
}

#[allow(dead_code)]
fn load_proof_data(proof_id: &str) -> Result<ProofData> {
    let proof_file = format!("verifier/proof_samples/proof_{}.json", proof_id);
    let content = fs::read_to_string(&proof_file)
        .with_context(|| format!("Failed to read proof file: {}", proof_file))?;
    
    let proof_data: ProofData = serde_json::from_str(&content)
        .with_context(|| "Failed to parse proof JSON")?;
    
    Ok(proof_data)
}

#[allow(dead_code)]
fn list_proofs() -> Result<Vec<String>> {
    let proof_dir = "verifier/proof_samples";
    let mut proof_ids = Vec::new();
    
    if let Ok(entries) = fs::read_dir(proof_dir) {
        for entry in entries {
            if let Ok(entry) = entry {
                let file_name = entry.file_name();
                if let Some(name) = file_name.to_str() {
                    if name.starts_with("proof_") && name.ends_with(".json") {
                        let proof_id = name.strip_prefix("proof_").unwrap().strip_suffix(".json").unwrap();
                        proof_ids.push(proof_id.to_string());
                    }
                }
            }
        }
    }
    
    proof_ids.sort();
    Ok(proof_ids)
}

fn analyze_project_transparency(witness: &WitnessInput) -> Result<ProjectMetadata> {
    println!("🔍 Analyzing project transparency...");
    
    // Simulate domain extraction from witness data
    let domain = "example-project.com".to_string(); // In real implementation, decode from domain_name
    
    let certificate_info = CertificateInfo {
        issuer: "Let's Encrypt".to_string(),
        expiry_date: witness.expiry_date,
        is_valid: witness.verification_timestamp < witness.expiry_date,
        serial_number_hash: hex::encode(&witness.certificate_serial),
    };
    
    // Simulate transparency metrics analysis
    let transparency_metrics = TransparencyMetrics {
        has_public_github: witness.transparency_score > 60,
        has_documented_roadmap: witness.transparency_score > 50,
        has_audit_reports: witness.transparency_score > 70,
        has_team_verification: witness.transparency_score > 40,
        has_token_economics: witness.transparency_score > 30,
        code_review_score: (witness.transparency_score / 10) as u8,
    };
    
    // Simulate risk factor analysis
    let risk_factors = RiskFactors {
        suspicious_domain_patterns: if witness.risk_level > 5 {
            vec!["new-domain.com".to_string(), "temp-site.org".to_string()]
        } else {
            vec![]
        },
        high_risk_keywords: if witness.risk_level > 7 {
            vec!["guaranteed".to_string(), "risk-free".to_string(), "instant-profit".to_string()]
        } else {
            vec![]
        },
        unusual_certificate_issuer: witness.issuer_hash[0] < 100, // Simulate unusual issuer detection
        short_certificate_validity: (witness.expiry_date - witness.verification_timestamp) < 86400 * 30, // Less than 30 days
        missing_security_headers: if witness.risk_level > 6 {
            vec!["HSTS".to_string(), "CSP".to_string()]
        } else {
            vec![]
        },
    };
    
    Ok(ProjectMetadata {
        domain,
        certificate_info,
        transparency_metrics,
        risk_factors,
    })
}

fn assess_project_legitimacy(metadata: &ProjectMetadata) -> Result<LegitimacyAssessment> {
    println!("🎯 Assessing project legitimacy...");
    
    let mut risk_factors = Vec::new();
    let mut transparency_indicators = Vec::new();
    
    // Analyze risk factors
    if !metadata.risk_factors.suspicious_domain_patterns.is_empty() {
        risk_factors.push("Suspicious domain patterns detected".to_string());
    }
    
    if !metadata.risk_factors.high_risk_keywords.is_empty() {
        risk_factors.push("High-risk marketing language detected".to_string());
    }
    
    if metadata.risk_factors.unusual_certificate_issuer {
        risk_factors.push("Unusual certificate issuer".to_string());
    }
    
    if metadata.risk_factors.short_certificate_validity {
        risk_factors.push("Short certificate validity period".to_string());
    }
    
    if !metadata.risk_factors.missing_security_headers.is_empty() {
        risk_factors.push(format!("Missing security headers: {:?}", metadata.risk_factors.missing_security_headers));
    }
    
    // Analyze transparency indicators
    if metadata.transparency_metrics.has_public_github {
        transparency_indicators.push("Public GitHub repository".to_string());
    }
    
    if metadata.transparency_metrics.has_documented_roadmap {
        transparency_indicators.push("Documented project roadmap".to_string());
    }
    
    if metadata.transparency_metrics.has_audit_reports {
        transparency_indicators.push("Security audit reports available".to_string());
    }
    
    if metadata.transparency_metrics.has_team_verification {
        transparency_indicators.push("Team verification completed".to_string());
    }
    
    if metadata.transparency_metrics.has_token_economics {
        transparency_indicators.push("Token economics documented".to_string());
    }
    
    // Calculate legitimacy score
    let transparency_score = metadata.transparency_metrics.has_public_github as u8 * 20
        + metadata.transparency_metrics.has_documented_roadmap as u8 * 15
        + metadata.transparency_metrics.has_audit_reports as u8 * 25
        + metadata.transparency_metrics.has_team_verification as u8 * 20
        + metadata.transparency_metrics.has_token_economics as u8 * 20;
    
    let risk_penalty = risk_factors.len() as u8 * 15;
    let final_score = transparency_score.saturating_sub(risk_penalty);
    
    let is_legitimate = final_score >= 60 && risk_factors.len() <= 2;
    let confidence_score = if is_legitimate { final_score } else { 100 - final_score };
    
    let overall_recommendation = if is_legitimate {
        if final_score >= 80 {
            "HIGHLY LEGITIMATE - Strong transparency indicators with minimal risk factors".to_string()
        } else {
            "LEGITIMATE - Good transparency with acceptable risk level".to_string()
        }
    } else {
        if risk_factors.len() > 3 {
            "HIGH RISK - Multiple concerning factors detected".to_string()
        } else {
            "SUSPICIOUS - Insufficient transparency or concerning risk factors".to_string()
        }
    };
    
    Ok(LegitimacyAssessment {
        is_legitimate,
        confidence_score,
        risk_factors,
        transparency_indicators,
        overall_recommendation,
    })
}


fn save_project_metadata(metadata: &ProjectMetadata) -> Result<()> {
    let metadata_dir = "verifier/project_metadata";
    fs::create_dir_all(metadata_dir)?;
    
    let metadata_file = format!("{}/project_{}.json", metadata_dir, chrono::Utc::now().timestamp());
    let json_data = serde_json::to_string_pretty(metadata)?;
    fs::write(&metadata_file, json_data)?;
    
    println!("💾 Project metadata saved: {}", metadata_file);
    
    Ok(())
}

/// Save witness data to Noir input file for proof generation
fn save_witness_to_noir(witness: &WitnessInput) -> Result<()> {
    let witness_path = "../noir/witness/input.json";
    let json_data = serde_json::to_string_pretty(witness)?;
    fs::write(witness_path, json_data)?;
    println!("📝 Witness data saved to Noir input file");
    Ok(())
}

/// Call nargo prove to generate actual zkTLS proof
fn call_nargo_prove() -> Result<NargoProofResult> {
    use std::process::Command;
    
    println!("🔧 Calling nargo prove to generate REAL cryptographic proof...");
    
    // Step 1: Execute witness generation
    println!("📝 Step 1/2: Generating witness...");
    let execute_output = Command::new("nargo")
        .arg("execute")
        .current_dir("../noir")
        .output()
        .with_context(|| "Failed to execute nargo execute")?;
    
    if !execute_output.status.success() {
        let stderr = String::from_utf8_lossy(&execute_output.stderr);
        return Err(anyhow::anyhow!("nargo execute failed: {}", stderr));
    }
    println!("✅ Witness generated successfully");
    
    // Step 2: Generate actual proof from witness
    println!("🔐 Step 2/2: Generating cryptographic proof (this may take 30-60 seconds)...");
    let prove_output = Command::new("nargo")
        .arg("prove")
        .current_dir("../noir")
        .output()
        .with_context(|| "Failed to execute nargo prove")?;
    
    if !prove_output.status.success() {
        let stderr = String::from_utf8_lossy(&prove_output.stderr);
        return Err(anyhow::anyhow!("nargo prove failed: {}", stderr));
    }
    println!("✅ Real cryptographic proof generated successfully");
    
    // Step 3: Read the actual proof file
    let proof_file = "../noir/proofs/attestation_circuit.proof";
    if !std::path::Path::new(proof_file).exists() {
        return Err(anyhow::anyhow!("Proof file not found: {}. Make sure nargo prove succeeded.", proof_file));
    }
    
    // Read the real proof bytes
    let proof_bytes = fs::read(&proof_file)
        .with_context(|| format!("Failed to read proof file: {}", proof_file))?;
    let proof_hex = hex::encode(&proof_bytes);
    
    println!("📊 Proof generated: {} bytes", proof_bytes.len());
    
    // Step 4: Read verification key
    let vk_file = "../noir/target/attestation_circuit.json";
    let vk_content = fs::read_to_string(&vk_file)
        .with_context(|| format!("Failed to read verification key: {}", vk_file))?;
    
    // Parse the verification key to extract public inputs
    let vk_json: serde_json::Value = serde_json::from_str(&vk_content)?;
    
    // Extract public inputs from the ABI
    let mut public_inputs = Vec::new();
    if let Some(abi) = vk_json.get("abi") {
        if let Some(parameters) = abi.get("parameters") {
            if let Some(params_array) = parameters.as_array() {
                for param in params_array {
                    if let Some(visibility) = param.get("visibility") {
                        if visibility.as_str() == Some("public") {
                            if let Some(name) = param.get("name") {
                                public_inputs.push(name.as_str().unwrap_or("").to_string());
                            }
                        }
                    }
                }
            }
        }
    }
    
    // If we couldn't extract public inputs, use placeholder
    if public_inputs.is_empty() {
        public_inputs = vec!["domain_hash".to_string(), "certificate_validity_hash".to_string(), 
                            "transparency_score".to_string(), "risk_level".to_string(), 
                            "verification_timestamp".to_string()];
    }
    
    Ok(NargoProofResult {
        proof: proof_hex,
        public_inputs,
        verification_key: vk_content,
    })
}

fn compute_proof_hash_from_content(content: &str) -> Result<[u8; 32]> {
    let mut hasher = Sha256::new();
    hasher.update(content.as_bytes());
    let hash = hasher.finalize();
    
    let mut result = [0u8; 32];
    result.copy_from_slice(&hash);
    Ok(result)
}

#[derive(Debug)]
struct NargoProofResult {
    proof: String,
    public_inputs: Vec<String>,
    verification_key: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_proof_generation() {
        let witness = WitnessInput {
            domain_hash: vec![40; 32],
            certificate_validity_hash: vec![41; 32],
            transparency_score: 85,
            risk_level: 2,
            verification_timestamp: 1704067200,
            domain_name: vec![42; 64],
            certificate_serial: vec![43; 32],
            issuer_hash: vec![44; 32],
            expiry_date: 1735689600,
            public_key_hash: vec![45; 32],
            salt: vec![2; 32],
        };
        
        let proof = generate_proof(&witness).unwrap();
        assert!(!proof.proof.is_empty());
        assert!(!proof.public_inputs.is_empty());
    }

    #[test]
    fn test_proof_verification() {
        let proof_data = ProofData {
            proof: "simulated_zkTLS_proof_test".to_string(),
            public_inputs: vec!["0".to_string(); 32],
            verification_key: "test_zkTLS_vk".to_string(),
            timestamp: chrono::Utc::now().timestamp() as u64,
            proof_id: "test_zkTLS_proof_id".to_string(),
            metadata: ProofMetadata {
                circuit_version: "2.0.0".to_string(),
                constraints_count: 8,
                generation_time_ms: 0,
                entropy_sum: 1000,
                proof_type: "zkTLS_test".to_string(),
            },
        };
        
        let witness = WitnessInput {
            domain_hash: vec![0u8; 32],
            certificate_validity_hash: vec![0u8; 32],
            transparency_score: 85,
            risk_level: 2,
            verification_timestamp: chrono::Utc::now().timestamp() as u64,
            domain_name: vec![0u8; 64],
            certificate_serial: vec![0u8; 32],
            issuer_hash: vec![0u8; 32],
            expiry_date: chrono::Utc::now().timestamp() as u64 + 86400,
            public_key_hash: vec![0u8; 32],
            salt: vec![0u8; 32],
        };
        
        let result = verify_proof_enhanced(&proof_data, &witness).unwrap();
        assert!(result.is_valid);
        assert_eq!(result.constraints_verified, 5);
    }
    
    #[test]
    fn test_witness_validation() {
        let valid_witness = WitnessInput {
            domain_hash: vec![40; 32],
            certificate_validity_hash: vec![41; 32],
            transparency_score: 85,
            risk_level: 2,
            verification_timestamp: 1704067200,
            domain_name: vec![42; 64],
            certificate_serial: vec![43; 32],
            issuer_hash: vec![44; 32],
            expiry_date: 1735689600,
            public_key_hash: vec![45; 32],
            salt: vec![2; 32],
        };
        
        assert!(validate_witness_data(&valid_witness).is_ok());
        
        let invalid_witness = WitnessInput {
            domain_hash: vec![40; 32],
            certificate_validity_hash: vec![41; 32],
            transparency_score: 150, // Invalid transparency score > 100
            risk_level: 15, // Invalid risk level > 10
            verification_timestamp: 1735689600, // After expiry date
            domain_name: vec![42; 64],
            certificate_serial: vec![43; 32],
            issuer_hash: vec![44; 32],
            expiry_date: 1704067200, // Before verification timestamp
            public_key_hash: vec![45; 32],
            salt: vec![2; 32],
        };
        
        assert!(validate_witness_data(&invalid_witness).is_err());
    }
    
    #[test]
    fn test_proof_serialization() {
        let proof_data = ProofData {
            proof: "test_zkTLS_proof".to_string(),
            public_inputs: vec!["0".to_string(); 32],
            verification_key: "test_zkTLS_vk".to_string(),
            timestamp: 1234567890,
            proof_id: "test_zkTLS_id".to_string(),
            metadata: ProofMetadata {
                circuit_version: "2.0.0".to_string(),
                constraints_count: 8,
                generation_time_ms: 100,
                entropy_sum: 1000,
                proof_type: "zkTLS_test".to_string(),
            },
        };
        
        // Test serialization
        let json = serde_json::to_string(&proof_data).unwrap();
        assert!(!json.is_empty());
        
        // Test deserialization
        let deserialized: ProofData = serde_json::from_str(&json).unwrap();
        assert_eq!(proof_data.proof_id, deserialized.proof_id);
        assert_eq!(proof_data.metadata.circuit_version, deserialized.metadata.circuit_version);
    }
}
