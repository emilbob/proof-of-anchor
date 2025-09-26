// Simple proof of knowledge circuit
// This circuit proves knowledge of a secret value without revealing it
fn main(
    // Public inputs
    public_hash: pub [u8; 32],
    // Private inputs (witness)
    secret_value: [u8; 32],
    salt: [u8; 32],
) -> pub [u8; 32] {
    // Simple hash computation using XOR (for demonstration)
    let mut computed_hash = [0u8; 32];

    for i in 0..32 {
        computed_hash[i] = secret_value[i] ^ salt[i];
    }

    // Constrain that the computed hash matches the public hash
    for i in 0..32 {
        assert(computed_hash[i] == public_hash[i]);
    }

    // Return the computed hash as public output
    computed_hash
}

// Example witness data for testing
#[test]
fn test_main() {
    let secret_value = [1u8; 32];
    let salt = [2u8; 32];

    // Compute expected hash
    let mut expected_hash = [0u8; 32];
    for i in 0..32 {
        expected_hash[i] = secret_value[i] ^ salt[i];
    }

    let result = main(expected_hash, secret_value, salt);
    for i in 0..32 {
        assert(result[i] == expected_hash[i]);
    }
}
