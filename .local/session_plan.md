# Objective
Two independent tasks:
1. Fix the existing staged companies that already have wrong sector/industry assignments — add a "Re-categorize" button in the admin Staged Imports tab that re-runs the corrected matching engine on all pending records in-place.
2. Add a full company data CSV export covering all 7563+ live companies with their sector, industry, country, website, employees, founded year.

---

# Tasks

### T001: Backend — Re-categorize endpoint for staged companies
- **Blocked By**: []
- **Details**:
  - Add `POST /api/admin/staged-companies/recategorize` endpoint in `server/routes.ts`.
  - It fetches all staged companies where `status = 'pending'` (or all if no filter given).
  - For each one, builds probe = `[name, description].filter(Boolean).join(' ')`. Since company names often contain the key word (e.g. "EgyptAir", "Volksbank"), this is enough.
  - Calls `matchCategoryForCompany(probe)` (the new fixed function).
  - Updates `matchedSector`, `matchedIndustry`, `matchConfidence` in the DB for that record.
  - Returns `{ updated: N }` JSON.
  - Add `updateStagedCompanyCategories(id, sectorName, industryName, confidence)` method to `server/storage.ts` if needed.
  - Files: `server/routes.ts`, `server/storage.ts`
  - Acceptance: Calling the endpoint updates all existing wrongly-categorized pending staged companies

### T002: Frontend — "Re-categorize All" button in Staged Imports tab
- **Blocked By**: [T001]
- **Details**:
  - In `DataExpansionPanel.tsx`, in the Staged Imports tab near the Filters & Actions bar, add a "Re-categorize All Pending" button.
  - On click: calls the new endpoint via a mutation, shows a spinner while running, then invalidates the staged companies query so the table refreshes with corrected data.
  - Display a toast on completion: "Re-categorized N companies"
  - Files: `client/src/components/DataExpansionPanel.tsx`
  - Acceptance: Admin clicks one button, all pending staged companies get correct sector/industry assignments

### T003: Backend — Full company CSV export endpoint
- **Blocked By**: []
- **Details**:
  - Add `GET /api/admin/companies/export-csv` endpoint in `server/routes.ts` (admin-auth protected).
  - Query all companies from the `companies` table, left-joined with `company_locations` and `countries` to get the primary country name.
  - Build a CSV with these columns:
    `Company Name, Website URL, Business Sector, Industry, Country, Founded Year, Employee Count, Company Size, Description`
  - Set headers: `Content-Type: text/csv`, `Content-Disposition: attachment; filename="comcubes-companies.csv"`
  - Properly quote all fields (escape internal quotes).
  - Files: `server/routes.ts`
  - Acceptance: Calling the endpoint downloads a CSV file with all 7563+ companies

### T004: Frontend — "Export All Companies CSV" button in admin
- **Blocked By**: [T003]
- **Details**:
  - In `DataExpansionPanel.tsx`, in the Data Expansion overview (or in a suitable admin tab header), add an "Export All Companies (CSV)" button with a download icon.
  - On click: opens `/api/admin/companies/export-csv` as a direct download link (simple `window.open` or `<a href>` with download attribute).
  - Files: `client/src/components/DataExpansionPanel.tsx`
  - Acceptance: Admin clicks button, browser downloads a full company CSV
