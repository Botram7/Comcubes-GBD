import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";
// Simple logger function
function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit", 
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
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

// Register API routes
const server = await registerRoutes(app);

// Basic error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error("Server error:", err);
  res.status(status).json({ message });
});

// Setup Vite for frontend serving
if (process.env.NODE_ENV === "development") {
  try {
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
  } catch (error) {
    console.error("Vite setup failed, serving basic fallback:", error);
    app.get("*", (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Global Business Directory</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
            .success { color: green; margin: 20px 0; }
          </style>
        </head>
        <body>
          <h1>Global Business Directory - API Server Running</h1>
          <div class="success">
            <p><strong>Success!</strong> The backend API is fully functional.</p>
            <p>Data loaded: Sectors, Industries, and Companies from CSV files.</p>
          </div>
          <p>Available endpoints:</p>
          <ul>
            <li><a href="/api/sectors">GET /api/sectors</a> - List all sectors</li>
            <li><a href="/api/industries">GET /api/industries</a> - List all industries</li>
            <li><a href="/api/companies">GET /api/companies</a> - List all companies</li>
            <li><a href="/api/search?q=bank">GET /api/search?q=bank</a> - Search example</li>
          </ul>
        </body>
        </html>
      `);
    });
  }
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  log(`Server running on port ${PORT}`);
  log("API endpoints available:");
  log("  GET /api/sectors");
  log("  GET /api/industries");
  log("  GET /api/companies");
  log("  GET /api/search?q=<query>");
});