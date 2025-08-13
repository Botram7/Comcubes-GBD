import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { users, type User, type InsertUser } from '@shared/schema';
import { db } from './db';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev';
const JWT_EXPIRES_IN = '7d';

export interface AuthResult {
  success: boolean;
  user?: Omit<User, 'passwordHash'>;
  token?: string;
  message?: string;
}

export class AuthService {
  // Hash password
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // Verify password
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Generate JWT token
  static generateToken(userId: number, email: string): string {
    return jwt.sign(
      { userId, email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  // Verify JWT token
  static verifyToken(token: string): { userId: number; email: string } | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      return { userId: decoded.userId, email: decoded.email };
    } catch (error) {
      return null;
    }
  }

  // Register new user
  static async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<AuthResult> {
    try {
      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, userData.email))
        .limit(1);

      if (existingUser.length > 0) {
        return {
          success: false,
          message: 'An account with this email already exists',
        };
      }

      // Hash password
      const passwordHash = await this.hashPassword(userData.password);

      // Create user
      const [newUser] = await db
        .insert(users)
        .values({
          email: userData.email,
          passwordHash,
          firstName: userData.firstName,
          lastName: userData.lastName,
          isEmailVerified: 0,
        })
        .returning();

      // Generate token
      const token = this.generateToken(newUser.id, newUser.email);

      // Return user without password hash
      const { passwordHash: _, ...userWithoutPassword } = newUser;

      return {
        success: true,
        user: userWithoutPassword,
        token,
        message: 'Account created successfully',
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Failed to create account. Please try again.',
      };
    }
  }

  // Login user
  static async login(email: string, password: string): Promise<AuthResult> {
    try {
      // Find user by email
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user) {
        return {
          success: false,
          message: 'Invalid email or password',
        };
      }

      // Verify password
      const isValidPassword = await this.verifyPassword(password, user.passwordHash);

      if (!isValidPassword) {
        return {
          success: false,
          message: 'Invalid email or password',
        };
      }

      // Update last login time
      await db
        .update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.id, user.id));

      // Generate token
      const token = this.generateToken(user.id, user.email);

      // Return user without password hash
      const { passwordHash: _, ...userWithoutPassword } = user;

      return {
        success: true,
        user: userWithoutPassword,
        token,
        message: 'Login successful',
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed. Please try again.',
      };
    }
  }

  // Get user by ID
  static async getUserById(userId: number): Promise<Omit<User, 'passwordHash'> | null> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        return null;
      }

      const { passwordHash: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  // Get user by email
  static async getUserByEmail(email: string): Promise<Omit<User, 'passwordHash'> | null> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user) {
        return null;
      }

      const { passwordHash: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('Get user by email error:', error);
      return null;
    }
  }
}