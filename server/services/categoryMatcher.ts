const SECTOR_ALIASES: Record<string, string[]> = {
  "Aerospace and Defense": [
    "aerospace", "defense", "defence", "military", "space",
    "aerospace & defense", "aerospace & defence", "aerospace and defence",
    "a&d", "air and space"
  ],
  "Agriculture": [
    "agriculture", "farming", "agric", "agricultural", "agribusiness",
    "agro", "agroindustry", "crop", "livestock", "horticulture"
  ],
  "Automobile": [
    "automobile", "automotive", "auto", "car", "vehicle", "motor",
    "vehicles", "cars", "motoring", "automobiles"
  ],
  "Banking and Financial Services": [
    "banking", "financial services", "finance", "financial", "bank",
    "banking & financial services", "banking and finance",
    "financial sector", "finserv", "money", "capital markets",
    "banking & financial", "banking & finance"
  ],
  "Chemicals": [
    "chemicals", "chemical", "petrochemicals", "specialty chemicals",
    "agrochemicals", "industrial chemicals"
  ],
  "Construction and Engineering": [
    "construction", "engineering", "building", "infrastructure",
    "construction & engineering", "civil engineering",
    "construction and eng", "built environment"
  ],
  "Education": [
    "education", "academic", "learning", "teaching", "edtech",
    "educational", "schools", "universities", "higher education",
    "e-learning"
  ],
  "Energy and Utilities": [
    "energy", "utilities", "power", "electricity", "utility",
    "energy & utilities", "oil and gas", "oil & gas",
    "renewable energy", "natural gas", "solar", "wind energy"
  ],
  "Food and Beverage": [
    "food", "beverage", "food & beverage", "f&b", "food and drink",
    "food & drink", "fmcg food", "food industry", "beverages"
  ],
  "Healthcare and Pharmaceuticals": [
    "healthcare", "pharmaceuticals", "pharma", "health", "medical",
    "healthcare & pharmaceuticals", "health care", "life sciences",
    "biotech", "biotechnology", "pharmaceutical", "drug", "hospital"
  ],
  "Insurance": [
    "insurance", "insurer", "underwriting", "reinsurance",
    "insurtech", "risk management"
  ],
  "Manufacturing": [
    "manufacturing", "industrial", "production", "factory",
    "maker", "fabrication", "assembly"
  ],
  "Media and Entertainment": [
    "media", "entertainment", "media & entertainment",
    "broadcasting", "publishing", "film", "television", "tv",
    "streaming", "content", "music", "gaming"
  ],
  "Professional Services": [
    "professional services", "consulting", "consultancy", "advisory",
    "legal", "accounting", "audit", "law", "management consulting",
    "business services"
  ],
  "Real Estate": [
    "real estate", "property", "realty", "housing", "land",
    "commercial property", "residential property", "real-estate",
    "proptech"
  ],
  "Retail": [
    "retail", "shopping", "store", "stores", "e-commerce",
    "ecommerce", "commerce", "consumer retail", "merchant"
  ],
  "Technology": [
    "technology", "tech", "it", "information technology", "ict",
    "software", "hardware", "computing", "digital", "cyber",
    "infotech", "hi-tech", "high-tech", "high tech"
  ],
  "Telecommunications and ICT": [
    "telecommunications", "telecom", "telco",
    "telecommunications & ict", "telecoms",
    "communications", "mobile networks", "wireless"
  ],
  "Transportation and Logistics": [
    "transportation", "logistics", "transport", "shipping",
    "freight", "supply chain", "transportation & logistics",
    "haulage", "distribution", "cargo",
    "airline", "airlines", "airways", "aviation",
    "air transport", "air carrier", "air travel",
    "rail", "railway", "railroad", "maritime", "port",
    "trucking", "courier", "delivery"
  ],
  "Travel and Tourism": [
    "travel", "tourism", "hospitality", "hotel", "hotels",
    "travel & tourism", "tour", "vacation", "leisure"
  ],
};

