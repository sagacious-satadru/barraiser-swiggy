# Name Search & Custom Bucket Size Pagination

A React + TypeScript application featuring live debounced search with an intercepted mock API, paired with client-side pagination based on customizable bucket sizes.

---

## Features

- **Live Debounced Search**: 300ms debounce interval to avoid spamming the search endpoint on every keystroke.
- **Race Condition Prevention**: Employs `AbortController` to cancel in-flight network requests when the user continues typing or clears the input, guaranteeing out-of-order responses never corrupt state.
- **Custom Bucket Size Pagination**: Users can configure how many items appear per page via an intuitive number input (default: 5, with defensive clamping $\ge 1$).
- **Direct Pagination Slicing**: Calculates pagination windows directly ($O(1)$) instead of allocating large 2D matrix arrays on every render.
- **Safe Page Boundary Handling**: Automatically clamps active page index if the result set shrinks or the bucket size expands.
- **Stable Composite Keys**: Uses global composite keys (`${name}-${startIndex + index}`) to ensure clean React DOM reconciliation across page transitions and prevent duplicate-key collisions.
- **Accessible & Responsive UI**: Clean light/dark mode design with `aria-label` tags, `aria-live="polite"` status announcements, and keyboard-friendly controls.

---

## Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [pnpm](https://pnpm.io/) (or `npm`)

### 1. Navigate to the app folder
```bash
cd my-app
```

### 2. Install dependencies
```bash
pnpm install
# or: npm install
```

### 3. Run the development server
```bash
pnpm dev
# or: npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

---

## Scripts

Run these from the `my-app` directory:

| Command | Description |
|---|---|
| `pnpm dev` | Starts the Vite local development server |
| `pnpm build` | Typechecks with `tsc` and builds production bundle with `vite build` |
| `pnpm lint` | Runs `oxlint` static code analysis |
| `pnpm preview` | Locally previews the production build |
