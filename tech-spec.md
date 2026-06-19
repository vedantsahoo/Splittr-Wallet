# Splittr - Technical Specification

## Dependencies

### Core Framework

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^19.0.0 | UI framework |
| `react-dom` | ^19.0.0 | React DOM renderer |
| `react-router-dom` | ^7.1.0 | SPA routing with nested layouts |

### Animation

| Package | Version | Purpose |
|---------|---------|---------|
| `gsap` | ^3.12.0 | ScrollTrigger scroll-linked header compression, chart stagger reveals, scroll-triggered fade-ups |
| `framer-motion` | ^12.0.0 | Page transitions (slide/fade), Bottom Sheet spring physics, Modal bounce-in, button press feedback, AnimatePresence for mount/unmount |
| `react-countup` | ^6.5.0 | Animated balance/amount count-up on first view |

### Charts

| Package | Version | Purpose |
|---------|---------|---------|
| `recharts` | ^2.15.0 | Donut chart (category breakdown), Bar chart (monthly trends), sparklines |

### QR Code

| Package | Version | Purpose |
|---------|---------|---------|
| `qrcode.react` | ^4.2.0 | QR code generation for payments |

### Icons

| Package | Version | Purpose |
|---------|---------|---------|
| `lucide-react` | ^0.470.0 | All UI icons (category icons, navigation, actions) |

### State Management

| Package | Version | Purpose |
|---------|---------|---------|
| `zustand` | ^5.0.0 | Global client state: auth, wallet balances, group data, savings goals, settings, UI state (bottom sheets, modals) |
| `@tanstack/react-query` | ^5.62.0 | Server state management, caching, background refetching for transactions, groups, analytics |

### Dev / Tooling

| Package | Version | Purpose |
|---------|---------|---------|
| `vite` | ^7.2.4 | Build tool |
| `@vitejs/plugin-react` | ^5.1.1 | React Fast Refresh for Vite |
| `tailwindcss` | ^4.3.1 | Utility-first CSS (v4) |
| `@tailwindcss/vite` | ^4.3.1 | Tailwind v4 Vite integration |
| `typescript` | ~5.9.3 | Type safety |
| `@types/react` | ^19.2.5 | React type definitions |
| `@types/react-dom` | ^19.2.3 | ReactDOM type definitions |

---

## Component Inventory

### Layout (shared across pages)

| Component | Source | Notes |
|-----------|--------|-------|
| `Layout` | Custom | Conditional rendering: `NavigationRail` (desktop ≥ 1024px) + `TopAppBar` (mobile) + `BottomNavigation` (mobile). Content area with correct margin/padding offset. |
| `NavigationRail` | Custom | Desktop sidebar, 280px fixed, frosted glass backdrop-blur. Collapses to 80px icon-only at tablet (768–1024px). |
| `TopAppBar` | Custom | Mobile header, 64px fixed, frosted glass, dynamic title + action icons. Shadow on scroll. |
| `BottomNavigation` | Custom | Mobile tab bar, 72px fixed bottom, 5 tabs. Active state with brand blue. iOS safe-area padding. |

### Reusable Components (used on 2+ pages)

