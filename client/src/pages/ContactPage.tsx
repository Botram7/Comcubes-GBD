import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Mail, Clock, ArrowLeft, MessageSquare, Building, Users, HelpCircle } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { SEOHead, createBreadcrumbStructuredData } from "@/components/SEOHead";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { BannerAd } from '@/components/BannerAd';
import { apiRequest } from '@/lib/queryClient';
import comcubesIcon from "@assets/Artboard 17 copy 3_1758850589536.png";

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
  contactType: z.enum(['General Inquiry', 'Technical Support', 'Partnership', 'Company Listing'], {
    required_error: 'Please select a contact type',
  }),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const contactTypes = [
  { value: 'General Inquiry', label: 'General Inquiry', icon: MessageSquare },
  { value: 'Technical Support', label: 'Technical Support', icon: HelpCircle },
  { value: 'Partnership', label: 'Business Partnership', icon: Building },
  { value: 'Company Listing', label: 'Company Listing', icon: Users },
];

const TURNSTILE_SITE_KEY = import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY || '';

export default function ContactPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileError, setTurnstileError] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
      contactType: undefined,
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormData & { turnstileToken: string }) => {
      return await apiRequest('POST', '/api/contact', data);
    },
    onSuccess: () => {
      setIsSubmitted(true);
      form.reset();
      setTurnstileToken(null);
      toast({
        title: "Message Sent Successfully",
        description: "We'll get back to you within 24-48 hours.",
      });
    },
    onError: (error) => {
      turnstileRef.current?.reset();
      setTurnstileToken(null);
      toast({
        title: "Failed to Send Message",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactFormData) => {
    if (!turnstileToken) {
      setTurnstileError('Please complete the security verification');
      return;
    }
    setTurnstileError(null);
    contactMutation.mutate({ ...data, turnstileToken });
  };

  const handleTurnstileSuccess = (token: string) => {
    setTurnstileToken(token);
    setTurnstileError(null);
  };

  const handleTurnstileError = () => {
    setTurnstileToken(null);
    setTurnstileError('Security verification failed. Please try again.');
  };

  const handleTurnstileExpire = () => {
    setTurnstileToken(null);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 font-inter">
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setLocation('/')}>
                <div className="w-16 h-16 mr-3 flex items-center justify-center">
                  <img src={comcubesIcon} alt="COMCUBES" className="w-16 h-16" />
                </div>
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

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Message Sent Successfully!</h2>
              <p className="text-gray-600 mb-8">
                Thank you for contacting COMCUBES. We've received your message and will respond within 24-48 hours.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => setLocation('/')}>
                  Back to Home
                </Button>
                <Button variant="outline" onClick={() => setIsSubmitted(false)}>
                  Send Another Message
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      <SEOHead 
        title="Contact COMCUBES | Get Support & Business Partnership Inquiries"
        description="Contact COMCUBES for general inquiries, technical support, business partnerships, or company listing assistance. We respond within 24-48 hours."
        keywords={[
          "contact comcubes", "customer support", "business partnership", "technical support",
          "company listing help", "contact form", "business inquiry", "support ticket",
          "help desk", "customer service", "business contact"
        ]}
        canonicalUrl={`${window.location.origin}/contact`}
        structuredData={createBreadcrumbStructuredData([
          { name: "Home", url: `${window.location.origin}/` },
          { name: "Contact Us", url: `${window.location.origin}/contact` }
        ])}
      />
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity flex-1" onClick={() => setLocation('/')}>
              <div className="w-16 h-16 mr-3 flex items-center justify-center">
                <img src={comcubesIcon} alt="COMCUBES" className="w-16 h-16" />
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setLocation('/')}
              className="hidden sm:flex items-center space-x-2"
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
          { label: 'Contact Us', href: '/contact' }
        ]} 
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact COMCUBES</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get in touch with our team for support, partnerships, or general inquiries about the global business directory.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name" data-testid="input-contact-name" {...field} />
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
                              <Input placeholder="your@email.com" type="email" data-testid="input-contact-email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="contactType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-contact-type">
                                <SelectValue placeholder="Select inquiry type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {contactTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  <div className="flex items-center space-x-2">
                                    <type.icon className="h-4 w-4" />
                                    <span>{type.label}</span>
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
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="Brief description of your inquiry" data-testid="input-contact-subject" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Please provide details about your inquiry..."
                              className="min-h-[120px]"
                              data-testid="textarea-contact-message"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {TURNSTILE_SITE_KEY && (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500">Security verification:</p>
                        <div className="flex items-center" data-testid="turnstile-widget">
                          <Turnstile
                            ref={turnstileRef}
                            siteKey={TURNSTILE_SITE_KEY}
                            onSuccess={handleTurnstileSuccess}
                            onError={handleTurnstileError}
                            onExpire={handleTurnstileExpire}
                            options={{
                              theme: 'light',
                              size: 'normal',
                            }}
                          />
                        </div>
                        {turnstileError && (
                          <p className="text-sm text-red-600" data-testid="text-turnstile-error">{turnstileError}</p>
                        )}
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={contactMutation.isPending || (TURNSTILE_SITE_KEY && !turnstileToken)}
                      data-testid="button-contact-submit"
                    >
                      {contactMutation.isPending ? 'Sending...' : 'Send Message'}
                    </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <Mail className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900">Email</h3>
                      <p className="text-gray-600 text-sm whitespace-nowrap overflow-hidden text-ellipsis">contact-cgbd@comcubes.com</p>
                      <p className="text-sm text-gray-500">We respond within 24-48 hours</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <Clock className="h-5 w-5 text-green-600 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900">Response Time</h3>
                      <p className="text-gray-600">24-48 hours</p>
                      <p className="text-sm text-gray-500">Monday to Friday, 9 AM - 6 PM WAT</p>
                    </div>
                  </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How Can We Help?</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="space-y-4">
                    {contactTypes.map((type) => (
                      <div key={type.value} className="flex items-start space-x-3">
                        <type.icon className="h-5 w-5 text-gray-600 mt-0.5" />
                        <div>
                          <h3 className="font-medium text-gray-900">{type.label}</h3>
                          <p className="text-sm text-gray-600">
                            {type.value === 'general' && 'Questions about our services or general inquiries'}
                            {type.value === 'technical' && 'Help with website functionality or technical issues'}
                            {type.value === 'business' && 'Partnership opportunities or business collaborations'}
                            {type.value === 'listing' && 'Questions about getting your company listed'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
