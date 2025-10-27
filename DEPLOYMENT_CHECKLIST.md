# Netlify Deployment Checklist

Use this checklist to ensure your frontend is ready for deployment.

## Pre-Deployment Checklist

### 1. Environment Setup

- [ ] Create `.env.production` file in the `frontend` directory with:
  ```env
  VITE_SOLANA_NETWORK=devnet
  VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
  VITE_PROGRAM_ID=4jGQ4kaxDsPJ57u1iN8gX1X7ngBji2Z8R8ERmcVp1BLW
  ```
- [ ] Verify program ID matches your deployed Solana program
- [ ] Test RPC endpoint is accessible

### 2. Local Build Test

```bash
cd frontend
npm install
npm run build
npm run preview
```

- [ ] Build completes without errors
- [ ] Preview runs successfully at http://localhost:4173
- [ ] All features work in preview mode
- [ ] Wallet connection works
- [ ] No console errors

### 3. Git Repository

- [ ] All changes committed
  ```bash
  git add .
  git commit -m "Add Netlify configuration"
  ```
- [ ] Pushed to GitHub/GitLab
  ```bash
  git push origin main
  ```
- [ ] Repository is accessible (public or Netlify has access)

### 4. Netlify Account Setup

- [ ] Created Netlify account at https://app.netlify.com
- [ ] Connected GitHub/GitLab account
- [ ] Authorized Netlify to access repositories

## Deployment Steps

### Quick Start (UI Method)

1. [ ] Go to https://app.netlify.com
2. [ ] Click "Add new site" → "Import an existing project"
3. [ ] Select your Git provider and repository
4. [ ] Verify build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
5. [ ] Add environment variables in Netlify UI:
   - `VITE_SOLANA_NETWORK` = `devnet`
   - `VITE_SOLANA_RPC_URL` = `https://api.devnet.solana.com`
   - `VITE_PROGRAM_ID` = `4jGQ4kaxDsPJ57u1iN8gX1X7ngBji2Z8R8ERmcVp1BLW`
6. [ ] Click "Deploy site"
7. [ ] Wait for build to complete

### Alternative (CLI Method)

```bash
# Install CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy from project root
cd /Users/emilbob/Documents/PoA/proof_of_anchor
netlify init

# Set environment variables
netlify env:set VITE_SOLANA_NETWORK devnet
netlify env:set VITE_SOLANA_RPC_URL https://api.devnet.solana.com
netlify env:set VITE_PROGRAM_ID 4jGQ4kaxDsPJ57u1iN8gX1X7ngBji2Z8R8ERmcVp1BLW

# Deploy to production
netlify deploy --prod
```

## Post-Deployment Verification

### 1. Site Access

- [ ] Site URL is accessible (e.g., https://your-site.netlify.app)
- [ ] HTTPS is working
- [ ] Custom domain configured (if applicable)

### 2. Functionality Tests

- [ ] Home page loads correctly
- [ ] All pages/routes accessible (refresh works)
- [ ] Wallet connection works
  - [ ] Can connect Phantom wallet
  - [ ] Can connect Solflare wallet
  - [ ] Can connect other supported wallets
- [ ] Proof generation works
- [ ] Proof verification works
- [ ] Project submission works
- [ ] Community voting works

### 3. Browser Console

- [ ] No JavaScript errors
- [ ] No 404 errors for assets
- [ ] Environment variables loaded correctly
  - Check: `console.log(import.meta.env.VITE_PROGRAM_ID)` in browser console

### 4. Network Testing

- [ ] Test on different browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on mobile devices
- [ ] Test on different network conditions

### 5. Solana Integration

- [ ] Can connect to devnet
- [ ] Transactions submit successfully
- [ ] Transaction confirmations work
- [ ] Can view transactions on Solana Explorer
- [ ] Program interactions work as expected

## Monitoring & Maintenance

### Netlify Dashboard

- [ ] Set up deploy notifications (Email/Slack)
- [ ] Review build logs for warnings
- [ ] Check bandwidth usage
- [ ] Monitor build minutes

### Performance

- [ ] Enable Asset Optimization (Site Settings → Build & deploy → Post processing)
- [ ] Check Lighthouse scores
- [ ] Monitor loading times
- [ ] Optimize images if needed

### Security

- [ ] Review security headers (configured in netlify.toml)
- [ ] Ensure environment variables are not exposed in client code
- [ ] Set up branch protection in Git
- [ ] Review Netlify access permissions

## Continuous Deployment

Once set up, Netlify will automatically:

- ✅ Deploy when you push to main branch
- ✅ Create preview deployments for pull requests
- ✅ Run builds and show logs
- ✅ Rollback to previous deploys if needed

### Making Updates

```bash
# Make changes locally
git add .
git commit -m "Your update message"
git push origin main

# Netlify automatically deploys!
```

## Troubleshooting

### Build Fails

1. Check build logs in Netlify dashboard
2. Verify `package.json` scripts are correct
3. Test build locally: `cd frontend && npm run build`
4. Check Node.js version compatibility

### Site Shows Blank Page

1. Open browser developer console (F12)
2. Check for JavaScript errors
3. Verify environment variables in Netlify
4. Check that all assets are loading (Network tab)

### Wallet Connection Fails

1. Verify `VITE_PROGRAM_ID` is correct
2. Check `VITE_SOLANA_RPC_URL` is accessible
3. Ensure wallet extension is installed
4. Check browser console for errors

### 404 Errors on Refresh

- This should be handled by `netlify.toml` redirects
- Verify `netlify.toml` is in the frontend directory
- Check redirect rules in Netlify dashboard

## Need Help?

- 📚 [Netlify Documentation](https://docs.netlify.com)
- 💬 [Netlify Community Forum](https://answers.netlify.com)
- 🎯 [Solana Developers Discord](https://discord.gg/solana)
- 📖 [Full Deployment Guide](./NETLIFY_DEPLOYMENT.md)

## Quick Commands Reference

```bash
# Test build locally
cd frontend && npm run build && npm run preview

# Deploy via CLI
netlify deploy --prod

# Check deployment status
netlify status

# View site logs
netlify logs

# Open site in browser
netlify open:site

# Open Netlify dashboard
netlify open:admin
```
