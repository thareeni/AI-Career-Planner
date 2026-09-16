import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/auth/AuthContext";
import { toast } from "sonner";
import { Loader2, Sparkles, UserPlus } from "lucide-react";
import { OnboardingModal } from "@/components/OnboardingModal";

const Signup = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);
    try {
      await signUp(email.trim(), password, fullName.trim());
      toast.success("Account created successfully!");
      setShowOnboarding(true);
    } catch (error: any) {
      toast.error(error.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingSuccess = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8F7FF]">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200/50 rounded-full blur-3xl pointer-events-none" />

      <Card className="w-full max-w-md bg-white border border-purple-100 shadow-xl rounded-2xl relative z-10 p-2 sm:p-4">
        <CardHeader className="space-y-3 text-center pb-2">
          <div className="flex items-center justify-center gap-2 text-purple-600 font-bold text-xl">
            <Sparkles className="h-6 w-6 text-purple-600" />
            <span className="text-purple-600">AI Career Planner</span>
          </div>

          <CardTitle className="text-2xl sm:text-3xl font-bold text-slate-900 pt-2">
            Create Your Account
          </CardTitle>
          <CardDescription className="text-slate-500 text-sm">
            Start your personalized learning journey
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-slate-700 font-semibold text-sm">
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Thareeni Abey"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:ring-purple-500 h-11 text-base rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
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

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-slate-700 font-semibold text-sm">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:ring-purple-500 h-11 text-base rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-slate-700 font-semibold text-sm">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:ring-purple-500 h-11 text-base rounded-xl"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6C4CE8] hover:bg-[#5B4BE7] text-white font-semibold py-5 h-12 shadow-lg shadow-purple-200 rounded-xl text-base flex items-center justify-center gap-2 transition-all duration-200 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating Account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Create Account
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600 font-medium">
            Already have an account?{" "}
            <Link to="/login" className="text-purple-600 hover:text-purple-700 font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Onboarding Dialog */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => navigate("/dashboard")}
        onSuccess={handleOnboardingSuccess}
      />
    </div>
  );
};

export default Signup;