

# Ticksy

  This is a code bundle for Ticksy (Shared List Management App). The original project is available at https://www.figma.com/design/Rx8x2KxMIBn00xVcr5CWiM/Shared-List-Management-App.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Data Persistence

  User data is designed to survive local restarts and new frontend deployments.

  - The app keeps the current anonymous user ID in browser localStorage under `ticksy-user-id`.
  - The backend stores lists and user indexes in the KV store, and falls back to `server/.ticksy-kv-fallback.json` locally if the remote KV endpoint is unavailable.
  - The server now normalizes older saved records on read, so additive or non-breaking object-shape changes do not wipe existing data.
  - For local and deployed builds to see the same data, both must point at the same backend API by setting `VITE_API_URL` to the same base URL.

  Browser storage is origin-scoped, so `localhost` and a deployed domain do not automatically share the same saved anonymous user ID. A deployment on the same domain keeps the same localStorage and therefore the same user identity.
  