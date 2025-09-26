use dep::std;

// Simple proof of knowledge circuit
// This circuit proves knowledge of a secret value without revealing it
fn main(
    // Public inputs
    public_hash: pub [u8; 32],
    // Private inputs (witness)
    secret_value: [u8; 32],
    salt: [u8; 32],
) -> pub [u8; 32] {
    // Hash the secret value with salt
    let mut hasher = std::hash::poseidon::Poseidon::new();
    hasher.write(secret_value);
    hasher.write(salt);
    let computed_hash = hasher.finish();

    // Constrain that the computed hash matches the public hash
    std::assert(computed_hash == public_hash);

    // Return the computed hash as public output
    computed_hash
}

// Example witness data for testing
#[test]
fn test_main() {
    let secret_value = [1u8; 32];
    let salt = [2u8; 32];
    
    // Compute expected hash
    let mut hasher = std::hash::poseidon::Poseidon::new();
    hasher.write(secret_value);
    hasher.write(salt);
    let expected_hash = hasher.finish();
    
    let result = main(expected_hash, secret_value, salt);
    assert(result == expected_hash);
}
