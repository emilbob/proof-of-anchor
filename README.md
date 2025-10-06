# Proof of Anchor - zkTLS Transparency Ratings

A comprehensive zero-knowledge proof system for **onchain transparency ratings** to differentiate legitimate projects from scams using **zkTLS** and **crowdsourced analysis** on Solana blockchain.

## Project Structure

- `solana/` - Anchor program for on-chain proof verification
- `noir/` - Noir ZK circuits for proof generation
- `verifier/` - Rust off-chain verifier
- `frontend/` - React frontend for user interaction
- `scripts/` - Automation scripts for deployment and proof generation
- `docs/` - Architecture diagrams and documentation

## Quick Start

1. Deploy the Anchor program:

   ```bash
   ./scripts/deploy_anchor.sh
   ```

2. Generate and verify proofs:

   ```bash
   ./scripts/run_proof.sh
   ```

3. Start the frontend:
   ```bash
   cd frontend && npm start
   ```

## Architecture

This project implements a **transparency rating system** for project legitimacy verification:

### Core Features

- **zkTLS Verification**: Prove TLS certificate validity without revealing sensitive data
- **Transparency Scoring**: Algorithm-based scoring system (0-100) for project transparency
- **Risk Assessment**: Advanced scam detection with risk level scoring (0-10)
- **Community Voting**: Crowdsourced analysis with confidence-weighted voting
- **On-Chain Storage**: Immutable project ratings and verification data on Solana

### System Components

- **Noir zkTLS Circuits**: Generate zero-knowledge proofs for certificate verification
- **Rust Verifier**: Enhanced verification with transparency analysis and risk assessment
- **Solana Program**: Store project ratings, community votes, and verification results
- **React Frontend**: Interactive UI for transparency analysis and community voting

## Development

See individual directories for specific setup instructions.
