import { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import bcrypt from 'bcrypt';

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
  
  return {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    name: 'comcubes_admin_session',
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
  
  console.log('Validating credentials for username:', username);
  console.log('Expected username:', adminUsername);
  console.log('Username match:', username === adminUsername);
  console.log('Password provided:', !!password);
  console.log('Expected password exists:', !!adminPassword);
  
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
      const isValid = await bcrypt.compare(password, adminPassword);
      console.log('Credentials valid:', isValid);
      return isValid;
    } catch (error) {
      console.error('Error comparing passwords:', error);
      return false;
    }
  } else {
    // Fallback for plain text passwords (development only)
    // In production, this should be removed and only hashed passwords used
    console.warn('Using plain text password comparison - this should only be used in development!');
    const isValid = password === adminPassword;
    console.log('Credentials valid:', isValid);
    return isValid;
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

