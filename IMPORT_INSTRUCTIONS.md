# COMCUBES CSV Import Pipeline - Instructions

## Overview
This document provides instructions for importing the remaining 19 sector CSV files to complete the COMCUBES geographic data transformation.

## What's Been Accomplished

### ✅ Phase 1: Infrastructure (Complete)
- **Database Schema Extended**: Added 6 new enriched fields to companies table
  - `employee_count`: Employee count information
  - `revenue_estimate`: Revenue estimate data
  - `founded_year`: Year company was founded (INTEGER)
  - `company_size`: Company size classification
  - `specialization_tags`: Industry specialization tags
  - `verification_status`: Verification status (verified/unverified)
- **Backup System**: Added old_country_id and old_confidence columns to preserve original geocoding data
- **Country Normalization**: Built intelligent mapper supporting 200+ country name variations
  - USA, US, U.S.A. → United States
  - UK, Britain, England → United Kingdom
  - And many more variations with exact/alias/fuzzy matching

### ✅ Phase 2: Import Pipeline (Complete)
- **CSV Parser**: Handles new enriched data format with all fields
- **Import Engine**: Robust company deduplication and country validation
- **Quality Metrics**: Built-in accuracy tracking and quality assessment
- **Sector Import Script**: Generic script for single sector processing
- **Batch Import Script**: Automated processing for all 20 sectors

### ✅ Phase 3: Validation (Complete)
- **Aerospace & Defense Import**: Successfully imported 422 companies
- **Geographic Accuracy**: 95%+ accuracy achieved
  - **Before**: 90%+ companies incorrectly assigned to Nigeria
  - **After**: Realistic distribution (USA 17.5%, Nigeria 6.9%)
- **Top Countries**: USA (74), India (39), Brazil (38), UK (36), Canada (35)

## Current Status

### Imported Sectors (1/20)
✅ **Aerospace and Defense** - 422 companies (95%+ accuracy)

### Remaining Sectors (19/20)
Awaiting CSV files:
1. Agriculture
2. Automotive
3. Banking and Financial Services
4. Biotechnology
5. Chemicals
6. Construction and Real Estate
7. Consumer Goods
8. Education
9. Energy and Utilities
10. Healthcare
11. Hospitality and Tourism
12. Information Technology
13. Insurance
14. Manufacturing
15. Media and Entertainment
16. Mining and Metals
17. Pharmaceuticals
18. Retail
19. Telecommunications
20. Transportation and Logistics

## How to Import

### Option 1: Import Single Sector
```bash
tsx server/scripts/importSector.ts <csv_filename> <sector_name>
```

**Example:**
```bash
tsx server/scripts/importSector.ts "Automotive.txt" "Automotive"
```

### Option 2: Batch Import All Sectors
Once all CSV files are in `attached_assets/` directory:
```bash
tsx server/scripts/batchImportAll.ts
```

This will:
- Auto-detect all CSV files in attached_assets
- Process each sector sequentially
- Provide real-time progress updates
- Generate comprehensive quality report
- Show geographic distribution for each sector

### CSV File Naming Convention
Expected format:
```
deepseek_csv_<date>_<hash>_<Sector Name>_<timestamp>.txt
```

Example:
```
deepseek_csv_20251007_d8c6f9_Aerospace and Defense_1759972191955.txt
```

## Import Process Details

### What the Import Does:
1. **Parse CSV**: Extracts all company data from CSV file
2. **Normalize Country**: Matches HQ Country to database using intelligent mapper
3. **Deduplicate**: Finds existing companies by name or website
4. **Backup Old Data**: Saves old country_id and confidence before updating
5. **Import/Update**: Creates new or updates existing company records
6. **Track Quality**: Monitors accuracy, errors, and distribution

### Quality Checks Performed:
- ✅ Country matching confidence (exact/alias/fuzzy)
- ✅ Geographic distribution validation
- ✅ Nigeria concentration check (should be <20%)
- ✅ Single country dominance check (should be <60%)
- ✅ Overall accuracy tracking (target: 95%+)

### Output Report Includes:
- Total companies processed
- Created vs Updated counts
- Geographic distribution (top 20 countries)
- Country matching confidence stats
- Quality assessment and warnings
- Accuracy percentage vs 95% target

## Expected Results

### Realistic Geographic Distributions
Each sector should show:
- **USA**: Typically 10-30% (major business hub)
- **Europe**: UK, Germany, France combined ~15-25%
- **Asia**: India, China, Singapore, Japan combined ~20-30%
- **Others**: Distributed across remaining countries
- **Nigeria**: Should be <10% (was incorrectly 90%+ before)

### Quality Targets
- 🏆 **Excellent**: ≥95% accuracy
- ✅ **Good**: 90-94% accuracy
- ⚠️ **Review Needed**: <90% accuracy

## Next Steps After Import

Once all 20 sectors are imported, we'll implement:

1. **Advanced Filters UI**
   - Employee count ranges
   - Revenue brackets
   - Company size filters
   - Founded year filters

2. **Verified Badge System**
   - Display verification status
   - Trust indicators throughout site

3. **Specialization Tags**
   - Tag-based discovery
   - Industry specialization filtering

4. **Enhanced Company Cards**
   - Display all enriched data
   - Visual intelligence cards

5. **Industry Analytics Dashboard**
   - Visual insights by sector
   - Geographic heatmaps
   - Trend analysis

## Files Reference

### Import Utilities
- `server/utils/countryNormalizer.ts` - Country name normalization
- `server/utils/csvImporter.ts` - CSV parsing and import logic

### Import Scripts
- `server/scripts/importSector.ts` - Single sector import
- `server/scripts/importAeroDefense.ts` - Aerospace & Defense specific
- `server/scripts/batchImportAll.ts` - Batch import all sectors

### Schema
- `shared/schema.ts` - Database schema with new fields

## Troubleshooting

### If Import Fails:
1. Check CSV file format matches expected structure
2. Verify country names are recognizable (check countryNormalizer.ts for supported variations)
3. Review error messages for specific issues
4. Check database connection

### If Accuracy is Low (<90%):
1. Review country matching errors in output
2. Add missing country aliases to countryNormalizer.ts
3. Re-run import for that sector

### If Distribution Looks Wrong:
1. Check if Nigeria dominates (>50% = data issue)
2. Verify CSV file has correct HQ Country data
3. Spot-check sample companies manually

## Contact & Support
For issues or questions about the import pipeline, refer to the implementation files or check the database directly.
