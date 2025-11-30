# Deployment Guide

This guide will help you deploy the Python Learning Platform to various hosting services.

## Prerequisites

1. A GitHub account (recommended for easy deployment)
2. Node.js installed locally (for testing builds)

## Option 1: Deploy to Vercel (Recommended)

### Steps:

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with your GitHub account
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Vite settings
   - Click "Deploy"

3. **Your app will be live!** Vercel provides a URL like `your-app.vercel.app`

### Configuration:
The `vercel.json` file is already configured for this project.

## Option 2: Deploy to Netlify

### Steps:

1. **Push your code to GitHub** (same as above)

2. **Deploy to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Sign up/Login with your GitHub account
   - Click "New site from Git"
   - Select your repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Click "Deploy site"

3. **Your app will be live!** Netlify provides a URL like `your-app.netlify.app`

### Configuration:
The `netlify.toml` file is already configured for this project.

## Option 3: Deploy to GitHub Pages

### Steps:

1. **Install gh-pages package:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json:**
   Add these scripts:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. **Update vite.config.js:**
   ```js
   export default {
     base: '/your-repo-name/',
     // ... other config
   }
   ```

4. **Deploy:**
   ```bash
   npm run deploy
   ```

## Environment Variables

Currently, no environment variables are required as all data is stored in LocalStorage.

## Post-Deployment

1. Test all features:
   - User registration/login
   - Viewing problems
   - Admin functionality (create/edit/delete)
   - Python compiler

2. Default admin accounts:
   - Username: `admin` | Password: `admin123`
   - Username: `teacher` | Password: `teacher123`

## Troubleshooting

### Build fails:
- Make sure all dependencies are installed: `npm install`
- Check for any console errors in the build output

### Routing issues (404 on refresh):
- Make sure your hosting service is configured for SPA routing
- Vercel and Netlify configs are already set up
- For GitHub Pages, ensure base path is correct

### Python compiler not working:
- Pyodide loads from CDN, requires internet connection
- Check browser console for errors
- Ensure the CDN URL is accessible

## Custom Domain

Both Vercel and Netlify support custom domains:
- **Vercel:** Settings → Domains → Add domain
- **Netlify:** Site settings → Domain management → Add custom domain

