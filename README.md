# TraceBack — Frontend Only

A student-friendly frontend prototype for a Blockchain-Based Lost & Found System.

## Run it
1. Download and extract the ZIP.
2. Open `index.html` in Chrome, Edge, or Firefox.
3. No installation is required.

## Included features
- Dashboard counts and recent items
- Found-item registration with generated item ID
- Search by name, category, location, description, or ID
- Submit a claim and approve/reject it in the demo
- Mark an approved claim as returned
- Event-history page and JSON export
- Browser localStorage persistence

## Important limitation
This is **frontend only**. It does not include a backend, server, authentication, database server, smart contract, or real blockchain. Data is stored in the current browser with `localStorage`. The event history is simulated for demonstration and is not tamper-proof.

## Suggested 5-member task split
1. **Member 1 — UI structure:** `index.html`, navigation, dashboard layout, footer and accessibility.
2. **Member 2 — Styling:** `style.css`, responsive design, colors, cards, forms and mobile layout.
3. **Member 3 — Item registration:** registration form validation, item IDs and adding new item records in `script.js`.
4. **Member 4 — Search and claims:** search/filter UI, claim dialog, approve/reject/return interactions in `script.js`.
5. **Member 5 — Event history and integration:** history timeline, JSON export, localStorage, testing, README and GitHub coordination.

Because the project is frontend-only, all members should coordinate changes to `script.js` to avoid merge conflicts. Agree on the item object and event object shapes before working in parallel.

## GitHub upload
Create a repository, then upload the extracted files (`index.html`, `style.css`, `script.js`, `README.md`). Do not upload private information or passwords.
