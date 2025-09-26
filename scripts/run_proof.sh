#!/bin/bash

# Run complete proof generation and verification pipeline
# This script generates a Noir proof, verifies it, and submits to Solana

set -e

echo "🔍 Starting proof generation and verification pipeline..."

# Check if we're in the right directory
if [ ! -f "Cargo.toml" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if nargo is installed
if ! command -v nargo &> /dev/null; then
    echo "❌ Error: nargo is not installed"
    echo "Please install it from: https://noir-lang.org/getting_started/install/"
    exit 1
fi

# Check if Rust is installed
if ! command -v cargo &> /dev/null; then
    echo "❌ Error: Rust/Cargo is not installed"
    echo "Please install it from: https://rustup.rs/"
    exit 1
fi

# Step 1: Generate Noir proof
echo "🔧 Step 1: Generating Noir proof..."
cd noir

# Compile the circuit
echo "📦 Compiling Noir circuit..."
nargo compile

# Generate proof
echo "🔐 Generating proof..."
nargo prove

echo "✅ Noir proof generated successfully!"

# Step 2: Verify proof with Rust verifier
echo "🔍 Step 2: Verifying proof with Rust verifier..."
cd ../verifier

# Build and run the verifier
echo "🔨 Building verifier..."
cargo build --release

echo "🚀 Running verifier..."
cargo run --release

echo "✅ Proof verification completed!"

# Step 3: Submit to Solana (simulated)
echo "🌐 Step 3: Submitting proof to Solana..."
echo "📝 Note: In a real implementation, this would submit the proof to the Solana program"
echo "💾 Proof data saved to verifier/proof_samples/"

echo "🎉 Proof pipeline completed successfully!"
echo ""
echo "📋 Summary:"
echo "  - Noir proof generated and verified"
echo "  - Proof data saved for Solana submission"
echo "  - Ready for frontend integration"