| Component | Source | Used By |
|-----------|--------|---------|
| `Button` | Custom | All pages. 6 variants (Primary, Secondary, Outline-Blue, Danger, Ghost, Icon). Loading spinner overlay. |
| `Card` | Custom | Dashboard, Groups, Analytics, Settings, Group Details. 5 variants (Default, Feature, Wallet, Compact, Outlined). |
| `InputField` | Custom | SendMoney, AddExpense, EditProfile, ChangePassword, etc. 7 variants (Text, Number, Password, Search, Select, Amount, Textarea). |
| `Avatar` | Custom | Transaction lists, group headers, nav profile, settings. 3 variants (Image, Initials, Group stack). |
| `Badge` | Custom | Transaction status, currency selector, category labels. 6 variants. |
| `TransactionListItem` | Custom | Dashboard, Wallet, Analytics, Group Details. Positive/negative/neutral amount styling with status dot. |
| `BottomSheet` | Custom | All mobile forms (AddExpense, SettleUp, TransferLimits, CurrencySelector, etc.). Falls back to Modal on desktop. |
| `Modal` | Custom | Desktop dialogs, confirmation prompts. Backdrop + centered dialog with bounce-in entry. |
| `Toast` | Custom | Global notification system (success/error/info). Auto-dismiss 4s. |
| `CurrencySelector` | Custom | Settings (default currency), Wallet (view toggle), SendMoney. Dropdown with flag emoji + search. |
| `QRCodeDisplay` | Custom | Wallet page. qrcode.react wrapped in styled card. |
| `SavingsGoalCard` | Custom | Dashboard, Analytics. Progress bar with gradient fill. |
| `SplitOptionsSelector` | Custom | GroupDetails (AddExpense). Horizontal tab selector (Equal/Percentage/Custom/Itemized). |
| `SpendingChart` | Custom | Analytics. Wraps recharts (Donut + Bar) with custom tooltips, legends, and GSAP-triggered animation entry. |
| `ToggleSwitch` | Custom | Settings (2FA, notifications, sound, dark mode). |
| `SkeletonLoader` | Custom | All pages during data loading. Shimmer animation for cards, text, avatars. |
| `PageTransitionWrapper` | Custom | Wraps route content. Framer Motion AnimatePresence for slide/fade page transitions. |

### Page Sections (single-page use, composed from reusable components)

| Page | Sections |
|------|----------|
| Dashboard | HeroBanner, WalletQuickView, QuickActionsGrid, RecentTransactionsList, GroupsPreview, SavingsGoalsPreview, UpgradeCTA |
| Wallet | BalanceCard, ActionButtons, TransactionFilterTabs, TransactionList, QRCodeCard |
| SendMoney | RecipientSelector, AmountEntry, ConfirmationSheet, TransferSuccessOverlay |
| Groups | GroupsList, CreateGroupSheet, EmptyStateCTA |
| GroupDetails | GroupHeader, QuickActionBar, ExpenseList, ExpenseDetailSheet, AddExpenseSheet, SettleUpSheet |
| Analytics | PeriodSelector, SummaryCards, CategoryDonutChart, MonthlyBarChart, GroupComparisonBars, SavingsGoalsProgress, TopTransactionsList |
| Settings | ProfileCard, SecuritySettings, Preferences, PaymentMethods, DataPrivacy, AboutSupport, LogoutButton |

---

## Animation Implementation

