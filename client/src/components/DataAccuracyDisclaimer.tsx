import { AlertTriangle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DataAccuracyDisclaimerProps {
  variant?: "default" | "compact";
  className?: string;
}

export function DataAccuracyDisclaimer({ variant = "default", className = "" }: DataAccuracyDisclaimerProps) {
  if (variant === "compact") {
    return (
      <div className={`flex items-start gap-2 text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3 ${className}`}>
        <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium text-blue-900 mb-1">Data Validation Notice</p>
          <p>
            Company information is continuously being validated and updated. Some details may be estimates 
            pending verification from official sources.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Alert className={`border-amber-200 bg-amber-50 ${className}`}>
      <AlertTriangle className="h-5 w-5 text-amber-600" />
      <AlertTitle className="text-amber-900 font-semibold">Data Accuracy Notice</AlertTitle>
      <AlertDescription className="text-amber-800 mt-2">
        <p className="mb-2">
          The company information displayed below (including employee count, revenue estimates, founding year, 
          and company size) is derived from various publicly available sources and may not be fully verified.
        </p>
        <p className="mb-2">
          <strong>We are actively working to validate and update all company data</strong> to ensure accuracy 
          and completeness. Information is continuously being enhanced through:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Official company registrations and filings</li>
          <li>Verified business databases</li>
          <li>Direct company submissions and claims</li>
          <li>Reputable industry sources</li>
        </ul>
        <p className="mt-3">
          If you represent this company and would like to verify or update this information, please{" "}
          <a href="/claim-company" className="text-amber-900 underline font-medium hover:text-amber-700">
            claim your company listing
          </a>{" "}
          or{" "}
          <a href="/contact" className="text-amber-900 underline font-medium hover:text-amber-700">
            contact us
          </a>.
        </p>
      </AlertDescription>
    </Alert>
  );
}
