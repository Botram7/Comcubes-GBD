import { MailService } from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const emailEnabled = !!SENDGRID_API_KEY;

let sgMail: MailService | null = null;

if (emailEnabled && SENDGRID_API_KEY) {
  sgMail = new MailService();
  sgMail.setApiKey(SENDGRID_API_KEY);
} else {
  console.warn('SENDGRID_API_KEY not set - email functionality disabled');
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export class EmailService {
  private readonly fromEmail: string;

  constructor(fromEmail: string = 'contact-cgbd@comcubes.com') {
    this.fromEmail = fromEmail;
  }

  async sendEmail(params: EmailParams): Promise<boolean> {
    if (!emailEnabled || !sgMail) {
      console.log('Email would be sent to:', params.to, 'Subject:', params.subject);
      return true; // Return true for development purposes
    }
    
    try {
      await sgMail.send({
        to: params.to,
        from: params.from || this.fromEmail,
        subject: params.subject,
        text: params.text,
        html: params.html,
      });
      return true;
    } catch (error) {
      console.error('SendGrid email error:', error);
      return false;
    }
  }

  async sendContactNotification(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
    contactType: string;
  }, adminEmail: string): Promise<boolean> {
    const html = `
      <h2>New Contact Message - COMCUBES</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Contact Type:</strong> ${data.contactType}</p>
      <p><strong>Subject:</strong> ${data.subject}</p>
      <p><strong>Message:</strong></p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
        ${data.message.replace(/\n/g, '<br>')}
      </div>
    `;

    return this.sendEmail({
      to: adminEmail,
      from: this.fromEmail,
      subject: `[COMCUBES] New Contact: ${data.subject}`,
      html,
    });
  }

  async sendContactConfirmation(data: {
    name: string;
    email: string;
    subject: string;
  }): Promise<boolean> {
    const html = `
      <h2>Thank You for Contacting COMCUBES</h2>
      <p>Dear ${data.name},</p>
      <p>We have received your message regarding "<strong>${data.subject}</strong>" and will respond within 24-48 hours.</p>
      <p>Our team at COMCUBES Global Business Directory is committed to providing excellent support.</p>
      <br>
      <p>Best regards,<br>The COMCUBES Team</p>
    `;

    return this.sendEmail({
      to: data.email,
      from: this.fromEmail,
      subject: 'COMCUBES - Message Received',
      html,
    });
  }

  async sendListingConfirmation(data: {
    companyName: string;
    contactEmail: string;
    paymentReference: string;
  }): Promise<boolean> {
    const html = `
      <h2>Company Listing Submission Received - COMCUBES</h2>
      <p>Dear ${data.companyName} Team,</p>
      <p>Thank you for your interest in being listed in the COMCUBES Global Business Directory!</p>
      
      <p><strong>Submission Details:</strong></p>
      <ul>
        <li>Company: ${data.companyName}</li>
        <li>Payment Reference: ${data.paymentReference}</li>
        <li>Status: Under Review</li>
      </ul>
      
      <p>Our team will review your submission and contact you within 2-3 business days with updates.</p>
      
      <br>
      <p>Best regards,<br>The COMCUBES Team</p>
    `;

    return this.sendEmail({
      to: data.contactEmail,
      from: this.fromEmail,
      subject: 'COMCUBES - Listing Submission Received',
      html,
    });
  }

  async sendApprovalEmail(listing: any): Promise<boolean> {
    if (!emailEnabled) {
      console.log('Email service disabled - would send approval email to:', listing.contactEmail);
      return true;
    }

    const html = `
      <h2>Congratulations! Your company listing has been approved</h2>
      <p>Dear ${listing.companyName} team,</p>
      <p>Great news! Your company listing has been reviewed and approved. Your company is now live on the COMCUBES Global Business Directory.</p>
      
      <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0; background-color: #f9f9f9;">
        <h3>Listing Details:</h3>
        <p><strong>Company Name:</strong> ${listing.companyName}</p>
        <p><strong>Website:</strong> ${listing.websiteUrl}</p>
        <p><strong>Sector:</strong> ${listing.sectorName}</p>
        <p><strong>Industry:</strong> ${listing.industryName}</p>
      </div>
      
      <p>Your company is now visible to visitors browsing the ${listing.sectorName} sector and ${listing.industryName} industry.</p>
      <p>Visit <a href="https://comcubes.com">COMCUBES.com</a> to see your listing live.</p>
      
      <p>Thank you for choosing COMCUBES Global Business Directory!</p>
      <p>Best regards,<br>The COMCUBES Team</p>
    `;

    return this.sendEmail({
      to: listing.contactEmail,
      from: this.fromEmail,
      subject: 'Your COMCUBES Company Listing Has Been Approved!',
      html,
    });
  }

  async sendRejectionEmail(listing: any): Promise<boolean> {
    if (!emailEnabled) {
      console.log('Email service disabled - would send rejection email to:', listing.contactEmail);
      return true;
    }

    const html = `
      <h2>Update on Your Company Listing Application</h2>
      <p>Dear ${listing.companyName} team,</p>
      <p>Thank you for your interest in listing your company on COMCUBES Global Business Directory.</p>
      
      <p>After review, we are unable to approve your current listing submission. This could be due to:</p>
      <ul>
        <li>Incomplete or unclear company information</li>
        <li>Website or business details that need verification</li>
        <li>Information that doesn't meet our directory standards</li>
      </ul>
      
      <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0; background-color: #f9f9f9;">
        <h3>Your Submission Details:</h3>
        <p><strong>Company Name:</strong> ${listing.companyName}</p>
        <p><strong>Website:</strong> ${listing.websiteUrl}</p>
        <p><strong>Sector:</strong> ${listing.sectorName}</p>
        <p><strong>Industry:</strong> ${listing.industryName}</p>
      </div>
      
      <p>You're welcome to submit a new application with updated information. Please ensure all details are accurate and complete.</p>
      <p>If you have questions about this decision, please contact us at support@comcubes.com.</p>
      
      <p>Best regards,<br>The COMCUBES Team</p>
    `;

    return this.sendEmail({
      to: listing.contactEmail,
      from: this.fromEmail,
      subject: 'Update on Your COMCUBES Company Listing Application',
      html,
    });
  }

  async sendAdminNotification(listing: any): Promise<boolean> {
    if (!emailEnabled) {
      console.log('Email service disabled - would send admin notification for listing:', listing.id);
      return true;
    }

    const adminEmail = 'admin@comcubes.com';
    const html = `
      <h2>New Company Listing Payment Completed</h2>
      <p>A company has completed payment for their listing and is ready for review.</p>
      
      <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0; background-color: #f9f9f9;">
        <h3>Company Details:</h3>
        <p><strong>Company Name:</strong> ${listing.companyName}</p>
        <p><strong>Website:</strong> ${listing.websiteUrl}</p>
        <p><strong>Contact Email:</strong> ${listing.contactEmail}</p>
        <p><strong>Sector:</strong> ${listing.sectorName}</p>
        <p><strong>Industry:</strong> ${listing.industryName}</p>
        <p><strong>Payment Amount:</strong> ₦${parseInt(listing.paymentAmount).toLocaleString()}</p>
        <p><strong>Payment Reference:</strong> ${listing.paymentReference}</p>
      </div>
      
      ${listing.description ? `<p><strong>Description:</strong><br>${listing.description}</p>` : ''}
      
      <p><a href="${process.env.BASE_URL || 'http://localhost:5000'}/admin" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review in Admin Dashboard</a></p>
      
      <p>Please review and approve/reject this listing in the admin dashboard.</p>
    `;

    return this.sendEmail({
      to: adminEmail,
      from: this.fromEmail,
      subject: `New Company Listing Payment Completed - ${listing.companyName}`,
      html,
    });
  }

  async sendWaitlistNotification(waitlistEntry: any): Promise<boolean> {
    if (!emailEnabled) {
      console.log('Email service disabled - would send waitlist notification to:', waitlistEntry.contactEmail);
      return true;
    }

    const html = `
      <h2>COMCUBES Waitlist Update</h2>
      <p>Dear ${waitlistEntry.companyName} Team,</p>
      <p>We're reaching out regarding your position on the COMCUBES waitlist for the <strong>${waitlistEntry.industryName}</strong> industry.</p>
      <p>We're actively monitoring slot availability and will notify you immediately when a position opens up.</p>
      
      <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0; background-color: #f9f9f9;">
        <h3>Your Waitlist Details:</h3>
        <p><strong>Company:</strong> ${waitlistEntry.companyName}</p>
        <p><strong>Industry:</strong> ${waitlistEntry.industryName}</p>
        <p><strong>Sector:</strong> ${waitlistEntry.sectorName}</p>
        <p><strong>Submitted:</strong> ${new Date(waitlistEntry.submittedAt).toLocaleDateString()}</p>
      </div>
      
      <p>Thank you for your patience. We'll be in touch as soon as a slot becomes available.</p>
      <p>Best regards,<br>The COMCUBES Team</p>
    `;

    return this.sendEmail({
      to: waitlistEntry.contactEmail,
      from: this.fromEmail,
      subject: 'COMCUBES Waitlist Update - Slot Availability Check',
      html,
    });
  }
}