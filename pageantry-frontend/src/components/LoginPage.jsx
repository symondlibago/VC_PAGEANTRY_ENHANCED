import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Crown, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { useAuth } from '../hooks/useAuth';
import '../App.css';
import vcLogo from '../assets/vclogo.jpg';
import panagbangiLogo from '../assets/panagbangi_logo.jpg';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, isAuthenticated, user } = useAuth();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if already authenticated - moved after hook calls
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || (user?.role === 'admin' ? '/admin' : '/judge');
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');

    const result = await login(data);

    if (result.success) {
      // Redirect will happen automatically due to auth state change
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-rose-900 mobile-container relative overflow-hidden">
      {/* Heavy Background Sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={`bg-sparkle-${i}`}
            className="absolute golden-sparkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Falling Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={`falling-star-${i}`}
            className="absolute golden-falling-star"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${4 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Scattered Popping Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <div
            key={`pop-star-${i}`}
            className="absolute golden-pop-star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-md animate-fade-in-scale relative z-10">
        {/* Form Area Sparkles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={`form-sparkle-${i}`}
              className="absolute golden-form-sparkle"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${1.5 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        <Card className="glass-morphism-card relative overflow-hidden">
          {/* Card Internal Sparkles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={`card-sparkle-${i}`}
                className="absolute golden-card-sparkle"
                style={{
                  left: `${5 + Math.random() * 90}%`,
                  top: `${5 + Math.random() * 90}%`,
                  animationDelay: `${Math.random() * 4}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>

          <CardHeader className="text-center space-y-4 relative z-10">
          <div className="mx-auto flex items-center justify-center relative animate-pulse-blue space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center bg-white p-1 ml-6">
              <img src={vcLogo} alt="VC Logo" className="w-full h-full object-contain" />
            </div>

            <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center bg-white p-1">
              <img src={panagbangiLogo} alt="Panagbangi Logo" className="w-full h-full object-contain" />
            </div>

            {[...Array(6)].map((_, i) => (
              <div
                key={`logo-sparkle-${i}`}
                className="absolute golden-crown-sparkle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>

            <div>
            <CardTitle className="text-2xl font-bold text-foreground relative">
            Mr. and Ms. Panagbangi 2025
            
                <div className="absolute -top-2 -right-2 golden-title-sparkle" />
                <div className="absolute -bottom-1 -left-1 golden-title-sparkle" style={{animationDelay: '0.5s'}} />
              </CardTitle>
              <CardTitle className="text-medium font-bold text-foreground relative">
              Vineyard International Polytechnic College
                {/* Title Sparkles */}
                <div className="absolute -top-2 -right-2 golden-title-sparkle" />
                <div className="absolute -bottom-1 -left-1 golden-title-sparkle" style={{animationDelay: '0.5s'}} />
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
              Pageantry System
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 relative z-10">
            {error && (
              <Alert variant="destructive" className="animate-slide-in-up">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2 relative">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="touch-target"
                    {...register('email')}
                  />
                  {/* Input Field Sparkles */}
                  <div className="absolute -top-1 -right-1 golden-input-sparkle" />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="touch-target pr-10"
                    {...register('password')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                  {/* Input Field Sparkles */}
                  <div className="absolute -top-1 -left-1 golden-input-sparkle" style={{animationDelay: '0.3s'}} />
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="relative">
                <Button
                  type="submit"
                  className="w-full touch-target font-semibold relative overflow-hidden"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                  {/* Button Sparkles */}
                  <div className="absolute top-1/2 left-1/4 golden-button-sparkle" />
                  <div className="absolute top-1/4 right-1/4 golden-button-sparkle" style={{animationDelay: '0.7s'}} />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default LoginPage;