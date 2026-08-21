# BestMart

BestMart is a responsive front-end for a Ghana-based multi-vendor marketplace, built with **React 19**, **Vite**, **Tailwind CSS v4**, and **React Router v7**. It lets everyday shoppers browse and buy products from independent sellers, and lets those sellers sign in to a dashboard to publish, advertise, and manage what they sell — matching the platform's tagline: **Publish · Advertise · Sell**.

This project was built as part of the **WomenTechsters** program to demonstrate practical front-end engineering skills: component architecture, authenticated vs. public routing, shared layout ("Wrapper") components, global state via Context, responsive design, form handling and validation, and a cohesive brand-driven design system.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Pages](#pages)
- [Layouts ("Wrapper" components)](#layouts-wrapper-components)
- [Authentication & Protected Routes](#authentication--protected-routes)
- [Routing](#routing)
- [Cart & Shop](#cart--shop)
- [Shared Components](#shared-components)
- [Design System](#design-system)
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

BestMart has two faces:

1. **The storefront** (public) — Home, Shop, Cart, About, Contact, Login, Signup. Anyone can browse products and add them to a cart without an account.
2. **The seller dashboard** (authenticated) — Dashboard, My Products, Advertise, Orders, Settings, reachable only after logging in, and presented behind a sidebar navigation instead of the public navbar/footer.

Both faces share one design system, one routing table, and one set of reusable form/UI components — but each is wrapped in its own **layout** and gated by its own **route guard**, so the two experiences never bleed into each other by accident.

---

## Features

- 🏠 **Landing page** with hero section, feature highlights, a real-photo "Shop by Category" grid, and a seller-signup call-to-action band
- 🛍️ **Shop page** (`/shop`) — category-filterable product grid backed by mock seller listings
- 🛒 **Cart** (`/cart`) — add/remove items, adjust quantity, running total, all persisted to `localStorage`, with a live count badge in the navbar
- 🔐 **Auth-aware navbar** — shows Log in/Sign up when logged out, a Dashboard link when logged in
- 🔑 **Login / Signup** that establish a session (via Context + `localStorage`) and redirect into the dashboard
- 📊 **Seller dashboard** (`/dashboard/*`) behind a sidebar layout — Dashboard overview, My Products, Advertise, Orders, Settings
- 🚧 **Route protection** — dashboard routes redirect to `/login` when logged out; `/login` and `/signup` redirect to the dashboard when already logged in
- ℹ️ **About page** with a real photo, company story, and key stats
- ✉️ **Contact page** with a validated contact form and Ghana business details
- 🧩 **Reusable form components** (`Input`, `TextArea`, `Button`) shared across every form
- ✅ **Client-side validation** with per-field inline error messages
- 📱 **Fully responsive** from small mobile screens up to large desktop viewports
- 🎨 **Brand-driven design system** — navy, blue, and orange pulled directly from the BestMart logo
- 🖼️ **Real photography** — category and story images, sourced from Pexels, replacing placeholder graphics
- 🔖 **Branded tab title & favicon**, cropped from the logo mark

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| UI Library | [React 19](https://react.dev/) | Component-based UI |
| Build Tool | [Vite 8](https://vitejs.dev/) | Dev server + production bundling |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) (via `@tailwindcss/vite`) | Utility-first styling, brand colors defined as CSS theme tokens |
| Routing | [React Router v7](https://reactrouter.com/) | Client-side routing, nested layouts, route guards |
| State | React Context API | `AuthContext` (session) and `CartContext` (shopping cart), each backed by `localStorage` |
| Icons | [react-icons](https://react-icons.github.io/react-icons/) (`Hi`, `Hi2`, `Fa` icon sets) | Navigation, footer, and form iconography |
| HTTP Client | [axios](https://axios-http.com/) | Installed and ready for future API integration |
| Language | JavaScript (JSX) | No TypeScript in this iteration |

No CSS-in-JS, no component libraries (e.g. MUI, Chakra) — every visual element is composed from Tailwind utility classes and custom components.

---

## Project Structure

```
bestmart/
├── public/
│   ├── favicon.ico              # Browser-tab icon, cropped from the logo mark
│   ├── favicon-512.png
│   └── apple-touch-icon.png
├── src/
│   ├── assets/
│   │   ├── logo.png              # Full logo lockup (icon + wordmark), transparent background
│   │   ├── logo-glow.png         # Dark "glow" variant of the logo, used as the homepage hero image
│   │   ├── about-story.jpg       # Real photo used on the About page
│   │   └── categories/           # One real photo per product category
│   │       ├── groceries.jpg
│   │       ├── electronics.jpg
│   │       ├── fashion.jpg
│   │       ├── home-living.jpg
│   │       ├── beauty.jpg
│   │       └── sports.jpg
│   ├── context/
│   │   ├── AuthContext.jsx       # Who's logged in — login()/logout(), persisted to localStorage
│   │   └── CartContext.jsx       # Shopping cart state — add/remove/update, persisted to localStorage
│   ├── data/
│   │   ├── products.js           # Mock product catalog + category list
│   │   └── categoryImages.js     # Maps each category name to its photo
│   ├── layouts/
│   │   ├── UnauthWrapper.jsx     # Public shell: Navbar + <Outlet /> + Footer
│   │   └── AuthWrapper.jsx       # Dashboard shell: Sidebar + <Outlet />
│   ├── routes/
│   │   ├── routesConfig.js       # The single list of {path, element} for every page
│   │   ├── AppRoutes.jsx         # Turns routesConfig into real <Route> elements via .map()
│   │   ├── ProtectedRoute.jsx    # Blocks dashboard routes unless logged in
│   │   └── GuestRoute.jsx        # Blocks /login + /signup once already logged in
│   ├── components/
│   │   ├── Navbar.jsx            # Public top navigation (auth-aware, cart badge)
│   │   ├── Footer.jsx            # Public footer
│   │   ├── Sidebar.jsx           # Dashboard side navigation + logout
│   │   ├── ProductCard.jsx       # One product tile on the Shop page
│   │   └── ui/
│   │       ├── Button.jsx        # Reusable button (primary / accent / outline / ghost variants)
│   │       ├── Input.jsx         # Reusable labeled text input with error state
│   │       └── TextArea.jsx      # Reusable labeled textarea with error state
│   ├── pages/
│   │   ├── Home.jsx              # Landing page
│   │   ├── Shop.jsx              # Product catalog with category filters
│   │   ├── Cart.jsx              # Shopping cart
│   │   ├── Login.jsx             # Login page
│   │   ├── Signup.jsx            # Sign up page
│   │   ├── About.jsx             # About page
│   │   ├── Contact.jsx           # Contact page
│   │   ├── NotFound.jsx          # Catch-all 404
│   │   └── dashboard/
│   │       ├── Dashboard.jsx     # Seller dashboard overview
│   │       ├── Products.jsx      # My Products (placeholder)
│   │       ├── Advertise.jsx     # Advertise (placeholder)
│   │       ├── Orders.jsx        # Orders (placeholder)
│   │       ├── Settings.jsx      # Settings (placeholder)
│   │       └── ComingSoon.jsx    # Shared "coming soon" placeholder UI
│   ├── App.jsx                   # <AuthProvider><CartProvider><AppRoutes /></CartProvider></AuthProvider>
│   ├── main.jsx                  # App entry point (mounts <BrowserRouter>)
│   └── index.css                 # Tailwind entry point + brand color theme tokens
├── index.html                    # Vite HTML entry point (tab title + favicon links)
├── tailwind.config.js
├── vite.config.js
├── postcss.config.js
├── package.json
└── README.md
```

---

## Pages

### `/` — Home
1. **Hero** — headline, supporting copy, "Shop Now" (buyers) and "Sell on BestMart" (sellers) calls-to-action, and the logo-glow brand image.
2. **Feature highlights** — Fast Delivery, Secure Payments, Best Prices, 24/7 Support.
3. **Shop by category** — real photos for all six categories, each linking into `/shop`.
4. **Seller call-to-action band** — prompts account creation, linking to `/signup`.

### `/shop` — Shop
A filterable grid of products (mock data in `src/data/products.js`), each card showing a category photo, name, seller, price in ₵ (Ghana cedi), and an **Add** button that pushes the item into the cart.

### `/cart` — Cart
Lists everything added from the Shop page: quantity stepper, remove button, running total, and a Checkout button (UI only — no payment integration yet).

### `/login` — Login
Email/password form. On successful validation it calls `login()` from `AuthContext` and redirects to `/dashboard` (or back to whatever protected page the user originally tried to visit).

### `/signup` — Sign Up
Full name, email, password + confirm password, and a required terms checkbox. On success it logs the new user in and redirects straight to `/dashboard`.

### `/about` — About
A dark hero banner, a real photo paired with the company story, and key stats (Happy Customers, Products Listed, Trusted Sellers, Cities Served).

### `/contact` — Contact
A dark hero banner, a Ghana business-details sidebar (Accra address, `+233` phone, email), and a validated contact form.

### `/dashboard` and `/dashboard/*` — Seller Dashboard (protected)
Only reachable when logged in. `/dashboard` shows stat tiles (Products Listed, Active Ads, Orders, Revenue) and a prompt to add a product. `/dashboard/products`, `/advertise`, `/orders`, `/settings` are placeholder pages sharing the same sidebar layout, ready to be built out.

### `*` — Not Found
Any unmatched URL renders a simple 404 page with a link back home.

---

## Layouts ("Wrapper" components)

Two components exist purely to wrap shared UI around whichever page is currently active — the pattern requested for this build:

### `layouts/UnauthWrapper.jsx`
Renders `Navbar` + `<Outlet />` + `Footer`. Every public route (`/`, `/shop`, `/cart`, `/about`, `/contact`, `/login`, `/signup`) is nested under this layout in `AppRoutes.jsx`, so they all get the same navbar and footer without importing them individually.

### `layouts/AuthWrapper.jsx`
Renders `Sidebar` + `<Outlet />`. Every dashboard route is nested under this layout instead, giving the authenticated area a completely different shell (no public navbar/footer) with zero duplicated markup.

`<Outlet />` is React Router's placeholder — it's where the matched child route's page component actually renders inside the wrapper.

---

## Authentication & Protected Routes

`src/context/AuthContext.jsx` is the single source of truth for "who's logged in":

- `login(userData)` — stores the user and persists it to `localStorage`
- `logout()` — clears both
- `isAuthenticated` — derived boolean any component can read via the `useAuth()` hook
- On app load, it re-hydrates the session from `localStorage` so refreshing the page doesn't log you out

Two tiny route components apply that condition to routing:

- **`routes/ProtectedRoute.jsx`** — wraps every dashboard route. Not logged in → `<Navigate to="/login" />` (and remembers where you were headed, so Login can send you back). Logged in → renders the nested route.
- **`routes/GuestRoute.jsx`** — the mirror image, wrapping `/login` and `/signup`. Already logged in → bounced to `/dashboard`, so a logged-in user can't land back on the login screen.

The Navbar and Sidebar both read `isAuthenticated`/`user` from the same context, which is why the navbar swaps Login/Signup for a Dashboard link the moment you log in, and the Sidebar can greet you by name.

> **Note:** There's no real backend yet — `login()` accepts any email/password that passes basic validation and fabricates a session client-side. See [Known Limitations](#known-limitations).

---

## Routing

Routing is handled by **React Router v7**, initialized in `main.jsx` with `<BrowserRouter>`. Unlike a typical flat route list, everything is driven by one data file and one small component that maps over it:

**`routes/routesConfig.js`** — the only file you touch to add a page:

```js
export const publicRoutes = [
  { path: '/', element: Home },
  { path: '/shop', element: Shop },
  { path: '/cart', element: Cart },
  { path: '/about', element: About },
  { path: '/contact', element: Contact },
]

export const guestRoutes = [
  { path: '/login', element: Login },
  { path: '/signup', element: Signup },
]

export const privateRoutes = [
  { path: '/dashboard', element: Dashboard },
  { path: '/dashboard/products', element: Products },
  // ...
]
```

**`routes/AppRoutes.jsx`** — turns those arrays into real routes with `.map()`, applying the right layout + guard to each group:

```jsx
<Routes>
  <Route element={<UnauthWrapper />}>
    {publicRoutes.map(({ path, element: Element }) => (
      <Route key={path} path={path} element={<Element />} />
    ))}
    <Route element={<GuestRoute />}>
      {guestRoutes.map(({ path, element: Element }) => (
        <Route key={path} path={path} element={<Element />} />
      ))}
    </Route>
  </Route>

  <Route element={<ProtectedRoute />}>
    <Route element={<AuthWrapper />}>
      {privateRoutes.map(({ path, element: Element }) => (
        <Route key={path} path={path} element={<Element />} />
      ))}
    </Route>
  </Route>

  <Route path="*" element={<NotFound />} />
</Routes>
```

`App.jsx` renders `<AuthProvider><CartProvider><AppRoutes /></CartProvider></AuthProvider>` — routing, auth, and cart state are all wired together at the very top of the tree.

---

## Cart & Shop

`src/context/CartContext.jsx` follows the exact same pattern as `AuthContext`: a Provider holding `items` in state (persisted to `localStorage`), exposing `addToCart`, `removeFromCart`, `updateQty`, plus derived `count` and `total`. Any component can read or update the cart via `useCart()` — that's how `ProductCard`'s "Add" button, the Navbar's badge count, and the Cart page all stay in sync without passing props down manually.

Product data lives in `src/data/products.js` as a plain array (id, name, category, price, seller) — there's no backend, so this stands in for a real product API.

---

## Shared Components

### `Navbar.jsx`
Sticky, translucent public top bar. Desktop links (Home, Shop, About, Contact) via `NavLink` for active-state styling, a cart icon with a live badge, and auth-aware actions (Login/Signup vs. Dashboard). Includes a mobile hamburger menu.

### `Footer.jsx`
Four-column responsive layout on a navy background: brand + socials, quick links, customer service links, and Ghana contact details.

### `Sidebar.jsx`
Dashboard-only side navigation (desktop rail + mobile slide-out drawer): links to every `/dashboard/*` page, the logged-in user's name/email, and a logout button that calls `logout()` and returns to the homepage.

### `ProductCard.jsx`
One product tile on the Shop page — category photo, name, seller, price, and an Add-to-cart button wired to `CartContext`.

### `ui/Input.jsx`, `ui/TextArea.jsx`
Accept `label`, `id`, `error`, and standard input/textarea props; centralize all field styling so every form looks and behaves identically.

### `ui/Button.jsx`
Accepts a `variant` prop (`primary`, `accent`, `outline`, `ghost`) mapped to a Tailwind class set — `accent` (orange) is reserved for the platform's main calls-to-action (Shop Now, Sign Up, Checkout).

---

## Design System

Colors are pulled directly from the BestMart logo and defined once as Tailwind v4 theme tokens in `src/index.css` (`@theme { --color-brand-blue: ...; --color-brand-orange: ...; }`), which automatically generates utilities like `bg-brand-blue` and `text-brand-orange`:

- **Navy** (`brand-navy`) — dark sections: footer, hero banners, sidebar, dashboard promo band
- **Blue** (`brand-blue` / `brand-blue-light` / `brand-blue-dark`) — primary actions, links, active nav states — trust and structure
- **Orange** (`brand-orange` / `brand-orange-light` / `brand-orange-dark`) — the platform's "do this" color: Sign Up, Add to Cart, Checkout, Shop Now
- **Neutral palette:** Tailwind's `gray` scale for text, borders, and backgrounds
- **Cards & surfaces:** `rounded-xl` / `rounded-2xl` with subtle borders and soft shadows
- **Icons:** Heroicons (`react-icons/hi`, `react-icons/hi2`) for UI, Font Awesome (`react-icons/fa`) for social links

---

## Form Handling & Validation

Login, Sign Up, and Contact follow the same pattern, built with plain React state (no external form library):

1. A single `form` state object holds all field values, updated through one shared `handleChange` handler keyed by `e.target.name`.
2. A `validate()` function runs on submit, builds an `errors` object of only the fields that fail, and returns whether the form is valid.
3. On success, Login/Signup call `login()` and navigate into the dashboard; Contact shows a success banner and resets its fields.
4. Each `Input`/`TextArea` receives its corresponding `error` message, which turns the field's border red and displays the message beneath it.

Validation rules currently implemented:
- **Required fields:** name, email, password, message, etc.
- **Email format:** checked with a regular expression (`/^\S+@\S+\.\S+$/`)
- **Password length:** minimum 6 characters (Sign Up)
- **Password match:** confirm password must equal password (Sign Up)

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
| `build` | `npm run build` | Builds an optimized production bundle |
| `preview` | `npm run preview` | Serves the production build locally for a final sanity check |

---

## Responsive Behavior

Every page is mobile-first and verified at both mobile (~390px) and desktop (1280px) viewport widths:

- The Navbar collapses into a hamburger-triggered mobile menu below the `md` breakpoint; the Sidebar collapses into a slide-out drawer with its own top bar.
- Grids (products, feature cards, category cards, values, stats) collapse from 4/6 columns on desktop down to 2 or 1 column on smaller screens.
- Forms remain centered, single-column, and comfortably padded at all widths.
- The Footer's four columns stack vertically on mobile and lay out side-by-side from `sm:` upward.

---

## Project Decisions & Rationale

- **Why separate `UnauthWrapper`/`AuthWrapper` layouts instead of one shared shell:** the public storefront and the seller dashboard are different products wearing the same brand — a navbar+footer doesn't belong around a dashboard, and a sidebar doesn't belong around a landing page. Splitting the layout in two keeps each one simple instead of branching internally on auth state.
- **Why a `routesConfig.js` data file instead of writing `<Route>` tags by hand in `AppRoutes.jsx`:** adding a page becomes a one-line change in one file, with no risk of forgetting to wrap it in the right layout or guard — the `.map()` in `AppRoutes.jsx` handles that consistently every time.
- **Why Context API over a state library (Redux, Zustand):** `AuthContext` and `CartContext` each hold a small, well-scoped slice of state with a handful of actions — Context plus a `useX()` hook covers that cleanly without adding a dependency.
- **Why Tailwind CSS v4 over plain CSS or a component library:** keeps styling co-located with markup and avoids pulling in a heavier UI kit for a project whose goal is to demonstrate hand-built component design.
- **Why plain `useState` for forms instead of a form library:** the forms here are small; the goal was to demonstrate understanding of controlled inputs and manual validation, not library integration.
- **Why navy/blue/orange:** pulled directly from the BestMart logo, so the generated UI matches the actual brand identity rather than an arbitrary palette.
- **Why Ghana, not Nigeria, in the contact details:** the platform's actual market — address, phone format, and currency (₵) were corrected to match.

---

## Known Limitations

- There is no real backend: Login/Signup accept any validly-shaped input and fabricate a session in `localStorage`; the Shop's product catalog is mock data in `src/data/products.js`; the Cart's Checkout button is UI-only.
- "My Products", "Advertise", "Orders", and "Settings" in the dashboard are placeholder pages awaiting real functionality.
- `axios` is installed in anticipation of API integration but is not yet used anywhere in the codebase.
- Category and About-page images are stock photography (Pexels), standing in for real product/seller photography.

---

## Roadmap

- [ ] Connect Login/Sign Up/session to a real authentication API
- [ ] Replace the mock product catalog with a real product API, and build out My Products/Advertise/Orders/Settings
- [ ] Wire the Cart's Checkout button to a real payment flow
- [ ] Add automated tests (component tests with React Testing Library, e2e with Playwright)
- [ ] Replace stock category/about photography with real product and seller photos

---

## Author

Built by **maryakussah123@gmail.com** as part of the WomenTechsters program.
