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
import GeographyPage from "@/pages/GeographyPage";
import GeographyRegionsPage from "@/pages/GeographyRegionsPage";
import GeographyCountriesPage from "@/pages/GeographyCountriesPage";
import GeographyCompaniesPage from "@/pages/GeographyCompaniesPage";
import ContinentPage from "@/pages/ContinentPage";
import RegionPage from "@/pages/RegionPage";
import CountryPage from "@/pages/CountryPage";
import AdminSyncPage from "@/pages/AdminSyncPage";
import PaymentSuccessPage from "@/pages/PaymentSuccessPage";
import PaymentCancelPage from "@/pages/PaymentCancelPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/sectors" component={SectorsPage} />
      <Route path="/industries" component={IndustriesPage} />
      <Route path="/sector/:sectorName" component={SectorPage} />
      <Route path="/industry/:industryName" component={IndustryPage} />
      <Route path="/geography" component={GeographyPage} />
      <Route path="/geography/regions" component={GeographyRegionsPage} />
      <Route path="/geography/countries" component={GeographyCountriesPage} />
      <Route path="/geography/companies" component={GeographyCompaniesPage} />
      <Route path="/geography/continent/:slug" component={ContinentPage} />
      <Route path="/geography/region/:slug" component={RegionPage} />
      <Route path="/geography/country/:slug" component={CountryPage} />
      <Route path="/companies" component={CompanyPage} />
      <Route path="/company/:companyId" component={CompanyProfilePage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/advertise" component={AdvertisePage} />
      <Route path="/home">
        {() => {
          window.location.href = '/';
          return null;
        }}
      </Route>
      <Route path="/company-listing">
        {() => {
          window.location.href = '/list-company';
          return null;
        }}
      </Route>
      <Route path="/list-company" component={ListCompanyPage} />
      <Route path="/resume-payment" component={ResumePaymentPage} />
      <Route path="/claim-company" component={ClaimCompanyPage} />
      <Route path="/payment-success" component={PaymentSuccessPage} />
      <Route path="/payment/success" component={PaymentSuccessPage} />
      <Route path="/payment-cancel" component={PaymentCancelPage} />
      <Route path="/payment/cancel" component={PaymentCancelPage} />
      <Route path="/admin" component={ComprehensiveAdminDashboard} />
      <Route path="/admin-sync" component={AdminSyncPage} />
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