const INDUSTRY_ALIASES: Record<string, string[]> = {
  "Commercial Banking": ["commercial bank", "retail banking", "banking services"],
  "Investment Banking": ["investment bank", "ibanking", "i-banking"],
  "Asset Management": ["asset management", "investment management", "fund management", "wealth management services"],
  "Consumer Finance": ["consumer finance", "personal finance", "consumer lending"],
  "Credit Cards": ["credit card", "card issuer", "card services"],
  "Credit Rating Agencies": ["credit rating", "rating agency", "ratings"],
  "Cryptocurrency Exchanges": ["crypto exchange", "crypto trading", "cryptocurrency", "digital assets"],
  "FinTech": ["fintech", "financial technology", "fin-tech"],
  "Forex Services": ["forex", "foreign exchange", "fx services", "currency exchange"],
  "Hedge Funds": ["hedge fund", "alternative investments"],
  "Insurance Underwriting": ["insurance underwriting", "underwriter"],
  "Microfinance": ["microfinance", "micro-finance", "micro lending", "microcredit"],
  "Mortgage Lending": ["mortgage", "home loans", "housing finance"],
  "Payment Processing": ["payment processing", "payments", "payment gateway", "payment solutions"],
  "Pension Funds": ["pension fund", "retirement fund", "pension"],
  "Private Equity": ["private equity", "pe fund", "buyout"],
  "Stock Exchanges": ["stock exchange", "securities exchange", "bourse"],
  "Trade Finance": ["trade finance", "export finance", "import finance"],
  "Venture Capital": ["venture capital", "vc", "startup funding"],
  "Wealth Management": ["wealth management", "private banking", "hnwi"],
  "Enterprise Software": ["enterprise software", "business software", "erp", "crm"],
  "Data Analytics": ["data analytics", "big data", "business intelligence", "bi"],
  "3D Printing": ["3d printing", "additive manufacturing"],
  "AR/VR Hardware": ["ar/vr", "augmented reality", "virtual reality", "mixed reality"],
  "Biometric Systems": ["biometrics", "biometric", "fingerprint", "facial recognition"],
  "Blockchain Hardware": ["blockchain hardware", "crypto mining", "mining equipment"],
  "Computer Peripherals": ["peripherals", "computer accessories", "input devices"],
  "Edge Computing": ["edge computing", "edge infrastructure"],
  "Gaming Consoles": ["gaming console", "video game hardware", "game console"],
  "IoT Devices": ["iot", "internet of things", "connected devices"],
  "Quantum Computing": ["quantum computing", "quantum", "quantum tech"],
  "Robotics": ["robotics", "robots", "automation"],
  "Satellite Tech": ["satellite", "space tech", "satellite technology"],
  "Semiconductors": ["semiconductor", "chips", "chipmaker", "microchip"],
  "Wearable Tech": ["wearable", "smartwatch", "fitness tracker"],
  "Software Development": ["software development", "software engineering", "app development"],
  "Biopharmaceuticals": ["biopharma", "biopharmaceutical", "biologics"],
  "Clinical Research": ["clinical research", "clinical trials", "cro"],
  "Diagnostic Labs": ["diagnostic lab", "medical laboratory", "pathology"],
  "Elderly Care Tech": ["elderly care", "senior care tech", "geriatric tech"],
  "Generic Drugs": ["generic drugs", "generic pharma", "generic medicines"],
  "Genomics": ["genomics", "genome", "dna sequencing", "genetic testing"],
  "Health Analytics": ["health analytics", "healthcare analytics", "health data"],
  "Health Insurance": ["health insurance", "medical insurance", "health cover"],
  "Health Tourism": ["health tourism", "medical tourism"],
  "Hospital Management": ["hospital management", "hospital administration", "hospital chain"],
  "Telehealth": ["telehealth", "telemedicine", "virtual care"],
  "Vaccines": ["vaccines", "vaccination", "immunization"],
  "Wearable Health Tech": ["wearable health", "health wearable", "medical wearable"],
  "Pharmaceutical Manufacturing": ["pharma manufacturing", "drug manufacturing"],
  "Battery Storage": ["battery storage", "energy storage", "batteries"],
  "Biofuels": ["biofuels", "biofuel", "ethanol", "biodiesel"],
  "Carbon Capture": ["carbon capture", "ccs", "carbon sequestration"],
  "Electricity Distribution": ["electricity distribution", "power distribution", "electric utility"],
  "Energy Efficiency": ["energy efficiency", "energy conservation", "green energy"],
  "Energy Trading": ["energy trading", "power trading"],
  "Geothermal Plants": ["geothermal", "geothermal energy"],
  "Hydropower": ["hydropower", "hydroelectric", "hydro energy"],
  "LNG Terminals": ["lng", "liquefied natural gas"],
  "Natural Gas": ["natural gas", "gas distribution", "gas utility"],
  "Nuclear Power": ["nuclear power", "nuclear energy", "atomic energy"],
  "Offshore Drilling": ["offshore drilling", "deepwater drilling"],
  "Oil Exploration": ["oil exploration", "petroleum exploration", "upstream oil"],
  "Renewable Energy": ["renewable energy", "clean energy", "green power"],
  "Smart Grids": ["smart grid", "intelligent grid"],
  "Solar Panel Manufacturing": ["solar panel", "solar manufacturing", "photovoltaic"],
  "Wind Farm Operations": ["wind farm", "wind energy", "wind power"],
  "Water Utilities": ["water utility", "water treatment", "water supply"],
  "Air Cargo": ["air cargo", "air freight", "cargo airline"],
  "Airline Passenger Services": ["airline", "airlines", "airways", "passenger airline", "air travel", "air carrier", "air transport", "air services"],
  "Airport Operations": ["airport operations", "airport management", "airport services", "airport"],
  "Courier & Express Delivery": ["courier", "express delivery", "parcel delivery"],
  "E-commerce Logistics": ["ecommerce logistics", "e-commerce logistics", "fulfillment"],
  "Freight Forwarding": ["freight forwarding", "freight forwarder"],
  "Marine Shipping": ["marine shipping", "sea freight", "ocean shipping", "container shipping"],
  "Trucking & Road Freight": ["trucking", "road freight", "haulage"],
  "Rail Freight": ["rail freight", "railroad cargo"],
  "Rail Passenger Transport": ["rail passenger", "train services", "railway"],
  "Ride-Hailing & Taxi": ["ride-hailing", "taxi", "ride sharing", "rideshare"],
  "Warehousing & Distribution": ["warehousing", "distribution", "warehouse"],
  "Broadband Providers": ["broadband", "isp", "internet provider", "internet service provider"],
  "5G Infrastructure": ["5g", "5g infrastructure", "5g network"],
  "Cloud Telephony": ["cloud telephony", "cloud communications"],
  "Data Centers": ["data center", "colocation", "hosting"],
  "Fiber Optics": ["fiber optics", "fibre optics", "fiber network"],
  "IoT Solutions": ["iot solutions", "m2m", "machine to machine"],
  "Satellite Communications": ["satellite communications", "satcom"],
  "Telecom Equipment": ["telecom equipment", "network equipment"],
  "Wireless Carriers": ["wireless carrier", "mobile operator", "mobile carrier"],
  "Automotive Parts Retail": ["auto parts retail", "car parts store"],
  "Beauty Retailers": ["beauty retail", "cosmetics store", "beauty store"],
  "Department Stores": ["department store", "retail chain"],
  "Discount Stores": ["discount store", "dollar store", "value retail"],
  "E-commerce Marketplaces": ["e-commerce marketplace", "online marketplace", "online retail"],
  "Fast Fashion": ["fast fashion", "fashion retail"],
  "Grocery Chains": ["grocery chain", "supermarket", "grocery store"],
  "Luxury Fashion": ["luxury fashion", "luxury brand", "haute couture"],
  "Aerospace & Defense Manufacturing": ["aerospace manufacturing", "defense manufacturing"],
  "Automotive Manufacturing": ["auto manufacturing", "car manufacturing", "vehicle manufacturing"],
  "Chemical Manufacturing": ["chemical manufacturing", "chemical production"],
  "Electronics Manufacturing": ["electronics manufacturing", "ems", "electronics assembly"],
  "Food Processing": ["food processing", "food manufacturing"],
  "Industrial Machinery": ["industrial machinery", "heavy machinery", "machine tools"],
  "Medical Devices": ["medical devices", "medical equipment", "medtech"],
  "Steel & Metal Products": ["steel", "metals", "metal products", "steelmaking"],
  "Textile Manufacturing": ["textile manufacturing", "textiles", "fabric production"],
  "Advertising & Marketing": ["advertising", "marketing", "ad agency"],
  "Animation & VFX": ["animation", "vfx", "visual effects"],
  "Digital Media": ["digital media", "online media"],
  "Film Production": ["film production", "movie production", "film studio"],
  "Live Events": ["live events", "concerts", "event management"],
  "Music Labels": ["music label", "record label", "music publisher"],
  "News Agencies": ["news agency", "wire service", "news service"],
  "Social Media": ["social media", "social network", "social platform"],
  "Television Broadcasting": ["tv broadcasting", "television", "broadcast"],
  "Theme Parks": ["theme park", "amusement park"],
  "Architectural Services": ["architecture", "architectural design"],
  "Civil Engineering": ["civil engineering", "infrastructure engineering"],
  "Commercial Construction": ["commercial construction", "commercial building"],
  "Construction Materials": ["construction materials", "building supplies"],
  "Green Building Consulting": ["green building", "sustainable construction", "leed"],
  "Heavy Equipment": ["heavy equipment", "construction equipment", "earthmoving"],
  "Infrastructure Development": ["infrastructure development", "infrastructure project"],
  "Urban Planning": ["urban planning", "city planning", "town planning"],
  "Crop Production": ["crop production", "crop farming", "arable farming"],
  "Dairy Farming": ["dairy farming", "dairy production", "milk production"],
  "Livestock Production": ["livestock", "cattle farming", "animal husbandry"],
  "Aquaculture": ["aquaculture", "fish farming", "mariculture"],
  "Organic Farming": ["organic farming", "organic agriculture"],
  "Agricultural Equipment": ["agricultural equipment", "farm equipment", "farm machinery"],
  "Fertilizers & Nutrients": ["fertilizer", "fertiliser", "plant nutrients"],
  "Irrigation Systems": ["irrigation", "water management agriculture"],
  "Commercial Property": ["commercial property", "office space", "commercial real estate"],
  "Residential Development": ["residential development", "housing development"],
  "Property Management": ["property management", "real estate management"],
  "REITs": ["reit", "real estate investment trust"],
  "Vacation Rentals": ["vacation rental", "holiday rental", "short-term rental", "airbnb"],
  "Hotels & Resorts": ["hotels", "resorts", "hotel chain", "hospitality"],
  "Cruise Lines": ["cruise line", "cruise ship", "ocean cruise"],
  "Eco-Tourism": ["eco-tourism", "ecotourism", "sustainable tourism"],
  "Cultural Heritage Tourism": ["cultural tourism", "heritage tourism"],
  "Event Tourism": ["event tourism", "mice", "convention tourism"],
  "Life Insurance": ["life insurance", "life cover", "life assurance"],
  "Auto Insurance": ["auto insurance", "car insurance", "motor insurance"],
  "Health Insurance (Insurance)": ["health insurance company", "medical insurance company"],
  "Crop Insurance": ["crop insurance", "agricultural insurance"],
  "Cyber Insurance": ["cyber insurance", "cyber risk insurance"],
  "Disability Insurance": ["disability insurance", "income protection"],
  "Insurance Brokerage": ["insurance broker", "insurance brokerage"],
  "InsurTech": ["insurtech", "insurance technology"],
  "Liability Insurance": ["liability insurance", "general liability"],
  "Accounting & Audit": ["accounting", "audit", "auditing", "cpa"],
  "Architecture & Design": ["architecture", "design firm"],
  "Corporate Training": ["corporate training", "business training"],
  "Engineering Consulting": ["engineering consulting", "technical consulting"],
  "Environmental Consulting": ["environmental consulting", "eco consulting"],
  "Executive Search": ["executive search", "headhunting", "recruitment"],
  "Healthcare Consulting": ["healthcare consulting", "health advisory"],
  "HR Consulting": ["hr consulting", "human resources consulting"],
  "IT Consulting": ["it consulting", "technology consulting"],
  "Legal Services": ["legal services", "law firm", "legal"],
  "EdTech": ["edtech", "education technology", "educational technology"],
  "Early Childhood Education": ["early childhood education", "preschool", "kindergarten"],
  "Language Learning": ["language learning", "language school"],
  "Educational Publishing": ["educational publishing", "academic publishing"],
  "Beverage Production": ["beverage production", "drink manufacturing"],
  "Bakery & Confectionery": ["bakery", "confectionery", "baked goods"],
  "Dairy Products": ["dairy products", "dairy processing"],
  "Meat Processing": ["meat processing", "meat industry"],
  "Seafood Processing": ["seafood processing", "fish processing"],
  "Snack Foods": ["snack foods", "snacks", "savory snacks"],
  "Soft Drinks": ["soft drinks", "carbonated beverages", "soda"],
};

