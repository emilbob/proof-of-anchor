# Netlify Deployment Fix - Wallet Transaction Issues

## Problem

Wallet transactions (generate, vote, verify) were not working on the Netlify deployment due to missing Node.js polyfills and environment variables.

## Root Causes

1. **Missing Node.js polyfills**: Solana Web3.js requires Node.js modules (`Buffer`, `process`, `crypto`, `stream`) that don't exist in the browser
2. **Missing environment variables**: RPC URL and Program ID were not configured in Netlify
3. **Content Security Policy**: Restrictive CSP headers blocking wallet connections

## Fixes Applied

### 1. Added Node.js Polyfills (vite.config.ts)

```typescript
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  // ... rest of config
});
```

### 2. Installed Required Packages

```bash
npm install --save-dev vite-plugin-node-polyfills crypto-browserify stream-browserify util
```

### 3. Updated netlify.toml

- Added proper Content-Security-Policy headers to allow wallet connections
- Added environment variable placeholders
- Set Node.js version to 18

## Netlify Configuration Required

You must set these environment variables in **Netlify UI**:

1. Go to your Netlify site dashboard
2. Navigate to: **Site settings** → **Environment variables**
3. Add the following variables:

| Variable Name         | Value                                          | Description              |
| --------------------- | ---------------------------------------------- | ------------------------ |
| `VITE_SOLANA_RPC_URL` | `https://api.devnet.solana.com`                | Solana RPC endpoint      |
| `VITE_PROGRAM_ID`     | `4jGQ4kaxDsPJ57u1iN8gX1X7ngBji2Z8R8ERmcVp1BLW` | Your deployed program ID |
| `VITE_SOLANA_NETWORK` | `devnet`                                       | Network environment      |

### Setting Environment Variables in Netlify:

**Option 1: Using Netlify UI**

1. Log into Netlify
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Click **Add a variable**
5. Enter variable name and value
6. Click **Save**
7. Repeat for all three variables
8. **Trigger a new deployment** for changes to take effect

**Option 2: Using Netlify CLI**

```bash
netlify env:set VITE_SOLANA_RPC_URL "https://api.devnet.solana.com"
netlify env:set VITE_PROGRAM_ID "4jGQ4kaxDsPJ57u1iN8gX1X7ngBji2Z8R8ERmcVp1BLW"
netlify env:set VITE_SOLANA_NETWORK "devnet"
```

## Deployment Steps

### 1. Commit and Push Changes

```bash
git add .
git commit -m "Fix wallet transactions for Netlify deployment"
git push origin main
```

### 2. Netlify Will Auto-Deploy

- Netlify will automatically detect the push and trigger a new build
- Wait for the build to complete (check the Deploys tab)

### 3. Verify Environment Variables

After deployment, check that environment variables are set:

- Go to Site settings → Environment variables
- Verify all three variables are present

### 4. Test Wallet Functionality

1. Visit your deployed site
2. Connect Phantom wallet
3. Enter a domain to analyze
4. Click "Generate Proof" - should trigger wallet transaction
5. Vote on the project - should trigger wallet transaction
6. Click "Verify Proof" - should trigger wallet transaction

## Troubleshooting

### Issue: "Program or provider not initialized"

**Solution**: Check that environment variables are set correctly in Netlify and redeploy

### Issue: Wallet not connecting

**Solution**:

1. Check browser console for CSP errors
2. Ensure Content-Security-Policy allows wallet connections (already fixed in netlify.toml)
3. Try hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

### Issue: "Buffer is not defined"

**Solution**: This should be fixed by the polyfills. If still occurring:

1. Clear Netlify cache: Site settings → Build & deploy → Clear cache and retry deploy
2. Verify vite-plugin-node-polyfills is installed

### Issue: Transaction failing silently

**Solution**:

1. Open browser console to see error messages
2. Check that your Phantom wallet is connected to Devnet
3. Ensure you have devnet SOL in your wallet
4. Verify the program is deployed on devnet

### Issue: Build fails on Netlify

**Solution**:

1. Check build logs in Netlify dashboard
2. Ensure Node version is set to 18 in netlify.toml
3. Try: Site settings → Build & deploy → Clear cache and retry deploy

## Local Development

For local development, create a `.env` file in the `frontend` directory:

```env
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
VITE_PROGRAM_ID=4jGQ4kaxDsPJ57u1iN8gX1X7ngBji2Z8R8ERmcVp1BLW
VITE_SOLANA_NETWORK=devnet
```

**Note**: Never commit `.env` to git - it's already in `.gitignore`

## Testing Local Build

To test the production build locally:

```bash
cd frontend
npm run build
npm run preview
```

This will serve the production build locally and help identify any build issues before deploying.

## Important Notes

1. **Environment Variables**: Netlify environment variables must start with `VITE_` to be exposed to the client-side code
2. **Wallet Adapter**: The wallet adapter requires proper polyfills to work in production builds
3. **RPC Rate Limits**: Public Solana RPC endpoints have rate limits. Consider using a dedicated RPC provider (Helius, QuickNode) for production
4. **Security**: Never expose private keys or sensitive data in environment variables

## Next Steps

After successful deployment with working wallet transactions:

1. **Test thoroughly**: Test all three transaction types (generate, vote, verify)
2. **Monitor transactions**: Check Solana Explorer for transaction confirmations
3. **Consider mainnet**: When ready, update environment variables for mainnet-beta
4. **Get dedicated RPC**: For production, use a dedicated RPC provider with higher rate limits

## Files Modified

- ✅ `frontend/vite.config.ts` - Added Node.js polyfills
- ✅ `frontend/package.json` - Added polyfill dependencies (auto-updated)
- ✅ `frontend/netlify.toml` - Added environment config and CSP headers
- ✅ Created this documentation file

## Support

If issues persist:

1. Check Netlify build logs
2. Check browser console for errors
3. Verify wallet is on correct network (devnet)
4. Ensure program is deployed: `solana program show 4jGQ4kaxDsPJ57u1iN8gX1X7ngBji2Z8R8ERmcVp1BLW --url devnet`
