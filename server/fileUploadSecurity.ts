import multer from 'multer';
import path from 'path';
import fs from 'fs';

/**
 * Comprehensive file upload security configuration
 */

// Allowed file types with their MIME types and extensions
const ALLOWED_IMAGE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'image/svg+xml': ['.svg']
};

const ALLOWED_DOCUMENT_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt']
};

const ALL_ALLOWED_TYPES = { ...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES };

// Security configuration constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES_PER_REQUEST = 5;

/**
 * Validates file type against allowed types
 */
function validateFileType(file: Express.Multer.File): boolean {
  const mimeType = file.mimetype;
  const extension = path.extname(file.originalname).toLowerCase();
  
  const allowedExtensions = ALL_ALLOWED_TYPES[mimeType as keyof typeof ALL_ALLOWED_TYPES];
  return allowedExtensions && allowedExtensions.includes(extension);
}

/**
 * Sanitizes filename to prevent directory traversal attacks
 */
function sanitizeFilename(filename: string): string {
  // Remove directory traversal patterns
  let sanitized = filename.replace(/\.\./g, '');
  
  // Remove or replace dangerous characters
  sanitized = sanitized.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');
  
  // Ensure filename isn't empty and has reasonable length
  if (!sanitized || sanitized.length === 0) {
    sanitized = 'unnamed_file';
  }
  
  if (sanitized.length > 255) {
    const ext = path.extname(sanitized);
    const name = path.basename(sanitized, ext);
    sanitized = name.substring(0, 255 - ext.length) + ext;
  }
  
  return sanitized;
}

/**
 * Checks for potentially malicious file content
 */
async function scanFileContent(filePath: string): Promise<boolean> {
  try {
    const buffer = fs.readFileSync(filePath);
    const content = buffer.toString('utf8', 0, Math.min(buffer.length, 1000));
    
    // Check for suspicious patterns (basic malware detection)
    const suspiciousPatterns = [
      /<script[\s\S]*?>[\s\S]*?<\/script>/gi, // JavaScript in uploads
      /javascript:/gi,
      /vbscript:/gi,
      /on\w+\s*=/gi, // Event handlers
      /eval\s*\(/gi,
      /document\.write/gi,
      /window\.location/gi
    ];
    
    return !suspiciousPatterns.some(pattern => pattern.test(content));
  } catch (error) {
    console.error('Error scanning file content:', error);
    return false; // Reject if we can't scan
  }
}

/**
 * Secure multer configuration for file uploads
 */
export function createSecureUploader(destination: string = 'uploads/') {
  // Ensure upload directory exists
  const uploadDir = path.resolve(destination);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const sanitizedName = sanitizeFilename(file.originalname);
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15);
      const extension = path.extname(sanitizedName);
      const basename = path.basename(sanitizedName, extension);
      
      // Create unique filename to prevent conflicts and add security
      const filename = `${timestamp}_${randomStr}_${basename}${extension}`;
      cb(null, filename);
    }
  });

  return multer({
    storage,
    limits: {
      fileSize: MAX_FILE_SIZE,
      files: MAX_FILES_PER_REQUEST,
      fields: 10, // Limit form fields
      fieldNameSize: 100,
      fieldSize: 1024 * 1024 // 1MB for form fields
    },
    fileFilter: (req, file, cb) => {
      // Validate file type
      if (!validateFileType(file)) {
        return cb(new Error(`File type not allowed. Allowed types: ${Object.keys(ALL_ALLOWED_TYPES).join(', ')}`));
      }
      
      cb(null, true);
    }
  });
}

/**
 * Middleware for additional file security checks after upload
 */
export async function postUploadSecurityCheck(filePath: string): Promise<boolean> {
  try {
    // Check if file still exists
    if (!fs.existsSync(filePath)) {
      return false;
    }
    
    // Get file stats
    const stats = fs.statSync(filePath);
    
    // Verify file size doesn't exceed limit
    if (stats.size > MAX_FILE_SIZE) {
      fs.unlinkSync(filePath); // Delete oversized file
      return false;
    }
    
    // Scan file content for malicious patterns
    const isSafe = await scanFileContent(filePath);
    if (!isSafe) {
      fs.unlinkSync(filePath); // Delete suspicious file
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in post-upload security check:', error);
    // Delete file if we can't verify it's safe
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return false;
  }
}

/**
 * Security utilities for file handling
 */
export const FileUploadSecurity = {
  // Get allowed file types for client-side validation
  getAllowedTypes: () => Object.keys(ALL_ALLOWED_TYPES),
  
  // Get max file size for client
  getMaxFileSize: () => MAX_FILE_SIZE,
  
  // Get max files per request
  getMaxFiles: () => MAX_FILES_PER_REQUEST,
  
  // Clean up old uploaded files (call periodically)
  cleanupOldFiles: (directory: string, maxAge: number = 24 * 60 * 60 * 1000) => {
    try {
      const files = fs.readdirSync(directory);
      const now = Date.now();
      
      files.forEach(file => {
        const filePath = path.join(directory, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
          console.log(`Cleaned up old file: ${file}`);
        }
      });
    } catch (error) {
      console.error('Error cleaning up old files:', error);
    }
  }
};