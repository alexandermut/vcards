# Deployment Guide

Since this is a **Vite + React** application, it is a "static site" that can be hosted easily on platforms like Vercel, Netlify, or GitHub Pages.

## ⚠️ Important: API Keys & AI Features

This application uses the Google Gemini API.
- **In Google AI Studio**: The environment might inject the key automatically.
- **On the Web (Vercel/Netlify)**: You cannot securely hide an API Key in a frontend-only application.
  - **Recommended**: Do **NOT** hardcode your API key in the code or environment variables if the site is public.
  - **Best Practice**: Deploy the app without a key. When you or a user opens the app, go to **Settings** and enter a personal Gemini API Key. The app saves it in the browser's LocalStorage.

## Option 1: Deploy to Vercel (Recommended)

1.  Create a [Vercel account](https://vercel.com/).
2.  Install Vercel CLI: `npm i -g vercel` (or use the web dashboard).
3.  Run `vercel` in this directory.
4.  Follow the prompts (accept defaults).
5.  **Done!** You will get a URL (e.g., `vcard-editor.vercel.app`).

## Option 2: Deploy to Netlify

1.  Create a [Netlify account](https://netlify.com/).
2.  Drag and drop the `dist` folder (created by `npm run build`) into the Netlify dashboard.
3.  **Done!**

## Option 3: Manual Upload (Not Recommended for Chat)

You asked if you should upload files to "Google AI Chat".
- **No.** Chat interfaces are not meant for hosting web apps.
- Use one of the specialized hosts above for a proper, permanent link.

## Building for Production

We have already configured the project to build locally.
1.  Run `npm run build`.
2.  The output is in the `dist` folder.
3.  This `dist` folder is what you upload if doing it manually.

## Option 4: GitHub Pages

You can host the app for free on GitHub Pages.

### Prerequisites
1.  You need a GitHub account.
2.  You need to push this code to a GitHub repository.

### Configuration (Important!)
If your repository URL is `https://github.com/alexandermut/vcards`, you must set the base path in `vite.config.ts`.
Since we used `base: './'`, it should work automatically!

If you want to be explicit:
```typescript
// vite.config.ts
export default defineConfig({
  base: '/vcards/', // Matches your repo name
  plugins: [react()],
})
```

### Deployment Steps (Easy Method)
1.  Push your code to GitHub.
2.  Go to your repository **Settings** -> **Pages**.
3.  Under **Build and deployment**, select **GitHub Actions**.
4.  Click **Static HTML** or **Configure** on a static site workflow.
5.  GitHub will build and deploy your app.

### Deployment Steps (Manual / gh-pages)
1.  Install the deployer: `npm install gh-pages --save-dev`
2.  Add this script to `package.json`:
    ```json
    "scripts": {
      "deploy": "gh-pages -d dist"
    }
    ```
3.  Run `npm run build`.
4.  Run `npm run deploy`.

