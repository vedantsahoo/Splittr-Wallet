Using Node.js 20, Tailwind CSS v4.3.1, and Vite v8.1.0+

Tailwind CSS has been set up with the `@tailwindcss/vite` integration (Vite Plugin).

Setup complete: ./app

Components (40+):
  accordion, alert-dialog, alert, aspect-ratio, avatar, badge, breadcrumb,
  button-group, button, calendar, card, carousel, chart, checkbox, collapsible,
  command, context-menu, dialog, drawer, dropdown-menu, empty, field, form,
  hover-card, input-group, input-otp, input, item, kbd, label, menubar,
  navigation-menu, pagination, popover, progress, radio-group, resizable,
  scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner,
  spinner, switch, table, tabs, textarea, toggle-group, toggle, tooltip

Note: While shadcn UI components are installed in `src/components/ui/`, they are currently not imported or used by the main app screens. The screens are styled directly using custom inline Tailwind utility classes.

Structure:
  src/sections/        Page sections
  src/hooks/           Custom hooks
  src/types/           Type definitions
  src/App.css          Styles specific to the Webapp
  src/App.tsx          Root React component with App Routing
  src/index.css        Global styles using @import "tailwindcss" (v4 syntax)
  src/main.tsx         Entry point for rendering the Webapp
  index.html           Entry point for the Webapp
  tailwind.config.js   Configures Tailwind's legacy theme/plugins (if referenced)
  vite.config.ts       Main build and dev server settings for Vite (includes @tailwindcss/vite)