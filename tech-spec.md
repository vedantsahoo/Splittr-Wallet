# Splittr - Technical Specification

## Dependencies

### Core Framework

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^19.2.7 | UI framework |
| `react-dom` | ^19.2.7 | React DOM renderer |
| `react-router-dom` | ^7.18.0 | SPA routing with nested layouts |

### Animation

| Package | Version | Purpose |
|---------|---------|---------|
| `framer-motion` | ^12.41.0 | Page transitions, Bottom Sheet spring entries, Modal overlays, button scale feedback |
| `gsap` | ^3.15.0 | *Unused.* Installed in dependencies, but animations are handled via Framer Motion and CSS |

### Charts

| Package | Version | Purpose |
|---------|---------|---------|
| `recharts` | ^3.9.0 | Donut chart (category breakdown), Bar chart (monthly trends) |

### QR Code

| Package | Version | Purpose |
|---------|---------|---------|
| `qrcode.react` | ^4.2.0 | QR code generation for payments (uses `QRCodeSVG`) |

### Icons

| Package | Version | Purpose |
|---------|---------|---------|
| `lucide-react` | ^1.21.0 | All UI icons (category icons, navigation actions) |

### State Management

| Package | Version | Purpose |
|---------|---------|---------|
| `zustand` | ^5.0.14 | Global client state: auth, wallet, group data, theme, and UI state |
| `@tanstack/react-query` | ^5.101.1 | *Unused.* Configured in `App.tsx` but not used for queries/mutations (all data is mock client state) |

### Dev / Tooling

| Package | Version | Purpose |
|---------|---------|---------|
| `vite` | ^8.1.0 | Build tool |
| `@vitejs/plugin-react` | ^6.0.3 | React Fast Refresh for Vite |
| `tailwindcss` | ^4.3.1 | Utility-first CSS (v4) |
| `@tailwindcss/vite` | ^4.3.1 | Tailwind v4 Vite integration |
| `typescript` | ^6.0.3 | Type safety |
| `@types/react` | ^19.2.17 | React type definitions |
| `@types/react-dom` | ^19.2.3 | ReactDOM type definitions |

---

## Component Inventory

### Layout (shared across pages)

| Component | Source | Notes |
|-----------|--------|-------|
| `Layout` | Custom | Conditional rendering of desktop sidebar (`NavigationRail`), mobile header (`TopAppBar`), and bottom tab navigation (`BottomNavigation`). Content area with left-margin on desktop. Handles page fade/slide transition via `AnimatePresence`. |
| `NavigationRail` | Custom | Desktop sidebar navigation with links for Dashboard, Wallet, Send Money, Groups, Analytics, and Settings. Fixed left position. |
| `TopAppBar` | Custom | Mobile header (64px fixed) displaying wallet logo (on Dashboard) or back navigation (on Group Details). Displays profile avatar linked to Settings. Adds box shadow when scrolled. |
| `BottomNavigation` | Custom | Mobile tab bar (72px fixed bottom) with active styling. |
| `ToastContainer` | Custom | Renders notifications (success, error, info) stacked in the top-right corner, backed by the Zustand UI store. |

### UI Primitives Library

*Note: The repository contains 40+ shadcn UI components (button, card, dialog, sheet, etc.) under `src/components/ui/`. However, the main screen layouts and custom controls are currently built using inline Tailwind CSS and custom elements for maximum stylistic flexibility.*

### Custom Inline Page Elements

- **Forms & Inputs:** Standard HTML fields (inputs/selects) with premium focus ring and border animations.
- **QR Code Scanner:** Rendered in `WalletScreen` modal via the `<QRCodeSVG />` component from `qrcode.react`.
- **Bottom Sheets & Modals:** Add Expense, Settle Up, Edit Profile, and Logout Confirmation overlay sheets are built inline using `motion.div` with vertical slides and fade transitions.
- **Charts:** Built using the `recharts` library (`PieChart` and `BarChart`) with native responsive containers, custom tooltips, and default drawing animations.

---

## Animation Implementation

| Animation | Library | Implementation Approach | Complexity |
|-----------|---------|------------------------|------------|
| Page transitions (slide/fade) | Framer Motion | `AnimatePresence` wrapping route outlet in `Layout.tsx`. Easing: custom spring/cubic-bezier. | Low |
| Bottom sheet entries | Framer Motion | `motion.div` with vertical sliding translation (`y: '100%' → 0`) and backdrop dimming. | Medium |
| Modal scale-in | Framer Motion | `motion.div` with scale (`0.9 → 1`) and opacity (`0 → 1`) spring bounce entries. | Low |
| Staggered grid load | Framer Motion | Initial fade-up stagger (`staggerChildren: 0.08`) applied to Dashboard containers. | Medium |
| Balance Currency Tab Toggle | CSS | Active flag selectors toggle instantly with background shifts. | Low |
| Group Comparison Bar Grow | Framer Motion | Horizontally animates progress bars (`width: 0 → target%`) via standard springs. | Low |
| Savings Goal Progress Grow | Framer Motion | Visual completion bar uses Framer Motion width animations. | Low |
| Toast slide-in | Framer Motion | Slide-in from right (`x: 100% → 0`) and fade transition. Dismisses after 4 seconds. | Low |
| Active Toggle Switch spring | CSS | Tailwind transitions toggle translation position with quick ease-out timing. | Low |