// Authoritative lookup: given an industry name, what is its correct sector?
// This prevents the categorizer from guessing sector independently (which causes wrong matches).
const INDUSTRY_TO_SECTOR: Record<string, string> = {
  // Banking and Financial Services
  "Commercial Banking": "Banking and Financial Services",
  "Investment Banking": "Banking and Financial Services",
  "Asset Management": "Banking and Financial Services",
  "Consumer Finance": "Banking and Financial Services",
  "Credit Cards": "Banking and Financial Services",
  "Credit Rating Agencies": "Banking and Financial Services",
  "Cryptocurrency Exchanges": "Banking and Financial Services",
  "FinTech": "Banking and Financial Services",
  "Forex Services": "Banking and Financial Services",
  "Hedge Funds": "Banking and Financial Services",
  "Microfinance": "Banking and Financial Services",
  "Mortgage Lending": "Banking and Financial Services",
  "Payment Processing": "Banking and Financial Services",
  "Pension Funds": "Banking and Financial Services",
  "Private Equity": "Banking and Financial Services",
  "Stock Exchanges": "Banking and Financial Services",
  "Trade Finance": "Banking and Financial Services",
  "Venture Capital": "Banking and Financial Services",
  "Wealth Management": "Banking and Financial Services",

  // Technology
  "Enterprise Software": "Technology",
  "Data Analytics": "Technology",
  "3D Printing": "Technology",
  "AR/VR Hardware": "Technology",
  "Biometric Systems": "Technology",
  "Blockchain Hardware": "Technology",
  "Computer Peripherals": "Technology",
  "Edge Computing": "Technology",
  "Gaming Consoles": "Technology",
  "IoT Devices": "Technology",
  "Quantum Computing": "Technology",
  "Robotics": "Technology",
  "Satellite Tech": "Technology",
  "Semiconductors": "Technology",
  "Wearable Tech": "Technology",
  "Software Development": "Technology",

  // Healthcare and Pharmaceuticals
  "Biopharmaceuticals": "Healthcare and Pharmaceuticals",
  "Clinical Research": "Healthcare and Pharmaceuticals",
  "Diagnostic Labs": "Healthcare and Pharmaceuticals",
  "Elderly Care Tech": "Healthcare and Pharmaceuticals",
  "Generic Drugs": "Healthcare and Pharmaceuticals",
  "Genomics": "Healthcare and Pharmaceuticals",
  "Health Analytics": "Healthcare and Pharmaceuticals",
  "Health Insurance": "Healthcare and Pharmaceuticals",
  "Health Tourism": "Healthcare and Pharmaceuticals",
  "Hospital Management": "Healthcare and Pharmaceuticals",
  "Telehealth": "Healthcare and Pharmaceuticals",
  "Vaccines": "Healthcare and Pharmaceuticals",
  "Wearable Health Tech": "Healthcare and Pharmaceuticals",
  "Pharmaceutical Manufacturing": "Healthcare and Pharmaceuticals",
  "Medical Devices": "Manufacturing",

  // Energy and Utilities
  "Battery Storage": "Energy and Utilities",
  "Biofuels": "Energy and Utilities",
  "Carbon Capture": "Energy and Utilities",
  "Electricity Distribution": "Energy and Utilities",
  "Energy Efficiency": "Energy and Utilities",
  "Energy Trading": "Energy and Utilities",
  "Geothermal Plants": "Energy and Utilities",
  "Hydropower": "Energy and Utilities",
  "LNG Terminals": "Energy and Utilities",
  "Natural Gas": "Energy and Utilities",
  "Nuclear Power": "Energy and Utilities",
  "Offshore Drilling": "Energy and Utilities",
  "Oil Exploration": "Energy and Utilities",
  "Renewable Energy": "Energy and Utilities",
  "Smart Grids": "Energy and Utilities",
  "Solar Panel Manufacturing": "Energy and Utilities",
  "Wind Farm Operations": "Energy and Utilities",
  "Water Utilities": "Energy and Utilities",

  // Transportation and Logistics
  "Air Cargo": "Transportation and Logistics",
  "Airline Passenger Services": "Transportation and Logistics",
  "Airport Operations": "Transportation and Logistics",
  "Courier & Express Delivery": "Transportation and Logistics",
  "E-commerce Logistics": "Transportation and Logistics",
  "Freight Forwarding": "Transportation and Logistics",
  "Marine Shipping": "Transportation and Logistics",
  "Trucking & Road Freight": "Transportation and Logistics",
  "Rail Freight": "Transportation and Logistics",
  "Rail Passenger Transport": "Transportation and Logistics",
  "Ride-Hailing & Taxi": "Transportation and Logistics",
  "Warehousing & Distribution": "Transportation and Logistics",

  // Telecommunications and ICT
  "Broadband Providers": "Telecommunications and ICT",
  "5G Infrastructure": "Telecommunications and ICT",
  "Cloud Telephony": "Telecommunications and ICT",
  "Data Centers": "Telecommunications and ICT",
  "Fiber Optics": "Telecommunications and ICT",
  "IoT Solutions": "Telecommunications and ICT",
  "Satellite Communications": "Telecommunications and ICT",
  "Telecom Equipment": "Telecommunications and ICT",
  "Wireless Carriers": "Telecommunications and ICT",

  // Retail
  "Automotive Parts Retail": "Retail",
  "Beauty Retailers": "Retail",
  "Department Stores": "Retail",
  "Discount Stores": "Retail",
  "E-commerce Marketplaces": "Retail",
  "Fast Fashion": "Retail",
  "Grocery Chains": "Retail",
  "Luxury Fashion": "Retail",

  // Manufacturing
  "Aerospace & Defense Manufacturing": "Manufacturing",
  "Automotive Manufacturing": "Manufacturing",
  "Chemical Manufacturing": "Manufacturing",
  "Electronics Manufacturing": "Manufacturing",
  "Food Processing": "Food and Beverage",
  "Industrial Machinery": "Manufacturing",
  "Steel & Metal Products": "Manufacturing",
  "Textile Manufacturing": "Manufacturing",

  // Media and Entertainment
  "Advertising & Marketing": "Media and Entertainment",
  "Animation & VFX": "Media and Entertainment",
  "Digital Media": "Media and Entertainment",
  "Film Production": "Media and Entertainment",
  "Live Events": "Media and Entertainment",
  "Music Labels": "Media and Entertainment",
  "News Agencies": "Media and Entertainment",
  "Social Media": "Media and Entertainment",
  "Television Broadcasting": "Media and Entertainment",
  "Theme Parks": "Media and Entertainment",

  // Construction and Engineering
  "Architectural Services": "Construction and Engineering",
  "Civil Engineering": "Construction and Engineering",
  "Commercial Construction": "Construction and Engineering",
  "Construction Materials": "Construction and Engineering",
  "Green Building Consulting": "Construction and Engineering",
  "Heavy Equipment": "Construction and Engineering",
  "Infrastructure Development": "Construction and Engineering",
  "Urban Planning": "Construction and Engineering",

  // Agriculture
  "Crop Production": "Agriculture",
  "Dairy Farming": "Agriculture",
  "Livestock Production": "Agriculture",
  "Aquaculture": "Agriculture",
  "Organic Farming": "Agriculture",
  "Agricultural Equipment": "Agriculture",
  "Fertilizers & Nutrients": "Agriculture",
  "Irrigation Systems": "Agriculture",

  // Real Estate
  "Commercial Property": "Real Estate",
  "Residential Development": "Real Estate",
  "Property Management": "Real Estate",
  "REITs": "Real Estate",
  "Vacation Rentals": "Real Estate",

  // Travel and Tourism
  "Hotels & Resorts": "Travel and Tourism",
  "Cruise Lines": "Travel and Tourism",
  "Eco-Tourism": "Travel and Tourism",
  "Cultural Heritage Tourism": "Travel and Tourism",
  "Event Tourism": "Travel and Tourism",

  // Insurance
  "Insurance Underwriting": "Insurance",
  "Life Insurance": "Insurance",
  "Auto Insurance": "Insurance",
  "Health Insurance (Insurance)": "Insurance",
  "Crop Insurance": "Insurance",
  "Cyber Insurance": "Insurance",
  "Disability Insurance": "Insurance",
  "Insurance Brokerage": "Insurance",
  "InsurTech": "Insurance",
  "Liability Insurance": "Insurance",

  // Professional Services
  "Accounting & Audit": "Professional Services",
  "Architecture & Design": "Professional Services",
  "Corporate Training": "Professional Services",
  "Engineering Consulting": "Professional Services",
  "Environmental Consulting": "Professional Services",
  "Executive Search": "Professional Services",
  "Healthcare Consulting": "Professional Services",
  "HR Consulting": "Professional Services",
  "IT Consulting": "Professional Services",
  "Legal Services": "Professional Services",

  // Education
  "EdTech": "Education",
  "Early Childhood Education": "Education",
  "Language Learning": "Education",
  "Educational Publishing": "Education",

  // Food and Beverage
  "Beverage Production": "Food and Beverage",
  "Bakery & Confectionery": "Food and Beverage",
  "Dairy Products": "Food and Beverage",
  "Meat Processing": "Food and Beverage",
  "Seafood Processing": "Food and Beverage",
  "Snack Foods": "Food and Beverage",
  "Soft Drinks": "Food and Beverage",

  // Chemicals
  "Chemical Manufacturing": "Chemicals",

  // Automobile
  "Automotive Parts Retail": "Automobile",
};

