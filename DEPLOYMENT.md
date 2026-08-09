# GitHub Pages deployment

This is a static web app. It does not require Node.js, npm, or a build step.

Recommended GitHub Pages setup:
1. Upload the CONTENTS of this folder to the repository root (index.html must be at the root).
2. In Settings > Pages, choose Deploy from a branch.
3. Select main and /(root), then Save.
4. Commit any small change to main to trigger a fresh deployment if needed.

The `.nojekyll` file is included so GitHub Pages serves the static files directly without Jekyll processing.

A Node.js deprecation warning shown by the GitHub-generated Pages workflow is about GitHub Actions runtime dependencies, not this app; this app contains no Node package and no npm dependencies.
