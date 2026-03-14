# Error Log

- **[2026-03-05 01:34] 404 Not Found on favicon.ico**
  - **Error:** `favicon.ico:1 Failed to load resource: the server responded with a status of 404 (Not Found)`
  - **Root Cause:** Next.js failed to serve the favicon from `src/app` due to internal router caching/resolution issues after moving the root `app/` directory into `src/`.
  - **Fix Applied:** Copied `favicon.ico` directly to the `public/` directory where it is served statically, bypassing any App Router dynamic routing issues.
