use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::fs;
use std::time::Instant;

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
    public_hash: Vec<u8>,
    public_commitment: Vec<u8>,
    secret_value: Vec<u8>,
    salt: Vec<u8>,
    nonce: Vec<u8>,
}

#[derive(Debug, Serialize, Deserialize)]
struct VerificationResult {
    is_valid: bool,
    verification_time_ms: u128,
    proof_size_bytes: usize,
    constraints_verified: u32,
    error_message: Option<String>,
}

fn main() -> Result<()> {
    println!("🔍 Starting enhanced proof verification process...");

    // Load and validate witness data
    let witness_path = "../noir/witness/input.json";
    let witness_data = load_and_validate_witness(witness_path)?;
    
    println!("📄 Loaded and validated witness data from {}", witness_path);

    // Generate proof with timing
    let start_time = Instant::now();
    let proof_data = generate_proof(&witness_data)?;
    let generation_time = start_time.elapsed();
    
    println!("⏱️  Proof generation took: {}ms", generation_time.as_millis());
    
    // Verify the proof with enhanced validation
    let verification_result = verify_proof_enhanced(&proof_data)?;
    
    if verification_result.is_valid {
        println!("✅ Proof verification successful!");
        println!("📊 Verification details:");
        println!("   - Time: {}ms", verification_result.verification_time_ms);
        println!("   - Proof size: {} bytes", verification_result.proof_size_bytes);
        println!("   - Constraints verified: {}", verification_result.constraints_verified);
        
        // Save proof data for submission to Solana
        save_proof_data(&proof_data)?;
        
        // In a real implementation, you would submit to Solana here
        println!("🚀 Proof ready for Solana submission");
    } else {
        println!("❌ Proof verification failed!");
        if let Some(error) = verification_result.error_message {
            println!("   Error: {}", error);
        }
        return Err(anyhow::anyhow!("Proof verification failed"));
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
    if witness.public_hash.len() != 32 {
        return Err(anyhow::anyhow!("public_hash must be 32 bytes, got {}", witness.public_hash.len()));
    }
    
    if witness.public_commitment.len() != 32 {
        return Err(anyhow::anyhow!("public_commitment must be 32 bytes, got {}", witness.public_commitment.len()));
    }
    
    if witness.secret_value.len() != 32 {
        return Err(anyhow::anyhow!("secret_value must be 32 bytes, got {}", witness.secret_value.len()));
    }
    
    if witness.salt.len() != 32 {
        return Err(anyhow::anyhow!("salt must be 32 bytes, got {}", witness.salt.len()));
    }
    
    if witness.nonce.len() != 16 {
        return Err(anyhow::anyhow!("nonce must be 16 bytes, got {}", witness.nonce.len()));
    }
    
    // Check entropy constraint (sum of secret bytes > 1000)
    let entropy_sum: u32 = witness.secret_value.iter().map(|&b| b as u32).sum();
    if entropy_sum <= 1000 {
        return Err(anyhow::anyhow!("Secret value entropy too low: {} (must be > 1000)", entropy_sum));
    }
    
    // Check non-zero constraint
    let has_nonzero = witness.secret_value.iter().any(|&b| b != 0);
    if !has_nonzero {
        return Err(anyhow::anyhow!("Secret value cannot be all zeros"));
    }
    
    println!("✅ Witness data validation passed");
    println!("   - Entropy sum: {}", entropy_sum);
    println!("   - Has non-zero bytes: {}", has_nonzero);
    
    Ok(())
}

fn generate_proof(witness: &WitnessInput) -> Result<ProofData> {
    println!("🔧 Generating proof...");
    
    let start_time = Instant::now();
    
    // In a real implementation, this would:
    // 1. Call nargo prove to generate the actual proof
    // 2. Load the generated proof and verification key
    
    // For demo purposes, we'll simulate this
    let proof_hash = compute_proof_hash(witness)?;
    let generation_time = start_time.elapsed();
    
    // Calculate entropy sum for metadata
    let entropy_sum: u32 = witness.secret_value.iter().map(|&b| b as u32).sum();
    
    // Generate unique proof ID
    let proof_id = generate_proof_id(&proof_hash, &witness.public_hash)?;
    
    Ok(ProofData {
        proof: format!("simulated_proof_{}", hex::encode(&proof_hash[..8])),
        public_inputs: witness.public_hash.iter().map(|b| b.to_string()).collect(),
        verification_key: "simulated_vk".to_string(),
        timestamp: chrono::Utc::now().timestamp() as u64,
        proof_id,
        metadata: ProofMetadata {
            circuit_version: "1.0.0".to_string(),
            constraints_count: 6, // Number of constraints in our circuit
            generation_time_ms: generation_time.as_millis(),
            entropy_sum,
            proof_type: "knowledge_proof".to_string(),
        },
    })
}

fn generate_proof_id(proof_hash: &[u8; 32], public_hash: &[u8]) -> Result<String> {
    let mut hasher = Sha256::new();
    hasher.update(proof_hash);
    hasher.update(public_hash);
    hasher.update(chrono::Utc::now().timestamp().to_le_bytes());
    let hash = hasher.finalize();
    Ok(hex::encode(&hash[..16])) // Use first 16 bytes for shorter ID
}

fn verify_proof_enhanced(proof_data: &ProofData) -> Result<VerificationResult> {
    println!("🔍 Verifying proof with enhanced validation...");
    
    let start_time = Instant::now();
    
    // Enhanced validation checks
    let mut constraints_verified = 0u32;
    let mut error_message = None;
    
    // Constraint 1: Proof must not be empty
    if proof_data.proof.is_empty() {
        error_message = Some("Proof is empty".to_string());
    } else {
        constraints_verified += 1;
    }
    
    // Constraint 2: Public inputs must not be empty
    if proof_data.public_inputs.is_empty() {
        error_message = Some("Public inputs are empty".to_string());
    } else {
        constraints_verified += 1;
    }
    
    // Constraint 3: Verification key must be present
    if proof_data.verification_key.is_empty() {
        error_message = Some("Verification key is empty".to_string());
    } else {
        constraints_verified += 1;
    }
    
    // Constraint 4: Proof format validation (basic)
    if !proof_data.proof.starts_with("simulated_proof_") {
        error_message = Some("Invalid proof format".to_string());
    } else {
        constraints_verified += 1;
    }
    
    // Constraint 5: Public inputs length validation
    if proof_data.public_inputs.len() != 32 {
        error_message = Some(format!("Expected 32 public inputs, got {}", proof_data.public_inputs.len()));
    } else {
        constraints_verified += 1;
    }
    
    let verification_time = start_time.elapsed();
    let is_valid = error_message.is_none() && constraints_verified == 5;
    
    println!("📊 Proof verification result: {}", if is_valid { "VALID" } else { "INVALID" });
    
    Ok(VerificationResult {
        is_valid,
        verification_time_ms: verification_time.as_millis(),
        proof_size_bytes: proof_data.proof.len(),
        constraints_verified,
        error_message,
    })
}

#[allow(dead_code)]
fn verify_proof(proof_data: &ProofData) -> Result<bool> {
    let result = verify_proof_enhanced(proof_data)?;
    Ok(result.is_valid)
}

fn compute_proof_hash(witness: &WitnessInput) -> Result<[u8; 32]> {
    let mut hasher = Sha256::new();
    hasher.update(&witness.secret_value);
    hasher.update(&witness.salt);
    let hash = hasher.finalize();
    
    let mut result = [0u8; 32];
    result.copy_from_slice(&hash);
    Ok(result)
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_proof_generation() {
        let witness = WitnessInput {
            public_hash: vec![40; 32],
            public_commitment: vec![41; 32],
            secret_value: vec![42; 32], // High entropy
            salt: vec![2; 32],
            nonce: vec![3; 16],
        };
        
        let proof = generate_proof(&witness).unwrap();
        assert!(!proof.proof.is_empty());
        assert!(!proof.public_inputs.is_empty());
    }

    #[test]
    fn test_proof_verification() {
        let proof_data = ProofData {
            proof: "simulated_proof_test".to_string(),
            public_inputs: vec!["0".to_string(); 32],
            verification_key: "test_vk".to_string(),
            timestamp: chrono::Utc::now().timestamp() as u64,
            proof_id: "test_proof_id".to_string(),
            metadata: ProofMetadata {
                circuit_version: "1.0.0".to_string(),
                constraints_count: 6,
                generation_time_ms: 0,
                entropy_sum: 1000,
                proof_type: "test".to_string(),
            },
        };
        
        let result = verify_proof_enhanced(&proof_data).unwrap();
        assert!(result.is_valid);
        assert_eq!(result.constraints_verified, 5);
    }
    
    #[test]
    fn test_witness_validation() {
        let valid_witness = WitnessInput {
            public_hash: vec![40; 32],
            public_commitment: vec![41; 32],
            secret_value: vec![42; 32], // High entropy
            salt: vec![2; 32],
            nonce: vec![3; 16],
        };
        
        assert!(validate_witness_data(&valid_witness).is_ok());
        
        let invalid_witness = WitnessInput {
            public_hash: vec![0; 32],
            public_commitment: vec![0; 32],
            secret_value: vec![0; 32], // Low entropy
            salt: vec![0; 32],
            nonce: vec![0; 16],
        };
        
        assert!(validate_witness_data(&invalid_witness).is_err());
    }
    
    #[test]
    fn test_proof_serialization() {
        let proof_data = ProofData {
            proof: "test_proof".to_string(),
            public_inputs: vec!["0".to_string(); 32],
            verification_key: "test_vk".to_string(),
            timestamp: 1234567890,
            proof_id: "test_id".to_string(),
            metadata: ProofMetadata {
                circuit_version: "1.0.0".to_string(),
                constraints_count: 6,
                generation_time_ms: 100,
                entropy_sum: 1000,
                proof_type: "test".to_string(),
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