---

## State & Logic Plan

### Global Client State (Zustand)

**`useAuthStore`** — Authentication & Profile Limits
- **State:**
  - `user`: User info object (`id`, `name`, `avatar`, `email`, `phone`, `walletId`)
  - `isAuthenticated`: Boolean status (defaults to `true` with mock user)
  - `dailyLimit`: Number (default: `500,000` INR)
  - `monthlyLimit`: Number (default: `5,000,000` INR)
- **Actions:**
  - `login()`: Sets auth true and instantiates a blank user object.
  - `logout()`: Clears user profile and sets auth false.
  - `updateProfile(data)`: Merges partial profile updates.
  - `updateLimits(daily, monthly)`: Sets transfer limit values.
- **Persistence:** Configured with `persist` middleware using the key `splittr-auth`.

**`useWalletStore`** — Balances, Goals, & Transactions
- **State:**
  - `balances`: Array of `WalletBalance` objects (`currency`, `symbol`, `amount`, `flag`).
  - `transactions`: Array of `Transaction` objects containing details of wallet funding, group expenses, settlements, and transfers.
  - `savingsGoals`: Array of `SavingsGoal` objects (`id`, `name`, `target`, `current`, `currency`, `color`, `deadline`).
  - `selectedCurrency`: Active base currency code (default: `'INR'`).
- **Actions:**
  - `setCurrency(currency)`: Changes selected currency display.
  - `getBalance(currency)`: Gets balance value for a given currency.
  - `addFunds(amount, currency)`: Increments currency balance.
  - `sendMoney(amount, currency, recipient)`: Decrements currency balance.
  - `addTransaction(transaction)`: Prepends a transaction.
  - `addSavingsGoal(goal)`: Appends a goal.
  - `updateGoalProgress(id, amount)`: Increments a goal's progress amount.

**`useGroupStore`** — Expense Sharing Groups
- **State:**
  - `groups`: List of active `Group` objects, containing member lists, nested expense histories, and currency.
  - `currentGroupId`: Active group ID.
- **Actions:**
  - `setCurrentGroup(id)`: Selects active group.
  - `createGroup(groupData)`: Instantiates a new group.
  - `addExpense(groupId, expense)`: Prepends a new expense to a group and updates `totalExpenses`.
  - `deleteExpense(groupId, expenseId)`: Removes an expense by ID and subtracts from `totalExpenses`.
  - `getGroup(id)`: Retrieves group by ID.
  - `getGroupBalances(groupId)`: Calculates net balance (`paid - owed`) for each group member.
- **Persistence:** Configured with `persist` middleware using the key `splittr-groups`.

**`useUIStore`** — Global UI Controls
- **State:**
  - `activeBottomSheet`: Active bottom drawer ID.
  - `activeModal`: Active modal ID.
  - `toastQueue`: Queue of notifications.
  - `isLoading`: Global spinner status.
- **Actions:**
  - `openSheet(sheet)` / `closeSheet()`
  - `openModal(modal)` / `closeModal()`
  - `showToast(type, message)`: Pushes a notification and triggers auto-dismiss after 4 seconds.
  - `dismissToast(id)`
  - `setLoading(loading)`

### Server State (@tanstack/react-query)

*Note: While a QueryClient is configured in `App.tsx`, all data interactions (transactions, analytics, currency exchange rates) are managed client-side using Zustand stores. There are no server-side React Query query hooks active in this version.*

---

## Other Key Decisions

### Routing Architecture

React Router v7 with browser router mapping routes to views inside a shared `Layout`:
```
/                    → Redirects to /dashboard
/dashboard           → DashboardScreen
/wallet              → WalletScreen
/send                → SendMoneyScreen
/groups              → GroupsScreen
/groups/:groupId     → GroupDetailsScreen
/analytics           → AnalyticsScreen
/settings            → SettingsScreen
```

### Responsive Strategy

Desktop and mobile UI responsively toggle:
- `NavigationRail` is visible on desktop views (`hidden lg:flex`).
- `TopAppBar` and `BottomNavigation` display on mobile/tablet screens (`lg:hidden`).
- Grid cards flow dynamically from 1 column on mobile to 2 on tablet, and 3 columns on wide screens.

### Number Formatting

All currency displays use the `formatCurrency(amount, currencyCode)` utility:
- **INR:** Formatted with standard Indian grouping (Lakh/Crore: `₹ 1,25,000.00`).
- **USD/EUR/GBP/AED/SGD:** Formatted with standard international grouping (e.g., `$ 12,500.00`).
- Numbers are formatted in JavaScript via standard `.toLocaleString()`.
