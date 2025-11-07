# Deployment Guide for GitHub Pages

This guide explains how to deploy the E-TripLog application to GitHub Pages with a custom domain.

## Prerequisites

1. A GitHub account
2. A repository for this project
3. A custom domain (optional)

## Configuration Files

The following files have been configured for GitHub Pages deployment:

### 1. `next.config.ts`
- Configured for static export (`output: 'export'`)
- Images set to unoptimized mode
- Trailing slashes enabled for better compatibility

### 2. `.github/workflows/deploy.yml`
- Automated CI/CD pipeline using GitHub Actions
- Triggers on push to `main` branch
- Builds the Next.js application
- Deploys to GitHub Pages

### 3. `public/CNAME` (Optional - for custom domains only)
- Contains your custom domain (e.g., `yourdomain.com` or `subdomain.yourdomain.com`)
- Automatically copied to the output directory during build
- **If not using a custom domain**, delete this file and skip Step 3 and Step 4

### 4. `public/.nojekyll`
- Prevents GitHub Pages from processing files with Jekyll
- Ensures proper serving of Next.js static files

## Setup Instructions

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Configure GitHub Pages deployment with custom domain"
git push origin main
```

### Step 2: Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. The workflow will automatically deploy on the next push

### Step 3: Configure Custom Domain DNS (Optional)

**Skip this step if you're not using a custom domain. Your site will be available at `https://<your-github-username>.github.io/<repository-name>`**

#### Option A: Using an Apex Domain (e.g., `yourdomain.com`)

Add these A records to your DNS provider:
```
A     185.199.108.153
A     185.199.109.153
A     185.199.110.153
A     185.199.111.153
```

Then update `public/CNAME` to contain your apex domain:
```
yourdomain.com
```

#### Option B: Using a Subdomain (e.g., `app.yourdomain.com`)

Add a CNAME record to your DNS provider:
```
CNAME app.yourdomain.com → <your-github-username>.github.io
```

Or use an ALIAS/ANAME record pointing to:
```
<your-github-username>.github.io
```

Then update `public/CNAME` to contain your subdomain:
```
app.yourdomain.com
```

### Step 4: Verify Custom Domain (Optional)

**Skip this step if you're not using a custom domain.**

1. Go to **Settings** → **Pages** in your GitHub repository
2. Under **Custom domain**, enter your domain (e.g., `yourdomain.com` or `app.yourdomain.com`)
3. Click **Save**
4. Wait for DNS check to complete (may take a few minutes to 48 hours)
5. Enable **Enforce HTTPS** once DNS is verified

## Build and Test Locally

To test the static export locally:

```bash
# Install dependencies
npm install

# Build the static site
npm run build

# The output will be in the 'out' directory
# You can serve it locally with:
npx serve out
```

## Deployment Process

Once configured, the deployment process is automatic:

1. Push changes to the `main` branch
2. GitHub Actions workflow triggers automatically
3. Application is built and tested
4. Static files are deployed to GitHub Pages
5. Site is available at:
   - **With custom domain**: `https://yourdomain.com`
   - **Without custom domain**: `https://<your-github-username>.github.io/<repository-name>`

## Troubleshooting

### Build Fails
- Check the Actions tab in GitHub for error logs
- Ensure all dependencies are listed in `package.json`
- Verify Node.js version compatibility (using Node 20)

### Custom Domain Not Working
- Verify DNS records are correctly configured
- Wait up to 24-48 hours for DNS propagation
- Check that CNAME file exists in the `public` directory
- Ensure custom domain is set in GitHub Pages settings

### 404 Errors
- Verify `trailingSlash: true` is set in `next.config.ts`
- Check that `.nojekyll` file exists in the `public` directory
- Ensure all routes are properly exported as static pages

### Images Not Loading
- Verify `images.unoptimized: true` is set in `next.config.ts`
- Use relative paths for images in the `public` directory
- Check that image files are included in the build output

## Monitoring

- View deployment status in the **Actions** tab
- Check build logs for any warnings or errors
- Monitor site performance using browser developer tools

## Updating the Site

To update the deployed site:

```bash
# Make your changes
git add .
git commit -m "Your commit message"
git push origin main
```

The site will automatically rebuild and redeploy within a few minutes.

## Additional Resources

- [Next.js Static Exports Documentation](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
