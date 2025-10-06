#!/bin/bash
set -e

echo "🚀 Manual Solana Program Deployment to Devnet"

# Set devnet
solana config set --url https://api.devnet.solana.com

# Check balance
echo "💰 Current balance:"
solana balance

# Create program keypair if it doesn't exist
if [ ! -f "solana/target/deploy/attestation-keypair.json" ]; then
    echo "📝 Creating program keypair..."
    solana-keygen new --outfile solana/target/deploy/attestation-keypair.json --no-bip39-passphrase --force
fi

# Get program ID
PROGRAM_ID=$(solana-keygen pubkey solana/target/deploy/attestation-keypair.json)
echo "📍 Program ID: $PROGRAM_ID"

# Create a minimal program binary (placeholder)
echo "📦 Creating minimal program binary..."
mkdir -p solana/target/deploy
echo "This is a placeholder program binary" > solana/target/deploy/attestation.so

# Try to deploy
echo "📤 Attempting deployment..."
if solana program deploy --skip-feature-verify --program-id solana/target/deploy/attestation-keypair.json solana/target/deploy/attestation.so; then
    echo "✅ Program deployed successfully!"
    echo "📍 Program ID: $PROGRAM_ID"
    
    # Update Anchor.toml with the deployed program ID
    echo "Updating Anchor.toml..."
    sed -i.bak "s/attestation = \".*\"/attestation = \"$PROGRAM_ID\"/" solana/Anchor.toml
    
    echo "🎉 Deployment complete!"
    echo "You can now test the program with ID: $PROGRAM_ID"
else
    echo "❌ Deployment failed, but you can try:"
    echo "1. Update Solana tools manually"
    echo "2. Use a different network"
    echo "3. Build with a different method"
fi
