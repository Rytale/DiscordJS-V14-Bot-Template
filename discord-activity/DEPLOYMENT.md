# Deployment Guide

Complete step-by-step guide to deploy your Discord Watch Party Activity to production.

## Quick Start

Choose your preferred hosting platform:

- [Vercel](#vercel-deployment) (Recommended - Easiest)
- [Netlify](#netlify-deployment)
- [Cloudflare Pages](#cloudflare-pages-deployment)

All three platforms offer free tiers suitable for this project.

## Prerequisites

Before deploying:

1. ✅ Node.js 18+ installed
2. ✅ Git installed
3. ✅ Discord Application created (see [DISCORD_SETUP.md](./DISCORD_SETUP.md))
4. ✅ Code tested locally
5. ✅ GitHub account (or GitLab/Bitbucket for some platforms)

## Vercel Deployment

### Option 1: Deploy via Vercel CLI (Fastest)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Navigate to project**:
   ```bash
   cd discord-activity
   ```

3. **Login to Vercel**:
   ```bash
   vercel login
   ```

4. **Deploy**:
   ```bash
   vercel
   ```
   
   Follow prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - What's your project's name? `watchparty-activity` (or your choice)
   - In which directory is your code located? `./`
   - Want to override settings? **N**

5. **Set Environment Variables**:
   ```bash
   vercel env add VITE_DISCORD_CLIENT_ID
   ```
   Paste your Discord Application ID when prompted.

6. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

7. **Copy the Production URL**:
   - Use this URL in Discord Developer Portal
   - Update bot code with this URL

### Option 2: Deploy via Vercel Dashboard

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/watchparty-activity.git
   git push -u origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click **"New Project"**
   - Import your GitHub repository
   - Select the `discord-activity` folder as root directory

3. **Configure Build Settings**:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Add Environment Variables**:
   - Click **"Environment Variables"**
   - Add `VITE_DISCORD_CLIENT_ID` with your Discord Application ID
   - Apply to all environments

5. **Deploy**:
   - Click **"Deploy"**
   - Wait for build to complete
   - Copy your production URL

### Vercel Custom Domain (Optional)

1. **Add Custom Domain**:
   - Go to Project Settings → Domains
   - Add your domain
   - Follow DNS configuration instructions

2. **Update Discord Portal**:
   - Update Activity URL mapping with custom domain

## Netlify Deployment

### Option 1: Deploy via Netlify CLI

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Navigate to project**:
   ```bash
   cd discord-activity
   ```

3. **Login to Netlify**:
   ```bash
   netlify login
   ```

4. **Initialize and Deploy**:
   ```bash
   netlify init
   ```
   
   Follow prompts:
   - Create & configure a new site
   - Choose team/account
   - Site name: `watchparty-activity`
   - Build command: `npm run build`
   - Directory to deploy: `dist`
   - Functions: Leave empty

5. **Set Environment Variables**:
   ```bash
   netlify env:set VITE_DISCORD_CLIENT_ID your_discord_app_id
   ```

6. **Deploy to Production**:
   ```bash
   netlify deploy --prod
   ```

7. **Copy the Site URL**:
   - Use this URL in Discord Developer Portal

### Option 2: Deploy via Netlify Dashboard

1. **Push to GitHub** (same as Vercel Option 2)

2. **Import to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Click **"Add new site"** → **"Import an existing project"**
   - Connect to GitHub and select repository
   - Select branch: `main`

3. **Configure Build Settings**:
   - Base directory: `discord-activity`
   - Build command: `npm run build`
   - Publish directory: `discord-activity/dist`

4. **Add Environment Variables**:
   - Go to Site Settings → Environment Variables
   - Add `VITE_DISCORD_CLIENT_ID`
   - Save and redeploy if needed

5. **Deploy**:
   - Netlify auto-deploys on push
   - Copy your site URL

## Cloudflare Pages Deployment

### Prerequisites

- Cloudflare account
- Repository pushed to GitHub/GitLab

### Steps

1. **Push to GitHub** (if not already done)

2. **Create Cloudflare Pages Project**:
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Navigate to **Workers & Pages** → **Pages**
   - Click **"Create a project"**
   - Click **"Connect to Git"**

3. **Connect Repository**:
   - Authorize Cloudflare
   - Select your repository
   - Select branch: `main`

4. **Configure Build**:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `discord-activity`

5. **Add Environment Variables**:
   - Expand **Environment variables**
   - Add `VITE_DISCORD_CLIENT_ID`
   - Value: Your Discord Application ID

6. **Deploy**:
   - Click **"Save and Deploy"**
   - Wait for build to complete
   - Copy your Pages URL (e.g., `your-project.pages.dev`)

7. **Custom Domain** (Optional):
   - Go to Pages project → Custom domains
   - Add your domain
   - Follow DNS instructions

## Post-Deployment Steps

### 1. Update Discord Developer Portal

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to **Activities**
4. Under **Activity URL Mappings**, add:
   - Environment: **Production**
   - URL Prefix: Your deployment URL
5. Save changes

### 2. Update Bot Code

In `src/commands/Entertainment/slashcommand-watchparty-activity.js`:

```javascript
const activityUrl = `https://your-actual-deployment.vercel.app/?streamUrl=${encodeURIComponent(streamUrl)}&title=${encodeURIComponent(title)}`;
```

Replace `your-actual-deployment.vercel.app` with your actual domain.

### 3. Add to Bot Environment

In your bot's `.env` file:

```env
DISCORD_ACTIVITY_APP_ID=your_discord_activity_application_id
```

### 4. Test the Deployment

1. Restart your Discord bot
2. Join a voice channel in Discord
3. Run: `/watch url:https://test-video.com/sample.mp4 title:Test`
4. Click the launch button
5. Verify activity loads correctly
6. Test with multiple users for sync

## Continuous Deployment

### Vercel

Auto-deploys on:
- Push to main branch
- Pull request merges

Configure in: Project Settings → Git

### Netlify

Auto-deploys on:
- Push to production branch
- Pull request (deploys preview)

Configure in: Site Settings → Build & Deploy

### Cloudflare Pages

Auto-deploys on:
- Push to production branch
- Can configure preview branches

Configure in: Pages project → Settings

## Environment Variables

All platforms support these methods:

### Via Dashboard
Most user-friendly, available in platform settings

### Via CLI
```bash
# Vercel
vercel env add VARIABLE_NAME

# Netlify
netlify env:set VARIABLE_NAME value

# Cloudflare (via Wrangler)
wrangler pages secret put VARIABLE_NAME
```

### Via Git Push
Some platforms support `.env` files (not recommended for secrets)

## Monitoring & Logs

### Vercel
- Dashboard → Your Project → Deployments
- Real-time logs during build
- Function logs available

### Netlify
- Site overview → Deploys
- Build logs for each deployment
- Function logs in separate section

### Cloudflare Pages
- Pages project → Deployments
- Build logs and errors
- Real-time tail logs available

## Troubleshooting

### Build Fails

**Check**:
- Node version compatibility (18+)
- All dependencies in package.json
- Build command is correct
- Environment variables are set

**Solution**:
```bash
# Test build locally
cd discord-activity
npm install
npm run build
```

### Activity Won't Load

**Check**:
- Discord Application ID is correct in `.env`
- URL mapping matches deployment URL exactly
- HTTPS is enabled (required by Discord)
- CORS headers are correct

**Solution**:
- Check browser console for errors
- Verify environment variables are deployed
- Test URL directly in browser

### Environment Variables Not Working

**Check**:
- Variables start with `VITE_` for client-side access
- Variables are set in production environment
- Deployment was triggered after setting variables

**Solution**:
- Redeploy after setting variables
- Check variable names match exactly
- Use platform-specific commands to verify

## Performance Optimization

### Vercel
- Automatic CDN distribution
- Edge caching enabled by default
- Optimize with `vercel.json`:
  ```json
  {
    "headers": [
      {
        "source": "/(.*)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  }
  ```

### Netlify
- Global CDN enabled by default
- Configure in `netlify.toml`:
  ```toml
  [[headers]]
    for = "/*"
    [headers.values]
      Cache-Control = "public, max-age=31536000, immutable"
  ```

### Cloudflare Pages
- Cloudflare's global network
- Automatic caching and optimization
- Configure via dashboard or `_headers` file

## Security Best Practices

1. **Never commit `.env` files**
   - Use `.env.example` instead
   - Add `.env` to `.gitignore`

2. **Use environment variables**
   - For all sensitive data
   - Platform-specific secret management

3. **Enable HTTPS**
   - Required by Discord
   - Automatic on all platforms

4. **Regular Updates**
   - Keep dependencies updated
   - Monitor security advisories

## Cost Considerations

### Free Tiers

**Vercel**:
- ✅ 100 GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Serverless functions included

**Netlify**:
- ✅ 100 GB bandwidth/month
- ✅ 300 build minutes/month
- ✅ Unlimited sites

**Cloudflare Pages**:
- ✅
