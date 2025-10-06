# Proof Anchor Architecture - zkTLS Transparency Ratings

## Overview

Proof Anchor is a comprehensive system for **onchain transparency ratings** to differentiate legitimate projects from scams using **zkTLS** and **crowdsourced analysis**. The system consists of four main components:

1. **Noir zkTLS Circuits** - Generate zero-knowledge proofs for TLS certificate verification
2. **Rust Verifier** - Enhanced verification with transparency analysis and risk assessment
3. **Solana Program** - Store project ratings, community votes, and verification results
4. **React Frontend** - Interactive UI for transparency analysis and community voting

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React         │    │   Rust          │    │   Noir          │
│   Frontend      │◄──►│   Verifier      │◄──►│   Circuits      │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Solana Blockchain                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Attestation   │  │   Proof         │  │   Verification  │ │
│  │   Program       │  │   Records       │  │   Events        │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Noir zkTLS Circuits (`noir/`)

- **Purpose**: Generate zero-knowledge proofs for TLS certificate verification
- **Technology**: Noir language
- **Key Files**:
  - `src/main.nr` - zkTLS circuit implementation
  - `witness/input.json` - Example witness data
  - `Nargo.toml` - Project configuration

**zkTLS Circuit Logic**:

- Proves TLS certificate validity without revealing certificate details
- Verifies domain name matches expected hash
- Ensures certificate is not expired
- Validates certificate serial number and issuer
- Computes certificate validity proof using XOR operations
- Enforces transparency score and risk level constraints

### 2. Rust Verifier (`verifier/`)

- **Purpose**: Enhanced verification with transparency analysis and risk assessment
- **Technology**: Rust with Solana SDK
- **Key Files**:
  - `src/main.rs` - Enhanced verification logic with transparency analysis
  - `proof_samples/` - Generated proof artifacts
  - `project_metadata/` - Project transparency metadata

**Enhanced Verification Process**:

1. Load witness data from Noir zkTLS circuit
2. Analyze project transparency metrics (GitHub, audits, team verification, etc.)
3. Assess project legitimacy using risk factor analysis
4. Generate zkTLS proof using Noir circuit
5. Verify proof validity with enhanced constraints
6. Save proof data and project metadata for Solana submission

### 3. Solana Program (`solana/`)

- **Purpose**: Store project ratings, community votes, and verification results
- **Technology**: Anchor framework
- **Key Files**:
  - `programs/attestation/src/lib.rs` - Enhanced program logic for transparency ratings
  - `Anchor.toml` - Program configuration

**Enhanced Program Features**:

- Initialize attestation account with project counters
- Submit projects for transparency verification
- Community voting system with confidence levels
- Calculate final legitimacy scores based on community consensus
- Store zkTLS proof verification results
- Emit events for off-chain monitoring and frontend updates

### 4. React Frontend (`frontend/`)

- **Purpose**: Interactive UI for transparency analysis and community voting
- **Technology**: React with Solana wallet integration
- **Key Files**:
  - `src/App.tsx` - Main application component with transparency features
  - `src/components/` - Reusable UI components including transparency cards
  - `src/types/` - TypeScript definitions for transparency and voting data

**Enhanced Frontend Features**:

- Solana wallet connection (Phantom, etc.)
- zkTLS proof generation interface
- Project transparency analysis display
- Community voting panel with confidence levels
- Real-time transparency score and risk level indicators
- Interactive legitimacy assessment visualization

## Data Flow

1. **Proof Generation**:

   ```
   User Input → Noir Circuit → ZK Proof → Rust Verifier
   ```

2. **Proof Verification**:

   ```
   ZK Proof → Rust Verifier → Validation Result → Solana Program
   ```

3. **On-Chain Storage**:

   ```
   Proof Hash + Public Inputs → Solana Program → Proof Record
   ```

4. **Frontend Display**:
   ```
   Solana Events → Frontend → User Interface Updates
   ```

## Security Considerations

- **Zero-Knowledge**: Sensitive data never leaves the user's device
- **Cryptographic Security**: Uses proven hash functions (Poseidon)
- **On-Chain Verification**: Proof commitments stored immutably
- **Wallet Integration**: Secure key management through Solana wallets

## Development Workflow

1. **Circuit Development**: Modify `noir/src/main.nr`
2. **Verification Logic**: Update `verifier/src/main.rs`
3. **Program Logic**: Modify `solana/programs/attestation/src/lib.rs`
4. **Frontend Updates**: Update React components
5. **Testing**: Use provided scripts for end-to-end testing

## Deployment

- **Local Development**: Use `scripts/run_proof.sh`
- **Program Deployment**: Use `scripts/deploy_anchor.sh`
- **Frontend Deployment**: Standard React deployment process

## Future Enhancements

- Support for multiple proof types
- Batch proof verification
- Cross-chain proof verification
- Advanced proof privacy features
- Integration with additional wallets
