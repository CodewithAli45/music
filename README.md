# Modern Music Player (Web, PWA, & Android Native)

A premium, modern music player application built with Next.js. It functions flawlessly as a responsive web app, an installable Progressive Web App (PWA), and a fully native Android application using Capacitor.

## Features

- **Cross-Platform:** Works on desktop browsers, mobile browsers (as a PWA), and natively on Android.
- **Premium UI/UX:** Glassmorphism design, fluid animations, and beautiful dynamic layouts.
- **Responsive Design:** Dedicated views for desktop (`DesktopPlayer`) and mobile (`MobilePlayer`).
- **Cloudinary Integration:** Automatically fetches music tracks securely from a connected Cloudinary account.
- **Media Session Support:** Playback can be controlled via the OS lock screen, notification shade, or connected Bluetooth devices.

---

## 🚀 Getting Started (Web & PWA)

To run the web application locally:

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up your environment variables:
   Create a `.env` file in the root and add your Cloudinary credentials:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note on PWA:** The PWA capabilities (Service Worker, caching) are enabled automatically in production builds (`npm run build && npm start`) and disabled during local development to avoid caching issues.

---

## 📱 Android Native App (Capacitor)

We have wrapped the Next.js application using [Capacitor](https://capacitorjs.com/) to compile it into a native Android APK.

### Prerequisites for Building Android
- **Java 17** installed (`openjdk-17-jdk`).
- **Android SDK** and Command Line Tools installed (usually in `~/Android/Sdk`).

### Updating the Android App

If you make changes to the Next.js codebase (UI updates, new features) and want to update the Android APK:

1. Run the custom Android build script:
   ```bash
   npm run build:android
   ```
   *This command exports your Next.js app as a static HTML site, prepares the API routes for offline usage, and syncs the changes to the native `android` directory.*

2. Compile the Android APK:
   ```bash
   export ANDROID_HOME="$HOME/Android/Sdk"
   export PATH="$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools"
   cd android
   ./gradlew assembleDebug
   ```

3. Locate your generated APK:
   The compiled APK will be found at:
   `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🌐 Deploying to Vercel

The application is fully compatible with Vercel for seamless cloud deployment.

Because we decoupled the Capacitor static-export configuration from the standard Next.js config, pushing your code to GitHub will automatically trigger a flawless Vercel build! The Vercel deployment ignores the Android build tools and runs the app using full SSR/API capabilities.

Just push your changes to the `main` branch to update your live Web App / PWA!

---

## 🎨 Modifying App Icons

The app icons are synchronized across the Web PWA and the Android app. 

1. Replace the master logo at `public/asset/logo.png`.
2. Generate the new Android icons by running:
   ```bash
   npx capacitor-assets generate --android
   ```
3. Rebuild the Android app (`npm run build:android`).
