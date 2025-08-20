import type { Express } from "express";
import { z } from "zod";
import multer from "multer";
import path from "path";
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
      
      const claimData = {
        ...validatedData,
        logoImagePath: req.file?.path,
        logoImageOriginalName: req.file?.originalname,
        status: 'pending',
        submittedAt: new Date(),
        companyId: parseInt(validatedData.companyId),
      };

      // Store the claim in the database
      const claim = await storage.createCompanyClaim(claimData);

      res.status(201).json({
        message: "Company claim submitted successfully",
        claimId: claim.id,
        status: claim.status
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