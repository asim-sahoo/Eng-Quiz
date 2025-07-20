# 🚀 GitHub Pages Deployment Guide

Follow these steps to deploy your English Vocabulary Quiz to GitHub Pages:

## Step 1: Create GitHub Repository

1. **Go to GitHub** and sign in to your account
2. **Click "New repository"** (the green "New" button)
3. **Repository name**: `Eng-Quiz` (must match exactly)
4. **Description**: `Modern English Vocabulary Quiz with animations and interactive features`
5. **Make it Public** (required for GitHub Pages free tier)
6. **Don't initialize** with README, .gitignore, or license (we already have these)
7. **Click "Create repository"**

## Step 2: Connect Local Repository to GitHub

Run these commands in your terminal:

```bash
# Add GitHub repository as remote origin
git remote add origin https://github.com/YOUR_USERNAME/Eng-Quiz.git

# Rename default branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

**Replace `YOUR_USERNAME`** with your actual GitHub username!

## Step 3: Enable GitHub Pages

1. **Go to your repository** on GitHub
2. **Click "Settings"** tab (at the top of the repo)
3. **Scroll down to "Pages"** in the left sidebar
4. **Source**: Select "GitHub Actions" (not "Deploy from a branch")
5. **Save** the settings

## Step 4: Update Configuration Files

### Update package.json
Replace the homepage URL in `package.json`:
```json
"homepage": "https://YOUR_USERNAME.github.io/Eng-Quiz"
```

### Update vite.config.js
The `vite.config.js` already has the correct base path: `/Eng-Quiz/`

### Update README.md
Replace the demo link in `README.md`:
```markdown
Visit the live application: [English Vocabulary Quiz](https://YOUR_USERNAME.github.io/Eng-Quiz/)
```

## Step 5: Commit and Push Changes

```bash
# Add the updated files
git add package.json README.md

# Commit the changes
git commit -m "Update GitHub Pages configuration"

# Push to GitHub
git push origin main
```

## Step 6: Wait for Deployment

1. **Go to the "Actions" tab** in your GitHub repository
2. **Watch the deployment workflow** run (it takes 1-2 minutes)
3. **Once complete**, your site will be live at: `https://YOUR_USERNAME.github.io/Eng-Quiz/`

## 🎉 Your Quiz is Now Live!

Visit your deployed quiz and share it with others! The GitHub Action will automatically redeploy whenever you push changes to the main branch.

## Alternative Manual Deployment

If you prefer manual deployment:

```bash
# Build the project
npm run build

# Deploy to GitHub Pages
npm run deploy
```

This will create a `gh-pages` branch with your built files.

## Troubleshooting

### Common Issues:

1. **404 Error**: Make sure the repository name matches the base path in vite.config.js
2. **Assets not loading**: Ensure the `base` path in vite.config.js is correct
3. **Workflow fails**: Check that GitHub Actions is enabled in your repository settings
4. **Site not updating**: Clear your browser cache or try an incognito window

### Need Help?

- Check the Actions tab for error logs
- Ensure all file paths are correct
- Verify the repository is public
- Make sure GitHub Pages is enabled with "GitHub Actions" source

---

🚀 **Happy deploying!** Your English Vocabulary Quiz will be available worldwide!
