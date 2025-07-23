import { Router } from 'express';
import { logoFetchingService } from '../services/logoFetcher';
import { websiteImageService } from '../services/websiteScreenshots';
import { db } from '../db';
import { companies } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Start logo fetching process
router.post('/fetch-logos', async (req, res) => {
  try {
    const { batchSize = 10 } = req.body;
    
    // Start the fetching process (non-blocking)
    logoFetchingService.fetchLogosForCompanies(batchSize).catch(console.error);
    
    res.json({ 
      success: true, 
      message: `Logo fetching started for batch size ${batchSize}` 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Start website image processing (screenshots + favicons)
router.post('/fetch-images', async (req, res) => {
  try {
    const { batchSize = 20 } = req.body;
    
    // Start the image processing (non-blocking)
    websiteImageService.processCompanyImages(batchSize).catch(console.error);
    
    res.json({ 
      success: true, 
      message: `Website image processing started for batch size ${batchSize}` 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Get logo fetching statistics
router.get('/stats', async (req, res) => {
  try {
    const logoStats = await logoFetchingService.getLogoStats();
    const imageStats = await websiteImageService.getImageStats();
    
    res.json({
      ...logoStats,
      screenshots: imageStats.screenshots,
      favicons: imageStats.favicons,
      source: 'combined_stats'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Enhanced safeguard: Takedown request endpoint
router.post('/takedown/:companyId', async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId);
    const { reason = 'trademark_request', requestor_email, additional_info } = req.body;
    
    if (!companyId) {
      return res.status(400).json({ success: false, error: 'Invalid company ID' });
    }
    
    // Log the takedown request
    console.log('Takedown request received:', {
      companyId,
      reason,
      requestor_email: requestor_email || 'anonymous',
      additional_info,
      timestamp: new Date().toISOString()
    });
    
    const success = await logoFetchingService.removeCompanyLogo(companyId, reason);
    
    if (success) {
      res.json({ 
        success: true, 
        message: 'Logo removed successfully. Thank you for your request.' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to remove logo' 
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Enhanced safeguard: Quality audit endpoint
router.post('/audit', async (req, res) => {
  try {
    // Start the audit process (non-blocking)
    logoFetchingService.auditLogoQuality().catch(console.error);
    
    res.json({ 
      success: true, 
      message: 'Logo quality audit started' 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Get company logo status
router.get('/company/:companyId', async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId);
    
    const [company] = await db
      .select({
        id: companies.id,
        name: companies.name,
        logoUrl: companies.logoUrl,
        logoStatus: companies.logoStatus,
        logoQuality: companies.logoQuality,
        logoFetchedAt: companies.logoFetchedAt
      })
      .from(companies)
      .where(eq(companies.id, companyId));
    
    if (!company) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }
    
    res.json(company);
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

export default router;