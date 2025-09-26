# Proof Anchor Architecture

## Overview

Proof Anchor is a comprehensive system for generating, verifying, and storing zero-knowledge proofs on the Solana blockchain. The system consists of four main components:

1. **Noir ZK Circuits** - Generate zero-knowledge proofs
2. **Rust Verifier** - Verify proofs off-chain
3. **Solana Program** - Store proof commitments on-chain
4. **React Frontend** - User interface for proof operations

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

### 1. Noir ZK Circuits (`noir/`)

- **Purpose**: Generate zero-knowledge proofs
- **Technology**: Noir language
- **Key Files**:
  - `src/main.nr` - Main circuit implementation
  - `witness/input.json` - Example witness data
  - `Nargo.toml` - Project configuration

**Circuit Logic**:

- Proves knowledge of a secret value without revealing it
- Uses Poseidon hash function for proof generation
- Constrains that computed hash matches public input

### 2. Rust Verifier (`verifier/`)

- **Purpose**: Verify proofs off-chain
- **Technology**: Rust with Solana SDK
- **Key Files**:
  - `src/main.rs` - Main verification logic
  - `proof_samples/` - Generated proof artifacts

**Verification Process**:

1. Load witness data from Noir
2. Generate proof using Noir circuit
3. Verify proof validity
4. Save proof data for Solana submission

### 3. Solana Program (`solana/`)

- **Purpose**: Store proof commitments on-chain
- **Technology**: Anchor framework
- **Key Files**:
  - `programs/attestation/src/lib.rs` - Program logic
  - `Anchor.toml` - Program configuration

**Program Features**:

- Initialize attestation account
- Submit proof hashes and public inputs
- Verify proofs on-chain
- Emit events for off-chain monitoring

### 4. React Frontend (`frontend/`)

- **Purpose**: User interface for proof operations
- **Technology**: React with Solana wallet integration
- **Key Files**:
  - `src/App.jsx` - Main application component
  - `src/components/` - Reusable UI components
  - `src/pages/` - Page components

**Frontend Features**:

- Wallet connection (Phantom, etc.)
- Proof generation interface
- Proof verification display
- Real-time status updates

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
