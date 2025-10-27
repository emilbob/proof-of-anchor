# Quick Netlify Setup Guide

## 🚀 Quick Steps to Fix Wallet Transactions

### 1. Set Environment Variables in Netlify

Go to your Netlify dashboard and set these 3 environment variables:

**Netlify Dashboard → Your Site → Site settings → Environment variables → Add a variable**

```
VITE_SOLANA_RPC_URL = https://api.devnet.solana.com
VITE_PROGRAM_ID = 4jGQ4kaxDsPJ57u1iN8gX1X7ngBji2Z8R8ERmcVp1BLW
VITE_SOLANA_NETWORK = devnet
```

### 2. Redeploy

After setting environment variables, trigger a new deployment:

**Option A: Push to Git**

```bash
git add .
git commit -m "Fix wallet transactions with polyfills"
git push origin main
```

**Option B: Manual Deploy in Netlify**

- Go to: **Deploys** tab
- Click: **Trigger deploy** → **Deploy site**

### 3. Wait for Build

- Watch the build logs to ensure it completes successfully
- Build should take 1-2 minutes

### 4. Test

1. Visit your deployed site
2. Connect Phantom wallet (make sure it's on Devnet)
3. Enter a domain (e.g., "github.com")
4. Click **Generate Proof** → Wallet should prompt for transaction approval ✅
5. Vote on the project → Wallet should prompt for transaction approval ✅
6. Click **Verify Proof** → Wallet should prompt for transaction approval ✅

## ✅ What Was Fixed

- ✅ Added Node.js polyfills (Buffer, process, crypto, stream)
- ✅ Installed required packages (vite-plugin-node-polyfills, crypto-browserify, stream-browserify, util)
- ✅ Updated vite.config.ts with proper polyfill configuration
- ✅ Updated netlify.toml with CSP headers for wallet connections
- ✅ Documented environment variable setup

## 🔍 Verify Environment Variables Are Set

After setting them in Netlify UI:

1. Go to: Site settings → Environment variables
2. You should see all 3 variables listed
3. **Important**: You must redeploy after adding environment variables!

## 🐛 Still Not Working?

### Check Browser Console

Open browser dev tools (F12) and check for errors:

- ❌ "Buffer is not defined" → Clear Netlify cache and redeploy
- ❌ "Program not initialized" → Check environment variables are set
- ❌ CSP errors → Already fixed in netlify.toml

### Clear Netlify Cache

1. Go to: **Site settings** → **Build & deploy** → **Build settings**
2. Click: **Clear cache and retry deploy**

### Check Wallet Network

Make sure Phantom wallet is connected to **Devnet** (not Mainnet):

1. Open Phantom wallet
2. Click settings (gear icon)
3. Change network → Developer Settings → Change network → Devnet

### Verify Program is Deployed

```bash
solana program show 4jGQ4kaxDsPJ57u1iN8gX1X7ngBji2Z8R8ERmcVp1BLW --url devnet
```

## 📚 Full Documentation

See `NETLIFY_FIX.md` for complete details and troubleshooting.

---

**Expected Result**: All three transaction types (Generate, Vote, Verify) should now prompt your wallet for approval when clicked! 🎉
