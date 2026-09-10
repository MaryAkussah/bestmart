# My React So Far

A personal walk-through of the React conventions I used while building **BestMart**, written in my own words — what I did, why I did it that way, how it works, and when I'd reach for it again. Code snippets are pulled directly from this repo, mostly from `src/`.

---

## 1. Functional components with a named function + `export default`

**What it is:** Every component in this project is a plain JavaScript function (not a class, not always an arrow function assigned to a `const`), declared with `function ComponentName()` and exported on its own line at the bottom of the file.

**Why:** Function declarations are hoisted and read naturally top-to-bottom in a file (imports → helper data/functions → the component → the export), and they show up with a real name in React DevTools and in stack traces instead of `<anonymous>`. Keeping one component per file with one default export keeps the mental model simple: file name = component name = what you import.

**How / example** ([Footer.jsx](src/components/Footer.jsx)):

```jsx
function Footer() {
  return (
    <footer className="bg-brand-navy text-gray-300">
      {/* ... */}
    </footer>
  )
}

export default Footer
```

**When to use it:** Basically always, for anything that is "a page" or "a piece of UI." I only deviated from *default* exports for Context providers/hooks (see #7), because those files export more than one thing.

---

## 2. Conditional rendering with ternaries and `&&`

**What it is:** Deciding what to render based on a boolean or a piece of state, using `condition ? <A /> : <B />` when there are two branches, or `condition && <A />` when there's only one (render something, or render nothing).

**Why:** JSX is just JavaScript expressions, so instead of a template-engine-style `{{#if}}`, React leans on the language's own conditional operators. It reads as "this value depends on that condition," which is exactly what's happening.

**How / example** ([ForgotPassword.jsx](src/pages/ForgotPassword.jsx)) — the whole page swaps between a form and a success panel depending on one boolean:

```jsx
{sent ? (
  <div>
    <div className="rounded-lg bg-green-50 text-green-700 text-sm px-4 py-3">
      If an account exists for <span className="font-medium">{email}</span>, a reset
      link is on its way.
    </div>
    {/* ...continue link... */}
  </div>
) : (
  <form onSubmit={handleSubmit} noValidate>
    {/* ...email input + submit button... */}
  </form>
)}
```

And the single-branch form, from [Navbar.jsx](src/components/Navbar.jsx) — the cart badge only renders when there's something to count:

```jsx
{count > 0 && (
  <span className="absolute -top-0.5 -right-0.5 bg-brand-orange text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
    {count}
  </span>
)}
```

**When to use it:** Ternary for "show A or show B." `&&` for "show A or show nothing." I avoided nesting more than one ternary inside a return — past that point I split things into a named variable or an early `return` instead, so the JSX stays readable.

---

## 3. `.map()` to render lists, always with a stable `key`

**What it is:** Turning an array of data into an array of JSX elements with `Array.prototype.map`, and giving each resulting element a unique `key` prop so React can track it across re-renders.

**Why:** React needs a stable identity per list item to know which DOM node to update, move, or remove when the underlying array changes — without a good `key`, React falls back to index-based diffing, which can cause the wrong item to keep its state (e.g., a text input) when the list is reordered or filtered.

**How / example** ([Shop.jsx](src/pages/Shop.jsx)) — the product grid, keyed by each product's real, stable `id`:

```jsx
<div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
  {filtered.map((product) => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>
```

I used this pattern everywhere there's a list: nav links in [Navbar.jsx](src/components/Navbar.jsx) (keyed by `link.to`), feature/stat cards in [Home.jsx](src/pages/Home.jsx) and [About.jsx](src/pages/About.jsx) (keyed by `title`/`label`, since that data has no numeric id), and — importantly — the whole routing table (see #11), which turns `routesConfig.js` arrays into `<Route>` elements the exact same way.

**When to use it:** Any time I'm rendering "one of these for each of those." I picked the most stable, unique field available as the key (a real `id` when one exists, otherwise a guaranteed-unique string like a title), and never used the array index once the list could be filtered, reordered, or have items removed.

---

## 4. `.find()` and `.filter()` for reading/deriving data, not just `.map()`

**What it is:** Using `.find()` to locate a single matching item in an array, and `.filter()` to derive a narrowed-down array — as opposed to writing a manual `for` loop.

**Why:** These read as intent ("find the cart line for this product," "filter the products down to this category") and, combined with the spread operator (#14), let me update state immutably instead of mutating the original array in place.

**How / example** ([CartContext.jsx](src/context/CartContext.jsx)) — `.find()` decides whether `addToCart` should bump an existing line's quantity or push a new one:

```jsx
const addToCart = (product) => {
  setItems((prev) => {
    const existing = prev.find((item) => item.id === product.id)
    if (existing) {
      return prev.map((item) =>
        item.id === product.id ? { ...item, qty: item.qty + 1 } : item
      )
    }
    return [...prev, { ...product, qty: 1 }]
  })
}
```

And `.filter()` powers the category filter on [Shop.jsx](src/pages/Shop.jsx):

```jsx
const filtered = active === 'All' ? products : products.filter((p) => p.category === active)
```

**When to use it:** `.find()` whenever I need "the one item that matches," `.filter()` whenever I need "the subset that matches." Both read more clearly at a glance than an equivalent loop with an early `break` or a manually pushed accumulator array.

---

## 5. Destructuring — for props, and for values pulled off hooks

**What it is:** Pulling named fields straight out of a props object or a hook's return value in the function signature or in a `const { ... } = ...` line, instead of referencing `props.something` everywhere.

**Why:** It documents exactly what a component or hook actually needs right where it's declared — anyone skimming the function signature can see its whole "API surface" in one line — and it lets me set defaults inline (`variant = 'primary'`) without a separate `defaultProps` block.

**How / example** ([Button.jsx](src/components/ui/Button.jsx)) — props destructured directly in the parameter list, with a default value and the rest captured for pass-through:

```jsx
function Button({ children, type = 'button', variant = 'primary', className = '', ...props }) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-medium transition disabled:opacity-60 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
```

And the same idea applied to a hook's return value, in [Sidebar.jsx](src/components/Sidebar.jsx):

```jsx
const { user, logout } = useAuth()
```

**When to use it:** Essentially every component and every hook call. The one place I deliberately *didn't* over-destructure is the `...props` rest pattern above — I only pull out the names a component actually reads (`variant`, `className`, etc.) and forward everything else (`onClick`, `disabled`, `type`, `aria-*`...) untouched, so `Button`/`Input`/`TextArea` stay generic wrappers instead of needing to know every possible native attribute in advance.

---

## 6. Small, reusable "dumb" UI components (`Button`, `Input`, `TextArea`)

**What it is:** Presentational components that own only styling and a couple of visual variants, take their behavior entirely from props, and hold no state or business logic of their own.

**Why:** Every form in the app (Login, Signup, Contact, and now Forgot/Reset Password) needed the same look for a labeled input with an error message, and the same handful of button styles (primary blue, "do this" orange accent, outline, ghost). Building that once and reusing it means a single source of truth for what a form field or button looks like — change the styling in one file, and it updates everywhere.

**How / example** ([Input.jsx](src/components/ui/Input.jsx)):

```jsx
function Input({ label, id, error, className = '', ...props }) {
  return (
    <div className="mb-4">
      {label && <label htmlFor={id} className="...">{label}</label>}
      <input
        id={id}
        className={`w-full px-4 py-2.5 rounded-lg border ${error ? 'border-red-400' : 'border-gray-300'} ...`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}
```

Every page that needs a text field just renders `<Input id="email" name="email" label="Email address" value={...} onChange={...} error={errors.email} />` — the page owns the *data*, `Input` owns the *look*.

**When to use it:** Whenever the same visual pattern shows up in more than one or two places. I resisted the urge to build these before I actually needed them twice — `Input`/`Button`/`TextArea` all came out of noticing repetition across Login/Signup/Contact, not from guessing ahead of time.

---

## 7. Context API + a custom hook, instead of prop-drilling

**What it is:** `createContext` + a `Provider` component that owns some state and the functions to change it, paired with a small custom hook (`useAuth`, `useCart`) that wraps `useContext` and throws a clear error if it's ever called outside its provider.

**Why:** "Is someone logged in?" and "what's in the cart?" are both needed in far-apart places — the Navbar, the Sidebar, `ProtectedRoute`, `ProductCard`, the Cart page — and passing that down as props through every layer in between would mean threading `isAuthenticated`/`cartItems` through components that don't otherwise care about them. Context lets any component below the Provider ask for exactly what it needs, directly.

**How / example** ([AuthContext.jsx](src/context/AuthContext.jsx)):

```jsx
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // ...login/logout functions, localStorage sync...
  const value = { user, isAuthenticated: Boolean(user), loading, login, logout }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
```

Then anywhere in the tree: `const { isAuthenticated, loading } = useAuth()`. The `if (!ctx) throw` guard means a mistake (using the hook outside `<AuthProvider>`) fails loudly at the exact call site instead of silently returning `undefined` and blowing up somewhere unrelated later.

**When to use it:** For state that's genuinely global to a whole section of the app (who's logged in, what's in the cart) — not for everything. I kept two separate contexts (`Auth`, `Cart`) rather than one big one, since they change for different reasons and most components only care about one of them.

---

## 8. Controlled forms: one state object + one shared `handleChange`

**What it is:** Every multi-field form keeps all its field values in a single `useState({ ... })` object, and every input shares one `handleChange` function that updates the object by reading `e.target.name`, instead of a separate `useState` and a separate handler per field.

**Why:** With more than one or two fields, per-field `useState`/`onChange` pairs get repetitive fast. Keying updates off `name` means adding a new field to the form is just adding a new key to the initial state object and a new `<Input name="..." />` — the change handler doesn't need to know the form grew.

**How / example** ([Signup.jsx](src/pages/Signup.jsx)):

```jsx
const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })

const handleChange = (e) => {
  setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
}
```

Every `<Input>` on the page just points at the same handler: `<Input name="password" value={form.password} onChange={handleChange} />`. Validation follows the same shape — a `validate()` function builds an `errors` object of only the fields that actually failed, and returns whether the form is clean:

```jsx
const validate = () => {
  const next = {}
  if (!form.password) next.password = 'Password is required'
  else if (form.password.length < 6) next.password = 'Password must be at least 6 characters'
  if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match'
  setErrors(next)
  return Object.keys(next).length === 0
}
```

I reused this exact pattern for the new [ForgotPassword.jsx](src/pages/ForgotPassword.jsx) and [ResetPassword.jsx](src/pages/ResetPassword.jsx) pages so every form in the app validates and errors the same way.

**When to use it:** Any form with more than one field and no need for a heavier form library — which, for a project this size, was every form in the app. If a form ever needed cross-field async validation or a big dynamic field list, I'd reach for a library like React Hook Form instead of scaling this pattern further.

---

## 9. React Router: nested layout routes + navigation hooks

**What it is:** Using React Router v7's ability to nest a `<Route>` with no `path` (just an `element`) around a group of child routes, so the parent's component renders a shared shell with `<Outlet />` marking where the active child route goes — plus hooks like `useNavigate`, `useLocation`, and `useSearchParams` to read/react to the URL from inside a component.

**Why:** The storefront and the seller dashboard are two different "shells" (navbar+footer vs. a sidebar), but *within* each shell, many pages share that exact same wrapper. Nesting means I write `<Navbar />`/`<Footer />` once in `UnauthWrapper` and `<Sidebar />` once in `AuthWrapper`, instead of importing them into every page.

**How / example** ([UnauthWrapper.jsx](src/layouts/UnauthWrapper.jsx)):

```jsx
function UnauthWrapper() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
```

And a hook reading the URL directly, in the new [ResetPassword.jsx](src/pages/ResetPassword.jsx) — `useSearchParams` pulls the `?token=` query value out of the current URL so the page can validate the "reset link" someone landed on:

```jsx
const [searchParams] = useSearchParams()
const token = searchParams.get('token')
```

`useNavigate` shows up the same way in [Login.jsx](src/pages/Login.jsx) to send someone to `/dashboard` (or back to wherever `ProtectedRoute` intercepted them) after a successful login, and in the new Reset Password page to redirect to `/login` a moment after a successful reset.

**When to use it:** Nested layout routes any time two or more pages share a visual shell. Navigation hooks any time a component needs to *read* the current URL or *cause* a redirect as a result of something happening (a form submitting, a guard rejecting access) rather than a user literally clicking a `<Link>`.

---

## 10. Route guards as their own small components (`<Outlet />` + `<Navigate />`)

**What it is:** A route-guard component that renders nothing of its own — it just decides, based on some condition, whether to render the matched child route (`<Outlet />`) or redirect somewhere else (`<Navigate />`).

**Why:** "Only logged-in users can see the dashboard" and "only logged-out users can see the login page" are both just conditions — expressing them as a tiny reusable route component means the *pages themselves* (`Dashboard`, `Login`, etc.) never have to think about auth state at all. The guard is the single place that logic lives.

**How / example** ([ProtectedRoute.jsx](src/routes/ProtectedRoute.jsx)):

```jsx
function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) return null
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <Outlet />
}
```

`GuestRoute.jsx` is the mirror image (redirects *away* from `/login`/`/signup` if you're already authenticated). This is exactly why I gated `/forgot-password` and `/reset-password` through `GuestRoute` as well — someone already logged in has no reason to be resetting a password from a guest-only screen, so it gets the same treatment as Login/Signup for free.

**When to use it:** Any time "can this route even render" depends on some piece of app-wide state (auth, permissions, feature flags) rather than the route's own local data.

---

## 11. Config-driven routing — data first, `<Route>`s generated with `.map()`

**What it is:** Instead of hand-writing a `<Route path="..." element={<X />} />` for every single page inside `AppRoutes.jsx`, every page lives as one `{ path, element }` entry in a plain array in `routesConfig.js`, grouped by who's allowed to see it (`publicRoutes`, `guestRoutes`, `privateRoutes`). `AppRoutes.jsx` then turns each array into real `<Route>` elements with `.map()` (see convention #3 again, applied to routing itself).

**Why:** Adding a page becomes a one-line change in one file, and it's *impossible* to forget to wrap a new page in the right layout/guard — the `.map()` does that consistently for the whole group, every time. This is exactly how I added the two new pages for this task:

**How / example** ([routesConfig.js](src/routes/routesConfig.js)):

```js
export const guestRoutes = [
  { path: '/login', element: Login },
  { path: '/signup', element: Signup },
  { path: '/forgot-password', element: ForgotPassword },
  { path: '/reset-password', element: ResetPassword },
]
```

...and [AppRoutes.jsx](src/routes/AppRoutes.jsx) never had to change at all — it already knew how to turn any array shaped like that into guarded, laid-out routes:

```jsx
<Route element={<GuestRoute />}>
  {guestRoutes.map(({ path, element: Element }) => (
    <Route key={path} path={path} element={<Element />} />
  ))}
</Route>
```

**When to use it:** Once a route list grows past a handful of entries and starts falling into obvious groups (public/guest-only/protected, or role-based tiers) — the up-front cost of one extra layer of indirection pays for itself the moment you add page #6, #7, #8...

---

## 12. `useState`'s lazy initializer, and learning why it matters

**What it is:** Passing a *function* to `useState` (`useState(() => expensiveWork())`) instead of the value directly, so that the initializer only runs once, on the very first render — not on every re-render.

**Why (and a bug I actually hit building this):** [CartContext.jsx](src/context/CartContext.jsx) reads from `localStorage` this way so that parsing the saved cart only happens once:

```jsx
const [items, setItems] = useState(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved ? JSON.parse(saved) : []
})
```

While building the new Reset Password page, I hit the *reactive* version of this same mistake: I first wrote `const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')` as a plain variable computed on every render, instead of state. On submit, the handler clears that `localStorage` key and shows a success message — but because `saved` was recomputed fresh on the very next render (now reading `null`), the page's "is this token still valid?" check flipped to `false` right as it should have shown success, and the success message never appeared. Switching it to `useState(() => JSON.parse(...))` freezes that read at mount time, so clearing localStorage later doesn't retroactively change what this render decided:

```jsx
const [saved] = useState(() => JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'))
```

**When to use it:** Any time the initial value comes from something with a cost or a side effect (reading `localStorage`, parsing JSON, a heavy computation) — and more importantly, any time I want a snapshot from "when this component first mounted" that shouldn't drift just because something *else* the component does later changes the same underlying source.

---

## 13. Immutable state updates with the spread operator

**What it is:** Building a *new* array/object from an old one (`{ ...prev, key: value }`, `[...prev, newItem]`, `prev.map(...)`) instead of mutating `prev` directly and calling `setState` with the same reference.

**Why:** React decides whether to re-render by checking if the value passed to a setter is a new reference (for objects/arrays) — mutating the existing object in place and passing it back would often mean React sees "the same object" and doesn't re-render at all, or renders inconsistently. Spreading always produces a fresh reference, so updates are reliably picked up.

**How / example** ([CartContext.jsx](src/context/CartContext.jsx)) — bumping a quantity without touching the original array or item:

```jsx
return prev.map((item) =>
  item.id === product.id ? { ...item, qty: item.qty + 1 } : item
)
```

**When to use it:** Every single state update that touches an object or array — which, functionally, is most `setX` calls that aren't just replacing a primitive (string/number/boolean) outright.

---

## 14. Icons as first-class, renamed components

**What it is:** Importing icon components from `react-icons` and, when they're driven by a data array, destructuring them out of that array's objects with a rename (`icon: Icon`) so they can be rendered as `<Icon />` — a capitalized JSX tag, since JSX requires components to start with a capital letter.

**Why:** Keeping `{ icon: HiOutlineTruck, title: 'Fast Delivery', text: '...' }` as *data* (an array of plain objects) instead of hard-coding four near-identical JSX blocks means the layout is written once and the content drives it — adding a fifth feature card is one more array entry, not one more copy-pasted block.

**How / example** ([Home.jsx](src/pages/Home.jsx)):

```jsx
const features = [
  { icon: HiOutlineTruck, title: 'Fast Delivery', text: '...' },
  // ...
]

{features.map(({ icon: Icon, title, text }) => (
  <div key={title}>
    <Icon className="text-brand-blue" size={24} />
    <h3>{title}</h3>
    <p>{text}</p>
  </div>
))}
```

**When to use it:** Whenever a list of "icon + label + text" cards shares one layout — features, stats, contact details, values. I used it in [Home.jsx](src/pages/Home.jsx), [About.jsx](src/pages/About.jsx), and [Contact.jsx](src/pages/Contact.jsx).

---

## A note on the new pages I added (Forgot Password / Reset Password)

Task-wise, I added `/forgot-password` and `/reset-password` to complete the public + auth-adjacent page set. There's no real backend, so I followed the same "fake it client-side, but honestly" approach `AuthContext` already used for login/signup: submitting an email on Forgot Password generates a random token and stores `{ email, token }` in `localStorage`; visiting Reset Password checks the `?token=` query param (via `useSearchParams`) against that saved value. A missing or mismatched token shows an explicit "invalid or expired" state instead of silently showing a form that would appear to work but reset nothing — since in a real app, that's exactly the case a stale or tampered link needs to fail safely on.

---

## My understanding of the packages this project imports

- **`react` / `react-dom`** — the actual UI library and its browser-rendering glue. `main.jsx` calls `createRoot(...).render(<App />)` once; everything else is components describing *what* the UI should look like for a given state, and React figures out *how* to update the real DOM to match.
- **`react-router-dom` (v7)** — turns a single-page app into something that behaves like a multi-page site: `<BrowserRouter>` (wraps the whole app in `main.jsx`, syncing the URL with the browser's history API), `<Routes>`/`<Route>` (declare what renders at which path), `<Link>`/`<NavLink>` (navigate without a full page reload; `NavLink` additionally knows if it's the *active* route, which is how the navbar highlights the current page), `<Navigate>` (an imperative redirect, used inside the route guards), `<Outlet>` (a placeholder inside a layout component where the matched child route renders), and the hooks `useNavigate` (redirect from inside event handlers), `useLocation` (read the current path/state), and `useSearchParams` (read/write the `?query=` string — this is what makes `/reset-password?token=...` work).
- **`react-icons`** — a single package bundling many popular icon sets as React components, so instead of managing SVG files I import exactly the icons I need as components (`react-icons/hi`, `react-icons/hi2` for two slightly different Heroicons sets, `react-icons/fa` for Font Awesome's social icons) and style them with the same Tailwind classes as any other element (`className`, `size`).
- **`axios`** — a promise-based HTTP client, installed in anticipation of a real backend but not used anywhere yet, since every "API" in this app right now is either `localStorage` or a hard-coded array in `src/data/`. When a real API exists, this is what login/signup/products/orders would switch to calling instead of faking a session client-side.
- **`tailwindcss` (v4) + `@tailwindcss/vite`** — not a React package, but central to how every component is styled: utility classes directly in `className` instead of separate CSS files, with the brand's navy/blue/orange colors registered once as theme tokens in `index.css` so classes like `bg-brand-blue` are available everywhere.
- **`vite` + `@vitejs/plugin-react`** — the dev server and bundler. `@vitejs/plugin-react` is what lets `.jsx` files import/export like normal JS and get fast-refresh during `npm run dev`, and `vite build` is what produces the optimized `dist/` folder for production.

Working through this project is what made the difference, for me, between *recognizing* these patterns in a tutorial and actually reaching for them unprompted — the lazy-initializer bug in particular (#12) only became a real lesson because I caused it myself while wiring up Reset Password, then had to reason out *why* the "invalid link" screen was flashing at the exact moment it should have shown success.
