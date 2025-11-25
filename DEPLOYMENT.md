# Deployment Guide

Guide for deploying EV Trip Log to GitHub Pages with optional custom domain support.

## Prerequisites

- GitHub account
- Repository for this project
- Custom domain (optional)

## Configuration Files

The following files are configured for GitHub Pages:

next.config.ts:
- Static export enabled
- Images unoptimized
- Trailing slashes enabled

.github/workflows/deploy.yml:
- Automated CI/CD pipeline
- Triggers on push to main branch
- Builds and deploys automatically

public/CNAME (optional):
- Contains custom domain
- Delete if not using custom domain

public/.nojekyll:
- Prevents Jekyll processing
- Ensures proper file serving

## Setup Instructions

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Configure GitHub Pages deployment"
git push origin main
```

### Step 2: Enable GitHub Pages

1. Go to repository Settings
2. Navigate to Pages section
3. Under Source, select GitHub Actions
4. Workflow deploys automatically on next push

### Step 3: Configure Custom Domain (Optional)

Skip if not using custom domain. Site will be at:
https://username.github.io/repository-name

For Apex Domain (yourdomain.com):

Add A records to DNS:
```
A     185.199.108.153
A     185.199.109.153
A     185.199.110.153
A     185.199.111.153
```

Update public/CNAME:
```
yourdomain.com
```

For Subdomain (app.yourdomain.com):

Add CNAME record to DNS:
```
CNAME app.yourdomain.com -> username.github.io
```

Update public/CNAME:
```
app.yourdomain.com
```

### Step 4: Verify Custom Domain (Optional)

Skip if not using custom domain.

1. Go to Settings > Pages
2. Enter domain under Custom domain
3. Click Save
4. Wait for DNS check (few minutes to 48 hours)
5. Enable Enforce HTTPS once verified

## Build and Test Locally

```bash
# Install dependencies
npm install

# Build static site
npm run build

# Serve locally
npx serve out
```

## Deployment Process

Automatic deployment on push to main:

1. Push changes to main branch
2. GitHub Actions triggers
3. Application builds
4. Static files deploy to GitHub Pages
5. Site available at configured URL

## Troubleshooting

### Build Fails

- Check Actions tab for error logs
- Verify dependencies in package.json
- Check Node.js version compatibility

### Custom Domain Not Working

- Verify DNS records
- Wait 24-48 hours for DNS propagation
- Check CNAME file in public directory
- Verify custom domain in GitHub Pages settings

### 404 Errors

- Verify trailingSlash: true in next.config.ts
- Check .nojekyll file exists
- Ensure routes exported as static pages

### Images Not Loading

- Verify images.unoptimized: true in next.config.ts
- Use relative paths for public directory images
- Check images in build output

## Monitoring

- View deployment status in Actions tab
- Check build logs for warnings
- Monitor performance with browser dev tools

## Updating the Site

```bash
git add .
git commit -m "Update message"
git push origin main
```

Site rebuilds and redeploys automatically within minutes.

## Resources

- Next.js Static Exports: https://nextjs.org/docs/app/building-your-application/deploying/static-exports
- GitHub Pages: https://docs.github.com/en/pages
- GitHub Actions: https://docs.github.com/en/actions
