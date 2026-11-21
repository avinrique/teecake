# TeeCake Creations — Artisanal Home Bakehouse & Hearth Patisserie

An artisanal bakery portfolio and digital showcase inspired by 19th-century Victorian bakehouse aesthetics and Oliver Twist. Features an automated slow-dissolving wallpaper backdrop system, 39 handcrafted bakery creations with high-resolution photography, live slow-fade signature hearth stage, interactive lightbox photo gallery, and complete atelier typography and theme controls.

---

## 🥐 Features

- **39 Handcrafted Bakery Creations**: Complete with artisanal descriptions, ingredient breakdowns, pricing, tags, and category filtering (Cakes, Pastries & Bakes, Cupcakes, Artisan Breads & Cookies, Savory, Cream Pot, Assorted Combo, and Festive Specials).
- **Auto-Changing Wallpaper System**: Dual-layer cross-fade cinema dissolve (configurable 1.0s to 5.0s fade duration) with custom rotation interval (2s to 180s), multi-wallpaper selection loop, Play/Pause, and custom image upload support.
- **Signature Hearth Stage**: Live slow-fading carousel showcase with full timing and carousel track controls.
- **Master Studio Atelier**: Complete in-browser customizer for typography scaling, font weights, colors, background tints, and Victorian aged parchment styling.
- **Persistent Local & Server Storage**: Full dual-sync storage engine using JSON server disk database, IndexedDB, and LocalStorage for reliable offline and cross-device persistence.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 20.10.0 or higher)
- [npm](https://www.npmjs.com/) (version 9 or higher)

### Installation

1. Clone or extract the downloaded project folder.
2. Open a terminal in the project directory and install dependencies:

```bash
npm install
```

### Running Locally (Development)

Start the full-stack development server with hot module reload:

```bash
npm run dev
```

Open your browser and navigate to **`http://localhost:3000`**.

### Building for Production

Compile the optimized static frontend bundle:

```bash
npm run build
```

This builds all assets into the `dist/` directory, including all static uploads and bundled recipes.

### Running in Production

To start the production server:

```bash
npm start
```

---

## 📁 Project Structure

```
├── public/                 # Bundled static assets and legacy uploads
│   └── uploads/            # Dish photos, custom logos, and backdrops
├── src/
│   ├── components/         # React UI components (Hero, Gallery, Lightbox, Modals, etc.)
│   ├── data/
│   │   └── initialData.ts  # Bundled 39 creations, backdrops, and default texts
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Persistent storage, IndexedDB, and image processors
│   ├── App.tsx             # Main application container
│   ├── main.tsx            # React DOM entry point
│   └── index.css           # Global Tailwind CSS 4 styling
├── data/                   # Server-side JSON database and backups
├── server.ts               # Express full-stack API server & Vite dev middleware
├── package.json            # Project dependencies & scripts
└── vite.config.ts          # Vite bundler configuration
```

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4, Lucide React Icons, Motion
- **Backend / Dev Server**: Node.js, Express, TSX, Vite 6
- **Storage**: Server-side disk persistence, IndexedDB, LocalStorage

## Admin access and production storage

Visitors can view the site without signing in. Only the two configured admin
accounts can save changes, upload images, or change the photo library. There is
no signup route. Old edit-mode URLs and browser storage do not grant access.

1. Copy `.env.example` to `.env`, or set its variables in your hosting provider.
2. Set `ADMIN_1_EMAIL`, `ADMIN_1_PASSWORD`, `ADMIN_2_EMAIL`, and
   `ADMIN_2_PASSWORD`. Use distinct emails and unique passwords of at least 12
   characters. Do not use variables beginning with `VITE_` for credentials.
3. Restart the server, then select **Admin sign in** on the website. If either
   account is missing or invalid, editing stays locked for everyone.
4. Use **Sign out** when finished. Sessions expire after 12 hours; a server restart
   also signs admins out. Password changes take effect on restart.

For production, mount durable storage and set `DATA_DIR` to its absolute path
(for example `/var/lib/teecake`). Before the first start using that path, copy
all existing `data/` contents, including `uploads/` and both JSON state files,
into it. Back up the entire directory off the hosting machine regularly.
Uploads are acknowledged only after they are written there. State updates use
atomic file replacement and retain the previous valid snapshot as a backup.
The app no longer rewrites source code when someone saves site content.

A container's ordinary filesystem, `public/`, and `dist/` are not durable
storage. On hosts with disposable instances, such as Cloud Run, a persistent
volume or a separate durable storage integration is required; setting a path
alone does not make that disk persistent. Serve this application through the
Express server (`npm start`), since a static-only deployment cannot authenticate
admins or save uploads.

This filesystem implementation supports **one running server instance**. Multiple
instances need shared transactional storage and a shared session store before
scaling. Serve production over HTTPS. Set `TRUST_PROXY=1` only when the server is
behind one trusted reverse proxy so secure session cookies work through HTTPS.
Admin emails, passwords, and session tokens are never included in public state.

Run `npm test`, `npm run lint`, and `npm run build` to verify changes. The API
tests use real Express middleware with in-memory HTTP streams, so they do not
need permission to open local network ports.
