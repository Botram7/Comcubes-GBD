import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, Home, Mail } from "lucide-react";
import comcubesIcon from "@assets/Artboard 17 copy 3_1758850589536.png";

export default function PaymentCancelPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center cursor-pointer" onClick={() => setLocation('/')}>
            <img src={comcubesIcon} alt="COMCUBES" className="h-12 mr-3" />
            <span className="text-2xl font-bold text-gray-900">COMCUBES</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <Card className="max-w-lg w-full shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
            <CardTitle className="text-3xl text-gray-900">Payment Cancelled</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-lg text-gray-700">
              Your payment has been cancelled. No charges were made to your account.
            </p>
            <p className="text-sm text-gray-500">
              If you experienced any issues during checkout, please try again or contact our support team for assistance.
            </p>
            <div className="flex gap-4 justify-center pt-6">
              <Button 
                variant="outline" 
                onClick={() => setLocation('/contact')}
                className="flex items-center gap-2"
                data-testid="button-contact-support"
              >
                <Mail className="h-4 w-4" />
                Contact Support
              </Button>
              <Button 
                onClick={() => setLocation('/')}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                data-testid="button-home"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
