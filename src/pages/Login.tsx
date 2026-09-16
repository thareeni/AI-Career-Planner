import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/auth/AuthContext";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, Sparkles, ArrowRight } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in both email and password.");
      return;
    }

    setLoading(true);
    try {
      await signIn(email.trim(), password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8F7FF]">
      {/* Background Soft Purple Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200/50 rounded-full blur-3xl pointer-events-none" />

      <Card className="w-full max-w-md bg-white border border-purple-100 shadow-xl rounded-2xl relative z-10 p-2 sm:p-4">
        <CardHeader className="space-y-3 text-center pb-2">
          {/* Logo Branding */}
          <div className="flex items-center justify-center gap-2 text-purple-600 font-bold text-xl">
            <Sparkles className="h-6 w-6 text-purple-600" />
            <span className="text-purple-600">AI Career Planner</span>
          </div>

          <CardTitle className="text-2xl sm:text-3xl font-bold text-slate-900 pt-2">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-slate-500 text-sm">
            Sign in to continue your learning journey
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-semibold text-sm">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:ring-purple-500 h-11 text-base rounded-xl"
              />
            </div>

            <div className="space-y-2 relative">
              <Label htmlFor="password" className="text-slate-700 font-semibold text-sm">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:ring-purple-500 h-11 text-base rounded-xl pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1.5 h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6C4CE8] hover:bg-[#5B4BE7] text-white font-semibold py-5 h-12 shadow-lg shadow-purple-200 rounded-xl text-base flex items-center justify-center gap-2 transition-all duration-200"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing In...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <ArrowRight className="h-5 w-5" />
                  Sign In
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600 font-medium">
            Don't have an account?{" "}
            <Link to="/signup" className="text-purple-600 hover:text-purple-700 font-semibold hover:underline">
              Sign Up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;