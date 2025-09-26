# Proof Anchor

A comprehensive proof verification system combining Solana/Anchor, Noir ZK circuits, and React frontend.

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

This project implements a proof verification system where:

- Noir circuits generate ZK proofs
- Rust verifier validates proofs off-chain
- Solana program stores proof commitments on-chain
- React frontend provides user interface for proof submission and verification

## Development

See individual directories for specific setup instructions.