interface MatchResult {
  name: string;
  confidence: number;
  matchType: "exact" | "alias" | "fuzzy";
  needsReview: boolean;
}

interface CategoryMatchResult {
  sector: MatchResult | null;
  industry: MatchResult | null;
}

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ");
}

function tokenize(s: string): string[] {
  return normalize(s).split(" ").filter(Boolean);
}

function tokenOverlapScore(a: string, b: string): number {
  const tokensA = tokenize(a);
  const tokensB = tokenize(b);
  if (tokensA.length === 0 || tokensB.length === 0) return 0;
  const setB = new Set(tokensB);
  let overlap = 0;
  for (const t of tokensA) {
    if (setB.has(t)) overlap++;
  }
  return (2 * overlap) / (tokensA.length + tokensB.length);
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[m][n];
}

function levenshteinSimilarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 1;
  const maxLen = Math.max(na.length, nb.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(na, nb) / maxLen;
}

function combinedSimilarity(input: string, candidate: string): number {
  const levSim = levenshteinSimilarity(input, candidate);
  const tokenSim = tokenOverlapScore(input, candidate);
  return Math.max(levSim, tokenSim);
}

const REVIEW_THRESHOLD = 0.45;

export function matchSector(input: string): MatchResult {
  const normalizedInput = normalize(input);

  for (const [sectorName, aliases] of Object.entries(SECTOR_ALIASES)) {
    if (normalize(sectorName) === normalizedInput) {
      return { name: sectorName, confidence: 1.0, matchType: "exact", needsReview: false };
    }
  }

  for (const [sectorName, aliases] of Object.entries(SECTOR_ALIASES)) {
    for (const alias of aliases) {
      if (normalize(alias) === normalizedInput) {
        return { name: sectorName, confidence: 0.95, matchType: "alias", needsReview: false };
      }
    }
  }

  for (const [sectorName, aliases] of Object.entries(SECTOR_ALIASES)) {
    for (const alias of aliases) {
      if (normalizedInput.includes(normalize(alias)) || normalize(alias).includes(normalizedInput)) {
        return { name: sectorName, confidence: 0.8, matchType: "alias", needsReview: false };
      }
    }
  }

  let bestMatch = "";
  let bestScore = 0;

  for (const sectorName of Object.keys(SECTOR_ALIASES)) {
    const score = combinedSimilarity(input, sectorName);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = sectorName;
    }
    const aliases = SECTOR_ALIASES[sectorName];
    for (const alias of aliases) {
      const aliasScore = combinedSimilarity(input, alias);
      if (aliasScore > bestScore) {
        bestScore = aliasScore;
        bestMatch = sectorName;
      }
    }
  }

  if (bestScore > 0) {
    return {
      name: bestMatch,
      confidence: Math.round(bestScore * 100) / 100,
      matchType: "fuzzy",
      needsReview: bestScore < REVIEW_THRESHOLD,
    };
  }

  return {
    name: "",
    confidence: 0,
    matchType: "fuzzy",
    needsReview: true,
  };
}

