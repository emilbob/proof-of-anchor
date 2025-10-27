# Deploying Frontend to Netlify

This guide will help you deploy the Proof of Anchor frontend to Netlify.

## Prerequisites

- A GitHub account (or GitLab/Bitbucket)
- A Netlify account (free tier is sufficient) - Sign up at [netlify.com](https://www.netlify.com)
- Your code pushed to a Git repository

## Deployment Methods

### Method 1: Deploy via Netlify UI (Recommended for first-time setup)

1. **Push your code to GitHub** (if not already done):

   ```bash
   git add .
   git commit -m "Add Netlify configuration"
   git push origin main
   ```

2. **Log in to Netlify**:

   - Go to [app.netlify.com](https://app.netlify.com)
   - Sign up or log in with your GitHub account

3. **Create a new site**:

   - Click "Add new site" → "Import an existing project"
   - Choose "Deploy with GitHub" (or your Git provider)
   - Authorize Netlify to access your repositories
   - Select your `proof_of_anchor` repository

4. **Configure build settings**:

   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

   (These should be auto-detected from `netlify.toml`)

5. **Set environment variables** (if needed):

   - Click "Site settings" → "Environment variables"
   - Add any environment variables your app needs (e.g., Solana RPC endpoint, program IDs)
   - Example variables:
     - `VITE_SOLANA_NETWORK` = `devnet` or `mainnet-beta`
     - `VITE_PROGRAM_ID` = Your deployed program ID
     - `VITE_RPC_ENDPOINT` = Your RPC endpoint URL

6. **Deploy**:

   - Click "Deploy site"
   - Netlify will build and deploy your site
   - You'll get a URL like `https://random-name-123456.netlify.app`

7. **Custom domain** (optional):
   - Go to "Domain settings"
   - Click "Add custom domain"
   - Follow the instructions to configure your DNS

### Method 2: Deploy via Netlify CLI

1. **Install Netlify CLI**:

   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:

   ```bash
   netlify login
   ```

3. **Initialize your site** (from project root):

   ```bash
   netlify init
   ```

   - Choose "Create & configure a new site"
   - Select your team
   - Enter a site name (or leave blank for random)
   - Build command: `npm run build`
   - Directory to deploy: `frontend/dist`
   - Netlify functions folder: (leave blank)

4. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

### Method 3: Manual Deploy (for testing)

From the frontend directory:

```bash
cd frontend
npm run build
netlify deploy --dir=dist
```

For production:

```bash
netlify deploy --prod --dir=dist
```

## Build Configuration

The `netlify.toml` file in your frontend directory handles:

- ✅ Build command and output directory
- ✅ SPA routing (redirects all routes to index.html)
- ✅ Security headers
- ✅ Asset caching

## Environment Variables

If your frontend needs environment variables, create a `.env.production` file in the frontend directory:

```env
VITE_SOLANA_NETWORK=devnet
VITE_PROGRAM_ID=your_program_id_here
VITE_RPC_ENDPOINT=https://api.devnet.solana.com
```

Then add these same variables in Netlify:

1. Site Settings → Environment Variables
2. Add each variable
3. Redeploy the site

## Continuous Deployment

Once connected to GitHub, Netlify will automatically:

- Deploy when you push to your main branch
- Create preview deployments for pull requests
- Show build logs for debugging

## Troubleshooting

### Build fails with "command not found"

- Make sure `package.json` has the correct build script
- Check Node version (Netlify uses Node 18 by default)

### App loads but shows blank page

- Check browser console for errors
- Verify all environment variables are set correctly
- Check that base path in vite.config.ts is correct

### Solana wallet connection fails

- Verify RPC endpoint is accessible
- Check that program ID is correct
- Ensure CORS is properly configured on your RPC endpoint

### 404 errors on page refresh

- The `netlify.toml` redirects configuration should handle this
- Make sure the file is in the `frontend` directory

## Post-Deployment

After deployment:

1. Test wallet connections
2. Test all features (proof generation, verification, etc.)
3. Monitor the Netlify dashboard for build status
4. Check Netlify Functions logs if using serverless functions

## Performance Optimization

Consider these optimizations:

- Enable Netlify's Asset Optimization in Site Settings
- Use Netlify's CDN for fast global access
- Enable form handling if you have forms
- Set up Netlify Analytics (paid feature)

## Cost

- **Free tier** includes:
  - 100 GB bandwidth/month
  - 300 build minutes/month
  - Automatic HTTPS
  - Continuous deployment

This should be sufficient for most projects!

## Support

- [Netlify Documentation](https://docs.netlify.com)
- [Netlify Community Forum](https://answers.netlify.com)
- [Netlify Status](https://www.netlifystatus.com)
