import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Github } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/api";
import { Separator } from "@/components/ui/separator";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          const userData = await authApi.getCurrentUser();
          if (userData) {
            navigate("/dashboard", { replace: true });
          }
        }
      } catch (error) {
        // Not authenticated - clear tokens and stay on auth page
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    };
    checkUser();
  }, [navigate]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (!validatePassword(password)) {
      toast({
        title: "Invalid password",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.register({
        email,
        password,
        password_confirm: confirmPassword,
      });

      toast({
        title: "Success!",
        description: response.message || "Account created! Check your email to verify your account.",
      });
      
      // Auto login after registration
      const loginResponse = await authApi.login({ email, password });
      if (loginResponse.user) {
        navigate("/dashboard");
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to create account";
      
      // Handle specific error cases
      if (errorMessage.toLowerCase().includes("already exists") || 
          errorMessage.toLowerCase().includes("already registered") ||
          errorMessage.toLowerCase().includes("email") && errorMessage.toLowerCase().includes("exist")) {
        toast({
          title: "Account exists",
          description: "This email is already registered. Please sign in instead.",
          variant: "destructive",
        });
      } else if (errorMessage.toLowerCase().includes("password")) {
        toast({
          title: "Password error",
          description: errorMessage,
          variant: "destructive",
        });
      } else if (errorMessage.toLowerCase().includes("email")) {
        toast({
          title: "Invalid email",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (!validatePassword(password)) {
      toast({
        title: "Invalid password",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.login({ email, password });
      
      if (response.user) {
        toast({
          title: "Success!",
          description: response.message || "Welcome back!",
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to login";
      
      // Handle specific error cases
      if (errorMessage.toLowerCase().includes("invalid") && 
          (errorMessage.toLowerCase().includes("email") || errorMessage.toLowerCase().includes("password"))) {
        toast({
          title: "Invalid credentials",
          description: "Please check your email and password and try again.",
          variant: "destructive",
        });
      } else if (errorMessage.toLowerCase().includes("disabled")) {
        toast({
          title: "Account disabled",
          description: "Your account has been disabled. Please contact support.",
          variant: "destructive",
        });
      } else if (errorMessage.toLowerCase().includes("email")) {
        toast({
          title: "Email error",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-hero opacity-10 blur-3xl"></div>
      
      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">PortfolioAI</span>
          </div>
          <p className="text-muted-foreground">Build your dream portfolio with AI</p>
        </div>

        <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50 shadow-card">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
                
                <div className="relative my-6">
                  <Separator />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="px-2 bg-card text-xs text-muted-foreground">OR</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={async () => {
                      try {
                        const redirectUri = `${window.location.origin}/auth/callback`;
                        const authUrl = await authApi.getOAuthUrl('google', redirectUri);
                        window.location.href = authUrl;
                      } catch (error: any) {
                        toast({
                          title: "Error",
                          description: error.message || "Failed to initiate Google login",
                          variant: "destructive",
                        });
                      }
                    }}
                    disabled={loading}
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={async () => {
                      try {
                        const redirectUri = `${window.location.origin}/auth/callback`;
                        const authUrl = await authApi.getOAuthUrl('github', redirectUri);
                        window.location.href = authUrl;
                      } catch (error: any) {
                        toast({
                          title: "Error",
                          description: error.message || "Failed to initiate GitHub login",
                          variant: "destructive",
                        });
                      }
                    }}
                    disabled={loading}
                  >
                    <Github className="w-4 h-4 mr-2" />
                    Continue with GitHub
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
                
                <div className="relative my-6">
                  <Separator />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="px-2 bg-card text-xs text-muted-foreground">OR</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={async () => {
                      try {
                        const redirectUri = `${window.location.origin}/auth/callback`;
                        const authUrl = await authApi.getOAuthUrl('google', redirectUri);
                        window.location.href = authUrl;
                      } catch (error: any) {
                        toast({
                          title: "Error",
                          description: error.message || "Failed to initiate Google signup",
                          variant: "destructive",
                        });
                      }
                    }}
                    disabled={loading}
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={async () => {
                      try {
                        const redirectUri = `${window.location.origin}/auth/callback`;
                        const authUrl = await authApi.getOAuthUrl('github', redirectUri);
                        window.location.href = authUrl;
                      } catch (error: any) {
                        toast({
                          title: "Error",
                          description: error.message || "Failed to initiate GitHub signup",
                          variant: "destructive",
                        });
                      }
                    }}
                    disabled={loading}
                  >
                    <Github className="w-4 h-4 mr-2" />
                    Continue with GitHub
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="text-center mt-6">
          <Button variant="ghost" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