export function matchIndustry(input: string, sectorHint?: string): MatchResult {
  const normalizedInput = normalize(input);

  for (const [industryName] of Object.entries(INDUSTRY_ALIASES)) {
    if (normalize(industryName) === normalizedInput) {
      return { name: industryName, confidence: 1.0, matchType: "exact", needsReview: false };
    }
  }

  for (const [industryName, aliases] of Object.entries(INDUSTRY_ALIASES)) {
    for (const alias of aliases) {
      if (normalize(alias) === normalizedInput) {
        return { name: industryName, confidence: 0.95, matchType: "alias", needsReview: false };
      }
    }
  }

  for (const [industryName, aliases] of Object.entries(INDUSTRY_ALIASES)) {
    for (const alias of aliases) {
      if (normalizedInput.includes(normalize(alias)) || normalize(alias).includes(normalizedInput)) {
        return { name: industryName, confidence: 0.8, matchType: "alias", needsReview: false };
      }
    }
  }

  let bestMatch = "";
  let bestScore = 0;

  for (const industryName of Object.keys(INDUSTRY_ALIASES)) {
    const score = combinedSimilarity(input, industryName);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = industryName;
    }
    const aliases = INDUSTRY_ALIASES[industryName];
    for (const alias of aliases) {
      const aliasScore = combinedSimilarity(input, alias);
      if (aliasScore > bestScore) {
        bestScore = aliasScore;
        bestMatch = industryName;
      }
    }
  }

  if (bestScore > 0) {
    return {
      name: bestMatch,
      confidence: Math.round(bestScore * 100) / 100,
      matchType: "fuzzy",
      needsReview: bestScore < REVIEW_THRESHOLD,
    };
  }

  return {
    name: "",
    confidence: 0,
    matchType: "fuzzy",
    needsReview: true,
  };
}

