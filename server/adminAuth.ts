import { Request, Response, NextFunction } from 'express';
import session from 'express-session';

// Extend the session interface to include isAdminAuthenticated
declare module 'express-session' {
  interface SessionData {
    isAdminAuthenticated?: boolean;
  }
}

// Session configuration for admin authentication
export const adminSessionConfig = session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  name: 'comcubes_admin_session',
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  },
});

// Middleware to check if admin is authenticated
export const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.session?.isAdminAuthenticated) {
    return next();
  }
  
  // For API routes, return 401
  if (req.path.startsWith('/api/admin')) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }
  
  // For other admin routes, redirect to login
  return res.redirect('/admin/login');
};

// Function to validate admin credentials
export const validateAdminCredentials = (username: string, password: string): boolean => {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  console.log('Validating credentials for username:', username);
  console.log('Expected username:', adminUsername);
  console.log('Username match:', username === adminUsername);
  console.log('Password provided:', !!password);
  console.log('Expected password exists:', !!adminPassword);
  
  if (!adminUsername || !adminPassword) {
    console.error('Admin credentials not configured in environment variables');
    return false;
  }
  
  const isValid = username === adminUsername && password === adminPassword;
  console.log('Credentials valid:', isValid);
  return isValid;
};