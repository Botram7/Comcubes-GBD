import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { SEOHead } from '@/components/SEOHead';
import { Eye, EyeOff, UserPlus, Building2, Check } from 'lucide-react';

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const result = await register(formData);
      
      if (result.success) {
        setLocation('/dashboard'); // Redirect to dashboard
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const passwordStrength = {
    length: formData.password.length >= 6,
    hasUpper: /[A-Z]/.test(formData.password),
    hasLower: /[a-z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
  };

  const isPasswordValid = Object.values(passwordStrength).every(Boolean);

  return (
    <>
      <SEOHead
        title="Create Account - Join COMCUBES Business Directory"
        description="Create your free COMCUBES account to save favorites, track searches, and get personalized business directory experience."
        canonical="/register"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/">
              <div className="inline-flex items-center gap-2 mb-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                <Building2 className="h-8 w-8" />
                <h1 className="text-2xl font-bold font-serif">COMCUBES</h1>
              </div>
            </Link>
            <p className="text-gray-600 dark:text-gray-400">
              Everything and Anything Business
            </p>
          </div>

          <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
                <UserPlus className="h-5 w-5" />
                Create Account
              </CardTitle>
              <CardDescription className="text-center">
                Join COMCUBES to unlock personalized features
              </CardDescription>
            </CardHeader>

            <CardContent>
              {error && (
                <Alert className="mb-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50">
                  <AlertDescription className="text-red-800 dark:text-red-400">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="bg-white dark:bg-gray-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="bg-white dark:bg-gray-700"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="bg-white dark:bg-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="bg-white dark:bg-gray-700 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  {formData.password && (
                    <div className="text-xs space-y-1 mt-2">
                      <div className={`flex items-center gap-1 ${passwordStrength.length ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        <Check className={`h-3 w-3 ${passwordStrength.length ? 'opacity-100' : 'opacity-30'}`} />
                        At least 6 characters
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.hasUpper ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        <Check className={`h-3 w-3 ${passwordStrength.hasUpper ? 'opacity-100' : 'opacity-30'}`} />
                        One uppercase letter
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.hasLower ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        <Check className={`h-3 w-3 ${passwordStrength.hasLower ? 'opacity-100' : 'opacity-30'}`} />
                        One lowercase letter
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.hasNumber ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        <Check className={`h-3 w-3 ${passwordStrength.hasNumber ? 'opacity-100' : 'opacity-30'}`} />
                        One number
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className="bg-white dark:bg-gray-700 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isLoading || !isPasswordValid}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link href="/login">
                  <span className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
                    Sign in here
                  </span>
                </Link>
              </div>
              
              <div className="text-center">
                <Link href="/">
                  <span className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                    ← Back to Business Directory
                  </span>
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}