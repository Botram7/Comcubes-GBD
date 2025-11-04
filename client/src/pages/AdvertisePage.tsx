import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, TrendingUp, Eye, Star, CheckCircle, DollarSign, Calendar, Image as ImageIcon, CreditCard } from 'lucide-react';
import { useLocation } from 'wouter';
import { SEOHead, createBreadcrumbStructuredData } from "@/components/SEOHead";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { apiRequest } from '@/lib/queryClient';
import comcubesIcon from "@assets/Artboard 17 copy 3_1758850589536.png";
import { Badge } from '@/components/ui/badge';

const adPurchaseSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  contactName: z.string().min(2, 'Contact name must be at least 2 characters'),
  contactEmail: z.string().email('Please enter a valid email address'),
  contactPhone: z.string().min(10, 'Phone number must be at least 10 digits'),
  website: z.string().url('Please enter a valid website URL'),
  adFormat: z.enum(['vertical_160x600', 'horizontal_728x90', 'rectangle_300x250', 'responsive'], {
    required_error: 'Please select an ad format',
  }),
  adPosition: z.enum(['left_sidebar', 'right_sidebar', 'in_content_top', 'in_content_bottom'], {
    required_error: 'Please select an ad position',
  }),
  campaignDuration: z.enum(['1_week', '2_weeks', '1_month', '3_months', '6_months', '12_months'], {
    required_error: 'Please select campaign duration',
  }),
  adClickUrl: z.string().url('Please enter a valid destination URL'),
  paymentMethod: z.enum(['paystack', 'paypal'], {
    required_error: 'Please select a payment method',
  }),
  currency: z.enum(['USD', 'NGN', 'EUR', 'GBP'], {
    required_error: 'Please select a currency',
  }),
  message: z.string().optional(),
});

type AdPurchaseData = z.infer<typeof adPurchaseSchema>;

// Pricing structure (70% of market rate as per MONETIZATION_SETUP_GUIDE.md)
const AD_PRICING = {
  vertical_160x600: 210, // $210/month (70% of $300)
  horizontal_728x90: 210, // $210/month (70% of $300)
  rectangle_300x250: 140, // $140/month (70% of $200)
  responsive: 175, // $175/month (70% of $250)
};

const DURATION_MULTIPLIERS = {
  '1_week': 0.3,
  '2_weeks': 0.5,
  '1_month': 1,
  '3_months': 2.7, // 10% discount
  '6_months': 5.1, // 15% discount
  '12_months': 9.6, // 20% discount
};

const AD_FORMATS = [
  { value: 'vertical_160x600', label: 'Vertical Skyscraper', size: '160×600px', description: 'Perfect for sidebar placements' },
  { value: 'horizontal_728x90', label: 'Horizontal Leaderboard', size: '728×90px', description: 'Great for top/bottom content' },
  { value: 'rectangle_300x250', label: 'Medium Rectangle', size: '300×250px', description: 'Versatile placement option' },
  { value: 'responsive', label: 'Responsive Ad', size: 'Flexible', description: 'Adapts to all screen sizes' },
];

const AD_POSITIONS = [
  { value: 'left_sidebar', label: 'Left Sidebar', description: 'High visibility on desktop' },
  { value: 'right_sidebar', label: 'Right Sidebar', description: 'Premium placement location' },
  { value: 'in_content_top', label: 'In-Content Top', description: 'Above main content' },
  { value: 'in_content_bottom', label: 'In-Content Bottom', description: 'Below main content' },
];

const DURATIONS = [
  { value: '1_week', label: '1 Week', discount: null },
  { value: '2_weeks', label: '2 Weeks', discount: null },
  { value: '1_month', label: '1 Month', discount: null },
  { value: '3_months', label: '3 Months', discount: '10% OFF' },
  { value: '6_months', label: '6 Months', discount: '15% OFF' },
  { value: '12_months', label: '12 Months', discount: '20% OFF' },
];

const CURRENCIES = [
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'NGN', label: 'NGN (₦)', symbol: '₦' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£' },
];

