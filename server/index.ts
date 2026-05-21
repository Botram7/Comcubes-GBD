import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import fs from "fs";
import path from "path";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { adminSessionConfig, requireAdminAuth, validateAdminCredentials } from "./adminAuth";
import { initDatabaseOnce } from "./init";

const app = express();

// Railway sits behind a proxy - trust it
app.set('trust proxy', 1);

app.use(compression({
  filter: (req: Request, res: Response) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
  threshold: 1024,
  level: 6,
}));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://pagead2.googlesyndication.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "https://pagead2.googlesyndication.com",
        "https://*.googlesyndication.com",
        "https://adservice.google.com",
        "https://*.adservice.google.com",
        "https://googleads.g.doubleclick.net",
        "https://*.doubleclick.net",
        "https://partner.googleadservices.com",
        "https://www.googleadservices.com",
        "https://tpc.googlesyndication.com",
        "https://www.googletagmanager.com",
        "https://*.googletagmanager.com",
        "https://www.google-analytics.com",
        "https://ssl.google-analytics.com",
        "https://*.google-analytics.com",
        "https://analytics.google.com",
        "https://*.analytics.google.com",
        "https://www.clarity.ms",
        "https://*.clarity.ms",
        "https://challenges.cloudflare.com",
        "https://*.cloudflare.com"
      ],
      connectSrc: [
        "'self'",
        "https://api.paystack.co",
        "https://www.googleapis.com",
        "ws://localhost:*",
        "https://pagead2.googlesyndication.com",
        "https://*.googlesyndication.com",
        "https://adservice.google.com",
        "https://*.adservice.google.com",
        "https://googleads.g.doubleclick.net",
        "https://*.doubleclick.net",
        "https://partner.googleadservices.com",
        "https://www.google-analytics.com",
        "https://*.google-analytics.com",
        "https://analytics.google.com",
        "https://*.analytics.google.com",
        "https://stats.g.doubleclick.net",
        "https://*.g.doubleclick.net",
        "https://www.googletagmanager.com",
        "https://*.googletagmanager.com",
        "https://www.clarity.ms",
        "https://*.clarity.ms",
        "https://challenges.cloudflare.com",
        "https://*.cloudflare.com"
      ],
      frameSrc: [
        "'self'",
        "https://pagead2.googlesyndication.com",
        "https://*.googlesyndication.com",
        "https://googleads.g.doubleclick.net",
        "https://tpc.googlesyndication.com",
        "https://*.google.com",
        "https://*.doubleclick.net",
        "https://challenges.cloudflare.com",
        "https://ep1.adtrafficquality.google",
        "https://ep2.adtrafficquality.google"
      ],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      manifestSrc: ["'self'"],
      workerSrc: ["'self'", "blob:"]
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  frameguard: false,
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many admin requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.session?.isAdminAuthenticated === true,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/admin', adminLimiter);
app.use(['/admin/login', '/api/auth'], authLimiter);
app.use((req, res, next) => {
  if (req.path === '/admin' || (req.path.startsWith('/admin/') && !req.path.startsWith('/admin/login'))) {
    return next();
  }
  return generalLimiter(req, res, next);
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(adminSessionConfig);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) logLine = logLine.slice(0, 79) + "…";
      log(logLine);
    }
  });
  next();
});

app.use((req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'production') {
    const path = req.path;
    if (path.match(/\.(css|js|mjs|woff2?|ttf|otf)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (path.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|pdf)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    } else if (path.match(/\.(html?)$/) || path === '/' || !path.includes('.')) {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    }
  }
  next();
});

(async () => {
  app.get('/admin/login', (req, res) => {
    if (req.session?.isAdminAuthenticated) return res.redirect('/admin');
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Login - COMCUBES</title>
        <style>
          body { font-family: 'Segoe UI', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
          .login-container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); width: 100%; max-width: 400px; }
          .logo { text-align: center; margin-bottom: 30px; }
          .logo h1 { color: #333; margin: 0; font-size: 28px; font-weight: 600; }
          .logo p { color: #666; margin: 5px 0 0; font-size: 14px; }
          .form-group { margin-bottom: 20px; }
          label { display: block; margin-bottom: 5px; color: #333; font-weight: 500; }
          input[type="text"], input[type="password"] { width: 100%; padding: 12px; border: 2px solid #e1e5e9; border-radius: 6px; font-size: 16px; box-sizing: border-box; transition: border-color 0.3s; }
          input:focus { outline: none; border-color: #667eea; }
          .login-btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; border: none; border-radius: 6px; font-size: 16px; font-weight: 600; cursor: pointer; width: 100%; }
          .error { background: #fee; color: #c33; padding: 10px; border-radius: 6px; margin-bottom: 20px; border: 1px solid #fcc; }
        </style>
      </head>
      <body>
        <div class="login-container">
          <div class="logo"><h1>COMCUBES</h1><p>Admin Dashboard Login</p></div>
          ${req.query.error ? '<div class="error">Invalid username or password</div>' : ''}
          <form method="POST" action="/admin/login" enctype="application/x-www-form-urlencoded">
            <div class="form-group"><label for="username">Username:</label><input type="text" id="username" name="username" autocomplete="username" required></div>
            <div class="form-group"><label for="password">Password:</label><input type="password" id="password" name="password" autocomplete="current-password" required></div>
            <button type="submit" class="login-btn">Login</button>
          </form>
        </div>
      </body>
      </html>
    `);
  });

  app.post('/admin/login', async (req, res) => {
    const { username, password } = req.body;
    try {
      if (await validateAdminCredentials(username, password)) {
        req.session!.isAdminAuthenticated = true;
        res.redirect('/admin');
      } else {
        res.redirect('/admin/login?error=1');
      }
    } catch (error) {
      console.error('Admin login error occurred');
      res.redirect('/admin/login?error=1');
    }
  });

  app.get('/admin/logout', (req, res) => {
    req.session?.destroy((err) => {
      if (err) console.error('Error destroying session:', err);
      res.redirect('/admin/login');
    });
  });

  try {
    await initDatabaseOnce();
  } catch (dbError) {
    console.error('⚠️ Database initialization failed - app will start but some features may be unavailable:', dbError);
  }

  const server = await registerRoutes(app);

  // Apple Pay domain verification
  let applePayVerificationFile: Buffer | null = null;
  try {
    const filePath = path.join(process.cwd(), 'public', '.well-known', 'apple-developer-merchantid-domain-association');
    applePayVerificationFile = fs.readFileSync(filePath);
    log('✅ Apple Pay domain verification file loaded successfully');
  } catch (error) {
    log('⚠️  Apple Pay verification file not found - Apple Pay will not be available');
  }

  app.get('/.well-known/apple-developer-merchantid-domain-association', (req, res) => {
    if (!applePayVerificationFile) {
      return res.status(404).send('Apple Pay verification file not found');
    }
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Length', applePayVerificationFile.length.toString());
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(applePayVerificationFile);
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Railway assigns PORT dynamically - respect it
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({ port, host: "0.0.0.0" }, () => {
    log(`serving on port ${port}`);
  });
})();
