// Geographic reference data: Continents, Regions, and Countries
// Based on UN geoscheme and ISO 3166 standards

export const continentsData = [
  {
    name: 'Africa',
    slug: 'africa',
    code: 'AF',
    description: 'The second-largest and second-most-populous continent'
  },
  {
    name: 'Asia',
    slug: 'asia',
    code: 'AS',
    description: 'The largest and most populous continent'
  },
  {
    name: 'Europe',
    slug: 'europe',
    code: 'EU',
    description: 'A continent rich in history and cultural diversity'
  },
  {
    name: 'North America',
    slug: 'north-america',
    code: 'NA',
    description: 'A continent of economic powerhouses and diverse landscapes'
  },
  {
    name: 'South America',
    slug: 'south-america',
    code: 'SA',
    description: 'A continent known for biodiversity and vibrant cultures'
  },
  {
    name: 'Oceania',
    slug: 'oceania',
    code: 'OC',
    description: 'A region of islands in the Pacific Ocean'
  },
  {
    name: 'Antarctica',
    slug: 'antarctica',
    code: 'AN',
    description: 'The southernmost continent, mostly uninhabited'
  }
];

export const regionsData = [
  // Africa regions
  { name: 'Northern Africa', slug: 'northern-africa', continentCode: 'AF' },
  { name: 'Western Africa', slug: 'western-africa', continentCode: 'AF' },
  { name: 'Middle Africa', slug: 'middle-africa', continentCode: 'AF' },
  { name: 'Eastern Africa', slug: 'eastern-africa', continentCode: 'AF' },
  { name: 'Southern Africa', slug: 'southern-africa', continentCode: 'AF' },
  
  // Asia regions
  { name: 'Western Asia', slug: 'western-asia', continentCode: 'AS' },
  { name: 'Central Asia', slug: 'central-asia', continentCode: 'AS' },
  { name: 'Southern Asia', slug: 'southern-asia', continentCode: 'AS' },
  { name: 'Southeast Asia', slug: 'southeast-asia', continentCode: 'AS' },
  { name: 'Eastern Asia', slug: 'eastern-asia', continentCode: 'AS' },
  
  // Europe regions
  { name: 'Northern Europe', slug: 'northern-europe', continentCode: 'EU' },
  { name: 'Western Europe', slug: 'western-europe', continentCode: 'EU' },
  { name: 'Eastern Europe', slug: 'eastern-europe', continentCode: 'EU' },
  { name: 'Southern Europe', slug: 'southern-europe', continentCode: 'EU' },
  
  // North America regions
  { name: 'Northern America', slug: 'northern-america', continentCode: 'NA' },
  { name: 'Central America', slug: 'central-america', continentCode: 'NA' },
  { name: 'Caribbean', slug: 'caribbean', continentCode: 'NA' },
  
  // South America regions
  { name: 'South America', slug: 'south-america-region', continentCode: 'SA' },
  
  // Oceania regions
  { name: 'Australia and New Zealand', slug: 'australia-new-zealand', continentCode: 'OC' },
  { name: 'Melanesia', slug: 'melanesia', continentCode: 'OC' },
  { name: 'Micronesia', slug: 'micronesia', continentCode: 'OC' },
  { name: 'Polynesia', slug: 'polynesia', continentCode: 'OC' },
];

