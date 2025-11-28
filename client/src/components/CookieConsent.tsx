import { useState } from 'react';
import { X, Cookie, Shield, BarChart3, Megaphone } from 'lucide-react';
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export function CookieConsentBanner() {
  const { showBanner, acceptAll, rejectAll, openPreferences } = useCookieConsent();

  if (!showBanner) return null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg p-4 md:p-6"
      role="dialog"
      aria-label="Cookie consent"
      data-testid="cookie-consent-banner"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-gray-700 text-sm md:text-base">
                We use cookies to improve your experience on our site. By using our site, you consent to cookies.
                You can customize your preferences or learn more in our{' '}
                <a href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</a>.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={openPreferences}
              className="flex-1 md:flex-none"
              data-testid="button-cookie-preferences"
            >
              Preferences
            </Button>
            <Button
              variant="outline"
              onClick={rejectAll}
              className="flex-1 md:flex-none"
              data-testid="button-cookie-reject"
            >
              Reject
            </Button>
            <Button
              onClick={acceptAll}
              className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700"
              data-testid="button-cookie-accept"
            >
              Accept All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CookiePreferencesModal() {
  const { showPreferences, closePreferences, preferences, savePreferences } = useCookieConsent();
  const [localPrefs, setLocalPrefs] = useState(preferences);

  const handleSave = () => {
    savePreferences(localPrefs);
  };

  const handleToggle = (key: 'analytics' | 'marketing') => {
    setLocalPrefs(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <Dialog open={showPreferences} onOpenChange={(open) => !open && closePreferences()}>
      <DialogContent className="sm:max-w-lg" data-testid="cookie-preferences-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cookie className="h-5 w-5 text-amber-500" />
            Cookie Preferences
          </DialogTitle>
          <DialogDescription>
            Manage your cookie preferences. You can enable or disable different types of cookies below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Necessary Cookies</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Essential for the website to function properly. Cannot be disabled.
                </p>
              </div>
            </div>
            <Switch checked={true} disabled className="data-[state=checked]:bg-green-600" />
          </div>

          <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-3">
              <BarChart3 className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Analytics Cookies</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Help us understand how visitors interact with our website (Google Analytics, Microsoft Clarity).
                </p>
              </div>
            </div>
            <Switch
              checked={localPrefs.analytics}
              onCheckedChange={() => handleToggle('analytics')}
              data-testid="switch-analytics-cookies"
            />
          </div>

          <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Megaphone className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Marketing Cookies</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Used for advertising and to show you relevant ads (Google AdSense).
                </p>
              </div>
            </div>
            <Switch
              checked={localPrefs.marketing}
              onCheckedChange={() => handleToggle('marketing')}
              data-testid="switch-marketing-cookies"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={closePreferences} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700" data-testid="button-save-preferences">
            Save Preferences
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function CookieConsent() {
  return (
    <>
      <CookieConsentBanner />
      <CookiePreferencesModal />
    </>
  );
}