| Animation | Library | Implementation Approach | Complexity |
|-----------|---------|------------------------|------------|
| Page transitions (slide/fade) | Framer Motion | `AnimatePresence` wrapping route outlet. Exit: fade + translateX(-20px). Enter: fade + translateX(20px → 0). Overlapping timing with custom transition config. | Low |
| Bottom sheet (spring physics) | Framer Motion | `motion.div` with `drag="y"` constraints, `dragElastic`, snap points via `onDragEnd` velocity detection. Entry/exit with `cubic-bezier(0.32, 0.72, 0, 1)`. Desktop: renders as Modal instead. | **High** 🔒 |
| Modal bounce-in | Framer Motion | `motion.div` with scale(0.95→1) + opacity, `cubic-bezier(0.34, 1.56, 0.64, 1)` overshoot easing. Backdrop opacity fade. | Low |
| Scroll-triggered fade-ups | GSAP + ScrollTrigger | `data-animate="fade-up"` / `data-animate="fade-scale"` attributes. IntersectionObserver at threshold 0.15 triggers GSAP `fromTo` (opacity 0 + y30 → opacity 1 + y0). Stagger children with 0.08s delay via `stagger` prop. | Medium |
| Header scroll compression | GSAP ScrollTrigger | ScrollTrigger scrub-linked timeline. Scroll past 60px: avatar shrinks 64→40px, title truncates, gradient opacity reduces. All scroll-position-driven (not discrete). | **High** 🔒 |
| Balance count-up | react-countup | Wrap all balance/amount displays. Trigger on IntersectionObserver first view. Duration 1.2s, ease-out. Format with currency + Indian number grouping. | Low |
| Button press feedback | Framer Motion | `whileHover={{ y: -1 }}`, `whileTap={{ scale: 0.97 }}`, transition `type: "spring"` with overshoot on release. | Low |
| Card hover lift | CSS / Framer Motion | translateY(-3px) + shadow elevation on hover. CSS transition 0.25s. | Low |
| Donut chart segment draw | GSAP | `gsap.from` on recharts Pie segments with `stroke-dashoffset` animation. Segments grow clockwise, staggered 0.1s. Center label count-up starts after chart begins. | **High** 🔒 |
| Bar chart grow | GSAP | `gsap.from` on Bar chart bars, `scaleY: 0` with `transformOrigin: "bottom"`, staggered 0.08s left-to-right. Average line draws after via `stroke-dashoffset`. | Medium |
| Horizontal bar grow (Group Comparison) | GSAP | `gsap.from` width 0 to final, `ease: "expo.out"`, staggered 0.1s per bar. | Low |
| Sparkline draw | CSS / GSAP | SVG path `stroke-dasharray` + `stroke-dashoffset` transition, 0.8s ease-out after card appears. | Low |
| Toast slide-in | Framer Motion | `initial={{ x: "100%" }}` → `animate={{ x: 0 }}` with spring easing. Exit: x → "100%". Auto-dismiss via `setTimeout` 4s. | Low |
| Number blur on currency change | Framer Motion | `animate={{ filter: "blur(0px)" }}` with keyframes: blur(0) → blur(4px) → value update → blur(0). Total 0.4s. | Low |
| QR code fade/generate | Framer Motion | Opacity 0→1, 0.3s ease. Optional row-by-row stagger delay 0.02s for "drawing" effect. | Low |
| Transfer success confetti | Framer Motion | 30 particles (brand blue, green, purple) with random trajectories, gravity, fade-out. Triggered on successful transfer. | **High** 🔒 |
| Skeleton shimmer | CSS | `background: linear-gradient(90deg, #F0F0F0 25%, #F8F8F8 50%, #F0F0F0 75%)` with `background-size: 200% 100%` and `animation: shimmer 1.5s linear infinite`. | Low |
| Toggle switch spring | CSS | `transition: transform 0.2s cubic-bezier(0.68, -0.15, 0.32, 1.15)`. Track color transition 0.2s. | Low |
| Currency conversion blur | Framer Motion | `animate` with `filter` keyframes as described above. | Low |
| Settle-up checkmark | CSS / Framer Motion | SVG circle `stroke-dashoffset` draw over 0.5s, checkmark fades in 0.2s after via `delay`. | Medium |
| Split type content cross-fade | Framer Motion | `AnimatePresence` with `mode="wait"`. Exit fade 0.1s, enter fade 0.2s. | Low |
| Pull-to-refresh spinner | Framer Motion | Circular rotation animation, triggered by drag gesture ≥80px threshold on scrollable container. | Medium |
| Sticky action bar shadow | CSS + IntersectionObserver | Add shadow class when element leaves viewport (intersects with sentinel element at top). CSS transition on box-shadow. | Low |
| Progress bar fill | GSAP | `gsap.fromTo` width 0 to target%, 0.8s ease-out, staggered 0.15s per goal card. Synced with percentage count-up. | Low |

---

## State & Logic Plan

### Global Store (Zustand)

**`useAuthStore`** — Authentication & User
- State: `user` (profile, settings), `isAuthenticated`, `walletId`, `transferLimits`
- Actions: `login(credentials)`, `logout()`, `updateProfile(data)`, `updateSettings(data)`, `updateLimits(amount)`
- Persisted to `localStorage` for session recovery.

**`useWalletStore`** — Wallet & Transactions
- State: `balances` (per currency), `transactions` (paginated list), `savingsGoals`
- Actions: `addFunds(amount, currency, method)`, `sendMoney(recipient, amount)`, `addSavingsGoal(goal)`, `updateGoalProgress(id, amount)`
- Computed: `totalBalance(currency)`, `formattedBalances`, `recentTransactions(n)`