/**
 * The correct way to categorize a company by probe string.
 * 
 * This function derives the sector FROM the industry match (via INDUSTRY_TO_SECTOR),
 * rather than running matchSector independently. This prevents cases like
 * "African Express Airways airline" being assigned to "Banking" because the
 * levenshtein algorithm misfires on the company name when sector is guessed
 * independently from industry.
 * 
 * Algorithm:
 * 1. Run matchIndustry on the probe string first.
 * 2. If industry confidence >= 0.5, look up the correct sector from INDUSTRY_TO_SECTOR.
 * 3. Only if industry confidence < 0.5 (no useful industry match), fall back to
 *    matchSector independently.
 */
export function matchCategoryForCompany(probe: string): {
  sectorName: string;
  industryName: string;
  confidence: string;
} {
  const industryMatch = matchIndustry(probe);

  if (industryMatch.name && industryMatch.confidence >= 0.5) {
    // Derive sector from industry — this is always correct
    const derivedSector = INDUSTRY_TO_SECTOR[industryMatch.name] || '';

    // If we have a known sector mapping, use it
    if (derivedSector) {
      const avgConfidence = industryMatch.confidence;
      const confidence = avgConfidence >= 0.8 ? 'high' : avgConfidence >= 0.5 ? 'medium' : 'low';
      return {
        sectorName: derivedSector,
        industryName: industryMatch.name,
        confidence,
      };
    }

    // Industry matched but no sector mapping — run sector matcher as fallback
    const sectorMatch = matchSector(probe);
    const avgConfidence = (sectorMatch.confidence + industryMatch.confidence) / 2;
    const confidence = avgConfidence >= 0.8 ? 'high' : avgConfidence >= 0.5 ? 'medium' : 'low';
    return {
      sectorName: sectorMatch.name || 'Uncategorized',
      industryName: industryMatch.name,
      confidence,
    };
  }

  // Low-confidence industry match — run sector independently, then re-derive industry
  const sectorMatch = matchSector(probe);
  const avgConfidence = (sectorMatch.confidence + (industryMatch?.confidence || 0)) / 2;
  const confidence = avgConfidence >= 0.8 ? 'high' : avgConfidence >= 0.5 ? 'medium' : 'low';
  return {
    sectorName: sectorMatch.name || 'Uncategorized',
    industryName: industryMatch.name || 'Uncategorized',
    confidence,
  };
}

export function matchCategory(sectorInput: string, industryInput?: string): CategoryMatchResult {
  const sectorResult = matchSector(sectorInput);
  const industryResult = industryInput ? matchIndustry(industryInput, sectorResult.name) : null;

  return {
    sector: sectorResult,
    industry: industryResult,
  };
}

export function getSectorAliases(): Record<string, string[]> {
  return SECTOR_ALIASES;
}

export function getIndustryAliases(): Record<string, string[]> {
  return INDUSTRY_ALIASES;
}
