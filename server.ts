import 'dotenv/config';
import express from "express";
import * as path from "path";
import * as fs from "fs";
import * as crypto from "crypto";

async function startServer() {
  const app = express();

  // Allow up to 50MB for high-resolution dish pictures and base64 images
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  if (process.env.TRUST_PROXY === '1') app.set('trust proxy', 1);

  // Reject browser writes originating from a different site.
  app.use('/api', (req, res, next) => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.headers.origin) {
      try {
        if (new URL(req.headers.origin).host !== req.get('host')) {
          return res.status(403).json({ error: 'Cross-site changes are not allowed' });
        }
      } catch { return res.status(403).json({ error: 'Invalid origin' }); }
    }
    next();
  });

  const configuredAdmins = [1, 2].map(index => ({
    email: (process.env[`ADMIN_${index}_EMAIL`] || '').trim().toLowerCase(),
    password: process.env[`ADMIN_${index}_PASSWORD`] || '',
  }));
  const adminsReady = configuredAdmins.every(admin => admin.email && admin.password.length >= 12)
    && configuredAdmins[0].email !== configuredAdmins[1].email;
  const salt = crypto.randomBytes(32);
  const admins = adminsReady ? configuredAdmins.map(admin => ({
    email: admin.email, hash: crypto.scryptSync(admin.password, salt, 64),
  })) : [];
  const sessions = new Map<string, { email: string; expires: number }>();
  const attempts = new Map<string, { count: number; expires: number }>();
  const ttl = 12 * 60 * 60 * 1000;
  const cookieName = 'teecake_admin';
  function tokenFor(req: express.Request) {
    return (req.headers.cookie || '').split(';').map(part => part.trim())
      .find(part => part.startsWith(cookieName + '='))?.slice(cookieName.length + 1) || '';
  }
  function sessionFor(req: express.Request) {
    const token = tokenFor(req);
    const session = sessions.get(token);
    if (!session || session.expires <= Date.now()) {
      sessions.delete(token);
      return null;
    }
    return session;
  }
  app.get('/api/auth/session', (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const session = sessionFor(req);
    return res.json({ isAdmin: Boolean(session), email: session?.email || null });
  });
  app.post('/api/auth/login', (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    if (!adminsReady) return res.status(503).json({ error: 'Admin accounts have not been configured yet.' });
    const now = Date.now();
    for (const [ip, value] of attempts) if (value.expires <= now) attempts.delete(ip);
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const attempt = attempts.get(ip) || { count: 0, expires: now + 15 * 60 * 1000 };
    if (attempt.count >= 10 || attempts.size > 10000) return res.status(429).json({ error: 'Too many login attempts. Try again in 15 minutes.' });
    attempt.count++; attempts.set(ip, attempt);
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (password.length > 1024) return res.status(401).json({ error: 'Incorrect email or password.' });
    const hash = crypto.scryptSync(password, salt, 64);
    const admin = admins.find(candidate => candidate.email === email && crypto.timingSafeEqual(hash, candidate.hash));
    if (!admin) return res.status(401).json({ error: 'Incorrect email or password.' });
    for (const [token, session] of sessions) if (session.expires <= now) sessions.delete(token);
    sessions.delete(tokenFor(req));
    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, { email: admin.email, expires: now + ttl });
    res.cookie(cookieName, token, { httpOnly: true, sameSite: 'strict', secure: req.secure, maxAge: ttl, path: '/' });
    return res.json({ success: true, email: admin.email });
  });
  app.post('/api/auth/logout', (req, res) => {
    sessions.delete(tokenFor(req));
    res.clearCookie(cookieName, { httpOnly: true, sameSite: 'strict', secure: req.secure, path: '/' });
    return res.json({ success: true });
  });
  app.use('/api', (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    if (!sessionFor(req)) return res.status(401).json({ error: 'Admin login required.' });
    next();
  });

  // Determine production vs development mode early
  const distPath = path.join(process.cwd(), "dist");
  const isStartScript = process.env.npm_lifecycle_event === "start";
  const isDevScript = process.env.npm_lifecycle_event === "dev";
  const hasDist = fs.existsSync(distPath) && fs.existsSync(path.join(distPath, "index.html"));
  const isProduction = isStartScript || process.env.NODE_ENV === "production" || (!isDevScript && hasDist);

  // Persistent storage directories for cross-device shared synchronization
  const dataDir = path.resolve(process.env.DATA_DIR || path.join(process.cwd(), "data"));
  const dataFilePath = path.join(dataDir, "shared-app-state.json");
  const publicUploadsDir = path.join(process.cwd(), "public", "uploads");
  const dataUploadsDir = path.join(dataDir, "uploads");
  const distUploadsDir = path.join(process.cwd(), "dist", "uploads");
  const allUploadDirs = [dataUploadsDir, publicUploadsDir, distUploadsDir];

  allUploadDirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch (e) {
        console.warn("Could not create directory:", dir, e);
      }
    }
  });

  // Direct multi-directory static resolver with automatic cross-directory syncing
  app.use("/uploads", (req, res, next) => {
    try {
      const requestedFile = path.basename(req.path);
      if (!requestedFile || requestedFile === "/" || requestedFile === ".") {
        return next();
      }

      for (const dir of allUploadDirs) {
        const full = path.join(dir, requestedFile);
        if (fs.existsSync(full) && fs.statSync(full).isFile()) {
          const authoritative = path.join(dataUploadsDir, requestedFile);
          if (dir !== dataUploadsDir && !fs.existsSync(authoritative)) {
            try { atomicWrite(authoritative, fs.readFileSync(full)); } catch (error) { console.warn('Could not migrate legacy upload:', requestedFile); }
          }
          res.type(path.extname(requestedFile));
          res.setHeader('X-Content-Type-Options', 'nosniff');
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
          res.setHeader("Pragma", "no-cache");
          res.setHeader("Expires", "0");
          return res.sendFile(full);
        }
      }
      // If not directly found by exact filename, check self-healing fallback
      next();
    } catch (e) {
      next();
    }
  });

  // If an uploaded image file is missing, return 404 without copying or duplicating files on disk
  app.use("/uploads", (req, res) => {
    res.status(404).type("text/plain").send("Upload not found");
  });

  // Helper to extract base64 images into physical files on disk
  function extractAndSaveBase64(dataUri: string, prefix = 'media'): string {
    if (!dataUri || typeof dataUri !== 'string') return dataUri;
    if (!dataUri.startsWith('data:image/')) return dataUri;

    const match = dataUri.match(/^data:image\/(png|jpeg|jpg|webp|gif|avif);base64,([A-Za-z0-9+/]+={0,2})$/);
    if (!match) throw new Error('Unsupported or invalid image data');
    const buffer = Buffer.from(match[2], 'base64');
    if (!buffer.length || buffer.toString('base64') !== match[2]) throw new Error('Invalid image encoding');
    const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
    const contentHash = crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 24);
    const safePrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 60) || 'media';
    const filename = `${safePrefix}_${contentHash}.${ext}`;
    // A URL is acknowledged only after the authoritative write succeeds.
    atomicWrite(path.join(dataUploadsDir, filename), buffer);
    return `/uploads/${filename}`;
  }

  function atomicWrite(destination: string, content: string | Buffer) {
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    const temporary = `${destination}.${crypto.randomUUID()}.tmp`;
    try {
      fs.writeFileSync(temporary, content, { flag: 'wx', flush: true });
      fs.renameSync(temporary, destination);
    } finally {
      if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
    }
  }

  // Health check endpoints for Cloud Run / GCP liveliness & readiness probes
  app.get(["/api/health", "/healthz", "/_health"], (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  // Dedicated direct image upload endpoint
  app.post("/api/upload", (req, res) => {
    try {
      const { dataUrl, filename } = req.body || {};
      if (typeof dataUrl !== 'string' || !/^data:image\/(png|jpeg|jpg|webp|gif|avif);base64,[A-Za-z0-9+/]+={0,2}$/.test(dataUrl)) {
        return res.status(400).json({ error: "Missing dataUrl" });
      }
      let cleanPrefix = 'dish';
      if (filename && typeof filename === 'string') {
        const parsed = path.parse(filename).name.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 45);
        cleanPrefix = parsed.startsWith('dish_') ? parsed : `dish_${parsed}`;
      }
      const savedUrl = extractAndSaveBase64(dataUrl, cleanPrefix);
      return res.json({ success: true, url: savedUrl });
    } catch (err) {
      console.error("Error in /api/upload:", err);
      return res.status(500).json({ error: "Upload failed" });
    }
  });

  const DEFAULT_LIBRARY_PRESETS = [
    {
      id: 'preset-charlotte',
      title: 'Strawberry Rose Charlotte',
      category: 'Cakes & TeaCakes',
      url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'preset-chocolate',
      title: 'Triple Valrhona Ganache',
      category: 'Cakes & TeaCakes',
      url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'preset-pistachio-tart',
      title: 'Pistachio Raspberry Tart',
      category: 'Tarts & Pies',
      url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'preset-croissant',
      title: 'Flaky Golden Croissant',
      category: 'Artisan Breads',
      url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'preset-macarons',
      title: 'Parisian Macarons Tower',
      category: 'Macarons & Petite Treats',
      url: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'preset-cupcake',
      title: 'Madagascar Vanilla Cupcake',
      category: 'Cakes & TeaCakes',
      url: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'preset-sourdough',
      title: 'Rustic Sourdough Boule',
      category: 'Artisan Breads',
      url: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'preset-lemon-meringue',
      title: 'Meyer Lemon Meringue Tartlet',
      category: 'Tarts & Pies',
      url: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'preset-rose-cake',
      title: 'Rosewater Lychee Tea Cake',
      category: 'Cakes & TeaCakes',
      url: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'preset-pecan-tart',
      title: 'Salted Caramel Pecan Tart',
      category: 'Tarts & Pies',
      url: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'preset-danish',
      title: 'Wild Blueberry Cream Danish',
      category: 'Artisan Breads',
      url: 'https://images.unsplash.com/photo-1549520018-d7318ff02a9c?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'preset-opera',
      title: 'Matcha Espresso Opera Cake',
      category: 'Cakes & TeaCakes',
      url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'preset-redvelvet',
      title: 'Velvet Truffle Swirl Cake',
      category: 'Cakes & TeaCakes',
      url: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'preset-galette',
      title: 'Almond Peach Rustic Galette',
      category: 'Tarts & Pies',
      url: 'https://images.unsplash.com/photo-1562440499-64c9a111f713?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'preset-hazelnut',
      title: 'Dark Chocolate Hazelnut Crunch',
      category: 'Cakes & TeaCakes',
      url: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'preset-focaccia',
      title: 'Artisan Herb & Olive Focaccia',
      category: 'Savory Creations',
      url: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=800&q=80',
    },
  ];

  function getSavedState(): any {
    let found = false;
    for (const file of [dataFilePath, path.join(dataDir, 'shared-app-state.backup.json')]) {
      if (!fs.existsSync(file)) continue;
      found = true;
      try {
        const value = JSON.parse(fs.readFileSync(file, 'utf8'));
        if (value && typeof value === 'object' && !Array.isArray(value)) return value;
      } catch (error) { console.warn('Could not read saved state:', file); }
    }
    if (found) throw new Error('Saved state and backup are unreadable; refusing to overwrite them');
    return {};
  }

  function saveStateDirect(state: any) {
    const previous = getSavedState();
    state.stateRevision ||= previous.stateRevision || previous.serverSavedAt || crypto.randomUUID();
    const backup = Object.keys(previous).length ? previous : state;
    atomicWrite(path.join(dataDir, 'shared-app-state.backup.json'), JSON.stringify(backup, null, 2));
    atomicWrite(dataFilePath, JSON.stringify(state, null, 2));
  }

  function stateScript(state: any) {
    const json = JSON.stringify(state).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
    return `<script id="server-app-state">window.__SERVER_APP_STATE__ = ${json};</script>`;
  }

  // Pastry Library API: GET all photos (presets + user uploads)
  app.get("/api/library-photos", (_req, res) => {
    try {
      const state = getSavedState();
      const photos = Array.isArray(state.libraryPhotos)
        ? state.libraryPhotos
        : DEFAULT_LIBRARY_PRESETS;
      return res.json({ success: true, photos });
    } catch (err) {
      console.error("Error fetching library photos:", err);
      return res.status(500).json({ error: "Failed to fetch library photos" });
    }
  });

  // Pastry Library API: POST new photo(s) to library
  app.post("/api/library-photos", (req, res) => {
    try {
      const { photo, photos, dataUrl, title, category } = req.body || {};
      const state = getSavedState();
      let currentPhotos: any[] = Array.isArray(state.libraryPhotos)
        ? [...state.libraryPhotos]
        : [...DEFAULT_LIBRARY_PRESETS];

      const toAdd: any[] = [];

      if (Array.isArray(photos)) {
        photos.forEach((p, idx) => {
          let url = p.url;
          if (url && typeof url === 'string' && url.startsWith('data:image/')) {
            url = extractAndSaveBase64(url, `lib_${p.id || idx}`);
          }
          toAdd.push({
            id: p.id || `lib-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            title: p.title || 'Pastry Photo',
            category: p.category || 'Custom Uploads',
            url,
            isCustom: true,
            addedAt: p.addedAt || Date.now(),
          });
        });
      } else if (photo) {
        let url = photo.url;
        if (url && typeof url === 'string' && url.startsWith('data:image/')) {
          url = extractAndSaveBase64(url, `lib_${photo.id || 'new'}`);
        }
        toAdd.push({
          id: photo.id || `lib-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          title: photo.title || 'Pastry Photo',
          category: photo.category || 'Custom Uploads',
          url,
          isCustom: true,
          addedAt: photo.addedAt || Date.now(),
        });
      } else if (dataUrl) {
        const savedUrl = extractAndSaveBase64(dataUrl, 'lib');
        toAdd.push({
          id: `lib-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          title: title || 'Custom Pastry Photo',
          category: category || 'Custom Uploads',
          url: savedUrl,
          isCustom: true,
          addedAt: Date.now(),
        });
      }

      if (toAdd.length === 0) {
        return res.status(400).json({ error: "No photo provided to add" });
      }

      // Add to front of list
      currentPhotos = [...toAdd, ...currentPhotos];
      state.libraryPhotos = currentPhotos;
      state.serverSavedAt = new Date().toISOString();
      saveStateDirect(state);

      return res.json({ success: true, added: toAdd, photos: currentPhotos });
    } catch (err) {
      console.error("Error adding to library:", err);
      return res.status(500).json({ error: "Failed to add photo to library" });
    }
  });

  // Pastry Library API: DELETE photo from library by ID
  app.delete("/api/library-photos/:id", (req, res) => {
    try {
      const { id } = req.params;
      const state = getSavedState();
      let currentPhotos: any[] = Array.isArray(state.libraryPhotos)
        ? [...state.libraryPhotos]
        : [...DEFAULT_LIBRARY_PRESETS];

      currentPhotos = currentPhotos.filter((p) => p.id !== id);
      state.libraryPhotos = currentPhotos;
      state.serverSavedAt = new Date().toISOString();
      saveStateDirect(state);

      return res.json({ success: true, deletedId: id, photos: currentPhotos });
    } catch (err) {
      console.error("Error deleting photo from library:", err);
      return res.status(500).json({ error: "Failed to delete photo from library" });
    }
  });

  // Pastry Library API: RESET to default presets
  app.post("/api/library-photos/reset", (_req, res) => {
    try {
      const state = getSavedState();
      state.libraryPhotos = [...DEFAULT_LIBRARY_PRESETS];
      state.serverSavedAt = new Date().toISOString();
      saveStateDirect(state);
      return res.json({ success: true, photos: DEFAULT_LIBRARY_PRESETS });
    } catch (err) {
      console.error("Error resetting library:", err);
      return res.status(500).json({ error: "Failed to reset library" });
    }
  });

  // Shared Data API: GET server-synchronized app state
  app.get("/api/app-data", (_req, res) => {
    try {
      const state = getSavedState();
      res.setHeader('Cache-Control', 'no-store');
      return res.json({ exists: Object.keys(state).length > 0, data: state });
    } catch (err) {
      console.error("Error reading shared data:", err);
      return res.status(500).json({ error: "Failed to read shared app state" });
    }
  });

  // Shared Data API: POST server-synchronized app state
  app.post("/api/app-data", (req, res) => {
    try {
      const payload = req.body;
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        return res.status(400).json({ error: "Invalid payload" });
      }

      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      const prevState = getSavedState();
      const expectedRevision = req.get('if-match');
      if (expectedRevision && expectedRevision !== (prevState.stateRevision || prevState.serverSavedAt || 'new')) {
        return res.status(409).json({ error: 'The website changed in another session. Reload before saving again.' });
      }

      const stateToSave: any = {
        ...prevState,
        ...payload,
        serverSavedAt: new Date().toISOString(),
      };

      // Deep merge backdropSettings so customUploadedImages and selectedWallpaperIds are preserved
      if (prevState.backdropSettings && payload.backdropSettings) {
        stateToSave.backdropSettings = {
          ...prevState.backdropSettings,
          ...payload.backdropSettings,
          customUploadedImages: Array.isArray(payload.backdropSettings.customUploadedImages)
            ? payload.backdropSettings.customUploadedImages
            : (prevState.backdropSettings.customUploadedImages || []),
          selectedWallpaperIds: Array.isArray(payload.backdropSettings.selectedWallpaperIds)
            ? payload.backdropSettings.selectedWallpaperIds
            : (prevState.backdropSettings.selectedWallpaperIds || []),
        };
      }

      // 1. Sanitize & extract images in items
      if (Array.isArray(stateToSave.items)) {
        stateToSave.items = stateToSave.items.map((item: any, idx: number) => {
          if (item && item.image && typeof item.image === 'string' && item.image.startsWith('data:image/')) {
            return {
              ...item,
              image: extractAndSaveBase64(item.image, `dish_${item.id || idx}`),
            };
          }
          return item;
        });
      }

      // 2. Sanitize & extract custom logo
      if (stateToSave.customLogoUrl && typeof stateToSave.customLogoUrl === 'string' && stateToSave.customLogoUrl.startsWith('data:image/')) {
        stateToSave.customLogoUrl = extractAndSaveBase64(stateToSave.customLogoUrl, 'logo');
      }

      // 3. Sanitize & extract backdrop images
      if (stateToSave.backdropSettings && typeof stateToSave.backdropSettings === 'object') {
        if (stateToSave.backdropSettings.imageUrl && typeof stateToSave.backdropSettings.imageUrl === 'string' && stateToSave.backdropSettings.imageUrl.startsWith('data:image/')) {
          stateToSave.backdropSettings.imageUrl = extractAndSaveBase64(stateToSave.backdropSettings.imageUrl, 'bg_active');
        }
        if (Array.isArray(stateToSave.backdropSettings.customUploadedImages)) {
          stateToSave.backdropSettings.customUploadedImages = stateToSave.backdropSettings.customUploadedImages.map((c: any, cIdx: number) => {
            if (c && c.imageUrl && typeof c.imageUrl === 'string' && c.imageUrl.startsWith('data:image/')) {
              return {
                ...c,
                imageUrl: extractAndSaveBase64(c.imageUrl, `bg_custom_${c.id || cIdx}`),
              };
            }
            return c;
          });
        }
      }

      // 4. Sanitize & extract pastry library photos
      if (Array.isArray(stateToSave.libraryPhotos)) {
        stateToSave.libraryPhotos = stateToSave.libraryPhotos.map((photo: any, pIdx: number) => {
          if (photo && photo.url && typeof photo.url === 'string' && photo.url.startsWith('data:image/')) {
            return {
              ...photo,
              url: extractAndSaveBase64(photo.url, `lib_${photo.id || pIdx}`),
            };
          }
          return photo;
        });
      }

      stateToSave.stateRevision = crypto.randomUUID();
      saveStateDirect(stateToSave);

      return res.json({ success: true, savedAt: stateToSave.serverSavedAt, data: stateToSave });
    } catch (err) {
      console.error("Error saving shared data:", err);
      return res.status(500).json({ error: "Failed to persist shared app state" });
    }
  });

  // Helper to serve index.html with latest server state dynamically injected
  function serveInjectedIndexHtml(filePath: string, res: express.Response) {
    try {
      if (!fs.existsSync(filePath)) {
        return res.status(200).send("<!doctype html><html><head><title>TeeCake Creations</title></head><body><div id='root'>Loading...</div></body></html>");
      }
      let html = fs.readFileSync(filePath, "utf-8");
      if (fs.existsSync(dataFilePath)) {
        const rawState = fs.readFileSync(dataFilePath, "utf-8");
        const script = stateScript(getSavedState());
        if (html.includes('<script id="server-app-state">')) {
          html = html.replace(/<script id="server-app-state">[\s\S]*?<\/script>/, script);
        } else {
          html = html.replace('</head>', `  ${script}\n</head>`);
        }
      }
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      return res.send(html);
    } catch (e) {
      console.error("Error serving injected index.html:", e);
      return res.sendFile(filePath);
    }
  }

  if (isProduction) {
    app.use(express.static(distPath, { index: false }));
    app.get("*", (req, res) => {
      // Do not handle uploads or assets with index.html
      if (req.path.startsWith("/uploads/") || req.path.startsWith("/assets/")) {
        return res.status(404).send("Not found");
      }
      const indexPath = path.join(distPath, "index.html");
      return serveInjectedIndexHtml(indexPath, res);
    });
  } else {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true, allowedHosts: true },
        appType: "spa",
      });

      // Intercept HTML page requests in dev mode to inject window.__SERVER_APP_STATE__
      app.use(async (req, res, next) => {
        const isHtml = req.method === "GET" && (req.headers.accept?.includes("text/html") || req.path === "/" || req.path === "/index.html");
        if (isHtml && !req.path.startsWith("/api/") && !req.path.startsWith("/uploads/")) {
          try {
            const template = fs.readFileSync(path.join(process.cwd(), "index.html"), "utf-8");
            let html = await vite.transformIndexHtml(req.originalUrl || "/", template);
            if (fs.existsSync(dataFilePath)) {
              const rawState = fs.readFileSync(dataFilePath, "utf-8");
              const script = stateScript(getSavedState());
              if (html.includes('<script id="server-app-state">')) {
                html = html.replace(/<script id="server-app-state">[\s\S]*?<\/script>/, script);
              } else {
                html = html.replace('</head>', `  ${script}\n</head>`);
              }
            }
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            return res.status(200).send(html);
          } catch (e) {
            return next(e);
          }
        }
        next();
      });

      app.use(vite.middlewares);
    } catch (err) {
      console.warn("Could not start Vite dev middleware, falling back to static files:", err);
      app.use(express.static(distPath, { index: false }));
      app.get("*", (_req, res) => serveInjectedIndexHtml(path.join(distPath, "index.html"), res));
    }
  }

  // Determine port: In AI Studio / Cloud Run, Nginx reverse-proxies port 8080 to internal port 3000.
  // Determine port:
  // In development container, Nginx reverse-proxies NGINX_PORT (8080) to internal port 3000 (DEFAULT_APP_PORT).
  // In production Cloud Run (Shared App), there is no Nginx: Cloud Run sends traffic directly to process.env.PORT (typically 8080).
  const portArgIndex = process.argv.indexOf("--port");
  const cliPort = portArgIndex !== -1 && process.argv[portArgIndex + 1] ? parseInt(process.argv[portArgIndex + 1], 10) : NaN;

  let PORT = 3000;
  if (!isNaN(cliPort)) {
    PORT = cliPort;
  } else if (process.env.APP_PORT) {
    PORT = parseInt(process.env.APP_PORT, 10);
  } else if (process.env.NGINX_PORT) {
    // Development container with Nginx on port 8080 -> App must listen on internal port 3000
    PORT = parseInt(process.env.DEFAULT_APP_PORT || "3000", 10);
  } else if (process.env.PORT) {
    // Production Cloud Run (Shared App URL) -> App must listen on process.env.PORT (8080)
    PORT = parseInt(process.env.PORT, 10);
  } else {
    PORT = 3000;
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT} (production: ${isProduction})`);
  });

  // If in production and PORT is not 3000, also bind 3000 so any internal health checks or proxies succeed
  let secondaryServer: any = null;
  if (PORT !== 3000 && !process.env.NGINX_PORT) {
    try {
      secondaryServer = app.listen(3000, "0.0.0.0", () => {
        console.log(`Secondary listener active on http://0.0.0.0:3000`);
      });
      secondaryServer.on("error", (e: any) => {
        console.log("Secondary port 3000 not bound:", e.message);
      });
    } catch (e) {}
  }

  const shutdown = () => {
    server.close(() => {
      if (secondaryServer) {
        secondaryServer.close(() => process.exit(0));
      } else {
        process.exit(0);
      }
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
