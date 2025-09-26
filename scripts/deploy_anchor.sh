#!/bin/bash

# Deploy Anchor program to Solana
# This script builds and deploys the attestation program

set -e

echo "🚀 Starting Anchor program deployment..."

# Check if we're in the right directory
if [ ! -f "solana/Anchor.toml" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Navigate to solana directory
cd solana

# Check if Anchor is installed
if ! command -v anchor &> /dev/null; then
    echo "❌ Error: Anchor CLI is not installed"
    echo "Please install it with: npm install -g @coral-xyz/anchor-cli"
    exit 1
fi

# Check if Solana CLI is installed
if ! command -v solana &> /dev/null; then
    echo "❌ Error: Solana CLI is not installed"
    echo "Please install it from: https://docs.solana.com/cli/install-solana-cli-tools"
    exit 1
fi

# Build the program
echo "🔨 Building Anchor program..."
anchor build

# Deploy the program
echo "🚀 Deploying program to Solana..."
anchor deploy

echo "✅ Anchor program deployed successfully!"
echo "📋 Program ID: $(grep 'attestation = ' Anchor.toml | cut -d'"' -f2)"

# Run tests
echo "🧪 Running tests..."
anchor test --skip-local-validator

echo "🎉 Deployment complete!"
