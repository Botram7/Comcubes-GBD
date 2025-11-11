import { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import bcrypt from 'bcrypt';
import connectPg from 'connect-pg-simple';

// Extend the session interface to include isAdminAuthenticated
declare module 'express-session' {
  interface SessionData {
    isAdminAuthenticated?: boolean;
  }
}

/**
 * Security Configuration Helper
 * Use this to generate secure session configuration
 */
const getSecureSessionConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const pgStore = connectPg(session);
  
  return {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    name: 'comcubes_admin_session',
    store: new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
      ttl: 24 * 60 * 60, // 24 hours in seconds
      tableName: 'admin_sessions',
    }),
    cookie: {
      secure: isProduction, // Only use HTTPS in production
      httpOnly: true, // Prevent XSS attacks
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax' as const, // CSRF protection
      domain: isProduction ? process.env.DOMAIN : undefined, // Set domain in production
    },
  };
};

// Session configuration for admin authentication
export const adminSessionConfig = session(getSecureSessionConfig());

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

/**
 * Enhanced admin credential validation with secure password hashing
 * For production use, store password hash in environment variable
 */
export const validateAdminCredentials = async (username: string, password: string): Promise<boolean> => {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminUsername || !adminPassword) {
    console.error('Admin credentials not configured in environment variables');
    return false;
  }
  
  // Username validation
  if (username !== adminUsername) {
    return false;
  }
  
  // For development, check if password is already hashed (starts with $2b$ for bcrypt)
  if (adminPassword.startsWith('$2b$')) {
    // Compare with hashed password
    try {
      return await bcrypt.compare(password, adminPassword);
    } catch (error) {
      console.error('Error validating admin credentials');
      return false;
    }
  } else {
    // Fallback for plain text passwords (development only)
    // In production, this should be removed and only hashed passwords used
    if (process.env.NODE_ENV === 'production') {
      console.error('Plain text admin password detected in production - this is insecure!');
      return false;
    }
    return password === adminPassword;
  }
};

/**
 * Utility function to hash passwords for storage
 * Run this once to generate password hash for production
 */
export const hashPassword = async (plainPassword: string): Promise<string> => {
  const saltRounds = 12; // Higher number = more secure but slower
  return await bcrypt.hash(plainPassword, saltRounds);
};

