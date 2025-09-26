# Setup Guide

## Prerequisites

Before setting up Proof Anchor, ensure you have the following installed:

### Required Software

1. **Rust** (1.75.0+)

   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source ~/.cargo/env
   ```

2. **Solana CLI** (1.17.0+)

   ```bash
   sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"
   export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
   ```

3. **Anchor CLI**

   ```bash
   npm install -g @coral-xyz/anchor-cli
   ```

4. **Noir** (0.18.0+)

   ```bash
   curl -L https://raw.githubusercontent.com/noir-lang/noirup/main/install | bash
   source ~/.zshrc  # or ~/.bashrc
   noirup
   ```

5. **Node.js** (18.0+)
   ```bash
   # Using nvm (recommended)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 18
   nvm use 18
   ```

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd proof-anchor
   ```

2. **Install Rust dependencies**

   ```bash
   cargo build
   ```

3. **Install frontend dependencies**

   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Set up Solana wallet**
   ```bash
   solana-keygen new --outfile ~/.config/solana/id.json
   solana config set --keypair ~/.config/solana/id.json
   solana config set --url localhost
   ```

## Development Setup

### 1. Start Solana Local Validator

```bash
solana-test-validator
```

### 2. Deploy the Anchor Program

```bash
./scripts/deploy_anchor.sh
```

### 3. Run Proof Generation and Verification

```bash
./scripts/run_proof.sh
```

### 4. Start the Frontend

```bash
cd frontend
npm start
```

## Configuration

### Solana Configuration

- **Network**: Configure for localhost, devnet, or mainnet
- **Wallet**: Set up your keypair for transactions
- **Program ID**: Update in `solana/Anchor.toml` if needed

### Noir Configuration

- **Circuit**: Modify `noir/src/main.nr` for your proof logic
- **Witness**: Update `noir/witness/input.json` with test data
- **Compilation**: Use `nargo compile` to build circuits

### Frontend Configuration

- **Wallet Adapters**: Add/remove wallet providers in `src/App.jsx`
- **Network**: Update Solana RPC endpoint
- **Styling**: Modify Tailwind CSS configuration

## Testing

### Unit Tests

```bash
# Rust tests
cargo test

# Anchor tests
cd solana
anchor test

# Frontend tests
cd frontend
npm test
```

### Integration Tests

```bash
# Full proof pipeline
./scripts/run_proof.sh

# End-to-end with frontend
npm start  # In frontend directory
```

## Troubleshooting

### Common Issues

1. **Solana CLI not found**

   - Ensure Solana is in your PATH
   - Restart your terminal after installation

2. **Anchor build fails**

   - Check Rust version compatibility
   - Ensure all dependencies are installed

3. **Noir compilation errors**

   - Verify Noir installation
   - Check circuit syntax

4. **Frontend build issues**

   - Clear node_modules and reinstall
   - Check Node.js version compatibility

5. **Wallet connection problems**
   - Ensure wallet extension is installed
   - Check network configuration

### Getting Help

- Check the logs for detailed error messages
- Verify all prerequisites are installed correctly
- Ensure you're using the correct Solana network
- Check that your wallet has sufficient SOL for transactions

## Production Deployment

### Solana Program

1. Update program ID in `Anchor.toml`
2. Deploy to mainnet:
   ```bash
   anchor deploy --provider.cluster mainnet
   ```

### Frontend

1. Build for production:

   ```bash
   cd frontend
   npm run build
   ```

2. Deploy to your hosting service (Vercel, Netlify, etc.)

### Environment Variables

Set up the following environment variables for production:

- `REACT_APP_SOLANA_NETWORK`: Solana network (mainnet, devnet, localhost)
- `REACT_APP_PROGRAM_ID`: Your deployed program ID
- `REACT_APP_RPC_URL`: Solana RPC endpoint
