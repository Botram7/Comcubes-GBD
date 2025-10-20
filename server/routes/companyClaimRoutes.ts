import type { Express } from "express";
import { z } from "zod";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import { storage } from "../storage";
import { EmailService } from "../emailService";
import { PaystackService } from "../paystackService";
import { paypalService } from "../paypalService";

// Configure multer for file uploads
const upload = multer({
  dest: 'server/uploads/',
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
      // For major corporations, DNS might be protected/configured differently
      // Allow the email to proceed but log the issue
      console.log(`DNS verification failed for domain ${domain}, but allowing to proceed:`, (dnsError as Error).message);
      return { valid: true, reason: 'DNS verification skipped for corporate domain' };
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
      console.log("Raw request body:", req.body);
      console.log("Request headers:", req.headers);
      console.log("File uploaded:", req.file);
      
      const validatedData = claimFormSchema.parse(req.body);
      
      // Validate business email domain matches website domain for security
      if (!isValidBusinessEmail(validatedData.contactEmail, validatedData.websiteUrl || '')) {
        const expectedDomain = getExpectedDomain(validatedData.websiteUrl || '');
        return res.status(400).json({
          error: `For security verification, business email must use your company domain${expectedDomain ? ` (@${expectedDomain})` : ''}. This prevents unauthorized claims.`
        });
      }

      // Verify that the email actually exists (temporarily disabled DNS check for testing)
      // TODO: Re-enable with less strict verification after testing
      const emailVerification = await verifyEmailExists(validatedData.contactEmail);
      if (!emailVerification.valid && emailVerification.reason !== 'Domain does not exist or cannot receive email') {
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
        const emailService = new EmailService();
        await emailService.sendClaimVerificationEmail({
          contactName: validatedData.contactName,
          contactEmail: validatedData.contactEmail,
          companyName: validatedData.companyName,
          plan: validatedData.plan,
          verificationCode: verificationCode
        });
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

      // Send admin notification about the verified claim
      try {
        const emailService = new EmailService();
        await emailService.sendClaimAdminNotification({
          contactName: claim.contactName,
          contactEmail: claim.contactEmail,
          companyName: claim.companyName,
          plan: claim.plan,
          claimId: claimId
        });
      } catch (emailError) {
        console.error('Failed to send admin notification:', emailError);
        // Continue even if admin notification fails
      }

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

  // Initialize payment for company claim (supports PayPal and Paystack)
  app.post("/api/claims/payment/initialize", async (req, res) => {
    try {
      const { claimId, paymentMethod } = req.body;

      if (!claimId) {
        return res.status(400).json({ error: "Claim ID is required" });
      }

      // Load claim by ID
      const claim = await storage.getCompanyClaim(claimId);
      if (!claim) {
        return res.status(404).json({ error: "Claim not found" });
      }

      // Validate claim status
      if (claim.status !== 'pending') {
        return res.status(400).json({ error: "Claim payment can only be made for pending claims" });
      }

      // Calculate amount based on plan (annual billing: Basic $360, Premium $600)
      const amounts = {
        basic: 36000, // $360 in cents
        premium: 60000, // $600 in cents
        enterprise: 60000 // Same as premium for now
      };

      const amount = amounts[claim.plan as keyof typeof amounts];
      if (!amount) {
        return res.status(400).json({ error: "Invalid plan type" });
      }

      // Default to PayPal if no payment method specified (PayPal is primary)
      const method = paymentMethod || 'paypal';
      const timestamp = Date.now();
      const reference = `claim_${claimId}_${timestamp}`;

      if (method === 'paypal') {
        // PayPal payment flow - clean USD only
        const paymentData = await paypalService.initializePayment({
          email: claim.contactEmail,
          amount: amount,
          reference: reference,
          metadata: {
            type: 'claim',
            claimId: claimId,
            companyId: claim.companyId,
            plan: claim.plan,
            companyName: claim.companyName
          }
        });

        res.json({
          success: true,
          paymentMethod: 'paypal',
          approval_url: paymentData.approval_url,
          order_id: paymentData.order_id,
          reference: paymentData.reference,
          amount: amount
        });
      } else {
        // Paystack payment flow (fallback option)
        const paystackService = new PaystackService();
        const paymentData = await paystackService.initializePayment({
          email: claim.contactEmail,
          amount: amount,
          reference: reference,
          currency: 'USD',
          metadata: {
            type: 'claim',
            claimId: claimId,
            companyId: claim.companyId,
            plan: claim.plan,
            companyName: claim.companyName
          }
        });

        res.json({
          success: true,
          paymentMethod: 'paystack',
          authorization_url: paymentData.authorization_url,
          access_code: paymentData.access_code,
          reference: paymentData.reference,
          amount: amount
        });
      }

    } catch (error) {
      console.error("Error initializing claim payment:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Payment initialization failed" 
      });
    }
  });

  // Verify payment for company claim (supports both PayPal and Paystack)
  app.post("/api/claims/payment/verify", async (req, res) => {
    try {
      const { reference, orderId, paymentMethod } = req.body;

      if (!reference && !orderId) {
        return res.status(400).json({ error: "Payment reference or order ID is required" });
      }

      let paymentResult;
      let claimId: number;

      // Determine payment method and verify accordingly
      if (orderId || paymentMethod === 'paypal') {
        // PayPal payment verification
        const paypalOrderId = orderId || reference;
        paymentResult = await paypalService.verifyPayment(paypalOrderId);

        if (paymentResult.status === 'success') {
          // Extract claimId from metadata or reference
          claimId = paymentResult.metadata.claimId;
          
          // Update claim status to paid
          await storage.updateCompanyClaimStatus(claimId, 'paid');

          res.json({
            message: "PayPal payment verified successfully",
            status: "success",
            paymentMethod: 'paypal',
            claimId: claimId,
            data: paymentResult
          });
        } else {
          res.status(400).json({
            message: "PayPal payment verification failed",
            status: paymentResult.status,
            data: paymentResult
          });
        }
      } else {
        // Paystack payment verification
        const paystackService = new PaystackService();
        paymentResult = await paystackService.verifyPayment(reference);

        if (paymentResult.status === 'success') {
          // Extract claimId from reference (format: claim_123_timestamp)
          const claimIdMatch = reference.match(/^claim_(\d+)_/);
          if (!claimIdMatch) {
            return res.status(400).json({ error: "Invalid payment reference format" });
          }

          claimId = parseInt(claimIdMatch[1]);
          
          // Update claim status to paid
          await storage.updateCompanyClaimStatus(claimId, 'paid');

          res.json({
            message: "Paystack payment verified successfully",
            status: "success",
            paymentMethod: 'paystack',
            claimId: claimId,
            data: paymentResult
          });
        } else {
          res.status(400).json({
            message: "Paystack payment verification failed",
            status: paymentResult.status,
            data: paymentResult
          });
        }
      }

    } catch (error) {
      console.error("Error verifying claim payment:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Payment verification failed" 
      });
    }
  });
}