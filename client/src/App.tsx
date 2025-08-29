import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import HomePage from "@/pages/HomePage";
import SectorsPage from "@/pages/SectorsPage";
import IndustriesPage from "@/pages/IndustriesPage";
import SectorPage from "@/pages/SectorPage";
import IndustryPage from "@/pages/IndustryPage";
import CompanyPage from "@/pages/CompanyPage";
import CompanyProfilePage from "@/pages/CompanyProfilePage";
import SearchPage from "@/pages/SearchPage";
// LogoManagementPage removed - using fallback icons only
import ContactPage from "@/pages/ContactPage";
import AdvertisePage from "@/pages/AdvertisePage";
import CompanyListingPage from "@/pages/CompanyListingPage";
import ListCompanyPage from "@/pages/ListCompanyPage";
import ResumePaymentPage from "@/pages/ResumePaymentPage";
import ComprehensiveAdminDashboard from "@/pages/ComprehensiveAdminDashboard";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import TermsOfServicePage from "@/pages/TermsOfServicePage";
import DisclaimerPage from "@/pages/DisclaimerPage";
import AffiliateDisclosurePage from "@/pages/AffiliateDisclosurePage";
import ClaimCompanyPage from "@/pages/ClaimCompanyPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/sectors" component={SectorsPage} />
      <Route path="/industries" component={IndustriesPage} />
      <Route path="/sector/:sectorName" component={SectorPage} />
      <Route path="/industry/:industryName" component={IndustryPage} />
      <Route path="/companies" component={CompanyPage} />
      <Route path="/company/:companyId" component={CompanyProfilePage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/advertise" component={AdvertisePage} />
      <Route path="/company-listing" component={CompanyListingPage} />
      <Route path="/list-company" component={ListCompanyPage} />
      <Route path="/resume-payment" component={ResumePaymentPage} />
      <Route path="/claim-company" component={ClaimCompanyPage} />
      <Route path="/admin" component={ComprehensiveAdminDashboard} />
{/* Logo management removed - using fallback icons only */}
      <Route path="/privacy-policy" component={PrivacyPolicyPage} />
      <Route path="/terms-of-service" component={TermsOfServicePage} />
      <Route path="/disclaimer" component={DisclaimerPage} />
      <Route path="/affiliate-disclosure" component={AffiliateDisclosurePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
