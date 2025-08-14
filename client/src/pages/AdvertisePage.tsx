import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, TrendingUp, Eye, Star, CheckCircle } from 'lucide-react';
import { useLocation } from 'wouter';
import { SEOHead, createBreadcrumbStructuredData } from "@/components/SEOHead";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { apiRequest } from '@/lib/queryClient';
import comcubesIcon from "@assets/Artboard 2 copy_1753136360343.png";

const advertiseFormSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  website: z.string().url('Please enter a valid website URL').optional().or(z.literal('')),
  adType: z.enum(['boost_business', 'premium_placement', 'large_banner'], {
    required_error: 'Please select an advertisement type',
  }),
  budget: z.enum(['under_500', '500_1000', '1000_5000', '5000_plus', 'custom'], {
    required_error: 'Please select a budget range',
  }),
  duration: z.enum(['1_week', '2_weeks', '1_month', '3_months', '6_months', 'custom'], {
    required_error: 'Please select campaign duration',
  }),
  message: z.string().min(20, 'Message must be at least 20 characters'),
});

type AdvertiseFormData = z.infer<typeof advertiseFormSchema>;

const adTypes = [
  { value: 'boost_business', label: 'Boost Your Business', description: 'Small banner ads in left sidebar ($200/month)' },
  { value: 'premium_placement', label: 'Premium Placement', description: 'Enhanced banners in right sidebar ($350/month)' },
  { value: 'large_banner', label: 'Large Banner Space', description: 'Maximum visibility with large ad space ($500/month)' },
];

const budgetRanges = [
  { value: 'under_500', label: 'Under $500' },
  { value: '500_1000', label: '$500 - $1,000' },
  { value: '1000_5000', label: '$1,000 - $5,000' },
  { value: '5000_plus', label: '$5,000+' },
  { value: 'custom', label: 'Custom Budget' },
];

const durations = [
  { value: '1_week', label: '1 Week' },
  { value: '2_weeks', label: '2 Weeks' },
  { value: '1_month', label: '1 Month' },
  { value: '3_months', label: '3 Months' },
  { value: '6_months', label: '6 Months' },
  { value: 'custom', label: 'Custom Duration' },
];