export const countriesData = [
  // Africa - Northern
  { name: 'Algeria', slug: 'algeria', iso2: 'DZ', iso3: 'DZA', phoneCode: '+213', capital: 'Algiers', currency: 'DZD', regionSlug: 'northern-africa', flagEmoji: '🇩🇿' },
  { name: 'Egypt', slug: 'egypt', iso2: 'EG', iso3: 'EGY', phoneCode: '+20', capital: 'Cairo', currency: 'EGP', regionSlug: 'northern-africa', flagEmoji: '🇪🇬' },
  { name: 'Libya', slug: 'libya', iso2: 'LY', iso3: 'LBY', phoneCode: '+218', capital: 'Tripoli', currency: 'LYD', regionSlug: 'northern-africa', flagEmoji: '🇱🇾' },
  { name: 'Morocco', slug: 'morocco', iso2: 'MA', iso3: 'MAR', phoneCode: '+212', capital: 'Rabat', currency: 'MAD', regionSlug: 'northern-africa', flagEmoji: '🇲🇦' },
  { name: 'Sudan', slug: 'sudan', iso2: 'SD', iso3: 'SDN', phoneCode: '+249', capital: 'Khartoum', currency: 'SDG', regionSlug: 'northern-africa', flagEmoji: '🇸🇩' },
  { name: 'Tunisia', slug: 'tunisia', iso2: 'TN', iso3: 'TUN', phoneCode: '+216', capital: 'Tunis', currency: 'TND', regionSlug: 'northern-africa', flagEmoji: '🇹🇳' },
  
  // Africa - Western
  { name: 'Benin', slug: 'benin', iso2: 'BJ', iso3: 'BEN', phoneCode: '+229', capital: 'Porto-Novo', currency: 'XOF', regionSlug: 'western-africa', flagEmoji: '🇧🇯' },
  { name: 'Burkina Faso', slug: 'burkina-faso', iso2: 'BF', iso3: 'BFA', phoneCode: '+226', capital: 'Ouagadougou', currency: 'XOF', regionSlug: 'western-africa', flagEmoji: '🇧🇫' },
  { name: 'Cabo Verde', slug: 'cabo-verde', iso2: 'CV', iso3: 'CPV', phoneCode: '+238', capital: 'Praia', currency: 'CVE', regionSlug: 'western-africa', flagEmoji: '🇨🇻' },
  { name: 'Côte d\'Ivoire', slug: 'cote-d-ivoire', iso2: 'CI', iso3: 'CIV', phoneCode: '+225', capital: 'Yamoussoukro', currency: 'XOF', regionSlug: 'western-africa', flagEmoji: '🇨🇮' },
  { name: 'Gambia', slug: 'gambia', iso2: 'GM', iso3: 'GMB', phoneCode: '+220', capital: 'Banjul', currency: 'GMD', regionSlug: 'western-africa', flagEmoji: '🇬🇲' },
  { name: 'Ghana', slug: 'ghana', iso2: 'GH', iso3: 'GHA', phoneCode: '+233', capital: 'Accra', currency: 'GHS', regionSlug: 'western-africa', flagEmoji: '🇬🇭' },
  { name: 'Guinea', slug: 'guinea', iso2: 'GN', iso3: 'GIN', phoneCode: '+224', capital: 'Conakry', currency: 'GNF', regionSlug: 'western-africa', flagEmoji: '🇬🇳' },
  { name: 'Guinea-Bissau', slug: 'guinea-bissau', iso2: 'GW', iso3: 'GNB', phoneCode: '+245', capital: 'Bissau', currency: 'XOF', regionSlug: 'western-africa', flagEmoji: '🇬🇼' },
  { name: 'Liberia', slug: 'liberia', iso2: 'LR', iso3: 'LBR', phoneCode: '+231', capital: 'Monrovia', currency: 'LRD', regionSlug: 'western-africa', flagEmoji: '🇱🇷' },
  { name: 'Mali', slug: 'mali', iso2: 'ML', iso3: 'MLI', phoneCode: '+223', capital: 'Bamako', currency: 'XOF', regionSlug: 'western-africa', flagEmoji: '🇲🇱' },
  { name: 'Mauritania', slug: 'mauritania', iso2: 'MR', iso3: 'MRT', phoneCode: '+222', capital: 'Nouakchott', currency: 'MRU', regionSlug: 'western-africa', flagEmoji: '🇲🇷' },
  { name: 'Niger', slug: 'niger', iso2: 'NE', iso3: 'NER', phoneCode: '+227', capital: 'Niamey', currency: 'XOF', regionSlug: 'western-africa', flagEmoji: '🇳🇪' },
  { name: 'Nigeria', slug: 'nigeria', iso2: 'NG', iso3: 'NGA', phoneCode: '+234', capital: 'Abuja', currency: 'NGN', regionSlug: 'western-africa', flagEmoji: '🇳🇬' },
  { name: 'Senegal', slug: 'senegal', iso2: 'SN', iso3: 'SEN', phoneCode: '+221', capital: 'Dakar', currency: 'XOF', regionSlug: 'western-africa', flagEmoji: '🇸🇳' },
  { name: 'Sierra Leone', slug: 'sierra-leone', iso2: 'SL', iso3: 'SLE', phoneCode: '+232', capital: 'Freetown', currency: 'SLL', regionSlug: 'western-africa', flagEmoji: '🇸🇱' },
  { name: 'Togo', slug: 'togo', iso2: 'TG', iso3: 'TGO', phoneCode: '+228', capital: 'Lomé', currency: 'XOF', regionSlug: 'western-africa', flagEmoji: '🇹🇬' },
  
  // Africa - Eastern
  { name: 'Burundi', slug: 'burundi', iso2: 'BI', iso3: 'BDI', phoneCode: '+257', capital: 'Gitega', currency: 'BIF', regionSlug: 'eastern-africa', flagEmoji: '🇧🇮' },
  { name: 'Comoros', slug: 'comoros', iso2: 'KM', iso3: 'COM', phoneCode: '+269', capital: 'Moroni', currency: 'KMF', regionSlug: 'eastern-africa', flagEmoji: '🇰🇲' },
  { name: 'Djibouti', slug: 'djibouti', iso2: 'DJ', iso3: 'DJI', phoneCode: '+253', capital: 'Djibouti', currency: 'DJF', regionSlug: 'eastern-africa', flagEmoji: '🇩🇯' },
  { name: 'Eritrea', slug: 'eritrea', iso2: 'ER', iso3: 'ERI', phoneCode: '+291', capital: 'Asmara', currency: 'ERN', regionSlug: 'eastern-africa', flagEmoji: '🇪🇷' },
  { name: 'Ethiopia', slug: 'ethiopia', iso2: 'ET', iso3: 'ETH', phoneCode: '+251', capital: 'Addis Ababa', currency: 'ETB', regionSlug: 'eastern-africa', flagEmoji: '🇪🇹' },
  { name: 'Kenya', slug: 'kenya', iso2: 'KE', iso3: 'KEN', phoneCode: '+254', capital: 'Nairobi', currency: 'KES', regionSlug: 'eastern-africa', flagEmoji: '🇰🇪' },
  { name: 'Madagascar', slug: 'madagascar', iso2: 'MG', iso3: 'MDG', phoneCode: '+261', capital: 'Antananarivo', currency: 'MGA', regionSlug: 'eastern-africa', flagEmoji: '🇲🇬' },
  { name: 'Malawi', slug: 'malawi', iso2: 'MW', iso3: 'MWI', phoneCode: '+265', capital: 'Lilongwe', currency: 'MWK', regionSlug: 'eastern-africa', flagEmoji: '🇲🇼' },
  { name: 'Mauritius', slug: 'mauritius', iso2: 'MU', iso3: 'MUS', phoneCode: '+230', capital: 'Port Louis', currency: 'MUR', regionSlug: 'eastern-africa', flagEmoji: '🇲🇺' },
  { name: 'Mozambique', slug: 'mozambique', iso2: 'MZ', iso3: 'MOZ', phoneCode: '+258', capital: 'Maputo', currency: 'MZN', regionSlug: 'eastern-africa', flagEmoji: '🇲🇿' },
  { name: 'Rwanda', slug: 'rwanda', iso2: 'RW', iso3: 'RWA', phoneCode: '+250', capital: 'Kigali', currency: 'RWF', regionSlug: 'eastern-africa', flagEmoji: '🇷🇼' },
  { name: 'Seychelles', slug: 'seychelles', iso2: 'SC', iso3: 'SYC', phoneCode: '+248', capital: 'Victoria', currency: 'SCR', regionSlug: 'eastern-africa', flagEmoji: '🇸🇨' },
  { name: 'Somalia', slug: 'somalia', iso2: 'SO', iso3: 'SOM', phoneCode: '+252', capital: 'Mogadishu', currency: 'SOS', regionSlug: 'eastern-africa', flagEmoji: '🇸🇴' },
  { name: 'South Sudan', slug: 'south-sudan', iso2: 'SS', iso3: 'SSD', phoneCode: '+211', capital: 'Juba', currency: 'SSP', regionSlug: 'eastern-africa', flagEmoji: '🇸🇸' },
  { name: 'Tanzania', slug: 'tanzania', iso2: 'TZ', iso3: 'TZA', phoneCode: '+255', capital: 'Dodoma', currency: 'TZS', regionSlug: 'eastern-africa', flagEmoji: '🇹🇿' },
  { name: 'Uganda', slug: 'uganda', iso2: 'UG', iso3: 'UGA', phoneCode: '+256', capital: 'Kampala', currency: 'UGX', regionSlug: 'eastern-africa', flagEmoji: '🇺🇬' },
  { name: 'Zambia', slug: 'zambia', iso2: 'ZM', iso3: 'ZMB', phoneCode: '+260', capital: 'Lusaka', currency: 'ZMW', regionSlug: 'eastern-africa', flagEmoji: '🇿🇲' },
  { name: 'Zimbabwe', slug: 'zimbabwe', iso2: 'ZW', iso3: 'ZWE', phoneCode: '+263', capital: 'Harare', currency: 'ZWL', regionSlug: 'eastern-africa', flagEmoji: '🇿🇼' },
  
  // Africa - Middle
  { name: 'Angola', slug: 'angola', iso2: 'AO', iso3: 'AGO', phoneCode: '+244', capital: 'Luanda', currency: 'AOA', regionSlug: 'middle-africa', flagEmoji: '🇦🇴' },
  { name: 'Cameroon', slug: 'cameroon', iso2: 'CM', iso3: 'CMR', phoneCode: '+237', capital: 'Yaoundé', currency: 'XAF', regionSlug: 'middle-africa', flagEmoji: '🇨🇲' },
  { name: 'Central African Republic', slug: 'central-african-republic', iso2: 'CF', iso3: 'CAF', phoneCode: '+236', capital: 'Bangui', currency: 'XAF', regionSlug: 'middle-africa', flagEmoji: '🇨🇫' },
  { name: 'Chad', slug: 'chad', iso2: 'TD', iso3: 'TCD', phoneCode: '+235', capital: 'N\'Djamena', currency: 'XAF', regionSlug: 'middle-africa', flagEmoji: '🇹🇩' },
  { name: 'Congo', slug: 'congo', iso2: 'CG', iso3: 'COG', phoneCode: '+242', capital: 'Brazzaville', currency: 'XAF', regionSlug: 'middle-africa', flagEmoji: '🇨🇬' },
  { name: 'Democratic Republic of the Congo', slug: 'democratic-republic-congo', iso2: 'CD', iso3: 'COD', phoneCode: '+243', capital: 'Kinshasa', currency: 'CDF', regionSlug: 'middle-africa', flagEmoji: '🇨🇩' },
  { name: 'Equatorial Guinea', slug: 'equatorial-guinea', iso2: 'GQ', iso3: 'GNQ', phoneCode: '+240', capital: 'Malabo', currency: 'XAF', regionSlug: 'middle-africa', flagEmoji: '🇬🇶' },
  { name: 'Gabon', slug: 'gabon', iso2: 'GA', iso3: 'GAB', phoneCode: '+241', capital: 'Libreville', currency: 'XAF', regionSlug: 'middle-africa', flagEmoji: '🇬🇦' },
  { name: 'São Tomé and Príncipe', slug: 'sao-tome-principe', iso2: 'ST', iso3: 'STP', phoneCode: '+239', capital: 'São Tomé', currency: 'STN', regionSlug: 'middle-africa', flagEmoji: '🇸🇹' },
  
  // Africa - Southern
  { name: 'Botswana', slug: 'botswana', iso2: 'BW', iso3: 'BWA', phoneCode: '+267', capital: 'Gaborone', currency: 'BWP', regionSlug: 'southern-africa', flagEmoji: '🇧🇼' },
  { name: 'Eswatini', slug: 'eswatini', iso2: 'SZ', iso3: 'SWZ', phoneCode: '+268', capital: 'Mbabane', currency: 'SZL', regionSlug: 'southern-africa', flagEmoji: '🇸🇿' },
  { name: 'Lesotho', slug: 'lesotho', iso2: 'LS', iso3: 'LSO', phoneCode: '+266', capital: 'Maseru', currency: 'LSL', regionSlug: 'southern-africa', flagEmoji: '🇱🇸' },
  { name: 'Namibia', slug: 'namibia', iso2: 'NA', iso3: 'NAM', phoneCode: '+264', capital: 'Windhoek', currency: 'NAD', regionSlug: 'southern-africa', flagEmoji: '🇳🇦' },
  { name: 'South Africa', slug: 'south-africa', iso2: 'ZA', iso3: 'ZAF', phoneCode: '+27', capital: 'Pretoria', currency: 'ZAR', regionSlug: 'southern-africa', flagEmoji: '🇿🇦' },
  
  // Asia - Western
  { name: 'Armenia', slug: 'armenia', iso2: 'AM', iso3: 'ARM', phoneCode: '+374', capital: 'Yerevan', currency: 'AMD', regionSlug: 'western-asia', flagEmoji: '🇦🇲' },
  { name: 'Azerbaijan', slug: 'azerbaijan', iso2: 'AZ', iso3: 'AZE', phoneCode: '+994', capital: 'Baku', currency: 'AZN', regionSlug: 'western-asia', flagEmoji: '🇦🇿' },
  { name: 'Bahrain', slug: 'bahrain', iso2: 'BH', iso3: 'BHR', phoneCode: '+973', capital: 'Manama', currency: 'BHD', regionSlug: 'western-asia', flagEmoji: '🇧🇭' },
  { name: 'Cyprus', slug: 'cyprus', iso2: 'CY', iso3: 'CYP', phoneCode: '+357', capital: 'Nicosia', currency: 'EUR', regionSlug: 'western-asia', flagEmoji: '🇨🇾' },
  { name: 'Georgia', slug: 'georgia', iso2: 'GE', iso3: 'GEO', phoneCode: '+995', capital: 'Tbilisi', currency: 'GEL', regionSlug: 'western-asia', flagEmoji: '🇬🇪' },
  { name: 'Iraq', slug: 'iraq', iso2: 'IQ', iso3: 'IRQ', phoneCode: '+964', capital: 'Baghdad', currency: 'IQD', regionSlug: 'western-asia', flagEmoji: '🇮🇶' },
  { name: 'Israel', slug: 'israel', iso2: 'IL', iso3: 'ISR', phoneCode: '+972', capital: 'Jerusalem', currency: 'ILS', regionSlug: 'western-asia', flagEmoji: '🇮🇱' },
  { name: 'Jordan', slug: 'jordan', iso2: 'JO', iso3: 'JOR', phoneCode: '+962', capital: 'Amman', currency: 'JOD', regionSlug: 'western-asia', flagEmoji: '🇯🇴' },
  { name: 'Kuwait', slug: 'kuwait', iso2: 'KW', iso3: 'KWT', phoneCode: '+965', capital: 'Kuwait City', currency: 'KWD', regionSlug: 'western-asia', flagEmoji: '🇰🇼' },
  { name: 'Lebanon', slug: 'lebanon', iso2: 'LB', iso3: 'LBN', phoneCode: '+961', capital: 'Beirut', currency: 'LBP', regionSlug: 'western-asia', flagEmoji: '🇱🇧' },
  { name: 'Oman', slug: 'oman', iso2: 'OM', iso3: 'OMN', phoneCode: '+968', capital: 'Muscat', currency: 'OMR', regionSlug: 'western-asia', flagEmoji: '🇴🇲' },
  { name: 'Palestine', slug: 'palestine', iso2: 'PS', iso3: 'PSE', phoneCode: '+970', capital: 'Ramallah', currency: 'ILS', regionSlug: 'western-asia', flagEmoji: '🇵🇸' },
  { name: 'Qatar', slug: 'qatar', iso2: 'QA', iso3: 'QAT', phoneCode: '+974', capital: 'Doha', currency: 'QAR', regionSlug: 'western-asia', flagEmoji: '🇶🇦' },
  { name: 'Saudi Arabia', slug: 'saudi-arabia', iso2: 'SA', iso3: 'SAU', phoneCode: '+966', capital: 'Riyadh', currency: 'SAR', regionSlug: 'western-asia', flagEmoji: '🇸🇦' },
  { name: 'Syria', slug: 'syria', iso2: 'SY', iso3: 'SYR', phoneCode: '+963', capital: 'Damascus', currency: 'SYP', regionSlug: 'western-asia', flagEmoji: '🇸🇾' },
  { name: 'Turkey', slug: 'turkey', iso2: 'TR', iso3: 'TUR', phoneCode: '+90', capital: 'Ankara', currency: 'TRY', regionSlug: 'western-asia', flagEmoji: '🇹🇷' },
  { name: 'United Arab Emirates', slug: 'united-arab-emirates', iso2: 'AE', iso3: 'ARE', phoneCode: '+971', capital: 'Abu Dhabi', currency: 'AED', regionSlug: 'western-asia', flagEmoji: '🇦🇪' },
  { name: 'Yemen', slug: 'yemen', iso2: 'YE', iso3: 'YEM', phoneCode: '+967', capital: 'Sana\'a', currency: 'YER', regionSlug: 'western-asia', flagEmoji: '🇾🇪' },
  
  // Asia - Central
  { name: 'Kazakhstan', slug: 'kazakhstan', iso2: 'KZ', iso3: 'KAZ', phoneCode: '+7', capital: 'Nur-Sultan', currency: 'KZT', regionSlug: 'central-asia', flagEmoji: '🇰🇿' },
  { name: 'Kyrgyzstan', slug: 'kyrgyzstan', iso2: 'KG', iso3: 'KGZ', phoneCode: '+996', capital: 'Bishkek', currency: 'KGS', regionSlug: 'central-asia', flagEmoji: '🇰🇬' },
  { name: 'Tajikistan', slug: 'tajikistan', iso2: 'TJ', iso3: 'TJK', phoneCode: '+992', capital: 'Dushanbe', currency: 'TJS', regionSlug: 'central-asia', flagEmoji: '🇹🇯' },
  { name: 'Turkmenistan', slug: 'turkmenistan', iso2: 'TM', iso3: 'TKM', phoneCode: '+993', capital: 'Ashgabat', currency: 'TMT', regionSlug: 'central-asia', flagEmoji: '🇹🇲' },
  { name: 'Uzbekistan', slug: 'uzbekistan', iso2: 'UZ', iso3: 'UZB', phoneCode: '+998', capital: 'Tashkent', currency: 'UZS', regionSlug: 'central-asia', flagEmoji: '🇺🇿' },
  
  // Asia - Southern
  { name: 'Afghanistan', slug: 'afghanistan', iso2: 'AF', iso3: 'AFG', phoneCode: '+93', capital: 'Kabul', currency: 'AFN', regionSlug: 'southern-asia', flagEmoji: '🇦🇫' },
  { name: 'Bangladesh', slug: 'bangladesh', iso2: 'BD', iso3: 'BGD', phoneCode: '+880', capital: 'Dhaka', currency: 'BDT', regionSlug: 'southern-asia', flagEmoji: '🇧🇩' },
  { name: 'Bhutan', slug: 'bhutan', iso2: 'BT', iso3: 'BTN', phoneCode: '+975', capital: 'Thimphu', currency: 'BTN', regionSlug: 'southern-asia', flagEmoji: '🇧🇹' },
  { name: 'India', slug: 'india', iso2: 'IN', iso3: 'IND', phoneCode: '+91', capital: 'New Delhi', currency: 'INR', regionSlug: 'southern-asia', flagEmoji: '🇮🇳' },
  { name: 'Iran', slug: 'iran', iso2: 'IR', iso3: 'IRN', phoneCode: '+98', capital: 'Tehran', currency: 'IRR', regionSlug: 'southern-asia', flagEmoji: '🇮🇷' },
  { name: 'Maldives', slug: 'maldives', iso2: 'MV', iso3: 'MDV', phoneCode: '+960', capital: 'Malé', currency: 'MVR', regionSlug: 'southern-asia', flagEmoji: '🇲🇻' },
  { name: 'Nepal', slug: 'nepal', iso2: 'NP', iso3: 'NPL', phoneCode: '+977', capital: 'Kathmandu', currency: 'NPR', regionSlug: 'southern-asia', flagEmoji: '🇳🇵' },
  { name: 'Pakistan', slug: 'pakistan', iso2: 'PK', iso3: 'PAK', phoneCode: '+92', capital: 'Islamabad', currency: 'PKR', regionSlug: 'southern-asia', flagEmoji: '🇵🇰' },
  { name: 'Sri Lanka', slug: 'sri-lanka', iso2: 'LK', iso3: 'LKA', phoneCode: '+94', capital: 'Colombo', currency: 'LKR', regionSlug: 'southern-asia', flagEmoji: '🇱🇰' },
  
  // Asia - Southeast
  { name: 'Brunei', slug: 'brunei', iso2: 'BN', iso3: 'BRN', phoneCode: '+673', capital: 'Bandar Seri Begawan', currency: 'BND', regionSlug: 'southeast-asia', flagEmoji: '🇧🇳' },
  { name: 'Cambodia', slug: 'cambodia', iso2: 'KH', iso3: 'KHM', phoneCode: '+855', capital: 'Phnom Penh', currency: 'KHR', regionSlug: 'southeast-asia', flagEmoji: '🇰🇭' },
  { name: 'Indonesia', slug: 'indonesia', iso2: 'ID', iso3: 'IDN', phoneCode: '+62', capital: 'Jakarta', currency: 'IDR', regionSlug: 'southeast-asia', flagEmoji: '🇮🇩' },
  { name: 'Laos', slug: 'laos', iso2: 'LA', iso3: 'LAO', phoneCode: '+856', capital: 'Vientiane', currency: 'LAK', regionSlug: 'southeast-asia', flagEmoji: '🇱🇦' },
  { name: 'Malaysia', slug: 'malaysia', iso2: 'MY', iso3: 'MYS', phoneCode: '+60', capital: 'Kuala Lumpur', currency: 'MYR', regionSlug: 'southeast-asia', flagEmoji: '🇲🇾' },
  { name: 'Myanmar', slug: 'myanmar', iso2: 'MM', iso3: 'MMR', phoneCode: '+95', capital: 'Naypyidaw', currency: 'MMK', regionSlug: 'southeast-asia', flagEmoji: '🇲🇲' },
  { name: 'Philippines', slug: 'philippines', iso2: 'PH', iso3: 'PHL', phoneCode: '+63', capital: 'Manila', currency: 'PHP', regionSlug: 'southeast-asia', flagEmoji: '🇵🇭' },
  { name: 'Singapore', slug: 'singapore', iso2: 'SG', iso3: 'SGP', phoneCode: '+65', capital: 'Singapore', currency: 'SGD', regionSlug: 'southeast-asia', flagEmoji: '🇸🇬' },
  { name: 'Thailand', slug: 'thailand', iso2: 'TH', iso3: 'THA', phoneCode: '+66', capital: 'Bangkok', currency: 'THB', regionSlug: 'southeast-asia', flagEmoji: '🇹🇭' },
  { name: 'Timor-Leste', slug: 'timor-leste', iso2: 'TL', iso3: 'TLS', phoneCode: '+670', capital: 'Dili', currency: 'USD', regionSlug: 'southeast-asia', flagEmoji: '🇹🇱' },
  { name: 'Vietnam', slug: 'vietnam', iso2: 'VN', iso3: 'VNM', phoneCode: '+84', capital: 'Hanoi', currency: 'VND', regionSlug: 'southeast-asia', flagEmoji: '🇻🇳' },
  
  // Asia - Eastern
  { name: 'China', slug: 'china', iso2: 'CN', iso3: 'CHN', phoneCode: '+86', capital: 'Beijing', currency: 'CNY', regionSlug: 'eastern-asia', flagEmoji: '🇨🇳' },
  { name: 'Hong Kong', slug: 'hong-kong', iso2: 'HK', iso3: 'HKG', phoneCode: '+852', capital: 'Hong Kong', currency: 'HKD', regionSlug: 'eastern-asia', flagEmoji: '🇭🇰' },
  { name: 'Japan', slug: 'japan', iso2: 'JP', iso3: 'JPN', phoneCode: '+81', capital: 'Tokyo', currency: 'JPY', regionSlug: 'eastern-asia', flagEmoji: '🇯🇵' },
  { name: 'Macau', slug: 'macau', iso2: 'MO', iso3: 'MAC', phoneCode: '+853', capital: 'Macau', currency: 'MOP', regionSlug: 'eastern-asia', flagEmoji: '🇲🇴' },
  { name: 'Mongolia', slug: 'mongolia', iso2: 'MN', iso3: 'MNG', phoneCode: '+976', capital: 'Ulaanbaatar', currency: 'MNT', regionSlug: 'eastern-asia', flagEmoji: '🇲🇳' },
  { name: 'North Korea', slug: 'north-korea', iso2: 'KP', iso3: 'PRK', phoneCode: '+850', capital: 'Pyongyang', currency: 'KPW', regionSlug: 'eastern-asia', flagEmoji: '🇰🇵' },
  { name: 'South Korea', slug: 'south-korea', iso2: 'KR', iso3: 'KOR', phoneCode: '+82', capital: 'Seoul', currency: 'KRW', regionSlug: 'eastern-asia', flagEmoji: '🇰🇷' },
  { name: 'Taiwan', slug: 'taiwan', iso2: 'TW', iso3: 'TWN', phoneCode: '+886', capital: 'Taipei', currency: 'TWD', regionSlug: 'eastern-asia', flagEmoji: '🇹🇼' },
  
  // Europe - Northern
  { name: 'Denmark', slug: 'denmark', iso2: 'DK', iso3: 'DNK', phoneCode: '+45', capital: 'Copenhagen', currency: 'DKK', regionSlug: 'northern-europe', flagEmoji: '🇩🇰' },
  { name: 'Estonia', slug: 'estonia', iso2: 'EE', iso3: 'EST', phoneCode: '+372', capital: 'Tallinn', currency: 'EUR', regionSlug: 'northern-europe', flagEmoji: '🇪🇪' },
  { name: 'Finland', slug: 'finland', iso2: 'FI', iso3: 'FIN', phoneCode: '+358', capital: 'Helsinki', currency: 'EUR', regionSlug: 'northern-europe', flagEmoji: '🇫🇮' },
  { name: 'Iceland', slug: 'iceland', iso2: 'IS', iso3: 'ISL', phoneCode: '+354', capital: 'Reykjavik', currency: 'ISK', regionSlug: 'northern-europe', flagEmoji: '🇮🇸' },
  { name: 'Ireland', slug: 'ireland', iso2: 'IE', iso3: 'IRL', phoneCode: '+353', capital: 'Dublin', currency: 'EUR', regionSlug: 'northern-europe', flagEmoji: '🇮🇪' },
  { name: 'Latvia', slug: 'latvia', iso2: 'LV', iso3: 'LVA', phoneCode: '+371', capital: 'Riga', currency: 'EUR', regionSlug: 'northern-europe', flagEmoji: '🇱🇻' },
  { name: 'Lithuania', slug: 'lithuania', iso2: 'LT', iso3: 'LTU', phoneCode: '+370', capital: 'Vilnius', currency: 'EUR', regionSlug: 'northern-europe', flagEmoji: '🇱🇹' },
  { name: 'Norway', slug: 'norway', iso2: 'NO', iso3: 'NOR', phoneCode: '+47', capital: 'Oslo', currency: 'NOK', regionSlug: 'northern-europe', flagEmoji: '🇳🇴' },
  { name: 'Sweden', slug: 'sweden', iso2: 'SE', iso3: 'SWE', phoneCode: '+46', capital: 'Stockholm', currency: 'SEK', regionSlug: 'northern-europe', flagEmoji: '🇸🇪' },
  { name: 'United Kingdom', slug: 'united-kingdom', iso2: 'GB', iso3: 'GBR', phoneCode: '+44', capital: 'London', currency: 'GBP', regionSlug: 'northern-europe', flagEmoji: '🇬🇧' },
  
  // Europe - Western
  { name: 'Austria', slug: 'austria', iso2: 'AT', iso3: 'AUT', phoneCode: '+43', capital: 'Vienna', currency: 'EUR', regionSlug: 'western-europe', flagEmoji: '🇦🇹' },
  { name: 'Belgium', slug: 'belgium', iso2: 'BE', iso3: 'BEL', phoneCode: '+32', capital: 'Brussels', currency: 'EUR', regionSlug: 'western-europe', flagEmoji: '🇧🇪' },
  { name: 'France', slug: 'france', iso2: 'FR', iso3: 'FRA', phoneCode: '+33', capital: 'Paris', currency: 'EUR', regionSlug: 'western-europe', flagEmoji: '🇫🇷' },
  { name: 'Germany', slug: 'germany', iso2: 'DE', iso3: 'DEU', phoneCode: '+49', capital: 'Berlin', currency: 'EUR', regionSlug: 'western-europe', flagEmoji: '🇩🇪' },
  { name: 'Liechtenstein', slug: 'liechtenstein', iso2: 'LI', iso3: 'LIE', phoneCode: '+423', capital: 'Vaduz', currency: 'CHF', regionSlug: 'western-europe', flagEmoji: '🇱🇮' },
  { name: 'Luxembourg', slug: 'luxembourg', iso2: 'LU', iso3: 'LUX', phoneCode: '+352', capital: 'Luxembourg', currency: 'EUR', regionSlug: 'western-europe', flagEmoji: '🇱🇺' },
  { name: 'Monaco', slug: 'monaco', iso2: 'MC', iso3: 'MCO', phoneCode: '+377', capital: 'Monaco', currency: 'EUR', regionSlug: 'western-europe', flagEmoji: '🇲🇨' },
  { name: 'Netherlands', slug: 'netherlands', iso2: 'NL', iso3: 'NLD', phoneCode: '+31', capital: 'Amsterdam', currency: 'EUR', regionSlug: 'western-europe', flagEmoji: '🇳🇱' },
  { name: 'Switzerland', slug: 'switzerland', iso2: 'CH', iso3: 'CHE', phoneCode: '+41', capital: 'Bern', currency: 'CHF', regionSlug: 'western-europe', flagEmoji: '🇨🇭' },
  
  // Europe - Eastern
  { name: 'Belarus', slug: 'belarus', iso2: 'BY', iso3: 'BLR', phoneCode: '+375', capital: 'Minsk', currency: 'BYN', regionSlug: 'eastern-europe', flagEmoji: '🇧🇾' },
  { name: 'Bulgaria', slug: 'bulgaria', iso2: 'BG', iso3: 'BGR', phoneCode: '+359', capital: 'Sofia', currency: 'BGN', regionSlug: 'eastern-europe', flagEmoji: '🇧🇬' },
  { name: 'Czech Republic', slug: 'czech-republic', iso2: 'CZ', iso3: 'CZE', phoneCode: '+420', capital: 'Prague', currency: 'CZK', regionSlug: 'eastern-europe', flagEmoji: '🇨🇿' },
  { name: 'Hungary', slug: 'hungary', iso2: 'HU', iso3: 'HUN', phoneCode: '+36', capital: 'Budapest', currency: 'HUF', regionSlug: 'eastern-europe', flagEmoji: '🇭🇺' },
  { name: 'Moldova', slug: 'moldova', iso2: 'MD', iso3: 'MDA', phoneCode: '+373', capital: 'Chișinău', currency: 'MDL', regionSlug: 'eastern-europe', flagEmoji: '🇲🇩' },
  { name: 'Poland', slug: 'poland', iso2: 'PL', iso3: 'POL', phoneCode: '+48', capital: 'Warsaw', currency: 'PLN', regionSlug: 'eastern-europe', flagEmoji: '🇵🇱' },
  { name: 'Romania', slug: 'romania', iso2: 'RO', iso3: 'ROU', phoneCode: '+40', capital: 'Bucharest', currency: 'RON', regionSlug: 'eastern-europe', flagEmoji: '🇷🇴' },
  { name: 'Russia', slug: 'russia', iso2: 'RU', iso3: 'RUS', phoneCode: '+7', capital: 'Moscow', currency: 'RUB', regionSlug: 'eastern-europe', flagEmoji: '🇷🇺' },
  { name: 'Slovakia', slug: 'slovakia', iso2: 'SK', iso3: 'SVK', phoneCode: '+421', capital: 'Bratislava', currency: 'EUR', regionSlug: 'eastern-europe', flagEmoji: '🇸🇰' },
  { name: 'Ukraine', slug: 'ukraine', iso2: 'UA', iso3: 'UKR', phoneCode: '+380', capital: 'Kyiv', currency: 'UAH', regionSlug: 'eastern-europe', flagEmoji: '🇺🇦' },
  
  // Europe - Southern
  { name: 'Albania', slug: 'albania', iso2: 'AL', iso3: 'ALB', phoneCode: '+355', capital: 'Tirana', currency: 'ALL', regionSlug: 'southern-europe', flagEmoji: '🇦🇱' },
  { name: 'Andorra', slug: 'andorra', iso2: 'AD', iso3: 'AND', phoneCode: '+376', capital: 'Andorra la Vella', currency: 'EUR', regionSlug: 'southern-europe', flagEmoji: '🇦🇩' },
  { name: 'Bosnia and Herzegovina', slug: 'bosnia-herzegovina', iso2: 'BA', iso3: 'BIH', phoneCode: '+387', capital: 'Sarajevo', currency: 'BAM', regionSlug: 'southern-europe', flagEmoji: '🇧🇦' },
  { name: 'Croatia', slug: 'croatia', iso2: 'HR', iso3: 'HRV', phoneCode: '+385', capital: 'Zagreb', currency: 'EUR', regionSlug: 'southern-europe', flagEmoji: '🇭🇷' },
  { name: 'Greece', slug: 'greece', iso2: 'GR', iso3: 'GRC', phoneCode: '+30', capital: 'Athens', currency: 'EUR', regionSlug: 'southern-europe', flagEmoji: '🇬🇷' },
  { name: 'Italy', slug: 'italy', iso2: 'IT', iso3: 'ITA', phoneCode: '+39', capital: 'Rome', currency: 'EUR', regionSlug: 'southern-europe', flagEmoji: '🇮🇹' },
  { name: 'Malta', slug: 'malta', iso2: 'MT', iso3: 'MLT', phoneCode: '+356', capital: 'Valletta', currency: 'EUR', regionSlug: 'southern-europe', flagEmoji: '🇲🇹' },
  { name: 'Montenegro', slug: 'montenegro', iso2: 'ME', iso3: 'MNE', phoneCode: '+382', capital: 'Podgorica', currency: 'EUR', regionSlug: 'southern-europe', flagEmoji: '🇲🇪' },
  { name: 'North Macedonia', slug: 'north-macedonia', iso2: 'MK', iso3: 'MKD', phoneCode: '+389', capital: 'Skopje', currency: 'MKD', regionSlug: 'southern-europe', flagEmoji: '🇲🇰' },
  { name: 'Portugal', slug: 'portugal', iso2: 'PT', iso3: 'PRT', phoneCode: '+351', capital: 'Lisbon', currency: 'EUR', regionSlug: 'southern-europe', flagEmoji: '🇵🇹' },
  { name: 'San Marino', slug: 'san-marino', iso2: 'SM', iso3: 'SMR', phoneCode: '+378', capital: 'San Marino', currency: 'EUR', regionSlug: 'southern-europe', flagEmoji: '🇸🇲' },
  { name: 'Serbia', slug: 'serbia', iso2: 'RS', iso3: 'SRB', phoneCode: '+381', capital: 'Belgrade', currency: 'RSD', regionSlug: 'southern-europe', flagEmoji: '🇷🇸' },
  { name: 'Slovenia', slug: 'slovenia', iso2: 'SI', iso3: 'SVN', phoneCode: '+386', capital: 'Ljubljana', currency: 'EUR', regionSlug: 'southern-europe', flagEmoji: '🇸🇮' },
  { name: 'Spain', slug: 'spain', iso2: 'ES', iso3: 'ESP', phoneCode: '+34', capital: 'Madrid', currency: 'EUR', regionSlug: 'southern-europe', flagEmoji: '🇪🇸' },
  { name: 'Vatican City', slug: 'vatican-city', iso2: 'VA', iso3: 'VAT', phoneCode: '+379', capital: 'Vatican City', currency: 'EUR', regionSlug: 'southern-europe', flagEmoji: '🇻🇦' },
  
  // North America - Northern America
  { name: 'Canada', slug: 'canada', iso2: 'CA', iso3: 'CAN', phoneCode: '+1', capital: 'Ottawa', currency: 'CAD', regionSlug: 'northern-america', flagEmoji: '🇨🇦' },
  { name: 'United States', slug: 'united-states', iso2: 'US', iso3: 'USA', phoneCode: '+1', capital: 'Washington, D.C.', currency: 'USD', regionSlug: 'northern-america', flagEmoji: '🇺🇸' },
  
  // North America - Central America
  { name: 'Belize', slug: 'belize', iso2: 'BZ', iso3: 'BLZ', phoneCode: '+501', capital: 'Belmopan', currency: 'BZD', regionSlug: 'central-america', flagEmoji: '🇧🇿' },
  { name: 'Costa Rica', slug: 'costa-rica', iso2: 'CR', iso3: 'CRI', phoneCode: '+506', capital: 'San José', currency: 'CRC', regionSlug: 'central-america', flagEmoji: '🇨🇷' },
  { name: 'El Salvador', slug: 'el-salvador', iso2: 'SV', iso3: 'SLV', phoneCode: '+503', capital: 'San Salvador', currency: 'USD', regionSlug: 'central-america', flagEmoji: '🇸🇻' },
  { name: 'Guatemala', slug: 'guatemala', iso2: 'GT', iso3: 'GTM', phoneCode: '+502', capital: 'Guatemala City', currency: 'GTQ', regionSlug: 'central-america', flagEmoji: '🇬🇹' },
  { name: 'Honduras', slug: 'honduras', iso2: 'HN', iso3: 'HND', phoneCode: '+504', capital: 'Tegucigalpa', currency: 'HNL', regionSlug: 'central-america', flagEmoji: '🇭🇳' },
  { name: 'Mexico', slug: 'mexico', iso2: 'MX', iso3: 'MEX', phoneCode: '+52', capital: 'Mexico City', currency: 'MXN', regionSlug: 'central-america', flagEmoji: '🇲🇽' },
  { name: 'Nicaragua', slug: 'nicaragua', iso2: 'NI', iso3: 'NIC', phoneCode: '+505', capital: 'Managua', currency: 'NIO', regionSlug: 'central-america', flagEmoji: '🇳🇮' },
  { name: 'Panama', slug: 'panama', iso2: 'PA', iso3: 'PAN', phoneCode: '+507', capital: 'Panama City', currency: 'PAB', regionSlug: 'central-america', flagEmoji: '🇵🇦' },
  
  // North America - Caribbean
  { name: 'Antigua and Barbuda', slug: 'antigua-barbuda', iso2: 'AG', iso3: 'ATG', phoneCode: '+1-268', capital: 'St. John\'s', currency: 'XCD', regionSlug: 'caribbean', flagEmoji: '🇦🇬' },
  { name: 'Bahamas', slug: 'bahamas', iso2: 'BS', iso3: 'BHS', phoneCode: '+1-242', capital: 'Nassau', currency: 'BSD', regionSlug: 'caribbean', flagEmoji: '🇧🇸' },
  { name: 'Barbados', slug: 'barbados', iso2: 'BB', iso3: 'BRB', phoneCode: '+1-246', capital: 'Bridgetown', currency: 'BBD', regionSlug: 'caribbean', flagEmoji: '🇧🇧' },
  { name: 'Cuba', slug: 'cuba', iso2: 'CU', iso3: 'CUB', phoneCode: '+53', capital: 'Havana', currency: 'CUP', regionSlug: 'caribbean', flagEmoji: '🇨🇺' },
  { name: 'Dominica', slug: 'dominica', iso2: 'DM', iso3: 'DMA', phoneCode: '+1-767', capital: 'Roseau', currency: 'XCD', regionSlug: 'caribbean', flagEmoji: '🇩🇲' },
  { name: 'Dominican Republic', slug: 'dominican-republic', iso2: 'DO', iso3: 'DOM', phoneCode: '+1-809', capital: 'Santo Domingo', currency: 'DOP', regionSlug: 'caribbean', flagEmoji: '🇩🇴' },
  { name: 'Grenada', slug: 'grenada', iso2: 'GD', iso3: 'GRD', phoneCode: '+1-473', capital: 'St. George\'s', currency: 'XCD', regionSlug: 'caribbean', flagEmoji: '🇬🇩' },
  { name: 'Haiti', slug: 'haiti', iso2: 'HT', iso3: 'HTI', phoneCode: '+509', capital: 'Port-au-Prince', currency: 'HTG', regionSlug: 'caribbean', flagEmoji: '🇭🇹' },
  { name: 'Jamaica', slug: 'jamaica', iso2: 'JM', iso3: 'JAM', phoneCode: '+1-876', capital: 'Kingston', currency: 'JMD', regionSlug: 'caribbean', flagEmoji: '🇯🇲' },
  { name: 'Saint Kitts and Nevis', slug: 'saint-kitts-nevis', iso2: 'KN', iso3: 'KNA', phoneCode: '+1-869', capital: 'Basseterre', currency: 'XCD', regionSlug: 'caribbean', flagEmoji: '🇰🇳' },
  { name: 'Saint Lucia', slug: 'saint-lucia', iso2: 'LC', iso3: 'LCA', phoneCode: '+1-758', capital: 'Castries', currency: 'XCD', regionSlug: 'caribbean', flagEmoji: '🇱🇨' },
  { name: 'Saint Vincent and the Grenadines', slug: 'saint-vincent-grenadines', iso2: 'VC', iso3: 'VCT', phoneCode: '+1-784', capital: 'Kingstown', currency: 'XCD', regionSlug: 'caribbean', flagEmoji: '🇻🇨' },
  { name: 'Trinidad and Tobago', slug: 'trinidad-tobago', iso2: 'TT', iso3: 'TTO', phoneCode: '+1-868', capital: 'Port of Spain', currency: 'TTD', regionSlug: 'caribbean', flagEmoji: '🇹🇹' },
  
  // South America
  { name: 'Argentina', slug: 'argentina', iso2: 'AR', iso3: 'ARG', phoneCode: '+54', capital: 'Buenos Aires', currency: 'ARS', regionSlug: 'south-america-region', flagEmoji: '🇦🇷' },
  { name: 'Bolivia', slug: 'bolivia', iso2: 'BO', iso3: 'BOL', phoneCode: '+591', capital: 'Sucre', currency: 'BOB', regionSlug: 'south-america-region', flagEmoji: '🇧🇴' },
  { name: 'Brazil', slug: 'brazil', iso2: 'BR', iso3: 'BRA', phoneCode: '+55', capital: 'Brasília', currency: 'BRL', regionSlug: 'south-america-region', flagEmoji: '🇧🇷' },
  { name: 'Chile', slug: 'chile', iso2: 'CL', iso3: 'CHL', phoneCode: '+56', capital: 'Santiago', currency: 'CLP', regionSlug: 'south-america-region', flagEmoji: '🇨🇱' },
  { name: 'Colombia', slug: 'colombia', iso2: 'CO', iso3: 'COL', phoneCode: '+57', capital: 'Bogotá', currency: 'COP', regionSlug: 'south-america-region', flagEmoji: '🇨🇴' },
  { name: 'Ecuador', slug: 'ecuador', iso2: 'EC', iso3: 'ECU', phoneCode: '+593', capital: 'Quito', currency: 'USD', regionSlug: 'south-america-region', flagEmoji: '🇪🇨' },
  { name: 'Guyana', slug: 'guyana', iso2: 'GY', iso3: 'GUY', phoneCode: '+592', capital: 'Georgetown', currency: 'GYD', regionSlug: 'south-america-region', flagEmoji: '🇬🇾' },
  { name: 'Paraguay', slug: 'paraguay', iso2: 'PY', iso3: 'PRY', phoneCode: '+595', capital: 'Asunción', currency: 'PYG', regionSlug: 'south-america-region', flagEmoji: '🇵🇾' },
  { name: 'Peru', slug: 'peru', iso2: 'PE', iso3: 'PER', phoneCode: '+51', capital: 'Lima', currency: 'PEN', regionSlug: 'south-america-region', flagEmoji: '🇵🇪' },
  { name: 'Suriname', slug: 'suriname', iso2: 'SR', iso3: 'SUR', phoneCode: '+597', capital: 'Paramaribo', currency: 'SRD', regionSlug: 'south-america-region', flagEmoji: '🇸🇷' },
  { name: 'Uruguay', slug: 'uruguay', iso2: 'UY', iso3: 'URY', phoneCode: '+598', capital: 'Montevideo', currency: 'UYU', regionSlug: 'south-america-region', flagEmoji: '🇺🇾' },
  { name: 'Venezuela', slug: 'venezuela', iso2: 'VE', iso3: 'VEN', phoneCode: '+58', capital: 'Caracas', currency: 'VES', regionSlug: 'south-america-region', flagEmoji: '🇻🇪' },
  
  // Oceania - Australia and New Zealand
  { name: 'Australia', slug: 'australia', iso2: 'AU', iso3: 'AUS', phoneCode: '+61', capital: 'Canberra', currency: 'AUD', regionSlug: 'australia-new-zealand', flagEmoji: '🇦🇺' },
  { name: 'New Zealand', slug: 'new-zealand', iso2: 'NZ', iso3: 'NZL', phoneCode: '+64', capital: 'Wellington', currency: 'NZD', regionSlug: 'australia-new-zealand', flagEmoji: '🇳🇿' },
  
  // Oceania - Melanesia
  { name: 'Fiji', slug: 'fiji', iso2: 'FJ', iso3: 'FJI', phoneCode: '+679', capital: 'Suva', currency: 'FJD', regionSlug: 'melanesia', flagEmoji: '🇫🇯' },
  { name: 'Papua New Guinea', slug: 'papua-new-guinea', iso2: 'PG', iso3: 'PNG', phoneCode: '+675', capital: 'Port Moresby', currency: 'PGK', regionSlug: 'melanesia', flagEmoji: '🇵🇬' },
  { name: 'Solomon Islands', slug: 'solomon-islands', iso2: 'SB', iso3: 'SLB', phoneCode: '+677', capital: 'Honiara', currency: 'SBD', regionSlug: 'melanesia', flagEmoji: '🇸🇧' },
  { name: 'Vanuatu', slug: 'vanuatu', iso2: 'VU', iso3: 'VUT', phoneCode: '+678', capital: 'Port Vila', currency: 'VUV', regionSlug: 'melanesia', flagEmoji: '🇻🇺' },
  
  // Oceania - Micronesia
  { name: 'Kiribati', slug: 'kiribati', iso2: 'KI', iso3: 'KIR', phoneCode: '+686', capital: 'Tarawa', currency: 'AUD', regionSlug: 'micronesia', flagEmoji: '🇰🇮' },
  { name: 'Marshall Islands', slug: 'marshall-islands', iso2: 'MH', iso3: 'MHL', phoneCode: '+692', capital: 'Majuro', currency: 'USD', regionSlug: 'micronesia', flagEmoji: '🇲🇭' },
  { name: 'Micronesia', slug: 'micronesia', iso2: 'FM', iso3: 'FSM', phoneCode: '+691', capital: 'Palikir', currency: 'USD', regionSlug: 'micronesia', flagEmoji: '🇫🇲' },
  { name: 'Nauru', slug: 'nauru', iso2: 'NR', iso3: 'NRU', phoneCode: '+674', capital: 'Yaren', currency: 'AUD', regionSlug: 'micronesia', flagEmoji: '🇳🇷' },
  { name: 'Palau', slug: 'palau', iso2: 'PW', iso3: 'PLW', phoneCode: '+680', capital: 'Ngerulmud', currency: 'USD', regionSlug: 'micronesia', flagEmoji: '🇵🇼' },
  
  // Oceania - Polynesia
  { name: 'Samoa', slug: 'samoa', iso2: 'WS', iso3: 'WSM', phoneCode: '+685', capital: 'Apia', currency: 'WST', regionSlug: 'polynesia', flagEmoji: '🇼🇸' },
  { name: 'Tonga', slug: 'tonga', iso2: 'TO', iso3: 'TON', phoneCode: '+676', capital: 'Nuku\'alofa', currency: 'TOP', regionSlug: 'polynesia', flagEmoji: '🇹🇴' },
  { name: 'Tuvalu', slug: 'tuvalu', iso2: 'TV', iso3: 'TUV', phoneCode: '+688', capital: 'Funafuti', currency: 'AUD', regionSlug: 'polynesia', flagEmoji: '🇹🇻' },
];
