import type { Company } from "@shared/schema";

interface CompanyDescriptionTemplates {
  [industryKey: string]: {
    templates: string[];
    specializations: string[];
    achievements: string[];
  };
}

const industryTemplates: CompanyDescriptionTemplates = {
  // Financial Services
  "Consumer Finance": {
    templates: [
      "{company} is a prominent financial services provider specializing in consumer lending and payment solutions within the {sector} sector.",
      "{company} operates as a diversified financial institution offering innovative consumer finance products and services.",
      "{company} stands as a key player in consumer financial services, delivering comprehensive lending and credit solutions.",
      "{company} serves millions of consumers through its extensive portfolio of financial products and digital payment platforms."
    ],
    specializations: [
      "credit cards and payment processing",
      "personal loans and consumer credit",
      "digital wallet solutions",
      "merchant services and point-of-sale financing",
      "buy-now-pay-later services",
      "credit scoring and risk assessment"
    ],
    achievements: [
      "maintains strong credit portfolios across diverse market segments",
      "continues expanding digital payment capabilities",
      "leads in financial technology innovation",
      "serves both individual consumers and business clients"
    ]
  },
  
  // Telecommunications
  "Broadband Providers": {
    templates: [
      "{company} is a major telecommunications operator providing high-speed internet and digital communication services across the {sector} sector.",
      "{company} operates extensive fiber-optic and broadband networks, delivering connectivity solutions to residential and business customers.",
      "{company} stands as a leading broadband infrastructure provider, offering comprehensive telecommunications services.",
      "{company} maintains one of the region's largest telecommunications networks, serving millions of subscribers."
    ],
    specializations: [
      "fiber-optic broadband networks",
      "high-speed internet services",
      "enterprise connectivity solutions",
      "digital TV and streaming services",
      "mobile and fixed-line communications",
      "cloud-based telecommunications"
    ],
    achievements: [
      "operates extensive network infrastructure across multiple regions",
      "continues investing in 5G and fiber expansion",
      "leads in telecommunications technology advancement",
      "serves both residential and enterprise markets"
    ]
  },
  
  // Education
  "Open Courseware Providers": {
    templates: [
      "{company} is an innovative educational platform providing free and accessible learning resources within the {sector} sector.",
      "{company} operates as a leading provider of open educational content, democratizing access to quality learning materials.",
      "{company} stands as a pioneer in online education, offering comprehensive courseware and learning platforms.",
      "{company} delivers world-class educational content through digital platforms, serving learners globally."
    ],
    specializations: [
      "online course platforms and learning management",
      "open educational resources and content",
      "interactive learning tools and assessments",
      "professional development and certification",
      "K-12 and higher education content",
      "mobile learning applications"
    ],
    achievements: [
      "serves millions of learners across diverse subjects",
      "continues expanding course offerings and partnerships",
      "leads in educational technology innovation",
      "provides both free and premium learning solutions"
    ]
  },

  // Default template for industries not specifically covered
  "default": {
    templates: [
      "{company} is an established enterprise operating within the {industry} industry of the {sector} sector.",
      "{company} serves as a significant market participant in the {industry} space, contributing to the {sector} sector.",
      "{company} operates as a specialized company within the {industry} industry, part of the broader {sector} sector.",
      "{company} maintains a strong presence in the {industry} market segment of the {sector} sector."
    ],
    specializations: [
      "industry-specific products and services",
      "market-focused solutions and expertise",
      "specialized offerings and capabilities",
      "sector-relevant technologies and innovations",
      "customer-centered service delivery",
      "industry-leading practices and standards"
    ],
    achievements: [
      "maintains competitive positioning in its market segment",
      "continues adapting to industry developments",
      "serves diverse client and customer bases",
      "demonstrates commitment to operational excellence"
    ]
  }
};

export function generateCompanyDescription(company: Company): string {
  const industryKey = company.industryName;
  const templates = industryTemplates[industryKey] || industryTemplates["default"];
  
  // Select template based on company ID for consistency
  const templateIndex = company.id % templates.templates.length;
  const template = templates.templates[templateIndex];
  
  // Select specialization and achievement
  const specializationIndex = company.id % templates.specializations.length;
  const achievementIndex = (company.id + 1) % templates.achievements.length;
  
  const specialization = templates.specializations[specializationIndex];
  const achievement = templates.achievements[achievementIndex];
  
  // Replace placeholders
  const mainDescription = template
    .replace("{company}", company.name)
    .replace("{industry}", company.industryName)
    .replace("{sector}", company.sectorName);
  
  // Create full description
  const fullDescription = `${mainDescription} The company specializes in ${specialization} and ${achievement}.`;
  
  return fullDescription;
}

// Additional industry-specific templates can be added here
export function addIndustryTemplate(industryName: string, template: CompanyDescriptionTemplates[string]) {
  industryTemplates[industryName] = template;
}