**`useGroupStore`** — Groups & Expenses
- State: `groups[]` (with nested expenses, members, balances), `currentGroupId`
- Actions: `createGroup(data)`, `addExpense(groupId, expenseData)`, `editExpense(groupId, expenseId, data)`, `deleteExpense(groupId, expenseId)`, `settleUp(groupId, memberId, amount)`, `calculateBalances(groupId)`
- Computed: `groupBalances(groupId)` (who owes whom), `sortedExpenses(groupId)`

**`useUIStore`** — UI State
- State: `activeBottomSheet` (null | 'addExpense' | 'settleUp' | 'transferLimits' | ...), `activeModal` (null | 'editProfile' | 'changePassword' | ...), `toastQueue[]`, `selectedCurrency`, `isLoading`
- Actions: `openSheet(name)`, `closeSheet()`, `showToast(type, message)`, `dismissToast(id)`, `setCurrency(code)`

### Server State (@tanstack/react-query)

- `useTransactions` — Fetches paginated transaction history with filters (period, type, currency). Infinite scroll on mobile.
- `useAnalytics` — Fetches aggregated spending data by category, month, and group. Refetches on period tab change.
- `useExchangeRates` — Background polling for live currency conversion rates. Stale time 5 minutes.

### Key Logic Patterns

**Split Calculation Engine** (GroupDetails → AddExpense)
- Algorithm that computes per-member shares based on split type:
  - `equal`: Total ÷ checked members, rounded to 2 decimal places, remainder distributed to first member.
  - `percentage`: (percentage / 100) × total for each member. Validates sum === 100.
  - `custom`: Direct amounts. Validates sum === total.
  - `itemized`: Sum per-item amounts assigned to checked members. Validates grand total === expense total.
- Runs client-side before submission; updates preview in real-time.

**Debt Simplification** (GroupDetails → calculateBalances)
- For each group: compute net balance per member (total paid − total share owed).
- Simplify to minimum number of transactions (who pays whom) using greedy settlement algorithm.
- Result drives the "You owe / You're owed" display and Settle Up flow.

**Currency Conversion Pipeline**
- All stored amounts in base INR. Display amounts converted via live rates.
- Conversion: `(amountInINR / rateToINR[target])` or `(amountInINR × rateFromINR[target])`.
- Format with Indian number grouping (lakhs/crores) for INR, international for others.

---

## Other Key Decisions

### Routing Architecture

React Router v7 with nested route definitions:

```
/                    → Redirects to /dashboard
/dashboard           → Dashboard (index route)
/wallet              → Wallet
/send                → SendMoney
/groups              → Groups
/groups/:groupId     → GroupDetails
/analytics           → Analytics
/settings            → Settings
```

All routes render inside the shared `Layout` component (sidebar/topbar/bottomnav). `Layout` reads current route to set page title and back-button visibility. `groups/:groupId` is a nested route under `Layout` with a back button that navigates to `/groups`. `BrowserRouter` is configured at the root of `App.tsx` surrounding the layout and routes.

### Responsive Strategy

Mobile-first Tailwind approach with conditional component rendering:
- `NavigationRail`: `hidden lg:flex` (1024px+)
- `TopAppBar`: `flex lg:hidden` (below 1024px)
- `BottomNavigation`: `flex lg:hidden` (below 1024px)
- `BottomSheet` on mobile → `Modal` on desktop: handled inside each component via a `useMediaQuery` hook breakpoint at 1024px.
- Dashboard grid: 1 column mobile → 2 columns tablet → 3 columns desktop.

### Number Formatting

All monetary displays use a shared `formatCurrency(amount, currencyCode)` utility:
- INR: `Rs. 1,25,000.00` (Indian grouping: 3,2,2 pattern)
- USD: `$ 12,500.00` (international grouping)
- EUR: `€ 12.500,00` (European formatting)
- Integrated with `react-countup` for animation.
