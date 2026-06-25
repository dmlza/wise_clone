# Wisecracker — Crypto-Fiat Bridge

A cross-border money transfer dashboard built as a hybrid mobile app. Wraps a Tailwind CSS web app in a native Android shell using Capacitor.

## Tech Stack

- **Frontend:** HTML, Tailwind CSS, JavaScript (vanilla)
- **Charts:** ApexCharts (candlestick)
- **Animations:** GSAP + ScrollTrigger
- **Mobile:** Capacitor 8 (Android)
- **Target:** Android 7.0+ (API 24)

## Features

- Landing page with currency converter, parallax showcase, FAQ accordion
- User dashboard with multi-currency balances (BTC, USD, EUR, GBP)
- BTC/USDT candlestick chart (simulated 24h data)
- Send money modal with fee breakdown ($4.50 + 0.4%)
- Card management (add, freeze, set funding source, spend limits)
- Recipient management (wallet, bank, email types)
- Locked vs floating rate mode
- Sign-in / sign-up flow

## Getting Started

```bash
# Install dependencies
npm install

# Sync web assets to Android project
npm run sync

# Open in Android Studio
npx cap open android

# Or build APK directly
cd android && ./gradlew assembleDebug
```

The debug APK will be at `android/app/outputs/apk/debug/app-debug.apk`.

## Project Structure

```
├── index.html          # Landing page
├── signin.html         # Sign-in page
├── signup.html         # Sign-up page
├── dashboard.html      # Main dashboard (cards, recipients, chart)
├── assets/
│   └── js/app.js       # Shared JavaScript
├── www/                # Web assets copied to Android
├── android/            # Android project (Capacitor)
└── capacitor.config.json
```

## Notes

- This is a frontend-only prototype — no backend, no real authentication, no live market data
- Exchange rates and fees are hardcoded for demonstration
- Built with Android in mind; iOS not configured

## License

ISC