export default function AdvertisePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<AdvertiseFormData>({
    resolver: zodResolver(advertiseFormSchema),
    defaultValues: {
      companyName: '',
      email: '',
      phone: '',
      website: '',
      message: '',
    },
  });

  const advertiseMutation = useMutation({
    mutationFn: async (data: AdvertiseFormData) => {
      const response = await apiRequest('POST', '/api/advertise', data);
      return response;
    },
    onSuccess: () => {
      setIsSubmitted(true);
      form.reset();
      toast({
        title: "Request Submitted!",
        description: "We'll contact you within 24 hours with advertising options and rates.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit advertising request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AdvertiseFormData) => {
    advertiseMutation.mutate(data);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <div className="w-8 h-8 mr-3 flex items-center justify-center">
                  <img src={comcubesIcon} alt="COMCUBES" className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: 'IBM Plex Serif', fontWeight: 500 }}>COMCUBES</h1>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setLocation('/')}
                className="flex items-center space-x-2"
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
              Thank you for your interest in advertising with COMCUBES. Our team will review your request and contact you within 24 hours with detailed advertising packages and competitive rates.
            </p>
            <Button onClick={() => setLocation('/')} size="lg">
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 mr-3 flex items-center justify-center">
                <img src={comcubesIcon} alt="COMCUBES" className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: 'IBM Plex Serif', fontWeight: 500 }}>COMCUBES</h1>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setLocation('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </div>
        </div>
      </header>

      <Breadcrumbs 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Advertise With Us', href: '/advertise' }
        ]} 
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Advertise With COMCUBES</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Reach thousands of business professionals daily through our global business directory platform.
          </p>
        </div>

        {/* Advertisement Types Overview */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
            Advertisement Opportunities
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Small Banner Ads */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-4 rounded-lg mb-4 transform scale-90">
                  <h3 className="font-bold text-sm mb-1">Boost Your Business</h3>
                  <p className="text-xs opacity-90 mb-2">Reach 10,000+ daily visitors</p>
                  <div className="bg-white bg-opacity-20 rounded px-3 py-1 text-xs font-medium">
                    Advertise Here
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2 text-blue-600">Small Banner Ads</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Compact promotional banners in sidebar positions. Perfect for brand awareness and quick messaging.
                </p>
                <div className="space-y-2 text-xs text-gray-500">
                  <div>• Size: 280×120px</div>
                  <div>• Position: Left Sidebar</div>
                  <div>• Visibility: Good</div>
                </div>
                <div className="text-lg font-bold text-blue-600 mt-4">
                  From $200/month
                </div>
              </div>
            </Card>

            {/* Premium Placement */}
            <Card className="p-6 border-2 border-purple-200 hover:shadow-lg transition-shadow relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                  MOST POPULAR
                </span>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white p-4 rounded-lg mb-4 transform scale-90">
                  <h3 className="font-bold text-sm mb-1">Premium Placement</h3>
                  <p className="text-xs opacity-90 mb-2">Maximize your visibility</p>
                  <div className="bg-white bg-opacity-20 rounded px-3 py-1 text-xs font-medium">
                    Learn More
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2 text-purple-600">Premium Banner Ads</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Enhanced sidebar banners with priority positioning and better visibility across all pages.
                </p>
                <div className="space-y-2 text-xs text-gray-500">
                  <div>• Size: 280×120px</div>
                  <div>• Position: Right Sidebar</div>
                  <div>• Visibility: High Priority</div>
                </div>
                <div className="text-lg font-bold text-purple-600 mt-4">
                  From $350/month
                </div>
              </div>
            </Card>

            {/* Large Banner Spaces */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="bg-gray-100 border-2 border-dashed border-gray-300 p-4 rounded-lg mb-4 transform scale-90">
                  <div className="text-gray-500">
                    <div className="text-xs font-medium mb-2">Advertisement Space</div>
                    <div className="text-xs opacity-75 mb-2">Available for Rent</div>
                    <div className="bg-gray-200 rounded px-3 py-1 text-xs font-medium">
                      Contact Us
                    </div>
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-700">Large Banner Spaces</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Prominent advertisement spaces with maximum visibility. Ideal for detailed campaigns and major announcements.
                </p>
                <div className="space-y-2 text-xs text-gray-500">
                  <div>• Size: 280×400px</div>
                  <div>• Position: Below Small Banners</div>
                  <div>• Visibility: Maximum</div>
                </div>
                <div className="text-lg font-bold text-gray-700 mt-4">
                  From $500/month
                </div>
              </div>
            </Card>
          </div>

          {/* Detailed Comparison Table */}
          <Card className="p-8 mb-8">
            <h3 className="text-2xl font-bold mb-6 text-center">Feature Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left p-4 font-semibold text-gray-700">Feature</th>
                    <th className="text-center p-4 font-semibold text-blue-600">Small Banner<br />($200/month)</th>
                    <th className="text-center p-4 font-semibold text-purple-600">Premium Banner<br />($350/month)</th>
                    <th className="text-center p-4 font-semibold text-gray-700">Large Banner<br />($500/month)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="p-4 font-medium">Advertisement Size</td>
                    <td className="text-center p-4">280×120px</td>
                    <td className="text-center p-4">280×120px</td>
                    <td className="text-center p-4">280×400px</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="p-4 font-medium">Page Position</td>
                    <td className="text-center p-4">Left Sidebar</td>
                    <td className="text-center p-4">Right Sidebar</td>
                    <td className="text-center p-4">Below Banner Ads</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="p-4 font-medium">Visibility Level</td>
                    <td className="text-center p-4">Standard</td>
                    <td className="text-center p-4">High Priority</td>
                    <td className="text-center p-4">Maximum</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="p-4 font-medium">Content Format</td>
                    <td className="text-center p-4">Title + Subtitle + CTA Button</td>
                    <td className="text-center p-4">Title + Subtitle + CTA Button</td>
                    <td className="text-center p-4">Custom Graphics & Content</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="p-4 font-medium">Pages Displayed</td>
                    <td className="text-center p-4">All Directory Pages</td>
                    <td className="text-center p-4">All Directory Pages</td>
                    <td className="text-center p-4">All Directory Pages</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="p-4 font-medium">Click Tracking</td>
                    <td className="text-center p-4">✓ Basic Analytics</td>
                    <td className="text-center p-4">✓ Advanced Analytics</td>
                    <td className="text-center p-4">✓ Detailed Analytics</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="p-4 font-medium">Best For</td>
                    <td className="text-center p-4">Brand Awareness</td>
                    <td className="text-center p-4">Lead Generation</td>
                    <td className="text-center p-4">Product Launches</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Setup Time</td>
                    <td className="text-center p-4">24-48 hours</td>
                    <td className="text-center p-4">24-48 hours</td>
                    <td className="text-center p-4">48-72 hours</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

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
              <Star className="h-8 w-8 text-gold-600 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Flexible Options</h3>
              <p className="text-gray-600 text-sm">Choose from multiple ad formats and durations to match your marketing goals and budget.</p>
            </Card>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Advertising Options */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Advertising Solution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {adTypes.map((type) => (
                    <div key={type.value} className="border rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        {type.value === 'boost_business' ? (
                          <TrendingUp className="h-6 w-6 text-blue-600 mt-1" />
                        ) : (
                          <Star className="h-6 w-6 text-gold-600 mt-1" />
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900">{type.label}</h3>
                          <p className="text-gray-600 text-sm">{type.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contact Form */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Get Started Today</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your company name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input placeholder="your@company.com" type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Your phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://yourwebsite.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="adType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Advertisement Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select advertising type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {adTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="budget"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Budget Range</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select budget range" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {budgetRanges.map((budget) => (
                                  <SelectItem key={budget.value} value={budget.value}>
                                    {budget.label}
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
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Campaign Duration</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {durations.map((duration) => (
                                  <SelectItem key={duration.value} value={duration.value}>
                                    {duration.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Details</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us about your advertising goals and requirements..."
                              className="min-h-[120px] resize-y"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={advertiseMutation.isPending}
                    >
                      {advertiseMutation.isPending ? 'Submitting...' : 'Request Quote'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Benefits Sidebar */}
          <div className="space-y-6">
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
                <CardTitle>Contact Information</CardTitle>
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