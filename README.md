# BestMart

BestMart is a responsive, multi-page front-end for an online marketplace, built with **React 19**, **Vite**, **Tailwind CSS v4**, and **React Router v7**. It implements the core public-facing pages of an e-commerce storefront — a landing page, authentication pages, an about page, and a contact page — using a shared, reusable component system.

This project was built as part of the **WomenTechsters** program to demonstrate practical front-end engineering skills: component architecture, client-side routing, responsive design, form handling and validation, and a consistent design system.

---

## Table of Contents

- [Overview](#overview)
- [Live Preview](#live-preview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Pages](#pages)
- [Shared Components](#shared-components)
- [Design System](#design-system)
- [Routing](#routing)
- [Form Handling & Validation](#form-handling--validation)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Responsive Behavior](#responsive-behavior)
- [Project Decisions & Rationale](#project-decisions--rationale)
- [Known Limitations](#known-limitations)
- [Roadmap](#roadmap)
- [Author](#author)

---

## Overview

BestMart simulates the front door of an online marketplace — the pages a first-time visitor sees before they ever log in or start shopping. The goal of this build was to produce a **cohesive, production-shaped UI** rather than a collection of disconnected pages: every page shares the same navigation, footer, color system, spacing scale, and form components, so the app feels like one product instead of five separate exercises.

The project focuses on:

1. **Structure** — a clean separation between layout, reusable UI primitives, and page-level content.
2. **Reusability** — form inputs, buttons, and text areas are built once and reused across every form in the app.
3. **Responsiveness** — every page is designed mobile-first and verified at both mobile and desktop breakpoints.
4. **Realistic UX details** — client-side form validation, inline error messages, success states, active-link highlighting, and a functioning mobile navigation menu.

---

## Live Preview

The app runs locally via Vite's dev server (see [Getting Started](#getting-started)). A production build has been verified to compile cleanly with `npm run build`.

---

## Features

- 🏠 **Landing / Home page** with hero section, feature highlights, category showcase, and a call-to-action band
- 🔐 **Login page** with email/password fields, "remember me", "forgot password" link, and validation
- 📝 **Sign up page** with full name, email, password + confirm password, terms agreement checkbox, and validation
- ℹ️ **About page** with company story, key stats, and a "what we stand for" values grid
- ✉️ **Contact page** with a validated contact form and a business-details sidebar (address, phone, email, hours)
- 🧭 **Persistent navbar** with active-route highlighting and a working mobile hamburger menu
- 🦶 **Persistent footer** with brand summary, quick links, customer service links, contact details, and social icons
- 🧩 **Reusable form components** (`Input`, `TextArea`, `Button`) shared across all forms
- ✅ **Client-side validation** with per-field inline error messages and success confirmations
- 📱 **Fully responsive layouts** from small mobile screens up to large desktop viewports
- 🎨 **Consistent violet-based design system** tying every page together visually

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| UI Library | [React 19](https://react.dev/) | Component-based UI |
| Build Tool | [Vite 8](https://vitejs.dev/) | Dev server + production bundling |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) (via `@tailwindcss/vite`) | Utility-first styling, no separate CSS files per component |
| Routing | [React Router v7](https://reactrouter.com/) | Client-side routing with nested layouts |
| Icons | [react-icons](https://react-icons.github.io/react-icons/) (`Hi`, `Hi2`, `Fa` icon sets) | Navigation, footer, and form iconography |
| HTTP Client | [axios](https://axios-http.com/) | Installed and ready for future API integration |
| Language | JavaScript (JSX) | No TypeScript in this iteration |

No CSS-in-JS, no component libraries (e.g. MUI, Chakra) — every visual element is composed from Tailwind utility classes and custom components, keeping the bundle small and the styling fully transparent.

---

## Project Structure

```
bestmart/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/
│   │   ├── hero.png              # Hero illustration used on the Home page
│   │   └── vite.svg
│   ├── components/
│   │   ├── Navbar.jsx            # Site-wide top navigation (desktop + mobile)
│   │   ├── Footer.jsx            # Site-wide footer
│   │   ├── Layout.jsx            # Route wrapper: Navbar + <Outlet /> + Footer
│   │   └── ui/
│   │       ├── Button.jsx        # Reusable button (primary / outline / ghost variants)
│   │       ├── Input.jsx         # Reusable labeled text input with error state
│   │       └── TextArea.jsx      # Reusable labeled textarea with error state
│   ├── pages/
│   │   ├── Home.jsx              # Landing page
│   │   ├── Login.jsx             # Login page
│   │   ├── Signup.jsx            # Sign up page
│   │   ├── About.jsx             # About page
│   │   └── Contact.jsx           # Contact page
│   ├── App.jsx                   # Route definitions
│   ├── main.jsx                  # App entry point (mounts <BrowserRouter>)
│   └── index.css                 # Tailwind entry point (`@import "tailwindcss"`)
├── index.html                    # Vite HTML entry point
├── tailwind.config.js
├── vite.config.js
├── postcss.config.js
├── package.json
└── README.md
```

---

## Pages

### `/` — Home
The landing page and primary entry point. Composed of four sections:
1. **Hero** — headline, supporting copy, "Get Started" and "Learn More" calls-to-action, and the brand hero illustration.
2. **Feature highlights** — a four-column grid (Fast Delivery, Secure Payments, Best Prices, 24/7 Support), each with an icon, title, and description.
3. **Shop by category** — a responsive grid of category cards (Groceries, Electronics, Fashion, Home & Living, Beauty, Sports) as a placeholder for future catalog browsing.
4. **Call-to-action band** — a full-width violet section prompting account creation, linking to `/signup`.

### `/login` — Login
A centered card form with:
- Email and password inputs
- "Remember me" checkbox and "Forgot password?" link
- Inline validation (required email format, required password)
- A success banner on valid submit
- A link to `/signup` for new users

### `/signup` — Sign Up
A centered card form with:
- Full name, email, password, and confirm password inputs
- Password length check (minimum 6 characters) and password-match check
- A required "Terms of Service and Privacy Policy" agreement checkbox
- Inline validation and a success banner on valid submit
- A link to `/login` for existing users

### `/about` — About
- A violet hero banner introducing the company mission
- An "Our Story" narrative section paired with a stat grid (500K+ Happy Customers, 10K+ Products Listed, 2K+ Trusted Sellers, 50+ Cities Served)
- A "What We Stand For" values grid (Customer First, Quality Always, Wide Reach, Community Driven), each with an icon and short description

### `/contact` — Contact
- A violet hero banner
- A business-details sidebar (Address, Phone, Email, Working Hours), each with an icon
- A validated contact form (Name, Email, Subject, Message) that shows a success banner and resets on valid submit

---

## Shared Components

### `Navbar.jsx`
- Sticky, translucent top bar with backdrop blur
- Desktop nav links (Home, About, Contact) using `NavLink` for automatic active-state styling
- "Log in" / "Sign up" actions on desktop
- A mobile hamburger menu (toggled via local `useState`) that reveals a stacked mobile nav with the same links and actions
- Uses `react-icons` (`HiMenu`, `HiX`, `HiOutlineShoppingBag`) for iconography

### `Footer.jsx`
- Four-column responsive layout: brand summary + socials, quick links, customer service links, and contact details
- Social icons (Facebook, Instagram, Twitter, YouTube) via `react-icons/fa`
- Dynamic copyright year computed at render time
- Dark background (`bg-gray-900`) to visually anchor the bottom of every page

### `Layout.jsx`
- A route-level wrapper rendered once via a parent `<Route>` in `App.jsx`
- Renders `Navbar`, a flex-grow `<main>` containing the active page via React Router's `<Outlet />`, and `Footer`
- Guarantees every page shares identical navigation and footer without duplicating markup

### `ui/Input.jsx`, `ui/TextArea.jsx`
- Accept `label`, `id`, `error`, and standard input/textarea props
- Render a label, the field itself, and — when an `error` string is passed — a red inline validation message directly beneath the field
- Centralize all field styling (border, focus ring, spacing) in one place so every form looks and behaves identically

### `ui/Button.jsx`
- Accepts a `variant` prop (`primary`, `outline`, `ghost`) mapped to a Tailwind class set
- Used for every clickable action in the app (CTAs, form submissions, nav actions) to keep button styling consistent site-wide

---

## Design System

- **Primary brand color:** violet (`violet-600` / `violet-700`), chosen to match the existing hero illustration asset
- **Neutral palette:** Tailwind's `gray` scale for text, borders, and backgrounds
- **Typography:** system font stack via Tailwind defaults; bold, large headings (`text-4xl` / `text-5xl`) on hero sections, smaller weighted headings for section titles
- **Spacing:** consistent use of Tailwind's spacing scale (`px-4 sm:px-6 lg:px-8`, `py-16`, `gap-8`, etc.) so vertical rhythm feels uniform across pages
- **Cards & surfaces:** `rounded-xl` / `rounded-2xl` cards with subtle borders (`border-gray-100` / `border-gray-200`) and soft shadows for forms and feature blocks
- **Icons:** Heroicons (via `react-icons/hi` and `react-icons/hi2`) for UI iconography, Font Awesome (via `react-icons/fa`) for social icons

---

## Routing

Routing is handled by **React Router v7**, initialized in `main.jsx` with `<BrowserRouter>` and defined declaratively in `App.jsx`:

```jsx
<Routes>
  <Route element={<Layout />}>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/about" element={<About />} />
    <Route path="/contact" element={<Contact />} />
  </Route>
</Routes>
```

All five routes are nested under a single parent `<Route>` rendering `Layout`, so the Navbar and Footer persist across navigation while only the page content inside `<Outlet />` changes. `NavLink` is used in the Navbar so the currently active route is visually highlighted.

---

## Form Handling & Validation

Login, Sign Up, and Contact all follow the same pattern, built with plain React state (no external form library):

1. A single `form` state object holds all field values, updated through one shared `handleChange` handler keyed by `e.target.name`.
2. A `validate()` function runs on submit, builds an `errors` object of only the fields that fail validation, and returns whether the form is valid.
3. If valid, a `submitted` flag is set to `true`, rendering a green success banner (and, on the Contact form, resetting the fields).
4. Each `Input` / `TextArea` receives its corresponding `error` message, which — when present — turns the field's border red and displays the message beneath it.

Validation rules currently implemented:
- **Required fields:** name, email, password, message, etc.
- **Email format:** checked with a regular expression (`/^\S+@\S+\.\S+$/`)
- **Password length:** minimum 6 characters (Sign Up)
- **Password match:** confirm password must equal password (Sign Up)

> **Note:** This is front-end-only validation and simulated submission — there is no backend/API wired up yet. See [Roadmap](#roadmap).

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) 18+ (recommended: latest LTS)
- npm (bundled with Node.js)

### Installation

```bash
git clone <repository-url>
cd bestmart
npm install
```

### Run the development server

```bash
npm run dev
```

Vite will start a local dev server (default: `http://localhost:5173`, or the next available port if that one is in use) with hot module replacement.

### Build for production

```bash
npm run build
```

Outputs an optimized static build to the `dist/` folder.

### Preview the production build locally

```bash
npm run preview
```

---

## Available Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `npm run dev` | Starts the Vite development server with HMR |
| `build` | `npm run build` | Type-checks nothing (JS project) and builds an optimized production bundle |
| `preview` | `npm run preview` | Serves the production build locally for a final sanity check |

---

## Responsive Behavior

Every page was built mobile-first and verified at both mobile (~390px) and desktop (1280px) viewport widths:

- The Navbar collapses into a hamburger-triggered mobile menu below the `md` breakpoint and expands into a full horizontal nav above it.
- Grids (feature cards, category cards, values, stats) collapse from 4/6 columns on desktop down to 2 or 1 column on smaller screens using Tailwind's `sm:` / `lg:` grid utilities.
- Forms remain centered, single-column, and comfortably padded at all widths.
- The Footer's four columns stack vertically on mobile and lay out side-by-side from `sm:` upward.

---

## Project Decisions & Rationale

- **Why Tailwind CSS v4 over plain CSS or a component library:** keeps styling co-located with markup, avoids maintaining separate stylesheet files per component, and avoids pulling in a heavier UI kit for a project whose goal is to demonstrate hand-built component design.
- **Why a shared `Layout` route instead of importing `Navbar`/`Footer` into every page:** avoids duplication and guarantees structural consistency — a change to the Navbar or Footer automatically applies everywhere.
- **Why plain `useState` for forms instead of a form library (e.g. React Hook Form, Formik):** the forms here are small and the goal was to demonstrate understanding of controlled inputs and manual validation logic, not library integration.
- **Why a violet color scheme:** derived directly from the existing `hero.png` brand illustration already present in the project, ensuring the generated pages match the intended brand identity rather than introducing an arbitrary palette.

---

## Known Limitations

- Forms do not submit to a real backend; "success" states are simulated entirely on the client.
- "Shop by Category" cards on the Home page are visual placeholders and are not yet linked to real category/product pages.
- No authentication state (e.g. persisted login session) is implemented — Login/Sign Up only validate input shape.
- `axios` is installed as a dependency in anticipation of API integration but is not yet used anywhere in the codebase.

---

## Roadmap

Potential next steps for extending this project:

- [ ] Connect Login/Sign Up forms to a real authentication API and persist session state
- [ ] Build out product listing and product detail pages, with routing per category
- [ ] Add a shopping cart and checkout flow
- [ ] Add automated tests (component tests with React Testing Library, e2e with Playwright)
- [ ] Add a 404 / not-found route
- [ ] Introduce global state management (Context API or a lightweight store) once the app grows beyond static pages

---

## Author

Built by **stennismith@gmail.com** as part of the WomenTechsters program.
