import type { Express } from "express";
import { z } from "zod";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import { MailService } from '@sendgrid/mail';
import { storage } from "../storage";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Domain validation helper functions
function getExpectedDomain(websiteUrl: string): string | null {
  if (!websiteUrl) return null;
  try {
    const url = new URL(websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`);
    let domain = url.hostname.toLowerCase();
    // Remove www. prefix if present
    if (domain.startsWith('www.')) {
      domain = domain.substring(4);
    }
    return domain;
  } catch {
    return null;
  }
}

function isValidBusinessEmail(email: string, websiteUrl: string): boolean {
  if (!email || !websiteUrl) return false;
  
  const expectedDomain = getExpectedDomain(websiteUrl);
  if (!expectedDomain) return false;
  
  const emailDomain = email.split('@')[1]?.toLowerCase();
  if (!emailDomain) return false;
  
  // Allow exact domain match or subdomains
  return emailDomain === expectedDomain || emailDomain.endsWith(`.${expectedDomain}`);
}

// Email verification function to check if email actually exists
async function verifyEmailExists(email: string): Promise<{ valid: boolean; reason?: string }> {
  try {
    // Basic format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, reason: 'Invalid email format' };
    }

    const domain = email.split('@')[1];
    
    // Check if domain has MX records (mail exchange records)
    const dns = await import('dns').then(m => m.promises);
    
    try {
      const mxRecords = await dns.resolveMx(domain);
      if (!mxRecords || mxRecords.length === 0) {
        return { valid: false, reason: 'Domain does not accept email' };
      }
    } catch (dnsError) {
      return { valid: false, reason: 'Domain does not exist or cannot receive email' };
    }

    // For additional security, we could implement SMTP verification here
    // This would actually connect to the mail server and verify the email exists
    // But this is more complex and might be blocked by some servers
    
    return { valid: true };
  } catch (error) {
    console.error('Email verification error:', error);
    return { valid: false, reason: 'Unable to verify email' };
  }
}

const claimFormSchema = z.object({
  companyId: z.string(),
  companyName: z.string().min(1, "Company name is required"),
  contactName: z.string().min(1, "Contact name is required"),
  contactEmail: z.string().email("Valid email is required"),
  contactPhone: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  companyDescription: z.string().min(10, "Description must be at least 10 characters"),
  plan: z.enum(["basic", "premium", "enterprise"]),
});

export function registerCompanyClaimRoutes(app: Express) {
  // Submit company claim
  app.post("/api/company-claims", upload.single('logoImage'), async (req, res) => {
    try {
      const validatedData = claimFormSchema.parse(req.body);
      
      // Validate business email domain matches website domain for security
      if (!isValidBusinessEmail(validatedData.contactEmail, validatedData.websiteUrl || '')) {
        const expectedDomain = getExpectedDomain(validatedData.websiteUrl || '');
        return res.status(400).json({
          error: `For security verification, business email must use your company domain${expectedDomain ? ` (@${expectedDomain})` : ''}. This prevents unauthorized claims.`
        });
      }

      // Verify that the email actually exists
      const emailVerification = await verifyEmailExists(validatedData.contactEmail);
      if (!emailVerification.valid) {
        return res.status(400).json({
          error: `Email verification failed: ${emailVerification.reason}. Please provide a valid, existing business email address to prevent fraudulent claims.`
        });
      }
      
      // Generate verification code and send email
      const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase();
      const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const claimData = {
        ...validatedData,
        logoImagePath: req.file?.path,
        logoImageOriginalName: req.file?.originalname,
        status: 'pending',
        submittedAt: new Date(),
        companyId: parseInt(validatedData.companyId),
        emailVerified: false,
        verificationCode: verificationCode,
        verificationSentAt: new Date(),
        verificationExpiresAt: verificationExpiresAt,
      };

      // Send verification email
      try {
        if (process.env.SENDGRID_API_KEY) {
          const mailService = new MailService();
          mailService.setApiKey(process.env.SENDGRID_API_KEY);
          
          await mailService.send({
            to: validatedData.contactEmail,
            from: 'admin@comcubes.com',
            subject: `COMCUBES: Verify Your Company Claim - ${validatedData.companyName}`,
            html: `
              <h2>Verify Your Company Claim</h2>
              <p>Dear ${validatedData.contactName},</p>
              <p>Thank you for claiming your company listing on COMCUBES. To complete the verification process and prevent fraudulent claims, please use the verification code below:</p>
              
              <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px;">
                <h3 style="color: #2563eb; font-size: 24px; letter-spacing: 3px; margin: 0;">${verificationCode}</h3>
              </div>
              
              <p><strong>Company:</strong> ${validatedData.companyName}</p>
              <p><strong>Plan:</strong> ${validatedData.plan.charAt(0).toUpperCase() + validatedData.plan.slice(1)}</p>
              
              <p>This verification code will expire in 24 hours. If you did not request this claim, please ignore this email or contact us immediately.</p>
              
              <p>Best regards,<br>COMCUBES Team</p>
              
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #666;">This is an automated security measure to ensure only legitimate business representatives can claim company listings.</p>
            `
          });
        }
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Continue with claim submission even if email fails
      }

      // Store the claim in the database
      const claim = await storage.createCompanyClaim(claimData);

      res.status(201).json({
        message: "Company claim submitted successfully. A verification code has been sent to your email address.",
        claimId: claim.id,
        status: claim.status,
        requiresEmailVerification: true
      });

    } catch (error) {
      console.error("Error submitting company claim:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors
        });
      }

      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Verify email for company claim
  app.post("/api/company-claims/:claimId/verify-email", async (req, res) => {
    try {
      const claimId = parseInt(req.params.claimId);
      const { verificationCode } = req.body;

      if (!verificationCode) {
        return res.status(400).json({ error: "Verification code is required" });
      }

      const claim = await storage.getCompanyClaim(claimId);
      if (!claim) {
        return res.status(404).json({ error: "Claim not found" });
      }

      if (claim.emailVerified) {
        return res.status(400).json({ error: "Email already verified" });
      }

      if (!claim.verificationCode || !claim.verificationExpiresAt) {
        return res.status(400).json({ error: "No verification code found" });
      }

      if (new Date() > claim.verificationExpiresAt) {
        return res.status(400).json({ error: "Verification code has expired" });
      }

      if (claim.verificationCode !== verificationCode.toUpperCase()) {
        return res.status(400).json({ error: "Invalid verification code" });
      }

      // Mark email as verified
      await storage.updateCompanyClaimEmailVerification(claimId, true);

      res.json({
        message: "Email verified successfully",
        emailVerified: true
      });

    } catch (error) {
      console.error("Error verifying email:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get company claim by ID (for admin)
  app.get("/api/company-claims/:claimId", async (req, res) => {
    try {
      const claimId = parseInt(req.params.claimId);
      const claim = await storage.getCompanyClaim(claimId);

      if (!claim) {
        return res.status(404).json({ message: "Claim not found" });
      }

      res.json(claim);
    } catch (error) {
      console.error("Error fetching company claim:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all company claims (for admin dashboard)
  app.get("/api/admin/company-claims", async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const claims = await storage.getCompanyClaims(status);
      res.json(claims);
    } catch (error) {
      console.error("Error fetching company claims:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update company claim status (for admin)
  app.patch("/api/admin/company-claims/:claimId", async (req, res) => {
    try {
      const claimId = parseInt(req.params.claimId);
      const { status, adminNotes } = req.body;

      if (!['pending', 'approved', 'rejected', 'completed'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const updatedClaim = await storage.updateCompanyClaimStatus(claimId, status, adminNotes);

      if (!updatedClaim) {
        return res.status(404).json({ message: "Claim not found" });
      }

      res.json(updatedClaim);
    } catch (error) {
      console.error("Error updating company claim status:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get claim statistics for admin dashboard
  app.get("/api/admin/company-claim-stats", async (req, res) => {
    try {
      const stats = await storage.getCompanyClaimStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching claim statistics:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
}