import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { adminSessionConfig, requireAdminAuth, validateAdminCredentials } from "./adminAuth";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add session middleware for admin authentication
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

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Admin authentication routes
  app.get('/admin/login', (req, res) => {
    if (req.session?.isAdminAuthenticated) {
      return res.redirect('/admin');
    }
    
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Login - COMCUBES</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .login-container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 400px;
          }
          .logo {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo h1 {
            color: #333;
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .logo p {
            color: #666;
            margin: 5px 0 0 0;
            font-size: 14px;
          }
          .form-group {
            margin-bottom: 20px;
          }
          label {
            display: block;
            margin-bottom: 5px;
            color: #333;
            font-weight: 500;
          }
          input[type="text"], input[type="password"] {
            width: 100%;
            padding: 12px;
            border: 2px solid #e1e5e9;
            border-radius: 6px;
            font-size: 16px;
            transition: border-color 0.3s;
            box-sizing: border-box;
          }
          input[type="text"]:focus, input[type="password"]:focus {
            outline: none;
            border-color: #667eea;
          }
          .login-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            transition: transform 0.2s;
          }
          .login-btn:hover {
            transform: translateY(-1px);
          }
          .error {
            background: #fee;
            color: #c33;
            padding: 10px;
            border-radius: 6px;
            margin-bottom: 20px;
            border: 1px solid #fcc;
          }
        </style>
      </head>
      <body>
        <div class="login-container">
          <div class="logo">
            <h1>COMCUBES</h1>
            <p>Admin Dashboard Login</p>
          </div>
          ${req.query.error ? '<div class="error">Invalid username or password</div>' : ''}
          <form method="POST" action="/admin/login" enctype="application/x-www-form-urlencoded">
            <div class="form-group">
              <label for="username">Username:</label>
              <input type="text" id="username" name="username" value="" autocomplete="username" required>
            </div>
            <div class="form-group">
              <label for="password">Password:</label>
              <input type="password" id="password" name="password" value="" autocomplete="current-password" required>
            </div>
            <button type="submit" class="login-btn">Login</button>
          </form>
        </div>
      </body>
      </html>
    `);
  });

  app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    console.log('Login attempt - Body:', req.body);
    console.log('Login attempt - Username:', username);
    console.log('Login attempt - Session before:', req.session?.isAdminAuthenticated);
    
    if (validateAdminCredentials(username, password)) {
      req.session!.isAdminAuthenticated = true;
      console.log('Login successful - Session after:', req.session?.isAdminAuthenticated);
      res.redirect('/admin');
    } else {
      console.log('Login failed - Invalid credentials');
      res.redirect('/admin/login?error=1');
    }
  });

  app.get('/admin/logout', (req, res) => {
    req.session?.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
      res.redirect('/admin/login');
    });
  });

  // Admin dashboard is now handled by React at /admin route

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
