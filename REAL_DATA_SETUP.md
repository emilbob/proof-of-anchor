# Real Data Integration Setup

This guide explains how to run Proof Anchor with **real data** instead of simulated data on Solana testnet.

## 🎯 What's Different

### Before (Simulated)

- ❌ Simulated zkTLS proof generation
- ❌ Hardcoded transparency scores
- ❌ Mock Solana transactions
- ❌ Fake GitHub data

### After (Real Data)

- ✅ **Real TLS certificate verification**
- ✅ **Actual GitHub API integration**
- ✅ **Real Solana testnet transactions**
- ✅ **Live transparency analysis**

## 🚀 Quick Start

### 1. Deploy to Testnet

```bash
./scripts/deploy_testnet.sh
```

### 2. Run with Real Data

```bash
# Analyze a real domain
./scripts/run_real_proof.sh github.com

# Or analyze another domain
./scripts/run_real_proof.sh google.com
```

### 3. Start Frontend

```bash
cd frontend
npm start
```

## 🔧 Prerequisites

### Required Software

- **Rust** (1.75.0+)
- **Solana CLI** (1.17.0+)
- **Anchor CLI**
- **Noir** (0.18.0+)
- **Node.js** (18.0+)

### Required Accounts

- **Solana Wallet** (Phantom recommended)
- **GitHub Token** (optional, for enhanced analysis)

## 📋 Setup Instructions

### 1. Install Dependencies

```bash
# Install Rust dependencies
cargo build

# Install frontend dependencies
cd frontend && npm install
```

### 2. Configure Environment

Create `frontend/.env.local`:

```bash
REACT_APP_SOLANA_NETWORK=testnet
REACT_APP_SOLANA_RPC_URL=https://api.testnet.solana.com
REACT_APP_PROGRAM_ID=YOUR_PROGRAM_ID_HERE
REACT_APP_GITHUB_TOKEN=your_token_here  # Optional
```

### 3. Get Testnet SOL

```bash
# Set Solana to testnet
solana config set --url https://api.testnet.solana.com

# Airdrop testnet SOL
solana airdrop 2
```

### 4. Deploy Program

```bash
./scripts/deploy_testnet.sh
```

## 🌐 Real Data Features

### Real TLS Certificate Verification

- Fetches actual TLS certificates from domains
- Validates certificate expiration and issuer
- Extracts real certificate data for zkTLS proofs

### Real GitHub Integration

- Connects to GitHub API for repository analysis
- Analyzes real stars, forks, and activity
- Checks for licenses and documentation
- Calculates authentic code review scores

### Real Transparency Analysis

- Checks for actual roadmap pages
- Verifies real audit reports
- Analyzes team verification pages
- Validates token economics documentation

### Real Solana Integration

- Submits actual transactions to testnet
- Stores real proof data on-chain
- Implements genuine community voting
- Records authentic verification results

## 🔍 How It Works

### 1. Domain Analysis

```bash
# The system will:
# 1. Fetch real TLS certificate
# 2. Analyze GitHub repository (if exists)
# 3. Check transparency indicators
# 4. Calculate real scores
```

### 2. Proof Generation

```bash
# Real zkTLS proof generation:
# 1. Use actual certificate data
# 2. Generate real witness data
# 3. Create Noir proof
# 4. Verify proof validity
```

### 3. Blockchain Submission

```bash
# Real Solana transactions:
# 1. Submit project data
# 2. Record community votes
# 3. Store proof verification
# 4. Update legitimacy scores
```

## 🧪 Testing with Real Domains

### High Transparency Domains

```bash
./scripts/run_real_proof.sh github.com
./scripts/run_real_proof.sh google.com
./scripts/run_real_proof.sh microsoft.com
```

### Medium Transparency Domains

```bash
./scripts/run_real_proof.sh ethereum.org
./scripts/run_real_proof.sh solana.com
./scripts/run_real_proof.sh uniswap.org
```

### Low Transparency Domains

```bash
./scripts/run_real_proof.sh example.com
./scripts/run_real_proof.sh test.com
```

## 📊 Expected Results

### High Transparency (github.com)

- **Transparency Score**: 80-95
- **Risk Level**: 1-3
- **GitHub**: ✅ Public repository found
- **Audits**: ✅ Documentation available
- **Team**: ✅ Verified team information

### Medium Transparency (ethereum.org)

- **Transparency Score**: 60-80
- **Risk Level**: 3-5
- **GitHub**: ✅ Repository found
- **Audits**: ⚠️ Limited audit information
- **Team**: ✅ Team information available

### Low Transparency (example.com)

- **Transparency Score**: 20-40
- **Risk Level**: 6-8
- **GitHub**: ❌ No repository found
- **Audits**: ❌ No audit reports
- **Team**: ❌ Limited team information

## 🔧 Troubleshooting

### Common Issues

#### 1. TLS Certificate Errors

```bash
# Error: Failed to fetch TLS certificate
# Solution: Check domain accessibility and SSL configuration
```

#### 2. GitHub API Rate Limits

```bash
# Error: GitHub API rate limit exceeded
# Solution: Add GITHUB_TOKEN to environment variables
```

#### 3. Solana Transaction Failures

```bash
# Error: Insufficient funds
# Solution: solana airdrop 2
```

#### 4. Noir Compilation Errors

```bash
# Error: nargo compile failed
# Solution: Update Noir installation
```

### Debug Mode

```bash
# Enable debug logging
export RUST_LOG=debug
./scripts/run_real_proof.sh github.com
```

## 📈 Performance Expectations

### Real Data Processing Times

- **TLS Certificate Fetch**: 2-5 seconds
- **GitHub API Calls**: 1-3 seconds
- **Transparency Analysis**: 3-8 seconds
- **Noir Proof Generation**: 5-15 seconds
- **Solana Transaction**: 2-10 seconds

### Total Processing Time

- **Complete Analysis**: 15-45 seconds per domain
- **Frontend Integration**: 20-60 seconds total

## 🎯 Next Steps

1. **Test with Multiple Domains**: Try different types of websites
2. **Monitor Solana Explorer**: Check transactions on testnet
3. **Analyze Results**: Compare transparency scores with expectations
4. **Community Voting**: Test the voting system with real users
5. **Performance Optimization**: Monitor and optimize processing times

## 🔗 Useful Links

- **Solana Testnet Explorer**: https://explorer.solana.com/?cluster=testnet
- **GitHub API Documentation**: https://docs.github.com/en/rest
- **Noir Documentation**: https://noir-lang.org/
- **Anchor Documentation**: https://www.anchor-lang.com/

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the console logs for detailed error messages
3. Ensure all prerequisites are properly installed
4. Verify your Solana wallet has sufficient testnet SOL

---

**🎉 You're now ready to test Proof Anchor with real data on Solana testnet!**
