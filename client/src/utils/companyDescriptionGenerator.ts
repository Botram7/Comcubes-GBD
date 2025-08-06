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
      "{company} is a major telecommunications operator providing high-speed internet and digital communication services.",
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
      "cloud-based telecommunications infrastructure"
    ],
    achievements: [
      "operates extensive network infrastructure across multiple regions",
      "continues investing in 5G and fiber expansion",
      "leads in telecommunications technology advancement",
      "serves both residential and enterprise markets"
    ]
  },

  "Wireless Carriers": {
    templates: [
      "{company} is a leading mobile network operator providing wireless communication services across multiple markets.",
      "{company} operates comprehensive wireless networks, delivering mobile voice, data, and digital services to millions of customers.",
      "{company} stands as a major wireless telecommunications provider, offering advanced mobile connectivity solutions.",
      "{company} maintains extensive cellular infrastructure, serving consumers and businesses with cutting-edge wireless technology."
    ],
    specializations: [
      "4G and 5G wireless networks",
      "mobile voice and data services",
      "enterprise mobility solutions",
      "IoT and connected device services",
      "mobile payment and digital wallet services",
      "network infrastructure and tower operations"
    ],
    achievements: [
      "operates nationwide wireless coverage across multiple countries",
      "leads in 5G network deployment and innovation",
      "serves diverse customer segments from consumers to enterprises",
      "continues expanding international roaming partnerships"
    ]
  },
  
  // Education
  "Open Courseware Providers": {
    templates: [
      "{company} is an innovative educational platform providing free and accessible learning resources to students worldwide.",
      "{company} operates as a leading provider of open educational content, democratizing access to quality learning materials.",
      "{company} stands as a pioneer in online education, offering comprehensive courseware and interactive learning platforms.",
      "{company} delivers world-class educational content through digital platforms, serving learners across all academic levels."
    ],
    specializations: [
      "online course platforms and learning management systems",
      "open educational resources and multimedia content",
      "interactive learning tools and skill assessments",
      "professional development and certification programs",
      "K-12 and higher education curriculum content",
      "mobile learning applications and accessibility tools"
    ],
    achievements: [
      "serves millions of learners across diverse subjects and skill levels",
      "continues expanding course offerings through academic partnerships",
      "leads in educational technology innovation and accessibility",
      "provides both free public access and premium learning solutions"
    ]
  },

  "Language Learning": {
    templates: [
      "{company} is a comprehensive language learning platform offering interactive courses and cultural immersion experiences.",
      "{company} operates as an innovative language education provider, combining technology with proven pedagogical methods.",
      "{company} stands as a global leader in digital language instruction, serving learners across multiple languages and proficiency levels.",
      "{company} delivers personalized language learning experiences through advanced AI-powered educational technology."
    ],
    specializations: [
      "interactive language courses and conversation practice",
      "AI-powered personalized learning paths",
      "cultural immersion and real-world language application",
      "business and professional language training",
      "mobile language learning apps and offline content",
      "community-based learning and native speaker connections"
    ],
    achievements: [
      "serves millions of language learners across dozens of languages",
      "continues advancing AI-driven personalized education technology",
      "maintains partnerships with educational institutions globally",
      "offers both consumer and enterprise language learning solutions"
    ]
  },

  // Aerospace
  "Aerospace Structures & Composites": {
    templates: [
      "{company} is a specialized aerospace manufacturer focused on advanced structural components and composite materials.",
      "{company} operates as a leading supplier of aerospace structures, delivering critical components for commercial and defense aircraft.",
      "{company} stands as an innovative provider of composite aerospace solutions, serving major aircraft manufacturers globally.",
      "{company} develops and manufactures high-performance aerospace structures using cutting-edge materials and manufacturing processes."
    ],
    specializations: [
      "advanced composite materials and carbon fiber structures",
      "aircraft fuselage and wing components",
      "precision aerospace manufacturing and assembly",
      "lightweight structural solutions and design optimization",
      "defense and military aerospace applications",
      "space vehicle components and satellite structures"
    ],
    achievements: [
      "supplies critical components to major aircraft manufacturers worldwide",
      "continues advancing composite materials technology and manufacturing",
      "maintains stringent aerospace quality and safety certifications",
      "serves both commercial aviation and defense aerospace markets"
    ]
  },

  // Banking
  "Investment Banking": {
    templates: [
      "{company} is a premier investment banking institution providing comprehensive financial advisory and capital markets services.",
      "{company} operates as a leading global investment bank, delivering sophisticated financial solutions to institutional clients.",
      "{company} stands as a major player in investment banking, offering strategic advisory services and capital raising solutions.",
      "{company} maintains a strong presence in global capital markets, serving corporations and institutional investors worldwide."
    ],
    specializations: [
      "mergers and acquisitions advisory services",
      "equity and debt capital markets transactions",
      "corporate finance and restructuring solutions",
      "trading and market-making operations",
      "institutional asset management services",
      "private wealth management and family office services"
    ],
    achievements: [
      "leads major global M&A transactions across multiple industries",
      "continues expanding international presence and capabilities",
      "maintains strong relationships with institutional investors worldwide",
      "serves Fortune 500 companies and sovereign wealth funds"
    ]
  },

  "Commercial Banking": {
    templates: [
      "{company} is a major commercial banking institution providing comprehensive financial services to businesses and consumers.",
      "{company} operates extensive banking networks, delivering traditional and digital banking solutions across multiple markets.",
      "{company} stands as a leading financial services provider, offering commercial lending and deposit services.",
      "{company} maintains a strong community banking presence while serving diverse commercial and retail customers."
    ],
    specializations: [
      "commercial lending and business banking services",
      "retail banking and consumer financial products",
      "digital banking platforms and mobile applications",
      "treasury management and cash flow solutions",
      "small business lending and merchant services",
      "mortgage lending and residential real estate financing"
    ],
    achievements: [
      "operates extensive branch networks across multiple regions",
      "continues investing in digital transformation and fintech capabilities",
      "maintains strong credit quality and regulatory compliance",
      "serves millions of retail and commercial banking customers"
    ]
  },

  // Technology
  "Software Development": {
    templates: [
      "{company} is an innovative software development company creating cutting-edge applications and digital solutions.",
      "{company} operates as a technology leader, developing enterprise software and custom application solutions.",
      "{company} stands as a specialized software provider, delivering scalable technology solutions across multiple industries.",
      "{company} focuses on software innovation, creating cloud-based applications and digital transformation tools."
    ],
    specializations: [
      "enterprise software applications and platform development",
      "cloud computing solutions and SaaS offerings",
      "mobile application development and user experience design",
      "artificial intelligence and machine learning technologies",
      "cybersecurity solutions and data protection services",
      "custom software development and system integration"
    ],
    achievements: [
      "serves thousands of businesses with scalable software solutions",
      "continues advancing cloud technology and AI capabilities",
      "maintains partnerships with major technology platforms",
      "provides both enterprise and consumer software applications"
    ]
  },

  // Healthcare
  "Pharmaceuticals": {
    templates: [
      "{company} is a research-driven pharmaceutical company developing innovative medicines and therapeutic solutions.",
      "{company} operates as a global biopharmaceutical leader, discovering and commercializing life-saving treatments.",
      "{company} stands as a major pharmaceutical innovator, bringing breakthrough therapies to patients worldwide.",
      "{company} focuses on drug development and manufacturing, serving healthcare providers and patients globally."
    ],
    specializations: [
      "drug discovery and clinical development programs",
      "therapeutic treatments for chronic and rare diseases",
      "biotechnology research and precision medicine",
      "pharmaceutical manufacturing and quality control",
      "regulatory affairs and global market access",
      "patient support programs and healthcare partnerships"
    ],
    achievements: [
      "brings life-changing medicines to millions of patients worldwide",
      "continues investing in breakthrough research and development",
      "maintains global regulatory approvals across multiple markets",
      "partners with leading research institutions and healthcare systems"
    ]
  },

  // Retail
  "E-commerce": {
    templates: [
      "{company} is a leading e-commerce platform connecting millions of buyers and sellers through digital marketplaces.",
      "{company} operates comprehensive online retail services, delivering products and experiences to consumers worldwide.",
      "{company} stands as a major digital commerce innovator, providing seamless shopping and fulfillment solutions.",
      "{company} focuses on e-commerce technology, enabling businesses and consumers to trade efficiently online."
    ],
    specializations: [
      "online marketplace platforms and seller services",
      "digital payment processing and financial solutions",
      "logistics and fulfillment network operations",
      "cloud computing services and enterprise solutions",
      "artificial intelligence and recommendation systems",
      "cross-border commerce and international expansion"
    ],
    achievements: [
      "serves millions of active customers across global markets",
      "continues expanding marketplace and logistics capabilities",
      "leads in e-commerce innovation and customer experience",
      "enables thousands of businesses to reach worldwide audiences"
    ]
  },

  // Manufacturing
  "Automotive Manufacturing": {
    templates: [
      "{company} is a major automotive manufacturer producing vehicles and transportation solutions for global markets.",
      "{company} operates advanced manufacturing facilities, developing and producing innovative automotive technologies.",
      "{company} stands as a leading automotive company, delivering quality vehicles and mobility solutions worldwide.",
      "{company} focuses on automotive innovation, manufacturing efficient and sustainable transportation solutions."
    ],
    specializations: [
      "vehicle design and automotive engineering",
      "electric vehicle technology and battery systems",
      "autonomous driving systems and connected car technologies",
      "manufacturing efficiency and quality control processes",
      "global supply chain management and logistics",
      "aftermarket services and customer support programs"
    ],
    achievements: [
      "produces millions of vehicles for customers worldwide",
      "continues advancing electric and autonomous vehicle technologies",
      "maintains global manufacturing and distribution networks",
      "leads in automotive innovation and sustainability initiatives"
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
      "industry-specific products and comprehensive service solutions",
      "market-focused innovations and specialized expertise",
      "advanced technologies and customer-centered capabilities",
      "sector-relevant innovations and operational excellence",
      "strategic partnerships and collaborative service delivery",
      "industry-leading practices and quality standards"
    ],
    achievements: [
      "maintains competitive positioning in its market segment",
      "continues adapting to evolving industry developments and trends",
      "serves diverse client and customer bases with tailored solutions",
      "demonstrates ongoing commitment to operational excellence and innovation"
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