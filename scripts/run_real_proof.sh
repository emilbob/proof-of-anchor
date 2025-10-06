#!/bin/bash

# Run proof generation and verification with REAL data
set -e

echo "🔍 Starting REAL zkTLS proof generation and verification..."

# Check if we're in the right directory
if [ ! -f "Cargo.toml" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Get domain from command line argument or use default
DOMAIN=${1:-"github.com"}
echo "🌐 Analyzing domain: $DOMAIN"

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

# Step 1: Generate real witness data and zkTLS proof
echo "🔧 Step 1: Generating REAL zkTLS proof for $DOMAIN..."
cd verifier

# Build the verifier with real TLS dependencies
echo "📦 Building verifier with real TLS support..."
cargo build --release

# Run the verifier with real data
echo "🚀 Running verifier with real data..."
cargo run --release -- --real-data "$DOMAIN"

if [ $? -eq 0 ]; then
    echo "✅ Real zkTLS proof generation completed!"
else
    echo "❌ Real zkTLS proof generation failed!"
    exit 1
fi

# Step 2: Generate Noir proof
echo "🔧 Step 2: Generating Noir proof..."
cd ../noir

# Compile the circuit
echo "📦 Compiling Noir circuit..."
nargo compile

# Execute circuit with real witness data
echo "🔐 Executing circuit with real data..."
nargo execute

echo "✅ Noir proof generated successfully!"

# Step 3: Verify the proof
echo "🔍 Step 3: Verifying proof..."
cd ../verifier

# Run verification
echo "🔨 Running proof verification..."
cargo run --release -- verify

echo "✅ Proof verification completed!"

# Step 4: Show results
echo ""
echo "🎉 REAL zkTLS proof pipeline completed successfully!"
echo ""
echo "📋 Summary:"
echo "  - Domain analyzed: $DOMAIN"
echo "  - Real TLS certificate verified"
echo "  - Real transparency data analyzed"
echo "  - zkTLS proof generated with Noir"
echo "  - Proof verified and ready for Solana submission"
echo ""
echo "💾 Files generated:"
echo "  - verifier/proof_samples/ - Proof data for Solana"
echo "  - verifier/project_metadata/ - Project transparency data"
echo "  - noir/proofs/ - Noir proof files"
echo ""
echo "🚀 Ready for frontend integration!"