export default function AdvertisePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);

  const form = useForm<AdPurchaseData>({
    resolver: zodResolver(adPurchaseSchema),
    defaultValues: {
      companyName: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      website: '',
      adClickUrl: '',
      message: '',
      currency: 'USD',
      paymentMethod: 'paystack',
    },
  });

  const watchedFormat = form.watch('adFormat');
  const watchedDuration = form.watch('campaignDuration');
  const watchedCurrency = form.watch('currency');

  // Calculate price whenever format or duration changes
  useState(() => {
    if (watchedFormat && watchedDuration) {
      const basePrice = AD_PRICING[watchedFormat as keyof typeof AD_PRICING] || 0;
      const multiplier = DURATION_MULTIPLIERS[watchedDuration as keyof typeof DURATION_MULTIPLIERS] || 1;
      const price = basePrice * multiplier;
      setCalculatedPrice(price);
    }
  });

  const purchaseMutation = useMutation({
    mutationFn: async (data: AdPurchaseData) => {
      const response = await apiRequest('POST', '/api/ad-purchase/request', {
        ...data,
        basePrice: calculatedPrice.toString(),
      });
      return response;
    },
    onSuccess: () => {
      setIsSubmitted(true);
      form.reset();
      toast({
        title: "Request Submitted!",
        description: "We'll review your ad purchase and contact you within 24 hours with next steps.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit ad purchase request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AdPurchaseData) => {
    purchaseMutation.mutate(data);
  };

  const getCurrencySymbol = (currency: string) => {
    return CURRENCIES.find(c => c.value === currency)?.symbol || '$';
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SEOHead 
          title="Request Submitted - Advertise with COMCUBES"
          description="Your advertising request has been submitted successfully. Our team will contact you within 24 hours."
        />
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setLocation('/')}>
                <div className="w-16 h-16 mr-3 flex items-center justify-center">
                  <img src={comcubesIcon} alt="COMCUBES" className="w-16 h-16" />
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setLocation('/')}
                className="flex items-center space-x-2"
                data-testid="button-back-home"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Request Submitted Successfully!</h1>
            <p className="text-lg text-gray-600 mb-8">
              Thank you for your interest in advertising with COMCUBES. Our team will review your request and contact you within 24 hours with payment details and next steps.
            </p>
            <Button onClick={() => setLocation('/')} size="lg" data-testid="button-return-home">
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title="Advertise with COMCUBES - Reach Thousands of Business Professionals"
        description="Advertise on COMCUBES global business directory. Reach thousands of business professionals daily with strategic ad placements. Self-service platform with competitive pricing starting at $140/month."
      />
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setLocation('/')}>
              <div className="w-16 h-16 mr-3 flex items-center justify-center">
                <img src={comcubesIcon} alt="COMCUBES" className="w-16 h-16" />
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setLocation('/')}
              className="flex items-center space-x-2"
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </div>
        </div>
      </header>

      <Breadcrumbs 
        items={[
          { label: 'Home', onClick: () => setLocation('/') },
          { label: 'Advertise With Us' }
        ]} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Advertise With COMCUBES</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Reach thousands of business professionals daily through our global business directory platform.
          </p>
        </div>

        {/* Key Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 text-center">
            <Eye className="h-8 w-8 text-blue-600 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">High Visibility</h3>
            <p className="text-gray-600 text-sm">Your ads appear on every page of our directory, reaching thousands of daily visitors.</p>
          </Card>
          <Card className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">Targeted Audience</h3>
            <p className="text-gray-600 text-sm">Connect with business professionals actively searching for products and services.</p>
          </Card>
          <Card className="p-6 text-center">
            <Star className="h-8 w-8 text-yellow-600 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">Competitive Pricing</h3>
            <p className="text-gray-600 text-sm">70% of market rates with volume discounts up to 20% for annual commitments.</p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Self-Service Ad Purchase</CardTitle>
                <CardDescription>Select your ad specifications and get instant pricing</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Company Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your company name" {...field} data-testid="input-company-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="contactName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your full name" {...field} data-testid="input-contact-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="contactEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input placeholder="your@company.com" type="email" {...field} data-testid="input-email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="contactPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="+1 234 567 8900" {...field} data-testid="input-phone" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="website"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Website</FormLabel>
                              <FormControl>
                                <Input placeholder="https://yourcompany.com" {...field} data-testid="input-website" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="adClickUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ad Destination URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://landing-page.com" {...field} data-testid="input-destination-url" />
                              </FormControl>
                              <FormDescription className="text-xs">Where should the ad link to?</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Ad Specifications */}
                    <div className="space-y-4 border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-900">Ad Specifications</h3>
                      
                      <FormField
                        control={form.control}
                        name="adFormat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ad Format</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-ad-format">
                                  <SelectValue placeholder="Select ad format" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {AD_FORMATS.map((format) => (
                                  <SelectItem key={format.value} value={format.value}>
                                    <div className="flex flex-col">
                                      <span className="font-medium">{format.label}</span>
                                      <span className="text-xs text-gray-500">{format.size} - {format.description}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="adPosition"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ad Position</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-ad-position">
                                  <SelectValue placeholder="Select ad position" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {AD_POSITIONS.map((position) => (
                                  <SelectItem key={position.value} value={position.value}>
                                    <div className="flex flex-col">
                                      <span className="font-medium">{position.label}</span>
                                      <span className="text-xs text-gray-500">{position.description}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="campaignDuration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Campaign Duration</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-duration">
                                  <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {DURATIONS.map((duration) => (
                                  <SelectItem key={duration.value} value={duration.value}>
                                    <div className="flex items-center justify-between w-full">
                                      <span>{duration.label}</span>
                                      {duration.discount && (
                                        <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                                          {duration.discount}
                                        </Badge>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription className="text-xs">
                              Longer campaigns receive volume discounts
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Payment Options */}
                    <div className="space-y-4 border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-900">Payment Options</h3>
                      
                      <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Currency</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-currency">
                                  <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {CURRENCIES.map((currency) => (
                                  <SelectItem key={currency.value} value={currency.value}>
                                    {currency.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Payment Method</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="flex flex-col space-y-2"
                              >
                                <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                                  <RadioGroupItem value="paystack" id="paystack" />
                                  <Label htmlFor="paystack" className="flex-1 cursor-pointer">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <div className="font-medium">Paystack</div>
                                        <div className="text-sm text-gray-500">Recommended for Nigerian customers</div>
                                      </div>
                                      <Badge variant="default" className="bg-blue-600">PRIMARY</Badge>
                                    </div>
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                                  <RadioGroupItem value="paypal" id="paypal" />
                                  <Label htmlFor="paypal" className="flex-1 cursor-pointer">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <div className="font-medium">PayPal</div>
                                        <div className="text-sm text-gray-500">International payments accepted</div>
                                      </div>
                                      <Badge variant="secondary">SECONDARY</Badge>
                                    </div>
                                  </Label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Additional Notes */}
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any specific requirements or questions..."
                              className="min-h-[100px] resize-y"
                              {...field}
                              data-testid="textarea-message"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={purchaseMutation.isPending}
                      data-testid="button-submit-request"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      {purchaseMutation.isPending ? 'Submitting...' : 'Submit Purchase Request'}
                    </Button>
                    
                    <p className="text-xs text-gray-500 text-center">
                      By submitting, you agree to our terms and conditions. We'll review your request and contact you within 24 hours with payment details.
                    </p>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Pricing Summary Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                  Pricing Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {calculatedPrice > 0 ? (
                  <>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Estimated Total</div>
                      <div className="text-3xl font-bold text-green-700">
                        {getCurrencySymbol(watchedCurrency || 'USD')}{calculatedPrice.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Base price in USD
                      </div>
                    </div>
                    
                    {watchedDuration && ['3_months', '6_months', '12_months'].includes(watchedDuration) && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center text-blue-700 text-sm font-medium">
                          <Star className="h-4 w-4 mr-2" />
                          Volume Discount Applied!
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          {watchedDuration === '3_months' && 'Save 10% with quarterly plan'}
                          {watchedDuration === '6_months' && 'Save 15% with semi-annual plan'}
                          {watchedDuration === '12_months' && 'Save 20% with annual plan'}
                        </div>
                      </div>
                    )}

                    <div className="border-t pt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Format:</span>
                        <span className="font-medium">
                          {AD_FORMATS.find(f => f.value === watchedFormat)?.label || '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">
                          {DURATIONS.find(d => d.value === watchedDuration)?.label || '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Currency:</span>
                        <span className="font-medium">{watchedCurrency || 'USD'}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Select ad format and duration to see pricing</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-blue-600" />
                  Why Advertise Here?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">High Traffic Volume</p>
                    <p className="text-sm text-gray-600">10,000+ daily visitors</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">Business Focused</p>
                    <p className="text-sm text-gray-600">Targeted B2B audience</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">Global Reach</p>
                    <p className="text-sm text-gray-600">Worldwide exposure</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">Measurable Results</p>
                    <p className="text-sm text-gray-600">Detailed analytics</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">For immediate assistance:</p>
                <p className="font-medium text-gray-900">admin@comcubes.com</p>
                <p className="text-sm text-gray-500 mt-2">Response time: 24-48 hours</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
