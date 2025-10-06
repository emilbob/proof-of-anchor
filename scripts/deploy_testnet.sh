#!/bin/bash

# Deploy Proof Anchor to Solana testnet with real data integration
set -e

echo "🚀 Deploying Proof Anchor to Solana testnet..."

# Check if we're in the right directory
if [ ! -f "Cargo.toml" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Load testnet configuration
if [ -f "config/testnet.env" ]; then
    echo "📋 Loading testnet configuration..."
    export $(cat config/testnet.env | grep -v '^#' | xargs)
fi

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command -v anchor &> /dev/null; then
    echo "❌ Error: Anchor CLI is not installed"
    echo "Please install it with: npm install -g @coral-xyz/anchor-cli"
    exit 1
fi

if ! command -v solana &> /dev/null; then
    echo "❌ Error: Solana CLI is not installed"
    echo "Please install it from: https://docs.solana.com/cli/install-solana-cli-tools"
    exit 1
fi

if ! command -v nargo &> /dev/null; then
    echo "❌ Error: nargo is not installed"
    echo "Please install it from: https://noir-lang.org/getting_started/install/"
    exit 1
fi

# Set Solana to testnet
echo "🌐 Configuring Solana for testnet..."
solana config set --url https://api.testnet.solana.com

# Check wallet and balance
echo "💰 Checking wallet balance..."
WALLET_BALANCE=$(solana balance --lamports)
if [ "$WALLET_BALANCE" -lt 1000000000 ]; then
    echo "⚠️  Warning: Low wallet balance ($WALLET_BALANCE lamports)"
    echo "💡 You may need to airdrop SOL for testnet:"
    echo "   solana airdrop 2"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Deploy Solana program to testnet
echo "🔨 Deploying Solana program to testnet..."
cd solana
anchor build
anchor deploy --provider.cluster testnet

echo "✅ Solana program deployed to testnet!"

# Get the deployed program ID
PROGRAM_ID=$(grep 'attestation = ' Anchor.toml | cut -d'"' -f2)
echo "📋 Program ID: $PROGRAM_ID"

# Update frontend configuration
echo "🔧 Updating frontend configuration..."
cd ../frontend

# Create environment file for testnet
cat > .env.local << EOF
VITE_SOLANA_NETWORK=testnet
VITE_SOLANA_RPC_URL=https://api.testnet.solana.com
VITE_PROGRAM_ID=$PROGRAM_ID
VITE_DEBUG=true
EOF

echo "✅ Frontend configured for testnet!"

# Install dependencies and build
echo "📦 Installing frontend dependencies..."
npm install

echo "🏗️  Building frontend..."
npm run build

echo "🎉 Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Start the frontend: cd frontend && npm start"
echo "2. Connect your Phantom wallet to testnet"
echo "3. Get testnet SOL: solana airdrop 2"
echo "4. Test with real domains like 'github.com' or 'google.com'"
echo ""
echo "🔗 Testnet Explorer: https://explorer.solana.com/?cluster=testnet"
echo "📋 Program ID: $PROGRAM_ID"
