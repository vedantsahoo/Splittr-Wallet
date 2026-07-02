# Splittr - Digital Wallet & Split Bill App

Splittr is a modern, premium digital wallet and split bill application built with React, TypeScript, Vite, and Tailwind CSS v4.

## Features

- **Total Balance & Currency Toggle:** Real-time multi-currency support (INR, USD, EUR) with live exchange rate conversions.
- **Quick Wallet Actions:** Send money, add money, split bills, and view analytics.
- **Recent Transactions:** A detailed log of all inbound and outbound transactions.
- **Expense Groups:** Create custom groups (e.g., Trip, Home, Dinner) to log shared expenses with built-in debt-simplification calculations.
- **Savings Goals:** Track savings targets with interactive animated progress indicators.
- **Responsive Layout:** Optimized for mobile, tablet, and desktop views with a responsive Navigation Rail, Top App Bar, and Bottom Navigation.

## Tech Stack

- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4 with `@tailwindcss/vite` plugin (no PostCSS configuration needed)
- **State Management:** Zustand (Global Client State & LocalStorage Persistence). React Query is configured at the root but not active in screens.
- **Animations:** Framer Motion (Page transitions, Spring sheet physics, modal overlay entries, and progress bar fills)
- **Charts:** Recharts (with built-in SVG transitions)
- **Icons:** Lucide React

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed (v20+ recommended).

### Installation

1. Install project dependencies:
   ```bash
   npm install
   ```

2. Start the local development server:
   ```bash
   npm run dev
   ```
   The application will run locally at `http://localhost:3000`.

3. Build the application for production:
   ```bash
   npm run build
   ```
